import { ref } from 'vue'

export interface DownloadConfig {
  version: string
  downloadUrl: string
  fileName: string
}

export function useDownloadConfig() {
  const config = ref<DownloadConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchConfig = async () => {
    loading.value = true
    error.value = null

    try {
      // 尝试读取版本号
      const versionResponse = await fetch('/downloads/version.txt')
      const version = versionResponse.ok ? await versionResponse.text() : '1.0.0'

      // 检查是否有 link.txt
      const linkResponse = await fetch('/downloads/link.txt')
      if (linkResponse.ok) {
        const link = (await linkResponse.text()).trim()
        config.value = {
          version: version.trim(),
          downloadUrl: link,
          fileName: link.split('/').pop() || 'zaohutong.apk'
        }
      } else {
        // 检查是否有 APK 文件
        const apkResponse = await fetch('/downloads/zaohutong.apk')
        if (apkResponse.ok) {
          config.value = {
            version: version.trim(),
            downloadUrl: '/downloads/zaohutong.apk',
            fileName: 'zaohutong.apk'
          }
        } else {
          // 没有找到任何配置
          error.value = '未找到下载配置，请确保 downloads 目录存在'
        }
      }
    } catch {
      error.value = '读取配置失败'
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
