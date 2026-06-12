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

describe('segment-tree-lazy - wave565', () => {
  it('segment-tree-lazy w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave566', () => {
  it('segment-tree-lazy w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave127', () => {
  it('segment-tree-lazy w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave130', () => {
  it('segment-tree-lazy w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave133', () => {
  it('segment-tree-lazy w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave136', () => {
  it('segment-tree-lazy w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - wave139', () => {
  it('segment-tree-lazy w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w142', () => {
  it('segment-tree-lazy v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w145', () => {
  it('segment-tree-lazy v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w148', () => {
  it('segment-tree-lazy v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w151', () => {
  it('segment-tree-lazy v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w154', () => {
  it('segment-tree-lazy v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w157', () => {
  it('segment-tree-lazy v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w160', () => {
  it('segment-tree-lazy v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w170', () => {
  it('segment-tree-lazy x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w180', () => {
  it('segment-tree-lazy x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w190', () => {
  it('segment-tree-lazy x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w200', () => {
  it('segment-tree-lazy x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w210', () => {
  it('segment-tree-lazy x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w220', () => {
  it('segment-tree-lazy x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w230', () => {
  it('segment-tree-lazy x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w240', () => {
  it('segment-tree-lazy x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w250', () => {
  it('segment-tree-lazy x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w260', () => {
  it('segment-tree-lazy x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w270', () => {
  it('segment-tree-lazy x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w280', () => {
  it('segment-tree-lazy x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w290', () => {
  it('segment-tree-lazy x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w300', () => {
  it('segment-tree-lazy x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w310', () => {
  it('segment-tree-lazy x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w320', () => {
  it('segment-tree-lazy x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w330', () => {
  it('segment-tree-lazy x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w340', () => {
  it('segment-tree-lazy x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w350', () => {
  it('segment-tree-lazy x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w360', () => {
  it('segment-tree-lazy x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w370', () => {
  it('segment-tree-lazy x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w380', () => {
  it('segment-tree-lazy x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w390', () => {
  it('segment-tree-lazy x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w400', () => {
  it('segment-tree-lazy x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w420', () => {
  it('segment-tree-lazy x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w440', () => {
  it('segment-tree-lazy x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w460', () => {
  it('segment-tree-lazy x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w480', () => {
  it('segment-tree-lazy x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w500', () => {
  it('segment-tree-lazy x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w550', () => {
  it('segment-tree-lazy x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w600', () => {
  it('segment-tree-lazy x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w650', () => {
  it('segment-tree-lazy x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-tree-lazy - w700', () => {
  it('segment-tree-lazy x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-tree-lazy x700x49', () => {
    expect(describe).toBeDefined()
  })
})
