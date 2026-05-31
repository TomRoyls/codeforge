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
})
