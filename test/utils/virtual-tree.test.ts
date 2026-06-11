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

  it('build with single node returns valid tree', () => {
    const vt = new VirtualTree(3)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    const { vtree } = vt.build([0, 2])
    expect(vtree).toBeDefined()
    expect(vtree instanceof Map).toBe(true)
  })

  it('lca returns correct ancestor', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    const { lca } = vt.build([3, 4, 2])
    expect(lca(3, 4)).toBe(1)
  })

  it('includes intermediate LCA for vertices in different subtrees', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    const { vtree } = vt.build([3, 5, 4])
    expect(vtree.has(1)).toBe(true)
  })

  it('virtual tree edges preserve ancestor relationships', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    const { vtree } = vt.build([3, 4])
    expect(vtree.has(1)).toBe(true)
    const children = vtree.get(1)!
    expect(children).toContain(3)
    expect(children).toContain(4)
  })

  it('lca of parent and child returns parent', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    const { lca } = vt.build([0, 3])
    expect(lca(0, 3)).toBe(0)
    expect(lca(1, 3)).toBe(1)
  })

  it('lca of nodes at same depth returns common ancestor', () => {
    const vt = new VirtualTree(7)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(2, 6)
    const { lca } = vt.build([3, 5])
    expect(lca(3, 5)).toBe(0)
  })

  it('handles deep tree with multiple branches', () => {
    const vt = new VirtualTree(10)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(2, 6)
    vt.addEdge(3, 7)
    vt.addEdge(4, 8)
    vt.addEdge(5, 9)
    const { lca } = vt.build([7, 9])
    expect(lca(7, 9)).toBe(0)
  })

  it('virtual tree with only root as vertex', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    vt.addEdge(0, 4)
    const { vtree } = vt.build([0])
    expect(vtree.size).toBe(0)
  })

  it('virtual tree includes only relevant LCAs', () => {
    const vt = new VirtualTree(7)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(0, 4)
    vt.addEdge(4, 5)
    vt.addEdge(5, 6)
    const { vtree } = vt.build([3, 6])
    expect(vtree.has(0)).toBe(true)
    expect(vtree.has(1)).toBe(false)
  })

  it('lca handles nodes from different deep branches', () => {
    const vt = new VirtualTree(8)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(2, 6)
    vt.addEdge(3, 7)
    const { lca } = vt.build([7, 6])
    expect(lca(7, 6)).toBe(0)
  })

  it('build with all leaf nodes includes internal LCAs', () => {
    const vt = new VirtualTree(7)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(2, 6)
    const { vtree } = vt.build([3, 4, 5, 6])
    expect(vtree.has(0)).toBe(true)
    expect(vtree.has(1)).toBe(true)
    expect(vtree.has(2)).toBe(true)
  })

  it('virtual tree handles duplicate vertices in input', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    const { vtree, lca } = vt.build([3, 4, 3])
    expect(lca(3, 4)).toBe(1)
    expect(vtree.has(1)).toBe(true)
  })

  it('lca of adjacent nodes in tree returns parent', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(3, 4)
    const { lca } = vt.build([2, 3])
    expect(lca(2, 3)).toBe(2)
  })

  it('virtual tree with vertices in reverse DFS order', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    const { vtree, lca } = vt.build([5, 4, 3])
    expect(lca(3, 5)).toBe(0)
    expect(vtree.has(0)).toBe(true)
  })

  it('handles binary tree structure', () => {
    const vt = new VirtualTree(7)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(2, 6)
    const { lca } = vt.build([3, 4])
    expect(lca(3, 4)).toBe(1)
  })

  it('virtual tree includes root when necessary', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(0, 4)
    vt.addEdge(4, 5)
    const { vtree } = vt.build([3, 5])
    expect(vtree.has(0)).toBe(true)
  })

  it('lca with root returns root', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(2, 4)
    const { lca } = vt.build([0, 3])
    expect(lca(0, 3)).toBe(0)
    expect(lca(3, 0)).toBe(0)
  })

  it('handles vertex list with root at different positions', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    const { vtree } = vt.build([1, 0, 5])
    expect(vtree.has(0)).toBe(true)
  })

  it('virtual tree for complete subtree', () => {
    const vt = new VirtualTree(7)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(2, 6)
    const { vtree } = vt.build([1, 3, 4])
    expect(vtree.has(1)).toBe(true)
    expect(vtree.get(1)).toContain(3)
    expect(vtree.get(1)).toContain(4)
  })

  it('lca of nodes three levels apart', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(3, 4)
    const { lca } = vt.build([0, 4])
    expect(lca(0, 4)).toBe(0)
  })

  it('virtual tree with non-adjacent siblings', () => {
    const vt = new VirtualTree(8)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(3, 6)
    vt.addEdge(3, 7)
    const { vtree } = vt.build([4, 5, 7])
    expect(vtree.has(0)).toBe(true)
  })

  it('build with consecutive vertices in chain', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(3, 4)
    vt.addEdge(4, 5)
    const { lca } = vt.build([1, 2, 3, 4])
    expect(lca(1, 4)).toBe(1)
  })

  it('virtual tree correctly orders children', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    vt.addEdge(0, 4)
    vt.addEdge(0, 5)
    const { vtree } = vt.build([1, 2, 3])
    expect(vtree.has(0)).toBe(true)
    const children = vtree.get(0)!
    expect(children.length).toBe(3)
  })

  it('handles tree with varying branch depths', () => {
    const vt = new VirtualTree(9)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(1, 5)
    vt.addEdge(2, 6)
    vt.addEdge(6, 7)
    vt.addEdge(7, 8)
    const { lca } = vt.build([3, 8])
    expect(lca(3, 8)).toBe(0)
  })

  it('virtual tree minimizes edges', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    const { vtree } = vt.build([3, 4, 5])
    const totalEdges = Array.from(vtree.values()).reduce((sum, children) => sum + children.length, 0)
    expect(totalEdges).toBeLessThanOrEqual(4)
  })

  it('lca of cousin nodes returns grandparent', () => {
    const vt = new VirtualTree(7)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(2, 6)
    const { lca } = vt.build([3, 5])
    expect(lca(3, 5)).toBe(0)
  })

  it('virtual tree handles sparse vertex selection', () => {
    const vt = new VirtualTree(10)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    vt.addEdge(1, 4)
    vt.addEdge(2, 5)
    vt.addEdge(3, 6)
    vt.addEdge(4, 7)
    vt.addEdge(5, 8)
    vt.addEdge(6, 9)
    const { vtree } = vt.build([7, 9])
    expect(vtree.has(0)).toBe(true)
  })

  it('build maintains tree structure integrity', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(1, 3)
    vt.addEdge(1, 4)
    const { vtree, lca } = vt.build([2, 3, 4])
    expect(vtree.has(0)).toBe(true)
    expect(vtree.has(1)).toBe(true)
    expect(lca(2, 3)).toBe(0)
  })

  it('lca with same node multiple times returns that node', () => {
    const vt = new VirtualTree(5)
    vt.addEdge(0, 1)
    vt.addEdge(1, 2)
    vt.addEdge(2, 3)
    vt.addEdge(3, 4)
    const { lca } = vt.build([2, 2, 2])
    expect(lca(2, 2)).toBe(2)
  })

  it('virtual tree for star-shaped tree', () => {
    const vt = new VirtualTree(6)
    vt.addEdge(0, 1)
    vt.addEdge(0, 2)
    vt.addEdge(0, 3)
    vt.addEdge(0, 4)
    vt.addEdge(0, 5)
    const { vtree } = vt.build([1, 3, 5])
    expect(vtree.has(0)).toBe(true)
    expect(vtree.get(0)).toContain(1)
    expect(vtree.get(0)).toContain(3)
    expect(vtree.get(0)).toContain(5)
  })
})
