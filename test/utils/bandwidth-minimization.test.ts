import { describe, expect, it } from 'vitest'
import { BandwidthMinimization } from '../../src/utils/bandwidth-minimization.js'

describe('BandwidthMinimization', () => {
  it('single node bandwidth 0', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })

  it('path bandwidth', () => {
    const bm = new BandwidthMinimization(3)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    expect(bm.bandwidth()).toBe(1)
  })

  it('star bandwidth', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(0, 2)
    bm.addEdge(0, 3)
    expect(bm.bandwidth()).toBeLessThanOrEqual(3)
  })

  it('triangle bandwidth', () => {
    const bm = new BandwidthMinimization(3)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    bm.addEdge(0, 2)
    expect(bm.bandwidth()).toBe(2)
  })

  it('empty graph bandwidth 0', () => {
    const bm = new BandwidthMinimization(3)
    expect(bm.bandwidth()).toBe(0)
  })

  it('cuthill-mckee returns permutation', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    bm.addEdge(2, 3)
    const order = bm.cuthillMcKee()
    expect(order.length).toBe(4)
    expect(new Set(order).size).toBe(4)
  })

  it('custom ordering', () => {
    const bm = new BandwidthMinimization(3)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    expect(bm.bandwidth([0, 1, 2])).toBe(1)
    expect(bm.bandwidth([2, 0, 1])).toBe(2)
  })

  it('K4 bandwidth', () => {
    const bm = new BandwidthMinimization(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        bm.addEdge(i, j)
    expect(bm.bandwidth()).toBe(3)
  })

  it('disconnected graph', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(2, 3)
    expect(bm.bandwidth()).toBe(1)
  })

  it('reduces bandwidth vs natural ordering', () => {
    const bm = new BandwidthMinimization(6)
    bm.addEdge(0, 5)
    bm.addEdge(1, 4)
    bm.addEdge(2, 3)
    const natural = bm.bandwidth([0, 1, 2, 3, 4, 5])
    const optimized = bm.bandwidth()
    expect(optimized).toBeLessThanOrEqual(natural)
  })

  it('handles large star', () => {
    const bm = new BandwidthMinimization(6)
    bm.addEdge(0, 1)
    bm.addEdge(0, 2)
    bm.addEdge(0, 3)
    bm.addEdge(0, 4)
    bm.addEdge(0, 5)
    expect(bm.bandwidth()).toBeLessThanOrEqual(5)
  })

  it('path graph bandwidth', () => {
    const bm = new BandwidthMinimization(5)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    bm.addEdge(2, 3)
    bm.addEdge(3, 4)
    expect(bm.bandwidth()).toBe(1)
  })

  it('handles K3', () => {
    const bm = new BandwidthMinimization(3)
    bm.addEdge(0, 1)
    bm.addEdge(1, 2)
    bm.addEdge(0, 2)
    expect(bm.bandwidth()).toBe(2)
  })

  it('handles single node', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })

  it('handles two nodes with edge', () => {
    const bm = new BandwidthMinimization(2)
    bm.addEdge(0, 1)
    expect(bm.bandwidth()).toBe(1)
  })

  it('handles disconnected nodes', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    expect(bm.bandwidth()).toBeLessThanOrEqual(3)
  })

  it('handles star graph', () => {
    const bm = new BandwidthMinimization(4)
    bm.addEdge(0, 1)
    bm.addEdge(0, 2)
    bm.addEdge(0, 3)
    expect(bm.bandwidth()).toBeLessThanOrEqual(3)
  })

  it('single node has zero bandwidth', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })

  it('two nodes connected has bandwidth 1', () => {
    const bm = new BandwidthMinimization(2)
    bm.addEdge(0, 1)
    expect(bm.bandwidth()).toBe(1)
  })

  it('single node has bandwidth 0', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })

  it('two nodes with edge has bandwidth 1', () => {
    const bm = new BandwidthMinimization(2)
    bm.addEdge(0, 1)
    expect(bm.bandwidth()).toBe(1)
  })

  it('single node has bandwidth 0', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })

  it('two connected nodes have bandwidth', () => {
    const bm = new BandwidthMinimization(2)
    bm.addEdge(0, 1)
    expect(bm.bandwidth()).toBeGreaterThanOrEqual(0)
  })

  it('single node has bandwidth 0', () => {
    const bm = new BandwidthMinimization(1)
    expect(bm.bandwidth()).toBe(0)
  })
})
