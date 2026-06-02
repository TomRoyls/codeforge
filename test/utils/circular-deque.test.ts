import { describe, it, expect } from 'vitest'
import { CircularDeque } from '../../src/utils/circular-deque.js'

describe('CircularDeque', () => {
  it('pushFront and popFront', () => {
    const deque = new CircularDeque<number>()
    deque.pushFront(1)
    deque.pushFront(2)
    deque.pushFront(3)
    expect(deque.popFront()).toBe(3)
    expect(deque.popFront()).toBe(2)
    expect(deque.popFront()).toBe(1)
  })

  it('pushBack and popBack', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.popBack()).toBe(3)
    expect(deque.popBack()).toBe(2)
    expect(deque.popBack()).toBe(1)
  })

  it('front and back peek', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(3)
    deque.pushFront(0)
    expect(deque.front()).toBe(0)
    expect(deque.back()).toBe(3)
  })

  it('size tracking', () => {
    const deque = new CircularDeque<number>()
    expect(deque.size).toBe(0)
    deque.pushBack(1)
    expect(deque.size).toBe(1)
    deque.pushBack(2)
    expect(deque.size).toBe(2)
    deque.popFront()
    expect(deque.size).toBe(1)
  })

  it('auto-grow when full', () => {
    const deque = new CircularDeque<number>(2)
    expect(deque.capacity).toBe(2)
    deque.pushBack(1)
    deque.pushBack(2)
    expect(deque.capacity).toBe(2)
    deque.pushBack(3)
    expect(deque.capacity).toBe(4)
    expect(deque.size).toBe(3)
  })

  it('clear empties deque', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.size).toBe(3)
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
  })

  it('toArray returns correct order', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    const arr = deque.toArray()
    expect(arr).toEqual([1, 2, 3])
    deque.pushFront(0)
    expect(deque.toArray()).toEqual([0, 1, 2, 3])
  })

  it('isEmpty', () => {
    const deque = new CircularDeque<number>()
    expect(deque.isEmpty()).toBe(true)
    deque.pushBack(1)
    expect(deque.isEmpty()).toBe(false)
    deque.popFront()
    expect(deque.isEmpty()).toBe(true)
  })

  it('mixed pushFront and pushBack', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushFront(0)
    deque.pushFront(-1)
    expect(deque.toArray()).toEqual([-1, 0, 1, 2])
    expect(deque.popFront()).toBe(-1)
    expect(deque.popBack()).toBe(2)
    expect(deque.toArray()).toEqual([0, 1])
  })

  it('get at index', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.pushBack(4)
    expect(deque.get(0)).toBe(1)
    expect(deque.get(1)).toBe(2)
    expect(deque.get(2)).toBe(3)
    expect(deque.get(3)).toBe(4)
    expect(deque.get(4)).toBeUndefined()
    expect(deque.get(-1)).toBeUndefined()
    deque.pushFront(0)
    expect(deque.get(0)).toBe(0)
    expect(deque.get(1)).toBe(1)
  })

  it('iteration with for...of', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    const result: number[] = []
    for (const item of deque) {
      result.push(item)
    }
    expect(result).toEqual([1, 2, 3])
  })

  it('large number of operations', () => {
    const deque = new CircularDeque<number>()
    for (let i = 0; i < 1000; i++) {
      deque.pushBack(i)
    }
    expect(deque.size).toBe(1000)
    for (let i = 0; i < 1000; i++) {
      expect(deque.get(i)).toBe(i)
    }
    for (let i = 0; i < 500; i++) {
      expect(deque.popFront()).toBe(i)
    }
    expect(deque.size).toBe(500)
    for (let i = 0; i < 500; i++) {
      expect(deque.popBack()).toBe(999 - i)
    }
    expect(deque.size).toBe(0)
  })

  it('pop from empty returns undefined', () => {
    const deque = new CircularDeque<number>()
    expect(deque.popFront()).toBeUndefined()
    expect(deque.popBack()).toBeUndefined()
    expect(deque.front()).toBeUndefined()
    expect(deque.back()).toBeUndefined()
    deque.pushBack(1)
    deque.popFront()
    expect(deque.popFront()).toBeUndefined()
    expect(deque.popBack()).toBeUndefined()
  })

  it('circular wrapping behavior', () => {
    const deque = new CircularDeque<number>(4)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.popFront()
    deque.pushBack(3)
    deque.pushBack(4)
    expect(deque.toArray()).toEqual([2, 3, 4])
    deque.pushFront(0)
    deque.pushBack(5)
    expect(deque.toArray()).toEqual([0, 2, 3, 4, 5])
  })

  it('clear allows reuse', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.clear()
    deque.pushBack(2)
    expect(deque.size).toBe(1)
    expect(deque.get(0)).toBe(2)
  })

  it('multiple grow cycles', () => {
    const deque = new CircularDeque<number>(2)
    for (let i = 0; i < 100; i++) deque.pushBack(i)
    expect(deque.size).toBe(100)
    expect(deque.capacity).toBeGreaterThanOrEqual(100)
  })

  it('front-to-back drain', () => {
    const deque = new CircularDeque<number>()
    for (let i = 0; i < 10; i++) deque.pushBack(i)
    for (let i = 0; i < 10; i++) expect(deque.popFront()).toBe(i)
    expect(deque.isEmpty()).toBe(true)
  })

  it('pushFront and popBack work correctly', () => {
    const deque = new CircularDeque<number>(10)
    deque.pushFront(3)
    deque.pushFront(2)
    deque.pushFront(1)
    expect(deque.popBack()).toBe(3)
    expect(deque.popBack()).toBe(2)
  })

  it('size tracks elements', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    expect(deque.size).toBe(2)
  })

  it('pushFront adds to front', () => {
    const deque = new CircularDeque(5)
    deque.pushFront(1)
    deque.pushFront(2)
    expect(deque.size).toBe(2)
  })

  it('pushBack and popFront works as queue', () => {
    const deque = new CircularDeque<number>(10)
    deque.pushBack(1)
    deque.pushBack(2)
    expect(deque.popFront()).toBe(1)
    expect(deque.popFront()).toBe(2)
  })
})