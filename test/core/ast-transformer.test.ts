import { describe, it, expect, beforeEach } from 'vitest'
import { NodeVisitor } from '../../src/core/ast-transformer/node-visitor.js'
import { ASTTransformer } from '../../src/core/ast-transformer/ast-transformer.js'
import type { ASTNode, TransformRule } from '../../src/core/ast-transformer/types.js'
import { DEFAULT_TRANSFORM_CONFIG } from '../../src/core/ast-transformer/types.js'

function makeNode(
  type: string,
  opts: {
    value?: string
    children?: ASTNode[]
    properties?: Record<string, string>
    loc?: { line: number; column: number }
  } = {},
): ASTNode {
  return {
    type,
    value: opts.value,
    children: opts.children,
    properties: opts.properties ?? {},
    loc: opts.loc,
  }
}

function sampleTree(): ASTNode {
  return makeNode('Program', {
    children: [
      makeNode('FunctionDeclaration', {
        value: 'fetchData',
        properties: { async: 'true', name: 'fetchData' },
        children: [
          makeNode('Identifier', {
            value: 'fetchData',
            properties: { name: 'fetchData' },
          }),
          makeNode('BlockStatement', {
            children: [
              makeNode('ReturnStatement', {
                children: [
                  makeNode('CallExpression', {
                    value: 'fetch',
                    properties: { callee: 'fetch' },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      makeNode('VariableDeclaration', {
        value: 'count',
        properties: { kind: 'const', name: 'count' },
        children: [
          makeNode('NumericLiteral', { value: '42' }),
        ],
      }),
      makeNode('ClassDeclaration', {
        value: 'MyClass',
        properties: { name: 'MyClass' },
        children: [
          makeNode('MethodDefinition', {
            value: 'constructor',
            properties: { name: 'constructor' },
          }),
          makeNode('MethodDefinition', {
            value: 'render',
            properties: { name: 'render' },
          }),
        ],
      }),
    ],
  })
}

describe('NodeVisitor', () => {
  const visitor = new NodeVisitor()
  let tree: ASTNode

  beforeEach(() => {
    tree = sampleTree()
  })

  describe('visit (DFS)', () => {
    it('traverses nodes in depth-first order', () => {
      const visited: string[] = []
      visitor.visit(tree, (node) => {
        visited.push(node.type)
      })
      expect(visited[0]).toBe('Program')
      expect(visited[1]).toBe('FunctionDeclaration')
      expect(visited[2]).toBe('Identifier')
      expect(visited[3]).toBe('BlockStatement')
      expect(visited[4]).toBe('ReturnStatement')
      expect(visited[5]).toBe('CallExpression')
    })

    it('passes parent correctly', () => {
      const pairs: Array<[string, string | undefined]> = []
      visitor.visit(tree, (node, parent) => {
        pairs.push([node.type, parent?.type])
      })
      expect(pairs[0]).toEqual(['Program', undefined])
      expect(pairs[1]).toEqual(['FunctionDeclaration', 'Program'])
      expect(pairs[2]).toEqual(['Identifier', 'FunctionDeclaration'])
    })

    it('passes depth correctly', () => {
      const depths: Array<[string, number]> = []
      visitor.visit(tree, (node, _parent, depth) => {
        depths.push([node.type, depth])
      })
      expect(depths[0]).toEqual(['Program', 0])
      expect(depths[1]).toEqual(['FunctionDeclaration', 1])
      expect(depths[2]).toEqual(['Identifier', 2])
      expect(depths[3]).toEqual(['BlockStatement', 2])
    })

    it('skips children when callback returns false', () => {
      const visited: string[] = []
      visitor.visit(tree, (node) => {
        visited.push(node.type)
        if (node.type === 'FunctionDeclaration') return false
      })
      expect(visited).toContain('Program')
      expect(visited).toContain('FunctionDeclaration')
      expect(visited).not.toContain('Identifier')
      expect(visited).not.toContain('BlockStatement')
      expect(visited).toContain('VariableDeclaration')
    })

    it('handles single node tree', () => {
      const single = makeNode('Root')
      const visited: string[] = []
      visitor.visit(single, (node) => {
        visited.push(node.type)
      })
      expect(visited).toEqual(['Root'])
    })
  })

  describe('visitBFS', () => {
    it('traverses nodes in breadth-first order', () => {
      const visited: string[] = []
      visitor.visitBFS(tree, (node) => {
        visited.push(node.type)
      })
      expect(visited[0]).toBe('Program')
      expect(visited[1]).toBe('FunctionDeclaration')
      expect(visited[2]).toBe('VariableDeclaration')
      expect(visited[3]).toBe('ClassDeclaration')
    })

    it('passes depth correctly in BFS', () => {
      const depths: Array<[string, number]> = []
      visitor.visitBFS(tree, (node, _parent, depth) => {
        depths.push([node.type, depth])
      })
      expect(depths[0]).toEqual(['Program', 0])
      expect(depths[1]).toEqual(['FunctionDeclaration', 1])
      expect(depths[2]).toEqual(['VariableDeclaration', 1])
      expect(depths[3]).toEqual(['ClassDeclaration', 1])
    })

    it('skips children when callback returns false in BFS', () => {
      const visited: string[] = []
      visitor.visitBFS(tree, (node) => {
        visited.push(node.type)
        if (node.type === 'FunctionDeclaration') return false
      })
      expect(visited).toContain('FunctionDeclaration')
      expect(visited).not.toContain('Identifier')
      expect(visited).not.toContain('BlockStatement')
      expect(visited).toContain('VariableDeclaration')
    })

    it('handles single node tree in BFS', () => {
      const single = makeNode('Root')
      const visited: string[] = []
      visitor.visitBFS(single, (node) => {
        visited.push(node.type)
      })
      expect(visited).toEqual(['Root'])
    })
  })

  describe('findPath', () => {
    it('finds path from root to target', () => {
      const func = tree.children![0]!
      const result = visitor.findPath(tree, func)
      expect(result).toEqual(['Program', 'FunctionDeclaration'])
    })

    it('finds deeply nested path', () => {
      const func = tree.children![0]!
      const block = func.children![1]!
      const ret = block.children![0]!
      const call = ret.children![0]!
      const result = visitor.findPath(tree, call)
      expect(result).toEqual(['Program', 'FunctionDeclaration', 'BlockStatement', 'ReturnStatement', 'CallExpression'])
    })

    it('returns path of just root type for root', () => {
      const result = visitor.findPath(tree, tree)
      expect(result).toEqual(['Program'])
    })

    it('returns empty for disconnected node', () => {
      const disconnected = makeNode('Disconnected')
      const result = visitor.findPath(tree, disconnected)
      expect(result).toEqual([])
    })
  })

  describe('countNodes', () => {
    it('counts all nodes in tree', () => {
      expect(visitor.countNodes(tree)).toBe(11)
    })

    it('counts single node as 1', () => {
      expect(visitor.countNodes(makeNode('Root'))).toBe(1)
    })

    it('counts nodes with no children', () => {
      const node = makeNode('Leaf')
      expect(visitor.countNodes(node)).toBe(1)
    })
  })

  describe('clone', () => {
    it('creates a deep copy', () => {
      const cloned = visitor.clone(tree)
      expect(cloned).toEqual(tree)
      expect(cloned).not.toBe(tree)
    })

    it('cloned children are not same references', () => {
      const cloned = visitor.clone(tree)
      expect(cloned.children).not.toBe(tree.children)
      expect(cloned.children![0]).not.toBe(tree.children![0])
    })

    it('clones properties independently', () => {
      const original = makeNode('Test', { properties: { key: 'val' } })
      const cloned = visitor.clone(original)
      cloned.properties['key'] = 'changed'
      expect(original.properties['key']).toBe('val')
    })

    it('clones location data', () => {
      const original = makeNode('Test', { loc: { line: 5, column: 10 } })
      const cloned = visitor.clone(original)
      expect(cloned.loc).toEqual({ line: 5, column: 10 })
      expect(cloned.loc).not.toBe(original.loc)
    })

    it('clones value field', () => {
      const original = makeNode('Ident', { value: 'foo' })
      const cloned = visitor.clone(original)
      expect(cloned.value).toBe('foo')
    })
  })
})

describe('ASTTransformer', () => {
  let transformer: ASTTransformer
  let tree: ASTNode

  beforeEach(() => {
    transformer = new ASTTransformer()
    tree = sampleTree()
  })

  describe('addRule', () => {
    it('adds a rule to the transformer', () => {
      const rule: TransformRule = {
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      }
      transformer.addRule(rule)
      expect(transformer.getRules()).toHaveLength(1)
    })

    it('adds multiple rules', () => {
      transformer.addRule({ match: (n) => n.type === 'A', action: 'remove' })
      transformer.addRule({ match: (n) => n.type === 'B', action: 'replace' })
      expect(transformer.getRules()).toHaveLength(2)
    })
  })

  describe('removeRule', () => {
    it('removes a rule by index', () => {
      transformer.addRule({ match: (n) => n.type === 'A', action: 'remove' })
      transformer.addRule({ match: (n) => n.type === 'B', action: 'replace' })
      transformer.removeRule(0)
      expect(transformer.getRules()).toHaveLength(1)
      expect(transformer.getRules()[0]!.match(makeNode('B'))).toBe(true)
    })

    it('does nothing for invalid index', () => {
      transformer.addRule({ match: (n) => n.type === 'A', action: 'remove' })
      transformer.removeRule(5)
      transformer.removeRule(-1)
      expect(transformer.getRules()).toHaveLength(1)
    })

    it('removes from empty rules list safely', () => {
      transformer.removeRule(0)
      expect(transformer.getRules()).toHaveLength(0)
    })
  })

  describe('transform with replace rule', () => {
    it('replaces matching nodes', () => {
      const replacement = makeNode('StringLiteral', { value: '"hello"' })
      transformer.addRule({
        match: (node) => node.type === 'NumericLiteral',
        action: 'replace',
        replacement,
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('replace')
      expect(result.changes[0]!.nodeType).toBe('NumericLiteral')
    })

    it('replaces with function replacement', () => {
      transformer.addRule({
        match: (node) => node.type === 'Identifier',
        action: 'replace',
        replacement: (node) => makeNode('StringLiteral', { value: node.value ?? '' }),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.nodeType).toBe('Identifier')
    })
  })

  describe('transform with remove rule', () => {
    it('removes matching nodes from parents children', () => {
      transformer.addRule({
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('remove')
    })
  })

  describe('transform with insert-before', () => {
    it('inserts node before matching node', () => {
      transformer.addRule({
        match: (node) => node.type === 'VariableDeclaration',
        action: 'insert-before',
        replacement: makeNode('ImportStatement', { value: 'import foo' }),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('insert-before')
    })
  })

  describe('transform with insert-after', () => {
    it('inserts node after matching node', () => {
      transformer.addRule({
        match: (node) => node.type === 'VariableDeclaration',
        action: 'insert-after',
        replacement: makeNode('ExportStatement', { value: 'export default' }),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('insert-after')
    })
  })

  describe('transform with wrap', () => {
    it('wraps matching node', () => {
      transformer.addRule({
        match: (node) => node.type === 'ReturnStatement',
        action: 'wrap',
        replacement: makeNode('TryStatement'),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('wrap')
    })
  })

  describe('applyAction', () => {
    it('applies replace action', () => {
      const node = makeNode('Old', { value: 'old' })
      const replacement = makeNode('New', { value: 'new' })
      const result = transformer.applyAction(node, 'replace', replacement)
      expect(result.type).toBe('New')
    })

    it('applies replace with function', () => {
      const node = makeNode('Old', { value: 'old' })
      const result = transformer.applyAction(node, 'replace', (n) =>
        makeNode('New', { value: n.value ?? '' }),
      )
      expect(result.type).toBe('New')
      expect(result.value).toBe('old')
    })

    it('applies remove action', () => {
      const node = makeNode('ToRemove')
      const result = transformer.applyAction(node, 'remove')
      expect(result.type).toBe('__REMOVED__')
    })

    it('applies wrap action', () => {
      const node = makeNode('Inner')
      const wrapper = makeNode('Wrapper')
      const result = transformer.applyAction(node, 'wrap', wrapper)
      expect(result.type).toBe('Wrapper')
      expect(result.children).toHaveLength(1)
      expect(result.children![0]!.type).toBe('Inner')
    })

    it('returns node unchanged for replace with no replacement', () => {
      const node = makeNode('Same')
      const result = transformer.applyAction(node, 'replace')
      expect(result.type).toBe('Same')
    })

    it('returns node for insert-before action', () => {
      const node = makeNode('Same')
      const result = transformer.applyAction(node, 'insert-before')
      expect(result.type).toBe('Same')
    })

    it('returns node for insert-after action', () => {
      const node = makeNode('Same')
      const result = transformer.applyAction(node, 'insert-after')
      expect(result.type).toBe('Same')
    })
  })

  describe('replaceNode', () => {
    it('replaces target node in tree', () => {
      const target = tree.children![0]!
      const replacement = makeNode('NewFunc')
      const result = transformer.replaceNode(tree, target, replacement)
      expect(result.children![0]!.type).toBe('NewFunc')
    })

    it('does not modify original tree', () => {
      const target = tree.children![0]!
      const originalType = target.type
      transformer.replaceNode(tree, target, makeNode('New'))
      expect(target.type).toBe(originalType)
    })

    it('replaces root if target is root', () => {
      const replacement = makeNode('NewRoot')
      const result = transformer.replaceNode(tree, tree, replacement)
      expect(result.type).toBe('NewRoot')
    })
  })

  describe('removeNode', () => {
    it('removes target node from parent', () => {
      const target = tree.children![1]!
      const result = transformer.removeNode(tree, target)
      expect(result.children).toHaveLength(2)
      expect(result.children!.every((c) => c.type !== 'VariableDeclaration')).toBe(true)
    })

    it('does not modify original tree', () => {
      const originalLength = tree.children!.length
      const target = tree.children![0]!
      transformer.removeNode(tree, target)
      expect(tree.children).toHaveLength(originalLength)
    })
  })

  describe('insertBefore', () => {
    it('inserts node before reference', () => {
      const parent = makeNode('Parent', {
        children: [makeNode('A'), makeNode('B'), makeNode('C')],
      })
      const reference = parent.children![1]!
      const newNode = makeNode('X')
      const result = transformer.insertBefore(parent, reference, newNode)
      expect(result.children!.map((c) => c.type)).toEqual(['A', 'X', 'B', 'C'])
    })
  })

  describe('insertAfter', () => {
    it('inserts node after reference', () => {
      const parent = makeNode('Parent', {
        children: [makeNode('A'), makeNode('B'), makeNode('C')],
      })
      const reference = parent.children![1]!
      const newNode = makeNode('X')
      const result = transformer.insertAfter(parent, reference, newNode)
      expect(result.children!.map((c) => c.type)).toEqual(['A', 'B', 'X', 'C'])
    })
  })

  describe('wrapNode', () => {
    it('wraps node inside wrapper', () => {
      const node = makeNode('Inner', { value: 'hello' })
      const wrapper = makeNode('Wrapper', { properties: { tag: 'div' } })
      const result = transformer.wrapNode(node, wrapper)
      expect(result.type).toBe('Wrapper')
      expect(result.children).toHaveLength(1)
      expect(result.children![0]!.type).toBe('Inner')
      expect(result.children![0]!.value).toBe('hello')
    })

    it('does not modify original node', () => {
      const node = makeNode('Inner')
      const wrapper = makeNode('Wrapper')
      transformer.wrapNode(node, wrapper)
      expect(node.children).toBeUndefined()
    })
  })

  describe('getRules', () => {
    it('returns empty array initially', () => {
      expect(transformer.getRules()).toEqual([])
    })

    it('returns copy of rules array', () => {
      transformer.addRule({ match: (n) => n.type === 'A', action: 'remove' })
      const rules = transformer.getRules()
      rules.pop()
      expect(transformer.getRules()).toHaveLength(1)
    })
  })

  describe('getConfig', () => {
    it('returns default config', () => {
      const config = transformer.getConfig()
      expect(config.maxDepth).toBe(DEFAULT_TRANSFORM_CONFIG.maxDepth)
      expect(config.maxChanges).toBe(DEFAULT_TRANSFORM_CONFIG.maxChanges)
    })

    it('returns custom config', () => {
      const custom = new ASTTransformer({ maxDepth: 50, maxChanges: 500 })
      const config = custom.getConfig()
      expect(config.maxDepth).toBe(50)
      expect(config.maxChanges).toBe(500)
    })

    it('returns partial custom config with defaults', () => {
      const custom = new ASTTransformer({ maxDepth: 50 })
      const config = custom.getConfig()
      expect(config.maxDepth).toBe(50)
      expect(config.maxChanges).toBe(DEFAULT_TRANSFORM_CONFIG.maxChanges)
    })

    it('returns copy of config', () => {
      const config = transformer.getConfig()
      config.maxDepth = 999
      expect(transformer.getConfig().maxDepth).toBe(DEFAULT_TRANSFORM_CONFIG.maxDepth)
    })
  })

  describe('edge cases', () => {
    it('handles empty tree with no rules', () => {
      const empty = makeNode('Root')
      const result = transformer.transform(empty)
      expect(result.changesApplied).toBe(0)
      expect(result.changes).toHaveLength(0)
      expect(result.root.type).toBe('Root')
    })

    it('handles tree with no matching rules', () => {
      transformer.addRule({
        match: (node) => node.type === 'NonExistent',
        action: 'remove',
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(0)
    })

    it('respects maxChanges limit', () => {
      const smallTransformer = new ASTTransformer({ maxChanges: 1 })
      smallTransformer.addRule({
        match: (node) => node.type === 'MethodDefinition',
        action: 'remove',
      })
      const result = smallTransformer.transform(tree)
      expect(result.changesApplied).toBeLessThanOrEqual(1)
    })

    it('handles deeply nested transform', () => {
      const deep = makeNode('L0', {
        children: [
          makeNode('L1', {
            children: [
              makeNode('L2', {
                children: [makeNode('L3', { children: [makeNode('Target')] })],
              }),
            ],
          }),
        ],
      })
      transformer.addRule({
        match: (node) => node.type === 'Target',
        action: 'replace',
        replacement: makeNode('Replaced'),
      })
      const result = transformer.transform(deep)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.nodeType).toBe('Target')
    })

    it('handles multiple rules on same tree', () => {
      transformer.addRule({
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      })
      transformer.addRule({
        match: (node) => node.type === 'MethodDefinition',
        action: 'remove',
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(3)
    })

    it('handles chained transforms', () => {
      transformer.addRule({
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      })
      const first = transformer.transform(tree)
      transformer.addRule({
        match: (node) => node.type === 'MethodDefinition',
        action: 'remove',
      })
      const second = transformer.transform(first.root)
      expect(first.changesApplied).toBe(1)
      expect(second.changesApplied).toBe(2)
    })

    it('transform result root is a clone', () => {
      transformer.addRule({
        match: (node) => node.type === 'Identifier',
        action: 'remove',
      })
      const result = transformer.transform(tree)
      expect(result.root).not.toBe(tree)
    })

    it('handles transform with no changes needed', () => {
      transformer.addRule({
        match: (node) => node.type === 'NonExistentType',
        action: 'replace',
        replacement: makeNode('X'),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(0)
      expect(result.changes).toHaveLength(0)
    })

    it('handles insert-before with function replacement', () => {
      transformer.addRule({
        match: (node) => node.type === 'VariableDeclaration',
        action: 'insert-before',
        replacement: (node) => makeNode('Comment', { value: `// before ${node.value}` }),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('insert-before')
    })

    it('handles insert-after with function replacement', () => {
      transformer.addRule({
        match: (node) => node.type === 'VariableDeclaration',
        action: 'insert-after',
        replacement: (node) => makeNode('Comment', { value: `// after ${node.value}` }),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('insert-after')
    })

    it('handles wrap with function replacement', () => {
      transformer.addRule({
        match: (node) => node.type === 'ReturnStatement',
        action: 'wrap',
        replacement: () => makeNode('TryCatch'),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.action).toBe('wrap')
    })

    it('handles single node tree with remove rule', () => {
      const single = makeNode('Target')
      transformer.addRule({
        match: (node) => node.type === 'Target',
        action: 'remove',
      })
      const result = transformer.transform(single)
      expect(result.changesApplied).toBe(1)
    })

    it('maxDepth limits traversal during transform', () => {
      const depthTransformer = new ASTTransformer({ maxDepth: 2 })
      depthTransformer.addRule({
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      })
      const result = depthTransformer.transform(tree)
      expect(result.changesApplied).toBe(0)
    })

    it('transform changes include path information', () => {
      transformer.addRule({
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      })
      const result = transformer.transform(tree)
      expect(result.changes[0]!.path.length).toBeGreaterThan(0)
      expect(result.changes[0]!.path[0]).toBe('Program')
    })

    it('handles rule matching root node', () => {
      transformer.addRule({
        match: (node) => node.type === 'Program',
        action: 'replace',
        replacement: makeNode('Module'),
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
      expect(result.changes[0]!.nodeType).toBe('Program')
    })

    it('multiple rules applied sequentially', () => {
      transformer.addRule({
        match: (node) => node.type === 'NumericLiteral',
        action: 'replace',
        replacement: makeNode('StringLiteral', { value: '"42"' }),
      })
      transformer.addRule({
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      })
      const result = transformer.transform(tree)
      expect(result.changes.length).toBe(2)
    })

    it('handles tree with only root node', () => {
      const root = makeNode('Root')
      transformer.addRule({
        match: (node) => node.type === 'Root',
        action: 'replace',
        replacement: makeNode('Module'),
      })
      const result = transformer.transform(root)
      expect(result.changesApplied).toBe(1)
      expect(result.root.type).toBe('Module')
    })

    it('removeNode returns unchanged clone when target not found', () => {
      const orphan = makeNode('Orphan')
      const result = transformer.removeNode(tree, orphan)
      expect(result.children).toHaveLength(tree.children!.length)
    })

    it('replaceNode returns unchanged clone when target not found', () => {
      const orphan = makeNode('Orphan')
      const result = transformer.replaceNode(tree, orphan, makeNode('New'))
      expect(result.children![0]!.type).toBe('FunctionDeclaration')
    })

    it('wrapNode preserves properties on wrapper', () => {
      const node = makeNode('Inner', { value: 'val' })
      const wrapper = makeNode('Wrapper', { properties: { tag: 'div', id: 'main' } })
      const result = transformer.wrapNode(node, wrapper)
      expect(result.properties).toEqual({ tag: 'div', id: 'main' })
    })

    it('applyAction wrap with no replacement returns node unchanged', () => {
      const node = makeNode('Unchanged')
      const result = transformer.applyAction(node, 'wrap')
      expect(result.type).toBe('Unchanged')
    })

    it('insertBefore at start of children', () => {
      const parent = makeNode('Parent', {
        children: [makeNode('First'), makeNode('Second')],
      })
      const reference = parent.children![0]!
      const newNode = makeNode('Inserted')
      const result = transformer.insertBefore(parent, reference, newNode)
      expect(result.children!.map((c) => c.type)).toEqual(['Inserted', 'First', 'Second'])
    })

    it('insertAfter at end of children', () => {
      const parent = makeNode('Parent', {
        children: [makeNode('First'), makeNode('Second')],
      })
      const reference = parent.children![1]!
      const newNode = makeNode('Inserted')
      const result = transformer.insertAfter(parent, reference, newNode)
      expect(result.children!.map((c) => c.type)).toEqual(['First', 'Second', 'Inserted'])
    })

    it('transform with wildcard match rule', () => {
      let count = 0
      transformer.addRule({
        match: () => {
          count++
          return count === 1
        },
        action: 'remove',
      })
      const result = transformer.transform(tree)
      expect(result.changesApplied).toBe(1)
    })

    it('does not mutate original tree during transform', () => {
      const originalChildren = tree.children!.length
      transformer.addRule({
        match: (node) => node.type === 'VariableDeclaration',
        action: 'remove',
      })
      transformer.transform(tree)
      expect(tree.children).toHaveLength(originalChildren)
    })

    it('handles config with maxDepth 0', () => {
      const zeroDepth = new ASTTransformer({ maxDepth: 0 })
      zeroDepth.addRule({
        match: (node) => node.type === 'Program',
        action: 'replace',
        replacement: makeNode('Module'),
      })
      const result = zeroDepth.transform(tree)
      expect(result.changesApplied).toBe(1)
    })

    it('handles config with maxDepth 0 only matches root', () => {
      const zeroDepth = new ASTTransformer({ maxDepth: 0 })
      zeroDepth.addRule({
        match: (node) => node.type === 'CallExpression',
        action: 'remove',
      })
      const result = zeroDepth.transform(tree)
      expect(result.changesApplied).toBe(0)
    })
  })
})
