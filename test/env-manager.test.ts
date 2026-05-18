import { describe, it, expect } from 'vitest'
import { EnvResolver } from '../src/core/env-manager/env-resolver.js'
import { EnvManager } from '../src/core/env-manager/env-manager.js'
import type { EnvConfig, EnvName, EnvVariable } from '../src/core/env-manager/types.js'

function makeConfig(name: EnvName, variables: Record<string, string>, inherits?: EnvName): EnvConfig {
  const now = Date.now()
  return { name, variables, inherits, locked: false, createdAt: now, updatedAt: now }
}

// ─── EnvResolver.resolve ───────────────────────────────────────────
describe('EnvResolver.resolve', () => {
  const resolver = new EnvResolver()

  it('resolves variables for a single config', () => {
    const configs = [makeConfig('dev', { HOST: 'localhost', PORT: '3000' })]
    expect(resolver.resolve(configs, 'dev')).toEqual({ HOST: 'localhost', PORT: '3000' })
  })

  it('resolves with inheritance chain', () => {
    const configs = [
      makeConfig('base', { HOST: 'localhost', LOG: 'info' }),
      makeConfig('staging', { HOST: 'staging.example.com' }, 'base'),
    ]
    expect(resolver.resolve(configs, 'staging')).toEqual({ HOST: 'staging.example.com', LOG: 'info' })
  })

  it('child overrides parent values', () => {
    const configs = [
      makeConfig('base', { X: 'base' }),
      makeConfig('child', { X: 'child' }, 'base'),
    ]
    expect(resolver.resolve(configs, 'child')).toEqual({ X: 'child' })
  })

  it('returns empty for unknown env', () => {
    expect(resolver.resolve([], 'unknown')).toEqual({})
  })
})

// ─── EnvResolver.resolveChain ──────────────────────────────────────
describe('EnvResolver.resolveChain', () => {
  const resolver = new EnvResolver()

  it('returns single element for no inheritance', () => {
    expect(resolver.resolveChain([makeConfig('dev', {})], 'dev')).toEqual(['dev'])
  })

  it('builds chain from child to root', () => {
    const configs = [
      makeConfig('base', {}),
      makeConfig('mid', {}, 'base'),
      makeConfig('prod', {}, 'mid'),
    ]
    expect(resolver.resolveChain(configs, 'prod')).toEqual(['base', 'mid', 'prod'])
  })

  it('handles circular inheritance by stopping', () => {
    const configs = [
      makeConfig('a', {}, 'b' as EnvName),
      makeConfig('b', {}, 'a' as EnvName),
    ]
    const chain = resolver.resolveChain(configs, 'a')
    expect(chain).toContain('a')
    expect(chain).toContain('b')
    expect(chain.length).toBeLessThanOrEqual(2)
  })

  it('handles missing parent gracefully', () => {
    const configs = [makeConfig('child', {}, 'missing' as EnvName)]
    const chain = resolver.resolveChain(configs, 'child')
    expect(chain).toEqual(['missing', 'child'])
  })
})

// ─── EnvResolver.resolveVariable ───────────────────────────────────
describe('EnvResolver.resolveVariable', () => {
  const resolver = new EnvResolver()

  it('resolves a specific variable', () => {
    const configs = [makeConfig('dev', { PORT: '3000' })]
    expect(resolver.resolveVariable(configs, 'dev', 'PORT')).toBe('3000')
  })

  it('returns undefined for missing variable', () => {
    const configs = [makeConfig('dev', { PORT: '3000' })]
    expect(resolver.resolveVariable(configs, 'dev', 'MISSING')).toBeUndefined()
  })
})

// ─── EnvResolver.interpolate ───────────────────────────────────────
describe('EnvResolver.interpolate', () => {
  const resolver = new EnvResolver()

  it('replaces ${var} placeholders', () => {
    expect(resolver.interpolate('host=${HOST}', { HOST: 'localhost' })).toBe('host=localhost')
  })

  it('replaces multiple placeholders', () => {
    expect(resolver.interpolate('${H}:${P}', { H: 'localhost', P: '3000' })).toBe('localhost:3000')
  })

  it('leaves unknown placeholders unchanged', () => {
    expect(resolver.interpolate('${UNKNOWN}', {})).toBe('${UNKNOWN}')
  })

  it('returns original when no placeholders', () => {
    expect(resolver.interpolate('plain text', {})).toBe('plain text')
  })
})

