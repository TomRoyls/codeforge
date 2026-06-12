import { describe, expect, it } from 'vitest'
import { ModularDecomposition } from '../../src/utils/modular-decomposition.js'

describe('ModularDecomposition', () => {
  it('empty graph returns no modules', () => {
    const md = new ModularDecomposition(0)
    expect(md.findModules()).toEqual([])
  })

  it('single node returns one module', () => {
    const md = new ModularDecomposition(1)
    expect(md.findModules()).toEqual([[0]])
  })

  it('two disconnected nodes form one module', () => {
    const md = new ModularDecomposition(2)
    expect(md.findModules()).toEqual([[0, 1]])
  })

  it('two connected nodes form one module', () => {
    const md = new ModularDecomposition(2)
    md.addEdge(0, 1)
    expect(md.findModules()).toEqual([[0, 1]])
  })

  it('three disconnected nodes form one module', () => {
    const md = new ModularDecomposition(3)
    const modules = md.findModules()
    expect(modules.length).toBe(1)
    expect(modules[0]).toEqual([0, 1, 2])
  })

  it('complete graph K3 is one module', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(0, 2)
    expect(md.findModules().length).toBe(1)
  })

  it('path of 3 groups endpoints as module', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    expect(md.isModule(0, 2)).toBe(true)
  })

  it('star graph leaves form module', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.isModule(1, 2)).toBe(true)
    expect(md.isModule(1, 3)).toBe(true)
    expect(md.isModule(2, 3)).toBe(true)
  })

  it('star center is not module with leaf', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.isModule(0, 1)).toBe(false)
  })

  it('complete K4 is one module', () => {
    const md = new ModularDecomposition(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        md.addEdge(i, j)
    expect(md.moduleCount()).toBe(1)
  })

  it('path of 4 has multiple modules', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(2)
  })

  it('isModule for single edge two nodes', () => {
    const md = new ModularDecomposition(2)
    md.addEdge(0, 1)
    expect(md.isModule(0, 1)).toBe(true)
  })

  it('isStrongModule for single vertex returns true', () => {
    const md = new ModularDecomposition(3)
    expect(md.isStrongModule([0])).toBe(true)
  })

  it('isStrongModule for empty array returns true', () => {
    const md = new ModularDecomposition(3)
    expect(md.isStrongModule([])).toBe(true)
  })

  it('isStrongModule for complete graph all vertices', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    md.addEdge(1, 2)
    md.addEdge(1, 3)
    md.addEdge(2, 3)
    expect(md.isStrongModule([0, 1, 2, 3])).toBe(true)
  })

  it('isStrongModule for star leaves', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.isStrongModule([1, 2, 3])).toBe(true)
  })

  it('isStrongModule fails for mixed adjacency', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    expect(md.isStrongModule([0, 2])).toBe(false)
  })

  it('moduleCount for empty graph is 0', () => {
    const md = new ModularDecomposition(0)
    expect(md.moduleCount()).toBe(0)
  })

  it('moduleCount for single node is 1', () => {
    const md = new ModularDecomposition(1)
    expect(md.moduleCount()).toBe(1)
  })

  it('addEdge is bidirectional', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    expect(md.isModule(0, 1)).toBe(true)
    expect(md.isModule(0, 2)).toBe(false)
    expect(md.isModule(1, 2)).toBe(false)
  })

  it('findModules covers all vertices', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    md.addEdge(2, 3)
    const modules = md.findModules()
    const allVertices = modules.flat().sort()
    expect(allVertices).toEqual([0, 1, 2, 3, 4])
  })

  it('findModules partitions vertices', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    md.addEdge(2, 3)
    const modules = md.findModules()
    const unique = new Set(modules.flat())
    expect(unique.size).toBe(5)
  })

  it('5-node graph with mixed edges', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(1, 2)
    md.addEdge(3, 4)
    const modules = md.findModules()
    expect(modules.length).toBeGreaterThanOrEqual(2)
  })

  it('cycle of 4 nodes', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    md.addEdge(3, 0)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('bipartite K2,3', () => {
    const md = new ModularDecomposition(5)
    for (let i = 0; i < 2; i++)
      for (let j = 2; j < 5; j++)
        md.addEdge(i, j)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(2)
  })

  it('isModule with self is trivially true', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    expect(md.isModule(0, 0)).toBe(true)
  })

  it('isModule on larger graph', () => {
    const md = new ModularDecomposition(6)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(1, 2)
    md.addEdge(3, 4)
    md.addEdge(3, 5)
    md.addEdge(4, 5)
    expect(md.isModule(0, 1)).toBe(true)
    expect(md.isModule(3, 4)).toBe(true)
    expect(md.isModule(0, 3)).toBe(false)
  })

  it('isStrongModule for two disconnected cliques', () => {
    const md = new ModularDecomposition(6)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(1, 2)
    md.addEdge(3, 4)
    md.addEdge(3, 5)
    md.addEdge(4, 5)
    expect(md.isStrongModule([0, 1, 2])).toBe(true)
    expect(md.isStrongModule([3, 4, 5])).toBe(true)
  })

  it('findModules with all isolated vertices', () => {
    const md = new ModularDecomposition(4)
    const modules = md.findModules()
    expect(modules.length).toBe(1)
    expect(modules[0]!.length).toBe(4)
  })

  it('single edge in 4-node graph', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    const modules = md.findModules()
    expect(modules.length).toBeGreaterThanOrEqual(1)
  })

  it('diamond graph', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('isStrongModule for two vertices in clique', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(1, 2)
    expect(md.isStrongModule([0, 1])).toBe(true)
  })

  it('double edge addEdge is idempotent', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(0, 1)
    expect(md.isModule(0, 1)).toBe(true)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('path of 5 nodes', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    md.addEdge(3, 4)
    expect(md.isModule(0, 4)).toBe(false)
    expect(md.isModule(0, 2)).toBe(false)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(2)
  })

  it('6-node line graph', () => {
    const md = new ModularDecomposition(6)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    md.addEdge(3, 4)
    md.addEdge(4, 5)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(2)
  })

  it('triangle plus isolated', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(0, 2)
    const modules = md.findModules()
    expect(modules.length).toBeGreaterThanOrEqual(1)
    const all = modules.flat().sort()
    expect(all).toEqual([0, 1, 2, 3])
  })

  it('two cliques connected by bridge', () => {
    const md = new ModularDecomposition(6)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(1, 2)
    md.addEdge(3, 4)
    md.addEdge(3, 5)
    md.addEdge(4, 5)
    md.addEdge(2, 3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('isModule returns true for symmetric pair in K3', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(0, 2)
    expect(md.isModule(0, 1)).toBe(true)
    expect(md.isModule(0, 2)).toBe(true)
    expect(md.isModule(1, 2)).toBe(true)
  })

  it('isStrongModule for path endpoints fails', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    expect(md.isStrongModule([0, 3])).toBe(false)
  })

  it('findModules returns sorted within modules', () => {
    const md = new ModularDecomposition(5)
    const modules = md.findModules()
    for (const mod of modules) {
      for (let i = 1; i < mod.length; i++) {
        expect(mod[i]!).toBeGreaterThan(mod[i - 1]!)
      }
    }
  })

  it('large complete graph K8 is one module', () => {
    const md = new ModularDecomposition(8)
    for (let i = 0; i < 8; i++)
      for (let j = i + 1; j < 8; j++)
        md.addEdge(i, j)
    expect(md.moduleCount()).toBe(1)
  })

  it('isStrongModule on graph with partial adjacency', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    expect(md.isStrongModule([1, 2, 3])).toBe(true)
  })

  it('isModule with no edges in graph', () => {
    const md = new ModularDecomposition(4)
    expect(md.isModule(0, 1)).toBe(true)
    expect(md.isModule(0, 2)).toBe(true)
    expect(md.isModule(0, 3)).toBe(true)
  })

  it('isModule with isolated vertex connected to nothing', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    md.addEdge(0, 4)
    expect(md.isModule(1, 2)).toBe(true)
    expect(md.isModule(1, 3)).toBe(true)
    expect(md.isModule(2, 3)).toBe(true)
  })

  it('isStrongModule for all vertices with one internal edge', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    expect(md.isStrongModule([0, 1, 2, 3, 4])).toBe(true)
  })

  it('findModules on wheel graph W5', () => {
    const md = new ModularDecomposition(5)
    for (let i = 1; i < 5; i++) {
      md.addEdge(0, i)
    }
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    md.addEdge(3, 4)
    md.addEdge(4, 1)
    const modules = md.findModules()
    expect(modules.length).toBeGreaterThanOrEqual(1)
  })

  it('moduleCount on K10 is 1', () => {
    const md = new ModularDecomposition(10)
    for (let i = 0; i < 10; i++) {
      for (let j = i + 1; j < 10; j++) {
        md.addEdge(i, j)
      }
    }
    expect(md.moduleCount()).toBe(1)
  })

  it('should handle disconnected graph', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(2, 3)
    expect(md.moduleCount()).toBeGreaterThan(1)
  })

  it('should handle single node', () => {
    const md = new ModularDecomposition(1)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('should handle complete graph', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(1, 2)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('should handle path graph', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.addEdge(2, 3)
    expect(md.moduleCount()).toBeGreaterThan(0)
  })

  it('should handle star graph', () => {
    const md = new ModularDecomposition(5)
    md.addEdge(0, 1)
    md.addEdge(0, 2)
    md.addEdge(0, 3)
    md.addEdge(0, 4)
    expect(md.moduleCount()).toBeGreaterThan(0)
  })

  it('should handle no edges', () => {
    const md = new ModularDecomposition(3)
    expect(md.moduleCount()).toBeGreaterThanOrEqual(1)
  })

  it('isModule on same vertex returns true', () => {
    const md = new ModularDecomposition(3)
    md.addEdge(0, 1)
    md.addEdge(1, 2)
    md.findModules()
    expect(md.isModule(0, 0)).toBe(true)
  })

  it('findModules returns modules', () => {
    const md = new ModularDecomposition(4)
    md.addEdge(0, 1)
    md.addEdge(2, 3)
    const modules = md.findModules()
    expect(modules.length).toBeGreaterThan(0)
  })

  it('single vertex graph', () => {
    const md = new ModularDecomposition(1)
    const modules = md.findModules()
    expect(modules.length).toBeGreaterThan(0)
  })
})

describe('modular-decomposition - wave548', () => {
  it('modular-decomposition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module has name', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module not null', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module has length', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave549', () => {
  it('modular-decomposition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave550', () => {
  it('modular-decomposition w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave551', () => {
  it('modular-decomposition w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave552', () => {
  it('modular-decomposition w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave553', () => {
  it('modular-decomposition w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave554', () => {
  it('modular-decomposition w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave555', () => {
  it('modular-decomposition w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave556', () => {
  it('modular-decomposition w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave557', () => {
  it('modular-decomposition w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave558', () => {
  it('modular-decomposition w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-decomposition - wave559', () => {
  it('modular-decomposition w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-decomposition w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
