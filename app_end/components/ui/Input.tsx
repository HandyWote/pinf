/**
 * Input 组件
 * 基于应用原型设计的输入框组件
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { organicTheme } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  required,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const renderIcon = (icon: React.ReactNode) => {
    if (typeof icon === 'string' || typeof icon === 'number') {
      return <Text style={styles.iconText}>{icon}</Text>;
    }
    return icon;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{renderIcon(leftIcon)}</View>}
        
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeftIcon : null]}
          placeholderTextColor={organicTheme.colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity style={styles.rightIcon}>
            {renderIcon(rightIcon)}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: organicTheme.spacing.md,
  },
  label: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
    marginBottom: organicTheme.spacing.xs,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  required: {
    color: '#C54A4A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
  },
  inputContainerFocused: {
    borderColor: organicTheme.colors.border.strong,
  },
  inputContainerError: {
    borderColor: organicTheme.colors.border.danger,
  },
  input: {
    flex: 1,
    padding: organicTheme.spacing.md,
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  leftIcon: {
    paddingLeft: organicTheme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    paddingRight: organicTheme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: organicTheme.typography.fontSize.sm,
  },
  errorText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: '#C54A4A',
    marginTop: organicTheme.spacing.xs,
  },
  helperText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
    marginTop: organicTheme.spacing.xs,
  },
});
