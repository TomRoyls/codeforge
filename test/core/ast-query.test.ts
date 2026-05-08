import { describe, it, expect } from 'vitest'
import { QueryParser } from '../../src/core/ast-query/query-parser.js'
import { ASTTraverser } from '../../src/core/ast-query/ast-traverser.js'
import { QueryEngine } from '../../src/core/ast-query/query-engine.js'
import type { ASTNode } from '../../src/core/ast-query/types.js'

function makeNode(
  type: string,
  opts: Partial<{ value: string; children: ASTNode[]; properties: Record<string, unknown> }> = {},
): ASTNode {
  return {
    type,
    value: opts.value,
    children: opts.children ?? [],
    properties: opts.properties ?? {},
    location: { startLine: 1, startCol: 0, endLine: 1, endCol: 1 },
  }
}

function linkParent(root: ASTNode): ASTNode {
  for (const child of root.children) {
    child.parent = root
    linkParent(child)
  }
  return root
}

function sampleAST(): ASTNode {
  const root = makeNode('Program', {
    children: [
      makeNode('ImportDeclaration', { properties: { source: 'react' } }),
      makeNode('FunctionDeclaration', {
        properties: { name: 'fetchData', async: true },
        children: [
          makeNode('Identifier', { properties: { name: 'fetchData' } }),
          makeNode('BlockStatement', {
            children: [
              makeNode('ReturnStatement', {
                children: [makeNode('CallExpression', { properties: { callee: 'fetch' } })],
              }),
            ],
          }),
        ],
      }),
      makeNode('VariableDeclaration', {
        properties: { name: 'count', kind: 'const' },
        children: [makeNode('NumericLiteral', { value: '42' })],
      }),
      makeNode('ClassDeclaration', {
        properties: { name: 'MyClass' },
        children: [
          makeNode('MethodDefinition', {
            properties: { name: 'constructor' },
          }),
          makeNode('MethodDefinition', {
            properties: { name: 'render' },
          }),
        ],
      }),
      makeNode('ExportDefault', { properties: { raw: 'export default' } }),
    ],
  })
  return linkParent(root)
}

