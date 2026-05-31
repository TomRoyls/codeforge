import { describe, expect, it } from 'vitest'
import { BellmanFord } from '../../src/utils/bellman-ford.js'

describe('BellmanFord', () => {
  it('finds shortest paths in simple graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 3 },
      { from: 2, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 5 },
    ]
    const { distances, hasNegativeCycle } = BellmanFord.shortestPath(edges, 4, 0)
    expect(hasNegativeCycle).toBe(false)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(3)
    expect(distances.get(2)).toBe(2)
    expect(distances.get(3)).toBe(6)
  })

  it('detects negative cycles', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -1 },
      { from: 2, to: 0, weight: -1 },
    ]
    const { hasNegativeCycle } = BellmanFord.shortestPath(edges, 3, 0)
    expect(hasNegativeCycle).toBe(true)
  })

  it('handles negative edges without negative cycle', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -2 },
      { from: 0, to: 2, weight: 5 },
    ]
    const { distances, hasNegativeCycle } = BellmanFord.shortestPath(edges, 3, 0)
    expect(hasNegativeCycle).toBe(false)
    expect(distances.get(2)).toBe(-1)
  })

  it('handles single node', () => {
    const { distances, hasNegativeCycle } = BellmanFord.shortestPath([], 1, 0)
    expect(hasNegativeCycle).toBe(false)
    expect(distances.get(0)).toBe(0)
  })

  it('handles disconnected graph', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(5)
    expect(distances.get(2)).toBe(Infinity)
  })

  it('handles all edges same weight', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 0, to: 2, weight: 1 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(2)).toBe(1)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(1)).toBe(1)
    expect(distances.get(2)).toBe(3)
    expect(distances.get(3)).toBe(6)
  })

  it('handles zero-weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 5 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 3, 0)
    expect(distances.get(1)).toBe(0)
    expect(distances.get(2)).toBe(5)
  })

  it('does not relax through Infinity', () => {
    const edges = [
      { from: 2, to: 3, weight: -10 },
    ]
    const { distances } = BellmanFord.shortestPath(edges, 4, 0)
    expect(distances.get(3)).toBe(Infinity)
  })
})
