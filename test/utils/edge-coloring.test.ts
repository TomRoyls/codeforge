import { describe, expect, it } from 'vitest'
import { EdgeColoring } from '../../src/utils/edge-coloring.js'

describe('EdgeColoring', () => {
  it('colors single edge', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    const colors = ec.greedyColor()
    expect(colors.size).toBe(1)
  })

  it('colors triangle', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(0, 2)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('colors path', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('colors star', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('handles no edges', () => {
    const ec = new EdgeColoring(3)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('tracks max degree', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    expect(ec.maxDegree()).toBe(2)
  })

  it('tracks edge count', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    expect(ec.edgeCount).toBe(2)
  })

  it('colors K4', () => {
    const ec = new EdgeColoring(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        ec.addEdge(i, j)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('no adjacent edges share color', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 3)
    ec.addEdge(0, 3)
    const colors = ec.greedyColor()
    for (let u = 0; u < 4; u++) {
      const neighborColors = new Set<number>()
      for (const v of [0, 1, 2, 3]) {
        const key = u < v ? `${u},${v}` : `${v},${u}`
        if (colors.has(key)) {
          const c = colors.get(key)!
          expect(neighborColors.has(c)).toBe(false)
          neighborColors.add(c)
        }
      }
    }
  })

  it('handles cycle', () => {
    const ec = new EdgeColoring(5)
    for (let i = 0; i < 5; i++) ec.addEdge(i, (i + 1) % 5)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('handles bipartite K2,3', () => {
    const ec = new EdgeColoring(5)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    ec.addEdge(0, 4)
    ec.addEdge(1, 2)
    ec.addEdge(1, 3)
    ec.addEdge(1, 4)
    expect(ec.chromaticIndex()).toBeGreaterThanOrEqual(3)
    expect(ec.maxDegree()).toBe(3)
  })

  it('handles star graph', () => {
    const ec = new EdgeColoring(5)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    ec.addEdge(0, 3)
    ec.addEdge(0, 4)
    expect(ec.chromaticIndex()).toBe(4)
  })

  it('handles single edge', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    expect(ec.chromaticIndex()).toBe(1)
  })

  it('handles empty graph', () => {
    const ec = new EdgeColoring(3)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('handles triangle graph', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(0, 2)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('handles path graph', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 3)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('handles K3 star', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(0, 2)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('single edge needs 1 color', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    expect(ec.chromaticIndex()).toBe(1)
  })

  it('triangle needs 3 colors', () => {
    const ec = new EdgeColoring(3)
    ec.addEdge(0, 1)
    ec.addEdge(1, 2)
    ec.addEdge(2, 0)
    expect(ec.chromaticIndex()).toBe(3)
  })

  it('bipartite graph chromatic index equals max degree', () => {
    const ec = new EdgeColoring(4)
    ec.addEdge(0, 2)
    ec.addEdge(1, 3)
    ec.addEdge(0, 3)
    expect(ec.chromaticIndex()).toBe(2)
  })

  it('single edge has index 1', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    expect(ec.chromaticIndex()).toBe(1)
  })

  it('no edges has chromatic index 0', () => {
    const ec = new EdgeColoring(3)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('single edge needs 1 color', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    expect(ec.chromaticIndex()).toBeGreaterThanOrEqual(1)
  })

  it('no edges has index 0', () => {
    const ec = new EdgeColoring(3)
    expect(ec.chromaticIndex()).toBe(0)
  })

  it('single edge has index 1', () => {
    const ec = new EdgeColoring(2)
    ec.addEdge(0, 1)
    expect(ec.chromaticIndex()).toBe(1)
  })
})
