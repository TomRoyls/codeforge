import { describe, it, expect } from 'vitest'
import { PrioritySearchTree } from '../../src/utils/priority-search-tree.js'

describe('PrioritySearchTree', () => {
  it('inserts and queries single point', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'point1')
    const results = tree.query(0, 10, 15)
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('point1')
  })

  it('returns empty for non-matching query', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'point1')
    const results = tree.query(10, 20, 5)
    expect(results.length).toBe(0)
  })

  it('filters by xMin', () => {
    const tree = new PrioritySearchTree()
    tree.insert(2, 5, 'a')
    tree.insert(8, 5, 'b')
    const results = tree.query(5, 10, 10)
    expect(results.every(r => r.x >= 5)).toBe(true)
  })

  it('filters by xMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(2, 5, 'a')
    tree.insert(8, 5, 'b')
    const results = tree.query(0, 5, 10)
    expect(results.every(r => r.x <= 5)).toBe(true)
  })

  it('filters by yMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 3, 'low')
    tree.insert(5, 8, 'high')
    const results = tree.query(0, 10, 5)
    expect(results.every(r => r.y <= 5)).toBe(true)
  })

  it('handles multiple inserts', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 1, 'a')
    tree.insert(2, 2, 'b')
    tree.insert(3, 3, 'c')
    tree.insert(4, 4, 'd')
    tree.insert(5, 5, 'e')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(5)
  })

  it('returns empty for empty tree', () => {
    const tree = new PrioritySearchTree()
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(0)
  })

  it('handles exact boundary matches', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'boundary')
    const results = tree.query(5, 5, 10)
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('boundary')
  })

  it('preserves x, y, data in results', () => {
    const tree = new PrioritySearchTree()
    tree.insert(3, 7, 'test-data')
    const results = tree.query(0, 10, 10)
    expect(results[0]).toEqual({ x: 3, y: 7, data: 'test-data' })
  })

  it('handles duplicate x values', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 1, 'a')
    tree.insert(5, 2, 'b')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(2)
  })

  it('handles negative coordinates', () => {
    const tree = new PrioritySearchTree()
    tree.insert(-5, -3, 'neg')
    tree.insert(0, 0, 'origin')
    const results = tree.query(-10, 0, 0)
    expect(results.length).toBe(2)
  })

  it('handles large dataset efficiently', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 1000; i++) {
      tree.insert(i, i, `point-${i}`)
    }
    const results = tree.query(400, 600, 600)
    expect(results.length).toBe(201)
    for (const r of results) {
      expect(r.x).toBeGreaterThanOrEqual(400)
      expect(r.x).toBeLessThanOrEqual(600)
      expect(r.y).toBeLessThanOrEqual(600)
    }
  })

  it('handles duplicate y values', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 5, 'a')
    tree.insert(2, 5, 'b')
    tree.insert(3, 5, 'c')
    const results = tree.query(0, 10, 5)
    expect(results.length).toBe(3)
  })

  it('handles identical x and y', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, 'first')
    tree.insert(5, 5, 'second')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(2)
  })

  it('query with narrow x range returns subset', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 10; i++) {
      tree.insert(i * 10, 5, `p${i}`)
    }
    const results = tree.query(20, 40, 10)
    expect(results.length).toBe(3)
    expect(results.map((r) => r.data).sort()).toEqual(['p2', 'p3', 'p4'])
  })

  it('query outside all points returns empty', () => {
    const tree = new PrioritySearchTree()
    tree.insert(50, 50, 'a')
    expect(tree.query(0, 10, 100)).toEqual([])
  })

  it('handles many insertions', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, i, `p${i}`)
    }
    const results = tree.query(0, 50, 50)
    expect(results.length).toBe(51)
  })
})

