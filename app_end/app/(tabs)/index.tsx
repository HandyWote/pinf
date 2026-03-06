import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { GrowthRecordModal } from '@/components/home/GrowthRecordModal';
import { AppointmentInfoOnceModal } from '@/components/home/AppointmentInfoOnceModal';
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

export default function HomeScreen() {
  const { notify } = useFeedback();
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
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingBabyId, setEditingBabyId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [greeting, setGreeting] = useState({ text: '', icon: '', subtext: '' });

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

  // 根据时间获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        text: '早上好',
        icon: 'sun.max',
        subtext: '又是陪伴宝宝成长的一天'
      };
    } else if (hour >= 12 && hour < 14) {
      return {
        text: '中午好',
        icon: 'sun.max.fill',
        subtext: '记得宝宝该午休了哦'
      };
    } else if (hour >= 14 && hour < 18) {
      return {
        text: '下午好',
        icon: 'cloud.sun',
        subtext: '下午时光，陪伴宝宝玩耍'
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        text: '晚上好',
        icon: 'moon.stars',
        subtext: '夜晚时光，给宝宝讲个故事'
      };
    } else {
      return {
        text: '夜深了',
        icon: 'moon.fill',
        subtext: '注意休息，宝宝也需要睡眠'
      };
    }
  };

  // 初始化问候语
  useEffect(() => {
    setGreeting(getGreeting());
    // 每分钟更新一次问候语
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  const handleBabySwitcherPress = () => {
    setShowBabyList(true);
  };

  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditingBabyId(null);
    setShowBabyList(false);
    setShowBabyForm(true);
  };

  const handleAddGrowth = async (payloads: Parameters<typeof addGrowth>[1]) => {
    if (!currentBaby?.id) return;
    await addGrowth(currentBaby.id, payloads);
    setShowGrowthModal(false);
  };

  const handleOpenGrowthModal = () => {
    setShowGrowthModal(true);
  };

  const handleOpenAppointmentModal = () => {
    setShowAppointmentModal(true);
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
            {/* 背景装饰图标 */}
            <View style={styles.greetingBackgroundIcon}>
              <IconSymbol size={120} name={greeting.icon as any} color={organicTheme.colors.accent.peach} />
            </View>
            {/* 前景问候语 */}
            <View style={styles.greetingContent}>
              <Text style={styles.greetingText}>{greeting.text}</Text>
              <Text style={styles.greetingSubtext}>{greeting.subtext}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <IconSymbol size={organicTheme.iconSizes.xs} name="person.crop.circle" color={organicTheme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 加载和错误状态 */}
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
          /* 宝宝信息卡片 */
          <OrganicCard shadow style={styles.babyCard}>
            <TouchableOpacity onPress={handleBabySwitcherPress}>
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
                    {ageDisplay.detailText && (
                      <Text style={styles.babyMeta}>{ageDisplay.detailText}</Text>
                    )}
                  </View>
                </View>

                {babies.length > 1 && (
                  <View style={styles.switchIndicator}>
                    <Text style={styles.switchText}>切换</Text>
                    <IconSymbol size={organicTheme.iconSizes.xxs} name="chevron.right" color={organicTheme.colors.primary.main} />
                  </View>
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
            </TouchableOpacity>
          </OrganicCard>
        ) : (
          /* 添加宝宝卡片 */
          <OrganicCard shadow style={styles.addBabyCard}>
            <TouchableOpacity
              style={styles.addBabyContent}
              onPress={handleOpenCreateForm}
            >
              <View style={styles.addBabyIcon}>
                <IconSymbol size={organicTheme.iconSizes.md} name="plus" color={organicTheme.colors.primary.main} />
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
              <View style={styles.actionIcon}>
                <IconSymbol size={organicTheme.iconSizes.xl} name="chart.line.uptrend.xyaxis" color={organicTheme.colors.primary.main} />
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
              <View style={styles.actionIcon}>
                <IconSymbol size={organicTheme.iconSizes.lg} name="calendar" color={organicTheme.colors.primary.main} />
              </View>
              <Text style={styles.actionCardTitle}>复诊提醒</Text>
              <Text style={styles.actionCardSubtitle}>管理预约时间</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 近期预约 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近期复诊</Text>
          <TouchableOpacity onPress={handleOpenAppointmentModal}>
            <LinearGradient
              colors={[organicTheme.colors.primary.main, organicTheme.colors.primary.soft]}
              style={styles.addButton}
            >
              <IconSymbol size={organicTheme.iconSizes.xxs} name="plus" color="#FFFFFF" />
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
              <IconSymbol size={organicTheme.iconSizes.xl} name="calendar" color={organicTheme.colors.text.secondary} />
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
                  <View style={[
                    styles.statusBadge,
                    item.status === 'pending' ? styles.statusPending :
                    item.status === 'completed' ? styles.statusCompleted :
                    styles.statusExpired
                  ]}>
                    <Text style={styles.statusText}>{statusLabel}</Text>
                  </View>
                </View>
              </OrganicCard>
            );
          })
        )}

        {/* 成长记录简览 */}
        <View style={[styles.sectionHeader, styles.growthSectionHeader]}>
          <Text style={styles.sectionTitle}>成长记录</Text>
          <TouchableOpacity onPress={handleOpenGrowthModal}>
            <LinearGradient
              colors={[organicTheme.colors.primary.main, organicTheme.colors.primary.soft]}
              style={styles.addButton}
            >
              <IconSymbol size={organicTheme.iconSizes.xxs} name="plus" color="#FFFFFF" />
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
              <IconSymbol size={organicTheme.iconSizes.xl} name="figure.child" color={organicTheme.colors.text.secondary} />
              <Text style={styles.emptyText}>暂无成长记录</Text>
              <Text style={styles.emptySubtext}>点击上方 + 添加第一条记录</Text>
            </View>
          </OrganicCard>
        )}

        
        <View style={styles.bottomSpacer} />
      </ScrollView>

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
      <AppointmentInfoOnceModal />
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
              activeOpacity={0.78}
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
                <IconSymbol size={organicTheme.iconSizes.xs} name="checkmark.circle.fill" color={organicTheme.colors.primary.main} />
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
    position: 'relative',
    minHeight: 80,
  },
  greetingBackgroundIcon: {
    position: 'absolute',
    top: -40,
    left: 10,
    opacity: 0.80,
    zIndex: 0,
  },
  greetingContent: {
    position: 'relative',
    zIndex: 1,
  },
  greetingText: {
    fontSize: organicTheme.typography.fontSize['2xl'],
    fontWeight: organicTheme.typography.fontWeight.bold,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.display,
      android: organicTheme.typography.fontFamily.android.display,
      default: organicTheme.typography.fontFamily.ios.display,
    }),
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
    letterSpacing: organicTheme.typography.letterSpacing.tight,
    lineHeight: 36,
  },
  greetingSubtext: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.regular,
      android: organicTheme.typography.fontFamily.android.regular,
      default: organicTheme.typography.fontFamily.ios.regular,
    }),
    color: organicTheme.colors.text.secondary,
    letterSpacing: organicTheme.typography.letterSpacing.relaxed,
    lineHeight: 20,
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
    borderColor: organicTheme.colors.border.light,
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
    color: '#D64545',
    marginBottom: organicTheme.spacing.sm,
  },
  retryText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  babyCard: {
    marginBottom: organicTheme.spacing.xl,
  },
  babyCardContent: {
    padding: 0,
  },
  babyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: organicTheme.spacing.md,
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
    marginBottom: 2,
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
  switchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
    paddingVertical: organicTheme.spacing.sm,
  },
  switchText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
  },
  badge: {
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.primary.pale,
  },
  badgeText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.primary,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  addBabyCard: {
    marginBottom: organicTheme.spacing.xl,
  },
  addBabyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
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
  growthSectionHeader: {
    marginTop: organicTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.semibold,
      android: organicTheme.typography.fontFamily.android.semibold,
      default: organicTheme.typography.fontFamily.ios.semibold,
    }),
    color: organicTheme.colors.text.primary,
    letterSpacing: organicTheme.typography.letterSpacing.tight,
    lineHeight: 24,
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
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
  },
  actionCardGradient: {
    flex: 1,
    padding: organicTheme.spacing.md,
    justifyContent: 'flex-end',
  },
  actionIcon: {
    position: 'absolute',
    top: organicTheme.spacing.md,
    right: organicTheme.spacing.md,
  },
  actionCardTitle: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.bold,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.bold,
      android: organicTheme.typography.fontFamily.android.bold,
      default: organicTheme.typography.fontFamily.ios.bold,
    }),
    color: organicTheme.colors.text.primary,
    marginBottom: 2,
    letterSpacing: organicTheme.typography.letterSpacing.normal,
    lineHeight: 22,
  },
  actionCardSubtitle: {
    fontSize: organicTheme.typography.fontSize.xs,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.regular,
      android: organicTheme.typography.fontFamily.android.regular,
      default: organicTheme.typography.fontFamily.ios.regular,
    }),
    color: organicTheme.colors.text.secondary,
    letterSpacing: organicTheme.typography.letterSpacing.relaxed,
    lineHeight: 16,
  },
  appointmentCard: {
    marginBottom: organicTheme.spacing.md,
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
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
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.medium,
      android: organicTheme.typography.fontFamily.android.medium,
      default: organicTheme.typography.fontFamily.ios.medium,
    }),
    color: organicTheme.colors.text.primary,
    marginBottom: 2,
    lineHeight: 22,
  },
  appointmentDepartment: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.regular,
      android: organicTheme.typography.fontFamily.android.regular,
      default: organicTheme.typography.fontFamily.ios.regular,
    }),
    color: organicTheme.colors.text.secondary,
    letterSpacing: organicTheme.typography.letterSpacing.relaxed,
    lineHeight: 20,
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
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.semibold,
      android: organicTheme.typography.fontFamily.android.semibold,
      default: organicTheme.typography.fontFamily.ios.semibold,
    }),
    color: organicTheme.colors.text.secondary,
    marginBottom: organicTheme.spacing.md,
    paddingHorizontal: organicTheme.spacing.lg,
    paddingTop: organicTheme.spacing.lg,
    letterSpacing: organicTheme.typography.letterSpacing.relaxed,
    lineHeight: 20,
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
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.mono,
      android: organicTheme.typography.fontFamily.android.mono,
      default: organicTheme.typography.fontFamily.ios.mono,
    }),
    color: organicTheme.colors.primary.main,
    letterSpacing: organicTheme.typography.letterSpacing.tight,
    lineHeight: 26,
  },
  growthMetricUnit: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  viewAllButton: {
    borderTopWidth: 1,
    borderTopColor: organicTheme.colors.border.light,
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: organicTheme.spacing.md,
  },
  emptyText: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.medium,
      android: organicTheme.typography.fontFamily.android.medium,
      default: organicTheme.typography.fontFamily.ios.medium,
    }),
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.regular,
      android: organicTheme.typography.fontFamily.android.regular,
      default: organicTheme.typography.fontFamily.ios.regular,
    }),
    color: organicTheme.colors.text.secondary,
    textAlign: 'center',
    letterSpacing: organicTheme.typography.letterSpacing.relaxed,
    lineHeight: 20,
  },
  contentStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
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
    ...organicTheme.shadows.floating[1],
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
    borderColor: organicTheme.colors.border.light,
  },
  babyListItemActive: {
    backgroundColor: organicTheme.colors.primary.pale,
    borderColor: organicTheme.colors.border.strong,
  },
  babyListItemName: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.medium,
    color: organicTheme.colors.text.primary,
  },
});
