import { describe, it, expect } from 'vitest'
import { CountedBTree } from '../src/core/counted-btree/counted-btree.js'

// ─── Constructor ───

describe('CountedBTree', () => {
  it('creates with default options', () => {
    const bt = new CountedBTree<string>()
    expect(bt.size()).toBe(0)
    expect(bt.isEmpty()).toBe(true)
  })

  it('creates with custom order', () => {
    const bt = new CountedBTree<string>({ order: 3 })
    expect(bt.size()).toBe(0)
  })

  it('throws on order < 2', () => {
    expect(() => new CountedBTree<string>({ order: 1 })).toThrow('at least 2')
  })

  // ─── Insert / Search ───

  it('insert and search', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'one')
    expect(bt.search(1)).toBe('one')
    expect(bt.search(2)).toBeUndefined()
  })

  it('insert multiple items', () => {
    const bt = new CountedBTree<string>()
    bt.insert(3, 'three')
    bt.insert(1, 'one')
    bt.insert(2, 'two')
    expect(bt.search(1)).toBe('one')
    expect(bt.search(2)).toBe('two')
    expect(bt.search(3)).toBe('three')
    expect(bt.size()).toBe(3)
  })

  it('insert overwrites existing key', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'old')
    bt.insert(1, 'new')
    expect(bt.search(1)).toBe('new')
    expect(bt.size()).toBe(1)
  })

  it('has returns boolean', () => {
    const bt = new CountedBTree<string>()
    bt.insert(5, 'five')
    expect(bt.has(5)).toBe(true)
    expect(bt.has(6)).toBe(false)
  })

  // ─── Delete ───

  it('delete existing key', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'one')
    expect(bt.delete(1)).toBe(true)
    expect(bt.has(1)).toBe(false)
    expect(bt.size()).toBe(0)
  })

  it('delete non-existent returns false', () => {
    const bt = new CountedBTree<string>()
    expect(bt.delete(99)).toBe(false)
  })

  it('delete from empty tree', () => {
    const bt = new CountedBTree<string>()
    expect(bt.delete(1)).toBe(false)
  })

  it('delete maintains other keys', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'one')
    bt.insert(2, 'two')
    bt.insert(3, 'three')
    bt.delete(2)
    expect(bt.has(1)).toBe(true)
    expect(bt.has(3)).toBe(true)
    expect(bt.has(2)).toBe(false)
    expect(bt.size()).toBe(2)
  })

  // ─── Min / Max ───

  it('min returns smallest key', () => {
    const bt = new CountedBTree<string>()
    bt.insert(5, 'five')
    bt.insert(3, 'three')
    bt.insert(7, 'seven')
    expect(bt.min()).toEqual({ key: 3, value: 'three' })
  })

  it('max returns largest key', () => {
    const bt = new CountedBTree<string>()
    bt.insert(5, 'five')
    bt.insert(3, 'three')
    bt.insert(7, 'seven')
    expect(bt.max()).toEqual({ key: 7, value: 'seven' })
  })

  it('min/max on empty returns undefined', () => {
    const bt = new CountedBTree<string>()
    expect(bt.min()).toBeUndefined()
    expect(bt.max()).toBeUndefined()
  })

  // ─── At (index access) ───

  it('at returns value at sorted index', () => {
    const bt = new CountedBTree<string>()
    bt.insert(3, 'three')
    bt.insert(1, 'one')
    bt.insert(2, 'two')
    expect(bt.at(0)).toBe('one')
    expect(bt.at(1)).toBe('two')
    expect(bt.at(2)).toBe('three')
  })

  it('at returns undefined for out of bounds', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'one')
    expect(bt.at(-1)).toBeUndefined()
    expect(bt.at(1)).toBeUndefined()
  })

  it('at on empty returns undefined', () => {
    const bt = new CountedBTree<string>()
    expect(bt.at(0)).toBeUndefined()
  })

  // ─── IndexOf ───

  it('indexOf returns sorted position', () => {
    const bt = new CountedBTree<string>()
    bt.insert(3, 'three')
    bt.insert(1, 'one')
    bt.insert(2, 'two')
    expect(bt.indexOf(1)).toBe(0)
    expect(bt.indexOf(2)).toBe(1)
    expect(bt.indexOf(3)).toBe(2)
  })

  it('indexOf returns -1 for missing', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'one')
    expect(bt.indexOf(99)).toBe(-1)
  })

  // ─── Range ───

  it('range returns keys in interval', () => {
    const bt = new CountedBTree<string>()
    for (let i = 1; i <= 10; i++) bt.insert(i, `v${i}`)
    const result = bt.range(3, 7)
    expect(result.map(r => r.key)).toEqual([3, 4, 5, 6, 7])
  })

  it('range with min > max returns empty', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'a')
    expect(bt.range(5, 3)).toEqual([])
  })

  it('range on empty returns empty', () => {
    const bt = new CountedBTree<string>()
    expect(bt.range(0, 10)).toEqual([])
  })

  // ─── ForEach ───

  it('forEach iterates in order', () => {
    const bt = new CountedBTree<string>()
    bt.insert(3, 'c')
    bt.insert(1, 'a')
    bt.insert(2, 'b')
    const keys: number[] = []
    const values: string[] = []
    bt.forEach((k, v) => { keys.push(k); values.push(v) })
    expect(keys).toEqual([1, 2, 3])
    expect(values).toEqual(['a', 'b', 'c'])
  })

  it('forEach on empty does nothing', () => {
    const bt = new CountedBTree<string>()
    let count = 0
    bt.forEach(() => count++)
    expect(count).toBe(0)
  })

  // ─── Clear ───

  it('clear empties tree', () => {
    const bt = new CountedBTree<string>()
    bt.insert(1, 'one')
    bt.insert(2, 'two')
    bt.clear()
    expect(bt.size()).toBe(0)
    expect(bt.isEmpty()).toBe(true)
    expect(bt.search(1)).toBeUndefined()
  })

  // ─── Larger tree ───

  it('handles 50 sequential inserts', () => {
    const bt = new CountedBTree<number>({ order: 4 })
    for (let i = 0; i < 50; i++) bt.insert(i, i * 10)
    expect(bt.size()).toBe(50)
    expect(bt.min()!.key).toBe(0)
    expect(bt.max()!.key).toBe(49)
    expect(bt.at(0)).toBe(0)
    expect(bt.at(49)).toBe(490)
  })

  it('handles reverse inserts', () => {
    const bt = new CountedBTree<number>({ order: 3 })
    for (let i = 49; i >= 0; i--) bt.insert(i, i * 10)
    expect(bt.size()).toBe(50)
    expect(bt.min()!.key).toBe(0)
    expect(bt.max()!.key).toBe(49)
    expect(bt.indexOf(25)).toBe(25)
  })

  it('handles delete many keys', () => {
    const bt = new CountedBTree<string>({ order: 3 })
    for (let i = 0; i < 20; i++) bt.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) bt.delete(i)
    expect(bt.size()).toBe(10)
    expect(bt.min()!.key).toBe(10)
    expect(bt.max()!.key).toBe(19)
  })

  // ─── Numeric values ───

  it('works with number values', () => {
    const bt = new CountedBTree<number>()
    bt.insert(1, 100)
    bt.insert(2, 200)
    expect(bt.search(1)).toBe(100)
    expect(bt.search(2)).toBe(200)
  })

  // ─── Object values ───

  it('works with object values', () => {
    const bt = new CountedBTree<{ name: string }>()
    bt.insert(1, { name: 'alice' })
    bt.insert(2, { name: 'bob' })
    expect(bt.search(1)!.name).toBe('alice')
    expect(bt.search(2)!.name).toBe('bob')
  })

  // ─── Range query partial match ───

  it('range with partial overlap', () => {
    const bt = new CountedBTree<string>()
    for (let i = 0; i < 20; i++) bt.insert(i, `v${i}`)
    const result = bt.range(15, 25)
    expect(result.map(r => r.key)).toEqual([15, 16, 17, 18, 19])
  })

  it('range single key', () => {
    const bt = new CountedBTree<string>()
    for (let i = 0; i < 10; i++) bt.insert(i, `v${i}`)
    const result = bt.range(5, 5)
    expect(result).toEqual([{ key: 5, value: 'v5' }])
  })
})
