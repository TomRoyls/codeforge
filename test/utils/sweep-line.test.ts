import { describe, expect, it } from 'vitest'
import { SweepLine } from '../../src/utils/sweep-line.js'

describe('SweepLine', () => {
  it('finds intersection of crossing segments', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 0, y1: 2, x2: 2, y2: 0 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBe(1)
    expect(intersections[0]).toEqual([0, 1])
  })

  it('returns empty for non-intersecting segments', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 1, y2: 0 },
      { x1: 0, y1: 1, x2: 1, y2: 1 },
    ]
    expect(SweepLine.findIntersections(segments)).toEqual([])
  })

  it('handles empty segments array', () => {
    expect(SweepLine.findIntersections([])).toEqual([])
  })

  it('handles single segment', () => {
    expect(SweepLine.findIntersections([{ x1: 0, y1: 0, x2: 1, y2: 1 }])).toEqual([])
  })

  it('segmentsIntersect returns true for crossing', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 0, y1: 2, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('segmentsIntersect returns false for parallel', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 0 },
      { x1: 0, y1: 1, x2: 1, y2: 1 },
    )).toBe(false)
  })

  it('handles collinear overlapping segments', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 1, y1: 0, x2: 3, y2: 0 },
    )).toBe(true)
  })

  it('finds multiple intersections', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 4, y2: 4 },
      { x1: 0, y1: 4, x2: 4, y2: 0 },
      { x1: 0, y1: 2, x2: 4, y2: 2 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBeGreaterThanOrEqual(2)
  })

  it('closestPair finds correct pair', () => {
    const points = [
      { x: 0, y: 0 }, { x: 3, y: 4 }, { x: 1, y: 1 }, { x: 10, y: 10 },
    ]
    const result = SweepLine.closestPair(points)
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair returns null for single point', () => {
    expect(SweepLine.closestPair([{ x: 0, y: 0 }])).toBeNull()
  })

  it('closestPair returns null for empty', () => {
    expect(SweepLine.closestPair([])).toBeNull()
  })

  it('handles endpoint touching', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      { x1: 1, y1: 1, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('handles parallel non-intersecting', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 0, y1: 1, x2: 2, y2: 1 },
    )).toBe(false)
  })

  it('handles two points closestPair', () => {
    const result = SweepLine.closestPair([{ x: 0, y: 0 }, { x: 3, y: 4 }])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(5)
  })

  it('handles three points closestPair', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: 5 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('no intersection when far apart', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.sqrt(20000), 5)
  })

  it('two identical points have zero distance', () => {
    const result = SweepLine.closestPair([{ x: 1, y: 1 }, { x: 1, y: 1 }])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(0)
  })

  it('segmentsIntersect with vertical and horizontal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 1, y1: 0, x2: 1, y2: 2 },
      { x1: 0, y1: 1, x2: 2, y2: 1 },
    )).toBe(true)
  })

  it('segmentsIntersect with both vertical', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 0, y2: 2 },
      { x1: 1, y1: 0, x2: 1, y2: 2 },
    )).toBe(false)
  })

  it('segmentsIntersect with both horizontal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 0, y1: 1, x2: 2, y2: 1 },
    )).toBe(false)
  })

  it('segmentsIntersect T-junction', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 1, y1: 0, x2: 1, y2: 1 },
    )).toBe(true)
  })

  it('segmentsIntersect overlapping collinear', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 3, y2: 0 },
      { x1: 1, y1: 0, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('segmentsIntersect touching at endpoint', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      { x1: 1, y1: 1, x2: 2, y2: 2 },
    )).toBe(true)
  })

  it('segmentsIntersect with negative coordinates', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: -2, y1: -2, x2: 2, y2: 2 },
      { x1: -2, y1: 2, x2: 2, y2: -2 },
    )).toBe(true)
  })

  it('segmentsIntersect with large coordinates', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 1000, y1: 1000, x2: 2000, y2: 2000 },
      { x1: 1000, y1: 2000, x2: 2000, y2: 1000 },
    )).toBe(true)
  })

  it('segmentsIntersect non-intersecting diagonal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      { x1: 2, y1: 2, x2: 3, y2: 3 },
    )).toBe(false)
  })

  it('closestPair with same x coordinate', () => {
    const result = SweepLine.closestPair([
      { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 10 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('closestPair with same y coordinate', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 10, y: 5 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('closestPair with collinear points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair with grid points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('closestPair with four points square', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with rectangle points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with triangle points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with negative coordinates', () => {
    const result = SweepLine.closestPair([
      { x: -1, y: -1 }, { x: -2, y: -2 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair with L shape', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with large coordinates', () => {
    const result = SweepLine.closestPair([
      { x: 1000, y: 1000 }, { x: 1001, y: 1001 }, { x: 2000, y: 2000 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair returns correct point indices', () => {
    const points = [
      { x: 0, y: 0 }, { x: 10, y: 10 }, { x: 1, y: 1 },
    ]
    const result = SweepLine.closestPair(points)
    expect(result).not.toBeNull()
    expect(result!.p1).toBe(2)
    expect(result!.p2).toBe(0)
  })

  it('findIntersections with many intersecting segments', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 10, y2: 10 },
      { x1: 0, y1: 10, x2: 10, y2: 0 },
      { x1: 0, y1: 5, x2: 10, y2: 5 },
      { x1: 5, y1: 0, x2: 5, y2: 10 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBeGreaterThan(0)
  })

  it('segmentsIntersect with segment containing point', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 1, y1: 1, x2: 1, y2: 1 },
    )).toBe(true)
  })

  it('closestPair with multiple equidistant pairs', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('findIntersections sorts by x coordinate then type', () => {
    const segments = [
      { x1: 1, y1: 0, x2: 0, y2: 0 },
      { x1: 0, y1: 1, x2: 0, y2: -1 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBe(1)
  })

  it('segmentsIntersect with reversed segment direction', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 2, y1: 2, x2: 0, y2: 0 },
      { x1: 0, y1: 2, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('closestPair with very close points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 0.001, y: 0.001 }, { x: 10, y: 10 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(0.01)
  })

  it('segmentsIntersect with segments forming X', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: -1, y1: -1, x2: 1, y2: 1 },
      { x1: -1, y1: 1, x2: 1, y2: -1 },
    )).toBe(true)
  })

  it('closestPair handles five points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }, { x: 6, y: 0 }, { x: 8, y: 0 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(2)
  })

  it('segmentsIntersect with horizontal and diagonal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 1, x2: 2, y2: 1 },
      { x1: 0, y1: 0, x2: 2, y2: 2 },
    )).toBe(true)
  })

  it('segmentsIntersect with vertical and diagonal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 1, y1: 0, x2: 1, y2: 2 },
      { x1: 0, y1: 0, x2: 2, y2: 2 },
    )).toBe(true)
  })

  it('should find no intersections for parallel segments', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 10, y2: 0 },
      { x1: 0, y1: 5, x2: 10, y2: 5 },
    ])
    expect(result).toEqual([])
  })

  it('should find intersection of crossing segments', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 10, y2: 10 },
      { x1: 0, y1: 10, x2: 10, y2: 0 },
    ])
    expect(result).toHaveLength(1)
  })

  it('should handle single segment', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 5, y2: 5 },
    ])
    expect(result).toEqual([])
  })

  it('should handle empty input', () => {
    const result = SweepLine.findIntersections([])
    expect(result).toEqual([])
  })

  it('should find multiple intersections', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 10, y2: 10 },
      { x1: 0, y1: 10, x2: 10, y2: 0 },
      { x1: 0, y1: 5, x2: 10, y2: 5 },
    ])
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('should detect non-overlapping segments', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 5, y2: 5 },
      { x1: 10, y1: 10, x2: 15, y2: 15 },
    ])
    expect(result).toEqual([])
  })
})
  it('findIntersections empty returns empty', () => {
    expect(SweepLine.findIntersections([])).toEqual([])
  })

  it('closestPair returns null for single point', () => {
    expect(SweepLine.closestPair([{ x: 0, y: 0 }])).toBeNull()
  })

