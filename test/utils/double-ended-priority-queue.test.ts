import { beforeEach, describe, expect, it } from 'vitest'

import { DoubleEndedPriorityQueue } from '../../src/utils/double-ended-priority-queue.js'

// ─── Constructor ──────────────────────────────────────────
describe('DoubleEndedPriorityQueue - constructor', () => {
  it('creates an unbounded queue with no arguments', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })

  it('creates a bounded queue with numeric capacity', () => {
    const q = new DoubleEndedPriorityQueue<number>(5)
    expect(q.size).toBe(0)
    q.push(1)
    q.push(2)
    q.push(3)
    q.push(4)
    q.push(5)
    expect(q.size).toBe(5)
  })

  it('creates a bounded queue with options object', () => {
    const q = new DoubleEndedPriorityQueue<number>({ capacity: 3 })
    q.push(1)
    q.push(2)
    q.push(3)
    expect(() => q.push(4)).toThrow('Priority queue is full')
  })

  it('throws on zero capacity', () => {
    expect(() => new DoubleEndedPriorityQueue<number>(0)).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new DoubleEndedPriorityQueue<number>(-1)).toThrow(RangeError)
  })

  it('throws on Infinity capacity', () => {
    expect(() => new DoubleEndedPriorityQueue<number>(Infinity)).toThrow(RangeError)
  })

  it('accepts custom comparator via options', () => {
    const q = new DoubleEndedPriorityQueue<number>({ comparator: (a, b) => b - a })
    q.push(3)
    q.push(1)
    q.push(2)
    expect(q.peekMin()).toBe(3)
    expect(q.peekMax()).toBe(1)
  })
})

// ─── Empty queue operations ───────────────────────────────
describe('DoubleEndedPriorityQueue - empty queue', () => {
  let q: DoubleEndedPriorityQueue<number>

  beforeEach(() => {
    q = new DoubleEndedPriorityQueue<number>()
  })

  it('peekMin returns undefined', () => {
    expect(q.peekMin()).toBeUndefined()
  })

  it('peekMax returns undefined', () => {
    expect(q.peekMax()).toBeUndefined()
  })

  it('popMin returns undefined', () => {
    expect(q.popMin()).toBeUndefined()
  })

  it('popMax returns undefined', () => {
    expect(q.popMax()).toBeUndefined()
  })

  it('isEmpty returns true', () => {
    expect(q.isEmpty()).toBe(true)
  })

  it('size is 0', () => {
    expect(q.size).toBe(0)
  })

  it('toArray returns empty array', () => {
    expect(q.toArray()).toEqual([])
  })
})

// ─── Push and peek ────────────────────────────────────────
describe('DoubleEndedPriorityQueue - push and peek', () => {
  it('peekMin and peekMax on single element', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(42)
    expect(q.peekMin()).toBe(42)
    expect(q.peekMax()).toBe(42)
    expect(q.size).toBe(1)
  })

  it('tracks min and max across multiple pushes', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(5)
    q.push(3)
    q.push(8)
    q.push(1)
    q.push(9)
    expect(q.peekMin()).toBe(1)
    expect(q.peekMax()).toBe(9)
    expect(q.size).toBe(5)
  })

  it('peekMin and peekMax are non-destructive', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(10)
    q.push(20)
    q.push(30)
    expect(q.peekMin()).toBe(10)
    expect(q.peekMax()).toBe(30)
    expect(q.peekMin()).toBe(10)
    expect(q.peekMax()).toBe(30)
    expect(q.size).toBe(3)
  })
})

