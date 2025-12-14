import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import {
  AgeCard,
  AppointmentCard,
  ActionGrid,
  BabySwitcher,
  ContentStrip,
  FloatingActionButton,
  GrowthCard,
} from '@/components/home';
import { theme } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const mockContent = [
  { id: '1', title: '早产儿喂养指南', tag: '喂养' },
  { id: '2', title: '0-12月发育里程碑', tag: '发育' },
  { id: '3', title: '复诊准备清单', tag: '复诊' },
];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.bgDecor}>
        <View style={styles.bgBubbleLarge} />
        <View style={styles.bgBubbleSmall} />
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSpacer} />
        <View style={styles.headerRow}>
          <BabySwitcher name="果果" ageText="2个月零5天" note="矫正1个月" />
          <View style={styles.headerIcon}>
            <IconSymbol size={18} name="bell.fill" color={theme.colors.textMain} />
          </View>
          <View style={styles.headerIcon}>
            <IconSymbol size={18} name="person.crop.circle" color={theme.colors.textMain} />
          </View>
        </View>

        <AgeCard
          babyName="果果"
          ageText="3月 12天"
          detailText="矫正月龄：2月 05天"
          badges={[{ label: '出生34周' }, { label: '矫正38周' }]}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快捷入口</Text>
        </View>
        <ActionGrid
          items={[
            { id: 'growth', title: '成长曲线', icon: 'chart.bar.fill', tint: '#FADCD9' },
            { id: 'appointment', title: '复诊提醒', icon: 'calendar', tint: '#E0E8F6' },
            { id: 'record', title: '病历夹', icon: 'folder.fill', tint: '#DDF1EB' },
            { id: 'assess', title: '发育评估', icon: 'rectangle.stack.fill', tint: '#F0E6FF' },
          ]}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近期复诊</Text>
          <Text style={styles.sectionAction}>添加+</Text>
        </View>
        <AppointmentCard
          clinic="儿童医院 - 眼科复查"
          department="请携带社保卡及过往病历"
          dateText="2025-12-15 10:00"
          dateDay="15"
          dateMonth="12月"
          remindText="提前2天提醒"
          statusLabel="待就诊"
          statusVariant="accent"
        />
        <AppointmentCard
          clinic="社区医院 - 疫苗接种"
          department="已完成"
          dateText="2025-11-28 14:00"
          dateDay="28"
          dateMonth="11月"
          statusLabel="已完成"
          statusVariant="muted"
        />

        <GrowthCard />

        <ContentStrip
          title="内容课堂"
          items={mockContent}
          onPressItem={() => router.push('/(tabs)/class')}
        />
      </ScrollView>

      <FloatingActionButton label="记录" icon="+" />
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
  bgDecor: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.bgBody,
  },
  bgBubbleLarge: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#DEEAF7',
  },
  bgBubbleSmall: {
    position: 'absolute',
    top: 120,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EAF1FB',
  },
  statusSpacer: {
    height: theme.layout.safeTop,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  sectionHeader: {
    marginTop: theme.layout.sectionGap,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  sectionAction: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
});
