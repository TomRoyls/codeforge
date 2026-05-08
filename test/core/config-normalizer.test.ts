import { describe, it, expect } from 'vitest'
import { ConfigReader } from '../../src/core/config-normalizer/config-reader.js'
import { ConfigNormalizer } from '../../src/core/config-normalizer/config-normalizer.js'
import type { ConfigSource, SchemaProperty } from '../../src/core/config-normalizer/types.js'

describe('ConfigReader', () => {
  const reader = new ConfigReader()

  describe('readJSON', () => {
    it('should parse valid JSON object', () => {
      const result = reader.readJSON('{"name":"test","port":3000}')
      expect(result.name).toBe('test')
      expect(result.port).toBe(3000)
    })

    it('should parse nested JSON object', () => {
      const result = reader.readJSON('{"db":{"host":"localhost","port":5432}}')
      const db = result.db as Record<string, unknown>
      expect(db.host).toBe('localhost')
      expect(db.port).toBe(5432)
    })

    it('should throw on non-object JSON', () => {
      expect(() => reader.readJSON('"hello"')).toThrow('JSON config must be an object')
      expect(() => reader.readJSON('42')).toThrow('JSON config must be an object')
      expect(() => reader.readJSON('[1,2,3]')).toThrow('JSON config must be an object')
    })

    it('should throw on invalid JSON', () => {
      expect(() => reader.readJSON('{invalid}')).toThrow()
    })

    it('should parse JSON with null values', () => {
      const result = reader.readJSON('{"key":null}')
      expect(result.key).toBeNull()
    })

    it('should parse JSON with boolean values', () => {
      const result = reader.readJSON('{"enabled":true,"disabled":false}')
      expect(result.enabled).toBe(true)
      expect(result.disabled).toBe(false)
    })
  })

  describe('readENV', () => {
    it('should parse env vars with prefix', () => {
      const env = { APP_HOST: 'localhost', APP_PORT: '3000' }
      const result = reader.readENV(env, 'APP')
      expect(result.host).toBe('localhost')
      expect(result.port).toBe(3000)
    })

    it('should skip env vars without prefix', () => {
      const env = { APP_HOST: 'localhost', OTHER_VAR: 'value' }
      const result = reader.readENV(env, 'APP')
      expect(result.host).toBe('localhost')
      expect('var' in result).toBe(false)
    })

    it('should handle prefix with trailing underscore', () => {
      const env = { APP_HOST: 'localhost' }
      const result = reader.readENV(env, 'APP_')
      expect(result.host).toBe('localhost')
    })

    it('should parse boolean env values', () => {
      const env = { APP_DEBUG: 'true', APP_VERBOSE: 'false' }
      const result = reader.readENV(env, 'APP')
      expect(result.debug).toBe(true)
      expect(result.verbose).toBe(false)
    })

    it('should parse null env value', () => {
      const env = { APP_KEY: 'null' }
      const result = reader.readENV(env, 'APP')
      expect(result.key).toBeNull()
    })

    it('should parse integer env values', () => {
      const env = { APP_COUNT: '42', APP_NEG: '-5' }
      const result = reader.readENV(env, 'APP')
      expect(result.count).toBe(42)
      expect(result.neg).toBe(-5)
    })

    it('should parse float env values', () => {
      const env = { APP_RATE: '3.14' }
      const result = reader.readENV(env, 'APP')
      expect(result.rate).toBe(3.14)
    })

    it('should return empty object for no matching env vars', () => {
      const result = reader.readENV({}, 'APP')
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should lowercase env key names', () => {
      const env = { APP_MY_SETTING: 'value' }
      const result = reader.readENV(env, 'APP')
      expect(result['my_setting']).toBe('value')
    })
  })

  describe('readArgs', () => {
    it('should parse --key=value arguments', () => {
      const result = reader.readArgs(['--host=localhost', '--port=3000'])
      expect(result.host).toBe('localhost')
      expect(result.port).toBe(3000)
    })

    it('should parse --flag as boolean true', () => {
      const result = reader.readArgs(['--verbose', '--debug'])
      expect(result.verbose).toBe(true)
      expect(result.debug).toBe(true)
    })

    it('should skip non-flag arguments', () => {
      const result = reader.readArgs(['command', '--flag=yes', 'positional'])
      expect(result.flag).toBe('yes')
      expect(Object.keys(result)).toHaveLength(1)
    })

    it('should parse boolean arg values', () => {
      const result = reader.readArgs(['--enabled=true', '--disabled=false'])
      expect(result.enabled).toBe(true)
      expect(result.disabled).toBe(false)
    })

    it('should parse numeric arg values', () => {
      const result = reader.readArgs(['--count=10', '--rate=2.5'])
      expect(result.count).toBe(10)
      expect(result.rate).toBe(2.5)
    })

    it('should return empty object for no args', () => {
      const result = reader.readArgs([])
      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe('merge', () => {
    it('should merge multiple objects', () => {
      const result = reader.merge([
        { a: 1 },
        { b: 2 },
        { c: 3 },
      ])
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should prefer later objects for same keys', () => {
      const result = reader.merge([{ key: 'first' }, { key: 'second' }])
      expect(result.key).toBe('second')
    })

    it('should skip undefined values', () => {
      const result = reader.merge([{ a: 1, b: undefined }])
      expect(result.a).toBe(1)
      expect('b' in result).toBe(false)
    })

    it('should handle empty array', () => {
      const result = reader.merge([])
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle single object', () => {
      const result = reader.merge([{ key: 'value' }])
      expect(result).toEqual({ key: 'value' })
    })
  })

  describe('deepMerge', () => {
    it('should merge flat objects', () => {
      const result = reader.deepMerge({ a: 1 }, { b: 2 })
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should recursively merge nested objects', () => {
      const result = reader.deepMerge(
        { db: { host: 'localhost', port: 5432 } },
        { db: { port: 3306, user: 'admin' } },
      )
      expect(result).toEqual({
        db: { host: 'localhost', port: 3306, user: 'admin' },
      })
    })

    it('should override non-object with object', () => {
      const result = reader.deepMerge({ key: 'value' }, { key: { nested: true } })
      expect(result).toEqual({ key: { nested: true } })
    })

    it('should override object with non-object', () => {
      const result = reader.deepMerge({ key: { nested: true } }, { key: 'value' })
      expect(result).toEqual({ key: 'value' })
    })

    it('should not mutate base object', () => {
      const base = { a: 1 }
      reader.deepMerge(base, { b: 2 })
      expect(base).toEqual({ a: 1 })
    })

    it('should handle deeply nested merge', () => {
      const result = reader.deepMerge(
        { a: { b: { c: 1, d: 2 } } },
        { a: { b: { c: 3 } } },
      )
      expect(result).toEqual({ a: { b: { c: 3, d: 2 } } })
    })
  })

  describe('flatten', () => {
    it('should flatten nested object', () => {
      const result = reader.flatten({ a: { b: { c: 1 } } })
      expect(result).toEqual({ 'a.b.c': 1 })
    })

    it('should preserve top-level keys', () => {
      const result = reader.flatten({ x: 1, y: 2 })
      expect(result).toEqual({ x: 1, y: 2 })
    })

    it('should handle mixed nesting', () => {
      const result = reader.flatten({ a: 1, b: { c: 2 } })
      expect(result).toEqual({ a: 1, 'b.c': 2 })
    })

    it('should use custom prefix', () => {
      const result = reader.flatten({ a: 1 }, 'ns')
      expect(result).toEqual({ 'ns.a': 1 })
    })

    it('should handle arrays as leaf values', () => {
      const result = reader.flatten({ items: [1, 2, 3] })
      expect(result).toEqual({ items: [1, 2, 3] })
    })
  })

  describe('unflatten', () => {
    it('should unflatten dot-notation keys', () => {
      const result = reader.unflatten({ 'a.b.c': 1 })
      expect(result).toEqual({ a: { b: { c: 1 } } })
    })

    it('should handle top-level keys', () => {
      const result = reader.unflatten({ x: 1, y: 2 })
      expect(result).toEqual({ x: 1, y: 2 })
    })

    it('should round-trip flatten/unflatten', () => {
      const original = { a: { b: 1 }, c: 2 }
      const flat = reader.flatten(original)
      const result = reader.unflatten(flat)
      expect(result).toEqual(original)
    })
  })

  describe('getByPath', () => {
    it('should get top-level value', () => {
      expect(reader.getByPath({ a: 1 }, 'a')).toBe(1)
    })

    it('should get nested value', () => {
      expect(reader.getByPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
    })

    it('should return undefined for missing path', () => {
      expect(reader.getByPath({ a: 1 }, 'b')).toBeUndefined()
    })

    it('should return undefined for partial missing path', () => {
      expect(reader.getByPath({ a: { b: 1 } }, 'a.c')).toBeUndefined()
    })

    it('should return undefined for null intermediate', () => {
      expect(reader.getByPath({ a: null }, 'a.b')).toBeUndefined()
    })
  })

  describe('setByPath', () => {
    it('should set top-level value', () => {
      const obj: Record<string, unknown> = {}
      reader.setByPath(obj, 'key', 'value')
      expect(obj.key).toBe('value')
    })

    it('should set nested value creating intermediate objects', () => {
      const obj: Record<string, unknown> = {}
      reader.setByPath(obj, 'a.b.c', 42)
      expect(obj).toEqual({ a: { b: { c: 42 } } })
    })

    it('should overwrite existing value', () => {
      const obj = { key: 'old' }
      reader.setByPath(obj, 'key', 'new')
      expect(obj.key).toBe('new')
    })

    it('should overwrite non-object intermediate with object', () => {
      const obj: Record<string, unknown> = { a: 'flat' }
      reader.setByPath(obj, 'a.b', 'nested')
      expect(obj).toEqual({ a: { b: 'nested' } })
    })
  })
})

describe('ConfigNormalizer', () => {
  const normalizer = new ConfigNormalizer()

  describe('normalize', () => {
    it('should normalize with single source', () => {
      const sources: ConfigSource[] = [
        { name: 'defaults', priority: 1, data: { host: 'localhost' } },
      ]
      const result = normalizer.normalize(sources)
      expect(result.data.host).toBe('localhost')
      expect(result.sources).toEqual(['defaults'])
    })

    it('should respect priority order', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: { port: 3000 } },
        { name: 'env', priority: 10, data: { port: 8080 } },
      ]
      const result = normalizer.normalize(sources)
      expect(result.data.port).toBe(8080)
    })

    it('should merge from multiple sources', () => {
      const sources: ConfigSource[] = [
        { name: 'defaults', priority: 1, data: { host: 'localhost' } },
        { name: 'file', priority: 5, data: { port: 3000 } },
        { name: 'env', priority: 10, data: { debug: true } },
      ]
      const result = normalizer.normalize(sources)
      expect(result.data.host).toBe('localhost')
      expect(result.data.port).toBe(3000)
      expect(result.data.debug).toBe(true)
    })

    it('should apply defaults for missing keys', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: { host: 'localhost' } },
      ]
      const result = normalizer.normalize(sources, {
        defaults: { port: 3000, host: '0.0.0.0' },
      })
      expect(result.data.host).toBe('localhost')
      expect(result.data.port).toBe(3000)
      expect(result.appliedDefaults).toEqual(['port'])
    })

    it('should track override conflicts', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: { port: 3000 } },
        { name: 'env', priority: 10, data: { port: 8080 } },
      ]
      const result = normalizer.normalize(sources)
      expect(result.overridden['port']).toBeDefined()
      expect(result.overridden['port']?.from).toBe('file')
      expect(result.overridden['port']?.to).toBe('env')
    })

    it('should apply aliases', () => {
      const sources: ConfigSource[] = [
        { name: 'cli', priority: 10, data: { h: 'example.com' } },
      ]
      const result = normalizer.normalize(sources, {
        aliases: { h: 'host' },
      })
      expect(result.data.host).toBe('example.com')
    })

    it('should warn on missing required keys', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: {} },
      ]
      const result = normalizer.normalize(sources, {
        requiredKeys: ['database'],
      })
      expect(result.warnings).toContain('Missing required key: database')
    })

    it('should strip unknown keys when allowUnknown is false', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: { known: 'yes', unknown: 'no' } },
      ]
      const result = normalizer.normalize(sources, {
        allowUnknown: false,
        defaults: { known: 'default' },
      })
      expect(result.data.known).toBe('yes')
      expect('unknown' in result.data).toBe(false)
      expect(result.warnings.some((w) => w.includes('Unknown key stripped'))).toBe(true)
    })

    it('should convert to camelCase when enabled', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: { my_key: 'value' } },
      ]
      const result = normalizer.normalize(sources, { camelCase: true })
      expect(result.data['myKey']).toBe('value')
    })
  })

  describe('applyDefaults', () => {
    it('should apply missing defaults', () => {
      const result = normalizer.applyDefaults({ a: 1 }, { b: 2, c: 3 })
      expect(result.data).toEqual({ a: 1, b: 2, c: 3 })
      expect(result.applied).toEqual(['b', 'c'])
    })

    it('should not override existing values', () => {
      const result = normalizer.applyDefaults({ a: 1 }, { a: 99 })
      expect(result.data.a).toBe(1)
      expect(result.applied).toEqual([])
    })

    it('should handle empty defaults', () => {
      const result = normalizer.applyDefaults({ a: 1 }, {})
      expect(result.data).toEqual({ a: 1 })
      expect(result.applied).toEqual([])
    })

    it('should handle empty data', () => {
      const result = normalizer.applyDefaults({}, { a: 1 })
      expect(result.data).toEqual({ a: 1 })
      expect(result.applied).toEqual(['a'])
    })
  })

  describe('applyAliases', () => {
    it('should rename aliased keys', () => {
      const result = normalizer.applyAliases(
        { h: 'localhost' },
        { h: 'host' },
      )
      expect(result.host).toBe('localhost')
      expect('h' in result).toBe(false)
    })

    it('should not alias when target already exists', () => {
      const result = normalizer.applyAliases(
        { h: 'short', host: 'full' },
        { h: 'host' },
      )
      expect(result.host).toBe('full')
      expect('h' in result).toBe(false)
    })

    it('should handle empty aliases', () => {
      const result = normalizer.applyAliases({ a: 1 }, {})
      expect(result).toEqual({ a: 1 })
    })

    it('should handle alias not present in data', () => {
      const result = normalizer.applyAliases(
        { host: 'localhost' },
        { h: 'host' },
      )
      expect(result).toEqual({ host: 'localhost' })
    })
  })

  describe('convertCase', () => {
    it('should convert snake_case to camelCase', () => {
      const result = normalizer.convertCase({ my_key: 'value' }, true)
      expect(result['myKey']).toBe('value')
    })

    it('should convert kebab-case to camelCase', () => {
      const result = normalizer.convertCase({ 'my-key': 'value' }, true)
      expect(result['myKey']).toBe('value')
    })

    it('should convert camelCase to snake_case', () => {
      const result = normalizer.convertCase({ myKey: 'value' }, false)
      expect(result['my_key']).toBe('value')
    })

    it('should handle nested objects recursively', () => {
      const result = normalizer.convertCase(
        { outer_key: { inner_key: 'value' } },
        true,
      )
      const outer = result['outerKey'] as Record<string, unknown>
      expect(outer['innerKey']).toBe('value')
    })

    it('should handle arrays with objects', () => {
      const result = normalizer.convertCase(
        { items: [{ item_name: 'a' }, { item_name: 'b' }] },
        true,
      )
      const items = result.items as Array<Record<string, unknown>>
      expect(items[0]?.['itemName']).toBe('a')
      expect(items[1]?.['itemName']).toBe('b')
    })

    it('should preserve primitive values in arrays', () => {
      const result = normalizer.convertCase({ items: [1, 'two', true] }, true)
      expect(result.items).toEqual([1, 'two', true])
    })
  })

  describe('validateRequired', () => {
    it('should return missing keys', () => {
      const result = normalizer.validateRequired({ a: 1 }, ['a', 'b', 'c'])
      expect(result).toEqual(['b', 'c'])
    })

    it('should return empty array when all present', () => {
      const result = normalizer.validateRequired({ a: 1, b: 2 }, ['a', 'b'])
      expect(result).toEqual([])
    })

    it('should treat null as missing', () => {
      const result = normalizer.validateRequired({ a: null }, ['a'])
      expect(result).toEqual(['a'])
    })

    it('should treat undefined as missing', () => {
      const result = normalizer.validateRequired({ a: undefined }, ['a'])
      expect(result).toEqual(['a'])
    })

    it('should handle empty required list', () => {
      const result = normalizer.validateRequired({}, [])
      expect(result).toEqual([])
    })
  })

  describe('validateSchema', () => {
    const schema: Record<string, SchemaProperty> = {
      name: { type: 'string', required: true },
      port: { type: 'number', required: true },
      debug: { type: 'boolean', required: false },
      tags: { type: 'array', required: false },
      meta: { type: 'object', required: false },
      mode: { type: 'string', required: false, enum: ['dev', 'prod', 'test'] },
    }

    it('should return empty errors for valid data', () => {
      const errors = normalizer.validateSchema(
        { name: 'app', port: 3000 },
        schema,
      )
      expect(errors).toEqual([])
    })

    it('should report missing required keys', () => {
      const errors = normalizer.validateSchema({}, schema)
      expect(errors).toContain('Missing required key: name')
      expect(errors).toContain('Missing required key: port')
    })

    it('should report type mismatches', () => {
      const errors = normalizer.validateSchema(
        { name: 42, port: '3000' },
        schema,
      )
      expect(errors.some((e) => e.includes('"name"'))).toBe(true)
      expect(errors.some((e) => e.includes('"port"'))).toBe(true)
    })

    it('should report enum violations', () => {
      const errors = normalizer.validateSchema(
        { name: 'app', port: 3000, mode: 'invalid' },
        schema,
      )
      expect(errors.some((e) => e.includes('must be one of'))).toBe(true)
    })

    it('should accept valid enum values', () => {
      const errors = normalizer.validateSchema(
        { name: 'app', port: 3000, mode: 'dev' },
        schema,
      )
      expect(errors).toEqual([])
    })

    it('should validate array type', () => {
      const errors = normalizer.validateSchema(
        { name: 'app', port: 3000, tags: 'not-array' },
        schema,
      )
      expect(errors.some((e) => e.includes('"tags"'))).toBe(true)
    })

    it('should validate object type', () => {
      const errors = normalizer.validateSchema(
        { name: 'app', port: 3000, meta: [1, 2] },
        schema,
      )
      expect(errors.some((e) => e.includes('"meta"'))).toBe(true)
    })

    it('should skip non-required missing keys', () => {
      const errors = normalizer.validateSchema(
        { name: 'app', port: 3000 },
        schema,
      )
      expect(errors).toEqual([])
    })
  })

  describe('resolveOverrides', () => {
    it('should detect key overrides between sources', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: { port: 3000 } },
        { name: 'env', priority: 10, data: { port: 8080 } },
      ]
      const result = normalizer.resolveOverrides(sources)
      expect(result['port']).toEqual({
        from: 'file',
        to: 'env',
        key: 'port',
      })
    })

    it('should not report overrides for unique keys', () => {
      const sources: ConfigSource[] = [
        { name: 'file', priority: 1, data: { host: 'localhost' } },
        { name: 'env', priority: 10, data: { port: 3000 } },
      ]
      const result = normalizer.resolveOverrides(sources)
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle three-way overrides', () => {
      const sources: ConfigSource[] = [
        { name: 'defaults', priority: 1, data: { key: 'a' } },
        { name: 'file', priority: 5, data: { key: 'b' } },
        { name: 'cli', priority: 10, data: { key: 'c' } },
      ]
      const result = normalizer.resolveOverrides(sources)
      expect(result['key'].from).toBe('defaults')
      expect(result['key'].to).toBe('cli')
    })

    it('should handle empty sources', () => {
      const result = normalizer.resolveOverrides([])
      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe('stripUnknown', () => {
    it('should strip unknown keys', () => {
      const result = normalizer.stripUnknown(
        { a: 1, b: 2, c: 3 },
        ['a', 'c'],
      )
      expect(result.data).toEqual({ a: 1, c: 3 })
      expect(result.stripped).toEqual(['b'])
    })

    it('should keep all known keys', () => {
      const result = normalizer.stripUnknown(
        { a: 1, b: 2 },
        ['a', 'b'],
      )
      expect(result.data).toEqual({ a: 1, b: 2 })
      expect(result.stripped).toEqual([])
    })

    it('should handle empty known keys', () => {
      const result = normalizer.stripUnknown({ a: 1, b: 2 }, [])
      expect(result.data).toEqual({})
      expect(result.stripped).toEqual(['a', 'b'])
    })

    it('should handle empty data', () => {
      const result = normalizer.stripUnknown({}, ['a', 'b'])
      expect(result.data).toEqual({})
      expect(result.stripped).toEqual([])
    })
  })
})

