import { describe, it, expect } from 'vitest'
import { HeavyLightDecomposition } from '../../src/utils/heavy-light-decomposition.js'

describe('HeavyLightDecomposition', () => {
  it('computes lca correctly for simple line tree', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(0, 4)).toBe(0)
    expect(hld.lca(1, 3)).toBe(1)
    expect(hld.lca(2, 4)).toBe(2)
    expect(hld.lca(3, 4)).toBe(3)
  })

  it('computes path distance correctly for line tree', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.pathDistance(0, 4)).toBe(4)
    expect(hld.pathDistance(1, 3)).toBe(2)
    expect(hld.pathDistance(2, 4)).toBe(2)
    expect(hld.pathDistance(3, 4)).toBe(1)
    expect(hld.pathDistance(0, 0)).toBe(0)
  })

  it('checks ancestor relationships correctly for line tree', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(0, 4)).toBe(true)
    expect(hld.isAncestor(1, 3)).toBe(true)
    expect(hld.isAncestor(2, 4)).toBe(true)
    expect(hld.isAncestor(3, 4)).toBe(true)
    expect(hld.isAncestor(4, 0)).toBe(false)
    expect(hld.isAncestor(4, 3)).toBe(false)
    expect(hld.isAncestor(3, 2)).toBe(false)
  })

  it('computes lca correctly for star tree', () => {
    const adjacencyList = [
      [1, 2, 3, 4],
      [0],
      [0],
      [0],
      [0],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(1, 2)).toBe(0)
    expect(hld.lca(1, 3)).toBe(0)
    expect(hld.lca(1, 4)).toBe(0)
    expect(hld.lca(2, 3)).toBe(0)
    expect(hld.lca(2, 4)).toBe(0)
    expect(hld.lca(3, 4)).toBe(0)
    expect(hld.lca(0, 4)).toBe(0)
  })

  it('computes path distance correctly for star tree', () => {
    const adjacencyList = [
      [1, 2, 3, 4],
      [0],
      [0],
      [0],
      [0],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.pathDistance(1, 2)).toBe(2)
    expect(hld.pathDistance(1, 3)).toBe(2)
    expect(hld.pathDistance(1, 4)).toBe(2)
    expect(hld.pathDistance(0, 4)).toBe(1)
    expect(hld.pathDistance(1, 1)).toBe(0)
  })

  it('computes lca correctly for balanced binary tree', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(3, 4)).toBe(1)
    expect(hld.lca(5, 6)).toBe(2)
    expect(hld.lca(3, 5)).toBe(0)
    expect(hld.lca(4, 6)).toBe(0)
    expect(hld.lca(0, 5)).toBe(0)
    expect(hld.lca(3, 3)).toBe(3)
  })

  it('computes path distance correctly for balanced binary tree', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.pathDistance(3, 4)).toBe(2)
    expect(hld.pathDistance(5, 6)).toBe(2)
    expect(hld.pathDistance(3, 5)).toBe(4)
    expect(hld.pathDistance(4, 6)).toBe(4)
    expect(hld.pathDistance(0, 3)).toBe(2)
    expect(hld.pathDistance(1, 5)).toBe(3)
  })

  it('identifies direct parent as ancestor', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(1, 3)).toBe(true)
    expect(hld.isAncestor(1, 4)).toBe(true)
    expect(hld.isAncestor(2, 5)).toBe(true)
    expect(hld.isAncestor(2, 6)).toBe(true)
    expect(hld.isAncestor(0, 1)).toBe(true)
    expect(hld.isAncestor(0, 2)).toBe(true)
  })

  it('identifies deeper ancestors correctly', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(0, 3)).toBe(true)
    expect(hld.isAncestor(0, 4)).toBe(true)
    expect(hld.isAncestor(0, 5)).toBe(true)
    expect(hld.isAncestor(0, 6)).toBe(true)
    expect(hld.isAncestor(0, 0)).toBe(true)
  })

  it('identifies that leaf is not ancestor of non-descendants', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.isAncestor(3, 4)).toBe(false)
    expect(hld.isAncestor(3, 5)).toBe(false)
    expect(hld.isAncestor(3, 6)).toBe(false)
    expect(hld.isAncestor(4, 5)).toBe(false)
    expect(hld.isAncestor(4, 6)).toBe(false)
    expect(hld.isAncestor(5, 3)).toBe(false)
  })

  it('returns correct path between nodes', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.getPath(0, 4)).toEqual([0, 1, 2, 3, 4])
    expect(hld.getPath(1, 3)).toEqual([1, 2, 3])
    expect(hld.getPath(2, 4)).toEqual([2, 3, 4])
    expect(hld.getPath(0, 0)).toEqual([0])
  })

  it('getPath returns correct order for bottom-up paths', () => {
    const adjacencyList = [
      [1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.getPath(4, 0)).toEqual([4, 3, 2, 1, 0])
    expect(hld.getPath(3, 1)).toEqual([3, 2, 1])
    expect(hld.getPath(4, 2)).toEqual([4, 3, 2])
  })

  it('getPath returns correct order for cross-branch paths', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.getPath(3, 5)).toEqual([3, 1, 0, 2, 5])
    expect(hld.getPath(6, 4)).toEqual([6, 2, 0, 1, 4])
    expect(hld.getPath(3, 6)).toEqual([3, 1, 0, 2, 6])
  })

  it('confirms root is ancestor of everyone', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    for (let i = 0; i < hld.nodeCount; i++) {
      expect(hld.isAncestor(0, i)).toBe(true)
    }
  })

  it('handles single node tree', () => {
    const adjacencyList: number[][] = [[]]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.nodeCount).toBe(1)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.pathDistance(0, 0)).toBe(0)
    expect(hld.isAncestor(0, 0)).toBe(true)
    expect(hld.getPath(0, 0)).toEqual([0])
  })

  it('handles complex tree with mixed heavy and light edges', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3],
      [0, 4, 5],
      [1, 6],
      [2],
      [2, 7, 8],
      [3],
      [5],
      [5],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    expect(hld.lca(6, 7)).toBe(0)
    expect(hld.lca(6, 8)).toBe(0)
    expect(hld.lca(3, 4)).toBe(0)
    expect(hld.pathDistance(6, 7)).toBe(6)
    expect(hld.pathDistance(3, 4)).toBe(4)
    expect(hld.pathDistance(1, 5)).toBe(3)
  })

  it('path distance equals path length for various queries', () => {
    const adjacencyList = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adjacencyList, 0)
    for (let u = 0; u < hld.nodeCount; u++) {
      for (let v = 0; v < hld.nodeCount; v++) {
        const path = hld.getPath(u, v)
        const expectedDistance = path.length - 1
        const actualDistance = hld.pathDistance(u, v)
        expect(actualDistance).toBe(expectedDistance)
      }
    }
  })

  it('handles two-node tree', () => {
    const adj = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
    expect(hld.pathDistance(0, 1)).toBe(1)
    expect(hld.getPath(0, 1)).toEqual([0, 1])
  })

  it('lca of same node is itself', () => {
    const adj = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.lca(1, 1)).toBe(1)
  })

  it('pathDistance of node to itself is 0', () => {
    const adj = [[1, 2], [0], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(0, 0)).toBe(0)
    expect(hld.pathDistance(1, 1)).toBe(0)
    expect(hld.pathDistance(2, 2)).toBe(0)
  })

  it('path distance of parent to child', () => {
    const adj = [[1, 2], [3], [], []]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(0, 3)).toBe(2)
    expect(hld.pathDistance(0, 1)).toBe(1)
    expect(hld.pathDistance(0, 2)).toBe(1)
  })

  it('nodeCount returns correct count', () => {
    expect(new HeavyLightDecomposition([[]], 0).nodeCount).toBe(1)
    expect(new HeavyLightDecomposition([[1], [0]], 0).nodeCount).toBe(2)
    expect(new HeavyLightDecomposition([[1, 2], [0], [0]], 0).nodeCount).toBe(3)
  })

  it('toString returns correct format', () => {
    const hld = new HeavyLightDecomposition([[1], [0]], 0)
    expect(hld.toString()).toBe('HeavyLightDecomposition(2)')
    expect(new HeavyLightDecomposition([[]], 0).toString()).toBe('HeavyLightDecomposition(1)')
  })

  it('toJSON returns structured data', () => {
    const hld = new HeavyLightDecomposition([[1], [0]], 0)
    const json = hld.toJSON() as Record<string, unknown>
    expect(json.nodeCount).toBe(2)
    expect(Array.isArray(json.parent)).toBe(true)
    expect(Array.isArray(json.depth)).toBe(true)
    expect(Array.isArray(json.heavy)).toBe(true)
    expect(Array.isArray(json.head)).toBe(true)
    expect(Array.isArray(json.position)).toBe(true)
    expect((json.parent as number[]).length).toBe(2)
    expect((json.depth as number[]).length).toBe(2)
  })

  it('toJSON depth values are correct', () => {
    const adj = [[1, 2], [0, 3], [0], [1]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON() as Record<string, number[]>
    expect(json.depth![0]).toBe(0)
    expect(json.depth![1]).toBe(1)
    expect(json.depth![2]).toBe(1)
    expect(json.depth![3]).toBe(2)
  })

  it('toJSON parent values are correct', () => {
    const adj = [[1, 2], [0, 3], [0], [1]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON() as Record<string, number[]>
    expect(json.parent![0]).toBe(-1)
    expect(json.parent![1]).toBe(0)
    expect(json.parent![2]).toBe(0)
    expect(json.parent![3]).toBe(1)
  })

  it('clone produces equal decomposition', () => {
    const adj = [[1, 2], [0, 3], [0], [1]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const cloned = hld.clone()
    expect(cloned.equals(hld)).toBe(true)
    expect(hld.equals(cloned)).toBe(true)
  })

  it('clone is independent from original', () => {
    const adj = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const cloned = hld.clone()
    expect(cloned.nodeCount).toBe(hld.nodeCount)
    expect(cloned.toString()).toBe(hld.toString())
  })

  it('equals returns false for non-HLD object', () => {
    const hld = new HeavyLightDecomposition([[1], [0]], 0)
    expect(hld.equals(null)).toBe(false)
    expect(hld.equals(undefined)).toBe(false)
    expect(hld.equals({})).toBe(false)
    expect(hld.equals('string')).toBe(false)
    expect(hld.equals(42)).toBe(false)
  })

  it('equals returns false for different node counts', () => {
    const hld1 = new HeavyLightDecomposition([[]], 0)
    const hld2 = new HeavyLightDecomposition([[1], [0]], 0)
    expect(hld1.equals(hld2)).toBe(false)
    expect(hld2.equals(hld1)).toBe(false)
  })

  it('equals returns true for same adjacency list', () => {
    const adj = [[1, 2], [0], [0]]
    const hld1 = new HeavyLightDecomposition(adj, 0)
    const hld2 = new HeavyLightDecomposition(adj, 0)
    expect(hld1.equals(hld2)).toBe(true)
  })

  it('lca of siblings is their parent', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 2)).toBe(0)
    expect(hld.lca(2, 3)).toBe(0)
    expect(hld.lca(1, 3)).toBe(0)
  })

  it('isAncestor returns true for self', () => {
    const adj = [[1, 2], [0], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.isAncestor(0, 0)).toBe(true)
    expect(hld.isAncestor(1, 1)).toBe(true)
    expect(hld.isAncestor(2, 2)).toBe(true)
  })

  it('isAncestor returns false for child of parent', () => {
    const adj = [[1, 2], [0], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.isAncestor(1, 0)).toBe(false)
    expect(hld.isAncestor(2, 0)).toBe(false)
  })

  it('handles three-node chain', () => {
    const adj = [[1], [0, 2], [1]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 2)).toBe(0)
    expect(hld.pathDistance(0, 2)).toBe(2)
    expect(hld.getPath(0, 2)).toEqual([0, 1, 2])
    expect(hld.lca(1, 2)).toBe(1)
    expect(hld.pathDistance(1, 2)).toBe(1)
  })

  it('handles deeper binary tree', () => {
    const adj = [
      [1, 2],       // 0
      [0, 3, 4],    // 1
      [0, 5, 6],    // 2
      [1, 7, 8],    // 3
      [1],          // 4
      [2],          // 5
      [2, 9, 10],   // 6
      [3],          // 7
      [3],          // 8
      [6],          // 9
      [6],          // 10
    ]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.nodeCount).toBe(11)
    expect(hld.lca(7, 8)).toBe(3)
    expect(hld.lca(9, 10)).toBe(6)
    expect(hld.lca(7, 9)).toBe(0)
    expect(hld.pathDistance(7, 10)).toBe(6)
    expect(hld.pathDistance(4, 5)).toBe(4)
  })

  it('getPath between same node returns single element', () => {
    const adj = [[1, 2], [0], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.getPath(0, 0)).toEqual([0])
    expect(hld.getPath(1, 1)).toEqual([1])
    expect(hld.getPath(2, 2)).toEqual([2])
  })

  it('handles skewed tree (degenerate to list)', () => {
    const adj = [[1], [2], [3], [4], []]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(0, 4)).toBe(4)
    expect(hld.lca(0, 4)).toBe(0)
    expect(hld.getPath(0, 4)).toEqual([0, 1, 2, 3, 4])
    expect(hld.isAncestor(0, 4)).toBe(true)
    expect(hld.isAncestor(2, 4)).toBe(true)
    expect(hld.isAncestor(4, 0)).toBe(false)
  })

  it('handles caterpillar tree', () => {
    const adj = [
      [1, 3, 5],
      [0, 2],
      [1],
      [0, 4],
      [3],
      [0],
    ]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(2, 4)).toBe(0)
    expect(hld.lca(2, 5)).toBe(0)
    expect(hld.pathDistance(2, 4)).toBe(4)
    expect(hld.pathDistance(2, 5)).toBe(3)
  })

  it('clone with larger tree preserves all properties', () => {
    const adj = [
      [1, 2],
      [0, 3, 4],
      [0, 5, 6],
      [1],
      [1],
      [2],
      [2],
    ]
    const hld = new HeavyLightDecomposition(adj, 0)
    const cloned = hld.clone()
    expect(cloned.nodeCount).toBe(hld.nodeCount)
    for (let i = 0; i < hld.nodeCount; i++) {
      for (let j = 0; j < hld.nodeCount; j++) {
        expect(cloned.lca(i, j)).toBe(hld.lca(i, j))
        expect(cloned.pathDistance(i, j)).toBe(hld.pathDistance(i, j))
      }
    }
  })

  it('handles large star with many leaves', () => {
    const n = 20
    const adj: number[][] = Array.from({ length: n }, () => [])
    for (let i = 1; i < n; i++) {
      adj[0]!.push(i)
      adj[i]!.push(0)
    }
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.nodeCount).toBe(n)
    for (let i = 1; i < n; i++) {
      expect(hld.lca(0, i)).toBe(0)
      expect(hld.pathDistance(0, i)).toBe(1)
    }
    for (let i = 1; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        expect(hld.lca(i, j)).toBe(0)
        expect(hld.pathDistance(i, j)).toBe(2)
      }
    }
  })

  it('toJSON on single node', () => {
    const hld = new HeavyLightDecomposition([[]], 0)
    const json = hld.toJSON() as Record<string, unknown>
    expect(json.nodeCount).toBe(1)
  })

  it('position array has unique values', () => {
    const adj = [[1, 2], [0, 3], [0], [1]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON() as Record<string, number[]>
    const positions = json.position!
    const unique = new Set(positions)
    expect(unique.size).toBe(positions.length)
  })

  it('head of root is root', () => {
    const adj = [[1, 2], [0], [0]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON() as Record<string, number[]>
    expect(json.head![0]).toBe(0)
  })

  it('depth values increase from root', () => {
    const adj = [[1, 2], [0, 3], [0], [1]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON() as Record<string, number[]>
    for (let i = 0; i < json.depth!.length; i++) {
      if (i !== 0) {
        expect(json.depth![i]).toBeGreaterThan(0)
      }
    }
  })

  it('handles four-level deep chain', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.pathDistance(0, 3)).toBe(3)
    expect(hld.lca(0, 3)).toBe(0)
    expect(hld.isAncestor(1, 3)).toBe(true)
    expect(hld.getPath(0, 3)).toEqual([0, 1, 2, 3])
  })

  it('getPath with cross branches through root', () => {
    const adj = [[1, 2], [0, 3, 4], [0, 5], [1], [1], [2]]
    const hld = new HeavyLightDecomposition(adj, 0)
    const path35 = hld.getPath(3, 5)
    expect(path35[0]).toBe(3)
    expect(path35[path35.length - 1]).toBe(5)
    expect(path35).toContain(0)
    expect(hld.pathDistance(3, 5)).toBe(path35.length - 1)
  })

  it('lca is on the path between two nodes', () => {
    const adj = [[1, 2], [0, 3, 4], [0, 5, 6], [1], [1], [2], [2]]
    const hld = new HeavyLightDecomposition(adj, 0)
    for (let u = 0; u < hld.nodeCount; u++) {
      for (let v = u + 1; v < hld.nodeCount; v++) {
        const path = hld.getPath(u, v)
        const ancestor = hld.lca(u, v)
        expect(path).toContain(ancestor)
      }
    }
  })

  it('should clone and equal', () => {
    const adj = [[1, 2], [0], [0]]
    const hld = new HeavyLightDecomposition(adj)
    const cloned = hld.clone()
    expect(hld.equals(cloned)).toBe(true)
  })

  it('should serialize to JSON', () => {
    const adj = [[1], [0]]
    const hld = new HeavyLightDecomposition(adj)
    const json = hld.toJSON()
    expect(json).toBeDefined()
  })

  it('should handle chain graph', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const hld = new HeavyLightDecomposition(adj)
    expect(hld).toBeDefined()
  })

  it('should handle single node', () => {
    const adj = [[]]
    const hld = new HeavyLightDecomposition(adj)
    expect(hld).toBeDefined()
  })

  it('lca of single node is itself', () => {
    const adj = [[]]
    const hld = new HeavyLightDecomposition(adj)
    expect(hld.lca(0, 0)).toBe(0)
  })

  it('lca on chain returns ancestor', () => {
    const adj = [[1], [0, 2], [1, 3], [2]]
    const hld = new HeavyLightDecomposition(adj)
    expect(hld.lca(0, 3)).toBeGreaterThanOrEqual(0)
  })

  it('lca on star graph returns root', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const hld = new HeavyLightDecomposition(adj)
    expect(hld.lca(1, 2)).toBe(0)
  })
})
