import { describe, it, expect, beforeEach } from 'vitest'
import { SnapshotStore } from '../../src/core/snapshot/snapshot-store.js'
import { SnapshotComparator } from '../../src/core/snapshot/snapshot-comparator.js'
import { SnapshotManager } from '../../src/core/snapshot/snapshot-manager.js'

describe('SnapshotStore', () => {
  let store: SnapshotStore

  beforeEach(() => {
    store = new SnapshotStore()
  })

  describe('save', () => {
    it('should save a snapshot and return it', () => {
      const snapshot = store.save('test', 'hello world')
      expect(snapshot.name).toBe('test')
      expect(snapshot.content).toBe('hello world')
      expect(snapshot.hash).toBeTruthy()
      expect(snapshot.id).toBeTruthy()
      expect(snapshot.createdAt).toBeGreaterThan(0)
    })

    it('should save snapshot with metadata', () => {
      const snapshot = store.save('test', 'content', { author: 'bot', version: 1 })
      expect(snapshot.metadata).toEqual({ author: 'bot', version: 1 })
    })

    it('should save snapshot with default empty metadata', () => {
      const snapshot = store.save('test', 'content')
      expect(snapshot.metadata).toEqual({})
    })

    it('should overwrite existing snapshot with same name', () => {
      store.save('test', 'v1')
      const snapshot = store.save('test', 'v2')
      expect(snapshot.content).toBe('v2')
      expect(store.count()).toBe(1)
    })

    it('should generate unique IDs for different saves', () => {
      const s1 = store.save('a', 'content')
      const s2 = store.save('b', 'content')
      expect(s1.id).not.toBe(s2.id)
    })

    it('should generate consistent hash for same content', () => {
      const s1 = store.save('a', 'hello')
      const s2 = store.save('b', 'hello')
      expect(s1.hash).toBe(s2.hash)
    })

    it('should generate different hashes for different content', () => {
      const s1 = store.save('a', 'hello')
      const s2 = store.save('b', 'world')
      expect(s1.hash).not.toBe(s2.hash)
    })

    it('should set createdAt to a timestamp near Date.now', () => {
      const before = Date.now()
      const snapshot = store.save('test', 'content')
      const after = Date.now()
      expect(snapshot.createdAt).toBeGreaterThanOrEqual(before)
      expect(snapshot.createdAt).toBeLessThanOrEqual(after)
    })
  })

  describe('load', () => {
    it('should load a saved snapshot', () => {
      store.save('test', 'hello')
      const snapshot = store.load('test')
      expect(snapshot).not.toBeNull()
      expect(snapshot!.content).toBe('hello')
    })

    it('should return null for nonexistent snapshot', () => {
      expect(store.load('nonexistent')).toBeNull()
    })

    it('should load the latest version after overwrite', () => {
      store.save('test', 'v1')
      store.save('test', 'v2')
      const snapshot = store.load('test')
      expect(snapshot!.content).toBe('v2')
    })
  })

  describe('delete', () => {
    it('should delete an existing snapshot', () => {
      store.save('test', 'hello')
      expect(store.delete('test')).toBe(true)
      expect(store.load('test')).toBeNull()
    })

    it('should return false for nonexistent snapshot', () => {
      expect(store.delete('nonexistent')).toBe(false)
    })
  })

  describe('list', () => {
    it('should return empty array for empty store', () => {
      expect(store.list()).toEqual([])
    })

    it('should list all snapshots', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      const list = store.list()
      expect(list).toHaveLength(2)
      const names = list.map((s) => s.name)
      expect(names).toContain('a')
      expect(names).toContain('b')
    })

    it('should not list deleted snapshots', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      store.delete('a')
      const list = store.list()
      expect(list).toHaveLength(1)
      expect(list[0]!.name).toBe('b')
    })
  })

  describe('exists', () => {
    it('should return true for existing snapshot', () => {
      store.save('test', 'content')
      expect(store.exists('test')).toBe(true)
    })

    it('should return false for nonexistent snapshot', () => {
      expect(store.exists('nonexistent')).toBe(false)
    })

    it('should return false after deletion', () => {
      store.save('test', 'content')
      store.delete('test')
      expect(store.exists('test')).toBe(false)
    })
  })

  describe('getHash', () => {
    it('should return a consistent hash for same content', () => {
      const h1 = store.getHash('hello')
      const h2 = store.getHash('hello')
      expect(h1).toBe(h2)
    })

    it('should return different hashes for different content', () => {
      const h1 = store.getHash('hello')
      const h2 = store.getHash('world')
      expect(h1).not.toBe(h2)
    })

    it('should return a 64-character hex string', () => {
      const hash = store.getHash('test')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should handle empty string', () => {
      const hash = store.getHash('')
      expect(hash).toBeTruthy()
      expect(hash.length).toBe(64)
    })
  })

  describe('clear', () => {
    it('should clear all snapshots', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      store.clear()
      expect(store.count()).toBe(0)
      expect(store.list()).toEqual([])
    })
  })

  describe('count', () => {
    it('should return 0 for empty store', () => {
      expect(store.count()).toBe(0)
    })

    it('should return correct count after saves', () => {
      store.save('a', 'a')
      store.save('b', 'b')
      expect(store.count()).toBe(2)
    })

    it('should not double-count overwrites', () => {
      store.save('a', 'v1')
      store.save('a', 'v2')
      expect(store.count()).toBe(1)
    })

    it('should decrease after deletion', () => {
      store.save('a', 'a')
      store.save('b', 'b')
      store.delete('a')
      expect(store.count()).toBe(1)
    })
  })
})

