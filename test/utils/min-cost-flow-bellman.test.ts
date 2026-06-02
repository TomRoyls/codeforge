import { describe, expect, it } from 'vitest'
import { MinCostFlow } from '../../src/utils/min-cost-flow-bellman.js'

describe('MinCostFlow', () => {
  it('finds min cost for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3, cost: 1 },
      { from: 1, to: 2, capacity: 3, cost: 2 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 2, 3)
    expect(maxFlow).toBe(3)
    expect(minCost).toBe(9)
  })

  it('chooses cheaper path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5, cost: 10 },
      { from: 0, to: 2, capacity: 5, cost: 1 },
      { from: 1, to: 3, capacity: 5, cost: 1 },
      { from: 2, to: 3, capacity: 5, cost: 1 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 3, 4)
    expect(maxFlow).toBe(10)
    expect(minCost).toBe(5 * 1 + 5 * 1 + 5 * 10 + 5 * 1)
  })

  it('handles disconnected graph', () => {
    const edges = [{ from: 0, to: 1, capacity: 5, cost: 1 }]
    const { maxFlow } = MinCostFlow.minCostMaxFlow(edges, 0, 2, 3)
    expect(maxFlow).toBe(0)
  })

  it('handles source = sink', () => {
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow([], 0, 0, 1)
    expect(maxFlow).toBe(0)
    expect(minCost).toBe(0)
  })

  it('handles zero capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 0, cost: 5 }]
    const { maxFlow } = MinCostFlow.minCostMaxFlow(edges, 0, 1, 2)
    expect(maxFlow).toBe(0)
  })

  it('single edge flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 10, cost: 3 }]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 1, 2)
    expect(maxFlow).toBe(10)
    expect(minCost).toBe(30)
  })

  it('handles diamond with costs', () => {
    const edges = [
      { from: 0, to: 1, capacity: 2, cost: 1 },
      { from: 0, to: 2, capacity: 2, cost: 5 },
      { from: 1, to: 3, capacity: 2, cost: 1 },
      { from: 2, to: 3, capacity: 2, cost: 1 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 3, 4)
    expect(maxFlow).toBe(4)
    expect(minCost).toBe(2 * 1 + 2 * 1 + 2 * 5 + 2 * 1)
  })

  it('handles linear chain with costs', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5, cost: 2 },
      { from: 1, to: 2, capacity: 3, cost: 3 },
      { from: 2, to: 3, capacity: 4, cost: 1 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 3, 4)
    expect(maxFlow).toBe(3)
    expect(minCost).toBe(3 * (2 + 3 + 1))
  })

  it('handles uniform cost', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5, cost: 1 },
      { from: 1, to: 2, capacity: 5, cost: 1 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 2, 3)
    expect(maxFlow).toBe(5)
    expect(minCost).toBe(10)
  })

  it('handles parallel edges with different costs', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3, cost: 1 },
      { from: 0, to: 1, capacity: 2, cost: 5 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 1, 2)
    expect(maxFlow).toBe(5)
    expect(minCost).toBe(3 * 1 + 2 * 5)
  })

  it('handles back edge saturation', () => {
    const edges = [
      { from: 0, to: 1, capacity: 2, cost: 1 },
      { from: 0, to: 2, capacity: 2, cost: 100 },
      { from: 1, to: 3, capacity: 1, cost: 1 },
      { from: 1, to: 2, capacity: 1, cost: 1 },
      { from: 2, to: 3, capacity: 3, cost: 1 },
    ]
    const { maxFlow } = MinCostFlow.minCostMaxFlow(edges, 0, 3, 4)
    expect(maxFlow).toBe(4)
  })

  it('handles single node graph', () => {
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow([], 0, 0, 0)
    expect(maxFlow).toBe(0)
    expect(minCost).toBe(0)
  })

  it('handles disconnected source-sink', () => {
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow([
      { from: 1, to: 2, capacity: 5, cost: 1 },
    ], 0, 3, 4)
    expect(maxFlow).toBe(0)
    expect(minCost).toBe(0)
  })

  it('handles single edge', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10, cost: 3 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 1, 2)
    expect(maxFlow).toBe(10)
    expect(minCost).toBe(30)
  })

  it('handles zero cost edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5, cost: 0 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 1, 2)
    expect(maxFlow).toBe(5)
    expect(minCost).toBe(0)
  })

  it('handles diamond min cost', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5, cost: 1 },
      { from: 0, to: 2, capacity: 5, cost: 10 },
      { from: 1, to: 3, capacity: 5, cost: 1 },
      { from: 2, to: 3, capacity: 5, cost: 1 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 3, 4)
    expect(maxFlow).toBe(10)
    expect(minCost).toBeGreaterThanOrEqual(0)
  })

  it('handles single edge', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5, cost: 2 },
    ]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 1, 2)
    expect(maxFlow).toBe(5)
    expect(minCost).toBe(10)
  })

  it('no path gives zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 5, cost: 1 }]
    const { maxFlow } = MinCostFlow.minCostMaxFlow(edges, 1, 0, 2)
    expect(maxFlow).toBe(0)
  })

  it('single edge flow equals capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 10, cost: 1 }]
    const { maxFlow, minCost } = MinCostFlow.minCostMaxFlow(edges, 0, 1, 2)
    expect(maxFlow).toBe(10)
    expect(minCost).toBe(10)
  })

  it('no path has zero flow', () => {
    const edges = [{ from: 0, to: 1, capacity: 10, cost: 1 }]
    const { maxFlow } = MinCostFlow.minCostMaxFlow(edges, 1, 0, 2)
    expect(maxFlow).toBe(0)
  })
})
