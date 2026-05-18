import { describe, it, expect, beforeEach } from 'vitest'
import { UnrolledLinkedList } from '../../src/core/unrolled-linked-list/index.js'

describe('UnrolledLinkedList', () => {
  let list: UnrolledLinkedList<number>

  beforeEach(() => {
    list = new UnrolledLinkedList<number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty list with default block size', () => {
      const l = new UnrolledLinkedList<string>()
      expect(l.size).toBe(0)
      expect(l.isEmpty).toBe(true)
    })

    it('should accept a custom block size', () => {
      const l = new UnrolledLinkedList<number>(4)
      expect(l.size).toBe(0)
    })

    it('should work with small block size of 1', () => {
      const l = new UnrolledLinkedList<number>(1)
      l.append(1)
      l.append(2)
      l.append(3)
      expect(l.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── append ───

  describe('append', () => {
    it('should append a single element', () => {
      list.append(1)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should append multiple elements', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle appending beyond one block', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 0; i < 8; i++) {
        l.append(i)
      }
      expect(l.size).toBe(8)
      expect(l.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle duplicate values', () => {
      list.append(1)
      list.append(1)
      list.append(1)
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([1, 1, 1])
    })

    it('should handle negative numbers', () => {
      list.append(-1)
      list.append(-5)
      expect(list.toArray()).toEqual([-1, -5])
    })
  })

  // ─── prepend ───

  describe('prepend', () => {
    it('should prepend to empty list', () => {
      list.prepend(1)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should prepend elements in correct order', () => {
      list.prepend(3)
      list.prepend(2)
      list.prepend(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle prepend beyond one block', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 7; i >= 0; i--) {
        l.prepend(i)
      }
      expect(l.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })
  })

  // ─── get ───

  describe('get', () => {
    it('should return undefined for empty list', () => {
      expect(list.get(0)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      list.append(1)
      expect(list.get(-1)).toBeUndefined()
    })

    it('should return undefined for out-of-bounds index', () => {
      list.append(1)
      expect(list.get(1)).toBeUndefined()
    })

    it('should return element at valid index', () => {
      list.append(10)
      list.append(20)
      list.append(30)
      expect(list.get(0)).toBe(10)
      expect(list.get(1)).toBe(20)
      expect(list.get(2)).toBe(30)
    })

    it('should access elements across multiple blocks', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 0; i < 12; i++) {
        l.append(i)
      }
      expect(l.get(0)).toBe(0)
      expect(l.get(4)).toBe(4)
      expect(l.get(8)).toBe(8)
      expect(l.get(11)).toBe(11)
    })
  })

  // ─── set ───

  describe('set', () => {
    it('should set value at valid index', () => {
      list.append(1)
      list.append(2)
      expect(list.set(1, 99)).toBe(true)
      expect(list.get(1)).toBe(99)
    })

    it('should return false for negative index', () => {
      list.append(1)
      expect(list.set(-1, 99)).toBe(false)
    })

    it('should return false for out-of-bounds index', () => {
      list.append(1)
      expect(list.set(5, 99)).toBe(false)
    })

    it('should return false for empty list', () => {
      expect(list.set(0, 99)).toBe(false)
    })

    it('should set values across multiple blocks', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 0; i < 8; i++) {
        l.append(i)
      }
      expect(l.set(5, 999)).toBe(true)
      expect(l.get(5)).toBe(999)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert at beginning', () => {
      list.append(2)
      list.append(3)
      expect(list.insert(0, 1)).toBe(true)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert at end', () => {
      list.append(1)
      list.append(2)
      expect(list.insert(2, 3)).toBe(true)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in middle', () => {
      list.append(1)
      list.append(3)
      expect(list.insert(1, 2)).toBe(true)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should return false for negative index', () => {
      list.append(1)
      expect(list.insert(-1, 99)).toBe(false)
    })

    it('should return false for index beyond size', () => {
      list.append(1)
      expect(list.insert(2, 99)).toBe(false)
    })

    it('should insert into empty list at index 0', () => {
      expect(list.insert(0, 1)).toBe(true)
      expect(list.toArray()).toEqual([1])
    })

    it('should handle many insertions with small block size', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 0; i < 10; i++) {
        l.append(i)
      }
      expect(l.insert(5, 999)).toBe(true)
      expect(l.size).toBe(11)
      expect(l.get(5)).toBe(999)
      expect(l.get(6)).toBe(5)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('should return undefined for empty list', () => {
      expect(list.remove(0)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      list.append(1)
      expect(list.remove(-1)).toBeUndefined()
    })

    it('should return undefined for out-of-bounds index', () => {
      list.append(1)
      expect(list.remove(5)).toBeUndefined()
    })

    it('should remove from beginning', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.remove(0)).toBe(1)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('should remove from end', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.remove(2)).toBe(3)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should remove from middle', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.remove(1)).toBe(2)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should decrement size after removal', () => {
      list.append(1)
      list.append(2)
      list.remove(0)
      expect(list.size).toBe(1)
    })

    it('should handle removing all elements', () => {
      list.append(1)
      list.append(2)
      list.remove(0)
      list.remove(0)
      expect(list.isEmpty).toBe(true)
      expect(list.size).toBe(0)
    })

    it('should handle remove with small block size', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 0; i < 8; i++) {
        l.append(i)
      }
      expect(l.remove(4)).toBe(4)
      expect(l.size).toBe(7)
      expect(l.get(4)).toBe(5)
    })
  })

  // ─── indexOf ───

  describe('indexOf', () => {
    it('should return -1 for empty list', () => {
      expect(list.indexOf(1)).toBe(-1)
    })

    it('should return index of existing element', () => {
      list.append(10)
      list.append(20)
      list.append(30)
      expect(list.indexOf(20)).toBe(1)
    })

    it('should return -1 for missing element', () => {
      list.append(1)
      list.append(2)
      expect(list.indexOf(99)).toBe(-1)
    })

    it('should return first occurrence of duplicates', () => {
      list.append(1)
      list.append(2)
      list.append(1)
      expect(list.indexOf(1)).toBe(0)
    })
  })

  // ─── contains ───

  describe('contains', () => {
    it('should return false for empty list', () => {
      expect(list.contains(1)).toBe(false)
    })

    it('should return true for existing element', () => {
      list.append(42)
      expect(list.contains(42)).toBe(true)
    })

    it('should return false for missing element', () => {
      list.append(1)
      expect(list.contains(2)).toBe(false)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear all elements', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('should allow operations after clear', () => {
      list.append(1)
      list.clear()
      list.append(2)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(2)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the list', () => {
      list.append(1)
      list.append(2)
      list.toArray()
      expect(list.size).toBe(2)
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('should not call callback for empty list', () => {
      const items: number[] = []
      list.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('should iterate all elements with correct indices', () => {
      list.append(10)
      list.append(20)
      list.append(30)
      const items: [number, number][] = []
      list.forEach((item, index) => items.push([item, index]))
      expect(items).toEqual([[10, 0], [20, 1], [30, 2]])
    })
  })

  // ─── iterator ───

  describe('Symbol.iterator', () => {
    it('should return empty iterator for empty list', () => {
      expect([...list]).toEqual([])
    })

    it('should iterate all elements in order', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect([...list]).toEqual([1, 2, 3])
    })

    it('should work with for-of loop', () => {
      list.append(10)
      list.append(20)
      const sum: number[] = []
      for (const item of list) {
        sum.push(item)
      }
      expect(sum).toEqual([10, 20])
    })
  })

  // ─── size and isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size across mixed operations', () => {
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
      list.append(1)
      expect(list.size).toBe(1)
      expect(list.isEmpty).toBe(false)
      list.prepend(0)
      expect(list.size).toBe(2)
      list.remove(0)
      expect(list.size).toBe(1)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle append and prepend interleaved', () => {
      list.append(2)
      list.prepend(1)
      list.append(3)
      list.prepend(0)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle string values', () => {
      const l = new UnrolledLinkedList<string>(4)
      l.append('a')
      l.append('b')
      l.append('c')
      expect(l.toArray()).toEqual(['a', 'b', 'c'])
      expect(l.indexOf('b')).toBe(1)
      expect(l.contains('c')).toBe(true)
    })

    it('should handle object values by reference', () => {
      const l = new UnrolledLinkedList<{ id: number }>(4)
      const obj = { id: 1 }
      l.append(obj)
      expect(l.contains(obj)).toBe(true)
      expect(l.indexOf(obj)).toBe(0)
    })

    it('should handle zero as value', () => {
      list.append(0)
      expect(list.get(0)).toBe(0)
      expect(list.contains(0)).toBe(true)
      expect(list.indexOf(0)).toBe(0)
    })

    it('should handle undefined indexOf for list with values', () => {
      list.append(1)
      expect(list.indexOf(undefined as unknown as number)).toBe(-1)
    })

    it('should handle block splitting on many appends', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 0; i < 20; i++) {
        l.append(i)
      }
      expect(l.size).toBe(20)
      const arr = l.toArray()
      for (let i = 0; i < 20; i++) {
        expect(arr[i]).toBe(i)
        expect(l.get(i)).toBe(i)
      }
    })

    it('should handle block splitting on many prepends', () => {
      const l = new UnrolledLinkedList<number>(4)
      for (let i = 19; i >= 0; i--) {
        l.prepend(i)
      }
      expect(l.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(l.get(i)).toBe(i)
      }
    })
  })
})
