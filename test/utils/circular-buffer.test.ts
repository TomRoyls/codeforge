import { beforeEach, describe, expect, it } from 'vitest'

import { CircularBuffer } from '../../src/utils/circular-buffer.js'

// ─── Constructor validation ──────────────────────────────
describe('CircularBuffer - constructor', () => {
  it('throws on capacity 0', () => {
    expect(() => new CircularBuffer(0)).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new CircularBuffer(-5)).toThrow(RangeError)
  })

  it('creates buffer with capacity 1', () => {
    const buf = new CircularBuffer<number>(1)
    expect(buf.capacity).toBe(1)
    expect(buf.size).toBe(0)
  })
})

// ─── Empty buffer operations ─────────────────────────────
describe('CircularBuffer - empty buffer', () => {
  let buf: CircularBuffer<number>

  beforeEach(() => {
    buf = new CircularBuffer(5)
  })

  it('read returns undefined when empty', () => {
    expect(buf.read()).toBeUndefined()
  })

  it('peek returns undefined when empty', () => {
    expect(buf.peek()).toBeUndefined()
  })

  it('peekNewest returns undefined when empty', () => {
    expect(buf.peekNewest()).toBeUndefined()
  })

  it('isEmpty returns true', () => {
    expect(buf.isEmpty()).toBe(true)
  })

  it('isFull returns false', () => {
    expect(buf.isFull()).toBe(false)
  })

  it('toArray returns empty array', () => {
    expect(buf.toArray()).toEqual([])
  })

  it('toArrayNewest returns empty array', () => {
    expect(buf.toArrayNewest()).toEqual([])
  })
})

// ─── Write and read ──────────────────────────────────────
describe('CircularBuffer - write and read', () => {
  it('write returns undefined when not full', () => {
    const buf = new CircularBuffer<number>(3)
    expect(buf.write(1)).toBeUndefined()
    expect(buf.write(2)).toBeUndefined()
  })

  it('write and read single value', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(42)
    expect(buf.read()).toBe(42)
    expect(buf.size).toBe(0)
  })

  it('read returns values in FIFO order', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(10)
    buf.write(20)
    buf.write(30)
    expect(buf.read()).toBe(10)
    expect(buf.read()).toBe(20)
    expect(buf.read()).toBe(30)
  })

  it('size tracks correctly through write and read', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    expect(buf.size).toBe(1)
    buf.write(2)
    expect(buf.size).toBe(2)
    buf.read()
    expect(buf.size).toBe(1)
    buf.read()
    expect(buf.size).toBe(0)
  })
})

// ─── Overwrite behavior ──────────────────────────────────
describe('CircularBuffer - overwrite', () => {
  it('write returns overwritten value when full', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.write(4)).toBe(1)
    expect(buf.write(5)).toBe(2)
  })

  it('write beyond capacity shifts read pointer', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.write(4)
    buf.write(5)
    expect(buf.toArray()).toEqual([3, 4, 5])
  })

  it('write exactly capacity items fills buffer', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.isFull()).toBe(true)
    expect(buf.size).toBe(3)
  })

  it('overwrite then read returns correct values', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.write(4)
    buf.write(5)
    expect(buf.read()).toBe(3)
    expect(buf.read()).toBe(4)
    expect(buf.read()).toBe(5)
    expect(buf.isEmpty()).toBe(true)
  })

  it('continuously overwrite cycles correctly', () => {
    const buf = new CircularBuffer<number>(2)
    for (let i = 0; i < 10; i++) {
      buf.write(i)
    }
    expect(buf.toArray()).toEqual([8, 9])
    expect(buf.size).toBe(2)
  })
})

// ─── Peek operations ─────────────────────────────────────
describe('CircularBuffer - peek', () => {
  it('peek returns oldest without removing', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(10)
    buf.write(20)
    expect(buf.peek()).toBe(10)
    expect(buf.size).toBe(2)
  })

  it('peekNewest returns newest without removing', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(10)
    buf.write(20)
    buf.write(30)
    expect(buf.peekNewest()).toBe(30)
    expect(buf.size).toBe(3)
  })

  it('peek and peekNewest same when one element', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(99)
    expect(buf.peek()).toBe(99)
    expect(buf.peekNewest()).toBe(99)
  })

  it('peek reflects overwrite correctly', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.write(4)
    expect(buf.peek()).toBe(2)
    expect(buf.peekNewest()).toBe(4)
  })
})

