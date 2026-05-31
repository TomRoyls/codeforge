import { describe, expect, it } from 'vitest'
import { DinicMaxFlow } from '../../src/utils/dinic.js'

describe('DinicMaxFlow', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('returns 0 for disconnected graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(0)
  })

  it('handles source = sink', () => {
    expect(DinicMaxFlow.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 2 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles reverse edge blocking', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('handles zero capacity edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 0 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(0)
  })

  it('single edge max flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 7 },
    ]
    expect(DinicMaxFlow.maxFlow(edges, 0, 1, 2)).toBe(7)
  })
})
