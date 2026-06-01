import { describe, it, expect } from 'vitest'
import { EulerianPath } from '../../src/utils/eulerian-path.js'

describe('EulerianPath', () => {
  it('finds eulerian circuit in triangle', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('circuit')
    const edgeCount = adj.reduce((s, n) => s + n.length, 0)
    expect(ep.path.length).toBe(edgeCount + 1)
  })

  it('finds eulerian path in line graph', () => {
    const adj = [[1], [0, 2], [1]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('path')
    const edgeCount = adj.reduce((s, n) => s + n.length, 0)
    expect(ep.path.length).toBe(edgeCount + 1)
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
  })

  it('handles cycle graph', () => {
    const adj = [[1, 3], [0, 2], [1, 3], [0, 2]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
    expect(ep.type).toBe('circuit')
  })

  it('static hasEulerianCircuit works', () => {
    expect(EulerianPath.hasEulerianCircuit([[1], [0]])).toBe(false)
    expect(EulerianPath.hasEulerianCircuit([[1, 2], [0, 2], [0, 1]])).toBe(true)
  })

  it('static hasEulerianPath works', () => {
    expect(EulerianPath.hasEulerianPath([[1], [0]])).toBe(true)
    expect(EulerianPath.hasEulerianPath([[1, 2, 3], [0], [0], [0]])).toBe(false)
  })

  it('path visits all edges', () => {
    const adj = [[1, 2], [0, 2], [0, 1]]
    const ep = new EulerianPath(adj)
    const edgeCount = adj.reduce((s, n) => s + n.length, 0)
    expect(ep.path.length).toBe(edgeCount + 1)
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
    const edgeCount = adj.reduce((s, n) => s + n.length, 0)
    expect(ep.path.length).toBe(edgeCount + 1)
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

  it('handles single node', () => {
    const adj = [[]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(true)
  })

  it('two disconnected edges not eulerian', () => {
    const adj = [[1], [0], [3], [2]]
    const ep = new EulerianPath(adj)
    expect(ep.isEulerian).toBe(false)
  })
})
