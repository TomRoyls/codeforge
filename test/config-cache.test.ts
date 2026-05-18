import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfigCache } from '../src/config/cache.js'

// ─── Constructor ───────────────────────────────────────────────────
describe('ConfigCache constructor', () => {
  it('creates instance with default cache dir', () => {
    const cache = new ConfigCache()
    expect(cache).toBeInstanceOf(ConfigCache)
  })

  it('creates instance with custom cache dir', () => {
    const cache = new ConfigCache('/tmp/test-config-cache')
    expect(cache).toBeInstanceOf(ConfigCache)
  })
})

// ─── getConfig ─────────────────────────────────────────────────────
describe('getConfig', () => {
  let cache: ConfigCache

  beforeEach(() => {
    cache = new ConfigCache('/tmp/test-config-cache-' + Date.now())
  })

  afterEach(async () => {
    await cache.clear()
  })

  it('throws when file does not exist', async () => {
    await expect(cache.getConfig('/nonexistent/config.json')).rejects.toThrow()
  })

  it('parses and caches config on cache miss', async () => {
    const config = {
      files: ['src/**/*.ts'],
      rules: { 'max-complexity': 'error' },
    }

    // Create a temp JSON config file for real parsing
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-real-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, JSON.stringify(config))

    const result = await cache.getConfig(configPath)
    expect(result).toEqual(config)

    // Second call should hit cache
    const result2 = await cache.getConfig(configPath)
    expect(result2).toEqual(config)

    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('returns cached config on subsequent calls', async () => {
    const config = { files: ['**/*.ts'] }
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-hit-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, JSON.stringify(config))

    const result1 = await cache.getConfig(configPath)
    const result2 = await cache.getConfig(configPath)
    expect(result1).toEqual(result2)
    expect(result1).toEqual(config)

    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('re-parses when file content changes', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-change-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')

    const config1 = { files: ['**/*.ts'] }
    await fs.writeFile(configPath, JSON.stringify(config1))
    const result1 = await cache.getConfig(configPath)
    expect(result1).toEqual(config1)

    const config2 = { files: ['**/*.js'] }
    await fs.writeFile(configPath, JSON.stringify(config2))
    const result2 = await cache.getConfig(configPath)
    expect(result2).toEqual(config2)

    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('throws when file does not exist', async () => {
    const cache = new ConfigCache('/tmp/test-config-cache-nonexist-' + Date.now())
    await expect(cache.getConfig('/nonexistent/path/config.json')).rejects.toThrow()
  })
})

// ─── clear ─────────────────────────────────────────────────────────
describe('clear', () => {
  it('clears cache without error', async () => {
    const cache = new ConfigCache('/tmp/test-config-cache-clear-' + Date.now())
    await expect(cache.clear()).resolves.toBeUndefined()
  })

  it('allows getConfig after clear', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-clear2-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    const config = { rules: { 'no-eval': 'error' } }
    await fs.writeFile(configPath, JSON.stringify(config))

    const cache = new ConfigCache(tmpDir + '/cache')
    const result1 = await cache.getConfig(configPath)
    expect(result1).toEqual(config)

    await cache.clear()

    const result2 = await cache.getConfig(configPath)
    expect(result2).toEqual(config)

    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── cache key generation ──────────────────────────────────────────
describe('cache key generation', () => {
  it('uses different cache keys for different files', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-keys-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })

    const configA = { files: ['a.ts'] }
    const configB = { files: ['b.ts'] }
    const pathA = path.join(tmpDir, 'a.json')
    const pathB = path.join(tmpDir, 'b.json')
    await fs.writeFile(pathA, JSON.stringify(configA))
    await fs.writeFile(pathB, JSON.stringify(configB))

    const cache = new ConfigCache(tmpDir + '/cache')
    const resultA = await cache.getConfig(pathA)
    const resultB = await cache.getConfig(pathB)

    expect(resultA).toEqual(configA)
    expect(resultB).toEqual(configB)
    expect(resultA).not.toEqual(resultB)

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── content-based invalidation ────────────────────────────────────
describe('content-based invalidation', () => {
  it('invalidates when file hash changes', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-inv-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')

    await fs.writeFile(configPath, JSON.stringify({ files: ['v1'] }))
    const cache = new ConfigCache(tmpDir + '/cache')
    const v1 = await cache.getConfig(configPath)
    expect(v1?.files).toEqual(['v1'])

    await fs.writeFile(configPath, JSON.stringify({ files: ['v2'] }))
    const v2 = await cache.getConfig(configPath)
    expect(v2?.files).toEqual(['v2'])

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('does not invalidate when content unchanged', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-noinv-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    const content = JSON.stringify({ files: ['unchanged'] })
    await fs.writeFile(configPath, content)

    const cache = new ConfigCache(tmpDir + '/cache')
    const r1 = await cache.getConfig(configPath)
    const r2 = await cache.getConfig(configPath)
    expect(r1).toEqual(r2)

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── error handling ────────────────────────────────────────────────
describe('error handling', () => {
  it('falls back to parseConfigFile on cache failure', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-err-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, JSON.stringify({ rules: { 'no-debug': 'warning' } }))

    const cache = new ConfigCache(tmpDir + '/cache')
    const result = await cache.getConfig(configPath)
    expect(result).toEqual({ rules: { 'no-debug': 'warning' } })

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('throws for malformed JSON file', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-malformed-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, 'bad.json')
    await fs.writeFile(configPath, '{ invalid json }')

    const cache = new ConfigCache(tmpDir + '/cache')
    await expect(cache.getConfig(configPath)).rejects.toThrow()

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── concurrent access ─────────────────────────────────────────────
describe('concurrent access', () => {
  it('handles multiple parallel getConfig calls', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-concurrent-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    const config = { files: ['**/*.ts'], rules: {} }
    await fs.writeFile(configPath, JSON.stringify(config))

    const cache = new ConfigCache(tmpDir + '/cache')
    const results = await Promise.all([
      cache.getConfig(configPath),
      cache.getConfig(configPath),
      cache.getConfig(configPath),
    ])

    expect(results[0]).toEqual(config)
    expect(results[1]).toEqual(config)
    expect(results[2]).toEqual(config)

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── different config file types ───────────────────────────────────
describe('different config file types', () => {
  it('caches JSON config files', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-json-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    const config = { files: ['**/*.json'] }
    await fs.writeFile(configPath, JSON.stringify(config))

    const cache = new ConfigCache(tmpDir + '/cache')
    const result = await cache.getConfig(configPath)
    expect(result).toEqual(config)

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('caches .codeforgerc files (no extension)', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-rc-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc')
    const config = { ignore: ['dist/**'] }
    await fs.writeFile(configPath, JSON.stringify(config))

    const cache = new ConfigCache(tmpDir + '/cache')
    const result = await cache.getConfig(configPath)
    expect(result).toEqual(config)

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('caches .codeforge.json files', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-dcf-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforge.json')
    const config = { plugins: ['./plugin.js'] }
    await fs.writeFile(configPath, JSON.stringify(config))

    const cache = new ConfigCache(tmpDir + '/cache')
    const result = await cache.getConfig(configPath)
    expect(result).toEqual(config)

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── cache directory management ────────────────────────────────────
describe('cache directory management', () => {
  it('creates cache directory if it does not exist', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-mkdir-' + Date.now()
    const cacheDir = path.join(tmpDir, 'nested', 'cache')

    const cache = new ConfigCache(cacheDir)
    const configDir = path.join(tmpDir, 'config')
    await fs.mkdir(configDir, { recursive: true })
    const configPath = path.join(configDir, '.codeforgerc.json')
    await fs.writeFile(configPath, JSON.stringify({ files: ['**/*.ts'] }))

    const result = await cache.getConfig(configPath)
    expect(result).toEqual({ files: ['**/*.ts'] })

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})

// ─── complex configs ───────────────────────────────────────────────
describe('complex configs', () => {
  it('caches config with all fields', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-complex-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    const config = {
      files: ['src/**/*.ts', 'lib/**/*.js'],
      ignore: ['node_modules/**', 'dist/**'],
      plugins: ['./plugin-a.js', './plugin-b.js'],
      reporters: [
        { name: 'slack', path: './reporters/slack.js', options: { webhook: 'https://example.com' } },
      ],
      rules: {
        'max-complexity': 'error',
        'no-eval': ['warning', { strict: true }],
      },
    }
    await fs.writeFile(configPath, JSON.stringify(config))

    const cache = new ConfigCache(tmpDir + '/cache')
    const result = await cache.getConfig(configPath)
    expect(result).toEqual(config)

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('caches empty config object', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/test-config-cache-empty-' + Date.now()
    await fs.mkdir(tmpDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, JSON.stringify({}))

    const cache = new ConfigCache(tmpDir + '/cache')
    const result = await cache.getConfig(configPath)
    expect(result).toEqual({})

    await cache.clear()
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})
