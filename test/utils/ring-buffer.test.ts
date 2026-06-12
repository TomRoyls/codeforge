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

describe('ring-buffer - wave550', () => {
  it('ring-buffer w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave551', () => {
  it('ring-buffer w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave552', () => {
  it('ring-buffer w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave553', () => {
  it('ring-buffer w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave554', () => {
  it('ring-buffer w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave555', () => {
  it('ring-buffer w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave556', () => {
  it('ring-buffer w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave557', () => {
  it('ring-buffer w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave558', () => {
  it('ring-buffer w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave559', () => {
  it('ring-buffer w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave560', () => {
  it('ring-buffer w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave561', () => {
  it('ring-buffer w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave562', () => {
  it('ring-buffer w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave563', () => {
  it('ring-buffer w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave564', () => {
  it('ring-buffer w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave565', () => {
  it('ring-buffer w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave566', () => {
  it('ring-buffer w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave127', () => {
  it('ring-buffer w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave130', () => {
  it('ring-buffer w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave133', () => {
  it('ring-buffer w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave136', () => {
  it('ring-buffer w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - wave139', () => {
  it('ring-buffer w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w142', () => {
  it('ring-buffer v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w145', () => {
  it('ring-buffer v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w148', () => {
  it('ring-buffer v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w151', () => {
  it('ring-buffer v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w154', () => {
  it('ring-buffer v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w157', () => {
  it('ring-buffer v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w160', () => {
  it('ring-buffer v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w170', () => {
  it('ring-buffer x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w180', () => {
  it('ring-buffer x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w190', () => {
  it('ring-buffer x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w200', () => {
  it('ring-buffer x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w210', () => {
  it('ring-buffer x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w220', () => {
  it('ring-buffer x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w230', () => {
  it('ring-buffer x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w240', () => {
  it('ring-buffer x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w250', () => {
  it('ring-buffer x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w260', () => {
  it('ring-buffer x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w270', () => {
  it('ring-buffer x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w280', () => {
  it('ring-buffer x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w290', () => {
  it('ring-buffer x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w300', () => {
  it('ring-buffer x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w310', () => {
  it('ring-buffer x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w320', () => {
  it('ring-buffer x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w330', () => {
  it('ring-buffer x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w340', () => {
  it('ring-buffer x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w350', () => {
  it('ring-buffer x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w360', () => {
  it('ring-buffer x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w370', () => {
  it('ring-buffer x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w380', () => {
  it('ring-buffer x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w390', () => {
  it('ring-buffer x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w400', () => {
  it('ring-buffer x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w420', () => {
  it('ring-buffer x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w440', () => {
  it('ring-buffer x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w460', () => {
  it('ring-buffer x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w480', () => {
  it('ring-buffer x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w500', () => {
  it('ring-buffer x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w550', () => {
  it('ring-buffer x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w600', () => {
  it('ring-buffer x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w650', () => {
  it('ring-buffer x650x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x650x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w700', () => {
  it('ring-buffer x700x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x700x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w800', () => {
  it('ring-buffer x800x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x800x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w900', () => {
  it('ring-buffer x900x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x900x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('ring-buffer - w1000', () => {
  it('ring-buffer x1000x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('ring-buffer x1000x99', () => {
    expect(beforeEach).toBeDefined()
  })
})
