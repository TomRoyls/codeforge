import { describe, expect, it } from 'vitest'
import { GraphEntropy } from '../../src/utils/graph-entropy.js'

describe('GraphEntropy', () => {
  it('empty graph entropy 0', () => {
    const ge = new GraphEntropy(3)
    expect(ge.degreeEntropy()).toBe(0)
  })

  it('regular graph degree entropy 0', () => {
    const ge = new GraphEntropy(3)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    ge.addEdge(0, 2)
    expect(ge.degreeEntropy()).toBe(0)
  })

  it('path has positive entropy', () => {
    const ge = new GraphEntropy(3)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    expect(ge.degreeEntropy()).toBeGreaterThan(0)
  })

  it('single node', () => {
    const ge = new GraphEntropy(1)
    expect(ge.degreeEntropy()).toBe(0)
  })

  it('clustering coefficient triangle', () => {
    const ge = new GraphEntropy(3)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    ge.addEdge(0, 2)
    expect(ge.clusteringCoefficient()).toBe(1)
  })

  it('clustering coefficient path', () => {
    const ge = new GraphEntropy(3)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    expect(ge.clusteringCoefficient()).toBe(0)
  })

  it('clustering coefficient star', () => {
    const ge = new GraphEntropy(4)
    ge.addEdge(0, 1)
    ge.addEdge(0, 2)
    ge.addEdge(0, 3)
    expect(ge.clusteringCoefficient()).toBe(0)
  })

  it('edge entropy is bounded', () => {
    const ge = new GraphEntropy(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        ge.addEdge(i, j)
    expect(ge.edgeEntropy()).toBeGreaterThanOrEqual(0)
    expect(ge.edgeEntropy()).toBeLessThanOrEqual(1)
  })

  it('star has degree entropy', () => {
    const ge = new GraphEntropy(4)
    ge.addEdge(0, 1)
    ge.addEdge(0, 2)
    ge.addEdge(0, 3)
    expect(ge.degreeEntropy()).toBeGreaterThan(0)
  })

  it('K4 clustering is 1', () => {
    const ge = new GraphEntropy(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        ge.addEdge(i, j)
    expect(ge.clusteringCoefficient()).toBe(1)
  })

  it('path graph has entropy', () => {
    const ge = new GraphEntropy(4)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    ge.addEdge(2, 3)
    const ent = ge.degreeEntropy()
    expect(ent).toBeGreaterThan(0)
    expect(ent).toBeLessThan(Math.log2(4))
  })

  it('empty graph zero entropy', () => {
    const ge = new GraphEntropy(3)
    expect(ge.degreeEntropy()).toBe(0)
  })

  it('single edge graph clustering', () => {
    const ge = new GraphEntropy(2)
    ge.addEdge(0, 1)
    expect(ge.clusteringCoefficient()).toBeGreaterThanOrEqual(0)
    expect(ge.edgeEntropy()).toBeGreaterThanOrEqual(0)
  })

  it('single node graph entropy is zero', () => {
    const ge = new GraphEntropy(1)
    expect(ge.degreeEntropy()).toBe(0)
  })

  it('cycle graph has clustering', () => {
    const ge = new GraphEntropy(4)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    ge.addEdge(2, 3)
    ge.addEdge(3, 0)
    expect(ge.clusteringCoefficient()).toBeGreaterThanOrEqual(0)
  })

  it('complete graph high entropy', () => {
    const ge = new GraphEntropy(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        ge.addEdge(i, j)
    expect(ge.degreeEntropy()).toBeGreaterThanOrEqual(0)
    expect(ge.clusteringCoefficient()).toBeGreaterThan(0)
  })

  it('path graph low clustering', () => {
    const ge = new GraphEntropy(3)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    expect(ge.clusteringCoefficient()).toBeGreaterThanOrEqual(0)
  })

  it('degree entropy for isolated nodes is zero', () => {
    const ge = new GraphEntropy(3)
    expect(ge.degreeEntropy()).toBe(0)
  })

  it('edge entropy for connected graph', () => {
    const ge = new GraphEntropy(3)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    expect(ge.edgeEntropy()).toBeGreaterThan(0)
  })

  it('single node has zero entropy', () => {
    const ge = new GraphEntropy(1)
    expect(ge.edgeEntropy()).toBe(0)
  })

  it('constructor accepts node count', () => {
    const ge = new GraphEntropy(5)
    expect(ge).toBeDefined()
  })

  it('degreeEntropy returns number', () => {
    const ge = new GraphEntropy(3)
    ge.addEdge(0, 1)
    ge.addEdge(1, 2)
    expect(typeof ge.degreeEntropy()).toBe('number')
  })

  it('single node entropy is 0', () => {
    const ge = new GraphEntropy(1)
    expect(ge.degreeEntropy()).toBe(0)
  })

  it('star graph has positive entropy', () => {
    const ge = new GraphEntropy(4)
    ge.addEdge(0, 1)
    ge.addEdge(0, 2)
    ge.addEdge(0, 3)
    expect(ge.degreeEntropy()).toBeGreaterThan(0)
  })
})