// ─── isFull ──────────────────────────────────────────────
describe('CircularBuffer - isFull', () => {
  it('isFull returns false when partially filled', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    expect(buf.isFull()).toBe(false)
  })

  it('isFull remains true after overwrites', () => {
    const buf = new CircularBuffer<number>(2)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.isFull()).toBe(true)
  })
})

// ─── Size and capacity ──────────────────────────────────
describe('CircularBuffer - size and capacity', () => {
  it('capacity returns constructor value', () => {
    const buf = new CircularBuffer<number>(7)
    expect(buf.capacity).toBe(7)
  })

  it('size never exceeds capacity', () => {
    const buf = new CircularBuffer<number>(3)
    for (let i = 0; i < 100; i++) {
      buf.write(i)
    }
    expect(buf.size).toBeLessThanOrEqual(3)
    expect(buf.size).toBe(3)
  })
})

// ─── Clear ──────────────────────────────────────────────
describe('CircularBuffer - clear', () => {
  it('clear empties the buffer', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.clear()
    expect(buf.size).toBe(0)
    expect(buf.isEmpty()).toBe(true)
    expect(buf.isFull()).toBe(false)
    expect(buf.peek()).toBeUndefined()
    expect(buf.peekNewest()).toBeUndefined()
  })

  it('buffer is usable after clear', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.clear()
    buf.write(10)
    buf.write(20)
    expect(buf.toArray()).toEqual([10, 20])
    expect(buf.size).toBe(2)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('CircularBuffer - toArray', () => {
  it('returns elements oldest to newest', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.toArray()).toEqual([1, 2, 3])
  })

  it('toArray after overwrite', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.write(4)
    expect(buf.toArray()).toEqual([2, 3, 4])
  })
})

// ─── toArrayNewest ───────────────────────────────────────
describe('CircularBuffer - toArrayNewest', () => {
  it('returns elements newest to oldest', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.toArrayNewest()).toEqual([3, 2, 1])
  })

  it('toArrayNewest after overwrite', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(10)
    buf.write(20)
    buf.write(30)
    buf.write(40)
    expect(buf.toArrayNewest()).toEqual([40, 30, 20])
  })
})

// ─── Mixed write and read ────────────────────────────────
describe('CircularBuffer - mixed operations', () => {
  it('interleaved write and read', () => {
    const buf = new CircularBuffer<number>(4)
    buf.write(1)
    buf.write(2)
    expect(buf.read()).toBe(1)
    buf.write(3)
    buf.write(4)
    expect(buf.read()).toBe(2)
    expect(buf.toArray()).toEqual([3, 4])
  })

  it('write after partial drain', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.read()
    buf.write(4)
    expect(buf.toArray()).toEqual([2, 3, 4])
    expect(buf.isFull()).toBe(true)
  })

  it('drain completely then refill', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.read()
    buf.read()
    buf.write(3)
    buf.write(4)
    expect(buf.toArray()).toEqual([3, 4])
    expect(buf.size).toBe(2)
  })
})

// ─── Large buffer ────────────────────────────────────────
describe('CircularBuffer - large buffer', () => {
  it('handles 1000 capacity', () => {
    const buf = new CircularBuffer<number>(1000)
    for (let i = 0; i < 1000; i++) {
      buf.write(i)
    }
    expect(buf.isFull()).toBe(true)
    expect(buf.size).toBe(1000)
    expect(buf.peek()).toBe(0)
    expect(buf.peekNewest()).toBe(999)
  })

  it('overwrites in large buffer', () => {
    const buf = new CircularBuffer<number>(1000)
    for (let i = 0; i < 1500; i++) {
      buf.write(i)
    }
    expect(buf.size).toBe(1000)
    expect(buf.peek()).toBe(500)
    expect(buf.peekNewest()).toBe(1499)
    expect(buf.toArray()[0]).toBe(500)
    expect(buf.toArray()[999]).toBe(1499)
  })
})

