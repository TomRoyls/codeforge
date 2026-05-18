import { describe, it, expect } from 'vitest'
import { SnapshotStore, SnapshotComparator, SnapshotManager } from '../src/core/snapshot/index.js'

// ─── SnapshotStore ───
describe('SnapshotStore', () => {
  it('saves and loads snapshot', () => {
    const store = new SnapshotStore()
    const snap = store.save('test', 'hello world')
    expect(snap.name).toBe('test')
    expect(snap.content).toBe('hello world')
    expect(snap.hash).toBeDefined()

    const loaded = store.load('test')
    expect(loaded).not.toBeNull()
    expect(loaded!.content).toBe('hello world')
  })

  it('load returns null for missing', () => {
    const store = new SnapshotStore()
    expect(store.load('missing')).toBeNull()
  })

  it('exists checks presence', () => {
    const store = new SnapshotStore()
    store.save('test', 'content')
    expect(store.exists('test')).toBe(true)
    expect(store.exists('missing')).toBe(false)
  })

  it('delete removes snapshot', () => {
    const store = new SnapshotStore()
    store.save('test', 'content')
    expect(store.delete('test')).toBe(true)
    expect(store.exists('test')).toBe(false)
  })

  it('delete returns false for missing', () => {
    const store = new SnapshotStore()
    expect(store.delete('missing')).toBe(false)
  })

  it('list returns all snapshots', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.save('b', '2')
    expect(store.list().length).toBe(2)
  })

  it('count returns total', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.save('b', '2')
    expect(store.count()).toBe(2)
  })

  it('clear removes all', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.clear()
    expect(store.count()).toBe(0)
  })

  it('overwrites existing snapshot', () => {
    const store = new SnapshotStore()
    store.save('test', 'v1')
    store.save('test', 'v2')
    expect(store.count()).toBe(1)
    expect(store.load('test')!.content).toBe('v2')
  })

  it('getHash returns consistent hash', () => {
    const store = new SnapshotStore()
    expect(store.getHash('abc')).toBe(store.getHash('abc'))
    expect(store.getHash('abc')).not.toBe(store.getHash('def'))
  })
})

// ─── SnapshotComparator ───
describe('SnapshotComparator', () => {
  const comp = new SnapshotComparator()

  it('compares identical strings', () => {
    const diff = comp.compare('hello\nworld', 'hello\nworld')
    expect(diff.added).toBe(0)
    expect(diff.removed).toBe(0)
    expect(diff.unchanged).toBe(2)
    expect(diff.matchPercentage).toBe(100)
  })

  it('compares different strings', () => {
    const diff = comp.compare('hello\nworld', 'hello\nthere')
    expect(diff.added).toBeGreaterThan(0)
    expect(diff.removed).toBeGreaterThan(0)
  })

  it('compares empty strings', () => {
    const diff = comp.compare('', '')
    expect(diff.added).toBe(0)
    expect(diff.removed).toBe(0)
    expect(diff.matchPercentage).toBe(100)
  })

  it('hasDifferences detects changes', () => {
    expect(comp.hasDifferences(comp.compare('a', 'b'))).toBe(true)
    expect(comp.hasDifferences(comp.compare('a', 'a'))).toBe(false)
  })

  it('formatDiff produces output', () => {
    const diff = comp.compare('hello', 'world')
    const formatted = comp.formatDiff(diff)
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('filterDiff returns specific types', () => {
    const diff = comp.compare('a\nb', 'a\nc')
    const added = comp.filterDiff(diff, 'add')
    expect(added.length).toBeGreaterThan(0)
    expect(added.every((l) => l.type === 'add')).toBe(true)
  })

  it('compareSnapshots sets id and name', () => {
    const store = new SnapshotStore()
    const snap1 = store.save('test', 'hello')
    const snap2 = store.save('test', 'world')
    const diff = comp.compareSnapshots(snap2, snap1)
    expect(diff.id).toBe(snap1.id)
    expect(diff.name).toBe('test')
  })
})

// ─── SnapshotManager ───
describe('SnapshotManager', () => {
  it('assert creates diff for new snapshot', () => {
    const mgr = new SnapshotManager()
    const diff = mgr.assert('test', 'hello')
    expect(diff.name).toBe('test')
  })

  it('assert compares with existing', () => {
    const mgr = new SnapshotManager()
    mgr.update('test', 'hello')
    const diff = mgr.assert('test', 'world')
    expect(comp.hasDifferences(diff)).toBe(true)
  })

  it('update creates new snapshot', () => {
    const mgr = new SnapshotManager()
    const result = mgr.update('test', 'content')
    expect(result.created).toBe(true)
    expect(result.updated).toBe(false)
  })

  it('update detects changes', () => {
    const mgr = new SnapshotManager()
    mgr.update('test', 'v1')
    const result = mgr.update('test', 'v2')
    expect(result.updated).toBe(true)
    expect(result.created).toBe(false)
  })

  it('checkAll reports status', () => {
    const mgr = new SnapshotManager()
    mgr.update('existing', 'content')
    const entries = new Map<string, string>()
    entries.set('existing', 'content')
    entries.set('new', 'new content')
    const report = mgr.checkAll(entries)
    expect(report.matched).toBe(1)
    expect(report.new).toBe(1)
    expect(report.totalSnapshots).toBe(2)
  })

  it('updateAll updates multiple', () => {
    const mgr = new SnapshotManager()
    const entries = new Map<string, string>()
    entries.set('a', '1')
    entries.set('b', '2')
    const results = mgr.updateAll(entries)
    expect(results.length).toBe(2)
  })

  it('getSummary returns totals', () => {
    const mgr = new SnapshotManager()
    mgr.update('test', 'content')
    const summary = mgr.getSummary()
    expect(summary.total).toBe(1)
  })

  it('prune removes old snapshots', () => {
    const mgr = new SnapshotManager()
    mgr.update('keep', 'content')
    mgr.update('remove', 'content')
    const pruned = mgr.prune(['keep'])
    expect(pruned).toBe(1)
  })

  it('getOrCreate returns existing or creates', () => {
    const mgr = new SnapshotManager()
    const s1 = mgr.getOrCreate('test', 'content')
    const s2 = mgr.getOrCreate('test', 'different')
    expect(s1.content).toBe(s2.content)
  })
})

const comp = new SnapshotComparator()
