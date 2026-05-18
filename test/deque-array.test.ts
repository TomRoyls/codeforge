import { DequeArray, DEFAULT_DEQUE_CAPACITY } from '../src/core/deque-array/deque-array.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('DequeArray', () => {
  describe('constructor', () => {
    it('creates an empty deque with default capacity', () => {
      const deque = new DequeArray<number>()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
      expect(deque.capacity()).toBe(DEFAULT_DEQUE_CAPACITY)
    })

    it('creates a deque with custom capacity via number', () => {
      const deque = new DequeArray<number>(32)
      expect(deque.capacity()).toBe(32)
      expect(deque.size()).toBe(0)
    })

    it('creates a deque with custom capacity via options object', () => {
      const deque = new DequeArray<number>({ initialCapacity: 64 })
      expect(deque.capacity()).toBe(64)
    })

    it('uses default capacity when options object has no initialCapacity', () => {
      const deque = new DequeArray<number>({})
      expect(deque.capacity()).toBe(DEFAULT_DEQUE_CAPACITY)
    })

    it('clamps capacity to 1 when given 0', () => {
      const deque = new DequeArray<number>(0)
      expect(deque.capacity()).toBe(1)
    })

    it('clamps capacity to 1 when given negative number', () => {
      const deque = new DequeArray<number>(-5)
      expect(deque.capacity()).toBe(1)
    })

    it('clamps capacity to 1 when options have initialCapacity 0', () => {
      const deque = new DequeArray<number>({ initialCapacity: 0 })
      expect(deque.capacity()).toBe(1)
    })

    it('clamps capacity to 1 when options have negative initialCapacity', () => {
      const deque = new DequeArray<number>({ initialCapacity: -10 })
      expect(deque.capacity()).toBe(1)
    })

    it('uses default capacity when called with undefined', () => {
      const deque = new DequeArray<number>(undefined)
      expect(deque.capacity()).toBe(DEFAULT_DEQUE_CAPACITY)
    })
  })

  // ─── static fromArray ─────────────────────────────────────────────────

  describe('static fromArray', () => {
    it('creates a deque from an array of values', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.size()).toBe(3)
      expect(deque.get(0)).toBe(1)
      expect(deque.get(1)).toBe(2)
      expect(deque.get(2)).toBe(3)
    })

    it('creates a deque from an empty array', () => {
      const deque = DequeArray.fromArray([])
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
      expect(deque.capacity()).toBe(DEFAULT_DEQUE_CAPACITY)
    })

    it('creates a deque with capacity matching array length', () => {
      const deque = DequeArray.fromArray([10, 20, 30, 40, 50])
      expect(deque.capacity()).toBe(5)
    })

    it('preserves element order', () => {
      const deque = DequeArray.fromArray(['a', 'b', 'c', 'd', 'e'])
      expect(deque.toArray()).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('works with object elements', () => {
      const deque = DequeArray.fromArray([{ x: 1 }, { x: 2 }])
      expect(deque.size()).toBe(2)
      expect(deque.get(0)?.x).toBe(1)
      expect(deque.get(1)?.x).toBe(2)
    })
  })

  // ─── pushBack ─────────────────────────────────────────────────────────

  describe('pushBack', () => {
    it('adds an element to the back', () => {
      const deque = new DequeArray<number>()
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
      expect(deque.get(0)).toBe(1)
    })

    it('maintains order of multiple pushes', () => {
      const deque = new DequeArray<number>()
      deque.pushBack(10)
      deque.pushBack(20)
      deque.pushBack(30)
      expect(deque.toArray()).toEqual([10, 20, 30])
    })

    it('triggers growth when capacity is exceeded', () => {
      const deque = new DequeArray<number>(2)
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.capacity()).toBe(2)
      deque.pushBack(3)
      expect(deque.capacity()).toBe(4)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('handles pushing after popBack', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.popBack()
      deque.pushBack(99)
      expect(deque.toArray()).toEqual([1, 99])
    })

    it('handles string elements', () => {
      const deque = new DequeArray<string>()
      deque.pushBack('hello')
      deque.pushBack('world')
      expect(deque.toArray()).toEqual(['hello', 'world'])
    })
  })

  // ─── pushFront ────────────────────────────────────────────────────────

  describe('pushFront', () => {
    it('adds an element to the front', () => {
      const deque = new DequeArray<number>()
      deque.pushFront(1)
      expect(deque.size()).toBe(1)
      expect(deque.get(0)).toBe(1)
    })

    it('prepends elements maintaining reverse order', () => {
      const deque = new DequeArray<number>()
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('triggers growth when capacity is exceeded', () => {
      const deque = new DequeArray<number>(2)
      deque.pushFront(1)
      deque.pushFront(2)
      expect(deque.capacity()).toBe(2)
      deque.pushFront(3)
      expect(deque.capacity()).toBe(4)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('interleaves with pushBack correctly', () => {
      const deque = new DequeArray<number>(8)
      deque.pushBack(2)
      deque.pushFront(1)
      deque.pushBack(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('handles pushing after popFront', () => {
      const deque = new DequeArray<number>(4)
      deque.pushFront(1)
      deque.pushFront(2)
      deque.popFront()
      deque.pushFront(99)
      expect(deque.toArray()).toEqual([99, 1])
    })
  })

  // ─── popFront ─────────────────────────────────────────────────────────

  describe('popFront', () => {
    it('returns the front element', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.popFront()).toBe(1)
      expect(deque.size()).toBe(2)
    })

    it('returns undefined on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.popFront()).toBeUndefined()
    })

    it('removes elements sequentially from front', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
      expect(deque.popFront()).toBe(3)
      expect(deque.popFront()).toBeUndefined()
      expect(deque.size()).toBe(0)
    })

    it('works after mixed pushFront and pushBack', () => {
      const deque = new DequeArray<number>(8)
      deque.pushFront(0)
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.popFront()).toBe(0)
      expect(deque.popFront()).toBe(1)
      expect(deque.popFront()).toBe(2)
    })
  })

  // ─── popBack ──────────────────────────────────────────────────────────

  describe('popBack', () => {
    it('returns the back element', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.popBack()).toBe(3)
      expect(deque.size()).toBe(2)
    })

    it('returns undefined on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.popBack()).toBeUndefined()
    })

    it('removes elements sequentially from back', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.popBack()).toBe(3)
      expect(deque.popBack()).toBe(2)
      expect(deque.popBack()).toBe(1)
      expect(deque.popBack()).toBeUndefined()
      expect(deque.size()).toBe(0)
    })

    it('works with circular buffer wrap-around', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      deque.pushBack(6)
      expect(deque.popBack()).toBe(6)
      expect(deque.popBack()).toBe(5)
      expect(deque.popBack()).toBe(4)
      expect(deque.popBack()).toBe(3)
    })
  })

  // ─── peekFront ────────────────────────────────────────────────────────

  describe('peekFront', () => {
    it('returns the front element without removing it', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      expect(deque.peekFront()).toBe(10)
      expect(deque.size()).toBe(3)
    })

    it('returns undefined on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.peekFront()).toBeUndefined()
    })

    it('reflects changes after popFront', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.popFront()
      expect(deque.peekFront()).toBe(2)
    })

    it('reflects changes after pushFront', () => {
      const deque = DequeArray.fromArray([2, 3])
      deque.pushFront(1)
      expect(deque.peekFront()).toBe(1)
    })
  })

  // ─── peekBack ─────────────────────────────────────────────────────────

  describe('peekBack', () => {
    it('returns the back element without removing it', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      expect(deque.peekBack()).toBe(30)
      expect(deque.size()).toBe(3)
    })

    it('returns undefined on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.peekBack()).toBeUndefined()
    })

    it('reflects changes after popBack', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.popBack()
      expect(deque.peekBack()).toBe(2)
    })

    it('reflects changes after pushBack', () => {
      const deque = DequeArray.fromArray([1, 2])
      deque.pushBack(3)
      expect(deque.peekBack()).toBe(3)
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns element at valid index', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      expect(deque.get(0)).toBe(10)
      expect(deque.get(1)).toBe(20)
      expect(deque.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds positive index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.get(3)).toBeUndefined()
      expect(deque.get(100)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.get(-1)).toBeUndefined()
      expect(deque.get(-5)).toBeUndefined()
    })

    it('returns undefined on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.get(0)).toBeUndefined()
    })

    it('works correctly after circular buffer wrap-around', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      deque.pushBack(6)
      expect(deque.get(0)).toBe(3)
      expect(deque.get(1)).toBe(4)
      expect(deque.get(2)).toBe(5)
      expect(deque.get(3)).toBe(6)
    })
  })

  // ─── set ──────────────────────────────────────────────────────────────

  describe('set', () => {
    it('sets value at valid index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.set(1, 99)
      expect(deque.get(1)).toBe(99)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(() => deque.set(3, 99)).toThrow(RangeError)
      expect(() => deque.set(3, 99)).toThrow('Index 3 out of bounds for deque of size 3')
    })

    it('throws RangeError for negative index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(() => deque.set(-1, 99)).toThrow(RangeError)
    })

    it('throws RangeError on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(() => deque.set(0, 1)).toThrow(RangeError)
    })

    it('overwrites value at head after pushFront', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.set(0, 42)
      expect(deque.get(0)).toBe(42)
    })
  })

  // ─── insert ───────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts at index 0 using pushFront path', () => {
      const deque = DequeArray.fromArray([2, 3])
      deque.insert(0, 1)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end index using pushBack path', () => {
      const deque = DequeArray.fromArray([1, 2])
      deque.insert(2, 3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in the middle (shift left path)', () => {
      const deque = DequeArray.fromArray([1, 2, 4, 5])
      deque.insert(2, 3)
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts in the middle (shift right path)', () => {
      const deque = DequeArray.fromArray([1, 2, 4, 5, 6])
      deque.insert(2, 3)
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('throws RangeError for negative index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(() => deque.insert(-1, 99)).toThrow(RangeError)
    })

    it('throws RangeError for index beyond size', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(() => deque.insert(4, 99)).toThrow(RangeError)
      expect(() => deque.insert(4, 99)).toThrow('Index 4 out of bounds for insert on deque of size 3')
    })

    it('allows insert at index equal to size', () => {
      const deque = DequeArray.fromArray([1, 2])
      deque.insert(2, 3)
      expect(deque.size()).toBe(3)
      expect(deque.get(2)).toBe(3)
    })

    it('inserts into empty deque at index 0', () => {
      const deque = new DequeArray<number>()
      deque.insert(0, 42)
      expect(deque.size()).toBe(1)
      expect(deque.get(0)).toBe(42)
    })

    it('triggers growth when at capacity', () => {
      const deque = new DequeArray<number>(2)
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.capacity()).toBe(2)
      deque.insert(1, 99)
      expect(deque.capacity()).toBe(4)
      expect(deque.toArray()).toEqual([1, 99, 2])
    })
  })

  // ─── removeAt ─────────────────────────────────────────────────────────

  describe('removeAt', () => {
    it('removes from index 0 using popFront path', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.removeAt(0)).toBe(1)
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('removes from last index using popBack path', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.removeAt(2)).toBe(3)
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('removes from the middle (shift left path)', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.removeAt(1)).toBe(2)
      expect(deque.toArray()).toEqual([1, 3, 4, 5])
    })

    it('removes from the middle (shift right path)', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.removeAt(3)).toBe(4)
      expect(deque.toArray()).toEqual([1, 2, 3, 5])
    })

    it('returns undefined for negative index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.removeAt(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.removeAt(3)).toBeUndefined()
      expect(deque.removeAt(100)).toBeUndefined()
    })

    it('returns undefined on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.removeAt(0)).toBeUndefined()
    })

    it('removes all elements one by one', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.removeAt(1)
      deque.removeAt(0)
      deque.removeAt(0)
      expect(deque.size()).toBe(0)
    })
  })

  // ─── indexOf ──────────────────────────────────────────────────────────

  describe('indexOf', () => {
    it('returns index of found element', () => {
      const deque = DequeArray.fromArray([10, 20, 30, 20])
      expect(deque.indexOf(20)).toBe(1)
    })

    it('returns -1 when element not found', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.indexOf(1)).toBe(-1)
    })

    it('uses strict equality (===) for comparison', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.indexOf(2)).toBe(1)
      expect(deque.indexOf('2' as unknown as number)).toBe(-1)
    })

    it('finds first occurrence of duplicate values', () => {
      const deque = DequeArray.fromArray([5, 10, 5, 10])
      expect(deque.indexOf(5)).toBe(0)
      expect(deque.indexOf(10)).toBe(1)
    })
  })

  // ─── includes ─────────────────────────────────────────────────────────

  describe('includes', () => {
    it('returns true when element exists', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.includes(2)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.includes(99)).toBe(false)
    })

    it('returns false on empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.includes(1)).toBe(false)
    })

    it('returns true for first and last elements', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      expect(deque.includes(10)).toBe(true)
      expect(deque.includes(30)).toBe(true)
    })
  })

  // ─── size / isEmpty / isFull ──────────────────────────────────────────

  describe('size / isEmpty / isFull', () => {
    it('size returns 0 for empty deque', () => {
      expect(new DequeArray<number>().size()).toBe(0)
    })

    it('isEmpty returns true for empty deque', () => {
      expect(new DequeArray<number>().isEmpty()).toBe(true)
    })

    it('isFull returns false for empty deque', () => {
      expect(new DequeArray<number>().isFull()).toBe(false)
    })

    it('isFull returns true when at capacity', () => {
      const deque = new DequeArray<number>(2)
      deque.pushBack(1)
      deque.pushBack(2)
      expect(deque.isFull()).toBe(true)
    })

    it('isFull returns false after growth', () => {
      const deque = new DequeArray<number>(2)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.isFull()).toBe(false)
    })

    it('size tracks elements through push and pop', () => {
      const deque = new DequeArray<number>()
      deque.pushBack(1)
      expect(deque.size()).toBe(1)
      expect(deque.isEmpty()).toBe(false)
      deque.popBack()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('size tracks elements through pushFront and popFront', () => {
      const deque = new DequeArray<number>()
      deque.pushFront(1)
      expect(deque.size()).toBe(1)
      deque.popFront()
      expect(deque.size()).toBe(0)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.clear()
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('clear does not change capacity', () => {
      const deque = new DequeArray<number>(8)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.clear()
      expect(deque.capacity()).toBe(8)
    })

    it('clear on empty deque is a no-op', () => {
      const deque = new DequeArray<number>()
      deque.clear()
      expect(deque.size()).toBe(0)
    })

    it('allows pushing after clear', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.clear()
      deque.pushBack(99)
      expect(deque.size()).toBe(1)
      expect(deque.get(0)).toBe(99)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('converts to plain array', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      expect(deque.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty array for empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.toArray()).toEqual([])
    })

    it('returns a new array each time', () => {
      const deque = DequeArray.fromArray([1, 2])
      const a1 = deque.toArray()
      const a2 = deque.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('works correctly after circular wrap-around', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      expect(deque.toArray()).toEqual([3, 4, 5])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements with correct indices', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      const results: Array<{ value: number; index: number }> = []
      deque.forEach((value, index) => {
        results.push({ value, index })
      })
      expect(results).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('does not call callback on empty deque', () => {
      const deque = new DequeArray<number>()
      let callCount = 0
      deque.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates correctly after mixed operations', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushFront(0)
      const values: number[] = []
      deque.forEach((v) => values.push(v))
      expect(values).toEqual([0, 1, 2])
    })
  })

  // ─── map ──────────────────────────────────────────────────────────────

  describe('map', () => {
    it('transforms all elements', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      const mapped = deque.map((v) => v * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty deque from empty input', () => {
      const deque = new DequeArray<number>()
      const mapped = deque.map((v) => v)
      expect(mapped.size()).toBe(0)
    })

    it('provides correct indices', () => {
      const deque = DequeArray.fromArray(['a', 'b', 'c'])
      const mapped = deque.map((v, i) => `${v}-${i}`)
      expect(mapped.toArray()).toEqual(['a-0', 'b-1', 'c-2'])
    })

    it('transforms to a different type', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      const mapped = deque.map((v) => v.toString())
      expect(mapped.toArray()).toEqual(['1', '2', '3'])
    })
  })

  // ─── filter ───────────────────────────────────────────────────────────

  describe('filter', () => {
    it('filters elements based on predicate', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      const filtered = deque.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns empty deque when nothing matches', () => {
      const deque = DequeArray.fromArray([1, 3, 5])
      const filtered = deque.filter((v) => v % 2 === 0)
      expect(filtered.size()).toBe(0)
    })

    it('returns all elements when all match', () => {
      const deque = DequeArray.fromArray([2, 4, 6])
      const filtered = deque.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('provides correct indices to predicate', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      const filtered = deque.filter((_v, i) => i !== 1)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('returns empty from empty deque', () => {
      const deque = new DequeArray<number>()
      const filtered = deque.filter(() => true)
      expect(filtered.size()).toBe(0)
    })
  })

  // ─── reverse ──────────────────────────────────────────────────────────

  describe('reverse', () => {
    it('reverses the deque in place', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      deque.reverse()
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('handles empty deque', () => {
      const deque = new DequeArray<number>()
      deque.reverse()
      expect(deque.size()).toBe(0)
    })

    it('handles single element', () => {
      const deque = DequeArray.fromArray([42])
      deque.reverse()
      expect(deque.toArray()).toEqual([42])
    })

    it('handles two elements', () => {
      const deque = DequeArray.fromArray([1, 2])
      deque.reverse()
      expect(deque.toArray()).toEqual([2, 1])
    })

    it('handles even number of elements', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4])
      deque.reverse()
      expect(deque.toArray()).toEqual([4, 3, 2, 1])
    })

    it('double reverse restores original order', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      deque.reverse()
      deque.reverse()
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  // ─── slice ────────────────────────────────────────────────────────────

  describe('slice', () => {
    it('returns entire array with no arguments', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.slice()).toEqual([1, 2, 3, 4, 5])
    })

    it('returns slice from start index', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.slice(2)).toEqual([3, 4, 5])
    })

    it('returns slice with start and end', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.slice(1, 4)).toEqual([2, 3, 4])
    })

    it('handles negative start', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.slice(-3)).toEqual([3, 4, 5])
    })

    it('handles negative end', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.slice(1, -1)).toEqual([2, 3, 4])
    })

    it('handles both negative indices', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5])
      expect(deque.slice(-3, -1)).toEqual([3, 4])
    })

    it('returns empty array when start >= end', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.slice(2, 2)).toEqual([])
    })

    it('clamps out-of-range indices', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect(deque.slice(-10, 10)).toEqual([1, 2, 3])
    })

    it('returns empty array from empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.slice()).toEqual([])
    })
  })

  // ─── concat ───────────────────────────────────────────────────────────

  describe('concat', () => {
    it('concatenates two deques', () => {
      const a = DequeArray.fromArray([1, 2])
      const b = DequeArray.fromArray([3, 4])
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('does not modify the originals', () => {
      const a = DequeArray.fromArray([1])
      const b = DequeArray.fromArray([2])
      a.concat(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('concatenates with empty deque', () => {
      const a = DequeArray.fromArray([1, 2])
      const b = new DequeArray<number>()
      expect(a.concat(b).toArray()).toEqual([1, 2])
      expect(b.concat(a).toArray()).toEqual([1, 2])
    })

    it('concatenates two empty deques', () => {
      const a = new DequeArray<number>()
      const b = new DequeArray<number>()
      expect(a.concat(b).size()).toBe(0)
    })

    it('preserves order', () => {
      const a = DequeArray.fromArray([1, 2, 3])
      const b = DequeArray.fromArray([4, 5, 6])
      expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      const cloned = deque.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('modifications to clone do not affect original', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      const cloned = deque.clone()
      cloned.pushBack(4)
      expect(deque.size()).toBe(3)
      expect(cloned.size()).toBe(4)
    })

    it('clones empty deque', () => {
      const deque = new DequeArray<number>()
      const cloned = deque.clone()
      expect(cloned.size()).toBe(0)
    })

    it('preserves capacity', () => {
      const deque = new DequeArray<number>(8)
      deque.pushBack(1)
      expect(deque.clone().capacity()).toBe(8)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns initial capacity', () => {
      const deque = new DequeArray<number>(32)
      expect(deque.capacity()).toBe(32)
    })

    it('doubles on growth', () => {
      const deque = new DequeArray<number>(4)
      expect(deque.capacity()).toBe(4)
      for (let i = 0; i < 5; i++) deque.pushBack(i)
      expect(deque.capacity()).toBe(8)
    })
  })

  // ─── drain ────────────────────────────────────────────────────────────

  describe('drain', () => {
    it('returns all elements and clears the deque', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      const drained = deque.drain()
      expect(drained).toEqual([1, 2, 3])
      expect(deque.size()).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('returns empty array for empty deque', () => {
      const deque = new DequeArray<number>()
      expect(deque.drain()).toEqual([])
    })

    it('deque is usable after drain', () => {
      const deque = DequeArray.fromArray([1, 2])
      deque.drain()
      deque.pushBack(99)
      expect(deque.size()).toBe(1)
      expect(deque.get(0)).toBe(99)
    })
  })

  // ─── Symbol.iterator ──────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const deque = DequeArray.fromArray([10, 20, 30])
      const result: number[] = []
      for (const item of deque) {
        result.push(item)
      }
      expect(result).toEqual([10, 20, 30])
    })

    it('yields nothing for empty deque', () => {
      const deque = new DequeArray<number>()
      const result: number[] = []
      for (const item of deque) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('works with spread operator', () => {
      const deque = DequeArray.fromArray([1, 2, 3])
      expect([...deque]).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const deque = DequeArray.fromArray([5, 6, 7])
      expect(Array.from(deque)).toEqual([5, 6, 7])
    })
  })

  // ─── DEFAULT_DEQUE_CAPACITY ───────────────────────────────────────────

  describe('DEFAULT_DEQUE_CAPACITY', () => {
    it('is 16', () => {
      expect(DEFAULT_DEQUE_CAPACITY).toBe(16)
    })
  })

  // ─── Growth and Wrap-Around ───────────────────────────────────────────

  describe('growth and circular buffer', () => {
    it('handles growth with pushBack exceeding capacity', () => {
      const deque = new DequeArray<number>(2)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      expect(deque.capacity()).toBe(4)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('handles growth with pushFront exceeding capacity', () => {
      const deque = new DequeArray<number>(2)
      deque.pushFront(1)
      deque.pushFront(2)
      deque.pushFront(3)
      expect(deque.capacity()).toBe(4)
      expect(deque.toArray()).toEqual([3, 2, 1])
    })

    it('handles multiple growth cycles', () => {
      const deque = new DequeArray<number>(1)
      for (let i = 0; i < 10; i++) {
        deque.pushBack(i)
      }
      expect(deque.size()).toBe(10)
      expect(deque.capacity()).toBe(16)
      for (let i = 0; i < 10; i++) {
        expect(deque.get(i)).toBe(i)
      }
    })

    it('handles wrap-around with pushFront and popFront', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushFront(10)
      deque.pushFront(20)
      expect(deque.toArray()).toEqual([20, 10, 3, 4])
    })

    it('pushBack after popFront reuses space', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      deque.pushBack(6)
      expect(deque.toArray()).toEqual([3, 4, 5, 6])
      expect(deque.isFull()).toBe(true)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles pushFront then pushBack alternation', () => {
      const deque = new DequeArray<number>(8)
      deque.pushFront(4)
      deque.pushBack(5)
      deque.pushFront(3)
      deque.pushBack(6)
      deque.pushFront(2)
      deque.pushBack(7)
      deque.pushFront(1)
      deque.pushBack(8)
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('handles pushing and popping to empty repeatedly', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      expect(deque.popBack()).toBe(1)
      expect(deque.size()).toBe(0)
      deque.pushFront(2)
      expect(deque.popFront()).toBe(2)
      expect(deque.size()).toBe(0)
      deque.pushBack(3)
      expect(deque.get(0)).toBe(3)
    })

    it('handles large number of elements', () => {
      const deque = new DequeArray<number>(16)
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i)
      }
      expect(deque.size()).toBe(1000)
      expect(deque.get(0)).toBe(0)
      expect(deque.get(500)).toBe(500)
      expect(deque.get(999)).toBe(999)
    })

    it('handles object elements', () => {
      interface Item {
        id: number
        name: string
      }
      const deque = new DequeArray<Item>(4)
      deque.pushBack({ id: 1, name: 'a' })
      deque.pushBack({ id: 2, name: 'b' })
      deque.pushBack({ id: 3, name: 'c' })
      expect(deque.get(1)?.name).toBe('b')
      expect(deque.size()).toBe(3)
    })

    it('map then filter chain', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5, 6])
      const result = deque.map((v) => v * 2).filter((v) => v > 6)
      expect(result.toArray()).toEqual([8, 10, 12])
    })

    it('filter then toArray', () => {
      const deque = DequeArray.fromArray([1, 2, 3, 4, 5, 6])
      const evens = deque.filter((v) => v % 2 === 0)
      expect(evens.toArray()).toEqual([2, 4, 6])
    })

    it('insert at index 0 in empty deque via fromArray then insert', () => {
      const deque = DequeArray.fromArray([2, 3])
      deque.insert(0, 1)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('removeAt from deque with circular buffer', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      expect(deque.removeAt(1)).toBe(4)
      expect(deque.toArray()).toEqual([3, 5])
    })

    it('reverse on wrapped deque', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      deque.reverse()
      expect(deque.toArray()).toEqual([5, 4, 3])
    })

    it('slice on wrapped deque', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      expect(deque.slice(1, 3)).toEqual([4, 5])
    })

    it('indexOf on wrapped deque', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      expect(deque.indexOf(3)).toBe(0)
      expect(deque.indexOf(4)).toBe(1)
      expect(deque.indexOf(5)).toBe(2)
      expect(deque.indexOf(1)).toBe(-1)
    })

    it('set on wrapped deque', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      deque.set(1, 99)
      expect(deque.toArray()).toEqual([3, 99, 5])
    })

    it('forEach on wrapped deque', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.popFront()
      deque.popFront()
      deque.pushBack(5)
      const values: number[] = []
      deque.forEach((v) => values.push(v))
      expect(values).toEqual([3, 4, 5])
    })

    it('multiple operations maintain consistency', () => {
      const deque = new DequeArray<number>(4)
      deque.pushBack(1)
      deque.pushBack(2)
      deque.pushBack(3)
      deque.pushBack(4)
      deque.set(2, 99)
      deque.popBack()
      const sliced = deque.slice(1, 3)
      expect(sliced).toEqual([2, 99])
      expect(deque.indexOf(99)).toBe(2)
      expect(deque.includes(99)).toBe(true)
      expect(deque.includes(4)).toBe(false)
    })

    it('clone preserves elements after complex operations', () => {
      const deque = new DequeArray<number>(4)
      deque.pushFront(3)
      deque.pushFront(2)
      deque.pushFront(1)
      deque.pushBack(4)
      const cloned = deque.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3, 4])
      deque.popFront()
      expect(cloned.toArray()).toEqual([1, 2, 3, 4])
    })
  })
})
