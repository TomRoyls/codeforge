import { describe, expect, it } from 'vitest'

import { CircularBuffer } from '../../../src/utils/circular-buffer.js'

describe('CircularBuffer', () => {
  it('creates buffer with given capacity', () => {
    const buf = new CircularBuffer<number>(5)
    expect(buf.capacity).toBe(5)
    expect(buf.size).toBe(0)
    expect(buf.isEmpty()).toBe(true)
  })

  it('throws for capacity < 1', () => {
    expect(() => new CircularBuffer(0)).toThrow()
    expect(() => new CircularBuffer(-1)).toThrow()
  })

  it('writes and reads values', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.read()).toBe(1)
    expect(buf.read()).toBe(2)
    expect(buf.read()).toBe(3)
  })

  it('returns undefined when reading empty buffer', () => {
    const buf = new CircularBuffer<number>(3)
    expect(buf.read()).toBeUndefined()
  })

  it('overwrites oldest when full', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    const overwritten = buf.write(4)
    expect(overwritten).toBe(1)
    expect(buf.size).toBe(3)
    expect(buf.read()).toBe(2)
    expect(buf.read()).toBe(3)
    expect(buf.read()).toBe(4)
  })

  it('returns undefined overwritten when not full', () => {
    const buf = new CircularBuffer<number>(3)
    const overwritten = buf.write(1)
    expect(overwritten).toBeUndefined()
  })

  it('peeks at oldest value', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(10)
    buf.write(20)
    expect(buf.peek()).toBe(10)
    expect(buf.size).toBe(2)
  })

  it('peek returns undefined on empty buffer', () => {
    const buf = new CircularBuffer<number>(3)
    expect(buf.peek()).toBeUndefined()
  })

  it('peekNewest returns most recent value', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(10)
    buf.write(20)
    buf.write(30)
    expect(buf.peekNewest()).toBe(30)
  })

  it('isFull returns true when at capacity', () => {
    const buf = new CircularBuffer<number>(2)
    expect(buf.isFull()).toBe(false)
    buf.write(1)
    expect(buf.isFull()).toBe(false)
    buf.write(2)
    expect(buf.isFull()).toBe(true)
  })

  it('clear resets the buffer', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.clear()
    expect(buf.size).toBe(0)
    expect(buf.isEmpty()).toBe(true)
    expect(buf.peek()).toBeUndefined()
  })

  it('toArray returns values in FIFO order', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.toArray()).toEqual([1, 2, 3])
  })

  it('toArrayNewest returns values newest first', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.toArrayNewest()).toEqual([3, 2, 1])
  })

  it('handles wraparound correctly', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.write(4)
    buf.write(5)
    expect(buf.toArray()).toEqual([3, 4, 5])
    expect(buf.size).toBe(3)
  })

  it('handles write-read-write cycles', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.read()
    buf.write(3)
    buf.write(4)
    expect(buf.toArray()).toEqual([2, 3, 4])
  })

  it('maintains correct size after multiple overwrites', () => {
    const buf = new CircularBuffer<number>(2)
    for (let i = 0; i < 100; i++) {
      buf.write(i)
    }
    expect(buf.size).toBe(2)
    expect(buf.peek()).toBe(98)
    expect(buf.peekNewest()).toBe(99)
  })

  it('works with string values', () => {
    const buf = new CircularBuffer<string>(3)
    buf.write('a')
    buf.write('b')
    buf.write('c')
    expect(buf.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('works with object values', () => {
    const buf = new CircularBuffer<{ id: number }>(2)
    buf.write({ id: 1 })
    buf.write({ id: 2 })
    expect(buf.peek()!.id).toBe(1)
    expect(buf.peekNewest()!.id).toBe(2)
  })

  it('capacity of 1 works correctly', () => {
    const buf = new CircularBuffer<number>(1)
    buf.write(1)
    expect(buf.isFull()).toBe(true)
    const overwritten = buf.write(2)
    expect(overwritten).toBe(1)
    expect(buf.read()).toBe(2)
  })

  it('toArray on empty buffer returns empty array', () => {
    const buf = new CircularBuffer<number>(3)
    expect(buf.toArray()).toEqual([])
    expect(buf.toArrayNewest()).toEqual([])
  })
})
