import { describe, it, expect, beforeEach } from 'vitest'
import { LatchFreeStack } from '../../src/core/latch-free-stack/latch-free-stack.js'
import { DEFAULT_LATCH_FREE_STACK_OPTIONS } from '../../src/core/latch-free-stack/types.js'
import type { LatchFreeStackOptions, LatchFreeStackStatistics } from '../../src/core/latch-free-stack/types.js'

describe('LatchFreeStack', () => {
  let stack: LatchFreeStack<number>

  beforeEach(() => {
    stack = new LatchFreeStack<number>()
  })

  describe('constructor', () => {
    it('should create an empty stack with default options', () => {
      const s = new LatchFreeStack<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('should accept custom options', () => {
      const s = new LatchFreeStack<number>({ trackStatistics: false })
      expect(s.size).toBe(0)
    })

    it('should accept empty options', () => {
      const s = new LatchFreeStack<number>({})
      expect(s.size).toBe(0)
    })

    it('should accept simulateCasFailures option', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 3 })
      expect(s.size).toBe(0)
    })

    it('should have default trackStatistics true', () => {
      expect(DEFAULT_LATCH_FREE_STACK_OPTIONS.trackStatistics).toBe(true)
    })

    it('should have default simulateCasFailures 0', () => {
      expect(DEFAULT_LATCH_FREE_STACK_OPTIONS.simulateCasFailures).toBe(0)
    })

    it('should work with string type', () => {
      const s = new LatchFreeStack<string>()
      expect(s.size).toBe(0)
    })

    it('should work with object type', () => {
      const s = new LatchFreeStack<{ x: number }>()
      expect(s.size).toBe(0)
    })

    it('should work with default generic type', () => {
      const s = new LatchFreeStack()
      expect(s.size).toBe(0)
    })
  })

  describe('push', () => {
    it('should add a single item', () => {
      stack.push(1)
      expect(stack.size).toBe(1)
      expect(stack.isEmpty).toBe(false)
    })

    it('should add multiple items', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.size).toBe(3)
    })

    it('should place last pushed item on top (LIFO)', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.peek()).toBe(3)
    })

    it('should handle undefined values', () => {
      const s = new LatchFreeStack<number | undefined>()
      s.push(undefined)
      expect(s.size).toBe(1)
    })

    it('should handle null values', () => {
      const s = new LatchFreeStack<number | null>()
      s.push(null)
      expect(s.size).toBe(1)
    })

    it('should handle push after pop', () => {
      stack.push(1)
      stack.pop()
      stack.push(2)
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(2)
    })

    it('should track push statistics', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.getStatistics().pushes).toBe(2)
    })

    it('should not track statistics when disabled', () => {
      const s = new LatchFreeStack<number>({ trackStatistics: false })
      s.push(1)
      expect(s.getStatistics().pushes).toBe(0)
    })

    it('should update maxSize statistic', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.getStatistics().maxSize).toBe(3)
    })

    it('should track totalSpinAttempts on push', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.getStatistics().totalSpinAttempts).toBe(2)
    })
  })

  describe('pop', () => {
    it('should return undefined for empty stack', () => {
      expect(stack.pop()).toBeUndefined()
    })

    it('should remove and return the top item (LIFO)', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })

    it('should maintain correct size after pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.size).toBe(2)
    })

    it('should handle pop all items', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
      expect(stack.size).toBe(0)
      expect(stack.isEmpty).toBe(true)
    })

    it('should handle pop on single item stack', () => {
      stack.push(42)
      expect(stack.pop()).toBe(42)
      expect(stack.isEmpty).toBe(true)
    })

    it('should return undefined after all items popped', () => {
      stack.push(1)
      stack.pop()
      expect(stack.pop()).toBeUndefined()
    })

    it('should handle alternating push/pop', () => {
      stack.push(1)
      expect(stack.pop()).toBe(1)
      stack.push(2)
      expect(stack.pop()).toBe(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.isEmpty).toBe(true)
    })

    it('should track pop statistics', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.getStatistics().pops).toBe(1)
    })

    it('should not track pop stats when statistics disabled', () => {
      const s = new LatchFreeStack<number>({ trackStatistics: false })
      s.push(1)
      s.pop()
      expect(s.getStatistics().pops).toBe(0)
    })

    it('should track totalSpinAttempts on pop', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.getStatistics().totalSpinAttempts).toBe(3)
    })
  })

  describe('peek', () => {
    it('should return undefined for empty stack', () => {
      expect(stack.peek()).toBeUndefined()
    })

    it('should return the top item without removing it', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.peek()).toBe(2)
      expect(stack.size).toBe(2)
    })

    it('should return same item on multiple calls', () => {
      stack.push(42)
      expect(stack.peek()).toBe(42)
      expect(stack.peek()).toBe(42)
      expect(stack.peek()).toBe(42)
    })

    it('should update after pop', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.peek()).toBe(1)
    })

    it('should work after push', () => {
      stack.push(1)
      expect(stack.peek()).toBe(1)
      stack.push(2)
      expect(stack.peek()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty stack', () => {
      expect(stack.size).toBe(0)
    })

    it('should increase with each push', () => {
      stack.push(1)
      expect(stack.size).toBe(1)
      stack.push(2)
      expect(stack.size).toBe(2)
      stack.push(3)
      expect(stack.size).toBe(3)
    })

    it('should decrease with each pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.size).toBe(2)
      stack.pop()
      expect(stack.size).toBe(1)
    })

    it('should never go negative', () => {
      stack.pop()
      expect(stack.size).toBe(0)
    })

    it('should be accurate after many operations', () => {
      for (let i = 0; i < 50; i++) {
        stack.push(i)
      }
      for (let i = 0; i < 25; i++) {
        stack.pop()
      }
      expect(stack.size).toBe(25)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new stack', () => {
      expect(stack.isEmpty).toBe(true)
    })

    it('should return false after push', () => {
      stack.push(1)
      expect(stack.isEmpty).toBe(false)
    })

    it('should return true after all items popped', () => {
      stack.push(1)
      stack.pop()
      expect(stack.isEmpty).toBe(true)
    })

    it('should return false with items remaining', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      stack.push(1)
      stack.push(2)
      stack.clear()
      expect(stack.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty the stack', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty).toBe(true)
    })

    it('should work on already empty stack', () => {
      stack.clear()
      expect(stack.size).toBe(0)
    })

    it('should allow push after clear', () => {
      stack.push(1)
      stack.clear()
      stack.push(2)
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(2)
    })

    it('should allow pop after clear returning undefined', () => {
      stack.push(1)
      stack.clear()
      expect(stack.pop()).toBeUndefined()
    })

    it('should handle multiple clears', () => {
      stack.push(1)
      stack.clear()
      stack.clear()
      expect(stack.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty stack', () => {
      expect(stack.toArray()).toEqual([])
    })

    it('should return all items top-to-bottom (LIFO order)', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.toArray()).toEqual([3, 2, 1])
    })

    it('should reflect current state after pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.toArray()).toEqual([2, 1])
    })

    it('should return a copy not a reference', () => {
      stack.push(1)
      const arr = stack.toArray()
      arr.push(2)
      expect(stack.toArray()).toEqual([1])
    })

    it('should return correct order for single element', () => {
      stack.push(42)
      expect(stack.toArray()).toEqual([42])
    })
  })

  describe('forEach', () => {
    it('should iterate over all items top-to-bottom', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const items: number[] = []
      stack.forEach((v) => items.push(v))
      expect(items).toEqual([3, 2, 1])
    })

    it('should provide correct indices', () => {
      stack.push(10)
      stack.push(20)
      stack.push(30)
      const indices: number[] = []
      stack.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not iterate on empty stack', () => {
      let count = 0
      stack.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should handle single item', () => {
      stack.push(1)
      const items: number[] = []
      stack.forEach((v) => items.push(v))
      expect(items).toEqual([1])
    })

    it('should work after partial pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      const items: number[] = []
      stack.forEach((v) => items.push(v))
      expect(items).toEqual([2, 1])
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const items: number[] = []
      for (const item of stack) {
        items.push(item)
      }
      expect(items).toEqual([3, 2, 1])
    })

    it('should work with spread operator', () => {
      stack.push(1)
      stack.push(2)
      expect([...stack]).toEqual([2, 1])
    })

    it('should work with Array.from', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(Array.from(stack)).toEqual([3, 2, 1])
    })

    it('should work on empty stack', () => {
      expect([...stack]).toEqual([])
    })

    it('should work after partial pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect([...stack]).toEqual([2, 1])
    })

    it('should create independent iterators', () => {
      stack.push(1)
      stack.push(2)
      const iter1 = stack[Symbol.iterator]()
      const iter2 = stack[Symbol.iterator]()
      expect(iter1.next().value).toBe(2)
      expect(iter2.next().value).toBe(2)
      expect(iter1.next().value).toBe(1)
      expect(iter2.next().value).toBe(1)
    })

    it('should not be affected by modifications after creation', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const iter = stack[Symbol.iterator]()
      stack.pop()
      const items: number[] = []
      let result = iter.next()
      while (!result.done) {
        items.push(result.value)
        result = iter.next()
      }
      expect(items).toEqual([3, 2, 1])
    })
  })

  describe('contains', () => {
    it('should return true for existing value', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.contains(2)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.contains(99)).toBe(false)
    })

    it('should return false for empty stack', () => {
      expect(stack.contains(1)).toBe(false)
    })

    it('should find the top element', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.contains(2)).toBe(true)
    })

    it('should find the bottom element', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.contains(1)).toBe(true)
    })

    it('should return false after pop removes the value', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.contains(2)).toBe(false)
    })

    it('should handle undefined value search', () => {
      const s = new LatchFreeStack<number | undefined>()
      s.push(undefined)
      expect(s.contains(undefined)).toBe(true)
    })

    it('should handle null value search', () => {
      const s = new LatchFreeStack<number | null>()
      s.push(null)
      expect(s.contains(null)).toBe(true)
    })
  })

  describe('drain', () => {
    it('should return all items and empty the stack', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const drained = stack.drain()
      expect(drained).toEqual([3, 2, 1])
      expect(stack.size).toBe(0)
      expect(stack.isEmpty).toBe(true)
    })

    it('should return empty array for empty stack', () => {
      expect(stack.drain()).toEqual([])
    })

    it('should allow push after drain', () => {
      stack.push(1)
      stack.drain()
      stack.push(2)
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(2)
    })

    it('should drain single element', () => {
      stack.push(42)
      expect(stack.drain()).toEqual([42])
      expect(stack.isEmpty).toBe(true)
    })

    it('should return items in LIFO order', () => {
      for (let i = 0; i < 10; i++) {
        stack.push(i)
      }
      const drained = stack.drain()
      for (let i = 9; i >= 0; i--) {
        expect(drained[9 - i]).toBe(i)
      }
    })
  })

  describe('pushMany', () => {
    it('should push multiple values from an array', () => {
      stack.pushMany([1, 2, 3])
      expect(stack.size).toBe(3)
      expect(stack.toArray()).toEqual([3, 2, 1])
    })

    it('should push from an empty array', () => {
      stack.pushMany([])
      expect(stack.size).toBe(0)
    })

    it('should push from a Set', () => {
      stack.pushMany(new Set([1, 2, 3]))
      expect(stack.size).toBe(3)
    })

    it('should push from a generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      stack.pushMany(gen())
      expect(stack.size).toBe(3)
      expect(stack.peek()).toBe(3)
    })

    it('should push on top of existing items', () => {
      stack.push(0)
      stack.pushMany([1, 2])
      expect(stack.size).toBe(3)
      expect(stack.toArray()).toEqual([2, 1, 0])
    })

    it('should track statistics for each push', () => {
      stack.pushMany([1, 2, 3])
      expect(stack.getStatistics().pushes).toBe(3)
    })
  })

  describe('tryPop', () => {
    it('should return success with value for non-empty stack', () => {
      stack.push(1)
      const result = stack.tryPop()
      expect(result.success).toBe(true)
      expect(result.value).toBe(1)
    })

    it('should return failure for empty stack', () => {
      const result = stack.tryPop()
      expect(result.success).toBe(false)
      expect(result.value).toBe(undefined)
    })

    it('should remove the item from stack on success', () => {
      stack.push(1)
      stack.push(2)
      stack.tryPop()
      expect(stack.size).toBe(1)
      expect(stack.peek()).toBe(1)
    })

    it('should not modify stack on failure', () => {
      stack.push(1)
      const s = new LatchFreeStack<number>()
      s.tryPop()
      expect(s.size).toBe(0)
    })

    it('should handle sequential tryPops', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.tryPop().value).toBe(3)
      expect(stack.tryPop().value).toBe(2)
      expect(stack.tryPop().value).toBe(1)
      const result = stack.tryPop()
      expect(result.success).toBe(false)
    })
  })

  describe('LIFO order', () => {
    it('should maintain LIFO order for push/pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
    })

    it('should maintain LIFO with interleaved push/pop', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.pop()).toBe(2)
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(1)
    })

    it('should maintain LIFO after clear and refill', () => {
      stack.push(1)
      stack.push(2)
      stack.clear()
      stack.push(3)
      stack.push(4)
      expect(stack.pop()).toBe(4)
      expect(stack.pop()).toBe(3)
    })

    it('should maintain LIFO for large number of items', () => {
      for (let i = 0; i < 100; i++) {
        stack.push(i)
      }
      for (let i = 99; i >= 0; i--) {
        expect(stack.pop()).toBe(i)
      }
    })
  })

  describe('CAS failure simulation', () => {
    it('should simulate CAS failures on push', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 2 })
      s.push(1)
      expect(s.getStatistics().casFailures).toBe(2)
      expect(s.getStatistics().totalSpinAttempts).toBe(3)
    })

    it('should simulate CAS failures on pop', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 3 })
      s.push(1)
      const statsBefore = s.getStatistics().casFailures
      s.pop()
      expect(s.getStatistics().casFailures).toBe(statsBefore + 3)
    })

    it('should still produce correct results after CAS failures', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 5 })
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.pop()).toBe(3)
      expect(s.pop()).toBe(2)
      expect(s.pop()).toBe(1)
    })

    it('should track casFailures in statistics', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 1 })
      s.push(1)
      s.push(2)
      expect(s.getStatistics().casFailures).toBe(2)
    })

    it('should have zero casFailures with default options', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.getStatistics().casFailures).toBe(0)
    })

    it('should reset CAS failure counter on clear', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 2 })
      s.push(1)
      s.clear()
      s.push(2)
      expect(s.getStatistics().casFailures).toBe(4)
    })

    it('should simulate failures correctly on drain with CAS failures', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 1 })
      s.pushMany([1, 2, 3])
      const drained = s.drain()
      expect(drained).toEqual([3, 2, 1])
      expect(s.getStatistics().casFailures).toBeGreaterThan(0)
    })
  })

  describe('ABA protection', () => {
    it('should increment version on push', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.size).toBe(3)
    })

    it('should increment version on pop', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      stack.push(3)
      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(1)
    })

    it('should increment version on clear', () => {
      stack.push(1)
      stack.push(2)
      stack.clear()
      stack.push(3)
      expect(stack.peek()).toBe(3)
      expect(stack.size).toBe(1)
    })

    it('should handle push same value twice (ABA scenario)', () => {
      stack.push(1)
      stack.pop()
      stack.push(1)
      expect(stack.peek()).toBe(1)
      expect(stack.size).toBe(1)
    })

    it('should handle rapid push/pop of same value', () => {
      for (let i = 0; i < 50; i++) {
        stack.push(42)
        expect(stack.pop()).toBe(42)
      }
      expect(stack.isEmpty).toBe(true)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = stack.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.casFailures).toBe(0)
      expect(stats.maxSize).toBe(0)
      expect(stats.currentSize).toBe(0)
      expect(stats.totalSpinAttempts).toBe(0)
    })

    it('should track pushes', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      expect(stack.getStatistics().pushes).toBe(3)
    })

    it('should track pops', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      stack.pop()
      expect(stack.getStatistics().pops).toBe(2)
    })

    it('should track maxSize', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.getStatistics().maxSize).toBe(3)
    })

    it('should track currentSize', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.getStatistics().currentSize).toBe(1)
    })

    it('should track totalSpinAttempts', () => {
      stack.push(1)
      stack.push(2)
      stack.pop()
      expect(stack.getStatistics().totalSpinAttempts).toBe(3)
    })

    it('should return a copy of statistics', () => {
      stack.push(1)
      const stats = stack.getStatistics()
      stats.pushes = 999
      expect(stack.getStatistics().pushes).toBe(1)
    })

    it('should not update stats when trackStatistics is false', () => {
      const s = new LatchFreeStack<number>({ trackStatistics: false })
      s.push(1)
      s.push(2)
      s.pop()
      const stats = s.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.totalSpinAttempts).toBe(0)
    })

    it('should accumulate statistics over multiple operations', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      stack.push(4)
      stack.pop()
      const stats = stack.getStatistics()
      expect(stats.pushes).toBe(4)
      expect(stats.pops).toBe(2)
    })

    it('should preserve maxSize across clear', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.clear()
      expect(stack.getStatistics().maxSize).toBe(3)
    })
  })

  describe('toJSON', () => {
    it('should serialize empty stack', () => {
      const json = stack.toJSON()
      expect(json.values).toEqual([])
      expect(json.statistics.pushes).toBe(0)
    })

    it('should serialize stack with items', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const json = stack.toJSON()
      expect(json.values).toEqual([3, 2, 1])
      expect(json.statistics.pushes).toBe(3)
    })

    it('should include statistics in serialization', () => {
      stack.push(1)
      stack.pop()
      const json = stack.toJSON()
      expect(json.statistics.pushes).toBe(1)
      expect(json.statistics.pops).toBe(1)
    })

    it('should not modify the stack', () => {
      stack.push(1)
      stack.push(2)
      stack.toJSON()
      expect(stack.size).toBe(2)
      expect(stack.toArray()).toEqual([2, 1])
    })
  })

  describe('fromJSON', () => {
    it('should deserialize an empty stack', () => {
      const s = LatchFreeStack.fromJSON<number>({ values: [], statistics: { pushes: 0, pops: 0, casFailures: 0, maxSize: 0, currentSize: 0, totalSpinAttempts: 0 } })
      expect(s.size).toBe(0)
      expect(s.isEmpty).toBe(true)
    })

    it('should deserialize a stack with items', () => {
      const s = LatchFreeStack.fromJSON<number>({ values: [3, 2, 1], statistics: { pushes: 3, pops: 0, casFailures: 0, maxSize: 3, currentSize: 3, totalSpinAttempts: 3 } })
      expect(s.size).toBe(3)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('should preserve LIFO order through round-trip', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const json = stack.toJSON()
      const restored = LatchFreeStack.fromJSON(json)
      expect(restored.pop()).toBe(3)
      expect(restored.pop()).toBe(2)
      expect(restored.pop()).toBe(1)
    })

    it('should restore statistics', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      const json = stack.toJSON()
      const restored = LatchFreeStack.fromJSON(json)
      expect(restored.getStatistics().pushes).toBe(3)
      expect(restored.getStatistics().maxSize).toBe(3)
    })

    it('should handle round-trip with complex values', () => {
      const s = new LatchFreeStack<{ id: number; name: string }>()
      s.push({ id: 1, name: 'a' })
      s.push({ id: 2, name: 'b' })
      const json = s.toJSON()
      const restored = LatchFreeStack.fromJSON(json)
      expect(restored.pop()!.id).toBe(2)
      expect(restored.pop()!.name).toBe('a')
    })

    it('should handle round-trip of empty stack', () => {
      const json = stack.toJSON()
      const restored = LatchFreeStack.fromJSON<number>(json)
      expect(restored.size).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })
  })

  describe('type variations', () => {
    it('should handle string stack', () => {
      const s = new LatchFreeStack<string>()
      s.push('a')
      s.push('b')
      s.push('c')
      expect(s.toArray()).toEqual(['c', 'b', 'a'])
      expect(s.pop()).toBe('c')
    })

    it('should handle object stack', () => {
      const s = new LatchFreeStack<{ id: number }>()
      s.push({ id: 1 })
      s.push({ id: 2 })
      const item = s.pop()
      expect(item!.id).toBe(2)
    })

    it('should handle boolean stack', () => {
      const s = new LatchFreeStack<boolean>()
      s.push(true)
      s.push(false)
      expect(s.pop()).toBe(false)
      expect(s.pop()).toBe(true)
    })

    it('should handle array stack', () => {
      const s = new LatchFreeStack<number[]>()
      s.push([1, 2])
      s.push([3, 4])
      expect(s.pop()).toEqual([3, 4])
    })

    it('should handle mixed union type', () => {
      const s = new LatchFreeStack<string | number>()
      s.push('a')
      s.push(1)
      s.push('b')
      expect(s.pop()).toBe('b')
      expect(s.pop()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle push/pop cycle many times', () => {
      for (let i = 0; i < 100; i++) {
        stack.push(i)
        expect(stack.pop()).toBe(i)
      }
      expect(stack.isEmpty).toBe(true)
    })

    it('should handle bulk push then bulk pop', () => {
      for (let i = 0; i < 1000; i++) {
        stack.push(i)
      }
      for (let i = 999; i >= 0; i--) {
        expect(stack.pop()).toBe(i)
      }
      expect(stack.isEmpty).toBe(true)
    })

    it('should handle mixed operations', () => {
      stack.push(1)
      stack.push(2)
      expect(stack.pop()).toBe(2)
      stack.push(3)
      stack.push(4)
      expect(stack.pop()).toBe(4)
      expect(stack.pop()).toBe(3)
      stack.push(5)
      expect(stack.toArray()).toEqual([5, 1])
    })

    it('should handle peek on empty stack after operations', () => {
      stack.push(1)
      stack.pop()
      expect(stack.peek()).toBeUndefined()
    })

    it('should handle toArray on empty stack', () => {
      expect(stack.toArray()).toEqual([])
    })

    it('should handle clear after partial pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      stack.clear()
      expect(stack.size).toBe(0)
      expect(stack.isEmpty).toBe(true)
    })

    it('should handle pop on empty after clear', () => {
      stack.push(1)
      stack.clear()
      expect(stack.pop()).toBeUndefined()
    })

    it('should handle contains on empty stack', () => {
      expect(stack.contains(1)).toBe(false)
    })

    it('should handle drain on already drained stack', () => {
      stack.push(1)
      stack.drain()
      expect(stack.drain()).toEqual([])
    })

    it('should handle tryPop on empty after drain', () => {
      stack.push(1)
      stack.drain()
      const result = stack.tryPop()
      expect(result.success).toBe(false)
    })

    it('should handle pushMany with large iterable', () => {
      stack.pushMany(Array.from({ length: 500 }, (_, i) => i))
      expect(stack.size).toBe(500)
      expect(stack.peek()).toBe(499)
    })
  })

  describe('stress tests', () => {
    it('should handle 10,000 push/pop operations', () => {
      const n = 10_000
      for (let i = 0; i < n; i++) {
        stack.push(i)
      }
      for (let i = n - 1; i >= 0; i--) {
        expect(stack.pop()).toBe(i)
      }
      expect(stack.isEmpty).toBe(true)
    })

    it('should handle interleaved push/pop', () => {
      const n = 1000
      for (let i = 0; i < n; i++) {
        stack.push(i)
      }
      for (let i = 0; i < n; i++) {
        expect(stack.pop()).toBe(n - 1 - i)
      }
      expect(stack.isEmpty).toBe(true)
    })

    it('should handle large batch push then toArray', () => {
      for (let i = 0; i < 5000; i++) {
        stack.push(i)
      }
      expect(stack.size).toBe(5000)
      const arr = stack.toArray()
      expect(arr[0]).toBe(4999)
      expect(arr[4999]).toBe(0)
    })

    it('should handle repeated fill and drain cycles', () => {
      for (let cycle = 0; cycle < 50; cycle++) {
        for (let i = 0; i < 20; i++) {
          stack.push(cycle * 20 + i)
        }
        const drained = stack.drain()
        for (let i = 0; i < 20; i++) {
          expect(drained[i]).toBe(cycle * 20 + (19 - i))
        }
      }
      expect(stack.isEmpty).toBe(true)
    })

    it('should handle statistics under stress', () => {
      for (let i = 0; i < 5000; i++) {
        stack.push(i)
      }
      for (let i = 0; i < 2500; i++) {
        stack.pop()
      }
      const stats = stack.getStatistics()
      expect(stats.pushes).toBe(5000)
      expect(stats.pops).toBe(2500)
      expect(stats.maxSize).toBe(5000)
      expect(stats.currentSize).toBe(2500)
    })

    it('should handle CAS failures under stress', () => {
      const s = new LatchFreeStack<number>({ simulateCasFailures: 5 })
      for (let i = 0; i < 100; i++) {
        s.push(i)
      }
      for (let i = 99; i >= 0; i--) {
        expect(s.pop()).toBe(i)
      }
      expect(s.getStatistics().casFailures).toBeGreaterThan(0)
    })
  })

  describe('type exports', () => {
    it('should export LatchFreeStackOptions type', () => {
      const opts: LatchFreeStackOptions = { trackStatistics: false, simulateCasFailures: 0 }
      const s = new LatchFreeStack<number>(opts)
      expect(s.size).toBe(0)
    })

    it('should export LatchFreeStackStatistics type', () => {
      stack.push(1)
      const stats: LatchFreeStackStatistics = stack.getStatistics()
      expect(stats.pushes).toBe(1)
    })

    it('should export DEFAULT_LATCH_FREE_STACK_OPTIONS', () => {
      expect(DEFAULT_LATCH_FREE_STACK_OPTIONS.trackStatistics).toBe(true)
      expect(DEFAULT_LATCH_FREE_STACK_OPTIONS.simulateCasFailures).toBe(0)
    })
  })

  describe('statistics edge cases', () => {
    it('should track maxSize correctly across pushes and pops', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      stack.pop()
      stack.pop()
      stack.push(4)
      expect(stack.getStatistics().maxSize).toBe(3)
    })

    it('should track currentSize accurately', () => {
      stack.push(1)
      expect(stack.getStatistics().currentSize).toBe(1)
      stack.push(2)
      expect(stack.getStatistics().currentSize).toBe(2)
      stack.pop()
      expect(stack.getStatistics().currentSize).toBe(1)
    })

    it('should track statistics after clear', () => {
      stack.push(1)
      stack.push(2)
      stack.clear()
      const stats = stack.getStatistics()
      expect(stats.pushes).toBe(2)
      expect(stats.maxSize).toBe(2)
    })

    it('should track totalSpinAttempts across operations', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      expect(stack.getStatistics().totalSpinAttempts).toBe(4)
    })

    it('should handle statistics disabled then operations', () => {
      const s = new LatchFreeStack<number>({ trackStatistics: false })
      s.push(1)
      s.push(2)
      s.pop()
      const stats = s.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.casFailures).toBe(0)
      expect(stats.maxSize).toBe(0)
      expect(stats.currentSize).toBe(0)
      expect(stats.totalSpinAttempts).toBe(0)
    })
  })

  describe('forEach after operations', () => {
    it('should iterate correctly after pop', () => {
      stack.push(1)
      stack.push(2)
      stack.push(3)
      stack.pop()
      const items: number[] = []
      stack.forEach((v) => items.push(v))
      expect(items).toEqual([2, 1])
    })

    it('should iterate correctly after clear and refill', () => {
      stack.push(1)
      stack.push(2)
      stack.clear()
      stack.push(3)
      stack.push(4)
      const items: number[] = []
      stack.forEach((v) => items.push(v))
      expect(items).toEqual([4, 3])
    })

    it('should iterate correctly after drain and refill', () => {
      stack.push(1)
      stack.drain()
      stack.push(2)
      stack.push(3)
      const items: number[] = []
      stack.forEach((v) => items.push(v))
      expect(items).toEqual([3, 2])
    })
  })

  describe('contains edge cases', () => {
    it('should find duplicate values', () => {
      stack.push(1)
      stack.push(1)
      stack.push(1)
      expect(stack.contains(1)).toBe(true)
    })

    it('should work with zero', () => {
      stack.push(0)
      expect(stack.contains(0)).toBe(true)
    })

    it('should work with false', () => {
      const s = new LatchFreeStack<boolean>()
      s.push(false)
      expect(s.contains(false)).toBe(true)
    })

    it('should work with empty string', () => {
      const s = new LatchFreeStack<string>()
      s.push('')
      expect(s.contains('')).toBe(true)
    })
  })
})
