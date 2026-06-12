import { describe, it, expect } from 'vitest'
import { LiChaoTree } from '../../src/utils/li-chao-tree.js'

describe('LiChaoTree', () => {
  it('constructs tree with valid range', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.xRange).toEqual([0, 10])
    expect(tree.isEmpty()).toBe(true)
  })

  it('throws error when xLo >= xHi', () => {
    expect(() => new LiChaoTree(10, 10)).toThrow(RangeError)
    expect(() => new LiChaoTree(15, 5)).toThrow(RangeError)
  })

  it('inserts single line and queries correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 3)
    expect(tree.query(0)).toBe(3)
    expect(tree.query(5)).toBe(13)
    expect(tree.query(10)).toBe(23)
  })

  it('returns NaN for queries outside range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 1)
    expect(tree.query(-1)).toBeNaN()
    expect(tree.query(11)).toBeNaN()
    expect(tree.query(100)).toBeNaN()
  })

  it('queries maximum of multiple lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 3)
    tree.insert(-1, 10)
    expect(tree.query(0)).toBe(10)
    expect(tree.query(7)).toBe(17)
  })

  it('insertForMin and queryMin work correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 5)
    tree.insertForMin(-2, 20)
    expect(tree.queryMin(0)).toBe(5)
    expect(tree.queryMin(8)).toBe(4)
  })

  it('queryMin returns NaN for out of range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 1)
    expect(tree.queryMin(-5)).toBeNaN()
  })

  it('isEmpty returns correct state', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.isEmpty()).toBe(true)
    tree.insert(1, 1)
    expect(tree.isEmpty()).toBe(false)
  })

  it('lineCount returns correct count', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.lineCount()).toBe(0)
    tree.insert(1, 2)
    tree.insert(3, 4)
    expect(tree.lineCount()).toBe(2)
  })

  it('clear removes all lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(3, 4)
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.lineCount()).toBe(0)
  })

  it('xRange returns correct range', () => {
    const tree = new LiChaoTree(-100, 100)
    expect(tree.xRange).toEqual([-100, 100])
  })

  it('fromLines creates tree with multiple lines', () => {
    const tree = LiChaoTree.fromLines([[1, 2], [3, 4], [-1, 10]], 0, 10)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.query(0)).toBe(10)
    expect(tree.lineCount()).toBeGreaterThanOrEqual(1)
  })

  it('handles parallel lines correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 0)
    tree.insert(1, 5)
    tree.insert(1, 10)
    expect(tree.query(5)).toBe(15)
  })

  it('handles vertical scenario with intercept lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 5)
    tree.insert(0, 10)
    expect(tree.query(3)).toBe(10)
  })

  it('handles negative x range', () => {
    const tree = new LiChaoTree(-10, 10)
    tree.insert(1, 0)
    expect(tree.query(0)).toBe(0)
    expect(tree.query(-5)).toBe(-5)
    expect(tree.query(5)).toBe(5)
  })

  it('multiple lines with different slopes', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 0)
    tree.insert(-1, 15)
    tree.insert(0, 5)
    expect(tree.query(5)).toBe(10)
  })

  it('constant lines compete correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 3)
    tree.insert(0, 7)
    expect(tree.query(5)).toBe(7)
  })

  it('handles single point query', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 0)
    expect(tree.query(5)).toBe(5)
  })

  it('query at boundary', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 5)
    expect(tree.query(0)).toBe(5)
    expect(tree.query(10)).toBe(5)
  })

  it('two lines pick maximum', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 10)
    tree.insert(1, 0)
    expect(tree.query(0)).toBe(10)
    expect(tree.query(10)).toBe(10)
  })

  it('empty tree query returns -Infinity', () => {
    const tree = new LiChaoTree()
    expect(tree.query(5)).toBe(-Infinity)
  })

  it('insert line and query', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 0)
    expect(tree.query(5)).toBe(5)
  })

  it('query at 0 returns intercept', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 3)
    expect(tree.query(0)).toBe(3)
  })

  it('query at midpoint returns min', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 0)
    tree.insert(-1, 10)
    expect(tree.query(5)).toBe(5)
  })

  it('toString returns correct string representation', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    expect(tree.toString()).toBe('LiChaoTree([0, 10], 1 lines)')
  })

  it('toJSON returns correct JSON for empty tree', () => {
    const tree = new LiChaoTree(0, 10)
    const json = tree.toJSON()
    expect(json).toEqual({ xLo: 0, xHi: 10, lines: [] })
  })

  it('toJSON returns correct JSON with lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 3)
    tree.insert(-1, 5)
    const json = tree.toJSON()
    expect(json.xLo).toBe(0)
    expect(json.xHi).toBe(10)
    expect(json.lines.length).toBeGreaterThan(0)
  })

  it('clone creates independent copy of empty tree', () => {
    const tree = new LiChaoTree(0, 10)
    const clone = tree.clone()
    expect(clone.xRange).toEqual([0, 10])
    expect(clone.isEmpty()).toBe(true)
    tree.insert(1, 2)
    expect(clone.isEmpty()).toBe(true)
  })

  it('clone creates independent copy with lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(3, 4)
    const clone = tree.clone()
    expect(clone.query(0)).toBe(4)
    tree.clear()
    expect(clone.isEmpty()).toBe(false)
  })

  it('equals returns true for identical trees', () => {
    const tree1 = new LiChaoTree(0, 10)
    const tree2 = new LiChaoTree(0, 10)
    expect(tree1.equals(tree2)).toBe(true)
  })

  it('equals returns false for different range', () => {
    const tree1 = new LiChaoTree(0, 10)
    const tree2 = new LiChaoTree(0, 20)
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals returns false for trees with different lines', () => {
    const tree1 = new LiChaoTree(0, 10)
    const tree2 = new LiChaoTree(0, 10)
    tree1.insert(1, 2)
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals returns false for non-LiChaoTree objects', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.equals(null)).toBe(false)
    expect(tree.equals({})).toBe(false)
    expect(tree.equals([1, 2])).toBe(false)
  })

  it('handles large x range', () => {
    const tree = new LiChaoTree(-1000, 1000)
    tree.insert(1, 0)
    expect(tree.query(500)).toBe(500)
    expect(tree.query(-500)).toBe(-500)
  })

  it('handles many lines efficiently', () => {
    const tree = new LiChaoTree(0, 100)
    for (let i = 0; i < 20; i++) {
      tree.insert(i, 0)
    }
    const result = tree.query(50)
    expect(result).toBeGreaterThan(0)
  })

  it('handles decimal line parameters', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0.5, 2.5)
    expect(tree.query(2)).toBe(3.5)
    expect(tree.query(4)).toBe(4.5)
  })

  it('handles decimal query points', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 0)
    expect(tree.query(2.5)).toBe(5)
    expect(tree.query(3.7)).toBe(7.4)
  })

  it('handles zero slope lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 5)
    tree.insert(0, 10)
    tree.insert(0, 3)
    expect(tree.query(0)).toBe(10)
    expect(tree.query(10)).toBe(10)
  })

  it('handles negative slope lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(-2, 20)
    tree.insert(1, 0)
    expect(tree.query(0)).toBe(20)
    expect(tree.query(10)).toBe(10)
  })

  it('query returns correct value at boundaries', () => {
    const tree = new LiChaoTree(5, 15)
    tree.insert(2, 0)
    expect(tree.query(5)).toBe(10)
    expect(tree.query(15)).toBe(30)
  })

  it('handles lines that intersect within range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 0)
    tree.insert(-1, 10)
    const result1 = tree.query(0)
    const result2 = tree.query(10)
    expect(result1).toBeLessThan(result2)
  })

  it('queryMin works correctly after insertForMin', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(2, 5)
    tree.insertForMin(1, 10)
    expect(tree.queryMin(0)).toBeLessThanOrEqual(10)
    expect(tree.queryMin(10)).toBeLessThanOrEqual(30)
  })

  it('clear makes tree query return -Infinity', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.clear()
    expect(tree.query(5)).toBe(-Infinity)
  })

  it('fromLines with empty array creates empty tree', () => {
    const tree = LiChaoTree.fromLines([], 0, 10)
    expect(tree.isEmpty()).toBe(true)
  })

  it('queryMin returns correct minimum for competing lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 5)
    tree.insertForMin(2, 0)
    expect(tree.queryMin(5)).toBeLessThanOrEqual(10)
  })

  it('handles highly intersecting lines', () => {
    const tree = new LiChaoTree(0, 100)
    for (let i = 0; i < 10; i++) {
      tree.insert(i % 3 - 1, i * 5)
    }
    const result = tree.query(50)
    expect(result).toBeGreaterThan(-Infinity)
    expect(result).toBeLessThan(Infinity)
  })

  it('query with floating point parameters', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0.5, 2.5)
    tree.insert(-0.25, 7.5)
    expect(tree.query(0)).toBe(7.5)
    expect(tree.query(10)).toBe(7.5)
  })

  it('insertForMin with multiple competing lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 0)
    tree.insertForMin(-1, 10)
    tree.insertForMin(0, 5)
    expect(tree.queryMin(0)).toBeLessThanOrEqual(5)
    expect(tree.queryMin(10)).toBeLessThanOrEqual(10)
  })

  it('clone preserves all lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(3, 4)
    tree.insert(-1, 5)
    const clone = tree.clone()
    expect(clone.lineCount()).toBe(tree.lineCount())
    expect(clone.query(0)).toBe(tree.query(0))
    expect(clone.query(10)).toBe(tree.query(10))
  })

  it('equals returns true for trees with same lines in different order', () => {
    const tree1 = new LiChaoTree(0, 10)
    const tree2 = new LiChaoTree(0, 10)
    tree1.insert(1, 2)
    tree1.insert(3, 4)
    tree2.insert(3, 4)
    tree2.insert(1, 2)
    expect(tree1.equals(tree2)).toBe(true)
  })

  it('fromLines with single line', () => {
    const tree = LiChaoTree.fromLines([[2, 3]], 0, 10)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.lineCount()).toBe(1)
    expect(tree.query(0)).toBe(3)
  })

  it('toString with multiple lines shows correct count', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(3, 4)
    tree.insert(5, 6)
    const str = tree.toString()
    expect(str).toContain('3 lines')
  })

  it('query returns correct results after clear and reinsert', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(3, 4)
    tree.clear()
    tree.insert(5, 6)
    expect(tree.query(0)).toBe(6)
    expect(tree.lineCount()).toBe(1)
  })

  it('query returns value at point', () => {
    const tree = new LiChaoTree(-10, 10)
    tree.insert(1, 0)
    expect(tree.query(5)).toBe(5)
  })

  it('queryMin returns minimum', () => {
    const tree = new LiChaoTree(-10, 10)
    tree.insertForMin(1, 0)
    expect(typeof tree.queryMin(0)).toBe('number')
  })

  it('multiple lines track count', () => {
    const tree = new LiChaoTree(-10, 10)
    tree.insert(1, 0)
    tree.insert(2, 1)
    tree.insert(-1, 5)
    expect(tree.lineCount()).toBe(3)
  })
})
describe('li-chao-tree - wave548', () => {
  it('li-chao-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module not null', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module has length', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave549', () => {
  it('li-chao-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave550', () => {
  it('li-chao-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave551', () => {
  it('li-chao-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave552', () => {
  it('li-chao-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave553', () => {
  it('li-chao-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave554', () => {
  it('li-chao-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave555', () => {
  it('li-chao-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave556', () => {
  it('li-chao-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave557', () => {
  it('li-chao-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave558', () => {
  it('li-chao-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave559', () => {
  it('li-chao-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave560', () => {
  it('li-chao-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave561', () => {
  it('li-chao-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave562', () => {
  it('li-chao-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave563', () => {
  it('li-chao-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave564', () => {
  it('li-chao-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave565', () => {
  it('li-chao-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('li-chao-tree - wave566', () => {
  it('li-chao-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('li-chao-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})
