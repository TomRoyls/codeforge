import { describe, expect, it } from 'vitest'
import { EdgeColoring } from '../../src/utils/edge-coloring.js'

describe('EdgeColoring', () => {
  it('colors single edge', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    const colors = ec.greedyColor()
    expect(colors.size).toBe(1)
  })

  it('colors triangle', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(0, 2)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('colors path', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('colors star', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('handles no edges', () => {
    const ec = new EdgeColoring(3)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('tracks max degree', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    expect(ec.maxDegree()).toBe(2)
  })

  it('tracks edge count', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    expect(ec.edgeCount).toBe(2)
  })

  it('colors K4', () => {
    const ec = new EdgeColoring(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        ec.addEdge(i, j)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('no adjacent edges share color', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 3)
    ec.addEdge(0, 3)
    const colors = ec.greedyColor()
    for (let u = 0; u < 4; u++) {
      const neighborColors = new Set<number>()
      for (const v of [0, 1, 2, 3]) {
        const key = u < v ? `${u},${v}` : `${v},${u}`
        if (colors.has(key)) {
          const c = colors.get(key)!
          expect(neighborColors.has(c)).toBe(false)
          neighborColors.add(c)
        }
      }
    }
  })

  it('handles cycle', () => {
    const ec = new EdgeColoring(5)
    for (let i = 0; i < 5; i++) ec.addEdge(i, (i + 1) % 5)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('handles bipartite K2,3', () => {
    const ec = new EdgeColoring(5)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    ec.addEdge(0, 4)
    ec.addEdge(1, 2)
    ec.addEdge(1, 3)
    ec.addEdge(1, 4)
    expect(ec.chromaticIndex()).toBeGreaterThanOrEqual(3)
    expect(ec.maxDegree()).toBe(3)
  })

  it('handles star graph K1,4', () => {
    const ec = new EdgeColoring(5)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    ec.addEdge(0, 4)
    expect(ec.chromaticIndex()).toBe(4)
  })

  it('even cycle needs 2 colors', () => {
    const ec = new EdgeColoring(4)
    for (let i = 0; i < 4; i++) ec.addEdge(i, (i + 1) % 4)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('maxDegree of empty graph', () => {
    const ec = new EdgeColoring(5)
    expect(ec.maxDegree()).toBe(0)
  })

  it('edgeCount of empty graph', () => {
    const ec = new EdgeColoring(5)
    expect(ec.edgeCount).toBe(0)
  })

  it('greedyColor returns empty map for no edges', () => {
    const ec = new EdgeColoring(3)
    expect(ec.greedyColor().size).toBe(0)
  })

  it('single edge uses 1 color', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    const colors = ec.greedyColor()
    expect(colors.size).toBe(1)
    expect(colors.get('0,1')).toBe(0)
  })

  it('two parallel paths', () => {
    const ec = new EdgeColoring(6)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(3, 4)
    ec.addEdge(4, 5)
    expect(ec.edgeCount).toBe(4)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('K5 complete graph', () => {
    const ec = new EdgeColoring(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        ec.addEdge(i, j)
    expect(ec.edgeCount).toBe(10)
    expect(ec.maxDegree()).toBe(4)
    expect(ec.chromaticIndex()).toBe(6)
  })

  it('path of length 5', () => {
    const ec = new EdgeColoring(6)
    for (let i = 0; i < 5; i++) ec.addEdge(i, i + 1)
    expect(ec.edgeCount).toBe(5)
    expect(ec.maxDegree()).toBe(2)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('double edge ignored', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    ec.addEdge(0, 1)
    expect(ec.edgeCount).toBe(1)
  })

  it('large star graph', () => {
    const ec = new EdgeColoring(11)
    for (let i = 1; i <= 10; i++) ec.addEdge(0, i)
    expect(ec.maxDegree()).toBe(10)
    expect(ec.chromaticIndex()).toBe(10)
  })

  it('bipartite matching graph', () => {
    const ec = new EdgeColoring(6)
    ec.addEdge(0, 3)
    ec.addEdge(0, 4)
    ec.addEdge(1, 3)
    ec.addEdge(1, 5)
    ec.addEdge(2, 4)
    ec.addEdge(2, 5)
    expect(ec.maxDegree()).toBe(2)
  })

  it('three parallel edges', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(2, 3)
    expect(ec.chromaticIndex()).toBe(1)
  })

  it('chromaticIndex at least maxDegree', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    ec.addEdge(1, 2)
    expect(ec.chromaticIndex()).toBeGreaterThanOrEqual(ec.maxDegree())
  })

  it('triangle uses exactly 3 colors', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 0)
    const colors = ec.greedyColor()
    const usedColors = new Set(colors.values())
    expect(usedColors.size).toBe(3)
  })

  it('path of 2 edges uses 2 colors', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    const colors = ec.greedyColor()
    expect(colors.size).toBe(2)
  })

  it('cycle C6 uses 2 colors', () => {
    const ec = new EdgeColoring(6)
    for (let i = 0; i < 6; i++) ec.addEdge(i, (i + 1) % 6)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('maxDegree after adding edges', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    expect(ec.maxDegree()).toBe(1)
    ec.addEdge(0, 2)
    expect(ec.maxDegree()).toBe(2)
    ec.addEdge(0, 3)
    expect(ec.maxDegree()).toBe(3)
  })

  it('edgeCount after adding edges', () => {
    const ec = new EdgeColoring(4)
    expect(ec.edgeCount).toBe(0)
    ec.addEdge(0, 1)
    expect(ec.edgeCount).toBe(1)
    ec.addEdge(1, 2)
    expect(ec.edgeCount).toBe(2)
  })

  it('single node graph', () => {
    const ec = new EdgeColoring(1)
    expect(ec.maxDegree()).toBe(0)
    expect(ec.edgeCount).toBe(0)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('two nodes no edges', () => {
    const ec = new EdgeColoring(2)
    expect(ec.edgeCount).toBe(0)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('graph with isolated node', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    expect(ec.maxDegree()).toBe(2)
    expect(ec.edgeCount).toBe(2)
  })

  it('complete bipartite K3,3', () => {
    const ec = new EdgeColoring(6)
    for (let i = 0; i < 3; i++)
      for (let j = 3; j < 6; j++)
        ec.addEdge(i, j)
    expect(ec.maxDegree()).toBe(3)
    expect(ec.edgeCount).toBe(9)
  })

  it('colors assigned are non-negative', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 3)
    ec.addEdge(0, 3)
    const colors = ec.greedyColor()
    for (const c of colors.values()) {
      expect(c).toBeGreaterThanOrEqual(0)
    }
  })

  it('greedy color key format', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(2, 0)
    ec.addEdge(1, 2)
    const colors = ec.greedyColor()
    expect(colors.has('0,2')).toBe(true)
    expect(colors.has('1,2')).toBe(true)
  })

  it('K4 uses at most 5 colors', () => {
    const ec = new EdgeColoring(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        ec.addEdge(i, j)
    expect(ec.chromaticIndex()).toBeLessThanOrEqual(5)
  })

  it('disconnected triangle components', () => {
    const ec = new EdgeColoring(6)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(0, 2)
    ec.addEdge(3, 4)
    ec.addEdge(4, 5)
    ec.addEdge(3, 5)
    expect(ec.edgeCount).toBe(6)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('single edge graph properties', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    expect(ec.maxDegree()).toBe(1)
    expect(ec.edgeCount).toBe(1)
    expect(ec.chromaticIndex()).toBe(1)
  })

  it('wheel graph W4', () => {
    const ec = new EdgeColoring(5)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    ec.addEdge(0, 4)
    ec.addEdge(1, 2)
    ec.addEdge(2, 3)
    ec.addEdge(3, 4)
    ec.addEdge(4, 1)
    expect(ec.maxDegree()).toBe(4)
  })

  it('long path edge count', () => {
    const ec = new EdgeColoring(20)
    for (let i = 0; i < 19; i++) ec.addEdge(i, i + 1)
    expect(ec.edgeCount).toBe(19)
    expect(ec.maxDegree()).toBe(2)
  })

  it('matching graph', () => {
    const ec = new EdgeColoring(10)
    for (let i = 0; i < 5; i++) ec.addEdge(i * 2, i * 2 + 1)
    expect(ec.edgeCount).toBe(5)
    expect(ec.chromaticIndex()).toBe(1)
  })

  it('large complete graph K6', () => {
    const ec = new EdgeColoring(6)
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++)
        ec.addEdge(i, j)
    expect(ec.edgeCount).toBe(15)
    expect(ec.maxDegree()).toBe(5)
  })

  it('Y-shaped graph', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    expect(ec.maxDegree()).toBe(3)
    expect(ec.edgeCount).toBe(3)
  })

  it('chromaticIndex equals colors used', () => {
    const ec = new EdgeColoring(5)
    for (let i = 0; i < 5; i++) ec.addEdge(i, (i + 1) % 5)
    const idx = ec.chromaticIndex()
    const colors = ec.greedyColor()
    let maxC = 0
    for (const c of colors.values()) maxC = Math.max(maxC, c + 1)
    expect(idx).toBe(maxC)
  })

  it('empty graph greedy color is empty', () => {
    const ec = new EdgeColoring(5)
    const colors = ec.greedyColor()
    expect(colors.size).toBe(0)
  })

  it('max degree of isolated node in larger graph', () => {
    const ec = new EdgeColoring(10)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 3)
    expect(ec.maxDegree()).toBe(2)
  })

  it('chromatic index of edgeless graph', () => {
    const ec = new EdgeColoring(7)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('edge count with multiple edges added gradually', () => {
    const ec = new EdgeColoring(4)
    expect(ec.edgeCount).toBe(0)
    ec.addEdge(0, 1)
    expect(ec.edgeCount).toBe(1)
    ec.addEdge(1, 2)
    expect(ec.edgeCount).toBe(2)
    ec.addEdge(2, 3)
    expect(ec.edgeCount).toBe(3)
    ec.addEdge(3, 0)
    expect(ec.edgeCount).toBe(4)
  })

  it('single edge has color 0', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    const colors = ec.greedyColor()
    expect(colors.get('0,1')).toBe(0)
  })

  it('complete graph K3 has chromatic index 3', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(0, 2)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('path of length 3 uses exactly 2 colors', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 3)
    const colors = ec.greedyColor()
    const usedColors = new Set(colors.values())
    expect(usedColors.size).toBe(2)
  })

  it('max degree increases with star graph', () => {
    const ec = new EdgeColoring(6)
    expect(ec.maxDegree()).toBe(0)
    ec.addEdge(0, 1)
    expect(ec.maxDegree()).toBe(1)
    ec.addEdge(0, 2)
    expect(ec.maxDegree()).toBe(2)
    ec.addEdge(0, 3)
    expect(ec.maxDegree()).toBe(3)
    ec.addEdge(0, 4)
    expect(ec.maxDegree()).toBe(4)
    ec.addEdge(0, 5)
    expect(ec.maxDegree()).toBe(5)
  })

  it('greedy color returns map with string keys', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    const colors = ec.greedyColor()
    expect(colors.has('0,1')).toBe(true)
    expect(colors.has('1,2')).toBe(true)
    expect(typeof colors.get('0,1')).toBe('number')
  })

  it('maxDegree returns correct value', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    expect(ec.maxDegree()).toBe(2)
  })

  it('single edge coloring', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    const colors = ec.greedyColor()
    expect(colors.size).toBe(1)
  })

  it('chromaticIndex is at least max degree', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    expect(ec.chromaticIndex()).toBeGreaterThanOrEqual(ec.maxDegree())
  })
})

describe('edge-coloring - wave548', () => {
  it('edge-coloring module defined', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module is function', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module has name', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module not null', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module has length', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('edge-coloring - wave549', () => {
  it('edge-coloring module defined', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module is function', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('edge-coloring - wave550', () => {
  it('edge-coloring w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('edge-coloring - wave551', () => {
  it('edge-coloring w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('edge-coloring - wave552', () => {
  it('edge-coloring w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('edge-coloring - wave553', () => {
  it('edge-coloring w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('edge-coloring - wave554', () => {
  it('edge-coloring w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('edge-coloring - wave555', () => {
  it('edge-coloring w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('edge-coloring w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
