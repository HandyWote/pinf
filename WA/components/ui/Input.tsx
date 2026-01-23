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
import { theme } from '@/constants/theme';

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
          placeholderTextColor={theme.colors.mutedText}
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
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  required: {
    color: theme.colors.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'transparent',
    ...theme.shadows.small,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.accent,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMain,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  leftIcon: {
    paddingLeft: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    paddingRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: theme.fontSizes.sm,
  },
  errorText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
    marginTop: theme.spacing.xs,
  },
});
