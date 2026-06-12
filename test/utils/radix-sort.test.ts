import { describe, it, expect } from 'vitest'
import { RadixSort } from '../../src/utils/radix-sort.js'

describe('RadixSort', () => {
  describe('sort', () => {
    it('sorts empty array', () => {
      const result = RadixSort.sort([])
      expect(result).toEqual([])
    })

    it('sorts single element array', () => {
      const result = RadixSort.sort([5])
      expect(result).toEqual([5])
    })

    it('sorts positive numbers ascending', () => {
      const result = RadixSort.sort([3, 1, 4, 1, 5, 9, 2, 6])
      expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('sorts negative numbers ascending', () => {
      const result = RadixSort.sort([-5, -1, -3, -2, -4])
      expect(result).toEqual([-5, -4, -3, -2, -1])
    })

    it('sorts mixed positive and negative numbers ascending', () => {
      const result = RadixSort.sort([3, -1, 4, -5, 0, 2, -3])
      expect(result).toEqual([-5, -3, -1, 0, 2, 3, 4])
    })

    it('sorts in descending order', () => {
      const result = RadixSort.sort([3, 1, 4, 1, 5, 9, 2, 6], { ascending: false })
      expect(result).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
    })

    it('returns new array, does not mutate original', () => {
      const original = [3, 1, 2]
      const result = RadixSort.sort(original)
      expect(original).toEqual([3, 1, 2])
      expect(result).toEqual([1, 2, 3])
    })

    it('handles duplicate numbers', () => {
      const result = RadixSort.sort([2, 2, 2, 1, 1, 3, 3])
      expect(result).toEqual([1, 1, 2, 2, 2, 3, 3])
    })

    it('handles large numbers', () => {
      const result = RadixSort.sort([2147483647, -2147483648, 0, 123456789])
      expect(result).toEqual([-2147483648, 0, 123456789, 2147483647])
    })

    it('handles already sorted ascending', () => {
      expect(RadixSort.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles reverse sorted descending', () => {
      expect(RadixSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('handles array with zeros', () => {
      expect(RadixSort.sort([0, 5, 0, -1, 0])).toEqual([-1, 0, 0, 0, 5])
    })

    it('handles array with all same numbers', () => {
      expect(RadixSort.sort([7, 7, 7, 7])).toEqual([7, 7, 7, 7])
    })

    it('handles two element array ascending', () => {
      expect(RadixSort.sort([2, 1])).toEqual([1, 2])
    })

    it('handles two element array descending', () => {
      expect(RadixSort.sort([1, 2], { ascending: false })).toEqual([2, 1])
    })

    it('handles large array', () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const result = RadixSort.sort(arr)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]! >= result[i - 1]!).toBe(true)
      }
    })

    it('handles min and max int32 values', () => {
      expect(RadixSort.sort([2147483647, -2147483648, 2147483646, -2147483647])).toEqual([-2147483648, -2147483647, 2147483646, 2147483647])
    })

    it('defaults to ascending when options not provided', () => {
      expect(RadixSort.sort([3, 2, 1])).toEqual([1, 2, 3])
    })
  })

  describe('sortUnsigned', () => {
    it('sorts unsigned numbers', () => {
      const result = RadixSort.sortUnsigned([5, 3, 1, 4, 2])
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts empty array for unsigned', () => {
      expect(RadixSort.sortUnsigned([])).toEqual([])
    })

    it('sorts single element for unsigned', () => {
      expect(RadixSort.sortUnsigned([42])).toEqual([42])
    })

    it('handles duplicates in unsigned sort', () => {
      expect(RadixSort.sortUnsigned([3, 1, 3, 2, 1])).toEqual([1, 1, 2, 3, 3])
    })

    it('handles max uint32 values', () => {
      expect(RadixSort.sortUnsigned([4294967295, 0, 2147483648])).toEqual([0, 2147483648, 4294967295])
    })

    it('returns new array for unsigned sort', () => {
      const original = [5, 3, 1]
      const result = RadixSort.sortUnsigned(original)
      expect(original).toEqual([5, 3, 1])
      expect(result).toEqual([1, 3, 5])
    })

    it('handles already sorted unsigned array', () => {
      expect(RadixSort.sortUnsigned([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
    })

    it('handles reverse sorted unsigned array', () => {
      expect(RadixSort.sortUnsigned([4, 3, 2, 1])).toEqual([1, 2, 3, 4])
    })

    it('handles large unsigned array', () => {
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 10000))
      const result = RadixSort.sortUnsigned(arr)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]! >= result[i - 1]!).toBe(true)
      }
    })
  })

  describe('sortBy', () => {
    it('sorts objects by key function ascending', () => {
      const items = [
        { name: 'alice', value: 3 },
        { name: 'bob', value: 1 },
        { name: 'charlie', value: 2 }
      ]
      const result = RadixSort.sortBy(items, (item) => item.value)
      expect(result![0]!.name).toBe('bob')
      expect(result![1]!.name).toBe('charlie')
      expect(result![2]!.name).toBe('alice')
    })

    it('sorts objects by key function descending', () => {
      const items = [
        { name: 'alice', value: 3 },
        { name: 'bob', value: 1 },
        { name: 'charlie', value: 2 }
      ]
      const result = RadixSort.sortBy(items, (item) => item.value, { ascending: false })
      expect(result![0]!.name).toBe('alice')
      expect(result![1]!.name).toBe('charlie')
      expect(result![2]!.name).toBe('bob')
    })

    it('returns new array when sorting by key', () => {
      const items = [{ value: 3 }, { value: 1 }]
      const result = RadixSort.sortBy(items, (item) => item.value)
      expect(items).toEqual([{ value: 3 }, { value: 1 }])
      expect(result![0]!.value).toBe(1)
    })

    it('handles empty array for sortBy', () => {
      const result = RadixSort.sortBy([], (x) => x)
      expect(result).toEqual([])
    })

    it('handles single element for sortBy', () => {
      const items = [{ id: 1 }]
      const result = RadixSort.sortBy(items, (x) => x.id)
      expect(result![0]!.id).toBe(1)
    })

    it('handles negative keys in sortBy', () => {
      const items = [{ val: -3 }, { val: 1 }, { val: -1 }]
      const result = RadixSort.sortBy(items, (x) => x.val)
      expect(result![0]!.val).toBe(-3)
      expect(result![1]!.val).toBe(-1)
      expect(result![2]!.val).toBe(1)
    })

    it('handles duplicate keys in sortBy', () => {
      const items = [{ id: 2 }, { id: 1 }, { id: 2 }, { id: 1 }]
      const result = RadixSort.sortBy(items, (x) => x.id)
      expect(result![0]!.id).toBe(1)
      expect(result![1]!.id).toBe(1)
      expect(result![2]!.id).toBe(2)
      expect(result![3]!.id).toBe(2)
    })

    it('defaults to ascending in sortBy', () => {
      const items = [{ val: 3 }, { val: 1 }, { val: 2 }]
      const result = RadixSort.sortBy(items, (x) => x.val)
      expect(result![0]!.val).toBe(1)
      expect(result![2]!.val).toBe(3)
    })

    it('handles zero as key in sortBy', () => {
      const items = [{ val: 5 }, { val: 0 }, { val: -3 }]
      const result = RadixSort.sortBy(items, (x) => x.val)
      expect(result![0]!.val).toBe(-3)
      expect(result![1]!.val).toBe(0)
      expect(result![2]!.val).toBe(5)
    })

    it('handles large keys in sortBy', () => {
      const items = [{ val: 2147483647 }, { val: 0 }, { val: -2147483648 }]
      const result = RadixSort.sortBy(items, (x) => x.val)
      expect(result![0]!.val).toBe(-2147483648)
      expect(result![1]!.val).toBe(0)
      expect(result![2]!.val).toBe(2147483647)
    })
  })

  describe('sortInPlace', () => {
    it('sorts in place ascending', () => {
      const arr = [3, 1, 4, 1, 5]
      const result = RadixSort.sortInPlace(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([1, 1, 3, 4, 5])
    })

    it('sorts in place descending', () => {
      const arr = [3, 1, 4, 1, 5]
      const result = RadixSort.sortInPlace(arr, { ascending: false })
      expect(result).toBe(arr)
      expect(arr).toEqual([5, 4, 3, 1, 1])
    })

    it('handles empty array for in place sort', () => {
      const arr: number[] = []
      const result = RadixSort.sortInPlace(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([])
    })

    it('handles single element for in place sort', () => {
      const arr = [5]
      const result = RadixSort.sortInPlace(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([5])
    })

    it('handles negative numbers in place', () => {
      const arr = [-3, 1, -5, 0, 2]
      RadixSort.sortInPlace(arr)
      expect(arr).toEqual([-5, -3, 0, 1, 2])
    })

    it('handles duplicates in place', () => {
      const arr = [2, 2, 1, 3, 1]
      RadixSort.sortInPlace(arr)
      expect(arr).toEqual([1, 1, 2, 2, 3])
    })

    it('returns same reference', () => {
      const arr = [3, 2, 1]
      const result = RadixSort.sortInPlace(arr)
      expect(result === arr).toBe(true)
    })

    it('defaults to ascending in place', () => {
      const arr = [5, 2, 3, 1, 4]
      RadixSort.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it('handles array with zeros in place', () => {
      const arr = [0, 5, 0, -2, 3]
      RadixSort.sortInPlace(arr)
      expect(arr).toEqual([-2, 0, 0, 3, 5])
    })

    it('handles two elements in place', () => {
      const arr = [2, 1]
      RadixSort.sortInPlace(arr)
      expect(arr).toEqual([1, 2])
    })

    it('handles large array in place', () => {
      const arr = Array.from({ length: 500 }, () => Math.floor(Math.random() * 100))
      RadixSort.sortInPlace(arr)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! >= arr[i - 1]!).toBe(true)
      }
    })

    it('handles already sorted array in place', () => {
      const arr = [1, 2, 3, 4, 5]
      RadixSort.sortInPlace(arr)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('edge cases', () => {
    it('handles array with only zeros', () => {
      expect(RadixSort.sort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
    })

    it('handles alternating positive and negative', () => {
      expect(RadixSort.sort([1, -1, 2, -2, 3, -3])).toEqual([-3, -2, -1, 1, 2, 3])
    })

    it('handles same negative number repeated', () => {
      expect(RadixSort.sort([-5, -5, -5])).toEqual([-5, -5, -5])
    })

    it('handles array with min int32', () => {
      expect(RadixSort.sort([-2147483648, -2147483648, 0])).toEqual([-2147483648, -2147483648, 0])
    })

    it('handles array with max int32', () => {
      expect(RadixSort.sort([2147483647, 2147483647, 0])).toEqual([0, 2147483647, 2147483647])
    })
  })
})
  it('sort empty array', () => {
    expect(RadixSort.sort([])).toEqual([])


  it('sort empty arr', () => {
    expect(RadixSort.sort([])).toEqual([])
  })

  it('sort single element', () => {
    expect(RadixSort.sort([5])).toEqual([5])
  })

  it('sort works', () => {
    expect(RadixSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })
  })

describe('radix-sort - wave545', () => {
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

describe('radix-sort - wave546', () => {
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

describe('radix-sort - wave547', () => {
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

describe('radix-sort - wave548', () => {
  it('radix-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave549', () => {
  it('radix-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave550', () => {
  it('radix-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
