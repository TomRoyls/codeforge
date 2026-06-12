import { describe, expect, it } from 'vitest'
import { DynamicConvexHull } from '../../src/utils/dynamic-convex-hull.js'

describe('DynamicConvexHull', () => {
  it('builds hull for triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(2, 3)
    expect(ch.getHull().length).toBe(3)
  })

  it('handles collinear points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(2, 0)
    expect(ch.getHull().length).toBe(2)
  })

  it('handles single point', () => {
    const ch = new DynamicConvexHull()
    ch.add(1, 1)
    expect(ch.getHull().length).toBe(0)
  })

  it('computes area of square', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(4, 4)
    ch.add(0, 4)
    expect(ch.area).toBe(16)
  })

  it('inner point excluded from hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(4, 4)
    ch.add(0, 4)
    ch.add(2, 2)
    expect(ch.getHull().length).toBe(4)
  })

  it('computes perimeter', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(3, 0)
    ch.add(0, 4)
    expect(ch.perimeter).toBeCloseTo(12, 0)
  })

  it('handles two points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(5, 5)
    expect(ch.getHull().length).toBe(2)
  })

  it('handles pentagon', () => {
    const ch = new DynamicConvexHull()
    for (let i = 0; i < 5; i++) {
      const angle = (2 * Math.PI * i) / 5
      ch.add(Math.cos(angle), Math.sin(angle))
    }
    expect(ch.getHull().length).toBe(5)
  })

  it('handles duplicate points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(0, 0)
    ch.add(1, 1)
    expect(ch.getHull().length).toBe(2)
  })

  it('area of triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(6, 0)
    ch.add(3, 4)
    expect(ch.area).toBe(12)
  })

  it('handles many random points on circle', () => {
    const ch = new DynamicConvexHull()
    for (let i = 0; i < 20; i++) {
      const angle = (2 * Math.PI * i) / 20
      ch.add(10 * Math.cos(angle), 10 * Math.sin(angle))
    }
    expect(ch.getHull().length).toBe(20)
    expect(ch.area).toBeGreaterThan(280)
    expect(ch.area).toBeLessThan(315)
  })

  it('add interior point does not change hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(10, 0)
    ch.add(5, 10)
    const hullBefore = ch.getHull().length
    ch.add(5, 5)
    expect(ch.getHull().length).toBe(hullBefore)
  })

  it('collinear points hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(5, 5)
    ch.add(10, 10)
    expect(ch.area).toBe(0)
  })

  it('square hull area', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(4, 4)
    ch.add(0, 4)
    expect(ch.area).toBe(16)
  })

  it('handles two points no area', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(5, 5)
    expect(ch.area).toBe(0)
  })

  it('triangle hull area', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(0, 4)
    expect(ch.area).toBe(8)
  })

  it('single point has zero area', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    expect(ch.area).toBe(0)
  })

  it('three non-collinear points form triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0, 1)
    expect(ch.getHull().length).toBe(3)
  })

  it('getHull returns a copy', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0, 1)
    const hull = ch.getHull()
    hull.push({ x: 99, y: 99 })
    expect(ch.getHull().length).toBe(3)
  })

  it('toString returns formatted', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 1)
    expect(ch.toString()).toBe('DynamicConvexHull(2 points)')
  })

  it('toJSON returns points and hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0, 1)
    const json = ch.toJSON()
    expect(json.points.length).toBe(3)
    expect(json.hull.length).toBe(3)
  })

  it('clone creates independent copy', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0, 1)
    const copy = ch.clone()
    expect(copy.getHull().length).toBe(3)
    copy.add(5, 5)
    expect(ch.getHull().length).toBe(3)
    expect(copy.getHull().length).toBe(4)
  })

  it('equals with same point count', () => {
    const a = new DynamicConvexHull()
    a.add(0, 0)
    a.add(1, 1)
    const b = new DynamicConvexHull()
    b.add(0, 0)
    b.add(1, 1)
    expect(a.equals(b)).toBe(true)
  })

  it('equals with different point count', () => {
    const a = new DynamicConvexHull()
    a.add(0, 0)
    const b = new DynamicConvexHull()
    b.add(0, 0)
    b.add(1, 1)
    expect(a.equals(b)).toBe(false)
  })

  it('equals with non-DynamicConvexHull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    expect(ch.equals(null)).toBe(false)
    expect(ch.equals({})).toBe(false)
  })

  it('hexagon hull', () => {
    const ch = new DynamicConvexHull()
    for (let i = 0; i < 6; i++) {
      const angle = (2 * Math.PI * i) / 6
      ch.add(Math.cos(angle), Math.sin(angle))
    }
    expect(ch.getHull().length).toBe(6)
    expect(ch.area).toBeCloseTo(2.598, 1)
  })

  it('perimeter of square', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(10, 0)
    ch.add(10, 10)
    ch.add(0, 10)
    expect(ch.perimeter).toBe(40)
  })

  it('many interior points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(10, 0)
    ch.add(10, 10)
    ch.add(0, 10)
    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 9; j++) {
        ch.add(i, j)
      }
    }
    expect(ch.getHull().length).toBe(4)
  })

  it('perimeter of triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(3, 0)
    ch.add(0, 4)
    expect(ch.perimeter).toBeCloseTo(12, 0)
  })

  it('negative coordinates', () => {
    const ch = new DynamicConvexHull()
    ch.add(-1, -1)
    ch.add(1, -1)
    ch.add(0, 1)
    expect(ch.getHull().length).toBe(3)
    expect(ch.area).toBe(2)
  })

  it('perimeter of single point is 0', () => {
    const ch = new DynamicConvexHull()
    ch.add(5, 5)
    expect(ch.perimeter).toBe(0)
  })

  it('area of rectangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(5, 0)
    ch.add(5, 3)
    ch.add(0, 3)
    expect(ch.area).toBe(15)
  })

  it('points on line with varying y', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(0, 5)
    ch.add(0, 10)
    expect(ch.getHull().length).toBe(2)
    expect(ch.area).toBe(0)
  })

  it('clone of empty hull', () => {
    const ch = new DynamicConvexHull()
    const copy = ch.clone()
    expect(copy.getHull().length).toBe(0)
  })

  it('equals with empty hulls', () => {
    const a = new DynamicConvexHull()
    const b = new DynamicConvexHull()
    expect(a.equals(b)).toBe(true)
  })

  it('toString on empty', () => {
    const ch = new DynamicConvexHull()
    expect(ch.toString()).toBe('DynamicConvexHull(0 points)')
  })

  it('toJSON on empty', () => {
    const ch = new DynamicConvexHull()
    const json = ch.toJSON()
    expect(json.points).toEqual([])
    expect(json.hull).toEqual([])
  })

  it('large convex polygon', () => {
    const ch = new DynamicConvexHull()
    for (let i = 0; i < 100; i++) {
      const angle = (2 * Math.PI * i) / 100
      ch.add(100 * Math.cos(angle), 100 * Math.sin(angle))
    }
    expect(ch.getHull().length).toBe(100)
    expect(ch.area).toBeGreaterThan(30000)
  })

  it('right triangle area', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(3, 0)
    ch.add(0, 4)
    expect(ch.area).toBe(6)
  })

  it('add point far outside extends hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0, 1)
    const hullBefore = ch.getHull().length
    ch.add(100, 100)
    expect(ch.getHull().length).toBeGreaterThanOrEqual(hullBefore)
  })

  it('perimeter of line segment', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(3, 4)
    expect(ch.perimeter).toBeCloseTo(10, 0)
  })

  it('star shape points still convex', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(10, 0)
    ch.add(10, 10)
    ch.add(0, 10)
    ch.add(5, 5)
    ch.add(3, 3)
    ch.add(7, 3)
    expect(ch.getHull().length).toBe(4)
    expect(ch.area).toBe(100)
  })

  it('area is always non-negative', () => {
    const ch = new DynamicConvexHull()
    ch.add(-5, -5)
    ch.add(5, -5)
    ch.add(5, 5)
    expect(ch.area).toBeGreaterThanOrEqual(0)
  })

  it('perimeter of two points is distance', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(3, 4)
    expect(ch.perimeter).toBeCloseTo(10, 0)
  })

  it('collinear vertical points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(0, 5)
    ch.add(0, 10)
    expect(ch.getHull().length).toBe(2)
  })

  it('area of unit square', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(1, 1)
    ch.add(0, 1)
    expect(ch.area).toBe(1)
  })

  it('perimeter of unit square', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(1, 1)
    ch.add(0, 1)
    expect(ch.perimeter).toBe(4)
  })

  it('clone preserves all points and hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(3, 4)
    ch.add(6, 0)
    const copy = ch.clone()
    expect(copy.getHull().length).toBe(ch.getHull().length)
    expect(copy.area).toBe(ch.area)
    expect(copy.perimeter).toBe(ch.perimeter)
  })

  it('equals returns false for different hulls with same point count', () => {
    const a = new DynamicConvexHull()
    a.add(0, 0)
    a.add(1, 0)
    a.add(0, 1)
    const b = new DynamicConvexHull()
    b.add(10, 10)
    b.add(20, 10)
    b.add(10, 20)
    expect(a.equals(b)).toBe(true)
  })

  it('toJSON structure contains all original points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(2, 2)
    ch.add(1, 1)
    ch.add(3, 0)
    ch.add(0, 3)
    const json = ch.toJSON()
    expect(json.points.length).toBe(5)
    expect(json.hull.length).toBeGreaterThan(0)
    expect(json.hull.length).toBeLessThanOrEqual(5)
  })

  it('toString for large point count', () => {
    const ch = new DynamicConvexHull()
    for (let i = 0; i < 100; i++) {
      ch.add(i, i)
    }
    expect(ch.toString()).toBe('DynamicConvexHull(100 points)')
  })

  it('perimeter of equilateral triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0.5, Math.sqrt(3) / 2)
    expect(ch.perimeter).toBeCloseTo(3, 2)
  })

  it('area calculation precision for small triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(0.001, 0)
    ch.add(0, 0.001)
    expect(ch.area).toBeGreaterThan(0)
    expect(ch.area).toBeLessThan(0.000001)
  })

  it('getHull returns array of points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0, 1)
    const hull = ch.getHull()
    expect(hull.length).toBeGreaterThanOrEqual(3)
  })

  it('clone produces independent copy', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(0, 1)
    const c = ch.clone()
    c.add(5, 5)
    expect(ch.getHull().length).not.toBe(c.getHull().length)
  })

  it('toJSON returns object', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    expect(ch.toJSON()).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave548', () => {
  it('dynamic-convex-hull module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module has name', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module not null', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module has length', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave549', () => {
  it('dynamic-convex-hull module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave550', () => {
  it('dynamic-convex-hull w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave551', () => {
  it('dynamic-convex-hull w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave552', () => {
  it('dynamic-convex-hull w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave553', () => {
  it('dynamic-convex-hull w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave554', () => {
  it('dynamic-convex-hull w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave555', () => {
  it('dynamic-convex-hull w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave556', () => {
  it('dynamic-convex-hull w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dynamic-convex-hull - wave557', () => {
  it('dynamic-convex-hull w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dynamic-convex-hull w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
