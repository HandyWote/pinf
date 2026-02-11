import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { OrganicBackground, OrganicCard, OrganicChipButton } from '@/components/ui';
import { organicTheme } from '@/constants/theme';
import * as contentApi from '@/services/api/content';
import type { ContentArticle } from '@/types/content';
import { buildWebviewRoute } from '@/utils/open-external-url';

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

  const handleOpenSource = useCallback(() => {
    if (!article?.sourceUrl) {
      setError('暂无可用链接');
      return;
    }
    try {
      router.push(buildWebviewRoute(article.sourceUrl, article.title));
    } catch (openError) {
      const message = openError instanceof Error ? openError.message : '链接无效';
      setError(message);
    }
  }, [article]);

  return (
    <OrganicBackground variant="morning">
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSpacer} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              name="chevron.left"
              size={organicTheme.iconSizes.xs}
              color={organicTheme.colors.text.secondary}
            />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />
            <Text style={styles.loadingText}>加载文章中...</Text>
          </View>
        ) : error ? (
          <OrganicCard variant="soft" shadow={false} style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDetail}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </OrganicCard>
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
              {article.publishDate && <Text style={styles.metaText}>{formatDate(article.publishDate)}</Text>}
            </View>
            {article.category && <OrganicChipButton label={article.category} active onPress={() => undefined} />}
            {article.sourceUrl && (
              <OrganicCard variant="ghost" shadow={false} style={styles.linkCard}>
                <Text style={styles.linkLabel}>文章链接</Text>
                <TouchableOpacity onPress={handleOpenSource}>
                  <Text style={styles.linkValue} numberOfLines={2}>
                    {article.sourceUrl}
                  </Text>
                </TouchableOpacity>
              </OrganicCard>
            )}
            <Text style={styles.contentText}>{article.content}</Text>
          </View>
        ) : (
          <OrganicCard variant="soft" shadow={false} style={styles.errorCard}>
            <Text style={styles.errorText}>文章不存在</Text>
          </OrganicCard>
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
  headerRow: {
    marginBottom: organicTheme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
  },
  backText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
    marginTop: organicTheme.spacing.md,
  },
  loadingText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  errorCard: {
    marginTop: organicTheme.spacing.md,
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
  },
  errorText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
  },
  errorRetry: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  detail: {
    gap: organicTheme.spacing.md,
  },
  cover: {
    width: '100%',
    height: 200,
    borderRadius: organicTheme.shapes.borderRadius.soft,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    backgroundColor: organicTheme.colors.primary.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.text.primary,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    gap: organicTheme.spacing.sm,
  },
  metaText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  linkCard: {
    gap: organicTheme.spacing.xs,
  },
  linkLabel: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  linkValue: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    textDecorationLine: 'underline',
  },
  contentText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
    lineHeight: 22,
  },
});
