import { describe, it, expect } from 'vitest'
import { BipartiteMatcher } from '../../src/core/bipartite-matcher/index.js'

describe('BipartiteMatcher', () => {
  describe('constructor', () => {
    it('creates an empty matcher', () => {
      const m = new BipartiteMatcher<string, number>()
      expect(m.leftSize).toBe(0)
      expect(m.rightSize).toBe(0)
      expect(m.edgeCount).toBe(0)
    })

    it('creates a matcher with number types', () => {
      const m = new BipartiteMatcher<number, number>()
      expect(m.leftSize).toBe(0)
    })

    it('creates a matcher with object types', () => {
      const m = new BipartiteMatcher<{ id: string }, { val: number }>()
      expect(m.leftSize).toBe(0)
    })
  })

  describe('addLeftNode', () => {
    it('adds a single left node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      expect(m.leftSize).toBe(1)
    })

    it('adds multiple left nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addLeftNode('b')
      m.addLeftNode('c')
      expect(m.leftSize).toBe(3)
    })

    it('ignores duplicate left nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addLeftNode('a')
      expect(m.leftSize).toBe(1)
    })

    it('does not affect right partition', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      expect(m.rightSize).toBe(0)
    })

    it('does not affect edge count', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      expect(m.edgeCount).toBe(0)
    })

    it('supports numeric keys', () => {
      const m = new BipartiteMatcher<number, string>()
      m.addLeftNode(1)
      m.addLeftNode(2)
      expect(m.leftSize).toBe(2)
    })
  })

  describe('addRightNode', () => {
    it('adds a single right node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addRightNode('x')
      expect(m.rightSize).toBe(1)
    })

    it('adds multiple right nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addRightNode('x')
      m.addRightNode('y')
      m.addRightNode('z')
      expect(m.rightSize).toBe(3)
    })

    it('ignores duplicate right nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addRightNode('x')
      m.addRightNode('x')
      expect(m.rightSize).toBe(1)
    })

    it('does not affect left partition', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addRightNode('x')
      expect(m.leftSize).toBe(0)
    })

    it('supports numeric keys', () => {
      const m = new BipartiteMatcher<string, number>()
      m.addRightNode(10)
      m.addRightNode(20)
      expect(m.rightSize).toBe(2)
    })
  })

  describe('addEdge', () => {
    it('adds an edge between existing nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addRightNode('x')
      m.addEdge('a', 'x')
      expect(m.edgeCount).toBe(1)
      expect(m.hasEdge('a', 'x')).toBe(true)
    })

    it('auto-adds left node if not present', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addRightNode('x')
      m.addEdge('a', 'x')
      expect(m.leftSize).toBe(1)
      expect(m.hasEdge('a', 'x')).toBe(true)
    })

    it('auto-adds right node if not present', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addEdge('a', 'x')
      expect(m.rightSize).toBe(1)
      expect(m.hasEdge('a', 'x')).toBe(true)
    })

    it('auto-adds both nodes if neither present', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.leftSize).toBe(1)
      expect(m.rightSize).toBe(1)
      expect(m.edgeCount).toBe(1)
    })

    it('adds multiple edges from same left node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('a', 'z')
      expect(m.edgeCount).toBe(3)
    })

    it('adds multiple edges to same right node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      m.addEdge('c', 'x')
      expect(m.edgeCount).toBe(3)
    })

    it('ignores duplicate edges', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'x')
      expect(m.edgeCount).toBe(1)
    })
  })

  describe('removeEdge', () => {
    it('removes an existing edge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.removeEdge('a', 'x')).toBe(true)
      expect(m.hasEdge('a', 'x')).toBe(false)
      expect(m.edgeCount).toBe(0)
    })

    it('returns false for non-existent edge', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.removeEdge('a', 'x')).toBe(false)
    })

    it('returns false when left node has no edges', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addRightNode('x')
      expect(m.removeEdge('a', 'x')).toBe(false)
    })

    it('removes one edge without affecting others', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.removeEdge('a', 'x')
      expect(m.hasEdge('a', 'x')).toBe(false)
      expect(m.hasEdge('a', 'y')).toBe(true)
      expect(m.edgeCount).toBe(1)
    })

    it('removes edge and invalidates matching cache', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      expect(m.maxMatchingSize()).toBe(2)
      m.removeEdge('a', 'x')
      expect(m.maxMatchingSize()).toBe(1)
    })
  })

  describe('hasEdge', () => {
    it('returns true for existing edge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.hasEdge('a', 'x')).toBe(true)
    })

    it('returns false for non-existent edge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.hasEdge('a', 'y')).toBe(false)
    })

    it('returns false when no nodes exist', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.hasEdge('a', 'x')).toBe(false)
    })

    it('returns false after edge removal', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.removeEdge('a', 'x')
      expect(m.hasEdge('a', 'x')).toBe(false)
    })
  })

  describe('maxMatching', () => {
    it('returns empty map for empty graph', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.maxMatching()).toEqual(new Map())
    })

    it('returns empty map when no edges exist', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addRightNode('x')
      expect(m.maxMatching()).toEqual(new Map())
    })

    it('matches single edge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      const matching = m.maxMatching()
      expect(matching.size).toBe(1)
      expect(matching.get('a')).toBe('x')
    })

    it('matches complete bipartite K2,2', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'x')
      m.addEdge('b', 'y')
      const matching = m.maxMatching()
      expect(matching.size).toBe(2)
    })

    it('matches complete bipartite K3,3', () => {
      const m = new BipartiteMatcher<string, string>()
      for (const l of ['a', 'b', 'c']) {
        for (const r of ['x', 'y', 'z']) {
          m.addEdge(l, r)
        }
      }
      const matching = m.maxMatching()
      expect(matching.size).toBe(3)
    })

    it('handles star graph (one left connected to many right)', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('a', 'z')
      const matching = m.maxMatching()
      expect(matching.size).toBe(1)
      expect(matching.has('a')).toBe(true)
    })

    it('handles star graph reversed (many left to one right)', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      m.addEdge('c', 'x')
      const matching = m.maxMatching()
      expect(matching.size).toBe(1)
    })

    it('handles disconnected components', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      const matching = m.maxMatching()
      expect(matching.size).toBe(2)
      expect(matching.get('a')).toBe('x')
      expect(matching.get('b')).toBe('y')
    })

    it('handles path graph', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      m.addEdge('b', 'y')
      m.addEdge('c', 'y')
      const matching = m.maxMatching()
      expect(matching.size).toBe(2)
    })

    it('handles unbalanced partitions (more left)', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      m.addEdge('c', 'x')
      expect(m.maxMatchingSize()).toBe(1)
    })

    it('handles unbalanced partitions (more right)', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('a', 'z')
      expect(m.maxMatchingSize()).toBe(1)
    })

    it('computes maximum matching for known problem', () => {
      const m = new BipartiteMatcher<number, number>()
      m.addEdge(0, 0)
      m.addEdge(0, 1)
      m.addEdge(1, 1)
      m.addEdge(1, 2)
      m.addEdge(2, 0)
      m.addEdge(2, 2)
      expect(m.maxMatchingSize()).toBe(3)
    })

    it('computes matching with numeric nodes', () => {
      const m = new BipartiteMatcher<number, number>()
      m.addEdge(1, 10)
      m.addEdge(2, 20)
      m.addEdge(3, 30)
      expect(m.maxMatchingSize()).toBe(3)
    })

    it('returns a new map each call', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      const m1 = m.maxMatching()
      const m2 = m.maxMatching()
      expect(m1).not.toBe(m2)
      expect(m1).toEqual(m2)
    })

    it('handles large complete bipartite K10,10', () => {
      const m = new BipartiteMatcher<number, number>()
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          m.addEdge(i, j)
        }
      }
      expect(m.maxMatchingSize()).toBe(10)
    })
  })

  describe('maxMatchingSize', () => {
    it('returns 0 for empty graph', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.maxMatchingSize()).toBe(0)
    })

    it('returns 0 for graph with nodes but no edges', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addRightNode('x')
      expect(m.maxMatchingSize()).toBe(0)
    })

    it('returns 1 for single edge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.maxMatchingSize()).toBe(1)
    })

    it('returns correct size for perfect matching', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      m.addEdge('c', 'z')
      expect(m.maxMatchingSize()).toBe(3)
    })

    it('returns correct size for partial matching', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'x')
      expect(m.maxMatchingSize()).toBe(2)
    })
  })

  describe('isPerfectMatching', () => {
    it('returns true for empty graph', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.isPerfectMatching()).toBe(true)
    })

    it('returns false with nodes but no edges', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addRightNode('x')
      expect(m.isPerfectMatching()).toBe(false)
    })

    it('returns true for complete bipartite K3,3', () => {
      const m = new BipartiteMatcher<string, string>()
      for (const l of ['a', 'b', 'c']) {
        for (const r of ['x', 'y', 'z']) {
          m.addEdge(l, r)
        }
      }
      expect(m.isPerfectMatching()).toBe(true)
    })

    it('returns false when matching is incomplete', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addLeftNode('b')
      m.addRightNode('y')
      expect(m.maxMatchingSize()).toBe(1)
      expect(m.isPerfectMatching()).toBe(false)
    })

    it('returns true for simple perfect match', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.isPerfectMatching()).toBe(true)
    })

    it('returns true for perfect matching on unbalanced partitions', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'x')
      m.addEdge('b', 'y')
      expect(m.isPerfectMatching()).toBe(true)
    })

    it('returns false for larger unmatched graph', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addLeftNode('b')
      m.addRightNode('y')
      expect(m.isPerfectMatching()).toBe(false)
    })
  })

  describe('getUnmatchedLeft', () => {
    it('returns all left nodes when no matching', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addLeftNode('b')
      m.addRightNode('x')
      expect(m.getUnmatchedLeft()).toEqual(expect.arrayContaining(['a', 'b']))
    })

    it('returns empty when all matched', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      expect(m.getUnmatchedLeft()).toEqual([])
    })

    it('returns only unmatched nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      const unmatched = m.getUnmatchedLeft()
      expect(unmatched.length).toBe(1)
      expect(['a', 'b']).toContain(unmatched[0])
    })

    it('returns empty for empty graph', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.getUnmatchedLeft()).toEqual([])
    })

    it('returns all left nodes when right partition is empty', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addLeftNode('b')
      expect(m.getUnmatchedLeft()).toEqual(expect.arrayContaining(['a', 'b']))
    })
  })

  describe('getUnmatchedRight', () => {
    it('returns all right nodes when no matching', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addRightNode('x')
      m.addRightNode('y')
      expect(m.getUnmatchedRight()).toEqual(expect.arrayContaining(['x', 'y']))
    })

    it('returns empty when all matched', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      expect(m.getUnmatchedRight()).toEqual([])
    })

    it('returns only unmatched nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'x')
      const unmatched = m.getUnmatchedRight()
      expect(unmatched.length).toBe(0)
    })

    it('returns empty for empty graph', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.getUnmatchedRight()).toEqual([])
    })

    it('returns all right nodes when left partition is empty', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addRightNode('x')
      m.addRightNode('y')
      expect(m.getUnmatchedRight()).toEqual(expect.arrayContaining(['x', 'y']))
    })
  })

  describe('getNeighbors', () => {
    it('returns neighbors of left node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      const neighbors = m.getNeighbors('a')
      expect(neighbors).toEqual(expect.arrayContaining(['x', 'y']))
      expect(neighbors.length).toBe(2)
    })

    it('returns neighbors of right node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      const neighbors = m.getNeighbors('x')
      expect(neighbors).toEqual(expect.arrayContaining(['a', 'b']))
      expect(neighbors.length).toBe(2)
    })

    it('returns empty for isolated left node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      expect(m.getNeighbors('a')).toEqual([])
    })

    it('returns empty for isolated right node', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addRightNode('x')
      expect(m.getNeighbors('x')).toEqual([])
    })

    it('returns empty for unknown node', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.getNeighbors('z')).toEqual([])
    })

    it('returns neighbors after edge removal', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.removeEdge('a', 'x')
      const neighbors = m.getNeighbors('a')
      expect(neighbors).toEqual(['y'])
    })

    it('updates reverse neighbors after edge removal', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      m.removeEdge('a', 'x')
      const neighbors = m.getNeighbors('x')
      expect(neighbors).toEqual(['b'])
    })
  })

  describe('getEdges', () => {
    it('returns empty for empty graph', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.getEdges()).toEqual([])
    })

    it('returns all edges', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      const edges = m.getEdges()
      expect(edges.length).toBe(2)
      expect(edges).toEqual(expect.arrayContaining([['a', 'x'], ['b', 'y']]))
    })

    it('returns edges after removal', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.removeEdge('a', 'x')
      const edges = m.getEdges()
      expect(edges).toEqual([['a', 'y']])
    })

    it('returns edges for graph with multiple connections', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'x')
      m.addEdge('b', 'z')
      expect(m.getEdges().length).toBe(4)
    })
  })

  describe('leftSize / rightSize / edgeCount', () => {
    it('tracks leftSize correctly', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.leftSize).toBe(0)
      m.addLeftNode('a')
      expect(m.leftSize).toBe(1)
      m.addLeftNode('b')
      expect(m.leftSize).toBe(2)
    })

    it('tracks rightSize correctly', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.rightSize).toBe(0)
      m.addRightNode('x')
      expect(m.rightSize).toBe(1)
    })

    it('tracks edgeCount correctly', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.edgeCount).toBe(0)
      m.addEdge('a', 'x')
      expect(m.edgeCount).toBe(1)
      m.addEdge('b', 'y')
      expect(m.edgeCount).toBe(2)
      m.removeEdge('a', 'x')
      expect(m.edgeCount).toBe(1)
    })

    it('edgeCount reflects duplicates', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'x')
      expect(m.edgeCount).toBe(1)
    })

    it('counts after clear', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      m.clear()
      expect(m.leftSize).toBe(0)
      expect(m.rightSize).toBe(0)
      expect(m.edgeCount).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears all data', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      m.addEdge('c', 'z')
      m.clear()
      expect(m.leftSize).toBe(0)
      expect(m.rightSize).toBe(0)
      expect(m.edgeCount).toBe(0)
      expect(m.getEdges()).toEqual([])
    })

    it('allows adding edges after clear', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.clear()
      m.addEdge('b', 'y')
      expect(m.edgeCount).toBe(1)
      expect(m.hasEdge('b', 'y')).toBe(true)
      expect(m.hasEdge('a', 'x')).toBe(false)
    })

    it('maxMatching returns empty after clear', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.clear()
      expect(m.maxMatching()).toEqual(new Map())
      expect(m.maxMatchingSize()).toBe(0)
    })

    it('isPerfectMatching returns true after clear', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.clear()
      expect(m.isPerfectMatching()).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      const c = m.clone()
      expect(c.leftSize).toBe(m.leftSize)
      expect(c.rightSize).toBe(m.rightSize)
      expect(c.edgeCount).toBe(m.edgeCount)
    })

    it('clone is independent from original', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      const c = m.clone()
      c.addEdge('b', 'y')
      expect(m.edgeCount).toBe(1)
      expect(c.edgeCount).toBe(2)
    })

    it('clone preserves edges', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'x')
      const c = m.clone()
      expect(c.hasEdge('a', 'x')).toBe(true)
      expect(c.hasEdge('a', 'y')).toBe(true)
      expect(c.hasEdge('b', 'x')).toBe(true)
      expect(c.hasEdge('b', 'y')).toBe(false)
    })

    it('clone preserves matching cache', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      const size1 = m.maxMatchingSize()
      const c = m.clone()
      expect(c.maxMatchingSize()).toBe(size1)
    })

    it('modifying clone does not affect original edges', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      const c = m.clone()
      c.removeEdge('a', 'x')
      expect(m.hasEdge('a', 'x')).toBe(true)
      expect(c.hasEdge('a', 'x')).toBe(false)
    })

    it('clearing clone does not affect original', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      const c = m.clone()
      c.clear()
      expect(m.edgeCount).toBe(1)
      expect(c.edgeCount).toBe(0)
    })

    it('clone of empty graph works', () => {
      const m = new BipartiteMatcher<string, string>()
      const c = m.clone()
      expect(c.leftSize).toBe(0)
      expect(c.rightSize).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles empty graph maxMatching', () => {
      const m = new BipartiteMatcher<string, string>()
      expect(m.maxMatching()).toEqual(new Map())
    })

    it('handles single edge perfectly', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.maxMatchingSize()).toBe(1)
      expect(m.isPerfectMatching()).toBe(true)
      expect(m.getUnmatchedLeft()).toEqual([])
      expect(m.getUnmatchedRight()).toEqual([])
    })

    it('handles no edges with nodes', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addLeftNode('b')
      m.addRightNode('x')
      m.addRightNode('y')
      expect(m.maxMatchingSize()).toBe(0)
      expect(m.isPerfectMatching()).toBe(false)
    })

    it('handles disconnected graph', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('c', 'z')
      m.addLeftNode('b')
      m.addRightNode('y')
      expect(m.maxMatchingSize()).toBe(2)
    })

    it('handles complete bipartite K4,4', () => {
      const m = new BipartiteMatcher<number, number>()
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          m.addEdge(i, j)
        }
      }
      expect(m.maxMatchingSize()).toBe(4)
      expect(m.isPerfectMatching()).toBe(true)
    })

    it('handles chain graph', () => {
      const m = new BipartiteMatcher<number, number>()
      m.addEdge(0, 0)
      m.addEdge(0, 1)
      m.addEdge(1, 1)
      m.addEdge(1, 2)
      m.addEdge(2, 2)
      m.addEdge(2, 3)
      expect(m.maxMatchingSize()).toBe(3)
    })

    it('handles single node per partition with no edge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addLeftNode('a')
      m.addRightNode('x')
      expect(m.maxMatchingSize()).toBe(0)
      expect(m.isPerfectMatching()).toBe(false)
    })

    it('handles many edges to same right node', () => {
      const m = new BipartiteMatcher<string, string>()
      for (let i = 0; i < 5; i++) {
        m.addEdge(`l${i}`, 'x')
      }
      expect(m.maxMatchingSize()).toBe(1)
    })
  })

  describe('known matching problems', () => {
    it('solves job assignment problem', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('alice', 'dev')
      m.addEdge('alice', 'test')
      m.addEdge('bob', 'dev')
      m.addEdge('bob', 'design')
      m.addEdge('carol', 'test')
      m.addEdge('carol', 'design')
      expect(m.maxMatchingSize()).toBe(3)
      expect(m.isPerfectMatching()).toBe(true)
    })

    it('solves Hall\'s theorem example', () => {
      const m = new BipartiteMatcher<number, number>()
      m.addEdge(1, 1)
      m.addEdge(1, 2)
      m.addEdge(2, 1)
      m.addEdge(3, 2)
      expect(m.maxMatchingSize()).toBe(2)
    })

    it('handles bottleneck graph', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      m.addEdge('c', 'x')
      m.addEdge('d', 'x')
      m.addEdge('e', 'x')
      expect(m.maxMatchingSize()).toBe(1)
      expect(m.getUnmatchedLeft().length).toBe(4)
    })

    it('handles alternating path example', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', '1')
      m.addEdge('a', '2')
      m.addEdge('b', '2')
      m.addEdge('b', '3')
      m.addEdge('c', '3')
      m.addEdge('c', '4')
      m.addEdge('d', '4')
      expect(m.maxMatchingSize()).toBe(4)
    })

    it('handles augmenting path discovery', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'y')
      m.addEdge('c', 'y')
      m.addEdge('c', 'z')
      const matching = m.maxMatching()
      expect(matching.size).toBe(3)
    })

    it('handles large sparse graph', () => {
      const m = new BipartiteMatcher<number, number>()
      for (let i = 0; i < 20; i++) {
        m.addEdge(i, i)
        m.addEdge(i, (i + 1) % 20)
      }
      expect(m.maxMatchingSize()).toBe(20)
    })

    it('handles graph where greedy fails but Hopcroft-Karp succeeds', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      m.addEdge('b', 'x')
      m.addEdge('c', 'y')
      m.addEdge('c', 'z')
      expect(m.maxMatchingSize()).toBe(3)
    })

    it('handles dense unbalanced graph', () => {
      const m = new BipartiteMatcher<number, string>()
      for (let i = 0; i < 5; i++) {
        for (const r of ['a', 'b', 'c']) {
          m.addEdge(i, r)
        }
      }
      expect(m.maxMatchingSize()).toBe(3)
      expect(m.isPerfectMatching()).toBe(true)
    })
  })

  describe('caching behavior', () => {
    it('caches matching result', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      const r1 = m.maxMatching()
      const r2 = m.maxMatching()
      expect(r1).toEqual(r2)
    })

    it('invalidates cache on addEdge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.maxMatchingSize()).toBe(1)
      m.addEdge('b', 'y')
      expect(m.maxMatchingSize()).toBe(2)
    })

    it('invalidates cache on removeEdge', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'y')
      expect(m.maxMatchingSize()).toBe(2)
      m.removeEdge('b', 'y')
      expect(m.maxMatchingSize()).toBe(1)
    })

    it('invalidates cache on addLeftNode', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('a', 'y')
      expect(m.maxMatchingSize()).toBe(1)
      m.addLeftNode('b')
      m.addLeftNode('c')
      expect(m.isPerfectMatching()).toBe(false)
    })

    it('invalidates cache on addRightNode', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      m.addEdge('b', 'x')
      expect(m.maxMatchingSize()).toBe(1)
      m.addRightNode('y')
      m.addRightNode('z')
      expect(m.isPerfectMatching()).toBe(false)
    })

    it('invalidates cache on clear', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.maxMatchingSize()).toBe(1)
      m.clear()
      expect(m.maxMatchingSize()).toBe(0)
    })
  })

  describe('type safety', () => {
    it('works with string-string types', () => {
      const m = new BipartiteMatcher<string, string>()
      m.addEdge('a', 'x')
      expect(m.maxMatching().get('a')).toBe('x')
    })

    it('works with number-number types', () => {
      const m = new BipartiteMatcher<number, number>()
      m.addEdge(1, 10)
      expect(m.maxMatching().get(1)).toBe(10)
    })

    it('works with string-number types', () => {
      const m = new BipartiteMatcher<string, number>()
      m.addEdge('a', 1)
      expect(m.maxMatching().get('a')).toBe(1)
    })

    it('works with number-string types', () => {
      const m = new BipartiteMatcher<number, string>()
      m.addEdge(1, 'x')
      expect(m.maxMatching().get(1)).toBe('x')
    })
  })
})
