import { describe, it, expect } from 'vitest';
import { GraphBFS2 } from '../src/core/graph-bfs-2/index.js';

describe('GraphBFS2 - Constructor', () => {
  it('should create an undirected graph by default', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    expect(graph.hasEdge(2, 1)).toBe(true);
  });

  it('should create a directed graph when specified', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    expect(graph.hasEdge(2, 1)).toBe(false);
  });

  it('should create an empty graph', () => {
    const graph = new GraphBFS2();
    expect(graph.getVertexCount()).toBe(0);
    expect(graph.getEdgeCount()).toBe(0);
  });
});

describe('GraphBFS2 - Vertex Operations', () => {
  it('should add a single vertex', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    expect(graph.hasVertex(1)).toBe(true);
    expect(graph.getVertexCount()).toBe(1);
  });

  it('should add multiple vertices', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addVertex(3);
    expect(graph.hasVertex(1)).toBe(true);
    expect(graph.hasVertex(2)).toBe(true);
    expect(graph.hasVertex(3)).toBe(true);
    expect(graph.getVertexCount()).toBe(3);
  });

  it('should not add duplicate vertices', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    graph.addVertex(1);
    expect(graph.getVertexCount()).toBe(1);
  });

  it('should check if vertex exists', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    expect(graph.hasVertex(1)).toBe(true);
    expect(graph.hasVertex(2)).toBe(false);
  });
});

describe('GraphBFS2 - Edge Operations', () => {
  it('should add an edge and create vertices automatically', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    expect(graph.hasVertex(1)).toBe(true);
    expect(graph.hasVertex(2)).toBe(true);
    expect(graph.hasEdge(1, 2)).toBe(true);
  });

  it('should add edge with default weight', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
  });

  it('should add edge with custom weight', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2, 5);
    expect(graph.hasEdge(1, 2)).toBe(true);
  });

  it('should add undirected edge in both directions', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(true);
  });

  it('should add directed edge only in one direction', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(false);
  });

  it('should check if edge exists', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(true);
    expect(graph.hasEdge(1, 3)).toBe(false);
  });

  it('should return correct edge count for undirected graph', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    expect(graph.getEdgeCount()).toBe(3);
  });

  it('should return correct edge count for directed graph', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    expect(graph.getEdgeCount()).toBe(3);
  });
});

describe('GraphBFS2 - BFS Traversal', () => {
  it('should traverse single vertex graph', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toEqual([1]);
  });

  it('should traverse linear graph in order', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toEqual([1, 2, 3, 4]);
  });

  it('should traverse graph with branches', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(1, 4);
    graph.addEdge(2, 5);
    graph.addEdge(3, 6);
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toContain(1);
    expect(visited).toContain(2);
    expect(visited).toContain(3);
    expect(visited).toContain(4);
    expect(visited).toContain(5);
    expect(visited).toContain(6);
  });

  it('should not traverse disconnected vertices', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addEdge(1, 3);
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toEqual([1, 3]);
    expect(visited).not.toContain(2);
  });

  it('should handle BFS on non-existent start vertex', () => {
    const graph = new GraphBFS2();
    const visited: number[] = [];
    graph.bfs(99, (node) => visited.push(node));
    expect(visited).toEqual([]);
  });

  it('should traverse directed graph correctly', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toEqual([1, 2, 3]);
  });

  it('should not traverse reverse direction in directed graph', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    const visited: number[] = [];
    graph.bfs(2, (node) => visited.push(node));
    expect(visited).toEqual([2]);
    expect(visited).not.toContain(1);
  });
});

