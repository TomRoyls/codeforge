import { describe, it, expect } from 'vitest'
import { BlockList, DEFAULT_BLOCK_SIZE } from '../src/core/block-list/block-list.js'

describe('BlockList', () => {
  describe('constructor', () => {
    it('creates with default block size', () => {
      const bl = new BlockList<number>()
      expect(bl.size).toBe(0)
      expect(bl.isEmpty()).toBe(true)
    })

    it('creates with custom block size', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.push(3)
      bl.push(4)
      bl.push(5)
      expect(bl.size).toBe(5)
      expect(bl.blockCount).toBeGreaterThanOrEqual(2)
    })

    it('creates with options object', () => {
      const bl = new BlockList<number>({ blockSize: 8 })
      expect(bl.size).toBe(0)
    })

    it('clamps block size to minimum 2', () => {
      const bl = new BlockList<number>(1)
      bl.push(1)
      bl.push(2)
      bl.push(3)
      expect(bl.size).toBe(3)
    })
  })

  describe('DEFAULT_BLOCK_SIZE', () => {
    it('is exported', () => {
      expect(DEFAULT_BLOCK_SIZE).toBe(32)
    })
  })

  describe('push', () => {
    it('adds elements', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.push(3)
      expect(bl.size).toBe(3)
      expect(bl.get(0)).toBe(1)
      expect(bl.get(2)).toBe(3)
    })

    it('triggers split when block exceeds blockSize', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) bl.push(i)
      expect(bl.size).toBe(10)
      expect(bl.blockCount).toBeGreaterThanOrEqual(3)
    })
  })

  describe('pop', () => {
    it('removes last element', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      expect(bl.pop()).toBe(2)
      expect(bl.size).toBe(1)
    })

    it('returns undefined on empty', () => {
      expect(new BlockList<number>().pop()).toBeUndefined()
    })

    it('maintains order', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 8; i++) bl.push(i)
      expect(bl.pop()).toBe(7)
      expect(bl.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
  })

  describe('unshift', () => {
    it('adds to front', () => {
      const bl = new BlockList<number>(4)
      bl.unshift(1)
      bl.unshift(2)
      expect(bl.get(0)).toBe(2)
      expect(bl.get(1)).toBe(1)
    })
  })

  describe('shift', () => {
    it('removes first element', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      expect(bl.shift()).toBe(1)
      expect(bl.get(0)).toBe(2)
    })

    it('returns undefined on empty', () => {
      expect(new BlockList<number>().shift()).toBeUndefined()
    })
  })

  describe('get', () => {
    it('returns value at index', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) bl.push(i)
      for (let i = 0; i < 10; i++) {
        expect(bl.get(i)).toBe(i)
      }
    })

    it('returns undefined for out of bounds', () => {
      const bl = new BlockList<number>()
      expect(bl.get(-1)).toBeUndefined()
      expect(bl.get(0)).toBeUndefined()
    })
  })

  describe('set', () => {
    it('updates value at index', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.set(0, 99)
      expect(bl.get(0)).toBe(99)
    })

    it('throws on out of bounds', () => {
      const bl = new BlockList<number>()
      expect(() => bl.set(0, 1)).toThrow(RangeError)
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const bl = new BlockList<number>(4)
      bl.push(2)
      bl.insert(0, 1)
      expect(bl.get(0)).toBe(1)
      expect(bl.get(1)).toBe(2)
    })

    it('inserts at end', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.insert(1, 2)
      expect(bl.toArray()).toEqual([1, 2])
    })

    it('inserts in middle', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(3)
      bl.insert(1, 2)
      expect(bl.toArray()).toEqual([1, 2, 3])
    })

    it('throws on out of bounds', () => {
      const bl = new BlockList<number>()
      expect(() => bl.insert(1, 1)).toThrow(RangeError)
    })
  })

  describe('remove', () => {
    it('removes at index', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.push(3)
      expect(bl.remove(1)).toBe(2)
      expect(bl.toArray()).toEqual([1, 3])
    })

    it('returns undefined for out of bounds', () => {
      expect(new BlockList<number>().remove(0)).toBeUndefined()
    })

    it('handles merge after remove', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) bl.push(i)
      bl.remove(5)
      expect(bl.size).toBe(9)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) bl.push(i)
      bl.clear()
      expect(bl.size).toBe(0)
      expect(bl.isEmpty()).toBe(true)
      expect(bl.blockCount).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns ordered array', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) bl.push(i)
      expect(bl.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('returns empty for empty list', () => {
      expect(new BlockList<number>().toArray()).toEqual([])
    })
  })

  describe('indexOf / includes', () => {
    it('finds index of value', () => {
      const bl = new BlockList<number>(4)
      bl.push(10)
      bl.push(20)
      bl.push(30)
      expect(bl.indexOf(20)).toBe(1)
      expect(bl.indexOf(99)).toBe(-1)
    })

    it('includes returns boolean', () => {
      const bl = new BlockList<number>(4)
      bl.push(10)
      expect(bl.includes(10)).toBe(true)
      expect(bl.includes(99)).toBe(false)
    })
  })

  describe('forEach', () => {
    it('iterates with correct indices', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) bl.push(i * 10)
      const pairs: [number, number][] = []
      bl.forEach((v, i) => pairs.push([v, i]))
      expect(pairs).toEqual([[0, 0], [10, 1], [20, 2], [30, 3], [40, 4]])
    })
  })

  describe('map', () => {
    it('transforms values', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.push(3)
      const mapped = bl.map((v) => v * 2)
      expect(mapped.toArray()).toEqual([2, 4, 6])
    })
  })

  describe('filter', () => {
    it('filters values', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 6; i++) bl.push(i)
      const filtered = bl.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([0, 2, 4])
    })
  })

  describe('slice', () => {
    it('returns sub-list', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) bl.push(i)
      const s = bl.slice(2, 5)
      expect(s.toArray()).toEqual([2, 3, 4])
    })

    it('handles negative indices', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) bl.push(i)
      expect(bl.slice(-2).toArray()).toEqual([3, 4])
    })
  })

  describe('concat', () => {
    it('combines two lists', () => {
      const a = new BlockList<number>(4)
      a.push(1)
      a.push(2)
      const b = new BlockList<number>(4)
      b.push(3)
      b.push(4)
      const c = a.concat(b)
      expect(c.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('reverse', () => {
    it('reverses the list', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) bl.push(i)
      const r = bl.reverse()
      expect(r.toArray()).toEqual([4, 3, 2, 1, 0])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const bl = new BlockList<number>(4)
      bl.push(10)
      bl.push(20)
      expect([...bl]).toEqual([10, 20])
    })
  })

  describe('edge cases', () => {
    it('handles push/pop cycle', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.pop()
      bl.push(3)
      expect(bl.toArray()).toEqual([1, 3])
    })

    it('handles many operations', () => {
      const bl = new BlockList<number>(4)
      for (let i = 0; i < 100; i++) bl.push(i)
      expect(bl.size).toBe(100)
      for (let i = 0; i < 50; i++) bl.pop()
      expect(bl.size).toBe(50)
      expect(bl.get(49)).toBe(49)
    })

    it('handles string elements', () => {
      const bl = new BlockList<string>(4)
      bl.push('a')
      bl.push('b')
      bl.push('c')
      expect(bl.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('blockCount increases with elements', () => {
      const bl = new BlockList<number>(4)
      expect(bl.blockCount).toBe(0)
      bl.push(1)
      expect(bl.blockCount).toBe(1)
      for (let i = 0; i < 10; i++) bl.push(i)
      expect(bl.blockCount).toBeGreaterThanOrEqual(3)
    })
  })
})
