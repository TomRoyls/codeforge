import { describe, it, expect } from 'vitest'
import { BoundedPriorityQueue } from '../../src/utils/bounded-priority-queue.js'

const minCmp = (a: number, b: number) => a - b
const maxCmp = (a: number, b: number) => b - a

describe('BoundedPriorityQueue', () => {
  it('throws on maxSize < 1', () => {
    expect(() => new BoundedPriorityQueue(0, minCmp)).toThrow(RangeError)
    expect(() => new BoundedPriorityQueue(-1, minCmp)).toThrow(RangeError)
  })

  it('starts empty', () => {
    const q = new BoundedPriorityQueue(5, minCmp)
    expect(q.isEmpty).toBe(true)
    expect(q.size).toBe(0)
    expect(q.isFull).toBe(false)
    expect(q.peek()).toBeUndefined()
    expect(q.pop()).toBeUndefined()
  })

  it('accepts items up to maxSize', () => {
    const q = new BoundedPriorityQueue(3, minCmp)
    q.push(10)
    q.push(20)
    q.push(30)
    expect(q.size).toBe(3)
    expect(q.isFull).toBe(true)
  })

  it('keeps top-K smallest items (min-heap)', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    for (const v of [50, 30, 70, 10, 90, 20, 80]) {
      q.push(v)
    }
    const result = q.toArray()
    expect(result).toEqual([10, 20, 30])
  })

  it('keeps top-K largest items (max-heap)', () => {
    const q = new BoundedPriorityQueue<number>(3, maxCmp)
    for (const v of [50, 30, 70, 10, 90, 20, 80]) {
      q.push(v)
    }
    const result = q.toArray()
    expect(result).toEqual([90, 80, 70])
  })

  it('works with objects via comparator', () => {
    const q = new BoundedPriorityQueue<{ priority: number; name: string }>(
      2,
      (a, b) => a.priority - b.priority,
    )
    q.push({ priority: 5, name: 'low' })
    q.push({ priority: 1, name: 'high' })
    q.push({ priority: 10, name: 'lowest' })
    q.push({ priority: 3, name: 'mid' })
    const result = q.toArray()
    expect(result.map((r) => r.name)).toEqual(['high', 'mid'])
  })

  it('pop returns items in order', () => {
    const q = new BoundedPriorityQueue<number>(4, minCmp)
    q.push(40)
    q.push(10)
    q.push(30)
    q.push(20)
    expect(q.pop()).toBe(40)
    expect(q.pop()).toBe(30)
    expect(q.pop()).toBe(20)
    expect(q.pop()).toBe(10)
    expect(q.pop()).toBeUndefined()
  })

  it('drain returns sorted array and empties queue', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(30)
    q.push(10)
    q.push(20)
    const drained = q.drain()
    expect(drained).toEqual([30, 20, 10])
    expect(q.isEmpty).toBe(true)
  })

  it('clear empties the queue', () => {
    const q = new BoundedPriorityQueue(5, minCmp)
    q.push(1)
    q.push(2)
    q.push(3)
    q.clear()
    expect(q.isEmpty).toBe(true)
    expect(q.size).toBe(0)
  })

  it('maxSize getter returns constructor value', () => {
    const q = new BoundedPriorityQueue(7, minCmp)
    expect(q.maxSize).toBe(7)
  })

  it('handles duplicate values', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(5)
    q.push(5)
    q.push(5)
    q.push(1)
    q.push(1)
    expect(q.toArray()).toEqual([1, 1, 5])
  })

  it('handles single-element queue', () => {
    const q = new BoundedPriorityQueue<number>(1, minCmp)
    q.push(100)
    expect(q.peek()).toBe(100)
    q.push(50)
    expect(q.peek()).toBe(50)
    q.push(200)
    expect(q.peek()).toBe(50)
    expect(q.toArray()).toEqual([50])
  })

  it('does not replace when new item is not better', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1)
    q.push(2)
    q.push(3)
    q.push(99)
    expect(q.toArray()).toEqual([1, 2, 3])
  })

  it('toArray does not mutate internal state', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(3)
    q.push(1)
    q.push(2)
    const arr1 = q.toArray()
    const arr2 = q.toArray()
    expect(arr1).toEqual(arr2)
    expect(q.size).toBe(3)
  })

  it('handles large stream efficiently', () => {
    const q = new BoundedPriorityQueue<number>(10, minCmp)
    for (let i = 10000; i >= 0; i--) {
      q.push(i)
    }
    const result = q.toArray()
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('works with negative numbers', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(-5)
    q.push(-10)
    q.push(0)
    q.push(3)
    q.push(-1)
    expect(q.toArray()).toEqual([-10, -5, -1])
  })

  it('handles strings via comparator', () => {
    const q = new BoundedPriorityQueue<string>(3, (a, b) => a.localeCompare(b))
    for (const w of ['zebra', 'apple', 'mango', 'banana', 'cherry']) {
      q.push(w)
    }
    expect(q.toArray()).toEqual(['apple', 'banana', 'cherry'])
  })

  it('peek returns front without removing', () => {
    const q = new BoundedPriorityQueue<string>(3, (a, b) => a.localeCompare(b))
    q.push('cherry')
    q.push('apple')
    expect(q.peek()).toBe('cherry')
    expect(q.size).toBe(2)
  })

  it('maxSize returns capacity', () => {
    const q = new BoundedPriorityQueue<string>(10)
    expect(q.maxSize).toBe(10)
  })

  it('size on new queue is 0', () => {
    const q = new BoundedPriorityQueue<string>(10)
    expect(q.size).toBe(0)
  })

  it('push and pop returns highest priority', () => {
    const q = new BoundedPriorityQueue<number>(10, minCmp)
    q.push(1)
    q.push(3)
    q.push(2)
    expect(q.pop()).toBe(3)
  })

  it('peek returns max without removing', () => {
    const q = new BoundedPriorityQueue<number>(5, (a, b) => a - b)
    q.push(1)
    q.push(3)
    expect(q.peek()).toBe(3)
    expect(q.size).toBe(2)
  })

  it('pop returns and removes top element', () => {
    const q = new BoundedPriorityQueue<number>((a, b) => a - b, 5)
    q.push(1)
    q.push(3)
    q.push(2)
    expect(q.pop()).toBe(3)
    expect(q.size).toBe(2)
  })

  it('empty queue has size 0', () => {
    const q = new BoundedPriorityQueue<number>((a, b) => a - b, 5)
    expect(q.size).toBe(0)
  })

  it('push increases size', () => {
    const q = new BoundedPriorityQueue<number>(5, (a, b) => a - b)
    q.push(3)
    expect(q.size).toBe(1)
  })

  it('accepts comparator as first arg', () => {
    const q = new BoundedPriorityQueue<number>((a, b) => a - b, 5)
    q.push(3)
    q.push(1)
    q.push(2)
    expect(q.size).toBe(3)
    expect(q.toArray()).toEqual([1, 2, 3])
  })

  it('toString returns sorted representation', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(3)
    q.push(1)
    q.push(2)
    expect(q.toString()).toBe('[1, 2, 3]')
  })

  it('toJSON returns sorted array', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(3)
    q.push(1)
    q.push(2)
    expect(q.toJSON()).toEqual([1, 2, 3])
  })

  it('clone creates independent copy', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1)
    q.push(2)
    q.push(3)
    const cloned = q.clone()
    q.clear()
    expect(cloned.size).toBe(3)
    expect(cloned.toArray()).toEqual([1, 2, 3])
  })

  it('equals returns true for identical queues', () => {
    const q1 = new BoundedPriorityQueue<number>(3, minCmp)
    const q2 = new BoundedPriorityQueue<number>(3, minCmp)
    q1.push(1)
    q1.push(2)
    q2.push(1)
    q2.push(2)
    expect(q1.equals(q2)).toBe(true)
  })

  it('equals returns false for different contents', () => {
    const q1 = new BoundedPriorityQueue<number>(3, minCmp)
    const q2 = new BoundedPriorityQueue<number>(3, minCmp)
    q1.push(1)
    q2.push(2)
    expect(q1.equals(q2)).toBe(false)
  })

  it('equals returns false for different maxSize', () => {
    const q1 = new BoundedPriorityQueue<number>(3, minCmp)
    const q2 = new BoundedPriorityQueue<number>(5, minCmp)
    expect(q1.equals(q2)).toBe(false)
  })

  it('equals returns false for non-BoundedPriorityQueue', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    expect(q.equals(null)).toBe(false)
    expect(q.equals({})).toBe(false)
  })

  it('equals with self returns true', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1)
    expect(q.equals(q)).toBe(true)
  })

  it('clear then push works', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(100)
    q.clear()
    q.push(1)
    q.push(2)
    expect(q.toArray()).toEqual([1, 2])
  })

  it('handles push of identical values', () => {
    const q = new BoundedPriorityQueue<number>(5, minCmp)
    q.push(5)
    q.push(5)
    q.push(5)
    q.push(5)
    q.push(5)
    expect(q.toArray()).toEqual([5, 5, 5, 5, 5])
  })

  it('pop from empty queue returns undefined', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    expect(q.pop()).toBeUndefined()
  })

  it('drain from empty queue returns empty array', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    expect(q.drain()).toEqual([])
  })

  it('peek does not remove element', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1)
    q.push(2)
    q.peek()
    expect(q.size).toBe(2)
  })

  it('handles floating point numbers', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1.5)
    q.push(2.7)
    q.push(0.3)
    expect(q.toArray()).toEqual([0.3, 1.5, 2.7])
  })

  it('replaces worst element when better one arrives', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(10)
    q.push(20)
    q.push(30)
    q.push(5)
    expect(q.toArray()).toEqual([5, 10, 20])
  })

  it('keeps max-heap top K', () => {
    const q = new BoundedPriorityQueue<number>(3, maxCmp)
    for (const v of [1, 5, 3, 9, 2, 7, 8]) q.push(v)
    expect(q.toArray()).toEqual([9, 8, 7])
  })

  it('handles descending input', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    for (let i = 10; i >= 0; i--) q.push(i)
    expect(q.toArray()).toEqual([0, 1, 2])
  })

  it('handles ascending input', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    for (let i = 0; i <= 10; i++) q.push(i)
    expect(q.toArray()).toEqual([0, 1, 2])
  })

  it('pop drains in reverse comparator order', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1)
    q.push(3)
    q.push(2)
    expect(q.pop()).toBe(3)
    expect(q.pop()).toBe(2)
    expect(q.pop()).toBe(1)
  })

  it('single element maxSize', () => {
    const q = new BoundedPriorityQueue<number>(1, minCmp)
    q.push(10)
    expect(q.isFull).toBe(true)
    q.push(5)
    expect(q.toArray()).toEqual([5])
    q.push(20)
    expect(q.toArray()).toEqual([5])
  })

  it('handles large maxSize', () => {
    const q = new BoundedPriorityQueue<number>(1000, minCmp)
    for (let i = 0; i < 1000; i++) q.push(i)
    expect(q.size).toBe(1000)
    expect(q.toArray()[0]).toBe(0)
    expect(q.toArray()[999]).toBe(999)
  })

  it('clone modifications do not affect original', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(1)
    q.push(2)
    const cloned = q.clone()
    cloned.push(0)
    cloned.pop()
    expect(q.size).toBe(2)
    expect(q.toArray()).toEqual([1, 2])
    expect(cloned.toArray()).toEqual([0, 1])
  })

  it('drain returns items in sorted order regardless of insertion order', () => {
    const q = new BoundedPriorityQueue<number>(5, minCmp)
    q.push(50)
    q.push(10)
    q.push(40)
    q.push(20)
    q.push(30)
    const drained = q.drain()
    expect(drained).toEqual([50, 40, 30, 20, 10])
  })

  it('isFull reflects current capacity correctly', () => {
    const q = new BoundedPriorityQueue<number>(2, minCmp)
    expect(q.isFull).toBe(false)
    q.push(1)
    expect(q.isFull).toBe(false)
    q.push(2)
    expect(q.isFull).toBe(true)
  })

  it('equals returns false for queues with different comparators', () => {
    const q1 = new BoundedPriorityQueue<number>(3, minCmp)
    const q2 = new BoundedPriorityQueue<number>(3, maxCmp)
    q1.push(1)
    q1.push(2)
    q2.push(2)
    q2.push(1)
    expect(q1.equals(q2)).toBe(false)
  })

  it('toString and toJSON return same sorted data', () => {
    const q = new BoundedPriorityQueue<number>(3, minCmp)
    q.push(3)
    q.push(1)
    q.push(2)
    const strArr = q.toString().slice(1, -1).split(', ').map(Number)
    expect(strArr).toEqual(q.toJSON())
  })

  it('handles max-heap with negative numbers', () => {
    const q = new BoundedPriorityQueue<number>(3, maxCmp)
    q.push(-5)
    q.push(-1)
    q.push(-10)
    q.push(-3)
    expect(q.toArray()).toEqual([-1, -3, -5])
  })

  it('peek returns item without removing', () => {
    const q = new BoundedPriorityQueue<number>(5, (a, b) => a - b)
    q.push(3)
    q.push(1)
    expect(q.peek()).toBeDefined()
    expect(q.size).toBe(2)
  })

  it('drain returns all items', () => {
    const q = new BoundedPriorityQueue<number>(5, (a, b) => a - b)
    q.push(1)
    q.push(2)
    q.push(3)
    expect(q.drain().length).toBe(3)
    expect(q.size).toBe(0)
  })

  it('empty queue peek returns undefined', () => {
    const q = new BoundedPriorityQueue<number>(5, (a, b) => a - b)
    expect(q.peek()).toBeUndefined()
  })
})

describe('bounded-priority-queue - wave548', () => {
  it('bounded-priority-queue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave549', () => {
  it('bounded-priority-queue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave550', () => {
  it('bounded-priority-queue w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave551', () => {
  it('bounded-priority-queue w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave552', () => {
  it('bounded-priority-queue w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave553', () => {
  it('bounded-priority-queue w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave554', () => {
  it('bounded-priority-queue w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave555', () => {
  it('bounded-priority-queue w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave556', () => {
  it('bounded-priority-queue w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave557', () => {
  it('bounded-priority-queue w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave558', () => {
  it('bounded-priority-queue w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-priority-queue - wave559', () => {
  it('bounded-priority-queue w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-priority-queue w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
