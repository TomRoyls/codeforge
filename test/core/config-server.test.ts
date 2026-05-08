import { describe, it, expect, beforeEach } from 'vitest'
import { ConfigServerClient } from '../../src/core/config-server/config-server-client.js'
import { DEFAULT_CONFIG_SERVER } from '../../src/core/config-server/types.js'
import type {
  RemoteConfig,
  RemoteRuleConfig,
} from '../../src/core/config-server/types.js'

function makeConfig(overrides?: Partial<RemoteConfig>): RemoteConfig {
  return {
    id: 'test-config-1',
    name: 'Test Config',
    url: 'https://config.example.com/test',
    rules: {
      'no-console': { severity: 'error', enabled: true },
      'prefer-const': { severity: 'warning', enabled: true },
    },
    profiles: {
      strict: {
        name: 'Strict',
        description: 'Strict profile',
        rules: { 'no-console': { severity: 'error', enabled: true } },
      },
    },
    updatedAt: Date.now(),
    version: '1.0.0',
    checksum: 'abc123',
    ...overrides,
  }
}

describe('ConfigServerClient', () => {
  let client: ConfigServerClient

  beforeEach(() => {
    client = new ConfigServerClient()
  })

  describe('constructor', () => {
    it('uses default config when no options provided', () => {
      const c = new ConfigServerClient()
      expect(c).toBeInstanceOf(ConfigServerClient)
    })

    it('merges partial config with defaults', () => {
      const c = new ConfigServerClient({ timeout: 5000 })
      expect(c).toBeInstanceOf(ConfigServerClient)
    })

    it('accepts full config override', () => {
      const c = new ConfigServerClient({
        serverUrl: 'https://custom.example.com',
        cacheTtl: 60000,
        timeout: 3000,
        retries: 5,
        fallbackToLocal: false,
      })
      expect(c).toBeInstanceOf(ConfigServerClient)
    })
  })

  describe('storeConfig / fetchConfig', () => {
    it('stores and fetches a config', async () => {
      const config = makeConfig()
      client.storeConfig('proj-1', config)
      const result = await client.fetchConfig('proj-1')
      expect(result.config).toEqual(config)
      expect(result.fromCache).toBe(false)
    })

    it('returns null when no config stored for project', async () => {
      const result = await client.fetchConfig('nonexistent')
      expect(result.config).toBeNull()
      expect(result.error).toContain('No config found')
    })

    it('sets fromCache to true on second fetch within TTL', async () => {
      const config = makeConfig()
      client.storeConfig('proj-1', config)
      await client.fetchConfig('proj-1')
      const result = await client.fetchConfig('proj-1')
      expect(result.fromCache).toBe(true)
    })

    it('tracks duration for fetch operations', async () => {
      const config = makeConfig()
      client.storeConfig('proj-1', config)
      const result = await client.fetchConfig('proj-1')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('overwrites stored config for same project', async () => {
      const config1 = makeConfig({ name: 'V1' })
      const config2 = makeConfig({ name: 'V2' })
      client.storeConfig('proj-1', config1)
      client.storeConfig('proj-1', config2)
      const result = await client.fetchConfig('proj-1')
      expect(result.config?.name).toBe('V2')
    })

    it('stores configs for multiple projects independently', async () => {
      const config1 = makeConfig({ id: 'c1', name: 'Project 1' })
      const config2 = makeConfig({ id: 'c2', name: 'Project 2' })
      client.storeConfig('proj-1', config1)
      client.storeConfig('proj-2', config2)
      const r1 = await client.fetchConfig('proj-1')
      const r2 = await client.fetchConfig('proj-2')
      expect(r1.config?.name).toBe('Project 1')
      expect(r2.config?.name).toBe('Project 2')
    })
  })

  describe('getCached', () => {
    it('returns null for never-fetched project', () => {
      expect(client.getCached('nonexistent')).toBeNull()
    })

    it('returns cached config within TTL', async () => {
      const config = makeConfig()
      client.storeConfig('proj-1', config)
      await client.fetchConfig('proj-1')
      expect(client.getCached('proj-1')).toEqual(config)
    })

    it('returns null after cache expires', async () => {
      const shortTtlClient = new ConfigServerClient({ cacheTtl: 0 })
      const config = makeConfig()
      shortTtlClient.storeConfig('proj-1', config)
      await shortTtlClient.fetchConfig('proj-1')
      expect(shortTtlClient.getCached('proj-1')).toBeNull()
    })
  })

  describe('invalidateCache', () => {
    it('removes specific project from cache', async () => {
      const config = makeConfig()
      client.storeConfig('proj-1', config)
      await client.fetchConfig('proj-1')
      client.invalidateCache('proj-1')
      expect(client.getCached('proj-1')).toBeNull()
    })

    it('does not remove other projects from cache', async () => {
      const config1 = makeConfig({ id: 'c1' })
      const config2 = makeConfig({ id: 'c2' })
      client.storeConfig('proj-1', config1)
      client.storeConfig('proj-2', config2)
      await client.fetchConfig('proj-1')
      await client.fetchConfig('proj-2')
      client.invalidateCache('proj-1')
      expect(client.getCached('proj-1')).toBeNull()
      expect(client.getCached('proj-2')).toEqual(config2)
    })

    it('does not remove stored configs', async () => {
      const config = makeConfig()
      client.storeConfig('proj-1', config)
      await client.fetchConfig('proj-1')
      client.invalidateCache('proj-1')
      const result = await client.fetchConfig('proj-1')
      expect(result.config).toEqual(config)
    })
  })

  describe('invalidateAll', () => {
    it('clears all cached entries', async () => {
      const config1 = makeConfig({ id: 'c1' })
      const config2 = makeConfig({ id: 'c2' })
      client.storeConfig('proj-1', config1)
      client.storeConfig('proj-2', config2)
      await client.fetchConfig('proj-1')
      await client.fetchConfig('proj-2')
      client.invalidateAll()
      expect(client.getCached('proj-1')).toBeNull()
      expect(client.getCached('proj-2')).toBeNull()
    })

    it('does not remove stored configs', async () => {
      const config = makeConfig()
      client.storeConfig('proj-1', config)
      await client.fetchConfig('proj-1')
      client.invalidateAll()
      const result = await client.fetchConfig('proj-1')
      expect(result.config).toEqual(config)
    })
  })

  describe('getCachedProjectIds', () => {
    it('returns empty array when nothing cached', () => {
      expect(client.getCachedProjectIds()).toEqual([])
    })

    it('returns all cached project IDs', async () => {
      client.storeConfig('a', makeConfig())
      client.storeConfig('b', makeConfig())
      await client.fetchConfig('a')
      await client.fetchConfig('b')
      const ids = client.getCachedProjectIds()
      expect(ids).toContain('a')
      expect(ids).toContain('b')
    })
  })

  describe('clear', () => {
    it('clears both cache and store', async () => {
      client.storeConfig('proj-1', makeConfig())
      await client.fetchConfig('proj-1')
      client.clear()
      expect(client.getCachedProjectIds()).toEqual([])
      const result = await client.fetchConfig('proj-1')
      expect(result.config).toBeNull()
    })
  })

  describe('mergeConfigs', () => {
    const localRules: Record<string, RemoteRuleConfig> = {
      'no-console': { severity: 'error', enabled: true },
      'prefer-const': { severity: 'warning', enabled: true },
      'local-only': { severity: 'info', enabled: false },
    }
    const remoteRules: Record<string, RemoteRuleConfig> = {
      'no-console': { severity: 'warning', enabled: true },
      'prefer-const': { severity: 'warning', enabled: true },
      'remote-only': { severity: 'error', enabled: true },
    }

    it('identifies local-only rules as localOverrides', () => {
      const result = client.mergeConfigs(localRules, remoteRules)
      expect(result.localOverrides).toContain('local-only')
    })

    it('identifies remote-only rules as remoteAdditions', () => {
      const result = client.mergeConfigs(localRules, remoteRules)
      expect(result.remoteAdditions).toContain('remote-only')
    })

    it('detects conflicts on shared keys with different severity', () => {
      const result = client.mergeConfigs(localRules, remoteRules)
      const conflict = result.conflicts.find((c) => c.ruleId === 'no-console')
      expect(conflict).toBeDefined()
      expect(conflict!.localValue.severity).toBe('error')
      expect(conflict!.remoteValue.severity).toBe('warning')
    })

    it('no conflict when severity and enabled match', () => {
      const result = client.mergeConfigs(localRules, remoteRules)
      const preferConstConflict = result.conflicts.find(
        (c) => c.ruleId === 'prefer-const',
      )
      expect(preferConstConflict).toBeUndefined()
    })

    it('resolves conflicts with local-wins strategy', () => {
      const result = client.mergeConfigs(
        localRules,
        remoteRules,
        'local-wins',
      )
      const conflict = result.conflicts.find((c) => c.ruleId === 'no-console')
      expect(conflict!.resolution).toBe('local')
      expect(conflict!.resolvedValue.severity).toBe('error')
    })

    it('resolves conflicts with remote-wins strategy', () => {
      const result = client.mergeConfigs(
        localRules,
        remoteRules,
        'remote-wins',
      )
      const conflict = result.conflicts.find((c) => c.ruleId === 'no-console')
      expect(conflict!.resolution).toBe('remote')
      expect(conflict!.resolvedValue.severity).toBe('warning')
    })

    it('resolves conflicts with merge strategy', () => {
      const result = client.mergeConfigs(localRules, remoteRules, 'merge')
      const conflict = result.conflicts.find((c) => c.ruleId === 'no-console')
      expect(conflict!.resolution).toBe('merge')
      expect(conflict!.resolvedValue.severity).toBe('error')
    })

    it('includes all keys in merged result', () => {
      const result = client.mergeConfigs(localRules, remoteRules)
      expect(Object.keys(result.merged)).toContain('no-console')
      expect(Object.keys(result.merged)).toContain('prefer-const')
      expect(Object.keys(result.merged)).toContain('local-only')
      expect(Object.keys(result.merged)).toContain('remote-only')
    })

    it('deep merges options when no conflict', () => {
      const local: Record<string, RemoteRuleConfig> = {
        rule1: {
          severity: 'error',
          enabled: true,
          options: { max: 10 },
        },
      }
      const remote: Record<string, RemoteRuleConfig> = {
        rule1: {
          severity: 'error',
          enabled: true,
          options: { min: 1 },
        },
      }
      const result = client.mergeConfigs(local, remote)
      expect(result.merged['rule1'].options).toEqual({ min: 1, max: 10 })
    })

    it('handles empty local config', () => {
      const result = client.mergeConfigs({}, remoteRules)
      expect(result.localOverrides).toEqual([])
      expect(result.remoteAdditions).toContain('no-console')
      expect(result.remoteAdditions).toContain('prefer-const')
      expect(result.remoteAdditions).toContain('remote-only')
    })

    it('handles empty remote config', () => {
      const result = client.mergeConfigs(localRules, {})
      expect(result.remoteAdditions).toEqual([])
      expect(result.localOverrides).toContain('no-console')
      expect(result.localOverrides).toContain('prefer-const')
      expect(result.localOverrides).toContain('local-only')
    })

    it('handles both empty configs', () => {
      const result = client.mergeConfigs({}, {})
      expect(result.merged).toEqual({})
      expect(result.conflicts).toEqual([])
      expect(result.localOverrides).toEqual([])
      expect(result.remoteAdditions).toEqual([])
    })

    it('defaults to local-wins strategy', () => {
      const result = client.mergeConfigs(localRules, remoteRules)
      const conflict = result.conflicts.find((c) => c.ruleId === 'no-console')
      expect(conflict!.resolution).toBe('local')
    })

    it('detects conflict when enabled state differs', () => {
      const local: Record<string, RemoteRuleConfig> = {
        rule1: { severity: 'error', enabled: true },
      }
      const remote: Record<string, RemoteRuleConfig> = {
        rule1: { severity: 'error', enabled: false },
      }
      const result = client.mergeConfigs(local, remote)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]!.ruleId).toBe('rule1')
    })
  })

  describe('resolveConflict', () => {
    const conflictBase = {
      ruleId: 'test-rule',
      localValue: {
        severity: 'error' as const,
        enabled: true,
        options: { max: 10 },
      },
      remoteValue: {
        severity: 'warning' as const,
        enabled: false,
        options: { min: 1 },
      },
      resolvedValue: {
        severity: 'warning' as const,
        enabled: false,
      },
      resolution: 'remote' as const,
    }

    it('resolves with local', () => {
      const result = client.resolveConflict(conflictBase, 'local')
      expect(result.severity).toBe('error')
      expect(result.enabled).toBe(true)
    })

    it('resolves with remote', () => {
      const result = client.resolveConflict(conflictBase, 'remote')
      expect(result.severity).toBe('warning')
      expect(result.enabled).toBe(false)
    })

    it('resolves with merge - local severity wins', () => {
      const result = client.resolveConflict(conflictBase, 'merge')
      expect(result.severity).toBe('error')
      expect(result.enabled).toBe(true)
    })

    it('resolves with merge - deep merges options', () => {
      const result = client.resolveConflict(conflictBase, 'merge')
      expect(result.options).toEqual({ min: 1, max: 10 })
    })
  })

  describe('validateConfig', () => {
    it('returns empty array for valid config', () => {
      const errors = client.validateConfig(makeConfig())
      expect(errors).toEqual([])
    })

    it('detects missing id', () => {
      const config = makeConfig({ id: '' })
      const errors = client.validateConfig(config)
      expect(errors).toContain('Missing required field: id')
    })

    it('detects missing name', () => {
      const config = makeConfig({ name: '' })
      const errors = client.validateConfig(config)
      expect(errors).toContain('Missing required field: name')
    })

    it('detects missing url', () => {
      const config = makeConfig({ url: '' })
      const errors = client.validateConfig(config)
      expect(errors).toContain('Missing required field: url')
    })

    it('detects missing version', () => {
      const config = makeConfig({ version: '' })
      const errors = client.validateConfig(config)
      expect(errors).toContain('Missing required field: version')
    })

    it('detects invalid semver version', () => {
      const config = makeConfig({ version: 'not-semver' })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('Invalid version'))).toBe(true)
    })

    it('accepts valid semver versions', () => {
      const config = makeConfig({ version: '2.3.4' })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('version'))).toBe(false)
    })

    it('accepts semver with prerelease suffix', () => {
      const config = makeConfig({ version: '1.0.0-beta.1' })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('version'))).toBe(false)
    })

    it('detects missing rules object', () => {
      const config = makeConfig({ rules: null as unknown as Record<string, RemoteRuleConfig> })
      const errors = client.validateConfig(config)
      expect(errors).toContain('Rules must be an object')
    })

    it('detects rule missing severity', () => {
      const config = makeConfig({
        rules: {
          'bad-rule': { severity: '', enabled: true } as unknown as RemoteRuleConfig,
        },
      })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('missing severity'))).toBe(true)
    })

    it('detects rule with invalid severity', () => {
      const config = makeConfig({
        rules: {
          'bad-rule': { severity: 'critical', enabled: true } as unknown as RemoteRuleConfig,
        },
      })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('invalid severity'))).toBe(true)
    })

    it('detects rule missing enabled field', () => {
      const config = makeConfig({
        rules: {
          'bad-rule': { severity: 'error' } as unknown as RemoteRuleConfig,
        },
      })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('missing or invalid enabled'))).toBe(true)
    })

    it('detects profile missing name', () => {
      const config = makeConfig({
        profiles: {
          bad: {
            name: '',
            description: 'desc',
            rules: {},
          },
        },
      })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('missing name'))).toBe(true)
    })

    it('detects profile missing description', () => {
      const config = makeConfig({
        profiles: {
          bad: {
            name: 'Bad',
            description: '',
            rules: {},
          },
        },
      })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('missing description'))).toBe(true)
    })

    it('detects profile with invalid rules', () => {
      const config = makeConfig({
        profiles: {
          bad: {
            name: 'Bad',
            description: 'desc',
            rules: null as unknown as Record<string, RemoteRuleConfig>,
          },
        },
      })
      const errors = client.validateConfig(config)
      expect(errors.some((e) => e.includes('invalid rules'))).toBe(true)
    })

    it('returns multiple errors for multiple issues', () => {
      const config = makeConfig({ id: '', name: '', version: '' })
      const errors = client.validateConfig(config)
      expect(errors.length).toBeGreaterThanOrEqual(3)
    })

    it('accepts valid config with no profiles', () => {
      const config = makeConfig({ profiles: {} })
      const errors = client.validateConfig(config)
      expect(errors).toEqual([])
    })

    it('accepts valid rules with options', () => {
      const config = makeConfig({
        rules: {
          'max-params': {
            severity: 'error',
            enabled: true,
            options: { max: 3 },
          },
        },
      })
      const errors = client.validateConfig(config)
      expect(errors).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('handles config with many rules efficiently', async () => {
      const rules: Record<string, RemoteRuleConfig> = {}
      for (let i = 0; i < 100; i++) {
        rules[`rule-${i}`] = { severity: 'error', enabled: true }
      }
      const config = makeConfig({ rules })
      client.storeConfig('big', config)
      const result = await client.fetchConfig('big')
      expect(Object.keys(result.config!.rules)).toHaveLength(100)
    })

    it('handles merge with identical configs', () => {
      const rules: Record<string, RemoteRuleConfig> = {
        rule1: { severity: 'error', enabled: true },
      }
      const result = client.mergeConfigs(rules, rules)
      expect(result.conflicts).toEqual([])
      expect(result.localOverrides).toEqual([])
      expect(result.remoteAdditions).toEqual([])
    })

    it('cache respects custom TTL', async () => {
      const c = new ConfigServerClient({ cacheTtl: 100000 })
      const config = makeConfig()
      c.storeConfig('proj', config)
      await c.fetchConfig('proj')
      expect(c.getCached('proj')).not.toBeNull()
    })

    it('fetchConfig returns fromCache=false after invalidation and re-fetch', async () => {
      const config = makeConfig()
      client.storeConfig('proj', config)
      await client.fetchConfig('proj')
      client.invalidateCache('proj')
      const result = await client.fetchConfig('proj')
      expect(result.fromCache).toBe(false)
    })

    it('DEFAULT_CONFIG_SERVER has expected values', () => {
      expect(DEFAULT_CONFIG_SERVER.cacheTtl).toBe(300000)
      expect(DEFAULT_CONFIG_SERVER.timeout).toBe(10000)
      expect(DEFAULT_CONFIG_SERVER.retries).toBe(2)
      expect(DEFAULT_CONFIG_SERVER.fallbackToLocal).toBe(true)
      expect(DEFAULT_CONFIG_SERVER.serverUrl).toBe('https://config.codeforge.dev')
    })
  })
})
