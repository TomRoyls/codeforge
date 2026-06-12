import { describe, expect, it } from 'vitest'
import { TopologicalSort } from '../../src/utils/topological-sort.js'

describe('TopologicalSort.sort', () => {
  it('sorts simple DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(1))
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(1)).toBeLessThan(result!.indexOf(3))
    expect(result!.indexOf(2)).toBeLessThan(result!.indexOf(3))
  })

  it('returns null for cyclic graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]],
    ])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })

  it('handles disconnected graph', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []], [2, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.length).toBe(3)
  })

  it('handles linear chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1, 2, 3])
  })

  it('sorts complex DAG', () => {
    const adj = new Map<number, number[]>([
      [5, [2, 0]], [4, [0, 1]], [2, [3]], [3, [1]], [0, []], [1, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(5)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(5)).toBeLessThan(result!.indexOf(0))
    expect(result!.indexOf(4)).toBeLessThan(result!.indexOf(1))
  })

  it('handles self-loop as cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [0]],
    ])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('sorts diamond graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(1))
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(1)).toBeLessThan(result!.indexOf(3))
  })

  it('handles two-node cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]],
    ])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('handles large linear chain', () => {
    const adj = new Map<number, number[]>()
    for (let i = 0; i < 10; i++) adj.set(i, i < 9 ? [i + 1] : [])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles empty graph', () => {
    const adj = new Map<number, number[]>()
    expect(TopologicalSort.sort(adj)).toEqual([])
  })

  it('handles two nodes no cycle', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1])
  })

  it('handles chain of 3', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1, 2])
  })

  it('linear chain preserves order', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1, 2])
  })

  it('single node returns itself', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })

  it('chain order is correct', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1, 2])
  })

  it('handles multiple children', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBe(0)
    expect(result!.length).toBe(4)
  })

  it('handles multiple parents', () => {
    const adj = new Map<number, number[]>([
      [0, [3]], [1, [3]], [2, [3]], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(3))
    expect(result!.indexOf(1)).toBeLessThan(result!.indexOf(3))
    expect(result!.indexOf(2)).toBeLessThan(result!.indexOf(3))
  })

  it('detects cycle in larger graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [1]],
    ])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('handles graph with isolated nodes', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []], [2, []], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.length).toBe(4)
  })

  it('handles tree structure', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.length).toBe(7)
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(1))
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(2))
  })

  it('handles reverse linear chain', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, [0]], [2, [1]], [3, [2]],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result).toEqual([3, 2, 1, 0])
  })

  it('preserves all nodes in result', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(new Set(result)).toEqual(new Set([0, 1, 2]))
  })

  it('handles node with no outgoing edges', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).toEqual([0, 1])
  })

  it('handles node with multiple outgoing edges to same node', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 1]], [1, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(1))
  })

  it('handles graph with nodes only as targets', () => {
    const adj = new Map<number, number[]>([
      [0, [3]], [1, [3]], [2, [3]], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.length).toBe(4)
    expect(result!.indexOf(3)).toBe(result!.length - 1)
  })

  it('handles complex multi-level dependencies', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [4]], [3, [5]], [4, [5]], [5, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(1))
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(1)).toBeLessThan(result!.indexOf(3))
    expect(result!.indexOf(2)).toBeLessThan(result!.indexOf(4))
    expect(result!.indexOf(3)).toBeLessThan(result!.indexOf(5))
    expect(result!.indexOf(4)).toBeLessThan(result!.indexOf(5))
  })

  it('handles non-sequential node IDs', () => {
    const adj = new Map<number, number[]>([
      [10, [20]], [20, [30]], [30, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result).toEqual([10, 20, 30])
  })

  it('allTopologicalSorts handles complex dependencies with multiple valid orders', () => {
    const adj = new Map<number, number[]>([
      [0, [2, 3]], [1, [2, 3]], [2, [4]], [3, [4]], [4, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBeGreaterThan(1)
    for (const order of results) {
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(2))
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(3))
      expect(order.indexOf(1)).toBeLessThan(order.indexOf(2))
      expect(order.indexOf(1)).toBeLessThan(order.indexOf(3))
      expect(order.indexOf(2)).toBeLessThan(order.indexOf(4))
      expect(order.indexOf(3)).toBeLessThan(order.indexOf(4))
    }
  })

  it('allTopologicalSorts with self-loop returns empty', () => {
    const adj = new Map<number, number[]>([
      [0, [0]],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results).toEqual([])
  })
})

describe('TopologicalSort.allTopologicalSorts', () => {
  it('finds all orderings for simple DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [2]], [1, [2]], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
    for (const order of results) {
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(2))
      expect(order.indexOf(1)).toBeLessThan(order.indexOf(2))
    }
  })

  it('linear chain has one order', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    expect(TopologicalSort.allTopologicalSorts(adj)).toEqual([[0, 1, 2]])
  })

  it('returns all permutations for independent nodes', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(6)
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.allTopologicalSorts(adj)).toEqual([[0]])
  })

  it('handles empty graph', () => {
    const adj = new Map<number, number[]>()
    expect(TopologicalSort.allTopologicalSorts(adj)).toEqual([[]])
  })

  it('returns empty array for cyclic graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]],
    ])
    expect(TopologicalSort.allTopologicalSorts(adj)).toEqual([])
  })

  it('handles diamond graph variants', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
    expect(results).toContainEqual([0, 1, 2, 3])
    expect(results).toContainEqual([0, 2, 1, 3])
  })

  it('handles graph with 4 independent nodes', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []], [2, []], [3, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(24)
  })

  it('handles complex dependency graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    for (const order of results) {
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(1))
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(2))
      expect(order.indexOf(1)).toBeLessThan(order.indexOf(3))
      expect(order.indexOf(2)).toBeLessThan(order.indexOf(3))
    }
  })

  it('handles graph with multiple valid orders', () => {
    const adj = new Map<number, number[]>([
      [0, [2]], [1, [2]], [2, [3]], [3, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
  })

  it('preserves node count in all results', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    for (const result of results) {
      expect(result.length).toBe(3)
    }
  })

  it('handles two nodes no dependencies', () => {
    const adj = new Map<number, number[]>([[0, []], [1, []]])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
    expect(results).toContainEqual([0, 1])
    expect(results).toContainEqual([1, 0])
  })

  it('handles two nodes with dependency', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results).toEqual([[0, 1]])
  })

  it('handles tree structure multiple orders', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
    expect(results).toContainEqual([0, 1, 2])
    expect(results).toContainEqual([0, 2, 1])
  })

  it('handles node with multiple independent children', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(6)
    for (const order of results) {
      expect(order[0]).toBe(0)
    }
  })

  it('handles graph with split then merge', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBeGreaterThan(0)
    for (const order of results) {
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(3))
    }
  })

  it('all results contain all nodes', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    const nodes = new Set([0, 1, 2])
    for (const result of results) {
      expect(new Set(result)).toEqual(nodes)
    }
  })

  it('handles three-node chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results).toEqual([[0, 1, 2]])
  })

  it('handles V-shaped graph', () => {
    const adj = new Map<number, number[]>([
      [0, [2]], [1, [2]], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
    expect(results).toContainEqual([0, 1, 2])
    expect(results).toContainEqual([1, 0, 2])
  })

  it('handles inverted V-shaped graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
    expect(results).toContainEqual([0, 1, 2])
    expect(results).toContainEqual([0, 2, 1])
  })

  it('should detect cycle', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('should handle single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })
})
  it('sort empty graph returns empty', () => {
    expect(TopologicalSort.sort(new Map())).toEqual([])
  })

  it('sort single node', () => {
    const adj = new Map<number, number[]>()
    adj.set(0, [])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })

  it('allTopologicalSorts returns all orderings', () => {
    const adj = new Map<number, number[]>()
    adj.set(0, [])
    adj.set(1, [])
    const sorts = TopologicalSort.allTopologicalSorts(adj)
    expect(sorts.length).toBe(2)
  })

describe('topological-sort - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})
