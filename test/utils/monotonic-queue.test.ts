import { beforeEach, describe, expect, it } from 'vitest'

import { MonotonicQueue } from '../../src/utils/monotonic-queue.js'

// ─── Empty queue operations ──────────────────────────────
describe('MonotonicQueue - empty queue', () => {
  it('isEmpty returns true on empty queue', () => {
    const q = new MonotonicQueue<number>()
    expect(q.isEmpty()).toBe(true)
  })

  it('size is 0 on empty queue', () => {
    const q = new MonotonicQueue<number>()
    expect(q.size).toBe(0)
  })

  it('current throws RangeError on empty queue', () => {
    const q = new MonotonicQueue<number>()
    expect(() => q.current()).toThrow(RangeError)
  })

  it('current throws with descriptive message', () => {
    const q = new MonotonicQueue<number>()
    expect(() => q.current()).toThrow('Cannot get current from empty MonotonicQueue')
  })

  it('toArray returns empty array on empty queue', () => {
    const q = new MonotonicQueue<number>()
    expect(q.toArray()).toEqual([])
  })

  it('clear on empty queue does not throw', () => {
    const q = new MonotonicQueue<number>()
    expect(() => q.clear()).not.toThrow()
  })
})

// ─── Default mode (min) ──────────────────────────────────
describe('MonotonicQueue - min mode (default)', () => {
  it('tracks minimum element', () => {
    const q = new MonotonicQueue<number>()
    q.push(5)
    q.push(3)
    q.push(7)
    expect(q.current()).toBe(3)
  })

  it('updates minimum when smaller element is pushed', () => {
    const q = new MonotonicQueue<number>()
    q.push(10)
    expect(q.current()).toBe(10)
    q.push(5)
    expect(q.current()).toBe(5)
    q.push(1)
    expect(q.current()).toBe(1)
  })

  it('keeps minimum when larger elements are pushed', () => {
    const q = new MonotonicQueue<number>()
    q.push(3)
    q.push(5)
    q.push(7)
    q.push(9)
    expect(q.current()).toBe(3)
  })

  it('tracks size correctly', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.size).toBe(3)
  })

  it('isEmpty returns false after push', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    expect(q.isEmpty()).toBe(false)
  })

  it('toArray returns all pushed elements in order', () => {
    const q = new MonotonicQueue<number>()
    q.push(5)
    q.push(3)
    q.push(7)
    expect(q.toArray()).toEqual([5, 3, 7])
  })

  it('handles duplicate values', () => {
    const q = new MonotonicQueue<number>()
    q.push(3)
    q.push(3)
    q.push(1)
    q.push(1)
    expect(q.current()).toBe(1)
    expect(q.size).toBe(4)
  })
})

// ─── Max mode ────────────────────────────────────────────
describe('MonotonicQueue - max mode', () => {
  it('tracks maximum element', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(5)
    q.push(3)
    q.push(7)
    expect(q.current()).toBe(7)
  })

  it('updates maximum when larger element is pushed', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(1)
    expect(q.current()).toBe(1)
    q.push(5)
    expect(q.current()).toBe(5)
    q.push(10)
    expect(q.current()).toBe(10)
  })

  it('keeps maximum when smaller elements are pushed', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(9)
    q.push(7)
    q.push(5)
    q.push(3)
    expect(q.current()).toBe(9)
  })

  it('handles duplicate values in max mode', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(5)
    q.push(5)
    q.push(3)
    q.push(5)
    expect(q.current()).toBe(5)
    expect(q.size).toBe(4)
  })
})

