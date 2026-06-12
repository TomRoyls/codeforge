import { describe, it, expect } from 'vitest'
import { PriorityQueue } from '../../src/utils/priority-queue.js'

// ─── Constructor ──────────────────────────────────────────
describe('PriorityQueue - constructor', () => {
  it('creates with default comparator (min-heap)', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
  })

  it('creates with custom comparator (max-heap)', () => {
    const pq = new PriorityQueue<number>({ comparator: (a, b) => b - a })
    pq.enqueue(1)
    pq.enqueue(3)
    pq.enqueue(2)
    expect(pq.peek()).toBe(3)
  })
})

// ─── Enqueue and Dequeue ──────────────────────────────────
describe('PriorityQueue - enqueue and dequeue', () => {
  it('returns items in priority order', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(1)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(5)
  })

  it('returns undefined for empty dequeue', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.dequeue()).toBeUndefined()
  })

  it('handles single element', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(42)
    expect(pq.peek()).toBe(42)
    expect(pq.dequeue()).toBe(42)
    expect(pq.isEmpty()).toBe(true)
  })

  it('handles duplicates', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(1)
    pq.enqueue(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(1)
  })
})

// ─── Peek ─────────────────────────────────────────────────
describe('PriorityQueue - peek', () => {
  it('returns highest priority without removing', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(1)
    expect(pq.peek()).toBe(1)
    expect(pq.size).toBe(2)
  })

  it('returns undefined when empty', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.peek()).toBeUndefined()
  })
})

// ─── Size tracking ────────────────────────────────────────
describe('PriorityQueue - size', () => {
  it('tracks size correctly', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.size).toBe(0)
    pq.enqueue(1)
    expect(pq.size).toBe(1)
    pq.enqueue(2)
    expect(pq.size).toBe(2)
    pq.dequeue()
    expect(pq.size).toBe(1)
  })
})

// ─── Clear ────────────────────────────────────────────────
describe('PriorityQueue - clear', () => {
  it('removes all elements', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.enqueue(3)
    pq.clear()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
  })
})

// ─── toArray ───────────────────────────────────────────────
describe('PriorityQueue - toArray', () => {
  it('returns heap contents', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.toArray()).toHaveLength(3)
    expect(pq.toArray()).toContain(1)
    expect(pq.toArray()).toContain(2)
    expect(pq.toArray()).toContain(3)
  })
})

// ─── Large scale ──────────────────────────────────────────
describe('PriorityQueue - large scale', () => {
  it('handles 1000 elements in sorted order', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 1000; i >= 0; i--) {
      pq.enqueue(i)
    }
    const results: number[] = []
    while (!pq.isEmpty()) {
      results.push(pq.dequeue()!)
    }
    for (let i = 0; i <= 1000; i++) {
      expect(results[i]).toBe(i)
    }
  })
})

// ─── Custom comparator ────────────────────────────────────
describe('PriorityQueue - custom comparator', () => {
  it('works with string comparator', () => {
    const pq = new PriorityQueue<string>({ comparator: (a, b) => a.localeCompare(b) })
    pq.enqueue('cherry')
    pq.enqueue('apple')
    pq.enqueue('banana')
    expect(pq.dequeue()).toBe('apple')
    expect(pq.dequeue()).toBe('banana')
    expect(pq.dequeue()).toBe('cherry')
  })

  it('works with object comparator', () => {
    const pq = new PriorityQueue<{ priority: number; name: string }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    pq.enqueue({ priority: 3, name: 'low' })
    pq.enqueue({ priority: 1, name: 'high' })
    pq.enqueue({ priority: 2, name: 'medium' })
    expect(pq.dequeue()!.name).toBe('high')
    expect(pq.dequeue()!.name).toBe('medium')
    expect(pq.dequeue()!.name).toBe('low')
  })
})

describe('PriorityQueue - edge cases', () => {
  it('clear then reuse', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.clear()
    pq.enqueue(5)
    expect(pq.dequeue()).toBe(5)
    expect(pq.isEmpty()).toBe(true)
  })

  it('toArray after partial dequeue', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    pq.dequeue()
    expect(pq.toArray()).toHaveLength(2)
  })

  it('enqueue many then dequeue sorted', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 100; i >= 0; i--) pq.enqueue(i)
    let prev = -1
    while (!pq.isEmpty()) {
      const val = pq.dequeue()!
      expect(val).toBeGreaterThanOrEqual(prev)
      prev = val
    }
  })
})

describe('PriorityQueue - isEmpty', () => {
  it('returns true when newly created', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.isEmpty()).toBe(true)
  })

  it('returns false after enqueue', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    expect(pq.isEmpty()).toBe(false)
  })

  it('returns true after all dequeued', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.dequeue()
    pq.dequeue()
    expect(pq.isEmpty()).toBe(true)
  })

  it('returns false after dequeue not all', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.enqueue(3)
    pq.dequeue()
    expect(pq.isEmpty()).toBe(false)
  })
})

