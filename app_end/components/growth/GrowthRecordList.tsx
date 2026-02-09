/**
 * GrowthRecordList - 成长记录列表组件
 * 显示按月排序的成长记录，支持编辑和删除
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { theme } from '@/constants/theme';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDateString } from '@/utils/ageCalculator';
import type { GrowthRecord, GrowthMetric } from '@/types/growth';

interface GrowthRecordListProps {
  records: GrowthRecord[];
  loading?: boolean;
  onUpdate?: (id: number, data: Partial<GrowthRecord>) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onRefresh?: () => void;
}

const METRIC_META: Record<GrowthMetric, { label: string; unit: string }> = {
  weight: { label: '体重', unit: 'kg' },
  height: { label: '身高', unit: 'cm' },
  head: { label: '头围', unit: 'cm' },
};

export const GrowthRecordList: React.FC<GrowthRecordListProps> = ({
  records,
  loading = false,
  onUpdate,
  onDelete,
  onRefresh,
}) => {
  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 按指标分组记录
  const groupedRecords = React.useMemo(() => {
    const groups: Record<GrowthMetric, GrowthRecord[]> = {
      weight: [],
      height: [],
      head: [],
    };

    records.forEach(record => {
      groups[record.metric].push(record);
    });

    // 每组按时间倒序
    Object.keys(groups).forEach(key => {
      groups[key as GrowthMetric].sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
    });

    return groups;
  }, [records]);

  const handleEdit = (record: GrowthRecord) => {
    setEditingRecord(record);
    setEditValue(String(record.value));
    setEditNote(record.note || '');
    setEditDate(new Date(record.recordedAt));
    setEditModalVisible(true);
  };

  const handleDelete = (record: GrowthRecord) => {
    Alert.alert(
      '删除记录',
      `确定要删除这条${METRIC_META[record.metric].label}记录吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => onDelete?.(record.id),
        },
      ]
    );
  };

  const handleSubmitEdit = async () => {
    if (!editingRecord || !onUpdate) return;

    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('错误', '请输入有效的数值');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdate(editingRecord.id, {
        value: numValue,
        note: editNote.trim() || undefined,
        recordedAt: editDate.toISOString(),
      });
      setEditModalVisible(false);
      setEditingRecord(null);
      setEditValue('');
      setEditNote('');
    } catch {
      Alert.alert('错误', '更新记录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) setEditDate(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDateString(date);
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.title}>成长记录</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={loading}>
            <Text style={[styles.refreshText, loading && styles.refreshTextDisabled]}>
              {loading ? '加载中...' : '刷新'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>暂无成长记录</Text>
          <Text style={styles.emptyHint}>点击下方&ldquo;添加记录&rdquo;开始记录宝宝成长</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {(Object.keys(METRIC_META) as GrowthMetric[]).map((metric) => {
            const metricRecords = groupedRecords[metric];
            if (metricRecords.length === 0) return null;

            return (
              <View key={metric} style={styles.metricSection}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricTitle}>
                    {METRIC_META[metric].label} ({metricRecords.length}条)
                  </Text>
                </View>

                {metricRecords.map((record) => (
                  <View key={record.id} style={styles.recordCard}>
                    <View style={styles.recordMain}>
                      <View style={styles.recordInfo}>
                        <View style={styles.recordValueRow}>
                          <Text style={styles.recordValue}>
                            {record.value}
                            <Text style={styles.recordUnit}> {METRIC_META[metric].unit}</Text>
                          </Text>
                          <Text style={styles.recordDate}>{formatDate(record.recordedAt)}</Text>
                        </View>
                        {record.note && (
                          <Text style={styles.recordNote}>{record.note}</Text>
                        )}
                      </View>

                      <View style={styles.recordActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEdit(record)}
                        >
                          <Text style={styles.actionButtonText}>编辑</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDelete(record)}
                        >
                          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>删除</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* 编辑弹窗 */}
      <Modal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title={`编辑${editingRecord ? METRIC_META[editingRecord.metric].label : ''}记录`}
        height="auto"
      >
        <ScrollView contentContainerStyle={styles.editForm} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {editingRecord ? METRIC_META[editingRecord.metric].label : '数值'}
            </Text>
            <Input
              value={editValue}
              onChangeText={setEditValue}
              placeholder="请输入数值"
              keyboardType="decimal-pad"
              style={styles.formInput}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>记录日期</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDateString(editDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={editDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>


          <View style={styles.formActions}>
            <Button
              title="取消"
              variant="outline"
              onPress={() => setEditModalVisible(false)}
              style={styles.formButton}
            />
            <Button
              title="保存"
              onPress={handleSubmitEdit}
              loading={submitting}
              disabled={submitting}
              style={styles.formButton}
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  refreshText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  refreshTextDisabled: {
    color: theme.colors.textSub,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    gap: theme.spacing.md,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSub,
  },
  emptyHint: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
    textAlign: 'center',
  },
  metricSection: {
    gap: theme.spacing.sm,
  },
  metricHeader: {
    paddingVertical: theme.spacing.xs,
  },
  metricTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  recordCard: {
    backgroundColor: theme.colors.bgContent,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
  },
  recordMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  recordValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.sm,
  },
  recordValue: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  recordUnit: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  recordDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  recordNote: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
    fontStyle: 'italic',
  },
  recordActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.primaryLight,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#D32F2F',
  },
  editForm: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  formGroup: {
    gap: theme.spacing.xs,
  },
  formLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  formInput: {
    backgroundColor: theme.colors.bgContent,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgContent,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMain,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  formButton: {
    flex: 1,
  },
});
