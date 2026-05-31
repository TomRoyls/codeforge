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
})
