import { describe, it, expect, beforeEach } from 'vitest'
import { ChunkedList2 } from '../../src/core/chunked-list-2/index.js'

describe('ChunkedList2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates list with default chunk size', () => {
      const list = new ChunkedList2<number>()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('creates list with custom chunk size', () => {
      const list = new ChunkedList2<number>(4)
      expect(list.size).toBe(0)
    })
  })

  // ─── push / pop ───
  describe('push and pop', () => {
    it('pushes and pops values', () => {
      const list = new ChunkedList2<number>(3)
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.size).toBe(3)
      expect(list.pop()).toBe(3)
      expect(list.pop()).toBe(2)
      expect(list.size).toBe(1)
    })

    it('pop returns undefined on empty list', () => {
      const list = new ChunkedList2<number>()
      expect(list.pop()).toBeUndefined()
    })

    it('handles multiple chunks', () => {
      const list = new ChunkedList2<number>(3)
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.push(5)
      expect(list.size).toBe(5)
      expect(list.get(3)).toBe(4)
      expect(list.get(4)).toBe(5)
    })

    it('pops across chunk boundaries', () => {
      const list = new ChunkedList2<number>(2)
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.pop()).toBe(3)
      expect(list.pop()).toBe(2)
      expect(list.pop()).toBe(1)
      expect(list.pop()).toBeUndefined()
    })
  })

  // ─── get / set ───
  describe('get and set', () => {
    let list: ChunkedList2<string>

    beforeEach(() => {
      list = new ChunkedList2<string>(3)
      list.push('a')
      list.push('b')
      list.push('c')
      list.push('d')
    })

    it('gets element at valid index', () => {
      expect(list.get(0)).toBe('a')
      expect(list.get(3)).toBe('d')
    })

    it('gets elements across chunk boundaries', () => {
      expect(list.get(2)).toBe('c')
      expect(list.get(3)).toBe('d')
    })

    it('returns undefined for out-of-bounds', () => {
      expect(list.get(4)).toBeUndefined()
      expect(list.get(-1)).toBeUndefined()
    })

    it('sets element at valid index', () => {
      list.set(1, 'x')
      expect(list.get(1)).toBe('x')
    })

    it('set does nothing for out-of-bounds', () => {
      list.set(10, 'z')
      list.set(-1, 'z')
      expect(list.size).toBe(4)
    })
  })

  // ─── size / isEmpty ───
  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const list = new ChunkedList2<number>()
      expect(list.size).toBe(0)
      list.push(1)
      expect(list.size).toBe(1)
      list.push(2)
      expect(list.size).toBe(2)
    })

    it('isEmpty is true for new list', () => {
      const list = new ChunkedList2<number>()
      expect(list.isEmpty()).toBe(true)
    })

    it('isEmpty is false after push', () => {
      const list = new ChunkedList2<number>()
      list.push(1)
      expect(list.isEmpty()).toBe(false)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('removes all elements', () => {
      const list = new ChunkedList2<number>(2)
      list.push(1)
      list.push(2)
      list.push(3)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('allows reuse after clear', () => {
      const list = new ChunkedList2<number>(2)
      list.push(1)
      list.clear()
      list.push(2)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(2)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('returns flat array of all elements', () => {
      const list = new ChunkedList2<number>(2)
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns empty array for empty list', () => {
      const list = new ChunkedList2<number>()
      expect(list.toArray()).toEqual([])
    })
  })

  // ─── forEach ───
  describe('forEach', () => {
    it('iterates all elements with correct indices', () => {
      const list = new ChunkedList2<string>(2)
      list.push('a')
      list.push('b')
      list.push('c')
      const collected: string[] = []
      list.forEach((v, i) => collected.push(`${i}:${v}`))
      expect(collected).toEqual(['0:a', '1:b', '2:c'])
    })

    it('does not iterate on empty list', () => {
      const list = new ChunkedList2<number>()
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  // ─── Chunk boundary edge cases ───
  describe('chunk boundary edge cases', () => {
    it('handles chunk size of 1', () => {
      const list = new ChunkedList2<number>(1)
      list.push(10)
      list.push(20)
      list.push(30)
      expect(list.toArray()).toEqual([10, 20, 30])
      expect(list.get(1)).toBe(20)
    })

    it('handles single element', () => {
      const list = new ChunkedList2<number>(4)
      list.push(42)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(42)
      expect(list.pop()).toBe(42)
      expect(list.size).toBe(0)
    })

    it('handles large number of elements', () => {
      const list = new ChunkedList2<number>(7)
      for (let i = 0; i < 100; i++) {
        list.push(i)
      }
      expect(list.size).toBe(100)
      expect(list.get(0)).toBe(0)
      expect(list.get(99)).toBe(99)
    })
  })
})
