import { describe, it, expect } from 'vitest'
import { EulerianPath } from '../../src/utils/eulerian-path.js'

describe('EulerianPath', () => {
  it('finds eulerian circuit in triangle', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('circuit')
    expect(ep.path.length).toBe(4)
  })

  it('finds eulerian path in line graph', () => {
    const adj = [[1], [0, 2], [1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('path')
    expect(ep.path.length).toBe(3)
  })

  it('returns none for graph with too many odd vertices', () => {
    const adj = [[1], [0, 2, 3], [1], [1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(false)
    expect(ep.type).toBe('none')
  })

  it('handles empty graph', () => {
    const adj: number[][] = []
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
  })

  it('handles single node', () => {
    const adj = [[]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
  })

  it('handles two nodes with single edge', () => {
    const adj = [[1], [0]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('path')
    expect(ep.path.length).toBe(2)
  })

  it('handles cycle graph', () => {
    const adj = [[1, 3], [0, 2], [1, 3], [0, 2]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('circuit')
    expect(ep.path.length).toBe(5)
  })

  it('static hasEulerianCircuit works', () => {
    expect(EulerianPath.hasEulerianCircuit([[1], [0]])).toBe(false)
    expect(EulerianPath.hasEulerianCircuit([[1, 2], [0, 2], [0, 1]])).toBe(true)
  })

  it('static hasEulerianPath works', () => {
    expect(EulerianPath.hasEulerianPath([[1], [0]])).toBe(true)
    expect(EulerianPath.hasEulerianPath([[1, 2, 3], [0], [0], [0]])).toBe(false)
  })

  it('path visits all edges exactly once', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.path.length).toBe(4)
    const visitedEdges = new Set<string>()
    for (let i = 0; i < ep.path.length - 1; i++) {
      const u = ep.path[i]!
      const v = ep.path[i + 1]!
      const key = u < v ? `${u}-${v}` : `${v}-${u}`
      expect(visitedEdges.has(key)).toBe(false)
      visitedEdges.add(key)
    }
    expect(visitedEdges.size).toBe(3)
  })

  it('handles graph with isolated nodes', () => {
    const adj = [[1], [0], []]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('path')
  })

  it('handles two disconnected edges', () => {
    const adj = [[1], [0], [3], [2]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(false)
  })

  it('handles star graph with 4 edges', () => {
    const adj = [[1, 2, 3, 4], [0], [0], [0], [0]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(false)
    expect(ep.type).toBe('none')
  })

  it('handles butterfly graph', () => {
    const adj = [[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.path.length).toBe(6)
  })

  it('handles larger complete graph', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
  })

  it('handles disconnected graph', () => {
    const adj = [[1], [0], [3], [2]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(false)
  })

  it('non-eulerian graph', () => {
    const adj = [[1], []]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(false)
  })

  it('single edge is eulerian', () => {
    const adj = [[1], [0]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
  })

  it('single vertex no edges', () => {
    const adj: number[][] = [[]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
  })

  it('single node is eulerian circuit', () => {
    const adj: number[][] = [[]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('circuit')
  })

  it('circuit path starts and ends at same node', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('circuit')
    expect(ep.path[0]).toBe(ep.path[ep.path.length - 1])
  })

  it('k5 complete graph has eulerian circuit', () => {
    const adj = [
      [1, 2, 3, 4],
      [0, 2, 3, 4],
      [0, 1, 3, 4],
      [0, 1, 2, 4],
      [0, 1, 2, 3],
    ]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('circuit')
    expect(ep.path.length).toBe(11)
  })

  it('house graph has eulerian path', () => {
    const adj = [[1, 2], [0, 2, 3], [0, 1, 4], [1, 4], [2, 3]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
  })
})
