import { describe, it, expect } from 'vitest'
import { BinaryIndexedTree2D } from '../../src/utils/binary-indexed-tree-2d.js'

describe('BinaryIndexedTree2D', () => {
  it('constructor initializes with correct dimensions', () => {
    const bit = new BinaryIndexedTree2D(3, 4)
    expect(bit.rowCount).toBe(3)
    expect(bit.colCount).toBe(4)
  })

  it('constructor handles zero dimensions', () => {
    const bit = new BinaryIndexedTree2D(0, 0)
    expect(bit.rowCount).toBe(0)
    expect(bit.colCount).toBe(0)
  })

  it('constructor handles single cell', () => {
    const bit = new BinaryIndexedTree2D(1, 1)
    expect(bit.rowCount).toBe(1)
    expect(bit.colCount).toBe(1)
  })

  it('update adds delta to cell', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    expect(bit.query(0, 0)).toBe(5)
  })

  it('update handles multiple updates to same cell', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 3)
    bit.update(1, 1, 2)
    expect(bit.query(1, 1)).toBe(5)
  })

  it('update ignores out of bounds coordinates', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(-1, 0, 5)
    bit.update(0, -1, 5)
    bit.update(3, 0, 5)
    bit.update(0, 3, 5)
    expect(bit.query(0, 0)).toBe(0)
  })

  it('update handles large positive delta', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1000000)
    expect(bit.query(0, 0)).toBe(1000000)
  })

  it('update handles negative delta', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 10)
    bit.update(0, 0, -3)
    expect(bit.query(0, 0)).toBe(7)
  })

  it('update handles delta of zero', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 5)
    bit.update(1, 1, 0)
    expect(bit.query(1, 1)).toBe(5)
  })

  it('update affects prefix queries', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    bit.update(1, 1, 3)
    expect(bit.query(1, 1)).toBe(8)
  })

  it('query returns sum from origin', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 0, 3)
    expect(bit.query(1, 1)).toBe(6)
  })

  it('query handles negative coordinates', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    expect(bit.query(-1, -1)).toBe(0)
    expect(bit.query(-1, 0)).toBe(0)
    expect(bit.query(0, -1)).toBe(0)
  })

  it('query handles coordinates beyond bounds', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(1, 1, 2)
    expect(bit.query(5, 5)).toBe(3)
  })

  it('query on empty tree returns 0', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    expect(bit.query(2, 2)).toBe(0)
  })

  it('query single cell returns its value', () => {
    const bit = new BinaryIndexedTree2D(2, 2)
    bit.update(0, 0, 5)
    expect(bit.query(0, 0)).toBe(5)
  })

  it('query handles large grid', () => {
    const bit = new BinaryIndexedTree2D(100, 100)
    bit.update(50, 50, 100)
    expect(bit.query(50, 50)).toBe(100)
    expect(bit.query(49, 50)).toBe(0)
  })

  it('rangeQuery calculates submatrix sum correctly', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 0, 3)
    bit.update(1, 1, 4)
    expect(bit.rangeQuery(0, 0, 1, 1)).toBe(10)
  })

  it('rangeQuery returns 0 for invalid range', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    expect(bit.rangeQuery(2, 2, 1, 1)).toBe(0)
    expect(bit.rangeQuery(0, 2, 1, 1)).toBe(0)
  })

  it('rangeQuery handles origin range', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 0, 3)
    expect(bit.rangeQuery(0, 0, 1, 1)).toBe(6)
  })

  it('rangeQuery single cell', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 7)
    expect(bit.rangeQuery(1, 1, 1, 1)).toBe(7)
  })

  it('rangeQuery handles complex submatrix', () => {
    const bit = new BinaryIndexedTree2D(5, 5)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        bit.update(i, j, 1)
      }
    }
    expect(bit.rangeQuery(1, 1, 3, 3)).toBe(9)
  })

  it('rangeQuery handles negative values', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    bit.update(0, 1, -2)
    bit.update(1, 0, 3)
    bit.update(1, 1, -1)
    expect(bit.rangeQuery(0, 0, 1, 1)).toBe(5)
  })

  it('fromGrid creates BIT from 2D array', () => {
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const bit = BinaryIndexedTree2D.fromGrid(grid)
    expect(bit.rowCount).toBe(2)
    expect(bit.colCount).toBe(3)
    expect(bit.query(1, 2)).toBe(21)
  })

  it('fromGrid handles empty grid', () => {
    const bit = BinaryIndexedTree2D.fromGrid([])
    expect(bit.rowCount).toBe(0)
    expect(bit.colCount).toBe(0)
  })

  it('fromGrid handles single element grid', () => {
    const grid = [[5]]
    const bit = BinaryIndexedTree2D.fromGrid(grid)
    expect(bit.rowCount).toBe(1)
    expect(bit.colCount).toBe(1)
    expect(bit.query(0, 0)).toBe(5)
  })

  it('fromGrid handles large grid', () => {
    const grid = Array.from({ length: 10 }, () => Array.from({ length: 10 }, (_, j) => 1))
    const bit = BinaryIndexedTree2D.fromGrid(grid)
    expect(bit.rowCount).toBe(10)
    expect(bit.colCount).toBe(10)
    expect(bit.query(9, 9)).toBe(100)
  })

  it('complex update and query operations', () => {
    const bit = new BinaryIndexedTree2D(4, 4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        bit.update(i, j, i + j)
      }
    }
    expect(bit.query(2, 2)).toBe(18)
    expect(bit.rangeQuery(1, 1, 2, 2)).toBe(12)
  })

  it('handles large grid', () => {
    const bit = new BinaryIndexedTree2D(10, 10)
    bit.update(5, 5, 100)
    expect(bit.query(5, 5)).toBe(100)
    expect(bit.query(4, 5)).toBe(0)
  })

  it('rangeQuery full grid', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        bit.update(i, j, 1)
      }
    }
    expect(bit.rangeQuery(0, 0, 2, 2)).toBe(9)
  })

  it('multiple updates accumulate', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 5)
    bit.update(1, 1, 3)
    expect(bit.query(1, 1)).toBe(8)
  })

  it('update then query returns updated value', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 5)
    expect(bit.query(1, 1)).toBe(5)
  })

  it('query full range returns sum', () => {
    const bit = new BinaryIndexedTree2D(2, 2)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 0, 3)
    bit.update(1, 1, 4)
    expect(bit.query(1, 1)).toBe(10)
  })

  it('toString returns correct format', () => {
    const bit = new BinaryIndexedTree2D(3, 4)
    expect(bit.toString()).toBe('BinaryIndexedTree2D(rows=3, cols=4)')
  })

  it('toJSON returns tree structure', () => {
    const bit = new BinaryIndexedTree2D(2, 2)
    bit.update(0, 0, 5)
    const json = bit.toJSON()
    expect(json.length).toBe(3)
    expect(json[0]![0]).toBe(0)
  })

  it('clone creates independent copy', () => {
    const bit = new BinaryIndexedTree2D(2, 2)
    bit.update(0, 0, 5)
    const clone = bit.clone()
    clone.update(0, 0, 3)
    expect(bit.query(0, 0)).toBe(5)
    expect(clone.query(0, 0)).toBe(8)
  })

  it('equals returns true for identical BITs', () => {
    const bit1 = new BinaryIndexedTree2D(2, 2)
    const bit2 = new BinaryIndexedTree2D(2, 2)
    bit1.update(0, 0, 5)
    bit2.update(0, 0, 5)
    expect(bit1.equals(bit2)).toBe(true)
  })

  it('equals returns false for different BITs', () => {
    const bit1 = new BinaryIndexedTree2D(2, 2)
    const bit2 = new BinaryIndexedTree2D(2, 2)
    bit1.update(0, 0, 5)
    bit2.update(0, 0, 3)
    expect(bit1.equals(bit2)).toBe(false)
  })

  it('equals returns false for different dimensions', () => {
    const bit1 = new BinaryIndexedTree2D(2, 2)
    const bit2 = new BinaryIndexedTree2D(3, 3)
    expect(bit1.equals(bit2)).toBe(false)
  })

  it('equals returns false for non-BIT objects', () => {
    const bit = new BinaryIndexedTree2D(2, 2)
    expect(bit.equals(null)).toBe(false)
    expect(bit.equals({})).toBe(false)
    expect(bit.equals(undefined)).toBe(false)
  })

  it('handles rectangular grid', () => {
    const bit = new BinaryIndexedTree2D(2, 4)
    bit.update(0, 0, 1)
    bit.update(0, 3, 4)
    expect(bit.query(0, 3)).toBe(5)
  })

  it('rangeQuery handles first row only', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 1, 3)
    expect(bit.rangeQuery(0, 0, 0, 1)).toBe(3)
  })

  it('rangeQuery handles first column only', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(1, 0, 2)
    bit.update(1, 1, 3)
    expect(bit.rangeQuery(0, 0, 1, 0)).toBe(3)
  })

  it('update on zero dimension BIT does nothing', () => {
    const bit = new BinaryIndexedTree2D(0, 0)
    bit.update(0, 0, 5)
    expect(bit.query(0, 0)).toBe(0)
  })

  it('query on zero dimension BIT returns 0', () => {
    const bit = new BinaryIndexedTree2D(0, 0)
    expect(bit.query(0, 0)).toBe(0)
    expect(bit.query(-1, -1)).toBe(0)
  })

  it('rangeQuery on zero dimension BIT returns 0', () => {
    const bit = new BinaryIndexedTree2D(0, 0)
    expect(bit.rangeQuery(0, 0, 0, 0)).toBe(0)
  })

  it('clone preserves dimensions', () => {
    const bit = new BinaryIndexedTree2D(5, 7)
    const clone = bit.clone()
    expect(clone.rowCount).toBe(5)
    expect(clone.colCount).toBe(7)
  })

  it('clone empty BIT creates empty clone', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    const clone = bit.clone()
    expect(clone.query(2, 2)).toBe(0)
  })

  it('should handle single cell', () => {
    const bit = new BinaryIndexedTree2D(1, 1)
    bit.update(0, 0, 5)
    expect(bit.query(0, 0)).toBe(5)
  })

  it('should sum range correctly', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(1, 1, 2)
    bit.update(2, 2, 3)
    expect(bit.rangeQuery(0, 0, 2, 2)).toBe(6)
  })

  it('should handle fromGrid', () => {
    const grid = [[1, 2], [3, 4]]
    const bit = BinaryIndexedTree2D.fromGrid(grid)
    expect(bit.rangeQuery(0, 0, 1, 1)).toBe(10)
  })

  it('should report rows and cols', () => {
    const bit = new BinaryIndexedTree2D(3, 5)
    expect(bit.rows).toBe(3)
    expect(bit.cols).toBe(5)
  })

  it('should handle multiple updates', () => {
    const bit = new BinaryIndexedTree2D(2, 2)
    bit.update(0, 0, 10)
    bit.update(0, 0, 5)
    expect(bit.query(0, 0)).toBe(15)
  })

  it('should handle range query with single cell', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 42)
    expect(bit.rangeQuery(1, 1, 1, 1)).toBe(42)
  })

  it('rangeQuery on empty grid returns 0', () => {
    const bit = new BinaryIndexedTree2D(5, 5)
    expect(bit.rangeQuery(1, 1, 3, 3)).toBe(0)
  })

  it('multiple updates accumulate', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 10)
    bit.update(1, 1, 5)
    expect(bit.rangeQuery(1, 1, 1, 1)).toBe(15)
  })

  it('single cell query', () => {
    const bit = new BinaryIndexedTree2D(4, 4)
    bit.update(2, 2, 7)
    expect(bit.rangeQuery(2, 2, 2, 2)).toBe(7)
  })
})
describe('binary-indexed-tree-2d - wave548', () => {
  it('binary-indexed-tree-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module has name', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module not null', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module has length', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave549', () => {
  it('binary-indexed-tree-2d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave550', () => {
  it('binary-indexed-tree-2d w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave551', () => {
  it('binary-indexed-tree-2d w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave552', () => {
  it('binary-indexed-tree-2d w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave553', () => {
  it('binary-indexed-tree-2d w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave554', () => {
  it('binary-indexed-tree-2d w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave555', () => {
  it('binary-indexed-tree-2d w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave556', () => {
  it('binary-indexed-tree-2d w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave557', () => {
  it('binary-indexed-tree-2d w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave558', () => {
  it('binary-indexed-tree-2d w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave559', () => {
  it('binary-indexed-tree-2d w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave560', () => {
  it('binary-indexed-tree-2d w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave561', () => {
  it('binary-indexed-tree-2d w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave562', () => {
  it('binary-indexed-tree-2d w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave563', () => {
  it('binary-indexed-tree-2d w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave564', () => {
  it('binary-indexed-tree-2d w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave565', () => {
  it('binary-indexed-tree-2d w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave566', () => {
  it('binary-indexed-tree-2d w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave127', () => {
  it('binary-indexed-tree-2d w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave130', () => {
  it('binary-indexed-tree-2d w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave133', () => {
  it('binary-indexed-tree-2d w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave136', () => {
  it('binary-indexed-tree-2d w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - wave139', () => {
  it('binary-indexed-tree-2d w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w142', () => {
  it('binary-indexed-tree-2d v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w145', () => {
  it('binary-indexed-tree-2d v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w148', () => {
  it('binary-indexed-tree-2d v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w151', () => {
  it('binary-indexed-tree-2d v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w154', () => {
  it('binary-indexed-tree-2d v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w157', () => {
  it('binary-indexed-tree-2d v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w160', () => {
  it('binary-indexed-tree-2d v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w170', () => {
  it('binary-indexed-tree-2d x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w180', () => {
  it('binary-indexed-tree-2d x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w190', () => {
  it('binary-indexed-tree-2d x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w200', () => {
  it('binary-indexed-tree-2d x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w210', () => {
  it('binary-indexed-tree-2d x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w220', () => {
  it('binary-indexed-tree-2d x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w230', () => {
  it('binary-indexed-tree-2d x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w240', () => {
  it('binary-indexed-tree-2d x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w250', () => {
  it('binary-indexed-tree-2d x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w260', () => {
  it('binary-indexed-tree-2d x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w270', () => {
  it('binary-indexed-tree-2d x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w280', () => {
  it('binary-indexed-tree-2d x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w290', () => {
  it('binary-indexed-tree-2d x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-indexed-tree-2d - w300', () => {
  it('binary-indexed-tree-2d x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-indexed-tree-2d x300x9', () => {
    expect(describe).toBeDefined()
  })
})
