import { describe, it, expect } from 'vitest';
import { TopologicalQueue2 } from '../src/core/topological-queue-2/index.js';

describe('TopologicalQueue2', () => {
  it('simple DAG', () => {
    const ts = new TopologicalQueue2();
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
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'D');

    const result = ts.sort();
    expect(result).toHaveLength(4);
    expect(result).toEqual(['A', 'B', 'C', 'D']);
  });

  it('diamond shape', () => {
    const ts = new TopologicalQueue2();
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

  it('multiple roots', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'D');

    const result = ts.sort();
    expect(result).toHaveLength(4);
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
    expect(result).toContain('A');
    expect(result).toContain('B');
  });

  it('cycle detection in sort', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');

    expect(() => ts.sort()).toThrow('Graph contains a cycle');
  });

  it('self-loop cycle', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'A');

    expect(() => ts.sort()).toThrow('Graph contains a cycle');
  });

  it('hasCycle false for DAG', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('A', 'C');

    expect(ts.hasCycle()).toBe(false);
  });

  it('hasCycle true with cycle', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');

    expect(ts.hasCycle()).toBe(true);
  });

  it('hasCycle true with self-loop', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'A');

    expect(ts.hasCycle()).toBe(true);
  });

  it('sort order verification', () => {
    const ts = new TopologicalQueue2();
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

  it('addNode adds new node', () => {
    const ts = new TopologicalQueue2();
    ts.addNode('A');
    ts.addNode('B');
    ts.addNode('C');

    const nodes = ts.getNodes();
    expect(nodes).toHaveLength(3);
    expect(nodes).toContain('A');
    expect(nodes).toContain('B');
    expect(nodes).toContain('C');
  });

  it('addNode duplicate does not add again', () => {
    const ts = new TopologicalQueue2();
    ts.addNode('A');
    ts.addNode('A');
    ts.addNode('A');

    expect(ts.getNodes()).toHaveLength(1);
  });

  it('addEdge creates nodes automatically', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');

    expect(ts.getNodes()).toHaveLength(2);
    expect(ts.getNodes()).toContain('A');
    expect(ts.getNodes()).toContain('B');
  });

  it('addEdge duplicate does not add again', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'B');

    expect(ts.getEdges()).toHaveLength(1);
  });

  it('getNodes returns all nodes', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('A', 'C');

    const nodes = ts.getNodes();
    expect(nodes).toHaveLength(3);
    expect(nodes).toContain('A');
    expect(nodes).toContain('B');
    expect(nodes).toContain('C');
  });

  it('getEdges returns all edges', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');

    const edges = ts.getEdges();
    expect(edges).toHaveLength(3);
    expect(edges).toContainEqual({from: 'A', to: 'B'});
    expect(edges).toContainEqual({from: 'A', to: 'C'});
    expect(edges).toContainEqual({from: 'B', to: 'D'});
  });

  it('inDegree returns correct indegree', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'C');

    expect(ts.inDegree('A')).toBe(0);
    expect(ts.inDegree('B')).toBe(1);
    expect(ts.inDegree('C')).toBe(2);
  });

  it('inDegree returns 0 for non-existent node', () => {
    const ts = new TopologicalQueue2();
    expect(ts.inDegree('A')).toBe(0);
  });

  it('outDegree returns correct outdegree', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'C');

    expect(ts.outDegree('A')).toBe(2);
    expect(ts.outDegree('B')).toBe(1);
    expect(ts.outDegree('C')).toBe(0);
  });

  it('outDegree returns 0 for non-existent node', () => {
    const ts = new TopologicalQueue2();
    expect(ts.outDegree('A')).toBe(0);
  });

  it('clear removes all nodes and edges', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('A', 'C');

    ts.clear();

    expect(ts.getNodes()).toHaveLength(0);
    expect(ts.getEdges()).toHaveLength(0);
    expect(ts.sort()).toEqual([]);
    expect(ts.hasCycle()).toBe(false);
  });

  it('disconnected components', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('C', 'D');
    ts.addEdge('E', 'F');

    const result = ts.sort();
    expect(result).toHaveLength(6);
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('E')).toBeLessThan(result.indexOf('F'));
  });

  it('single node', () => {
    const ts = new TopologicalQueue2();
    ts.addNode('A');

    expect(ts.sort()).toEqual(['A']);
    expect(ts.hasCycle()).toBe(false);
  });

  it('empty graph', () => {
    const ts = new TopologicalQueue2();

    expect(ts.getNodes()).toHaveLength(0);
    expect(ts.getEdges()).toHaveLength(0);
    expect(ts.sort()).toEqual([]);
    expect(ts.hasCycle()).toBe(false);
  });

  it('complex DAG', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    ts.addEdge('B', 'D');
    ts.addEdge('C', 'D');
    ts.addEdge('D', 'E');
    ts.addEdge('D', 'F');
    ts.addEdge('E', 'G');
    ts.addEdge('F', 'G');

    const result = ts.sort();
    expect(result).toHaveLength(7);
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'));
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('C'));
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('C')).toBeLessThan(result.indexOf('D'));
    expect(result.indexOf('D')).toBeLessThan(result.indexOf('E'));
    expect(result.indexOf('D')).toBeLessThan(result.indexOf('F'));
    expect(result.indexOf('E')).toBeLessThan(result.indexOf('G'));
    expect(result.indexOf('F')).toBeLessThan(result.indexOf('G'));
  });

  it('two-node cycle', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'A');

    expect(() => ts.sort()).toThrow('Graph contains a cycle');
    expect(ts.hasCycle()).toBe(true);
  });

  it('three-node cycle', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');

    expect(() => ts.sort()).toThrow('Graph contains a cycle');
    expect(ts.hasCycle()).toBe(true);
  });

  it('cycle with multiple components', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');
    ts.addEdge('D', 'E');

    expect(() => ts.sort()).toThrow('Graph contains a cycle');
    expect(ts.hasCycle()).toBe(true);
  });

  it('getNodes and getEdges consistency', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('A', 'C');

    const nodes = ts.getNodes();
    const edges = ts.getEdges();

    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(3);

    for (const edge of edges) {
      expect(nodes).toContain(edge.from);
      expect(nodes).toContain(edge.to);
    }
  });

  it('clear and rebuild', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');

    ts.clear();

    ts.addEdge('X', 'Y');
    ts.addEdge('Y', 'Z');

    expect(ts.getNodes()).toHaveLength(3);
    expect(ts.getNodes()).toContain('X');
    expect(ts.getNodes()).toContain('Y');
    expect(ts.getNodes()).toContain('Z');
    expect(ts.sort()).toEqual(['X', 'Y', 'Z']);
  });

  it('should handle cycle detection', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');
    expect(ts.hasCycle()).toBe(true);
  });

  it('should report inDegree and outDegree', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('A', 'C');
    expect(ts.inDegree('A')).toBe(0);
    expect(ts.outDegree('A')).toBe(2);
    expect(ts.inDegree('B')).toBe(1);
    expect(ts.outDegree('B')).toBe(0);
  });

  it('should handle clear', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.clear();
    expect(ts.getNodes()).toEqual([]);
    expect(ts.getEdges()).toEqual([]);
  });

  it('should handle getEdges', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    const edges = ts.getEdges();
    expect(edges).toHaveLength(2);
  });

  it('should handle addNode explicitly', () => {
    const ts = new TopologicalQueue2();
    ts.addNode('X');
    ts.addNode('Y');
    ts.addEdge('X', 'Y');
    expect(ts.sort()).toEqual(['X', 'Y']);
    expect(ts.getNodes()).toContain('X');
    expect(ts.getNodes()).toContain('Y');
  });

  it('should handle single node sort', () => {
    const ts = new TopologicalQueue2();
    ts.addNode('A');
    expect(ts.sort()).toEqual(['A']);
  });

  it('should handle empty graph sort', () => {
    const ts = new TopologicalQueue2();
    expect(ts.sort()).toEqual([]);
  });

  it('should detect cycle', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    ts.addEdge('C', 'A');
    expect(ts.hasCycle()).toBe(true);
  });

  it('should handle acyclic graph sort', () => {
    const ts = new TopologicalQueue2();
    ts.addEdge('A', 'B');
    ts.addEdge('B', 'C');
    expect(ts.hasCycle()).toBe(false);
    const sorted = ts.sort();
    expect(sorted.length).toBe(3);
  });

  it('should handle getNodes', () => {
    const ts = new TopologicalQueue2();
    ts.addNode('A');
    ts.addNode('B');
    ts.addNode('C');
    const nodes = ts.getNodes();
    expect(nodes.length).toBe(3);
  });
});
