import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button, Card, Input } from '@/components/ui';
import { theme } from '@/constants/theme';

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
  const [question, setQuestion] = useState('');

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
        color={theme.colors.surface}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSpacer} />

        <Text style={styles.title}>智能育儿助手</Text>
        <Text style={styles.subtitle}>基于 PINF.TOP AI 模型</Text>

        <Card style={styles.chatCard}>
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
        </Card>
      </ScrollView>

      <View style={styles.inputBar}>
        <Input
          placeholder="输入您的问题..."
          value={question}
          onChangeText={setQuestion}
          containerStyle={styles.inputContainer}
          style={styles.input}
          rightIcon={
            <IconSymbol
              name="paperplane.fill"
              size={18}
              color={theme.colors.primary}
            />
          }
        />
        <Button
          title="发送"
          onPress={() => {}}
          size="small"
          style={styles.sendButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bgBody,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.layout.pagePadding,
    paddingBottom: theme.layout.safeBottom + 20,
  },
  statusSpacer: {
    height: theme.layout.safeTop,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  subtitle: {
    marginTop: 6,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  chatCard: {
    marginTop: theme.layout.sectionGap,
  },
  chatList: {
    gap: theme.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
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
    backgroundColor: theme.colors.primary,
  },
  avatarUser: {
    backgroundColor: theme.colors.accent,
  },
  bubble: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: 16,
    maxWidth: '82%',
  },
  bubbleAssistant: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  bubbleUser: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMain,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: theme.colors.surface,
  },
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.pagePadding,
    paddingBottom: theme.layout.safeBottom - 20,
    backgroundColor: theme.colors.bgBody,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    paddingRight: theme.spacing.lg,
  },
  sendButton: {
    paddingHorizontal: theme.spacing.md,
  },
});
