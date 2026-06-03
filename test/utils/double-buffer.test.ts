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

  it('swap returns back buffer contents', () => {
    const db = new DoubleBuffer<string>()
    db.push('a')
    db.push('b')
    const swapped = db.swap()
    expect(swapped).toEqual(['a', 'b'])
    expect(db.frontBuffer).toEqual(['a', 'b'])
  })

  it('pendingCount tracks back buffer', () => {
    const db = new DoubleBuffer<number>()
    expect(db.pendingCount).toBe(0)
    db.push(1)
    expect(db.pendingCount).toBe(1)
    db.push(2)
    expect(db.pendingCount).toBe(2)
    db.swap()
    expect(db.pendingCount).toBe(0)
  })

  it('swap with no pending data', () => {
    const db = new DoubleBuffer<string>()
    db.swap()
    expect(db.pendingCount).toBe(0)
  })

  it('swap clears pending', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    db.swap()
    expect(db.pendingCount).toBe(0)
  })

  it('swap twice returns to empty pending', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.swap()
    db.push(2)
    db.swap()
    expect(db.pendingCount).toBe(0)
  })

  it('swap returns flushed items', () => {
    const db = new DoubleBuffer<number>()
    db.push(1)
    db.push(2)
    const items = db.swap()
    expect(items).toEqual([1, 2])
  })
})
