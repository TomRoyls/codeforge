import { describe, it, expect } from 'vitest'
import { SegmentTreePoint } from '../../src/core/segment-tree-point/index.js'

describe('SegmentTreePoint - Constructor', () => {
  it('creates a tree from an array of numbers', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.size).toBe(5)
    expect(st.isEmpty).toBe(false)
  })

  it('creates a tree from an empty array', () => {
    const st = new SegmentTreePoint([])
    expect(st.size).toBe(0)
    expect(st.isEmpty).toBe(true)
  })

  it('creates a tree with a single element', () => {
    const st = new SegmentTreePoint([42])
    expect(st.size).toBe(1)
    expect(st.queryAll()).toBe(42)
  })

  it('creates a tree with two elements', () => {
    const st = new SegmentTreePoint([3, 7])
    expect(st.size).toBe(2)
    expect(st.query(0, 1)).toBe(10)
  })

  it('creates a tree with default sum operation', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(st.queryAll()).toBe(6)
  })

  it('creates a tree with custom min operation', () => {
    const st = new SegmentTreePoint([5, 3, 8, 1, 4], {
      operation: (a, b) => Math.min(a, b),
      identity: Infinity,
    })
    expect(st.queryAll()).toBe(1)
  })

  it('creates a tree with custom max operation', () => {
    const st = new SegmentTreePoint([5, 3, 8, 1, 4], {
      operation: (a, b) => Math.max(a, b),
      identity: -Infinity,
    })
    expect(st.queryAll()).toBe(8)
  })

  it('creates a tree with custom xor operation', () => {
    const st = new SegmentTreePoint([1, 2, 3], {
      operation: (a, b) => a ^ b,
      identity: 0,
    })
    expect(st.queryAll()).toBe(0)
  })

  it('creates a tree with string concatenation', () => {
    const st = new SegmentTreePoint(['a', 'b', 'c'], {
      operation: (a, b) => a + b,
      identity: '',
    })
    expect(st.queryAll()).toBe('abc')
  })

  it('preserves original array (does not mutate input)', () => {
    const arr = [1, 2, 3]
    const st = new SegmentTreePoint(arr)
    st.update(0, 99)
    expect(arr[0]).toBe(1)
  })
})

describe('SegmentTreePoint - query', () => {
  it('queries full range', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(0, 4)).toBe(15)
  })

  it('queries single element at start', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(0, 0)).toBe(1)
  })

  it('queries single element at end', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(4, 4)).toBe(5)
  })

  it('queries single element in middle', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(2, 2)).toBe(3)
  })

  it('queries partial range from start', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(0, 2)).toBe(6)
  })

  it('queries partial range to end', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(2, 4)).toBe(12)
  })

  it('queries partial range in middle', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(1, 3)).toBe(9)
  })

  it('queries adjacent elements', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.query(1, 2)).toBe(5)
  })

  it('throws on negative lo', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(() => st.query(-1, 2)).toThrow(RangeError)
  })

  it('throws on hi >= size', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(() => st.query(0, 3)).toThrow(RangeError)
  })

  it('throws when lo > hi', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(() => st.query(2, 1)).toThrow(RangeError)
  })

  it('throws on empty tree', () => {
    const st = new SegmentTreePoint([])
    expect(() => st.query(0, 0)).toThrow(RangeError)
  })

  it('queries with negative numbers', () => {
    const st = new SegmentTreePoint([-1, -2, -3, -4])
    expect(st.query(0, 3)).toBe(-10)
  })

  it('queries with mixed positive and negative', () => {
    const st = new SegmentTreePoint([5, -3, 7, -2, 1])
    expect(st.query(0, 4)).toBe(8)
  })

  it('queries with zeros', () => {
    const st = new SegmentTreePoint([0, 0, 0, 0])
    expect(st.query(0, 3)).toBe(0)
  })
})

describe('SegmentTreePoint - queryAll', () => {
  it('returns sum of all elements', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    expect(st.queryAll()).toBe(15)
  })

  it('returns identity for empty tree', () => {
    const st = new SegmentTreePoint([])
    expect(st.queryAll()).toBe(0)
  })

  it('returns single element', () => {
    const st = new SegmentTreePoint([42])
    expect(st.queryAll()).toBe(42)
  })
})

