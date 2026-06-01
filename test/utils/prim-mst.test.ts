import { describe, expect, it } from 'vitest'
import { PrimMST } from '../../src/utils/prim-mst.js'

describe('PrimMST', () => {
  it('finds MST of triangle', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(0, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(3)
    expect(result.edges.length).toBe(2)
  })

  it('finds MST of path', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 5)
    mst.addEdge(1, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(8)
  })

  it('handles single node', () => {
    const mst = new PrimMST(1)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
    expect(result.edges.length).toBe(0)
  })

  it('handles two nodes', () => {
    const mst = new PrimMST(2)
    mst.addEdge(0, 1, 10)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(10)
  })

  it('detects connected', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 1)
    expect(mst.isConnected()).toBe(true)
  })

  it('detects disconnected', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    expect(mst.isConnected()).toBe(false)
  })

  it('handles star graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 2, 2)
    mst.addEdge(0, 3, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(6)
  })

  it('handles complete graph', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 1)
    mst.addEdge(0, 2, 2)
    mst.addEdge(0, 3, 3)
    mst.addEdge(1, 2, 4)
    mst.addEdge(1, 3, 5)
    mst.addEdge(2, 3, 6)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(6)
  })

  it('handles empty graph', () => {
    const mst = new PrimMST(0)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
  })

  it('handles larger graph', () => {
    const mst = new PrimMST(5)
    mst.addEdge(0, 1, 2)
    mst.addEdge(0, 3, 6)
    mst.addEdge(1, 2, 3)
    mst.addEdge(1, 3, 8)
    mst.addEdge(1, 4, 5)
    mst.addEdge(2, 4, 7)
    mst.addEdge(3, 4, 9)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(16)
  })

  it('handles disconnected gracefully', () => {
    const mst = new PrimMST(4)
    mst.addEdge(0, 1, 2)
    mst.addEdge(2, 3, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBeLessThanOrEqual(5)
  })

  it('handles K3', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 1)
    mst.addEdge(1, 2, 2)
    mst.addEdge(0, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(3)
  })

  it('handles single node', () => {
    const mst = new PrimMST(1)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(0)
  })

  it('handles two node graph', () => {
    const mst = new PrimMST(2)
    mst.addEdge(0, 1, 5)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(5)
  })

  it('handles parallel edges picks minimum', () => {
    const mst = new PrimMST(3)
    mst.addEdge(0, 1, 5)
    mst.addEdge(0, 1, 2)
    mst.addEdge(1, 2, 3)
    const result = mst.findMST()
    expect(result.totalWeight).toBe(5)
  })
})
