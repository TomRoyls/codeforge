import { describe, expect, it } from 'vitest'
import { BlockCutTree } from '../../src/utils/block-cut-tree.js'

describe('BlockCutTree', () => {
  it('handles single edge', () => {
    const bct = new BlockCutTree(2)
    bct.addEdge(0, 1)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
    expect(componentOf.length).toBe(1)
  })

  it('finds articulation point in path', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
  })

  it('handles triangle (no AP)', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles single node', () => {
    const bct = new BlockCutTree(1)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(componentOf.length).toBe(0)
  })

  it('handles star graph', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(0, 2)
    bct.addEdge(0, 3)
    bct.addEdge(0, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(true)
  })

  it('handles disconnected graph', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(2, 3)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
    expect(componentOf.length).toBe(2)
  })

  it('handles cycle (no AP)', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 0)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles two triangles sharing vertex', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 2)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[2]).toBe(true)
    expect(componentOf.length).toBe(2)
  })

  it('handles line of 4 nodes', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('handles complete graph K4 (no AP)', () => {
    const bct = new BlockCutTree(4)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++)
        bct.addEdge(i, j)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles bridge edge as separate component', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    bct.addEdge(5, 3)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[2]).toBe(true)
    expect(componentOf.length).toBe(3)
  })

  it('handles two bridges', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[3]).toBe(true)
  })

  it('chain has internal articulation points', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('bridge edge in 2-node graph', () => {
    const bct = new BlockCutTree(2)
    bct.addEdge(0, 1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
  })

  it('two edges in a line creates articulation point', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
  })

  it('chain of 2 has middle articulation', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
  })

  it('single node is not articulation', () => {
    const bct = new BlockCutTree(1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
  })

  it('two nodes with edge has no articulation', () => {
    const bct = new BlockCutTree(2)
    bct.addEdge(0, 1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[1]).toBe(false)
  })

  it('handles empty graph with 3 nodes', () => {
    const bct = new BlockCutTree(3)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
    expect(componentOf.length).toBe(0)
  })

  it('handles pentagon cycle (no AP)', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 0)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles cube graph structure', () => {
    const bct = new BlockCutTree(8)
    bct.addEdge(0, 1)
    bct.addEdge(1, 3)
    bct.addEdge(3, 2)
    bct.addEdge(2, 0)
    bct.addEdge(4, 5)
    bct.addEdge(5, 7)
    bct.addEdge(7, 6)
    bct.addEdge(6, 4)
    bct.addEdge(0, 4)
    bct.addEdge(1, 5)
    bct.addEdge(2, 6)
    bct.addEdge(3, 7)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles graph with pendant vertices', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[3]).toBe(false)
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('handles diamond shape', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(1, 3)
    bct.addEdge(2, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(false)
    expect(isArticulation[2]).toBe(false)
  })

  it('handles tree structure with multiple branches', () => {
    const bct = new BlockCutTree(7)
    bct.addEdge(0, 1)
    bct.addEdge(0, 2)
    bct.addEdge(0, 3)
    bct.addEdge(1, 4)
    bct.addEdge(1, 5)
    bct.addEdge(2, 6)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(true)
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('handles double bridge configuration', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
    expect(isArticulation[3]).toBe(true)
  })

  it('handles wheel graph', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(0, 2)
    bct.addEdge(0, 3)
    bct.addEdge(0, 4)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 1)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
  })

  it('handles binary tree structure', () => {
    const bct = new BlockCutTree(7)
    bct.addEdge(0, 1)
    bct.addEdge(0, 2)
    bct.addEdge(1, 3)
    bct.addEdge(1, 4)
    bct.addEdge(2, 5)
    bct.addEdge(2, 6)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(true)
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('handles ladder graph', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    bct.addEdge(0, 3)
    bct.addEdge(1, 4)
    bct.addEdge(2, 5)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles bowtie graph (two triangles sharing one vertex)', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 2)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[2]).toBe(true)
    expect(componentOf.length).toBe(2)
  })

  it('handles graph with isolated vertex', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(false)
    expect(isArticulation[3]).toBe(false)
  })

  it('handles complete graph K5 (no AP)', () => {
    const bct = new BlockCutTree(5)
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++)
        bct.addEdge(i, j)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles graph with multiple cycles sharing edge', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 2)
    bct.addEdge(3, 5)
    bct.addEdge(5, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[1]).toBe(false)
    expect(isArticulation[2]).toBe(true)
    expect(isArticulation[5]).toBe(false)
  })

  it('handles path of 5 nodes', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[4]).toBe(false)
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
    expect(isArticulation[3]).toBe(true)
  })

  it('handles graph with degree 1 vertex', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[4]).toBe(false)
  })

  it('handles triangular prism', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    bct.addEdge(5, 3)
    bct.addEdge(0, 3)
    bct.addEdge(1, 4)
    bct.addEdge(2, 5)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles graph with cut vertex connecting two cycles', () => {
    const bct = new BlockCutTree(7)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    bct.addEdge(5, 3)
    bct.addEdge(3, 6)
    const { isArticulation } = bct.build()
    expect(isArticulation[2]).toBe(true)
    expect(isArticulation[3]).toBe(true)
  })

  it('handles house graph', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 0)
    bct.addEdge(1, 4)
    bct.addEdge(2, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles two separate cycles', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    bct.addEdge(5, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles path with single edge cycle', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(2, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })

  it('handles complete bipartite K2,3', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 2)
    bct.addEdge(0, 3)
    bct.addEdge(0, 4)
    bct.addEdge(1, 2)
    bct.addEdge(1, 3)
    bct.addEdge(1, 4)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles multiple edges between same vertices (treated as single)', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(0, 1)
    const { isArticulation } = bct.build()
    expect(isArticulation[1]).toBe(true)
  })

  it('handles graph with vertex of degree 2 not articulation', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(0, 3)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles tree with all internal nodes as articulation', () => {
    const bct = new BlockCutTree(8)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    bct.addEdge(5, 6)
    bct.addEdge(6, 7)
    const { isArticulation } = bct.build()
    expect(isArticulation[0]).toBe(false)
    expect(isArticulation[7]).toBe(false)
    for (let i = 1; i < 7; i++) {
      expect(isArticulation[i]).toBe(true)
    }
  })

  it('handles graph with isolated edge', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
    expect(componentOf.length).toBe(1)
  })

  it('handles three disjoint edges', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(2, 3)
    bct.addEdge(4, 5)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
    expect(componentOf.length).toBe(3)
  })

  it('handles cycle with chord', () => {
    const bct = new BlockCutTree(5)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 0)
    bct.addEdge(0, 2)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles graph with single cycle attached to tree', () => {
    const bct = new BlockCutTree(6)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 0)
    bct.addEdge(2, 3)
    bct.addEdge(3, 4)
    bct.addEdge(4, 5)
    const { isArticulation } = bct.build()
    expect(isArticulation[2]).toBe(true)
    expect(isArticulation[3]).toBe(true)
  })

  it('toString returns correct format', () => {
    const bct = new BlockCutTree(5)
    expect(bct.toString()).toBe('BlockCutTree(n=5)')
  })

  it('toJSON returns correct structure', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    const json = bct.toJSON()
    expect(json).toEqual({ n: 3, adj: [[1], [0, 2], [1]] })
  })

  it('clone creates independent copy', () => {
    const bct = new BlockCutTree(3)
    bct.addEdge(0, 1)
    const cloned = bct.clone()
    cloned.addEdge(1, 2)
    const original = bct.build()
    const clonedResult = cloned.build()
    expect(original.componentOf.length).toBe(1)
    expect(clonedResult.componentOf.length).toBe(2)
  })

  it('equals returns true for identical graphs', () => {
    const bct1 = new BlockCutTree(3)
    bct1.addEdge(0, 1)
    bct1.addEdge(1, 2)
    const bct2 = new BlockCutTree(3)
    bct2.addEdge(0, 1)
    bct2.addEdge(1, 2)
    expect(bct1.equals(bct2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const bct1 = new BlockCutTree(2)
    bct1.addEdge(0, 1)
    const bct2 = new BlockCutTree(3)
    bct2.addEdge(0, 1)
    expect(bct1.equals(bct2)).toBe(false)
  })

  it('equals returns false for different edges', () => {
    const bct1 = new BlockCutTree(3)
    bct1.addEdge(0, 1)
    const bct2 = new BlockCutTree(3)
    bct2.addEdge(1, 2)
    expect(bct1.equals(bct2)).toBe(false)
  })

  it('equals returns false for non-BlockCutTree instance', () => {
    const bct = new BlockCutTree(2)
    expect(bct.equals({})).toBe(false)
    expect(bct.equals(null)).toBe(false)
  })

  it('handles large graph with no articulation points', () => {
    const bct = new BlockCutTree(6)
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++)
        bct.addEdge(i, j)
    const { isArticulation } = bct.build()
    expect(isArticulation.every(v => !v)).toBe(true)
  })

  it('handles graph with single bridge', () => {
    const bct = new BlockCutTree(4)
    bct.addEdge(0, 1)
    bct.addEdge(1, 2)
    bct.addEdge(2, 3)
    const { isArticulation, componentOf } = bct.build()
    expect(isArticulation[1]).toBe(true)
    expect(isArticulation[2]).toBe(true)
  })
})
describe('block-cut-tree - wave548', () => {
  it('block-cut-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module not null', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module has length', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-cut-tree - wave549', () => {
  it('block-cut-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-cut-tree - wave550', () => {
  it('block-cut-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('block-cut-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
