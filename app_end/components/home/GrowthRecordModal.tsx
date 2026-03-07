import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InlineDateTimePickerField } from '@/components/ui/InlineDateTimePickerField';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDateTime = (date: Date) => {
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
    } catch {
      setErrors({ form: '提交失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <InlineDateTimePickerField
              buttonTitle={formatDateTime(recordedAt)}
              mode="date"
              value={recordedAt}
              maximumDate={new Date()}
              onConfirm={(selected) => {
                const next = new Date(recordedAt);
                next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                setRecordedAt(next);
              }}
            />
          </View>

          {errors.form && <Text style={styles.error}>{errors.form}</Text>}

          <Button title="保存" onPress={handleSubmit} loading={loading} disabled={loading} />
        </View>
      </ScrollView>
    </Modal>
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
});
