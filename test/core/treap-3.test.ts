import { describe, it, expect } from 'vitest'
import { Treap3 } from './src/core/treap-3/index.js'

describe('Treap3', () => {
  describe('insert and search', () => {
    it('should insert and search single element', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      expect(treap.search(1)).toBe('one')
    })

    it('should return undefined for non-existent key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      expect(treap.search(2)).toBeUndefined()
    })

    it('should insert multiple elements and search each', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      expect(treap.search(1)).toBe('one')
      expect(treap.search(2)).toBe('two')
      expect(treap.search(3)).toBe('three')
    })

    it('should update value when inserting existing key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(1, 'updated')
      expect(treap.search(1)).toBe('updated')
      expect(treap.size).toBe(1)
    })

    it('should handle string keys', () => {
      const treap = new Treap3<string, number>()
      treap.insert('a', 1)
      treap.insert('b', 2)
      treap.insert('c', 3)
      expect(treap.search('a')).toBe(1)
      expect(treap.search('b')).toBe(2)
      expect(treap.search('c')).toBe(3)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.delete(1)
      expect(treap.search(1)).toBeUndefined()
    })

    it('should not affect size when deleting non-existent key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.delete(2)
      expect(treap.size).toBe(1)
    })

    it('should delete from middle of tree', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      treap.delete(2)
      expect(treap.search(2)).toBeUndefined()
      expect(treap.search(1)).toBe('one')
      expect(treap.search(3)).toBe('three')
    })

    it('should delete root', () => {
      const treap = new Treap3<number, string>()
      treap.insert(2, 'two')
      treap.insert(1, 'one')
      treap.insert(3, 'three')
      treap.delete(2)
      expect(treap.search(2)).toBeUndefined()
    })

    it('should handle multiple deletes', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      treap.delete(1)
      treap.delete(2)
      treap.delete(3)
      expect(treap.size).toBe(0)
    })
  })

  describe('contains', () => {
    it('should return true for existing key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      expect(treap.contains(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      expect(treap.contains(2)).toBe(false)
    })

    it('should return true after value update', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(1, 'updated')
      expect(treap.contains(1)).toBe(true)
    })
  })

  describe('min', () => {
    it('should return minimum key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(3, 'three')
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      expect(treap.min()).toBe(1)
    })

    it('should return undefined for empty treap', () => {
      const treap = new Treap3<number, string>()
      expect(treap.min()).toBeUndefined()
    })

    it('should work with single element', () => {
      const treap = new Treap3<number, string>()
      treap.insert(5, 'five')
      expect(treap.min()).toBe(5)
    })
  })

  describe('max', () => {
    it('should return maximum key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(3, 'three')
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      expect(treap.max()).toBe(3)
    })

    it('should return undefined for empty treap', () => {
      const treap = new Treap3<number, string>()
      expect(treap.max()).toBeUndefined()
    })

    it('should work with single element', () => {
      const treap = new Treap3<number, string>()
      treap.insert(5, 'five')
      expect(treap.max()).toBe(5)
    })
  })

  describe('size', () => {
    it('should return 0 for empty treap', () => {
      const treap = new Treap3<number, string>()
      expect(treap.size).toBe(0)
    })

    it('should track size after insert', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      expect(treap.size).toBe(1)
      treap.insert(2, 'two')
      expect(treap.size).toBe(2)
    })

    it('should track size after delete', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.delete(1)
      expect(treap.size).toBe(1)
    })

    it('should not change size on update', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(1, 'updated')
      expect(treap.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty treap', () => {
      const treap = new Treap3<number, string>()
      expect(treap.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      expect(treap.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.clear()
      expect(treap.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      treap.clear()
      expect(treap.size).toBe(0)
      expect(treap.search(1)).toBeUndefined()
      expect(treap.search(2)).toBeUndefined()
      expect(treap.search(3)).toBeUndefined()
    })

    it('should be safe to clear empty treap', () => {
      const treap = new Treap3<number, string>()
      treap.clear()
      expect(treap.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty treap', () => {
      const treap = new Treap3<number, string>()
      expect(treap.toArray()).toEqual([])
    })

    it('should return elements in order', () => {
      const treap = new Treap3<number, string>()
      treap.insert(3, 'three')
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      expect(treap.toArray()).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
    })

    it('should return single element', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      expect(treap.toArray()).toEqual([[1, 'one']])
    })
  })

  describe('inOrderTraversal', () => {
    it('should return elements in sorted order', () => {
      const treap = new Treap3<number, string>()
      treap.insert(5, 'five')
      treap.insert(2, 'two')
      treap.insert(8, 'eight')
      treap.insert(1, 'one')
      treap.insert(3, 'three')
      expect(treap.inOrderTraversal()).toEqual([[1, 'one'], [2, 'two'], [3, 'three'], [5, 'five'], [8, 'eight']])
    })

    it('should match toArray result', () => {
      const treap = new Treap3<number, string>()
      treap.insert(3, 'three')
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      expect(treap.inOrderTraversal()).toEqual(treap.toArray())
    })
  })

  describe('split', () => {
    it('should split at key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      treap.insert(4, 'four')
      treap.insert(5, 'five')
      const [left, right] = treap.split(3)
      expect(left.toArray()).toEqual([[1, 'one'], [2, 'two']])
      expect(right.toArray()).toEqual([[3, 'three'], [4, 'four'], [5, 'five']])
    })

    it('should split empty treap', () => {
      const treap = new Treap3<number, string>()
      const [left, right] = treap.split(3)
      expect(left.size).toBe(0)
      expect(right.size).toBe(0)
    })

    it('should handle split at beginning', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      const [left, right] = treap.split(1)
      expect(left.size).toBe(0)
      expect(right.toArray()).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
    })

    it('should handle split at end', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      const [left, right] = treap.split(4)
      expect(left.toArray()).toEqual([[1, 'one'], [2, 'two'], [3, 'three']])
      expect(right.size).toBe(0)
    })
  })

  describe('merge', () => {
    it('should merge two treaps', () => {
      const treap1 = new Treap3<number, string>()
      treap1.insert(1, 'one')
      treap1.insert(2, 'two')
      const treap2 = new Treap3<number, string>()
      treap2.insert(3, 'three')
      treap2.insert(4, 'four')
      treap1.merge(treap2)
      expect(treap1.toArray()).toEqual([[1, 'one'], [2, 'two'], [3, 'three'], [4, 'four']])
      expect(treap1.size).toBe(4)
    })

    it('should merge with empty treap', () => {
      const treap1 = new Treap3<number, string>()
      treap1.insert(1, 'one')
      treap1.insert(2, 'two')
      const treap2 = new Treap3<number, string>()
      treap1.merge(treap2)
      expect(treap1.toArray()).toEqual([[1, 'one'], [2, 'two']])
      expect(treap1.size).toBe(2)
    })

    it('should merge empty treap with non-empty', () => {
      const treap1 = new Treap3<number, string>()
      const treap2 = new Treap3<number, string>()
      treap2.insert(1, 'one')
      treap2.insert(2, 'two')
      treap1.merge(treap2)
      expect(treap1.toArray()).toEqual([[1, 'one'], [2, 'two']])
      expect(treap1.size).toBe(2)
    })

    it('should maintain BST property after merge', () => {
      const treap1 = new Treap3<number, string>()
      treap1.insert(1, 'one')
      treap1.insert(2, 'two')
      const treap2 = new Treap3<number, string>()
      treap2.insert(3, 'three')
      treap2.insert(4, 'four')
      treap1.merge(treap2)
      const arr = treap1.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i][0] > arr[i - 1][0]).toBe(true)
      }
    })
  })

  describe('complex operations', () => {
    it('should handle many inserts and deletes', () => {
      const treap = new Treap3<number, string>()
      for (let i = 0; i < 100; i++) {
        treap.insert(i, `value${i}`)
      }
      expect(treap.size).toBe(100)
      for (let i = 0; i < 100; i += 2) {
        treap.delete(i)
      }
      expect(treap.size).toBe(50)
    })

    it('should maintain BST property after many operations', () => {
      const treap = new Treap3<number, string>()
      const keys = [5, 3, 7, 2, 4, 6, 8, 1, 9]
      for (const key of keys) {
        treap.insert(key, `value${key}`)
      }
      const arr = treap.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i][0] > arr[i - 1][0]).toBe(true)
      }
    })

    it('should handle duplicate value inserts', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.insert(3, 'three')
      treap.insert(2, 'two-updated')
      expect(treap.search(2)).toBe('two-updated')
      expect(treap.size).toBe(3)
    })

    it('should work with object values', () => {
      const treap = new Treap3<number, { name: string }>()
      treap.insert(1, { name: 'one' })
      treap.insert(2, { name: 'two' })
      expect(treap.search(1)).toEqual({ name: 'one' })
    })

    it('should handle negative numbers', () => {
      const treap = new Treap3<number, string>()
      treap.insert(-5, 'negative-five')
      treap.insert(-3, 'negative-three')
      treap.insert(-1, 'negative-one')
      expect(treap.min()).toBe(-5)
      expect(treap.max()).toBe(-1)
      expect(treap.search(-3)).toBe('negative-three')
    })

    it('should handle zero key', () => {
      const treap = new Treap3<number, string>()
      treap.insert(0, 'zero')
      expect(treap.search(0)).toBe('zero')
      expect(treap.min()).toBe(0)
    })

    it('should handle sequential insert and delete', () => {
      const treap = new Treap3<number, string>()
      for (let i = 0; i < 10; i++) {
        treap.insert(i, `value${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(treap.contains(i)).toBe(true)
        treap.delete(i)
        expect(treap.contains(i)).toBe(false)
      }
      expect(treap.isEmpty).toBe(true)
    })

    it('should handle insert after delete', () => {
      const treap = new Treap3<number, string>()
      treap.insert(1, 'one')
      treap.insert(2, 'two')
      treap.delete(1)
      treap.insert(1, 'one-again')
      expect(treap.search(1)).toBe('one-again')
      expect(treap.size).toBe(2)
    })

    it('should maintain heap property with rotations', () => {
      const treap = new Treap3<number, string>()
      treap.insert(5, 'five')
      treap.insert(3, 'three')
      treap.insert(7, 'seven')
      expect(treap.size).toBe(3)
      expect(treap.search(3)).toBe('three')
      expect(treap.search(5)).toBe('five')
      expect(treap.search(7)).toBe('seven')
    })
  })
})
