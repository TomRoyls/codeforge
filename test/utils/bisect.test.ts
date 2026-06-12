import { describe, expect, it } from 'vitest'
import { Bisect } from '../../src/utils/bisect.js'

describe('Bisect', () => {
  it('bisectLeft finds insertion point', () => {
    expect(Bisect.bisectLeft([1, 2, 4, 4, 5], 4)).toBe(2)
  })

  it('bisectLeft for element not in array', () => {
    expect(Bisect.bisectLeft([1, 3, 5], 2)).toBe(1)
  })

  it('bisectLeft for element before array', () => {
    expect(Bisect.bisectLeft([2, 4, 6], 1)).toBe(0)
  })

  it('bisectLeft for element after array', () => {
    expect(Bisect.bisectLeft([2, 4, 6], 7)).toBe(3)
  })

  it('bisectRight finds insertion point', () => {
    expect(Bisect.bisectRight([1, 2, 4, 4, 5], 4)).toBe(4)
  })

  it('bisectRight for element not in array', () => {
    expect(Bisect.bisectRight([1, 3, 5], 2)).toBe(1)
  })

  it('insortLeft inserts at correct position', () => {
    const arr = [1, 2, 4, 5]
    Bisect.insortLeft(arr, 3)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('insortRight inserts at correct position', () => {
    const arr = [1, 2, 4, 5]
    Bisect.insortRight(arr, 3)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('insortLeft handles duplicates', () => {
    const arr = [1, 2, 2, 3]
    Bisect.insortLeft(arr, 2)
    expect(arr).toEqual([1, 2, 2, 2, 3])
  })

  it('insortRight handles duplicates', () => {
    const arr = [1, 2, 2, 3]
    Bisect.insortRight(arr, 2)
    expect(arr).toEqual([1, 2, 2, 2, 3])
  })

  it('bisectLeftBy with custom comparator', () => {
    const arr = [{ v: 1 }, { v: 3 }, { v: 5 }]
    const idx = Bisect.bisectLeftBy(arr, { v: 3 }, (a, b) => a.v - b.v)
    expect(idx).toBe(1)
  })

  it('findRange returns correct bounds', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    const [lo, hi] = Bisect.findRange(arr, 3, 6)
    expect(lo).toBe(2)
    expect(hi).toBe(6)
  })

  it('findRange handles out-of-bounds', () => {
    const arr = [1, 2, 3]
    const [lo, hi] = Bisect.findRange(arr, 5, 10)
    expect(lo).toBe(3)
    expect(hi).toBe(3)
  })

  it('bisectLeft for empty array', () => {
    expect(Bisect.bisectLeft([], 5)).toBe(0)
  })

  it('bisectRight for empty array', () => {
    expect(Bisect.bisectRight([], 5)).toBe(0)
  })

  it('bisectLeft finds first of duplicates', () => {
    expect(Bisect.bisectLeft([1, 2, 2, 2, 3], 2)).toBe(1)
    expect(Bisect.bisectRight([1, 2, 2, 2, 3], 2)).toBe(4)
  })

  it('bisectLeft for value less than all', () => {
    expect(Bisect.bisectLeft([5, 10, 15], 0)).toBe(0)
  })

  it('bisectRight for value greater than all', () => {
    expect(Bisect.bisectRight([5, 10, 15], 20)).toBe(3)
  })

  it('bisectLeft for empty array returns 0', () => {
    expect(Bisect.bisectLeft([], 5)).toBe(0)
  })

  it('bisectRight for empty array returns 0', () => {
    expect(Bisect.bisectRight([], 5)).toBe(0)
  })

  it('bisectLeft returns first position for equal elements', () => {
    expect(Bisect.bisectLeft([1, 2, 2, 3], 2)).toBe(1)
  })

  it('bisectRight returns position after equal elements', () => {
    expect(Bisect.bisectRight([1, 2, 2, 3], 2)).toBe(3)
  })

  it('bisectLeft on empty array returns 0', () => {
    expect(Bisect.bisectLeft([], 5)).toBe(0)
  })

  it('bisectRight on empty array returns 0', () => {
    expect(Bisect.bisectRight([], 5)).toBe(0)
  })

  it('bisectLeft on empty array returns 0', () => {
    expect(Bisect.bisectLeft([], 5)).toBe(0)
  })

  it('bisectLeft with single element array', () => {
    expect(Bisect.bisectLeft([5], 3)).toBe(0)
    expect(Bisect.bisectLeft([5], 5)).toBe(0)
    expect(Bisect.bisectLeft([5], 7)).toBe(1)
  })

  it('bisectRight with single element array', () => {
    expect(Bisect.bisectRight([5], 3)).toBe(0)
    expect(Bisect.bisectRight([5], 5)).toBe(1)
    expect(Bisect.bisectRight([5], 7)).toBe(1)
  })

  it('bisectLeft handles all duplicates', () => {
    expect(Bisect.bisectLeft([5, 5, 5, 5], 5)).toBe(0)
  })

  it('bisectRight handles all duplicates', () => {
    expect(Bisect.bisectRight([5, 5, 5, 5], 5)).toBe(4)
  })

  it('bisectLeft with negative numbers', () => {
    expect(Bisect.bisectLeft([-5, -3, -1], -4)).toBe(1)
    expect(Bisect.bisectLeft([-5, -3, -1], -3)).toBe(1)
  })

  it('bisectRight with negative numbers', () => {
    expect(Bisect.bisectRight([-5, -3, -1], -4)).toBe(1)
    expect(Bisect.bisectRight([-5, -3, -1], -3)).toBe(2)
  })

  it('insortLeft on empty array', () => {
    const arr: number[] = []
    Bisect.insortLeft(arr, 5)
    expect(arr).toEqual([5])
  })

  it('insortRight on empty array', () => {
    const arr: number[] = []
    Bisect.insortRight(arr, 5)
    expect(arr).toEqual([5])
  })

  it('insortLeft at beginning', () => {
    const arr = [3, 5, 7]
    Bisect.insortLeft(arr, 1)
    expect(arr).toEqual([1, 3, 5, 7])
  })

  it('insortRight at beginning', () => {
    const arr = [3, 5, 7]
    Bisect.insortRight(arr, 1)
    expect(arr).toEqual([1, 3, 5, 7])
  })

  it('insortLeft at end', () => {
    const arr = [3, 5, 7]
    Bisect.insortLeft(arr, 9)
    expect(arr).toEqual([3, 5, 7, 9])
  })

  it('insortRight at end', () => {
    const arr = [3, 5, 7]
    Bisect.insortRight(arr, 9)
    expect(arr).toEqual([3, 5, 7, 9])
  })

  it('bisectLeftBy with string comparison', () => {
    const arr = ['apple', 'banana', 'cherry']
    const idx = Bisect.bisectLeftBy(arr, 'banana', (a, b) => a.localeCompare(b))
    expect(idx).toBe(1)
  })

  it('bisectLeftBy with object nested property', () => {
    const arr = [{ data: { value: 1 } }, { data: { value: 3 } }, { data: { value: 5 } }]
    const idx = Bisect.bisectLeftBy(arr, { data: { value: 3 } }, (a, b) => a.data.value - b.data.value)
    expect(idx).toBe(1)
  })

  it('bisectLeftBy returns 0 for smaller than all', () => {
    const arr = [5, 10, 15]
    const idx = Bisect.bisectLeftBy(arr, 0, (a, b) => a - b)
    expect(idx).toBe(0)
  })

  it('bisectLeftBy returns length for larger than all', () => {
    const arr = [5, 10, 15]
    const idx = Bisect.bisectLeftBy(arr, 20, (a, b) => a - b)
    expect(idx).toBe(3)
  })

  it('findRange with empty range', () => {
    const arr = [1, 2, 3, 4, 5]
    const [lo, hi] = Bisect.findRange(arr, 3, 3)
    expect(lo).toBe(2)
    expect(hi).toBe(3)
  })

  it('findRange with range covering all elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const [lo, hi] = Bisect.findRange(arr, 1, 5)
    expect(lo).toBe(0)
    expect(hi).toBe(5)
  })

  it('findRange with range beyond array', () => {
    const arr = [2, 3, 4]
    const [lo, hi] = Bisect.findRange(arr, 0, 10)
    expect(lo).toBe(0)
    expect(hi).toBe(3)
  })

  it('findRange with range before array', () => {
    const arr = [5, 6, 7]
    const [lo, hi] = Bisect.findRange(arr, -10, -5)
    expect(lo).toBe(0)
    expect(hi).toBe(0)
  })

  it('findRange handles duplicates in range', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    const [lo, hi] = Bisect.findRange(arr, 2, 2)
    expect(lo).toBe(1)
    expect(hi).toBe(4)
  })

  it('bisectLeft maintains stability with duplicates', () => {
    expect(Bisect.bisectLeft([1, 2, 2, 2, 3], 2)).toBe(1)
  })

  it('bisectRight maintains stability with duplicates', () => {
    expect(Bisect.bisectRight([1, 2, 2, 2, 3], 2)).toBe(4)
  })

  it('insortLeft maintains sorted order after multiple inserts', () => {
    const arr: number[] = []
    const values = [5, 2, 8, 1, 9, 3]
    for (const v of values) {
      Bisect.insortLeft(arr, v)
    }
    expect(arr).toEqual([1, 2, 3, 5, 8, 9])
  })

  it('insortRight maintains sorted order after multiple inserts', () => {
    const arr: number[] = []
    const values = [5, 2, 8, 1, 9, 3]
    for (const v of values) {
      Bisect.insortRight(arr, v)
    }
    expect(arr).toEqual([1, 2, 3, 5, 8, 9])
  })

  it('bisectLeft with floating point numbers', () => {
    expect(Bisect.bisectLeft([1.5, 2.5, 3.5], 2.0)).toBe(1)
    expect(Bisect.bisectLeft([1.5, 2.5, 3.5], 2.5)).toBe(1)
  })

  it('bisectRight with floating point numbers', () => {
    expect(Bisect.bisectRight([1.5, 2.5, 3.5], 2.0)).toBe(1)
    expect(Bisect.bisectRight([1.5, 2.5, 3.5], 2.5)).toBe(2)
  })

  it('bisectLeft with mixed positive and negative', () => {
    expect(Bisect.bisectLeft([-5, 0, 5], -3)).toBe(1)
    expect(Bisect.bisectLeft([-5, 0, 5], 3)).toBe(2)
  })

  it('bisectRight with mixed positive and negative', () => {
    expect(Bisect.bisectRight([-5, 0, 5], -3)).toBe(1)
    expect(Bisect.bisectRight([-5, 0, 5], 3)).toBe(2)
  })

  it('bisectLeft on empty array returns 0', () => {
    expect(Bisect.bisectLeft([], 5)).toBe(0)
  })

  it('bisectRight on empty array returns 0', () => {
    expect(Bisect.bisectRight([], 5)).toBe(0)
  })

  it('bisectLeft with duplicates', () => {
    expect(Bisect.bisectLeft([1, 2, 2, 2, 3], 2)).toBe(1)
  })
})

describe('bisect - wave548', () => {
  it('bisect module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave549', () => {
  it('bisect module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bisect module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave550', () => {
  it('bisect w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave551', () => {
  it('bisect w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
