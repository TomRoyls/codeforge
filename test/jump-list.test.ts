import { JumpList } from '../src/core/jump-list/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('JumpList', () => {
  describe('constructor', () => {
    it('creates an empty list', () => {
      const list = new JumpList<number>()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('accepts custom block size', () => {
      const list = new JumpList<number>({ blockSize: 4 })
      expect(list.size).toBe(0)
    })
  })

  // ─── Push / Pop ─────────────────────────────────────────────────────────

  describe('push and pop', () => {
    it('pushes values to end', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('pops values from end', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      expect(list.pop()).toBe(2)
      expect(list.pop()).toBe(1)
      expect(list.pop()).toBe(undefined)
    })
  })

  // ─── Unshift / Shift ────────────────────────────────────────────────────

  describe('unshift and shift', () => {
    it('unshifts values to front', () => {
      const list = new JumpList<number>()
      list.unshift(3)
      list.unshift(2)
      list.unshift(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('shifts values from front', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      expect(list.shift()).toBe(1)
      expect(list.shift()).toBe(2)
      expect(list.shift()).toBe(undefined)
    })
  })

  // ─── Get / Set ──────────────────────────────────────────────────────────

  describe('get and set', () => {
    it('gets value at index', () => {
      const list = new JumpList<number>()
      list.push(10)
      list.push(20)
      list.push(30)
      expect(list.get(0)).toBe(10)
      expect(list.get(1)).toBe(20)
      expect(list.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds', () => {
      const list = new JumpList<number>()
      list.push(1)
      expect(list.get(-1)).toBe(undefined)
      expect(list.get(5)).toBe(undefined)
    })

    it('sets value at index', () => {
      const list = new JumpList<number>()
      list.push(10)
      list.push(20)
      expect(list.set(1, 99)).toBe(true)
      expect(list.get(1)).toBe(99)
    })

    it('set returns false for invalid index', () => {
      const list = new JumpList<number>()
      expect(list.set(0, 1)).toBe(false)
      expect(list.set(-1, 1)).toBe(false)
    })
  })

  // ─── Insert / Delete ────────────────────────────────────────────────────

  describe('insert and delete', () => {
    it('inserts at beginning', () => {
      const list = new JumpList<number>()
      list.push(2)
      list.push(3)
      expect(list.insert(0, 1)).toBe(true)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      expect(list.insert(2, 3)).toBe(true)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in middle', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(3)
      expect(list.insert(1, 2)).toBe(true)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('delete removes at index and returns value', () => {
      const list = new JumpList<number>()
      list.push(10)
      list.push(20)
      list.push(30)
      expect(list.delete(1)).toBe(20)
      expect(list.toArray()).toEqual([10, 30])
    })

    it('delete at boundaries', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.delete(0)).toBe(1)
      expect(list.delete(1)).toBe(3)
    })

    it('returns undefined for invalid delete', () => {
      const list = new JumpList<number>()
      expect(list.delete(0)).toBe(undefined)
      expect(list.delete(-1)).toBe(undefined)
    })
  })

  // ─── IndexOf / Includes ─────────────────────────────────────────────────

  describe('indexOf and includes', () => {
    it('indexOf finds element', () => {
      const list = new JumpList<string>()
      list.push('a')
      list.push('b')
      list.push('c')
      expect(list.indexOf('b')).toBe(1)
      expect(list.indexOf('z')).toBe(-1)
    })

    it('includes checks membership', () => {
      const list = new JumpList<number>()
      list.push(42)
      expect(list.includes(42)).toBe(true)
      expect(list.includes(99)).toBe(false)
    })
  })

  // ─── Utility Methods ────────────────────────────────────────────────────

  describe('utility methods', () => {
    it('clear empties the list', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty).toBe(true)
    })

    it('forEach iterates all elements', () => {
      const list = new JumpList<number>()
      list.push(10)
      list.push(20)
      const collected: number[] = []
      list.forEach((v, i) => collected.push(v + i))
      expect(collected).toEqual([10, 21])
    })

    it('map transforms elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      const mapped = list.map((v) => v * 10)
      expect(mapped).toEqual([10, 20])
    })

    it('filter selects elements', () => {
      const list = new JumpList<number>()
      list.push(1)
      list.push(2)
      list.push(3)
      const filtered = list.filter((v) => v > 1)
      expect(filtered).toEqual([2, 3])
    })

    it('Symbol.iterator works', () => {
      const list = new JumpList<number>()
      list.push(10)
      list.push(20)
      expect([...list]).toEqual([10, 20])
    })
  })

  // ─── Jump Pointers with Large Lists ─────────────────────────────────────

  describe('jump pointers with large lists', () => {
    it('handles many elements efficiently', () => {
      const list = new JumpList<number>({ blockSize: 1000 })
      for (let i = 0; i < 100; i++) {
        list.push(i)
      }
      expect(list.size).toBe(100)
      expect(list.get(50)).toBe(50)
      expect(list.get(0)).toBe(0)
      expect(list.get(99)).toBe(99)
    })
  })
})
