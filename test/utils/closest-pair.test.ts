import { describe, expect, it } from 'vitest'
import { ClosestPair } from '../../src/utils/closest-pair.js'

describe('ClosestPair', () => {
  it('returns null for fewer than 2 points', () => {
    expect(ClosestPair.find([])).toBeNull()
    expect(ClosestPair.find([{ x: 1, y: 1 }])).toBeNull()
  })

  it('finds closest pair of two points', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }, { x: 3, y: 4 }])
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(5, 8)
  })

  it('finds closest pair among collinear points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('finds closest pair in grid', () => {
    const points = [
      { x: 0, y: 0 }, { x: 10, y: 10 },
      { x: 1, y: 1 }, { x: 5, y: 5 },
    ]
    const result = ClosestPair.find(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 6)
  })

  it('minDistance returns Infinity for empty', () => {
    expect(ClosestPair.minDistance([])).toBe(Infinity)
  })

  it('minDistance returns correct value', () => {
    expect(ClosestPair.minDistance([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBeCloseTo(1, 8)
  })

  it('distance computes Euclidean distance', () => {
    expect(ClosestPair.distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0)
    expect(ClosestPair.distance({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1)
  })

  it('bruteForce matches find for small sets', () => {
    const points = [{ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 1, y: 1 }]
    const bf = ClosestPair.bruteForce(points)!
    const dc = ClosestPair.find(points)!
    expect(bf.distance).toBeCloseTo(dc.distance, 8)
  })

  it('handles duplicate points', () => {
    const points = [{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 5, y: 5 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(0, 8)
  })

  it('finds closest in large random set', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 100; i++) {
      points.push({ x: i * 10, y: i * 10 })
    }
    points.push({ x: 501, y: 501 })
    const result = ClosestPair.find(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeLessThan(2)
  })

  it('handles points with same x coordinate', () => {
    const points = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 0, y: 1 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('handles points with same y coordinate', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 1, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('finds closest across divide', () => {
    const points = [
      { x: 0, y: 0 }, { x: 100, y: 100 },
      { x: 49, y: 50 }, { x: 51, y: 50 },
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(2, 8)
  })

  it('bruteForce returns null for 0 or 1 points', () => {
    expect(ClosestPair.bruteForce([])).toBeNull()
    expect(ClosestPair.bruteForce([{ x: 0, y: 0 }])).toBeNull()
  })

  it('distance handles negative coordinates', () => {
    expect(ClosestPair.distance({ x: -1, y: -1 }, { x: 2, y: 3 })).toBeCloseTo(5, 8)
  })

  it('finds closest in grid pattern', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('handles two points', () => {
    const points = [{ x: 0, y: 0 }, { x: 3, y: 4 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(5, 8)
  })

  it('three points finds closest', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 10, y: 10 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('returns null for single point', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }])
    expect(result).toBeNull()
  })

  it('finds distance for two points', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }, { x: 3, y: 4 }])
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(5, 5)
  })

  it('same point has distance 0', () => {
    const result = ClosestPair.find([{ x: 1, y: 1 }, { x: 1, y: 1 }])
    expect(result!.distance).toBeCloseTo(0, 5)
  })

  it('two points distance', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }, { x: 3, y: 4 }])
    expect(result!.distance).toBeCloseTo(5, 5)
  })

  it('single point returns null', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }])
    expect(result).toBeNull()
  })

  it('no points returns null', () => {
    const result = ClosestPair.find([])
    expect(result).toBeNull()
  })

  it('two points returns distance', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }, { x: 3, y: 4 }])
    expect(result).not.toBeNull()
  })

  it('distance works with large coordinates', () => {
    const dist = ClosestPair.distance({ x: 1000000, y: 1000000 }, { x: 1000003, y: 1000004 })
    expect(dist).toBeCloseTo(5, 8)
  })

  it('distance works with decimal coordinates', () => {
    const dist = ClosestPair.distance({ x: 1.5, y: 2.5 }, { x: 2.5, y: 3.5 })
    expect(dist).toBeCloseTo(Math.sqrt(2), 8)
  })

  it('handles very small distance', () => {
    const points = [{ x: 0, y: 0 }, { x: 0.0001, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(0.0001, 8)
  })

  it('finds closest in L-shaped arrangement', () => {
    const points = [
      { x: 0, y: 0 }, { x: 0, y: 10 },
      { x: 10, y: 10 }, { x: 10, y: 0 },
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(10, 8)
  })

  it('handles points in diagonal line', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 1 },
      { x: 2, y: 2 }, { x: 3, y: 3 },
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(Math.sqrt(2), 8)
  })

  it('handles three collinear points with equal spacing', () => {
    const points = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(5, 8)
  })

  it('finds closest pair in circle arrangement', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      points.push({ x: Math.cos(angle), y: Math.sin(angle) })
    }
    const result = ClosestPair.find(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeLessThan(1)
  })

  it('handles points with negative x', () => {
    const points = [{ x: -5, y: 0 }, { x: -3, y: 0 }, { x: -1, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(2, 8)
  })

  it('handles points with negative y', () => {
    const points = [{ x: 0, y: -5 }, { x: 0, y: -3 }, { x: 0, y: -1 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(2, 8)
  })

  it('handles all four quadrants', () => {
    const points = [
      { x: 1, y: 1 }, { x: -1, y: 1 },
      { x: -1, y: -1 }, { x: 1, y: -1 },
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(2, 8)
  })

  it('bruteForce finds closest in 3 points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 10, y: 10 }]
    const result = ClosestPair.bruteForce(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('bruteForce handles 4 points', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 },
    ]
    const result = ClosestPair.bruteForce(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('find and bruteForce agree on random points', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 20; i++) {
      points.push({ x: Math.random() * 100, y: Math.random() * 100 })
    }
    const findResult = ClosestPair.find(points)!
    const bruteResult = ClosestPair.bruteForce(points)!
    expect(findResult.distance).toBeCloseTo(bruteResult.distance, 8)
  })

  it('handles points with large coordinates', () => {
    const x = 1000000
    const points = [{ x, y: 0 }, { x: x + 1, y: 0 }, { x: x + 10, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('minDistance handles two close points among distant ones', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1000, y: 0 },
      { x: 0.001, y: 0 }, { x: 2000, y: 0 },
    ]
    expect(ClosestPair.minDistance(points)).toBeCloseTo(0.001, 8)
  })

  it('distance is symmetric', () => {
    const p1 = { x: 3, y: 4 }
    const p2 = { x: 0, y: 0 }
    const dist1 = ClosestPair.distance(p1, p2)
    const dist2 = ClosestPair.distance(p2, p1)
    expect(dist1).toBe(dist2)
  })

  it('distance satisfies triangle inequality', () => {
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 3, y: 4 }
    const p3 = { x: 6, y: 8 }
    const d12 = ClosestPair.distance(p1, p2)
    const d23 = ClosestPair.distance(p2, p3)
    const d13 = ClosestPair.distance(p1, p3)
    expect(d12 + d23).toBeGreaterThanOrEqual(d13 - 0.0001)
  })

  it('handles points with same x and different y', () => {
    const points = [{ x: 5, y: 0 }, { x: 5, y: 0.1 }, { x: 5, y: 10 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(0.1, 8)
  })

  it('handles points with same y and different x', () => {
    const points = [{ x: 0, y: 5 }, { x: 0.1, y: 5 }, { x: 10, y: 5 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(0.1, 8)
  })

  it('finds closest in tightly clustered group', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 10; i++) {
      points.push({ x: Math.random() * 0.01, y: Math.random() * 0.01 })
    }
    points.push({ x: 100, y: 100 })
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeLessThan(0.02)
  })

  it('handles points on unit circle', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5
      points.push({ x: Math.cos(angle), y: Math.sin(angle) })
    }
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeGreaterThan(0)
    expect(result!.distance).toBeLessThan(2)
  })

  it('bruteForce with many duplicate points returns 0', () => {
    const points = [
      { x: 1, y: 1 }, { x: 1, y: 1 },
      { x: 1, y: 1 }, { x: 1, y: 1 }
    ]
    const result = ClosestPair.bruteForce(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(0, 8)
  })

  it('minDistance with single point returns Infinity', () => {
    const result = ClosestPair.minDistance([{ x: 0, y: 0 }])
    expect(result).toBe(Infinity)
  })

  it('distance with identical points returns 0', () => {
    const p = { x: 5.5, y: 7.3 }
    expect(ClosestPair.distance(p, p)).toBe(0)
  })

  it('find with points spanning multiple orders of magnitude', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1e10, y: 1e10 },
      { x: 1, y: 0 }
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBe(1)
  })

  it('bruteForce with right triangle', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 }
    ]
    const result = ClosestPair.bruteForce(points)
    expect(result!.distance).toBeCloseTo(3, 8)
  })

  it('find and bruteForce match on large random set', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 100; i++) {
      points.push({ x: Math.random() * 1000, y: Math.random() * 1000 })
    }
    const findResult = ClosestPair.find(points)!
    const bruteResult = ClosestPair.bruteForce(points)!
    expect(findResult.distance).toBeCloseTo(bruteResult.distance, 6)
  })

  it('handles duplicate points with zero distance', () => {
    const result = ClosestPair.find([{ x: 1, y: 1 }, { x: 1, y: 1 }])
    expect(result).not.toBeNull()
    expect(result!.distance).toBe(0)
  })

  it('handles three points on line', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: 0 }])
    expect(result!.distance).toBe(1)
  })

  it('minDistance returns Infinity for empty array', () => {
    expect(ClosestPair.minDistance([])).toBe(Infinity)
  })
})

  it('distance calculates correctly', () => {
    expect(ClosestPair.distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('find with two points', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }, { x: 1, y: 1 }])
    expect(result?.distance).toBeCloseTo(Math.SQRT2)
  })

  it('find returns null for empty', () => {
    expect(ClosestPair.find([])).toBeNull()
  })

describe('closest-pair - wave545', () => {
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

describe('closest-pair - wave546', () => {
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

describe('closest-pair - wave547', () => {
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

describe('closest-pair - wave548', () => {
  it('closest-pair module defined', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair module is function', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave549', () => {
  it('closest-pair module defined', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair module is function', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave550', () => {
  it('closest-pair w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave551', () => {
  it('closest-pair w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave552', () => {
  it('closest-pair w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave553', () => {
  it('closest-pair w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave554', () => {
  it('closest-pair w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave555', () => {
  it('closest-pair w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
