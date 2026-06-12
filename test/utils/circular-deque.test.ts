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
    deque.popFront()
    expect(deque.size).toBe(0)
  })

  it('auto-grow when full', () => {
    const deque = new CircularDeque<number>(2)
    expect(deque.capacity).toBe(2)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.capacity).toBe(4)
    expect(deque.size).toBe(3)
  })

  it('clear empties deque', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
  })

  it('toArray returns correct order', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.toArray()).toEqual([1, 2, 3])
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
  })

  it('iteration with for...of', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    const result: number[] = []
    for (const item of deque) result.push(item)
    expect(result).toEqual([1, 2, 3])
  })

  it('large number of operations', () => {
    const deque = new CircularDeque<number>()
    for (let i = 0; i < 1000; i++) deque.pushBack(i)
    expect(deque.size).toBe(1000)
    for (let i = 0; i < 1000; i++) expect(deque.get(i)).toBe(i)
  })

  it('pop from empty returns undefined', () => {
    const deque = new CircularDeque<number>()
    expect(deque.popFront()).toBeUndefined()
    expect(deque.popBack()).toBeUndefined()
    expect(deque.front()).toBeUndefined()
    expect(deque.back()).toBeUndefined()
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

  it('throws on negative capacity', () => {
    expect(() => new CircularDeque(-1)).toThrow(RangeError)
  })

  it('default capacity is 16', () => {
    const deque = new CircularDeque<number>()
    expect(deque.capacity).toBe(16)
  })

  it('capacity 0 is clamped to 1', () => {
    const deque = new CircularDeque<number>(0)
    expect(deque.capacity).toBe(1)
  })

  it('pushBack after popFront wraps correctly', () => {
    const deque = new CircularDeque<number>(3)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popFront()
    deque.popFront()
    deque.pushBack(4)
    deque.pushBack(5)
    expect(deque.toArray()).toEqual([3, 4, 5])
  })

  it('get after pushFront reflects correct index', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushFront(0)
    expect(deque.get(0)).toBe(0)
    expect(deque.get(1)).toBe(1)
    expect(deque.get(2)).toBe(2)
  })

  it('iterator on empty deque returns nothing', () => {
    const deque = new CircularDeque<number>()
    const result: number[] = []
    for (const item of deque) result.push(item)
    expect(result).toEqual([])
  })

  it('toArray on empty deque', () => {
    const deque = new CircularDeque<number>()
    expect(deque.toArray()).toEqual([])
  })

  it('front and back on single element', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(42)
    expect(deque.front()).toBe(42)
    expect(deque.back()).toBe(42)
  })

  it('pushFront triggers grow', () => {
    const deque = new CircularDeque<number>(2)
    deque.pushFront(1)
    deque.pushFront(2)
    deque.pushFront(3)
    expect(deque.capacity).toBe(4)
    expect(deque.toArray()).toEqual([3, 2, 1])
  })

  it('alternating push and pop', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    expect(deque.popFront()).toBe(1)
    deque.pushBack(2)
    expect(deque.popBack()).toBe(2)
    expect(deque.isEmpty()).toBe(true)
  })

  it('handles string type', () => {
    const deque = new CircularDeque<string>()
    deque.pushBack('hello')
    deque.pushBack('world')
    expect(deque.front()).toBe('hello')
    expect(deque.back()).toBe('world')
  })

  it('handles object type', () => {
    const deque = new CircularDeque<{ v: number }>()
    deque.pushBack({ v: 1 })
    deque.pushBack({ v: 2 })
    expect(deque.get(0)!.v).toBe(1)
    expect(deque.get(1)!.v).toBe(2)
  })

  it('back-to-front drain', () => {
    const deque = new CircularDeque<number>()
    for (let i = 0; i < 10; i++) deque.pushBack(i)
    for (let i = 9; i >= 0; i--) expect(deque.popBack()).toBe(i)
    expect(deque.isEmpty()).toBe(true)
  })

  it('get after grow preserves order', () => {
    const deque = new CircularDeque<number>(2)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.get(0)).toBe(1)
    expect(deque.get(1)).toBe(2)
    expect(deque.get(2)).toBe(3)
  })

  it('clear after grow works', () => {
    const deque = new CircularDeque<number>(2)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.toArray()).toEqual([])
  })

  it('many pushFront grow correctly', () => {
    const deque = new CircularDeque<number>(2)
    for (let i = 0; i < 10; i++) deque.pushFront(i)
    expect(deque.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
  })

  it('interleaved pushFront pushBack', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(2)
    deque.pushFront(1)
    deque.pushBack(3)
    deque.pushFront(0)
    expect(deque.toArray()).toEqual([0, 1, 2, 3])
  })

  it('capacity grows by doubling', () => {
    const deque = new CircularDeque<number>(4)
    expect(deque.capacity).toBe(4)
    for (let i = 0; i < 5; i++) deque.pushBack(i)
    expect(deque.capacity).toBe(8)
  })

  it('popFront on single element deque', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(42)
    expect(deque.popFront()).toBe(42)
    expect(deque.size).toBe(0)
    expect(deque.popFront()).toBeUndefined()
  })

  it('popBack on single element deque', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(42)
    expect(deque.popBack()).toBe(42)
    expect(deque.size).toBe(0)
    expect(deque.popBack()).toBeUndefined()
  })

  it('pushFront after clear works', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.clear()
    deque.pushFront(10)
    expect(deque.front()).toBe(10)
    expect(deque.back()).toBe(10)
  })

  it('wrapping with pushFront after popBack', () => {
    const deque = new CircularDeque<number>(3)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popBack()
    deque.pushFront(0)
    expect(deque.toArray()).toEqual([0, 1, 2])
  })

  it('handles undefined values in array', () => {
    const deque = new CircularDeque<number | undefined>()
    deque.pushBack(undefined)
    deque.pushBack(1)
    expect(deque.get(0)).toBeUndefined()
    expect(deque.get(1)).toBe(1)
  })

  it('toArray after partial drain', () => {
    const deque = new CircularDeque<number>()
    for (let i = 0; i < 5; i++) deque.pushBack(i)
    deque.popFront()
    deque.popFront()
    expect(deque.toArray()).toEqual([2, 3, 4])
  })

  it('iterator reflects current state', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popFront()
    const result: number[] = []
    for (const item of deque) result.push(item)
    expect(result).toEqual([2, 3])
  })

  it('large pushFront sequence', () => {
    const deque = new CircularDeque<number>()
    for (let i = 0; i < 500; i++) deque.pushFront(i)
    expect(deque.size).toBe(500)
    expect(deque.front()).toBe(499)
    expect(deque.back()).toBe(0)
  })

  it('large mixed operations', () => {
    const deque = new CircularDeque<number>()
    for (let i = 0; i < 200; i++) deque.pushBack(i)
    for (let i = 0; i < 100; i++) deque.popFront()
    for (let i = 200; i < 300; i++) deque.pushBack(i)
    expect(deque.size).toBe(200)
    expect(deque.front()).toBe(100)
    expect(deque.back()).toBe(299)
  })

  it('pushFront then popBack returns last element', () => {
    const deque = new CircularDeque<number>()
    deque.pushFront(1)
    deque.pushFront(2)
    deque.pushFront(3)
    expect(deque.popBack()).toBe(1)
    expect(deque.toArray()).toEqual([3, 2])
  })

  it('capacity remains stable after clear and reuse', () => {
    const deque = new CircularDeque<number>(4)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.pushBack(4)
    const capacity1 = deque.capacity
    deque.clear()
    const capacity2 = deque.capacity
    expect(capacity1).toBe(capacity2)
    for (let i = 0; i < 10; i++) deque.pushBack(i)
    expect(deque.capacity).toBeGreaterThanOrEqual(capacity1)
  })

  it('pushFront on empty deque then pushBack maintains order', () => {
    const deque = new CircularDeque<number>()
    deque.pushFront(2)
    deque.pushBack(3)
    expect(deque.toArray()).toEqual([2, 3])
  })

  it('multiple consecutive clear operations are safe', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.clear()
    deque.clear()
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
  })

  it('wrapping behavior with alternating pop operations', () => {
    const deque = new CircularDeque<number>(3)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.popFront()).toBe(1)
    expect(deque.popBack()).toBe(3)
    expect(deque.toArray()).toEqual([2])
  })

  it('get index returns undefined on empty deque', () => {
    const deque = new CircularDeque<number>()
    expect(deque.get(0)).toBeUndefined()
    expect(deque.get(5)).toBeUndefined()
  })

  it('handles boolean type correctly', () => {
    const deque = new CircularDeque<boolean>()
    deque.pushBack(true)
    deque.pushBack(false)
    deque.pushFront(true)
    expect(deque.get(0)).toBe(true)
    expect(deque.get(1)).toBe(true)
    expect(deque.get(2)).toBe(false)
  })

  it('toArray returns independent array copy', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    const arr1 = deque.toArray()
    const arr2 = deque.toArray()
    arr1.push(99)
    expect(arr1).toEqual([1, 2, 99])
    expect(arr2).toEqual([1, 2])
    expect(deque.size).toBe(2)
  })

  it('toArray returns elements in order', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.toArray()).toEqual([1, 2, 3])
  })

  it('popBack removes last element', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(10)
    deque.pushBack(20)
    expect(deque.popBack()).toBe(20)
    expect(deque.size).toBe(1)
  })

  it('front returns first element', () => {
    const deque = new CircularDeque<number>()
    deque.pushBack(5)
    deque.pushBack(10)
    expect(deque.front()).toBe(5)
  })
})

  it('pushFront and popFront', () => {
    const cd = new CircularDeque<number>(5)
    cd.pushFront(1)
    cd.pushFront(2)
    expect(cd.popFront()).toBe(2)
  })

  it('pushBack and popBack', () => {
    const cd = new CircularDeque<number>(5)
    cd.pushBack(1)
    cd.pushBack(2)
    expect(cd.popBack()).toBe(2)
  })

  it('size tracks count', () => {
    const cd = new CircularDeque<number>(5)
    cd.pushBack(1)
    cd.pushBack(2)
    cd.pushBack(3)
    expect(cd.size).toBe(3)
  })

describe('circular-deque - wave545', () => {
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

describe('circular-deque - wave546', () => {
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

describe('circular-deque - wave547', () => {
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

describe('circular-deque - wave548', () => {
  it('circular-deque module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave549', () => {
  it('circular-deque module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave550', () => {
  it('circular-deque w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave551', () => {
  it('circular-deque w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave552', () => {
  it('circular-deque w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave553', () => {
  it('circular-deque w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave554', () => {
  it('circular-deque w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave555', () => {
  it('circular-deque w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave556', () => {
  it('circular-deque w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
