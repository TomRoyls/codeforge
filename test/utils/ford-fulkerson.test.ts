import { describe, expect, it } from 'vitest'
import { FordFulkerson } from '../../src/utils/ford-fulkerson.js'

describe('FordFulkerson', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('returns 0 for disconnected', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(0)
  })

  it('handles source = sink', () => {
    expect(FordFulkerson.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles parallel paths', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 0, to: 2, capacity: 5 },
      { from: 1, to: 3, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(10)
  })

  it('handles single edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 7 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(7)
  })

  it('handles zero capacity', () => {
    const edges = [{ from: 0, to: 1, capacity: 0 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(0)
  })

  it('handles reverse flow graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 3, capacity: 7 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(3)
  })

  it('handles bidirectional edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 0, capacity: 3 },
      { from: 1, to: 2, capacity: 4 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 2, 3)).toBe(4)
  })

  it('handles diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles disconnected source-sink', () => {
    expect(FordFulkerson.maxFlow([{ from: 1, to: 2, capacity: 5 }], 0, 3, 4)).toBe(0)
  })

  it('handles source equals sink', () => {
    expect(FordFulkerson.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 7 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(10)
  })

  it('handles bottleneck graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
      { from: 2, to: 3, capacity: 100 },
    ]
    expect(FordFulkerson.maxFlow(edges, 0, 3, 4)).toBe(1)
  })

  it('handles single edge', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(FordFulkerson.maxFlow(edges, 0, 1, 2)).toBe(5)
  })
})
