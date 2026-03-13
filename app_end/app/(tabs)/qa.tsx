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
import type { LayoutChangeEvent } from 'react-native';

import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { OrganicBackground } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import { clearChatHistory, getChatHistory, sendChatMessage } from '@/services/api/chat';
import { useAuthStore } from '@/store';
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
  // 固定首屏时间戳，避免静态渲染与客户端首帧时间不一致
  timestamp: 0,
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

// 消息气泡组件 - 带动画和深度阴影
const MessageBubble = React.memo(({
  message,
  isUser,
  isFailed,
  isNew,
}: {
  message: UiMessage;
  isUser: boolean;
  isFailed: boolean;
  isNew?: boolean;
}) => {
  const entryAnimation = isNew
    ? FadeInDown.springify().damping(18). stiffness(120)
    : FadeIn.duration(300);

  return (
    <Animated.View
      entering={entryAnimation}
      style={[styles.messageRow, isUser && styles.messageRowUser]}
    >
      <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
        <IconSymbol
          name={isUser ? 'person.circle.fill' : 'sun.max.fill'}
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
          <Text
            style={[
              styles.bubbleText,
              isUser && styles.bubbleTextUser,
              !isUser && styles.bubbleTextAssistant,
            ]}
          >
            {message.content}
          </Text>
        </View>
        <View style={[styles.metaRow, isUser && styles.metaRowUser]}>
          <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
          {message.pending ? (
            <View style={styles.pendingContainer}>
              <ActivityIndicator
                size="small"
                color={organicTheme.colors.primary.main}
                style={styles.pendingDot}
              />
              <Text style={styles.pendingText}>发送中</Text>
            </View>
          ) : null}
          {isFailed ? <Text style={styles.failedText}>发送失败</Text> : null}
        </View>
      </View>
    </Animated.View>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default function QAScreen() {
  const { currentBaby } = useBabyStore();
  const { user } = useAuthStore();
  const { notify, confirm } = useFeedback();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<UiMessage[]>([createGreetingMessage()]);
  const [draft, setDraft] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState('');

  // 输入框自适应高度相关状态
  const [inputHeight, setInputHeight] = useState(36); // 初始高度
  const [chatCardHeight, setChatCardHeight] = useState<number | null>(null); // 聊天框初始高度
  const MIN_INPUT_HEIGHT = 36;
  const MAX_INPUT_HEIGHT = 100; // 最大输入框高度，超过后文字滚动

  // 计算聊天框高度：初始高度 - (输入框增长高度)，但最少保留 50%
  const minChatHeight = chatCardHeight ? chatCardHeight * 0.5 : 0;
  const currentChatHeight = chatCardHeight
    ? Math.max(chatCardHeight - (inputHeight - MIN_INPUT_HEIGHT), minChatHeight)
    : undefined;

  const babyId = currentBaby?.id;
  const headerSubtitle = useMemo(
    () => (currentBaby ? `${currentBaby.name} 的会话` : '通用会话'),
    [currentBaby]
  );
  const userDisplayName = useMemo(() => user?.name?.trim() || '我', [user?.name]);

  // 输入框内容变化时更新高度
  const handleInputContentChange = useCallback((text: string) => {
    setDraft(text);
    if (text.length === 0) {
      setInputHeight(MIN_INPUT_HEIGHT);
    }
    if (formError) {
      setFormError('');
    }
  }, [formError]);

  // 输入框尺寸变化
  const handleInputSizeChange = useCallback((event: { nativeEvent: { contentSize: { height: number } } }) => {
    const newHeight = event.nativeEvent.contentSize.height;
    // 限制在 min 和 max 之间
    const clampedHeight = Math.min(Math.max(newHeight, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT);
    setInputHeight(clampedHeight);
  }, []);

  // 聊天框布局测量：在布局变化时刷新基准高度
  const handleChatCardLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    // 当前渲染高度会受输入框增长影响，这里反推出“输入框最小高度时”的基准聊天高度
    const nextBaseChatHeight = height + (inputHeight - MIN_INPUT_HEIGHT);
    setChatCardHeight((prev) => {
      if (prev !== null && Math.abs(prev - nextBaseChatHeight) < 1) {
        return prev;
      }
      return nextBaseChatHeight;
    });
  }, [inputHeight]);

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
    setInputHeight(MIN_INPUT_HEIGHT);

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
              <Text style={styles.subtitle}>{headerSubtitle} · 当前用户：{userDisplayName}</Text>
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

          {/* 聊天区域 - 高度自适应 */}
          <View
            style={[
              styles.chatCard,
              currentChatHeight ? { height: currentChatHeight } : undefined,
            ]}
            onLayout={handleChatCardLayout}
          >
            {isLoadingHistory ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.centerState}>
                <View style={styles.loadingIconWrap}>
                  <ActivityIndicator size="large" color={organicTheme.colors.primary.main} />
                </View>
                <Text style={styles.stateText}>正在加载会话...</Text>
                <Text style={styles.stateSubtext}>正在获取聊天记录</Text>
              </Animated.View>
            ) : messages.length <= 1 ? (
              <Animated.View entering={FadeIn.duration(400)} style={styles.centerState}>
                <View style={styles.emptyIconWrap}>
                  <IconSymbol
                    name="hand.wave.fill"
                    size={64}
                    color={organicTheme.colors.primary.soft}
                  />
                </View>
                <Text style={styles.emptyTitle}>开始你的育儿问答</Text>
                <Text style={styles.emptySubtext}>
                  输入关于宝宝喂养、护理、发育等问题{'\n'}AI 助手会为你提供专业建议
                </Text>
              </Animated.View>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const isFailed = message.status === 'failed';
                  const isNew = message.pending || index >= messages.length - 2;
                  return (
                    <MessageBubble
                      key={`${message.messageId}-${message.id}`}
                      message={message}
                      isUser={isUser}
                      isFailed={isFailed}
                      isNew={isNew}
                    />
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.composerWrap}>
            <View style={[styles.inputRow, { minHeight: inputHeight }]}>
              <TextInput
                value={draft}
                onChangeText={handleInputContentChange}
                onContentSizeChange={handleInputSizeChange}
                placeholder="输入你的问题..."
                placeholderTextColor={organicTheme.colors.text.tertiary}
                multiline
                style={[styles.input, { height: inputHeight }]}
                textAlignVertical={Platform.OS === 'android' ? 'center' : 'top'}
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
                {formError}
              </Text>
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
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    overflow: 'hidden',
    ...organicTheme.shadows.soft[1],
  },
  // 增强的加载/空状态
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: organicTheme.spacing.sm,
    minHeight: 280,
    paddingHorizontal: organicTheme.spacing.xl,
  },
  loadingIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: organicTheme.colors.primary.soft + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: organicTheme.spacing.md,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: organicTheme.colors.primary.soft + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: organicTheme.spacing.lg,
    ...organicTheme.shadows.soft[0],
  },
  stateText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  stateSubtext: {
    color: organicTheme.colors.text.tertiary,
    fontSize: organicTheme.typography.fontSize.xs,
    marginTop: organicTheme.spacing.xs,
  },
  emptyTitle: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    marginBottom: organicTheme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: organicTheme.typography.fontSize.sm * 1.6,
  },
  // 聊天内容区
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: organicTheme.spacing.md,
    gap: organicTheme.spacing.md,
  },
  // 消息行
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: organicTheme.spacing.sm,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  // 头像 - 带微阴影
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...organicTheme.shadows.soft[0],
  },
  avatarAssistant: {
    backgroundColor: organicTheme.colors.primary.main,
  },
  avatarUser: {
    backgroundColor: organicTheme.colors.accent.peach,
  },
  // 消息主体
  messageMain: {
    maxWidth: '84%',
    gap: organicTheme.spacing.xs,
  },
  messageMainUser: {
    alignItems: 'flex-end',
  },
  // 气泡 - 带深度阴影和圆角差异化
  bubble: {
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.sm + 2,
    borderRadius: 20,
    borderWidth: 1,
    // 柔和阴影增加深度感
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleAssistant: {
    backgroundColor: organicTheme.colors.background.paper,
    borderColor: organicTheme.colors.border.light,
    // AI 气泡额外的微妙阴影
    ...organicTheme.shadows.soft[0],
  },
  bubbleUser: {
    backgroundColor: organicTheme.colors.primary.main,
    borderColor: organicTheme.colors.border.accent,
  },
  bubbleFailed: {
    borderColor: '#C54A4A',
    backgroundColor: '#FEF2F2',
  },
  // 文字排版 - AI 和用户消息差异化
  bubbleText: {
    fontSize: organicTheme.typography.fontSize.sm,
    lineHeight: organicTheme.typography.fontSize.sm * 1.65,
  },
  bubbleTextUser: {
    color: organicTheme.colors.background.paper,
    fontWeight: organicTheme.typography.fontWeight.medium,
    letterSpacing: 0.2,
  },
  bubbleTextAssistant: {
    color: organicTheme.colors.text.primary,
    letterSpacing: 0.3,
  },
  // 元信息行
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
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingDot: {
    width: 10,
    height: 10,
  },
  pendingText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  failedText: {
    color: '#C54A4A',
    fontSize: organicTheme.typography.fontSize.xs,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  // 输入区域
  composerWrap: {
    gap: organicTheme.spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: organicTheme.spacing.xs,
    ...organicTheme.shadows.soft[0],
  },
  input: {
    flex: 1,
    width: '100%',
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    lineHeight: 20,
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
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
