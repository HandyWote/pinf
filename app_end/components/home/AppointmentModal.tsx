import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { theme } from '@/constants/theme';
import { formatDateString } from '@/utils/ageCalculator';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    clinic: string;
    department: string;
    scheduledAt: string;
    remindAt?: string;
    note?: string;
  }) => Promise<void>;
};

export const AppointmentModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [clinic, setClinic] = useState('');
  const [department, setDepartment] = useState('');
  const [note, setNote] = useState('');
  const [daysAhead, setDaysAhead] = useState('2');
  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 调试日志
  React.useEffect(() => {
    console.log('AppointmentModal visible:', visible);
  }, [visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clinic.trim()) newErrors.clinic = '请输入就诊机构';
    if (!department.trim()) newErrors.department = '请输入科室/医生';
    const num = Number(daysAhead);
    if (daysAhead && (Number.isNaN(num) || num < 0 || num > 30)) {
      newErrors.daysAhead = '提醒天数需在 0-30 之间';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const scheduled = new Date(scheduledAt);
      scheduled.setHours(9, 0, 0, 0);
      const remindNum = daysAhead.trim() ? Number(daysAhead) : null;
      const remindAt =
        remindNum !== null
          ? new Date(scheduled.getTime() - remindNum * 24 * 60 * 60 * 1000).setHours(9, 0, 0, 0)
          : null;
      await onSubmit({
        clinic: clinic.trim(),
        department: department.trim(),
        scheduledAt: scheduled.toISOString(),
        remindAt: remindAt ? new Date(remindAt).toISOString() : undefined,
        note: note.trim() || undefined,
      });
      onClose();
      setClinic('');
      setDepartment('');
      setNote('');
      setDaysAhead('2');
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
    if (date) setScheduledAt(date);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="添加预约" height="auto">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Input
            label="就诊机构"
            value={clinic}
            onChangeText={setClinic}
            placeholder="医院/社区卫生服务中心"
            required
            error={errors.clinic}
          />
          <Input
            label="科室/医生"
            value={department}
            onChangeText={setDepartment}
            placeholder="如 儿保科/张医生"
            required
            error={errors.department}
          />
          <View style={styles.row}>
            <Text style={styles.label}>就诊时间</Text>
            <Button
              title={`${formatDateString(scheduledAt)} 09:00`}
              onPress={() => setShowPicker(true)}
              variant="outline"
              size="medium"
            />
          </View>
          {showPicker && (
            <DateTimePicker
              value={scheduledAt}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
          <Input
            label="提前提醒（天）"
            value={daysAhead}
            onChangeText={setDaysAhead}
            placeholder="默认 2 天"
            keyboardType="number-pad"
            error={errors.daysAhead}
          />
          <Input
            label="备注"
            value={note}
            onChangeText={setNote}
            placeholder="携带材料、医生嘱托等"
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: '#D64545',
    fontSize: theme.fontSizes.xs,
  },
});
