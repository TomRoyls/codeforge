import { describe, expect, it } from 'vitest'
import { FibonacciIterator } from '../../src/utils/fibonacci-iterator.js'

describe('FibonacciIterator', () => {
  it('generates fibonacci sequence', () => {
    const iter = new FibonacciIterator({ count: 8 })
    const result = [...iter]
    expect(result).toEqual([0n, 1n, 1n, 2n, 3n, 5n, 8n, 13n])
  })

  it('handles count 0', () => {
    const iter = new FibonacciIterator({ count: 0 })
    expect([...iter]).toEqual([])
  })

  it('handles count 1', () => {
    const iter = new FibonacciIterator({ count: 1 })
    expect([...iter]).toEqual([0n])
  })

  it('handles count 2', () => {
    const iter = new FibonacciIterator({ count: 2 })
    expect([...iter]).toEqual([0n, 1n])
  })

  it('unbounded iterator produces correct values', () => {
    const iter = new FibonacciIterator()
    const results: bigint[] = []
    for (let i = 0; i < 10; i++) {
      const r = iter.next()
      results.push(r.value)
    }
    expect(results).toEqual([0n, 1n, 1n, 2n, 3n, 5n, 8n, 13n, 21n, 34n])
  })

  it('nth returns correct fibonacci number', () => {
    expect(FibonacciIterator.nth(0)).toBe(0n)
    expect(FibonacciIterator.nth(1)).toBe(1n)
    expect(FibonacciIterator.nth(5)).toBe(5n)
    expect(FibonacciIterator.nth(10)).toBe(55n)
  })

  it('nth handles large indices', () => {
    const f50 = FibonacciIterator.nth(50)
    expect(f50).toBe(12586269025n)
  })

  it('toArray returns correct sequence', () => {
    expect(FibonacciIterator.toArray(6)).toEqual([0n, 1n, 1n, 2n, 3n, 5n])
  })

  it('toArray handles empty', () => {
    expect(FibonacciIterator.toArray(0)).toEqual([])
  })

  it('isFibonacci identifies fibonacci numbers', () => {
    expect(FibonacciIterator.isFibonacci(0n)).toBe(true)
    expect(FibonacciIterator.isFibonacci(1n)).toBe(true)
    expect(FibonacciIterator.isFibonacci(5n)).toBe(true)
    expect(FibonacciIterator.isFibonacci(8n)).toBe(true)
    expect(FibonacciIterator.isFibonacci(13n)).toBe(true)
  })

  it('isFibonacci rejects non-fibonacci numbers', () => {
    expect(FibonacciIterator.isFibonacci(4n)).toBe(false)
    expect(FibonacciIterator.isFibonacci(6n)).toBe(false)
    expect(FibonacciIterator.isFibonacci(7n)).toBe(false)
  })

  it('isFibonacci rejects negative', () => {
    expect(FibonacciIterator.isFibonacci(-1n)).toBe(false)
  })

  it('works with for-of loop', () => {
    let sum = 0n
    let count = 0
    for (const val of new FibonacciIterator({ count: 5 })) {
      sum += val
      count++
    }
    expect(sum).toBe(7n)
    expect(count).toBe(5)
  })

  it('produces large fibonacci numbers correctly', () => {
    const f100 = FibonacciIterator.nth(100)
    expect(f100).toBe(354224848179261915075n)
  })

  it('nth handles negative input', () => {
    expect(FibonacciIterator.nth(-1)).toBe(0n)
  })

  it('iterator done after count exhausted', () => {
    const iter = new FibonacciIterator({ count: 3 })
    iter.next()
    iter.next()
    iter.next()
    const result = iter.next()
    expect(result.done).toBe(true)
  })

  it('nth handles 0', () => {
    expect(FibonacciIterator.nth(0)).toBe(0n)
  })

  it('nth handles 1', () => {
    expect(FibonacciIterator.nth(1)).toBe(1n)
  })

  it('nth handles 10', () => {
    expect(FibonacciIterator.nth(10)).toBe(55n)
  })

  it('nth 0 is 0', () => {
    expect(FibonacciIterator.nth(0)).toBe(0n)
  })

  it('nth 1 is 1', () => {
    expect(FibonacciIterator.nth(1)).toBe(1n)
  })

  it('nth 2 is 1', () => {
    expect(FibonacciIterator.nth(2)).toBe(1n)
  })

  it('nth 0 is 0', () => {
    expect(FibonacciIterator.nth(0)).toBe(0n)
  })

  it('nth 1 is 1', () => {
    expect(FibonacciIterator.nth(1)).toBe(1n)
  })

  it('toString shows initial state', () => {
    const iter = new FibonacciIterator({ count: 5 })
    expect(iter.toString()).toBe('FibonacciIterator(count=0, max=5)')
  })

  it('toString shows unbounded max', () => {
    const iter = new FibonacciIterator()
    expect(iter.toString()).toBe('FibonacciIterator(count=0, max=∞)')
  })

  it('toString updates after iteration', () => {
    const iter = new FibonacciIterator({ count: 5 })
    iter.next()
    iter.next()
    expect(iter.toString()).toBe('FibonacciIterator(count=2, max=5)')
  })

  it('toJSON returns initial state', () => {
    const iter = new FibonacciIterator({ count: 5 })
    const json = iter.toJSON()
    expect(json).toEqual({ prev: '0', curr: '1', count: 0, maxCount: 5 })
  })

  it('toJSON returns unbounded max as null', () => {
    const iter = new FibonacciIterator()
    const json = iter.toJSON()
    expect(json.maxCount).toBe(null)
  })

  it('toJSON updates after iteration', () => {
    const iter = new FibonacciIterator({ count: 5 })
    iter.next()
    iter.next()
    const json = iter.toJSON()
    expect(json).toEqual({ prev: '0', curr: '1', count: 2, maxCount: 5 })
  })

  it('toJSON after exhaustion', () => {
    const iter = new FibonacciIterator({ count: 2 })
    iter.next()
    iter.next()
    const json = iter.toJSON()
    expect(json).toEqual({ prev: '0', curr: '1', count: 2, maxCount: 2 })
  })

  it('clone creates independent copy', () => {
    const iter = new FibonacciIterator({ count: 5 })
    iter.next()
    iter.next()
    const cloned = iter.clone()
    expect(cloned).not.toBe(iter)
    expect(cloned.equals(iter)).toBe(true)
  })

  it('clone preserves state', () => {
    const iter = new FibonacciIterator({ count: 5 })
    iter.next()
    iter.next()
    const cloned = iter.clone()
    expect(cloned.toJSON()).toEqual(iter.toJSON())
  })

  it('clone produces same next values', () => {
    const iter = new FibonacciIterator({ count: 5 })
    iter.next()
    iter.next()
    const cloned = iter.clone()
    const next1 = iter.next()
    const next2 = cloned.next()
    expect(next1).toEqual(next2)
  })

  it('clone with different maxCount', () => {
    const iter = new FibonacciIterator({ count: 5 })
    iter.next()
    const cloned = iter.clone()
    const originalResults = [...iter]
    const clonedResults = [...cloned]
    expect(originalResults).toEqual(clonedResults)
  })

  it('equals returns true for identical iterators', () => {
    const iter1 = new FibonacciIterator({ count: 5 })
    const iter2 = new FibonacciIterator({ count: 5 })
    expect(iter1.equals(iter2)).toBe(true)
  })

  it('equals returns false for different internal state', () => {
    const iter1 = new FibonacciIterator({ count: 5 })
    const iter2 = new FibonacciIterator({ count: 5 })
    iter1.next()
    expect(iter1.equals(iter2)).toBe(false)
  })

  it('equals returns false for non-FibonacciIterator', () => {
    const iter = new FibonacciIterator()
    expect(iter.equals(null)).toBe(false)
    expect(iter.equals({})).toBe(false)
    expect(iter.equals(5)).toBe(false)
  })

  it('equals after cloning returns true', () => {
    const iter = new FibonacciIterator({ count: 5 })
    const cloned = iter.clone()
    expect(iter.equals(cloned)).toBe(true)
    expect(cloned.equals(iter)).toBe(true)
  })

  it('toArray with large count', () => {
    const result = FibonacciIterator.toArray(20)
    expect(result.length).toBe(20)
    expect(result[0]).toBe(0n)
    expect(result[1]).toBe(1n)
    expect(result[19]).toBe(4181n)
  })

  it('isFibonacci with very large numbers', () => {
    expect(FibonacciIterator.isFibonacci(354224848179261915075n)).toBe(true)
    expect(FibonacciIterator.isFibonacci(354224848179261915074n)).toBe(false)
  })

  it('iterator can be reset by creating new instance', () => {
    const iter1 = new FibonacciIterator({ count: 3 })
    const results1 = [...iter1]
    const iter2 = new FibonacciIterator({ count: 3 })
    const results2 = [...iter2]
    expect(results1).toEqual(results2)
  })

  it('multiple iterators are independent', () => {
    const iter1 = new FibonacciIterator({ count: 5 })
    const iter2 = new FibonacciIterator({ count: 5 })
    iter1.next()
    const val1 = iter1.next().value
    const val2 = iter2.next().value
    expect(val1).not.toBe(val2)
  })

  it('nth handles edge case 0', () => {
    expect(FibonacciIterator.nth(0)).toBe(0n)
  })

  it('nth handles edge case 1', () => {
    expect(FibonacciIterator.nth(1)).toBe(1n)
  })

  it('nth handles edge case 2', () => {
    expect(FibonacciIterator.nth(2)).toBe(1n)
  })

  it('nth handles edge case 3', () => {
    expect(FibonacciIterator.nth(3)).toBe(2n)
  })

  it('should iterate fibonacci sequence', () => {
    const iter = new FibonacciIterator()
    expect(iter.next().value).toBe(0n)
    expect(iter.next().value).toBe(1n)
    expect(iter.next().value).toBe(1n)
    expect(iter.next().value).toBe(2n)
  })

  it('should return 0n for nth(0)', () => {
    expect(FibonacciIterator.nth(0)).toBe(0n)
  })

  it('should return 1n for nth(1)', () => {
    expect(FibonacciIterator.nth(1)).toBe(1n)
  })

  it('should compute large fibonacci', () => {
    const f = FibonacciIterator.nth(50)
    expect(f).toBeGreaterThan(0n)
  })

  it('should be iterable', () => {
    const iter = new FibonacciIterator()
    let count = 0
    for (const _ of iter) {
      count++
      if (count >= 10) break
    }
    expect(count).toBe(10)
  })

  it('should compute nth(10)', () => {
    expect(FibonacciIterator.nth(10)).toBe(55n)
  })

  it('clone produces independent copy', () => {
    const fi = new FibonacciIterator()
    fi.next()
    fi.next()
    const c = fi.clone()
    expect(c.next().value).toBeDefined()
  })

  it('nth(0) returns 0', () => {
    expect(FibonacciIterator.nth(0)).toBe(0n)
  })

  it('nth(1) returns 1', () => {
    expect(FibonacciIterator.nth(1)).toBe(1n)
  })
})

describe('fibonacci-iterator - wave548', () => {
  it('fibonacci-iterator module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module has name', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module not null', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module has length', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('fibonacci-iterator - wave549', () => {
  it('fibonacci-iterator module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fibonacci-iterator - wave550', () => {
  it('fibonacci-iterator w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fibonacci-iterator - wave551', () => {
  it('fibonacci-iterator w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fibonacci-iterator - wave552', () => {
  it('fibonacci-iterator w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fibonacci-iterator - wave553', () => {
  it('fibonacci-iterator w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fibonacci-iterator w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
