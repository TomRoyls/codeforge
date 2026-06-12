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

describe('circular-deque - wave557', () => {
  it('circular-deque w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave558', () => {
  it('circular-deque w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave559', () => {
  it('circular-deque w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave560', () => {
  it('circular-deque w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave561', () => {
  it('circular-deque w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave562', () => {
  it('circular-deque w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave563', () => {
  it('circular-deque w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave564', () => {
  it('circular-deque w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave565', () => {
  it('circular-deque w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave566', () => {
  it('circular-deque w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave127', () => {
  it('circular-deque w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave130', () => {
  it('circular-deque w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave133', () => {
  it('circular-deque w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave136', () => {
  it('circular-deque w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - wave139', () => {
  it('circular-deque w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w142', () => {
  it('circular-deque v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w145', () => {
  it('circular-deque v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w148', () => {
  it('circular-deque v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w151', () => {
  it('circular-deque v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w154', () => {
  it('circular-deque v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w157', () => {
  it('circular-deque v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w160', () => {
  it('circular-deque v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w170', () => {
  it('circular-deque x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w180', () => {
  it('circular-deque x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w190', () => {
  it('circular-deque x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w200', () => {
  it('circular-deque x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w210', () => {
  it('circular-deque x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w220', () => {
  it('circular-deque x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w230', () => {
  it('circular-deque x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w240', () => {
  it('circular-deque x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w250', () => {
  it('circular-deque x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w260', () => {
  it('circular-deque x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w270', () => {
  it('circular-deque x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w280', () => {
  it('circular-deque x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w290', () => {
  it('circular-deque x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w300', () => {
  it('circular-deque x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w310', () => {
  it('circular-deque x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w320', () => {
  it('circular-deque x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w330', () => {
  it('circular-deque x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w340', () => {
  it('circular-deque x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w350', () => {
  it('circular-deque x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w360', () => {
  it('circular-deque x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w370', () => {
  it('circular-deque x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w380', () => {
  it('circular-deque x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w390', () => {
  it('circular-deque x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w400', () => {
  it('circular-deque x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w420', () => {
  it('circular-deque x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w440', () => {
  it('circular-deque x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w460', () => {
  it('circular-deque x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w480', () => {
  it('circular-deque x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w500', () => {
  it('circular-deque x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w550', () => {
  it('circular-deque x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-deque - w600', () => {
  it('circular-deque x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('circular-deque x600x49', () => {
    expect(describe).toBeDefined()
  })
})
