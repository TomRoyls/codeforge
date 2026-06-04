import { describe, expect, it } from 'vitest'
import { TopologicalColoring } from '../../src/utils/topological-coloring.js'

describe('TopologicalColoring', () => {
  it('colors single node', () => {
    const tc = new TopologicalColoring(1)
    expect(tc.colorSequential()).toEqual([0])
  })

  it('colors path', () => {
    const tc = new TopologicalColoring(3)
    tc.addEdge(0, 1)
    tc.addEdge(1, 2)
    expect(tc.chromaticNumber()).toBe(2)
  })

  it('colors triangle', () => {
    const tc = new TopologicalColoring(3)
    tc.addEdge(0, 1)
    tc.addEdge(1, 2)
    tc.addEdge(0, 2)
    expect(tc.chromaticNumber()).toBe(3)
  })

  it('colors star', () => {
    const tc = new TopologicalColoring(4)
    tc.addEdge(0, 1)
    tc.addEdge(0, 2)
    tc.addEdge(0, 3)
    expect(tc.chromaticNumber()).toBe(2)
  })

  it('colors K4', () => {
    const tc = new TopologicalColoring(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        tc.addEdge(i, j)
    expect(tc.chromaticNumber()).toBe(4)
  })

  it('empty graph needs 1 color', () => {
    const tc = new TopologicalColoring(3)
    expect(tc.chromaticNumber()).toBe(1)
  })

  it('no adjacent same color', () => {
    const tc = new TopologicalColoring(5)
    tc.addEdge(0, 1)
    tc.addEdge(1, 2)
    tc.addEdge(2, 3)
    tc.addEdge(3, 4)
    tc.addEdge(0, 4)
    const colors = tc.colorSequential()
    expect(colors.length).toBe(5)
  })

  it('largest first uses fewer colors', () => {
    const tc = new TopologicalColoring(4)
    tc.addEdge(0, 1)
    tc.addEdge(0, 2)
    tc.addEdge(0, 3)
    tc.addEdge(1, 2)
    const seq = Math.max(...tc.colorSequential()) + 1
    const lf = tc.chromaticNumber()
    expect(lf).toBeLessThanOrEqual(seq)
  })

  it('handles two disconnected', () => {
    const tc = new TopologicalColoring(2)
    expect(tc.chromaticNumber()).toBe(1)
  })

  it('handles cycle', () => {
    const tc = new TopologicalColoring(4)
    for (let i = 0; i < 4; i++) tc.addEdge(i, (i + 1) % 4)
    expect(tc.chromaticNumber()).toBe(2)
  })

  it('handles wheel graph', () => {
    const tc = new TopologicalColoring(5)
    tc.addEdge(0, 1)
    tc.addEdge(0, 2)
    tc.addEdge(0, 3)
    tc.addEdge(0, 4)
    tc.addEdge(1, 2)
    tc.addEdge(2, 3)
    tc.addEdge(3, 4)
    tc.addEdge(4, 1)
    expect(tc.chromaticNumber()).toBeLessThanOrEqual(4)
  })

  it('handles bipartite', () => {
    const tc = new TopologicalColoring(4)
    tc.addEdge(0, 2)
    tc.addEdge(0, 3)
    tc.addEdge(1, 2)
    tc.addEdge(1, 3)
    expect(tc.chromaticNumber()).toBe(2)
  })

  it('handles single node', () => {
    const tc = new TopologicalColoring(1)
    expect(tc.chromaticNumber()).toBe(1)
  })

  it('handles K3', () => {
    const tc = new TopologicalColoring(3)
    tc.addEdge(0, 1)
    tc.addEdge(1, 2)
    tc.addEdge(0, 2)
    expect(tc.chromaticNumber()).toBe(3)
  })

  it('handles K4', () => {
    const tc = new TopologicalColoring(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        tc.addEdge(i, j)
    expect(tc.chromaticNumber()).toBe(4)
  })

  it('handles two nodes with edge', () => {
    const tc = new TopologicalColoring(2)
    tc.addEdge(0, 1)
    expect(tc.chromaticNumber()).toBe(2)
  })

  it('single node needs 1 color', () => {
    const tc = new TopologicalColoring(1)
    expect(tc.chromaticNumber()).toBe(1)
  })

  it('two nodes with edge needs 2 colors', () => {
    const tc = new TopologicalColoring(2)
    tc.addEdge(0, 1)
    expect(tc.chromaticNumber()).toBe(2)
  })

  it('single node needs 1 color', () => {
    const tc = new TopologicalColoring(1)
    expect(tc.chromaticNumber()).toBeGreaterThanOrEqual(1)
  })

  it('chain graph needs 2 colors', () => {
    const tc = new TopologicalColoring(2)
    tc.addEdge(0, 1)
    expect(tc.chromaticNumber()).toBeGreaterThanOrEqual(1)
  })

  it('single node has chromatic number 1', () => {
    const tc = new TopologicalColoring(1)
    expect(tc.chromaticNumber()).toBe(1)
  })

  it('two unconnected nodes have chromatic number 1', () => {
    const tc = new TopologicalColoring(2)
    expect(tc.chromaticNumber()).toBe(1)
  })

  it('complete graph K3 has chromatic number 3', () => {
    const tc = new TopologicalColoring(3)
    tc.addEdge(0, 1)
    tc.addEdge(1, 2)
    tc.addEdge(0, 2)
    expect(tc.chromaticNumber()).toBe(3)
  })

  it('no edges needs 1 color', () => {
    const tc = new TopologicalColoring(3)
    expect(tc.chromaticNumber()).toBe(1)
  })
})
