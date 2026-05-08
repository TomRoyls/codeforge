import { describe, it, expect } from 'vitest'
import { SchemaVersioner } from '../../src/core/data-serializer/schema-versioner.js'
import { DataSerializer } from '../../src/core/data-serializer/data-serializer.js'
import type { SchemaVersion } from '../../src/core/data-serializer/types.js'
import {
  DEFAULT_SERIALIZE_OPTIONS,
  DEFAULT_DESERIALIZE_OPTIONS,
} from '../../src/core/data-serializer/types.js'

function createVersion(version: number, migrator?: (data: Record<string, unknown>) => Record<string, unknown>): SchemaVersion {
  return {
    version,
    migrator: migrator ?? ((data: Record<string, unknown>) => ({ ...data })),
  }
}

describe('SchemaVersioner', () => {
  describe('registerSchema', () => {
    it('should register a schema with versions', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1)])
      expect(versioner.hasSchema('test')).toBe(true)
    })

    it('should set currentVersion to highest version', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1), createVersion(2), createVersion(3)])
      expect(versioner.getCurrentVersion('test')).toBe(3)
    })

    it('should throw when registering with empty versions', () => {
      const versioner = new SchemaVersioner()
      expect(() => versioner.registerSchema('test', [])).toThrow('at least one version')
    })

    it('should allow registering multiple schemas', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('schema-a', [createVersion(1)])
      versioner.registerSchema('schema-b', [createVersion(1), createVersion(2)])
      expect(versioner.hasSchema('schema-a')).toBe(true)
      expect(versioner.hasSchema('schema-b')).toBe(true)
    })

    it('should overwrite existing schema with same name', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1)])
      versioner.registerSchema('test', [createVersion(1), createVersion(5)])
      expect(versioner.getCurrentVersion('test')).toBe(5)
    })
  })

  describe('getSchema', () => {
    it('should return registered schema', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1)])
      const schema = versioner.getSchema('test')
      expect(schema).not.toBeUndefined()
      expect(schema!.name).toBe('test')
    })

    it('should return undefined for unknown schema', () => {
      const versioner = new SchemaVersioner()
      expect(versioner.getSchema('unknown')).toBeUndefined()
    })

    it('should return schema with correct currentVersion', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1), createVersion(3)])
      const schema = versioner.getSchema('test')
      expect(schema!.currentVersion).toBe(3)
    })

    it('should return schema with all versions in map', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1), createVersion(2)])
      const schema = versioner.getSchema('test')
      expect(schema!.versions.size).toBe(2)
    })
  })

  describe('migrate', () => {
    it('should migrate data forward one version', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, addedField: 'v2' })),
      ])
      const result = versioner.migrate({ _version: 1, name: 'test' }, 'test')
      expect(result.addedField).toBe('v2')
      expect(result._version).toBe(2)
    })

    it('should migrate data through multiple versions', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, step2: true })),
        createVersion(3, (data) => ({ ...data, step3: true })),
        createVersion(4, (data) => ({ ...data, step4: true })),
      ])
      const result = versioner.migrate({ _version: 1, name: 'test' }, 'test')
      expect(result.step2).toBe(true)
      expect(result.step3).toBe(true)
      expect(result.step4).toBe(true)
      expect(result._version).toBe(4)
    })

    it('should return copy when already at latest version', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1)])
      const data = { _version: 1, name: 'test' }
      const result = versioner.migrate(data, 'test')
      expect(result).toEqual(data)
    })

    it('should migrate to specific target version', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, v2: true })),
        createVersion(3, (data) => ({ ...data, v3: true })),
      ])
      const result = versioner.migrate({ _version: 1, name: 'test' }, 'test', 2)
      expect(result.v2).toBe(true)
      expect(result._version).toBe(2)
      expect((result as Record<string, unknown>)['v3']).toBeUndefined()
    })

    it('should throw for unknown schema', () => {
      const versioner = new SchemaVersioner()
      expect(() => versioner.migrate({}, 'unknown')).toThrow('not found')
    })

    it('should throw when target version exceeds current', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1), createVersion(2)])
      expect(() => versioner.migrate({ _version: 1 }, 'test', 10)).toThrow('exceeds current')
    })

    it('should throw when version migrator not found', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1), createVersion(3)])
      expect(() => versioner.migrate({ _version: 1 }, 'test')).toThrow('not found')
    })

    it('should treat data without _version as version 1', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, migrated: true })),
      ])
      const result = versioner.migrate({ name: 'test' }, 'test')
      expect(result.migrated).toBe(true)
      expect(result._version).toBe(2)
    })

    it('should pass data through migrators sequentially', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, items: [...(data.items as unknown[]), 'b'] })),
        createVersion(3, (data) => ({ ...data, items: [...(data.items as unknown[]), 'c'] })),
      ])
      const result = versioner.migrate({ _version: 1, items: ['a'] }, 'test')
      expect(result.items).toEqual(['a', 'b', 'c'])
    })
  })

  describe('getCurrentVersion', () => {
    it('should return current version', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1), createVersion(5)])
      expect(versioner.getCurrentVersion('test')).toBe(5)
    })

    it('should throw for unknown schema', () => {
      const versioner = new SchemaVersioner()
      expect(() => versioner.getCurrentVersion('unknown')).toThrow('not found')
    })
  })

  describe('getVersions', () => {
    it('should return sorted version numbers', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(3), createVersion(1), createVersion(2)])
      expect(versioner.getVersions('test')).toEqual([1, 2, 3])
    })

    it('should throw for unknown schema', () => {
      const versioner = new SchemaVersioner()
      expect(() => versioner.getVersions('unknown')).toThrow('not found')
    })
  })

  describe('hasSchema', () => {
    it('should return true for registered schema', () => {
      const versioner = new SchemaVersioner()
      versioner.registerSchema('test', [createVersion(1)])
      expect(versioner.hasSchema('test')).toBe(true)
    })

    it('should return false for unregistered schema', () => {
      const versioner = new SchemaVersioner()
      expect(versioner.hasSchema('unknown')).toBe(false)
    })
  })
})

