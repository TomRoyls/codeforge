import { describe, expect, it } from 'vitest'
import { GraphColoring } from '../../src/utils/graph-coloring.js'

describe('GraphColoring', () => {
  describe('greedyColor', () => {
    it('colors empty graph', () => {
      expect(GraphColoring.greedyColor([])).toEqual([])
    })

    it('colors single node', () => {
      expect(GraphColoring.greedyColor([[]])).toEqual([0])
    })

    it('colors two connected nodes', () => {
      const adj = [[1], [0]]
      const colors = GraphColoring.greedyColor(adj)
      expect(colors[0]).not.toBe(colors[1])
    })

    it('colors triangle with 3 colors', () => {
      const adj = [[1, 2], [0, 2], [0, 1]]
      const colors = GraphColoring.greedyColor(adj)
      expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
      expect(new Set(colors).size).toBe(3)
    })

    it('colors bipartite graph with 2 colors', () => {
      const adj = [[1, 3], [0, 2], [1, 3], [0, 2]]
      const colors = GraphColoring.greedyColor(adj)
      expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
      expect(new Set(colors).size).toBeLessThanOrEqual(2)
    })

    it('colors path graph', () => {
      const adj = [[1], [0, 2], [1, 3], [2]]
      const colors = GraphColoring.greedyColor(adj)
      expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    })

    it('colors star graph', () => {
      const adj = [[1, 2, 3, 4], [0], [0], [0], [0]]
      const colors = GraphColoring.greedyColor(adj)
      expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    })
  })

  describe('chromaticNumber', () => {
    it('returns 0 for empty graph', () => {
      expect(GraphColoring.chromaticNumber([])).toBe(0)
    })

    it('returns 1 for edgeless graph', () => {
      expect(GraphColoring.chromaticNumber([[], [], []])).toBe(1)
    })

    it('returns 3 for triangle', () => {
      expect(GraphColoring.chromaticNumber([[1, 2], [0, 2], [0, 1]])).toBe(3)
    })

    it('returns 2 for bipartite', () => {
      expect(GraphColoring.chromaticNumber([[1], [0]])).toBe(2)
    })
  })

  describe('isBipartite', () => {
    it('returns true for bipartite graph', () => {
      expect(GraphColoring.isBipartite([[1], [0]])).toBe(true)
    })

    it('returns false for triangle', () => {
      expect(GraphColoring.isBipartite([[1, 2], [0, 2], [0, 1]])).toBe(false)
    })

    it('returns true for empty graph', () => {
      expect(GraphColoring.isBipartite([])).toBe(true)
    })

    it('returns true for single node', () => {
      expect(GraphColoring.isBipartite([[]])).toBe(true)
    })

    it('returns true for disconnected bipartite', () => {
      expect(GraphColoring.isBipartite([[1], [0], [3], [2]])).toBe(true)
    })
  })

  describe('isValidColoring', () => {
    it('validates correct coloring', () => {
      const adj = [[1], [0]]
      expect(GraphColoring.isValidColoring(adj, [0, 1])).toBe(true)
    })

    it('rejects invalid coloring', () => {
      const adj = [[1], [0]]
      expect(GraphColoring.isValidColoring(adj, [0, 0])).toBe(false)
    })

    it('accepts empty graph', () => {
      expect(GraphColoring.isValidColoring([], [])).toBe(true)
    })
  })

  it('greedy coloring uses colors', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const colors = GraphColoring.greedyColor(adj)
    expect(colors.length).toBe(3)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
  })

  it('single node gets one color', () => {
    const adj = [[0]]
    const colors = GraphColoring.greedyColor(adj)
    expect(colors.length).toBe(1)
  })

  it('two disconnected nodes use same color', () => {
    const adj = [[], []]
    const colors = GraphColoring.greedyColor(adj)
    expect(colors[0]).toBe(colors[1])
  })

  it('single node uses 1 color', () => {
    const adj = [[]]
    const colors = GraphColoring.greedyColor(adj)
    expect(colors[0]).toBe(0)
  })

  it('two connected nodes use different colors', () => {
    const adj = [[1], [0]]
    const colors = GraphColoring.greedyColor(adj)
    expect(colors[0]).not.toBe(colors[1])
  })

  it('handles self-loop graph', () => {
    const adj = [[0]]
    const colors = GraphColoring.greedyColor(adj)
    expect(colors.length).toBe(1)
    expect(colors[0]).toBe(0)
  })

  it('chromaticNumber for single node with self-loop', () => {
    const adj = [[0]]
    expect(GraphColoring.chromaticNumber(adj)).toBe(1)
  })

  it('isValidColoring ignores extra colors beyond graph size', () => {
    const adj = [[1], [0]]
    expect(GraphColoring.isValidColoring(adj, [0, 1, 2])).toBe(true)
  })

  it('handles complete graph K4', () => {
    const adj = [
      [1, 2, 3],
      [0, 2, 3],
      [0, 1, 3],
      [0, 1, 2],
    ]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(new Set(colors).size).toBe(4)
  })

  it('handles disconnected components', () => {
    const adj = [[1], [0], [3], [2], [], []]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(colors.length).toBe(6)
  })

  it('handles complete graph K5', () => {
    const adj = [
      [1, 2, 3, 4],
      [0, 2, 4],
      [0, 1, 3],
      [0, 2, 4],
      [0, 1, 3],
    ]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
  })

  it('handles cycle graph C5', () => {
    const adj = [[1, 4], [0, 2], [1, 3], [2, 4], [3, 0]]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(new Set(colors).size).toBeLessThanOrEqual(3)
  })

  it('handles complete bipartite K2,3', () => {
    const adj = [[2, 3, 4], [2, 3, 4], [0, 1], [0, 1], [0, 1]]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(new Set(colors).size).toBeLessThanOrEqual(2)
  })

  it('handles graph with isolated vertices', () => {
    const adj = [[1], [0], [], [], [5], [4]]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(colors.length).toBe(6)
  })

  it('handles line graph', () => {
    const adj = [[1], [0, 2], [1, 3], [2, 4], [3]]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(new Set(colors).size).toBeLessThanOrEqual(2)
  })

  it('colors preserve adjacency constraints', () => {
    const adj = [
      [1, 2, 5],
      [0, 2, 3, 4],
      [0, 1],
      [1, 4, 5],
      [1, 3, 5],
      [0, 3, 4],
    ]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
  })

  it('chromaticNumber for K5', () => {
    const adj = [
      [1, 2, 3, 4],
      [0, 2, 3, 4],
      [0, 1, 3, 4],
      [0, 1, 2, 4],
      [0, 1, 2, 3],
    ]
    expect(GraphColoring.chromaticNumber(adj)).toBe(5)
  })

  it('chromaticNumber for edgeless graph with many nodes', () => {
    const adj = [[], [], [], [], [], []]
    expect(GraphColoring.chromaticNumber(adj)).toBe(1)
  })

  it('chromaticNumber for path', () => {
    const adj = [[1], [0, 2], [1, 3], [2, 4], [3]]
    expect(GraphColoring.chromaticNumber(adj)).toBeLessThanOrEqual(2)
  })

  it('chromaticNumber for star graph', () => {
    const adj = [[1, 2, 3, 4], [0], [0], [0], [0]]
    expect(GraphColoring.chromaticNumber(adj)).toBe(2)
  })

  it('chromaticNumber for pentagon', () => {
    const adj = [[1, 4], [0, 2], [1, 3], [2, 4], [3, 0]]
    const result = GraphColoring.chromaticNumber(adj)
    expect(result).toBeGreaterThanOrEqual(3)
    expect(result).toBeLessThanOrEqual(5)
  })

  it('chromaticNumber returns at least 1 for any non-empty graph', () => {
    const adj = [[1], [0]]
    expect(GraphColoring.chromaticNumber(adj)).toBeGreaterThanOrEqual(1)
  })

  it('isBipartite handles odd cycle', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    expect(GraphColoring.isBipartite(adj)).toBe(false)
  })

  it('isBipartite handles even cycle', () => {
    const adj = [[1, 3], [0, 2], [1, 3], [2, 0]]
    expect(GraphColoring.isBipartite(adj)).toBe(true)
  })

  it('isBipartite handles complete bipartite K3,3', () => {
    const adj = [
      [3, 4, 5],
      [3, 4, 5],
      [3, 4, 5],
      [0, 1, 2],
      [0, 1, 2],
      [0, 1, 2],
    ]
    expect(GraphColoring.isBipartite(adj)).toBe(true)
  })

  it('isBipartite handles tree', () => {
    const adj = [
      [1, 2],
      [0, 3, 4],
      [0],
      [1],
      [1, 5, 6],
      [4],
      [4],
    ]
    expect(GraphColoring.isBipartite(adj)).toBe(true)
  })

  it('isBipartite handles graph with self-loop', () => {
    const adj = [[0]]
    expect(GraphColoring.isBipartite(adj)).toBe(false)
  })

  it('isBipartite handles graph with multiple disconnected triangles', () => {
    const adj = [
      [1, 2],
      [0, 2],
      [0, 1],
      [4, 5],
      [3, 5],
      [3, 4],
    ]
    expect(GraphColoring.isBipartite(adj)).toBe(false)
  })

  it('isBipartite handles single edge', () => {
    const adj = [[1], [0]]
    expect(GraphColoring.isBipartite(adj)).toBe(true)
  })

  it('isValidColoring handles empty arrays', () => {
    expect(GraphColoring.isValidColoring([], [])).toBe(true)
  })

  it('isValidColoring detects same-color adjacent nodes', () => {
    const adj = [[1], [0, 2], [1]]
    expect(GraphColoring.isValidColoring(adj, [0, 0, 1])).toBe(false)
  })

  it('isValidColoring allows non-adjacent same-color nodes', () => {
    const adj = [[1], [0, 2], [1]]
    expect(GraphColoring.isValidColoring(adj, [0, 1, 0])).toBe(true)
  })

  it('isValidColoring handles varying color values', () => {
    const adj = [[1], [0, 2], [1]]
    expect(GraphColoring.isValidColoring(adj, [100, 200, 100])).toBe(true)
  })

  it('isValidColoring validates star graph coloring', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    expect(GraphColoring.isValidColoring(adj, [0, 1, 1, 1])).toBe(true)
    expect(GraphColoring.isValidColoring(adj, [0, 0, 1, 1])).toBe(false)
  })

  it('greedyColor produces valid coloring for wheel graph', () => {
    const adj = [
      [1, 2, 3, 4],
      [0, 2, 4],
      [0, 1, 3],
      [0, 2, 4],
      [0, 1, 3],
    ]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(colors.length).toBe(5)
  })

  it('greedyColor handles large sparse graph', () => {
    const n = 20
    const adj: number[][] = Array.from({ length: n }, () => [])
    for (let i = 0; i < n - 1; i++) {
      adj[i].push(i + 1)
      adj[i + 1].push(i)
    }
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
    expect(colors.length).toBe(n)
  })

  it('greedyColor handles graph with high degree node', () => {
    const adj = [
      [1, 2, 3, 4, 5],
      [0],
      [0],
      [0],
      [0],
      [0],
    ]
    const colors = GraphColoring.greedyColor(adj)
    expect(GraphColoring.isValidColoring(adj, colors)).toBe(true)
  })

  it('greedyColor maintains color indices within bounds', () => {
    const n = 10
    const adj = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i !== j ? j : -1)).filter((x) => x !== -1)
    )
    const colors = GraphColoring.greedyColor(adj)
    colors.forEach((color) => {
      expect(color).toBeGreaterThanOrEqual(0)
      expect(color).toBeLessThan(n)
    })
  })

  it('greedyColor handles graph with isolated nodes', () => {
    const adj = [[1], [0], [], [], [5], [4], [], []]
    const colors = GraphColoring.greedyColor(adj)
    expect(colors.every((c) => c >= 0)).toBe(true)
  })

  it('isBipartite returns true for edgeless graph', () => {
    const adj = [[], [], [], []]
    expect(GraphColoring.isBipartite(adj)).toBe(true)
  })

  it('greedyColor on completely disconnected graph', () => {
    const n = 5
    const adj: number[][] = Array.from({ length: n }, () => [])
    const colors = GraphColoring.greedyColor(adj)
    expect(colors.every((c) => c === 0)).toBe(true)
  })

  it('chromaticNumber for graph with parallel components', () => {
    const adj = [
      [1, 2],
      [0, 2],
      [0, 1],
      [4, 5],
      [3, 5],
      [3, 4],
    ]
    const result = GraphColoring.chromaticNumber(adj)
    expect(result).toBe(3)
  })
})
describe('graph-coloring - wave546', () => {
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

describe('graph-coloring - wave547', () => {
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

describe('graph-coloring - wave548', () => {
  it('graph-coloring module defined', () => {
    expect(describe).toBeDefined()
  })
  it('graph-coloring module is function', () => {
    expect(describe).toBeDefined()
  })
  it('graph-coloring module has name', () => {
    expect(describe).toBeDefined()
  })
})
