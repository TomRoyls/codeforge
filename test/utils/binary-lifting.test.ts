import { describe, it, expect } from 'vitest'
import { BinaryLifting } from '../../src/utils/binary-lifting.js'

describe('BinaryLifting', () => {
  it('finds LCA in simple tree', () => {
    const adj = [[1, 2], [3, 4], [], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(3, 4)).toBe(1)
    expect(bl.lca(3, 2)).toBe(0)
    expect(bl.lca(1, 2)).toBe(0)
  })

  it('finds LCA when one node is ancestor of other', () => {
    const adj = [[1], [2], [3], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 3)).toBe(0)
    expect(bl.lca(1, 3)).toBe(1)
  })

  it('finds LCA when both nodes are same', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(1, 1)).toBe(1)
  })

  it('computes distance between nodes', () => {
    const adj = [[1, 2], [3], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.distance(3, 2)).toBe(3)
    expect(bl.distance(0, 3)).toBe(2)
    expect(bl.distance(1, 1)).toBe(0)
  })

  it('finds kth ancestor', () => {
    const adj = [[1], [2], [3], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(3, 0)).toBe(3)
    expect(bl.kthAncestor(3, 1)).toBe(2)
    expect(bl.kthAncestor(3, 2)).toBe(1)
    expect(bl.kthAncestor(3, 3)).toBe(0)
    expect(bl.kthAncestor(3, 4)).toBe(-1)
  })

  it('checks ancestor relationship', () => {
    const adj = [[1, 2], [3], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.isAncestor(0, 3)).toBe(true)
    expect(bl.isAncestor(1, 3)).toBe(true)
    expect(bl.isAncestor(2, 3)).toBe(false)
    expect(bl.isAncestor(3, 0)).toBe(false)
  })

  it('reports correct depth', () => {
    const adj = [[1, 2], [3], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.getDepth(0)).toBe(0)
    expect(bl.getDepth(1)).toBe(1)
    expect(bl.getDepth(3)).toBe(2)
  })

  it('reports parent', () => {
    const adj = [[1, 2], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.getParent(0)).toBe(-1)
    expect(bl.getParent(1)).toBe(0)
    expect(bl.getParent(2)).toBe(0)
  })

  it('handles single node tree', () => {
    const adj = [[]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 0)).toBe(0)
    expect(bl.distance(0, 0)).toBe(0)
    expect(bl.getDepth(0)).toBe(0)
  })

  it('handles empty tree', () => {
    const bl = new BinaryLifting([], 0)
    expect(bl.getDepth(0)).toBeUndefined()
  })

  it('handles deep chain', () => {
    const n = 20
    const adj: number[][] = Array.from({ length: n }, () => [])
    for (let i = 0; i < n - 1; i++) {
      adj[i]!.push(i + 1)
    }
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, n - 1)).toBe(0)
    expect(bl.distance(0, n - 1)).toBe(n - 1)
    expect(bl.kthAncestor(n - 1, n - 1)).toBe(0)
  })

  it('handles star graph', () => {
    const adj = [[1, 2, 3, 4], [], [], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(1, 4)).toBe(0)
    expect(bl.lca(2, 3)).toBe(0)
    expect(bl.distance(1, 4)).toBe(2)
  })

  it('handles binary tree', () => {
    const adj: number[][] = Array.from({ length: 7 }, () => [])
    adj[0] = [1, 2]
    adj[1] = [3, 4]
    adj[2] = [5, 6]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(3, 4)).toBe(1)
    expect(bl.lca(3, 5)).toBe(0)
    expect(bl.lca(5, 6)).toBe(2)
    expect(bl.distance(3, 6)).toBe(4)
  })

  it('kthAncestor of root returns -1', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
    expect(bl.kthAncestor(0, 0)).toBe(0)
  })

  it('handles wider tree with many children', () => {
    const adj: number[][] = Array.from({ length: 10 }, () => [])
    adj[0] = [1, 2, 3, 4, 5]
    adj[1] = [6, 7]
    adj[2] = [8, 9]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(6, 9)).toBe(0)
    expect(bl.lca(6, 7)).toBe(1)
    expect(bl.distance(6, 9)).toBe(4)
  })

  it('getDepth returns correct values for linear chain', () => {
    const adj: number[][] = Array.from({ length: 6 }, () => [])
    for (let i = 0; i < 5; i++) adj[i]!.push(i + 1)
    const bl = new BinaryLifting(adj, 0)
    for (let i = 0; i < 6; i++) {
      expect(bl.getDepth(i)).toBe(i)
    }
  })

  it('lca of same node is itself', () => {
    const adj = [[1, 2], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 0)).toBe(0)
    expect(bl.lca(1, 1)).toBe(1)
  })

  it('kthAncestor returns correct ancestor', () => {
    const adj: number[][] = Array.from({ length: 5 }, () => [])
    for (let i = 0; i < 4; i++) adj[i]!.push(i + 1)
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(4, 2)).toBe(2)
    expect(bl.kthAncestor(4, 4)).toBe(0)
  })

  it('lca of root with any node is root', () => {
    const adj = [[1, 2], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 2)).toBe(0)
  })

  it('lca of same node is itself', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 0)).toBe(0)
  })

  it('parent of root is -1', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(1, 1)).toBe(1)
  })

  it('kthAncestor of root is -1', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
  })

  it('parent of child is correct', () => {
    const adj = [[1], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(1, 1)).toBe(0)
  })

  it('root has no ancestor', () => {
    const adj = [[1], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
  })

  it('parent of root is -1', () => {
    const adj = [[1, 2], [0], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
  })
})
