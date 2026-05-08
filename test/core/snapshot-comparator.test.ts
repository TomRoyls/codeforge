import { describe, it, expect, beforeEach } from 'vitest'
import { SnapshotDiffComputer } from '../../src/core/snapshot-comparator/diff-computer.js'
import { SnapshotComparator } from '../../src/core/snapshot-comparator/snapshot-comparator.js'
import type { AnalysisSnapshot, SnapshotEntry } from '../../src/core/snapshot-comparator/types.js'

function createEntry(key: string, value: unknown, timestamp?: number, tags?: string[]): SnapshotEntry {
  return { key, value, timestamp: timestamp ?? Date.now(), tags: tags ?? [] }
}

function createSnapshot(id: string, entries: SnapshotEntry[], metadata?: Record<string, string>): AnalysisSnapshot {
  const map = new Map<string, SnapshotEntry>()
  for (const entry of entries) {
    map.set(entry.key, entry)
  }
  return { id, timestamp: Date.now(), entries: map, metadata: metadata ?? {} }
}

describe('SnapshotDiffComputer', () => {
  let computer: SnapshotDiffComputer

  beforeEach(() => {
    computer = new SnapshotDiffComputer()
  })

  describe('compute', () => {
    it('should return all unchanged for identical snapshots', () => {
      const entries = [createEntry('a', 1), createEntry('b', 'hello')]
      const a = createSnapshot('s1', entries)
      const b = createSnapshot('s2', [createEntry('a', 1), createEntry('b', 'hello')])
      const diffs = computer.compute(a, b)
      expect(diffs.length).toBe(2)
      expect(diffs.every((d) => d.changeType === 'unchanged')).toBe(true)
    })

    it('should detect additions', () => {
      const a = createSnapshot('s1', [createEntry('a', 1)])
      const b = createSnapshot('s2', [createEntry('a', 1), createEntry('b', 2)])
      const diffs = computer.compute(a, b)
      const added = diffs.find((d) => d.key === 'b')
      expect(added).toBeDefined()
      expect(added!.changeType).toBe('added')
      expect(added!.newValue).toBe(2)
    })

    it('should detect removals', () => {
      const a = createSnapshot('s1', [createEntry('a', 1), createEntry('b', 2)])
      const b = createSnapshot('s2', [createEntry('a', 1)])
      const diffs = computer.compute(a, b)
      const removed = diffs.find((d) => d.key === 'b')
      expect(removed).toBeDefined()
      expect(removed!.changeType).toBe('removed')
      expect(removed!.oldValue).toBe(2)
    })

    it('should detect modifications', () => {
      const a = createSnapshot('s1', [createEntry('a', 1)])
      const b = createSnapshot('s2', [createEntry('a', 2)])
      const diffs = computer.compute(a, b)
      expect(diffs[0]!.changeType).toBe('modified')
      expect(diffs[0]!.oldValue).toBe(1)
      expect(diffs[0]!.newValue).toBe(2)
    })

    it('should return empty array for two empty snapshots', () => {
      const a = createSnapshot('s1', [])
      const b = createSnapshot('s2', [])
      const diffs = computer.compute(a, b)
      expect(diffs).toEqual([])
    })

    it('should handle mixed changes across entries', () => {
      const a = createSnapshot('s1', [
        createEntry('a', 1),
        createEntry('b', 2),
        createEntry('c', 3),
      ])
      const b = createSnapshot('s2', [
        createEntry('a', 1),
        createEntry('b', 99),
        createEntry('d', 4),
      ])
      const diffs = computer.compute(a, b)
      expect(diffs.find((d) => d.key === 'a')!.changeType).toBe('unchanged')
      expect(diffs.find((d) => d.key === 'b')!.changeType).toBe('modified')
      expect(diffs.find((d) => d.key === 'c')!.changeType).toBe('removed')
      expect(diffs.find((d) => d.key === 'd')!.changeType).toBe('added')
    })

    it('should include all keys from both snapshots', () => {
      const a = createSnapshot('s1', [createEntry('x', 1)])
      const b = createSnapshot('s2', [createEntry('y', 2)])
      const diffs = computer.compute(a, b)
      const keys = diffs.map((d) => d.key)
      expect(keys).toContain('x')
      expect(keys).toContain('y')
    })

    it('should handle complex nested object values', () => {
      const obj1 = { nested: { deep: [1, 2, 3] } }
      const obj2 = { nested: { deep: [1, 2, 4] } }
      const a = createSnapshot('s1', [createEntry('obj', obj1)])
      const b = createSnapshot('s2', [createEntry('obj', obj2)])
      const diffs = computer.compute(a, b)
      expect(diffs[0]!.changeType).toBe('modified')
    })
  })

  describe('computeKey', () => {
    it('should return added when valA is undefined', () => {
      expect(computer.computeKey(undefined, 'value')).toBe('added')
    })

    it('should return removed when valB is undefined', () => {
      expect(computer.computeKey('value', undefined)).toBe('removed')
    })

    it('should return unchanged for equal values', () => {
      expect(computer.computeKey(42, 42)).toBe('unchanged')
    })

    it('should return modified for different values', () => {
      expect(computer.computeKey(1, 2)).toBe('modified')
    })

    it('should return unchanged when both are undefined', () => {
      expect(computer.computeKey(undefined, undefined)).toBe('unchanged')
    })

    it('should compare number values', () => {
      expect(computer.computeKey(100, 100)).toBe('unchanged')
      expect(computer.computeKey(100, 200)).toBe('modified')
    })

    it('should compare string values', () => {
      expect(computer.computeKey('hello', 'hello')).toBe('unchanged')
      expect(computer.computeKey('hello', 'world')).toBe('modified')
    })

    it('should compare boolean values', () => {
      expect(computer.computeKey(true, true)).toBe('unchanged')
      expect(computer.computeKey(true, false)).toBe('modified')
    })

    it('should compare null values', () => {
      expect(computer.computeKey(null, null)).toBe('unchanged')
      expect(computer.computeKey(null, 'value')).toBe('modified')
    })

    it('should compare object values by deep equality', () => {
      const obj = { a: 1, b: [2, 3] }
      expect(computer.computeKey(obj, { a: 1, b: [2, 3] })).toBe('unchanged')
      expect(computer.computeKey(obj, { a: 1, b: [2, 4] })).toBe('modified')
    })

    it('should compare array values', () => {
      expect(computer.computeKey([1, 2, 3], [1, 2, 3])).toBe('unchanged')
      expect(computer.computeKey([1, 2, 3], [1, 2, 4])).toBe('modified')
    })
  })

  describe('summarize', () => {
    it('should count added entries correctly', () => {
      const diffs = [
        { key: 'a', changeType: 'added' as const, oldValue: undefined, newValue: 1 },
        { key: 'b', changeType: 'added' as const, oldValue: undefined, newValue: 2 },
      ]
      const summary = computer.summarize(diffs)
      expect(summary.added).toBe(2)
    })

    it('should count removed entries correctly', () => {
      const diffs = [
        { key: 'a', changeType: 'removed' as const, oldValue: 1, newValue: undefined },
      ]
      const summary = computer.summarize(diffs)
      expect(summary.removed).toBe(1)
    })

    it('should count modified entries correctly', () => {
      const diffs = [
        { key: 'a', changeType: 'modified' as const, oldValue: 1, newValue: 2 },
        { key: 'b', changeType: 'modified' as const, oldValue: 3, newValue: 4 },
        { key: 'c', changeType: 'modified' as const, oldValue: 5, newValue: 6 },
      ]
      const summary = computer.summarize(diffs)
      expect(summary.modified).toBe(3)
    })

    it('should count unchanged entries correctly', () => {
      const diffs = [
        { key: 'a', changeType: 'unchanged' as const, oldValue: 1, newValue: 1 },
      ]
      const summary = computer.summarize(diffs)
      expect(summary.unchanged).toBe(1)
    })

    it('should calculate changePercent correctly', () => {
      const diffs = [
        { key: 'a', changeType: 'unchanged' as const, oldValue: 1, newValue: 1 },
        { key: 'b', changeType: 'modified' as const, oldValue: 2, newValue: 3 },
      ]
      const summary = computer.summarize(diffs)
      expect(summary.changePercent).toBe(50)
    })

    it('should return zero changePercent for empty diffs', () => {
      const summary = computer.summarize([])
      expect(summary.changePercent).toBe(0)
    })

    it('should return 100 changePercent when all changed', () => {
      const diffs = [
        { key: 'a', changeType: 'added' as const, oldValue: undefined, newValue: 1 },
        { key: 'b', changeType: 'removed' as const, oldValue: 2, newValue: undefined },
        { key: 'c', changeType: 'modified' as const, oldValue: 3, newValue: 4 },
      ]
      const summary = computer.summarize(diffs)
      expect(summary.changePercent).toBe(100)
    })

    it('should set totalKeys to diff count', () => {
      const diffs = [
        { key: 'a', changeType: 'unchanged' as const, oldValue: 1, newValue: 1 },
        { key: 'b', changeType: 'added' as const, oldValue: undefined, newValue: 2 },
      ]
      const summary = computer.summarize(diffs)
      expect(summary.totalKeys).toBe(2)
    })
  })
})

