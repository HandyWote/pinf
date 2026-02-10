/**
 * 温暖有机风格的首页优化版本
 * 采用柔和的渐变、有机形状和浮动动画
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import {
  GrowthRecordModal,
} from '@/components/home';
import { AppointmentModal } from '@/components/home/AppointmentModal';
import { BabyForm, Modal, OrganicBackground, OrganicCard } from '@/components/ui';
import { organicTheme } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useAuthStore } from '@/store';
import { useBabyStore } from '@/store/babyStore';
import { useGrowthStore } from '@/store/growthStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { calculateBabyAge, formatDetailedAge } from '@/utils/ageCalculator';
import type { CreateBabyInput, UpdateBabyInput } from '@/types/baby';
import { LinearGradient } from 'expo-linear-gradient';

const mockContent = [
  { id: '1', title: '早产儿喂养指南', tag: '喂养', color: organicTheme.colors.accent.mint },
  { id: '2', title: '0-12月发育里程碑', tag: '发育', color: organicTheme.colors.accent.lavender },
  { id: '3', title: '复诊准备清单', tag: '复诊', color: organicTheme.colors.accent.sky },
];

export default function OrganicHomeScreen() {
  const { logout } = useAuthStore();
  const { confirm, notify } = useFeedback();
  const {
    babies,
    currentBaby,
    fetchBabies,
    createBaby,
    updateBaby,
    selectBaby,
    isLoading,
    error,
  } = useBabyStore();
  const [showBabyForm, setShowBabyForm] = useState(false);
  const [showBabyList, setShowBabyList] = useState(false);
  const [formMode] = useState<'create' | 'edit'>('create');
  const [editingBabyId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const {
    records,
    fetch: fetchGrowth,
    add: addGrowth,
  } = useGrowthStore();

  const {
    appointments,
    loading: appointmentLoading,
    error: appointmentError,
    fetch: fetchAppointments,
    add: addAppointment,
  } = useAppointmentStore();

  // 初始化
  useEffect(() => {
    if (currentBaby?.id) {
      fetchGrowth(currentBaby.id).catch(() => {});
    }
  }, [currentBaby?.id, fetchGrowth]);

  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments().catch(() => {});
    }
  }, [fetchAppointments, isAuthenticated]);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: '退出登录',
      message: '确定要退出登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      destructive: true,
    });
    if (!confirmed) return;
    await logout();
    router.replace('/login');
  };

  const handleCreateBaby = async (data: CreateBabyInput | UpdateBabyInput) => {
    try {
      await createBaby(data as CreateBabyInput);
      notify('宝宝信息已保存', 'success');
    } catch {
      notify('保存失败，请重试', 'error');
    }
  };

  const handleUpdateBaby = async (data: CreateBabyInput | UpdateBabyInput) => {
    if (!editingBabyId) return;
    try {
      await updateBaby(editingBabyId, data);
      notify('宝宝信息已更新', 'success');
    } catch {
      notify('更新失败，请重试', 'error');
    }
  };

  const handleAddGrowth = async (payloads: Parameters<typeof addGrowth>[1]) => {
    if (!currentBaby?.id) return;
    await addGrowth(currentBaby.id, payloads);
    setShowGrowthModal(false);
  };

  const handleAddAppointment = async (payload: any) => {
    await addAppointment({ ...payload, babyId: currentBaby?.id });
    setShowAppointmentModal(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBabies();
      if (currentBaby?.id) {
        await fetchGrowth(currentBaby.id);
      }
      await fetchAppointments();
    } finally {
      setIsRefreshing(false);
    }
  };

  const ageInfo = currentBaby ? calculateBabyAge(currentBaby) : null;
  const ageDisplay = ageInfo ? formatDetailedAge(ageInfo) : null;
  const currentGrowth = currentBaby?.id ? records[currentBaby.id] || [] : [];
  const filteredAppointments = useMemo(() => {
    if (!currentBaby) return appointments;
    return appointments.filter((item) => item.baby?.id === currentBaby.id);
  }, [appointments, currentBaby]);

  const editingBaby = editingBabyId
    ? babies.find((baby) => baby.id === editingBabyId)
    : undefined;

  return (
    <OrganicBackground variant="morning">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={organicTheme.colors.primary.main}
            colors={[organicTheme.colors.primary.main]}
          />
        }
      >
        <View style={styles.statusSpacer} />

        {/* 头部欢迎区域 */}
        <View style={styles.headerSection}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>早上好</Text>
            <View style={styles.greetingIcon}>
              <IconSymbol size={20} name="sun.max" color={organicTheme.colors.accent.peach} />
            </View>
            <Text style={styles.greetingSubtext}>又是陪伴宝宝成长的一天</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <IconSymbol size={18} name="person.crop.circle" color={organicTheme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 宝宝信息卡片 */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : error ? (
          <OrganicCard variant="soft" style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchBabies}>
              <Text style={styles.retryText}>重试</Text>
            </TouchableOpacity>
          </OrganicCard>
        ) : currentBaby && ageDisplay ? (
          <OrganicCard shadow style={styles.babyCard}>
            <View style={styles.babyCardContent}>
              <View style={styles.babyInfo}>
                <View style={styles.babyAvatar}>
                  <Text style={styles.babyAvatarText}>
                    {currentBaby.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.babyDetails}>
                  <Text style={styles.babyName}>{currentBaby.name}</Text>
                  <Text style={styles.babyAge}>{ageDisplay.mainText}</Text>
                  <Text style={styles.babyMeta}>{ageDisplay.detailText}</Text>
                </View>
              </View>

              {babies.length > 1 && (
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setShowBabyList(true)}
                >
                  <IconSymbol size={16} name="arrow.triangle.2.circlepath" color={organicTheme.colors.primary.main} />
                </TouchableOpacity>
              )}
            </View>

            {/* 年龄徽章 */}
            {ageDisplay.badges && ageDisplay.badges.length > 0 && (
              <View style={styles.badgesContainer}>
                {ageDisplay.badges.map((badge: { label: string }, index: number) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </OrganicCard>
        ) : (
          <OrganicCard shadow style={styles.addBabyCard}>
            <TouchableOpacity
              style={styles.addBabyContent}
              onPress={() => setShowBabyForm(true)}
            >
              <View style={styles.addBabyIcon}>
                <IconSymbol size={24} name="plus" color={organicTheme.colors.primary.main} />
              </View>
              <View style={styles.addBabyText}>
                <Text style={styles.addBabyTitle}>添加宝宝</Text>
                <Text style={styles.addBabySubtitle}>开始记录美好时光</Text>
              </View>
            </TouchableOpacity>
          </OrganicCard>
        )}

        {/* 快捷入口 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快捷入口</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/growth')}
          >
            <LinearGradient
              colors={[organicTheme.colors.primary.pale, organicTheme.colors.primary.soft]}
              style={styles.actionCardGradient}
            >
              <View style={styles.actionIconLarge}>
                <IconSymbol size={32} name="chart.line.uptrend.xyaxis" color={organicTheme.colors.primary.main} />
              </View>
              <Text style={styles.actionCardTitle}>成长曲线</Text>
              <Text style={styles.actionCardSubtitle}>记录发育里程碑</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/appointments')}
          >
            <LinearGradient
              colors={[organicTheme.colors.accent.peach, organicTheme.colors.primary.pale]}
              style={styles.actionCardGradient}
            >
              <View style={styles.actionIconLarge}>
                <IconSymbol size={32} name="calendar" color={organicTheme.colors.primary.main} />
              </View>
              <Text style={styles.actionCardTitle}>复诊提醒</Text>
              <Text style={styles.actionCardSubtitle}>管理预约时间</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 近期预约 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近期复诊</Text>
          <TouchableOpacity onPress={() => setShowAppointmentModal(true)}>
            <LinearGradient
              colors={[organicTheme.colors.primary.main, organicTheme.colors.primary.soft]}
              style={styles.addButton}
            >
              <IconSymbol size={14} name="plus" color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {appointmentLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />
            <Text style={styles.loadingText}>加载预约中...</Text>
          </View>
        ) : appointmentError ? (
          <OrganicCard variant="soft" style={styles.errorCard}>
            <Text style={styles.errorText}>{appointmentError}</Text>
            <TouchableOpacity onPress={fetchAppointments}>
              <Text style={styles.retryText}>重试</Text>
            </TouchableOpacity>
          </OrganicCard>
        ) : filteredAppointments.length === 0 ? (
          <OrganicCard variant="ghost">
            <View style={styles.emptyContent}>
              <IconSymbol size={48} name="calendar" color={organicTheme.colors.text.secondary} />
              <Text style={styles.emptyText}>暂无预约</Text>
              <Text style={styles.emptySubtext}>点击右上角添加复诊预约</Text>
            </View>
          </OrganicCard>
        ) : (
          filteredAppointments.slice(0, 2).map((item) => {
            const date = new Date(item.scheduledAt);
            const dateDay = String(date.getDate()).padStart(2, '0');
            const dateMonth = `${date.getMonth() + 1}月`;
            const statusLabel =
              item.status === 'pending'
                ? '待就诊'
                : item.status === 'completed'
                  ? '已完成'
                  : '已过期';

            return (
              <OrganicCard key={item.id} shadow style={styles.appointmentCard}>
                <View style={styles.appointmentContent}>
                  <View style={styles.appointmentDate}>
                    <Text style={styles.appointmentDay}>{dateDay}</Text>
                    <Text style={styles.appointmentMonth}>{dateMonth}</Text>
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentClinic}>{item.clinic}</Text>
                    <Text style={styles.appointmentDepartment}>{item.department}</Text>
                  </View>
                  <View style={[styles.statusBadge, item.status === 'pending' ? styles.statusPending : item.status === 'completed' ? styles.statusCompleted : styles.statusExpired]}>
                    <Text style={styles.statusText}>{statusLabel}</Text>
                  </View>
                </View>
              </OrganicCard>
            );
          })
        )}

        {/* 成长记录简览 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>成长记录</Text>
          <TouchableOpacity onPress={() => setShowGrowthModal(true)}>
            <LinearGradient
              colors={[organicTheme.colors.primary.main, organicTheme.colors.primary.soft]}
              style={styles.addButton}
            >
              <IconSymbol size={14} name="plus" color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {currentGrowth.length > 0 ? (
          <OrganicCard shadow style={styles.growthPreviewCard}>
            <View style={styles.growthPreview}>
              <Text style={styles.growthPreviewTitle}>最近记录</Text>
              <View style={styles.growthMetrics}>
                {['weight', 'height', 'head'].map((metric) => {
                  const metricRecords = currentGrowth.filter(r => r.metric === metric);
                  if (metricRecords.length === 0) return null;
                  const latest = metricRecords[metricRecords.length - 1];
                  const metricNames = { weight: '体重', height: '身高', head: '头围' };
                  const units = { weight: 'kg', height: 'cm', head: 'cm' };

                  return (
                    <View key={metric} style={styles.growthMetric}>
                      <Text style={styles.growthMetricLabel}>{metricNames[metric as keyof typeof metricNames]}</Text>
                      <Text style={styles.growthMetricValue}>
                        {latest.value}
                        <Text style={styles.growthMetricUnit}> {units[metric as keyof typeof units]}</Text>
                      </Text>
                    </View>
                  );
                })}
              </View>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/growth')}
              >
                <Text style={styles.viewAllButtonText}>查看完整曲线 →</Text>
              </TouchableOpacity>
            </View>
          </OrganicCard>
        ) : (
          <OrganicCard variant="ghost">
            <View style={styles.emptyContent}>
              <IconSymbol size={48} name="figure.child" color={organicTheme.colors.text.secondary} />
              <Text style={styles.emptyText}>暂无成长记录</Text>
              <Text style={styles.emptySubtext}>点击上方 + 添加第一条记录</Text>
            </View>
          </OrganicCard>
        )}

        {/* 内容课堂 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>内容课堂</Text>
        </View>

        <OrganicCard shadow>
          <View style={styles.contentStrip}>
            {mockContent.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.contentItem}
                onPress={() => router.push('/(tabs)/class')}
              >
                <View style={[styles.contentTag, { backgroundColor: item.color }]}>
                  <Text style={styles.contentTagText}>{item.tag}</Text>
                </View>
                <Text style={styles.contentTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </OrganicCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 浮动操作按钮 */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowGrowthModal(true)}>
        <LinearGradient
          colors={[organicTheme.colors.primary.main, organicTheme.colors.primary.soft]}
          style={styles.fabGradient}
        >
          <IconSymbol size={24} name="plus" color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* 弹窗 */}
      <GrowthRecordModal
        visible={showGrowthModal}
        onClose={() => setShowGrowthModal(false)}
        onSubmit={handleAddGrowth}
      />
      <AppointmentModal
        visible={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSubmit={handleAddAppointment}
      />
      <BabyForm
        visible={showBabyForm}
        onClose={() => setShowBabyForm(false)}
        onSubmit={formMode === 'create' ? handleCreateBaby : handleUpdateBaby}
        mode={formMode}
        initialData={editingBaby}
      />
      <Modal
        visible={showBabyList}
        onClose={() => setShowBabyList(false)}
        title="选择宝宝"
        height="auto"
        position="top"
      >
        <View style={styles.babyListContent}>
          {babies.map((baby) => (
            <TouchableOpacity
              key={baby.id}
              style={[
                styles.babyListItem,
                currentBaby?.id === baby.id && styles.babyListItemActive,
              ]}
              onPress={() => {
                selectBaby(baby.id);
                setShowBabyList(false);
              }}
            >
              <Text style={styles.babyListItemName}>{baby.name}</Text>
              {currentBaby?.id === baby.id && (
                <IconSymbol size={16} name="checkmark.circle.fill" color={organicTheme.colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: organicTheme.spacing.xl,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: organicTheme.typography.fontSize['2xl'],
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
  },
  greetingIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: organicTheme.spacing.xs,
  },
  greetingSubtext: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: organicTheme.spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: organicTheme.colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.pale,
  },
  babyCard: {
    marginBottom: organicTheme.spacing.xl,
  },
  babyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  babyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  babyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: organicTheme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: organicTheme.spacing.md,
  },
  babyAvatarText: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  babyDetails: {
    flex: 1,
  },
  babyName: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
  },
  babyAge: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    marginBottom: 2,
  },
  babyMeta: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.tertiary,
  },
  switchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
    marginTop: organicTheme.spacing.md,
  },
  badge: {
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.primary.pale,
  },
  badgeText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  addBabyCard: {
    marginBottom: organicTheme.spacing.xl,
  },
  addBabyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBabyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: organicTheme.spacing.md,
  },
  addBabyText: {
    flex: 1,
  },
  addBabyTitle: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: 2,
  },
  addBabySubtitle: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: organicTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: organicTheme.spacing.md,
    marginBottom: organicTheme.spacing.xl,
  },
  actionCard: {
    flex: 1,
    height: 140,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    overflow: 'hidden',
  },
  actionCardGradient: {
    flex: 1,
    padding: organicTheme.spacing.md,
    justifyContent: 'flex-end',
  },
  actionIconLarge: {
    position: 'absolute',
    top: organicTheme.spacing.md,
    right: organicTheme.spacing.md,
  },
  actionCardTitle: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: 2,
  },
  actionCardSubtitle: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  appointmentCard: {
    marginBottom: organicTheme.spacing.md,
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentDate: {
    width: 56,
    height: 56,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: organicTheme.spacing.md,
  },
  appointmentDay: {
    fontSize: organicTheme.typography.fontSize.xl,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.primary.main,
  },
  appointmentMonth: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.primary.main,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentClinic: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.medium,
    color: organicTheme.colors.text.primary,
    marginBottom: 2,
  },
  appointmentDepartment: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.pill,
  },
  statusPending: {
    backgroundColor: organicTheme.colors.warning,
  },
  statusCompleted: {
    backgroundColor: organicTheme.colors.success,
  },
  statusExpired: {
    backgroundColor: '#E0E0E0',
  },
  statusText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.primary,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  growthPreviewCard: {
    marginBottom: organicTheme.spacing.xl,
  },
  growthPreview: {
    padding: 0,
  },
  growthPreviewTitle: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.secondary,
    marginBottom: organicTheme.spacing.md,
    paddingHorizontal: organicTheme.spacing.lg,
    paddingTop: organicTheme.spacing.lg,
  },
  growthMetrics: {
    flexDirection: 'row',
    paddingHorizontal: organicTheme.spacing.lg,
    paddingBottom: organicTheme.spacing.md,
    gap: organicTheme.spacing.lg,
  },
  growthMetric: {
    flex: 1,
  },
  growthMetricLabel: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
    marginBottom: organicTheme.spacing.xs,
  },
  growthMetricValue: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.primary.main,
  },
  growthMetricUnit: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  viewAllButton: {
    borderTopWidth: 1,
    borderTopColor: organicTheme.colors.primary.pale,
    paddingVertical: organicTheme.spacing.md,
    alignItems: 'center',
  },
  viewAllButtonText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: organicTheme.spacing['2xl'],
  },
  emptyText: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.medium,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
  },
  emptySubtext: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: organicTheme.spacing.xl,
    gap: organicTheme.spacing.sm,
  },
  loadingText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  errorCard: {
    marginBottom: organicTheme.spacing.md,
  },
  errorText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.error,
    marginBottom: organicTheme.spacing.sm,
  },
  retryText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  contentStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
  },
  contentItem: {
    width: '100%',
    padding: organicTheme.spacing.md,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.background.cream,
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.pale,
  },
  contentTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    marginBottom: organicTheme.spacing.xs,
  },
  contentTagText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.primary,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  contentTitle: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
  },
  bottomSpacer: {
    height: organicTheme.spacing['2xl'],
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...organicTheme.shadows.floating[0],
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyListContent: {
    paddingVertical: organicTheme.spacing.md,
    gap: organicTheme.spacing.sm,
  },
  babyListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: organicTheme.spacing.md,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.pale,
  },
  babyListItemActive: {
    backgroundColor: organicTheme.colors.primary.pale,
    borderColor: organicTheme.colors.primary.main,
  },
  babyListItemName: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.medium,
    color: organicTheme.colors.text.primary,
  },
});
