import { describe, it, expect } from 'vitest';
import { GraphAdjList } from './src/core/graph-adjlist/index.js';

describe('GraphAdjList - Basic Operations', () => {
  it('should create an empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.isEmpty()).toBe(true);
    expect(graph.vertexCount).toBe(0);
    expect(graph.edgeCount).toBe(0);
  });

  it('should create a directed graph', () => {
    const graph = new GraphAdjList({ directed: true });
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(false);
  });

  it('should create an undirected graph by default', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(true);
  });

  it('should add a single vertex', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    expect(graph.hasVertex(1)).toBe(true);
    expect(graph.vertexCount).toBe(1);
  });

  it('should add multiple vertices', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addVertex(3);
    expect(graph.vertexCount).toBe(3);
    expect(graph.getVertices()).toEqual([1, 2, 3]);
  });

  it('should not duplicate vertices', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    graph.addVertex(1);
    expect(graph.vertexCount).toBe(1);
  });

  it('should remove a vertex', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    graph.addVertex(2);
    expect(graph.removeVertex(1)).toBe(true);
    expect(graph.hasVertex(1)).toBe(false);
    expect(graph.vertexCount).toBe(1);
  });

  it('should return false when removing non-existent vertex', () => {
    const graph = new GraphAdjList();
    expect(graph.removeVertex(1)).toBe(false);
  });

  it('should remove edges when removing vertex', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.removeVertex(1);
    expect(graph.hasEdge(1, 2)).toBe(false);
    expect(graph.hasEdge(1, 3)).toBe(false);
    expect(graph.hasEdge(2, 1)).toBe(false);
    expect(graph.hasEdge(3, 1)).toBe(false);
  });

  it('should add an unweighted edge', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.getEdgeWeight(1, 2)).toBe(1);
  });

  it('should add a weighted edge', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 5);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.getEdgeWeight(1, 2)).toBe(5);
  });

  it('should create vertices when adding edge', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    expect(graph.hasVertex(1)).toBe(true);
    expect(graph.hasVertex(2)).toBe(true);
  });

  it('should remove an edge', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    expect(graph.removeEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(1, 2)).toBe(false);
  });

  it('should remove both directions in undirected graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.removeEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(false);
    expect(graph.hasEdge(2, 1)).toBe(false);
  });

  it('should return false when removing non-existent edge', () => {
    const graph = new GraphAdjList();
    expect(graph.removeEdge(1, 2)).toBe(false);
  });

  it('should get neighbors of a vertex', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(1, 4);
    const neighbors = graph.getNeighbors(1);
    expect(neighbors).toContain(2);
    expect(neighbors).toContain(3);
    expect(neighbors).toContain(4);
    expect(neighbors.length).toBe(3);
  });

  it('should return empty array for non-existent vertex neighbors', () => {
    const graph = new GraphAdjList();
    expect(graph.getNeighbors(1)).toEqual([]);
  });

  it('should get edge weight', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 10);
    expect(graph.getEdgeWeight(1, 2)).toBe(10);
  });

  it('should return undefined for non-existent edge weight', () => {
    const graph = new GraphAdjList();
    expect(graph.getEdgeWeight(1, 2)).toBeUndefined();
  });

  it('should get all vertices', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addVertex(3);
    const vertices = graph.getVertices();
    expect(vertices).toContain(1);
    expect(vertices).toContain(2);
    expect(vertices).toContain(3);
    expect(vertices.length).toBe(3);
  });

  it('should get all edges', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    const edges = graph.getEdges();
    expect(edges.length).toBe(2);
    expect(edges.some(([f, t]) => f === 1 && t === 2)).toBe(true);
    expect(edges.some(([f, t]) => f === 2 && t === 3)).toBe(true);
  });

  it('should return correct vertex count', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addVertex(3);
    expect(graph.vertexCount).toBe(3);
  });

  it('should return correct edge count', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    expect(graph.edgeCount).toBe(3);
  });

  it('should count edges correctly in directed graph', () => {
    const graph = new GraphAdjList({ directed: true });
    graph.addEdge(1, 2);
    graph.addEdge(2, 1);
    expect(graph.edgeCount).toBe(2);
  });

  it('should count edges correctly in undirected graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    expect(graph.edgeCount).toBe(2);
  });

  it('should report if graph is empty', () => {
    const graph = new GraphAdjList();
    expect(graph.isEmpty()).toBe(true);
    graph.addVertex(1);
    expect(graph.isEmpty()).toBe(false);
  });

  it('should clear the graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    graph.clear();
    expect(graph.isEmpty()).toBe(true);
    expect(graph.vertexCount).toBe(0);
    expect(graph.edgeCount).toBe(0);
  });

  it('should get degree of vertex', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(1, 4);
    expect(graph.degree(1)).toBe(3);
  });

  it('should return 0 for degree of non-existent vertex', () => {
    const graph = new GraphAdjList();
    expect(graph.degree(1)).toBe(0);
  });

  it('should get degree in directed graph', () => {
    const graph = new GraphAdjList({ directed: true });
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    expect(graph.degree(1)).toBe(2);
  });
});