describe('SnapshotComparator', () => {
  let comparator: SnapshotComparator

  beforeEach(() => {
    comparator = new SnapshotComparator()
  })

  describe('compare', () => {
    it('should report identical strings as matching', () => {
      const diff = comparator.compare('hello\nworld', 'hello\nworld')
      expect(diff.added).toBe(0)
      expect(diff.removed).toBe(0)
      expect(diff.unchanged).toBe(2)
      expect(diff.matchPercentage).toBe(100)
    })

    it('should detect added lines', () => {
      const diff = comparator.compare('a\nb\nc', 'a\nb')
      expect(diff.removed).toBe(1)
      expect(diff.unchanged).toBeGreaterThanOrEqual(2)
    })

    it('should detect removed lines', () => {
      const diff = comparator.compare('a\nb', 'a\nb\nc')
      expect(diff.added).toBe(1)
      expect(diff.unchanged).toBeGreaterThanOrEqual(2)
    })

    it('should handle completely different content', () => {
      const diff = comparator.compare('aaa', 'bbb')
      expect(diff.unchanged).toBe(0)
      expect(diff.matchPercentage).toBe(0)
    })

    it('should handle empty strings', () => {
      const diff = comparator.compare('', '')
      expect(diff.added).toBe(0)
      expect(diff.removed).toBe(0)
      expect(diff.unchanged).toBe(0)
      expect(diff.matchPercentage).toBe(100)
    })

    it('should handle actual being empty and expected having content', () => {
      const diff = comparator.compare('', 'line1\nline2')
      expect(diff.added).toBe(2)
      expect(diff.removed).toBe(0)
    })

    it('should handle actual having content and expected being empty', () => {
      const diff = comparator.compare('line1\nline2', '')
      expect(diff.removed).toBe(2)
      expect(diff.added).toBe(0)
    })

    it('should produce DiffLine objects with correct types', () => {
      const diff = comparator.compare('a\nc', 'a\nb\nc')
      const types = diff.changes.map((c) => c.type)
      expect(types).toContain('equal')
    })

    it('should produce DiffLine objects with line numbers', () => {
      const diff = comparator.compare('a\nb', 'a\nb')
      for (const line of diff.changes) {
        expect(line.lineNumber).toBeGreaterThan(0)
      }
    })

    it('should calculate matchPercentage correctly', () => {
      const diff = comparator.compare('a\nb\nc\nd', 'a\nb\nx\nd')
      expect(diff.matchPercentage).toBeGreaterThanOrEqual(0)
      expect(diff.matchPercentage).toBeLessThanOrEqual(100)
    })

    it('should handle single line identical', () => {
      const diff = comparator.compare('hello', 'hello')
      expect(diff.unchanged).toBe(1)
      expect(diff.added).toBe(0)
      expect(diff.removed).toBe(0)
      expect(diff.matchPercentage).toBe(100)
    })

    it('should handle single line different', () => {
      const diff = comparator.compare('hello', 'world')
      expect(diff.matchPercentage).toBeLessThan(100)
    })
  })

  describe('compareSnapshots', () => {
    it('should compare two snapshots by content', () => {
      const actual: import('../../src/core/snapshot/types.js').Snapshot = {
        id: '1',
        name: 'test',
        content: 'hello\nworld',
        hash: 'h1',
        createdAt: Date.now(),
        metadata: {},
        tags: [],
      }
      const expected: import('../../src/core/snapshot/types.js').Snapshot = {
        id: '2',
        name: 'test',
        content: 'hello\nworld',
        hash: 'h2',
        createdAt: Date.now(),
        metadata: {},
        tags: [],
      }
      const diff = comparator.compareSnapshots(actual, expected)
      expect(diff.id).toBe('2')
      expect(diff.name).toBe('test')
      expect(diff.matchPercentage).toBe(100)
    })

    it('should detect differences between snapshots', () => {
      const actual: import('../../src/core/snapshot/types.js').Snapshot = {
        id: '1',
        name: 'test',
        content: 'line1\nline2',
        hash: 'h1',
        createdAt: Date.now(),
        metadata: {},
        tags: [],
      }
      const expected: import('../../src/core/snapshot/types.js').Snapshot = {
        id: '2',
        name: 'test',
        content: 'line1\nchanged',
        hash: 'h2',
        createdAt: Date.now(),
        metadata: {},
        tags: [],
      }
      const diff = comparator.compareSnapshots(actual, expected)
      expect(comparator.hasDifferences(diff)).toBe(true)
    })
  })

  describe('calculateMatchPercentage', () => {
    it('should return 100 for perfect match', () => {
      const diff = comparator.compare('a\nb\nc', 'a\nb\nc')
      expect(comparator.calculateMatchPercentage(diff)).toBe(100)
    })

    it('should return 0 for completely different content', () => {
      const diff = comparator.compare('aaa', 'bbb')
      expect(comparator.calculateMatchPercentage(diff)).toBe(0)
    })

    it('should return correct percentage for partial match', () => {
      const diff = comparator.compare('a\nb\nc', 'a\nb\nx')
      expect(comparator.calculateMatchPercentage(diff)).toBeGreaterThan(0)
      expect(comparator.calculateMatchPercentage(diff)).toBeLessThan(100)
    })

    it('should handle empty diff', () => {
      const diff = comparator.compare('', '')
      expect(comparator.calculateMatchPercentage(diff)).toBe(100)
    })
  })

  describe('hasDifferences', () => {
    it('should return false for identical content', () => {
      const diff = comparator.compare('same', 'same')
      expect(comparator.hasDifferences(diff)).toBe(false)
    })

    it('should return true for different content', () => {
      const diff = comparator.compare('a', 'b')
      expect(comparator.hasDifferences(diff)).toBe(true)
    })

    it('should return true when lines are added', () => {
      const diff = comparator.compare('a', 'a\nb')
      expect(comparator.hasDifferences(diff)).toBe(true)
    })

    it('should return true when lines are removed', () => {
      const diff = comparator.compare('a\nb', 'a')
      expect(comparator.hasDifferences(diff)).toBe(true)
    })
  })

  describe('formatDiff', () => {
    it('should return empty string for no changes', () => {
      const diff = comparator.compare('', '')
      expect(comparator.formatDiff(diff)).toBe('')
    })

    it('should format diff lines with + for additions', () => {
      const diff = comparator.compare('', 'hello')
      const formatted = comparator.formatDiff(diff)
      expect(formatted).toContain('+')
      expect(formatted).toContain('hello')
    })

    it('should format diff lines with - for removals', () => {
      const diff = comparator.compare('hello', '')
      const formatted = comparator.formatDiff(diff)
      expect(formatted).toContain('-')
      expect(formatted).toContain('hello')
    })

    it('should format diff lines with space for equal', () => {
      const diff = comparator.compare('hello', 'hello')
      const formatted = comparator.formatDiff(diff)
      expect(formatted).toContain(' hello')
    })

    it('should include line numbers', () => {
      const diff = comparator.compare('a', 'a')
      const formatted = comparator.formatDiff(diff)
      expect(formatted).toContain('1:')
    })

    it('should format multiple lines', () => {
      const diff = comparator.compare('a\nb\nc', 'a\nx\nc')
      const formatted = comparator.formatDiff(diff)
      const lines = formatted.split('\n')
      expect(lines.length).toBeGreaterThan(0)
    })
  })

  describe('filterDiff', () => {
    it('should filter only added lines', () => {
      const diff = comparator.compare('', 'a\nb')
      const added = comparator.filterDiff(diff, 'add')
      expect(added.length).toBe(2)
      expect(added.every((l) => l.type === 'add')).toBe(true)
    })

    it('should filter only removed lines', () => {
      const diff = comparator.compare('a\nb', '')
      const removed = comparator.filterDiff(diff, 'remove')
      expect(removed.length).toBe(2)
      expect(removed.every((l) => l.type === 'remove')).toBe(true)
    })

    it('should filter only equal lines', () => {
      const diff = comparator.compare('a\nb', 'a\nb')
      const equal = comparator.filterDiff(diff, 'equal')
      expect(equal.length).toBe(2)
      expect(equal.every((l) => l.type === 'equal')).toBe(true)
    })

    it('should return empty array when no lines match filter', () => {
      const diff = comparator.compare('a\nb', 'a\nb')
      const added = comparator.filterDiff(diff, 'add')
      expect(added).toEqual([])
    })
  })
})

