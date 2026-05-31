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
})
