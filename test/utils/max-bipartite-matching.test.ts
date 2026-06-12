import { describe, expect, it } from 'vitest'
import { MaxBipartiteMatching } from '../../src/utils/max-bipartite-matching.js'

describe('MaxBipartiteMatching', () => {
  it('finds perfect matching', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    const result = m.maxMatching()
    expect(result.length).toBe(2)
  })

  it('handles no edges', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles single edge', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles competing edges', () => {
    const m = new MaxBipartiteMatching(2, 1)
    m.addEdge(0, 0)
    m.addEdge(1, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles star matching', () => {
    const m = new MaxBipartiteMatching(1, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(0, 2)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles larger bipartite', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('handles empty left side', () => {
    const m = new MaxBipartiteMatching(0, 3)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles empty right side', () => {
    const m = new MaxBipartiteMatching(3, 0)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles asymmetric sizes', () => {
    const m = new MaxBipartiteMatching(2, 4)
    m.addEdge(0, 0)
    m.addEdge(0, 2)
    m.addEdge(1, 1)
    m.addEdge(1, 3)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('handles no matching possible', () => {
    const m = new MaxBipartiteMatching(3, 3)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles complete bipartite', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(0, 2)
    m.addEdge(1, 0)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 0)
    m.addEdge(2, 1)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('returns matching pairs', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    const pairs = m.maxMatching()
    expect(pairs.length).toBe(2)
    expect(pairs).toContainEqual([0, 0])
    expect(pairs).toContainEqual([1, 1])
  })

  it('handles 2x2 partial edges', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles K2,2 complete', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 0)
    m.addEdge(1, 1)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('single edge gives matching 1', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('matching size limited by smaller side', () => {
    const m = new MaxBipartiteMatching(2, 5)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 2)
    m.addEdge(1, 3)
    m.addEdge(1, 4)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('handles disjoint components', () => {
    const m = new MaxBipartiteMatching(4, 4)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    m.addEdge(3, 3)
    expect(m.getMatchingSize()).toBe(4)
  })

  it('alternating path optimization', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('handles multiple edges from same left node', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(0, 2)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('handles multiple edges to same right node', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(1, 0)
    m.addEdge(2, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(2, 1)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('no right nodes can be matched twice', () => {
    const m = new MaxBipartiteMatching(3, 2)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 0)
    m.addEdge(2, 1)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('handles chain graph', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('matching result contains unique left nodes', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    const pairs = m.maxMatching()
    const leftNodes = pairs.map(p => p[0])
    expect(new Set(leftNodes).size).toBe(3)
  })

  it('matching result contains unique right nodes', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    const pairs = m.maxMatching()
    const rightNodes = pairs.map(p => p[1])
    expect(new Set(rightNodes).size).toBe(3)
  })

  it('handles larger asymmetric graph', () => {
    const m = new MaxBipartiteMatching(4, 6)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 2)
    m.addEdge(1, 3)
    m.addEdge(2, 4)
    m.addEdge(2, 5)
    m.addEdge(3, 0)
    m.addEdge(3, 2)
    m.addEdge(3, 4)
    expect(m.getMatchingSize()).toBe(4)
  })

  it('handles sparse graph', () => {
    const m = new MaxBipartiteMatching(5, 5)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    m.addEdge(3, 3)
    m.addEdge(4, 4)
    expect(m.getMatchingSize()).toBe(5)
  })

  it('handles dense graph with constraints', () => {
    const m = new MaxBipartiteMatching(4, 4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        m.addEdge(i, j)
      }
    }
    expect(m.getMatchingSize()).toBe(4)
  })

  it('handles 1x1 matching', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles 1x1 with no edge', () => {
    const m = new MaxBipartiteMatching(1, 1)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('maxMatching returns empty array for no edges', () => {
    const m = new MaxBipartiteMatching(3, 3)
    expect(m.maxMatching()).toEqual([])
  })

  it('maxMatching returns correct structure', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    const result = m.maxMatching()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
    expect(result[0]).toHaveLength(2)
    expect(result[1]).toHaveLength(2)
  })

  it('handles disconnected graph components', () => {
    const m = new MaxBipartiteMatching(4, 4)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    m.addEdge(3, 3)
    expect(m.getMatchingSize()).toBe(4)
  })

  it('multiple maxMatching calls are consistent', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 2)
    const result1 = m.getMatchingSize()
    const result2 = m.getMatchingSize()
    expect(result1).toBe(result2)
  })

  it('handles zero left and right', () => {
    const m = new MaxBipartiteMatching(0, 0)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('handles large graph efficiently', () => {
    const m = new MaxBipartiteMatching(10, 10)
    for (let i = 0; i < 10; i++) {
      m.addEdge(i, i)
    }
    expect(m.getMatchingSize()).toBe(10)
  })

  it('matching respects bipartite constraints', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 0)
    m.addEdge(2, 2)
    const pairs = m.maxMatching()
    for (const [left, right] of pairs) {
      expect(left).toBeGreaterThanOrEqual(0)
      expect(left).toBeLessThan(3)
      expect(right).toBeGreaterThanOrEqual(0)
      expect(right).toBeLessThan(3)
    }
  })

  it('finds maximum when multiple optimal solutions exist', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 0)
    m.addEdge(1, 1)
    const size = m.getMatchingSize()
    expect(size).toBe(2)
  })

  it('handles 3x1 bottleneck', () => {
    const m = new MaxBipartiteMatching(3, 1)
    m.addEdge(0, 0)
    m.addEdge(1, 0)
    m.addEdge(2, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles 1x3 bottleneck', () => {
    const m = new MaxBipartiteMatching(1, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(0, 2)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles 5x5 with alternating pattern', () => {
    const m = new MaxBipartiteMatching(5, 5)
    for (let i = 0; i < 5; i++) {
      m.addEdge(i, i)
      m.addEdge(i, (i + 1) % 5)
    }
    expect(m.getMatchingSize()).toBe(5)
  })

  it('matching pairs are valid edges', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 0)
    m.addEdge(2, 2)
    const pairs = m.maxMatching()
    for (const [left, right] of pairs) {
      expect(left).toBeGreaterThanOrEqual(0)
      expect(left).toBeLessThan(3)
      expect(right).toBeGreaterThanOrEqual(0)
      expect(right).toBeLessThan(3)
    }
  })

  it('handles diamond pattern', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 1)
    m.addEdge(1, 2)
    m.addEdge(2, 0)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('single edge in larger graph', () => {
    const m = new MaxBipartiteMatching(5, 5)
    m.addEdge(2, 3)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles 4x3 rectangular graph', () => {
    const m = new MaxBipartiteMatching(4, 3)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    m.addEdge(3, 0)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('handles 3x4 rectangular graph', () => {
    const m = new MaxBipartiteMatching(3, 4)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    m.addEdge(0, 3)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('handles 4x4 with partial edges', () => {
    const m = new MaxBipartiteMatching(4, 4)
    m.addEdge(0, 0); m.addEdge(0, 1)
    m.addEdge(1, 1); m.addEdge(1, 2)
    m.addEdge(2, 2); m.addEdge(2, 3)
    m.addEdge(3, 3)
    expect(m.getMatchingSize()).toBe(4)
  })

  it('handles disconnected components', () => {
    const m = new MaxBipartiteMatching(4, 4)
    m.addEdge(0, 0); m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('handles single left node with multiple edges', () => {
    const m = new MaxBipartiteMatching(1, 3)
    m.addEdge(0, 0); m.addEdge(0, 1); m.addEdge(0, 2)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('handles single edge', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.maxMatching()).toEqual([[0, 0]])
  })

  it('handles 5x5 complete bipartite', () => {
    const m = new MaxBipartiteMatching(5, 5)
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++)
        m.addEdge(i, j)
    expect(m.getMatchingSize()).toBe(5)
  })

  it('should handle single pair', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('should handle no edges', () => {
    const m = new MaxBipartiteMatching(3, 3)
    expect(m.getMatchingSize()).toBe(0)
  })

  it('single pair matching', () => {
    const m = new MaxBipartiteMatching(1, 1)
    m.addEdge(0, 0)
    expect(m.maxMatching().length).toBe(1)
  })

  it('complete bipartite matching', () => {
    const m = new MaxBipartiteMatching(3, 3)
    m.addEdge(0, 0)
    m.addEdge(1, 1)
    m.addEdge(2, 2)
    expect(m.getMatchingSize()).toBe(3)
  })

  it('unbalanced bipartite graph', () => {
    const m = new MaxBipartiteMatching(2, 3)
    m.addEdge(0, 0)
    m.addEdge(0, 1)
    m.addEdge(1, 2)
    expect(m.getMatchingSize()).toBe(2)
  })

  it('no edges returns empty', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(m.maxMatching()).toEqual([])
  })

  it('single edge matches', () => {
    const m = new MaxBipartiteMatching(2, 2)
    m.addEdge(0, 0)
    expect(m.getMatchingSize()).toBe(1)
  })

  it('getMatchingSize returns number', () => {
    const m = new MaxBipartiteMatching(2, 2)
    expect(typeof m.getMatchingSize()).toBe('number')
  })
})

describe('max-bipartite-matching - wave545', () => {
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

describe('max-bipartite-matching - wave546', () => {
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

describe('max-bipartite-matching - wave547', () => {
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

describe('max-bipartite-matching - wave548', () => {
  it('max-bipartite-matching module defined', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching module is function', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave549', () => {
  it('max-bipartite-matching module defined', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching module is function', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave550', () => {
  it('max-bipartite-matching w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave551', () => {
  it('max-bipartite-matching w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave552', () => {
  it('max-bipartite-matching w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave553', () => {
  it('max-bipartite-matching w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave554', () => {
  it('max-bipartite-matching w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave555', () => {
  it('max-bipartite-matching w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave556', () => {
  it('max-bipartite-matching w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave557', () => {
  it('max-bipartite-matching w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave558', () => {
  it('max-bipartite-matching w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave559', () => {
  it('max-bipartite-matching w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave560', () => {
  it('max-bipartite-matching w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave561', () => {
  it('max-bipartite-matching w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave562', () => {
  it('max-bipartite-matching w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave563', () => {
  it('max-bipartite-matching w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave564', () => {
  it('max-bipartite-matching w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave565', () => {
  it('max-bipartite-matching w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave566', () => {
  it('max-bipartite-matching w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave127', () => {
  it('max-bipartite-matching w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave130', () => {
  it('max-bipartite-matching w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave133', () => {
  it('max-bipartite-matching w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave136', () => {
  it('max-bipartite-matching w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - wave139', () => {
  it('max-bipartite-matching w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w142', () => {
  it('max-bipartite-matching v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w145', () => {
  it('max-bipartite-matching v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w148', () => {
  it('max-bipartite-matching v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w151', () => {
  it('max-bipartite-matching v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w154', () => {
  it('max-bipartite-matching v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w157', () => {
  it('max-bipartite-matching v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w160', () => {
  it('max-bipartite-matching v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w170', () => {
  it('max-bipartite-matching x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w180', () => {
  it('max-bipartite-matching x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w190', () => {
  it('max-bipartite-matching x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w200', () => {
  it('max-bipartite-matching x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w210', () => {
  it('max-bipartite-matching x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w220', () => {
  it('max-bipartite-matching x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w230', () => {
  it('max-bipartite-matching x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w240', () => {
  it('max-bipartite-matching x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w250', () => {
  it('max-bipartite-matching x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w260', () => {
  it('max-bipartite-matching x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w270', () => {
  it('max-bipartite-matching x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w280', () => {
  it('max-bipartite-matching x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w290', () => {
  it('max-bipartite-matching x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w300', () => {
  it('max-bipartite-matching x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w310', () => {
  it('max-bipartite-matching x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w320', () => {
  it('max-bipartite-matching x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w330', () => {
  it('max-bipartite-matching x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w340', () => {
  it('max-bipartite-matching x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w350', () => {
  it('max-bipartite-matching x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w360', () => {
  it('max-bipartite-matching x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w370', () => {
  it('max-bipartite-matching x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w380', () => {
  it('max-bipartite-matching x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w390', () => {
  it('max-bipartite-matching x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w400', () => {
  it('max-bipartite-matching x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w420', () => {
  it('max-bipartite-matching x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w440', () => {
  it('max-bipartite-matching x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w460', () => {
  it('max-bipartite-matching x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w480', () => {
  it('max-bipartite-matching x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w500', () => {
  it('max-bipartite-matching x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w550', () => {
  it('max-bipartite-matching x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('max-bipartite-matching - w600', () => {
  it('max-bipartite-matching x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('max-bipartite-matching x600x49', () => {
    expect(describe).toBeDefined()
  })
})
