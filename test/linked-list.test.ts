import { describe, it, expect, beforeEach } from 'vitest'
import { LinkedList } from '../src/utils/linked-list.js'

describe('LinkedList', () => {
  let list: LinkedList<number>

  beforeEach(() => {
    list = new LinkedList<number>()
  })

  describe('append', () => {
    it('should add element to empty list', () => {
      list.append(1)
      expect(list.size).toBe(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('should add element to end of list', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.size).toBe(3)
      expect(list.first).toBe(1)
      expect(list.last).toBe(3)
    })

    it('should update tail correctly', () => {
      list.append(1)
      expect(list.last).toBe(1)
      list.append(2)
      expect(list.last).toBe(2)
      list.append(3)
      expect(list.last).toBe(3)
    })
  })

  describe('prepend', () => {
    it('should add element to empty list', () => {
      list.prepend(1)
      expect(list.size).toBe(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('should add element to beginning of list', () => {
      list.append(1)
      list.append(2)
      list.prepend(0)
      expect(list.size).toBe(3)
      expect(list.first).toBe(0)
      expect(list.toArray()).toEqual([0, 1, 2])
    })

    it('should update head correctly', () => {
      list.prepend(1)
      expect(list.first).toBe(1)
      list.prepend(2)
      expect(list.first).toBe(2)
      list.prepend(3)
      expect(list.first).toBe(3)
    })
  })

  describe('insertAt', () => {
    it('should insert at beginning (index 0)', () => {
      list.append(1)
      list.append(2)
      list.insertAt(0, 0)
      expect(list.toArray()).toEqual([0, 1, 2])
      expect(list.size).toBe(3)
    })

    it('should insert at end (index equals size)', () => {
      list.append(1)
      list.append(2)
      list.insertAt(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
      expect(list.size).toBe(3)
    })

    it('should insert in middle', () => {
      list.append(1)
      list.append(3)
      list.insertAt(1, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
      expect(list.size).toBe(3)
    })

    it('should do nothing for out-of-bounds index (negative)', () => {
      list.append(1)
      list.insertAt(-1, 2)
      expect(list.size).toBe(1)
      expect(list.toArray()).toEqual([1])
    })

    it('should do nothing for out-of-bounds index (too large)', () => {
      list.append(1)
      list.insertAt(5, 2)
      expect(list.size).toBe(1)
      expect(list.toArray()).toEqual([1])
    })

    it('should insert into empty list at index 0', () => {
      list.insertAt(0, 1)
      expect(list.size).toBe(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })
  })

  describe('removeAt', () => {
    beforeEach(() => {
      list.append(1)
      list.append(2)
      list.append(3)
    })

    it('should remove and return element at index', () => {
      const removed = list.removeAt(1)
      expect(removed).toBe(2)
      expect(list.size).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should remove first element', () => {
      const removed = list.removeAt(0)
      expect(removed).toBe(1)
      expect(list.size).toBe(2)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('should remove last element', () => {
      const removed = list.removeAt(2)
      expect(removed).toBe(3)
      expect(list.size).toBe(2)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should return undefined for out-of-bounds index (negative)', () => {
      const removed = list.removeAt(-1)
      expect(removed).toBeUndefined()
      expect(list.size).toBe(3)
    })

    it('should return undefined for out-of-bounds index (too large)', () => {
      const removed = list.removeAt(10)
      expect(removed).toBeUndefined()
      expect(list.size).toBe(3)
    })

    it('should return undefined for empty list', () => {
      const emptyList = new LinkedList<number>()
      const removed = emptyList.removeAt(0)
      expect(removed).toBeUndefined()
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      list.append(1)
      list.append(2)
      list.append(3)
    })

    it('should remove existing element and return true', () => {
      const removed = list.remove(2)
      expect(removed).toBe(true)
      expect(list.size).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should remove first occurrence', () => {
      list.append(2)
      const removed = list.remove(2)
      expect(removed).toBe(true)
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([1, 3, 2])
    })

    it('should return false for non-existent element', () => {
      const removed = list.remove(99)
      expect(removed).toBe(false)
      expect(list.size).toBe(3)
    })

    it('should return false for empty list', () => {
      const emptyList = new LinkedList<number>()
      const removed = emptyList.remove(1)
      expect(removed).toBe(false)
    })
  })

  describe('get', () => {
    beforeEach(() => {
      list.append(1)
      list.append(2)
      list.append(3)
    })

    it('should return element at index', () => {
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
    })

    it('should return undefined for out-of-bounds index (negative)', () => {
      expect(list.get(-1)).toBeUndefined()
    })

    it('should return undefined for out-of-bounds index (too large)', () => {
      expect(list.get(10)).toBeUndefined()
    })

    it('should return undefined for empty list', () => {
      const emptyList = new LinkedList<number>()
      expect(emptyList.get(0)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    beforeEach(() => {
      list.append(1)
      list.append(2)
      list.append(3)
    })

    it('should return index of element', () => {
      expect(list.indexOf(1)).toBe(0)
      expect(list.indexOf(2)).toBe(1)
      expect(list.indexOf(3)).toBe(2)
    })

    it('should return -1 for non-existent element', () => {
      expect(list.indexOf(99)).toBe(-1)
    })

    it('should return -1 for empty list', () => {
      const emptyList = new LinkedList<number>()
      expect(emptyList.indexOf(1)).toBe(-1)
    })
  })

  describe('contains', () => {
    beforeEach(() => {
      list.append(1)
      list.append(2)
      list.append(3)
    })

    it('should return true for existing element', () => {
      expect(list.contains(1)).toBe(true)
      expect(list.contains(2)).toBe(true)
      expect(list.contains(3)).toBe(true)
    })

    it('should return false for non-existent element', () => {
      expect(list.contains(99)).toBe(false)
    })

    it('should return false for empty list', () => {
      const emptyList = new LinkedList<number>()
      expect(emptyList.contains(1)).toBe(false)
    })
  })

  describe('first and last getters', () => {
    it('should return undefined for empty list', () => {
      expect(list.first).toBeUndefined()
      expect(list.last).toBeUndefined()
    })

    it('should return same element for single element list', () => {
      list.append(5)
      expect(list.first).toBe(5)
      expect(list.last).toBe(5)
    })

    it('should return first element', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.first).toBe(1)
    })

    it('should return last element', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.last).toBe(3)
    })
  })

  describe('size getter', () => {
    it('should return 0 for empty list', () => {
      expect(list.size).toBe(0)
    })

    it('should return correct size after operations', () => {
      expect(list.size).toBe(0)
      list.append(1)
      expect(list.size).toBe(1)
      list.append(2)
      expect(list.size).toBe(2)
      list.prepend(0)
      expect(list.size).toBe(3)
      list.removeAt(1)
      expect(list.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty list', () => {
      expect(list.isEmpty()).toBe(true)
    })

    it('should return false for non-empty list', () => {
      list.append(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      list.append(1)
      list.append(2)
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty list', () => {
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should clear non-empty list', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.first).toBeUndefined()
      expect(list.last).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return array of elements', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should return new array instance', () => {
      list.append(1)
      list.append(2)
      const arr1 = list.toArray()
      const arr2 = list.toArray()
      expect(arr1).not.toBe(arr2)
      expect(arr1).toEqual(arr2)
    })
  })

  describe('forEach', () => {
    beforeEach(() => {
      list.append(1)
      list.append(2)
      list.append(3)
    })

    it('should iterate over elements', () => {
      const values: number[] = []
      const indices: number[] = []
      list.forEach((value, index) => {
        values.push(value)
        indices.push(index)
      })
      expect(values).toEqual([1, 2, 3])
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle empty list', () => {
      const emptyList = new LinkedList<number>()
      let called = false
      emptyList.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('reverse', () => {
    it('should reverse elements in place', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      expect(list.toArray()).toEqual([3, 2, 1])
      expect(list.first).toBe(3)
      expect(list.last).toBe(1)
    })

    it('should handle empty list', () => {
      list.reverse()
      expect(list.size).toBe(0)
      expect(list.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      list.append(1)
      list.reverse()
      expect(list.toArray()).toEqual([1])
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('should handle even number of elements', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      list.reverse()
      expect(list.toArray()).toEqual([4, 3, 2, 1])
    })

    it('should mutate in place (not return new list)', () => {
      list.append(1)
      list.append(2)
      const result = list.reverse()
      expect(result).toBeUndefined()
      expect(list.toArray()).toEqual([2, 1])
    })
  })

  describe('iteration protocol (Symbol.iterator)', () => {
    beforeEach(() => {
      list.append(1)
      list.append(2)
      list.append(3)
    })

    it('should support for...of loop', () => {
      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }
      expect(values).toEqual([1, 2, 3])
    })

    it('should support spread operator', () => {
      const arr = [...list]
      expect(arr).toEqual([1, 2, 3])
    })

    it('should support Array.from', () => {
      const arr = Array.from(list)
      expect(arr).toEqual([1, 2, 3])
    })

    it('should handle empty list', () => {
      const emptyList = new LinkedList<number>()
      const values: number[] = []
      for (const value of emptyList) {
        values.push(value)
      }
      expect(values).toEqual([])
    })
  })

  describe('edge cases - single element', () => {
    beforeEach(() => {
      list.append(42)
    })

    it('should handle removeAt on single element', () => {
      const removed = list.removeAt(0)
      expect(removed).toBe(42)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should handle remove on single element', () => {
      const removed = list.remove(42)
      expect(removed).toBe(true)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should handle reverse on single element', () => {
      list.reverse()
      expect(list.toArray()).toEqual([42])
      expect(list.first).toBe(42)
      expect(list.last).toBe(42)
    })
  })

  describe('edge cases - empty list operations', () => {
    it('should safely call removeAt on empty list', () => {
      expect(list.removeAt(0)).toBeUndefined()
      expect(list.size).toBe(0)
    })

    it('should safely call remove on empty list', () => {
      expect(list.remove(1)).toBe(false)
      expect(list.size).toBe(0)
    })

    it('should safely call get on empty list', () => {
      expect(list.get(0)).toBeUndefined()
    })

    it('should safely call indexOf on empty list', () => {
      expect(list.indexOf(1)).toBe(-1)
    })

    it('should safely call contains on empty list', () => {
      expect(list.contains(1)).toBe(false)
    })

    it('should safely call forEach on empty list', () => {
      let called = false
      list.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('should safely call reverse on empty list', () => {
      list.reverse()
      expect(list.size).toBe(0)
    })

    it('should safely call toArray on empty list', () => {
      expect(list.toArray()).toEqual([])
    })
  })

  describe('complex operations', () => {
    it('should handle multiple insertions and removals', () => {
      list.append(1)
      list.append(2)
      list.prepend(0)
      list.insertAt(2, 1.5)
      list.removeAt(1)
      list.append(3)
      expect(list.toArray()).toEqual([0, 1.5, 2, 3])
      expect(list.size).toBe(4)
    })

    it('should handle reversal of reversed list', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      list.reverse()
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should maintain consistency after many operations', () => {
      for (let i = 0; i < 10; i++) {
        list.append(i)
      }
      expect(list.size).toBe(10)
      expect(list.first).toBe(0)
      expect(list.last).toBe(9)

      list.reverse()
      expect(list.first).toBe(9)
      expect(list.last).toBe(0)
      expect(list.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])

      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })
})