import { describe, expect, it } from 'vitest'

import { QueryEngine } from '../../../src/core/ast-query/query-engine.js'
import type { ASTNode } from '../../../src/core/ast-query/types.js'

function makeLoc(line = 1, col = 0): ASTNode['location'] {
  return { startLine: line, startCol: col, endLine: line, endCol: col }
}

function n(
  type: string,
  value?: string,
  children: ASTNode[] = [],
  properties: Record<string, unknown> = {},
): ASTNode {
  return { type, value, children, properties, location: makeLoc() }
}

function linkChildren(parent: ASTNode): void {
  for (const child of parent.children) {
    child.parent = parent
    linkChildren(child)
  }
}

describe('QueryEngine', () => {
  it('queries by node type', () => {
    const engine = new QueryEngine()
    const ast = n('Program', undefined, [
      n('FunctionDeclaration', 'foo'),
      n('VariableDeclaration'),
    ])
    linkChildren(ast)
    const result = engine.query(ast, 'FunctionDeclaration')
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0]!.node.type).toBe('FunctionDeclaration')
  })

  it('returns empty for no matches', () => {
    const engine = new QueryEngine()
    const ast = n('Program', undefined, [n('VariableDeclaration')])
    linkChildren(ast)
    const result = engine.query(ast, 'FunctionDeclaration')
    expect(result.matches).toHaveLength(0)
  })

  it('returns query string in result', () => {
    const engine = new QueryEngine()
    const ast = n('Program')
    const result = engine.query(ast, 'Identifier')
    expect(result.query).toBe('Identifier')
  })

  it('returns execution time', () => {
    const engine = new QueryEngine()
    const ast = n('Program')
    const result = engine.query(ast, 'Identifier')
    expect(result.executionTime).toBeGreaterThanOrEqual(0)
  })

  it('queries with universal selector', () => {
    const engine = new QueryEngine()
    const ast = n('Program', undefined, [
      n('A'),
      n('B'),
    ])
    linkChildren(ast)
    const result = engine.query(ast, '*')
    expect(result.matches.length).toBeGreaterThanOrEqual(3)
  })

  it('finds nested nodes', () => {
    const engine = new QueryEngine()
    const deep = n('Target', 'found')
    const ast = n('Program', undefined, [
      n('Block', undefined, [deep]),
    ])
    linkChildren(ast)
    const result = engine.query(ast, 'Target')
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0]!.node.value).toBe('found')
  })

  it('finds multiple matches', () => {
    const engine = new QueryEngine()
    const ast = n('Program', undefined, [
      n('Identifier', 'a'),
      n('Identifier', 'b'),
      n('Identifier', 'c'),
    ])
    linkChildren(ast)
    const result = engine.query(ast, 'Identifier')
    expect(result.matches).toHaveLength(3)
  })

  it('queries with attribute selector', () => {
    const engine = new QueryEngine()
    const ast = n('Program', undefined, [
      n('Function', undefined, [], { async: true }),
      n('Function', undefined, [], { async: false }),
    ])
    linkChildren(ast)
    const result = engine.query(ast, 'Function[async=true]')
    expect(result.matches).toHaveLength(1)
  })

  it('queryAll queries multiple ASTs', () => {
    const engine = new QueryEngine()
    const ast1 = n('Program', undefined, [n('Identifier', 'a')])
    const ast2 = n('Program', undefined, [n('Identifier', 'b')])
    linkChildren(ast1)
    linkChildren(ast2)
    const asts = new Map<string, ASTNode>([
      ['file1', ast1],
      ['file2', ast2],
    ])
    const results = engine.queryAll(asts, 'Identifier')
    expect(results.size).toBe(2)
    expect(results.get('file1')!.matches).toHaveLength(1)
    expect(results.get('file2')!.matches).toHaveLength(1)
  })

  it('match score is calculated', () => {
    const engine = new QueryEngine()
    const ast = n('Program', undefined, [n('Identifier', 'x')])
    linkChildren(ast)
    const result = engine.query(ast, 'Identifier')
    if (result.matches.length > 0) {
      expect(result.matches[0]!.score).toBeGreaterThanOrEqual(0)
    }
  })

  it('handles empty tree', () => {
    const engine = new QueryEngine()
    const ast = n('Program')
    const result = engine.query(ast, 'Identifier')
    expect(result.matches).toHaveLength(0)
  })

  it('handles complex tree', () => {
    const engine = new QueryEngine()
    const ast = n('Program', undefined, [
      n('FunctionDeclaration', 'main', [
        n('Block', undefined, [
          n('ReturnStatement', undefined, [
            n('NumericLiteral', '0'),
          ]),
        ]),
      ]),
    ])
    linkChildren(ast)
    expect(engine.query(ast, 'ReturnStatement').matches).toHaveLength(1)
    expect(engine.query(ast, 'NumericLiteral').matches).toHaveLength(1)
    expect(engine.query(ast, 'FunctionDeclaration').matches).toHaveLength(1)
  })
})
