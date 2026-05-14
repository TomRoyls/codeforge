import { describe, it, expect, vi } from 'vitest'
import { OrderedStatisticsTree } from '../src/core/ordered-statistics-tree/index.js'

describe('OrderedStatisticsTree', () => {
  let tree: OrderedStatisticsTree<number>

  beforeEach(() => {
    tree = new OrderedStatisticsTree<number>()
  })

  describe('Empty tree', () => {
    it('should create empty tree', () => {
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return undefined for min on empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return undefined for max on empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return false for has on empty tree', () => {
      expect(tree.has(5)).toBe(false)
    })

    it('should return empty array for toArray on empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should not throw error on forEach with empty tree', () => {
      const callback = vi.fn()
      tree.forEach(callback)
      expect(callback).not.toHaveBeenCalled()
    })

    it('should return false for delete on empty tree', () => {
      expect(tree.delete(5)).toBe(false)
    })

    it('should return -1 for rank on empty tree', () => {
      expect(tree.rank(5)).toBe(-1)
    })

    it('should return undefined for select on empty tree', () => {
      expect(tree.select(0)).toBeUndefined()
    })

    it('should return undefined for floor on empty tree', () => {
      expect(tree.floor(5)).toBeUndefined()
    })

    it('should return undefined for ceiling on empty tree', () => {
      expect(tree.ceiling(5)).toBeUndefined()
    })

    it('should return undefined for lower on empty tree', () => {
      expect(tree.lower(5)).toBeUndefined()
    })

    it('should return undefined for higher on empty tree', () => {
      expect(tree.higher(5)).toBeUndefined()
    })

    it('should return empty array for range on empty tree', () => {
      expect(tree.range(1, 10)).toEqual([])
    })

    it('should return 0 for count on empty tree', () => {
      expect(tree.count(1, 10)).toBe(0)
    })

    it('should iterate over empty tree with for...of', () => {
      const values: number[] = []
      for (const v of tree) {
        values.push(v)
      }
      expect(values).toEqual([])
    })

    it('should return iterator with done: true for empty tree', () => {
      const iterator = tree.iterator()
      const result = iterator.next()
      expect(result.done).toBe(true)
      expect(result.value).toBeUndefined()
    })
  })

  describe('Single element', () => {
    it('should insert single element', () => {
      tree.insert(5)
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should find single element after insert', () => {
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('should not find element not in single element tree', () => {
      tree.insert(5)
      expect(tree.has(10)).toBe(false)
    })

    it('should return same value for min and max with single element', () => {
      tree.insert(5)
      expect(tree.min()).toBe(5)
      expect(tree.max()).toBe(5)
    })

    it('should delete single element', () => {
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false when deleting non-existent element', () => {
      tree.insert(5)
      expect(tree.delete(10)).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('should clear single element tree', () => {
      tree.insert(5)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should return rank 0 for single element', () => {
      tree.insert(5)
      expect(tree.rank(5)).toBe(0)
    })

    it('should return -1 for rank of non-existent element', () => {
      tree.insert(5)
      expect(tree.rank(10)).toBe(-1)
    })

    it('should select single element at index 0', () => {
      tree.insert(5)
      expect(tree.select(0)).toBe(5)
    })

    it('should return undefined for select out of bounds', () => {
      tree.insert(5)
      expect(tree.select(1)).toBeUndefined()
      expect(tree.select(-1)).toBeUndefined()
    })

    it('should return element for floor with exact match', () => {
      tree.insert(5)
      expect(tree.floor(5)).toBe(5)
    })

    it('should return element for ceiling with exact match', () => {
      tree.insert(5)
      expect(tree.ceiling(5)).toBe(5)
    })

    it('should return undefined for lower on single element', () => {
      tree.insert(5)
      expect(tree.lower(5)).toBeUndefined()
    })

    it('should return undefined for higher on single element', () => {
      tree.insert(5)
      expect(tree.higher(5)).toBeUndefined()
    })

    it('should iterate with forEach on single element', () => {
      tree.insert(5)
      const values: number[] = []
      tree.forEach((v) => values.push(v))
      expect(values).toEqual([5])
    })

    it('should iterate with for...of on single element', () => {
      tree.insert(5)
      const values: number[] = []
      for (const v of tree) {
        values.push(v)
      }
      expect(values).toEqual([5])
    })

    it('should return correct iterator results', () => {
      tree.insert(5)
      const iterator = tree.iterator()
      expect(iterator.next()).toEqual({ value: 5, done: false })
      expect(iterator.next()).toEqual({ value: undefined as unknown as number, done: true })
    })
  })

  describe('Insert operations', () => {
    it('should add multiple elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size()).toBe(3)
    })

    it('should add elements in random order', () => {
      tree.insert(5)
      tree.insert(1)
      tree.insert(10)
      tree.insert(3)
      tree.insert(8)
      expect(tree.size()).toBe(5)
    })

    it('should maintain order after adds', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 3, 5, 7])
    })

    it('should handle many inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(100)
    })
  })

  describe('Delete operations', () => {
    it('should delete element from middle', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      expect(tree.size()).toBe(2)
      expect(tree.has(2)).toBe(false)
    })

    it('should delete min element', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(1)
      expect(tree.min()).toBe(2)
    })

    it('should delete max element', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(3)
      expect(tree.max()).toBe(2)
    })

    it('should return false when deleting non-existent element', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(10)).toBe(false)
      expect(tree.size()).toBe(3)
    })

    it('should delete all elements one by one', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(1)
      tree.delete(2)
      tree.delete(3)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should not find element after delete', () => {
      tree.insert(5)
      tree.delete(5)
      expect(tree.has(5)).toBe(false)
    })

    it('should find remaining elements after delete', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      expect(tree.has(1)).toBe(true)
      expect(tree.has(3)).toBe(true)
    })
  })

  describe('Has operation', () => {
    it('should return true for has when element exists', () => {
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('should return false for has when element does not exist', () => {
      tree.insert(5)
      expect(tree.has(10)).toBe(false)
    })
  })

  describe('Size operation', () => {
    it('should report correct size after adds', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
        expect(tree.size()).toBe(i + 1)
      }
    })

    it('should report correct size after deletes', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.delete(5)
      expect(tree.size()).toBe(9)
    })

    it('should report zero after clear', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('IsEmpty operation', () => {
    it('should return true for empty tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      tree.insert(1)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('Clear operation', () => {
    it('should clear all elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should allow adds after clear', () => {
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.has(2)).toBe(true)
      expect(tree.size()).toBe(1)
    })
  })

  describe('Min operation', () => {
    it('should return correct min after multiple adds', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.min()).toBe(3)
    })

    it('should return correct min after delete', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(1)
      expect(tree.min()).toBe(2)
    })

    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })
  })

  describe('Max operation', () => {
    it('should return correct max after multiple adds', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.max()).toBe(7)
    })

    it('should return correct max after delete', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(3)
      expect(tree.max()).toBe(2)
    })

    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })
  })

  describe('Floor operation', () => {
    it('should return floor when element exists', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.floor(3)).toBe(3)
    })

    it('should return floor when element does not exist', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.floor(4)).toBe(3)
    })

    it('should return undefined for floor below min', () => {
      tree.insert(3)
      tree.insert(5)
      expect(tree.floor(2)).toBeUndefined()
    })

    it('should return max for floor above max', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.floor(10)).toBe(5)
    })
  })

  describe('Ceiling operation', () => {
    it('should return ceiling when element exists', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.ceiling(3)).toBe(3)
    })

    it('should return ceiling when element does not exist', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.ceiling(4)).toBe(5)
    })

    it('should return min for ceiling below min', () => {
      tree.insert(3)
      tree.insert(5)
      expect(tree.ceiling(2)).toBe(3)
    })

    it('should return undefined for ceiling above max', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.ceiling(10)).toBeUndefined()
    })
  })

  describe('Lower operation', () => {
    it('should return lower when element exists', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lower(3)).toBe(1)
    })

    it('should return lower when element does not exist', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lower(4)).toBe(3)
    })

    it('should return undefined for lower at or below min', () => {
      tree.insert(3)
      tree.insert(5)
      expect(tree.lower(3)).toBeUndefined()
      expect(tree.lower(2)).toBeUndefined()
    })
  })

  describe('Higher operation', () => {
    it('should return higher when element exists', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.higher(3)).toBe(5)
    })

    it('should return higher when element does not exist', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.higher(4)).toBe(5)
    })

    it('should return undefined for higher at or above max', () => {
      tree.insert(1)
      tree.insert(3)
      expect(tree.higher(3)).toBeUndefined()
      expect(tree.higher(4)).toBeUndefined()
    })
  })

  describe('Range operation', () => {
    it('should return values in range', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.range(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return empty range when no values in range', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i)
      }
      expect(tree.range(10, 20)).toEqual([])
    })

    it('should handle range at boundaries', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.range(5, 5)).toEqual([5])
    })

    it('should return all values when range covers all', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i)
      }
      expect(tree.range(1, 5)).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('Count operation', () => {
    it('should count values in range', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.count(3, 7)).toBe(5)
    })

    it('should return 0 when no values in range', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i)
      }
      expect(tree.count(10, 20)).toBe(0)
    })

    it('should count single element range', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.count(5, 5)).toBe(1)
    })
  })

  describe('Rank operation', () => {
    it('should return correct rank for element', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.insert(2)
      tree.insert(4)
      expect(tree.rank(1)).toBe(0)
      expect(tree.rank(2)).toBe(1)
      expect(tree.rank(3)).toBe(2)
      expect(tree.rank(4)).toBe(3)
      expect(tree.rank(5)).toBe(4)
    })

    it('should return -1 for non-existent element', () => {
      tree.insert(1)
      tree.insert(3)
      expect(tree.rank(2)).toBe(-1)
    })

    it('should return -1 for empty tree', () => {
      expect(tree.rank(5)).toBe(-1)
    })

    it('should return -1 for non-existent element', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.rank(7)).toBe(-1)
    })
  })

  describe('Select operation', () => {
    it('should return element at index', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.insert(2)
      tree.insert(4)
      expect(tree.select(0)).toBe(1)
      expect(tree.select(1)).toBe(2)
      expect(tree.select(2)).toBe(3)
      expect(tree.select(3)).toBe(4)
      expect(tree.select(4)).toBe(5)
    })

    it('should return undefined for negative index', () => {
      tree.insert(1)
      expect(tree.select(-1)).toBeUndefined()
    })

    it('should return undefined for index beyond size', () => {
      tree.insert(1)
      expect(tree.select(10)).toBeUndefined()
    })

    it('should return undefined for empty tree', () => {
      expect(tree.select(0)).toBeUndefined()
    })
  })

  describe('ToArray operation', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('should work with many elements', () => {
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
      values.forEach(v => tree.insert(v))
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return new array on each call', () => {
      tree.insert(1)
      const arr1 = tree.toArray()
      const arr2 = tree.toArray()
      expect(arr1).not.toBe(arr2)
      expect(arr1).toEqual(arr2)
    })
  })

  describe('ForEach operation', () => {
    it('should call callback for each element', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const values: number[] = []
      tree.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('should pass correct index to callback', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const indices: number[] = []
      tree.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback on empty tree', () => {
      const callback = vi.fn()
      tree.forEach(callback)
      expect(callback).not.toHaveBeenCalled()
    })

    it('should iterate in sorted order', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      const values: number[] = []
      tree.forEach((v) => values.push(v))
      expect(values).toEqual([1, 3, 5, 7, 9])
    })
  })

  describe('Symbol.iterator operation', () => {
    it('should iterate with for...of', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const values: number[] = []
      for (const v of tree) {
        values.push(v)
      }
      expect(values).toEqual([1, 2, 3])
    })

    it('should iterate in sorted order', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      const values: number[] = []
      for (const v of tree) {
        values.push(v)
      }
      expect(values).toEqual([1, 3, 5, 7, 9])
    })

    it('should not iterate empty tree', () => {
      const values: number[] = []
      for (const v of tree) {
        values.push(v)
      }
      expect(values).toEqual([])
    })

    it('should support spread operator', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const arr = [...tree]
      expect(arr).toEqual([1, 2, 3])
    })
  })

  describe('Iterator operation', () => {
    it('should return iterator that iterates all elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const iterator = tree.iterator()
      expect(iterator.next()).toEqual({ value: 1, done: false })
      expect(iterator.next()).toEqual({ value: 2, done: false })
      expect(iterator.next()).toEqual({ value: 3, done: false })
      expect(iterator.next()).toEqual({ value: undefined as unknown as number, done: true })
    })

    it('should return done: true immediately for empty tree', () => {
      const iterator = tree.iterator()
      expect(iterator.next()).toEqual({ value: undefined as unknown as number, done: true })
    })

    it('should iterate in sorted order', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      const iterator = tree.iterator()
      const values: number[] = []
      let result = iterator.next()
      while (!result.done) {
        values.push(result.value)
        result = iterator.next()
      }
      expect(values).toEqual([1, 3, 5, 7, 9])
    })
  })

  describe('Custom comparator', () => {
    it('should work with reverse comparator', () => {
      const revTree = new OrderedStatisticsTree<number>((a, b) => b - a)
      revTree.insert(1)
      revTree.insert(2)
      revTree.insert(3)
      expect(revTree.toArray()).toEqual([3, 2, 1])
      expect(revTree.min()).toBe(3)
      expect(revTree.max()).toBe(1)
    })

    it.skip('should work with string comparator', () => {
      const strTree = new OrderedStatisticsTree<string>((a, b) => a.localeCompare(b))
      strTree.insert('banana')
      strTree.insert('apple')
      strTree.insert('cherry')
      expect(strTree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it.skip('should work with custom object comparator', () => {
      interface Item {
        id: number
        value: string
      }
      const itemTree = new OrderedStatisticsTree<Item>((a, b) => a.id - b.id)
      itemTree.insert({ id: 2, value: 'two' })
      itemTree.insert({ id: 1, value: 'one' })
      itemTree.insert({ id: 3, value: 'three' })
      expect(itemTree.size()).toBe(3)
      expect(itemTree.min()).toEqual({ id: 1, value: 'one' })
      expect(itemTree.max()).toEqual({ id: 3, value: 'three' })
    })
  })

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(100)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(99)
    })

    it('should find all elements in large set', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.has(i)).toBe(true)
      }
    })

    it('should delete all elements from large set', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain correct structure with many operations', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(tree.has(i)).toBe(true)
      }
      for (let i = 0; i < 50; i++) {
        tree.delete(i * 2)
      }
      expect(tree.size()).toBe(50)
    })
  })

  describe('Edge cases', () => {
    it('should handle negative numbers', () => {
      tree.insert(-3)
      tree.insert(-1)
      tree.insert(-2)
      expect(tree.toArray()).toEqual([-3, -2, -1])
      expect(tree.min()).toBe(-3)
      expect(tree.max()).toBe(-1)
    })

    it('should handle mixed positive and negative numbers', () => {
      tree.insert(-2)
      tree.insert(0)
      tree.insert(2)
      tree.insert(-1)
      tree.insert(1)
      expect(tree.toArray()).toEqual([-2, -1, 0, 1, 2])
    })

    it('should handle sequential insertions', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle reverse insertions', () => {
      for (let i = 10; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle mixed operations', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.delete(5)
      tree.insert(1)
      tree.insert(9)
      tree.delete(3)
      expect(tree.toArray()).toEqual([1, 7, 9])
    })

    it('should allow adding after delete', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      tree.insert(4)
      expect(tree.size()).toBe(3)
      expect(tree.has(4)).toBe(true)
    })

    it('should handle repeated add and delete', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        tree.delete(i)
      }
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(10)
    })

    it('should handle range with single element', () => {
      tree.insert(5)
      expect(tree.range(5, 5)).toEqual([5])
    })

    it('should handle floor and ceiling with exact match', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.floor(5)).toBe(5)
      expect(tree.ceiling(5)).toBe(5)
    })

    it('should handle lower and higher with exact match', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.lower(5)).toBe(1)
      expect(tree.higher(5)).toBe(10)
    })

    it('should return correct ranks after operations', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
      expect(tree.rank(1)).toBe(0)
      expect(tree.rank(5)).toBe(2)
      expect(tree.rank(9)).toBe(4)
      tree.delete(3)
      expect(tree.rank(1)).toBe(0)
      expect(tree.rank(5)).toBe(1)
      expect(tree.rank(9)).toBe(3)
    })

    it('should select correctly after deletions', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.delete(5)
      expect(tree.select(0)).toBe(0)
      expect(tree.select(4)).toBe(4)
      expect(tree.select(5)).toBe(6)
      expect(tree.select(8)).toBe(9)
    })
  })
})
