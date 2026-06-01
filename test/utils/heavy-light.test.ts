import { describe, expect, it } from 'vitest'
import { HeavyLightDecomposition } from '../../src/utils/heavy-light.js'

describe('HeavyLightDecomposition', () => {
  it('finds LCA in simple tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 2)).toBe(0)
  })

  it('LCA of same node is itself', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.lca(1, 1)).toBe(1)
  })

  it('LCA of parent-child is parent', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
  })

  it('computes distance', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, []], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(3, 2)).toBe(3)
    expect(hld.distance(0, 3)).toBe(2)
    expect(hld.distance(1, 1)).toBe(0)
  })

  it('handles chain tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 1)).toBe(1)
    expect(hld.distance(3, 0)).toBe(3)
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.distance(0, 0)).toBe(0)
  })

  it('handles deeper tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, [],
    ]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 4)).toBe(1)
    expect(hld.lca(3, 5)).toBe(0)
    expect(hld.distance(3, 6)).toBe(4)
  })

  it('handles wide tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3, 4, 5]], [1, []], [2, []], [3, []], [4, []], [5, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 5)).toBe(0)
    expect(hld.distance(1, 5)).toBe(2)
    expect(hld.distance(3, 3)).toBe(0)
  })

  it('handles two-node tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
    expect(hld.distance(0, 1)).toBe(1)
  })

  it('LCA of siblings is parent in deep tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3, 4]], [3, []], [4, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 4)).toBe(2)
    expect(hld.distance(3, 4)).toBe(2)
  })

  it('distance in star graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(1, 2)).toBe(2)
    expect(hld.distance(0, 3)).toBe(1)
  })

  it('handles deep chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, [5]], [5, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 5)).toBe(0)
    expect(hld.distance(0, 5)).toBe(5)
  })

  it('single node tree', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.distance(0, 0)).toBe(0)
  })

  it('handles binary tree LCA', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, [3, 4]],
      [2, [5, 6]],
      [3, []],
      [4, []],
      [5, []],
      [6, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(4, 5)).toBe(0)
    expect(hld.lca(3, 4)).toBe(1)
  })

  it('distance between root and leaf in chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(0, 3)).toBe(3)
    expect(hld.distance(1, 3)).toBe(2)
  })

  it('handles two node tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
    expect(hld.distance(0, 1)).toBe(1)
  })

  it('handles path query on root', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [0]], [2, [0]],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 2)).toBe(0)
  })
})
