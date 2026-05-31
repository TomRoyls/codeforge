import { describe, expect, it } from 'vitest'
import { CartesianProductGraph } from '../../src/utils/cartesian-product-graph.js'

describe('CartesianProductGraph', () => {
  it('empty graphs', () => {
    const cg = new CartesianProductGraph(0, 0)
    expect(cg.productNodeCount()).toBe(0)
  })

  it('single node product', () => {
    const cg = new CartesianProductGraph(1, 1)
    expect(cg.productNodeCount()).toBe(1)
    expect(cg.productEdgeCount()).toBe(0)
  })

  it('path x single node', () => {
    const cg = new CartesianProductGraph(2, 1)
    cg.addEdgeG1(0, 1)
    expect(cg.productNodeCount()).toBe(2)
    expect(cg.productEdgeCount()).toBe(1)
  })

  it('edge x edge', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productNodeCount()).toBe(4)
    expect(cg.productEdgeCount()).toBe(4)
  })

  it('adjacency check', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.areAdjacent([0, 0], [1, 0])).toBe(true)
    expect(cg.areAdjacent([0, 0], [0, 1])).toBe(true)
    expect(cg.areAdjacent([0, 0], [1, 1])).toBe(false)
  })

  it('product degree', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productDegree(0, 0)).toBe(2)
    expect(cg.productDegree(0, 1)).toBe(2)
  })

  it('3-node path x edge', () => {
    const cg = new CartesianProductGraph(3, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG2(0, 1)
    expect(cg.productNodeCount()).toBe(6)
    expect(cg.productEdgeCount()).toBe(7)
  })

  it('no edges product', () => {
    const cg = new CartesianProductGraph(3, 3)
    expect(cg.productNodeCount()).toBe(9)
    expect(cg.productEdgeCount()).toBe(0)
  })

  it('single edge x path', () => {
    const cg = new CartesianProductGraph(2, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    expect(cg.productNodeCount()).toBe(6)
  })

  it('self adjacency false', () => {
    const cg = new CartesianProductGraph(2, 2)
    expect(cg.areAdjacent([0, 0], [0, 0])).toBe(false)
  })
})
