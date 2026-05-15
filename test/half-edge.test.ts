import { describe, it, expect } from 'vitest';
import { HalfEdgeMesh } from './src/core/half-edge/index.js';

describe('HalfEdgeMesh - Empty Mesh', () => {
  it('should create an empty mesh', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.getVertexCount()).toBe(0);
    expect(mesh.getFaceCount()).toBe(0);
    expect(mesh.getEdgeCount()).toBe(0);
  });

  it('should return undefined for non-existent vertex', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.getVertex(0)).toBe(undefined);
    expect(mesh.getVertex(-1)).toBe(undefined);
  });
});

describe('HalfEdgeMesh - Add Vertex', () => {
  it('should add vertices and return sequential ids', () => {
    const mesh = new HalfEdgeMesh();
    const id1 = mesh.addVertex(0, 0, 0);
    const id2 = mesh.addVertex(1, 0, 0);
    const id3 = mesh.addVertex(0, 1, 0);

    expect(id1).toBe(0);
    expect(id2).toBe(1);
    expect(id3).toBe(2);
    expect(mesh.getVertexCount()).toBe(3);
  });

  it('should retrieve vertex coordinates', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(1.5, 2.5, 3.5);
    mesh.addVertex(-1.0, -2.0, -3.0);

    const v1 = mesh.getVertex(0);
    expect(v1).toEqual({ x: 1.5, y: 2.5, z: 3.5 });

    const v2 = mesh.getVertex(1);
    expect(v2).toEqual({ x: -1.0, y: -2.0, z: -3.0 });
  });
});

describe('HalfEdgeMesh - Add Face', () => {
  it('should add a triangular face', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    const faceId = mesh.addFace([0, 1, 2]);

    expect(faceId).toBe(0);
    expect(mesh.getFaceCount()).toBe(1);
  });

  it('should throw error for face with less than 3 vertices', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);

    expect(() => mesh.addFace([0, 1])).toThrow('Face must have at least 3 vertices');
  });

  it('should throw error for invalid vertex id', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    expect(() => mesh.addFace([0, 1, 3])).toThrow('Invalid vertex id: 3');
  });

  it('should throw error for duplicate edge', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    expect(() => mesh.addFace([0, 1, 2])).toThrow('Edge already exists');
  });

  it('should create twin half-edges for adjacent faces', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    mesh.addFace([2, 1, 0]);

    expect(mesh.getEdgeCount()).toBe(3);
  });
});

describe('HalfEdgeMesh - Get Face Vertices', () => {
  it('should return empty array for invalid face id', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.getFaceVertices(-1)).toEqual([]);
    expect(mesh.getFaceVertices(0)).toEqual([]);
  });

  it('should return vertices of a triangle', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    const vertices = mesh.getFaceVertices(0);

    expect(vertices).toEqual([0, 1, 2]);
  });

  it('should return vertices of a quad', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2, 3]);
    const vertices = mesh.getFaceVertices(0);

    expect(vertices).toEqual([0, 1, 2, 3]);
  });
});

describe('HalfEdgeMesh - Get Adjacent Faces', () => {
  it('should return empty array for invalid face id', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.getAdjacentFaces(-1)).toEqual([]);
    expect(mesh.getAdjacentFaces(0)).toEqual([]);
  });

  it('should find adjacent faces sharing edges', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);
    mesh.addVertex(0.5, 0.5, 1);

    mesh.addFace([0, 1, 2]);
    mesh.addFace([2, 1, 0]);

    const adjacentToFace0 = mesh.getAdjacentFaces(0);
    expect(adjacentToFace0).toContain(1);

    const adjacentToFace1 = mesh.getAdjacentFaces(1);
    expect(adjacentToFace1).toContain(0);
  });

  it('should return empty array for isolated face', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    const adjacent = mesh.getAdjacentFaces(0);

    expect(adjacent).toEqual([]);
  });
});

describe('HalfEdgeMesh - Get Vertex Neighbors', () => {
  it('should return empty array for invalid vertex id', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.getVertexNeighbors(-1)).toEqual([]);
    expect(mesh.getVertexNeighbors(0)).toEqual([]);
  });

  it('should find neighbors of a vertex in a triangle', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    const neighbors0 = mesh.getVertexNeighbors(0);
    const neighbors1 = mesh.getVertexNeighbors(1);
    const neighbors2 = mesh.getVertexNeighbors(2);

    expect(neighbors0).toContain(1);
    expect(neighbors1).toContain(2);
    expect(neighbors2).toContain(0);
  });

  it('should find neighbors in a quad mesh', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2, 3]);
    const neighbors0 = mesh.getVertexNeighbors(0);

    expect(neighbors0).toContain(1);
  });
});

describe('HalfEdgeMesh - Get Vertex Faces', () => {
  it('should return empty array for invalid vertex id', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.getVertexFaces(-1)).toEqual([]);
    expect(mesh.getVertexFaces(0)).toEqual([]);
  });

  it('should find faces containing a vertex', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);
    mesh.addVertex(0.5, 0.5, 1);

    mesh.addFace([0, 1, 2]);
    mesh.addFace([2, 1, 0]);

    const faces0 = mesh.getVertexFaces(0);
    expect(faces0).toContain(0);
    expect(faces0).toContain(1);
  });

  it('should handle vertex in single face', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    const faces0 = mesh.getVertexFaces(0);

    expect(faces0).toEqual([0]);
  });
});

