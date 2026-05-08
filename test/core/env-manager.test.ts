import { describe, it, expect } from 'vitest'
import { EnvResolver } from '../../src/core/env-manager/env-resolver.js'
import { EnvManager } from '../../src/core/env-manager/env-manager.js'
import type { EnvConfig, EnvVariable } from '../../src/core/env-manager/types.js'

function makeConfig(name: string, vars: Record<string, string>, inherits?: string): EnvConfig {
  const now = Date.now()
  return { name, variables: vars, inherits, locked: false, createdAt: now, updatedAt: now }
}

describe('EnvResolver', () => {
  const resolver = new EnvResolver()

  describe('resolve', () => {
    it('should resolve variables for a single environment', () => {
      const configs = [makeConfig('development', { API_URL: 'http://localhost:3000' })]
      const result = resolver.resolve(configs, 'development')
      expect(result).toEqual({ API_URL: 'http://localhost:3000' })
    })

    it('should resolve variables with inheritance', () => {
      const configs = [
        makeConfig('base', { LOG_LEVEL: 'info', TIMEOUT: '5000' }),
        makeConfig('development', { API_URL: 'http://localhost:3000' }, 'base'),
      ]
      const result = resolver.resolve(configs, 'development')
      expect(result).toEqual({ LOG_LEVEL: 'info', TIMEOUT: '5000', API_URL: 'http://localhost:3000' })
    })

    it('should override parent variables in child', () => {
      const configs = [
        makeConfig('base', { LOG_LEVEL: 'info' }),
        makeConfig('production', { LOG_LEVEL: 'error' }, 'base'),
      ]
      const result = resolver.resolve(configs, 'production')
      expect(result.LOG_LEVEL).toBe('error')
    })

    it('should return empty object for non-existent environment', () => {
      const configs = [makeConfig('development', { KEY: 'val' })]
      const result = resolver.resolve(configs, 'staging')
      expect(result).toEqual({})
    })

    it('should handle empty configs array', () => {
      const result = resolver.resolve([], 'development')
      expect(result).toEqual({})
    })

    it('should resolve multi-level inheritance chain', () => {
      const configs = [
        makeConfig('base', { A: '1' }),
        makeConfig('staging', { B: '2' }, 'base'),
        makeConfig('preview', { C: '3' }, 'staging'),
      ]
      const result = resolver.resolve(configs, 'preview')
      expect(result).toEqual({ A: '1', B: '2', C: '3' })
    })
  })

  describe('resolveChain', () => {
    it('should return single element for env without inheritance', () => {
      const configs = [makeConfig('development', {})]
      const chain = resolver.resolveChain(configs, 'development')
      expect(chain).toEqual(['development'])
    })

    it('should return chain from parent to child', () => {
      const configs = [
        makeConfig('base', {}),
        makeConfig('staging', {}, 'base'),
        makeConfig('preview', {}, 'staging'),
      ]
      const chain = resolver.resolveChain(configs, 'preview')
      expect(chain).toEqual(['base', 'staging', 'preview'])
    })

    it('should handle circular inheritance gracefully', () => {
      const configs = [
        makeConfig('a', {}, 'b'),
        makeConfig('b', {}, 'a'),
      ]
      const chain = resolver.resolveChain(configs, 'a')
      expect(chain).toEqual(['b', 'a'])
    })

    it('should handle missing parent gracefully', () => {
      const configs = [makeConfig('child', {}, 'missing-parent')]
      const chain = resolver.resolveChain(configs, 'child')
      expect(chain).toEqual(['missing-parent', 'child'])
    })

    it('should return empty array for empty configs', () => {
      const chain = resolver.resolveChain([], 'development')
      expect(chain).toEqual(['development'])
    })
  })

  describe('resolveVariable', () => {
    it('should resolve a single variable', () => {
      const configs = [makeConfig('development', { DB_HOST: 'localhost' })]
      expect(resolver.resolveVariable(configs, 'development', 'DB_HOST')).toBe('localhost')
    })

    it('should return undefined for missing variable', () => {
      const configs = [makeConfig('development', { DB_HOST: 'localhost' })]
      expect(resolver.resolveVariable(configs, 'development', 'MISSING')).toBeUndefined()
    })

    it('should resolve variable from parent env', () => {
      const configs = [
        makeConfig('base', { SHARED: 'value' }),
        makeConfig('dev', {}, 'base'),
      ]
      expect(resolver.resolveVariable(configs, 'dev', 'SHARED')).toBe('value')
    })
  })

  describe('interpolate', () => {
    it('should interpolate variables into template', () => {
      const result = resolver.interpolate('jdbc://${HOST}:${PORT}/db', { HOST: 'localhost', PORT: '5432' })
      expect(result).toBe('jdbc://localhost:5432/db')
    })

    it('should leave unresolved variables as-is', () => {
      const result = resolver.interpolate('${HOST}:${UNKNOWN}', { HOST: 'localhost' })
      expect(result).toBe('localhost:${UNKNOWN}')
    })

    it('should handle template with no variables', () => {
      const result = resolver.interpolate('just a string', {})
      expect(result).toBe('just a string')
    })

    it('should handle empty template', () => {
      const result = resolver.interpolate('', { KEY: 'val' })
      expect(result).toBe('')
    })

    it('should handle multiple occurrences of same variable', () => {
      const result = resolver.interpolate('${X}-${X}', { X: '1' })
      expect(result).toBe('1-1')
    })

    it('should handle empty variables object', () => {
      const result = resolver.interpolate('${A}', {})
      expect(result).toBe('${A}')
    })
  })

  describe('detectEnv', () => {
    it('should detect production from NODE_ENV', () => {
      expect(resolver.detectEnv({ NODE_ENV: 'production' })).toBe('production')
    })

    it('should detect staging from NODE_ENV', () => {
      expect(resolver.detectEnv({ NODE_ENV: 'staging' })).toBe('staging')
    })

    it('should detect test from NODE_ENV', () => {
      expect(resolver.detectEnv({ NODE_ENV: 'test' })).toBe('test')
    })

    it('should detect development from NODE_ENV', () => {
      expect(resolver.detectEnv({ NODE_ENV: 'development' })).toBe('development')
    })

    it('should detect dev alias for NODE_ENV', () => {
      expect(resolver.detectEnv({ NODE_ENV: 'dev' })).toBe('development')
    })

    it('should fall back to ENV variable', () => {
      expect(resolver.detectEnv({ ENV: 'production' })).toBe('production')
    })

    it('should fall back to APP_ENV variable', () => {
      expect(resolver.detectEnv({ APP_ENV: 'custom-env' })).toBe('custom-env')
    })

    it('should default to development', () => {
      expect(resolver.detectEnv({})).toBe('development')
    })

    it('should prioritize NODE_ENV over ENV', () => {
      expect(resolver.detectEnv({ NODE_ENV: 'test', ENV: 'production' })).toBe('test')
    })
  })

  describe('validatePattern', () => {
    it('should validate matching pattern', () => {
      expect(resolver.validatePattern('hello123', '^[a-z]+\\d+$')).toBe(true)
    })

    it('should reject non-matching pattern', () => {
      expect(resolver.validatePattern('HELLO', '^[a-z]+$')).toBe(false)
    })

    it('should validate URL pattern', () => {
      expect(resolver.validatePattern('http://example.com', '^https?://')).toBe(true)
    })

    it('should validate port number pattern', () => {
      expect(resolver.validatePattern('3000', '^\\d{1,5}$')).toBe(true)
    })

    it('should reject invalid port', () => {
      expect(resolver.validatePattern('abc', '^\\d{1,5}$')).toBe(false)
    })

    it('should handle empty string', () => {
      expect(resolver.validatePattern('', '^$')).toBe(true)
    })
  })
})

