import { describe, it, expect } from 'vitest'
import { BipartiteMatching } from '../../src/utils/bipartite-matching.js'

describe('BipartiteMatching', () => {
  it('empty graph returns max matching of 0', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(graph.maxMatching()).toBe(0)
    expect(graph.edgeCount).toBe(0)
  })

  it('single edge returns max matching of 1', () => {
    const graph = new BipartiteMatching(2, 2)
    graph.addEdge(0, 0)
    expect(graph.maxMatching()).toBe(1)
    expect(graph.getMatch(0)).toBe(0)
  })

  it('perfect matching with same size both sides', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    expect(graph.maxMatching()).toBe(3)
  })

  it('no edges returns max matching of 0', () => {
    const graph = new BipartiteMatching(5, 5)
    expect(graph.maxMatching()).toBe(0)
    expect(graph.getMatching().size).toBe(0)
  })

  it('multiple edges per left node', () => {
    const graph = new BipartiteMatching(2, 3)
    graph.addEdge(0, 0)
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)
    graph.addEdge(1, 0)
    expect(graph.maxMatching()).toBe(2)
  })

  it('larger graph with 20+ nodes', () => {
    const graph = new BipartiteMatching(10, 12)
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 5; j++) {
        graph.addEdge(i, j)
      }
    }
    expect(graph.maxMatching()).toBe(5)
  })

  it('complete bipartite graph max matching equals min size', () => {
    const graph = new BipartiteMatching(4, 6)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 6; j++) {
        graph.addEdge(i, j)
      }
    }
    expect(graph.maxMatching()).toBe(Math.min(4, 6))
  })

  it('getMatching returns correct pairs', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 1)
    graph.addEdge(1, 0)
    graph.addEdge(2, 2)
    graph.maxMatching()
    const matching = graph.getMatching()
    expect(matching.size).toBe(3)
    expect(matching.has(0)).toBe(true)
    expect(matching.has(1)).toBe(true)
    expect(matching.has(2)).toBe(true)
  })

  it('isMatched and getMatch work correctly', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.maxMatching()
    expect(graph.isMatched(0)).toBe(true)
    expect(graph.isMatched(1)).toBe(true)
    expect(graph.isMatched(2)).toBe(false)
    expect(graph.getMatch(0)).toBe(0)
    expect(graph.getMatch(1)).toBe(1)
    expect(graph.getMatch(2)).toBeUndefined()
  })

  it('asymmetric sizes with more left than right', () => {
    const graph = new BipartiteMatching(5, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    graph.addEdge(3, 0)
    graph.addEdge(4, 1)
    expect(graph.maxMatching()).toBe(3)
  })

  it('clear resets matching and edges', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.maxMatching()
    expect(graph.maxMatching()).toBe(2)
    graph.clear()
    expect(graph.maxMatching()).toBe(0)
    expect(graph.edgeCount).toBe(0)
  })

  it('edge count tracks correctly', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(graph.edgeCount).toBe(0)
    graph.addEdge(0, 0)
    expect(graph.edgeCount).toBe(1)
    graph.addEdge(0, 1)
    expect(graph.edgeCount).toBe(2)
    graph.addEdge(1, 0)
    expect(graph.edgeCount).toBe(3)
  })

  it('disconnected components', () => {
    const graph = new BipartiteMatching(6, 6)
    graph.addEdge(0, 0)
    graph.addEdge(0, 1)
    graph.addEdge(1, 0)
    graph.addEdge(3, 3)
    graph.addEdge(4, 4)
    graph.addEdge(5, 5)
    expect(graph.maxMatching()).toBe(5)
  })

  it('duplicate edges are not counted twice', () => {
    const graph = new BipartiteMatching(2, 2)
    graph.addEdge(0, 0)
    graph.addEdge(0, 0)
    graph.addEdge(0, 0)
    expect(graph.edgeCount).toBe(1)
    expect(graph.maxMatching()).toBe(1)
  })

  it('addEdge throws on invalid left node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.addEdge(-1, 0)).toThrow(RangeError)
    expect(() => graph.addEdge(3, 0)).toThrow(RangeError)
  })

  it('addEdge throws on invalid right node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.addEdge(0, -1)).toThrow(RangeError)
    expect(() => graph.addEdge(0, 3)).toThrow(RangeError)
  })

  it('isMatched throws on invalid left node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.isMatched(-1)).toThrow(RangeError)
    expect(() => graph.isMatched(3)).toThrow(RangeError)
  })

  it('getMatch throws on invalid left node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.getMatch(-1)).toThrow(RangeError)
    expect(() => graph.getMatch(3)).toThrow(RangeError)
  })

  it('leftSize and rightSize are read-only', () => {
    const graph = new BipartiteMatching(5, 7)
    expect(graph.leftSize).toBe(5)
    expect(graph.rightSize).toBe(7)
  })

  it('matching after multiple maxMatching calls', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    expect(graph.maxMatching()).toBe(3)
    expect(graph.maxMatching()).toBe(3)
  })
})