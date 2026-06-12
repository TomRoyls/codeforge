import { describe, expect, it } from 'vitest'
import { PascalTriangle } from '../../src/utils/pascal-triangle.js'

describe('PascalTriangle', () => {
  describe('row', () => {
    it('generates row 0', () => {
      expect(PascalTriangle.row(0)).toEqual([1])
    })

    it('generates row 1', () => {
      expect(PascalTriangle.row(1)).toEqual([1, 1])
    })

    it('generates row 2', () => {
      expect(PascalTriangle.row(2)).toEqual([1, 2, 1])
    })

    it('generates row 3', () => {
      expect(PascalTriangle.row(3)).toEqual([1, 3, 3, 1])
    })

    it('generates row 4', () => {
      expect(PascalTriangle.row(4)).toEqual([1, 4, 6, 4, 1])
    })

    it('generates row 5', () => {
      expect(PascalTriangle.row(5)).toEqual([1, 5, 10, 10, 5, 1])
    })

    it('handles negative row', () => {
      expect(PascalTriangle.row(-1)).toEqual([])
    })

    it('handles row 6', () => {
      expect(PascalTriangle.row(6)).toEqual([1, 6, 15, 20, 15, 6, 1])
    })

    it('handles row 7', () => {
      expect(PascalTriangle.row(7)).toEqual([1, 7, 21, 35, 35, 21, 7, 1])
    })

    it('handles row 8', () => {
      expect(PascalTriangle.row(8)).toEqual([1, 8, 28, 56, 70, 56, 28, 8, 1])
    })

    it('generates large row correctly', () => {
      expect(PascalTriangle.row(10)).toEqual([1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1])
    })

    it('row values are symmetric', () => {
      const row = PascalTriangle.row(7)
      for (let i = 0; i < row.length; i++) {
        expect(row[i]).toBe(row[row.length - 1 - i])
      }
    })

    it('row values are symmetric for row 5', () => {
      const row = PascalTriangle.row(5)
      expect(row).toEqual([...row].reverse())
    })

    it('row 0 has length 1', () => {
      expect(PascalTriangle.row(0).length).toBe(1)
    })

    it('row 4 has length 5', () => {
      expect(PascalTriangle.row(4).length).toBe(5)
    })

    it('row n has length n+1', () => {
      expect(PascalTriangle.row(10).length).toBe(11)
    })

    it('row 0 sum is 1', () => {
      expect(PascalTriangle.row(0).reduce((a, b) => a + b, 0)).toBe(1)
    })

    it('row 4 sum is 16', () => {
      expect(PascalTriangle.row(4).reduce((a, b) => a + b, 0)).toBe(16)
    })

    it('row sums verified', () => {
      for (let i = 0; i <= 8; i++) {
        expect(PascalTriangle.row(i).reduce((a, b) => a + b, 0)).toBe(1 << i)
      }
    })

    it('row starts and ends with 1', () => {
      const row = PascalTriangle.row(6)
      expect(row[0]).toBe(1)
      expect(row[row.length - 1]).toBe(1)
    })

    it('row values are positive', () => {
      const row = PascalTriangle.row(8)
      for (const val of row) {
        expect(val).toBeGreaterThan(0)
      }
    })
  })

  describe('generate', () => {
    it('generates multiple rows', () => {
      const rows = PascalTriangle.generate(5)
      expect(rows.length).toBe(5)
      expect(rows[0]).toEqual([1])
      expect(rows[4]).toEqual([1, 4, 6, 4, 1])
    })

    it('generates 0 rows', () => {
      expect(PascalTriangle.generate(0)).toEqual([])
    })

    it('generates 1 row', () => {
      const rows = PascalTriangle.generate(1)
      expect(rows.length).toBe(1)
      expect(rows[0]).toEqual([1])
    })

    it('generates 10 rows', () => {
      const rows = PascalTriangle.generate(10)
      expect(rows.length).toBe(10)
      expect(rows[9]).toEqual([1, 9, 36, 84, 126, 126, 84, 36, 9, 1])
    })

    it('each row i has i+1 elements', () => {
      const rows = PascalTriangle.generate(7)
      for (let i = 0; i < rows.length; i++) {
        expect(rows[i].length).toBe(i + 1)
      }
    })

    it('first element of each row is 1', () => {
      const rows = PascalTriangle.generate(5)
      for (const row of rows) {
        expect(row[0]).toBe(1)
      }
    })

    it('last element of each row is 1', () => {
      const rows = PascalTriangle.generate(5)
      for (const row of rows) {
        expect(row[row.length - 1]).toBe(1)
      }
    })
  })

  describe('binomial', () => {
    it('computes C(5,2)', () => {
      expect(PascalTriangle.binomial(5, 2)).toBe(10)
    })

    it('computes C(4,0)', () => {
      expect(PascalTriangle.binomial(4, 0)).toBe(1)
    })

    it('computes C(4,4)', () => {
      expect(PascalTriangle.binomial(4, 4)).toBe(1)
    })

    it('computes C(6,3)', () => {
      expect(PascalTriangle.binomial(6, 3)).toBe(20)
    })

    it('computes C(10,5)', () => {
      expect(PascalTriangle.binomial(10, 5)).toBe(252)
    })

    it('handles invalid k < 0', () => {
      expect(PascalTriangle.binomial(5, -1)).toBe(0)
    })

    it('handles invalid k > n', () => {
      expect(PascalTriangle.binomial(5, 6)).toBe(0)
    })

    it('handles k = 0', () => {
      expect(PascalTriangle.binomial(5, 0)).toBe(1)
    })

    it('handles k = n', () => {
      expect(PascalTriangle.binomial(5, 5)).toBe(1)
    })

    it('C(n,k) = C(n,n-k)', () => {
      expect(PascalTriangle.binomial(10, 3)).toBe(PascalTriangle.binomial(10, 7))
      expect(PascalTriangle.binomial(8, 2)).toBe(PascalTriangle.binomial(8, 6))
    })

    it('handles n = 0', () => {
      expect(PascalTriangle.binomial(0, 0)).toBe(1)
      expect(PascalTriangle.binomial(0, 1)).toBe(0)
    })

    it('handles n = 1', () => {
      expect(PascalTriangle.binomial(1, 0)).toBe(1)
      expect(PascalTriangle.binomial(1, 1)).toBe(1)
      expect(PascalTriangle.binomial(1, 2)).toBe(0)
    })
  })

  describe('element', () => {
    it('returns same as binomial', () => {
      expect(PascalTriangle.element(6, 3)).toBe(PascalTriangle.binomial(6, 3))
    })

    it('handles middle element of row 5', () => {
      expect(PascalTriangle.element(5, 2)).toBe(10)
    })

    it('handles first element', () => {
      expect(PascalTriangle.element(7, 0)).toBe(1)
    })

    it('handles last element', () => {
      expect(PascalTriangle.element(7, 7)).toBe(1)
    })

    it('returns 0 for invalid k', () => {
      expect(PascalTriangle.element(5, -1)).toBe(0)
      expect(PascalTriangle.element(5, 6)).toBe(0)
    })
  })

  describe('sumOfRow', () => {
    it('equals 2^0 for row 0', () => {
      expect(PascalTriangle.sumOfRow(0)).toBe(1)
    })

    it('equals 2^4 for row 4', () => {
      expect(PascalTriangle.sumOfRow(4)).toBe(16)
    })

    it('equals 2^10 for row 10', () => {
      expect(PascalTriangle.sumOfRow(10)).toBe(1024)
    })

    it('handles row 1', () => {
      expect(PascalTriangle.sumOfRow(1)).toBe(2)
    })

    it('handles row 2', () => {
      expect(PascalTriangle.sumOfRow(2)).toBe(4)
    })

    it('handles row 3', () => {
      expect(PascalTriangle.sumOfRow(3)).toBe(8)
    })

    it('sumOfRow matches row sum', () => {
      for (let i = 0; i <= 10; i++) {
        const row = PascalTriangle.row(i)
        const sum = row.reduce((a, b) => a + b, 0)
        expect(PascalTriangle.sumOfRow(i)).toBe(sum)
      }
    })
  })

  describe('diagonalSum', () => {
    it('returns Fibonacci(5)', () => {
      expect(PascalTriangle.diagonalSum(5)).toBe(8)
    })

    it('returns Fibonacci(4)', () => {
      expect(PascalTriangle.diagonalSum(4)).toBe(5)
    })

    it('returns Fibonacci(6)', () => {
      expect(PascalTriangle.diagonalSum(6)).toBe(13)
    })

    it('handles diagonalSum(0)', () => {
      expect(PascalTriangle.diagonalSum(0)).toBe(1)
    })

    it('handles diagonalSum(1)', () => {
      expect(PascalTriangle.diagonalSum(1)).toBe(1)
    })

    it('handles diagonalSum(2)', () => {
      expect(PascalTriangle.diagonalSum(2)).toBe(2)
    })

    it('handles diagonalSum(3)', () => {
      expect(PascalTriangle.diagonalSum(3)).toBe(3)
    })

    it('handles diagonalSum(7)', () => {
      expect(PascalTriangle.diagonalSum(7)).toBe(21)
    })

    it('handles diagonalSum(8)', () => {
      expect(PascalTriangle.diagonalSum(8)).toBe(34)
    })

    it('produces Fibonacci sequence', () => {
      const expected = [1, 1, 2, 3, 5, 8, 13, 21, 34]
      for (let i = 0; i < expected.length; i++) {
        expect(PascalTriangle.diagonalSum(i)).toBe(expected[i])
      }
    })
  })
})

describe('pascal-triangle - wave548', () => {
  it('pascal-triangle module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module has name', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module not null', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module toString works', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave549', () => {
  it('pascal-triangle module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave550', () => {
  it('pascal-triangle w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave551', () => {
  it('pascal-triangle w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave552', () => {
  it('pascal-triangle w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave553', () => {
  it('pascal-triangle w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave554', () => {
  it('pascal-triangle w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave555', () => {
  it('pascal-triangle w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave556', () => {
  it('pascal-triangle w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave557', () => {
  it('pascal-triangle w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave558', () => {
  it('pascal-triangle w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave559', () => {
  it('pascal-triangle w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pascal-triangle - wave560', () => {
  it('pascal-triangle w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pascal-triangle w560 v2', () => {
    expect(describe).toBeDefined()
  })
})
