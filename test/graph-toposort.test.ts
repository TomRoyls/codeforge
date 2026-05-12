import { describe, it, expect } from 'vitest';
import { GraphTopoSort } from '../src/core/graph-toposort/index.js';

describe('GraphTopoSort', () => {
  describe('Constructor', () => {
    it('should create an empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.vertexCount).toBe(0);
      expect(graph.edgeCount).toBe(0);
      expect(graph.vertices()).toEqual([]);
      expect(graph.edges()).toEqual([]);
    });
  });

  describe('addVertex', () => {
    it('should add a single vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.vertexCount).toBe(1);
    });

    it('should add multiple vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.vertexCount).toBe(3);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
      expect(graph.hasVertex(3)).toBe(true);
    });

    it('should not duplicate vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(1);
      graph.addVertex(1);
      expect(graph.vertexCount).toBe(1);
    });

    it('should add vertex with negative ID', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(-1);
      expect(graph.hasVertex(-1)).toBe(true);
    });

    it('should add vertex with zero ID', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(0);
      expect(graph.hasVertex(0)).toBe(true);
    });
  });

  describe('addEdge', () => {
    it('should add an edge between two vertices', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.edgeCount).toBe(1);
    });

    it('should create vertices if they do not exist', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
    });

    it('should add multiple edges', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      expect(graph.edgeCount).toBe(3);
    });

    it('should allow duplicate edges from same source', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 2);
      graph.addEdge(1, 2);
      expect(graph.edgeCount).toBe(1);
    });

    it('should add edge with negative IDs', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(-1, -2);
      expect(graph.hasEdge(-1, -2)).toBe(true);
    });
  });

  describe('removeVertex', () => {
    it('should remove an existing vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.removeVertex(1);
      expect(graph.hasVertex(1)).toBe(false);
      expect(graph.vertexCount).toBe(0);
    });

    it('should remove edges connected to removed vertex', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(3, 1);
      graph.removeVertex(1);
      expect(graph.edgeCount).toBe(0);
    });

    it('should handle removing non-existent vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.removeVertex(2);
      expect(graph.vertexCount).toBe(1);
    });

    it('should remove vertex from middle of graph', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.removeVertex(2);
      expect(graph.hasVertex(2)).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });
  });

  describe('removeEdge', () => {
    it('should remove an existing edge', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });

    it('should handle removing non-existent edge', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.removeEdge(1, 3);
      expect(graph.edgeCount).toBe(1);
    });

    it('should handle removing edge from non-existent vertex', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.removeEdge(3, 4);
      expect(graph.edgeCount).toBe(1);
    });
  });

  describe('hasVertex', () => {
    it('should return true for existing vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
    });

    it('should return false for non-existent vertex', () => {
      const graph = new GraphTopoSort();
      expect(graph.hasVertex(1)).toBe(false);
    });

    it('should return false after removing vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.removeVertex(1);
      expect(graph.hasVertex(1)).toBe(false);
    });
  });

  describe('hasEdge', () => {
    it('should return true for existing edge', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
    });

    it('should return false for non-existent edge', () => {
      const graph = new GraphTopoSort();
      expect(graph.hasEdge(1, 2)).toBe(false);
    });

    it('should return false after removing edge', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
    });

    it('should return false for reverse edge', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });
  });

  describe('vertices', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.vertices()).toEqual([]);
    });

    it('should return all vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      const result = graph.vertices();
      expect(result).toHaveLength(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should not include removed vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      graph.removeVertex(2);
      const result = graph.vertices();
      expect(result).toHaveLength(2);
      expect(result).toContain(1);
      expect(result).toContain(3);
    });
  });

  describe('edges', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.edges()).toEqual([]);
    });

    it('should return all edges', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      const result = graph.edges();
      expect(result).toHaveLength(3);
      expect(result).toContainEqual([1, 2]);
      expect(result).toContainEqual([2, 3]);
      expect(result).toContainEqual([3, 4]);
    });

    it('should not include removed edges', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.removeEdge(1, 2);
      const result = graph.edges();
      expect(result).toHaveLength(1);
      expect(result).toContainEqual([2, 3]);
    });
  });

  describe('vertexCount', () => {
    it('should return 0 for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.vertexCount).toBe(0);
    });

    it('should return correct count after adding vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.vertexCount).toBe(3);
    });

    it('should decrease after removing vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.removeVertex(1);
      expect(graph.vertexCount).toBe(1);
    });
  });

  describe('edgeCount', () => {
    it('should return 0 for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.edgeCount).toBe(0);
    });

    it('should return correct count after adding edges', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      expect(graph.edgeCount).toBe(2);
    });

    it('should decrease after removing edges', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.removeEdge(1, 2);
      expect(graph.edgeCount).toBe(1);
    });
  });

  describe('getInDegree', () => {
    it('should return 0 for isolated vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      expect(graph.getInDegree(1)).toBe(0);
    });

    it('should return correct in-degree', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 3);
      graph.addEdge(2, 3);
      graph.addEdge(4, 3);
      expect(graph.getInDegree(3)).toBe(3);
    });

    it('should return 0 for non-existent vertex', () => {
      const graph = new GraphTopoSort();
      expect(graph.getInDegree(1)).toBe(0);
    });

    it('should update after removing edges', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(3, 2);
      graph.removeEdge(1, 2);
      expect(graph.getInDegree(2)).toBe(1);
    });
  });

  describe('getOutDegree', () => {
    it('should return 0 for isolated vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      expect(graph.getOutDegree(1)).toBe(0);
    });

    it('should return correct out-degree', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(1, 4);
      expect(graph.getOutDegree(1)).toBe(3);
    });

    it('should return 0 for non-existent vertex', () => {
      const graph = new GraphTopoSort();
      expect(graph.getOutDegree(1)).toBe(0);
    });

    it('should update after removing edges', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.removeEdge(1, 2);
      expect(graph.getOutDegree(1)).toBe(1);
    });
  });

  describe('getSourceVertices', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.getSourceVertices()).toEqual([]);
    });

    it('should return source vertices', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      const sources = graph.getSourceVertices();
      expect(sources).toEqual([1]);
    });

    it('should return multiple source vertices', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 3);
      graph.addEdge(2, 3);
      graph.addEdge(4, 3);
      const sources = graph.getSourceVertices();
      expect(sources).toHaveLength(3);
      expect(sources).toContain(1);
      expect(sources).toContain(2);
      expect(sources).toContain(4);
    });

    it('should return all vertices for empty graph with vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      const sources = graph.getSourceVertices();
      expect(sources).toHaveLength(3);
    });
  });

  describe('getSinkVertices', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.getSinkVertices()).toEqual([]);
    });

    it('should return sink vertices', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      const sinks = graph.getSinkVertices();
      expect(sinks).toEqual([4]);
    });

    it('should return multiple sink vertices', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(1, 4);
      const sinks = graph.getSinkVertices();
      expect(sinks).toHaveLength(3);
      expect(sinks).toContain(2);
      expect(sinks).toContain(3);
      expect(sinks).toContain(4);
    });

    it('should return all vertices for empty graph with vertices', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      const sinks = graph.getSinkVertices();
      expect(sinks).toHaveLength(3);
    });
  });

  describe('topologicalSort', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphTopoSort();
      const result = graph.topologicalSort();
      expect(result).toEqual([]);
    });

    it('should sort single vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      const result = graph.topologicalSort();
      expect(result).toEqual([1]);
    });

    it('should sort linear chain', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      const result = graph.topologicalSort();
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should sort diamond DAG', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      const result = graph.topologicalSort();
      expect(result).toHaveLength(4);
      expect(result.indexOf(1)).toBeLessThan(result.indexOf(2));
      expect(result.indexOf(1)).toBeLessThan(result.indexOf(3));
      expect(result.indexOf(2)).toBeLessThan(result.indexOf(4));
      expect(result.indexOf(3)).toBeLessThan(result.indexOf(4));
    });

    it('should sort disconnected DAG', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const result = graph.topologicalSort();
      expect(result).toHaveLength(4);
      expect(result.indexOf(1)).toBeLessThan(result.indexOf(2));
      expect(result.indexOf(3)).toBeLessThan(result.indexOf(4));
    });

    it('should return null for graph with cycle', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      const result = graph.topologicalSort();
      expect(result).toBeNull();
    });

    it('should return null for self-loop', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 1);
      const result = graph.topologicalSort();
      expect(result).toBeNull();
    });

    it('should return null for complex cycle', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      graph.addEdge(4, 2);
      const result = graph.topologicalSort();
      expect(result).toBeNull();
    });
  });

  describe('topologicalSortKahn', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphTopoSort();
      const result = graph.topologicalSortKahn();
      expect(result).toEqual([]);
    });

    it('should sort single vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      const result = graph.topologicalSortKahn();
      expect(result).toEqual([1]);
    });

    it('should sort linear chain', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      const result = graph.topologicalSortKahn();
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should sort diamond DAG', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      const result = graph.topologicalSortKahn();
      expect(result).toHaveLength(4);
      expect(result.indexOf(1)).toBeLessThan(result.indexOf(2));
      expect(result.indexOf(1)).toBeLessThan(result.indexOf(3));
      expect(result.indexOf(2)).toBeLessThan(result.indexOf(4));
      expect(result.indexOf(3)).toBeLessThan(result.indexOf(4));
    });

    it('should sort disconnected DAG', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const result = graph.topologicalSortKahn();
      expect(result).toHaveLength(4);
      expect(result.indexOf(1)).toBeLessThan(result.indexOf(2));
      expect(result.indexOf(3)).toBeLessThan(result.indexOf(4));
    });

    it('should return null for graph with cycle', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      const result = graph.topologicalSortKahn();
      expect(result).toBeNull();
    });

    it('should return null for self-loop', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 1);
      const result = graph.topologicalSortKahn();
      expect(result).toBeNull();
    });

    it('should return null for complex cycle', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      graph.addEdge(4, 2);
      const result = graph.topologicalSortKahn();
      expect(result).toBeNull();
    });

    it('should produce consistent ordering for same input', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 3);
      graph.addEdge(2, 3);
      const result1 = graph.topologicalSortKahn();
      const result2 = graph.topologicalSortKahn();
      expect(result1).toEqual(result2);
    });
  });

  describe('isDAG', () => {
    it('should return true for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.isDAG()).toBe(true);
    });

    it('should return true for single vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      expect(graph.isDAG()).toBe(true);
    });

    it('should return true for DAG', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      expect(graph.isDAG()).toBe(true);
    });

    it('should return true for diamond DAG', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      expect(graph.isDAG()).toBe(true);
    });

    it('should return false for graph with cycle', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.isDAG()).toBe(false);
    });

    it('should return false for self-loop', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 1);
      expect(graph.isDAG()).toBe(false);
    });
  });

  describe('hasCycle', () => {
    it('should return false for empty graph', () => {
      const graph = new GraphTopoSort();
      expect(graph.hasCycle()).toBe(false);
    });

    it('should return false for single vertex', () => {
      const graph = new GraphTopoSort();
      graph.addVertex(1);
      expect(graph.hasCycle()).toBe(false);
    });

    it('should return false for DAG', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      expect(graph.hasCycle()).toBe(false);
    });

    it('should return true for graph with cycle', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.hasCycle()).toBe(true);
    });

    it('should return true for self-loop', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 1);
      expect(graph.hasCycle()).toBe(true);
    });
  });

  describe('Combined operations', () => {
    it('should handle complex graph building', () => {
      const graph = new GraphTopoSort();
      for (let i = 0; i < 10; i++) {
        graph.addVertex(i);
      }
      for (let i = 0; i < 9; i++) {
        graph.addEdge(i, i + 1);
      }
      expect(graph.vertexCount).toBe(10);
      expect(graph.edgeCount).toBe(9);
      expect(graph.isDAG()).toBe(true);
    });

    it('should handle add-remove-add cycle', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.removeEdge(1, 2);
      graph.addEdge(1, 2);
      expect(graph.edgeCount).toBe(1);
      expect(graph.hasEdge(1, 2)).toBe(true);
    });

    it('should maintain consistency after multiple operations', () => {
      const graph = new GraphTopoSort();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      graph.removeVertex(2);
      graph.addEdge(1, 3);
      graph.addEdge(3, 4);
      expect(graph.edgeCount).toBe(2);
      expect(graph.vertexCount).toBe(3);
    });
  });
});