describe('GraphBFS2 - Shortest Path', () => {
  it('should find shortest path between adjacent vertices', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    const path = graph.shortestPath(1, 2);
    expect(path).toEqual([1, 2]);
  });

  it('should return single vertex for same start and end', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    const path = graph.shortestPath(1, 1);
    expect(path).toEqual([1]);
  });

  it('should find shortest path in linear graph', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    const path = graph.shortestPath(1, 4);
    expect(path).toEqual([1, 2, 3, 4]);
  });

  it('should find shortest path in graph with multiple routes', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(3, 4);
    const path = graph.shortestPath(1, 4);
    expect(path.length).toBeLessThanOrEqual(3);
    expect(path[0]).toBe(1);
    expect(path[path.length - 1]).toBe(4);
  });

  it('should return null for disconnected vertices', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    graph.addVertex(2);
    const path = graph.shortestPath(1, 2);
    expect(path).toBeNull();
  });

  it('should return null for non-existent start vertex', () => {
    const graph = new GraphBFS2();
    graph.addVertex(2);
    const path = graph.shortestPath(99, 2);
    expect(path).toBeNull();
  });

  it('should return null for non-existent end vertex', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    const path = graph.shortestPath(1, 99);
    expect(path).toBeNull();
  });

  it('should find shortest path in directed graph', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(1, 3);
    const path = graph.shortestPath(1, 3);
    expect(path).toEqual([1, 3]);
  });

  it('should return null for unreachable vertex in directed graph', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(2, 3);
    const path = graph.shortestPath(1, 3);
    expect(path).toBeNull();
  });
});

describe('GraphBFS2 - BFS Levels', () => {
  it('should return single level for single vertex', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    const levels = graph.bfsLevels(1);
    expect(levels).toEqual([[1]]);
  });

  it('should return levels for linear graph', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    const levels = graph.bfsLevels(1);
    expect(levels.length).toBe(4);
    expect(levels[0]).toEqual([1]);
    expect(levels[1]).toEqual([2]);
    expect(levels[2]).toEqual([3]);
    expect(levels[3]).toEqual([4]);
  });

  it('should return levels for graph with branches', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(1, 4);
    graph.addEdge(2, 5);
    graph.addEdge(3, 6);
    const levels = graph.bfsLevels(1);
    expect(levels[0]).toEqual([1]);
    expect(levels[1]).toContain(2);
    expect(levels[1]).toContain(3);
    expect(levels[1]).toContain(4);
    expect(levels[2]).toContain(5);
    expect(levels[2]).toContain(6);
  });

  it('should return empty levels for non-existent vertex', () => {
    const graph = new GraphBFS2();
    const levels = graph.bfsLevels(99);
    expect(levels).toEqual([]);
  });

  it('should handle disconnected graph', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addEdge(1, 3);
    const levels = graph.bfsLevels(1);
    expect(levels[0]).toEqual([1]);
    expect(levels[1]).toEqual([3]);
    expect(levels.flat()).not.toContain(2);
  });

  it('should work with directed graph', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    const levels = graph.bfsLevels(1);
    expect(levels[0]).toEqual([1]);
    expect(levels[1]).toEqual([2]);
    expect(levels[2]).toEqual([3]);
  });
});

describe('GraphBFS2 - Connected Components', () => {
  it('should return one component for connected graph', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    const components = graph.findConnectedComponents();
    expect(components.length).toBe(1);
    expect(components[0].length).toBe(3);
  });

  it('should return multiple components for disconnected graph', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addVertex(3);
    graph.addVertex(4);
    const components = graph.findConnectedComponents();
    expect(components.length).toBe(3);
  });

  it('should return empty array for empty graph', () => {
    const graph = new GraphBFS2();
    const components = graph.findConnectedComponents();
    expect(components).toEqual([]);
  });

  it('should identify all vertices in connected component', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    graph.addVertex(4);
    const components = graph.findConnectedComponents();
    const triangleComponent = components.find(c => c.includes(1));
    const singleComponent = components.find(c => c.includes(4));
    expect(triangleComponent?.length).toBe(3);
    expect(singleComponent?.length).toBe(1);
  });

  it('should handle graph with multiple connected components', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    graph.addEdge(5, 6);
    const components = graph.findConnectedComponents();
    expect(components.length).toBe(3);
  });

  it('should work with directed graph', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    const components = graph.findConnectedComponents();
    expect(components.length).toBe(2);
  });
});

describe('GraphBFS2 - Bipartite Check', () => {
  it('should return true for empty graph', () => {
    const graph = new GraphBFS2();
    expect(graph.isBipartite()).toBe(true);
  });

  it('should return true for single vertex', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    expect(graph.isBipartite()).toBe(true);
  });

  it('should return true for tree (acyclic)', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(2, 5);
    expect(graph.isBipartite()).toBe(true);
  });

  it('should return true for even cycle', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    graph.addEdge(4, 1);
    expect(graph.isBipartite()).toBe(true);
  });

  it('should return false for odd cycle (triangle)', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    expect(graph.isBipartite()).toBe(false);
  });

  it('should return false for odd cycle (pentagon)', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    graph.addEdge(4, 5);
    graph.addEdge(5, 1);
    expect(graph.isBipartite()).toBe(false);
  });

  it('should return false for disconnected graph with odd cycle', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    graph.addVertex(4);
    expect(graph.isBipartite()).toBe(false);
  });

  it('should work with directed graphs', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    expect(graph.isBipartite()).toBe(false);
  });
});