describe('SegmentTreePoint - update', () => {
  it('updates a single element', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    st.update(2, 10)
    expect(st.queryAll()).toBe(22)
  })

  it('updates first element', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(0, 10)
    expect(st.query(0, 0)).toBe(10)
    expect(st.queryAll()).toBe(15)
  })

  it('updates last element', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(2, 10)
    expect(st.query(2, 2)).toBe(10)
    expect(st.queryAll()).toBe(13)
  })

  it('updates with same value', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, 2)
    expect(st.queryAll()).toBe(6)
  })

  it('updates with zero', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, 0)
    expect(st.queryAll()).toBe(4)
  })

  it('updates with negative value', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, -5)
    expect(st.queryAll()).toBe(-1)
  })

  it('multiple updates maintain correctness', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    st.update(0, 10)
    st.update(4, 20)
    st.update(2, 30)
    expect(st.queryAll()).toBe(66)
    expect(st.query(0, 2)).toBe(42)
    expect(st.query(2, 4)).toBe(54)
  })

  it('throws on negative index', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(() => st.update(-1, 5)).toThrow(RangeError)
  })

  it('throws on index >= size', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(() => st.update(3, 5)).toThrow(RangeError)
  })

  it('reflects in toArray', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, 99)
    expect(st.toArray()).toEqual([1, 99, 3])
  })

  it('reflects in pointQuery', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, 99)
    expect(st.pointQuery(1)).toBe(99)
  })
})

describe('SegmentTreePoint - pointQuery', () => {
  it('returns element at index 0', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    expect(st.pointQuery(0)).toBe(10)
  })

  it('returns element at last index', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    expect(st.pointQuery(2)).toBe(30)
  })

  it('returns element in middle', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    expect(st.pointQuery(1)).toBe(20)
  })

  it('returns updated value after update', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    st.update(1, 99)
    expect(st.pointQuery(1)).toBe(99)
  })

  it('throws on negative index', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(() => st.pointQuery(-1)).toThrow(RangeError)
  })

  it('throws on index >= size', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(() => st.pointQuery(3)).toThrow(RangeError)
  })
})

describe('SegmentTreePoint - size and isEmpty', () => {
  it('returns correct size', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4])
    expect(st.size).toBe(4)
  })

  it('returns 0 for empty tree', () => {
    const st = new SegmentTreePoint([])
    expect(st.size).toBe(0)
  })

  it('isEmpty is true for empty tree', () => {
    const st = new SegmentTreePoint([])
    expect(st.isEmpty).toBe(true)
  })

  it('isEmpty is false for non-empty tree', () => {
    const st = new SegmentTreePoint([1])
    expect(st.isEmpty).toBe(false)
  })
})

describe('SegmentTreePoint - toArray', () => {
  it('returns copy of original array', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    expect(st.toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array for empty tree', () => {
    const st = new SegmentTreePoint([])
    expect(st.toArray()).toEqual([])
  })

  it('returns updated values', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, 99)
    expect(st.toArray()).toEqual([1, 99, 3])
  })

  it('returns independent copy', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    const arr = st.toArray()
    arr[0] = 999
    expect(st.pointQuery(0)).toBe(1)
  })
})

describe('SegmentTreePoint - forEach', () => {
  it('iterates over all elements', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    const result: number[] = []
    st.forEach((v) => result.push(v))
    expect(result).toEqual([10, 20, 30])
  })

  it('provides correct indices', () => {
    const st = new SegmentTreePoint([10, 20, 30])
    const indices: number[] = []
    st.forEach((_v, i) => indices.push(i))
    expect(indices).toEqual([0, 1, 2])
  })

  it('does not iterate on empty tree', () => {
    const st = new SegmentTreePoint([])
    let count = 0
    st.forEach(() => count++)
    expect(count).toBe(0)
  })

  it('reflects updates', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.update(1, 99)
    const result: number[] = []
    st.forEach((v) => result.push(v))
    expect(result).toEqual([1, 99, 3])
  })
})