describe('PriorityQueue - max-heap behavior', () => {
  it('dequeue returns max first', () => {
    const pq = new PriorityQueue<number>({ comparator: (a, b) => b - a })
    pq.enqueue(1)
    pq.enqueue(3)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(1)
  })

  it('peek returns max without removing', () => {
    const pq = new PriorityQueue<number>({ comparator: (a, b) => b - a })
    pq.enqueue(5)
    pq.enqueue(10)
    pq.enqueue(3)
    expect(pq.peek()).toBe(10)
    expect(pq.size).toBe(3)
  })
})

describe('PriorityQueue - array operations', () => {
  it('toArray returns empty array when empty', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.toArray()).toEqual([])
  })

  it('toArray returns independent copy', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    const arr = pq.toArray()
    arr.push(999)
    expect(pq.size).toBe(2)
  })

  it('toArray after clear is empty', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.clear()
    expect(pq.toArray()).toEqual([])
  })
})

describe('PriorityQueue - clear operations', () => {
  it('clear on empty does nothing', () => {
    const pq = new PriorityQueue<number>()
    pq.clear()
    expect(pq.isEmpty()).toBe(true)
    expect(pq.size).toBe(0)
  })

  it('clear resets size to zero', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 0; i < 10; i++) pq.enqueue(i)
    pq.clear()
    expect(pq.size).toBe(0)
  })

  it('clear makes peek undefined', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.clear()
    expect(pq.peek()).toBeUndefined()
  })
})

describe('PriorityQueue - negative numbers', () => {
  it('handles negative numbers correctly', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(-5)
    pq.enqueue(-2)
    pq.enqueue(-10)
    expect(pq.dequeue()).toBe(-10)
    expect(pq.dequeue()).toBe(-5)
    expect(pq.dequeue()).toBe(-2)
  })

  it('mixes positive and negative numbers', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(-3)
    pq.enqueue(0)
    pq.enqueue(-10)
    expect(pq.dequeue()).toBe(-10)
    expect(pq.dequeue()).toBe(-3)
    expect(pq.dequeue()).toBe(0)
    expect(pq.dequeue()).toBe(5)
  })
})

describe('PriorityQueue - zero', () => {
  it('handles zero among numbers', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(0)
    pq.enqueue(5)
    pq.enqueue(-5)
    expect(pq.dequeue()).toBe(-5)
    expect(pq.dequeue()).toBe(0)
    expect(pq.dequeue()).toBe(5)
  })

  it('handles all zeros', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(0)
    pq.enqueue(0)
    pq.enqueue(0)
    expect(pq.dequeue()).toBe(0)
    expect(pq.dequeue()).toBe(0)
    expect(pq.dequeue()).toBe(0)
  })
})

describe('PriorityQueue - large numbers', () => {
  it('handles large numbers', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(Number.MAX_SAFE_INTEGER)
    pq.enqueue(1000000)
    pq.enqueue(Number.MIN_SAFE_INTEGER)
    expect(pq.dequeue()).toBe(Number.MIN_SAFE_INTEGER)
    expect(pq.dequeue()).toBe(1000000)
    expect(pq.dequeue()).toBe(Number.MAX_SAFE_INTEGER)
  })
})

describe('PriorityQueue - mixed types with comparator', () => {
  it('handles date objects', () => {
    const pq = new PriorityQueue<Date>({
      comparator: (a, b) => a.getTime() - b.getTime(),
    })
    const dates = [
      new Date('2023-01-01'),
      new Date('2022-01-01'),
      new Date('2024-01-01'),
    ]
    pq.enqueue(dates[0]!)
    pq.enqueue(dates[1]!)
    pq.enqueue(dates[2]!)
    expect(pq.dequeue()).toBe(dates[1])
    expect(pq.dequeue()).toBe(dates[0])
    expect(pq.dequeue()).toBe(dates[2])
  })
})

describe('PriorityQueue - sequential operations', () => {
  it('handles alternating enqueue and dequeue', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(2)
  })

  it('handles enqueue-dequeue pattern', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 0; i < 5; i++) {
      pq.enqueue(i)
      expect(pq.peek()).toBe(0)
    }
    for (let i = 0; i < 5; i++) {
      expect(pq.dequeue()).toBe(i)
    }
  })
})

describe('PriorityQueue - object comparison edge cases', () => {
  it('handles objects with same priority', () => {
    const pq = new PriorityQueue<{ id: number; priority: number }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    pq.enqueue({ id: 1, priority: 1 })
    pq.enqueue({ id: 2, priority: 1 })
    pq.enqueue({ id: 3, priority: 2 })
    const first = pq.dequeue()!
    const second = pq.dequeue()!
    expect(first.priority).toBe(1)
    expect(second.priority).toBe(1)
    expect(pq.dequeue()!.priority).toBe(2)
  })
})

