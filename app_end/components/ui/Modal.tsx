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
import { theme } from '@/constants/theme';

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
  // 计算实际高度值（用于动画）
  const isAutoHeight = height === 'auto';
  const animationHeight = isAutoHeight ? SCREEN_HEIGHT * 0.75 : (typeof height === 'number' ? height : SCREEN_HEIGHT * 0.85);
  const startY = position === 'top' ? -animationHeight : SCREEN_HEIGHT;
  const translateY = React.useRef(new Animated.Value(startY)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('Modal visible changed:', visible);
    if (visible) {
      // 重置初始位置
      translateY.setValue(startY);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: startY,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, startY, translateY, opacity]);

  const renderChildren = () => React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== ScrollView) {
      return child;
    }

    const childProps = child.props as { style?: ViewStyle };
    return React.cloneElement(child as React.ReactElement<any>, {
      style: [childProps.style, styles.scrollViewFlex],
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
                <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.textSub} />
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
    backgroundColor: theme.colors.bgContent,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  modalContentTop: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.mutedBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: theme.spacing.md,
  },
  scrollViewFlex: {
    flex: 1,
  },
});
