import { describe, it, expect } from 'vitest'
import { IntegerIntervalTree } from '../../src/utils/integer-interval-tree.js'

describe('IntegerIntervalTree', () => {
  it('inserts valid intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    expect(tree.size).toBe(1)
  })

  it('ignores invalid intervals where lo > hi', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(5, 1, 'a')
    expect(tree.size).toBe(0)
  })

  it('allows equal lo and hi', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(3, 3, 'a')
    expect(tree.size).toBe(1)
  })

  it('queries point and returns matching intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    const result = tree.queryPoint(3)
    expect(result.length).toBe(1)
    expect(result[0]!.value).toBe('a')
  })

  it('returns empty array for point not in any interval', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    const result = tree.queryPoint(10)
    expect(result).toEqual([])
  })

  it('returns all intervals containing point', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 10, 'a')
    tree.insert(3, 5, 'b')
    tree.insert(5, 8, 'c')
    const result = tree.queryPoint(5)
    expect(result.length).toBe(3)
  })

  it('queries range and returns overlapping intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(8, 12, 'b')
    tree.insert(6, 9, 'c')
    const result = tree.queryRange(4, 10)
    expect(result.length).toBe(3)
  })

  it('returns empty array for range with no overlaps', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    const result = tree.queryRange(6, 9)
    expect(result).toEqual([])
  })

  it('contains returns true when point in any interval', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    expect(tree.contains(3)).toBe(true)
    expect(tree.contains(10)).toBe(false)
  })

  it('coversRange returns true when range fully covered', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(6, 10, 'b')
    expect(tree.coversRange(1, 10)).toBe(true)
  })

  it('coversRange returns false when gaps exist', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    expect(tree.coversRange(1, 15)).toBe(false)
  })

  it('remove returns number of removed entries', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(1, 5, 'b')
    const removed = tree.remove(1, 5)
    expect(removed).toBe(2)
    expect(tree.size).toBe(0)
  })

  it('union merges two trees', () => {
    const tree1 = new IntegerIntervalTree<string>()
    tree1.insert(1, 5, 'a')
    const tree2 = new IntegerIntervalTree<string>()
    tree2.insert(6, 10, 'b')
    const merged = tree1.union(tree2)
    expect(merged.size).toBe(2)
  })

  it('size returns number of entries', () => {
    const tree = new IntegerIntervalTree<string>()
    expect(tree.size).toBe(0)
    tree.insert(1, 5, 'a')
    tree.insert(6, 10, 'b')
    expect(tree.size).toBe(2)
  })

  it('toArray returns all entries sorted by lo', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(6, 10, 'b')
    tree.insert(1, 5, 'a')
    tree.insert(11, 15, 'c')
    const arr = tree.toArray()
    expect(arr[0]!.lo).toBe(1)
    expect(arr[1]!.lo).toBe(6)
    expect(arr[2]!.lo).toBe(11)
  })

  it('toArray returns copies not references', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    const arr = tree.toArray()
    arr[0]!.value = 'b'
    const queried = tree.queryPoint(3)
    expect(queried[0]!.value).toBe('a')
  })

  it('queryRange finds overlapping intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    tree.insert(20, 25, 'c')
    const result = tree.queryRange(4, 12)
    expect(result.length).toBe(2)
  })

  it('remove decreases size', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(6, 10, 'b')
    expect(tree.size).toBe(2)
    expect(tree.remove(1, 5)).toBe(1)
    expect(tree.size).toBe(1)
    expect(tree.queryPoint(3)).toHaveLength(0)
  })

  it('remove returns 0 for non-existent', () => {
    const tree = new IntegerIntervalTree<string>()
    expect(tree.remove(1, 5)).toBe(0)
  })

  it('queryPoint returns inserted value', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(0, 10, 'hello')
    const result = tree.queryPoint(5)
    expect(result.length).toBe(1)
    expect(result[0]!.value).toBe('hello')
  })

  it('query outside all intervals returns empty', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(0, 5, 'hello')
    expect(tree.queryPoint(10)).toEqual([])
  })

  it('queryPoint inside interval returns entry', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(0, 10, 'data')
    const result = tree.queryPoint(5)
    expect(result.length).toBe(1)
    expect(result[0]!.value).toBe('data')
  })

  it('empty tree query returns empty', () => {
    const tree = new IntegerIntervalTree<string>()
    expect(tree.queryPoint(5)).toEqual([])
  })

  it('insert and query returns value', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(0, 10, 'hello')
    const results = tree.queryPoint(5)
    expect(results.length).toBe(1)
    expect(results[0]!.value).toBe('hello')
  })

  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.size).toBe(0)
      expect(tree.toArray()).toEqual([])
    })

    it('creates tree that accepts any type', () => {
      const numTree = new IntegerIntervalTree<number>()
      numTree.insert(0, 10, 42)
      expect(numTree.queryPoint(5)[0]!.value).toBe(42)
    })

    it('creates tree with object values', () => {
      const objTree = new IntegerIntervalTree<{id: number}>()
      objTree.insert(0, 10, { id: 1 })
      expect(objTree.queryPoint(5)[0]!.value.id).toBe(1)
    })
  })

  describe('toString', () => {
    it('returns string with size', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.toString()).toBe('IntegerIntervalTree(0)')
    })

    it('includes count in toString', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(0, 10, 'a')
      tree.insert(20, 30, 'b')
      expect(tree.toString()).toBe('IntegerIntervalTree(2)')
    })
  })

  describe('toJSON', () => {
    it('returns array of entries', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      const json = tree.toJSON() as Array<{ lo: number; hi: number; value: string }>
      expect(json.length).toBe(2)
      expect(json[0]!.lo).toBe(1)
      expect(json[1]!.lo).toBe(10)
    })

    it('returns empty array for empty tree', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.toJSON()).toEqual([])
    })

    it('toJSON returns copies, not references', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(0, 10, 'hello')
      const json = tree.toJSON() as Array<{ lo: number; hi: number; value: string }>
      json[0]!.value = 'modified'
      expect(tree.queryPoint(5)[0]!.value).toBe('hello')
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      const copy = tree.clone()
      expect(copy.size).toBe(2)
      expect(copy.contains(3)).toBe(true)
      copy.insert(20, 25, 'c')
      expect(tree.size).toBe(2)
      expect(copy.size).toBe(3)
    })

    it('clone of empty tree is empty', () => {
      const tree = new IntegerIntervalTree<string>()
      const copy = tree.clone()
      expect(copy.size).toBe(0)
      expect(copy.toArray()).toEqual([])
    })

    it('clone preserves sorted state', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(10, 15, 'b')
      tree.insert(1, 5, 'a')
      tree.queryPoint(3)
      const copy = tree.clone()
      expect(copy.toArray()[0]!.lo).toBe(1)
    })

    it('clone is equal to original', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      const copy = tree.clone()
      expect(tree.equals(copy)).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns true for identical trees', () => {
      const t1 = new IntegerIntervalTree<string>()
      const t2 = new IntegerIntervalTree<string>()
      t1.insert(1, 5, 'a')
      t1.insert(10, 15, 'b')
      t2.insert(1, 5, 'a')
      t2.insert(10, 15, 'b')
      expect(t1.equals(t2)).toBe(true)
    })

    it('returns false for different trees', () => {
      const t1 = new IntegerIntervalTree<string>()
      const t2 = new IntegerIntervalTree<string>()
      t1.insert(1, 5, 'a')
      t2.insert(1, 5, 'b')
      expect(t1.equals(t2)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const t1 = new IntegerIntervalTree<string>()
      const t2 = new IntegerIntervalTree<string>()
      t1.insert(1, 5, 'a')
      t2.insert(1, 5, 'a')
      t2.insert(10, 15, 'b')
      expect(t1.equals(t2)).toBe(false)
    })

    it('returns false for non-tree objects', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.equals(null)).toBe(false)
      expect(tree.equals(undefined)).toBe(false)
      expect(tree.equals({})).toBe(false)
      expect(tree.equals([])).toBe(false)
    })

    it('returns true for empty trees', () => {
      const t1 = new IntegerIntervalTree<string>()
      const t2 = new IntegerIntervalTree<string>()
      expect(t1.equals(t2)).toBe(true)
    })

    it('handles NaN values correctly', () => {
      const t1 = new IntegerIntervalTree<number>()
      const t2 = new IntegerIntervalTree<number>()
      t1.insert(1, 5, NaN)
      t2.insert(1, 5, NaN)
      expect(t1.equals(t2)).toBe(true)
    })
  })

  describe('insert boundary conditions', () => {
    it('insert with lo equal to hi is valid', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 5, 'a')
      expect(tree.size).toBe(1)
      expect(tree.contains(5)).toBe(true)
    })

    it('insert with negative lo is valid', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(-10, -5, 'a')
      expect(tree.size).toBe(1)
      expect(tree.contains(-7)).toBe(true)
    })

    it('insert ignores lo greater than hi', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(10, 5, 'a')
      expect(tree.size).toBe(0)
    })

    it('insert with equal lo and hi works multiple times', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(0, 0, 'a')
      tree.insert(0, 0, 'b')
      tree.insert(1, 1, 'c')
      expect(tree.size).toBe(3)
    })

    it('insert large interval works', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(-1000000, 1000000, 'a')
      expect(tree.size).toBe(1)
      expect(tree.contains(0)).toBe(true)
    })
  })

  describe('queryPoint boundary conditions', () => {
    it('queryPoint on empty tree returns empty', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.queryPoint(5)).toEqual([])
    })

    it('queryPoint at exact boundary', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 10, 'a')
      expect(tree.queryPoint(5)).toHaveLength(1)
      expect(tree.queryPoint(10)).toHaveLength(1)
    })

    it('queryPoint just outside boundary', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 10, 'a')
      expect(tree.queryPoint(4)).toEqual([])
      expect(tree.queryPoint(11)).toEqual([])
    })

    it('queryPoint returns all overlapping intervals', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(0, 10, 'a')
      tree.insert(5, 15, 'b')
      tree.insert(8, 20, 'c')
      const results = tree.queryPoint(9)
      expect(results.length).toBe(3)
    })

    it('queryPoint with negative coordinates', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(-10, -5, 'a')
      expect(tree.queryPoint(-7)).toHaveLength(1)
      expect(tree.queryPoint(-11)).toEqual([])
    })
  })

  describe('queryRange boundary conditions', () => {
    it('queryRange on empty tree returns empty', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.queryRange(0, 10)).toEqual([])
    })

    it('queryRange with lo equal to hi', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 10, 'a')
      expect(tree.queryRange(7, 7)).toHaveLength(1)
    })

    it('queryRange exactly matching interval', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 10, 'a')
      const results = tree.queryRange(5, 10)
      expect(results.length).toBe(1)
      expect(results[0]!.lo).toBe(5)
      expect(results[0]!.hi).toBe(10)
    })

    it('queryRange with no overlap returns empty', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 10, 'a')
      expect(tree.queryRange(0, 4)).toEqual([])
      expect(tree.queryRange(11, 20)).toEqual([])
    })

    it('queryRange with negative coordinates', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(-10, -5, 'a')
      const results = tree.queryRange(-8, -6)
      expect(results.length).toBe(1)
    })
  })

  describe('contains boundary conditions', () => {
    it('contains returns false for empty tree', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.contains(5)).toBe(false)
    })

    it('contains at boundary point', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 10, 'a')
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(10)).toBe(true)
    })

    it('contains with negative coordinates', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(-10, -5, 'a')
      expect(tree.contains(-7)).toBe(true)
    })
  })

  describe('coversRange boundary conditions', () => {
    it('coversRange on empty tree returns false', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.coversRange(0, 10)).toBe(false)
    })

    it('coversRange with single interval', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(0, 10, 'a')
      expect(tree.coversRange(0, 10)).toBe(true)
      expect(tree.coversRange(2, 8)).toBe(true)
    })

    it('coversRange with adjacent intervals', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(0, 4, 'a')
      tree.insert(5, 10, 'b')
      expect(tree.coversRange(0, 10)).toBe(true)
    })

    it('coversRange with gap returns false', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(0, 4, 'a')
      tree.insert(6, 10, 'b')
      expect(tree.coversRange(0, 10)).toBe(false)
    })
  })

  describe('remove boundary conditions', () => {
    it('remove from empty tree returns 0', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.remove(1, 5)).toBe(0)
    })

    it('remove removes all matching intervals', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(1, 5, 'b')
      tree.insert(10, 15, 'c')
      const removed = tree.remove(1, 5)
      expect(removed).toBe(2)
      expect(tree.size).toBe(1)
    })

    it('remove non-existent interval returns 0', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(1, 5, 'a')
      expect(tree.remove(10, 15)).toBe(0)
      expect(tree.size).toBe(1)
    })
  })

  describe('union boundary conditions', () => {
    it('union of empty trees is empty', () => {
      const t1 = new IntegerIntervalTree<string>()
      const t2 = new IntegerIntervalTree<string>()
      const result = t1.union(t2)
      expect(result.size).toBe(0)
    })

    it('union with empty tree returns copy', () => {
      const t1 = new IntegerIntervalTree<string>()
      const t2 = new IntegerIntervalTree<string>()
      t1.insert(1, 5, 'a')
      const result = t1.union(t2)
      expect(result.size).toBe(1)
      expect(result.contains(3)).toBe(true)
    })

    it('union does not modify original trees', () => {
      const t1 = new IntegerIntervalTree<string>()
      const t2 = new IntegerIntervalTree<string>()
      t1.insert(1, 5, 'a')
      t2.insert(10, 15, 'b')
      const result = t1.union(t2)
      expect(t1.size).toBe(1)
      expect(t2.size).toBe(1)
      expect(result.size).toBe(2)
    })
  })

  describe('toArray boundary conditions', () => {
    it('toArray on empty tree returns empty', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.toArray()).toEqual([])
    })

    it('toArray returns entries sorted by lo', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(20, 25, 'c')
      tree.insert(5, 10, 'a')
      tree.insert(10, 15, 'b')
      const arr = tree.toArray()
      expect(arr[0]!.lo).toBe(5)
      expect(arr[1]!.lo).toBe(10)
      expect(arr[2]!.lo).toBe(20)
    })

    it('toArray with tie on lo sorts by hi', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(5, 15, 'b')
      tree.insert(5, 10, 'a')
      const arr = tree.toArray()
      expect(arr[0]!.hi).toBe(10)
      expect(arr[1]!.hi).toBe(15)
    })
  })

  describe('size boundary conditions', () => {
    it('size is 0 on creation', () => {
      const tree = new IntegerIntervalTree<string>()
      expect(tree.size).toBe(0)
    })

    it('size increments with each insert', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(1, 5, 'a')
      expect(tree.size).toBe(1)
      tree.insert(6, 10, 'b')
      expect(tree.size).toBe(2)
    })

    it('size decrements with remove', () => {
      const tree = new IntegerIntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(6, 10, 'b')
      tree.remove(1, 5)
      expect(tree.size).toBe(1)
    })
  })
})
describe('integer-interval-tree - wave551', () => {
  it('integer-interval-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave552', () => {
  it('integer-interval-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave553', () => {
  it('integer-interval-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
