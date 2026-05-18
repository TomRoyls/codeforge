import { DataSerializer } from '../src/core/data-serializer/data-serializer.js'
import { SchemaVersioner } from '../src/core/data-serializer/schema-versioner.js'
import type { SchemaVersion } from '../src/core/data-serializer/types.js'

function makeMigrator(
  fn: (data: Record<string, unknown>) => Record<string, unknown>,
): (data: Record<string, unknown>) => Record<string, unknown> {
  return fn
}

const v1: SchemaVersion = {
  version: 1,
  migrator: makeMigrator((d) => ({ ...d, format: 'v1' })),
}
const v2: SchemaVersion = {
  version: 2,
  migrator: makeMigrator((d) => ({ ...d, format: 'v2', addedInV2: true })),
}
const v3: SchemaVersion = {
  version: 3,
  migrator: makeMigrator((d) => ({ ...d, format: 'v3', addedInV3: true })),
}

// ─── DataSerializer Constructor ─────────────────────────────────────────

describe('DataSerializer', () => {
  describe('constructor', () => {
    it('creates serializer with default options', () => {
      const s = new DataSerializer()
      const opts = s.getOptions()
      expect(opts.serialize.includeVersion).toBe(true)
      expect(opts.serialize.prettyPrint).toBe(false)
      expect(opts.serialize.compress).toBe(false)
      expect(opts.deserialize.strictVersion).toBe(true)
      expect(opts.deserialize.migrateToLatest).toBe(true)
    })

    it('creates serializer with custom serialize options', () => {
      const s = new DataSerializer({ prettyPrint: true, compress: true })
      const opts = s.getOptions()
      expect(opts.serialize.prettyPrint).toBe(true)
      expect(opts.serialize.compress).toBe(true)
      expect(opts.serialize.includeVersion).toBe(true)
    })

    it('creates serializer with custom deserialize options', () => {
      const s = new DataSerializer(undefined, { strictVersion: false, migrateToLatest: false })
      const opts = s.getOptions()
      expect(opts.deserialize.strictVersion).toBe(false)
      expect(opts.deserialize.migrateToLatest).toBe(false)
    })

    it('creates serializer with both options partially overridden', () => {
      const s = new DataSerializer({ includeVersion: false }, { migrateToLatest: false })
      const opts = s.getOptions()
      expect(opts.serialize.includeVersion).toBe(false)
      expect(opts.deserialize.migrateToLatest).toBe(false)
    })

    it('does not mutate the default options', () => {
      const s1 = new DataSerializer({ prettyPrint: true })
      const s2 = new DataSerializer()
      expect(s1.getOptions().serialize.prettyPrint).toBe(true)
      expect(s2.getOptions().serialize.prettyPrint).toBe(false)
    })
  })

  // ─── serialize ────────────────────────────────────────────────────────

  describe('serialize', () => {
    it('serializes a simple object to JSON string', () => {
      const s = new DataSerializer()
      const result = s.serialize({ name: 'test', value: 42 })
      expect(result).toBe('{"name":"test","value":42}')
    })

    it('serializes an empty object', () => {
      const s = new DataSerializer()
      expect(s.serialize({})).toBe('{}')
    })

    it('serializes with pretty print', () => {
      const s = new DataSerializer({ prettyPrint: true })
      const result = s.serialize({ a: 1 })
      expect(result).toBe('{\n  "a": 1\n}')
    })

    it('serializes with version info when schema is provided and includeVersion is true', () => {
      const s = new DataSerializer()
      s.registerSchema('test', [v1, v2, v3])
      const result = s.serialize({ name: 'hello' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed._version).toBe(3)
      expect(parsed._schema).toBe('test')
    })

    it('omits _schema when includeVersion is false', () => {
      const s = new DataSerializer({ includeVersion: false })
      s.registerSchema('test', [v1, v2])
      const result = s.serialize({ name: 'hello' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed._schema).toBeUndefined()
    })

    it('serializes without schema name as plain JSON', () => {
      const s = new DataSerializer()
      const result = s.serialize({ x: 1 })
      const parsed = JSON.parse(result)
      expect(parsed._version).toBeUndefined()
      expect(parsed._schema).toBeUndefined()
    })

    it('preserves nested objects', () => {
      const s = new DataSerializer()
      const data = { outer: { inner: { deep: true } } }
      const result = s.serialize(data)
      expect(JSON.parse(result)).toEqual(data)
    })

    it('serializes arrays inside objects', () => {
      const s = new DataSerializer()
      const data = { items: [1, 2, 3] }
      const result = s.serialize(data)
      expect(JSON.parse(result)).toEqual(data)
    })

    it('serializes null values', () => {
      const s = new DataSerializer()
      const result = s.serialize({ value: null })
      expect(JSON.parse(result)).toEqual({ value: null })
    })

    it('runs migrators when serializing with a schema', () => {
      const s = new DataSerializer({ includeVersion: false })
      s.registerSchema('test', [v1, v2])
      const result = s.serialize({ name: 'data' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed.format).toBe('v2')
      expect(parsed.addedInV2).toBe(true)
    })
  })

  // ─── deserialize ──────────────────────────────────────────────────────

  describe('deserialize', () => {
    it('deserializes a simple JSON string', () => {
      const s = new DataSerializer()
      const result = s.deserialize<{ name: string }>('{"name":"test"}')
      expect(result.name).toBe('test')
    })

    it('deserializes to a typed object', () => {
      const s = new DataSerializer()
      const result = s.deserialize<{ a: number; b: string }>('{"a":1,"b":"two"}')
      expect(result.a).toBe(1)
      expect(result.b).toBe('two')
    })

    it('deserializes empty object', () => {
      const s = new DataSerializer()
      const result = s.deserialize<Record<string, unknown>>('{}')
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('throws on invalid JSON', () => {
      const s = new DataSerializer()
      expect(() => s.deserialize('not json')).toThrow()
    })

    it('migrates data when version does not match and migrateToLatest is true', () => {
      const s = new DataSerializer(undefined, { strictVersion: false, migrateToLatest: true })
      s.registerSchema('test', [v1, v2, v3])
      const json = JSON.stringify({ _version: 1, name: 'data' })
      const result = s.deserialize<Record<string, unknown>>(json, 'test')
      expect(result._version).toBe(3)
      expect(result.format).toBe('v3')
      expect(result.addedInV3).toBe(true)
    })

    it('throws on version mismatch when strictVersion is true and migrateToLatest is false', () => {
      const s = new DataSerializer(undefined, { strictVersion: true, migrateToLatest: false })
      s.registerSchema('test', [v1, v2, v3])
      const json = JSON.stringify({ _version: 1, name: 'data' })
      expect(() => s.deserialize(json, 'test')).toThrow('Version mismatch')
    })

    it('does not throw when version matches and strictVersion is true', () => {
      const s = new DataSerializer(undefined, { strictVersion: true, migrateToLatest: false })
      s.registerSchema('test', [v1, v2, v3])
      const json = JSON.stringify({ _version: 3, name: 'data' })
      const result = s.deserialize<Record<string, unknown>>(json, 'test')
      expect(result.name).toBe('data')
    })

    it('skips migration when no schema name is provided', () => {
      const s = new DataSerializer()
      const json = JSON.stringify({ _version: 1, name: 'data' })
      const result = s.deserialize<Record<string, unknown>>(json)
      expect(result.name).toBe('data')
      expect(result._version).toBe(1)
    })

    it('skips version check when parsed data has no _version field', () => {
      const s = new DataSerializer(undefined, { strictVersion: true })
      s.registerSchema('test', [v1, v2])
      const json = JSON.stringify({ name: 'data' })
      const result = s.deserialize<Record<string, unknown>>(json, 'test')
      expect(result.name).toBe('data')
    })

    it('skips version check when _version is not a number', () => {
      const s = new DataSerializer(undefined, { strictVersion: true })
      s.registerSchema('test', [v1, v2])
      const json = JSON.stringify({ _version: 'two', name: 'data' })
      const result = s.deserialize<Record<string, unknown>>(json, 'test')
      expect(result.name).toBe('data')
    })
  })

  // ─── registerSchema ──────────────────────────────────────────────────

  describe('registerSchema', () => {
    it('registers a schema for use in serialize/deserialize', () => {
      const s = new DataSerializer()
      s.registerSchema('mySchema', [v1, v2])
      const result = s.serialize({ x: 1 }, 'mySchema')
      const parsed = JSON.parse(result)
      expect(parsed._schema).toBe('mySchema')
      expect(parsed._version).toBe(2)
    })

    it('throws when registering a schema with empty versions', () => {
      const s = new DataSerializer()
      expect(() => s.registerSchema('empty', [])).toThrow('must have at least one version')
    })

    it('allows registering multiple schemas', () => {
      const s = new DataSerializer()
      s.registerSchema('alpha', [v1])
      s.registerSchema('beta', [v1, v2, v3])
      const a = s.serialize({ x: 1 }, 'alpha')
      const b = s.serialize({ x: 1 }, 'beta')
      expect(JSON.parse(a)._version).toBe(1)
      expect(JSON.parse(b)._version).toBe(3)
    })
  })

  // ─── clone ───────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates a deep copy of an object', () => {
      const s = new DataSerializer()
      const original = { a: 1, b: { c: 2 } }
      const cloned = s.clone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    it('deep copies nested objects', () => {
      const s = new DataSerializer()
      const original = { nested: { deep: { value: 42 } } }
      const cloned = s.clone(original)
      cloned.nested.deep.value = 99
      expect(original.nested.deep.value).toBe(42)
    })

    it('clones arrays', () => {
      const s = new DataSerializer()
      const original = { items: [1, 2, 3] }
      const cloned = s.clone(original)
      cloned.items.push(4)
      expect(original.items).toEqual([1, 2, 3])
    })

    it('clones primitive values', () => {
      const s = new DataSerializer()
      expect(s.clone(42)).toBe(42)
      expect(s.clone('hello')).toBe('hello')
      expect(s.clone(null)).toBe(null)
    })

    it('clones an empty object', () => {
      const s = new DataSerializer()
      const cloned = s.clone({})
      expect(cloned).toEqual({})
    })
  })

  // ─── merge ───────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two flat objects', () => {
      const s = new DataSerializer()
      const result = s.merge({ a: 1, b: 2 }, { b: 3, c: 4 })
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('override takes precedence', () => {
      const s = new DataSerializer()
      const result = s.merge({ x: 'original' }, { x: 'overridden' })
      expect(result.x).toBe('overridden')
    })

    it('returns base when override is empty', () => {
      const s = new DataSerializer()
      const result = s.merge({ a: 1, b: 2 }, {})
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('returns override when base is empty', () => {
      const s = new DataSerializer()
      const result = s.merge({}, { a: 1 })
      expect(result).toEqual({ a: 1 })
    })

    it('merges two empty objects', () => {
      const s = new DataSerializer()
      expect(s.merge({}, {})).toEqual({})
    })

    it('does a shallow merge (nested objects are replaced)', () => {
      const s = new DataSerializer()
      const base = { nested: { a: 1, b: 2 } }
      const override = { nested: { a: 99 } }
      const result = s.merge(base, override)
      expect(result.nested).toEqual({ a: 99 })
    })

    it('does not mutate the original objects', () => {
      const s = new DataSerializer()
      const base = { a: 1 }
      const override = { b: 2 }
      s.merge(base, override)
      expect(base).toEqual({ a: 1 })
      expect(override).toEqual({ b: 2 })
    })
  })

  // ─── diff ────────────────────────────────────────────────────────────

  describe('diff', () => {
    it('returns empty diff for identical objects', () => {
      const s = new DataSerializer()
      const result = s.diff({ a: 1, b: 2 }, { a: 1, b: 2 })
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('detects changed values', () => {
      const s = new DataSerializer()
      const result = s.diff({ a: 1 }, { a: 2 })
      expect(result.a).toEqual({ a: 1, b: 2 })
    })

    it('detects keys only in a', () => {
      const s = new DataSerializer()
      const result = s.diff({ x: 1, y: 2 }, { x: 1 })
      expect(result.y).toEqual({ a: 2, b: undefined })
    })

    it('detects keys only in b', () => {
      const s = new DataSerializer()
      const result = s.diff({ x: 1 }, { x: 1, y: 2 })
      expect(result.y).toEqual({ a: undefined, b: 2 })
    })

    it('detects keys in both but with different values', () => {
      const s = new DataSerializer()
      const result = s.diff({ a: 1, b: 'hello' }, { a: 1, b: 'world' })
      expect(result.b).toEqual({ a: 'hello', b: 'world' })
      expect(result.a).toBeUndefined()
    })

    it('returns empty for two empty objects', () => {
      const s = new DataSerializer()
      const result = s.diff({}, {})
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('handles nested object differences via JSON.stringify comparison', () => {
      const s = new DataSerializer()
      const result = s.diff({ obj: { a: 1 } }, { obj: { a: 2 } })
      expect(result.obj).toEqual({ a: { a: 1 }, b: { a: 2 } })
    })

    it('treats same JSON-stringified values as equal', () => {
      const s = new DataSerializer()
      const shared = [1, 2, 3]
      const result = s.diff({ arr: shared }, { arr: [1, 2, 3] })
      expect(result.arr).toBeUndefined()
    })
  })

  // ─── getOptions ──────────────────────────────────────────────────────

  describe('getOptions', () => {
    it('returns copies of the options', () => {
      const s = new DataSerializer()
      const opts1 = s.getOptions()
      const opts2 = s.getOptions()
      expect(opts1).toEqual(opts2)
      expect(opts1.serialize).not.toBe(opts2.serialize)
      expect(opts1.deserialize).not.toBe(opts2.deserialize)
    })

    it('reflects custom options', () => {
      const s = new DataSerializer(
        { includeVersion: false, prettyPrint: true, compress: true },
        { strictVersion: false, migrateToLatest: false },
      )
      const opts = s.getOptions()
      expect(opts.serialize).toEqual({ includeVersion: false, prettyPrint: true, compress: true })
      expect(opts.deserialize).toEqual({ strictVersion: false, migrateToLatest: false })
    })
  })

  // ─── Integration: serialize then deserialize round-trip ─────────────

  describe('serialize/deserialize round-trip', () => {
    it('round-trips a simple object', () => {
      const s = new DataSerializer()
      const original = { name: 'test', count: 5 }
      const json = s.serialize(original)
      const result = s.deserialize<typeof original>(json)
      expect(result).toEqual(original)
    })

    it('round-trips with schema and version info', () => {
      const s = new DataSerializer()
      s.registerSchema('test', [v1, v2, v3])
      const json = s.serialize({ name: 'hello' }, 'test')
      const result = s.deserialize<Record<string, unknown>>(json, 'test')
      expect(result._version).toBe(3)
      expect(result._schema).toBe('test')
    })

    it('round-trips with pretty print enabled', () => {
      const s = new DataSerializer({ prettyPrint: true })
      const original = { a: 1 }
      const json = s.serialize(original)
      expect(json).toContain('\n')
      const result = s.deserialize<typeof original>(json)
      expect(result).toEqual(original)
    })

    it('migrates old data during round-trip with newer schema', () => {
      const s = new DataSerializer()
      s.registerSchema('test', [v1, v2, v3])
      const oldJson = JSON.stringify({ _version: 1, name: 'legacy' })
      const result = s.deserialize<Record<string, unknown>>(oldJson, 'test')
      expect(result._version).toBe(3)
      expect(result.format).toBe('v3')
    })
  })
})

// ─── SchemaVersioner ─────────────────────────────────────────────────────

describe('SchemaVersioner', () => {
  describe('registerSchema', () => {
    it('registers a schema with a single version', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('simple', [v1])
      expect(sv.hasSchema('simple')).toBe(true)
      expect(sv.getCurrentVersion('simple')).toBe(1)
    })

    it('registers a schema with multiple versions', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('multi', [v1, v2, v3])
      expect(sv.getCurrentVersion('multi')).toBe(3)
    })

    it('throws when registering with empty versions array', () => {
      const sv = new SchemaVersioner()
      expect(() => sv.registerSchema('empty', [])).toThrow('must have at least one version')
    })

    it('registers multiple different schemas', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('alpha', [v1])
      sv.registerSchema('beta', [v1, v2, v3])
      expect(sv.hasSchema('alpha')).toBe(true)
      expect(sv.hasSchema('beta')).toBe(true)
      expect(sv.getCurrentVersion('alpha')).toBe(1)
      expect(sv.getCurrentVersion('beta')).toBe(3)
    })

    it('determines current version as max version number', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('unordered', [v3, v1, v2])
      expect(sv.getCurrentVersion('unordered')).toBe(3)
    })
  })

  // ─── getSchema ───────────────────────────────────────────────────────

  describe('getSchema', () => {
    it('returns the schema for a registered name', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2])
      const schema = sv.getSchema('test')
      expect(schema).toBeDefined()
      expect(schema!.name).toBe('test')
      expect(schema!.currentVersion).toBe(2)
    })

    it('returns undefined for unknown schema name', () => {
      const sv = new SchemaVersioner()
      expect(sv.getSchema('unknown')).toBeUndefined()
    })

    it('returns a schema with correct version count', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2, v3])
      const schema = sv.getSchema('test')
      expect(schema!.versions.size).toBe(3)
    })
  })

  // ─── migrate ─────────────────────────────────────────────────────────

  describe('migrate', () => {
    it('returns a copy when data version equals target', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2])
      const data = { _version: 2, name: 'data' }
      const result = sv.migrate(data, 'test')
      expect(result).toEqual(data)
      expect(result).not.toBe(data)
    })

    it('migrates data from version 1 to version 3', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2, v3])
      const result = sv.migrate({ _version: 1, name: 'data' }, 'test')
      expect(result._version).toBe(3)
      expect(result.format).toBe('v3')
      expect(result.addedInV2).toBe(true)
      expect(result.addedInV3).toBe(true)
    })

    it('defaults data version to 1 when _version is missing', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2])
      const result = sv.migrate({ name: 'data' }, 'test')
      expect(result._version).toBe(2)
      expect(result.format).toBe('v2')
    })

    it('migrates to a specific target version', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2, v3])
      const result = sv.migrate({ _version: 1, name: 'data' }, 'test', 2)
      expect(result._version).toBe(2)
      expect(result.format).toBe('v2')
      expect(result.addedInV3).toBeUndefined()
    })

    it('throws when schema is not found', () => {
      const sv = new SchemaVersioner()
      expect(() => sv.migrate({}, 'missing')).toThrow('not found')
    })

    it('throws when target version exceeds current version', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2])
      expect(() => sv.migrate({ _version: 1 }, 'test', 10)).toThrow('exceeds current version')
    })

    it('throws when a required migrator version is missing', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('gappy', [
        { version: 1, migrator: (d) => d },
        { version: 3, migrator: (d) => d },
      ])
      expect(() => sv.migrate({ _version: 1 }, 'gappy')).toThrow('Version 2 not found')
    })

    it('does not mutate the input data', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2])
      const input = { _version: 1, name: 'data' }
      const copy = { ...input }
      sv.migrate(input, 'test')
      expect(input).toEqual(copy)
    })

    it('migrates from version 2 to version 3', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2, v3])
      const result = sv.migrate({ _version: 2, name: 'data' }, 'test')
      expect(result._version).toBe(3)
      expect(result.addedInV3).toBe(true)
      expect(result.addedInV2).toBeUndefined()
    })

    it('preserves data fields not touched by migrators', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2])
      const result = sv.migrate({ _version: 1, name: 'original', extra: true }, 'test')
      expect(result.name).toBe('original')
      expect(result.extra).toBe(true)
    })
  })

  // ─── getCurrentVersion ──────────────────────────────────────────────

  describe('getCurrentVersion', () => {
    it('returns the highest registered version', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1, v2, v3])
      expect(sv.getCurrentVersion('test')).toBe(3)
    })

    it('returns 1 for a single-version schema', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1])
      expect(sv.getCurrentVersion('test')).toBe(1)
    })

    it('throws for an unknown schema', () => {
      const sv = new SchemaVersioner()
      expect(() => sv.getCurrentVersion('missing')).toThrow('not found')
    })
  })

  // ─── getVersions ────────────────────────────────────────────────────

  describe('getVersions', () => {
    it('returns sorted version numbers', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v3, v1, v2])
      expect(sv.getVersions('test')).toEqual([1, 2, 3])
    })

    it('returns single version for single-version schema', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1])
      expect(sv.getVersions('test')).toEqual([1])
    })

    it('throws for unknown schema', () => {
      const sv = new SchemaVersioner()
      expect(() => sv.getVersions('missing')).toThrow('not found')
    })
  })

  // ─── hasSchema ──────────────────────────────────────────────────────

  describe('hasSchema', () => {
    it('returns true for a registered schema', () => {
      const sv = new SchemaVersioner()
      sv.registerSchema('test', [v1])
      expect(sv.hasSchema('test')).toBe(true)
    })

    it('returns false for an unregistered schema', () => {
      const sv = new SchemaVersioner()
      expect(sv.hasSchema('test')).toBe(false)
    })

    it('returns false before any schemas are registered', () => {
      const sv = new SchemaVersioner()
      expect(sv.hasSchema('anything')).toBe(false)
    })
  })
})
