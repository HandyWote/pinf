import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GrowthCard, GrowthRecordModal } from '@/components/home';
import { Button } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useBabyStore } from '@/store/babyStore';
import { useGrowthStore } from '@/store/growthStore';

export default function GrowthPage() {
  const router = useRouter();
  const { currentBaby, babies, selectBaby } = useBabyStore();
  const { records, fetch, add, loading, error } = useGrowthStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (currentBaby?.id) {
      fetch(currentBaby.id).catch(() => {});
    }
  }, [currentBaby?.id, fetch]);

  const currentRecords = useMemo(
    () => (currentBaby?.id ? records[currentBaby.id] || [] : []),
    [currentBaby?.id, records]
  );

  const handleSubmit = async (payloads: Parameters<typeof add>[1]) => {
    if (!currentBaby?.id) return;
    await add(currentBaby.id, payloads);
    setShowModal(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button title="返回" variant="text" onPress={() => router.back()} />
        <Text style={styles.title}>成长曲线</Text>
      </View>
      {!currentBaby && (
        <View style={styles.centerBox}>
          <Text style={styles.muted}>请先添加或选择宝宝</Text>
        </View>
      )}
      {currentBaby && (
        <>
          <Text style={styles.subtitle}>当前宝宝：{currentBaby.name}</Text>
          <GrowthCard
            records={currentRecords}
            loading={loading}
            error={error}
            onAdd={() => setShowModal(true)}
            onRefresh={() => fetch(currentBaby.id)}
          />
        </>
      )}
      <GrowthRecordModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBody,
  },
  content: {
    paddingHorizontal: theme.layout.pagePadding,
    paddingTop: theme.layout.safeTop,
    paddingBottom: theme.layout.safeBottom,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  muted: {
    color: theme.colors.textSub,
  },
});
