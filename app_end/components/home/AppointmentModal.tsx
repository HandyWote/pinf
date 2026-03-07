"use no memo";

import React, { useEffect, useState } from 'react';
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { InlineDateTimePickerField } from '@/components/ui/InlineDateTimePickerField';
import { Input } from '@/components/ui/Input';
import { organicTheme } from '@/constants/theme';
import type { Appointment } from '@/types/appointment';
import { formatDateString } from '@/utils/ageCalculator';
import { toLocalDateTimePayload } from '@/utils/appointment';

type SubmitPayload = {
  clinic: string;
  department: string;
  scheduledAt: string;
  remindAt?: string;
  note?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: SubmitPayload) => Promise<void>;
  initialValues?: Appointment | null;
  title?: string;
  submitText?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;

const buildDefaultDate = () => {
  const next = new Date();
  next.setHours(DEFAULT_HOUR, DEFAULT_MINUTE, 0, 0);
  return next;
};

const formatTimeText = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const parseAppointmentDate = (value?: string) => {
  if (!value) return buildDefaultDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? buildDefaultDate() : parsed;
};

const parseDateAndTime = (dateText: string, timeText: string) => {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeText.trim());
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const AppointmentModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  title = '添加预约',
  submitText = '保存',
}) => {
  const [clinic, setClinic] = useState('');
  const [department, setDepartment] = useState('');
  const [note, setNote] = useState('');
  const [daysAhead, setDaysAhead] = useState('2');
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [pickerDate, setPickerDate] = useState<Date>(buildDefaultDate);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;

    const base = initialValues ? parseAppointmentDate(initialValues.scheduledAt) : buildDefaultDate();
    const remind = initialValues?.remindAt ? parseAppointmentDate(initialValues.remindAt) : null;
    const diffDays =
      remind === null
        ? ''
        : String(Math.max(0, Math.round((base.getTime() - remind.getTime()) / DAY_MS)));

    setClinic(initialValues?.clinic || '');
    setDepartment(initialValues?.department || '');
    setNote(initialValues?.note || '');
    setDaysAhead(diffDays || (initialValues ? '' : '2'));
    setDateText(formatDateString(base));
    setTimeText(formatTimeText(base));
    setPickerDate(base);
    setErrors({});
  }, [initialValues, visible]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!clinic.trim()) nextErrors.clinic = '请输入就诊机构';
    if (!department.trim()) nextErrors.department = '请输入科室或医生';
    if (!parseDateAndTime(dateText, timeText)) {
      nextErrors.scheduledAt = '请输入正确的日期和时间';
    }

    if (daysAhead.trim()) {
      const num = Number(daysAhead);
      if (Number.isNaN(num) || num < 0 || num > 30) {
        nextErrors.daysAhead = '提醒天数需在 0 到 30 之间';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const applyPickerDate = (selected?: Date) => {
    if (!selected) return;
    const next = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
      pickerDate.getHours(),
      pickerDate.getMinutes(),
      0,
      0
    );
    setPickerDate(next);
    setDateText(formatDateString(next));
  };

  const applyPickerTime = (selected?: Date) => {
    if (!selected) return;
    const next = new Date(
      pickerDate.getFullYear(),
      pickerDate.getMonth(),
      pickerDate.getDate(),
      selected.getHours(),
      selected.getMinutes(),
      0,
      0
    );
    setPickerDate(next);
    setTimeText(formatTimeText(next));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const scheduled = parseDateAndTime(dateText, timeText);
    if (!scheduled) {
      setErrors((prev) => ({ ...prev, scheduledAt: '请输入正确的日期和时间' }));
      return;
    }

    setLoading(true);
    try {
      const remindNum = daysAhead.trim() ? Number(daysAhead) : null;
      const remindAt =
        remindNum === null ? undefined : new Date(scheduled.getTime() - remindNum * DAY_MS);

      await onSubmit({
        clinic: clinic.trim(),
        department: department.trim(),
        scheduledAt: toLocalDateTimePayload(scheduled),
        remindAt: remindAt ? toLocalDateTimePayload(remindAt) : undefined,
        note: note.trim() || undefined,
      });

      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : '提交失败，请重试';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.closeText}>关闭</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <Input
                label="就诊机构"
                value={clinic}
                onChangeText={setClinic}
                placeholder="医院 / 社区卫生服务中心"
                required
                error={errors.clinic}
              />
              <Input
                label="科室 / 医生"
                value={department}
                onChangeText={setDepartment}
                placeholder="例如：儿保科 / 张医生"
                required
                error={errors.department}
              />
              <Input
                label="预约日期"
                value={dateText}
                onChangeText={setDateText}
                placeholder="YYYY-MM-DD"
                error={errors.scheduledAt}
                helperText="可直接输入，也可使用下方按钮选择"
              />
              <Input
                label="预约时间"
                value={timeText}
                onChangeText={setTimeText}
                placeholder="HH:mm"
                error={errors.scheduledAt}
              />
              <View style={styles.datetimeRow}>
                <InlineDateTimePickerField
                  buttonTitle="选择日期"
                  mode="date"
                  value={pickerDate}
                  onConfirm={applyPickerDate}
                  containerStyle={styles.datetimeButton}
                />
                <InlineDateTimePickerField
                  buttonTitle="选择时间"
                  mode="time"
                  value={pickerDate}
                  onConfirm={applyPickerTime}
                  is24Hour
                  containerStyle={styles.datetimeButton}
                />
              </View>
              <Input
                label="提前提醒（天）"
                value={daysAhead}
                onChangeText={setDaysAhead}
                placeholder="留空则不提醒"
                keyboardType="number-pad"
                error={errors.daysAhead}
                helperText="例如输入 3，表示预约前 3 天提醒"
              />
              <Input
                label="备注"
                value={note}
                onChangeText={setNote}
                placeholder="需要携带的材料、注意事项等"
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
              {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
              <Button title={submitText} onPress={handleSubmit} loading={loading} disabled={loading} />
            </View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: organicTheme.colors.background.paper,
    borderTopLeftRadius: organicTheme.shapes.borderRadius.soft,
    borderTopRightRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    paddingTop: organicTheme.spacing.xl,
    paddingHorizontal: organicTheme.spacing.lg,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: organicTheme.spacing.md,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  closeText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
  },
  scrollContent: {
    paddingBottom: organicTheme.spacing.lg,
  },
  form: {
    gap: organicTheme.spacing.sm,
  },
  datetimeRow: {
    flexDirection: 'row',
    gap: organicTheme.spacing.sm,
    marginBottom: organicTheme.spacing.md,
  },
  datetimeButton: {
    flex: 1,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  error: {
    color: '#D64545',
    fontSize: organicTheme.typography.fontSize.xs,
  },
});