describe('SnapshotComparator', () => {
  let comparator: SnapshotComparator

  beforeEach(() => {
    comparator = new SnapshotComparator()
  })

  describe('addSnapshot', () => {
    it('should store a snapshot by id', () => {
      const snapshot = createSnapshot('s1', [createEntry('a', 1)])
      comparator.addSnapshot(snapshot)
      expect(comparator.getSnapshot('s1')).toBe(snapshot)
    })

    it('should store multiple snapshots', () => {
      const s1 = createSnapshot('s1', [createEntry('a', 1)])
      const s2 = createSnapshot('s2', [createEntry('b', 2)])
      comparator.addSnapshot(s1)
      comparator.addSnapshot(s2)
      expect(comparator.getSnapshot('s1')).toBe(s1)
      expect(comparator.getSnapshot('s2')).toBe(s2)
    })

    it('should overwrite snapshot with same id', () => {
      const s1 = createSnapshot('s1', [createEntry('a', 1)])
      const s1Updated = createSnapshot('s1', [createEntry('a', 2)])
      comparator.addSnapshot(s1)
      comparator.addSnapshot(s1Updated)
      expect(comparator.getSnapshot('s1')).toBe(s1Updated)
      expect(comparator.getSnapshot('s1')!.entries.get('a')!.value).toBe(2)
    })
  })

  describe('getSnapshot', () => {
    it('should return stored snapshot', () => {
      const snapshot = createSnapshot('s1', [createEntry('a', 1)])
      comparator.addSnapshot(snapshot)
      expect(comparator.getSnapshot('s1')).toBe(snapshot)
    })

    it('should return undefined for non-existent id', () => {
      expect(comparator.getSnapshot('nonexistent')).toBeUndefined()
    })
  })

  describe('compare', () => {
    it('should compare two snapshots with no diffs', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)]))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('a', 1)]))
      const result = comparator.compare('s1', 's2')
      expect(result.snapshotA).toBe('s1')
      expect(result.snapshotB).toBe('s2')
      expect(result.summary.unchanged).toBe(1)
      expect(result.summary.added).toBe(0)
      expect(result.summary.removed).toBe(0)
      expect(result.summary.modified).toBe(0)
    })

    it('should compare two snapshots with all diff types', () => {
      comparator.addSnapshot(createSnapshot('s1', [
        createEntry('a', 1),
        createEntry('b', 2),
        createEntry('c', 3),
      ]))
      comparator.addSnapshot(createSnapshot('s2', [
        createEntry('a', 1),
        createEntry('b', 99),
        createEntry('d', 4),
      ]))
      const result = comparator.compare('s1', 's2')
      expect(result.summary.unchanged).toBe(1)
      expect(result.summary.modified).toBe(1)
      expect(result.summary.added).toBe(1)
      expect(result.summary.removed).toBe(1)
    })

    it('should throw for non-existent idA', () => {
      comparator.addSnapshot(createSnapshot('s2', []))
      expect(() => comparator.compare('missing', 's2')).toThrow('Snapshot not found: missing')
    })

    it('should throw for non-existent idB', () => {
      comparator.addSnapshot(createSnapshot('s1', []))
      expect(() => comparator.compare('s1', 'missing')).toThrow('Snapshot not found: missing')
    })

    it('should return correct summary', () => {
      comparator.addSnapshot(createSnapshot('s1', [
        createEntry('a', 1),
        createEntry('b', 2),
      ]))
      comparator.addSnapshot(createSnapshot('s2', [
        createEntry('a', 1),
        createEntry('b', 5),
        createEntry('c', 3),
      ]))
      const result = comparator.compare('s1', 's2')
      expect(result.summary.totalKeys).toBe(3)
      expect(result.summary.changePercent).toBeGreaterThan(0)
    })

    it('should handle compare with empty entries on both sides', () => {
      comparator.addSnapshot(createSnapshot('s1', []))
      comparator.addSnapshot(createSnapshot('s2', []))
      const result = comparator.compare('s1', 's2')
      expect(result.diffs).toEqual([])
      expect(result.summary.totalKeys).toBe(0)
    })

    it('should handle compare with completely different key sets', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('x', 1)]))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('y', 2)]))
      const result = comparator.compare('s1', 's2')
      expect(result.summary.added).toBe(1)
      expect(result.summary.removed).toBe(1)
      expect(result.summary.unchanged).toBe(0)
    })
  })

  describe('compareLatest', () => {
    it('should compare last 2 snapshots by default', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)], { ts: '100' }))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('a', 2)], { ts: '200' }))
      comparator.addSnapshot(createSnapshot('s3', [createEntry('a', 3)], { ts: '300' }))
      const results = comparator.compareLatest()
      expect(results).toHaveLength(1)
      expect(results[0]!.snapshotA).toBe('s2')
      expect(results[0]!.snapshotB).toBe('s3')
    })

    it('should compare last N snapshots pairwise', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)]))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('a', 2)]))
      comparator.addSnapshot(createSnapshot('s3', [createEntry('a', 3)]))
      const results = comparator.compareLatest(3)
      expect(results).toHaveLength(2)
      expect(results[0]!.snapshotA).toBe('s1')
      expect(results[0]!.snapshotB).toBe('s2')
      expect(results[1]!.snapshotA).toBe('s2')
      expect(results[1]!.snapshotB).toBe('s3')
    })

    it('should return empty array for single snapshot', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)]))
      const results = comparator.compareLatest()
      expect(results).toEqual([])
    })

    it('should return empty array for no snapshots', () => {
      const results = comparator.compareLatest()
      expect(results).toEqual([])
    })

    it('should handle n greater than snapshot count', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)]))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('a', 2)]))
      const results = comparator.compareLatest(10)
      expect(results).toHaveLength(1)
    })
  })

  describe('analyzeTrend', () => {
    it('should return degrading for consistently increasing values', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('errors', 10)]),
        createSnapshot('s2', [createEntry('errors', 20)]),
        createSnapshot('s3', [createEntry('errors', 30)]),
      ]
      const trend = comparator.analyzeTrend('errors', snapshots)
      expect(trend.direction).toBe('degrading')
      expect(trend.metric).toBe('errors')
    })

    it('should return improving for consistently decreasing values', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('score', 90)]),
        createSnapshot('s2', [createEntry('score', 80)]),
        createSnapshot('s3', [createEntry('score', 70)]),
      ]
      const trend = comparator.analyzeTrend('score', snapshots)
      expect(trend.direction).toBe('improving')
    })

    it('should return stable for flat values', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('count', 5)]),
        createSnapshot('s2', [createEntry('count', 5)]),
        createSnapshot('s3', [createEntry('count', 5)]),
      ]
      const trend = comparator.analyzeTrend('count', snapshots)
      expect(trend.direction).toBe('stable')
    })

    it('should return stable for mixed values', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('val', 10)]),
        createSnapshot('s2', [createEntry('val', 5)]),
        createSnapshot('s3', [createEntry('val', 15)]),
      ]
      const trend = comparator.analyzeTrend('val', snapshots)
      expect(trend.direction).toBe('stable')
    })

    it('should use stored snapshots when no array provided', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('metric', 1)]))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('metric', 2)]))
      comparator.addSnapshot(createSnapshot('s3', [createEntry('metric', 3)]))
      const trend = comparator.analyzeTrend('metric')
      expect(trend.direction).toBe('degrading')
      expect(trend.dataPoints).toBe(3)
    })

    it('should return stable for missing metric', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('other', 1)]),
        createSnapshot('s2', [createEntry('other', 2)]),
      ]
      const trend = comparator.analyzeTrend('missing')
      expect(trend.direction).toBe('stable')
      expect(trend.dataPoints).toBe(0)
    })

    it('should calculate changeRate correctly', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('val', 10)]),
        createSnapshot('s2', [createEntry('val', 20)]),
        createSnapshot('s3', [createEntry('val', 30)]),
      ]
      const trend = comparator.analyzeTrend('val', snapshots)
      expect(trend.changeRate).toBe(10)
    })

    it('should set dataPoints to number of matching entries', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('val', 1)]),
        createSnapshot('s2', [createEntry('other', 2)]),
        createSnapshot('s3', [createEntry('val', 3)]),
      ]
      const trend = comparator.analyzeTrend('val', snapshots)
      expect(trend.dataPoints).toBe(2)
    })

    it('should return stable with single data point', () => {
      const snapshots = [createSnapshot('s1', [createEntry('val', 42)])]
      const trend = comparator.analyzeTrend('val', snapshots)
      expect(trend.direction).toBe('stable')
      expect(trend.changeRate).toBe(0)
      expect(trend.dataPoints).toBe(1)
    })

    it('should handle non-numeric values gracefully', () => {
      const snapshots = [
        createSnapshot('s1', [createEntry('val', 'not a number')]),
        createSnapshot('s2', [createEntry('val', 'also not')]),
      ]
      const trend = comparator.analyzeTrend('val', snapshots)
      expect(trend.direction).toBe('stable')
      expect(trend.dataPoints).toBe(0)
    })
  })

  describe('getDriftReport', () => {
    it('should filter out unchanged entries', () => {
      comparator.addSnapshot(createSnapshot('s1', [
        createEntry('a', 1),
        createEntry('b', 2),
        createEntry('c', 3),
      ]))
      comparator.addSnapshot(createSnapshot('s2', [
        createEntry('a', 1),
        createEntry('b', 99),
        createEntry('d', 4),
      ]))
      const drift = comparator.getDriftReport('s1', 's2')
      expect(drift.every((d) => d.changeType !== 'unchanged')).toBe(true)
    })

    it('should include modified entries', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)]))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('a', 2)]))
      const drift = comparator.getDriftReport('s1', 's2')
      expect(drift).toHaveLength(1)
      expect(drift[0]!.changeType).toBe('modified')
    })

    it('should include added entries', () => {
      comparator.addSnapshot(createSnapshot('s1', []))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('new', 1)]))
      const drift = comparator.getDriftReport('s1', 's2')
      expect(drift).toHaveLength(1)
      expect(drift[0]!.changeType).toBe('added')
    })

    it('should include removed entries', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('old', 1)]))
      comparator.addSnapshot(createSnapshot('s2', []))
      const drift = comparator.getDriftReport('s1', 's2')
      expect(drift).toHaveLength(1)
      expect(drift[0]!.changeType).toBe('removed')
    })

    it('should return empty for identical snapshots', () => {
      comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)]))
      comparator.addSnapshot(createSnapshot('s2', [createEntry('a', 1)]))
      const drift = comparator.getDriftReport('s1', 's2')
      expect(drift).toEqual([])
    })
  })

  describe('getSnapshotIds', () => {
    it('should return all stored snapshot ids', () => {
      comparator.addSnapshot(createSnapshot('s1', []))
      comparator.addSnapshot(createSnapshot('s2', []))
      comparator.addSnapshot(createSnapshot('s3', []))
      const ids = comparator.getSnapshotIds()
      expect(ids).toHaveLength(3)
      expect(ids).toContain('s1')
      expect(ids).toContain('s2')
      expect(ids).toContain('s3')
    })

    it('should return empty array when no snapshots', () => {
      expect(comparator.getSnapshotIds()).toEqual([])
    })
  })

  describe('clear', () => {
    it('should remove all snapshots', () => {
      comparator.addSnapshot(createSnapshot('s1', []))
      comparator.addSnapshot(createSnapshot('s2', []))
      comparator.clear()
      expect(comparator.getSnapshotIds()).toEqual([])
      expect(comparator.getSnapshot('s1')).toBeUndefined()
    })

    it('should work on empty comparator', () => {
      comparator.clear()
      expect(comparator.getSnapshotIds()).toEqual([])
    })

    it('should allow adding snapshots after clear', () => {
      comparator.addSnapshot(createSnapshot('s1', []))
      comparator.clear()
      comparator.addSnapshot(createSnapshot('s2', []))
      expect(comparator.getSnapshotIds()).toEqual(['s2'])
    })
  })
})

