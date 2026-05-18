import { describe, it, expect } from 'vitest'
import { ConfigReader } from '../src/core/config-normalizer/config-reader.js'
import { ConfigNormalizer } from '../src/core/config-normalizer/config-normalizer.js'
import type { ConfigObject, ConfigSource, SchemaProperty } from '../src/core/config-normalizer/types.js'

// ─── ConfigReader.readJSON ─────────────────────────────────────────
describe('ConfigReader.readJSON', () => {
  const reader = new ConfigReader()

  it('parses valid JSON object', () => {
    expect(reader.readJSON('{"a":1}')).toEqual({ a: 1 })
  })

  it('parses nested JSON', () => {
    expect(reader.readJSON('{"db":{"host":"localhost"}}')).toEqual({ db: { host: 'localhost' } })
  })

  it('throws for non-object JSON', () => {
    expect(() => reader.readJSON('"string"')).toThrow('must be an object')
    expect(() => reader.readJSON('[1,2]')).toThrow('must be an object')
    expect(() => reader.readJSON('null')).toThrow('must be an object')
  })
})

// ─── ConfigReader.readENV ──────────────────────────────────────────
describe('ConfigReader.readENV', () => {
  const reader = new ConfigReader()

  it('reads prefixed env vars', () => {
    const result = reader.readENV({ APP_HOST: 'localhost', APP_PORT: '3000' }, 'APP')
    expect(result).toEqual({ host: 'localhost', port: 3000 })
  })

  it('ignores non-prefixed vars', () => {
    const result = reader.readENV({ APP_X: '1', OTHER: '2' }, 'APP')
    expect('x' in result).toBe(true)
    expect('other' in result).toBe(false)
  })

  it('parses boolean values', () => {
    const result = reader.readENV({ APP_DEBUG: 'true', APP_VERBOSE: 'false' }, 'APP')
    expect(result.debug).toBe(true)
    expect(result.verbose).toBe(false)
  })

  it('parses integers', () => {
    const result = reader.readENV({ APP_COUNT: '42', APP_NEG: '-5' }, 'APP')
    expect(result.count).toBe(42)
    expect(result.neg).toBe(-5)
  })

  it('parses floats', () => {
    const result = reader.readENV({ APP_RATE: '3.14' }, 'APP')
    expect(result.rate).toBe(3.14)
  })

  it('parses null and undefined', () => {
    const result = reader.readENV({ APP_NULL: 'null', APP_UNDEF: 'undefined' }, 'APP')
    expect(result['null']).toBeNull()
    expect(result['undefined']).toBeUndefined()
  })

  it('handles trailing underscore in prefix', () => {
    const result = reader.readENV({ APP_X: '1' }, 'APP_')
    expect(result.x).toBe(1)
  })
})

// ─── ConfigReader.readArgs ─────────────────────────────────────────
describe('ConfigReader.readArgs', () => {
  const reader = new ConfigReader()

  it('parses --key=value args', () => {
    expect(reader.readArgs(['--host=localhost', '--port=3000'])).toEqual({
      host: 'localhost',
      port: 3000,
    })
  })

  it('parses boolean --flag args', () => {
    expect(reader.readArgs(['--verbose'])).toEqual({ verbose: true })
  })

  it('ignores non-flag args', () => {
    expect(reader.readArgs(['positional', '-s'])).toEqual({})
  })

  it('parses boolean and null in values', () => {
    expect(reader.readArgs(['--debug=true', '--nope=false', '--nil=null'])).toEqual({
      debug: true,
      nope: false,
      nil: null,
    })
  })
})

// ─── ConfigReader.merge ────────────────────────────────────────────
describe('ConfigReader.merge', () => {
  const reader = new ConfigReader()

  it('merges multiple objects', () => {
    expect(reader.merge([{ a: 1 }, { b: 2 }, { a: 3 }])).toEqual({ a: 3, b: 2 })
  })

  it('skips undefined values', () => {
    expect(reader.merge([{ a: 1 }, { a: undefined }])).toEqual({ a: 1 })
  })

  it('returns empty for empty array', () => {
    expect(reader.merge([])).toEqual({})
  })
})

