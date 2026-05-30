import { describe, expect, it } from 'vitest'

import { ASTMatcher } from '../../../src/core/ast-matcher/ast-matcher.js'
import type { ASTNode, MatchPattern } from '../../../src/core/ast-matcher/types.js'

function makeNode(
  type: string,
  value?: string,
  children?: ASTNode[],
  properties?: Record<string, string>,
): ASTNode {
  return { type, value, children, properties: properties ?? {} }
}

describe('ASTMatcher', () => {
  it('matches a node by type', () => {
    const matcher = new ASTMatcher()
    const node = makeNode('FunctionDeclaration')
    const pattern: MatchPattern = { type: 'FunctionDeclaration' }
    expect(matcher.match(node, pattern)).toBe(true)
  })

  it('does not match wrong type', () => {
    const matcher = new ASTMatcher()
    const node = makeNode('FunctionDeclaration')
    const pattern: MatchPattern = { type: 'VariableDeclaration' }
    expect(matcher.match(node, pattern)).toBe(false)
  })

  it('matches by type and value', () => {
    const matcher = new ASTMatcher()
    const node = makeNode('Identifier', 'foo')
    const pattern: MatchPattern = { type: 'Identifier', value: 'foo' }
    expect(matcher.match(node, pattern)).toBe(true)
  })

  it('does not match wrong value', () => {
    const matcher = new ASTMatcher()
    const node = makeNode('Identifier', 'foo')
    const pattern: MatchPattern = { type: 'Identifier', value: 'bar' }
    expect(matcher.match(node, pattern)).toBe(false)
  })

  it('matches by properties', () => {
    const matcher = new ASTMatcher()
    const node = makeNode('FunctionDeclaration', undefined, undefined, { async: 'true' })
    const pattern: MatchPattern = { type: 'FunctionDeclaration', properties: { async: 'true' } }
    expect(matcher.match(node, pattern)).toBe(true)
  })

  it('findAll returns all matching nodes', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program', undefined, [
      makeNode('FunctionDeclaration', 'foo'),
      makeNode('VariableDeclaration'),
      makeNode('FunctionDeclaration', 'bar'),
    ])
    const pattern: MatchPattern = { type: 'FunctionDeclaration' }
    const results = matcher.findAll(root, pattern)
    expect(results).toHaveLength(2)
  })

  it('findAll searches deeply nested nodes', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program', undefined, [
      makeNode('Block', undefined, [
        makeNode('FunctionDeclaration', 'nested'),
      ]),
    ])
    const pattern: MatchPattern = { type: 'FunctionDeclaration' }
    const results = matcher.findAll(root, pattern)
    expect(results).toHaveLength(1)
    expect(results[0]!.node.value).toBe('nested')
  })

  it('findFirst returns first match', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program', undefined, [
      makeNode('FunctionDeclaration', 'first'),
      makeNode('FunctionDeclaration', 'second'),
    ])
    const pattern: MatchPattern = { type: 'FunctionDeclaration' }
    const result = matcher.findFirst(root, pattern)
    expect(result).toBeDefined()
    expect(result!.node.value).toBe('first')
  })

  it('findFirst returns undefined for no match', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program')
    const pattern: MatchPattern = { type: 'FunctionDeclaration' }
    expect(matcher.findFirst(root, pattern)).toBeUndefined()
  })

  it('count returns number of matches', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program', undefined, [
      makeNode('Identifier', 'a'),
      makeNode('Identifier', 'b'),
      makeNode('Identifier', 'c'),
    ])
    expect(matcher.count(root, { type: 'Identifier' })).toBe(3)
  })

  it('count returns 0 for no matches', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program')
    expect(matcher.count(root, { type: 'Identifier' })).toBe(0)
  })

  it('getPath returns paths to matches', () => {
    const matcher = new ASTMatcher()
    const target = makeNode('Identifier', 'x')
    const root = makeNode('Program', undefined, [
      makeNode('Expression', undefined, [target]),
    ])
    const paths = matcher.getPath(root, { type: 'Identifier', value: 'x' })
    expect(paths.length).toBeGreaterThanOrEqual(1)
  })

  it('getConfig returns current config', () => {
    const matcher = new ASTMatcher({ maxDepth: 50 })
    const config = matcher.getConfig()
    expect(config.maxDepth).toBe(50)
  })

  it('case-insensitive matching', () => {
    const matcher = new ASTMatcher({ caseSensitive: false })
    const node = makeNode('functiondeclaration')
    const pattern: MatchPattern = { type: 'FunctionDeclaration' }
    expect(matcher.match(node, pattern)).toBe(true)
  })

  it('capture collects matched nodes', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program', undefined, [
      makeNode('FunctionDeclaration', 'test'),
    ])
    const pattern: MatchPattern = {
      type: 'FunctionDeclaration',
      captureName: 'funcs',
    }
    const results = matcher.capture(root, pattern)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty tree', () => {
    const matcher = new ASTMatcher()
    const root = makeNode('Program')
    expect(matcher.findAll(root, { type: 'Identifier' })).toHaveLength(0)
  })

  it('handles node without children', () => {
    const matcher = new ASTMatcher()
    const node = makeNode('Literal', '42')
    expect(matcher.match(node, { type: 'Literal' })).toBe(true)
  })
})
