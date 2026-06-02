import { describe, expect, it } from 'vitest'
import { GraphIsomorphism } from '../../src/utils/graph-isomorphism.js'

describe('GraphIsomorphism', () => {
  it('empty graphs are isomorphic', () => {
    const gi = new GraphIsomorphism(0)
    expect(gi.isomorphic()).toBe(true)
  })

  it('single node graphs are isomorphic', () => {
    const gi = new GraphIsomorphism(1)
    expect(gi.isomorphic()).toBe(true)
  })

  it('isomorphic triangles', () => {
    const gi = new GraphIsomorphism(3)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(1, 2)
    gi.addEdgeG1(0, 2)
    gi.addEdgeG2(0, 1)
    gi.addEdgeG2(1, 2)
    gi.addEdgeG2(0, 2)
    expect(gi.isomorphic()).toBe(true)
  })

  it('non-isomorphic different edge counts', () => {
    const gi = new GraphIsomorphism(3)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG2(0, 1)
    gi.addEdgeG2(1, 2)
    expect(gi.isomorphic()).toBe(false)
  })

  it('isomorphic relabeled paths', () => {
    const gi = new GraphIsomorphism(4)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(1, 2)
    gi.addEdgeG1(2, 3)
    gi.addEdgeG2(1, 0)
    gi.addEdgeG2(2, 1)
    gi.addEdgeG2(3, 2)
    expect(gi.isomorphic()).toBe(true)
  })

  it('non-isomorphic star vs path', () => {
    const gi = new GraphIsomorphism(4)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(0, 2)
    gi.addEdgeG1(0, 3)
    gi.addEdgeG2(0, 1)
    gi.addEdgeG2(1, 2)
    gi.addEdgeG2(2, 3)
    expect(gi.isomorphic()).toBe(false)
  })

  it('isomorphic K4', () => {
    const gi = new GraphIsomorphism(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        gi.addEdgeG1(i, j)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        gi.addEdgeG2(i, j)
    expect(gi.isomorphic()).toBe(true)
  })

  it('non-isomorphic different degree sequences', () => {
    const gi = new GraphIsomorphism(4)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(0, 2)
    gi.addEdgeG1(0, 3)
    gi.addEdgeG2(0, 1)
    gi.addEdgeG2(1, 2)
    gi.addEdgeG2(2, 3)
    expect(gi.isomorphic()).toBe(false)
  })

  it('isomorphic empty graphs', () => {
    const gi = new GraphIsomorphism(3)
    expect(gi.isomorphic()).toBe(true)
  })

  it('handles two nodes with edge', () => {
    const gi = new GraphIsomorphism(2)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG2(0, 1)
    expect(gi.isomorphic()).toBe(true)
  })

  it('detects non-isomorphic by different edge count', () => {
    const gi = new GraphIsomorphism(3)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(1, 2)
    gi.addEdgeG2(0, 1)
    expect(gi.isomorphic()).toBe(false)
  })

  it('handles K3 vs K3', () => {
    const gi = new GraphIsomorphism(3)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(1, 2)
    gi.addEdgeG1(0, 2)
    gi.addEdgeG2(0, 1)
    gi.addEdgeG2(1, 2)
    gi.addEdgeG2(0, 2)
    expect(gi.isomorphic()).toBe(true)
  })

  it('non-isomorphic different node count', () => {
    const gi = new GraphIsomorphism(3)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG2(0, 1)
    gi.addEdgeG2(1, 2)
    expect(gi.isomorphic()).toBe(false)
  })

  it('handles single node isomorphic', () => {
    const gi = new GraphIsomorphism(1)
    expect(gi.isomorphic()).toBe(true)
  })

  it('isomorphic path graphs different labeling', () => {
    const gi = new GraphIsomorphism(3)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(1, 2)
    gi.addEdgeG2(1, 0)
    gi.addEdgeG2(2, 1)
    expect(gi.isomorphic()).toBe(true)
  })

  it('handles empty graphs isomorphic', () => {
    const gi = new GraphIsomorphism(3)
    expect(gi.isomorphic()).toBe(true)
  })

  it('star graphs isomorphic', () => {
    const gi = new GraphIsomorphism(4)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG1(0, 2)
    gi.addEdgeG1(0, 3)
    gi.addEdgeG2(1, 0)
    gi.addEdgeG2(2, 0)
    gi.addEdgeG2(3, 0)
    expect(gi.isomorphic()).toBe(true)
  })

  it('self loops detected', () => {
    const gi = new GraphIsomorphism(3, 3)
    gi.addEdgeG1(0, 0)
    gi.addEdgeG2(0, 1)
    expect(gi.isomorphic()).toBe(false)
  })

  it('same single edge graphs are isomorphic', () => {
    const gi = new GraphIsomorphism(2)
    gi.addEdgeG1(0, 1)
    gi.addEdgeG2(0, 1)
    expect(gi.isomorphic()).toBe(true)
  })
})
