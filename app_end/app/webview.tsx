import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { OrganicBackground, OrganicCard } from '@/components/ui';
import { organicTheme } from '@/constants/theme';
import { normalizeExternalUrl, openExternalUrl } from '@/utils/open-external-url';

const readParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const decodeParam = (value?: string) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function InAppWebviewScreen() {
  const params = useLocalSearchParams<{ url?: string | string[]; title?: string | string[] }>();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const pageTitle = useMemo(() => {
    const raw = decodeParam(readParam(params.title));
    return raw || '网页内容';
  }, [params.title]);

  const pageUrl = useMemo(() => {
    const raw = decodeParam(readParam(params.url));
    if (!raw) return '';
    try {
      return normalizeExternalUrl(raw);
    } catch {
      return '';
    }
  }, [params.url]);

  const handleOpenExternal = useCallback(async () => {
    if (!pageUrl) {
      setError('链接无效');
      return;
    }
    try {
      await openExternalUrl(pageUrl);
    } catch (openError) {
      const message = openError instanceof Error ? openError.message : '打开链接失败';
      setError(message);
    }
  }, [pageUrl]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  }, []);

  return (
    <OrganicBackground variant="morning">
      <View style={styles.container}>
        <View style={styles.statusSpacer} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              name="chevron.left"
              size={organicTheme.iconSizes.xs}
              color={organicTheme.colors.text.secondary}
            />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {pageTitle}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => { void handleOpenExternal(); }}>
            <Text style={styles.actionText}>外部打开</Text>
          </TouchableOpacity>
        </View>

        {!pageUrl ? (
          <OrganicCard variant="soft" shadow={false} style={styles.stateCard}>
            <Text style={styles.errorText}>链接无效</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.retryText}>返回上一页</Text>
            </TouchableOpacity>
          </OrganicCard>
        ) : (
          <View style={styles.webviewShell}>
            <WebView
              key={reloadKey}
              ref={webViewRef}
              source={{ uri: pageUrl }}
              style={styles.webview}
              onLoadStart={() => {
                setLoading(true);
                setError(null);
              }}
              onLoadEnd={() => setLoading(false)}
              onError={(event) => {
                setLoading(false);
                setError(event.nativeEvent.description || '页面加载失败');
              }}
              onHttpError={(event) => {
                setLoading(false);
                setError(`页面加载失败（${event.nativeEvent.statusCode}）`);
              }}
              setSupportMultipleWindows={false}
              originWhitelist={['*']}
            />

            {loading && !error && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />
                <Text style={styles.loadingText}>页面加载中...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorOverlay}>
                <OrganicCard variant="soft" shadow={false} style={styles.stateCard}>
                  <Text style={styles.errorText}>{error}</Text>
                  <View style={styles.errorActions}>
                    <TouchableOpacity onPress={handleRetry}>
                      <Text style={styles.retryText}>重新加载</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { void handleOpenExternal(); }}>
                      <Text style={styles.retryText}>外部打开</Text>
                    </TouchableOpacity>
                  </View>
                </OrganicCard>
              </View>
            )}
          </View>
        )}
      </View>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: organicTheme.spacing.lg,
    paddingBottom: organicTheme.spacing.lg,
  },
  statusSpacer: {
    height: 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: organicTheme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
  },
  backText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  title: {
    flex: 1,
    marginHorizontal: organicTheme.spacing.sm,
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  actionButton: {
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: organicTheme.spacing.xs,
  },
  actionText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  webviewShell: {
    flex: 1,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
    backgroundColor: organicTheme.colors.background.paper,
  },
  webview: {
    flex: 1,
    backgroundColor: organicTheme.colors.background.paper,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: organicTheme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: organicTheme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  stateCard: {
    width: '100%',
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
  },
  errorText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.primary,
    textAlign: 'center',
  },
  errorActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  retryText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
});
