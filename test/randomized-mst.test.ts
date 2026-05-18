import { describe, it, expect } from 'vitest'
import { RandomizedMST } from '../src/core/randomized-mst/index.js'

describe('RandomizedMST', () => {
  // ─── Construction & Empty ───
  describe('construction and empty state', () => {
    it('creates empty MST', () => {
      const mst = new RandomizedMST()
      expect(mst.vertexCount()).toBe(0)
      expect(mst.edgeCount()).toBe(0)
    })

    it('creates with edges', () => {
      const mst = new RandomizedMST<number>(
        [{ from: 1, to: 2, weight: 3 }],
        [1, 2],
        { seed: 42 },
      )
      expect(mst.vertexCount()).toBe(2)
      expect(mst.edgeCount()).toBe(1)
    })
  })

  // ─── Add Edge ───
  describe('addEdge', () => {
    it('adds edge', () => {
      const mst = new RandomizedMST<number>([], [], { seed: 42 })
      mst.addEdge(1, 2, 5)
      expect(mst.edgeCount()).toBe(1)
      expect(mst.vertexCount()).toBe(2)
    })

    it('throws on negative weight', () => {
      const mst = new RandomizedMST<number>()
      expect(() => mst.addEdge(1, 2, -1)).toThrow(RangeError)
    })
  })

  // ─── Compute MST ───
  describe('compute', () => {
    it('computes MST for single edge', () => {
      const mst = new RandomizedMST<number>([{ from: 1, to: 2, weight: 5 }], [1, 2], { seed: 42 })
      const result = mst.compute()
      expect(result.edges).toHaveLength(1)
      expect(result.totalWeight).toBe(5)
    })

    it('computes MST for triangle graph', () => {
      const mst = new RandomizedMST<number>(
        [{ from: 1, to: 2, weight: 1 }, { from: 2, to: 3, weight: 2 }, { from: 1, to: 3, weight: 5 }],
        [1, 2, 3],
        { seed: 42 },
      )
      const result = mst.compute()
      expect(result.edges).toHaveLength(2)
      expect(result.totalWeight).toBe(3)
    })

    it('computes MST for disconnected graph', () => {
      const mst = new RandomizedMST<number>(
        [{ from: 1, to: 2, weight: 1 }, { from: 3, to: 4, weight: 1 }],
        [1, 2, 3, 4],
        { seed: 42 },
      )
      const result = mst.compute()
      expect(result.edges).toHaveLength(2)
    })

    it('returns empty result for no vertices', () => {
      const mst = new RandomizedMST<number>()
      const result = mst.compute()
      expect(result.edges).toEqual([])
      expect(result.totalWeight).toBe(0)
    })
  })

  // ─── Accessors ───
  describe('accessors', () => {
    it('getMST returns edges', () => {
      const mst = new RandomizedMST<number>([{ from: 1, to: 2, weight: 3 }], [1, 2], { seed: 42 })
      const edges = mst.getMST()
      expect(edges).toHaveLength(1)
    })

    it('getTotalWeight returns weight', () => {
      const mst = new RandomizedMST<number>([{ from: 1, to: 2, weight: 7 }], [1, 2], { seed: 42 })
      expect(mst.getTotalWeight()).toBe(7)
    })

    it('isConnected returns true for connected graph', () => {
      const mst = new RandomizedMST<number>([{ from: 1, to: 2, weight: 1 }], [1, 2], { seed: 42 })
      expect(mst.isConnected()).toBe(true)
    })

    it('isConnected returns false for disconnected graph', () => {
      const mst = new RandomizedMST<number>([{ from: 1, to: 2, weight: 1 }], [1, 2, 3], { seed: 42 })
      expect(mst.isConnected()).toBe(false)
    })

    it('getTree returns adjacency list', () => {
      const mst = new RandomizedMST<number>([{ from: 1, to: 2, weight: 5 }], [1, 2], { seed: 42 })
      const tree = mst.getTree()
      expect(tree.get(1)).toHaveLength(1)
      expect(tree.get(2)).toHaveLength(1)
    })

    it('getComponents returns components', () => {
      const mst = new RandomizedMST<number>(
        [{ from: 1, to: 2, weight: 1 }, { from: 3, to: 4, weight: 1 }],
        [1, 2, 3, 4],
        { seed: 42 },
      )
      const comps = mst.getComponents()
      expect(comps.size).toBe(2)
    })
  })
})
