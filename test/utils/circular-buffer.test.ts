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