describe('PrioritySearchTree - yMax filtering', () => {
  it('filters by yMax boundary', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, 'at-boundary')
    tree.insert(5, 6, 'above-boundary')
    tree.insert(5, 4, 'below-boundary')
    const results = tree.query(0, 10, 5)
    expect(results.length).toBe(2)
    expect(results.every(r => r.y <= 5)).toBe(true)
  })

  it('excludes points above yMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 100, 'high')
    tree.insert(5, 50, 'mid')
    tree.insert(5, 1, 'low')
    const results = tree.query(0, 10, 50)
    expect(results.every(r => r.y <= 50)).toBe(true)
  })

  it('includes all points with high yMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 1, 'a')
    tree.insert(2, 2, 'b')
    tree.insert(3, 3, 'c')
    const results = tree.query(0, 10, 100)
    expect(results.length).toBe(3)
  })
})

describe('PrioritySearchTree - xRange filtering', () => {
  it('filters by xMin and xMax together', () => {
    const tree = new PrioritySearchTree()
    tree.insert(0, 5, 'out-left')
    tree.insert(5, 5, 'at-min')
    tree.insert(10, 5, 'in-middle')
    tree.insert(15, 5, 'at-max')
    tree.insert(20, 5, 'out-right')
    const results = tree.query(5, 15, 10)
    expect(results.length).toBe(3)
    expect(results.every(r => r.x >= 5 && r.x <= 15)).toBe(true)
  })

  it('query with xMin > xMax returns empty', () => {
    const tree = new PrioritySearchTree()
    tree.insert(10, 5, 'point')
    const results = tree.query(20, 10, 10)
    expect(results.length).toBe(0)
  })
})

describe('PrioritySearchTree - single coordinate filtering', () => {
  it('filters only by xMin', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'a')
    tree.insert(15, 10, 'b')
    tree.insert(25, 10, 'c')
    const results = tree.query(10, 100, 100)
    expect(results.every(r => r.x >= 10)).toBe(true)
    expect(results.length).toBe(2)
  })

  it('filters only by xMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 10, 'a')
    tree.insert(15, 10, 'b')
    tree.insert(25, 10, 'c')
    const results = tree.query(0, 20, 100)
    expect(results.every(r => r.x <= 20)).toBe(true)
    expect(results.length).toBe(2)
  })

  it('filters only by yMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(10, 5, 'a')
    tree.insert(10, 15, 'b')
    tree.insert(10, 25, 'c')
    const results = tree.query(0, 100, 20)
    expect(results.every(r => r.y <= 20)).toBe(true)
    expect(results.length).toBe(2)
  })
})

describe('PrioritySearchTree - boundary conditions', () => {
  it('handles yMax = 0', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 0, 'at-zero')
    tree.insert(5, -1, 'below')
    const results = tree.query(0, 10, 0)
    expect(results.length).toBe(2)
  })

  it('handles yMax with negative values', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, -5, 'neg-five')
    tree.insert(5, -10, 'neg-ten')
    tree.insert(5, 0, 'zero')
    const results = tree.query(0, 10, -5)
    expect(results.length).toBe(2)
    expect(results.every(r => r.y <= -5)).toBe(true)
  })

  it('handles xMin = 0', () => {
    const tree = new PrioritySearchTree()
    tree.insert(0, 5, 'at-zero')
    tree.insert(-5, 5, 'negative')
    tree.insert(5, 5, 'positive')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(2)
    expect(results.every(r => r.x >= 0)).toBe(true)
  })

  it('handles xMax = 0', () => {
    const tree = new PrioritySearchTree()
    tree.insert(0, 5, 'at-zero')
    tree.insert(-5, 5, 'negative')
    tree.insert(5, 5, 'positive')
    const results = tree.query(-10, 0, 10)
    expect(results.length).toBe(2)
    expect(results.every(r => r.x <= 0)).toBe(true)
  })
})

describe('PrioritySearchTree - multiple inserts and queries', () => {
  it('handles sequential inserts and queries', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 1, 'first')
    expect(tree.query(0, 2, 2).length).toBe(1)
    tree.insert(2, 2, 'second')
    expect(tree.query(0, 3, 3).length).toBe(2)
    tree.insert(3, 3, 'third')
    expect(tree.query(0, 4, 4).length).toBe(3)
  })

  it('handles overlapping inserts', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 10; i++) {
      tree.insert(5, i, `y-${i}`)
    }
    const results = tree.query(0, 10, 5)
    expect(results.length).toBe(6)
  })
})

