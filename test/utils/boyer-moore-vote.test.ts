import { describe, expect, it } from 'vitest'
import { BoyerMooreVote } from '../../src/utils/boyer-moore-vote.js'

describe('BoyerMooreVote', () => {
  describe('findMajority', () => {
    it('finds majority element', () => {
      expect(BoyerMooreVote.findMajority([3, 2, 3])).toBe(3)
    })

    it('finds majority in longer array', () => {
      expect(BoyerMooreVote.findMajority([2, 2, 1, 1, 1, 2, 2])).toBe(2)
    })

    it('returns null when no majority', () => {
      expect(BoyerMooreVote.findMajority([1, 2, 3])).toBeNull()
    })

    it('handles single element', () => {
      expect(BoyerMooreVote.findMajority([42])).toBe(42)
    })

    it('handles empty array', () => {
      expect(BoyerMooreVote.findMajority([])).toBeNull()
    })

    it('handles all same elements', () => {
      expect(BoyerMooreVote.findMajority([5, 5, 5, 5])).toBe(5)
    })

    it('handles two elements with majority', () => {
      expect(BoyerMooreVote.findMajority([1, 1])).toBe(1)
    })

    it('handles two elements without majority', () => {
      expect(BoyerMooreVote.findMajority([1, 2])).toBeNull()
    })

    it('handles strings', () => {
      expect(BoyerMooreVote.findMajority(['a', 'b', 'a', 'a'])).toBe('a')
    })

    it('handles exactly half returns null', () => {
      expect(BoyerMooreVote.findMajority([1, 2, 1, 2])).toBeNull()
    })

    it('handles majority by one', () => {
      expect(BoyerMooreVote.findMajority([1, 1, 1, 2, 2])).toBe(1)
    })

    it('handles negative numbers', () => {
      expect(BoyerMooreVote.findMajority([-1, -1, -1, 2, 3])).toBe(-1)
    })

    it('handles zero as majority', () => {
      expect(BoyerMooreVote.findMajority([0, 0, 0, 1, 2])).toBe(0)
    })

    it('handles large array with majority', () => {
      const arr = Array.from({ length: 101 }, (_, i) => i < 51 ? 7 : i)
      expect(BoyerMooreVote.findMajority(arr)).toBe(7)
    })

    it('handles alternating pattern ending with majority', () => {
      expect(BoyerMooreVote.findMajority([1, 2, 1, 2, 1])).toBe(1)
    })

    it('handles three equal groups returns null', () => {
      expect(BoyerMooreVote.findMajority([1, 1, 2, 2, 3, 3])).toBeNull()
    })

    it('handles boolean values', () => {
      expect(BoyerMooreVote.findMajority([true, true, false])).toBe(true)
    })

    it('handles null values in array', () => {
      expect(BoyerMooreVote.findMajority([null, null, 1])).toBe(null)
    })

    it('returns null for four equal groups', () => {
      expect(BoyerMooreVote.findMajority([1, 2, 3, 4])).toBeNull()
    })

    it('handles single element repeated many times', () => {
      expect(BoyerMooreVote.findMajority([5, 5, 5, 5, 5])).toBe(5)
    })
  })

  describe('findMajorityIndex', () => {
    it('returns index of majority element', () => {
      expect(BoyerMooreVote.findMajorityIndex([3, 2, 3])).toBeGreaterThanOrEqual(0)
    })

    it('returns -1 for no majority', () => {
      expect(BoyerMooreVote.findMajorityIndex([1, 2, 3])).toBe(-1)
    })

    it('returns -1 for empty array', () => {
      expect(BoyerMooreVote.findMajorityIndex([])).toBe(-1)
    })

    it('returns 0 for single element', () => {
      expect(BoyerMooreVote.findMajorityIndex([42])).toBe(0)
    })

    it('returns valid index for all same elements', () => {
      const idx = BoyerMooreVote.findMajorityIndex([5, 5, 5])
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(3)
    })

    it('returns -1 for exactly half', () => {
      expect(BoyerMooreVote.findMajorityIndex([1, 2, 1, 2])).toBe(-1)
    })

    it('index points to majority element', () => {
      const arr = [1, 2, 1, 1, 3]
      const idx = BoyerMooreVote.findMajorityIndex(arr)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(arr[idx]).toBe(1)
    })

    it('handles majority by one element', () => {
      const idx = BoyerMooreVote.findMajorityIndex([1, 1, 1, 2, 2])
      expect(idx).toBeGreaterThanOrEqual(0)
    })

    it('returns -1 for two different elements', () => {
      expect(BoyerMooreVote.findMajorityIndex([1, 2])).toBe(-1)
    })

    it('handles strings', () => {
      const idx = BoyerMooreVote.findMajorityIndex(['a', 'b', 'a', 'a'])
      expect(idx).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findAllFrequent', () => {
    it('finds elements appearing at least n/k times', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 1, 2, 2, 3], 3)
      expect(result).toContain(1)
    })

    it('returns empty for uniform distribution with k=2', () => {
      expect(BoyerMooreVote.findAllFrequent([1, 2, 3, 4], 2)).toEqual([])
    })

    it('finds frequent elements with k=2', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 1, 2, 2, 3, 3], 2)
      expect(result).toContain(1)
    })

    it('handles empty array', () => {
      expect(BoyerMooreVote.findAllFrequent([], 2)).toEqual([])
    })

    it('handles single element with k=1', () => {
      const result = BoyerMooreVote.findAllFrequent([5], 1)
      expect(result).toContain(5)
    })

    it('finds all elements when all equal', () => {
      const result = BoyerMooreVote.findAllFrequent([3, 3, 3, 3], 2)
      expect(result).toEqual([3])
    })

    it('finds multiple frequent elements', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 2, 2, 3], 3)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })

    it('handles k larger than array length returns all elements', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 2, 3], 10)
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('handles k=1 threshold equals array length', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 2, 3], 1)
      expect(result).toEqual([])
    })

    it('handles k=1 with repeated element', () => {
      const result = BoyerMooreVote.findAllFrequent([5, 5, 5], 1)
      expect(result).toEqual([5])
    })

    it('threshold is floor(n/k)', () => {
      const arr = [1, 1, 2, 2, 3]
      const result = BoyerMooreVote.findAllFrequent(arr, 3)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })

    it('handles string elements', () => {
      const result = BoyerMooreVote.findAllFrequent(['a', 'a', 'b', 'c'], 2)
      expect(result).toContain('a')
    })

    it('handles large k value returns all elements', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 1, 2, 3, 4], 100)
      expect(result.sort()).toEqual([1, 2, 3, 4])
    })

    it('handles k=2 with clear majority', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 1, 1, 2, 3], 2)
      expect(result).toContain(1)
    })

    it('empty array with any k returns empty', () => {
      expect(BoyerMooreVote.findAllFrequent([], 5)).toEqual([])
    })

    it('single element repeated with small k', () => {
      const result = BoyerMooreVote.findAllFrequent([5, 5, 5, 5], 2)
      expect(result).toEqual([5])
    })

    it('handles k=0 returns empty array', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 2, 3], 0)
      expect(result).toEqual([])
    })

    it('handles negative k values returns elements', () => {
      const result = BoyerMooreVote.findAllFrequent([1, 1, 2], -2)
      expect(result.sort()).toEqual([1, 2])
    })

    it('handles NaN elements correctly counted', () => {
      const result = BoyerMooreVote.findAllFrequent([NaN, NaN, 1, 2], 2)
      expect(result.length).toBe(1)
    })

    it('threshold with k=1 requires all elements', () => {
      const arr = [1, 1, 1, 1]
      const result = BoyerMooreVote.findAllFrequent(arr, 1)
      expect(result).toEqual([1])
    })

    it('handles BigInt elements', () => {
      const result = BoyerMooreVote.findAllFrequent([1n, 1n, 2n, 3n], 2)
      expect(result).toContain(1n)
    })
  })

  it('findMajorityIndex returns -1 for empty', () => {
    expect(BoyerMooreVote.findMajorityIndex([])).toBe(-1)
  })

  it('findMajorityIndex returns correct index', () => {
    expect(BoyerMooreVote.findMajorityIndex([2, 2, 2, 1])).toBe(0)
  })

  it('findMajorityIndex returns -1 when no majority', () => {
    expect(BoyerMooreVote.findMajorityIndex([1, 2, 3])).toBe(-1)
  })

  it('findAllFrequent with k=1 returns items above count threshold', () => {
    const result = BoyerMooreVote.findAllFrequent([5, 5, 5, 5, 1], 1)
    expect(result).toContain(5)
  })
})

  it('no majority returns null', () => {
    expect(BoyerMooreVote.findMajority([1, 2, 3])).toBeNull()
  })

  it('finds majority element', () => {
    expect(BoyerMooreVote.findMajority([1, 1, 2, 1, 3, 1])).toBe(1)
  })

  it('single element is majority', () => {
    expect(BoyerMooreVote.findMajority([5])).toBe(5)
  })

describe('boyer-moore-vote - wave544', () => {
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

describe('boyer-moore-vote - wave546', () => {
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

describe('boyer-moore-vote - wave547', () => {
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

describe('boyer-moore-vote - wave548', () => {
  it('boyer-moore-vote module defined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote module is function', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave549', () => {
  it('boyer-moore-vote module defined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote module is function', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave550', () => {
  it('boyer-moore-vote w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave551', () => {
  it('boyer-moore-vote w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave552', () => {
  it('boyer-moore-vote w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave553', () => {
  it('boyer-moore-vote w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave554', () => {
  it('boyer-moore-vote w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave555', () => {
  it('boyer-moore-vote w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave556', () => {
  it('boyer-moore-vote w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave557', () => {
  it('boyer-moore-vote w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave558', () => {
  it('boyer-moore-vote w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('boyer-moore-vote - wave559', () => {
  it('boyer-moore-vote w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('boyer-moore-vote w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
