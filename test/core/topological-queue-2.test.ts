import { describe, it, expect } from 'vitest'
import { TopologicalQueue2 } from '../../src/core/topological-queue-2/index.js'

// ─── Constructor ───

describe('TopologicalQueue2 constructor', () => {
  it('creates an empty graph', () => {
    const g = new TopologicalQueue2()
    expect(g.getNodes()).toEqual([])
    expect(g.getEdges()).toEqual([])
  })
})

// ─── addNode ───

describe('TopologicalQueue2 addNode', () => {
  it('adds a single node', () => {
    const g = new TopologicalQueue2()
    g.addNode('a')
    expect(g.getNodes()).toEqual(['a'])
  })

  it('ignores duplicate node additions', () => {
    const g = new TopologicalQueue2()
    g.addNode('a')
    g.addNode('a')
    expect(g.getNodes()).toEqual(['a'])
  })

  it('adds multiple nodes', () => {
    const g = new TopologicalQueue2()
    g.addNode('a')
    g.addNode('b')
    g.addNode('c')
    expect(g.getNodes().sort()).toEqual(['a', 'b', 'c'])
  })
})

// ─── addEdge ───

describe('TopologicalQueue2 addEdge', () => {
  it('adds an edge between two nodes', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    expect(g.getEdges()).toEqual([{ from: 'a', to: 'b' }])
  })

  it('auto-creates nodes when adding an edge', () => {
    const g = new TopologicalQueue2()
    g.addEdge('x', 'y')
    expect(g.getNodes().sort()).toEqual(['x', 'y'])
  })

  it('ignores duplicate edges', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('a', 'b')
    expect(g.getEdges()).toEqual([{ from: 'a', to: 'b' }])
    expect(g.inDegree('b')).toBe(1)
  })

  it('adds multiple edges from the same node', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('a', 'c')
    expect(g.getEdges().length).toBe(2)
    expect(g.outDegree('a')).toBe(2)
  })
})

// ─── sort ───

describe('TopologicalQueue2 sort', () => {
  it('returns empty array for graph with no nodes', () => {
    const g = new TopologicalQueue2()
    expect(g.sort()).toEqual([])
  })

  it('returns single node for graph with one node', () => {
    const g = new TopologicalQueue2()
    g.addNode('a')
    expect(g.sort()).toEqual(['a'])
  })

  it('sorts a simple linear chain', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    expect(g.sort()).toEqual(['a', 'b', 'c'])
  })

  it('sorts a diamond dependency graph', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('a', 'c')
    g.addEdge('b', 'd')
    g.addEdge('c', 'd')
    const result = g.sort()
    expect(result.indexOf('a')).toBeLessThan(result.indexOf('b'))
    expect(result.indexOf('a')).toBeLessThan(result.indexOf('c'))
    expect(result.indexOf('b')).toBeLessThan(result.indexOf('d'))
    expect(result.indexOf('c')).toBeLessThan(result.indexOf('d'))
  })

  it('handles disconnected components', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('c', 'd')
    const result = g.sort()
    expect(result.indexOf('a')).toBeLessThan(result.indexOf('b'))
    expect(result.indexOf('c')).toBeLessThan(result.indexOf('d'))
  })

  it('handles isolated nodes (no edges)', () => {
    const g = new TopologicalQueue2()
    g.addNode('a')
    g.addNode('b')
    g.addNode('c')
    const result = g.sort()
    expect(result.sort()).toEqual(['a', 'b', 'c'])
  })

  it('throws on cyclic graph', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    g.addEdge('c', 'a')
    expect(() => g.sort()).toThrow('Graph contains a cycle')
  })

  it('throws on self-loop cycle', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'a')
    expect(() => g.sort()).toThrow('Graph contains a cycle')
  })

  it('handles a complex DAG', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('a', 'c')
    g.addEdge('b', 'd')
    g.addEdge('c', 'd')
    g.addEdge('d', 'e')
    g.addEdge('f', 'e')
    const result = g.sort()
    expect(result.indexOf('a')).toBeLessThan(result.indexOf('b'))
    expect(result.indexOf('a')).toBeLessThan(result.indexOf('c'))
    expect(result.indexOf('d')).toBeLessThan(result.indexOf('e'))
    expect(result.indexOf('f')).toBeLessThan(result.indexOf('e'))
  })
})

// ─── hasCycle ───

describe('TopologicalQueue2 hasCycle', () => {
  it('returns false for empty graph', () => {
    const g = new TopologicalQueue2()
    expect(g.hasCycle()).toBe(false)
  })

  it('returns false for single node with no edges', () => {
    const g = new TopologicalQueue2()
    g.addNode('a')
    expect(g.hasCycle()).toBe(false)
  })

  it('returns false for acyclic graph', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    expect(g.hasCycle()).toBe(false)
  })

  it('returns true for simple cycle', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'a')
    expect(g.hasCycle()).toBe(true)
  })

  it('returns true for longer cycle', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    g.addEdge('c', 'a')
    expect(g.hasCycle()).toBe(true)
  })

  it('returns true for self-loop', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'a')
    expect(g.hasCycle()).toBe(true)
  })

  it('returns false for disconnected acyclic components', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('c', 'd')
    expect(g.hasCycle()).toBe(false)
  })
})

// ─── getNodes ───

describe('TopologicalQueue2 getNodes', () => {
  it('returns all nodes added via addNode', () => {
    const g = new TopologicalQueue2()
    g.addNode('x')
    g.addNode('y')
    expect(g.getNodes().sort()).toEqual(['x', 'y'])
  })

  it('includes nodes created by addEdge', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    expect(g.getNodes().sort()).toEqual(['a', 'b'])
  })
})

// ─── getEdges ───

describe('TopologicalQueue2 getEdges', () => {
  it('returns empty array for graph with no edges', () => {
    const g = new TopologicalQueue2()
    g.addNode('a')
    expect(g.getEdges()).toEqual([])
  })

  it('returns all edges', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    const edges = g.getEdges()
    expect(edges).toContainEqual({ from: 'a', to: 'b' })
    expect(edges).toContainEqual({ from: 'b', to: 'c' })
  })
})

// ─── inDegree ───

describe('TopologicalQueue2 inDegree', () => {
  it('returns 0 for unknown node', () => {
    const g = new TopologicalQueue2()
    expect(g.inDegree('z')).toBe(0)
  })

  it('returns 0 for node with no incoming edges', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    expect(g.inDegree('a')).toBe(0)
  })

  it('counts incoming edges correctly', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'c')
    g.addEdge('b', 'c')
    expect(g.inDegree('c')).toBe(2)
  })
})

// ─── outDegree ───

describe('TopologicalQueue2 outDegree', () => {
  it('returns 0 for unknown node', () => {
    const g = new TopologicalQueue2()
    expect(g.outDegree('z')).toBe(0)
  })

  it('returns 0 for node with no outgoing edges', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    expect(g.outDegree('b')).toBe(0)
  })

  it('counts outgoing edges correctly', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('a', 'c')
    g.addEdge('a', 'd')
    expect(g.outDegree('a')).toBe(3)
  })
})

// ─── clear ───

describe('TopologicalQueue2 clear', () => {
  it('removes all nodes and edges', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    g.clear()
    expect(g.getNodes()).toEqual([])
    expect(g.getEdges()).toEqual([])
  })

  it('allows rebuilding after clear', () => {
    const g = new TopologicalQueue2()
    g.addEdge('a', 'b')
    g.clear()
    g.addEdge('x', 'y')
    expect(g.getNodes().sort()).toEqual(['x', 'y'])
    expect(g.sort()).toEqual(['x', 'y'])
  })
})
