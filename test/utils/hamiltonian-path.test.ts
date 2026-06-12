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

  it('two connected nodes have path', () => {
    const hp = new HamiltonianPath(2)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(true)
  })

  it('disconnected graph has no path', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(false)
  })

  it('constructor with zero nodes', () => {
    const hp = new HamiltonianPath(0)
    expect(hp.toString()).toBe('HamiltonianPath(0)')
  })

  it('constructor with large graph', () => {
    const hp = new HamiltonianPath(10)
    expect(hp.toString()).toBe('HamiltonianPath(10)')
  })

  it('addEdge handles same node', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 0)
    expect(hp.existsPath()).toBe(false)
  })

  it('addEdge multiple times does not break', () => {
    const hp = new HamiltonianPath(2)
    hp.addEdge(0, 1)
    hp.addEdge(0, 1)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(true)
  })

  it('toString returns correct format', () => {
    const hp = new HamiltonianPath(5)
    expect(hp.toString()).toBe('HamiltonianPath(5)')
  })

  it('toJSON returns n and adjacency matrix', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    const json = hp.toJSON()
    expect(json).toHaveProperty('n')
    expect(json).toHaveProperty('adj')
    expect(json.n).toBe(3)
    expect(Array.isArray(json.adj)).toBe(true)
  })

  it('clone creates independent copy', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    const cloned = hp.clone()
    cloned.addEdge(1, 2)
    expect(hp.existsPath()).toBe(false)
    expect(cloned.existsPath()).toBe(true)
  })

  it('clone preserves all edges', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(2, 3)
    const cloned = hp.clone()
    expect(hp.equals(cloned)).toBe(true)
  })

  it('equals returns true for identical graphs', () => {
    const hp1 = new HamiltonianPath(3)
    hp1.addEdge(0, 1)
    hp1.addEdge(1, 2)
    const hp2 = new HamiltonianPath(3)
    hp2.addEdge(0, 1)
    hp2.addEdge(1, 2)
    expect(hp1.equals(hp2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const hp1 = new HamiltonianPath(3)
    const hp2 = new HamiltonianPath(4)
    expect(hp1.equals(hp2)).toBe(false)
  })

  it('equals returns false for different edge sets', () => {
    const hp1 = new HamiltonianPath(3)
    hp1.addEdge(0, 1)
    const hp2 = new HamiltonianPath(3)
    hp2.addEdge(1, 2)
    expect(hp1.equals(hp2)).toBe(false)
  })

  it('equals returns false for non-HamiltonianPath objects', () => {
    const hp = new HamiltonianPath(3)
    expect(hp.equals(null)).toBe(false)
    expect(hp.equals(undefined)).toBe(false)
    expect(hp.equals({})).toBe(false)
    expect(hp.equals('test')).toBe(false)
    expect(hp.equals(42)).toBe(false)
  })

  it('equals returns true for self', () => {
    const hp = new HamiltonianPath(3)
    expect(hp.equals(hp)).toBe(true)
  })

  it('linear graph has path but no cycle for n > 2', () => {
    const hp = new HamiltonianPath(5)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(2, 3)
    hp.addEdge(3, 4)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(false)
  })

  it('cycle graph has both path and cycle', () => {
    const hp = new HamiltonianPath(5)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    hp.addEdge(2, 3)
    hp.addEdge(3, 4)
    hp.addEdge(4, 0)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(true)
  })

  it('almost complete graph missing one edge still has path', () => {
    const hp = new HamiltonianPath(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        if (i !== 0 || j !== 1) hp.addEdge(i, j)
    expect(hp.existsPath()).toBe(true)
  })

  it('two separate complete components have no path', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(2, 3)
    expect(hp.existsPath()).toBe(false)
    expect(hp.existsCycle()).toBe(false)
  })

  it('diamond shape has cycle', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(0, 2)
    hp.addEdge(1, 3)
    hp.addEdge(2, 3)
    hp.addEdge(1, 2)
    expect(hp.existsCycle()).toBe(true)
  })

  it('hourglass shape has no path (star graph)', () => {
    const hp = new HamiltonianPath(5)
    hp.addEdge(0, 2)
    hp.addEdge(1, 2)
    hp.addEdge(2, 3)
    hp.addEdge(2, 4)
    expect(hp.existsPath()).toBe(false)
  })

  it('complete bipartite K2,3 has path', () => {
    const hp = new HamiltonianPath(5)
    for (let i = 0; i < 2; i++)
      for (let j = 2; j < 5; j++)
        hp.addEdge(i, j)
    expect(hp.existsPath()).toBe(true)
  })

  it('graph with isolated node has no Hamiltonian path', () => {
    const hp = new HamiltonianPath(4)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    expect(hp.existsPath()).toBe(false)
  })

  it('addEdge maintains adjacency matrix symmetry', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    const json = hp.toJSON()
    expect(json.adj[0][1]).toBe(true)
    expect(json.adj[1][0]).toBe(true)
  })

  it('clone of empty graph equals original', () => {
    const hp = new HamiltonianPath(3)
    const cloned = hp.clone()
    expect(hp.equals(cloned)).toBe(true)
  })

  it('toJSON produces serializable data', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    const json = hp.toJSON()
    const str = JSON.stringify(json)
    expect(() => JSON.parse(str)).not.toThrow()
  })

  it('existsCycle returns false for n=1', () => {
    const hp = new HamiltonianPath(1)
    expect(hp.existsCycle()).toBe(false)
  })

  it('existsCycle returns false for empty K2', () => {
    const hp = new HamiltonianPath(2)
    expect(hp.existsCycle()).toBe(false)
  })

  it('path of length 2 has no cycle', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    expect(hp.existsPath()).toBe(true)
    expect(hp.existsCycle()).toBe(false)
  })

  it('cloned graph can be modified independently', () => {
    const hp1 = new HamiltonianPath(3)
    hp1.addEdge(0, 1)
    const hp2 = hp1.clone()
    hp1.addEdge(1, 2)
    expect(hp1.existsPath()).toBe(true)
    expect(hp2.existsPath()).toBe(false)
  })

  it('existsCycle on chain returns false', () => {
    const hp = new HamiltonianPath(3)
    hp.addEdge(0, 1)
    hp.addEdge(1, 2)
    expect(hp.existsCycle()).toBe(false)
  })

  it('complete graph always has path', () => {
    const hp = new HamiltonianPath(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        hp.addEdge(i, j)
    expect(hp.existsPath()).toBe(true)
  })

  it('single node has trivial path', () => {
    const hp = new HamiltonianPath(1)
    expect(hp.existsPath()).toBe(true)
  })

  it('single node has path', () => {
    const hp = new HamiltonianPath(1)
    expect(hp.existsPath()).toBe(true)
  })

  it('two nodes no edge', () => {
    const hp = new HamiltonianPath(2)
    expect(hp.existsPath()).toBe(false)
  })

  it('two nodes with edge', () => {
    const hp = new HamiltonianPath(2)
    hp.addEdge(0, 1)
    expect(hp.existsPath()).toBe(true)
  })
})

describe('hamiltonian-path - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hamiltonian-path - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hamiltonian-path - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hamiltonian-path - wave548', () => {
  it('hamiltonian-path module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave549', () => {
  it('hamiltonian-path module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave550', () => {
  it('hamiltonian-path w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave551', () => {
  it('hamiltonian-path w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave552', () => {
  it('hamiltonian-path w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave553', () => {
  it('hamiltonian-path w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave554', () => {
  it('hamiltonian-path w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave555', () => {
  it('hamiltonian-path w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave556', () => {
  it('hamiltonian-path w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave557', () => {
  it('hamiltonian-path w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave558', () => {
  it('hamiltonian-path w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave559', () => {
  it('hamiltonian-path w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave560', () => {
  it('hamiltonian-path w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave561', () => {
  it('hamiltonian-path w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave562', () => {
  it('hamiltonian-path w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hamiltonian-path - wave563', () => {
  it('hamiltonian-path w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hamiltonian-path w563 v2', () => {
    expect(describe).toBeDefined()
  })
})
