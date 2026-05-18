import { describe, it, expect } from 'vitest'
import { ConfigServerClient } from '../src/core/config-server/config-server-client.js'
import { DEFAULT_CONFIG_SERVER } from '../src/core/config-server/types.js'
import type { RemoteConfig, RemoteRuleConfig, ConfigConflict } from '../src/core/config-server/types.js'

function makeConfig(overrides: Partial<RemoteConfig> = {}): RemoteConfig {
  return {
    id: 'cfg1',
    name: 'test',
    url: 'https://example.com',
    rules: {},
    profiles: {},
    updatedAt: Date.now(),
    version: '1.0.0',
    checksum: 'abc',
    ...overrides,
  }
}

const makeRule = (severity: RemoteRuleConfig['severity'] = 'error', enabled = true): RemoteRuleConfig => ({
  severity,
  enabled,
})

// ─── DEFAULT_CONFIG_SERVER ─────────────────────────────────────────
describe('DEFAULT_CONFIG_SERVER', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_CONFIG_SERVER).toEqual({
      serverUrl: 'https://config.codeforge.dev',
      cacheTtl: 300000,
      timeout: 10000,
      retries: 2,
      fallbackToLocal: true,
    })
  })
})

// ─── ConfigServerClient constructor ────────────────────────────────
describe('ConfigServerClient constructor', () => {
  it('uses defaults', () => {
    const client = new ConfigServerClient()
    const result = client.fetchConfig('x')
    expect(result).toBeInstanceOf(Promise)
  })

  it('accepts partial config', () => {
    const client = new ConfigServerClient({ cacheTtl: 1000, timeout: 5000 })
    expect(client).toBeDefined()
  })
})

// ─── ConfigServerClient fetchConfig / storeConfig ──────────────────
describe('ConfigServerClient fetchConfig / storeConfig', () => {
  it('returns null when no config stored', async () => {
    const client = new ConfigServerClient()
    const result = await client.fetchConfig('proj1')
    expect(result.config).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.fromCache).toBe(false)
  })

  it('fetches stored config', async () => {
    const client = new ConfigServerClient()
    const cfg = makeConfig()
    client.storeConfig('proj1', cfg)
    const result = await client.fetchConfig('proj1')
    expect(result.config).toEqual(cfg)
    expect(result.fromCache).toBe(false)
  })

  it('caches config on first fetch', async () => {
    const client = new ConfigServerClient({ cacheTtl: 60000 })
    client.storeConfig('proj1', makeConfig())
    await client.fetchConfig('proj1')
    const result = await client.fetchConfig('proj1')
    expect(result.fromCache).toBe(true)
  })

  it('cache expires after TTL', async () => {
    const client = new ConfigServerClient({ cacheTtl: 0 })
    client.storeConfig('proj1', makeConfig())
    await client.fetchConfig('proj1')
    const result = await client.fetchConfig('proj1')
    expect(result.fromCache).toBe(false)
  })

  it('result includes duration', async () => {
    const client = new ConfigServerClient()
    client.storeConfig('proj1', makeConfig())
    const result = await client.fetchConfig('proj1')
    expect(typeof result.duration).toBe('number')
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })
})

