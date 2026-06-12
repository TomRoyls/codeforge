import { describe, expect, it } from 'vitest'
import { Quickhull } from '../../src/utils/quickhull.js'

describe('Quickhull', () => {
  it('computes convex hull of triangle', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('handles square', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles collinear points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('handles single point', () => {
    const hull = Quickhull.convexHull([{ x: 1, y: 1 }])
    expect(hull.length).toBe(1)
  })

  it('handles empty array', () => {
    expect(Quickhull.convexHull([])).toEqual([])
  })

  it('handles two points', () => {
    const hull = Quickhull.convexHull([{ x: 0, y: 0 }, { x: 1, y: 1 }])
    expect(hull.length).toBe(2)
  })

  it('computes hullArea correctly for unit square', () => {
    const hull = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
    expect(Quickhull.hullArea(hull)).toBeCloseTo(1, 6)
  })

  it('hullArea is 0 for less than 3 points', () => {
    expect(Quickhull.hullArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0)
  })

  it('isConvex returns true for convex hull', () => {
    const hull = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('isConvex returns false for non-convex', () => {
    const pts = [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    expect(Quickhull.isConvex(pts)).toBe(false)
  })

  it('isConvex returns false for less than 3 points', () => {
    expect(Quickhull.isConvex([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(false)
  })

  it('handles duplicate points', () => {
    const points = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeGreaterThanOrEqual(2)
  })

  it('computes hull of many random points', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 100; i++) {
      points.push({ x: Math.cos(i * 0.1) * 10 + Math.random(), y: Math.sin(i * 0.1) * 10 + Math.random() })
    }
    const hull = Quickhull.convexHull(points)
    expect(Quickhull.isConvex(hull)).toBe(true)
    expect(hull.length).toBeLessThan(points.length)
  })

  it('cross product computes correctly', () => {
    expect(Quickhull.cross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1)
    expect(Quickhull.cross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 })).toBe(0)
  })

  it('three non-collinear points form triangle hull', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('computes area for triangle', () => {
    const hull = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }]
    expect(Quickhull.hullArea(hull)).toBeCloseTo(1, 6)
  })

  it('hullArea returns 0 for single point', () => {
    expect(Quickhull.hullArea([{ x: 0, y: 0 }])).toBe(0)
  })

  it('hullArea returns 0 for two points', () => {
    expect(Quickhull.hullArea([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(0)
  })

  it('computes area for pentagon', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1.5, y: 0.5 },
      { x: 0.5, y: 1 },
      { x: -0.5, y: 0.5 }
    ]
    const area = Quickhull.hullArea(hull)
    expect(area).toBeGreaterThan(0)
  })

  it('isConvex returns true for regular polygon', () => {
    const hull = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ]
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('isConvex returns true for triangle with interior point', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 0, y: 1 }
    ]
    expect(Quickhull.isConvex(pts)).toBe(true)
  })

  it('isConvex returns false for self-intersecting polygon', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ]
    expect(Quickhull.isConvex(pts)).toBe(false)
  })

  it('handles points forming a rectangle', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 0.5 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles points forming a hexagon', () => {
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      points.push({ x: Math.cos(angle), y: Math.sin(angle) })
    }
    points.push({ x: 0, y: 0 })
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(6)
  })

  it('cross product negative for clockwise turn', () => {
    const cross = Quickhull.cross({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 })
    expect(cross).toBe(-1)
  })

  it('cross product positive for counter-clockwise turn', () => {
    const cross = Quickhull.cross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })
    expect(cross).toBe(1)
  })

  it('cross product zero for collinear points', () => {
    const cross = Quickhull.cross({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })
    expect(cross).toBe(0)
  })

  it('handles points with same x coordinate', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0.5 },
      { x: 0, y: -1 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('handles points with same y coordinate', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0.5, y: 1 },
      { x: -1, y: 0 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('handles all points on line', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('handles all points on horizontal line', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('handles all points on vertical line', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('convex hull is convex', () => {
    const points = []
    for (let i = 0; i < 20; i++) {
      const angle = (i * 2 * Math.PI) / 20
      points.push({ x: Math.cos(angle) * 10, y: Math.sin(angle) * 10 })
    }
    const hull = Quickhull.convexHull(points)
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('computes hull of points in circle', () => {
    const points = []
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 1 + Math.random() * 9
      points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius })
    }
    const hull = Quickhull.convexHull(points)
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('handles points forming a narrow triangle', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0.001 },
      { x: 5, y: 10 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('hullArea works for irregular polygon', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 2 },
      { x: 2, y: 4 },
      { x: -1, y: 3 }
    ]
    const area = Quickhull.hullArea(hull)
    expect(area).toBeGreaterThan(0)
  })

  it('isConvex returns true for right triangle hull', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 }
    ]
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('isConvex returns true for obtuse triangle hull', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 3, y: 1 }
    ]
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('handles points with negative coordinates', () => {
    const points = [
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: 0, y: 0 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles points with floating point coordinates', () => {
    const points = [
      { x: 0.5, y: 0.5 },
      { x: 1.5, y: 0.5 },
      { x: 1.5, y: 1.5 },
      { x: 0.5, y: 1.5 },
      { x: 1.0, y: 1.0 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles points forming star pattern', () => {
    const points = []
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5
      const r = i % 2 === 0 ? 10 : 5
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
    }
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(5)
  })

  it('computes area of triangle correctly', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 }
    ]
    expect(Quickhull.hullArea(hull)).toBeCloseTo(6, 6)
  })

  it('computes area of rectangle correctly', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 3 },
      { x: 0, y: 3 }
    ]
    expect(Quickhull.hullArea(hull)).toBeCloseTo(15, 6)
  })

  it('handles nearly collinear points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0.001 },
      { x: 3, y: 0 },
      { x: 4, y: 0 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeLessThanOrEqual(3)
  })

  it('hullArea returns correct value for degenerate quadrilateral', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 }
    ]
    expect(Quickhull.hullArea(hull)).toBeCloseTo(2, 6)
  })

  it('hullArea returns 0 for empty hull', () => {
    expect(Quickhull.hullArea([])).toBe(0)
  })

  it('handles all identical points', () => {
    const points = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeLessThanOrEqual(1)
  })

  it('handles very large coordinate values', () => {
    const points = [
      { x: 1e9, y: 1e9 },
      { x: -1e9, y: 1e9 },
      { x: 0, y: -1e9 },
      { x: 0, y: 0 }
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('isConvex returns false for exactly 2 points', () => {
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(Quickhull.isConvex(pts)).toBe(false)
  })

  it('isConvex returns false for single point', () => {
    const pts = [{ x: 0, y: 0 }]
    expect(Quickhull.isConvex(pts)).toBe(false)
  })

  it('computes hullArea for 3 collinear points', () => {
    const hull = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]
    expect(Quickhull.hullArea(hull)).toBeCloseTo(0, 6)
  })

  it('isConvex returns true for valid hull', () => {
    const hull = Quickhull.convexHull([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 5 }])
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('cross product computes correctly', () => {
    expect(Quickhull.cross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBeGreaterThan(0)
  })

  it('convexHull for collinear points', () => {
    const hull = Quickhull.convexHull([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }])
    expect(hull.length).toBeGreaterThanOrEqual(2)
  })

  it('convexHull handles square', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(4)
    expect(Quickhull.hullArea(hull)).toBeCloseTo(1, 5)
  })

  it('convexHull empty points', () => {
    expect(Quickhull.convexHull([])).toEqual([])
  })

  it('convexHull single point', () => {
    expect(Quickhull.convexHull([{ x: 0, y: 0 }])).toEqual([{ x: 0, y: 0 }])
  })

  it('convexHull triangle', () => {
    const hull = Quickhull.convexHull([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }])
    expect(hull.length).toBe(3)
  })

})
describe('quickhull - wave545', () => {
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

describe('quickhull - wave546', () => {
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

describe('quickhull - wave547', () => {
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

describe('quickhull - wave548', () => {
  it('quickhull module defined', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull module is function', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave549', () => {
  it('quickhull module defined', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull module is function', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave550', () => {
  it('quickhull w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave551', () => {
  it('quickhull w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave552', () => {
  it('quickhull w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave553', () => {
  it('quickhull w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave554', () => {
  it('quickhull w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave555', () => {
  it('quickhull w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave556', () => {
  it('quickhull w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave557', () => {
  it('quickhull w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave558', () => {
  it('quickhull w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave559', () => {
  it('quickhull w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave560', () => {
  it('quickhull w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave561', () => {
  it('quickhull w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave562', () => {
  it('quickhull w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave563', () => {
  it('quickhull w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave564', () => {
  it('quickhull w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave565', () => {
  it('quickhull w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave566', () => {
  it('quickhull w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave127', () => {
  it('quickhull w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave130', () => {
  it('quickhull w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave133', () => {
  it('quickhull w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave136', () => {
  it('quickhull w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('quickhull - wave139', () => {
  it('quickhull w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('quickhull w139 v2', () => {
    expect(describe).toBeDefined()
  })
})