describe('SegmentTreePoint - clone', () => {
  it('creates an independent copy', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    const copy = st.clone()
    st.update(0, 99)
    expect(copy.queryAll()).toBe(6)
    expect(st.queryAll()).toBe(104)
  })

  it('clones empty tree', () => {
    const st = new SegmentTreePoint([])
    const copy = st.clone()
    expect(copy.size).toBe(0)
    expect(copy.isEmpty).toBe(true)
  })

  it('preserves custom operation', () => {
    const st = new SegmentTreePoint([5, 3, 8, 1], {
      operation: (a, b) => Math.max(a, b),
      identity: -Infinity,
    })
    const copy = st.clone()
    expect(copy.query(0, 3)).toBe(8)
  })
})

describe('SegmentTreePoint - clear', () => {
  it('clears the tree', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.clear()
    expect(st.size).toBe(0)
    expect(st.isEmpty).toBe(true)
  })

  it('queryAll returns identity after clear', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.clear()
    expect(st.queryAll()).toBe(0)
  })

  it('toArray returns empty after clear', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.clear()
    expect(st.toArray()).toEqual([])
  })
})

describe('SegmentTreePoint - static sum', () => {
  it('creates sum tree', () => {
    const st = SegmentTreePoint.sum([1, 2, 3, 4])
    expect(st.queryAll()).toBe(10)
  })

  it('handles empty array', () => {
    const st = SegmentTreePoint.sum([])
    expect(st.queryAll()).toBe(0)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.sum([5])
    expect(st.queryAll()).toBe(5)
  })

  it('handles negative numbers', () => {
    const st = SegmentTreePoint.sum([-1, -2, -3])
    expect(st.queryAll()).toBe(-6)
  })
})

describe('SegmentTreePoint - static min', () => {
  it('finds minimum', () => {
    const st = SegmentTreePoint.min([5, 3, 8, 1, 4])
    expect(st.queryAll()).toBe(1)
  })

  it('finds minimum in range', () => {
    const st = SegmentTreePoint.min([5, 3, 8, 1, 4])
    expect(st.query(0, 2)).toBe(3)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.min([42])
    expect(st.queryAll()).toBe(42)
  })

  it('handles empty', () => {
    const st = SegmentTreePoint.min([])
    expect(st.queryAll()).toBe(Infinity)
  })

  it('updates correctly', () => {
    const st = SegmentTreePoint.min([5, 3, 8])
    st.update(1, 10)
    expect(st.query(0, 2)).toBe(5)
  })
})

describe('SegmentTreePoint - static max', () => {
  it('finds maximum', () => {
    const st = SegmentTreePoint.max([5, 3, 8, 1, 4])
    expect(st.queryAll()).toBe(8)
  })

  it('finds maximum in range', () => {
    const st = SegmentTreePoint.max([5, 3, 8, 1, 4])
    expect(st.query(0, 2)).toBe(8)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.max([42])
    expect(st.queryAll()).toBe(42)
  })

  it('handles empty', () => {
    const st = SegmentTreePoint.max([])
    expect(st.queryAll()).toBe(-Infinity)
  })

  it('updates correctly', () => {
    const st = SegmentTreePoint.max([5, 3, 8])
    st.update(0, 20)
    expect(st.query(0, 2)).toBe(20)
  })
})

describe('SegmentTreePoint - static gcd', () => {
  it('computes GCD of all elements', () => {
    const st = SegmentTreePoint.gcd([12, 18, 24])
    expect(st.queryAll()).toBe(6)
  })

  it('computes GCD of range', () => {
    const st = SegmentTreePoint.gcd([12, 18, 24, 36])
    expect(st.query(1, 3)).toBe(6)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.gcd([15])
    expect(st.queryAll()).toBe(15)
  })

  it('handles coprime numbers', () => {
    const st = SegmentTreePoint.gcd([7, 13])
    expect(st.queryAll()).toBe(1)
  })

  it('handles zeros', () => {
    const st = SegmentTreePoint.gcd([0, 5])
    expect(st.queryAll()).toBe(5)
  })
})

describe('SegmentTreePoint - static xor', () => {
  it('computes XOR of all elements', () => {
    const st = SegmentTreePoint.xor([1, 2, 3])
    expect(st.queryAll()).toBe(0)
  })

  it('computes XOR of range', () => {
    const st = SegmentTreePoint.xor([1, 2, 3, 4, 5])
    expect(st.query(0, 2)).toBe(0)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.xor([42])
    expect(st.queryAll()).toBe(42)
  })

  it('handles all zeros', () => {
    const st = SegmentTreePoint.xor([0, 0, 0])
    expect(st.queryAll()).toBe(0)
  })

  it('handles self-inverse', () => {
    const st = SegmentTreePoint.xor([7, 7])
    expect(st.queryAll()).toBe(0)
  })
})