describe('QueryParser', () => {
  const parser = new QueryParser()

  describe('type selectors', () => {
    it('parses simple type selector', () => {
      const result = parser.parse('FunctionDeclaration')
      expect(result.nodeType).toBe('FunctionDeclaration')
      expect(result.attributes).toHaveLength(0)
      expect(result.pseudoClasses).toHaveLength(0)
    })

    it('parses another type selector', () => {
      const result = parser.parse('ClassDeclaration')
      expect(result.nodeType).toBe('ClassDeclaration')
    })

    it('parses Identifier type', () => {
      const result = parser.parse('Identifier')
      expect(result.nodeType).toBe('Identifier')
    })

    it('parses compound type name', () => {
      const result = parser.parse('BlockStatement')
      expect(result.nodeType).toBe('BlockStatement')
    })
  })

  describe('universal selector', () => {
    it('parses universal selector', () => {
      const result = parser.parse('*')
      expect(result.nodeType).toBe('*')
    })

    it('universal with attribute', () => {
      const result = parser.parse('*[name="foo"]')
      expect(result.nodeType).toBe('*')
      expect(result.attributes).toHaveLength(1)
    })
  })

  describe('attribute selectors', () => {
    it('parses equals attribute', () => {
      const result = parser.parse('[name="foo"]')
      expect(result.attributes).toHaveLength(1)
      expect(result.attributes[0]).toEqual({
        name: 'name',
        operator: '=',
        value: 'foo',
      })
    })

    it('parses not-equals attribute', () => {
      const result = parser.parse('[name!="bar"]')
      expect(result.attributes[0]).toEqual({
        name: 'name',
        operator: '!=',
        value: 'bar',
      })
    })

    it('parses starts-with attribute', () => {
      const result = parser.parse('[name^="fetch"]')
      expect(result.attributes[0]).toEqual({
        name: 'name',
        operator: '^=',
        value: 'fetch',
      })
    })

    it('parses ends-with attribute', () => {
      const result = parser.parse('[name$="Data"]')
      expect(result.attributes[0]).toEqual({
        name: 'name',
        operator: '$=',
        value: 'Data',
      })
    })

    it('parses contains attribute', () => {
      const result = parser.parse('[name*="ch"]')
      expect(result.attributes[0]).toEqual({
        name: 'name',
        operator: '*=',
        value: 'ch',
      })
    })

    it('parses word-in-list attribute', () => {
      const result = parser.parse('[name~="foo"]')
      expect(result.attributes[0]).toEqual({
        name: 'name',
        operator: '~=',
        value: 'foo',
      })
    })

    it('parses exists attribute', () => {
      const result = parser.parse('[async]')
      expect(result.attributes[0]).toEqual({
        name: 'async',
        operator: 'exists',
      })
    })

    it('parses numeric comparison >3', () => {
      const result = parser.parse('[count>3]')
      expect(result.attributes[0]!.name).toBe('count')
      expect(result.attributes[0]!.value).toBe('>3')
    })

    it('parses type with multiple attributes', () => {
      const result = parser.parse('FunctionDeclaration[async][name="foo"]')
      expect(result.nodeType).toBe('FunctionDeclaration')
      expect(result.attributes).toHaveLength(2)
    })
  })

  describe('pseudo classes', () => {
    it('parses :first-child', () => {
      const result = parser.parse(':first-child')
      expect(result.pseudoClasses[0]).toEqual({ name: 'first-child' })
    })

    it('parses :last-child', () => {
      const result = parser.parse(':last-child')
      expect(result.pseudoClasses[0]).toEqual({ name: 'last-child' })
    })

    it('parses :nth-child(3)', () => {
      const result = parser.parse(':nth-child(3)')
      expect(result.pseudoClasses[0]).toEqual({ name: 'nth-child', argument: 3 })
    })

    it('parses :empty', () => {
      const result = parser.parse(':empty')
      expect(result.pseudoClasses[0]).toEqual({ name: 'empty' })
    })

    it('parses :root', () => {
      const result = parser.parse(':root')
      expect(result.pseudoClasses[0]).toEqual({ name: 'root' })
    })

    it('parses :leaf', () => {
      const result = parser.parse(':leaf')
      expect(result.pseudoClasses[0]).toEqual({ name: 'leaf' })
    })

    it('parses :has(Identifier)', () => {
      const result = parser.parse(':has(Identifier)')
      expect(result.pseudoClasses[0]).toEqual({
        name: 'has',
        argument: 'Identifier',
      })
    })

    it('parses :not(FunctionDeclaration)', () => {
      const result = parser.parse(':not(FunctionDeclaration)')
      expect(result.pseudoClasses[0]).toEqual({
        name: 'not',
        argument: 'FunctionDeclaration',
      })
    })
  })

  describe('combinators', () => {
    it('parses child combinator A > B', () => {
      const result = parser.parse('Program > FunctionDeclaration')
      expect(result.nodeType).toBe('Program')
      expect(result.combinator).toEqual({ type: 'child' })
      expect(result.child).toBeDefined()
      expect(result.child!.nodeType).toBe('FunctionDeclaration')
    })

    it('parses descendant combinator A B', () => {
      const result = parser.parse('Program FunctionDeclaration')
      expect(result.nodeType).toBe('Program')
      expect(result.combinator).toEqual({ type: 'descendant' })
      expect(result.child!.nodeType).toBe('FunctionDeclaration')
    })

    it('parses adjacent sibling A + B', () => {
      const result = parser.parse('ImportDeclaration + FunctionDeclaration')
      expect(result.nodeType).toBe('ImportDeclaration')
      expect(result.combinator).toEqual({ type: 'adjacent' })
      expect(result.child!.nodeType).toBe('FunctionDeclaration')
    })

    it('parses general sibling A ~ B', () => {
      const result = parser.parse('ImportDeclaration ~ ClassDeclaration')
      expect(result.nodeType).toBe('ImportDeclaration')
      expect(result.combinator).toEqual({ type: 'sibling' })
      expect(result.child!.nodeType).toBe('ClassDeclaration')
    })

    it('parses nested combinators A > B > C', () => {
      const result = parser.parse('Program > FunctionDeclaration > Identifier')
      expect(result.nodeType).toBe('Program')
      expect(result.combinator).toEqual({ type: 'child' })
      expect(result.child!.nodeType).toBe('FunctionDeclaration')
      expect(result.child!.child!.nodeType).toBe('Identifier')
    })
  })

  describe('complex queries', () => {
    it('parses FunctionDeclaration[async=true] > Identifier[name="fetch"]:first-child', () => {
      const result = parser.parse(
        'FunctionDeclaration[async=true] > Identifier[name="fetch"]:first-child',
      )
      expect(result.nodeType).toBe('FunctionDeclaration')
      expect(result.attributes[0]).toEqual({ name: 'async', operator: '=', value: 'true' })
      expect(result.combinator).toEqual({ type: 'child' })
      expect(result.child!.nodeType).toBe('Identifier')
      expect(result.child!.attributes[0]).toEqual({ name: 'name', operator: '=', value: 'fetch' })
      expect(result.child!.pseudoClasses[0]).toEqual({ name: 'first-child' })
    })

    it('parses *:empty', () => {
      const result = parser.parse('*:empty')
      expect(result.nodeType).toBe('*')
      expect(result.pseudoClasses[0]).toEqual({ name: 'empty' })
    })

    it('parses complex nested query', () => {
      const result = parser.parse('Program > *:has(ReturnStatement)')
      expect(result.nodeType).toBe('Program')
      expect(result.combinator).toEqual({ type: 'child' })
      expect(result.child!.nodeType).toBe('*')
      expect(result.child!.pseudoClasses[0]!.name).toBe('has')
    })

    it('parses type with attribute and pseudo', () => {
      const result = parser.parse('ClassDeclaration[name="MyClass"]:has(MethodDefinition)')
      expect(result.nodeType).toBe('ClassDeclaration')
      expect(result.attributes).toHaveLength(1)
      expect(result.pseudoClasses).toHaveLength(1)
    })
  })

  describe('error handling', () => {
    it('throws on empty query', () => {
      expect(() => parser.parse('')).toThrow()
    })

    it('throws on unclosed attribute', () => {
      expect(() => parser.parse('[name="foo"')).toThrow()
    })

    it('throws on unexpected character', () => {
      expect(() => parser.parse('#foo')).toThrow()
    })
  })

  describe('tokenize', () => {
    it('tokenizes simple type', () => {
      const tokens = parser.tokenize('FunctionDeclaration')
      expect(tokens).toEqual([{ type: 'type', value: 'FunctionDeclaration' }])
    })

    it('tokenizes complex query', () => {
      const tokens = parser.tokenize('A > B[name="x"]')
      expect(tokens).toEqual([
        { type: 'type', value: 'A' },
        { type: 'combinator', value: '>' },
        { type: 'type', value: 'B' },
        { type: 'attribute', value: 'name="x"' },
      ])
    })
  })
})

