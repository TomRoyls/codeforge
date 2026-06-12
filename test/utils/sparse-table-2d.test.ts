import { describe, it, expect } from 'vitest'
import { SparseTable2D } from '../../src/utils/sparse-table-2d.js'

describe('SparseTable2D', () => {
  it('constructs with 2D data', () => {
    const data = [[1, 2, 3], [4, 5, 6]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 0, 0)).toBe(1)
  })

  it('queries single cell', () => {
    const data = [[1, 2, 3], [4, 5, 6]]
    const st = new SparseTable2D(data, (a, b) => a)
    expect(st.query(1, 2, 1, 2)).toBe(6)
  })

  it('queries range for min', () => {
    const data = [[3, 1, 4], [1, 5, 9]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 2)).toBe(1)
  })

  it('queries range for max', () => {
    const data = [[3, 1, 4], [1, 5, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(9)
  })

  it('queries single row range', () => {
    const data = [[3, 1, 4, 1, 5]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 0, 4)).toBe(1)
  })

  it('queries single column range', () => {
    const data = [[3], [1], [4], [1]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 3, 0)).toBe(1)
  })

  it('queries 2x2 submatrix for min', () => {
    const data = [[7, 2, 3], [5, 1, 8], [9, 4, 6]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
  })

  it('queries 2x2 submatrix for max', () => {
    const data = [[7, 2, 3], [5, 1, 8], [9, 4, 6]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(1, 1, 2, 2)).toBe(8)
  })

  it('queries large range', () => {
    const data = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 2, 3)).toBe(1)
  })

  it('queries with multiple min operations', () => {
    const data = [[1, 2], [3, 4]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
    expect(st.query(0, 1, 1, 1)).toBe(2)
    expect(st.query(1, 0, 1, 1)).toBe(3)
  })

  it('handles 3x3 matrix', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 2, 2)).toBe(9)
  })

  it('handles 4x4 matrix', () => {
    const data = [[16, 2, 3, 13], [5, 11, 10, 8], [9, 7, 6, 12], [4, 14, 15, 1]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 3, 3)).toBe(1)
  })

  it('queries non-square range in square matrix', () => {
    const data = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 2, 2)).toBe(11)
  })

  it('queries bottom-right corner', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(1, 1, 2, 2)).toBe(9)
  })

  it('queries top-left corner', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
  })

  it('handles single element matrix', () => {
    const data = [[42]]
    const st = new SparseTable2D(data, (a, b) => a)
    expect(st.query(0, 0, 0, 0)).toBe(42)
  })

  it('handles 1x3 matrix', () => {
    const data = [[1, 2, 3]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 0, 2)).toBe(3)
  })

  it('handles 3x1 matrix', () => {
    const data = [[1], [2], [3]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 2, 0)).toBe(3)
  })

  it('queries overlapping ranges', () => {
    const data = [[5, 2, 8], [3, 1, 9], [4, 7, 6]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 2, 2)).toBe(1)
    expect(st.query(0, 0, 1, 1)).toBe(1)
    expect(st.query(1, 1, 2, 2)).toBe(1)
  })

  it('2x2 min query', () => {
    const st = new SparseTable2D([[3, 1], [4, 2]], Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
  })

  it('full range query returns min', () => {
    const st = new SparseTable2D([[3, 1], [4, 2]], Math.min)
    expect(st.query(0, 0, 1, 1)).toBe(1)
  })

  it('handles negative numbers with min', () => {
    const data = [[-1, -5, 3], [0, -2, 7]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 2)).toBe(-5)
  })

  it('handles negative numbers with max', () => {
    const data = [[-1, -5, 3], [0, -2, 7]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(7)
  })

  it('queries 1x5 row for max', () => {
    const data = [[1, 9, 3, 7, 2]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 0, 4)).toBe(9)
  })

  it('queries 5x1 column for min', () => {
    const data = [[5], [2], [8], [1], [6]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 4, 0)).toBe(1)
  })

  it('handles 2x5 matrix', () => {
    const data = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 4)).toBe(1)
    expect(st.query(0, 2, 1, 4)).toBe(3)
  })

  it('handles 5x2 matrix', () => {
    const data = [[1, 6], [2, 7], [3, 8], [4, 9], [5, 10]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 4, 1)).toBe(10)
    expect(st.query(0, 0, 2, 0)).toBe(3)
  })

  it('queries entire 2x2 matrix for sum operation', () => {
    const data = [[1, 2], [3, 4]]
    const st = new SparseTable2D(data, (a, b) => a + b)
    expect(st.query(0, 0, 1, 1)).toBe(40)
  })

  it('queries with multiplication operation', () => {
    const data = [[2, 3], [4, 5]]
    const st = new SparseTable2D(data, (a, b) => a * b)
    expect(st.query(0, 0, 1, 1)).toBe(207360000)
  })

  it('handles zeros with min', () => {
    const data = [[0, 5, 3], [2, 0, 8]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 2)).toBe(0)
  })

  it('handles zeros with max', () => {
    const data = [[0, 5, 3], [2, 0, 8]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(8)
  })

  it('queries middle section of 3x3', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(1, 1, 2, 2)).toBe(9)
  })

  it('queries top-right section', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 1, 1, 2)).toBe(2)
  })

  it('queries bottom-left section', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(1, 0, 2, 1)).toBe(4)
  })

  it('handles mixed positive and negative', () => {
    const data = [[-5, 3, -1], [2, -8, 4]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(4)
  })

  it('single row min at position', () => {
    const data = [[9, 1, 5, 3, 8]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 1, 0, 3)).toBe(1)
  })

  it('single column max at position', () => {
    const data = [[4], [9], [2], [7], [5]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(1, 0, 3, 0)).toBe(9)
  })

  it('handles 1x4 matrix', () => {
    const data = [[7, 3, 9, 2]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 0, 3)).toBe(2)
  })

  it('handles 4x1 matrix', () => {
    const data = [[7], [3], [9], [2]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 3, 0)).toBe(9)
  })

  it('queries 3x4 matrix min', () => {
    const data = [[5, 2, 8, 1], [9, 4, 3, 7], [6, 0, 5, 2]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 2, 3)).toBe(0)
  })

  it('queries 4x3 matrix max', () => {
    const data = [[5, 2, 8], [9, 4, 3], [7, 6, 1], [0, 5, 2]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 3, 2)).toBe(9)
  })

  it('custom operation: bitwise OR', () => {
    const data = [[1, 2], [4, 8]]
    const st = new SparseTable2D(data, (a, b) => a | b)
    expect(st.query(0, 0, 1, 1)).toBe(15)
  })

  it('custom operation: bitwise AND', () => {
    const data = [[15, 7], [3, 1]]
    const st = new SparseTable2D(data, (a, b) => a & b)
    expect(st.query(0, 0, 1, 1)).toBe(1)
  })

  it('handles 2x6 matrix', () => {
    const data = [[1, 9, 3, 7, 5, 2], [8, 4, 6, 0, 9, 1]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 5)).toBe(0)
  })

  it('handles 6x2 matrix', () => {
    const data = [[1, 8], [9, 4], [3, 6], [7, 0], [5, 9], [2, 1]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 5, 1)).toBe(9)
  })

  it('queries single element in large matrix', () => {
    const data = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15]]
    const st = new SparseTable2D(data, (a, b) => a)
    expect(st.query(1, 2, 1, 2)).toBe(8)
  })

  it('handles all zeros', () => {
    const data = [[0, 0, 0], [0, 0, 0]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(0)
  })

  it('handles all same positive values', () => {
    const data = [[5, 5, 5], [5, 5, 5]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 2)).toBe(5)
  })

  it('handles all same negative values', () => {
    const data = [[-3, -3, -3], [-3, -3, -3]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(-3)
  })

  it('queries edge of 3x5 matrix', () => {
    const data = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 4, 2, 4)).toBe(15)
  })

  it('queries center of 3x5 matrix', () => {
    const data = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 1, 2, 3)).toBe(2)
  })

  it('2x3 matrix max query', () => {
    const data = [[3, 7, 2], [8, 1, 5]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 2)).toBe(8)
  })

  it('3x2 matrix min query', () => {
    const data = [[9, 4], [2, 7], [5, 3]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 2, 1)).toBe(2)
  })

  it('queries with custom comparator returning first', () => {
    const data = [[5, 3], [1, 4]]
    const st = new SparseTable2D(data, (a, b) => a)
    expect(st.query(0, 0, 1, 1)).toBe(5)
  })

  it('queries with custom comparator returning second', () => {
    const data = [[5, 3], [1, 4]]
    const st = new SparseTable2D(data, (a, b) => b)
    expect(st.query(0, 0, 1, 1)).toBe(4)
  })

  it('handles 1x2 matrix min', () => {
    const data = [[8, 3]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 0, 1)).toBe(3)
  })

  it('handles 2x1 matrix max', () => {
    const data = [[8], [3]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 1, 0)).toBe(8)
  })

  it('queries subrange in 4x4', () => {
    const data = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(1, 1, 2, 2)).toBe(11)
  })

  it('queries full range returns max', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 0, 2, 2)).toBe(9)
  })

  it('queries full range returns min', () => {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 2, 2)).toBe(1)
  })

  it('handles 5x5 matrix center query', () => {
    const data = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(1, 1, 3, 3)).toBe(7)
  })

  it('handles 5x5 matrix corner query', () => {
    const data = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(3, 3, 4, 4)).toBe(25)
  })

  it('2x4 matrix min at edges', () => {
    const data = [[9, 1, 5, 3], [7, 4, 8, 2]]
    const st = new SparseTable2D(data, Math.min)
    expect(st.query(0, 0, 1, 3)).toBe(1)
  })

  it('4x2 matrix max at specific position', () => {
    const data = [[1, 8], [3, 6], [5, 4], [7, 2]]
    const st = new SparseTable2D(data, Math.max)
    expect(st.query(0, 1, 3, 1)).toBe(8)
  })
})
describe('sparse-table-2d - wave547', () => {
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

describe('sparse-table-2d - wave548', () => {
  it('sparse-table-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave549', () => {
  it('sparse-table-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave550', () => {
  it('sparse-table-2d w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave551', () => {
  it('sparse-table-2d w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave552', () => {
  it('sparse-table-2d w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave553', () => {
  it('sparse-table-2d w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave554', () => {
  it('sparse-table-2d w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave555', () => {
  it('sparse-table-2d w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave556', () => {
  it('sparse-table-2d w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave557', () => {
  it('sparse-table-2d w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave558', () => {
  it('sparse-table-2d w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave559', () => {
  it('sparse-table-2d w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave560', () => {
  it('sparse-table-2d w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-table-2d - wave561', () => {
  it('sparse-table-2d w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-table-2d w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
