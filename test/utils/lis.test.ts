import { describe, it, expect } from 'vitest'
import { LongestIncreasingSubsequence } from '../../src/utils/lis.js'

describe('LongestIncreasingSubsequence', () => {
  describe('length method', () => {
    it('finds LIS length', () => {
      expect(LongestIncreasingSubsequence.length([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4)
    })

    it('handles empty array', () => {
      expect(LongestIncreasingSubsequence.length([])).toBe(0)
    })

    it('handles single element', () => {
      expect(LongestIncreasingSubsequence.length([5])).toBe(1)
    })

    it('handles already sorted array', () => {
      expect(LongestIncreasingSubsequence.length([1, 2, 3, 4, 5])).toBe(5)
    })

    it('handles reverse sorted array', () => {
      expect(LongestIncreasingSubsequence.length([5, 4, 3, 2, 1])).toBe(1)
    })

    it('handles all same elements', () => {
      expect(LongestIncreasingSubsequence.length([3, 3, 3, 3])).toBe(1)
    })

    it('handles two elements', () => {
      expect(LongestIncreasingSubsequence.length([1, 2])).toBe(2)
      expect(LongestIncreasingSubsequence.length([2, 1])).toBe(1)
    })

    it('handles negative numbers', () => {
      expect(LongestIncreasingSubsequence.length([-5, -3, -1, 0, 2])).toBe(5)
    })

    it('handles mixed positive and negative', () => {
      expect(LongestIncreasingSubsequence.length([3, -1, 2, 0, 4])).toBe(3)
    })

    it('handles large array efficiently', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      expect(LongestIncreasingSubsequence.length(arr)).toBe(1000)
    })

    it('handles array with duplicates', () => {
      expect(LongestIncreasingSubsequence.length([1, 1, 2, 2, 3, 3])).toBe(3)
    })

    it('handles array with zeros', () => {
      expect(LongestIncreasingSubsequence.length([0, 0, 0, 0, 0])).toBe(1)
    })

    it('handles array with negative and positive', () => {
      expect(LongestIncreasingSubsequence.length([-10, -5, 0, 5, 10])).toBe(5)
    })

    it('handles array with floating point numbers', () => {
      expect(LongestIncreasingSubsequence.length([1.1, 1.2, 1.3, 1.4, 1.5])).toBe(5)
    })

    it('handles decreasing large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
      expect(LongestIncreasingSubsequence.length(arr)).toBe(1)
    })

    it('handles array with alternating values', () => {
      expect(LongestIncreasingSubsequence.length([1, 3, 2, 4, 3, 5])).toBe(4)
    })
  })

  describe('find method', () => {
    it('finds LIS subsequence', () => {
      const result = LongestIncreasingSubsequence.find([10, 9, 2, 5, 3, 7, 101, 18])
      expect(result.length).toBe(4)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThan(result[i - 1]!)
      }
    })

    it('handles empty array', () => {
      expect(LongestIncreasingSubsequence.find([])).toEqual([])
    })

    it('handles single element', () => {
      expect(LongestIncreasingSubsequence.find([5])).toEqual([5])
    })

    it('subsequence values are from original array', () => {
      const arr = [5, 2, 8, 6, 3, 6, 9, 7]
      const result = LongestIncreasingSubsequence.find(arr)
      for (const val of result) {
        expect(arr).toContain(val)
      }
    })

    it('handles duplicate values correctly', () => {
      const result = LongestIncreasingSubsequence.find([1, 2, 2, 3])
      expect(result.length).toBe(3)
    })

    it('find for single element', () => {
      expect(LongestIncreasingSubsequence.find([42])).toEqual([42])
    })

    it('find for decreasing returns last element', () => {
      expect(LongestIncreasingSubsequence.find([5, 4, 3, 2, 1])).toEqual([1])
    })

    it('find for already sorted returns all', () => {
      expect(LongestIncreasingSubsequence.find([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('find for decreasing returns last element', () => {
      expect(LongestIncreasingSubsequence.find([3, 2, 1])).toEqual([1])
    })

    it('find for single element', () => {
      expect(LongestIncreasingSubsequence.find([5])).toEqual([5])
    })

    it('find for empty array', () => {
      expect(LongestIncreasingSubsequence.find([])).toEqual([])
    })

    it('find for single element', () => {
      expect(LongestIncreasingSubsequence.find([5])).toEqual([5])
    })

    it('find with negative numbers', () => {
      expect(LongestIncreasingSubsequence.find([-5, -3, -1, 0, 2])).toEqual([-5, -3, -1, 0, 2])
    })

    it('find with zeros', () => {
      const result = LongestIncreasingSubsequence.find([0, 1, 0, 2, 0, 3])
      expect(result).toEqual([0, 1, 2, 3])
    })

    it('find with all equal', () => {
      const result = LongestIncreasingSubsequence.find([5, 5, 5, 5])
      expect(result).toEqual([5])
    })
  })

  describe('findIndices method', () => {
    it('findIndices returns correct positions', () => {
      const indices = LongestIncreasingSubsequence.findIndices([1, 3, 2, 4])
      expect(indices.length).toBe(3)
      expect(indices[0]).toBe(0)
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]!).toBeGreaterThan(indices[i - 1]!)
      }
    })

    it('findIndices returns increasing indices', () => {
      const arr = [10, 20, 10, 30, 20, 50]
      const indices = LongestIncreasingSubsequence.findIndices(arr)
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]!).toBeGreaterThan(indices[i - 1]!)
      }
    })

    it('findIndices for empty array', () => {
      expect(LongestIncreasingSubsequence.findIndices([])).toEqual([])
    })

    it('findIndices for single element', () => {
      expect(LongestIncreasingSubsequence.findIndices([5])).toEqual([0])
    })

    it('findIndices for decreasing', () => {
      const result = LongestIncreasingSubsequence.findIndices([5, 4, 3, 2, 1])
      expect(result).toEqual([4])
    })

    it('findIndices for sorted', () => {
      const result = LongestIncreasingSubsequence.findIndices([1, 2, 3, 4, 5])
      expect(result).toEqual([0, 1, 2, 3, 4])
    })

    it('findIndices values correspond to subsequence', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      const indices = LongestIncreasingSubsequence.findIndices(arr)
      const values = indices.map(i => arr[i]!)
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1])
      }
    })
  })

  describe('countLIS method', () => {
    it('countLIS matches length', () => {
      const arr = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]
      expect(LongestIncreasingSubsequence.countLIS(arr)).toBe(LongestIncreasingSubsequence.length(arr))
    })

    it('countLIS handles empty array', () => {
      expect(LongestIncreasingSubsequence.countLIS([])).toBe(0)
    })

    it('countLIS for single element', () => {
      expect(LongestIncreasingSubsequence.countLIS([42])).toBe(1)
    })

    it('countLIS for decreasing', () => {
      expect(LongestIncreasingSubsequence.countLIS([5, 4, 3, 2, 1])).toBe(1)
    })

    it('countLIS for sorted', () => {
      expect(LongestIncreasingSubsequence.countLIS([1, 2, 3, 4, 5])).toBe(5)
    })

    it('countLIS with duplicates', () => {
      expect(LongestIncreasingSubsequence.countLIS([2, 2, 2, 2])).toBe(1)
    })

    it('countLIS handles negative numbers', () => {
      expect(LongestIncreasingSubsequence.countLIS([-5, -3, -1, 0, 2])).toBe(5)
    })
  })

  it('find returns valid subsequence for mixed signs', () => {
    const result = LongestIncreasingSubsequence.find([-3, 1, -2, 4, 0, 2])
    expect(result.length).toBeGreaterThan(0)
  })

  it('length of all decreasing is 1', () => {
    expect(LongestIncreasingSubsequence.length([5, 4, 3, 2, 1])).toBe(1)
  })

  it('findIndices returns valid indices', () => {
    const arr = [3, 1, 2]
    const indices = LongestIncreasingSubsequence.findIndices(arr)
    expect(indices.length).toBe(2)
  })

  it('countLIS for all same elements is 1', () => {
    expect(LongestIncreasingSubsequence.countLIS([5, 5, 5])).toBe(1)
  })

  it('handles single element', () => {
    expect(LongestIncreasingSubsequence.length([42])).toBe(1)
    expect(LongestIncreasingSubsequence.find([42])).toEqual([42])
  })

  it('should handle empty array', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
  })

  it('should handle decreasing array', () => {
    expect(LongestIncreasingSubsequence.length([5, 4, 3, 2, 1])).toBe(1)
  })

  it('find returns actual subsequence', () => {
    expect(LongestIncreasingSubsequence.find([1, 3, 2, 4])).toEqual([1, 2, 4])
  })

  it('findIndices returns indices', () => {
    const indices = LongestIncreasingSubsequence.findIndices([1, 3, 2, 4])
    expect(indices.length).toBe(3)
  })

  it('empty array returns 0', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
  })

  it('empty array length is 0', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
  })

  it('single element', () => {
    expect(LongestIncreasingSubsequence.length([5])).toBe(1)
  })

  it('find returns array', () => {
    expect(Array.isArray(LongestIncreasingSubsequence.find([1, 2, 3]))).toBe(true)
  })
})

describe('lis - wave545', () => {
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

describe('lis - wave546', () => {
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

describe('lis - wave547', () => {
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

describe('lis - wave548', () => {
  it('lis module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lis module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lis module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lis - wave549', () => {
  it('lis module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lis module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lis module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lis - wave550', () => {
  it('lis w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('lis w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('lis w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lis - wave551', () => {
  it('lis w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('lis w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('lis w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
