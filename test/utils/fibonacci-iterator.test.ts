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
})
