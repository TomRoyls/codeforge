import { describe, it, expect } from 'vitest';
import { GraphColoring2 } from '../../src/core/graph-coloring-2/index.js';

// ─── Constructor ───
describe('GraphColoring2 constructor', () => {
  it('creates an instance', () => {
    const gc = new GraphColoring2();
    expect(gc).toBeInstanceOf(GraphColoring2);
  });
});

// ─── colorGreedy ───
describe('GraphColoring2 colorGreedy', () => {
  it('colors an empty graph', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    const result = gc.colorGreedy(adj);
    expect(result.size).toBe(0);
  });

  it('colors a single vertex', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', []);
    const result = gc.colorGreedy(adj);
    expect(result.get('A')).toBe(0);
  });

  it('colors two disconnected vertices with same color', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', []);
    adj.set('B', []);
    const result = gc.colorGreedy(adj);
    expect(result.get('A')).toBe(0);
    expect(result.get('B')).toBe(0);
  });

  it('colors two connected vertices with different colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A']);
    const result = gc.colorGreedy(adj);
    expect(result.get('A')).not.toBe(result.get('B'));
  });

  it('colors a triangle with 3 colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B', 'C']);
    adj.set('B', ['A', 'C']);
    adj.set('C', ['A', 'B']);
    const result = gc.colorGreedy(adj);
    expect(gc.getColorCount(result)).toBe(3);
    expect(gc.isValid(adj, result)).toBe(true);
  });

  it('colors a path graph with 2 colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A', 'C']);
    adj.set('C', ['B']);
    const result = gc.colorGreedy(adj);
    expect(gc.getColorCount(result)).toBe(2);
    expect(gc.isValid(adj, result)).toBe(true);
  });

  it('assigns color 0 to first vertex', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('X', []);
    expect(gc.colorGreedy(adj).get('X')).toBe(0);
  });
});

// ─── colorBacktracking ───
describe('GraphColoring2 colorBacktracking', () => {
  it('returns null if not enough colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A']);
    const result = gc.colorBacktracking(adj, 1);
    expect(result).toBeNull();
  });

  it('colors a graph with exactly enough colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A']);
    const result = gc.colorBacktracking(adj, 2);
    expect(result).not.toBeNull();
    expect(gc.isValid(adj, result!)).toBe(true);
  });

  it('colors empty graph with 0 colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    const result = gc.colorBacktracking(adj, 0);
    expect(result).not.toBeNull();
    expect(result!.size).toBe(0);
  });

  it('colors single vertex with 1 color', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', []);
    const result = gc.colorBacktracking(adj, 1);
    expect(result).not.toBeNull();
    expect(result!.get('A')).toBe(0);
  });

  it('colors triangle with 3 colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B', 'C']);
    adj.set('B', ['A', 'C']);
    adj.set('C', ['A', 'B']);
    const result = gc.colorBacktracking(adj, 3);
    expect(result).not.toBeNull();
    expect(gc.isValid(adj, result!)).toBe(true);
  });

  it('returns null for triangle with 2 colors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B', 'C']);
    adj.set('B', ['A', 'C']);
    adj.set('C', ['A', 'B']);
    const result = gc.colorBacktracking(adj, 2);
    expect(result).toBeNull();
  });
});

// ─── chromaticNumber ───
describe('GraphColoring2 chromaticNumber', () => {
  it('returns 0 for empty graph', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    expect(gc.chromaticNumber(adj)).toBe(0);
  });

  it('returns 1 for graph with no edges', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', []);
    adj.set('B', []);
    expect(gc.chromaticNumber(adj)).toBe(1);
  });

  it('returns 2 for bipartite graph', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A']);
    expect(gc.chromaticNumber(adj)).toBe(2);
  });

  it('returns 3 for triangle', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B', 'C']);
    adj.set('B', ['A', 'C']);
    adj.set('C', ['A', 'B']);
    expect(gc.chromaticNumber(adj)).toBe(3);
  });

  it('returns 2 for a path of 4 vertices', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A', 'C']);
    adj.set('C', ['B', 'D']);
    adj.set('D', ['C']);
    expect(gc.chromaticNumber(adj)).toBe(2);
  });
});

// ─── isValid ───
describe('GraphColoring2 isValid', () => {
  it('returns true for valid coloring', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A']);
    const coloring = new Map<string, number>();
    coloring.set('A', 0);
    coloring.set('B', 1);
    expect(gc.isValid(adj, coloring)).toBe(true);
  });

  it('returns false for invalid coloring', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', ['A']);
    const coloring = new Map<string, number>();
    coloring.set('A', 0);
    coloring.set('B', 0);
    expect(gc.isValid(adj, coloring)).toBe(false);
  });

  it('returns false if vertex is missing from coloring', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', []);
    const coloring = new Map<string, number>();
    expect(gc.isValid(adj, coloring)).toBe(false);
  });

  it('ignores uncolored neighbors', () => {
    const gc = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('A', ['B']);
    adj.set('B', []);
    const coloring = new Map<string, number>();
    coloring.set('A', 0);
    expect(gc.isValid(adj, coloring)).toBe(false);
  });
});

// ─── getColorCount ───
describe('GraphColoring2 getColorCount', () => {
  it('counts unique colors', () => {
    const gc = new GraphColoring2();
    const coloring = new Map<string, number>();
    coloring.set('A', 0);
    coloring.set('B', 1);
    coloring.set('C', 0);
    expect(gc.getColorCount(coloring)).toBe(2);
  });

  it('returns 0 for empty coloring', () => {
    const gc = new GraphColoring2();
    expect(gc.getColorCount(new Map())).toBe(0);
  });
});