describe('SegmentTreePoint - static product', () => {
  it('computes product of all elements', () => {
    const st = SegmentTreePoint.product([2, 3, 4])
    expect(st.queryAll()).toBe(24)
  })

  it('computes product of range', () => {
    const st = SegmentTreePoint.product([1, 2, 3, 4, 5])
    expect(st.query(1, 3)).toBe(24)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.product([7])
    expect(st.queryAll()).toBe(7)
  })

  it('handles empty', () => {
    const st = SegmentTreePoint.product([])
    expect(st.queryAll()).toBe(1)
  })

  it('handles zeros', () => {
    const st = SegmentTreePoint.product([1, 0, 3])
    expect(st.queryAll()).toBe(0)
  })
})

describe('SegmentTreePoint - static bitwiseOr', () => {
  it('computes OR of all elements', () => {
    const st = SegmentTreePoint.bitwiseOr([1, 2, 4])
    expect(st.queryAll()).toBe(7)
  })

  it('computes OR of range', () => {
    const st = SegmentTreePoint.bitwiseOr([1, 2, 4, 8])
    expect(st.query(0, 2)).toBe(7)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.bitwiseOr([5])
    expect(st.queryAll()).toBe(5)
  })

  it('handles empty', () => {
    const st = SegmentTreePoint.bitwiseOr([])
    expect(st.queryAll()).toBe(0)
  })
})

describe('SegmentTreePoint - static bitwiseAnd', () => {
  it('computes AND of all elements', () => {
    const st = SegmentTreePoint.bitwiseAnd([7, 6, 5])
    expect(st.queryAll()).toBe(4)
  })

  it('computes AND of range', () => {
    const st = SegmentTreePoint.bitwiseAnd([15, 14, 13, 12])
    expect(st.query(0, 2)).toBe(12)
  })

  it('handles single element', () => {
    const st = SegmentTreePoint.bitwiseAnd([5])
    expect(st.queryAll()).toBe(5)
  })

  it('handles empty', () => {
    const st = SegmentTreePoint.bitwiseAnd([])
    expect(st.queryAll()).toBe(~0 >>> 0)
  })
})

describe('SegmentTreePoint - static fromArray', () => {
  it('creates tree from array', () => {
    const st = SegmentTreePoint.fromArray([1, 2, 3])
    expect(st.queryAll()).toBe(6)
  })

  it('creates tree with custom options', () => {
    const st = SegmentTreePoint.fromArray([5, 3, 8], {
      operation: (a, b) => Math.min(a, b),
      identity: Infinity,
    })
    expect(st.queryAll()).toBe(3)
  })
})

describe('SegmentTreePoint - large inputs', () => {
  it('handles 100 elements', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const st = new SegmentTreePoint(arr)
    expect(st.queryAll()).toBe(5050)
    expect(st.query(0, 9)).toBe(55)
    expect(st.query(90, 99)).toBe(955)
  })

  it('handles 1000 elements', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
    const st = new SegmentTreePoint(arr)
    expect(st.queryAll()).toBe(500500)
    st.update(499, 0)
    expect(st.query(498, 500)).toBe(499 + 0 + 501)
  })

  it('handles 16 elements (power of 2)', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i + 1)
    const st = new SegmentTreePoint(arr)
    expect(st.queryAll()).toBe(136)
    expect(st.query(0, 7)).toBe(36)
    expect(st.query(8, 15)).toBe(100)
  })

  it('handles 15 elements (non-power of 2)', () => {
    const arr = Array.from({ length: 15 }, (_, i) => i + 1)
    const st = new SegmentTreePoint(arr)
    expect(st.queryAll()).toBe(120)
  })

  it('handles 17 elements (power of 2 + 1)', () => {
    const arr = Array.from({ length: 17 }, (_, i) => i + 1)
    const st = new SegmentTreePoint(arr)
    expect(st.queryAll()).toBe(153)
  })
})