describe('PriorityQueue - stress tests', () => {
  it('handles 5000 elements', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 5000; i >= 0; i--) {
      pq.enqueue(i)
    }
    expect(pq.size).toBe(5001)
    let prev = -1
    while (!pq.isEmpty()) {
      const val = pq.dequeue()!
      expect(val).toBeGreaterThanOrEqual(prev)
      prev = val
    }
  })

  it('handles random insertion and removal', () => {
    const pq = new PriorityQueue<number>()
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
    values.forEach(v => pq.enqueue(v))
    const sorted = [...values].sort((a, b) => a - b)
    for (const v of sorted) {
      expect(pq.dequeue()).toBe(v)
    }
  })
})

describe('PriorityQueue - string comparator', () => {
  it('handles case-sensitive strings', () => {
    const pq = new PriorityQueue<string>({ comparator: (a, b) => a.localeCompare(b) })
    pq.enqueue('Zebra')
    pq.enqueue('apple')
    pq.enqueue('Banana')
    expect(pq.dequeue()).toBe('apple')
    expect(pq.dequeue()).toBe('Banana')
    expect(pq.dequeue()).toBe('Zebra')
  })

  it('handles case-insensitive strings', () => {
    const pq = new PriorityQueue<string>({
      comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
    })
    pq.enqueue('Zebra')
    pq.enqueue('apple')
    pq.enqueue('Banana')
    expect(pq.dequeue()).toBe('apple')
    expect(pq.dequeue()).toBe('Banana')
    expect(pq.dequeue()).toBe('Zebra')
  })
})

describe('PriorityQueue - boolean comparator', () => {
  it('handles boolean values (false first)', () => {
    const pq = new PriorityQueue<boolean>({
      comparator: (a, b) => (a === b ? 0 : a ? 1 : -1),
    })
    pq.enqueue(true)
    pq.enqueue(false)
    pq.enqueue(true)
    expect(pq.dequeue()).toBe(false)
    expect(pq.dequeue()).toBe(true)
    expect(pq.dequeue()).toBe(true)
  })
})

describe('PriorityQueue - reverse order', () => {
  it('uses comparator to reverse order completely', () => {
    const pq = new PriorityQueue<number>({ comparator: (a, b) => b - a })
    pq.enqueue(1)
    pq.enqueue(2)
    pq.enqueue(3)
    expect(pq.dequeue()).toBe(3)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(1)
  })
})

describe('PriorityQueue - peek persistence', () => {
  it('peek returns same value across multiple calls', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    pq.enqueue(7)
    expect(pq.peek()).toBe(3)
    expect(pq.peek()).toBe(3)
    expect(pq.peek()).toBe(3)
  })

  it('peek undefined after clear', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.clear()
    expect(pq.peek()).toBeUndefined()
  })
})

describe('PriorityQueue - size consistency', () => {
  it('size matches number of enqueued items', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 0; i < 50; i++) {
      pq.enqueue(i)
      expect(pq.size).toBe(i + 1)
    }
  })

  it('size decreases with each dequeue', () => {
    const pq = new PriorityQueue<number>()
    for (let i = 0; i < 10; i++) pq.enqueue(i)
    for (let i = 10; i > 0; i--) {
      pq.dequeue()
      expect(pq.size).toBe(i - 1)
    }
  })

  it('should handle clear operation', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    pq.clear()
    expect(pq.size).toBe(0)
  })

  it('should peek without removing', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(3)
    expect(pq.peek()).toBe(3)
    expect(pq.size).toBe(2)
  })

  it('should dequeue in order', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.dequeue()).toBe(1)
    expect(pq.dequeue()).toBe(2)
    expect(pq.dequeue()).toBe(3)
  })

  it('should handle toArray', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(1)
    pq.enqueue(2)
    const arr = pq.toArray()
    expect(arr.length).toBe(2)
  })
})

  it('toArray returns elements', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(3)
    pq.enqueue(1)
    pq.enqueue(2)
    expect(pq.toArray().sort()).toEqual([1, 2, 3])
  })

  it('peek on empty returns undefined', () => {
    const pq = new PriorityQueue<number>()
    expect(pq.peek()).toBeUndefined()
  })

  it('dequeue all returns in order', () => {
    const pq = new PriorityQueue<number>()
    pq.enqueue(5)
    pq.enqueue(1)
    pq.enqueue(3)
    const result: number[] = []
    while (pq.size > 0) result.push(pq.dequeue()!)
    expect(result).toEqual([1, 3, 5])
  })
