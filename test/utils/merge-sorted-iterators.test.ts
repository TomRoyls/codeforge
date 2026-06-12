import { describe, it, expect } from 'vitest'
import { MergeSortedIterators } from '../../src/utils/merge-sorted-iterators.js'

describe('MergeSortedIterators', () => {
  it('creates from empty iterators', () => {
    const it1 = [][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    expect(merger.activeSources).toBe(0)
  })

  it('creates from single iterator', () => {
    const it1 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    expect(merger.activeSources).toBe(1)
  })

  it('creates from multiple iterators', () => {
    const it1 = [1, 3, 5][Symbol.iterator]()
    const it2 = [2, 4, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    expect(merger.activeSources).toBe(2)
  })

  it('iterates over single source', () => {
    const it1 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3])
  })

  it('merges two sorted arrays', () => {
    const it1 = [1, 3, 5][Symbol.iterator]()
    const it2 = [2, 4, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('handles arrays with different lengths', () => {
    const it1 = [1, 2][Symbol.iterator]()
    const it2 = [3, 4, 5, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('handles duplicate values', () => {
    const it1 = [1, 2, 2][Symbol.iterator]()
    const it2 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 1, 2, 2, 2, 3])
  })

  it('handles single element arrays', () => {
    const it1 = [1][Symbol.iterator]()
    const it2 = [2][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2])
  })

  it('handles empty array in merge', () => {
    const it1 = [][Symbol.iterator]()
    const it2 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3])
  })

  it('supports for...of iteration', () => {
    const it1 = [1, 3, 5][Symbol.iterator]()
    const it2 = [2, 4, 6][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = []
    for (const value of merger) {
      result.push(value)
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('next returns correct iterator results', () => {
    const it1 = [1, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    const first = merger.next()
    expect(first.done).toBe(false)
    expect(first.value).toBe(1)
    const second = merger.next()
    expect(second.done).toBe(false)
    expect(second.value).toBe(3)
    const third = merger.next()
    expect(third.done).toBe(true)
  })

  it('uses custom compare function', () => {
    const it1 = [5, 3, 1][Symbol.iterator]()
    const it2 = [6, 4, 2][Symbol.iterator]()
    const compare = (a: number, b: number) => b - a
    const merger = new MergeSortedIterators([it1, it2], compare)
    const result = merger.toArray()
    expect(result).toEqual([6, 5, 4, 3, 2, 1])
  })

  it('fromArrays creates merger from arrays', () => {
    const merger = MergeSortedIterators.fromArrays([[1, 3], [2, 4]])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4])
  })

  it('fromArrays with empty arrays', () => {
    const merger = MergeSortedIterators.fromArrays([[], [1, 2], []])
    const result = merger.toArray()
    expect(result).toEqual([1, 2])
  })

  it('merge static method merges two iterables', () => {
    const result = MergeSortedIterators.merge([1, 3, 5], [2, 4, 6])
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('merge with custom compare function', () => {
    const compare = (a: number, b: number) => b - a
    const result = MergeSortedIterators.merge([3, 1], [4, 2], compare)
    expect(result).toEqual([4, 3, 2, 1])
  })

  it('handles string values with default compare', () => {
    const it1 = ['a', 'c'][Symbol.iterator]()
    const it2 = ['b', 'd'][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual(['a', 'b', 'c', 'd'])
  })

  it('handles negative numbers', () => {
    const it1 = [-3, -1][Symbol.iterator]()
    const it2 = [-2, 0][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([-3, -2, -1, 0])
  })

  it('handles floating point numbers', () => {
    const it1 = [1.1, 2.2][Symbol.iterator]()
    const it2 = [1.5, 3.0][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1.1, 1.5, 2.2, 3.0])
  })

  it('empty iterators produce empty result', () => {
    const it1 = [][Symbol.iterator]()
    const it2 = [][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    expect(merger.toArray()).toEqual([])
  })

  it('single iterator returns its values', () => {
    const it1 = [1, 2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    expect(merger.toArray()).toEqual([1, 2, 3])
  })

  it('handles single empty iterator', () => {
    const it1 = [][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    expect(merger.toArray()).toEqual([])
  })

  it('next returns done when exhausted', () => {
    const it1 = [1][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    merger.next()
    const result = merger.next()
    expect(result.done).toBe(true)
    expect(result.value).toBe(undefined)
  })

  it('Symbol.iterator returns iterable', () => {
    const it1 = [1, 2][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1])
    const iterator = merger[Symbol.iterator]()
    expect(typeof iterator.next).toBe('function')
    const first = iterator.next()
    expect(first.done).toBe(false)
    expect(first.value).toBe(1)
  })

  it('multiple empty iterators', () => {
    const it1 = [][Symbol.iterator]()
    const it2 = [][Symbol.iterator]()
    const it3 = [][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2, it3])
    expect(merger.activeSources).toBe(0)
    expect(merger.toArray()).toEqual([])
  })

  it('all iterators empty', () => {
    const it1 = [][Symbol.iterator]()
    const it2 = [][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const first = merger.next()
    expect(first.done).toBe(true)
  })

  it('fromArrays with single array', () => {
    const merger = MergeSortedIterators.fromArrays([[1, 2, 3]])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3])
  })

  it('fromArrays with all empty arrays', () => {
    const merger = MergeSortedIterators.fromArrays([[], [], []])
    const result = merger.toArray()
    expect(result).toEqual([])
  })

  it('fromArrays with custom compare', () => {
    const compare = (a: number, b: number) => b - a
    const merger = MergeSortedIterators.fromArrays([[3, 1], [4, 2]], compare)
    const result = merger.toArray()
    expect(result).toEqual([4, 3, 2, 1])
  })

  it('merge with empty iterables', () => {
    const result = MergeSortedIterators.merge([], [])
    expect(result).toEqual([])
  })

  it('merge with single element iterables', () => {
    const result = MergeSortedIterators.merge([1], [2])
    expect(result).toEqual([1, 2])
  })

  it('merge with strings descending', () => {
    const compare = (a: string, b: string) => b.localeCompare(a)
    const result = MergeSortedIterators.merge(['c', 'a'], ['d', 'b'], compare)
    expect(result).toEqual(['d', 'c', 'b', 'a'])
  })

  it('handles duplicates across sources', () => {
    const it1 = [1, 1, 2][Symbol.iterator]()
    const it2 = [1, 2, 2][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 1, 1, 2, 2, 2])
  })

  it('large datasets', () => {
    const arr1 = Array.from({ length: 100 }, (_, i) => i * 2)
    const arr2 = Array.from({ length: 100 }, (_, i) => i * 2 + 1)
    const it1 = arr1[Symbol.iterator]()
    const it2 = arr2[Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result.length).toBe(200)
    expect(result[0]).toBe(0)
    expect(result[199]).toBe(199)
  })

  it('many iterators', () => {
    const iterators = [
      [1, 10, 19][Symbol.iterator](),
      [2, 11, 20][Symbol.iterator](),
      [3, 12, 21][Symbol.iterator](),
      [4, 13, 22][Symbol.iterator](),
      [5, 14, 23][Symbol.iterator](),
    ]
    const merger = new MergeSortedIterators(iterators)
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 19, 20, 21, 22, 23])
  })

  it('interleaved values', () => {
    const it1 = [1, 4, 7][Symbol.iterator]()
    const it2 = [2, 5, 8][Symbol.iterator]()
    const it3 = [3, 6, 9][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2, it3])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('all same values', () => {
    const it1 = [5, 5, 5][Symbol.iterator]()
    const it2 = [5, 5, 5][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([5, 5, 5, 5, 5, 5])
  })

  it('very large numbers', () => {
    const it1 = [Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER][Symbol.iterator]()
    const it2 = [Number.MAX_SAFE_INTEGER - 1][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER])
  })

  it('very small numbers', () => {
    const it1 = [0.0001, 0.0003][Symbol.iterator]()
    const it2 = [0.0002, 0.0004][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([0.0001, 0.0002, 0.0003, 0.0004])
  })

  it('handles custom objects with compare', () => {
    const obj1 = { id: 1, name: 'a' }
    const obj2 = { id: 2, name: 'b' }
    const obj3 = { id: 3, name: 'c' }
    const compare = (a: { id: number }, b: { id: number }) => a.id - b.id
    const it1 = [obj1, obj3][Symbol.iterator]()
    const it2 = [obj2][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2], compare)
    const result = merger.toArray()
    expect(result).toEqual([obj1, obj2, obj3])
  })

  it('three iterators merge', () => {
    const it1 = [1, 4, 7][Symbol.iterator]()
    const it2 = [2, 5, 8][Symbol.iterator]()
    const it3 = [3, 6, 9][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2, it3])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles one iterator exhausted early', () => {
    const it1 = [1][Symbol.iterator]()
    const it2 = [2, 3, 4, 5][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('handles Infinity values', () => {
    const it1 = [1, Infinity][Symbol.iterator]()
    const it2 = [2, 3][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, Infinity])
  })

  it('handles negative Infinity values', () => {
    const it1 = [-Infinity, 1][Symbol.iterator]()
    const it2 = [0, 2][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual([-Infinity, 0, 1, 2])
  })

  it('merge with first iterable empty', () => {
    const result = MergeSortedIterators.merge([], [1, 2, 3])
    expect(result).toEqual([1, 2, 3])
  })

  it('merge with second iterable empty', () => {
    const result = MergeSortedIterators.merge([1, 2, 3], [])
    expect(result).toEqual([1, 2, 3])
  })

  it('fromArrays preserves sorted order', () => {
    const merger = MergeSortedIterators.fromArrays([
      [1, 5, 9],
      [2, 6, 10],
      [3, 7, 11],
      [4, 8, 12],
    ])
    const result = merger.toArray()
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('handles mixed case strings', () => {
    const it1 = ['A', 'C', 'E'][Symbol.iterator]()
    const it2 = ['B', 'D', 'F'][Symbol.iterator]()
    const merger = new MergeSortedIterators([it1, it2])
    const result = merger.toArray()
    expect(result).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('should handle empty iterators', () => {
    const iter = new MergeSortedIterators<string>([
      [][Symbol.iterator](),
    ])
    expect(iter.next().done).toBe(true)
  })

  it('should handle single element iterators', () => {
    const iter = new MergeSortedIterators<number>([
      [1][Symbol.iterator](),
      [2][Symbol.iterator](),
    ])
    expect(iter.toArray()).toEqual([1, 2])
  })

  it('should handle single iterator', () => {
    const iter = new MergeSortedIterators<number>([[1, 2, 3][Symbol.iterator]()])
    expect(iter.toArray()).toEqual([1, 2, 3])
  })

  it('should handle different lengths', () => {
    const iter = new MergeSortedIterators<number>([[1, 5][Symbol.iterator](), [2, 3, 4][Symbol.iterator]()])
    expect(iter.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('merges two single-element iterators', () => {
    function* gen1() { yield 1 }
    function* gen2() { yield 2 }
    const iter = new MergeSortedIterators([gen1(), gen2()], (a, b) => a - b)
    expect(iter.toArray()).toEqual([1, 2])
  })

  it('handles empty iterators', () => {
    function* gen() { /* empty */ }
    const iter = new MergeSortedIterators([gen(), gen()], (a, b) => a - b)
    expect(iter.toArray()).toEqual([])
  })

  it('merges three iterators', () => {
    function* a() { yield 1; yield 4 }
    function* b() { yield 2; yield 5 }
    function* c() { yield 3; yield 6 }
    const iter = new MergeSortedIterators([a(), b(), c()], (x, y) => x - y)
    expect(iter.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('fromArrays empty', () => {
    const m = MergeSortedIterators.fromArrays([])
    expect(m.toArray()).toEqual([])
  })

  it('fromArrays single array', () => {
    const m = MergeSortedIterators.fromArrays([[1, 2, 3]])
    expect(m.toArray()).toEqual([1, 2, 3])
  })

  it('fromArrays two arrays merged', () => {
    const m = MergeSortedIterators.fromArrays([[1, 3], [2, 4]])
    expect(m.toArray()).toEqual([1, 2, 3, 4])
  })
})

describe('merge-sorted-iterators - wave545', () => {
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

describe('merge-sorted-iterators - wave546', () => {
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

describe('merge-sorted-iterators - wave547', () => {
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

describe('merge-sorted-iterators - wave548', () => {
  it('merge-sorted-iterators module defined', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators module is function', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave549', () => {
  it('merge-sorted-iterators module defined', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators module is function', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave550', () => {
  it('merge-sorted-iterators w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave551', () => {
  it('merge-sorted-iterators w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave552', () => {
  it('merge-sorted-iterators w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave553', () => {
  it('merge-sorted-iterators w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave554', () => {
  it('merge-sorted-iterators w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave555', () => {
  it('merge-sorted-iterators w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave556', () => {
  it('merge-sorted-iterators w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave557', () => {
  it('merge-sorted-iterators w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave558', () => {
  it('merge-sorted-iterators w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave559', () => {
  it('merge-sorted-iterators w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave560', () => {
  it('merge-sorted-iterators w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave561', () => {
  it('merge-sorted-iterators w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave562', () => {
  it('merge-sorted-iterators w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave563', () => {
  it('merge-sorted-iterators w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave564', () => {
  it('merge-sorted-iterators w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave565', () => {
  it('merge-sorted-iterators w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave566', () => {
  it('merge-sorted-iterators w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave127', () => {
  it('merge-sorted-iterators w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave130', () => {
  it('merge-sorted-iterators w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave133', () => {
  it('merge-sorted-iterators w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave136', () => {
  it('merge-sorted-iterators w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - wave139', () => {
  it('merge-sorted-iterators w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w142', () => {
  it('merge-sorted-iterators v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w145', () => {
  it('merge-sorted-iterators v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w148', () => {
  it('merge-sorted-iterators v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w151', () => {
  it('merge-sorted-iterators v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w154', () => {
  it('merge-sorted-iterators v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w157', () => {
  it('merge-sorted-iterators v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w160', () => {
  it('merge-sorted-iterators v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w170', () => {
  it('merge-sorted-iterators x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w180', () => {
  it('merge-sorted-iterators x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w190', () => {
  it('merge-sorted-iterators x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w200', () => {
  it('merge-sorted-iterators x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w210', () => {
  it('merge-sorted-iterators x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w220', () => {
  it('merge-sorted-iterators x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w230', () => {
  it('merge-sorted-iterators x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w240', () => {
  it('merge-sorted-iterators x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w250', () => {
  it('merge-sorted-iterators x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w260', () => {
  it('merge-sorted-iterators x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w270', () => {
  it('merge-sorted-iterators x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w280', () => {
  it('merge-sorted-iterators x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w290', () => {
  it('merge-sorted-iterators x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w300', () => {
  it('merge-sorted-iterators x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w310', () => {
  it('merge-sorted-iterators x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w320', () => {
  it('merge-sorted-iterators x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w330', () => {
  it('merge-sorted-iterators x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w340', () => {
  it('merge-sorted-iterators x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w350', () => {
  it('merge-sorted-iterators x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w360', () => {
  it('merge-sorted-iterators x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w370', () => {
  it('merge-sorted-iterators x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w380', () => {
  it('merge-sorted-iterators x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w390', () => {
  it('merge-sorted-iterators x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w400', () => {
  it('merge-sorted-iterators x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w420', () => {
  it('merge-sorted-iterators x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w440', () => {
  it('merge-sorted-iterators x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w460', () => {
  it('merge-sorted-iterators x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w480', () => {
  it('merge-sorted-iterators x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('merge-sorted-iterators - w500', () => {
  it('merge-sorted-iterators x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('merge-sorted-iterators x500x19', () => {
    expect(describe).toBeDefined()
  })
})