describe('SegmentTreePoint - stress tests', () => {
  it('alternating updates and queries', () => {
    const st = new SegmentTreePoint([0, 0, 0, 0, 0])
    for (let i = 0; i < 5; i++) {
      st.update(i, i + 1)
    }
    expect(st.queryAll()).toBe(15)
    st.update(2, 100)
    expect(st.query(0, 4)).toBe(112)
    expect(st.query(0, 1)).toBe(3)
    expect(st.query(3, 4)).toBe(9)
  })

  it('update then query each position', () => {
    const st = new SegmentTreePoint([0, 0, 0, 0])
    st.update(0, 10)
    expect(st.pointQuery(0)).toBe(10)
    st.update(1, 20)
    expect(st.pointQuery(1)).toBe(20)
    st.update(2, 30)
    expect(st.pointQuery(2)).toBe(30)
    st.update(3, 40)
    expect(st.pointQuery(3)).toBe(40)
    expect(st.queryAll()).toBe(100)
  })

  it('min tree with all same elements', () => {
    const st = SegmentTreePoint.min([5, 5, 5, 5, 5])
    expect(st.queryAll()).toBe(5)
    st.update(2, 3)
    expect(st.queryAll()).toBe(3)
    st.update(2, 5)
    expect(st.queryAll()).toBe(5)
  })

  it('max tree with descending values', () => {
    const st = SegmentTreePoint.max([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(st.query(0, 9)).toBe(10)
    expect(st.query(5, 9)).toBe(5)
    expect(st.query(0, 4)).toBe(10)
  })
})

describe('SegmentTreePoint - generic type', () => {
  it('works with boolean AND', () => {
    const st = new SegmentTreePoint<boolean>([true, true, false, true], {
      operation: (a, b) => a && b,
      identity: true,
    })
    expect(st.queryAll()).toBe(false)
    expect(st.query(0, 1)).toBe(true)
    expect(st.query(0, 2)).toBe(false)
  })

  it('works with boolean OR', () => {
    const st = new SegmentTreePoint<boolean>([false, false, true, false], {
      operation: (a, b) => a || b,
      identity: false,
    })
    expect(st.queryAll()).toBe(true)
    expect(st.query(0, 1)).toBe(false)
    expect(st.query(2, 2)).toBe(true)
  })

  it('works with string concatenation', () => {
    const st = new SegmentTreePoint(['x', 'y', 'z'], {
      operation: (a, b) => a + b,
      identity: '',
    })
    expect(st.queryAll()).toBe('xyz')
    expect(st.query(0, 1)).toBe('xy')
    st.update(1, 'Y')
    expect(st.queryAll()).toBe('xYz')
  })
})

describe('SegmentTreePoint - edge cases', () => {
  it('query with all negative values', () => {
    const st = SegmentTreePoint.min([-5, -3, -8, -1])
    expect(st.queryAll()).toBe(-8)
  })

  it('query range of single element after update', () => {
    const st = new SegmentTreePoint([1, 2, 3, 4, 5])
    st.update(2, 100)
    expect(st.query(2, 2)).toBe(100)
  })

  it('multiple sequential updates', () => {
    const st = new SegmentTreePoint([1, 1, 1, 1, 1])
    for (let i = 0; i < 5; i++) {
      st.update(i, (i + 1) * 10)
    }
    expect(st.toArray()).toEqual([10, 20, 30, 40, 50])
    expect(st.queryAll()).toBe(150)
  })

  it('clone then update does not affect original', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    const copy = st.clone()
    copy.update(0, 100)
    expect(st.query(0, 0)).toBe(1)
    expect(copy.query(0, 0)).toBe(100)
  })

  it('query after clear throws', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.clear()
    expect(() => st.query(0, 0)).toThrow(RangeError)
  })

  it('pointQuery after clear throws', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.clear()
    expect(() => st.pointQuery(0)).toThrow(RangeError)
  })

  it('update after clear throws', () => {
    const st = new SegmentTreePoint([1, 2, 3])
    st.clear()
    expect(() => st.update(0, 5)).toThrow(RangeError)
  })

  it('large values', () => {
    const st = new SegmentTreePoint([1e15, 2e15, 3e15])
    expect(st.queryAll()).toBe(6e15)
  })

  it('floating point values', () => {
    const st = new SegmentTreePoint([1.5, 2.5, 3.5])
    expect(st.queryAll()).toBeCloseTo(7.5)
  })
})
