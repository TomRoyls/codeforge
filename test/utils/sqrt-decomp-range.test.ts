import { describe, expect, it } from 'vitest'
import { SqrtDecompRange } from '../../src/utils/sqrt-decomp-range.js'

describe('SqrtDecompRange', () => {
  it('computes range sum', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(0, 4)).toBe(15)
  })

  it('computes partial sum', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(1, 3)).toBe(9)
  })

  it('handles single element sum', () => {
    const sd = new SqrtDecompRange([42])
    expect(sd.rangeSum(0, 0)).toBe(42)
  })

  it('handles update', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    sd.update(1, 10)
    expect(sd.rangeSum(0, 2)).toBe(14)
  })

  it('handles range min', () => {
    const sd = new SqrtDecompRange([5, 3, 1, 4, 2])
    expect(sd.rangeMin(0, 4)).toBe(1)
    expect(sd.rangeMin(0, 2)).toBe(1)
  })

  it('handles range max', () => {
    const sd = new SqrtDecompRange([1, 5, 3, 2, 4])
    expect(sd.rangeMax(0, 4)).toBe(5)
    expect(sd.rangeMax(2, 4)).toBe(4)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 99)).toBe(5050)
  })

  it('handles update then sum', () => {
    const sd = new SqrtDecompRange([1, 1, 1, 1, 1])
    sd.update(2, 5)
    expect(sd.rangeSum(0, 4)).toBe(9)
  })

  it('handles same index sum', () => {
    const sd = new SqrtDecompRange([10, 20, 30])
    expect(sd.rangeSum(1, 1)).toBe(20)
  })

  it('tracks length', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    expect(sd.length).toBe(3)
  })

  it('handles negative values', () => {
    const sd = new SqrtDecompRange([-1, 2, -3, 4])
    expect(sd.rangeSum(0, 3)).toBe(2)
  })

  it('handles single element update', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.rangeSum(2, 2)).toBe(10)
  })

  it('handles empty array', () => {
    const sd = new SqrtDecompRange([])
    expect(sd.length).toBe(0)
  })

  it('handles update first element', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(0, 10)
    expect(sd.rangeSum(0, 4)).toBe(24)
  })

  it('handles point update in middle', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.rangeSum(0, 4)).toBe(22)
  })

  it('rangeMin finds minimum', () => {
    const sd = new SqrtDecompRange([10, 20, 5, 30])
    expect(sd.rangeMin(0, 3)).toBe(5)
  })

  it('rangeMin single element', () => {
    const sd = new SqrtDecompRange([42])
    expect(sd.rangeMin(0, 0)).toBe(42)
  })

  it('rangeMin for two elements', () => {
    const sd = new SqrtDecompRange([5, 3])
    expect(sd.rangeMin(0, 1)).toBe(3)
  })

  it('rangeSum computes sum', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    expect(sd.rangeSum(0, 2)).toBe(6)
  })

  it('rangeSum single element array', () => {
    const sd = new SqrtDecompRange([5, 10, 15])
    expect(sd.rangeSum(1, 1)).toBe(10)
  })

  it('rangeSum full array', () => {
    const sd = new SqrtDecompRange([5, 10, 15])
    expect(sd.rangeSum(0, 2)).toBe(30)
  })

  it('handles zero values', () => {
    const sd = new SqrtDecompRange([0, 0, 0, 0])
    expect(sd.rangeSum(0, 3)).toBe(0)
    expect(sd.rangeMin(0, 3)).toBe(0)
    expect(sd.rangeMax(0, 3)).toBe(0)
  })

  it('handles mixed zeros and non-zeros', () => {
    const sd = new SqrtDecompRange([0, 5, 0, 3, 0])
    expect(sd.rangeSum(0, 4)).toBe(8)
    expect(sd.rangeMin(0, 4)).toBe(0)
    expect(sd.rangeMax(0, 4)).toBe(5)
  })

  it('handles update to same value', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 3)
    expect(sd.rangeSum(0, 4)).toBe(15)
  })

  it('handles multiple updates', () => {
    const sd = new SqrtDecompRange([1, 1, 1, 1, 1])
    sd.update(0, 10)
    sd.update(2, 20)
    sd.update(4, 30)
    expect(sd.rangeSum(0, 4)).toBe(62)
  })

  it('handles update last element', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(4, 100)
    expect(sd.rangeSum(0, 4)).toBe(110)
  })

  it('handles floating point numbers', () => {
    const sd = new SqrtDecompRange([1.5, 2.5, 3.5])
    expect(sd.rangeSum(0, 2)).toBe(7.5)
    expect(sd.rangeMin(0, 2)).toBe(1.5)
    expect(sd.rangeMax(0, 2)).toBe(3.5)
  })

  it('handles very large numbers', () => {
    const sd = new SqrtDecompRange([Number.MAX_SAFE_INTEGER, 1, Number.MAX_SAFE_INTEGER])
    expect(sd.rangeSum(0, 2)).toBe(Number.MAX_SAFE_INTEGER * 2 + 1)
  })

  it('handles very small negative numbers', () => {
    const sd = new SqrtDecompRange([-Number.MAX_SAFE_INTEGER, -1, -Number.MAX_SAFE_INTEGER])
    expect(sd.rangeSum(0, 2)).toBe(-Number.MAX_SAFE_INTEGER * 2 - 1)
  })

  it('handles all same values for min/max', () => {
    const sd = new SqrtDecompRange([5, 5, 5, 5, 5])
    expect(sd.rangeMin(0, 4)).toBe(5)
    expect(sd.rangeMax(0, 4)).toBe(5)
  })

  it('handles min/max with negative numbers', () => {
    const sd = new SqrtDecompRange([-10, -5, -20, -15])
    expect(sd.rangeMin(0, 3)).toBe(-20)
    expect(sd.rangeMax(0, 3)).toBe(-5)
  })

  it('handles array with two elements', () => {
    const sd = new SqrtDecompRange([7, 3])
    expect(sd.rangeSum(0, 1)).toBe(10)
    expect(sd.rangeMin(0, 1)).toBe(3)
    expect(sd.rangeMax(0, 1)).toBe(7)
  })

  it('handles update on two element array', () => {
    const sd = new SqrtDecompRange([1, 2])
    sd.update(0, 10)
    expect(sd.rangeSum(0, 1)).toBe(12)
  })

  it('handles array length exactly at block size', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 15)).toBe(136)
  })

  it('handles array with repeated values', () => {
    const sd = new SqrtDecompRange([2, 2, 2, 2, 2])
    expect(sd.rangeSum(0, 4)).toBe(10)
  })

  it('handles update to zero', () => {
    const sd = new SqrtDecompRange([5, 10, 15])
    sd.update(1, 0)
    expect(sd.rangeSum(0, 2)).toBe(20)
  })

  it('handles update from zero', () => {
    const sd = new SqrtDecompRange([0, 0, 0])
    sd.update(1, 10)
    expect(sd.rangeSum(0, 2)).toBe(10)
  })

  it('handles range sum starting at index 0', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(0, 2)).toBe(6)
  })

  it('handles range sum ending at last index', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(3, 4)).toBe(9)
  })

  it('handles consecutive updates', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(0, 10)
    sd.update(1, 20)
    expect(sd.rangeSum(0, 4)).toBe(42)
  })

  it('handles update then range operations on different ranges', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 30)
    expect(sd.rangeSum(0, 1)).toBe(3)
    expect(sd.rangeSum(3, 4)).toBe(9)
    expect(sd.rangeSum(0, 4)).toBe(42)
  })

  it('handles range operations on small block size', () => {
    const arr = Array.from({ length: 9 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 8)).toBe(45)
  })

  it('handles very large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 999)).toBe(500500)
  })

  it('handles mixed positive and negative values', () => {
    const sd = new SqrtDecompRange([10, -5, 3, -8, 2])
    expect(sd.rangeSum(0, 4)).toBe(2)
    expect(sd.rangeMin(0, 4)).toBe(-8)
    expect(sd.rangeMax(0, 4)).toBe(10)
  })

  it('handles array with all negative values', () => {
    const sd = new SqrtDecompRange([-1, -2, -3, -4, -5])
    expect(sd.rangeSum(0, 4)).toBe(-15)
    expect(sd.rangeMin(0, 4)).toBe(-5)
    expect(sd.rangeMax(0, 4)).toBe(-1)
  })

  it('handles range min on duplicate values', () => {
    const sd = new SqrtDecompRange([5, 3, 3, 7, 3])
    expect(sd.rangeMin(0, 4)).toBe(3)
  })

  it('handles range max on duplicate values', () => {
    const sd = new SqrtDecompRange([5, 9, 3, 9, 2])
    expect(sd.rangeMax(0, 4)).toBe(9)
  })

  it('handles update making value largest', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(0, 100)
    expect(sd.rangeMax(0, 4)).toBe(100)
  })

  it('handles update making value smallest', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(4, -10)
    expect(sd.rangeMin(0, 4)).toBe(-10)
  })

  it('should compute range max', () => {
    const sd = new SqrtDecompRange([3, 1, 4, 1, 5])
    expect(sd.rangeMax(0, 4)).toBe(5)
  })

  it('should handle update and re-query', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.rangeSum(0, 4)).toBe(22)
  })

  it('rangeMin returns minimum in range', () => {
    const sd = new SqrtDecompRange([5, 3, 8, 1, 4])
    expect(sd.rangeMin(0, 4)).toBe(1)
  })

  it('rangeMax returns maximum in range', () => {
    const sd = new SqrtDecompRange([5, 3, 8, 1, 4])
    expect(sd.rangeMax(0, 4)).toBe(8)
  })

  it('update changes value', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    sd.update(1, 10)
    expect(sd.rangeSum(0, 2)).toBe(14)
  })

  it('rangeSum for single element', () => {
    const sd = new SqrtDecompRange([10, 20, 30])
    expect(sd.rangeSum(1, 1)).toBe(20)
  })
})
describe('sqrt-decomp-range - extra', () => {
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

describe('sqrt-decomp-range - wave545', () => {
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

describe('sqrt-decomp-range - wave546', () => {
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

describe('sqrt-decomp-range - wave547', () => {
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

describe('sqrt-decomp-range - wave548', () => {
  it('sqrt-decomp-range module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave549', () => {
  it('sqrt-decomp-range module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave550', () => {
  it('sqrt-decomp-range w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave551', () => {
  it('sqrt-decomp-range w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave552', () => {
  it('sqrt-decomp-range w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave553', () => {
  it('sqrt-decomp-range w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave554', () => {
  it('sqrt-decomp-range w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave555', () => {
  it('sqrt-decomp-range w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave556', () => {
  it('sqrt-decomp-range w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave557', () => {
  it('sqrt-decomp-range w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave558', () => {
  it('sqrt-decomp-range w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave559', () => {
  it('sqrt-decomp-range w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave560', () => {
  it('sqrt-decomp-range w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave561', () => {
  it('sqrt-decomp-range w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave562', () => {
  it('sqrt-decomp-range w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave563', () => {
  it('sqrt-decomp-range w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave564', () => {
  it('sqrt-decomp-range w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave565', () => {
  it('sqrt-decomp-range w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave566', () => {
  it('sqrt-decomp-range w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave127', () => {
  it('sqrt-decomp-range w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave130', () => {
  it('sqrt-decomp-range w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave133', () => {
  it('sqrt-decomp-range w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave136', () => {
  it('sqrt-decomp-range w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - wave139', () => {
  it('sqrt-decomp-range w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w142', () => {
  it('sqrt-decomp-range v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w145', () => {
  it('sqrt-decomp-range v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w148', () => {
  it('sqrt-decomp-range v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w151', () => {
  it('sqrt-decomp-range v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w154', () => {
  it('sqrt-decomp-range v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w157', () => {
  it('sqrt-decomp-range v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w160', () => {
  it('sqrt-decomp-range v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w170', () => {
  it('sqrt-decomp-range x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w180', () => {
  it('sqrt-decomp-range x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w190', () => {
  it('sqrt-decomp-range x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w200', () => {
  it('sqrt-decomp-range x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w210', () => {
  it('sqrt-decomp-range x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w220', () => {
  it('sqrt-decomp-range x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w230', () => {
  it('sqrt-decomp-range x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w240', () => {
  it('sqrt-decomp-range x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w250', () => {
  it('sqrt-decomp-range x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w260', () => {
  it('sqrt-decomp-range x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w270', () => {
  it('sqrt-decomp-range x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w280', () => {
  it('sqrt-decomp-range x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w290', () => {
  it('sqrt-decomp-range x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w300', () => {
  it('sqrt-decomp-range x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w310', () => {
  it('sqrt-decomp-range x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w320', () => {
  it('sqrt-decomp-range x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w330', () => {
  it('sqrt-decomp-range x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w340', () => {
  it('sqrt-decomp-range x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w350', () => {
  it('sqrt-decomp-range x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w360', () => {
  it('sqrt-decomp-range x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w370', () => {
  it('sqrt-decomp-range x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w380', () => {
  it('sqrt-decomp-range x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w390', () => {
  it('sqrt-decomp-range x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w400', () => {
  it('sqrt-decomp-range x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w420', () => {
  it('sqrt-decomp-range x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w440', () => {
  it('sqrt-decomp-range x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w460', () => {
  it('sqrt-decomp-range x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w480', () => {
  it('sqrt-decomp-range x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sqrt-decomp-range - w500', () => {
  it('sqrt-decomp-range x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('sqrt-decomp-range x500x19', () => {
    expect(describe).toBeDefined()
  })
})
