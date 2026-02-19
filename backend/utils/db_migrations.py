import logging
from sqlalchemy import text


_MIGRATIONS = [
    {
        "id": "2024_11_02_add_password_hash_to_users",
        "sql": "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)",
    },
    {
        "id": "2024_11_03_add_gender_to_babies",
        "sql": "ALTER TABLE babies ADD COLUMN IF NOT EXISTS gender VARCHAR(4)",
    },
    {
        "id": "2026_02_10_add_name_to_users",
        "sql": "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(50)",
    },
    {
        "id": "2026_02_11_add_source_url_to_articles",
        "sql": "ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_url VARCHAR(1000)",
    },
    {
        "id": "2026_02_11_cleanup_seed_articles",
        "sql": (
            "DELETE FROM articles WHERE cover_url IN ("
            "'https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=800&q=80',"
            "'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',"
            "'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=800&q=80'"
            ") AND ("
            "title LIKE '%Fenton%' OR "
            "title LIKE '%WHO%' OR "
            "title LIKE '%喂养%' OR "
            "title LIKE '%复诊%' OR "
            "title LIKE '%鍠傚吇%' OR "
            "title LIKE '%澶嶈瘖%' OR "
            "author IN ('张医生', '李医生', '护理团队', '寮犲尰鐢?', '鏉庡尰鐢?', '鎶ょ悊鍥㈤槦')"
            ")"
        ),
    },
    {
        "id": "2026_02_11_add_wechat_article_id_to_articles",
        "sql": "ALTER TABLE articles ADD COLUMN IF NOT EXISTS wechat_article_id VARCHAR(128)",
    },
    {
        "id": "2026_02_11_add_index_for_wechat_article_id",
        "sql": "CREATE INDEX IF NOT EXISTS idx_articles_wechat_article_id ON articles(wechat_article_id)",
    },
    {
        "id": "2026_02_15_add_notification_subscriptions",
        "sql": (
            "CREATE TABLE IF NOT EXISTS notification_subscriptions ("
            "id SERIAL PRIMARY KEY,"
            "user_id INTEGER NOT NULL,"
            "appointment_id INTEGER,"
            "channel VARCHAR(32) NOT NULL DEFAULT 'push',"
            "token VARCHAR(512),"
            "remind_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,"
            "status VARCHAR(20) NOT NULL DEFAULT 'pending',"
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
            "sent_at TIMESTAMP,"
            "FOREIGN KEY (user_id) REFERENCES users(id),"
            "FOREIGN KEY (appointment_id) REFERENCES appointments(id)"
            ")"
        ),
    },
    {
        "id": "2026_02_15_add_device_tokens",
        "sql": (
            "CREATE TABLE IF NOT EXISTS device_tokens ("
            "id SERIAL PRIMARY KEY,"
            "user_id INTEGER NOT NULL,"
            "token VARCHAR(512) NOT NULL UNIQUE,"
            "platform VARCHAR(32),"
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
            "last_seen_at TIMESTAMP,"
            "FOREIGN KEY (user_id) REFERENCES users(id)"
            ")"
        ),
    },
    {
        "id": "2026_02_12_drop_videos_table",
        "sql": "DROP TABLE IF EXISTS videos",
    },

]


def run_migrations(db):
    """运行轻量级数据库迁移，避免手动执行。"""
    try:
        db.session.execute(text(
            "CREATE TABLE IF NOT EXISTS schema_migrations ("
            "id VARCHAR(200) PRIMARY KEY,"
            "applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            ")"
        ))
        applied_rows = db.session.execute(text("SELECT id FROM schema_migrations")).fetchall()
        applied = {row[0] for row in applied_rows}

        for migration in _MIGRATIONS:
            if migration["id"] in applied:
                continue
            db.session.execute(text(migration["sql"]))
            db.session.execute(
                text("INSERT INTO schema_migrations (id) VALUES (:id)"),
                {"id": migration["id"]},
            )
            # 立即将已应用的 migration id 加入集合，避免本次循环中重复处理相同 id
            applied.add(migration["id"])

        db.session.commit()
    except Exception as exc:  # pragma: no cover - 启动时兜底
        db.session.rollback()
        logging.exception("数据库迁移执行失败: %s", exc)
        raise
