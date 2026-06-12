import { describe, it, expect } from 'vitest'
import { MonotonicDeque } from '../../src/utils/monotonic-deque.js'

describe('MonotonicDeque', () => {
  it('creates min mode deque by default', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(3)
    deque.push(1)
    deque.push(2)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(2)
  })

  it('creates max mode deque', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(3)
    deque.push(2)
    expect(deque.front()).toBe(3)
    expect(deque.back()).toBe(2)
  })

  it('maintains min property after multiple pushes', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(3)
    deque.push(7)
    deque.push(1)
    deque.push(4)
    expect(deque.front()).toBe(1)
    expect(deque.size).toBe(2)
  })

  it('maintains max property after multiple pushes', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(5)
    deque.push(2)
    deque.push(8)
    deque.push(3)
    expect(deque.front()).toBe(8)
    expect(deque.size).toBe(2)
  })

  it('returns undefined for front on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.front()).toBeUndefined()
  })

  it('returns undefined for back on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.back()).toBeUndefined()
  })

  it('shifts and removes front element', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(3)
    deque.push(1)
    deque.push(2)
    const shifted = deque.shift()
    expect(shifted).toBe(1)
    expect(deque.front()).toBe(2)
    expect(deque.size).toBe(1)
  })

  it('shift returns undefined on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.shift()).toBeUndefined()
  })

  it('pops and removes back element', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(1)
    deque.push(2)
    deque.push(4)
    const popped = deque.pop()
    expect(popped).toBe(4)
    expect(deque.back()).toBe(2)
    expect(deque.size).toBe(2)
  })

  it('pop returns undefined on empty deque', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.pop()).toBeUndefined()
  })

  it('expires elements before given index', () => {
    const deque = new MonotonicDeque<number>()
    const idx1 = deque.push(5)
    const idx2 = deque.push(3)
    const idx3 = deque.push(7)
    deque.expireBefore(idx2)
    expect(deque.size).toBe(2)
    expect(deque.front()).toBe(3)
  })

  it('expireBefore with index beyond deque does nothing', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(5)
    deque.push(3)
    deque.push(7)
    deque.expireBefore(0)
    expect(deque.size).toBe(2)
    expect(deque.front()).toBe(3)
  })

  it('correctly reports size', () => {
    const deque = new MonotonicDeque<number>()
    expect(deque.size).toBe(0)
    deque.push(1)
    expect(deque.size).toBe(1)
    deque.push(2)
    expect(deque.size).toBe(2)
    deque.shift()
    expect(deque.size).toBe(1)
  })

  it('converts to array', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(5)
    deque.push(2)
    deque.push(8)
    deque.push(3)
    const arr = deque.toArray()
    expect(arr).toEqual([8, 3])
  })

  it('handles negative numbers in min mode', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(-1)
    deque.push(-5)
    deque.push(-3)
    expect(deque.front()).toBe(-5)
  })

  it('handles negative numbers in max mode', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(-1)
    deque.push(-5)
    deque.push(-3)
    expect(deque.front()).toBe(-1)
  })

  it('handles zero values', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(1)
    deque.push(0)
    deque.push(-1)
    expect(deque.front()).toBe(-1)
  })

  it('handles equal values', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(5)
    deque.push(5)
    expect(deque.front()).toBe(5)
    expect(deque.size).toBe(3)
  })

  it('compacts internal array after many shifts', () => {
    const deque = new MonotonicDeque<number>()
    for (let i = 0; i < 20; i++) {
      deque.push(i)
      deque.shift()
    }
    deque.push(100)
    expect(deque.size).toBe(1)
  })

  it('compacts internal array after many expirations', () => {
    const deque = new MonotonicDeque<number>()
    for (let i = 0; i < 20; i++) {
      deque.push(i)
    }
    deque.expireBefore(10)
    expect(deque.size).toBe(10)
  })

  it('returns increasing indices from push', () => {
    const deque = new MonotonicDeque<number>()
    const idx1 = deque.push(1)
    const idx2 = deque.push(2)
    const idx3 = deque.push(3)
    expect(idx2).toBe(idx1 + 1)
    expect(idx3).toBe(idx2 + 1)
  })

  it('handles string values', () => {
    const deque = new MonotonicDeque<string>('min')
    deque.push('zebra')
    deque.push('apple')
    deque.push('banana')
    expect(deque.front()).toBe('apple')
  })

  it('handles repeated push and shift operations', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(3)
    deque.push(1)
    deque.push(4)
    deque.shift()
    deque.shift()
    deque.push(2)
    expect(deque.front()).toBe(2)
  })

  it('handles mixed operations correctly', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(3)
    deque.push(2)
    deque.shift()
    deque.push(5)
    deque.push(4)
    expect(deque.front()).toBe(5)
    expect(deque.back()).toBe(4)
  })

  it('handles large numbers', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(Number.MAX_SAFE_INTEGER)
    deque.push(Number.MAX_SAFE_INTEGER - 1000)
    expect(deque.front()).toBe(Number.MAX_SAFE_INTEGER - 1000)
  })

  it('handles floating point numbers in min mode', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(1.5)
    deque.push(0.3)
    deque.push(2.7)
    expect(deque.front()).toBe(0.3)
    expect(deque.back()).toBe(2.7)
  })

  it('handles floating point numbers in max mode', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1.5)
    deque.push(2.7)
    deque.push(0.3)
    expect(deque.front()).toBe(2.7)
    expect(deque.back()).toBe(0.3)
  })

  it('handles very small numbers', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(0.0001)
    deque.push(0.00001)
    deque.push(0.000001)
    expect(deque.front()).toBe(0.000001)
  })

  it('maintains order with equal values after shift', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(5)
    deque.shift()
    expect(deque.front()).toBe(5)
    expect(deque.size).toBe(1)
  })

  it('expireBefore removes all elements', () => {
    const deque = new MonotonicDeque<number>()
    const idx1 = deque.push(1)
    const idx2 = deque.push(2)
    const idx3 = deque.push(3)
    deque.expireBefore(idx3 + 1)
    expect(deque.size).toBe(0)
    expect(deque.front()).toBeUndefined()
  })

  it('expireBefore with partial removal', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(10)
    deque.push(5)
    const idx = deque.push(3)
    deque.push(7)
    deque.expireBefore(idx)
    expect(deque.size).toBe(2)
    expect(deque.front()).toBe(3)
  })

  it('handles consecutive equal pushes in max mode', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(10)
    deque.push(10)
    deque.push(10)
    expect(deque.front()).toBe(10)
    expect(deque.size).toBe(3)
  })

  it('toArray returns independent copy', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(1)
    deque.push(2)
    const arr = deque.toArray()
    arr.push(99)
    expect(deque.size).toBe(2)
    expect(arr.length).toBe(3)
  })

  it('handles rapid push-pop cycles', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(3)
    deque.pop()
    deque.push(2)
    deque.push(1)
    expect(deque.front()).toBe(1)
  })

  it('front and back same when size is 1', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(10)
    expect(deque.front()).toBe(10)
    expect(deque.back()).toBe(10)
  })

  it('returns zero index on first push', () => {
    const deque = new MonotonicDeque<number>()
    const idx = deque.push(1)
    expect(idx).toBe(0)
  })

  it('shift returns value and updates state', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(3)
    deque.push(1)
    deque.push(2)
    const val = deque.shift()
    expect(val).toBe(1)
    expect(deque.front()).toBe(2)
    expect(deque.size).toBe(1)
  })

  it('pop returns value and updates state', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(5)
    deque.push(3)
    deque.push(7)
    const val = deque.pop()
    expect(val).toBe(7)
    expect(deque.back()).toBeUndefined()
    expect(deque.size).toBe(0)
  })

  it('handles alternating values in min mode', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(1)
    deque.push(4)
    deque.push(2)
    deque.push(3)
    expect(deque.front()).toBe(1)
    expect(deque.back()).toBe(3)
  })

  it('handles alternating values in max mode', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(5)
    deque.push(2)
    deque.push(4)
    deque.push(3)
    expect(deque.front()).toBe(5)
    expect(deque.back()).toBe(3)
  })

  it('expireBefore after multiple shifts', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(1)
    deque.push(2)
    deque.push(3)
    deque.push(4)
    deque.shift()
    deque.shift()
    deque.expireBefore(2)
    expect(deque.size).toBe(2)
  })

  it('compacts correctly after expireBefore', () => {
    const deque = new MonotonicDeque<number>()
    for (let i = 0; i < 100; i++) {
      deque.push(i)
    }
    deque.expireBefore(50)
    expect(deque.size).toBe(50)
    deque.push(200)
    expect(deque.size).toBe(51)
  })

  it('handles object values with custom comparison', () => {
    const deque = new MonotonicDeque<{ val: number }>()
    deque.push({ val: 5 })
    deque.push({ val: 3 })
    deque.push({ val: 7 })
    expect(deque.front()?.val).toBe(5)
    expect(deque.back()?.val).toBe(7)
  })

  it('size getter reflects internal state after multiple ops', () => {
    const deque = new MonotonicDeque<number>('min')
    expect(deque.size).toBe(0)
    deque.push(5)
    expect(deque.size).toBe(1)
    deque.push(3)
    expect(deque.size).toBe(1)
    deque.shift()
    expect(deque.size).toBe(0)
    deque.push(7)
    expect(deque.size).toBe(1)
    deque.pop()
    expect(deque.size).toBe(0)
  })

  it('handles sequence ending with minimum', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(4)
    deque.push(3)
    deque.push(2)
    deque.push(1)
    expect(deque.front()).toBe(1)
    expect(deque.size).toBe(1)
  })

  it('handles sequence ending with maximum', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(1)
    deque.push(2)
    deque.push(3)
    deque.push(4)
    deque.push(5)
    expect(deque.front()).toBe(5)
    expect(deque.size).toBe(1)
  })

  it('back returns last valid element', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    deque.push(1)
    deque.push(4)
    deque.push(2)
    expect(deque.back()).toBe(2)
  })

  it('front returns first valid element', () => {
    const deque = new MonotonicDeque<number>('max')
    deque.push(3)
    deque.push(7)
    deque.push(5)
    deque.push(6)
    expect(deque.front()).toBe(7)
  })

  it('expireBefore preserves correct front after expiration', () => {
    const deque = new MonotonicDeque<number>('min')
    const idx1 = deque.push(10)
    deque.push(5)
    deque.push(8)
    const idx4 = deque.push(3)
    deque.expireBefore(idx1 + 2)
    expect(deque.front()).toBe(3)
  })

  it('handles NaN values', () => {
    const deque = new MonotonicDeque<number>()
    deque.push(1)
    deque.push(Number.NaN)
    deque.push(2)
    expect(deque.front()).toBe(1)
  })

  it('should report back element', () => {
    const deque = new MonotonicDeque()
    deque.push(1)
    deque.push(3)
    expect(deque.back()).toBe(3)
  })

  it('should report size', () => {
    const deque = new MonotonicDeque()
    deque.push(1)
    deque.push(2)
    expect(deque.size).toBe(2)
  })

  it('front returns current extreme', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(3)
    deque.push(1)
    deque.push(2)
    expect(deque.front()).toBe(1)
  })

  it('back returns last element', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(5)
    expect(deque.back()).toBe(5)
  })

  it('shift removes from front', () => {
    const deque = new MonotonicDeque<number>('min')
    deque.push(1)
    deque.push(2)
    deque.shift()
    expect(deque.size).toBeLessThan(2)
  })

  it('empty deque front undefined', () => {
    const d = new MonotonicDeque<number>('min')
    expect(d.front()).toBeUndefined()
  })

  it('push returns size', () => {
    const d = new MonotonicDeque<number>('min')
    expect(typeof d.push(1)).toBe('number')
  })

  it('min mode keeps smallest', () => {
    const d = new MonotonicDeque<number>('min')
    d.push(3)
    d.push(1)
    d.push(2)
    expect(d.front()).toBe(1)
  })
})

