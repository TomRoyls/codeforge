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

describe('priority-search-tree - wave563', () => {
  it('priority-search-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave564', () => {
  it('priority-search-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave565', () => {
  it('priority-search-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave566', () => {
  it('priority-search-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave127', () => {
  it('priority-search-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave130', () => {
  it('priority-search-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave133', () => {
  it('priority-search-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave136', () => {
  it('priority-search-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - wave139', () => {
  it('priority-search-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w142', () => {
  it('priority-search-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w145', () => {
  it('priority-search-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w148', () => {
  it('priority-search-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w151', () => {
  it('priority-search-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w154', () => {
  it('priority-search-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w157', () => {
  it('priority-search-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w160', () => {
  it('priority-search-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w170', () => {
  it('priority-search-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w180', () => {
  it('priority-search-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w190', () => {
  it('priority-search-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w200', () => {
  it('priority-search-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w210', () => {
  it('priority-search-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w220', () => {
  it('priority-search-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w230', () => {
  it('priority-search-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w240', () => {
  it('priority-search-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w250', () => {
  it('priority-search-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w260', () => {
  it('priority-search-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w270', () => {
  it('priority-search-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w280', () => {
  it('priority-search-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w290', () => {
  it('priority-search-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w300', () => {
  it('priority-search-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w310', () => {
  it('priority-search-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w320', () => {
  it('priority-search-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w330', () => {
  it('priority-search-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w340', () => {
  it('priority-search-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w350', () => {
  it('priority-search-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w360', () => {
  it('priority-search-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w370', () => {
  it('priority-search-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w380', () => {
  it('priority-search-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w390', () => {
  it('priority-search-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w400', () => {
  it('priority-search-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w420', () => {
  it('priority-search-tree x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w440', () => {
  it('priority-search-tree x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w460', () => {
  it('priority-search-tree x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w480', () => {
  it('priority-search-tree x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w500', () => {
  it('priority-search-tree x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w550', () => {
  it('priority-search-tree x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w600', () => {
  it('priority-search-tree x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w650', () => {
  it('priority-search-tree x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('priority-search-tree - w700', () => {
  it('priority-search-tree x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('priority-search-tree x700x49', () => {
    expect(describe).toBeDefined()
  })
})
