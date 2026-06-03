import { describe, expect, it } from 'vitest'
import { VertexColoring } from '../../src/utils/vertex-coloring.js'

describe('VertexColoring', () => {
  it('colors single vertex', () => {
    const vc = new VertexColoring(1)
    expect(vc.greedyColor()).toEqual([0])
  })

  it('colors two disconnected vertices', () => {
    const vc = new VertexColoring(2)
    expect(vc.chromaticNumber()).toBe(1)
  })

  it('colors single edge', () => {
    const vc = new VertexColoring(2)
    vc.addEdge(0, 1)
    expect(vc.chromaticNumber()).toBe(2)
  })

  it('colors triangle', () => {
    const vc = new VertexColoring(3)
    vc.addEdge(0, 1)
    vc.addEdge(1, 2)
    vc.addEdge(0, 2)
    expect(vc.chromaticNumber()).toBe(3)
  })

  it('colors path', () => {
    const vc = new VertexColoring(3)
    vc.addEdge(0, 1)
    vc.addEdge(1, 2)
    expect(vc.chromaticNumber()).toBe(2)
  })

  it('colors star', () => {
    const vc = new VertexColoring(4)
    vc.addEdge(0, 1)
    vc.addEdge(0, 2)
    vc.addEdge(0, 3)
    expect(vc.chromaticNumber()).toBe(2)
  })

  it('colors K4', () => {
    const vc = new VertexColoring(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        vc.addEdge(i, j)
    expect(vc.chromaticNumber()).toBe(4)
  })

  it('validates proper coloring', () => {
    const vc = new VertexColoring(3)
    vc.addEdge(0, 1)
    vc.addEdge(1, 2)
    expect(vc.isProperColoring(vc.greedyColor())).toBe(true)
  })

  it('detects improper coloring', () => {
    const vc = new VertexColoring(3)
    vc.addEdge(0, 1)
    expect(vc.isProperColoring([0, 0, 0])).toBe(false)
  })

  it('tracks max degree', () => {
    const vc = new VertexColoring(3)
    vc.addEdge(0, 1)
    vc.addEdge(0, 2)
    expect(vc.maxDegree()).toBe(2)
  })

  it('handles bipartite', () => {
    const vc = new VertexColoring(4)
    vc.addEdge(0, 2)
    vc.addEdge(0, 3)
    vc.addEdge(1, 2)
    vc.addEdge(1, 3)
    expect(vc.chromaticNumber()).toBe(2)
  })

  it('handles K4', () => {
    const vc = new VertexColoring(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        vc.addEdge(i, j)
    expect(vc.chromaticNumber()).toBe(4)
  })

  it('handles single node', () => {
    const vc = new VertexColoring(1)
    expect(vc.maxDegree()).toBe(0)
  })

  it('handles K3', () => {
    const vc = new VertexColoring(3)
    vc.addEdge(0, 1)
    vc.addEdge(1, 2)
    vc.addEdge(0, 2)
    expect(vc.chromaticNumber()).toBe(3)
  })

  it('handles star graph', () => {
    const vc = new VertexColoring(4)
    vc.addEdge(0, 1)
    vc.addEdge(0, 2)
    vc.addEdge(0, 3)
    expect(vc.chromaticNumber()).toBe(2)
  })

  it('handles two nodes with edge', () => {
    const vc = new VertexColoring(2)
    vc.addEdge(0, 1)
    expect(vc.chromaticNumber()).toBe(2)
  })

  it('single node needs 1 color', () => {
    const vc = new VertexColoring(1)
    expect(vc.chromaticNumber()).toBe(1)
  })

  it('two connected nodes need 2 colors', () => {
    const vc = new VertexColoring(2)
    vc.addEdge(0, 1)
    expect(vc.chromaticNumber()).toBe(2)
  })

  it('single node needs 1 color', () => {
    const vc = new VertexColoring(1)
    expect(vc.chromaticNumber()).toBeGreaterThanOrEqual(1)
  })

  it('edge increases chromatic number', () => {
    const vc = new VertexColoring(2)
    vc.addEdge(0, 1)
    expect(vc.chromaticNumber()).toBeGreaterThanOrEqual(2)
  })

  it('single node needs 1 color', () => {
    const vc = new VertexColoring(1)
    expect(vc.chromaticNumber()).toBe(1)
  })

  it('two unconnected nodes need 1 color', () => {
    const vc = new VertexColoring(2)
    expect(vc.chromaticNumber()).toBe(1)
  })

  it('single node needs 1 color', () => {
    const vc = new VertexColoring(1)
    expect(vc.chromaticNumber()).toBe(1)
  })
})
