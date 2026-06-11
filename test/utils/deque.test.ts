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
  })

  it('toString returns size', () => {
    const dq = new Deque<number>()
    expect(dq.toString()).toBe('Deque(0)')
    dq.pushBack(1)
    expect(dq.toString()).toBe('Deque(1)')
  })

  it('toJSON returns array', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.toJSON()).toEqual([1, 2])
  })

  it('clone creates independent copy', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    const copy = dq.clone()
    expect(copy.toArray()).toEqual([1, 2])
    expect(copy.size).toBe(2)
    copy.pushBack(3)
    expect(dq.size).toBe(2)
    expect(copy.size).toBe(3)
  })

  it('clone of empty deque', () => {
    const dq = new Deque<number>()
    const copy = dq.clone()
    expect(copy.isEmpty).toBe(true)
    expect(copy.size).toBe(0)
  })

  it('equals with identical deques', () => {
    const a = new Deque<number>()
    const b = new Deque<number>()
    a.pushBack(1)
    a.pushBack(2)
    b.pushBack(1)
    b.pushBack(2)
    expect(a.equals(b)).toBe(true)
  })

  it('equals with different deques', () => {
    const a = new Deque<number>()
    const b = new Deque<number>()
    a.pushBack(1)
    b.pushBack(2)
    expect(a.equals(b)).toBe(false)
  })

  it('equals with different sizes', () => {
    const a = new Deque<number>()
    const b = new Deque<number>()
    a.pushBack(1)
    a.pushBack(2)
    b.pushBack(1)
    expect(a.equals(b)).toBe(false)
  })

  it('equals with non-deque returns false', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    expect(dq.equals([1])).toBe(false)
    expect(dq.equals(null)).toBe(false)
    expect(dq.equals(undefined)).toBe(false)
  })

  it('empty deques are equal', () => {
    const a = new Deque<number>()
    const b = new Deque<number>()
    expect(a.equals(b)).toBe(true)
  })

  it('single element front and back are same', () => {
    const dq = new Deque<number>()
    dq.pushBack(42)
    expect(dq.front()).toBe(42)
    expect(dq.back()).toBe(42)
  })

  it('handles object elements', () => {
    const dq = new Deque<{ v: number }>()
    dq.pushBack({ v: 1 })
    dq.pushBack({ v: 2 })
    expect(dq.front()!.v).toBe(1)
    expect(dq.back()!.v).toBe(2)
  })

  it('toArray on empty deque', () => {
    const dq = new Deque<number>()
    expect(dq.toArray()).toEqual([])
  })

  it('clear then pushBack works', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.clear()
    dq.pushBack(2)
    expect(dq.toArray()).toEqual([2])
    expect(dq.size).toBe(1)
  })

  it('pushBack popBack roundtrip', () => {
    const dq = new Deque<number>()
    dq.pushBack(10)
    expect(dq.popBack()).toBe(10)
    expect(dq.isEmpty).toBe(true)
  })

  it('pushFront popFront roundtrip', () => {
    const dq = new Deque<number>()
    dq.pushFront(10)
    expect(dq.popFront()).toBe(10)
    expect(dq.isEmpty).toBe(true)
  })

  it('pushFront then pushBack order', () => {
    const dq = new Deque<number>()
    dq.pushFront(2)
    dq.pushFront(1)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('drain from front preserves order', () => {
    const dq = new Deque<number>()
    for (let i = 0; i < 10; i++) dq.pushBack(i)
    for (let i = 0; i < 10; i++) expect(dq.popFront()).toBe(i)
  })

  it('drain from back reverses order', () => {
    const dq = new Deque<number>()
    for (let i = 0; i < 10; i++) dq.pushBack(i)
    for (let i = 9; i >= 0; i--) expect(dq.popBack()).toBe(i)
  })

  it('handles growth with pushFront', () => {
    const dq = new Deque<number>(4)
    for (let i = 0; i < 100; i++) dq.pushFront(i)
    expect(dq.size).toBe(100)
    expect(dq.front()).toBe(99)
    expect(dq.back()).toBe(0)
  })

  it('handles interleaved push and pop', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    expect(dq.popFront()).toBe(1)
    dq.pushBack(2)
    expect(dq.popFront()).toBe(2)
    expect(dq.isEmpty).toBe(true)
  })

  it('handles null and undefined values', () => {
    const dq = new Deque<number | null | undefined>()
    dq.pushBack(null)
    dq.pushBack(undefined)
    dq.pushBack(1)
    expect(dq.toArray()).toEqual([null, undefined, 1])
  })

  it('clone after modifications preserves state', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.popFront()
    const copy = dq.clone()
    expect(copy.toArray()).toEqual([2, 3])
  })

  it('equals after same pushFront sequence', () => {
    const a = new Deque<number>()
    const b = new Deque<number>()
    a.pushFront(1)
    a.pushFront(2)
    b.pushFront(1)
    b.pushFront(2)
    expect(a.equals(b)).toBe(true)
  })

  it('toJSON on empty deque', () => {
    const dq = new Deque<number>()
    expect(dq.toJSON()).toEqual([])
  })

  it('handles many pushFront and popBack', () => {
    const dq = new Deque<number>()
    for (let i = 0; i < 50; i++) dq.pushFront(i)
    for (let i = 0; i < 50; i++) expect(dq.popBack()).toBe(i)
    expect(dq.isEmpty).toBe(true)
  })

  it('handles many pushBack and popFront', () => {
    const dq = new Deque<number>()
    for (let i = 0; i < 50; i++) dq.pushBack(i)
    for (let i = 0; i < 50; i++) expect(dq.popFront()).toBe(i)
    expect(dq.isEmpty).toBe(true)
  })

  it('size after mixed operations', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.popFront()
    dq.pushBack(4)
    dq.popBack()
    expect(dq.size).toBe(2)
    expect(dq.toArray()).toEqual([2, 3])
  })

  it('front and back after single pushFront', () => {
    const dq = new Deque<number>()
    dq.pushFront(99)
    expect(dq.front()).toBe(99)
    expect(dq.back()).toBe(99)
  })

  it('initial capacity does not affect behavior', () => {
    const dq = new Deque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('handles boolean type', () => {
    const dq = new Deque<boolean>()
    dq.pushBack(true)
    dq.pushBack(false)
    expect(dq.toArray()).toEqual([true, false])
  })

  it('popBack after pushFront', () => {
    const dq = new Deque<number>()
    dq.pushFront(1)
    dq.pushFront(2)
    expect(dq.popBack()).toBe(1)
    expect(dq.toArray()).toEqual([2])
  })

  it('popFront after pushBack', () => {
    const dq = new Deque<number>()
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.popFront()).toBe(1)
    expect(dq.toArray()).toEqual([2])
  })

  it('handles rapid push pop cycles', () => {
    const dq = new Deque<number>()
    for (let i = 0; i < 100; i++) {
      dq.pushBack(i)
      expect(dq.popFront()).toBe(i)
    }
    expect(dq.isEmpty).toBe(true)
  })
})
