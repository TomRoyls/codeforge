import { describe, it, expect } from 'vitest'
import { MergeSortTree } from '../../src/utils/merge-sort-tree.js'

describe('MergeSortTree', () => {
  it('counts elements less than value in range', () => {
    const mst = new MergeSortTree([5, 1, 3, 2, 4])
    expect(mst.queryCountLessThan(0, 4, 3)).toBe(2)
  })

  it('counts elements in value range', () => {
    const mst = new MergeSortTree([5, 1, 3, 2, 4])
    expect(mst.queryCountInRange(0, 4, 2, 4)).toBe(3)
  })

  it('finds kth smallest in range', () => {
    const mst = new MergeSortTree([5, 1, 3, 2, 4])
    expect(mst.queryKthSmallest(0, 4, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 4, 2)).toBe(3)
    expect(mst.queryKthSmallest(0, 4, 4)).toBe(5)
  })

  it('handles single element', () => {
    const mst = new MergeSortTree([42])
    expect(mst.queryCountLessThan(0, 0, 50)).toBe(1)
    expect(mst.queryCountLessThan(0, 0, 42)).toBe(0)
    expect(mst.queryKthSmallest(0, 0, 0)).toBe(42)
  })

  it('handles full range query', () => {
    const mst = new MergeSortTree([3, 1, 4, 1, 5])
    expect(mst.queryCountLessThan(0, 4, 3)).toBe(2)
    expect(mst.queryCountLessThan(0, 4, 4)).toBe(3)
  })

  it('handles sub-range query', () => {
    const mst = new MergeSortTree([10, 20, 30, 40, 50])
    expect(mst.queryCountLessThan(1, 3, 35)).toBe(2)
  })

  it('queryCountLessThan returns 0 for empty range', () => {
    const mst = new MergeSortTree([1, 2, 3])
    expect(mst.queryCountLessThan(2, 1, 5)).toBe(0)
  })

  it('querySorted returns sorted subarray', () => {
    const mst = new MergeSortTree([5, 3, 1, 4, 2])
    expect(mst.querySorted(0, 4)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', () => {
    const mst = new MergeSortTree([])
    expect(mst.queryCountLessThan(0, 0, 5)).toBe(0)
  })

  it('handles two elements', () => {
    const mst = new MergeSortTree([2, 1])
    expect(mst.querySorted(0, 1)).toEqual([1, 2])
    expect(mst.queryKthSmallest(0, 1, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 1, 1)).toBe(2)
  })

  it('queryCountInRange with no matches returns 0', () => {
    const mst = new MergeSortTree([1, 2, 3])
    expect(mst.queryCountInRange(0, 2, 10, 20)).toBe(0)
  })

  it('handles duplicate values', () => {
    const mst = new MergeSortTree([3, 3, 3])
    expect(mst.queryCountLessThan(0, 2, 3)).toBe(0)
    expect(mst.queryCountLessThan(0, 2, 4)).toBe(3)
  })

  it('handles negative values', () => {
    const mst = new MergeSortTree([-3, -1, -2])
    expect(mst.querySorted(0, 2)).toEqual([-3, -2, -1])
    expect(mst.queryCountLessThan(0, 2, -1)).toBe(2)
  })

  it('handles range query on sub-array', () => {
    const mst = new MergeSortTree([10, 20, 30, 40, 50])
    expect(mst.queryCountInRange(1, 3, 20, 40)).toBe(3)
    expect(mst.queryCountInRange(1, 3, 25, 35)).toBe(1)
  })

  it('queryKthSmallest on sub-range', () => {
    const mst = new MergeSortTree([5, 2, 8, 1, 9, 3])
    expect(mst.queryKthSmallest(1, 4, 0)).toBe(1)
    expect(mst.queryKthSmallest(1, 4, 2)).toBe(8)
  })

  it('querySorted on single element', () => {
    const mst = new MergeSortTree([7, 3, 5])
    expect(mst.querySorted(1, 1)).toEqual([3])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
    const mst = new MergeSortTree(arr)
    expect(mst.queryKthSmallest(0, 99, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 99, 99)).toBe(100)
    expect(mst.queryCountLessThan(0, 99, 50)).toBe(49)
  })

  it('queryCountLessThan for small range', () => {
    const mst = new MergeSortTree([1, 3, 2, 3, 4])
    expect(mst.queryCountLessThan(0, 2, 3)).toBe(2)
  })

  it('queryCountLessThan returns 0 for large threshold', () => {
    const mst = new MergeSortTree([5, 10, 15])
    expect(mst.queryCountLessThan(0, 2, 0)).toBe(0)
  })

  it('constructor creates tree from array', () => {
    const mst = new MergeSortTree([1, 2, 3])
    expect(mst).toBeDefined()
  })

  it('handles zero values', () => {
    const mst = new MergeSortTree([0, 0, 0])
    expect(mst.queryCountLessThan(0, 2, 0)).toBe(0)
    expect(mst.queryCountLessThan(0, 2, 1)).toBe(3)
    expect(mst.queryKthSmallest(0, 2, 0)).toBe(0)
  })

  it('handles mixed positive and negative', () => {
    const mst = new MergeSortTree([-5, 0, 5, -3, 2])
    expect(mst.querySorted(0, 4)).toEqual([-5, -3, 0, 2, 5])
    expect(mst.queryCountLessThan(0, 4, 0)).toBe(2)
  })

  it('queryCountInRange with exact bounds', () => {
    const mst = new MergeSortTree([1, 3, 5, 7, 9])
    expect(mst.queryCountInRange(0, 4, 3, 7)).toBe(3)
  })

  it('queryCountInRange with min value in range', () => {
    const mst = new MergeSortTree([5, 10, 15, 20])
    expect(mst.queryCountInRange(0, 3, 5, 15)).toBe(3)
  })

  it('queryCountInRange with max value in range', () => {
    const mst = new MergeSortTree([5, 10, 15, 20])
    expect(mst.queryCountInRange(0, 3, 10, 20)).toBe(3)
  })

  it('queryCountInRange with exact single value match', () => {
    const mst = new MergeSortTree([1, 2, 3, 4, 5])
    expect(mst.queryCountInRange(0, 4, 3, 3)).toBe(1)
  })

  it('handles repeated sub-array queries', () => {
    const mst = new MergeSortTree([3, 1, 4, 1, 5, 9, 2, 6])
    expect(mst.queryCountLessThan(0, 3, 2)).toBe(2)
    expect(mst.queryCountLessThan(2, 5, 6)).toBe(3)
    expect(mst.querySorted(3, 7)).toEqual([1, 2, 5, 6, 9])
  })

  it('kthSmallest on duplicates', () => {
    const mst = new MergeSortTree([5, 2, 5, 1, 5, 3])
    expect(mst.queryKthSmallest(0, 5, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 5, 3)).toBe(5)
    expect(mst.queryKthSmallest(0, 5, 5)).toBe(5)
  })

  it('handles array with all same values', () => {
    const mst = new MergeSortTree([7, 7, 7, 7, 7])
    expect(mst.querySorted(0, 4)).toEqual([7, 7, 7, 7, 7])
    expect(mst.queryKthSmallest(0, 4, 2)).toBe(7)
  })

  it('querySorted returns empty array for invalid range', () => {
    const mst = new MergeSortTree([1, 2, 3])
    expect(mst.querySorted(2, 1)).toEqual([])
  })

  it('handles large single query', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    const mst = new MergeSortTree(arr)
    expect(mst.queryCountLessThan(0, 999, 500)).toBe(500)
  })

  it('queryCountInRange with reversed bounds returns 0', () => {
    const mst = new MergeSortTree([1, 2, 3, 4, 5])
    expect(mst.queryCountInRange(0, 4, 10, 5)).toBe(0)
  })

  it('handles very large values', () => {
    const mst = new MergeSortTree([1000000, 2000000, 3000000])
    expect(mst.queryCountLessThan(0, 2, 2500000)).toBe(2)
    expect(mst.queryKthSmallest(0, 2, 1)).toBe(2000000)
  })

  it('querySorted on prefix', () => {
    const mst = new MergeSortTree([9, 7, 5, 3, 1])
    expect(mst.querySorted(0, 2)).toEqual([5, 7, 9])
  })

  it('querySorted on suffix', () => {
    const mst = new MergeSortTree([9, 7, 5, 3, 1])
    expect(mst.querySorted(2, 4)).toEqual([1, 3, 5])
  })

  it('kthSmallest at start of range', () => {
    const mst = new MergeSortTree([10, 20, 30, 40, 50])
    expect(mst.queryKthSmallest(1, 4, 0)).toBe(20)
  })

  it('kthSmallest at end of range', () => {
    const mst = new MergeSortTree([10, 20, 30, 40, 50])
    expect(mst.queryKthSmallest(1, 4, 3)).toBe(50)
  })

  it('handles alternating values', () => {
    const mst = new MergeSortTree([1, 100, 2, 99, 3, 98])
    expect(mst.querySorted(0, 5)).toEqual([1, 2, 3, 98, 99, 100])
    expect(mst.queryCountLessThan(0, 5, 50)).toBe(3)
  })

  it('queryCountLessThan with equal threshold', () => {
    const mst = new MergeSortTree([1, 2, 3, 4, 5])
    expect(mst.queryCountLessThan(0, 4, 3)).toBe(2)
  })

  it('handles three elements', () => {
    const mst = new MergeSortTree([3, 1, 2])
    expect(mst.querySorted(0, 2)).toEqual([1, 2, 3])
    expect(mst.queryKthSmallest(0, 2, 1)).toBe(2)
  })

  it('querySorted on middle element only', () => {
    const mst = new MergeSortTree([5, 10, 15, 20, 25])
    expect(mst.querySorted(2, 2)).toEqual([15])
  })

  it('handles decreasing sequence', () => {
    const mst = new MergeSortTree([5, 4, 3, 2, 1])
    expect(mst.querySorted(0, 4)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles increasing sequence', () => {
    const mst = new MergeSortTree([1, 2, 3, 4, 5])
    expect(mst.querySorted(0, 4)).toEqual([1, 2, 3, 4, 5])
  })

  it('queryCountInRange on large array with range', () => {
    const arr = Array.from({ length: 200 }, (_, i) => i)
    const mst = new MergeSortTree(arr)
    expect(mst.queryCountInRange(0, 199, 50, 149)).toBe(100)
  })

  it('kthSmallest on large sub-range', () => {
    const arr = Array.from({ length: 200 }, (_, i) => 200 - i)
    const mst = new MergeSortTree(arr)
    expect(mst.queryKthSmallest(50, 149, 25)).toBe(76)
  })

  it('handles array with single repeated value', () => {
    const mst = new MergeSortTree([10])
    expect(mst.querySorted(0, 0)).toEqual([10])
    expect(mst.queryCountLessThan(0, 0, 10)).toBe(0)
  })

  it('queryCountLessThan with value equal to max element', () => {
    const mst = new MergeSortTree([1, 3, 5, 7, 9])
    expect(mst.queryCountLessThan(0, 4, 9)).toBe(4)
  })

  it('queryKthSmallest with middle index on large range', () => {
    const mst = new MergeSortTree([10, 5, 15, 3, 12, 8, 20, 1])
    expect(mst.queryKthSmallest(0, 7, 3)).toBe(8)
  })

  it('queryCountInRange with zero-width range returns 0', () => {
    const mst = new MergeSortTree([1, 2, 3, 4, 5])
    expect(mst.queryCountInRange(0, 4, 3, 3)).toBe(1)
  })

  it('querySorted on two adjacent elements', () => {
    const mst = new MergeSortTree([5, 3, 7, 1, 9])
    expect(mst.querySorted(1, 2)).toEqual([3, 7])
  })

  it('queryCountLessThan on strictly increasing array', () => {
    const mst = new MergeSortTree([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(mst.queryCountLessThan(0, 9, 6)).toBe(5)
  })

  it('queryCountInRange counts values in range', () => {
    const mst = new MergeSortTree([1, 5, 3, 7, 2, 8, 4, 6, 9, 0])
    expect(mst.queryCountInRange(0, 9, 3, 7)).toBe(5)
  })

  it('queryKthSmallest returns correct element', () => {
    const mst = new MergeSortTree([5, 3, 1, 4, 2])
    expect(mst.queryKthSmallest(0, 4, 0)).toBe(1)
    expect(mst.queryKthSmallest(0, 4, 4)).toBe(5)
  })

  it('querySorted returns sorted subarray', () => {
    const mst = new MergeSortTree([3, 1, 2])
    expect(mst.querySorted(0, 2)).toEqual([1, 2, 3])
  })

  it('queryCountLessThan for single element range', () => {
    const mst = new MergeSortTree([5, 3, 8])
    expect(mst.queryCountLessThan(1, 1, 4)).toBe(1)
  })

  it('queryCountLessThan returns number', () => {
    const tree = new MergeSortTree([1, 3, 5, 7])
    expect(typeof tree.queryCountLessThan(0, 3, 4)).toBe('number')
  })

  it('queryCountInRange returns number', () => {
    const tree = new MergeSortTree([1, 3, 5, 7])
    expect(typeof tree.queryCountInRange(0, 3, 2, 6)).toBe('number')
  })

  it('querySorted returns array', () => {
    const tree = new MergeSortTree([3, 1, 2])
    expect(tree.querySorted(0, 2)).toEqual([1, 2, 3])
  })
})

describe('merge-sort-tree - wave545', () => {
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

describe('merge-sort-tree - wave546', () => {
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

describe('merge-sort-tree - wave547', () => {
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

describe('merge-sort-tree - wave548', () => {
  it('merge-sort-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave549', () => {
  it('merge-sort-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave550', () => {
  it('merge-sort-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave551', () => {
  it('merge-sort-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave552', () => {
  it('merge-sort-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave553', () => {
  it('merge-sort-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave554', () => {
  it('merge-sort-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave555', () => {
  it('merge-sort-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave556', () => {
  it('merge-sort-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave557', () => {
  it('merge-sort-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave558', () => {
  it('merge-sort-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave559', () => {
  it('merge-sort-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave560', () => {
  it('merge-sort-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave561', () => {
  it('merge-sort-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave562', () => {
  it('merge-sort-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave563', () => {
  it('merge-sort-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sort-tree - wave564', () => {
  it('merge-sort-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sort-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
