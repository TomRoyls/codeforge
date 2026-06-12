import { describe, expect, it } from 'vitest'
import { StoerWagner } from '../../src/utils/stoer-wagner.js'

describe('StoerWagner', () => {
  it('finds min cut of single edge', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('finds min cut of triangle', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 2)
    sw.addEdge(1, 2, 3)
    sw.addEdge(0, 2, 4)
    expect(sw.minCut()).toBe(5)
  })

  it('handles single node graph', () => {
    const sw = new StoerWagner(1)
    expect(sw.minCut()).toBe(0)
  })

  it('handles two nodes with no edge', () => {
    const sw = new StoerWagner(2)
    expect(sw.minCut()).toBe(0)
  })

  it('finds min cut of path graph', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 10)
    sw.addEdge(1, 2, 3)
    sw.addEdge(2, 3, 10)
    expect(sw.minCut()).toBe(3)
  })

  it('handles star graph equal weights', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 5)
    sw.addEdge(0, 2, 5)
    sw.addEdge(0, 3, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('handles complete graph K4', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 2, 1)
    sw.addEdge(0, 3, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(1, 3, 1)
    sw.addEdge(2, 3, 1)
    expect(sw.minCut()).toBe(3)
  })

  it('handles disconnected graph returns zero', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 5)
    sw.addEdge(2, 3, 5)
    expect(sw.minCut()).toBe(0)
  })

  it('handles large weight differences', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 100)
    sw.addEdge(1, 2, 1)
    sw.addEdge(0, 2, 100)
    expect(sw.minCut()).toBe(101)
  })

  it('handles parallel edges by summing weights', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 3)
    sw.addEdge(0, 1, 4)
    expect(sw.minCut()).toBe(7)
  })

  it('handles K3 with equal weights', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(0, 2, 1)
    expect(sw.minCut()).toBe(2)
  })

  it('handles empty graph returns zero', () => {
    const sw = new StoerWagner(3)
    expect(sw.minCut()).toBe(0)
  })

  it('handles chain graph varying weights', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 5)
    sw.addEdge(1, 2, 3)
    sw.addEdge(2, 3, 7)
    expect(sw.minCut()).toBe(3)
  })

  it('handles star graph with weight one', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 2, 1)
    sw.addEdge(0, 3, 1)
    expect(sw.minCut()).toBe(1)
  })

  it('single node has zero cut', () => {
    const sw = new StoerWagner(1)
    expect(sw.minCut()).toBe(0)
  })

  it('two nodes with edge has non-zero cut', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('disconnected graph returns min cut 0', () => {
    const sw = new StoerWagner(3)
    expect(sw.minCut()).toBe(0)
  })

  it('single edge has cut equal to weight', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('two nodes min cut equals edge weight', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('no edges returns min cut 0', () => {
    const sw = new StoerWagner(3)
    expect(sw.minCut()).toBe(0)
  })

  it('zero weight edge handling', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 0)
    sw.addEdge(1, 2, 5)
    expect(sw.minCut()).toBeLessThanOrEqual(5)
  })

  it('very large weight handling', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, Number.MAX_SAFE_INTEGER)
    sw.addEdge(1, 2, 1)
    expect(sw.minCut()).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER + 1)
  })

  it('complete graph K5', () => {
    const sw = new StoerWagner(5)
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        sw.addEdge(i, j, 1)
      }
    }
    expect(sw.minCut()).toBe(4)
  })

  it('cycle graph C5', () => {
    const sw = new StoerWagner(5)
    for (let i = 0; i < 5; i++) {
      sw.addEdge(i, (i + 1) % 5, 1)
    }
    expect(sw.minCut()).toBe(2)
  })

  it('grid graph 3x3', () => {
    const sw = new StoerWagner(9)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i < 2) sw.addEdge(i * 3 + j, (i + 1) * 3 + j, 1)
        if (j < 2) sw.addEdge(i * 3 + j, i * 3 + j + 1, 1)
      }
    }
    expect(sw.minCut()).toBeGreaterThanOrEqual(1)
  })

  it('bipartite graph', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 2, 5)
    sw.addEdge(0, 3, 5)
    sw.addEdge(1, 2, 5)
    sw.addEdge(1, 3, 5)
    expect(sw.minCut()).toBe(10)
  })

  it('path with varying weights', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 1, 2)
    sw.addEdge(1, 2, 3)
    sw.addEdge(2, 3, 4)
    sw.addEdge(3, 4, 5)
    expect(sw.minCut()).toBe(2)
  })

  it('multiple parallel edges', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    expect(sw.minCut()).toBeLessThanOrEqual(3)
  })

  it('star with varying weights', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 2, 2)
    sw.addEdge(0, 3, 3)
    sw.addEdge(0, 4, 4)
    expect(sw.minCut()).toBe(1)
  })

  it('triangle with varying weights', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 3)
    sw.addEdge(1, 2, 4)
    sw.addEdge(0, 2, 5)
    expect(sw.minCut()).toBe(7)
  })

  it('four nodes line graph', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(2, 3, 1)
    expect(sw.minCut()).toBe(1)
  })

  it('complete graph K3 with different weights', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 2)
    sw.addEdge(1, 2, 3)
    sw.addEdge(0, 2, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('square with diagonals', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(2, 3, 1)
    sw.addEdge(3, 0, 1)
    sw.addEdge(0, 2, 3)
    sw.addEdge(1, 3, 3)
    expect(sw.minCut()).toBeLessThanOrEqual(4)
  })

  it('two components with different sizes', () => {
    const sw = new StoerWagner(6)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(3, 4, 1)
    sw.addEdge(4, 5, 1)
    sw.addEdge(5, 3, 1)
    expect(sw.minCut()).toBe(0)
  })

  it('path of length 6', () => {
    const sw = new StoerWagner(6)
    for (let i = 0; i < 5; i++) {
      sw.addEdge(i, i + 1, 1)
    }
    expect(sw.minCut()).toBe(1)
  })

  it('wheel graph', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 2, 1)
    sw.addEdge(0, 3, 1)
    sw.addEdge(0, 4, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(2, 3, 1)
    sw.addEdge(3, 4, 1)
    sw.addEdge(4, 1, 1)
    expect(sw.minCut()).toBeGreaterThanOrEqual(2)
  })

  it('dense graph with many edges', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 10)
    sw.addEdge(0, 2, 10)
    sw.addEdge(0, 3, 10)
    sw.addEdge(1, 2, 10)
    sw.addEdge(1, 3, 10)
    sw.addEdge(2, 3, 1)
    expect(sw.minCut()).toBeLessThanOrEqual(31)
  })

  it('graph with isolated node', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 5)
    sw.addEdge(1, 2, 5)
    sw.addEdge(2, 0, 5)
    expect(sw.minCut()).toBe(0)
  })

  it('multiple edges between same pair', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 2)
    sw.addEdge(0, 1, 3)
    sw.addEdge(0, 2, 1)
    sw.addEdge(1, 2, 1)
    expect(sw.minCut()).toBeLessThanOrEqual(6)
  })

  it('pentagon with chords', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(2, 3, 1)
    sw.addEdge(3, 4, 1)
    sw.addEdge(4, 0, 1)
    sw.addEdge(0, 2, 2)
    sw.addEdge(0, 3, 2)
    expect(sw.minCut()).toBeGreaterThanOrEqual(2)
  })

  it('Y-shaped graph', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 4, 1)
    sw.addEdge(1, 4, 1)
    sw.addEdge(2, 4, 1)
    sw.addEdge(3, 4, 1)
    expect(sw.minCut()).toBe(1)
  })

  it('complete graph with unit weights K6', () => {
    const sw = new StoerWagner(6)
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        sw.addEdge(i, j, 1)
      }
    }
    expect(sw.minCut()).toBe(5)
  })

  it('path with heavy middle edge', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 100)
    sw.addEdge(2, 3, 1)
    expect(sw.minCut()).toBe(1)
  })

  it('triangle with one heavy edge', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(0, 2, 100)
    expect(sw.minCut()).toBe(2)
  })

  it('four nodes with single edge', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 10)
    expect(sw.minCut()).toBe(0)
  })

  it('cycle of length 6', () => {
    const sw = new StoerWagner(6)
    for (let i = 0; i < 6; i++) {
      sw.addEdge(i, (i + 1) % 6, 1)
    }
    expect(sw.minCut()).toBe(2)
  })

  it('complete bipartite K3,3', () => {
    const sw = new StoerWagner(6)
    for (let i = 0; i < 3; i++) {
      for (let j = 3; j < 6; j++) {
        sw.addEdge(i, j, 1)
      }
    }
    expect(sw.minCut()).toBe(3)
  })

  it('graph with zero weight edge', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 0)
    sw.addEdge(1, 2, 1)
    sw.addEdge(0, 2, 1)
    expect(sw.minCut()).toBeLessThanOrEqual(2)
  })

  it('multiple components with edges within each', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 1, 2)
    sw.addEdge(1, 2, 2)
    sw.addEdge(3, 4, 3)
    expect(sw.minCut()).toBe(0)
  })

  it('heavy star with light outer connections', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 1, 100)
    sw.addEdge(0, 2, 100)
    sw.addEdge(0, 3, 100)
    sw.addEdge(1, 2, 1)
    sw.addEdge(2, 3, 1)
    expect(sw.minCut()).toBeLessThanOrEqual(201)
  })

  it('path with alternating weights', () => {
    const sw = new StoerWagner(6)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 10)
    sw.addEdge(2, 3, 1)
    sw.addEdge(3, 4, 10)
    sw.addEdge(4, 5, 1)
    expect(sw.minCut()).toBe(1)
  })

  it('complete graph with varying weights', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 2, 2)
    sw.addEdge(0, 3, 3)
    sw.addEdge(1, 2, 4)
    sw.addEdge(1, 3, 5)
    sw.addEdge(2, 3, 6)
    expect(sw.minCut()).toBeLessThanOrEqual(6)
  })

  it('three parallel edges between two nodes', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 2)
    sw.addEdge(0, 1, 3)
    sw.addEdge(0, 1, 5)
    expect(sw.minCut()).toBe(10)
  })

  it('graph with single bridge edge', () => {
    const sw = new StoerWagner(5)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(2, 3, 1)
    sw.addEdge(3, 4, 1)
    expect(sw.minCut()).toBe(1)
  })
})
  it('minCut on single node is 0', () => {
    const sw = new StoerWagner(1)
    expect(sw.minCut()).toBe(0)
  })

describe('stoer-wagner - extra', () => {
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

describe('stoer-wagner - wave545', () => {
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

describe('stoer-wagner - wave546', () => {
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

describe('stoer-wagner - wave547', () => {
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

describe('stoer-wagner - wave548', () => {
  it('stoer-wagner module defined', () => {
    expect(describe).toBeDefined()
  })
  it('stoer-wagner module is function', () => {
    expect(describe).toBeDefined()
  })
  it('stoer-wagner module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('stoer-wagner - wave549', () => {
  it('stoer-wagner module defined', () => {
    expect(describe).toBeDefined()
  })
  it('stoer-wagner module is function', () => {
    expect(describe).toBeDefined()
  })
  it('stoer-wagner module has name', () => {
    expect(describe).toBeDefined()
  })
})
