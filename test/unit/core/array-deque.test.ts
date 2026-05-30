import { describe, expect, it } from 'vitest'

import { ArrayDeque } from '../../../src/core/array-deque/index.js'

describe('ArrayDeque', () => {
  it('constructor creates empty deque with default capacity', () => {
    const deque = new ArrayDeque<number>()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty).toBe(true)
    expect(deque.capacity).toBe(16)
  })

  it('constructor creates empty deque with custom capacity', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 8 })
    expect(deque.size).toBe(0)
    expect(deque.isEmpty).toBe(true)
    expect(deque.capacity).toBe(8)
  })

  it('constructor sets minimum capacity of 1', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 0 })
    expect(deque.capacity).toBe(1)
  })

  it('pushBack adds items to back', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.size).toBe(3)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(3)
  })

  it('pushFront adds items to front', () => {
    const deque = new ArrayDeque<number>()
    deque.pushFront(1)
    deque.pushFront(2)
    deque.pushFront(3)
    expect(deque.size).toBe(3)
    expect(deque.front()).toBe(3)
    expect(deque.back()).toBe(1)
  })

  it('enqueue is alias for pushBack', () => {
    const deque = new ArrayDeque<number>()
    deque.enqueue(1)
    deque.enqueue(2)
    expect(deque.size).toBe(2)
    expect(deque.front()).toBe(1)
  })

  it('popFront removes from front', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.popFront()).toBe(1)
    expect(deque.size).toBe(2)
    expect(deque.front()).toBe(2)
  })

  it('popFront throws RangeError on empty deque', () => {
    const deque = new ArrayDeque<number>()
    expect(() => deque.popFront()).toThrow(RangeError)
    expect(() => deque.popFront()).toThrow('Cannot popFront from empty deque')
  })

  it('popBack removes from back', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.popBack()).toBe(3)
    expect(deque.size).toBe(2)
    expect(deque.back()).toBe(2)
  })

  it('popBack throws RangeError on empty deque', () => {
    const deque = new ArrayDeque<number>()
    expect(() => deque.popBack()).toThrow(RangeError)
    expect(() => deque.popBack()).toThrow('Cannot popBack from empty deque')
  })

  it('dequeue is alias for popFront', () => {
    const deque = new ArrayDeque<number>()
    deque.enqueue(1)
    deque.enqueue(2)
    expect(deque.dequeue()).toBe(1)
    expect(deque.size).toBe(1)
  })

  it('front returns first item without removing', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(10)
    deque.pushBack(20)
    expect(deque.front()).toBe(10)
    expect(deque.size).toBe(2)
  })

  it('front returns undefined when empty', () => {
    const deque = new ArrayDeque<number>()
    expect(deque.front()).toBeUndefined()
  })

  it('back returns last item without removing', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.back()).toBe(3)
    expect(deque.size).toBe(3)
  })

  it('back returns undefined when empty', () => {
    const deque = new ArrayDeque<number>()
    expect(deque.back()).toBeUndefined()
  })

  it('peek is alias for front', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(42)
    expect(deque.peek()).toBe(deque.front())
  })

  it('get returns item at index', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.get(0)).toBe(1)
    expect(deque.get(1)).toBe(2)
    expect(deque.get(2)).toBe(3)
  })

  it('get throws RangeError for negative index', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    expect(() => deque.get(-1)).toThrow(RangeError)
  })

  it('get throws RangeError for out of bounds index', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    expect(() => deque.get(1)).toThrow(RangeError)
  })

  it('set updates item at index', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.set(1, 99)
    expect(deque.get(1)).toBe(99)
    expect(deque.toArray()).toEqual([1, 99, 3])
  })

  it('set throws RangeError for negative index', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    expect(() => deque.set(-1, 99)).toThrow(RangeError)
  })

  it('set throws RangeError for out of bounds index', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    expect(() => deque.set(1, 99)).toThrow(RangeError)
  })

  it('size tracks count correctly', () => {
    const deque = new ArrayDeque<number>()
    expect(deque.size).toBe(0)
    deque.pushBack(1)
    expect(deque.size).toBe(1)
    deque.pushBack(2)
    expect(deque.size).toBe(2)
    deque.popFront()
    expect(deque.size).toBe(1)
  })

  it('isEmpty returns correct state', () => {
    const deque = new ArrayDeque<number>()
    expect(deque.isEmpty).toBe(true)
    deque.pushBack(1)
    expect(deque.isEmpty).toBe(false)
    deque.popFront()
    expect(deque.isEmpty).toBe(true)
  })

  it('capacity reflects current buffer size', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 4 })
    expect(deque.capacity).toBe(4)
    for (let i = 0; i < 5; i++) {
      deque.pushBack(i)
    }
    expect(deque.capacity).toBe(8)
  })

  it('clear empties the deque', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty).toBe(true)
    expect(deque.front()).toBeUndefined()
    expect(deque.back()).toBeUndefined()
  })

  it('toArray returns all items in order', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.toArray()).toEqual([1, 2, 3])
  })

  it('toArray returns empty array for empty deque', () => {
    const deque = new ArrayDeque<number>()
    expect(deque.toArray()).toEqual([])
  })

  it('forEach iterates all items', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    const items: number[] = []
    deque.forEach((v) => items.push(v))
    expect(items).toEqual([1, 2, 3])
  })

  it('forEach passes index to callback', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(10)
    deque.pushBack(20)
    deque.pushBack(30)
    const indices: number[] = []
    deque.forEach((_, i) => indices.push(i))
    expect(indices).toEqual([0, 1, 2])
  })

  it('Symbol.iterator allows for...of iteration', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    const items = [...deque]
    expect(items).toEqual([1, 2, 3])
  })

  it('static fromArray creates deque from array', () => {
    const deque = ArrayDeque.fromArray([10, 20, 30])
    expect(deque.size).toBe(3)
    expect(deque.toArray()).toEqual([10, 20, 30])
  })

  it('fromArray with empty array creates empty deque', () => {
    const deque = ArrayDeque.fromArray<number>([])
    expect(deque.size).toBe(0)
    expect(deque.isEmpty).toBe(true)
  })

  it('fromArray sets appropriate capacity', () => {
    const deque = ArrayDeque.fromArray(new Array(20).fill(0))
    expect(deque.capacity).toBeGreaterThanOrEqual(20)
  })

  it('handles circular buffer wrapping', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 4 })
    deque.pushBack(1)
    deque.pushBack(2)
    deque.popFront()
    deque.popFront()
    deque.pushBack(3)
    deque.pushBack(4)
    deque.pushBack(5)
    expect(deque.toArray()).toEqual([3, 4, 5])
  })

  it('handles mixed front and back operations', () => {
    const deque = new ArrayDeque<number>()
    deque.pushBack(1)
    deque.pushFront(0)
    deque.pushBack(2)
    deque.pushFront(-1)
    expect(deque.toArray()).toEqual([-1, 0, 1, 2])
    expect(deque.popFront()).toBe(-1)
    expect(deque.popBack()).toBe(2)
    expect(deque.toArray()).toEqual([0, 1])
  })

  it('grows when exceeding capacity', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 4 })
    expect(deque.capacity).toBe(4)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.pushBack(4)
    expect(deque.capacity).toBe(4)
    deque.pushBack(5)
    expect(deque.capacity).toBe(8)
    expect(deque.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles 100 push operations', () => {
    const deque = new ArrayDeque<number>()
    for (let i = 0; i < 100; i++) {
      deque.pushBack(i)
    }
    expect(deque.size).toBe(100)
    expect(deque.get(0)).toBe(0)
    expect(deque.get(99)).toBe(99)
  })

  it('handles 100 push and pop operations', () => {
    const deque = new ArrayDeque<number>()
    for (let i = 0; i < 50; i++) {
      deque.pushBack(i)
    }
    for (let i = 0; i < 25; i++) {
      expect(deque.popFront()).toBe(i)
    }
    for (let i = 50; i < 100; i++) {
      deque.pushBack(i)
    }
    expect(deque.size).toBe(75)
    expect(deque.get(0)).toBe(25)
    expect(deque.get(74)).toBe(99)
  })

  it('preserves data after grow with wraparound', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 4 })
    deque.pushBack(1)
    deque.pushBack(2)
    deque.popFront()
    deque.popFront()
    deque.pushBack(3)
    deque.pushBack(4)
    deque.pushBack(5)
    deque.pushBack(6)
    deque.pushBack(7)
    expect(deque.capacity).toBe(8)
    expect(deque.toArray()).toEqual([3, 4, 5, 6, 7])
  })

  it('works with strings', () => {
    const deque = new ArrayDeque<string>()
    deque.pushBack('hello')
    deque.pushFront('world')
    expect(deque.toArray()).toEqual(['world', 'hello'])
    expect(deque.popFront()).toBe('world')
  })

  it('works with objects', () => {
    const deque = new ArrayDeque<{ id: number }>()
    deque.pushBack({ id: 1 })
    deque.pushBack({ id: 2 })
    expect(deque.get(0).id).toBe(1)
    expect(deque.get(1).id).toBe(2)
  })

  it('clear does not affect capacity', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 8 })
    deque.pushBack(1)
    deque.pushBack(2)
    const capacityBefore = deque.capacity
    deque.clear()
    expect(deque.capacity).toBe(capacityBefore)
  })

  it('maintains order after grow', () => {
    const deque = new ArrayDeque<number>({ initialCapacity: 4 })
    for (let i = 0; i < 10; i++) {
      deque.pushBack(i)
    }
    expect(deque.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})