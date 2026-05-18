import { BlockedArray } from '../src/core/blocked-array/blocked-array.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BlockedArray', () => {
  describe('constructor', () => {
    it('creates an empty array with default block size', () => {
      const arr = new BlockedArray<number>()
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
      expect(arr.blockSize()).toBe(64)
    })

    it('creates an empty array with custom block size', () => {
      const arr = new BlockedArray<number>(4)
      expect(arr.size()).toBe(0)
      expect(arr.blockSize()).toBe(4)
    })

    it('creates an empty array with block size 1', () => {
      const arr = new BlockedArray<number>(1)
      expect(arr.blockSize()).toBe(1)
      expect(arr.size()).toBe(0)
    })

    it('throws RangeError for block size 0', () => {
      expect(() => new BlockedArray<number>(0)).toThrow(RangeError)
      expect(() => new BlockedArray<number>(0)).toThrow('blockSize must be at least 1')
    })

    it('throws RangeError for negative block size', () => {
      expect(() => new BlockedArray<number>(-1)).toThrow(RangeError)
      expect(() => new BlockedArray<number>(-10)).toThrow('blockSize must be at least 1')
    })
  })

  // ─── static from ─────────────────────────────────────────────────────

  describe('static from', () => {
    it('creates a BlockedArray from an array of values', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.size()).toBe(3)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(3)
    })

    it('creates a BlockedArray from an empty array', () => {
      const arr = BlockedArray.from([])
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })

    it('creates a BlockedArray with custom block size', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5], 2)
      expect(arr.size()).toBe(5)
      expect(arr.blockSize()).toBe(2)
    })

    it('preserves element order', () => {
      const arr = BlockedArray.from(['a', 'b', 'c', 'd', 'e'])
      expect(arr.toArray()).toEqual(['a', 'b', 'c', 'd', 'e'])
    })
  })

  // ─── push ─────────────────────────────────────────────────────────────

  describe('push', () => {
    it('adds an element and returns new size', () => {
      const arr = new BlockedArray<number>(4)
      expect(arr.push(10)).toBe(1)
      expect(arr.push(20)).toBe(2)
      expect(arr.size()).toBe(2)
    })

    it('stores pushed values correctly', () => {
      const arr = new BlockedArray<number>(4)
      arr.push(10)
      arr.push(20)
      arr.push(30)
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('handles pushing undefined values', () => {
      const arr = new BlockedArray<number | undefined>(4)
      arr.push(undefined)
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBeUndefined()
    })

    it('handles pushing many elements across blocks', () => {
      const arr = new BlockedArray<number>(3)
      for (let i = 0; i < 10; i++) {
        arr.push(i)
      }
      expect(arr.size()).toBe(10)
      expect(arr.blockCount()).toBe(4)
      for (let i = 0; i < 10; i++) {
        expect(arr.get(i)).toBe(i)
      }
    })

    it('handles string elements', () => {
      const arr = new BlockedArray<string>(2)
      arr.push('hello')
      arr.push('world')
      expect(arr.toArray()).toEqual(['hello', 'world'])
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns element at valid index', () => {
      const arr = BlockedArray.from([10, 20, 30], 2)
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('returns element using negative index', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.get(-1)).toBe(30)
      expect(arr.get(-2)).toBe(20)
      expect(arr.get(-3)).toBe(10)
    })

    it('throws RangeError for out-of-bounds positive index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(() => arr.get(3)).toThrow(RangeError)
      expect(() => arr.get(100)).toThrow(RangeError)
    })

    it('throws RangeError for out-of-bounds negative index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(() => arr.get(-4)).toThrow(RangeError)
    })

    it('throws RangeError on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(() => arr.get(0)).toThrow(RangeError)
    })

    it('reads from correct block in multi-block array', () => {
      const arr = new BlockedArray<number>(2)
      for (let i = 0; i < 6; i++) arr.push(i)
      // Block 0: [0, 1], Block 1: [2, 3], Block 2: [4, 5]
      expect(arr.get(0)).toBe(0)
      expect(arr.get(2)).toBe(2)
      expect(arr.get(4)).toBe(4)
      expect(arr.get(5)).toBe(5)
    })
  })

  // ─── set ──────────────────────────────────────────────────────────────

  describe('set', () => {
    it('sets value at valid index', () => {
      const arr = BlockedArray.from([1, 2, 3], 2)
      arr.set(1, 99)
      expect(arr.get(1)).toBe(99)
    })

    it('sets value using negative index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.set(-1, 99)
      expect(arr.get(2)).toBe(99)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(() => arr.set(3, 99)).toThrow(RangeError)
      expect(() => arr.set(-4, 99)).toThrow(RangeError)
    })

    it('throws RangeError on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(() => arr.set(0, 1)).toThrow(RangeError)
    })

    it('overwrites existing values across block boundaries', () => {
      const arr = new BlockedArray<number>(2)
      for (let i = 0; i < 6; i++) arr.push(i)
      arr.set(2, 200)
      arr.set(3, 300)
      expect(arr.get(2)).toBe(200)
      expect(arr.get(3)).toBe(300)
    })
  })

  // ─── pop ──────────────────────────────────────────────────────────────

  describe('pop', () => {
    it('returns the last element', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.pop()).toBe(3)
      expect(arr.size()).toBe(2)
    })

    it('returns undefined on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.pop()).toBeUndefined()
    })

    it('removes elements sequentially', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.pop()).toBe(3)
      expect(arr.pop()).toBe(2)
      expect(arr.pop()).toBe(1)
      expect(arr.pop()).toBeUndefined()
      expect(arr.size()).toBe(0)
    })

    it('cleans up empty blocks', () => {
      const arr = new BlockedArray<number>(2)
      arr.push(1)
      arr.push(2)
      expect(arr.blockCount()).toBe(1)
      arr.pop()
      arr.pop()
      expect(arr.blockCount()).toBe(0)
    })
  })

  // ─── shift ────────────────────────────────────────────────────────────

  describe('shift', () => {
    it('returns the first element', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.shift()).toBe(10)
      expect(arr.size()).toBe(2)
    })

    it('returns undefined on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.shift()).toBeUndefined()
    })

    it('shifts all elements out', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.shift()).toBe(1)
      expect(arr.shift()).toBe(2)
      expect(arr.shift()).toBe(3)
      expect(arr.shift()).toBeUndefined()
      expect(arr.size()).toBe(0)
    })

    it('cleans up empty blocks after shift', () => {
      const arr = new BlockedArray<number>(1)
      arr.push(1)
      arr.push(2)
      expect(arr.blockCount()).toBe(2)
      arr.shift()
      arr.shift()
      expect(arr.blockCount()).toBe(0)
    })
  })

  // ─── unshift ──────────────────────────────────────────────────────────

  describe('unshift', () => {
    it('adds element at the front and returns new size', () => {
      const arr = new BlockedArray<number>()
      expect(arr.unshift(1)).toBe(1)
      expect(arr.unshift(2)).toBe(2)
      expect(arr.get(0)).toBe(2)
      expect(arr.get(1)).toBe(1)
    })

    it('unshifts into empty array', () => {
      const arr = new BlockedArray<number>(4)
      arr.unshift(42)
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBe(42)
    })

    it('unshifts multiple elements maintaining order', () => {
      const arr = new BlockedArray<number>(4)
      arr.unshift(3)
      arr.unshift(2)
      arr.unshift(1)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── slice ────────────────────────────────────────────────────────────

  describe('slice', () => {
    it('returns a copy of the entire array with no arguments', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const sliced = arr.slice()
      expect(sliced.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(sliced.size()).toBe(5)
    })

    it('returns a slice from start index', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const sliced = arr.slice(2)
      expect(sliced.toArray()).toEqual([3, 4, 5])
    })

    it('returns a slice with start and end', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const sliced = arr.slice(1, 4)
      expect(sliced.toArray()).toEqual([2, 3, 4])
    })

    it('handles negative indices', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const sliced = arr.slice(-3, -1)
      expect(sliced.toArray()).toEqual([3, 4])
    })

    it('returns empty slice when start >= end', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const sliced = arr.slice(2, 2)
      expect(sliced.size()).toBe(0)
    })

    it('clamps out-of-range indices', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const sliced = arr.slice(-10, 10)
      expect(sliced.toArray()).toEqual([1, 2, 3])
    })

    it('preserves block size', () => {
      const arr = BlockedArray.from([1, 2, 3], 2)
      const sliced = arr.slice(0, 2)
      expect(sliced.blockSize()).toBe(2)
    })
  })

  // ─── indexOf ──────────────────────────────────────────────────────────

  describe('indexOf', () => {
    it('returns index of found element', () => {
      const arr = BlockedArray.from([10, 20, 30, 20])
      expect(arr.indexOf(20)).toBe(1)
    })

    it('returns -1 when element not found', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.indexOf(1)).toBe(-1)
    })

    it('uses strict equality for comparison', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.indexOf(2)).toBe(1)
    })

    it('uses custom comparator when provided', () => {
      const arr = BlockedArray.from([{ id: 1 }, { id: 2 }])
      const result = arr.indexOf({ id: 2 }, (a, b) => a.id === b.id)
      expect(result).toBe(1)
    })

    it('custom comparator returning -1 for no match', () => {
      const arr = BlockedArray.from([{ id: 1 }, { id: 2 }])
      const result = arr.indexOf({ id: 99 }, (a, b) => a.id === b.id)
      expect(result).toBe(-1)
    })
  })

  // ─── includes ─────────────────────────────────────────────────────────

  describe('includes', () => {
    it('returns true when element exists', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.includes(2)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.includes(99)).toBe(false)
    })

    it('returns false on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.includes(1)).toBe(false)
    })

    it('uses custom comparator', () => {
      const arr = BlockedArray.from([{ v: 'a' }, { v: 'b' }])
      expect(arr.includes({ v: 'b' }, (a, b) => a.v === b.v)).toBe(true)
      expect(arr.includes({ v: 'z' }, (a, b) => a.v === b.v)).toBe(false)
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements with correct indices', () => {
      const arr = BlockedArray.from([10, 20, 30])
      const results: Array<{ value: number; index: number }> = []
      arr.forEach((value, index) => {
        results.push({ value, index })
      })
      expect(results).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('does not call callback on empty array', () => {
      const arr = new BlockedArray<number>()
      let callCount = 0
      arr.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })
  })

  // ─── map ──────────────────────────────────────────────────────────────

  describe('map', () => {
    it('transforms all elements', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const mapped = arr.map((v) => v * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty array from empty input', () => {
      const arr = new BlockedArray<number>()
      const mapped = arr.map((v) => v)
      expect(mapped.size()).toBe(0)
    })

    it('preserves block size', () => {
      const arr = BlockedArray.from([1, 2], 4)
      const mapped = arr.map((v) => v.toString())
      expect(mapped.blockSize()).toBe(4)
    })

    it('provides correct indices', () => {
      const arr = BlockedArray.from(['a', 'b', 'c'])
      const mapped = arr.map((v, i) => `${v}-${i}`)
      expect(mapped.toArray()).toEqual(['a-0', 'b-1', 'c-2'])
    })
  })

  // ─── filter ───────────────────────────────────────────────────────────

  describe('filter', () => {
    it('filters elements based on predicate', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns empty array when nothing matches', () => {
      const arr = BlockedArray.from([1, 3, 5])
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.size()).toBe(0)
    })

    it('returns all elements when all match', () => {
      const arr = BlockedArray.from([2, 4, 6])
      const filtered = arr.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('provides correct indices to predicate', () => {
      const arr = BlockedArray.from([10, 20, 30])
      const filtered = arr.filter((_v, i) => i !== 1)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('returns empty from empty array', () => {
      const arr = new BlockedArray<number>()
      const filtered = arr.filter(() => true)
      expect(filtered.size()).toBe(0)
    })
  })

  // ─── reduce ───────────────────────────────────────────────────────────

  describe('reduce', () => {
    it('reduces to a sum', () => {
      const arr = BlockedArray.from([1, 2, 3, 4])
      const sum = arr.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(10)
    })

    it('returns initial value for empty array', () => {
      const arr = new BlockedArray<number>()
      const result = arr.reduce((acc, v) => acc + v, 42)
      expect(result).toBe(42)
    })

    it('reduces to a different type', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const joined = arr.reduce((acc, v) => acc + v.toString() + ',', '')
      expect(joined).toBe('1,2,3,')
    })
  })

  // ─── find ─────────────────────────────────────────────────────────────

  describe('find', () => {
    it('finds first matching element', () => {
      const arr = BlockedArray.from([1, 2, 3, 4])
      const result = arr.find((v) => v > 2)
      expect(result).toBe(3)
    })

    it('returns undefined when nothing matches', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const result = arr.find((v) => v > 100)
      expect(result).toBeUndefined()
    })

    it('returns undefined on empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.find(() => true)).toBeUndefined()
    })
  })

  // ─── reverse ──────────────────────────────────────────────────────────

  describe('reverse', () => {
    it('returns a new reversed array', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const reversed = arr.reverse()
      expect(reversed.toArray()).toEqual([3, 2, 1])
    })

    it('does not modify the original', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.reverse()
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty from empty array', () => {
      const arr = new BlockedArray<number>()
      const reversed = arr.reverse()
      expect(reversed.size()).toBe(0)
    })

    it('handles single element', () => {
      const arr = BlockedArray.from([42])
      expect(arr.reverse().toArray()).toEqual([42])
    })

    it('preserves block size', () => {
      const arr = BlockedArray.from([1, 2, 3], 2)
      expect(arr.reverse().blockSize()).toBe(2)
    })
  })

  // ─── concat ───────────────────────────────────────────────────────────

  describe('concat', () => {
    it('concatenates two arrays', () => {
      const a = BlockedArray.from([1, 2])
      const b = BlockedArray.from([3, 4])
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('does not modify the originals', () => {
      const a = BlockedArray.from([1])
      const b = BlockedArray.from([2])
      a.concat(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })

    it('concatenates with empty array', () => {
      const a = BlockedArray.from([1, 2])
      const b = new BlockedArray<number>()
      expect(a.concat(b).toArray()).toEqual([1, 2])
      expect(b.concat(a).toArray()).toEqual([1, 2])
    })

    it('concatenates two empty arrays', () => {
      const a = new BlockedArray<number>()
      const b = new BlockedArray<number>()
      expect(a.concat(b).size()).toBe(0)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('converts to plain array', () => {
      const arr = BlockedArray.from([10, 20, 30])
      expect(arr.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty array for empty BlockedArray', () => {
      const arr = new BlockedArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('returns a new array each time', () => {
      const arr = BlockedArray.from([1, 2])
      const a1 = arr.toArray()
      const a2 = arr.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })
  })

  // ─── size / isEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size returns 0 for empty array', () => {
      expect(new BlockedArray<number>().size()).toBe(0)
    })

    it('isEmpty returns true for empty array', () => {
      expect(new BlockedArray<number>().isEmpty()).toBe(true)
    })

    it('size tracks elements after push and pop', () => {
      const arr = new BlockedArray<number>()
      arr.push(1)
      expect(arr.size()).toBe(1)
      expect(arr.isEmpty()).toBe(false)
      arr.pop()
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
    })
  })

  // ─── blockCount / blockSize ───────────────────────────────────────────

  describe('blockCount and blockSize', () => {
    it('blockCount is 0 for empty array', () => {
      expect(new BlockedArray<number>().blockCount()).toBe(0)
    })

    it('blockCount increases as blocks are needed', () => {
      const arr = new BlockedArray<number>(3)
      arr.push(1)
      expect(arr.blockCount()).toBe(1)
      arr.push(2)
      arr.push(3)
      expect(arr.blockCount()).toBe(1)
      arr.push(4)
      expect(arr.blockCount()).toBe(2)
    })

    it('blockSize returns configured size', () => {
      expect(new BlockedArray<number>(7).blockSize()).toBe(7)
      expect(new BlockedArray<number>().blockSize()).toBe(64)
    })
  })

  // ─── toString ─────────────────────────────────────────────────────────

  describe('toString', () => {
    it('returns comma-separated values', () => {
      const arr = BlockedArray.from([1, 2, 3])
      expect(arr.toString()).toBe('1,2,3')
    })

    it('returns empty string for empty array', () => {
      const arr = new BlockedArray<number>()
      expect(arr.toString()).toBe('')
    })
  })

  // ─── equals ───────────────────────────────────────────────────────────

  describe('equals', () => {
    it('returns true for identical arrays', () => {
      const a = BlockedArray.from([1, 2, 3])
      const b = BlockedArray.from([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different arrays', () => {
      const a = BlockedArray.from([1, 2, 3])
      const b = BlockedArray.from([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for different sizes', () => {
      const a = BlockedArray.from([1, 2])
      const b = BlockedArray.from([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for empty arrays', () => {
      const a = new BlockedArray<number>()
      const b = new BlockedArray<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('uses custom comparator', () => {
      const a = BlockedArray.from([{ v: 1 }, { v: 2 }])
      const b = BlockedArray.from([{ v: 1 }, { v: 2 }])
      expect(a.equals(b, (x, y) => x.v === y.v)).toBe(true)
    })

    it('custom comparator returning false', () => {
      const a = BlockedArray.from([{ v: 1 }])
      const b = BlockedArray.from([{ v: 2 }])
      expect(a.equals(b, (x, y) => x.v === y.v)).toBe(false)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const cloned = arr.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)
    })

    it('modifications to clone do not affect original', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const cloned = arr.clone()
      cloned.push(4)
      expect(arr.size()).toBe(3)
      expect(cloned.size()).toBe(4)
    })

    it('clones empty array', () => {
      const arr = new BlockedArray<number>()
      const cloned = arr.clone()
      expect(cloned.size()).toBe(0)
    })

    it('preserves block size', () => {
      const arr = BlockedArray.from([1, 2], 4)
      expect(arr.clone().blockSize()).toBe(4)
    })
  })

  // ─── fill ─────────────────────────────────────────────────────────────

  describe('fill', () => {
    it('fills entire array with value', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0)
      expect(arr.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('fills from start index', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0, 2)
      expect(arr.toArray()).toEqual([1, 2, 0, 0, 0])
    })

    it('fills with start and end', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0, 1, 4)
      expect(arr.toArray()).toEqual([1, 0, 0, 0, 5])
    })

    it('handles negative indices', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      arr.fill(0, -3, -1)
      expect(arr.toArray()).toEqual([1, 2, 0, 0, 5])
    })

    it('does nothing on empty array', () => {
      const arr = new BlockedArray<number>()
      arr.fill(99)
      expect(arr.size()).toBe(0)
    })

    it('clamps out-of-range indices', () => {
      const arr = BlockedArray.from([1, 2, 3])
      arr.fill(0, -10, 10)
      expect(arr.toArray()).toEqual([0, 0, 0])
    })
  })

  // ─── splice ───────────────────────────────────────────────────────────

  describe('splice', () => {
    it('removes elements from the middle', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(1, 2)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1, 4, 5])
    })

    it('removes from the start', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(0, 2)
      expect(removed.toArray()).toEqual([1, 2])
      expect(arr.toArray()).toEqual([3, 4, 5])
    })

    it('removes from the end', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(3, 2)
      expect(removed.toArray()).toEqual([4, 5])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('removes all elements when deleteCount exceeds length', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const removed = arr.splice(1, 100)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1])
    })

    it('inserts elements without deleting', () => {
      const arr = BlockedArray.from([1, 4])
      const removed = arr.splice(1, 0, 2, 3)
      expect(removed.size()).toBe(0)
      expect(arr.toArray()).toEqual([1, 2, 3, 4])
    })

    it('replaces elements', () => {
      const arr = BlockedArray.from([1, 2, 3, 4])
      const removed = arr.splice(1, 2, 10, 20, 30)
      expect(removed.toArray()).toEqual([2, 3])
      expect(arr.toArray()).toEqual([1, 10, 20, 30, 4])
    })

    it('handles negative start index', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(-3, 2)
      expect(removed.toArray()).toEqual([3, 4])
      expect(arr.toArray()).toEqual([1, 2, 5])
    })

    it('defaults deleteCount to rest of array', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5])
      const removed = arr.splice(2)
      expect(removed.toArray()).toEqual([3, 4, 5])
      expect(arr.toArray()).toEqual([1, 2])
    })

    it('clamps start index past end', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const removed = arr.splice(10, 1, 99)
      expect(removed.size()).toBe(0)
      expect(arr.toArray()).toEqual([1, 2, 3, 99])
    })

    it('splice on empty array inserts items', () => {
      const arr = new BlockedArray<number>()
      const removed = arr.splice(0, 0, 1, 2, 3)
      expect(removed.size()).toBe(0)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single element with block size 1', () => {
      const arr = new BlockedArray<number>(1)
      arr.push(42)
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBe(42)
      expect(arr.blockCount()).toBe(1)
    })

    it('handles many elements with block size 1', () => {
      const arr = new BlockedArray<number>(1)
      for (let i = 0; i < 5; i++) arr.push(i)
      expect(arr.size()).toBe(5)
      expect(arr.blockCount()).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(arr.get(i)).toBe(i)
      }
    })

    it('handles cross-block access with small block size', () => {
      const arr = new BlockedArray<number>(2)
      for (let i = 0; i < 10; i++) arr.push(i)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(1)).toBe(1)
      expect(arr.get(2)).toBe(2)
      expect(arr.get(9)).toBe(9)
    })

    it('handles large number of elements', () => {
      const arr = new BlockedArray<number>(64)
      for (let i = 0; i < 1000; i++) arr.push(i)
      expect(arr.size()).toBe(1000)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(500)).toBe(500)
      expect(arr.get(999)).toBe(999)
      expect(arr.blockCount()).toBe(Math.ceil(1000 / 64))
    })

    it('handles mixed push and pop operations', () => {
      const arr = new BlockedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.pop()
      arr.push(4)
      expect(arr.toArray()).toEqual([1, 2, 4])
    })

    it('handles object elements', () => {
      interface Item {
        id: number
        name: string
      }
      const arr = new BlockedArray<Item>(2)
      arr.push({ id: 1, name: 'a' })
      arr.push({ id: 2, name: 'b' })
      arr.push({ id: 3, name: 'c' })
      expect(arr.get(1).name).toBe('b')
      expect(arr.size()).toBe(3)
    })

    it('push and pop to zero then push again', () => {
      const arr = new BlockedArray<number>(2)
      arr.push(1)
      arr.push(2)
      arr.pop()
      arr.pop()
      expect(arr.size()).toBe(0)
      expect(arr.isEmpty()).toBe(true)
      arr.push(99)
      expect(arr.size()).toBe(1)
      expect(arr.get(0)).toBe(99)
    })

    it('shift and unshift interplay', () => {
      const arr = new BlockedArray<number>(4)
      arr.push(2)
      arr.push(3)
      arr.unshift(1)
      expect(arr.toArray()).toEqual([1, 2, 3])
      arr.shift()
      expect(arr.toArray()).toEqual([2, 3])
    })

    it('fill then verify with forEach', () => {
      const arr = BlockedArray.from([0, 0, 0, 0, 0])
      arr.fill(7, 1, 4)
      const values: number[] = []
      arr.forEach((v) => values.push(v))
      expect(values).toEqual([0, 7, 7, 7, 0])
    })

    it('map then reduce chain', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const result = arr.map((v) => v * 2).reduce((sum, v) => sum + v, 0)
      expect(result).toBe(12)
    })

    it('filter then toArray', () => {
      const arr = BlockedArray.from([1, 2, 3, 4, 5, 6])
      const evens = arr.filter((v) => v % 2 === 0)
      expect(evens.toArray()).toEqual([2, 4, 6])
    })

    it('from with large block size and small data', () => {
      const arr = BlockedArray.from([1, 2, 3], 1024)
      expect(arr.size()).toBe(3)
      expect(arr.blockCount()).toBe(1)
      expect(arr.blockSize()).toBe(1024)
    })

    it('splice removes all elements', () => {
      const arr = BlockedArray.from([1, 2, 3])
      const removed = arr.splice(0)
      expect(removed.toArray()).toEqual([1, 2, 3])
      expect(arr.size()).toBe(0)
    })

    it('concat preserves order', () => {
      const a = BlockedArray.from([1, 2, 3])
      const b = BlockedArray.from([4, 5, 6])
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('multiple operations maintain consistency', () => {
      const arr = new BlockedArray<number>(3)
      arr.push(1)
      arr.push(2)
      arr.push(3)
      arr.push(4)
      arr.push(5)
      arr.set(2, 99)
      arr.pop()
      const sliced = arr.slice(1, 4)
      expect(sliced.toArray()).toEqual([2, 99, 4])
      expect(arr.indexOf(99)).toBe(2)
      expect(arr.includes(99)).toBe(true)
      expect(arr.includes(5)).toBe(false)
    })
  })
})
