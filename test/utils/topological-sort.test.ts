import { describe, expect, it } from 'vitest'
import { TopologicalSort } from '../../src/utils/topological-sort.js'

describe('TopologicalSort', () => {
  it('sorts simple DAG', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(1))
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(1)).toBeLessThan(result!.indexOf(3))
    expect(result!.indexOf(2)).toBeLessThan(result!.indexOf(3))
  })

  it('returns null for cyclic graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [0]],
    ])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })

  it('handles disconnected graph', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []], [2, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.length).toBe(3)
  })

  it('handles linear chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1, 2, 3])
  })

  it('allTopologicalSorts finds all orderings', () => {
    const adj = new Map<number, number[]>([
      [0, [2]], [1, [2]], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(2)
    for (const order of results) {
      expect(order.indexOf(0)).toBeLessThan(order.indexOf(2))
      expect(order.indexOf(1)).toBeLessThan(order.indexOf(2))
    }
  })

  it('allTopologicalSorts linear chain has one order', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    expect(TopologicalSort.allTopologicalSorts(adj)).toEqual([[0, 1, 2]])
  })

  it('sorts complex DAG', () => {
    const adj = new Map<number, number[]>([
      [5, [2, 0]], [4, [0, 1]], [2, [3]], [3, [1]], [0, []], [1, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(5)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(5)).toBeLessThan(result!.indexOf(0))
    expect(result!.indexOf(4)).toBeLessThan(result!.indexOf(1))
  })

  it('handles self-loop as cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [0]],
    ])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('allTopologicalSorts for independent nodes', () => {
    const adj = new Map<number, number[]>([
      [0, []], [1, []], [2, []],
    ])
    const results = TopologicalSort.allTopologicalSorts(adj)
    expect(results.length).toBe(6)
  })

  it('sorts diamond graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [3]], [3, []],
    ])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(1))
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(1)).toBeLessThan(result!.indexOf(3))
  })

  it('handles two-node cycle', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]],
    ])
    expect(TopologicalSort.sort(adj)).toBeNull()
  })

  it('handles large linear chain', () => {
    const adj = new Map<number, number[]>()
    for (let i = 0; i < 10; i++) adj.set(i, i < 9 ? [i + 1] : [])
    const result = TopologicalSort.sort(adj)
    expect(result).not.toBeNull()
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles empty graph', () => {
    const adj = new Map<number, number[]>()
    expect(TopologicalSort.sort(adj)).toEqual([])
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })

  it('handles two nodes no cycle', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1])
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })

  it('handles linear chain', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1, 2])
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })

  it('handles chain of 3', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [2]], [2, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0, 1, 2])
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    expect(TopologicalSort.sort(adj)).toEqual([0])
  })
})
