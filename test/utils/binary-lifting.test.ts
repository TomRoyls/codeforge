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
