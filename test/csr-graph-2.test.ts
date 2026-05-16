import { describe, it, expect } from 'vitest';
import { CSRGraph2 } from '../src/core/csr-graph-2/index.js';

describe('CSRGraph2', () => {
  describe('basic operations', () => {
    it('should add edges and build graph', () => {
      const graph = new CSRGraph2(5);
      graph.addEdge(0, 1, 10);
      graph.addEdge(0, 2, 20);
      graph.addEdge(1, 3, 30);
      graph.addEdge(2, 4, 40);
      graph.build();
      expect(graph.edgeCount()).toBe(4);
    });

    it('should get neighbors correctly', () => {
      const graph = new CSRGraph2(5);
      graph.addEdge(0, 1, 10);
      graph.addEdge(0, 2, 20);
      graph.addEdge(0, 3);
      graph.addEdge(1, 4);
      graph.build();

      const neighbors = graph.getNeighbors(0);
      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContainEqual({ to: 1, weight: 10 });
      expect(neighbors).toContainEqual({ to: 2, weight: 20 });
      expect(neighbors).toContainEqual({ to: 3 });
    });

    it('should return empty array for vertex with no neighbors', () => {
      const graph = new CSRGraph2(5);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.build();

      const neighbors = graph.getNeighbors(4);
      expect(neighbors).toEqual([]);
    });

    it('should return correct edge count', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.addEdge(2, 0);
      expect(graph.edgeCount()).toBe(3);
    });

    it('should return correct vertex count', () => {
      const graph = new CSRGraph2(5);
      expect(graph.vertexCount()).toBe(5);
    });

    it('should check if edge exists', () => {
      const graph = new CSRGraph2(4);
      graph.addEdge(0, 1);
      graph.addEdge(0, 2);
      graph.addEdge(1, 3);
      graph.build();

      expect(graph.hasEdge(0, 1)).toBe(true);
      expect(graph.hasEdge(0, 2)).toBe(true);
      expect(graph.hasEdge(1, 3)).toBe(true);
      expect(graph.hasEdge(0, 3)).toBe(false);
      expect(graph.hasEdge(1, 0)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty graph', () => {
      const graph = new CSRGraph2(3);
      graph.build();
      expect(graph.edgeCount()).toBe(0);
      expect(graph.vertexCount()).toBe(3);
      expect(graph.getNeighbors(0)).toEqual([]);
      expect(graph.hasEdge(0, 1)).toBe(false);
    });

    it('should handle single vertex', () => {
      const graph = new CSRGraph2(1);
      graph.build();
      expect(graph.vertexCount()).toBe(1);
      expect(graph.edgeCount()).toBe(0);
      expect(graph.getNeighbors(0)).toEqual([]);
    });

    it('should add edges without weight', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.build();

      const neighbors = graph.getNeighbors(0);
      expect(neighbors[0]).toEqual({ to: 1 });
    });
  });

  describe('error handling', () => {
    it('should throw error when querying before build', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);

      expect(() => graph.getNeighbors(0)).toThrow('Must call build() before querying');
      expect(() => graph.hasEdge(0, 1)).toThrow('Must call build() before querying');
    });

    it('should throw error when adding edge after build', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.build();

      expect(() => graph.addEdge(1, 2)).toThrow('Cannot add edges after build() is called');
    });
  });

  describe('multiple edges and weights', () => {
    it('should handle multiple edges from same vertex', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1, 1);
      graph.addEdge(0, 2, 2);
      graph.addEdge(0, 1, 3);
      graph.build();

      const neighbors = graph.getNeighbors(0);
      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContainEqual({ to: 1, weight: 1 });
      expect(neighbors).toContainEqual({ to: 2, weight: 2 });
      expect(neighbors).toContainEqual({ to: 1, weight: 3 });
    });

    it('should handle edges added in non-sorted order', () => {
      const graph = new CSRGraph2(4);
      graph.addEdge(2, 3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.build();

      expect(graph.hasEdge(0, 1)).toBe(true);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 3)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle single vertex graph', () => {
      const graph = new CSRGraph2(1);
      graph.build();
      expect(graph.vertexCount()).toBe(1);
      expect(graph.edgeCount()).toBe(0);
      expect(graph.getNeighbors(0)).toEqual([]);
    });

    it('should handle self-loop', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 0);
      graph.build();
      expect(graph.hasEdge(0, 0)).toBe(true);
      expect(graph.edgeCount()).toBe(1);
    });

    it('should return correct edge count', () => {
      const graph = new CSRGraph2(5);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      graph.build();
      expect(graph.edgeCount()).toBe(4);
    });

    it('should return correct vertex count', () => {
      const graph = new CSRGraph2(10);
      graph.build();
      expect(graph.vertexCount()).toBe(10);
    });

    it('should handle vertex with no outgoing edges', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.build();
      expect(graph.getNeighbors(2)).toEqual([]);
      expect(graph.hasEdge(2, 0)).toBe(false);
    });

    it('should handle multiple edges to same target', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1, 1);
      graph.addEdge(0, 1, 2);
      graph.build();
      const neighbors = graph.getNeighbors(0);
      expect(neighbors).toHaveLength(2);
    });

    it('should return correct vertex count', () => {
      const graph = new CSRGraph2(5);
      expect(graph.vertexCount()).toBe(5);
    });

    it('should return correct edge count', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.addEdge(0, 2);
      expect(graph.edgeCount()).toBe(3);
    });

    it('should handle self-loop', () => {
      const graph = new CSRGraph2(2);
      graph.addEdge(0, 0);
      graph.build();
      expect(graph.hasEdge(0, 0)).toBe(true);
      expect(graph.getNeighbors(0)).toHaveLength(1);
    });

    it('should handle build with no edges', () => {
      const graph = new CSRGraph2(3);
      graph.build();
      for (let i = 0; i < 3; i++) {
        expect(graph.getNeighbors(i)).toEqual([]);
      }
    });

    it('should preserve edge weights', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1, 10);
      graph.addEdge(0, 2, 20);
      graph.build();
      const neighbors = graph.getNeighbors(0);
      const weights = neighbors.map(n => n.weight);
      expect(weights).toContain(10);
      expect(weights).toContain(20);
    });
  });

  describe('additional coverage', () => {
    it('should handle chain graph', () => {
      const graph = new CSRGraph2(5);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      graph.build();
      expect(graph.hasEdge(0, 1)).toBe(true);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 3)).toBe(true);
      expect(graph.hasEdge(3, 4)).toBe(true);
      expect(graph.hasEdge(0, 4)).toBe(false);
      expect(graph.edgeCount()).toBe(4);
    });

    it('should handle star graph topology', () => {
      const graph = new CSRGraph2(5);
      graph.addEdge(0, 1);
      graph.addEdge(0, 2);
      graph.addEdge(0, 3);
      graph.addEdge(0, 4);
      graph.build();
      expect(graph.getNeighbors(0)).toHaveLength(4);
      for (let i = 1; i < 5; i++) {
        expect(graph.getNeighbors(i)).toEqual([]);
      }
    });

    it('should return undefined weight when not specified', () => {
      const graph = new CSRGraph2(2);
      graph.addEdge(0, 1);
      graph.build();
      const neighbors = graph.getNeighbors(0);
      expect(neighbors[0].weight).toBeUndefined();
    });

    it('should handle edge count before build', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      expect(graph.edgeCount()).toBe(2);
    });

    it('should handle multiple self-loops', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 0, 1);
      graph.addEdge(0, 0, 2);
      graph.addEdge(1, 1, 3);
      graph.build();
      expect(graph.getNeighbors(0)).toHaveLength(2);
      expect(graph.getNeighbors(1)).toHaveLength(1);
      expect(graph.getNeighbors(2)).toEqual([]);
    });

    it('should handle vertex count', () => {
      const graph = new CSRGraph2(5);
      expect(graph.vertexCount()).toBe(5);
    });

    it('should handle empty graph', () => {
      const graph = new CSRGraph2(3);
      graph.build();
      expect(graph.edgeCount()).toBe(0);
      for (let i = 0; i < 3; i++) {
        expect(graph.getNeighbors(i)).toEqual([]);
      }
    });

    it('should handle weighted edges', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1, 5);
      graph.addEdge(1, 2, 10);
      graph.build();
      const n0 = graph.getNeighbors(0);
      expect(n0[0].weight).toBe(5);
    });

    it('should handle hasEdge', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.build();
      expect(graph.hasEdge(0, 1)).toBe(true);
      expect(graph.hasEdge(0, 2)).toBe(false);
    });

    it('should handle vertexCount', () => {
      const graph = new CSRGraph2(5);
      expect(graph.vertexCount()).toBe(5);
    });

    it('should handle edgeCount', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.build();
      expect(graph.edgeCount()).toBe(2);
    });

    it('should handle hasEdge', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.build();
      expect(graph.hasEdge(0, 1)).toBe(true);
      expect(graph.hasEdge(1, 0)).toBe(false);
    });

    it('should handle getNeighbors', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(0, 2);
      graph.build();
      const neighbors = graph.getNeighbors(0);
      expect(neighbors).toHaveLength(2);
    });

    it('should handle weighted edges', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1, 5);
      graph.addEdge(0, 2, 10);
      graph.build();
      const neighbors = graph.getNeighbors(0);
      expect(neighbors[0]!.weight).toBe(5);
      expect(neighbors[1]!.weight).toBe(10);
    });

    it('should handle vertexCount', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.build();
      expect(graph.vertexCount()).toBe(3);
    });

    it('should handle hasEdge', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.build();
      expect(graph.hasEdge(0, 1)).toBe(true);
      expect(graph.hasEdge(0, 2)).toBe(false);
    });

    it('should handle edgeCount', () => {
      const graph = new CSRGraph2(3);
      graph.addEdge(0, 1);
      graph.addEdge(1, 2);
      graph.addEdge(0, 2);
      graph.build();
      expect(graph.edgeCount()).toBe(3);
    });
  });

  it('should handle getEdgeWeight', () => {
    const graph = new CSRGraph2(3);
    graph.addEdge(0, 1, 7);
    graph.addEdge(0, 2, 3);
    graph.build();
    const neighbors = graph.getNeighbors(0);
    expect(neighbors[0]!.weight).toBe(7);
    expect(neighbors[1]!.weight).toBe(3);
  });
  it('should handle getNeighbors for vertex with no edges', () => {
    const graph = new CSRGraph2(3);
    graph.addEdge(0, 1, 5);
    graph.build();
    expect(graph.getNeighbors(2)).toEqual([]);
  });
  it('should handle getVertexCount', () => {
    const graph = new CSRGraph2(3);
    graph.addEdge(0, 1, 5);
    graph.build();
    expect(graph.vertexCount()).toBe(3);
  });
  it('should handle edge with weight', () => {
    const graph = new CSRGraph2(3);
    graph.addEdge(0, 1, 7);
    graph.addEdge(0, 2, 3);
    graph.build();
    const neighbors = graph.getNeighbors(0);
    expect(neighbors.length).toBe(2);
  });
  it('should handle hasEdge', () => {
    const graph = new CSRGraph2(3);
    graph.addEdge(0, 1, 5);
    graph.addEdge(1, 2, 3);
    graph.build();
    expect(graph.hasEdge(0, 1)).toBe(true);
    expect(graph.hasEdge(0, 2)).toBe(false);
  });
});
