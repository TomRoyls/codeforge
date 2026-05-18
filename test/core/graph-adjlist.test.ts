import { describe, it, expect } from 'vitest';
import { GraphAdjList } from '../../src/core/graph-adjlist/index.js';

// ─── Constructor ───

describe('GraphAdjList constructor', () => {
  it('creates an undirected graph by default', () => {
    const g = new GraphAdjList<number>();
    expect(g.isEmpty()).toBe(true);
  });

  it('creates a directed graph when specified', () => {
    const g = new GraphAdjList<number>({ directed: true });
    expect(g.isEmpty()).toBe(true);
  });

  it('creates an undirected graph explicitly', () => {
    const g = new GraphAdjList<number>({ directed: false });
    expect(g.isEmpty()).toBe(true);
  });
});

// ─── addVertex() ───

describe('GraphAdjList.addVertex', () => {
  it('adds a vertex to the graph', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    expect(g.hasVertex(1)).toBe(true);
    expect(g.vertexCount).toBe(1);
  });

  it('does not duplicate vertices', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    g.addVertex(1);
    expect(g.vertexCount).toBe(1);
  });

  it('adds multiple vertices', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    g.addVertex(2);
    g.addVertex(3);
    expect(g.vertexCount).toBe(3);
  });

  it('works with string vertices', () => {
    const g = new GraphAdjList<string>();
    g.addVertex('a');
    g.addVertex('b');
    expect(g.hasVertex('a')).toBe(true);
    expect(g.hasVertex('b')).toBe(true);
  });
});

// ─── removeVertex() ───

describe('GraphAdjList.removeVertex', () => {
  it('removes a vertex', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    g.addVertex(2);
    expect(g.removeVertex(1)).toBe(true);
    expect(g.hasVertex(1)).toBe(false);
    expect(g.vertexCount).toBe(1);
  });

  it('returns false for non-existent vertex', () => {
    const g = new GraphAdjList<number>();
    expect(g.removeVertex(99)).toBe(false);
  });

  it('removes associated edges', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    g.removeVertex(1);
    expect(g.hasEdge(2, 1)).toBe(false);
    expect(g.hasEdge(3, 1)).toBe(false);
  });
});

// ─── addEdge() ───

describe('GraphAdjList.addEdge', () => {
  it('adds an edge in undirected graph', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    expect(g.hasEdge(1, 2)).toBe(true);
    expect(g.hasEdge(2, 1)).toBe(true);
  });

  it('adds a directed edge', () => {
    const g = new GraphAdjList<number>({ directed: true });
    g.addEdge(1, 2);
    expect(g.hasEdge(1, 2)).toBe(true);
    expect(g.hasEdge(2, 1)).toBe(false);
  });

  it('auto-creates vertices when adding edge', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    expect(g.hasVertex(1)).toBe(true);
    expect(g.hasVertex(2)).toBe(true);
  });

  it('adds weighted edge', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2, 5);
    expect(g.getEdgeWeight(1, 2)).toBe(5);
    expect(g.getEdgeWeight(2, 1)).toBe(5);
  });

  it('default weight is 1', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    expect(g.getEdgeWeight(1, 2)).toBe(1);
  });
});

// ─── removeEdge() ───

describe('GraphAdjList.removeEdge', () => {
  it('removes an edge in undirected graph', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    expect(g.removeEdge(1, 2)).toBe(true);
    expect(g.hasEdge(1, 2)).toBe(false);
    expect(g.hasEdge(2, 1)).toBe(false);
  });

  it('returns false for non-existent edge', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    g.addVertex(2);
    expect(g.removeEdge(1, 2)).toBe(false);
  });

  it('removes directed edge only in one direction', () => {
    const g = new GraphAdjList<number>({ directed: true });
    g.addEdge(1, 2);
    g.addEdge(2, 1);
    g.removeEdge(1, 2);
    expect(g.hasEdge(1, 2)).toBe(false);
    expect(g.hasEdge(2, 1)).toBe(true);
  });
});

// ─── hasVertex() / hasEdge() ───

describe('GraphAdjList.hasVertex / hasEdge', () => {
  it('hasVertex returns false for missing vertex', () => {
    const g = new GraphAdjList<number>();
    expect(g.hasVertex(1)).toBe(false);
  });

  it('hasEdge returns false for missing vertices', () => {
    const g = new GraphAdjList<number>();
    expect(g.hasEdge(1, 2)).toBe(false);
  });
});

// ─── getNeighbors() ───

describe('GraphAdjList.getNeighbors', () => {
  it('returns neighbors of a vertex', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    const neighbors = g.getNeighbors(1);
    expect(neighbors).toContain(2);
    expect(neighbors).toContain(3);
    expect(neighbors.length).toBe(2);
  });

  it('returns empty array for isolated vertex', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    expect(g.getNeighbors(1)).toEqual([]);
  });

  it('returns empty array for non-existent vertex', () => {
    const g = new GraphAdjList<number>();
    expect(g.getNeighbors(99)).toEqual([]);
  });
});

// ─── getEdgeWeight() ───

describe('GraphAdjList.getEdgeWeight', () => {
  it('returns weight of existing edge', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2, 10);
    expect(g.getEdgeWeight(1, 2)).toBe(10);
  });

  it('returns undefined for non-existent edge', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    g.addVertex(2);
    expect(g.getEdgeWeight(1, 2)).toBeUndefined();
  });
});

// ─── getVertices() / getEdges() ───

