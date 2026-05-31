import { describe, expect, it } from 'vitest'
import { FlowPushRelabel } from '../../src/utils/flow-push-relabel.js'

describe('FlowPushRelabel', () => {
  it('computes max flow for simple path', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 1, to: 2, capacity: 2 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 2, 3)).toBe(2)
  })

  it('computes max flow for diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 2 },
      { from: 2, to: 3, capacity: 3 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(4)
  })

  it('handles source = sink', () => {
    expect(FlowPushRelabel.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles disconnected', () => {
    expect(FlowPushRelabel.maxFlow([{ from: 0, to: 1, capacity: 5 }], 0, 2, 3)).toBe(0)
  })

  it('handles bottleneck', () => {
    const edges = [
      { from: 0, to: 1, capacity: 100 },
      { from: 1, to: 2, capacity: 1 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 2, 3)).toBe(1)
  })

  it('handles reverse flow', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 2, capacity: 2 },
      { from: 1, to: 3, capacity: 8 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(18)
  })

  it('handles parallel edges', () => {
    const edges = [
      { from: 0, to: 1, capacity: 3 },
      { from: 0, to: 1, capacity: 2 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 1, 2)).toBe(5)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 1, to: 2, capacity: 3 },
      { from: 2, to: 3, capacity: 7 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(3)
  })

  it('handles zero capacity', () => {
    expect(FlowPushRelabel.maxFlow([{ from: 0, to: 1, capacity: 0 }], 0, 1, 2)).toBe(0)
  })

  it('handles single edge', () => {
    expect(FlowPushRelabel.maxFlow([{ from: 0, to: 1, capacity: 7 }], 0, 1, 2)).toBe(7)
  })

  it('handles multi-level graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 5 },
      { from: 1, to: 4, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
      { from: 2, to: 4, capacity: 5 },
      { from: 3, to: 5, capacity: 10 },
      { from: 4, to: 5, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 5, 6)).toBe(20)
  })

  it('handles diamond graph', () => {
    const edges = [
      { from: 0, to: 1, capacity: 10 },
      { from: 0, to: 2, capacity: 10 },
      { from: 1, to: 3, capacity: 10 },
      { from: 2, to: 3, capacity: 10 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(20)
  })

  it('handles source equals sink', () => {
    expect(FlowPushRelabel.maxFlow([], 0, 0, 1)).toBe(0)
  })

  it('handles disconnected source and sink', () => {
    const edges = [
      { from: 0, to: 1, capacity: 5 },
      { from: 2, to: 3, capacity: 5 },
    ]
    expect(FlowPushRelabel.maxFlow(edges, 0, 3, 4)).toBe(0)
  })
})
