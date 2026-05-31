import { describe, expect, it } from 'vitest'
import { ChinesePostman } from '../../src/utils/chinese-postman.js'

describe('ChinesePostman', () => {
  it('handles eulerian graph (no odd vertices)', () => {
    const cp = new ChinesePostman(3)
    cp.addEdge(0, 1, 1)
    cp.addEdge(1, 2, 1)
    cp.addEdge(2, 0, 1)
    expect(cp.solve()).toBe(3)
  })

  it('handles single edge', () => {
    const cp = new ChinesePostman(2)
    cp.addEdge(0, 1, 5)
    expect(cp.solve()).toBe(10)
  })

  it('handles path of 3', () => {
    const cp = new ChinesePostman(3)
    cp.addEdge(0, 1, 2)
    cp.addEdge(1, 2, 3)
    expect(cp.solve()).toBe(10)
  })

  it('handles single node', () => {
    const cp = new ChinesePostman(1)
    expect(cp.solve()).toBe(0)
  })

  it('handles square', () => {
    const cp = new ChinesePostman(4)
    cp.addEdge(0, 1, 1)
    cp.addEdge(1, 2, 1)
    cp.addEdge(2, 3, 1)
    cp.addEdge(3, 0, 1)
    expect(cp.solve()).toBe(4)
  })

  it('handles triangle with pendant', () => {
    const cp = new ChinesePostman(4)
    cp.addEdge(0, 1, 1)
    cp.addEdge(1, 2, 1)
    cp.addEdge(2, 0, 1)
    cp.addEdge(2, 3, 2)
    const result = cp.solve()
    expect(result).toBeGreaterThan(5)
  })

  it('handles two edges', () => {
    const cp = new ChinesePostman(3)
    cp.addEdge(0, 1, 1)
    cp.addEdge(0, 2, 1)
    expect(cp.solve()).toBe(4)
  })

  it('handles K4 (odd degree vertices)', () => {
    const cp = new ChinesePostman(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        cp.addEdge(i, j, 1)
    expect(cp.solve()).toBe(8)
  })

  it('handles disconnected (some unreachable)', () => {
    const cp = new ChinesePostman(4)
    cp.addEdge(0, 1, 1)
    cp.addEdge(2, 3, 1)
    const result = cp.solve()
    expect(result).toBeGreaterThan(0)
  })

  it('handles weighted edges', () => {
    const cp = new ChinesePostman(3)
    cp.addEdge(0, 1, 10)
    cp.addEdge(1, 2, 20)
    cp.addEdge(0, 2, 5)
    expect(cp.solve()).toBe(35)
  })

  it('handles single edge correctly', () => {
    const cp = new ChinesePostman(2)
    cp.addEdge(0, 1, 3)
    expect(cp.solve()).toBe(6)
  })

  it('handles larger eulerian graph', () => {
    const cp = new ChinesePostman(4)
    cp.addEdge(0, 1, 1)
    cp.addEdge(1, 2, 1)
    cp.addEdge(2, 3, 1)
    cp.addEdge(3, 0, 1)
    expect(cp.solve()).toBe(4)
  })
})
