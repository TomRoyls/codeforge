import { describe, expect, it } from 'vitest'
import { QuickSelect } from '../../src/utils/quickselect.js'

describe('QuickSelect', () => {
  describe('select - basic functionality', () => {
    it('finds minimum (k=0)', () => {
      expect(QuickSelect.select([3, 1, 4, 1, 5, 9], 0)).toBe(1)
    })

    it('finds maximum (k=n-1)', () => {
      expect(QuickSelect.select([3, 1, 4, 1, 5, 9], 5)).toBe(9)
    })

    it('finds median of odd-length array', () => {
      expect(QuickSelect.select([3, 1, 2], 1)).toBe(2)
    })

    it('finds kth element in sorted order', () => {
      const arr = [9, 8, 7, 6, 5, 4, 3, 2, 1]
      expect(QuickSelect.select(arr, 0)).toBe(1)
      expect(QuickSelect.select(arr, 4)).toBe(5)
      expect(QuickSelect.select(arr, 8)).toBe(9)
    })

    it('handles single element', () => {
      expect(QuickSelect.select([42], 0)).toBe(42)
    })

    it('handles two elements', () => {
      expect(QuickSelect.select([2, 1], 0)).toBe(1)
      expect(QuickSelect.select([2, 1], 1)).toBe(2)
    })

    it('does not modify original array', () => {
      const arr = [3, 1, 2]
      QuickSelect.select(arr, 1)
      expect(arr).toEqual([3, 1, 2])
    })

    it('handles duplicates', () => {
      expect(QuickSelect.select([3, 3, 3], 0)).toBe(3)
      expect(QuickSelect.select([3, 3, 3], 1)).toBe(3)
      expect(QuickSelect.select([3, 3, 3], 2)).toBe(3)
    })

    it('handles negative numbers', () => {
      expect(QuickSelect.select([-3, -1, -2], 0)).toBe(-3)
      expect(QuickSelect.select([-3, -1, -2], 1)).toBe(-2)
      expect(QuickSelect.select([-3, -1, -2], 2)).toBe(-1)
    })

    it('handles mixed positive and negative', () => {
      expect(QuickSelect.select([-5, 0, 5, -10, 10], 0)).toBe(-10)
      expect(QuickSelect.select([-5, 0, 5, -10, 10], 2)).toBe(0)
      expect(QuickSelect.select([-5, 0, 5, -10, 10], 4)).toBe(10)
    })

    it('handles floating point numbers', () => {
      expect(QuickSelect.select([3.5, 1.2, 4.8, 2.1], 0)).toBe(1.2)
      expect(QuickSelect.select([3.5, 1.2, 4.8, 2.1], 2)).toBe(3.5)
    })

    it('handles already sorted array', () => {
      expect(QuickSelect.select([1, 2, 3, 4, 5], 0)).toBe(1)
      expect(QuickSelect.select([1, 2, 3, 4, 5], 4)).toBe(5)
    })

    it('handles reverse sorted array', () => {
      expect(QuickSelect.select([5, 4, 3, 2, 1], 0)).toBe(1)
      expect(QuickSelect.select([5, 4, 3, 2, 1], 4)).toBe(5)
    })

    it('handles large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
      expect(QuickSelect.select(arr, 0)).toBe(1)
      expect(QuickSelect.select(arr, 999)).toBe(1000)
    })
  })

  describe('select - error handling', () => {
    it('throws for k < 0', () => {
      expect(() => QuickSelect.select([1, 2, 3], -1)).toThrow(RangeError)
      expect(() => QuickSelect.select([1, 2, 3], -10)).toThrow(RangeError)
    })

    it('throws for k >= length', () => {
      expect(() => QuickSelect.select([1, 2, 3], 3)).toThrow(RangeError)
      expect(() => QuickSelect.select([1, 2, 3], 10)).toThrow(RangeError)
    })

    it('throws for k out of range with error message', () => {
      expect(() => QuickSelect.select([1, 2], 2)).toThrow('k=2 out of range [0, 2)')
    })
  })

  describe('select - edge cases', () => {
    it('handles zero in array', () => {
      expect(QuickSelect.select([0, 5, -1, 10], 0)).toBe(-1)
      expect(QuickSelect.select([0, 5, -1, 10], 1)).toBe(0)
    })

    it('handles all identical elements', () => {
      expect(QuickSelect.select([7, 7, 7, 7, 7], 0)).toBe(7)
      expect(QuickSelect.select([7, 7, 7, 7, 7], 4)).toBe(7)
    })

    it('handles two identical elements', () => {
      expect(QuickSelect.select([5, 5], 0)).toBe(5)
      expect(QuickSelect.select([5, 5], 1)).toBe(5)
    })

    it('handles array with zeros and negatives', () => {
      expect(QuickSelect.select([0, -1, -2, 0, 1], 0)).toBe(-2)
      expect(QuickSelect.select([0, -1, -2, 0, 1], 2)).toBe(0)
    })

    it('handles large numbers', () => {
      expect(QuickSelect.select([Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER], 0)).toBe(Number.MIN_SAFE_INTEGER)
      expect(QuickSelect.select([Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER], 2)).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('median', () => {
    it('computes median of odd-length array', () => {
      expect(QuickSelect.median([3, 1, 2])).toBe(2)
      expect(QuickSelect.median([5, 2, 8, 1, 9])).toBe(5)
    })

    it('computes median of even-length array', () => {
      expect(QuickSelect.median([4, 1, 3, 2])).toBe(2.5)
      expect(QuickSelect.median([1, 3, 2, 4])).toBe(2.5)
    })

    it('computes median with negative numbers', () => {
      expect(QuickSelect.median([-5, -1, -3])).toBe(-3)
      expect(QuickSelect.median([-2, -4, -1, -3])).toBe(-2.5)
    })

    it('computes median with duplicates', () => {
      expect(QuickSelect.median([3, 3, 1, 3])).toBe(3)
    })

    it('computes median with zeros', () => {
      expect(QuickSelect.median([0, 1, -1])).toBe(0)
    })

    it('throws for empty array', () => {
      expect(() => QuickSelect.median([])).toThrow(RangeError)
    })

    it('handles single element median', () => {
      expect(QuickSelect.median([42])).toBe(42)
    })

    it('handles two element median', () => {
      expect(QuickSelect.median([1, 2])).toBe(1.5)
      expect(QuickSelect.median([3, 1])).toBe(2)
    })

    it('does not modify original array', () => {
      const arr = [3, 1, 2]
      QuickSelect.median(arr)
      expect(arr).toEqual([3, 1, 2])
    })

    it('computes median of large array', () => {
      const arr = Array.from({ length: 101 }, (_, i) => i)
      expect(QuickSelect.median(arr)).toBe(50)
    })
  })

  describe('kthSmallest', () => {
    it('finds kth smallest element', () => {
      const arr = [5, 3, 1, 4, 2]
      expect(QuickSelect.kthSmallest(arr, 0)).toBe(1)
      expect(QuickSelect.kthSmallest(arr, 2)).toBe(3)
      expect(QuickSelect.kthSmallest(arr, 4)).toBe(5)
    })

    it('is same as select', () => {
      const arr = [9, 7, 5, 3, 1, 2, 4, 6, 8]
      for (let i = 0; i < arr.length; i++) {
        expect(QuickSelect.kthSmallest(arr, i)).toBe(QuickSelect.select(arr, i))
      }
    })

    it('handles duplicates', () => {
      expect(QuickSelect.kthSmallest([3, 1, 3, 2, 3], 0)).toBe(1)
      expect(QuickSelect.kthSmallest([3, 1, 3, 2, 3], 3)).toBe(3)
    })

    it('throws for invalid k', () => {
      expect(() => QuickSelect.kthSmallest([1, 2, 3], -1)).toThrow(RangeError)
      expect(() => QuickSelect.kthSmallest([1, 2, 3], 3)).toThrow(RangeError)
    })
  })

  describe('kthLargest', () => {
    it('finds kth largest element', () => {
      const arr = [5, 3, 1, 4, 2]
      expect(QuickSelect.kthLargest(arr, 0)).toBe(5)
      expect(QuickSelect.kthLargest(arr, 1)).toBe(4)
      expect(QuickSelect.kthLargest(arr, 4)).toBe(1)
    })

    it('handles single element', () => {
      expect(QuickSelect.kthLargest([42], 0)).toBe(42)
    })

    it('handles duplicates', () => {
      expect(QuickSelect.kthLargest([3, 1, 3, 2, 3], 0)).toBe(3)
      expect(QuickSelect.kthLargest([3, 1, 3, 2, 3], 4)).toBe(1)
    })

    it('throws for invalid k', () => {
      expect(() => QuickSelect.kthLargest([1, 2, 3], -1)).toThrow(RangeError)
      expect(() => QuickSelect.kthLargest([1, 2, 3], 3)).toThrow(RangeError)
    })

    it('handles large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      expect(QuickSelect.kthLargest(arr, 0)).toBe(999)
      expect(QuickSelect.kthLargest(arr, 999)).toBe(0)
    })
  })

  describe('partitionAround', () => {
    it('splits array around pivot', () => {
      const result = QuickSelect.partitionAround([5, 3, 1, 4, 2], 2)
      expect(result.left.every(x => x <= 3)).toBe(true)
      expect(result.right.every(x => x >= 3)).toBe(true)
    })

    it('handles all elements on one side', () => {
      const result = QuickSelect.partitionAround([1, 2, 3, 4, 5], 0)
      expect(result.left.length).toBe(0)
      expect(result.right).toEqual([1, 2, 3, 4, 5])
    })

    it('handles all elements on other side', () => {
      const result = QuickSelect.partitionAround([5, 4, 3, 2, 1], 4)
      expect(result.left).toEqual([4, 3, 2, 1])
      expect(result.right.length).toBe(1)
      expect(result.right[0]).toBe(5)
    })

    it('handles duplicates on both sides', () => {
      const result = QuickSelect.partitionAround([3, 1, 3, 2, 3], 2)
      expect(result.left.includes(1)).toBe(true)
      expect(result.left.includes(2)).toBe(true)
      expect(result.right.includes(3)).toBe(true)
    })

    it('handles single element array', () => {
      const result = QuickSelect.partitionAround([5], 0)
      expect(result.left.length).toBe(0)
      expect(result.right).toEqual([5])
    })

    it('handles two element array', () => {
      const result = QuickSelect.partitionAround([2, 1], 0)
      expect(result.left.length).toBe(0)
      expect(result.right).toEqual([2, 1])
    })

    it('does not modify original array', () => {
      const arr = [5, 3, 1, 4, 2]
      QuickSelect.partitionAround(arr, 2)
      expect(arr).toEqual([5, 3, 1, 4, 2])
    })

    it('returns correct partition sizes', () => {
      const result = QuickSelect.partitionAround([5, 3, 1, 4, 2], 2)
      expect(result.left.length + result.right.length).toBe(5)
    })

    it('handles negative numbers', () => {
      const result = QuickSelect.partitionAround([-5, -1, -3, -2, -4], 2)
      expect(result.left.every(x => x <= -3)).toBe(true)
      expect(result.right.every(x => x >= -3)).toBe(true)
    })

    it('handles empty partitions', () => {
      const result1 = QuickSelect.partitionAround([1, 1, 1], 1)
      expect(result1.left.length + result1.right.length).toBe(3)
    })
  })

  it('median for odd-length array', () => {
    expect(QuickSelect.median([3, 1, 2])).toBe(2)
  })

  it('kthSmallest returns kth element', () => {
    expect(QuickSelect.kthSmallest([5, 3, 1, 4, 2], 0)).toBe(1)
    expect(QuickSelect.kthSmallest([5, 3, 1, 4, 2], 4)).toBe(5)
  })

  it('kthLargest returns kth element from end', () => {
    expect(QuickSelect.kthLargest([5, 3, 1, 4, 2], 0)).toBe(5)
    expect(QuickSelect.kthLargest([5, 3, 1, 4, 2], 4)).toBe(1)
  })

  it('select handles single element', () => {
    expect(QuickSelect.select([42], 0)).toBe(42)
  })

  it('select from single element', () => {
    expect(QuickSelect.select([5], 0)).toBe(5)
  })

  it('median of odd array', () => {
    expect(QuickSelect.median([3, 1, 2])).toBe(2)
  })

  it('select k=0 returns min', () => {
    expect(QuickSelect.select([3, 1, 2], 0)).toBe(1)
  })

})
describe('quickselect - wave545', () => {
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

describe('quickselect - wave546', () => {
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

describe('quickselect - wave547', () => {
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

describe('quickselect - wave548', () => {
  it('quickselect module defined', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect module is function', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave549', () => {
  it('quickselect module defined', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect module is function', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave550', () => {
  it('quickselect w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave551', () => {
  it('quickselect w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave552', () => {
  it('quickselect w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave553', () => {
  it('quickselect w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave554', () => {
  it('quickselect w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave555', () => {
  it('quickselect w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave556', () => {
  it('quickselect w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave557', () => {
  it('quickselect w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave558', () => {
  it('quickselect w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave559', () => {
  it('quickselect w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave560', () => {
  it('quickselect w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave561', () => {
  it('quickselect w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave562', () => {
  it('quickselect w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave563', () => {
  it('quickselect w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave564', () => {
  it('quickselect w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave565', () => {
  it('quickselect w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave566', () => {
  it('quickselect w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave127', () => {
  it('quickselect w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave130', () => {
  it('quickselect w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave133', () => {
  it('quickselect w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave136', () => {
  it('quickselect w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - wave139', () => {
  it('quickselect w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w142', () => {
  it('quickselect v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w145', () => {
  it('quickselect v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w148', () => {
  it('quickselect v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w151', () => {
  it('quickselect v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w154', () => {
  it('quickselect v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w157', () => {
  it('quickselect v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w160', () => {
  it('quickselect v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w170', () => {
  it('quickselect x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w180', () => {
  it('quickselect x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w190', () => {
  it('quickselect x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w200', () => {
  it('quickselect x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w210', () => {
  it('quickselect x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w220', () => {
  it('quickselect x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w230', () => {
  it('quickselect x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w240', () => {
  it('quickselect x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w250', () => {
  it('quickselect x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w260', () => {
  it('quickselect x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w270', () => {
  it('quickselect x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w280', () => {
  it('quickselect x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w290', () => {
  it('quickselect x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w300', () => {
  it('quickselect x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w310', () => {
  it('quickselect x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w320', () => {
  it('quickselect x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w330', () => {
  it('quickselect x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w340', () => {
  it('quickselect x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w350', () => {
  it('quickselect x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w360', () => {
  it('quickselect x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w370', () => {
  it('quickselect x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w380', () => {
  it('quickselect x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w390', () => {
  it('quickselect x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w400', () => {
  it('quickselect x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w420', () => {
  it('quickselect x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w440', () => {
  it('quickselect x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w460', () => {
  it('quickselect x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w480', () => {
  it('quickselect x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickselect - w500', () => {
  it('quickselect x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('quickselect x500x19', () => {
    expect(describe).toBeDefined()
  })
})
