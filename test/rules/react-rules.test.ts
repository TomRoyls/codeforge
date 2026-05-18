import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import { noArrayIndexKeyRule } from '../../src/rules/frameworks/react/no-array-index-key.js'
import { noDirectMutationRule } from '../../src/rules/frameworks/react/no-direct-mutation.js'
import { noMissingKeyRule } from '../../src/rules/frameworks/react/no-missing-key.js'
import { noUnusedStateRule } from '../../src/rules/frameworks/react/no-unused-state.js'
import { preferFunctionComponentRule } from '../../src/rules/frameworks/react/prefer-function-component.js'

// ─── SyntaxKind constants (matching ts-morph's bundled TypeScript) ───

const SK = {
  ArrayBindingPattern: 207,
  ArrowFunction: 219,
  BinaryExpression: 226,
  BindingElement: 208,
  CallExpression: 213,
  ClassDeclaration: 263,
  EqualsToken: 64,
  ExpressionWithTypeArguments: 233,
  FunctionExpression: 218,
  HeritageClause: 298,
  Identifier: 80,
  MinusEqualsToken: 66,
  PlusEqualsToken: 65,
  PropertyAccessExpression: 211,
  SourceFile: 307,
  ThisKeyword: 110,
  VariableDeclaration: 260,
} as const

// ─── Shared mock helpers ───

type MockNode = Record<string, unknown>

type LooseVisitor = Record<string, ((...args: unknown[]) => void) | undefined>

function looseVisitor(v: unknown): LooseVisitor {
  return v as unknown as LooseVisitor
}

const emptyContext: MockNode = {
  addViolation: () => {},
  depth: 0,
  getFilePath: () => 'test.ts',
  parent: undefined,
  sourceFile: {
    getFilePath: () => 'test.ts',
    getLineAndColumnAtPos: (_pos: number) => ({ column: 0, line: 1 }),
  },
}

function createSourceFileMock(): MockNode {
  return {
    getFilePath: () => 'test.ts',
    getLineAndColumnAtPos: (_pos: number) => ({ column: 0, line: 1 }),
  }
}

function makeNode(overrides: MockNode): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 100,
    getKind: () => 0,
    getParent: () => ({}),
    getSourceFile: () => sf,
    getStart: () => 0,
    getText: () => '',
    ...overrides,
  }
}

function trackableIdent(name: string): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 100,
    getKind: () => SK.Identifier,
    getParent: () => ({}),
    getSourceFile: () => sf,
    getStart: () => 0,
    getText: () => name,
  }
}

// ─── Section: no-array-index-key ───

describe('no-array-index-key', () => {
  function createMapCallNode(bodyText: string, indexName = 'index'): MockNode {
    const sf = createSourceFileMock()
    const indexParam: MockNode = { getName: () => indexName }
    const itemParam: MockNode = { getName: () => 'item' }

    const callbackBody: MockNode = { getText: () => bodyText }
    const callback: MockNode = {
      getBody: () => callbackBody,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [itemParam, indexParam],
    }

    const mapExpression: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'map',
    }

    return makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => mapExpression,
      getArguments: () => [callback],
      getSourceFile: () => sf,
    })
  }

  it('reports when array index is used as key in JSX', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapCallNode('return <div key={index}>{item}</div>')
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('array index as key')
    expect(violations[0]!.ruleId).toBe('react/no-array-index-key')
  })

  it('reports with custom index parameter name', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapCallNode('return <li key={i}>{item}</li>', 'i')
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('does not report when key uses a stable identifier', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapCallNode('return <div key={item.id}>{item.name}</div>')
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-map call expressions', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const filterExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'filter',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => filterExpr,
      getArguments: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when callback has fewer than 2 parameters', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callbackBody: MockNode = { getText: () => 'return <div key={index} />' }
    const callback: MockNode = {
      getBody: () => callbackBody,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [{ getName: () => 'item' }],
    }
    const mapExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'map',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => mapExpr,
      getArguments: () => [callback],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-call-expression nodes', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when map has no arguments', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const mapExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'map',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => mapExpr,
      getArguments: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when expression is not property access', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const identExpr: MockNode = { getKind: () => SK.Identifier }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => identExpr,
      getArguments: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when callback is not a function', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const mapExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'map',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => mapExpr,
      getArguments: () => [{ getKind: () => SK.Identifier }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple map calls independently', () => {
    const result = noArrayIndexKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node1 = createMapCallNode('return <div key={index} />')
    const node2 = createMapCallNode('return <span key={index} />')

    visitor.visitNode!(node1, emptyContext)
    visitor.visitNode!(node2, emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noArrayIndexKeyRule.meta.category).toBe('performance')
    expect(noArrayIndexKeyRule.meta.name).toBe('react/no-array-index-key')
    expect(noArrayIndexKeyRule.meta.recommended).toBe(true)
    expect(noArrayIndexKeyRule.meta.severity).toBe('warning')
  })
})

