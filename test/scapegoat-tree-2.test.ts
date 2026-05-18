import { describe, it, expect } from 'vitest'
import { ScapegoatTree } from '../src/core/scapegoat-tree-2/index.js'

// ─── Basic Operations ───
describe('ScapegoatTree basic operations', () => {
  it('creates empty tree', () => {
    const t = new ScapegoatTree<number>()
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
  })

  it('inserts and finds keys', () => {
    const t = new ScapegoatTree<number>()
    t.insert(5)
    t.insert(3)
    t.insert(7)
    expect(t.has(5)).toBe(true)
    expect(t.has(3)).toBe(true)
    expect(t.has(10)).toBe(false)
  })

  it('insert with value', () => {
    const t = new ScapegoatTree<string, number>()
    t.insert('a', 1)
    t.insert('b', 2)
    expect(t.find('a')).toBe(1)
    expect(t.get('b')).toBe(2)
  })

  it('find returns undefined for missing', () => {
    const t = new ScapegoatTree<number>()
    expect(t.find(1)).toBeUndefined()
  })
})

// ─── Delete ───
describe('ScapegoatTree delete', () => {
  it('deletes existing key', () => {
    const t = new ScapegoatTree<number>()
    t.insert(1)
    t.insert(2)
    expect(t.delete(1)).toBe(true)
    expect(t.has(1)).toBe(false)
    expect(t.size).toBe(1)
  })

  it('returns false for missing key', () => {
    const t = new ScapegoatTree<number>()
    expect(t.delete(1)).toBe(false)
  })
})

// ─── Min / Max ───
describe('ScapegoatTree min and max', () => {
  it('returns undefined for empty tree', () => {
    const t = new ScapegoatTree<number>()
    expect(t.min()).toBeUndefined()
    expect(t.max()).toBeUndefined()
  })

  it('returns min and max', () => {
    const t = new ScapegoatTree<number>()
    t.insert(5)
    t.insert(2)
    t.insert(8)
    t.insert(1)
    expect(t.min()).toBe(1)
    expect(t.max()).toBe(8)
  })
})

// ─── Floor / Ceiling / Lower / Higher ───
describe('ScapegoatTree floor, ceiling, lower, higher', () => {
  const t = new ScapegoatTree<number>()
  t.insert(10)
  t.insert(20)
  t.insert(30)

  it('floor returns largest key <= given', () => {
    expect(t.floor(15)).toBe(10)
    expect(t.floor(20)).toBe(20)
  })

  it('ceiling returns smallest key >= given', () => {
    expect(t.ceiling(15)).toBe(20)
    expect(t.ceiling(20)).toBe(20)
  })

  it('lower returns largest key < given', () => {
    expect(t.lower(20)).toBe(10)
  })

  it('higher returns smallest key > given', () => {
    expect(t.higher(20)).toBe(30)
  })
})

// ─── Range / Rank / Select ───
describe('ScapegoatTree range, rank, select', () => {
  it('range returns keys in [lo, hi]', () => {
    const t = new ScapegoatTree<number>()
    t.insert(1)
    t.insert(5)
    t.insert(10)
    t.insert(15)
    expect(t.range(5, 10)).toEqual([5, 10])
  })

  it('rank returns position', () => {
    const t = new ScapegoatTree<number>()
    t.insert(10)
    t.insert(20)
    t.insert(30)
    expect(t.rank(10)).toBe(0)
    expect(t.rank(20)).toBe(1)
    expect(t.rank(30)).toBe(2)
    expect(t.rank(99)).toBe(-1)
  })

  it('select returns key at rank', () => {
    const t = new ScapegoatTree<number>()
    t.insert(10)
    t.insert(20)
    t.insert(30)
    expect(t.select(0)).toBe(10)
    expect(t.select(2)).toBe(30)
    expect(t.select(5)).toBeUndefined()
  })
})

// ─── Iteration ───
describe('ScapegoatTree iteration', () => {
  it('toArray returns sorted keys', () => {
    const t = new ScapegoatTree<number>()
    t.insert(3)
    t.insert(1)
    t.insert(2)
    expect(t.toArray()).toEqual([1, 2, 3])
  })

  it('forEach iterates in order', () => {
    const t = new ScapegoatTree<number>()
    t.insert(2)
    t.insert(1)
    const keys: number[] = []
    t.forEach((k) => keys.push(k))
    expect(keys).toEqual([1, 2])
  })

  it('Symbol.iterator works', () => {
    const t = new ScapegoatTree<number>()
    t.insert(1)
    t.insert(2)
    expect([...t]).toEqual([1, 2])
  })

  it('entries returns [key, value] pairs', () => {
    const t = new ScapegoatTree<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    expect(t.entries()).toEqual([[1, 'a'], [2, 'b']])
  })
})

// ─── Clear / Static from ───
describe('ScapegoatTree clear and static from', () => {
  it('clear empties tree', () => {
    const t = new ScapegoatTree<number>()
    t.insert(1)
    t.clear()
    expect(t.isEmpty()).toBe(true)
  })

  it('static from creates tree from array', () => {
    const t = ScapegoatTree.from([3, 1, 2])
    expect(t.toArray()).toEqual([1, 2, 3])
  })
})
