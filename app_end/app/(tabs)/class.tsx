import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { Input, OrganicBackground, OrganicButton, OrganicCard, OrganicChipButton } from '@/components/ui';
import { organicTheme } from '@/constants/theme';
import { STORAGE_KEYS } from '@/services/api/client';
import * as contentApi from '@/services/api/content';
import type { ContentArticle, ContentPagination, ContentVideo } from '@/types/content';
import { buildWebviewRoute } from '@/utils/open-external-url';

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

  const saveCache = useCallback(async (payload: ContentCache) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONTENT_CACHE, JSON.stringify(payload));
    } catch (cacheError) {
      console.warn('Failed to save content cache:', cacheError);
    }
  }, []);

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

  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchText.trim());
  }, [searchText]);

  const handleOpenSourceUrl = useCallback((url?: string | null, title?: string) => {
    if (!url?.trim()) return false;
    try {
      router.push(buildWebviewRoute(url, title));
      return true;
    } catch (openError) {
      const message = openError instanceof Error ? openError.message : '链接无效';
      setError(message);
      return false;
    }
  }, []);

  const handleVideoPress = useCallback(
    (video: ContentVideo) => {
      const opened = handleOpenSourceUrl(video.sourceUrl, video.title);
      if (!opened) {
        router.push(`/class-video/${video.id}`);
      }
    },
    [handleOpenSourceUrl]
  );

  const handleArticlePress = useCallback(
    (article: ContentArticle) => {
      const opened = handleOpenSourceUrl(article.sourceUrl, article.title);
      if (!opened) {
        router.push(`/class-article/${article.id}`);
      }
    },
    [handleOpenSourceUrl]
  );

  const handleLoadMore = useCallback(async () => {
    if (!articlePagination?.hasNext || loadingMore) return;
    const nextPage = (articlePagination.page || 1) + 1;
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
  }, [fetchContent]);

  const videoEmpty = !loading && videos.length === 0;
  const articleEmpty = !loading && articles.length === 0;

  return (
    <OrganicBackground variant="morning">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={organicTheme.colors.primary.main}
            colors={[organicTheme.colors.primary.main]}
          />
        }
      >
        <View style={styles.statusSpacer} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>在线课堂</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <IconSymbol
              name="arrow.clockwise"
              size={organicTheme.iconSizes.xs}
              color={organicTheme.colors.text.secondary}
            />
            <Text style={styles.refreshText}>刷新</Text>
          </TouchableOpacity>
        </View>

        <Input
          placeholder="搜索视频或文章"
          containerStyle={styles.searchContainer}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          leftIcon={(
            <IconSymbol
              name="magnifyingglass"
              size={organicTheme.iconSizes.xs}
              color={organicTheme.colors.text.secondary}
            />
          )}
        />

        <View style={styles.categoryRow}>
          {CATEGORY_OPTIONS.map((item) => (
            <OrganicChipButton
              key={item.value || 'all'}
              label={item.label}
              active={item.value === activeCategory}
              onPress={() => setActiveCategory(item.value)}
            />
          ))}
        </View>

        {error && (
          <OrganicCard variant="soft" shadow={false} style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchContent({ force: true })}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </OrganicCard>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>推荐视频</Text>
          {videoPagination?.total ? <Text style={styles.sectionMeta}>共 {videoPagination.total} 条</Text> : null}
        </View>
        {loading && videos.length === 0 ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />
            <Text style={styles.loadingText}>加载视频中...</Text>
          </View>
        ) : videoEmpty ? (
          <OrganicCard variant="ghost" shadow={false} style={styles.emptyCard}>
            <Text style={styles.emptyText}>暂无视频内容</Text>
          </OrganicCard>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videoRow}>
            {videos.map((video) => (
              <TouchableOpacity key={video.id} activeOpacity={0.8} onPress={() => handleVideoPress(video)}>
                <ImageBackground
                  source={video.coverUrl ? { uri: video.coverUrl } : undefined}
                  style={styles.videoCard}
                  imageStyle={styles.videoImage}
                >
                  {!video.coverUrl && <View style={styles.videoPlaceholder} />}
                  <View style={styles.videoOverlay} />
                  <View style={styles.playIcon}>
                    <IconSymbol name="play.circle.fill" size={organicTheme.iconSizes.xl} color="#FFFFFF" />
                  </View>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <View style={styles.videoMeta}>
                    <Text style={styles.videoMetaText}>{video.views || 0} 次播放</Text>
                    {video.publishDate && <Text style={styles.videoMetaText}>{formatDate(video.publishDate)}</Text>}
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
            <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />
            <Text style={styles.loadingText}>加载文章中...</Text>
          </View>
        ) : articleEmpty ? (
          <OrganicCard variant="ghost" shadow={false} style={styles.emptyCard}>
            <Text style={styles.emptyText}>暂无文章内容</Text>
          </OrganicCard>
        ) : (
          <View style={styles.articleList}>
            {articles.map((article) => (
              <OrganicCard key={article.id} shadow={false} style={styles.articleCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleArticlePress(article)}
                  style={styles.articlePressable}
                >
                  {article.coverUrl ? (
                    <Image source={{ uri: article.coverUrl }} style={styles.articleThumb} />
                  ) : (
                    <View style={styles.articleThumb} />
                  )}
                  <View style={styles.articleBody}>
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text style={styles.articleMeta} numberOfLines={1}>
                      {buildArticleMeta(article)}
                    </Text>
                  </View>
                  <IconSymbol
                    name="chevron.right"
                    size={organicTheme.iconSizes.xs}
                    color={organicTheme.colors.text.tertiary}
                  />
                </TouchableOpacity>
              </OrganicCard>
            ))}
          </View>
        )}

        {articlePagination?.hasNext && (
          <View style={styles.loadMore}>
            <OrganicButton
              title={loadingMore ? '加载中...' : '加载更多'}
              onPress={handleLoadMore}
              variant="secondary"
              disabled={loadingMore}
              style={styles.loadMoreButton}
            />
          </View>
        )}
      </ScrollView>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: organicTheme.spacing.lg,
    paddingBottom: 100,
  },
  statusSpacer: {
    height: 44,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
  },
  refreshText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  searchContainer: {
    marginTop: organicTheme.spacing.md,
    marginBottom: organicTheme.spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
    marginBottom: organicTheme.spacing.md,
  },
  sectionHeader: {
    marginTop: organicTheme.spacing.lg,
    marginBottom: organicTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  sectionMeta: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
    paddingVertical: organicTheme.spacing.sm,
  },
  loadingText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
  },
  errorRetry: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    paddingLeft: organicTheme.spacing.sm,
  },
  videoRow: {
    gap: organicTheme.spacing.md,
    paddingRight: organicTheme.spacing.md,
  },
  videoCard: {
    width: 264,
    height: 164,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: organicTheme.spacing.md,
    backgroundColor: organicTheme.colors.primary.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
  },
  videoImage: {
    borderRadius: organicTheme.shapes.borderRadius.soft,
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: organicTheme.colors.primary.soft,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 74, 74, 0.4)',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    lineHeight: 24,
  },
  videoMeta: {
    flexDirection: 'row',
    marginTop: organicTheme.spacing.xs,
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
  },
  videoMetaText: {
    color: '#FFFFFF',
    fontSize: organicTheme.typography.fontSize.xs,
    opacity: 0.9,
  },
  articleList: {
    gap: organicTheme.spacing.sm,
  },
  articleCard: {
    paddingVertical: organicTheme.spacing.sm,
  },
  articlePressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleThumb: {
    width: 64,
    height: 64,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.primary.pale,
    marginRight: organicTheme.spacing.md,
  },
  articleBody: {
    flex: 1,
    marginRight: organicTheme.spacing.sm,
  },
  articleTitle: {
    fontSize: organicTheme.typography.fontSize.md,
    color: organicTheme.colors.text.primary,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    marginBottom: 2,
  },
  articleMeta: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  emptyCard: {
    marginTop: organicTheme.spacing.sm,
  },
  emptyText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    textAlign: 'center',
  },
  loadMore: {
    marginTop: organicTheme.spacing.lg,
    alignItems: 'center',
  },
  loadMoreButton: {
    minWidth: 140,
  },
});
