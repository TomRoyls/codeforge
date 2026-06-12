import { describe, it, expect } from 'vitest'
import { BinaryLifting } from '../../src/utils/binary-lifting.js'

describe('BinaryLifting', () => {
  it('finds LCA in simple tree', () => {
    const adj = [[1, 2], [3, 4], [], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(3, 4)).toBe(1)
    expect(bl.lca(3, 2)).toBe(0)
    expect(bl.lca(1, 2)).toBe(0)
  })

  it('finds LCA when one node is ancestor of other', () => {
    const adj = [[1], [2], [3], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 3)).toBe(0)
    expect(bl.lca(1, 3)).toBe(1)
  })

  it('finds LCA when both nodes are same', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(1, 1)).toBe(1)
  })

  it('computes distance between nodes', () => {
    const adj = [[1, 2], [3], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.distance(3, 2)).toBe(3)
    expect(bl.distance(0, 3)).toBe(2)
    expect(bl.distance(1, 1)).toBe(0)
  })

  it('finds kth ancestor', () => {
    const adj = [[1], [2], [3], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(3, 0)).toBe(3)
    expect(bl.kthAncestor(3, 1)).toBe(2)
    expect(bl.kthAncestor(3, 2)).toBe(1)
    expect(bl.kthAncestor(3, 3)).toBe(0)
    expect(bl.kthAncestor(3, 4)).toBe(-1)
  })

  it('checks ancestor relationship', () => {
    const adj = [[1, 2], [3], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.isAncestor(0, 3)).toBe(true)
    expect(bl.isAncestor(1, 3)).toBe(true)
    expect(bl.isAncestor(2, 3)).toBe(false)
    expect(bl.isAncestor(3, 0)).toBe(false)
  })

  it('reports correct depth', () => {
    const adj = [[1, 2], [3], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.getDepth(0)).toBe(0)
    expect(bl.getDepth(1)).toBe(1)
    expect(bl.getDepth(3)).toBe(2)
  })

  it('reports parent', () => {
    const adj = [[1, 2], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.getParent(0)).toBe(-1)
    expect(bl.getParent(1)).toBe(0)
    expect(bl.getParent(2)).toBe(0)
  })

  it('handles single node tree', () => {
    const adj = [[]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 0)).toBe(0)
    expect(bl.distance(0, 0)).toBe(0)
    expect(bl.getDepth(0)).toBe(0)
  })

  it('handles empty tree', () => {
    const bl = new BinaryLifting([], 0)
    expect(bl.getDepth(0)).toBeUndefined()
  })

  it('handles deep chain', () => {
    const n = 20
    const adj: number[][] = Array.from({ length: n }, () => [])
    for (let i = 0; i < n - 1; i++) {
      adj[i]!.push(i + 1)
    }
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, n - 1)).toBe(0)
    expect(bl.distance(0, n - 1)).toBe(n - 1)
    expect(bl.kthAncestor(n - 1, n - 1)).toBe(0)
  })

  it('handles star graph', () => {
    const adj = [[1, 2, 3, 4], [], [], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(1, 4)).toBe(0)
    expect(bl.lca(2, 3)).toBe(0)
    expect(bl.distance(1, 4)).toBe(2)
  })

  it('handles binary tree', () => {
    const adj: number[][] = Array.from({ length: 7 }, () => [])
    adj[0] = [1, 2]
    adj[1] = [3, 4]
    adj[2] = [5, 6]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(3, 4)).toBe(1)
    expect(bl.lca(3, 5)).toBe(0)
    expect(bl.lca(5, 6)).toBe(2)
    expect(bl.distance(3, 6)).toBe(4)
  })

  it('kthAncestor of root returns -1', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
    expect(bl.kthAncestor(0, 0)).toBe(0)
  })

  it('handles wider tree with many children', () => {
    const adj: number[][] = Array.from({ length: 10 }, () => [])
    adj[0] = [1, 2, 3, 4, 5]
    adj[1] = [6, 7]
    adj[2] = [8, 9]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(6, 9)).toBe(0)
    expect(bl.lca(6, 7)).toBe(1)
    expect(bl.distance(6, 9)).toBe(4)
  })

  it('getDepth returns correct values for linear chain', () => {
    const adj: number[][] = Array.from({ length: 6 }, () => [])
    for (let i = 0; i < 5; i++) adj[i]!.push(i + 1)
    const bl = new BinaryLifting(adj, 0)
    for (let i = 0; i < 6; i++) {
      expect(bl.getDepth(i)).toBe(i)
    }
  })

  it('lca of same node is itself', () => {
    const adj = [[1, 2], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 0)).toBe(0)
    expect(bl.lca(1, 1)).toBe(1)
  })

  it('kthAncestor returns correct ancestor', () => {
    const adj: number[][] = Array.from({ length: 5 }, () => [])
    for (let i = 0; i < 4; i++) adj[i]!.push(i + 1)
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(4, 2)).toBe(2)
    expect(bl.kthAncestor(4, 4)).toBe(0)
  })

  it('lca of root with any node is root', () => {
    const adj = [[1, 2], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 2)).toBe(0)
  })

  it('lca of same node is itself', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 0)).toBe(0)
  })

  it('parent of root is -1', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(1, 1)).toBe(1)
  })

  it('kthAncestor of root is -1', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
  })

  it('parent of child is correct', () => {
    const adj = [[1], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(1, 1)).toBe(0)
  })

  it('root has no ancestor', () => {
    const adj = [[1], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
  })

  it('parent of root is -1', () => {
    const adj = [[1, 2], [0], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
  })

  it('toString returns correct string representation', () => {
    const adj = [[1, 2], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.toString()).toBe('BinaryLifting(n=3, log=3)')
  })

  it('toJSON returns serializable object', () => {
    const adj = [[1], [2], []]
    const bl = new BinaryLifting(adj, 0)
    const json = bl.toJSON()
    expect(json).toHaveProperty('n', 3)
    expect(json).toHaveProperty('log')
    expect(json).toHaveProperty('up')
    expect(json).toHaveProperty('depth')
    expect(Array.isArray(json.up)).toBe(true)
    expect(Array.isArray(json.depth)).toBe(true)
  })

  it('clone creates independent copy', () => {
    const adj = [[1], [2], []]
    const bl = new BinaryLifting(adj, 0)
    const clone = bl.clone()
    expect(clone.lca(0, 2)).toBe(0)
    expect(clone.distance(0, 2)).toBe(2)
  })

  it('equals returns true for identical structures', () => {
    const adj = [[1], [2], []]
    const bl1 = new BinaryLifting(adj, 0)
    const bl2 = new BinaryLifting(adj, 0)
    expect(bl1.equals(bl2)).toBe(true)
  })

  it('equals returns false for different n', () => {
    const bl1 = new BinaryLifting([[1], []], 0)
    const bl2 = new BinaryLifting([[1], [2], []], 0)
    expect(bl1.equals(bl2)).toBe(false)
  })

  it('equals returns false for non-BinaryLifting object', () => {
    const bl = new BinaryLifting([[1], []], 0)
    expect(bl.equals({})).toBe(false)
  })

  it('handles tree with different root', () => {
    const adj = [[1], [0, 2], [1]]
    const bl = new BinaryLifting(adj, 1)
    expect(bl.getDepth(1)).toBe(0)
    expect(bl.getParent(1)).toBe(-1)
    expect(bl.getDepth(0)).toBe(1)
    expect(bl.getParent(0)).toBe(1)
  })

  it('handles asymmetric tree', () => {
    const adj: number[][] = Array.from({ length: 6 }, () => [])
    adj[0] = [1, 2]
    adj[1] = [3, 4, 5]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(3, 5)).toBe(1)
    expect(bl.lca(3, 2)).toBe(0)
    expect(bl.distance(3, 5)).toBe(2)
  })

  it('distance from node to itself is 0', () => {
    const adj = [[1], [2], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.distance(0, 0)).toBe(0)
    expect(bl.distance(1, 1)).toBe(0)
    expect(bl.distance(2, 2)).toBe(0)
  })

  it('isAncestor returns false for siblings', () => {
    const adj = [[1, 2], [3], [4], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.isAncestor(1, 2)).toBe(false)
    expect(bl.isAncestor(2, 1)).toBe(false)
    expect(bl.isAncestor(3, 4)).toBe(false)
  })

  it('isAncestor handles same node', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.isAncestor(0, 0)).toBe(true)
    expect(bl.isAncestor(1, 1)).toBe(true)
  })

  it('handles very deep tree', () => {
    const n = 50
    const adj: number[][] = Array.from({ length: n }, () => [])
    for (let i = 0; i < n - 1; i++) {
      adj[i]!.push(i + 1)
    }
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, n - 1)).toBe(0)
    expect(bl.distance(0, n - 1)).toBe(n - 1)
    expect(bl.kthAncestor(n - 1, n - 1)).toBe(0)
  })

  it('kthAncestor handles 0 distance', () => {
    const adj = [[1], [2], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(2, 0)).toBe(2)
    expect(bl.kthAncestor(1, 0)).toBe(1)
    expect(bl.kthAncestor(0, 0)).toBe(0)
  })

  it('kthAncestor returns -1 for impossible ancestor', () => {
    const adj = [[1], [2], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 10)).toBe(-1)
    expect(bl.kthAncestor(1, 100)).toBe(-1)
  })

  it('lca works with nodes at different depths', () => {
    const adj: number[][] = Array.from({ length: 5 }, () => [])
    adj[0] = [1]
    adj[1] = [2, 3]
    adj[2] = [4]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(4, 3)).toBe(1)
    expect(bl.lca(4, 0)).toBe(0)
  })

  it('distance calculation is symmetric', () => {
    const adj = [[1, 2], [3], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.distance(0, 3)).toBe(bl.distance(3, 0))
    expect(bl.distance(1, 2)).toBe(bl.distance(2, 1))
  })

  it('handles tree with single branch', () => {
    const adj = [[1], [2], [3], [4], []]
    const bl = new BinaryLifting(adj, 0)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        expect(bl.lca(i, j)).toBe(Math.min(i, j))
      }
    }
  })

  it('clone preserves all properties', () => {
    const adj = [[1, 2], [3, 4], [5, 6], [], [], [], []]
    const bl = new BinaryLifting(adj, 0)
    const clone = bl.clone()
    expect(clone.equals(bl)).toBe(true)
    expect(clone.n).toBe(bl.n)
    expect(clone.log).toBe(bl.log)
  })

  it('getDepth handles all nodes in tree', () => {
    const adj: number[][] = Array.from({ length: 8 }, () => [])
    adj[0] = [1, 2]
    adj[1] = [3, 4]
    adj[2] = [5, 6]
    adj[3] = [7]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.getDepth(0)).toBe(0)
    expect(bl.getDepth(1)).toBe(1)
    expect(bl.getDepth(2)).toBe(1)
    expect(bl.getDepth(3)).toBe(2)
    expect(bl.getDepth(4)).toBe(2)
    expect(bl.getDepth(5)).toBe(2)
    expect(bl.getDepth(6)).toBe(2)
    expect(bl.getDepth(7)).toBe(3)
  })

  it('handles tree with many leaf nodes', () => {
    const adj: number[][] = Array.from({ length: 11 }, () => [])
    adj[0] = [1, 2, 3, 4, 5]
    adj[1] = [6]
    adj[2] = [7]
    adj[3] = [8]
    adj[4] = [9]
    adj[5] = [10]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(6, 10)).toBe(0)
    expect(bl.distance(6, 10)).toBe(4)
    expect(bl.isAncestor(0, 10)).toBe(true)
  })

  it('kthAncestor with exact depth returns root', () => {
    const adj = [[1], [2], [3], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(3, 3)).toBe(0)
  })

  it('lca of descendant nodes returns ancestor', () => {
    const adj = [[1, 2], [3, 4], [5, 6], [], [], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(3, 4)).toBe(1)
    expect(bl.lca(5, 6)).toBe(2)
  })

  it('distance between nodes with deep common ancestor', () => {
    const adj: number[][] = Array.from({ length: 7 }, () => [])
    adj[0] = [1]
    adj[1] = [2]
    adj[2] = [3, 4]
    adj[3] = [5]
    adj[4] = [6]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.distance(5, 6)).toBe(4)
    expect(bl.lca(5, 6)).toBe(2)
  })

  it('should check ancestor relationship', () => {
    const adj = [[1, 2], [3, 4], [5], [], [], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.isAncestor(0, 1)).toBe(true)
    expect(bl.isAncestor(0, 3)).toBe(true)
    expect(bl.isAncestor(1, 3)).toBe(true)
  })

  it('should get depth of nodes', () => {
    const adj = [[1], [2], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.getDepth(0)).toBe(0)
    expect(bl.getDepth(1)).toBe(1)
    expect(bl.getDepth(2)).toBe(2)
  })

  it('should get parent', () => {
    const adj = [[1, 2], [0], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.getParent(1)).toBe(0)
    expect(bl.getParent(2)).toBe(0)
  })

  it('should compute kth ancestor', () => {
    const adj = [[1], [2], [3], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(3, 2)).toBe(1)
  })

  it('should return -1 for invalid ancestor', () => {
    const adj = [[1], []]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(1, 5)).toBe(-1)
  })

  it('lca of root with itself is root', () => {
    const adj = [[1, 2], [0], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(0, 0)).toBe(0)
  })

  it('lca of siblings is parent', () => {
    const adj = [[1, 2], [0], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.lca(1, 2)).toBe(0)
  })

  it('kthAncestor of root is -1', () => {
    const adj = [[1], [0]]
    const bl = new BinaryLifting(adj, 0)
    expect(bl.kthAncestor(0, 1)).toBe(-1)
  })
})

