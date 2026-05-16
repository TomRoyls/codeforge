import { describe, it, expect } from 'vitest';
import { GraphColoring2 } from '../src/core/graph-coloring-2/index.js';

describe('GraphColoring2', () => {
  describe('colorGreedy', () => {
    it('colors empty graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>();
      const result = graph.colorGreedy(adjacencyList);

      expect(result.size).toBe(0);
      expect(graph.getColorCount(result)).toBe(0);
    });

    it('colors single vertex', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([['A', []]]);
      const result = graph.colorGreedy(adjacencyList);

      expect(result.get('A')).toBe(0);
      expect(graph.getColorCount(result)).toBe(1);
      expect(graph.isValid(adjacencyList, result)).toBe(true);
    });

    it('colors path graph with 3 vertices', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A', 'C']],
        ['C', ['B']]
      ]);
      const result = graph.colorGreedy(adjacencyList);

      expect(graph.isValid(adjacencyList, result)).toBe(true);
      expect(graph.getColorCount(result)).toBe(2);
    });

    it('colors star graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['center', ['A', 'B', 'C', 'D']],
        ['A', ['center']],
        ['B', ['center']],
        ['C', ['center']],
        ['D', ['center']]
      ]);
      const result = graph.colorGreedy(adjacencyList);

      expect(graph.isValid(adjacencyList, result)).toBe(true);
      expect(graph.getColorCount(result)).toBe(2);
    });

    it('colors complete graph K4', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B', 'C', 'D']],
        ['B', ['A', 'C', 'D']],
        ['C', ['A', 'B', 'D']],
        ['D', ['A', 'B', 'C']]
      ]);
      const result = graph.colorGreedy(adjacencyList);

      expect(graph.isValid(adjacencyList, result)).toBe(true);
      expect(graph.getColorCount(result)).toBe(4);
    });

    it('colors bipartite graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['C', 'D']],
        ['B', ['C', 'D']],
        ['C', ['A', 'B']],
        ['D', ['A', 'B']]
      ]);
      const result = graph.colorGreedy(adjacencyList);

      expect(graph.isValid(adjacencyList, result)).toBe(true);
      expect(graph.getColorCount(result)).toBeLessThanOrEqual(2);
    });

    it('colors disconnected graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A']],
        ['C', ['D']],
        ['D', ['C']]
      ]);
      const result = graph.colorGreedy(adjacencyList);

      expect(graph.isValid(adjacencyList, result)).toBe(true);
      expect(result.get('A')).not.toBe(result.get('B'));
      expect(result.get('C')).not.toBe(result.get('D'));
    });
  });

  describe('colorBacktracking', () => {
    it('returns empty coloring for empty graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>();
      const result = graph.colorBacktracking(adjacencyList, 0);

      expect(result).not.toBeNull();
      expect(result?.size).toBe(0);
    });

    it('colors single vertex with 1 color', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([['A', []]]);
      const result = graph.colorBacktracking(adjacencyList, 1);

      expect(result).not.toBeNull();
      expect(result?.get('A')).toBe(0);
      expect(graph.isValid(adjacencyList, result!)).toBe(true);
    });

    it('fails with insufficient colors for K4', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B', 'C', 'D']],
        ['B', ['A', 'C', 'D']],
        ['C', ['A', 'B', 'D']],
        ['D', ['A', 'B', 'C']]
      ]);

      expect(graph.colorBacktracking(adjacencyList, 3)).toBeNull();
      expect(graph.colorBacktracking(adjacencyList, 2)).toBeNull();
      expect(graph.colorBacktracking(adjacencyList, 1)).toBeNull();
    });

    it('colors K4 with 4 colors', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B', 'C', 'D']],
        ['B', ['A', 'C', 'D']],
        ['C', ['A', 'B', 'D']],
        ['D', ['A', 'B', 'C']]
      ]);
      const result = graph.colorBacktracking(adjacencyList, 4);

      expect(result).not.toBeNull();
      expect(graph.isValid(adjacencyList, result!)).toBe(true);
      expect(graph.getColorCount(result!)).toBe(4);
    });

    it('colors bipartite graph with 2 colors', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['C', 'D']],
        ['B', ['C', 'D']],
        ['C', ['A', 'B']],
        ['D', ['A', 'B']]
      ]);
      const result = graph.colorBacktracking(adjacencyList, 2);

      expect(result).not.toBeNull();
      expect(graph.isValid(adjacencyList, result!)).toBe(true);
      expect(graph.getColorCount(result!)).toBeLessThanOrEqual(2);
    });

    it('colors disconnected graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A']],
        ['C', ['D']],
        ['D', ['C']]
      ]);
      const result = graph.colorBacktracking(adjacencyList, 2);

      expect(result).not.toBeNull();
      expect(graph.isValid(adjacencyList, result!)).toBe(true);
    });
  });

  describe('chromaticNumber', () => {
    it('returns 0 for empty graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>();
      const result = graph.chromaticNumber(adjacencyList);

      expect(result).toBe(0);
    });

    it('returns 1 for single vertex', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([['A', []]]);
      const result = graph.chromaticNumber(adjacencyList);

      expect(result).toBe(1);
    });

    it('returns 2 for path graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A', 'C']],
        ['C', ['B']]
      ]);
      const result = graph.chromaticNumber(adjacencyList);

      expect(result).toBe(2);
    });

    it('returns 2 for bipartite graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['C', 'D']],
        ['B', ['C', 'D']],
        ['C', ['A', 'B']],
        ['D', ['A', 'B']]
      ]);
      const result = graph.chromaticNumber(adjacencyList);

      expect(result).toBe(2);
    });

    it('returns 4 for complete graph K4', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B', 'C', 'D']],
        ['B', ['A', 'C', 'D']],
        ['C', ['A', 'B', 'D']],
        ['D', ['A', 'B', 'C']]
      ]);
      const result = graph.chromaticNumber(adjacencyList);

      expect(result).toBe(4);
    });

    it('returns 2 for star graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['center', ['A', 'B', 'C', 'D']],
        ['A', ['center']],
        ['B', ['center']],
        ['C', ['center']],
        ['D', ['center']]
      ]);
      const result = graph.chromaticNumber(adjacencyList);

      expect(result).toBe(2);
    });
  });

  describe('isValid', () => {
    it('validates empty coloring', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([['A', ['B']], ['B', ['A']]]);
      const coloring = new Map<string, number>();

      expect(graph.isValid(adjacencyList, coloring)).toBe(false);
    });

    it('validates proper coloring', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A', 'C']],
        ['C', ['B']]
      ]);
      const coloring = new Map<string, number>([
        ['A', 0],
        ['B', 1],
        ['C', 0]
      ]);

      expect(graph.isValid(adjacencyList, coloring)).toBe(true);
    });

    it('detects invalid coloring', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A', 'C']],
        ['C', ['B']]
      ]);
      const coloring = new Map<string, number>([
        ['A', 0],
        ['B', 0],
        ['C', 0]
      ]);

      expect(graph.isValid(adjacencyList, coloring)).toBe(false);
    });

    it('detects missing vertex', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>([
        ['A', ['B']],
        ['B', ['A', 'C']],
        ['C', ['B']]
      ]);
      const coloring = new Map<string, number>([
        ['A', 0],
        ['B', 1]
      ]);

      expect(graph.isValid(adjacencyList, coloring)).toBe(false);
    });

    it('validates empty graph', () => {
      const graph = new GraphColoring2();
      const adjacencyList = new Map<string, string[]>();
      const coloring = new Map<string, number>();

      expect(graph.isValid(adjacencyList, coloring)).toBe(true);
    });
  });

  describe('getColorCount', () => {
    it('returns 0 for empty coloring', () => {
      const graph = new GraphColoring2();
      const coloring = new Map<string, number>();

      expect(graph.getColorCount(coloring)).toBe(0);
    });

    it('returns 1 for single color', () => {
      const graph = new GraphColoring2();
      const coloring = new Map<string, number>([
        ['A', 0],
        ['B', 0],
        ['C', 0]
      ]);

      expect(graph.getColorCount(coloring)).toBe(1);
    });

    it('returns correct count for multiple colors', () => {
      const graph = new GraphColoring2();
      const coloring = new Map<string, number>([
        ['A', 0],
        ['B', 1],
        ['C', 0],
        ['D', 2]
      ]);

      expect(graph.getColorCount(coloring)).toBe(3);
    });

    it('handles non-sequential colors', () => {
      const graph = new GraphColoring2();
      const coloring = new Map<string, number>([
        ['A', 0],
        ['B', 5],
        ['C', 10]
      ]);

      expect(graph.getColorCount(coloring)).toBe(3);
    });
  });

  describe('additional coverage', () => {
    it('handles single node graph', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', []]]);
      const result = graph.colorGreedy(adj);
      expect(result.get('A')).toBeGreaterThanOrEqual(0);
    });

    it('handles disconnected graph', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', []], ['B', []], ['C', []]]);
      const result = graph.colorGreedy(adj);
      expect(result.size).toBe(3);
    });

    it('validates correct coloring', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A']]]);
      const coloring = new Map<string, number>([['A', 0], ['B', 1]]);
      expect(graph.isValid(adj, coloring)).toBe(true);
    });

    it('chromatic number for triangle graph is 3', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', ['B', 'C']], ['B', ['A', 'C']], ['C', ['A', 'B']]]);
      expect(graph.chromaticNumber(adj)).toBe(3);
    });

    it('colorGreedy handles path graph correctly', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A', 'C']], ['C', ['B']]]);
      const result = graph.colorGreedy(adj);
      expect(result.size).toBe(3);
      expect(graph.isValid(adj, result)).toBe(true);
    });

    it('colorBacktracking with limited colors', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A']]]);
      const result = graph.colorBacktracking(adj, 2);
      expect(result).not.toBeNull();
    });

    it('handles linear graph coloring', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A', 'C']], ['C', ['B']], ['D', ['C']], ['C', ['D']]]);
      const result = graph.colorGreedy(adj);
      expect(graph.isValid(adj, result)).toBe(true);
    });

    it('handles empty graph', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>();
      const result = graph.colorGreedy(adj);
      expect(result.size).toBe(0);
    });

    it('handles single vertex', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', []]]);
      const colored = graph.colorGreedy(adj);
      expect(colored.get('A')).toBe(0);
    });

    it('handles two vertex graph', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A']]]);
      const colored = graph.colorGreedy(adj);
      expect(graph.isValid(adj, colored)).toBe(true);
    });

    it('should handle chromaticNumber', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A']]]);
      const cn = graph.chromaticNumber(adj);
      expect(cn).toBeGreaterThanOrEqual(1);
    });

    it('handles three-color graph', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>([
        ['A', ['B', 'C']], ['B', ['A', 'C']], ['C', ['A', 'B']]
      ]);
      const colored = graph.colorGreedy(adj);
      expect(graph.isValid(adj, colored)).toBe(true);
    });

    it('handles empty graph', () => {
      const graph = new GraphColoring2();
      const adj = new Map<string, string[]>();
      const colored = graph.colorGreedy(adj);
      expect(colored.size).toBe(0);
    });
  });

  it('should handle getColorCount', () => {
    const graph = new GraphColoring2();
    const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A']]]);
    const colored = graph.colorGreedy(adj);
    expect(graph.getColorCount(colored)).toBeGreaterThanOrEqual(2);
  });
  it('should handle colorBacktracking', () => {
    const graph = new GraphColoring2();
    const adj = new Map<string, string[]>([['A', ['B']], ['B', ['A']]]);
    const colored = graph.colorBacktracking(adj, 2);
    expect(colored).not.toBeNull();
    expect(graph.getColorCount(colored!)).toBeGreaterThanOrEqual(2);
  });
  it('should handle single vertex graph', () => {
    const graph = new GraphColoring2();
    const adj = new Map<string, string[]>([['A', []]]);
    const colored = graph.colorGreedy(adj);
    expect(graph.getColorCount(colored)).toBe(1);
  });
  it('should handle empty graph', () => {
    const graph = new GraphColoring2();
    const adj = new Map<string, string[]>();
    const colored = graph.colorGreedy(adj);
    expect(graph.getColorCount(colored)).toBe(0);
  });
  it('should handle single node graph', () => {
    const graph = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('a', []);
    const colored = graph.colorGreedy(adj);
    expect(graph.getColorCount(colored)).toBe(1);
  });
  it('should handle two connected nodes', () => {
    const graph = new GraphColoring2();
    const adj = new Map<string, string[]>();
    adj.set('a', ['b']);
    adj.set('b', ['a']);
    const colored = graph.colorGreedy(adj);
    expect(graph.getColorCount(colored)).toBe(2);
  });
});
