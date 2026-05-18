import { CircularDeque } from '../src/core/circular-deque/circular-deque.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CircularDeque', () => {
  describe('constructor', () => {
    it('creates an empty deque with default initial capacity', () => {
      const dq = new CircularDeque<number>()
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
      expect(dq.capacity()).toBe(16)
    })

    it('creates an empty deque with custom initial capacity', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 8 })
      expect(dq.capacity()).toBe(8)
      expect(dq.size()).toBe(0)
    })

    it('clamps initial capacity to minimum of 1', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 0 })
      expect(dq.capacity()).toBe(1)
    })

    it('clamps negative initial capacity to 1', () => {
      const dq = new CircularDeque<number>({ initialCapacity: -5 })
      expect(dq.capacity()).toBe(1)
    })

    it('accepts initial capacity of 1', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 1 })
      expect(dq.capacity()).toBe(1)
    })
  })

  // ─── pushFront ────────────────────────────────────────────────────────

  describe('pushFront', () => {
    it('adds a single element to the front', () => {
      const dq = new CircularDeque<number>()
      dq.pushFront(1)
      expect(dq.size()).toBe(1)
      expect(dq.peekFront()).toBe(1)
    })

    it('adds multiple elements maintaining order', () => {
      const dq = new CircularDeque<number>()
      dq.pushFront(3)
      dq.pushFront(2)
      dq.pushFront(1)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('works with string elements', () => {
      const dq = new CircularDeque<string>()
      dq.pushFront('c')
      dq.pushFront('b')
      dq.pushFront('a')
      expect(dq.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('triggers growth when at capacity', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 2 })
      dq.pushFront(1)
      dq.pushFront(2)
      expect(dq.capacity()).toBe(2)
      dq.pushFront(3)
      expect(dq.capacity()).toBe(4)
      expect(dq.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── pushBack ─────────────────────────────────────────────────────────

  describe('pushBack', () => {
    it('adds a single element to the back', () => {
      const dq = new CircularDeque<number>()
      dq.pushBack(1)
      expect(dq.size()).toBe(1)
      expect(dq.peekBack()).toBe(1)
    })

    it('adds multiple elements maintaining order', () => {
      const dq = new CircularDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('triggers growth when at capacity', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 2 })
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.capacity()).toBe(2)
      dq.pushBack(3)
      expect(dq.capacity()).toBe(4)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── popFront ─────────────────────────────────────────────────────────

  describe('popFront', () => {
    it('returns undefined on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.popFront()).toBeUndefined()
    })

    it('removes and returns the front element', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.popFront()).toBe(1)
      expect(dq.toArray()).toEqual([2, 3])
    })

    it('drains the deque completely', () => {
      const dq = CircularDeque.from([1, 2])
      expect(dq.popFront()).toBe(1)
      expect(dq.popFront()).toBe(2)
      expect(dq.popFront()).toBeUndefined()
      expect(dq.isEmpty()).toBe(true)
    })

    it('maintains correct state after partial drain', () => {
      const dq = CircularDeque.from([10, 20, 30, 40])
      dq.popFront()
      expect(dq.peekFront()).toBe(20)
      expect(dq.peekBack()).toBe(40)
      expect(dq.size()).toBe(3)
    })
  })

  // ─── popBack ──────────────────────────────────────────────────────────

  describe('popBack', () => {
    it('returns undefined on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.popBack()).toBeUndefined()
    })

    it('removes and returns the back element', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.popBack()).toBe(3)
      expect(dq.toArray()).toEqual([1, 2])
    })

    it('drains the deque completely', () => {
      const dq = CircularDeque.from([1, 2])
      expect(dq.popBack()).toBe(2)
      expect(dq.popBack()).toBe(1)
      expect(dq.popBack()).toBeUndefined()
      expect(dq.isEmpty()).toBe(true)
    })

    it('maintains correct state after partial drain', () => {
      const dq = CircularDeque.from([10, 20, 30, 40])
      dq.popBack()
      expect(dq.peekFront()).toBe(10)
      expect(dq.peekBack()).toBe(30)
      expect(dq.size()).toBe(3)
    })
  })

  // ─── peekFront ────────────────────────────────────────────────────────

  describe('peekFront', () => {
    it('returns undefined on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.peekFront()).toBeUndefined()
    })

    it('returns the front element without removing it', () => {
      const dq = CircularDeque.from([10, 20, 30])
      expect(dq.peekFront()).toBe(10)
      expect(dq.size()).toBe(3)
    })

    it('reflects pushFront changes', () => {
      const dq = new CircularDeque<number>()
      dq.pushBack(2)
      dq.pushFront(1)
      expect(dq.peekFront()).toBe(1)
    })
  })

  // ─── peekBack ─────────────────────────────────────────────────────────

  describe('peekBack', () => {
    it('returns undefined on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.peekBack()).toBeUndefined()
    })

    it('returns the back element without removing it', () => {
      const dq = CircularDeque.from([10, 20, 30])
      expect(dq.peekBack()).toBe(30)
      expect(dq.size()).toBe(3)
    })

    it('reflects pushBack changes', () => {
      const dq = new CircularDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.peekBack()).toBe(2)
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns element at valid index', () => {
      const dq = CircularDeque.from([10, 20, 30])
      expect(dq.get(0)).toBe(10)
      expect(dq.get(1)).toBe(20)
      expect(dq.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds index', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.get(3)).toBeUndefined()
      expect(dq.get(100)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.get(-1)).toBeUndefined()
    })

    it('returns undefined on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.get(0)).toBeUndefined()
    })
  })

  // ─── set ──────────────────────────────────────────────────────────────

  describe('set', () => {
    it('sets value at valid index and returns true', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.set(1, 99)).toBe(true)
      expect(dq.get(1)).toBe(99)
    })

    it('returns false for out-of-bounds index', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.set(3, 99)).toBe(false)
    })

    it('returns false for negative index', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.set(-1, 99)).toBe(false)
    })

    it('returns false on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.set(0, 1)).toBe(false)
    })

    it('does not change size when setting', () => {
      const dq = CircularDeque.from([1, 2, 3])
      dq.set(0, 100)
      expect(dq.size()).toBe(3)
    })
  })

  // ─── insertAt ─────────────────────────────────────────────────────────

  describe('insertAt', () => {
    it('inserts at the beginning when index is 0', () => {
      const dq = CircularDeque.from([2, 3])
      dq.insertAt(0, 1)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at the beginning when index is negative', () => {
      const dq = CircularDeque.from([2, 3])
      dq.insertAt(-1, 1)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at the end when index equals size', () => {
      const dq = CircularDeque.from([1, 2])
      dq.insertAt(2, 3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at the end when index exceeds size', () => {
      const dq = CircularDeque.from([1, 2])
      dq.insertAt(10, 3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in the middle (closer to front)', () => {
      const dq = CircularDeque.from([1, 2, 4, 5])
      dq.insertAt(2, 3)
      expect(dq.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts in the middle (closer to back)', () => {
      const dq = CircularDeque.from([1, 2, 4, 5, 6])
      dq.insertAt(2, 3)
      expect(dq.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('triggers growth when at capacity', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 2 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.insertAt(1, 99)
      expect(dq.capacity()).toBe(4)
      expect(dq.toArray()).toEqual([1, 99, 2])
    })
  })

  // ─── removeAt ─────────────────────────────────────────────────────────

  describe('removeAt', () => {
    it('returns undefined for out-of-bounds index', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.removeAt(3)).toBeUndefined()
      expect(dq.removeAt(-1)).toBeUndefined()
    })

    it('removes from front when index is 0', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.removeAt(0)).toBe(1)
      expect(dq.toArray()).toEqual([2, 3])
    })

    it('removes from back when index is last', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.removeAt(2)).toBe(3)
      expect(dq.toArray()).toEqual([1, 2])
    })

    it('removes from middle (closer to front)', () => {
      const dq = CircularDeque.from([1, 2, 3, 4, 5])
      expect(dq.removeAt(1)).toBe(2)
      expect(dq.toArray()).toEqual([1, 3, 4, 5])
    })

    it('removes from middle (closer to back)', () => {
      const dq = CircularDeque.from([1, 2, 3, 4, 5])
      expect(dq.removeAt(3)).toBe(4)
      expect(dq.toArray()).toEqual([1, 2, 3, 5])
    })

    it('returns undefined on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.removeAt(0)).toBeUndefined()
    })
  })

  // ─── size / isEmpty / isFull ──────────────────────────────────────────

  describe('size / isEmpty / isFull', () => {
    it('size returns 0 for empty deque', () => {
      expect(new CircularDeque<number>().size()).toBe(0)
    })

    it('isEmpty returns true for empty deque', () => {
      expect(new CircularDeque<number>().isEmpty()).toBe(true)
    })

    it('isFull returns true when at capacity', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 2 })
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.isFull()).toBe(true)
    })

    it('isFull returns false when not at capacity', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      expect(dq.isFull()).toBe(false)
    })

    it('isFull returns false when empty', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      expect(dq.isFull()).toBe(false)
    })

    it('tracks size through mixed operations', () => {
      const dq = new CircularDeque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushFront(0)
      expect(dq.size()).toBe(3)
      dq.popFront()
      expect(dq.size()).toBe(2)
      dq.popBack()
      expect(dq.size()).toBe(1)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns initial capacity', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 8 })
      expect(dq.capacity()).toBe(8)
    })

    it('doubles capacity on growth', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      expect(dq.capacity()).toBe(4)
      for (let i = 0; i < 5; i++) dq.pushBack(i)
      expect(dq.capacity()).toBe(8)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('empties a non-empty deque', () => {
      const dq = CircularDeque.from([1, 2, 3])
      dq.clear()
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
      expect(dq.toArray()).toEqual([])
    })

    it('preserves capacity after clear', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.clear()
      expect(dq.capacity()).toBe(4)
    })

    it('allows operations after clear', () => {
      const dq = CircularDeque.from([1, 2])
      dq.clear()
      dq.pushBack(99)
      expect(dq.size()).toBe(1)
      expect(dq.peekFront()).toBe(99)
    })

    it('clear on empty deque is no-op', () => {
      const dq = new CircularDeque<number>()
      dq.clear()
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const dq = CircularDeque.from([1, 2, 3])
      const cloned = dq.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('modifications to clone do not affect original', () => {
      const dq = CircularDeque.from([1, 2, 3])
      const cloned = dq.clone()
      cloned.pushBack(4)
      expect(dq.size()).toBe(3)
      expect(cloned.size()).toBe(4)
    })

    it('clones empty deque', () => {
      const dq = new CircularDeque<number>()
      const cloned = dq.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('converts to plain array', () => {
      const dq = CircularDeque.from([10, 20, 30])
      expect(dq.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty array for empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.toArray()).toEqual([])
    })

    it('returns a new array each time', () => {
      const dq = CircularDeque.from([1, 2])
      const a1 = dq.toArray()
      const a2 = dq.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })
  })

  // ─── static from ──────────────────────────────────────────────────────

  describe('static from', () => {
    it('creates a deque from an array', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.size()).toBe(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('creates a deque from an empty array', () => {
      const dq = CircularDeque.from([])
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('creates a deque from a Set', () => {
      const dq = CircularDeque.from(new Set([1, 2, 3]))
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('creates a deque from a generator', () => {
      function* gen() {
        yield 10
        yield 20
        yield 30
      }
      const dq = CircularDeque.from(gen())
      expect(dq.toArray()).toEqual([10, 20, 30])
    })

    it('sets capacity to at least the number of items', () => {
      const dq = CircularDeque.from([1, 2, 3, 4, 5])
      expect(dq.capacity()).toBe(5)
    })
  })

  // ─── contains ─────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true when element exists', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.contains(2)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.contains(99)).toBe(false)
    })

    it('returns false on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.contains(1)).toBe(false)
    })

    it('uses strict equality', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.contains(2)).toBe(true)
      expect(dq.contains('2' as unknown as number)).toBe(false)
    })
  })

  // ─── indexOf ──────────────────────────────────────────────────────────

  describe('indexOf', () => {
    it('returns index of found element', () => {
      const dq = CircularDeque.from([10, 20, 30, 20])
      expect(dq.indexOf(20)).toBe(1)
    })

    it('returns -1 when element not found', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.indexOf(1)).toBe(-1)
    })

    it('finds first occurrence', () => {
      const dq = CircularDeque.from([5, 5, 5])
      expect(dq.indexOf(5)).toBe(0)
    })
  })

  // ─── lastIndexOf ──────────────────────────────────────────────────────

  describe('lastIndexOf', () => {
    it('returns last index of element', () => {
      const dq = CircularDeque.from([10, 20, 30, 20])
      expect(dq.lastIndexOf(20)).toBe(3)
    })

    it('returns -1 when element not found', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.lastIndexOf(99)).toBe(-1)
    })

    it('returns -1 on empty deque', () => {
      const dq = new CircularDeque<number>()
      expect(dq.lastIndexOf(1)).toBe(-1)
    })

    it('returns same as indexOf for unique element', () => {
      const dq = CircularDeque.from([1, 2, 3])
      expect(dq.lastIndexOf(2)).toBe(dq.indexOf(2))
    })
  })

  // ─── rotate ───────────────────────────────────────────────────────────

  describe('rotate', () => {
    it('rotates forward by 1', () => {
      const dq = CircularDeque.from([1, 2, 3, 4, 5])
      dq.rotate(1)
      expect(dq.toArray()).toEqual([2, 3, 4, 5, 1])
    })

    it('rotates forward by 2', () => {
      const dq = CircularDeque.from([1, 2, 3, 4, 5])
      dq.rotate(2)
      expect(dq.toArray()).toEqual([3, 4, 5, 1, 2])
    })

    it('rotates backward by 1', () => {
      const dq = CircularDeque.from([1, 2, 3, 4, 5])
      dq.rotate(-1)
      expect(dq.toArray()).toEqual([5, 1, 2, 3, 4])
    })

    it('rotates backward by 2', () => {
      const dq = CircularDeque.from([1, 2, 3, 4, 5])
      dq.rotate(-2)
      expect(dq.toArray()).toEqual([4, 5, 1, 2, 3])
    })

    it('no-op when rotating by 0', () => {
      const dq = CircularDeque.from([1, 2, 3])
      dq.rotate(0)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('no-op when rotating by size', () => {
      const dq = CircularDeque.from([1, 2, 3])
      dq.rotate(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('no-op on empty deque', () => {
      const dq = new CircularDeque<number>()
      dq.rotate(5)
      expect(dq.size()).toBe(0)
    })

    it('no-op on single-element deque', () => {
      const dq = CircularDeque.from([42])
      dq.rotate(10)
      expect(dq.toArray()).toEqual([42])
    })

    it('handles rotation larger than size', () => {
      const dq = CircularDeque.from([1, 2, 3])
      dq.rotate(7)
      expect(dq.toArray()).toEqual([2, 3, 1])
    })
  })

  // ─── stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns correct stats for empty deque', () => {
      const dq = new CircularDeque<number>()
      const stats = dq.stats()
      expect(stats).toEqual({
        capacity: 16,
        size: 0,
        isEmpty: true,
        isFull: false,
        utilization: 0,
      })
    })

    it('returns correct stats for partially filled deque', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 8 })
      dq.pushBack(1)
      dq.pushBack(2)
      const stats = dq.stats()
      expect(stats.capacity).toBe(8)
      expect(stats.size).toBe(2)
      expect(stats.isEmpty).toBe(false)
      expect(stats.isFull).toBe(false)
      expect(stats.utilization).toBeCloseTo(0.25)
    })

    it('returns correct stats for full deque', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 3 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      const stats = dq.stats()
      expect(stats.isFull).toBe(true)
      expect(stats.utilization).toBe(1)
    })
  })

  // ─── Mixed Operations ─────────────────────────────────────────────────

  describe('mixed operations', () => {
    it('interleaved pushFront and pushBack', () => {
      const dq = new CircularDeque<number>()
      dq.pushBack(2)
      dq.pushFront(1)
      dq.pushBack(3)
      dq.pushFront(0)
      expect(dq.toArray()).toEqual([0, 1, 2, 3])
    })

    it('interleaved popFront and popBack', () => {
      const dq = CircularDeque.from([1, 2, 3, 4])
      expect(dq.popFront()).toBe(1)
      expect(dq.popBack()).toBe(4)
      expect(dq.popFront()).toBe(2)
      expect(dq.popBack()).toBe(3)
      expect(dq.isEmpty()).toBe(true)
    })

    it('push and pop cycle with growth', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 2 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.capacity()).toBe(4)
      dq.popFront()
      dq.popFront()
      dq.popFront()
      expect(dq.isEmpty()).toBe(true)
      dq.pushBack(99)
      expect(dq.toArray()).toEqual([99])
    })

    it('object elements work correctly', () => {
      interface Item {
        id: number
        name: string
      }
      const dq = new CircularDeque<Item>()
      dq.pushBack({ id: 1, name: 'a' })
      dq.pushBack({ id: 2, name: 'b' })
      expect(dq.get(0).name).toBe('a')
      expect(dq.get(1).name).toBe('b')
    })
  })

  // ─── Wrap-Around Edge Cases ───────────────────────────────────────────

  describe('wrap-around', () => {
    it('correctly wraps around during popFront and pushBack', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.pushBack(4)
      dq.popFront()
      dq.popFront()
      dq.pushBack(5)
      dq.pushBack(6)
      expect(dq.toArray()).toEqual([3, 4, 5, 6])
    })

    it('correctly wraps around during popBack and pushFront', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.pushBack(4)
      dq.popBack()
      dq.popBack()
      dq.pushFront(0)
      dq.pushFront(-1)
      expect(dq.toArray()).toEqual([-1, 0, 1, 2])
    })

    it('get and set work correctly after wrap-around', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.pushBack(4)
      dq.popFront()
      dq.popFront()
      dq.pushBack(5)
      dq.pushBack(6)
      dq.set(0, 30)
      dq.set(3, 60)
      expect(dq.get(0)).toBe(30)
      expect(dq.get(3)).toBe(60)
      expect(dq.toArray()).toEqual([30, 4, 5, 60])
    })

    it('insertAt works correctly after wrap-around', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.popFront()
      dq.pushBack(4)
      dq.insertAt(1, 99)
      expect(dq.toArray()).toEqual([2, 99, 3, 4])
    })

    it('removeAt works correctly after wrap-around', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.pushBack(4)
      dq.popFront()
      dq.pushBack(5)
      dq.removeAt(1)
      expect(dq.toArray()).toEqual([2, 4, 5])
    })

    it('rotate works correctly after wrap-around', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.pushBack(4)
      dq.popFront()
      dq.pushBack(5)
      dq.rotate(1)
      expect(dq.toArray()).toEqual([3, 4, 5, 2])
    })

    it('indexOf and contains work after wrap-around', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.pushBack(4)
      dq.popFront()
      dq.pushBack(5)
      expect(dq.indexOf(5)).toBe(3)
      expect(dq.contains(5)).toBe(true)
      expect(dq.contains(1)).toBe(false)
    })
  })

  // ─── Growth and Stress ────────────────────────────────────────────────

  describe('growth and stress', () => {
    it('handles many pushBack operations', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 2 })
      for (let i = 0; i < 100; i++) {
        dq.pushBack(i)
      }
      expect(dq.size()).toBe(100)
      expect(dq.get(0)).toBe(0)
      expect(dq.get(99)).toBe(99)
    })

    it('handles many pushFront operations', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 2 })
      for (let i = 0; i < 100; i++) {
        dq.pushFront(i)
      }
      expect(dq.size()).toBe(100)
      expect(dq.get(0)).toBe(99)
      expect(dq.get(99)).toBe(0)
    })

    it('handles capacity 1 edge case', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 1 })
      dq.pushBack(1)
      expect(dq.isFull()).toBe(true)
      dq.pushBack(2)
      expect(dq.capacity()).toBe(2)
      expect(dq.toArray()).toEqual([1, 2])
    })

    it('growth preserves element order after mixed front/back ops', () => {
      const dq = new CircularDeque<number>({ initialCapacity: 4 })
      dq.pushFront(3)
      dq.pushFront(2)
      dq.pushFront(1)
      dq.pushBack(4)
      expect(dq.isFull()).toBe(true)
      dq.pushBack(5)
      expect(dq.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })
})
