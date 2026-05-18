import { describe, it, expect } from 'vitest'
import { WingedEdgeMesh } from '../../src/core/winged-edge/index.js'

describe('WingedEdgeMesh', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an empty mesh', () => {
      const m = new WingedEdgeMesh()
      expect(m.getVertexCount()).toBe(0)
      expect(m.getEdgeCount()).toBe(0)
      expect(m.getFaceCount()).toBe(0)
    })
  })

  // ─── Add Vertex ───
  describe('addVertex', () => {
    it('adds a single vertex and returns its id', () => {
      const m = new WingedEdgeMesh()
      expect(m.addVertex(0, 0, 0)).toBe(0)
    })

    it('assigns sequential ids', () => {
      const m = new WingedEdgeMesh()
      expect(m.addVertex(0, 0, 0)).toBe(0)
      expect(m.addVertex(1, 0, 0)).toBe(1)
      expect(m.addVertex(0, 1, 0)).toBe(2)
    })

    it('stores vertex coordinates', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(1.5, 2.5, 3.5)
      const v = m.getVertex(0)
      expect(v).toEqual({ x: 1.5, y: 2.5, z: 3.5 })
    })

    it('supports negative coordinates', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(-1, -2, -3)
      const v = m.getVertex(0)
      expect(v).toEqual({ x: -1, y: -2, z: -3 })
    })

    it('tracks vertex count', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      expect(m.getVertexCount()).toBe(3)
    })
  })

  // ─── Add Edge ───
  describe('addEdge', () => {
    it('adds an edge between two vertices', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      expect(m.addEdge(0, 1)).toBe(0)
    })

    it('returns sequential edge ids', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      expect(m.addEdge(0, 1)).toBe(0)
      expect(m.addEdge(1, 2)).toBe(1)
      expect(m.addEdge(2, 0)).toBe(2)
    })

    it('stores vertex endpoints', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addEdge(0, 1)
      expect(m.getEdgeVertices(0)).toEqual([0, 1])
    })

    it('tracks edge count', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addEdge(0, 1)
      m.addEdge(1, 2)
      expect(m.getEdgeCount()).toBe(2)
    })

    it('allows self-loop edge', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addEdge(0, 0)
      expect(m.getEdgeVertices(0)).toEqual([0, 0])
    })
  })

  // ─── Add Face ───
  describe('addFace', () => {
    function makeTriangle() {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      const e0 = m.addEdge(0, 1)
      const e1 = m.addEdge(1, 2)
      const e2 = m.addEdge(2, 0)
      return { m, e0, e1, e2 }
    }

    it('adds a triangular face', () => {
      const { m, e0, e1, e2 } = makeTriangle()
      const f = m.addFace([e0, e1, e2])
      expect(f).toBe(0)
      expect(m.getFaceCount()).toBe(1)
    })

    it('stores face edges', () => {
      const { m, e0, e1, e2 } = makeTriangle()
      m.addFace([e0, e1, e2])
      expect(m.getFaceEdges(0)).toEqual([e0, e1, e2])
    })

    it('assigns leftFace to edges of first face', () => {
      const { m, e0, e1, e2 } = makeTriangle()
      m.addFace([e0, e1, e2])
      expect(m.getEdgeFaces(e0)).toEqual([0])
      expect(m.getEdgeFaces(e1)).toEqual([0])
      expect(m.getEdgeFaces(e2)).toEqual([0])
    })

    it('assigns rightFace to edges of second face sharing edges', () => {
      const { m, e0, e1, e2 } = makeTriangle()
      m.addFace([e0, e1, e2])
      m.addVertex(1, 1, 0)
      const e3 = m.addEdge(1, 3)
      const e4 = m.addEdge(3, 2)
      m.addFace([e1, e3, e4])
      expect(m.getEdgeFaces(e1)).toEqual([0, 1])
    })

    it('supports multiple faces', () => {
      const { m, e0, e1, e2 } = makeTriangle()
      m.addFace([e0, e1, e2])
      m.addVertex(1, 1, 0)
      const e3 = m.addEdge(1, 3)
      const e4 = m.addEdge(3, 2)
      m.addFace([e1, e3, e4])
      expect(m.getFaceCount()).toBe(2)
    })
  })

  // ─── Get Vertex ───
  describe('getVertex', () => {
    it('returns undefined for non-existent vertex', () => {
      const m = new WingedEdgeMesh()
      expect(m.getVertex(0)).toBeUndefined()
    })
  })

  // ─── Get Edge Vertices ───
  describe('getEdgeVertices', () => {
    it('returns undefined for non-existent edge', () => {
      const m = new WingedEdgeMesh()
      expect(m.getEdgeVertices(0)).toBeUndefined()
    })
  })

  // ─── Get Edge Faces ───
  describe('getEdgeFaces', () => {
    it('returns empty array for non-existent edge', () => {
      const m = new WingedEdgeMesh()
      expect(m.getEdgeFaces(99)).toEqual([])
    })

    it('returns only assigned faces', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      const e0 = m.addEdge(0, 1)
      const e1 = m.addEdge(1, 2)
      const e2 = m.addEdge(2, 0)
      m.addFace([e0, e1, e2])
      expect(m.getEdgeFaces(e0)).toEqual([0])
    })
  })

  // ─── Get Adjacent Edges ───
  describe('getAdjacentEdges', () => {
    it('returns empty array for non-existent edge', () => {
      const m = new WingedEdgeMesh()
      expect(m.getAdjacentEdges(99)).toEqual([])
    })

    it('returns prev/next from left face', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      const e0 = m.addEdge(0, 1)
      const e1 = m.addEdge(1, 2)
      const e2 = m.addEdge(2, 0)
      m.addFace([e0, e1, e2])
      const adj = m.getAdjacentEdges(e0)
      expect(adj).toContain(e2)
      expect(adj).toContain(e1)
    })
  })

  // ─── Get Vertex Edges ───
  describe('getVertexEdges', () => {
    it('returns empty array for non-existent vertex', () => {
      const m = new WingedEdgeMesh()
      expect(m.getVertexEdges(99)).toEqual([])
    })

    it('returns all edges connected to a vertex', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addEdge(0, 1)
      m.addEdge(0, 2)
      const edges = m.getVertexEdges(0)
      expect(edges).toHaveLength(2)
      expect(edges).toContain(0)
      expect(edges).toContain(1)
    })
  })

  // ─── Get Face Edges ───
  describe('getFaceEdges', () => {
    it('returns empty array for non-existent face', () => {
      const m = new WingedEdgeMesh()
      expect(m.getFaceEdges(99)).toEqual([])
    })
  })

  // ─── Remove Face ───
  describe('removeFace', () => {
    it('removes an existing face', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      const e0 = m.addEdge(0, 1)
      const e1 = m.addEdge(1, 2)
      const e2 = m.addEdge(2, 0)
      m.addFace([e0, e1, e2])
      expect(m.removeFace(0)).toBe(true)
      expect(m.getFaceCount()).toBe(0)
    })

    it('returns false for non-existent face', () => {
      const m = new WingedEdgeMesh()
      expect(m.removeFace(0)).toBe(false)
    })

    it('clears edge face references after removal', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      const e0 = m.addEdge(0, 1)
      const e1 = m.addEdge(1, 2)
      const e2 = m.addEdge(2, 0)
      m.addFace([e0, e1, e2])
      m.removeFace(0)
      expect(m.getEdgeFaces(e0)).toEqual([])
    })
  })

  // ─── Is Manifold ───
  describe('isManifold', () => {
    it('returns true for empty mesh', () => {
      const m = new WingedEdgeMesh()
      expect(m.isManifold()).toBe(true)
    })

    it('returns true for valid triangle', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      const e0 = m.addEdge(0, 1)
      const e1 = m.addEdge(1, 2)
      const e2 = m.addEdge(2, 0)
      m.addFace([e0, e1, e2])
      expect(m.isManifold()).toBe(true)
    })

    it('returns false for face with fewer than 3 edges', () => {
      const m = new WingedEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      const e0 = m.addEdge(0, 1)
      m.addFace([e0])
      expect(m.isManifold()).toBe(false)
    })
  })

  // ─── Get Time Complexity ───
  describe('getTimeComplexity', () => {
    it('returns a non-empty string', () => {
      const m = new WingedEdgeMesh()
      const s = m.getTimeComplexity()
      expect(typeof s).toBe('string')
      expect(s.length).toBeGreaterThan(0)
    })
  })
})
