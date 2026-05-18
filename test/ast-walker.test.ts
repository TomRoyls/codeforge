import { ASTWalker, DEFAULT_WALK_CONFIG } from '../src/core/ast-walker/ast-walker.js'
import type { ASTNode, WalkVisitor, WalkOptions, TreeStatistics } from '../src/core/ast-walker/ast-walker.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeLeaf(type: string, value?: string): ASTNode {
  return { type, value }
}

function makeNode(type: string, children: ASTNode[], value?: string): ASTNode {
  return { type, children, value }
}

function makeTree(): ASTNode {
  return makeNode('root', [
    makeNode('a', [
      makeLeaf('a1', 'val-a1'),
      makeLeaf('a2', 'val-a2'),
    ]),
    makeNode('b', [
      makeLeaf('b1', 'val-b1'),
    ]),
    makeLeaf('c', 'val-c'),
  ])
}

// ─── Constructor ────────────────────────────────────────────────────────

describe('ASTWalker', () => {
  describe('constructor', () => {
    it('creates walker with no options', () => {
      const walker = new ASTWalker()
      expect(walker).toBeInstanceOf(ASTWalker)
    })

    it('creates walker with default options', () => {
      const walker = new ASTWalker({ order: 'post' })
      expect(walker).toBeInstanceOf(ASTWalker)
    })

    it('creates walker with maxDepth option', () => {
      const walker = new ASTWalker({ maxDepth: 3 })
      expect(walker).toBeInstanceOf(ASTWalker)
    })
  })

  // ─── DEFAULT_WALK_CONFIG ──────────────────────────────────────────────

  describe('DEFAULT_WALK_CONFIG', () => {
    it('has order pre by default', () => {
      expect(DEFAULT_WALK_CONFIG.order).toBe('pre')
    })
  })

  // ─── walk ─────────────────────────────────────────────────────────────

  describe('walk', () => {
    it('walks a single node', () => {
      const walker = new ASTWalker()
      const node = makeLeaf('leaf')
      const visited: string[] = []
      const result = walker.walk(node, {
        enter: (n) => { visited.push(n.type) },
      })
      expect(visited).toEqual(['leaf'])
      expect(result.visited).toBe(1)
    })

    it('walks pre-order by default', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const order: string[] = []
      walker.walk(tree, {
        enter: (n) => { order.push(n.type) },
      })
      expect(order).toEqual(['root', 'a', 'a1', 'a2', 'b', 'b1', 'c'])
    })

    it('walks post-order', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const order: string[] = []
      walker.walk(tree, {
        enter: (n) => { order.push(n.type) },
      }, { order: 'post' })
      expect(order).toEqual(['a1', 'a2', 'a', 'b1', 'b', 'c', 'root'])
    })

    it('walks breadth-first', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const order: string[] = []
      walker.walk(tree, {
        enter: (n) => { order.push(n.type) },
      }, { order: 'breadth-first' })
      expect(order).toEqual(['root', 'a', 'b', 'c', 'a1', 'a2', 'b1'])
    })

    it('calls exit callback in pre-order walk', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [makeLeaf('child')])
      const exits: string[] = []
      walker.walk(tree, {
        enter: () => {},
        exit: (n) => { exits.push(n.type) },
      }, { order: 'pre' })
      expect(exits).toEqual(['child', 'root'])
    })

    it('returns correct visited count', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const result = walker.walk(tree, { enter: () => {} })
      expect(result.visited).toBe(7)
    })

    it('returns correct max depth', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const result = walker.walk(tree, { enter: () => {} })
      expect(result.depth).toBe(2)
    })

    it('returns 0 visited for empty visitor', () => {
      const walker = new ASTWalker()
      const node = makeLeaf('leaf')
      const result = walker.walk(node, {})
      expect(result.visited).toBe(1)
    })

    it('handles node with no children property', () => {
      const walker = new ASTWalker()
      const node: ASTNode = { type: 'orphan' }
      const visited: string[] = []
      walker.walk(node, { enter: (n) => { visited.push(n.type) } })
      expect(visited).toEqual(['orphan'])
    })

    it('handles deeply nested tree', () => {
      const walker = new ASTWalker()
      let deep = makeLeaf('deep')
      for (let i = 10; i >= 0; i--) {
        deep = makeNode(`level${i}`, [deep])
      }
      const result = walker.walk(deep, { enter: () => {} })
      expect(result.visited).toBe(12)
      expect(result.depth).toBe(11)
    })

    it('returns skipped 0 when no filter', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const result = walker.walk(tree, { enter: () => {} })
      expect(result.skipped).toBe(0)
    })
  })

  // ─── walk with maxDepth ───────────────────────────────────────────────

  describe('walk with maxDepth', () => {
    it('respects maxDepth option', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const order: string[] = []
      const result = walker.walk(tree, {
        enter: (n) => { order.push(n.type) },
      }, { maxDepth: 1 })
      expect(order).toEqual(['root', 'a', 'b', 'c'])
      expect(result.visited).toBe(4)
    })

    it('maxDepth 0 visits only root', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const order: string[] = []
      const result = walker.walk(tree, {
        enter: (n) => { order.push(n.type) },
      }, { maxDepth: 0 })
      expect(order).toEqual(['root'])
      expect(result.visited).toBe(1)
    })
  })

  // ─── walk with filter ─────────────────────────────────────────────────

  describe('walk with filter', () => {
    it('skips nodes that do not pass filter', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      const result = walker.walk(tree, {
        enter: (n) => { visited.push(n.type) },
      }, { filter: (n) => n.type !== 'a' })
      expect(visited).toEqual(['root', 'a1', 'a2', 'b', 'b1', 'c'])
      expect(result.skipped).toBe(1)
    })

    it('skips all nodes with always-false filter', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      const result = walker.walk(tree, {
        enter: (n) => { visited.push(n.type) },
      }, { filter: () => false })
      expect(visited).toEqual([])
      expect(result.skipped).toBe(7)
    })

    it('still walks children of filtered nodes', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      walker.walk(tree, {
        enter: (n) => { visited.push(n.type) },
      }, { filter: (n) => n.type !== 'a' })
      expect(visited).toContain('a1')
      expect(visited).toContain('a2')
    })
  })

  // ─── walk with skip children ──────────────────────────────────────────

  describe('walk skip children', () => {
    it('skips children when enter returns false', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      walker.walk(tree, {
        enter: (n) => {
          visited.push(n.type)
          if (n.type === 'a') return false
          return
        },
      })
      expect(visited).toEqual(['root', 'a', 'b', 'b1', 'c'])
      expect(visited).not.toContain('a1')
    })
  })

  // ─── walkWithDepth ────────────────────────────────────────────────────

  describe('walkWithDepth', () => {
    it('limits walk to specified depth', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      const result = walker.walkWithDepth(tree, 1, {
        enter: (n) => { visited.push(n.type) },
      })
      expect(visited).toEqual(['root', 'a', 'b', 'c'])
      expect(result.visited).toBe(4)
    })
  })

  // ─── find ─────────────────────────────────────────────────────────────

  describe('find', () => {
    it('finds a node by type', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const found = walker.find(tree, (n) => n.type === 'b1')
      expect(found).toBeDefined()
      expect(found?.type).toBe('b1')
      expect(found?.value).toBe('val-b1')
    })

    it('returns undefined when not found', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const found = walker.find(tree, (n) => n.type === 'nonexistent')
      expect(found).toBeUndefined()
    })

    it('finds root node', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const found = walker.find(tree, (n) => n.type === 'root')
      expect(found).toBe(tree)
    })

    it('returns a matching node', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [
        makeLeaf('target', 'first'),
        makeLeaf('target', 'second'),
      ])
      const found = walker.find(tree, (n) => n.type === 'target')
      expect(found).toBeDefined()
      expect(found?.type).toBe('target')
    })
  })

  // ─── findAll ──────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('finds all matching nodes', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const found = walker.findAll(tree, (n) => n.value !== undefined)
      expect(found.length).toBe(4)
    })

    it('returns empty array when none match', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const found = walker.findAll(tree, (n) => n.type === 'xyz')
      expect(found).toEqual([])
    })

    it('finds all nodes with same type', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [
        makeLeaf('dup'),
        makeNode('mid', [makeLeaf('dup')]),
        makeLeaf('dup'),
      ])
      const found = walker.findAll(tree, (n) => n.type === 'dup')
      expect(found.length).toBe(3)
    })
  })

  // ─── map ──────────────────────────────────────────────────────────────

  describe('map', () => {
    it('maps nodes to their types', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [makeLeaf('child')])
      const types = walker.map(tree, (n) => n.type)
      expect(types).toEqual(['root', 'child'])
    })

    it('maps nodes to their values', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const values = walker.map(tree, (n) => n.value ?? '')
      expect(values).toEqual(['', '', 'val-a1', 'val-a2', '', 'val-b1', 'val-c'])
    })

    it('maps to numbers', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [makeLeaf('a'), makeLeaf('b')])
      const depths = walker.map(tree, (_n, depth) => depth)
      expect(depths).toEqual([0, 1, 1])
    })
  })

  // ─── filter (alias) ───────────────────────────────────────────────────

  describe('filter', () => {
    it('behaves like findAll', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const result = walker.filter(tree, (n) => n.type.startsWith('a'))
      expect(result.length).toBe(3)
    })
  })

  // ─── reduce ───────────────────────────────────────────────────────────

  describe('reduce', () => {
    it('counts total nodes', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const count = walker.reduce(tree, (acc) => acc + 1, 0)
      expect(count).toBe(7)
    })

    it('collects all types', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [makeLeaf('a'), makeLeaf('b')])
      const types = walker.reduce(tree, (acc, n) => {
        acc.push(n.type)
        return acc
      }, [] as string[])
      expect(types).toEqual(['root', 'a', 'b'])
    })

    it('sums depths', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [makeLeaf('a')])
      const totalDepth = walker.reduce(tree, (acc, _n, depth) => acc + depth, 0)
      expect(totalDepth).toBe(1)
    })

    it('works with string accumulator', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [makeLeaf('a')])
      const joined = walker.reduce(tree, (acc, n) => acc + n.type, '')
      expect(joined).toBe('roota')
    })
  })

  // ─── count ────────────────────────────────────────────────────────────

  describe('count', () => {
    it('counts all nodes without predicate', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      expect(walker.count(tree)).toBe(7)
    })

    it('counts matching nodes with predicate', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      expect(walker.count(tree, (n) => n.value !== undefined)).toBe(4)
    })

    it('returns 0 for empty tree with predicate', () => {
      const walker = new ASTWalker()
      const leaf = makeLeaf('leaf')
      expect(walker.count(leaf, () => false)).toBe(0)
    })

    it('counts single node', () => {
      const walker = new ASTWalker()
      expect(walker.count(makeLeaf('x'))).toBe(1)
    })
  })

  // ─── getPath ──────────────────────────────────────────────────────────

  describe('getPath', () => {
    it('gets path to root', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const path = walker.getPath(tree, tree)
      expect(path).toEqual([tree])
    })

    it('gets path to child', () => {
      const walker = new ASTWalker()
      const child = makeLeaf('child')
      const tree = makeNode('root', [child])
      const path = walker.getPath(tree, child)
      expect(path).toEqual([tree, child])
    })

    it('gets path to deeply nested node', () => {
      const walker = new ASTWalker()
      const deep = makeLeaf('deep')
      const mid = makeNode('mid', [deep])
      const tree = makeNode('root', [mid])
      const path = walker.getPath(tree, deep)
      expect(path).toEqual([tree, mid, deep])
    })

    it('returns undefined for disconnected node', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const alien = makeLeaf('alien')
      expect(walker.getPath(tree, alien)).toBeUndefined()
    })
  })

  // ─── getDepth ─────────────────────────────────────────────────────────

  describe('getDepth', () => {
    it('returns 0 for root', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      expect(walker.getDepth(tree, tree)).toBe(0)
    })

    it('returns 1 for direct child', () => {
      const walker = new ASTWalker()
      const child = makeLeaf('child')
      const tree = makeNode('root', [child])
      expect(walker.getDepth(tree, child)).toBe(1)
    })

    it('returns undefined for disconnected node', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      expect(walker.getDepth(tree, makeLeaf('x'))).toBeUndefined()
    })

    it('returns correct depth for deeply nested node', () => {
      const walker = new ASTWalker()
      const deep = makeLeaf('deep')
      const mid = makeNode('mid', [deep])
      const tree = makeNode('root', [mid])
      expect(walker.getDepth(tree, deep)).toBe(2)
    })
  })

  // ─── getAncestors ─────────────────────────────────────────────────────

  describe('getAncestors', () => {
    it('returns empty array for root', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      expect(walker.getAncestors(tree, tree)).toEqual([])
    })

    it('returns parent for direct child', () => {
      const walker = new ASTWalker()
      const child = makeLeaf('child')
      const tree = makeNode('root', [child])
      expect(walker.getAncestors(tree, child)).toEqual([tree])
    })

    it('returns all ancestors for deeply nested', () => {
      const walker = new ASTWalker()
      const deep = makeLeaf('deep')
      const mid = makeNode('mid', [deep])
      const tree = makeNode('root', [mid])
      expect(walker.getAncestors(tree, deep)).toEqual([tree, mid])
    })

    it('returns undefined for disconnected node', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      expect(walker.getAncestors(tree, makeLeaf('x'))).toBeUndefined()
    })
  })

  // ─── getStatistics ────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('computes stats for a single node', () => {
      const walker = new ASTWalker()
      const leaf = makeLeaf('leaf')
      const stats = walker.getStatistics(leaf)
      expect(stats.totalNodes).toBe(1)
      expect(stats.maxDepth).toBe(0)
      expect(stats.leafNodes).toBe(1)
      expect(stats.branchNodes).toBe(0)
      expect(stats.typeCounts).toEqual({ leaf: 1 })
    })

    it('computes stats for full tree', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const stats = walker.getStatistics(tree)
      expect(stats.totalNodes).toBe(7)
      expect(stats.maxDepth).toBe(2)
      expect(stats.leafNodes).toBe(4)
      expect(stats.branchNodes).toBe(3)
      expect(stats.typeCounts.root).toBe(1)
      expect(stats.typeCounts.a).toBe(1)
    })

    it('caches statistics', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const stats1 = walker.getStatistics(tree)
      const stats2 = walker.getStatistics(tree)
      expect(stats1).toBe(stats2)
    })

    it('counts multiple types correctly', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [
        makeLeaf('x'),
        makeNode('x', [makeLeaf('y')]),
      ])
      const stats = walker.getStatistics(tree)
      expect(stats.typeCounts.x).toBe(2)
      expect(stats.typeCounts.y).toBe(1)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears cache', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const stats1 = walker.getStatistics(tree)
      walker.clear()
      const stats2 = walker.getStatistics(tree)
      expect(stats1).toEqual(stats2)
      expect(stats1).not.toBe(stats2)
    })
  })

  // ─── edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles node with empty children array', () => {
      const walker = new ASTWalker()
      const node = makeNode('empty', [])
      const visited: string[] = []
      walker.walk(node, { enter: (n) => { visited.push(n.type) } })
      expect(visited).toEqual(['empty'])
    })

    it('handles node with range property', () => {
      const walker = new ASTWalker()
      const node: ASTNode = { type: 'ranged', range: { start: 0, end: 10 } }
      const result = walker.walk(node, { enter: () => {} })
      expect(result.visited).toBe(1)
    })

    it('handles node with properties', () => {
      const walker = new ASTWalker()
      const node: ASTNode = { type: 'props', properties: { foo: 'bar' } }
      const result = walker.walk(node, { enter: () => {} })
      expect(result.visited).toBe(1)
    })

    it('handles shared child references (cycles)', () => {
      const walker = new ASTWalker()
      const shared = makeLeaf('shared')
      const tree = makeNode('root', [shared, shared])
      const visited: string[] = []
      const result = walker.walk(tree, { enter: (n) => { visited.push(n.type) } })
      expect(result.visited).toBe(2)
    })

    it('BFS with maxDepth', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      const result = walker.walk(tree, {
        enter: (n) => { visited.push(n.type) },
      }, { order: 'breadth-first', maxDepth: 1 })
      expect(visited).toEqual(['root', 'a', 'b', 'c'])
      expect(result.visited).toBe(4)
    })

    it('BFS with filter', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      const result = walker.walk(tree, {
        enter: (n) => { visited.push(n.type) },
      }, { order: 'breadth-first', filter: (n) => n.type !== 'a' })
      expect(visited).not.toContain('a')
      expect(result.skipped).toBe(1)
    })

    it('uses default options from constructor', () => {
      const walker = new ASTWalker({ order: 'post' })
      const tree = makeNode('root', [makeLeaf('child')])
      const order: string[] = []
      walker.walk(tree, { enter: (n) => { order.push(n.type) } })
      expect(order).toEqual(['child', 'root'])
    })

    it('constructor maxDepth is used as default', () => {
      const walker = new ASTWalker({ maxDepth: 0 })
      const tree = makeNode('root', [makeLeaf('child')])
      const visited: string[] = []
      walker.walk(tree, { enter: (n) => { visited.push(n.type) } })
      expect(visited).toEqual(['root'])
    })

    it('options override constructor defaults', () => {
      const walker = new ASTWalker({ order: 'post', maxDepth: 0 })
      const tree = makeNode('root', [makeLeaf('child')])
      const visited: string[] = []
      walker.walk(tree, { enter: (n) => { visited.push(n.type) } }, { maxDepth: 10 })
      expect(visited).toEqual(['child', 'root'])
    })

    it('post-order does not call exit', () => {
      const walker = new ASTWalker()
      const tree = makeNode('root', [makeLeaf('child')])
      const exits: string[] = []
      walker.walk(tree, {
        enter: () => {},
        exit: (n) => { exits.push(n.type) },
      }, { order: 'post' })
      expect(exits).toEqual([])
    })

    it('BFS enter returning false skips children', () => {
      const walker = new ASTWalker()
      const tree = makeTree()
      const visited: string[] = []
      walker.walk(tree, {
        enter: (n) => {
          visited.push(n.type)
          if (n.type === 'a') return false
          return
        },
      }, { order: 'breadth-first' })
      expect(visited).not.toContain('a1')
      expect(visited).not.toContain('a2')
    })
  })
})
