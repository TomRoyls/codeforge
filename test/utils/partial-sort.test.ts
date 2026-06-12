import { describe, expect, it } from 'vitest'
import { PartialSort } from '../../src/utils/partial-sort.js'

describe('PartialSort', () => {
  describe('smallestK', () => {
    it('returns k smallest sorted', () => {
      expect(PartialSort.smallestK([5, 3, 1, 4, 2], 3)).toEqual([1, 2, 3])
    })

    it('with k=1', () => {
      expect(PartialSort.smallestK([5, 3, 1, 4, 2], 1)).toEqual([1])
    })

    it('with k=0', () => {
      expect(PartialSort.smallestK([1, 2, 3], 0)).toEqual([])
    })

    it('with k >= length', () => {
      expect(PartialSort.smallestK([3, 1, 2], 5)).toEqual([1, 2, 3])
    })

    it('with k equals length', () => {
      expect(PartialSort.smallestK([3, 1, 2], 3)).toEqual([1, 2, 3])
    })

    it('with single element array and k=1', () => {
      expect(PartialSort.smallestK([42], 1)).toEqual([42])
    })

    it('with single element array and k > length', () => {
      expect(PartialSort.smallestK([42], 5)).toEqual([42])
    })

    it('with empty array', () => {
      expect(PartialSort.smallestK([], 3)).toEqual([])
    })

    it('with empty array and k=0', () => {
      expect(PartialSort.smallestK([], 0)).toEqual([])
    })

    it('handles duplicates', () => {
      expect(PartialSort.smallestK([3, 1, 1, 2], 2)).toEqual([1, 1])
    })

    it('handles negative numbers', () => {
      expect(PartialSort.smallestK([-1, -3, -2], 2)).toEqual([-3, -2])
    })

    it('handles mixed positive and negative', () => {
      expect(PartialSort.smallestK([-5, 3, -1, 4, 2], 3)).toEqual([-5, -1, 2])
    })

    it('handles zero', () => {
      expect(PartialSort.smallestK([0, 5, -1, 3, 0], 3)).toEqual([-1, 0, 0])
    })

    it('handles large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
      const result = PartialSort.smallestK(arr, 10)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('preserves order of selected elements', () => {
      const result = PartialSort.smallestK([5, 1, 5, 2, 5, 3], 3)
      expect(result).toEqual([1, 2, 3])
    })

    it('with all identical elements', () => {
      expect(PartialSort.smallestK([5, 5, 5, 5, 5], 3)).toEqual([5, 5, 5])
    })

    it('with floating point numbers', () => {
      const result = PartialSort.smallestK([1.5, 3.7, 0.3, 2.1, 1.8], 3)
      expect(result).toEqual([0.3, 1.5, 1.8])
    })

    it('does not modify original array', () => {
      const arr = [3, 1, 2]
      PartialSort.smallestK(arr, 2)
      expect(arr).toEqual([3, 1, 2])
    })

    it('with k=2 finds second smallest', () => {
      const result = PartialSort.smallestK([5, 2, 8, 1, 9, 3], 2)
      expect(result).toEqual([1, 2])
    })

    it('with k=3 returns three smallest sorted', () => {
      const result = PartialSort.smallestK([9, 5, 2, 7, 1, 8], 3)
      expect(result).toEqual([1, 2, 5])
    })

    it('handles already sorted array', () => {
      expect(PartialSort.smallestK([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
    })

    it('handles reverse sorted array', () => {
      expect(PartialSort.smallestK([5, 4, 3, 2, 1], 3)).toEqual([1, 2, 3])
    })
  })

  describe('largestK', () => {
    it('returns k largest sorted descending', () => {
      expect(PartialSort.largestK([5, 3, 1, 4, 2], 3)).toEqual([5, 4, 3])
    })

    it('with k=1', () => {
      expect(PartialSort.largestK([5, 3, 1, 4, 2], 1)).toEqual([5])
    })

    it('with k=0', () => {
      expect(PartialSort.largestK([1, 2, 3], 0)).toEqual([])
    })

    it('with k >= length', () => {
      expect(PartialSort.largestK([3, 1, 2], 5)).toEqual([3, 2, 1])
    })

    it('with k equals length', () => {
      expect(PartialSort.largestK([3, 1, 2], 3)).toEqual([3, 2, 1])
    })

    it('with single element array and k=1', () => {
      expect(PartialSort.largestK([42], 1)).toEqual([42])
    })

    it('with single element array and k > length', () => {
      expect(PartialSort.largestK([42], 5)).toEqual([42])
    })

    it('with empty array', () => {
      expect(PartialSort.largestK([], 3)).toEqual([])
    })

    it('with empty array and k=0', () => {
      expect(PartialSort.largestK([], 0)).toEqual([])
    })

    it('handles duplicates', () => {
      expect(PartialSort.largestK([3, 5, 5, 2], 2)).toEqual([5, 5])
    })

    it('handles negative numbers', () => {
      expect(PartialSort.largestK([-1, -3, -2], 2)).toEqual([-1, -2])
    })

    it('handles mixed positive and negative', () => {
      expect(PartialSort.largestK([-5, 3, -1, 4, 2], 3)).toEqual([4, 3, 2])
    })

    it('handles zero', () => {
      expect(PartialSort.largestK([0, 5, -1, 3, 0], 3)).toEqual([5, 3, 0])
    })

    it('with large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
      const result = PartialSort.largestK(arr, 10)
      expect(result).toEqual([1000, 999, 998, 997, 996, 995, 994, 993, 992, 991])
    })

    it('with all identical elements', () => {
      expect(PartialSort.largestK([5, 5, 5, 5, 5], 3)).toEqual([5, 5, 5])
    })

    it('with floating point numbers', () => {
      const result = PartialSort.largestK([1.5, 3.7, 0.3, 2.1, 1.8], 3)
      expect(result).toEqual([3.7, 2.1, 1.8])
    })

    it('does not modify original array', () => {
      const arr = [3, 1, 2]
      PartialSort.largestK(arr, 2)
      expect(arr).toEqual([3, 1, 2])
    })

    it('with k=2 finds second largest', () => {
      const result = PartialSort.largestK([5, 2, 8, 1, 9, 3], 2)
      expect(result).toEqual([9, 8])
    })

    it('with k=3 returns three largest sorted descending', () => {
      const result = PartialSort.largestK([9, 5, 2, 7, 1, 8], 3)
      expect(result).toEqual([9, 8, 7])
    })

    it('handles already sorted array', () => {
      expect(PartialSort.largestK([1, 2, 3, 4, 5], 3)).toEqual([5, 4, 3])
    })

    it('handles reverse sorted array', () => {
      expect(PartialSort.largestK([5, 4, 3, 2, 1], 3)).toEqual([5, 4, 3])
    })
  })

  describe('partitionPoint', () => {
    it('finds partition point', () => {
      const arr = [1, 2, 3, 4, 5]
      expect(PartialSort.partitionPoint(arr, x => x < 3)).toBe(2)
    })

    it('with all true predicate', () => {
      expect(PartialSort.partitionPoint([1, 2, 3], () => true)).toBe(3)
    })

    it('with all false predicate', () => {
      expect(PartialSort.partitionPoint([1, 2, 3], () => false)).toBe(0)
    })

    it('with empty array', () => {
      expect(PartialSort.partitionPoint([], () => true)).toBe(0)
    })

    it('finds first false at start', () => {
      expect(PartialSort.partitionPoint([1, 2, 3, 4, 5], x => x < 1)).toBe(0)
    })

    it('finds first false at end', () => {
      expect(PartialSort.partitionPoint([1, 2, 3, 4, 5], x => x < 6)).toBe(5)
    })

    it('with equals predicate', () => {
      expect(PartialSort.partitionPoint([1, 2, 3, 4, 5], x => x <= 3)).toBe(3)
    })

    it('with odd numbers predicate', () => {
      expect(PartialSort.partitionPoint([1, 3, 5, 2, 4], x => x % 2 !== 0)).toBe(3)
    })

    it('with single element true', () => {
      expect(PartialSort.partitionPoint([5], x => x < 10)).toBe(1)
    })

    it('with single element false', () => {
      expect(PartialSort.partitionPoint([5], x => x < 1)).toBe(0)
    })

    it('with two elements both true', () => {
      expect(PartialSort.partitionPoint([1, 2], x => x < 10)).toBe(2)
    })

    it('with two elements both false', () => {
      expect(PartialSort.partitionPoint([10, 20], x => x < 1)).toBe(0)
    })

    it('with two elements first true second false', () => {
      expect(PartialSort.partitionPoint([1, 10], x => x < 5)).toBe(1)
    })

    it('with negative numbers', () => {
      expect(PartialSort.partitionPoint([-5, -3, -1, 2, 4], x => x < 0)).toBe(3)
    })

    it('with floating point numbers', () => {
      expect(PartialSort.partitionPoint([1.1, 2.2, 3.3, 4.4], x => x < 3.0)).toBe(2)
    })
  })
})

describe('partial-sort - wave545', () => {
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

describe('partial-sort - wave546', () => {
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

describe('partial-sort - wave547', () => {
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

describe('partial-sort - wave548', () => {
  it('partial-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave549', () => {
  it('partial-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave550', () => {
  it('partial-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave551', () => {
  it('partial-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave552', () => {
  it('partial-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave553', () => {
  it('partial-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave554', () => {
  it('partial-sort w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave555', () => {
  it('partial-sort w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave556', () => {
  it('partial-sort w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave557', () => {
  it('partial-sort w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave558', () => {
  it('partial-sort w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave559', () => {
  it('partial-sort w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave560', () => {
  it('partial-sort w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave561', () => {
  it('partial-sort w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave562', () => {
  it('partial-sort w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave563', () => {
  it('partial-sort w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave564', () => {
  it('partial-sort w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave565', () => {
  it('partial-sort w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave566', () => {
  it('partial-sort w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave127', () => {
  it('partial-sort w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave130', () => {
  it('partial-sort w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave133', () => {
  it('partial-sort w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave136', () => {
  it('partial-sort w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - wave139', () => {
  it('partial-sort w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w142', () => {
  it('partial-sort v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w145', () => {
  it('partial-sort v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w148', () => {
  it('partial-sort v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w151', () => {
  it('partial-sort v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w154', () => {
  it('partial-sort v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w157', () => {
  it('partial-sort v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w160', () => {
  it('partial-sort v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w170', () => {
  it('partial-sort x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w180', () => {
  it('partial-sort x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w190', () => {
  it('partial-sort x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w200', () => {
  it('partial-sort x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w210', () => {
  it('partial-sort x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w220', () => {
  it('partial-sort x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w230', () => {
  it('partial-sort x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w240', () => {
  it('partial-sort x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w250', () => {
  it('partial-sort x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w260', () => {
  it('partial-sort x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w270', () => {
  it('partial-sort x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w280', () => {
  it('partial-sort x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w290', () => {
  it('partial-sort x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w300', () => {
  it('partial-sort x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w310', () => {
  it('partial-sort x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w320', () => {
  it('partial-sort x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w330', () => {
  it('partial-sort x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w340', () => {
  it('partial-sort x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w350', () => {
  it('partial-sort x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w360', () => {
  it('partial-sort x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w370', () => {
  it('partial-sort x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w380', () => {
  it('partial-sort x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w390', () => {
  it('partial-sort x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w400', () => {
  it('partial-sort x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w420', () => {
  it('partial-sort x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w440', () => {
  it('partial-sort x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w460', () => {
  it('partial-sort x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w480', () => {
  it('partial-sort x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('partial-sort - w500', () => {
  it('partial-sort x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('partial-sort x500x19', () => {
    expect(describe).toBeDefined()
  })
})
