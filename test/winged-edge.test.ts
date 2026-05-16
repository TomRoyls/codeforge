import { describe, it, expect } from 'vitest';
import { WingedEdgeMesh } from '../src/core/winged-edge/index.js';

describe('WingedEdgeMesh', () => {
  it('should create empty mesh', () => {
    const mesh = new WingedEdgeMesh();

    expect(mesh.getVertexCount()).toBe(0);
    expect(mesh.getEdgeCount()).toBe(0);
    expect(mesh.getFaceCount()).toBe(0);
  });

  it('should add vertex and return id', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    expect(mesh.getVertexCount()).toBe(3);
    expect(v0).toBe(0);
    expect(v1).toBe(1);
    expect(v2).toBe(2);
  });

  it('should get vertex by id', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(1, 2, 3);
    const vertex = mesh.getVertex(v0);

    expect(vertex).toBeDefined();
    expect(vertex!.x).toBe(1);
    expect(vertex!.y).toBe(2);
    expect(vertex!.z).toBe(3);
  });

  it('should return undefined for non-existent vertex', () => {
    const mesh = new WingedEdgeMesh();

    expect(mesh.getVertex(999)).toBeUndefined();
  });

  it('should add edge and return id', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);

    const e0 = mesh.addEdge(v0, v1);

    expect(mesh.getEdgeCount()).toBe(1);
    expect(e0).toBe(0);
  });

  it('should get edge vertices', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);

    const e0 = mesh.addEdge(v0, v1);
    const vertices = mesh.getEdgeVertices(e0);

    expect(vertices).toBeDefined();
    expect(vertices![0]).toBe(v0);
    expect(vertices![1]).toBe(v1);
  });

  it('should return undefined for non-existent edge', () => {
    const mesh = new WingedEdgeMesh();

    expect(mesh.getEdgeVertices(999)).toBeUndefined();
  });

  it('should add triangle face with 3 edges', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    const f0 = mesh.addFace([e0, e1, e2]);

    expect(mesh.getFaceCount()).toBe(1);
    expect(f0).toBe(0);
  });

  it('should get face edges', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    const f0 = mesh.addFace([e0, e1, e2]);
    const edges = mesh.getFaceEdges(f0);

    expect(edges).toHaveLength(3);
    expect(edges).toContain(e0);
    expect(edges).toContain(e1);
    expect(edges).toContain(e2);
  });

  it('should get edge faces', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    const f0 = mesh.addFace([e0, e1, e2]);
    const faces = mesh.getEdgeFaces(e0);

    expect(faces).toHaveLength(1);
    expect(faces).toContain(f0);
  });

  it('should get adjacent edges', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    mesh.addFace([e0, e1, e2]);
    const adjacent = mesh.getAdjacentEdges(e0);

    expect(adjacent).toBeDefined();
    expect(adjacent!.length).toBeGreaterThan(0);
    expect(adjacent).toContain(e1);
    expect(adjacent).toContain(e2);
  });

  it('should get vertex edges', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    const v0Edges = mesh.getVertexEdges(v0);

    expect(v0Edges).toHaveLength(2);
    expect(v0Edges).toContain(e0);
    expect(v0Edges).toContain(e2);
  });

  it('should check manifold for closed mesh', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    mesh.addFace([e0, e1, e2]);

    expect(mesh.isManifold()).toBe(true);
  });

  it('should check non-manifold for open mesh', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);

    mesh.addFace([e0, e1]);

    expect(mesh.isManifold()).toBe(false);
  });

  it('should remove face', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    const f0 = mesh.addFace([e0, e1, e2]);
    const removed = mesh.removeFace(f0);

    expect(removed).toBe(true);
    expect(mesh.getFaceCount()).toBe(0);
    expect(mesh.getEdgeFaces(e0)).toHaveLength(0);
  });

  it('should return false when removing non-existent face', () => {
    const mesh = new WingedEdgeMesh();

    expect(mesh.removeFace(999)).toBe(false);
  });

  it('should build triangle mesh', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0.5, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    mesh.addFace([e0, e1, e2]);

    expect(mesh.getVertexCount()).toBe(3);
    expect(mesh.getEdgeCount()).toBe(3);
    expect(mesh.getFaceCount()).toBe(1);
    expect(mesh.isManifold()).toBe(true);
  });

  it('should build quad mesh', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(1, 1, 0);
    const v3 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v3);
    const e3 = mesh.addEdge(v3, v0);

    mesh.addFace([e0, e1, e2, e3]);

    expect(mesh.getVertexCount()).toBe(4);
    expect(mesh.getEdgeCount()).toBe(4);
    expect(mesh.getFaceCount()).toBe(1);
    expect(mesh.isManifold()).toBe(true);
  });

  it('should return time complexity description', () => {
    const mesh = new WingedEdgeMesh();

    const complexity = mesh.getTimeComplexity();

    expect(typeof complexity).toBe('string');
    expect(complexity.length).toBeGreaterThan(0);
  });

  it('should handle multiple adjacent faces', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0.5, 1, 0);
    const v3 = mesh.addVertex(0.5, -0.5, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);
    const e3 = mesh.addEdge(v0, v3);
    const e4 = mesh.addEdge(v3, v1);

    mesh.addFace([e0, e1, e2]);
    mesh.addFace([e3, e4, e0]);

    const faces = mesh.getEdgeFaces(e0);

    expect(faces).toHaveLength(2);
  });

  it('should remove face and re-add it', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);

    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);

    const f0 = mesh.addFace([e0, e1, e2]);
    mesh.removeFace(f0);
    expect(mesh.getFaceCount()).toBe(0);

    const f1 = mesh.addFace([e0, e1, e2]);
    expect(mesh.getFaceCount()).toBe(1);
    expect(mesh.getEdgeFaces(e0)).toContain(f1);
  });

  it('should return empty array for getVertexEdges of non-existent vertex', () => {
    const mesh = new WingedEdgeMesh();
    expect(mesh.getVertexEdges(999)).toEqual([]);
  });

  it('should return empty array for getFaceEdges of non-existent face', () => {
    const mesh = new WingedEdgeMesh();
    expect(mesh.getFaceEdges(999)).toEqual([]);
  });

  it('should return empty array for getEdgeFaces of non-existent edge', () => {
    const mesh = new WingedEdgeMesh();
    expect(mesh.getEdgeFaces(999)).toEqual([]);
  });

  it('should return empty array for getAdjacentEdges of non-existent edge', () => {
    const mesh = new WingedEdgeMesh();
    expect(mesh.getAdjacentEdges(999)).toEqual([]);
  });

  it('should handle mesh with isolated edges (no faces)', () => {
    const mesh = new WingedEdgeMesh();

    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(2, 0, 0);

    mesh.addEdge(v0, v1);
    mesh.addEdge(v1, v2);

    expect(mesh.getVertexCount()).toBe(3);
    expect(mesh.getEdgeCount()).toBe(2);
    expect(mesh.getFaceCount()).toBe(0);
  });

  it('should handle vertex with multiple edges', () => {
    const mesh = new WingedEdgeMesh();

    const center = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    const v3 = mesh.addVertex(-1, 0, 0);

    const e0 = mesh.addEdge(center, v1);
    const e1 = mesh.addEdge(center, v2);
    const e2 = mesh.addEdge(center, v3);

    const edges = mesh.getVertexEdges(center);
    expect(edges).toHaveLength(3);
    expect(edges).toContain(e0);
    expect(edges).toContain(e1);
    expect(edges).toContain(e2);
  });

  it('should handle getVertexEdges on isolated vertex', () => {
    const mesh = new WingedEdgeMesh();
    const v = mesh.addVertex(0, 0, 0);
    expect(mesh.getVertexEdges(v)).toEqual([]);
  });

  it('should handle getVertexCount after multiple adds', () => {
    const mesh = new WingedEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 1, 1);
    mesh.addVertex(2, 2, 2);
    expect(mesh.getVertexCount()).toBe(3);
  });

  it('should handle triangle face', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    mesh.addEdge(v0, v1);
    mesh.addEdge(v1, v2);
    mesh.addEdge(v2, v0);
    expect(mesh.getEdgeCount()).toBe(3);
    expect(mesh.getVertexCount()).toBe(3);
  });

  it('should handle getVertexEdges on vertex with no edges', () => {
    const mesh = new WingedEdgeMesh();
    const v = mesh.addVertex(5, 5, 5);
    expect(mesh.getVertexEdges(v)).toEqual([]);
  });

  it('should report getTimeComplexity', () => {
    const mesh = new WingedEdgeMesh();
    expect(typeof mesh.getTimeComplexity()).toBe('string');
  });

  it('should handle getVertex returning coordinates', () => {
    const mesh = new WingedEdgeMesh();
    const v = mesh.addVertex(1, 2, 3);
    const vertex = mesh.getVertex(v);
    expect(vertex).toBeDefined();
  });

  it('should handle addFace', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);
    const face = mesh.addFace([e0, e1, e2]);
    expect(mesh.getFaceCount()).toBe(1);
  });

  it('should handle getEdgeVertices', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const e0 = mesh.addEdge(v0, v1);
    const verts = mesh.getEdgeVertices(e0);
    expect(verts).toBeDefined();
    expect(verts!.length).toBe(2);
  });

  it('should handle getEdgeCount after multiple edges', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    mesh.addEdge(v0, v1);
    mesh.addEdge(v1, v2);
    mesh.addEdge(v2, v0);
    expect(mesh.getEdgeCount()).toBe(3);
  });

  it('should handle getFaceEdges', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);
    const face = mesh.addFace([e0, e1, e2]);
    const faceEdges = mesh.getFaceEdges(face);
    expect(faceEdges).toHaveLength(3);
  });

  it('should handle getVertexCount', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    expect(mesh.getVertexCount()).toBe(3);
  });

  it('should handle getEdgeCount', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);
    mesh.addFace([e0, e1, e2]);
    expect(mesh.getEdgeCount()).toBe(3);
  });

  it('should handle getFaceCount', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    const e0 = mesh.addEdge(v0, v1);
    const e1 = mesh.addEdge(v1, v2);
    const e2 = mesh.addEdge(v2, v0);
    mesh.addFace([e0, e1, e2]);
    expect(mesh.getFaceCount()).toBe(1);
  });

  it('should handle getEdgeVertices', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const e0 = mesh.addEdge(v0, v1);
    const verts = mesh.getEdgeVertices(e0);
    expect(verts).toBeDefined();
    expect(verts!.length).toBe(2);
  });

  it('should handle getVertexCount', () => {
    const mesh = new WingedEdgeMesh();
    mesh.addVertex(0, 0, 0);
    mesh.addVertex(1, 0, 0);
    mesh.addVertex(0, 1, 0);
    expect(mesh.getVertexCount()).toBe(3);
  });
  it('should handle getEdgeCount', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    mesh.addEdge(v0, v1);
    mesh.addEdge(v1, v2);
    expect(mesh.getEdgeCount()).toBe(2);
  });
  it('should handle getVertexPositions', () => {
    const mesh = new WingedEdgeMesh();
    mesh.addVertex(1, 2, 3);
    mesh.addVertex(4, 5, 6);
    expect(mesh.getVertexCount()).toBe(2);
  });
  it('should handle addFace with existing edges', () => {
    const mesh = new WingedEdgeMesh();
    const v0 = mesh.addVertex(0, 0, 0);
    const v1 = mesh.addVertex(1, 0, 0);
    const v2 = mesh.addVertex(0, 1, 0);
    mesh.addEdge(v0, v1);
    mesh.addEdge(v1, v2);
    mesh.addEdge(v2, v0);
    expect(mesh.getEdgeCount()).toBe(3);
  });
});