// ─── EnvResolver.detectEnv ─────────────────────────────────────────
describe('EnvResolver.detectEnv', () => {
  const resolver = new EnvResolver()

  it('detects production from NODE_ENV', () => {
    expect(resolver.detectEnv({ NODE_ENV: 'production' })).toBe('production')
  })

  it('detects staging from NODE_ENV', () => {
    expect(resolver.detectEnv({ NODE_ENV: 'staging' })).toBe('staging')
  })

  it('detects test from NODE_ENV', () => {
    expect(resolver.detectEnv({ NODE_ENV: 'test' })).toBe('test')
  })

  it('detects development from NODE_ENV', () => {
    expect(resolver.detectEnv({ NODE_ENV: 'development' })).toBe('development')
  })

  it('detects development from NODE_ENV=dev', () => {
    expect(resolver.detectEnv({ NODE_ENV: 'dev' })).toBe('development')
  })

  it('falls back to ENV when NODE_ENV missing', () => {
    expect(resolver.detectEnv({ ENV: 'production' })).toBe('production')
  })

  it('falls back to APP_ENV when NODE_ENV and ENV missing', () => {
    expect(resolver.detectEnv({ APP_ENV: 'custom' })).toBe('custom')
  })

  it('defaults to development', () => {
    expect(resolver.detectEnv({})).toBe('development')
  })
})

// ─── EnvResolver.validatePattern ───────────────────────────────────
describe('EnvResolver.validatePattern', () => {
  const resolver = new EnvResolver()

  it('validates against regex pattern', () => {
    expect(resolver.validatePattern('hello', '^h')).toBe(true)
    expect(resolver.validatePattern('hello', '^x')).toBe(false)
  })

  it('validates numeric pattern', () => {
    expect(resolver.validatePattern('42', '^\\d+$')).toBe(true)
    expect(resolver.validatePattern('abc', '^\\d+$')).toBe(false)
  })
})

// ─── EnvManager createEnv / deleteEnv ──────────────────────────────
describe('EnvManager createEnv / deleteEnv', () => {
  it('createEnv adds environment', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { X: '1' })
    expect(mgr.getEnv('dev')).not.toBeNull()
    expect(mgr.getEnv('dev')!.variables).toEqual({ X: '1' })
  })

  it('createEnv with inheritance', () => {
    const mgr = new EnvManager()
    mgr.createEnv('base', { A: '1' })
    mgr.createEnv('dev', { B: '2' }, 'base')
    expect(mgr.getEnv('dev')!.inherits).toBe('base')
  })

  it('deleteEnv removes environment', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev')
    expect(mgr.deleteEnv('dev')).toBe(true)
    expect(mgr.getEnv('dev')).toBeNull()
  })

  it('deleteEnv returns false for unknown', () => {
    const mgr = new EnvManager()
    expect(mgr.deleteEnv('unknown')).toBe(false)
  })

  it('deleteEnv returns false for locked env', () => {
    const mgr = new EnvManager()
    mgr.createEnv('locked')
    const env = mgr.getEnv('locked')!
    env.locked = true
    expect(mgr.deleteEnv('locked')).toBe(false)
  })

  it('listEnvs returns all env names', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev')
    mgr.createEnv('prod')
    mgr.createEnv('staging')
    expect(mgr.listEnvs().sort()).toEqual(['dev', 'prod', 'staging'])
  })
})

// ─── EnvManager setVariable / getVariable / removeVariable ─────────
describe('EnvManager variables', () => {
  it('setVariable sets a value', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev')
    mgr.setVariable('dev', 'PORT', '3000')
    expect(mgr.getVariable('dev', 'PORT')).toBe('3000')
  })

  it('setVariable throws for unknown env', () => {
    const mgr = new EnvManager()
    expect(() => mgr.setVariable('unknown', 'X', '1')).toThrow('not found')
  })

  it('setVariable throws for locked env', () => {
    const mgr = new EnvManager()
    mgr.createEnv('locked')
    mgr.getEnv('locked')!.locked = true
    expect(() => mgr.setVariable('locked', 'X', '1')).toThrow('locked')
  })

  it('getVariable returns undefined for missing', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev')
    expect(mgr.getVariable('dev', 'MISSING')).toBeUndefined()
  })

  it('getVariable returns undefined for unknown env', () => {
    const mgr = new EnvManager()
    expect(mgr.getVariable('unknown', 'X')).toBeUndefined()
  })

  it('removeVariable removes a key', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { X: '1' })
    expect(mgr.removeVariable('dev', 'X')).toBe(true)
    expect(mgr.getVariable('dev', 'X')).toBeUndefined()
  })

  it('removeVariable returns false for missing key', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev')
    expect(mgr.removeVariable('dev', 'MISSING')).toBe(false)
  })

  it('removeVariable returns false for locked env', () => {
    const mgr = new EnvManager()
    mgr.createEnv('locked', { X: '1' })
    mgr.getEnv('locked')!.locked = true
    expect(mgr.removeVariable('locked', 'X')).toBe(false)
  })
})

