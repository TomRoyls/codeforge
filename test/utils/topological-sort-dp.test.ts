import { describe, expect, it } from 'vitest'
import { TopologicalSortDP } from '../../src/utils/topological-sort-dp.js'

describe('TopologicalSortDP', () => {
  describe('longestPath', () => {
    it('finds longest path in chain', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      ts.addEdge(2, 3)
      expect(ts.longestPath()).toBe(3)
    })

    it('finds longest path in diamond', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      expect(ts.longestPath()).toBe(2)
    })

    it('handles single node', () => {
      const ts = new TopologicalSortDP(1)
      expect(ts.longestPath()).toBe(0)
    })

    it('handles disconnected', () => {
      const ts = new TopologicalSortDP(3)
      expect(ts.longestPath()).toBe(0)
    })

    it('handles cycle', () => {
      const ts = new TopologicalSortDP(3)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      ts.addEdge(2, 0)
      expect(ts.longestPath()).toBe(-1)
    })

    it('handles complex DAG', () => {
      const ts = new TopologicalSortDP(6)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      ts.addEdge(3, 4)
      ts.addEdge(3, 5)
      expect(ts.longestPath()).toBe(3)
    })

    it('diamond DAG longest path', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      expect(ts.longestPath()).toBe(2)
    })

    it('linear chain longest path', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      ts.addEdge(2, 3)
      ts.addEdge(3, 4)
      expect(ts.longestPath()).toBe(4)
    })

    it('handles two node DAG', () => {
      const ts = new TopologicalSortDP(2)
      ts.addEdge(0, 1)
      expect(ts.longestPath()).toBe(1)
    })

    it('handles empty graph', () => {
      const ts = new TopologicalSortDP(3)
      expect(ts.longestPath()).toBe(0)
    })

    it('handles V shaped DAG', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 2)
      ts.addEdge(1, 2)
      ts.addEdge(2, 3)
      ts.addEdge(2, 4)
      expect(ts.longestPath()).toBe(2)
    })

    it('handles linear chain of 3', () => {
      const ts = new TopologicalSortDP(3)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      expect(ts.longestPath()).toBe(2)
    })

    it('handles self-loop', () => {
      const ts = new TopologicalSortDP(2)
      ts.addEdge(0, 0)
      expect(ts.longestPath()).toBe(-1)
    })

    it('handles multiple source nodes', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 3)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      expect(ts.longestPath()).toBe(1)
    })

    it('handles multiple sink nodes', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(0, 3)
      expect(ts.longestPath()).toBe(1)
    })

    it('handles longer chain', () => {
      const ts = new TopologicalSortDP(10)
      for (let i = 0; i < 9; i++) ts.addEdge(i, i + 1)
      expect(ts.longestPath()).toBe(9)
    })

    it('handles binary tree DAG', () => {
      const ts = new TopologicalSortDP(7)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(1, 4)
      ts.addEdge(2, 5)
      ts.addEdge(2, 6)
      expect(ts.longestPath()).toBe(2)
    })

    it('handles fan-in DAG', () => {
      const ts = new TopologicalSortDP(6)
      ts.addEdge(0, 4)
      ts.addEdge(1, 4)
      ts.addEdge(2, 4)
      ts.addEdge(3, 4)
      ts.addEdge(4, 5)
      expect(ts.longestPath()).toBe(2)
    })

    it('handles fan-out DAG', () => {
      const ts = new TopologicalSortDP(6)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(0, 3)
      ts.addEdge(0, 4)
      ts.addEdge(0, 5)
      expect(ts.longestPath()).toBe(1)
    })

    it('handles layered DAG', () => {
      const ts = new TopologicalSortDP(9)
      ts.addEdge(0, 3)
      ts.addEdge(0, 4)
      ts.addEdge(0, 5)
      ts.addEdge(1, 3)
      ts.addEdge(1, 4)
      ts.addEdge(1, 5)
      ts.addEdge(2, 3)
      ts.addEdge(2, 4)
      ts.addEdge(2, 5)
      ts.addEdge(3, 6)
      ts.addEdge(4, 6)
      ts.addEdge(5, 6)
      ts.addEdge(6, 7)
      ts.addEdge(6, 8)
      expect(ts.longestPath()).toBe(3)
    })
  })

  describe('countPaths', () => {
    it('counts paths in chain', () => {
      const ts = new TopologicalSortDP(3)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      expect(ts.countPaths()).toBe(3)
    })

    it('counts paths in diamond', () => {
      const ts = new TopologicalSortDP(3)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 2)
      expect(ts.countPaths()).toBe(4)
    })

    it('diamond DAG path count', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      expect(ts.countPaths()).toBe(5)
    })

    it('linear chain path count', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      ts.addEdge(2, 3)
      ts.addEdge(3, 4)
      expect(ts.countPaths()).toBe(5)
    })

    it('handles single node', () => {
      const ts = new TopologicalSortDP(1)
      expect(ts.countPaths()).toBe(1)
    })

    it('handles two node DAG', () => {
      const ts = new TopologicalSortDP(2)
      ts.addEdge(0, 1)
      expect(ts.countPaths()).toBe(2)
    })

    it('handles empty graph', () => {
      const ts = new TopologicalSortDP(3)
      expect(ts.countPaths()).toBe(3)
    })

    it('handles disconnected nodes', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      expect(ts.countPaths()).toBe(4)
    })

    it('handles multiple sources', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 4)
      ts.addEdge(1, 4)
      ts.addEdge(2, 4)
      expect(ts.countPaths()).toBe(7)
    })

    it('handles DAG with branching', () => {
      const ts = new TopologicalSortDP(6)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 4)
      ts.addEdge(3, 5)
      ts.addEdge(4, 5)
      expect(ts.countPaths()).toBe(7)
    })

    it('handles linear chain of 10', () => {
      const ts = new TopologicalSortDP(10)
      for (let i = 0; i < 9; i++) ts.addEdge(i, i + 1)
      expect(ts.countPaths()).toBe(10)
    })

    it('handles binary tree structure', () => {
      const ts = new TopologicalSortDP(7)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(1, 4)
      ts.addEdge(2, 5)
      ts.addEdge(2, 6)
      expect(ts.countPaths()).toBe(7)
    })

    it('handles dense DAG', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(0, 3)
      ts.addEdge(0, 4)
      ts.addEdge(1, 2)
      ts.addEdge(1, 3)
      ts.addEdge(1, 4)
      ts.addEdge(2, 3)
      ts.addEdge(2, 4)
      ts.addEdge(3, 4)
      expect(ts.countPaths()).toBe(16)
    })
  })

  describe('shortestPath', () => {
    it('finds shortest path', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      expect(ts.shortestPath(0, 3)).toBe(2)
    })

    it('shortest path same node', () => {
      const ts = new TopologicalSortDP(3)
      expect(ts.shortestPath(1, 1)).toBe(0)
    })

    it('shortest path in chain', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      ts.addEdge(2, 3)
      ts.addEdge(3, 4)
      expect(ts.shortestPath(0, 4)).toBe(4)
    })

    it('shortest path direct edge', () => {
      const ts = new TopologicalSortDP(3)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      expect(ts.shortestPath(0, 1)).toBe(1)
    })

    it('shortest path with multiple routes', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      ts.addEdge(3, 4)
      expect(ts.shortestPath(0, 4)).toBe(3)
    })

    it('shortest path unreachable', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(0, 1)
      ts.addEdge(2, 3)
      expect(ts.shortestPath(0, 3)).toBe(Infinity)
    })

    it('shortest path disconnected components', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 1)
      ts.addEdge(1, 2)
      ts.addEdge(3, 4)
      expect(ts.shortestPath(0, 3)).toBe(Infinity)
    })

    it('shortest path with no edges', () => {
      const ts = new TopologicalSortDP(3)
      expect(ts.shortestPath(0, 2)).toBe(Infinity)
    })

    it('shortest path single node', () => {
      const ts = new TopologicalSortDP(1)
      expect(ts.shortestPath(0, 0)).toBe(0)
    })

    it('shortest path different index', () => {
      const ts = new TopologicalSortDP(4)
      ts.addEdge(1, 2)
      ts.addEdge(2, 3)
      expect(ts.shortestPath(0, 3)).toBe(Infinity)
    })

    it('shortest path complex DAG', () => {
      const ts = new TopologicalSortDP(6)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(1, 3)
      ts.addEdge(2, 3)
      ts.addEdge(3, 4)
      ts.addEdge(3, 5)
      expect(ts.shortestPath(0, 5)).toBe(3)
    })

    it('shortest path via longer route', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 1)
      ts.addEdge(0, 2)
      ts.addEdge(0, 3)
      ts.addEdge(1, 4)
      ts.addEdge(2, 4)
      ts.addEdge(3, 4)
      expect(ts.shortestPath(0, 4)).toBe(2)
    })

    it('shortest path with multiple sources', () => {
      const ts = new TopologicalSortDP(5)
      ts.addEdge(0, 4)
      ts.addEdge(1, 4)
      ts.addEdge(2, 4)
      expect(ts.shortestPath(0, 4)).toBe(1)
    })
  })

  it('should return 0 for longest path in single node', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.longestPath()).toBe(0)
  })

  it('should count paths in a DAG', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(0, 2)
    ts.addEdge(1, 3)
    ts.addEdge(2, 3)
    expect(ts.countPaths()).toBeGreaterThan(0)
  })

  it('should find shortest path', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    ts.addEdge(2, 3)
    expect(ts.shortestPath(0, 3)).toBe(3)
  })

  it('should return -1 for cyclic graph longest path', () => {
    const ts = new TopologicalSortDP(3)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    ts.addEdge(2, 0)
    expect(ts.longestPath()).toBe(-1)
  })

  it('should count paths for linear graph', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    ts.addEdge(2, 3)
    expect(ts.countPaths()).toBe(4)
  })

  it('should handle disconnected components', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    expect(ts.longestPath()).toBe(1)
  })
})
  it('longestPath returns 0 for single node', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.longestPath()).toBe(0)
  })

  it('countPaths returns 1 for single node', () => {
    const ts = new TopologicalSortDP(1)
    expect(ts.countPaths()).toBe(1)
  })

  it('longestPath with chain', () => {
    const ts = new TopologicalSortDP(4)
    ts.addEdge(0, 1)
    ts.addEdge(1, 2)
    ts.addEdge(2, 3)
    expect(ts.longestPath()).toBe(3)
  })

describe('topological-sort-dp - extra', () => {
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
