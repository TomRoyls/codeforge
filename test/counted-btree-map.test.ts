import { describe, it, expect } from 'vitest'
import { CountedBTreeMap } from '../src/core/counted-btree-map/counted-btree-map.js'

// ─── Constructor ───

describe('CountedBTreeMap', () => {
  it('creates with defaults', () => {
    const m = new CountedBTreeMap<number, string>()
    expect(m.size).toBe(0)
    expect(m.isEmpty()).toBe(true)
  })

  it('creates with custom order', () => {
    const m = new CountedBTreeMap<number, string>(3)
    expect(m.size).toBe(0)
  })

  it('creates with custom comparator', () => {
    const m = new CountedBTreeMap<string, number>(4, (a, b) => a.localeCompare(b))
    m.set('b', 2)
    m.set('a', 1)
    expect(m.first!.key).toBe('a')
  })

  it('throws on order < 2', () => {
    expect(() => new CountedBTreeMap<number, string>(1)).toThrow('at least 2')
  })

  // ─── Set / Get ───

  it('set and get', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'one')
    expect(m.get(1)).toBe('one')
    expect(m.get(2)).toBeUndefined()
  })

  it('set overwrites existing', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'old')
    m.set(1, 'new')
    expect(m.get(1)).toBe('new')
    expect(m.size).toBe(1)
  })

  it('set multiple keys', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.get(1)).toBe('a')
    expect(m.get(2)).toBe('b')
    expect(m.get(3)).toBe('c')
    expect(m.size).toBe(3)
  })

  // ─── Has ───

  it('has returns boolean', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(5, 'five')
    expect(m.has(5)).toBe(true)
    expect(m.has(6)).toBe(false)
  })

  it('has on empty returns false', () => {
    const m = new CountedBTreeMap<number, string>()
    expect(m.has(1)).toBe(false)
  })

  // ─── Delete ───

  it('delete existing key', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'one')
    expect(m.delete(1)).toBe(true)
    expect(m.has(1)).toBe(false)
    expect(m.size).toBe(0)
  })

  it('delete non-existent returns false', () => {
    const m = new CountedBTreeMap<number, string>()
    expect(m.delete(99)).toBe(false)
  })

  it('delete maintains other keys', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    m.set(3, 'c')
    m.delete(2)
    expect(m.has(1)).toBe(true)
    expect(m.has(3)).toBe(true)
    expect(m.size).toBe(2)
  })

  // ─── First / Last ───

  it('first returns smallest', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(5, 'e')
    m.set(3, 'c')
    m.set(7, 'g')
    expect(m.first).toEqual({ key: 3, value: 'c' })
  })

  it('last returns largest', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(5, 'e')
    m.set(3, 'c')
    m.set(7, 'g')
    expect(m.last).toEqual({ key: 7, value: 'g' })
  })

  it('first/last on empty', () => {
    const m = new CountedBTreeMap<number, string>()
    expect(m.first).toBeUndefined()
    expect(m.last).toBeUndefined()
  })

  // ─── AtIndex ───

  it('atIndex returns entry at sorted position', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.atIndex(0)).toEqual({ key: 1, value: 'a' })
    expect(m.atIndex(1)).toEqual({ key: 2, value: 'b' })
    expect(m.atIndex(2)).toEqual({ key: 3, value: 'c' })
  })

  it('atIndex out of bounds returns undefined', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    expect(m.atIndex(-1)).toBeUndefined()
    expect(m.atIndex(1)).toBeUndefined()
  })

  // ─── IndexOf ───

  it('indexOf returns sorted position', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.indexOf(1)).toBe(0)
    expect(m.indexOf(2)).toBe(1)
    expect(m.indexOf(3)).toBe(2)
  })

  it('indexOf returns -1 for missing', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    expect(m.indexOf(99)).toBe(-1)
  })

  // ─── RangeQuery ───

  it('rangeQuery returns entries in range', () => {
    const m = new CountedBTreeMap<number, string>()
    for (let i = 1; i <= 10; i++) m.set(i, `v${i}`)
    const result = m.rangeQuery(3, 7)
    expect(result.map(e => e.key)).toEqual([3, 4, 5, 6, 7])
  })

  it('rangeQuery with start > end returns empty', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    expect(m.rangeQuery(5, 3)).toEqual([])
  })

  it('rangeQuery on empty', () => {
    const m = new CountedBTreeMap<number, string>()
    expect(m.rangeQuery(0, 10)).toEqual([])
  })

  // ─── ToArray ───

  it('toArray returns sorted entries', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    expect(m.toArray()).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
      { key: 3, value: 'c' },
    ])
  })

  it('toArray on empty', () => {
    const m = new CountedBTreeMap<number, string>()
    expect(m.toArray()).toEqual([])
  })

  // ─── ForEach ───

  it('forEach iterates in order', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(3, 'c')
    m.set(1, 'a')
    m.set(2, 'b')
    const keys: number[] = []
    m.forEach((v, k) => keys.push(k))
    expect(keys).toEqual([1, 2, 3])
  })

  it('forEach on empty', () => {
    const m = new CountedBTreeMap<number, string>()
    let count = 0
    m.forEach(() => count++)
    expect(count).toBe(0)
  })

  // ─── Iterator ───

  it('Symbol.iterator works', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    const entries = [...m]
    expect(entries).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
    ])
  })

  // ─── Clear ───

  it('clear empties map', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    m.clear()
    expect(m.size).toBe(0)
    expect(m.isEmpty()).toBe(true)
    expect(m.get(1)).toBeUndefined()
  })

  // ─── Clone ───

  it('clone preserves entries', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    m.set(2, 'b')
    const cl = m.clone()
    expect(cl.size).toBe(2)
    expect(cl.get(1)).toBe('a')
    expect(cl.get(2)).toBe('b')
  })

  it('clone is independent', () => {
    const m = new CountedBTreeMap<number, string>()
    m.set(1, 'a')
    const cl = m.clone()
    cl.set(2, 'b')
    expect(m.size).toBe(1)
    expect(cl.size).toBe(2)
  })

  // ─── Static from ───

  it('static from creates map', () => {
    const m = CountedBTreeMap.from<number, string>([[1, 'a'], [2, 'b'], [3, 'c']])
    expect(m.size).toBe(3)
    expect(m.get(2)).toBe('b')
  })

  it('static from with empty', () => {
    const m = CountedBTreeMap.from<number, string>([])
    expect(m.isEmpty()).toBe(true)
  })

  // ─── Stats ───

  it('stats returns metadata', () => {
    const m = new CountedBTreeMap<number, string>()
    for (let i = 0; i < 20; i++) m.set(i, `v${i}`)
    const s = m.stats()
    expect(s.size).toBe(20)
    expect(s.height).toBeGreaterThan(0)
    expect(s.order).toBeGreaterThan(1)
    expect(s.nodeCount).toBeGreaterThan(0)
  })

  it('stats on empty', () => {
    const m = new CountedBTreeMap<number, string>()
    const s = m.stats()
    expect(s.size).toBe(0)
    expect(s.height).toBe(0)
    expect(s.nodeCount).toBe(0)
  })

  // ─── Larger tree ───

  it('handles 50 sequential inserts', () => {
    const m = new CountedBTreeMap<number, number>({ order: 4 } as never)
    for (let i = 0; i < 50; i++) m.set(i, i * 10)
    expect(m.size).toBe(50)
    expect(m.first!.key).toBe(0)
    expect(m.last!.key).toBe(49)
    expect(m.atIndex(0)!.value).toBe(0)
    expect(m.atIndex(49)!.value).toBe(490)
  })

  it('handles reverse inserts', () => {
    const m = new CountedBTreeMap<number, number>(3)
    for (let i = 49; i >= 0; i--) m.set(i, i * 10)
    expect(m.size).toBe(50)
    expect(m.indexOf(25)).toBe(25)
  })

  it('handles delete many keys', () => {
    const m = new CountedBTreeMap<number, string>(3)
    for (let i = 0; i < 20; i++) m.set(i, `v${i}`)
    for (let i = 0; i < 10; i++) m.delete(i)
    expect(m.size).toBe(10)
    expect(m.first!.key).toBe(10)
    expect(m.last!.key).toBe(19)
  })

  // ─── String keys ───

  it('works with string keys', () => {
    const m = new CountedBTreeMap<string, number>()
    m.set('banana', 2)
    m.set('apple', 1)
    m.set('cherry', 3)
    expect(m.first!.key).toBe('apple')
    expect(m.last!.key).toBe('cherry')
  })

  // ─── Range query partial ───

  it('rangeQuery partial overlap', () => {
    const m = new CountedBTreeMap<number, string>()
    for (let i = 0; i < 20; i++) m.set(i, `v${i}`)
    const result = m.rangeQuery(15, 25)
    expect(result.map(e => e.key)).toEqual([15, 16, 17, 18, 19])
  })
})
