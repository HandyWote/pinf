import json
import time
import logging
from datetime import datetime

from models import db
from models.content import Article
from models.sync_state import SyncState
from utils.wechat_official import WechatOfficialError, get_article_by_id, get_publication_records

WECHAT_SYNC_CURSOR_KEY = "wechat_sync.last_update_ts"
logger = logging.getLogger(__name__)


def _read_state_int(key, default=0):
    state = SyncState.query.filter_by(key=key).first()
    if not state:
        return default
    try:
        return int(state.value)
    except (TypeError, ValueError):
        return default


def _write_state_int(key, value):
    state = SyncState.query.filter_by(key=key).first()
    string_value = str(int(value))
    if state:
        state.value = string_value
    else:
        db.session.add(SyncState(key=key, value=string_value))


def _call_with_retry(func, *args, retry=3, **kwargs):
    retry = max(int(retry), 1)
    last_error = None
    for attempt in range(retry):
        try:
            return func(*args, **kwargs)
        except WechatOfficialError as exc:
            last_error = exc
            logger.warning(
                "微信接口调用失败（第 %s/%s 次）: %s",
                attempt + 1,
                retry,
                exc,
            )
            if attempt == retry - 1:
                break
            time.sleep(min(2 ** attempt, 4))
    raise last_error


def _parse_publish_date(news_item):
    timestamp = news_item.get("update_time") or news_item.get("create_time") or 0
    try:
        parsed = datetime.fromtimestamp(int(timestamp))
    except (TypeError, ValueError, OSError):
        return None
    return parsed.date()


def _pick_source_url(news_item):
    for key in ("content_url", "url"):
        value = (news_item.get(key) or "").strip()
        if value:
            return value
    return ""


def _pick_cover_url(news_item):
    for key in ("thumb_url", "cover", "cover_url"):
        value = (news_item.get(key) or "").strip()
        if value:
            return value
    return ""


def _pick_content(news_item):
    content = (news_item.get("digest") or "").strip()
    if content:
        return content
    title = (news_item.get("title") or "").strip()
    if title:
        return f"{title}（公众号文章摘要待补充）"
    return "公众号文章"


def _extract_news_items(batch_payload):
    items = batch_payload.get("item") or []
    all_news = []
    for row in items:
        content = row.get("content") or {}
        news_items = content.get("news_item") or []
        article_id = (row.get("article_id") or "").strip()
        row_update_time = row.get("update_time")
        row_create_time = row.get("create_time")
        if news_items:
            for news in news_items:
                normalized = dict(news)
                if article_id and not normalized.get("article_id"):
                    normalized["article_id"] = article_id
                if row_update_time and not normalized.get("update_time"):
                    normalized["update_time"] = row_update_time
                if row_create_time and not normalized.get("create_time"):
                    normalized["create_time"] = row_create_time
                all_news.append(normalized)
            continue
        if article_id:
            detail_payload = _call_with_retry(get_article_by_id, article_id)
            detail_items = detail_payload.get("news_item")
            if isinstance(detail_items, dict):
                detail_items = detail_items.get("news_item")
            if not detail_items:
                article_payload = detail_payload.get("article")
                if isinstance(article_payload, dict):
                    detail_items = article_payload.get("news_item")
                elif isinstance(article_payload, list):
                    detail_items = article_payload
            if not isinstance(detail_items, list):
                detail_items = []
            for news in detail_items:
                normalized = dict(news)
                normalized["article_id"] = article_id
                if row_update_time and not normalized.get("update_time"):
                    normalized["update_time"] = row_update_time
                if row_create_time and not normalized.get("create_time"):
                    normalized["create_time"] = row_create_time
                all_news.append(normalized)
    return all_news


