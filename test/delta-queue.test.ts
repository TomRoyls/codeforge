import { DeltaQueue } from '../src/core/delta-queue/delta-queue.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('DeltaQueue', () => {
  describe('constructor', () => {
    it('creates an empty queue with no capacity', () => {
      const dq = new DeltaQueue()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('creates an empty queue with a capacity', () => {
      const dq = new DeltaQueue(5)
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('creates an empty queue with capacity undefined', () => {
      const dq = new DeltaQueue(undefined)
      expect(dq.size).toBe(0)
    })
  })

  // ─── push ─────────────────────────────────────────────────────────────

  describe('push', () => {
    it('pushes a single value', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(10)
    })

    it('pushes multiple values storing deltas', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(15)
      dq.push(12)
      expect(dq.size).toBe(3)
      expect(dq.deltas).toEqual([10, 5, -3])
    })

    it('pushes values that reconstruct to originals', () => {
      const dq = new DeltaQueue()
      dq.push(100)
      dq.push(200)
      dq.push(150)
      expect(dq.reconstruct()).toEqual([100, 200, 150])
    })

    it('handles pushing zero', () => {
      const dq = new DeltaQueue()
      dq.push(0)
      expect(dq.peek()).toBe(0)
      expect(dq.deltas).toEqual([0])
    })

    it('handles pushing the same value repeatedly', () => {
      const dq = new DeltaQueue()
      dq.push(5)
      dq.push(5)
      dq.push(5)
      expect(dq.deltas).toEqual([5, 0, 0])
      expect(dq.reconstruct()).toEqual([5, 5, 5])
    })

    it('handles negative values', () => {
      const dq = new DeltaQueue()
      dq.push(-10)
      dq.push(-5)
      dq.push(-20)
      expect(dq.reconstruct()).toEqual([-10, -5, -20])
    })

    it('handles floating point values', () => {
      const dq = new DeltaQueue()
      dq.push(1.5)
      dq.push(2.5)
      dq.push(0.5)
      expect(dq.reconstruct()).toEqual([1.5, 2.5, 0.5])
    })

    it('handles decreasing sequence', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(8)
      dq.push(5)
      dq.push(1)
      expect(dq.deltas).toEqual([10, -2, -3, -4])
      expect(dq.reconstruct()).toEqual([10, 8, 5, 1])
    })

    it('respects capacity by merging oldest entries', () => {
      const dq = new DeltaQueue(3)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      expect(dq.size).toBe(3)
      dq.push(4)
      expect(dq.size).toBe(3)
      expect(dq.reconstruct()).toEqual([3, 2, 3, 4].slice(-3))
    })

    it('evicts correctly when capacity is 1', () => {
      const dq = new DeltaQueue(1)
      dq.push(10)
      expect(dq.size).toBe(1)
      dq.push(20)
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(20)
    })
  })

  // ─── pop ──────────────────────────────────────────────────────────────

  describe('pop', () => {
    it('returns undefined on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.pop()).toBeUndefined()
    })

    it('pops the last pushed value', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      expect(dq.pop()).toBe(20)
      expect(dq.size).toBe(1)
    })

    it('pops all values sequentially', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.pop()).toBe(30)
      expect(dq.pop()).toBe(20)
      expect(dq.pop()).toBe(10)
      expect(dq.pop()).toBeUndefined()
    })

    it('updates lastValue after pop', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.pop()
      expect(dq.peek()).toBe(10)
    })

    it('returns queue to empty after popping all', () => {
      const dq = new DeltaQueue()
      dq.push(42)
      dq.pop()
      expect(dq.isEmpty()).toBe(true)
      expect(dq.size).toBe(0)
      expect(dq.peek()).toBeUndefined()
    })

    it('allows push after popping all', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.pop()
      dq.push(99)
      expect(dq.peek()).toBe(99)
      expect(dq.reconstruct()).toEqual([99])
    })
  })

  // ─── peek ─────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns undefined on empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.peek()).toBeUndefined()
    })

    it('returns the last pushed value', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.peek()).toBe(30)
    })

    it('does not modify the queue', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.peek()
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(10)
    })
  })

  // ─── at ───────────────────────────────────────────────────────────────

  describe('at', () => {
    it('returns the reconstructed value at an index', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(15)
      expect(dq.at(0)).toBe(10)
      expect(dq.at(1)).toBe(20)
      expect(dq.at(2)).toBe(15)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(() => dq.at(1)).toThrow(RangeError)
      expect(() => dq.at(-1)).toThrow(RangeError)
    })

    it('throws RangeError on empty queue', () => {
      const dq = new DeltaQueue()
      expect(() => dq.at(0)).toThrow(RangeError)
    })

    it('returns correct values after push and pop', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      dq.pop()
      expect(dq.at(0)).toBe(10)
      expect(dq.at(1)).toBe(20)
    })
  })

  // ─── deltaAt ──────────────────────────────────────────────────────────

  describe('deltaAt', () => {
    it('returns the raw delta at index 0', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(dq.deltaAt(0)).toBe(10)
    })

    it('returns the delta between consecutive values', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(15)
      dq.push(12)
      expect(dq.deltaAt(0)).toBe(10)
      expect(dq.deltaAt(1)).toBe(5)
      expect(dq.deltaAt(2)).toBe(-3)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(() => dq.deltaAt(5)).toThrow(RangeError)
      expect(() => dq.deltaAt(-1)).toThrow(RangeError)
    })

    it('throws RangeError on empty queue', () => {
      const dq = new DeltaQueue()
      expect(() => dq.deltaAt(0)).toThrow(RangeError)
    })
  })

  // ─── prefixSum ────────────────────────────────────────────────────────

  describe('prefixSum', () => {
    it('returns 0 for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.prefixSum()).toBe(0)
    })

    it('returns total sum when no index given', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.prefixSum()).toBe(60)
    })

    it('returns prefix sum at a given index', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.prefixSum(0)).toBe(10)
      expect(dq.prefixSum(1)).toBe(30)
      expect(dq.prefixSum(2)).toBe(60)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(() => dq.prefixSum(5)).toThrow(RangeError)
      expect(() => dq.prefixSum(-1)).toThrow(RangeError)
    })

    it('computes prefix sum with negative values', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(5)
      dq.push(-5)
      expect(dq.prefixSum(0)).toBe(10)
      expect(dq.prefixSum(1)).toBe(15)
      expect(dq.prefixSum(2)).toBe(10)
    })
  })

  // ─── rangeSum ─────────────────────────────────────────────────────────

  describe('rangeSum', () => {
    it('returns 0 for empty queue with range [0, -1]', () => {
      const dq = new DeltaQueue()
      expect(dq.rangeSum(0, -1)).toBe(0)
    })

    it('returns sum for full range', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.rangeSum(0, 2)).toBe(60)
    })

    it('returns sum for partial range', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.rangeSum(1, 2)).toBe(50)
    })

    it('returns single element range', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.rangeSum(1, 1)).toBe(20)
    })

    it('throws RangeError for from > to', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(() => dq.rangeSum(1, 0)).toThrow(RangeError)
    })

    it('throws RangeError for out-of-bounds range', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      expect(() => dq.rangeSum(0, 5)).toThrow(RangeError)
      expect(() => dq.rangeSum(-1, 0)).toThrow(RangeError)
    })

    it('computes range sum with mixed values', () => {
      const dq = new DeltaQueue()
      dq.push(100)
      dq.push(50)
      dq.push(75)
      dq.push(25)
      expect(dq.rangeSum(0, 1)).toBe(150)
      expect(dq.rangeSum(2, 3)).toBe(100)
    })
  })

  // ─── reconstruct ──────────────────────────────────────────────────────

  describe('reconstruct', () => {
    it('returns empty array for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.reconstruct()).toEqual([])
    })

    it('reconstructs single value', () => {
      const dq = new DeltaQueue()
      dq.push(42)
      expect(dq.reconstruct()).toEqual([42])
    })

    it('reconstructs multiple values', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(15)
      dq.push(25)
      expect(dq.reconstruct()).toEqual([10, 20, 15, 25])
    })

    it('returns a new array each call', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      const a = dq.reconstruct()
      const b = dq.reconstruct()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns same result as reconstruct', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.toArray()).toEqual(dq.reconstruct())
    })

    it('returns empty array for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.toArray()).toEqual([])
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.size).toBe(0)
    })

    it('increases with push', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      expect(dq.size).toBe(1)
      dq.push(2)
      expect(dq.size).toBe(2)
      dq.push(3)
      expect(dq.size).toBe(3)
    })

    it('decreases with pop', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.push(2)
      dq.pop()
      expect(dq.size).toBe(1)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      const dq = new DeltaQueue()
      expect(dq.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      expect(dq.isEmpty()).toBe(false)
    })

    it('returns true after popping all elements', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.pop()
      expect(dq.isEmpty()).toBe(true)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears all elements', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.clear()
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
      expect(dq.peek()).toBeUndefined()
    })

    it('allows push after clear', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.clear()
      dq.push(99)
      expect(dq.size).toBe(1)
      expect(dq.reconstruct()).toEqual([99])
    })

    it('clears an already empty queue without error', () => {
      const dq = new DeltaQueue()
      dq.clear()
      expect(dq.size).toBe(0)
    })
  })

  // ─── min ──────────────────────────────────────────────────────────────

  describe('min', () => {
    it('returns undefined for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.min()).toBeUndefined()
    })

    it('returns the single value for one-element queue', () => {
      const dq = new DeltaQueue()
      dq.push(42)
      expect(dq.min()).toBe(42)
    })

    it('returns the minimum reconstructed value', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(5)
      dq.push(20)
      dq.push(3)
      expect(dq.min()).toBe(3)
    })

    it('handles all equal values', () => {
      const dq = new DeltaQueue()
      dq.push(7)
      dq.push(7)
      dq.push(7)
      expect(dq.min()).toBe(7)
    })

    it('handles negative values', () => {
      const dq = new DeltaQueue()
      dq.push(-10)
      dq.push(-5)
      dq.push(-20)
      expect(dq.min()).toBe(-20)
    })
  })

  // ─── max ──────────────────────────────────────────────────────────────

  describe('max', () => {
    it('returns undefined for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.max()).toBeUndefined()
    })

    it('returns the single value for one-element queue', () => {
      const dq = new DeltaQueue()
      dq.push(42)
      expect(dq.max()).toBe(42)
    })

    it('returns the maximum reconstructed value', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(50)
      dq.push(20)
      expect(dq.max()).toBe(50)
    })

    it('handles negative values', () => {
      const dq = new DeltaQueue()
      dq.push(-10)
      dq.push(-5)
      dq.push(-20)
      expect(dq.max()).toBe(-5)
    })
  })

  // ─── mean ─────────────────────────────────────────────────────────────

  describe('mean', () => {
    it('returns undefined for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.mean()).toBeUndefined()
    })

    it('returns the single value for one-element queue', () => {
      const dq = new DeltaQueue()
      dq.push(42)
      expect(dq.mean()).toBe(42)
    })

    it('returns the mean of reconstructed values', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.mean()).toBe(20)
    })

    it('handles non-integer mean', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      expect(dq.mean()).toBe(15)
    })

    it('handles mean with negative values', () => {
      const dq = new DeltaQueue()
      dq.push(-10)
      dq.push(10)
      expect(dq.mean()).toBe(0)
    })
  })

  // ─── deltas getter ────────────────────────────────────────────────────

  describe('deltas', () => {
    it('returns empty array for empty queue', () => {
      const dq = new DeltaQueue()
      expect(dq.deltas).toEqual([])
    })

    it('returns raw deltas', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(15)
      dq.push(12)
      expect(dq.deltas).toEqual([10, 5, -3])
    })

    it('returns a copy of deltas', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      const d = dq.deltas
      d.push(999)
      expect(dq.deltas).toEqual([10])
    })
  })

  // ─── static fromArray ─────────────────────────────────────────────────

  describe('static fromArray', () => {
    it('creates queue from empty array', () => {
      const dq = DeltaQueue.fromArray([])
      expect(dq.size).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('creates queue from single-element array', () => {
      const dq = DeltaQueue.fromArray([42])
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(42)
    })

    it('creates queue from multi-element array', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      expect(dq.size).toBe(3)
      expect(dq.reconstruct()).toEqual([10, 20, 30])
    })

    it('creates queue with capacity', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3, 4, 5], 3)
      expect(dq.size).toBe(3)
    })

    it('preserves order of values', () => {
      const dq = DeltaQueue.fromArray([5, 3, 8, 1])
      expect(dq.toArray()).toEqual([5, 3, 8, 1])
    })
  })

  // ─── compress ─────────────────────────────────────────────────────────

  describe('compress', () => {
    it('returns empty queue for empty queue', () => {
      const dq = new DeltaQueue()
      const compressed = dq.compress()
      expect(compressed.size).toBe(0)
      expect(compressed.isEmpty()).toBe(true)
    })

    it('returns identical queue when no zero deltas', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      const compressed = dq.compress()
      expect(compressed.reconstruct()).toEqual([10, 20, 30])
    })

    it('removes zero deltas', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(10)
      dq.push(20)
      dq.push(20)
      dq.push(30)
      expect(dq.deltas).toEqual([10, 0, 10, 0, 10])
      const compressed = dq.compress()
      expect(compressed.reconstruct()).toEqual([10, 20, 30])
    })

    it('keeps first element even if delta is zero', () => {
      const dq = new DeltaQueue()
      dq.push(0)
      dq.push(0)
      dq.push(5)
      const compressed = dq.compress()
      expect(compressed.at(0)).toBe(0)
      expect(compressed.size).toBeLessThan(dq.size)
    })

    it('does not modify the original queue', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(10)
      dq.push(20)
      dq.compress()
      expect(dq.size).toBe(3)
      expect(dq.reconstruct()).toEqual([10, 10, 20])
    })

    it('preserves capacity in compressed queue', () => {
      const dq = new DeltaQueue(10)
      dq.push(10)
      dq.push(10)
      const compressed = dq.compress()
      expect(compressed.deltas).not.toEqual(dq.deltas)
    })
  })

  // ─── capacity and eviction ────────────────────────────────────────────

  describe('capacity and eviction', () => {
    it('does not evict without capacity', () => {
      const dq = new DeltaQueue()
      for (let i = 0; i < 100; i++) dq.push(i)
      expect(dq.size).toBe(100)
    })

    it('evicts oldest when exceeding capacity', () => {
      const dq = new DeltaQueue(3)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      dq.push(4)
      expect(dq.size).toBe(3)
    })

    it('maintains correct values after eviction', () => {
      const dq = new DeltaQueue(2)
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.reconstruct()).toEqual([20, 30])
    })

    it('handles multiple evictions', () => {
      const dq = new DeltaQueue(2)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      dq.push(4)
      dq.push(5)
      expect(dq.size).toBe(2)
      expect(dq.reconstruct()).toEqual([4, 5])
    })

    it('eviction with capacity 1', () => {
      const dq = new DeltaQueue(1)
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.size).toBe(1)
      expect(dq.peek()).toBe(30)
    })

    it('capacity equal to size does not evict', () => {
      const dq = new DeltaQueue(3)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      expect(dq.size).toBe(3)
      expect(dq.reconstruct()).toEqual([1, 2, 3])
    })

    it('pop works correctly after eviction', () => {
      const dq = new DeltaQueue(2)
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.pop()).toBe(30)
      expect(dq.peek()).toBe(20)
    })

    it('clear resets capacity tracking', () => {
      const dq = new DeltaQueue(2)
      dq.push(1)
      dq.push(2)
      dq.push(3)
      dq.clear()
      dq.push(10)
      dq.push(20)
      expect(dq.size).toBe(2)
      expect(dq.reconstruct()).toEqual([10, 20])
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles alternating positive and negative deltas', () => {
      const dq = new DeltaQueue()
      dq.push(0)
      dq.push(10)
      dq.push(-5)
      dq.push(20)
      dq.push(-10)
      expect(dq.reconstruct()).toEqual([0, 10, -5, 20, -10])
      expect(dq.deltas).toEqual([0, 10, -15, 25, -30])
    })

    it('handles very large values', () => {
      const dq = new DeltaQueue()
      dq.push(Number.MAX_SAFE_INTEGER)
      dq.push(Number.MAX_SAFE_INTEGER - 1)
      expect(dq.at(0)).toBe(Number.MAX_SAFE_INTEGER)
      expect(dq.at(1)).toBe(Number.MAX_SAFE_INTEGER - 1)
    })

    it('handles very small values', () => {
      const dq = new DeltaQueue()
      dq.push(Number.MIN_SAFE_INTEGER)
      dq.push(Number.MIN_SAFE_INTEGER + 1)
      expect(dq.at(0)).toBe(Number.MIN_SAFE_INTEGER)
      expect(dq.at(1)).toBe(Number.MIN_SAFE_INTEGER + 1)
    })

    it('push pop push sequence', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.pop()
      dq.push(30)
      expect(dq.reconstruct()).toEqual([10, 30])
    })

    it('multiple push-pop cycles', () => {
      const dq = new DeltaQueue()
      dq.push(1)
      dq.pop()
      dq.push(2)
      dq.pop()
      dq.push(3)
      expect(dq.reconstruct()).toEqual([3])
      expect(dq.peek()).toBe(3)
    })

    it('fromArray followed by operations', () => {
      const dq = DeltaQueue.fromArray([10, 20, 30])
      dq.pop()
      dq.push(40)
      expect(dq.reconstruct()).toEqual([10, 20, 40])
    })

    it('min max mean on same dataset', () => {
      const dq = DeltaQueue.fromArray([5, 10, 15, 20, 25])
      expect(dq.min()).toBe(5)
      expect(dq.max()).toBe(25)
      expect(dq.mean()).toBe(15)
    })

    it('rangeSum equals manual sum', () => {
      const dq = DeltaQueue.fromArray([3, 7, 2, 9, 4])
      expect(dq.rangeSum(0, 4)).toBe(3 + 7 + 2 + 9 + 4)
      expect(dq.rangeSum(1, 3)).toBe(7 + 2 + 9)
    })

    it('cache invalidation after push', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      expect(dq.prefixSum()).toBe(30)
      dq.push(30)
      expect(dq.prefixSum()).toBe(60)
    })

    it('cache invalidation after pop', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.prefixSum()).toBe(60)
      dq.pop()
      expect(dq.prefixSum()).toBe(30)
    })

    it('cache invalidation after clear', () => {
      const dq = new DeltaQueue()
      dq.push(10)
      dq.push(20)
      expect(dq.prefixSum()).toBe(30)
      dq.clear()
      expect(dq.prefixSum()).toBe(0)
    })

    it('at returns correct values after capacity eviction', () => {
      const dq = new DeltaQueue(3)
      dq.push(10)
      dq.push(20)
      dq.push(30)
      dq.push(40)
      expect(dq.size).toBe(3)
      expect(dq.at(0)).toBe(20)
      expect(dq.at(1)).toBe(30)
      expect(dq.at(2)).toBe(40)
    })

    it('deltas reflect eviction merging', () => {
      const dq = new DeltaQueue(2)
      dq.push(10)
      dq.push(20)
      dq.push(30)
      expect(dq.size).toBe(2)
      expect(dq.deltas).toEqual([20, 10])
    })

    it('compress on sequence with no zeros', () => {
      const dq = DeltaQueue.fromArray([1, 2, 3, 4, 5])
      const compressed = dq.compress()
      expect(compressed.reconstruct()).toEqual([1, 2, 3, 4, 5])
      expect(compressed.size).toBe(5)
    })

    it('large dataset operations', () => {
      const dq = new DeltaQueue()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        dq.push(i)
        values.push(i)
      }
      expect(dq.size).toBe(1000)
      expect(dq.reconstruct()).toEqual(values)
      expect(dq.min()).toBe(0)
      expect(dq.max()).toBe(999)
      expect(dq.mean()).toBe(499.5)
    })
  })
})
