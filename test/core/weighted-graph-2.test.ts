import { describe, it, expect } from 'vitest';
import { WeightedGraph2 } from '../../src/core/weighted-graph-2/index.js';

// ─── Constructor ───
describe('WeightedGraph2 constructor', () => {
  it('creates an empty graph', () => {
    const g = new WeightedGraph2();
    expect(g.vertexCount()).toBe(0);
    expect(g.edgeCount()).toBe(0);
    expect(g.vertices()).toEqual([]);
  });
});

// ─── Adding Vertices ───
describe('WeightedGraph2 addVertex', () => {
  it('adds a vertex', () => {
    const g = new WeightedGraph2();
    g.addVertex('A');
    expect(g.hasVertex('A')).toBe(true);
    expect(g.vertexCount()).toBe(1);
  });

  it('does not duplicate vertices', () => {
    const g = new WeightedGraph2();
    g.addVertex('A');
    g.addVertex('A');
    expect(g.vertexCount()).toBe(1);
  });

  it('vertices() returns all vertex ids', () => {
    const g = new WeightedGraph2();
    g.addVertex('A');
    g.addVertex('B');
    const v = g.vertices();
    expect(v).toContain('A');
    expect(v).toContain('B');
    expect(v.length).toBe(2);
  });
});

// ─── Adding Edges ───
describe('WeightedGraph2 addEdge', () => {
  it('adds an edge with weight', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 10);
    expect(g.hasEdge('A', 'B')).toBe(true);
    expect(g.getEdgeWeight('A', 'B')).toBe(10);
    expect(g.edgeCount()).toBe(1);
  });

  it('auto-creates vertices when adding edge', () => {
    const g = new WeightedGraph2();
    g.addEdge('X', 'Y', 5);
    expect(g.hasVertex('X')).toBe(true);
    expect(g.hasVertex('Y')).toBe(true);
  });

  it('updates weight of existing edge', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 3);
    g.addEdge('A', 'B', 7);
    expect(g.getEdgeWeight('A', 'B')).toBe(7);
    expect(g.edgeCount()).toBe(1);
  });

  it('adds multiple edges from one vertex', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 1);
    g.addEdge('A', 'C', 2);
    g.addEdge('A', 'D', 3);
    expect(g.edgeCount()).toBe(3);
  });

  it('handles zero weight', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 0);
    expect(g.getEdgeWeight('A', 'B')).toBe(0);
  });

  it('handles negative weight', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', -5);
    expect(g.getEdgeWeight('A', 'B')).toBe(-5);
  });
});

// ─── Removing Vertices ───
describe('WeightedGraph2 removeVertex', () => {
  it('removes a vertex and its outgoing edges', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 1);
    g.addEdge('A', 'C', 2);
    expect(g.removeVertex('A')).toBe(true);
    expect(g.hasVertex('A')).toBe(false);
    expect(g.edgeCount()).toBe(0);
  });

  it('removes incoming edges from other vertices', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 1);
    g.addEdge('C', 'B', 2);
    expect(g.removeVertex('B')).toBe(true);
    expect(g.hasEdge('A', 'B')).toBe(false);
    expect(g.hasEdge('C', 'B')).toBe(false);
  });

  it('returns false for non-existent vertex', () => {
    const g = new WeightedGraph2();
    expect(g.removeVertex('X')).toBe(false);
  });
});

// ─── Removing Edges ───
describe('WeightedGraph2 removeEdge', () => {
  it('removes an existing edge', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 5);
    expect(g.removeEdge('A', 'B')).toBe(true);
    expect(g.hasEdge('A', 'B')).toBe(false);
    expect(g.edgeCount()).toBe(0);
  });

  it('returns false for non-existent edge', () => {
    const g = new WeightedGraph2();
    expect(g.removeEdge('A', 'B')).toBe(false);
  });

  it('returns false when vertex has no edges', () => {
    const g = new WeightedGraph2();
    g.addVertex('A');
    expect(g.removeEdge('A', 'B')).toBe(false);
  });
});

// ─── hasVertex / hasEdge ───
describe('WeightedGraph2 hasVertex / hasEdge', () => {
  it('hasVertex returns false for absent vertex', () => {
    const g = new WeightedGraph2();
    expect(g.hasVertex('Z')).toBe(false);
  });

  it('hasEdge returns false for absent edge', () => {
    const g = new WeightedGraph2();
    g.addVertex('A');
    g.addVertex('B');
    expect(g.hasEdge('A', 'B')).toBe(false);
  });

  it('hasEdge returns false for unknown vertex', () => {
    const g = new WeightedGraph2();
    expect(g.hasEdge('X', 'Y')).toBe(false);
  });
});

// ─── getEdgeWeight ───
describe('WeightedGraph2 getEdgeWeight', () => {
  it('returns undefined for non-existent edge', () => {
    const g = new WeightedGraph2();
    expect(g.getEdgeWeight('A', 'B')).toBeUndefined();
  });

  it('returns the correct weight', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 42);
    expect(g.getEdgeWeight('A', 'B')).toBe(42);
  });
});

// ─── getNeighbors ───
describe('WeightedGraph2 getNeighbors', () => {
  it('returns neighbor list with weights', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 1);
    g.addEdge('A', 'C', 2);
    const neighbors = g.getNeighbors('A');
    expect(neighbors.length).toBe(2);
    expect(neighbors.find(n => n.to === 'B')).toEqual({ to: 'B', weight: 1 });
    expect(neighbors.find(n => n.to === 'C')).toEqual({ to: 'C', weight: 2 });
  });

  it('returns empty array for vertex with no edges', () => {
    const g = new WeightedGraph2();
    g.addVertex('A');
    expect(g.getNeighbors('A')).toEqual([]);
  });

  it('returns empty array for unknown vertex', () => {
    const g = new WeightedGraph2();
    expect(g.getNeighbors('X')).toEqual([]);
  });

  it('returns a copy (not internal reference)', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 1);
    const neighbors = g.getNeighbors('A');
    neighbors.push({ to: 'C', weight: 99 });
    expect(g.getNeighbors('A').length).toBe(1);
  });
});

// ─── vertexCount / edgeCount ───
describe('WeightedGraph2 counts', () => {
  it('counts vertices correctly after mixed operations', () => {
    const g = new WeightedGraph2();
    g.addVertex('A');
    g.addVertex('B');
    g.addVertex('C');
    g.removeVertex('B');
    expect(g.vertexCount()).toBe(2);
  });

  it('counts edges correctly after mixed operations', () => {
    const g = new WeightedGraph2();
    g.addEdge('A', 'B', 1);
    g.addEdge('B', 'C', 2);
    g.addEdge('C', 'A', 3);
    expect(g.edgeCount()).toBe(3);
    g.removeEdge('A', 'B');
    expect(g.edgeCount()).toBe(2);
  });
});