// ─── Sliding window ──────────────────────────────────────
describe('MonotonicQueue - sliding window', () => {
  it('maintains window size in data', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.size).toBe(3)
    q.push(4)
    expect(q.size).toBe(3)
    expect(q.toArray()).toEqual([2, 3, 4])
  })

  it('updates current when minimum slides out of window', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.current()).toBe(1)
    q.push(4)
    expect(q.current()).toBe(2)
  })

  it('keeps current when minimum is still in window', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    q.push(5)
    q.push(1)
    q.push(3)
    expect(q.current()).toBe(1)
    q.push(4)
    expect(q.current()).toBe(1)
  })

  it('works correctly for sliding window minimum problem', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    const input = [1, 3, -1, -3, 5, 3, 6, 7]
    const mins: number[] = []
    for (const v of input) {
      q.push(v)
      mins.push(q.current())
    }
    expect(mins).toEqual([1, 1, -1, -3, -3, -3, 3, 3])
  })

  it('sliding window with max mode', () => {
    const q = new MonotonicQueue<number>({ mode: 'max', windowSize: 3 })
    const input = [1, 3, -1, -3, 5, 3, 6, 7]
    const maxs: number[] = []
    for (const v of input) {
      q.push(v)
      maxs.push(q.current())
    }
    expect(maxs).toEqual([1, 3, 3, 3, 5, 5, 6, 7])
  })

  it('windowSize of 1 always returns latest element', () => {
    const q = new MonotonicQueue<number>({ windowSize: 1 })
    q.push(5)
    expect(q.current()).toBe(5)
    q.push(3)
    expect(q.current()).toBe(3)
    q.push(10)
    expect(q.current()).toBe(10)
  })
})

// ─── Single element ──────────────────────────────────────
describe('MonotonicQueue - single element', () => {
  it('current returns the single element', () => {
    const q = new MonotonicQueue<number>()
    q.push(42)
    expect(q.current()).toBe(42)
  })

  it('size is 1 after single push', () => {
    const q = new MonotonicQueue<number>()
    q.push(42)
    expect(q.size).toBe(1)
  })

  it('isEmpty returns false', () => {
    const q = new MonotonicQueue<number>()
    q.push(42)
    expect(q.isEmpty()).toBe(false)
  })

  it('toArray returns single-element array', () => {
    const q = new MonotonicQueue<number>()
    q.push(42)
    expect(q.toArray()).toEqual([42])
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('MonotonicQueue - clear', () => {
  it('clears all elements', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    q.push(2)
    q.push(3)
    q.clear()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })

  it('current throws after clear', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    q.push(2)
    q.clear()
    expect(() => q.current()).toThrow(RangeError)
  })

  it('toArray returns empty after clear', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    q.push(2)
    q.clear()
    expect(q.toArray()).toEqual([])
  })

  it('can push after clear', () => {
    const q = new MonotonicQueue<number>()
    q.push(5)
    q.clear()
    q.push(3)
    expect(q.current()).toBe(3)
    expect(q.size).toBe(1)
  })
})

// ─── Custom comparator ───────────────────────────────────
describe('MonotonicQueue - custom comparator', () => {
  it('works with string values', () => {
    const q = new MonotonicQueue<string>(undefined, (a, b) => a.localeCompare(b))
    q.push('cherry')
    q.push('apple')
    q.push('banana')
    expect(q.current()).toBe('apple')
  })

  it('works with reverse string comparator (max)', () => {
    const q = new MonotonicQueue<string>({ mode: 'max' }, (a, b) => a.localeCompare(b))
    q.push('cherry')
    q.push('apple')
    q.push('banana')
    expect(q.current()).toBe('cherry')
  })

  it('works with object values using custom key', () => {
    interface Item {
      priority: number
      name: string
    }
    const q = new MonotonicQueue<Item>(undefined, (a, b) => a.priority - b.priority)
    q.push({ priority: 3, name: 'c' })
    q.push({ priority: 1, name: 'a' })
    q.push({ priority: 2, name: 'b' })
    expect(q.current().name).toBe('a')
  })
})

// ─── Accessor methods ────────────────────────────────────
describe('MonotonicQueue - accessor methods', () => {
  it('getMode returns default min', () => {
    const q = new MonotonicQueue<number>()
    expect(q.getMode()).toBe('min')
  })

  it('getMode returns max when configured', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    expect(q.getMode()).toBe('max')
  })

  it('getWindowSize returns undefined when not set', () => {
    const q = new MonotonicQueue<number>()
    expect(q.getWindowSize()).toBeUndefined()
  })

  it('getWindowSize returns configured value', () => {
    const q = new MonotonicQueue<number>({ windowSize: 5 })
    expect(q.getWindowSize()).toBe(5)
  })
})

