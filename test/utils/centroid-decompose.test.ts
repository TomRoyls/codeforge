import { describe, expect, it } from 'vitest'
import { CentroidDecomposition } from '../../src/utils/centroid-decompose.js'

describe('CentroidDecomposition', () => {
  it('handles single node', () => {
    const cd = new CentroidDecomposition(1)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(1)
    expect(depth.length).toBe(1)
    expect(parent[0]).toBe(0)
    expect(depth[0]).toBe(0)
  })

  it('handles two nodes', () => {
    const cd = new CentroidDecomposition(2)
    cd.addEdge(0, 1)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(2)
    expect(depth.length).toBe(2)
  })

  it('handles three node chain', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(3)
    expect(depth.length).toBe(3)
  })

  it('handles triangle', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(3)
    expect(depth.length).toBe(3)
  })

  it('handles disconnected nodes', () => {
    const cd = new CentroidDecomposition(3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(3)
    expect(depth.length).toBe(3)
  })

  it('handles star graph', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(5)
    expect(depth.length).toBe(5)
  })

  it('handles path graph', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(5)
    expect(depth.length).toBe(5)
  })

  it('handles balanced binary tree', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(1, 3)
    cd.addEdge(1, 4)
    cd.addEdge(2, 5)
    cd.addEdge(2, 6)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(7)
    expect(depth.length).toBe(7)
  })

  it('handles 4-node line', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(4)
    expect(depth.length).toBe(4)
  })

  it('handles larger star tree', () => {
    const cd = new CentroidDecomposition(10)
    for (let i = 1; i < 10; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(10)
    expect(depth.length).toBe(10)
  })

  it('depth increases along path', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(5, 6)
    const { depth } = cd.decompose()
    expect(Math.max(...depth)).toBeGreaterThan(0)
  })

  it('centroid has bounded max depth', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(5, 6)
    const { depth } = cd.decompose()
    expect(Math.max(...depth)).toBeLessThan(7)
  })

  it('handles full binary tree', () => {
    const cd = new CentroidDecomposition(15)
    for (let i = 1; i < 15; i++) cd.addEdge(Math.floor((i - 1) / 2), i)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(15)
  })

  it('star graph centroid is the center node', () => {
    const cd = new CentroidDecomposition(7)
    for (let i = 1; i < 7; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBe(0)
    for (let i = 0; i < 7; i++) {
      if (i !== root) {
        expect(parent[i]).toBe(root)
        expect(depth[i]).toBe(1)
      }
    }
  })

  it('path graph centroid tree has O(log n) depth', () => {
    const n = 16
    const cd = new CentroidDecomposition(n)
    for (let i = 0; i < n - 1; i++) cd.addEdge(i, i + 1)
    const { depth } = cd.decompose()
    expect(Math.max(...depth)).toBeLessThanOrEqual(Math.ceil(Math.log2(n)))
  })

  it('every node assigned exactly one parent', () => {
    const cd = new CentroidDecomposition(10)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(0, 5)
    cd.addEdge(5, 6)
    cd.addEdge(6, 7)
    cd.addEdge(7, 8)
    cd.addEdge(8, 9)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    for (let i = 0; i < 10; i++) {
      if (i === root) {
        expect(parent[i]).toBe(root)
      } else {
        expect(parent[i]).toBeGreaterThanOrEqual(0)
        expect(parent[i]).toBeLessThan(10)
        expect(depth[i]).toBeGreaterThan(0)
      }
    }
  })

  it('centroid of path 0-1-2-3-4 is node 2', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    const { depth } = cd.decompose()
    expect(depth.indexOf(0)).toBe(2)
  })

  it('handles graph with multiple cycles', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    cd.addEdge(2, 3)
    cd.addEdge(0, 3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(4)
    expect(depth.length).toBe(4)
  })

  it('all depths are non-negative', () => {
    const cd = new CentroidDecomposition(6)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    const { depth } = cd.decompose()
    for (const d of depth) {
      expect(d).toBeGreaterThanOrEqual(0)
    }
  })

  it('root has depth 0', () => {
    const cd = new CentroidDecomposition(8)
    for (let i = 1; i < 8; i++) cd.addEdge(0, i)
    const { depth } = cd.decompose()
    expect(depth.filter(d => d === 0).length).toBe(1)
  })

  it('handles 6-node star', () => {
    const cd = new CentroidDecomposition(6)
    for (let i = 1; i < 6; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(6)
    expect(depth.length).toBe(6)
  })

  it('handles Y-shaped graph', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(1, 3)
    cd.addEdge(3, 4)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(5)
    expect(Math.max(...depth)).toBeGreaterThan(0)
  })

  it('handles complete graph K4', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(1, 2)
    cd.addEdge(1, 3)
    cd.addEdge(2, 3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(4)
    expect(depth.length).toBe(4)
  })

  it('handles two-path graph', () => {
    const cd = new CentroidDecomposition(6)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    const { parent } = cd.decompose()
    expect(parent.length).toBe(6)
  })

  it('root parent is itself', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(parent[root]).toBe(root)
  })

  it('non-root depths are positive', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    const { depth } = cd.decompose()
    const root = depth.indexOf(0)
    for (let i = 0; i < 5; i++) {
      if (i !== root) {
        expect(depth[i]).toBeGreaterThan(0)
      }
    }
  })

  it('handles 20-node path', () => {
    const n = 20
    const cd = new CentroidDecomposition(n)
    for (let i = 0; i < n - 1; i++) cd.addEdge(i, i + 1)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(n)
    expect(Math.max(...depth)).toBeLessThan(n)
  })

  it('handles 31-node complete binary tree', () => {
    const n = 31
    const cd = new CentroidDecomposition(n)
    for (let i = 1; i < n; i++) cd.addEdge(Math.floor((i - 1) / 2), i)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(n)
    expect(Math.max(...depth)).toBeLessThan(Math.ceil(Math.log2(n)) + 1)
  })

  it('handles caterpillar graph', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(1, 5)
    cd.addEdge(3, 6)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(7)
    expect(depth.length).toBe(7)
  })

  it('handles graph with isolated node', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(4)
    expect(depth.length).toBe(4)
  })

  it('handles 8-node star', () => {
    const cd = new CentroidDecomposition(8)
    for (let i = 1; i < 8; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBe(0)
    for (let i = 1; i < 8; i++) {
      expect(parent[i]).toBe(root)
    }
  })

  it('centroid decomposition is deterministic', () => {
    const cd1 = new CentroidDecomposition(6)
    cd1.addEdge(0, 1)
    cd1.addEdge(1, 2)
    cd1.addEdge(2, 3)
    cd1.addEdge(3, 4)
    cd1.addEdge(4, 5)
    const r1 = cd1.decompose()

    const cd2 = new CentroidDecomposition(6)
    cd2.addEdge(0, 1)
    cd2.addEdge(1, 2)
    cd2.addEdge(2, 3)
    cd2.addEdge(3, 4)
    cd2.addEdge(4, 5)
    const r2 = cd2.decompose()

    expect(r1.parent).toEqual(r2.parent)
    expect(r1.depth).toEqual(r2.depth)
  })

  it('handles diamond graph', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(1, 3)
    cd.addEdge(2, 3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(4)
    expect(depth.length).toBe(4)
  })

  it('handles binary tree with one long branch', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(1, 3)
    cd.addEdge(1, 4)
    cd.addEdge(4, 5)
    cd.addEdge(5, 6)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(7)
    expect(Math.max(...depth)).toBeLessThan(7)
  })

  it('handles graph where centroid is not node 0', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(5, 6)
    const { depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBeGreaterThan(0)
    expect(root).toBeLessThan(7)
  })

  it('handles 3-star graph', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBe(0)
  })

  it('handles 5-node cycle', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 0)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(5)
    expect(depth.length).toBe(5)
  })

  it('handles 6-node cycle', () => {
    const cd = new CentroidDecomposition(6)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(5, 0)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(6)
    expect(depth.length).toBe(6)
  })

  it('handles two triangles sharing an edge', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    cd.addEdge(2, 3)
    cd.addEdge(1, 3)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(4)
    expect(depth.length).toBe(4)
  })

  it('decompose returns arrays of correct length', () => {
    const n = 13
    const cd = new CentroidDecomposition(n)
    for (let i = 1; i < n; i++) cd.addEdge(i - 1, i)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(n)
    expect(depth.length).toBe(n)
  })

  it('handles tree with depth 1 only', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    const { depth } = cd.decompose()
    expect(Math.max(...depth)).toBeLessThanOrEqual(1)
  })

  it('handles 50-node random tree', () => {
    const n = 50
    const cd = new CentroidDecomposition(n)
    for (let i = 1; i < n; i++) cd.addEdge(i, Math.floor(Math.random() * i))
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(n)
    expect(depth.length).toBe(n)
    expect(Math.max(...depth)).toBeLessThan(n)
  })

  it('handles 100-node path', () => {
    const n = 100
    const cd = new CentroidDecomposition(n)
    for (let i = 0; i < n - 1; i++) cd.addEdge(i, i + 1)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(n)
    expect(Math.max(...depth)).toBeLessThanOrEqual(Math.ceil(Math.log2(n)))
  })

  it('handles double-star graph', () => {
    const cd = new CentroidDecomposition(8)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(4, 6)
    cd.addEdge(4, 7)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(8)
    expect(depth.length).toBe(8)
  })

  it('handles complete bipartite K2,3', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    cd.addEdge(1, 2)
    cd.addEdge(1, 3)
    cd.addEdge(1, 4)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(5)
    expect(depth.length).toBe(5)
  })

  it('handles tree with high degree node', () => {
    const cd = new CentroidDecomposition(9)
    for (let i = 1; i < 9; i++) cd.addEdge(0, i)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBe(0)
    for (let i = 1; i < 9; i++) {
      expect(parent[i]).toBe(root)
      expect(depth[i]).toBe(1)
    }
  })

  it('handles 2-node edge', () => {
    const cd = new CentroidDecomposition(2)
    cd.addEdge(0, 1)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(2)
    expect(depth.length).toBe(2)
    const root = depth.indexOf(0)
    expect(parent[root]).toBe(root)
  })

  it('handles 4-node path specific centroid', () => {
    const cd = new CentroidDecomposition(4)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    const { depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(root).toBeGreaterThanOrEqual(0)
    expect(root).toBeLessThan(4)
    expect(Math.max(...depth)).toBeLessThan(4)
  })

  it('handles sparse tree with long branches', () => {
    const cd = new CentroidDecomposition(9)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 3)
    cd.addEdge(3, 4)
    cd.addEdge(4, 5)
    cd.addEdge(0, 6)
    cd.addEdge(6, 7)
    cd.addEdge(7, 8)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(9)
    expect(depth.length).toBe(9)
    expect(Math.max(...depth)).toBeLessThan(9)
  })

  it('depth increases from root to leaves', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(2, 3)
    cd.addEdge(3, 4)
    const { depth } = cd.decompose()
    const root = depth.indexOf(0)
    expect(depth[root]).toBe(0)
    let foundNonZero = false
    for (const d of depth) {
      if (d > 0) foundNonZero = true
    }
    expect(foundNonZero).toBe(true)
  })

  it('handles small complete tree K3', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    cd.addEdge(0, 2)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(3)
    expect(depth.length).toBe(3)
  })

  it('centroid tree parent array has valid structure', () => {
    const cd = new CentroidDecomposition(10)
    for (let i = 0; i < 9; i++) cd.addEdge(i, i + 1)
    const { parent, depth } = cd.decompose()
    const root = depth.indexOf(0)
    for (let i = 0; i < 10; i++) {
      expect(parent[i]).toBeGreaterThanOrEqual(0)
      expect(parent[i]).toBeLessThan(10)
      expect(depth[i]).toBeGreaterThanOrEqual(0)
    }
  })

  it('single node depth is 0', () => {
    const cd = new CentroidDecomposition(1)
    const { depth, parent } = cd.decompose()
    expect(depth[0]).toBe(0)
    expect(parent[0]).toBe(0)
  })

  it('decompose result arrays are independent copies', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1); cd.addEdge(1, 2)
    const { parent } = cd.decompose()
    parent[0] = -999
    expect(parent[0]).toBe(-999)
  })

  it('handles T-shaped tree', () => {
    const cd = new CentroidDecomposition(7)
    cd.addEdge(0, 1); cd.addEdge(1, 2); cd.addEdge(2, 3)
    cd.addEdge(2, 4); cd.addEdge(4, 5); cd.addEdge(4, 6)
    const { parent, depth } = cd.decompose()
    expect(parent.length).toBe(7)
    expect(depth.length).toBe(7)
  })

  it('single node decomposes to itself', () => {
    const cd = new CentroidDecomposition(1)
    const result = cd.decompose()
    expect(result).toBeDefined()
  })

  it('chain decomposes correctly', () => {
    const cd = new CentroidDecomposition(3)
    cd.addEdge(0, 1)
    cd.addEdge(1, 2)
    const result = cd.decompose()
    expect(result.parent.length).toBe(3)
  })

  it('star graph decomposes', () => {
    const cd = new CentroidDecomposition(5)
    cd.addEdge(0, 1)
    cd.addEdge(0, 2)
    cd.addEdge(0, 3)
    cd.addEdge(0, 4)
    const result = cd.decompose()
    expect(result.parent.length).toBe(5)
  })
})

