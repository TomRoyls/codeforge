import { describe, it, expect } from 'vitest'
import { QueueStack } from '../../src/core/queue-stack/queue-stack.js'
import type { QueueStackOptions } from '../../src/core/queue-stack/types.js'
import { DEFAULT_QUEUE_STACK_OPTIONS } from '../../src/core/queue-stack/types.js'

describe('QueueStack', () => {
  describe('constructor', () => {
    it('creates empty QueueStack with default options', () => {
      const qs = new QueueStack<number>()
      expect(qs.size).toBe(0)
      expect(qs.isEmpty()).toBe(true)
    })

    it('creates QueueStack with custom initial capacity', () => {
      const qs = new QueueStack<number>({ initialCapacity: 32 })
      expect(qs.size).toBe(0)
    })

    it('creates QueueStack with no options', () => {
      const qs = new QueueStack<number>({})
      expect(qs.isEmpty()).toBe(true)
    })

    it('defaults initial capacity from DEFAULT_QUEUE_STACK_OPTIONS', () => {
      expect(DEFAULT_QUEUE_STACK_OPTIONS.initialCapacity).toBe(16)
    })
  })

  describe('enqueue / dequeue (queue operations)', () => {
    it('enqueue adds element', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      expect(qs.size).toBe(1)
    })

    it('dequeue returns undefined on empty', () => {
      const qs = new QueueStack<number>()
      expect(qs.dequeue()).toBeUndefined()
    })

    it('enqueue then dequeue returns value in FIFO order', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(10)
      qs.enqueue(20)
      qs.enqueue(30)
      expect(qs.dequeue()).toBe(10)
      expect(qs.dequeue()).toBe(20)
      expect(qs.dequeue()).toBe(30)
    })

    it('dequeue decreases size', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.dequeue()
      expect(qs.size).toBe(1)
    })

    it('handles single enqueue/dequeue cycle', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(42)
      expect(qs.dequeue()).toBe(42)
      expect(qs.size).toBe(0)
    })

    it('maintains FIFO over many operations', () => {
      const qs = new QueueStack<number>()
      for (let i = 0; i < 100; i++) {
        qs.enqueue(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(qs.dequeue()).toBe(i)
      }
    })

    it('interleaved enqueue and dequeue', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      expect(qs.dequeue()).toBe(1)
      qs.enqueue(3)
      expect(qs.dequeue()).toBe(2)
      expect(qs.dequeue()).toBe(3)
    })
  })

  describe('push / pop (stack operations)', () => {
    it('push adds element', () => {
      const qs = new QueueStack<number>()
      qs.push(1)
      expect(qs.size).toBe(1)
    })

    it('pop returns undefined on empty', () => {
      const qs = new QueueStack<number>()
      expect(qs.pop()).toBeUndefined()
    })

    it('push then pop returns value in LIFO order', () => {
      const qs = new QueueStack<number>()
      qs.push(10)
      qs.push(20)
      qs.push(30)
      expect(qs.pop()).toBe(30)
      expect(qs.pop()).toBe(20)
      expect(qs.pop()).toBe(10)
    })

    it('pop decreases size', () => {
      const qs = new QueueStack<number>()
      qs.push(1)
      qs.push(2)
      qs.pop()
      expect(qs.size).toBe(1)
    })

    it('handles single push/pop cycle', () => {
      const qs = new QueueStack<number>()
      qs.push(99)
      expect(qs.pop()).toBe(99)
      expect(qs.size).toBe(0)
    })

    it('maintains LIFO over many operations', () => {
      const qs = new QueueStack<number>()
      for (let i = 0; i < 100; i++) {
        qs.push(i)
      }
      for (let i = 99; i >= 0; i--) {
        expect(qs.pop()).toBe(i)
      }
    })
  })

  describe('hybrid operations', () => {
    it('enqueue then pop (queue push, stack pop)', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      expect(qs.pop()).toBe(3)
      expect(qs.pop()).toBe(2)
    })

    it('push then dequeue (stack push, queue pop)', () => {
      const qs = new QueueStack<number>()
      qs.push(1)
      qs.push(2)
      qs.push(3)
      expect(qs.dequeue()).toBe(1)
      expect(qs.dequeue()).toBe(2)
    })

    it('mixed enqueue, push, dequeue, pop', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.push(2)
      qs.enqueue(3)
      qs.push(4)
      expect(qs.dequeue()).toBe(1)
      expect(qs.pop()).toBe(4)
      expect(qs.dequeue()).toBe(2)
      expect(qs.pop()).toBe(3)
    })

    it('alternating enqueue and pop', () => {
      const qs = new QueueStack<string>()
      qs.enqueue('a')
      expect(qs.pop()).toBe('a')
      qs.enqueue('b')
      expect(qs.pop()).toBe('b')
      expect(qs.isEmpty()).toBe(true)
    })

    it('alternating push and dequeue', () => {
      const qs = new QueueStack<string>()
      qs.push('x')
      expect(qs.dequeue()).toBe('x')
      qs.push('y')
      expect(qs.dequeue()).toBe('y')
      expect(qs.isEmpty()).toBe(true)
    })

    it('works with strings', () => {
      const qs = new QueueStack<string>()
      qs.enqueue('hello')
      qs.push('world')
      expect(qs.dequeue()).toBe('hello')
      expect(qs.pop()).toBe('world')
    })

    it('works with objects', () => {
      const qs = new QueueStack<{ id: number }>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      qs.enqueue(obj1)
      qs.push(obj2)
      expect(qs.dequeue()).toBe(obj1)
      expect(qs.pop()).toBe(obj2)
    })
  })

  describe('peekFront', () => {
    it('returns undefined on empty', () => {
      const qs = new QueueStack<number>()
      expect(qs.peekFront()).toBeUndefined()
    })

    it('returns front element without removing', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      expect(qs.peekFront()).toBe(1)
      expect(qs.size).toBe(2)
    })

    it('updates after dequeue', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(10)
      qs.enqueue(20)
      qs.dequeue()
      expect(qs.peekFront()).toBe(20)
    })

    it('returns first pushed element', () => {
      const qs = new QueueStack<number>()
      qs.push(5)
      qs.push(6)
      expect(qs.peekFront()).toBe(5)
    })
  })

  describe('peekBack', () => {
    it('returns undefined on empty', () => {
      const qs = new QueueStack<number>()
      expect(qs.peekBack()).toBeUndefined()
    })

    it('returns back element without removing', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      expect(qs.peekBack()).toBe(2)
      expect(qs.size).toBe(2)
    })

    it('updates after pop', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(10)
      qs.enqueue(20)
      qs.pop()
      expect(qs.peekBack()).toBe(10)
    })

    it('returns last pushed element', () => {
      const qs = new QueueStack<number>()
      qs.push(5)
      qs.push(6)
      expect(qs.peekBack()).toBe(6)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 on new QueueStack', () => {
      const qs = new QueueStack<number>()
      expect(qs.size).toBe(0)
    })

    it('isEmpty returns true on new QueueStack', () => {
      const qs = new QueueStack<number>()
      expect(qs.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after enqueue', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      expect(qs.isEmpty()).toBe(false)
    })

    it('size increments on enqueue', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      expect(qs.size).toBe(2)
    })

    it('size decrements on dequeue', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.dequeue()
      expect(qs.size).toBe(1)
    })

    it('size decrements on pop', () => {
      const qs = new QueueStack<number>()
      qs.push(1)
      qs.push(2)
      qs.pop()
      expect(qs.size).toBe(1)
    })

    it('isEmpty returns true after draining', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.dequeue()
      expect(qs.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      qs.clear()
      expect(qs.size).toBe(0)
      expect(qs.isEmpty()).toBe(true)
    })

    it('clear resets statistics', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.push(2)
      qs.pop()
      qs.clear()
      const stats = qs.getStatistics()
      expect(stats.queuePushes).toBe(0)
      expect(stats.stackPushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.queuePops).toBe(0)
      expect(stats.stackPops).toBe(0)
    })

    it('clear on empty does nothing harmful', () => {
      const qs = new QueueStack<number>()
      qs.clear()
      expect(qs.size).toBe(0)
    })

    it('can add after clear', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.clear()
      qs.enqueue(2)
      expect(qs.size).toBe(1)
      expect(qs.peekFront()).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty QueueStack', () => {
      const qs = new QueueStack<number>()
      expect(qs.toArray()).toEqual([])
    })

    it('returns elements in order', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      expect(qs.toArray()).toEqual([1, 2, 3])
    })

    it('reflects mixed operations', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.push(2)
      qs.enqueue(3)
      expect(qs.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify the QueueStack', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.toArray()
      expect(qs.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty', () => {
      const qs = new QueueStack<number>()
      const collected: number[] = []
      qs.forEach((v) => collected.push(v))
      expect(collected).toEqual([])
    })

    it('iterates in order with correct index', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(10)
      qs.enqueue(20)
      qs.enqueue(30)
      const collected: Array<{ val: number; idx: number }> = []
      qs.forEach((v, i) => collected.push({ val: v, idx: i }))
      expect(collected).toEqual([
        { val: 10, idx: 0 },
        { val: 20, idx: 1 },
        { val: 30, idx: 2 },
      ])
    })

    it('iterates after mixed operations', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.dequeue()
      qs.enqueue(3)
      const collected: number[] = []
      qs.forEach((v) => collected.push(v))
      expect(collected).toEqual([2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('yields nothing on empty', () => {
      const qs = new QueueStack<number>()
      expect([...qs]).toEqual([])
    })

    it('yields elements in order', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      expect([...qs]).toEqual([1, 2, 3])
    })

    it('works with for-of loop', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(10)
      qs.enqueue(20)
      const sum: number[] = []
      for (const val of qs) {
        sum.push(val)
      }
      expect(sum).toEqual([10, 20])
    })

    it('works with spread operator', () => {
      const qs = new QueueStack<string>()
      qs.enqueue('a')
      qs.enqueue('b')
      const arr = [...qs]
      expect(arr).toEqual(['a', 'b'])
    })
  })

  describe('indexOf', () => {
    it('returns -1 on empty', () => {
      const qs = new QueueStack<number>()
      expect(qs.indexOf(1)).toBe(-1)
    })

    it('returns index of found element', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(10)
      qs.enqueue(20)
      qs.enqueue(30)
      expect(qs.indexOf(20)).toBe(1)
    })

    it('returns 0 for first element', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(5)
      expect(qs.indexOf(5)).toBe(0)
    })

    it('returns -1 for missing element', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      expect(qs.indexOf(99)).toBe(-1)
    })

    it('uses strict equality', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      expect(qs.indexOf(1)).toBe(0)
      expect(qs.indexOf('1' as unknown as number)).toBe(-1)
    })
  })

  describe('contains', () => {
    it('returns false on empty', () => {
      const qs = new QueueStack<number>()
      expect(qs.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(42)
      expect(qs.contains(42)).toBe(true)
    })

    it('returns false for missing element', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      expect(qs.contains(2)).toBe(false)
    })

    it('finds elements after mixed operations', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.push(2)
      qs.enqueue(3)
      qs.pop()
      expect(qs.contains(1)).toBe(true)
      expect(qs.contains(2)).toBe(true)
      expect(qs.contains(3)).toBe(false)
    })
  })

  describe('reverse', () => {
    it('does nothing on empty', () => {
      const qs = new QueueStack<number>()
      qs.reverse()
      expect(qs.toArray()).toEqual([])
    })

    it('does nothing on single element', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.reverse()
      expect(qs.toArray()).toEqual([1])
    })

    it('reverses two elements', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.reverse()
      expect(qs.toArray()).toEqual([2, 1])
    })

    it('reverses many elements', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      qs.enqueue(4)
      qs.enqueue(5)
      qs.reverse()
      expect(qs.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('reverse then dequeue/pop works correctly', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      qs.reverse()
      expect(qs.dequeue()).toBe(3)
      expect(qs.pop()).toBe(1)
    })

    it('double reverse restores order', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      qs.reverse()
      qs.reverse()
      expect(qs.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('enqueueMany', () => {
    it('adds multiple values via enqueue', () => {
      const qs = new QueueStack<number>()
      qs.enqueueMany(1, 2, 3)
      expect(qs.size).toBe(3)
      expect(qs.toArray()).toEqual([1, 2, 3])
    })

    it('adds zero values', () => {
      const qs = new QueueStack<number>()
      qs.enqueueMany()
      expect(qs.size).toBe(0)
    })

    it('updates queuePushes statistic', () => {
      const qs = new QueueStack<number>()
      qs.enqueueMany(10, 20, 30)
      expect(qs.getStatistics().queuePushes).toBe(3)
    })

    it('can enqueue many after existing elements', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(0)
      qs.enqueueMany(1, 2)
      expect(qs.toArray()).toEqual([0, 1, 2])
    })
  })

  describe('pushMany', () => {
    it('adds multiple values via push', () => {
      const qs = new QueueStack<number>()
      qs.pushMany(1, 2, 3)
      expect(qs.size).toBe(3)
      expect(qs.toArray()).toEqual([1, 2, 3])
    })

    it('adds zero values', () => {
      const qs = new QueueStack<number>()
      qs.pushMany()
      expect(qs.size).toBe(0)
    })

    it('updates stackPushes statistic', () => {
      const qs = new QueueStack<number>()
      qs.pushMany(10, 20, 30)
      expect(qs.getStatistics().stackPushes).toBe(3)
    })

    it('can pushMany after existing elements', () => {
      const qs = new QueueStack<number>()
      qs.push(0)
      qs.pushMany(1, 2)
      expect(qs.toArray()).toEqual([0, 1, 2])
    })
  })

  describe('getStatistics', () => {
    it('returns zeros initially', () => {
      const qs = new QueueStack<number>()
      const stats = qs.getStatistics()
      expect(stats.queuePushes).toBe(0)
      expect(stats.stackPushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.queuePops).toBe(0)
      expect(stats.stackPops).toBe(0)
    })

    it('tracks queuePushes', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      expect(qs.getStatistics().queuePushes).toBe(2)
    })

    it('tracks stackPushes', () => {
      const qs = new QueueStack<number>()
      qs.push(1)
      qs.push(2)
      expect(qs.getStatistics().stackPushes).toBe(2)
    })

    it('tracks queuePops', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.dequeue()
      qs.dequeue()
      expect(qs.getStatistics().queuePops).toBe(2)
    })

    it('tracks stackPops', () => {
      const qs = new QueueStack<number>()
      qs.push(1)
      qs.push(2)
      qs.pop()
      qs.pop()
      expect(qs.getStatistics().stackPops).toBe(2)
    })

    it('tracks total pops', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.push(2)
      qs.dequeue()
      qs.pop()
      expect(qs.getStatistics().pops).toBe(2)
    })

    it('returns a copy', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      const stats1 = qs.getStatistics()
      qs.enqueue(2)
      const stats2 = qs.getStatistics()
      expect(stats1.queuePushes).toBe(1)
      expect(stats2.queuePushes).toBe(2)
    })

    it('mixed operations all tracked', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.push(2)
      qs.enqueue(3)
      qs.dequeue()
      qs.pop()
      const stats = qs.getStatistics()
      expect(stats.queuePushes).toBe(2)
      expect(stats.stackPushes).toBe(1)
      expect(stats.queuePops).toBe(1)
      expect(stats.stackPops).toBe(1)
      expect(stats.pops).toBe(2)
    })
  })

  describe('capacity growth', () => {
    it('grows beyond initial capacity', () => {
      const qs = new QueueStack<number>({ initialCapacity: 4 })
      for (let i = 0; i < 20; i++) {
        qs.enqueue(i)
      }
      expect(qs.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(qs.dequeue()).toBe(i)
      }
    })

    it('grows with push operations', () => {
      const qs = new QueueStack<number>({ initialCapacity: 4 })
      for (let i = 0; i < 20; i++) {
        qs.push(i)
      }
      expect(qs.size).toBe(20)
      for (let i = 19; i >= 0; i--) {
        expect(qs.pop()).toBe(i)
      }
    })

    it('handles wrap-around after growth', () => {
      const qs = new QueueStack<number>({ initialCapacity: 4 })
      qs.enqueue(1)
      qs.enqueue(2)
      qs.enqueue(3)
      qs.dequeue()
      qs.dequeue()
      qs.enqueue(4)
      qs.enqueue(5)
      qs.enqueue(6)
      qs.enqueue(7)
      expect(qs.toArray()).toEqual([3, 4, 5, 6, 7])
    })

    it('enqueueMany triggers growth', () => {
      const qs = new QueueStack<number>({ initialCapacity: 2 })
      qs.enqueueMany(1, 2, 3, 4, 5)
      expect(qs.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('edge cases', () => {
    it('handles null values', () => {
      const qs = new QueueStack<number | null>()
      qs.enqueue(null)
      expect(qs.peekFront()).toBe(null)
      expect(qs.dequeue()).toBe(null)
    })

    it('handles undefined values', () => {
      const qs = new QueueStack<number | undefined>()
      qs.enqueue(undefined)
      expect(qs.peekFront()).toBe(undefined)
      expect(qs.contains(undefined)).toBe(true)
    })

    it('handles zero values', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(0)
      expect(qs.contains(0)).toBe(true)
      expect(qs.indexOf(0)).toBe(0)
    })

    it('handles false values', () => {
      const qs = new QueueStack<boolean>()
      qs.enqueue(false)
      expect(qs.contains(false)).toBe(true)
      expect(qs.dequeue()).toBe(false)
    })

    it('handles empty string', () => {
      const qs = new QueueStack<string>()
      qs.enqueue('')
      expect(qs.contains('')).toBe(true)
      expect(qs.dequeue()).toBe('')
    })

    it('drain then refill', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(1)
      qs.enqueue(2)
      qs.dequeue()
      qs.dequeue()
      qs.enqueue(3)
      expect(qs.size).toBe(1)
      expect(qs.dequeue()).toBe(3)
    })

    it('multiple clear and refill cycles', () => {
      const qs = new QueueStack<number>()
      for (let cycle = 0; cycle < 5; cycle++) {
        qs.enqueue(cycle)
        qs.clear()
      }
      expect(qs.isEmpty()).toBe(true)
      qs.enqueue(99)
      expect(qs.dequeue()).toBe(99)
    })
  })

  describe('types import', () => {
    it('QueueStackOptions type is usable', () => {
      const opts: QueueStackOptions = { initialCapacity: 8 }
      const qs = new QueueStack<number>(opts)
      qs.enqueue(1)
      expect(qs.size).toBe(1)
    })

    it('DEFAULT_QUEUE_STACK_OPTIONS is exported', () => {
      expect(DEFAULT_QUEUE_STACK_OPTIONS.initialCapacity).toBe(16)
    })
  })

  describe('generic type support', () => {
    it('works with number type', () => {
      const qs = new QueueStack<number>()
      qs.enqueue(42)
      expect(qs.dequeue()).toBe(42)
    })

    it('works with string type', () => {
      const qs = new QueueStack<string>()
      qs.enqueue('test')
      expect(qs.dequeue()).toBe('test')
    })

    it('works with boolean type', () => {
      const qs = new QueueStack<boolean>()
      qs.enqueue(true)
      qs.enqueue(false)
      expect(qs.toArray()).toEqual([true, false])
    })

    it('works with array type', () => {
      const qs = new QueueStack<number[]>()
      qs.enqueue([1, 2])
      qs.enqueue([3, 4])
      expect(qs.pop()).toEqual([3, 4])
    })

    it('works with Map type', () => {
      const qs = new QueueStack<Map<string, number>>()
      const m = new Map([['a', 1]])
      qs.push(m)
      expect(qs.pop()).toBe(m)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 enqueue/dequeue operations', () => {
      const qs = new QueueStack<number>()
      for (let i = 0; i < 1000; i++) {
        qs.enqueue(i)
      }
      for (let i = 0; i < 1000; i++) {
        expect(qs.dequeue()).toBe(i)
      }
      expect(qs.isEmpty()).toBe(true)
    })

    it('handles 1000 push/pop operations', () => {
      const qs = new QueueStack<number>()
      for (let i = 0; i < 1000; i++) {
        qs.push(i)
      }
      for (let i = 999; i >= 0; i--) {
        expect(qs.pop()).toBe(i)
      }
      expect(qs.isEmpty()).toBe(true)
    })

    it('handles 1000 mixed operations', () => {
      const qs = new QueueStack<number>()
      for (let i = 0; i < 500; i++) {
        qs.enqueue(i)
      }
      for (let i = 500; i < 1000; i++) {
        qs.push(i)
      }
      expect(qs.size).toBe(1000)
      expect(qs.peekFront()).toBe(0)
      expect(qs.peekBack()).toBe(999)
    })
  })
})
