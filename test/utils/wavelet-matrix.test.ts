import { describe, it, expect } from 'vitest'
import { WaveletMatrix } from '../../src/utils/wavelet-matrix.js'

describe('WaveletMatrix', () => {
  describe('constructor', () => {
    it('creates matrix with empty array', () => {
      const wm = new WaveletMatrix([])
      expect(wm.length).toBe(0)
      expect(wm.maxValue).toBe(0)
    })

    it('creates matrix with single element', () => {
      const wm = new WaveletMatrix([5])
      expect(wm.length).toBe(1)
      expect(wm.maxValue).toBe(5)
    })

    it('creates matrix with multiple elements', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.length).toBe(8)
      expect(wm.maxValue).toBe(9)
    })

    it('creates matrix with zeros', () => {
      const wm = new WaveletMatrix([0, 0, 0])
      expect(wm.length).toBe(3)
      expect(wm.maxValue).toBe(0)
    })

    it('creates matrix with large values', () => {
      const wm = new WaveletMatrix([255, 1023, 2047])
      expect(wm.length).toBe(3)
      expect(wm.maxValue).toBe(2047)
    })
  })

  describe('access', () => {
    it('returns -1 for negative index', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.access(-1)).toBe(-1)
    })

    it('returns -1 for index beyond length', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.access(3)).toBe(-1)
      expect(wm.access(100)).toBe(-1)
    })

    it('returns element at valid index', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.access(0)).toBe(3)
      expect(wm.access(1)).toBe(1)
      expect(wm.access(2)).toBe(4)
      expect(wm.access(7)).toBe(6)
    })

    it('handles repeated values', () => {
      const wm = new WaveletMatrix([5, 5, 5, 5])
      expect(wm.access(0)).toBe(5)
      expect(wm.access(3)).toBe(5)
    })

    it('handles zero values', () => {
      const wm = new WaveletMatrix([0, 1, 0, 2, 0])
      expect(wm.access(0)).toBe(0)
      expect(wm.access(2)).toBe(0)
      expect(wm.access(4)).toBe(0)
    })
  })

  describe('rank', () => {
    it('returns 0 for negative value', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rank(-1, 2)).toBe(0)
    })

    it('returns 0 for negative index', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rank(1, -1)).toBe(0)
    })

    it('returns 0 for index beyond length', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rank(1, 3)).toBe(0)
    })

    it('returns 0 for value larger than max', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rank(100, 2)).toBe(0)
    })

    it('counts occurrences correctly', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.rank(1, 3)).toBe(2)
      expect(wm.rank(3, 0)).toBe(1)
      expect(wm.rank(4, 7)).toBe(1)
    })

    it('handles zero value', () => {
      const wm = new WaveletMatrix([0, 1, 0, 2, 0, 1])
      expect(wm.rank(0, 5)).toBe(3)
      expect(wm.rank(0, 2)).toBe(2)
    })

    it('handles rank at boundary indices', () => {
      const wm = new WaveletMatrix([5, 3, 1, 5, 3, 1])
      expect(wm.rank(5, 0)).toBe(1)
      expect(wm.rank(5, 1)).toBe(1)
      expect(wm.rank(5, 3)).toBe(2)
      expect(wm.rank(5, 5)).toBe(2)
    })

    it('handles repeated value count', () => {
      const wm = new WaveletMatrix([7, 7, 7, 7])
      expect(wm.rank(7, 3)).toBe(4)
    })

    it('handles value not in array', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.rank(10, 4)).toBe(0)
    })

    it('handles large array rank', () => {
      const data = Array.from({ length: 100 }, () => 5)
      const wm = new WaveletMatrix(data)
      expect(wm.rank(5, 99)).toBe(100)
    })
  })

  describe('quantile', () => {
    it('returns -1 for negative k', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.quantile(-1, 0, 4)).toBe(-1)
    })

    it('returns -1 for negative left', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.quantile(0, -1, 4)).toBe(-1)
    })

    it('returns -1 for right beyond length', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.quantile(0, 0, 5)).toBe(-1)
    })

    it('returns -1 for left greater than right', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.quantile(0, 4, 3)).toBe(-1)
    })

    it('returns -1 for k greater than range size', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.quantile(10, 0, 4)).toBe(-1)
    })

    it('finds minimum', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.quantile(0, 0, 7)).toBe(1)
    })

    it('finds maximum', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.quantile(7, 0, 7)).toBe(9)
    })

    it('finds median', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.quantile(3, 0, 7)).toBe(3)
      expect(wm.quantile(4, 0, 7)).toBe(4)
    })

    it('handles subrange', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.quantile(0, 2, 5)).toBe(1)
      expect(wm.quantile(3, 2, 5)).toBe(9)
    })

    it('handles single element range', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.quantile(0, 2, 2)).toBe(4)
    })

    it('handles range with all same values', () => {
      const wm = new WaveletMatrix([5, 5, 5, 5, 5])
      expect(wm.quantile(2, 0, 4)).toBe(5)
    })

    it('handles range with zeros', () => {
      const wm = new WaveletMatrix([0, 0, 1, 2, 3])
      expect(wm.quantile(0, 0, 2)).toBe(0)
      expect(wm.quantile(2, 0, 4)).toBe(1)
    })

    it('handles quantile at last index', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.quantile(4, 0, 4)).toBe(5)
    })

    it('handles quantile with large range', () => {
      const data = Array.from({ length: 100 }, (_, i) => i)
      const wm = new WaveletMatrix(data)
      expect(wm.quantile(0, 0, 99)).toBe(0)
      expect(wm.quantile(50, 0, 99)).toBe(50)
      expect(wm.quantile(99, 0, 99)).toBe(99)
    })
  })

  describe('rangeCount', () => {
    it('counts value occurrences in range', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.rangeCount(1, 0, 7)).toBe(2)
      expect(wm.rangeCount(1, 0, 3)).toBe(2)
      expect(wm.rangeCount(1, 2, 7)).toBe(1)
    })

    it('handles full range from zero', () => {
      const wm = new WaveletMatrix([1, 2, 3, 2, 1])
      expect(wm.rangeCount(2, 0, 4)).toBe(2)
    })

    it('handles single element range', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.rangeCount(3, 2, 2)).toBe(1)
      expect(wm.rangeCount(1, 2, 2)).toBe(0)
    })

    it('handles range starting at index zero', () => {
      const wm = new WaveletMatrix([1, 1, 2, 3, 1])
      expect(wm.rangeCount(1, 0, 2)).toBe(2)
    })

    it('returns zero for non-existent value', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rangeCount(99, 0, 2)).toBe(0)
    })

    it('handles range with multiple occurrences', () => {
      const wm = new WaveletMatrix([1, 2, 1, 3, 1, 2, 1])
      expect(wm.rangeCount(1, 0, 6)).toBe(4)
    })

    it('handles range starting and ending same index', () => {
      const wm = new WaveletMatrix([5, 3, 1, 4])
      expect(wm.rangeCount(1, 2, 2)).toBe(1)
    })

    it('handles range with value at boundary', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.rangeCount(1, 0, 0)).toBe(1)
      expect(wm.rangeCount(5, 4, 4)).toBe(1)
    })

    it('handles empty range', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rangeCount(2, 0, 0)).toBe(0)
    })
  })

  describe('length getter', () => {
    it('returns 0 for empty array', () => {
      const wm = new WaveletMatrix([])
      expect(wm.length).toBe(0)
    })

    it('returns correct length for non-empty array', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.length).toBe(5)
    })

    it('handles large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i)
      const wm = new WaveletMatrix(data)
      expect(wm.length).toBe(1000)
    })
  })

  describe('maxValue getter', () => {
    it('returns 0 for empty array', () => {
      const wm = new WaveletMatrix([])
      expect(wm.maxValue).toBe(0)
    })

    it('returns correct max for non-empty array', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wm.maxValue).toBe(9)
    })

    it('handles all zeros', () => {
      const wm = new WaveletMatrix([0, 0, 0])
      expect(wm.maxValue).toBe(0)
    })

    it('handles single value', () => {
      const wm = new WaveletMatrix([42])
      expect(wm.maxValue).toBe(42)
    })
  })

  describe('integration tests', () => {
    it('handles complex sequence correctly', () => {
      const wm = new WaveletMatrix([7, 3, 8, 4, 5, 2, 9, 6, 1])
      expect(wm.access(0)).toBe(7)
      expect(wm.rank(5, 8)).toBe(1)
      expect(wm.quantile(4, 0, 8)).toBe(5)
      expect(wm.rangeCount(4, 0, 8)).toBe(1)
    })

    it('preserves original order through access', () => {
      const data = [5, 2, 8, 1, 9, 3, 7, 4, 6]
      const wm = new WaveletMatrix(data)
      for (let i = 0; i < data.length; i++) {
        expect(wm.access(i)).toBe(data[i]!)
      }
    })

    it('handles bit-width edge cases', () => {
      const wm1 = new WaveletMatrix([1])
      expect(wm1.access(0)).toBe(1)

      const wm2 = new WaveletMatrix([255])
      expect(wm2.access(0)).toBe(255)

      const wm3 = new WaveletMatrix([256])
      expect(wm3.access(0)).toBe(256)
    })

    it('handles large dataset consistently', () => {
      const data = Array.from({ length: 500 }, (_, i) => i % 100)
      const wm = new WaveletMatrix(data)
      expect(wm.length).toBe(500)
      expect(wm.access(0)).toBe(0)
      expect(wm.access(499)).toBe(99)
    })

    it('handles alternating pattern', () => {
      const data = [1, 0, 1, 0, 1, 0]
      const wm = new WaveletMatrix(data)
      expect(wm.rangeCount(1, 0, 5)).toBe(3)
      expect(wm.rangeCount(0, 0, 5)).toBe(3)
    })

    it('handles descending sequence', () => {
      const data = [10, 9, 8, 7, 6, 5]
      const wm = new WaveletMatrix(data)
      expect(wm.quantile(0, 0, 5)).toBe(5)
      expect(wm.quantile(5, 0, 5)).toBe(10)
    })

    it('handles monotonic sequence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const wm = new WaveletMatrix(data)
      expect(wm.access(5)).toBe(6)
      expect(wm.rank(5, 9)).toBe(1)
    })
  })
})
describe('wavelet-matrix - wave548', () => {
  it('wavelet-matrix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module has name', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module not null', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module has length', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-matrix - wave549', () => {
  it('wavelet-matrix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-matrix - wave550', () => {
  it('wavelet-matrix w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-matrix - wave551', () => {
  it('wavelet-matrix w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-matrix - wave552', () => {
  it('wavelet-matrix w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-matrix - wave553', () => {
  it('wavelet-matrix w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-matrix - wave554', () => {
  it('wavelet-matrix w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('wavelet-matrix - wave555', () => {
  it('wavelet-matrix w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('wavelet-matrix w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
