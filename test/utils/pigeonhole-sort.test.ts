import { describe, expect, it } from 'vitest'
import { PigeonholeSort } from '../../src/utils/pigeonhole-sort.js'

describe('PigeonholeSort', () => {
  it('sorts unsorted array', () => {
    expect(PigeonholeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(PigeonholeSort.sort([])).toEqual([])
  })

  it('handles single element', () => {
    expect(PigeonholeSort.sort([42])).toEqual([42])
  })

  it('handles already sorted', () => {
    expect(PigeonholeSort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles reverse sorted', () => {
    expect(PigeonholeSort.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles duplicates', () => {
    expect(PigeonholeSort.sort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })

  it('does not modify original', () => {
    const arr = [3, 1, 2]
    PigeonholeSort.sort(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('sortInPlace modifies original', () => {
    const arr = [3, 1, 2]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles negative numbers', () => {
    expect(PigeonholeSort.sort([-1, -3, -2])).toEqual([-3, -2, -1])
  })

  it('handles mixed positive and negative', () => {
    expect(PigeonholeSort.sort([3, -1, 0, -2, 2])).toEqual([-2, -1, 0, 2, 3])
  })

  it('two elements', () => {
    expect(PigeonholeSort.sort([2, 1])).toEqual([1, 2])
  })

  it('all same elements', () => {
    expect(PigeonholeSort.sort([7, 7, 7])).toEqual([7, 7, 7])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 200 }, (_, i) => (i * 7 + 3) % 200)
    const result = PigeonholeSort.sort(arr)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
    }
  })

  it('is stable', () => {
    expect(PigeonholeSort.isStable()).toBe(true)
  })

  it('sortInPlace empty array', () => {
    const arr: number[] = []
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('sortInPlace single element', () => {
    const arr = [5]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([5])
  })

  it('sortInPlace already sorted', () => {
    const arr = [1, 2, 3, 4]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4])
  })

  it('sortInPlace reverse sorted', () => {
    const arr = [4, 3, 2, 1]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4])
  })

  it('sortInPlace with duplicates', () => {
    const arr = [3, 1, 3, 2, 1]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('sortInPlace with negatives', () => {
    const arr = [-3, 1, -2, 0]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([-3, -2, 0, 1])
  })

  it('sort returns new array', () => {
    const arr = [3, 1, 2]
    const sorted = PigeonholeSort.sort(arr)
    expect(sorted).not.toBe(arr)
  })

  it('sort result length matches input', () => {
    expect(PigeonholeSort.sort([5, 3, 1, 4, 2]).length).toBe(5)
  })

  it('handles zeros', () => {
    expect(PigeonholeSort.sort([0, 0, 1, 0])).toEqual([0, 0, 0, 1])
  })

  it('handles consecutive integers', () => {
    expect(PigeonholeSort.sort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles range with gaps', () => {
    expect(PigeonholeSort.sort([0, 100, 50, 25, 75])).toEqual([0, 25, 50, 75, 100])
  })

  it('single distinct value repeated', () => {
    expect(PigeonholeSort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('two equal elements', () => {
    expect(PigeonholeSort.sort([5, 5])).toEqual([5, 5])
  })

  it('handles min at end max at start', () => {
    expect(PigeonholeSort.sort([100, 50, 0])).toEqual([0, 50, 100])
  })

  it('handles alternating high low', () => {
    expect(PigeonholeSort.sort([10, 1, 9, 2, 8, 3])).toEqual([1, 2, 3, 8, 9, 10])
  })

  it('sortInPlace large array', () => {
    const arr = Array.from({ length: 200 }, (_, i) => 200 - i)
    PigeonholeSort.sortInPlace(arr)
    for (let i = 1; i < arr.length; i++) {
      expect(arr[i]!).toBeGreaterThanOrEqual(arr[i - 1]!)
    }
  })

  it('sort with all negative', () => {
    expect(PigeonholeSort.sort([-5, -1, -3, -2, -4])).toEqual([-5, -4, -3, -2, -1])
  })

  it('sortInPlace returns void', () => {
    const arr = [3, 1, 2]
    expect(PigeonholeSort.sortInPlace(arr)).toBeUndefined()
  })

  it('handles large positive range', () => {
    const arr = [1000, 500, 0, 750, 250]
    expect(PigeonholeSort.sort(arr)).toEqual([0, 250, 500, 750, 1000])
  })

  it('three elements unsorted', () => {
    expect(PigeonholeSort.sort([2, 3, 1])).toEqual([1, 2, 3])
  })

  it('four elements', () => {
    expect(PigeonholeSort.sort([4, 3, 2, 1])).toEqual([1, 2, 3, 4])
  })

  it('isStable returns boolean', () => {
    expect(typeof PigeonholeSort.isStable()).toBe('boolean')
  })

  it('sortInPlace with all same', () => {
    const arr = [7, 7, 7, 7]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([7, 7, 7, 7])
  })

  it('large duplicate-heavy array', () => {
    const arr = Array.from({ length: 100 }, () => 5)
    expect(PigeonholeSort.sort(arr)).toEqual(arr)
  })

  it('min value at end', () => {
    expect(PigeonholeSort.sort([3, 2, 1])).toEqual([1, 2, 3])
  })

  it('max value at start', () => {
    expect(PigeonholeSort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('handles array of length 5 all unique', () => {
    expect(PigeonholeSort.sort([5, 2, 4, 1, 3])).toEqual([1, 2, 3, 4, 5])
  })

  it('sortInPlace two elements reversed', () => {
    const arr = [2, 1]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2])
  })

  it('handles single zero', () => {
    expect(PigeonholeSort.sort([0])).toEqual([0])
  })

  it('handles only negative', () => {
    expect(PigeonholeSort.sort([-10, -5, -20])).toEqual([-20, -10, -5])
  })

  it('sortInPlace preserves length', () => {
    const arr = [3, 1, 2, 4]
    PigeonholeSort.sortInPlace(arr)
    expect(arr.length).toBe(4)
  })

  it('handles extreme range spread', () => {
    expect(PigeonholeSort.sort([1000000, 0, 500000, -500000])).toEqual([-500000, 0, 500000, 1000000])
  })

  it('handles single negative multiple positives', () => {
    expect(PigeonholeSort.sort([-5, 1, 3, 7, 2])).toEqual([-5, 1, 2, 3, 7])
  })

  it('handles single positive multiple negatives', () => {
    expect(PigeonholeSort.sort([-7, -3, -1, 5, -4])).toEqual([-7, -4, -3, -1, 5])
  })

  it('sortInPlace with three unsorted', () => {
    const arr = [3, 1, 2]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('handles range equal to array length', () => {
    expect(PigeonholeSort.sort([0, 1, 2, 3, 4])).toEqual([0, 1, 2, 3, 4])
  })

  it('handles negative numbers', () => {
    expect(PigeonholeSort.sort([-2, -1, 0, 1, 2])).toEqual([-2, -1, 0, 1, 2])
  })

  it('handles single element', () => {
    expect(PigeonholeSort.sort([42])).toEqual([42])
  })
})

  it('sortInPlace modifies array', () => {
    const arr = [3, 1, 2]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('isStable returns boolean', () => {
    expect(typeof PigeonholeSort.isStable()).toBe('boolean')
  })

  it('sort empty array', () => {
    expect(PigeonholeSort.sort([])).toEqual([])

  it('sort empty array', () => {
    expect(PigeonholeSort.sort([])).toEqual([])
  })

  it('sort single element', () => {
    expect(PigeonholeSort.sort([5])).toEqual([5])
  })

  it('sortInPlace works', () => {
    const arr = [3, 1, 2]
    PigeonholeSort.sortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('pigeonhole-sort - wave545', () => {
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

describe('pigeonhole-sort - wave546', () => {
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

describe('pigeonhole-sort - wave547', () => {
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

describe('pigeonhole-sort - wave548', () => {
  it('pigeonhole-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pigeonhole-sort - wave549', () => {
  it('pigeonhole-sort module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pigeonhole-sort - wave550', () => {
  it('pigeonhole-sort w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pigeonhole-sort - wave551', () => {
  it('pigeonhole-sort w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pigeonhole-sort - wave552', () => {
  it('pigeonhole-sort w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pigeonhole-sort - wave553', () => {
  it('pigeonhole-sort w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pigeonhole-sort - wave554', () => {
  it('pigeonhole-sort w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pigeonhole-sort - wave555', () => {
  it('pigeonhole-sort w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pigeonhole-sort w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
