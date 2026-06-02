import { describe, expect, it } from 'vitest'
import { DominatorTree } from '../../src/utils/dominator-tree.js'

describe('DominatorTree', () => {
  it('single node dominates itself', () => {
    const dt = new DominatorTree(1)
    expect(dt.build(0)).toEqual([0])
  })

  it('path domination', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    expect(dt.build(0)).toEqual([0, 0, 1])
  })

  it('diamond domination', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    expect(dt.build(0)).toEqual([0, 0, 0, 0])
  })

  it('dominates check', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    expect(dt.dominates(0, 0, 2)).toBe(true)
    expect(dt.dominates(0, 1, 2)).toBe(true)
  })

  it('non-dominator check', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    expect(dt.dominates(0, 1, 2)).toBe(false)
  })

  it('branch domination', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    const dom = dt.build(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(0)
    expect(dom[3]).toBe(1)
  })

  it('unreachable nodes', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    expect(dt.build(0)).toEqual([0, 0, -1])
  })

  it('self-loop domination', () => {
    const dt = new DominatorTree(2)
    dt.addEdge(0, 1)
    dt.addEdge(1, 1)
    expect(dt.build(0)).toEqual([0, 0])
  })

  it('complex graph', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    const dom = dt.build(0)
    expect(dom[4]).toBe(3)
  })

  it('empty graph', () => {
    const dt = new DominatorTree(3)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(-1)
  })

  it('linear chain', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    const dom = dt.build(0)
    expect(dom).toEqual([0, 0, 1, 2, 3])
  })

  it('handles branching graph', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 4)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(0)
    expect(dom[3]).toBe(1)
    expect(dom[4]).toBe(2)
  })

  it('diamond merge point', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
  })

  it('handles single node', () => {
    const dt = new DominatorTree(1)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
  })

  it('two edges to same target', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
    expect(dom[1]).toBe(0)
  })

  it('handles two node chain', () => {
    const dt = new DominatorTree(2)
    dt.addEdge(0, 1)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
  })

  it('handles self loop', () => {
    const dt = new DominatorTree(2)
    dt.addEdge(0, 1)
    dt.addEdge(1, 1)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
  })

  it('single node dominates itself', () => {
    const dt = new DominatorTree(1)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
  })

  it('linear chain dominators', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    const dom = dt.build(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(1)
  })
})
