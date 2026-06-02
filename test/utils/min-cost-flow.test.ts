import { describe, it, expect } from 'vitest'
import { MinCostFlow } from '../../src/utils/min-cost-flow.js'

describe('MinCostFlow', () => {
  it('handles simple two-node graph', () => {
    const mcf = new MinCostFlow(2)
    mcf.addEdge(0, 1, 10, 5)

    const result = mcf.solve(0, 1)

    expect(result.flow).toBe(10)
    expect(result.cost).toBe(50)
    expect(mcf.getFlow(0)).toBe(10)
  })

  it('handles linear chain graph', () => {
    const mcf = new MinCostFlow(4)
    mcf.addEdge(0, 1, 5, 2)
    mcf.addEdge(1, 2, 5, 3)
    mcf.addEdge(2, 3, 5, 4)

    const result = mcf.solve(0, 3)

    expect(result.flow).toBe(5)
    expect(result.cost).toBe(5 * (2 + 3 + 4))
    expect(result.cost).toBe(45)
  })

  it('prefers lower cost path when two paths available', () => {
    const mcf = new MinCostFlow(4)
    mcf.addEdge(0, 1, 5, 1)
    mcf.addEdge(0, 2, 5, 100)
    mcf.addEdge(1, 3, 5, 1)
    mcf.addEdge(2, 3, 5, 1)

    const result = mcf.solve(0, 3)

    expect(result.flow).toBe(10)
    expect(result.cost).toBe(515)
    expect(mcf.getFlow(0)).toBe(5)
    expect(mcf.getFlow(3)).toBe(5)
  })

  it('handles diamond graph with bottleneck', () => {
    const mcf = new MinCostFlow(4)
    mcf.addEdge(0, 1, 5, 1)
    mcf.addEdge(0, 2, 5, 1)
    mcf.addEdge(1, 3, 3, 1)
    mcf.addEdge(2, 3, 3, 1)

    const result = mcf.solve(0, 3)

    expect(result.flow).toBe(6)
    expect(result.cost).toBe(12)
  })

  it('respects single edge capacity', () => {
    const mcf = new MinCostFlow(2)
    mcf.addEdge(0, 1, 5, 10)

    const result = mcf.solve(0, 1)

    expect(result.flow).toBe(5)
    expect(result.cost).toBe(50)
  })

  it('handles maxFlow parameter limiting flow', () => {
    const mcf = new MinCostFlow(3)
    mcf.addEdge(0, 1, 10, 2)
    mcf.addEdge(1, 2, 10, 3)

    const result = mcf.solve(0, 2, 5)

    expect(result.flow).toBe(5)
    expect(result.cost).toBe(25)
  })

  it('handles multiple edges between same nodes', () => {
    const mcf = new MinCostFlow(2)
    mcf.addEdge(0, 1, 5, 1)
    mcf.addEdge(0, 1, 5, 10)

    const result = mcf.solve(0, 1)

    expect(result.flow).toBe(10)
    expect(result.cost).toBe(55)
    expect(mcf.getFlow(0)).toBe(5)
    expect(mcf.getFlow(1)).toBe(5)
  })

  it('chooses higher cost alternative path when cheap path saturated', () => {
    const mcf = new MinCostFlow(4)
    mcf.addEdge(0, 1, 5, 1)
    mcf.addEdge(0, 2, 5, 10)
    mcf.addEdge(1, 3, 5, 1)
    mcf.addEdge(2, 3, 5, 1)

    const result = mcf.solve(0, 3, 10)

    expect(result.flow).toBe(10)
    expect(result.cost).toBe(65)
  })

  it('minimizes cost with multiple paths available', () => {
    const mcf = new MinCostFlow(3)
    mcf.addEdge(0, 1, 10, 10)
    mcf.addEdge(1, 2, 10, 10)
    mcf.addEdge(0, 2, 10, 100)

    const result = mcf.solve(0, 2, 10)

    expect(result.flow).toBe(10)
    expect(result.cost).toBe(200)
  })

  it('handles empty graph with no edges', () => {
    const mcf = new MinCostFlow(3)

    const result = mcf.solve(0, 2)

    expect(result.flow).toBe(0)
    expect(result.cost).toBe(0)
  })

  it('handles source equal to sink', () => {
    const mcf = new MinCostFlow(3)
    mcf.addEdge(0, 1, 5, 10)
    mcf.addEdge(1, 2, 5, 10)

    const result = mcf.solve(1, 1)

    expect(result.flow).toBe(0)
    expect(result.cost).toBe(0)
  })

  it('returns zero flow when no path exists', () => {
    const mcf = new MinCostFlow(3)
    mcf.addEdge(0, 1, 5, 10)

    const result = mcf.solve(0, 2)

    expect(result.flow).toBe(0)
    expect(result.cost).toBe(0)
  })

  it('handles large costs correctly', () => {
    const mcf = new MinCostFlow(2)
    mcf.addEdge(0, 1, 1000, 1000)

    const result = mcf.solve(0, 1)

    expect(result.flow).toBe(1000)
    expect(result.cost).toBe(1000000)
  })

  it('handles zero cost edges', () => {
    const mcf = new MinCostFlow(3)
    mcf.addEdge(0, 1, 10, 0)
    mcf.addEdge(1, 2, 10, 0)

    const result = mcf.solve(0, 2)

    expect(result.flow).toBe(10)
    expect(result.cost).toBe(0)
  })

  it('handles reverse flow through residual graph', () => {
    const mcf = new MinCostFlow(3)
    mcf.addEdge(0, 1, 5, 1)
    mcf.addEdge(0, 2, 5, 100)
    mcf.addEdge(1, 2, 5, 1)
    mcf.addEdge(2, 1, 5, 1)

    const result = mcf.solve(0, 2)
    expect(result.flow).toBe(10)
  })

  it('handles disconnected source and sink', () => {
    const mcf = new MinCostFlow(5)
    mcf.addEdge(0, 1, 5, 1)
    mcf.addEdge(3, 4, 5, 1)

    const result = mcf.solve(0, 4)
    expect(result.flow).toBe(0)
    expect(result.cost).toBe(0)
  })

  it('handles single edge', () => {
    const mcf = new MinCostFlow(2)
    mcf.addEdge(0, 1, 5, 2)
    const result = mcf.solve(0, 1)
    expect(result.flow).toBe(5)
    expect(result.cost).toBe(10)
  })

  it('no path gives zero flow', () => {
    const mcf = new MinCostFlow(2)
    mcf.addEdge(0, 1, 5, 2)
    const result = mcf.solve(1, 0)
    expect(result.flow).toBe(0)
  })

  it('single edge with flow', () => {
    const mcf = new MinCostFlow(2)
    mcf.addEdge(0, 1, 5, 1)
    const result = mcf.solve(0, 1)
    expect(result.flow).toBe(5)
  })
})