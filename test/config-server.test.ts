import { describe, it, expect, beforeEach } from 'vitest'
import { ConfigServerClient, DEFAULT_CONFIG_SERVER } from '../src/core/config-server/index.js'
import type { RemoteConfig, RemoteRuleConfig } from '../src/core/config-server/index.js'

const validConfig: RemoteConfig = {
  id: 'proj-1',
  name: 'Test Project',
  url: 'https://example.com/config',
  version: '1.0.0',
  checksum: 'abc123',
  updatedAt: Date.now(),
  rules: {
    'no-console': { severity: 'warning', enabled: true },
    'no-eval': { severity: 'error', enabled: true },
  },
  profiles: {
    strict: { name: 'Strict', description: 'Strict profile', rules: {} },
  },
}

// ─── ConfigServerClient Construction ───

describe('ConfigServerClient', () => {
  let client: ConfigServerClient

  beforeEach(() => {
    client = new ConfigServerClient()
  })

  describe('construction', () => {
    it('should use default config', () => {
      expect(DEFAULT_CONFIG_SERVER.cacheTtl).toBe(300000)
      expect(DEFAULT_CONFIG_SERVER.serverUrl).toContain('codeforge')
    })
  })

  // ─── storeConfig / fetchConfig ───

  describe('storeConfig and fetchConfig', () => {
    it('should store and fetch a config', async () => {
      client.storeConfig('proj-1', validConfig)
      const result = await client.fetchConfig('proj-1')
      expect(result.config).toEqual(validConfig)
      expect(result.fromCache).toBe(false)
    })

    it('should return error for non-existent project', async () => {
      const result = await client.fetchConfig('nonexistent')
      expect(result.config).toBeNull()
      expect(result.error).toContain('No config found')
    })

    it('should serve from cache on second fetch', async () => {
      client.storeConfig('proj-1', validConfig)
      await client.fetchConfig('proj-1')
      const result = await client.fetchConfig('proj-1')
      expect(result.fromCache).toBe(true)
    })

    it('should include duration in result', async () => {
      client.storeConfig('proj-1', validConfig)
      const result = await client.fetchConfig('proj-1')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Cache Management ───

  describe('cache management', () => {
    it('should return null for uncached project', () => {
      expect(client.getCached('nonexistent')).toBeNull()
    })

    it('should return cached config if fresh', async () => {
      client.storeConfig('proj-1', validConfig)
      await client.fetchConfig('proj-1')
      const cached = client.getCached('proj-1')
      expect(cached).toEqual(validConfig)
    })

    it('should invalidate specific cache entry', async () => {
      client.storeConfig('proj-1', validConfig)
      await client.fetchConfig('proj-1')
      client.invalidateCache('proj-1')
      expect(client.getCached('proj-1')).toBeNull()
    })

    it('should invalidate all cache entries', async () => {
      client.storeConfig('proj-1', validConfig)
      await client.fetchConfig('proj-1')
      client.invalidateAll()
      expect(client.getCachedProjectIds()).toEqual([])
    })

    it('should list cached project IDs', async () => {
      client.storeConfig('proj-1', validConfig)
      await client.fetchConfig('proj-1')
      expect(client.getCachedProjectIds()).toContain('proj-1')
    })

    it('should clear both cache and store', async () => {
      client.storeConfig('proj-1', validConfig)
      await client.fetchConfig('proj-1')
      client.clear()
      const result = await client.fetchConfig('proj-1')
      expect(result.config).toBeNull()
    })
  })

  // ─── mergeConfigs ───

  describe('mergeConfigs', () => {
    const localRules: Record<string, RemoteRuleConfig> = {
      'no-console': { severity: 'error', enabled: true, options: { allow: ['warn'] } },
      'no-debugger': { severity: 'error', enabled: true },
    }
    const remoteRules: Record<string, RemoteRuleConfig> = {
      'no-console': { severity: 'warning', enabled: false },
      'prefer-const': { severity: 'warning', enabled: true },
    }

    it('should merge with local-wins strategy', () => {
      const result = client.mergeConfigs(localRules, remoteRules, 'local-wins')
      expect(result.merged['no-console']!.severity).toBe('error')
      expect(result.merged['no-console']!.enabled).toBe(true)
      expect(result.conflicts.length).toBe(1)
    })

    it('should merge with remote-wins strategy', () => {
      const result = client.mergeConfigs(localRules, remoteRules, 'remote-wins')
      expect(result.merged['no-console']!.severity).toBe('warning')
      expect(result.merged['no-console']!.enabled).toBe(false)
    })

    it('should merge with merge strategy', () => {
      const result = client.mergeConfigs(localRules, remoteRules, 'merge')
      expect(result.merged['no-console']!.severity).toBe('error')
      expect(result.merged['no-console']!.enabled).toBe(true)
    })

    it('should track local overrides', () => {
      const result = client.mergeConfigs(localRules, remoteRules, 'local-wins')
      expect(result.localOverrides).toContain('no-debugger')
    })

    it('should track remote additions', () => {
      const result = client.mergeConfigs(localRules, remoteRules, 'local-wins')
      expect(result.remoteAdditions).toContain('prefer-const')
    })

    it('should handle empty inputs', () => {
      const result = client.mergeConfigs({}, {}, 'local-wins')
      expect(Object.keys(result.merged).length).toBe(0)
    })
  })

  // ─── resolveConflict ───

  describe('resolveConflict', () => {
    const conflict = {
      ruleId: 'no-console',
      localValue: { severity: 'error' as const, enabled: true, options: { a: 1 } },
      remoteValue: { severity: 'warning' as const, enabled: false, options: { b: 2 } },
      resolvedValue: { severity: 'error' as const, enabled: true },
      resolution: 'local' as const,
    }

    it('should resolve using local', () => {
      const result = client.resolveConflict(conflict, 'local')
      expect(result.severity).toBe('error')
      expect(result.enabled).toBe(true)
    })

    it('should resolve using remote', () => {
      const result = client.resolveConflict(conflict, 'remote')
      expect(result.severity).toBe('warning')
      expect(result.enabled).toBe(false)
    })

    it('should resolve using merge', () => {
      const result = client.resolveConflict(conflict, 'merge')
      expect(result.severity).toBe('error')
      expect(result.enabled).toBe(true)
    })
  })

  // ─── validateConfig ───

  describe('validateConfig', () => {
    it('should return empty errors for valid config', () => {
      const errors = client.validateConfig(validConfig)
      expect(errors).toEqual([])
    })

    it('should detect missing id', () => {
      const config = { ...validConfig, id: '' }
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('id'))).toBe(true)
    })

    it('should detect missing name', () => {
      const config = { ...validConfig, name: '' }
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('name'))).toBe(true)
    })

    it('should detect invalid version format', () => {
      const config = { ...validConfig, version: 'not-semver' }
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('semver'))).toBe(true)
    })

    it('should detect invalid rules object', () => {
      const config = { ...validConfig, rules: null }
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('Rules'))).toBe(true)
    })

    it('should detect rule with missing severity', () => {
      const config = { ...validConfig, rules: { 'test-rule': { severity: '', enabled: true } } }
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('missing severity'))).toBe(true)
    })

    it('should detect rule with invalid severity', () => {
      const config = { ...validConfig, rules: { 'test-rule': { severity: 'bad', enabled: true } } }
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('invalid severity'))).toBe(true)
    })

    it('should detect invalid profile', () => {
      const config = { ...validConfig, profiles: { bad: { name: '', description: '', rules: null as any } } }
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('Profile'))).toBe(true)
    })
  })
})
