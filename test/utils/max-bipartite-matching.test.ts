import { describe, expect, it } from 'vitest'
import { MaxBipartiteMatching } from '../../src/utils/max-bipartite-matching.js'

describe('MaxBipartiteMatching', () => {
  it('finds perfect matching', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    const result = m.maxMatching()
    expect(result.length).toBe(2)
  })

  it('handles no edges', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles single edge', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles competing edges', () => {
    const m = new MaxBipartiteMatching(2, 1)
    m.addEdge(0, 0)
    m.addEdge(1, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles star matching', () => {
    const m = new MaxBipartiteMatching(1, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(0, 2)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles larger bipartite', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('handles empty left side', () => {
    const m = new MaxBipartiteMatching(0, 3)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles empty right side', () => {
    const m = new MaxBipartiteMatching(3, 0)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles asymmetric sizes', () => {
    const m = new MaxBipartiteMatching(2, 4)
    m.addEdge(0, 0)
    m.addEdge(0, 2)
    m.addEdge(1, 1)
    m.addEdge(1, 3)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('handles no matching possible', () => {
    const m = new MaxBipartiteMatching(3, 3)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles complete bipartite', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(0, 2)
    m.addEdge(1, 0)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 0)
    m.addEdge(2, 1)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('returns matching pairs', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    const pairs = m.maxMatching()
    expect(pairs.length).toBe(2)
    expect(pairs).toContainEqual([0, 0])
    expect(pairs).toContainEqual([1, 1])
  })

  it('handles single edge', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles 2x2 partial edges', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles no edges', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles K2,2 complete', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 0)
    m.addEdge(1, 1)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('handles no edges', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('single edge matches', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('no edges gives zero matching', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('single edge gives matching 1', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('no edges has 0 matching', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(m.getMatchingSize()).toBe(0)
  })
})
