import { describe, it, expect } from 'vitest'
import { MinDeque } from '../../src/core/min-deque/index.js'

// ─── Constructor ───

describe('MinDeque: constructor', () => {
  it('creates an empty deque with default capacity', () => {
    const dq = new MinDeque<number>()
    expect(dq.size).toBe(0)
    expect(dq.isEmpty).toBe(true)
  })

  it('respects custom capacity option', () => {
    const dq = new MinDeque<number>({ capacity: 4 })
    expect(dq.size).toBe(0)
  })

  it('clamps capacity to at least 1', () => {
    const dq = new MinDeque<number>({ capacity: 0 })
    dq.pushBack(42)
    expect(dq.size).toBe(1)
    expect(dq.back()).toBe(42)
  })

  it('accepts a custom comparator', () => {
    const dq = new MinDeque<string>({
      comparator: (a, b) => a.length - b.length,
    })
    dq.pushBack('a')
    dq.pushBack('bbb')
    dq.pushBack('cc')
    expect(dq.min()).toBe('a')
    expect(dq.max()).toBe('bbb')
  })
})

// ─── pushBack ───

describe('MinDeque: pushBack', () => {
  it('adds elements to the back', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
    expect(dq.size).toBe(3)
    expect(dq.isEmpty).toBe(false)
  })

  it('tracks min correctly after pushBack', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(5)
    expect(dq.min()).toBe(5)
    dq.pushBack(3)
    expect(dq.min()).toBe(3)
    dq.pushBack(7)
    expect(dq.min()).toBe(3)
    dq.pushBack(1)
    expect(dq.min()).toBe(1)
  })

  it('tracks max correctly after pushBack', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(5)
    expect(dq.max()).toBe(5)
    dq.pushBack(8)
    expect(dq.max()).toBe(8)
    dq.pushBack(2)
    expect(dq.max()).toBe(8)
  })

  it('handles duplicates', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(3)
    dq.pushBack(3)
    dq.pushBack(3)
    expect(dq.min()).toBe(3)
    expect(dq.max()).toBe(3)
    expect(dq.size).toBe(3)
  })

  it('handles negative numbers', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(-5)
    dq.pushBack(-1)
    dq.pushBack(-10)
    expect(dq.min()).toBe(-10)
    expect(dq.max()).toBe(-1)
  })
})

// ─── pushFront ───

describe('MinDeque: pushFront', () => {
  it('adds elements to the front', () => {
    const dq = new MinDeque<number>()
    dq.pushFront(1)
    dq.pushFront(2)
    dq.pushFront(3)
    expect(dq.toArray()).toEqual([3, 2, 1])
  })

  it('tracks min correctly after pushFront', () => {
    const dq = new MinDeque<number>()
    dq.pushFront(5)
    expect(dq.min()).toBe(5)
    dq.pushFront(2)
    expect(dq.min()).toBe(2)
    dq.pushFront(10)
    expect(dq.min()).toBe(2)
  })

  it('tracks max correctly after pushFront', () => {
    const dq = new MinDeque<number>()
    dq.pushFront(5)
    dq.pushFront(10)
    expect(dq.max()).toBe(10)
    dq.pushFront(3)
    expect(dq.max()).toBe(10)
  })

  it('handles duplicates via pushFront', () => {
    const dq = new MinDeque<number>()
    dq.pushFront(4)
    dq.pushFront(4)
    expect(dq.min()).toBe(4)
    expect(dq.max()).toBe(4)
    expect(dq.size).toBe(2)
  })
})

// ─── popBack ───

describe('MinDeque: popBack', () => {
  it('removes and returns the last element', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.popBack()).toBe(3)
    expect(dq.toArray()).toEqual([1, 2])
  })

  it('returns undefined when empty', () => {
    const dq = new MinDeque<number>()
    expect(dq.popBack()).toBeUndefined()
  })

  it('updates min after popping the minimum', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(5)
    dq.pushBack(3)
    expect(dq.min()).toBe(1)
    expect(dq.popBack()).toBe(3)
    expect(dq.min()).toBe(1)
  })

  it('updates max after popping the maximum', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(5)
    dq.pushBack(3)
    expect(dq.popBack()).toBe(3)
    expect(dq.max()).toBe(5)
  })

  it('pops all elements correctly', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(10)
    dq.pushBack(20)
    expect(dq.popBack()).toBe(20)
    expect(dq.popBack()).toBe(10)
    expect(dq.popBack()).toBeUndefined()
    expect(dq.isEmpty).toBe(true)
  })
})

// ─── popFront ───

describe('MinDeque: popFront', () => {
  it('removes and returns the first element', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.popFront()).toBe(1)
    expect(dq.toArray()).toEqual([2, 3])
  })

  it('returns undefined when empty', () => {
    const dq = new MinDeque<number>()
    expect(dq.popFront()).toBeUndefined()
  })

  it('updates min after popping the minimum at front', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(5)
    dq.pushBack(3)
    expect(dq.popFront()).toBe(1)
    expect(dq.min()).toBe(3)
  })

  it('updates max after popping the maximum at front', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(10)
    dq.pushBack(5)
    dq.pushBack(8)
    expect(dq.popFront()).toBe(10)
    expect(dq.max()).toBe(8)
  })

  it('pops all elements correctly', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(10)
    dq.pushBack(20)
    expect(dq.popFront()).toBe(10)
    expect(dq.popFront()).toBe(20)
    expect(dq.popFront()).toBeUndefined()
    expect(dq.isEmpty).toBe(true)
  })
})

