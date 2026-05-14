import { describe, it, expect } from 'vitest'
import { Pagoda } from '../src/core/pagoda/index.js'

describe('Pagoda', () => {
  describe('constructor', () => {
    it('should create empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(pagoda.size).toBe(0)
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should use default comparator for numbers', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      expect(pagoda.peek()).toBe(3)
    })

    it('should accept custom comparator', () => {
      const pagoda = new Pagoda<number>({ comparator: (a, b) => b - a })
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      expect(pagoda.peek()).toBe(3)
    })

    it('should work with strings using default comparator', () => {
      const pagoda = new Pagoda<string>()
      pagoda.insert('zebra')
      pagoda.insert('apple')
      pagoda.insert('banana')
      expect(pagoda.peek()).toBe('apple')
    })
  })

  describe('insert', () => {
    it('should insert single element', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      expect(pagoda.size).toBe(1)
      expect(pagoda.isEmpty).toBe(false)
    })

    it('should insert multiple elements in sorted order', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      expect(pagoda.toArray()).toEqual([3, 5, 7])
    })

    it('should maintain min on insert', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      expect(pagoda.peek()).toBe(5)
      pagoda.insert(3)
      expect(pagoda.peek()).toBe(3)
      pagoda.insert(7)
      expect(pagoda.peek()).toBe(3)
      pagoda.insert(1)
      expect(pagoda.peek()).toBe(1)
    })

    it('should handle negative values', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(-5)
      pagoda.insert(-10)
      pagoda.insert(3)
      expect(pagoda.toArray()).toEqual([-10, -5, 3])
    })

    it('should handle zero', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(0)
      expect(pagoda.peek()).toBe(0)
    })

    it('should handle duplicate values', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(5)
      pagoda.insert(5)
      expect(pagoda.size).toBe(3)
      expect(pagoda.toArray()).toEqual([5, 5, 5])
    })

    it('should handle floating point values', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(3.14)
      pagoda.insert(2.71)
      pagoda.insert(1.41)
      expect(pagoda.toArray()).toEqual([1.41, 2.71, 3.14])
    })

    it('should insert at correct position', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(10)
      pagoda.insert(5)
      pagoda.insert(15)
      pagoda.insert(7)
      expect(pagoda.toArray()).toEqual([5, 7, 10, 15])
    })

    it('should handle large number of inserts', () => {
      const pagoda = new Pagoda<number>()
      for (let i = 100; i >= 1; i--) {
        pagoda.insert(i)
      }
      expect(pagoda.size).toBe(100)
      expect(pagoda.peek()).toBe(1)
    })
  })

  describe('extractMin', () => {
    it('should throw on empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(() => pagoda.extractMin()).toThrow('Pagoda is empty')
    })

    it('should extract single element', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(10)
      const result = pagoda.extractMin()
      expect(result).toBe(10)
      expect(pagoda.size).toBe(0)
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should extract min from two elements', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      expect(pagoda.extractMin()).toBe(3)
      expect(pagoda.extractMin()).toBe(5)
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should extract in sorted order', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      pagoda.insert(1)
      pagoda.insert(4)
      expect(pagoda.extractMin()).toBe(1)
      expect(pagoda.extractMin()).toBe(3)
      expect(pagoda.extractMin()).toBe(4)
      expect(pagoda.extractMin()).toBe(5)
      expect(pagoda.extractMin()).toBe(7)
    })

    it('should update size after extraction', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      pagoda.extractMin()
      expect(pagoda.size).toBe(2)
      pagoda.extractMin()
      expect(pagoda.size).toBe(1)
    })

    it('should handle extract after many inserts', () => {
      const pagoda = new Pagoda<number>()
      for (let i = 50; i >= 1; i--) {
        pagoda.insert(i)
      }
      for (let i = 1; i <= 50; i++) {
        expect(pagoda.extractMin()).toBe(i)
      }
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should handle alternating insert and extract', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      expect(pagoda.extractMin()).toBe(3)
      pagoda.insert(1)
      expect(pagoda.extractMin()).toBe(1)
      expect(pagoda.extractMin()).toBe(5)
    })

    it('should handle duplicate values extraction', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(1)
      pagoda.insert(1)
      expect(pagoda.extractMin()).toBe(1)
      expect(pagoda.extractMin()).toBe(1)
      expect(pagoda.extractMin()).toBe(1)
    })
  })

  describe('peek', () => {
    it('should throw on empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(() => pagoda.peek()).toThrow('Pagoda is empty')
    })

    it('should return min without removing', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      expect(pagoda.peek()).toBe(3)
      expect(pagoda.size).toBe(3)
      expect(pagoda.peek()).toBe(3)
    })

    it('should update after insert', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(10)
      expect(pagoda.peek()).toBe(10)
      pagoda.insert(5)
      expect(pagoda.peek()).toBe(5)
    })

    it('should update after extractMin', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      expect(pagoda.peek()).toBe(1)
      pagoda.extractMin()
      expect(pagoda.peek()).toBe(2)
    })
  })

  describe('size getter', () => {
    it('should return 0 on empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(pagoda.size).toBe(0)
    })

    it('should return 1 after single insert', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      expect(pagoda.size).toBe(1)
    })

    it('should return correct size after multiple inserts', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      expect(pagoda.size).toBe(3)
    })

    it('should decrease after extractMin', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.extractMin()
      expect(pagoda.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.clear()
      expect(pagoda.size).toBe(0)
    })
  })

  describe('isEmpty getter', () => {
    it('should return true on new pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      expect(pagoda.isEmpty).toBe(false)
    })

    it('should return true after all elements extracted', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.extractMin()
      pagoda.extractMin()
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.clear()
      expect(pagoda.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty non-empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      pagoda.clear()
      expect(pagoda.size).toBe(0)
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should clear pagoda with one element', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.clear()
      expect(pagoda.size).toBe(0)
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should allow reuse after clear', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.clear()
      pagoda.insert(5)
      expect(pagoda.size).toBe(1)
      expect(pagoda.peek()).toBe(5)
    })

    it('should handle clear on already empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      pagoda.clear()
      expect(pagoda.size).toBe(0)
      expect(pagoda.isEmpty).toBe(true)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty pagodas', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.insert(5)
      pagoda1.insert(10)
      pagoda2.insert(3)
      pagoda2.insert(7)
      pagoda1.merge(pagoda2)
      expect(pagoda1.toArray()).toEqual([3, 5, 7, 10])
    })

    it('should merge empty with non-empty', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda2.insert(1)
      pagoda1.merge(pagoda2)
      expect(pagoda1.toArray()).toEqual([1])
    })

    it('should merge non-empty with empty', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.insert(1)
      pagoda1.merge(pagoda2)
      expect(pagoda1.toArray()).toEqual([1])
    })

    it('should merge two empty pagodas', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.merge(pagoda2)
      expect(pagoda1.size).toBe(0)
      expect(pagoda1.isEmpty).toBe(true)
    })

    it('should not merge with itself', () => {
      const pagoda1 = new Pagoda<number>()
      pagoda1.insert(1)
      pagoda1.insert(2)
      pagoda1.merge(pagoda1)
      expect(pagoda1.size).toBe(2)
      expect(pagoda1.toArray()).toEqual([1, 2])
    })

    it('should extract in order after merge', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.insert(5)
      pagoda1.insert(1)
      pagoda2.insert(3)
      pagoda2.insert(2)
      pagoda2.insert(4)
      pagoda1.merge(pagoda2)
      expect(pagoda1.extractMin()).toBe(1)
      expect(pagoda1.extractMin()).toBe(2)
      expect(pagoda1.extractMin()).toBe(3)
      expect(pagoda1.extractMin()).toBe(4)
      expect(pagoda1.extractMin()).toBe(5)
    })

    it('should clear other pagoda after merge', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.insert(1)
      pagoda2.insert(2)
      pagoda1.merge(pagoda2)
      expect(pagoda2.size).toBe(0)
      expect(pagoda2.isEmpty).toBe(true)
    })

    it('should merge with duplicate values', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.insert(1)
      pagoda1.insert(3)
      pagoda2.insert(2)
      pagoda2.insert(3)
      pagoda1.merge(pagoda2)
      expect(pagoda1.toArray()).toEqual([1, 2, 3, 3])
    })

    it('should handle merge with custom comparator', () => {
      const pagoda1 = new Pagoda<number>({ comparator: (a, b) => b - a })
      const pagoda2 = new Pagoda<number>({ comparator: (a, b) => b - a })
      pagoda1.insert(5)
      pagoda1.insert(3)
      pagoda2.insert(4)
      pagoda2.insert(6)
      pagoda1.merge(pagoda2)
      expect(pagoda1.toArray()).toEqual([6, 5, 4, 3])
    })
  })

  describe('static merge', () => {
    it('should merge two pagodas into new pagoda', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.insert(5)
      pagoda1.insert(1)
      pagoda2.insert(3)
      pagoda2.insert(2)
      const merged = Pagoda.merge(pagoda1, pagoda2)
      expect(merged.toArray()).toEqual([1, 2, 3, 5])
    })

    it('should not modify original pagodas during static merge', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      pagoda1.insert(5)
      pagoda1.insert(1)
      pagoda2.insert(3)
      pagoda2.insert(2)
      const size1 = pagoda1.size
      const size2 = pagoda2.size
      Pagoda.merge(pagoda1, pagoda2)
      expect(pagoda1.size).toBe(size1)
      expect(pagoda2.size).toBe(size2)
    })

    it('should merge empty pagodas', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      const merged = Pagoda.merge(pagoda1, pagoda2)
      expect(merged.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(pagoda.toArray()).toEqual([])
    })

    it('should return all elements in sorted order', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      expect(pagoda.toArray()).toEqual([1, 2, 3])
    })

    it('should return elements sorted regardless of insertion order', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      pagoda.insert(1)
      expect(pagoda.toArray()).toEqual([1, 3, 5, 7])
    })

    it('should not modify original pagoda', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      const arr = pagoda.toArray()
      arr[0] = 999
      expect(pagoda.peek()).toBe(3)
    })

    it('should return correct count after operations', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      pagoda.extractMin()
      expect(pagoda.toArray().length).toBe(2)
    })
  })

  describe('toSortedArray', () => {
    it('should return empty array for empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(pagoda.toSortedArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      pagoda.insert(1)
      const arr = pagoda.toSortedArray()
      expect(arr).toEqual([1, 3, 5, 7])
    })

    it('should not modify original pagoda', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      pagoda.toSortedArray()
      expect(pagoda.size).toBe(3)
      expect(pagoda.peek()).toBe(3)
    })

    it('should handle duplicate values', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(5)
      pagoda.insert(3)
      const arr = pagoda.toSortedArray()
      expect(arr).toEqual([3, 3, 5, 5])
    })
  })

  describe('contains', () => {
    it('should return false on empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      expect(pagoda.contains(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      expect(pagoda.contains(5)).toBe(true)
      expect(pagoda.contains(3)).toBe(true)
      expect(pagoda.contains(7)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.insert(7)
      expect(pagoda.contains(1)).toBe(false)
      expect(pagoda.contains(10)).toBe(false)
    })

    it('should find values after multiple inserts', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(3)
      pagoda.insert(1)
      pagoda.insert(4)
      expect(pagoda.contains(3)).toBe(true)
      expect(pagoda.contains(1)).toBe(true)
      expect(pagoda.contains(4)).toBe(true)
      expect(pagoda.contains(2)).toBe(false)
    })

    it('should handle duplicate values', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(5)
      expect(pagoda.contains(5)).toBe(true)
    })

    it('should find value after extractMin', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      pagoda.extractMin()
      expect(pagoda.contains(2)).toBe(true)
      expect(pagoda.contains(1)).toBe(false)
    })

    it('should return false after clear', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.clear()
      expect(pagoda.contains(5)).toBe(false)
    })

    it('should find value at beginning', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(5)
      pagoda.insert(10)
      expect(pagoda.contains(1)).toBe(true)
    })

    it('should find value at end', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(5)
      pagoda.insert(10)
      expect(pagoda.contains(10)).toBe(true)
    })

    it('should find value in middle', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(5)
      pagoda.insert(10)
      expect(pagoda.contains(5)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should clone empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      const cloned = pagoda.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('should clone pagoda with elements', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      const cloned = pagoda.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.extractMin()).toBe(1)
      expect(cloned.extractMin()).toBe(2)
      expect(cloned.extractMin()).toBe(3)
    })

    it('should not modify original when clone is modified', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      const cloned = pagoda.clone()
      cloned.insert(3)
      expect(pagoda.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('should not modify clone when original is modified', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      const cloned = pagoda.clone()
      pagoda.insert(3)
      expect(cloned.size).toBe(2)
      expect(pagoda.size).toBe(3)
    })

    it('should clone with same comparator', () => {
      const pagoda = new Pagoda<number>({ comparator: (a, b) => b - a })
      pagoda.insert(1)
      pagoda.insert(3)
      const cloned = pagoda.clone()
      cloned.insert(2)
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('static fromArray', () => {
    it('should create pagoda from array', () => {
      const pagoda = Pagoda.fromArray([5, 3, 7, 1, 4])
      expect(pagoda.size).toBe(5)
      expect(pagoda.toArray()).toEqual([1, 3, 4, 5, 7])
    })

    it('should create empty pagoda from empty array', () => {
      const pagoda = Pagoda.fromArray([])
      expect(pagoda.size).toBe(0)
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should create pagoda from single element array', () => {
      const pagoda = Pagoda.fromArray([42])
      expect(pagoda.size).toBe(1)
      expect(pagoda.peek()).toBe(42)
    })

    it('should extract in sorted order', () => {
      const pagoda = Pagoda.fromArray([5, 3, 7, 1, 4, 6, 2, 8])
      expect(pagoda.extractMin()).toBe(1)
      expect(pagoda.extractMin()).toBe(2)
      expect(pagoda.extractMin()).toBe(3)
      expect(pagoda.extractMin()).toBe(4)
      expect(pagoda.extractMin()).toBe(5)
      expect(pagoda.extractMin()).toBe(6)
      expect(pagoda.extractMin()).toBe(7)
      expect(pagoda.extractMin()).toBe(8)
    })

    it('should accept custom comparator', () => {
      const pagoda = Pagoda.fromArray([5, 3, 7], { comparator: (a, b) => b - a })
      expect(pagoda.peek()).toBe(7)
    })

    it('should handle array with duplicates', () => {
      const pagoda = Pagoda.fromArray([5, 3, 5, 1, 3])
      expect(pagoda.toArray()).toEqual([1, 3, 3, 5, 5])
    })
  })

  describe('forEach', () => {
    it('should iterate over empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      let count = 0
      pagoda.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate over all elements', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      const values: number[] = []
      pagoda.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('should not modify pagoda', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      pagoda.forEach(() => {})
      expect(pagoda.size).toBe(3)
    })

    it('should allow callback to access element properties', () => {
      const pagoda = new Pagoda<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      pagoda.insert({ id: 2 })
      pagoda.insert({ id: 1 })
      pagoda.insert({ id: 3 })
      const ids: number[] = []
      pagoda.forEach((v) => ids.push(v.id))
      expect(ids).toEqual([1, 2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty pagoda', () => {
      const pagoda = new Pagoda<number>()
      const values = [...pagoda]
      expect(values).toEqual([])
    })

    it('should iterate over all elements', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      const values = [...pagoda]
      expect(values).toEqual([1, 2, 3])
    })

    it('should work with for-of loop', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      const values: number[] = []
      for (const value of pagoda) {
        values.push(value)
      }
      expect(values).toEqual([1, 2, 3])
    })

    it('should allow multiple iterations', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      const values1 = [...pagoda]
      const values2 = [...pagoda]
      expect(values1).toEqual([1, 2])
      expect(values2).toEqual([1, 2])
    })

    it('should work with array destructuring', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(1)
      pagoda.insert(2)
      pagoda.insert(3)
      const [first, second, third] = pagoda
      expect(first).toBe(1)
      expect(second).toBe(2)
      expect(third).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle string values', () => {
      const pagoda = new Pagoda<string>()
      pagoda.insert('banana')
      pagoda.insert('apple')
      pagoda.insert('cherry')
      expect(pagoda.extractMin()).toBe('apple')
      expect(pagoda.extractMin()).toBe('banana')
      expect(pagoda.extractMin()).toBe('cherry')
    })

    it('should handle object values with comparator', () => {
      const pagoda = new Pagoda<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
      })
      pagoda.insert({ id: 3 })
      pagoda.insert({ id: 1 })
      pagoda.insert({ id: 2 })
      expect(pagoda.extractMin()!.id).toBe(1)
      expect(pagoda.extractMin()!.id).toBe(2)
      expect(pagoda.extractMin()!.id).toBe(3)
    })

    it('should handle negative values extraction', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(-3)
      pagoda.insert(-1)
      pagoda.insert(-5)
      expect(pagoda.extractMin()).toBe(-5)
      expect(pagoda.extractMin()).toBe(-3)
      expect(pagoda.extractMin()).toBe(-1)
    })

    it('should handle large range of values', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(-100)
      pagoda.insert(0)
      pagoda.insert(100)
      expect(pagoda.extractMin()).toBe(-100)
      expect(pagoda.extractMin()).toBe(0)
      expect(pagoda.extractMin()).toBe(100)
    })

    it('should handle interleaved operations', () => {
      const pagoda = new Pagoda<number>()
      pagoda.insert(5)
      pagoda.insert(3)
      pagoda.extractMin()
      pagoda.insert(1)
      pagoda.insert(7)
      expect(pagoda.extractMin()).toBe(1)
      expect(pagoda.extractMin()).toBe(5)
      expect(pagoda.extractMin()).toBe(7)
    })

    it('should handle reverse comparator throughout operations', () => {
      const pagoda = new Pagoda<number>({ comparator: (a, b) => b - a })
      pagoda.insert(1)
      pagoda.insert(3)
      pagoda.insert(2)
      expect(pagoda.peek()).toBe(3)
      expect(pagoda.extractMin()).toBe(3)
      expect(pagoda.extractMin()).toBe(2)
      expect(pagoda.extractMin()).toBe(1)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      const pagoda = new Pagoda<number>()
      for (let i = 1000; i >= 1; i--) {
        pagoda.insert(i)
      }
      expect(pagoda.size).toBe(1000)
      for (let i = 1; i <= 1000; i++) {
        expect(pagoda.extractMin()).toBe(i)
      }
      expect(pagoda.isEmpty).toBe(true)
    })

    it('should handle 1000 random elements', () => {
      const pagoda = new Pagoda<number>()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        pagoda.insert(v)
      }
      values.sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(pagoda.extractMin()).toBe(values[i])
      }
    })

    it('should handle bulk insert via fromArray', () => {
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        values.push(i)
      }
      const pagoda = Pagoda.fromArray(values)
      expect(pagoda.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(pagoda.extractMin()).toBe(i)
      }
    })

    it('should handle multiple merges', () => {
      const pagoda1 = new Pagoda<number>()
      const pagoda2 = new Pagoda<number>()
      const pagoda3 = new Pagoda<number>()
      for (let i = 1; i <= 100; i++) pagoda1.insert(i)
      for (let i = 101; i <= 200; i++) pagoda2.insert(i)
      for (let i = 201; i <= 300; i++) pagoda3.insert(i)
      pagoda1.merge(pagoda2)
      pagoda1.merge(pagoda3)
      expect(pagoda1.size).toBe(300)
      for (let i = 1; i <= 300; i++) {
        expect(pagoda1.extractMin()).toBe(i)
      }
    })
  })
})