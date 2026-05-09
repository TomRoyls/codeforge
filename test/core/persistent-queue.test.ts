import { describe, expect, it } from 'vitest'
import { PersistentQueue } from '../../src/core/persistent-queue/persistent-queue'

describe('PersistentQueue', () => {
  describe('empty', () => {
    it('creates an empty queue', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns 0 for size', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.size()).toBe(0)
    })

    it('returns undefined for peek', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.peek()).toBeUndefined()
    })

    it('returns undefined for last', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.last()).toBeUndefined()
    })

    it('returns undefined when dequeued', () => {
      const q = PersistentQueue.empty<number>()
      const { value, queue } = q.dequeue()
      expect(value).toBeUndefined()
      expect(queue.size()).toBe(0)
    })

    it('returns empty array for toArray', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns version 0', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.version).toBe(0)
    })

    it('returns null for previous', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.previous()).toBeNull()
    })

    it('returns history with only itself', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.history()).toHaveLength(1)
      expect(q.history()[0]).toBe(q)
    })

    it('toString returns empty representation', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.toString()).toBe('PersistentQueue([])')
    })

    it('has a timestamp', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.timestamp).toBeTypeOf('number')
      expect(q.timestamp).toBeGreaterThan(0)
    })
  })

  describe('enqueue', () => {
    it('returns a new queue with the element added', () => {
      const q = PersistentQueue.empty<number>()
      const q2 = q.enqueue(1)
      expect(q2.size()).toBe(1)
      expect(q2.peek()).toBe(1)
    })

    it('leaves the original queue unchanged', () => {
      const q = PersistentQueue.empty<number>()
      q.enqueue(1)
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('increments the version', () => {
      const q = PersistentQueue.empty<number>()
      const q2 = q.enqueue(1)
      expect(q2.version).toBe(1)
      expect(q2.version).not.toBe(q.version)
    })

    it('updates size correctly for multiple enqueues', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      expect(q.size()).toBe(3)
    })

    it('updates last correctly', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      expect(q.last()).toBe(3)
    })

    it('queues elements in FIFO order', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      expect(q.peek()).toBe(1)
      expect(q.last()).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns correct peek after single enqueue', () => {
      const q = PersistentQueue.empty<number>().enqueue(42)
      expect(q.peek()).toBe(42)
    })

    it('returns correct last after single enqueue', () => {
      const q = PersistentQueue.empty<number>().enqueue(42)
      expect(q.last()).toBe(42)
    })

    it('sets a new timestamp', () => {
      const q = PersistentQueue.empty<number>()
      const q2 = q.enqueue(1)
      expect(q2.timestamp).toBeGreaterThanOrEqual(q.timestamp)
    })

    it('sets previous to the original queue', () => {
      const q = PersistentQueue.empty<number>()
      const q2 = q.enqueue(1)
      expect(q2.previous()).toBe(q)
    })
  })

  describe('dequeue', () => {
    it('returns the front element', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { value } = q.dequeue()
      expect(value).toBe(1)
    })

    it('returns a new queue without the front element', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: q2 } = q.dequeue()
      expect(q2.peek()).toBe(2)
      expect(q2.size()).toBe(2)
    })

    it('leaves the original queue unchanged', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      q.dequeue()
      expect(q.size()).toBe(3)
      expect(q.peek()).toBe(1)
    })

    it('increments the version', () => {
      const q = PersistentQueue.empty<number>().enqueue(1)
      const { queue: q2 } = q.dequeue()
      expect(q2.version).toBe(q.version + 1)
    })

    it('maintains FIFO order across multiple dequeues', () => {
      const q = PersistentQueue.empty<number>().enqueue(10).enqueue(20).enqueue(30)
      const r1 = q.dequeue()
      expect(r1.value).toBe(10)
      const r2 = r1.queue.dequeue()
      expect(r2.value).toBe(20)
      const r3 = r2.queue.dequeue()
      expect(r3.value).toBe(30)
    })

    it('returns undefined when dequeuing empty queue', () => {
      const q = PersistentQueue.empty<number>()
      const { value } = q.dequeue()
      expect(value).toBeUndefined()
    })

    it('returns the same queue when dequeuing empty', () => {
      const q = PersistentQueue.empty<number>()
      const { queue: q2 } = q.dequeue()
      expect(q2).toBe(q)
    })

    it('updates size correctly', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const { queue: q2 } = q.dequeue()
      expect(q2.size()).toBe(1)
      const { queue: q3 } = q2.dequeue()
      expect(q3.size()).toBe(0)
    })

    it('updates last when queue becomes empty', () => {
      const q = PersistentQueue.empty<number>().enqueue(1)
      const { queue: q2 } = q.dequeue()
      expect(q2.last()).toBeUndefined()
    })

    it('preserves last when queue is non-empty after dequeue', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: q2 } = q.dequeue()
      expect(q2.last()).toBe(3)
    })

    it('handles dequeue after many enqueues', () => {
      let q = PersistentQueue.empty<number>()
      for (let i = 0; i < 100; i++) {
        q = q.enqueue(i)
      }
      for (let i = 0; i < 100; i++) {
        const result = q.dequeue()
        expect(result.value).toBe(i)
        q = result.queue
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles interleaved enqueue and dequeue', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(1)
      const r1 = q1.dequeue()
      expect(r1.value).toBe(1)
      const q2 = r1.queue.enqueue(2)
      const r2 = q2.dequeue()
      expect(r2.value).toBe(2)
      expect(r2.queue.isEmpty()).toBe(true)
    })
  })

  describe('persistence', () => {
    it('preserves original after enqueue', () => {
      const original = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const branch = original.enqueue(3)
      expect(original.toArray()).toEqual([1, 2])
      expect(branch.toArray()).toEqual([1, 2, 3])
    })

    it('preserves original after dequeue', () => {
      const original = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: afterDequeue } = original.dequeue()
      expect(original.toArray()).toEqual([1, 2, 3])
      expect(afterDequeue.toArray()).toEqual([2, 3])
    })

    it('allows branching from any version', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(1)
      const q2 = q1.enqueue(2)
      const branch = q1.enqueue(99)
      expect(q2.toArray()).toEqual([1, 2])
      expect(branch.toArray()).toEqual([1, 99])
    })

    it('branches maintain independent state', () => {
      const base = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const branchA = base.enqueue(3)
      const branchB = base.enqueue(4)
      expect(branchA.toArray()).toEqual([1, 2, 3])
      expect(branchB.toArray()).toEqual([1, 2, 4])
      expect(base.toArray()).toEqual([1, 2])
    })

    it('multiple branches from same version', () => {
      const base = PersistentQueue.empty<number>().enqueue(1)
      const b1 = base.enqueue(2)
      const b2 = base.enqueue(3)
      const b3 = base.enqueue(4)
      expect(b1.toArray()).toEqual([1, 2])
      expect(b2.toArray()).toEqual([1, 3])
      expect(b3.toArray()).toEqual([1, 4])
    })

    it('deep branching (branch from branch)', () => {
      const root = PersistentQueue.empty<number>()
      const a = root.enqueue(1)
      const b = a.enqueue(2)
      const c = b.enqueue(3)
      const d = b.enqueue(99)
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(d.toArray()).toEqual([1, 2, 99])
      expect(b.toArray()).toEqual([1, 2])
      expect(a.toArray()).toEqual([1])
    })

    it('original unaffected by multiple operations on branch', () => {
      const original = PersistentQueue.empty<number>().enqueue(1)
      let branch = original
      for (let i = 2; i <= 10; i++) {
        branch = branch.enqueue(i)
      }
      expect(original.toArray()).toEqual([1])
      expect(branch.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('dequeue branches are independent', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: d1 } = q.dequeue()
      const { queue: d2 } = d1.dequeue()
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(d1.toArray()).toEqual([2, 3])
      expect(d2.toArray()).toEqual([3])
    })
  })

  describe('version tracking', () => {
    it('starts at version 0', () => {
      expect(PersistentQueue.empty<number>().version).toBe(0)
    })

    it('increments by 1 for each enqueue', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(1)
      const q2 = q1.enqueue(2)
      const q3 = q2.enqueue(3)
      expect(q0.version).toBe(0)
      expect(q1.version).toBe(1)
      expect(q2.version).toBe(2)
      expect(q3.version).toBe(3)
    })

    it('increments by 1 for each dequeue', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: q2 } = q.dequeue()
      const { queue: q3 } = q2.dequeue()
      expect(q.version).toBe(3)
      expect(q2.version).toBe(4)
      expect(q3.version).toBe(5)
    })

    it('tracks version independently per branch', () => {
      const base = PersistentQueue.empty<number>().enqueue(1)
      const b1 = base.enqueue(2)
      const b2 = base.enqueue(3)
      expect(b1.version).toBe(2)
      expect(b2.version).toBe(2)
    })

    it('map creates new version chain starting from 0', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const mapped = q.map((x) => x * 2)
      expect(mapped.version).toBe(mapped.size())
    })

    it('filter creates new version chain starting from 0', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const filtered = q.filter((x) => x > 1)
      expect(filtered.version).toBe(filtered.size())
    })
  })

  describe('history traversal', () => {
    it('returns single-element history for empty queue', () => {
      const q = PersistentQueue.empty<number>()
      const h = q.history()
      expect(h).toHaveLength(1)
      expect(h[0]).toBe(q)
    })

    it('returns full chain from empty to current', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(1)
      const q2 = q1.enqueue(2)
      const q3 = q2.enqueue(3)
      const h = q3.history()
      expect(h).toHaveLength(4)
      expect(h[0]).toBe(q0)
      expect(h[1]).toBe(q1)
      expect(h[2]).toBe(q2)
      expect(h[3]).toBe(q3)
    })

    it('history length equals version + 1', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
        .enqueue(4)
        .enqueue(5)
      expect(q.history()).toHaveLength(q.version + 1)
    })

    it('history is ordered from oldest to newest', () => {
      const q0 = PersistentQueue.empty<string>()
      const q1 = q0.enqueue('a')
      const q2 = q1.enqueue('b')
      const h = q2.history()
      expect(h[0]!.size()).toBe(0)
      expect(h[1]!.size()).toBe(1)
      expect(h[2]!.size()).toBe(2)
    })

    it('each history entry has correct version', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      const h = q.history()
      for (let i = 0; i < h.length; i++) {
        expect(h[i]!.version).toBe(i)
      }
    })

    it('branching history is independent', () => {
      const base = PersistentQueue.empty<number>().enqueue(1)
      const branchA = base.enqueue(2)
      const branchB = base.enqueue(99)
      const hA = branchA.history()
      const hB = branchB.history()
      expect(hA).toHaveLength(3)
      expect(hB).toHaveLength(3)
      expect(hA[2]).toBe(branchA)
      expect(hB[2]).toBe(branchB)
      expect(hA[0]).toBe(hB[0])
    })

    it('dequeue history includes all steps', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: d1 } = q.dequeue()
      const { queue: d2 } = d1.dequeue()
      const h = d2.history()
      expect(h).toHaveLength(6)
      expect(h[3]).toBe(q)
      expect(h[4]).toBe(d1)
      expect(h[5]).toBe(d2)
    })
  })

  describe('atVersion', () => {
    it('returns current queue for current version', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      expect(q.atVersion(2)).toBe(q)
    })

    it('returns empty queue for version 0', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const v0 = q.atVersion(0)
      expect(v0).not.toBeNull()
      expect(v0!.isEmpty()).toBe(true)
      expect(v0!.version).toBe(0)
    })

    it('returns null for non-existent version', () => {
      const q = PersistentQueue.empty<number>().enqueue(1)
      expect(q.atVersion(99)).toBeNull()
    })

    it('returns null for negative version', () => {
      const q = PersistentQueue.empty<number>().enqueue(1)
      expect(q.atVersion(-1)).toBeNull()
    })

    it('returns null for version greater than current', () => {
      const q = PersistentQueue.empty<number>().enqueue(1)
      expect(q.atVersion(5)).toBeNull()
    })

    it('navigates to intermediate version', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(1)
      const q2 = q1.enqueue(2)
      const q3 = q2.enqueue(3)
      const found = q3.atVersion(1)
      expect(found).toBe(q1)
      expect(found!.toArray()).toEqual([1])
    })

    it('returned queue has correct state', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(10)
        .enqueue(20)
        .enqueue(30)
      const v1 = q.atVersion(1)
      expect(v1!.toArray()).toEqual([10])
      const v2 = q.atVersion(2)
      expect(v2!.toArray()).toEqual([10, 20])
    })

    it('returns null for empty queue atVersion > 0', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.atVersion(1)).toBeNull()
    })

    it('returns empty queue for atVersion(0) on empty queue', () => {
      const q = PersistentQueue.empty<number>()
      expect(q.atVersion(0)).toBe(q)
    })
  })

  describe('previous', () => {
    it('returns null for empty queue', () => {
      expect(PersistentQueue.empty<number>().previous()).toBeNull()
    })

    it('returns parent after enqueue', () => {
      const parent = PersistentQueue.empty<number>()
      const child = parent.enqueue(1)
      expect(child.previous()).toBe(parent)
    })

    it('returns parent after dequeue', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const { queue: d } = q.dequeue()
      expect(d.previous()).toBe(q)
    })

    it('can traverse full chain via previous', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(1)
      const q2 = q1.enqueue(2)
      const q3 = q2.enqueue(3)
      expect(q3.previous()).toBe(q2)
      expect(q2.previous()).toBe(q1)
      expect(q1.previous()).toBe(q0)
      expect(q0.previous()).toBeNull()
    })
  })

  describe('map', () => {
    it('transforms all elements', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      const mapped = q.map((x) => x * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })

    it('preserves order', () => {
      const q = PersistentQueue.empty<string>()
        .enqueue('a')
        .enqueue('b')
        .enqueue('c')
      const mapped = q.map((s) => s.toUpperCase())
      expect(mapped.toArray()).toEqual(['A', 'B', 'C'])
    })

    it('returns empty queue for empty input', () => {
      const q = PersistentQueue.empty<number>()
      const mapped = q.map((x) => x * 2)
      expect(mapped.isEmpty()).toBe(true)
      expect(mapped.toArray()).toEqual([])
    })

    it('transforms types correctly', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const mapped = q.map((x) => `num:${x}`)
      expect(mapped.toArray()).toEqual(['num:1', 'num:2', 'num:3'])
    })

    it('does not modify original', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      q.map((x) => x * 10)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates new version chain', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const mapped = q.map((x) => x + 1)
      expect(mapped.previous()).not.toBe(q)
      expect(mapped.previous()!.previous()).not.toBeNull()
    })
  })

  describe('filter', () => {
    it('filters elements based on predicate', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
        .enqueue(4)
        .enqueue(5)
      const filtered = q.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('preserves order of remaining elements', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(10)
        .enqueue(20)
        .enqueue(30)
        .enqueue(40)
      const filtered = q.filter((x) => x > 15)
      expect(filtered.toArray()).toEqual([20, 30, 40])
    })

    it('returns empty queue when all filtered out', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      const filtered = q.filter(() => false)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('returns all elements when none filtered', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      const filtered = q.filter(() => true)
      expect(filtered.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      q.filter((x) => x > 1)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates new version chain', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const filtered = q.filter((x) => x > 1)
      expect(filtered.version).toBe(2)
      expect(filtered.previous()).not.toBe(q)
    })

    it('handles filter on empty queue', () => {
      const q = PersistentQueue.empty<number>()
      const filtered = q.filter((x) => x > 0)
      expect(filtered.isEmpty()).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements in order', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      const collected: number[] = []
      q.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('does not iterate for empty queue', () => {
      const q = PersistentQueue.empty<number>()
      let callCount = 0
      q.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates correctly after enqueue and dequeue', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      const { queue: d1 } = q.dequeue()
      const d2 = d1.enqueue(4)
      const collected: number[] = []
      d2.forEach((v) => collected.push(v))
      expect(collected).toEqual([2, 3, 4])
    })

    it('iterates string queue', () => {
      const q = PersistentQueue.empty<string>()
        .enqueue('x')
        .enqueue('y')
        .enqueue('z')
      const result: string[] = []
      q.forEach((s) => result.push(s))
      expect(result).toEqual(['x', 'y', 'z'])
    })
  })

  describe('equals', () => {
    it('returns true for equal queues', () => {
      const q1 = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const q2 = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      expect(q1.equals(q2)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const q1 = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const q2 = PersistentQueue.empty<number>().enqueue(1)
      expect(q1.equals(q2)).toBe(false)
    })

    it('returns false for same size different elements', () => {
      const q1 = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const q2 = PersistentQueue.empty<number>().enqueue(1).enqueue(3)
      expect(q1.equals(q2)).toBe(false)
    })

    it('returns true for same reference', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      expect(q.equals(q)).toBe(true)
    })

    it('returns true for empty queues', () => {
      const q1 = PersistentQueue.empty<number>()
      const q2 = PersistentQueue.empty<number>()
      expect(q1.equals(q2)).toBe(true)
    })

    it('uses custom comparator', () => {
      const q1 = PersistentQueue.empty<{ id: number }>()
        .enqueue({ id: 1 })
        .enqueue({ id: 2 })
      const q2 = PersistentQueue.empty<{ id: number }>()
        .enqueue({ id: 1 })
        .enqueue({ id: 2 })
      expect(q1.equals(q2, (a, b) => a.id === b.id)).toBe(true)
    })

    it('returns false with custom comparator', () => {
      const q1 = PersistentQueue.empty<{ id: number }>()
        .enqueue({ id: 1 })
        .enqueue({ id: 2 })
      const q2 = PersistentQueue.empty<{ id: number }>()
        .enqueue({ id: 1 })
        .enqueue({ id: 3 })
      expect(q1.equals(q2, (a, b) => a.id === b.id)).toBe(false)
    })

    it('returns false for empty vs non-empty', () => {
      const empty = PersistentQueue.empty<number>()
      const nonEmpty = PersistentQueue.empty<number>().enqueue(1)
      expect(empty.equals(nonEmpty)).toBe(false)
    })

    it('returns false when elements differ in order', () => {
      const q1 = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const q2 = PersistentQueue.empty<number>().enqueue(2).enqueue(1)
      expect(q1.equals(q2)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns elements in FIFO order', () => {
      const q = PersistentQueue.empty<number>()
        .enqueue(1)
        .enqueue(2)
        .enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty queue', () => {
      expect(PersistentQueue.empty<number>().toArray()).toEqual([])
    })

    it('returns correct array after enqueue and dequeue', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: d1 } = q.dequeue()
      expect(d1.toArray()).toEqual([2, 3])
    })

    it('returns a copy not a reference', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2)
      const arr = q.toArray()
      arr.push(3)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('handles single element', () => {
      const q = PersistentQueue.empty<number>().enqueue(42)
      expect(q.toArray()).toEqual([42])
    })
  })

  describe('toString', () => {
    it('returns string representation of empty queue', () => {
      expect(PersistentQueue.empty<number>().toString()).toBe('PersistentQueue([])')
    })

    it('returns string representation with elements', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      expect(q.toString()).toBe('PersistentQueue([1, 2, 3])')
    })

    it('returns string representation after dequeue', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: d } = q.dequeue()
      expect(d.toString()).toBe('PersistentQueue([2, 3])')
    })

    it('handles string elements', () => {
      const q = PersistentQueue.empty<string>().enqueue('hello').enqueue('world')
      expect(q.toString()).toBe('PersistentQueue([hello, world])')
    })
  })

  describe('edge cases', () => {
    it('handles single element lifecycle', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(42)
      expect(q1.peek()).toBe(42)
      expect(q1.last()).toBe(42)
      const { value, queue: q2 } = q1.dequeue()
      expect(value).toBe(42)
      expect(q2.isEmpty()).toBe(true)
      expect(q2.peek()).toBeUndefined()
      expect(q2.last()).toBeUndefined()
    })

    it('handles enqueue dequeue enqueue pattern', () => {
      const q0 = PersistentQueue.empty<number>()
      const q1 = q0.enqueue(1)
      const { queue: q2 } = q1.dequeue()
      expect(q2.isEmpty()).toBe(true)
      const q3 = q2.enqueue(2)
      expect(q3.toArray()).toEqual([2])
    })

    it('handles dequeue from queue with only rear elements', () => {
      const q = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      expect(q.frontStack).toBeNull
      const { value } = q.dequeue()
      expect(value).toBe(1)
    })

    it('handles complex branching with dequeues', () => {
      const base = PersistentQueue.empty<number>().enqueue(1).enqueue(2).enqueue(3)
      const { queue: d1 } = base.dequeue()
      const { queue: d2 } = d1.dequeue()
      const b1 = d2.enqueue(10)
      const b2 = d2.enqueue(20)
      expect(base.toArray()).toEqual([1, 2, 3])
      expect(d1.toArray()).toEqual([2, 3])
      expect(d2.toArray()).toEqual([3])
      expect(b1.toArray()).toEqual([3, 10])
      expect(b2.toArray()).toEqual([3, 20])
    })

    it('handles enqueue of objects', () => {
      const q = PersistentQueue.empty<{ name: string }>()
        .enqueue({ name: 'a' })
        .enqueue({ name: 'b' })
      expect(q.peek()!.name).toBe('a')
      expect(q.last()!.name).toBe('b')
    })

    it('handles boolean values', () => {
      const q = PersistentQueue.empty<boolean>().enqueue(true).enqueue(false).enqueue(true)
      expect(q.toArray()).toEqual([true, false, true])
    })

    it('handles null values in generic type', () => {
      const q: PersistentQueue<number | null> = PersistentQueue.empty<number | null>()
        .enqueue(1)
        .enqueue(null)
        .enqueue(3)
      expect(q.toArray()).toEqual([1, null, 3])
    })

    it('handles undefined values in generic type', () => {
      const q: PersistentQueue<number | undefined> = PersistentQueue.empty<number | undefined>()
        .enqueue(1)
        .enqueue(undefined)
        .enqueue(3)
      expect(q.toArray()).toEqual([1, undefined, 3])
    })
  })

  describe('stress tests', () => {
    it('handles 1000+ elements correctly', () => {
      let q = PersistentQueue.empty<number>()
      for (let i = 0; i < 1000; i++) {
        q = q.enqueue(i)
      }
      expect(q.size()).toBe(1000)
      expect(q.peek()).toBe(0)
      expect(q.last()).toBe(999)

      let dq = q
      for (let i = 0; i < 1000; i++) {
        const result = dq.dequeue()
        expect(result.value).toBe(i)
        dq = result.queue
      }
      expect(dq.isEmpty()).toBe(true)
    })

    it('maintains version chain integrity after 100 operations', () => {
      let q = PersistentQueue.empty<number>()
      for (let i = 0; i < 50; i++) {
        q = q.enqueue(i)
      }
      for (let i = 0; i < 25; i++) {
        const result = q.dequeue()
        q = result.queue
      }
      expect(q.version).toBe(75)
      const h = q.history()
      expect(h).toHaveLength(76)
      for (let i = 0; i < h.length; i++) {
        expect(h[i]!.version).toBe(i)
      }
    })

    it('history traversal with many versions', () => {
      let q = PersistentQueue.empty<number>()
      for (let i = 0; i < 200; i++) {
        q = q.enqueue(i)
      }
      const h = q.history()
      expect(h).toHaveLength(201)
      expect(h[0]!.isEmpty()).toBe(true)
      expect(h[200]).toBe(q)
      expect(h[100]!.size()).toBe(100)
    })

    it('atVersion with many versions', () => {
      let q = PersistentQueue.empty<number>()
      for (let i = 0; i < 100; i++) {
        q = q.enqueue(i)
      }
      const v50 = q.atVersion(50)
      expect(v50).not.toBeNull()
      expect(v50!.size()).toBe(50)
      expect(v50!.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })

    it('branching stress test', () => {
      const base = PersistentQueue.empty<number>()
      let q = base
      for (let i = 0; i < 100; i++) {
        q = q.enqueue(i)
      }
      const branches: PersistentQueue<number>[] = []
      for (let i = 0; i < 10; i++) {
        branches.push(q.enqueue(1000 + i))
      }
      for (let i = 0; i < 10; i++) {
        expect(branches[i]!.toArray()).toEqual([
          ...Array.from({ length: 100 }, (_, j) => j),
          1000 + i,
        ])
      }
    })
  })
})
