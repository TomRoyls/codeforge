import { describe, expect, it } from 'vitest'
import { RingBuffer4 } from '../../src/core/ring-buffer-4/index.js'

// ─── Constructor ───

describe('RingBuffer4 – constructor', () => {
  it('creates buffer with specified capacity', () => {
    const buf = new RingBuffer4<number>(5)
    expect(buf.capacity).toBe(5)
    expect(buf.size).toBe(0)
    expect(buf.isEmpty).toBe(true)
  })

  it('throws for zero capacity', () => {
    expect(() => new RingBuffer4<number>(0)).toThrow()
  })

  it('throws for negative capacity', () => {
    expect(() => new RingBuffer4<number>(-1)).toThrow()
  })

  it('throws for non-integer capacity', () => {
    expect(() => new RingBuffer4<number>(1.5)).toThrow()
  })

  it('accepts capacity of 1', () => {
    const buf = new RingBuffer4<number>(1)
    expect(buf.capacity).toBe(1)
  })
})

// ─── push ───

describe('RingBuffer4 – push', () => {
  it('adds elements to the back', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.push(1)).toBe(true)
    expect(buf.push(2)).toBe(true)
    expect(buf.toArray()).toEqual([1, 2])
  })

  it('returns false when full', () => {
    const buf = new RingBuffer4<number>(2)
    buf.push(1)
    buf.push(2)
    expect(buf.isFull).toBe(true)
    expect(buf.push(3)).toBe(false)
  })

  it('increments size', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    expect(buf.size).toBe(1)
    buf.push(2)
    expect(buf.size).toBe(2)
  })
})

// ─── pop ───

describe('RingBuffer4 – pop', () => {
  it('removes and returns last element', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.pop()).toBe(3)
    expect(buf.toArray()).toEqual([1, 2])
  })

  it('returns undefined when empty', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.pop()).toBeUndefined()
  })

  it('decrements size', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.pop()
    expect(buf.size).toBe(0)
    expect(buf.isEmpty).toBe(true)
  })
})

// ─── shift ───

describe('RingBuffer4 – shift', () => {
  it('removes and returns first element', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.shift()).toBe(1)
    expect(buf.toArray()).toEqual([2, 3])
  })

  it('returns undefined when empty', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.shift()).toBeUndefined()
  })
})

// ─── unshift ───

describe('RingBuffer4 – unshift', () => {
  it('adds element to the front', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(2)
    buf.unshift(1)
    expect(buf.toArray()).toEqual([1, 2])
  })

  it('returns false when full', () => {
    const buf = new RingBuffer4<number>(2)
    buf.push(1)
    buf.push(2)
    expect(buf.unshift(0)).toBe(false)
  })

  it('prepends multiple elements', () => {
    const buf = new RingBuffer4<number>(5)
    buf.push(3)
    buf.unshift(2)
    buf.unshift(1)
    expect(buf.toArray()).toEqual([1, 2, 3])
  })
})

// ─── peekFront / peekBack ───

describe('RingBuffer4 – peekFront / peekBack', () => {
  it('returns undefined on empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.peekFront()).toBeUndefined()
    expect(buf.peekBack()).toBeUndefined()
  })

  it('returns front and back without removing', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.peekFront()).toBe(1)
    expect(buf.peekBack()).toBe(3)
    expect(buf.size).toBe(3)
  })

  it('returns same value for front and back when single element', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(42)
    expect(buf.peekFront()).toBe(42)
    expect(buf.peekBack()).toBe(42)
  })
})

// ─── clear ───

describe('RingBuffer4 – clear', () => {
  it('removes all elements', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    buf.clear()
    expect(buf.size).toBe(0)
    expect(buf.isEmpty).toBe(true)
  })

  it('allows reuse after clear', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.clear()
    buf.push(2)
    expect(buf.toArray()).toEqual([2])
  })
})

// ─── isEmpty / isFull ───

describe('RingBuffer4 – isEmpty / isFull', () => {
  it('isEmpty is true initially', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.isEmpty).toBe(true)
  })

  it('isFull when at capacity', () => {
    const buf = new RingBuffer4<number>(3)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.isFull).toBe(true)
  })

  it('not full after shift makes room', () => {
    const buf = new RingBuffer4<number>(2)
    buf.push(1)
    buf.push(2)
    buf.shift()
    expect(buf.isFull).toBe(false)
  })
})

// ─── toArray ───

describe('RingBuffer4 – toArray', () => {
  it('returns elements in insertion order', () => {
    const buf = new RingBuffer4<number>(5)
    buf.push(10)
    buf.push(20)
    buf.push(30)
    expect(buf.toArray()).toEqual([10, 20, 30])
  })

  it('returns empty array for empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.toArray()).toEqual([])
  })

  it('handles wrap-around correctly', () => {
    const buf = new RingBuffer4<number>(3)
    buf.push(1)
    buf.push(2)
    buf.shift()
    buf.push(3)
    buf.push(4)
    expect(buf.toArray()).toEqual([2, 3, 4])
  })
})

// ─── forEach ───

