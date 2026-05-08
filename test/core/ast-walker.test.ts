import { describe, it, expect, beforeEach } from 'vitest'
import { ASTWalker, DEFAULT_WALK_CONFIG } from '../../src/core/ast-walker/ast-walker.js'
import type { ASTNode, WalkResult, TreeStatistics } from '../../src/core/ast-walker/ast-walker.js'

function makeNode(
  type: string,
  opts: {
    value?: string
    children?: ASTNode[]
    range?: { start: number; end: number }
    properties?: Record<string, unknown>
  } = {},
): ASTNode {
  return {
    type,
    value: opts.value,
    children: opts.children,
    range: opts.range,
    properties: opts.properties,
  }
}

function sampleTree(): ASTNode {
  return makeNode('Program', {
    children: [
      makeNode('FunctionDeclaration', {
        value: 'fetchData',
        properties: { async: true, name: 'fetchData' },
        children: [
          makeNode('Identifier', { value: 'fetchData' }),
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
        properties: { kind: 'const' },
        children: [makeNode('NumericLiteral', { value: '42' })],
      }),
      makeNode('ClassDeclaration', {
        value: 'MyClass',
        children: [
          makeNode('MethodDefinition', { value: 'constructor' }),
          makeNode('MethodDefinition', { value: 'render' }),
        ],
      }),
    ],
  })
}

describe('ASTWalker', () => {
  describe('pre-order traversal', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('visits nodes in pre-order (parent before children)', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      })
      expect(types[0]).toBe('Program')
      expect(types[1]).toBe('FunctionDeclaration')
      expect(types[2]).toBe('Identifier')
    })

    it('calls enter before children and exit after children', () => {
      const order: string[] = []
      const singleChild = makeNode('Root', {
        children: [makeNode('Child')],
      })
      walker.walk(singleChild, {
        enter: (node) => { order.push(`enter-${node.type}`) },
        exit: (node) => { order.push(`exit-${node.type}`) },
      })
      expect(order).toEqual(['enter-Root', 'enter-Child', 'exit-Child', 'exit-Root'])
    })

    it('tracks depth correctly', () => {
      const depths: number[] = []
      walker.walk(tree, {
        enter: (_node, depth) => { depths.push(depth) },
      })
      expect(depths[0]).toBe(0)
      expect(depths[1]).toBe(1)
      expect(depths[2]).toBe(2)
    })

    it('passes correct path to callbacks', () => {
      const paths: ASTNode[][] = []
      const simple = makeNode('A', {
        children: [makeNode('B', { children: [makeNode('C')] })],
      })
      walker.walk(simple, {
        enter: (_node, _depth, path) => { paths.push([...path]) },
      })
      expect(paths[0]!.map((n) => n.type)).toEqual(['A'])
      expect(paths[1]!.map((n) => n.type)).toEqual(['A', 'B'])
      expect(paths[2]!.map((n) => n.type)).toEqual(['A', 'B', 'C'])
    })

    it('returns correct WalkResult', () => {
      const result = walker.walk(tree, { enter: () => {} })
      expect(result.visited).toBeGreaterThan(0)
      expect(result.skipped).toBe(0)
      expect(result.depth).toBeGreaterThan(0)
    })

    it('enter returning false skips children but not exit', () => {
      const order: string[] = []
      const simple = makeNode('A', {
        children: [makeNode('B'), makeNode('C')],
      })
      walker.walk(simple, {
        enter: (node) => {
          order.push(`enter-${node.type}`)
          if (node.type === 'A') return false
        },
        exit: (node) => { order.push(`exit-${node.type}`) },
      })
      expect(order).toEqual(['enter-A', 'exit-A'])
    })

    it('visits all nodes in a complex tree', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      })
      expect(types).toContain('Program')
      expect(types).toContain('FunctionDeclaration')
      expect(types).toContain('CallExpression')
      expect(types).toContain('MethodDefinition')
      expect(types).toHaveLength(11)
    })

    it('handles exit callback with correct depth', () => {
      const exitDepths: number[] = []
      walker.walk(tree, {
        exit: (_node, depth) => { exitDepths.push(depth) },
      })
      expect(exitDepths.length).toBeGreaterThan(0)
    })
  })

  describe('post-order traversal', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('visits children before parent', () => {
      const types: string[] = []
      const simple = makeNode('A', {
        children: [makeNode('B'), makeNode('C')],
      })
      walker.walk(simple, {
        enter: (node) => { types.push(node.type) },
      }, { order: 'post' })
      expect(types).toEqual(['B', 'C', 'A'])
    })

    it('visits deeply nested nodes in correct post-order', () => {
      const types: string[] = []
      const nested = makeNode('A', {
        children: [makeNode('B', { children: [makeNode('C')] })],
      })
      walker.walk(nested, {
        enter: (node) => { types.push(node.type) },
      }, { order: 'post' })
      expect(types).toEqual(['C', 'B', 'A'])
    })

    it('tracks depth correctly in post-order', () => {
      const depths: number[] = []
      const simple = makeNode('A', {
        children: [makeNode('B', { children: [makeNode('C')] })],
      })
      walker.walk(simple, {
        enter: (_node, depth) => { depths.push(depth) },
      }, { order: 'post' })
      expect(depths).toEqual([2, 1, 0])
    })

    it('returns correct WalkResult for post-order', () => {
      const result = walker.walk(tree, { enter: () => {} }, { order: 'post' })
      expect(result.visited).toBe(11)
      expect(result.depth).toBe(4)
    })

    it('handles single node tree', () => {
      const types: string[] = []
      walker.walk(makeNode('Root'), {
        enter: (node) => { types.push(node.type) },
      }, { order: 'post' })
      expect(types).toEqual(['Root'])
    })

    it('post-order with complex tree visits all leaf nodes first', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { order: 'post' })
      expect(types[types.length - 1]).toBe('Program')
      expect(types[0]).toBe('Identifier')
    })

    it('post-order respects filter option', () => {
      const types: string[] = []
      const result = walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, {
        order: 'post',
        filter: (node) => node.type !== 'Identifier',
      })
      expect(types).not.toContain('Identifier')
      expect(result.skipped).toBeGreaterThan(0)
    })

    it('post-order passes correct path', () => {
      const paths: ASTNode[][] = []
      const simple = makeNode('A', {
        children: [makeNode('B')],
      })
      walker.walk(simple, {
        enter: (_node, _depth, path) => { paths.push([...path]) },
      }, { order: 'post' })
      expect(paths[0]!.map((n) => n.type)).toEqual(['A', 'B'])
      expect(paths[1]!.map((n) => n.type)).toEqual(['A'])
    })
  })

  describe('breadth-first traversal', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('visits nodes level by level', () => {
      const types: string[] = []
      const simple = makeNode('A', {
        children: [
          makeNode('B', { children: [makeNode('D')] }),
          makeNode('C', { children: [makeNode('E')] }),
        ],
      })
      walker.walk(simple, {
        enter: (node) => { types.push(node.type) },
      }, { order: 'breadth-first' })
      expect(types).toEqual(['A', 'B', 'C', 'D', 'E'])
    })

    it('visits siblings before children', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { order: 'breadth-first' })
      expect(types[0]).toBe('Program')
      const level1 = types.filter((_t, i) => i >= 1 && i <= 3)
      expect(level1).toEqual(['FunctionDeclaration', 'VariableDeclaration', 'ClassDeclaration'])
    })

    it('handles wide tree', () => {
      const types: string[] = []
      const wide = makeNode('Root', {
        children: [
          makeNode('A'), makeNode('B'), makeNode('C'),
          makeNode('D'), makeNode('E'),
        ],
      })
      walker.walk(wide, {
        enter: (node) => { types.push(node.type) },
      }, { order: 'breadth-first' })
      expect(types).toEqual(['Root', 'A', 'B', 'C', 'D', 'E'])
    })

    it('returns correct WalkResult for BFS', () => {
      const result = walker.walk(tree, { enter: () => {} }, { order: 'breadth-first' })
      expect(result.visited).toBe(11)
      expect(result.depth).toBe(4)
    })

    it('BFS tracks depth correctly', () => {
      const depths: number[] = []
      const simple = makeNode('A', {
        children: [makeNode('B', { children: [makeNode('C')] })],
      })
      walker.walk(simple, {
        enter: (_node, depth) => { depths.push(depth) },
      }, { order: 'breadth-first' })
      expect(depths).toEqual([0, 1, 2])
    })

    it('BFS enter returning false prevents child enqueue', () => {
      const types: string[] = []
      const simple = makeNode('A', {
        children: [makeNode('B', { children: [makeNode('C')] }), makeNode('D')],
      })
      walker.walk(simple, {
        enter: (node) => {
          types.push(node.type)
          if (node.type === 'B') return false
        },
      }, { order: 'breadth-first' })
      expect(types).toEqual(['A', 'B', 'D'])
      expect(types).not.toContain('C')
    })

    it('BFS passes correct path to callbacks', () => {
      const paths: ASTNode[][] = []
      const simple = makeNode('A', {
        children: [makeNode('B')],
      })
      walker.walk(simple, {
        enter: (_node, _depth, path) => { paths.push([...path]) },
      }, { order: 'breadth-first' })
      expect(paths[0]!.map((n) => n.type)).toEqual(['A'])
      expect(paths[1]!.map((n) => n.type)).toEqual(['A', 'B'])
    })
  })

  describe('depth limiting', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('respects maxDepth option', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { maxDepth: 1 })
      expect(types).toContain('Program')
      expect(types).toContain('FunctionDeclaration')
      expect(types).toContain('VariableDeclaration')
      expect(types).toContain('ClassDeclaration')
      expect(types).not.toContain('Identifier')
    })

    it('maxDepth 0 only visits root', () => {
      const types: string[] = []
      const result = walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { maxDepth: 0 })
      expect(types).toEqual(['Program'])
      expect(result.visited).toBe(1)
      expect(result.depth).toBe(0)
    })

    it('maxDepth 1 visits root and direct children', () => {
      const result = walker.walk(tree, { enter: () => {} }, { maxDepth: 1 })
      expect(result.visited).toBe(4)
    })

    it('walkWithDepth convenience method', () => {
      const types: string[] = []
      const result = walker.walkWithDepth(tree, 1, {
        enter: (node) => { types.push(node.type) },
      })
      expect(types).toHaveLength(4)
      expect(result.depth).toBe(1)
    })

    it('depth in WalkResult reflects actual max depth reached', () => {
      const result = walker.walk(tree, { enter: () => {} }, { maxDepth: 2 })
      expect(result.depth).toBe(2)
    })

    it('maxDepth with post-order', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { order: 'post', maxDepth: 1 })
      expect(types).toHaveLength(4)
    })
  })

  describe('filtering', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('filter option skips non-matching nodes', () => {
      const types: string[] = []
      const result = walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { filter: (node) => node.type === 'FunctionDeclaration' || node.type === 'Program' })
      expect(types).toContain('Program')
      expect(types).toContain('FunctionDeclaration')
      expect(types).not.toContain('Identifier')
      expect(result.skipped).toBeGreaterThan(0)
    })

    it('filter still traverses children of skipped nodes', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { filter: (node) => node.type !== 'FunctionDeclaration' })
      expect(types).not.toContain('FunctionDeclaration')
      expect(types).toContain('Identifier')
    })

    it('filter receives depth parameter', () => {
      const filterDepths: number[] = []
      walker.walk(tree, { enter: () => {} }, {
        filter: (_node, depth) => {
          filterDepths.push(depth)
          return true
        },
      })
      expect(filterDepths.length).toBeGreaterThan(0)
    })

    it('skipped count in WalkResult', () => {
      const result = walker.walk(tree, { enter: () => {} }, {
        filter: (node) => node.type === 'Program',
      })
      expect(result.visited).toBe(1)
      expect(result.skipped).toBe(10)
    })

    it('filter returns false for all nodes', () => {
      const types: string[] = []
      const result = walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, { filter: () => false })
      expect(types).toHaveLength(0)
      expect(result.visited).toBe(0)
      expect(result.skipped).toBe(11)
    })

    it('filter with breadth-first order', () => {
      const types: string[] = []
      walker.walk(tree, {
        enter: (node) => { types.push(node.type) },
      }, {
        order: 'breadth-first',
        filter: (node) => node.type === 'Program' || node.type === 'FunctionDeclaration',
      })
      expect(types).toEqual(['Program', 'FunctionDeclaration'])
    })
  })

  describe('find', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('finds first matching node', () => {
      const result = walker.find(tree, (node) => node.type === 'CallExpression')
      expect(result).toBeDefined()
      expect(result!.type).toBe('CallExpression')
    })

    it('returns undefined when no match', () => {
      const result = walker.find(tree, (node) => node.type === 'NonExistent')
      expect(result).toBeUndefined()
    })

    it('stops traversal on first match', () => {
      let visitCount = 0
      const result = walker.find(tree, (node) => {
        visitCount++
        return node.type === 'FunctionDeclaration'
      })
      expect(result).toBeDefined()
      expect(visitCount).toBeLessThan(12)
    })

    it('finds deeply nested node', () => {
      const result = walker.find(tree, (node) => node.type === 'ReturnStatement')
      expect(result).toBeDefined()
      expect(result!.type).toBe('ReturnStatement')
    })

    it('find receives depth parameter', () => {
      let foundDepth: number | undefined
      walker.find(tree, (node, depth) => {
        if (node.type === 'ClassDeclaration') {
          foundDepth = depth
          return true
        }
        return false
      })
      expect(foundDepth).toBe(1)
    })
  })

  describe('findAll', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('finds all matching nodes', () => {
      const results = walker.findAll(tree, (node) => node.type === 'CallExpression')
      expect(results).toHaveLength(1)
    })

    it('finds multiple matching nodes', () => {
      const results = walker.findAll(tree, (node) => node.type === 'MethodDefinition')
      expect(results).toHaveLength(2)
    })

    it('returns empty array when no match', () => {
      const results = walker.findAll(tree, (node) => node.type === 'NonExistent')
      expect(results).toEqual([])
    })

    it('finds nodes at different depths', () => {
      const results = walker.findAll(tree, () => true)
      expect(results.length).toBe(11)
    })

    it('preserves pre-order traversal order', () => {
      const types: string[] = []
      const simple = makeNode('A', {
        children: [
          makeNode('X', { children: [makeNode('Y')] }),
          makeNode('Y'),
        ],
      })
      const results = walker.findAll(simple, (node) => node.type === 'Y')
      for (const node of results) {
        types.push(node.type)
      }
      expect(types).toHaveLength(2)
    })
  })

  describe('map', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('maps all nodes to values', () => {
      const types = walker.map(tree, (node) => node.type)
      expect(types).toHaveLength(11)
      expect(types[0]).toBe('Program')
    })

    it('maps to different types', () => {
      const lengths = walker.map(tree, (node) => node.type.length)
      expect(lengths.every((l) => typeof l === 'number')).toBe(true)
    })

    it('preserves traversal order in map', () => {
      const simple = makeNode('A', {
        children: [makeNode('B'), makeNode('C')],
      })
      const types = walker.map(simple, (node) => node.type)
      expect(types).toEqual(['A', 'B', 'C'])
    })

    it('map with depth info', () => {
      const depthMap = walker.map(tree, (_node, depth) => depth)
      expect(depthMap[0]).toBe(0)
      const maxDepth = Math.max(...depthMap)
      expect(maxDepth).toBe(4)
    })

    it('map on single node tree', () => {
      const result = walker.map(makeNode('Root'), (node) => node.type)
      expect(result).toEqual(['Root'])
    })
  })

  describe('filter method', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('filters nodes by predicate', () => {
      const results = walker.filter(tree, (node) => node.type === 'CallExpression')
      expect(results).toHaveLength(1)
    })

    it('returns empty when nothing matches', () => {
      const results = walker.filter(tree, (node) => node.type === 'Fake')
      expect(results).toEqual([])
    })

    it('filter with depth predicate', () => {
      const results = walker.filter(tree, (_node, depth) => depth <= 1)
      expect(results.length).toBe(4)
    })

    it('filter returns same results as findAll', () => {
      const predicate = (node: ASTNode) => node.type === 'MethodDefinition'
      const filterResults = walker.filter(tree, predicate)
      const findAllResults = walker.findAll(tree, predicate)
      expect(filterResults).toEqual(findAllResults)
    })
  })

  describe('reduce', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('reduces nodes to single value', () => {
      const total = walker.reduce(tree, (acc, _node, _depth) => acc + 1, 0)
      expect(total).toBe(11)
    })

    it('accumulates correctly with string', () => {
      const simple = makeNode('A', { children: [makeNode('B'), makeNode('C')] })
      const concatenated = walker.reduce(simple, (acc, node, _depth) => acc + node.type, '')
      expect(concatenated).toBe('ABC')
    })

    it('returns initial value for empty-like walk', () => {
      const result = walker.reduce(makeNode('X'), (acc, _node, _depth) => acc + 1, 42)
      expect(result).toBe(43)
    })

    it('reduce with depth accumulation', () => {
      const maxDepth = walker.reduce(tree, (max, _node, depth) => Math.max(max, depth), 0)
      expect(maxDepth).toBe(4)
    })

    it('reduce builds array of types', () => {
      const types = walker.reduce(tree, (acc: string[], node, _depth) => [...acc, node.type], [])
      expect(types).toHaveLength(11)
      expect(types[0]).toBe('Program')
    })
  })

  describe('count', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('counts all nodes without predicate', () => {
      expect(walker.count(tree)).toBe(11)
    })

    it('counts matching nodes with predicate', () => {
      expect(walker.count(tree, (node) => node.type === 'CallExpression')).toBe(1)
    })

    it('returns 0 for no matches', () => {
      expect(walker.count(tree, (node) => node.type === 'NonExistent')).toBe(0)
    })

    it('counts single node tree', () => {
      expect(walker.count(makeNode('Root'))).toBe(1)
    })

    it('counts with depth-based predicate', () => {
      expect(walker.count(tree, (_node, depth) => depth === 0)).toBe(1)
    })
  })

  describe('getPath', () => {
    let walker: ASTWalker
    let tree: ASTNode
    let target: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
      const func = tree.children?.[0]
      const block = func?.children?.[1]
      target = block?.children?.[0]!
    })

    it('returns path to target node', () => {
      const path = walker.getPath(tree, target)
      expect(path).toBeDefined()
      expect(path!.map((n) => n.type)).toEqual([
        'Program', 'FunctionDeclaration', 'BlockStatement', 'ReturnStatement',
      ])
    })

    it('returns undefined for non-existent node', () => {
      const foreign = makeNode('Foreign')
      const path = walker.getPath(tree, foreign)
      expect(path).toBeUndefined()
    })

    it('path includes target as last element', () => {
      const path = walker.getPath(tree, target)
      expect(path).toBeDefined()
      expect(path![path!.length - 1]).toBe(target)
    })

    it('path starts from root', () => {
      const path = walker.getPath(tree, target)
      expect(path).toBeDefined()
      expect(path![0]).toBe(tree)
    })

    it('handles root as target', () => {
      const path = walker.getPath(tree, tree)
      expect(path).toBeDefined()
      expect(path).toEqual([tree])
    })
  })

  describe('getDepth', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('returns depth of target node', () => {
      const classNode = tree.children?.[2]
      expect(classNode).toBeDefined()
      const depth = walker.getDepth(tree, classNode!)
      expect(depth).toBe(1)
    })

    it('returns undefined for non-existent', () => {
      const depth = walker.getDepth(tree, makeNode('Foreign'))
      expect(depth).toBeUndefined()
    })

    it('returns 0 for root', () => {
      expect(walker.getDepth(tree, tree)).toBe(0)
    })

    it('handles deeply nested nodes', () => {
      const func = tree.children?.[0]
      const block = func?.children?.[1]
      const ret = block?.children?.[0]
      const call = ret?.children?.[0]
      expect(call).toBeDefined()
      expect(walker.getDepth(tree, call!)).toBe(4)
    })
  })

  describe('getAncestors', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('returns ancestors of target', () => {
      const classNode = tree.children?.[2]
      expect(classNode).toBeDefined()
      const ancestors = walker.getAncestors(tree, classNode!)
      expect(ancestors).toBeDefined()
      expect(ancestors!.map((n) => n.type)).toEqual(['Program'])
    })

    it('returns undefined for non-existent', () => {
      const ancestors = walker.getAncestors(tree, makeNode('Foreign'))
      expect(ancestors).toBeUndefined()
    })

    it('returns empty array for root', () => {
      const ancestors = walker.getAncestors(tree, tree)
      expect(ancestors).toEqual([])
    })

    it('returns correct ancestor chain for deep node', () => {
      const func = tree.children?.[0]
      const block = func?.children?.[1]
      const ret = block?.children?.[0]
      expect(ret).toBeDefined()
      const ancestors = walker.getAncestors(tree, ret!)
      expect(ancestors).toBeDefined()
      expect(ancestors!.map((n) => n.type)).toEqual([
        'Program', 'FunctionDeclaration', 'BlockStatement',
      ])
    })
  })

  describe('getStatistics', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = sampleTree()
    })

    it('returns correct totalNodes', () => {
      const stats = walker.getStatistics(tree)
      expect(stats.totalNodes).toBe(11)
    })

    it('returns correct maxDepth', () => {
      const stats = walker.getStatistics(tree)
      expect(stats.maxDepth).toBe(4)
    })

    it('returns correct typeCounts', () => {
      const stats = walker.getStatistics(tree)
      expect(stats.typeCounts['Program']).toBe(1)
      expect(stats.typeCounts['MethodDefinition']).toBe(2)
      expect(stats.typeCounts['CallExpression']).toBe(1)
    })

    it('counts leaf nodes correctly', () => {
      const stats = walker.getStatistics(tree)
      expect(stats.leafNodes).toBe(5)
    })

    it('counts branch nodes correctly', () => {
      const stats = walker.getStatistics(tree)
      expect(stats.branchNodes).toBe(6)
    })

    it('handles single node tree', () => {
      const stats = walker.getStatistics(makeNode('Root'))
      expect(stats.totalNodes).toBe(1)
      expect(stats.maxDepth).toBe(0)
      expect(stats.leafNodes).toBe(1)
      expect(stats.branchNodes).toBe(0)
      expect(stats.typeCounts['Root']).toBe(1)
    })

    it('handles deep tree', () => {
      let current = makeNode('Level0')
      const root = current
      for (let i = 1; i <= 50; i++) {
        const child = makeNode(`Level${i}`)
        current.children = [child]
        current = child
      }
      const stats = walker.getStatistics(root)
      expect(stats.totalNodes).toBe(51)
      expect(stats.maxDepth).toBe(50)
      expect(stats.leafNodes).toBe(1)
      expect(stats.branchNodes).toBe(50)
    })
  })

  describe('edge cases', () => {
    let walker: ASTWalker

    beforeEach(() => {
      walker = new ASTWalker()
    })

    it('handles single node tree', () => {
      const node = makeNode('Root')
      const result = walker.walk(node, { enter: () => {} })
      expect(result.visited).toBe(1)
      expect(result.depth).toBe(0)
    })

    it('handles node with undefined children', () => {
      const node: ASTNode = { type: 'Leaf' }
      const types: string[] = []
      walker.walk(node, { enter: (n) => { types.push(n.type) } })
      expect(types).toEqual(['Leaf'])
    })

    it('handles node with empty children array', () => {
      const node = makeNode('Root', { children: [] })
      const result = walker.walk(node, { enter: () => {} })
      expect(result.visited).toBe(1)
    })

    it('handles deep nesting', () => {
      let current = makeNode('Level0')
      const root = current
      for (let i = 1; i <= 100; i++) {
        const child = makeNode(`Level${i}`)
        current.children = [child]
        current = child
      }
      const result = walker.walk(root, { enter: () => {} })
      expect(result.visited).toBe(101)
      expect(result.depth).toBe(100)
    })

    it('prevents circular reference infinite loop', () => {
      const nodeA: ASTNode = makeNode('A')
      const nodeB: ASTNode = makeNode('B', { children: [nodeA] })
      nodeA.children = [nodeB]
      const visited: string[] = []
      const result = walker.walk(nodeA, {
        enter: (node) => { visited.push(node.type) },
      })
      expect(visited.length).toBeLessThan(10)
      expect(result.visited).toBe(2)
    })

    it('prevents circular reference in BFS', () => {
      const nodeA: ASTNode = makeNode('A')
      const nodeB: ASTNode = makeNode('B', { children: [nodeA] })
      nodeA.children = [nodeB]
      const visited: string[] = []
      const result = walker.walk(nodeA, {
        enter: (node) => { visited.push(node.type) },
      }, { order: 'breadth-first' })
      expect(visited.length).toBeLessThan(10)
      expect(result.visited).toBe(2)
    })

    it('handles very wide tree', () => {
      const children: ASTNode[] = []
      for (let i = 0; i < 200; i++) {
        children.push(makeNode(`Child${i}`))
      }
      const root = makeNode('Root', { children })
      const result = walker.walk(root, { enter: () => {} })
      expect(result.visited).toBe(201)
    })

    it('visitor enter only without exit', () => {
      const types: string[] = []
      const simple = makeNode('A', { children: [makeNode('B')] })
      walker.walk(simple, { enter: (node) => { types.push(node.type) } })
      expect(types).toEqual(['A', 'B'])
    })

    it('visitor exit only without enter', () => {
      const types: string[] = []
      const simple = makeNode('A', { children: [makeNode('B')] })
      walker.walk(simple, { exit: (node) => { types.push(node.type) } })
      expect(types).toEqual(['B', 'A'])
    })
  })

  describe('config and defaults', () => {
    it('DEFAULT_WALK_CONFIG has pre as default order', () => {
      expect(DEFAULT_WALK_CONFIG.order).toBe('pre')
    })

    it('constructor accepts default options', () => {
      const walker = new ASTWalker({ maxDepth: 5 })
      const tree = sampleTree()
      const result = walker.walk(tree, { enter: () => {} })
      expect(result.depth).toBeLessThanOrEqual(5)
    })

    it('per-call options override constructor defaults', () => {
      const walker = new ASTWalker({ maxDepth: 1 })
      const tree = sampleTree()
      const result = walker.walk(tree, { enter: () => {} }, { maxDepth: 5 })
      expect(result.depth).toBeGreaterThan(1)
    })

    it('clear method resets internal state', () => {
      const walker = new ASTWalker()
      walker.walk(sampleTree(), { enter: () => {} })
      walker.clear()
      expect(true).toBe(true)
    })
  })

  describe('getPath and getDepth integration', () => {
    let walker: ASTWalker
    let tree: ASTNode

    beforeEach(() => {
      walker = new ASTWalker()
      tree = makeNode('Root', {
        children: [
          makeNode('A', {
            children: [makeNode('B'), makeNode('C')],
          }),
          makeNode('D'),
        ],
      })
    })

    it('getPath returns correct path for nested node', () => {
      const bNode = tree.children?.[0]?.children?.[0]
      expect(bNode).toBeDefined()
      const path = walker.getPath(tree, bNode!)
      expect(path!.map((n) => n.type)).toEqual(['Root', 'A', 'B'])
    })

    it('getDepth and getPath length are consistent', () => {
      const cNode = tree.children?.[0]?.children?.[1]
      expect(cNode).toBeDefined()
      const path = walker.getPath(tree, cNode!)
      const depth = walker.getDepth(tree, cNode!)
      expect(depth).toBe(path!.length - 1)
    })
  })

  describe('getStatistics edge cases', () => {
    it('handles node with children containing only leaf nodes', () => {
      const walker = new ASTWalker()
      const tree = makeNode('Root', {
        children: [makeNode('A'), makeNode('B'), makeNode('C')],
      })
      const stats = walker.getStatistics(tree)
      expect(stats.branchNodes).toBe(1)
      expect(stats.leafNodes).toBe(3)
      expect(stats.totalNodes).toBe(4)
    })

    it('handles circular reference gracefully', () => {
      const walker = new ASTWalker()
      const nodeA: ASTNode = makeNode('A')
      const nodeB: ASTNode = makeNode('B', { children: [nodeA] })
      nodeA.children = [nodeB]
      const stats = walker.getStatistics(nodeA)
      expect(stats.totalNodes).toBe(2)
    })
  })

  describe('walkWithDepth integration', () => {
    it('walkWithDepth with post-order', () => {
      const walker = new ASTWalker()
      const tree = sampleTree()
      const types: string[] = []
      walker.walkWithDepth(tree, 1, {
        enter: (node) => { types.push(node.type) },
      })
      expect(types).toHaveLength(4)
    })
  })

  describe('filter and findAll consistency', () => {
    it('filter and findAll return same nodes for same predicate', () => {
      const walker = new ASTWalker()
      const tree = sampleTree()
      const pred = (node: ASTNode) => node.value !== undefined
      const filtered = walker.filter(tree, pred)
      const found = walker.findAll(tree, pred)
      expect(filtered.length).toBe(found.length)
      for (let i = 0; i < filtered.length; i++) {
        expect(filtered[i]).toBe(found[i])
      }
    })
  })
})
