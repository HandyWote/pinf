import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { OrganicBackground, OrganicCard, OrganicChipButton } from '@/components/ui';
import { organicTheme } from '@/constants/theme';
import * as contentApi from '@/services/api/content';
import type { ContentVideo } from '@/types/content';
import { buildWebviewRoute } from '@/utils/open-external-url';

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

export default function VideoDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const videoId = Number(params.id);
  const [video, setVideo] = useState<ContentVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!videoId) {
      setError('视频 ID 无效');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const detail = await contentApi.getVideoDetail(videoId);
      setVideo(detail);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : '获取视频失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleOpenSource = useCallback(() => {
    const target = video?.sourceUrl || video?.videoUrl;
    if (!target) {
      setError('暂无可用链接');
      return;
    }
    try {
      router.push(buildWebviewRoute(target, video?.title));
    } catch (openError) {
      const message = openError instanceof Error ? openError.message : '链接无效';
      setError(message);
    }
  }, [video]);

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
            <Text style={styles.loadingText}>加载视频中...</Text>
          </View>
        ) : error ? (
          <OrganicCard variant="soft" shadow={false} style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDetail}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </OrganicCard>
        ) : video ? (
          <View style={styles.detail}>
            {video.coverUrl ? (
              <Image source={{ uri: video.coverUrl }} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder} />
            )}
            <Text style={styles.title}>{video.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{video.views || 0} 次播放</Text>
              {video.publishDate && <Text style={styles.metaText}>{formatDate(video.publishDate)}</Text>}
            </View>
            {video.category && <OrganicChipButton label={video.category} active onPress={() => undefined} />}
            {video.description && <Text style={styles.description}>{video.description}</Text>}
            <OrganicCard variant="ghost" shadow={false} style={styles.linkCard}>
              <Text style={styles.linkLabel}>视频链接</Text>
              <TouchableOpacity onPress={handleOpenSource}>
                <Text style={styles.linkValue} numberOfLines={2}>
                  {video.sourceUrl || video.videoUrl}
                </Text>
              </TouchableOpacity>
            </OrganicCard>
          </View>
        ) : (
          <OrganicCard variant="soft" shadow={false} style={styles.errorCard}>
            <Text style={styles.errorText}>视频不存在</Text>
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
  description: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
    lineHeight: 22,
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
});