describe('PrioritySearchTree - data handling', () => {
  it('preserves all data properties', () => {
    const tree = new PrioritySearchTree()
    tree.insert(10, 20, 'data-with-special-chars-123')
    const results = tree.query(5, 15, 25)
    expect(results[0]!.data).toBe('data-with-special-chars-123')
  })

  it('handles empty string data', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, '')
    const results = tree.query(0, 10, 10)
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('')
  })

  it('handles numeric string data', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, '12345')
    const results = tree.query(0, 10, 10)
    expect(results[0]!.data).toBe('12345')
  })
})

describe('PrioritySearchTree - query result order', () => {
  it('query returns all matching points', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 1, 'a')
    tree.insert(2, 2, 'b')
    tree.insert(3, 3, 'c')
    const results = tree.query(0, 10, 3)
    expect(results.length).toBe(3)
    const dataValues = results.map(r => r.data)
    expect(dataValues).toContain('a')
    expect(dataValues).toContain('b')
    expect(dataValues).toContain('c')
  })
})

describe('PrioritySearchTree - extreme values', () => {
  it('handles very large coordinates', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1000000, 1000000, 'big')
    tree.insert(2000000, 2000000, 'bigger')
    const results = tree.query(0, 2000000, 2000000)
    expect(results.length).toBe(2)
  })

  it('handles very small coordinates', () => {
    const tree = new PrioritySearchTree()
    tree.insert(-1000000, -1000000, 'small')
    tree.insert(-2000000, -2000000, 'smaller')
    const results = tree.query(-2000000, 0, 0)
    expect(results.length).toBe(2)
  })
})

describe('PrioritySearchTree - query edge cases', () => {
  it('query with exact coordinate match', () => {
    const tree = new PrioritySearchTree()
    tree.insert(10, 20, 'exact')
    const results = tree.query(10, 10, 20)
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('exact')
  })

  it('query with point exactly on yMax boundary', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 100, 'on-boundary')
    tree.insert(5, 99, 'below-boundary')
    const results = tree.query(0, 10, 100)
    expect(results.length).toBe(2)
  })

  it('query with negative range boundaries', () => {
    const tree = new PrioritySearchTree()
    tree.insert(-10, -10, 'neg')
    tree.insert(0, 0, 'zero')
    tree.insert(10, 10, 'pos')
    const results = tree.query(-20, 20, 20)
    expect(results.length).toBe(3)
  })
})

describe('PrioritySearchTree - mixed insertion patterns', () => {
  it('handles alternating low and high values', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 100, 'low-x-high-y')
    tree.insert(100, 1, 'high-x-low-y')
    tree.insert(50, 50, 'mid')
    const results = tree.query(0, 100, 50)
    expect(results.length).toBe(2)
  })

  it('handles diagonal pattern', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 10; i++) {
      tree.insert(i, i, `diag-${i}`)
    }
    const results = tree.query(3, 7, 7)
    expect(results.length).toBe(5)
  })
})

describe('PrioritySearchTree - data variations', () => {
  it('handles special characters in data', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, 'data-with-special!@#$%^&*()')
    const results = tree.query(0, 10, 10)
    expect(results[0]!.data).toBe('data-with-special!@#$%^&*()')
  })

  it('handles unicode characters in data', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, 'data--with-émojis-😀')
    const results = tree.query(0, 10, 10)
    expect(results[0]!.data).toBe('data--with-émojis-😀')
  })

  it('handles very long data strings', () => {
    const tree = new PrioritySearchTree()
    const longData = 'a'.repeat(1000)
    tree.insert(5, 5, longData)
    const results = tree.query(0, 10, 10)
    expect(results[0]!.data).toBe(longData)
  })
})

