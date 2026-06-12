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

  it('handles cycle with forward flow', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 5)
    nf.addEdge(1, 2, 3)
    nf.addEdge(2, 0, 2)
    expect(nf.maxFlow(0, 2)).toBe(3)
  })

  it('handles disconnected components', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 5)
    nf.addEdge(2, 3, 5)
    expect(nf.maxFlow(0, 3)).toBe(0)
  })

  it('handles self-loop on source node', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 0, 5)
    nf.addEdge(0, 1, 3)
    nf.addEdge(1, 2, 3)
    expect(nf.maxFlow(0, 2)).toBe(3)
  })

  it('handles two node single edge', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 7)
    expect(nf.maxFlow(0, 1)).toBe(7)
  })

  it('handles diamond graph with equal capacities', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 10)
    nf.addEdge(0, 2, 10)
    nf.addEdge(1, 3, 10)
    nf.addEdge(2, 3, 10)
    expect(nf.maxFlow(0, 3)).toBe(20)
  })

  it('handles two parallel edges between same nodes', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 3)
    nf.addEdge(0, 1, 7)
    expect(nf.maxFlow(0, 1)).toBe(10)
  })

  it('handles single edge with capacity 5', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(0, 1)).toBe(5)
  })

  it('no path from sink to source gives zero flow', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(1, 0)).toBe(0)
  })

  it('single edge with capacity 10', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 10)
    expect(nf.maxFlow(0, 1)).toBe(10)
  })

  it('no path from sink to source with capacity 10', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 10)
    expect(nf.maxFlow(1, 0)).toBe(0)
  })

  it('single edge with capacity 5 again', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(0, 1)).toBe(5)
  })

  it('no path with capacity 5', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(1, 0)).toBe(0)
  })

  it('single edge with capacity 10 again', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 10)
    expect(nf.maxFlow(0, 1)).toBe(10)
  })

  it('no path with capacity 10', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 10)
    expect(nf.maxFlow(1, 0)).toBe(0)
  })

  it('handles three parallel paths with different capacities', () => {
    const nf = new NetworkFlowDinic(5)
    nf.addEdge(0, 1, 10)
    nf.addEdge(0, 2, 20)
    nf.addEdge(0, 3, 30)
    nf.addEdge(1, 4, 10)
    nf.addEdge(2, 4, 20)
    nf.addEdge(3, 4, 30)
    expect(nf.maxFlow(0, 4)).toBe(60)
  })

  it('handles complex multi-bottleneck graph', () => {
    const nf = new NetworkFlowDinic(6)
    nf.addEdge(0, 1, 100)
    nf.addEdge(0, 2, 100)
    nf.addEdge(1, 3, 50)
    nf.addEdge(1, 4, 50)
    nf.addEdge(2, 3, 50)
    nf.addEdge(2, 4, 50)
    nf.addEdge(3, 5, 75)
    nf.addEdge(4, 5, 75)
    expect(nf.maxFlow(0, 5)).toBe(150)
  })

  it('handles mixed capacities on parallel paths', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 15)
    nf.addEdge(0, 2, 25)
    nf.addEdge(1, 3, 15)
    nf.addEdge(2, 3, 25)
    expect(nf.maxFlow(0, 3)).toBe(40)
  })

  it('handles four-node linear path', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 10)
    nf.addEdge(1, 2, 8)
    nf.addEdge(2, 3, 6)
    expect(nf.maxFlow(0, 3)).toBe(6)
  })

  it('handles five-node linear path', () => {
    const nf = new NetworkFlowDinic(5)
    nf.addEdge(0, 1, 20)
    nf.addEdge(1, 2, 15)
    nf.addEdge(2, 3, 10)
    nf.addEdge(3, 4, 5)
    expect(nf.maxFlow(0, 4)).toBe(5)
  })

  it('handles bidirectional edges with different capacities', () => {
    const nf1 = new NetworkFlowDinic(2)
    nf1.addEdge(0, 1, 20)
    nf1.addEdge(1, 0, 10)
    expect(nf1.maxFlow(0, 1)).toBe(20)

    const nf2 = new NetworkFlowDinic(2)
    nf2.addEdge(0, 1, 20)
    nf2.addEdge(1, 0, 10)
    expect(nf2.maxFlow(1, 0)).toBe(10)
  })

  it('handles graph with isolated nodes', () => {
    const nf = new NetworkFlowDinic(5)
    nf.addEdge(0, 1, 10)
    nf.addEdge(1, 2, 10)
    expect(nf.maxFlow(0, 2)).toBe(10)
  })

  it('handles path through multiple nodes with varying capacities', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 30)
    nf.addEdge(1, 2, 20)
    nf.addEdge(2, 3, 10)
    expect(nf.maxFlow(0, 3)).toBe(10)
  })

  it('handles triangular graph', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 10)
    nf.addEdge(1, 2, 10)
    nf.addEdge(0, 2, 5)
    expect(nf.maxFlow(0, 2)).toBe(15)
  })

  it('handles capacity of 1 on single edge', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 1)
    expect(nf.maxFlow(0, 1)).toBe(1)
  })

  it('handles very large capacity', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 1000000)
    expect(nf.maxFlow(0, 1)).toBe(1000000)
  })

  it('handles capacity of 2', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 2)
    expect(nf.maxFlow(0, 1)).toBe(2)
  })

  it('handles capacity of 3', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 3)
    expect(nf.maxFlow(0, 1)).toBe(3)
  })

  it('handles six-node complex network', () => {
    const nf = new NetworkFlowDinic(6)
    nf.addEdge(0, 1, 10)
    nf.addEdge(0, 2, 10)
    nf.addEdge(1, 3, 8)
    nf.addEdge(1, 4, 2)
    nf.addEdge(2, 4, 5)
    nf.addEdge(2, 5, 5)
    nf.addEdge(3, 5, 8)
    nf.addEdge(4, 5, 7)
    expect(nf.maxFlow(0, 5)).toBe(20)
  })

  it('handles multiple edges from source to same node', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 5)
    nf.addEdge(0, 1, 5)
    nf.addEdge(0, 1, 5)
    nf.addEdge(1, 2, 15)
    expect(nf.maxFlow(0, 2)).toBe(15)
  })

  it('handles multiple edges to sink from same node', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 15)
    nf.addEdge(1, 2, 5)
    nf.addEdge(1, 2, 5)
    nf.addEdge(1, 2, 5)
    expect(nf.maxFlow(0, 2)).toBe(15)
  })

  it('handles graph with intermediate bottleneck', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 10)
    nf.addEdge(0, 2, 10)
    nf.addEdge(1, 3, 10)
    nf.addEdge(2, 3, 10)
    nf.addEdge(1, 2, 1)
    expect(nf.maxFlow(0, 3)).toBe(20)
  })

  it('handles Y-shaped graph', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 10)
    nf.addEdge(0, 2, 10)
    nf.addEdge(1, 3, 5)
    nf.addEdge(2, 3, 5)
    expect(nf.maxFlow(0, 3)).toBe(10)
  })

  it('handles star graph with center as source', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 10)
    nf.addEdge(0, 2, 10)
    nf.addEdge(0, 3, 10)
    expect(nf.maxFlow(0, 1)).toBe(10)
    expect(nf.maxFlow(0, 2)).toBe(10)
    expect(nf.maxFlow(0, 3)).toBe(10)
  })

  it('handles completely disconnected nodes', () => {
    const nf = new NetworkFlowDinic(5)
    expect(nf.maxFlow(0, 4)).toBe(0)
  })

  it('handles single node network', () => {
    const nf = new NetworkFlowDinic(1)
    expect(nf.maxFlow(0, 0)).toBe(0)
  })

  // === additional edge case tests ===
  it('handles multiple source edges to multiple sink edges', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 5)
    nf.addEdge(0, 2, 7)
    nf.addEdge(1, 3, 3)
    nf.addEdge(2, 3, 4)
    expect(nf.maxFlow(0, 3)).toBe(7)
  })

  it('handles graph where source has no outgoing edges', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(1, 2, 5)
    expect(nf.maxFlow(0, 2)).toBe(0)
  })

  it('handles graph where sink has no incoming edges', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(0, 2)).toBe(0)
  })

  it('handles all edges with unit capacity', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 1)
    nf.addEdge(0, 2, 1)
    nf.addEdge(1, 3, 1)
    nf.addEdge(2, 3, 1)
    expect(nf.maxFlow(0, 3)).toBe(2)
  })

  it('handles star graph with center as sink', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 3, 10)
    nf.addEdge(1, 3, 10)
    nf.addEdge(2, 3, 10)
    expect(nf.maxFlow(0, 3)).toBe(10)
    expect(nf.maxFlow(1, 3)).toBe(10)
    expect(nf.maxFlow(2, 3)).toBe(10)
  })

  it('handles reversed path from sink to source direction', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(2, 1, 5)
    nf.addEdge(1, 0, 5)
    expect(nf.maxFlow(2, 0)).toBe(5)
  })

  it('handles fractional capacities with integer result', () => {
    const nf = new NetworkFlowDinic(3)
    nf.addEdge(0, 1, 3.5)
    nf.addEdge(1, 2, 2.5)
    expect(nf.maxFlow(0, 2)).toBeCloseTo(2.5, 1)
  })

  it('no path returns 0', () => {
    const nf = new NetworkFlowDinic(4)
    nf.addEdge(0, 1, 5)
    nf.addEdge(2, 3, 5)
    expect(nf.maxFlow(0, 3)).toBe(0)
  })

  it('single edge flow', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 10)
    expect(nf.maxFlow(0, 1)).toBe(10)
  })

  it('parallel edges sum', () => {
    const nf = new NetworkFlowDinic(2)
    nf.addEdge(0, 1, 5)
    nf.addEdge(0, 1, 5)
    expect(nf.maxFlow(0, 1)).toBe(10)
  })

  it('no edges max flow is 0', () => {
    const d = new NetworkFlowDinic(2)
    expect(d.maxFlow(0, 1)).toBe(0)
  })

  it('single edge flow', () => {
    const d = new NetworkFlowDinic(2)
    d.addEdge(0, 1, 10)
    expect(d.maxFlow(0, 1)).toBe(10)
  })

  it('clone works', () => {
    const d = new NetworkFlowDinic(2)
    expect(d.clone()).toBeDefined()
  })
})
