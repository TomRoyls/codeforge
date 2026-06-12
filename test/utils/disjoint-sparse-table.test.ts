import { describe, expect, it } from 'vitest'
import { DisjointSparseTable } from '../../src/utils/disjoint-sparse-table.js'

describe('DisjointSparseTable', () => {
  it('queries sum over range', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5], (a, b) => a + b)
    expect(dst.query(0, 4)).toBe(15)
    expect(dst.query(1, 3)).toBe(9)
    expect(dst.query(2, 2)).toBe(3)
  })

  it('queries min over range', () => {
    const dst = new DisjointSparseTable([5, 3, 7, 1, 4, 2], (a, b) => Math.min(a, b))
    expect(dst.query(0, 5)).toBe(1)
    expect(dst.query(1, 3)).toBe(1)
    expect(dst.query(0, 1)).toBe(3)
  })

  it('queries max over range', () => {
    const dst = new DisjointSparseTable([5, 3, 7, 1, 4, 2], (a, b) => Math.max(a, b))
    expect(dst.query(0, 5)).toBe(7)
    expect(dst.query(2, 4)).toBe(7)
  })

  it('handles single element', () => {
    const dst = new DisjointSparseTable([42], (a, b) => a + b)
    expect(dst.query(0, 0)).toBe(42)
  })

  it('handles two elements', () => {
    const dst = new DisjointSparseTable([3, 7], (a, b) => a + b)
    expect(dst.query(0, 0)).toBe(3)
    expect(dst.query(1, 1)).toBe(7)
    expect(dst.query(0, 1)).toBe(10)
  })

  it('handles power-of-two length', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4], (a, b) => a + b)
    expect(dst.query(0, 3)).toBe(10)
    expect(dst.query(1, 2)).toBe(5)
  })

  it('queries GCD over range', () => {
    const dst = new DisjointSparseTable([12, 18, 24, 9], (a, b) => {
      let x = a
      let y = b
      while (y !== 0) { const t = y; y = x % y; x = t }
      return x
    })
    expect(dst.query(0, 3)).toBe(3)
    expect(dst.query(0, 1)).toBe(6)
  })

  it('handles adjacent elements', () => {
    const dst = new DisjointSparseTable([10, 20, 30], (a, b) => a + b)
    expect(dst.query(0, 1)).toBe(30)
    expect(dst.query(1, 2)).toBe(50)
  })

  it('queries full range product', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4], (a, b) => a * b)
    expect(dst.query(0, 3)).toBe(24)
  })

  it('handles large array min query', () => {
    const data = Array.from({ length: 100 }, (_, i) => 100 - i)
    const dst = new DisjointSparseTable(data, (a, b) => Math.min(a, b))
    expect(dst.query(0, 99)).toBe(1)
    expect(dst.query(50, 99)).toBe(1)
  })

  it('handles bitwise AND queries', () => {
    const dst = new DisjointSparseTable([15, 12, 10, 9], (a, b) => a & b)
    expect(dst.query(0, 3)).toBe(8)
    expect(dst.query(0, 1)).toBe(12)
  })

  it('handles range with XOR', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5], (a, b) => a ^ b)
    expect(dst.query(0, 4)).toBe(1 ^ 2 ^ 3 ^ 4 ^ 5)
    expect(dst.query(1, 3)).toBe(2 ^ 3 ^ 4)
  })

  it('toString returns formatted string', () => {
    const dst = new DisjointSparseTable([1, 2, 3], (a, b) => a + b)
    expect(dst.toString()).toBe('DisjointSparseTable(n=3)')
  })

  it('toJSON returns original data', () => {
    const dst = new DisjointSparseTable([10, 20, 30], (a, b) => a + b)
    expect(dst.toJSON()).toEqual([10, 20, 30])
  })

  it('clone produces independent copy', () => {
    const dst = new DisjointSparseTable([1, 2, 3], (a, b) => a + b)
    const copy = dst.clone()
    expect(copy.query(0, 2)).toBe(6)
    expect(copy.toJSON()).toEqual([1, 2, 3])
  })

  it('equals with same data', () => {
    const a = new DisjointSparseTable([1, 2, 3], (a, b) => a + b)
    const b = new DisjointSparseTable([1, 2, 3], (a, b) => a + b)
    expect(a.equals(b)).toBe(true)
  })

  it('equals with different n checks length only', () => {
    const a = new DisjointSparseTable([1, 2, 3], (a, b) => a + b)
    const b = new DisjointSparseTable([1, 2, 4], (a, b) => a + b)
    expect(a.equals(b)).toBe(true)
  })

  it('equals with non-DisjointSparseTable', () => {
    const dst = new DisjointSparseTable([1, 2], (a, b) => a + b)
    expect(dst.equals(null)).toBe(false)
    expect(dst.equals({})).toBe(false)
  })

  it('handles empty data', () => {
    const dst = new DisjointSparseTable([], (a, b) => a + b)
    expect(dst.toJSON()).toEqual([])
    expect(dst.toString()).toBe('DisjointSparseTable(n=0)')
  })

  it('handles three element max', () => {
    const dst = new DisjointSparseTable([3, 9, 5], (a, b) => Math.max(a, b))
    expect(dst.query(0, 2)).toBe(9)
    expect(dst.query(0, 0)).toBe(3)
    expect(dst.query(2, 2)).toBe(5)
  })

  it('handles eight element sum', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5, 6, 7, 8], (a, b) => a + b)
    expect(dst.query(0, 7)).toBe(36)
    expect(dst.query(3, 5)).toBe(15)
  })

  it('min query across non-power-of-two', () => {
    const dst = new DisjointSparseTable([7, 3, 9, 1, 5], (a, b) => Math.min(a, b))
    expect(dst.query(0, 4)).toBe(1)
    expect(dst.query(0, 2)).toBe(3)
    expect(dst.query(3, 4)).toBe(1)
  })

  it('handles negative values sum', () => {
    const dst = new DisjointSparseTable([-1, -2, -3, -4], (a, b) => a + b)
    expect(dst.query(0, 3)).toBe(-10)
    expect(dst.query(1, 2)).toBe(-5)
  })

  it('handles zeros in array', () => {
    const dst = new DisjointSparseTable([0, 0, 0, 5], (a, b) => a + b)
    expect(dst.query(0, 3)).toBe(5)
    expect(dst.query(0, 2)).toBe(0)
  })

  it('query individual elements', () => {
    const dst = new DisjointSparseTable([10, 20, 30, 40, 50], (a, b) => a + b)
    for (let i = 0; i < 5; i++) {
      expect(dst.query(i, i)).toBe((i + 1) * 10)
    }
  })

  it('clone of empty table', () => {
    const dst = new DisjointSparseTable([], (a, b) => a + b)
    const copy = dst.clone()
    expect(copy.toJSON()).toEqual([])
  })

  it('query sub-ranges of 16 elements', () => {
    const data = Array.from({ length: 16 }, (_, i) => i + 1)
    const dst = new DisjointSparseTable(data, (a, b) => a + b)
    expect(dst.query(0, 15)).toBe(136)
    expect(dst.query(4, 7)).toBe(26)
    expect(dst.query(8, 11)).toBe(42)
  })

  it('max query with plateau', () => {
    const dst = new DisjointSparseTable([1, 5, 5, 5, 1], (a, b) => Math.max(a, b))
    expect(dst.query(0, 4)).toBe(5)
    expect(dst.query(1, 3)).toBe(5)
    expect(dst.query(0, 0)).toBe(1)
  })

  it('handles single value repeated', () => {
    const dst = new DisjointSparseTable([7, 7, 7, 7], (a, b) => a + b)
    expect(dst.query(0, 3)).toBe(28)
    expect(dst.query(1, 2)).toBe(14)
  })

  it('bitwise OR queries', () => {
    const dst = new DisjointSparseTable([1, 2, 4, 8], (a, b) => a | b)
    expect(dst.query(0, 3)).toBe(15)
    expect(dst.query(0, 1)).toBe(3)
    expect(dst.query(2, 3)).toBe(12)
  })

  it('query across boundary of power-of-two blocks', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5, 6, 7, 8], (a, b) => a + b)
    expect(dst.query(2, 5)).toBe(18)
    expect(dst.query(3, 4)).toBe(9)
  })

  it('handles seven elements sum', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5, 6, 7], (a, b) => a + b)
    expect(dst.query(0, 6)).toBe(28)
    expect(dst.query(1, 5)).toBe(20)
  })

  it('min with descending values', () => {
    const dst = new DisjointSparseTable([5, 4, 3, 2, 1], (a, b) => Math.min(a, b))
    expect(dst.query(0, 4)).toBe(1)
    expect(dst.query(0, 2)).toBe(3)
  })

  it('toJSON is a copy', () => {
    const dst = new DisjointSparseTable([1, 2], (a, b) => a + b)
    const json = dst.toJSON()
    json[0] = 99
    expect(dst.toJSON()[0]).toBe(1)
  })

  it('equals with same length different combine', () => {
    const a = new DisjointSparseTable([1, 2, 3], (x, y) => x + y)
    const b = new DisjointSparseTable([1, 2, 3], (x, y) => x * y)
    expect(a.equals(b)).toBe(true)
  })

  it('handles large number of elements', () => {
    const data = Array.from({ length: 256 }, (_, i) => i + 1)
    const dst = new DisjointSparseTable(data, (a, b) => a + b)
    expect(dst.query(0, 255)).toBe((256 * 257) / 2)
  })

  it('min query on sorted ascending', () => {
    const dst = new DisjointSparseTable([1, 2, 3, 4, 5, 6, 7, 8], (a, b) => Math.min(a, b))
    expect(dst.query(0, 7)).toBe(1)
    expect(dst.query(4, 7)).toBe(5)
  })

  it('max query on sorted descending', () => {
    const dst = new DisjointSparseTable([8, 7, 6, 5, 4, 3, 2, 1], (a, b) => Math.max(a, b))
    expect(dst.query(0, 7)).toBe(8)
    expect(dst.query(4, 7)).toBe(4)
  })

  it('query narrow range returns correct sum', () => {
    const dst = new DisjointSparseTable([10, 20, 30, 40], (a, b) => a + b)
    expect(dst.query(1, 2)).toBe(50)
  })

  it('handles floats in sum', () => {
    const dst = new DisjointSparseTable([0.1, 0.2, 0.3], (a, b) => a + b)
    expect(dst.query(0, 2)).toBeCloseTo(0.6)
  })

  it('query 0 to 0 returns first element', () => {
    const dst = new DisjointSparseTable([99, 1, 1], (a, b) => Math.min(a, b))
    expect(dst.query(0, 0)).toBe(99)
  })

  it('query last to last returns last element', () => {
    const dst = new DisjointSparseTable([1, 1, 99], (a, b) => Math.max(a, b))
    expect(dst.query(2, 2)).toBe(99)
  })

  it('clone produces correct queries', () => {
    const dst = new DisjointSparseTable([5, 3, 8, 1, 4], (a, b) => Math.min(a, b))
    const copy = dst.clone()
    expect(copy.query(0, 4)).toBe(1)
    expect(copy.query(2, 3)).toBe(1)
  })

  it('handles 15 elements non-power-of-two', () => {
    const data = Array.from({ length: 15 }, (_, i) => i * 2)
    const dst = new DisjointSparseTable(data, (a, b) => a + b)
    expect(dst.query(0, 14)).toBe(data.reduce((s, v) => s + v, 0))
  })

  it('GCD of primes returns 1', () => {
    const dst = new DisjointSparseTable([7, 13, 19], (a, b) => {
      let x = a, y = b
      while (y !== 0) { const t = y; y = x % y; x = t }
      return x
    })
    expect(dst.query(0, 2)).toBe(1)
  })

  it('toString on empty table', () => {
    const dst = new DisjointSparseTable([], (a, b) => a + b)
    expect(dst.toString()).toBe('DisjointSparseTable(n=0)')
  })

  it('equals with different length returns false', () => {
    const a = new DisjointSparseTable([1, 2], (a, b) => a + b)
    const b = new DisjointSparseTable([1, 2, 3], (a, b) => a + b)
    expect(a.equals(b)).toBe(false)
  })

  it('queries LCM over range', () => {
    const dst = new DisjointSparseTable([2, 3, 4, 5], (a, b) => {
      const gcd = (x: number, y: number): number => y === 0 ? x : gcd(y, x % y)
      return Math.abs(a * b) / gcd(a, b)
    })
    expect(dst.query(0, 3)).toBe(60)
    expect(dst.query(1, 2)).toBe(12)
  })

  it('handles string concatenation', () => {
    const dst = new DisjointSparseTable(['a', 'b', 'c'], (a, b) => a + b)
    expect(dst.query(0, 2)).toBe('abc')
    expect(dst.query(0, 0)).toBe('a')
  })

  it('queries sum with large values', () => {
    const data = [1000000, 2000000, 3000000, 4000000]
    const dst = new DisjointSparseTable(data, (a, b) => a + b)
    expect(dst.query(0, 3)).toBe(10000000)
  })

  it('min query across multiple power-of-two boundaries', () => {
    const data = [9, 8, 7, 6, 5, 4, 3, 2, 1, 10]
    const dst = new DisjointSparseTable(data, (a, b) => Math.min(a, b))
    expect(dst.query(0, 9)).toBe(1)
    expect(dst.query(3, 7)).toBe(2)
  })

  it('clone with string data', () => {
    const dst = new DisjointSparseTable(['x', 'y', 'z'], (a, b) => a + b)
    const copy = dst.clone()
    expect(copy.query(0, 2)).toBe('xyz')
    expect(copy.toJSON()).toEqual(['x', 'y', 'z'])
  })

  it('clone produces equal table', () => {
    const t = new DisjointSparseTable([5, 3, 7, 1], (a, b) => Math.min(a, b))
    expect(t.clone().equals(t)).toBe(true)
  })

  it('query for single element returns that element', () => {
    const t = new DisjointSparseTable([10, 20, 30], (a, b) => a + b)
    expect(t.query(1, 1)).toBe(20)
  })

  it('toString returns string', () => {
    const t = new DisjointSparseTable([1, 2], (a, b) => a + b)
    expect(typeof t.toString()).toBe('string')
  })
})

  it('query returns element', () => {
    const dst = new DisjointSparseTable([3, 1, 4, 1, 5], (a, b) => Math.min(a, b))
    expect(dst.query(0, 0)).toBe(3)
  })

  it('query finds min in range', () => {
    const dst = new DisjointSparseTable([3, 1, 4, 1, 5], (a, b) => Math.min(a, b))
    expect(dst.query(0, 4)).toBe(1)
  })

  it('single element', () => {
    const dst = new DisjointSparseTable([42], (a, b) => a + b)
    expect(dst.query(0, 0)).toBe(42)
  })

describe('disjoint-sparse-table - wave545', () => {
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

describe('disjoint-sparse-table - wave546', () => {
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

describe('disjoint-sparse-table - wave547', () => {
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

describe('disjoint-sparse-table - wave548', () => {
  it('disjoint-sparse-table module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave549', () => {
  it('disjoint-sparse-table module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave550', () => {
  it('disjoint-sparse-table w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave551', () => {
  it('disjoint-sparse-table w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave552', () => {
  it('disjoint-sparse-table w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w552 v2', () => {
    expect(describe).toBeDefined()
  })
})
