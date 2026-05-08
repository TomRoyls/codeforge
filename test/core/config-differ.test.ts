import { describe, it, expect } from 'vitest'
import { ConfigNormalizer } from '../../src/core/config-differ/config-normalizer.js'
import { ConfigDiffer } from '../../src/core/config-differ/config-differ.js'
import type { ConfigSnapshot } from '../../src/core/config-differ/types.js'

function makeSnapshot(config: Record<string, unknown>, source = 'test'): ConfigSnapshot {
  return {
    timestamp: Date.now(),
    config: config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>,
    version: '1.0.0',
    source,
  }
}

describe('ConfigNormalizer', () => {
  const normalizer = new ConfigNormalizer()

  describe('normalize', () => {
    it('should trim strings', () => {
      expect(normalizer.normalize('  hello  ')).toBe('hello')
    })

    it('should convert numeric strings to numbers', () => {
      expect(normalizer.normalize('42')).toBe(42)
    })

    it('should convert decimal numeric strings to numbers', () => {
      expect(normalizer.normalize('3.14')).toBe(3.14)
    })

    it('should keep non-numeric strings as strings', () => {
      expect(normalizer.normalize('hello')).toBe('hello')
    })

    it('should keep empty trimmed string as empty string', () => {
      expect(normalizer.normalize('   ')).toBe('')
    })

    it('should return numbers as-is', () => {
      expect(normalizer.normalize(42)).toBe(42)
      expect(normalizer.normalize(0)).toBe(0)
      expect(normalizer.normalize(-5)).toBe(-5)
    })

    it('should return booleans as-is', () => {
      expect(normalizer.normalize(true)).toBe(true)
      expect(normalizer.normalize(false)).toBe(false)
    })

    it('should return null as-is', () => {
      expect(normalizer.normalize(null)).toBe(null)
    })

    it('should normalize arrays element by element', () => {
      const result = normalizer.normalize(['  hello  ', '42', null])
      expect(result).toEqual(['hello', 42, null])
    })

    it('should sort object keys recursively', () => {
      const result = normalizer.normalize({ z: 1, a: 2, m: 3 })
      expect(Object.keys(result as Record<string, unknown>)).toEqual(['a', 'm', 'z'])
    })

    it('should normalize nested object values', () => {
      const result = normalizer.normalize({ inner: { num: '  10  ' } })
      expect(result).toEqual({ inner: { num: 10 } })
    })

    it('should handle empty objects', () => {
      const result = normalizer.normalize({})
      expect(result).toEqual({})
    })

    it('should handle empty arrays', () => {
      const result = normalizer.normalize([])
      expect(result).toEqual([])
    })

    it('should handle zero string', () => {
      expect(normalizer.normalize('0')).toBe(0)
    })

    it('should handle negative number string', () => {
      expect(normalizer.normalize('-7')).toBe(-7)
    })
  })

  describe('normalizePath', () => {
    it('should split dot-notation path into array', () => {
      expect(normalizer.normalizePath('rules.max-params')).toEqual(['rules', 'max-params'])
    })

    it('should handle single key path', () => {
      expect(normalizer.normalizePath('version')).toEqual(['version'])
    })

    it('should handle empty path', () => {
      expect(normalizer.normalizePath('')).toEqual([''])
    })

    it('should handle deeply nested path', () => {
      expect(normalizer.normalizePath('a.b.c.d.e')).toEqual(['a', 'b', 'c', 'd', 'e'])
    })
  })

  describe('flatten', () => {
    it('should flatten nested object to dot-notation keys', () => {
      const result = normalizer.flatten({ a: { b: { c: 1 } } })
      expect(result).toEqual({ 'a.b.c': 1 })
    })

    it('should flatten with custom prefix', () => {
      const result = normalizer.flatten({ x: 1 }, 'root')
      expect(result).toEqual({ 'root.x': 1 })
    })

    it('should not flatten arrays', () => {
      const result = normalizer.flatten({ items: [1, 2, 3] })
      expect(result).toEqual({ items: [1, 2, 3] })
    })

    it('should handle empty object', () => {
      const result = normalizer.flatten({})
      expect(result).toEqual({})
    })

    it('should handle mixed values', () => {
      const result = normalizer.flatten({
        name: 'test',
        settings: { timeout: 30, retry: true },
        items: [1, 2],
      })
      expect(result).toEqual({
        name: 'test',
        'settings.timeout': 30,
        'settings.retry': true,
        items: [1, 2],
      })
    })

    it('should handle null values as leaf values', () => {
      const result = normalizer.flatten({ a: { b: null } })
      expect(result).toEqual({ 'a.b': null })
    })
  })

  describe('unflatten', () => {
    it('should expand dot-notation keys to nested object', () => {
      const result = normalizer.unflatten({ 'a.b.c': 1 })
      expect(result).toEqual({ a: { b: { c: 1 } } })
    })

    it('should handle single-level keys', () => {
      const result = normalizer.unflatten({ name: 'test', version: 1 })
      expect(result).toEqual({ name: 'test', version: 1 })
    })

    it('should handle empty input', () => {
      const result = normalizer.unflatten({})
      expect(result).toEqual({})
    })

    it('should roundtrip flatten then unflatten', () => {
      const original = { a: { b: 1 }, c: { d: { e: 2 } }, f: 3 }
      const flat = normalizer.flatten(original)
      const restored = normalizer.unflatten(flat)
      expect(restored).toEqual(original)
    })

    it('should handle multiple nested paths sharing prefix', () => {
      const result = normalizer.unflatten({ 'a.b': 1, 'a.c': 2, 'a.d.e': 3 })
      expect(result).toEqual({ a: { b: 1, c: 2, d: { e: 3 } } })
    })
  })

  describe('matchesIgnorePattern', () => {
    it('should match exact pattern', () => {
      expect(normalizer.matchesIgnorePattern(['rules', 'max-params'], ['rules.max-params'])).toBe(true)
    })

    it('should match wildcard pattern', () => {
      expect(normalizer.matchesIgnorePattern(['rules', 'max-params'], ['rules.*'])).toBe(true)
    })

    it('should not match non-matching pattern', () => {
      expect(normalizer.matchesIgnorePattern(['rules', 'max-params'], ['config.*'])).toBe(false)
    })

    it('should match any of multiple patterns', () => {
      expect(
        normalizer.matchesIgnorePattern(['rules', 'max-params'], ['config.*', 'rules.max-params']),
      ).toBe(true)
    })

    it('should match wildcard at start', () => {
      expect(normalizer.matchesIgnorePattern(['server', 'timeout'], ['*.timeout'])).toBe(true)
    })

    it('should match wildcard in middle', () => {
      expect(normalizer.matchesIgnorePattern(['a', 'b', 'c'], ['a.*.c'])).toBe(true)
    })

    it('should return false for empty patterns', () => {
      expect(normalizer.matchesIgnorePattern(['a', 'b'], [])).toBe(false)
    })

    it('should match double wildcard as greedy match', () => {
      expect(normalizer.matchesIgnorePattern(['a', 'b', 'c'], ['a.*'])).toBe(true)
    })
  })
})

