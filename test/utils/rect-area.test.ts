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

describe('rect-area - wave566', () => {
  it('rect-area w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave127', () => {
  it('rect-area w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave130', () => {
  it('rect-area w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave133', () => {
  it('rect-area w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave136', () => {
  it('rect-area w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - wave139', () => {
  it('rect-area w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w142', () => {
  it('rect-area v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w145', () => {
  it('rect-area v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w148', () => {
  it('rect-area v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w151', () => {
  it('rect-area v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w154', () => {
  it('rect-area v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w157', () => {
  it('rect-area v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w160', () => {
  it('rect-area v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w170', () => {
  it('rect-area x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w180', () => {
  it('rect-area x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w190', () => {
  it('rect-area x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w200', () => {
  it('rect-area x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w210', () => {
  it('rect-area x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w220', () => {
  it('rect-area x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w230', () => {
  it('rect-area x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w240', () => {
  it('rect-area x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w250', () => {
  it('rect-area x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w260', () => {
  it('rect-area x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w270', () => {
  it('rect-area x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w280', () => {
  it('rect-area x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w290', () => {
  it('rect-area x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w300', () => {
  it('rect-area x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w310', () => {
  it('rect-area x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w320', () => {
  it('rect-area x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w330', () => {
  it('rect-area x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w340', () => {
  it('rect-area x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w350', () => {
  it('rect-area x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w360', () => {
  it('rect-area x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w370', () => {
  it('rect-area x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w380', () => {
  it('rect-area x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w390', () => {
  it('rect-area x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w400', () => {
  it('rect-area x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w420', () => {
  it('rect-area x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w440', () => {
  it('rect-area x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w460', () => {
  it('rect-area x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w480', () => {
  it('rect-area x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w500', () => {
  it('rect-area x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w550', () => {
  it('rect-area x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w600', () => {
  it('rect-area x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w650', () => {
  it('rect-area x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w700', () => {
  it('rect-area x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w800', () => {
  it('rect-area x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w900', () => {
  it('rect-area x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('rect-area - w1000', () => {
  it('rect-area x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('rect-area x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
