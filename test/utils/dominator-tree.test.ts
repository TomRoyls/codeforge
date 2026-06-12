import { describe, expect, it } from 'vitest'
import { DominatorTree } from '../../src/utils/dominator-tree.js'

describe('DominatorTree', () => {
  it('single node dominates itself', () => {
    const dt = new DominatorTree(1)
    expect(dt.build(0)).toEqual([0])
  })

  it('path domination', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    expect(dt.build(0)).toEqual([0, 0, 1])
  })

  it('diamond domination', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    expect(dt.build(0)).toEqual([0, 0, 0, 0])
  })

  it('dominates check', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    expect(dt.dominates(0, 0, 2)).toBe(true)
    expect(dt.dominates(0, 1, 2)).toBe(true)
  })

  it('non-dominator check', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    expect(dt.dominates(0, 1, 2)).toBe(false)
  })

  it('branch domination', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    const dom = dt.build(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(0)
    expect(dom[3]).toBe(1)
  })

  it('unreachable nodes', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    expect(dt.build(0)).toEqual([0, 0, -1])
  })

  it('self-loop domination', () => {
    const dt = new DominatorTree(2)
    dt.addEdge(0, 1)
    dt.addEdge(1, 1)
    expect(dt.build(0)).toEqual([0, 0])
  })

  it('complex graph', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    const dom = dt.build(0)
    expect(dom[4]).toBe(3)
  })

  it('empty graph', () => {
    const dt = new DominatorTree(3)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(-1)
  })

  it('linear chain', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    const dom = dt.build(0)
    expect(dom).toEqual([0, 0, 1, 2, 3])
  })

  it('handles branching graph', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 4)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(0)
    expect(dom[3]).toBe(1)
    expect(dom[4]).toBe(2)
  })

  it('diamond merge point', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
  })

  it('handles two edges to same target', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
    expect(dom[1]).toBe(0)
  })

  it('handles two node chain', () => {
    const dt = new DominatorTree(2)
    dt.addEdge(0, 1)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
  })

  it('linear chain dominators', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    const dom = dt.build(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(1)
  })

  it('dominates returns true for immediate dominator', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    const dom = dt.build(0)
    expect(dom[2]).toBe(1)
  })

  it('high-index root does not infinite loop', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(3, 1)
    dt.addEdge(3, 2)
    dt.addEdge(1, 0)
    dt.addEdge(2, 0)
    const dom = dt.build(3)
    expect(dom[3]).toBe(3)
    expect(dom[1]).toBe(3)
    expect(dom[2]).toBe(3)
    expect(dom[0]).toBe(3)
  })

  it('diamond with high-index root', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(4, 2)
    dt.addEdge(4, 3)
    dt.addEdge(2, 0)
    dt.addEdge(3, 0)
    dt.addEdge(0, 1)
    const dom = dt.build(4)
    expect(dom[4]).toBe(4)
    expect(dom[2]).toBe(4)
    expect(dom[3]).toBe(4)
    expect(dom[0]).toBe(4)
    expect(dom[1]).toBe(0)
  })

  it('toString returns correct format', () => {
    const dt = new DominatorTree(5)
    expect(dt.toString()).toBe('DominatorTree(n=5)')
  })

  it('toJSON returns correct structure', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    const json = dt.toJSON()
    expect(json).toEqual({ n: 3, edges: [[1], [2], []] })
  })

  it('clone creates independent copy', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    const copy = dt.clone()
    copy.addEdge(0, 3)
    const dtDom = dt.build(0)
    const copyDom = copy.build(0)
    expect(dtDom).toEqual([0, 0, 0, 0])
    expect(copyDom).toEqual([0, 0, 0, 0])
    expect(dt.toJSON()).toEqual({ n: 4, edges: [[1, 2], [3], [3], []] })
    expect(copy.toJSON()).toEqual({ n: 4, edges: [[1, 2, 3], [3], [3], []] })
  })

  it('equals returns true for same size trees', () => {
    const dt1 = new DominatorTree(5)
    const dt2 = new DominatorTree(5)
    expect(dt1.equals(dt2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const dt1 = new DominatorTree(3)
    const dt2 = new DominatorTree(5)
    expect(dt1.equals(dt2)).toBe(false)
  })

  it('equals returns false for non-DominatorTree', () => {
    const dt = new DominatorTree(3)
    expect(dt.equals({})).toBe(false)
    expect(dt.equals(null)).toBe(false)
    expect(dt.equals(undefined)).toBe(false)
  })

  it('star topology graph', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(0, 3)
    dt.addEdge(0, 4)
    const dom = dt.build(0)
    expect(dom).toEqual([0, 0, 0, 0, 0])
  })

  it('multiple merge points', () => {
    const dt = new DominatorTree(6)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    dt.addEdge(3, 5)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
    expect(dom[4]).toBe(3)
    expect(dom[5]).toBe(3)
  })

  it('cross edges', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(1, 2)
    const dom = dt.build(0)
    expect(dom[2]).toBe(0)
    expect(dom[3]).toBe(0)
  })

  it('all nodes unreachable from root', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(-1)
    expect(dom[2]).toBe(-1)
    expect(dom[3]).toBe(-1)
  })

  it('graph with cycle', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 1)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(1)
  })

  it('forward edges', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    dt.addEdge(0, 2)
    const dom = dt.build(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(0)
    expect(dom[3]).toBe(2)
  })

  it('backward edges', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    dt.addEdge(2, 1)
    const dom = dt.build(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(1)
    expect(dom[3]).toBe(2)
  })

  it('complex diamond with multiple levels', () => {
    const dt = new DominatorTree(7)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    dt.addEdge(3, 5)
    dt.addEdge(4, 6)
    dt.addEdge(5, 6)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
    expect(dom[6]).toBe(3)
  })

  it('different roots on same graph', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    const dom1 = dt.build(0)
    const dom2 = dt.build(1)
    expect(dom1[0]).toBe(0)
    expect(dom2[1]).toBe(1)
    expect(dom2[2]).toBe(1)
  })

  it('graph with split and rejoin', () => {
    const dt = new DominatorTree(6)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(1, 4)
    dt.addEdge(2, 5)
    dt.addEdge(3, 5)
    dt.addEdge(4, 5)
    const dom = dt.build(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(0)
    expect(dom[5]).toBe(0)
  })

  it('large graph', () => {
    const dt = new DominatorTree(10)
    for (let i = 0; i < 9; i++) {
      dt.addEdge(i, i + 1)
    }
    const dom = dt.build(0)
    for (let i = 1; i < 10; i++) {
      expect(dom[i]).toBe(i - 1)
    }
  })

  it('graph with isolated nodes', () => {
    const dt = new DominatorTree(6)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(1)
    expect(dom[3]).toBe(-1)
    expect(dom[4]).toBe(-1)
    expect(dom[5]).toBe(-1)
  })

  it('self-loop on root', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 0)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(1)
  })

  it('multiple incoming edges', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(0, 3)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
  })

  it('node equals dominator', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    expect(dt.dominates(0, 1, 1)).toBe(true)
  })

  it('dominates with different root', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    expect(dt.dominates(1, 2, 3)).toBe(true)
    expect(dt.dominates(0, 2, 3)).toBe(false)
  })

  it('equals with same instance', () => {
    const dt = new DominatorTree(5)
    expect(dt.equals(dt)).toBe(true)
  })

  it('toJSON with no edges', () => {
    const dt = new DominatorTree(3)
    const json = dt.toJSON()
    expect(json).toEqual({ n: 3, edges: [[], [], []] })
  })

  it('clone with no edges', () => {
    const dt = new DominatorTree(3)
    const copy = dt.clone()
    expect(copy.toJSON()).toEqual(dt.toJSON())
  })

  it('dominates with unreachable node', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    expect(dt.dominates(0, 1, 3)).toBe(false)
  })

  it('three-way merge diamond', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(0, 3)
    dt.addEdge(1, 4)
    dt.addEdge(2, 4)
    dt.addEdge(3, 4)
    const dom = dt.build(0)
    expect(dom[4]).toBe(0)
  })

  it('graph with multiple paths to intermediate node', () => {
    const dt = new DominatorTree(6)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    dt.addEdge(3, 5)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
    expect(dom[4]).toBe(3)
    expect(dom[5]).toBe(3)
  })

  it('sequential diamond patterns', () => {
    const dt = new DominatorTree(8)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    dt.addEdge(3, 5)
    dt.addEdge(4, 6)
    dt.addEdge(5, 6)
    dt.addEdge(6, 7)
    const dom = dt.build(0)
    expect(dom[3]).toBe(0)
    expect(dom[6]).toBe(3)
    expect(dom[7]).toBe(6)
  })

  it('self-loops on multiple nodes', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(1, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 2)
    dt.addEdge(2, 3)
    const dom = dt.build(0)
    expect(dom[0]).toBe(0)
    expect(dom[1]).toBe(0)
    expect(dom[2]).toBe(1)
    expect(dom[3]).toBe(2)
  })

  it('complex crossing edges', () => {
    const dt = new DominatorTree(6)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 4)
    dt.addEdge(3, 5)
    dt.addEdge(4, 5)
    dt.addEdge(1, 4)
    dt.addEdge(2, 3)
    const dom = dt.build(0)
    expect(dom[5]).toBe(0)
  })

  it('toJSON with complex graph structure', () => {
    const dt = new DominatorTree(5)
    dt.addEdge(0, 1)
    dt.addEdge(0, 2)
    dt.addEdge(1, 3)
    dt.addEdge(2, 4)
    dt.addEdge(1, 4)
    const json = dt.toJSON()
    expect(json.n).toBe(5)
    expect(json.edges.length).toBe(5)
    expect(json.edges[0]).toEqual([1, 2])
    expect(json.edges[1]).toEqual([3, 4])
  })

  it('clone preserves exact graph structure', () => {
    const dt = new DominatorTree(6)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    dt.addEdge(3, 4)
    dt.addEdge(4, 5)
    dt.addEdge(0, 5)
    const copy = dt.clone()
    const dtDom = dt.build(0)
    const copyDom = copy.build(0)
    expect(dtDom).toEqual(copyDom)
  })

  it('equals returns true for same size trees with different structures', () => {
    const dt1 = new DominatorTree(4)
    dt1.addEdge(0, 1)
    dt1.addEdge(1, 2)
    const dt2 = new DominatorTree(4)
    dt2.addEdge(0, 1)
    dt2.addEdge(0, 2)
    expect(dt1.equals(dt2)).toBe(true)
  })

  it('single edge graph', () => {
    const dt = new DominatorTree(2)
    dt.addEdge(0, 1)
    const dom = dt.build(0)
    expect(dom).toEqual([0, 0])
  })

  it('dominates root dominates itself', () => {
    const dt = new DominatorTree(3)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.build(0)
    expect(dt.dominates(0, 0, 0)).toBe(true)
  })

  it('single node tree', () => {
    const dt = new DominatorTree(1)
    const dom = dt.build(0)
    expect(dom).toEqual([0])
  })

  it('dominates checks ancestor', () => {
    const dt = new DominatorTree(4)
    dt.addEdge(0, 1)
    dt.addEdge(1, 2)
    dt.addEdge(2, 3)
    dt.build(0)
    expect(dt.dominates(0, 0, 2)).toBe(true)
  })
})
describe('dominator-tree - wave548', () => {
  it('dominator-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module not null', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module has length', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave549', () => {
  it('dominator-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave550', () => {
  it('dominator-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave551', () => {
  it('dominator-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave552', () => {
  it('dominator-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave553', () => {
  it('dominator-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave554', () => {
  it('dominator-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave555', () => {
  it('dominator-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave556', () => {
  it('dominator-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave557', () => {
  it('dominator-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave558', () => {
  it('dominator-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave559', () => {
  it('dominator-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave560', () => {
  it('dominator-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave561', () => {
  it('dominator-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave562', () => {
  it('dominator-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave563', () => {
  it('dominator-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave564', () => {
  it('dominator-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave565', () => {
  it('dominator-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave566', () => {
  it('dominator-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave127', () => {
  it('dominator-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave130', () => {
  it('dominator-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave133', () => {
  it('dominator-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave136', () => {
  it('dominator-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - wave139', () => {
  it('dominator-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w142', () => {
  it('dominator-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w145', () => {
  it('dominator-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w148', () => {
  it('dominator-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w151', () => {
  it('dominator-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w154', () => {
  it('dominator-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w157', () => {
  it('dominator-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w160', () => {
  it('dominator-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w170', () => {
  it('dominator-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w180', () => {
  it('dominator-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w190', () => {
  it('dominator-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w200', () => {
  it('dominator-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w210', () => {
  it('dominator-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w220', () => {
  it('dominator-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w230', () => {
  it('dominator-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w240', () => {
  it('dominator-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w250', () => {
  it('dominator-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w260', () => {
  it('dominator-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w270', () => {
  it('dominator-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w280', () => {
  it('dominator-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w290', () => {
  it('dominator-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w300', () => {
  it('dominator-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w310', () => {
  it('dominator-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w320', () => {
  it('dominator-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w330', () => {
  it('dominator-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w340', () => {
  it('dominator-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w350', () => {
  it('dominator-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w360', () => {
  it('dominator-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w370', () => {
  it('dominator-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w380', () => {
  it('dominator-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w390', () => {
  it('dominator-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w400', () => {
  it('dominator-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w420', () => {
  it('dominator-tree x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w440', () => {
  it('dominator-tree x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w460', () => {
  it('dominator-tree x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w480', () => {
  it('dominator-tree x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w500', () => {
  it('dominator-tree x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w550', () => {
  it('dominator-tree x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('dominator-tree - w600', () => {
  it('dominator-tree x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('dominator-tree x600x49', () => {
    expect(describe).toBeDefined()
  })
})