describe('HalfEdgeMesh - Remove Face', () => {
  it('should return false for invalid face id', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.removeFace(-1)).toBe(false);
    expect(mesh.removeFace(0)).toBe(false);
  });

  it('should remove a face and its half-edges', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    const removed = mesh.removeFace(0);

    expect(removed).toBe(true);
    expect(mesh.getFaceCount()).toBe(1);
    expect(mesh.getFaceVertices(0)).toEqual([]);
  });

  it('should return false when removing already removed face', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    mesh.removeFace(0);
    const removedAgain = mesh.removeFace(0);

    expect(removedAgain).toBe(false);
  });
});

describe('HalfEdgeMesh - Is Manifold', () => {
  it('should return true for empty mesh', () => {
    const mesh = new HalfEdgeMesh();
    expect(mesh.isManifold()).toBe(true);
  });

  it('should return true for single triangle', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    expect(mesh.isManifold()).toBe(true);
  });

  it('should return true for two adjacent triangles', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    mesh.addFace([2, 1, 0]);

    expect(mesh.isManifold()).toBe(true);
  });

  it('should detect non-manifold edges (more than 2 faces)', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);
    mesh.addVertex(0.5, 0.5, 1);

    mesh.addFace([0, 1, 4]);
    mesh.addFace([1, 2, 4]);
    mesh.addFace([2, 3, 4]);
    mesh.addFace([3, 0, 4]);

    expect(mesh.isManifold()).toBe(false);
  });
});

describe('HalfEdgeMesh - Boundary Edges', () => {
  it('should return empty array for closed mesh', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(1, 1, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    mesh.addFace([2, 1, 0]);

    const boundaries = mesh.getBoundaryEdges();
    expect(boundaries).toEqual([]);
  });

  it('should detect boundary edges in open mesh', () => {
    const mesh = new HalfEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);

    mesh.addFace([0, 1, 2]);
    const boundaries = mesh.getBoundaryEdges();

    expect(boundaries.length).toBeGreaterThan(0);
  });
});

describe('HalfEdgeMesh - Time Complexity', () => {
  it('should return time complexity description', () => {
    const mesh = new HalfEdgeMesh();
    const complexity = mesh.getTimeComplexity();

    expect(complexity).toContain('O(1)');
    expect(complexity).toContain('O(k)');
  });
});

describe('HalfEdgeMesh - Triangle Mesh', () => {
  it('should build a simple triangle mesh', () => {
    const mesh = new HalfEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0.5, 0.866, 0);

    mesh.addFace([v0, v1, v2]);

    expect(mesh.getVertexCount()).toBe(3);
    expect(mesh.getFaceCount()).toBe(1);
    expect(mesh.getEdgeCount()).toBe(3);

    const vertices = mesh.getFaceVertices(0);
    expect(vertices).toEqual([v0, v1, v2]);

    const neighbors = mesh.getVertexNeighbors(v0);
    expect(neighbors.length).toBe(1);
  });
});

describe('HalfEdgeMesh - Quad Mesh', () => {
  it('should build a quad mesh', () => {
    const mesh = new HalfEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(1, 1, 0);
    const v3 = mesh.addVertex(0, 1, 0);

    mesh.addFace([v0, v1, v2, v3]);

    expect(mesh.getVertexCount()).toBe(4);
    expect(mesh.getFaceCount()).toBe(1);
    expect(mesh.getEdgeCount()).toBe(4);

    const vertices = mesh.getFaceVertices(0);
    expect(vertices).toEqual([v0, v1, v2, v3]);

    const neighbors = mesh.getVertexNeighbors(v0);
    expect(neighbors.length).toBe(1);
  });
});

describe('HalfEdgeMesh - Complex Mesh', () => {
  it('should handle mesh with multiple connected faces', () => {
    const mesh = new HalfEdgeMesh();
    for (let i = 0; i < 9; i++) {
      mesh.addVertex((i % 3), Math.floor(i / 3), 0);
    }

    mesh.addFace([0, 1, 2]);
    mesh.addFace([3, 4, 5]);
    mesh.addFace([6, 7, 8]);

    expect(mesh.getVertexCount()).toBe(9);
    expect(mesh.getFaceCount()).toBe(3);
    expect(mesh.getEdgeCount()).toBe(9);

    const vertex4Faces = mesh.getVertexFaces(4);
    expect(vertex4Faces.length).toBeGreaterThan(0);

    const vertex4Neighbors = mesh.getVertexNeighbors(4);
    expect(vertex4Neighbors.length).toBeGreaterThan(0);
  });

  it('should handle getVertexFaces', () => {
    const he = new HalfEdgeMesh();
    const v0 = he.addVertex(0, 0, 0);
    const v1 = he.addVertex(1, 0, 0);
    const v2 = he.addVertex(0, 1, 0);
    he.addFace([v0, v1, v2]);
    const faces = he.getVertexFaces(v0);
    expect(faces.length).toBeGreaterThan(0);
  });
});
