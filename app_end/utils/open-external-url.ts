import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

const HTTP_PREFIX_PATTERN = /^https?:\/\//i;

export const normalizeExternalUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error('链接为空');
  }
  return HTTP_PREFIX_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const openExternalUrl = async (url: string) => {
  const normalized = normalizeExternalUrl(url);
  await openBrowserAsync(normalized, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
};

export const buildWebviewRoute = (url: string, title?: string) => {
  const normalized = normalizeExternalUrl(url);
  const query = [`url=${encodeURIComponent(normalized)}`];
  if (title?.trim()) {
    query.push(`title=${encodeURIComponent(title.trim())}`);
  }
  return `/webview?${query.join('&')}`;
};
