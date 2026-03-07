import React, { useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { theme } from '@/constants/theme';
import { Button } from './Button';
import { resolvePickerChange, type DateTimePickerEventLike } from './dateTimeFieldState';

type Props = {
  buttonTitle: string;
  mode: 'date' | 'time';
  value: Date;
  onConfirm: (selected: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  is24Hour?: boolean;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
};

export const InlineDateTimePickerField: React.FC<Props> = ({
  buttonTitle,
  mode,
  value,
  onConfirm,
  maximumDate,
  minimumDate,
  is24Hour = false,
  containerStyle,
  buttonStyle,
}) => {
  const [visible, setVisible] = useState(false);

  const handleChange = (event: DateTimePickerEventLike, selected?: Date) => {
    const { shouldClose, shouldApply } = resolvePickerChange({
      platform: Platform.OS,
      event,
      selected,
    });

    if (shouldClose) {
      setVisible(false);
    }

    if (shouldApply && selected) {
      onConfirm(selected);
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Button
        title={buttonTitle}
        onPress={() => setVisible(true)}
        variant="outline"
        size="medium"
        style={buttonStyle}
      />
      {visible ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={is24Hour}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
});
