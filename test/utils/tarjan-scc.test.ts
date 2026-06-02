import { describe, expect, it } from 'vitest'
import { TarjanSCC } from '../../src/utils/tarjan-scc.js'

describe('TarjanSCC', () => {
  describe('solve', () => {
    it('finds single SCC in cycle graph', () => {
      const adj = [[1], [2], [0]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(new Set(sccs[0])).toEqual(new Set([0, 1, 2]))
    })

    it('finds separate SCCs in DAG', () => {
      const adj = [[1], [2], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
      for (const scc of sccs) {
        expect(scc).toHaveLength(1)
      }
    })

    it('finds SCCs in graph with cycle and tail', () => {
      const adj = [[1], [2], [0, 3], [4], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
    })

    it('handles empty graph', () => {
      const adj: number[][] = []
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(0)
    })

    it('handles single node with no edges', () => {
      const adj = [[]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(sccs[0]).toEqual([0])
    })

    it('handles self-loop', () => {
      const adj = [[0]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(1)
      expect(sccs[0]).toEqual([0])
    })

    it('handles disconnected graph', () => {
      const adj = [[], [], []]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(3)
    })

    it('finds two separate cycles', () => {
      const adj = [[1], [0], [3], [2]]
      const sccs = new TarjanSCC(adj).solve()
      expect(sccs).toHaveLength(2)
      for (const scc of sccs) {
        expect(scc).toHaveLength(2)
      }
    })
  })

  describe('isDAG', () => {
    it('returns true for DAG', () => {
      expect(TarjanSCC.isDAG([[1], [2], []])).toBe(true)
    })

    it('returns false for cyclic graph', () => {
      expect(TarjanSCC.isDAG([[1], [0]])).toBe(false)
    })

    it('returns true for empty graph', () => {
      expect(TarjanSCC.isDAG([])).toBe(true)
    })

    it('returns true for single node no edges', () => {
      expect(TarjanSCC.isDAG([[]])).toBe(true)
    })

    it('returns false for self-loop', () => {
      expect(TarjanSCC.isDAG([[0]])).toBe(false)
    })
  })

  describe('condensation', () => {
    it('condenses cycle + tail', () => {
      const adj = [[1], [2], [0, 3], [4], []]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(componentId.length).toBe(5)
      expect(dag.length).toBe(3)
    })

    it('DAG condensation is same as original', () => {
      const adj = [[1], [2], []]
      const { dag } = TarjanSCC.condensation(adj)
      expect(dag.length).toBe(3)
    })

    it('cycle condensation has single component', () => {
      const adj = [[1], [2], [0]]
      const { componentId, dag } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBe(1)
      expect(dag[0]).toHaveLength(0)
    })

    it('two disconnected components', () => {
      const adj = [[1], [0], [3], [2]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(new Set(componentId).size).toBe(2)
    })

    it('single node has one component', () => {
      const adj = [[0]]
      const { componentId } = TarjanSCC.condensation(adj)
      expect(componentId.length).toBe(1)
    })

    it('DAG has each node as own component', () => {
      const adj = [[1], [2], []] as number[][]
      const { componentId } = TarjanSCC.condensation(adj)
      const uniqueIds = new Set(componentId)
      expect(uniqueIds.size).toBe(3)
    })
  })
})
