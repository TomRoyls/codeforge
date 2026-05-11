import { describe, it, expect, beforeEach } from 'vitest'
import { OrderedStatisticsTree } from '../../src/core/ordered-statistics-tree/index.js'
import type { CompareFunction } from '../../src/core/ordered-statistics-tree/types.js'

function createFilled(...values: number[]): OrderedStatisticsTree<number> {
  const tree = new OrderedStatisticsTree<number>()
  for (const v of values) {
    tree.insert(v)
  }
  return tree
}

describe('OrderedStatisticsTree', () => {
  let tree: OrderedStatisticsTree<number>

  beforeEach(() => {
    tree = new OrderedStatisticsTree<number>()
  })

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new OrderedStatisticsTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp: CompareFunction<number> = (a, b) => b - a
      const t = new OrderedStatisticsTree<number>(reverseCmp)
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.min()).toBe(3)
      expect(t.max()).toBe(1)
    })

    it('should use default comparator when none provided', () => {
      const t = new OrderedStatisticsTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should work with string keys', () => {
      const t = new OrderedStatisticsTree<string>()
      t.insert('banana')
      t.insert('apple')
      t.insert('cherry')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      tree.insert(10)
      expect(tree.size()).toBe(1)
      expect(tree.has(10)).toBe(true)
    })

    it('should insert multiple elements in order', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size()).toBe(3)
    })

    it('should insert multiple elements in reverse order', () => {
      tree.insert(3)
      tree.insert(2)
      tree.insert(1)
      expect(tree.size()).toBe(3)
    })

    it('should insert elements in random order', () => {
      tree.insert(5)
      tree.insert(2)
      tree.insert(8)
      tree.insert(1)
      tree.insert(3)
      expect(tree.size()).toBe(5)
      expect(tree.toArray()).toEqual([1, 2, 3, 5, 8])
    })

    it('should ignore duplicate insertions', () => {
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
    })

    it('should handle large sequential insertions', () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(1000)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(999)
    })

    it('should handle large reverse sequential insertions', () => {
      for (let i = 999; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(1000)
    })

    it('should maintain correct inorder after insertions', () => {
      const vals = [50, 25, 75, 10, 30, 60, 90]
      for (const v of vals) {
        tree.insert(v)
      }
      expect(tree.toArray()).toEqual([10, 25, 30, 50, 60, 75, 90])
    })
  })

  describe('delete', () => {
    it('should return false when deleting from empty tree', () => {
      expect(tree.delete(5)).toBe(false)
    })

    it('should return false when deleting non-existent key', () => {
      tree.insert(1)
      expect(tree.delete(5)).toBe(false)
    })

    it('should delete the only element', () => {
      tree.insert(10)
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should delete a leaf node', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should delete a node with one child', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(3)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.toArray()).toEqual([3, 10])
    })

    it('should delete a node with two children', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.delete(10)).toBe(true)
      expect(tree.has(10)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should delete the root', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(10)
      expect(tree.size()).toBe(2)
    })

    it('should handle deleting all elements one by one', () => {
      const vals = [5, 3, 7, 1, 4, 6, 8]
      for (const v of vals) tree.insert(v)
      for (const v of vals) {
        expect(tree.delete(v)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain correct order after deletions', () => {
      for (const v of [50, 25, 75, 10, 30, 60, 90]) tree.insert(v)
      tree.delete(25)
      tree.delete(75)
      expect(tree.toArray()).toEqual([10, 30, 50, 60, 90])
    })

    it('should handle repeated delete attempts', () => {
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.delete(5)).toBe(false)
      expect(tree.delete(5)).toBe(false)
    })
  })

  describe('has', () => {
    it('should return false for empty tree', () => {
      expect(tree.has(5)).toBe(false)
    })

    it('should return true for existing key', () => {
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('should return false for non-existing key', () => {
      tree.insert(5)
      expect(tree.has(3)).toBe(false)
    })

    it('should find keys after many insertions', () => {
      for (let i = 0; i < 100; i++) tree.insert(i)
      for (let i = 0; i < 100; i++) {
        expect(tree.has(i)).toBe(true)
      }
      expect(tree.has(100)).toBe(false)
      expect(tree.has(-1)).toBe(false)
    })

    it('should not find deleted keys', () => {
      tree.insert(5)
      tree.delete(5)
      expect(tree.has(5)).toBe(false)
    })
  })

  describe('rank', () => {
    it('should return -1 for non-existent key', () => {
      expect(tree.rank(5)).toBe(-1)
    })

    it('should return -1 for key not in non-empty tree', () => {
      tree.insert(1)
      tree.insert(3)
      expect(tree.rank(2)).toBe(-1)
    })

    it('should return 0 for the smallest element', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.rank(5)).toBe(0)
    })

    it('should return correct rank for middle element', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.rank(10)).toBe(1)
    })

    it('should return correct rank for largest element', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.rank(15)).toBe(2)
    })

    it('should return correct rank for single element', () => {
      tree.insert(42)
      expect(tree.rank(42)).toBe(0)
    })

    it('should return correct ranks for many elements', () => {
      const vals = [50, 25, 75, 10, 30, 60, 90]
      for (const v of vals) tree.insert(v)
      expect(tree.rank(10)).toBe(0)
      expect(tree.rank(25)).toBe(1)
      expect(tree.rank(30)).toBe(2)
      expect(tree.rank(50)).toBe(3)
      expect(tree.rank(60)).toBe(4)
      expect(tree.rank(75)).toBe(5)
      expect(tree.rank(90)).toBe(6)
    })

    it('should update rank after deletion', () => {
      for (const v of [10, 20, 30, 40, 50]) tree.insert(v)
      tree.delete(30)
      expect(tree.rank(10)).toBe(0)
      expect(tree.rank(20)).toBe(1)
      expect(tree.rank(40)).toBe(2)
      expect(tree.rank(50)).toBe(3)
    })

    it('should handle rank with custom comparator', () => {
      const t = new OrderedStatisticsTree<string>((a, b) => a.localeCompare(b))
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.rank('apple')).toBe(0)
      expect(t.rank('banana')).toBe(1)
      expect(t.rank('cherry')).toBe(2)
    })
  })

  describe('select', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.select(0)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      tree.insert(5)
      expect(tree.select(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      tree.insert(5)
      expect(tree.select(1)).toBeUndefined()
    })

    it('should return the only element for index 0', () => {
      tree.insert(42)
      expect(tree.select(0)).toBe(42)
    })

    it('should return i-th smallest element', () => {
      const vals = [50, 25, 75, 10, 30, 60, 90]
      for (const v of vals) tree.insert(v)
      expect(tree.select(0)).toBe(10)
      expect(tree.select(1)).toBe(25)
      expect(tree.select(2)).toBe(30)
      expect(tree.select(3)).toBe(50)
      expect(tree.select(4)).toBe(60)
      expect(tree.select(5)).toBe(75)
      expect(tree.select(6)).toBe(90)
    })

    it('should maintain select correctness after deletions', () => {
      for (const v of [10, 20, 30, 40, 50]) tree.insert(v)
      tree.delete(30)
      expect(tree.select(0)).toBe(10)
      expect(tree.select(1)).toBe(20)
      expect(tree.select(2)).toBe(40)
      expect(tree.select(3)).toBe(50)
    })

    it('should work for large trees', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i)
      for (let i = 0; i < 1000; i++) {
        expect(tree.select(i)).toBe(i)
      }
    })

    it('should return undefined for out of bounds in large tree', () => {
      for (let i = 0; i < 100; i++) tree.insert(i)
      expect(tree.select(100)).toBeUndefined()
      expect(tree.select(1000)).toBeUndefined()
    })
  })

  describe('rank and select inverse', () => {
    it('should be inverses of each other', () => {
      const vals = [50, 25, 75, 10, 30, 60, 90]
      for (const v of vals) tree.insert(v)
      for (let i = 0; i < vals.length; i++) {
        const key = tree.select(i)
        expect(key).not.toBeUndefined()
        expect(tree.rank(key!)).toBe(i)
      }
    })

    it('rank(select(i)) should equal i after deletions', () => {
      for (let i = 0; i < 20; i++) tree.insert(i)
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      for (let i = 0; i < tree.size(); i++) {
        const key = tree.select(i)!
        expect(tree.rank(key)).toBe(i)
      }
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should increase after insertions', () => {
      tree.insert(1)
      expect(tree.size()).toBe(1)
      tree.insert(2)
      expect(tree.size()).toBe(2)
    })

    it('should decrease after deletions', () => {
      tree.insert(1)
      tree.insert(2)
      tree.delete(1)
      expect(tree.size()).toBe(1)
    })

    it('should not change on duplicate insert', () => {
      tree.insert(1)
      tree.insert(1)
      expect(tree.size()).toBe(1)
    })

    it('should not change on failed delete', () => {
      tree.insert(1)
      tree.delete(2)
      expect(tree.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after deleting all elements', () => {
      tree.insert(1)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty tree without error', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should clear a tree with elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.has(1)).toBe(false)
      expect(tree.has(2)).toBe(false)
    })

    it('should allow insertions after clear', () => {
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size()).toBe(1)
      expect(tree.has(2)).toBe(true)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return the only element', () => {
      tree.insert(42)
      expect(tree.min()).toBe(42)
    })

    it('should return the smallest element', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.min()).toBe(5)
    })

    it('should update after deletion of min', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(5)
      expect(tree.min()).toBe(10)
    })

    it('should return min for large tree', () => {
      for (let i = 100; i >= 0; i--) tree.insert(i)
      expect(tree.min()).toBe(0)
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return the only element', () => {
      tree.insert(42)
      expect(tree.max()).toBe(42)
    })

    it('should return the largest element', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })

    it('should update after deletion of max', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(15)
      expect(tree.max()).toBe(10)
    })

    it('should return max for large tree', () => {
      for (let i = 0; i <= 100; i++) tree.insert(i)
      expect(tree.max()).toBe(100)
    })
  })

  describe('floor', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.floor(5)).toBeUndefined()
    })

    it('should return exact match', () => {
      tree.insert(5)
      expect(tree.floor(5)).toBe(5)
    })

    it('should return greatest element <= key', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.floor(25)).toBe(20)
    })

    it('should return undefined when all elements are greater', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.floor(5)).toBeUndefined()
    })

    it('should return max when key is greater than all', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.floor(100)).toBe(20)
    })

    it('should handle floor equal to max', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.floor(30)).toBe(30)
    })
  })

  describe('ceiling', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.ceiling(5)).toBeUndefined()
    })

    it('should return exact match', () => {
      tree.insert(5)
      expect(tree.ceiling(5)).toBe(5)
    })

    it('should return smallest element >= key', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.ceiling(15)).toBe(20)
    })

    it('should return undefined when all elements are less', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.ceiling(25)).toBeUndefined()
    })

    it('should return min when key is less than all', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.ceiling(5)).toBe(10)
    })

    it('should handle ceiling equal to min', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.ceiling(10)).toBe(10)
    })
  })

  describe('lower', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.lower(5)).toBeUndefined()
    })

    it('should return undefined when no element is strictly less', () => {
      tree.insert(5)
      expect(tree.lower(5)).toBeUndefined()
    })

    it('should return greatest element strictly less than key', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.lower(20)).toBe(10)
    })

    it('should return element less than key even if exact exists', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.lower(20)).toBe(10)
    })

    it('should return undefined when key <= min', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.lower(5)).toBeUndefined()
      expect(tree.lower(10)).toBeUndefined()
    })

    it('should return max when key is greater than max', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.lower(30)).toBe(20)
    })
  })

  describe('higher', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.higher(5)).toBeUndefined()
    })

    it('should return undefined when no element is strictly greater', () => {
      tree.insert(5)
      expect(tree.higher(5)).toBeUndefined()
    })

    it('should return smallest element strictly greater than key', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.higher(20)).toBe(30)
    })

    it('should return element greater than key even if exact exists', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.higher(10)).toBe(20)
    })

    it('should return undefined when key >= max', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.higher(20)).toBeUndefined()
      expect(tree.higher(30)).toBeUndefined()
    })

    it('should return min when key is less than min', () => {
      tree.insert(10)
      tree.insert(20)
      expect(tree.higher(5)).toBe(10)
    })
  })

  describe('range', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.range(1, 10)).toEqual([])
    })

    it('should return all elements in range inclusive', () => {
      const t = createFilled(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      expect(t.range(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element when lo equals hi', () => {
      const t = createFilled(1, 2, 3, 4, 5)
      expect(t.range(3, 3)).toEqual([3])
    })

    it('should return empty when range has no elements', () => {
      const t = createFilled(1, 2, 4, 5)
      expect(t.range(2.5, 3.5)).toEqual([])
    })

    it('should return all elements when range covers all', () => {
      const t = createFilled(1, 2, 3)
      expect(t.range(0, 100)).toEqual([1, 2, 3])
    })

    it('should handle range at the start', () => {
      const t = createFilled(1, 2, 3, 4, 5)
      expect(t.range(1, 3)).toEqual([1, 2, 3])
    })

    it('should handle range at the end', () => {
      const t = createFilled(1, 2, 3, 4, 5)
      expect(t.range(3, 5)).toEqual([3, 4, 5])
    })

    it('should return empty when lo > hi and no matches', () => {
      const t = createFilled(1, 2, 3)
      expect(t.range(5, 1)).toEqual([])
    })
  })

  describe('count', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.count(1, 10)).toBe(0)
    })

    it('should count elements in range inclusive', () => {
      const t = createFilled(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      expect(t.count(3, 7)).toBe(5)
    })

    it('should return 1 for single element range', () => {
      const t = createFilled(1, 2, 3)
      expect(t.count(2, 2)).toBe(1)
    })

    it('should return 0 for empty range', () => {
      const t = createFilled(1, 2, 4, 5)
      expect(t.count(2.5, 3.5)).toBe(0)
    })

    it('should count all elements', () => {
      const t = createFilled(1, 2, 3, 4, 5)
      expect(t.count(1, 5)).toBe(5)
    })

    it('should count partial range', () => {
      const t = createFilled(10, 20, 30, 40, 50)
      expect(t.count(15, 45)).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const t = createFilled(5, 3, 1, 4, 2)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should reflect insertions and deletions', () => {
      const t = createFilled(5, 3, 1)
      t.delete(3)
      expect(t.toArray()).toEqual([1, 5])
    })

    it('should return correct array after clear and reinsert', () => {
      tree.insert(5)
      tree.clear()
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      const items: number[] = []
      tree.forEach((k) => items.push(k))
      expect(items).toEqual([])
    })

    it('should iterate all elements in order', () => {
      const t = createFilled(3, 1, 2)
      const items: number[] = []
      t.forEach((k) => items.push(k))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      const t = createFilled(10, 20, 30)
      const indices: number[] = []
      t.forEach((_k, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle single element', () => {
      const items: number[] = []
      tree.insert(42)
      tree.forEach((k) => items.push(k))
      expect(items).toEqual([42])
    })
  })

  describe('iterator', () => {
    it('should iterate over empty tree', () => {
      const result: number[] = []
      for (const v of tree) {
        result.push(v)
      }
      expect(result).toEqual([])
    })

    it('should iterate all elements in sorted order', () => {
      const t = createFilled(5, 3, 1, 4, 2)
      const result: number[] = []
      for (const v of t) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should work with spread operator', () => {
      const t = createFilled(3, 1, 2)
      expect([...t]).toEqual([1, 2, 3])
    })

    it('should work with Array.from', () => {
      const t = createFilled(3, 1, 2)
      expect(Array.from(t)).toEqual([1, 2, 3])
    })
  })

  describe('iterator() method', () => {
    it('should return done immediately for empty tree', () => {
      const iter = tree.iterator()
      const result = iter.next()
      expect(result.done).toBe(true)
    })

    it('should iterate elements sequentially', () => {
      const t = createFilled(3, 1, 2)
      const iter = t.iterator()
      expect(iter.next()).toEqual({ value: 1, done: false })
      expect(iter.next()).toEqual({ value: 2, done: false })
      expect(iter.next()).toEqual({ value: 3, done: false })
      expect(iter.next().done).toBe(true)
    })
  })

  describe('balance and stress tests', () => {
    it('should maintain O(log n) behavior for sequential inserts', () => {
      for (let i = 0; i < 5000; i++) tree.insert(i)
      expect(tree.size()).toBe(5000)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(4999)
      expect(tree.select(0)).toBe(0)
      expect(tree.select(4999)).toBe(4999)
    })

    it('should maintain correct structure after many mixed operations', () => {
      const present = new Set<number>()
      for (let i = 0; i < 500; i++) {
        const v = Math.floor(Math.random() * 1000)
        tree.insert(v)
        present.add(v)
      }
      expect(tree.size()).toBe(present.size)
      for (const v of present) {
        expect(tree.has(v)).toBe(true)
        expect(tree.rank(v)).toBeGreaterThanOrEqual(0)
      }
    })

    it('should handle alternating insert/delete', () => {
      for (let i = 0; i < 200; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        tree.delete(i * 2)
      }
      expect(tree.size()).toBe(100)
      for (let i = 0; i < 200; i++) {
        if (i % 2 === 0) {
          expect(tree.has(i)).toBe(false)
        } else {
          expect(tree.has(i)).toBe(true)
        }
      }
    })

    it('rank and select consistency under stress', () => {
      const vals = new Set<number>()
      while (vals.size < 500) {
        vals.add(Math.floor(Math.random() * 2000))
      }
      for (const v of vals) tree.insert(v)
      const sorted = [...vals].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(tree.select(i)).toBe(sorted[i])
        expect(tree.rank(sorted[i]!)).toBe(i)
      }
    })

    it('should handle all operations on a tree with negative numbers', () => {
      const t = createFilled(-5, -3, -1, 0, 2, 4)
      expect(t.min()).toBe(-5)
      expect(t.max()).toBe(4)
      expect(t.rank(-3)).toBe(1)
      expect(t.select(3)).toBe(0)
      expect(t.floor(-2)).toBe(-3)
      expect(t.ceiling(-2)).toBe(-1)
      expect(t.lower(0)).toBe(-1)
      expect(t.higher(0)).toBe(2)
    })

    it('should handle floating point keys', () => {
      const t = new OrderedStatisticsTree<number>()
      t.insert(1.5)
      t.insert(2.7)
      t.insert(0.3)
      expect(t.toArray()).toEqual([0.3, 1.5, 2.7])
      expect(t.rank(1.5)).toBe(1)
      expect(t.select(0)).toBeCloseTo(0.3)
    })

    it('should work with object keys using custom comparator', () => {
      interface Point { x: number; y: number }
      const cmp: CompareFunction<Point> = (a, b) => a.x - b.x || a.y - b.y
      const t = new OrderedStatisticsTree<Point>(cmp)
      t.insert({ x: 3, y: 1 })
      t.insert({ x: 1, y: 2 })
      t.insert({ x: 2, y: 0 })
      const arr = t.toArray()
      expect(arr[0]!.x).toBe(1)
      expect(arr[1]!.x).toBe(2)
      expect(arr[2]!.x).toBe(3)
    })

    it('should handle clearing and rebuilding', () => {
      for (let i = 0; i < 100; i++) tree.insert(i)
      tree.clear()
      expect(tree.size()).toBe(0)
      for (let i = 200; i < 300; i++) tree.insert(i)
      expect(tree.size()).toBe(100)
      expect(tree.min()).toBe(200)
      expect(tree.max()).toBe(299)
    })

    it('should handle deletion of all elements via select', () => {
      for (let i = 0; i < 50; i++) tree.insert(i * 2)
      while (!tree.isEmpty()) {
        const key = tree.select(0)!
        tree.delete(key)
      }
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle floor/ceiling/lower/higher with single element', () => {
      tree.insert(5)
      expect(tree.floor(5)).toBe(5)
      expect(tree.floor(10)).toBe(5)
      expect(tree.floor(3)).toBeUndefined()
      expect(tree.ceiling(5)).toBe(5)
      expect(tree.ceiling(3)).toBe(5)
      expect(tree.ceiling(10)).toBeUndefined()
      expect(tree.lower(5)).toBeUndefined()
      expect(tree.lower(10)).toBe(5)
      expect(tree.higher(5)).toBeUndefined()
      expect(tree.higher(3)).toBe(5)
    })

    it('should handle range with exact bounds', () => {
      const t = createFilled(1, 2, 3)
      expect(t.range(1, 3)).toEqual([1, 2, 3])
      expect(t.range(1, 1)).toEqual([1])
      expect(t.range(3, 3)).toEqual([3])
    })

    it('should handle rank of min and max in large tree', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i)
      expect(tree.rank(0)).toBe(0)
      expect(tree.rank(999)).toBe(999)
    })

    it('should handle select(0) and select(n-1) in large tree', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i)
      expect(tree.select(0)).toBe(0)
      expect(tree.select(999)).toBe(999)
    })

    it('should handle delete of non-existent in large tree', () => {
      for (let i = 0; i < 100; i++) tree.insert(i * 2)
      expect(tree.delete(1)).toBe(false)
      expect(tree.delete(3)).toBe(false)
      expect(tree.size()).toBe(100)
    })

    it('should handle duplicate insertions gracefully', () => {
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 5; j++) {
          tree.insert(i)
        }
      }
      expect(tree.size()).toBe(10)
    })

    it('should correctly handle floor and ceiling at boundaries', () => {
      const t = createFilled(10, 20, 30)
      expect(t.floor(10)).toBe(10)
      expect(t.floor(9)).toBeUndefined()
      expect(t.ceiling(30)).toBe(30)
      expect(t.ceiling(31)).toBeUndefined()
    })

    it('should handle lower and higher at boundaries', () => {
      const t = createFilled(10, 20, 30)
      expect(t.lower(10)).toBeUndefined()
      expect(t.lower(11)).toBe(10)
      expect(t.higher(30)).toBeUndefined()
      expect(t.higher(29)).toBe(30)
    })

    it('should handle range where lo and hi are between elements', () => {
      const t = createFilled(10, 20, 30, 40, 50)
      expect(t.range(15, 45)).toEqual([20, 30, 40])
      expect(t.count(15, 45)).toBe(3)
    })

    it('should handle operations after deleting min repeatedly', () => {
      for (let i = 0; i < 10; i++) tree.insert(i)
      for (let i = 0; i < 10; i++) {
        expect(tree.min()).toBe(i)
        tree.delete(i)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle operations after deleting max repeatedly', () => {
      for (let i = 0; i < 10; i++) tree.insert(i)
      for (let i = 9; i >= 0; i--) {
        expect(tree.max()).toBe(i)
        tree.delete(i)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle select on boundary indices', () => {
      const t = createFilled(1, 2, 3, 4, 5)
      expect(t.select(0)).toBe(1)
      expect(t.select(4)).toBe(5)
      expect(t.select(5)).toBeUndefined()
    })
  })
})