def _upsert_article_from_news(news_item):
    title = (news_item.get("title") or "").strip()
    source_url = _pick_source_url(news_item)
    if not title or not source_url:
        return "skipped", None

    publish_date = _parse_publish_date(news_item)
    update_time = int(news_item.get("update_time") or news_item.get("create_time") or 0)
    author = (news_item.get("author") or "").strip() or "公众号"
    digest = _pick_content(news_item)
    cover_url = _pick_cover_url(news_item)
    wechat_article_id = (news_item.get("article_id") or "").strip() or None

    article = None
    if wechat_article_id:
        article = Article.query.filter_by(wechat_article_id=wechat_article_id).first()
    if not article:
        article = Article.query.filter_by(source_url=source_url).first()
    if article:
        article.title = title
        article.content = digest
        article.cover_url = cover_url or article.cover_url
        article.author = author
        article.wechat_article_id = wechat_article_id or article.wechat_article_id
        article.category = article.category or "公众号"
        article.publish_date = publish_date or article.publish_date
        if not article.tags:
            article.tags = json.dumps(["公众号"], ensure_ascii=False)
        return "updated", article, update_time

    article = Article(
        title=title,
        content=digest,
        wechat_article_id=wechat_article_id,
        source_url=source_url,
        cover_url=cover_url or None,
        author=author,
        category="公众号",
        publish_date=publish_date,
        tags=json.dumps(["公众号"], ensure_ascii=False),
    )
    db.session.add(article)
    return "created", article, update_time


def sync_wechat_articles(max_pages=10, count=20, retry=3, force_full=False):
    max_pages = max(1, int(max_pages))
    count = min(max(1, int(count)), 20)
    retry = max(1, int(retry))

    created = 0
    updated = 0
    skipped = 0
    pages = 0
    total_remote = 0
    offset = 0
    cursor_before = 0 if force_full else _read_state_int(WECHAT_SYNC_CURSOR_KEY, default=0)
    cursor_after = cursor_before
    logger.info(
        "开始同步公众号文章: force_full=%s, max_pages=%s, count=%s, retry=%s, cursor_before=%s",
        bool(force_full),
        max_pages,
        count,
        retry,
        cursor_before,
    )

    try:
        while pages < max_pages:
            payload = _call_with_retry(
                get_publication_records,
                offset=offset,
                count=count,
                no_content=0,
                retry=retry,
            )
            pages += 1
            total_remote = max(total_remote, int(payload.get("total_count") or 0))
            logger.info(
                "同步分页进度: page=%s, offset=%s, item_count=%s, remote_total=%s",
                pages,
                offset,
                int(payload.get("item_count") or 0),
                total_remote,
            )

            news_items = _extract_news_items(payload)
            if not news_items:
                logger.info("当前分页无可处理文章，提前结束同步")
                break

            newer_count = 0
            for news_item in news_items:
                result, _, update_time = _upsert_article_from_news(news_item)
                if update_time > cursor_before:
                    newer_count += 1
                if update_time > cursor_after:
                    cursor_after = update_time
                if result == "created":
                    created += 1
                elif result == "updated":
                    updated += 1
                else:
                    skipped += 1

            db.session.commit()
            logger.info(
                "分页处理完成: page=%s, created=%s, updated=%s, skipped=%s, newer_count=%s",
                pages,
                created,
                updated,
                skipped,
                newer_count,
            )

            item_count = int(payload.get("item_count") or 0)
            offset += item_count
            if not force_full and cursor_before > 0 and newer_count == 0:
                logger.info("检测到无新增文章，结束增量同步")
                break
            if item_count < count or offset >= total_remote:
                logger.info("到达分页边界，结束本轮同步")
                break

        if cursor_after > cursor_before:
            _write_state_int(WECHAT_SYNC_CURSOR_KEY, cursor_after)
            db.session.commit()
            logger.info("同步游标更新成功: %s -> %s", cursor_before, cursor_after)
    except WechatOfficialError:
        db.session.rollback()
        logger.exception("公众号同步失败（微信接口错误）")
        raise
    except Exception:
        db.session.rollback()
        logger.exception("公众号同步失败（系统错误）")
        raise

    result = {
        "created": created,
        "updated": updated,
        "skipped": skipped,
        "pages": pages,
        "countPerPage": count,
        "remoteTotal": total_remote,
        "processedOffset": offset,
        "cursorBefore": cursor_before,
        "cursorAfter": cursor_after,
        "forceFull": bool(force_full),
    }
    logger.info("公众号同步完成: %s", result)
    return result
