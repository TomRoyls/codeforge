import { describe, expect, it } from 'vitest'
import { KahnAlgorithm } from '../../src/utils/kahn-algorithm.js'

describe('KahnAlgorithm', () => {
  it('sorts simple DAG', () => {
    const kahn = new KahnAlgorithm(3)
    kahn.addEdge(0, 1)
    kahn.addEdge(1, 2)
    const result = kahn.sort()
    expect(result).toEqual([0, 1, 2])
  })

  it('detects cycle', () => {
    const kahn = new KahnAlgorithm(3)
    kahn.addEdge(0, 1)
    kahn.addEdge(1, 2)
    kahn.addEdge(2, 0)
    expect(kahn.sort()).toBeNull()
  })

  it('handles single node', () => {
    const kahn = new KahnAlgorithm(1)
    expect(kahn.sort()).toEqual([0])
  })

  it('handles disconnected nodes', () => {
    const kahn = new KahnAlgorithm(3)
    const result = kahn.sort()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(3)
  })

  it('handles diamond DAG', () => {
    const kahn = new KahnAlgorithm(4)
    kahn.addEdge(0, 1)
    kahn.addEdge(0, 2)
    kahn.addEdge(1, 3)
    kahn.addEdge(2, 3)
    const result = kahn.sort()
    expect(result).not.toBeNull()
    expect(result![0]).toBe(0)
    expect(result![3]).toBe(3)
  })

  it('handles linear chain', () => {
    const kahn = new KahnAlgorithm(5)
    kahn.addEdge(0, 1)
    kahn.addEdge(1, 2)
    kahn.addEdge(2, 3)
    kahn.addEdge(3, 4)
    expect(kahn.sort()).toEqual([0, 1, 2, 3, 4])
  })

  it('handles self loop', () => {
    const kahn = new KahnAlgorithm(2)
    kahn.addEdge(0, 0)
    expect(kahn.sort()).toBeNull()
  })

  it('handles multiple valid orderings', () => {
    const kahn = new KahnAlgorithm(3)
    kahn.addEdge(0, 2)
    const result = kahn.sort()
    expect(result).not.toBeNull()
    expect(result!.indexOf(0)).toBeLessThan(result!.indexOf(2))
  })

  it('handles empty graph', () => {
    const kahn = new KahnAlgorithm(0)
    expect(kahn.sort()).toEqual([])
  })

  it('handles complex DAG', () => {
    const kahn = new KahnAlgorithm(6)
    kahn.addEdge(5, 2)
    kahn.addEdge(5, 0)
    kahn.addEdge(4, 0)
    kahn.addEdge(4, 1)
    kahn.addEdge(2, 3)
    kahn.addEdge(3, 1)
    const result = kahn.sort()
    expect(result).not.toBeNull()
    expect(result!.indexOf(5)).toBeLessThan(result!.indexOf(2))
    expect(result!.indexOf(2)).toBeLessThan(result!.indexOf(3))
    expect(result!.indexOf(3)).toBeLessThan(result!.indexOf(1))
  })

  it('handles multi-source DAG', () => {
    const kahn = new KahnAlgorithm(5)
    kahn.addEdge(0, 2)
    kahn.addEdge(1, 2)
    kahn.addEdge(2, 3)
    kahn.addEdge(2, 4)
    const result = kahn.sort()
    expect(result).not.toBeNull()
    expect(result!.indexOf(2)).toBeGreaterThan(result!.indexOf(0))
    expect(result!.indexOf(2)).toBeGreaterThan(result!.indexOf(1))
    expect(result!.indexOf(3)).toBeGreaterThan(result!.indexOf(2))
  })

  it('handles partial cycle', () => {
    const kahn = new KahnAlgorithm(4)
    kahn.addEdge(0, 1)
    kahn.addEdge(1, 2)
    kahn.addEdge(2, 1)
    expect(kahn.sort()).toBeNull()
  })

  it('handles single node', () => {
    const kahn = new KahnAlgorithm(1)
    expect(kahn.sort()).toEqual([0])
  })

  it('handles two node chain', () => {
    const kahn = new KahnAlgorithm(2)
    kahn.addEdge(0, 1)
    expect(kahn.sort()).toEqual([0, 1])
  })

  it('handles three independent nodes', () => {
    const kahn = new KahnAlgorithm(3)
    const result = kahn.sort()
    expect(result).not.toBeNull()
    expect(result!.length).toBe(3)
  })

  it('handles empty graph', () => {
    const kahn = new KahnAlgorithm(0)
    expect(kahn.sort()).toEqual([])
  })
})