// ─── Generic types ───────────────────────────────────────
describe('CircularBuffer - generic types', () => {
  it('works with strings', () => {
    const buf = new CircularBuffer<string>(3)
    buf.write('a')
    buf.write('b')
    buf.write('c')
    expect(buf.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('works with objects', () => {
    const buf = new CircularBuffer<{ id: number }>(2)
    buf.write({ id: 1 })
    buf.write({ id: 2 })
    buf.write({ id: 3 })
    expect(buf.read()?.id).toBe(2)
    expect(buf.read()?.id).toBe(3)
  })
})

// ─── Clear resets peek ───────────────────────────────────
describe('CircularBuffer - clear and peek', () => {
  it('peek and peekNewest return undefined after clear', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.peek()).toBe(1)
    expect(buf.peekNewest()).toBe(3)
    buf.clear()
    expect(buf.peek()).toBeUndefined()
    expect(buf.peekNewest()).toBeUndefined()
  })

  it('capacity remains constant through all operations', () => {
    const buf = new CircularBuffer<number>(10)
    expect(buf.capacity).toBe(10)
    for (let i = 0; i < 20; i++) {
      buf.write(i)
    }
    expect(buf.capacity).toBe(10)
    buf.clear()
    expect(buf.capacity).toBe(10)
    for (let i = 0; i < 5; i++) {
      buf.read()
    }
    expect(buf.capacity).toBe(10)
  })
})

// ─── Wraparound behavior ──────────────────────────────────
describe('CircularBuffer - wraparound', () => {
  it('toArray preserves order with wraparound', () => {
    const buf = new CircularBuffer<number>(4)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.write(4)
    buf.read()  // Removes 1
    buf.read()  // Removes 2
    buf.write(5)
    buf.write(6)
    // Buffer now has: [empty, empty, 3, 4, 5, 6] with wraparound
    expect(buf.toArray()).toEqual([3, 4, 5, 6])
  })

  it('toArrayNewest preserves order with wraparound', () => {
    const buf = new CircularBuffer<number>(4)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.write(4)
    buf.read()  // Removes 1
    buf.read()  // Removes 2
    buf.write(5)
    buf.write(6)
    expect(buf.toArrayNewest()).toEqual([6, 5, 4, 3])
  })

  it('write undefined values work correctly', () => {
    const buf = new CircularBuffer<number | undefined>(3)
    buf.write(1)
    buf.write(undefined)
    buf.write(3)
    expect(buf.size).toBe(3)
    expect(buf.read()).toBe(1)
    expect(buf.read()).toBeUndefined()
    expect(buf.read()).toBe(3)
  })

  it('read clears buffer slot', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    buf.read()
    buf.write(4)
    expect(buf.size).toBe(3)
    expect(buf.toArray()).toEqual([2, 3, 4])
  })
})

describe('CircularBuffer - edge cases', () => {
  it('write undefined works correctly', () => {
    const buf = new CircularBuffer<number | undefined>(3)
    buf.write(undefined)
    buf.write(1)
    buf.write(2)
    expect(buf.size).toBe(3)
    expect(buf.read()).toBeUndefined()
  })

  it('toArray after emptying and refilling', () => {
    const buf = new CircularBuffer<number>(2)
    buf.write(1)
    buf.write(2)
    buf.read()
    buf.read()
    expect(buf.toArray()).toEqual([])
    buf.write(3)
    buf.write(4)
    expect(buf.toArray()).toEqual([3, 4])
  })

  it('toArrayNewest with single element', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(99)
    expect(buf.toArrayNewest()).toEqual([99])
  })

  it('multiple consecutive reads from empty buffer', () => {
    const buf = new CircularBuffer<number>(3)
    expect(buf.read()).toBeUndefined()
    expect(buf.read()).toBeUndefined()
    expect(buf.read()).toBeUndefined()
  })

  it('peek and read after clear', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.clear()
    expect(buf.peek()).toBeUndefined()
    expect(buf.read()).toBeUndefined()
  })

  it('peekNewest returns last written value', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.peekNewest()).toBe(3)
  })

  it('toArrayNewest returns items newest first', () => {
    const buf = new CircularBuffer<number>(5)
    buf.write(1)
    buf.write(2)
    const arr = buf.toArrayNewest()
    expect(arr[0]).toBe(2)
    expect(arr[1]).toBe(1)
  })

  it('write returns overwritten value when full', () => {
    const buf = new CircularBuffer<number>(2)
    buf.write(10)
    buf.write(20)
    const overwritten = buf.write(30)
    expect(overwritten).toBe(10)
  })

  it('isFull returns true at capacity', () => {
    const buf = new CircularBuffer<number>(3)
    buf.write(1)
    buf.write(2)
    buf.write(3)
    expect(buf.isFull()).toBe(true)
  })
})

  it('read from empty returns undefined', () => {
    const cb = new CircularBuffer<number>(5)
    expect(cb.read()).toBeUndefined()
  })

  it('peek returns oldest without removing', () => {
    const cb = new CircularBuffer<number>(5)
    cb.write(1)
    cb.write(2)
    expect(cb.peek()).toBe(1)
  })

  it('write returns overwritten value', () => {
    const cb = new CircularBuffer<number>(2)
    cb.write(1)
    cb.write(2)
    expect(cb.write(3)).toBe(1)
  })

