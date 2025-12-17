import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
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
import { BabyForm } from '@/components/ui';
import { theme } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/store';
import { useBabyStore } from '@/store/babyStore';
import { calculateBabyAge, formatDetailedAge } from '@/utils/ageCalculator';
import type { CreateBabyInput } from '@/types/baby';

const mockContent = [
  { id: '1', title: '早产儿喂养指南', tag: '喂养' },
  { id: '2', title: '0-12月发育里程碑', tag: '发育' },
  { id: '3', title: '复诊准备清单', tag: '复诊' },
];

export default function HomeScreen() {
  const { logout, user } = useAuthStore();
  const { babies, currentBaby, fetchBabies, createBaby, selectBaby, isLoading, error } = useBabyStore();
  const [showBabyForm, setShowBabyForm] = useState(false);

  // 初始化：加载宝宝列表
  useEffect(() => {
    fetchBabies();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleCreateBaby = async (data: CreateBabyInput) => {
    try {
      await createBaby(data);
      Alert.alert('成功', '宝宝信息已保存');
    } catch (error) {
      Alert.alert('失败', '保存失败，请重试');
    }
  };

  const handleBabySwitcherPress = () => {
    if (babies.length > 1) {
      // 如果有多个宝宝，显示选择列表
      Alert.alert(
        '选择宝宝',
        '',
        [
          ...babies.map((baby) => ({
            text: baby.name,
            onPress: () => selectBaby(baby.id),
          })),
          { text: '添加新宝宝', onPress: () => setShowBabyForm(true), style: 'default' },
          { text: '取消', style: 'cancel' },
        ]
      );
    } else {
      // 如果只有一个或没有宝宝，直接打开添加表单
      setShowBabyForm(true);
    }
  };

  // 计算当前宝宝的年龄信息
  const ageInfo = currentBaby ? calculateBabyAge(currentBaby) : null;
  const ageDisplay = ageInfo ? formatDetailedAge(ageInfo) : null;

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
          {currentBaby && ageDisplay ? (
            <BabySwitcher
              name={currentBaby.name}
              ageText={ageDisplay.mainText}
              note={ageDisplay.detailText}
              onPress={handleBabySwitcherPress}
            />
          ) : (
            <TouchableOpacity onPress={() => setShowBabyForm(true)} style={styles.addBabyButton}>
              <Text style={styles.addBabyText}>+ 添加宝宝</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerIcon}>
            <IconSymbol size={18} name="bell.fill" color={theme.colors.textMain} />
          </View>
          <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
            <IconSymbol size={18} name="person.crop.circle" color={theme.colors.textMain} />
          </TouchableOpacity>
        </View>

        {currentBaby && ageDisplay && (
          <AgeCard
            babyName={currentBaby.name}
            ageText={ageDisplay.mainText}
            detailText={ageDisplay.detailText || ''}
            badges={ageDisplay.badges}
          />
        )}

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

      <BabyForm
        visible={showBabyForm}
        onClose={() => setShowBabyForm(false)}
        onSubmit={handleCreateBaby}
        mode="create"
      />
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
  addBabyButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  addBabyText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
