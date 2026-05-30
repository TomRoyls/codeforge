import { describe, expect, it } from 'vitest'

import {
  applyPatch,
  diff,
  diffSummary,
} from '../../../src/utils/object-diff.js'

describe('object-diff', () => {
  describe('diff', () => {
    it('returns empty for identical objects', () => {
      const result = diff({ a: 1 }, { a: 1 })
      expect(result).toHaveLength(0)
    })

    it('detects added properties', () => {
      const result = diff({ a: 1 }, { a: 1, b: 2 })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('added')
      expect(result[0]!.path).toBe('b')
      expect(result[0]!.newValue).toBe(2)
    })

    it('detects removed properties', () => {
      const result = diff({ a: 1, b: 2 }, { a: 1 })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('removed')
      expect(result[0]!.path).toBe('b')
      expect(result[0]!.oldValue).toBe(2)
    })

    it('detects changed properties', () => {
      const result = diff({ a: 1 }, { a: 2 })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('changed')
      expect(result[0]!.path).toBe('a')
    })

    it('detects nested changes', () => {
      const result = diff(
        { user: { name: 'old', age: 30 } },
        { user: { name: 'new', age: 30 } },
      )
      expect(result).toHaveLength(1)
      expect(result[0]!.path).toBe('user.name')
      expect(result[0]!.type).toBe('changed')
    })

    it('detects deeply nested changes', () => {
      const result = diff(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 2 } } },
      )
      expect(result).toHaveLength(1)
      expect(result[0]!.path).toBe('a.b.c')
    })

    it('detects array additions', () => {
      const result = diff([1, 2], [1, 2, 3])
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('added')
      expect(result[0]!.path).toBe('[2]')
    })

    it('detects array removals', () => {
      const result = diff([1, 2, 3], [1, 2])
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('removed')
    })

    it('detects array element changes', () => {
      const result = diff([1, 2, 3], [1, 99, 3])
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('changed')
      expect(result[0]!.path).toBe('[1]')
    })

    it('handles type changes', () => {
      const result = diff({ a: 1 }, { a: 'string' })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('changed')
    })

    it('handles null transitions', () => {
      const result = diff({ a: null }, { a: 1 })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('changed')
    })

    it('handles undefined to value', () => {
      const result = diff({ a: undefined }, { a: 1 })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('changed')
    })

    it('handles empty objects', () => {
      expect(diff({}, {})).toHaveLength(0)
    })

    it('handles primitive values', () => {
      expect(diff(1, 2)).toHaveLength(1)
      expect(diff('a', 'b')).toHaveLength(1)
      expect(diff(true, false)).toHaveLength(1)
    })

    it('includes unchanged when option set', () => {
      const result = diff({ a: 1, b: 2 }, { a: 1, b: 3 }, { includeUnchanged: true })
      expect(result).toHaveLength(2)
      const unchanged = result.find((e) => e.type === 'unchanged')
      expect(unchanged).toBeDefined()
      expect(unchanged!.path).toBe('a')
    })

    it('respects maxDepth', () => {
      const deep = { a: { b: { c: { d: { e: 1 } } } } }
      const deep2 = { a: { b: { c: { d: { e: 2 } } } } }
      const result = diff(deep, deep2, { maxDepth: 3 })
      expect(result.length).toBeGreaterThanOrEqual(1)
    })

    it('handles unordered array comparison', () => {
      const result = diff([1, 2, 3], [3, 2, 1], { arrayOrderMatters: false })
      expect(result).toHaveLength(0)
    })

    it('handles unordered array with differences', () => {
      const result = diff([1, 2], [2, 3], { arrayOrderMatters: false })
      expect(result.length).toBeGreaterThan(0)
    })

    it('detects multiple changes', () => {
      const result = diff(
        { a: 1, b: 2, c: 3 },
        { a: 10, b: 2, d: 4 },
      )
      expect(result.length).toBe(3)
      const types = result.map((e) => e.type)
      expect(types).toContain('changed')
      expect(types).toContain('removed')
      expect(types).toContain('added')
    })

    it('handles mixed nested objects and arrays', () => {
      const result = diff(
        { items: [{ id: 1 }, { id: 2 }] },
        { items: [{ id: 1 }, { id: 3 }] },
      )
      expect(result).toHaveLength(1)
      expect(result[0]!.path).toBe('items[1].id')
    })
  })

  describe('diffSummary', () => {
    it('summarizes diff entries', () => {
      const entries = diff(
        { a: 1, b: 2, c: 3 },
        { a: 10, d: 4 },
      )
      const summary = diffSummary(entries)
      expect(summary.total).toBe(entries.length)
      expect(summary.changed).toBeGreaterThanOrEqual(1)
      expect(summary.removed).toBeGreaterThanOrEqual(1)
      expect(summary.added).toBeGreaterThanOrEqual(1)
    })

    it('returns zeros for empty diff', () => {
      const summary = diffSummary([])
      expect(summary).toEqual({ added: 0, changed: 0, removed: 0, unchanged: 0, total: 0 })
    })
  })

  describe('applyPatch', () => {
    it('applies additions', () => {
      const target = { a: 1 }
      const result = applyPatch(target, [
        { path: 'b', type: 'added', oldValue: undefined, newValue: 2 },
      ])
      expect(result.b).toBe(2)
    })

    it('applies changes', () => {
      const target = { a: 1 }
      const result = applyPatch(target, [
        { path: 'a', type: 'changed', oldValue: 1, newValue: 99 },
      ])
      expect(result.a).toBe(99)
    })

    it('applies removals', () => {
      const target = { a: 1, b: 2 }
      const result = applyPatch(target, [
        { path: 'b', type: 'removed', oldValue: 2, newValue: undefined },
      ])
      expect(result).toEqual({ a: 1 })
    })

    it('does not mutate original', () => {
      const target = { a: 1 }
      applyPatch(target, [
        { path: 'b', type: 'added', oldValue: undefined, newValue: 2 },
      ])
      expect(target).toEqual({ a: 1 })
    })

    it('applies nested patches', () => {
      const target = { user: { name: 'old' } }
      const result = applyPatch(target, [
        { path: 'user.name', type: 'changed', oldValue: 'old', newValue: 'new' },
      ])
      expect(result.user.name).toBe('new')
    })

    it('round-trip: diff then apply produces target', () => {
      const source = { a: 1, b: 'hello', c: [1, 2] }
      const target = { a: 2, b: 'hello', d: true }
      const entries = diff(source, target)
      const patched = applyPatch(source as Record<string, unknown>, entries)
      expect(patched.a).toBe(2)
      expect(patched.d).toBe(true)
      expect(Object.keys(patched)).not.toContain('c')
    })
  })
})
