import { describe, expect, it } from 'vitest'
import { EdmondsBlossom } from '../../src/utils/edmonds-blossom.js'

describe('EdmondsBlossom', () => {
  it('finds matching in single edge', () => {
    const eb = new EdmondsBlossom(2)
    eb.addEdge(0, 1)
    expect(eb.maxMatchingSize()).toBe(1)
  })

  it('handles no edges', () => {
    const eb = new EdmondsBlossom(3)
    expect(eb.maxMatchingSize()).toBe(0)
  })

  it('handles path of 3', () => {
    const eb = new EdmondsBlossom(3)
    eb.addEdge(0, 1)
    eb.addEdge(1, 2)
    expect(eb.maxMatchingSize()).toBe(1)
  })

  it('handles complete graph K3', () => {
    const eb = new EdmondsBlossom(3)
    eb.addEdge(0, 1)
    eb.addEdge(1, 2)
    eb.addEdge(0, 2)
    const size = eb.maxMatchingSize()
    expect(size).toBeGreaterThanOrEqual(1)
  })

  it('handles complete graph K4', () => {
    const eb = new EdmondsBlossom(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        eb.addEdge(i, j)
    expect(eb.maxMatchingSize()).toBe(2)
  })

  it('handles single node', () => {
    const eb = new EdmondsBlossom(1)
    expect(eb.maxMatchingSize()).toBe(0)
  })

  it('handles two disconnected edges', () => {
    const eb = new EdmondsBlossom(4)
    eb.addEdge(0, 1)
    eb.addEdge(2, 3)
    expect(eb.maxMatchingSize()).toBe(2)
  })

  it('handles star graph', () => {
    const eb = new EdmondsBlossom(4)
    eb.addEdge(0, 1)
    eb.addEdge(0, 2)
    eb.addEdge(0, 3)
    expect(eb.maxMatchingSize()).toBe(1)
  })

  it('handles larger graph', () => {
    const eb = new EdmondsBlossom(6)
    eb.addEdge(0, 1)
    eb.addEdge(1, 2)
    eb.addEdge(2, 3)
    eb.addEdge(3, 4)
    eb.addEdge(4, 5)
    expect(eb.maxMatchingSize()).toBe(3)
  })

  it('handles bipartite graph', () => {
    const eb = new EdmondsBlossom(4)
    eb.addEdge(0, 2)
    eb.addEdge(0, 3)
    eb.addEdge(1, 2)
    eb.addEdge(1, 3)
    expect(eb.maxMatchingSize()).toBe(2)
  })

  it('handles path of 4', () => {
    const eb = new EdmondsBlossom(4)
    eb.addEdge(0, 1)
    eb.addEdge(1, 2)
    eb.addEdge(2, 3)
    expect(eb.maxMatchingSize()).toBe(2)
  })

  it('handles K4 matching', () => {
    const eb = new EdmondsBlossom(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        eb.addEdge(i, j)
    expect(eb.maxMatchingSize()).toBe(2)
  })

  it('handles triangle', () => {
    const eb = new EdmondsBlossom(3)
    eb.addEdge(0, 1)
    eb.addEdge(1, 2)
    eb.addEdge(0, 2)
    expect(eb.maxMatchingSize()).toBeGreaterThanOrEqual(1)
  })

  it('handles single node', () => {
    const eb = new EdmondsBlossom(1)
    expect(eb.maxMatchingSize()).toBe(0)
  })

  it('handles two edges path', () => {
    const eb = new EdmondsBlossom(3)
    eb.addEdge(0, 1)
    eb.addEdge(1, 2)
    expect(eb.maxMatchingSize()).toBe(1)
  })

  it('handles empty graph', () => {
    const eb = new EdmondsBlossom(4)
    expect(eb.maxMatchingSize()).toBe(0)
  })

  it('handles single edge', () => {
    const eb = new EdmondsBlossom(2)
    eb.addEdge(0, 1)
    expect(eb.maxMatchingSize()).toBe(1)
  })

  it('no edges gives zero matching', () => {
    const eb = new EdmondsBlossom(3)
    expect(eb.maxMatchingSize()).toBe(0)
  })

  it('single edge matching', () => {
    const eb = new EdmondsBlossom(2)
    eb.addEdge(0, 1)
    expect(eb.maxMatchingSize()).toBe(1)
  })
})
