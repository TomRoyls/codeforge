import { describe, expect, it } from 'vitest'
import { SnapshotStore } from '../../../src/core/snapshot/snapshot-store.js'

// ─── save() ───

describe('SnapshotStore save()', () => {
  it('creates snapshot with id, name, content, hash, and createdAt', () => {
    const store = new SnapshotStore()
    const snapshot = store.save('test', 'hello world')
    expect(snapshot.id).toBeTruthy()
    expect(typeof snapshot.id).toBe('string')
    expect(snapshot.name).toBe('test')
    expect(snapshot.content).toBe('hello world')
    expect(snapshot.hash).toBeTruthy()
    expect(snapshot.createdAt).toBeGreaterThan(0)
  })

  it('includes metadata when provided', () => {
    const store = new SnapshotStore()
    const snapshot = store.save('test', 'content', { author: 'bot', version: 2 })
    expect(snapshot.metadata).toEqual({ author: 'bot', version: 2 })
  })

  it('defaults metadata to empty object', () => {
    const store = new SnapshotStore()
    const snapshot = store.save('test', 'content')
    expect(snapshot.metadata).toEqual({})
  })

  it('defaults tags to empty array', () => {
    const store = new SnapshotStore()
    const snapshot = store.save('test', 'content')
    expect(snapshot.tags).toEqual([])
  })

  it('preserves tags when overwriting existing snapshot', () => {
    const store = new SnapshotStore()
    store.save('test', 'v1')
    const existing = store.load('test')!
    existing.tags.push('important')
    const overwritten = store.save('test', 'v2')
    expect(overwritten.tags).toEqual(['important'])
  })

  it('uses empty tags for new snapshot even if no prior entry', () => {
    const store = new SnapshotStore()
    const snapshot = store.save('fresh', 'data')
    expect(snapshot.tags).toEqual([])
  })

  it('computes hash from content', () => {
    const store = new SnapshotStore()
    const snapshot = store.save('test', 'hello')
    expect(snapshot.hash).toBe(store.getHash('hello'))
  })

  it('generates unique ids for different saves', () => {
    const store = new SnapshotStore()
    const s1 = store.save('a', 'content')
    const s2 = store.save('b', 'content')
    expect(s1.id).not.toBe(s2.id)
  })
})

// ─── load() ───

describe('SnapshotStore load()', () => {
  it('returns saved snapshot by name', () => {
    const store = new SnapshotStore()
    const saved = store.save('my-snap', 'data')
    const loaded = store.load('my-snap')
    expect(loaded).not.toBeNull()
    expect(loaded!.id).toBe(saved.id)
    expect(loaded!.content).toBe('data')
  })

  it('returns null for missing snapshot', () => {
    const store = new SnapshotStore()
    expect(store.load('nonexistent')).toBeNull()
  })

  it('returns the latest version after overwrite', () => {
    const store = new SnapshotStore()
    store.save('test', 'v1')
    store.save('test', 'v2')
    const loaded = store.load('test')
    expect(loaded!.content).toBe('v2')
  })
})

// ─── delete() ───

describe('SnapshotStore delete()', () => {
  it('returns true for existing snapshot', () => {
    const store = new SnapshotStore()
    store.save('test', 'data')
    expect(store.delete('test')).toBe(true)
    expect(store.load('test')).toBeNull()
  })

  it('returns false for missing snapshot', () => {
    const store = new SnapshotStore()
    expect(store.delete('nonexistent')).toBe(false)
  })
})

// ─── list() ───

describe('SnapshotStore list()', () => {
  it('returns all saved snapshots', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.save('b', '2')
    store.save('c', '3')
    const list = store.list()
    expect(list).toHaveLength(3)
    const names = list.map(s => s.name).sort()
    expect(names).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array when no snapshots', () => {
    const store = new SnapshotStore()
    expect(store.list()).toEqual([])
  })
})

// ─── exists() ───

describe('SnapshotStore exists()', () => {
  it('returns true for existing snapshot', () => {
    const store = new SnapshotStore()
    store.save('test', 'data')
    expect(store.exists('test')).toBe(true)
  })

  it('returns false for missing snapshot', () => {
    const store = new SnapshotStore()
    expect(store.exists('nonexistent')).toBe(false)
  })
})

// ─── getHash() ───

describe('SnapshotStore getHash()', () => {
  it('returns consistent hash for same content', () => {
    const store = new SnapshotStore()
    const h1 = store.getHash('hello')
    const h2 = store.getHash('hello')
    expect(h1).toBe(h2)
  })

  it('returns different hashes for different content', () => {
    const store = new SnapshotStore()
    expect(store.getHash('hello')).not.toBe(store.getHash('world'))
  })

  it('returns a sha256 hex string for empty string', () => {
    const store = new SnapshotStore()
    const hash = store.getHash('')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})

// ─── clear() ───

describe('SnapshotStore clear()', () => {
  it('removes all snapshots', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.save('b', '2')
    store.clear()
    expect(store.list()).toEqual([])
    expect(store.count()).toBe(0)
  })
})

// ─── count() ───

describe('SnapshotStore count()', () => {
  it('returns 0 for empty store', () => {
    const store = new SnapshotStore()
    expect(store.count()).toBe(0)
  })

  it('returns correct count after saves', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.save('b', '2')
    expect(store.count()).toBe(2)
  })

  it('decrements after delete', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.save('b', '2')
    store.delete('a')
    expect(store.count()).toBe(1)
  })

  it('resets to 0 after clear', () => {
    const store = new SnapshotStore()
    store.save('a', '1')
    store.clear()
    expect(store.count()).toBe(0)
  })
})
