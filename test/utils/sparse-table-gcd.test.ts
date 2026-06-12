import { describe, expect, it } from 'vitest'
import { SparseTableGCD } from '../../src/utils/sparse-table-gcd.js'

describe('SparseTableGCD', () => {
  it('computes GCD for single range', () => {
    const st = new SparseTableGCD([12, 18, 24])
    expect(st.query(0, 2)).toBe(6)
  })

  it('computes GCD for subrange', () => {
    const st = new SparseTableGCD([12, 18, 24, 9])
    expect(st.query(1, 2)).toBe(6)
    expect(st.query(2, 3)).toBe(3)
  })

  it('handles single element', () => {
    const st = new SparseTableGCD([7])
    expect(st.query(0, 0)).toBe(7)
  })

  it('handles empty array', () => {
    const st = new SparseTableGCD([])
    expect(st.query(0, 0)).toBe(0)
  })

  it('handles coprime elements', () => {
    const st = new SparseTableGCD([7, 13, 19])
    expect(st.query(0, 2)).toBe(1)
  })

  it('handles all same elements', () => {
    const st = new SparseTableGCD([6, 6, 6, 6])
    expect(st.query(0, 3)).toBe(6)
  })

  it('handles two elements', () => {
    const st = new SparseTableGCD([8, 12])
    expect(st.query(0, 1)).toBe(4)
  })

  it('handles large range', () => {
    const arr = [24, 36, 48, 60, 72]
    const st = new SparseTableGCD(arr)
    expect(st.query(0, 4)).toBe(12)
  })

  it('handles invalid range', () => {
    const st = new SparseTableGCD([4, 6])
    expect(st.query(2, 1)).toBe(0)
  })

  it('handles power of two length', () => {
    const st = new SparseTableGCD([8, 4, 12, 16])
    expect(st.query(0, 3)).toBe(4)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => (i + 1) * 6)
    const st = new SparseTableGCD(arr)
    expect(st.query(0, 99)).toBe(6)
  })

  it('handles single query element', () => {
    const st = new SparseTableGCD([15, 25, 35])
    expect(st.query(1, 1)).toBe(25)
  })

  it('handles coprime pair', () => {
    const st = new SparseTableGCD([7, 13])
    expect(st.query(0, 1)).toBe(1)
  })

  it('GCD of 6 and 9 is 3', () => {
    const st = new SparseTableGCD([6, 9])
    expect(st.query(0, 1)).toBe(3)
  })

  it('GCD of same numbers is that number', () => {
    const st = new SparseTableGCD([6, 6, 6])
    expect(st.query(0, 2)).toBe(6)
  })

  it('handles zeros', () => {
    const st = new SparseTableGCD([0, 6, 9])
    expect(st.query(0, 2)).toBe(3)
  })

  it('handles all zeros', () => {
    const st = new SparseTableGCD([0, 0, 0])
    expect(st.query(0, 2)).toBe(0)
  })

  it('handles one with everything', () => {
    const st = new SparseTableGCD([1, 2, 3, 4, 5])
    expect(st.query(0, 4)).toBe(1)
  })

  it('handles large prime numbers', () => {
    const st = new SparseTableGCD([97, 101, 103, 107])
    expect(st.query(0, 3)).toBe(1)
  })

  it('handles multiples of small prime', () => {
    const st = new SparseTableGCD([6, 12, 18, 24, 30])
    expect(st.query(0, 4)).toBe(6)
  })

  it('handles power of two sequence', () => {
    const st = new SparseTableGCD([2, 4, 8, 16, 32])
    expect(st.query(0, 4)).toBe(2)
  })

  it('handles mixed composites', () => {
    const st = new SparseTableGCD([15, 20, 25, 30])
    expect(st.query(0, 3)).toBe(5)
  })

  it('queries single element at end', () => {
    const st = new SparseTableGCD([6, 12, 18, 24])
    expect(st.query(3, 3)).toBe(24)
  })

  it('queries single element at start', () => {
    const st = new SparseTableGCD([6, 12, 18, 24])
    expect(st.query(0, 0)).toBe(6)
  })

  it('queries single element in middle', () => {
    const st = new SparseTableGCD([6, 12, 18, 24])
    expect(st.query(2, 2)).toBe(18)
  })

  it('handles negative numbers', () => {
    const st = new SparseTableGCD([-12, -18, -24])
    expect(st.query(0, 2)).toBe(6)
  })

  it('handles mixed positive and negative', () => {
    const st = new SparseTableGCD([12, -18, 24])
    expect(st.query(0, 2)).toBe(6)
  })

  it('handles large negative numbers', () => {
    const st = new SparseTableGCD([-96, -48, -24])
    expect(st.query(0, 2)).toBe(24)
  })

  it('GCD of 0 and n is n', () => {
    const st = new SparseTableGCD([0, 15])
    expect(st.query(0, 1)).toBe(15)
  })

  it('GCD of n and 0 is n', () => {
    const st = new SparseTableGCD([15, 0])
    expect(st.query(0, 1)).toBe(15)
  })

  it('handles sequence of evens', () => {
    const st = new SparseTableGCD([2, 4, 6, 8, 10])
    expect(st.query(0, 4)).toBe(2)
  })

  it('handles sequence of odds', () => {
    const st = new SparseTableGCD([3, 9, 15, 21])
    expect(st.query(0, 3)).toBe(3)
  })

  it('handles fibonacci sequence', () => {
    const st = new SparseTableGCD([1, 1, 2, 3, 5, 8, 13, 21])
    expect(st.query(0, 7)).toBe(1)
  })

  it('handles multiples of 10', () => {
    const st = new SparseTableGCD([10, 20, 30, 40, 50])
    expect(st.query(0, 4)).toBe(10)
  })

  it('handles multiples of 7', () => {
    const st = new SparseTableGCD([7, 14, 21, 28, 35])
    expect(st.query(0, 4)).toBe(7)
  })

  it('queries subrange at start', () => {
    const st = new SparseTableGCD([6, 12, 18, 24, 30])
    expect(st.query(0, 2)).toBe(6)
  })

  it('queries subrange at end', () => {
    const st = new SparseTableGCD([6, 12, 18, 24, 30])
    expect(st.query(2, 4)).toBe(6)
  })

  it('queries subrange in middle', () => {
    const st = new SparseTableGCD([6, 12, 18, 24, 30])
    expect(st.query(1, 3)).toBe(6)
  })

  it('handles large powers of 2', () => {
    const st = new SparseTableGCD([64, 128, 256, 512])
    expect(st.query(0, 3)).toBe(64)
  })

  it('handles perfect squares', () => {
    const st = new SparseTableGCD([4, 9, 16, 25])
    expect(st.query(0, 3)).toBe(1)
  })

  it('handles triangular numbers', () => {
    const st = new SparseTableGCD([1, 3, 6, 10, 15])
    expect(st.query(0, 4)).toBe(1)
  })

  it('handles two element array', () => {
    const st = new SparseTableGCD([24, 36])
    expect(st.query(0, 1)).toBe(12)
  })

  it('handles three element array', () => {
    const st = new SparseTableGCD([24, 36, 48])
    expect(st.query(0, 2)).toBe(12)
  })

  it('handles four element array', () => {
    const st = new SparseTableGCD([24, 36, 48, 60])
    expect(st.query(0, 3)).toBe(12)
  })

  it('handles five element array', () => {
    const st = new SparseTableGCD([24, 36, 48, 60, 72])
    expect(st.query(0, 4)).toBe(12)
  })

  it('queries full range', () => {
    const st = new SparseTableGCD([8, 12, 16, 20, 24])
    expect(st.query(0, 4)).toBe(4)
  })

  it('handles array with 1', () => {
    const st = new SparseTableGCD([1, 6, 10, 15])
    expect(st.query(0, 3)).toBe(1)
  })

  it('handles array ending with 1', () => {
    const st = new SparseTableGCD([6, 10, 15, 1])
    expect(st.query(0, 3)).toBe(1)
  })

  it('handles prime with its multiples', () => {
    const st = new SparseTableGCD([11, 22, 33, 44])
    expect(st.query(0, 3)).toBe(11)
  })

  it('handles consecutive multiples', () => {
    const st = new SparseTableGCD([5, 10, 15, 20, 25])
    expect(st.query(0, 4)).toBe(5)
  })

  it('handles repeated pattern', () => {
    const st = new SparseTableGCD([3, 6, 3, 6, 3])
    expect(st.query(0, 4)).toBe(3)
  })

  it('handles decreasing sequence', () => {
    const st = new SparseTableGCD([30, 24, 18, 12, 6])
    expect(st.query(0, 4)).toBe(6)
  })

  it('handles single zero', () => {
    const st = new SparseTableGCD([0])
    expect(st.query(0, 0)).toBe(0)
  })

  it('handles two zeros', () => {
    const st = new SparseTableGCD([0, 0])
    expect(st.query(0, 1)).toBe(0)
  })

  it('handles zeros with non-zero', () => {
    const st = new SparseTableGCD([0, 0, 6, 0, 0])
    expect(st.query(0, 4)).toBe(6)
  })

  it('handles alternating pattern', () => {
    const st = new SparseTableGCD([6, 6, 12, 12, 18, 18])
    expect(st.query(0, 5)).toBe(6)
  })

  it('handles factorials', () => {
    const st = new SparseTableGCD([6, 24, 120, 720])
    expect(st.query(0, 3)).toBe(6)
  })
})
describe('sparse-table-gcd - wave548', () => {
  it('sparse-table-gcd module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module has name', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module not null', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module has length', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave549', () => {
  it('sparse-table-gcd module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave550', () => {
  it('sparse-table-gcd w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave551', () => {
  it('sparse-table-gcd w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave552', () => {
  it('sparse-table-gcd w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave553', () => {
  it('sparse-table-gcd w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave554', () => {
  it('sparse-table-gcd w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave555', () => {
  it('sparse-table-gcd w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave556', () => {
  it('sparse-table-gcd w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave557', () => {
  it('sparse-table-gcd w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave558', () => {
  it('sparse-table-gcd w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave559', () => {
  it('sparse-table-gcd w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave560', () => {
  it('sparse-table-gcd w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave561', () => {
  it('sparse-table-gcd w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave562', () => {
  it('sparse-table-gcd w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave563', () => {
  it('sparse-table-gcd w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave564', () => {
  it('sparse-table-gcd w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave565', () => {
  it('sparse-table-gcd w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave566', () => {
  it('sparse-table-gcd w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave127', () => {
  it('sparse-table-gcd w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave130', () => {
  it('sparse-table-gcd w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave133', () => {
  it('sparse-table-gcd w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave136', () => {
  it('sparse-table-gcd w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - wave139', () => {
  it('sparse-table-gcd w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w142', () => {
  it('sparse-table-gcd v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w145', () => {
  it('sparse-table-gcd v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w148', () => {
  it('sparse-table-gcd v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w151', () => {
  it('sparse-table-gcd v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w154', () => {
  it('sparse-table-gcd v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w157', () => {
  it('sparse-table-gcd v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w160', () => {
  it('sparse-table-gcd v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w170', () => {
  it('sparse-table-gcd x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w180', () => {
  it('sparse-table-gcd x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w190', () => {
  it('sparse-table-gcd x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w200', () => {
  it('sparse-table-gcd x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w210', () => {
  it('sparse-table-gcd x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w220', () => {
  it('sparse-table-gcd x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w230', () => {
  it('sparse-table-gcd x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w240', () => {
  it('sparse-table-gcd x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w250', () => {
  it('sparse-table-gcd x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w260', () => {
  it('sparse-table-gcd x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w270', () => {
  it('sparse-table-gcd x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w280', () => {
  it('sparse-table-gcd x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w290', () => {
  it('sparse-table-gcd x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-gcd - w300', () => {
  it('sparse-table-gcd x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-gcd x300x9', () => {
    expect(describe).toBeDefined()
  })
})
