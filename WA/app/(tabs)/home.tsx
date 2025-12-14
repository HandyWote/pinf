import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Input, Tag, ListItem, Modal } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>早护通</Text>
          <Text style={styles.subtitle}>基础组件展示</Text>
        </View>

        {/* 标签展示 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>标签组件</Text>
          <View style={styles.tagRow}>
            <Tag label="默认标签" variant="default" />
            <Tag label="主色标签" variant="primary" />
            <Tag label="强调标签" variant="accent" />
            <Tag label="弱化标签" variant="muted" />
          </View>
        </Card>

        {/* 按钮展示 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>按钮组件</Text>
          <Button
            title="主要按钮"
            onPress={() => setModalVisible(true)}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="次要按钮"
            onPress={() => console.log('Secondary pressed')}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="轮廓按钮"
            onPress={() => console.log('Outline pressed')}
            variant="outline"
            style={styles.button}
          />
        </Card>

        {/* 输入框展示 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>输入框组件</Text>
          <Input
            label="宝宝姓名"
            placeholder="请输入宝宝姓名"
            value={inputValue}
            onChangeText={setInputValue}
            required
          />
          <Input
            label="手机号"
            placeholder="请输入手机号"
            keyboardType="phone-pad"
            helperText="用于接收通知提醒"
          />
        </Card>

        {/* 列表项展示 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>列表项组件</Text>
          <ListItem
            title="生长曲线"
            subtitle="查看宝宝生长发育趋势"
            leftContent={<View style={styles.iconBox}><Text style={styles.iconText}>📈</Text></View>}
            onPress={() => console.log('Growth pressed')}
            style={styles.listItem}
          />
          <ListItem
            title="复诊提醒"
            subtitle="管理预约和提醒"
            leftContent={<View style={styles.iconBox}><Text style={styles.iconText}>📅</Text></View>}
            onPress={() => console.log('Appointment pressed')}
            style={styles.listItem}
          />
        </Card>

        {/* 状态展示 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>认证状态</Text>
          <Text style={styles.text}>
            当前状态: {isAuthenticated ? '已登录' : '未登录'}
          </Text>
        </Card>
      </View>

      {/* 模态框 */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="模态框示例"
      >
        <Text style={styles.modalText}>这是一个模态框组件的示例</Text>
        <Button
          title="关闭"
          onPress={() => setModalVisible(false)}
          variant="primary"
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgContent,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSub,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: theme.spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  listItem: {
    marginBottom: theme.spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  text: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMain,
  },
  modalText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
});
