import { describe, it, expect } from 'vitest'
import { HalfEdgeMesh } from '../../src/core/half-edge/index.js'

describe('HalfEdgeMesh', () => {
  // ─── addVertex ───
  describe('addVertex', () => {
    it('adds vertices and returns sequential IDs', () => {
      const m = new HalfEdgeMesh()
      expect(m.addVertex(0, 0, 0)).toBe(0)
      expect(m.addVertex(1, 0, 0)).toBe(1)
      expect(m.addVertex(0, 1, 0)).toBe(2)
    })

    it('increments vertex count', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      expect(m.getVertexCount()).toBe(2)
    })
  })

  // ─── getVertex ───
  describe('getVertex', () => {
    it('returns vertex coordinates', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(1, 2, 3)
      expect(m.getVertex(0)).toEqual({ x: 1, y: 2, z: 3 })
    })

    it('returns undefined for invalid ID', () => {
      const m = new HalfEdgeMesh()
      expect(m.getVertex(-1)).toBeUndefined()
      expect(m.getVertex(99)).toBeUndefined()
    })
  })

  // ─── addFace ───
  describe('addFace', () => {
    it('adds a triangular face', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      expect(m.addFace([0, 1, 2])).toBe(0)
      expect(m.getFaceCount()).toBe(1)
    })

    it('adds a quad face', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(1, 1, 0)
      m.addVertex(0, 1, 0)
      expect(m.addFace([0, 1, 2, 3])).toBe(0)
      expect(m.getFaceCount()).toBe(1)
    })

    it('throws for face with fewer than 3 vertices', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      expect(() => m.addFace([0, 1])).toThrow('Face must have at least 3 vertices')
    })

    it('throws for invalid vertex ID', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      expect(() => m.addFace([0, 1, 99])).toThrow('Invalid vertex id')
    })

    it('throws for negative vertex ID', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      expect(() => m.addFace([0, 1, -1])).toThrow('Invalid vertex id')
    })

    it('throws for duplicate edge', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      m.addVertex(1, 1, 0)
      expect(() => m.addFace([0, 1, 2, 3])).toThrow('Edge already exists')
    })
  })

  // ─── getVertexCount / getFaceCount / getEdgeCount ───
  describe('getVertexCount / getFaceCount / getEdgeCount', () => {
    it('reports correct counts for a triangle', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      expect(m.getVertexCount()).toBe(3)
      expect(m.getFaceCount()).toBe(1)
      expect(m.getEdgeCount()).toBe(3)
    })

    it('reports correct counts for two adjacent triangles', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addVertex(1, 1, 0)
      m.addFace([0, 1, 2])
      m.addFace([1, 3, 2])
      expect(m.getVertexCount()).toBe(4)
      expect(m.getFaceCount()).toBe(2)
      expect(m.getEdgeCount()).toBe(5)
    })

    it('reports 0 for empty mesh', () => {
      const m = new HalfEdgeMesh()
      expect(m.getVertexCount()).toBe(0)
      expect(m.getFaceCount()).toBe(0)
      expect(m.getEdgeCount()).toBe(0)
    })
  })

  // ─── getFaceVertices ───
  describe('getFaceVertices', () => {
    it('returns vertices of a triangular face', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      expect(m.getFaceVertices(0)).toEqual([0, 1, 2])
    })

    it('returns vertices of a quad face', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(1, 1, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2, 3])
      expect(m.getFaceVertices(0)).toEqual([0, 1, 2, 3])
    })

    it('returns empty for invalid face ID', () => {
      const m = new HalfEdgeMesh()
      expect(m.getFaceVertices(-1)).toEqual([])
      expect(m.getFaceVertices(99)).toEqual([])
    })
  })

  // ─── getAdjacentFaces ───
  describe('getAdjacentFaces', () => {
    it('returns adjacent faces sharing an edge', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addVertex(1, 1, 0)
      m.addFace([0, 1, 2])
      m.addFace([1, 3, 2])
      expect(m.getAdjacentFaces(0)).toEqual([1])
      expect(m.getAdjacentFaces(1)).toEqual([0])
    })

    it('returns empty for face with no adjacent faces', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      expect(m.getAdjacentFaces(0)).toEqual([])
    })

    it('returns empty for invalid face ID', () => {
      const m = new HalfEdgeMesh()
      expect(m.getAdjacentFaces(-1)).toEqual([])
      expect(m.getAdjacentFaces(99)).toEqual([])
    })
  })

  // ─── getVertexNeighbors ───
  describe('getVertexNeighbors', () => {
    it('returns neighboring vertices via twin chain', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      const neighbors = m.getVertexNeighbors(0)
      expect(neighbors.length).toBeGreaterThan(0)
      expect(neighbors.every((n) => [1, 2].includes(n))).toBe(true)
    })

    it('returns empty for isolated vertex', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      expect(m.getVertexNeighbors(0)).toEqual([])
    })

    it('returns empty for invalid vertex ID', () => {
      const m = new HalfEdgeMesh()
      expect(m.getVertexNeighbors(-1)).toEqual([])
      expect(m.getVertexNeighbors(99)).toEqual([])
    })

    it('returns neighbors for shared vertex between two faces', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addVertex(1, 1, 0)
      m.addFace([0, 1, 2])
      m.addFace([1, 3, 2])
      const neighbors = m.getVertexNeighbors(2)
      expect(neighbors.length).toBeGreaterThan(0)
      expect(neighbors.every((n) => [0, 1, 3].includes(n))).toBe(true)
    })
  })

  // ─── getVertexFaces ───
  describe('getVertexFaces', () => {
    it('returns faces incident to a vertex', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addVertex(1, 1, 0)
      m.addFace([0, 1, 2])
      m.addFace([1, 3, 2])
      expect(m.getVertexFaces(2).sort()).toEqual([0, 1])
    })

    it('returns empty for isolated vertex', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      expect(m.getVertexFaces(0)).toEqual([])
    })

    it('returns empty for invalid vertex ID', () => {
      const m = new HalfEdgeMesh()
      expect(m.getVertexFaces(-1)).toEqual([])
      expect(m.getVertexFaces(99)).toEqual([])
    })
  })

  // ─── removeFace ───
  describe('removeFace', () => {
    it('removes a face (sets it to null)', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      expect(m.removeFace(0)).toBe(true)
      expect(m.getFaceVertices(0)).toEqual([])
    })

    it('returns false for invalid face ID', () => {
      const m = new HalfEdgeMesh()
      expect(m.removeFace(-1)).toBe(false)
      expect(m.removeFace(99)).toBe(false)
    })

    it('returns false for already removed face', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      m.removeFace(0)
      expect(m.removeFace(0)).toBe(false)
    })
  })

  // ─── isManifold ───
  describe('isManifold', () => {
    it('returns true for single triangle', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      expect(m.isManifold()).toBe(true)
    })

    it('returns true for two adjacent triangles', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addVertex(1, 1, 0)
      m.addFace([0, 1, 2])
      m.addFace([1, 3, 2])
      expect(m.isManifold()).toBe(true)
    })

    it('returns true for empty mesh', () => {
      const m = new HalfEdgeMesh()
      expect(m.isManifold()).toBe(true)
    })

    it('returns true for vertices with no faces', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      expect(m.isManifold()).toBe(true)
    })
  })

  // ─── getBoundaryEdges ───
  describe('getBoundaryEdges', () => {
    it('returns all boundary edges for single triangle', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addFace([0, 1, 2])
      const boundaries = m.getBoundaryEdges()
      expect(boundaries.length).toBe(1)
      expect(boundaries[0]!.length).toBe(3)
    })

    it('returns empty for empty mesh', () => {
      const m = new HalfEdgeMesh()
      expect(m.getBoundaryEdges()).toEqual([])
    })

    it('returns boundary chains for two adjacent triangles', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(1, 0, 0)
      m.addVertex(0, 1, 0)
      m.addVertex(1, 1, 0)
      m.addFace([0, 1, 2])
      m.addFace([1, 3, 2])
      const boundaries = m.getBoundaryEdges()
      expect(boundaries.length).toBeGreaterThan(0)
      const totalBoundaryVertices = boundaries.reduce((sum, b) => sum + b.length, 0)
      expect(totalBoundaryVertices).toBeGreaterThan(0)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('returns a non-empty string', () => {
      const m = new HalfEdgeMesh()
      expect(typeof m.getTimeComplexity()).toBe('string')
      expect(m.getTimeComplexity().length).toBeGreaterThan(0)
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles coordinates with negative values', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(-1, -2, -3)
      expect(m.getVertex(0)).toEqual({ x: -1, y: -2, z: -3 })
    })

    it('handles coordinates with zero values', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      expect(m.getVertex(0)).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('handles degenerate triangle (all same point)', () => {
      const m = new HalfEdgeMesh()
      m.addVertex(0, 0, 0)
      m.addVertex(0, 0, 0)
      m.addVertex(0, 0, 0)
      expect(m.addFace([0, 1, 2])).toBe(0)
      expect(m.getFaceCount()).toBe(1)
    })
  })
})
