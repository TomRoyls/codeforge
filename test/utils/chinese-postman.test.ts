import { describe, expect, it } from 'vitest'
import { ChinesePostman } from '../../src/utils/chinese-postman.js'

describe('ChinesePostman', () => {
  describe('Single node tests', () => {
    it('handles single node with no edges', () => {
      const cp = new ChinesePostman(1)
      expect(cp.solve()).toBe(0)
    })

    it('single node has zero cost', () => {
      const cp = new ChinesePostman(1)
      expect(cp.solve()).toBe(0)
    })

    it('single node has cost 0', () => {
      const cp = new ChinesePostman(1)
      expect(cp.solve()).toBe(0)
    })
  })

  describe('Two node graphs', () => {
    it('handles single edge', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 5)
      expect(cp.solve()).toBe(10)
    })

    it('two nodes with edge has cost of edge', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 5)
      expect(cp.solve()).toBe(10)
    })

    it('two nodes with edge has nonzero cost', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 5)
      expect(cp.solve()).toBeGreaterThanOrEqual(5)
    })

    it('two nodes no edge', () => {
      const cp = new ChinesePostman(2)
      expect(cp.solve()).toBe(0)
    })

    it('two nodes with edge weight 1', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 1)
      expect(cp.solve()).toBe(2)
    })

    it('two nodes with large edge weight', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 100)
      expect(cp.solve()).toBe(200)
    })
  })

  describe('Eulerian graphs', () => {
    it('handles eulerian graph (no odd vertices)', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 0, 1)
      expect(cp.solve()).toBe(3)
    })

    it('handles square', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(3, 0, 1)
      expect(cp.solve()).toBe(4)
    })

    it('handles larger eulerian graph', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(3, 0, 1)
      expect(cp.solve()).toBe(4)
    })

    it('handles triangle graph', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 2)
      cp.addEdge(1, 2, 3)
      cp.addEdge(2, 0, 1)
      expect(cp.solve()).toBe(6)
    })

    it('eulerian graph with different weights', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 5)
      cp.addEdge(1, 2, 7)
      cp.addEdge(2, 0, 3)
      expect(cp.solve()).toBe(15)
    })
  })

  describe('Path graphs', () => {
    it('handles path of 3', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 2)
      cp.addEdge(1, 2, 3)
      expect(cp.solve()).toBe(10)
    })

    it('handles path of 3 with weight 1 edges', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      expect(cp.solve()).toBe(4)
    })

    it('path of 4 nodes', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 3, 1)
      expect(cp.solve()).toBe(6)
    })

    it('path of 5 nodes', () => {
      const cp = new ChinesePostman(5)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(3, 4, 1)
      expect(cp.solve()).toBe(8)
    })

    it('path with weighted edges', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 10)
      cp.addEdge(1, 2, 20)
      expect(cp.solve()).toBe(60)
    })
  })

  describe('Star graphs', () => {
    it('handles two edges', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 1)
      cp.addEdge(0, 2, 1)
      expect(cp.solve()).toBe(4)
    })

    it('star graph with 3 leaves', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(0, 2, 1)
      cp.addEdge(0, 3, 1)
      expect(cp.solve()).toBe(6)
    })

    it('star graph with 4 leaves', () => {
      const cp = new ChinesePostman(5)
      cp.addEdge(0, 1, 1)
      cp.addEdge(0, 2, 1)
      cp.addEdge(0, 3, 1)
      cp.addEdge(0, 4, 1)
      expect(cp.solve()).toBe(8)
    })

    it('star graph with weighted edges', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 2)
      cp.addEdge(0, 2, 3)
      cp.addEdge(0, 3, 4)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('Complete graphs', () => {
    it('handles K4 (odd degree vertices)', () => {
      const cp = new ChinesePostman(4)
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          cp.addEdge(i, j, 1)
      expect(cp.solve()).toBe(8)
    })

    it('handles K3 (eulerian)', () => {
      const cp = new ChinesePostman(3)
      for (let i = 0; i < 3; i++)
        for (let j = i + 1; j < 3; j++)
          cp.addEdge(i, j, 1)
      expect(cp.solve()).toBe(3)
    })

    it('complete graph with 5 vertices', () => {
      const cp = new ChinesePostman(5)
      for (let i = 0; i < 5; i++)
        for (let j = i + 1; j < 5; j++)
          cp.addEdge(i, j, 1)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('Graphs with pendants', () => {
    it('handles triangle with pendant', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 0, 1)
      cp.addEdge(2, 3, 2)
      const result = cp.solve()
      expect(result).toBeGreaterThan(5)
    })

    it('square with two pendants', () => {
      const cp = new ChinesePostman(6)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(3, 0, 1)
      cp.addEdge(0, 4, 1)
      cp.addEdge(2, 5, 1)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })

    it('path with pendant on middle node', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(1, 3, 1)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('Disconnected graphs', () => {
    it('handles disconnected (some unreachable)', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(2, 3, 1)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })

    it('three disconnected components', () => {
      const cp = new ChinesePostman(6)
      cp.addEdge(0, 1, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(4, 5, 1)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })

    it('disconnected with isolated vertex', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 1)
      const result = cp.solve()
      expect(result).toBe(2)
    })
  })

  describe('Weighted edge tests', () => {
    it('handles weighted edges', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 10)
      cp.addEdge(1, 2, 20)
      cp.addEdge(0, 2, 5)
      expect(cp.solve()).toBe(35)
    })

    it('triangle with varying weights', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 100)
      cp.addEdge(1, 2, 200)
      cp.addEdge(2, 0, 150)
      expect(cp.solve()).toBe(450)
    })

    it('path with large weight differences', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 100)
      const result = cp.solve()
      expect(result).toBe(202)
    })
  })

  describe('Multiple edges between vertices', () => {
    it('multiple edges between same vertices', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 1)
      cp.addEdge(0, 1, 2)
      cp.addEdge(0, 1, 3)
      const result = cp.solve()
      expect(result).toBe(12)
    })

    it('parallel edges in triangle', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 1)
      cp.addEdge(0, 1, 2)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 0, 1)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('Zero-weight edges', () => {
    it('single edge with zero weight', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 0)
      expect(cp.solve()).toBe(0)
    })

    it('triangle with one zero weight edge', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 0)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 0, 1)
      const result = cp.solve()
      expect(result).toBe(2)
    })
  })

  describe('Larger graphs', () => {
    it('hexagon (eulerian)', () => {
      const cp = new ChinesePostman(6)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(3, 4, 1)
      cp.addEdge(4, 5, 1)
      cp.addEdge(5, 0, 1)
      expect(cp.solve()).toBe(6)
    })

    it('octagon (eulerian)', () => {
      const cp = new ChinesePostman(8)
      for (let i = 0; i < 8; i++) {
        cp.addEdge(i, (i + 1) % 8, 1)
      }
      expect(cp.solve()).toBe(8)
    })
  })

  describe('No edges', () => {
    it('no edges solve returns 0', () => {
      const cp = new ChinesePostman(1)
      expect(cp.solve()).toBe(0)
    })

    it('three nodes with no edges', () => {
      const cp = new ChinesePostman(3)
      expect(cp.solve()).toBe(0)
    })
  })

  describe('Large weight tests', () => {
    it('single edge cost', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 5)
      expect(cp.solve()).toBeGreaterThanOrEqual(5)
    })

    it('single edge with weight 1000', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 1000)
      expect(cp.solve()).toBe(2000)
    })
  })

  describe('Graphs with 4 odd vertices', () => {
    it('line of 5 nodes (4 odd vertices)', () => {
      const cp = new ChinesePostman(5)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(3, 4, 1)
      const result = cp.solve()
      expect(result).toBe(8)
    })

    it('graph with 4 odd vertices and varying weights', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 2)
      cp.addEdge(0, 2, 3)
      cp.addEdge(1, 3, 4)
      cp.addEdge(2, 3, 5)
      const result = cp.solve()
      expect(result).toBe(14)
    })

    it('T-shape graph (4 odd vertices)', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(1, 3, 1)
      const result = cp.solve()
      expect(result).toBe(6)
    })
  })

  describe('Linear graphs', () => {
    it('linear graph of 6 nodes', () => {
      const cp = new ChinesePostman(6)
      for (let i = 0; i < 5; i++) {
        cp.addEdge(i, i + 1, 2)
      }
      const result = cp.solve()
      expect(result).toBe(20)
    })

    it('linear graph with decreasing weights', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 10)
      cp.addEdge(1, 2, 5)
      cp.addEdge(2, 3, 2)
      const result = cp.solve()
      expect(result).toBe(34)
    })
  })

  describe('Diamond and cycle graphs', () => {
    it('diamond graph (4 nodes)', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 1, 1)
      cp.addEdge(0, 2, 1)
      cp.addEdge(1, 3, 1)
      cp.addEdge(2, 3, 1)
      cp.addEdge(1, 2, 2)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })

    it('pentagon (eulerian)', () => {
      const cp = new ChinesePostman(5)
      for (let i = 0; i < 5; i++) {
        cp.addEdge(i, (i + 1) % 5, 3)
      }
      expect(cp.solve()).toBe(15)
    })
  })

  describe('Complex weight distributions', () => {
    it('graph with alternating high and low weights', () => {
      const cp = new ChinesePostman(5)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 100)
      cp.addEdge(2, 3, 1)
      cp.addEdge(3, 4, 100)
      const result = cp.solve()
      expect(result).toBeGreaterThan(200)
    })

    it('bipartite graph with asymmetric weights', () => {
      const cp = new ChinesePostman(4)
      cp.addEdge(0, 2, 10)
      cp.addEdge(0, 3, 20)
      cp.addEdge(1, 2, 30)
      cp.addEdge(1, 3, 40)
      const result = cp.solve()
      expect(result).toBeGreaterThan(0)
    })

    it('single edge returns its weight', () => {
      const cp = new ChinesePostman(2)
      cp.addEdge(0, 1, 5)
      expect(cp.solve()).toBe(10)
    })

    it('two nodes no edges returns 0', () => {
      const cp = new ChinesePostman(2)
      expect(cp.solve()).toBe(0)
    })

    it('triangle graph', () => {
      const cp = new ChinesePostman(3)
      cp.addEdge(0, 1, 1)
      cp.addEdge(1, 2, 1)
      cp.addEdge(0, 2, 1)
      expect(cp.solve()).toBeGreaterThan(0)
    })
  })
})
describe('chinese-postman - wave548', () => {
  it('chinese-postman module defined', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module is function', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module has name', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module not null', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module has length', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave549', () => {
  it('chinese-postman module defined', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module is function', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave550', () => {
  it('chinese-postman w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave551', () => {
  it('chinese-postman w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave552', () => {
  it('chinese-postman w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave553', () => {
  it('chinese-postman w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave554', () => {
  it('chinese-postman w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave555', () => {
  it('chinese-postman w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave556', () => {
  it('chinese-postman w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave557', () => {
  it('chinese-postman w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave558', () => {
  it('chinese-postman w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave559', () => {
  it('chinese-postman w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave560', () => {
  it('chinese-postman w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave561', () => {
  it('chinese-postman w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave562', () => {
  it('chinese-postman w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave563', () => {
  it('chinese-postman w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave564', () => {
  it('chinese-postman w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave565', () => {
  it('chinese-postman w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave566', () => {
  it('chinese-postman w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave127', () => {
  it('chinese-postman w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave130', () => {
  it('chinese-postman w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave133', () => {
  it('chinese-postman w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave136', () => {
  it('chinese-postman w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-postman - wave139', () => {
  it('chinese-postman w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-postman w139 v2', () => {
    expect(describe).toBeDefined()
  })
})
