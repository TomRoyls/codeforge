import { describe, it, expect, beforeEach } from 'vitest'
import { CircularSet } from '../../src/core/circular-set/circular-set.js'
import { DEFAULT_CIRCULAR_SET_OPTIONS } from '../../src/core/circular-set/types.js'

describe('CircularSet', () => {
  let cs: CircularSet<number>

  beforeEach(() => {
    cs = new CircularSet<number>({ capacity: 5 })
  })

  describe('construction', () => {
    it('should create with specified capacity', () => {
      const s = new CircularSet<number>({ capacity: 10 })
      expect(s.capacity).toBe(10)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.isFull).toBe(false)
    })

    it('should clamp capacity to at least 1', () => {
      const s = new CircularSet<number>({ capacity: 0 })
      expect(s.capacity).toBe(1)
    })

    it('should clamp negative capacity to 1', () => {
      const s = new CircularSet<number>({ capacity: -5 })
      expect(s.capacity).toBe(1)
    })

    it('should create with capacity 1', () => {
      const s = new CircularSet<number>({ capacity: 1 })
      expect(s.capacity).toBe(1)
      expect(s.size).toBe(0)
    })

    it('should start empty', () => {
      expect(cs.size).toBe(0)
      expect(cs.isEmpty).toBe(true)
    })

    it('should use DEFAULT_CIRCULAR_SET_OPTIONS capacity when none given', () => {
      const s = new CircularSet<number>({ capacity: DEFAULT_CIRCULAR_SET_OPTIONS.capacity })
      expect(s.capacity).toBe(64)
    })
  })

  describe('add', () => {
    it('should add an item and return true', () => {
      expect(cs.add(1)).toBe(true)
      expect(cs.size).toBe(1)
      expect(cs.has(1)).toBe(true)
    })

    it('should return false when adding duplicate', () => {
      cs.add(1)
      expect(cs.add(1)).toBe(false)
      expect(cs.size).toBe(1)
    })

    it('should add multiple distinct items', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      expect(cs.size).toBe(3)
      expect(cs.has(1)).toBe(true)
      expect(cs.has(2)).toBe(true)
      expect(cs.has(3)).toBe(true)
    })

    it('should evict oldest when full', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      expect(cs.isFull).toBe(true)
      cs.add(6)
      expect(cs.size).toBe(5)
      expect(cs.has(1)).toBe(false)
      expect(cs.has(6)).toBe(true)
    })

    it('should track insertion order', () => {
      cs.add(10)
      cs.add(20)
      cs.add(30)
      expect(cs.first).toBe(10)
      expect(cs.last).toBe(30)
    })

    it('should not evict when adding duplicate to full set', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      expect(cs.add(3)).toBe(false)
      expect(cs.size).toBe(5)
      expect(cs.has(1)).toBe(true)
    })

    it('should handle adding after delete', () => {
      cs.add(1)
      cs.add(2)
      cs.delete(1)
      cs.add(3)
      expect(cs.size).toBe(2)
      expect(cs.has(1)).toBe(false)
      expect(cs.has(2)).toBe(true)
      expect(cs.has(3)).toBe(true)
    })

    it('should handle multiple evictions', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.add(6)
      cs.add(7)
      expect(cs.size).toBe(5)
      expect(cs.has(1)).toBe(false)
      expect(cs.has(2)).toBe(false)
      expect(cs.has(5)).toBe(true)
      expect(cs.has(6)).toBe(true)
      expect(cs.has(7)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing item and return true', () => {
      cs.add(1)
      expect(cs.delete(1)).toBe(true)
      expect(cs.has(1)).toBe(false)
      expect(cs.size).toBe(0)
    })

    it('should return false for non-existent item', () => {
      expect(cs.delete(99)).toBe(false)
    })

    it('should delete from middle of set', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      expect(cs.size).toBe(2)
      expect(cs.has(1)).toBe(true)
      expect(cs.has(2)).toBe(false)
      expect(cs.has(3)).toBe(true)
    })

    it('should delete first item', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(1)
      expect(cs.size).toBe(2)
      expect(cs.has(1)).toBe(false)
    })

    it('should delete last item', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(3)
      expect(cs.size).toBe(2)
      expect(cs.has(3)).toBe(false)
    })

    it('should handle delete on empty set', () => {
      expect(cs.delete(1)).toBe(false)
    })

    it('should handle delete then re-add', () => {
      cs.add(1)
      cs.delete(1)
      expect(cs.add(1)).toBe(true)
      expect(cs.has(1)).toBe(true)
      expect(cs.size).toBe(1)
    })

    it('should delete the only item in capacity-1 set', () => {
      const s = new CircularSet<number>({ capacity: 1 })
      s.add(42)
      expect(s.delete(42)).toBe(true)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })
  })

  describe('has', () => {
    it('should return true for existing item', () => {
      cs.add(1)
      expect(cs.has(1)).toBe(true)
    })

    it('should return false for non-existent item', () => {
      expect(cs.has(1)).toBe(false)
    })

    it('should return false for evicted item', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.add(6)
      expect(cs.has(1)).toBe(false)
    })

    it('should return false after delete', () => {
      cs.add(1)
      cs.delete(1)
      expect(cs.has(1)).toBe(false)
    })

    it('should work with strings', () => {
      const s = new CircularSet<string>({ capacity: 3 })
      s.add('hello')
      expect(s.has('hello')).toBe(true)
      expect(s.has('world')).toBe(false)
    })

    it('should work with objects by reference', () => {
      const s = new CircularSet<object>({ capacity: 3 })
      const obj = { x: 1 }
      s.add(obj)
      expect(s.has(obj)).toBe(true)
      expect(s.has({ x: 1 })).toBe(false)
    })
  })

  describe('first and last', () => {
    it('should return undefined on empty set', () => {
      expect(cs.first).toBe(undefined)
      expect(cs.last).toBe(undefined)
    })

    it('should return the same item when only one item', () => {
      cs.add(42)
      expect(cs.first).toBe(42)
      expect(cs.last).toBe(42)
    })

    it('should return first and last after multiple adds', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      expect(cs.first).toBe(1)
      expect(cs.last).toBe(3)
    })

    it('should update first after eviction', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.add(6)
      expect(cs.first).toBe(2)
      expect(cs.last).toBe(6)
    })

    it('should update first after deleting first item', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(1)
      expect(cs.first).toBe(2)
    })

    it('should update last after deleting last item', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(3)
      expect(cs.last).toBe(2)
    })
  })

  describe('size and capacity', () => {
    it('should track size correctly', () => {
      expect(cs.size).toBe(0)
      cs.add(1)
      expect(cs.size).toBe(1)
      cs.add(2)
      expect(cs.size).toBe(2)
      cs.delete(1)
      expect(cs.size).toBe(1)
    })

    it('should report capacity correctly', () => {
      expect(cs.capacity).toBe(5)
      const s = new CircularSet<number>({ capacity: 100 })
      expect(s.capacity).toBe(100)
    })

    it('size should not exceed capacity', () => {
      for (let i = 0; i < 20; i++) {
        cs.add(i)
      }
      expect(cs.size).toBe(5)
      expect(cs.size).toBeLessThanOrEqual(cs.capacity)
    })
  })

  describe('isFull and isEmpty', () => {
    it('should be empty initially', () => {
      expect(cs.isEmpty).toBe(true)
      expect(cs.isFull).toBe(false)
    })

    it('should be full when size equals capacity', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      expect(cs.isFull).toBe(true)
      expect(cs.isEmpty).toBe(false)
    })

    it('should no longer be full after eviction and delete', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.delete(3)
      expect(cs.isFull).toBe(false)
    })

    it('should be empty after clear', () => {
      cs.add(1)
      cs.add(2)
      cs.clear()
      expect(cs.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.clear()
      expect(cs.size).toBe(0)
      expect(cs.isEmpty).toBe(true)
    })

    it('should preserve capacity after clear', () => {
      cs.add(1)
      cs.clear()
      expect(cs.capacity).toBe(5)
    })

    it('should allow adding after clear', () => {
      cs.add(1)
      cs.add(2)
      cs.clear()
      cs.add(3)
      expect(cs.size).toBe(1)
      expect(cs.has(3)).toBe(true)
      expect(cs.has(1)).toBe(false)
    })

    it('should work on already empty set', () => {
      cs.clear()
      expect(cs.size).toBe(0)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      const clone = cs.clone()
      expect(clone.size).toBe(3)
      expect(clone.has(1)).toBe(true)
      expect(clone.has(2)).toBe(true)
      expect(clone.has(3)).toBe(true)
    })

    it('should have same capacity', () => {
      cs.add(1)
      const clone = cs.clone()
      expect(clone.capacity).toBe(cs.capacity)
    })

    it('should be independent from original', () => {
      cs.add(1)
      cs.add(2)
      const clone = cs.clone()
      clone.add(3)
      expect(cs.size).toBe(2)
      expect(clone.size).toBe(3)
    })

    it('should clone empty set', () => {
      const clone = cs.clone()
      expect(clone.size).toBe(0)
      expect(clone.isEmpty).toBe(true)
    })

    it('should preserve order in clone', () => {
      cs.add(10)
      cs.add(20)
      cs.add(30)
      const clone = cs.clone()
      expect(clone.first).toBe(10)
      expect(clone.last).toBe(30)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(cs.toArray()).toEqual([])
    })

    it('should return items in insertion order', () => {
      cs.add(3)
      cs.add(1)
      cs.add(2)
      expect(cs.toArray()).toEqual([3, 1, 2])
    })

    it('should reflect state after eviction', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.add(6)
      expect(cs.toArray()).toEqual([2, 3, 4, 5, 6])
    })

    it('should reflect state after delete', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      expect(cs.toArray()).toEqual([1, 3])
    })
  })

  describe('forEach', () => {
    it('should iterate over all items', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      const items: number[] = []
      cs.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct index', () => {
      cs.add(10)
      cs.add(20)
      cs.add(30)
      const indices: number[] = []
      cs.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not iterate on empty set', () => {
      let count = 0
      cs.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate in insertion order', () => {
      cs.add(5)
      cs.add(3)
      cs.add(8)
      const result: number[] = []
      cs.forEach((item) => result.push(item))
      expect(result).toEqual([5, 3, 8])
    })

    it('should skip deleted items', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      const items: number[] = []
      cs.forEach((item) => items.push(item))
      expect(items).toEqual([1, 3])
    })
  })

  describe('static from', () => {
    it('should create from array', () => {
      const s = CircularSet.from([1, 2, 3], 5)
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
      expect(s.has(3)).toBe(true)
    })

    it('should deduplicate items', () => {
      const s = CircularSet.from([1, 2, 2, 3, 1], 5)
      expect(s.size).toBe(3)
    })

    it('should evict when items exceed capacity', () => {
      const s = CircularSet.from([1, 2, 3, 4, 5, 6], 3)
      expect(s.size).toBe(3)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(false)
      expect(s.has(3)).toBe(false)
      expect(s.has(4)).toBe(true)
      expect(s.has(5)).toBe(true)
      expect(s.has(6)).toBe(true)
    })

    it('should create from generator', () => {
      function* gen() {
        yield 10
        yield 20
        yield 30
      }
      const s = CircularSet.from(gen(), 10)
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([10, 20, 30])
    })

    it('should create empty set from empty iterable', () => {
      const s = CircularSet.from([], 5)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('should set correct capacity', () => {
      const s = CircularSet.from([1, 2], 10)
      expect(s.capacity).toBe(10)
    })
  })

  describe('indexOf', () => {
    it('should return index of existing item', () => {
      cs.add(10)
      cs.add(20)
      cs.add(30)
      expect(cs.indexOf(10)).toBe(0)
      expect(cs.indexOf(20)).toBe(1)
      expect(cs.indexOf(30)).toBe(2)
    })

    it('should return -1 for non-existent item', () => {
      expect(cs.indexOf(99)).toBe(-1)
    })

    it('should return -1 on empty set', () => {
      expect(cs.indexOf(1)).toBe(-1)
    })

    it('should update index after delete', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      expect(cs.indexOf(1)).toBe(0)
      expect(cs.indexOf(3)).toBe(1)
    })

    it('should update index after eviction', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.add(6)
      expect(cs.indexOf(2)).toBe(0)
      expect(cs.indexOf(6)).toBe(4)
    })

    it('should return -1 for deleted item', () => {
      cs.add(1)
      cs.add(2)
      cs.delete(1)
      expect(cs.indexOf(1)).toBe(-1)
    })
  })

  describe('atIndex', () => {
    it('should return item at given index', () => {
      cs.add(10)
      cs.add(20)
      cs.add(30)
      expect(cs.atIndex(0)).toBe(10)
      expect(cs.atIndex(1)).toBe(20)
      expect(cs.atIndex(2)).toBe(30)
    })

    it('should return undefined for out-of-bounds', () => {
      cs.add(1)
      expect(cs.atIndex(-1)).toBe(undefined)
      expect(cs.atIndex(1)).toBe(undefined)
      expect(cs.atIndex(100)).toBe(undefined)
    })

    it('should return undefined on empty set', () => {
      expect(cs.atIndex(0)).toBe(undefined)
    })

    it('should work after eviction', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.add(6)
      expect(cs.atIndex(0)).toBe(2)
      expect(cs.atIndex(4)).toBe(6)
    })

    it('should work after delete', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      expect(cs.atIndex(0)).toBe(1)
      expect(cs.atIndex(1)).toBe(3)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty set', () => {
      const s = cs.stats()
      expect(s.capacity).toBe(5)
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
      expect(s.isFull).toBe(false)
      expect(s.utilization).toBe(0)
      expect(s.totalAdded).toBe(0)
      expect(s.totalEvicted).toBe(0)
      expect(s.totalDeleted).toBe(0)
    })

    it('should track totalAdded', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      expect(cs.stats().totalAdded).toBe(3)
    })

    it('should not count duplicates in totalAdded', () => {
      cs.add(1)
      cs.add(1)
      cs.add(1)
      expect(cs.stats().totalAdded).toBe(1)
    })

    it('should track totalEvicted', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      cs.add(6)
      expect(cs.stats().totalEvicted).toBe(1)
    })

    it('should track totalDeleted', () => {
      cs.add(1)
      cs.add(2)
      cs.delete(1)
      expect(cs.stats().totalDeleted).toBe(1)
    })

    it('should compute utilization', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      expect(cs.stats().utilization).toBe(3 / 5)
    })

    it('should show isFull', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      expect(cs.stats().isFull).toBe(true)
    })
  })

  describe('edge cases - capacity 1', () => {
    it('should hold exactly one item', () => {
      const s = new CircularSet<number>({ capacity: 1 })
      s.add(1)
      expect(s.size).toBe(1)
      expect(s.isFull).toBe(true)
    })

    it('should evict on second add', () => {
      const s = new CircularSet<number>({ capacity: 1 })
      s.add(1)
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(1)).toBe(false)
      expect(s.has(2)).toBe(true)
    })

    it('should handle add-delete-add cycle', () => {
      const s = new CircularSet<number>({ capacity: 1 })
      s.add(1)
      s.delete(1)
      s.add(2)
      expect(s.size).toBe(1)
      expect(s.has(2)).toBe(true)
    })

    it('first and last should be same item', () => {
      const s = new CircularSet<number>({ capacity: 1 })
      s.add(42)
      expect(s.first).toBe(42)
      expect(s.last).toBe(42)
    })

    it('should return false for duplicate add', () => {
      const s = new CircularSet<number>({ capacity: 1 })
      s.add(1)
      expect(s.add(1)).toBe(false)
    })
  })

  describe('eviction when full', () => {
    it('should evict in FIFO order', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      expect(s.toArray()).toEqual([2, 3, 4])
    })

    it('should evict multiple times correctly', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      s.add(6)
      expect(s.toArray()).toEqual([4, 5, 6])
    })

    it('should handle wrap-around eviction', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(4)
      s.add(5)
      expect(s.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('add existing item', () => {
    it('should not increase size when re-adding', () => {
      cs.add(1)
      cs.add(2)
      cs.add(1)
      expect(cs.size).toBe(2)
    })

    it('should not affect order when re-adding', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(1)
      expect(cs.first).toBe(1)
      expect(cs.last).toBe(3)
    })
  })

  describe('delete and re-add', () => {
    it('should allow re-adding deleted item', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      cs.add(2)
      expect(cs.has(2)).toBe(true)
      expect(cs.size).toBe(3)
    })

    it('should place re-added item at end', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      cs.add(2)
      expect(cs.toArray()).toEqual([1, 3, 2])
    })

    it('should handle delete and re-add with eviction', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.delete(2)
      s.add(4)
      s.add(5)
      expect(s.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('wrap-around', () => {
    it('should handle circular buffer wrap-around', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      s.add(5)
      s.add(6)
      s.add(7)
      expect(s.toArray()).toEqual([5, 6, 7])
    })

    it('should maintain correct order through wrap-around', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(10)
      s.add(20)
      s.add(30)
      s.add(40)
      expect(s.first).toBe(20)
      expect(s.last).toBe(40)
    })

    it('should handle many wrap-around cycles', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      for (let i = 0; i < 100; i++) {
        s.add(i)
      }
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([97, 98, 99])
    })
  })

  describe('large sets', () => {
    it('should handle large capacity', () => {
      const s = new CircularSet<number>({ capacity: 1000 })
      for (let i = 0; i < 1000; i++) {
        s.add(i)
      }
      expect(s.size).toBe(1000)
      expect(s.isFull).toBe(true)
    })

    it('should handle eviction in large set', () => {
      const s = new CircularSet<number>({ capacity: 1000 })
      for (let i = 0; i < 2000; i++) {
        s.add(i)
      }
      expect(s.size).toBe(1000)
      expect(s.first).toBe(1000)
      expect(s.last).toBe(1999)
    })

    it('should handle many operations', () => {
      const s = new CircularSet<number>({ capacity: 100 })
      for (let i = 0; i < 500; i++) {
        s.add(i)
      }
      for (let i = 0; i < 500; i++) {
        s.delete(i)
      }
      expect(s.size).toBe(0)
    })

    it('stats should track many operations', () => {
      const s = new CircularSet<number>({ capacity: 10 })
      for (let i = 0; i < 100; i++) {
        s.add(i)
      }
      const stats = s.stats()
      expect(stats.totalEvicted).toBe(90)
      expect(stats.totalAdded).toBe(100)
    })
  })

  describe('order verification', () => {
    it('should maintain insertion order in toArray', () => {
      cs.add(5)
      cs.add(3)
      cs.add(8)
      cs.add(1)
      expect(cs.toArray()).toEqual([5, 3, 8, 1])
    })

    it('should maintain order in forEach', () => {
      cs.add(5)
      cs.add(3)
      cs.add(8)
      const result: number[] = []
      cs.forEach((item) => result.push(item))
      expect(result).toEqual([5, 3, 8])
    })

    it('should maintain order after eviction', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(1)
      s.add(2)
      s.add(3)
      s.add(4)
      expect(s.toArray()).toEqual([2, 3, 4])
    })

    it('should maintain order with mixed operations', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.delete(2)
      cs.add(4)
      cs.add(5)
      expect(cs.toArray()).toEqual([1, 3, 4, 5])
    })

    it('should maintain order in clone', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      expect(cs.clone().toArray()).toEqual([1, 2, 3])
    })
  })

  describe('with string values', () => {
    it('should work with strings', () => {
      const s = new CircularSet<string>({ capacity: 3 })
      s.add('a')
      s.add('b')
      s.add('c')
      expect(s.size).toBe(3)
      expect(s.has('a')).toBe(true)
    })

    it('should evict strings correctly', () => {
      const s = new CircularSet<string>({ capacity: 2 })
      s.add('x')
      s.add('y')
      s.add('z')
      expect(s.toArray()).toEqual(['y', 'z'])
    })
  })

  describe('with object values', () => {
    it('should work with objects by reference', () => {
      const s = new CircularSet<{ id: number }>({ capacity: 3 })
      const a = { id: 1 }
      const b = { id: 2 }
      s.add(a)
      s.add(b)
      expect(s.has(a)).toBe(true)
      expect(s.has(b)).toBe(true)
    })

    it('should distinguish different object references', () => {
      const s = new CircularSet<{ id: number }>({ capacity: 3 })
      s.add({ id: 1 })
      expect(s.has({ id: 1 })).toBe(false)
    })
  })

  describe('iterator', () => {
    it('should be iterable', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      const result = [...cs]
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with for...of', () => {
      cs.add(10)
      cs.add(20)
      const items: number[] = []
      for (const item of cs) {
        items.push(item)
      }
      expect(items).toEqual([10, 20])
    })

    it('should yield nothing for empty set', () => {
      const result = [...cs]
      expect(result).toEqual([])
    })
  })

  describe('indexOf and atIndex consistency', () => {
    it('should be inverse of each other', () => {
      cs.add(10)
      cs.add(20)
      cs.add(30)
      for (let i = 0; i < cs.size; i++) {
        const item = cs.atIndex(i)
        expect(cs.indexOf(item!)).toBe(i)
      }
    })

    it('should remain consistent after delete', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.delete(2)
      expect(cs.atIndex(cs.indexOf(1)!)).toBe(1)
      expect(cs.atIndex(cs.indexOf(3)!)).toBe(3)
      expect(cs.atIndex(cs.indexOf(4)!)).toBe(4)
    })
  })

  describe('additional edge cases', () => {
    it('should handle NaN values', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(NaN)
      expect(s.has(NaN)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should handle null and undefined as distinct values', () => {
      const s = new CircularSet<null | undefined>({ capacity: 5 })
      s.add(null)
      s.add(undefined)
      expect(s.has(null)).toBe(true)
      expect(s.has(undefined)).toBe(true)
      expect(s.size).toBe(2)
    })

    it('should handle boolean values', () => {
      const s = new CircularSet<boolean>({ capacity: 3 })
      expect(s.add(true)).toBe(true)
      expect(s.add(false)).toBe(true)
      expect(s.add(true)).toBe(false)
      expect(s.size).toBe(2)
    })

    it('should handle zero as a value', () => {
      const s = new CircularSet<number>({ capacity: 3 })
      s.add(0)
      expect(s.has(0)).toBe(true)
      expect(s.size).toBe(1)
    })

    it('should handle empty string', () => {
      const s = new CircularSet<string>({ capacity: 3 })
      s.add('')
      expect(s.has('')).toBe(true)
      expect(s.add('')).toBe(false)
    })

    it('should track stats across clear and re-add', () => {
      cs.add(1)
      cs.add(2)
      cs.clear()
      cs.add(3)
      const stats = cs.stats()
      expect(stats.totalAdded).toBe(3)
      expect(stats.totalDeleted).toBe(0)
      expect(stats.size).toBe(1)
    })

    it('should handle clone of full set', () => {
      cs.add(1)
      cs.add(2)
      cs.add(3)
      cs.add(4)
      cs.add(5)
      const clone = cs.clone()
      expect(clone.isFull).toBe(true)
      expect(clone.size).toBe(5)
      expect(clone.capacity).toBe(5)
    })
  })
})