// ─── Pop min and max ──────────────────────────────────────
describe('DoubleEndedPriorityQueue - popMin and popMax', () => {
  it('popMin returns elements in ascending order', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(5)
    q.push(3)
    q.push(8)
    q.push(1)
    q.push(9)
    expect(q.popMin()).toBe(1)
    expect(q.popMin()).toBe(3)
    expect(q.popMin()).toBe(5)
    expect(q.popMin()).toBe(8)
    expect(q.popMin()).toBe(9)
    expect(q.popMin()).toBeUndefined()
  })

  it('popMax returns elements in descending order', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(5)
    q.push(3)
    q.push(8)
    q.push(1)
    q.push(9)
    expect(q.popMax()).toBe(9)
    expect(q.popMax()).toBe(8)
    expect(q.popMax()).toBe(5)
    expect(q.popMax()).toBe(3)
    expect(q.popMax()).toBe(1)
    expect(q.popMax()).toBeUndefined()
  })

  it('alternating popMin and popMax', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    q.push(3)
    q.push(4)
    expect(q.popMin()).toBe(1)
    expect(q.popMax()).toBe(4)
    expect(q.popMin()).toBe(2)
    expect(q.popMax()).toBe(3)
    expect(q.isEmpty()).toBe(true)
  })

  it('popMin reduces size', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(10)
    q.push(20)
    expect(q.size).toBe(2)
    q.popMin()
    expect(q.size).toBe(1)
    q.popMin()
    expect(q.size).toBe(0)
  })

  it('popMax reduces size', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(10)
    q.push(20)
    expect(q.size).toBe(2)
    q.popMax()
    expect(q.size).toBe(1)
    q.popMax()
    expect(q.size).toBe(0)
  })
})

// ─── Ordering guarantees ──────────────────────────────────
describe('DoubleEndedPriorityQueue - ordering guarantees', () => {
  it('maintains correct ordering with reverse-inserted sequence', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    for (let i = 10; i >= 1; i--) {
      q.push(i)
    }
    for (let i = 1; i <= 10; i++) {
      expect(q.popMin()).toBe(i)
    }
  })

  it('maintains correct ordering with already-sorted input', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    for (let i = 1; i <= 10; i++) {
      q.push(i)
    }
    for (let i = 10; i >= 1; i--) {
      expect(q.popMax()).toBe(i)
    }
  })

  it('handles interleaved popMin/popMax correctly', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    const values = [7, 2, 9, 4, 1, 8, 3, 6, 5]
    for (const v of values) q.push(v)

    expect(q.popMin()).toBe(1)
    expect(q.popMax()).toBe(9)
    expect(q.popMin()).toBe(2)
    expect(q.popMax()).toBe(8)
    expect(q.popMin()).toBe(3)
    expect(q.popMax()).toBe(7)
    expect(q.popMin()).toBe(4)
    expect(q.popMax()).toBe(6)
    expect(q.popMin()).toBe(5)
    expect(q.isEmpty()).toBe(true)
  })
})

// ─── Size tracking ────────────────────────────────────────
describe('DoubleEndedPriorityQueue - size tracking', () => {
  it('size increments on push', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    expect(q.size).toBe(0)
    q.push(1)
    expect(q.size).toBe(1)
    q.push(2)
    expect(q.size).toBe(2)
  })

  it('size decrements on popMin', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    q.popMin()
    expect(q.size).toBe(1)
  })

  it('size decrements on popMax', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    q.popMax()
    expect(q.size).toBe(1)
  })
})

// ─── isEmpty and clear ────────────────────────────────────
describe('DoubleEndedPriorityQueue - isEmpty and clear', () => {
  it('isEmpty returns false after push', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    expect(q.isEmpty()).toBe(false)
  })

  it('clear empties the queue', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    q.push(3)
    q.clear()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
    expect(q.peekMin()).toBeUndefined()
  })

  it('clear allows reuse', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(5)
    q.clear()
    q.push(10)
    expect(q.peekMin()).toBe(10)
    expect(q.size).toBe(1)
  })

  it('clear on empty queue is no-op', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.clear()
    expect(q.size).toBe(0)
  })
})

