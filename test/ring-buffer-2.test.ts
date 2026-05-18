import { describe, it, expect } from 'vitest'
import { RingBuffer } from '../src/core/ring-buffer-2/index.js'

// ─── Constructor ───
describe('RingBuffer constructor', () => {
  it('creates buffer with number capacity', () => {
    const rb = new RingBuffer<number>(5)
    expect(rb.capacity).toBe(5)
    expect(rb.size).toBe(0)
    expect(rb.isEmpty).toBe(true)
  })

  it('creates buffer with options object', () => {
    const rb = new RingBuffer<number>({ capacity: 3 })
    expect(rb.capacity).toBe(3)
  })

  it('throws on zero capacity', () => {
    expect(() => new RingBuffer(0)).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new RingBuffer(-1)).toThrow(RangeError)
  })

  it('throws on non-integer capacity', () => {
    expect(() => new RingBuffer(1.5)).toThrow(RangeError)
  })
})

// ─── Push / Pop ───
describe('RingBuffer push and pop', () => {
  it('pushes and retrieves elements', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.size).toBe(3)
    expect(rb.toArray()).toEqual([1, 2, 3])
  })

  it('overwrites oldest when full', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    expect(rb.toArray()).toEqual([2, 3, 4])
    expect(rb.size).toBe(3)
  })

  it('pops from back', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(10)
    rb.push(20)
    expect(rb.pop()).toBe(20)
    expect(rb.size).toBe(1)
  })

  it('throws when popping from empty buffer', () => {
    const rb = new RingBuffer<number>(3)
    expect(() => rb.pop()).toThrow(RangeError)
  })
})

// ─── Shift / Unshift ───
describe('RingBuffer shift and unshift', () => {
  it('shifts from front', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.shift()).toBe(1)
    expect(rb.toArray()).toEqual([2, 3])
  })

  it('throws when shifting from empty buffer', () => {
    const rb = new RingBuffer<number>(3)
    expect(() => rb.shift()).toThrow(RangeError)
  })

  it('unshifts to front', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(2)
    rb.push(3)
    rb.unshift(1)
    expect(rb.toArray()).toEqual([1, 2, 3])
  })

  it('unshift overwrites when full', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.unshift(0)
    expect(rb.toArray()).toEqual([0, 1])
  })
})

// ─── Get / Set / Peek ───
describe('RingBuffer get, set, peek', () => {
  it('gets element at index', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(10)
    rb.push(20)
    rb.push(30)
    expect(rb.get(0)).toBe(10)
    expect(rb.get(2)).toBe(30)
  })

  it('throws on out-of-bounds get', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    expect(() => rb.get(5)).toThrow(RangeError)
    expect(() => rb.get(-1)).toThrow(RangeError)
  })

  it('sets element at index', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(10)
    rb.push(20)
    rb.set(1, 99)
    expect(rb.get(1)).toBe(99)
  })

  it('peeks at front', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(42)
    rb.push(43)
    expect(rb.peek()).toBe(42)
  })

  it('peeks at back', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(42)
    rb.push(43)
    expect(rb.peekBack()).toBe(43)
  })

  it('throws peek on empty', () => {
    const rb = new RingBuffer<number>(3)
    expect(() => rb.peek()).toThrow(RangeError)
    expect(() => rb.peekBack()).toThrow(RangeError)
  })
})

// ─── Iteration ───
describe('RingBuffer iteration', () => {
  it('iterates with forEach', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    const collected: number[] = []
    rb.forEach((v) => collected.push(v))
    expect(collected).toEqual([1, 2, 3])
  })

  it('maps elements', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    expect(rb.map((v) => v * 10)).toEqual([10, 20])
  })

  it('filters elements', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    expect(rb.filter((v) => v % 2 === 0)).toEqual([2, 4])
  })

  it('reduces elements', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.reduce((acc, v) => acc + v, 0)).toBe(6)
  })

  it('supports Symbol.iterator', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(10)
    rb.push(20)
    expect([...rb]).toEqual([10, 20])
  })
})

// ─── Resize / Clear ───
describe('RingBuffer resize and clear', () => {
  it('clears the buffer', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.clear()
    expect(rb.isEmpty).toBe(true)
    expect(rb.size).toBe(0)
  })

  it('resizes to larger capacity', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.resize(5)
    expect(rb.capacity).toBe(5)
    expect(rb.toArray()).toEqual([1, 2])
  })

  it('resizes to smaller capacity truncating', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    rb.resize(2)
    expect(rb.toArray()).toEqual([3, 4])
    expect(rb.capacity).toBe(2)
  })
})

// ─── Read / Write ───
describe('RingBuffer read and write', () => {
  it('writes multiple values', () => {
    const rb = new RingBuffer<number>(5)
    expect(rb.write([1, 2, 3])).toBe(3)
    expect(rb.toArray()).toEqual([1, 2, 3])
  })

  it('reads and removes elements', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(10)
    rb.push(20)
    rb.push(30)
    expect(rb.read(2)).toEqual([10, 20])
    expect(rb.size).toBe(1)
  })

  it('reads up to size', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    expect(rb.read(10)).toEqual([1])
  })
})

// ─── isFull ───
describe('RingBuffer isFull', () => {
  it('reports full correctly', () => {
    const rb = new RingBuffer<number>(2)
    expect(rb.isFull).toBe(false)
    rb.push(1)
    expect(rb.isFull).toBe(false)
    rb.push(2)
    expect(rb.isFull).toBe(true)
  })
})
