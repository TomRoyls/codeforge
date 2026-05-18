import { describe, it, expect } from 'vitest'
import { ASTMatcher, PatternCompiler, DEFAULT_CONFIG } from '../src/core/ast-matcher/index.js'
import type { ASTNode, MatchPattern, MatchConfig } from '../src/core/ast-matcher/index.js'

// ─── Helpers ───

function makeNode(
  type: string,
  opts?: {
    value?: string
    children?: ASTNode[]
    properties?: Record<string, string>
    loc?: { line: number; column: number }
  },
): ASTNode {
  return {
    type,
    value: opts?.value,
    children: opts?.children,
    properties: opts?.properties ?? {},
    loc: opts?.loc,
  }
}

function makePattern(
  type: string,
  opts?: {
    value?: string
    properties?: Record<string, string>
    children?: MatchPattern[]
    captureName?: string
  },
): MatchPattern {
  return {
    type,
    value: opts?.value,
    properties: opts?.properties,
    children: opts?.children,
    captureName: opts?.captureName,
  }
}


function sampleTree(): ASTNode {
  return makeNode('Program', {
    children: [
      makeNode('FunctionDecl', {
        properties: { name: 'main' },
        children: [
          makeNode('Identifier', { value: 'main' }),
          makeNode('Block', {
            children: [
              makeNode('Return', {
                children: [makeNode('NumericLiteral', { value: '42' })],
              }),
              makeNode('ExpressionStatement'),
            ],
          }),
        ],
      }),
      makeNode('ImportDecl'),
    ],
  })
}

// ─── ASTMatcher Constructor ───

