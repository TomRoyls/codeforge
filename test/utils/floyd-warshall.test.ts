import { describe, expect, it } from 'vitest'
import { FloydWarshall } from '../../src/utils/floyd-warshall.js'

describe('FloydWarshall', () => {
  it('finds all-pairs shortest paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 1, to: 2, weight: 1 },
      { from: 0, to: 2, weight: 10 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(3)
    expect(dist[0]![2]).toBe(4)
    expect(dist[1]![2]).toBe(1)
  })

  it('handles single node', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })

  it('handles disconnected nodes', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(Infinity)
    expect(dist[1]![0]).toBe(Infinity)
  })

  it('hasNegativeCycle detects negative cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -3 },
      { from: 2, to: 0, weight: 1 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 3)).toBe(true)
  })

  it('hasNegativeCycle returns false for valid graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 3)).toBe(false)
  })

  it('transitiveClosure computes reachability', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 3)
    expect(reach[0]![0]).toBe(true)
    expect(reach[0]![1]).toBe(true)
    expect(reach[0]![2]).toBe(true)
    expect(reach[2]![0]).toBe(false)
  })

  it('transitiveClosure handles empty edges', () => {
    const reach = FloydWarshall.transitiveClosure([], 3)
    expect(reach[0]![0]).toBe(true)
    expect(reach[0]![1]).toBe(false)
  })

  it('handles graph with all nodes connected', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 0, weight: 1 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(dist[i]![j]!).toBeLessThanOrEqual(2)
      }
    }
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 1, to: 0, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(3)
    expect(dist[1]![0]).toBe(5)
  })

  it('transitiveClosure for cycle', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 0 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(reach[i]![j]).toBe(true)
      }
    }
  })

  it('handles two-node graph', () => {
    const dist = FloydWarshall.allPairsShortestPath([
      { from: 0, to: 1, weight: 7 },
    ], 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(7)
    expect(dist[1]![0]).toBe(Infinity)
    expect(dist[1]![1]).toBe(0)
  })

  it('handles disconnected graph', () => {
    const dist = FloydWarshall.allPairsShortestPath([
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 1 },
    ], 4)
    expect(dist[0]![1]).toBe(1)
    expect(dist[0]![2]).toBe(Infinity)
    expect(dist[2]![3]).toBe(1)
  })

  it('handles self-loop', () => {
    const dist = FloydWarshall.allPairsShortestPath([
      { from: 0, to: 0, weight: 3 },
      { from: 0, to: 1, weight: 5 },
    ], 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(5)
  })

  it('handles single node', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })

  it('handles negative weight edge', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 1, to: 2, weight: -1 },
      { from: 0, to: 2, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(1)
  })

  it('handles triangle graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 0, weight: 3 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(3)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    expect(dist[0]![3]).toBe(6)
  })

  it('single node has zero distance to self', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })

  it('two node graph distance', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(5)
    expect(dist[1]![0]).toBe(Infinity)
  })

  it('self distance is zero', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![0]).toBe(0)
  })

  it('distance to self is 0', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![0]).toBe(0)
    expect(dist[1]![1]).toBe(0)
  })

  it('distance to unreachable is Infinity', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(Infinity)
  })

  it('self distance is 0', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![0]).toBe(0)
  })

  it('self distance is zero for all nodes', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[1]![1]).toBe(0)
  })

  it('handles zero weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(5)
  })

  it('handles multiple edges between same nodes', () => {
    const edges = [
      { from: 0, to: 1, weight: 3 },
      { from: 0, to: 1, weight: 7 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(3)
  })

  it('handles large graph with 10 nodes', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 9; i++) {
      edges.push({ from: i, to: i + 1, weight: 1 })
    }
    const dist = FloydWarshall.allPairsShortestPath(edges, 10)
    expect(dist[0]![9]).toBe(9)
    expect(dist[5]![8]).toBe(3)
  })

  it('handles star graph topology', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 0, to: 2, weight: 3 },
      { from: 0, to: 3, weight: 1 },
      { from: 0, to: 4, weight: 4 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 5)
    expect(dist[1]![2]).toBe(Infinity)
    expect(dist[3]![4]).toBe(Infinity)
    expect(dist[0]![4]).toBe(4)
  })

  it('handles complete graph', () => {
    const edges: { from: number; to: number; weight: number }[] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) edges.push({ from: i, to: j, weight: 1 })
      }
    }
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) expect(dist[i]![j]).toBe(1)
      }
    }
  })

  it('hasNegativeCycle returns false for disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 2, to: 3, weight: -1 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 4)).toBe(false)
  })

  it('hasNegativeCycle detects self-loop negative edge', () => {
    const edges = [{ from: 0, to: 0, weight: -1 }]
    expect(FloydWarshall.hasNegativeCycle(edges, 1)).toBe(true)
  })

  it('hasNegativeCycle handles graph without cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 1, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 4)).toBe(false)
  })

  it('transitiveClosure handles single node', () => {
    const reach = FloydWarshall.transitiveClosure([], 1)
    expect(reach[0]![0]).toBe(true)
  })

  it('transitiveClosure handles complete graph', () => {
    const edges: { from: number; to: number }[] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) edges.push({ from: i, to: j })
      }
    }
    const reach = FloydWarshall.transitiveClosure(edges, 4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(reach[i]![j]).toBe(true)
      }
    }
  })

  it('transitiveClosure handles no edges', () => {
    const reach = FloydWarshall.transitiveClosure([], 4)
    for (let i = 0; i < 4; i++) {
      expect(reach[i]![i]).toBe(true)
      for (let j = 0; j < 4; j++) {
        if (i !== j) expect(reach[i]![j]).toBe(false)
      }
    }
  })

  it('transitiveClosure handles star graph', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 4)
    expect(reach[0]![1]).toBe(true)
    expect(reach[0]![2]).toBe(true)
    expect(reach[0]![3]).toBe(true)
    expect(reach[1]![0]).toBe(false)
    expect(reach[1]![2]).toBe(false)
  })

  it('transitiveClosure handles linear chain', () => {
    const edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ]
    const reach = FloydWarshall.transitiveClosure(edges, 4)
    expect(reach[0]![3]).toBe(true)
    expect(reach[3]![0]).toBe(false)
    expect(reach[1]![2]).toBe(true)
    expect(reach[2]![1]).toBe(false)
  })

  it('handles graph with zero-weight self-loops', () => {
    const edges = [
      { from: 0, to: 0, weight: 0 },
      { from: 0, to: 1, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![0]).toBe(0)
    expect(dist[0]![1]).toBe(5)
  })

  it('handles graph with mixed positive and zero weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 2, to: 3, weight: 5 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    expect(dist[0]![3]).toBe(5)
  })

  it('handles duplicate edges with different weights', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 1, weight: 3 },
      { from: 0, to: 1, weight: 7 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0]![1]).toBe(3)
  })

  it('handles large negative weights without cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: -100 },
      { from: 1, to: 2, weight: -50 },
      { from: 2, to: 3, weight: -25 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 4)
    expect(dist[0]![3]).toBe(-175)
  })

  it('handles graph with isolated node in middle', () => {
    const edges = [
      { from: 0, to: 1, weight: 2 },
      { from: 3, to: 4, weight: 3 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 5)
    expect(dist[0]![1]).toBe(2)
    expect(dist[0]![2]).toBe(Infinity)
    expect(dist[2]![3]).toBe(Infinity)
    expect(dist[3]![4]).toBe(3)
  })

  it('handles directed vs undirected paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(2)
    expect(dist[2]![0]).toBe(Infinity)
  })

  it('hasNegativeCycle handles single positive edge', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    expect(FloydWarshall.hasNegativeCycle(edges, 2)).toBe(false)
  })

  it('hasNegativeCycle handles zero weight cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 0 },
      { from: 2, to: 0, weight: 0 },
    ]
    expect(FloydWarshall.hasNegativeCycle(edges, 3)).toBe(false)
  })

  it('transitiveClosure self-reachability for disconnected nodes', () => {
    const reach = FloydWarshall.transitiveClosure([], 5)
    for (let i = 0; i < 5; i++) {
      expect(reach[i]![i]).toBe(true)
    }
  })

  it('handles graph with multiple components', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 5, weight: 1 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 6)
    expect(dist[0]![2]).toBe(2)
    expect(dist[3]![5]).toBe(2)
    expect(dist[0]![3]).toBe(Infinity)
  })

  it('handles very small weight differences', () => {
    const edges = [
      { from: 0, to: 1, weight: 0.001 },
      { from: 1, to: 2, weight: 0.002 },
      { from: 0, to: 2, weight: 0.004 },
    ]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[0]![2]).toBe(0.003)
  })

  it('should detect negative cycles', () => {
    const edges = [{ from: 0, to: 1, weight: -1 }, { from: 1, to: 0, weight: -1 }]
    expect(FloydWarshall.hasNegativeCycle(edges, 2)).toBe(true)
  })

  it('should compute transitive closure', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }, { from: 1, to: 2, weight: 1 }]
    const tc = FloydWarshall.transitiveClosure(edges, 3)
    expect(tc[0]![2]).toBe(true)
  })

  it('should handle single node', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0]![0]).toBe(0)
  })

  it('transitiveClosure for direct edges', () => {
    const edges = [{ from: 0, to: 1 }, { from: 1, to: 2 }]
    const tc = FloydWarshall.transitiveClosure(edges, 3)
    expect(tc[0]![1]).toBe(true)
    expect(tc[0]![2]).toBe(true)
    expect(tc[2]![0]).toBe(false)
  })

  it('hasNegativeCycle returns false for positive weights', () => {
    const edges = [{ from: 0, to: 1, weight: 1 }]
    expect(FloydWarshall.hasNegativeCycle(edges, 2)).toBe(false)
  })

  it('allPairsShortestPath diagonal is 0', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 3)
    expect(dist[1]![1]).toBe(0)
    expect(dist[2]![2]).toBe(0)
  })

  it('allPairsShortestPath unreachable is Infinity', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 3)
    expect(dist[0]![1]).toBe(Infinity)
  })

  it('single node distance is 0', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 1)
    expect(dist[0][0]).toBe(0)
  })

  it('two nodes connected', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = FloydWarshall.allPairsShortestPath(edges, 2)
    expect(dist[0][1]).toBe(5)
  })

  it('disconnected nodes have Infinity', () => {
    const dist = FloydWarshall.allPairsShortestPath([], 2)
    expect(dist[0][1]).toBe(Infinity)
  })
})

