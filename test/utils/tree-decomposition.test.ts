import { describe, expect, it } from 'vitest'
import { TreeDecomposition } from '../../src/utils/tree-decomposition.js'

describe('TreeDecomposition', () => {
  it('single node treewidth 0', () => {
    const td = new TreeDecomposition(1)
    expect(td.treewidth()).toBe(0)
  })

  it('tree treewidth 1', () => {
    const td = new TreeDecomposition(3)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    expect(td.treewidth()).toBe(1)
  })

  it('triangle treewidth 2', () => {
    const td = new TreeDecomposition(3)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(0, 2)
    expect(td.treewidth()).toBe(2)
  })

  it('path treewidth 1', () => {
    const td = new TreeDecomposition(4)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(2, 3)
    expect(td.treewidth()).toBe(1)
  })

  it('K4 treewidth 3', () => {
    const td = new TreeDecomposition(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        td.addEdge(i, j)
    expect(td.treewidth()).toBe(3)
  })

  it('star treewidth 1', () => {
    const td = new TreeDecomposition(4)
    td.addEdge(0, 1)
    td.addEdge(0, 2)
    td.addEdge(0, 3)
    expect(td.treewidth()).toBe(1)
  })

  it('bags cover all vertices', () => {
    const td = new TreeDecomposition(4)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(2, 3)
    const bags = td.bags()
    const allVertices = new Set<number>()
    for (const bag of bags) {
      for (const v of bag) allVertices.add(v)
    }
    expect(allVertices.size).toBe(4)
  })

  it('empty graph treewidth 0', () => {
    const td = new TreeDecomposition(3)
    expect(td.treewidth()).toBe(0)
  })

  it('single edge treewidth 1', () => {
    const td = new TreeDecomposition(2)
    td.addEdge(0, 1)
    expect(td.treewidth()).toBe(1)
  })

  it('diamond treewidth 2', () => {
    const td = new TreeDecomposition(4)
    td.addEdge(0, 1)
    td.addEdge(0, 2)
    td.addEdge(1, 3)
    td.addEdge(2, 3)
    expect(td.treewidth()).toBe(2)
  })

  it('path graph low treewidth', () => {
    const td = new TreeDecomposition(5)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(2, 3)
    td.addEdge(3, 4)
    expect(td.treewidth()).toBeLessThanOrEqual(2)
  })

  it('K4 has higher treewidth', () => {
    const td = new TreeDecomposition(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        td.addEdge(i, j)
    expect(td.treewidth()).toBe(3)
  })

  it('handles single node', () => {
    const td = new TreeDecomposition(1)
    expect(td.treewidth()).toBe(0)
  })

  it('handles triangle treewidth', () => {
    const td = new TreeDecomposition(3)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(0, 2)
    expect(td.treewidth()).toBe(2)
  })
})
