import { describe, it, expect } from 'vitest';
import { GraphDijkstra } from './src/core/graph-dijkstra/index.js';

describe('GraphDijkstra', () => {
  describe('constructor', () => {
    it('should create empty graph', () => {
      const graph = new GraphDijkstra();
      expect(graph.vertexCount).toBe(0);
      expect(graph.edgeCount).toBe(0);
    });
  });

  describe('addVertex', () => {
    it('should add single vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.vertexCount).toBe(1);
    });

    it('should add multiple vertices', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.vertexCount).toBe(3);
      expect(graph.vertices()).toEqual([1, 2, 3]);
    });

    it('should not duplicate existing vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.addVertex(1);
      expect(graph.vertexCount).toBe(1);
    });

    it('should handle negative vertex IDs', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(-1);
      graph.addVertex(0);
      expect(graph.hasVertex(-1)).toBe(true);
      expect(graph.hasVertex(0)).toBe(true);
    });

    it('should handle large vertex IDs', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1000000);
      expect(graph.hasVertex(1000000)).toBe(true);
    });
  });

  describe('addEdge', () => {
    it('should add edge between vertices', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.edgeCount).toBe(1);
    });

    it('should add multiple edges', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 3, 3);
      graph.addEdge(3, 4, 7);
      expect(graph.edgeCount).toBe(3);
    });

    it('should handle zero weight', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 0);
      expect(graph.hasEdge(1, 2)).toBe(true);
      const result = graph.shortestPath(1, 2);
      expect(result).not.toBeNull();
      expect(result!.dist).toBe(0);
    });

    it('should throw on negative weight', () => {
      const graph = new GraphDijkstra();
      expect(() => graph.addEdge(1, 2, -1)).toThrow('Weight must be non-negative');
    });

    it('should update existing edge weight', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(1, 2, 10);
      expect(graph.shortestDistance(1, 2)).toBe(10);
    });

    it('should handle self-loops', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 1, 5);
      expect(graph.hasEdge(1, 1)).toBe(true);
      expect(graph.shortestDistance(1, 1)).toBe(0);
    });

    it('should handle bidirectional edges', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 1, 3);
      expect(graph.shortestDistance(1, 2)).toBe(5);
      expect(graph.shortestDistance(2, 1)).toBe(3);
    });
  });

  describe('removeVertex', () => {
    it('should remove existing vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.removeVertex(1);
      expect(graph.hasVertex(1)).toBe(false);
      expect(graph.vertexCount).toBe(1);
    });

    it('should remove all edges to/from vertex', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 3, 3);
      graph.addEdge(3, 1, 7);
      graph.removeVertex(2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.hasEdge(2, 3)).toBe(false);
      expect(graph.edgeCount).toBe(1);
    });

    it('should handle removing non-existent vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.removeVertex(2);
      expect(graph.vertexCount).toBe(1);
    });

    it('should remove from empty graph', () => {
      const graph = new GraphDijkstra();
      graph.removeVertex(1);
      expect(graph.vertexCount).toBe(0);
    });

    it('should remove vertex with only incoming edges', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(3, 2, 7);
      graph.removeVertex(2);
      expect(graph.hasVertex(2)).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });
  });

  describe('removeEdge', () => {
    it('should remove existing edge', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.edgeCount).toBe(0);
    });

    it('should not remove vertices', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.removeEdge(1, 2);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
    });

    it('should handle non-existent edge', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.removeEdge(1, 3);
      expect(graph.edgeCount).toBe(1);
    });

    it('should handle removing from non-existent vertex', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.removeEdge(3, 4);
      expect(graph.edgeCount).toBe(1);
    });

    it('should remove one edge from vertex with multiple edges', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(1, 3, 7);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.hasEdge(1, 3)).toBe(true);
      expect(graph.edgeCount).toBe(1);
    });
  });

  describe('hasVertex', () => {
    it('should return true for existing vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
    });

    it('should return false for non-existent vertex', () => {
      const graph = new GraphDijkstra();
      expect(graph.hasVertex(1)).toBe(false);
    });

    it('should return false after removal', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.removeVertex(1);
      expect(graph.hasVertex(1)).toBe(false);
    });
  });

  describe('hasEdge', () => {
    it('should return true for existing edge', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.hasEdge(1, 2)).toBe(true);
    });

    it('should return false for non-existent edge', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.hasEdge(1, 3)).toBe(false);
    });

    it('should return false for reverse direction', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });

    it('should return false after removal', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
    });
  });

  describe('vertices', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphDijkstra();
      expect(graph.vertices()).toEqual([]);
    });

    it('should return all vertices', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.vertices()).toEqual([1, 2, 3]);
    });

    it('should update after vertex removal', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.removeVertex(1);
      expect(graph.vertices()).toEqual([2]);
    });
  });

  describe('edges', () => {
    it('should return empty array for empty graph', () => {
      const graph = new GraphDijkstra();
      expect(graph.edges()).toEqual([]);
    });

    it('should return all edges', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 3, 3);
      expect(graph.edges()).toEqual([[1, 2, 5], [2, 3, 3]]);
    });

    it('should update after edge removal', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 3, 3);
      graph.removeEdge(1, 2);
      expect(graph.edges()).toEqual([[2, 3, 3]]);
    });

    it('should include self-loops', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 1, 5);
      expect(graph.edges()).toEqual([[1, 1, 5]]);
    });
  });

  describe('dijkstra', () => {
    it('should return empty map for non-existent start', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      const result = graph.dijkstra(2);
      expect(result.size).toBe(0);
    });

    it('should handle single vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      const result = graph.dijkstra(1);
      expect(result.size).toBe(1);
      expect(result.get(1)).toEqual({ dist: 0, path: [1] });
    });

    it('should compute shortest paths from linear chain', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 3);
      graph.addEdge(2, 3, 4);
      graph.addEdge(3, 4, 5);
      const result = graph.dijkstra(1);
      expect(result.get(1)).toEqual({ dist: 0, path: [1] });
      expect(result.get(2)).toEqual({ dist: 3, path: [1, 2] });
      expect(result.get(3)).toEqual({ dist: 7, path: [1, 2, 3] });
      expect(result.get(4)).toEqual({ dist: 12, path: [1, 2, 3, 4] });
    });

    it('should compute shortest paths from triangle', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(1, 3, 10);
      graph.addEdge(2, 3, 3);
      const result = graph.dijkstra(1);
      expect(result.get(1)).toEqual({ dist: 0, path: [1] });
      expect(result.get(2)).toEqual({ dist: 5, path: [1, 2] });
      expect(result.get(3)).toEqual({ dist: 8, path: [1, 2, 3] });
    });

    it('should handle disconnected graph', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(3, 4, 7);
      const result = graph.dijkstra(1);
      expect(result.size).toBe(2);
      expect(result.has(3)).toBe(false);
      expect(result.has(4)).toBe(false);
    });

    it('should handle unreachable vertices', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addVertex(3);
      const result = graph.dijkstra(1);
      expect(result.has(3)).toBe(false);
    });
  });

  describe('shortestPath', () => {
    it('should return null for non-existent vertices', () => {
      const graph = new GraphDijkstra();
      expect(graph.shortestPath(1, 2)).toBeNull();
    });

    it('should return null for unreachable vertex', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addVertex(3);
      expect(graph.shortestPath(1, 3)).toBeNull();
    });

    it('should return path with distance zero for same vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      const result = graph.shortestPath(1, 1);
      expect(result).not.toBeNull();
      expect(result!.dist).toBe(0);
      expect(result!.path).toEqual([1]);
    });

    it('should return direct edge path', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      const result = graph.shortestPath(1, 2);
      expect(result).not.toBeNull();
      expect(result!.dist).toBe(5);
      expect(result!.path).toEqual([1, 2]);
    });

    it('should return multi-hop path', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 3);
      graph.addEdge(2, 3, 4);
      graph.addEdge(3, 4, 5);
      const result = graph.shortestPath(1, 4);
      expect(result).not.toBeNull();
      expect(result!.dist).toBe(12);
      expect(result!.path).toEqual([1, 2, 3, 4]);
    });

    it('should choose shorter path', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 10);
      graph.addEdge(1, 3, 3);
      graph.addEdge(3, 2, 4);
      const result = graph.shortestPath(1, 2);
      expect(result).not.toBeNull();
      expect(result!.dist).toBe(7);
      expect(result!.path).toEqual([1, 3, 2]);
    });
  });

  describe('shortestDistance', () => {
    it('should return Infinity for non-existent vertices', () => {
      const graph = new GraphDijkstra();
      expect(graph.shortestDistance(1, 2)).toBe(Infinity);
    });

    it('should return Infinity for unreachable vertex', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addVertex(3);
      expect(graph.shortestDistance(1, 3)).toBe(Infinity);
    });

    it('should return zero for same vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      expect(graph.shortestDistance(1, 1)).toBe(0);
    });

    it('should return direct edge distance', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.shortestDistance(1, 2)).toBe(5);
    });

    it('should return multi-hop distance', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 3);
      graph.addEdge(2, 3, 4);
      graph.addEdge(3, 4, 5);
      expect(graph.shortestDistance(1, 4)).toBe(12);
    });

    it('should return shorter distance', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 10);
      graph.addEdge(1, 3, 3);
      graph.addEdge(3, 2, 4);
      expect(graph.shortestDistance(1, 2)).toBe(7);
    });
  });

  describe('isConnected', () => {
    it('should return false for non-existent vertices', () => {
      const graph = new GraphDijkstra();
      expect(graph.isConnected(1, 2)).toBe(false);
    });

    it('should return false for unreachable vertex', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addVertex(3);
      expect(graph.isConnected(1, 3)).toBe(false);
    });

    it('should return true for same vertex', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      expect(graph.isConnected(1, 1)).toBe(true);
    });

    it('should return true for direct edge', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.isConnected(1, 2)).toBe(true);
    });

    it('should return true for multi-hop path', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 3);
      graph.addEdge(2, 3, 4);
      expect(graph.isConnected(1, 3)).toBe(true);
    });

    it('should return false for reverse direction of directed edge', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.isConnected(2, 1)).toBe(false);
    });
  });

  describe('vertexCount', () => {
    it('should return 0 for empty graph', () => {
      const graph = new GraphDijkstra();
      expect(graph.vertexCount).toBe(0);
    });

    it('should return correct count after additions', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.vertexCount).toBe(3);
    });

    it('should update after removal', () => {
      const graph = new GraphDijkstra();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.removeVertex(1);
      expect(graph.vertexCount).toBe(1);
    });

    it('should include vertices created by edges', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      expect(graph.vertexCount).toBe(2);
    });
  });

  describe('edgeCount', () => {
    it('should return 0 for empty graph', () => {
      const graph = new GraphDijkstra();
      expect(graph.edgeCount).toBe(0);
    });

    it('should return correct count after additions', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 3, 3);
      expect(graph.edgeCount).toBe(2);
    });

    it('should update after removal', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 3, 3);
      graph.removeEdge(1, 2);
      expect(graph.edgeCount).toBe(1);
    });

    it('should count self-loops', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 1, 5);
      expect(graph.edgeCount).toBe(1);
    });

    it('should count bidirectional edges separately', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 5);
      graph.addEdge(2, 1, 3);
      expect(graph.edgeCount).toBe(2);
    });
  });

  describe('complex scenarios', () => {
    it('should handle complex graph with multiple paths', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 4);
      graph.addEdge(1, 3, 2);
      graph.addEdge(2, 3, 1);
      graph.addEdge(2, 4, 5);
      graph.addEdge(3, 4, 8);
      graph.addEdge(3, 5, 10);
      graph.addEdge(4, 5, 2);
      graph.addEdge(5, 1, 7);

      expect(graph.shortestDistance(1, 5)).toBe(11);
      expect(graph.shortestPath(1, 5)).toEqual({ dist: 11, path: [1, 2, 4, 5] });
      expect(graph.shortestDistance(3, 1)).toBe(17);
    });

    it('should handle star topology', () => {
      const graph = new GraphDijkstra();
      graph.addEdge(1, 2, 1);
      graph.addEdge(1, 3, 2);
      graph.addEdge(1, 4, 3);
      graph.addEdge(1, 5, 4);

      expect(graph.shortestDistance(1, 3)).toBe(2);
      expect(graph.shortestDistance(2, 3)).toBe(Infinity);
      expect(graph.isConnected(2, 4)).toBe(false);
    });

    it('should handle dense graph', () => {
      const graph = new GraphDijkstra();
      for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 5; j++) {
          if (i !== j) {
            graph.addEdge(i, j, Math.abs(i - j));
          }
        }
      }

      expect(graph.edgeCount).toBe(20);
      expect(graph.shortestDistance(1, 5)).toBe(4);
      expect(graph.shortestDistance(5, 1)).toBe(4);
      expect(graph.shortestDistance(3, 4)).toBe(1);
    });
  });
});
