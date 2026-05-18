import { describe, it, expect } from 'vitest';
import { EdgeGraph2 } from '../../src/core/edge-graph-2/index.js';

// ─── Constructor ───
describe('EdgeGraph2 constructor', () => {
  it('creates an undirected graph by default', () => {
    const g = new EdgeGraph2();
    expect(g.isDirected()).toBe(false);
    expect(g.vertexCount).toBe(0);
    expect(g.edgeCount).toBe(0);
  });

  it('creates a directed graph when specified', () => {
    const g = new EdgeGraph2(true);
    expect(g.isDirected()).toBe(true);
  });
});

// ─── Adding Vertices ───
describe('EdgeGraph2 addVertex', () => {
  it('adds a vertex', () => {
    const g = new EdgeGraph2();
    g.addVertex('A');
    expect(g.hasVertex('A')).toBe(true);
    expect(g.vertexCount).toBe(1);
  });

  it('does not duplicate vertices', () => {
    const g = new EdgeGraph2();
    g.addVertex('A');
    g.addVertex('A');
    expect(g.vertexCount).toBe(1);
  });

  it('getVertices returns all vertices', () => {
    const g = new EdgeGraph2();
    g.addVertex('A');
    g.addVertex('B');
    const vertices = g.getVertices();
    expect(vertices).toContain('A');
    expect(vertices).toContain('B');
    expect(vertices.length).toBe(2);
  });
});

// ─── Adding Edges (Undirected) ───
describe('EdgeGraph2 addEdge undirected', () => {
  it('adds edge and auto-creates vertices', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B', 5);
    expect(g.hasVertex('A')).toBe(true);
    expect(g.hasVertex('B')).toBe(true);
    expect(g.hasEdge('A', 'B')).toBe(true);
    expect(g.hasEdge('B', 'A')).toBe(true);
  });

  it('stores both directions in edge list', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B', 3);
    expect(g.edgeCount).toBe(2);
  });

  it('stores one entry for self-loop', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'A', 1);
    expect(g.edgeCount).toBe(1);
    expect(g.hasEdge('A', 'A')).toBe(true);
  });

  it('updates weight of existing edge', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B', 1);
    g.addEdge('A', 'B', 10);
    const edges = g.getEdges();
    const ab = edges.find(e => e.from === 'A' && e.to === 'B');
    expect(ab?.weight).toBe(10);
  });
});

// ─── Adding Edges (Directed) ───
describe('EdgeGraph2 addEdge directed', () => {
  it('adds only one direction for directed edge', () => {
    const g = new EdgeGraph2(true);
    g.addEdge('A', 'B', 5);
    expect(g.hasEdge('A', 'B')).toBe(true);
    expect(g.hasEdge('B', 'A')).toBe(false);
    expect(g.edgeCount).toBe(1);
  });
});

// ─── Removing Vertices ───
describe('EdgeGraph2 removeVertex', () => {
  it('removes a vertex and its edges', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B');
    g.addEdge('A', 'C');
    expect(g.removeVertex('A')).toBe(true);
    expect(g.hasVertex('A')).toBe(false);
    expect(g.hasEdge('A', 'B')).toBe(false);
    expect(g.hasEdge('B', 'A')).toBe(false);
  });

  it('returns false if vertex does not exist', () => {
    const g = new EdgeGraph2();
    expect(g.removeVertex('X')).toBe(false);
  });
});

// ─── Removing Edges ───
describe('EdgeGraph2 removeEdge', () => {
  it('removes both directions in undirected graph', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B');
    expect(g.removeEdge('A', 'B')).toBe(true);
    expect(g.hasEdge('A', 'B')).toBe(false);
    expect(g.hasEdge('B', 'A')).toBe(false);
  });

  it('removes only one direction in directed graph', () => {
    const g = new EdgeGraph2(true);
    g.addEdge('A', 'B');
    g.addEdge('B', 'A');
    expect(g.removeEdge('A', 'B')).toBe(true);
    expect(g.hasEdge('A', 'B')).toBe(false);
    expect(g.hasEdge('B', 'A')).toBe(true);
  });

  it('returns false for non-existent edge', () => {
    const g = new EdgeGraph2();
    expect(g.removeEdge('X', 'Y')).toBe(false);
  });
});

// ─── hasVertex / hasEdge ───
describe('EdgeGraph2 hasVertex / hasEdge', () => {
  it('hasVertex returns false for absent vertex', () => {
    const g = new EdgeGraph2();
    expect(g.hasVertex('Z')).toBe(false);
  });

  it('hasEdge returns false for absent edge', () => {
    const g = new EdgeGraph2();
    g.addVertex('A');
    g.addVertex('B');
    expect(g.hasEdge('A', 'B')).toBe(false);
  });
});

// ─── getNeighbors ───
describe('EdgeGraph2 getNeighbors', () => {
  it('returns neighbors for a vertex', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B');
    g.addEdge('A', 'C');
    const neighbors = g.getNeighbors('A');
    expect(neighbors).toContain('B');
    expect(neighbors).toContain('C');
    expect(neighbors.length).toBe(2);
  });

  it('returns empty array for vertex with no outgoing edges', () => {
    const g = new EdgeGraph2(true);
    g.addEdge('B', 'A');
    expect(g.getNeighbors('A')).toEqual([]);
  });

  it('returns empty array for unknown vertex', () => {
    const g = new EdgeGraph2();
    expect(g.getNeighbors('X')).toEqual([]);
  });
});

// ─── getEdges ───
describe('EdgeGraph2 getEdges', () => {
  it('returns a copy of edges', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B', 5);
    const edges = g.getEdges();
    edges.push({ from: 'Z', to: 'Y', weight: 0 });
    expect(g.edgeCount).toBe(2);
  });
});

// ─── clear ───
describe('EdgeGraph2 clear', () => {
  it('removes all vertices and edges', () => {
    const g = new EdgeGraph2();
    g.addEdge('A', 'B');
    g.addEdge('B', 'C');
    g.clear();
    expect(g.vertexCount).toBe(0);
    expect(g.edgeCount).toBe(0);
    expect(g.getVertices()).toEqual([]);
    expect(g.getEdges()).toEqual([]);
  });
});

// ─── Edge Cases ───
describe('EdgeGraph2 edge cases', () => {
  it('handles single vertex with no edges', () => {
    const g = new EdgeGraph2();
    g.addVertex('A');
    expect(g.vertexCount).toBe(1);
    expect(g.edgeCount).toBe(0);
    expect(g.getNeighbors('A')).toEqual([]);
  });

  it('handles large number of vertices and edges', () => {
    const g = new EdgeGraph2();
    for (let i = 0; i < 100; i++) {
      g.addVertex(`V${i}`);
    }
    for (let i = 0; i < 99; i++) {
      g.addEdge(`V${i}`, `V${i + 1}`, i);
    }
    expect(g.vertexCount).toBe(100);
    expect(g.edgeCount).toBe(198);
  });
});
