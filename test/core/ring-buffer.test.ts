import { describe, it, expect, beforeEach } from 'vitest'
import { RingBuffer } from '../../src/core/ring-buffer/ring-buffer.js'
import { DEFAULT_RING_BUFFER_OPTIONS } from '../../src/core/ring-buffer/types.js'
import type { RingBufferOptions, RingBufferStats } from '../../src/core/ring-buffer/types.js'

describe('RingBuffer', () => {
  let rb: RingBuffer<number>

  beforeEach(() => {
    rb = new RingBuffer<number>({ capacity: 5, overwrite: false })
  })

  describe('constructor', () => {
    it('should create a ring buffer with default options', () => {
      const buf = new RingBuffer<number>()
      expect(buf.size()).toBe(0)
      expect(buf.isEmpty()).toBe(true)
      expect(buf.capacity()).toBe(64)
    })

    it('should accept custom capacity', () => {
      const buf = new RingBuffer<number>({ capacity: 10 })
      expect(buf.capacity()).toBe(10)
    })

    it('should accept custom overwrite option', () => {
      const buf = new RingBuffer<number>({ overwrite: false })
      expect(buf.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const buf = new RingBuffer<number>({ capacity: 3 })
      expect(buf.capacity()).toBe(3)
    })

    it('should accept all options combined', () => {
      const buf = new RingBuffer<number>({ capacity: 8, overwrite: false })
      expect(buf.capacity()).toBe(8)
    })
  })

  describe('write', () => {
    it('should add an item to the buffer', () => {
      rb.write(1)
      expect(rb.size()).toBe(1)
    })

    it('should return true on successful write', () => {
      expect(rb.write(1)).toBe(true)
    })

    it('should return false when buffer is full and overwrite is false', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      expect(rb.write(99)).toBe(false)
    })

    it('should overwrite oldest item when buffer is full and overwrite is true', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.read()).toBe(2)
      expect(buf.read()).toBe(3)
      expect(buf.read()).toBe(4)
    })

    it('should track totalWritten counter', () => {
      rb.write(1)
      rb.write(2)
      expect(rb.getStats().totalWritten).toBe(2)
    })

    it('should not track failed write in totalWritten', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      rb.write(99)
      expect(rb.getStats().totalWritten).toBe(5)
    })
  })

  describe('read', () => {
    it('should return undefined for empty buffer', () => {
      expect(rb.read()).toBeUndefined()
    })

    it('should return the oldest item', () => {
      rb.write(1)
      rb.write(2)
      rb.write(3)
      expect(rb.read()).toBe(1)
    })

    it('should remove the item from the buffer', () => {
      rb.write(1)
      rb.read()
      expect(rb.size()).toBe(0)
    })

    it('should return items in FIFO order', () => {
      rb.write(10)
      rb.write(20)
      rb.write(30)
      expect(rb.read()).toBe(10)
      expect(rb.read()).toBe(20)
      expect(rb.read()).toBe(30)
    })

    it('should track totalRead counter', () => {
      rb.write(1)
      rb.write(2)
      rb.read()
      expect(rb.getStats().totalRead).toBe(1)
    })

    it('should not track failed read in totalRead', () => {
      rb.read()
      expect(rb.getStats().totalRead).toBe(0)
    })
  })

  describe('circular wraparound', () => {
    it('should wrap around correctly after multiple cycles', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
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
      const buf = new RingBuffer<number>({ capacity: 2, overwrite: false })
      buf.write(1)
      expect(buf.read()).toBe(1)
      buf.write(2)
      expect(buf.read()).toBe(2)
      expect(rb.isEmpty()).toBe(true)
    })

    it('should handle many wraparound cycles', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
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
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('should track overwrite count', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      buf.write(5)
      expect(buf.getStats().overwriteCount).toBe(2)
    })

    it('should not overwrite when overwrite is false', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: false })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.write(4)).toBe(false)
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('should have zero overwriteCount when overwrite is disabled', () => {
      const buf = new RingBuffer<number>({ capacity: 2, overwrite: false })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.getStats().overwriteCount).toBe(0)
    })
  })

  describe('peek', () => {
    it('should return undefined for empty buffer', () => {
      expect(rb.peek()).toBeUndefined()
    })

    it('should return the oldest item without removing it', () => {
      rb.write(1)
      rb.write(2)
      expect(rb.peek()).toBe(1)
      expect(rb.size()).toBe(2)
    })

    it('should return the next item after a read', () => {
      rb.write(10)
      rb.write(20)
      rb.read()
      expect(rb.peek()).toBe(20)
    })

    it('should return undefined after all items are read', () => {
      rb.write(1)
      rb.read()
      expect(rb.peek()).toBeUndefined()
    })
  })

  describe('peekAt', () => {
    it('should return undefined for empty buffer', () => {
      expect(rb.peekAt(0)).toBeUndefined()
    })

    it('should return item at given index from head', () => {
      rb.write(10)
      rb.write(20)
      rb.write(30)
      expect(rb.peekAt(0)).toBe(10)
      expect(rb.peekAt(1)).toBe(20)
      expect(rb.peekAt(2)).toBe(30)
    })

    it('should return undefined for negative index', () => {
      rb.write(1)
      expect(rb.peekAt(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      rb.write(1)
      expect(rb.peekAt(1)).toBeUndefined()
    })

    it('should not modify the buffer', () => {
      rb.write(1)
      rb.write(2)
      rb.peekAt(1)
      expect(rb.size()).toBe(2)
    })

    it('should work after wraparound', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
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

  describe('writeMany', () => {
    it('should write multiple items', () => {
      rb.writeMany([1, 2, 3])
      expect(rb.size()).toBe(3)
    })

    it('should return the number of items written', () => {
      expect(rb.writeMany([1, 2, 3])).toBe(3)
    })

    it('should write fewer items when buffer is almost full', () => {
      rb.write(0)
      const written = rb.writeMany([1, 2, 3, 4, 5])
      expect(written).toBe(4)
      expect(rb.size()).toBe(5)
    })

    it('should return 0 for empty array', () => {
      expect(rb.writeMany([])).toBe(0)
    })

    it('should write 0 items when buffer is full and overwrite is false', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      expect(rb.writeMany([10, 20])).toBe(0)
    })

    it('should write all items with overwrite enabled', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      expect(buf.writeMany([3, 4, 5])).toBe(3)
      expect(buf.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('readMany', () => {
    it('should return empty array for empty buffer', () => {
      expect(rb.readMany(5)).toEqual([])
    })

    it('should return the requested number of items', () => {
      rb.writeMany([1, 2, 3])
      expect(rb.readMany(2)).toEqual([1, 2])
    })

    it('should return fewer items if count exceeds available', () => {
      rb.writeMany([1, 2])
      expect(rb.readMany(5)).toEqual([1, 2])
    })

    it('should remove items from buffer', () => {
      rb.writeMany([1, 2, 3])
      rb.readMany(2)
      expect(rb.size()).toBe(1)
    })

    it('should return empty array for count 0', () => {
      rb.write(1)
      expect(rb.readMany(0)).toEqual([])
    })

    it('should read all items', () => {
      rb.writeMany([10, 20, 30])
      expect(rb.readMany(3)).toEqual([10, 20, 30])
      expect(rb.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty buffer', () => {
      expect(rb.size()).toBe(0)
    })

    it('should return correct size after writes', () => {
      rb.write(1)
      rb.write(2)
      expect(rb.size()).toBe(2)
    })

    it('should return correct size after reads', () => {
      rb.write(1)
      rb.write(2)
      rb.read()
      expect(rb.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      rb.write(1)
      rb.clear()
      expect(rb.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new buffer', () => {
      expect(rb.isEmpty()).toBe(true)
    })

    it('should return false after write', () => {
      rb.write(1)
      expect(rb.isEmpty()).toBe(false)
    })

    it('should return true after reading all items', () => {
      rb.write(1)
      rb.read()
      expect(rb.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      rb.write(1)
      rb.clear()
      expect(rb.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should return false when not at capacity', () => {
      rb.write(1)
      expect(rb.isFull()).toBe(false)
    })

    it('should return true when at capacity', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      expect(rb.isFull()).toBe(true)
    })

    it('should return false after read from full buffer', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      rb.read()
      expect(rb.isFull()).toBe(false)
    })

    it('should return false for empty buffer', () => {
      expect(rb.isFull()).toBe(false)
    })
  })

  describe('capacity', () => {
    it('should return the configured capacity', () => {
      const buf = new RingBuffer<number>({ capacity: 10 })
      expect(buf.capacity()).toBe(10)
    })

    it('should return default capacity', () => {
      const buf = new RingBuffer<number>()
      expect(buf.capacity()).toBe(64)
    })
  })

  describe('available', () => {
    it('should return full capacity when empty', () => {
      expect(rb.available()).toBe(5)
    })

    it('should return remaining capacity after writes', () => {
      rb.write(1)
      rb.write(2)
      expect(rb.available()).toBe(3)
    })

    it('should return 0 when full', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      expect(rb.available()).toBe(0)
    })

    it('should increase after read', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      rb.read()
      expect(rb.available()).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      rb.writeMany([1, 2, 3])
      rb.clear()
      expect(rb.size()).toBe(0)
    })

    it('should allow write after clear', () => {
      rb.write(1)
      rb.clear()
      rb.write(2)
      expect(rb.size()).toBe(1)
      expect(rb.peek()).toBe(2)
    })

    it('should handle clearing empty buffer', () => {
      rb.clear()
      expect(rb.size()).toBe(0)
    })

    it('should reset buffer state correctly', () => {
      rb.writeMany([1, 2, 3])
      rb.clear()
      expect(rb.toArray()).toEqual([])
      expect(rb.available()).toBe(5)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      expect(rb.toArray()).toEqual([])
    })

    it('should return items in FIFO order', () => {
      rb.writeMany([3, 1, 2])
      expect(rb.toArray()).toEqual([3, 1, 2])
    })

    it('should not modify the buffer', () => {
      rb.writeMany([1, 2])
      rb.toArray()
      expect(rb.size()).toBe(2)
    })

    it('should handle wraparound correctly in toArray', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.read()
      buf.write(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty buffer', () => {
      const stats = rb.getStats()
      expect(stats.capacity).toBe(5)
      expect(stats.size).toBe(0)
      expect(stats.isEmpty).toBe(true)
      expect(stats.isFull).toBe(false)
      expect(stats.totalWritten).toBe(0)
      expect(stats.totalRead).toBe(0)
      expect(stats.overwriteCount).toBe(0)
    })

    it('should track totalWritten', () => {
      rb.write(1)
      rb.write(2)
      expect(rb.getStats().totalWritten).toBe(2)
    })

    it('should track totalRead', () => {
      rb.write(1)
      rb.write(2)
      rb.read()
      expect(rb.getStats().totalRead).toBe(1)
    })

    it('should track overwriteCount', () => {
      const buf = new RingBuffer<number>({ capacity: 2, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      expect(buf.getStats().overwriteCount).toBe(1)
    })

    it('should reflect current size', () => {
      rb.write(1)
      rb.write(2)
      rb.read()
      expect(rb.getStats().size).toBe(1)
    })

    it('should reflect isEmpty and isFull', () => {
      rb.write(1)
      const stats = rb.getStats()
      expect(stats.isEmpty).toBe(false)
      expect(stats.isFull).toBe(false)
    })

    it('should reflect custom capacity', () => {
      const buf = new RingBuffer<number>({ capacity: 10 })
      expect(buf.getStats().capacity).toBe(10)
    })

    it('should persist stats across clear', () => {
      rb.write(1)
      rb.write(2)
      rb.clear()
      const stats = rb.getStats()
      expect(stats.totalWritten).toBe(2)
      expect(stats.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle capacity of 1', () => {
      const buf = new RingBuffer<number>({ capacity: 1, overwrite: false })
      expect(buf.write(1)).toBe(true)
      expect(buf.write(2)).toBe(false)
      expect(buf.read()).toBe(1)
      expect(buf.isEmpty()).toBe(true)
    })

    it('should handle capacity of 1 with overwrite', () => {
      const buf = new RingBuffer<number>({ capacity: 1, overwrite: true })
      buf.write(1)
      buf.write(2)
      expect(buf.read()).toBe(2)
    })

    it('should handle single item write and read', () => {
      rb.write(42)
      expect(rb.read()).toBe(42)
      expect(rb.isEmpty()).toBe(true)
    })

    it('should handle reading from empty buffer multiple times', () => {
      expect(rb.read()).toBeUndefined()
      expect(rb.read()).toBeUndefined()
      expect(rb.read()).toBeUndefined()
    })

    it('should handle peeking empty buffer multiple times', () => {
      expect(rb.peek()).toBeUndefined()
      expect(rb.peek()).toBeUndefined()
    })

    it('should handle writing past capacity without overwrite', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      expect(rb.write(99)).toBe(false)
      expect(rb.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle reading all items', () => {
      rb.writeMany([1, 2, 3])
      expect(rb.read()).toBe(1)
      expect(rb.read()).toBe(2)
      expect(rb.read()).toBe(3)
      expect(rb.read()).toBeUndefined()
    })

    it('should handle overwriting oldest item', () => {
      const buf = new RingBuffer<number>({ capacity: 3, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      expect(buf.peek()).toBe(2)
    })

    it('should handle object values', () => {
      const buf = new RingBuffer<{ id: number }>()
      buf.write({ id: 1 })
      buf.write({ id: 2 })
      expect(buf.read()?.id).toBe(1)
      expect(buf.read()?.id).toBe(2)
    })

    it('should handle null values', () => {
      const buf = new RingBuffer<number | null>()
      buf.write(null)
      buf.write(1)
      expect(buf.read()).toBeNull()
      expect(buf.read()).toBe(1)
    })

    it('should handle undefined values', () => {
      const buf = new RingBuffer<number | undefined>()
      buf.write(undefined)
      buf.write(1)
      expect(buf.read()).toBeUndefined()
      expect(buf.size()).toBe(1)
    })

    it('should handle reading past available', () => {
      rb.write(1)
      rb.read()
      expect(rb.read()).toBeUndefined()
    })

    it('should handle string values', () => {
      const buf = new RingBuffer<string>()
      buf.write('hello')
      buf.write('world')
      expect(buf.read()).toBe('hello')
      expect(buf.read()).toBe('world')
    })

    it('should handle write after multiple wraparound cycles', () => {
      const buf = new RingBuffer<number>({ capacity: 2, overwrite: true })
      for (let i = 0; i < 10; i++) {
        buf.write(i)
      }
      expect(buf.size()).toBe(2)
      expect(buf.read()).toBe(8)
      expect(buf.read()).toBe(9)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_RING_BUFFER_OPTIONS', () => {
      expect(DEFAULT_RING_BUFFER_OPTIONS.capacity).toBe(64)
      expect(DEFAULT_RING_BUFFER_OPTIONS.overwrite).toBe(true)
    })

    it('should re-export types from ring-buffer module', () => {
      const opts: RingBufferOptions = {
        capacity: 10,
        overwrite: false,
      }
      expect(opts.capacity).toBe(10)

      const stats: RingBufferStats = {
        capacity: 10,
        size: 0,
        isEmpty: true,
        isFull: false,
        totalWritten: 0,
        totalRead: 0,
        overwriteCount: 0,
      }
      expect(stats.capacity).toBe(10)
    })

    it('should support RingBufferOptions with partial fields', () => {
      const opts: RingBufferOptions = {
        capacity: 32,
        overwrite: false,
      }
      expect(opts.overwrite).toBe(false)
    })

    it('should allow creating RingBuffer with different types', () => {
      const numBuf = new RingBuffer<number>()
      numBuf.write(42)
      expect(numBuf.read()).toBe(42)

      const strBuf = new RingBuffer<string>()
      strBuf.write('test')
      expect(strBuf.read()).toBe('test')
    })
  })

  describe('statistics tracking', () => {
    it('should track multiple operations in stats', () => {
      rb.write(1)
      rb.write(2)
      rb.read()
      rb.peek()
      const stats = rb.getStats()
      expect(stats.totalWritten).toBe(2)
      expect(stats.totalRead).toBe(1)
      expect(stats.size).toBe(1)
    })

    it('should track overwrite stats', () => {
      const buf = new RingBuffer<number>({ capacity: 2, overwrite: true })
      buf.write(1)
      buf.write(2)
      buf.write(3)
      buf.write(4)
      const stats = buf.getStats()
      expect(stats.overwriteCount).toBe(2)
      expect(stats.totalWritten).toBe(4)
    })

    it('should track readMany in stats', () => {
      rb.writeMany([1, 2, 3])
      rb.readMany(2)
      expect(rb.getStats().totalRead).toBe(2)
    })

    it('should track writeMany in stats', () => {
      rb.writeMany([1, 2, 3])
      expect(rb.getStats().totalWritten).toBe(3)
    })

    it('should persist stats across clear', () => {
      rb.write(1)
      rb.write(2)
      rb.read()
      rb.clear()
      const stats = rb.getStats()
      expect(stats.totalWritten).toBe(2)
      expect(stats.totalRead).toBe(1)
      expect(stats.size).toBe(0)
    })

    it('should track stats for failed write', () => {
      for (let i = 0; i < 5; i++) rb.write(i)
      rb.write(99)
      expect(rb.getStats().totalWritten).toBe(5)
    })
  })
})
