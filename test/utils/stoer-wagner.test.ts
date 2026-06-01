import { describe, expect, it } from 'vitest'
import { StoerWagner } from '../../src/utils/stoer-wagner.js'

describe('StoerWagner', () => {
  it('finds min cut of single edge', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('finds min cut of triangle', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 2)
    sw.addEdge(1, 2, 3)
    sw.addEdge(0, 2, 4)
    expect(sw.minCut()).toBe(5)
  })

  it('handles single node', () => {
    const sw = new StoerWagner(1)
    expect(sw.minCut()).toBe(0)
  })

  it('handles two nodes no edge', () => {
    const sw = new StoerWagner(2)
    expect(sw.minCut()).toBe(0)
  })

  it('finds min cut of path', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 10)
    sw.addEdge(1, 2, 3)
    sw.addEdge(2, 3, 10)
    expect(sw.minCut()).toBe(3)
  })

  it('handles star graph', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 5)
    sw.addEdge(0, 2, 5)
    sw.addEdge(0, 3, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('handles complete graph', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 1)
    sw.addEdge(0, 2, 1)
    sw.addEdge(0, 3, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(1, 3, 1)
    sw.addEdge(2, 3, 1)
    expect(sw.minCut()).toBe(3)
  })

  it('handles disconnected', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 5)
    sw.addEdge(2, 3, 5)
    expect(sw.minCut()).toBe(0)
  })

  it('handles large weights', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 100)
    sw.addEdge(1, 2, 1)
    sw.addEdge(0, 2, 100)
    expect(sw.minCut()).toBe(101)
  })

  it('handles parallel edges', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 3)
    sw.addEdge(0, 1, 4)
    expect(sw.minCut()).toBe(7)
  })

  it('handles K3 min cut', () => {
    const sw = new StoerWagner(3)
    sw.addEdge(0, 1, 1)
    sw.addEdge(1, 2, 1)
    sw.addEdge(0, 2, 1)
    expect(sw.minCut()).toBe(2)
  })

  it('handles single node', () => {
    const sw = new StoerWagner(1)
    expect(sw.minCut()).toBe(0)
  })

  it('handles two nodes', () => {
    const sw = new StoerWagner(2)
    sw.addEdge(0, 1, 5)
    expect(sw.minCut()).toBe(5)
  })

  it('handles empty graph', () => {
    const sw = new StoerWagner(3)
    expect(sw.minCut()).toBe(0)
  })

  it('handles chain graph', () => {
    const sw = new StoerWagner(4)
    sw.addEdge(0, 1, 5)
    sw.addEdge(1, 2, 3)
    sw.addEdge(2, 3, 7)
    expect(sw.minCut()).toBe(3)
  })
})
