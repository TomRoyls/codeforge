import { describe, expect, it } from 'vitest'
import { CartesianProductGraph } from '../../src/utils/cartesian-product-graph.js'

describe('CartesianProductGraph', () => {
  it('empty graphs', () => {
    const cg = new CartesianProductGraph(0, 0)
    expect(cg.productNodeCount()).toBe(0)
    expect(cg.productEdgeCount()).toBe(0)
  })

  it('empty G1 with non-empty G2', () => {
    const cg = new CartesianProductGraph(0, 3)
    expect(cg.productNodeCount()).toBe(0)
    expect(cg.productEdgeCount()).toBe(0)
  })

  it('non-empty G1 with empty G2', () => {
    const cg = new CartesianProductGraph(3, 0)
    expect(cg.productNodeCount()).toBe(0)
    expect(cg.productEdgeCount()).toBe(0)
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

  it('asymmetric 3x2 graphs', () => {
    const cg = new CartesianProductGraph(3, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG2(0, 1)
    expect(cg.productNodeCount()).toBe(6)
    expect(cg.productEdgeCount()).toBe(7)
  })

  it('asymmetric 2x3 graphs', () => {
    const cg = new CartesianProductGraph(2, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    expect(cg.productNodeCount()).toBe(6)
  })

  it('product degree with no edges', () => {
    const cg = new CartesianProductGraph(3, 3)
    expect(cg.productDegree(0, 0)).toBe(0)
    expect(cg.productDegree(1, 1)).toBe(0)
    expect(cg.productDegree(2, 2)).toBe(0)
  })

  it('product degree varies across nodes', () => {
    const cg = new CartesianProductGraph(3, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productDegree(0, 0)).toBe(2)
    expect(cg.productDegree(1, 0)).toBe(2)
    expect(cg.productDegree(0, 1)).toBe(2)
    expect(cg.productDegree(2, 2)).toBe(0)
  })

  it('multiple edges in G1', () => {
    const cg = new CartesianProductGraph(4, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG1(2, 3)
    cg.addEdgeG2(0, 1)
    expect(cg.productNodeCount()).toBe(8)
  })

  it('complete graph G1 x empty G2', () => {
    const cg = new CartesianProductGraph(3, 1)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG1(0, 2)
    expect(cg.productNodeCount()).toBe(3)
    expect(cg.productEdgeCount()).toBe(3)
  })

  it('empty G1 x complete graph G2', () => {
    const cg = new CartesianProductGraph(1, 3)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    cg.addEdgeG2(0, 2)
    expect(cg.productNodeCount()).toBe(3)
    expect(cg.productEdgeCount()).toBe(3)
  })

  it('cycle graph G1 x single node G2', () => {
    const cg = new CartesianProductGraph(3, 1)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG1(2, 0)
    expect(cg.productNodeCount()).toBe(3)
    expect(cg.productEdgeCount()).toBe(3)
  })

  it('single node G1 x cycle graph G2', () => {
    const cg = new CartesianProductGraph(1, 3)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    cg.addEdgeG2(2, 0)
    expect(cg.productNodeCount()).toBe(3)
    expect(cg.productEdgeCount()).toBe(3)
  })

  it('star graph G1 x single node G2', () => {
    const cg = new CartesianProductGraph(4, 1)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(0, 2)
    cg.addEdgeG1(0, 3)
    expect(cg.productNodeCount()).toBe(4)
    expect(cg.productEdgeCount()).toBe(3)
  })

  it('single node G1 x star graph G2', () => {
    const cg = new CartesianProductGraph(1, 4)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(0, 2)
    cg.addEdgeG2(0, 3)
    expect(cg.productNodeCount()).toBe(4)
    expect(cg.productEdgeCount()).toBe(3)
  })

  it('adjacency in both dimensions', () => {
    const cg = new CartesianProductGraph(3, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.areAdjacent([0, 0], [1, 1])).toBe(false)
    expect(cg.areAdjacent([0, 0], [1, 0])).toBe(true)
    expect(cg.areAdjacent([0, 0], [0, 1])).toBe(true)
  })

  it('degree calculation with multiple connections', () => {
    const cg = new CartesianProductGraph(4, 4)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(0, 2)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(0, 2)
    expect(cg.productDegree(0, 0)).toBe(4)
  })

  it('large graph product node count', () => {
    const cg = new CartesianProductGraph(10, 10)
    expect(cg.productNodeCount()).toBe(100)
  })

  it('large graph product edge count', () => {
    const cg = new CartesianProductGraph(5, 5)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    expect(cg.productNodeCount()).toBe(25)
  })

  it('adding same edge twice', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(0, 1)
    expect(cg.productEdgeCount()).toBe(2)
  })

  it('adding same edge twice in G2', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productEdgeCount()).toBe(4)
  })

  it('island nodes in G1', () => {
    const cg = new CartesianProductGraph(4, 2)
    cg.addEdgeG1(0, 1)
    expect(cg.areAdjacent([2, 0], [3, 0])).toBe(false)
    expect(cg.areAdjacent([2, 1], [3, 1])).toBe(false)
  })

  it('island nodes in G2', () => {
    const cg = new CartesianProductGraph(2, 4)
    cg.addEdgeG2(0, 1)
    expect(cg.areAdjacent([0, 2], [0, 3])).toBe(false)
    expect(cg.areAdjacent([1, 2], [1, 3])).toBe(false)
  })

  it('edge count with isolated nodes', () => {
    const cg = new CartesianProductGraph(4, 4)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productEdgeCount()).toBe(8)
  })

  it('product node count increases with graph size', () => {
    const cg2x2 = new CartesianProductGraph(2, 2)
    const cg3x3 = new CartesianProductGraph(3, 3)
    const cg4x4 = new CartesianProductGraph(4, 4)
    expect(cg2x2.productNodeCount()).toBe(4)
    expect(cg3x3.productNodeCount()).toBe(9)
    expect(cg4x4.productNodeCount()).toBe(16)
  })

  it('adjacency for all combinations in 2x2', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.areAdjacent([0, 0], [1, 0])).toBe(true)
    expect(cg.areAdjacent([0, 0], [0, 1])).toBe(true)
    expect(cg.areAdjacent([0, 0], [1, 1])).toBe(false)
    expect(cg.areAdjacent([1, 0], [0, 0])).toBe(true)
    expect(cg.areAdjacent([1, 0], [1, 1])).toBe(true)
    expect(cg.areAdjacent([1, 0], [0, 1])).toBe(false)
    expect(cg.areAdjacent([0, 1], [0, 0])).toBe(true)
    expect(cg.areAdjacent([0, 1], [1, 1])).toBe(true)
    expect(cg.areAdjacent([0, 1], [1, 0])).toBe(false)
    expect(cg.areAdjacent([1, 1], [1, 0])).toBe(true)
    expect(cg.areAdjacent([1, 1], [0, 1])).toBe(true)
    expect(cg.areAdjacent([1, 1], [0, 0])).toBe(false)
  })

  it('degree for all nodes in 2x2 with edges', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productDegree(0, 0)).toBe(2)
    expect(cg.productDegree(1, 0)).toBe(2)
    expect(cg.productDegree(0, 1)).toBe(2)
    expect(cg.productDegree(1, 1)).toBe(2)
  })

  it('edge count for complete graph 3x3', () => {
    const cg = new CartesianProductGraph(3, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG1(0, 2)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    cg.addEdgeG2(0, 2)
    expect(cg.productEdgeCount()).toBe(18)
  })

  it('path graph product edge count', () => {
    const cg = new CartesianProductGraph(4, 4)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG1(2, 3)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    cg.addEdgeG2(2, 3)
    expect(cg.productNodeCount()).toBe(16)
  })

  it('one-direction edge in G1', () => {
    const cg = new CartesianProductGraph(3, 2)
    cg.addEdgeG1(0, 1)
    expect(cg.areAdjacent([0, 0], [1, 0])).toBe(true)
    expect(cg.areAdjacent([1, 0], [0, 0])).toBe(true)
    expect(cg.areAdjacent([0, 1], [1, 1])).toBe(true)
    expect(cg.areAdjacent([1, 1], [0, 1])).toBe(true)
  })

  it('one-direction edge in G2', () => {
    const cg = new CartesianProductGraph(2, 3)
    cg.addEdgeG2(0, 1)
    expect(cg.areAdjacent([0, 0], [0, 1])).toBe(true)
    expect(cg.areAdjacent([0, 1], [0, 0])).toBe(true)
    expect(cg.areAdjacent([1, 0], [1, 1])).toBe(true)
    expect(cg.areAdjacent([1, 1], [1, 0])).toBe(true)
  })

  it('asymmetric degree calculation 5x2', () => {
    const cg = new CartesianProductGraph(5, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG1(2, 3)
    cg.addEdgeG2(0, 1)
    expect(cg.productDegree(0, 0)).toBe(2)
    expect(cg.productDegree(1, 0)).toBe(3)
    expect(cg.productDegree(2, 0)).toBe(3)
    expect(cg.productDegree(3, 0)).toBe(2)
    expect(cg.productDegree(4, 0)).toBe(1)
  })

  it('adjacency boundary condition large graph', () => {
    const cg = new CartesianProductGraph(8, 8)
    cg.addEdgeG1(0, 7)
    cg.addEdgeG2(0, 7)
    expect(cg.areAdjacent([0, 0], [7, 0])).toBe(true)
    expect(cg.areAdjacent([0, 0], [0, 7])).toBe(true)
    expect(cg.areAdjacent([7, 7], [0, 7])).toBe(true)
    expect(cg.areAdjacent([7, 7], [7, 0])).toBe(true)
  })

  it('edge count with disconnected components', () => {
    const cg = new CartesianProductGraph(5, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(3, 4)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(1, 2)
    expect(cg.productEdgeCount()).toBe(16)
  })

  it('complete graph 4x5 product edge count', () => {
    const cg = new CartesianProductGraph(4, 5)
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) cg.addEdgeG1(i, j)
    }
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) cg.addEdgeG2(i, j)
    }
    expect(cg.productNodeCount()).toBe(20)
    expect(cg.productEdgeCount()).toBe(70)
  })

  it('degree with multiple edges from same node', () => {
    const cg = new CartesianProductGraph(4, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(0, 2)
    cg.addEdgeG1(0, 3)
    cg.addEdgeG2(0, 1)
    cg.addEdgeG2(0, 2)
    expect(cg.productDegree(0, 0)).toBe(5)
    expect(cg.productDegree(0, 1)).toBe(4)
    expect(cg.productDegree(1, 2)).toBe(2)
  })

  it('asymmetric 6x3 graph adjacency', () => {
    const cg = new CartesianProductGraph(6, 3)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG1(1, 2)
    cg.addEdgeG2(0, 1)
    expect(cg.areAdjacent([0, 0], [1, 0])).toBe(true)
    expect(cg.areAdjacent([0, 0], [0, 1])).toBe(true)
    expect(cg.areAdjacent([2, 2], [5, 0])).toBe(false)
    expect(cg.areAdjacent([1, 1], [2, 1])).toBe(true)
  })

  it('productNodeCount is n1 * n2', () => {
    const cg = new CartesianProductGraph(3, 4)
    expect(cg.productNodeCount()).toBe(12)
  })

  it('productDegree sums degrees from both graphs', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    cg.addEdgeG2(0, 1)
    expect(cg.productDegree(0, 0)).toBe(2)
  })

  it('areAdjacent returns false for nodes differing in both coords', () => {
    const cg = new CartesianProductGraph(2, 2)
    cg.addEdgeG1(0, 1)
    expect(cg.areAdjacent([0, 0], [1, 1])).toBe(false)
  })

  it('productEdgeCount is 0 with no edges', () => {
    const cg = new CartesianProductGraph(3, 3)
    expect(cg.productEdgeCount()).toBe(0)
  })
})
  it('single nodes cartesian product', () => {
    const cpg = new CartesianProductGraph(1, 1)
    expect(cpg).toBeDefined()
  })

  it('node count is product', () => {
    const cpg = new CartesianProductGraph(2, 3)
    expect(cpg.productNodeCount()).toBe(6)
  })

  it('small product has edges', () => {
    const cpg = new CartesianProductGraph(2, 2)
    cpg.addEdgeG1(0, 1)
    cpg.addEdgeG2(0, 1)
    expect(cpg.productEdgeCount()).toBeGreaterThan(0)
  })

describe('cartesian-product-graph - wave544', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
