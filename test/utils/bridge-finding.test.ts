import { describe, expect, it } from 'vitest'
import { BridgeFinding } from '../../src/utils/bridge-finding.js'

describe('BridgeFinding', () => {
  it('finds bridge in path', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    const bridges = bf.findBridges()
    expect(bridges).toEqual([[0, 1], [1, 2]])
  })

  it('no bridges in cycle', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles single edge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges()).toEqual([[0, 1]])
  })

  it('handles single node', () => {
    const bf = new BridgeFinding(1)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles disconnected graph', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(2, 3)
    const bridges = bf.findBridges()
    expect(bridges.length).toBe(2)
  })

  it('handles star graph (all bridges)', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(0, 2)
    bf.addEdge(0, 3)
    const bridges = bf.findBridges()
    expect(bridges.length).toBe(3)
  })

  it('handles two cycles connected by bridge', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 3)
    bf.addEdge(2, 3)
    const bridges = bf.findBridges()
    expect(bridges).toEqual([[2, 3]])
  })

  it('handles no edges', () => {
    const bf = new BridgeFinding(3)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles K4 (no bridges)', () => {
    const bf = new BridgeFinding(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        bf.addEdge(i, j)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles chain of 5', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    expect(bf.findBridges().length).toBe(4)
  })

  it('handles multi-edge with bridge', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 2)
    const bridges = bf.findBridges()
    expect(bridges.length).toBe(0)
  })

  it('handles figure eight', () => {
    const bf = new BridgeFinding(6)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    bf.addEdge(2, 3)
    bf.addEdge(3, 4)
    bf.addEdge(4, 5)
    bf.addEdge(5, 3)
    expect(bf.findBridges().length).toBe(1)
  })

  it('handles star graph all bridges', () => {
    const bf = new BridgeFinding(5)
    bf.addEdge(0, 1)
    bf.addEdge(0, 2)
    bf.addEdge(0, 3)
    bf.addEdge(0, 4)
    expect(bf.findBridges().length).toBe(4)
  })

  it('handles single node', () => {
    const bf = new BridgeFinding(1)
    expect(bf.findBridges()).toEqual([])
  })

  it('handles single edge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges()).toEqual([[0, 1]])
  })

  it('handles disconnected graph', () => {
    const bf = new BridgeFinding(4)
    bf.addEdge(0, 1)
    bf.addEdge(2, 3)
    expect(bf.findBridges().length).toBe(2)
  })

  it('handles triangle no bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges()).toEqual([])
  })

  it('single edge is a bridge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges()).toEqual([[0, 1]])
  })

  it('triangle graph has no bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges()).toEqual([])
  })

  it('path graph has bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    expect(bf.findBridges().length).toBe(2)
  })

  it('cycle has no bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    bf.addEdge(2, 0)
    expect(bf.findBridges().length).toBe(0)
  })

  it('chain of 3 has 2 bridges', () => {
    const bf = new BridgeFinding(3)
    bf.addEdge(0, 1)
    bf.addEdge(1, 2)
    expect(bf.findBridges().length).toBe(2)
  })

  it('single edge is a bridge', () => {
    const bf = new BridgeFinding(2)
    bf.addEdge(0, 1)
    expect(bf.findBridges().length).toBe(1)
  })

  it('no edges has no bridges', () => {
    const bf = new BridgeFinding(2)
    expect(bf.findBridges().length).toBe(0)
  })
})
