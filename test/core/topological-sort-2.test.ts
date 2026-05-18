import { describe, it, expect } from 'vitest';
import { TopologicalSort2 } from '../../src/core/topological-sort-2/index.js';

// ─── Constructor ───
describe('TopologicalSort2 constructor', () => {
  it('creates an empty graph', () => {
    const ts = new TopologicalSort2();
    expect(ts.nodeCount()).toBe(0);
    expect(ts.edgeCount()).toBe(0);
  });
});

// ─── Adding Nodes ───
describe('TopologicalSort2 addNode', () => {
  it('adds a node', () => {
    const ts = new TopologicalSort2();
    ts.addNode('A');
    expect(ts.nodeCount()).toBe(1);
  });

  it('does not duplicate nodes', () => {
    const ts = new TopologicalSort2();
    ts.addNode('A');
    ts.addNode('A');
    expect(ts.nodeCount()).toBe(1);
  });

  it('adds multiple nodes', () => {
    const ts = new TopologicalSort2();
    ts.addNode('A');
    ts.addNode('B');
    ts.addNode('C');
    expect(ts.nodeCount()).toBe(3);
  });
});

// ─── Adding Edges ───
describe('TopologicalSort2 addEdge', () => {
  it('adds edge and auto-creates nodes', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    expect(ts.nodeCount()).toBe(2);
    expect(ts.edgeCount()).toBe(1);
  });

  it('does not duplicate edges', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'B');
    expect(ts.edgeCount()).toBe(1);
  });

  it('handles multiple edges from same node', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    expect(ts.edgeCount()).toBe(2);
  });

  it('handles multiple edges to same node', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'C');
    expect(ts.edgeCount()).toBe(2);
  });
});

// ─── sort (DAG) ───
describe('TopologicalSort2 sort', () => {
  it('returns single node', () => {
    const ts = new TopologicalSort2();
    ts.addNode('A');
    expect(ts.sort()).toEqual(['A']);
  });

  it('sorts simple linear DAG', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    const result = ts.sort();
    expect(result).toEqual(['A', 'B', 'C']);
  });

  it('sorts diamond DAG', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');
    ts.addEdge('C', 'D');
    const result = ts.sort();
    expect(result[0]).toBe('A');
    expect(result[3]).toBe('D');
    expect(result).toContain('B');
    expect(result).toContain('C');
  });

  it('sorts disconnected components', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addNode('C');
    const result = ts.sort();
    expect(result.length).toBe(3);
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).toContain('C');
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
  });

  it('returns empty array for graph with cycle', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');
    expect(ts.sort()).toEqual([]);
  });

  it('handles single node self-loop as cycle', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'A');
    expect(ts.sort()).toEqual([]);
  });

  it('returns empty for empty graph', () => {
    const ts = new TopologicalSort2();
    expect(ts.sort()).toEqual([]);
  });

  it('sorts larger DAG correctly', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('5', '11');
    ts.addEdge('11', '2');
    ts.addEdge('7', '11');
    ts.addEdge('7', '8');
    ts.addEdge('3', '8');
    ts.addEdge('3', '10');
    ts.addEdge('11', '9');
    ts.addEdge('8', '9');
    const result = ts.sort();
    expect(result.length).toBe(8);
    expect(result.indexOf('5')).toBeLessThan(result.indexOf('11'));
    expect(result.indexOf('11')).toBeLessThan(result.indexOf('2'));
    expect(result.indexOf('7')).toBeLessThan(result.indexOf('8'));
    expect(result.indexOf('8')).toBeLessThan(result.indexOf('9'));
  });
});

// ─── hasCycle ───
describe('TopologicalSort2 hasCycle', () => {
  it('returns false for DAG', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    expect(ts.hasCycle()).toBe(false);
  });

  it('returns true for cycle', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');
    expect(ts.hasCycle()).toBe(true);
  });

  it('returns false for single node with no edges', () => {
    const ts = new TopologicalSort2();
    ts.addNode('A');
    expect(ts.hasCycle()).toBe(false);
  });

  it('returns true for self-loop', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'A');
    expect(ts.hasCycle()).toBe(true);
  });

  it('returns false for empty graph', () => {
    const ts = new TopologicalSort2();
    expect(ts.hasCycle()).toBe(false);
  });

  it('detects cycle in disconnected graph', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('C', 'D');
    ts.addEdge('D', 'C');
    expect(ts.hasCycle()).toBe(true);
  });
});

// ─── nodeCount / edgeCount ───
describe('TopologicalSort2 counts', () => {
  it('counts nodes correctly', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    expect(ts.nodeCount()).toBe(3);
  });

  it('counts edges correctly', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'C');
    expect(ts.edgeCount()).toBe(3);
  });
});
