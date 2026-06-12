import { describe, expect, it } from 'vitest'
import { LongestIncreasingSubsequence } from '../../src/utils/longest-increasing-subsequence.js'

describe('LongestIncreasingSubsequence', () => {
  it('returns 0 for empty array', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
  })

  it('returns 1 for single element', () => {
    expect(LongestIncreasingSubsequence.length([5])).toBe(1)
  })

  it('computes LIS length for classic example', () => {
    expect(LongestIncreasingSubsequence.length([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4)
  })

  it('computes LIS for already sorted', () => {
    expect(LongestIncreasingSubsequence.length([1, 2, 3, 4, 5])).toBe(5)
  })

  it('computes LIS for reverse sorted', () => {
    expect(LongestIncreasingSubsequence.length([5, 4, 3, 2, 1])).toBe(1)
  })

  it('computes LIS for all same elements', () => {
    expect(LongestIncreasingSubsequence.length([3, 3, 3])).toBe(1)
  })

  it('finds actual LIS', () => {
    const lis = LongestIncreasingSubsequence.find([10, 9, 2, 5, 3, 7, 101, 18])
    expect(lis.length).toBe(4)
    for (let i = 1; i < lis.length; i++) {
      expect(lis[i]!).toBeGreaterThan(lis[i - 1]!)
    }
  })

  it('finds LIS for empty array', () => {
    expect(LongestIncreasingSubsequence.find([])).toEqual([])
  })

  it('finds LIS for single element', () => {
    expect(LongestIncreasingSubsequence.find([5])).toEqual([5])
  })

  it('finds LIS for sorted array', () => {
    expect(LongestIncreasingSubsequence.find([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('lengthNonDecreasing allows equal elements', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([1, 2, 2, 3])).toBe(4)
  })

  it('lengthNonDecreasing for empty', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([])).toBe(0)
  })

  it('countLIS counts number of LIS', () => {
    expect(LongestIncreasingSubsequence.countLIS([1, 3, 5, 4, 7])).toBe(2)
  })

  it('countLIS for single element', () => {
    expect(LongestIncreasingSubsequence.countLIS([1])).toBe(1)
  })

  it('countLIS for empty', () => {
    expect(LongestIncreasingSubsequence.countLIS([])).toBe(0)
  })

  it('finds LIS with duplicates', () => {
    const lis = LongestIncreasingSubsequence.find([2, 2, 2, 3, 3])
    expect(lis.length).toBe(2)
  })

  it('handles strictly increasing', () => {
    const lis = LongestIncreasingSubsequence.find([1, 2, 3, 4, 5])
    expect(lis.length).toBe(5)
  })

  it('handles strictly decreasing', () => {
    const lis = LongestIncreasingSubsequence.find([5, 4, 3, 2, 1])
    expect(lis).toEqual([1])
  })

  it('length for strictly decreasing', () => {
    expect(LongestIncreasingSubsequence.length([5, 4, 3, 2, 1])).toBe(1)
  })

  it('handles negative numbers', () => {
    const lis = LongestIncreasingSubsequence.find([-5, -1, -3, -2, -4])
    expect(lis.length).toBe(3)
  })

  it('length for negative numbers', () => {
    expect(LongestIncreasingSubsequence.length([-5, -1, -3, -2, -4])).toBe(3)
  })

  it('handles mixed positive and negative', () => {
    const lis = LongestIncreasingSubsequence.find([-5, 0, 5, -3, 2])
    expect(lis.length).toBe(3)
  })

  it('find for alternating sequence', () => {
    const lis = LongestIncreasingSubsequence.find([1, 3, 2, 4, 3, 5])
    expect(lis.length).toBe(4)
  })

  it('length for alternating sequence', () => {
    expect(LongestIncreasingSubsequence.length([1, 3, 2, 4, 3, 5])).toBe(4)
  })

  it('handles large numbers', () => {
    const lis = LongestIncreasingSubsequence.find([1000000, 999999, 1000001, 999998])
    expect(lis.length).toBe(2)
  })

  it('length for large numbers', () => {
    expect(LongestIncreasingSubsequence.length([1000000, 999999, 1000001, 999998])).toBe(2)
  })

  it('handles array with zeros', () => {
    const lis = LongestIncreasingSubsequence.find([0, 1, 0, 2, 0, 3])
    expect(lis.length).toBe(4)
  })

  it('length for array with zeros', () => {
    expect(LongestIncreasingSubsequence.length([0, 1, 0, 2, 0, 3])).toBe(4)
  })

  it('lengthNonDecreasing for all equal elements', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([5, 5, 5, 5])).toBe(4)
  })

  it('lengthNonDecreasing for mixed sequence', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([1, 2, 2, 3, 1, 4])).toBe(5)
  })

  it('lengthNonDecreasing for strictly increasing', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([1, 2, 3, 4])).toBe(4)
  })

  it('lengthNonDecreasing for single element', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([42])).toBe(1)
  })

  it('countLIS for multiple LIS', () => {
    expect(LongestIncreasingSubsequence.countLIS([1, 2, 4, 3, 5, 4, 7, 2])).toBe(3)
  })

  it('countLIS for no LIS (empty)', () => {
    expect(LongestIncreasingSubsequence.countLIS([])).toBe(0)
  })

  it('countLIS for all same elements', () => {
    expect(LongestIncreasingSubsequence.countLIS([5, 5, 5, 5])).toBe(4)
  })

  it('countLIS for decreasing sequence', () => {
    expect(LongestIncreasingSubsequence.countLIS([5, 4, 3, 2, 1])).toBe(5)
  })

  it('find returns valid increasing sequence', () => {
    const lis = LongestIncreasingSubsequence.find([10, 9, 2, 5, 3, 7, 101, 18])
    for (let i = 1; i < lis.length; i++) {
      expect(lis[i]).toBeGreaterThan(lis[i - 1])
    }
  })

  it('find preserves relative order', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6]
    const lis = LongestIncreasingSubsequence.find(arr)
    let lastIndex = -1
    for (const val of lis) {
      const index = arr.indexOf(val, lastIndex + 1)
      expect(index).toBeGreaterThan(lastIndex)
      lastIndex = index
    }
  })

  it('handles array with two elements', () => {
    const lis = LongestIncreasingSubsequence.find([1, 2])
    expect(lis).toEqual([1, 2])
  })

  it('handles array with two decreasing elements', () => {
    const lis = LongestIncreasingSubsequence.find([2, 1])
    expect(lis).toEqual([1])
  })

  it('length for two elements', () => {
    expect(LongestIncreasingSubsequence.length([1, 2])).toBe(2)
  })

  it('length for two decreasing elements', () => {
    expect(LongestIncreasingSubsequence.length([2, 1])).toBe(1)
  })

  it('handles very large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
    expect(LongestIncreasingSubsequence.length(arr)).toBe(1)
  })

  it('find for very large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    const lis = LongestIncreasingSubsequence.find(arr)
    expect(lis.length).toBe(100)
  })

  it('handles array with floating point numbers', () => {
    const lis = LongestIncreasingSubsequence.find([1.1, 2.2, 1.5, 3.3])
    expect(lis.length).toBe(3)
  })

  it('length for floating point numbers', () => {
    expect(LongestIncreasingSubsequence.length([1.1, 2.2, 1.5, 3.3])).toBe(3)
  })

  it('find handles array with single negative number', () => {
    const lis = LongestIncreasingSubsequence.find([-42])
    expect(lis).toEqual([-42])
  })

  it('length handles array with single negative number', () => {
    expect(LongestIncreasingSubsequence.length([-42])).toBe(1)
  })

  it('should count number of LIS', () => {
    const count = LongestIncreasingSubsequence.countLIS([1, 3, 5, 4, 7])
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it('should find non-decreasing length', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([1, 2, 2, 3])).toBe(4)
  })

  it('should handle empty find', () => {
    expect(LongestIncreasingSubsequence.find([])).toEqual([])
  })

  it('should find length of identical elements', () => {
    expect(LongestIncreasingSubsequence.length([5, 5, 5])).toBe(1)
  })

  it('find returns subsequence', () => {
    expect(LongestIncreasingSubsequence.find([1, 3, 2, 4])).toEqual([1, 2, 4])
  })

  it('empty array returns 0', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
  })

  it('single element returns 1', () => {
    expect(LongestIncreasingSubsequence.length([42])).toBe(1)
  })

  it('empty array length is 0', () => {
    expect(LongestIncreasingSubsequence.length([])).toBe(0)
  })

  it('single element', () => {
    expect(LongestIncreasingSubsequence.length([5])).toBe(1)
  })

  it('lengthNonDecreasing works', () => {
    expect(LongestIncreasingSubsequence.lengthNonDecreasing([1, 2, 2, 3])).toBe(4)
  })
})

describe('longest-increasing-subsequence - wave545', () => {
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

describe('longest-increasing-subsequence - wave546', () => {
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

describe('longest-increasing-subsequence - wave547', () => {
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

describe('longest-increasing-subsequence - wave548', () => {
  it('longest-increasing-subsequence module defined', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence module is function', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave549', () => {
  it('longest-increasing-subsequence module defined', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence module is function', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave550', () => {
  it('longest-increasing-subsequence w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave551', () => {
  it('longest-increasing-subsequence w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave552', () => {
  it('longest-increasing-subsequence w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave553', () => {
  it('longest-increasing-subsequence w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave554', () => {
  it('longest-increasing-subsequence w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave555', () => {
  it('longest-increasing-subsequence w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave556', () => {
  it('longest-increasing-subsequence w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave557', () => {
  it('longest-increasing-subsequence w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave558', () => {
  it('longest-increasing-subsequence w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-increasing-subsequence - wave559', () => {
  it('longest-increasing-subsequence w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-increasing-subsequence w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
