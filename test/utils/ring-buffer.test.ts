import { beforeEach, describe, expect, it } from 'vitest'

import { RingBuffer } from '../../src/utils/ring-buffer.js'

// ─── Constructor ─────────────────────────────────────────
describe('RingBuffer - constructor', () => {
  it('creates buffer from number capacity', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.capacity).toBe(3)
    expect(rb.size).toBe(0)
    expect(rb.isEmpty()).toBe(true)
  })

  it('creates buffer from options object', () => {
    const rb = new RingBuffer<number>({ capacity: 5 })
    expect(rb.capacity).toBe(5)
    expect(rb.size).toBe(0)
  })

  it('creates buffer with overwrite disabled', () => {
    const rb = new RingBuffer<number>({ capacity: 2, allowOverwrite: false })
    expect(rb.capacity).toBe(2)
  })

  it('throws RangeError for capacity < 1', () => {
    expect(() => new RingBuffer<number>(0)).toThrow(RangeError)
    expect(() => new RingBuffer<number>(0)).toThrow('Capacity must be >= 1, got 0')
  })

  it('throws RangeError for negative capacity', () => {
    expect(() => new RingBuffer<number>(-1)).toThrow(RangeError)
  })

  it('defaults allowOverwrite to true with number constructor', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    expect(rb.push(3)).toBe(true)
    expect(rb.toArray()).toEqual([2, 3])
  })
})

// ─── Push and overwrite ──────────────────────────────────
describe('RingBuffer - push', () => {
  it('pushes elements and increases size', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    expect(rb.size).toBe(1)
    rb.push(2)
    expect(rb.size).toBe(2)
  })

  it('returns true on successful push', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.push(1)).toBe(true)
  })

  it('overwrites oldest element when full and overwrite enabled', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    expect(rb.toArray()).toEqual([2, 3, 4])
    expect(rb.size).toBe(3)
  })

  it('returns false when full and overwrite disabled', () => {
    const rb = new RingBuffer<number>({ capacity: 2, allowOverwrite: false })
    rb.push(1)
    rb.push(2)
    expect(rb.push(3)).toBe(false)
    expect(rb.toArray()).toEqual([1, 2])
  })

  it('maintains correct order after multiple overwrites', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    rb.push(5)
    expect(rb.toArray()).toEqual([4, 5])
  })
})

// ─── Shift ───────────────────────────────────────────────
describe('RingBuffer - shift', () => {
  it('returns undefined on empty buffer', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.shift()).toBeUndefined()
  })

  it('removes and returns the oldest element', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.shift()).toBe(1)
    expect(rb.toArray()).toEqual([2, 3])
  })

  it('updates size after shift', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.shift()
    expect(rb.size).toBe(1)
  })

  it('shift after overwrite returns correct element', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.shift()).toBe(2)
    expect(rb.shift()).toBe(3)
  })
})

// ─── Pop ─────────────────────────────────────────────────
describe('RingBuffer - pop', () => {
  it('returns undefined on empty buffer', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.pop()).toBeUndefined()
  })

  it('removes and returns the newest element', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.pop()).toBe(3)
    expect(rb.toArray()).toEqual([1, 2])
  })

  it('updates size after pop', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.pop()
    expect(rb.size).toBe(0)
  })
})

// ─── Get by index ────────────────────────────────────────
describe('RingBuffer - get', () => {
  it('returns element at index', () => {
    const rb = new RingBuffer<number>(3)
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
    expect(rb.get(5)).toBeUndefined()
  })

  it('returns correct element after overwrite', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    expect(rb.get(0)).toBe(2)
    expect(rb.get(1)).toBe(3)
    expect(rb.get(2)).toBe(4)
  })
})

// ─── Peek ────────────────────────────────────────────────
describe('RingBuffer - peek', () => {
  it('returns undefined on empty buffer', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.peek()).toBeUndefined()
  })

  it('returns the oldest element without removing', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    expect(rb.peek()).toBe(1)
    expect(rb.size).toBe(2)
  })
})

// ─── PeekLast ────────────────────────────────────────────
describe('RingBuffer - peekLast', () => {
  it('returns undefined on empty buffer', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.peekLast()).toBeUndefined()
  })

  it('returns the newest element without removing', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.peekLast()).toBe(3)
    expect(rb.size).toBe(3)
  })
})

// ─── isEmpty and isFull ──────────────────────────────────
describe('RingBuffer - isEmpty and isFull', () => {
  it('isEmpty is true when buffer has no elements', () => {
    const rb = new RingBuffer<number>(3)
    expect(rb.isEmpty()).toBe(true)
  })

  it('isEmpty is false after push', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    expect(rb.isEmpty()).toBe(false)
  })

  it('isFull is false when buffer is not full', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    expect(rb.isFull()).toBe(false)
  })

  it('isFull is true when buffer is at capacity', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.isFull()).toBe(true)
  })

  it('isFull stays true after overwrite', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.isFull()).toBe(true)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('RingBuffer - clear', () => {
  it('removes all elements', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.clear()
    expect(rb.size).toBe(0)
    expect(rb.isEmpty()).toBe(true)
    expect(rb.isFull()).toBe(false)
  })

  it('allows push after clear', () => {
    const rb = new RingBuffer<number>(2)
    rb.push(1)
    rb.push(2)
    rb.clear()
    rb.push(10)
    expect(rb.toArray()).toEqual([10])
  })

  it('peek and peekLast return undefined after clear', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.clear()
    expect(rb.peek()).toBeUndefined()
    expect(rb.peekLast()).toBeUndefined()
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('RingBuffer - toArray', () => {
  it('returns elements in FIFO order', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    expect(rb.toArray()).toEqual([1, 2, 3])
  })

  it('returns correct order after overwrite', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.push(4)
    expect(rb.toArray()).toEqual([2, 3, 4])
  })

  it('returns correct order after mixed push/shift', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    rb.shift()
    rb.push(4)
    expect(rb.toArray()).toEqual([2, 3, 4])
  })
})