describe('ASTTraverser', () => {
  const traverser = new ASTTraverser()
  let ast: ASTNode

  function testAST(): ASTNode {
    const root = makeNode('Root', {
      children: [
        makeNode('A', {
          children: [
            makeNode('A1'),
            makeNode('A2'),
          ],
        }),
        makeNode('B', {
          children: [makeNode('B1')],
        }),
        makeNode('C'),
      ],
    })
    return linkParent(root)
  }

  beforeEach(() => {
    ast = testAST()
  })

  describe('traverse', () => {
    it('visits all nodes depth-first', () => {
      const visited: string[] = []
      traverser.traverse(ast, {
        enter(node) {
          visited.push(node.type)
        },
      })
      expect(visited).toEqual(['Root', 'A', 'A1', 'A2', 'B', 'B1', 'C'])
    })

    it('stops traversal when enter returns false', () => {
      const visited: string[] = []
      traverser.traverse(ast, {
        enter(node) {
          visited.push(node.type)
          if (node.type === 'A') return false
        },
      })
      expect(visited).toEqual(['Root', 'A', 'B', 'B1', 'C'])
    })

    it('calls exit callback', () => {
      const exited: string[] = []
      traverser.traverse(ast, {
        exit(node) {
          exited.push(node.type)
        },
      })
      expect(exited).toEqual(['A1', 'A2', 'A', 'B1', 'B', 'C', 'Root'])
    })

    it('provides ancestors', () => {
      let a1Ancestors: ASTNode[] = []
      traverser.traverse(ast, {
        enter(node, ancestors) {
          if (node.type === 'A1') {
            a1Ancestors = ancestors
          }
        },
      })
      expect(a1Ancestors.map((n) => n.type)).toEqual(['Root', 'A'])
    })
  })

  describe('findChildren', () => {
    it('finds all matching descendants', () => {
      const results = traverser.findChildren(ast, (n) => n.type.startsWith('A'))
      expect(results.map((n) => n.type)).toEqual(['A', 'A1', 'A2'])
    })

    it('returns empty for no matches', () => {
      const results = traverser.findChildren(ast, (n) => n.type === 'Z')
      expect(results).toHaveLength(0)
    })
  })

  describe('findDirectChildren', () => {
    it('finds only direct children', () => {
      const results = traverser.findDirectChildren(ast, (n) =>
        n.type === 'A' || n.type === 'C',
      )
      expect(results.map((n) => n.type)).toEqual(['A', 'C'])
    })

    it('does not find grandchildren', () => {
      const results = traverser.findDirectChildren(ast, (n) => n.type === 'A1')
      expect(results).toHaveLength(0)
    })
  })

  describe('getAncestors', () => {
    it('returns ancestors from root to parent', () => {
      const a1 = ast.children[0]!.children[0]!
      const ancestors = traverser.getAncestors(a1)
      expect(ancestors.map((n) => n.type)).toEqual(['Root', 'A'])
    })

    it('returns empty for root node', () => {
      const ancestors = traverser.getAncestors(ast)
      expect(ancestors).toHaveLength(0)
    })
  })

  describe('getSiblings', () => {
    it('returns all siblings including self', () => {
      const a = ast.children[0]!
      const siblings = traverser.getSiblings(a)
      expect(siblings.map((n) => n.type)).toEqual(['A', 'B', 'C'])
    })

    it('returns self for root node', () => {
      const siblings = traverser.getSiblings(ast)
      expect(siblings).toEqual([ast])
    })
  })

  describe('getPreviousSibling / getNextSibling', () => {
    it('gets previous sibling', () => {
      const b = ast.children[1]!
      const prev = traverser.getPreviousSibling(b)
      expect(prev?.type).toBe('A')
    })

    it('gets next sibling', () => {
      const a = ast.children[0]!
      const next = traverser.getNextSibling(a)
      expect(next?.type).toBe('B')
    })

    it('returns null for first child prev', () => {
      const a = ast.children[0]!
      expect(traverser.getPreviousSibling(a)).toBeNull()
    })

    it('returns null for last child next', () => {
      const c = ast.children[2]!
      expect(traverser.getNextSibling(c)).toBeNull()
    })
  })

  describe('getNodeDepth', () => {
    it('root has depth 0', () => {
      expect(traverser.getNodeDepth(ast)).toBe(0)
    })

    it('nested node has correct depth', () => {
      const a1 = ast.children[0]!.children[0]!
      expect(traverser.getNodeDepth(a1)).toBe(2)
    })
  })

  describe('isLeaf', () => {
    it('returns true for leaf node', () => {
      expect(traverser.isLeaf(ast.children[2]!)).toBe(true)
    })

    it('returns false for node with children', () => {
      expect(traverser.isLeaf(ast.children[0]!)).toBe(false)
    })
  })

  describe('flatten', () => {
    it('returns all nodes in tree order', () => {
      const flat = traverser.flatten(ast)
      expect(flat.map((n) => n.type)).toEqual([
        'Root', 'A', 'A1', 'A2', 'B', 'B1', 'C',
      ])
    })
  })
})