describe('DataSerializer', () => {
  describe('constructor', () => {
    it('should use default options', () => {
      const serializer = new DataSerializer()
      const opts = serializer.getOptions()
      expect(opts.serialize.includeVersion).toBe(true)
      expect(opts.serialize.prettyPrint).toBe(false)
      expect(opts.serialize.compress).toBe(false)
      expect(opts.deserialize.strictVersion).toBe(true)
      expect(opts.deserialize.migrateToLatest).toBe(true)
    })

    it('should accept partial serialize options', () => {
      const serializer = new DataSerializer({ prettyPrint: true })
      const opts = serializer.getOptions()
      expect(opts.serialize.prettyPrint).toBe(true)
      expect(opts.serialize.includeVersion).toBe(true)
    })

    it('should accept partial deserialize options', () => {
      const serializer = new DataSerializer(undefined, { strictVersion: false })
      const opts = serializer.getOptions()
      expect(opts.deserialize.strictVersion).toBe(false)
    })

    it('should accept both options', () => {
      const serializer = new DataSerializer(
        { prettyPrint: true, compress: true },
        { migrateToLatest: false },
      )
      const opts = serializer.getOptions()
      expect(opts.serialize.prettyPrint).toBe(true)
      expect(opts.serialize.compress).toBe(true)
      expect(opts.deserialize.migrateToLatest).toBe(false)
    })
  })

  describe('serialize', () => {
    it('should serialize basic data to JSON string', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ name: 'test', value: 42 })
      expect(result).toBe('{"name":"test","value":42}')
    })

    it('should serialize with prettyPrint', () => {
      const serializer = new DataSerializer({ prettyPrint: true })
      const result = serializer.serialize({ name: 'test' })
      expect(result).toContain('\n')
      expect(result).toContain('  ')
    })

    it('should serialize with version metadata when schema provided', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [createVersion(1)])
      const result = serializer.serialize({ name: 'test' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed._version).toBe(1)
      expect(parsed._schema).toBe('test')
    })

    it('should not include version metadata when includeVersion is false', () => {
      const serializer = new DataSerializer({ includeVersion: false })
      serializer.registerSchema('test', [createVersion(1)])
      const result = serializer.serialize({ name: 'test' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed._version).toBeUndefined()
      expect(parsed._schema).toBeUndefined()
    })

    it('should migrate data before serializing', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, migrated: true })),
      ])
      const result = serializer.serialize({ _version: 1, name: 'test' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed.migrated).toBe(true)
      expect(parsed._version).toBe(2)
    })

    it('should serialize empty data', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({})
      expect(result).toBe('{}')
    })

    it('should serialize nested objects', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ outer: { inner: { deep: true } } })
      const parsed = JSON.parse(result)
      expect(parsed.outer.inner.deep).toBe(true)
    })

    it('should serialize arrays', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ items: [1, 2, 3] })
      const parsed = JSON.parse(result)
      expect(parsed.items).toEqual([1, 2, 3])
    })

    it('should serialize null values', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ value: null })
      const parsed = JSON.parse(result)
      expect(parsed.value).toBeNull()
    })

    it('should serialize without schema', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ name: 'test' })
      const parsed = JSON.parse(result)
      expect(parsed.name).toBe('test')
      expect(parsed._version).toBeUndefined()
    })
  })

  describe('deserialize', () => {
    it('should deserialize basic JSON', () => {
      const serializer = new DataSerializer()
      const result = serializer.deserialize<{ name: string }>('{"name":"test"}')
      expect(result.name).toBe('test')
    })

    it('should deserialize and migrate when version mismatch', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, upgraded: true })),
      ])
      const json = '{"_version":1,"name":"test"}'
      const result = serializer.deserialize<Record<string, unknown>>(json, 'test')
      expect(result.upgraded).toBe(true)
    })

    it('should throw on version mismatch when strictVersion is true and migrateToLatest is false', () => {
      const serializer = new DataSerializer(undefined, {
        strictVersion: true,
        migrateToLatest: false,
      })
      serializer.registerSchema('test', [createVersion(1), createVersion(2)])
      const json = '{"_version":1,"name":"test"}'
      expect(() => serializer.deserialize(json, 'test')).toThrow('Version mismatch')
    })

    it('should not throw on matching version with strict mode', () => {
      const serializer = new DataSerializer(undefined, {
        strictVersion: true,
        migrateToLatest: false,
      })
      serializer.registerSchema('test', [createVersion(1)])
      const json = '{"_version":1,"name":"test"}'
      const result = serializer.deserialize<Record<string, unknown>>(json, 'test')
      expect(result.name).toBe('test')
    })

    it('should deserialize without schema', () => {
      const serializer = new DataSerializer()
      const result = serializer.deserialize<{ name: string }>('{"name":"test"}')
      expect(result.name).toBe('test')
    })

    it('should deserialize without version in data', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [createVersion(1)])
      const result = serializer.deserialize<Record<string, unknown>>('{"name":"test"}', 'test')
      expect(result.name).toBe('test')
    })

    it('should handle nested objects in deserialization', () => {
      const serializer = new DataSerializer()
      const result = serializer.deserialize<{ a: { b: number } }>('{"a":{"b":42}}')
      expect(result.a.b).toBe(42)
    })

    it('should handle arrays in deserialization', () => {
      const serializer = new DataSerializer()
      const result = serializer.deserialize<{ items: number[] }>('{"items":[1,2,3]}')
      expect(result.items).toEqual([1, 2, 3])
    })

    it('should handle null values in deserialization', () => {
      const serializer = new DataSerializer()
      const result = serializer.deserialize<{ value: null }>('{"value":null}')
      expect(result.value).toBeNull()
    })

    it('should throw on invalid JSON', () => {
      const serializer = new DataSerializer()
      expect(() => serializer.deserialize('not json')).toThrow()
    })
  })

  describe('clone', () => {
    it('should create a deep clone of an object', () => {
      const serializer = new DataSerializer()
      const original = { a: 1, b: { c: 2 } }
      const cloned = serializer.clone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    it('should not affect original when modifying clone', () => {
      const serializer = new DataSerializer()
      const original = { items: [1, 2, 3] }
      const cloned = serializer.clone(original)
      cloned.items.push(4)
      expect(original.items).toEqual([1, 2, 3])
    })

    it('should clone nested objects independently', () => {
      const serializer = new DataSerializer()
      const original = { outer: { inner: { value: 42 } } }
      const cloned = serializer.clone(original)
      cloned.outer.inner.value = 99
      expect(original.outer.inner.value).toBe(42)
    })

    it('should clone arrays', () => {
      const serializer = new DataSerializer()
      const original = { items: [1, 2, [3, 4]] }
      const cloned = serializer.clone(original)
      expect(cloned.items).toEqual([1, 2, [3, 4]])
      cloned.items[2]!.push(5)
      expect(original.items[2]).toEqual([3, 4])
    })

    it('should preserve null values in clone', () => {
      const serializer = new DataSerializer()
      const original = { value: null }
      const cloned = serializer.clone(original)
      expect(cloned.value).toBeNull()
    })
  })

  describe('merge', () => {
    it('should shallow merge two objects', () => {
      const serializer = new DataSerializer()
      const result = serializer.merge({ a: 1, b: 2 }, { b: 3, c: 4 })
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should override base with override values', () => {
      const serializer = new DataSerializer()
      const result = serializer.merge({ x: 1 }, { x: 2 })
      expect(result.x).toBe(2)
    })

    it('should keep base values when not in override', () => {
      const serializer = new DataSerializer()
      const result = serializer.merge({ a: 1, b: 2 }, { a: 10 })
      expect(result.a).toBe(10)
      expect(result.b).toBe(2)
    })

    it('should handle empty base', () => {
      const serializer = new DataSerializer()
      const result = serializer.merge({}, { a: 1 })
      expect(result).toEqual({ a: 1 })
    })

    it('should handle empty override', () => {
      const serializer = new DataSerializer()
      const result = serializer.merge({ a: 1 }, {})
      expect(result).toEqual({ a: 1 })
    })

    it('should not deep merge nested objects', () => {
      const serializer = new DataSerializer()
      const result = serializer.merge(
        { nested: { a: 1, b: 2 } },
        { nested: { a: 10 } },
      )
      expect(result.nested).toEqual({ a: 10 })
    })
  })

  describe('diff', () => {
    it('should return empty for identical objects', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ a: 1, b: 2 }, { a: 1, b: 2 })
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should detect changed values', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ a: 1, b: 2 }, { a: 1, b: 99 })
      expect(result.b).toEqual({ a: 2, b: 99 })
    })

    it('should detect keys only in a', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ a: 1, b: 2 }, { b: 2 })
      expect(result.a).toEqual({ a: 1, b: undefined })
    })

    it('should detect keys only in b', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ a: 1 }, { a: 1, b: 2 })
      expect(result.b).toEqual({ a: undefined, b: 2 })
    })

    it('should handle partial overlap', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 })
      expect(Object.keys(result).sort()).toEqual(['b', 'c'])
      expect(result.b).toEqual({ a: 2, b: 3 })
      expect(result.c).toEqual({ a: undefined, b: 4 })
    })

    it('should detect deep differences via JSON comparison', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff(
        { nested: { a: 1 } },
        { nested: { a: 2 } },
      )
      expect(result.nested).toEqual({ a: { a: 1 }, b: { a: 2 } })
    })

    it('should handle empty objects', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({}, {})
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle one empty and one non-empty', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ a: 1 }, {})
      expect(Object.keys(result)).toEqual(['a'])
    })
  })

  describe('registerSchema', () => {
    it('should register schema via serializer', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [createVersion(1)])
      const result = serializer.serialize({ name: 'test' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed._version).toBe(1)
    })

    it('should register schema with multiple versions', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, v2: true })),
      ])
      const result = serializer.serialize({ _version: 1, name: 'x' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed.v2).toBe(true)
      expect(parsed._version).toBe(2)
    })
  })

  describe('getOptions', () => {
    it('should return copy of serialize options', () => {
      const serializer = new DataSerializer({ prettyPrint: true })
      const opts = serializer.getOptions()
      opts.serialize.prettyPrint = false
      const opts2 = serializer.getOptions()
      expect(opts2.serialize.prettyPrint).toBe(true)
    })

    it('should return copy of deserialize options', () => {
      const serializer = new DataSerializer(undefined, { strictVersion: false })
      const opts = serializer.getOptions()
      opts.deserialize.strictVersion = true
      const opts2 = serializer.getOptions()
      expect(opts2.deserialize.strictVersion).toBe(false)
    })

    it('should return default options when none provided', () => {
      const serializer = new DataSerializer()
      const opts = serializer.getOptions()
      expect(opts.serialize).toEqual(DEFAULT_SERIALIZE_OPTIONS)
      expect(opts.deserialize).toEqual(DEFAULT_DESERIALIZE_OPTIONS)
    })
  })

  describe('edge cases', () => {
    it('should handle circular reference in serialize', () => {
      const serializer = new DataSerializer()
      const data: Record<string, unknown> = { name: 'circular' }
      data.self = data
      expect(() => serializer.serialize(data)).toThrow()
    })

    it('should handle boolean values', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ active: true, disabled: false })
      const parsed = JSON.parse(result)
      expect(parsed.active).toBe(true)
      expect(parsed.disabled).toBe(false)
    })

    it('should handle numeric values', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ int: 42, float: 3.14, negative: -1 })
      const parsed = JSON.parse(result)
      expect(parsed.int).toBe(42)
      expect(parsed.float).toBe(3.14)
      expect(parsed.negative).toBe(-1)
    })

    it('should handle string values', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ empty: '', text: 'hello', special: 'a\nb' })
      const parsed = JSON.parse(result)
      expect(parsed.empty).toBe('')
      expect(parsed.text).toBe('hello')
      expect(parsed.special).toBe('a\nb')
    })

    it('should handle empty array', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ items: [] })
      const parsed = JSON.parse(result)
      expect(parsed.items).toEqual([])
    })

    it('should handle mixed array types', () => {
      const serializer = new DataSerializer()
      const result = serializer.serialize({ mixed: [1, 'two', true, null, { a: 3 }] })
      const parsed = JSON.parse(result)
      expect(parsed.mixed).toEqual([1, 'two', true, null, { a: 3 }])
    })

    it('should handle version migration with no data change', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [
        createVersion(1),
        createVersion(2),
        createVersion(3),
      ])
      const result = serializer.serialize({ _version: 1, name: 'test' }, 'test')
      const parsed = JSON.parse(result)
      expect(parsed._version).toBe(3)
      expect(parsed.name).toBe('test')
    })

    it('should handle deserialize then serialize roundtrip', () => {
      const serializer = new DataSerializer()
      serializer.registerSchema('test', [
        createVersion(1),
        createVersion(2, (data) => ({ ...data, extra: 'added' })),
      ])
      const original = '{"_version":1,"name":"roundtrip"}'
      const deserialized = serializer.deserialize<Record<string, unknown>>(original, 'test')
      expect(deserialized.extra).toBe('added')
      const reserialized = serializer.serialize(deserialized, 'test')
      const parsed = JSON.parse(reserialized)
      expect(parsed._version).toBe(2)
      expect(parsed.name).toBe('roundtrip')
    })

    it('should handle clone with Date objects by converting to string', () => {
      const serializer = new DataSerializer()
      const date = new Date('2024-01-01')
      const original = { date }
      const cloned = serializer.clone(original)
      expect(cloned.date).toBe(date.toISOString())
    })

    it('should handle diff with null vs undefined', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ a: null }, { a: undefined })
      expect(result.a).toEqual({ a: null, b: undefined })
    })

    it('should handle diff with array differences', () => {
      const serializer = new DataSerializer()
      const result = serializer.diff({ items: [1, 2] }, { items: [1, 3] })
      expect(result.items).toEqual({ a: [1, 2], b: [1, 3] })
    })
  })
})

