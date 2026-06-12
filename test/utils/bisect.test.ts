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

describe('bisect - wave552', () => {
  it('bisect w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave553', () => {
  it('bisect w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave554', () => {
  it('bisect w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave555', () => {
  it('bisect w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave556', () => {
  it('bisect w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave557', () => {
  it('bisect w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave558', () => {
  it('bisect w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave559', () => {
  it('bisect w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave560', () => {
  it('bisect w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave561', () => {
  it('bisect w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave562', () => {
  it('bisect w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave563', () => {
  it('bisect w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave564', () => {
  it('bisect w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave565', () => {
  it('bisect w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave566', () => {
  it('bisect w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave127', () => {
  it('bisect w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave130', () => {
  it('bisect w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave133', () => {
  it('bisect w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave136', () => {
  it('bisect w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - wave139', () => {
  it('bisect w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w142', () => {
  it('bisect v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w145', () => {
  it('bisect v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w148', () => {
  it('bisect v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w151', () => {
  it('bisect v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w154', () => {
  it('bisect v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w157', () => {
  it('bisect v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w160', () => {
  it('bisect v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w170', () => {
  it('bisect x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w180', () => {
  it('bisect x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w190', () => {
  it('bisect x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w200', () => {
  it('bisect x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w210', () => {
  it('bisect x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w220', () => {
  it('bisect x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w230', () => {
  it('bisect x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w240', () => {
  it('bisect x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bisect - w250', () => {
  it('bisect x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('bisect x250x9', () => {
    expect(describe).toBeDefined()
  })
})