describe('GraphAdjList - BFS Traversal', () => {
  it('should traverse graph using BFS', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(3, 5);
    const visited: number[] = [];
    graph.bfs(1, (v) => visited.push(v));
    expect(visited).toContain(1);
    expect(visited).toContain(2);
    expect(visited).toContain(3);
    expect(visited).toContain(4);
    expect(visited).toContain(5);
  });

  it('should handle BFS on single vertex', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    const visited: number[] = [];
    graph.bfs(1, (v) => visited.push(v));
    expect(visited).toEqual([1]);
  });

  it('should handle BFS on non-existent vertex', () => {
    const graph = new GraphAdjList();
    const visited: number[] = [];
    graph.bfs(1, (v) => visited.push(v));
    expect(visited).toEqual([]);
  });

  it('should traverse in level order', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(2, 5);
    graph.addEdge(3, 6);
    const visited: number[] = [];
    graph.bfs(1, (v) => visited.push(v));
    expect(visited[0]).toBe(1);
    expect(visited.slice(1, 3)).toContain(2);
    expect(visited.slice(1, 3)).toContain(3);
  });
});

describe('GraphAdjList - DFS Traversal', () => {
  it('should traverse graph using DFS', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(3, 5);
    const visited: number[] = [];
    graph.dfs(1, (v) => visited.push(v));
    expect(visited).toContain(1);
    expect(visited).toContain(2);
    expect(visited).toContain(3);
    expect(visited).toContain(4);
    expect(visited).toContain(5);
  });

  it('should handle DFS on single vertex', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    const visited: number[] = [];
    graph.dfs(1, (v) => visited.push(v));
    expect(visited).toEqual([1]);
  });

  it('should handle DFS on non-existent vertex', () => {
    const graph = new GraphAdjList();
    const visited: number[] = [];
    graph.dfs(1, (v) => visited.push(v));
    expect(visited).toEqual([]);
  });

  it('should go deep before wide', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(4, 5);
    const visited: number[] = [];
    graph.dfs(1, (v) => visited.push(v));
    expect(visited[0]).toBe(1);
    expect(visited[1]).toBe(2);
    expect(visited[2]).toBe(4);
    expect(visited[3]).toBe(5);
  });
});

describe('GraphAdjList - Path Detection', () => {
  it('should detect path between connected vertices', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    expect(graph.hasPath(1, 3)).toBe(true);
  });

  it('should return false for non-existent path', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    expect(graph.hasPath(1, 4)).toBe(false);
  });

  it('should detect path from vertex to itself', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    expect(graph.hasPath(1, 1)).toBe(true);
  });

  it('should return false for non-existent vertices', () => {
    const graph = new GraphAdjList();
    expect(graph.hasPath(1, 2)).toBe(false);
  });

  it('should detect path in directed graph', () => {
    const graph = new GraphAdjList({ directed: true });
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    expect(graph.hasPath(1, 3)).toBe(true);
    expect(graph.hasPath(3, 1)).toBe(false);
  });
});

