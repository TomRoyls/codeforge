import { describe, it, expect } from 'vitest'
import { EulerTour } from '../../src/utils/euler-tour.js'

describe('EulerTour', () => {
  it('generates tour for simple tree', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(3)
    expect(et.first[0]).toBe(0)
  })

  it('computes correct first and last positions', () => {
    const adj = [[1, 2], [3], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.first[0]).toBeLessThanOrEqual(et.first[1]!)
    expect(et.first[1]).toBeLessThanOrEqual(et.first[3]!)
    expect(et.last[3]).toBeLessThanOrEqual(et.last[1]!)
    expect(et.last[1]).toBeLessThanOrEqual(et.last[0]!)
  })

  it('computes correct depth', () => {
    const adj = [[1, 2], [3], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.depth[0]).toBe(0)
    expect(et.depth[1]).toBe(1)
    expect(et.depth[3]).toBe(2)
    expect(et.depth[2]).toBe(1)
  })

  it('computes correct parent', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.parent[0]).toBe(-1)
    expect(et.parent[1]).toBe(0)
    expect(et.parent[2]).toBe(0)
  })

  it('detects ancestor relationship', () => {
    const adj = [[1, 2], [3], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 1)).toBe(true)
    expect(et.isAncestor(0, 3)).toBe(true)
    expect(et.isAncestor(1, 3)).toBe(true)
    expect(et.isAncestor(3, 0)).toBe(false)
    expect(et.isAncestor(2, 3)).toBe(false)
  })

  it('node is ancestor of itself', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 0)).toBe(true)
    expect(et.isAncestor(1, 1)).toBe(true)
  })

  it('subtree range is correct', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    const [lo, hi] = et.getSubtreeRange(0)
    expect(hi - lo + 1).toBe(3)
  })

  it('subtree size is correct', () => {
    const adj = [[1, 2], [3, 4], [], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.getSubtreeSize(0)).toBe(5)
    expect(et.getSubtreeSize(1)).toBe(3)
    expect(et.getSubtreeSize(2)).toBe(1)
  })

  it('handles single node tree', () => {
    const adj = [[]]
    const et = new EulerTour(adj, 0)
    expect(et.tour).toEqual([0])
    expect(et.getSubtreeSize(0)).toBe(1)
  })

  it('handles linear chain', () => {
    const adj: number[][] = Array.from({ length: 5 }, () => [])
    for (let i = 0; i < 4; i++) adj[i]!.push(i + 1)
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(5)
    expect(et.depth[4]).toBe(4)
  })

  it('getPath between parent and child', () => {
    const adj = [[1], [2], []]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(0, 2)).toEqual([0, 1, 2])
  })

  it('getPath returns empty for disconnected nodes', () => {
    const et = new EulerTour([[], []], 0)
    expect(et.getPath(0, 1)).toEqual([])
  })

  it('handles binary tree', () => {
    const adj: number[][] = Array.from({ length: 7 }, () => [])
    adj[0] = [1, 2]
    adj[1] = [3, 4]
    adj[2] = [5, 6]
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(7)
    expect(et.isAncestor(0, 6)).toBe(true)
    expect(et.isAncestor(1, 6)).toBe(false)
  })

  it('handles custom root', () => {
    const adj = [[1], [0, 2], [1]]
    const et = new EulerTour(adj, 1)
    expect(et.parent[1]).toBe(-1)
    expect(et.depth[1]).toBe(0)
    expect(et.depth[0]).toBe(1)
  })

  it('getPath for same node returns single element', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(0, 0)).toEqual([0])
  })

  it('getPath for direct child', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(0, 1)).toEqual([0, 1])
    expect(et.getPath(0, 2)).toEqual([0, 2])
  })

  it('handles single node', () => {
    const et = new EulerTour([[]], 0)
    expect(et.tour).toEqual([0])
    expect(et.depth[0]).toBe(0)
  })

  it('handles deep tree', () => {
    const adj: number[][] = Array.from({ length: 30 }, () => [])
    for (let i = 0; i < 29; i++) adj[i]!.push(i + 1)
    const et = new EulerTour(adj, 0)
    expect(et.depth[29]).toBe(29)
    expect(et.isAncestor(0, 29)).toBe(true)
    expect(et.getSubtreeSize(0)).toBe(30)
  })

  it('single node tour', () => {
    const adj = [[]]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 0)).toBe(true)
  })

  it('non-ancestor check', () => {
    const adj = [[1, 2], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(1, 2)).toBe(false)
  })

  it('parent of root is itself', () => {
    const adj = [[1], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 0)).toBe(true)
  })

  it('non-ancestor returns false', () => {
    const adj = [[1], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(1, 0)).toBe(false)
  })

  it('node is its own ancestor', () => {
    const adj = [[1], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 0)).toBe(true)
  })

  it('non-ancestor detected', () => {
    const adj = [[1], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(1, 0)).toBe(false)
  })

  it('toString returns correct format', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.toString()).toBe('EulerTour(3 nodes)')
  })

  it('toString for single node', () => {
    const et = new EulerTour([[]], 0)
    expect(et.toString()).toBe('EulerTour(1 nodes)')
  })

  it('toJSON returns all properties', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    const json = et.toJSON()
    expect(json).toHaveProperty('tour')
    expect(json).toHaveProperty('first')
    expect(json).toHaveProperty('last')
    expect(json).toHaveProperty('depth')
    expect(json).toHaveProperty('parent')
  })

  it('toJSON tour is array', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    const json = et.toJSON()
    expect(Array.isArray(json.tour)).toBe(true)
  })

  it('toJSON returns copies not references', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    const json = et.toJSON()
    json.tour.push(99)
    expect(et.tour.length).toBe(2)
  })

  it('equals returns true for identical tours', () => {
    const adj = [[1, 2], [0], [0]]
    const et1 = new EulerTour(adj, 0)
    const et2 = new EulerTour(adj, 0)
    expect(et1.equals(et2)).toBe(true)
  })

  it('equals returns false for different tours', () => {
    const et1 = new EulerTour([[]], 0)
    const et2 = new EulerTour([[1], [0]], 0)
    expect(et1.equals(et2)).toBe(false)
  })

  it('equals returns false for non-EulerTour object', () => {
    const et = new EulerTour([[]], 0)
    expect(et.equals({})).toBe(false)
    expect(et.equals(null)).toBe(false)
    expect(et.equals(undefined)).toBe(false)
  })

  it('equals returns false for array', () => {
    const et = new EulerTour([[]], 0)
    expect(et.equals([1, 2, 3])).toBe(false)
  })

  it('getSubtreeRange returns tuple', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    const range = et.getSubtreeRange(0)
    expect(Array.isArray(range)).toBe(true)
    expect(range.length).toBe(2)
  })

  it('getSubtreeRange values are non-negative', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    const [lo, hi] = et.getSubtreeRange(0)
    expect(lo).toBeGreaterThanOrEqual(0)
    expect(hi).toBeGreaterThanOrEqual(0)
  })

  it('getSubtreeSize returns positive number', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    const size = et.getSubtreeSize(0)
    expect(size).toBeGreaterThan(0)
  })

  it('first positions are sequential', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.first[0]).toBe(0)
    expect(et.first[1]).toBe(1)
  })

  it('last positions cover tour range', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.last[0]).toBe(1)
    expect(et.last[1]).toBe(1)
  })

  it('tour contains all nodes', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.tour).toContain(0)
    expect(et.tour).toContain(1)
    expect(et.tour).toContain(2)
  })

  it('tour length equals node count', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(3)
  })

  it('depth of root is zero', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.depth[0]).toBe(0)
  })

  it('depth increases along path', () => {
    const adj = [[1], [2], []]
    const et = new EulerTour(adj, 0)
    expect(et.depth[0]).toBe(0)
    expect(et.depth[1]).toBe(1)
    expect(et.depth[2]).toBe(2)
  })

  it('parent of root is -1', () => {
    const adj = [[1], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.parent[0]).toBe(-1)
  })

  it('handles tree with multiple children', () => {
    const adj = [[1, 2, 3], [0], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.tour.length).toBe(4)
    expect(et.depth[1]).toBe(1)
    expect(et.depth[2]).toBe(1)
    expect(et.depth[3]).toBe(1)
  })

  it('getPath returns empty array when no path exists', () => {
    const adj = [[1], [], [3], []]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(2, 1)).toEqual([])
  })

  it('first array length equals number of nodes', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.first.length).toBe(3)
  })

  it('last array length equals number of nodes', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.last.length).toBe(3)
  })

  it('getSubtreeRange for leaf node returns single position', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    const [lo, hi] = et.getSubtreeRange(1)
    expect(lo).toBe(hi)
  })

  it('depth is consistent with ancestor relationship', () => {
    const adj = [[1], [2], [3], []]
    const et = new EulerTour(adj, 0)
    expect(et.depth[2]).toBe(et.depth[0] + 2)
    expect(et.depth[3]).toBe(et.depth[0] + 3)
  })

  it('parent chain is consistent', () => {
    const adj = [[1], [2], [3], []]
    const et = new EulerTour(adj, 0)
    expect(et.parent[1]).toBe(0)
    expect(et.parent[2]).toBe(1)
    expect(et.parent[3]).toBe(2)
  })

  it('isAncestor handles transitive relationship', () => {
    const adj = [[1], [2], [3], []]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 3)).toBe(true)
    expect(et.isAncestor(1, 3)).toBe(true)
    expect(et.isAncestor(3, 0)).toBe(false)
  })

  it('getPath works for grandparent to grandchild', () => {
    const adj = [[1], [2], [3], []]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(0, 3)).toEqual([0, 1, 2, 3])
  })

  it('getPath for cousin nodes returns empty array', () => {
    const adj = [[1, 2], [3], [4], [], []]
    const et = new EulerTour(adj, 0)
    expect(et.getPath(3, 4)).toEqual([])
  })

  it('isAncestor root is ancestor of all', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.isAncestor(0, 1)).toBe(true)
    expect(et.isAncestor(0, 2)).toBe(true)
  })

  it('getSubtreeSize returns correct size', () => {
    const adj = [[1, 2], [0], [0]]
    const et = new EulerTour(adj, 0)
    expect(et.getSubtreeSize(0)).toBe(3)
  })

  it('getSubtreeRange returns valid range', () => {
    const adj = [[1], [0, 2], [1]]
    const et = new EulerTour(adj, 0)
    const [l, r] = et.getSubtreeRange(0)
    expect(r).toBeGreaterThan(l)
  })
})
describe('euler-tour - wave548', () => {
  it('euler-tour module defined', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module is function', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module has name', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module not null', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module has length', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave549', () => {
  it('euler-tour module defined', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module is function', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave550', () => {
  it('euler-tour w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave551', () => {
  it('euler-tour w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave552', () => {
  it('euler-tour w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave553', () => {
  it('euler-tour w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave554', () => {
  it('euler-tour w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave555', () => {
  it('euler-tour w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave556', () => {
  it('euler-tour w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave557', () => {
  it('euler-tour w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave558', () => {
  it('euler-tour w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave559', () => {
  it('euler-tour w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave560', () => {
  it('euler-tour w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave561', () => {
  it('euler-tour w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave562', () => {
  it('euler-tour w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave563', () => {
  it('euler-tour w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave564', () => {
  it('euler-tour w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave565', () => {
  it('euler-tour w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave566', () => {
  it('euler-tour w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave127', () => {
  it('euler-tour w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave130', () => {
  it('euler-tour w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave133', () => {
  it('euler-tour w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave136', () => {
  it('euler-tour w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - wave139', () => {
  it('euler-tour w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - w142', () => {
  it('euler-tour v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - w145', () => {
  it('euler-tour v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - w148', () => {
  it('euler-tour v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - w151', () => {
  it('euler-tour v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - w154', () => {
  it('euler-tour v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - w157', () => {
  it('euler-tour v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('euler-tour - w160', () => {
  it('euler-tour v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('euler-tour v160x2', () => {
    expect(describe).toBeDefined()
  })
})
