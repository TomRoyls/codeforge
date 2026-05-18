import { describe, it, expect } from 'vitest'
import { RingBuffer } from '../src/utils/ring-buffer.js'

// ─── Constructor ───

describe('RingBuffer', () => {
  it('creates with number capacity', () => {
    const rb = new RingBuffer<number>(5)
    expect(rb.capacity).toBe(5)
    expect(rb.size).toBe(0)
    expect(rb.isEmpty()).toBe(true)
  })

  it('creates with options object', () => {
    const rb = new RingBuffer<number>({ capacity: 10, allowOverwrite: false })
    expect(rb.capacity).toBe(10)
    expect(rb.isEmpty()).toBe(true)
  })

  it('throws RangeError for capacity < 1', () => {
    expect(() => new RingBuffer<number>(0)).toThrow(RangeError)
    expect(() => new RingBuffer<number>({ capacity: -1 })).toThrow(RangeError)
  })

  it('defaults allowOverwrite to true', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.push(4)).toBe(true)
  })

  // ─── push ───

  it('pushes values up to capacity', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.push(1)).toBe(true)
    expect(rb.push(2)).toBe(true)
    expect(rb.push(3)).toBe(true)
    expect(rb.size).toBe(3)
    expect(rb.isFull()).toBe(true)
  })

  it('overwrites oldest when full and allowOverwrite=true', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    expect(rb.toArray()).toEqual([2, 3, 4])
    expect(rb.size).toBe(3)
  })

  it('rejects push when full and allowOverwrite=false', () => {
    const rb = new RingBuffer<number>({ capacity: 2, allowOverwrite: false })
    rb.push(1)
    rb.push(2)
    expect(rb.push(3)).toBe(false)
    expect(rb.toArray()).toEqual([1, 2])
  })

  // ─── shift ───

  it('shifts values in FIFO order', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.shift()).toBe(1)
    expect(rb.shift()).toBe(2)
    expect(rb.shift()).toBe(3)
  })

  it('returns undefined when shifting empty', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.shift()).toBeUndefined()
  })

  it('allows push after shift', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.shift()
    rb.push(3)
    expect(rb.toArray()).toEqual([2, 3])
  })

  // ─── pop ───

  it('pops values in LIFO order', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.pop()).toBe(3)
    expect(rb.pop()).toBe(2)
  })

  it('returns undefined when popping empty', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.pop()).toBeUndefined()
  })

  // ─── get ───

  it('gets value by index', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(10)
    rb.push(20)
    rb.push(30)
    expect(rb.get(0)).toBe(10)
    expect(rb.get(1)).toBe(20)
    expect(rb.get(2)).toBe(30)
  })

  it('returns undefined for out of bounds index', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    expect(rb.get(-1)).toBeUndefined()
    expect(rb.get(1)).toBeUndefined()
  })

  it('get works correctly after wrap-around', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    rb.push(5)
    expect(rb.get(0)).toBe(3)
    expect(rb.get(1)).toBe(4)
    expect(rb.get(2)).toBe(5)
  })

  // ─── peek / peekLast ───

  it('peeks at front element', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    expect(rb.peek()).toBe(1)
    expect(rb.size).toBe(2)
  })

  it('peeks at last element', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    expect(rb.peekLast()).toBe(2)
  })

  it('returns undefined peek on empty', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.peek()).toBeUndefined()
    expect(rb.peekLast()).toBeUndefined()
  })

  // ─── size / isEmpty / isFull ───

  it('tracks size correctly', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.size).toBe(0)
    rb.push(1)
    expect(rb.size).toBe(1)
    rb.push(2)
    expect(rb.size).toBe(2)
    rb.shift()
    expect(rb.size).toBe(1)
  })

  it('isEmpty and isFull work', () => {
    const rb = new RingBuffer<number>(2)
    expect(rb.isEmpty()).toBe(true)
    expect(rb.isFull()).toBe(false)
    rb.push(1)
    expect(rb.isEmpty()).toBe(false)
    rb.push(2)
    expect(rb.isFull()).toBe(true)
  })

  // ─── clear ───

  it('clears all elements', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.clear()
    expect(rb.size).toBe(0)
    expect(rb.isEmpty()).toBe(true)
    expect(rb.toArray()).toEqual([])
  })

  it('allows push after clear', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.clear()
    rb.push(3)
    expect(rb.peek()).toBe(3)
    expect(rb.size).toBe(1)
  })

  // ─── toArray ───

  it('returns elements in order', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.toArray()).toEqual([1, 2, 3])
  })

  it('returns copy not reference', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    const arr = rb.toArray()
    arr.push(999)
    expect(rb.size).toBe(1)
  })

  // ─── forEach ───

  it('iterates all elements with index', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(10)
    rb.push(20)
    rb.push(30)
    const result: [number, number][] = []
    rb.forEach((v, i) => result.push([v, i]))
    expect(result).toEqual([[10, 0], [20, 1], [30, 2]])
  })

  it('forEach on empty does nothing', () => {
    const rb = new RingBuffer<number>(3)
    let count = 0
    rb.forEach(() => count++)
    expect(count).toBe(0)
  })

  // ─── Symbol.iterator ───

  it('supports for-of iteration', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    const result: number[] = []
    for (const v of rb) {
      result.push(v)
    }
    expect(result).toEqual([1, 2, 3])
  })

  it('spread operator works', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    expect([...rb]).toEqual([1, 2])
  })

  // ─── static fromArray ───

  it('creates from array with default capacity', () => {
    const rb = RingBuffer.fromArray([1, 2, 3])
    expect(rb.toArray()).toEqual([1, 2, 3])
    expect(rb.capacity).toBe(3)
  })

  it('creates from array with larger capacity', () => {
    const rb = RingBuffer.fromArray([1, 2], { capacity: 5 })
    expect(rb.toArray()).toEqual([1, 2])
    expect(rb.capacity).toBe(5)
  })

  it('creates from empty array', () => {
    const rb = RingBuffer.fromArray([], { capacity: 3 })
    expect(rb.isEmpty()).toBe(true)
  })

  // ─── Wrap-around behavior ───

  it('handles multiple wrap-arounds', () => {
    const rb = new RingBuffer<number>(3)
    for (let i = 0; i < 10; i++) {
      rb.push(i)
    }
    expect(rb.toArray()).toEqual([7, 8, 9])
    expect(rb.size).toBe(3)
  })

  it('interleaved push and shift', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.shift()
    rb.push(3)
    rb.shift()
    rb.push(4)
    expect(rb.toArray()).toEqual([3, 4])
    expect(rb.size).toBe(2)
  })

  // ─── capacity 1 ───

  it('works with capacity 1', () => {
    const rb = new RingBuffer<number>(1)
    rb.push(1)
    expect(rb.peek()).toBe(1)
    expect(rb.isFull()).toBe(true)
    rb.push(2)
    expect(rb.peek()).toBe(2)
    expect(rb.shift()).toBe(2)
    expect(rb.isEmpty()).toBe(true)
  })

  it('capacity 1 with no overwrite', () => {
    const rb = new RingBuffer<number>({ capacity: 1, allowOverwrite: false })
    rb.push(1)
    expect(rb.push(2)).toBe(false)
  })

  // ─── Edge cases ───

  it('handles mixed push/shift/pop', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.shift()
    rb.pop()
    rb.push(4)
    expect(rb.toArray()).toEqual([2, 4])
  })

  it('handles strings', () => {
    const rb = new RingBuffer<string>(3)
    rb.push('a')
    rb.push('b')
    rb.push('c')
    expect(rb.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('handles objects by reference', () => {
    const rb = new RingBuffer<{ id: number }>(3)
    const obj = { id: 1 }
    rb.push(obj)
    expect(rb.get(0)).toBe(obj)
  })

  it('handles undefined values', () => {
    const rb = new RingBuffer<number | undefined>(3)
    rb.push(undefined)
    rb.push(1)
    expect(rb.get(0)).toBeUndefined()
    expect(rb.get(1)).toBe(1)
    expect(rb.size).toBe(2)
  })

  it('clear resets head and tail', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    rb.clear()
    rb.push(10)
    rb.push(20)
    expect(rb.toArray()).toEqual([10, 20])
  })
})
