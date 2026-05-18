import { describe, expect, it } from 'vitest'
import { RingBuffer3 } from '../../src/core/ring-buffer-3/index.js'

// ─── Constructor ───

describe('RingBuffer3 – constructor', () => {
  it('creates a buffer with power-of-2 capacity', () => {
    const buf = new RingBuffer3<number>(5)
    expect(buf.capacity).toBe(8)
    expect(buf.size).toBe(0)
    expect(buf.isEmpty).toBe(true)
  })

  it('rounds capacity 1 to 1', () => {
    const buf = new RingBuffer3<number>(1)
    expect(buf.capacity).toBe(1)
  })

  it('keeps exact power-of-2 capacity', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.capacity).toBe(4)
  })

  it('rounds capacity 3 up to 4', () => {
    const buf = new RingBuffer3<number>(3)
    expect(buf.capacity).toBe(4)
  })

  it('rounds capacity 9 up to 16', () => {
    const buf = new RingBuffer3<number>(9)
    expect(buf.capacity).toBe(16)
  })
})

// ─── push ───

describe('RingBuffer3 – push', () => {
  it('pushes elements to the back', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.push(1)).toBe(true)
    expect(buf.push(2)).toBe(true)
    expect(buf.toArray()).toEqual([1, 2])
  })

  it('returns false when full', () => {
    const buf = new RingBuffer3<number>(2)
    buf.push(1)
    buf.push(2)
    expect(buf.isFull).toBe(true)
    expect(buf.push(3)).toBe(false)
  })

  it('updates size correctly', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(10)
    buf.push(20)
    expect(buf.size).toBe(2)
  })

  it('handles single-element capacity', () => {
    const buf = new RingBuffer3<number>(1)
    expect(buf.push(42)).toBe(true)
    expect(buf.isFull).toBe(true)
    expect(buf.push(99)).toBe(false)
  })
})

// ─── pop ───

describe('RingBuffer3 – pop', () => {
  it('removes and returns the last element', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.pop()).toBe(3)
    expect(buf.toArray()).toEqual([1, 2])
  })

  it('returns undefined when empty', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.pop()).toBeUndefined()
  })

  it('decrements size', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.pop()
    expect(buf.size).toBe(0)
    expect(buf.isEmpty).toBe(true)
  })
})

// ─── shift ───

describe('RingBuffer3 – shift', () => {
  it('removes and returns the first element', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.shift()).toBe(1)
    expect(buf.toArray()).toEqual([2, 3])
  })

  it('returns undefined when empty', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.shift()).toBeUndefined()
  })

  it('works after push and shift cycle', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.shift()
    buf.push(2)
    expect(buf.toArray()).toEqual([2])
  })
})

// ─── unshift ───

describe('RingBuffer3 – unshift', () => {
  it('adds element to the front', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(2)
    buf.unshift(1)
    expect(buf.toArray()).toEqual([1, 2])
  })

  it('returns false when full', () => {
    const buf = new RingBuffer3<number>(2)
    buf.push(1)
    buf.push(2)
    expect(buf.unshift(0)).toBe(false)
  })

  it('prepends multiple elements', () => {
    const buf = new RingBuffer3<number>(8)
    buf.push(3)
    buf.unshift(2)
    buf.unshift(1)
    expect(buf.toArray()).toEqual([1, 2, 3])
  })
})

// ─── peekFront / peekBack ───

describe('RingBuffer3 – peekFront / peekBack', () => {
  it('returns undefined on empty buffer', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.peekFront()).toBeUndefined()
    expect(buf.peekBack()).toBeUndefined()
  })

  it('returns front and back elements without removing', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.peekFront()).toBe(1)
    expect(buf.peekBack()).toBe(3)
    expect(buf.size).toBe(3)
  })

  it('returns same element for front and back when size is 1', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(42)
    expect(buf.peekFront()).toBe(42)
    expect(buf.peekBack()).toBe(42)
  })
})

// ─── clear ───

describe('RingBuffer3 – clear', () => {
  it('removes all elements', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.push(2)
    buf.clear()
    expect(buf.size).toBe(0)
    expect(buf.isEmpty).toBe(true)
    expect(buf.toArray()).toEqual([])
  })

  it('allows reuse after clear', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.clear()
    buf.push(2)
    expect(buf.toArray()).toEqual([2])
  })
})

// ─── isEmpty / isFull ───

describe('RingBuffer3 – isEmpty / isFull', () => {
  it('isEmpty is true initially', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.isEmpty).toBe(true)
  })

  it('isFull becomes true when at capacity', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    buf.push(4)
    expect(buf.isFull).toBe(true)
  })

  it('isEmpty after popping all elements', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.pop()
    expect(buf.isEmpty).toBe(true)
  })
})

// ─── toArray ───

describe('RingBuffer3 – toArray', () => {
  it('returns elements in insertion order', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(10)
    buf.push(20)
    buf.push(30)
    expect(buf.toArray()).toEqual([10, 20, 30])
  })

  it('returns empty array for empty buffer', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.toArray()).toEqual([])
  })

  it('handles wrap-around correctly', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    buf.push(2)
    buf.shift()
    buf.push(3)
    buf.push(4)
    expect(buf.toArray()).toEqual([2, 3, 4])
  })
})

// ─── forEach ───

describe('RingBuffer3 – forEach', () => {
  it('iterates all elements with index', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(10)
    buf.push(20)
    buf.push(30)
    const collected: [number, number][] = []
    buf.forEach((v, i) => collected.push([i, v]))
    expect(collected).toEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ])
  })

  it('does not call callback on empty buffer', () => {
    const buf = new RingBuffer3<number>(4)
    let called = false
    buf.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

// ─── get ───

describe('RingBuffer3 – get', () => {
  it('returns element at valid index', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(10)
    buf.push(20)
    buf.push(30)
    expect(buf.get(0)).toBe(10)
    expect(buf.get(1)).toBe(20)
    expect(buf.get(2)).toBe(30)
  })

  it('returns undefined for out-of-bounds index', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(1)
    expect(buf.get(-1)).toBeUndefined()
    expect(buf.get(1)).toBeUndefined()
    expect(buf.get(100)).toBeUndefined()
  })

  it('returns undefined for empty buffer', () => {
    const buf = new RingBuffer3<number>(4)
    expect(buf.get(0)).toBeUndefined()
  })
})

// ─── Mixed operations ───

describe('RingBuffer3 – mixed operations', () => {
  it('handles interleaved push/pop/shift/unshift', () => {
    const buf = new RingBuffer3<number>(8)
    buf.push(2)
    buf.unshift(1)
    buf.push(3)
    buf.shift()
    expect(buf.toArray()).toEqual([2, 3])
    buf.pop()
    expect(buf.toArray()).toEqual([2])
  })

  it('handles negative values', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(-1)
    buf.push(-2)
    expect(buf.toArray()).toEqual([-1, -2])
    expect(buf.pop()).toBe(-2)
  })

  it('handles single element push/pop cycle', () => {
    const buf = new RingBuffer3<number>(4)
    buf.push(99)
    expect(buf.pop()).toBe(99)
    expect(buf.isEmpty).toBe(true)
    buf.push(88)
    expect(buf.shift()).toBe(88)
    expect(buf.isEmpty).toBe(true)
  })

  it('handles string elements', () => {
    const buf = new RingBuffer3<string>(4)
    buf.push('a')
    buf.push('b')
    buf.unshift('c')
    expect(buf.toArray()).toEqual(['c', 'a', 'b'])
  })
})
