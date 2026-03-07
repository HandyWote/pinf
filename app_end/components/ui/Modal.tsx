/**
 * Modal 组件
 * 基于应用原型设计的模态弹窗组件
 */

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';
import { getUseNativeDriver } from './modalAnimation';
import { getModalScrollViewStyle } from './modalLayout';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | 'auto';
  containerStyle?: ViewStyle;
  position?: 'bottom' | 'top';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  height = SCREEN_HEIGHT * 0.85,
  containerStyle,
  position = 'bottom',
}) => {
  const useNativeDriver = getUseNativeDriver();
  // 计算实际高度值（用于动画）
  const isAutoHeight = height === 'auto';
  const animationHeight = isAutoHeight ? SCREEN_HEIGHT * 0.75 : (typeof height === 'number' ? height : SCREEN_HEIGHT * 0.85);
  const startY = position === 'top' ? -animationHeight : SCREEN_HEIGHT;
  const translateY = React.useRef(new Animated.Value(startY)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 重置初始位置
      translateY.setValue(startY);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: startY,
          duration: 250,
          useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver,
        }),
      ]).start();
    }
  }, [opacity, startY, translateY, useNativeDriver, visible]);

  const renderChildren = () => React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== ScrollView) {
      return child;
    }

    const childProps = child.props as { style?: ViewStyle };
    return React.cloneElement(child as React.ReactElement<any>, {
      style: getModalScrollViewStyle(childProps.style, isAutoHeight),
    });
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          position === 'top' && styles.overlayTop,
          { opacity },
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContent,
            position === 'top' && styles.modalContentTop,
            isAutoHeight 
              ? { minHeight: 200, maxHeight: SCREEN_HEIGHT * 0.85 } 
              : { height: typeof height === 'number' ? height : SCREEN_HEIGHT * 0.85 },
            { transform: [{ translateY }] },
            containerStyle,
          ]}
        >
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <IconSymbol name="xmark.circle.fill" size={organicTheme.iconSizes.sm} color={organicTheme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.content}>{renderChildren()}</View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTop: {
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: organicTheme.colors.background.paper,
    borderTopLeftRadius: organicTheme.shapes.borderRadius.soft,
    borderTopRightRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    paddingTop: organicTheme.spacing.xl,
    paddingHorizontal: organicTheme.spacing.lg,
  },
  modalContentTop: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: organicTheme.shapes.borderRadius.soft,
    borderBottomRightRadius: organicTheme.shapes.borderRadius.soft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: organicTheme.spacing.lg,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: organicTheme.colors.primary.pale,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: organicTheme.spacing.md,
  },
});