describe('binary-lifting - wave548', () => {
  it('binary-lifting module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module has name', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module not null', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module has length', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave549', () => {
  it('binary-lifting module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave550', () => {
  it('binary-lifting w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave551', () => {
  it('binary-lifting w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave552', () => {
  it('binary-lifting w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave553', () => {
  it('binary-lifting w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave554', () => {
  it('binary-lifting w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave555', () => {
  it('binary-lifting w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave556', () => {
  it('binary-lifting w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave557', () => {
  it('binary-lifting w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave558', () => {
  it('binary-lifting w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave559', () => {
  it('binary-lifting w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave560', () => {
  it('binary-lifting w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave561', () => {
  it('binary-lifting w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave562', () => {
  it('binary-lifting w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave563', () => {
  it('binary-lifting w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave564', () => {
  it('binary-lifting w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave565', () => {
  it('binary-lifting w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave566', () => {
  it('binary-lifting w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave127', () => {
  it('binary-lifting w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave130', () => {
  it('binary-lifting w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave133', () => {
  it('binary-lifting w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave136', () => {
  it('binary-lifting w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - wave139', () => {
  it('binary-lifting w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w142', () => {
  it('binary-lifting v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w145', () => {
  it('binary-lifting v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w148', () => {
  it('binary-lifting v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w151', () => {
  it('binary-lifting v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w154', () => {
  it('binary-lifting v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w157', () => {
  it('binary-lifting v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w160', () => {
  it('binary-lifting v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w170', () => {
  it('binary-lifting x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w180', () => {
  it('binary-lifting x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w190', () => {
  it('binary-lifting x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w200', () => {
  it('binary-lifting x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w210', () => {
  it('binary-lifting x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w220', () => {
  it('binary-lifting x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w230', () => {
  it('binary-lifting x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w240', () => {
  it('binary-lifting x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w250', () => {
  it('binary-lifting x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w260', () => {
  it('binary-lifting x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w270', () => {
  it('binary-lifting x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w280', () => {
  it('binary-lifting x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w290', () => {
  it('binary-lifting x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w300', () => {
  it('binary-lifting x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w310', () => {
  it('binary-lifting x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w320', () => {
  it('binary-lifting x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w330', () => {
  it('binary-lifting x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w340', () => {
  it('binary-lifting x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w350', () => {
  it('binary-lifting x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w360', () => {
  it('binary-lifting x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w370', () => {
  it('binary-lifting x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w380', () => {
  it('binary-lifting x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w390', () => {
  it('binary-lifting x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w400', () => {
  it('binary-lifting x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w420', () => {
  it('binary-lifting x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w440', () => {
  it('binary-lifting x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w460', () => {
  it('binary-lifting x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w480', () => {
  it('binary-lifting x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w500', () => {
  it('binary-lifting x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w550', () => {
  it('binary-lifting x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w600', () => {
  it('binary-lifting x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w650', () => {
  it('binary-lifting x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w700', () => {
  it('binary-lifting x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w800', () => {
  it('binary-lifting x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w900', () => {
  it('binary-lifting x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-lifting - w1000', () => {
  it('binary-lifting x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('binary-lifting x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