// ─── front / back ───

describe('MinDeque: front and back', () => {
  it('returns undefined on empty deque', () => {
    const dq = new MinDeque<number>()
    expect(dq.front()).toBeUndefined()
    expect(dq.back()).toBeUndefined()
  })

  it('returns the first and last elements', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(10)
    dq.pushBack(20)
    dq.pushBack(30)
    expect(dq.front()).toBe(10)
    expect(dq.back()).toBe(30)
  })

  it('returns the same element for single-element deque', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(42)
    expect(dq.front()).toBe(42)
    expect(dq.back()).toBe(42)
  })
})

// ─── min / max ───

describe('MinDeque: min and max', () => {
  it('returns undefined on empty deque', () => {
    const dq = new MinDeque<number>()
    expect(dq.min()).toBeUndefined()
    expect(dq.max()).toBeUndefined()
  })

  it('tracks min and max through a sequence of operations', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(3)
    dq.pushBack(1)
    dq.pushBack(4)
    dq.pushBack(1)
    dq.pushBack(5)
    expect(dq.min()).toBe(1)
    expect(dq.max()).toBe(5)
    dq.popFront()
    expect(dq.min()).toBe(1)
    expect(dq.max()).toBe(5)
    dq.popFront()
    expect(dq.min()).toBe(1)
    expect(dq.max()).toBe(5)
  })
})

// ─── clear ───

describe('MinDeque: clear', () => {
  it('removes all elements', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.clear()
    expect(dq.size).toBe(0)
    expect(dq.isEmpty).toBe(true)
    expect(dq.toArray()).toEqual([])
    expect(dq.min()).toBeUndefined()
    expect(dq.max()).toBeUndefined()
  })

  it('allows reuse after clear', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.clear()
    dq.pushBack(99)
    expect(dq.size).toBe(1)
    expect(dq.min()).toBe(99)
  })
})

// ─── toArray ───

describe('MinDeque: toArray', () => {
  it('returns an empty array for empty deque', () => {
    const dq = new MinDeque<number>()
    expect(dq.toArray()).toEqual([])
  })

  it('returns elements in order', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('returns a snapshot (not a live reference)', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    const arr = dq.toArray()
    arr.push(999)
    expect(dq.size).toBe(1)
  })
})

// ─── forEach ───

describe('MinDeque: forEach', () => {
  it('iterates over all elements in order', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(10)
    dq.pushBack(20)
    dq.pushBack(30)
    const result: number[] = []
    dq.forEach((v, i) => result.push(v + i))
    expect(result).toEqual([10, 21, 32])
  })

  it('does nothing on empty deque', () => {
    const dq = new MinDeque<number>()
    let called = false
    dq.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

// ─── iterator ───

describe('MinDeque: Symbol.iterator', () => {
  it('is iterable', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect([...dq]).toEqual([1, 2, 3])
  })

  it('works with empty deque', () => {
    const dq = new MinDeque<number>()
    expect([...dq]).toEqual([])
  })
})

// ─── static slidingWindowMin ───

describe('MinDeque: slidingWindowMin', () => {
  it('returns sliding window minimums', () => {
    const result = MinDeque.slidingWindowMin([4, 2, 1, 3, 5], 3)
    expect(result).toEqual([1, 1, 1])
  })

  it('returns empty for windowSize > array length', () => {
    expect(MinDeque.slidingWindowMin([1, 2], 5)).toEqual([])
  })

  it('returns empty for windowSize <= 0', () => {
    expect(MinDeque.slidingWindowMin([1, 2, 3], 0)).toEqual([])
    expect(MinDeque.slidingWindowMin([1, 2, 3], -1)).toEqual([])
  })

  it('returns empty for empty array', () => {
    expect(MinDeque.slidingWindowMin([], 1)).toEqual([])
  })

  it('handles windowSize equal to array length', () => {
    expect(MinDeque.slidingWindowMin([3, 1, 2], 3)).toEqual([1])
  })
})

// ─── static slidingWindowMax ───

describe('MinDeque: slidingWindowMax', () => {
  it('returns sliding window maximums', () => {
    const result = MinDeque.slidingWindowMax([1, 3, 2, 5, 4], 3)
    expect(result).toEqual([3, 5, 5])
  })

  it('returns empty for windowSize > array length', () => {
    expect(MinDeque.slidingWindowMax([1, 2], 5)).toEqual([])
  })

  it('handles single-element windows', () => {
    expect(MinDeque.slidingWindowMax([3, 1, 4], 1)).toEqual([3, 1, 4])
  })
})

// ─── Growth and wraparound ───

describe('MinDeque: capacity growth', () => {
  it('grows beyond initial capacity', () => {
    const dq = new MinDeque<number>({ capacity: 2 })
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.pushBack(4)
    dq.pushBack(5)
    expect(dq.toArray()).toEqual([1, 2, 3, 4, 5])
    expect(dq.size).toBe(5)
    expect(dq.min()).toBe(1)
    expect(dq.max()).toBe(5)
  })

  it('handles interleaved pushFront/pushBack/popFront/popBack', () => {
    const dq = new MinDeque<number>()
    dq.pushBack(3)
    dq.pushFront(1)
    dq.pushBack(5)
    dq.pushFront(0)
    expect(dq.toArray()).toEqual([0, 1, 3, 5])
    expect(dq.popFront()).toBe(0)
    expect(dq.popBack()).toBe(5)
    expect(dq.toArray()).toEqual([1, 3])
  })
})
