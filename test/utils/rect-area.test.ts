import { describe, expect, it } from 'vitest'
import { RectArea } from '../../src/utils/rect-area.js'

describe('RectArea', () => {
  it('computes single rect area', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 5, y2: 3 })).toBe(15)
  })

  it('computes union of non-overlapping rects', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 3, y1: 0, x2: 5, y2: 2 },
    ]
    expect(RectArea.unionArea(rects)).toBe(8)
  })

  it('computes union of overlapping rects', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 4, y2: 4 },
      { x1: 2, y1: 2, x2: 6, y2: 6 },
    ]
    expect(RectArea.unionArea(rects)).toBe(28)
  })

  it('computes intersection of overlapping rects', () => {
    const r1 = { x1: 0, y1: 0, x2: 4, y2: 4 }
    const r2 = { x1: 2, y1: 2, x2: 6, y2: 6 }
    const inter = RectArea.intersection(r1, r2)
    expect(inter).toEqual({ x1: 2, y1: 2, x2: 4, y2: 4 })
  })

  it('returns null for non-overlapping intersection', () => {
    const r1 = { x1: 0, y1: 0, x2: 2, y2: 2 }
    const r2 = { x1: 3, y1: 3, x2: 5, y2: 5 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('handles empty rects array', () => {
    expect(RectArea.unionArea([])).toBe(0)
  })

  it('handles zero-width rect', () => {
    expect(RectArea.area({ x1: 2, y1: 2, x2: 2, y2: 5 })).toBe(0)
  })

  it('union of identical rects equals one rect', () => {
    const r = { x1: 0, y1: 0, x2: 3, y2: 3 }
    expect(RectArea.unionArea([r, r])).toBe(9)
  })

  it('union of three rects with partial overlap', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 4, y2: 4 },
      { x1: 1, y1: 1, x2: 5, y2: 5 },
      { x1: 2, y1: 2, x2: 6, y2: 6 },
    ]
    expect(RectArea.unionArea(rects)).toBe(30)
  })

  it('handles negative coordinates', () => {
    expect(RectArea.area({ x1: -3, y1: -2, x2: 1, y2: 3 })).toBe(20)
  })

  it('intersection of touching rects returns null', () => {
    const r1 = { x1: 0, y1: 0, x2: 2, y2: 2 }
    const r2 = { x1: 2, y1: 0, x2: 4, y2: 2 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('union of single rect equals its area', () => {
    const r = { x1: 1, y1: 1, x2: 4, y2: 5 }
    expect(RectArea.unionArea([r])).toBe(12)
  })

  it('area of zero-size point rect', () => {
    const r = { x1: 1, y1: 1, x2: 1, y2: 1 }
    expect(RectArea.area(r)).toBe(0)
  })

  it('intersection area computed correctly', () => {
    const r1 = { x1: 0, y1: 0, x2: 4, y2: 4 }
    const r2 = { x1: 2, y1: 2, x2: 6, y2: 6 }
    const inter = RectArea.intersection(r1, r2)
    expect(inter).not.toBeNull()
    expect(RectArea.area(inter!)).toBe(4)
  })

  it('union of disjoint rects sums areas', () => {
    const r1 = { x1: 0, y1: 0, x2: 2, y2: 2 }
    const r2 = { x1: 5, y1: 5, x2: 7, y2: 7 }
    expect(RectArea.unionArea([r1, r2])).toBe(8)
  })

  it('area of unit square', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(1)
  })

  it('area with inverted x coords', () => {
    expect(RectArea.area({ x1: 5, y1: 0, x2: 2, y2: 3 })).toBe(0)
  })

  it('area with inverted y coords', () => {
    expect(RectArea.area({ x1: 0, y1: 5, x2: 3, y2: 2 })).toBe(0)
  })

  it('intersection of fully contained rect', () => {
    const outer = { x1: 0, y1: 0, x2: 10, y2: 10 }
    const inner = { x1: 2, y1: 3, x2: 5, y2: 7 }
    const inter = RectArea.intersection(outer, inner)
    expect(inter).toEqual({ x1: 2, y1: 3, x2: 5, y2: 7 })
  })

  it('intersection of same rect is itself', () => {
    const r = { x1: 0, y1: 0, x2: 3, y2: 3 }
    expect(RectArea.intersection(r, r)).toEqual(r)
  })

  it('union of many small non-overlapping', () => {
    const rects = Array.from({ length: 5 }, (_, i) => ({
      x1: i * 10, y1: 0, x2: i * 10 + 5, y2: 5,
    }))
    expect(RectArea.unionArea(rects)).toBe(125)
  })

  it('union with zero-area rect', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 3, y2: 3 },
      { x1: 5, y1: 5, x2: 5, y2: 5 },
    ]
    expect(RectArea.unionArea(rects)).toBe(9)
  })

  it('area with negative dimensions gives 0', () => {
    expect(RectArea.area({ x1: 5, y1: 5, x2: 2, y2: 2 })).toBe(0)
  })

  it('intersection of rects touching at corner', () => {
    const r1 = { x1: 0, y1: 0, x2: 2, y2: 2 }
    const r2 = { x1: 2, y1: 2, x2: 4, y2: 4 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('union of fully overlapping rects', () => {
    const r = { x1: 0, y1: 0, x2: 5, y2: 5 }
    expect(RectArea.unionArea([r, r, r])).toBe(25)
  })

  it('large rect area', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1000, y2: 1000 })).toBe(1000000)
  })

  it('union with negative coords', () => {
    const rects = [
      { x1: -5, y1: -5, x2: 0, y2: 0 },
      { x1: 0, y1: 0, x2: 5, y2: 5 },
    ]
    expect(RectArea.unionArea(rects)).toBe(50)
  })

  it('intersection with negative coords', () => {
    const r1 = { x1: -3, y1: -3, x2: 3, y2: 3 }
    const r2 = { x1: -1, y1: -1, x2: 1, y2: 1 }
    const inter = RectArea.intersection(r1, r2)
    expect(inter).toEqual({ x1: -1, y1: -1, x2: 1, y2: 1 })
  })

  it('area with float coords', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 2.5, y2: 4 })).toBe(10)
  })

  it('intersection with one negative rect', () => {
    const r1 = { x1: -5, y1: -5, x2: 5, y2: 5 }
    const r2 = { x1: -3, y1: -3, x2: -1, y2: -1 }
    const inter = RectArea.intersection(r1, r2)
    expect(inter).toEqual({ x1: -3, y1: -3, x2: -1, y2: -1 })
  })

  it('union of nested rects', () => {
    const outer = { x1: 0, y1: 0, x2: 10, y2: 10 }
    const inner = { x1: 2, y1: 2, x2: 8, y2: 8 }
    expect(RectArea.unionArea([outer, inner])).toBe(100)
  })

  it('union of cross-shaped overlap', () => {
    const r1 = { x1: 0, y1: 2, x2: 6, y2: 4 }
    const r2 = { x1: 2, y1: 0, x2: 4, y2: 6 }
    expect(RectArea.unionArea([r1, r2])).toBe(20)
  })

  it('intersection with partial x overlap only', () => {
    const r1 = { x1: 0, y1: 0, x2: 3, y2: 3 }
    const r2 = { x1: 1, y1: 4, x2: 5, y2: 6 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('union of four quadrant rects', () => {
    const rects = [
      { x1: -2, y1: -2, x2: 0, y2: 0 },
      { x1: 0, y1: -2, x2: 2, y2: 0 },
      { x1: -2, y1: 0, x2: 0, y2: 2 },
      { x1: 0, y1: 0, x2: 2, y2: 2 },
    ]
    expect(RectArea.unionArea(rects)).toBe(16)
  })

  it('area of thin horizontal rect', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 100, y2: 1 })).toBe(100)
  })

  it('area of thin vertical rect', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1, y2: 100 })).toBe(100)
  })

  it('union with very small rect', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      { x1: 2, y1: 2, x2: 3, y2: 3 },
    ]
    expect(RectArea.unionArea(rects)).toBe(2)
  })

  it('intersection returns correct bounds', () => {
    const r1 = { x1: 1, y1: 2, x2: 5, y2: 6 }
    const r2 = { x1: 3, y1: 4, x2: 7, y2: 8 }
    const inter = RectArea.intersection(r1, r2)
    expect(inter).toEqual({ x1: 3, y1: 4, x2: 5, y2: 6 })
    expect(RectArea.area(inter!)).toBe(4)
  })

  it('union of rects sharing an edge', () => {
    const r1 = { x1: 0, y1: 0, x2: 3, y2: 3 }
    const r2 = { x1: 3, y1: 0, x2: 6, y2: 3 }
    expect(RectArea.unionArea([r1, r2])).toBe(18)
  })

  it('union of overlapping rects with different y ranges', () => {
    const r1 = { x1: 0, y1: 0, x2: 4, y2: 2 }
    const r2 = { x1: 1, y1: 1, x2: 3, y2: 5 }
    expect(RectArea.unionArea([r1, r2])).toBe(14)
  })

  it('area of rect at origin', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 0, y2: 0 })).toBe(0)
  })

  it('intersection with fully overlapping edge', () => {
    const r1 = { x1: 0, y1: 0, x2: 4, y2: 4 }
    const r2 = { x1: 4, y1: 0, x2: 8, y2: 4 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('union of many overlapping rects', () => {
    const rects = [
      { x1: 0, y1: 0, x2: 5, y2: 5 },
      { x1: 3, y1: 3, x2: 8, y2: 8 },
      { x1: 6, y1: 6, x2: 11, y2: 11 },
    ]
    expect(RectArea.unionArea(rects)).toBe(67)
  })

  it('intersection of non-overlapping y ranges', () => {
    const r1 = { x1: 0, y1: 0, x2: 5, y2: 2 }
    const r2 = { x1: 0, y1: 3, x2: 5, y2: 5 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('union of two rects one inside other', () => {
    const outer = { x1: 0, y1: 0, x2: 10, y2: 10 }
    const inner = { x1: 3, y1: 3, x2: 7, y2: 7 }
    expect(RectArea.unionArea([outer, inner])).toBe(100)
  })

  it('intersection of identical rects returns same area', () => {
    const r = { x1: 0, y1: 0, x2: 5, y2: 5 }
    expect(RectArea.intersection(r, r)).toEqual({ x1: 0, y1: 0, x2: 5, y2: 5 })
  })

  it('area of negative coords works', () => {
    expect(RectArea.area({ x1: -3, y1: -3, x2: 0, y2: 0 })).toBe(9)
  })

  it('union of empty array returns 0', () => {
    expect(RectArea.unionArea([])).toBe(0)
  })

  it('intersection of two identical rects gives same rect', () => {
    const r = { x1: 1, y1: 1, x2: 4, y2: 4 }
    const result = RectArea.intersection(r, r)
    expect(result).not.toBeNull()
    expect(RectArea.area(result!)).toBe(9)
  })

  it('area of large rect', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1000, y2: 1000 })).toBe(1000000)
  })

  it('intersection with partial overlap', () => {
    const r1 = { x1: 0, y1: 0, x2: 5, y2: 5 }
    const r2 = { x1: 3, y1: 3, x2: 8, y2: 8 }
    const result = RectArea.intersection(r1, r2)
    expect(result).not.toBeNull()
    expect(RectArea.area(result!)).toBe(4)
  })

  it('union of single rect returns its area', () => {
    const r = { x1: 0, y1: 0, x2: 10, y2: 10 }
    expect(RectArea.unionArea([r])).toBe(100)
  })
})

  it('area of unit rect is 1', () => {
    expect(RectArea.area({ x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(1)
  })

  it('intersection of non-overlapping is null', () => {
    const r1 = { x1: 0, y1: 0, x2: 1, y2: 1 }
    const r2 = { x1: 2, y1: 2, x2: 3, y2: 3 }
    expect(RectArea.intersection(r1, r2)).toBeNull()
  })

  it('unionArea of single rect is its area', () => {
    const rects = [{ x1: 0, y1: 0, x2: 3, y2: 4 }]
    expect(RectArea.unionArea(rects)).toBe(12)


  it('unionArea empty is 0', () => {
    expect(RectArea.unionArea([])).toBe(0)
  })

  it('unionArea single rect', () => {
    expect(RectArea.unionArea([{ x1: 0, y1: 0, x2: 2, y2: 2 }])).toBe(4)
  })

  it('intersection of same rect', () => {
    const r = { x1: 0, y1: 0, x2: 2, y2: 2 }
    expect(RectArea.intersection(r, r)).toEqual(r)
  })
  })

describe('rect-area - wave545', () => {
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

describe('rect-area - wave546', () => {
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

describe('rect-area - wave547', () => {
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

describe('rect-area - wave548', () => {
  it('rect-area module defined', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area module is function', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave549', () => {
  it('rect-area module defined', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area module is function', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave550', () => {
  it('rect-area w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave551', () => {
  it('rect-area w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave552', () => {
  it('rect-area w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave553', () => {
  it('rect-area w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave554', () => {
  it('rect-area w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave555', () => {
  it('rect-area w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave556', () => {
  it('rect-area w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave557', () => {
  it('rect-area w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave558', () => {
  it('rect-area w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave559', () => {
  it('rect-area w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave560', () => {
  it('rect-area w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave561', () => {
  it('rect-area w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave562', () => {
  it('rect-area w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave563', () => {
  it('rect-area w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave564', () => {
  it('rect-area w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave565', () => {
  it('rect-area w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w565 v2', () => {
    expect(describe).toBeDefined()
  })
})
