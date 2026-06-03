import { describe, expect, it } from 'vitest'
import { BoundedDeque } from '../../src/utils/bounded-deque.js'

describe('BoundedDeque', () => {
  it('pushBack and popFront work as FIFO', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.popFront()).toBe(1)
    expect(dq.popFront()).toBe(2)
    expect(dq.popFront()).toBe(3)
  })

  it('pushFront and popBack work as LIFO', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushFront(1)
    dq.pushFront(2)
    expect(dq.popBack()).toBe(1)
    expect(dq.popBack()).toBe(2)
  })

  it('auto-evicts oldest on pushBack overflow', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    const evicted = dq.pushBack(3)
    expect(evicted).toBe(1)
    expect(dq.toArray()).toEqual([2, 3])
  })

  it('auto-evicts oldest on pushFront overflow', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    const evicted = dq.pushFront(0)
    expect(evicted).toBe(2)
    expect(dq.toArray()).toEqual([0, 1])
  })

  it('front and back peek correctly', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.front()).toBe(1)
    expect(dq.back()).toBe(3)
  })

  it('returns undefined on empty pop', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.popFront()).toBeUndefined()
    expect(dq.popBack()).toBeUndefined()
  })

  it('front/back undefined on empty', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.front()).toBeUndefined()
    expect(dq.back()).toBeUndefined()
  })

  it('size and isEmpty work', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.size).toBe(0)
    expect(dq.isEmpty()).toBe(true)
    dq.pushBack(1)
    expect(dq.size).toBe(1)
    expect(dq.isEmpty()).toBe(false)
  })

  it('isFull works', () => {
    const dq = new BoundedDeque<number>(2)
    expect(dq.isFull()).toBe(false)
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.isFull()).toBe(true)
  })

  it('getCapacity returns constructor value', () => {
    const dq = new BoundedDeque<number>(10)
    expect(dq.getCapacity()).toBe(10)
  })

  it('tracks evictions', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.pushBack(4)
    expect(dq.evictions).toBe(2)
  })

  it('toArray returns elements in order', () => {
    const dq = new BoundedDeque<string>(5)
    dq.pushBack('a')
    dq.pushBack('b')
    dq.pushBack('c')
    expect(dq.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('clear resets all state', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.clear()
    expect(dq.size).toBe(0)
    expect(dq.isEmpty()).toBe(true)
    expect(dq.toArray()).toEqual([])
  })

  it('clear allows reuse', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.clear()
    dq.pushBack(10)
    expect(dq.front()).toBe(10)
  })

  it('throws on invalid capacity', () => {
    expect(() => new BoundedDeque(0)).toThrow(RangeError)
    expect(() => new BoundedDeque(-1)).toThrow(RangeError)
  })

  it('handles single capacity', () => {
    const dq = new BoundedDeque<number>(1)
    dq.pushBack(1)
    expect(dq.isFull()).toBe(true)
    const evicted = dq.pushBack(2)
    expect(evicted).toBe(1)
    expect(dq.toArray()).toEqual([2])
  })

  it('handles pushFront eviction', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    const evicted = dq.pushFront(0)
    expect(evicted).toBe(2)
    expect(dq.toArray()).toEqual([0, 1])
  })

  it('isFull returns true when at capacity', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.isFull()).toBe(true)
  })

  it('tracks evictions when overwriting', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.evictions).toBe(1)
  })

  it('size reflects current elements', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.size).toBe(2)
  })

  it('popBack returns last element', () => {
    const dq = new BoundedDeque<number>(10)
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.popBack()).toBe(2)
    expect(dq.size).toBe(1)
  })

  it('capacity is set from constructor', () => {
    const dq = new BoundedDeque<number>(2)
    expect(dq.capacity).toBe(2)
  })
})