describe('QueryEngine', () => {
  const engine = new QueryEngine()
  let ast: ASTNode

  beforeEach(() => {
    ast = sampleAST()
  })

  describe('simple queries', () => {
    it('finds all FunctionDeclaration nodes', () => {
      const result = engine.query(ast, 'FunctionDeclaration')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.type).toBe('FunctionDeclaration')
    })

    it('finds all nodes with universal selector', () => {
      const result = engine.query(ast, '*')
      expect(result.matches.length).toBeGreaterThan(5)
    })

    it('finds ClassDeclaration nodes', () => {
      const result = engine.query(ast, 'ClassDeclaration')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.properties.name).toBe('MyClass')
    })

    it('returns empty for non-existent type', () => {
      const result = engine.query(ast, 'UnknownType')
      expect(result.matches).toHaveLength(0)
    })

    it('includes executionTime in result', () => {
      const result = engine.query(ast, '*')
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
      expect(result.query).toBe('*')
    })
  })

  describe('attribute matching', () => {
    it('matches by attribute equals', () => {
      const result = engine.query(ast, '[name="fetchData"]')
      expect(result.matches.length).toBeGreaterThanOrEqual(1)
      const found = result.matches.some(
        (m) => m.node.properties.name === 'fetchData',
      )
      expect(found).toBe(true)
    })

    it('matches by attribute exists', () => {
      const result = engine.query(ast, '[async]')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.properties.async).toBe(true)
    })

    it('matches by starts-with', () => {
      const result = engine.query(ast, '[name^="fetch"]')
      expect(result.matches.length).toBeGreaterThanOrEqual(1)
    })

    it('matches by contains', () => {
      const result = engine.query(ast, '[name*="etch"]')
      expect(result.matches.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('pseudo matching', () => {
    it('matches :first-child', () => {
      const result = engine.query(ast, 'Identifier:first-child')
      expect(result.matches).toHaveLength(1)
    })

    it('matches :last-child', () => {
      const result = engine.query(ast, 'MethodDefinition:last-child')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.properties.name).toBe('render')
    })

    it('matches :empty', () => {
      const result = engine.query(ast, ':empty')
      expect(result.matches.length).toBeGreaterThan(0)
      for (const m of result.matches) {
        expect(m.node.children).toHaveLength(0)
      }
    })

    it('matches :root', () => {
      const result = engine.query(ast, ':root')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.type).toBe('Program')
    })

    it('matches :leaf', () => {
      const result = engine.query(ast, ':leaf')
      expect(result.matches.length).toBeGreaterThan(0)
      for (const m of result.matches) {
        expect(m.node.children).toHaveLength(0)
      }
    })

    it('matches :nth-child', () => {
      const result = engine.query(ast, 'MethodDefinition:nth-child(1)')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.properties.name).toBe('constructor')
    })

    it('matches :has', () => {
      const result = engine.query(ast, ':has(ReturnStatement)')
      expect(result.matches.length).toBeGreaterThanOrEqual(1)
    })

    it('matches :not', () => {
      const result = engine.query(ast, ':not(Program)')
      expect(result.matches.every((m) => m.node.type !== 'Program')).toBe(true)
    })
  })

  describe('combinator queries', () => {
    it('matches child combinator', () => {
      const result = engine.query(ast, 'Program > FunctionDeclaration')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.type).toBe('Program')
    })

    it('matches descendant combinator', () => {
      const result = engine.query(ast, 'Program CallExpression')
      expect(result.matches).toHaveLength(1)
    })

    it('matches adjacent sibling', () => {
      const result = engine.query(
        ast,
        'ImportDeclaration + FunctionDeclaration',
      )
      expect(result.matches).toHaveLength(1)
    })

    it('matches general sibling', () => {
      const result = engine.query(
        ast,
        'ImportDeclaration ~ ClassDeclaration',
      )
      expect(result.matches).toHaveLength(1)
    })
  })

  describe('multi-AST queries', () => {
    it('queries multiple ASTs', () => {
      const ast1 = sampleAST()
      const ast2 = makeNode('Program', {
        children: [
          makeNode('FunctionDeclaration', { properties: { name: 'test' } }),
        ],
      })
      linkParent(ast2)

      const asts = new Map<string, ASTNode>()
      asts.set('file1.ts', ast1)
      asts.set('file2.ts', ast2)

      const results = engine.queryAll(asts, 'FunctionDeclaration')
      expect(results.get('file1.ts')!.matches).toHaveLength(1)
      expect(results.get('file2.ts')!.matches).toHaveLength(1)
    })

    it('handles empty map', () => {
      const results = engine.queryAll(new Map(), '*')
      expect(results.size).toBe(0)
    })
  })

  describe('buildASTFromSource', () => {
    it('parses function declarations', () => {
      const ast = engine.buildASTFromSource('function hello() { return 1; }')
      const funcs = ast.children.filter((n) => n.type === 'FunctionDeclaration')
      expect(funcs.length).toBeGreaterThanOrEqual(1)
    })

    it('parses class declarations', () => {
      const ast = engine.buildASTFromSource('class Foo {}')
      const classes = ast.children.filter((n) => n.type === 'ClassDeclaration')
      expect(classes).toHaveLength(1)
      expect(classes[0]!.properties.name).toBe('Foo')
    })

    it('parses imports', () => {
      const ast = engine.buildASTFromSource("import React from 'react'")
      const imports = ast.children.filter((n) => n.type === 'ImportDeclaration')
      expect(imports).toHaveLength(1)
    })

    it('creates Program root node', () => {
      const ast = engine.buildASTFromSource('const x = 1')
      expect(ast.type).toBe('Program')
    })

    it('parses multiple constructs', () => {
      const source = `import foo from 'bar'
function hello() {}
const x = 1
class MyClass {}`
      const ast = engine.buildASTFromSource(source)
      expect(ast.children.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('highlightMatches', () => {
    it('highlights matched lines', () => {
      const source = 'line1\nline2\nline3'
      const match: QueryMatch = {
        node: {
          type: 'Test',
          children: [],
          properties: {},
          location: { startLine: 2, startCol: 0, endLine: 2, endCol: 5 },
        },
        ancestors: [],
        score: 0,
      }
      const result = engine.highlightMatches(source, [match])
      const lines = result.split('\n')
      expect(lines[1]).toBe('>>> line2 >>>')
      expect(lines[0]).toBe('line1')
    })

    it('returns unchanged source for no matches', () => {
      const source = 'line1\nline2'
      const result = engine.highlightMatches(source, [])
      expect(result).toBe(source)
    })
  })

  describe('edge cases', () => {
    it('handles single node AST', () => {
      const single = makeNode('SingleNode')
      const result = engine.query(single, 'SingleNode')
      expect(result.matches).toHaveLength(1)
    })

    it('handles deeply nested tree', () => {
      let current = makeNode('Level0')
      const root = current
      for (let i = 1; i <= 10; i++) {
        const child = makeNode(`Level${i}`)
        current.children.push(child)
        child.parent = current
        current = child
      }
      const result = engine.query(root, 'Level10')
      expect(result.matches).toHaveLength(1)
    })

    it('handles no matches gracefully', () => {
      const result = engine.query(ast, 'NonExistentType')
      expect(result.matches).toHaveLength(0)
    })

    it('matches all nodes with *', () => {
      const result = engine.query(ast, '*')
      const flat = new ASTTraverser().flatten(ast)
      expect(result.matches).toHaveLength(flat.length)
    })

    it('handles empty AST (no children)', () => {
      const empty = makeNode('Empty')
      const result = engine.query(empty, '*')
      expect(result.matches).toHaveLength(1)
    })
  })

  describe('integration: full pipeline', () => {
    it('parse → match → result for simple query', () => {
      const result = engine.query(ast, 'FunctionDeclaration')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]!.node.type).toBe('FunctionDeclaration')
      expect(result.matches[0]!.ancestors.length).toBeGreaterThanOrEqual(0)
      expect(result.matches[0]!.score).toBeGreaterThan(0)
    })

    it('parse → match for attribute query', () => {
      const result = engine.query(ast, '[async=true]')
      expect(result.matches).toHaveLength(1)
    })

    it('parse → match for complex query', () => {
      const result = engine.query(
        ast,
        'FunctionDeclaration > BlockStatement',
      )
      expect(result.matches).toHaveLength(1)
    })

    it('parse → match → build → re-query', () => {
      const source = 'function foo() { return bar() }'
      const builtAst = engine.buildASTFromSource(source)
      const result = engine.query(builtAst, 'FunctionDeclaration')
      expect(result.matches.length).toBeGreaterThanOrEqual(1)
    })

    it('full pipeline with highlight', () => {
      const source = 'function hello() {}\nconst x = 1'
      const builtAst = engine.buildASTFromSource(source)
      const result = engine.query(builtAst, 'FunctionDeclaration')
      const highlighted = engine.highlightMatches(source, result.matches)
      const lines = highlighted.split('\n')
      expect(lines[0]).toContain('>>>')
    })
  })
})
