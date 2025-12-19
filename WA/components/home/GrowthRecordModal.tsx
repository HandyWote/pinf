import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { theme } from '@/constants/theme';
import type { GrowthMetric } from '@/types/growth';
import { formatDateString } from '@/utils/ageCalculator';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payloads: Array<{ metric: GrowthMetric; value: number; unit: string; recordedAt: string; note?: string }>) => Promise<void>;
};

export const GrowthRecordModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const [recordedAt, setRecordedAt] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buildPayloads = () => {
    const list: Array<{ metric: GrowthMetric; value: number; unit: string; recordedAt: string; note?: string }> = [];
    if (weight.trim()) {
      list.push({
        metric: 'weight',
        value: Number(weight),
        unit: 'kg',
        recordedAt: recordedAt.toISOString(),
        note: note.trim() || undefined,
      });
    }
    if (height.trim()) {
      list.push({
        metric: 'height',
        value: Number(height),
        unit: 'cm',
        recordedAt: recordedAt.toISOString(),
        note: note.trim() || undefined,
      });
    }
    if (head.trim()) {
      list.push({
        metric: 'head',
        value: Number(head),
        unit: 'cm',
        recordedAt: recordedAt.toISOString(),
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
    } catch (error) {
      setErrors({ form: '提交失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (date) setRecordedAt(date);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="添加成长记录" height="auto">
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
          <Text style={styles.label}>记录时间</Text>
          <Button
            title={formatDateString(recordedAt)}
            onPress={() => setShowPicker(true)}
            variant="outline"
            size="medium"
          />
        </View>
        {showPicker && (
          <DateTimePicker
            value={recordedAt}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <Input
          label="备注"
          value={note}
          onChangeText={setNote}
          placeholder="医生建议、特殊情况等"
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />

        {errors.form && <Text style={styles.error}>{errors.form}</Text>}

        <Button title="保存" onPress={handleSubmit} loading={loading} disabled={loading} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});