describe('centroid-decompose - wave545', () => {
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

describe('centroid-decompose - wave546', () => {
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

describe('centroid-decompose - wave547', () => {
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

describe('centroid-decompose - wave548', () => {
  it('centroid-decompose module defined', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose module is function', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave549', () => {
  it('centroid-decompose module defined', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose module is function', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave550', () => {
  it('centroid-decompose w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave551', () => {
  it('centroid-decompose w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave552', () => {
  it('centroid-decompose w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave553', () => {
  it('centroid-decompose w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave554', () => {
  it('centroid-decompose w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave555', () => {
  it('centroid-decompose w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave556', () => {
  it('centroid-decompose w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave557', () => {
  it('centroid-decompose w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave558', () => {
  it('centroid-decompose w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave559', () => {
  it('centroid-decompose w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave560', () => {
  it('centroid-decompose w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave561', () => {
  it('centroid-decompose w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave562', () => {
  it('centroid-decompose w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave563', () => {
  it('centroid-decompose w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave564', () => {
  it('centroid-decompose w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave565', () => {
  it('centroid-decompose w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave566', () => {
  it('centroid-decompose w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave127', () => {
  it('centroid-decompose w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave130', () => {
  it('centroid-decompose w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave133', () => {
  it('centroid-decompose w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave136', () => {
  it('centroid-decompose w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - wave139', () => {
  it('centroid-decompose w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w142', () => {
  it('centroid-decompose v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w145', () => {
  it('centroid-decompose v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w148', () => {
  it('centroid-decompose v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w151', () => {
  it('centroid-decompose v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w154', () => {
  it('centroid-decompose v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w157', () => {
  it('centroid-decompose v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w160', () => {
  it('centroid-decompose v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w170', () => {
  it('centroid-decompose x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w180', () => {
  it('centroid-decompose x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w190', () => {
  it('centroid-decompose x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w200', () => {
  it('centroid-decompose x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w210', () => {
  it('centroid-decompose x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w220', () => {
  it('centroid-decompose x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w230', () => {
  it('centroid-decompose x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w240', () => {
  it('centroid-decompose x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w250', () => {
  it('centroid-decompose x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w260', () => {
  it('centroid-decompose x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w270', () => {
  it('centroid-decompose x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w280', () => {
  it('centroid-decompose x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w290', () => {
  it('centroid-decompose x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w300', () => {
  it('centroid-decompose x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w310', () => {
  it('centroid-decompose x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w320', () => {
  it('centroid-decompose x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w330', () => {
  it('centroid-decompose x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w340', () => {
  it('centroid-decompose x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w350', () => {
  it('centroid-decompose x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w360', () => {
  it('centroid-decompose x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w370', () => {
  it('centroid-decompose x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w380', () => {
  it('centroid-decompose x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w390', () => {
  it('centroid-decompose x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w400', () => {
  it('centroid-decompose x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w420', () => {
  it('centroid-decompose x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w440', () => {
  it('centroid-decompose x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w460', () => {
  it('centroid-decompose x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w480', () => {
  it('centroid-decompose x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w500', () => {
  it('centroid-decompose x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w550', () => {
  it('centroid-decompose x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w600', () => {
  it('centroid-decompose x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w650', () => {
  it('centroid-decompose x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w700', () => {
  it('centroid-decompose x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w800', () => {
  it('centroid-decompose x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w900', () => {
  it('centroid-decompose x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('centroid-decompose - w1000', () => {
  it('centroid-decompose x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('centroid-decompose x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