// ─── Section: no-direct-mutation ───

describe('no-direct-mutation', () => {
  it('reports direct mutation of this.state property', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const sf = createSourceFileMock()
    const left: MockNode = makeNode({
      getKind: () => SK.PropertyAccessExpression,
      getText: () => 'this.state.count',
    })
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Direct mutation')
    expect(violations[0]!.message).toContain('setState')
    expect(violations[0]!.ruleId).toBe('react/no-direct-mutation')
    expect(violations[0]!.severity).toBe('error')
  })

  it('reports direct mutation of useState variable', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    // First, register the useState call
    const useStateIdentExpr: MockNode = {
      getKind: () => SK.Identifier,
      getText: () => 'useState',
    }
    const childIdent: MockNode = trackableIdent('count')
    const bindingEl: MockNode = { getNameNode: () => childIdent, getKind: () => SK.BindingElement }
    const arrayBinding: MockNode = {
      getKind: () => SK.ArrayBindingPattern,
      getElements: () => [bindingEl],
    }
    const varDecl: MockNode = {
      getKind: () => SK.VariableDeclaration,
      getNameNode: () => arrayBinding,
    }
    const useStateCall: MockNode = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => useStateIdentExpr,
      getArguments: () => [{}],
      getParent: () => varDecl,
    })

    visitor.visitNode!(useStateCall, emptyContext)

    // Then, simulate the mutation: count = 5
    const leftIdent: MockNode = makeNode({
      getKind: () => SK.Identifier,
      getText: () => 'count',
    })
    const mutation: MockNode = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => leftIdent,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
    })

    visitor.visitNode!(mutation, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('count')
    expect(violations[0]!.message).toContain('useState')
  })

  it('does not report non-binary-expression nodes', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report binary expression with non-assignment operator', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getText: () => 'this.state.count',
    }
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => 9999 }), // some non-assignment operator
      getRight: () => ({}),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report assignment to non-state property', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getText: () => 'this.props.name',
    }
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports mutation with plus-equals operator on this.state', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = makeNode({
      getKind: () => SK.PropertyAccessExpression,
      getText: () => 'this.state.counter',
    })
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.PlusEqualsToken }),
      getRight: () => ({}),
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Direct mutation')
  })

  it('reports mutation with minus-equals operator on this.state', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = makeNode({
      getKind: () => SK.PropertyAccessExpression,
      getText: () => 'this.state.value',
    })
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.MinusEqualsToken }),
      getRight: () => ({}),
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('does not report assignment to regular identifier', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = {
      getKind: () => SK.Identifier,
      getText: () => 'regularVar',
    }
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when left is not property access or identifier', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.CallExpression }
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not crash on non-identifier expression in useState call', () => {
    const result = noDirectMutationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const nonIdentExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getText: () => 'something',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => nonIdentExpr,
      getArguments: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noDirectMutationRule.meta.category).toBe('correctness')
    expect(noDirectMutationRule.meta.name).toBe('react/no-direct-mutation')
    expect(noDirectMutationRule.meta.recommended).toBe(true)
    expect(noDirectMutationRule.meta.severity).toBe('error')
  })
})

