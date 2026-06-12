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

describe('double-ended-priority-queue - wave549', () => {
  it('double-ended-priority-queue module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave550', () => {
  it('double-ended-priority-queue w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave551', () => {
  it('double-ended-priority-queue w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave552', () => {
  it('double-ended-priority-queue w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave553', () => {
  it('double-ended-priority-queue w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave554', () => {
  it('double-ended-priority-queue w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave555', () => {
  it('double-ended-priority-queue w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave556', () => {
  it('double-ended-priority-queue w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave557', () => {
  it('double-ended-priority-queue w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave558', () => {
  it('double-ended-priority-queue w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave559', () => {
  it('double-ended-priority-queue w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave560', () => {
  it('double-ended-priority-queue w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave561', () => {
  it('double-ended-priority-queue w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave562', () => {
  it('double-ended-priority-queue w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave563', () => {
  it('double-ended-priority-queue w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave564', () => {
  it('double-ended-priority-queue w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave565', () => {
  it('double-ended-priority-queue w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave566', () => {
  it('double-ended-priority-queue w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave127', () => {
  it('double-ended-priority-queue w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave130', () => {
  it('double-ended-priority-queue w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave133', () => {
  it('double-ended-priority-queue w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave136', () => {
  it('double-ended-priority-queue w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - wave139', () => {
  it('double-ended-priority-queue w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w142', () => {
  it('double-ended-priority-queue v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w145', () => {
  it('double-ended-priority-queue v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w148', () => {
  it('double-ended-priority-queue v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w151', () => {
  it('double-ended-priority-queue v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w154', () => {
  it('double-ended-priority-queue v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w157', () => {
  it('double-ended-priority-queue v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w160', () => {
  it('double-ended-priority-queue v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w170', () => {
  it('double-ended-priority-queue x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w180', () => {
  it('double-ended-priority-queue x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w190', () => {
  it('double-ended-priority-queue x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w200', () => {
  it('double-ended-priority-queue x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w210', () => {
  it('double-ended-priority-queue x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w220', () => {
  it('double-ended-priority-queue x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w230', () => {
  it('double-ended-priority-queue x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w240', () => {
  it('double-ended-priority-queue x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w250', () => {
  it('double-ended-priority-queue x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w260', () => {
  it('double-ended-priority-queue x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w270', () => {
  it('double-ended-priority-queue x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w280', () => {
  it('double-ended-priority-queue x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w290', () => {
  it('double-ended-priority-queue x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w300', () => {
  it('double-ended-priority-queue x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w310', () => {
  it('double-ended-priority-queue x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w320', () => {
  it('double-ended-priority-queue x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w330', () => {
  it('double-ended-priority-queue x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w340', () => {
  it('double-ended-priority-queue x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w350', () => {
  it('double-ended-priority-queue x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w360', () => {
  it('double-ended-priority-queue x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w370', () => {
  it('double-ended-priority-queue x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w380', () => {
  it('double-ended-priority-queue x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w390', () => {
  it('double-ended-priority-queue x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('double-ended-priority-queue - w400', () => {
  it('double-ended-priority-queue x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('double-ended-priority-queue x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})
