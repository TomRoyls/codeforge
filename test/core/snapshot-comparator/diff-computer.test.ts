import { describe, expect, it } from 'vitest'
import { SnapshotDiffComputer } from '../../../src/core/snapshot-comparator/diff-computer.js'
import type { AnalysisSnapshot } from '../../../src/core/snapshot-comparator/types.js'

// ─── Helpers ───

function makeSnapshot(entries: Record<string, unknown> = {}): AnalysisSnapshot {
  const map = new Map<string, { key: string; value: unknown; timestamp: number; tags: string[] }>()
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, timestamp: Date.now(), tags: [] })
  }
  return { id: 'test', timestamp: Date.now(), entries: map, metadata: {} }
}

// ─── compute() ───

describe('SnapshotDiffComputer compute()', () => {
  it('returns added entries when b has keys not in a', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot()
    const b = makeSnapshot({ x: 1, y: 2 })
    const diffs = computer.compute(a, b)
    const added = diffs.filter(d => d.changeType === 'added')
    expect(added).toHaveLength(2)
    expect(added.map(d => d.key).sort()).toEqual(['x', 'y'])
    for (const d of added) {
      expect(d.oldValue).toBeUndefined()
    }
  })

  it('returns removed entries when a has keys not in b', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot({ x: 1, y: 2 })
    const b = makeSnapshot()
    const diffs = computer.compute(a, b)
    const removed = diffs.filter(d => d.changeType === 'removed')
    expect(removed).toHaveLength(2)
    for (const d of removed) {
      expect(d.newValue).toBeUndefined()
    }
  })

  it('returns modified entries when values differ', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot({ x: 1 })
    const b = makeSnapshot({ x: 2 })
    const diffs = computer.compute(a, b)
    const modified = diffs.filter(d => d.changeType === 'modified')
    expect(modified).toHaveLength(1)
    expect(modified[0]!.oldValue).toBe(1)
    expect(modified[0]!.newValue).toBe(2)
  })

  it('returns unchanged entries when values are equal', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot({ x: 1 })
    const b = makeSnapshot({ x: 1 })
    const diffs = computer.compute(a, b)
    const unchanged = diffs.filter(d => d.changeType === 'unchanged')
    expect(unchanged).toHaveLength(1)
    expect(unchanged[0]!.oldValue).toBe(1)
    expect(unchanged[0]!.newValue).toBe(1)
  })

  it('handles mixed changes across multiple keys', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot({ kept: 1, changed: 'old', removed: true })
    const b = makeSnapshot({ kept: 1, changed: 'new', added: 42 })
    const diffs = computer.compute(a, b)
    const byType = Object.fromEntries(diffs.map(d => [d.key, d.changeType]))
    expect(byType['kept']).toBe('unchanged')
    expect(byType['changed']).toBe('modified')
    expect(byType['removed']).toBe('removed')
    expect(byType['added']).toBe('added')
  })

  it('returns empty array for two empty snapshots', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot()
    const b = makeSnapshot()
    const diffs = computer.compute(a, b)
    expect(diffs).toEqual([])
  })

  it('compares complex object values by JSON serialization', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot({ obj: { a: 1 } })
    const b = makeSnapshot({ obj: { a: 1 } })
    const diffs = computer.compute(a, b)
    expect(diffs[0]!.changeType).toBe('unchanged')
  })

  it('detects modification for objects with different values', () => {
    const computer = new SnapshotDiffComputer()
    const a = makeSnapshot({ obj: { a: 1 } })
    const b = makeSnapshot({ obj: { a: 2 } })
    const diffs = computer.compute(a, b)
    expect(diffs[0]!.changeType).toBe('modified')
  })
})

// ─── computeKey() ───

