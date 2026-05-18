import { ASTTransformer } from '../src/core/ast-transformer/ast-transformer.js'
import { NodeVisitor } from '../src/core/ast-transformer/node-visitor.js'
import type {
  ASTNode,
  TransformRule,
  TransformConfig,
  TransformAction,
} from '../src/core/ast-transformer/types.js'
import { DEFAULT_TRANSFORM_CONFIG } from '../src/core/ast-transformer/types.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeLeaf(type: string, value?: string, props?: Record<string, string>): ASTNode {
  return { type, value, properties: props ?? {} }
}

function makeNode(
  type: string,
  children: ASTNode[],
  value?: string,
  props?: Record<string, string>,
): ASTNode {
  return { type, children, value, properties: props ?? {} }
}

function makeLoc(line: number, column: number): { line: number; column: number } {
  return { line, column }
}

/** root -> [a -> [a1, a2], b -> [b1], c] */
function makeTree(): ASTNode {
  return makeNode('root', [
    makeNode('a', [makeLeaf('a1', 'val-a1'), makeLeaf('a2', 'val-a2')]),
    makeNode('b', [makeLeaf('b1', 'val-b1')]),
    makeLeaf('c', 'val-c'),
  ])
}

function collectTypes(visitor: NodeVisitor, root: ASTNode): string[] {
  const types: string[] = []
  visitor.visit(root, (node) => {
    types.push(node.type)
  })
  return types
}

// ─── NodeVisitor ───────────────────────────────────────────────────────

