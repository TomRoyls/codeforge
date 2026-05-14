import { describe, it, expect } from 'vitest';
import { EdgeGraph2 } from '../src/core/edge-graph-2/index.js';

describe('EdgeGraph2', () => {
  describe('constructor', () => {
    it('creates undirected graph by default', () => {
      const graph = new EdgeGraph2();
      expect(graph.isDirected()).toBe(false);
    });

    it('creates directed graph when directed is true', () => {
      const graph = new EdgeGraph2(true);
      expect(graph.isDirected()).toBe(true);
    });

    it('creates empty graph with zero vertices and edges', () => {
      const graph = new EdgeGraph2();
      expect(graph.vertexCount).toBe(0);
      expect(graph.edgeCount).toBe(0);
    });
  });

  describe('addVertex', () => {
    it('adds a single vertex', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      expect(graph.hasVertex('A')).toBe(true);
      expect(graph.vertexCount).toBe(1);
    });

    it('adds multiple vertices', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      expect(graph.vertexCount).toBe(3);
    });

    it('does not duplicate existing vertices', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      graph.addVertex('A');
      expect(graph.vertexCount).toBe(1);
    });
  });

  describe('addEdge', () => {
    it('adds edge between existing vertices', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'B');
      expect(graph.hasEdge('A', 'B')).toBe(true);
      expect(graph.edgeCount).toBe(2);
    });

    it('creates vertices implicitly when adding edge', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      expect(graph.hasVertex('A')).toBe(true);
      expect(graph.hasVertex('B')).toBe(true);
      expect(graph.vertexCount).toBe(2);
    });

    it('adds edge with default weight 0', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      const edges = graph.getEdges();
      const edge = edges.find(e => e.from === 'A' && e.to === 'B');
      expect(edge).toBeDefined();
      expect(edge!.weight).toBe(0);
    });

    it('adds edge with custom weight', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B', 5);
      const edges = graph.getEdges();
      const edge = edges.find(e => e.from === 'A' && e.to === 'B');
      expect(edge).toBeDefined();
      expect(edge!.weight).toBe(5);
    });

    it('updates weight of existing edge', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('A', 'B', 3);
      const edges = graph.getEdges();
      const forwardEdge = edges.find(e => e.from === 'A' && e.to === 'B');
      expect(forwardEdge!.weight).toBe(3);
      const backwardEdge = edges.find(e => e.from === 'B' && e.to === 'A');
      expect(backwardEdge!.weight).toBe(3);
    });

    it('adds two directed edges for undirected graph', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      expect(graph.hasEdge('A', 'B')).toBe(true);
      expect(graph.hasEdge('B', 'A')).toBe(true);
      expect(graph.edgeCount).toBe(2);
    });

    it('adds single directed edge for directed graph', () => {
      const graph = new EdgeGraph2(true);
      graph.addEdge('A', 'B');
      expect(graph.hasEdge('A', 'B')).toBe(true);
      expect(graph.hasEdge('B', 'A')).toBe(false);
      expect(graph.edgeCount).toBe(1);
    });

    it('handles self-loops in undirected graph', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'A');
      expect(graph.hasEdge('A', 'A')).toBe(true);
      expect(graph.edgeCount).toBe(1);
    });

    it('handles self-loops in directed graph', () => {
      const graph = new EdgeGraph2(true);
      graph.addEdge('A', 'A');
      expect(graph.hasEdge('A', 'A')).toBe(true);
      expect(graph.edgeCount).toBe(1);
    });
  });

  describe('removeVertex', () => {
    it('removes existing vertex', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      const result = graph.removeVertex('A');
      expect(result).toBe(true);
      expect(graph.hasVertex('A')).toBe(false);
      expect(graph.vertexCount).toBe(0);
    });

    it('removes vertex and all connected edges', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.removeVertex('B');
      expect(graph.hasVertex('B')).toBe(false);
      expect(graph.hasEdge('A', 'B')).toBe(false);
      expect(graph.hasEdge('B', 'A')).toBe(false);
      expect(graph.hasEdge('B', 'C')).toBe(false);
      expect(graph.hasEdge('C', 'B')).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });

    it('returns false when removing non-existent vertex', () => {
      const graph = new EdgeGraph2();
      const result = graph.removeVertex('A');
      expect(result).toBe(false);
    });
  });

  describe('removeEdge', () => {
    it('removes existing edge from undirected graph', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      const result = graph.removeEdge('A', 'B');
      expect(result).toBe(true);
      expect(graph.hasEdge('A', 'B')).toBe(false);
      expect(graph.hasEdge('B', 'A')).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });

    it('removes existing edge from directed graph', () => {
      const graph = new EdgeGraph2(true);
      graph.addEdge('A', 'B');
      const result = graph.removeEdge('A', 'B');
      expect(result).toBe(true);
      expect(graph.hasEdge('A', 'B')).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });

    it('returns false when removing non-existent edge', () => {
      const graph = new EdgeGraph2();
      const result = graph.removeEdge('A', 'B');
      expect(result).toBe(false);
    });
  });

  describe('hasVertex', () => {
    it('returns true for existing vertex', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      expect(graph.hasVertex('A')).toBe(true);
    });

    it('returns false for non-existent vertex', () => {
      const graph = new EdgeGraph2();
      expect(graph.hasVertex('A')).toBe(false);
    });
  });

  describe('hasEdge', () => {
    it('returns true for existing edge in undirected graph', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      expect(graph.hasEdge('A', 'B')).toBe(true);
      expect(graph.hasEdge('B', 'A')).toBe(true);
    });

    it('returns true for existing forward edge in directed graph', () => {
      const graph = new EdgeGraph2(true);
      graph.addEdge('A', 'B');
      expect(graph.hasEdge('A', 'B')).toBe(true);
    });

    it('returns false for reverse edge in directed graph', () => {
      const graph = new EdgeGraph2(true);
      graph.addEdge('A', 'B');
      expect(graph.hasEdge('B', 'A')).toBe(false);
    });

    it('returns false for non-existent edge', () => {
      const graph = new EdgeGraph2();
      expect(graph.hasEdge('A', 'B')).toBe(false);
    });
  });

  describe('getVertices', () => {
    it('returns empty array for empty graph', () => {
      const graph = new EdgeGraph2();
      const vertices = graph.getVertices();
      expect(vertices).toEqual([]);
    });

    it('returns all vertices', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      const vertices = graph.getVertices();
      expect(vertices).toHaveLength(3);
      expect(vertices).toContain('A');
      expect(vertices).toContain('B');
      expect(vertices).toContain('C');
    });
  });

  describe('getEdges', () => {
    it('returns empty array for empty graph', () => {
      const graph = new EdgeGraph2();
      const edges = graph.getEdges();
      expect(edges).toEqual([]);
    });

    it('returns all edges with correct structure', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B', 2);
      const edges = graph.getEdges();
      expect(edges).toHaveLength(2);
      expect(edges.some(e => e.from === 'A' && e.to === 'B' && e.weight === 2)).toBe(true);
      expect(edges.some(e => e.from === 'B' && e.to === 'A' && e.weight === 2)).toBe(true);
    });

    it('returns edges with weights', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B', 5);
      graph.addEdge('B', 'C', 3);
      const edges = graph.getEdges();
      const abEdge = edges.find(e => e.from === 'A' && e.to === 'B');
      const bcEdge = edges.find(e => e.from === 'B' && e.to === 'C');
      expect(abEdge!.weight).toBe(5);
      expect(bcEdge!.weight).toBe(3);
    });
  });

  describe('getNeighbors', () => {
    it('returns empty array for isolated vertex', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      const neighbors = graph.getNeighbors('A');
      expect(neighbors).toEqual([]);
    });

    it('returns all neighbors of vertex', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      graph.addEdge('A', 'C');
      graph.addEdge('A', 'D');
      const neighbors = graph.getNeighbors('A');
      expect(neighbors).toHaveLength(3);
      expect(neighbors).toContain('B');
      expect(neighbors).toContain('C');
      expect(neighbors).toContain('D');
    });

    it('does not return duplicates', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      graph.addEdge('A', 'B');
      const neighbors = graph.getNeighbors('A');
      expect(neighbors).toHaveLength(1);
      expect(neighbors[0]).toBe('B');
    });

    it('includes self in neighbors for self-loop', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'A');
      const neighbors = graph.getNeighbors('A');
      expect(neighbors).toHaveLength(1);
      expect(neighbors[0]).toBe('A');
    });
  });

  describe('vertexCount', () => {
    it('returns correct count after adding vertices', () => {
      const graph = new EdgeGraph2();
      expect(graph.vertexCount).toBe(0);
      graph.addVertex('A');
      expect(graph.vertexCount).toBe(1);
      graph.addVertex('B');
      expect(graph.vertexCount).toBe(2);
    });

    it('returns correct count after adding edges', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      expect(graph.vertexCount).toBe(3);
    });

    it('returns correct count after removing vertices', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.removeVertex('A');
      expect(graph.vertexCount).toBe(1);
    });
  });

  describe('edgeCount', () => {
    it('returns correct count after adding edges to undirected graph', () => {
      const graph = new EdgeGraph2();
      expect(graph.edgeCount).toBe(0);
      graph.addEdge('A', 'B');
      expect(graph.edgeCount).toBe(2);
      graph.addEdge('B', 'C');
      expect(graph.edgeCount).toBe(4);
    });

    it('returns correct count after adding edges to directed graph', () => {
      const graph = new EdgeGraph2(true);
      expect(graph.edgeCount).toBe(0);
      graph.addEdge('A', 'B');
      expect(graph.edgeCount).toBe(1);
      graph.addEdge('B', 'C');
      expect(graph.edgeCount).toBe(2);
    });

    it('returns correct count after removing edges', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.removeEdge('A', 'B');
      expect(graph.edgeCount).toBe(2);
    });

    it('counts self-loops as single edge', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'A');
      expect(graph.edgeCount).toBe(1);
    });
  });

  describe('isDirected', () => {
    it('returns false for undirected graph', () => {
      const graph = new EdgeGraph2();
      expect(graph.isDirected()).toBe(false);
    });

    it('returns true for directed graph', () => {
      const graph = new EdgeGraph2(true);
      expect(graph.isDirected()).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all vertices and edges', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');

      graph.clear();

      expect(graph.vertexCount).toBe(0);
      expect(graph.edgeCount).toBe(0);
      expect(graph.getVertices()).toEqual([]);
      expect(graph.getEdges()).toEqual([]);
    });

    it('resets graph to initial state', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      graph.addEdge('C', 'D');

      graph.clear();

      graph.addEdge('X', 'Y');

      expect(graph.vertexCount).toBe(2);
      expect(graph.edgeCount).toBe(2);
      expect(graph.hasEdge('X', 'Y')).toBe(true);
    });
  });

  describe('directed vs undirected behavior', () => {
    it('adds both directions for undirected edge', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B');

      expect(graph.getNeighbors('A')).toContain('B');
      expect(graph.getNeighbors('B')).toContain('A');
    });

    it('adds single direction for directed edge', () => {
      const graph = new EdgeGraph2(true);
      graph.addEdge('A', 'B');

      expect(graph.getNeighbors('A')).toContain('B');
      expect(graph.getNeighbors('B')).not.toContain('A');
    });

    it('updates both directions for undirected edge weight', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('A', 'B', 5);

      const edges = graph.getEdges();
      const forward = edges.find(e => e.from === 'A' && e.to === 'B');
      const backward = edges.find(e => e.from === 'B' && e.to === 'A');

      expect(forward!.weight).toBe(5);
      expect(backward!.weight).toBe(5);
    });
  });

  describe('self-loops', () => {
    it('adds self-loop to undirected graph', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'A');

      expect(graph.hasEdge('A', 'A')).toBe(true);
      expect(graph.getNeighbors('A')).toContain('A');
      expect(graph.edgeCount).toBe(1);
    });

    it('adds self-loop to directed graph', () => {
      const graph = new EdgeGraph2(true);
      graph.addEdge('A', 'A');

      expect(graph.hasEdge('A', 'A')).toBe(true);
      expect(graph.getNeighbors('A')).toContain('A');
      expect(graph.edgeCount).toBe(1);
    });

    it('updates self-loop weight', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'A', 1);
      graph.addEdge('A', 'A', 10);

      const edges = graph.getEdges();
      const edge = edges.find(e => e.from === 'A' && e.to === 'A');
      expect(edge!.weight).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('handles empty string vertex id', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('');
      graph.addEdge('', 'A');

      expect(graph.hasVertex('')).toBe(true);
      expect(graph.hasEdge('', 'A')).toBe(true);
    });

    it('handles special characters in vertex ids', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A-B');
      graph.addVertex('X_Y');
      graph.addEdge('A-B', 'X_Y');

      expect(graph.hasVertex('A-B')).toBe(true);
      expect(graph.hasVertex('X_Y')).toBe(true);
      expect(graph.hasEdge('A-B', 'X_Y')).toBe(true);
    });

    it('handles negative weights', () => {
      const graph = new EdgeGraph2();
      graph.addEdge('A', 'B', -5);

      const edges = graph.getEdges();
      const edge = edges.find(e => e.from === 'A' && e.to === 'B');
      expect(edge!.weight).toBe(-5);
    });

    it('handles removing from empty graph', () => {
      const graph = new EdgeGraph2();

      expect(graph.removeVertex('A')).toBe(false);
      expect(graph.removeEdge('A', 'B')).toBe(false);
    });

    it('handles removing non-existent vertex', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');

      expect(graph.removeVertex('B')).toBe(false);
      expect(graph.vertexCount).toBe(1);
    });

    it('handles removing non-existent edge', () => {
      const graph = new EdgeGraph2();
      graph.addVertex('A');
      graph.addVertex('B');

      expect(graph.removeEdge('A', 'B')).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });
  });
});
