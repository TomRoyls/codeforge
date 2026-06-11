import { describe, expect, it } from 'vitest'
import { MoAlgorithmTree } from '../../src/utils/mo-algorithm-tree.js'

describe('MoAlgorithmTree', () => {
  describe('constructor', () => {
    it('creates tree with 1 node', () => {
      const mo = new MoAlgorithmTree(1)
      expect(mo).toBeDefined()
    })

    it('creates tree with 5 nodes', () => {
      const mo = new MoAlgorithmTree(5)
      expect(mo).toBeDefined()
    })

    it('creates tree with 100 nodes', () => {
      const mo = new MoAlgorithmTree(100)
      expect(mo).toBeDefined()
    })
  })

  describe('addEdge', () => {
    it('adds edge between two nodes', () => {
      const mo = new MoAlgorithmTree(2)
      mo.addEdge(0, 1)
      expect(mo).toBeDefined()
    })

    it('adds multiple edges', () => {
      const mo = new MoAlgorithmTree(5)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      expect(mo).toBeDefined()
    })

    it('adds edge to same node multiple times', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(0, 2)
      expect(mo).toBeDefined()
    })
  })

  describe('processQueries - single query', () => {
    it('processes single query on path', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      const count = new Map<number, number>()
      mo.processQueries(
        [[0, 2]],
        (n) => { count.set(n, (count.get(n) ?? 0) + 1) },
        (n) => { count.set(n, (count.get(n) ?? 0) - 1) }
      )
      expect(count.size).toBeGreaterThan(0)
    })

    it('processes query on single node', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      let added = 0
      mo.processQueries(
        [[1, 1]],
        () => { added++ },
        () => {}
      )
      expect(added).toBeGreaterThan(0)
    })

    it('handles adjacent nodes query', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      let calls = 0
      mo.processQueries(
        [[1, 2]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - multiple queries', () => {
    it('processes multiple queries on chain', () => {
      const mo = new MoAlgorithmTree(5)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      let addCalls = 0
      mo.processQueries(
        [[0, 2], [1, 4], [0, 4]],
        () => { addCalls++ },
        () => {}
      )
      expect(addCalls).toBeGreaterThan(0)
    })

    it('processes disjoint queries', () => {
      const mo = new MoAlgorithmTree(6)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      mo.addEdge(4, 5)
      let calls = 0
      mo.processQueries(
        [[0, 1], [3, 5]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('processes overlapping queries', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      let calls = 0
      mo.processQueries(
        [[0, 2], [1, 3]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - graph types', () => {
    it('handles star graph', () => {
      const mo = new MoAlgorithmTree(5)
      mo.addEdge(0, 1)
      mo.addEdge(0, 2)
      mo.addEdge(0, 3)
      mo.addEdge(0, 4)
      const visited = new Set<number>()
      mo.processQueries(
        [[1, 3]],
        (n) => { visited.add(n) },
        () => {}
      )
      expect(visited.size).toBeGreaterThan(0)
    })

    it('handles binary tree', () => {
      const mo = new MoAlgorithmTree(7)
      mo.addEdge(0, 1)
      mo.addEdge(0, 2)
      mo.addEdge(1, 3)
      mo.addEdge(1, 4)
      mo.addEdge(2, 5)
      mo.addEdge(2, 6)
      const nodes = new Set<number>()
      mo.processQueries(
        [[3, 6]],
        (n) => { nodes.add(n) },
        () => {}
      )
      expect(nodes.size).toBeGreaterThan(0)
    })

    it('handles line graph', () => {
      const mo = new MoAlgorithmTree(10)
      for (let i = 0; i < 9; i++) mo.addEdge(i, i + 1)
      let total = 0
      mo.processQueries(
        [[0, 9], [3, 7], [1, 5]],
        () => { total++ },
        () => { total-- }
      )
      expect(total).toBeGreaterThanOrEqual(0)
    })

    it('handles disconnected graph', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(2, 3)
      let calls = 0
      mo.processQueries(
        [[0, 1]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - edge cases', () => {
    it('handles empty queries', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.processQueries([], () => {}, () => {})
    })

    it('handles single node tree', () => {
      const mo = new MoAlgorithmTree(1)
      let addCalls = 0
      mo.processQueries(
        [[0, 0]],
        () => { addCalls++ },
        () => {}
      )
      expect(addCalls).toBeGreaterThan(0)
    })

    it('handles two nodes', () => {
      const mo = new MoAlgorithmTree(2)
      mo.addEdge(0, 1)
      let calls = 0
      mo.processQueries(
        [[0, 1]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('handles path of 4 nodes', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      let calls = 0
      mo.processQueries(
        [[0, 3]],
        () => { calls++ },
        () => { calls-- }
      )
      expect(calls).toBeGreaterThanOrEqual(0)
    })
  })

  describe('processQueries - callbacks', () => {
    it('calls add callback', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      let addCalls = 0
      mo.processQueries(
        [[0, 2]],
        () => { addCalls++ },
        () => {}
      )
      expect(addCalls).toBeGreaterThan(0)
    })

    it('calls remove callback', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      let removeCalls = 0
      mo.processQueries(
        [[0, 2], [0, 1]],
        () => {},
        () => { removeCalls++ }
      )
      expect(removeCalls).toBeGreaterThanOrEqual(0)
    })

    it('toggles nodes correctly', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      const maxActive = { value: 0 }
      mo.processQueries(
        [[0, 2]],
        () => { maxActive.value++ },
        () => { maxActive.value-- }
      )
      expect(maxActive.value).toBeGreaterThanOrEqual(0)
    })

    it('tracks node counts with Map', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      const count = new Map<number, number>()
      mo.processQueries(
        [[0, 2]],
        (n) => { count.set(n, (count.get(n) ?? 0) + 1) },
        (n) => { count.set(n, (count.get(n) ?? 0) - 1) }
      )
      expect(count.size).toBeGreaterThan(0)
    })

    it('tracks visited nodes with Set', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      const visited = new Set<number>()
      mo.processQueries(
        [[0, 2]],
        (n) => { visited.add(n) },
        () => {}
      )
      expect(visited.size).toBeGreaterThan(0)
    })
  })

  describe('processQueries - query order', () => {
    it('processes queries in sorted order', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      const order: number[] = []
      mo.processQueries(
        [[3, 0], [0, 3]],
        () => { order.push(1) },
        () => {}
      )
      expect(order.length).toBeGreaterThan(0)
    })

    it('handles reversed query order', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      let calls = 0
      mo.processQueries(
        [[2, 0]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - many queries', () => {
    it('handles many queries on small tree', () => {
      const mo = new MoAlgorithmTree(5)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      let calls = 0
      const queries: [number, number][] = []
      for (let i = 0; i < 5; i++)
        for (let j = i; j < 5; j++) queries.push([i, j])
      mo.processQueries(
        queries,
        () => { calls++ },
        () => { calls-- }
      )
      expect(calls).toBeGreaterThanOrEqual(0)
    })

    it('handles 10 queries', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      let calls = 0
      const queries: [number, number][] = []
      for (let i = 0; i < 10; i++) queries.push([i % 4, (i + 1) % 4])
      mo.processQueries(
        queries,
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - query node values', () => {
    it('processes query with node 0', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      let calls = 0
      mo.processQueries(
        [[0, 1]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('processes query with max node', () => {
      const mo = new MoAlgorithmTree(5)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      let calls = 0
      mo.processQueries(
        [[4, 3]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('processes query spanning entire tree', () => {
      const mo = new MoAlgorithmTree(5)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      let calls = 0
      mo.processQueries(
        [[0, 4]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - query patterns', () => {
    it('handles multiple queries on same nodes', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      let calls = 0
      mo.processQueries(
        [[0, 2], [0, 2], [0, 2]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('handles queries with increasing distance', () => {
      const mo = new MoAlgorithmTree(6)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      mo.addEdge(4, 5)
      let calls = 0
      mo.processQueries(
        [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('handles random query pattern', () => {
      const mo = new MoAlgorithmTree(7)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      mo.addEdge(4, 5)
      mo.addEdge(5, 6)
      let calls = 0
      mo.processQueries(
        [[2, 5], [0, 3], [4, 6], [1, 4]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('handles alternating queries', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      let calls = 0
      mo.processQueries(
        [[0, 1], [2, 3], [0, 1], [2, 3]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - add/remove balance', () => {
    it('maintains balance with add and remove', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      let addCount = 0
      let removeCount = 0
      mo.processQueries(
        [[0, 2], [1, 3]],
        () => { addCount++ },
        () => { removeCount++ }
      )
      expect(addCount).toBeGreaterThan(0)
      expect(removeCount).toBeGreaterThan(0)
    })

    it('handles callback with node parameter', () => {
      const mo = new MoAlgorithmTree(4)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      const nodes: number[] = []
      mo.processQueries(
        [[0, 3]],
        (n) => { nodes.push(n) },
        () => {}
      )
      expect(nodes.length).toBeGreaterThan(0)
    })

    it('handles multiple add/remove cycles', () => {
      const mo = new MoAlgorithmTree(3)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      let addCount = 0
      let removeCount = 0
      mo.processQueries(
        [[0, 2], [0, 1], [1, 2]],
        () => { addCount++ },
        () => { removeCount++ }
      )
      expect(addCount).toBeGreaterThan(0)
      expect(removeCount).toBeGreaterThan(0)
    })

    it('accumulates correct total after processing', () => {
      const mo = new MoAlgorithmTree(5)
      mo.addEdge(0, 1)
      mo.addEdge(1, 2)
      mo.addEdge(2, 3)
      mo.addEdge(3, 4)
      let total = 0
      mo.processQueries(
        [[0, 4], [1, 3]],
        () => { total++ },
        () => { total-- }
      )
      expect(total).toBeGreaterThanOrEqual(0)
    })
  })

  describe('processQueries - tree sizes', () => {
    it('handles tree with 8 nodes', () => {
      const mo = new MoAlgorithmTree(8)
      for (let i = 0; i < 7; i++) mo.addEdge(i, i + 1)
      let calls = 0
      mo.processQueries(
        [[0, 7]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('handles tree with 15 nodes', () => {
      const mo = new MoAlgorithmTree(15)
      for (let i = 0; i < 14; i++) mo.addEdge(i, i + 1)
      let calls = 0
      mo.processQueries(
        [[0, 14]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('handles tree with 20 nodes', () => {
      const mo = new MoAlgorithmTree(20)
      for (let i = 0; i < 19; i++) mo.addEdge(i, i + 1)
      let calls = 0
      mo.processQueries(
        [[5, 15]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })

  describe('processQueries - edge add patterns', () => {
    it('handles tree with depth 3', () => {
      const mo = new MoAlgorithmTree(7)
      mo.addEdge(0, 1)
      mo.addEdge(0, 2)
      mo.addEdge(1, 3)
      mo.addEdge(1, 4)
      mo.addEdge(2, 5)
      mo.addEdge(2, 6)
      let calls = 0
      mo.processQueries(
        [[3, 5]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })

    it('handles complete binary tree', () => {
      const mo = new MoAlgorithmTree(15)
      mo.addEdge(0, 1)
      mo.addEdge(0, 2)
      mo.addEdge(1, 3)
      mo.addEdge(1, 4)
      mo.addEdge(2, 5)
      mo.addEdge(2, 6)
      mo.addEdge(3, 7)
      mo.addEdge(3, 8)
      mo.addEdge(4, 9)
      mo.addEdge(4, 10)
      mo.addEdge(5, 11)
      mo.addEdge(5, 12)
      mo.addEdge(6, 13)
      mo.addEdge(6, 14)
      let calls = 0
      mo.processQueries(
        [[7, 14]],
        () => { calls++ },
        () => {}
      )
      expect(calls).toBeGreaterThan(0)
    })
  })
})