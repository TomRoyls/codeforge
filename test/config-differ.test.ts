import { describe, it, expect } from 'vitest'
import { ConfigDiffer } from '../src/core/config-differ/config-differ.js'
import { ConfigNormalizer } from '../src/core/config-differ/config-normalizer.js'
import type { ConfigSnapshot, ConfigDiffResult } from '../src/core/config-differ/types.js'

// ─── ConfigNormalizer ───

describe('ConfigNormalizer', () => {
  const norm = new ConfigNormalizer()

  // ─── normalize ───

  it('normalizes strings by trimming', () => {
    expect(norm.normalize('  hello  ')).toBe('hello')
  })

  it('normalizes numeric strings to numbers', () => {
    expect(norm.normalize('42')).toBe(42)
    expect(norm.normalize(' 3.14 ')).toBe(3.14)
  })

  it('leaves non-numeric trimmed strings as strings', () => {
    expect(norm.normalize('abc')).toBe('abc')
    expect(norm.normalize('')).toBe('')
  })

  it('passes through numbers and booleans', () => {
    expect(norm.normalize(42)).toBe(42)
    expect(norm.normalize(true)).toBe(true)
    expect(norm.normalize(false)).toBe(false)
  })

  it('normalizes null', () => {
    expect(norm.normalize(null)).toBe(null)
  })

  it('normalizes arrays recursively', () => {
    expect(norm.normalize([' 1 ', 'hello'])).toEqual([1, 'hello'])
  })

  it('normalizes objects with sorted keys', () => {
    const result = norm.normalize({ b: 2, a: 1 })
    expect(Object.keys(result as Record<string, unknown>)).toEqual(['a', 'b'])
  })

  it('normalizes nested objects recursively', () => {
    const result = norm.normalize({ outer: { inner: ' 42 ' } })
    expect(result).toEqual({ outer: { inner: 42 } })
  })

  // ─── normalizePath ───

  it('splits path by dots', () => {
    expect(norm.normalizePath('a.b.c')).toEqual(['a', 'b', 'c'])
  })

  it('handles single key path', () => {
    expect(norm.normalizePath('key')).toEqual(['key'])
  })

  it('handles empty string', () => {
    expect(norm.normalizePath('')).toEqual([''])
  })

  // ─── flatten ───

  it('flattens nested object', () => {
    const result = norm.flatten({ a: { b: 1, c: 2 } })
    expect(result).toEqual({ 'a.b': 1, 'a.c': 2 })
  })

  it('leaves top-level keys unchanged', () => {
    const result = norm.flatten({ x: 1, y: 2 })
    expect(result).toEqual({ x: 1, y: 2 })
  })

  it('flattens deeply nested objects', () => {
    const result = norm.flatten({ a: { b: { c: 3 } } })
    expect(result).toEqual({ 'a.b.c': 3 })
  })

  it('preserves arrays as values', () => {
    const result = norm.flatten({ arr: [1, 2, 3] })
    expect(result).toEqual({ arr: [1, 2, 3] })
  })

  it('handles empty object', () => {
    expect(norm.flatten({})).toEqual({})
  })

  // ─── unflatten ───

  it('unflattens to nested object', () => {
    const result = norm.unflatten({ 'a.b': 1, 'a.c': 2 })
    expect(result).toEqual({ a: { b: 1, c: 2 } })
  })

  it('handles top-level keys', () => {
    const result = norm.unflatten({ x: 1, y: 2 })
    expect(result).toEqual({ x: 1, y: 2 })
  })

  it('round-trips flatten/unflatten', () => {
    const original = { a: { b: 1 }, c: 2, d: { e: { f: 3 } } }
    const flat = norm.flatten(original)
    const result = norm.unflatten(flat)
    expect(result).toEqual(original)
  })

  // ─── matchesIgnorePattern ───

  it('matches exact path', () => {
    expect(norm.matchesIgnorePattern(['a', 'b'], ['a.b'])).toBe(true)
  })

  it('matches wildcard pattern', () => {
    expect(norm.matchesIgnorePattern(['a', 'b', 'c'], ['a.*'])).toBe(true)
  })

  it('returns false for non-matching pattern', () => {
    expect(norm.matchesIgnorePattern(['x', 'y'], ['a.b'])).toBe(false)
  })

  it('returns false for empty patterns', () => {
    expect(norm.matchesIgnorePattern(['a', 'b'], [])).toBe(false)
  })
})

// ─── ConfigDiffer Constructor ───