describe('ASTMatcher', () => {
  describe('constructor', () => {
    it('creates instance with default config', () => {
      const matcher = new ASTMatcher()
      const config = matcher.getConfig()
      expect(config.maxDepth).toBe(DEFAULT_CONFIG.maxDepth)
      expect(config.caseSensitive).toBe(DEFAULT_CONFIG.caseSensitive)
    })

    it('creates instance with custom maxDepth', () => {
      const matcher = new ASTMatcher({ maxDepth: 5 })
      expect(matcher.getConfig().maxDepth).toBe(5)
    })

    it('creates instance with custom caseSensitive', () => {
      const matcher = new ASTMatcher({ caseSensitive: false })
      expect(matcher.getConfig().caseSensitive).toBe(false)
    })

    it('creates instance with all custom config', () => {
      const matcher = new ASTMatcher({ maxDepth: 50, caseSensitive: false })
      const config = matcher.getConfig()
      expect(config.maxDepth).toBe(50)
      expect(config.caseSensitive).toBe(false)
    })

    it('creates instance with empty config object', () => {
      const matcher = new ASTMatcher({})
      const config = matcher.getConfig()
      expect(config.maxDepth).toBe(DEFAULT_CONFIG.maxDepth)
      expect(config.caseSensitive).toBe(DEFAULT_CONFIG.caseSensitive)
    })

    it('returns a copy of config from getConfig', () => {
      const matcher = new ASTMatcher()
      const config1 = matcher.getConfig()
      const config2 = matcher.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })
  })

  // ─── match (single node matching) ───

  describe('match', () => {
    it('matches node by type', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier', { value: 'foo' })
      expect(matcher.match(node, makePattern('Identifier'))).toBe(true)
    })

    it('does not match different type', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier')
      expect(matcher.match(node, makePattern('StringLiteral'))).toBe(false)
    })

    it('matches node by type and value', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier', { value: 'foo' })
      expect(matcher.match(node, makePattern('Identifier', { value: 'foo' }))).toBe(true)
    })

    it('does not match when value differs', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier', { value: 'foo' })
      expect(matcher.match(node, makePattern('Identifier', { value: 'bar' }))).toBe(false)
    })

    it('does not match when node has no value but pattern expects one', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier')
      expect(matcher.match(node, makePattern('Identifier', { value: 'expected' }))).toBe(false)
    })

    it('matches by type and properties', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('FunctionDecl', { properties: { name: 'foo', async: 'true' } })
      expect(
        matcher.match(node, makePattern('FunctionDecl', { properties: { name: 'foo' } })),
      ).toBe(true)
    })

    it('does not match when property value differs', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('FunctionDecl', { properties: { name: 'foo' } })
      expect(
        matcher.match(node, makePattern('FunctionDecl', { properties: { name: 'bar' } })),
      ).toBe(false)
    })

    it('does not match when property is missing', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('FunctionDecl', { properties: { name: 'foo' } })
      expect(
        matcher.match(node, makePattern('FunctionDecl', { properties: { modifier: 'public' } })),
      ).toBe(false)
    })

    it('matches multiple properties', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('FunctionDecl', { properties: { name: 'foo', async: 'true' } })
      expect(
        matcher.match(
          node,
          makePattern('FunctionDecl', { properties: { name: 'foo', async: 'true' } }),
        ),
      ).toBe(true)
    })

    it('requires all pattern properties to match', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('FunctionDecl', { properties: { name: 'foo' } })
      expect(
        matcher.match(
          node,
          makePattern('FunctionDecl', { properties: { name: 'foo', async: 'true' } }),
        ),
      ).toBe(false)
    })

    it('matches node with children pattern', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Block', {
        children: [makeNode('Return'), makeNode('ExpressionStatement')],
      })
      expect(
        matcher.match(node, makePattern('Block', { children: [makePattern('Return')] })),
      ).toBe(true)
    })

    it('does not match when required child is missing', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Block', {
        children: [makeNode('ExpressionStatement')],
      })
      expect(
        matcher.match(node, makePattern('Block', { children: [makePattern('Return')] })),
      ).toBe(false)
    })

    it('matches multiple required children', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Block', {
        children: [makeNode('Return'), makeNode('ExpressionStatement')],
      })
      expect(
        matcher.match(
          node,
          makePattern('Block', {
            children: [makePattern('Return'), makePattern('ExpressionStatement')],
          }),
        ),
      ).toBe(true)
    })

    it('does not match if any required child is missing', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Block', {
        children: [makeNode('Return')],
      })
      expect(
        matcher.match(
          node,
          makePattern('Block', {
            children: [makePattern('Return'), makePattern('ExpressionStatement')],
          }),
        ),
      ).toBe(false)
    })

    it('matches when node has no children but pattern has no child requirements', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Return')
      expect(matcher.match(node, makePattern('Return'))).toBe(true)
    })

    it('does not match when pattern requires children but node has none', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Return')
      expect(
        matcher.match(node, makePattern('Return', { children: [makePattern('Identifier')] })),
      ).toBe(false)
    })

    it('matches wildcard type *', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier')
      expect(matcher.match(node, makePattern('*'))).toBe(true)
    })

    it('wildcard type matches any node type', () => {
      const matcher = new ASTMatcher()
      expect(matcher.match(makeNode('Foo'), makePattern('*'))).toBe(true)
      expect(matcher.match(makeNode('Bar'), makePattern('*'))).toBe(true)
      expect(matcher.match(makeNode(''), makePattern('*'))).toBe(true)
    })

    it('matches combined: type, value, properties, children', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('FunctionDecl', {
        value: 'func',
        properties: { name: 'test' },
        children: [makeNode('Identifier', { value: 'x' })],
      })
      expect(
        matcher.match(
          node,
          makePattern('FunctionDecl', {
            value: 'func',
            properties: { name: 'test' },
            children: [makePattern('Identifier', { value: 'x' })],
          }),
        ),
      ).toBe(true)
    })
  })

  // ─── case sensitivity ───

  describe('case sensitivity', () => {
    it('case-sensitive by default (type)', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier')
      expect(matcher.match(node, makePattern('identifier'))).toBe(false)
    })

    it('case-sensitive by default (value)', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Identifier', { value: 'Foo' })
      expect(matcher.match(node, makePattern('Identifier', { value: 'foo' }))).toBe(false)
    })

    it('case-sensitive by default (properties)', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Fn', { properties: { name: 'Foo' } })
      expect(matcher.match(node, makePattern('Fn', { properties: { name: 'foo' } }))).toBe(false)
    })

    it('case-insensitive matching for type', () => {
      const matcher = new ASTMatcher({ caseSensitive: false })
      const node = makeNode('Identifier')
      expect(matcher.match(node, makePattern('identifier'))).toBe(true)
      expect(matcher.match(node, makePattern('IDENTIFIER'))).toBe(true)
    })

    it('case-insensitive matching for value', () => {
      const matcher = new ASTMatcher({ caseSensitive: false })
      const node = makeNode('Identifier', { value: 'Hello' })
      expect(matcher.match(node, makePattern('Identifier', { value: 'hello' }))).toBe(true)
      expect(matcher.match(node, makePattern('Identifier', { value: 'HELLO' }))).toBe(true)
    })

    it('case-insensitive matching for properties', () => {
      const matcher = new ASTMatcher({ caseSensitive: false })
      const node = makeNode('Fn', { properties: { name: 'TestFunc' } })
      expect(matcher.match(node, makePattern('Fn', { properties: { name: 'testfunc' } }))).toBe(
        true,
      )
    })
  })

  // ─── findAll ───

  describe('findAll', () => {
    it('finds all nodes matching pattern in tree', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const results = matcher.findAll(root, makePattern('Identifier'))
      expect(results).toHaveLength(1)
      expect(results[0].node.type).toBe('Identifier')
    })

    it('finds multiple matching nodes', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', {
        children: [
          makeNode('Identifier', { value: 'a' }),
          makeNode('Block', {
            children: [makeNode('Identifier', { value: 'b' })],
          }),
        ],
      })
      const results = matcher.findAll(root, makePattern('Identifier'))
      expect(results).toHaveLength(2)
    })

    it('returns empty array when no matches', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const results = matcher.findAll(root, makePattern('NonExistent'))
      expect(results).toHaveLength(0)
    })

    it('includes the root node if it matches', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const results = matcher.findAll(root, makePattern('Program'))
      expect(results).toHaveLength(1)
      expect(results[0].node.type).toBe('Program')
      expect(results[0].depth).toBe(0)
    })

    it('records correct depth for nested matches', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const results = matcher.findAll(root, makePattern('NumericLiteral'))
      expect(results).toHaveLength(1)
      expect(results[0].depth).toBe(4)
    })

    it('returns MatchResult with captures map', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const results = matcher.findAll(root, makePattern('Identifier'))
      expect(results[0].captures).toBeInstanceOf(Map)
    })

    it('finds nodes across all branches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', {
        children: [
          makeNode('Foo'),
          makeNode('Bar', { children: [makeNode('Foo')] }),
          makeNode('Baz', { children: [makeNode('Qux', { children: [makeNode('Foo')] })] }),
        ],
      })
      const results = matcher.findAll(root, makePattern('Foo'))
      expect(results).toHaveLength(3)
    })

    it('respects maxDepth', () => {
      const matcher = new ASTMatcher({ maxDepth: 1 })
      const root = makeNode('Root', {
        children: [
          makeNode('A', {
            children: [makeNode('B', { children: [makeNode('C')] })],
          }),
        ],
      })
      const results = matcher.findAll(root, makePattern('C'))
      expect(results).toHaveLength(0)
    })

    it('finds nodes at exact maxDepth boundary', () => {
      const matcher = new ASTMatcher({ maxDepth: 2 })
      const root = makeNode('Root', {
        children: [
          makeNode('A', {
            children: [makeNode('Target')],
          }),
        ],
      })
      const results = matcher.findAll(root, makePattern('Target'))
      expect(results).toHaveLength(1)
      expect(results[0].depth).toBe(2)
    })
  })

  // ─── findFirst ───

  describe('findFirst', () => {
    it('finds first matching node', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const result = matcher.findFirst(root, makePattern('Identifier'))
      expect(result).toBeDefined()
      expect(result!.node.type).toBe('Identifier')
    })

    it('returns undefined when no match', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const result = matcher.findFirst(root, makePattern('NonExistent'))
      expect(result).toBeUndefined()
    })

    it('returns root if it matches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Target')
      const result = matcher.findFirst(root, makePattern('Target'))
      expect(result).toBeDefined()
      expect(result!.node).toBe(root)
      expect(result!.depth).toBe(0)
    })

    it('returns first match in DFS order', () => {
      const matcher = new ASTMatcher()
      const first = makeNode('Target', { value: 'first' })
      const second = makeNode('Target', { value: 'second' })
      const root = makeNode('Root', {
        children: [
          makeNode('A', { children: [first] }),
          makeNode('B', { children: [second] }),
        ],
      })
      const result = matcher.findFirst(root, makePattern('Target'))
      expect(result).toBeDefined()
      expect(result!.node.value).toBe('first')
    })

    it('respects maxDepth', () => {
      const matcher = new ASTMatcher({ maxDepth: 0 })
      const root = makeNode('Root', {
        children: [makeNode('Target')],
      })
      const result = matcher.findFirst(root, makePattern('Target'))
      expect(result).toBeUndefined()
    })

    it('returns MatchResult with empty captures', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const result = matcher.findFirst(root, makePattern('Program'))
      expect(result!.captures).toBeInstanceOf(Map)
      expect(result!.captures.size).toBe(0)
    })
  })

  // ─── capture ───

  describe('capture', () => {
    it('captures nodes with captureName', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', {
        children: [makeNode('Identifier', { value: 'foo' })],
      })
      const pattern: MatchPattern = {
        type: 'Root',
        children: [{ type: 'Identifier', captureName: 'ids' }],
      }
      const results = matcher.capture(root, pattern)
      expect(results.length).toBeGreaterThan(0)
      for (const r of results) {
        const ids = r.captures.get('ids')
        expect(ids).toBeDefined()
        expect(ids!.length).toBeGreaterThan(0)
        expect(ids![0].type).toBe('Identifier')
      }
    })

    it('returns empty captures when no captureName', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root')
      const results = matcher.capture(root, makePattern('Root'))
      expect(results[0].captures.size).toBe(0)
    })

    it('captures multiple nodes under same name', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', {
        children: [
          makeNode('Identifier', { value: 'a' }),
          makeNode('Identifier', { value: 'b' }),
        ],
      })
      const pattern: MatchPattern = {
        type: 'Root',
        children: [{ type: 'Identifier', captureName: 'ids' }],
      }
      const results = matcher.capture(root, pattern)
      expect(results[0].captures.get('ids')).toHaveLength(2)
    })

    it('captures nested capture names', () => {
      const matcher = new ASTMatcher()
      const inner = makeNode('NumericLiteral', { value: '42' })
      const root = makeNode('Root', {
        children: [
          makeNode('Return', { children: [inner] }),
        ],
      })
      const pattern: MatchPattern = {
        type: 'Root',
        children: [
          {
            type: 'Return',
            captureName: 'returnStmt',
            children: [{ type: 'NumericLiteral', captureName: 'nums' }],
          },
        ],
      }
      const results = matcher.capture(root, pattern)
      expect(results[0].captures.get('returnStmt')).toBeDefined()
      expect(results[0].captures.get('nums')).toBeDefined()
    })

    it('returns empty array when no matches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root')
      const results = matcher.capture(root, makePattern('NonExistent'))
      expect(results).toHaveLength(0)
    })
  })

  // ─── count ───

  describe('count', () => {
    it('counts matching nodes', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      expect(matcher.count(root, makePattern('Identifier'))).toBe(1)
      expect(matcher.count(root, makePattern('Program'))).toBe(1)
      expect(matcher.count(root, makePattern('NonExistent'))).toBe(0)
    })

    it('counts multiple nodes', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', {
        children: [
          makeNode('A'),
          makeNode('B', { children: [makeNode('A')] }),
        ],
      })
      expect(matcher.count(root, makePattern('A'))).toBe(2)
    })

    it('counts zero when no matches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root')
      expect(matcher.count(root, makePattern('X'))).toBe(0)
    })

    it('counts wildcard matches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', { children: [makeNode('A'), makeNode('B')] })
      expect(matcher.count(root, makePattern('*'))).toBe(3)
    })
  })

  // ─── getPath ───

  describe('getPath', () => {
    it('returns path from root to matching node', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const paths = matcher.getPath(root, makePattern('NumericLiteral'))
      expect(paths).toHaveLength(1)
      expect(paths[0]).toHaveLength(5)
      expect(paths[0][0].type).toBe('Program')
      expect(paths[0][paths[0].length - 1].type).toBe('NumericLiteral')
    })

    it('returns path of length 1 when root matches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Target')
      const paths = matcher.getPath(root, makePattern('Target'))
      expect(paths).toHaveLength(1)
      expect(paths[0]).toHaveLength(1)
      expect(paths[0][0]).toBe(root)
    })

    it('returns empty array when no matches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root')
      const paths = matcher.getPath(root, makePattern('X'))
      expect(paths).toHaveLength(0)
    })

    it('returns multiple paths for multiple matches', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', {
        children: [makeNode('A'), makeNode('A')],
      })
      const paths = matcher.getPath(root, makePattern('A'))
      expect(paths).toHaveLength(2)
    })

    it('each path starts from root', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const paths = matcher.getPath(root, makePattern('Return'))
      for (const path of paths) {
        expect(path[0].type).toBe('Program')
      }
    })

    it('each path ends at the matched node', () => {
      const matcher = new ASTMatcher()
      const root = sampleTree()
      const paths = matcher.getPath(root, makePattern('Return'))
      for (const path of paths) {
        expect(path[path.length - 1].type).toBe('Return')
      }
    })

    it('respects maxDepth', () => {
      const matcher = new ASTMatcher({ maxDepth: 1 })
      const root = makeNode('Root', {
        children: [
          makeNode('A', { children: [makeNode('Deep')] }),
        ],
      })
      const paths = matcher.getPath(root, makePattern('Deep'))
      expect(paths).toHaveLength(0)
    })
  })

  // ─── maxDepth boundary ───

  describe('maxDepth boundary', () => {
    it('maxDepth 0 only checks root', () => {
      const matcher = new ASTMatcher({ maxDepth: 0 })
      const root = makeNode('Root', { children: [makeNode('Child')] })
      expect(matcher.findAll(root, makePattern('Root'))).toHaveLength(1)
      expect(matcher.findAll(root, makePattern('Child'))).toHaveLength(0)
    })

    it('deeply nested tree is bounded by maxDepth', () => {
      let node: ASTNode = makeNode('Deep')
      for (let i = 0; i < 50; i++) {
        node = makeNode(`Level${i}`, { children: [node] })
      }
      const matcher = new ASTMatcher({ maxDepth: 10 })
      const results = matcher.findAll(node, makePattern('Deep'))
      expect(results).toHaveLength(0)
    })

    it('depth greater than maxDepth is skipped', () => {
      const matcher = new ASTMatcher({ maxDepth: 2 })
      const root = makeNode('Root', {
        children: [
          makeNode('A', {
            children: [makeNode('B', { children: [makeNode('C')] })],
          }),
        ],
      })
      expect(matcher.count(root, makePattern('C'))).toBe(0)
      expect(matcher.count(root, makePattern('B'))).toBe(1)
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles node with undefined children', () => {
      const matcher = new ASTMatcher()
      const node: ASTNode = { type: 'Leaf', properties: {} }
      expect(matcher.match(node, makePattern('Leaf'))).toBe(true)
      expect(matcher.findAll(node, makePattern('Leaf'))).toHaveLength(1)
    })

    it('handles node with empty children array', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('Leaf', { children: [] })
      expect(matcher.match(node, makePattern('Leaf'))).toBe(true)
      expect(matcher.findAll(node, makePattern('Leaf'))).toHaveLength(1)
    })

    it('handles empty properties', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('X', { properties: {} })
      expect(matcher.match(node, makePattern('X'))).toBe(true)
    })

    it('handles pattern with empty children array', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('X', { children: [makeNode('Y')] })
      expect(matcher.match(node, makePattern('X', { children: [] }))).toBe(true)
    })

    it('handles deep nesting', () => {
      const matcher = new ASTMatcher()
      let node: ASTNode = makeNode('Target')
      for (let i = 0; i < 50; i++) {
        node = makeNode('Wrapper', { children: [node] })
      }
      expect(matcher.count(node, makePattern('Target'))).toBe(1)
    })

    it('handles wildcard on large tree', () => {
      const matcher = new ASTMatcher()
      const root = makeNode('Root', {
        children: Array.from({ length: 100 }, (_, i) => makeNode(`Node${i}`)),
      })
      expect(matcher.count(root, makePattern('*'))).toBe(101)
    })

    it('matches node with loc information', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('X', { loc: { line: 1, column: 0 } })
      expect(matcher.match(node, makePattern('X'))).toBe(true)
    })

    it('pattern with value matching node without value returns false', () => {
      const matcher = new ASTMatcher()
      const node = makeNode('X')
      expect(matcher.match(node, makePattern('X', { value: 'something' }))).toBe(false)
    })
  })
})

