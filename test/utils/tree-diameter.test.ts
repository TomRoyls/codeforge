import { describe, expect, it } from 'vitest'
import { TreeDiameter } from '../../src/utils/tree-diameter.js'

describe('TreeDiameter', () => {
  it('handles single node', () => {
    const td = new TreeDiameter(1)
    expect(td.findDiameter()).toBe(0)
  })

  it('handles two nodes', () => {
    const td = new TreeDiameter(2)
    td.addEdge(0, 1)
    expect(td.findDiameter()).toBe(1)
  })

  it('handles path graph', () => {
    const td = new TreeDiameter(5)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(2, 3)
    td.addEdge(3, 4)
    expect(td.findDiameter()).toBe(4)
  })

  it('handles star graph', () => {
    const td = new TreeDiameter(5)
    td.addEdge(0, 1)
    td.addEdge(0, 2)
    td.addEdge(0, 3)
    td.addEdge(0, 4)
    expect(td.findDiameter()).toBe(2)
  })

  it('handles balanced binary tree', () => {
    const td = new TreeDiameter(7)
    td.addEdge(0, 1)
    td.addEdge(0, 2)
    td.addEdge(1, 3)
    td.addEdge(1, 4)
    td.addEdge(2, 5)
    td.addEdge(2, 6)
    expect(td.findDiameter()).toBe(4)
  })

  it('handles caterpillar tree', () => {
    const td = new TreeDiameter(5)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(2, 3)
    td.addEdge(3, 4)
    expect(td.findDiameter()).toBe(4)
  })

  it('finds diameter path', () => {
    const td = new TreeDiameter(4)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(2, 3)
    const path = td.findDiameterPath()
    const endpoints = new Set([path[0], path[path.length - 1]])
    expect(endpoints).toEqual(new Set([0, 3]))
    expect(path.length).toBe(4)
  })

  it('handles empty tree', () => {
    const td = new TreeDiameter(0)
    expect(td.findDiameter()).toBe(0)
    expect(td.findDiameterPath()).toEqual([])
  })

  it('handles Y-shaped tree', () => {
    const td = new TreeDiameter(5)
    td.addEdge(0, 1)
    td.addEdge(1, 2)
    td.addEdge(1, 3)
    td.addEdge(3, 4)
    expect(td.findDiameter()).toBe(3)
  })

  it('handles degenerate tree', () => {
    const td = new TreeDiameter(10)
    for (let i = 0; i < 9; i++) td.addEdge(i, i + 1)
    expect(td.findDiameter()).toBe(9)
  })
})
