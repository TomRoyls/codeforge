import { describe, it, expect } from 'vitest'
import { DequeAggregation } from '../../src/utils/deque-aggregation.js'

describe('DequeAggregation', () => {
  it('sum aggregation: push, aggregate matches sum', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(5)
    deque.pushBack(3)
    deque.pushBack(7)
    expect(deque.aggregate()).toBe(15)
  })

  it('sum aggregation: push multiple, pop front, aggregate updates', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(10)
    deque.pushBack(20)
    deque.pushBack(30)
    expect(deque.aggregate()).toBe(60)
    deque.popFront()
    expect(deque.aggregate()).toBe(50)
    deque.popFront()
    expect(deque.aggregate()).toBe(30)
  })

  it('max aggregation: sliding window max', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(1)
    expect(deque.aggregate()).toBe(1)
    deque.pushBack(5)
    expect(deque.aggregate()).toBe(5)
    deque.pushBack(3)
    expect(deque.aggregate()).toBe(5)
    deque.popFront()
    expect(deque.aggregate()).toBe(5)
    deque.popFront()
    expect(deque.aggregate()).toBe(3)
  })

  it('min aggregation', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.min(a, b))
    deque.pushBack(10)
    deque.pushBack(5)
    deque.pushBack(8)
    expect(deque.aggregate()).toBe(5)
    deque.popFront()
    expect(deque.aggregate()).toBe(5)
    deque.popFront()
    expect(deque.aggregate()).toBe(8)
  })

  it('string concatenation as monoid', () => {
    const deque = new DequeAggregation<string>((a, b) => a + b)
    deque.pushBack('Hello')
    deque.pushBack(' ')
    deque.pushBack('World')
    expect(deque.aggregate()).toBe('Hello World')
  })

  it('empty deque aggregate returns undefined', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    expect(deque.aggregate()).toBeUndefined()
  })

  it('single element aggregate returns that element', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(42)
    expect(deque.aggregate()).toBe(42)
  })

  it('pushBack/popFront FIFO order', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.popFront()).toBe(1)
    expect(deque.popFront()).toBe(2)
    expect(deque.popFront()).toBe(3)
    expect(deque.popFront()).toBeUndefined()
  })

  it('front() and back() peek correctly', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(1)
    deque.pushBack(2)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(2)
    deque.pushBack(3)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(3)
    deque.popFront()
    expect(deque.front()).toBe(2)
    expect(deque.back()).toBe(3)
  })

  it('clear() empties the deque', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.size).toBe(3)
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
    expect(deque.aggregate()).toBeUndefined()
    expect(deque.front()).toBeUndefined()
    expect(deque.back()).toBeUndefined()
  })

  it('large number of operations (1000+ push/pop)', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    for (let i = 1; i <= 1000; i++) {
      deque.pushBack(i)
    }
    expect(deque.size).toBe(1000)
    expect(deque.aggregate()).toBe(500500)
    for (let i = 1; i <= 500; i++) {
      deque.popFront()
    }
    expect(deque.size).toBe(500)
    expect(deque.aggregate()).toBe(375250)
  })

  it('mixed push/pop maintaining correct aggregate', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(10)
    expect(deque.aggregate()).toBe(10)
    deque.pushBack(20)
    expect(deque.aggregate()).toBe(30)
    deque.popFront()
    expect(deque.aggregate()).toBe(20)
    deque.pushBack(30)
    expect(deque.aggregate()).toBe(50)
    deque.pushBack(40)
    expect(deque.aggregate()).toBe(90)
    deque.popFront()
    expect(deque.aggregate()).toBe(70)
    deque.popFront()
    expect(deque.aggregate()).toBe(40)
  })

  it('handles single element push/pop cycle', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(99)
    expect(deque.popFront()).toBe(99)
    expect(deque.popFront()).toBeUndefined()
    expect(deque.aggregate()).toBeUndefined()
  })

  it('clear allows reuse', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(5)
    deque.pushBack(10)
    deque.clear()
    deque.pushBack(3)
    expect(deque.aggregate()).toBe(3)
  })

  it('works with boolean OR aggregation', () => {
    const deque = new DequeAggregation<boolean>((a, b) => a || b)
    deque.pushBack(false)
    deque.pushBack(false)
    expect(deque.aggregate()).toBe(false)
    deque.pushBack(true)
    expect(deque.aggregate()).toBe(true)
    deque.popFront()
    deque.popFront()
    expect(deque.aggregate()).toBe(true)
  })

  it('front/back after all pops return undefined', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.popFront()
    deque.popFront()
    expect(deque.front()).toBeUndefined()
    expect(deque.back()).toBeUndefined()
  })

  it('aggregate on empty returns undefined', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    expect(deque.aggregate()).toBeUndefined()
  })

  it('aggregate sums correctly', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.aggregate()).toBe(6)
  })

  it('size of empty deque is 0', () => {
    const deque = new DequeAggregation<number>()
    expect(deque.size).toBe(0)
  })
})