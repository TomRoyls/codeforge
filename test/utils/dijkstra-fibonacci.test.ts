import { describe, expect, it } from 'vitest'
import { DijkstraFibonacci } from '../../src/utils/dijkstra-fibonacci.js'

describe('DijkstraFibonacci', () => {
  it('finds shortest path in simple graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 1 },
      { from: 2, to: 1, weight: 2 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(3)
    expect(dist[2]).toBe(1)
  })

  it('handles disconnected nodes', () => {
    const edges = [{ from: 0, to: 1, weight: 5 }]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(5)
    expect(dist[2]).toBe(Infinity)
  })

  it('handles single node', () => {
    const dist = DijkstraFibonacci.shortestPath([], 0, 1)
    expect(dist[0]).toBe(0)
  })

  it('handles linear chain', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 2 },
      { from: 2, to: 3, weight: 3 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(6)
  })

  it('finds optimal path in diamond', () => {
    const edges = [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 5 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 3, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(6)
  })

  it('handles zero weight edges', () => {
    const edges = [
      { from: 0, to: 1, weight: 0 },
      { from: 1, to: 2, weight: 3 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 3)
    expect(dist[1]).toBe(0)
    expect(dist[2]).toBe(3)
  })

  it('handles multi-edge paths', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
      { from: 3, to: 1, weight: 1 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(6)
  })

  it('handles self loop', () => {
    const edges = [
      { from: 0, to: 0, weight: 5 },
      { from: 0, to: 1, weight: 2 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 2)
    expect(dist[0]).toBe(0)
    expect(dist[1]).toBe(2)
  })

  it('handles larger graph', () => {
    const edges = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 1 },
      { from: 2, to: 1, weight: 2 },
      { from: 2, to: 3, weight: 5 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[3]).toBe(4)
  })

  it('handles empty graph', () => {
    const dist = DijkstraFibonacci.shortestPath([], 0, 5)
    expect(dist[0]).toBe(0)
    expect(dist[4]).toBe(Infinity)
  })

  it('handles negative source dist', () => {
    const dist = DijkstraFibonacci.shortestPath([], 3, 5)
    expect(dist[3]).toBe(0)
    expect(dist[0]).toBe(Infinity)
  })

  it('handles multiple paths to same node', () => {
    const edges = [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 2, weight: 3 },
      { from: 2, to: 1, weight: 4 },
      { from: 2, to: 3, weight: 8 },
      { from: 1, to: 3, weight: 2 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(7)
    expect(dist[3]).toBe(9)
  })

  it('handles disconnected', () => {
    const edges = [
      { from: 0, to: 1, weight: 5 },
      { from: 2, to: 3, weight: 3 },
    ]
    const dist = DijkstraFibonacci.shortestPath(edges, 0, 4)
    expect(dist[1]).toBe(5)
    expect(dist[2]).toBe(Infinity)
  })

  it('handles single node', () => {
    const dist = DijkstraFibonacci.shortestPath([], 0, 1)
    expect(dist[0]).toBe(0)
  })
})
