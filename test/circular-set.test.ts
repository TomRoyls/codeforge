import { describe, it, expect } from 'vitest'
import { CircularSet } from '../src/core/circular-set/circular-set.js'

// ─── Constructor ───

describe('CircularSet', () => {
  it('creates with required capacity', () => {
    const set = new CircularSet<number>({ capacity: 5 })
    expect(set.capacity).toBe(5)
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
  })

  it('clamps capacity to minimum 1', () => {
    const set = new CircularSet<number>({ capacity: 0 })
    expect(set.capacity).toBe(1)
  })

  it('clamps negative capacity to 1', () => {
    const set = new CircularSet<number>({ capacity: -5 })
    expect(set.capacity).toBe(1)
  })

  // ─── Add / Has ───

  it('add returns true for new items', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    expect(set.add('a')).toBe(true)
    expect(set.add('b')).toBe(true)
    expect(set.size).toBe(2)
  })

  it('add returns false for duplicates', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    set.add('a')
    expect(set.add('a')).toBe(false)
    expect(set.size).toBe(1)
  })

  it('has checks membership', () => {
    const set = new CircularSet<number>({ capacity: 10 })
    set.add(42)
    expect(set.has(42)).toBe(true)
    expect(set.has(99)).toBe(false)
  })

  // ─── Eviction ───

  it('evicts oldest when full', () => {
    const set = new CircularSet<number>({ capacity: 3 })
    set.add(1)
    set.add(2)
    set.add(3)
    expect(set.isFull).toBe(true)
    set.add(4)
    expect(set.has(1)).toBe(false)
    expect(set.has(4)).toBe(true)
    expect(set.size).toBe(3)
  })

  it('evicts in FIFO order', () => {
    const set = new CircularSet<string>({ capacity: 2 })
    set.add('a')
    set.add('b')
    set.add('c')
    expect(set.toArray()).toEqual(['b', 'c'])
    set.add('d')
    expect(set.toArray()).toEqual(['c', 'd'])
  })

  it('tracks eviction count in stats', () => {
    const set = new CircularSet<number>({ capacity: 2 })
    set.add(1)
    set.add(2)
    set.add(3)
    set.add(4)
    expect(set.stats().totalEvicted).toBe(2)
  })

  // ─── Delete ───

  it('delete removes item', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    set.add('x')
    expect(set.delete('x')).toBe(true)
    expect(set.has('x')).toBe(false)
  })

  it('delete returns false for missing', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    expect(set.delete('nope')).toBe(false)
  })

  it('delete tracks count in stats', () => {
    const set = new CircularSet<number>({ capacity: 10 })
    set.add(1)
    set.add(2)
    set.delete(1)
    expect(set.stats().totalDeleted).toBe(1)
  })

  // ─── First / Last ───

  it('first returns oldest item', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    set.add('a')
    set.add('b')
    set.add('c')
    expect(set.first).toBe('a')
  })

  it('last returns newest item', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    set.add('a')
    set.add('b')
    set.add('c')
    expect(set.last).toBe('c')
  })

  it('first/last undefined on empty', () => {
    const set = new CircularSet<number>({ capacity: 5 })
    expect(set.first).toBeUndefined()
    expect(set.last).toBeUndefined()
  })

  // ─── IndexOf / AtIndex ───

  it('indexOf returns insertion order index', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    set.add('a')
    set.add('b')
    set.add('c')
    expect(set.indexOf('a')).toBe(0)
    expect(set.indexOf('b')).toBe(1)
    expect(set.indexOf('c')).toBe(2)
    expect(set.indexOf('z')).toBe(-1)
  })

  it('atIndex returns item at position', () => {
    const set = new CircularSet<number>({ capacity: 10 })
    set.add(10)
    set.add(20)
    set.add(30)
    expect(set.atIndex(0)).toBe(10)
    expect(set.atIndex(1)).toBe(20)
    expect(set.atIndex(2)).toBe(30)
    expect(set.atIndex(-1)).toBeUndefined()
    expect(set.atIndex(99)).toBeUndefined()
  })

  // ─── ToArray / ForEach / Iterator ───

  it('toArray returns items in insertion order', () => {
    const set = new CircularSet<number>({ capacity: 10 })
    set.add(3)
    set.add(1)
    set.add(2)
    expect(set.toArray()).toEqual([3, 1, 2])
  })

  it('forEach iterates with indices', () => {
    const set = new CircularSet<string>({ capacity: 10 })
    set.add('x')
    set.add('y')
    const result: [string, number][] = []
    set.forEach((item, idx) => result.push([item, idx]))
    expect(result).toEqual([['x', 0], ['y', 1]])
  })

  it('Symbol.iterator works', () => {
    const set = new CircularSet<number>({ capacity: 10 })
    set.add(1)
    set.add(2)
    const items: number[] = []
    for (const item of set) items.push(item)
    expect(items).toEqual([1, 2])
  })

  // ─── Clone ───

  it('clone produces independent copy', () => {
    const set = new CircularSet<number>({ capacity: 5 })
    set.add(1)
    set.add(2)
    const copy = set.clone()
    expect(copy.toArray()).toEqual([1, 2])
    copy.add(3)
    expect(set.has(3)).toBe(false)
  })

  // ─── Static from ───

  it('static from creates set from iterable', () => {
    const set = CircularSet.from([1, 2, 3], 5)
    expect(set.size).toBe(3)
    expect(set.has(1)).toBe(true)
    expect(set.has(2)).toBe(true)
    expect(set.has(3)).toBe(true)
  })

  it('static from evicts when exceeding capacity', () => {
    const set = CircularSet.from([1, 2, 3, 4, 5], 3)
    expect(set.size).toBe(3)
    expect(set.has(1)).toBe(false)
    expect(set.has(2)).toBe(false)
    expect(set.toArray()).toEqual([3, 4, 5])
  })

  // ─── Clear ───

  it('clear empties the set', () => {
    const set = new CircularSet<number>({ capacity: 5 })
    set.add(1)
    set.add(2)
    set.clear()
    expect(set.size).toBe(0)
    expect(set.isEmpty).toBe(true)
  })

  // ─── Stats ───

  it('stats returns comprehensive info', () => {
    const set = new CircularSet<number>({ capacity: 3 })
    set.add(1)
    set.add(2)
    const stats = set.stats()
    expect(stats.capacity).toBe(3)
    expect(stats.size).toBe(2)
    expect(stats.isEmpty).toBe(false)
    expect(stats.isFull).toBe(false)
    expect(stats.utilization).toBeCloseTo(2 / 3)
    expect(stats.totalAdded).toBe(2)
    expect(stats.totalEvicted).toBe(0)
    expect(stats.totalDeleted).toBe(0)
  })

  // ─── Edge cases ───

  it('capacity 1 set', () => {
    const set = new CircularSet<number>({ capacity: 1 })
    set.add(1)
    expect(set.isFull).toBe(true)
    set.add(2)
    expect(set.has(1)).toBe(false)
    expect(set.has(2)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('add-delete-add reuses slot', () => {
    const set = new CircularSet<string>({ capacity: 2 })
    set.add('a')
    set.add('b')
    set.delete('a')
    set.add('c')
    expect(set.toArray()).toEqual(['b', 'c'])
    expect(set.size).toBe(2)
  })

  it('works with object values', () => {
    const set = new CircularSet<{ id: number }>({ capacity: 5 })
    const obj = { id: 1 }
    set.add(obj)
    expect(set.has(obj)).toBe(true)
    expect(set.has({ id: 1 })).toBe(false)
  })

  it('empty set operations', () => {
    const set = new CircularSet<number>({ capacity: 5 })
    expect(set.toArray()).toEqual([])
    expect(set.indexOf(1)).toBe(-1)
    expect(set.atIndex(0)).toBeUndefined()
  })
})
