import {describe, it, expect} from 'vitest';
import {WeightedGraph2} from '../src/core/weighted-graph-2/index.js';

describe('WeightedGraph2', () => {
  describe('construction and vertices', () => {
    it('should create empty graph', () => {
      const graph = new WeightedGraph2();
      expect(graph.vertexCount()).toBe(0);
      expect(graph.edgeCount()).toBe(0);
      expect(graph.vertices()).toEqual([]);
    });

    it('should add vertex', () => {
      const graph = new WeightedGraph2();
      graph.addVertex('A');
      expect(graph.vertexCount()).toBe(1);
      expect(graph.hasVertex('A')).toBe(true);
      expect(graph.vertices()).toEqual(['A']);
    });

    it('should not duplicate vertex', () => {
      const graph = new WeightedGraph2();
      graph.addVertex('A');
      graph.addVertex('A');
      expect(graph.vertexCount()).toBe(1);
    });

    it('should remove vertex', () => {
      const graph = new WeightedGraph2();
      graph.addVertex('A');
      expect(graph.removeVertex('A')).toBe(true);
      expect(graph.vertexCount()).toBe(0);
      expect(graph.hasVertex('A')).toBe(false);
    });

    it('should return false when removing non-existent vertex', () => {
      const graph = new WeightedGraph2();
      expect(graph.removeVertex('A')).toBe(false);
    });

    it('should list all vertices', () => {
      const graph = new WeightedGraph2();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      const verts = graph.vertices().sort();
      expect(verts).toEqual(['A', 'B', 'C']);
    });
  });

  describe('edges', () => {
    it('should add edge and create vertices if needed', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      expect(graph.vertexCount()).toBe(2);
      expect(graph.edgeCount()).toBe(1);
      expect(graph.hasEdge('A', 'B')).toBe(true);
    });

    it('should get edge weight', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 10);
      expect(graph.getEdgeWeight('A', 'B')).toBe(10);
    });

    it('should return undefined for non-existent edge weight', () => {
      const graph = new WeightedGraph2();
      expect(graph.getEdgeWeight('A', 'B')).toBeUndefined();
      graph.addEdge('A', 'B', 5);
      expect(graph.getEdgeWeight('A', 'C')).toBeUndefined();
    });

    it('should update edge weight when adding existing edge', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      graph.addEdge('A', 'B', 10);
      expect(graph.edgeCount()).toBe(1);
      expect(graph.getEdgeWeight('A', 'B')).toBe(10);
    });

    it('should remove edge', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      expect(graph.removeEdge('A', 'B')).toBe(true);
      expect(graph.edgeCount()).toBe(0);
      expect(graph.hasEdge('A', 'B')).toBe(false);
    });

    it('should return false when removing non-existent edge', () => {
      const graph = new WeightedGraph2();
      expect(graph.removeEdge('A', 'B')).toBe(false);
      graph.addVertex('A');
      expect(graph.removeEdge('A', 'B')).toBe(false);
    });

    it('should return false for non-existent edge', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      expect(graph.hasEdge('B', 'A')).toBe(false);
      expect(graph.hasEdge('A', 'C')).toBe(false);
    });

    it('should count edges', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('B', 'C', 2);
      graph.addEdge('C', 'A', 3);
      expect(graph.edgeCount()).toBe(3);
    });
  });

  describe('neighbors', () => {
    it('should get neighbors', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      graph.addEdge('A', 'C', 10);
      const neighbors = graph.getNeighbors('A').sort((a, b) => a.to.localeCompare(b.to));
      expect(neighbors).toEqual([
        {to: 'B', weight: 5},
        {to: 'C', weight: 10},
      ]);
    });

    it('should return empty array for vertex with no neighbors', () => {
      const graph = new WeightedGraph2();
      graph.addVertex('A');
      expect(graph.getNeighbors('A')).toEqual([]);
    });

    it('should return empty array for non-existent vertex', () => {
      const graph = new WeightedGraph2();
      expect(graph.getNeighbors('A')).toEqual([]);
    });
  });

  describe('vertex removal with edges', () => {
    it('should remove edges pointing to removed vertex', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('C', 'B', 2);
      graph.removeVertex('B');
      expect(graph.edgeCount()).toBe(0);
      expect(graph.hasEdge('A', 'B')).toBe(false);
      expect(graph.hasEdge('C', 'B')).toBe(false);
    });

    it('should keep other edges when removing vertex', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('B', 'C', 2);
      graph.addEdge('C', 'D', 3);
      graph.removeVertex('B');
      expect(graph.edgeCount()).toBe(1);
      expect(graph.hasEdge('C', 'D')).toBe(true);
      expect(graph.hasEdge('A', 'B')).toBe(false);
      expect(graph.hasEdge('B', 'C')).toBe(false);
    });
  });

  describe('directed graph behavior', () => {
    it('should be directed by default', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      expect(graph.hasEdge('A', 'B')).toBe(true);
      expect(graph.hasEdge('B', 'A')).toBe(false);
      expect(graph.getNeighbors('A')).toEqual([{to: 'B', weight: 5}]);
      expect(graph.getNeighbors('B')).toEqual([]);
    });

    it('should handle self-loop', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'A', 1);
      expect(graph.hasEdge('A', 'A')).toBe(true);
      expect(graph.vertexCount()).toBe(1);
    });

    it('should handle isolated vertex', () => {
      const graph = new WeightedGraph2();
      graph.addVertex('isolated');
      expect(graph.vertexCount()).toBe(1);
      expect(graph.getNeighbors('isolated')).toEqual([]);
      expect(graph.hasEdge('isolated', 'any')).toBe(false);
    });

    it('should update edge weight', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      graph.addEdge('A', 'B', 10);
      expect(graph.getEdgeWeight('A', 'B')).toBe(10);
    });

    it('should handle multiple edges from same vertex', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('A', 'C', 2);
      graph.addEdge('A', 'D', 3);
      const neighbors = graph.getNeighbors('A');
      expect(neighbors).toHaveLength(3);
      expect(graph.edgeCount()).toBe(3);
    });
  });

  describe('additional coverage', () => {
    it('should handle remove edge and re-add', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 5);
      graph.removeEdge('A', 'B');
      expect(graph.hasEdge('A', 'B')).toBe(false);
      graph.addEdge('A', 'B', 10);
      expect(graph.getEdgeWeight('A', 'B')).toBe(10);
    });

    it('should handle remove vertex that has outgoing edges', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('A', 'C', 2);
      graph.removeVertex('A');
      expect(graph.hasVertex('A')).toBe(false);
      expect(graph.hasEdge('A', 'B')).toBe(false);
      expect(graph.hasEdge('A', 'C')).toBe(false);
      expect(graph.edgeCount()).toBe(0);
    });

    it('should handle negative edge weights', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', -5);
      expect(graph.getEdgeWeight('A', 'B')).toBe(-5);
      expect(graph.hasEdge('A', 'B')).toBe(true);
    });

    it('should handle zero weight edge', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 0);
      expect(graph.getEdgeWeight('A', 'B')).toBe(0);
      expect(graph.hasEdge('A', 'B')).toBe(true);
    });

    it('should handle complex graph with multiple removals', () => {
      const graph = new WeightedGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('B', 'C', 2);
      graph.addEdge('C', 'D', 3);
      graph.addEdge('D', 'A', 4);
      expect(graph.edgeCount()).toBe(4);
      graph.removeEdge('B', 'C');
      expect(graph.edgeCount()).toBe(3);
      graph.removeVertex('D');
      expect(graph.edgeCount()).toBe(1);
      expect(graph.vertexCount()).toBe(3);
    });

    it('should handle getEdgeWeight on non-existent edge', () => {
      const graph = new WeightedGraph2();
      expect(graph.getEdgeWeight('A', 'B')).toBeUndefined();
    });

    it('should handle vertexCount on empty graph', () => {
      const graph = new WeightedGraph2();
      expect(graph.vertexCount()).toBe(0);
      expect(graph.edgeCount()).toBe(0);
    });
  });
});
