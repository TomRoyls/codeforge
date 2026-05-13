import { describe, it, expect } from 'vitest';
import { GraphDFS2 } from '../src/core/graph-dfs-2/index.js';

describe('GraphDFS2', () => {
  describe('constructor', () => {
    it('creates undirected graph by default', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(2, 1)).toBe(true);
    });

    it('creates directed graph when specified', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });
  });

  describe('addVertex', () => {
    it('adds a single vertex', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
    });

    it('adds multiple vertices', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
      expect(graph.hasVertex(3)).toBe(true);
    });

    it('does not duplicate existing vertex', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      graph.addVertex(1);
      expect(graph.vertexCount).toBe(1);
    });

    it('adds vertex with negative id', () => {
      const graph = new GraphDFS2();
      graph.addVertex(-1);
      expect(graph.hasVertex(-1)).toBe(true);
    });
  });

  describe('addEdge', () => {
    it('adds edge between two vertices', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
    });

    it('creates vertices if they do not exist', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
    });

    it('adds bidirectional edge in undirected graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(true);
    });

    it('adds unidirectional edge in directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });

    it('adds self-loop', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 1);
      expect(graph.hasEdge(1, 1)).toBe(true);
    });

    it('updates weight if edge already exists', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2, 3);
      graph.addEdge(1, 2, 7);
      expect(graph.edgeCount).toBe(1);
    });
  });

  describe('hasVertex', () => {
    it('returns true for existing vertex', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
    });

    it('returns false for non-existent vertex', () => {
      const graph = new GraphDFS2();
      expect(graph.hasVertex(1)).toBe(false);
    });
  });

  describe('hasEdge', () => {
    it('returns true for existing edge', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
    });

    it('returns false for non-existent edge', () => {
      const graph = new GraphDFS2();
      expect(graph.hasEdge(1, 2)).toBe(false);
    });

    it('returns false if source vertex does not exist', () => {
      const graph = new GraphDFS2();
      expect(graph.hasEdge(1, 2)).toBe(false);
    });
  });

  describe('vertexCount', () => {
    it('returns 0 for empty graph', () => {
      const graph = new GraphDFS2();
      expect(graph.vertexCount).toBe(0);
    });

    it('returns correct count for multiple vertices', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.vertexCount).toBe(3);
    });
  });

  describe('edgeCount', () => {
    it('returns 0 for empty graph', () => {
      const graph = new GraphDFS2();
      expect(graph.edgeCount).toBe(0);
    });

    it('returns correct count for undirected graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.edgeCount).toBe(1);
    });

    it('returns correct count for directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 1);
      expect(graph.edgeCount).toBe(2);
    });
  });

  describe('dfs', () => {
    it('returns empty array for non-existent start vertex', () => {
      const graph = new GraphDFS2();
      const result = graph.dfs(1);
      expect(result).toEqual([]);
    });

    it('traverses single vertex', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      const result = graph.dfs(1);
      expect(result).toEqual([1]);
    });

    it('traverses simple path', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      const result = graph.dfs(1);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('visits each node once', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      const result = graph.dfs(1);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('handles disconnected graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const result = graph.dfs(1);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).not.toContain(3);
      expect(result).not.toContain(4);
    });

    it('handles self-loop', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 1);
      const result = graph.dfs(1);
      expect(result).toEqual([1]);
    });
  });

  describe('topologicalSort', () => {
    it('returns null for undirected graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.topologicalSort()).toBe(null);
    });

    it('returns null for cyclic directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.topologicalSort()).toBe(null);
    });

    it('returns valid topological order', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      const sorted = graph.topologicalSort();
      expect(sorted).not.toBe(null);
      const index1 = sorted!.indexOf(1);
      const index2 = sorted!.indexOf(2);
      const index3 = sorted!.indexOf(3);
      const index4 = sorted!.indexOf(4);
      expect(index1).toBeLessThan(index2);
      expect(index1).toBeLessThan(index3);
      expect(index2).toBeLessThan(index4);
      expect(index3).toBeLessThan(index4);
    });

    it('returns single vertex for single node graph', () => {
      const graph = new GraphDFS2(true);
      graph.addVertex(1);
      const sorted = graph.topologicalSort();
      expect(sorted).toEqual([1]);
    });

    it('returns empty array for empty graph', () => {
      const graph = new GraphDFS2(true);
      const sorted = graph.topologicalSort();
      expect(sorted).toEqual([]);
    });
  });

  describe('detectCycle', () => {
    it('returns false for empty graph', () => {
      const graph = new GraphDFS2();
      expect(graph.detectCycle()).toBe(false);
    });

    it('returns false for acyclic directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      expect(graph.detectCycle()).toBe(false);
    });

    it('returns true for cycle in directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.detectCycle()).toBe(true);
    });

    it('returns true for self-loop', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 1);
      expect(graph.detectCycle()).toBe(true);
    });

    it('detects cycle in complex directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      graph.addEdge(4, 2);
      expect(graph.detectCycle()).toBe(true);
    });

    it('returns false for directed acyclic graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      expect(graph.detectCycle()).toBe(false);
    });
  });

  describe('findPath', () => {
    it('returns null for non-existent vertices', () => {
      const graph = new GraphDFS2();
      expect(graph.findPath(1, 2)).toBe(null);
    });

    it('returns single vertex path when start equals end', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      const path = graph.findPath(1, 1);
      expect(path).toEqual([1]);
    });

    it('finds direct path', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      const path = graph.findPath(1, 2);
      expect(path).toEqual([1, 2]);
    });

    it('finds indirect path', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      const path = graph.findPath(1, 3);
      expect(path).toEqual([1, 2, 3]);
    });

    it('returns null for disconnected vertices', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const path = graph.findPath(1, 3);
      expect(path).toBe(null);
    });

    it('works in directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      const path = graph.findPath(1, 3);
      expect(path).toEqual([1, 2, 3]);
    });

    it('returns null when no path exists in directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(3, 2);
      const path = graph.findPath(1, 3);
      expect(path).toBe(null);
    });

    it('finds path in complex graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(1, 4);
      graph.addEdge(4, 3);
      const path = graph.findPath(1, 3);
      expect(path).not.toBe(null);
      expect(path![0]).toBe(1);
      expect(path![path!.length - 1]).toBe(3);
    });
  });

  describe('findConnectedComponents', () => {
    it('returns empty array for empty graph', () => {
      const graph = new GraphDFS2();
      expect(graph.findConnectedComponents()).toEqual([]);
    });

    it('returns single component for connected graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      const components = graph.findConnectedComponents();
      expect(components.length).toBe(1);
      expect(components[0].length).toBe(3);
    });

    it('returns multiple components for disconnected graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const components = graph.findConnectedComponents();
      expect(components.length).toBe(2);
    });

    it('handles isolated vertices', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      graph.addVertex(2);
      const components = graph.findConnectedComponents();
      expect(components.length).toBe(2);
    });

    it('handles mixed components', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addVertex(4);
      graph.addEdge(5, 6);
      const components = graph.findConnectedComponents();
      expect(components.length).toBe(3);
      const sizes = components.map(c => c.length).sort((a, b) => a - b);
      expect(sizes).toEqual([1, 2, 3]);
    });
  });

  describe('isBipartite', () => {
    it('returns true for empty graph', () => {
      const graph = new GraphDFS2();
      expect(graph.isBipartite()).toBe(true);
    });

    it('returns true for single vertex', () => {
      const graph = new GraphDFS2();
      graph.addVertex(1);
      expect(graph.isBipartite()).toBe(true);
    });

    it('returns true for bipartite graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      expect(graph.isBipartite()).toBe(true);
    });

    it('returns false for odd cycle', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.isBipartite()).toBe(false);
    });

    it('returns true for even cycle', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 4);
      graph.addEdge(4, 1);
      expect(graph.isBipartite()).toBe(true);
    });

    it('returns true for complete bipartite graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 3);
      graph.addEdge(1, 4);
      graph.addEdge(2, 3);
      graph.addEdge(2, 4);
      expect(graph.isBipartite()).toBe(true);
    });

    it('returns false for non-bipartite directed graph', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.isBipartite()).toBe(false);
    });

    it('handles disconnected bipartite components', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      expect(graph.isBipartite()).toBe(true);
    });
  });

  describe('getTimeComplexity', () => {
    it('returns array of complexity information', () => {
      const graph = new GraphDFS2();
      const complexity = graph.getTimeComplexity();
      expect(Array.isArray(complexity)).toBe(true);
      expect(complexity.length).toBeGreaterThan(0);
    });

    it('includes addVertex complexity', () => {
      const graph = new GraphDFS2();
      const complexity = graph.getTimeComplexity();
      const addVertexInfo = complexity.find(info => info.operation === 'addVertex');
      expect(addVertexInfo).toBeDefined();
      expect(addVertexInfo!.time).toBe('O(1)');
      expect(addVertexInfo!.space).toBe('O(1)');
    });

    it('includes dfs complexity', () => {
      const graph = new GraphDFS2();
      const complexity = graph.getTimeComplexity();
      const dfsInfo = complexity.find(info => info.operation === 'dfs');
      expect(dfsInfo).toBeDefined();
      expect(dfsInfo!.time).toBe('O(V + E)');
      expect(dfsInfo!.space).toBe('O(V)');
    });

    it('includes all required operations', () => {
      const graph = new GraphDFS2();
      const complexity = graph.getTimeComplexity();
      const operations = complexity.map(info => info.operation);
      expect(operations).toContain('addVertex');
      expect(operations).toContain('addEdge');
      expect(operations).toContain('hasVertex');
      expect(operations).toContain('hasEdge');
      expect(operations).toContain('dfs');
      expect(operations).toContain('topologicalSort');
      expect(operations).toContain('detectCycle');
      expect(operations).toContain('findPath');
      expect(operations).toContain('findConnectedComponents');
      expect(operations).toContain('isBipartite');
    });
  });

  describe('empty graph', () => {
    it('handles all operations on empty graph', () => {
      const graph = new GraphDFS2();
      expect(graph.vertexCount).toBe(0);
      expect(graph.edgeCount).toBe(0);
      expect(graph.dfs(1)).toEqual([]);
      expect(graph.findConnectedComponents()).toEqual([]);
      expect(graph.detectCycle()).toBe(false);
      expect(graph.isBipartite()).toBe(true);
    });
  });

  describe('directed vs undirected', () => {
    it('handles undirected graph correctly', () => {
      const graph = new GraphDFS2();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(true);
    });

    it('handles directed graph correctly', () => {
      const graph = new GraphDFS2(true);
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('handles large path', () => {
      const graph = new GraphDFS2();
      for (let i = 1; i < 10; i++) {
        graph.addEdge(i, i + 1);
      }
      const path = graph.findPath(1, 10);
      expect(path).not.toBe(null);
      expect(path!.length).toBe(10);
    });

    it('handles star graph', () => {
      const graph = new GraphDFS2();
      graph.addEdge(0, 1);
      graph.addEdge(0, 2);
      graph.addEdge(0, 3);
      graph.addEdge(0, 4);
      expect(graph.vertexCount).toBe(5);
      expect(graph.edgeCount).toBe(4);
    });
  });
});