describe('ConfigNormalizer edge cases', () => {
  const normalizer = new ConfigNormalizer()

  it('should handle empty sources array', () => {
    const result = normalizer.normalize([])
    expect(result.data).toEqual({})
    expect(result.sources).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it('should handle all normalize options together', () => {
    const sources: ConfigSource[] = [
      { name: 'default', priority: 1, data: { my_key: 'val' } },
      { name: 'override', priority: 10, data: { my_key: 'new' } },
    ]
    const result = normalizer.normalize(sources, {
      camelCase: true,
      defaults: { extra: 42 },
      aliases: {},
      allowUnknown: true,
      requiredKeys: ['myKey'],
    })
    expect(result.data['myKey']).toBe('new')
    expect(result.data['extra']).toBe(42)
  })

  it('should handle source with empty data', () => {
    const sources: ConfigSource[] = [
      { name: 'empty', priority: 1, data: {} },
      { name: 'real', priority: 5, data: { key: 'value' } },
    ]
    const result = normalizer.normalize(sources)
    expect(result.data.key).toBe('value')
  })

  it('should handle normalize with no options', () => {
    const sources: ConfigSource[] = [
      { name: 'test', priority: 1, data: { a: 1 } },
    ]
    const result = normalizer.normalize(sources)
    expect(result.data.a).toBe(1)
    expect(result.appliedDefaults).toEqual([])
  })

  it('should handle ENV value "undefined" string', () => {
    const reader = new ConfigReader()
    const result = reader.readENV({ APP_KEY: 'undefined' }, 'APP')
    expect(result.key).toBeUndefined()
  })
})
