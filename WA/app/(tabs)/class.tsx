import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button, Card, Input, ListItem, Tag } from '@/components/ui';
import { theme } from '@/constants/theme';
import { STORAGE_KEYS } from '@/services/api/client';
import * as contentApi from '@/services/api/content';
import type { ContentArticle, ContentPagination, ContentVideo } from '@/types/content';

const CATEGORY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '喂养', value: '喂养' },
  { label: '发育', value: '发育' },
  { label: '复诊', value: '复诊' },
];

const VIDEO_PAGE_SIZE = 6;
const ARTICLE_PAGE_SIZE = 8;
const CACHE_TTL_MS = 60 * 60 * 1000;

type ContentCache = {
  key: string;
  cachedAt: number;
  videos: ContentVideo[];
  videoPagination: ContentPagination | null;
  articles: ContentArticle[];
  articlePagination: ContentPagination | null;
};

const buildCacheKey = (search: string, category: string) => `${search.trim()}|${category.trim()}`;

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

const buildArticleMeta = (article: ContentArticle) => {
  const date = formatDate(article.publishDate);
  const author = article.author?.trim() || '匿名作者';
  return date ? `${author} · ${date}` : author;
};

export default function ClassScreen() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [videoPagination, setVideoPagination] = useState<ContentPagination | null>(null);
  const [articlePagination, setArticlePagination] = useState<ContentPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(
    () => buildCacheKey(searchQuery, activeCategory),
    [searchQuery, activeCategory]
  );

  const loadCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONTENT_CACHE);
      if (!raw) return false;
      const cache: ContentCache = JSON.parse(raw);
      if (cache.key !== cacheKey) return false;
      if (Date.now() - cache.cachedAt > CACHE_TTL_MS) return false;
      setVideos(cache.videos);
      setArticles(cache.articles);
      setVideoPagination(cache.videoPagination);
      setArticlePagination(cache.articlePagination);
      return true;
    } catch (cacheError) {
      console.warn('Failed to load content cache:', cacheError);
      return false;
    }
  }, [cacheKey]);

  const saveCache = useCallback(
    async (payload: ContentCache) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.CONTENT_CACHE, JSON.stringify(payload));
      } catch (cacheError) {
        console.warn('Failed to save content cache:', cacheError);
      }
    },
    []
  );

  const fetchContent = useCallback(
    async (options?: { force?: boolean; showLoading?: boolean }) => {
      const { force = false, showLoading = true } = options || {};
      if (!force) {
        const cached = await loadCache();
        if (cached) return;
      }

      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        const [videoRes, articleRes] = await Promise.all([
          contentApi.listVideos({
            page: 1,
            per_page: VIDEO_PAGE_SIZE,
            search: searchQuery || undefined,
            category: activeCategory || undefined,
          }),
          contentApi.listArticles({
            page: 1,
            per_page: ARTICLE_PAGE_SIZE,
            search: searchQuery || undefined,
            category: activeCategory || undefined,
          }),
        ]);

        setVideos(videoRes.data);
        setVideoPagination(videoRes.pagination);
        setArticles(articleRes.data);
        setArticlePagination(articleRes.pagination);

        await saveCache({
          key: cacheKey,
          cachedAt: Date.now(),
          videos: videoRes.data,
          videoPagination: videoRes.pagination,
          articles: articleRes.data,
          articlePagination: articleRes.pagination,
        });
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : '获取内容失败';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [activeCategory, cacheKey, loadCache, saveCache, searchQuery]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContent({ force: true, showLoading: false });
    setRefreshing(false);
  }, [fetchContent]);

  const handleSearchSubmit = () => {
    setSearchQuery(searchText.trim());
  };

  const handleLoadMore = useCallback(async () => {
    if (!articlePagination?.hasNext || loadingMore) return;
    const nextPage = (articlePagination?.page || 1) + 1;
    setLoadingMore(true);
    try {
      const articleRes = await contentApi.listArticles({
        page: nextPage,
        per_page: ARTICLE_PAGE_SIZE,
        search: searchQuery || undefined,
        category: activeCategory || undefined,
      });
      const merged = [...articles, ...articleRes.data];
      setArticles(merged);
      setArticlePagination(articleRes.pagination);
      await saveCache({
        key: cacheKey,
        cachedAt: Date.now(),
        videos,
        videoPagination,
        articles: merged,
        articlePagination: articleRes.pagination,
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : '加载更多失败';
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  }, [
    activeCategory,
    articlePagination,
    articles,
    cacheKey,
    loadingMore,
    saveCache,
    searchQuery,
    videoPagination,
    videos,
  ]);

  useEffect(() => {
    fetchContent({ force: false });
  }, [activeCategory, fetchContent, searchQuery]);

  const videoEmpty = !loading && videos.length === 0;
  const articleEmpty = !loading && articles.length === 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.statusSpacer} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>在线课堂</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <IconSymbol name="arrow.clockwise" size={16} color={theme.colors.textMain} />
            <Text style={styles.refreshText}>刷新</Text>
          </TouchableOpacity>
        </View>

        <Input
          placeholder="搜索育儿视频、文章"
          containerStyle={styles.searchContainer}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          leftIcon={<IconSymbol name="magnifyingglass" size={18} color={theme.colors.textSub} />}
        />

        <View style={styles.categoryRow}>
          {CATEGORY_OPTIONS.map((item) => {
            const active = item.value === activeCategory;
            return (
              <TouchableOpacity
                key={item.value || 'all'}
                onPress={() => setActiveCategory(item.value)}
                style={styles.categoryButton}
              >
                <Tag
                  label={item.label}
                  variant={active ? 'primary' : 'default'}
                  size="medium"
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchContent({ force: true })}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>推荐视频</Text>
          {videoPagination?.total ? (
            <Text style={styles.sectionMeta}>共 {videoPagination.total} 条</Text>
          ) : null}
        </View>
        {loading && videos.length === 0 ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>加载视频中...</Text>
          </View>
        ) : videoEmpty ? (
          <Card style={styles.emptyCard} padding="md">
            <Text style={styles.emptyText}>暂无视频内容</Text>
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoRow}
          >
            {videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/class-video/${video.id}`)}
              >
                <ImageBackground
                  source={video.coverUrl ? { uri: video.coverUrl } : undefined}
                  style={styles.videoCard}
                  imageStyle={styles.videoImage}
                >
                  {!video.coverUrl && <View style={styles.videoPlaceholder} />}
                  <View style={styles.videoOverlay} />
                  <View style={styles.playIcon}>
                    <IconSymbol name="play.circle.fill" size={36} color={theme.colors.surface} />
                  </View>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <View style={styles.videoMeta}>
                    <Text style={styles.videoMetaText}>
                      {video.views || 0} 次播放
                    </Text>
                    {video.publishDate && (
                      <Text style={styles.videoMetaText}>{formatDate(video.publishDate)}</Text>
                    )}
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>精选文章</Text>
          {articlePagination?.total ? (
            <Text style={styles.sectionMeta}>共 {articlePagination.total} 条</Text>
          ) : null}
        </View>
        {loading && articles.length === 0 ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>加载文章中...</Text>
          </View>
        ) : articleEmpty ? (
          <Card style={styles.emptyCard} padding="md">
            <Text style={styles.emptyText}>暂无文章内容</Text>
          </Card>
        ) : (
          <View style={styles.articleList}>
            {articles.map((article) => (
              <Card key={article.id} style={styles.articleCard} padding="md">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push(`/class-article/${article.id}`)}
                >
                  <ListItem
                    title={article.title}
                    subtitle={buildArticleMeta(article)}
                    leftContent={<View style={styles.articleThumb} />}
                    style={styles.articleItem}
                  />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {articlePagination?.hasNext && (
          <View style={styles.loadMore}>
            <Button
              title={loadingMore ? '加载中...' : '加载更多'}
              onPress={handleLoadMore}
              variant="secondary"
              disabled={loadingMore}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bgBody,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.layout.pagePadding,
    paddingBottom: theme.layout.safeBottom,
  },
  statusSpacer: {
    height: theme.layout.safeTop,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  refreshText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  searchContainer: {
    marginTop: theme.spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  categoryButton: {
    marginRight: 4,
  },
  sectionHeader: {
    marginTop: theme.layout.sectionGap,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  sectionMeta: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  loadingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#FDECEA',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    marginTop: theme.spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: '#D64545',
  },
  errorRetry: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '700',
    paddingLeft: theme.spacing.sm,
  },
  videoRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  videoCard: {
    width: 260,
    height: 160,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
  },
  videoImage: {
    borderRadius: theme.borderRadius.medium,
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primaryLight,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  videoTitle: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
    gap: 8,
  },
  videoMetaText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.xs,
    opacity: 0.9,
  },
  articleList: {
    gap: theme.spacing.sm,
  },
  articleCard: {
    padding: 0,
  },
  articleItem: {
    backgroundColor: theme.colors.surface,
    shadowColor: '#000000',
  },
  articleThumb: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.primaryLight,
  },
  emptyCard: {
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
    textAlign: 'center',
  },
  loadMore: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
});
