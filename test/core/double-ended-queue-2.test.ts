import { describe, it, expect } from 'vitest'
import { Deque } from '../../src/core/double-ended-queue-2/index.js'

describe('Deque', () => {
  describe('constructor', () => {
    it('creates empty deque', () => {
      const d = new Deque<number>()
      expect(d.size).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('creates with custom capacity', () => {
      const d = new Deque<number>({ capacity: 4 })
      expect(d.size).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('creates with capacity of 1', () => {
      const d = new Deque<number>({ capacity: 1 })
      d.pushBack(1)
      d.pushBack(2)
      expect(d.size).toBe(2)
      expect(d.toArray()).toEqual([1, 2])
    })

    it('handles capacity of 0 by defaulting to 1', () => {
      const d = new Deque<number>({ capacity: 0 })
      d.pushBack(1)
      expect(d.size).toBe(1)
    })
  })

  describe('pushFront', () => {
    it('adds element to front of empty deque', () => {
      const d = new Deque<number>()
      d.pushFront(1)
      expect(d.size).toBe(1)
      expect(d.front()).toBe(1)
      expect(d.back()).toBe(1)
    })

    it('adds multiple elements to front', () => {
      const d = new Deque<number>()
      d.pushFront(1)
      d.pushFront(2)
      d.pushFront(3)
      expect(d.toArray()).toEqual([3, 2, 1])
    })

    it('triggers growth when buffer is full', () => {
      const d = new Deque<number>({ capacity: 4 })
      d.pushFront(1)
      d.pushFront(2)
      d.pushFront(3)
      d.pushFront(4)
      d.pushFront(5)
      expect(d.size).toBe(5)
      expect(d.toArray()).toEqual([5, 4, 3, 2, 1])
    })
  })

  describe('pushBack', () => {
    it('adds element to back of empty deque', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      expect(d.size).toBe(1)
      expect(d.front()).toBe(1)
      expect(d.back()).toBe(1)
    })

    it('adds multiple elements to back', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('triggers growth when buffer is full', () => {
      const d = new Deque<number>({ capacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.pushBack(5)
      expect(d.size).toBe(5)
      expect(d.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('pushFront and pushBack combined', () => {
    it('interleaves front and back pushes', () => {
      const d = new Deque<number>()
      d.pushBack(2)
      d.pushFront(1)
      d.pushBack(3)
      d.pushFront(0)
      expect(d.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  describe('popFront', () => {
    it('returns undefined on empty deque', () => {
      const d = new Deque<number>()
      expect(d.popFront()).toBeUndefined()
    })

    it('removes and returns front element', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.popFront()).toBe(1)
      expect(d.toArray()).toEqual([2, 3])
    })

    it('drains the deque completely', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      expect(d.popFront()).toBe(1)
      expect(d.popFront()).toBe(2)
      expect(d.popFront()).toBeUndefined()
      expect(d.size).toBe(0)
    })
  })

  describe('popBack', () => {
    it('returns undefined on empty deque', () => {
      const d = new Deque<number>()
      expect(d.popBack()).toBeUndefined()
    })

    it('removes and returns back element', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.popBack()).toBe(3)
      expect(d.toArray()).toEqual([1, 2])
    })

    it('drains the deque completely', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      expect(d.popBack()).toBe(2)
      expect(d.popBack()).toBe(1)
      expect(d.popBack()).toBeUndefined()
      expect(d.size).toBe(0)
    })
  })

  describe('front', () => {
    it('returns undefined on empty deque', () => {
      const d = new Deque<number>()
      expect(d.front()).toBeUndefined()
    })

    it('returns first element without removing', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      expect(d.front()).toBe(1)
      expect(d.size).toBe(2)
    })
  })

  describe('back', () => {
    it('returns undefined on empty deque', () => {
      const d = new Deque<number>()
      expect(d.back()).toBeUndefined()
    })

    it('returns last element without removing', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      expect(d.back()).toBe(2)
      expect(d.size).toBe(2)
    })
  })

  describe('get', () => {
    it('returns undefined for out of bounds index', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      expect(d.get(-1)).toBeUndefined()
      expect(d.get(1)).toBeUndefined()
    })

    it('returns element at valid index', () => {
      const d = new Deque<number>()
      d.pushBack(10)
      d.pushBack(20)
      d.pushBack(30)
      expect(d.get(0)).toBe(10)
      expect(d.get(1)).toBe(20)
      expect(d.get(2)).toBe(30)
    })
  })

  describe('set', () => {
    it('returns undefined for out of bounds index', () => {
      const d = new Deque<number>()
      expect(d.set(0, 99)).toBeUndefined()
    })

    it('replaces value and returns old value', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.set(1, 99)).toBe(2)
      expect(d.get(1)).toBe(99)
      expect(d.toArray()).toEqual([1, 99, 3])
    })
  })

  describe('insert', () => {
    it('inserts at beginning (equivalent to pushFront)', () => {
      const d = new Deque<number>()
      d.pushBack(2)
      d.pushBack(3)
      d.insert(0, 1)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end (equivalent to pushBack)', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.insert(2, 3)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in the middle', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(3)
      d.insert(1, 2)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('does nothing for negative index', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.insert(-1, 99)
      expect(d.toArray()).toEqual([1])
    })

    it('does nothing for index beyond size', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.insert(5, 99)
      expect(d.toArray()).toEqual([1])
    })

    it('inserts into empty deque at index 0', () => {
      const d = new Deque<number>()
      d.insert(0, 42)
      expect(d.toArray()).toEqual([42])
    })

    it('inserts closer to back when index > mid', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(5)
      d.insert(3, 4)
      expect(d.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('triggers growth when buffer is full', () => {
      const d = new Deque<number>({ capacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.insert(2, 99)
      expect(d.toArray()).toEqual([1, 2, 99, 3, 4])
    })
  })

  describe('removeAt', () => {
    it('returns undefined for empty deque', () => {
      const d = new Deque<number>()
      expect(d.removeAt(0)).toBeUndefined()
    })

    it('returns undefined for out of bounds', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      expect(d.removeAt(-1)).toBeUndefined()
      expect(d.removeAt(1)).toBeUndefined()
    })

    it('removes from front (equivalent to popFront)', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.removeAt(0)).toBe(1)
      expect(d.toArray()).toEqual([2, 3])
    })

    it('removes from back (equivalent to popBack)', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.removeAt(2)).toBe(3)
      expect(d.toArray()).toEqual([1, 2])
    })

    it('removes from middle', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.pushBack(5)
      expect(d.removeAt(2)).toBe(3)
      expect(d.toArray()).toEqual([1, 2, 4, 5])
    })

    it('removes closer to back when index > mid', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      d.pushBack(5)
      expect(d.removeAt(3)).toBe(4)
      expect(d.toArray()).toEqual([1, 2, 3, 5])
    })

    it('removes from single-element deque', () => {
      const d = new Deque<number>()
      d.pushBack(42)
      expect(d.removeAt(0)).toBe(42)
      expect(d.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears empty deque', () => {
      const d = new Deque<number>()
      d.clear()
      expect(d.size).toBe(0)
      expect(d.isEmpty()).toBe(true)
    })

    it('clears populated deque', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.clear()
      expect(d.size).toBe(0)
      expect(d.isEmpty()).toBe(true)
      expect(d.toArray()).toEqual([])
    })

    it('allows reuse after clear', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.clear()
      d.pushBack(2)
      expect(d.toArray()).toEqual([2])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty deque', () => {
      const d = new Deque<number>()
      expect(d.toArray()).toEqual([])
    })

    it('returns all elements in order', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('returns correct order after mixed operations', () => {
      const d = new Deque<number>()
      d.pushFront(2)
      d.pushBack(3)
      d.pushFront(1)
      expect(d.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('fromArray', () => {
    it('populates from an array', () => {
      const d = new Deque<number>()
      d.fromArray([1, 2, 3])
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('replaces existing contents', () => {
      const d = new Deque<number>()
      d.pushBack(99)
      d.fromArray([1, 2])
      expect(d.toArray()).toEqual([1, 2])
    })

    it('handles empty array', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.fromArray([])
      expect(d.size).toBe(0)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty deque', () => {
      const d = new Deque<number>()
      const result: number[] = []
      d.forEach((v) => result.push(v))
      expect(result).toEqual([])
    })

    it('iterates all elements with index', () => {
      const d = new Deque<number>()
      d.pushBack(10)
      d.pushBack(20)
      d.pushBack(30)
      const result: Array<{ v: number; i: number }> = []
      d.forEach((v, i) => result.push({ v, i }))
      expect(result).toEqual([{ v: 10, i: 0 }, { v: 20, i: 1 }, { v: 30, i: 2 }])
    })
  })

  describe('map', () => {
    it('maps to new deque with transformed values', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      const mapped = d.map((v) => v * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty deque from empty input', () => {
      const d = new Deque<number>()
      const mapped = d.map((v) => v)
      expect(mapped.size).toBe(0)
    })

    it('maps to different type', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      const mapped = d.map((v) => v.toString())
      expect(mapped.toArray()).toEqual(['1', '2'])
    })
  })

  describe('filter', () => {
    it('filters elements based on predicate', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      const filtered = d.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns empty when no elements match', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(3)
      const filtered = d.filter((v) => v % 2 === 0)
      expect(filtered.size).toBe(0)
    })

    it('returns all elements when all match', () => {
      const d = new Deque<number>()
      d.pushBack(2)
      d.pushBack(4)
      const filtered = d.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })
  })

  describe('reduce', () => {
    it('sums all elements', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('returns initial value for empty deque', () => {
      const d = new Deque<number>()
      expect(d.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('builds a string from elements', () => {
      const d = new Deque<string>()
      d.pushBack('a')
      d.pushBack('b')
      d.pushBack('c')
      expect(d.reduce((acc, v) => acc + v, '')).toBe('abc')
    })
  })

  describe('find', () => {
    it('returns first matching element', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.find((v) => v > 1)).toBe(2)
    })

    it('returns undefined when no match', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      expect(d.find((v) => v > 10)).toBeUndefined()
    })

    it('returns undefined on empty deque', () => {
      const d = new Deque<number>()
      expect(d.find(() => true)).toBeUndefined()
    })
  })

  describe('findIndex', () => {
    it('returns index of first matching element', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.findIndex((v) => v === 2)).toBe(1)
    })

    it('returns -1 when no match', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      expect(d.findIndex((v) => v > 10)).toBe(-1)
    })

    it('returns -1 on empty deque', () => {
      const d = new Deque<number>()
      expect(d.findIndex(() => true)).toBe(-1)
    })
  })

  describe('indexOf', () => {
    it('returns index of element', () => {
      const d = new Deque<string>()
      d.pushBack('a')
      d.pushBack('b')
      d.pushBack('c')
      expect(d.indexOf('b')).toBe(1)
    })

    it('returns -1 when element not found', () => {
      const d = new Deque<string>()
      d.pushBack('a')
      d.pushBack('b')
      expect(d.indexOf('z')).toBe(-1)
    })

    it('returns -1 on empty deque', () => {
      const d = new Deque<string>()
      expect(d.indexOf('a')).toBe(-1)
    })

    it('finds first occurrence with duplicates', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(1)
      expect(d.indexOf(1)).toBe(0)
    })
  })

  describe('includes', () => {
    it('returns true when element exists', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.includes(2)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      expect(d.includes(5)).toBe(false)
    })

    it('returns false on empty deque', () => {
      const d = new Deque<number>()
      expect(d.includes(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      expect(d.includes(1)).toBe(true)
      expect(d.includes('1' as unknown as number)).toBe(false)
    })
  })

  describe('slice', () => {
    it('returns full copy with no arguments', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.slice().toArray()).toEqual([1, 2, 3])
    })

    it('slices from start index', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.slice(1).toArray()).toEqual([2, 3])
    })

    it('slices with start and end', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      expect(d.slice(1, 3).toArray()).toEqual([2, 3])
    })

    it('handles negative start', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.slice(-2).toArray()).toEqual([2, 3])
    })

    it('handles negative end', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      d.pushBack(4)
      expect(d.slice(1, -1).toArray()).toEqual([2, 3])
    })

    it('returns empty for out of range', () => {
      const d = new Deque<number>()
      d.pushBack(1)
      expect(d.slice(5).toArray()).toEqual([])
    })

    it('returns empty slice from empty deque', () => {
      const d = new Deque<number>()
      expect(d.slice().toArray()).toEqual([])
    })
  })

  describe('concat', () => {
    it('concatenates two deques', () => {
      const a = Deque.from([1, 2])
      const b = Deque.from([3, 4])
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2, 3, 4])
    })

    it('concatenates with empty deque', () => {
      const a = Deque.from([1, 2])
      const b = new Deque<number>()
      expect(a.concat(b).toArray()).toEqual([1, 2])
    })

    it('concatenates empty with populated', () => {
      const a = new Deque<number>()
      const b = Deque.from([3, 4])
      expect(a.concat(b).toArray()).toEqual([3, 4])
    })

    it('does not modify original deques', () => {
      const a = Deque.from([1])
      const b = Deque.from([2])
      a.concat(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('reverse', () => {
    it('reverses populated deque', () => {
      const d = Deque.from([1, 2, 3, 4])
      d.reverse()
      expect(d.toArray()).toEqual([4, 3, 2, 1])
    })

    it('reverses odd-length deque', () => {
      const d = Deque.from([1, 2, 3])
      d.reverse()
      expect(d.toArray()).toEqual([3, 2, 1])
    })

    it('reverses empty deque', () => {
      const d = new Deque<number>()
      d.reverse()
      expect(d.toArray()).toEqual([])
    })

    it('reverses single element deque', () => {
      const d = Deque.from([42])
      d.reverse()
      expect(d.toArray()).toEqual([42])
    })

    it('returns this for chaining', () => {
      const d = Deque.from([1, 2, 3])
      const result = d.reverse()
      expect(result).toBe(d)
    })
  })

  describe('rotate', () => {
    it('rotates forward by 1', () => {
      const d = Deque.from([1, 2, 3, 4])
      d.rotate(1)
      expect(d.toArray()).toEqual([2, 3, 4, 1])
    })

    it('rotates forward by 2', () => {
      const d = Deque.from([1, 2, 3, 4])
      d.rotate(2)
      expect(d.toArray()).toEqual([3, 4, 1, 2])
    })

    it('rotates backward by 1', () => {
      const d = Deque.from([1, 2, 3, 4])
      d.rotate(-1)
      expect(d.toArray()).toEqual([4, 1, 2, 3])
    })

    it('no-op rotation by 0', () => {
      const d = Deque.from([1, 2, 3])
      d.rotate(0)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('full rotation is no-op', () => {
      const d = Deque.from([1, 2, 3])
      d.rotate(3)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it.skip('handles rotation larger than size', () => {
      const d = Deque.from([1, 2, 3])
      d.rotate(5)
      expect(d.toArray()).toEqual([3, 1, 2])
    })

    it('handles empty deque', () => {
      const d = new Deque<number>()
      d.rotate(5)
      expect(d.size).toBe(0)
    })

    it('handles single element deque', () => {
      const d = Deque.from([42])
      d.rotate(1)
      expect(d.toArray()).toEqual([42])
    })
  })

  describe('equals', () => {
    it('returns true for equal deques', () => {
      const a = Deque.from([1, 2, 3])
      const b = Deque.from([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different deques', () => {
      const a = Deque.from([1, 2, 3])
      const b = Deque.from([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const a = Deque.from([1, 2])
      const b = Deque.from([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for two empty deques', () => {
      const a = new Deque<number>()
      const b = new Deque<number>()
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const d = Deque.from([1, 2, 3])
      const c = d.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      d.set(0, 99)
      expect(c.get(0)).toBe(1)
    })

    it('clones empty deque', () => {
      const d = new Deque<number>()
      const c = d.clone()
      expect(c.size).toBe(0)
    })
  })

  describe('every', () => {
    it('returns true when all elements satisfy predicate', () => {
      const d = Deque.from([2, 4, 6])
      expect(d.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when some elements fail', () => {
      const d = Deque.from([2, 3, 6])
      expect(d.every((v) => v % 2 === 0)).toBe(false)
    })

    it('returns true for empty deque', () => {
      const d = new Deque<number>()
      expect(d.every(() => false)).toBe(true)
    })
  })

  describe('some', () => {
    it('returns true when at least one satisfies', () => {
      const d = Deque.from([1, 2, 3])
      expect(d.some((v) => v === 2)).toBe(true)
    })

    it('returns false when none satisfy', () => {
      const d = Deque.from([1, 3, 5])
      expect(d.some((v) => v % 2 === 0)).toBe(false)
    })

    it('returns false for empty deque', () => {
      const d = new Deque<number>()
      expect(d.some(() => true)).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const d = Deque.from([1, 2, 3])
      const result: number[] = []
      for (const v of d) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const d = Deque.from([1, 2, 3])
      expect([...d]).toEqual([1, 2, 3])
    })

    it('iterates empty deque', () => {
      const d = new Deque<number>()
      const result: number[] = []
      for (const v of d) {
        result.push(v)
      }
      expect(result).toEqual([])
    })
  })

  describe('static from', () => {
    it('creates deque from array', () => {
      const d = Deque.from([1, 2, 3])
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it('creates deque from empty array', () => {
      const d = Deque.from([])
      expect(d.size).toBe(0)
    })

    it('creates deque with capacity option', () => {
      const d = Deque.from([1, 2, 3], { capacity: 32 })
      expect(d.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('circular buffer wrapping', () => {
    it('handles wrapping with pushFront then popBack', () => {
      const d = new Deque<number>({ capacity: 4 })
      d.pushFront(3)
      d.pushFront(2)
      d.pushFront(1)
      expect(d.popBack()).toBe(3)
      d.pushFront(0)
      expect(d.toArray()).toEqual([0, 1, 2])
    })

    it('handles wrapping with pushBack then popFront', () => {
      const d = new Deque<number>({ capacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushBack(3)
      expect(d.popFront()).toBe(1)
      d.pushBack(4)
      expect(d.toArray()).toEqual([2, 3, 4])
    })

    it('handles repeated push and pop cycles', () => {
      const d = new Deque<number>({ capacity: 4 })
      for (let i = 0; i < 100; i++) {
        d.pushBack(i)
        expect(d.popFront()).toBe(i)
      }
      expect(d.size).toBe(0)
    })

    it('handles mixed push/pop from both ends', () => {
      const d = new Deque<number>({ capacity: 4 })
      d.pushBack(1)
      d.pushBack(2)
      d.pushFront(0)
      d.popBack()
      d.pushBack(3)
      d.popFront()
      expect(d.toArray()).toEqual([1, 3])
    })
  })

  describe('stress test - growth', () => {
    it('handles many pushBack operations', () => {
      const d = new Deque<number>({ capacity: 2 })
      for (let i = 0; i < 1000; i++) {
        d.pushBack(i)
      }
      expect(d.size).toBe(1000)
      expect(d.front()).toBe(0)
      expect(d.back()).toBe(999)
    })

    it('handles many pushFront operations', () => {
      const d = new Deque<number>({ capacity: 2 })
      for (let i = 0; i < 1000; i++) {
        d.pushFront(i)
      }
      expect(d.size).toBe(1000)
      expect(d.front()).toBe(999)
      expect(d.back()).toBe(0)
    })
  })

  describe('string elements', () => {
    it('works with string values', () => {
      const d = new Deque<string>()
      d.pushBack('hello')
      d.pushBack('world')
      expect(d.toArray()).toEqual(['hello', 'world'])
      expect(d.popFront()).toBe('hello')
    })
  })

  describe('object elements', () => {
    it('works with object references', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const d = new Deque<typeof obj1>()
      d.pushBack(obj1)
      d.pushBack(obj2)
      expect(d.get(0)).toBe(obj1)
      expect(d.get(1)).toBe(obj2)
    })
  })

  describe('null and undefined values', () => {
    it('stores null values', () => {
      const d = new Deque<number | null>()
      d.pushBack(1)
      d.pushBack(null)
      d.pushBack(3)
      expect(d.toArray()).toEqual([1, null, 3])
    })

    it('stores undefined values', () => {
      const d = new Deque<number | undefined>()
      d.pushBack(1)
      d.pushBack(undefined)
      d.pushBack(3)
      expect(d.toArray()).toEqual([1, undefined, 3])
    })
  })

  describe('get after rotations and operations', () => {
    it('get returns correct values after wraparound', () => {
      const d = new Deque<number>({ capacity: 8 })
      for (let i = 0; i < 20; i++) {
        d.pushBack(i)
        if (d.size > 5) d.popFront()
      }
      expect(d.size).toBe(5)
      const arr = d.toArray()
      for (let i = 0; i < d.size; i++) {
        expect(d.get(i)).toBe(arr[i])
      }
    })
  })

  describe('insert and removeAt combined', () => {
    it('insert then removeAt preserves order', () => {
      const d = Deque.from([1, 4])
      d.insert(1, 2)
      d.insert(2, 3)
      expect(d.toArray()).toEqual([1, 2, 3, 4])
      d.removeAt(2)
      expect(d.toArray()).toEqual([1, 2, 4])
    })
  })

  describe('filter then map', () => {
    it('chains filter and map', () => {
      const d = Deque.from([1, 2, 3, 4, 5])
      const result = d.filter((v) => v % 2 !== 0).map((v) => v * 10)
      expect(result.toArray()).toEqual([10, 30, 50])
    })
  })

  describe('reduce to build object', () => {
    it('builds an object from deque entries', () => {
      const d = Deque.from<Array<[string, number]>>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const obj = d.reduce<Record<string, number>>((acc, entry) => {
        acc[entry[0]] = entry[1]
        return acc
      }, {})
      expect(obj).toEqual({ a: 1, b: 2, c: 3 })
    })
  })
})