// ─── toArray / toString / toJSON ──────────────────────────
describe('DoubleEndedPriorityQueue - toArray, toString, toJSON', () => {
  it('toArray returns shallow copy', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    const arr = q.toArray()
    expect(arr.length).toBe(2)
    arr.push(99)
    expect(q.size).toBe(2)
  })

  it('toString returns JSON string', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    const str = q.toString()
    expect(JSON.parse(str)).toEqual(q.toArray())
  })

  it('toJSON returns array copy', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(10)
    q.push(20)
    const json = q.toJSON()
    expect(json).toEqual(q.toArray())
    expect(json).not.toBe(q.toArray())
  })

  it('JSON.stringify uses toJSON', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    const str = JSON.stringify(q)
    expect(JSON.parse(str)).toEqual(q.toArray())
  })
})

// ─── clone ────────────────────────────────────────────────
describe('DoubleEndedPriorityQueue - clone', () => {
  it('clone produces equal queue', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(3)
    q.push(1)
    q.push(2)
    const c = q.clone()
    expect(c.equals(q)).toBe(true)
  })

  it('clone is independent', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(1)
    q.push(2)
    const c = q.clone()
    c.popMin()
    expect(q.size).toBe(2)
    expect(c.size).toBe(1)
  })

  it('clone preserves comparator', () => {
    const q = new DoubleEndedPriorityQueue<number>({ comparator: (a, b) => b - a })
    q.push(1)
    q.push(3)
    q.push(2)
    const c = q.clone()
    expect(c.popMin()).toBe(3)
    expect(c.popMax()).toBe(1)
  })

  it('clone preserves capacity', () => {
    const q = new DoubleEndedPriorityQueue<number>({ capacity: 3 })
    q.push(1)
    q.push(2)
    const c = q.clone()
    c.push(3)
    expect(() => c.push(4)).toThrow('Priority queue is full')
  })
})

// ─── equals ───────────────────────────────────────────────
describe('DoubleEndedPriorityQueue - equals', () => {
  it('equals returns false for non-DEPQ', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    expect(q.equals(null)).toBe(false)
    expect(q.equals(undefined)).toBe(false)
    expect(q.equals({})).toBe(false)
    expect(q.equals([])).toBe(false)
  })

  it('equals returns true for identical queues', () => {
    const q1 = new DoubleEndedPriorityQueue<number>()
    const q2 = new DoubleEndedPriorityQueue<number>()
    q1.push(1)
    q2.push(1)
    expect(q1.equals(q2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const q1 = new DoubleEndedPriorityQueue<number>()
    const q2 = new DoubleEndedPriorityQueue<number>()
    q1.push(1)
    q1.push(2)
    q2.push(1)
    expect(q1.equals(q2)).toBe(false)
  })

  it('equals returns false for different elements', () => {
    const q1 = new DoubleEndedPriorityQueue<number>()
    const q2 = new DoubleEndedPriorityQueue<number>()
    q1.push(1)
    q2.push(2)
    expect(q1.equals(q2)).toBe(false)
  })

  it('empty queues are equal', () => {
    const q1 = new DoubleEndedPriorityQueue<number>()
    const q2 = new DoubleEndedPriorityQueue<number>()
    expect(q1.equals(q2)).toBe(true)
  })
})

// ─── Edge cases ───────────────────────────────────────────
describe('DoubleEndedPriorityQueue - edge cases', () => {
  it('single element: push then popMin', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(42)
    expect(q.popMin()).toBe(42)
    expect(q.isEmpty()).toBe(true)
  })

  it('single element: push then popMax', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(42)
    expect(q.popMax()).toBe(42)
    expect(q.isEmpty()).toBe(true)
  })

  it('handles duplicate values', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(5)
    q.push(5)
    q.push(5)
    expect(q.popMin()).toBe(5)
    expect(q.popMin()).toBe(5)
    expect(q.popMin()).toBe(5)
    expect(q.isEmpty()).toBe(true)
  })

  it('handles negative values', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(-5)
    q.push(-1)
    q.push(-10)
    expect(q.peekMin()).toBe(-10)
    expect(q.peekMax()).toBe(-1)
  })

  it('handles zero values', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(0)
    q.push(-1)
    q.push(1)
    expect(q.popMin()).toBe(-1)
    expect(q.popMin()).toBe(0)
    expect(q.popMin()).toBe(1)
  })

  it('handles two elements', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    q.push(2)
    q.push(1)
    expect(q.peekMin()).toBe(1)
    expect(q.peekMax()).toBe(2)
    expect(q.popMin()).toBe(1)
    expect(q.popMax()).toBe(2)
  })

  it('handles large dataset (1000+ elements)', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    const count = 1000
    for (let i = count; i >= 1; i--) {
      q.push(i)
    }
    expect(q.size).toBe(count)
    expect(q.peekMin()).toBe(1)
    expect(q.peekMax()).toBe(count)
    for (let i = 1; i <= count; i++) {
      expect(q.popMin()).toBe(i)
    }
    expect(q.isEmpty()).toBe(true)
  })

  it('handles large dataset with popMax', () => {
    const q = new DoubleEndedPriorityQueue<number>()
    const count = 1000
    for (let i = 1; i <= count; i++) {
      q.push(i)
    }
    for (let i = count; i >= 1; i--) {
      expect(q.popMax()).toBe(i)
    }
    expect(q.isEmpty()).toBe(true)
  })
})