// ─── ConfigReader.deepMerge ────────────────────────────────────────
describe('ConfigReader.deepMerge', () => {
  const reader = new ConfigReader()

  it('deep merges nested objects', () => {
    expect(reader.deepMerge({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({ a: { x: 1, y: 2 } })
  })

  it('overrides primitives', () => {
    expect(reader.deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 })
  })

  it('adds new keys', () => {
    expect(reader.deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })
})

// ─── ConfigReader.flatten / unflatten ──────────────────────────────
describe('ConfigReader.flatten / unflatten', () => {
  const reader = new ConfigReader()

  it('flattens nested object', () => {
    expect(reader.flatten({ a: { b: { c: 1 } }, d: 2 })).toEqual({
      'a.b.c': 1,
      d: 2,
    })
  })

  it('unflatten reconstructs object', () => {
    expect(reader.unflatten({ 'a.b.c': 1, d: 2 })).toEqual({
      a: { b: { c: 1 } },
      d: 2,
    })
  })

  it('round-trips flatten → unflatten', () => {
    const original = { a: { b: 1 }, c: 2 }
    const flat = reader.flatten(original)
    expect(reader.unflatten(flat)).toEqual(original)
  })
})

// ─── ConfigReader.getByPath / setByPath ────────────────────────────
describe('ConfigReader.getByPath / setByPath', () => {
  const reader = new ConfigReader()

  it('gets nested value by path', () => {
    expect(reader.getByPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
  })

  it('returns undefined for missing path', () => {
    expect(reader.getByPath({ a: 1 }, 'x.y')).toBeUndefined()
  })

  it('setByPath creates nested structure', () => {
    const obj: ConfigObject = {}
    reader.setByPath(obj, 'a.b.c', 99)
    expect(obj).toEqual({ a: { b: { c: 99 } } })
  })

  it('setByPath overwrites existing', () => {
    const obj: ConfigObject = { a: { b: 1 } }
    reader.setByPath(obj, 'a.b', 2)
    expect(obj).toEqual({ a: { b: 2 } })
  })
})

// ─── ConfigNormalizer.normalize ────────────────────────────────────
describe('ConfigNormalizer.normalize', () => {
  const norm = new ConfigNormalizer()

  it('merges sources by priority', () => {
    const sources: ConfigSource[] = [
      { name: 'defaults', priority: 0, data: { a: 1, b: 2 } },
      { name: 'override', priority: 10, data: { b: 3, c: 4 } },
    ]
    const result = norm.normalize(sources)
    expect(result.data).toEqual({ a: 1, b: 3, c: 4 })
    expect(result.sources).toEqual(['defaults', 'override'])
  })

  it('applies defaults for missing keys', () => {
    const result = norm.normalize([], { defaults: { x: 42, y: 'hello' } })
    expect(result.data.x).toBe(42)
    expect(result.data.y).toBe('hello')
    expect(result.appliedDefaults).toEqual(['x', 'y'])
  })

  it('does not override existing with defaults', () => {
    const sources: ConfigSource[] = [{ name: 'src', priority: 0, data: { x: 'existing' } }]
    const result = norm.normalize(sources, { defaults: { x: 'default' } })
    expect(result.data.x).toBe('existing')
    expect(result.appliedDefaults).toHaveLength(0)
  })

  it('applies aliases', () => {
    const sources: ConfigSource[] = [{ name: 'src', priority: 0, data: { host: 'localhost' } }]
    const result = norm.normalize(sources, { aliases: { host: 'hostname' } })
    expect(result.data.hostname).toBe('localhost')
    expect('host' in result.data).toBe(false)
  })

  it('keeps target when both alias and target exist', () => {
    const sources: ConfigSource[] = [{ name: 'src', priority: 0, data: { host: 'a', hostname: 'b' } }]
    const result = norm.normalize(sources, { aliases: { host: 'hostname' } })
    expect(result.data.hostname).toBe('b')
    expect('host' in result.data).toBe(false)
  })

  it('converts to camelCase when enabled', () => {
    const sources: ConfigSource[] = [{ name: 'src', priority: 0, data: { my_key: 1, other_value: 2 } }]
    const result = norm.normalize(sources, { camelCase: true })
    expect(result.data.myKey).toBe(1)
    expect(result.data.otherValue).toBe(2)
  })

  it('strips unknown keys when allowUnknown=false', () => {
    const sources: ConfigSource[] = [{ name: 'src', priority: 0, data: { known: 1, unknown: 2 } }]
    const result = norm.normalize(sources, { allowUnknown: false, defaults: { known: 0 } })
    expect(result.data.known).toBe(1)
    expect('unknown' in result.data).toBe(false)
    expect(result.warnings).toContain('Unknown key stripped: unknown')
  })

  it('warns on missing required keys', () => {
    const result = norm.normalize([], { requiredKeys: ['api_key', 'secret'] })
    expect(result.warnings).toContain('Missing required key: api_key')
    expect(result.warnings).toContain('Missing required key: secret')
  })

  it('tracks overrides', () => {
    const sources: ConfigSource[] = [
      { name: 'base', priority: 0, data: { x: 1 } },
      { name: 'override', priority: 10, data: { x: 2 } },
    ]
    const result = norm.normalize(sources)
    expect(result.overridden.x).toEqual({ from: 'base', to: 'override', key: 'x' })
  })

  it('returns empty for no sources', () => {
    const result = norm.normalize([])
    expect(result.data).toEqual({})
    expect(result.sources).toEqual([])
    expect(result.warnings).toEqual([])
  })
})

// ─── ConfigNormalizer.applyDefaults ────────────────────────────────
describe('ConfigNormalizer.applyDefaults', () => {
  const norm = new ConfigNormalizer()

  it('applies missing defaults', () => {
    const { data, applied } = norm.applyDefaults({ a: 1 }, { b: 2, c: 3 })
    expect(data).toEqual({ a: 1, b: 2, c: 3 })
    expect(applied).toEqual(['b', 'c'])
  })

  it('does not overwrite existing', () => {
    const { data, applied } = norm.applyDefaults({ a: 1 }, { a: 99 })
    expect(data.a).toBe(1)
    expect(applied).toEqual([])
  })
})

// ─── ConfigNormalizer.applyAliases ─────────────────────────────────
describe('ConfigNormalizer.applyAliases', () => {
  const norm = new ConfigNormalizer()

  it('renames alias to target', () => {
    expect(norm.applyAliases({ host: 'x' }, { host: 'hostname' })).toEqual({ hostname: 'x' })
  })

  it('no-ops when no aliases match', () => {
    expect(norm.applyAliases({ a: 1 }, { b: 'c' })).toEqual({ a: 1 })
  })
})

// ─── ConfigNormalizer.convertCase ──────────────────────────────────
describe('ConfigNormalizer.convertCase', () => {
  const norm = new ConfigNormalizer()

  it('converts snake_case to camelCase', () => {
    expect(norm.convertCase({ my_key: 1 }, true)).toEqual({ myKey: 1 })
  })

  it('converts kebab-case to camelCase', () => {
    expect(norm.convertCase({ 'my-key': 1 }, true)).toEqual({ myKey: 1 })
  })

  it('converts camelCase to snake_case', () => {
    expect(norm.convertCase({ myKey: 1 }, false)).toEqual({ my_key: 1 })
  })

  it('converts nested objects', () => {
    expect(norm.convertCase({ my_obj: { nested_key: 1 } }, true)).toEqual({
      myObj: { nestedKey: 1 },
    })
  })

  it('converts arrays of objects', () => {
    expect(norm.convertCase({ items: [{ item_name: 'a' }] }, true)).toEqual({
      items: [{ itemName: 'a' }],
    })
  })
})

// ─── ConfigNormalizer.validateRequired ─────────────────────────────
describe('ConfigNormalizer.validateRequired', () => {
  const norm = new ConfigNormalizer()

  it('returns missing keys', () => {
    expect(norm.validateRequired({ a: 1 }, ['a', 'b'])).toEqual(['b'])
  })

  it('returns keys with null/undefined values', () => {
    expect(norm.validateRequired({ a: null, b: undefined }, ['a', 'b'])).toEqual(['a', 'b'])
  })

  it('returns empty when all present', () => {
    expect(norm.validateRequired({ a: 1, b: 2 }, ['a', 'b'])).toEqual([])
  })
})

// ─── ConfigNormalizer.validateSchema ───────────────────────────────
describe('ConfigNormalizer.validateSchema', () => {
  const norm = new ConfigNormalizer()

  it('reports missing required keys', () => {
    const schema: Record<string, SchemaProperty> = {
      name: { type: 'string', required: true },
    }
    expect(norm.validateSchema({}, schema)).toContain('Missing required key: name')
  })

  it('reports type mismatches', () => {
    const schema: Record<string, SchemaProperty> = {
      port: { type: 'number', required: true },
    }
    expect(norm.validateSchema({ port: 'not-a-number' }, schema)).toContain(
      'Key "port" expected type "number" but got "string"',
    )
  })

  it('reports enum violations', () => {
    const schema: Record<string, SchemaProperty> = {
      env: { type: 'string', required: true, enum: ['dev', 'prod'] },
    }
    expect(norm.validateSchema({ env: 'staging' }, schema)).toContain(
      'Key "env" value must be one of: dev, prod',
    )
  })

  it('passes valid data', () => {
    const schema: Record<string, SchemaProperty> = {
      name: { type: 'string', required: true },
      port: { type: 'number', required: false },
    }
    expect(norm.validateSchema({ name: 'test', port: 3000 }, schema)).toEqual([])
  })

  it('skips optional missing keys', () => {
    const schema: Record<string, SchemaProperty> = {
      port: { type: 'number', required: false },
    }
    expect(norm.validateSchema({}, schema)).toEqual([])
  })
})

// ─── ConfigNormalizer.resolveOverrides ─────────────────────────────
describe('ConfigNormalizer.resolveOverrides', () => {
  const norm = new ConfigNormalizer()

  it('tracks overrides across sources', () => {
    const sources: ConfigSource[] = [
      { name: 'base', priority: 0, data: { x: 1 } },
      { name: 'env', priority: 10, data: { x: 2 } },
    ]
    const overrides = norm.resolveOverrides(sources)
    expect(overrides.x).toEqual({ from: 'base', to: 'env', key: 'x' })
  })

  it('returns empty when no overrides', () => {
    const sources: ConfigSource[] = [
      { name: 'a', priority: 0, data: { x: 1 } },
      { name: 'b', priority: 1, data: { y: 2 } },
    ]
    expect(Object.keys(norm.resolveOverrides(sources))).toHaveLength(0)
  })
})

// ─── ConfigNormalizer.stripUnknown ─────────────────────────────────
describe('ConfigNormalizer.stripUnknown', () => {
  const norm = new ConfigNormalizer()

  it('strips unknown keys', () => {
    const { data, stripped } = norm.stripUnknown({ a: 1, b: 2, c: 3 }, ['a', 'c'])
    expect(data).toEqual({ a: 1, c: 3 })
    expect(stripped).toEqual(['b'])
  })

  it('keeps all when all known', () => {
    const { data, stripped } = norm.stripUnknown({ a: 1 }, ['a'])
    expect(data).toEqual({ a: 1 })
    expect(stripped).toEqual([])
  })
})
