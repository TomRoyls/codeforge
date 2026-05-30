import { describe, it, expect } from 'vitest'
import { diff, diffSummary, applyPatch, type DiffType } from '../../src/utils/object-diff.js'

describe('object-diff', () => {
  it('returns empty array for identical primitives', () => {
    const result = diff(42, 42)
    expect(result.length).toBe(0)
  })

  it('returns empty array for identical objects', () => {
    const result = diff({ a: 1 }, { a: 1 })
    expect(result.length).toBe(0)
  })

  it('detects changed primitive value', () => {
    const result = diff(1, 2)
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
    expect(result[0]!.oldValue).toBe(1)
    expect(result[0]!.newValue).toBe(2)
  })

  it('detects changed property in object', () => {
    const result = diff({ a: 1 }, { a: 2 })
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
    expect(result[0]!.path).toBe('a')
    expect(result[0]!.oldValue).toBe(1)
    expect(result[0]!.newValue).toBe(2)
  })

  it('detects added property', () => {
    const result = diff({}, { a: 1 })
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('added')
    expect(result[0]!.path).toBe('a')
    expect(result[0]!.oldValue).toBe(undefined)
    expect(result[0]!.newValue).toBe(1)
  })

  it('detects removed property', () => {
    const result = diff({ a: 1 }, {})
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('removed')
    expect(result[0]!.path).toBe('a')
    expect(result[0]!.oldValue).toBe(1)
    expect(result[0]!.newValue).toBe(undefined)
  })

  it('detects nested property changes', () => {
    const result = diff({ a: { b: 1 } }, { a: { b: 2 } })
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
    expect(result[0]!.path).toBe('a.b')
    expect(result[0]!.oldValue).toBe(1)
    expect(result[0]!.newValue).toBe(2)
  })

  it('detects added nested property', () => {
    const result = diff({ a: {} }, { a: { b: 1 } })
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('added')
    expect(result[0]!.path).toBe('a.b')
    expect(result[0]!.oldValue).toBe(undefined)
    expect(result[0]!.newValue).toBe(1)
  })

  it('detects removed nested property', () => {
    const result = diff({ a: { b: 1 } }, { a: {} })
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('removed')
    expect(result[0]!.path).toBe('a.b')
    expect(result[0]!.oldValue).toBe(1)
    expect(result[0]!.newValue).toBe(undefined)
  })

  it('detects array changes when order matters', () => {
    const result = diff([1, 2, 3], [1, 4, 3])
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
    expect(result[0]!.path).toBe('[1]')
    expect(result[0]!.oldValue).toBe(2)
    expect(result[0]!.newValue).toBe(4)
  })

  it('detects added array element', () => {
    const result = diff([1, 2], [1, 2, 3])
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('added')
    expect(result[0]!.path).toBe('[2]')
    expect(result[0]!.oldValue).toBe(undefined)
    expect(result[0]!.newValue).toBe(3)
  })

  it('detects removed array element', () => {
    const result = diff([1, 2, 3], [1, 2])
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('removed')
    expect(result[0]!.path).toBe('[2]')
    expect(result[0]!.oldValue).toBe(3)
    expect(result[0]!.newValue).toBe(undefined)
  })

  it('ignores array order when arrayOrderMatters is false', () => {
    const result = diff([1, 2, 3], [3, 2, 1], { arrayOrderMatters: false })
    expect(result.length).toBe(0)
  })

  it('detects type changes', () => {
    const result = diff(1, '1')
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
    expect(result[0]!.oldValue).toBe(1)
    expect(result[0]!.newValue).toBe('1')
  })

  it('detects null to value change', () => {
    const result = diff(null, 1)
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
  })

  it('detects value to null change', () => {
    const result = diff(1, null)
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
  })

  it('respects maxDepth option', () => {
    const result = diff({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }, { maxDepth: 1 })
    expect(result.length).toBe(1)
    expect(result[0]!.type).toBe('changed')
    expect(result[0]!.path).toBe('a')
  })

  it('includes unchanged entries when includeUnchanged is true', () => {
    const result = diff({ a: 1, b: 2 }, { a: 1, b: 3 }, { includeUnchanged: true })
    expect(result.length).toBe(2)
    const unchanged = result.find((entry) => entry.type === 'unchanged')
    expect(unchanged).toBeDefined()
    expect(unchanged!.path).toBe('a')
  })

  it('diffSummary counts entry types correctly', () => {
    const entries = [
      { path: 'a', type: 'added' as DiffType, oldValue: undefined, newValue: 1 },
      { path: 'b', type: 'changed' as DiffType, oldValue: 1, newValue: 2 },
      { path: 'c', type: 'removed' as DiffType, oldValue: 3, newValue: undefined },
      { path: 'd', type: 'unchanged' as DiffType, oldValue: 4, newValue: 4 },
    ]
    const summary = diffSummary(entries)
    expect(summary.added).toBe(1)
    expect(summary.changed).toBe(1)
    expect(summary.removed).toBe(1)
    expect(summary.unchanged).toBe(1)
    expect(summary.total).toBe(4)
  })

  it('applyPatch adds properties', () => {
    const target = { a: 1 }
    const patches = [{ path: 'b', type: 'added' as DiffType, oldValue: undefined, newValue: 2 }]
    const result = applyPatch(target, patches)
    expect(result.a).toBe(1)
    expect(result.b).toBe(2)
  })

  it('applyPatch changes properties', () => {
    const target = { a: 1 }
    const patches = [{ path: 'a', type: 'changed' as DiffType, oldValue: 1, newValue: 2 }]
    const result = applyPatch(target, patches)
    expect(result.a).toBe(2)
  })

  it('applyPatch removes properties', () => {
    const target = { a: 1 }
    const patches = [{ path: 'a', type: 'removed' as DiffType, oldValue: 1, newValue: undefined }]
    const result = applyPatch(target, patches)
    expect('a' in result).toBe(false)
  })

  it('applyPatch creates nested paths when adding', () => {
    const target = { a: {} }
    const patches = [{ path: 'a.b.c', type: 'added' as DiffType, oldValue: undefined, newValue: 1 }]
    const result = applyPatch(target, patches)
    expect(result.a.b.c).toBe(1)
  })

  it('applyPatch handles multiple patches', () => {
    const target = { a: 1 }
    const patches = [
      { path: 'a', type: 'changed' as DiffType, oldValue: 1, newValue: 2 },
      { path: 'b', type: 'added' as DiffType, oldValue: undefined, newValue: 3 },
      { path: 'c', type: 'removed' as DiffType, oldValue: 4, newValue: undefined },
    ]
    const result = applyPatch(target, patches)
    expect(result.a).toBe(2)
    expect(result.b).toBe(3)
    expect('c' in result).toBe(false)
  })

  it('applyPatch does not modify original object', () => {
    const target = { a: 1 }
    const patches = [{ path: 'a', type: 'changed' as DiffType, oldValue: 1, newValue: 2 }]
    const result = applyPatch(target, patches)
    expect(target.a).toBe(1)
    expect(result.a).toBe(2)
  })

  it('handles deeply nested object comparison', () => {
    const oldObj = { a: { b: { c: { d: 1 } } } }
    const newObj = { a: { b: { c: { d: 2 } } } }
    const result = diff(oldObj, newObj)
    expect(result.length).toBe(1)
    expect(result[0]!.path).toBe('a.b.c.d')
  })

  it('handles array of objects', () => {
    const oldArr = [{ a: 1 }, { b: 2 }]
    const newArr = [{ a: 1 }, { b: 3 }]
    const result = diff(oldArr, newArr)
    expect(result.length).toBe(1)
    expect(result[0]!.path).toBe('[1].b')
  })
})