// ─── Section: no-missing-key ───

describe('no-missing-key', () => {
  function createMapNodeWithBody(bodyText: string): MockNode {
    const sf = createSourceFileMock()
    const callbackBody: MockNode = { getText: () => bodyText }
    const callback: MockNode = {
      getBody: () => callbackBody,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [{ getName: () => 'item' }],
    }
    const mapExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'map',
    }

    return makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => mapExpr,
      getArguments: () => [callback],
      getSourceFile: () => sf,
    })
  }

  it('reports missing key on JSX element returned from map', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapNodeWithBody('return <div>{item}</div>')
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Missing "key" prop')
    expect(violations[0]!.ruleId).toBe('react/no-missing-key')
    expect(violations[0]!.severity).toBe('error')
  })

  it('reports missing key on li element', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapNodeWithBody('return <li>{item}</li>')
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports missing key on span element', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapNodeWithBody('return <span>{item}</span>')
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports missing key on capitalized component (PascalCase)', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapNodeWithBody('return <MyComponent prop={item} />')
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report when key prop is present', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapNodeWithBody('return <div key={item.id}>{item.name}</div>')
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when body has no JSX elements', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createMapNodeWithBody('return item.toString()')
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-map call expressions', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const filterExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'filter',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => filterExpr,
      getArguments: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when callback is not a function', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const mapExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'map',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => mapExpr,
      getArguments: () => [{ getKind: () => SK.Identifier }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when map has no arguments', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const mapExpr: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'map',
    }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => mapExpr,
      getArguments: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-call-expression nodes', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when expression is not property access', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    const identExpr: MockNode = { getKind: () => SK.Identifier }
    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => identExpr,
      getArguments: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple missing keys independently', () => {
    const result = noMissingKeyRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createMapNodeWithBody('return <div>a</div>'), emptyContext)
    visitor.visitNode!(createMapNodeWithBody('return <li>b</li>'), emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noMissingKeyRule.meta.category).toBe('correctness')
    expect(noMissingKeyRule.meta.name).toBe('react/no-missing-key')
    expect(noMissingKeyRule.meta.recommended).toBe(true)
    expect(noMissingKeyRule.meta.severity).toBe('error')
  })
})

// ─── Section: no-unused-state ───

