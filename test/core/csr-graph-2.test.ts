import { describe, it, expect } from 'vitest'
import { CSRGraph2 } from '../../src/core/csr-graph-2/index.js'

describe('CSRGraph2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates graph with specified vertex count', () => {
      const graph = new CSRGraph2(5)
      expect(graph.vertexCount()).toBe(5)
      expect(graph.edgeCount()).toBe(0)
    })

    it('creates graph with zero vertices', () => {
      const graph = new CSRGraph2(0)
      expect(graph.vertexCount()).toBe(0)
    })

    it('creates graph with single vertex', () => {
      const graph = new CSRGraph2(1)
      expect(graph.vertexCount()).toBe(1)
    })
  })

  // ─── addEdge ───

  describe('addEdge', () => {
    it('adds a single edge', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      expect(graph.edgeCount()).toBe(1)
    })

    it('adds multiple edges', () => {
      const graph = new CSRGraph2(4)
      graph.addEdge(0, 1)
      graph.addEdge(0, 2)
      graph.addEdge(1, 3)
      expect(graph.edgeCount()).toBe(3)
    })

    it('adds edge with weight', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1, 5)
      graph.addEdge(1, 2, 10)
      expect(graph.edgeCount()).toBe(2)
    })

    it('throws after build is called', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      graph.build()
      expect(() => graph.addEdge(1, 2)).toThrow('Cannot add edges after build() is called')
    })

    it('allows self-loops', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 0)
      expect(graph.edgeCount()).toBe(1)
    })
  })

  // ─── build ───

  describe('build', () => {
    it('builds with no edges', () => {
      const graph = new CSRGraph2(3)
      expect(() => graph.build()).not.toThrow()
    })

    it('build is idempotent', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      graph.build()
      expect(() => graph.build()).not.toThrow()
      expect(graph.edgeCount()).toBe(1)
    })

    it('build sorts edges by source vertex', () => {
      const graph = new CSRGraph2(4)
      graph.addEdge(2, 3)
      graph.addEdge(0, 1)
      graph.addEdge(1, 2)
      graph.build()
      expect(graph.getNeighbors(0)).toEqual([{ to: 1, weight: undefined }])
      expect(graph.getNeighbors(1)).toEqual([{ to: 2, weight: undefined }])
      expect(graph.getNeighbors(2)).toEqual([{ to: 3, weight: undefined }])
    })

    it('build with weighted edges', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1, 5)
      graph.addEdge(0, 2, 10)
      graph.build()
      const neighbors = graph.getNeighbors(0)
      expect(neighbors.length).toBe(2)
    })
  })

  // ─── getNeighbors ───

  describe('getNeighbors', () => {
    it('throws before build', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      expect(() => graph.getNeighbors(0)).toThrow('Must call build() before querying')
    })

    it('returns empty for vertex with no edges', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      graph.build()
      expect(graph.getNeighbors(2)).toEqual([])
    })

    it('returns single neighbor', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      graph.build()
      expect(graph.getNeighbors(0)).toEqual([{ to: 1, weight: undefined }])
    })

    it('returns multiple neighbors', () => {
      const graph = new CSRGraph2(4)
      graph.addEdge(0, 1)
      graph.addEdge(0, 2)
      graph.addEdge(0, 3)
      graph.build()
      const neighbors = graph.getNeighbors(0)
      expect(neighbors.length).toBe(3)
      const targets = neighbors.map((n) => n.to)
      expect(targets).toContain(1)
      expect(targets).toContain(2)
      expect(targets).toContain(3)
    })

    it('returns neighbors with weights', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1, 5)
      graph.addEdge(0, 2, 10)
      graph.build()
      const neighbors = graph.getNeighbors(0)
      expect(neighbors.length).toBe(2)
      const weighted = neighbors.find((n) => n.to === 1)
      expect(weighted?.weight).toBe(5)
    })

    it('returns copies not references', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1, 5)
      graph.build()
      const n1 = graph.getNeighbors(0)
      const n2 = graph.getNeighbors(0)
      expect(n1).toEqual(n2)
      expect(n1).not.toBe(n2)
    })
  })

  // ─── hasEdge ───

  describe('hasEdge', () => {
    it('throws before build', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      expect(() => graph.hasEdge(0, 1)).toThrow('Must call build() before querying')
    })

    it('returns true for existing edge', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      graph.build()
      expect(graph.hasEdge(0, 1)).toBe(true)
    })

    it('returns false for non-existent edge', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      graph.build()
      expect(graph.hasEdge(0, 2)).toBe(false)
    })

    it('returns false for reverse direction', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1)
      graph.build()
      expect(graph.hasEdge(1, 0)).toBe(false)
    })

    it('returns false for vertex with no edges', () => {
      const graph = new CSRGraph2(4)
      graph.addEdge(0, 1)
      graph.build()
      expect(graph.hasEdge(3, 0)).toBe(false)
    })

    it('finds weighted edges', () => {
      const graph = new CSRGraph2(3)
      graph.addEdge(0, 1, 42)
      graph.build()
      expect(graph.hasEdge(0, 1)).toBe(true)
    })
  })

  // ─── edgeCount / vertexCount ───

  describe('edgeCount and vertexCount', () => {
    it('tracks edge count correctly', () => {
      const graph = new CSRGraph2(5)
      expect(graph.edgeCount()).toBe(0)
      graph.addEdge(0, 1)
      expect(graph.edgeCount()).toBe(1)
      graph.addEdge(1, 2)
      graph.addEdge(2, 3)
      expect(graph.edgeCount()).toBe(3)
    })

    it('vertex count stays constant', () => {
      const graph = new CSRGraph2(10)
      graph.addEdge(0, 1)
      graph.addEdge(5, 6)
      graph.build()
      expect(graph.vertexCount()).toBe(10)
    })
  })

  // ─── empty graph edge cases ───

  describe('empty graph', () => {
    it('handles graph with no edges', () => {
      const graph = new CSRGraph2(3)
      graph.build()
      expect(graph.getNeighbors(0)).toEqual([])
      expect(graph.getNeighbors(1)).toEqual([])
      expect(graph.getNeighbors(2)).toEqual([])
      expect(graph.hasEdge(0, 1)).toBe(false)
    })
  })
})