describe('GraphAdjList - Shortest Path', () => {
  it('should find shortest path in unweighted graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(1, 3);
    const path = graph.shortestPath(1, 3);
    expect(path).toEqual([1, 3]);
  });

  it('should find shortest path with multiple hops', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    const path = graph.shortestPath(1, 4);
    expect(path).toEqual([1, 2, 3, 4]);
  });

  it('should find shortest path in weighted graph using Dijkstra', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 1);
    graph.addEdge(1, 3, 4);
    graph.addEdge(2, 3, 2);
    graph.addEdge(2, 4, 5);
    graph.addEdge(3, 4, 1);
    const path = graph.shortestPath(1, 4);
    expect(path).toEqual([1, 2, 3, 4]);
  });

  it('should return single vertex for same start and end', () => {
    const graph = new GraphAdjList();
    graph.addVertex(1);
    const path = graph.shortestPath(1, 1);
    expect(path).toEqual([1]);
  });

  it('should return null for non-existent path', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    const path = graph.shortestPath(1, 4);
    expect(path).toBeNull();
  });

  it('should return null for non-existent vertices', () => {
    const graph = new GraphAdjList();
    const path = graph.shortestPath(1, 2);
    expect(path).toBeNull();
  });

  it('should handle disconnected graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    const path = graph.shortestPath(1, 4);
    expect(path).toBeNull();
  });
});

describe('GraphAdjList - Directed vs Undirected', () => {
  it('should add bidirectional edge in undirected graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(true);
  });

  it('should add unidirectional edge in directed graph', () => {
    const graph = new GraphAdjList({ directed: true });
    graph.addEdge(1, 2);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(false);
  });

  it('should count edges differently for directed vs undirected', () => {
    const undirected = new GraphAdjList();
    undirected.addEdge(1, 2);
    expect(undirected.edgeCount).toBe(1);

    const directed = new GraphAdjList({ directed: true });
    directed.addEdge(1, 2);
    expect(directed.edgeCount).toBe(1);

    directed.addEdge(2, 1);
    expect(directed.edgeCount).toBe(2);
  });

  it('should return neighbors correctly in directed graph', () => {
    const graph = new GraphAdjList({ directed: true });
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 1);
    expect(graph.getNeighbors(1)).toEqual([2, 3]);
    expect(graph.getNeighbors(2)).toEqual([1]);
  });
});

describe('GraphAdjList - Weighted Edges', () => {
  it('should store edge weights', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 10);
    graph.addEdge(2, 3, 20);
    expect(graph.getEdgeWeight(1, 2)).toBe(10);
    expect(graph.getEdgeWeight(2, 3)).toBe(20);
  });

  it('should return edges with weights', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 5);
    const edges = graph.getEdges();
    const edge = edges.find(([f, t]) => f === 1 && t === 2);
    expect(edge).toBeDefined();
    expect(edge?.[2]).toBe(5);
  });

  it('should use weight 1 for unweighted edges', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    expect(graph.getEdgeWeight(1, 2)).toBe(1);
  });

  it('should choose Dijkstra for weighted graphs', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 1);
    graph.addEdge(2, 3, 100);
    graph.addEdge(1, 3, 5);
    const path = graph.shortestPath(1, 3);
    expect(path).toEqual([1, 3]);
  });

  it('should use BFS for unweighted graphs', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(1, 4);
    graph.addEdge(4, 3);
    const path = graph.shortestPath(1, 3);
    expect(path).toEqual([1, 2, 3]);
  });
});

describe('GraphAdjList - Self-Loops', () => {
  it('should allow self-loop', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 1);
    expect(graph.hasEdge(1, 1)).toBe(true);
  });

  it('should count self-loop in degree', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 1);
    graph.addEdge(1, 2);
    expect(graph.degree(1)).toBe(2);
  });

  it('should include self-loop in neighbors', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 1);
    graph.addEdge(1, 2);
    const neighbors = graph.getNeighbors(1);
    expect(neighbors).toContain(1);
    expect(neighbors).toContain(2);
  });

  it('should handle self-loop in BFS', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 1);
    const visited: number[] = [];
    graph.bfs(1, (v) => visited.push(v));
    expect(visited).toContain(1);
  });

  it('should handle self-loop in DFS', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 1);
    const visited: number[] = [];
    graph.dfs(1, (v) => visited.push(v));
    expect(visited).toContain(1);
  });
});

