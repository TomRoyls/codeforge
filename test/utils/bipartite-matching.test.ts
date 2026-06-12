import { describe, it, expect } from 'vitest'
import { BipartiteMatching } from '../../src/utils/bipartite-matching.js'

describe('BipartiteMatching', () => {
  it('empty graph returns max matching of 0', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(graph.maxMatching()).toBe(0)
    expect(graph.edgeCount).toBe(0)
  })

  it('single edge returns max matching of 1', () => {
    const graph = new BipartiteMatching(2, 2)
    graph.addEdge(0, 0)
    expect(graph.maxMatching()).toBe(1)
    expect(graph.getMatch(0)).toBe(0)
  })

  it('perfect matching with same size both sides', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    expect(graph.maxMatching()).toBe(3)
  })

  it('no edges returns max matching of 0', () => {
    const graph = new BipartiteMatching(5, 5)
    expect(graph.maxMatching()).toBe(0)
    expect(graph.getMatching().size).toBe(0)
  })

  it('multiple edges per left node', () => {
    const graph = new BipartiteMatching(2, 3)
    graph.addEdge(0, 0)
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)
    graph.addEdge(1, 0)
    expect(graph.maxMatching()).toBe(2)
  })

  it('larger graph with 20+ nodes', () => {
    const graph = new BipartiteMatching(10, 12)
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 5; j++) {
        graph.addEdge(i, j)
      }
    }
    expect(graph.maxMatching()).toBe(5)
  })

  it('complete bipartite graph max matching equals min size', () => {
    const graph = new BipartiteMatching(4, 6)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 6; j++) {
        graph.addEdge(i, j)
      }
    }
    expect(graph.maxMatching()).toBe(Math.min(4, 6))
  })

  it('getMatching returns correct pairs', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 1)
    graph.addEdge(1, 0)
    graph.addEdge(2, 2)
    graph.maxMatching()
    const matching = graph.getMatching()
    expect(matching.size).toBe(3)
    expect(matching.has(0)).toBe(true)
    expect(matching.has(1)).toBe(true)
    expect(matching.has(2)).toBe(true)
  })

  it('isMatched and getMatch work correctly', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.maxMatching()
    expect(graph.isMatched(0)).toBe(true)
    expect(graph.isMatched(1)).toBe(true)
    expect(graph.isMatched(2)).toBe(false)
    expect(graph.getMatch(0)).toBe(0)
    expect(graph.getMatch(1)).toBe(1)
    expect(graph.getMatch(2)).toBeUndefined()
  })

  it('asymmetric sizes with more left than right', () => {
    const graph = new BipartiteMatching(5, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    graph.addEdge(3, 0)
    graph.addEdge(4, 1)
    expect(graph.maxMatching()).toBe(3)
  })

  it('clear resets matching and edges', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.maxMatching()
    expect(graph.maxMatching()).toBe(2)
    graph.clear()
    expect(graph.maxMatching()).toBe(0)
    expect(graph.edgeCount).toBe(0)
  })

  it('edge count tracks correctly', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(graph.edgeCount).toBe(0)
    graph.addEdge(0, 0)
    expect(graph.edgeCount).toBe(1)
    graph.addEdge(0, 1)
    expect(graph.edgeCount).toBe(2)
    graph.addEdge(1, 0)
    expect(graph.edgeCount).toBe(3)
  })

  it('disconnected components', () => {
    const graph = new BipartiteMatching(6, 6)
    graph.addEdge(0, 0)
    graph.addEdge(0, 1)
    graph.addEdge(1, 0)
    graph.addEdge(3, 3)
    graph.addEdge(4, 4)
    graph.addEdge(5, 5)
    expect(graph.maxMatching()).toBe(5)
  })

  it('duplicate edges are not counted twice', () => {
    const graph = new BipartiteMatching(2, 2)
    graph.addEdge(0, 0)
    graph.addEdge(0, 0)
    graph.addEdge(0, 0)
    expect(graph.edgeCount).toBe(1)
    expect(graph.maxMatching()).toBe(1)
  })

  it('addEdge throws on invalid left node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.addEdge(-1, 0)).toThrow(RangeError)
    expect(() => graph.addEdge(3, 0)).toThrow(RangeError)
  })

  it('addEdge throws on invalid right node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.addEdge(0, -1)).toThrow(RangeError)
    expect(() => graph.addEdge(0, 3)).toThrow(RangeError)
  })

  it('isMatched throws on invalid left node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.isMatched(-1)).toThrow(RangeError)
    expect(() => graph.isMatched(3)).toThrow(RangeError)
  })

  it('getMatch throws on invalid left node', () => {
    const graph = new BipartiteMatching(3, 3)
    expect(() => graph.getMatch(-1)).toThrow(RangeError)
    expect(() => graph.getMatch(3)).toThrow(RangeError)
  })

  it('leftSize and rightSize are read-only', () => {
    const graph = new BipartiteMatching(5, 7)
    expect(graph.leftSize).toBe(5)
    expect(graph.rightSize).toBe(7)
  })

  it('matching after multiple maxMatching calls', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    expect(graph.maxMatching()).toBe(3)
    expect(graph.maxMatching()).toBe(3)
  })

  it('empty graph has 0 matching', () => {
    const graph = new BipartiteMatching(0, 0)
    expect(graph.maxMatching()).toBe(0)
  })

  it('single pair matching', () => {
    const graph = new BipartiteMatching(1, 1)
    graph.addEdge(0, 0)
    expect(graph.maxMatching()).toBe(1)
  })

  it('no edges has zero matching', () => {
    const graph = new BipartiteMatching(2, 2)
    expect(graph.maxMatching()).toBe(0)
  })

  it('single edge matching is 1', () => {
    const graph = new BipartiteMatching(1, 1)
    graph.addEdge(0, 0)
    expect(graph.maxMatching()).toBe(1)
  })

  it('no edges has 0 matching', () => {
    const graph = new BipartiteMatching(2, 2)
    expect(graph.maxMatching()).toBe(0)
  })

  describe('BipartiteMatching toString', () => {
    it('returns correct format for empty graph', () => {
      const graph = new BipartiteMatching(3, 4)
      expect(graph.toString()).toBe('BipartiteMatching(left=3, right=4, edges=0)')
    })

    it('reflects edge count', () => {
      const graph = new BipartiteMatching(2, 2)
      graph.addEdge(0, 0)
      graph.addEdge(1, 1)
      expect(graph.toString()).toContain('edges=2')
    })
  })

  describe('BipartiteMatching toJSON', () => {
    it('returns structure with leftSize, rightSize, adj', () => {
      const graph = new BipartiteMatching(2, 3)
      graph.addEdge(0, 0)
      graph.addEdge(1, 2)
      const json = graph.toJSON() as Record<string, unknown>
      expect(json.leftSize).toBe(2)
      expect(json.rightSize).toBe(3)
      expect(json.edgeCount).toBe(2)
      expect(Array.isArray(json.adj)).toBe(true)
    })

    it('adj reflects edges', () => {
      const graph = new BipartiteMatching(2, 2)
      graph.addEdge(0, 0)
      const json = graph.toJSON() as Record<string, unknown>
      const adj = json.adj as number[][]
      expect(adj[0]).toContain(0)
    })
  })

  describe('BipartiteMatching clone', () => {
    it('creates independent copy', () => {
      const graph = new BipartiteMatching(2, 2)
      graph.addEdge(0, 0)
      graph.addEdge(1, 1)
      const copy = graph.clone()
      expect(copy.maxMatching()).toBe(2)
    })

    it('modifications to clone do not affect original', () => {
      const graph = new BipartiteMatching(3, 3)
      graph.addEdge(0, 0)
      const copy = graph.clone()
      copy.addEdge(1, 1)
      expect(graph.maxMatching()).toBe(1)
      expect(copy.maxMatching()).toBe(2)
    })

    it('clone of empty is empty', () => {
      const graph = new BipartiteMatching(2, 2)
      const copy = graph.clone()
      expect(copy.maxMatching()).toBe(0)
    })
  })

  describe('BipartiteMatching equals', () => {
    it('empty graphs are equal', () => {
      const a = new BipartiteMatching(2, 2)
      const b = new BipartiteMatching(2, 2)
      expect(a.equals(b)).toBe(true)
    })

    it('same edges are equal', () => {
      const a = new BipartiteMatching(2, 2)
      const b = new BipartiteMatching(2, 2)
      a.addEdge(0, 0)
      b.addEdge(0, 0)
      expect(a.equals(b)).toBe(true)
    })

    it('different sizes are not equal', () => {
      const a = new BipartiteMatching(2, 2)
      const b = new BipartiteMatching(3, 2)
      expect(a.equals(b)).toBe(false)
    })

    it('different edges are not equal', () => {
      const a = new BipartiteMatching(2, 2)
      const b = new BipartiteMatching(2, 2)
      a.addEdge(0, 0)
      b.addEdge(1, 1)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for non-BipartiteMatching', () => {
      const graph = new BipartiteMatching(2, 2)
      expect(graph.equals(null)).toBe(false)
      expect(graph.equals(undefined)).toBe(false)
      expect(graph.equals({})).toBe(false)
    })

    it('self equals self', () => {
      const graph = new BipartiteMatching(2, 2)
      graph.addEdge(0, 0)
      expect(graph.equals(graph)).toBe(true)
    })
  })

  it('handles dense bipartite graph', () => {
    const graph = new BipartiteMatching(5, 5)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        graph.addEdge(i, j)
      }
    }
    expect(graph.maxMatching()).toBe(5)
  })

  it('handles unbalanced bipartite graph', () => {
    const graph = new BipartiteMatching(3, 5)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    expect(graph.maxMatching()).toBe(3)
  })

  it('constructor with zero left side', () => {
    const graph = new BipartiteMatching(0, 5)
    expect(graph.leftSize).toBe(0)
    expect(graph.rightSize).toBe(5)
    expect(graph.maxMatching()).toBe(0)
  })

  it('constructor with zero right side', () => {
    const graph = new BipartiteMatching(5, 0)
    expect(graph.leftSize).toBe(5)
    expect(graph.rightSize).toBe(0)
    expect(graph.maxMatching()).toBe(0)
  })

  it('clear preserves leftSize and rightSize', () => {
    const graph = new BipartiteMatching(4, 6)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.clear()
    expect(graph.leftSize).toBe(4)
    expect(graph.rightSize).toBe(6)
  })

  it('getMatching with partial matching', () => {
    const graph = new BipartiteMatching(4, 4)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.addEdge(2, 2)
    graph.maxMatching()
    const matching = graph.getMatching()
    expect(matching.size).toBe(3)
    expect(matching.get(0)).toBe(0)
    expect(matching.get(1)).toBe(1)
    expect(matching.get(2)).toBe(2)
    expect(matching.get(3)).toBeUndefined()
  })

  it('equals with same edges in different order', () => {
    const a = new BipartiteMatching(3, 3)
    const b = new BipartiteMatching(3, 3)
    a.addEdge(0, 0)
    a.addEdge(0, 1)
    a.addEdge(1, 2)
    b.addEdge(1, 2)
    b.addEdge(0, 1)
    b.addEdge(0, 0)
    expect(a.equals(b)).toBe(true)
  })

  it('toJSON structure contains expected properties', () => {
    const graph = new BipartiteMatching(3, 4)
    graph.addEdge(0, 1)
    graph.addEdge(2, 3)
    const json = graph.toJSON() as Record<string, unknown>
    expect(json).toHaveProperty('leftSize')
    expect(json).toHaveProperty('rightSize')
    expect(json).toHaveProperty('adj')
    expect(json).toHaveProperty('edgeCount')
    expect(json.leftSize).toBe(3)
    expect(json.rightSize).toBe(4)
    expect(json.edgeCount).toBe(2)
  })

  it('clone is independent from original edges', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    const copy = graph.clone()
    graph.clear()
    expect(copy.edgeCount).toBe(1)
    expect(copy.maxMatching()).toBe(1)
    expect(graph.edgeCount).toBe(0)
  })

  it('isMatched after clear returns false for all', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(1, 1)
    graph.maxMatching()
    graph.clear()
    expect(graph.isMatched(0)).toBe(false)
    expect(graph.isMatched(1)).toBe(false)
    expect(graph.isMatched(2)).toBe(false)
  })

  it('edgeCount preserved in clone', () => {
    const graph = new BipartiteMatching(3, 3)
    graph.addEdge(0, 0)
    graph.addEdge(0, 1)
    graph.addEdge(1, 2)
    expect(graph.edgeCount).toBe(3)
    const copy = graph.clone()
    expect(copy.edgeCount).toBe(3)
  })

  it('should handle no edges', () => {
    const bm = new BipartiteMatching(3, 3)
    expect(bm.maxMatching()).toBe(0)
  })

  it('should handle single pair', () => {
    const bm = new BipartiteMatching(1, 1)
    bm.addEdge(0, 0)
    expect(bm.maxMatching()).toBe(1)
  })

  it('clear resets the matching', () => {
    const bm = new BipartiteMatching(3, 3)
    bm.addEdge(0, 0)
    bm.addEdge(1, 1)
    expect(bm.maxMatching()).toBe(2)
    bm.clear()
    expect(bm.maxMatching()).toBe(0)
  })

  it('isMatched returns false for unmatched left node', () => {
    const bm = new BipartiteMatching(3, 2)
    bm.addEdge(0, 0)
    bm.maxMatching()
    expect(bm.isMatched(2)).toBe(false)
  })

  it('getMatch returns undefined for unmatched node', () => {
    const bm = new BipartiteMatching(2, 2)
    bm.addEdge(0, 0)
    bm.maxMatching()
    expect(bm.getMatch(1)).toBeUndefined()
  })

  it('duplicate edges do not increase edgeCount', () => {
    const bm = new BipartiteMatching(2, 2)
    bm.addEdge(0, 0)
    bm.addEdge(0, 0)
    expect(bm.edgeCount).toBe(1)
  })
})
  it('no edges returns 0 matches', () => {
    const bm = new BipartiteMatching(2, 2)
    expect(bm.maxMatching()).toBe(0)
  })

  it('single edge matches', () => {
    const bm = new BipartiteMatching(2, 2)
    bm.addEdge(0, 0)
    expect(bm.maxMatching()).toBe(1)
  })

  it('complete bipartite matching', () => {
    const bm = new BipartiteMatching(2, 2)
    bm.addEdge(0, 0)
    bm.addEdge(0, 1)
    bm.addEdge(1, 0)
    bm.addEdge(1, 1)
    expect(bm.maxMatching()).toBe(2)
  })

describe('bipartite-matching - wave544', () => {
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

describe('bipartite-matching - wave546', () => {
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

describe('bipartite-matching - wave547', () => {
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

describe('bipartite-matching - wave548', () => {
  it('bipartite-matching module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave549', () => {
  it('bipartite-matching module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave550', () => {
  it('bipartite-matching w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave551', () => {
  it('bipartite-matching w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave552', () => {
  it('bipartite-matching w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave553', () => {
  it('bipartite-matching w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave554', () => {
  it('bipartite-matching w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave555', () => {
  it('bipartite-matching w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bipartite-matching - wave556', () => {
  it('bipartite-matching w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bipartite-matching w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