describe('NodeVisitor', () => {
  // ─── visit (DFS) ──────────────────────────────────────────────────

  describe('visit (DFS)', () => {
    it('visits a single node', () => {
      const visitor = new NodeVisitor()
      const node = makeLeaf('leaf')
      const visited: string[] = []
      visitor.visit(node, (n) => { visited.push(n.type) })
      expect(visited).toEqual(['leaf'])
    })

    it('visits all nodes in DFS pre-order', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const order: string[] = []
      visitor.visit(tree, (n) => { order.push(n.type) })
      expect(order).toEqual(['root', 'a', 'a1', 'a2', 'b', 'b1', 'c'])
    })

    it('provides correct depth values', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const depths: number[] = []
      visitor.visit(tree, (_n, _p, depth) => { depths.push(depth) })
      expect(depths).toEqual([0, 1, 2, 2, 1, 2, 1])
    })

    it('provides correct parent references', () => {
      const visitor = new NodeVisitor()
      const a1 = makeLeaf('a1')
      const a = makeNode('a', [a1])
      const root = makeNode('root', [a])
      const pairs: Array<{ child: string; parent: string | undefined }> = []
      visitor.visit(root, (node, parent) => {
        pairs.push({ child: node.type, parent: parent?.type })
      })
      expect(pairs).toEqual([
        { child: 'root', parent: undefined },
        { child: 'a', parent: 'root' },
        { child: 'a1', parent: 'a' },
      ])
    })

    it('skips children when callback returns false', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const visited: string[] = []
      visitor.visit(tree, (n) => {
        visited.push(n.type)
        if (n.type === 'a') return false
      })
      // 'a' is visited but its children (a1, a2) are skipped
      expect(visited).toEqual(['root', 'a', 'b', 'b1', 'c'])
    })

    it('handles deeply nested tree', () => {
      const visitor = new NodeVisitor()
      let node: ASTNode = makeLeaf('deep')
      for (let i = 0; i < 50; i++) {
        node = makeNode(`level-${i}`, [node])
      }
      const visited: string[] = []
      visitor.visit(node, (n) => { visited.push(n.type) })
      expect(visited).toHaveLength(51)
      expect(visited[0]).toBe('level-49')
      expect(visited[50]).toBe('deep')
    })

    it('visits nodes with empty children array', () => {
      const visitor = new NodeVisitor()
      const root = makeNode('root', [])
      const visited: string[] = []
      visitor.visit(root, (n) => { visited.push(n.type) })
      expect(visited).toEqual(['root'])
    })

    it('visits nodes without children', () => {
      const visitor = new NodeVisitor()
      const root = makeLeaf('solo')
      const visited: string[] = []
      visitor.visit(root, (n) => { visited.push(n.type) })
      expect(visited).toEqual(['solo'])
    })
  })

  // ─── visitBFS ─────────────────────────────────────────────────────

  describe('visitBFS', () => {
    it('visits a single node', () => {
      const visitor = new NodeVisitor()
      const node = makeLeaf('leaf')
      const visited: string[] = []
      visitor.visitBFS(node, (n) => { visited.push(n.type) })
      expect(visited).toEqual(['leaf'])
    })

    it('visits nodes in BFS order', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const order: string[] = []
      visitor.visitBFS(tree, (n) => { order.push(n.type) })
      // BFS: root, then a, b, c, then a1, a2, b1
      expect(order).toEqual(['root', 'a', 'b', 'c', 'a1', 'a2', 'b1'])
    })

    it('provides correct depth in BFS', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const depths: number[] = []
      visitor.visitBFS(tree, (_n, _p, depth) => { depths.push(depth) })
      expect(depths).toEqual([0, 1, 1, 1, 2, 2, 2])
    })

    it('provides correct parent in BFS', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const parents: Array<string | undefined> = []
      visitor.visitBFS(tree, (_n, parent) => { parents.push(parent?.type) })
      expect(parents).toEqual([undefined, 'root', 'root', 'root', 'a', 'a', 'b'])
    })

    it('skips children when callback returns false', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const visited: string[] = []
      visitor.visitBFS(tree, (n) => {
        visited.push(n.type)
        if (n.type === 'a') return false
      })
      // 'a' visited but its children (a1, a2) not enqueued
      expect(visited).toEqual(['root', 'a', 'b', 'c', 'b1'])
    })

    it('handles deeply nested tree in BFS order', () => {
      const visitor = new NodeVisitor()
      const child1 = makeLeaf('c1')
      const child2 = makeLeaf('c2')
      const root = makeNode('root', [makeNode('mid', [child1]), child2])
      const order: string[] = []
      visitor.visitBFS(root, (n) => { order.push(n.type) })
      expect(order).toEqual(['root', 'mid', 'c2', 'c1'])
    })
  })

  // ─── findPath ─────────────────────────────────────────────────────

  describe('findPath', () => {
    it('returns path to root itself', () => {
      const visitor = new NodeVisitor()
      const root = makeTree()
      expect(visitor.findPath(root, root)).toEqual(['root'])
    })

    it('returns path to a direct child', () => {
      const visitor = new NodeVisitor()
      const a = makeNode('a', [makeLeaf('a1')])
      const root = makeNode('root', [a])
      expect(visitor.findPath(root, a)).toEqual(['root', 'a'])
    })

    it('returns path to a deep descendant', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const a1 = tree.children![0]!.children![0]!
      expect(visitor.findPath(tree, a1)).toEqual(['root', 'a', 'a1'])
    })

    it('returns empty array when node is not found', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const outsider = makeLeaf('outsider')
      expect(visitor.findPath(tree, outsider)).toEqual([])
    })

    it('returns correct path in multi-branch tree', () => {
      const visitor = new NodeVisitor()
      const b1 = makeLeaf('b1')
      const b = makeNode('b', [b1])
      const root = makeNode('root', [makeNode('a', [makeLeaf('a1')]), b])
      expect(visitor.findPath(root, b1)).toEqual(['root', 'b', 'b1'])
    })
  })

  // ─── countNodes ───────────────────────────────────────────────────

  describe('countNodes', () => {
    it('counts a single node as 1', () => {
      const visitor = new NodeVisitor()
      expect(visitor.countNodes(makeLeaf('x'))).toBe(1)
    })

    it('counts nodes in a tree', () => {
      const visitor = new NodeVisitor()
      expect(visitor.countNodes(makeTree())).toBe(7)
    })

    it('counts nodes with empty children', () => {
      const visitor = new NodeVisitor()
      expect(visitor.countNodes(makeNode('root', []))).toBe(1)
    })

    it('counts a deeply nested single-chain tree', () => {
      const visitor = new NodeVisitor()
      let node: ASTNode = makeLeaf('leaf')
      for (let i = 0; i < 10; i++) {
        node = makeNode(`n-${i}`, [node])
      }
      expect(visitor.countNodes(node)).toBe(11)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────

  describe('clone', () => {
    it('clones a leaf node', () => {
      const visitor = new NodeVisitor()
      const original = makeLeaf('leaf', 'val')
      const cloned = visitor.clone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    it('clones a tree preserving structure', () => {
      const visitor = new NodeVisitor()
      const tree = makeTree()
      const cloned = visitor.clone(tree)
      expect(cloned).toEqual(tree)
      expect(cloned).not.toBe(tree)
      expect(cloned.children).not.toBe(tree.children)
    })

    it('produces an independent copy', () => {
      const visitor = new NodeVisitor()
      const original = makeNode('root', [makeLeaf('a')])
      const cloned = visitor.clone(original)
      cloned.type = 'changed'
      cloned.children![0]!.type = 'changed-child'
      expect(original.type).toBe('root')
      expect(original.children![0]!.type).toBe('a')
    })

    it('preserves location information', () => {
      const visitor = new NodeVisitor()
      const original: ASTNode = { type: 'x', properties: {}, loc: makeLoc(5, 10) }
      const cloned = visitor.clone(original)
      expect(cloned.loc).toEqual({ line: 5, column: 10 })
      expect(cloned.loc).not.toBe(original.loc)
    })

    it('preserves properties', () => {
      const visitor = new NodeVisitor()
      const original: ASTNode = {
        type: 'x',
        properties: { foo: 'bar', baz: 'qux' },
      }
      const cloned = visitor.clone(original)
      expect(cloned.properties).toEqual({ foo: 'bar', baz: 'qux' })
      expect(cloned.properties).not.toBe(original.properties)
    })

    it('handles node without optional fields', () => {
      const visitor = new NodeVisitor()
      const original: ASTNode = { type: 'bare', properties: {} }
      const cloned = visitor.clone(original)
      expect(cloned.type).toBe('bare')
      expect(cloned.value).toBeUndefined()
      expect(cloned.children).toBeUndefined()
      expect(cloned.loc).toBeUndefined()
    })

    it('deep-clones nested children', () => {
      const visitor = new NodeVisitor()
      const leaf = makeLeaf('leaf')
      const mid = makeNode('mid', [leaf])
      const root = makeNode('root', [mid])
      const cloned = visitor.clone(root)
      expect(cloned.children![0]!).not.toBe(mid)
      expect(cloned.children![0]!.children![0]!).not.toBe(leaf)
    })
  })
})

// ─── ASTTransformer Constructor ────────────────────────────────────────

describe('ASTTransformer', () => {
  // ─── Constructor & Config ─────────────────────────────────────────

  describe('constructor', () => {
    it('creates transformer with default config', () => {
      const t = new ASTTransformer()
      expect(t.getConfig()).toEqual({
        maxDepth: DEFAULT_TRANSFORM_CONFIG.maxDepth,
        maxChanges: DEFAULT_TRANSFORM_CONFIG.maxChanges,
      })
    })

    it('creates transformer with custom config', () => {
      const t = new ASTTransformer({ maxDepth: 5, maxChanges: 50 })
      expect(t.getConfig()).toEqual({ maxDepth: 5, maxChanges: 50 })
    })

    it('merges partial config with defaults', () => {
      const t = new ASTTransformer({ maxDepth: 3 })
      expect(t.getConfig()).toEqual({ maxDepth: 3, maxChanges: DEFAULT_TRANSFORM_CONFIG.maxChanges })
    })

    it('merges partial config (maxChanges only)', () => {
      const t = new ASTTransformer({ maxChanges: 42 })
      expect(t.getConfig()).toEqual({ maxDepth: DEFAULT_TRANSFORM_CONFIG.maxDepth, maxChanges: 42 })
    })
  })

  // ─── getRules / addRule ───────────────────────────────────────────

  describe('getRules', () => {
    it('returns empty array initially', () => {
      const t = new ASTTransformer()
      expect(t.getRules()).toEqual([])
    })

    it('returns a copy of the rules array', () => {
      const t = new ASTTransformer()
      const rule: TransformRule = { match: (n) => n.type === 'x', action: 'remove' }
      t.addRule(rule)
      const rules = t.getRules()
      rules.push(rule)
      expect(t.getRules()).toHaveLength(1)
    })
  })

  describe('addRule', () => {
    it('adds a rule to the transformer', () => {
      const t = new ASTTransformer()
      const rule: TransformRule = { match: (n) => n.type === 'target', action: 'remove' }
      t.addRule(rule)
      expect(t.getRules()).toHaveLength(1)
      expect(t.getRules()[0]).toBe(rule)
    })

    it('adds multiple rules in order', () => {
      const t = new ASTTransformer()
      const rule1: TransformRule = { match: (n) => n.type === 'a', action: 'remove' }
      const rule2: TransformRule = { match: (n) => n.type === 'b', action: 'replace', replacement: makeLeaf('new') }
      t.addRule(rule1)
      t.addRule(rule2)
      const rules = t.getRules()
      expect(rules).toHaveLength(2)
      expect(rules[0]).toBe(rule1)
      expect(rules[1]).toBe(rule2)
    })
  })

  // ─── removeRule ───────────────────────────────────────────────────

  describe('removeRule', () => {
    it('removes a rule at valid index', () => {
      const t = new ASTTransformer()
      t.addRule({ match: () => true, action: 'remove' })
      t.addRule({ match: () => false, action: 'replace', replacement: makeLeaf('x') })
      t.removeRule(0)
      expect(t.getRules()).toHaveLength(1)
    })

    it('does nothing for negative index', () => {
      const t = new ASTTransformer()
      t.addRule({ match: () => true, action: 'remove' })
      t.removeRule(-1)
      expect(t.getRules()).toHaveLength(1)
    })

    it('does nothing for out-of-bounds index', () => {
      const t = new ASTTransformer()
      t.addRule({ match: () => true, action: 'remove' })
      t.removeRule(5)
      expect(t.getRules()).toHaveLength(1)
    })

    it('removes the last rule', () => {
      const t = new ASTTransformer()
      t.addRule({ match: () => true, action: 'remove' })
      t.addRule({ match: () => false, action: 'replace', replacement: makeLeaf('x') })
      t.removeRule(1)
      expect(t.getRules()).toHaveLength(1)
      expect(t.getRules()[0]!.action).toBe('remove')
    })

    it('removes from empty rules list without error', () => {
      const t = new ASTTransformer()
      expect(() => t.removeRule(0)).not.toThrow()
      expect(t.getRules()).toHaveLength(0)
    })
  })

  // ─── getConfig ────────────────────────────────────────────────────

  describe('getConfig', () => {
    it('returns a copy of the config', () => {
      const t = new ASTTransformer({ maxDepth: 10 })
      const config = t.getConfig()
      config.maxDepth = 999
      expect(t.getConfig().maxDepth).toBe(10)
    })
  })

  // ─── transform (no rules) ────────────────────────────────────────

  describe('transform (no rules)', () => {
    it('returns a clone of the root with no changes', () => {
      const t = new ASTTransformer()
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(0)
      expect(result.changes).toEqual([])
      expect(result.root).toEqual(tree)
      expect(result.root).not.toBe(tree)
    })
  })

  // ─── transform - replace ─────────────────────────────────────────

  describe('transform - replace action', () => {
    it('replaces matching nodes with a static replacement', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'c',
        action: 'replace',
        replacement: makeLeaf('replaced'),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('replace')
      expect(result.changes[0]!.nodeType).toBe('c')
      // original tree unchanged
      expect(tree.children![2]!.type).toBe('c')
      // result has replacement
      expect(result.root.children![2]!.type).toBe('replaced')
    })

    it('replaces matching nodes with a function replacement', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'a1',
        action: 'replace',
        replacement: (node) => makeLeaf('new-' + (node.value ?? '')),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      const newA1 = result.root.children![0]!.children![0]!
      expect(newA1.type).toBe('new-val-a1')
    })

    it('replaces the root node when it matches', () => {
      const t = new ASTTransformer()
      const newRoot = makeLeaf('new-root')
      t.addRule({
        match: (n) => n.type === 'root',
        action: 'replace',
        replacement: newRoot,
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.root.type).toBe('new-root')
      expect(result.root.children).toBeUndefined()
    })

    it('replaces multiple matching nodes', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'x',
        action: 'replace',
        replacement: makeLeaf('y'),
      })
      const tree = makeNode('root', [makeLeaf('x'), makeLeaf('x'), makeLeaf('z')])
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(2)
      expect(result.root.children![0]!.type).toBe('y')
      expect(result.root.children![1]!.type).toBe('y')
      expect(result.root.children![2]!.type).toBe('z')
    })

    it('does not modify tree when no nodes match', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'nonexistent',
        action: 'replace',
        replacement: makeLeaf('x'),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(0)
      expect(result.root).toEqual(tree)
    })
  })

  // ─── transform - remove ──────────────────────────────────────────

  describe('transform - remove action', () => {
    it('removes matching child nodes', () => {
      const t = new ASTTransformer()
      t.addRule({ match: (n) => n.type === 'c', action: 'remove' })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      const childTypes = result.root.children!.map((c) => c.type)
      expect(childTypes).not.toContain('c')
    })

    it('removes root when it matches', () => {
      const t = new ASTTransformer()
      t.addRule({ match: (n) => n.type === 'root', action: 'remove' })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.root.type).toBe('__REMOVED__')
      expect(result.root.properties).toEqual({})
    })

    it('removes multiple matching nodes', () => {
      const t = new ASTTransformer()
      t.addRule({ match: (n) => n.type === 'x', action: 'remove' })
      const tree = makeNode('root', [makeLeaf('x'), makeLeaf('keep'), makeLeaf('x')])
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(2)
      expect(result.root.children!.map((c) => c.type)).toEqual(['keep'])
    })

    it('does not modify tree when nothing matches', () => {
      const t = new ASTTransformer()
      t.addRule({ match: (n) => n.type === 'ghost', action: 'remove' })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(0)
    })
  })

  // ─── transform - insert-before ────────────────────────────────────

  describe('transform - insert-before action', () => {
    it('inserts a node before matching child', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'b1',
        action: 'insert-before',
        replacement: makeLeaf('inserted'),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      const bChildren = result.root.children![1]!.children!
      expect(bChildren.map((c) => c.type)).toEqual(['inserted', 'b1'])
    })

    it('inserts using function replacement', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'a1',
        action: 'insert-before',
        replacement: (node) => makeLeaf('before-' + (node.value ?? '')),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      const aChildren = result.root.children![0]!.children!
      expect(aChildren[0]!.type).toBe('before-val-a1')
      expect(aChildren[1]!.type).toBe('a1')
    })

    it('skips insertion when root matches (no parent)', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'root',
        action: 'insert-before',
        replacement: makeLeaf('x'),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      // change is recorded but nothing inserted (parent is undefined)
      expect(result.changesApplied).toBe(1)
      expect(result.root.type).toBe('root')
    })

    it('skips insertion when replacement is undefined', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'c',
        action: 'insert-before',
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      // No insertion happened since replacement is undefined
      expect(result.root.children!.map((c) => c.type)).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── transform - insert-after ─────────────────────────────────────

  describe('transform - insert-after action', () => {
    it('inserts a node after matching child', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'b1',
        action: 'insert-after',
        replacement: makeLeaf('after-b1'),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      const bChildren = result.root.children![1]!.children!
      expect(bChildren.map((c) => c.type)).toEqual(['b1', 'after-b1'])
    })

    it('inserts using function replacement', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'a2',
        action: 'insert-after',
        replacement: (node) => makeLeaf('after-' + (node.value ?? '')),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      const aChildren = result.root.children![0]!.children!
      expect(aChildren[2]!.type).toBe('after-val-a2')
    })

    it('skips insertion when root matches (no parent)', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'root',
        action: 'insert-after',
        replacement: makeLeaf('x'),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.root.children!).toHaveLength(3)
    })

    it('skips insertion when replacement is undefined', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'c',
        action: 'insert-after',
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.root.children!.map((c) => c.type)).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── transform - wrap ────────────────────────────────────────────

  describe('transform - wrap action', () => {
    it('wraps a matching node with a wrapper', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'c',
        action: 'wrap',
        replacement: makeNode('wrapper', []),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      const wrapped = result.root.children![2]!
      expect(wrapped.type).toBe('wrapper')
      expect(wrapped.children!).toHaveLength(1)
      expect(wrapped.children![0]!.type).toBe('c')
    })

    it('wraps with function replacement', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'a1',
        action: 'wrap',
        replacement: (node) => makeNode('env-' + node.type, []),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      const wrapped = result.root.children![0]!.children![0]!
      expect(wrapped.type).toBe('env-a1')
      expect(wrapped.children![0]!.type).toBe('a1')
    })

    it('wraps root node', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'root',
        action: 'wrap',
        replacement: makeNode('outer', []),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.root.type).toBe('outer')
      expect(result.root.children![0]!.type).toBe('root')
    })

    it('skips wrap when replacement is undefined', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'c',
        action: 'wrap',
      })
      const tree = makeTree()
      const result = t.transform(tree)
      // Change recorded but no wrapping since no replacement
      expect(result.changesApplied).toBe(1)
      expect(result.root.children![2]!.type).toBe('c')
    })
  })

  // ─── transform - maxChanges limit ─────────────────────────────────

  describe('transform - maxChanges limit', () => {
    it('stops applying rules when maxChanges is reached', () => {
      const t = new ASTTransformer({ maxChanges: 2 })
      t.addRule({ match: () => true, action: 'remove' })
      const tree = makeNode('root', [
        makeLeaf('a'), makeLeaf('b'), makeLeaf('c'), makeLeaf('d'),
      ])
      const result = t.transform(tree)
      expect(result.changesApplied).toBeLessThanOrEqual(2)
    })

    it('respects maxChanges across multiple rules', () => {
      const t = new ASTTransformer({ maxChanges: 1 })
      t.addRule({ match: (n) => n.type === 'a', action: 'remove' })
      t.addRule({ match: (n) => n.type === 'b', action: 'remove' })
      const tree = makeNode('root', [makeLeaf('a'), makeLeaf('b')])
      const result = t.transform(tree)
      expect(result.changesApplied).toBeLessThanOrEqual(1)
    })

    it('with maxChanges 0 returns unchanged tree', () => {
      const t = new ASTTransformer({ maxChanges: 0 })
      t.addRule({ match: () => true, action: 'remove' })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(0)
    })
  })

  // ─── transform - maxDepth limit ───────────────────────────────────

  describe('transform - maxDepth limit', () => {
    it('only matches nodes within maxDepth', () => {
      const t = new ASTTransformer({ maxDepth: 1 })
      t.addRule({ match: () => true, action: 'remove' })
      const tree = makeTree() // root(0) -> a(1), b(1), c(1) -> a1(2), a2(2), b1(2)
      const result = t.transform(tree)
      // Only root, a, b, c at depth <= 1
      expect(result.changesApplied).toBe(4)
    })

    it('maxDepth 0 only matches root', () => {
      const t = new ASTTransformer({ maxDepth: 0 })
      t.addRule({ match: () => true, action: 'remove' })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.root.type).toBe('__REMOVED__')
    })
  })

  // ─── transform - multiple rules ───────────────────────────────────

  describe('transform - multiple rules', () => {
    it('applies rules in order', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'a',
        action: 'replace',
        replacement: makeLeaf('a-replaced'),
      })
      t.addRule({
        match: (n) => n.type === 'b',
        action: 'replace',
        replacement: makeLeaf('b-replaced'),
      })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.root.children![0]!.type).toBe('a-replaced')
      expect(result.root.children![1]!.type).toBe('b-replaced')
    })

    it('second rule operates on result of first rule', () => {
      const t = new ASTTransformer()
      // First: replace 'c' with a node called 'target'
      t.addRule({
        match: (n) => n.type === 'c',
        action: 'replace',
        replacement: makeLeaf('target'),
      })
      // Second: remove 'target' nodes
      t.addRule({
        match: (n) => n.type === 'target',
        action: 'remove',
      })
      const tree = makeTree()
      const result = t.transform(tree)
      const types = result.root.children!.map((c) => c.type)
      expect(types).not.toContain('c')
      expect(types).not.toContain('target')
    })
  })

  // ─── applyAction ──────────────────────────────────────────────────

  describe('applyAction', () => {
    it('replace with undefined replacement returns original node', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      expect(t.applyAction(node, 'replace', undefined)).toBe(node)
    })

    it('replace with function calls the function', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x', 'val')
      const result = t.applyAction(node, 'replace', (n) => makeLeaf('new-' + (n.value ?? '')))
      expect(result.type).toBe('new-val')
    })

    it('replace with node clones the replacement', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      const replacement = makeLeaf('replacement')
      const result = t.applyAction(node, 'replace', replacement)
      expect(result.type).toBe('replacement')
      expect(result).not.toBe(replacement)
    })

    it('remove returns __REMOVED__ node', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      const result = t.applyAction(node, 'remove')
      expect(result.type).toBe('__REMOVED__')
      expect(result.properties).toEqual({})
    })

    it('wrap with undefined replacement returns original node', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      expect(t.applyAction(node, 'wrap', undefined)).toBe(node)
    })

    it('wrap with function replacement', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      const result = t.applyAction(node, 'wrap', () => makeNode('wrapper', []))
      expect(result.type).toBe('wrapper')
      expect(result.children!).toHaveLength(1)
      expect(result.children![0]!.type).toBe('x')
    })

    it('wrap with static replacement', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      const result = t.applyAction(node, 'wrap', makeNode('wrapper', []))
      expect(result.type).toBe('wrapper')
      expect(result.children![0]!.type).toBe('x')
    })

    it('insert-before returns node unchanged', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      expect(t.applyAction(node, 'insert-before')).toBe(node)
    })

    it('insert-after returns node unchanged', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('x')
      expect(t.applyAction(node, 'insert-after')).toBe(node)
    })
  })

  // ─── replaceNode ──────────────────────────────────────────────────

  describe('replaceNode', () => {
    it('replaces root when target is root', () => {
      const t = new ASTTransformer()
      const tree = makeTree()
      const replacement = makeLeaf('new-root')
      const result = t.replaceNode(tree, tree, replacement)
      expect(result.type).toBe('new-root')
    })

    it('replaces a direct child', () => {
      const t = new ASTTransformer()
      const a = makeNode('a', [makeLeaf('a1')])
      const b = makeLeaf('b')
      const root = makeNode('root', [a, b])
      const newA = makeLeaf('replaced-a')
      const result = t.replaceNode(root, a, newA)
      expect(result.children![0]!.type).toBe('replaced-a')
      // original unchanged
      expect(root.children![0]!.type).toBe('a')
    })

    it('replaces a deeply nested child', () => {
      const t = new ASTTransformer()
      const leaf = makeLeaf('deep')
      const tree = makeNode('root', [makeNode('a', [makeNode('b', [leaf])])])
      const newLeaf = makeLeaf('replaced-deep')
      const result = t.replaceNode(tree, leaf, newLeaf)
      expect(result.children![0]!.children![0]!.children![0]!.type).toBe('replaced-deep')
    })

    it('returns clone when target not found in tree', () => {
      const t = new ASTTransformer()
      const tree = makeTree()
      const outsider = makeLeaf('outsider')
      const replacement = makeLeaf('x')
      const result = t.replaceNode(tree, outsider, replacement)
      expect(result).toEqual(tree)
      expect(result).not.toBe(tree)
    })
  })

  // ─── removeNode ───────────────────────────────────────────────────

  describe('removeNode', () => {
    it('removes root by returning __REMOVED__', () => {
      const t = new ASTTransformer()
      const tree = makeTree()
      const result = t.removeNode(tree, tree)
      expect(result.type).toBe('__REMOVED__')
    })

    it('removes a direct child', () => {
      const t = new ASTTransformer()
      const a = makeLeaf('a')
      const b = makeLeaf('b')
      const root = makeNode('root', [a, b])
      const result = t.removeNode(root, a)
      expect(result.children!).toHaveLength(1)
      expect(result.children![0]!.type).toBe('b')
    })

    it('removes a deeply nested child', () => {
      const t = new ASTTransformer()
      const leaf = makeLeaf('deep')
      const tree = makeNode('root', [makeNode('mid', [leaf, makeLeaf('sibling')])])
      const result = t.removeNode(tree, leaf)
      expect(result.children![0]!.children!).toHaveLength(1)
      expect(result.children![0]!.children![0]!.type).toBe('sibling')
    })

    it('returns clone when target not found', () => {
      const t = new ASTTransformer()
      const tree = makeTree()
      const outsider = makeLeaf('outsider')
      const result = t.removeNode(tree, outsider)
      expect(result).toEqual(tree)
      expect(result).not.toBe(tree)
    })
  })

  // ─── insertBefore ─────────────────────────────────────────────────

  describe('insertBefore', () => {
    it('inserts before a matching child node', () => {
      const t = new ASTTransformer()
      const a = makeLeaf('a', 'val-a')
      const b = makeLeaf('b')
      const root = makeNode('root', [a, b])
      const inserted = makeLeaf('before-a')
      const result = t.insertBefore(root, a, inserted)
      // remapChild matches by type+value, so 'a' with value 'val-a' gets the insert
      expect(result.children!.map((c) => c.type)).toEqual(['before-a', 'a', 'b'])
    })

    it('inserts before a child in the middle', () => {
      const t = new ASTTransformer()
      const a = makeLeaf('a')
      const b = makeLeaf('b', 'val-b')
      const c = makeLeaf('c')
      const root = makeNode('root', [a, b, c])
      const inserted = makeLeaf('before-b')
      const result = t.insertBefore(root, b, inserted)
      expect(result.children!.map((ch) => ch.type)).toEqual(['a', 'before-b', 'b', 'c'])
    })

    it('preserves original tree', () => {
      const t = new ASTTransformer()
      const ref = makeLeaf('ref', 'val')
      const root = makeNode('root', [ref])
      t.insertBefore(root, ref, makeLeaf('new'))
      expect(root.children!).toHaveLength(1)
    })
  })

  // ─── insertAfter ──────────────────────────────────────────────────

  describe('insertAfter', () => {
    it('inserts after a matching child node', () => {
      const t = new ASTTransformer()
      const a = makeLeaf('a', 'val-a')
      const b = makeLeaf('b')
      const root = makeNode('root', [a, b])
      const inserted = makeLeaf('after-a')
      const result = t.insertAfter(root, a, inserted)
      expect(result.children!.map((c) => c.type)).toEqual(['a', 'after-a', 'b'])
    })

    it('inserts after the last child', () => {
      const t = new ASTTransformer()
      const a = makeLeaf('a')
      const b = makeLeaf('b', 'val-b')
      const root = makeNode('root', [a, b])
      const inserted = makeLeaf('after-b')
      const result = t.insertAfter(root, b, inserted)
      expect(result.children!).toHaveLength(3)
      expect(result.children![2]!.type).toBe('after-b')
    })

    it('preserves original tree', () => {
      const t = new ASTTransformer()
      const ref = makeLeaf('ref', 'val')
      const root = makeNode('root', [ref])
      t.insertAfter(root, ref, makeLeaf('new'))
      expect(root.children!).toHaveLength(1)
    })
  })

  // ─── wrapNode ─────────────────────────────────────────────────────

  describe('wrapNode', () => {
    it('wraps a node inside a wrapper', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('inner')
      const wrapper = makeNode('wrapper', [])
      const result = t.wrapNode(node, wrapper)
      expect(result.type).toBe('wrapper')
      expect(result.children!).toHaveLength(1)
      expect(result.children![0]!.type).toBe('inner')
    })

    it('preserves the original node and wrapper', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('inner')
      const wrapper = makeNode('wrapper', [])
      const result = t.wrapNode(node, wrapper)
      expect(node.type).toBe('inner')
      expect(wrapper.children).toEqual([])
      expect(result.children).toEqual([{ type: 'inner', properties: {} }])
    })

    it('wrapper with existing children gets overwritten', () => {
      const t = new ASTTransformer()
      const node = makeLeaf('target')
      const wrapper = makeNode('wrapper', [makeLeaf('existing')])
      const result = t.wrapNode(node, wrapper)
      // cloned wrapper's children are replaced with [cloned node]
      expect(result.children!).toHaveLength(1)
      expect(result.children![0]!.type).toBe('target')
    })

    it('wraps a complex subtree', () => {
      const t = new ASTTransformer()
      const inner = makeNode('inner', [makeLeaf('a'), makeLeaf('b')])
      const wrapper = makeNode('wrapper', [])
      const result = t.wrapNode(inner, wrapper)
      expect(result.children![0]!.type).toBe('inner')
      expect(result.children![0]!.children!).toHaveLength(2)
    })
  })

  // ─── Edge Cases & Integration ─────────────────────────────────────

  describe('edge cases', () => {
    it('transform does not mutate the original tree', () => {
      const t = new ASTTransformer()
      t.addRule({ match: (n) => n.type === 'a1', action: 'remove' })
      const tree = makeTree()
      const snapshot = JSON.stringify(tree)
      t.transform(tree)
      expect(JSON.stringify(tree)).toBe(snapshot)
    })

    it('handles tree with only root (no children)', () => {
      const t = new ASTTransformer()
      t.addRule({ match: () => true, action: 'remove' })
      const root = makeLeaf('root')
      const result = t.transform(root)
      expect(result.root.type).toBe('__REMOVED__')
    })

    it('handles tree with empty children array', () => {
      const t = new ASTTransformer()
      t.addRule({ match: () => true, action: 'remove' })
      const root = makeNode('root', [])
      const result = t.transform(root)
      expect(result.root.type).toBe('__REMOVED__')
    })

    it('rule match function receives correct node', () => {
      const t = new ASTTransformer()
      const matched: string[] = []
      t.addRule({
        match: (n) => {
          matched.push(n.type)
          return n.type === 'b'
        },
        action: 'remove',
      })
      const tree = makeTree()
      t.transform(tree)
      expect(matched).toEqual(['root', 'a', 'a1', 'a2', 'b', 'b1', 'c'])
    })

    it('records correct path in changes', () => {
      const t = new ASTTransformer()
      t.addRule({ match: (n) => n.type === 'a2', action: 'remove' })
      const tree = makeTree()
      const result = t.transform(tree)
      expect(result.changes[0]!.path).toEqual(['root', 'a', 'a2'])
    })

    it('transform with location data preserved', () => {
      const t = new ASTTransformer()
      const nodeWithLoc: ASTNode = {
        type: 'target',
        properties: {},
        loc: makeLoc(10, 5),
      }
      const tree = makeNode('root', [nodeWithLoc])
      t.addRule({
        match: (n) => n.type === 'target',
        action: 'replace',
        replacement: makeLeaf('new'),
      })
      const result = t.transform(tree)
      expect(result.root.children![0]!.type).toBe('new')
    })

    it('transform with properties preserved via clone', () => {
      const t = new ASTTransformer()
      const nodeWithProps: ASTNode = {
        type: 'x',
        properties: { key: 'value' },
      }
      const tree = makeNode('root', [nodeWithProps])
      t.addRule({
        match: (n) => n.type === 'x',
        action: 'replace',
        replacement: nodeWithProps,
      })
      const result = t.transform(tree)
      expect(result.root.children![0]!.properties).toEqual({ key: 'value' })
    })

    it('multiple sequential transforms are independent', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'x',
        action: 'replace',
        replacement: makeLeaf('y'),
      })
      const tree1 = makeNode('root', [makeLeaf('x')])
      const tree2 = makeNode('root', [makeLeaf('x')])
      const result1 = t.transform(tree1)
      const result2 = t.transform(tree2)
      expect(result1.root.children![0]!.type).toBe('y')
      expect(result2.root.children![0]!.type).toBe('y')
      expect(result1.root).not.toBe(result2.root)
    })

    it('replacing all children of a node', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'child',
        action: 'replace',
        replacement: makeLeaf('new-child'),
      })
      const tree = makeNode('root', [
        makeLeaf('child'),
        makeLeaf('child'),
        makeLeaf('child'),
      ])
      const result = t.transform(tree)
      expect(result.changesApplied).toBe(3)
      for (const child of result.root.children!) {
        expect(child.type).toBe('new-child')
      }
    })
  })

  // ─── Integration: Complex Transform Scenarios ─────────────────────

  describe('complex transform scenarios', () => {
    it('wraps then replaces in two-pass transform', () => {
      const wrapTransformer = new ASTTransformer()
      wrapTransformer.addRule({
        match: (n) => n.type === 'target',
        action: 'wrap',
        replacement: makeNode('container', []),
      })
      const replaceTransformer = new ASTTransformer()
      replaceTransformer.addRule({
        match: (n) => n.type === 'container',
        action: 'replace',
        replacement: makeLeaf('final'),
      })
      const tree = makeNode('root', [makeLeaf('target')])
      const step1 = wrapTransformer.transform(tree)
      const step2 = replaceTransformer.transform(step1.root)
      expect(step2.root.children![0]!.type).toBe('final')
    })

    it('handles removing all children of a parent via rule', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type.startsWith('del-'),
        action: 'remove',
      })
      const tree = makeNode('root', [
        makeLeaf('del-a'),
        makeLeaf('keep'),
        makeLeaf('del-b'),
      ])
      const result = t.transform(tree)
      expect(result.root.children!).toHaveLength(1)
      expect(result.root.children![0]!.type).toBe('keep')
    })

    it('insert-before first child and insert-after last child', () => {
      const t = new ASTTransformer()
      t.addRule({
        match: (n) => n.type === 'first',
        action: 'insert-before',
        replacement: makeLeaf('before-first'),
      })
      t.addRule({
        match: (n) => n.type === 'last',
        action: 'insert-after',
        replacement: makeLeaf('after-last'),
      })
      const tree = makeNode('root', [makeLeaf('first'), makeLeaf('middle'), makeLeaf('last')])
      const result = t.transform(tree)
      const types = result.root.children!.map((c) => c.type)
      expect(types[0]).toBe('before-first')
      expect(types[types.length - 1]).toBe('after-last')
    })

    it('works with DEFAULT_TRANSFORM_CONFIG export', () => {
      expect(DEFAULT_TRANSFORM_CONFIG.maxDepth).toBe(100)
      expect(DEFAULT_TRANSFORM_CONFIG.maxChanges).toBe(1000)
    })
  })
})
