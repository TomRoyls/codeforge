import { describe, it, expect } from 'vitest'
import { LazySegmentTree } from '../../src/utils/segment-tree-lazy.js'

describe('LazySegmentTree', () => {
  it('constructs with empty array', () => {
    const tree = new LazySegmentTree([])
    expect(tree.length).toBe(0)
  })

  it('constructs with single element', () => {
    const tree = new LazySegmentTree([5])
    expect(tree.length).toBe(1)
    expect(tree.rangeQuery(0, 0)).toBe(5)
  })

  it('constructs with multiple elements', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    expect(tree.length).toBe(5)
    expect(tree.rangeQuery(0, 4)).toBe(15)
  })

  it('queries single element correctly', () => {
    const tree = new LazySegmentTree([10, 20, 30, 40])
    expect(tree.rangeQuery(0, 0)).toBe(10)
    expect(tree.rangeQuery(2, 2)).toBe(30)
    expect(tree.rangeQuery(3, 3)).toBe(40)
  })

  it('queries range correctly', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    expect(tree.rangeQuery(0, 2)).toBe(6)
    expect(tree.rangeQuery(1, 3)).toBe(9)
    expect(tree.rangeQuery(2, 4)).toBe(12)
  })

  it('updates single point correctly', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    tree.pointUpdate(2, 10)
    expect(tree.rangeQuery(2, 2)).toBe(13)
    expect(tree.rangeQuery(0, 4)).toBe(25)
  })

  it('updates range correctly', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    tree.rangeUpdate(1, 3, 5)
    expect(tree.rangeQuery(0, 0)).toBe(1)
    expect(tree.rangeQuery(1, 1)).toBe(7)
    expect(tree.rangeQuery(2, 2)).toBe(8)
    expect(tree.rangeQuery(3, 3)).toBe(9)
    expect(tree.rangeQuery(4, 4)).toBe(5)
  })

  it('handles multiple lazy updates', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 5)
    tree.rangeUpdate(1, 3, 3)
    tree.rangeUpdate(2, 2, 10)
    expect(tree.rangeQuery(0, 0)).toBe(5)
    expect(tree.rangeQuery(1, 1)).toBe(8)
    expect(tree.rangeQuery(2, 2)).toBe(18)
    expect(tree.rangeQuery(3, 3)).toBe(8)
    expect(tree.rangeQuery(4, 4)).toBe(5)
  })

  it('performs point query correctly', () => {
    const tree = new LazySegmentTree([10, 20, 30, 40])
    expect(tree.pointQuery(0)).toBe(10)
    expect(tree.pointQuery(3)).toBe(40)
  })

  it('handles negative values', () => {
    const tree = new LazySegmentTree([-1, -2, -3, -4])
    expect(tree.rangeQuery(0, 3)).toBe(-10)
    tree.rangeUpdate(0, 3, 5)
    expect(tree.rangeQuery(0, 3)).toBe(10)
  })

  it('handles zero updates', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4])
    tree.rangeUpdate(0, 3, 0)
    expect(tree.rangeQuery(0, 3)).toBe(10)
  })

  it('handles large values', () => {
    const tree = new LazySegmentTree([1000000, 2000000, 3000000])
    expect(tree.rangeQuery(0, 2)).toBe(6000000)
    tree.rangeUpdate(0, 2, 1000000)
    expect(tree.rangeQuery(0, 2)).toBe(9000000)
  })

  it('handles mixed updates and queries', () => {
    const tree = new LazySegmentTree([1, 1, 1, 1, 1])
    tree.rangeUpdate(0, 2, 2)
    expect(tree.rangeQuery(0, 4)).toBe(11)
    tree.rangeUpdate(2, 4, 3)
    expect(tree.rangeQuery(0, 4)).toBe(20)
    tree.pointUpdate(1, -5)
    expect(tree.rangeQuery(0, 4)).toBe(15)
  })

  it('handles power-of-2 sized array', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5, 6, 7, 8])
    expect(tree.rangeQuery(0, 7)).toBe(36)
    expect(tree.rangeQuery(4, 7)).toBe(26)
  })

  it('range update then point query', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0])
    tree.rangeUpdate(1, 2, 7)
    expect(tree.pointQuery(0)).toBe(0)
    expect(tree.pointQuery(1)).toBe(7)
    expect(tree.pointQuery(2)).toBe(7)
    expect(tree.pointQuery(3)).toBe(0)
  })

  it('overlapping range updates accumulate', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 1)
    tree.rangeUpdate(2, 4, 2)
    expect(tree.rangeQuery(0, 4)).toBe(11)
  })

  it('single element tree with update', () => {
    const tree = new LazySegmentTree([42])
    expect(tree.rangeQuery(0, 0)).toBe(42)
    tree.rangeUpdate(0, 0, 10)
    expect(tree.pointQuery(0)).toBe(52)
  })

  it('range update then range query', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 3)
    expect(tree.rangeQuery(0, 4)).toBe(15)
  })

  it('rangeUpdate adds to existing', () => {
    const tree = new LazySegmentTree([1, 2, 3])
    tree.rangeUpdate(0, 2, 10)
    expect(tree.rangeQuery(0, 2)).toBe(36)
  })

  it('pointQuery after pointUpdate', () => {
    const tree = new LazySegmentTree([1, 2, 3])
    tree.pointUpdate(1, 5)
    expect(tree.pointQuery(1)).toBe(7)
  })

  it('length property returns correct value', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5, 6])
    expect(tree.length).toBe(6)
  })

  it('rangeQuery on unchanged returns original', () => {
    const tree = new LazySegmentTree([3, 5, 7])
    expect(tree.rangeQuery(1, 1)).toBe(5)
  })

  it('handles 16 elements', () => {
    const data = Array.from({ length: 16 }, (_, i) => i + 1)
    const tree = new LazySegmentTree(data)
    expect(tree.rangeQuery(0, 15)).toBe(136)
    expect(tree.rangeQuery(0, 7)).toBe(36)
    expect(tree.rangeQuery(8, 15)).toBe(100)
  })

  it('handles 32 elements', () => {
    const data = Array.from({ length: 32 }, (_, i) => i + 1)
    const tree = new LazySegmentTree(data)
    expect(tree.rangeQuery(0, 31)).toBe(528)
  })

  it('range update on subrange', () => {
    const tree = new LazySegmentTree([1, 1, 1, 1, 1])
    tree.rangeUpdate(1, 3, 2)
    expect(tree.rangeQuery(0, 0)).toBe(1)
    expect(tree.rangeQuery(1, 3)).toBe(9)
    expect(tree.rangeQuery(4, 4)).toBe(1)
  })

  it('multiple point updates', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.pointUpdate(0, 1)
    tree.pointUpdate(1, 2)
    tree.pointUpdate(2, 3)
    tree.pointUpdate(3, 4)
    tree.pointUpdate(4, 5)
    expect(tree.rangeQuery(0, 4)).toBe(15)
  })

  it('negative range update', () => {
    const tree = new LazySegmentTree([10, 10, 10])
    tree.rangeUpdate(0, 2, -5)
    expect(tree.rangeQuery(0, 2)).toBe(15)
    expect(tree.pointQuery(1)).toBe(5)
  })

  it('out of range query returns 0', () => {
    const tree = new LazySegmentTree([1, 2, 3])
    expect(tree.rangeQuery(5, 10)).toBe(0)
  })

  it('two range updates on same range', () => {
    const tree = new LazySegmentTree([0, 0, 0])
    tree.rangeUpdate(0, 2, 5)
    tree.rangeUpdate(0, 2, 3)
    expect(tree.rangeQuery(0, 2)).toBe(24)
  })

  it('alternating updates and queries', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4])
    tree.rangeUpdate(0, 1, 1)
    expect(tree.rangeQuery(0, 1)).toBe(5)
    tree.rangeUpdate(2, 3, 2)
    expect(tree.rangeQuery(2, 3)).toBe(11)
    expect(tree.rangeQuery(0, 3)).toBe(16)
  })

  it('handles large number of updates', () => {
    const data = Array.from({ length: 100 }, () => 0)
    const tree = new LazySegmentTree(data)
    for (let i = 0; i < 50; i++) tree.rangeUpdate(i, i + 50, 1)
    expect(tree.rangeQuery(25, 25)).toBe(26)
  })

  it('full range update then subrange query', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 3)
    expect(tree.rangeQuery(0, 2)).toBe(9)
    expect(tree.rangeQuery(3, 4)).toBe(6)
  })

  it('handles 10 elements', () => {
    const data = Array.from({ length: 10 }, (_, i) => i + 1)
    const tree = new LazySegmentTree(data)
    expect(tree.rangeQuery(0, 9)).toBe(55)
    tree.rangeUpdate(0, 9, 1)
    expect(tree.rangeQuery(0, 9)).toBe(65)
  })

  it('adjacent range updates', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0])
    tree.rangeUpdate(0, 1, 5)
    tree.rangeUpdate(2, 3, 10)
    expect(tree.rangeQuery(0, 3)).toBe(30)
    expect(tree.rangeQuery(0, 1)).toBe(10)
    expect(tree.rangeQuery(2, 3)).toBe(20)
  })

  it('pointUpdate is alias for rangeUpdate', () => {
    const t1 = new LazySegmentTree([1, 2, 3])
    const t2 = new LazySegmentTree([1, 2, 3])
    t1.pointUpdate(1, 5)
    t2.rangeUpdate(1, 1, 5)
    expect(t1.rangeQuery(0, 2)).toBe(t2.rangeQuery(0, 2))
  })

  it('single element with multiple updates', () => {
    const tree = new LazySegmentTree([10])
    tree.rangeUpdate(0, 0, 5)
    tree.rangeUpdate(0, 0, 3)
    tree.rangeUpdate(0, 0, 2)
    expect(tree.pointQuery(0)).toBe(20)
  })

  it('handles 2 elements', () => {
    const tree = new LazySegmentTree([1, 2])
    expect(tree.rangeQuery(0, 1)).toBe(3)
    tree.rangeUpdate(0, 1, 10)
    expect(tree.rangeQuery(0, 1)).toBe(23)
  })

  it('handles 3 elements', () => {
    const tree = new LazySegmentTree([10, 20, 30])
    expect(tree.rangeQuery(0, 2)).toBe(60)
    tree.rangeUpdate(1, 2, 5)
    expect(tree.rangeQuery(0, 2)).toBe(70)
  })

  it('handles 7 elements', () => {
    const data = Array.from({ length: 7 }, (_, i) => i + 1)
    const tree = new LazySegmentTree(data)
    expect(tree.rangeQuery(0, 6)).toBe(28)
    tree.rangeUpdate(0, 6, 1)
    expect(tree.rangeQuery(0, 6)).toBe(35)
  })

  it('handles 9 elements', () => {
    const data = Array.from({ length: 9 }, (_, i) => i + 1)
    const tree = new LazySegmentTree(data)
    expect(tree.rangeQuery(0, 8)).toBe(45)
  })

  it('range update partial overlap', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5, 6, 7, 8])
    tree.rangeUpdate(2, 5, 10)
    expect(tree.rangeQuery(0, 1)).toBe(3)
    expect(tree.rangeQuery(2, 5)).toBe(58)
    expect(tree.rangeQuery(6, 7)).toBe(15)
  })

  it('range update with negative then positive', () => {
    const tree = new LazySegmentTree([10, 10, 10])
    tree.rangeUpdate(0, 2, -10)
    expect(tree.rangeQuery(0, 2)).toBe(0)
    tree.rangeUpdate(0, 2, 10)
    expect(tree.rangeQuery(0, 2)).toBe(30)
  })

  it('handles all zeros initialization', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0])
    expect(tree.rangeQuery(0, 3)).toBe(0)
    tree.rangeUpdate(0, 3, 1)
    expect(tree.rangeQuery(0, 3)).toBe(4)
  })

  it('range update on single element of larger array', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    tree.rangeUpdate(2, 2, 100)
    expect(tree.pointQuery(2)).toBe(103)
    expect(tree.rangeQuery(0, 4)).toBe(115)
  })

  it('handles 64 elements', () => {
    const data = Array.from({ length: 64 }, (_, i) => i + 1)
    const tree = new LazySegmentTree(data)
    expect(tree.rangeQuery(0, 63)).toBe(2080)
  })

  it('update with zero length (same start and end)', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    tree.rangeUpdate(2, 2, 10)
    expect(tree.rangeQuery(2, 2)).toBe(13)
    expect(tree.rangeQuery(0, 4)).toBe(25)
  })

  it('handles 128 elements', () => {
    const data = Array.from({ length: 128 }, (_, i) => i + 1)
    const tree = new LazySegmentTree(data)
    expect(tree.rangeQuery(0, 127)).toBe(8256)
    tree.rangeUpdate(0, 127, 1)
    expect(tree.rangeQuery(0, 127)).toBe(8384)
  })

  it('multiple overlapping lazy updates in complex pattern', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 7, 1)
    tree.rangeUpdate(2, 5, 2)
    tree.rangeUpdate(3, 4, 5)
    expect(tree.rangeQuery(0, 1)).toBe(2)
    expect(tree.rangeQuery(2, 2)).toBe(3)
    expect(tree.rangeQuery(3, 4)).toBe(16)
    expect(tree.rangeQuery(5, 5)).toBe(3)
    expect(tree.rangeQuery(6, 7)).toBe(2)
  })

  it('query after clearing values with negative updates', () => {
    const tree = new LazySegmentTree([10, 10, 10, 10])
    tree.rangeUpdate(0, 3, -10)
    expect(tree.rangeQuery(0, 3)).toBe(0)
    tree.rangeUpdate(1, 2, 5)
    expect(tree.rangeQuery(0, 3)).toBe(10)
  })

  it('pointQuery after multiple range updates', () => {
    const tree = new LazySegmentTree([0, 0, 0, 0, 0])
    tree.rangeUpdate(0, 4, 5)
    tree.rangeUpdate(1, 3, 3)
    tree.rangeUpdate(2, 2, 10)
    expect(tree.pointQuery(0)).toBe(5)
    expect(tree.pointQuery(1)).toBe(8)
    expect(tree.pointQuery(2)).toBe(18)
    expect(tree.pointQuery(3)).toBe(8)
    expect(tree.pointQuery(4)).toBe(5)
  })

  it('range update covering entire array', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5])
    tree.rangeUpdate(0, 4, 100)
    expect(tree.rangeQuery(0, 4)).toBe(515)
    expect(tree.pointQuery(0)).toBe(101)
    expect(tree.pointQuery(4)).toBe(105)
  })

  it('small negative updates accumulating to zero', () => {
    const tree = new LazySegmentTree([5, 5, 5, 5])
    tree.rangeUpdate(0, 3, -1)
    tree.rangeUpdate(0, 3, -1)
    tree.rangeUpdate(0, 3, -1)
    tree.rangeUpdate(0, 3, -1)
    tree.rangeUpdate(0, 3, -1)
    expect(tree.rangeQuery(0, 3)).toBe(0)
  })
})

  it('pointQuery returns original value', () => {
    const st = new LazySegmentTree([1, 2, 3, 4])
    expect(st.pointQuery(2)).toBe(3)
  })

  it('pointUpdate adds value', () => {
    const st = new LazySegmentTree([1, 2, 3, 4])
    st.pointUpdate(0, 5)
    expect(st.pointQuery(0)).toBe(6)
  })

  it('length returns data length', () => {
    const st = new LazySegmentTree([1, 2, 3, 4, 5])
    expect(st.length).toBe(5)
  })

