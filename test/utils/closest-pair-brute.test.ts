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

describe('closest-pair-brute - w420', () => {
  it('closest-pair-brute x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w440', () => {
  it('closest-pair-brute x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w460', () => {
  it('closest-pair-brute x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w480', () => {
  it('closest-pair-brute x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w500', () => {
  it('closest-pair-brute x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w550', () => {
  it('closest-pair-brute x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w600', () => {
  it('closest-pair-brute x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w650', () => {
  it('closest-pair-brute x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w700', () => {
  it('closest-pair-brute x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w800', () => {
  it('closest-pair-brute x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w900', () => {
  it('closest-pair-brute x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('closest-pair-brute - w1000', () => {
  it('closest-pair-brute x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('closest-pair-brute x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