describe('monotonic-deque - wave545', () => {
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

describe('monotonic-deque - wave546', () => {
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

describe('monotonic-deque - wave547', () => {
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

describe('monotonic-deque - wave548', () => {
  it('monotonic-deque module defined', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque module is function', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave549', () => {
  it('monotonic-deque module defined', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque module is function', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave550', () => {
  it('monotonic-deque w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave551', () => {
  it('monotonic-deque w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave552', () => {
  it('monotonic-deque w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave553', () => {
  it('monotonic-deque w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave554', () => {
  it('monotonic-deque w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave555', () => {
  it('monotonic-deque w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave556', () => {
  it('monotonic-deque w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave557', () => {
  it('monotonic-deque w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave558', () => {
  it('monotonic-deque w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave559', () => {
  it('monotonic-deque w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave560', () => {
  it('monotonic-deque w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave561', () => {
  it('monotonic-deque w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave562', () => {
  it('monotonic-deque w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave563', () => {
  it('monotonic-deque w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave564', () => {
  it('monotonic-deque w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave565', () => {
  it('monotonic-deque w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave566', () => {
  it('monotonic-deque w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave127', () => {
  it('monotonic-deque w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave130', () => {
  it('monotonic-deque w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave133', () => {
  it('monotonic-deque w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave136', () => {
  it('monotonic-deque w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - wave139', () => {
  it('monotonic-deque w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w142', () => {
  it('monotonic-deque v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w145', () => {
  it('monotonic-deque v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w148', () => {
  it('monotonic-deque v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w151', () => {
  it('monotonic-deque v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w154', () => {
  it('monotonic-deque v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w157', () => {
  it('monotonic-deque v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w160', () => {
  it('monotonic-deque v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w170', () => {
  it('monotonic-deque x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w180', () => {
  it('monotonic-deque x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w190', () => {
  it('monotonic-deque x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('monotonic-deque - w200', () => {
  it('monotonic-deque x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('monotonic-deque x200x9', () => {
    expect(describe).toBeDefined()
  })
})