// ─── ConfigServerClient cache management ───────────────────────────
describe('ConfigServerClient cache management', () => {
  it('getCached returns null when not cached', () => {
    const client = new ConfigServerClient()
    expect(client.getCached('proj1')).toBeNull()
  })

  it('getCached returns config after fetch', async () => {
    const client = new ConfigServerClient({ cacheTtl: 60000 })
    client.storeConfig('proj1', makeConfig())
    await client.fetchConfig('proj1')
    expect(client.getCached('proj1')).not.toBeNull()
  })

  it('invalidateCache removes entry', async () => {
    const client = new ConfigServerClient({ cacheTtl: 60000 })
    client.storeConfig('proj1', makeConfig())
    await client.fetchConfig('proj1')
    client.invalidateCache('proj1')
    expect(client.getCached('proj1')).toBeNull()
  })

  it('invalidateAll clears entire cache', async () => {
    const client = new ConfigServerClient({ cacheTtl: 60000 })
    client.storeConfig('p1', makeConfig())
    client.storeConfig('p2', makeConfig())
    await client.fetchConfig('p1')
    await client.fetchConfig('p2')
    client.invalidateAll()
    expect(client.getCachedProjectIds()).toHaveLength(0)
  })

  it('getCachedProjectIds lists cached keys', async () => {
    const client = new ConfigServerClient({ cacheTtl: 60000 })
    client.storeConfig('p1', makeConfig())
    client.storeConfig('p2', makeConfig())
    await client.fetchConfig('p1')
    await client.fetchConfig('p2')
    expect(client.getCachedProjectIds().sort()).toEqual(['p1', 'p2'])
  })

  it('clear removes cache and store', async () => {
    const client = new ConfigServerClient({ cacheTtl: 60000 })
    client.storeConfig('p1', makeConfig())
    await client.fetchConfig('p1')
    client.clear()
    expect(client.getCachedProjectIds()).toHaveLength(0)
    const result = await client.fetchConfig('p1')
    expect(result.config).toBeNull()
  })
})

// ─── ConfigServerClient mergeConfigs ───────────────────────────────
describe('ConfigServerClient mergeConfigs', () => {
  const client = new ConfigServerClient()

  it('merges local-only rules as overrides', () => {
    const local = { rule1: makeRule('error') }
    const remote = {}
    const result = client.mergeConfigs(local, remote)
    expect(result.localOverrides).toEqual(['rule1'])
    expect(result.merged.rule1).toEqual({ severity: 'error', enabled: true })
  })

  it('merges remote-only rules as additions', () => {
    const local = {}
    const remote = { rule1: makeRule('warning') }
    const result = client.mergeConfigs(local, remote)
    expect(result.remoteAdditions).toEqual(['rule1'])
  })

  it('detects conflicts', () => {
    const local = { rule1: makeRule('error') }
    const remote = { rule1: makeRule('warning') }
    const result = client.mergeConfigs(local, remote, 'local-wins')
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]!.ruleId).toBe('rule1')
    expect(result.conflicts[0]!.resolution).toBe('local')
  })

  it('local-wins resolves to local value', () => {
    const local = { rule1: makeRule('error') }
    const remote = { rule1: makeRule('warning') }
    const result = client.mergeConfigs(local, remote, 'local-wins')
    expect(result.conflicts[0]!.resolvedValue.severity).toBe('error')
  })

  it('remote-wins resolves to remote value', () => {
    const local = { rule1: makeRule('error') }
    const remote = { rule1: makeRule('warning') }
    const result = client.mergeConfigs(local, remote, 'remote-wins')
    expect(result.conflicts[0]!.resolvedValue.severity).toBe('warning')
    expect(result.conflicts[0]!.resolution).toBe('remote')
  })

  it('merge strategy combines both', () => {
    const local = { rule1: { severity: 'error', enabled: true, options: { max: 10 } } }
    const remote = { rule1: { severity: 'warning', enabled: false, options: { min: 1 } } }
    const result = client.mergeConfigs(local, remote, 'merge')
    expect(result.conflicts[0]!.resolution).toBe('merge')
    expect(result.conflicts[0]!.resolvedValue.severity).toBe('error')
    expect(result.conflicts[0]!.resolvedValue.options).toEqual({ min: 1, max: 10 })
  })

  it('no conflict when rules are identical', () => {
    const local = { rule1: makeRule('error') }
    const remote = { rule1: makeRule('error') }
    const result = client.mergeConfigs(local, remote)
    expect(result.conflicts).toHaveLength(0)
  })

  it('merges options when no conflict on severity/enabled', () => {
    const local = { rule1: { severity: 'error', enabled: true, options: { a: 1 } } }
    const remote = { rule1: { severity: 'error', enabled: true, options: { b: 2 } } }
    const result = client.mergeConfigs(local, remote)
    expect(result.merged.rule1!.options).toEqual({ b: 2, a: 1 })
  })
})