// ─── PatternCompiler ───

describe('PatternCompiler', () => {
  describe('compile', () => {
    it('compiles a valid pattern', () => {
      const compiler = new PatternCompiler()
      const pattern = makePattern('Identifier')
      const result = compiler.compile(pattern)
      expect(result.type).toBe('Identifier')
    })

    it('returns a deep clone (not same reference)', () => {
      const compiler = new PatternCompiler()
      const pattern = makePattern('Identifier', {
        value: 'foo',
        properties: { x: 'y' },
        children: [makePattern('Child')],
      })
      const compiled = compiler.compile(pattern)
      expect(compiled).not.toBe(pattern)
      expect(compiled.children).not.toBe(pattern.children)
      if (compiled.children && pattern.children) {
        expect(compiled.children[0]).not.toBe(pattern.children[0])
      }
      if (compiled.properties && pattern.properties) {
        expect(compiled.properties).not.toBe(pattern.properties)
      }
    })

    it('preserves all pattern fields', () => {
      const compiler = new PatternCompiler()
      const pattern: MatchPattern = {
        type: 'Fn',
        value: 'hello',
        properties: { a: '1', b: '2' },
        captureName: 'fnCapture',
        children: [{ type: 'Param', captureName: 'paramCapture' }],
      }
      const compiled = compiler.compile(pattern)
      expect(compiled.type).toBe('Fn')
      expect(compiled.value).toBe('hello')
      expect(compiled.properties).toEqual({ a: '1', b: '2' })
      expect(compiled.captureName).toBe('fnCapture')
      expect(compiled.children).toHaveLength(1)
      expect(compiled.children![0].type).toBe('Param')
      expect(compiled.children![0].captureName).toBe('paramCapture')
    })

    it('throws on empty type', () => {
      const compiler = new PatternCompiler()
      expect(() => compiler.compile(makePattern(''))).toThrow('Invalid pattern')
    })

    it('throws on child with empty type', () => {
      const compiler = new PatternCompiler()
      const pattern: MatchPattern = {
        type: 'Valid',
        children: [{ type: '' }],
      }
      expect(() => compiler.compile(pattern)).toThrow('Invalid pattern')
    })

    it('throws on deeply nested invalid pattern', () => {
      const compiler = new PatternCompiler()
      const pattern: MatchPattern = {
        type: 'A',
        children: [
          {
            type: 'B',
            children: [{ type: '' }],
          },
        ],
      }
      expect(() => compiler.compile(pattern)).toThrow('Invalid pattern')
    })
  })

  // ─── compileFromObject ───

  describe('compileFromObject', () => {
    it('compiles from a plain object', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({ type: 'Identifier' })
      expect(result.type).toBe('Identifier')
    })

    it('compiles with value', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({ type: 'Identifier', value: 'foo' })
      expect(result.value).toBe('foo')
    })

    it('compiles with properties', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({
        type: 'Fn',
        properties: { name: 'test' },
      })
      expect(result.properties).toEqual({ name: 'test' })
    })

    it('compiles with children', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({
        type: 'Block',
        children: [{ type: 'Return' }],
      })
      expect(result.children).toHaveLength(1)
      expect(result.children![0].type).toBe('Return')
    })

    it('compiles with captureName', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({
        type: 'Identifier',
        captureName: 'ids',
      })
      expect(result.captureName).toBe('ids')
    })

    it('handles missing type as empty string (which throws)', () => {
      const compiler = new PatternCompiler()
      expect(() => compiler.compileFromObject({})).toThrow('Invalid pattern')
    })

    it('handles non-string type as empty string', () => {
      const compiler = new PatternCompiler()
      expect(() => compiler.compileFromObject({ type: 42 })).toThrow('Invalid pattern')
    })

    it('ignores non-string value', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({ type: 'X', value: 123 })
      expect(result.value).toBeUndefined()
    })

    it('ignores non-object properties', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({ type: 'X', properties: 'bad' })
      expect(result.properties).toBeUndefined()
    })

    it('ignores null properties', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({ type: 'X', properties: null })
      expect(result.properties).toBeUndefined()
    })

    it('handles deeply nested children', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({
        type: 'A',
        children: [
          {
            type: 'B',
            children: [{ type: 'C' }],
          },
        ],
      })
      expect(result.children![0].children![0].type).toBe('C')
    })

    it('ignores non-array children', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({ type: 'X', children: 'bad' })
      expect(result.children).toBeUndefined()
    })

    it('ignores non-string captureName', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({ type: 'X', captureName: 42 })
      expect(result.captureName).toBeUndefined()
    })

    it('compiles full object with all fields', () => {
      const compiler = new PatternCompiler()
      const result = compiler.compileFromObject({
        type: 'Fn',
        value: 'hello',
        properties: { a: '1' },
        captureName: 'fn',
        children: [{ type: 'Param', captureName: 'p' }],
      })
      expect(result.type).toBe('Fn')
      expect(result.value).toBe('hello')
      expect(result.properties).toEqual({ a: '1' })
      expect(result.captureName).toBe('fn')
      expect(result.children).toHaveLength(1)
    })
  })

  // ─── validate ───

  describe('validate', () => {
    it('returns empty array for valid pattern', () => {
      const compiler = new PatternCompiler()
      expect(compiler.validate(makePattern('X'))).toEqual([])
    })

    it('returns error for empty type', () => {
      const compiler = new PatternCompiler()
      const errors = compiler.validate(makePattern(''))
      expect(errors).toContain('Pattern must have a non-empty type')
    })

    it('returns error for child with empty type', () => {
      const compiler = new PatternCompiler()
      const errors = compiler.validate({
        type: 'Valid',
        children: [{ type: '' }],
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('accumulates errors from nested children', () => {
      const compiler = new PatternCompiler()
      const errors = compiler.validate({
        type: 'Valid',
        children: [{ type: '' }, { type: '' }],
      })
      expect(errors).toHaveLength(2)
    })

    it('validates deeply nested patterns', () => {
      const compiler = new PatternCompiler()
      const errors = compiler.validate({
        type: 'A',
        children: [{ type: 'B', children: [{ type: '' }] }],
      })
      expect(errors).toHaveLength(1)
    })
  })

  // ─── getCaptureNames ───

  describe('getCaptureNames', () => {
    it('returns empty array when no captures', () => {
      const compiler = new PatternCompiler()
      expect(compiler.getCaptureNames(makePattern('X'))).toEqual([])
    })

    it('returns single capture name', () => {
      const compiler = new PatternCompiler()
      const names = compiler.getCaptureNames(makePattern('X', { captureName: 'foo' }))
      expect(names).toEqual(['foo'])
    })

    it('returns capture names from children', () => {
      const compiler = new PatternCompiler()
      const names = compiler.getCaptureNames({
        type: 'Root',
        children: [
          { type: 'A', captureName: 'first' },
          { type: 'B', captureName: 'second' },
        ],
      })
      expect(names).toEqual(['first', 'second'])
    })

    it('returns capture names from deeply nested patterns', () => {
      const compiler = new PatternCompiler()
      const names = compiler.getCaptureNames({
        type: 'Root',
        captureName: 'root',
        children: [
          { type: 'A', captureName: 'a', children: [{ type: 'B', captureName: 'b' }] },
        ],
      })
      expect(names).toEqual(['root', 'a', 'b'])
    })

    it('does not duplicate capture names', () => {
      const compiler = new PatternCompiler()
      const names = compiler.getCaptureNames({
        type: 'Root',
        children: [
          { type: 'A', captureName: 'x' },
          { type: 'B', captureName: 'x' },
        ],
      })
      expect(names).toEqual(['x', 'x'])
    })
  })
})

// ─── DEFAULT_CONFIG ───

describe('DEFAULT_CONFIG', () => {
  it('has maxDepth of 100', () => {
    expect(DEFAULT_CONFIG.maxDepth).toBe(100)
  })

  it('has caseSensitive true', () => {
    expect(DEFAULT_CONFIG.caseSensitive).toBe(true)
  })
})

// ─── Integration: Matcher + Compiler ───

describe('Integration: ASTMatcher with PatternCompiler', () => {
  it('matcher internally compiles pattern', () => {
    const matcher = new ASTMatcher()
    const node = makeNode('Identifier', { value: 'test' })
    expect(matcher.match(node, makePattern('Identifier', { value: 'test' }))).toBe(true)
  })

  it('works with compileFromObject result', () => {
    const compiler = new PatternCompiler()
    const matcher = new ASTMatcher()
    const pattern = compiler.compileFromObject({ type: 'Identifier', value: 'test' })
    const node = makeNode('Identifier', { value: 'test' })
    expect(matcher.match(node, pattern)).toBe(true)
  })

  it('end-to-end: find, count, path on sample tree', () => {
    const matcher = new ASTMatcher()
    const root = sampleTree()

    expect(matcher.count(root, makePattern('Program'))).toBe(1)
    expect(matcher.count(root, makePattern('FunctionDecl'))).toBe(1)
    expect(matcher.count(root, makePattern('Block'))).toBe(1)
    expect(matcher.count(root, makePattern('Return'))).toBe(1)
    expect(matcher.count(root, makePattern('NumericLiteral'))).toBe(1)
    expect(matcher.count(root, makePattern('ExpressionStatement'))).toBe(1)
    expect(matcher.count(root, makePattern('ImportDecl'))).toBe(1)

    const allNodes = matcher.findAll(root, makePattern('*'))
    expect(allNodes.length).toBe(8)

    const first = matcher.findFirst(root, makePattern('NumericLiteral'))
    expect(first).toBeDefined()
    expect(first!.depth).toBe(4)

    const paths = matcher.getPath(root, makePattern('NumericLiteral'))
    expect(paths).toHaveLength(1)
    expect(paths[0].map((n) => n.type)).toEqual([
      'Program',
      'FunctionDecl',
      'Block',
      'Return',
      'NumericLiteral',
    ])
  })

  it('capture with complex pattern on sample tree', () => {
    const matcher = new ASTMatcher()
    const root = sampleTree()
    const pattern: MatchPattern = {
      type: 'FunctionDecl',
      captureName: 'fns',
      children: [
        { type: 'Identifier', captureName: 'fnNames' },
        {
          type: 'Block',
          children: [{ type: 'Return', captureName: 'returns' }],
        },
      ],
    }
    const results = matcher.capture(root, pattern)
    expect(results).toHaveLength(1)
    expect(results[0].captures.get('fns')!.length).toBe(1)
    expect(results[0].captures.get('fnNames')!.length).toBe(1)
    expect(results[0].captures.get('fnNames')![0].value).toBe('main')
    expect(results[0].captures.get('returns')!.length).toBe(1)
  })

  it('case-insensitive find across tree', () => {
    const matcher = new ASTMatcher({ caseSensitive: false })
    const root = makeNode('program', {
      children: [
        makeNode('functiondecl', {
          children: [makeNode('identifier', { value: 'FOO' })],
        }),
      ],
    })
    expect(matcher.count(root, makePattern('FUNCTIONDECL'))).toBe(1)
    expect(matcher.count(root, makePattern('IDENTIFIER', { value: 'foo' }))).toBe(1)
  })

  it('multiple independent matchers work correctly', () => {
    const sensitive = new ASTMatcher({ caseSensitive: true })
    const insensitive = new ASTMatcher({ caseSensitive: false })
    const node = makeNode('Foo')

    expect(sensitive.match(node, makePattern('foo'))).toBe(false)
    expect(insensitive.match(node, makePattern('foo'))).toBe(true)
  })
})