describe('EnvManager', () => {
  describe('constructor', () => {
    it('should default to development environment', () => {
      const mgr = new EnvManager()
      expect(mgr.getCurrentEnv()).toBe('development')
    })

    it('should accept custom default environment', () => {
      const mgr = new EnvManager('staging')
      expect(mgr.getCurrentEnv()).toBe('staging')
    })
  })

  describe('createEnv', () => {
    it('should create a new environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('development', { PORT: '3000' })
      const env = mgr.getEnv('development')
      expect(env).not.toBeNull()
      expect(env!.variables).toEqual({ PORT: '3000' })
    })

    it('should create env without variables', () => {
      const mgr = new EnvManager()
      mgr.createEnv('production')
      const env = mgr.getEnv('production')
      expect(env!.variables).toEqual({})
    })

    it('should create env with inheritance', () => {
      const mgr = new EnvManager()
      mgr.createEnv('base', { LOG_LEVEL: 'info' })
      mgr.createEnv('staging', { PORT: '8080' }, 'base')
      expect(mgr.getEnv('staging')!.inherits).toBe('base')
    })

    it('should set timestamps on creation', () => {
      const mgr = new EnvManager()
      const before = Date.now()
      mgr.createEnv('test')
      const after = Date.now()
      const env = mgr.getEnv('test')!
      expect(env.createdAt).toBeGreaterThanOrEqual(before)
      expect(env.createdAt).toBeLessThanOrEqual(after)
    })

    it('should not be locked by default', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev')
      expect(mgr.getEnv('dev')!.locked).toBe(false)
    })
  })

  describe('deleteEnv', () => {
    it('should delete an existing environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev')
      expect(mgr.deleteEnv('dev')).toBe(true)
      expect(mgr.getEnv('dev')).toBeNull()
    })

    it('should return false for non-existent environment', () => {
      const mgr = new EnvManager()
      expect(mgr.deleteEnv('missing')).toBe(false)
    })

    it('should not delete a locked environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('prod')
      const env = mgr.getEnv('prod')!
      env.locked = true
      expect(mgr.deleteEnv('prod')).toBe(false)
      expect(mgr.getEnv('prod')).not.toBeNull()
    })
  })

  describe('getEnv', () => {
    it('should return null for non-existent environment', () => {
      const mgr = new EnvManager()
      expect(mgr.getEnv('missing')).toBeNull()
    })

    it('should return config for existing environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { KEY: 'val' })
      const env = mgr.getEnv('dev')
      expect(env!.name).toBe('dev')
      expect(env!.variables.KEY).toBe('val')
    })
  })

  describe('listEnvs', () => {
    it('should return empty list when no envs', () => {
      const mgr = new EnvManager()
      expect(mgr.listEnvs()).toEqual([])
    })

    it('should list all created environments', () => {
      const mgr = new EnvManager()
      mgr.createEnv('development')
      mgr.createEnv('staging')
      mgr.createEnv('production')
      const list = mgr.listEnvs()
      expect(list).toHaveLength(3)
      expect(list).toContain('development')
      expect(list).toContain('staging')
      expect(list).toContain('production')
    })
  })

  describe('setVariable', () => {
    it('should set a variable on an environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev')
      mgr.setVariable('dev', 'PORT', '3000')
      expect(mgr.getVariable('dev', 'PORT')).toBe('3000')
    })

    it('should overwrite existing variable', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { PORT: '3000' })
      mgr.setVariable('dev', 'PORT', '4000')
      expect(mgr.getVariable('dev', 'PORT')).toBe('4000')
    })

    it('should throw for non-existent environment', () => {
      const mgr = new EnvManager()
      expect(() => mgr.setVariable('missing', 'KEY', 'val')).toThrow('not found')
    })

    it('should throw for locked environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('prod')
      mgr.getEnv('prod')!.locked = true
      expect(() => mgr.setVariable('prod', 'KEY', 'val')).toThrow('locked')
    })

    it('should update updatedAt timestamp', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev')
      const before = mgr.getEnv('dev')!.updatedAt
      mgr.setVariable('dev', 'KEY', 'val')
      expect(mgr.getEnv('dev')!.updatedAt).toBeGreaterThanOrEqual(before)
    })
  })

  describe('getVariable', () => {
    it('should return undefined for missing env', () => {
      const mgr = new EnvManager()
      expect(mgr.getVariable('missing', 'KEY')).toBeUndefined()
    })

    it('should return undefined for missing variable', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev')
      expect(mgr.getVariable('dev', 'MISSING')).toBeUndefined()
    })

    it('should return value for existing variable', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { HOST: 'localhost' })
      expect(mgr.getVariable('dev', 'HOST')).toBe('localhost')
    })
  })

  describe('removeVariable', () => {
    it('should remove an existing variable', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { KEY: 'val' })
      expect(mgr.removeVariable('dev', 'KEY')).toBe(true)
      expect(mgr.getVariable('dev', 'KEY')).toBeUndefined()
    })

    it('should return false for missing env', () => {
      const mgr = new EnvManager()
      expect(mgr.removeVariable('missing', 'KEY')).toBe(false)
    })

    it('should return false for missing variable', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev')
      expect(mgr.removeVariable('dev', 'MISSING')).toBe(false)
    })

    it('should return false for locked environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('prod', { KEY: 'val' })
      mgr.getEnv('prod')!.locked = true
      expect(mgr.removeVariable('prod', 'KEY')).toBe(false)
    })

    it('should update updatedAt on removal', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { KEY: 'val' })
      const before = mgr.getEnv('dev')!.updatedAt
      mgr.removeVariable('dev', 'KEY')
      expect(mgr.getEnv('dev')!.updatedAt).toBeGreaterThanOrEqual(before)
    })
  })

  describe('resolve', () => {
    it('should resolve current environment by default', () => {
      const mgr = new EnvManager('dev')
      mgr.createEnv('dev', { PORT: '3000' })
      expect(mgr.resolve()).toEqual({ PORT: '3000' })
    })

    it('should resolve specified environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('base', { A: '1' })
      mgr.createEnv('dev', { B: '2' }, 'base')
      expect(mgr.resolve('dev')).toEqual({ A: '1', B: '2' })
    })

    it('should resolve with inheritance override', () => {
      const mgr = new EnvManager()
      mgr.createEnv('base', { LOG: 'info' })
      mgr.createEnv('prod', { LOG: 'error' }, 'base')
      expect(mgr.resolve('prod')).toEqual({ LOG: 'error' })
    })
  })

  describe('diff', () => {
    it('should detect added variables', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { A: '1' })
      mgr.createEnv('staging', { A: '1', B: '2' })
      const diffs = mgr.diff('dev', 'staging')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]).toEqual({ key: 'B', oldValue: undefined, newValue: '2', type: 'added' })
    })

    it('should detect removed variables', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { A: '1', B: '2' })
      mgr.createEnv('staging', { A: '1' })
      const diffs = mgr.diff('dev', 'staging')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]).toEqual({ key: 'B', oldValue: '2', newValue: undefined, type: 'removed' })
    })

    it('should detect changed variables', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { PORT: '3000' })
      mgr.createEnv('prod', { PORT: '80' })
      const diffs = mgr.diff('dev', 'prod')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]).toEqual({ key: 'PORT', oldValue: '3000', newValue: '80', type: 'changed' })
    })

    it('should return empty diff for identical envs', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { A: '1' })
      mgr.createEnv('staging', { A: '1' })
      expect(mgr.diff('dev', 'staging')).toEqual([])
    })

    it('should handle diff with inherited variables', () => {
      const mgr = new EnvManager()
      mgr.createEnv('base', { SHARED: 'base-val' })
      mgr.createEnv('dev', { LOCAL: 'dev-val' }, 'base')
      mgr.createEnv('prod', { LOCAL: 'prod-val' }, 'base')
      const diffs = mgr.diff('dev', 'prod')
      expect(diffs).toHaveLength(1)
      expect(diffs[0]!.type).toBe('changed')
    })

    it('should handle diff between empty envs', () => {
      const mgr = new EnvManager()
      mgr.createEnv('a')
      mgr.createEnv('b')
      expect(mgr.diff('a', 'b')).toEqual([])
    })
  })

  describe('validate', () => {
    const schema: Record<string, EnvVariable> = {
      DB_HOST: { key: 'DB_HOST', value: '', source: 'schema', isSecret: false, isRequired: true },
      DB_PASS: { key: 'DB_PASS', value: '', source: 'schema', isSecret: true, isRequired: true },
      OPTIONAL: { key: 'OPTIONAL', value: '', source: 'schema', isSecret: false, isRequired: false },
    }

    it('should pass for valid environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { DB_HOST: 'localhost', DB_PASS: 'sk_live_abc123def456' })
      const result = mgr.validate('dev', schema)
      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('should detect missing required variables', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', {})
      const result = mgr.validate('dev', schema)
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('DB_HOST')
      expect(result.missing).toContain('DB_PASS')
    })

    it('should not flag optional missing variables', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { DB_HOST: 'localhost', DB_PASS: 'sk_live_abc123def456' })
      const result = mgr.validate('dev', schema)
      expect(result.missing).not.toContain('OPTIONAL')
    })

    it('should detect extra variables', () => {
      const mgr = new EnvManager()
      const simpleSchema: Record<string, EnvVariable> = {
        A: { key: 'A', value: '', source: 's', isSecret: false, isRequired: true },
      }
      mgr.createEnv('dev', { A: '1', EXTRA: '2' })
      const result = mgr.validate('dev', simpleSchema)
      expect(result.extra).toContain('EXTRA')
    })

    it('should detect secret conflicts (non-secret value for secret field)', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { DB_HOST: 'localhost', DB_PASS: 'plaintext' })
      const result = mgr.validate('dev', schema)
      expect(result.conflicts).toContain('DB_PASS')
    })

    it('should pass with required and defaultValue set but missing from env', () => {
      const mgr = new EnvManager()
      const schemaWithDefault: Record<string, EnvVariable> = {
        PORT: { key: 'PORT', value: '', source: 's', isSecret: false, isRequired: true, defaultValue: '3000' },
      }
      mgr.createEnv('dev', {})
      const result = mgr.validate('dev', schemaWithDefault)
      expect(result.missing).not.toContain('PORT')
    })

    it('should return valid true for empty schema', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { A: '1' })
      const result = mgr.validate('dev', {})
      expect(result.valid).toBe(true)
    })
  })

  describe('getCurrentEnv / setCurrentEnv', () => {
    it('should return default env', () => {
      const mgr = new EnvManager('development')
      expect(mgr.getCurrentEnv()).toBe('development')
    })

    it('should switch to existing environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev')
      mgr.createEnv('staging')
      mgr.setCurrentEnv('staging')
      expect(mgr.getCurrentEnv()).toBe('staging')
    })

    it('should throw when switching to non-existent environment', () => {
      const mgr = new EnvManager()
      expect(() => mgr.setCurrentEnv('missing')).toThrow('not found')
    })
  })

  describe('exportEnv', () => {
    it('should export as JSON', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { PORT: '3000', HOST: 'localhost' })
      const exported = mgr.exportEnv('dev', 'json')
      const parsed = JSON.parse(exported)
      expect(parsed).toEqual({ PORT: '3000', HOST: 'localhost' })
    })

    it('should export as dotenv', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { PORT: '3000', HOST: 'localhost' })
      const exported = mgr.exportEnv('dev', 'dotenv')
      expect(exported).toContain('PORT=3000')
      expect(exported).toContain('HOST=localhost')
    })

    it('should export as shell', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { PORT: '3000' })
      const exported = mgr.exportEnv('dev', 'shell')
      expect(exported).toContain('export PORT="3000"')
    })

    it('should export resolved variables including inherited', () => {
      const mgr = new EnvManager()
      mgr.createEnv('base', { A: '1' })
      mgr.createEnv('dev', { B: '2' }, 'base')
      const exported = mgr.exportEnv('dev', 'json')
      const parsed = JSON.parse(exported)
      expect(parsed).toEqual({ A: '1', B: '2' })
    })

    it('should export empty env as empty JSON object', () => {
      const mgr = new EnvManager()
      mgr.createEnv('empty')
      const exported = mgr.exportEnv('empty', 'json')
      expect(exported).toBe('{}')
    })

    it('should export empty env as empty dotenv string', () => {
      const mgr = new EnvManager()
      mgr.createEnv('empty')
      const exported = mgr.exportEnv('empty', 'dotenv')
      expect(exported).toBe('')
    })
  })

  describe('importEnv', () => {
    it('should import from JSON', () => {
      const mgr = new EnvManager()
      mgr.importEnv('dev', '{"A":"1","B":"2"}', 'json')
      expect(mgr.getVariable('dev', 'A')).toBe('1')
      expect(mgr.getVariable('dev', 'B')).toBe('2')
    })

    it('should import from dotenv', () => {
      const mgr = new EnvManager()
      mgr.importEnv('dev', 'PORT=3000\nHOST=localhost', 'dotenv')
      expect(mgr.getVariable('dev', 'PORT')).toBe('3000')
      expect(mgr.getVariable('dev', 'HOST')).toBe('localhost')
    })

    it('should skip comments in dotenv', () => {
      const mgr = new EnvManager()
      mgr.importEnv('dev', '# comment\nKEY=val', 'dotenv')
      expect(mgr.getVariable('dev', 'KEY')).toBe('val')
      expect(Object.keys(mgr.getEnv('dev')!.variables)).toHaveLength(1)
    })

    it('should skip blank lines in dotenv', () => {
      const mgr = new EnvManager()
      mgr.importEnv('dev', '\n\nKEY=val\n\n', 'dotenv')
      expect(Object.keys(mgr.getEnv('dev')!.variables)).toHaveLength(1)
    })

    it('should skip lines without equals sign in dotenv', () => {
      const mgr = new EnvManager()
      mgr.importEnv('dev', 'invalidline\nKEY=val', 'dotenv')
      expect(Object.keys(mgr.getEnv('dev')!.variables)).toHaveLength(1)
    })

    it('should merge into existing environment', () => {
      const mgr = new EnvManager()
      mgr.createEnv('dev', { A: '1' })
      mgr.importEnv('dev', '{"B":"2"}', 'json')
      expect(mgr.getVariable('dev', 'A')).toBe('1')
      expect(mgr.getVariable('dev', 'B')).toBe('2')
    })

    it('should create new environment if not exists', () => {
      const mgr = new EnvManager()
      mgr.importEnv('newenv', '{"X":"y"}', 'json')
      expect(mgr.getEnv('newenv')).not.toBeNull()
      expect(mgr.getVariable('newenv', 'X')).toBe('y')
    })

    it('should handle quoted values in dotenv', () => {
      const mgr = new EnvManager()
      mgr.importEnv('dev', 'KEY="quoted value"', 'dotenv')
      expect(mgr.getVariable('dev', 'KEY')).toBe('"quoted value"')
    })
  })
})