describe('GraphBFS2 - Cycle Detection', () => {
  it('should return false for empty graph', () => {
    const graph = new GraphBFS2();
    expect(graph.hasCycle()).toBe(false);
  });

  it('should return false for single vertex', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    expect(graph.hasCycle()).toBe(false);
  });

  it('should return false for acyclic graph', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    expect(graph.hasCycle()).toBe(false);
  });

  it('should return true for triangle cycle', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    expect(graph.hasCycle()).toBe(true);
  });

  it('should return true for square cycle', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    graph.addEdge(4, 1);
    expect(graph.hasCycle()).toBe(true);
  });

  it('should return true for graph with cycle', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    graph.addEdge(4, 2);
    expect(graph.hasCycle()).toBe(true);
  });

  it('should return false for tree structure', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(2, 5);
    expect(graph.hasCycle()).toBe(false);
  });

  it('should return false for disconnected acyclic components', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    expect(graph.hasCycle()).toBe(false);
  });

  it('should return true for disconnected graph with cycle', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    graph.addVertex(4);
    expect(graph.hasCycle()).toBe(true);
  });

  it('should work with directed graphs', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    expect(graph.hasCycle()).toBe(true);
  });

  it('should return false for directed acyclic graph', () => {
    const graph = new GraphBFS2(true);
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    expect(graph.hasCycle()).toBe(false);
  });
});

describe('GraphBFS2 - Time Complexity', () => {
  it('should return O(1) for addVertex', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('addVertex')).toBe('O(1)');
  });

  it('should return O(1) for addEdge', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('addEdge')).toBe('O(1)');
  });

  it('should return O(1) for hasVertex', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('hasVertex')).toBe('O(1)');
  });

  it('should return O(1) for hasEdge', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('hasEdge')).toBe('O(1)');
  });

  it('should return O(1) for getVertexCount', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('getVertexCount')).toBe('O(1)');
  });

  it('should return O(V + E) for getEdgeCount', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('getEdgeCount')).toBe('O(V + E)');
  });

  it('should return O(V + E) for bfs', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('bfs')).toBe('O(V + E)');
  });

  it('should return O(V + E) for shortestPath', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('shortestPath')).toBe('O(V + E)');
  });

  it('should return O(V + E) for bfsLevels', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('bfsLevels')).toBe('O(V + E)');
  });

  it('should return O(V + E) for findConnectedComponents', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('findConnectedComponents')).toBe('O(V + E)');
  });

  it('should return O(V + E) for isBipartite', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('isBipartite')).toBe('O(V + E)');
  });

  it('should return O(V + E) for hasCycle', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('hasCycle')).toBe('O(V + E)');
  });

  it('should return Unknown for unknown operation', () => {
    const graph = new GraphBFS2();
    expect(graph.getTimeComplexity('unknown')).toBe('Unknown');
  });
});

describe('GraphBFS2 - Edge Cases', () => {
  it('should handle empty graph BFS', () => {
    const graph = new GraphBFS2();
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toEqual([]);
  });

  it('should handle BFS with no neighbors', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    graph.addVertex(2);
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toEqual([1]);
  });

  it('should handle self-loops', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 1);
    const visited: number[] = [];
    graph.bfs(1, (node) => visited.push(node));
    expect(visited).toEqual([1]);
  });

  it('should handle duplicate edges', () => {
    const graph = new GraphBFS2();
    graph.addEdge(1, 2);
    graph.addEdge(1, 2);
    expect(graph.getEdgeCount()).toBe(1);
  });

  it('should handle bfsLevels with no neighbors', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    const levels = graph.bfsLevels(1);
    expect(levels).toEqual([[1]]);
  });

  it('should handle shortestPath with no path', () => {
    const graph = new GraphBFS2();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addVertex(3);
    const path = graph.shortestPath(1, 3);
    expect(path).toBeNull();
  });
});
