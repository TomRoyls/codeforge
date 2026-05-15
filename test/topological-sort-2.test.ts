import { describe, it, expect } from 'vitest';
import { TopologicalSort2 } from '../src/core/topological-sort-2/index.js';

describe('TopologicalSort2', () => {
  it('simple DAG', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');

    const result = ts.sort();
    expect(result).toHaveLength(4);
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('C'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('D'));
  });

  it('linear chain', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'D');

    const result = ts.sort();
    expect(result).toHaveLength(4);
    expect(result).toEqual(['A', 'B', 'C', 'D']);
  });

  it('diamond shape', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');
    ts.addEdge('C', 'D');

    const result = ts.sort();
    expect(result).toHaveLength(4);
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('C'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
  });

  it('cycle detection in sort', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');

    const result = ts.sort();
    expect(result).toEqual([]);
  });

  it('hasCycle false for DAG', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('A', 'C');

    expect(ts.hasCycle()).toBe(false);
  });

  it('hasCycle true with cycle', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');

    expect(ts.hasCycle()).toBe(true);
  });

  it('sort order verification', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');
    ts.addEdge('C', 'D');
    ts.addEdge('D', 'E');

    const result = ts.sort();
    expect(result).toHaveLength(5);
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('C'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('D')).toBeLessThan(result.indexOf('E'));
  });

  it('node and edge counts', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');

    expect(ts.nodeCount()).toBe(4);
    expect(ts.edgeCount()).toBe(3);
  });

  it('node count with only nodes', () => {
    const ts = new TopologicalSort2();
    ts.addNode('A');
    ts.addNode('B');
    ts.addNode('C');

    expect(ts.nodeCount()).toBe(3);
    expect(ts.edgeCount()).toBe(0);
  });

  it('duplicate edges not counted twice', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'B');

    expect(ts.edgeCount()).toBe(1);
  });

  it('empty graph', () => {
    const ts = new TopologicalSort2();

    expect(ts.nodeCount()).toBe(0);
    expect(ts.edgeCount()).toBe(0);
    expect(ts.sort()).toEqual([]);
    expect(ts.hasCycle()).toBe(false);
  });

  it('linear chain', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'D');
    ts.addEdge('D', 'E');
    expect(ts.sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('diamond dependency', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');
    ts.addEdge('C', 'D');
    const result = ts.sort();
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('C'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
  });

  it('disconnected components', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('C', 'D');
    const result = ts.sort();
    expect(result).toHaveLength(4);
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
  });

  it('numeric node ids', () => {
    const ts = new TopologicalSort2();
    ts.addEdge(1, 2);
    ts.addEdge(1, 3);
    ts.addEdge(2, 4);
    const result = ts.sort();
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toContain(3);
    expect(result).toContain(4);
    expect(result.indexOf(1)).toBeLessThan(result.indexOf(2));
  });

  it('single node', () => {
    const ts = new TopologicalSort2();
    ts.addNode('A');
    expect(ts.sort()).toEqual(['A']);
    expect(ts.nodeCount()).toBe(1);
  });

  it('large graph', () => {
    const ts = new TopologicalSort2();
    for (let i = 0; i < 100; i++) {
      ts.addEdge(i, i + 1);
    }
    const result = ts.sort();
    expect(result).toHaveLength(101);
    for (let i = 0; i < 100; i++) {
      expect(result.indexOf(i)).toBeLessThan(result.indexOf(i + 1));
    }
  });

  it('wide graph with single root', () => {
    const ts = new TopologicalSort2();
    for (let i = 0; i < 50; i++) {
      ts.addEdge('root', `child-${i}`);
    }
    const result = ts.sort();
    expect(result[0]).toBe('root');
    expect(result).toHaveLength(51);
  });

  it('should report correct nodeCount', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    expect(ts.nodeCount()).toBe(3);
  });

  it('should handle diamond dependency', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');
    ts.addEdge('C', 'D');
    const result = ts.sort();
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('C'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
  });

  it('should handle isolated nodes added separately', () => {
    const ts = new TopologicalSort2();
    ts.addEdge('A', 'B');
    ts.addNode('C');
    const result = ts.sort();
    expect(result).toHaveLength(3);
    expect(result).toContain('C');
  });
});
