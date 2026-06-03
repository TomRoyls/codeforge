import { describe, it, expect } from 'vitest'
import { LSMTree } from '../../src/utils/lsm-tree.js'

describe('LSMTree', () => {
  it('creates tree with default threshold', () => {
    const tree = new LSMTree<string>()
    expect(tree.memtableSize).toBe(0)
    expect(tree.levelCount).toBe(0)
  })

  it('creates tree with custom threshold', () => {
    const tree = new LSMTree<string>(10)
    expect(tree.memtableSize).toBe(0)
  })

  it('sets and gets single value', () => {
    const tree = new LSMTree<string>()
    tree.set('key1', 'value1')
    expect(tree.get('key1')).toBe('value1')
  })

  it('returns undefined for non-existent key', () => {
    const tree = new LSMTree<string>()
    expect(tree.get('missing')).toBeUndefined()
  })

  it('updates existing key', () => {
    const tree = new LSMTree<string>()
    tree.set('key1', 'value1')
    tree.set('key1', 'value2')
    expect(tree.get('key1')).toBe('value2')
  })

  it('deletes key with delete method', () => {
    const tree = new LSMTree<string>()
    tree.set('key1', 'value1')
    tree.delete('key1')
    expect(tree.get('key1')).toBeUndefined()
  })

  it('has returns true for existing keys', () => {
    const tree = new LSMTree<string>()
    tree.set('key1', 'value1')
    expect(tree.has('key1')).toBe(true)
  })

  it('has returns false for deleted keys', () => {
    const tree = new LSMTree<string>()
    tree.set('key1', 'value1')
    tree.delete('key1')
    expect(tree.has('key1')).toBe(false)
  })

  it('has returns false for non-existent keys', () => {
    const tree = new LSMTree<string>()
    expect(tree.has('missing')).toBe(false)
  })

  it('entries returns all entries', () => {
    const tree = new LSMTree<string>()
    tree.set('key1', 'value1')
    tree.set('key2', 'value2')
    tree.set('key3', 'value3')
    const entries = tree.entries()
    expect(entries).toHaveLength(3)
    expect(entries.map((e) => e[0])).toContain('key1')
    expect(entries.map((e) => e[0])).toContain('key2')
    expect(entries.map((e) => e[0])).toContain('key3')
  })

  it('entries excludes deleted keys', () => {
    const tree = new LSMTree<string>()
    tree.set('key1', 'value1')
    tree.set('key2', 'value2')
    tree.delete('key1')
    const entries = tree.entries()
    expect(entries).toHaveLength(1)
    expect(entries[0][0]).toBe('key2')
  })

  it('memtableSize returns correct size', () => {
    const tree = new LSMTree<string>(100)
    tree.set('key1', 'value1')
    tree.set('key2', 'value2')
    expect(tree.memtableSize).toBe(2)
  })

  it('levelCount increases after flush', () => {
    const tree = new LSMTree<string>(5)
    for (let i = 0; i < 10; i++) {
      tree.set(`key${i}`, `value${i}`)
    }
    expect(tree.levelCount).toBeGreaterThan(0)
  })

  it('handles number values', () => {
    const tree = new LSMTree<number>()
    tree.set('num', 42)
    expect(tree.get('num')).toBe(42)
  })

  it('handles object values', () => {
    const tree = new LSMTree<{ name: string }>()
    const obj = { name: 'test' }
    tree.set('obj', obj)
    expect(tree.get('obj')).toEqual(obj)
  })

  it('flushes when threshold reached', () => {
    const tree = new LSMTree<string>(3)
    tree.set('key1', 'value1')
    tree.set('key2', 'value2')
    expect(tree.memtableSize).toBe(2)
    tree.set('key3', 'value3')
    expect(tree.memtableSize).toBe(0)
    expect(tree.levelCount).toBe(1)
  })

  it('compacts levels when needed', () => {
    const tree = new LSMTree<string>(3)
    for (let i = 0; i < 20; i++) {
      tree.set(`key${i}`, `value${i}`)
    }
    expect(tree.levelCount).toBeLessThan(4)
  })

  it('deleted key tombstones trigger flush', () => {
    const tree = new LSMTree<string>(3)
    tree.set('key1', 'value1')
    tree.set('key2', 'value2')
    tree.delete('key3')
    tree.delete('key4')
    expect(tree.memtableSize).toBe(0)
  })

  it('set removes tombstone for existing key', () => {
    const tree = new LSMTree<string>(100)
    tree.set('key1', 'value1')
    tree.delete('key1')
    tree.set('key1', 'newvalue')
    expect(tree.get('key1')).toBe('newvalue')
    expect(tree.has('key1')).toBe(true)
  })

  it('delete removes key', () => {
    const tree = new LSMTree<string, string>()
    tree.set('key1', 'val')
    tree.delete('key1')
    expect(tree.get('key1')).toBeUndefined()
  })

  it('get for missing key returns undefined', () => {
    const tree = new LSMTree<string, string>()
    expect(tree.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const tree = new LSMTree<string, string>()
    tree.set('key', 'value')
    expect(tree.get('key')).toBe('value')
  })
})