describe('GraphAdjList - Empty Graph', () => {
  it('should handle BFS on empty graph', () => {
    const graph = new GraphAdjList();
    const visited: number[] = [];
    graph.bfs(1, (v) => visited.push(v));
    expect(visited).toEqual([]);
  });

  it('should handle DFS on empty graph', () => {
    const graph = new GraphAdjList();
    const visited: number[] = [];
    graph.dfs(1, (v) => visited.push(v));
    expect(visited).toEqual([]);
  });

  it('should handle hasPath on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.hasPath(1, 2)).toBe(false);
  });

  it('should handle shortestPath on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.shortestPath(1, 2)).toBeNull();
  });

  it('should handle getNeighbors on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.getNeighbors(1)).toEqual([]);
  });

  it('should handle removeVertex on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.removeVertex(1)).toBe(false);
  });

  it('should handle removeEdge on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.removeEdge(1, 2)).toBe(false);
  });

  it('should handle degree on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.degree(1)).toBe(0);
  });

  it('should handle getEdgeWeight on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.getEdgeWeight(1, 2)).toBeUndefined();
  });

  it('should handle clear on empty graph', () => {
    const graph = new GraphAdjList();
    graph.clear();
    expect(graph.isEmpty()).toBe(true);
  });

  it('should have correct counts on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.vertexCount).toBe(0);
    expect(graph.edgeCount).toBe(0);
  });

  it('should return empty array for getVertices on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.getVertices()).toEqual([]);
  });

  it('should return empty array for getEdges on empty graph', () => {
    const graph = new GraphAdjList();
    expect(graph.getEdges()).toEqual([]);
  });
});

describe('GraphAdjList - Disconnected Graph', () => {
  it('should handle BFS on disconnected graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    const visited: number[] = [];
    graph.bfs(1, (v) => visited.push(v));
    expect(visited).toContain(1);
    expect(visited).toContain(2);
    expect(visited).not.toContain(3);
    expect(visited).not.toContain(4);
  });

  it('should handle DFS on disconnected graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    const visited: number[] = [];
    graph.dfs(1, (v) => visited.push(v));
    expect(visited).toContain(1);
    expect(visited).toContain(2);
    expect(visited).not.toContain(3);
    expect(visited).not.toContain(4);
  });

  it('should return false for hasPath between disconnected components', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    expect(graph.hasPath(1, 4)).toBe(false);
  });

  it('should return null for shortestPath between disconnected components', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(3, 4);
    expect(graph.shortestPath(1, 4)).toBeNull();
  });
});

describe('GraphAdjList - Complex Scenarios', () => {
  it('should handle large graph', () => {
    const graph = new GraphAdjList();
    for (let i = 1; i <= 100; i++) {
      graph.addVertex(i);
    }
    for (let i = 1; i < 100; i++) {
      graph.addEdge(i, i + 1);
    }
    expect(graph.vertexCount).toBe(100);
    expect(graph.edgeCount).toBe(99);
    const path = graph.shortestPath(1, 100);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(100);
  });

  it('should handle multiple edges to same vertex', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 1);
    graph.addEdge(1, 2, 2);
    expect(graph.getEdgeWeight(1, 2)).toBe(2);
  });

  it('should handle star graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(1, 4);
    graph.addEdge(1, 5);
    expect(graph.degree(1)).toBe(4);
    expect(graph.degree(2)).toBe(1);
    expect(graph.degree(3)).toBe(1);
  });

  it('should handle complete graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 3);
    expect(graph.edgeCount).toBe(3);
  });

  it('should handle cycle graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 1);
    expect(graph.hasPath(1, 2)).toBe(true);
    expect(graph.hasPath(2, 3)).toBe(true);
    expect(graph.hasPath(3, 1)).toBe(true);
  });

  it('should handle line graph', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(2, 3);
    graph.addEdge(3, 4);
    graph.addEdge(4, 5);
    const path = graph.shortestPath(1, 5);
    expect(path).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle binary tree-like structure', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(2, 5);
    graph.addEdge(3, 6);
    graph.addEdge(3, 7);
    const path = graph.shortestPath(4, 7);
    expect(path).toEqual([4, 2, 1, 3, 7]);
  });

  it('should update edge weight', () => {
    const graph = new GraphAdjList();
    graph.addEdge(1, 2, 5);
    graph.addEdge(1, 2, 10);
    expect(graph.getEdgeWeight(1, 2)).toBe(10);
  });

  it('should handle string vertices', () => {
    const graph = new GraphAdjList<string>();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    expect(graph.hasPath('A', 'C')).toBe(true);
    const path = graph.shortestPath('A', 'C');
    expect(path).toEqual(['A', 'B', 'C']);
  });

  it('should handle object vertices', () => {
    const graph = new GraphAdjList<{ id: number }>();
    const v1 = { id: 1 };
    const v2 = { id: 2 };
    const v3 = { id: 3 };
    graph.addEdge(v1, v2);
    graph.addEdge(v2, v3);
    expect(graph.hasPath(v1, v3)).toBe(true);
  });
});
