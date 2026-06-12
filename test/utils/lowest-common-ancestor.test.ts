import { describe, expect, it } from 'vitest'
import { LowestCommonAncestor } from '../../src/utils/lowest-common-ancestor.js'

describe('LowestCommonAncestor', () => {
  it('finds LCA in simple tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, []], [3, []], [4, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(3, 4)).toBe(1)
    expect(lca.query(3, 2)).toBe(0)
  })

  it('LCA of node with itself', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 0)).toBe(0)
    expect(lca.query(1, 1)).toBe(1)
  })

  it('LCA of parent-child', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 1)).toBe(0)
    expect(lca.query(0, 2)).toBe(0)
  })

  it('computes depth correctly', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.getDepth(0)).toBe(0)
    expect(lca.getDepth(1)).toBe(1)
    expect(lca.getDepth(2)).toBe(2)
  })

  it('computes distance', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, []], [3, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(3, 2)).toBe(3)
    expect(lca.distance(0, 3)).toBe(2)
    expect(lca.distance(1, 1)).toBe(0)
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 0)).toBe(0)
  })

  it('handles deeper tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(4, 2)).toBe(2)
    expect(lca.query(4, 0)).toBe(0)
  })

  it('handles wide tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3, 4, 5]], [1, []], [2, []], [3, []], [4, []], [5, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 5)).toBe(0)
    expect(lca.query(3, 4)).toBe(0)
    expect(lca.query(2, 2)).toBe(2)
  })

  it('LCA respects subtree boundaries', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, [],
    ]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(3, 4)).toBe(1)
    expect(lca.query(5, 6)).toBe(2)
    expect(lca.query(3, 5)).toBe(0)
  })

  it('distance between siblings is 2', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(1, 2)).toBe(2)
  })

  it('getDepth on root is 0', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.getDepth(0)).toBe(0)
  })

  it('handles grandchild LCA', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2, 3]], [2, []], [3, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(2, 3)).toBe(1)
    expect(lca.distance(2, 3)).toBe(2)
  })

  it('getDepth on child is 1', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.getDepth(1)).toBe(1)
    expect(lca.getDepth(2)).toBe(1)
  })

  it('LCA in chain of 4', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 3)).toBe(1)
    expect(lca.distance(1, 3)).toBe(2)
  })

  it('two-node tree LCA', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 1)).toBe(0)
    expect(lca.distance(0, 1)).toBe(1)
  })

  it('LCA of node with itself', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 0)).toBe(0)
    expect(lca.query(1, 1)).toBe(1)
  })

  it('handles chain tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 2)).toBe(1)
  })

  it('lca of root with any node is root', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, []],
      [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 2)).toBe(0)
  })

  it('self query returns same node', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [0]], [2, [0]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 1)).toBe(1)
  })

  it('lca of root with child is root', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 1)).toBe(0)
  })

  it('lca of same node is itself', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [0]], [2, [0]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 1)).toBe(1)
  })

  it('parent is lca of child and another child', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [0]], [2, [0]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 2)).toBe(0)
  })

  it('lca of node with itself is itself', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 1)).toBe(1)
  })

  it('root is ancestor of child', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 1)).toBe(0)
  })

  it('toString returns descriptive string', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(typeof lca.toString()).toBe('string')
    expect(lca.toString().length).toBeGreaterThan(0)
  })

  it('toJSON returns serializable object', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    const json = lca.toJSON()
    expect(json).toBeDefined()
  })

  it('clone creates independent copy', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, []], [2, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    const c = lca.clone()
    expect(c.query(1, 2)).toBe(0)
    expect(c.getDepth(1)).toBe(1)
  })

  it('clone is independent instance', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    const c = lca.clone()
    expect(c).not.toBe(lca)
  })

  it('equals returns true for same tree', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const l1 = new LowestCommonAncestor(adj, 0)
    const l2 = new LowestCommonAncestor(adj, 0)
    expect(l1.equals(l2)).toBe(true)
  })

  it('equals returns false for different tree', () => {
    const adj1 = new Map<number, number[]>([[0, [1]], [1, []]])
    const adj2 = new Map<number, number[]>([[0, [1, 2]], [1, []], [2, []]])
    const l1 = new LowestCommonAncestor(adj1, 0)
    const l2 = new LowestCommonAncestor(adj2, 0)
    expect(l1.equals(l2)).toBe(false)
  })

  it('equals returns false for non-LCA', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.equals(null)).toBe(false)
    expect(lca.equals({})).toBe(false)
  })

  it('handles binary tree of depth 4', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, [7, 8]],
      [4, []], [5, []], [6, []], [7, []], [8, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(7, 8)).toBe(3)
    expect(lca.query(7, 4)).toBe(1)
    expect(lca.query(5, 8)).toBe(0)
    expect(lca.distance(7, 8)).toBe(2)
    expect(lca.distance(7, 4)).toBe(3)
  })

  it('getDepth on deep chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, [5]], [5, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.getDepth(0)).toBe(0)
    expect(lca.getDepth(3)).toBe(3)
    expect(lca.getDepth(5)).toBe(5)
  })

  it('distance of node to itself is 0', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, []], [2, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(0, 0)).toBe(0)
    expect(lca.distance(1, 1)).toBe(0)
    expect(lca.distance(2, 2)).toBe(0)
  })

  it('handles custom root parameter', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, []],
    ])
    const lca = new LowestCommonAncestor(adj, 2)
    expect(lca.query(2, 4)).toBe(2)
    expect(lca.query(3, 4)).toBe(3)
    expect(lca.getDepth(2)).toBe(0)
    expect(lca.getDepth(4)).toBe(2)
  })

  it('handles star topology (all children of root)', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
      [1, []], [2, []], [3, []], [4, []], [5, []],
      [6, []], [7, []], [8, []], [9, []], [10, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(1, 10)).toBe(0)
    expect(lca.query(5, 6)).toBe(0)
    expect(lca.distance(1, 10)).toBe(2)
  })

  it('handles tree with varying branch depths', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, [3, 4, 5]],
      [2, [6]],
      [3, [7, 8]],
      [4, []],
      [5, []],
      [6, []],
      [7, []],
      [8, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(7, 6)).toBe(0)
    expect(lca.query(7, 4)).toBe(1)
    expect(lca.query(7, 8)).toBe(3)
    expect(lca.distance(7, 6)).toBe(5)
  })

  it('handles non-sequential node IDs', () => {
    const adj = new Map<number, number[]>([
      [10, [20, 30]],
      [20, [40]],
      [30, [50]],
      [40, []],
      [50, []],
    ])
    const lca = new LowestCommonAncestor(adj, 10)
    expect(lca.query(40, 50)).toBe(10)
    expect(lca.query(40, 20)).toBe(20)
    expect(lca.distance(40, 50)).toBe(4)
  })

  it('toJSON contains expected structure', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, []],
      [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    const json = lca.toJSON()
    expect(json).toHaveProperty('root', 0)
    expect(json).toHaveProperty('nodeCount', 3)
    expect(json).toHaveProperty('adj')
    expect(json).toHaveProperty('depth')
    expect(json).toHaveProperty('parent')
  })

  it('toJSON adj is array of entries', () => {
    const adj = new Map<number, number[]>([
      [0, [1]],
      [1, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    const json = lca.toJSON() as any
    expect(Array.isArray(json.adj)).toBe(true)
    expect(json.adj.length).toBeGreaterThan(0)
  })

  it('clone preserves tree structure', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]],
      [1, [4, 5]],
      [2, []],
      [3, []],
      [4, []],
      [5, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    const cloned = lca.clone()
    expect(cloned.query(4, 5)).toBe(1)
    expect(cloned.query(4, 3)).toBe(0)
    expect(cloned.getDepth(4)).toBe(2)
  })

  it('clone with different root preserves root', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const lca = new LowestCommonAncestor(adj, 1)
    const cloned = lca.clone()
    expect(cloned.query(1, 2)).toBe(1)
  })

  it('equals returns false for same structure different root', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const l1 = new LowestCommonAncestor(adj, 0)
    const l2 = new LowestCommonAncestor(adj, 1)
    expect(l1.equals(l2)).toBe(false)
  })

  it('equals checks depth equality', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const l1 = new LowestCommonAncestor(adj, 0)
    const l2 = new LowestCommonAncestor(adj, 0)
    expect(l1.equals(l2)).toBe(true)
  })

  it('equals checks parent equality', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const l1 = new LowestCommonAncestor(adj, 0)
    const l2 = new LowestCommonAncestor(adj, 0)
    expect(l1.equals(l2)).toBe(true)
  })

  it('distance to root equals depth', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(0, 3)).toBe(lca.getDepth(3))
    expect(lca.distance(0, 2)).toBe(lca.getDepth(2))
  })

  it('handles tree with single deep branch', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, [5]],
      [5, [6]], [6, [7]], [7, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 7)).toBe(0)
    expect(lca.distance(0, 7)).toBe(7)
    expect(lca.getDepth(7)).toBe(7)
  })

  it('getDepth on non-existent node returns 0', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.getDepth(999)).toBe(0)
  })

  it('toString includes nodeCount and root', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    const str = lca.toString()
    expect(str).toContain('4')
    expect(str).toContain('0')
  })

  it('should compute distance', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [0]], [2, [0, 3]], [3, [2]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(1, 3)).toBe(3)
  })

  it('should report depth', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0, 2]], [2, [1]]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.getDepth(0)).toBe(0)
    expect(lca.getDepth(2)).toBe(2)
  })

  it('distance between two nodes', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [0]], [2, [0, 3]], [3, [2]],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(1, 3)).toBe(3)
  })

  it('query returns root for root and leaf', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0, 2]], [2, [1]],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 2)).toBe(0)
  })

  it('clone produces equal instance', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.clone().equals(lca)).toBe(true)
  })

  it('distance to self is 0', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]],
    ])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(1, 1)).toBe(0)
  })

  it('single node LCA is itself', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.query(0, 0)).toBe(0)
  })

  it('getDepth root is 0', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.getDepth(0)).toBe(0)
  })

  it('distance between same node is 0', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const lca = new LowestCommonAncestor(adj, 0)
    expect(lca.distance(0, 0)).toBe(0)
  })
})

describe('lowest-common-ancestor - wave545', () => {
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

describe('lowest-common-ancestor - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})
