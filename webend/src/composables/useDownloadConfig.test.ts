import { describe, expect, test } from 'bun:test'
import { resolveDownloadConfig } from './useDownloadConfig'

type MockResponse = {
  ok: boolean
  text?: string
}

function createFetch(map: Record<string, MockResponse>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const key = String(input)
    const hit = map[key]
    if (!hit) {
      return { ok: false, text: async () => '' } as Response
    }

    return {
      ok: hit.ok,
      text: async () => hit.text ?? ''
    } as Response
  }) as typeof fetch
}

describe('resolveDownloadConfig', () => {
  test('uses link.txt when present', async () => {
    const config = await resolveDownloadConfig(
      createFetch({
        '/downloads/version.txt': { ok: true, text: '2.1.0' },
        '/downloads/link.txt': { ok: true, text: 'https://cdn.example.com/app.apk' }
      })
    )

    expect(config).toEqual({
      version: '2.1.0',
      downloadUrl: 'https://cdn.example.com/app.apk',
      fileName: 'app.apk'
    })
  })

  test('falls back to apk discovered from /downloads/ directory listing when link.txt is absent', async () => {
    const config = await resolveDownloadConfig(
      createFetch({
        '/downloads/version.txt': { ok: true, text: '1.3.0' },
        '/downloads/link.txt': { ok: false },
        '/downloads/': {
          ok: true,
          text: '<html><body><a href="test.apk">test.apk</a></body></html>'
        }
      })
    )

    expect(config).toEqual({
      version: '1.3.0',
      downloadUrl: '/downloads/test.apk',
      fileName: 'test.apk'
    })
  })

  test('throws when no valid download source exists', async () => {
    await expect(
      resolveDownloadConfig(
        createFetch({
          '/downloads/version.txt': { ok: false },
          '/downloads/link.txt': { ok: false },
          '/downloads/': { ok: false }
        })
      )
    ).rejects.toThrow('未找到下载配置，请确保 downloads 目录存在')
  })
})