describe('RingBuffer4 – forEach', () => {
  it('iterates all elements with correct index', () => {
    const buf = new RingBuffer4<number>(4)
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
    const buf = new RingBuffer4<number>(4)
    let called = false
    buf.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

// ─── get ───

describe('RingBuffer4 – get', () => {
  it('returns element at valid index', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(10)
    buf.push(20)
    buf.push(30)
    expect(buf.get(0)).toBe(10)
    expect(buf.get(1)).toBe(20)
    expect(buf.get(2)).toBe(30)
  })

  it('returns undefined for out-of-bounds', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    expect(buf.get(-1)).toBeUndefined()
    expect(buf.get(1)).toBeUndefined()
  })
})

// ─── set ───

describe('RingBuffer4 – set', () => {
  it('updates value at valid index', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(10)
    buf.push(20)
    buf.push(30)
    expect(buf.set(1, 99)).toBe(true)
    expect(buf.get(1)).toBe(99)
  })

  it('returns false for out-of-bounds index', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    expect(buf.set(-1, 0)).toBe(false)
    expect(buf.set(1, 0)).toBe(false)
  })

  it('returns false on empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.set(0, 1)).toBe(false)
  })
})

// ─── Symbol.iterator ───

describe('RingBuffer4 – Symbol.iterator', () => {
  it('iterates elements in order', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect([...buf]).toEqual([1, 2, 3])
  })

  it('returns empty array for empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect([...buf]).toEqual([])
  })

  it('works with for-of loop', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(10)
    buf.push(20)
    const sum: number[] = []
    for (const v of buf) {
      sum.push(v)
    }
    expect(sum).toEqual([10, 20])
  })
})

// ─── entries ───

describe('RingBuffer4 – entries', () => {
  it('returns index-value pairs', () => {
    const buf = new RingBuffer4<string>(4)
    buf.push('a')
    buf.push('b')
    buf.push('c')
    const result = [...buf.entries()]
    expect(result).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ])
  })

  it('returns empty iterator for empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect([...buf.entries()]).toEqual([])
  })
})

// ─── slice ───

describe('RingBuffer4 – slice', () => {
  it('returns full slice with no args', () => {
    const buf = new RingBuffer4<number>(5)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.slice()).toEqual([1, 2, 3])
  })

  it('returns slice with start only', () => {
    const buf = new RingBuffer4<number>(5)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    expect(buf.slice(1)).toEqual([2, 3])
  })

  it('returns slice with start and end', () => {
    const buf = new RingBuffer4<number>(5)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    buf.push(4)
    expect(buf.slice(1, 3)).toEqual([2, 3])
  })

  it('clamps negative start to 0', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    expect(buf.slice(-1)).toEqual([1, 2])
  })

  it('clamps end exceeding size', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    expect(buf.slice(0, 100)).toEqual([1, 2])
  })

  it('returns empty for empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.slice()).toEqual([])
  })
})

// ─── indexOf ───

describe('RingBuffer4 – indexOf', () => {
  it('finds existing element', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(10)
    buf.push(20)
    buf.push(30)
    expect(buf.indexOf(20)).toBe(1)
  })

  it('returns -1 for missing element', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    buf.push(2)
    expect(buf.indexOf(99)).toBe(-1)
  })

  it('returns first occurrence for duplicates', () => {
    const buf = new RingBuffer4<number>(5)
    buf.push(1)
    buf.push(2)
    buf.push(1)
    expect(buf.indexOf(1)).toBe(0)
  })

  it('returns -1 on empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.indexOf(1)).toBe(-1)
  })
})

// ─── contains ───

describe('RingBuffer4 – contains', () => {
  it('returns true for existing element', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(42)
    expect(buf.contains(42)).toBe(true)
  })

  it('returns false for missing element', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(1)
    expect(buf.contains(99)).toBe(false)
  })

  it('returns false on empty buffer', () => {
    const buf = new RingBuffer4<number>(4)
    expect(buf.contains(1)).toBe(false)
  })

  it('finds elements after wrap-around', () => {
    const buf = new RingBuffer4<number>(3)
    buf.push(1)
    buf.push(2)
    buf.shift()
    buf.push(3)
    expect(buf.contains(3)).toBe(true)
    expect(buf.contains(1)).toBe(false)
  })
})

// ─── Mixed operations ───

describe('RingBuffer4 – mixed operations', () => {
  it('handles interleaved push/pop/shift/unshift', () => {
    const buf = new RingBuffer4<number>(5)
    buf.push(2)
    buf.unshift(1)
    buf.push(3)
    buf.shift()
    expect(buf.toArray()).toEqual([2, 3])
    buf.pop()
    expect(buf.toArray()).toEqual([2])
  })

  it('handles negative values', () => {
    const buf = new RingBuffer4<number>(4)
    buf.push(-1)
    buf.push(-2)
    expect(buf.toArray()).toEqual([-1, -2])
    expect(buf.pop()).toBe(-2)
  })

  it('handles string elements', () => {
    const buf = new RingBuffer4<string>(4)
    buf.push('a')
    buf.push('b')
    buf.unshift('c')
    expect(buf.toArray()).toEqual(['c', 'a', 'b'])
    expect(buf.indexOf('a')).toBe(1)
    expect(buf.contains('c')).toBe(true)
  })

  it('handles wrap-around with all methods', () => {
    const buf = new RingBuffer4<number>(3)
    buf.push(1)
    buf.push(2)
    buf.push(3)
    buf.shift()
    buf.push(4)
    expect(buf.toArray()).toEqual([2, 3, 4])
    expect(buf.slice(1, 3)).toEqual([3, 4])
    expect(buf.indexOf(4)).toBe(2)
    expect(buf.contains(1)).toBe(false)
  })
})
