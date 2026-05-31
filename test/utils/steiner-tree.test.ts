import { describe, expect, it } from 'vitest'
import { SteinerTree } from '../../src/utils/steiner-tree.js'

describe('SteinerTree', () => {
  it('single terminal has no edges', () => {
    const st = new SteinerTree(3)
    const result = st.approximateSteiner([0])
    expect(result.edges).toEqual([])
    expect(result.totalWeight).toBe(0)
  })

  it('two terminals on edge', () => {
    const st = new SteinerTree(3)
    st.addEdge(0, 1, 5)
    st.addEdge(1, 2, 3)
    const result = st.approximateSteiner([0, 1])
    expect(result.totalWeight).toBe(5)
  })

  it('three terminals on path', () => {
    const st = new SteinerTree(3)
    st.addEdge(0, 1, 2)
    st.addEdge(1, 2, 3)
    const result = st.approximateSteiner([0, 1, 2])
    expect(result.totalWeight).toBe(5)
  })

  it('steiner node helps', () => {
    const st = new SteinerTree(4)
    st.addEdge(0, 3, 1)
    st.addEdge(1, 3, 1)
    st.addEdge(2, 3, 1)
    st.addEdge(0, 1, 10)
    st.addEdge(1, 2, 10)
    const result = st.approximateSteiner([0, 1, 2])
    expect(result.totalWeight).toBeLessThanOrEqual(3)
  })

  it('empty terminals', () => {
    const st = new SteinerTree(3)
    const result = st.approximateSteiner([])
    expect(result.totalWeight).toBe(0)
  })

  it('star graph', () => {
    const st = new SteinerTree(5)
    st.addEdge(0, 1, 1)
    st.addEdge(0, 2, 1)
    st.addEdge(0, 3, 1)
    st.addEdge(0, 4, 1)
    const result = st.approximateSteiner([1, 2, 3, 4])
    expect(result.totalWeight).toBe(4)
  })

  it('handles disconnected terminals', () => {
    const st = new SteinerTree(3)
    st.addEdge(0, 1, 5)
    const result = st.approximateSteiner([0, 2])
    expect(result.edges.length).toBe(0)
  })

  it('triangle terminals', () => {
    const st = new SteinerTree(3)
    st.addEdge(0, 1, 1)
    st.addEdge(1, 2, 1)
    st.addEdge(0, 2, 1)
    const result = st.approximateSteiner([0, 1, 2])
    expect(result.totalWeight).toBe(2)
  })

  it('no duplicate edges', () => {
    const st = new SteinerTree(4)
    st.addEdge(0, 1, 1)
    st.addEdge(1, 2, 1)
    st.addEdge(2, 3, 1)
    const result = st.approximateSteiner([0, 1, 2, 3])
    const keys = new Set<string>()
    for (const [u, v] of result.edges) {
      const k = u < v ? `${u},${v}` : `${v},${u}`
      expect(keys.has(k)).toBe(false)
      keys.add(k)
    }
  })

  it('handles large graph', () => {
    const st = new SteinerTree(6)
    st.addEdge(0, 1, 1)
    st.addEdge(1, 2, 1)
    st.addEdge(2, 3, 1)
    st.addEdge(3, 4, 1)
    st.addEdge(4, 5, 1)
    const result = st.approximateSteiner([0, 3, 5])
    expect(result.totalWeight).toBeLessThanOrEqual(5)
  })
})
