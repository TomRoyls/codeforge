import { describe, expect, it } from 'vitest'
import { NetworkFlowDinic } from '../../src/utils/network-flow-dinic.js'

describe('NetworkFlowDinic', () => {
  it('computes flow on single edge', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 10)
    expect(nf.maxFlow(0, 1)).toBe(10)
  })

  it('computes flow on path', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 5)
    nf.addEdge(1, 2, 3)
    expect(nf.maxFlow(0, 2)).toBe(3)
  })

  it('computes flow on diamond', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 3)
    nf.addEdge(0, 2, 3)
    nf.addEdge(1, 3, 3)
    nf.addEdge(2, 3, 3)
    expect(nf.maxFlow(0, 3)).toBe(6)
  })

  it('handles no path', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(0, 2)).toBe(0)
  })

  it('handles zero capacity', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 0)
    expect(nf.maxFlow(0, 1)).toBe(0)
  })

  it('source equals sink', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(0, 0)).toBe(0)
  })

  it('handles bottleneck', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 10)
    nf.addEdge(0, 2, 10)
    nf.addEdge(1, 3, 2)
    nf.addEdge(2, 3, 10)
    expect(nf.maxFlow(0, 3)).toBe(12)
  })

  it('handles parallel paths', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 4)
    nf.addEdge(0, 1, 4)
    nf.addEdge(1, 2, 8)
    expect(nf.maxFlow(0, 2)).toBe(8)
  })

  it('handles larger network', () => {
    const nf = new NetworkFlowDinic(6)
    nf.addEdge(0, 1, 16)
    nf.addEdge(0, 2, 13)
    nf.addEdge(1, 2, 10)
    nf.addEdge(1, 3, 12)
    nf.addEdge(2, 1, 4)
    nf.addEdge(2, 4, 14)
    nf.addEdge(3, 2, 9)
    nf.addEdge(3, 5, 20)
    nf.addEdge(4, 3, 7)
    nf.addEdge(4, 5, 4)
    expect(nf.maxFlow(0, 5)).toBe(23)
  })

  it('handles single node', () => {
    const nf = new NetworkFlowDinic(1)
    expect(nf.maxFlow(0, 0)).toBe(0)
  })
})
