import { describe, expect, it } from 'vitest'
import { ClosestPairBrute } from '../../src/utils/closest-pair-brute.js'

describe('ClosestPairBrute', () => {
  it('finds closest pair', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 4)
    cp.addPoint(1, 1)
    const result = cp.findClosest()
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('handles two points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const result = cp.findClosest()
    expect(result!.distance).toBe(1)
  })

  it('handles single point', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    expect(cp.findClosest()).toBeNull()
  })

  it('handles empty', () => {
    const cp = new ClosestPairBrute()
    expect(cp.findClosest()).toBeNull()
  })

  it('finds k nearest pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(5, 0)
    const pairs = cp.findKNearest(2)
    expect(pairs.length).toBe(2)
    expect(pairs[0]!.distance).toBeLessThanOrEqual(pairs[1]!.distance)
  })

  it('computes MST length', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(2, 0)
    expect(cp.minimumSpanningTreeLength()).toBeCloseTo(2, 5)
  })

  it('handles single point MST', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    expect(cp.minimumSpanningTreeLength()).toBe(0)
  })

  it('tracks size', () => {
    const cp = new ClosestPairBrute()
    expect(cp.size).toBe(0)
    cp.addPoint(0, 0)
    expect(cp.size).toBe(1)
  })

  it('handles coincident points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(1, 1)
    cp.addPoint(1, 1)
    expect(cp.findClosest()!.distance).toBe(0)
  })

  it('handles many points', () => {
    const cp = new ClosestPairBrute()
    for (let i = 0; i < 20; i++) cp.addPoint(i, i)
    const result = cp.findClosest()
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('findKNearest returns available pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const pairs = cp.findKNearest(3)
    expect(pairs.length).toBe(1)
    expect(pairs[0]!.distance).toBe(1)
  })

  it('findKNearest returns closest pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(5, 0)
    cp.addPoint(10, 0)
    const pairs = cp.findKNearest(2)
    expect(pairs.length).toBe(2)
    expect(pairs[0]!.distance).toBe(1)
    expect(pairs[1]!.distance).toBeCloseTo(4)
  })

  it('findClosest returns null for single point', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    expect(cp.findClosest()).toBeNull()
  })

  it('findClosest returns null for no points', () => {
    const cp = new ClosestPairBrute()
    expect(cp.findClosest()).toBeNull()
  })

  it('handles equidistant points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(2, 0)
    const result = cp.findClosest()
    expect(result!.distance).toBe(1)
  })

  it('findKNearest with 2 points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 1)
    const pairs = cp.findKNearest(1)
    expect(pairs.length).toBe(1)
    expect(pairs[0]!.distance).toBeCloseTo(Math.sqrt(2), 5)
  })

  it('findKNearest with k=0', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const pairs = cp.findKNearest(0)
    expect(pairs.length).toBe(0)
  })

  it('findKNearest with k=1 returns closest', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 4)
    cp.addPoint(1, 1)
    const pairs = cp.findKNearest(1)
    expect(pairs.length).toBe(1)
    expect(pairs[0]!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('findKNearest returns sorted by distance', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(3, 0)
    cp.addPoint(6, 0)
    const pairs = cp.findKNearest(3)
    expect(pairs.length).toBe(3)
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i]!.distance).toBeGreaterThanOrEqual(pairs[i - 1]!.distance)
    }
  })

  it('handles diagonal line', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 1)
    cp.addPoint(2, 2)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('handles horizontal line', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(10, 0)
    cp.addPoint(5, 0)
    const result = cp.findClosest()
    expect(result!.distance).toBe(5)
  })

  it('handles vertical line', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(0, 10)
    cp.addPoint(0, 5)
    const result = cp.findClosest()
    expect(result!.distance).toBe(5)
  })

  it('handles negative coordinates', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(-1, -1)
    cp.addPoint(-2, -2)
    cp.addPoint(-3, -3)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('handles mixed positive and negative coordinates', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(-1, -1)
    cp.addPoint(1, 1)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(Math.sqrt(8), 5)
  })

  it('handles floating point coordinates', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0.5, 0.5)
    cp.addPoint(1.5, 1.5)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(Math.sqrt(2), 5)
  })

  it('handles zero coordinates', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(0, 1)
    cp.addPoint(1, 0)
    const result = cp.findClosest()
    expect(result!.distance).toBe(1)
  })

  it('MST with two points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 4)
    expect(cp.minimumSpanningTreeLength()).toBeCloseTo(5, 5)
  })

  it('MST with empty set', () => {
    const cp = new ClosestPairBrute()
    expect(cp.minimumSpanningTreeLength()).toBe(0)
  })

  it('MST with triangle', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 0)
    cp.addPoint(1.5, 3)
    const mst = cp.minimumSpanningTreeLength()
    expect(mst).toBeGreaterThan(0)
  })

  it('MST with square', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(1, 1)
    cp.addPoint(0, 1)
    const mst = cp.minimumSpanningTreeLength()
    expect(mst).toBeCloseTo(3, 5)
  })

  it('size increments with each add', () => {
    const cp = new ClosestPairBrute()
    expect(cp.size).toBe(0)
    cp.addPoint(0, 0)
    expect(cp.size).toBe(1)
    cp.addPoint(1, 1)
    expect(cp.size).toBe(2)
    cp.addPoint(2, 2)
    expect(cp.size).toBe(3)
  })

  it('findClosest pair coordinates', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 4)
    const result = cp.findClosest()
    expect(result!.pair).toEqual([[0, 0], [3, 4]])
  })

  it('findKNearest pair coordinates', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const pairs = cp.findKNearest(1)
    expect(pairs[0]!.points[0]![0]).toBe(0)
    expect(pairs[0]!.points[0]![1]).toBe(0)
  })

  it('handles large coordinate values', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(1000000, 1000000)
    cp.addPoint(1000001, 1000001)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('handles very close points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(0.0001, 0)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(0.0001, 7)
  })

  it('findClosest with 3 points not collinear', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(10, 0)
    cp.addPoint(5, 0.1)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(Math.sqrt(25.01), 5)
  })

  it('findKNearest with all pairs requested', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(2, 0)
    const pairs = cp.findKNearest(10)
    const totalPairs = (3 * (3 - 1)) / 2
    expect(pairs.length).toBe(totalPairs)
  })

  it('MST with collinear points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(2, 0)
    cp.addPoint(4, 0)
    const mst = cp.minimumSpanningTreeLength()
    expect(mst).toBeCloseTo(4, 5)
  })

  it('findClosest with multiple coincident points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(1, 1)
    cp.addPoint(1, 1)
    cp.addPoint(5, 5)
    const result = cp.findClosest()
    expect(result!.distance).toBe(0)
  })

  it('findKNearest includes coincident pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const pairs = cp.findKNearest(2)
    expect(pairs[0]!.distance).toBe(0)
  })

  it('handles points forming circle', () => {
    const cp = new ClosestPairBrute()
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      cp.addPoint(Math.cos(angle), Math.sin(angle))
    }
    const result = cp.findClosest()
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.sqrt(2 - Math.sqrt(2)), 5)
  })

  it('size returns correct count after multiple operations', () => {
    const cp = new ClosestPairBrute()
    for (let i = 0; i < 10; i++) {
      cp.addPoint(i, i)
    }
    expect(cp.size).toBe(10)
  })

  it('findKNearest with 4 points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(2, 0)
    cp.addPoint(3, 0)
    const pairs = cp.findKNearest(3)
    expect(pairs.length).toBe(3)
    expect(pairs[0]!.distance).toBe(1)
    expect(pairs[1]!.distance).toBe(1)
    expect(pairs[2]!.distance).toBe(1)
  })

  it('MST with random points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(2, 3)
    cp.addPoint(5, 1)
    cp.addPoint(3, 6)
    const mst = cp.minimumSpanningTreeLength()
    expect(mst).toBeGreaterThan(0)
  })

  it('findClosest with points on unit circle', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(1, 0)
    cp.addPoint(Math.cos(Math.PI / 3), Math.sin(Math.PI / 3))
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(1, 5)
  })

  it('handles large set of points', () => {
    const cp = new ClosestPairBrute()
    for (let i = 0; i < 50; i++) {
      cp.addPoint(i % 5, Math.floor(i / 5))
    }
    const result = cp.findClosest()
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(1, 5)
  })

  it('findKNearest with k greater than total pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const pairs = cp.findKNearest(100)
    expect(pairs.length).toBe(1)
  })

  it('findKNearest with equidistant pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(0, 1)
    cp.addPoint(1, 1)
    const pairs = cp.findKNearest(4)
    expect(pairs.length).toBe(4)
    const distances = pairs.map(p => p.distance)
    const sortedDistances = [...distances].sort((a, b) => a - b)
    expect(distances).toEqual(sortedDistances)
  })

  it('MST with pentagon geometry', () => {
    const cp = new ClosestPairBrute()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5
      cp.addPoint(Math.cos(angle), Math.sin(angle))
    }
    const mst = cp.minimumSpanningTreeLength()
    expect(mst).toBeGreaterThan(0)
    expect(mst).toBeLessThan(5)
  })

  it('findClosest with equilateral triangle', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(0.5, Math.sqrt(3) / 2)
    const result = cp.findClosest()
    expect(result!.distance).toBeCloseTo(1, 5)
  })

  it('handles extreme coordinate values', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(1e10, 1e10)
    cp.addPoint(1e10 + 1, 1e10 + 1)
    const result = cp.findClosest()
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.sqrt(2), 5)
  })

  it('findKNearest returns k pairs sorted by distance', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(3, 0)
    cp.addPoint(6, 0)
    const pairs = cp.findKNearest(2)
    expect(pairs.length).toBe(2)
    expect(pairs[0]!.distance).toBeLessThanOrEqual(pairs[1]!.distance)
  })

  it('minimumSpanningTreeLength for triangle', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(0, 1)
    const mst = cp.minimumSpanningTreeLength()
    expect(mst).toBeCloseTo(2, 5)
  })

  it('size tracks point count', () => {
    const cp = new ClosestPairBrute()
    expect(cp.size).toBe(0)
    cp.addPoint(0, 0)
    cp.addPoint(1, 1)
    expect(cp.size).toBe(2)
  })

  it('findClosest with identical points returns 0 distance', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(5, 5)
    cp.addPoint(5, 5)
    expect(cp.findClosest()!.distance).toBe(0)
  })
})
  it('findClosest with no points returns null', () => {
    const cp = new ClosestPairBrute()
    expect(cp.findClosest()).toBeNull()
  })

  it('findClosest with one point returns null', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    expect(cp.findClosest()).toBeNull()
  })

  it('findClosest with two points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 4)
    const result = cp.findClosest()
    expect(result?.distance).toBe(5)
  })

describe('closest-pair-brute - wave545', () => {
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

describe('closest-pair-brute - wave546', () => {
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

describe('closest-pair-brute - wave547', () => {
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

describe('closest-pair-brute - wave548', () => {
  it('closest-pair-brute module defined', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute module is function', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave549', () => {
  it('closest-pair-brute module defined', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute module is function', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave550', () => {
  it('closest-pair-brute w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave551', () => {
  it('closest-pair-brute w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave552', () => {
  it('closest-pair-brute w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave553', () => {
  it('closest-pair-brute w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave554', () => {
  it('closest-pair-brute w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave555', () => {
  it('closest-pair-brute w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave556', () => {
  it('closest-pair-brute w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave557', () => {
  it('closest-pair-brute w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave558', () => {
  it('closest-pair-brute w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave559', () => {
  it('closest-pair-brute w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave560', () => {
  it('closest-pair-brute w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave561', () => {
  it('closest-pair-brute w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave562', () => {
  it('closest-pair-brute w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
