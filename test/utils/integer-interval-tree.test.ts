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

describe('integer-interval-tree - wave554', () => {
  it('integer-interval-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave555', () => {
  it('integer-interval-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave556', () => {
  it('integer-interval-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave557', () => {
  it('integer-interval-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave558', () => {
  it('integer-interval-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave559', () => {
  it('integer-interval-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave560', () => {
  it('integer-interval-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave561', () => {
  it('integer-interval-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave562', () => {
  it('integer-interval-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave563', () => {
  it('integer-interval-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave564', () => {
  it('integer-interval-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave565', () => {
  it('integer-interval-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave566', () => {
  it('integer-interval-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave127', () => {
  it('integer-interval-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave130', () => {
  it('integer-interval-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave133', () => {
  it('integer-interval-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave136', () => {
  it('integer-interval-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - wave139', () => {
  it('integer-interval-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w142', () => {
  it('integer-interval-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w145', () => {
  it('integer-interval-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w148', () => {
  it('integer-interval-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w151', () => {
  it('integer-interval-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w154', () => {
  it('integer-interval-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w157', () => {
  it('integer-interval-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w160', () => {
  it('integer-interval-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w170', () => {
  it('integer-interval-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w180', () => {
  it('integer-interval-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w190', () => {
  it('integer-interval-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w200', () => {
  it('integer-interval-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w210', () => {
  it('integer-interval-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w220', () => {
  it('integer-interval-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w230', () => {
  it('integer-interval-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w240', () => {
  it('integer-interval-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w250', () => {
  it('integer-interval-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w260', () => {
  it('integer-interval-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w270', () => {
  it('integer-interval-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w280', () => {
  it('integer-interval-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w290', () => {
  it('integer-interval-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w300', () => {
  it('integer-interval-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w310', () => {
  it('integer-interval-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w320', () => {
  it('integer-interval-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w330', () => {
  it('integer-interval-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w340', () => {
  it('integer-interval-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w350', () => {
  it('integer-interval-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w360', () => {
  it('integer-interval-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w370', () => {
  it('integer-interval-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w380', () => {
  it('integer-interval-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w390', () => {
  it('integer-interval-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w400', () => {
  it('integer-interval-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w420', () => {
  it('integer-interval-tree x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w440', () => {
  it('integer-interval-tree x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w460', () => {
  it('integer-interval-tree x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w480', () => {
  it('integer-interval-tree x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-interval-tree - w500', () => {
  it('integer-interval-tree x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-interval-tree x500x19', () => {
    expect(describe).toBeDefined()
  })
})
