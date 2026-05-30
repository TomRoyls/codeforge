import { describe, expect, it } from 'vitest'
import { LinkedList } from '../../../src/utils/linked-list.js'

describe('LinkedList', () => {
  describe('append', () => {
    it('should append element to empty list', () => {
      const list = new LinkedList<number>()
      list.append(1)
      expect(list.size).toBe(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('should append multiple elements', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.size).toBe(3)
      expect(list.first).toBe(1)
      expect(list.last).toBe(3)
    })

    it('should append strings', () => {
      const list = new LinkedList<string>()
      list.append('a')
      list.append('b')
      expect(list.size).toBe(2)
      expect(list.first).toBe('a')
      expect(list.last).toBe('b')
    })

    it('should append objects', () => {
      const list = new LinkedList<{ id: number }>()
      list.append({ id: 1 })
      list.append({ id: 2 })
      expect(list.size).toBe(2)
      expect(list.first).toEqual({ id: 1 })
    })
  })

  describe('prepend', () => {
    it('should prepend element to empty list', () => {
      const list = new LinkedList<number>()
      list.prepend(1)
      expect(list.size).toBe(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })

    it('should prepend multiple elements', () => {
      const list = new LinkedList<number>()
      list.append(2)
      list.append(3)
      list.prepend(1)
      expect(list.size).toBe(3)
      expect(list.first).toBe(1)
      expect(list.last).toBe(3)
    })

    it('should maintain order after multiple prepends', () => {
      const list = new LinkedList<number>()
      list.prepend(3)
      list.prepend(2)
      list.prepend(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('insertAt', () => {
    it('should insert at beginning', () => {
      const list = new LinkedList<number>()
      list.append(2)
      list.append(3)
      list.insertAt(0, 1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert at end', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.insertAt(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in middle', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(3)
      list.insertAt(1, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should not insert at negative index', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.insertAt(-1, 2)
      expect(list.size).toBe(1)
    })

    it('should not insert at index greater than size', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.insertAt(5, 2)
      expect(list.size).toBe(1)
    })

    it('should insert at index equal to size', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.insertAt(1, 2)
      expect(list.size).toBe(2)
      expect(list.last).toBe(2)
    })
  })

  describe('removeAt', () => {
    it('should remove from beginning', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const result = list.removeAt(0)
      expect(result).toBe(1)
      expect(list.size).toBe(2)
      expect(list.first).toBe(2)
    })

    it('should remove from end', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const result = list.removeAt(2)
      expect(result).toBe(3)
      expect(list.size).toBe(2)
      expect(list.last).toBe(2)
    })

    it('should remove from middle', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const result = list.removeAt(1)
      expect(result).toBe(2)
      expect(list.size).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should return undefined for invalid index', () => {
      const list = new LinkedList<number>()
      list.append(1)
      const result = list.removeAt(5)
      expect(result).toBeUndefined()
      expect(list.size).toBe(1)
    })

    it('should return undefined for negative index', () => {
      const list = new LinkedList<number>()
      list.append(1)
      const result = list.removeAt(-1)
      expect(result).toBeUndefined()
    })

    it('should remove from single element list', () => {
      const list = new LinkedList<number>()
      list.append(1)
      const result = list.removeAt(0)
      expect(result).toBe(1)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove existing value', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const result = list.remove(2)
      expect(result).toBe(true)
      expect(list.size).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should remove first occurrence of duplicate value', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(2)
      list.append(3)
      const result = list.remove(2)
      expect(result).toBe(true)
      expect(list.size).toBe(3)
      expect(list.get(1)).toBe(2)
    })

    it('should return false for non-existent value', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      const result = list.remove(3)
      expect(result).toBe(false)
      expect(list.size).toBe(2)
    })

    it('should remove from single element list', () => {
      const list = new LinkedList<number>()
      list.append(1)
      const result = list.remove(1)
      expect(result).toBe(true)
      expect(list.size).toBe(0)
    })
  })

  describe('get', () => {
    it('should get element at valid index', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
    })

    it('should return undefined for invalid index', () => {
      const list = new LinkedList<number>()
      list.append(1)
      expect(list.get(5)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      const list = new LinkedList<number>()
      list.append(1)
      expect(list.get(-1)).toBeUndefined()
    })

    it('should return undefined for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.get(0)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    it('should return index of existing value', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.indexOf(2)).toBe(1)
    })

    it('should return index of first occurrence', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(2)
      expect(list.indexOf(2)).toBe(1)
    })

    it('should return -1 for non-existent value', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.indexOf(3)).toBe(-1)
    })

    it('should return -1 for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.indexOf(1)).toBe(-1)
    })
  })

  describe('contains', () => {
    it('should return true for existing value', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.contains(2)).toBe(true)
    })

    it('should return false for non-existent value', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.contains(3)).toBe(false)
    })

    it('should return false for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.contains(1)).toBe(false)
    })
  })

  describe('first getter', () => {
    it('should return first element', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.first).toBe(1)
    })

    it('should return undefined for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.first).toBeUndefined()
    })
  })

  describe('last getter', () => {
    it('should return last element', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      expect(list.last).toBe(2)
    })

    it('should return undefined for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.last).toBeUndefined()
    })

    it('should return same as first for single element', () => {
      const list = new LinkedList<number>()
      list.append(1)
      expect(list.first).toBe(1)
      expect(list.last).toBe(1)
    })
  })

  describe('size getter', () => {
    it('should return 0 for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.size).toBe(0)
    })

    it('should return correct size after additions', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.size).toBe(3)
    })

    it('should return correct size after removals', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.removeAt(0)
      expect(list.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.isEmpty()).toBe(true)
    })

    it('should return false for non-empty list', () => {
      const list = new LinkedList<number>()
      list.append(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should clear empty list', () => {
      const list = new LinkedList<number>()
      list.clear()
      expect(list.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.clear()
      list.append(2)
      expect(list.size).toBe(1)
      expect(list.first).toBe(2)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new LinkedList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('should return array with all elements', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should return copy not affected by modifications', () => {
      const list = new LinkedList<number>()
      list.append(1)
      const arr = list.toArray()
      list.append(2)
      expect(arr).toEqual([1])
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const result: number[] = []
      list.forEach((value) => result.push(value))
      expect(result).toEqual([1, 2, 3])
    })

    it('should pass index to callback', () => {
      const list = new LinkedList<number>()
      list.append(10)
      list.append(20)
      const result: number[] = []
      list.forEach((value, index) => result.push(value + index))
      expect(result).toEqual([10, 21])
    })

    it('should not iterate over empty list', () => {
      const list = new LinkedList<number>()
      const result: number[] = []
      list.forEach((value) => result.push(value))
      expect(result).toEqual([])
    })
  })

  describe('reverse', () => {
    it('should reverse empty list', () => {
      const list = new LinkedList<number>()
      list.reverse()
      expect(list.toArray()).toEqual([])
    })

    it('should reverse single element list', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.reverse()
      expect(list.toArray()).toEqual([1])
    })

    it('should reverse multiple elements', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('should maintain size after reverse', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      list.reverse()
      expect(list.size).toBe(3)
    })

    it('should reverse twice to get original', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const original = list.toArray()
      list.reverse()
      list.reverse()
      expect(list.toArray()).toEqual(original)
    })
  })

  describe('iterator', () => {
    it('should iterate using for...of', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      const result: number[] = []
      for (const item of list) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('should spread to array', () => {
      const list = new LinkedList<number>()
      list.append(1)
      list.append(2)
      list.append(3)
      expect([...list]).toEqual([1, 2, 3])
    })

    it('should not iterate over empty list', () => {
      const list = new LinkedList<number>()
      const result: number[] = []
      for (const item of list) {
        result.push(item)
      }
      expect(result).toEqual([])
    })
  })
})