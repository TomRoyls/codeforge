import { describe, it, expect } from 'vitest'
import { OrderStatisticTree } from '../../src/core/order-statistic-tree/order-statistic-tree.js'

describe('OrderStatisticTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with custom comparator', () => {
      const tree = new OrderStatisticTree<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      tree.insert('banana')
      tree.insert('apple')
      tree.insert('cherry')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('creates tree with reverse comparator', () => {
      const tree = new OrderStatisticTree<number>({
        comparator: (a, b) => b - a,
      })
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('insert', () => {
    it('inserts single element', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('inserts multiple elements', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.size()).toBe(5)
    })

    it('ignores duplicate insertions', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
    })

    it('maintains valid BST after inserts', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
        expect(tree.isValid()).toBe(true)
      }
    })

    it('inserts in reverse order', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 100; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(101)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('contains', () => {
    it('returns false for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.contains(5)).toBe(false)
    })

    it('returns true for existing element', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.contains(3)).toBe(false)
    })

    it('finds all inserted elements', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      for (const v of values) {
        expect(tree.contains(v)).toBe(true)
      }
      expect(tree.contains(0)).toBe(false)
      expect(tree.contains(10)).toBe(false)
    })
  })

  describe('delete', () => {
    it('returns false for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.delete(5)).toBe(false)
    })

    it('returns false for non-existing element', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.delete(3)).toBe(false)
    })

    it('deletes existing element', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.contains(5)).toBe(false)
    })

    it('deletes root with two children', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.contains(5)).toBe(false)
      expect(tree.contains(3)).toBe(true)
      expect(tree.contains(7)).toBe(true)
    })

    it('deletes leaf node', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(3)).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.contains(3)).toBe(false)
    })

    it('deletes all elements', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9]
      for (const v of values) tree.insert(v)
      for (const v of values) {
        expect(tree.delete(v)).toBe(true)
      }
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('maintains validity after deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 50; i++) tree.insert(i)
      for (let i = 0; i < 50; i += 2) {
        tree.delete(i)
        expect(tree.isValid()).toBe(true)
      }
    })
  })

  describe('size, isEmpty, clear', () => {
    it('size tracks insertions and deletions', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.size()).toBe(0)
      tree.insert(1)
      expect(tree.size()).toBe(1)
      tree.insert(2)
      expect(tree.size()).toBe(2)
      tree.delete(1)
      expect(tree.size()).toBe(1)
    })

    it('isEmpty reflects state', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.isEmpty()).toBe(true)
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })

    it('clear empties the tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      expect(tree.size()).toBe(10)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })
  })

  describe('select', () => {
    it('returns undefined for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.select(0)).toBeUndefined()
    })

    it('returns undefined for negative rank', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.select(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds rank', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.select(1)).toBeUndefined()
    })

    it('returns element at rank 0 (minimum)', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.select(0)).toBe(1)
    })

    it('returns element at last rank (maximum)', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9]
      for (const v of values) tree.insert(v)
      expect(tree.select(4)).toBe(9)
    })

    it('returns all elements in sorted order', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      const sorted = [...values].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(tree.select(i)).toBe(sorted[i])
      }
    })

    it('select works after deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      tree.delete(5)
      tree.delete(3)
      const arr = tree.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(tree.select(i)).toBe(arr[i])
      }
    })
  })

  describe('rank', () => {
    it('returns -1 for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.rank(5)).toBe(-1)
    })

    it('returns -1 for non-existing value', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.rank(3)).toBe(-1)
    })

    it('returns 0 for minimum element', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.rank(1)).toBe(0)
    })

    it('returns correct rank for all elements', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      const sorted = [...values].sort((a, b) => a - b)
      for (let i = 0; i < sorted.length; i++) {
        expect(tree.rank(sorted[i]!)).toBe(i)
      }
    })

    it('rank and select are inverse operations', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      for (let i = 0; i < values.length; i++) {
        const val = tree.select(i)
        expect(val).toBeDefined()
        expect(tree.rank(val!)).toBe(i)
      }
    })

    it('rank works after deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      tree.delete(5)
      tree.delete(3)
      const arr = tree.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(tree.rank(arr[i]!)).toBe(i)
      }
    })
  })

  describe('getMin, getMax', () => {
    it('returns undefined for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.getMin()).toBeUndefined()
      expect(tree.getMax()).toBeUndefined()
    })

    it('returns same element for single element tree', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.getMin()).toBe(5)
      expect(tree.getMax()).toBe(5)
    })

    it('returns correct min and max', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      expect(tree.getMin()).toBe(1)
      expect(tree.getMax()).toBe(9)
    })

    it('updates min and max after deletion', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      tree.delete(0)
      expect(tree.getMin()).toBe(1)
      tree.delete(9)
      expect(tree.getMax()).toBe(8)
    })
  })

  describe('predecessor, successor', () => {
    it('returns undefined for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.predecessor(5)).toBeUndefined()
      expect(tree.successor(5)).toBeUndefined()
    })

    it('returns undefined when no predecessor exists', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.predecessor(3)).toBeUndefined()
    })

    it('returns undefined when no successor exists', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.successor(7)).toBeUndefined()
    })

    it('returns correct predecessor', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      expect(tree.predecessor(5)).toBe(4)
      expect(tree.predecessor(3)).toBe(2)
      expect(tree.predecessor(7)).toBe(6)
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('returns correct successor', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      expect(tree.successor(5)).toBe(6)
      expect(tree.successor(3)).toBe(4)
      expect(tree.successor(7)).toBe(8)
      expect(tree.successor(9)).toBeUndefined()
    })

    it('predecessor of value not in tree', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.predecessor(7)).toBe(5)
      expect(tree.successor(7)).toBe(10)
    })

    it('predecessor and successor of minimum and maximum', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      expect(tree.predecessor(0)).toBeUndefined()
      expect(tree.successor(9)).toBeUndefined()
      expect(tree.predecessor(9)).toBe(8)
      expect(tree.successor(0)).toBe(1)
    })
  })

  describe('countRange', () => {
    it('returns 0 for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.countRange(0, 10)).toBe(0)
    })

    it('counts all elements when range covers all', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      expect(tree.countRange(0, 9)).toBe(10)
    })

    it('counts subset of elements', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      expect(tree.countRange(3, 7)).toBe(5)
    })

    it('counts single element range', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      expect(tree.countRange(5, 5)).toBe(1)
    })

    it('returns 0 when range has no elements', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(1)
      tree.insert(10)
      expect(tree.countRange(3, 7)).toBe(0)
    })

    it('returns 0 when low > high', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      expect(tree.countRange(7, 3)).toBe(0)
    })

    it('counts range boundaries correctly', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [1, 3, 5, 7, 9]
      for (const v of values) tree.insert(v)
      expect(tree.countRange(1, 9)).toBe(5)
      expect(tree.countRange(2, 8)).toBe(3)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2]
      for (const v of values) tree.insert(v)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('returns single element array', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(42)
      expect(tree.toArray()).toEqual([42])
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates in sorted order', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9]
      for (const v of values) tree.insert(v)
      const collected: number[] = []
      tree.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 3, 5, 7, 9])
    })

    it('provides correct index', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 5; i++) tree.insert(i)
      const indices: number[] = []
      tree.forEach((_v, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect([...tree]).toEqual([])
    })

    it('iterates in sorted order', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [5, 3, 7, 1, 9]
      for (const v of values) tree.insert(v)
      expect([...tree]).toEqual([1, 3, 5, 7, 9])
    })

    it('works with for...of', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const result: number[] = []
      for (const v of tree) result.push(v)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('clone', () => {
    it('clones empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones non-empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      const cloned = tree.clone()
      expect(cloned.size()).toBe(tree.size())
      expect(cloned.toArray()).toEqual(tree.toArray())
    })

    it('clone is independent', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      const cloned = tree.clone()
      cloned.delete(5)
      expect(tree.contains(5)).toBe(true)
      expect(cloned.contains(5)).toBe(false)
    })

    it('preserves comparator', () => {
      const tree = new OrderStatisticTree<number>({
        comparator: (a, b) => b - a,
      })
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('getHeight', () => {
    it('returns 0 for empty tree', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.getHeight()).toBe(0)
    })

    it('returns 1 for single element', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.getHeight()).toBe(1)
    })

    it('height grows logarithmically', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 1000; i++) tree.insert(i)
      const height = tree.getHeight()
      expect(height).toBeLessThan(50)
    })
  })

  describe('isValid', () => {
    it('empty tree is valid', () => {
      const tree = new OrderStatisticTree<number>()
      expect(tree.isValid()).toBe(true)
    })

    it('single element tree is valid', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.isValid()).toBe(true)
    })

    it('tree with many elements is valid', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      expect(tree.isValid()).toBe(true)
    })

    it('tree remains valid after deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      for (let i = 0; i < 100; i += 3) tree.delete(i)
      expect(tree.isValid()).toBe(true)
    })

    it('tree remains valid after mixed operations', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 50; i++) tree.insert(i)
      for (let i = 0; i < 25; i++) tree.delete(i)
      for (let i = 50; i < 75; i++) tree.insert(i)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('string values', () => {
    it('works with strings', () => {
      const tree = new OrderStatisticTree<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
      expect(tree.select(0)).toBe('apple')
      expect(tree.rank('banana')).toBe(1)
    })
  })

  describe('object values with custom comparator', () => {
    it('works with objects', () => {
      interface Item { id: number; name: string }
      const tree = new OrderStatisticTree<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      tree.insert({ id: 3, name: 'c' })
      tree.insert({ id: 1, name: 'a' })
      tree.insert({ id: 2, name: 'b' })
      expect(tree.select(0)?.name).toBe('a')
      expect(tree.select(2)?.name).toBe('c')
      expect(tree.size()).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('handles sequential insertions and deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 20; i++) {
        expect(tree.delete(i)).toBe(true)
        expect(tree.isValid()).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles reverse sequential deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 20; i++) tree.insert(i)
      for (let i = 19; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true)
        expect(tree.isValid()).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles alternating insert delete', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
        if (i % 2 === 0 && i > 0) {
          tree.delete(i - 1)
        }
        expect(tree.isValid()).toBe(true)
      }
    })

    it('handles negative numbers', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(-5)
      tree.insert(-3)
      tree.insert(-1)
      tree.insert(0)
      tree.insert(2)
      expect(tree.getMin()).toBe(-5)
      expect(tree.getMax()).toBe(2)
      expect(tree.select(0)).toBe(-5)
      expect(tree.rank(-1)).toBe(2)
    })

    it('handles floating point numbers', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(1.5)
      tree.insert(2.7)
      tree.insert(0.3)
      expect(tree.toArray()).toEqual([0.3, 1.5, 2.7])
    })

    it('handles duplicate values by ignoring them', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      tree.delete(5)
      expect(tree.size()).toBe(0)
      expect(tree.contains(5)).toBe(false)
    })
  })

  describe('select and rank consistency', () => {
    it('select(rank(x)) === x for all x in tree', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [42, 17, 89, 3, 56, 21, 73, 11, 95, 38]
      for (const v of values) tree.insert(v)
      for (const v of values) {
        const r = tree.rank(v)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(tree.select(r)).toBe(v)
      }
    })

    it('rank(select(i)) === i for all valid ranks', () => {
      const tree = new OrderStatisticTree<number>()
      const values = [42, 17, 89, 3, 56, 21, 73, 11, 95, 38]
      for (const v of values) tree.insert(v)
      const n = tree.size()
      for (let i = 0; i < n; i++) {
        const val = tree.select(i)
        expect(val).toBeDefined()
        expect(tree.rank(val!)).toBe(i)
      }
    })
  })

  describe('countRange edge cases', () => {
    it('counts range with all same values', () => {
      const tree = new OrderStatisticTree<number>()
      tree.insert(5)
      expect(tree.countRange(5, 5)).toBe(1)
    })

    it('counts after deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 20; i++) tree.insert(i)
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      expect(tree.countRange(0, 19)).toBe(17)
    })
  })

  describe('stress tests', () => {
    it('handles 5000 sequential insertions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 5000; i++) tree.insert(i)
      expect(tree.size()).toBe(5000)
      expect(tree.isValid()).toBe(true)
      expect(tree.select(0)).toBe(0)
      expect(tree.select(4999)).toBe(4999)
      expect(tree.rank(2500)).toBe(2500)
    })

    it('handles 5000 reverse insertions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 4999; i >= 0; i--) tree.insert(i)
      expect(tree.size()).toBe(5000)
      expect(tree.isValid()).toBe(true)
    })

    it('handles 5000 random insertions', () => {
      const tree = new OrderStatisticTree<number>()
      const values = new Set<number>()
      for (let i = 0; i < 5000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.add(v)
        tree.insert(v)
      }
      expect(tree.size()).toBe(values.size)
      expect(tree.isValid()).toBe(true)
    })

    it('handles 5000 insertions with deletions', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 5000; i++) tree.insert(i)
      for (let i = 0; i < 2500; i++) tree.delete(i)
      expect(tree.size()).toBe(2500)
      expect(tree.isValid()).toBe(true)
      expect(tree.select(0)).toBe(2500)
      expect(tree.select(2499)).toBe(4999)
    })

    it('select and rank on 5000 elements', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 5000; i++) tree.insert(i)
      for (let i = 0; i < 5000; i += 100) {
        expect(tree.select(i)).toBe(i)
        expect(tree.rank(i)).toBe(i)
      }
    })

    it('predecessor and successor on large tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 5000; i++) tree.insert(i)
      for (let i = 1; i < 4999; i += 100) {
        expect(tree.predecessor(i)).toBe(i - 1)
        expect(tree.successor(i)).toBe(i + 1)
      }
    })

    it('countRange on large tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 5000; i++) tree.insert(i)
      expect(tree.countRange(100, 200)).toBe(101)
      expect(tree.countRange(0, 4999)).toBe(5000)
    })

    it('clone large tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 1000; i++) tree.insert(i)
      const cloned = tree.clone()
      expect(cloned.size()).toBe(1000)
      expect(cloned.isValid()).toBe(true)
      expect(cloned.select(500)).toBe(500)
    })

    it('forEach on large tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 1000; i++) tree.insert(i)
      let count = 0
      let lastVal = -1
      tree.forEach((v) => {
        expect(v).toBeGreaterThan(lastVal)
        lastVal = v
        count++
      })
      expect(count).toBe(1000)
    })

    it('iterator on large tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 1000; i++) tree.insert(i)
      const arr = [...tree]
      expect(arr.length).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('height is logarithmic for 5000 elements', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 5000; i++) tree.insert(i)
      const height = tree.getHeight()
      expect(height).toBeLessThan(100)
    })

    it('mixed insert delete stress', () => {
      const tree = new OrderStatisticTree<number>()
      const present = new Set<number>()
      for (let i = 0; i < 2000; i++) {
        const v = Math.floor(Math.random() * 3000)
        tree.insert(v)
        present.add(v)
      }
      const arr = [...present]
      for (let i = 0; i < arr.length; i += 3) {
        tree.delete(arr[i]!)
        present.delete(arr[i]!)
      }
      expect(tree.size()).toBe(present.size)
      expect(tree.isValid()).toBe(true)
    })

    it('getMin and getMax after random operations', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 1000; i++) tree.insert(i)
      for (let i = 0; i < 500; i++) tree.delete(i)
      expect(tree.getMin()).toBe(500)
      expect(tree.getMax()).toBe(999)
    })

    it('clear and reuse tree', () => {
      const tree = new OrderStatisticTree<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      tree.clear()
      expect(tree.size()).toBe(0)
      for (let i = 0; i < 100; i++) tree.insert(i)
      expect(tree.size()).toBe(100)
      expect(tree.isValid()).toBe(true)
      expect(tree.select(0)).toBe(0)
    })
  })
})
