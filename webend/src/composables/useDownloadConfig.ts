import { ref } from 'vue'

export interface DownloadConfig {
  version: string
  downloadUrl: string
  fileName: string
}

function resolveFileNameFromUrl(url: string, fallback = 'pinf.apk'): string {
  try {
    const parsed = new URL(url, 'https://pinf.local')
    const segment = parsed.pathname.split('/').pop()
    return segment && segment.trim() ? segment : fallback
  } catch {
    const segment = url.split('/').pop()
    return segment && segment.trim() ? segment : fallback
  }
}

function extractApkHrefFromDirectoryHtml(html: string): string | null {
  const pattern = /href\s*=\s*["']([^"']+\.apk(?:\?[^"']*)?)["']/gi
  const match = pattern.exec(html)
  return match?.[1] ?? null
}

function normalizeApkUrl(href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
    return href
  }
  return `/downloads/${href.replace(/^\.\//, '')}`
}

async function readVersion(fetchImpl: typeof fetch): Promise<string> {
  const versionResponse = await fetchImpl('/downloads/version.txt')
  if (!versionResponse.ok) return '1.0.0'
  return (await versionResponse.text()).trim() || '1.0.0'
}

export async function resolveDownloadConfig(fetchImpl: typeof fetch): Promise<DownloadConfig> {
  const version = await readVersion(fetchImpl)

  const linkResponse = await fetchImpl('/downloads/link.txt')
  if (linkResponse.ok) {
    const link = (await linkResponse.text()).trim()
    if (link) {
      return {
        version,
        downloadUrl: link,
        fileName: resolveFileNameFromUrl(link)
      }
    }
  }

  const downloadsIndexResponse = await fetchImpl('/downloads/')
  if (downloadsIndexResponse.ok) {
    const downloadsHtml = await downloadsIndexResponse.text()
    const apkHref = extractApkHrefFromDirectoryHtml(downloadsHtml)
    if (apkHref) {
      const apkUrl = normalizeApkUrl(apkHref)
      const apkFile = resolveFileNameFromUrl(apkUrl)
      return {
        version,
        downloadUrl: apkUrl,
        fileName: apkFile
      }
    }
  }

  throw new Error('未找到下载配置，请确保 downloads 目录存在')
}

export function useDownloadConfig() {
  const config = ref<DownloadConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchConfig = async () => {
    loading.value = true
    error.value = null

    try {
      config.value = await resolveDownloadConfig(fetch)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '读取配置失败'
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    loading,
    error,
    fetchConfig
  }
}