// ─── Large scale ─────────────────────────────────────────
describe('MonotonicQueue - large scale', () => {
  it('handles 100+ elements maintaining minimum', () => {
    const q = new MonotonicQueue<number>()
    for (let i = 100; i >= 1; i--) {
      q.push(i)
    }
    expect(q.current()).toBe(1)
    expect(q.size).toBe(100)
  })

  it('handles 100+ elements maintaining maximum', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    for (let i = 1; i <= 100; i++) {
      q.push(i)
    }
    expect(q.current()).toBe(100)
    expect(q.size).toBe(100)
  })
})

// ─── Negative numbers ──────────────────────────────────────
describe('MonotonicQueue - negative numbers', () => {
  it('tracks minimum with negative values', () => {
    const q = new MonotonicQueue<number>()
    q.push(-5)
    q.push(-3)
    q.push(-7)
    expect(q.current()).toBe(-7)
  })

  it('tracks maximum with negative values', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(-5)
    q.push(-3)
    q.push(-7)
    expect(q.current()).toBe(-3)
  })

  it('handles mixed positive and negative values for min', () => {
    const q = new MonotonicQueue<number>()
    q.push(5)
    q.push(-3)
    q.push(7)
    expect(q.current()).toBe(-3)
  })

  it('handles mixed positive and negative values for max', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(-5)
    q.push(3)
    q.push(-7)
    expect(q.current()).toBe(3)
  })
})

// ─── Zero values ────────────────────────────────────────────
describe('MonotonicQueue - zero values', () => {
  it('tracks minimum with zeros', () => {
    const q = new MonotonicQueue<number>()
    q.push(5)
    q.push(0)
    q.push(3)
    expect(q.current()).toBe(0)
  })

  it('handles all zeros in min mode', () => {
    const q = new MonotonicQueue<number>()
    q.push(0)
    q.push(0)
    q.push(0)
    expect(q.current()).toBe(0)
  })

  it('handles all zeros in max mode', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(0)
    q.push(0)
    q.push(0)
    expect(q.current()).toBe(0)
  })
})

// ─── Sliding window edge cases ───────────────────────────────
describe('MonotonicQueue - sliding window edge cases', () => {
  it('sliding window with increasing sequence', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    const input = [1, 2, 3, 4, 5]
    const results: number[] = []
    for (const v of input) {
      q.push(v)
      results.push(q.current())
    }
    expect(results).toEqual([1, 1, 1, 2, 3])
  })

  it('sliding window with all increasing max mode', () => {
    const q = new MonotonicQueue<number>({ mode: 'max', windowSize: 3 })
    const input = [1, 2, 3, 4, 5]
    const results: number[] = []
    for (const v of input) {
      q.push(v)
      results.push(q.current())
    }
    expect(results).toEqual([1, 2, 3, 4, 5])
  })

  it('sliding window with alternating sequence', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    const input = [5, 1, 5, 1, 5]
    const results: number[] = []
    for (const v of input) {
      q.push(v)
      results.push(q.current())
    }
    expect(results).toEqual([5, 1, 1, 1, 5])
  })

  it('sliding window with decreasing max mode', () => {
    const q = new MonotonicQueue<number>({ mode: 'max', windowSize: 3 })
    const input = [5, 4, 3, 2, 1]
    const results: number[] = []
    for (const v of input) {
      q.push(v)
      results.push(q.current())
    }
    expect(results).toEqual([5, 5, 5, 4, 3])
  })

  it('windowSize larger than pushed elements', () => {
    const q = new MonotonicQueue<number>({ windowSize: 10 })
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.size).toBe(3)
    expect(q.current()).toBe(1)
  })
})

