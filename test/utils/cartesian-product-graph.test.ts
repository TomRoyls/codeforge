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

  it('P2 x P2 adjacency', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productNodeCount()).toBe(4)
    expect(cg.areAdjacent([0, 0], [1, 0])).toBe(true)
    expect(cg.areAdjacent([0, 0], [0, 1])).toBe(true)
    expect(cg.areAdjacent([0, 0], [1, 1])).toBe(false)
  })

  it('P2 x P2 edge count', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productEdgeCount()).toBe(4)
  })

  it('non-adjacent nodes in product', () => {
    const cg = new CartesianProductGraph(3, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.areAdjacent([0, 0], [2, 2])).toBe(false)
  })

  it('single node graphs product', () => {
    const cg = new CartesianProductGraph(1, 1)
    expect(cg.productNodeCount()).toBe(1)
    expect(cg.productEdgeCount()).toBe(0)
  })

  it('1x2 product with edge', () => {
    const cg = new CartesianProductGraph(1, 2)
    cg.addEdgeG2(0, 1)
    expect(cg.productNodeCount()).toBe(2)
    expect(cg.areAdjacent([0, 0], [0, 1])).toBe(true)
  })

  it('2x1 product with edge in G1', () => {
    const cg = new CartesianProductGraph(2, 1)
    cg.addEdgeG1(0, 1)
    expect(cg.productNodeCount()).toBe(2)
    expect(cg.areAdjacent([0, 0], [1, 0])).toBe(true)
  })

  it('2x2 both with edges', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productNodeCount()).toBe(4)
    expect(cg.productEdgeCount()).toBe(4)
  })

  it('single node graphs have 1 product node', () => {
    const cg = new CartesianProductGraph(1, 1)
    expect(cg.productNodeCount()).toBe(1)
  })

  it('2x2 graphs have 4 product nodes', () => {
    const cg = new CartesianProductGraph(2, 2)
    expect(cg.productNodeCount()).toBe(4)
  })

  it('1x1 graph has 1 product node', () => {
    const cg = new CartesianProductGraph(1, 1)
    expect(cg.productNodeCount()).toBe(1)
  })
})