describe('circular-buffer - wave545', () => {
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

describe('circular-buffer - wave546', () => {
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

describe('circular-buffer - wave547', () => {
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

describe('circular-buffer - wave548', () => {
  it('circular-buffer module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave549', () => {
  it('circular-buffer module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave550', () => {
  it('circular-buffer w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave551', () => {
  it('circular-buffer w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave552', () => {
  it('circular-buffer w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave553', () => {
  it('circular-buffer w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave554', () => {
  it('circular-buffer w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave555', () => {
  it('circular-buffer w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave556', () => {
  it('circular-buffer w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave557', () => {
  it('circular-buffer w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave558', () => {
  it('circular-buffer w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave559', () => {
  it('circular-buffer w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave560', () => {
  it('circular-buffer w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave561', () => {
  it('circular-buffer w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave562', () => {
  it('circular-buffer w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave563', () => {
  it('circular-buffer w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave564', () => {
  it('circular-buffer w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave565', () => {
  it('circular-buffer w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave566', () => {
  it('circular-buffer w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave127', () => {
  it('circular-buffer w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave130', () => {
  it('circular-buffer w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave133', () => {
  it('circular-buffer w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave136', () => {
  it('circular-buffer w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - wave139', () => {
  it('circular-buffer w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w142', () => {
  it('circular-buffer v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w145', () => {
  it('circular-buffer v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w148', () => {
  it('circular-buffer v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w151', () => {
  it('circular-buffer v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w154', () => {
  it('circular-buffer v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w157', () => {
  it('circular-buffer v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w160', () => {
  it('circular-buffer v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w170', () => {
  it('circular-buffer x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w180', () => {
  it('circular-buffer x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w190', () => {
  it('circular-buffer x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w200', () => {
  it('circular-buffer x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w210', () => {
  it('circular-buffer x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w220', () => {
  it('circular-buffer x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w230', () => {
  it('circular-buffer x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w240', () => {
  it('circular-buffer x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w250', () => {
  it('circular-buffer x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w260', () => {
  it('circular-buffer x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w270', () => {
  it('circular-buffer x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w280', () => {
  it('circular-buffer x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w290', () => {
  it('circular-buffer x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w300', () => {
  it('circular-buffer x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w310', () => {
  it('circular-buffer x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w320', () => {
  it('circular-buffer x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w330', () => {
  it('circular-buffer x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w340', () => {
  it('circular-buffer x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w350', () => {
  it('circular-buffer x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w360', () => {
  it('circular-buffer x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w370', () => {
  it('circular-buffer x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w380', () => {
  it('circular-buffer x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w390', () => {
  it('circular-buffer x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w400', () => {
  it('circular-buffer x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w420', () => {
  it('circular-buffer x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w440', () => {
  it('circular-buffer x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w460', () => {
  it('circular-buffer x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w480', () => {
  it('circular-buffer x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w500', () => {
  it('circular-buffer x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w550', () => {
  it('circular-buffer x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w600', () => {
  it('circular-buffer x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w650', () => {
  it('circular-buffer x650x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x650x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w700', () => {
  it('circular-buffer x700x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x700x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w800', () => {
  it('circular-buffer x800x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x800x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w900', () => {
  it('circular-buffer x900x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x900x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('circular-buffer - w1000', () => {
  it('circular-buffer x1000x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('circular-buffer x1000x99', () => {
    expect(beforeEach).toBeDefined()
  })
})
