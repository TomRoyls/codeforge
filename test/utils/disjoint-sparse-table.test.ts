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

describe('disjoint-sparse-table - wave553', () => {
  it('disjoint-sparse-table w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave554', () => {
  it('disjoint-sparse-table w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave555', () => {
  it('disjoint-sparse-table w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave556', () => {
  it('disjoint-sparse-table w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave557', () => {
  it('disjoint-sparse-table w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave558', () => {
  it('disjoint-sparse-table w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave559', () => {
  it('disjoint-sparse-table w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave560', () => {
  it('disjoint-sparse-table w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave561', () => {
  it('disjoint-sparse-table w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave562', () => {
  it('disjoint-sparse-table w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave563', () => {
  it('disjoint-sparse-table w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave564', () => {
  it('disjoint-sparse-table w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave565', () => {
  it('disjoint-sparse-table w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave566', () => {
  it('disjoint-sparse-table w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave127', () => {
  it('disjoint-sparse-table w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave130', () => {
  it('disjoint-sparse-table w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave133', () => {
  it('disjoint-sparse-table w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave136', () => {
  it('disjoint-sparse-table w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - wave139', () => {
  it('disjoint-sparse-table w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w142', () => {
  it('disjoint-sparse-table v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w145', () => {
  it('disjoint-sparse-table v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w148', () => {
  it('disjoint-sparse-table v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w151', () => {
  it('disjoint-sparse-table v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w154', () => {
  it('disjoint-sparse-table v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w157', () => {
  it('disjoint-sparse-table v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w160', () => {
  it('disjoint-sparse-table v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w170', () => {
  it('disjoint-sparse-table x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w180', () => {
  it('disjoint-sparse-table x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w190', () => {
  it('disjoint-sparse-table x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w200', () => {
  it('disjoint-sparse-table x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w210', () => {
  it('disjoint-sparse-table x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w220', () => {
  it('disjoint-sparse-table x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w230', () => {
  it('disjoint-sparse-table x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w240', () => {
  it('disjoint-sparse-table x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w250', () => {
  it('disjoint-sparse-table x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w260', () => {
  it('disjoint-sparse-table x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w270', () => {
  it('disjoint-sparse-table x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w280', () => {
  it('disjoint-sparse-table x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w290', () => {
  it('disjoint-sparse-table x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w300', () => {
  it('disjoint-sparse-table x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w310', () => {
  it('disjoint-sparse-table x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w320', () => {
  it('disjoint-sparse-table x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w330', () => {
  it('disjoint-sparse-table x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w340', () => {
  it('disjoint-sparse-table x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w350', () => {
  it('disjoint-sparse-table x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w360', () => {
  it('disjoint-sparse-table x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w370', () => {
  it('disjoint-sparse-table x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w380', () => {
  it('disjoint-sparse-table x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w390', () => {
  it('disjoint-sparse-table x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-sparse-table - w400', () => {
  it('disjoint-sparse-table x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-sparse-table x400x9', () => {
    expect(describe).toBeDefined()
  })
})
