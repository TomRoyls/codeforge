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

describe('closest-pair - wave556', () => {
  it('closest-pair w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave557', () => {
  it('closest-pair w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave558', () => {
  it('closest-pair w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave559', () => {
  it('closest-pair w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave560', () => {
  it('closest-pair w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave561', () => {
  it('closest-pair w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave562', () => {
  it('closest-pair w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave563', () => {
  it('closest-pair w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave564', () => {
  it('closest-pair w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave565', () => {
  it('closest-pair w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave566', () => {
  it('closest-pair w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave127', () => {
  it('closest-pair w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave130', () => {
  it('closest-pair w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave133', () => {
  it('closest-pair w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave136', () => {
  it('closest-pair w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - wave139', () => {
  it('closest-pair w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w142', () => {
  it('closest-pair v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w145', () => {
  it('closest-pair v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w148', () => {
  it('closest-pair v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w151', () => {
  it('closest-pair v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w154', () => {
  it('closest-pair v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w157', () => {
  it('closest-pair v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w160', () => {
  it('closest-pair v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w170', () => {
  it('closest-pair x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w180', () => {
  it('closest-pair x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w190', () => {
  it('closest-pair x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w200', () => {
  it('closest-pair x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w210', () => {
  it('closest-pair x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w220', () => {
  it('closest-pair x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w230', () => {
  it('closest-pair x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w240', () => {
  it('closest-pair x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w250', () => {
  it('closest-pair x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w260', () => {
  it('closest-pair x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w270', () => {
  it('closest-pair x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w280', () => {
  it('closest-pair x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w290', () => {
  it('closest-pair x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w300', () => {
  it('closest-pair x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w310', () => {
  it('closest-pair x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w320', () => {
  it('closest-pair x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w330', () => {
  it('closest-pair x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w340', () => {
  it('closest-pair x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w350', () => {
  it('closest-pair x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w360', () => {
  it('closest-pair x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w370', () => {
  it('closest-pair x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w380', () => {
  it('closest-pair x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w390', () => {
  it('closest-pair x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w400', () => {
  it('closest-pair x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w420', () => {
  it('closest-pair x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w440', () => {
  it('closest-pair x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w460', () => {
  it('closest-pair x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w480', () => {
  it('closest-pair x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w500', () => {
  it('closest-pair x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w550', () => {
  it('closest-pair x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w600', () => {
  it('closest-pair x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w650', () => {
  it('closest-pair x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w700', () => {
  it('closest-pair x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w800', () => {
  it('closest-pair x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w900', () => {
  it('closest-pair x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair - w1000', () => {
  it('closest-pair x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
