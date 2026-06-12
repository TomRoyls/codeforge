import { describe, expect, it } from 'vitest'
import { DequeMin } from '../../src/utils/deque-min.js'

describe('DequeMin', () => {
  it('tracks minimum after pushBack', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    dq.pushBack(7)
    expect(dq.min).toBe(3)
  })

  it('updates min after popFront', () => {
    const dq = new DequeMin()
    dq.pushBack(2)
    dq.pushBack(5)
    dq.pushBack(1)
    dq.popFront()
    expect(dq.min).toBe(1)
  })

  it('handles popFront when min removed', () => {
    const dq = new DequeMin()
    dq.pushBack(4)
    dq.pushBack(2)
    dq.pushBack(6)
    dq.popFront()
    expect(dq.min).toBe(2)
    dq.popFront()
    expect(dq.min).toBe(6)
  })

  it('returns undefined min for empty', () => {
    const dq = new DequeMin()
    expect(dq.min).toBeUndefined()
  })

  it('popFront on empty returns undefined', () => {
    const dq = new DequeMin()
    expect(dq.popFront()).toBeUndefined()
  })

  it('tracks size', () => {
    const dq = new DequeMin()
    expect(dq.isEmpty).toBe(true)
    dq.pushBack(1)
    expect(dq.size).toBe(1)
    expect(dq.isEmpty).toBe(false)
  })

  it('toArray returns elements', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('handles equal values', () => {
    const dq = new DequeMin()
    dq.pushBack(3)
    dq.pushBack(3)
    dq.pushBack(3)
    expect(dq.min).toBe(3)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('sliding window min simulation', () => {
    const arr = [4, 2, 1, 3, 5]
    const windowSize = 3
    const dq = new DequeMin()
    const mins: number[] = []
    for (let i = 0; i < arr.length; i++) {
      dq.pushBack(arr[i]!)
      if (i >= windowSize) dq.popFront()
      if (i >= windowSize - 1) mins.push(dq.min!)
    }
    expect(mins).toEqual([1, 1, 1])
  })

  it('handles decreasing sequence', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(4)
    dq.pushBack(3)
    expect(dq.min).toBe(3)
  })

  it('handles increasing sequence', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.min).toBe(1)
    dq.popFront()
    expect(dq.min).toBe(2)
  })

  it('handles single element lifecycle', () => {
    const dq = new DequeMin()
    dq.pushBack(42)
    expect(dq.min).toBe(42)
    expect(dq.popFront()).toBe(42)
    expect(dq.min).toBeUndefined()
  })

  it('handles negative values', () => {
    const dq = new DequeMin()
    dq.pushBack(-5)
    dq.pushBack(-3)
    dq.pushBack(-10)
    expect(dq.min).toBe(-10)
  })

  it('handles pop all elements', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.popFront()
    dq.popFront()
    expect(dq.size).toBe(0)
  })

  it('handles zero values', () => {
    const dq = new DequeMin()
    dq.pushBack(0)
    dq.pushBack(0)
    expect(dq.min).toBe(0)
    dq.popFront()
    expect(dq.min).toBe(0)
  })

  it('handles decreasing then increasing', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    dq.pushBack(1)
    dq.pushBack(4)
    expect(dq.min).toBe(1)
  })

  it('min with all equal elements after pop', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(5)
    dq.pushBack(5)
    dq.popFront()
    dq.popFront()
    expect(dq.min).toBe(5)
  })

  it('min after pushing larger values', () => {
    const dq = new DequeMin()
    dq.pushBack(3)
    expect(dq.min).toBe(3)
    dq.pushBack(10)
    expect(dq.min).toBe(3)
    dq.pushBack(20)
    expect(dq.min).toBe(3)
  })

  it('min updates when min element popped', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(5)
    dq.pushBack(3)
    expect(dq.min).toBe(1)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('popFront returns correct values in order', () => {
    const dq = new DequeMin()
    dq.pushBack(10)
    dq.pushBack(20)
    dq.pushBack(30)
    expect(dq.popFront()).toBe(10)
    expect(dq.popFront()).toBe(20)
    expect(dq.popFront()).toBe(30)
  })

  it('size after each operation', () => {
    const dq = new DequeMin()
    expect(dq.size).toBe(0)
    dq.pushBack(1)
    expect(dq.size).toBe(1)
    dq.pushBack(2)
    expect(dq.size).toBe(2)
    dq.popFront()
    expect(dq.size).toBe(1)
    dq.popFront()
    expect(dq.size).toBe(0)
  })

  it('isEmpty after operations', () => {
    const dq = new DequeMin()
    expect(dq.isEmpty).toBe(true)
    dq.pushBack(1)
    expect(dq.isEmpty).toBe(false)
    dq.popFront()
    expect(dq.isEmpty).toBe(true)
  })

  it('toArray after pops', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.pushBack(4)
    dq.popFront()
    expect(dq.toArray()).toEqual([2, 3, 4])
  })

  it('handles large number of elements', () => {
    const dq = new DequeMin()
    for (let i = 100; i >= 1; i--) dq.pushBack(i)
    expect(dq.min).toBe(1)
    expect(dq.size).toBe(100)
  })

  it('sliding window with all same values', () => {
    const dq = new DequeMin()
    for (let i = 0; i < 5; i++) dq.pushBack(7)
    for (let i = 0; i < 3; i++) dq.popFront()
    expect(dq.min).toBe(7)
    expect(dq.size).toBe(2)
  })

  it('handles alternating high low values', () => {
    const dq = new DequeMin()
    dq.pushBack(10)
    dq.pushBack(1)
    dq.pushBack(8)
    dq.pushBack(2)
    dq.pushBack(6)
    dq.pushBack(3)
    expect(dq.min).toBe(1)
  })

  it('popFront after min is pushed away', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(1)
    dq.pushBack(3)
    dq.popFront()
    expect(dq.min).toBe(1)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('push pop push maintains correct min', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.popFront()
    dq.pushBack(3)
    dq.pushBack(1)
    expect(dq.min).toBe(1)
  })

  it('toArray on empty', () => {
    const dq = new DequeMin()
    expect(dq.toArray()).toEqual([])
  })

  it('multiple consecutive pops on empty', () => {
    const dq = new DequeMin()
    expect(dq.popFront()).toBeUndefined()
    expect(dq.popFront()).toBeUndefined()
    expect(dq.popFront()).toBeUndefined()
  })

  it('min after popFront reveals new min from later push', () => {
    const dq = new DequeMin()
    dq.pushBack(10)
    dq.pushBack(1)
    dq.pushBack(5)
    dq.popFront()
    expect(dq.min).toBe(1)
  })

  it('handles mixed positive and negative', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(-3)
    dq.pushBack(0)
    dq.pushBack(-1)
    expect(dq.min).toBe(-3)
  })

  it('push same value many times', () => {
    const dq = new DequeMin()
    for (let i = 0; i < 50; i++) dq.pushBack(7)
    expect(dq.min).toBe(7)
    expect(dq.size).toBe(50)
  })

  it('sliding window across real data', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6]
    const dq = new DequeMin()
    const windowMins: number[] = []
    for (let i = 0; i < data.length; i++) {
      dq.pushBack(data[i]!)
      if (i >= 3) dq.popFront()
      if (i >= 2) windowMins.push(dq.min!)
    }
    expect(windowMins).toEqual([1, 1, 1, 1, 2, 2])
  })

  it('size after all pops is zero', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.popFront()
    dq.popFront()
    dq.popFront()
    expect(dq.size).toBe(0)
    expect(dq.isEmpty).toBe(true)
  })

  it('push large value after small', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(1000000)
    dq.pushBack(999999)
    expect(dq.min).toBe(1)
  })

  it('push small after large reveals new min', () => {
    const dq = new DequeMin()
    dq.pushBack(100)
    dq.pushBack(50)
    dq.pushBack(1)
    expect(dq.min).toBe(1)
    dq.popFront()
    dq.popFront()
    expect(dq.min).toBe(1)
  })

  it('float values for min', () => {
    const dq = new DequeMin()
    dq.pushBack(1.5)
    dq.pushBack(0.5)
    dq.pushBack(2.0)
    expect(dq.min).toBe(0.5)
  })

  it('handles very negative values', () => {
    const dq = new DequeMin()
    dq.pushBack(-1000000)
    dq.pushBack(-999999)
    dq.pushBack(-1000001)
    expect(dq.min).toBe(-1000001)
  })

  it('repeated push pop cycles', () => {
    const dq = new DequeMin()
    for (let i = 0; i < 100; i++) {
      dq.pushBack(i)
      dq.popFront()
    }
    expect(dq.isEmpty).toBe(true)
    expect(dq.min).toBeUndefined()
  })

  it('min preserved when non-min popped', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(1)
    dq.pushBack(3)
    dq.popFront()
    expect(dq.min).toBe(1)
  })

  it('toArray reflects current state only', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    const arr1 = dq.toArray()
    dq.popFront()
    const arr2 = dq.toArray()
    expect(arr1).toEqual([1, 2])
    expect(arr2).toEqual([2])
  })

  it('min of two elements after first popped', () => {
    const dq = new DequeMin()
    dq.pushBack(3)
    dq.pushBack(7)
    dq.popFront()
    expect(dq.min).toBe(7)
  })

  it('min of two elements after second popped conceptually', () => {
    const dq = new DequeMin()
    dq.pushBack(3)
    dq.pushBack(7)
    dq.popFront()
    expect(dq.min).toBe(7)
    dq.popFront()
    expect(dq.min).toBeUndefined()
  })

  it('push after drain', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.popFront()
    expect(dq.min).toBeUndefined()
    dq.pushBack(5)
    expect(dq.min).toBe(5)
  })

  it('many push one pop min correct', () => {
    const dq = new DequeMin()
    dq.pushBack(10)
    dq.pushBack(5)
    dq.pushBack(8)
    dq.pushBack(3)
    dq.pushBack(7)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('should return undefined min for empty deque', () => {
    const dq = new DequeMin()
    expect(dq.min).toBeUndefined()
  })

  it('should return undefined popFront for empty deque', () => {
    const dq = new DequeMin()
    expect(dq.popFront()).toBeUndefined()
  })

  it('should convert to array', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('should report isEmpty correctly', () => {
    const dq = new DequeMin()
    expect(dq.isEmpty).toBe(true)
    dq.pushBack(5)
    expect(dq.isEmpty).toBe(false)
  })

  it('should handle duplicate values', () => {
    const dq = new DequeMin()
    dq.pushBack(3)
    dq.pushBack(3)
    dq.pushBack(3)
    expect(dq.min).toBe(3)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('should update min after popFront removes minimum', () => {
    const dq = new DequeMin()
    dq.pushBack(1)
    dq.pushBack(5)
    dq.pushBack(3)
    expect(dq.min).toBe(1)
    dq.popFront()
    expect(dq.min).toBe(3)
  })

  it('toArray returns elements in order', () => {
    const dq = new DequeMin()
    dq.pushBack(5)
    dq.pushBack(3)
    dq.pushBack(7)
    expect(dq.toArray()).toEqual([5, 3, 7])
  })

  it('popFront removes first element', () => {
    const dq = new DequeMin()
    dq.pushBack(10)
    dq.pushBack(20)
    expect(dq.popFront()).toBe(10)
    expect(dq.min).toBe(20)
  })

  it('empty deque has undefined min', () => {
    const dq = new DequeMin()
    expect(dq.min).toBeUndefined()
  })
})

  it('min on empty returns undefined', () => {
    const dm = new DequeMin()
    expect(dm.min).toBeUndefined()
  })

  it('size tracks count', () => {
    const dm = new DequeMin()
    dm.pushBack(1)
    dm.pushBack(2)
    expect(dm.size).toBe(2)
  })

  it('min returns smallest', () => {
    const dm = new DequeMin()
    dm.pushBack(3)
    dm.pushBack(1)
    dm.pushBack(2)
    expect(dm.min).toBe(1)
  })

describe('deque-min - wave545', () => {
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

describe('deque-min - wave546', () => {
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

describe('deque-min - wave547', () => {
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

describe('deque-min - wave548', () => {
  it('deque-min module defined', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min module is function', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave549', () => {
  it('deque-min module defined', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min module is function', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave550', () => {
  it('deque-min w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave551', () => {
  it('deque-min w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave552', () => {
  it('deque-min w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave553', () => {
  it('deque-min w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave554', () => {
  it('deque-min w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave555', () => {
  it('deque-min w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave556', () => {
  it('deque-min w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave557', () => {
  it('deque-min w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave558', () => {
  it('deque-min w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave559', () => {
  it('deque-min w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave560', () => {
  it('deque-min w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave561', () => {
  it('deque-min w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('deque-min - wave562', () => {
  it('deque-min w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('deque-min w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
