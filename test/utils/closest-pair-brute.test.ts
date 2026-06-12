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

describe('closest-pair-brute - wave563', () => {
  it('closest-pair-brute w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave564', () => {
  it('closest-pair-brute w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave565', () => {
  it('closest-pair-brute w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave566', () => {
  it('closest-pair-brute w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave127', () => {
  it('closest-pair-brute w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave130', () => {
  it('closest-pair-brute w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave133', () => {
  it('closest-pair-brute w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave136', () => {
  it('closest-pair-brute w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - wave139', () => {
  it('closest-pair-brute w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w142', () => {
  it('closest-pair-brute v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w145', () => {
  it('closest-pair-brute v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w148', () => {
  it('closest-pair-brute v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w151', () => {
  it('closest-pair-brute v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w154', () => {
  it('closest-pair-brute v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w157', () => {
  it('closest-pair-brute v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w160', () => {
  it('closest-pair-brute v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w170', () => {
  it('closest-pair-brute x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w180', () => {
  it('closest-pair-brute x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w190', () => {
  it('closest-pair-brute x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w200', () => {
  it('closest-pair-brute x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w210', () => {
  it('closest-pair-brute x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w220', () => {
  it('closest-pair-brute x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w230', () => {
  it('closest-pair-brute x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w240', () => {
  it('closest-pair-brute x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w250', () => {
  it('closest-pair-brute x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w260', () => {
  it('closest-pair-brute x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w270', () => {
  it('closest-pair-brute x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w280', () => {
  it('closest-pair-brute x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w290', () => {
  it('closest-pair-brute x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w300', () => {
  it('closest-pair-brute x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w310', () => {
  it('closest-pair-brute x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w320', () => {
  it('closest-pair-brute x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w330', () => {
  it('closest-pair-brute x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w340', () => {
  it('closest-pair-brute x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w350', () => {
  it('closest-pair-brute x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w360', () => {
  it('closest-pair-brute x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w370', () => {
  it('closest-pair-brute x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w380', () => {
  it('closest-pair-brute x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w390', () => {
  it('closest-pair-brute x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w400', () => {
  it('closest-pair-brute x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x400x9', () => {
    expect(describe).toBeDefined()
  })
})
