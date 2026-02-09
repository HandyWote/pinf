/**
 * 温暖有机风格组件展示页
 * 用于演示所有温暖有机美学风格的组件
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  OrganicBackground,
  OrganicCard,
  OrganicButton,
  OrganicChipButton,
  OrganicCardHeader,
} from '@/components/ui';
import { organicTheme } from '@/constants/theme';

export default function OrganicComponentsShowcase() {
  const [selectedMetric, setSelectedMetric] = useState('weight');

  return (
    <OrganicBackground variant="morning">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>温暖有机风格</Text>
          <Text style={styles.subtitle}>Warm Organic Design System</Text>
        </View>

        {/* 卡片变体展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>卡片变体</Text>

          <View style={styles.cardGrid}>
            <OrganicCard shadow style={styles.card}>
              <Text style={styles.cardLabel}>默认卡片</Text>
              <Text style={styles.cardText}>
                带柔和阴影的白色卡片
              </Text>
            </OrganicCard>

            <OrganicCard variant="gradient" shadow style={styles.card}>
              <Text style={styles.cardLabel}>渐变卡片</Text>
              <Text style={styles.cardText}>
                柔和的珊瑚粉渐变背景
              </Text>
            </OrganicCard>

            <OrganicCard variant="glass" shadow style={styles.card}>
              <Text style={styles.cardLabel}>玻璃卡片</Text>
              <Text style={styles.cardText}>
                毛玻璃透明效果
              </Text>
            </OrganicCard>

            <OrganicCard variant="soft" shadow style={styles.card}>
              <Text style={styles.cardLabel}>柔和卡片</Text>
              <Text style={styles.cardText}>
                浅色背景半透明
              </Text>
            </OrganicCard>

            <OrganicCard variant="ghost" style={styles.card}>
              <Text style={styles.cardLabel}>幽灵卡片</Text>
              <Text style={styles.cardText}>
                透明背景仅边框
              </Text>
            </OrganicCard>
          </View>
        </View>

        {/* 按钮展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>按钮样式</Text>

          <OrganicCard shadow>
            <View style={styles.buttonGrid}>
              <OrganicButton
                title="主按钮"
                onPress={() => {}}
                variant="primary"
                style={styles.button}
              />
              <OrganicButton
                title="次要按钮"
                onPress={() => {}}
                variant="secondary"
                style={styles.button}
              />
              <OrganicButton
                title="幽灵按钮"
                onPress={() => {}}
                variant="ghost"
                style={styles.button}
              />
              <OrganicButton
                title="柔和按钮"
                onPress={() => {}}
                variant="soft"
                style={styles.button}
              />
            </View>

            <View style={styles.buttonRow}>
              <OrganicButton
                title="小"
                onPress={() => {}}
                size="small"
                style={styles.sizeButton}
              />
              <OrganicButton
                title="中"
                onPress={() => {}}
                size="medium"
                style={styles.sizeButton}
              />
              <OrganicButton
                title="大"
                onPress={() => {}}
                size="large"
                style={styles.sizeButton}
              />
            </View>
          </OrganicCard>
        </View>

        {/* 胶囊标签 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>胶囊标签</Text>

          <OrganicCard shadow>
            <View style={styles.chipRow}>
              <OrganicChipButton
                label="体重"
                active={selectedMetric === 'weight'}
                onPress={() => setSelectedMetric('weight')}
              />
              <OrganicChipButton
                label="身高"
                active={selectedMetric === 'height'}
                onPress={() => setSelectedMetric('height')}
              />
              <OrganicChipButton
                label="头围"
                active={selectedMetric === 'head'}
                onPress={() => setSelectedMetric('head')}
              />
            </View>
          </OrganicCard>
        </View>

        {/* 卡片头部示例 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>卡片组件</Text>

          <OrganicCard shadow>
            <OrganicCardHeader
              title="成长记录"
              subtitle="最近 5 条记录"
              action={
                <OrganicButton
                  title="添加"
                  onPress={() => {}}
                  variant="soft"
                  size="small"
                />
              }
            />
            <View style={styles.demoContent}>
              <Text style={styles.demoText}>
                这是卡片内容区域，可以放置任何组件。
              </Text>
            </View>
          </OrganicCard>
        </View>

        {/* 颜色展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>色彩系统</Text>

          <OrganicCard shadow>
            <View style={styles.colorGrid}>
              <View style={[styles.colorBox, { backgroundColor: organicTheme.colors.primary.main }]}>
                <Text style={styles.colorLabel}>Primary</Text>
                <Text style={styles.colorValue}>#FFB5A7</Text>
              </View>
              <View style={[styles.colorBox, { backgroundColor: organicTheme.colors.primary.soft }]}>
                <Text style={styles.colorLabel}>Primary Soft</Text>
                <Text style={styles.colorValue}>#FFD4CC</Text>
              </View>
              <View style={[styles.colorBox, { backgroundColor: organicTheme.colors.primary.pale }]}>
                <Text style={styles.colorLabel}>Primary Pale</Text>
                <Text style={styles.colorValue}>#FFF0EC</Text>
              </View>
              <View style={[styles.colorBox, { backgroundColor: organicTheme.colors.accent.peach }]}>
                <Text style={styles.colorLabel}>Peach</Text>
                <Text style={styles.colorValue}>#FFCB9C</Text>
              </View>
              <View style={[styles.colorBox, { backgroundColor: organicTheme.colors.accent.mint }]}>
                <Text style={styles.colorLabel}>Mint</Text>
                <Text style={styles.colorValue}>#C8E6C9</Text>
              </View>
              <View style={[styles.colorBox, { backgroundColor: organicTheme.colors.accent.lavender }]}>
                <Text style={styles.colorLabel}>Lavender</Text>
                <Text style={styles.colorValue}>#E1D5E7</Text>
              </View>
              <View style={[styles.colorBox, { backgroundColor: organicTheme.colors.accent.sky }]}>
                <Text style={styles.colorLabel}>Sky</Text>
                <Text style={styles.colorValue}>#B8E0E8</Text>
              </View>
            </View>
          </OrganicCard>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: organicTheme.spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: organicTheme.spacing.xl,
  },
  title: {
    fontSize: organicTheme.typography.fontSize['3xl'],
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
  },
  subtitle: {
    fontSize: organicTheme.typography.fontSize.md,
    color: organicTheme.colors.text.secondary,
  },
  section: {
    marginBottom: organicTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.md,
  },
  card: {
    width: '47%',
  },
  cardLabel: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
  },
  cardText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  buttonGrid: {
    gap: organicTheme.spacing.sm,
    marginBottom: organicTheme.spacing.md,
  },
  button: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: organicTheme.spacing.sm,
  },
  sizeButton: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
  },
  demoContent: {
    paddingTop: organicTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: organicTheme.colors.primary.pale,
  },
  demoText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    lineHeight: 22,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
  },
  colorBox: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    padding: organicTheme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: organicTheme.typography.fontSize.xs,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: 2,
  },
  colorValue: {
    fontSize: 10,
    color: organicTheme.colors.text.secondary,
  },
  bottomSpacer: {
    height: organicTheme.spacing['2xl'],
  },
});