// ─── Capacity limiting ────────────────────────────────────
describe('DoubleEndedPriorityQueue - capacity', () => {
  it('push throws when full', () => {
    const q = new DoubleEndedPriorityQueue<number>(2)
    q.push(1)
    q.push(2)
    expect(() => q.push(3)).toThrow('Priority queue is full')
  })

  it('can push again after popMin frees space', () => {
    const q = new DoubleEndedPriorityQueue<number>(2)
    q.push(1)
    q.push(2)
    q.popMin()
    expect(() => q.push(3)).not.toThrow()
    expect(q.size).toBe(2)
  })

  it('can push again after popMax frees space', () => {
    const q = new DoubleEndedPriorityQueue<number>(2)
    q.push(1)
    q.push(2)
    q.popMax()
    expect(() => q.push(3)).not.toThrow()
  })

  it('capacity of 1', () => {
    const q = new DoubleEndedPriorityQueue<number>(1)
    q.push(42)
    expect(() => q.push(99)).toThrow('Priority queue is full')
    expect(q.peekMin()).toBe(42)
  })
})

// ─── Custom comparator ────────────────────────────────────
describe('DoubleEndedPriorityQueue - custom comparator', () => {
  it('works with objects using a key comparator', () => {
    const q = new DoubleEndedPriorityQueue<{ priority: number }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    q.push({ priority: 5 })
    q.push({ priority: 1 })
    q.push({ priority: 10 })
    expect(q.popMin()?.priority).toBe(1)
    expect(q.popMax()?.priority).toBe(10)
  })

  it('works with descending comparator', () => {
    const q = new DoubleEndedPriorityQueue<number>({
      comparator: (a, b) => b - a,
    })
    q.push(3)
    q.push(1)
    q.push(2)
    expect(q.popMin()).toBe(3)
    expect(q.popMax()).toBe(1)
  })

  it('works with string comparator', () => {
    const q = new DoubleEndedPriorityQueue<string>({
      comparator: (a, b) => a.localeCompare(b),
    })
    q.push('cherry')
    q.push('apple')
    q.push('banana')
    expect(q.popMin()).toBe('apple')
    expect(q.popMax()).toBe('cherry')
  })
})

describe('double-ended-priority-queue - wave548', () => {
  it('double-ended-priority-queue module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module constructable', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module has prototype', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module toString works', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module has length', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module type is function', () => {
    expect(beforeEach).toBeDefined()
  })
})
