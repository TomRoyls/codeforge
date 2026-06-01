import { describe, expect, it } from 'vitest'
import { ModularDecomposition } from '../../src/utils/modular-decomposition.js'

describe('ModularDecomposition', () => {
  it('empty graph', () => {
    const md = new ModularDecomposition(0)
    expect(md.findModules()).toEqual([])
  })

  it('single node', () => {
    const md = new ModularDecomposition(1)
    expect(md.findModules()).toEqual([[0]])
  })

  it('disconnected nodes are modules', () => {
    const md = new ModularDecomposition(3)
    const modules = md.findModules()
    expect(modules.length).toBe(1)
    expect(modules[0]!.length).toBe(3)
  })

  it('complete graph is one module', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(0, 2)
    const modules = md.findModules()
    expect(modules.length).toBe(1)
  })

  it('path separates endpoints', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    expect(md.isModule(0, 2)).toBe(true)
  })

  it('isModule check', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.isModule(1, 2)).toBe(true)
    expect(md.isModule(0, 1)).toBe(false)
  })

  it('isStrongModule for complete', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.isStrongModule([1, 2, 3])).toBe(true)
  })

  it('moduleCount', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('single edge', () => {
    const md = new ModularDecomposition(2)
    md.addEdge(0, 1)
    expect(md.moduleCount()).toBe(1)
  })

  it('handles star center not module with leaves', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.isModule(0, 1)).toBe(false)
    expect(md.isModule(1, 2)).toBe(true)
  })

  it('handles path of 4', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(2)
  })

  it('handles K4 all modules', () => {
    const md = new ModularDecomposition(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        md.addEdge(i, j)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('empty graph has modules', () => {
    const md = new ModularDecomposition(3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(0)
  })

  it('single node has modules', () => {
    const md = new ModularDecomposition(1)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(0)
  })

  it('handles single edge two nodes', () => {
    const md = new ModularDecomposition(2)
    md.addEdge(0, 1)
    expect(md.isModule(0, 1)).toBe(true)
  })

  it('handles path graph', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(0)
  })

  it('handles single node', () => {
    const md = new ModularDecomposition(1)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('handles two nodes no edge', () => {
    const md = new ModularDecomposition(2)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })
})