describe('Default options', () => {
  it('should have correct serialize defaults', () => {
    expect(DEFAULT_SERIALIZE_OPTIONS.includeVersion).toBe(true)
    expect(DEFAULT_SERIALIZE_OPTIONS.prettyPrint).toBe(false)
    expect(DEFAULT_SERIALIZE_OPTIONS.compress).toBe(false)
  })

  it('should have correct deserialize defaults', () => {
    expect(DEFAULT_DESERIALIZE_OPTIONS.strictVersion).toBe(true)
    expect(DEFAULT_DESERIALIZE_OPTIONS.migrateToLatest).toBe(true)
  })
})

describe('Integration', () => {
  it('should handle full serialize-deserialize cycle', () => {
    const serializer = new DataSerializer()
    serializer.registerSchema('user', [
      createVersion(1),
      createVersion(2, (data) => ({ ...data, fullName: `${data.firstName} ${data.lastName}` })),
    ])
    const original = { _version: 1, firstName: 'John', lastName: 'Doe' }
    const serialized = serializer.serialize(original, 'user')
    const deserialized = serializer.deserialize<Record<string, unknown>>(serialized, 'user')
    expect(deserialized.fullName).toBe('John Doe')
    expect(deserialized.firstName).toBe('John')
  })

  it('should handle serialize without schema then deserialize', () => {
    const serializer = new DataSerializer()
    const original = { name: 'test', value: 42 }
    const serialized = serializer.serialize(original)
    const deserialized = serializer.deserialize<{ name: string; value: number }>(serialized)
    expect(deserialized.name).toBe('test')
    expect(deserialized.value).toBe(42)
  })

  it('should preserve data through clone-serialize-deserialize cycle', () => {
    const serializer = new DataSerializer()
    const original = { a: 1, b: { c: 2 }, d: [3, 4] }
    const cloned = serializer.clone(original)
    const serialized = serializer.serialize(cloned)
    const deserialized = serializer.deserialize<typeof original>(serialized)
    expect(deserialized).toEqual(original)
  })

  it('should handle multiple schema migrations in sequence', () => {
    const serializer = new DataSerializer()
    serializer.registerSchema('config', [
      createVersion(1),
      createVersion(2, (data) => ({ ...data, v2: true })),
      createVersion(3, (data) => ({ ...data, v3: true })),
      createVersion(4, (data) => ({ ...data, v4: true })),
      createVersion(5, (data) => ({ ...data, v4: false, v5: true })),
    ])
    const original = { _version: 1, name: 'config' }
    const serialized = serializer.serialize(original, 'config')
    const parsed = JSON.parse(serialized)
    expect(parsed._version).toBe(5)
    expect(parsed.v2).toBe(true)
    expect(parsed.v3).toBe(true)
    expect(parsed.v4).toBe(false)
    expect(parsed.v5).toBe(true)
  })

  it('should handle merge then diff', () => {
    const serializer = new DataSerializer()
    const base = { a: 1, b: 2, c: 3 }
    const override = { b: 20, d: 4 }
    const merged = serializer.merge(base, override)
    const diff = serializer.diff(base, merged)
    expect(Object.keys(diff).sort()).toEqual(['b', 'd'])
    expect(diff.b).toEqual({ a: 2, b: 20 })
    expect(diff.d).toEqual({ a: undefined, b: 4 })
  })
})
