/**
 * BabyForm 组件
 * 用于创建和编辑宝宝信息的表单
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { theme } from '@/constants/theme';
import type { Baby, CreateBabyInput, UpdateBabyInput } from '@/types/baby';
import { formatDateString, isValidDateString } from '@/utils/ageCalculator';

interface BabyFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBabyInput | UpdateBabyInput) => Promise<void>;
  initialData?: Baby;
  mode?: 'create' | 'edit';
}

export const BabyForm: React.FC<BabyFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: BabyFormProps) => {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [gestationalWeeks, setGestationalWeeks] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 日期选择器状态
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [tempBirthday, setTempBirthday] = useState(new Date());
  const [tempDueDate, setTempDueDate] = useState(new Date());

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name);
        setBirthday(initialData.birthday);
        setDueDate(initialData.dueDate || '');
        setGestationalWeeks(initialData.gestationalWeeks?.toString() || '');
        setNote(initialData.note || '');
        
        if (initialData.birthday) {
          setTempBirthday(new Date(initialData.birthday));
        }
        if (initialData.dueDate) {
          setTempDueDate(new Date(initialData.dueDate));
        }
      } else {
        // 重置表单
        setName('');
        setBirthday('');
        setDueDate('');
        setGestationalWeeks('');
        setNote('');
        setTempBirthday(new Date());
        setTempDueDate(new Date());
      }
      setErrors({});
    }
  }, [visible, initialData]);

  // 验证表单
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '请输入宝宝姓名';
    }

    if (!birthday) {
      newErrors.birthday = '请选择出生日期';
    } else if (!isValidDateString(birthday)) {
      newErrors.birthday = '日期格式错误';
    }

    if (dueDate && !isValidDateString(dueDate)) {
      newErrors.dueDate = '预产期格式错误';
    }

    if (gestationalWeeks) {
      const weeks = parseInt(gestationalWeeks, 10);
      if (isNaN(weeks) || weeks < 20 || weeks > 45) {
        newErrors.gestationalWeeks = '孕周需在 20-45 之间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data: CreateBabyInput | UpdateBabyInput = {
        name: name.trim(),
        birthday,
        dueDate: dueDate || undefined,
        gestationalWeeks: gestationalWeeks ? parseInt(gestationalWeeks, 10) : undefined,
        note: note.trim() || undefined,
      };

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to submit baby form:', error);
      setErrors({ submit: '操作失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  // 处理日期选择
  const handleBirthdayChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowBirthdayPicker(false);
    }
    
    if (selectedDate) {
      setTempBirthday(selectedDate);
      setBirthday(formatDateString(selectedDate));
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDueDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDueDate(selectedDate);
      setDueDate(formatDateString(selectedDate));
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? '添加宝宝信息' : '编辑宝宝信息'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Input
          label="宝宝姓名"
          value={name}
          onChangeText={setName}
          placeholder="请输入宝宝姓名"
          error={errors.name}
          required
          containerStyle={styles.inputContainer}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            出生日期 <Text style={styles.required}>*</Text>
          </Text>
          <Button
            title={birthday || '请选择出生日期'}
            onPress={() => setShowBirthdayPicker(true)}
            variant="outline"
            size="medium"
          />
          {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}
        </View>

        {showBirthdayPicker && (
          <DateTimePicker
            value={tempBirthday}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleBirthdayChange}
          />
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>早产儿信息（可选）</Text>
        <Text style={styles.helperText}>如果宝宝是早产儿，填写以下信息可计算矫正月龄</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>预产期</Text>
          <Button
            title={dueDate || '请选择预产期'}
            onPress={() => setShowDueDatePicker(true)}
            variant="outline"
            size="medium"
          />
          {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
        </View>

        {showDueDatePicker && (
          <DateTimePicker
            value={tempDueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDueDateChange}
          />
        )}

        <Input
          label="出生孕周"
          value={gestationalWeeks}
          onChangeText={setGestationalWeeks}
          placeholder="例如：34"
          keyboardType="numeric"
          error={errors.gestationalWeeks}
          helperText="正常范围 20-45 周"
          containerStyle={styles.inputContainer}
        />

        <View style={styles.divider} />

        <Input
          label="备注"
          value={note}
          onChangeText={setNote}
          placeholder="其他需要记录的信息..."
          multiline
          numberOfLines={3}
          containerStyle={styles.inputContainer}
        />

        {errors.submit && (
          <Text style={[styles.errorText, styles.submitError]}>{errors.submit}</Text>
        )}

        <Button
          title={mode === 'create' ? '保存并同步' : '保存修改'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.accent,
  },
  errorText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.sm,
  },
  helperText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
    marginBottom: theme.spacing.lg,
  },
  submitError: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});
