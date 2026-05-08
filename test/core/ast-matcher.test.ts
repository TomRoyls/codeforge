import { describe, it, expect } from 'vitest'
import { PatternCompiler } from '../../src/core/ast-matcher/pattern-compiler.js'
import { ASTMatcher } from '../../src/core/ast-matcher/ast-matcher.js'
import type { ASTNode, MatchPattern } from '../../src/core/ast-matcher/types.js'

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

function countNodes(node: ASTNode): number {
  let count = 1
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child)
    }
  }
  return count
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
      makeNode('CallExpression', {
        value: 'console.log',
        properties: { callee: 'console.log' },
      }),
    ],
  })
}

describe('PatternCompiler', () => {
  const compiler = new PatternCompiler()

  describe('compile', () => {
    it('compiles a valid pattern and deep clones', () => {
      const pattern: MatchPattern = { type: 'FunctionDeclaration' }
      const compiled = compiler.compile(pattern)
      expect(compiled.type).toBe('FunctionDeclaration')
      compiled.type = 'Changed'
      expect(pattern.type).toBe('FunctionDeclaration')
    })

    it('compiles pattern with value', () => {
      const compiled = compiler.compile({ type: 'Identifier', value: 'foo' })
      expect(compiled.value).toBe('foo')
    })

    it('compiles pattern with properties', () => {
      const compiled = compiler.compile({ type: 'Call', properties: { async: 'true' } })
      expect(compiled.properties).toEqual({ async: 'true' })
    })

    it('compiles pattern with children', () => {
      const compiled = compiler.compile({
        type: 'Program',
        children: [{ type: 'FunctionDeclaration' }],
      })
      expect(compiled.children).toHaveLength(1)
      expect(compiled.children![0]!.type).toBe('FunctionDeclaration')
    })

    it('compiles pattern with captureName', () => {
      const compiled = compiler.compile({ type: 'Func', captureName: 'funcs' })
      expect(compiled.captureName).toBe('funcs')
    })

    it('throws on pattern with empty type', () => {
      expect(() => compiler.compile({ type: '' })).toThrow()
    })

    it('throws on pattern with child with empty type', () => {
      expect(() =>
        compiler.compile({ type: 'Program', children: [{ type: '' }] }),
      ).toThrow()
    })
  })

  describe('compileFromObject', () => {
    it('creates pattern from plain object', () => {
      const compiled = compiler.compileFromObject({ type: 'CallExpression', value: 'foo' })
      expect(compiled.type).toBe('CallExpression')
      expect(compiled.value).toBe('foo')
    })

    it('creates pattern with children from plain object', () => {
      const compiled = compiler.compileFromObject({
        type: 'Program',
        children: [{ type: 'Expr' }],
      })
      expect(compiled.children).toHaveLength(1)
      expect(compiled.children![0]!.type).toBe('Expr')
    })

    it('creates pattern with properties from plain object', () => {
      const compiled = compiler.compileFromObject({
        type: 'Var',
        properties: { kind: 'const' },
      })
      expect(compiled.properties).toEqual({ kind: 'const' })
    })

    it('creates pattern with captureName from plain object', () => {
      const compiled = compiler.compileFromObject({
        type: 'Func',
        captureName: 'allFuncs',
      })
      expect(compiled.captureName).toBe('allFuncs')
    })

    it('throws on object without type', () => {
      expect(() => compiler.compileFromObject({ value: 'foo' })).toThrow()
    })
  })

  describe('validate', () => {
    it('returns empty errors for valid pattern', () => {
      const errors = compiler.validate({ type: 'Func' })
      expect(errors).toHaveLength(0)
    })

    it('returns error for missing type', () => {
      const errors = compiler.validate({ type: '' })
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('type')
    })

    it('returns error for nested invalid child', () => {
      const errors = compiler.validate({
        type: 'Program',
        children: [{ type: '' }, { type: '' }],
      })
      expect(errors).toHaveLength(2)
    })

    it('validates deeply nested children', () => {
      const errors = compiler.validate({
        type: 'A',
        children: [{ type: 'B', children: [{ type: '' }] }],
      })
      expect(errors).toHaveLength(1)
    })

    it('returns no errors for valid nested pattern', () => {
      const errors = compiler.validate({
        type: 'A',
        children: [{ type: 'B', children: [{ type: 'C' }] }],
      })
      expect(errors).toHaveLength(0)
    })
  })

  describe('getCaptureNames', () => {
    it('returns empty for pattern without captures', () => {
      const names = compiler.getCaptureNames({ type: 'Func' })
      expect(names).toEqual([])
    })

    it('returns capture name from pattern', () => {
      const names = compiler.getCaptureNames({ type: 'Func', captureName: 'funcs' })
      expect(names).toEqual(['funcs'])
    })

    it('returns nested capture names', () => {
      const names = compiler.getCaptureNames({
        type: 'Program',
        captureName: 'root',
        children: [
          { type: 'Func', captureName: 'funcs' },
          { type: 'Class', captureName: 'classes' },
        ],
      })
      expect(names).toEqual(['root', 'funcs', 'classes'])
    })

    it('returns deeply nested capture names', () => {
      const names = compiler.getCaptureNames({
        type: 'A',
        children: [
          {
            type: 'B',
            captureName: 'bNode',
            children: [{ type: 'C', captureName: 'cNode' }],
          },
        ],
      })
      expect(names).toEqual(['bNode', 'cNode'])
    })
  })
})