describe('Edge Cases', () => {
  let comparator: SnapshotComparator

  beforeEach(() => {
    comparator = new SnapshotComparator()
  })

  it('should throw when comparing non-existent snapshot ids', () => {
    expect(() => comparator.compare('a', 'b')).toThrow()
  })

  it('should handle single snapshot in compareLatest', () => {
    comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1)]))
    expect(comparator.compareLatest()).toEqual([])
  })

  it('should handle empty entries in snapshots during compare', () => {
    comparator.addSnapshot(createSnapshot('s1', []))
    comparator.addSnapshot(createSnapshot('s2', []))
    const result = comparator.compare('s1', 's2')
    expect(result.diffs).toEqual([])
    expect(result.summary.totalKeys).toBe(0)
    expect(result.summary.changePercent).toBe(0)
  })

  it('should preserve complex nested values in diffs', () => {
    const nested = { level1: { level2: { level3: [1, 2, { deep: true }] } } }
    comparator.addSnapshot(createSnapshot('s1', [createEntry('data', nested)]))
    comparator.addSnapshot(createSnapshot('s2', [createEntry('data', nested)]))
    const result = comparator.compare('s1', 's2')
    expect(result.diffs[0]!.changeType).toBe('unchanged')
    expect(result.diffs[0]!.oldValue).toEqual(nested)
    expect(result.diffs[0]!.newValue).toEqual(nested)
  })

  it('should preserve timestamps in entries', () => {
    const entry = createEntry('metric', 42, 1700000000000)
    const snapshot = createSnapshot('s1', [entry])
    comparator.addSnapshot(snapshot)
    const retrieved = comparator.getSnapshot('s1')
    expect(retrieved!.entries.get('metric')!.timestamp).toBe(1700000000000)
  })

  it('should preserve metadata in snapshots', () => {
    const snapshot = createSnapshot('s1', [], { version: '1.0', source: 'test' })
    comparator.addSnapshot(snapshot)
    const retrieved = comparator.getSnapshot('s1')
    expect(retrieved!.metadata).toEqual({ version: '1.0', source: 'test' })
  })

  it('should handle overlapping key sets correctly', () => {
    comparator.addSnapshot(createSnapshot('s1', [
      createEntry('shared', 1),
      createEntry('only-a', 'x'),
    ]))
    comparator.addSnapshot(createSnapshot('s2', [
      createEntry('shared', 1),
      createEntry('only-b', 'y'),
    ]))
    const result = comparator.compare('s1', 's2')
    expect(result.summary.unchanged).toBe(1)
    expect(result.summary.removed).toBe(1)
    expect(result.summary.added).toBe(1)
  })

  it('should handle large number of entries', () => {
    const entries: SnapshotEntry[] = []
    for (let i = 0; i < 100; i++) {
      entries.push(createEntry(`key-${i}`, i))
    }
    comparator.addSnapshot(createSnapshot('s1', entries))
    comparator.addSnapshot(createSnapshot('s2', entries.map((e) => createEntry(e.key, e.value))))
    const result = comparator.compare('s1', 's2')
    expect(result.summary.totalKeys).toBe(100)
    expect(result.summary.unchanged).toBe(100)
  })

  it('should handle comparing snapshot with itself', () => {
    comparator.addSnapshot(createSnapshot('s1', [createEntry('a', 1), createEntry('b', 2)]))
    const result = comparator.compare('s1', 's1')
    expect(result.summary.unchanged).toBe(2)
    expect(result.summary.changePercent).toBe(0)
  })

  it('should preserve entry tags', () => {
    const entry = createEntry('metric', 42, Date.now(), ['important', 'tracked'])
    const snapshot = createSnapshot('s1', [entry])
    comparator.addSnapshot(snapshot)
    const retrieved = comparator.getSnapshot('s1')
    expect(retrieved!.entries.get('metric')!.tags).toEqual(['important', 'tracked'])
  })

  it('should compute changePercent with precision', () => {
    const computer = new SnapshotDiffComputer()
    const diffs = [
      { key: 'a', changeType: 'modified' as const, oldValue: 1, newValue: 2 },
      { key: 'b', changeType: 'unchanged' as const, oldValue: 1, newValue: 1 },
      { key: 'c', changeType: 'unchanged' as const, oldValue: 1, newValue: 1 },
    ]
    const summary = computer.summarize(diffs)
    expect(summary.changePercent).toBe(33.33)
  })

  it('should handle trend analysis with empty snapshots array', () => {
    const trend = comparator.analyzeTrend('metric', [])
    expect(trend.direction).toBe('stable')
    expect(trend.dataPoints).toBe(0)
  })

  it('should correctly identify improving trend with negative changeRate', () => {
    const snapshots = [
      createSnapshot('s1', [createEntry('bugs', 50)]),
      createSnapshot('s2', [createEntry('bugs', 40)]),
      createSnapshot('s3', [createEntry('bugs', 30)]),
      createSnapshot('s4', [createEntry('bugs', 20)]),
    ]
    const trend = comparator.analyzeTrend('bugs', snapshots)
    expect(trend.direction).toBe('improving')
    expect(trend.changeRate).toBe(-10)
  })

  it('should correctly identify degrading trend with positive changeRate', () => {
    const snapshots = [
      createSnapshot('s1', [createEntry('debt', 10)]),
      createSnapshot('s2', [createEntry('debt', 25)]),
      createSnapshot('s3', [createEntry('debt', 40)]),
    ]
    const trend = comparator.analyzeTrend('debt', snapshots)
    expect(trend.direction).toBe('degrading')
    expect(trend.changeRate).toBe(15)
  })

  it('should handle driftReport with multiple change types', () => {
    comparator.addSnapshot(createSnapshot('s1', [
      createEntry('a', 1),
      createEntry('b', 2),
      createEntry('c', 3),
      createEntry('d', 4),
    ]))
    comparator.addSnapshot(createSnapshot('s2', [
      createEntry('a', 1),
      createEntry('b', 99),
      createEntry('e', 5),
    ]))
    const drift = comparator.getDriftReport('s1', 's2')
    expect(drift).toHaveLength(4)
    const types = drift.map((d) => d.changeType)
    expect(types).toContain('modified')
    expect(types).toContain('removed')
    expect(types).toContain('added')
    expect(types).not.toContain('unchanged')
  })

  it('should handle compareLatest ordering by timestamp', () => {
    const s1: AnalysisSnapshot = { id: 's1', timestamp: 100, entries: new Map([['a', createEntry('a', 1)]]), metadata: {} }
    const s2: AnalysisSnapshot = { id: 's2', timestamp: 200, entries: new Map([['a', createEntry('a', 2)]]), metadata: {} }
    const s3: AnalysisSnapshot = { id: 's3', timestamp: 300, entries: new Map([['a', createEntry('a', 3)]]), metadata: {} }
    comparator.addSnapshot(s3)
    comparator.addSnapshot(s1)
    comparator.addSnapshot(s2)
    const results = comparator.compareLatest(3)
    expect(results).toHaveLength(2)
    expect(results[0]!.snapshotA).toBe('s1')
    expect(results[0]!.snapshotB).toBe('s2')
    expect(results[1]!.snapshotA).toBe('s2')
    expect(results[1]!.snapshotB).toBe('s3')
  })

  it('should handle analyzeTrend with mixed numeric and non-numeric entries', () => {
    const snapshots = [
      createSnapshot('s1', [createEntry('val', 10), createEntry('label', 'a')]),
      createSnapshot('s2', [createEntry('val', 20), createEntry('label', 'b')]),
    ]
    const trend = comparator.analyzeTrend('val', snapshots)
    expect(trend.direction).toBe('degrading')
    expect(trend.dataPoints).toBe(2)
  })
})
