import { describe, expect, it } from 'vitest'

import { WeightBalancedTree } from '../src/core/weight-balanced-tree-2/index.js'

// ─── Construction ────────────────────────────────────────
describe('WeightBalancedTree construction', () => {
  it('creates empty tree', () => {
    const tree = new WeightBalancedTree<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('creates with custom comparator', () => {
    const tree = new WeightBalancedTree<string>({
      compare: (a, b) => a.localeCompare(b),
    })
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Insert/Has/Get ──────────────────────────────────────
describe('WeightBalancedTree insert/has/get', () => {
  it('inserts and finds keys', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    expect(tree.has(5)).toBe(true)
    expect(tree.has(3)).toBe(true)
    expect(tree.has(7)).toBe(true)
    expect(tree.has(1)).toBe(false)
  })

  it('stores and retrieves values', () => {
    const tree = new WeightBalancedTree<string, number>()
    tree.insert('a', 1)
    tree.insert('b', 2)
    expect(tree.get('a')).toBe(1)
    expect(tree.get('b')).toBe(2)
    expect(tree.get('c')).toBeUndefined()
  })

  it('updates value on duplicate key', () => {
    const tree = new WeightBalancedTree<string, number>()
    tree.insert('x', 10)
    tree.insert('x', 20)
    expect(tree.get('x')).toBe(20)
    expect(tree.size).toBe(1)
  })

  it('tracks size correctly', () => {
    const tree = new WeightBalancedTree<number>()
    expect(tree.size).toBe(0)
    tree.insert(1)
    expect(tree.size).toBe(1)
    tree.insert(2)
    tree.insert(3)
    expect(tree.size).toBe(3)
  })
})

// ─── Delete ──────────────────────────────────────────────
describe('WeightBalancedTree delete', () => {
  it('deletes a key', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(5)
    expect(tree.delete(5)).toBe(true)
    expect(tree.has(5)).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('returns false for non-existent key', () => {
    const tree = new WeightBalancedTree<number>()
    expect(tree.delete(5)).toBe(false)
  })

  it('maintains balance after deletions', () => {
    const tree = new WeightBalancedTree<number>()
    for (let i = 0; i < 20; i++) {
      tree.insert(i)
    }
    for (let i = 0; i < 10; i++) {
      tree.delete(i)
    }
    expect(tree.size).toBe(10)
    expect(tree.has(15)).toBe(true)
    expect(tree.has(5)).toBe(false)
  })
})

// ─── Min/Max ─────────────────────────────────────────────
describe('WeightBalancedTree min/max', () => {
  it('returns undefined for empty tree', () => {
    const tree = new WeightBalancedTree<number>()
    expect(tree.min()).toBeUndefined()
    expect(tree.max()).toBeUndefined()
  })

  it('returns min and max keys', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(9)
  })
})

// ─── Floor/Ceiling/Lower/Higher ─────────────────────────
describe('WeightBalancedTree floor/ceiling/lower/higher', () => {
  it('floor returns largest key <= given key', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    expect(tree.floor(15)).toBe(10)
    expect(tree.floor(20)).toBe(20)
    expect(tree.floor(5)).toBeUndefined()
  })

  it('ceiling returns smallest key >= given key', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    expect(tree.ceiling(15)).toBe(20)
    expect(tree.ceiling(20)).toBe(20)
    expect(tree.ceiling(35)).toBeUndefined()
  })

  it('lower returns largest key strictly less than', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(10)
    tree.insert(20)
    expect(tree.lower(20)).toBe(10)
    expect(tree.lower(15)).toBe(10)
    expect(tree.lower(10)).toBeUndefined()
  })

  it('higher returns smallest key strictly greater than', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(10)
    tree.insert(20)
    expect(tree.higher(10)).toBe(20)
    expect(tree.higher(15)).toBe(20)
    expect(tree.higher(20)).toBeUndefined()
  })
})

// ─── Range ───────────────────────────────────────────────
describe('WeightBalancedTree range', () => {
  it('returns keys in range', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(1)
    tree.insert(5)
    tree.insert(10)
    tree.insert(15)
    tree.insert(20)
    expect(tree.range(5, 15).sort((a, b) => a - b)).toEqual([5, 10, 15])
  })

  it('returns empty for non-overlapping range', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(1)
    tree.insert(2)
    expect(tree.range(5, 10)).toEqual([])
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('WeightBalancedTree toArray', () => {
  it('returns keys in sorted order', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    tree.insert(1)
    tree.insert(9)
    expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
  })
})

// ─── forEach ─────────────────────────────────────────────
describe('WeightBalancedTree forEach', () => {
  it('iterates in order', () => {
    const tree = new WeightBalancedTree<string, number>()
    tree.insert('c', 3)
    tree.insert('a', 1)
    tree.insert('b', 2)
    const result: string[] = []
    tree.forEach((key) => result.push(key))
    expect(result).toEqual(['a', 'b', 'c'])
  })
})

// ─── Iterator ────────────────────────────────────────────
describe('WeightBalancedTree iterator', () => {
  it('iterates in sorted order', () => {
    const tree = new WeightBalancedTree<number, string>()
    tree.insert(3, 'c')
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    const result: Array<[number, string | undefined]> = [...tree]
    expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })
})

// ─── Rank/Select ─────────────────────────────────────────
describe('WeightBalancedTree rank/select', () => {
  it('rank returns 0-based position', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    expect(tree.rank(10)).toBe(0)
    expect(tree.rank(20)).toBe(1)
    expect(tree.rank(30)).toBe(2)
    expect(tree.rank(15)).toBe(-1)
  })

  it('select returns key at position', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    expect(tree.select(0)).toBe(10)
    expect(tree.select(1)).toBe(20)
    expect(tree.select(2)).toBe(30)
    expect(tree.select(3)).toBeUndefined()
    expect(tree.select(-1)).toBeUndefined()
  })
})

// ─── Count ───────────────────────────────────────────────
describe('WeightBalancedTree count', () => {
  it('counts keys in range', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(1)
    tree.insert(5)
    tree.insert(10)
    tree.insert(15)
    tree.insert(20)
    expect(tree.count(5, 15)).toBe(3)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('WeightBalancedTree clear', () => {
  it('clears the tree', () => {
    const tree = new WeightBalancedTree<number>()
    tree.insert(1)
    tree.insert(2)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Balance (stress test) ──────────────────────────────
describe('WeightBalancedTree balance', () => {
  it('handles sequential inserts', () => {
    const tree = new WeightBalancedTree<number>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i)
    }
    expect(tree.size).toBe(100)
    expect(tree.min()).toBe(0)
    expect(tree.max()).toBe(99)
    expect(tree.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
  })

  it('handles reverse sequential inserts', () => {
    const tree = new WeightBalancedTree<number>()
    for (let i = 99; i >= 0; i--) {
      tree.insert(i)
    }
    expect(tree.size).toBe(100)
    expect(tree.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
  })
})
