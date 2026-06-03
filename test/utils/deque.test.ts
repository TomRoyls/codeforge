import { describe, expect, it } from 'vitest'
import { Deque } from '../../src/utils/deque.js'

describe('Deque', () => {
  it('pushBack and popFront work as queue', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.popFront()).toBe(1)
    expect(dq.popFront()).toBe(2)
    expect(dq.popFront()).toBe(3)
  })

  it('pushFront and popBack work as reverse queue', () => {
    const dq = new Deque<number>()
    dq.pushFront(1)
    dq.pushFront(2)
    dq.pushFront(3)
    expect(dq.popBack()).toBe(1)
    expect(dq.popBack()).toBe(2)
    expect(dq.popBack()).toBe(3)
  })

  it('pushFront and popFront work as stack', () => {
    const dq = new Deque<number>()
    dq.pushFront(1)
    dq.pushFront(2)
    expect(dq.popFront()).toBe(2)
    expect(dq.popFront()).toBe(1)
  })

  it('handles empty operations', () => {
    const dq = new Deque<number>()
    expect(dq.popFront()).toBeUndefined()
    expect(dq.popBack()).toBeUndefined()
    expect(dq.front()).toBeUndefined()
    expect(dq.back()).toBeUndefined()
  })

  it('size and isEmpty work', () => {
    const dq = new Deque<number>()
    expect(dq.isEmpty).toBe(true)
    expect(dq.size).toBe(0)
    dq.pushBack(1)
    expect(dq.isEmpty).toBe(false)
    expect(dq.size).toBe(1)
  })

  it('front and back return correct values', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.front()).toBe(1)
    expect(dq.back()).toBe(3)
  })

  it('toArray returns elements in order', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('clear empties the deque', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.clear()
    expect(dq.size).toBe(0)
    expect(dq.isEmpty).toBe(true)
  })

  it('handles mixed push/pop operations', () => {
    const dq = new Deque<number>()
    dq.pushBack(2)
    dq.pushFront(1)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
    expect(dq.popFront()).toBe(1)
    expect(dq.popBack()).toBe(3)
    expect(dq.toArray()).toEqual([2])
  })

  it('handles growth beyond initial capacity', () => {
    const dq = new Deque<number>(4)
    for (let i = 0; i < 100; i++) dq.pushBack(i)
    expect(dq.size).toBe(100)
    expect(dq.front()).toBe(0)
    expect(dq.back()).toBe(99)
  })

  it('handles string elements', () => {
    const dq = new Deque<string>()
    dq.pushBack('a')
    dq.pushBack('b')
    expect(dq.toArray()).toEqual(['a', 'b'])
  })

  it('handles alternating push front/back', () => {
    const dq = new Deque<number>()
    dq.pushFront(2)
    dq.pushFront(1)
    dq.pushBack(3)
    dq.pushBack(4)
    expect(dq.toArray()).toEqual([1, 2, 3, 4])
    expect(dq.size).toBe(4)
  })

  it('handles pop all then refill', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.popFront()
    dq.popFront()
    expect(dq.isEmpty).toBe(true)
    dq.pushBack(3)
    expect(dq.front()).toBe(3)
    expect(dq.back()).toBe(3)
  })

  it('handles pushFront only', () => {
    const dq = new Deque<number>()
    dq.pushFront(3)
    dq.pushFront(2)
    dq.pushFront(1)
    expect(dq.toArray()).toEqual([1, 2, 3])
    expect(dq.front()).toBe(1)
    expect(dq.back()).toBe(3)
  })

  it('handles large batch push and pop', () => {
    const dq = new Deque<number>()
    for (let i = 0; i < 200; i++) dq.pushBack(i)
    expect(dq.size).toBe(200)
    for (let i = 0; i < 200; i++) dq.popFront()
    expect(dq.isEmpty).toBe(true)
  })

  it('handles popBack operation', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.popBack()).toBe(3)
    expect(dq.back()).toBe(2)
    expect(dq.size).toBe(2)
  })

  it('handles isEmpty on new deque', () => {
    const dq = new Deque<number>()
    expect(dq.isEmpty).toBe(true)
  })

  it('pushBack and popBack work', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.popBack()).toBe(2)
    expect(dq.popBack()).toBe(1)
  })

  it('isEmpty on new deque', () => {
    const dq = new Deque<number>()
    expect(dq.isEmpty).toBe(true)
  })

  it('pushBack and popBack', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.popBack()).toBe(2)
    expect(dq.size).toBe(1)
  })

  it('pushFront and popFront', () => {
    const dq = new Deque<number>()
    dq.pushFront(1)
    dq.pushFront(2)
    expect(dq.popFront()).toBe(2)
  })

  it('size tracks elements', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.size).toBe(2)
  })
})
