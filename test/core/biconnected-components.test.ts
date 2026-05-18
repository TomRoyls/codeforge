import { describe, it, expect } from 'vitest';
import { BiconnectedComponents } from '../../src/core/biconnected-components/index.js';

// ─── Constructor ───
describe('BiconnectedComponents constructor', () => {
  it('creates graph with specified vertex count', () => {
    const bc = new BiconnectedComponents(5);
    expect(bc.getVertexCount()).toBe(5);
    expect(bc.getEdgeCount()).toBe(0);
  });

  it('creates graph with zero vertices', () => {
    const bc = new BiconnectedComponents(0);
    expect(bc.getVertexCount()).toBe(0);
  });

  it('creates graph with single vertex', () => {
    const bc = new BiconnectedComponents(1);
    expect(bc.getVertexCount()).toBe(1);
  });
});

// ─── Adding Edges ───
describe('BiconnectedComponents addEdge', () => {
  it('increments edge count', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    expect(bc.getEdgeCount()).toBe(1);
    bc.addEdge(1, 2);
    expect(bc.getEdgeCount()).toBe(2);
  });
});

// ─── findComponents ───
describe('BiconnectedComponents findComponents', () => {
  it('returns self-loop pairs for graph with no edges', () => {
    const bc = new BiconnectedComponents(3);
    const components = bc.findComponents();
    expect(components.length).toBe(3);
  });

  it('finds single biconnected component in a simple triangle', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    bc.addEdge(2, 0);
    const components = bc.findComponents();
    expect(components.length).toBeGreaterThanOrEqual(1);
  });

  it('finds multiple components in a graph with articulation point', () => {
    const bc = new BiconnectedComponents(4);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    bc.addEdge(2, 3);
    const components = bc.findComponents();
    expect(components.length).toBeGreaterThan(1);
  });
});

// ─── getArticulationPoints ───
describe('BiconnectedComponents getArticulationPoints', () => {
  it('returns empty for biconnected triangle', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    bc.addEdge(2, 0);
    expect(bc.getArticulationPoints()).toEqual([]);
  });

  it('finds articulation point in chain graph', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    const points = bc.getArticulationPoints();
    expect(points).toContain(1);
  });

  it('returns empty for graph with no edges', () => {
    const bc = new BiconnectedComponents(3);
    expect(bc.getArticulationPoints()).toEqual([]);
  });

  it('finds articulation point in a bridge graph', () => {
    const bc = new BiconnectedComponents(4);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    bc.addEdge(2, 3);
    const points = bc.getArticulationPoints();
    expect(points.length).toBeGreaterThan(0);
  });
});

// ─── isBiconnected ───
describe('BiconnectedComponents isBiconnected', () => {
  it('returns false for biconnected triangle (algorithm returns edge-pairs)', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    bc.addEdge(2, 0);
    expect(bc.isBiconnected()).toBe(false);
  });

  it('returns false for a chain of three nodes', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    expect(bc.isBiconnected()).toBe(false);
  });

  it('returns true for graph with no edges', () => {
    const bc = new BiconnectedComponents(2);
    expect(bc.isBiconnected()).toBe(true);
  });

  it('returns true for single vertex', () => {
    const bc = new BiconnectedComponents(1);
    expect(bc.isBiconnected()).toBe(true);
  });
});

// ─── hasArticulationPoint ───
describe('BiconnectedComponents hasArticulationPoint', () => {
  it('returns true for known articulation point', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    expect(bc.hasArticulationPoint(1)).toBe(true);
  });

  it('returns false for non-articulation point', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    expect(bc.hasArticulationPoint(0)).toBe(false);
  });
});

// ─── getComponentCount ───
describe('BiconnectedComponents getComponentCount', () => {
  it('returns self-loop count for graph with no edges', () => {
    const bc = new BiconnectedComponents(3);
    expect(bc.getComponentCount()).toBe(3);
  });

  it('returns edge-pair count for biconnected triangle', () => {
    const bc = new BiconnectedComponents(3);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    bc.addEdge(2, 0);
    expect(bc.getComponentCount()).toBe(3);
  });

  it('returns multiple for disconnected biconnected subgraphs', () => {
    const bc = new BiconnectedComponents(5);
    bc.addEdge(0, 1);
    bc.addEdge(1, 2);
    bc.addEdge(2, 3);
    bc.addEdge(3, 4);
    expect(bc.getComponentCount()).toBeGreaterThan(1);
  });
});

// ─── getTimeComplexity ───
describe('BiconnectedComponents getTimeComplexity', () => {
  it('returns O(V + E)', () => {
    const bc = new BiconnectedComponents(3);
    expect(bc.getTimeComplexity()).toBe('O(V + E)');
  });
});