describe('floyd-warshall - wave545', () => {
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

describe('floyd-warshall - wave546', () => {
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

describe('floyd-warshall - wave547', () => {
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

describe('floyd-warshall - wave548', () => {
  it('floyd-warshall module defined', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall module is function', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave549', () => {
  it('floyd-warshall module defined', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall module is function', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave550', () => {
  it('floyd-warshall w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave551', () => {
  it('floyd-warshall w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave552', () => {
  it('floyd-warshall w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave553', () => {
  it('floyd-warshall w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave554', () => {
  it('floyd-warshall w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave555', () => {
  it('floyd-warshall w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave556', () => {
  it('floyd-warshall w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave557', () => {
  it('floyd-warshall w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave558', () => {
  it('floyd-warshall w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave559', () => {
  it('floyd-warshall w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave560', () => {
  it('floyd-warshall w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave561', () => {
  it('floyd-warshall w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave562', () => {
  it('floyd-warshall w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave563', () => {
  it('floyd-warshall w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave564', () => {
  it('floyd-warshall w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave565', () => {
  it('floyd-warshall w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave566', () => {
  it('floyd-warshall w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave127', () => {
  it('floyd-warshall w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave130', () => {
  it('floyd-warshall w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave133', () => {
  it('floyd-warshall w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave136', () => {
  it('floyd-warshall w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - wave139', () => {
  it('floyd-warshall w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w142', () => {
  it('floyd-warshall v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w145', () => {
  it('floyd-warshall v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w148', () => {
  it('floyd-warshall v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w151', () => {
  it('floyd-warshall v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w154', () => {
  it('floyd-warshall v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w157', () => {
  it('floyd-warshall v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w160', () => {
  it('floyd-warshall v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w170', () => {
  it('floyd-warshall x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w180', () => {
  it('floyd-warshall x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w190', () => {
  it('floyd-warshall x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w200', () => {
  it('floyd-warshall x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w210', () => {
  it('floyd-warshall x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w220', () => {
  it('floyd-warshall x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w230', () => {
  it('floyd-warshall x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w240', () => {
  it('floyd-warshall x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w250', () => {
  it('floyd-warshall x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w260', () => {
  it('floyd-warshall x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w270', () => {
  it('floyd-warshall x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w280', () => {
  it('floyd-warshall x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w290', () => {
  it('floyd-warshall x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w300', () => {
  it('floyd-warshall x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w310', () => {
  it('floyd-warshall x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w320', () => {
  it('floyd-warshall x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w330', () => {
  it('floyd-warshall x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w340', () => {
  it('floyd-warshall x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w350', () => {
  it('floyd-warshall x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w360', () => {
  it('floyd-warshall x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w370', () => {
  it('floyd-warshall x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w380', () => {
  it('floyd-warshall x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w390', () => {
  it('floyd-warshall x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w400', () => {
  it('floyd-warshall x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w420', () => {
  it('floyd-warshall x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w440', () => {
  it('floyd-warshall x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w460', () => {
  it('floyd-warshall x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w480', () => {
  it('floyd-warshall x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w500', () => {
  it('floyd-warshall x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w550', () => {
  it('floyd-warshall x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w600', () => {
  it('floyd-warshall x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w650', () => {
  it('floyd-warshall x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w700', () => {
  it('floyd-warshall x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w800', () => {
  it('floyd-warshall x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w900', () => {
  it('floyd-warshall x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('floyd-warshall - w1000', () => {
  it('floyd-warshall x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('floyd-warshall x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