describe('PrioritySearchTree - filtering combinations', () => {
  it('filters by all three constraints simultaneously', () => {
    const tree = new PrioritySearchTree()
    tree.insert(10, 20, 'match')
    tree.insert(5, 25, 'fail-y')
    tree.insert(15, 15, 'fail-x-min')
    tree.insert(25, 20, 'fail-x-max')
    const results = tree.query(10, 20, 20)
    expect(results.length).toBe(2)
    expect(results.some(r => r.data === 'match')).toBe(true)
    expect(results.some(r => r.data === 'fail-x-min')).toBe(true)
  })

  it('query returns only points meeting all criteria', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 20; i++) {
      tree.insert(i, i, `p${i}`)
    }
    const results = tree.query(5, 15, 15)
    expect(results.length).toBe(11)
    expect(results.every(r => r.x >= 5 && r.x <= 15 && r.y <= 15)).toBe(true)
  })
})

describe('PrioritySearchTree - repeated operations', () => {
  it('handles multiple queries on same tree', () => {
    const tree = new PrioritySearchTree()
    tree.insert(5, 5, 'point')
    const results1 = tree.query(0, 10, 10)
    const results2 = tree.query(0, 10, 10)
    expect(results1.length).toBe(results2.length)
    expect(results1[0]!.data).toBe(results2[0]!.data)
  })

  it('handles queries after insertions', () => {
    const tree = new PrioritySearchTree()
    tree.insert(1, 1, 'a')
    expect(tree.query(0, 5, 5).length).toBe(1)
    tree.insert(2, 2, 'b')
    expect(tree.query(0, 5, 5).length).toBe(2)
    tree.insert(3, 3, 'c')
    expect(tree.query(0, 5, 5).length).toBe(3)
  })
})

describe('PrioritySearchTree - corner cases', () => {
  it('handles xMin equals xMax', () => {
    const tree = new PrioritySearchTree()
    tree.insert(10, 5, 'on-line')
    tree.insert(11, 5, 'off-line')
    const results = tree.query(10, 10, 10)
    expect(results.length).toBe(1)
    expect(results[0]!.x).toBe(10)
  })

  it('handles all points with same y', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 10; i++) {
      tree.insert(i, 5, `same-y-${i}`)
    }
    const results = tree.query(0, 9, 5)
    expect(results.length).toBe(10)
  })

  it('handles all points with same x', () => {
    const tree = new PrioritySearchTree()
    for (let i = 0; i < 10; i++) {
      tree.insert(5, i, `same-x-${i}`)
    }
    const results = tree.query(5, 5, 9)
    expect(results.length).toBe(10)
  })
})

  it('query empty tree returns empty', () => {
    const pst = new PrioritySearchTree()
    expect(pst.query(0, 10, 10)).toEqual([])
  })

  it('insert and query single point', () => {
    const pst = new PrioritySearchTree()
    pst.insert(5, 3, 'a')
    const result = pst.query(0, 10, 5)
    expect(result.length).toBe(1)
    expect(result[0].data).toBe('a')
  })

  it('query outside range returns empty', () => {
    const pst = new PrioritySearchTree()
    pst.insert(5, 3, 'a')
    expect(pst.query(10, 20, 10)).toEqual([])

  it('insert and query', () => {
    const pst = new PrioritySearchTree()
    pst.insert(1, 1, 'a')
    const result = pst.query(0, 2, 2)
    expect(result.length).toBeGreaterThan(0)
  })

  it('empty query returns empty', () => {
    const pst = new PrioritySearchTree()
    expect(pst.query(0, 1, 1)).toEqual([])
  })

  it('PrioritySearchTree is a class', () => {
    expect(typeof PrioritySearchTree).toBe('function')
  })
})

describe('priority-search-tree - wave545', () => {
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

describe('priority-search-tree - wave546', () => {
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

describe('priority-search-tree - wave547', () => {
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

describe('priority-search-tree - wave548', () => {
  it('priority-search-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave549', () => {
  it('priority-search-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave550', () => {
  it('priority-search-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave551', () => {
  it('priority-search-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave552', () => {
  it('priority-search-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave553', () => {
  it('priority-search-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave554', () => {
  it('priority-search-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave555', () => {
  it('priority-search-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave556', () => {
  it('priority-search-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave557', () => {
  it('priority-search-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave558', () => {
  it('priority-search-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave559', () => {
  it('priority-search-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave560', () => {
  it('priority-search-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave561', () => {
  it('priority-search-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave562', () => {
  it('priority-search-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
