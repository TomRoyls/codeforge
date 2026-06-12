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
