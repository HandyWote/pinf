import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
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
import { GrowthRecordModal } from '@/components/home/GrowthRecordModal';
import { AppointmentModal } from '@/components/home/AppointmentModal';
import { BabyForm, Button, ListItem, Modal } from '@/components/ui';
import { theme } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/store';
import { useBabyStore } from '@/store/babyStore';
import { useGrowthStore } from '@/store/growthStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { calculateBabyAge, formatDetailedAge } from '@/utils/ageCalculator';
import type { CreateBabyInput, UpdateBabyInput } from '@/types/baby';
import type { GrowthRecord } from '@/types/growth';
import type { Appointment } from '@/types/appointment';
import * as contentApi from '@/services/api/content';
import type { ContentArticle } from '@/types/content';

export default function HomeScreen() {
  const { logout } = useAuthStore();
  const {
    babies,
    currentBaby,
    fetchBabies,
    createBaby,
    updateBaby,
    deleteBaby,
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
  const [contentItems, setContentItems] = useState<ContentArticle[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const {
    records,
    loading: growthLoading,
    error: growthError,
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

  // 初始化：加载宝宝列表已在 _layout.tsx 中通过 initializeBabies() 处理
  // 选中宝宝后加载成长记录
  useEffect(() => {
    if (currentBaby?.id) {
      fetchGrowth(currentBaby.id).catch(() => {});
    }
  }, [currentBaby?.id, fetchGrowth]);

  // 加载预约数据（全量，页面过滤）- 已登录用户
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments().catch(() => {});
    }
  }, [fetchAppointments, isAuthenticated]);

  const fetchContentPreview = useCallback(async () => {
    setContentLoading(true);
    setContentError(null);
    try {
      const res = await contentApi.listArticles({ page: 1, per_page: 5 });
      setContentItems(res.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取内容失败';
      setContentError(message);
    } finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentPreview();
  }, [fetchContentPreview]);

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

  const handleCreateBaby = async (data: CreateBabyInput | UpdateBabyInput) => {
    try {
      await createBaby(data as CreateBabyInput);
      Alert.alert('成功', '宝宝信息已保存');
    } catch (error) {
      Alert.alert('失败', '保存失败，请重试');
    }
  };

  const handleUpdateBaby = async (data: CreateBabyInput | UpdateBabyInput) => {
    if (!editingBabyId) return;
    try {
      await updateBaby(editingBabyId, data);
      Alert.alert('成功', '宝宝信息已更新');
    } catch (error) {
      Alert.alert('失败', '更新失败，请重试');
    }
  };

  const handleDeleteBaby = (babyId: number) => {
    Alert.alert('删除宝宝', '确定要删除该宝宝信息吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBaby(babyId);
            await fetchBabies();
            Alert.alert('成功', '宝宝信息已删除');
          } catch (error) {
            Alert.alert('失败', '删除失败，请重试');
          }
        },
      },
    ]);
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

  const handleOpenEditForm = (babyId: number) => {
    setFormMode('edit');
    setEditingBabyId(babyId);
    setShowBabyList(false);
    setShowBabyForm(true);
  };

  const handleAddGrowth = async (payloads: Parameters<typeof addGrowth>[1]) => {
    if (!currentBaby?.id) return;
    await addGrowth(currentBaby.id, payloads);
    setShowGrowthModal(false);
  };

  const handleOpenGrowthModal = () => {
    console.log('Opening growth modal, currentBaby:', currentBaby);
    setShowGrowthModal(true);
  };

  const handleOpenAppointmentModal = () => {
    console.log('Opening appointment modal, currentBaby:', currentBaby);
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
      await fetchContentPreview();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 计算当前宝宝的年龄信息
  const ageInfo = currentBaby ? calculateBabyAge(currentBaby) : null;
  const ageDisplay = ageInfo ? formatDetailedAge(ageInfo) : null;

  const listHeight = Dimensions.get('window').height * 0.4;

  const editingBaby = editingBabyId
    ? babies.find((baby) => baby.id === editingBabyId)
    : undefined;

  const currentGrowth = currentBaby?.id ? records[currentBaby.id] || [] : [];
  const filteredAppointments = useMemo(() => {
    if (!currentBaby) return appointments;
    return appointments.filter((item) => item.baby?.id === currentBaby.id);
  }, [appointments, currentBaby]);

  const contentStripItems = useMemo(
    () =>
      contentItems.map((item) => ({
        id: String(item.id),
        title: item.title,
        tag: item.category || item.tags?.[0] || undefined,
      })),
    [contentItems]
  );

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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.statusSpacer} />
        {isLoading && !isRefreshing && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchBabies}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.headerRow}>
          {currentBaby && ageDisplay ? (
            <BabySwitcher
              name={currentBaby.name}
              ageText={ageDisplay.mainText}
              note={ageDisplay.detailText}
              onPress={handleBabySwitcherPress}
            />
          ) : (
            <TouchableOpacity onPress={handleOpenCreateForm} style={styles.addBabyButton}>
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
            {
              id: 'growth',
              title: '成长曲线',
              icon: 'chart.bar.fill',
              tint: '#FADCD9',
              onPress: () => router.push('/growth'),
            },
            {
              id: 'appointment',
              title: '复诊提醒',
              icon: 'calendar',
              tint: '#E0E8F6',
              onPress: () => router.push('/appointments'),
            },
            { id: 'record', title: '病历夹', icon: 'folder.fill', tint: '#DDF1EB' },
            { id: 'assess', title: '发育评估', icon: 'rectangle.stack.fill', tint: '#F0E6FF' },
          ]}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近期复诊</Text>
          <TouchableOpacity onPress={handleOpenAppointmentModal}>
            <Text style={styles.sectionAction}>添加+</Text>
          </TouchableOpacity>
        </View>
        {appointmentLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>加载预约中...</Text>
          </View>
        ) : appointmentError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{appointmentError}</Text>
            <TouchableOpacity onPress={fetchAppointments}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyText}>暂无预约</Text>
            <Button title="添加预约" onPress={handleOpenAppointmentModal} />
          </View>
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
            const statusVariant =
              item.status === 'pending' ? 'accent' : item.status === 'completed' ? 'muted' : 'primary';
            return (
              <AppointmentCard
                key={item.id}
                clinic={item.clinic}
                department={item.department}
                dateText={item.scheduledAt}
                dateDay={dateDay}
                dateMonth={dateMonth}
                remindText={item.remindAt ? '已设置提醒' : '未设置提醒'}
                statusLabel={statusLabel}
                statusVariant={statusVariant}
              />
            );
          })
        )}

        <GrowthCard
          records={currentGrowth}
          loading={growthLoading}
          error={growthError}
          onAdd={handleOpenGrowthModal}
          onRefresh={currentBaby?.id ? () => fetchGrowth(currentBaby.id) : undefined}
        />

        <ContentStrip
          title="内容课堂"
          items={contentStripItems}
          onPressItem={(item) => router.push(`/class-article/${item.id}`)}
        />
        {contentLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>加载内容中...</Text>
          </View>
        )}
        {contentError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{contentError}</Text>
            <TouchableOpacity onPress={fetchContentPreview}>
              <Text style={styles.errorRetry}>重试</Text>
            </TouchableOpacity>
          </View>
        )}
        {!contentLoading && !contentError && contentStripItems.length === 0 && (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyText}>暂无内容</Text>
            <Button title="去课堂" onPress={() => router.push('/class')} />
          </View>
        )}
      </ScrollView>

      <FloatingActionButton label="记录" icon="+" />
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
        height={listHeight}
        position="top"
      >
        <View style={styles.babyListContainer}>
          {babies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无宝宝信息</Text>
              <Button title="添加宝宝" onPress={handleOpenCreateForm} variant="primary" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.babyList} showsVerticalScrollIndicator={false}>
              {babies.map((baby) => (
                <ListItem
                  key={baby.id}
                  title={`${baby.name}（${baby.gender || '未知'}）`}
                  subtitle={`出生日期：${baby.birthday}`}
                  onPress={() => {
                    selectBaby(baby.id);
                    setShowBabyList(false);
                  }}
                  rightContent={
                    <View style={styles.babyActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOpenEditForm(baby.id)}
                      >
                        <Text style={styles.actionText}>编辑</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionDelete]}
                        onPress={() => handleDeleteBaby(baby.id)}
                      >
                        <Text style={[styles.actionText, styles.actionDeleteText]}>删除</Text>
                      </TouchableOpacity>
                    </View>
                  }
                  style={
                    currentBaby?.id === baby.id
                      ? styles.babyItemActive
                      : undefined
                  }
                />
              ))}
            </ScrollView>
          )}

          {babies.length > 0 && (
            <View style={styles.addBabyFooter}>
              <Button title="添加宝宝" onPress={handleOpenCreateForm} variant="primary" />
            </View>
          )}
        </View>
      </Modal>
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#FDECEA',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    marginBottom: theme.spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: '#D64545',
  },
  errorRetry: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '700',
    paddingLeft: theme.spacing.sm,
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
  babyListContainer: {
    flex: 1,
  },
  babyList: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  babyItemActive: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  babyActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.mutedBg,
  },
  actionText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  actionDelete: {
    backgroundColor: '#FDECEA',
  },
  actionDeleteText: {
    color: '#D64545',
  },
  addBabyFooter: {
    paddingVertical: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  emptyStateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
});
