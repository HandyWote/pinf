import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

import { OrganicBackground, OrganicCard, OrganicButton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import { updateProfile } from '@/services/api';
import { useAuthStore } from '@/store';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const { confirm, notify } = useFeedback();
  const [nickname, setNickname] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const displayName = useMemo(() => {
    const name = user?.name?.trim();
    return name && name.length > 0 ? name : '未设置昵称';
  }, [user?.name]);

  const phoneText = useMemo(() => {
    if (!user?.phone) return '未绑定手机号';
    if (user.phone.length < 7) return user.phone;
    return `${user.phone.slice(0, 3)}****${user.phone.slice(-4)}`;
  }, [user?.phone]);

  const handleSaveNickname = async () => {
    const nextName = nickname.trim();
    if (!nextName) {
      notify('昵称不能为空', 'error');
      return;
    }

    if (!user) {
      notify('未获取到用户信息，请重新登录', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateProfile(nextName);
      setUser({ ...user, ...response.data.user });
      notify('昵称已更新', 'success');
    } catch (error: any) {
      notify(error?.response?.data?.message || '昵称更新失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: '退出登录',
      message: '确定要退出当前账号吗？',
      confirmText: '退出',
      cancelText: '取消',
      destructive: true,
    });

    if (!confirmed) return;
    await logout();
    router.replace('/login');
  };

  return (
    <OrganicBackground variant="morning">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusSpacer} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol size={organicTheme.iconSizes.sm} name="chevron.left" color={organicTheme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>我的</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <OrganicCard shadow style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              <IconSymbol size={organicTheme.iconSizes.md} name="person.circle.fill" color={organicTheme.colors.primary.main} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.nickname}>{displayName}</Text>
              <Text style={styles.phone}>{phoneText}</Text>
            </View>
          </View>
        </OrganicCard>

        <OrganicCard shadow style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>账号设置</Text>
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>昵称</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入昵称"
              placeholderTextColor={organicTheme.colors.text.tertiary}
              style={styles.nicknameInput}
              maxLength={20}
            />
            <OrganicButton
              title={isSaving ? '保存中...' : '保存昵称'}
              onPress={handleSaveNickname}
              loading={isSaving}
              disabled={isSaving}
              style={styles.saveButton}
            />
          </View>
        </OrganicCard>

        <OrganicCard shadow style={styles.sectionCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/set-password')}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <IconSymbol size={organicTheme.iconSizes.xs} name="lock.fill" color={organicTheme.colors.primary.main} />
              </View>
              <Text style={styles.menuText}>修改密码</Text>
            </View>
            <IconSymbol size={organicTheme.iconSizes.xs} name="chevron.right" color={organicTheme.colors.text.secondary} />
          </TouchableOpacity>
        </OrganicCard>

        <OrganicButton
          title="退出登录"
          onPress={handleLogout}
          variant="ghost"
          style={styles.logoutButton}
          icon={<IconSymbol size={organicTheme.iconSizes.xs} name="person.crop.circle" color={organicTheme.colors.primary.main} />}
        />
      </ScrollView>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: organicTheme.spacing.lg,
    paddingBottom: 36,
  },
  statusSpacer: {
    height: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: organicTheme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.semibold,
      android: organicTheme.typography.fontFamily.android.semibold,
      default: organicTheme.typography.fontFamily.ios.semibold,
    }),
    color: organicTheme.colors.text.primary,
    letterSpacing: organicTheme.typography.letterSpacing.tight,
    lineHeight: 24,
  },
  headerPlaceholder: {
    width: 40,
  },
  profileCard: {
    marginBottom: organicTheme.spacing.md,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.md,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
  },
  nickname: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.semibold,
      android: organicTheme.typography.fontFamily.android.semibold,
      default: organicTheme.typography.fontFamily.ios.semibold,
    }),
    color: organicTheme.colors.text.primary,
    marginBottom: 4,
    letterSpacing: organicTheme.typography.letterSpacing.normal,
    lineHeight: 22,
  },
  phone: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.regular,
      android: organicTheme.typography.fontFamily.android.regular,
      default: organicTheme.typography.fontFamily.ios.regular,
    }),
    color: organicTheme.colors.text.secondary,
    letterSpacing: organicTheme.typography.letterSpacing.relaxed,
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: organicTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: organicTheme.typography.fontSize.base,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.semibold,
      android: organicTheme.typography.fontFamily.android.semibold,
      default: organicTheme.typography.fontFamily.ios.semibold,
    }),
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.md,
    letterSpacing: organicTheme.typography.letterSpacing.tight,
    lineHeight: 22,
  },
  fieldBlock: {
    gap: organicTheme.spacing.sm,
  },
  fieldLabel: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.regular,
      android: organicTheme.typography.fontFamily.android.regular,
      default: organicTheme.typography.fontFamily.ios.regular,
    }),
    color: organicTheme.colors.text.secondary,
    letterSpacing: organicTheme.typography.letterSpacing.relaxed,
  },
  nicknameInput: {
    height: 48,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    backgroundColor: organicTheme.colors.background.paper,
    paddingHorizontal: organicTheme.spacing.md,
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.base,
  },
  saveButton: {
    marginTop: organicTheme.spacing.xs,
  },
  menuItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
  },
  menuIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: organicTheme.typography.fontSize.base,
    color: organicTheme.colors.text.primary,
    fontWeight: organicTheme.typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: organicTheme.typography.fontFamily.ios.medium,
      android: organicTheme.typography.fontFamily.android.medium,
      default: organicTheme.typography.fontFamily.ios.medium,
    }),
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: organicTheme.spacing.sm,
  },
});