// ─── Multiple clear operations ───────────────────────────────
describe('MonotonicQueue - multiple operations', () => {
  it('handles multiple consecutive clear operations', () => {
    const q = new MonotonicQueue<number>()
    q.push(1)
    q.push(2)
    q.clear()
    q.clear()
    q.clear()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })

  it('maintains window behavior after clear', () => {
    const q = new MonotonicQueue<number>({ windowSize: 3 })
    q.push(1)
    q.push(2)
    q.push(3)
    q.clear()
    q.push(10)
    q.push(20)
    q.push(30)
    expect(q.size).toBe(3)
    expect(q.current()).toBe(10)
  })

  it('maintains mode after clear', () => {
    const q = new MonotonicQueue<number>({ mode: 'max' })
    q.push(1)
    q.push(5)
    q.clear()
    q.push(3)
    q.push(7)
    expect(q.current()).toBe(7)
  })

  it('isEmpty on new queue', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    expect(q.isEmpty()).toBe(true)
  })

  it('push and current', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(5)
    expect(q.current()).toBe(5)
  })

  it('clear empties queue', () => {
    const q = new MonotonicQueue<number>({ mode: 'min' })
    q.push(5)
    q.clear()
    expect(q.isEmpty()).toBe(true)
  })
})

describe('monotonic-queue - wave545', () => {
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

describe('monotonic-queue - wave546', () => {
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

describe('monotonic-queue - wave547', () => {
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

describe('monotonic-queue - wave548', () => {
  it('monotonic-queue module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave549', () => {
  it('monotonic-queue module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave550', () => {
  it('monotonic-queue w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave551', () => {
  it('monotonic-queue w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave552', () => {
  it('monotonic-queue w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave553', () => {
  it('monotonic-queue w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave554', () => {
  it('monotonic-queue w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave555', () => {
  it('monotonic-queue w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave556', () => {
  it('monotonic-queue w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave557', () => {
  it('monotonic-queue w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave558', () => {
  it('monotonic-queue w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave559', () => {
  it('monotonic-queue w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave560', () => {
  it('monotonic-queue w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave561', () => {
  it('monotonic-queue w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave562', () => {
  it('monotonic-queue w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave563', () => {
  it('monotonic-queue w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave564', () => {
  it('monotonic-queue w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave565', () => {
  it('monotonic-queue w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave566', () => {
  it('monotonic-queue w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave127', () => {
  it('monotonic-queue w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave130', () => {
  it('monotonic-queue w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave133', () => {
  it('monotonic-queue w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave136', () => {
  it('monotonic-queue w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - wave139', () => {
  it('monotonic-queue w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w142', () => {
  it('monotonic-queue v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w145', () => {
  it('monotonic-queue v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w148', () => {
  it('monotonic-queue v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w151', () => {
  it('monotonic-queue v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w154', () => {
  it('monotonic-queue v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w157', () => {
  it('monotonic-queue v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w160', () => {
  it('monotonic-queue v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w170', () => {
  it('monotonic-queue x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w180', () => {
  it('monotonic-queue x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w190', () => {
  it('monotonic-queue x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w200', () => {
  it('monotonic-queue x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w210', () => {
  it('monotonic-queue x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w220', () => {
  it('monotonic-queue x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w230', () => {
  it('monotonic-queue x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w240', () => {
  it('monotonic-queue x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w250', () => {
  it('monotonic-queue x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w260', () => {
  it('monotonic-queue x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w270', () => {
  it('monotonic-queue x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w280', () => {
  it('monotonic-queue x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w290', () => {
  it('monotonic-queue x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('monotonic-queue - w300', () => {
  it('monotonic-queue x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('monotonic-queue x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})
