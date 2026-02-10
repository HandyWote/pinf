import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { OrganicBackground, OrganicCard } from '@/components/ui';
import { organicTheme } from '@/constants/theme';

const messages = [
  {
    id: '1',
    role: 'assistant',
    text: '您好！我是您的专属育儿助手。有关宝宝的喂养、睡眠或生长发育问题，都可以问我哦！',
  },
  {
    id: '2',
    role: 'user',
    text: '宝宝矫正月龄怎么算的？',
  },
  {
    id: '3',
    role: 'assistant',
    text: '矫正月龄是根据预产期来计算的年龄，主要用于评估早产宝宝的生长发育情况。计算公式是：实际月龄 - (40周 - 出生孕周)/4。',
  },
];

type Role = 'assistant' | 'user';

export default function QAScreen() {
  const renderAvatar = (role: Role) => (
    <View
      style={[
        styles.avatar,
        role === 'assistant' ? styles.avatarAssistant : styles.avatarUser,
      ]}
    >
      <IconSymbol
        name={role === 'assistant' ? 'message.fill' : 'person.circle.fill'}
        size={18}
        color="#FFFFFF"
      />
    </View>
  );

  return (
    <OrganicBackground variant="morning">
      <View style={styles.screen}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusSpacer} />

          <Text style={styles.title}>智能育儿助手</Text>
          <Text style={styles.subtitle}>基于 PINF.TOP AI 模型</Text>

          <OrganicCard shadow style={styles.chatCard}>
            <View style={styles.chatList}>
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      isUser && styles.messageRowUser,
                    ]}
                  >
                    {renderAvatar(message.role as Role)}
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.bubbleUser : styles.bubbleAssistant,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          isUser && styles.bubbleTextUser,
                        ]}
                      >
                        {message.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </OrganicCard>
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPlaceholder}>输入您的问题...</Text>
            <View style={styles.sendIconButton}>
              <IconSymbol
                name="paperplane.fill"
                size={18}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </View>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: organicTheme.spacing.lg,
    paddingBottom: 100,
  },
  statusSpacer: {
    height: 44,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.xl,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.text.primary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  chatCard: {
    marginTop: organicTheme.spacing.lg,
  },
  chatList: {
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAssistant: {
    backgroundColor: organicTheme.colors.primary.main,
  },
  avatarUser: {
    backgroundColor: organicTheme.colors.accent.peach,
  },
  bubble: {
    flex: 1,
    padding: organicTheme.spacing.md,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    maxWidth: '82%',
  },
  bubbleAssistant: {
    backgroundColor: organicTheme.colors.background.paper,
    ...organicTheme.shadows.soft[0],
  },
  bubbleUser: {
    backgroundColor: organicTheme.colors.primary.main,
    borderTopRightRadius: 6,
  },
  bubbleText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: organicTheme.spacing.lg,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.sm,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    ...organicTheme.shadows.soft[0],
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  sendIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: organicTheme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
