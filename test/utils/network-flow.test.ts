import { describe, expect, it } from 'vitest'
import { NetworkFlow } from '../../src/utils/network-flow.js'

describe('NetworkFlow', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('handles source = sink', () => {
    expect(NetworkFlow.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles disconnected', () => {
    expect(NetworkFlow.maxFlow([{ from: 0, to: 1, capacity: 5 }], 0, 2, 3)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles reverse flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('hasAugmentingPath returns correct boolean', () => {
    const edges = [{ from: 0, to: 1, capacity: 5 }]
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 1, 2)).toBe(true)
    expect(NetworkFlow.hasAugmentingPath(edges, 0, 2, 3)).toBe(false)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 2 },
    ]
    expect(NetworkFlow.maxFlow(edges, 0, 1, 2)).toBe(5)
  })
})