// ─── EnvManager resolve ────────────────────────────────────────────
describe('EnvManager resolve', () => {
  it('resolves current env', () => {
    const mgr = new EnvManager()
    mgr.createEnv('development', { HOST: 'localhost' })
    mgr.setCurrentEnv('development')
    expect(mgr.resolve()).toEqual({ HOST: 'localhost' })
  })

  it('resolves specific env', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { X: '1' })
    mgr.createEnv('prod', { X: '2' })
    expect(mgr.resolve('prod')).toEqual({ X: '2' })
  })

  it('resolves with inheritance', () => {
    const mgr = new EnvManager()
    mgr.createEnv('base', { A: '1', B: '2' })
    mgr.createEnv('dev', { B: '3' }, 'base')
    expect(mgr.resolve('dev')).toEqual({ A: '1', B: '3' })
  })
})

// ─── EnvManager diff ───────────────────────────────────────────────
describe('EnvManager diff', () => {
  it('detects added variables', () => {
    const mgr = new EnvManager()
    mgr.createEnv('a', { X: '1' })
    mgr.createEnv('b', { X: '1', Y: '2' })
    const diffs = mgr.diff('a', 'b')
    expect(diffs).toContainEqual({ key: 'Y', oldValue: undefined, newValue: '2', type: 'added' })
  })

  it('detects removed variables', () => {
    const mgr = new EnvManager()
    mgr.createEnv('a', { X: '1', Y: '2' })
    mgr.createEnv('b', { X: '1' })
    const diffs = mgr.diff('a', 'b')
    expect(diffs).toContainEqual({ key: 'Y', oldValue: '2', newValue: undefined, type: 'removed' })
  })

  it('detects changed variables', () => {
    const mgr = new EnvManager()
    mgr.createEnv('a', { X: '1' })
    mgr.createEnv('b', { X: '2' })
    const diffs = mgr.diff('a', 'b')
    expect(diffs).toContainEqual({ key: 'X', oldValue: '1', newValue: '2', type: 'changed' })
  })

  it('returns empty for identical envs', () => {
    const mgr = new EnvManager()
    mgr.createEnv('a', { X: '1' })
    mgr.createEnv('b', { X: '1' })
    expect(mgr.diff('a', 'b')).toEqual([])
  })
})

// ─── EnvManager validate ───────────────────────────────────────────
describe('EnvManager validate', () => {
  it('validates required variables', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { HOST: 'localhost' })
    const schema: Record<string, EnvVariable> = {
      HOST: { key: 'HOST', value: '', source: '', isSecret: false, isRequired: true },
      PORT: { key: 'PORT', value: '', source: '', isSecret: false, isRequired: true },
    }
    const result = mgr.validate('dev', schema)
    expect(result.valid).toBe(false)
    expect(result.missing).toContain('PORT')
  })

  it('passes when all required present', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { HOST: 'localhost', PORT: '3000' })
    const schema: Record<string, EnvVariable> = {
      HOST: { key: 'HOST', value: '', source: '', isSecret: false, isRequired: true },
    }
    expect(mgr.validate('dev', schema).valid).toBe(true)
  })

  it('detects extra variables', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { HOST: 'localhost', EXTRA: 'x' })
    const schema: Record<string, EnvVariable> = {
      HOST: { key: 'HOST', value: '', source: '', isSecret: false, isRequired: true },
    }
    const result = mgr.validate('dev', schema)
    expect(result.extra).toContain('EXTRA')
  })

  it('detects non-secret values for secret fields', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { API_KEY: 'not-a-secret' })
    const schema: Record<string, EnvVariable> = {
      API_KEY: { key: 'API_KEY', value: '', source: '', isSecret: true, isRequired: true },
    }
    const result = mgr.validate('dev', schema)
    expect(result.conflicts).toContain('API_KEY')
  })

  it('accepts secret-looking values', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { API_KEY: 'sk_live_abc123def456ghi789jkl012mno' })
    const schema: Record<string, EnvVariable> = {
      API_KEY: { key: 'API_KEY', value: '', source: '', isSecret: true, isRequired: true },
    }
    expect(mgr.validate('dev', schema).conflicts).toHaveLength(0)
  })

  it('uses defaultValue to satisfy required', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', {})
    const schema: Record<string, EnvVariable> = {
      PORT: { key: 'PORT', value: '', source: '', isSecret: false, isRequired: true, defaultValue: '3000' },
    }
    expect(mgr.validate('dev', schema).missing).toHaveLength(0)
  })
})