describe('ConfigDiffer', () => {
  describe('constructor', () => {
    it('should create differ with default options', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({}, {})
      expect(result.entries).toEqual([])
      expect(result.summary).toEqual({ added: 0, removed: 0, modified: 0, unchanged: 0 })
    })

    it('should accept custom options', () => {
      const differ = new ConfigDiffer({ normalizeValues: false, ignorePaths: ['meta.*'] })
      const result = differ.diffObjects({ a: 1 }, { a: 1 })
      expect(result.summary.unchanged).toBe(0)
    })
  })

  describe('diff', () => {
    it('should diff two ConfigSnapshots', () => {
      const differ = new ConfigDiffer()
      const before = makeSnapshot({ a: 1 })
      const after = makeSnapshot({ a: 2 })
      const result = differ.diff(before, after)
      expect(result.entries).toHaveLength(1)
      expect(result.entries[0]!.changeType).toBe('modified')
    })

    it('should report no changes for identical snapshots', () => {
      const differ = new ConfigDiffer()
      const before = makeSnapshot({ a: 1, b: 'hello' })
      const after = makeSnapshot({ a: 1, b: 'hello' })
      const result = differ.diff(before, after)
      expect(differ.hasChanges(result)).toBe(false)
    })
  })

  describe('diffObjects', () => {
    it('should detect identical configs with no changes', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1, b: 'hello' }, { a: 1, b: 'hello' })
      expect(result.entries).toHaveLength(0)
      expect(result.summary.added).toBe(0)
      expect(result.summary.removed).toBe(0)
      expect(result.summary.modified).toBe(0)
    })

    it('should detect added keys', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1 }, { a: 1, b: 2 })
      expect(result.summary.added).toBe(1)
      const added = result.entries.find((e) => e.changeType === 'added')
      expect(added).toBeDefined()
      expect(added!.path).toEqual(['b'])
      expect(added!.newValue).toBe(2)
    })

    it('should detect removed keys', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1, b: 2 }, { a: 1 })
      expect(result.summary.removed).toBe(1)
      const removed = result.entries.find((e) => e.changeType === 'removed')
      expect(removed).toBeDefined()
      expect(removed!.path).toEqual(['b'])
      expect(removed!.oldValue).toBe(2)
    })

    it('should detect modified values', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1 }, { a: 99 })
      expect(result.summary.modified).toBe(1)
      const modified = result.entries.find((e) => e.changeType === 'modified')
      expect(modified).toBeDefined()
      expect(modified!.oldValue).toBe(1)
      expect(modified!.newValue).toBe(99)
    })

    it('should handle all change types mixed', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects(
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 99, d: 4 },
      )
      expect(result.summary.added).toBe(1)
      expect(result.summary.removed).toBe(1)
      expect(result.summary.modified).toBe(1)
    })

    it('should handle empty configs', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({}, {})
      expect(result.entries).toHaveLength(0)
      expect(result.summary).toEqual({ added: 0, removed: 0, modified: 0, unchanged: 0 })
    })

    it('should handle one empty and one non-empty', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({}, { a: 1, b: 2 })
      expect(result.summary.added).toBe(2)
    })

    it('should detect deep nested changes', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects(
        { server: { db: { host: 'localhost', port: 5432 } } },
        { server: { db: { host: 'prod-server', port: 5432 } } },
      )
      expect(result.summary.modified).toBe(1)
      const mod = result.entries.find((e) => e.changeType === 'modified')
      expect(mod!.path).toEqual(['server', 'db', 'host'])
    })

    it('should detect array value changes', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects(
        { rules: ['a', 'b'] },
        { rules: ['a', 'c'] },
      )
      expect(result.summary.modified).toBe(1)
    })
  })

  describe('getChangesByType', () => {
    it('should filter entries by added type', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1 }, { a: 1, b: 2, c: 3 })
      const added = differ.getChangesByType(result, 'added')
      expect(added).toHaveLength(2)
      expect(added.every((e) => e.changeType === 'added')).toBe(true)
    })

    it('should filter entries by removed type', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1, b: 2 }, {})
      const removed = differ.getChangesByType(result, 'removed')
      expect(removed).toHaveLength(2)
      expect(removed.every((e) => e.changeType === 'removed')).toBe(true)
    })

    it('should filter entries by modified type', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1, b: 2 }, { a: 10, b: 20 })
      const modified = differ.getChangesByType(result, 'modified')
      expect(modified).toHaveLength(2)
      expect(modified.every((e) => e.changeType === 'modified')).toBe(true)
    })

    it('should return empty array for type with no matches', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1 }, { a: 1 })
      expect(differ.getChangesByType(result, 'modified')).toEqual([])
    })
  })

  describe('hasChanges', () => {
    it('should return true when changes exist', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1 }, { a: 2 })
      expect(differ.hasChanges(result)).toBe(true)
    })

    it('should return false when no changes exist', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1 }, { a: 1 })
      expect(differ.hasChanges(result)).toBe(false)
    })
  })

  describe('applyDiff', () => {
    it('should apply additions to config', () => {
      const differ = new ConfigDiffer()
      const config: Record<string, unknown> = { a: 1 }
      const result = differ.diffObjects({ a: 1 }, { a: 1, b: 2 })
      differ.applyDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual({ a: 1, b: 2 })
    })

    it('should apply modifications to config', () => {
      const differ = new ConfigDiffer()
      const config: Record<string, unknown> = { a: 1 }
      const result = differ.diffObjects({ a: 1 }, { a: 99 })
      differ.applyDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual({ a: 99 })
    })

    it('should apply removals to config', () => {
      const differ = new ConfigDiffer()
      const config: Record<string, unknown> = { a: 1, b: 2 }
      const result = differ.diffObjects({ a: 1, b: 2 }, { a: 1 })
      differ.applyDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual({ a: 1 })
    })

    it('should apply mixed changes to config', () => {
      const differ = new ConfigDiffer()
      const config: Record<string, unknown> = { a: 1, b: 2, c: 3 }
      const result = differ.diffObjects({ a: 1, b: 2, c: 3 }, { a: 10, d: 4 })
      differ.applyDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual({ a: 10, d: 4 })
    })
  })

  describe('revertDiff', () => {
    it('should revert additions by removing keys', () => {
      const differ = new ConfigDiffer()
      const config: Record<string, unknown> = { a: 1, b: 2 }
      const result = differ.diffObjects({ a: 1 }, { a: 1, b: 2 })
      differ.revertDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual({ a: 1 })
    })

    it('should revert removals by adding keys back', () => {
      const differ = new ConfigDiffer()
      const config: Record<string, unknown> = { a: 1 }
      const result = differ.diffObjects({ a: 1, b: 2 }, { a: 1 })
      differ.revertDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual({ a: 1, b: 2 })
    })

    it('should revert modifications to old values', () => {
      const differ = new ConfigDiffer()
      const config: Record<string, unknown> = { a: 99 }
      const result = differ.diffObjects({ a: 1 }, { a: 99 })
      differ.revertDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual({ a: 1 })
    })

    it('should roundtrip apply then revert', () => {
      const differ = new ConfigDiffer()
      const original = { a: 1, b: 2, c: 3 }
      const target = { a: 10, b: 2, d: 4 }
      const result = differ.diffObjects(original, target)
      const config: Record<string, unknown> = { ...original }
      differ.applyDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual(target)
      differ.revertDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual(original)
    })
  })

  describe('mergeDiffs', () => {
    it('should merge multiple diff results', () => {
      const differ = new ConfigDiffer()
      const result1 = differ.diffObjects({ a: 1 }, { a: 2 })
      const result2 = differ.diffObjects({ b: 1 }, { b: 1, c: 3 })
      const merged = differ.mergeDiffs([result1, result2])
      expect(merged.entries).toHaveLength(2)
      expect(merged.summary.modified).toBe(1)
      expect(merged.summary.added).toBe(1)
    })

    it('should merge summaries correctly', () => {
      const differ = new ConfigDiffer()
      const result1 = differ.diffObjects({ a: 1 }, { a: 2 })
      const result2 = differ.diffObjects({}, { x: 1 })
      const merged = differ.mergeDiffs([result1, result2])
      expect(merged.summary.modified).toBe(1)
      expect(merged.summary.added).toBe(1)
    })

    it('should handle empty results array', () => {
      const differ = new ConfigDiffer()
      const merged = differ.mergeDiffs([])
      expect(merged.entries).toEqual([])
      expect(merged.summary).toEqual({ added: 0, removed: 0, modified: 0, unchanged: 0 })
    })
  })

  describe('generatePatch', () => {
    it('should generate patch entries for changes', () => {
      const differ = new ConfigDiffer()
      const patch = differ.generatePatch({ a: 1 }, { a: 2, b: 3 })
      expect(patch).toHaveLength(2)
    })

    it('should return empty patch for identical configs', () => {
      const differ = new ConfigDiffer()
      const patch = differ.generatePatch({ a: 1 }, { a: 1 })
      expect(patch).toEqual([])
    })

    it('should only include changed entries', () => {
      const differ = new ConfigDiffer()
      const patch = differ.generatePatch({ a: 1, b: 2, c: 3 }, { a: 1, b: 99, c: 3 })
      expect(patch).toHaveLength(1)
      expect(patch[0]!.path).toEqual(['b'])
    })
  })

  describe('DiffOptions - ignorePaths', () => {
    it('should filter ignored paths', () => {
      const differ = new ConfigDiffer({ ignorePaths: ['meta.*'] })
      const result = differ.diffObjects(
        { meta: { version: 1 }, a: 1 },
        { meta: { version: 2 }, a: 1 },
      )
      expect(differ.hasChanges(result)).toBe(false)
    })

    it('should not filter non-ignored paths', () => {
      const differ = new ConfigDiffer({ ignorePaths: ['meta.*'] })
      const result = differ.diffObjects({ a: 1 }, { a: 2 })
      expect(differ.hasChanges(result)).toBe(true)
    })

    it('should support wildcard patterns in ignorePaths', () => {
      const differ = new ConfigDiffer({ ignorePaths: ['server.*.internal'] })
      const result = differ.diffObjects(
        { server: { db: { internal: true, host: 'localhost' } } },
        { server: { db: { internal: false, host: 'localhost' } } },
      )
      expect(differ.hasChanges(result)).toBe(false)
    })
  })

  describe('DiffOptions - includeUnchanged', () => {
    it('should count unchanged when true', () => {
      const differ = new ConfigDiffer({ includeUnchanged: true })
      const result = differ.diffObjects({ a: 1, b: 2 }, { a: 1, b: 3 })
      expect(result.summary.unchanged).toBe(1)
    })

    it('should report zero unchanged when false by default', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: 1, b: 2 }, { a: 1, b: 3 })
      expect(result.summary.unchanged).toBe(0)
    })
  })

  describe('DiffOptions - normalizeValues', () => {
    it('should normalize values by default making numeric strings equal to numbers', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ port: '3000' }, { port: 3000 })
      expect(differ.hasChanges(result)).toBe(false)
    })

    it('should not normalize values when option is false', () => {
      const differ = new ConfigDiffer({ normalizeValues: false })
      const result = differ.diffObjects({ port: '3000' }, { port: 3000 })
      expect(differ.hasChanges(result)).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle null values in config', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: null }, { a: 1 })
      expect(result.summary.modified).toBe(1)
    })

    it('should handle boolean value changes', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ flag: true }, { flag: false })
      expect(result.summary.modified).toBe(1)
    })

    it('should handle deeply nested additions', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects(
        { a: {} },
        { a: { b: { c: { d: 'new' } } } },
      )
      expect(result.summary.added).toBe(1)
      const entry = result.entries[0]!
      expect(entry.path).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should handle type changes string to number without normalization', () => {
      const differ = new ConfigDiffer({ normalizeValues: false })
      const result = differ.diffObjects({ val: '42' }, { val: 42 })
      expect(result.summary.modified).toBe(1)
    })

    it('should handle nested objects with multiple changes', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects(
        { db: { host: 'localhost', port: 5432, name: 'dev' } },
        { db: { host: 'prod', port: 5432, name: 'prod', ssl: true } },
      )
      expect(result.summary.modified).toBe(2)
      expect(result.summary.added).toBe(1)
    })

    it('should handle applying diff to nested config', () => {
      const differ = new ConfigDiffer()
      const original = { server: { host: 'localhost', port: 3000 } }
      const target = { server: { host: 'production', port: 3000 } }
      const result = differ.diffObjects(original, target)
      const config: Record<string, unknown> = JSON.parse(JSON.stringify(original))
      differ.applyDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual(target)
    })

    it('should handle reverting diff on nested config', () => {
      const differ = new ConfigDiffer()
      const original = { server: { host: 'localhost', port: 3000 } }
      const target = { server: { host: 'production', port: 8080 } }
      const result = differ.diffObjects(original, target)
      const config: Record<string, unknown> = JSON.parse(JSON.stringify(target))
      differ.revertDiff(config as Record<string, import('../../src/core/config-differ/types.js').ConfigValue>, result.entries)
      expect(config).toEqual(original)
    })

    it('should handle empty string values', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ name: '' }, { name: 'test' })
      expect(result.summary.modified).toBe(1)
    })

    it('should handle whitespace-only strings after normalization', () => {
      const differ = new ConfigDiffer()
      const result = differ.diffObjects({ a: '   ' }, { a: '' })
      expect(differ.hasChanges(result)).toBe(false)
    })
  })
})
