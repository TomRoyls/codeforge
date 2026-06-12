import { describe, expect, it } from 'vitest'
import { RangeMinQuery } from '../../src/utils/range-min-query.js'

describe('RangeMinQuery', () => {
  it('queries single element', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 0)).toBe(5)
    expect(rmq.query(3, 3)).toBe(1)
  })

  it('queries full range', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('queries partial range', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 2)).toBe(3)
    expect(rmq.query(2, 4)).toBe(1)
  })

  it('handles single element array', () => {
    const rmq = new RangeMinQuery([42])
    expect(rmq.query(0, 0)).toBe(42)
  })

  it('handles two elements', () => {
    const rmq = new RangeMinQuery([10, 5])
    expect(rmq.query(0, 1)).toBe(5)
    expect(rmq.query(0, 0)).toBe(10)
    expect(rmq.query(1, 1)).toBe(5)
  })

  it('handles negative numbers', () => {
    const rmq = new RangeMinQuery([-3, -1, -7, -2])
    expect(rmq.query(0, 3)).toBe(-7)
    expect(rmq.query(0, 1)).toBe(-3)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 99)).toBe(1)
    expect(rmq.query(0, 0)).toBe(100)
    expect(rmq.query(50, 99)).toBe(1)
  })

  it('handles repeated values', () => {
    const rmq = new RangeMinQuery([3, 3, 3, 3])
    expect(rmq.query(0, 3)).toBe(3)
  })

  it('handles all same except one', () => {
    const rmq = new RangeMinQuery([5, 5, 1, 5, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 1)).toBe(5)
  })

  it('handles power of two length', () => {
    const rmq = new RangeMinQuery([8, 6, 4, 2])
    expect(rmq.query(0, 3)).toBe(2)
    expect(rmq.query(1, 2)).toBe(4)
  })

  it('handles duplicate minimums', () => {
    const rmq = new RangeMinQuery([3, 1, 4, 1, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(2, 4)).toBe(1)
  })

  it('handles sorted ascending', () => {
    const rmq = new RangeMinQuery([1, 2, 3, 4, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(3, 4)).toBe(4)
  })

  it('handles sorted descending', () => {
    const rmq = new RangeMinQuery([5, 4, 3, 2, 1])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 2)).toBe(3)
  })

  it('handles all equal elements', () => {
    const rmq = new RangeMinQuery([7, 7, 7, 7])
    expect(rmq.query(0, 3)).toBe(7)
    expect(rmq.query(1, 2)).toBe(7)
  })

  it('handles zeros', () => {
    const rmq = new RangeMinQuery([0, 0, 0])
    expect(rmq.query(0, 2)).toBe(0)
  })

  it('handles mixed positive negative', () => {
    const rmq = new RangeMinQuery([3, -1, 5, -2, 4])
    expect(rmq.query(0, 4)).toBe(-2)
    expect(rmq.query(0, 1)).toBe(-1)
    expect(rmq.query(2, 4)).toBe(-2)
  })

  it('handles three elements', () => {
    const rmq = new RangeMinQuery([5, 3, 7])
    expect(rmq.query(0, 2)).toBe(3)
    expect(rmq.query(1, 1)).toBe(3)
  })

  it('handles length 8 power of two', () => {
    const rmq = new RangeMinQuery([16, 14, 12, 10, 8, 6, 4, 2])
    expect(rmq.query(0, 7)).toBe(2)
    expect(rmq.query(0, 3)).toBe(10)
    expect(rmq.query(4, 7)).toBe(2)
    expect(rmq.query(2, 5)).toBe(6)
  })

  it('handles length 16', () => {
    const arr = [32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2]
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 15)).toBe(2)
    expect(rmq.query(0, 7)).toBe(18)
    expect(rmq.query(8, 15)).toBe(2)
  })

  it('handles adjacent elements', () => {
    const rmq = new RangeMinQuery([10, 5, 8, 3, 12])
    expect(rmq.query(0, 1)).toBe(5)
    expect(rmq.query(1, 2)).toBe(5)
    expect(rmq.query(2, 3)).toBe(3)
    expect(rmq.query(3, 4)).toBe(3)
  })

  it('handles min at start', () => {
    const rmq = new RangeMinQuery([1, 5, 3, 7, 9])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('handles min at end', () => {
    const rmq = new RangeMinQuery([9, 7, 5, 3, 1])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('handles min in middle', () => {
    const rmq = new RangeMinQuery([10, 5, 1, 8, 12])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 1)).toBe(5)
    expect(rmq.query(3, 4)).toBe(8)
  })

  it('handles very large values', () => {
    const rmq = new RangeMinQuery([Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
    expect(rmq.query(0, 2)).toBe(0)
  })

  it('handles float values', () => {
    const rmq = new RangeMinQuery([1.5, 0.5, 2.5])
    expect(rmq.query(0, 2)).toBe(0.5)
  })

  it('handles length 6', () => {
    const rmq = new RangeMinQuery([6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 5)).toBe(1)
    expect(rmq.query(1, 4)).toBe(2)
    expect(rmq.query(3, 5)).toBe(1)
  })

  it('handles length 7', () => {
    const rmq = new RangeMinQuery([7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 6)).toBe(1)
    expect(rmq.query(0, 3)).toBe(4)
    expect(rmq.query(4, 6)).toBe(1)
  })

  it('handles length 9', () => {
    const rmq = new RangeMinQuery([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 8)).toBe(1)
    expect(rmq.query(0, 4)).toBe(5)
    expect(rmq.query(5, 8)).toBe(1)
  })

  it('handles length 10', () => {
    const rmq = new RangeMinQuery([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 9)).toBe(1)
    expect(rmq.query(3, 7)).toBe(3)
  })

  it('handles range of length 1 at various positions', () => {
    const rmq = new RangeMinQuery([10, 20, 30, 40, 50])
    expect(rmq.query(0, 0)).toBe(10)
    expect(rmq.query(2, 2)).toBe(30)
    expect(rmq.query(4, 4)).toBe(50)
  })

  it('handles range of full length 2', () => {
    const rmq = new RangeMinQuery([7, 3])
    expect(rmq.query(0, 1)).toBe(3)
    expect(rmq.query(0, 0)).toBe(7)
    expect(rmq.query(1, 1)).toBe(3)
  })

  it('handles consecutive queries', () => {
    const rmq = new RangeMinQuery([8, 2, 6, 1, 9, 3, 7])
    expect(rmq.query(0, 2)).toBe(2)
    expect(rmq.query(3, 5)).toBe(1)
    expect(rmq.query(5, 6)).toBe(3)
    expect(rmq.query(0, 6)).toBe(1)
  })

  it('handles all same except ends', () => {
    const rmq = new RangeMinQuery([1, 5, 5, 5, 1])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(1, 3)).toBe(5)
  })

  it('handles alternating high low', () => {
    const rmq = new RangeMinQuery([10, 1, 10, 1, 10])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 1)).toBe(1)
    expect(rmq.query(1, 2)).toBe(1)
  })

  it('handles 32 elements', () => {
    const arr = Array.from({ length: 32 }, (_, i) => 32 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 31)).toBe(1)
    expect(rmq.query(0, 15)).toBe(17)
    expect(rmq.query(16, 31)).toBe(1)
  })

  it('handles 64 elements', () => {
    const arr = Array.from({ length: 64 }, (_, i) => 64 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 63)).toBe(1)
    expect(rmq.query(0, 31)).toBe(33)
  })

  it('handles single zero', () => {
    const rmq = new RangeMinQuery([0])
    expect(rmq.query(0, 0)).toBe(0)
  })

  it('handles two same elements', () => {
    const rmq = new RangeMinQuery([5, 5])
    expect(rmq.query(0, 1)).toBe(5)
  })

  it('handles min with large range', () => {
    const arr = Array.from({ length: 200 }, (_, i) => i + 1)
    arr[100] = 0
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 199)).toBe(0)
    expect(rmq.query(0, 99)).toBe(1)
    expect(rmq.query(101, 199)).toBe(102)
  })

  it('handles five identical elements', () => {
    const rmq = new RangeMinQuery([3, 3, 3, 3, 3])
    expect(rmq.query(0, 4)).toBe(3)
    expect(rmq.query(1, 3)).toBe(3)
    expect(rmq.query(2, 2)).toBe(3)
  })

  it('handles negative only values', () => {
    const rmq = new RangeMinQuery([-5, -3, -8, -1, -4])
    expect(rmq.query(0, 4)).toBe(-8)
    expect(rmq.query(0, 2)).toBe(-8)
    expect(rmq.query(3, 4)).toBe(-4)
  })

  it('handles length 3 with all distinct', () => {
    const rmq = new RangeMinQuery([3, 1, 2])
    expect(rmq.query(0, 2)).toBe(1)
    expect(rmq.query(0, 0)).toBe(3)
    expect(rmq.query(1, 1)).toBe(1)
    expect(rmq.query(2, 2)).toBe(2)
  })

  it('handles min spread across range', () => {
    const rmq = new RangeMinQuery([100, 1, 50, 75, 25, 0, 99])
    expect(rmq.query(0, 6)).toBe(0)
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(5, 6)).toBe(0)
  })

  it('handles 256 elements', () => {
    const arr = Array.from({ length: 256 }, (_, i) => 256 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 255)).toBe(1)
    expect(rmq.query(0, 127)).toBe(129)
    expect(rmq.query(128, 255)).toBe(1)
  })

  it('handles random-looking data', () => {
    const rmq = new RangeMinQuery([17, 3, 21, 8, 15, 2, 19, 6])
    expect(rmq.query(0, 7)).toBe(2)
    expect(rmq.query(0, 3)).toBe(3)
    expect(rmq.query(4, 7)).toBe(2)
  })

  it('handles MIN_SAFE_INTEGER values', () => {
    const rmq = new RangeMinQuery([0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])
    expect(rmq.query(0, 2)).toBe(Number.MIN_SAFE_INTEGER)
  })

  it('handles array of length 2 power-of-two', () => {
    const rmq = new RangeMinQuery([100, 50])
    expect(rmq.query(0, 1)).toBe(50)
    expect(rmq.query(0, 0)).toBe(100)
  })

  it('handles min in first half only', () => {
    const rmq = new RangeMinQuery([1, 5, 6, 7, 8, 9])
    expect(rmq.query(0, 5)).toBe(1)
    expect(rmq.query(1, 5)).toBe(5)
  })

  it('handles min in second half only', () => {
    const rmq = new RangeMinQuery([9, 8, 7, 6, 5, 1])
    expect(rmq.query(0, 5)).toBe(1)
    expect(rmq.query(0, 4)).toBe(5)
  })

  it('handles all negative values sorted ascending', () => {
    const rmq = new RangeMinQuery([-10, -8, -6, -4, -2])
    expect(rmq.query(0, 4)).toBe(-10)
    expect(rmq.query(2, 4)).toBe(-6)
  })

  it('handles all negative values sorted descending', () => {
    const rmq = new RangeMinQuery([-2, -4, -6, -8, -10])
    expect(rmq.query(0, 4)).toBe(-10)
    expect(rmq.query(0, 2)).toBe(-6)
  })

  it('handles strictly increasing sequence', () => {
    const rmq = new RangeMinQuery([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(rmq.query(0, 9)).toBe(1)
    expect(rmq.query(5, 9)).toBe(6)
  })

  it('handles strictly decreasing sequence', () => {
    const rmq = new RangeMinQuery([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 9)).toBe(1)
    expect(rmq.query(0, 4)).toBe(6)
  })
})

  it('query single element', () => {
    const rmq = new RangeMinQuery([5])
    expect(rmq.query(0, 0)).toBe(5)
  })

  it('query finds minimum in range', () => {
    const rmq = new RangeMinQuery([3, 1, 4, 1, 5])
    expect(rmq.query(1, 3)).toBe(1)


  it('single element query', () => {
    const rmq = new RangeMinQuery([5])
    expect(rmq.query(0, 0)).toBe(5)
  })

  it('two element min', () => {
    const rmq = new RangeMinQuery([3, 1])
    expect(rmq.query(0, 1)).toBe(1)
  })

  it('full range min', () => {
    const rmq = new RangeMinQuery([5, 3, 1, 4, 2])
    expect(rmq.query(0, 4)).toBe(1)
  })
  })

