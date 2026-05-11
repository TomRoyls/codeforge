import { describe, it, expect, beforeEach } from 'vitest'
import { RandomizedMST } from '../../src/core/randomized-mst/index.js'
import type { Edge } from '../../src/core/randomized-mst/types.js'

function expectMSTValid<V>(
  mst: RandomizedMST<V>,
  expectedVertices: number,
  connected: boolean
): void {
  expect(mst.vertexCount()).toBe(expectedVertices)
  expect(mst.isConnected()).toBe(connected)
  if (connected && expectedVertices > 0) {
    expect(mst.getMST().length).toBe(expectedVertices - 1)
  }
}

function mstWeightByKruskal<V>(edges: Edge<V>[], vertices: V[]): number {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight)
  const parent = new Map<V, V>()
  for (const v of vertices) parent.set(v, v)
  function find(x: V): V {
    while (parent.get(x) !== x) x = parent.get(x)!
    return x
  }
  function union(a: V, b: V): boolean {
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) return false
    parent.set(ra, rb)
    return true
  }
  let total = 0
  let count = 0
  for (const e of sorted) {
    if (union(e.from, e.to)) {
      total += e.weight
      count++
      if (count === vertices.length - 1) break
    }
  }
  return total
}

describe('RandomizedMST', () => {
  describe('constructor', () => {
    it('should create empty MST', () => {
      const mst = new RandomizedMST<number>()
      expect(mst.vertexCount()).toBe(0)
      expect(mst.edgeCount()).toBe(0)
      expect(mst.getTotalWeight()).toBe(0)
      expect(mst.getMST()).toEqual([])
      expect(mst.isConnected()).toBe(true)
    })

    it('should accept edges in constructor', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 3 },
        { from: 2, to: 3, weight: 4 },
      ]
      const mst = new RandomizedMST(edges)
      expect(mst.vertexCount()).toBe(3)
      expect(mst.edgeCount()).toBe(2)
    })

    it('should accept vertices in constructor', () => {
      const mst = new RandomizedMST<number>([], [1, 2, 3])
      expect(mst.vertexCount()).toBe(3)
      expect(mst.edgeCount()).toBe(0)
    })

    it('should accept edges and vertices in constructor', () => {
      const edges: Edge<number>[] = [{ from: 1, to: 2, weight: 5 }]
      const mst = new RandomizedMST(edges, [1, 2, 3])
      expect(mst.vertexCount()).toBe(3)
      expect(mst.edgeCount()).toBe(1)
    })

    it('should accept a seed option', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 2 },
      ]
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.vertexCount()).toBe(3)
    })

    it('should work with string vertices', () => {
      const edges: Edge<string>[] = [
        { from: 'a', to: 'b', weight: 1 },
        { from: 'b', to: 'c', weight: 2 },
      ]
      const mst = new RandomizedMST(edges)
      expect(mst.vertexCount()).toBe(3)
      expect(mst.isConnected()).toBe(true)
    })

    it('should deduplicate vertices from edges', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 1, weight: 0 },
        { from: 1, to: 2, weight: 1 },
      ]
      const mst = new RandomizedMST(edges)
      expect(mst.vertexCount()).toBe(2)
    })
  })

  describe('addEdge', () => {
    it('should add a single edge', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 5)
      expect(mst.edgeCount()).toBe(1)
      expect(mst.vertexCount()).toBe(2)
    })

    it('should add multiple edges', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 3)
      mst.addEdge(2, 3, 4)
      mst.addEdge(3, 4, 5)
      expect(mst.edgeCount()).toBe(3)
      expect(mst.vertexCount()).toBe(4)
    })

    it('should reject negative weight', () => {
      const mst = new RandomizedMST<number>()
      expect(() => mst.addEdge(1, 2, -1)).toThrow(RangeError)
    })

    it('should reject zero weight not - negative', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 0)
      expect(mst.edgeCount()).toBe(1)
    })

    it('should auto-discover vertices', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(10, 20, 1)
      mst.addEdge(20, 30, 1)
      expect(mst.vertexCount()).toBe(3)
    })

    it('should invalidate cached result on add', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.compute()
      expect(mst.getTotalWeight()).toBe(1)
      mst.addEdge(2, 3, 2)
      expect(mst.getTotalWeight()).toBe(3)
    })
  })

  describe('compute', () => {
    it('should return empty result for no edges', () => {
      const mst = new RandomizedMST<number>()
      const result = mst.compute()
      expect(result.edges).toEqual([])
      expect(result.totalWeight).toBe(0)
    })

    it('should return single edge for two vertices', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 10)
      const result = mst.compute()
      expect(result.edges).toHaveLength(1)
      expect(result.totalWeight).toBe(10)
    })

    it('should compute correct MST for triangle', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(2, 3, 2)
      mst.addEdge(1, 3, 10)
      expect(mst.getTotalWeight()).toBe(3)
      expect(mst.getMST()).toHaveLength(2)
    })

    it('should compute correct MST for K4', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 1 },
        { from: 1, to: 3, weight: 2 },
        { from: 1, to: 4, weight: 3 },
        { from: 2, to: 3, weight: 4 },
        { from: 2, to: 4, weight: 5 },
        { from: 3, to: 4, weight: 6 },
      ]
      const mst = new RandomizedMST(edges, undefined, { seed: 123 })
      const expected = mstWeightByKruskal(edges, [1, 2, 3, 4])
      expect(mst.getTotalWeight()).toBe(expected)
      expect(mst.isConnected()).toBe(true)
    })

    it('should compute MST for star graph', () => {
      const mst = new RandomizedMST<number>()
      for (let i = 2; i <= 10; i++) {
        mst.addEdge(1, i, i)
      }
      expect(mst.getTotalWeight()).toBe(2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10)
      expect(mst.isConnected()).toBe(true)
    })

    it('should compute MST for line graph', () => {
      const mst = new RandomizedMST<number>()
      for (let i = 1; i < 10; i++) {
        mst.addEdge(i, i + 1, 1)
      }
      expect(mst.getTotalWeight()).toBe(9)
      expect(mst.isConnected()).toBe(true)
    })

    it('should compute MST for disconnected graph', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(3, 4, 1)
      mst.compute()
      expect(mst.isConnected()).toBe(false)
    })

    it('should handle graph with parallel edges', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 5)
      mst.addEdge(1, 2, 3)
      mst.addEdge(1, 2, 7)
      expect(mst.getTotalWeight()).toBe(3)
    })

    it('should handle self-loops', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 1, 0)
      mst.addEdge(1, 2, 1)
      expect(mst.vertexCount()).toBe(2)
      expect(mst.isConnected()).toBe(true)
    })

    it('should return consistent results with same seed', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 3 },
        { from: 2, to: 3, weight: 1 },
        { from: 1, to: 3, weight: 2 },
        { from: 3, to: 4, weight: 4 },
        { from: 2, to: 4, weight: 5 },
      ]
      const mst1 = new RandomizedMST(edges, undefined, { seed: 999 })
      const mst2 = new RandomizedMST(edges, undefined, { seed: 999 })
      expect(mst1.getTotalWeight()).toBe(mst2.getTotalWeight())
    })
  })

  describe('getMST', () => {
    it('should return copy of edges array', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      const a = mst.getMST()
      const b = mst.getMST()
      expect(a).not.toBe(b)
    })

    it('should return edges forming a valid tree', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 2 },
        { from: 3, to: 4, weight: 3 },
        { from: 1, to: 4, weight: 10 },
      ]
      const mst = new RandomizedMST(edges, undefined, { seed: 7 })
      const tree = mst.getMST()
      expect(tree).toHaveLength(3)
      for (const e of tree) {
        expect(e).toHaveProperty('from')
        expect(e).toHaveProperty('to')
        expect(e).toHaveProperty('weight')
      }
    })

    it('should auto-compute if not yet computed', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 5)
      const edges = mst.getMST()
      expect(edges).toHaveLength(1)
      expect(edges[0]!.weight).toBe(5)
    })
  })

  describe('getTotalWeight', () => {
    it('should return 0 for empty graph', () => {
      const mst = new RandomizedMST<number>()
      expect(mst.getTotalWeight()).toBe(0)
    })

    it('should return weight of single edge', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 42)
      expect(mst.getTotalWeight()).toBe(42)
    })

    it('should sum MST edges only', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(2, 3, 2)
      mst.addEdge(1, 3, 100)
      expect(mst.getTotalWeight()).toBe(3)
    })

    it('should handle floating point weights', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1.5)
      mst.addEdge(2, 3, 2.5)
      expect(mst.getTotalWeight()).toBeCloseTo(4.0)
    })
  })

  describe('getTree', () => {
    it('should return adjacency map', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 3)
      const tree = mst.getTree()
      expect(tree).toBeInstanceOf(Map)
      expect(tree.size).toBe(2)
    })

    it('should include bidirectional edges', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 5)
      const tree = mst.getTree()
      expect(tree.get(1)).toEqual([{ neighbor: 2, weight: 5 }])
      expect(tree.get(2)).toEqual([{ neighbor: 1, weight: 5 }])
    })

    it('should include isolated vertices', () => {
      const mst = new RandomizedMST<number>([], [1, 2, 3])
      const tree = mst.getTree()
      expect(tree.size).toBe(3)
      expect(tree.get(1)).toEqual([])
    })

    it('should auto-compute if needed', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      const tree = mst.getTree()
      expect(tree.get(1)!.length).toBe(1)
    })
  })

  describe('isConnected', () => {
    it('should return true for empty graph', () => {
      const mst = new RandomizedMST<number>()
      expect(mst.isConnected()).toBe(true)
    })

    it('should return true for single vertex', () => {
      const mst = new RandomizedMST<number>([], [1])
      expect(mst.isConnected()).toBe(true)
    })

    it('should return true for connected graph', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(2, 3, 1)
      expect(mst.isConnected()).toBe(true)
    })

    it('should return false for disconnected graph', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(3, 4, 1)
      expect(mst.isConnected()).toBe(false)
    })

    it('should return true for two connected vertices', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      expect(mst.isConnected()).toBe(true)
    })

    it('should return false for isolated vertices with no edges', () => {
      const mst = new RandomizedMST<number>([], [1, 2, 3])
      expect(mst.isConnected()).toBe(false)
    })
  })

  describe('vertexCount', () => {
    it('should return 0 for empty', () => {
      expect(new RandomizedMST<number>().vertexCount()).toBe(0)
    })

    it('should count vertices from edges', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(3, 4, 1)
      expect(mst.vertexCount()).toBe(4)
    })

    it('should include extra vertices from constructor', () => {
      const mst = new RandomizedMST<number>([], [1, 2, 3, 4, 5])
      expect(mst.vertexCount()).toBe(5)
    })

    it('should not double-count vertices', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(1, 2, 2)
      expect(mst.vertexCount()).toBe(2)
    })
  })

  describe('edgeCount', () => {
    it('should return 0 for empty', () => {
      expect(new RandomizedMST<number>().edgeCount()).toBe(0)
    })

    it('should count all edges including parallel', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(1, 2, 2)
      expect(mst.edgeCount()).toBe(2)
    })

    it('should count edges from constructor', () => {
      const edges: Edge<string>[] = [
        { from: 'a', to: 'b', weight: 1 },
        { from: 'b', to: 'c', weight: 2 },
      ]
      const mst = new RandomizedMST(edges)
      expect(mst.edgeCount()).toBe(2)
    })
  })

  describe('getComponents', () => {
    it('should return empty for empty graph', () => {
      const mst = new RandomizedMST<number>()
      expect(mst.getComponents().size).toBe(0)
    })

    it('should return single component for connected graph', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(2, 3, 1)
      const comps = mst.getComponents()
      expect(comps.size).toBe(1)
    })

    it('should return two components for disconnected graph', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(3, 4, 1)
      const comps = mst.getComponents()
      expect(comps.size).toBe(2)
    })

    it('should return component for each isolated vertex', () => {
      const mst = new RandomizedMST<number>([], [1, 2, 3])
      const comps = mst.getComponents()
      expect(comps.size).toBe(3)
    })

    it('should include all vertices in components', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(3, 4, 1)
      const comps = mst.getComponents()
      let total = 0
      for (const [, members] of comps) {
        total += members.length
      }
      expect(total).toBe(4)
    })

    it('should auto-compute if needed', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      const comps = mst.getComponents()
      expect(comps.size).toBe(1)
    })
  })

  describe('correctness - small graphs', () => {
    it('should find MST for 3-vertex graph', () => {
      const edges: Edge<number>[] = [
        { from: 0, to: 1, weight: 4 },
        { from: 0, to: 2, weight: 3 },
        { from: 1, to: 2, weight: 2 },
      ]
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(5)
    })

    it('should find MST for 4-vertex graph', () => {
      const edges: Edge<number>[] = [
        { from: 0, to: 1, weight: 1 },
        { from: 0, to: 2, weight: 4 },
        { from: 0, to: 3, weight: 3 },
        { from: 1, to: 2, weight: 2 },
        { from: 2, to: 3, weight: 5 },
      ]
      const verts = [0, 1, 2, 3]
      const mst = new RandomizedMST(edges, undefined, { seed: 11 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should find MST for 5-vertex graph', () => {
      const edges: Edge<number>[] = [
        { from: 0, to: 1, weight: 2 },
        { from: 0, to: 3, weight: 6 },
        { from: 1, to: 2, weight: 3 },
        { from: 1, to: 3, weight: 8 },
        { from: 1, to: 4, weight: 5 },
        { from: 2, to: 4, weight: 7 },
        { from: 3, to: 4, weight: 9 },
      ]
      const verts = [0, 1, 2, 3, 4]
      const mst = new RandomizedMST(edges, undefined, { seed: 55 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should handle equal-weight edges', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 1 },
        { from: 1, to: 3, weight: 1 },
      ]
      const mst = new RandomizedMST(edges, undefined, { seed: 1 })
      expect(mst.getTotalWeight()).toBe(2)
      expect(mst.getMST()).toHaveLength(2)
    })

    it('should handle many parallel edges', () => {
      const mst = new RandomizedMST<number>()
      for (let i = 0; i < 100; i++) {
        mst.addEdge(1, 2, i + 1)
      }
      expect(mst.getTotalWeight()).toBe(1)
    })
  })

  describe('correctness - larger graphs', () => {
    it('should find MST for complete graph K6', () => {
      const edges: Edge<number>[] = []
      const verts: number[] = []
      for (let i = 0; i < 6; i++) verts.push(i)
      for (let i = 0; i < 6; i++) {
        for (let j = i + 1; j < 6; j++) {
          edges.push({ from: i, to: j, weight: (i + 1) * (j + 1) })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 77 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
      expect(mst.isConnected()).toBe(true)
    })

    it('should find MST for complete graph K10', () => {
      const edges: Edge<number>[] = []
      const verts: number[] = []
      for (let i = 0; i < 10; i++) verts.push(i)
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          edges.push({ from: i, to: j, weight: Math.abs(i - j) + 1 })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 100 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should find MST for grid graph 3x3', () => {
      const edges: Edge<number>[] = []
      const verts: number[] = []
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const id = r * 3 + c
          verts.push(id)
          if (c < 2) edges.push({ from: id, to: id + 1, weight: r + c + 1 })
          if (r < 2) edges.push({ from: id, to: id + 3, weight: r * c + 1 })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should find MST for sparse graph', () => {
      const edges: Edge<number>[] = []
      const n = 20
      const verts: number[] = []
      for (let i = 0; i < n; i++) verts.push(i)
      for (let i = 0; i < n - 1; i++) {
        edges.push({ from: i, to: i + 1, weight: i + 1 })
      }
      edges.push({ from: 0, to: n - 1, weight: 100 })
      const mst = new RandomizedMST(edges, undefined, { seed: 33 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should find MST for graph with many edges', () => {
      const edges: Edge<number>[] = []
      const n = 15
      const verts: number[] = []
      for (let i = 0; i < n; i++) verts.push(i)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          edges.push({ from: i, to: j, weight: ((i * 7 + j * 13) % 20) + 1 })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 88 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })
  })

  describe('generics', () => {
    it('should work with string vertex IDs', () => {
      const edges: Edge<string>[] = [
        { from: 'node1', to: 'node2', weight: 1 },
        { from: 'node2', to: 'node3', weight: 2 },
        { from: 'node1', to: 'node3', weight: 10 },
      ]
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(3)
      expect(mst.isConnected()).toBe(true)
    })

    it('should work with string vertex IDs - disconnected', () => {
      const mst = new RandomizedMST<string>()
      mst.addEdge('a', 'b', 1)
      mst.addEdge('c', 'd', 1)
      expect(mst.isConnected()).toBe(false)
      expect(mst.getComponents().size).toBe(2)
    })

    it('should work with number vertex IDs - large', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1000, 2000, 3)
      mst.addEdge(2000, 3000, 4)
      expect(mst.getTotalWeight()).toBe(7)
    })
  })

  describe('recomputation', () => {
    it('should recompute after addEdge', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 10)
      mst.addEdge(2, 3, 20)
      mst.addEdge(1, 3, 5)
      expect(mst.getTotalWeight()).toBe(15)
    })

    it('should recompute after adding cheaper edge', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 10)
      expect(mst.getTotalWeight()).toBe(10)
      mst.addEdge(1, 2, 1)
      expect(mst.getTotalWeight()).toBe(1)
    })

    it('should handle multiple sequential addEdge calls', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 5)
      expect(mst.getTotalWeight()).toBe(5)
      mst.addEdge(2, 3, 3)
      expect(mst.getTotalWeight()).toBe(8)
      mst.addEdge(1, 3, 1)
      expect(mst.getTotalWeight()).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('should handle single vertex', () => {
      const mst = new RandomizedMST<number>([], [1])
      expect(mst.vertexCount()).toBe(1)
      expect(mst.isConnected()).toBe(true)
      expect(mst.getTotalWeight()).toBe(0)
      expect(mst.getMST()).toEqual([])
    })

    it('should handle two vertices no edges', () => {
      const mst = new RandomizedMST<number>([], [1, 2])
      expect(mst.isConnected()).toBe(false)
    })

    it('should handle graph with only parallel edges', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 10)
      mst.addEdge(1, 2, 5)
      mst.addEdge(1, 2, 3)
      expect(mst.getTotalWeight()).toBe(3)
    })

    it('should handle zero-weight edges', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 0)
      mst.addEdge(2, 3, 0)
      mst.addEdge(1, 3, 5)
      expect(mst.getTotalWeight()).toBe(0)
    })

    it('should handle self-loop with zero weight', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 1, 0)
      mst.addEdge(1, 2, 1)
      expect(mst.getTotalWeight()).toBe(1)
    })

    it('should handle floating-point precision', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 0.1)
      mst.addEdge(2, 3, 0.2)
      mst.addEdge(1, 3, 0.3)
      expect(mst.getTotalWeight()).toBeCloseTo(0.3)
    })

    it('should handle very large weights', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, Number.MAX_SAFE_INTEGER)
      expect(mst.getTotalWeight()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle many vertices connected in chain', () => {
      const mst = new RandomizedMST<number>()
      for (let i = 0; i < 50; i++) {
        mst.addEdge(i, i + 1, 1)
      }
      expect(mst.getTotalWeight()).toBe(50)
      expect(mst.isConnected()).toBe(true)
    })

    it('should handle isolated vertex added via constructor', () => {
      const edges: Edge<number>[] = [{ from: 1, to: 2, weight: 5 }]
      const mst = new RandomizedMST(edges, [1, 2, 3])
      expect(mst.isConnected()).toBe(false)
      expect(mst.getComponents().size).toBe(2)
    })
  })

  describe('randomness properties', () => {
    it('should produce same result with same seed', () => {
      const edges: Edge<number>[] = []
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          edges.push({ from: i, to: j, weight: ((i * 3 + j * 7) % 10) + 1 })
        }
      }
      const mst1 = new RandomizedMST(edges, undefined, { seed: 42 })
      const mst2 = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst1.getTotalWeight()).toBe(mst2.getTotalWeight())
      expect(mst1.getMST()).toEqual(mst2.getMST())
    })

    it('should always produce optimal weight regardless of seed', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 2 },
        { from: 3, to: 4, weight: 3 },
        { from: 1, to: 4, weight: 100 },
      ]
      const verts = [1, 2, 3, 4]
      const optimal = mstWeightByKruskal(edges, verts)
      for (let seed = 1; seed <= 10; seed++) {
        const mst = new RandomizedMST(edges, undefined, { seed })
        expect(mst.getTotalWeight()).toBe(optimal)
      }
    })

    it('should produce optimal weight on larger graph across seeds', () => {
      const edges: Edge<number>[] = []
      const verts: number[] = []
      for (let i = 0; i < 8; i++) verts.push(i)
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          edges.push({ from: i, to: j, weight: ((i + 1) * (j + 1)) % 13 + 1 })
        }
      }
      const optimal = mstWeightByKruskal(edges, verts)
      for (let seed = 0; seed < 5; seed++) {
        const mst = new RandomizedMST(edges, undefined, { seed })
        expect(mst.getTotalWeight()).toBe(optimal)
      }
    })
  })

  describe('integration', () => {
    it('should solve a small network problem', () => {
      const edges: Edge<string>[] = [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'C', weight: 8 },
        { from: 'B', to: 'C', weight: 2 },
        { from: 'B', to: 'D', weight: 5 },
        { from: 'C', to: 'D', weight: 5 },
        { from: 'D', to: 'E', weight: 3 },
        { from: 'C', to: 'E', weight: 7 },
      ]
      const verts = ['A', 'B', 'C', 'D', 'E']
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
      expect(mst.isConnected()).toBe(true)
      expect(mst.getMST()).toHaveLength(4)
    })

    it('should handle incrementally built graph', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 7)
      expect(mst.getTotalWeight()).toBe(7)
      mst.addEdge(2, 3, 6)
      expect(mst.getTotalWeight()).toBe(13)
      mst.addEdge(1, 3, 5)
      expect(mst.getTotalWeight()).toBe(11)
      mst.addEdge(3, 4, 4)
      expect(mst.getTotalWeight()).toBe(15)
      mst.addEdge(1, 4, 1)
      expect(mst.getTotalWeight()).toBe(11)
    })

    it('should report correct components after MST', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(3, 4, 1)
      mst.addEdge(5, 6, 1)
      const comps = mst.getComponents()
      expect(comps.size).toBe(3)
      for (const [, members] of comps) {
        expect(members).toHaveLength(2)
      }
    })

    it('should give correct tree structure', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(2, 3, 1)
      mst.addEdge(3, 4, 1)
      const tree = mst.getTree()
      expect(tree.get(1)!.length).toBe(1)
      expect(tree.get(2)!.length).toBe(2)
      expect(tree.get(3)!.length).toBe(2)
      expect(tree.get(4)!.length).toBe(1)
    })

    it('should handle complete graph with 12 vertices', () => {
      const edges: Edge<number>[] = []
      const verts: number[] = []
      const n = 12
      for (let i = 0; i < n; i++) verts.push(i)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          edges.push({ from: i, to: j, weight: ((i * 17 + j * 31) % 50) + 1 })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
      expect(mst.isConnected()).toBe(true)
      expect(mst.getMST()).toHaveLength(n - 1)
    })
  })

  describe('deterministic seeds', () => {
    it('should be deterministic with seed 0', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 3 },
        { from: 2, to: 3, weight: 1 },
        { from: 1, to: 3, weight: 4 },
      ]
      const mst1 = new RandomizedMST(edges, undefined, { seed: 0 })
      const mst2 = new RandomizedMST(edges, undefined, { seed: 0 })
      expect(mst1.getMST()).toEqual(mst2.getMST())
    })

    it('should be deterministic with seed 1', () => {
      const edges: Edge<number>[] = [
        { from: 0, to: 1, weight: 5 },
        { from: 1, to: 2, weight: 3 },
        { from: 0, to: 2, weight: 1 },
      ]
      const mst1 = new RandomizedMST(edges, undefined, { seed: 1 })
      const mst2 = new RandomizedMST(edges, undefined, { seed: 1 })
      expect(mst1.getTotalWeight()).toBe(mst2.getTotalWeight())
    })

    it('should be deterministic with large seed', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 2 },
        { from: 2, to: 3, weight: 3 },
        { from: 1, to: 3, weight: 6 },
      ]
      const mst1 = new RandomizedMST(edges, undefined, { seed: 999999 })
      const mst2 = new RandomizedMST(edges, undefined, { seed: 999999 })
      expect(mst1.getMST()).toEqual(mst2.getMST())
    })
  })

  describe('MST edge properties', () => {
    it('should only include edges from the original set', () => {
      const edges: Edge<number>[] = [
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 2 },
        { from: 1, to: 3, weight: 10 },
      ]
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      const mstEdges = mst.getMST()
      for (const e of mstEdges) {
        const found = edges.some(
          oe =>
            ((oe.from === e.from && oe.to === e.to) || (oe.from === e.to && oe.to === e.from)) &&
            oe.weight === e.weight
        )
        expect(found).toBe(true)
      }
    })

    it('should produce edges with correct weight property', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 3)
      mst.addEdge(2, 3, 4)
      mst.addEdge(1, 3, 100)
      for (const e of mst.getMST()) {
        expect(e.weight).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('compute method returns', () => {
    it('should return result with edges, totalWeight, components', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 5)
      const result = mst.compute()
      expect(result).toHaveProperty('edges')
      expect(result).toHaveProperty('totalWeight')
      expect(result).toHaveProperty('components')
      expect(result.edges).toBeInstanceOf(Array)
      expect(result.components).toBeInstanceOf(Map)
    })

    it('should allow calling compute multiple times', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      const r1 = mst.compute()
      const r2 = mst.compute()
      expect(r1.totalWeight).toBe(r2.totalWeight)
    })
  })

  describe('disconnected graphs', () => {
    it('should find minimum spanning forest', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(2, 3, 2)
      mst.addEdge(4, 5, 3)
      mst.addEdge(5, 6, 4)
      mst.compute()
      expect(mst.isConnected()).toBe(false)
      expect(mst.getComponents().size).toBe(2)
      expect(mst.getMST().length).toBe(4)
    })

    it('should handle three components', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      mst.addEdge(3, 4, 1)
      mst.addEdge(5, 6, 1)
      expect(mst.getComponents().size).toBe(3)
      expect(mst.getMST().length).toBe(3)
    })

    it('should handle single isolated vertex', () => {
      const mst = new RandomizedMST<number>()
      mst.addEdge(1, 2, 1)
      const comps = mst.getComponents()
      const total = [...comps.values()].reduce((s, c) => s + c.length, 0)
      expect(total).toBe(2)
    })
  })

  describe('additional correctness', () => {
    it('should handle binary tree graph', () => {
      const edges: Edge<number>[] = []
      const n = 15
      const verts: number[] = []
      for (let i = 1; i <= n; i++) verts.push(i)
      for (let i = 1; i <= Math.floor(n / 2); i++) {
        if (2 * i <= n) edges.push({ from: i, to: 2 * i, weight: i })
        if (2 * i + 1 <= n) edges.push({ from: i, to: 2 * i + 1, weight: i + 1 })
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should handle bipartite graph', () => {
      const edges: Edge<string>[] = []
      const left = ['a', 'b', 'c']
      const right = ['x', 'y', 'z']
      const verts = [...left, ...right]
      for (const l of left) {
        for (const r of right) {
          edges.push({ from: l, to: r, weight: l.charCodeAt(0) + r.charCodeAt(0) })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 55 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should handle wheel graph', () => {
      const n = 8
      const edges: Edge<number>[] = []
      const verts: number[] = [0]
      for (let i = 1; i <= n; i++) {
        verts.push(i)
        edges.push({ from: 0, to: i, weight: 1 })
      }
      for (let i = 1; i <= n; i++) {
        edges.push({ from: i, to: (i % n) + 1, weight: 2 })
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 33 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should handle dense graph with 20 vertices', () => {
      const edges: Edge<number>[] = []
      const verts: number[] = []
      const n = 20
      for (let i = 0; i < n; i++) verts.push(i)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          edges.push({ from: i, to: j, weight: ((i * 31 + j * 17) % 100) + 1 })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(mstWeightByKruskal(edges, verts))
    })

    it('should handle graph where all edges have same weight', () => {
      const edges: Edge<number>[] = []
      const verts: number[] = []
      for (let i = 0; i < 6; i++) verts.push(i)
      for (let i = 0; i < 6; i++) {
        for (let j = i + 1; j < 6; j++) {
          edges.push({ from: i, to: j, weight: 1 })
        }
      }
      const mst = new RandomizedMST(edges, undefined, { seed: 42 })
      expect(mst.getTotalWeight()).toBe(5)
      expect(mst.getMST()).toHaveLength(5)
    })
  })
})