describe('ConfigDiffer', () => {
  it('creates with default options', () => {
    const differ = new ConfigDiffer()
    expect(differ).toBeDefined()
  })

  it('creates with custom options', () => {
    const differ = new ConfigDiffer({ ignorePaths: ['version'], includeUnchanged: true })
    expect(differ).toBeDefined()
  })

  // ─── diff (snapshot) ───

  it('diffs two snapshots', () => {
    const differ = new ConfigDiffer()
    const before: ConfigSnapshot = { timestamp: 1, config: { a: 1 }, version: '1', source: 'test' }
    const after: ConfigSnapshot = { timestamp: 2, config: { a: 2 }, version: '2', source: 'test' }
    const result = differ.diff(before, after)
    expect(result.summary.modified).toBe(1)
  })

  // ─── diffObjects ───

  it('detects added keys', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 1, b: 2 })
    expect(result.summary.added).toBe(1)
    expect(result.entries[0]!.changeType).toBe('added')
    expect(result.entries[0]!.newValue).toBe(2)
  })

  it('detects removed keys', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1, b: 2 }, { a: 1 })
    expect(result.summary.removed).toBe(1)
    expect(result.entries[0]!.changeType).toBe('removed')
    expect(result.entries[0]!.oldValue).toBe(2)
  })

  it('detects modified values', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 2 })
    expect(result.summary.modified).toBe(1)
    expect(result.entries[0]!.newValue).toBe(2)
  })

  it('detects no changes', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1, b: 'hello' }, { a: 1, b: 'hello' })
    expect(result.summary.added).toBe(0)
    expect(result.summary.removed).toBe(0)
    expect(result.summary.modified).toBe(0)
  })

  it('handles empty configs', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({}, {})
    expect(result.entries.length).toBe(0)
  })

  it('handles nested objects', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects(
      { db: { host: 'localhost', port: 5432 } },
      { db: { host: 'prod-server', port: 5432 } }
    )
    expect(result.summary.modified).toBe(1)
    expect(result.entries[0]!.path).toContain('host')
  })

  it('ignores paths matching patterns', () => {
    const differ = new ConfigDiffer({ ignorePaths: ['version'] })
    const result = differ.diffObjects({ version: '1', data: 'a' }, { version: '2', data: 'a' })
    expect(result.summary.modified).toBe(0)
  })

  it('includes unchanged when option set', () => {
    const differ = new ConfigDiffer({ includeUnchanged: true })
    const result = differ.diffObjects({ a: 1 }, { a: 1 })
    expect(result.summary.unchanged).toBe(1)
  })

  it('excludes unchanged by default', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 1 })
    expect(result.summary.unchanged).toBe(0)
  })

  it('skips normalization when disabled', () => {
    const differ = new ConfigDiffer({ normalizeValues: false })
    const result = differ.diffObjects({ a: ' 1 ' }, { a: '1' })
    expect(result.summary.modified).toBe(1)
  })

  // ─── getChangesByType ───

  it('filters changes by type', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 2, b: 3 })
    const added = differ.getChangesByType(result, 'added')
    expect(added.length).toBe(1)
    expect(added[0]!.newValue).toBe(3)
  })

  // ─── hasChanges ───

  it('returns true when changes exist', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 2 })
    expect(differ.hasChanges(result)).toBe(true)
  })

  it('returns false when no changes', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 1 })
    expect(differ.hasChanges(result)).toBe(false)
  })

  // ─── applyDiff ───

  it('applies added entries', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({}, { x: 10 })
    const applied = differ.applyDiff({}, result.entries)
    expect(applied).toEqual({ x: 10 })
  })

  it('applies modified entries', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 2 })
    const applied = differ.applyDiff({ a: 1 }, result.entries)
    expect(applied).toEqual({ a: 2 })
  })

  it('applies removed entries', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, {})
    const applied = differ.applyDiff({ a: 1 }, result.entries)
    expect(applied).toEqual({})
  })

  // ─── revertDiff ───

  it('reverts added entries', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({}, { x: 10 })
    const reverted = differ.revertDiff({ x: 10 }, result.entries)
    expect(reverted).toEqual({})
  })

  it('reverts removed entries', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, {})
    const reverted = differ.revertDiff({}, result.entries)
    expect(reverted).toEqual({ a: 1 })
  })

  it('reverts modified entries', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects({ a: 1 }, { a: 2 })
    const reverted = differ.revertDiff({ a: 2 }, result.entries)
    expect(reverted).toEqual({ a: 1 })
  })

  // ─── mergeDiffs ───

  it('merges multiple diff results', () => {
    const differ = new ConfigDiffer()
    const r1 = differ.diffObjects({}, { a: 1 })
    const r2 = differ.diffObjects({}, { b: 2 })
    const merged = differ.mergeDiffs([r1, r2])
    expect(merged.summary.added).toBe(2)
    expect(merged.entries.length).toBe(2)
  })

  it('merges empty results', () => {
    const differ = new ConfigDiffer()
    const r1 = differ.diffObjects({}, {})
    const r2 = differ.diffObjects({}, {})
    const merged = differ.mergeDiffs([r1, r2])
    expect(merged.entries.length).toBe(0)
  })

  // ─── generatePatch ───

  it('generates patch entries', () => {
    const differ = new ConfigDiffer()
    const patch = differ.generatePatch({ a: 1 }, { a: 2, b: 3 })
    expect(patch.length).toBe(2)
  })

  // ─── Complex scenarios ───

  it('handles mixed add/remove/modify', () => {
    const differ = new ConfigDiffer()
    const result = differ.diffObjects(
      { a: 1, b: 2, c: 3 },
      { a: 1, b: 5, d: 4 }
    )
    expect(result.summary.added).toBe(1)
    expect(result.summary.removed).toBe(1)
    expect(result.summary.modified).toBe(1)
  })

  it('handles deeply nested diff and apply', () => {
    const differ = new ConfigDiffer()
    const before = { server: { db: { host: 'localhost' } } }
    const after = { server: { db: { host: 'prod' } } }
    const result = differ.diffObjects(before, after)
    expect(result.summary.modified).toBe(1)
    const applied = differ.applyDiff({ ...before }, result.entries)
    expect(applied).toEqual(after)
  })

  it('round-trip apply then revert', () => {
    const differ = new ConfigDiffer()
    const before = { a: 1, b: 2 }
    const after = { a: 3, c: 4 }
    const result = differ.diffObjects(before, after)
    const applied = differ.applyDiff({ ...before }, result.entries)
    expect(applied).toEqual(after)
    const reverted = differ.revertDiff({ ...applied }, result.entries)
    expect(reverted).toEqual(before)
  })
})
