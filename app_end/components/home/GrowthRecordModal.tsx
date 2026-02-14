import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { theme } from '@/constants/theme';
import type { CreateGrowthInput } from '@/types/growth';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payloads: CreateGrowthInput[]) => Promise<void>;
};

export const GrowthRecordModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const [recordedAt, setRecordedAt] = useState(new Date());
  const [tempRecordedAt, setTempRecordedAt] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickerError, setPickerError] = useState('');
  const [webDateText, setWebDateText] = useState('');

  const formatDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateText = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const toLocalNoonIso = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(12, 0, 0, 0);
    return normalized.toISOString();
  };

  const buildPayloads = (): CreateGrowthInput[] => {
    const list: CreateGrowthInput[] = [];
    if (weight.trim()) {
      list.push({
        metric: 'weight',
        value: Number(weight),
        unit: 'kg',
        recordedAt: toLocalNoonIso(recordedAt),
        note: note.trim() || undefined,
      });
    }
    if (height.trim()) {
      list.push({
        metric: 'height',
        value: Number(height),
        unit: 'cm',
        recordedAt: toLocalNoonIso(recordedAt),
        note: note.trim() || undefined,
      });
    }
    if (head.trim()) {
      list.push({
        metric: 'head',
        value: Number(head),
        unit: 'cm',
        recordedAt: toLocalNoonIso(recordedAt),
        note: note.trim() || undefined,
      });
    }
    return list;
  };

  const validate = () => {
    const payloads = buildPayloads();
    const newErrors: Record<string, string> = {};
    if (payloads.length === 0) {
      newErrors.form = '请至少填写一项数据';
    }
    if (weight && Number.isNaN(Number(weight))) newErrors.weight = '请输入数字';
    if (height && Number.isNaN(Number(height))) newErrors.height = '请输入数字';
    if (head && Number.isNaN(Number(head))) newErrors.head = '请输入数字';
    setErrors(newErrors);
    return { ok: Object.keys(newErrors).length === 0, payloads };
  };

  const handleSubmit = async () => {
    const { ok, payloads } = validate();
    if (!ok) return;
    setLoading(true);
    try {
      await onSubmit(payloads);
      onClose();
      setWeight('');
      setHeight('');
      setHead('');
      setNote('');
      setRecordedAt(new Date());
      setTempRecordedAt(new Date());
    } catch {
      setErrors({ form: '提交失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const openPicker = () => {
    setTempRecordedAt(recordedAt);
    setWebDateText(formatDateText(recordedAt));
    setPickerError('');
    setShowPicker(true);
  };

  const handleDateOnlyChange = (_event: any, date?: Date) => {
    if (!date) return;
    setTempRecordedAt((prev) => {
      const next = new Date(prev);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      return next;
    });
  };

  const handleConfirmPicker = () => {
    if (Platform.OS === 'web') {
      const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
      const dateMatch = webDateText.match(datePattern);
      if (!dateMatch) {
        setPickerError('请输入正确格式：日期 YYYY-MM-DD');
        return;
      }

      const year = Number(dateMatch[1]);
      const month = Number(dateMatch[2]);
      const day = Number(dateMatch[3]);
      const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);

      if (
        Number.isNaN(parsed.getTime()) ||
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
      ) {
        setPickerError('日期无效，请检查后重试');
        return;
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (parsed.getTime() > today.getTime()) {
        setPickerError('记录日期不能晚于今天');
        return;
      }

      setRecordedAt(parsed);
      setShowPicker(false);
      setPickerError('');
      return;
    }

    setRecordedAt(tempRecordedAt);
    setShowPicker(false);
    setPickerError('');
  };

  return (
    <>
      <Modal visible={visible} onClose={onClose} title="添加成长记录" height="auto">
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Input
              label="体重 (kg)"
              value={weight}
              onChangeText={setWeight}
              placeholder="示例：3.2"
              keyboardType="decimal-pad"
              error={errors.weight}
            />
            <Input
              label="身高 (cm)"
              value={height}
              onChangeText={setHeight}
              placeholder="示例：52"
              keyboardType="decimal-pad"
              error={errors.height}
            />
            <Input
              label="头围 (cm)"
              value={head}
              onChangeText={setHead}
              placeholder="示例：34"
              keyboardType="decimal-pad"
              error={errors.head}
            />

            <View style={styles.dateRow}>
              <Text style={styles.label}>记录日期（可补录）</Text>
              <Button
                title={formatDateTime(recordedAt)}
                onPress={openPicker}
                variant="outline"
                size="medium"
              />
            </View>

            {errors.form && <Text style={styles.error}>{errors.form}</Text>}

            <Button title="保存" onPress={handleSubmit} loading={loading} disabled={loading} />
          </View>
        </ScrollView>
      </Modal>

      <Modal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        title="选择记录时间"
        height="auto"
      >
        <View style={styles.pickerPanel}>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={tempRecordedAt}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={handleDateOnlyChange}
              style={styles.iosPicker}
            />
          ) : Platform.OS === 'web' ? (
            <View style={styles.webPickers}>
              <Input
                label="日期（YYYY-MM-DD）"
                value={webDateText}
                onChangeText={setWebDateText}
                placeholder="例如 2026-02-13"
              />
            </View>
          ) : (
            <View style={styles.androidPickers}>
              <Text style={styles.pickerLabel}>日期</Text>
              <DateTimePicker
                value={tempRecordedAt}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={handleDateOnlyChange}
              />
            </View>
          )}
          {pickerError ? <Text style={styles.error}>{pickerError}</Text> : null}

          <View style={styles.pickerActions}>
            <Button
              title="取消"
              variant="text"
              size="medium"
              onPress={() => {
                setShowPicker(false);
                setPickerError('');
              }}
            />
            <Button title="确认" size="medium" onPress={handleConfirmPicker} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  error: {
    color: '#D64545',
    fontSize: theme.fontSizes.xs,
  },
  pickerPanel: {
    gap: theme.spacing.md,
  },
  iosPicker: {
    alignSelf: 'stretch',
  },
  androidPickers: {
    gap: theme.spacing.sm,
  },
  webPickers: {
    gap: theme.spacing.sm,
  },
  pickerLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});
