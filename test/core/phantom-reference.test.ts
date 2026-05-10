import { describe, it, expect, beforeEach } from 'vitest'
import { PhantomReferenceQueue } from '../../src/core/phantom-reference/phantom-reference.js'
import {
  DEFAULT_PHANTOM_REFERENCE_OPTIONS,
  type PhantomRef,
  type PhantomReferenceOptions,
  type PhantomReferenceStatistics,
} from '../../src/core/phantom-reference/types.js'

describe('PhantomReferenceQueue', () => {
  let queue: PhantomReferenceQueue<object>

  beforeEach(() => {
    queue = new PhantomReferenceQueue<object>()
  })

  describe('constructor', () => {
    it('creates instance with default options', () => {
      const q = new PhantomReferenceQueue<object>()
      expect(q).toBeInstanceOf(PhantomReferenceQueue)
    })

    it('creates instance with custom options', () => {
      const q = new PhantomReferenceQueue<object>({ checkInterval: 500 })
      expect(q).toBeInstanceOf(PhantomReferenceQueue)
    })

    it('creates instance with empty options', () => {
      const q = new PhantomReferenceQueue<object>({})
      expect(q).toBeInstanceOf(PhantomReferenceQueue)
    })

    it('starts with size 0', () => {
      expect(queue.size).toBe(0)
    })

    it('starts with queueSize 0', () => {
      expect(queue.queueSize).toBe(0)
    })

    it('starts empty', () => {
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('register', () => {
    it('returns a numeric id', () => {
      const obj = { name: 'test' }
      const id = queue.register(obj)
      expect(id).toBeTypeOf('number')
    })

    it('returns incrementing ids', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      const id3 = queue.register({ name: 'c' })
      expect(id1).toBeLessThan(id2)
      expect(id2).toBeLessThan(id3)
    })

    it('increases size by 1', () => {
      queue.register({ name: 'a' })
      expect(queue.size).toBe(1)
      queue.register({ name: 'b' })
      expect(queue.size).toBe(2)
    })

    it('registers with onFinalize callback', () => {
      const cb = (_ref: PhantomRef<object>) => {}
      const id = queue.register({ name: 'test' }, cb)
      expect(queue.isRegistered(id)).toBe(true)
    })

    it('registers without onFinalize callback', () => {
      const id = queue.register({ name: 'test' })
      expect(queue.isRegistered(id)).toBe(true)
    })

    it('tracks registered count in statistics', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.register({ name: 'c' })
      const stats = queue.getStatistics()
      expect(stats.registered).toBe(3)
    })

    it('does not affect queueSize', () => {
      queue.register({ name: 'a' })
      expect(queue.queueSize).toBe(0)
    })

    it('accepts null values', () => {
      const nullQueue = new PhantomReferenceQueue<object | null>()
      const id = nullQueue.register(null)
      expect(nullQueue.isRegistered(id)).toBe(true)
    })

    it('accepts primitive wrapper values', () => {
      const strQueue = new PhantomReferenceQueue<string>()
      const id = strQueue.register('hello')
      expect(strQueue.isRegistered(id)).toBe(true)
    })

    it('accepts number values', () => {
      const numQueue = new PhantomReferenceQueue<number>()
      const id = numQueue.register(42)
      expect(numQueue.isRegistered(id)).toBe(true)
    })
  })

  describe('isRegistered', () => {
    it('returns true for registered id', () => {
      const id = queue.register({ name: 'test' })
      expect(queue.isRegistered(id)).toBe(true)
    })

    it('returns false for unknown id', () => {
      expect(queue.isRegistered(999)).toBe(false)
    })

    it('returns false for negative id', () => {
      expect(queue.isRegistered(-1)).toBe(false)
    })

    it('returns false for id 0', () => {
      expect(queue.isRegistered(0)).toBe(false)
    })

    it('returns false after clear', () => {
      const id = queue.register({ name: 'test' })
      queue.clear(id)
      expect(queue.isRegistered(id)).toBe(false)
    })

    it('returns true after enqueue but before clear', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.isRegistered(id)).toBe(true)
    })

    it('returns true for multiple registered refs', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      const id3 = queue.register({ name: 'c' })
      expect(queue.isRegistered(id1)).toBe(true)
      expect(queue.isRegistered(id2)).toBe(true)
      expect(queue.isRegistered(id3)).toBe(true)
    })
  })

  describe('enqueue', () => {
    it('returns true for valid registered id', () => {
      const id = queue.register({ name: 'test' })
      expect(queue.enqueue(id)).toBe(true)
    })

    it('returns false for unknown id', () => {
      expect(queue.enqueue(999)).toBe(false)
    })

    it('returns false for already enqueued id', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.enqueue(id)).toBe(false)
    })

    it('returns false for cleared id', () => {
      const id = queue.register({ name: 'test' })
      queue.clear(id)
      expect(queue.enqueue(id)).toBe(false)
    })

    it('increments queueSize', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.queueSize).toBe(1)
    })

    it('sets value to null on the ref', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      const all = queue.getAll()
      const ref = all.find((r) => r.id === id)
      expect(ref?.value).toBeNull()
    })

    it('sets enqueued to true', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      const all = queue.getAll()
      const ref = all.find((r) => r.id === id)
      expect(ref?.enqueued).toBe(true)
    })

    it('maintains FIFO order in queue', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      const id3 = queue.register({ name: 'c' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.enqueue(id3)
      const first = queue.poll()
      expect(first?.id).toBe(id1)
      const second = queue.poll()
      expect(second?.id).toBe(id2)
      const third = queue.poll()
      expect(third?.id).toBe(id3)
    })

    it('increments enqueued in statistics', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      const stats = queue.getStatistics()
      expect(stats.enqueued).toBe(2)
    })

    it('does not change size', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.size).toBe(1)
    })
  })

  describe('poll', () => {
    it('returns null when queue is empty', () => {
      expect(queue.poll()).toBeNull()
    })

    it('returns PhantomRef when queue has items', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      const ref = queue.poll()
      expect(ref).not.toBeNull()
      expect(ref?.id).toBe(id)
    })

    it('returns ref with null value', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      const ref = queue.poll()
      expect(ref?.value).toBeNull()
    })

    it('returns ref with enqueued=true', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      const ref = queue.poll()
      expect(ref?.enqueued).toBe(true)
    })

    it('dequeues items in FIFO order', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      expect(queue.poll()?.id).toBe(id1)
      expect(queue.poll()?.id).toBe(id2)
    })

    it('decrements queueSize', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.queueSize).toBe(1)
      queue.poll()
      expect(queue.queueSize).toBe(0)
    })

    it('returns null after all items polled', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      queue.poll()
      expect(queue.poll()).toBeNull()
    })

    it('returns ref with cleared=false', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      const ref = queue.poll()
      expect(ref?.cleared).toBe(false)
    })

    it('handles multiple polls interleaved with enqueues', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      const id3 = queue.register({ name: 'c' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      expect(queue.poll()?.id).toBe(id1)
      queue.enqueue(id3)
      expect(queue.poll()?.id).toBe(id2)
      expect(queue.poll()?.id).toBe(id3)
    })
  })

  describe('clear', () => {
    it('returns true for valid registered id', () => {
      const id = queue.register({ name: 'test' })
      expect(queue.clear(id)).toBe(true)
    })

    it('returns false for unknown id', () => {
      expect(queue.clear(999)).toBe(false)
    })

    it('returns false for already cleared id', () => {
      const id = queue.register({ name: 'test' })
      queue.clear(id)
      expect(queue.clear(id)).toBe(false)
    })

    it('decrements size', () => {
      const id = queue.register({ name: 'test' })
      expect(queue.size).toBe(1)
      queue.clear(id)
      expect(queue.size).toBe(0)
    })

    it('removes from queue if enqueued', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.queueSize).toBe(1)
      queue.clear(id)
      expect(queue.queueSize).toBe(0)
    })

    it('sets value to null', () => {
      const id = queue.register({ name: 'test' })
      queue.clear(id)
      const all = queue.getAll()
      expect(all.find((r) => r.id === id)).toBeUndefined()
    })

    it('increments cleared in statistics', () => {
      const id = queue.register({ name: 'test' })
      queue.clear(id)
      const stats = queue.getStatistics()
      expect(stats.cleared).toBe(1)
    })

    it('clearing specific ref does not affect others', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.clear(id1)
      expect(queue.isRegistered(id1)).toBe(false)
      expect(queue.isRegistered(id2)).toBe(true)
    })

    it('poll returns null after clear of enqueued ref', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      queue.clear(id)
      expect(queue.poll()).toBeNull()
    })

    it('clears ref that was not enqueued', () => {
      const id = queue.register({ name: 'test' })
      expect(queue.clear(id)).toBe(true)
      expect(queue.isRegistered(id)).toBe(false)
    })
  })

  describe('clearAll', () => {
    it('returns 0 when empty', () => {
      expect(queue.clearAll()).toBe(0)
    })

    it('returns count of cleared refs', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.register({ name: 'c' })
      expect(queue.clearAll()).toBe(3)
    })

    it('sets size to 0', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.clearAll()
      expect(queue.size).toBe(0)
    })

    it('sets queueSize to 0', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.clearAll()
      expect(queue.queueSize).toBe(0)
    })

    it('makes isEmpty return true', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.clearAll()
      expect(queue.isEmpty()).toBe(true)
    })

    it('clears only non-cleared refs', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.clear(id1)
      const cleared = queue.clearAll()
      expect(cleared).toBe(1)
    })

    it('increments statistics cleared count', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.clearAll()
      const stats = queue.getStatistics()
      expect(stats.cleared).toBe(2)
    })

    it('clearing already cleared refs returns 0', () => {
      queue.register({ name: 'a' })
      queue.clearAll()
      expect(queue.clearAll()).toBe(0)
    })
  })

  describe('processQueue', () => {
    it('returns 0 when queue is empty', () => {
      expect(queue.processQueue()).toBe(0)
    })

    it('returns count of processed refs', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      expect(queue.processQueue()).toBe(2)
    })

    it('calls onFinalize for each ref', () => {
      let callCount = 0
      const cb = () => {
        callCount++
      }
      const id1 = queue.register({ name: 'a' }, cb)
      const id2 = queue.register({ name: 'b' }, cb)
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.processQueue()
      expect(callCount).toBe(2)
    })

    it('passes PhantomRef to onFinalize with correct id', () => {
      let receivedId = -1
      const cb = (ref: PhantomRef<object>) => {
        receivedId = ref.id
      }
      const id = queue.register({ name: 'test' }, cb)
      queue.enqueue(id)
      queue.processQueue()
      expect(receivedId).toBe(id)
    })

    it('passes PhantomRef with null value to onFinalize', () => {
      let receivedValue: object | null = 'not-null'
      const cb = (ref: PhantomRef<object>) => {
        receivedValue = ref.value
      }
      queue.register({ name: 'test' }, cb)
      const id = queue.register({ name: 'test2' }, cb)
      queue.enqueue(id)
      queue.processQueue()
      expect(receivedValue).toBeNull()
    })

    it('passes PhantomRef with enqueued=true to onFinalize', () => {
      let receivedEnqueued = false
      const cb = (ref: PhantomRef<object>) => {
        receivedEnqueued = ref.enqueued
      }
      const id = queue.register({ name: 'test' }, cb)
      queue.enqueue(id)
      queue.processQueue()
      expect(receivedEnqueued).toBe(true)
    })

    it('passes PhantomRef with cleared=true to onFinalize', () => {
      let receivedCleared = false
      const cb = (ref: PhantomRef<object>) => {
        receivedCleared = ref.cleared
      }
      const id = queue.register({ name: 'test' }, cb)
      queue.enqueue(id)
      queue.processQueue()
      expect(receivedCleared).toBe(true)
    })

    it('clears refs after processing', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      queue.processQueue()
      expect(queue.isRegistered(id)).toBe(false)
    })

    it('empties the queue', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      const id1 = queue.register({ name: 'c' })
      const id2 = queue.register({ name: 'd' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.processQueue()
      expect(queue.queueSize).toBe(0)
    })

    it('skips refs without onFinalize', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.processQueue()).toBe(1)
    })

    it('decreases size by processed count', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.register({ name: 'c' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      const before = queue.size
      queue.processQueue()
      expect(queue.size).toBe(before - 2)
    })

    it('increments cleared in statistics', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.processQueue()
      const stats = queue.getStatistics()
      expect(stats.cleared).toBe(2)
    })

    it('processes in FIFO order', () => {
      const order: number[] = []
      const cb = (ref: PhantomRef<object>) => {
        order.push(ref.id)
      }
      const id1 = queue.register({ name: 'a' }, cb)
      const id2 = queue.register({ name: 'b' }, cb)
      const id3 = queue.register({ name: 'c' }, cb)
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.enqueue(id3)
      queue.processQueue()
      expect(order).toEqual([id1, id2, id3])
    })

    it('handles empty queue gracefully', () => {
      queue.register({ name: 'a' })
      expect(queue.processQueue()).toBe(0)
    })
  })

  describe('size', () => {
    it('returns 0 initially', () => {
      expect(queue.size).toBe(0)
    })

    it('increases with register', () => {
      queue.register({ name: 'a' })
      expect(queue.size).toBe(1)
      queue.register({ name: 'b' })
      expect(queue.size).toBe(2)
    })

    it('decreases with clear', () => {
      const id = queue.register({ name: 'a' })
      queue.clear(id)
      expect(queue.size).toBe(0)
    })

    it('does not change with enqueue', () => {
      const id = queue.register({ name: 'a' })
      queue.enqueue(id)
      expect(queue.size).toBe(1)
    })

    it('decreases with processQueue', () => {
      const id = queue.register({ name: 'a' })
      queue.enqueue(id)
      queue.processQueue()
      expect(queue.size).toBe(0)
    })

    it('reflects clearAll', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.clearAll()
      expect(queue.size).toBe(0)
    })

    it('tracks active refs correctly after mixed operations', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      const id3 = queue.register({ name: 'c' })
      queue.clear(id1)
      queue.enqueue(id2)
      expect(queue.size).toBe(2)
      queue.processQueue()
      expect(queue.size).toBe(1)
      expect(queue.isRegistered(id3)).toBe(true)
    })
  })

  describe('queueSize', () => {
    it('returns 0 initially', () => {
      expect(queue.queueSize).toBe(0)
    })

    it('increases with enqueue', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.queueSize).toBe(1)
    })

    it('decreases with poll', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      queue.poll()
      expect(queue.queueSize).toBe(0)
    })

    it('decreases with clear of enqueued ref', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      queue.clear(id)
      expect(queue.queueSize).toBe(0)
    })

    it('resets with clearAll', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.clearAll()
      expect(queue.queueSize).toBe(0)
    })

    it('resets with processQueue', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      queue.processQueue()
      expect(queue.queueSize).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true initially', () => {
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns false after register', () => {
      queue.register({ name: 'test' })
      expect(queue.isEmpty()).toBe(false)
    })

    it('returns true after clearing all', () => {
      const id = queue.register({ name: 'test' })
      queue.clear(id)
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns false when only enqueued refs exist', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      expect(queue.isEmpty()).toBe(false)
    })

    it('returns true after processQueue clears all', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      queue.processQueue()
      expect(queue.isEmpty()).toBe(true)
    })

    it('returns false with mixed registered and enqueued refs', () => {
      const id1 = queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.enqueue(id1)
      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(queue.getAll()).toEqual([])
    })

    it('returns all active refs', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      expect(queue.getAll().length).toBe(2)
    })

    it('does not return cleared refs', () => {
      const id = queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.clear(id)
      expect(queue.getAll().length).toBe(1)
    })

    it('returns refs with correct shape', () => {
      queue.register({ name: 'test' })
      const refs = queue.getAll()
      expect(refs[0]).toHaveProperty('id')
      expect(refs[0]).toHaveProperty('value')
      expect(refs[0]).toHaveProperty('enqueued')
      expect(refs[0]).toHaveProperty('cleared')
    })

    it('returns refs with correct value', () => {
      const obj = { name: 'test' }
      queue.register(obj)
      const refs = queue.getAll()
      expect(refs[0]?.value).toBe(obj)
    })

    it('returns refs with enqueued=false by default', () => {
      queue.register({ name: 'test' })
      const refs = queue.getAll()
      expect(refs[0]?.enqueued).toBe(false)
    })

    it('returns refs with cleared=false by default', () => {
      queue.register({ name: 'test' })
      const refs = queue.getAll()
      expect(refs[0]?.cleared).toBe(false)
    })

    it('returns enqueued refs that are not yet cleared', () => {
      const id = queue.register({ name: 'test' })
      queue.enqueue(id)
      const refs = queue.getAll()
      expect(refs.length).toBe(1)
      expect(refs[0]?.enqueued).toBe(true)
      expect(refs[0]?.value).toBeNull()
    })

    it('returns defensive copies', () => {
      queue.register({ name: 'test' })
      const refs1 = queue.getAll()
      const refs2 = queue.getAll()
      expect(refs1).not.toBe(refs2)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const stats = queue.getStatistics()
      expect(stats.registered).toBe(0)
      expect(stats.enqueued).toBe(0)
      expect(stats.cleared).toBe(0)
      expect(stats.checks).toBe(1)
    })

    it('increments checks on each call', () => {
      queue.getStatistics()
      queue.getStatistics()
      queue.getStatistics()
      const stats = queue.getStatistics()
      expect(stats.checks).toBe(4)
    })

    it('tracks registered count', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      const stats = queue.getStatistics()
      expect(stats.registered).toBe(2)
    })

    it('tracks enqueued count', () => {
      const id = queue.register({ name: 'a' })
      queue.enqueue(id)
      const stats = queue.getStatistics()
      expect(stats.enqueued).toBe(1)
    })

    it('tracks cleared count', () => {
      const id = queue.register({ name: 'a' })
      queue.clear(id)
      const stats = queue.getStatistics()
      expect(stats.cleared).toBe(1)
    })

    it('tracks cleared from processQueue', () => {
      const id = queue.register({ name: 'a' })
      queue.enqueue(id)
      queue.processQueue()
      const stats = queue.getStatistics()
      expect(stats.cleared).toBe(1)
    })

    it('tracks cleared from clearAll', () => {
      queue.register({ name: 'a' })
      queue.register({ name: 'b' })
      queue.clearAll()
      const stats = queue.getStatistics()
      expect(stats.cleared).toBe(2)
    })

    it('returns a snapshot (not mutable)', () => {
      queue.register({ name: 'a' })
      const stats1 = queue.getStatistics()
      queue.register({ name: 'b' })
      const stats2 = queue.getStatistics()
      expect(stats1.registered).not.toBe(stats2.registered)
    })
  })

  describe('integration scenarios', () => {
    it('simulates GC lifecycle: register, enqueue, poll, process', () => {
      let finalized = false
      const id = queue.register({ data: 'important' }, () => {
        finalized = true
      })
      expect(queue.isRegistered(id)).toBe(true)
      expect(queue.size).toBe(1)

      queue.enqueue(id)
      expect(queue.queueSize).toBe(1)
      expect(queue.isRegistered(id)).toBe(true)

      const ref = queue.poll()
      expect(ref?.id).toBe(id)
      expect(ref?.value).toBeNull()
      expect(queue.queueSize).toBe(0)

      expect(finalized).toBe(false)
    })

    it('handles full lifecycle with processQueue', () => {
      let finalized = false
      const id = queue.register({ data: 'important' }, () => {
        finalized = true
      })
      queue.enqueue(id)
      queue.processQueue()
      expect(finalized).toBe(true)
      expect(queue.isRegistered(id)).toBe(false)
      expect(queue.isEmpty()).toBe(true)
    })

    it('handles multiple objects lifecycle', () => {
      const finalizedIds: number[] = []
      const cb = (ref: PhantomRef<object>) => {
        finalizedIds.push(ref.id)
      }
      const id1 = queue.register({ name: 'a' }, cb)
      const id2 = queue.register({ name: 'b' }, cb)
      const id3 = queue.register({ name: 'c' }, cb)
      queue.enqueue(id1)
      queue.enqueue(id3)
      queue.processQueue()
      expect(finalizedIds).toEqual([id1, id3])
      expect(queue.isRegistered(id2)).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('handles clear before processQueue', () => {
      let finalized = false
      const id = queue.register({ name: 'test' }, () => {
        finalized = true
      })
      queue.enqueue(id)
      queue.clear(id)
      queue.processQueue()
      expect(finalized).toBe(false)
    })

    it('handles register after clearAll', () => {
      queue.register({ name: 'a' })
      queue.clearAll()
      const id = queue.register({ name: 'b' })
      expect(queue.isRegistered(id)).toBe(true)
      expect(queue.size).toBe(1)
    })

    it('handles interleaved operations', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      queue.enqueue(id1)
      const ref1 = queue.poll()
      expect(ref1?.id).toBe(id1)
      queue.clear(id2)
      const id3 = queue.register({ name: 'c' })
      queue.enqueue(id3)
      queue.processQueue()
      expect(queue.size).toBe(0)
    })

    it('handles large number of refs', () => {
      const ids: number[] = []
      for (let i = 0; i < 100; i++) {
        ids.push(queue.register({ index: i }))
      }
      expect(queue.size).toBe(100)
      for (const id of ids) {
        queue.enqueue(id)
      }
      expect(queue.queueSize).toBe(100)
      const processed = queue.processQueue()
      expect(processed).toBe(100)
      expect(queue.isEmpty()).toBe(true)
    })

    it('statistics accumulate correctly across operations', () => {
      const id1 = queue.register({ name: 'a' })
      const id2 = queue.register({ name: 'b' })
      const id3 = queue.register({ name: 'c' })
      queue.enqueue(id1)
      queue.enqueue(id2)
      queue.clear(id3)
      queue.processQueue()
      const stats = queue.getStatistics()
      expect(stats.registered).toBe(3)
      expect(stats.enqueued).toBe(2)
      expect(stats.cleared).toBe(3)
    })
  })
})