describe('GraphAdjList.getVertices / getEdges', () => {
  it('getVertices returns all vertices', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    g.addVertex(2);
    g.addVertex(3);
    const verts = g.getVertices();
    expect(verts.length).toBe(3);
    expect(verts).toContain(1);
    expect(verts).toContain(2);
    expect(verts).toContain(3);
  });

  it('getEdges returns all edges', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    const edges = g.getEdges();
    expect(edges.length).toBe(2);
  });
});

// ─── vertexCount / edgeCount ───

describe('GraphAdjList.vertexCount / edgeCount', () => {
  it('tracks vertex count', () => {
    const g = new GraphAdjList<number>();
    expect(g.vertexCount).toBe(0);
    g.addVertex(1);
    expect(g.vertexCount).toBe(1);
    g.addVertex(2);
    expect(g.vertexCount).toBe(2);
  });

  it('tracks edge count in undirected graph', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    expect(g.edgeCount).toBe(2);
  });

  it('tracks edge count in directed graph', () => {
    const g = new GraphAdjList<number>({ directed: true });
    g.addEdge(1, 2);
    g.addEdge(2, 1);
    expect(g.edgeCount).toBe(2);
  });
});

// ─── isEmpty() / clear() ───

describe('GraphAdjList.isEmpty / clear', () => {
  it('isEmpty returns true for empty graph', () => {
    const g = new GraphAdjList<number>();
    expect(g.isEmpty()).toBe(true);
  });

  it('isEmpty returns false after adding vertices', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    expect(g.isEmpty()).toBe(false);
  });

  it('clear removes all vertices and edges', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(3, 4);
    g.clear();
    expect(g.isEmpty()).toBe(true);
    expect(g.vertexCount).toBe(0);
    expect(g.edgeCount).toBe(0);
  });
});

// ─── bfs() ───

describe('GraphAdjList.bfs', () => {
  it('traverses vertices in BFS order', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    g.addEdge(2, 4);
    const visited: number[] = [];
    g.bfs(1, (v) => visited.push(v));
    expect(visited[0]).toBe(1);
    expect(visited).toContain(2);
    expect(visited).toContain(3);
    expect(visited).toContain(4);
    expect(visited.length).toBe(4);
  });

  it('does nothing for non-existent start vertex', () => {
    const g = new GraphAdjList<number>();
    const visited: number[] = [];
    g.bfs(99, (v) => visited.push(v));
    expect(visited).toEqual([]);
  });

  it('handles single vertex', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    const visited: number[] = [];
    g.bfs(1, (v) => visited.push(v));
    expect(visited).toEqual([1]);
  });
});

// ─── dfs() ───

describe('GraphAdjList.dfs', () => {
  it('traverses vertices in DFS order', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    g.addEdge(2, 4);
    const visited: number[] = [];
    g.dfs(1, (v) => visited.push(v));
    expect(visited[0]).toBe(1);
    expect(visited.length).toBe(4);
  });

  it('does nothing for non-existent start vertex', () => {
    const g = new GraphAdjList<number>();
    const visited: number[] = [];
    g.dfs(99, (v) => visited.push(v));
    expect(visited).toEqual([]);
  });
});

// ─── hasPath() ───

describe('GraphAdjList.hasPath', () => {
  it('returns true for connected vertices', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    expect(g.hasPath(1, 3)).toBe(true);
  });

  it('returns false for disconnected vertices', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addVertex(3);
    expect(g.hasPath(1, 3)).toBe(false);
  });

  it('returns true for same vertex', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    expect(g.hasPath(1, 1)).toBe(true);
  });

  it('returns false for non-existent vertices', () => {
    const g = new GraphAdjList<number>();
    expect(g.hasPath(1, 2)).toBe(false);
  });
});

// ─── shortestPath() ───

describe('GraphAdjList.shortestPath', () => {
  it('finds shortest path in unweighted graph', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.addEdge(1, 3);
    const path = g.shortestPath(1, 3);
    expect(path).not.toBeNull();
    expect(path![0]).toBe(1);
    expect(path![path!.length - 1]).toBe(3);
  });

  it('returns null for disconnected vertices', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addVertex(3);
    expect(g.shortestPath(1, 3)).toBeNull();
  });

  it('returns single vertex for same source and target', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    expect(g.shortestPath(1, 1)).toEqual([1]);
  });

  it('returns null for non-existent vertices', () => {
    const g = new GraphAdjList<number>();
    expect(g.shortestPath(1, 2)).toBeNull();
  });

  it('finds shortest path in weighted graph', () => {
    const g = new GraphAdjList<string>();
    g.addEdge('a', 'b', 1);
    g.addEdge('b', 'c', 1);
    g.addEdge('a', 'c', 5);
    const path = g.shortestPath('a', 'c');
    expect(path).not.toBeNull();
    expect(path!.length).toBe(3);
    expect(path![0]).toBe('a');
    expect(path![2]).toBe('c');
  });
});

// ─── degree() ───

describe('GraphAdjList.degree', () => {
  it('returns degree of a vertex', () => {
    const g = new GraphAdjList<number>();
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    expect(g.degree(1)).toBe(2);
  });

  it('returns 0 for isolated vertex', () => {
    const g = new GraphAdjList<number>();
    g.addVertex(1);
    expect(g.degree(1)).toBe(0);
  });

  it('returns 0 for non-existent vertex', () => {
    const g = new GraphAdjList<number>();
    expect(g.degree(99)).toBe(0);
  });

  it('returns degree for directed graph', () => {
    const g = new GraphAdjList<number>({ directed: true });
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    g.addEdge(2, 1);
    expect(g.degree(1)).toBe(2);
  });
});
