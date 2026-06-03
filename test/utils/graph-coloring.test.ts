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
})
