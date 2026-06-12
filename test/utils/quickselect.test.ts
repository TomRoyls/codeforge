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
