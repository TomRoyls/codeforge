import { describe, it, expect } from 'vitest';
import { BipartiteGraph2 } from '../../src/core/bipartite-graph-2/index.js';

// ─── Constructor ───
describe('BipartiteGraph2 constructor', () => {
  it('creates an empty graph', () => {
    const g = new BipartiteGraph2();
    expect(g.vertexCount()).toBe(0);
    expect(g.edgeCount()).toBe(0);
    expect(g.getLeftVertices()).toEqual([]);
    expect(g.getRightVertices()).toEqual([]);
  });
});

// ─── Adding Vertices ───
describe('BipartiteGraph2 addLeftVertex / addRightVertex', () => {
  it('adds left vertices', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addLeftVertex('L2');
    expect(g.getLeftVertices()).toEqual(['L1', 'L2']);
    expect(g.vertexCount()).toBe(2);
  });

  it('adds right vertices', () => {
    const g = new BipartiteGraph2();
    g.addRightVertex('R1');
    g.addRightVertex('R2');
    expect(g.getRightVertices()).toEqual(['R1', 'R2']);
    expect(g.vertexCount()).toBe(2);
  });

  it('allows same id on left and right sets independently', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('X');
    g.addRightVertex('X');
    expect(g.getLeftVertices()).toContain('X');
    expect(g.getRightVertices()).toContain('X');
    expect(g.vertexCount()).toBe(2);
  });

  it('deduplicates left vertices with same id', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('A');
    g.addLeftVertex('A');
    expect(g.getLeftVertices()).toEqual(['A']);
  });

  it('deduplicates right vertices with same id', () => {
    const g = new BipartiteGraph2();
    g.addRightVertex('B');
    g.addRightVertex('B');
    expect(g.getRightVertices()).toEqual(['B']);
  });
});

// ─── Adding Edges ───
describe('BipartiteGraph2 addEdge', () => {
  it('adds an edge between left and right vertices', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1');
    expect(g.hasEdge('L1', 'R1')).toBe(true);
    expect(g.edgeCount()).toBe(1);
  });

  it('adds edge with custom weight', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1', 42);
    expect(g.getEdgeWeight('L1', 'R1')).toBe(42);
  });

  it('defaults weight to 1', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1');
    expect(g.getEdgeWeight('L1', 'R1')).toBe(1);
  });

  it('throws if left vertex does not exist', () => {
    const g = new BipartiteGraph2();
    g.addRightVertex('R1');
    expect(() => g.addEdge('L_MISSING', 'R1')).toThrow('Left vertex L_MISSING does not exist');
  });

  it('throws if right vertex does not exist', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    expect(() => g.addEdge('L1', 'R_MISSING')).toThrow('Right vertex R_MISSING does not exist');
  });

  it('allows multiple edges from one left vertex', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addRightVertex('R2');
    g.addEdge('L1', 'R1');
    g.addEdge('L1', 'R2');
    expect(g.edgeCount()).toBe(2);
  });

  it('updates weight on duplicate edge', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1', 5);
    g.addEdge('L1', 'R1', 10);
    expect(g.edgeCount()).toBe(1);
    expect(g.getEdgeWeight('L1', 'R1')).toBe(10);
  });
});

// ─── Removing Edges ───
describe('BipartiteGraph2 removeEdge', () => {
  it('removes an existing edge', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1');
    expect(g.removeEdge('L1', 'R1')).toBe(true);
    expect(g.hasEdge('L1', 'R1')).toBe(false);
    expect(g.edgeCount()).toBe(0);
  });

  it('returns false for non-existent edge', () => {
    const g = new BipartiteGraph2();
    expect(g.removeEdge('L1', 'R1')).toBe(false);
  });

  it('returns false when left vertex has no edges', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    expect(g.removeEdge('L1', 'R1')).toBe(false);
  });
});

// ─── hasEdge ───
describe('BipartiteGraph2 hasEdge', () => {
  it('returns true for existing edge', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1');
    expect(g.hasEdge('L1', 'R1')).toBe(true);
  });

  it('returns false when no edge exists', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    expect(g.hasEdge('L1', 'R1')).toBe(false);
  });
});

// ─── getNeighbors ───
describe('BipartiteGraph2 getNeighbors', () => {
  it('returns right neighbors for a left vertex', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addRightVertex('R2');
    g.addEdge('L1', 'R1');
    g.addEdge('L1', 'R2');
    expect(g.getNeighbors('L1')).toEqual(['R1', 'R2']);
  });

  it('returns left neighbors for a right vertex', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addLeftVertex('L2');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1');
    g.addEdge('L2', 'R1');
    const neighbors = g.getNeighbors('R1');
    expect(neighbors).toContain('L1');
    expect(neighbors).toContain('L2');
    expect(neighbors.length).toBe(2);
  });

  it('returns empty array for unknown vertex', () => {
    const g = new BipartiteGraph2();
    expect(g.getNeighbors('UNKNOWN')).toEqual([]);
  });

  it('returns empty array for left vertex with no edges', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    expect(g.getNeighbors('L1')).toEqual([]);
  });
});

// ─── getEdgeWeight ───
describe('BipartiteGraph2 getEdgeWeight', () => {
  it('returns weight for existing edge', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1', 7);
    expect(g.getEdgeWeight('L1', 'R1')).toBe(7);
  });

  it('returns undefined for non-existent edge', () => {
    const g = new BipartiteGraph2();
    expect(g.getEdgeWeight('L1', 'R1')).toBeUndefined();
  });

  it('returns undefined when left vertex has no edges map', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    expect(g.getEdgeWeight('L1', 'R1')).toBeUndefined();
  });
});

// ─── vertexCount / edgeCount ───
describe('BipartiteGraph2 counts', () => {
  it('vertexCount sums left and right', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addLeftVertex('L2');
    g.addRightVertex('R1');
    expect(g.vertexCount()).toBe(3);
  });

  it('edgeCount reflects all edges', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addLeftVertex('L2');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1');
    g.addEdge('L2', 'R1');
    expect(g.edgeCount()).toBe(2);
  });

  it('edgeCount is zero after removing all edges', () => {
    const g = new BipartiteGraph2();
    g.addLeftVertex('L1');
    g.addRightVertex('R1');
    g.addEdge('L1', 'R1');
    g.removeEdge('L1', 'R1');
    expect(g.edgeCount()).toBe(0);
  });
});
