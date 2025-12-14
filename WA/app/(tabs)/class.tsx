import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card, Input, ListItem } from '@/components/ui';
import { theme } from '@/constants/theme';

const videos = [
  {
    id: 'v1',
    title: '早产儿喂养关键点',
    cover:
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=80',
    duration: '08:24',
  },
  {
    id: 'v2',
    title: '宝宝夜醒怎么办？',
    cover:
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
    duration: '06:41',
  },
];

const articles = [
  {
    id: 'a1',
    title: '早产儿出院后如何科学喂养？专家给出这3点建议',
    meta: '3219 阅读 · 刚刚',
  },
  {
    id: 'a2',
    title: '宝宝夜醒频繁怎么办？可能是这几个原因',
    meta: '1088 阅读 · 2小时前',
  },
  {
    id: 'a3',
    title: '生长曲线怎么看？Fenton 与 WHO 标准的区别',
    meta: '542 阅读 · 昨天',
  },
];

export default function ClassScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSpacer} />

        <Text style={styles.title}>在线课堂</Text>
        <Input
          placeholder="搜索育儿视频、文章"
          containerStyle={styles.searchContainer}
          leftIcon={<IconSymbol name="magnifyingglass" size={18} color={theme.colors.textSub} />}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>推荐视频</Text>
          <Text style={styles.sectionAction}>更多</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoRow}
        >
          {videos.map((video) => (
            <ImageBackground
              key={video.id}
              source={{ uri: video.cover }}
              style={styles.videoCard}
              imageStyle={styles.videoImage}
            >
              <View style={styles.videoOverlay} />
              <View style={styles.playIcon}>
                <IconSymbol name="play.circle.fill" size={36} color={theme.colors.surface} />
              </View>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <View style={styles.videoMeta}>
                <Text style={styles.videoMetaText}>{video.duration}</Text>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>精选文章</Text>
          <Text style={styles.sectionAction}>更多</Text>
        </View>
        <View style={styles.articleList}>
          {articles.map((article) => (
            <Card key={article.id} style={styles.articleCard} padding="md">
              <ListItem
                title={article.title}
                subtitle={article.meta}
                leftContent={<View style={styles.articleThumb} />}
                style={styles.articleItem}
              />
            </Card>
          ))}
        </View>
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
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  searchContainer: {
    marginTop: theme.spacing.md,
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
  sectionAction: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
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
  },
  videoImage: {
    borderRadius: theme.borderRadius.medium,
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
    gap: 6,
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
});