// ─── EnvManager getCurrentEnv / setCurrentEnv ──────────────────────
describe('EnvManager current env', () => {
  it('defaults to development', () => {
    const mgr = new EnvManager()
    expect(mgr.getCurrentEnv()).toBe('development')
  })

  it('accepts custom default', () => {
    const mgr = new EnvManager('production')
    expect(mgr.getCurrentEnv()).toBe('production')
  })

  it('setCurrentEnv changes current', () => {
    const mgr = new EnvManager()
    mgr.createEnv('staging')
    mgr.setCurrentEnv('staging')
    expect(mgr.getCurrentEnv()).toBe('staging')
  })

  it('setCurrentEnv throws for unknown env', () => {
    const mgr = new EnvManager()
    expect(() => mgr.setCurrentEnv('unknown')).toThrow('not found')
  })
})

// ─── EnvManager exportEnv ──────────────────────────────────────────
describe('EnvManager exportEnv', () => {
  it('exports as JSON', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { X: '1' })
    const json = mgr.exportEnv('dev', 'json')
    expect(JSON.parse(json)).toEqual({ X: '1' })
  })

  it('exports as dotenv', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { X: '1', Y: '2' })
    const dotenv = mgr.exportEnv('dev', 'dotenv')
    expect(dotenv).toContain('X=1')
    expect(dotenv).toContain('Y=2')
  })

  it('exports as shell', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { X: '1' })
    const shell = mgr.exportEnv('dev', 'shell')
    expect(shell).toContain('export X="1"')
  })
})

// ─── EnvManager importEnv ──────────────────────────────────────────
describe('EnvManager importEnv', () => {
  it('imports from JSON', () => {
    const mgr = new EnvManager()
    mgr.importEnv('dev', '{"X":"1","Y":"2"}', 'json')
    expect(mgr.getVariable('dev', 'X')).toBe('1')
    expect(mgr.getVariable('dev', 'Y')).toBe('2')
  })

  it('imports from dotenv', () => {
    const mgr = new EnvManager()
    mgr.importEnv('dev', 'X=1\nY=2\n# comment\n\nZ=3', 'dotenv')
    expect(mgr.getVariable('dev', 'X')).toBe('1')
    expect(mgr.getVariable('dev', 'Z')).toBe('3')
  })

  it('merges into existing env', () => {
    const mgr = new EnvManager()
    mgr.createEnv('dev', { A: 'old' })
    mgr.importEnv('dev', '{"B":"new"}', 'json')
    expect(mgr.getVariable('dev', 'A')).toBe('old')
    expect(mgr.getVariable('dev', 'B')).toBe('new')
  })

  it('creates new env if not exists', () => {
    const mgr = new EnvManager()
    mgr.importEnv('newenv', '{"X":"1"}', 'json')
    expect(mgr.getEnv('newenv')).not.toBeNull()
    expect(mgr.getVariable('newenv', 'X')).toBe('1')
  })

  it('skips empty and comment lines in dotenv', () => {
    const mgr = new EnvManager()
    mgr.importEnv('dev', '# comment\n\nX=1', 'dotenv')
    expect(mgr.listEnvs()).toContain('dev')
    expect(mgr.getVariable('dev', 'X')).toBe('1')
  })

  it('skips lines without = in dotenv', () => {
    const mgr = new EnvManager()
    mgr.importEnv('dev', 'noequals\nX=1', 'dotenv')
    expect(mgr.getVariable('dev', 'X')).toBe('1')
  })
})