describe('no-unused-state', () => {
  it('reports unused useState variable', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const sf = createSourceFileMock()
    const childIdent: MockNode = {
      ...trackableIdent('unusedState'),
      getParent: () => ({}),
    }
    const bindingEl: MockNode = { getNameNode: () => childIdent, getKind: () => SK.BindingElement }
    const arrayBinding: MockNode = {
      getKind: () => SK.ArrayBindingPattern,
      getElements: () => [bindingEl],
    }
    const varDecl: MockNode = {
      getKind: () => SK.VariableDeclaration,
      getNameNode: () => arrayBinding,
    }
    const useStateCall: MockNode = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.Identifier, getText: () => 'useState' }),
      getArguments: () => [{}],
      getParent: () => varDecl,
      getSourceFile: () => sf,
    })

    visitor.visitNode!(useStateCall, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('unusedState')
    expect(violations[0]!.message).toContain('never read')
    expect(violations[0]!.ruleId).toBe('react/no-unused-state')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('does not report useState variable that is used', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    // Register useState
    const sf = createSourceFileMock()
    const childIdent: MockNode = {
      ...trackableIdent('activeState'),
      getParent: () => ({}),
    }
    const bindingEl: MockNode = { getNameNode: () => childIdent, getKind: () => SK.BindingElement }
    const arrayBinding: MockNode = {
      getKind: () => SK.ArrayBindingPattern,
      getElements: () => [bindingEl],
    }
    const varDecl: MockNode = {
      getKind: () => SK.VariableDeclaration,
      getNameNode: () => arrayBinding,
    }
    const useStateCall: MockNode = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.Identifier, getText: () => 'useState' }),
      getArguments: () => [{}],
      getParent: () => varDecl,
      getSourceFile: () => sf,
    })

    visitor.visitNode!(useStateCall, emptyContext)

    // Use the variable (as identifier, not in binding pattern)
    const usageIdent: MockNode = {
      getKind: () => SK.Identifier,
      getText: () => 'activeState',
      getParent: () => ({ getKind: () => 9999 }), // not ArrayBindingPattern or BindingElement
    }
    visitor.visitNode!(usageIdent, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('marks this.state.xxx as used for class components', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const sf = createSourceFileMock()
    const childIdent: MockNode = {
      ...trackableIdent('data'),
      getParent: () => ({}),
    }
    const bindingEl: MockNode = { getNameNode: () => childIdent, getKind: () => SK.BindingElement }
    const arrayBinding: MockNode = {
      getKind: () => SK.ArrayBindingPattern,
      getElements: () => [bindingEl],
    }
    const varDecl: MockNode = {
      getKind: () => SK.VariableDeclaration,
      getNameNode: () => arrayBinding,
    }
    const useStateCall: MockNode = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.Identifier, getText: () => 'useState' }),
      getArguments: () => [{}],
      getParent: () => varDecl,
      getSourceFile: () => sf,
    })

    visitor.visitNode!(useStateCall, emptyContext)

    // Access via this.state.data
    const thisExpr: MockNode = { getKind: () => SK.ThisKeyword }
    const propAccess: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getExpression: () => thisExpr,
      getName: () => 'data',
      getText: () => 'this.state.data',
    }

    visitor.visitNode!(propAccess, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when useState has no arguments', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const sf = createSourceFileMock()
    const childIdent: MockNode = {
      ...trackableIdent('x'),
      getParent: () => ({}),
    }
    const bindingEl: MockNode = { getNameNode: () => childIdent, getKind: () => SK.BindingElement }
    const arrayBinding: MockNode = {
      getKind: () => SK.ArrayBindingPattern,
      getElements: () => [bindingEl],
    }
    const varDecl: MockNode = {
      getKind: () => SK.VariableDeclaration,
      getNameNode: () => arrayBinding,
    }
    const useStateCall: MockNode = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.Identifier, getText: () => 'useState' }),
      getArguments: () => [],
      getParent: () => varDecl,
      getSourceFile: () => sf,
    })

    visitor.visitNode!(useStateCall, emptyContext)

    // No arguments → doesn't register the state variable, so no violation
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not register non-useState call expression', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.Identifier, getText: () => 'useEffect' }),
      getArguments: () => [{}],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not crash on call expression with non-identifier callee', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.PropertyAccessExpression }),
      getArguments: () => [{}],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not count binding pattern parent as usage', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const sf = createSourceFileMock()
    const childIdent: MockNode = {
      ...trackableIdent('myState'),
      getParent: () => ({ getKind: () => SK.BindingElement }),
    }
    const bindingEl: MockNode = { getNameNode: () => childIdent, getKind: () => SK.BindingElement }
    const arrayBinding: MockNode = {
      getKind: () => SK.ArrayBindingPattern,
      getElements: () => [bindingEl],
    }
    const varDecl: MockNode = {
      getKind: () => SK.VariableDeclaration,
      getNameNode: () => arrayBinding,
    }
    const useStateCall: MockNode = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.Identifier, getText: () => 'useState' }),
      getArguments: () => [{}],
      getParent: () => varDecl,
      getSourceFile: () => sf,
    })

    visitor.visitNode!(useStateCall, emptyContext)

    // Simulate a reference with ArrayBindingPattern parent (should NOT count as usage)
    const refIdent: MockNode = {
      getKind: () => SK.Identifier,
      getText: () => 'myState',
      getParent: () => ({ getKind: () => SK.ArrayBindingPattern }),
    }
    visitor.visitNode!(refIdent, emptyContext)

    // Still reported as unused because the usage was in a binding context
    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('myState')
  })

  it('does not count binding element parent as usage', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const sf = createSourceFileMock()
    const childIdent: MockNode = {
      ...trackableIdent('myState'),
      getParent: () => ({ getKind: () => SK.BindingElement }),
    }
    const bindingEl: MockNode = { getNameNode: () => childIdent, getKind: () => SK.BindingElement }
    const arrayBinding: MockNode = {
      getKind: () => SK.ArrayBindingPattern,
      getElements: () => [bindingEl],
    }
    const varDecl: MockNode = {
      getKind: () => SK.VariableDeclaration,
      getNameNode: () => arrayBinding,
    }
    const useStateCall: MockNode = makeNode({
      getKind: () => SK.CallExpression,
      getExpression: () => ({ getKind: () => SK.Identifier, getText: () => 'useState' }),
      getArguments: () => [{}],
      getParent: () => varDecl,
      getSourceFile: () => sf,
    })

    visitor.visitNode!(useStateCall, emptyContext)

    const refIdent: MockNode = {
      getKind: () => SK.Identifier,
      getText: () => 'myState',
      getParent: () => ({ getKind: () => SK.BindingElement }),
    }
    visitor.visitNode!(refIdent, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('does not report property access without this expression', () => {
    const result = noUnusedStateRule.create({})
    const visitor = looseVisitor(result.visitor)

    const objExpr: MockNode = { getKind: () => SK.Identifier }
    const propAccess: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getExpression: () => objExpr,
      getName: () => 'someProp',
      getText: () => 'obj.someProp',
    }

    visitor.visitNode!(propAccess, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnusedStateRule.meta.category).toBe('correctness')
    expect(noUnusedStateRule.meta.name).toBe('react/no-unused-state')
    expect(noUnusedStateRule.meta.recommended).toBe(true)
    expect(noUnusedStateRule.meta.severity).toBe('warning')
  })
})

