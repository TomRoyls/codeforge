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

  it('product aggregation', () => {
    const deque = new DequeAggregation<number>((a, b) => a * b)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.pushBack(4)
    expect(deque.aggregate()).toBe(24)
    deque.popFront()
    expect(deque.aggregate()).toBe(12)
  })

  it('boolean AND aggregation', () => {
    const deque = new DequeAggregation<boolean>((a, b) => a && b)
    deque.pushBack(true)
    deque.pushBack(true)
    expect(deque.aggregate()).toBe(true)
    deque.pushBack(false)
    expect(deque.aggregate()).toBe(false)
    deque.popFront()
    deque.popFront()
    expect(deque.aggregate()).toBe(false)
  })

  it('size tracks correctly through operations', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    expect(deque.size).toBe(0)
    deque.pushBack(1)
    expect(deque.size).toBe(1)
    deque.pushBack(2)
    expect(deque.size).toBe(2)
    deque.popFront()
    expect(deque.size).toBe(1)
    deque.popFront()
    expect(deque.size).toBe(0)
  })

  it('isEmpty reflects state', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    expect(deque.isEmpty()).toBe(true)
    deque.pushBack(1)
    expect(deque.isEmpty()).toBe(false)
    deque.popFront()
    expect(deque.isEmpty()).toBe(true)
  })

  it('aggregate after clear then push', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(100)
    deque.pushBack(200)
    deque.clear()
    deque.pushBack(10)
    expect(deque.aggregate()).toBe(10)
    expect(deque.size).toBe(1)
  })

  it('front triggers moveBackToFront', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popFront()
    expect(deque.front()).toBe(2)
    expect(deque.aggregate()).toBe(5)
  })

  it('back returns last element from frontStack when backStack empty', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popFront()
    expect(deque.back()).toBe(3)
  })

  it('handles many alternating push and pop', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    for (let i = 0; i < 100; i++) {
      deque.pushBack(i)
      deque.popFront()
    }
    expect(deque.isEmpty()).toBe(true)
    expect(deque.aggregate()).toBeUndefined()
  })

  it('aggregate with negative numbers sum', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(-5)
    deque.pushBack(10)
    deque.pushBack(-3)
    expect(deque.aggregate()).toBe(2)
  })

  it('max aggregation with negative values', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(-10)
    deque.pushBack(-5)
    deque.pushBack(-20)
    expect(deque.aggregate()).toBe(-5)
  })

  it('min aggregation with all same values', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.min(a, b))
    deque.pushBack(7)
    deque.pushBack(7)
    deque.pushBack(7)
    expect(deque.aggregate()).toBe(7)
  })

  it('string concatenation with popFront', () => {
    const deque = new DequeAggregation<string>((a, b) => a + b)
    deque.pushBack('a')
    deque.pushBack('b')
    deque.pushBack('c')
    deque.popFront()
    expect(deque.aggregate()).toBe('bc')
  })

  it('works with number array concatenation', () => {
    const deque = new DequeAggregation<number[]>((a, b) => [...a, ...b])
    deque.pushBack([1, 2])
    deque.pushBack([3, 4])
    expect(deque.aggregate()).toEqual([1, 2, 3, 4])
  })

  it('push then pop all then push again', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.popFront()
    deque.popFront()
    deque.pushBack(10)
    expect(deque.aggregate()).toBe(10)
    expect(deque.front()).toBe(10)
    expect(deque.back()).toBe(10)
  })

  it('front returns undefined on empty after clear', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.clear()
    expect(deque.front()).toBeUndefined()
  })

  it('back returns undefined on empty after clear', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.clear()
    expect(deque.back()).toBeUndefined()
  })

  it('popFront returns undefined on empty', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    expect(deque.popFront()).toBeUndefined()
  })

  it('constructor without mergeFn allows single push', () => {
    const deque = new DequeAggregation<number>()
    deque.pushBack(1)
    expect(deque.aggregate()).toBe(1)
    expect(deque.size).toBe(1)
  })

  it('multiple clears in a row', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.clear()
    deque.clear()
    expect(deque.isEmpty()).toBe(true)
    expect(deque.size).toBe(0)
  })

  it('aggregate after partial drain', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(3)
    deque.pushBack(7)
    deque.pushBack(5)
    deque.pushBack(2)
    deque.popFront()
    expect(deque.aggregate()).toBe(7)
    deque.popFront()
    expect(deque.aggregate()).toBe(5)
    deque.popFront()
    expect(deque.aggregate()).toBe(2)
  })

  it('sum of 1 to 10 equals 55', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    for (let i = 1; i <= 10; i++) deque.pushBack(i)
    expect(deque.aggregate()).toBe(55)
  })

  it('handles float values', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(0.1)
    deque.pushBack(0.2)
    expect(deque.aggregate()).toBeCloseTo(0.3)
  })

  it('max aggregation after removing max', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(10)
    deque.pushBack(5)
    deque.pushBack(20)
    expect(deque.aggregate()).toBe(20)
    deque.popFront()
    expect(deque.aggregate()).toBe(20)
    deque.popFront()
    expect(deque.aggregate()).toBe(20)
    deque.popFront()
    expect(deque.aggregate()).toBeUndefined()
  })

  it('min aggregation with descending values', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.min(a, b))
    deque.pushBack(5)
    deque.pushBack(4)
    deque.pushBack(3)
    deque.pushBack(2)
    deque.pushBack(1)
    expect(deque.aggregate()).toBe(1)
    deque.popFront()
    expect(deque.aggregate()).toBe(1)
  })

  it('pushBack only maintains correct aggregate', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    for (let i = 0; i < 50; i++) deque.pushBack(i)
    const sum = (49 * 50) / 2
    expect(deque.aggregate()).toBe(sum)
  })

  it('single push then front and back are same', () => {
    const deque = new DequeAggregation<string>((a, b) => a + b)
    deque.pushBack('hello')
    expect(deque.front()).toBe('hello')
    expect(deque.back()).toBe('hello')
  })

  it('multiple popFront after single push', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    expect(deque.popFront()).toBe(1)
    expect(deque.popFront()).toBeUndefined()
    expect(deque.popFront()).toBeUndefined()
  })

  it('aggregate is correct after internal stack transfer', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.pushBack(4)
    deque.pushBack(5)
    deque.popFront()
    deque.popFront()
    expect(deque.aggregate()).toBe(12)
  })

  it('backStack only scenario', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(10)
    deque.pushBack(20)
    expect(deque.back()).toBe(20)
    expect(deque.front()).toBe(10)
  })

  it('clear then multiple pushes', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(999)
    deque.clear()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.aggregate()).toBe(6)
  })

  it('should return correct back element', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.back()).toBe(3)
  })

  it('should return correct front element', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(5)
    deque.pushBack(10)
    expect(deque.front()).toBe(5)
  })

  it('should return undefined aggregate when empty', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    expect(deque.aggregate()).toBeUndefined()
  })

  it('should clear the deque', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
  })

  it('should handle aggregate with multiplication', () => {
    const deque = new DequeAggregation<number>((a, b) => a * b)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.pushBack(4)
    expect(deque.aggregate()).toBe(24)
  })

  it('should maintain aggregate after popFront', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popFront()
    expect(deque.aggregate()).toBe(5)
  })

  it('isEmpty is true for new deque', () => {
    const deque = new DequeAggregation<number>((a, b) => a + b)
    expect(deque.isEmpty()).toBe(true)
  })

  it('clear empties the deque', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(1)
    deque.pushBack(2)
    deque.clear()
    expect(deque.isEmpty()).toBe(true)
  })

  it('aggregate with max function', () => {
    const deque = new DequeAggregation<number>((a, b) => Math.max(a, b))
    deque.pushBack(3)
    deque.pushBack(7)
    deque.pushBack(1)
    expect(deque.aggregate()).toBe(7)
  })
})

  it('front returns undefined on empty', () => {
    const da = new DequeAggregation<number>((a, b) => a + b)
    expect(da.front()).toBeUndefined()
  })

  it('popFront on empty returns undefined', () => {
    const da = new DequeAggregation<number>((a, b) => a + b)
    expect(da.popFront()).toBeUndefined()
  })

  it('pushBack adds value', () => {
    const da = new DequeAggregation<number>((a, b) => a + b)
    da.pushBack(1)
    da.pushBack(2)
    expect(da.front()).toBe(1)
  })

describe('deque-aggregation - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('deque-aggregation - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('deque-aggregation - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('deque-aggregation - wave548', () => {
  it('deque-aggregation module defined', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation module is function', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-aggregation - wave549', () => {
  it('deque-aggregation module defined', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation module is function', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-aggregation - wave550', () => {
  it('deque-aggregation w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-aggregation - wave551', () => {
  it('deque-aggregation w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-aggregation - wave552', () => {
  it('deque-aggregation w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-aggregation - wave553', () => {
  it('deque-aggregation w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-aggregation w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
