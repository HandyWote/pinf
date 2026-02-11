import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { OrganicBackground, OrganicCard } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import { clearChatHistory, getChatHistory, sendChatMessage } from '@/services/api/chat';
import { useBabyStore } from '@/store/babyStore';
import type { ChatHistoryItem, ChatMessage } from '@/types/chat';

const HISTORY_PAGE_SIZE = 100;
const LOCAL_GREETING_ID = -1;

interface UiMessage extends ChatMessage {
  pending?: boolean;
  localOnly?: boolean;
}

const createGreetingMessage = (): UiMessage => ({
  id: LOCAL_GREETING_ID,
  messageId: 'local-greeting',
  role: 'ai',
  content: '你好，我是育儿问答助手。你可以直接输入问题，我会尽快回复。',
  timestamp: Date.now(),
  status: 'sent',
  localOnly: true,
});

const createOptimisticMessage = (content: string): UiMessage => ({
  id: -Date.now(),
  messageId: `local-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  role: 'user',
  content,
  timestamp: Date.now(),
  status: 'sent',
  pending: true,
  localOnly: true,
});

const toHistoryPayload = (messages: UiMessage[]): ChatHistoryItem[] =>
  messages
    .filter(item => !item.localOnly && !item.pending)
    .slice(-20)
    .map(item => ({
      role: item.role,
      content: item.content,
      timestamp: item.timestamp,
      messageId: item.messageId,
    }));

const sortByTimestamp = (messages: UiMessage[]) =>
  [...messages].sort((a, b) => {
    if (a.timestamp === b.timestamp) {
      return a.id - b.id;
    }
    return a.timestamp - b.timestamp;
  });

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

export default function QAScreen() {
  const { currentBaby } = useBabyStore();
  const { notify, confirm } = useFeedback();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<UiMessage[]>([createGreetingMessage()]);
  const [draft, setDraft] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState('');

  const babyId = currentBaby?.id;
  const headerSubtitle = useMemo(
    () => (currentBaby ? `${currentBaby.name} 的会话` : '通用会话'),
    [currentBaby]
  );

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setFormError('');
    try {
      const { messages: history } = await getChatHistory({
        page: 1,
        per_page: HISTORY_PAGE_SIZE,
        babyId,
      });

      if (history.length === 0) {
        setMessages([createGreetingMessage()]);
      } else {
        setMessages(sortByTimestamp(history as UiMessage[]));
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || '加载聊天记录失败，请稍后重试';
      setFormError(message);
      setMessages([createGreetingMessage()]);
      notify(message, 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [babyId, notify]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSend = async () => {
    if (isSending) {
      return;
    }

    const content = draft.trim();
    if (!content) {
      setFormError('请输入问题后再发送');
      return;
    }

    setFormError('');
    setDraft('');

    const optimisticMessage = createOptimisticMessage(content);
    setMessages(prev => sortByTimestamp([...prev, optimisticMessage]));
    setIsSending(true);

    try {
      const data = await sendChatMessage({
        content,
        babyId,
        messageId: optimisticMessage.messageId,
        history: toHistoryPayload(messages),
      });

      setMessages(prev => {
        const next = prev.filter(item => item.messageId !== optimisticMessage.messageId);
        next.push(data.userMessage as UiMessage);
        next.push(data.aiMessage as UiMessage);
        return sortByTimestamp(next);
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || '发送失败，请稍后重试';
      setMessages(prev =>
        prev.map(item =>
          item.messageId === optimisticMessage.messageId
            ? {
                ...item,
                pending: false,
                status: 'failed',
              }
            : item
        )
      );
      setFormError(message);
      notify(message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (isSending || isLoadingHistory) {
      return;
    }

    const confirmed = await confirm({
      title: '清空当前会话？',
      message: '清空后将无法恢复该会话内容。',
      confirmText: '清空',
      cancelText: '取消',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await clearChatHistory({ babyId });
      setMessages([createGreetingMessage()]);
      setFormError('');
      notify('会话已清空', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.message || '清空失败，请稍后重试';
      setFormError(message);
      notify(message, 'error');
    }
  };

  const canSend = draft.trim().length > 0 && !isSending && !isLoadingHistory;

  return (
    <OrganicBackground variant="morning">
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>智能育儿问答</Text>
              <Text style={styles.subtitle}>{headerSubtitle}</Text>
            </View>
            <Pressable
              style={[styles.clearButton, (isSending || isLoadingHistory) && styles.clearButtonDisabled]}
              onPress={handleClearHistory}
              disabled={isSending || isLoadingHistory}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={organicTheme.iconSizes.xs}
                color={organicTheme.colors.text.secondary}
              />
              <Text style={styles.clearButtonText}>清空</Text>
            </Pressable>
          </View>

          <OrganicCard shadow style={styles.chatCard}>
            {isLoadingHistory ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />
                <Text style={styles.stateText}>正在加载会话...</Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map(message => {
                  const isUser = message.role === 'user';
                  const isFailed = message.status === 'failed';
                  return (
                    <View key={`${message.messageId}-${message.id}`} style={[styles.messageRow, isUser && styles.messageRowUser]}>
                      <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
                        <IconSymbol
                          name={isUser ? 'person.circle.fill' : 'message.fill'}
                          size={organicTheme.iconSizes.xs}
                          color={organicTheme.colors.background.paper}
                        />
                      </View>
                      <View style={[styles.messageMain, isUser && styles.messageMainUser]}>
                        <View
                          style={[
                            styles.bubble,
                            isUser ? styles.bubbleUser : styles.bubbleAssistant,
                            isFailed && styles.bubbleFailed,
                          ]}
                        >
                          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                            {message.content}
                          </Text>
                        </View>
                        <View style={[styles.metaRow, isUser && styles.metaRowUser]}>
                          <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
                          {message.pending ? <Text style={styles.pendingText}>发送中</Text> : null}
                          {isFailed ? <Text style={styles.failedText}>发送失败</Text> : null}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </OrganicCard>

          <View style={styles.composerWrap}>
            <View style={styles.inputRow}>
              <TextInput
                value={draft}
                onChangeText={text => {
                  setDraft(text);
                  if (formError) {
                    setFormError('');
                  }
                }}
                placeholder="输入你的问题..."
                placeholderTextColor={organicTheme.colors.text.tertiary}
                multiline
                maxLength={300}
                style={styles.input}
                textAlignVertical="top"
              />
              <Pressable
                onPress={handleSend}
                disabled={!canSend}
                style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={organicTheme.colors.background.paper} />
                ) : (
                  <IconSymbol
                    name="paperplane.fill"
                    size={organicTheme.iconSizes.xs}
                    color={organicTheme.colors.background.paper}
                  />
                )}
              </Pressable>
            </View>
            <View style={styles.composerFooter}>
              <Text style={[styles.helperText, formError && styles.errorText]}>
                {formError || '请输入具体问题以获得更准确的建议'}
              </Text>
              <Text style={styles.counterText}>{draft.length}/300</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: organicTheme.spacing.lg,
    paddingBottom: 92,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: organicTheme.spacing.md,
  },
  title: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.bold,
  },
  subtitle: {
    marginTop: organicTheme.spacing.xs,
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: organicTheme.spacing.xs,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.background.paper,
  },
  clearButtonText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  clearButtonDisabled: {
    opacity: 0.45,
  },
  chatCard: {
    flex: 1,
    marginBottom: organicTheme.spacing.md,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: organicTheme.spacing.sm,
    minHeight: 220,
  },
  stateText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: organicTheme.spacing.md,
    gap: organicTheme.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: organicTheme.spacing.sm,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAssistant: {
    backgroundColor: organicTheme.colors.primary.main,
  },
  avatarUser: {
    backgroundColor: organicTheme.colors.accent.peach,
  },
  messageMain: {
    maxWidth: '84%',
    gap: organicTheme.spacing.xs,
  },
  messageMainUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.sm,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    borderWidth: 1,
  },
  bubbleAssistant: {
    backgroundColor: organicTheme.colors.background.paper,
    borderColor: organicTheme.colors.border.light,
  },
  bubbleUser: {
    backgroundColor: organicTheme.colors.primary.main,
    borderColor: organicTheme.colors.border.accent,
  },
  bubbleFailed: {
    borderColor: organicTheme.colors.border.danger,
  },
  bubbleText: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    lineHeight: organicTheme.typography.fontSize.sm * organicTheme.typography.lineHeight.normal,
  },
  bubbleTextUser: {
    color: organicTheme.colors.background.paper,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
  },
  metaRowUser: {
    justifyContent: 'flex-end',
  },
  timeText: {
    color: organicTheme.colors.text.tertiary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  pendingText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  failedText: {
    color: '#C54A4A',
    fontSize: organicTheme.typography.fontSize.xs,
  },
  composerWrap: {
    gap: organicTheme.spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: organicTheme.spacing.sm,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    padding: organicTheme.spacing.sm,
    ...organicTheme.shadows.soft[0],
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 112,
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: organicTheme.spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: organicTheme.colors.primary.main,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  composerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: organicTheme.spacing.sm,
  },
  helperText: {
    flex: 1,
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  errorText: {
    color: '#C54A4A',
  },
  counterText: {
    color: organicTheme.colors.text.tertiary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
});
