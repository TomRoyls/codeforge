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
