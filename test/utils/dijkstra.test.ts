import { describe, expect, it } from 'vitest'
import { Dijkstra } from '../../src/utils/dijkstra.js'

describe('Dijkstra', () => {
  it('finds shortest distances from source', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 4 }, { to: 2, weight: 1 }]],
      [1, [{ to: 3, weight: 1 }]],
      [2, [{ to: 1, weight: 2 }, { to: 3, weight: 5 }]],
      [3, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(3)
    expect(distances.get(2)).toBe(1)
    expect(distances.get(3)).toBe(4)
  })

  it('reconstructs shortest path', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 1 }, { to: 2, weight: 4 }]],
      [1, [{ to: 2, weight: 2 }]],
      [2, []],
    ])
    const { parents } = Dijkstra.shortestPath(adj, 0)
    const path = Dijkstra.reconstructPath(parents, 0, 2)
    expect(path).toEqual([0, 1, 2])
  })

  it('handles single node', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(0)).toBe(0)
  })

  it('handles disconnected graph', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, []], [1, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(0)).toBe(0)
    expect(distances.get(1)).toBe(Infinity)
  })

  it('reconstructPath returns null for unreachable', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, []], [1, []],
    ])
    const { parents } = Dijkstra.shortestPath(adj, 0)
    expect(Dijkstra.reconstructPath(parents, 0, 1)).toBeNull()
  })

  it('stops early when end is reached', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 1 }]],
      [1, [{ to: 2, weight: 1 }]],
      [2, [{ to: 3, weight: 1 }]],
      [3, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0, 2)
    expect(distances.get(2)).toBe(2)
  })

  it('handles graph with equal weight edges', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 1 }, { to: 2, weight: 1 }]],
      [1, [{ to: 3, weight: 1 }]],
      [2, [{ to: 3, weight: 1 }]],
      [3, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(3)).toBe(2)
  })

  it('reconstructPath returns single node for same start/end', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, []],
    ])
    const { parents } = Dijkstra.shortestPath(adj, 0)
    expect(Dijkstra.reconstructPath(parents, 0, 0)).toEqual([0])
  })

  it('finds path in diamond graph', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 1 }, { to: 2, weight: 5 }]],
      [1, [{ to: 3, weight: 1 }]],
      [2, [{ to: 3, weight: 1 }]],
      [3, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(3)).toBe(2)
    const { parents } = Dijkstra.shortestPath(adj, 0)
    const path = Dijkstra.reconstructPath(parents, 0, 3)
    expect(path).toEqual([0, 1, 3])
  })

  it('handles larger graph', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 2 }, { to: 2, weight: 6 }]],
      [1, [{ to: 3, weight: 5 }]],
      [2, [{ to: 3, weight: 8 }]],
      [3, [{ to: 4, weight: 10 }]],
      [4, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(4)).toBe(17)
  })

  it('handles bidirectional edges', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 3 }]],
      [1, [{ to: 0, weight: 7 }, { to: 2, weight: 2 }]],
      [2, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(1)).toBe(3)
    expect(distances.get(2)).toBe(5)
  })

  it('handles multiple paths to same node', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 1 }, { to: 2, weight: 5 }]],
      [1, [{ to: 3, weight: 1 }]],
      [2, [{ to: 3, weight: 1 }]],
      [3, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(3)).toBe(2)
  })

  it('handles unreachable node', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 2 }]],
      [1, []],
      [2, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(2)).toBe(Infinity)
  })

  it('handles single node graph', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(0)).toBe(0)
  })

  it('handles linear chain path', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 2 }]],
      [1, [{ to: 2, weight: 3 }]],
      [2, [{ to: 3, weight: 4 }]],
      [3, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(3)).toBe(9)
  })

  it('handles single edge', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 7 }]],
      [1, []],
    ])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(1)).toBe(7)
  })

  it('handles two node graph with path reconstruction', () => {
    const adj = new Map<number, { to: number; weight: number }[]>([
      [0, [{ to: 1, weight: 3 }]],
      [1, []],
    ])
    const { parents } = Dijkstra.shortestPath(adj, 0)
    expect(Dijkstra.reconstructPath(parents, 0, 1)).toEqual([0, 1])
  })

  it('unreachable returns null', () => {
    const adj = new Map<number, [number, number][]>([[0, []], [1, []]])
    const { parents } = Dijkstra.shortestPath(adj, 0)
    expect(Dijkstra.reconstructPath(parents, 0, 1)).toBeNull()
  })

  it('distance to self is 0', () => {
    const adj = new Map<number, [number, number][]>([[0, []]])
    const { distances } = Dijkstra.shortestPath(adj, 0)
    expect(distances.get(0)).toBe(0)
  })
})
