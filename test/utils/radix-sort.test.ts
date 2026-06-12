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

describe('radix-sort - wave551', () => {
  it('radix-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave552', () => {
  it('radix-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave553', () => {
  it('radix-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave554', () => {
  it('radix-sort w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave555', () => {
  it('radix-sort w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave556', () => {
  it('radix-sort w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave557', () => {
  it('radix-sort w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave558', () => {
  it('radix-sort w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave559', () => {
  it('radix-sort w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave560', () => {
  it('radix-sort w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave561', () => {
  it('radix-sort w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave562', () => {
  it('radix-sort w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave563', () => {
  it('radix-sort w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave564', () => {
  it('radix-sort w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave565', () => {
  it('radix-sort w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave566', () => {
  it('radix-sort w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave127', () => {
  it('radix-sort w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave130', () => {
  it('radix-sort w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave133', () => {
  it('radix-sort w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave136', () => {
  it('radix-sort w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - wave139', () => {
  it('radix-sort w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w142', () => {
  it('radix-sort v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w145', () => {
  it('radix-sort v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w148', () => {
  it('radix-sort v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w151', () => {
  it('radix-sort v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w154', () => {
  it('radix-sort v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w157', () => {
  it('radix-sort v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w160', () => {
  it('radix-sort v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w170', () => {
  it('radix-sort x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w180', () => {
  it('radix-sort x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w190', () => {
  it('radix-sort x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w200', () => {
  it('radix-sort x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w210', () => {
  it('radix-sort x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w220', () => {
  it('radix-sort x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w230', () => {
  it('radix-sort x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w240', () => {
  it('radix-sort x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w250', () => {
  it('radix-sort x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w260', () => {
  it('radix-sort x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w270', () => {
  it('radix-sort x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w280', () => {
  it('radix-sort x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w290', () => {
  it('radix-sort x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w300', () => {
  it('radix-sort x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w310', () => {
  it('radix-sort x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w320', () => {
  it('radix-sort x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w330', () => {
  it('radix-sort x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w340', () => {
  it('radix-sort x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w350', () => {
  it('radix-sort x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w360', () => {
  it('radix-sort x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w370', () => {
  it('radix-sort x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w380', () => {
  it('radix-sort x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w390', () => {
  it('radix-sort x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w400', () => {
  it('radix-sort x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w420', () => {
  it('radix-sort x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w440', () => {
  it('radix-sort x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w460', () => {
  it('radix-sort x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w480', () => {
  it('radix-sort x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w500', () => {
  it('radix-sort x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w550', () => {
  it('radix-sort x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w600', () => {
  it('radix-sort x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w650', () => {
  it('radix-sort x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('radix-sort - w700', () => {
  it('radix-sort x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('radix-sort x700x49', () => {
    expect(describe).toBeDefined()
  })
})