describe('SnapshotManager', () => {
  let manager: SnapshotManager
  let store: SnapshotStore
  let comparator: SnapshotComparator

  beforeEach(() => {
    store = new SnapshotStore()
    comparator = new SnapshotComparator()
    manager = new SnapshotManager(store, comparator)
  })

  describe('assert', () => {
    it('should return a diff for new snapshot', () => {
      const diff = manager.assert('test', 'content')
      expect(diff.name).toBe('test')
      expect(diff.added).toBe(1)
    })

    it('should return matching diff for identical content', () => {
      store.save('test', 'content')
      const diff = manager.assert('test', 'content')
      expect(diff.matchPercentage).toBe(100)
      expect(comparator.hasDifferences(diff)).toBe(false)
    })

    it('should return mismatching diff for different content', () => {
      store.save('test', 'original')
      const diff = manager.assert('test', 'modified')
      expect(comparator.hasDifferences(diff)).toBe(true)
    })

    it('should set id from existing snapshot', () => {
      const saved = store.save('test', 'content')
      const diff = manager.assert('test', 'content')
      expect(diff.id).toBe(saved.id)
    })

    it('should set empty id for new snapshot', () => {
      const diff = manager.assert('new', 'content')
      expect(diff.id).toBe('')
    })
  })

  describe('update', () => {
    it('should create a new snapshot', () => {
      const result = manager.update('test', 'content')
      expect(result.created).toBe(true)
      expect(result.updated).toBe(false)
      expect(result.previousHash).toBeNull()
      expect(result.newHash).toBeTruthy()
    })

    it('should update an existing snapshot with different content', () => {
      manager.update('test', 'v1')
      const result = manager.update('test', 'v2')
      expect(result.created).toBe(false)
      expect(result.updated).toBe(true)
      expect(result.previousHash).not.toBe(result.newHash)
    })

    it('should not mark as updated when content is the same', () => {
      manager.update('test', 'content')
      const result = manager.update('test', 'content')
      expect(result.created).toBe(false)
      expect(result.updated).toBe(false)
      expect(result.previousHash).toBe(result.newHash)
    })

    it('should return correct previousHash', () => {
      const first = manager.update('test', 'v1')
      const second = manager.update('test', 'v2')
      expect(second.previousHash).toBe(first.newHash)
    })
  })

  describe('checkAll', () => {
    it('should report all new for empty store', () => {
      const entries = new Map<string, string>()
      entries.set('a', 'content-a')
      entries.set('b', 'content-b')
      const report = manager.checkAll(entries)
      expect(report.totalSnapshots).toBe(2)
      expect(report.new).toBe(2)
      expect(report.matched).toBe(0)
      expect(report.mismatched).toBe(0)
      expect(report.results).toHaveLength(2)
    })

    it('should report matched for identical content', () => {
      store.save('a', 'content-a')
      const entries = new Map<string, string>()
      entries.set('a', 'content-a')
      const report = manager.checkAll(entries)
      expect(report.matched).toBe(1)
      expect(report.mismatched).toBe(0)
      expect(report.new).toBe(0)
    })

    it('should report mismatched for different content', () => {
      store.save('a', 'original')
      const entries = new Map<string, string>()
      entries.set('a', 'modified')
      const report = manager.checkAll(entries)
      expect(report.mismatched).toBe(1)
      expect(report.matched).toBe(0)
    })

    it('should report deleted for snapshots not in entries', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      const entries = new Map<string, string>()
      entries.set('a', 'content-a')
      const report = manager.checkAll(entries)
      expect(report.deleted).toBe(1)
    })

    it('should handle empty entries map', () => {
      store.save('a', 'content-a')
      const report = manager.checkAll(new Map())
      expect(report.totalSnapshots).toBe(0)
      expect(report.deleted).toBe(1)
      expect(report.results).toHaveLength(0)
    })

    it('should handle mixed matched, mismatched, and new', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      const entries = new Map<string, string>()
      entries.set('a', 'content-a')
      entries.set('b', 'modified-b')
      entries.set('c', 'content-c')
      const report = manager.checkAll(entries)
      expect(report.matched).toBe(1)
      expect(report.mismatched).toBe(1)
      expect(report.new).toBe(1)
      expect(report.deleted).toBe(0)
    })
  })

  describe('updateAll', () => {
    it('should update all entries', () => {
      const entries = new Map<string, string>()
      entries.set('a', 'content-a')
      entries.set('b', 'content-b')
      const results = manager.updateAll(entries)
      expect(results).toHaveLength(2)
      expect(results.every((r) => r.created)).toBe(true)
    })

    it('should return correct update results for existing entries', () => {
      manager.update('a', 'v1')
      const entries = new Map<string, string>()
      entries.set('a', 'v2')
      entries.set('b', 'v1')
      const results = manager.updateAll(entries)
      expect(results).toHaveLength(2)
      const aResult = results.find((r) => r.previousHash !== null)
      expect(aResult!.updated).toBe(true)
    })

    it('should handle empty map', () => {
      const results = manager.updateAll(new Map())
      expect(results).toEqual([])
    })
  })

  describe('getSummary', () => {
    it('should return zero totals for empty store', () => {
      const summary = manager.getSummary()
      expect(summary.total).toBe(0)
      expect(summary.matched).toBe(0)
      expect(summary.new).toBe(0)
    })

    it('should return correct total after saves', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      const summary = manager.getSummary()
      expect(summary.total).toBe(2)
    })
  })

  describe('prune', () => {
    it('should remove snapshots not in keep list', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      store.save('c', 'content-c')
      const pruned = manager.prune(['a', 'c'])
      expect(pruned).toBe(1)
      expect(store.exists('a')).toBe(true)
      expect(store.exists('b')).toBe(false)
      expect(store.exists('c')).toBe(true)
    })

    it('should return 0 when all are kept', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      const pruned = manager.prune(['a', 'b'])
      expect(pruned).toBe(0)
    })

    it('should remove all when keep list is empty', () => {
      store.save('a', 'content-a')
      store.save('b', 'content-b')
      const pruned = manager.prune([])
      expect(pruned).toBe(2)
      expect(store.count()).toBe(0)
    })

    it('should handle empty store', () => {
      const pruned = manager.prune(['a'])
      expect(pruned).toBe(0)
    })

    it('should handle nonexistent names in keep list', () => {
      store.save('a', 'content-a')
      const pruned = manager.prune(['a', 'nonexistent'])
      expect(pruned).toBe(0)
      expect(store.count()).toBe(1)
    })
  })

  describe('getOrCreate', () => {
    it('should return existing snapshot if it exists', () => {
      const saved = store.save('test', 'original')
      const result = manager.getOrCreate('test', 'different')
      expect(result.content).toBe('original')
      expect(result.id).toBe(saved.id)
    })

    it('should create and return new snapshot if it does not exist', () => {
      const result = manager.getOrCreate('test', 'content')
      expect(result.content).toBe('content')
      expect(result.name).toBe('test')
      expect(result.id).toBeTruthy()
    })

    it('should not overwrite existing snapshot', () => {
      store.save('test', 'original')
      manager.getOrCreate('test', 'different')
      const loaded = store.load('test')
      expect(loaded!.content).toBe('original')
    })

    it('should persist newly created snapshot', () => {
      manager.getOrCreate('test', 'content')
      expect(store.exists('test')).toBe(true)
    })
  })
})

