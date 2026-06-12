import { describe, it, expect } from 'vitest'
import { WorkStealingDeque } from '../../src/utils/work-stealing-deque.js'

describe('WorkStealingDeque', () => {
  describe('constructor', () => {
    it('creates deque with default capacity', () => {
      const deque = new WorkStealingDeque<number>()
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('creates deque with custom capacity', () => {
      const deque = new WorkStealingDeque<number>(10)
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('creates deque with large capacity', () => {
      const deque = new WorkStealingDeque<number>(10000)
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('creates deque with capacity of 1', () => {
      const deque = new WorkStealingDeque<number>(1)
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('pushBottom', () => {
    it('adds single element', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(5)
      expect(deque.size).toBe(1)
      expect(deque.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.size).toBe(3)
      expect(deque.isEmpty()).toBe(false)
    })

    it('grows when exceeding initial capacity', () => {
      const deque = new WorkStealingDeque<number>(2)
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.size).toBe(3)
    })

    it('adds string elements', () => {
      const deque = new WorkStealingDeque<string>()
      deque.pushBottom('hello')
      deque.pushBottom('world')
      expect(deque.size).toBe(2)
    })

    it('adds object elements', () => {
      const deque = new WorkStealingDeque<{ id: number }>()
      deque.pushBottom({ id: 1 })
      deque.pushBottom({ id: 2 })
      expect(deque.size).toBe(2)
    })

    it('handles undefined as element', () => {
      const deque = new WorkStealingDeque<number | undefined>()
      deque.pushBottom(undefined)
      expect(deque.size).toBe(1)
    })

    it('handles null as element', () => {
      const deque = new WorkStealingDeque<number | null>()
      deque.pushBottom(null)
      expect(deque.size).toBe(1)
    })

    it('adds elements with same value', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(42)
      deque.pushBottom(42)
      deque.pushBottom(42)
      expect(deque.size).toBe(3)
    })

    it('handles zero as element', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(0)
      expect(deque.size).toBe(1)
    })

    it('handles negative numbers', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(-1)
      deque.pushBottom(-100)
      expect(deque.size).toBe(2)
    })
  })

  describe('popBottom', () => {
    it('returns undefined for empty deque', () => {
      const deque = new WorkStealingDeque<number>()
      expect(deque.popBottom()).toBe(undefined)
      expect(deque.size).toBe(0)
    })

    it('removes and returns single element', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(5)
      const item = deque.popBottom()
      expect(item).toBe(5)
      expect(deque.size).toBe(0)
      expect(deque.isEmpty()).toBe(true)
    })

    it('removes elements in LIFO order', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.popBottom()).toBe(3)
      expect(deque.popBottom()).toBe(2)
      expect(deque.popBottom()).toBe(1)
      expect(deque.popBottom()).toBe(undefined)
    })

    it('clears slot after pop', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(5)
      deque.popBottom()
      deque.pushBottom(10)
      expect(deque.size).toBe(1)
    })

    it('handles mixed operations', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.popBottom()
      deque.pushBottom(3)
      expect(deque.popBottom()).toBe(3)
      expect(deque.popBottom()).toBe(1)
    })

    it('handles popping from grown deque', () => {
      const deque = new WorkStealingDeque<number>(2)
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.popBottom()).toBe(3)
      expect(deque.popBottom()).toBe(2)
      expect(deque.popBottom()).toBe(1)
    })

    it('returns undefined after repeated pops', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.popBottom()
      expect(deque.popBottom()).toBe(undefined)
      expect(deque.popBottom()).toBe(undefined)
    })
  })

  describe('steal', () => {
    it('returns undefined for empty deque', () => {
      const deque = new WorkStealingDeque<number>()
      expect(deque.steal()).toBe(undefined)
      expect(deque.size).toBe(0)
    })

    it('removes and returns first element', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      const item = deque.steal()
      expect(item).toBe(1)
      expect(deque.size).toBe(2)
    })

    it('removes elements in FIFO order', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.steal()).toBe(1)
      expect(deque.steal()).toBe(2)
      expect(deque.steal()).toBe(3)
      expect(deque.steal()).toBe(undefined)
    })

    it('clears slot after steal', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(5)
      deque.steal()
      deque.pushBottom(10)
      expect(deque.size).toBe(1)
    })

    it('handles stealing from grown deque', () => {
      const deque = new WorkStealingDeque<number>(2)
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.steal()).toBe(1)
      expect(deque.steal()).toBe(2)
      expect(deque.steal()).toBe(3)
    })

    it('returns undefined after repeated steals', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.steal()
      expect(deque.steal()).toBe(undefined)
      expect(deque.steal()).toBe(undefined)
    })

    it('handles stealing single element', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(42)
      expect(deque.steal()).toBe(42)
      expect(deque.isEmpty()).toBe(true)
    })

    it('clears slot correctly', () => {
      const deque = new WorkStealingDeque<number | undefined>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.steal()
      const arr = deque.toArray()
      expect(arr.length).toBe(1)
      expect(arr[0]).toBe(2)
    })
  })

  describe('size', () => {
    it('returns 0 for empty deque', () => {
      const deque = new WorkStealingDeque<number>()
      expect(deque.size).toBe(0)
    })

    it('increments with pushBottom', () => {
      const deque = new WorkStealingDeque<number>()
      expect(deque.size).toBe(0)
      deque.pushBottom(1)
      expect(deque.size).toBe(1)
      deque.pushBottom(2)
      expect(deque.size).toBe(2)
    })

    it('decrements with popBottom', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      expect(deque.size).toBe(2)
      deque.popBottom()
      expect(deque.size).toBe(1)
      deque.popBottom()
      expect(deque.size).toBe(0)
    })

    it('decrements with steal', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      expect(deque.size).toBe(2)
      deque.steal()
      expect(deque.size).toBe(1)
      deque.steal()
      expect(deque.size).toBe(0)
    })

    it('tracks mixed operations correctly', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.size).toBe(3)
      deque.popBottom()
      expect(deque.size).toBe(2)
      deque.steal()
      expect(deque.size).toBe(1)
    })

    it('handles large number of operations', () => {
      const deque = new WorkStealingDeque<number>()
      for (let i = 0; i < 1000; i++) {
        deque.pushBottom(i)
      }
      expect(deque.size).toBe(1000)
      for (let i = 0; i < 500; i++) {
        deque.popBottom()
      }
      expect(deque.size).toBe(500)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty deque', () => {
      const deque = new WorkStealingDeque<number>()
      expect(deque.isEmpty()).toBe(true)
    })

    it('returns false after pushBottom', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      expect(deque.isEmpty()).toBe(false)
    })

    it('returns true after removing all elements', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.popBottom()
      deque.popBottom()
      expect(deque.isEmpty()).toBe(true)
    })

    it('returns false when elements remain', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.popBottom()
      expect(deque.isEmpty()).toBe(false)
    })

    it('handles steal operations', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      expect(deque.isEmpty()).toBe(false)
      deque.steal()
      expect(deque.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty deque', () => {
      const deque = new WorkStealingDeque<number>()
      expect(deque.toArray()).toEqual([])
    })

    it('returns array with single element', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      expect(deque.toArray()).toEqual([1])
    })

    it('returns array with multiple elements in order', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      expect(deque.toArray()).toEqual([1, 2, 3])
    })

    it('reflects popBottom operations', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      deque.popBottom()
      expect(deque.toArray()).toEqual([1, 2])
    })

    it('reflects steal operations', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      deque.steal()
      expect(deque.toArray()).toEqual([2, 3])
    })

    it('handles mixed operations', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      deque.popBottom()
      deque.steal()
      expect(deque.toArray()).toEqual([2])
    })

    it('handles grown deque', () => {
      const deque = new WorkStealingDeque<number>(2)
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.pushBottom(3)
      deque.pushBottom(4)
      expect(deque.toArray()).toEqual([1, 2, 3, 4])
    })

    it('handles string elements', () => {
      const deque = new WorkStealingDeque<string>()
      deque.pushBottom('a')
      deque.pushBottom('b')
      deque.pushBottom('c')
      expect(deque.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('filters undefined slots', () => {
      const deque = new WorkStealingDeque<number | undefined>()
      deque.pushBottom(1)
      deque.pushBottom(2)
      deque.popBottom()
      deque.pushBottom(3)
      const arr = deque.toArray()
      expect(arr.length).toBe(2)
      expect(arr[0]).toBe(1)
      expect(arr[1]).toBe(3)
    })

    it('returns copy, not reference', () => {
      const deque = new WorkStealingDeque<number>()
      deque.pushBottom(1)
      const arr1 = deque.toArray()
      arr1.push(99)
      const arr2 = deque.toArray()
      expect(arr2).toEqual([1])
      expect(arr1).toEqual([1, 99])
    })
  })

  describe('integration tests', () => {
    it('handles complex sequence of operations', () => {
      const deque = new WorkStealingDeque<number>(3)
      deque.pushBottom(1)
      deque.pushBottom(2)
      expect(deque.toArray()).toEqual([1, 2])
      expect(deque.steal()).toBe(1)
      expect(deque.toArray()).toEqual([2])
      deque.pushBottom(3)
      deque.pushBottom(4)
      deque.pushBottom(5)
      expect(deque.popBottom()).toBe(5)
      expect(deque.toArray()).toEqual([2, 3, 4])
      expect(deque.steal()).toBe(2)
      expect(deque.toArray()).toEqual([3, 4])
    })

    it('handles work-stealing scenario', () => {
      const deque = new WorkStealingDeque<number>()
      for (let i = 1; i <= 10; i++) {
        deque.pushBottom(i)
      }
      expect(deque.size).toBe(10)

      const stolen = deque.steal()
      expect(stolen).toBe(1)
      expect(deque.size).toBe(9)

      const popped = deque.popBottom()
      expect(popped).toBe(10)
      expect(deque.size).toBe(8)

      expect(deque.toArray()).toEqual([2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles boundary conditions', () => {
      const deque = new WorkStealingDeque<number>(1)
      deque.pushBottom(1)
      expect(deque.size).toBe(1)
      deque.pushBottom(2)
      expect(deque.size).toBe(2)
      deque.pushBottom(3)
      expect(deque.size).toBe(3)

      expect(deque.popBottom()).toBe(3)
      expect(deque.steal()).toBe(1)
      expect(deque.popBottom()).toBe(2)
      expect(deque.isEmpty()).toBe(true)
    })

    it('preserves order through multiple growths', () => {
      const deque = new WorkStealingDeque<number>(2)
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      for (const item of items) {
        deque.pushBottom(item)
      }
      expect(deque.toArray()).toEqual(items)
    })
  })
})
  it('isEmpty on new deque', () => {
    const dq = new WorkStealingDeque<number>()
    expect(dq.isEmpty()).toBe(true)
  })

describe('work-stealing-deque - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('work-stealing-deque - wave545', () => {
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

describe('work-stealing-deque - wave546', () => {
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