// ─── Section: prefer-function-component ───

describe('prefer-function-component', () => {
  function createClassDeclNode(overrides: MockNode = {}): MockNode {
    const sf = createSourceFileMock()
    return makeNode({
      getKind: () => SK.ClassDeclaration,
      getHeritageClauses: () => [],
      getMethods: () => [],
      getProperties: () => [],
      getSourceFile: () => sf,
      ...overrides,
    })
  }

  function createHeritageClause(typeTexts: string[]): MockNode {
    const types = typeTexts.map((text) => ({ getText: () => text }))
    return { getTypeNodes: () => types }
  }

  it('reports class extending Component without lifecycle or state', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['React.Component'])],
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('function component')
    expect(violations[0]!.ruleId).toBe('react/prefer-function-component')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports class extending PureComponent without lifecycle or state', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['PureComponent'])],
    })

    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports class extending Component (without React prefix)', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
    })

    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report class not extending React Component', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['EventEmitter'])],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with no heritage clause', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with lifecycle methods', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'componentDidMount' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with state property', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getProperties: () => [{ getName: () => 'state' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with setState method', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'setState' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with state method', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'state' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-class-declaration nodes', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.FunctionExpression }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple class components independently', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createClassDeclNode({ getHeritageClauses: () => [createHeritageClause(['Component'])] }),
      emptyContext,
    )
    visitor.visitNode!(
      createClassDeclNode({ getHeritageClauses: () => [createHeritageClause(['PureComponent'])] }),
      emptyContext,
    )

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('does not report class with componentWillMount', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'componentWillMount' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with componentWillUnmount', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'componentWillUnmount' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with shouldComponentUpdate', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'shouldComponentUpdate' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with componentDidCatch', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'componentDidCatch' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report class with getDerivedStateFromProps', () => {
    const result = preferFunctionComponentRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createClassDeclNode({
      getHeritageClauses: () => [createHeritageClause(['Component'])],
      getMethods: () => [{ getName: () => 'getDerivedStateFromProps' }],
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(preferFunctionComponentRule.meta.category).toBe('patterns')
    expect(preferFunctionComponentRule.meta.name).toBe('react/prefer-function-component')
    expect(preferFunctionComponentRule.meta.recommended).toBe(false)
    expect(preferFunctionComponentRule.meta.severity).toBe('info')
  })
})
