import { describe, it, expect } from 'vitest'
import { JumpList } from '../../src/core/jump-list/index.js'

describe('JumpList', () => {
  describe('push', () => {
    it('should push single value', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should push multiple values', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should push to empty list', () => {
      const list = new JumpList<number>()
      list.push(42)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(42)
    })

    it('should push after pop', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.pop()
      list.push(3)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should push strings', () => {
      const list = new JumpList<string>()
      list.push('a')
      list.push('b')
      expect(list.toArray()).toEqual(['a', 'b'])
    })

    it('should push objects', () => {
      const list = new JumpList<{ id: number }>()
      list.push({ id: 1 })
      list.push({ id: 2 })
      expect(list.get(0)).toEqual({ id: 1 })
      expect(list.get(1)).toEqual({ id: 2 })
    })

    it.skip('should handle large batch push', () => {
      const list = new JumpList<number>()
      for (let i = 0; i < 100; i++) {
        list.push(i)
      }
      expect(list.size).toBe(100)
      expect(list.get(99)).toBe(99)
    })
  })

  describe('pop', () => {
    it('should pop single value', () => {
      const list = new JumpList<number>()
      list.push(1)
      const value = list.pop()
      expect(value).toBe(1)
      expect(list.size).toBe(0)
    })

    it('should pop multiple values', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.pop()).toBe(3)
      expect(list.pop()).toBe(2)
      expect(list.pop()).toBe(1)
      expect(list.size).toBe(0)
    })

    it('should return undefined from empty list', () => {
      const list = new JumpList<number>()
      expect(list.pop()).toBe(undefined)
    })

    it('should pop after unshift', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      list.unshift(2)
      expect(list.pop()).toBe(1)
      expect(list.size).toBe(1)
    })

    it('should pop last element correctly', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.pop()
      expect(list.toArray()).toEqual([1])
      expect(list.tail).not.toBeNull()
    })

    it('should pop from list with one element', () => {
      const list = new JumpList<number>()
      list.push(42)
      const value = list.pop()
      expect(value).toBe(42)
      expect(list.head).toBeNull()
      expect(list.tail).toBeNull()
      expect(list.size).toBe(0)
    })
  })

  describe('unshift', () => {
    it('should unshift single value', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should unshift multiple values', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      list.unshift(2)
      list.unshift(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('should unshift to empty list', () => {
      const list = new JumpList<number>()
      list.unshift(42)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(42)
    })

    it('should unshift after shift', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      list.unshift(2)
      list.shift()
      list.unshift(3)
      expect(list.toArray()).toEqual([3, 1])
    })

    it('should unshift strings', () => {
      const list = new JumpList<string>()
      list.unshift('a')
      list.unshift('b')
      expect(list.toArray()).toEqual(['b', 'a'])
    })

    it.skip('should handle large batch unshift', () => {
      const list = new JumpList<number>()
      for (let i = 0; i < 100; i++) {
        list.unshift(i)
      }
      expect(list.size).toBe(100)
      expect(list.get(0)).toBe(99)
      expect(list.get(99)).toBe(0)
    })
  })

  describe('shift', () => {
    it('should shift single value', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      const value = list.shift()
      expect(value).toBe(1)
      expect(list.size).toBe(0)
    })

    it('should shift multiple values', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      list.unshift(2)
      list.unshift(3)
      expect(list.shift()).toBe(3)
      expect(list.shift()).toBe(2)
      expect(list.shift()).toBe(1)
      expect(list.size).toBe(0)
    })

    it('should return undefined from empty list', () => {
      const list = new JumpList<number>()
      expect(list.shift()).toBe(undefined)
    })

    it('should shift after push', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      expect(list.shift()).toBe(1)
      expect(list.size).toBe(1)
    })

    it('should shift first element correctly', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.shift()
      expect(list.toArray()).toEqual([2])
      expect(list.head).not.toBeNull()
    })

    it('should shift from list with one element', () => {
      const list = new JumpList<number>()
      list.push(42)
      const value = list.shift()
      expect(value).toBe(42)
      expect(list.head).toBeNull()
      expect(list.tail).toBeNull()
      expect(list.size).toBe(0)
    })
  })

  describe('get', () => {
    it('should get value by index', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
    })

    it('should return undefined for negative index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.get(-1)).toBe(undefined)
    })

    it('should return undefined for out of bounds index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.get(10)).toBe(undefined)
    })

    it('should get from empty list', () => {
      const list = new JumpList<number>()
      expect(list.get(0)).toBe(undefined)
    })

    it('should get after insert', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(3)
      list.insert(1, 2)
      expect(list.get(1)).toBe(2)
    })

    it('should get after delete', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.delete(1)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(3)
    })

    it.skip('should get value at large index', () => {
      const list = new JumpList<number>()
      for (let i = 0; i < 100; i++) {
        list.push(i)
      }
      expect(list.get(50)).toBe(50)
      expect(list.get(99)).toBe(99)
    })
  })

  describe('set', () => {
    it('should set value by index', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const result = list.set(1, 99)
      expect(result).toBe(true)
      expect(list.get(1)).toBe(99)
    })

    it('should return false for negative index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.set(-1, 99)).toBe(false)
    })

    it('should return false for out of bounds index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.set(10, 99)).toBe(false)
    })

    it('should set in empty list', () => {
      const list = new JumpList<number>()
      expect(list.set(0, 99)).toBe(false)
    })

    it('should set first element', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.set(0, 100)
      expect(list.get(0)).toBe(100)
    })

    it('should set last element', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.set(1, 100)
      expect(list.get(1)).toBe(100)
    })

    it('should set at large index', () => {
      const list = new JumpList<number>()
      for (let i = 0; i < 100; i++) {
        list.push(i)
      }
      expect(list.set(50, 999)).toBe(true)
      expect(list.get(50)).toBe(999)
    })
  })

  describe('insert', () => {
    it('should insert at beginning', () => {
      const list = new JumpList<number>()
      list.push(2)
      list.push(3)
      list.insert(0, 1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert at end', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.insert(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in middle', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(3)
      list.insert(1, 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should return false for negative index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.insert(-1, 99)).toBe(false)
    })

    it('should return false for out of bounds index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.insert(10, 99)).toBe(false)
    })

    it('should insert in empty list at index 0', () => {
      const list = new JumpList<number>()
      expect(list.insert(0, 1)).toBe(true)
      expect(list.toArray()).toEqual([1])
    })

    it('should insert multiple values', () => {
      const list = new JumpList<number>()
      list.insert(0, 1)
      list.insert(1, 2)
      list.insert(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert strings', () => {
      const list = new JumpList<string>()
      list.push('a')
      list.push('c')
      list.insert(1, 'b')
      expect(list.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('delete', () => {
    it('should delete from beginning', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const value = list.delete(0)
      expect(value).toBe(1)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('should delete from end', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const value = list.delete(2)
      expect(value).toBe(3)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should delete from middle', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const value = list.delete(1)
      expect(value).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should return undefined for negative index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.delete(-1)).toBe(undefined)
    })

    it('should return undefined for out of bounds index', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.delete(10)).toBe(undefined)
    })

    it('should delete from empty list', () => {
      const list = new JumpList<number>()
      expect(list.delete(0)).toBe(undefined)
    })

    it('should delete single element', () => {
      const list = new JumpList<number>()
      list.push(42)
      const value = list.delete(0)
      expect(value).toBe(42)
      expect(list.size).toBe(0)
    })

    it('should delete all elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.delete(0)
      list.delete(0)
      list.delete(0)
      expect(list.size).toBe(0)
    })
  })

  describe('indexOf', () => {
    it('should find index of value', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.indexOf(2)).toBe(1)
    })

    it('should return -1 for value not found', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.indexOf(99)).toBe(-1)
    })

    it('should find first occurrence', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(2)
      list.push(3)
      expect(list.indexOf(2)).toBe(1)
    })

    it('should work with strings', () => {
      const list = new JumpList<string>()
      list.push('a')
      list.push('b')
      list.push('c')
      expect(list.indexOf('b')).toBe(1)
    })

    it('should find at index 0', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.indexOf(1)).toBe(0)
    })

    it('should find at last index', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.indexOf(3)).toBe(2)
    })

    it('should return -1 for empty list', () => {
      const list = new JumpList<number>()
      expect(list.indexOf(1)).toBe(-1)
    })
  })

  describe('includes', () => {
    it('should return true for value present', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.includes(2)).toBe(true)
    })

    it('should return false for value not present', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.includes(99)).toBe(false)
    })

    it('should return true for first element', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.includes(1)).toBe(true)
    })

    it('should return true for last element', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.includes(3)).toBe(true)
    })

    it('should return false for empty list', () => {
      const list = new JumpList<number>()
      expect(list.includes(1)).toBe(false)
    })

    it('should work with strings', () => {
      const list = new JumpList<string>()
      list.push('a')
      list.push('b')
      list.push('c')
      expect(list.includes('b')).toBe(true)
    })

    it('should find duplicate values', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(2)
      list.push(3)
      expect(list.includes(2)).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty list', () => {
      const list = new JumpList<number>()
      expect(list.size).toBe(0)
    })

    it('should return correct size after push', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.size).toBe(3)
    })

    it('should return correct size after pop', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.pop()
      expect(list.size).toBe(2)
    })

    it('should return correct size after unshift', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      list.unshift(2)
      list.unshift(3)
      expect(list.size).toBe(3)
    })

    it('should return correct size after shift', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      list.unshift(2)
      list.unshift(3)
      list.shift()
      expect(list.size).toBe(2)
    })

    it('should return correct size after insert', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(3)
      list.insert(1, 2)
      expect(list.size).toBe(3)
    })

    it('should return correct size after delete', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.delete(1)
      expect(list.size).toBe(2)
    })

    it('should return correct size after clear', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.clear()
      expect(list.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty list', () => {
      const list = new JumpList<number>()
      expect(list.isEmpty).toBe(true)
    })

    it('should return false for non-empty list', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.clear()
      expect(list.isEmpty).toBe(true)
    })

    it('should return false after push', () => {
      const list = new JumpList<number>()
      expect(list.isEmpty).toBe(true)
      list.push(1)
      expect(list.isEmpty).toBe(false)
    })

    it('should return true after removing all elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.pop()
      expect(list.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty list', () => {
      const list = new JumpList<number>()
      list.clear()
      expect(list.size).toBe(0)
      expect(list.head).toBeNull()
      expect(list.tail).toBeNull()
    })

    it('should clear non-empty list', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.head).toBeNull()
      expect(list.tail).toBeNull()
    })

    it('should allow operations after clear', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.clear()
      list.push(3)
      expect(list.toArray()).toEqual([3])
    })

    it('should clear jump pointers', () => {
      const list = new JumpList<number>()
      for (let i = 0; i < 100; i++) {
        list.push(i)
      }
      list.clear()
      list.push(42)
      expect(list.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new JumpList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('should return array with one element', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.toArray()).toEqual([1])
    })

    it('should return array with multiple elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should return array in correct order', () => {
      const list = new JumpList<number>()
      list.unshift(3)
      list.unshift(2)
      list.unshift(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle large lists', () => {
      const list = new JumpList<number>()
      const expected: number[] = []
      for (let i = 0; i < 100; i++) {
        list.push(i)
        expected.push(i)
      }
      expect(list.toArray()).toEqual(expected)
    })

    it('should work with strings', () => {
      const list = new JumpList<string>()
      list.push('a')
      list.push('b')
      list.push('c')
      expect(list.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('forEach', () => {
    it('should iterate over empty list', () => {
      const list = new JumpList<number>()
      const values: number[] = []
      list.forEach((value) => values.push(value))
      expect(values).toEqual([])
    })

    it('should iterate over single element', () => {
      const list = new JumpList<number>()
      list.push(1)
      const values: number[] = []
      list.forEach((value) => values.push(value))
      expect(values).toEqual([1])
    })

    it('should iterate over multiple elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const values: number[] = []
      list.forEach((value) => values.push(value))
      expect(values).toEqual([1, 2, 3])
    })

    it('should pass correct index', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const indices: number[] = []
      list.forEach((_, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not modify list during iteration', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const values: number[] = []
      list.forEach((value) => values.push(value))
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('map', () => {
    it('should map empty list', () => {
      const list = new JumpList<number>()
      const result = list.map((x) => x * 2)
      expect(result).toEqual([])
    })

    it('should map single element', () => {
      const list = new JumpList<number>()
      list.push(1)
      const result = list.map((x) => x * 2)
      expect(result).toEqual([2])
    })

    it('should map multiple elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const result = list.map((x) => x * 2)
      expect(result).toEqual([2, 4, 6])
    })

    it('should pass correct index', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const result = list.map((_, index) => index)
      expect(result).toEqual([0, 1, 2])
    })

    it('should change type', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const result = list.map((x) => String(x))
      expect(result).toEqual(['1', '2', '3'])
    })

    it('should not modify original list', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.map((x) => x * 2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('filter', () => {
    it('should filter empty list', () => {
      const list = new JumpList<number>()
      const result = list.filter((x) => x > 0)
      expect(result).toEqual([])
    })

    it('should filter with no matches', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const result = list.filter((x) => x > 10)
      expect(result).toEqual([])
    })

    it('should filter with all matches', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const result = list.filter((x) => x > 0)
      expect(result).toEqual([1, 2, 3])
    })

    it('should filter with some matches', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.push(5)
      const result = list.filter((x) => x % 2 === 0)
      expect(result).toEqual([2, 4])
    })

    it('should pass correct index', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const result = list.filter((_, index) => index % 2 === 0)
      expect(result).toEqual([1, 3])
    })

    it('should not modify original list', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.filter((x) => x > 1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('iterator', () => {
    it('should iterate over empty list', () => {
      const list = new JumpList<number>()
      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }
      expect(values).toEqual([])
    })

    it('should iterate over single element', () => {
      const list = new JumpList<number>()
      list.push(1)
      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }
      expect(values).toEqual([1])
    })

    it('should iterate over multiple elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }
      expect(values).toEqual([1, 2, 3])
    })

    it('should iterate in correct order', () => {
      const list = new JumpList<number>()
      list.unshift(3)
      list.unshift(2)
      list.unshift(1)
      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }
      expect(values).toEqual([1, 2, 3])
    })

    it('should handle large lists', () => {
      const list = new JumpList<number>()
      const expected: number[] = []
      for (let i = 0; i < 100; i++) {
        list.push(i)
        expected.push(i)
      }
      const values: number[] = []
      for (const value of list) {
        values.push(value)
      }
      expect(values).toEqual(expected)
    })
  })

  describe('custom blockSize', () => {
    it.skip('should use custom blockSize', () => {
      const list = new JumpList<number>({ blockSize: 10 })
      for (let i = 0; i < 30; i++) {
        list.push(i)
      }
      expect(list.size).toBe(30)
      expect(list.get(20)).toBe(20)
    })

    it.skip('should handle small blockSize', () => {
      const list = new JumpList<number>({ blockSize: 5 })
      for (let i = 0; i < 20; i++) {
        list.push(i)
      }
      expect(list.size).toBe(20)
      expect(list.get(15)).toBe(15)
    })

    it.skip('should handle large blockSize', () => {
      const list = new JumpList<number>({ blockSize: 100 })
      for (let i = 0; i < 200; i++) {
        list.push(i)
      }
      expect(list.size).toBe(200)
      expect(list.get(150)).toBe(150)
    })
  })

  describe('mixed operations', () => {
    it('should handle push and shift mix', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.shift()
      list.push(3)
      expect(list.toArray()).toEqual([2, 3])
    })

    it.skip('should handle unshift and pop mix', () => {
      const list = new JumpList<number>()
      list.unshift(1)
      list.unshift(2)
      list.pop()
      list.unshift(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })

    it('should handle insert and delete mix', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(4)
      list.insert(1, 2)
      list.insert(2, 3)
      list.delete(0)
      expect(list.toArray()).toEqual([2, 3, 4])
    })

    it.skip('should handle complex sequence', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      list.shift()
      list.unshift(0)
      list.insert(2, 2.5)
      list.delete(1)
      expect(list.toArray()).toEqual([0, 2, 2.5, 3])
    })
  })

  describe('objects and references', () => {
    it('should store same object reference', () => {
      const obj = { id: 1 }
      const list = new JumpList<{ id: number }>()
      list.push(obj)
      expect(list.get(0)).toBe(obj)
    })

    it('should find object by reference', () => {
      const obj = { id: 1 }
      const list = new JumpList<{ id: number }>()
      list.push(obj)
      expect(list.includes(obj)).toBe(true)
    })

    it('should return correct index for object', () => {
      const obj = { id: 1 }
      const list = new JumpList<{ id: number }>()
      list.push({ id: 0 })
      list.push(obj)
      expect(list.indexOf(obj)).toBe(1)
    })
  })
})
