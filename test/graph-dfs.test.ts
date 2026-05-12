import { describe, it, expect } from 'vitest';
import { GraphDFS } from './src/core/graph-dfs/index.js';

describe('GraphDFS', () => {
  describe('constructor', () => {
    it('creates undirected graph by default', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(2, 1)).toBe(true);
    });

    it('creates directed graph when specified', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });
  });

  describe('addVertex', () => {
    it('adds a single vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
    });

    it('adds multiple vertices', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
      expect(graph.hasVertex(3)).toBe(true);
    });

    it('does not duplicate existing vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      graph.addVertex(1);
      expect(graph.vertexCount).toBe(1);
    });

    it('adds vertex with negative id', () => {
      const graph = new GraphDFS();
      graph.addVertex(-1);
      expect(graph.hasVertex(-1)).toBe(true);
    });
  });

  describe('addEdge', () => {
    it('adds edge between two vertices', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
    });

    it('adds edge with default weight', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      const edges = graph.edges();
      expect(edges[0][2]).toBe(1);
    });

    it('adds edge with custom weight', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2, 5);
      const edges = graph.edges();
      expect(edges[0][2]).toBe(5);
    });

    it('creates vertices if they do not exist', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.hasVertex(1)).toBe(true);
      expect(graph.hasVertex(2)).toBe(true);
    });

    it('adds bidirectional edge in undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(true);
    });

    it('adds unidirectional edge in directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });

    it('adds self-loop', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 1);
      expect(graph.hasEdge(1, 1)).toBe(true);
    });

    it('updates weight if edge already exists', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2, 3);
      graph.addEdge(1, 2, 7);
      const edges = graph.edges();
      expect(edges[0][2]).toBe(7);
    });
  });

  describe('removeVertex', () => {
    it('removes existing vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      expect(graph.removeVertex(1)).toBe(true);
      expect(graph.hasVertex(1)).toBe(false);
    });

    it('removes all edges connected to vertex', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.removeVertex(1);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.hasEdge(1, 3)).toBe(false);
    });

    it('returns false for non-existent vertex', () => {
      const graph = new GraphDFS();
      expect(graph.removeVertex(1)).toBe(false);
    });

    it('removes vertex with edges in undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.removeVertex(1);
      expect(graph.hasVertex(2)).toBe(true);
      expect(graph.edgeCount).toBe(0);
    });
  });

  describe('removeEdge', () => {
    it('removes existing edge', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.removeEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(1, 2)).toBe(false);
    });

    it('removes bidirectional edge in undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });

    it('removes unidirectional edge in directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });

    it('returns false for non-existent edge', () => {
      const graph = new GraphDFS();
      expect(graph.removeEdge(1, 2)).toBe(false);
    });
  });

  describe('hasVertex', () => {
    it('returns true for existing vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      expect(graph.hasVertex(1)).toBe(true);
    });

    it('returns false for non-existent vertex', () => {
      const graph = new GraphDFS();
      expect(graph.hasVertex(1)).toBe(false);
    });
  });

  describe('hasEdge', () => {
    it('returns true for existing edge', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
    });

    it('returns false for non-existent edge', () => {
      const graph = new GraphDFS();
      expect(graph.hasEdge(1, 2)).toBe(false);
    });

    it('returns false if source vertex does not exist', () => {
      const graph = new GraphDFS();
      expect(graph.hasEdge(1, 2)).toBe(false);
    });
  });

  describe('vertices', () => {
    it('returns empty array for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.vertices()).toEqual([]);
    });

    it('returns all vertices', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      const verts = graph.vertices();
      expect(verts).toContain(1);
      expect(verts).toContain(2);
      expect(verts).toContain(3);
      expect(verts.length).toBe(3);
    });
  });

  describe('edges', () => {
    it('returns empty array for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.edges()).toEqual([]);
    });

    it('returns all edges', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2, 3);
      const edges = graph.edges();
      expect(edges.length).toBe(1);
      expect(edges[0]).toEqual([1, 2, 3]);
    });

    it('returns undirected edge only once', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      const edges = graph.edges();
      expect(edges.length).toBe(1);
    });

    it('returns both directed edges', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 1);
      const edges = graph.edges();
      expect(edges.length).toBe(2);
    });

    it('includes self-loop', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 1);
      const edges = graph.edges();
      expect(edges.length).toBe(1);
    });
  });

  describe('vertexCount', () => {
    it('returns 0 for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.vertexCount).toBe(0);
    });

    it('returns correct count for multiple vertices', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      graph.addVertex(2);
      graph.addVertex(3);
      expect(graph.vertexCount).toBe(3);
    });
  });

  describe('edgeCount', () => {
    it('returns 0 for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.edgeCount).toBe(0);
    });

    it('returns correct count for undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.edgeCount).toBe(1);
    });

    it('returns correct count for directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 1);
      expect(graph.edgeCount).toBe(2);
    });
  });

  describe('dfs', () => {
    it('handles empty graph', () => {
      const graph = new GraphDFS();
      const visited: number[] = [];
      graph.dfs(1, (node) => visited.push(node));
      expect(visited).toEqual([]);
    });

    it('traverses single vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      const visited: number[] = [];
      graph.dfs(1, (node) => visited.push(node));
      expect(visited).toEqual([1]);
    });

    it('traverses simple path', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      const visited: number[] = [];
      graph.dfs(1, (node) => visited.push(node));
      expect(visited).toContain(1);
      expect(visited).toContain(2);
      expect(visited).toContain(3);
    });

    it('visits each node once', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      const visited: number[] = [];
      graph.dfs(1, (node) => visited.push(node));
      const unique = new Set(visited);
      expect(unique.size).toBe(visited.length);
    });

    it('handles disconnected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const visited: number[] = [];
      graph.dfs(1, (node) => visited.push(node));
      expect(visited).toContain(1);
      expect(visited).toContain(2);
      expect(visited).not.toContain(3);
      expect(visited).not.toContain(4);
    });

    it('handles self-loop', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 1);
      const visited: number[] = [];
      graph.dfs(1, (node) => visited.push(node));
      expect(visited).toEqual([1]);
    });
  });

  describe('dfsIterative', () => {
    it('handles empty graph', () => {
      const graph = new GraphDFS();
      const visited: number[] = [];
      graph.dfsIterative(1, (node) => visited.push(node));
      expect(visited).toEqual([]);
    });

    it('traverses single vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      const visited: number[] = [];
      graph.dfsIterative(1, (node) => visited.push(node));
      expect(visited).toEqual([1]);
    });

    it('traverses simple path', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      const visited: number[] = [];
      graph.dfsIterative(1, (node) => visited.push(node));
      expect(visited).toContain(1);
      expect(visited).toContain(2);
      expect(visited).toContain(3);
    });

    it('visits each node once', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      const visited: number[] = [];
      graph.dfsIterative(1, (node) => visited.push(node));
      const unique = new Set(visited);
      expect(unique.size).toBe(visited.length);
    });

    it('handles disconnected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const visited: number[] = [];
      graph.dfsIterative(1, (node) => visited.push(node));
      expect(visited).toContain(1);
      expect(visited).toContain(2);
      expect(visited).not.toContain(3);
      expect(visited).not.toContain(4);
    });
  });

  describe('hasPath', () => {
    it('returns false for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.hasPath(1, 2)).toBe(false);
    });

    it('returns true for same vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      expect(graph.hasPath(1, 1)).toBe(true);
    });

    it('returns true for direct edge', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.hasPath(1, 2)).toBe(true);
    });

    it('returns true for indirect path', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      expect(graph.hasPath(1, 3)).toBe(true);
    });

    it('returns false for disconnected vertices', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      expect(graph.hasPath(1, 3)).toBe(false);
    });

    it('works in directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      expect(graph.hasPath(1, 3)).toBe(true);
      expect(graph.hasPath(3, 1)).toBe(false);
    });
  });

  describe('getPaths', () => {
    it('returns empty array for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.getPaths(1, 2)).toEqual([]);
    });

    it('returns single path for direct edge', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      const paths = graph.getPaths(1, 2);
      expect(paths.length).toBe(1);
      expect(paths[0]).toEqual([1, 2]);
    });

    it('returns all paths in graph with cycles', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.addEdge(1, 3);
      graph.addEdge(2, 4);
      graph.addEdge(3, 4);
      const paths = graph.getPaths(1, 4);
      expect(paths.length).toBe(2);
    });

    it('returns empty for disconnected vertices', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      expect(graph.getPaths(1, 3)).toEqual([]);
    });

    it('handles path to same vertex', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      const paths = graph.getPaths(1, 1);
      expect(paths.length).toBe(1);
      expect(paths[0]).toEqual([1]);
    });
  });

  describe('getConnectedComponents', () => {
    it('returns empty array for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.getConnectedComponents()).toEqual([]);
    });

    it('returns single component for connected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      const components = graph.getConnectedComponents();
      expect(components.length).toBe(1);
      expect(components[0].length).toBe(3);
    });

    it('returns multiple components for disconnected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(3, 4);
      const components = graph.getConnectedComponents();
      expect(components.length).toBe(2);
    });

    it('handles isolated vertices', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      graph.addVertex(2);
      const components = graph.getConnectedComponents();
      expect(components.length).toBe(2);
    });
  });

  describe('isCyclic', () => {
    it('returns false for empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.isCyclic()).toBe(false);
    });

    it.skip('returns false for acyclic undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      expect(graph.isCyclic()).toBe(false);
    });

    it('returns false for acyclic directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      expect(graph.isCyclic()).toBe(false);
    });

    it('returns true for cycle in undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.isCyclic()).toBe(true);
    });

    it('returns true for cycle in directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.isCyclic()).toBe(true);
    });

    it('returns true for self-loop', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 1);
      expect(graph.isCyclic()).toBe(true);
    });
  });

  describe('topologicalSort', () => {
    it('returns null for undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.topologicalSort()).toBe(null);
    });

    it('returns null for cyclic directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);
      graph.addEdge(3, 1);
      expect(graph.topologicalSort()).toBe(null);
    });

    it('returns valid topological order', () => {
      const graph = new GraphDFS(true);
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
      const graph = new GraphDFS(true);
      graph.addVertex(1);
      const sorted = graph.topologicalSort();
      expect(sorted).toEqual([1]);
    });

    it('returns empty array for empty graph', () => {
      const graph = new GraphDFS(true);
      const sorted = graph.topologicalSort();
      expect(sorted).toEqual([]);
    });
  });

  describe('empty graph', () => {
    it('handles all operations on empty graph', () => {
      const graph = new GraphDFS();
      expect(graph.vertexCount).toBe(0);
      expect(graph.edgeCount).toBe(0);
      expect(graph.vertices()).toEqual([]);
      expect(graph.edges()).toEqual([]);
      expect(graph.getConnectedComponents()).toEqual([]);
      expect(graph.isCyclic()).toBe(false);
    });
  });

  describe('single vertex', () => {
    it('handles single vertex with no edges', () => {
      const graph = new GraphDFS();
      graph.addVertex(1);
      expect(graph.vertexCount).toBe(1);
      expect(graph.edgeCount).toBe(0);
      expect(graph.hasVertex(1)).toBe(true);
    });

    it.skip('handles single vertex with self-loop', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 1);
      expect(graph.vertexCount).toBe(1);
      expect(graph.edgeCount).toBe(1);
      expect(graph.isCyclic()).toBe(true);
    });
  });

  describe('directed vs undirected', () => {
    it('handles undirected graph correctly', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(true);
    });

    it('handles directed graph correctly', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });

    it('removes edge correctly in undirected graph', () => {
      const graph = new GraphDFS();
      graph.addEdge(1, 2);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });

    it('removes edge correctly in directed graph', () => {
      const graph = new GraphDFS(true);
      graph.addEdge(1, 2);
      graph.removeEdge(1, 2);
      expect(graph.hasEdge(1, 2)).toBe(false);
      expect(graph.hasEdge(2, 1)).toBe(false);
    });
  });
});
