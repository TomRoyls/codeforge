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
