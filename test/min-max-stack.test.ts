import { describe, it, expect } from 'vitest'
import { MinMaxStack } from '../src/utils/min-max-stack.js'

// ─── Constructor ───

describe('MinMaxStack', () => {
  it('creates empty stack with default compare', () => {
    const s = new MinMaxStack<number>()
    expect(s.size).toBe(0)
    expect(s.isEmpty()).toBe(true)
  })

  it('creates with custom comparator', () => {
    const s = new MinMaxStack<{ val: number }>((a, b) => a.val - b.val)
    s.push({ val: 3 })
    s.push({ val: 1 })
    expect(s.min().val).toBe(1)
    expect(s.max().val).toBe(3)
  })

  // ─── push ───

  it('pushes values and updates size', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    expect(s.size).toBe(1)
    s.push(2)
    expect(s.size).toBe(2)
  })

  it('pushes values making stack non-empty', () => {
    const s = new MinMaxStack<number>()
    s.push(5)
    expect(s.isEmpty()).toBe(false)
  })

  // ─── pop ───

  it('pops values in LIFO order', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(2)
    s.push(3)
    expect(s.pop()).toBe(3)
    expect(s.pop()).toBe(2)
    expect(s.pop()).toBe(1)
  })

  it('throws RangeError on pop from empty', () => {
    const s = new MinMaxStack<number>()
    expect(() => s.pop()).toThrow(RangeError)
  })

  it('updates size after pop', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(2)
    s.pop()
    expect(s.size).toBe(1)
  })

  // ─── peek ───

  it('peeks at top value without removing', () => {
    const s = new MinMaxStack<number>()
    s.push(10)
    s.push(20)
    expect(s.peek()).toBe(20)
    expect(s.size).toBe(2)
  })

  it('throws RangeError on peek empty', () => {
    const s = new MinMaxStack<number>()
    expect(() => s.peek()).toThrow(RangeError)
  })

  // ─── min ───

  it('tracks minimum with ascending values', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(2)
    s.push(3)
    expect(s.min()).toBe(1)
  })

  it('tracks minimum with descending values', () => {
    const s = new MinMaxStack<number>()
    s.push(3)
    s.push(2)
    s.push(1)
    expect(s.min()).toBe(1)
  })

  it('tracks minimum with mixed values', () => {
    const s = new MinMaxStack<number>()
    s.push(5)
    s.push(2)
    s.push(8)
    s.push(1)
    s.push(3)
    expect(s.min()).toBe(1)
  })

  it('updates minimum after popping min', () => {
    const s = new MinMaxStack<number>()
    s.push(5)
    s.push(1)
    s.push(3)
    s.pop()
    expect(s.min()).toBe(1)
    s.pop()
    expect(s.min()).toBe(5)
  })

  it('throws RangeError on min of empty', () => {
    const s = new MinMaxStack<number>()
    expect(() => s.min()).toThrow(RangeError)
  })

  it('handles negative numbers', () => {
    const s = new MinMaxStack<number>()
    s.push(-1)
    s.push(-5)
    s.push(-3)
    expect(s.min()).toBe(-5)
  })

  // ─── max ───

  it('tracks maximum with ascending values', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(2)
    s.push(3)
    expect(s.max()).toBe(3)
  })

  it('tracks maximum with descending values', () => {
    const s = new MinMaxStack<number>()
    s.push(3)
    s.push(2)
    s.push(1)
    expect(s.max()).toBe(3)
  })

  it('tracks maximum with mixed values', () => {
    const s = new MinMaxStack<number>()
    s.push(5)
    s.push(2)
    s.push(8)
    s.push(1)
    s.push(3)
    expect(s.max()).toBe(8)
  })

  it('updates maximum after popping max', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(5)
    s.push(3)
    s.pop()
    expect(s.max()).toBe(5)
    s.pop()
    expect(s.max()).toBe(1)
  })

  it('throws RangeError on max of empty', () => {
    const s = new MinMaxStack<number>()
    expect(() => s.max()).toThrow(RangeError)
  })

  it('handles negative numbers', () => {
    const s = new MinMaxStack<number>()
    s.push(-1)
    s.push(-5)
    s.push(-3)
    expect(s.max()).toBe(-1)
  })

  // ─── size / isEmpty ───

  it('size tracks push/pop correctly', () => {
    const s = new MinMaxStack<number>()
    expect(s.size).toBe(0)
    s.push(1)
    expect(s.size).toBe(1)
    s.push(2)
    expect(s.size).toBe(2)
    s.pop()
    expect(s.size).toBe(1)
  })

  it('isEmpty toggles correctly', () => {
    const s = new MinMaxStack<number>()
    expect(s.isEmpty()).toBe(true)
    s.push(1)
    expect(s.isEmpty()).toBe(false)
    s.pop()
    expect(s.isEmpty()).toBe(true)
  })

  // ─── clear ───

  it('clears all elements', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(2)
    s.push(3)
    s.clear()
    expect(s.size).toBe(0)
    expect(s.isEmpty()).toBe(true)
  })

  it('allows operations after clear', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.clear()
    s.push(10)
    expect(s.peek()).toBe(10)
    expect(s.min()).toBe(10)
    expect(s.max()).toBe(10)
  })

  // ─── toArray ───

  it('returns array bottom to top', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(2)
    s.push(3)
    expect(s.toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array for empty stack', () => {
    const s = new MinMaxStack<number>()
    expect(s.toArray()).toEqual([])
  })

  it('returns copy not reference', () => {
    const s = new MinMaxStack<number>()
    s.push(1)
    s.push(2)
    const arr = s.toArray()
    arr.push(999)
    expect(s.size).toBe(2)
  })

  // ─── Min/Max after series of operations ───

  it('tracks min/max through push-pop sequence', () => {
    const s = new MinMaxStack<number>()
    s.push(3)
    expect(s.min()).toBe(3)
    expect(s.max()).toBe(3)

    s.push(1)
    expect(s.min()).toBe(1)
    expect(s.max()).toBe(3)

    s.push(4)
    expect(s.min()).toBe(1)
    expect(s.max()).toBe(4)

    s.pop()
    expect(s.min()).toBe(1)
    expect(s.max()).toBe(3)

    s.pop()
    expect(s.min()).toBe(3)
    expect(s.max()).toBe(3)
  })

  it('handles duplicate values', () => {
    const s = new MinMaxStack<number>()
    s.push(5)
    s.push(5)
    s.push(5)
    expect(s.min()).toBe(5)
    expect(s.max()).toBe(5)
    s.pop()
    expect(s.min()).toBe(5)
    expect(s.max()).toBe(5)
  })

  it('handles single element', () => {
    const s = new MinMaxStack<number>()
    s.push(42)
    expect(s.min()).toBe(42)
    expect(s.max()).toBe(42)
    expect(s.peek()).toBe(42)
  })

  // ─── Custom comparator ───

  it('works with string comparator', () => {
    const s = new MinMaxStack<string>((a, b) => a.localeCompare(b))
    s.push('cherry')
    s.push('apple')
    s.push('banana')
    expect(s.min()).toBe('apple')
    expect(s.max()).toBe('cherry')
  })

  // ─── Edge cases ───

  it('handles floating point numbers', () => {
    const s = new MinMaxStack<number>()
    s.push(1.5)
    s.push(0.3)
    s.push(2.7)
    expect(s.min()).toBeCloseTo(0.3)
    expect(s.max()).toBeCloseTo(2.7)
  })

  it('handles zero values', () => {
    const s = new MinMaxStack<number>()
    s.push(0)
    s.push(-1)
    s.push(1)
    expect(s.min()).toBe(-1)
    expect(s.max()).toBe(1)
  })

  it('handles large dataset', () => {
    const s = new MinMaxStack<number>()
    for (let i = 0; i < 1000; i++) {
      s.push(i)
    }
    expect(s.size).toBe(1000)
    expect(s.min()).toBe(0)
    expect(s.max()).toBe(999)
  })

  it('handles alternating push/pop', () => {
    const s = new MinMaxStack<number>()
    s.push(10)
    s.push(5)
    s.pop()
    s.push(20)
    s.push(3)
    s.pop()
    expect(s.toArray()).toEqual([10, 20])
    expect(s.min()).toBe(10)
    expect(s.max()).toBe(20)
  })
})
