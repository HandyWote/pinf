import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type ContentItem = {
  id: string;
  title: string;
  tag?: string;
};

type Props = {
  title: string;
  items: ContentItem[];
  onPressItem?: (item: ContentItem) => void;
};

export const ContentStrip: React.FC<Props> = ({ title, items, onPressItem }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => {
          const handlePress = () => onPressItem?.(item);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <View style={styles.thumb} />
              {item.tag && <Text style={styles.tag}>{item.tag}</Text>}
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.layout.sectionGap,
    gap: theme.layout.blockGap,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  scrollContent: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  card: {
    width: 160,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.md,
    ...theme.shadows.card,
  },
  thumb: {
    height: 90,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primaryLight,
    marginBottom: theme.spacing.sm,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: theme.fontSizes.xs,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMain,
    lineHeight: 18,
    fontWeight: '600',
  },
});
