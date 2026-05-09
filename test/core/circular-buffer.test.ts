import { describe, it, expect, beforeEach } from 'vitest'
import { CircularBuffer } from '../../src/core/circular-buffer/circular-buffer.js'
import { DEFAULT_CIRCULAR_BUFFER_OPTIONS } from '../../src/core/circular-buffer/types.js'
import type { CircularBufferOptions } from '../../src/core/circular-buffer/types.js'

describe('CircularBuffer', () => {
  let cb: CircularBuffer<number>

  beforeEach(() => {
    cb = new CircularBuffer<number>({ capacity: 5, overwrite: false })
  })

  describe('constructor', () => {
    it('should create buffer with default options', () => {
      const buf = new CircularBuffer<number>()
      expect(buf.size()).toBe(0)
      expect(buf.isEmpty()).toBe(true)
      expect(buf.capacity()).toBe(8)
    })

    it('should accept custom capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 10 })
      expect(buf.capacity()).toBe(10)
    })

    it('should accept custom overwrite option', () => {
      const buf = new CircularBuffer<number>({ overwrite: false })
      expect(buf.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const buf = new CircularBuffer<number>({ capacity: 3 })
      expect(buf.capacity()).toBe(3)
    })

    it('should accept all options combined', () => {
      const buf = new CircularBuffer<number>({ capacity: 16, overwrite: false })
      expect(buf.capacity()).toBe(16)
    })
  })

  describe('write', () => {
    it('should add an item to the buffer', () => {
      cb.write(1)
      expect(cb.size()).toBe(1)
    })

    it('should return true on successful write', () => {
      expect(cb.write(1)).toBe(true)
    })

    it('should return false when buffer is full and overwrite is false', () => {
      for (let i = 0; i < 5; i++) cb.write(i)
      expect(cb.write(99)).toBe(false)
    })

    it('should overwrite oldest item when buffer is full and overwrite is true', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.read()).toBe(2)
      expect(buf.read()).toBe(3)
      expect(buf.read()).toBe(4)
    })

    it('should increment size after write', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      expect(cb.size()).toBe(3)
    })

    it('should not exceed capacity size without overwrite', () => {
      for (let i = 0; i < 10; i++) cb.write(i)
      expect(cb.size()).toBe(5)
    })
  })

  describe('read', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.read()).toBeUndefined()
    })

    it('should return the oldest item', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      expect(cb.read()).toBe(1)
    })

    it('should remove the item from the buffer', () => {
      cb.write(1)
      cb.read()
      expect(cb.size()).toBe(0)
    })

    it('should return items in FIFO order', () => {
      cb.write(10)
      cb.write(20)
      cb.write(30)
      expect(cb.read()).toBe(10)
      expect(cb.read()).toBe(20)
      expect(cb.read()).toBe(30)
    })

    it('should handle reading all items', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      expect(cb.read()).toBe(1)
      expect(cb.read()).toBe(2)
      expect(cb.read()).toBe(3)
      expect(cb.read()).toBeUndefined()
    })

    it('should handle reading from empty buffer multiple times', () => {
      expect(cb.read()).toBeUndefined()
      expect(cb.read()).toBeUndefined()
      expect(cb.read()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.peek()).toBeUndefined()
    })

    it('should return the oldest item without removing it', () => {
      cb.write(1)
      cb.write(2)
      expect(cb.peek()).toBe(1)
      expect(cb.size()).toBe(2)
    })

    it('should return the next item after a read', () => {
      cb.write(10)
      cb.write(20)
      cb.read()
      expect(cb.peek()).toBe(20)
    })

    it('should return undefined after all items are read', () => {
      cb.write(1)
      cb.read()
      expect(cb.peek()).toBeUndefined()
    })

    it('should handle peeking empty buffer multiple times', () => {
      expect(cb.peek()).toBeUndefined()
      expect(cb.peek()).toBeUndefined()
    })
  })

  describe('peekAt', () => {
    it('should return undefined for empty buffer', () => {
      expect(cb.peekAt(0)).toBeUndefined()
    })

    it('should return item at given index from head', () => {
      cb.write(10)
      cb.write(20)
      cb.write(30)
      expect(cb.peekAt(0)).toBe(10)
      expect(cb.peekAt(1)).toBe(20)
      expect(cb.peekAt(2)).toBe(30)
    })

    it('should return undefined for negative index', () => {
      cb.write(1)
      expect(cb.peekAt(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      cb.write(1)
      expect(cb.peekAt(1)).toBeUndefined()
    })

    it('should not modify the buffer', () => {
      cb.write(1)
      cb.write(2)
      cb.peekAt(1)
      expect(cb.size()).toBe(2)
    })

    it('should work after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.read()
      buf.write(4)
      expect(buf.peekAt(0)).toBe(2)
      expect(buf.peekAt(1)).toBe(3)
      expect(buf.peekAt(2)).toBe(4)
    })
  })

  describe('isFull', () => {
    it('should return false when not at capacity', () => {
      cb.write(1)
      expect(cb.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      for (let i = 0; i < 5; i++) cb.write(i)
      expect(cb.isFull()).toBe(true)
    })

    it('should return false after read from full buffer', () => {
      for (let i = 0; i < 5; i++) cb.write(i)
      cb.read()
      expect(cb.isFull()).toBe(false)
    })

    it('should return false for empty buffer', () => {
      expect(cb.isFull()).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new buffer', () => {
      expect(cb.isEmpty()).toBe(true)
    })

    it('should return false after write', () => {
      cb.write(1)
      expect(cb.isEmpty()).toBe(false)
    })

    it('should return true after reading all items', () => {
      cb.write(1)
      cb.read()
      expect(cb.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      cb.write(1)
      cb.clear()
      expect(cb.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty buffer', () => {
      expect(cb.size()).toBe(0)
    })

    it('should return correct size after writes', () => {
      cb.write(1)
      cb.write(2)
      expect(cb.size()).toBe(2)
    })

    it('should return correct size after reads', () => {
      cb.write(1)
      cb.write(2)
      cb.read()
      expect(cb.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      cb.write(1)
      cb.clear()
      expect(cb.size()).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return the configured capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 10 })
      expect(buf.capacity()).toBe(10)
    })

    it('should return default capacity', () => {
      const buf = new CircularBuffer<number>()
      expect(buf.capacity()).toBe(8)
    })
  })

  describe('available', () => {
    it('should return full capacity when empty', () => {
      expect(cb.available()).toBe(5)
    })

    it('should return remaining capacity after writes', () => {
      cb.write(1)
      cb.write(2)
      expect(cb.available()).toBe(3)
    })

    it('should return 0 when full', () => {
      for (let i = 0; i < 5; i++) cb.write(i)
      expect(cb.available()).toBe(0)
    })

    it('should increase after read', () => {
      for (let i = 0; i < 5; i++) cb.write(i)
      cb.read()
      expect(cb.available()).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.clear()
      expect(cb.size()).toBe(0)
    })

    it('should allow write after clear', () => {
      cb.write(1)
      cb.clear()
      cb.write(2)
      expect(cb.size()).toBe(1)
      expect(cb.peek()).toBe(2)
    })

    it('should handle clearing empty buffer', () => {
      cb.clear()
      expect(cb.size()).toBe(0)
    })

    it('should reset buffer state correctly', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.clear()
      expect(cb.toArray()).toEqual([])
      expect(cb.available()).toBe(5)
    })

    it('should reset head and tail pointers', () => {
      cb.write(1)
      cb.write(2)
      cb.read()
      cb.write(3)
      cb.clear()
      cb.write(10)
      cb.write(20)
      expect(cb.read()).toBe(10)
      expect(cb.read()).toBe(20)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      expect(cb.toArray()).toEqual([])
    })

    it('should return items in FIFO order', () => {
      cb.write(3)
      cb.write(1)
      cb.write(2)
      expect(cb.toArray()).toEqual([3, 1, 2])
    })

    it('should not modify the buffer', () => {
      cb.write(1)
      cb.write(2)
      cb.toArray()
      expect(cb.size()).toBe(2)
    })

    it('should handle wraparound correctly in toArray', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.read()
      buf.write(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('fromArray', () => {
    it('should populate buffer from array', () => {
      cb.fromArray([1, 2, 3])
      expect(cb.size()).toBe(3)
      expect(cb.read()).toBe(1)
      expect(cb.read()).toBe(2)
      expect(cb.read()).toBe(3)
    })

    it('should clear buffer before populating', () => {
      cb.write(99)
      cb.fromArray([1, 2])
      expect(cb.size()).toBe(2)
      expect(cb.read()).toBe(1)
    })

    it('should handle empty array', () => {
      cb.write(1)
      cb.fromArray([])
      expect(cb.size()).toBe(0)
      expect(cb.isEmpty()).toBe(true)
    })

    it('should handle array larger than capacity with overwrite', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.fromArray([1, 2, 3, 4, 5])
      expect(buf.size()).toBe(3)
      expect(buf.toArray()).toEqual([3, 4, 5])
    })

    it('should handle array larger than capacity without overwrite', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: false })
      buf.fromArray([1, 2, 3, 4, 5])
      expect(buf.size()).toBe(3)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('should reset pointers correctly after fromArray', () => {
      cb.fromArray([10, 20])
      expect(cb.peek()).toBe(10)
      expect(cb.peekAt(1)).toBe(20)
    })
  })

  describe('contains', () => {
    it('should return false for empty buffer', () => {
      expect(cb.contains(1)).toBe(false)
    })

    it('should return true if item exists', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      expect(cb.contains(2)).toBe(true)
    })

    it('should return false if item does not exist', () => {
      cb.write(1)
      cb.write(2)
      expect(cb.contains(99)).toBe(false)
    })

    it('should find item at head', () => {
      cb.write(42)
      expect(cb.contains(42)).toBe(true)
    })

    it('should find item at tail', () => {
      cb.write(1)
      cb.write(2)
      cb.write(99)
      expect(cb.contains(99)).toBe(true)
    })

    it('should work after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.contains(1)).toBe(false)
      expect(buf.contains(4)).toBe(true)
    })

    it('should use strict equality', () => {
      const buf = new CircularBuffer<string>()
      buf.write('hello')
      expect(buf.contains('hello')).toBe(true)
      expect(buf.contains('world')).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for empty buffer', () => {
      expect(cb.indexOf(1)).toBe(-1)
    })

    it('should return correct index for existing item', () => {
      cb.write(10)
      cb.write(20)
      cb.write(30)
      expect(cb.indexOf(10)).toBe(0)
      expect(cb.indexOf(20)).toBe(1)
      expect(cb.indexOf(30)).toBe(2)
    })

    it('should return -1 for non-existing item', () => {
      cb.write(1)
      cb.write(2)
      expect(cb.indexOf(99)).toBe(-1)
    })

    it('should return first occurrence for duplicates', () => {
      cb.write(1)
      cb.write(2)
      cb.write(1)
      expect(cb.indexOf(1)).toBe(0)
    })

    it('should work after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.indexOf(2)).toBe(0)
      expect(buf.indexOf(3)).toBe(1)
      expect(buf.indexOf(4)).toBe(2)
    })

    it('should not modify the buffer', () => {
      cb.write(1)
      cb.write(2)
      cb.indexOf(1)
      expect(cb.size()).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty buffer', () => {
      let count = 0
      cb.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all items in order', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      const items: number[] = []
      cb.forEach((item) => { items.push(item) })
      expect(items).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      cb.write(10)
      cb.write(20)
      cb.write(30)
      const indices: number[] = []
      cb.forEach((_item, index) => { indices.push(index) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not modify the buffer', () => {
      cb.write(1)
      cb.write(2)
      cb.forEach(() => {})
      expect(cb.size()).toBe(2)
    })

    it('should work after wraparound', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.read()
      buf.write(4)
      const items: number[] = []
      buf.forEach((item) => { items.push(item) })
      expect(items).toEqual([2, 3, 4])
    })
  })

  describe('rotateLeft', () => {
    it('should rotate buffer left by 1', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateLeft(1)
      expect(cb.toArray()).toEqual([2, 3, 1])
    })

    it('should rotate buffer left by 2', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.write(4)
      cb.rotateLeft(2)
      expect(cb.toArray()).toEqual([3, 4, 1, 2])
    })

    it('should handle rotation equal to size', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateLeft(3)
      expect(cb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle rotation greater than size', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateLeft(5)
      expect(cb.toArray()).toEqual([3, 1, 2])
    })

    it('should handle rotation of 0', () => {
      cb.write(1)
      cb.write(2)
      cb.rotateLeft(0)
      expect(cb.toArray()).toEqual([1, 2])
    })

    it('should handle empty buffer', () => {
      cb.rotateLeft(3)
      expect(cb.size()).toBe(0)
    })

    it('should preserve size after rotation', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateLeft(1)
      expect(cb.size()).toBe(3)
    })

    it('should allow read after rotation', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateLeft(1)
      expect(cb.read()).toBe(2)
      expect(cb.read()).toBe(3)
      expect(cb.read()).toBe(1)
    })
  })

  describe('rotateRight', () => {
    it('should rotate buffer right by 1', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateRight(1)
      expect(cb.toArray()).toEqual([3, 1, 2])
    })

    it('should rotate buffer right by 2', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.write(4)
      cb.rotateRight(2)
      expect(cb.toArray()).toEqual([3, 4, 1, 2])
    })

    it('should handle rotation equal to size', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateRight(3)
      expect(cb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle rotation greater than size', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateRight(5)
      expect(cb.toArray()).toEqual([2, 3, 1])
    })

    it('should handle rotation of 0', () => {
      cb.write(1)
      cb.write(2)
      cb.rotateRight(0)
      expect(cb.toArray()).toEqual([1, 2])
    })

    it('should handle empty buffer', () => {
      cb.rotateRight(3)
      expect(cb.size()).toBe(0)
    })

    it('should preserve size after rotation', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateRight(1)
      expect(cb.size()).toBe(3)
    })

    it('should allow read after rotation', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateRight(1)
      expect(cb.read()).toBe(3)
      expect(cb.read()).toBe(1)
      expect(cb.read()).toBe(2)
    })
  })

  describe('circular wraparound', () => {
    it('should wrap around correctly after multiple cycles', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.read()).toBe(1)
      buf.write(4)
      expect(buf.read()).toBe(2)
      expect(buf.read()).toBe(3)
      expect(buf.read()).toBe(4)
    })

    it('should handle alternating write and read', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: false })
      buf.write(1)
      expect(buf.read()).toBe(1)
      buf.write(2)
      expect(buf.read()).toBe(2)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should handle many wraparound cycles', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      for (let i = 0; i < 20; i++) {
        buf.write(i)
      }
      expect(buf.size()).toBe(3)
      expect(buf.read()).toBe(17)
      expect(buf.read()).toBe(18)
      expect(buf.read()).toBe(19)
    })
  })

  describe('overwrite mode', () => {
    it('should overwrite oldest when full', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('should not overwrite when overwrite is false', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: false })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.write(4)).toBe(false)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('should keep latest items after multiple overwrites', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      for (let i = 0; i < 10; i++) buf.write(i)
      expect(buf.toArray()).toEqual([7, 8, 9])
    })
  })

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const buf = new CircularBuffer<number>({ capacity: 1, overwrite: false })
      expect(buf.write(1)).toBe(true)
      expect(buf.write(2)).toBe(false)
      expect(buf.read()).toBe(1)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should handle capacity of 1 with overwrite', () => {
      const buf = new CircularBuffer<number>({ capacity: 1, overwrite: true })
      buf.write(1)
      buf.write(2)
      expect(buf.read()).toBe(2)
    })

    it('should handle single item write and read', () => {
      cb.write(42)
      expect(cb.read()).toBe(42)
      expect(cb.isEmpty()).toBe(true)
    })

    it('should handle object values', () => {
      const buf = new CircularBuffer<{ id: number }>()
      buf.write({ id: 1 })
      buf.write({ id: 2 })
      expect(buf.read()?.id).toBe(1)
      expect(buf.read()?.id).toBe(2)
    })

    it('should handle string values', () => {
      const buf = new CircularBuffer<string>()
      buf.write('hello')
      buf.write('world')
      expect(buf.read()).toBe('hello')
      expect(buf.read()).toBe('world')
    })

    it('should handle null values', () => {
      const buf = new CircularBuffer<number | null>()
      buf.write(null)
      buf.write(1)
      expect(buf.read()).toBeNull()
      expect(buf.read()).toBe(1)
    })

    it('should handle undefined values', () => {
      const buf = new CircularBuffer<number | undefined>()
      buf.write(undefined)
      buf.write(1)
      expect(buf.read()).toBeUndefined()
      expect(buf.size()).toBe(1)
    })

    it('should handle writing past capacity without overwrite', () => {
      for (let i = 0; i < 5; i++) cb.write(i)
      expect(cb.write(99)).toBe(false)
      expect(cb.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle write after multiple wraparound cycles', () => {
      const buf = new CircularBuffer<number>({ capacity: 2, overwrite: true })
      for (let i = 0; i < 10; i++) {
        buf.write(i)
      }
      expect(buf.size()).toBe(2)
      expect(buf.read()).toBe(8)
      expect(buf.read()).toBe(9)
    })

    it('should handle reading past available', () => {
      cb.write(1)
      cb.read()
      expect(cb.read()).toBeUndefined()
    })

    it('should handle overwriting oldest item', () => {
      const buf = new CircularBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.peek()).toBe(2)
    })

    it('should handle large capacity', () => {
      const buf = new CircularBuffer<number>({ capacity: 1000, overwrite: false })
      for (let i = 0; i < 1000; i++) buf.write(i)
      expect(buf.isFull()).toBe(true)
      expect(buf.size()).toBe(1000)
      expect(buf.peekAt(0)).toBe(0)
      expect(cb.peekAt(999)).toBeUndefined()
    })

    it('should handle rotateLeft then rotateRight returning to original', () => {
      cb.write(1)
      cb.write(2)
      cb.write(3)
      cb.rotateLeft(1)
      cb.rotateRight(1)
      expect(cb.toArray()).toEqual([1, 2, 3])
    })

    it('should handle fromArray after previous operations', () => {
      cb.write(1)
      cb.write(2)
      cb.read()
      cb.fromArray([10, 20, 30])
      expect(cb.toArray()).toEqual([10, 20, 30])
      expect(cb.size()).toBe(3)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_CIRCULAR_BUFFER_OPTIONS', () => {
      expect(DEFAULT_CIRCULAR_BUFFER_OPTIONS.capacity).toBe(8)
      expect(DEFAULT_CIRCULAR_BUFFER_OPTIONS.overwrite).toBe(true)
    })

    it('should re-export types from circular-buffer module', () => {
      const opts: CircularBufferOptions = {
        capacity: 10,
        overwrite: false,
      }
      expect(opts.capacity).toBe(10)
    })

    it('should support CircularBufferOptions with different fields', () => {
      const opts: CircularBufferOptions = {
        capacity: 32,
        overwrite: false,
      }
      expect(opts.overwrite).toBe(false)
    })

    it('should allow creating CircularBuffer with different types', () => {
      const numBuf = new CircularBuffer<number>()
      numBuf.write(42)
      expect(numBuf.read()).toBe(42)

      const strBuf = new CircularBuffer<string>()
      strBuf.write('test')
      expect(strBuf.read()).toBe('test')
    })
  })
})
