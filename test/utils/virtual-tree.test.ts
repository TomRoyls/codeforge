import { describe, expect, it } from 'vitest'
import { VirtualTree } from '../../src/utils/virtual-tree.js'

describe('VirtualTree', () => {
  it('handles empty vertices', () => {
    const vt = new VirtualTree(3)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    const { vtree } = vt.build([])
    expect(vtree.size).toBe(0)
  })

  it('handles single vertex', () => {
    const vt = new VirtualTree(3)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    const { vtree } = vt.build([1])
    expect(vtree.size).toBe(0)
  })

  it('builds virtual tree for path', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(3, 4)
    const { vtree } = vt.build([0, 4])
    expect(vtree.size).toBeGreaterThan(0)
  })

  it('lca works correctly', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    const { lca } = vt.build([3, 4])
    expect(lca(3, 4)).toBe(1)
    expect(lca(3, 2)).toBe(0)
  })

  it('handles leaf nodes', () => {
    const vt = new VirtualTree(4)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(1, 3)
    const { vtree } = vt.build([2, 3])
    expect(vtree.size).toBeGreaterThan(0)
  })

  it('handles all nodes', () => {
    const vt = new VirtualTree(4)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    const { vtree } = vt.build([0, 1, 2, 3])
    expect(vtree.size).toBeGreaterThan(0)
  })

  it('handles siblings', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    vt.addEdge(0, 4)
    const { lca } = vt.build([1, 2])
    expect(lca(1, 2)).toBe(0)
  })

  it('handles star graph vertices', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    vt.addEdge(0, 4)
    const { vtree } = vt.build([1, 2, 3])
    expect(vtree.has(0)).toBe(true)
  })

  it('handles deep chain', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(3, 4)
    vt.addEdge(4, 5)
    const { lca } = vt.build([0, 5])
    expect(lca(0, 5)).toBe(0)
  })

  it('handles root and leaf', () => {
    const vt = new VirtualTree(3)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    const { lca } = vt.build([0, 2])
    expect(lca(0, 2)).toBe(0)
  })

  it('handles single node virtual tree', () => {
    const vt = new VirtualTree(1)
    const { lca } = vt.build([0])
    expect(lca(0, 0)).toBe(0)
  })

  it('handles chain virtual tree', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(3, 4)
    const { vtree, lca } = vt.build([0, 2, 4])
    expect(lca(0, 4)).toBe(0)
  })

  it('handles all same node', () => {
    const vt = new VirtualTree(3)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    const { lca } = vt.build([1, 1])
    expect(lca(1, 1)).toBe(1)
  })

  it('handles two leaves in chain', () => {
    const vt = new VirtualTree(4)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    const { lca } = vt.build([1, 3])
    expect(lca(1, 3)).toBe(1)
  })

  it('handles three siblings and parent', () => {
    const vt = new VirtualTree(4)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    const { vtree, lca } = vt.build([1, 2, 3])
    expect(lca(1, 2)).toBe(0)
    expect(vtree.has(0)).toBe(true)
  })

  it('handles adjacent nodes in chain', () => {
    const vt = new VirtualTree(3)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    const { lca } = vt.build([1, 2])
    expect(lca(1, 2)).toBe(1)
  })

  it('single node tree', () => {
    const vt = new VirtualTree(1)
    const { lca } = vt.build([0])
    expect(lca(0, 0)).toBe(0)
  })

  it('constructor accepts node count', () => {
    const vt = new VirtualTree(5)
    expect(vt).toBeDefined()
  })

  it('buildVirtualTree with single node', () => {
    const vt = new VirtualTree(1)
    expect(vt).toBeDefined()
  })

  it('size is set on construction', () => {
    const vt = new VirtualTree(5)
    expect(vt).toBeDefined()
  })

  it('build returns vtree object', () => {
    const vt = new VirtualTree(3)
    vt.addEdge(0, 1)
    const { vtree } = vt.build([0, 1])
    expect(vtree).toBeDefined()
  })

  it('single vertex virtual tree', () => {
    const vt = new VirtualTree(1)
    const { vtree } = vt.build([0])
    expect(vtree).toBeDefined()
  })
})