describe('ASTMatcher', () => {
  describe('match', () => {
    const matcher = new ASTMatcher()

    it('matches by type only', () => {
      const node = makeNode('FunctionDeclaration')
      expect(matcher.match(node, { type: 'FunctionDeclaration' })).toBe(true)
    })

    it('matches wildcard type', () => {
      const node = makeNode('FunctionDeclaration')
      expect(matcher.match(node, { type: '*' })).toBe(true)
    })

    it('fails on wrong type', () => {
      const node = makeNode('FunctionDeclaration')
      expect(matcher.match(node, { type: 'ClassDeclaration' })).toBe(false)
    })

    it('matches by type and value', () => {
      const node = makeNode('Identifier', { value: 'foo' })
      expect(matcher.match(node, { type: 'Identifier', value: 'foo' })).toBe(true)
    })

    it('fails on wrong value', () => {
      const node = makeNode('Identifier', { value: 'foo' })
      expect(matcher.match(node, { type: 'Identifier', value: 'bar' })).toBe(false)
    })

    it('fails when value expected but node has none', () => {
      const node = makeNode('Identifier')
      expect(matcher.match(node, { type: 'Identifier', value: 'foo' })).toBe(false)
    })

    it('matches by type and properties', () => {
      const node = makeNode('FunctionDeclaration', {
        properties: { async: 'true', name: 'fetch' },
      })
      expect(
        matcher.match(node, {
          type: 'FunctionDeclaration',
          properties: { async: 'true' },
        }),
      ).toBe(true)
    })

    it('matches by type and multiple properties', () => {
      const node = makeNode('Var', { properties: { kind: 'const', name: 'x' } })
      expect(
        matcher.match(node, {
          type: 'Var',
          properties: { kind: 'const', name: 'x' },
        }),
      ).toBe(true)
    })

    it('fails when property does not match', () => {
      const node = makeNode('Var', { properties: { kind: 'let' } })
      expect(
        matcher.match(node, { type: 'Var', properties: { kind: 'const' } }),
      ).toBe(false)
    })

    it('fails when property is missing', () => {
      const node = makeNode('Var', { properties: { kind: 'const' } })
      expect(
        matcher.match(node, { type: 'Var', properties: { name: 'x' } }),
      ).toBe(false)
    })

    it('matches with children pattern (order-independent)', () => {
      const node = makeNode('Program', {
        children: [
          makeNode('FunctionDeclaration'),
          makeNode('ClassDeclaration'),
        ],
      })
      expect(
        matcher.match(node, {
          type: 'Program',
          children: [{ type: 'ClassDeclaration' }],
        }),
      ).toBe(true)
    })

    it('matches with multiple children patterns', () => {
      const node = makeNode('Program', {
        children: [
          makeNode('FunctionDeclaration'),
          makeNode('ClassDeclaration'),
        ],
      })
      expect(
        matcher.match(node, {
          type: 'Program',
          children: [
            { type: 'FunctionDeclaration' },
            { type: 'ClassDeclaration' },
          ],
        }),
      ).toBe(true)
    })

    it('fails when child pattern does not match', () => {
      const node = makeNode('Program', {
        children: [makeNode('FunctionDeclaration')],
      })
      expect(
        matcher.match(node, {
          type: 'Program',
          children: [{ type: 'ClassDeclaration' }],
        }),
      ).toBe(false)
    })

    it('matches node without children against pattern without children', () => {
      const node = makeNode('Identifier')
      expect(matcher.match(node, { type: 'Identifier' })).toBe(true)
    })

    it('matches node with empty children against pattern with children requirement', () => {
      const node = makeNode('Identifier')
      expect(
        matcher.match(node, {
          type: 'Identifier',
          children: [{ type: 'X' }],
        }),
      ).toBe(false)
    })
  })

  describe('findAll', () => {
    const matcher = new ASTMatcher()
    let tree: ASTNode

    beforeEach(() => {
      tree = sampleTree()
    })

    it('finds all FunctionDeclaration nodes', () => {
      const results = matcher.findAll(tree, { type: 'FunctionDeclaration' })
      expect(results).toHaveLength(1)
      expect(results[0]!.node.type).toBe('FunctionDeclaration')
    })

    it('finds all CallExpression nodes', () => {
      const results = matcher.findAll(tree, { type: 'CallExpression' })
      expect(results).toHaveLength(2)
    })

    it('finds all MethodDefinition nodes', () => {
      const results = matcher.findAll(tree, { type: 'MethodDefinition' })
      expect(results).toHaveLength(2)
    })

    it('finds nested nodes', () => {
      const results = matcher.findAll(tree, { type: 'ReturnStatement' })
      expect(results).toHaveLength(1)
      expect(results[0]!.node.type).toBe('ReturnStatement')
    })

    it('returns empty for no matches', () => {
      const results = matcher.findAll(tree, { type: 'NonExistent' })
      expect(results).toHaveLength(0)
    })

    it('finds matches at different depths', () => {
      const results = matcher.findAll(tree, { type: 'Identifier' })
      expect(results).toHaveLength(1)
      expect(results[0]!.depth).toBe(2)
    })

    it('finds root node with wildcard', () => {
      const results = matcher.findAll(tree, { type: 'Program' })
      expect(results).toHaveLength(1)
      expect(results[0]!.depth).toBe(0)
    })

    it('matches by type and value in findAll', () => {
      const results = matcher.findAll(tree, {
        type: 'CallExpression',
        value: 'fetch',
      })
      expect(results).toHaveLength(1)
    })

    it('populates depth in results', () => {
      const results = matcher.findAll(tree, { type: '*' })
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.depth).toBe(0)
    })
  })

  describe('findFirst', () => {
    const matcher = new ASTMatcher()
    let tree: ASTNode

    beforeEach(() => {
      tree = sampleTree()
    })

    it('returns first match', () => {
      const result = matcher.findFirst(tree, { type: 'CallExpression' })
      expect(result).toBeDefined()
      expect(result!.node.type).toBe('CallExpression')
    })

    it('returns undefined when no match', () => {
      const result = matcher.findFirst(tree, { type: 'NonExistent' })
      expect(result).toBeUndefined()
    })

    it('returns first match for wildcard', () => {
      const result = matcher.findFirst(tree, { type: '*' })
      expect(result).toBeDefined()
      expect(result!.node.type).toBe('Program')
    })

    it('returns match with correct depth', () => {
      const result = matcher.findFirst(tree, { type: 'MethodDefinition' })
      expect(result).toBeDefined()
      expect(result!.depth).toBe(2)
    })
  })

  describe('capture', () => {
    const matcher = new ASTMatcher()
    let tree: ASTNode

    beforeEach(() => {
      tree = sampleTree()
    })

    it('captures named nodes', () => {
      const results = matcher.capture(tree, {
        type: 'FunctionDeclaration',
        captureName: 'funcs',
      })
      expect(results).toHaveLength(1)
      const captured = results[0]!.captures.get('funcs')
      expect(captured).toBeDefined()
      expect(captured!.length).toBeGreaterThanOrEqual(1)
    })

    it('captures nested pattern with captureName', () => {
      const results = matcher.capture(tree, {
        type: 'Program',
        children: [
          { type: 'FunctionDeclaration', captureName: 'topFuncs' },
        ],
      })
      expect(results).toHaveLength(1)
      const captured = results[0]!.captures.get('topFuncs')
      expect(captured).toBeDefined()
      expect(captured!.length).toBeGreaterThanOrEqual(1)
      expect(captured![0]!.type).toBe('FunctionDeclaration')
    })

    it('captures multiple named nodes', () => {
      const results = matcher.capture(tree, {
        type: 'MethodDefinition',
        captureName: 'methods',
      })
      expect(results).toHaveLength(2)
      for (const result of results) {
        const captured = result.captures.get('methods')
        expect(captured).toBeDefined()
        expect(captured!.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('returns empty captures for no matches', () => {
      const results = matcher.capture(tree, {
        type: 'NonExistent',
        captureName: 'nothing',
      })
      expect(results).toHaveLength(0)
    })
  })

  describe('count', () => {
    const matcher = new ASTMatcher()
    let tree: ASTNode

    beforeEach(() => {
      tree = sampleTree()
    })

    it('counts matches', () => {
      expect(matcher.count(tree, { type: 'CallExpression' })).toBe(2)
    })

    it('counts zero for no matches', () => {
      expect(matcher.count(tree, { type: 'NonExistent' })).toBe(0)
    })

    it('counts single match', () => {
      expect(matcher.count(tree, { type: 'Program' })).toBe(1)
    })

    it('counts multiple matches', () => {
      expect(matcher.count(tree, { type: 'MethodDefinition' })).toBe(2)
    })

    it('counts with value filter', () => {
      expect(
        matcher.count(tree, { type: 'CallExpression', value: 'fetch' }),
      ).toBe(1)
    })
  })

  describe('getPath', () => {
    const matcher = new ASTMatcher()
    let tree: ASTNode

    beforeEach(() => {
      tree = sampleTree()
    })

    it('returns path to match', () => {
      const paths = matcher.getPath(tree, { type: 'MethodDefinition' })
      expect(paths).toHaveLength(2)
      expect(paths[0]!.length).toBe(3)
      expect(paths[0]![0]!.type).toBe('Program')
      expect(paths[0]![1]!.type).toBe('ClassDeclaration')
      expect(paths[0]![2]!.type).toBe('MethodDefinition')
    })

    it('returns path for root match', () => {
      const paths = matcher.getPath(tree, { type: 'Program' })
      expect(paths).toHaveLength(1)
      expect(paths[0]).toHaveLength(1)
      expect(paths[0]![0]!.type).toBe('Program')
    })

    it('returns path for deeply nested match', () => {
      const paths = matcher.getPath(tree, { type: 'ReturnStatement' })
      expect(paths).toHaveLength(1)
      expect(paths[0]!.length).toBe(4)
      expect(paths[0]![0]!.type).toBe('Program')
      expect(paths[0]![1]!.type).toBe('FunctionDeclaration')
      expect(paths[0]![2]!.type).toBe('BlockStatement')
      expect(paths[0]![3]!.type).toBe('ReturnStatement')
    })

    it('returns empty for no match', () => {
      const paths = matcher.getPath(tree, { type: 'NonExistent' })
      expect(paths).toHaveLength(0)
    })

    it('returns correct paths for multiple matches', () => {
      const paths = matcher.getPath(tree, { type: 'CallExpression' })
      expect(paths).toHaveLength(2)
    })
  })

  describe('getConfig', () => {
    it('returns default config', () => {
      const matcher = new ASTMatcher()
      const config = matcher.getConfig()
      expect(config.maxDepth).toBe(100)
      expect(config.caseSensitive).toBe(true)
    })

    it('returns custom config', () => {
      const matcher = new ASTMatcher({ maxDepth: 5, caseSensitive: false })
      const config = matcher.getConfig()
      expect(config.maxDepth).toBe(5)
      expect(config.caseSensitive).toBe(false)
    })

    it('returns partial custom config with defaults', () => {
      const matcher = new ASTMatcher({ maxDepth: 50 })
      const config = matcher.getConfig()
      expect(config.maxDepth).toBe(50)
      expect(config.caseSensitive).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty tree', () => {
      const matcher = new ASTMatcher()
      const empty = makeNode('Root')
      expect(matcher.findAll(empty, { type: 'X' })).toHaveLength(0)
      expect(matcher.findFirst(empty, { type: 'X' })).toBeUndefined()
      expect(matcher.count(empty, { type: 'X' })).toBe(0)
      expect(matcher.getPath(empty, { type: 'X' })).toHaveLength(0)
    })

    it('handles deep nesting up to maxDepth', () => {
      const matcher = new ASTMatcher({ maxDepth: 5 })
      let current = makeNode('Level0')
      const root = current
      for (let i = 1; i <= 10; i++) {
        const child = makeNode(`Level${i}`)
        current.children = [child]
        current = child
      }
      expect(matcher.count(root, { type: 'Level4' })).toBe(1)
      expect(matcher.count(root, { type: 'Level6' })).toBe(0)
    })

    it('maxDepth 0 only matches root', () => {
      const matcher = new ASTMatcher({ maxDepth: 0 })
      const tree = makeNode('Root', {
        children: [makeNode('Child')],
      })
      expect(matcher.count(tree, { type: 'Root' })).toBe(1)
      expect(matcher.count(tree, { type: 'Child' })).toBe(0)
    })

    it('case insensitive matching', () => {
      const matcher = new ASTMatcher({ caseSensitive: false })
      const node = makeNode('FunctionDeclaration')
      expect(matcher.match(node, { type: 'functiondeclaration' })).toBe(true)
      expect(matcher.match(node, { type: 'FUNCTIONDECLARATION' })).toBe(true)
    })

    it('case insensitive value matching', () => {
      const matcher = new ASTMatcher({ caseSensitive: false })
      const node = makeNode('Identifier', { value: 'Foo' })
      expect(matcher.match(node, { type: 'Identifier', value: 'foo' })).toBe(true)
    })

    it('case insensitive property matching', () => {
      const matcher = new ASTMatcher({ caseSensitive: false })
      const node = makeNode('Var', { properties: { kind: 'CONST' } })
      expect(
        matcher.match(node, { type: 'Var', properties: { kind: 'const' } }),
      ).toBe(true)
    })

    it('wildcard type matches everything', () => {
      const matcher = new ASTMatcher()
      const tree = sampleTree()
      const results = matcher.findAll(tree, { type: '*' })
      expect(results.length).toBeGreaterThan(5)
    })

    it('node with no children field matches pattern without children', () => {
      const matcher = new ASTMatcher()
      const node: ASTNode = { type: 'Leaf', properties: {} }
      expect(matcher.match(node, { type: 'Leaf' })).toBe(true)
    })

    it('node with undefined children matches pattern with children requiring none', () => {
      const matcher = new ASTMatcher()
      const node: ASTNode = { type: 'Leaf', properties: {} }
      expect(matcher.match(node, { type: 'Leaf' })).toBe(true)
    })

    it('complex nested tree with multiple match types', () => {
      const matcher = new ASTMatcher()
      const tree = makeNode('Root', {
        children: [
          makeNode('A', {
            children: [
              makeNode('B'),
              makeNode('C', { children: [makeNode('D')] }),
            ],
          }),
          makeNode('B'),
        ],
      })
      expect(matcher.count(tree, { type: 'B' })).toBe(2)
      expect(matcher.count(tree, { type: 'D' })).toBe(1)
      expect(matcher.count(tree, { type: 'A' })).toBe(1)
    })

    it('captures with multiple captureNames in nested pattern', () => {
      const matcher = new ASTMatcher()
      const tree = makeNode('Root', {
        children: [
          makeNode('A', {
            children: [makeNode('B')],
          }),
        ],
      })
      const results = matcher.capture(tree, {
        type: 'Root',
        captureName: 'root',
        children: [
          {
            type: 'A',
            captureName: 'aNodes',
            children: [{ type: 'B', captureName: 'bNodes' }],
          },
        ],
      })
      expect(results).toHaveLength(1)
      expect(results[0]!.captures.get('root')).toBeDefined()
      expect(results[0]!.captures.get('aNodes')).toBeDefined()
      expect(results[0]!.captures.get('bNodes')).toBeDefined()
    })

    it('path returns correct ancestor chain', () => {
      const matcher = new ASTMatcher()
      const tree = makeNode('Root', {
        children: [
          makeNode('Parent', {
            children: [makeNode('Target')],
          }),
        ],
      })
      const paths = matcher.getPath(tree, { type: 'Target' })
      expect(paths).toHaveLength(1)
      expect(paths[0]!.map((n) => n.type)).toEqual(['Root', 'Parent', 'Target'])
    })

    it('findAll returns results in depth-first order', () => {
      const matcher = new ASTMatcher()
      const tree = makeNode('Root', {
        children: [
          makeNode('X', { children: [makeNode('Y')] }),
          makeNode('Y'),
        ],
      })
      const results = matcher.findAll(tree, { type: 'Y' })
      expect(results).toHaveLength(2)
      expect(results[0]!.depth).toBe(2)
      expect(results[1]!.depth).toBe(1)
    })

    it('findAll wildcard counts all nodes in tree', () => {
      const matcher = new ASTMatcher()
      const tree = sampleTree()
      const allResults = matcher.findAll(tree, { type: '*' })
      const manualCount = countNodes(tree)
      expect(allResults.length).toBe(manualCount)
    })

    it('match by type value and properties combined', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Func', {
        value: 'foo',
        properties: { async: 'true', name: 'foo' },
      })
      expect(
        matcher.match(node, {
          type: 'Func',
          value: 'foo',
          properties: { async: 'true' },
        }),
      ).toBe(true)
    })
  })
})