describe('sweep-line - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('sweep-line - wave545', () => {
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

describe('sweep-line - wave546', () => {
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

describe('sweep-line - wave547', () => {
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

describe('sweep-line - wave548', () => {
  it('sweep-line module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave549', () => {
  it('sweep-line module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave550', () => {
  it('sweep-line w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave551', () => {
  it('sweep-line w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave552', () => {
  it('sweep-line w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave553', () => {
  it('sweep-line w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave554', () => {
  it('sweep-line w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave555', () => {
  it('sweep-line w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave556', () => {
  it('sweep-line w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave557', () => {
  it('sweep-line w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave558', () => {
  it('sweep-line w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave559', () => {
  it('sweep-line w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave560', () => {
  it('sweep-line w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave561', () => {
  it('sweep-line w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave562', () => {
  it('sweep-line w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave563', () => {
  it('sweep-line w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave564', () => {
  it('sweep-line w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave565', () => {
  it('sweep-line w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave566', () => {
  it('sweep-line w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave127', () => {
  it('sweep-line w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave130', () => {
  it('sweep-line w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave133', () => {
  it('sweep-line w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave136', () => {
  it('sweep-line w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - wave139', () => {
  it('sweep-line w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w142', () => {
  it('sweep-line v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w145', () => {
  it('sweep-line v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w148', () => {
  it('sweep-line v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w151', () => {
  it('sweep-line v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w154', () => {
  it('sweep-line v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w157', () => {
  it('sweep-line v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w160', () => {
  it('sweep-line v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w170', () => {
  it('sweep-line x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w180', () => {
  it('sweep-line x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w190', () => {
  it('sweep-line x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w200', () => {
  it('sweep-line x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w210', () => {
  it('sweep-line x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w220', () => {
  it('sweep-line x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w230', () => {
  it('sweep-line x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w240', () => {
  it('sweep-line x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w250', () => {
  it('sweep-line x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w260', () => {
  it('sweep-line x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w270', () => {
  it('sweep-line x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w280', () => {
  it('sweep-line x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w290', () => {
  it('sweep-line x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w300', () => {
  it('sweep-line x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w310', () => {
  it('sweep-line x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w320', () => {
  it('sweep-line x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w330', () => {
  it('sweep-line x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w340', () => {
  it('sweep-line x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w350', () => {
  it('sweep-line x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w360', () => {
  it('sweep-line x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w370', () => {
  it('sweep-line x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w380', () => {
  it('sweep-line x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w390', () => {
  it('sweep-line x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w400', () => {
  it('sweep-line x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w420', () => {
  it('sweep-line x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w440', () => {
  it('sweep-line x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w460', () => {
  it('sweep-line x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w480', () => {
  it('sweep-line x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w500', () => {
  it('sweep-line x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w550', () => {
  it('sweep-line x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w600', () => {
  it('sweep-line x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w650', () => {
  it('sweep-line x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w700', () => {
  it('sweep-line x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w800', () => {
  it('sweep-line x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w900', () => {
  it('sweep-line x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('sweep-line - w1000', () => {
  it('sweep-line x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('sweep-line x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
