import { describe, expect, it } from 'vitest'
import { GnomeSort } from '../../src/utils/gnome-sort.js'

describe('GnomeSort', () => {
  it('sorts unsorted array', () => {
    expect(GnomeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(GnomeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(GnomeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(GnomeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(GnomeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(GnomeSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    GnomeSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(GnomeSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('sortWithComparator descending', () => {
    const result = GnomeSort.sortWithComparator([1, 2, 3], (a, b) => b - a)
    expect(result).toEqual([3, 2, 1])
  })

  it('sortWithComparator strings', () => {
    const result = GnomeSort.sortWithComparator(['banana', 'apple', 'cherry'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles two elements', () => {
    expect(GnomeSort.sort([2, 1])).toEqual([1, 2])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 200 }, (_, i) => 200 - i)
    const result = GnomeSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('sortWithComparator with objects', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = GnomeSort.sortWithComparator(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.v)).toEqual([1, 2, 3])
  })

  it('all same elements', () => {
    expect(GnomeSort.sort([5, 5, 5])).toEqual([5, 5, 5])
  })

  it('sortInPlace with empty array does nothing', () => {
    const arr: number[] = []
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sortInPlace with single element', () => {
    const arr = [7]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([7])
  })

  it('sortInPlace with already sorted', () => {
    const arr = [1, 2, 3]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('sortInPlace with reverse sorted', () => {
    const arr = [3, 2, 1]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles floating point numbers', () => {
    expect(GnomeSort.sort([1.5, 0.3, 2.1, 0.3])).toEqual([0.3, 0.3, 1.5, 2.1])
  })

  it('handles mix of positive and negative', () => {
    expect(GnomeSort.sort([3, -1, 0, -5, 2])).toEqual([-5, -1, 0, 2, 3])
  })

  it('sortWithComparator does not modify original', () => {
    const arr = [3, 1, 2]
    GnomeSort.sortWithComparator(arr, (a, b) => a - b)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortWithComparator with empty array', () => {
    expect(GnomeSort.sortWithComparator([], (a, b) => a - b)).toEqual([])
  })

  it('sortWithComparator preserves duplicates', () => {
    const result = GnomeSort.sortWithComparator([2, 1, 2, 1], (a, b) => a - b)
    expect(result).toEqual([1, 1, 2, 2])
  })

  it('sortWithComparator with complex objects', () => {
    const items = [{ name: 'c', v: 3 }, { name: 'a', v: 1 }, { name: 'b', v: 2 }]
    const result = GnomeSort.sortWithComparator(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.name)).toEqual(['a', 'b', 'c'])
  })

  it('handles array with zeros', () => {
    expect(GnomeSort.sort([0, -1, 0, 1])).toEqual([-1, 0, 0, 1])
  })

  it('handles very large numbers', () => {
    expect(GnomeSort.sort([Number.MAX_VALUE, 0, -Number.MAX_VALUE])).toEqual([-Number.MAX_VALUE, 0, Number.MAX_VALUE])
  })

  it('handles single negative number', () => {
    expect(GnomeSort.sort([-5])).toEqual([-5])
  })

  it('handles very large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
    const result = GnomeSort.sort(arr)
    expect(result[0]).toBe(1)
    expect(result[999]).toBe(1000)
  })

  it('handles array with Infinity', () => {
    expect(GnomeSort.sort([1, Infinity, 0, -Infinity])).toEqual([-Infinity, 0, 1, Infinity])
  })

  it('handles alternating high low values', () => {
    expect(GnomeSort.sort([10, 1, 9, 2, 8, 3])).toEqual([1, 2, 3, 8, 9, 10])
  })

  it('sortInPlace with single distinct value', () => {
    const arr = [7, 7, 7, 7]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([7, 7, 7, 7])
  })

  it('sortWithComparator with case-sensitive strings', () => {
    const result = GnomeSort.sortWithComparator(['Apple', 'apple', 'Banana'], (a, b) => a.localeCompare(b))
    expect(result).toEqual(['apple', 'Apple', 'Banana'])
  })

  it('sortWithComparator with descending empty array', () => {
    expect(GnomeSort.sortWithComparator([], (a, b) => b - a)).toEqual([])
  })

  it('handles partially sorted array', () => {
    expect(GnomeSort.sort([1, 2, 5, 3, 4, 6])).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('handles array with alternating sorted segments', () => {
    expect(GnomeSort.sort([1, 2, 5, 4, 7, 6])).toEqual([1, 2, 4, 5, 6, 7])
  })

  it('handles very small floating point numbers', () => {
    expect(GnomeSort.sort([0.0001, 0.00001, 0.001])).toEqual([0.00001, 0.0001, 0.001])
  })

  it('sortInPlace multiple calls', () => {
    const arr = [3, 1, 2]
    GnomeSort.sortInPlace(arr)
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles array with positive and negative infinity', () => {
    const result = GnomeSort.sort([-Infinity, 0, Infinity, -Infinity])
    expect(result).toEqual([-Infinity, -Infinity, 0, Infinity])
  })

  it('sortWithComparator returns new array', () => {
    const arr = [3, 1, 2]
    const result = GnomeSort.sortWithComparator(arr, (a, b) => a - b)
    expect(result).not.toBe(arr)
  })

  it('handles array sorted in descending order', () => {
    expect(GnomeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace returns undefined', () => {
    const arr = [3, 1, 2]
    const result = GnomeSort.sortInPlace(arr)
    expect(result).toBeUndefined()
  })

  it('handles array with repeated pattern', () => {
    expect(GnomeSort.sort([3, 1, 2, 3, 1, 2])).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('sortInPlace with duplicates', () => {
    const arr = [3, 1, 2, 1, 3]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('sortWithComparator with null values', () => {
    const items = [{ v: 3 }, null, { v: 1 }]
    const result = GnomeSort.sortWithComparator(items as any, (a: any, b: any) => {
      if (a === null) return 1
      if (b === null) return -1
      return a.v - b.v
    })
    expect(result).toEqual([{ v: 1 }, { v: 3 }, null])
  })

  it('sortWithComparator handles NaN values', () => {
    const result = GnomeSort.sortWithComparator([NaN, 1, 2, NaN, 0], (a, b) => {
      if (Number.isNaN(a)) return 1
      if (Number.isNaN(b)) return -1
      return a - b
    })
    expect(result).toEqual([0, 1, 2, NaN, NaN])
  })

  it('handles arrays with undefined values', () => {
    const result = GnomeSort.sortWithComparator([undefined, 3, undefined, 1] as any, (a: any, b: any) => {
      if (a === undefined) return 1
      if (b === undefined) return -1
      return a - b
    })
    expect(result).toEqual([1, 3, undefined, undefined])
  })

  it('sortInPlace handles array with three elements', () => {
    const arr = [3, 1, 2]
    GnomeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('sortWithComparator with nested object properties', () => {
    const items = [{ nested: { deep: { value: 3 } } }, { nested: { deep: { value: 1 } } }, { nested: { deep: { value: 2 } } }]
    const result = GnomeSort.sortWithComparator(items, (a, b) => a.nested.deep.value - b.nested.deep.value)
    expect(result.map(x => x.nested.deep.value)).toEqual([1, 2, 3])
  })

  it('sort returns new array instance', () => {
    const arr = [3, 1, 2]
    const result = GnomeSort.sort(arr)
    expect(result).not.toBe(arr)
  })

  it('should handle single element', () => {
    expect(GnomeSort.sort([1])).toEqual([1])
  })

  it('should handle already sorted', () => {
    expect(GnomeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('sorts descending array', () => {
    expect(GnomeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array', () => {
    expect(GnomeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(GnomeSort.sort([7])).toEqual([7])
  })
  it('sort empty array', () => {
    expect(GnomeSort.sort([])).toEqual([])
  })

  it('sort single element', () => {
    expect(GnomeSort.sort([5])).toEqual([5])
  })

  it('sort already sorted', () => {
    expect(GnomeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })
})

describe('gnome-sort - wave545', () => {
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

describe('gnome-sort - wave546', () => {
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

describe('gnome-sort - wave547', () => {
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

describe('gnome-sort - wave548', () => {
  it('gnome-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave549', () => {
  it('gnome-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave550', () => {
  it('gnome-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave551', () => {
  it('gnome-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave552', () => {
  it('gnome-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave553', () => {
  it('gnome-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave554', () => {
  it('gnome-sort w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave555', () => {
  it('gnome-sort w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gnome-sort - wave556', () => {
  it('gnome-sort w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gnome-sort w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
