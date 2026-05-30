import { describe, it, expect } from 'vitest'
import { GapBuffer } from '../../../src/utils/gap-buffer.js'

describe('GapBuffer', () => {
  describe('construction', () => {
    it('creates with default capacity', () => {
      const gb = new GapBuffer<string>()
      expect(gb.length).toBe(0)
      expect(gb.capacity).toBe(32)
      expect(gb.gapSize).toBe(32)
    })

    it('creates with custom capacity', () => {
      const gb = new GapBuffer<number>(8)
      expect(gb.capacity).toBe(8)
      expect(gb.gapSize).toBe(8)
    })
  })

  describe('insert', () => {
    it('appends items', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      gb.insert(3)
      expect(gb.length).toBe(3)
      expect(gb.toArray()).toEqual([1, 2, 3])
    })

    it('grows when capacity exceeded', () => {
      const gb = new GapBuffer<number>(2)
      gb.insert(1)
      gb.insert(2)
      gb.insert(3)
      expect(gb.length).toBe(3)
      expect(gb.toArray()).toEqual([1, 2, 3])
      expect(gb.capacity).toBeGreaterThanOrEqual(4)
    })

    it('insertAt beginning', () => {
      const gb = new GapBuffer<number>()
      gb.insert(2)
      gb.insert(3)
      gb.insertAt(0, 1)
      expect(gb.toArray()).toEqual([1, 2, 3])
    })

    it('insertAt middle', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(3)
      gb.insertAt(1, 2)
      expect(gb.toArray()).toEqual([1, 2, 3])
    })

    it('insertAt end', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      gb.insertAt(2, 3)
      expect(gb.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('delete', () => {
    it('deletes last inserted item', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      expect(gb.delete()).toBe(2)
      expect(gb.length).toBe(1)
    })

    it('returns undefined when empty', () => {
      const gb = new GapBuffer<number>()
      expect(gb.delete()).toBeUndefined()
    })

    it('deleteAt specific position', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      gb.insert(3)
      expect(gb.deleteAt(1)).toBe(2)
      expect(gb.toArray()).toEqual([1, 3])
    })

    it('deleteAt beginning', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      expect(gb.deleteAt(0)).toBe(1)
      expect(gb.toArray()).toEqual([2])
    })
  })

  describe('get and set', () => {
    it('gets items by index', () => {
      const gb = new GapBuffer<string>()
      gb.insert('a')
      gb.insert('b')
      gb.insert('c')
      expect(gb.get(0)).toBe('a')
      expect(gb.get(1)).toBe('b')
      expect(gb.get(2)).toBe('c')
    })

    it('returns undefined for out of bounds', () => {
      const gb = new GapBuffer<number>()
      expect(gb.get(-1)).toBeUndefined()
      expect(gb.get(0)).toBeUndefined()
    })

    it('sets items by index', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      gb.insert(3)
      expect(gb.set(1, 99)).toBe(true)
      expect(gb.get(1)).toBe(99)
    })

    it('set returns false for out of bounds', () => {
      const gb = new GapBuffer<number>()
      expect(gb.set(0, 1)).toBe(false)
    })
  })

  describe('cursor', () => {
    it('tracks cursor position', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      expect(gb.cursor()).toBe(2)
    })

    it('moves cursor', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.insert(2)
      gb.insert(3)
      gb.moveCursor(1)
      expect(gb.cursor()).toBe(1)
      gb.insert(99)
      expect(gb.toArray()).toEqual([1, 99, 2, 3])
    })

    it('clamps cursor position', () => {
      const gb = new GapBuffer<number>()
      gb.insert(1)
      gb.moveCursor(100)
      expect(gb.cursor()).toBe(1)
      gb.moveCursor(-5)
      expect(gb.cursor()).toBe(0)
    })
  })

  describe('text editing simulation', () => {
    it('simulates inserting characters into text', () => {
      const gb = new GapBuffer<string>()
      for (const ch of 'hello') gb.insert(ch)
      expect(gb.toArray().join('')).toBe('hello')
      gb.moveCursor(5)
      for (const ch of ' world') gb.insert(ch)
      expect(gb.toArray().join('')).toBe('hello world')
    })

    it('simulates backspace deletion', () => {
      const gb = new GapBuffer<string>()
      for (const ch of 'hello') gb.insert(ch)
      gb.moveCursor(4)
      gb.delete()
      expect(gb.toArray().join('')).toBe('helo')
    })

    it('complex edit sequence', () => {
      const gb = new GapBuffer<string>()
      for (const ch of 'acd') gb.insert(ch)
      gb.moveCursor(1)
      for (const ch of 'b') gb.insert(ch)
      expect(gb.toArray().join('')).toBe('abcd')
    })
  })

  describe('stress', () => {
    it('handles many insertions and deletions', () => {
      const gb = new GapBuffer<number>(4)
      for (let i = 0; i < 100; i++) {
        gb.insert(i)
      }
      expect(gb.length).toBe(100)
      expect(gb.get(0)).toBe(0)
      expect(gb.get(99)).toBe(99)
      for (let i = 0; i < 50; i++) {
        gb.delete()
      }
      expect(gb.length).toBe(50)
    })
  })
})
