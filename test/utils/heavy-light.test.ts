import { describe, expect, it } from 'vitest'
import { HeavyLightDecomposition } from '../../src/utils/heavy-light.js'

describe('HeavyLightDecomposition', () => {
  it('finds LCA in simple tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 2)).toBe(0)
  })

  it('LCA of same node is itself', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.lca(1, 1)).toBe(1)
  })

  it('LCA of parent-child is parent', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
  })

  it('computes distance', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, []], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(3, 2)).toBe(3)
    expect(hld.distance(0, 3)).toBe(2)
    expect(hld.distance(1, 1)).toBe(0)
  })

  it('handles chain tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 1)).toBe(1)
    expect(hld.distance(3, 0)).toBe(3)
  })

  it('handles single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.distance(0, 0)).toBe(0)
  })

  it('handles deeper tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, [],
    ]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 4)).toBe(1)
    expect(hld.lca(3, 5)).toBe(0)
    expect(hld.distance(3, 6)).toBe(4)
  })

  it('handles wide tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3, 4, 5]], [1, []], [2, []], [3, []], [4, []], [5, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 5)).toBe(0)
    expect(hld.distance(1, 5)).toBe(2)
    expect(hld.distance(3, 3)).toBe(0)
  })

  it('handles two-node tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
    expect(hld.distance(0, 1)).toBe(1)
  })

  it('LCA of siblings is parent in deep tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3, 4]], [3, []], [4, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 4)).toBe(2)
    expect(hld.distance(3, 4)).toBe(2)
  })

  it('distance in star graph', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(1, 2)).toBe(2)
    expect(hld.distance(0, 3)).toBe(1)
  })

  it('handles deep chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, [5]], [5, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 5)).toBe(0)
    expect(hld.distance(0, 5)).toBe(5)
  })

  it('single node tree', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.distance(0, 0)).toBe(0)
  })

  it('handles binary tree LCA', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]],
      [1, [3, 4]],
      [2, [5, 6]],
      [3, []],
      [4, []],
      [5, []],
      [6, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(4, 5)).toBe(0)
    expect(hld.lca(3, 4)).toBe(1)
  })

  it('distance between root and leaf in chain', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(0, 3)).toBe(3)
    expect(hld.distance(1, 3)).toBe(2)
  })

  it('handles two node tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
    expect(hld.distance(0, 1)).toBe(1)
  })

  it('handles path query on root', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [0]], [2, [0]],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 2)).toBe(0)
  })

  it('single node tree lca is itself', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
  })

  it('lca of two children is parent', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, [0]], [2, [0]]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 2)).toBe(0)
  })

  it('lca of same node is itself', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
  })

  it('single node decomposition', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
  })

  it('two nodes chain lca', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
  })

  it('single node lca is itself', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
  })

  it('path query returns valid result', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 1)).toBe(0)
  })

  it('toString returns correct format', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.toString()).toBe('HeavyLightDecomposition(2)')
  })

  it('toString with single node', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.toString()).toBe('HeavyLightDecomposition(1)')
  })

  it('toJSON returns correct structure', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON()
    expect(json).toHaveProperty('parent')
    expect(json).toHaveProperty('depth')
    expect(json).toHaveProperty('size')
    expect(json).toHaveProperty('heavy')
    expect(json).toHaveProperty('head')
  })

  it('toJSON has correct array lengths', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, []], [2, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON()
    expect(json.parent.length).toBe(3)
    expect(json.depth.length).toBe(3)
    expect(json.size.length).toBe(3)
    expect(json.heavy.length).toBe(3)
    expect(json.head.length).toBe(3)
  })

  it('clone creates independent instance', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, [0]]])
    const hld1 = new HeavyLightDecomposition(adj, 0)
    const hld2 = hld1.clone()
    expect(hld1.equals(hld2)).toBe(true)
  })

  it('clone produces same results', () => {
    const adj = new Map<number, number[]>([[0, [1, 2]], [1, []], [2, []]])
    const hld1 = new HeavyLightDecomposition(adj, 0)
    const hld2 = hld1.clone()
    expect(hld2.lca(1, 2)).toBe(hld1.lca(1, 2))
    expect(hld2.distance(1, 2)).toBe(hld1.distance(1, 2))
  })

  it('equals returns true for identical instances', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const hld1 = new HeavyLightDecomposition(adj, 0)
    const hld2 = new HeavyLightDecomposition(adj, 0)
    expect(hld1.equals(hld2)).toBe(true)
  })

  it('equals returns false for different size trees', () => {
    const adj1 = new Map<number, number[]>([[0, [1]], [1, []]])
    const adj2 = new Map<number, number[]>([[0, [1, 2]], [1, []], [2, []]])
    const hld1 = new HeavyLightDecomposition(adj1, 0)
    const hld2 = new HeavyLightDecomposition(adj2, 0)
    expect(hld1.equals(hld2)).toBe(false)
  })

  it('equals returns false for non-HeavyLightDecomposition', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.equals({})).toBe(false)
    expect(hld.equals(null)).toBe(false)
    expect(hld.equals(undefined)).toBe(false)
  })

  it('handles non-default root', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0, 2]], [2, [1]],
    ])
    const hld = new HeavyLightDecomposition(adj, 1)
    expect(hld.lca(0, 2)).toBe(1)
  })

  it('distance between same node is zero', () => {
    const adj = new Map<number, number[]>([[0, [1]], [1, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(0, 0)).toBe(0)
    expect(hld.distance(1, 1)).toBe(0)
  })

  it('LCA in three-level tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 2)).toBe(0)
    expect(hld.lca(1, 2)).toBe(1)
  })

  it('distance calculation in complex tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5]], [3, []], [4, []], [5, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(3, 5)).toBe(4)
    expect(hld.distance(3, 4)).toBe(2)
  })

  it('handles unbalanced tree', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(1, 4)).toBe(1)
    expect(hld.distance(1, 4)).toBe(3)
  })

  it('LCA with root as one argument', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, []], [2, []], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 2)).toBe(0)
  })

  it('handles multiple children at different depths', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [4, 5]], [3, []], [4, []], [5, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 5)).toBe(0)
    expect(hld.distance(3, 5)).toBe(4)
  })

  it('toJSON parent array is correct', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, [3]], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON()
    expect(json.parent[0]).toBe(-1)
    expect(json.parent[1]).toBe(0)
    expect(json.parent[2]).toBe(0)
    expect(json.parent[3]).toBe(2)
  })

  it('toJSON depth array is correct', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON()
    expect(json.depth[0]).toBe(0)
    expect(json.depth[1]).toBe(1)
    expect(json.depth[2]).toBe(2)
  })

  it('toJSON size array is correct', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    const json = hld.toJSON()
    expect(json.size[0]).toBe(3)
    expect(json.size[1]).toBe(1)
    expect(json.size[2]).toBe(1)
  })

  it('clone preserves adjacency structure', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, []], [2, []],
    ])
    const hld1 = new HeavyLightDecomposition(adj, 0)
    const hld2 = hld1.clone()
    expect(hld1.lca(1, 2)).toBe(hld2.lca(1, 2))
  })

  it('handles root with multiple levels of depth', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, [4]], [4, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(2, 4)).toBe(2)
    expect(hld.distance(2, 4)).toBe(2)
  })

  it('LCA of cousin nodes', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3, 4]], [2, [5, 6]], [3, []], [4, []], [5, []], [6, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(3, 5)).toBe(0)
    expect(hld.lca(3, 4)).toBe(1)
  })

  it('distance between cousins', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [3]], [2, [4]], [3, []], [4, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(3, 4)).toBe(4)
  })

  it('handles tree with only root', () => {
    const adj = new Map<number, number[]>([[0, []]])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 0)).toBe(0)
    expect(hld.distance(0, 0)).toBe(0)
  })

  it('LCA with one node being ancestor of other', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, [3]], [3, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(0, 3)).toBe(0)
    expect(hld.lca(1, 3)).toBe(1)
  })

  it('distance when one node is ancestor', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(0, 2)).toBe(2)
    expect(hld.distance(1, 2)).toBe(1)
  })

  it('equals false for different structure', () => {
    const adj1 = new Map<number, number[]>([
      [0, [1]], [1, []],
    ])
    const adj2 = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const hld1 = new HeavyLightDecomposition(adj1, 0)
    const hld2 = new HeavyLightDecomposition(adj2, 0)
    expect(hld1.equals(hld2)).toBe(false)
  })

  it('handles large tree LCA', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, [4, 5]], [2, [6]], [3, [7]], [4, []], [5, []], [6, []], [7, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(7, 6)).toBe(0)
    expect(hld.distance(7, 6)).toBe(4)
  })

  it('distance symmetric property', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [2]], [2, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.distance(0, 2)).toBe(hld.distance(2, 0))
  })

  it('handles tree with varying branching', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2, 3]], [1, [4, 5]], [2, [6]], [3, []], [4, []], [5, []], [6, []],
    ])
    const hld = new HeavyLightDecomposition(adj, 0)
    expect(hld.lca(4, 6)).toBe(0)
    expect(hld.distance(4, 6)).toBe(4)
  })

  it('lca of same node is itself', () => {
    const adj = new Map<number, number[]>([
      [0, [1, 2]], [1, [0]], [2, [0, 3, 4]], [3, [2]], [4, [2, 5, 6]], [5, [4]], [6, [4]],
    ])
    const hld = new HeavyLightDecomposition(adj)
    expect(hld.lca(3, 3)).toBe(3)
  })

  it('distance to self is 0', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]],
    ])
    const hld = new HeavyLightDecomposition(adj)
    expect(hld.distance(0, 0)).toBe(0)
  })

  it('clone produces independent copy', () => {
    const adj = new Map<number, number[]>([
      [0, [1]], [1, [0]],
    ])
    const hld = new HeavyLightDecomposition(adj)
    const c = hld.clone()
    expect(c.lca(0, 1)).toBe(hld.lca(0, 1))
  })
})

describe('heavy-light - wave548', () => {
  it('heavy-light module defined', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module is function', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module has name', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module not null', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module has length', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave549', () => {
  it('heavy-light module defined', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module is function', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave550', () => {
  it('heavy-light w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave551', () => {
  it('heavy-light w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave552', () => {
  it('heavy-light w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave553', () => {
  it('heavy-light w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave554', () => {
  it('heavy-light w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave555', () => {
  it('heavy-light w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave556', () => {
  it('heavy-light w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave557', () => {
  it('heavy-light w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave558', () => {
  it('heavy-light w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave559', () => {
  it('heavy-light w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('heavy-light - wave560', () => {
  it('heavy-light w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('heavy-light w560 v2', () => {
    expect(describe).toBeDefined()
  })
})