describe('SnapshotDiffComputer computeKey()', () => {
  it('returns "added" when valA is undefined and valB is present', () => {
    const computer = new SnapshotDiffComputer()
    expect(computer.computeKey(undefined, 42)).toBe('added')
  })

  it('returns "removed" when valA is present and valB is undefined', () => {
    const computer = new SnapshotDiffComputer()
    expect(computer.computeKey(42, undefined)).toBe('removed')
  })

  it('returns "unchanged" when both values are equal primitives', () => {
    const computer = new SnapshotDiffComputer()
    expect(computer.computeKey('hello', 'hello')).toBe('unchanged')
    expect(computer.computeKey(42, 42)).toBe('unchanged')
    expect(computer.computeKey(true, true)).toBe('unchanged')
  })

  it('returns "modified" when values differ', () => {
    const computer = new SnapshotDiffComputer()
    expect(computer.computeKey(1, 2)).toBe('modified')
    expect(computer.computeKey('a', 'b')).toBe('modified')
    expect(computer.computeKey(true, false)).toBe('modified')
  })

  it('returns "modified" when both are undefined but values are different objects', () => {
    const computer = new SnapshotDiffComputer()
    expect(computer.computeKey({ x: 1 }, { x: 2 })).toBe('modified')
  })
})

// ─── summarize() ───

describe('SnapshotDiffComputer summarize()', () => {
  it('counts each change type correctly', () => {
    const computer = new SnapshotDiffComputer()
    const diffs = [
      { key: 'a', changeType: 'added' as const, oldValue: undefined, newValue: 1 },
      { key: 'b', changeType: 'removed' as const, oldValue: 2, newValue: undefined },
      { key: 'c', changeType: 'modified' as const, oldValue: 3, newValue: 4 },
      { key: 'd', changeType: 'unchanged' as const, oldValue: 5, newValue: 5 },
      { key: 'e', changeType: 'added' as const, oldValue: undefined, newValue: 6 },
    ]
    const summary = computer.summarize(diffs)
    expect(summary.totalKeys).toBe(5)
    expect(summary.added).toBe(2)
    expect(summary.removed).toBe(1)
    expect(summary.modified).toBe(1)
    expect(summary.unchanged).toBe(1)
  })

  it('calculates changePercent correctly', () => {
    const computer = new SnapshotDiffComputer()
    const diffs = [
      { key: 'a', changeType: 'added' as const, oldValue: undefined, newValue: 1 },
      { key: 'b', changeType: 'modified' as const, oldValue: 2, newValue: 3 },
      { key: 'c', changeType: 'unchanged' as const, oldValue: 4, newValue: 4 },
    ]
    const summary = computer.summarize(diffs)
    expect(summary.changePercent).toBeCloseTo(66.67, 1)
  })

  it('returns zeroed summary for empty diffs', () => {
    const computer = new SnapshotDiffComputer()
    const summary = computer.summarize([])
    expect(summary.totalKeys).toBe(0)
    expect(summary.added).toBe(0)
    expect(summary.removed).toBe(0)
    expect(summary.modified).toBe(0)
    expect(summary.unchanged).toBe(0)
    expect(summary.changePercent).toBe(0)
  })

  it('returns 100% changePercent when all entries changed', () => {
    const computer = new SnapshotDiffComputer()
    const diffs = [
      { key: 'a', changeType: 'added' as const, oldValue: undefined, newValue: 1 },
      { key: 'b', changeType: 'removed' as const, oldValue: 2, newValue: undefined },
    ]
    const summary = computer.summarize(diffs)
    expect(summary.changePercent).toBe(100)
  })

  it('returns 0% changePercent when all entries are unchanged', () => {
    const computer = new SnapshotDiffComputer()
    const diffs = [
      { key: 'a', changeType: 'unchanged' as const, oldValue: 1, newValue: 1 },
      { key: 'b', changeType: 'unchanged' as const, oldValue: 2, newValue: 2 },
    ]
    const summary = computer.summarize(diffs)
    expect(summary.changePercent).toBe(0)
  })
})
