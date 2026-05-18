import {
  CircularBuffer,
  DEFAULT_CIRCULAR_BUFFER_CAPACITY,
} from '../src/core/circular-buffer/circular-buffer.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CircularBuffer', () => {
  describe('constructor', () => {
    it('creates a buffer with the specified capacity', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.capacity).toBe(5)
      expect(buf.size).toBe(0)
    })

    it('creates a buffer with capacity 1', () => {
      const buf = new CircularBuffer<number>(1)
      expect(buf.capacity).toBe(1)
      expect(buf.size).toBe(0)
    })

    it('clamps capacity to minimum of 1 when passed 0', () => {
      const buf = new CircularBuffer<number>(0)
      expect(buf.capacity).toBe(1)
    })

    it('clamps capacity to minimum of 1 when passed negative number', () => {
      const buf = new CircularBuffer<number>(-10)
      expect(buf.capacity).toBe(1)
    })
  })

  // ─── DEFAULT_CIRCULAR_BUFFER_CAPACITY export ─────────────────────────

  describe('DEFAULT_CIRCULAR_BUFFER_CAPACITY', () => {
    it('is 8', () => {
      expect(DEFAULT_CIRCULAR_BUFFER_CAPACITY).toBe(8)
    })
  })

  // ─── push ─────────────────────────────────────────────────────────────

  describe('push', () => {
    it('increments size after push', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(buf.size).toBe(1)
      buf.push(2)
      expect(buf.size).toBe(2)
    })

    it('returns undefined when buffer is not full', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.push(1)).toBeUndefined()
    })

    it('returns evicted item when buffer is full (overwrite)', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.push(4)).toBe(1)
    })

    it('overwrites oldest item and maintains correct order', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4) // evicts 1
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('handles multiple overwrites', () => {
      const buf = new CircularBuffer<number>(2)
      buf.push(1)
      buf.push(2)
      expect(buf.push(3)).toBe(1)
      expect(buf.push(4)).toBe(2)
      expect(buf.toArray()).toEqual([3, 4])
    })

    it('works with capacity 1', () => {
      const buf = new CircularBuffer<number>(1)
      expect(buf.push(42)).toBeUndefined()
      expect(buf.push(99)).toBe(42)
      expect(buf.size).toBe(1)
    })

    it('handles string items', () => {
      const buf = new CircularBuffer<string>(3)
      buf.push('a')
      buf.push('b')
      expect(buf.size).toBe(2)
      expect(buf.toArray()).toEqual(['a', 'b'])
    })

    it('handles object items', () => {
      const buf = new CircularBuffer<{ id: number }>(3)
      const obj = { id: 1 }
      buf.push(obj)
      expect(buf.size).toBe(1)
    })
  })

  // ─── pop ──────────────────────────────────────────────────────────────

  describe('pop', () => {
    it('returns the last pushed item (LIFO)', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.pop()).toBe(30)
      expect(buf.pop()).toBe(20)
      expect(buf.pop()).toBe(10)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.pop()).toBeUndefined()
    })

    it('decrements size after pop', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.size).toBe(2)
      buf.pop()
      expect(buf.size).toBe(1)
      buf.pop()
      expect(buf.size).toBe(0)
    })

    it('size stays at 0 when popping from empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      buf.pop()
      expect(buf.size).toBe(0)
    })

    it('handles pop after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift() // remove 1
      buf.push(4)
      expect(buf.pop()).toBe(4)
    })

    it('works with capacity 1', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(42)
      expect(buf.pop()).toBe(42)
      expect(buf.pop()).toBeUndefined()
    })

    it('returns undefined for repeated pops on empty buffer', () => {
      const buf = new CircularBuffer<number>(3)
      expect(buf.pop()).toBeUndefined()
      expect(buf.pop()).toBeUndefined()
      expect(buf.pop()).toBeUndefined()
    })
  })

  // ─── shift ────────────────────────────────────────────────────────────

  describe('shift', () => {
    it('returns the first pushed item (FIFO)', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.shift()).toBe(10)
      expect(buf.shift()).toBe(20)
      expect(buf.shift()).toBe(30)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.shift()).toBeUndefined()
    })

    it('decrements size after shift', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.size).toBe(2)
      buf.shift()
      expect(buf.size).toBe(1)
    })

    it('handles shift after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift() // remove 1
      buf.push(4)
      expect(buf.shift()).toBe(2)
      expect(buf.shift()).toBe(3)
      expect(buf.shift()).toBe(4)
    })

    it('works with capacity 1', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(42)
      expect(buf.shift()).toBe(42)
      expect(buf.shift()).toBeUndefined()
    })
  })

  // ─── unshift ──────────────────────────────────────────────────────────

  describe('unshift', () => {
    it('prepends item to the front', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(2)
      buf.push(3)
      buf.unshift(1)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns undefined when buffer is not full', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.unshift(1)).toBeUndefined()
    })

    it('returns evicted item when buffer is full (overwrite from back)', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.unshift(0)).toBe(3)
    })

    it('maintains correct order after multiple unshifts', () => {
      const buf = new CircularBuffer<number>(5)
      buf.unshift(3)
      buf.unshift(2)
      buf.unshift(1)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('works with capacity 1', () => {
      const buf = new CircularBuffer<number>(1)
      buf.unshift(42)
      expect(buf.unshift(99)).toBe(42)
      expect(buf.toArray()).toEqual([99])
    })

    it('increments size', () => {
      const buf = new CircularBuffer<number>(5)
      buf.unshift(1)
      expect(buf.size).toBe(1)
      buf.unshift(2)
      expect(buf.size).toBe(2)
    })
  })

  // ─── get ───────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns item at valid index', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.get(0)).toBe(10)
      expect(buf.get(1)).toBe(20)
      expect(buf.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds index', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(buf.get(5)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(buf.get(-1)).toBeUndefined()
    })

    it('returns undefined for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.get(0)).toBeUndefined()
    })

    it('returns correct values after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.get(0)).toBe(2)
      expect(buf.get(1)).toBe(3)
      expect(buf.get(2)).toBe(4)
    })
  })

  // ─── set ───────────────────────────────────────────────────────────────

  describe('set', () => {
    it('updates item at valid index', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      buf.set(1, 99)
      expect(buf.get(1)).toBe(99)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(() => buf.set(5, 99)).toThrow(RangeError)
    })

    it('throws RangeError for negative index', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(() => buf.set(-1, 99)).toThrow(RangeError)
    })

    it('throws RangeError for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(() => buf.set(0, 99)).toThrow(RangeError)
    })

    it('works after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      buf.set(0, 20)
      expect(buf.get(0)).toBe(20)
    })
  })

  // ─── peekFront ─────────────────────────────────────────────────────────

  describe('peekFront', () => {
    it('returns the front item without removing it', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.peekFront()).toBe(1)
      expect(buf.size).toBe(2)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.peekFront()).toBeUndefined()
    })

    it('updates after shift', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      buf.shift()
      expect(buf.peekFront()).toBe(20)
    })

    it('does not modify the buffer', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.peekFront()
      buf.peekFront()
      buf.peekFront()
      expect(buf.size).toBe(2)
      expect(buf.peekFront()).toBe(1)
    })
  })

  // ─── peekBack ──────────────────────────────────────────────────────────

  describe('peekBack', () => {
    it('returns the last pushed item', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.peekBack()).toBe(3)
    })

    it('returns the only item when size is 1', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(42)
      expect(buf.peekBack()).toBe(42)
    })

    it('returns undefined when buffer is empty', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.peekBack()).toBeUndefined()
    })

    it('does not modify the buffer', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.peekBack()
      expect(buf.size).toBe(2)
      expect(buf.peekBack()).toBe(2)
    })

    it('works correctly after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.peekBack()).toBe(4)
    })

    it('updates after push', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(buf.peekBack()).toBe(1)
      buf.push(2)
      expect(buf.peekBack()).toBe(2)
    })
  })

  // ─── size ──────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for new buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.size).toBe(0)
    })

    it('reflects number of pushed items', () => {
      const buf = new CircularBuffer<number>(10)
      for (let i = 0; i < 5; i++) buf.push(i)
      expect(buf.size).toBe(5)
    })

    it('reflects after push and shift', () => {
      const buf = new CircularBuffer<number>(10)
      buf.push(1)
      buf.push(2)
      buf.shift()
      expect(buf.size).toBe(1)
    })

    it('returns to 0 after clearing all items', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.shift()
      buf.shift()
      expect(buf.size).toBe(0)
    })

    it('does not exceed capacity on overwrite', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4) // overwrites
      expect(buf.size).toBe(3)
    })
  })

  // ─── isEmpty ───────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(buf.isEmpty()).toBe(false)
    })

    it('returns true after all items removed', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.shift()
      expect(buf.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.clear()
      expect(buf.isEmpty()).toBe(true)
    })
  })

  // ─── isFull ────────────────────────────────────────────────────────────

  describe('isFull', () => {
    it('returns false for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.isFull()).toBe(false)
    })

    it('returns false when partially full', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.isFull()).toBe(false)
    })

    it('returns true when full', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.isFull()).toBe(true)
    })

    it('stays true after overwrite', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4) // overwrite
      expect(buf.isFull()).toBe(true)
    })

    it('returns false after shift from full buffer', () => {
      const buf = new CircularBuffer<number>(2)
      buf.push(1)
      buf.push(2)
      buf.shift()
      expect(buf.isFull()).toBe(false)
    })

    it('returns true for capacity 1 with one item', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(1)
      expect(buf.isFull()).toBe(true)
    })
  })

  // ─── capacity ──────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns the configured capacity', () => {
      const buf = new CircularBuffer<number>(10)
      expect(buf.capacity).toBe(10)
    })

    it('does not change after push/pop operations', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.pop()
      expect(buf.capacity).toBe(5)
    })
  })

  // ─── available ─────────────────────────────────────────────────────────

  describe('available', () => {
    it('equals capacity for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.available()).toBe(5)
    })

    it('decreases after push', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      expect(buf.available()).toBe(4)
      buf.push(2)
      expect(buf.available()).toBe(3)
    })

    it('is 0 when buffer is full', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.available()).toBe(0)
    })

    it('increases after shift', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      expect(buf.available()).toBe(1)
    })

    it('stays 0 after overwrite (push on full)', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4) // overwrite, still full
      expect(buf.available()).toBe(0)
    })

    it('returns to full after clear', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.clear()
      expect(buf.available()).toBe(5)
    })
  })

  // ─── toArray ───────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.toArray()).toEqual([])
    })

    it('returns items in insertion order', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns a snapshot — modifications do not affect the array', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      const arr = buf.toArray()
      buf.shift()
      expect(arr).toEqual([1, 2])
    })

    it('reflects state after partial shift', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      expect(buf.toArray()).toEqual([2, 3])
    })

    it('returns correct order after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  // ─── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('allows reuse after clearing', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.clear()
      buf.push(3)
      expect(buf.size).toBe(1)
      expect(buf.peekFront()).toBe(3)
    })

    it('works on an already empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      buf.clear()
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.clear()
      expect(buf.capacity).toBe(5)
    })

    it('resets available to full', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.clear()
      expect(buf.available()).toBe(5)
    })

    it('shifted items after clear are undefined', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.clear()
      expect(buf.shift()).toBeUndefined()
    })
  })

  // ─── forEach ───────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all items in order', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      const items: number[] = []
      buf.forEach((item) => items.push(item))
      expect(items).toEqual([10, 20, 30])
    })

    it('provides correct index', () => {
      const buf = new CircularBuffer<string>(5)
      buf.push('a')
      buf.push('b')
      buf.push('c')
      const indices: number[] = []
      buf.forEach((_item, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not iterate on empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      let count = 0
      buf.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('works after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      const items: number[] = []
      buf.forEach((item) => items.push(item))
      expect(items).toEqual([2, 3, 4])
    })

    it('index is contiguous after shift', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      const entries: [number, number][] = []
      buf.forEach((item, index) => entries.push([item, index]))
      expect(entries).toEqual([
        [2, 0],
        [3, 1],
      ])
    })
  })

  // ─── indexOf ───────────────────────────────────────────────────────────

  describe('indexOf', () => {
    it('returns index of existing item', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      expect(buf.indexOf(20)).toBe(1)
    })

    it('returns -1 for non-existent item', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.indexOf(99)).toBe(-1)
    })

    it('returns -1 for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.indexOf(1)).toBe(-1)
    })

    it('finds items after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.indexOf(4)).toBe(2)
      expect(buf.indexOf(1)).toBe(-1)
    })

    it('uses strict equality', () => {
      const buf = new CircularBuffer<string>(5)
      buf.push('hello')
      expect(buf.indexOf('hello')).toBe(0)
      expect(buf.indexOf('HELLO')).toBe(-1)
    })

    it('works with object references', () => {
      const obj = { id: 1 }
      const buf = new CircularBuffer<{ id: number }>(5)
      buf.push(obj)
      expect(buf.indexOf(obj)).toBe(0)
      expect(buf.indexOf({ id: 1 })).toBe(-1)
    })

    it('returns -1 after item is shifted', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.shift()
      expect(buf.indexOf(1)).toBe(-1)
      expect(buf.indexOf(2)).toBe(0)
    })
  })

  // ─── contains ──────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true for an item in the buffer', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.contains(2)).toBe(true)
    })

    it('returns false for an item not in the buffer', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      expect(buf.contains(99)).toBe(false)
    })

    it('returns false for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.contains(1)).toBe(false)
    })

    it('finds items after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect(buf.contains(4)).toBe(true)
      expect(buf.contains(1)).toBe(false)
    })

    it('returns false after item is removed', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.shift()
      expect(buf.contains(1)).toBe(false)
      expect(buf.contains(2)).toBe(true)
    })
  })

  // ─── rotate ────────────────────────────────────────────────────────────

  describe('rotate', () => {
    it('rotates items to the left by n positions', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.rotate(1)
      expect(buf.toArray()).toEqual([2, 3, 4, 1])
    })

    it('rotates by more than one position', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.rotate(2)
      expect(buf.toArray()).toEqual([3, 4, 1, 2])
    })

    it('does nothing when rotating by 0', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.rotate(0)
      expect(buf.toArray()).toEqual([1, 2])
    })

    it('does nothing when rotating by size (full rotation)', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.rotate(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('handles negative rotation (rotate right)', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.rotate(-1)
      expect(buf.toArray()).toEqual([4, 1, 2, 3])
    })

    it('does nothing on empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      buf.rotate(3)
      expect(buf.size).toBe(0)
    })

    it('handles rotation larger than size', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.rotate(5) // same as rotate(2) because 5 % 3 = 2
      expect(buf.toArray()).toEqual([3, 1, 2])
    })
  })

  // ─── clone ─────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy with same items', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      const cloned = buf.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size).toBe(3)
    })

    it('has the same capacity', () => {
      const buf = new CircularBuffer<number>(10)
      buf.push(1)
      const cloned = buf.clone()
      expect(cloned.capacity).toBe(10)
    })

    it('modifications to clone do not affect original', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      const cloned = buf.clone()
      cloned.shift()
      cloned.push(99)
      expect(buf.toArray()).toEqual([1, 2])
      expect(cloned.toArray()).toEqual([2, 99])
    })

    it('modifications to original do not affect clone', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      const cloned = buf.clone()
      buf.clear()
      expect(cloned.toArray()).toEqual([1, 2])
    })

    it('cloning an empty buffer works', () => {
      const buf = new CircularBuffer<number>(5)
      const cloned = buf.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.capacity).toBe(5)
    })

    it('clones correctly after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      const cloned = buf.clone()
      expect(cloned.toArray()).toEqual([2, 3, 4])
    })
  })

  // ─── Symbol.iterator ──────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over items in insertion order', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      const items: number[] = []
      for (const item of buf) {
        items.push(item)
      }
      expect(items).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const buf = new CircularBuffer<string>(5)
      buf.push('x')
      buf.push('y')
      expect([...buf]).toEqual(['x', 'y'])
    })

    it('yields nothing for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      const items: number[] = []
      for (const item of buf) {
        items.push(item)
      }
      expect(items).toEqual([])
    })

    it('works after wrap-around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.push(4)
      expect([...buf]).toEqual([2, 3, 4])
    })
  })

  // ─── fromArray (static) ───────────────────────────────────────────────

  describe('fromArray', () => {
    it('creates a buffer from an array', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
      expect(buf.size).toBe(3)
    })

    it('uses array length as capacity by default', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3])
      expect(buf.capacity).toBe(3)
    })

    it('uses provided capacity', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3], 10)
      expect(buf.capacity).toBe(10)
      expect(buf.size).toBe(3)
    })

    it('overwrites when array is larger than capacity', () => {
      const buf = CircularBuffer.fromArray([1, 2, 3, 4, 5], 3)
      expect(buf.capacity).toBe(3)
      expect(buf.size).toBe(3)
      expect(buf.toArray()).toEqual([3, 4, 5])
    })

    it('creates empty buffer from empty array', () => {
      const buf = CircularBuffer.fromArray([])
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('creates buffer from empty array with custom capacity', () => {
      const buf = CircularBuffer.fromArray([], 5)
      expect(buf.capacity).toBe(5)
      expect(buf.size).toBe(0)
    })
  })

  // ─── Wrap-around behavior ─────────────────────────────────────────────

  describe('circular wrap-around', () => {
    it('handles multiple wrap-around cycles', () => {
      const buf = new CircularBuffer<number>(3)
      // Cycle 1
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.shift()
      buf.shift()
      buf.shift()
      // Cycle 2
      buf.push(4)
      buf.push(5)
      buf.push(6)
      buf.shift()
      // Cycle 3
      buf.push(7)
      expect(buf.toArray()).toEqual([5, 6, 7])
    })

    it('handles alternating push/shift', () => {
      const buf = new CircularBuffer<number>(2)
      buf.push(1)
      buf.shift()
      buf.push(2)
      buf.shift()
      buf.push(3)
      expect(buf.peekFront()).toBe(3)
      expect(buf.size).toBe(1)
    })

    it('maintains FIFO order through wrap-around', () => {
      const buf = new CircularBuffer<number>(4)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      buf.push(4)
      buf.shift()
      buf.shift()
      buf.push(5)
      buf.push(6)
      expect(buf.toArray()).toEqual([3, 4, 5, 6])
      expect(buf.shift()).toBe(3)
      expect(buf.shift()).toBe(4)
      expect(buf.shift()).toBe(5)
      expect(buf.shift()).toBe(6)
    })

    it('handles push overwrites wrapping around', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      // Buffer is full. Now push overwrites
      buf.push(4) // evicts 1
      buf.push(5) // evicts 2
      buf.push(6) // evicts 3
      expect(buf.toArray()).toEqual([4, 5, 6])
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('single element lifecycle', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(42)
      expect(buf.size).toBe(1)
      expect(buf.isEmpty()).toBe(false)
      expect(buf.isFull()).toBe(false)
      expect(buf.peekFront()).toBe(42)
      expect(buf.peekBack()).toBe(42)
      expect(buf.contains(42)).toBe(true)
      expect(buf.shift()).toBe(42)
      expect(buf.size).toBe(0)
      expect(buf.isEmpty()).toBe(true)
    })

    it('capacity 1 full lifecycle with push overwrite', () => {
      const buf = new CircularBuffer<number>(1)
      buf.push(1)
      expect(buf.isFull()).toBe(true)
      expect(buf.push(2)).toBe(1) // evicts 1
      expect(buf.size).toBe(1)
      expect(buf.peekFront()).toBe(2)
    })

    it('fill and clear completely', () => {
      const buf = new CircularBuffer<number>(5)
      for (let i = 0; i < 5; i++) buf.push(i + 1)
      expect(buf.isFull()).toBe(true)
      buf.clear()
      expect(buf.isEmpty()).toBe(true)
      expect(buf.available()).toBe(5)
    })

    it('repeated fill and clear cycles', () => {
      const buf = new CircularBuffer<number>(3)
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 3; i++) buf.push(cycle * 3 + i)
        expect(buf.isFull()).toBe(true)
        buf.clear()
        expect(buf.isEmpty()).toBe(true)
      }
      expect(buf.capacity).toBe(3)
    })

    it('push after multiple clear cycles', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(1)
      buf.clear()
      buf.push(2)
      buf.clear()
      buf.push(3)
      expect(buf.peekFront()).toBe(3)
      expect(buf.size).toBe(1)
    })

    it('works with various types', () => {
      const strBuf = new CircularBuffer<string>(3)
      strBuf.push('hello')
      expect(strBuf.shift()).toBe('hello')

      const boolBuf = new CircularBuffer<boolean>(3)
      boolBuf.push(true)
      boolBuf.push(false)
      expect(boolBuf.toArray()).toEqual([true, false])
    })

    it('large number of operations', () => {
      const buf = new CircularBuffer<number>(100)
      for (let i = 0; i < 100; i++) buf.push(i)
      expect(buf.isFull()).toBe(true)
      for (let i = 0; i < 100; i++) {
        expect(buf.shift()).toBe(i)
      }
      expect(buf.isEmpty()).toBe(true)
    })

    it('push then pop all maintains LIFO', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      buf.push(2)
      buf.push(3)
      expect(buf.pop()).toBe(3)
      expect(buf.pop()).toBe(2)
      expect(buf.pop()).toBe(1)
      expect(buf.isEmpty()).toBe(true)
    })

    it('mix of push, pop, shift, unshift', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(2)
      buf.push(3)
      buf.unshift(1)
      expect(buf.toArray()).toEqual([1, 2, 3])
      buf.pop() // removes 3
      expect(buf.toArray()).toEqual([1, 2])
      buf.shift() // removes 1
      expect(buf.toArray()).toEqual([2])
    })

    it('indexOf after overwrite', () => {
      const buf = new CircularBuffer<number>(3)
      buf.push(10)
      buf.push(20)
      buf.push(30)
      buf.push(40) // evicts 10
      expect(buf.indexOf(10)).toBe(-1)
      expect(buf.indexOf(40)).toBe(2)
    })

    it('set error message includes index and size', () => {
      const buf = new CircularBuffer<number>(5)
      buf.push(1)
      try {
        buf.set(5, 99)
        expect.unreachable('Should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(RangeError)
        expect((e as RangeError).message).toContain('5')
        expect((e as RangeError).message).toContain('1')
      }
    })
  })
})
