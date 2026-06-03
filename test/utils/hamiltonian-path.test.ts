import { describe, expect, it } from 'vitest'
import { HamiltonianPath } from '../../src/utils/hamiltonian-path.js'

describe('HamiltonianPath', () => {
  it('finds path in K3', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(0, 2)
    expect(hp.existsPath()).toBe(true)
  })

  it('finds cycle in K3', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(0, 2)
    expect(hp.existsCycle()).toBe(true)
  })

  it('no path in disconnected', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(false)
  })

  it('handles single node', () => {
    const hp = new HamiltonianPath(1)
    expect(hp.existsPath()).toBe(true)
  })

  it('handles two nodes connected', () => {
    const hp = new HamiltonianPath(2)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(true)
  })

  it('handles path graph', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(2, 3)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(false)
  })

  it('handles no edges', () => {
    const hp = new HamiltonianPath(3)
    expect(hp.existsPath()).toBe(false)
  })

  it('handles K4', () => {
    const hp = new HamiltonianPath(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        hp.addEdge(i, j)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(true)
  })

  it('handles star (no cycle)', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(0, 2)
    hp.addEdge(0, 3)
    expect(hp.existsPath()).toBe(false)
  })

  it('handles two nodes disconnected', () => {
    const hp = new HamiltonianPath(2)
    expect(hp.existsCycle()).toBe(false)
  })

  it('handles K5 cycle', () => {
    const hp = new HamiltonianPath(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        hp.addEdge(i, j)
    expect(hp.existsCycle()).toBe(true)
    expect(hp.existsPath()).toBe(true)
  })

  it('handles path graph no cycle', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(2, 3)
    expect(hp.existsCycle()).toBe(false)
    expect(hp.existsPath()).toBe(true)
  })

  it('handles single node', () => {
    const hp = new HamiltonianPath(1)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(false)
  })

  it('handles two nodes connected', () => {
    const hp = new HamiltonianPath(2)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(true)
  })

  it('handles triangle', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(0, 2)
    expect(hp.existsCycle()).toBe(true)
    expect(hp.existsPath()).toBe(true)
  })

  it('handles empty graph', () => {
    const hp = new HamiltonianPath(3)
    expect(hp.existsPath()).toBe(false)
    expect(hp.existsCycle()).toBe(false)
  })

  it('handles K4 complete graph', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(0, 2)
    hp.addEdge(0, 3)
    hp.addEdge(1, 2)
    hp.addEdge(1, 3)
    hp.addEdge(2, 3)
    expect(hp.existsCycle()).toBe(true)
    expect(hp.existsPath()).toBe(true)
  })

  it('disconnected graph has no path', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(2, 3)
    expect(hp.existsPath()).toBe(false)
  })

  it('triangle graph has hamiltonian path', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(2, 0)
    expect(hp.existsPath()).toBe(true)
  })

  it('disconnected graph has no path', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(false)
  })

  it('two nodes with edge has path', () => {
    const hp = new HamiltonianPath(2)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(true)
  })

  it('disconnected nodes have no path', () => {
    const hp = new HamiltonianPath(3)
    expect(hp.existsPath()).toBe(false)
  })
})