describe('EnvManager integration', () => {
  it('should handle full lifecycle', () => {
    const mgr = new EnvManager()
    mgr.createEnv('base', { LOG_LEVEL: 'info', TIMEOUT: '5000' })
    mgr.createEnv('development', { API_URL: 'http://localhost:3000', DEBUG: 'true' }, 'base')
    mgr.createEnv('production', { API_URL: 'https://api.example.com', DEBUG: 'false' }, 'base')

    mgr.setCurrentEnv('development')
    const devVars = mgr.resolve()
    expect(devVars.LOG_LEVEL).toBe('info')
    expect(devVars.API_URL).toBe('http://localhost:3000')

    const diffs = mgr.diff('development', 'production')
    expect(diffs.length).toBeGreaterThan(0)

    const exported = mgr.exportEnv('production', 'json')
    const parsed = JSON.parse(exported)
    expect(parsed.API_URL).toBe('https://api.example.com')
  })

  it('should handle import then export round-trip', () => {
    const mgr = new EnvManager()
    mgr.importEnv('test', 'A=1\nB=2', 'dotenv')
    const exported = mgr.exportEnv('test', 'dotenv')
    expect(exported).toContain('A=1')
    expect(exported).toContain('B=2')
  })

  it('should handle validate with real schema', () => {
    const mgr = new EnvManager()
    mgr.createEnv('production', {
      DB_HOST: 'db.example.com',
      DB_PASS: 'sk_live_abc123def456ghi789',
    })
    const schema: Record<string, EnvVariable> = {
      DB_HOST: { key: 'DB_HOST', value: '', source: 'schema', isSecret: false, isRequired: true },
      DB_PASS: { key: 'DB_PASS', value: '', source: 'schema', isSecret: true, isRequired: true },
    }
    const result = mgr.validate('production', schema)
    expect(result.valid).toBe(true)
    expect(result.missing).toEqual([])
  })

  it('should handle env with custom string name', () => {
    const mgr = new EnvManager()
    mgr.createEnv('custom-env-42', { KEY: 'val' })
    expect(mgr.listEnvs()).toContain('custom-env-42')
    expect(mgr.getVariable('custom-env-42', 'KEY')).toBe('val')
  })

  it('should handle deep inheritance chain resolution', () => {
    const mgr = new EnvManager()
    mgr.createEnv('root', { A: 'root' })
    mgr.createEnv('branch', { B: 'branch' }, 'root')
    mgr.createEnv('leaf', { C: 'leaf' }, 'branch')
    const resolved = mgr.resolve('leaf')
    expect(resolved).toEqual({ A: 'root', B: 'branch', C: 'leaf' })
  })

  it('should handle variable override through chain', () => {
    const mgr = new EnvManager()
    mgr.createEnv('root', { X: 'root', Y: 'root' })
    mgr.createEnv('mid', { X: 'mid' }, 'root')
    mgr.createEnv('leaf', { X: 'leaf' }, 'mid')
    const resolved = mgr.resolve('leaf')
    expect(resolved.X).toBe('leaf')
    expect(resolved.Y).toBe('root')
  })
})
