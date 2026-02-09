import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card, Tag } from '@/components/ui';
import { theme } from '@/constants/theme';
import * as contentApi from '@/services/api/content';
import type { ContentArticle } from '@/types/content';

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

export default function ArticleDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const articleId = Number(params.id);
  const [article, setArticle] = useState<ContentArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!articleId) {
      setError('文章 ID 无效');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const detail = await contentApi.getArticleDetail(articleId);
      setArticle(detail);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : '获取文章失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSpacer} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={18} color={theme.colors.textMain} />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>加载文章中...</Text>
          </View>
        ) : error ? (
          <Card style={styles.errorCard} padding="md">
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDetail}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </Card>
        ) : article ? (
          <View style={styles.detail}>
            {article.coverUrl ? (
              <Image source={{ uri: article.coverUrl }} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder} />
            )}
            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{article.author || '匿名作者'}</Text>
              {article.publishDate && (
                <Text style={styles.metaText}>{formatDate(article.publishDate)}</Text>
              )}
            </View>
            {article.category && (
              <Tag label={article.category} variant="primary" size="small" style={styles.tag} />
            )}
            <Text style={styles.contentText}>{article.content}</Text>
          </View>
        ) : (
          <Card style={styles.errorCard} padding="md">
            <Text style={styles.errorText}>文章不存在</Text>
          </Card>
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
  headerRow: {
    marginBottom: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  backText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMain,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  errorCard: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.fontSizes.sm,
    color: '#D64545',
  },
  errorRetry: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  detail: {
    gap: theme.spacing.md,
  },
  cover: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.large,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.primaryLight,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.textMain,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metaText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  tag: {
    alignSelf: 'flex-start',
  },
  contentText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMain,
    lineHeight: 22,
  },
});

