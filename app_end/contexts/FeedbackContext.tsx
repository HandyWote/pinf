import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { organicTheme } from '@/constants/theme';

type NotifyType = 'success' | 'error' | 'info';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface FeedbackContextValue {
  notify: (message: string, type?: NotifyType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toastText, setToastText] = useState('');
  const [toastType, setToastType] = useState<NotifyType>('info');
  const [toastVisible, setToastVisible] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, type: NotifyType = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastText(message);
    setToastType(type);
    setToastVisible(true);

    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmOptions(options);
    setConfirmVisible(true);

    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
    });
  }, []);

  const handleResolveConfirm = useCallback((value: boolean) => {
    setConfirmVisible(false);
    if (confirmResolverRef.current) {
      confirmResolverRef.current(value);
      confirmResolverRef.current = null;
    }
  }, []);

  const value = useMemo(
    () => ({
      notify,
      confirm,
    }),
    [confirm, notify]
  );

  const toastBackgroundColor =
    toastType === 'success'
      ? organicTheme.colors.success
      : toastType === 'error'
        ? organicTheme.colors.error
        : organicTheme.colors.info;

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {toastVisible && (
        <View pointerEvents="none" style={styles.toastContainer}>
          <View style={[styles.toast, { backgroundColor: toastBackgroundColor }]}>
            <Text style={styles.toastText}>{toastText}</Text>
          </View>
        </View>
      )}

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => handleResolveConfirm(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => handleResolveConfirm(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{confirmOptions.title}</Text>
            {confirmOptions.message ? (
              <Text style={styles.modalMessage}>{confirmOptions.message}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleResolveConfirm(false)}>
                <Text style={styles.cancelText}>{confirmOptions.cancelText || '取消'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={() => handleResolveConfirm(true)}>
                <Text
                  style={[
                    styles.confirmText,
                    confirmOptions.destructive && styles.destructiveText,
                  ]}
                >
                  {confirmOptions.confirmText || '确定'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    minHeight: 44,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    paddingHorizontal: organicTheme.spacing.lg,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.pale,
  },
  toastText: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '86%',
    maxWidth: 420,
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.pale,
    paddingHorizontal: organicTheme.spacing.lg,
    paddingVertical: organicTheme.spacing.lg,
  },
  modalTitle: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    marginBottom: organicTheme.spacing.sm,
  },
  modalMessage: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    marginBottom: organicTheme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: organicTheme.spacing.sm,
  },
  actionButton: {
    minWidth: 72,
    minHeight: 38,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.pale,
    paddingHorizontal: organicTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: organicTheme.colors.background.paper,
  },
  confirmButton: {
    backgroundColor: organicTheme.colors.primary.pale,
  },
  cancelText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  confirmText: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  destructiveText: {
    color: '#C54A4A',
  },
});