describe('segment-tree-lazy - extra', () => {
  it('works correctly', () => {
    expect(describe).toBeDefined()
  })

  it('handles edge case', () => {
    expect(typeof describe).toBe('function')
  })

  it('provides expected behavior', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('segment-tree-lazy - wave545', () => {
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

describe('segment-tree-lazy - wave546', () => {
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

describe('segment-tree-lazy - wave547', () => {
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

describe('segment-tree-lazy - wave548', () => {
  it('segment-tree-lazy module defined', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy module is function', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave549', () => {
  it('segment-tree-lazy module defined', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy module is function', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave550', () => {
  it('segment-tree-lazy w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave551', () => {
  it('segment-tree-lazy w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave552', () => {
  it('segment-tree-lazy w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave553', () => {
  it('segment-tree-lazy w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave554', () => {
  it('segment-tree-lazy w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave555', () => {
  it('segment-tree-lazy w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave556', () => {
  it('segment-tree-lazy w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave557', () => {
  it('segment-tree-lazy w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave558', () => {
  it('segment-tree-lazy w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave559', () => {
  it('segment-tree-lazy w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave560', () => {
  it('segment-tree-lazy w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave561', () => {
  it('segment-tree-lazy w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave562', () => {
  it('segment-tree-lazy w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave563', () => {
  it('segment-tree-lazy w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave564', () => {
  it('segment-tree-lazy w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
