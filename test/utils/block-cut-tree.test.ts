import { describe, expect, it } from 'vitest'
import { BlockCutTree } from '../../src/utils/block-cut-tree.js'

describe('BlockCutTree', () => {
  it('handles single edge', () => {
    const bct = new BlockCutTree(2)
    bct.addEdge(0, 1)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
    expect(componentOf.length).toBe(1)
  })

  it('finds articulation point in path', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
  })

  it('handles triangle (no AP)', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles single node', () => {
    const bct = new BlockCutTree(1)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(componentOf.length).toBe(0)
  })

  it('handles star graph', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(0, 2)
    bct.addEdge(0, 3)
    bct.addEdge(0, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(true)
  })

  it('handles disconnected graph', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(2, 3)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
    expect(componentOf.length).toBe(2)
  })

  it('handles cycle (no AP)', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 0)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles two triangles sharing vertex', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 2)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[2]).toBe(true)
    expect(componentOf.length).toBe(2)
  })

  it('handles line of 4 nodes', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('handles complete graph K4 (no AP)', () => {
    const bct = new BlockCutTree(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        bct.addEdge(i, j)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles bridge edge as separate component', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    bct.addEdge(5, 3)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[2]).toBe(true)
    expect(componentOf.length).toBe(3)
  })

  it('handles two bridges', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[3]).toBe(true)
  })

  it('handles single edge', () => {
    const bct = new BlockCutTree(2)
    bct.addEdge(0, 1)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles single node', () => {
    const bct = new BlockCutTree(1)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles star graph', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(0, 2)
    bct.addEdge(0, 3)
    bct.addEdge(0, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(true)
  })

  it('handles chain of four nodes', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('handles triangle no articulation', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('chain has internal articulation points', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('single node has no articulation points', () => {
    const bct = new BlockCutTree(1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
  })

  it('bridge edge in 2-node graph', () => {
    const bct = new BlockCutTree(2)
    bct.addEdge(0, 1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
  })

  it('two edges in a line creates articulation point', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
  })

  it('chain of 2 has middle articulation', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
  })

  it('single node is not articulation', () => {
    const bct = new BlockCutTree(1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
  })

  it('two nodes with edge has no articulation', () => {
    const bct = new BlockCutTree(2)
    bct.addEdge(0, 1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[1]).toBe(false)
  })
})
