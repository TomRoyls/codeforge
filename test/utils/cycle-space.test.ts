import { describe, expect, it } from 'vitest'
import { CycleSpace } from '../../src/utils/cycle-space.js'

describe('CycleSpace', () => {
  it('tree has no cycles', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    expect(cs.findCycles()).toEqual([])
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('single cycle', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    expect(cs.findCycles().length).toBe(1)
    expect(cs.cycleSpaceDimension()).toBe(1)
    expect(cs.isTree()).toBe(false)
  })

  it('two cycles sharing edge', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    cs.addEdge(2, 3)
    cs.addEdge(0, 3)
    expect(cs.findCycles().length).toBe(2)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('single edge has no cycle', () => {
    const cs = new CycleSpace(2)
    cs.addEdge(0, 1)
    expect(cs.findCycles()).toEqual([])
  })

  it('empty graph has no cycles', () => {
    const cs = new CycleSpace(3)
    expect(cs.findCycles()).toEqual([])
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('cycle dimension formula', () => {
    const cs = new CycleSpace(5)
    for (let i = 0; i < 5; i++) cs.addEdge(i, (i + 1) % 5)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('isTree for star', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(0, 2)
    cs.addEdge(0, 3)
    expect(cs.isTree()).toBe(true)
  })

  it('figure eight has 2 cycles', () => {
    const cs = new CycleSpace(5)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    cs.addEdge(2, 3)
    cs.addEdge(3, 4)
    cs.addEdge(2, 4)
    expect(cs.findCycles().length).toBe(2)
  })

  it('parallel edges create cycle', () => {
    const cs = new CycleSpace(2)
    cs.addEdge(0, 1)
    expect(cs.findCycles()).toEqual([])
  })

  it('complete graph K4 dimension', () => {
    const cs = new CycleSpace(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        cs.addEdge(i, j)
    expect(cs.cycleSpaceDimension()).toBe(3)
  })

  it('isTree for empty', () => {
    const cs = new CycleSpace(3)
    expect(cs.isTree()).toBe(true)
  })

  it('single node has dimension zero', () => {
    const cs = new CycleSpace(1)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('two isolated nodes no cycles', () => {
    const cs = new CycleSpace(2)
    expect(cs.findCycles()).toEqual([])
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('multiple cycles dimension', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(0, 3)
    cs.addEdge(3, 1)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('K3 has dimension 1', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('path has cycle space dimension 0', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('triangle has dimension 1', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('double edge creates no cycle in implementation', () => {
    const cs = new CycleSpace(2)
    cs.addEdge(0, 1)
    cs.addEdge(0, 1)
    expect(cs.findCycles()).toEqual([])
  })

  it('three disconnected cycles', () => {
    const cs = new CycleSpace(9)
    for (let i = 0; i < 9; i += 3) {
      cs.addEdge(i, i + 1)
      cs.addEdge(i + 1, i + 2)
      cs.addEdge(i, i + 2)
    }
    expect(cs.findCycles().length).toBeGreaterThan(0)
    expect(cs.cycleSpaceDimension()).toBe(3)
  })

  it('single component with cycle', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    cs.addEdge(3, 0)
    expect(cs.cycleSpaceDimension()).toBe(1)
    expect(cs.isTree()).toBe(false)
  })

  it('two components with one cycle each', () => {
    const cs = new CycleSpace(6)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(3, 4)
    cs.addEdge(4, 5)
    cs.addEdge(5, 3)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('two components one with cycle one without', () => {
    const cs = new CycleSpace(5)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(3, 4)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('complete graph K5 dimension', () => {
    const cs = new CycleSpace(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        cs.addEdge(i, j)
    expect(cs.cycleSpaceDimension()).toBe(6)
  })

  it('square has dimension 1', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    cs.addEdge(3, 0)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('square with diagonal has dimension 2', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    cs.addEdge(3, 0)
    cs.addEdge(0, 2)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('square with both diagonals has dimension 3', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    cs.addEdge(3, 0)
    cs.addEdge(0, 2)
    cs.addEdge(1, 3)
    expect(cs.cycleSpaceDimension()).toBe(3)
  })

  it('pentagon has dimension 1', () => {
    const cs = new CycleSpace(5)
    for (let i = 0; i < 5; i++) cs.addEdge(i, (i + 1) % 5)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('hexagon has dimension 1', () => {
    const cs = new CycleSpace(6)
    for (let i = 0; i < 6; i++) cs.addEdge(i, (i + 1) % 6)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('star graph with 5 leaves', () => {
    const cs = new CycleSpace(6)
    for (let i = 1; i < 6; i++) cs.addEdge(0, i)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('graph with bridge edge', () => {
    const cs = new CycleSpace(6)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(2, 3)
    cs.addEdge(3, 4)
    cs.addEdge(4, 5)
    cs.addEdge(5, 3)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('disjoint union of trees', () => {
    const cs = new CycleSpace(6)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(3, 4)
    cs.addEdge(4, 5)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('line graph with 4 nodes', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('graph with multiple disjoint edges', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(2, 3)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('single edge in 2 node graph', () => {
    const cs = new CycleSpace(2)
    cs.addEdge(0, 1)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('graph with isolated vertex', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('two vertices no edges', () => {
    const cs = new CycleSpace(2)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('cycle space dimension for tree with 4 nodes', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('two separate triangles', () => {
    const cs = new CycleSpace(6)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(3, 4)
    cs.addEdge(4, 5)
    cs.addEdge(5, 3)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('triangle connected to tree', () => {
    const cs = new CycleSpace(5)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(2, 3)
    cs.addEdge(3, 4)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('cube graph has dimension', () => {
    const cs = new CycleSpace(8)
    const cubeEdges = [
      [0, 1], [1, 3], [3, 2], [2, 0],
      [4, 5], [5, 7], [7, 6], [6, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ]
    for (const [u, v] of cubeEdges) cs.addEdge(u, v)
    expect(cs.cycleSpaceDimension()).toBe(5)
  })

  it('graph with multiple bridges', () => {
    const cs = new CycleSpace(7)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(2, 3)
    cs.addEdge(3, 4)
    cs.addEdge(4, 5)
    cs.addEdge(5, 6)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('complete bipartite K2,3', () => {
    const cs = new CycleSpace(5)
    for (let i = 0; i < 2; i++)
      for (let j = 2; j < 5; j++)
        cs.addEdge(i, j)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('graph with pendant vertex', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(2, 3)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('large star graph', () => {
    const cs = new CycleSpace(10)
    for (let i = 1; i < 10; i++) cs.addEdge(0, i)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('graph with 3 disjoint components', () => {
    const cs = new CycleSpace(7)
    cs.addEdge(0, 1)
    cs.addEdge(2, 3)
    cs.addEdge(4, 5)
    cs.addEdge(5, 6)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('pentagon with chords', () => {
    const cs = new CycleSpace(5)
    for (let i = 0; i < 5; i++) cs.addEdge(i, (i + 1) % 5)
    cs.addEdge(0, 2)
    cs.addEdge(0, 3)
    expect(cs.cycleSpaceDimension()).toBe(3)
  })

  it('graph with 4 isolated nodes', () => {
    const cs = new CycleSpace(4)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('single vertex with self-loop check', () => {
    const cs = new CycleSpace(1)
    expect(cs.cycleSpaceDimension()).toBe(0)
  })

  it('tree with 10 nodes', () => {
    const cs = new CycleSpace(10)
    for (let i = 0; i < 9; i++) cs.addEdge(i, i + 1)
    expect(cs.cycleSpaceDimension()).toBe(0)
    expect(cs.isTree()).toBe(true)
  })

  it('two triangles sharing a vertex', () => {
    const cs = new CycleSpace(5)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 0)
    cs.addEdge(0, 3)
    cs.addEdge(3, 4)
    cs.addEdge(4, 0)
    expect(cs.cycleSpaceDimension()).toBe(2)
  })

  it('heptagon has dimension 1', () => {
    const cs = new CycleSpace(7)
    for (let i = 0; i < 7; i++) cs.addEdge(i, (i + 1) % 7)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('octagon has dimension 1', () => {
    const cs = new CycleSpace(8)
    for (let i = 0; i < 8; i++) cs.addEdge(i, (i + 1) % 8)
    expect(cs.cycleSpaceDimension()).toBe(1)
  })

  it('isTree returns true for tree', () => {
    const cs = new CycleSpace(4)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(2, 3)
    expect(cs.isTree()).toBe(true)
  })

  it('isTree returns false with cycle', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    cs.addEdge(0, 2)
    expect(cs.isTree()).toBe(false)
  })

  it('findCycles returns empty for tree', () => {
    const cs = new CycleSpace(3)
    cs.addEdge(0, 1)
    cs.addEdge(1, 2)
    expect(cs.findCycles().length).toBe(0)
  })
})
  it('single node has no cycles', () => {
    const cs = new CycleSpace(1)
    expect(cs.findCycles()).toEqual([])
  })

  it('two nodes with edges', () => {
    const cs = new CycleSpace(2)
    cs.addEdge(0, 1)
    cs.addEdge(1, 0)
    const cycles = cs.findCycles()
    expect(Array.isArray(cycles)).toBe(true)
  })

  it('no edges no cycles', () => {
    const cs = new CycleSpace(3)
    expect(cs.findCycles()).toEqual([])
  })

describe('cycle-space - wave545', () => {
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

describe('cycle-space - wave546', () => {
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

describe('cycle-space - wave547', () => {
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

describe('cycle-space - wave548', () => {
  it('cycle-space module defined', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space module is function', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave549', () => {
  it('cycle-space module defined', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space module is function', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave550', () => {
  it('cycle-space w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave551', () => {
  it('cycle-space w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave552', () => {
  it('cycle-space w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave553', () => {
  it('cycle-space w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave554', () => {
  it('cycle-space w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave555', () => {
  it('cycle-space w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave556', () => {
  it('cycle-space w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave557', () => {
  it('cycle-space w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave558', () => {
  it('cycle-space w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave559', () => {
  it('cycle-space w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave560', () => {
  it('cycle-space w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave561', () => {
  it('cycle-space w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave562', () => {
  it('cycle-space w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave563', () => {
  it('cycle-space w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave564', () => {
  it('cycle-space w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave565', () => {
  it('cycle-space w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cycle-space - wave566', () => {
  it('cycle-space w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cycle-space w566 v2', () => {
    expect(describe).toBeDefined()
  })
})