describe('types', () => {
  it('exports DEFAULT_PHANTOM_REFERENCE_OPTIONS with checkInterval', () => {
    expect(DEFAULT_PHANTOM_REFERENCE_OPTIONS).toHaveProperty('checkInterval')
    expect(DEFAULT_PHANTOM_REFERENCE_OPTIONS.checkInterval).toBe(1000)
  })

  it('PhantomReferenceOptions is optional', () => {
    const opts: PhantomReferenceOptions = {}
    expect(opts.checkInterval).toBeUndefined()
  })

  it('PhantomReferenceOptions accepts checkInterval', () => {
    const opts: PhantomReferenceOptions = { checkInterval: 500 }
    expect(opts.checkInterval).toBe(500)
  })

  it('PhantomRef has correct shape', () => {
    const ref: PhantomRef<string> = {
      id: 1,
      value: 'test',
      enqueued: false,
      cleared: false,
    }
    expect(ref.id).toBe(1)
    expect(ref.value).toBe('test')
    expect(ref.enqueued).toBe(false)
    expect(ref.cleared).toBe(false)
  })

  it('PhantomRef value can be null', () => {
    const ref: PhantomRef<string> = {
      id: 1,
      value: null,
      enqueued: true,
      cleared: false,
    }
    expect(ref.value).toBeNull()
  })

  it('PhantomReferenceStatistics has correct shape', () => {
    const stats: PhantomReferenceStatistics = {
      registered: 10,
      enqueued: 5,
      cleared: 3,
      checks: 7,
    }
    expect(stats.registered).toBe(10)
    expect(stats.enqueued).toBe(5)
    expect(stats.cleared).toBe(3)
    expect(stats.checks).toBe(7)
  })
})
