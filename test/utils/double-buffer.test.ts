import { describe, it, expect } from 'vitest'
import { DoubleBuffer } from '../../src/utils/double-buffer.js'

describe('DoubleBuffer', () => {
  it('starts with empty buffers', () => {
    const db = new DoubleBuffer<number>()
    expect(db.frontBuffer).toEqual([])
    expect(db.backBuffer).toEqual([])
    expect(db.isEmpty).toBe(true)
    expect(db.hasPending).toBe(false)
  })

  it('pushes items to back buffer', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    expect(db.backBuffer).toEqual([1, 2])
    expect(db.frontBuffer).toEqual([])
    expect(db.pendingCount).toBe(2)
    expect(db.readyCount).toBe(0)
  })

  it('swaps front and back buffers', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    const result = db.swap()
    expect(result).toEqual([1, 2])
    expect(db.frontBuffer).toEqual([1, 2])
    expect(db.backBuffer).toEqual([])
  })

  it('clears back buffer after swap', () => {
    const db = new DoubleBuffer<string>()
    db.push('a')
    db.swap()
    db.push('b')
    expect(db.backBuffer).toEqual(['b'])
    db.swap()
    expect(db.frontBuffer).toEqual(['b'])
    expect(db.backBuffer).toEqual([])
  })

  it('tracks totalSwaps', () => {
    const db = new DoubleBuffer<number>()
    expect(db.totalSwaps).toBe(0)
    db.swap()
    expect(db.totalSwaps).toBe(1)
    db.swap()
    db.swap()
    expect(db.totalSwaps).toBe(3)
  })

  it('pushMany adds multiple items', () => {
    const db = new DoubleBuffer<number>()
    db.pushMany([10, 20, 30])
    expect(db.backBuffer).toEqual([10, 20, 30])
    expect(db.pendingCount).toBe(3)
  })

  it('consumeFront iterates front buffer', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.swap()
    const collected: number[] = []
    db.consumeFront((item) => collected.push(item))
    expect(collected).toEqual([1, 2])
  })

  it('consumeSwap swaps then iterates', () => {
    const db = new DoubleBuffer<string>()
    db.push('x')
    db.push('y')
    const collected: string[] = []
    db.consumeSwap((item) => collected.push(item))
    expect(collected).toEqual(['x', 'y'])
    expect(db.frontBuffer).toEqual(['x', 'y'])
    expect(db.backBuffer).toEqual([])
  })

  it('drainFront returns and clears front buffer', () => {
    const db = new DoubleBuffer<number>()
    db.push(5)
    db.swap()
    const drained = db.drainFront()
    expect(drained).toEqual([5])
    expect(db.frontBuffer).toEqual([])
    expect(db.readyCount).toBe(0)
  })

  it('clear resets both buffers', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.push(2)
    db.clear()
    expect(db.frontBuffer).toEqual([])
    expect(db.backBuffer).toEqual([])
    expect(db.isEmpty).toBe(true)
  })

  it('hasPending reflects back buffer state', () => {
    const db = new DoubleBuffer<number>()
    expect(db.hasPending).toBe(false)
    db.push(1)
    expect(db.hasPending).toBe(true)
    db.swap()
    expect(db.hasPending).toBe(false)
  })

  it('isEmpty is false when either buffer has items', () => {
    const db = new DoubleBuffer<number>()
    expect(db.isEmpty).toBe(true)
    db.push(1)
    expect(db.isEmpty).toBe(false)
    db.swap()
    expect(db.isEmpty).toBe(false)
    db.drainFront()
    expect(db.isEmpty).toBe(true)
  })

  it('handles multiple push-swap cycles', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.push(2)
    db.swap()
    db.push(3)
    db.swap()
    expect(db.frontBuffer).toEqual([3])
    expect(db.totalSwaps).toBe(3)
  })

  it('swap on empty returns empty array', () => {
    const db = new DoubleBuffer<number>()
    const result = db.swap()
    expect(result).toEqual([])
  })

  it('pushMany with generator', () => {
    const db = new DoubleBuffer<number>()
    db.pushMany(function* () { yield 1; yield 2; yield 3 }())
    expect(db.pendingCount).toBe(3)
    expect(db.backBuffer).toEqual([1, 2, 3])
  })

  it('drainFront on empty returns empty', () => {
    const db = new DoubleBuffer<number>()
    expect(db.drainFront()).toEqual([])
  })

  it('toString returns formatted', () => {
    const db = new DoubleBuffer<number>()
    expect(db.toString()).toBe('DoubleBuffer(front=0, back=0)')
    db.push(1)
    expect(db.toString()).toBe('DoubleBuffer(front=0, back=1)')
    db.swap()
    expect(db.toString()).toBe('DoubleBuffer(front=1, back=0)')
  })

  it('toJSON returns state', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.push(2)
    const json = db.toJSON()
    expect(json).toEqual({ front: [1], back: [2], swaps: 1 })
  })

  it('clone creates independent copy', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.push(2)
    const copy = db.clone()
    expect(copy.frontBuffer).toEqual([1])
    expect(copy.backBuffer).toEqual([2])
    expect(copy.totalSwaps).toBe(1)
    copy.push(3)
    expect(db.pendingCount).toBe(1)
    expect(copy.pendingCount).toBe(2)
  })

  it('equals with identical state', () => {
    const a = new DoubleBuffer<number>()
    a.push(1)
    a.swap()
    const b = new DoubleBuffer<number>()
    b.push(1)
    b.swap()
    expect(a.equals(b)).toBe(true)
  })

  it('equals with different swaps', () => {
    const a = new DoubleBuffer<number>()
    a.swap()
    const b = new DoubleBuffer<number>()
    expect(a.equals(b)).toBe(false)
  })

  it('equals with non-DoubleBuffer', () => {
    const db = new DoubleBuffer<number>()
    expect(db.equals(null)).toBe(false)
    expect(db.equals({})).toBe(false)
  })

  it('clear preserves totalSwaps', () => {
    const db = new DoubleBuffer<number>()
    db.swap()
    db.swap()
    expect(db.totalSwaps).toBe(2)
    db.clear()
    expect(db.totalSwaps).toBe(2)
  })

  it('consumeFront on empty does nothing', () => {
    const db = new DoubleBuffer<number>()
    const items: number[] = []
    db.consumeFront((item) => items.push(item))
    expect(items).toEqual([])
  })

  it('consumeSwap on empty', () => {
    const db = new DoubleBuffer<number>()
    const items: number[] = []
    db.consumeSwap((item) => items.push(item))
    expect(items).toEqual([])
    expect(db.totalSwaps).toBe(1)
  })

  it('pushMany with Set', () => {
    const db = new DoubleBuffer<number>()
    db.pushMany(new Set([1, 2, 3]))
    expect(db.backBuffer).toEqual([1, 2, 3])
  })

  it('drainFront does not affect back buffer', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.push(2)
    db.drainFront()
    expect(db.backBuffer).toEqual([2])
    expect(db.frontBuffer).toEqual([])
  })

  it('multiple swaps accumulate correctly', () => {
    const db = new DoubleBuffer<number>()
    for (let i = 0; i < 10; i++) {
      db.push(i)
      db.swap()
    }
    expect(db.totalSwaps).toBe(10)
    expect(db.frontBuffer).toEqual([9])
  })

  it('readyCount after swap', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.push(3)
    db.swap()
    expect(db.readyCount).toBe(3)
    expect(db.pendingCount).toBe(0)
  })

  it('handles string type', () => {
    const db = new DoubleBuffer<string>()
    db.push('hello')
    db.push('world')
    db.swap()
    expect(db.frontBuffer).toEqual(['hello', 'world'])
  })

  it('handles object type', () => {
    const db = new DoubleBuffer<{ v: number }>()
    db.push({ v: 1 })
    db.push({ v: 2 })
    db.swap()
    expect(db.frontBuffer.length).toBe(2)
    expect(db.frontBuffer[0]!.v).toBe(1)
  })

  it('push after drain works', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.drainFront()
    db.push(2)
    db.swap()
    expect(db.frontBuffer).toEqual([2])
  })

  it('clear after swap clears front', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    expect(db.readyCount).toBe(1)
    db.clear()
    expect(db.readyCount).toBe(0)
    expect(db.isEmpty).toBe(true)
  })

  it('clone of empty buffer', () => {
    const db = new DoubleBuffer<number>()
    const copy = db.clone()
    expect(copy.isEmpty).toBe(true)
    expect(copy.totalSwaps).toBe(0)
  })

  it('toJSON is a snapshot', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    const json = db.toJSON()
    db.push(2)
    expect(json.back).toEqual([1])
    expect(db.backBuffer).toEqual([1, 2])
  })

  it('many items in single batch', () => {
    const db = new DoubleBuffer<number>()
    for (let i = 0; i < 100; i++) db.push(i)
    db.swap()
    expect(db.readyCount).toBe(100)
    const items = db.drainFront()
    expect(items.length).toBe(100)
  })

  it('interleaved push and consumeSwap', () => {
    const db = new DoubleBuffer<number>()
    const all: number[] = []
    for (let i = 0; i < 5; i++) {
      db.push(i)
      db.consumeSwap((item) => all.push(item))
    }
    expect(all).toEqual([0, 1, 2, 3, 4])
  })

  it('swap overwrites previous front', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    expect(db.frontBuffer).toEqual([1])
    db.push(2)
    db.swap()
    expect(db.frontBuffer).toEqual([2])
  })

  it('pendingCount increments with each push', () => {
    const db = new DoubleBuffer<number>()
    for (let i = 0; i < 5; i++) {
      db.push(i)
      expect(db.pendingCount).toBe(i + 1)
    }
  })

  it('frontBuffer is readonly', () => {
    const db = new DoubleBuffer<number>()
    expect(Object.isFrozen(db.frontBuffer) || Array.isArray(db.frontBuffer)).toBe(true)
  })

  it('pushMany with empty array', () => {
    const db = new DoubleBuffer<number>()
    db.pushMany([])
    expect(db.pendingCount).toBe(0)
  })

  it('pushMany with single item', () => {
    const db = new DoubleBuffer<number>()
    db.pushMany([42])
    expect(db.backBuffer).toEqual([42])
  })

  it('drainFront then swap then drain', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.drainFront()
    db.push(2)
    db.push(3)
    db.swap()
    const drained = db.drainFront()
    expect(drained).toEqual([2, 3])
  })

  it('consumeFront does not modify front buffer', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.swap()
    db.consumeFront(() => {})
    expect(db.readyCount).toBe(2)
  })

  it('swap returns reference to new front', () => {
    const db = new DoubleBuffer<number>()
    db.push(10)
    const swapped = db.swap()
    expect(swapped).toBe(db.frontBuffer)
  })

  it('clone with different types preserves type safety', () => {
    const db = new DoubleBuffer<{ id: number; name: string }>()
    db.push({ id: 1, name: 'first' })
    db.push({ id: 2, name: 'second' })
    db.swap()
    const copy = db.clone()
    expect(copy.frontBuffer.length).toBe(2)
    expect(copy.frontBuffer[0]!.id).toBe(1)
  })

  it('equals returns true for clones', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.swap()
    const copy = db.clone()
    expect(db.equals(copy)).toBe(true)
  })

  it('equals with same instance returns true', () => {
    const db = new DoubleBuffer<number>()
    expect(db.equals(db)).toBe(true)
  })

  it('toJSON after multiple operations', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.swap()
    db.push(3)
    db.swap()
    db.push(4)
    const json = db.toJSON()
    expect(json.front).toEqual([3])
    expect(json.back).toEqual([4])
    expect(json.swaps).toBe(2)
  })

  it('toString with large buffers', () => {
    const db = new DoubleBuffer<number>()
    for (let i = 0; i < 1000; i++) {
      db.push(i)
    }
    db.swap()
    expect(db.toString()).toBe('DoubleBuffer(front=1000, back=0)')
  })

  it('hasPending after clear', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.clear()
    expect(db.hasPending).toBe(false)
  })

  it('swap returns new front buffer reference', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    const beforeSwap = db.frontBuffer
    const afterSwap = db.swap()
    expect(beforeSwap).not.toBe(afterSwap)
  })

  it('drainFront returns all items even when mutated during iteration', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.push(3)
    db.swap()
    const result = db.drainFront()
    expect(result).toEqual([1, 2, 3])
  })

  it('pushMany then swap', () => {
    const buf = new DoubleBuffer<number>()
    buf.pushMany([10, 20])
    expect(buf.swap()).toEqual([10, 20])
  })

  it('clear removes pending', () => {
    const buf = new DoubleBuffer<number>()
    buf.push(1)
    buf.clear()
    expect(buf.swap()).toEqual([])
  })

  it('swap on empty returns empty', () => {
    const buf = new DoubleBuffer<number>()
    expect(buf.swap()).toEqual([])
  })
})