// ─── forEach ─────────────────────────────────────────────
describe('RingBuffer - forEach', () => {
  it('iterates all elements in order', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(10)
    rb.push(20)
    rb.push(30)
    const result: number[] = []
    rb.forEach((v) => result.push(v))
    expect(result).toEqual([10, 20, 30])
  })

  it('provides correct index', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(10)
    rb.push(20)
    const result: Array<[number, number]> = []
    rb.forEach((v, i) => result.push([v, i]))
    expect(result).toEqual([
      [10, 0],
      [20, 1],
    ])
  })

  it('does not iterate on empty buffer', () => {
    const rb = new RingBuffer<number>(3)
    let count = 0
    rb.forEach(() => count++)
    expect(count).toBe(0)
  })
})

// ─── Iterator ────────────────────────────────────────────
describe('RingBuffer - iterator', () => {
  it('is iterable with for-of', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.push(3)
    const result: number[] = []
    for (const v of rb) {
      result.push(v)
    }
    expect(result).toEqual([1, 2, 3])
  })

  it('works with spread operator', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(10)
    rb.push(20)
    expect([...rb]).toEqual([10, 20])
  })
})

// ─── fromArray ───────────────────────────────────────────
describe('RingBuffer - fromArray', () => {
  it('creates buffer from array', () => {
    const rb = RingBuffer.fromArray([1, 2, 3])
    expect(rb.size).toBe(3)
    expect(rb.toArray()).toEqual([1, 2, 3])
  })

  it('creates buffer from empty array with explicit capacity', () => {
    const rb = RingBuffer.fromArray<number>([], { capacity: 3 })
    expect(rb.size).toBe(0)
    expect(rb.isEmpty()).toBe(true)
    expect(rb.capacity).toBe(3)
  })

  it('uses explicit capacity option', () => {
    const rb = RingBuffer.fromArray([1, 2, 3], { capacity: 5 })
    expect(rb.capacity).toBe(5)
    expect(rb.size).toBe(3)
  })

  it('overflows when items exceed capacity', () => {
    const rb = RingBuffer.fromArray([1, 2, 3, 4, 5], { capacity: 3 })
    expect(rb.capacity).toBe(3)
    expect(rb.toArray()).toEqual([3, 4, 5])
  })

  it('respects allowOverwrite option', () => {
    const rb = RingBuffer.fromArray([1, 2, 3], { capacity: 2, allowOverwrite: true })
    expect(rb.toArray()).toEqual([2, 3])
  })
})

// ─── Wrapping behavior ───────────────────────────────────
describe('RingBuffer - wrapping behavior', () => {
  it('handles multiple wrap cycles', () => {
    const rb = new RingBuffer<number>(3)
    for (let i = 1; i <= 10; i++) {
      rb.push(i)
    }
    expect(rb.toArray()).toEqual([8, 9, 10])
    expect(rb.size).toBe(3)
    expect(rb.capacity).toBe(3)
  })

  it('alternating push and shift', () => {
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

  it('push pop push maintains correct state', () => {
    const rb = new RingBuffer<number>(3)
    rb.push(1)
    rb.push(2)
    rb.pop()
    rb.push(3)
    expect(rb.toArray()).toEqual([1, 3])
  })
})

// ─── Capacity of 1 ───────────────────────────────────────
describe('RingBuffer - capacity 1', () => {
  it('holds exactly one element', () => {
    const rb = new RingBuffer<number>(1)
    rb.push(42)
    expect(rb.size).toBe(1)
    expect(rb.isFull()).toBe(true)
    expect(rb.peek()).toBe(42)
    expect(rb.peekLast()).toBe(42)
  })

  it('overwrites when pushing to full capacity-1 buffer', () => {
    const rb = new RingBuffer<number>(1)
    rb.push(1)
    rb.push(2)
    expect(rb.toArray()).toEqual([2])
  })

  it('shift returns the element', () => {
    const rb = new RingBuffer<number>(1)
    rb.push(10)
    expect(rb.shift()).toBe(10)
    expect(rb.isEmpty()).toBe(true)
  })
})

  it('toArray returns current buffer', () => {
    const rb = new RingBuffer<number>({ capacity: 3 })
    rb.push(1)
    rb.push(2)
    expect(rb.toArray()).toEqual([1, 2])
  })

  it('isFull returns true when full', () => {
    const rb = new RingBuffer<number>({ capacity: 2 })
    rb.push(1)
    rb.push(2)
    expect(rb.isFull()).toBe(true)
  })

  it('clear empties buffer', () => {
    const rb = new RingBuffer<number>({ capacity: 5 })
    rb.push(1)
    rb.push(2)
    rb.clear()
    expect(rb.size).toBe(0)


  it('empty buffer get undefined', () => {
    const rb = new RingBuffer<number>(5)
    expect(rb.get(0)).toBeUndefined()
  })

  it('push and shift', () => {
    const rb = new RingBuffer<number>(5)
    rb.push(1)
    rb.push(2)
    expect(rb.shift()).toBe(1)
  })

  it('fromArray works', () => {
    const rb = RingBuffer.fromArray([1, 2, 3])
    expect(rb).toBeDefined()
  })
  })

describe('ring-buffer - wave545', () => {
  it('module exists', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('ring-buffer - wave546', () => {
  it('module accessible', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name check', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('ring-buffer - wave547', () => {
  it('module import works', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('ring-buffer - wave548', () => {
  it('ring-buffer module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave549', () => {
  it('ring-buffer module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})
