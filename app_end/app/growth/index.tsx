import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GrowthRecordModal } from '@/components/home';
import { useBabyStore } from '@/store/babyStore';
import { useGrowthStore } from '@/store/growthStore';
import { organicTheme } from '@/constants/theme';
import { GrowthChart, GrowthRecordList } from '@/components/growth';
import type { GrowthMetric } from '@/types/growth';

type ViewMode = 'chart' | 'list';

export default function GrowthPage() {
  const router = useRouter();
  const { currentBaby } = useBabyStore();
  const { records, fetch, add, update, remove, loading } = useGrowthStore();
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [metric, setMetric] = useState<GrowthMetric>('weight');
  const [ageType, setAgeType] = useState<'actual' | 'corrected'>('actual');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentBaby?.id) {
      fetch(currentBaby.id).catch(() => {});
    }
  }, [currentBaby?.id, fetch]);

  const currentRecords = currentBaby?.id ? records[currentBaby.id] || [] : [];

  const isPremature = currentBaby
    ? (currentBaby.gestationalWeeks && currentBaby.gestationalWeeks < 37) || !!currentBaby.dueDate
    : false;

  const handleSubmit = async (payloads: Parameters<typeof add>[1]) => {
    if (!currentBaby?.id) return;
    await add(currentBaby.id, payloads);
    setShowModal(false);
  };

  const handleUpdateRecord = async (id: number, data: Parameters<typeof update>[1]) => {
    await update(id, data);
  };

  const handleDeleteRecord = async (id: number) => {
    if (!currentBaby?.id) return;
    await remove(id, currentBaby.id);
  };

  const handleRefresh = async () => {
    if (!currentBaby?.id) return;
    setIsRefreshing(true);
    try {
      await fetch(currentBaby.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={organicTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>成长曲线</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <IconSymbol size={20} name="arrow.clockwise" color={organicTheme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={organicTheme.colors.primary.main}
            colors={[organicTheme.colors.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {!currentBaby ? (
          <View style={styles.centerBox}>
            <IconSymbol size={48} name="figure.child" color={organicTheme.colors.text.secondary} />
            <Text style={styles.centerText}>请先添加或选择宝宝</Text>
          </View>
        ) : (
          <>
            {/* 宝宝信息卡片 */}
            <View style={styles.babyCard}>
              <Text style={styles.babyName}>{currentBaby.name}</Text>
              <Text style={styles.babyMeta}>
                {currentBaby.gender === '男' ? '男宝宝' : '女宝宝'}
                {isPremature && ' • 早产儿'}
              </Text>
            </View>

            {/* 视图切换 */}
            <View style={styles.viewSwitch}>
              <TouchableOpacity
                style={[styles.viewTab, viewMode === 'chart' && styles.viewTabActive]}
                onPress={() => setViewMode('chart')}
              >
                <IconSymbol size={18} name="chart.line.uptrend.xyaxis" color={viewMode === 'chart' ? organicTheme.colors.primary.main : organicTheme.colors.text.secondary} />
                <Text style={[styles.viewTabText, viewMode === 'chart' && styles.viewTabTextActive]}>
                  曲线图
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewTab, viewMode === 'list' && styles.viewTabActive]}
                onPress={() => setViewMode('list')}
              >
                <IconSymbol size={18} name="list.bullet" color={viewMode === 'list' ? organicTheme.colors.primary.main : organicTheme.colors.text.secondary} />
                <Text style={[styles.viewTabText, viewMode === 'list' && styles.viewTabTextActive]}>
                  记录列表
                </Text>
              </TouchableOpacity>
            </View>

            {/* 内容区域 */}
            {viewMode === 'chart' ? (
              <GrowthChart
                baby={currentBaby}
                metric={metric}
                records={currentRecords}
                ageType={ageType}
                onMetricChange={setMetric}
                onAgeTypeChange={isPremature ? setAgeType : undefined}
                loading={loading}
              />
            ) : (
              <GrowthRecordList
                records={currentRecords}
                loading={loading}
                onUpdate={handleUpdateRecord}
                onDelete={handleDeleteRecord}
                onRefresh={handleRefresh}
              />
            )}

            {/* 添加记录按钮 */}
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Text style={styles.addButtonText}>+ 添加成长记录</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* 添加记录弹窗 */}
      <GrowthRecordModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: organicTheme.colors.background.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: organicTheme.spacing.lg,
    paddingTop: 44,
    paddingBottom: organicTheme.spacing.md,
    backgroundColor: organicTheme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: organicTheme.colors.primary.pale,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: organicTheme.spacing.lg,
    paddingBottom: 100,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: organicTheme.spacing['2xl'],
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: organicTheme.spacing.md,
  },
  centerText: {
    fontSize: organicTheme.typography.fontSize.md,
    color: organicTheme.colors.text.secondary,
  },
  babyCard: {
    backgroundColor: organicTheme.colors.background.paper,
    padding: organicTheme.spacing.lg,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    marginBottom: organicTheme.spacing.md,
  },
  babyName: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
  },
  babyMeta: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  viewSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: organicTheme.shapes.borderRadius.soft,
    padding: organicTheme.spacing.xs,
    marginBottom: organicTheme.spacing.md,
    gap: organicTheme.spacing.xs,
  },
  viewTab: {
    flex: 1,
    paddingVertical: organicTheme.spacing.sm,
    alignItems: 'center',
    borderRadius: organicTheme.shapes.borderRadius.cozy,
  },
  viewTabActive: {
    backgroundColor: organicTheme.colors.background.paper,
  },
  viewTabText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  viewTabTextActive: {
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  addButton: {
    backgroundColor: organicTheme.colors.primary.main,
    paddingVertical: organicTheme.spacing.md,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    alignItems: 'center',
    marginTop: organicTheme.spacing.md,
    ...organicTheme.shadows.soft[0],
  },
  addButtonText: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