// ─── ConfigServerClient resolveConflict ─────────────────────────────
describe('ConfigServerClient resolveConflict', () => {
  const client = new ConfigServerClient()

  it('resolves to local', () => {
    const conflict: ConfigConflict = {
      ruleId: 'r1',
      localValue: makeRule('error'),
      remoteValue: makeRule('warning'),
      resolvedValue: makeRule('warning'),
      resolution: 'remote',
    }
    expect(client.resolveConflict(conflict, 'local').severity).toBe('error')
  })

  it('resolves to remote', () => {
    const conflict: ConfigConflict = {
      ruleId: 'r1',
      localValue: makeRule('error'),
      remoteValue: makeRule('warning'),
      resolvedValue: makeRule('error'),
      resolution: 'local',
    }
    expect(client.resolveConflict(conflict, 'remote').severity).toBe('warning')
  })

  it('merge takes local severity and enabled', () => {
    const conflict: ConfigConflict = {
      ruleId: 'r1',
      localValue: { severity: 'error', enabled: true, options: { x: 1 } },
      remoteValue: { severity: 'warning', enabled: false, options: { y: 2 } },
      resolvedValue: makeRule(),
      resolution: 'local',
    }
    const resolved = client.resolveConflict(conflict, 'merge')
    expect(resolved.severity).toBe('error')
    expect(resolved.enabled).toBe(true)
    expect(resolved.options).toEqual({ y: 2, x: 1 })
  })
})

// ─── ConfigServerClient validateConfig ──────────────────────────────
describe('ConfigServerClient validateConfig', () => {
  const client = new ConfigServerClient()

  it('passes valid config', () => {
    expect(client.validateConfig(makeConfig())).toEqual([])
  })

  it('reports missing id', () => {
    expect(client.validateConfig(makeConfig({ id: '' }))).toContain('Missing required field: id')
  })

  it('reports missing name', () => {
    expect(client.validateConfig(makeConfig({ name: '' }))).toContain('Missing required field: name')
  })

  it('reports missing url', () => {
    expect(client.validateConfig(makeConfig({ url: '' }))).toContain('Missing required field: url')
  })

  it('reports missing version', () => {
    expect(client.validateConfig(makeConfig({ version: '' }))).toContain('Missing required field: version')
  })

  it('reports invalid semver', () => {
    const errors = client.validateConfig(makeConfig({ version: 'not-semver' }))
    expect(errors).toEqual(expect.arrayContaining([expect.stringContaining('Invalid version')]))
  })

  it('accepts valid semver with prefix', () => {
    expect(client.validateConfig(makeConfig({ version: '1.0.0-beta.1' }))).toEqual([])
  })

  it('reports invalid rules', () => {
    expect(client.validateConfig(makeConfig({ rules: null as unknown as Record<string, RemoteRuleConfig> })))
      .toContain('Rules must be an object')
  })

  it('reports rule missing severity', () => {
    const rules = { r1: { enabled: true, severity: '' } }
    expect(client.validateConfig(makeConfig({ rules }))).toContain('Rule "r1" missing severity')
  })

  it('reports rule invalid enabled', () => {
    const rules = { r1: { enabled: 'yes' as unknown as boolean, severity: 'error' } }
    expect(client.validateConfig(makeConfig({ rules }))).toContain('Rule "r1" missing or invalid enabled field')
  })

  it('reports rule invalid severity', () => {
    const rules = { r1: { enabled: true, severity: 'critical' as RemoteRuleConfig['severity'] } }
    expect(client.validateConfig(makeConfig({ rules }))).toContain('Rule "r1" has invalid severity: critical')
  })

  it('reports profile missing name', () => {
    const profiles = { p1: { name: '', description: 'desc', rules: {} } }
    expect(client.validateConfig(makeConfig({ profiles }))).toContain('Profile "p1" missing name')
  })

  it('reports profile missing description', () => {
    const profiles = { p1: { name: 'P1', description: '', rules: {} } }
    expect(client.validateConfig(makeConfig({ profiles }))).toContain('Profile "p1" missing description')
  })

  it('reports profile invalid rules', () => {
    const profiles = { p1: { name: 'P1', description: 'desc', rules: null as unknown as Record<string, RemoteRuleConfig> } }
    expect(client.validateConfig(makeConfig({ profiles }))).toContain('Profile "p1" has invalid rules')
  })
})