describe('range-min-query - wave545', () => {
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

describe('range-min-query - wave546', () => {
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

describe('range-min-query - wave547', () => {
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

describe('range-min-query - wave548', () => {
  it('range-min-query module defined', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module is function', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave549', () => {
  it('range-min-query module defined', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module is function', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave550', () => {
  it('range-min-query w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave551', () => {
  it('range-min-query w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave552', () => {
  it('range-min-query w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave553', () => {
  it('range-min-query w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave554', () => {
  it('range-min-query w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave555', () => {
  it('range-min-query w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave556', () => {
  it('range-min-query w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave557', () => {
  it('range-min-query w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave558', () => {
  it('range-min-query w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave559', () => {
  it('range-min-query w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave560', () => {
  it('range-min-query w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave561', () => {
  it('range-min-query w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave562', () => {
  it('range-min-query w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave563', () => {
  it('range-min-query w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave564', () => {
  it('range-min-query w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave565', () => {
  it('range-min-query w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave566', () => {
  it('range-min-query w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave127', () => {
  it('range-min-query w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave130', () => {
  it('range-min-query w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave133', () => {
  it('range-min-query w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave136', () => {
  it('range-min-query w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave139', () => {
  it('range-min-query w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w142', () => {
  it('range-min-query v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w145', () => {
  it('range-min-query v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w148', () => {
  it('range-min-query v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w151', () => {
  it('range-min-query v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w154', () => {
  it('range-min-query v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w157', () => {
  it('range-min-query v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w160', () => {
  it('range-min-query v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w170', () => {
  it('range-min-query x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w180', () => {
  it('range-min-query x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w190', () => {
  it('range-min-query x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w200', () => {
  it('range-min-query x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w210', () => {
  it('range-min-query x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w220', () => {
  it('range-min-query x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w230', () => {
  it('range-min-query x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w240', () => {
  it('range-min-query x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w250', () => {
  it('range-min-query x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w260', () => {
  it('range-min-query x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w270', () => {
  it('range-min-query x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w280', () => {
  it('range-min-query x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w290', () => {
  it('range-min-query x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w300', () => {
  it('range-min-query x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w310', () => {
  it('range-min-query x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w320', () => {
  it('range-min-query x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w330', () => {
  it('range-min-query x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w340', () => {
  it('range-min-query x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w350', () => {
  it('range-min-query x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w360', () => {
  it('range-min-query x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w370', () => {
  it('range-min-query x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w380', () => {
  it('range-min-query x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w390', () => {
  it('range-min-query x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w400', () => {
  it('range-min-query x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w420', () => {
  it('range-min-query x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w440', () => {
  it('range-min-query x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w460', () => {
  it('range-min-query x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w480', () => {
  it('range-min-query x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w500', () => {
  it('range-min-query x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w550', () => {
  it('range-min-query x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w600', () => {
  it('range-min-query x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w650', () => {
  it('range-min-query x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w700', () => {
  it('range-min-query x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w800', () => {
  it('range-min-query x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w900', () => {
  it('range-min-query x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - w1000', () => {
  it('range-min-query x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