describe('Integration', () => {
  let store: SnapshotStore
  let comparator: SnapshotComparator
  let manager: SnapshotManager

  beforeEach(() => {
    store = new SnapshotStore()
    comparator = new SnapshotComparator()
    manager = new SnapshotManager(store, comparator)
  })

  it('should handle full snapshot lifecycle', () => {
    const result1 = manager.update('output.txt', 'line1\nline2\nline3')
    expect(result1.created).toBe(true)

    const diff1 = manager.assert('output.txt', 'line1\nline2\nline3')
    expect(diff1.matchPercentage).toBe(100)

    const result2 = manager.update('output.txt', 'line1\nmodified\nline3')
    expect(result2.updated).toBe(true)

    const diff2 = manager.assert('output.txt', 'line1\nmodified\nline3')
    expect(diff2.matchPercentage).toBe(100)

    const snapshot = store.load('output.txt')
    expect(snapshot!.content).toBe('line1\nmodified\nline3')
  })

  it('should handle checkAll with mixed results', () => {
    manager.update('file1.txt', 'content-1')
    manager.update('file2.txt', 'content-2')

    const entries = new Map<string, string>()
    entries.set('file1.txt', 'content-1')
    entries.set('file2.txt', 'content-modified')
    entries.set('file3.txt', 'content-3')

    const report = manager.checkAll(entries)
    expect(report.matched).toBe(1)
    expect(report.mismatched).toBe(1)
    expect(report.new).toBe(1)
  })

  it('should prune stale snapshots after checkAll', () => {
    manager.update('file1.txt', 'a')
    manager.update('file2.txt', 'b')
    manager.update('file3.txt', 'c')

    const entries = new Map<string, string>()
    entries.set('file1.txt', 'a')
    entries.set('file3.txt', 'c')

    manager.checkAll(entries)
    manager.prune([...entries.keys()])

    expect(store.count()).toBe(2)
    expect(store.exists('file1.txt')).toBe(true)
    expect(store.exists('file2.txt')).toBe(false)
    expect(store.exists('file3.txt')).toBe(true)
  })

  it('should handle updateAll followed by checkAll', () => {
    const entries = new Map<string, string>()
    entries.set('a', 'v1')
    entries.set('b', 'v1')

    manager.updateAll(entries)

    const checkEntries = new Map<string, string>()
    checkEntries.set('a', 'v1')
    checkEntries.set('b', 'v2')

    const report = manager.checkAll(checkEntries)
    expect(report.matched).toBe(1)
    expect(report.mismatched).toBe(1)
  })

  it('should handle empty content throughout lifecycle', () => {
    manager.update('empty.txt', '')
    const diff = manager.assert('empty.txt', '')
    expect(diff.matchPercentage).toBe(100)
    expect(comparator.hasDifferences(diff)).toBe(false)
  })

  it('should handle multi-line content comparison', () => {
    const content1 = 'line1\nline2\nline3\nline4\nline5'
    const content2 = 'line1\nline2\nchanged\nline4\nline5'
    manager.update('multi.txt', content1)
    const diff = manager.assert('multi.txt', content2)
    expect(comparator.hasDifferences(diff)).toBe(true)
    const removedLines = comparator.filterDiff(diff, 'remove')
    const addedLines = comparator.filterDiff(diff, 'add')
    expect(removedLines.length).toBeGreaterThan(0)
    expect(addedLines.length).toBeGreaterThan(0)
  })

  it('should handle formatDiff output for reporting', () => {
    manager.update('test.txt', 'original')
    const diff = manager.assert('test.txt', 'modified')
    const formatted = comparator.formatDiff(diff)
    expect(typeof formatted).toBe('string')
    if (comparator.hasDifferences(diff)) {
      expect(formatted.length).toBeGreaterThan(0)
    }
  })

  it('should handle large number of snapshots', () => {
    const entries = new Map<string, string>()
    for (let i = 0; i < 50; i++) {
      entries.set(`file-${i}`, `content-${i}`)
    }
    const results = manager.updateAll(entries)
    expect(results).toHaveLength(50)
    expect(results.every((r) => r.created)).toBe(true)
    expect(store.count()).toBe(50)
  })

  it('should correctly track update status across multiple updates', () => {
    const r1 = manager.update('test', 'v1')
    expect(r1.created).toBe(true)
    expect(r1.updated).toBe(false)

    const r2 = manager.update('test', 'v2')
    expect(r2.created).toBe(false)
    expect(r2.updated).toBe(true)

    const r3 = manager.update('test', 'v2')
    expect(r3.created).toBe(false)
    expect(r3.updated).toBe(false)
  })
})
