import { describe, it, expect } from 'vitest'
import { BloomFilterTree } from '../src/core/bloom-filter-tree/bloom-filter-tree.js'
import type { BloomFilterTreeOptions } from '../src/core/bloom-filter-tree/types.js'

// ─── Constructor ───

describe('BloomFilterTree', () => {
  it('creates with default options', () => {
    const tree = new BloomFilterTree<string>()
    expect(tree.size).toBe(0)
    expect(tree.leafCount).toBe(1)
    expect(tree.isEmpty).toBe(true)
  })

  it('creates with custom options', () => {
    const opts: BloomFilterTreeOptions = {
      branchingFactor: 2,
      expectedItemsPerLeaf: 5,
      falsePositiveRate: 0.1,
    }
    const tree = new BloomFilterTree<string>(opts)
    expect(tree.size).toBe(0)
  })

  // ─── Insert / Has ───

  it('insert and has work for single item', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('hello')
    expect(tree.has('hello')).toBe(true)
    expect(tree.has('world')).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('insert multiple items', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('a')
    tree.insert('b')
    tree.insert('c')
    expect(tree.size).toBe(3)
    expect(tree.has('a')).toBe(true)
    expect(tree.has('b')).toBe(true)
    expect(tree.has('c')).toBe(true)
  })

  it('has returns false on empty tree', () => {
    const tree = new BloomFilterTree<string>()
    expect(tree.has('anything')).toBe(false)
  })

  // ─── Remove ───

  it('remove existing item', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('x')
    expect(tree.remove('x')).toBe(true)
    expect(tree.size).toBe(0)
  })

  it('remove non-existing item returns false', () => {
    const tree = new BloomFilterTree<string>()
    expect(tree.remove('nope')).toBe(false)
  })

  // ─── ContainsAll / ContainsAny ───

  it('containsAll checks all items present', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('a')
    tree.insert('b')
    expect(tree.containsAll(['a', 'b'])).toBe(true)
    expect(tree.containsAll(['a', 'c'])).toBe(false)
  })

  it('containsAny checks if any item present', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('a')
    expect(tree.containsAny(['a', 'z'])).toBe(true)
    expect(tree.containsAny(['x', 'z'])).toBe(false)
  })

  it('containsAll with empty array returns true', () => {
    const tree = new BloomFilterTree<string>()
    expect(tree.containsAll([])).toBe(true)
  })

  it('containsAny with empty array returns false', () => {
    const tree = new BloomFilterTree<string>()
    expect(tree.containsAny([])).toBe(false)
  })

  // ─── Leaf splitting ───

  it('splits leaves when full', () => {
    const tree = new BloomFilterTree<number>({ expectedItemsPerLeaf: 3 })
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    expect(tree.leafCount).toBe(1)
    tree.insert(4)
    expect(tree.leafCount).toBe(2)
  })

  it('continues working after leaf splits', () => {
    const tree = new BloomFilterTree<number>({ expectedItemsPerLeaf: 3 })
    for (let i = 0; i < 20; i++) {
      tree.insert(i)
    }
    expect(tree.size).toBe(20)
    for (let i = 0; i < 20; i++) {
      expect(tree.has(i)).toBe(true)
    }
  })

  // ─── GetLeaf / ForEachLeaf ───

  it('getLeaf returns leaf interface', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('test')
    const leaf = tree.getLeaf(0)
    expect(leaf.has('test')).toBe(true)
    expect(leaf.size).toBe(1)
    expect(leaf.isEmpty).toBe(false)
  })

  it('getLeaf throws for out of range', () => {
    const tree = new BloomFilterTree<string>()
    expect(() => tree.getLeaf(-1)).toThrow(RangeError)
    expect(() => tree.getLeaf(99)).toThrow(RangeError)
  })

  it('forEachLeaf iterates all leaves', () => {
    const tree = new BloomFilterTree<number>({ expectedItemsPerLeaf: 3 })
    for (let i = 0; i < 10; i++) tree.insert(i)
    let count = 0
    tree.forEachLeaf((_leaf, idx) => {
      count++
      expect(idx).toBe(count - 1)
    })
    expect(count).toBe(tree.leafCount)
  })

  // ─── Statistics ───

  it('getStatistics returns stats', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('a')
    tree.insert('b')
    tree.has('a')
    const stats = tree.getStatistics()
    expect(stats.inserts).toBe(2)
    expect(stats.queries).toBe(1)
    expect(stats.leafCount).toBe(1)
    expect(stats.estimatedMemory).toBeGreaterThan(0)
  })

  // ─── Clear ───

  it('clear resets tree', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 5 })
    for (let i = 0; i < 10; i++) tree.insert(`item${i}`)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
    expect(tree.leafCount).toBe(1)
  })

  // ─── Serialization ───

  it('toJSON produces serializable object', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('a')
    tree.insert('b')
    const json = tree.toJSON()
    expect(json.size).toBe(2)
    expect(json.options).toBeDefined()
    expect(json.root).toBeDefined()
    expect(json.leaves).toBeDefined()
    expect(json.statistics).toBeDefined()
  })

  it('fromJSON reconstructs tree', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('x')
    tree.insert('y')
    const json = tree.toJSON()
    const restored = BloomFilterTree.fromJSON<string>(json)
    expect(restored.size).toBe(2)
    expect(restored.has('x')).toBe(true)
    expect(restored.has('y')).toBe(true)
  })

  it('roundtrip serialization preserves data', () => {
    const tree = new BloomFilterTree<number>({ expectedItemsPerLeaf: 5 })
    for (let i = 0; i < 10; i++) tree.insert(i)
    const json = tree.toJSON()
    const restored = BloomFilterTree.fromJSON<number>(json)
    expect(restored.size).toBe(tree.size)
    expect(restored.leafCount).toBe(tree.leafCount)
    for (let i = 0; i < 10; i++) {
      expect(restored.has(i)).toBe(true)
    }
  })

  // ─── Number items ───

  it('works with number items', () => {
    const tree = new BloomFilterTree<number>({ expectedItemsPerLeaf: 10 })
    tree.insert(42)
    tree.insert(100)
    expect(tree.has(42)).toBe(true)
    expect(tree.has(100)).toBe(true)
    expect(tree.has(99)).toBe(false)
  })

  // ─── Object items ───

  it('works with object items (JSON serialized)', () => {
    const tree = new BloomFilterTree<{ id: number }>({ expectedItemsPerLeaf: 10 })
    const obj = { id: 1 }
    tree.insert(obj)
    expect(tree.has({ id: 1 })).toBe(true)
    expect(tree.has({ id: 2 })).toBe(false)
  })

  // ─── Stress ───

  it('handles many inserts', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 50 })
    for (let i = 0; i < 200; i++) {
      tree.insert(`item-${i}`)
    }
    expect(tree.size).toBe(200)
    expect(tree.leafCount).toBeGreaterThan(1)
    for (let i = 0; i < 200; i++) {
      expect(tree.has(`item-${i}`)).toBe(true)
    }
  })

  it('insert and remove cycle', () => {
    const tree = new BloomFilterTree<string>({ expectedItemsPerLeaf: 10 })
    tree.insert('a')
    tree.insert('b')
    expect(tree.size).toBe(2)
    tree.remove('a')
    expect(tree.size).toBe(1)
    tree.insert('c')
    expect(tree.size).toBe(2)
    expect(tree.has('b')).toBe(true)
    expect(tree.has('c')).toBe(true)
  })
})
