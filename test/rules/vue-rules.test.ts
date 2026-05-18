import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import { noComputedSideEffectsRule } from '../../src/rules/frameworks/vue/no-computed-side-effects.js'
import { noMutatingPropsRule } from '../../src/rules/frameworks/vue/no-mutating-props.js'
import { noVHtmlRule } from '../../src/rules/frameworks/vue/no-v-html.js'
import { requireDefaultPropRule } from '../../src/rules/frameworks/vue/require-default-prop.js'

// ─── SyntaxKind constants (matching ts-morph's bundled TypeScript) ───

const SK = {
  ArrayLiteralExpression: 209,
  ArrowFunction: 219,
  BinaryExpression: 226,
  BindingElement: 208,
  CallExpression: 213,
  EqualsToken: 64,
  FunctionExpression: 218,
  Identifier: 80,
  JsxAttribute: 291,
  MethodDeclaration: 174,
  MinusEqualsToken: 66,
  ObjectLiteralExpression: 210,
  PlusEqualsToken: 65,
  PropertyAccessExpression: 211,
  PropertyAssignment: 303,
  ShorthandPropertyAssignment: 304,
  SourceFile: 307,
  StringLiteral: 11,
  TemplateExpression: 228,
  ThisKeyword: 110,
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

// ─── Section: no-computed-side-effects ───

describe('no-computed-side-effects', () => {
  function createComputedNodeWithBody(
    bodyStatements: MockNode[],
    bodyKind: 'arrow' | 'function' | 'method' = 'arrow',
  ): MockNode {
    const sf = createSourceFileMock()
    const body: MockNode = {
      forEachDescendant(cb: (n: MockNode) => void) {
        for (const stmt of bodyStatements) {
          cb(stmt)
        }
      },
    }

    let getter: MockNode
    if (bodyKind === 'arrow') {
      getter = makeNode({ getBody: () => body, getKind: () => SK.ArrowFunction })
    } else {
      getter = makeNode({ getBody: () => body, getKind: () => SK.FunctionExpression })
    }

    const computedInit: MockNode = makeNode({
      getKind: () => SK.ObjectLiteralExpression,
      getProperties: () => [
        makeNode({
          getInitializer: () => getter,
          getKind: () => SK.PropertyAssignment,
        }),
      ],
    })

    return makeNode({
      getInitializer: () => computedInit,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'computed',
      getSourceFile: () => sf,
    })
  }

  function binaryAssignNode(operatorKind: number): MockNode {
    return makeNode({
      getKind: () => SK.BinaryExpression,
      getOperatorToken: () => ({ getKind: () => operatorKind }),
      getSourceFile: () => createSourceFileMock(),
    })
  }

  it('reports assignment (=) inside computed property getter', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComputedNodeWithBody([binaryAssignNode(SK.EqualsToken)])
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Side effect')
    expect(violations[0]!.ruleId).toBe('vue/no-computed-side-effects')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports plus-equals (+=) inside computed property getter', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComputedNodeWithBody([binaryAssignNode(SK.PlusEqualsToken)])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports minus-equals (-=) inside computed property getter', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComputedNodeWithBody([binaryAssignNode(SK.MinusEqualsToken)])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report computed property with no side effects', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const pureNode = makeNode({ getKind: () => SK.Identifier })
    const node = createComputedNodeWithBody([pureNode])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-computed property assignment', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.PropertyAssignment,
      getName: () => 'data',
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-property-assignment nodes', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report computed property with no initializer', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getInitializer: () => undefined,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'computed',
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports side effect in function expression getter', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComputedNodeWithBody([binaryAssignNode(SK.EqualsToken)], 'function')
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports multiple side effects independently', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node1 = createComputedNodeWithBody([binaryAssignNode(SK.EqualsToken)])
    const node2 = createComputedNodeWithBody([binaryAssignNode(SK.PlusEqualsToken)])

    visitor.visitNode!(node1, emptyContext)
    visitor.visitNode!(node2, emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('includes suggestion to move side effects', () => {
    const result = noComputedSideEffectsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComputedNodeWithBody([binaryAssignNode(SK.EqualsToken)])
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('methods or watchers')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noComputedSideEffectsRule.meta.category).toBe('correctness')
    expect(noComputedSideEffectsRule.meta.name).toBe('vue/no-computed-side-effects')
    expect(noComputedSideEffectsRule.meta.recommended).toBe(true)
    expect(noComputedSideEffectsRule.meta.severity).toBe('warning')
  })
})

// ─── Section: no-v-html ───

describe('no-v-html', () => {
  it('reports v-html in string literal', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralText: () => '<div v-html="content"></div>',
    })
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('v-html')
    expect(violations[0]!.message).toContain('XSS')
    expect(violations[0]!.ruleId).toBe('vue/no-v-html')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports v-html as JSX attribute', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const nameNode: MockNode = { getText: () => 'v-html' }
    const node = makeNode({
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('XSS')
  })

  it('reports v-html in template expression', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.TemplateExpression,
      getText: () => 'some v-html directive here',
    })
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('does not report string literal without v-html', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralText: () => '<div v-text="content"></div>',
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JSX attribute that is not v-html', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const nameNode: MockNode = { getText: () => 'v-text' }
    const node = makeNode({
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report template expression without v-html', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.TemplateExpression,
      getText: () => 'some regular template text',
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-matching node types', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('includes suggestion to use v-text', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralText: () => 'v-html',
    })
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('v-text')
  })

  it('reports multiple v-html occurrences independently', () => {
    const result = noVHtmlRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node1 = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralText: () => 'v-html="a"',
    })
    const nameNode: MockNode = { getText: () => 'v-html' }
    const node2 = makeNode({
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node1, emptyContext)
    visitor.visitNode!(node2, emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noVHtmlRule.meta.category).toBe('security')
    expect(noVHtmlRule.meta.name).toBe('vue/no-v-html')
    expect(noVHtmlRule.meta.recommended).toBe(true)
    expect(noVHtmlRule.meta.severity).toBe('warning')
  })
})

// ─── Section: no-mutating-props ───

describe('no-mutating-props', () => {
  it('reports direct mutation of prop via this.propName = value', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    // Register props: ['count']
    const propsArray = makeNode({
      getElements: () => [makeNode({ getKind: () => SK.StringLiteral, getLiteralValue: () => 'count' })],
      getKind: () => SK.ArrayLiteralExpression,
    })
    const propsNode = makeNode({
      getInitializer: () => propsArray,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(propsNode, emptyContext)

    // Simulate mutation: this.count = 5
    const thisExpr: MockNode = { getKind: () => SK.ThisKeyword }
    const left: MockNode = makeNode({
      getExpression: () => thisExpr,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'count',
      getText: () => 'this.count',
    })
    const mutation = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(mutation, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('count')
    expect(violations[0]!.message).toContain('prop')
    expect(violations[0]!.ruleId).toBe('vue/no-mutating-props')
    expect(violations[0]!.severity).toBe('error')
  })

  it('reports mutation with plus-equals operator', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    // Register props: ['total']
    const propsArray = makeNode({
      getElements: () => [makeNode({ getKind: () => SK.StringLiteral, getLiteralValue: () => 'total' })],
      getKind: () => SK.ArrayLiteralExpression, // ArrayLiteralExpression
    })
    const propsNode = makeNode({
      getInitializer: () => propsArray,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(propsNode, emptyContext)

    const thisExpr: MockNode = { getKind: () => SK.ThisKeyword }
    const left: MockNode = makeNode({
      getExpression: () => thisExpr,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'total',
      getText: () => 'this.total',
    })
    const mutation = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.PlusEqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(mutation, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports mutation with minus-equals operator', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const propsArray = makeNode({
      getElements: () => [makeNode({ getKind: () => SK.StringLiteral, getLiteralValue: () => 'value' })],
      getKind: () => SK.ArrayLiteralExpression,
    })
    const propsNode = makeNode({
      getInitializer: () => propsArray,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(propsNode, emptyContext)

    const thisExpr: MockNode = { getKind: () => SK.ThisKeyword }
    const left: MockNode = makeNode({
      getExpression: () => thisExpr,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'value',
      getText: () => 'this.value',
    })
    const mutation = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.MinusEqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(mutation, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports mutation when props defined as object literal', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const propDef: MockNode = makeNode({
      getKind: () => SK.PropertyAssignment,
      getName: () => 'title',
    })
    const propsObj = makeNode({
      getKind: () => SK.ObjectLiteralExpression,
      getProperties: () => [propDef],
    })
    const propsNode = makeNode({
      getInitializer: () => propsObj,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(propsNode, emptyContext)

    const thisExpr: MockNode = { getKind: () => SK.ThisKeyword }
    const left: MockNode = makeNode({
      getExpression: () => thisExpr,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'title',
      getText: () => 'this.title',
    })
    const mutation = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(mutation, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report mutation of non-prop property', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const propsArray = makeNode({
      getElements: () => [makeNode({ getKind: () => SK.StringLiteral, getLiteralValue: () => 'count' })],
      getKind: () => SK.ArrayLiteralExpression,
    })
    const propsNode = makeNode({
      getInitializer: () => propsArray,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(propsNode, emptyContext)

    const thisExpr: MockNode = { getKind: () => SK.ThisKeyword }
    const left: MockNode = makeNode({
      getExpression: () => thisExpr,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'localData',
      getText: () => 'this.localData',
    })
    const mutation = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(mutation, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report assignment without this prefix', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const propsArray = makeNode({
      getElements: () => [makeNode({ getKind: () => SK.StringLiteral, getLiteralValue: () => 'name' })],
      getKind: () => SK.ArrayLiteralExpression,
    })
    const propsNode = makeNode({
      getInitializer: () => propsArray,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(propsNode, emptyContext)

    const objExpr: MockNode = { getKind: () => SK.Identifier }
    const left: MockNode = makeNode({
      getExpression: () => objExpr,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'name',
      getText: () => 'obj.name',
    })
    const assignment = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(assignment, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-assignment binary expressions', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const binary = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => ({}),
      getOperatorToken: () => ({ getKind: () => 9999 }), // non-assignment
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(binary, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-binary-expression nodes', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report mutation when left is not property access', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = makeNode({ getKind: () => SK.Identifier })
    const mutation = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(mutation, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('includes suggestion to use data or emit', () => {
    const result = noMutatingPropsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const propsArray = makeNode({
      getElements: () => [makeNode({ getKind: () => SK.StringLiteral, getLiteralValue: () => 'items' })],
      getKind: () => SK.ArrayLiteralExpression,
    })
    const propsNode = makeNode({
      getInitializer: () => propsArray,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(propsNode, emptyContext)

    const thisExpr: MockNode = { getKind: () => SK.ThisKeyword }
    const left: MockNode = makeNode({
      getExpression: () => thisExpr,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'items',
      getText: () => 'this.items',
    })
    const mutation = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getKind: () => SK.EqualsToken }),
      getRight: () => ({}),
      getSourceFile: () => createSourceFileMock(),
    })
    visitor.visitNode!(mutation, emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('data property')
    expect(violations[0]!.suggestion).toContain('emit')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noMutatingPropsRule.meta.category).toBe('correctness')
    expect(noMutatingPropsRule.meta.name).toBe('vue/no-mutating-props')
    expect(noMutatingPropsRule.meta.recommended).toBe(true)
    expect(noMutatingPropsRule.meta.severity).toBe('error')
  })
})

// ─── Section: require-default-prop ───

describe('require-default-prop', () => {
  function createPropsNode(propDefs: MockNode[]): MockNode {
    const sf = createSourceFileMock()
    const propsObj = makeNode({
      getKind: () => SK.ObjectLiteralExpression,
      getProperties: () => propDefs,
    })
    return makeNode({
      getInitializer: () => propsObj,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
      getSourceFile: () => sf,
    })
  }

  function propWithObjectDef(
    name: string,
    innerProps: MockNode[],
  ): MockNode {
    const propDef = makeNode({
      getKind: () => SK.ObjectLiteralExpression,
      getProperties: () => innerProps,
    })
    return makeNode({
      getInitializer: () => propDef,
      getKind: () => SK.PropertyAssignment,
      getName: () => name,
    })
  }

  it('reports prop without default and without required', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const prop = propWithObjectDef('title', [])
    const node = createPropsNode([prop])
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('title')
    expect(violations[0]!.message).toContain('default')
    expect(violations[0]!.ruleId).toBe('vue/require-default-prop')
    expect(violations[0]!.severity).toBe('info')
  })

  it('does not report prop with default value', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const defaultProp: MockNode = makeNode({
      getKind: () => SK.PropertyAssignment,
      getName: () => 'default',
    })
    const prop = propWithObjectDef('count', [defaultProp])
    const node = createPropsNode([prop])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report prop with required: true', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const requiredProp: MockNode = makeNode({
      getInitializer: () => ({ getText: () => 'true' }),
      getKind: () => SK.PropertyAssignment,
      getName: () => 'required',
    })
    const prop = propWithObjectDef('name', [requiredProp])
    const node = createPropsNode([prop])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports prop with required: false (not true)', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const requiredProp: MockNode = makeNode({
      getInitializer: () => ({ getText: () => 'false' }),
      getKind: () => SK.PropertyAssignment,
      getName: () => 'required',
    })
    const prop = propWithObjectDef('label', [requiredProp])
    const node = createPropsNode([prop])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports multiple props independently', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const prop1 = propWithObjectDef('title', [])
    const prop2 = propWithObjectDef('subtitle', [])
    const node = createPropsNode([prop1, prop2])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('does not report non-props property assignment', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getInitializer: () => makeNode({ getKind: () => SK.ObjectLiteralExpression, getProperties: () => [] }),
      getKind: () => SK.PropertyAssignment,
      getName: () => 'data',
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when prop initializer is not object literal', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const prop: MockNode = makeNode({
      getInitializer: () => makeNode({ getKind: () => SK.Identifier }),
      getKind: () => SK.PropertyAssignment,
      getName: () => 'title',
    })
    const propsObj = makeNode({
      getKind: () => SK.ObjectLiteralExpression,
      getProperties: () => [prop],
    })
    const node = makeNode({
      getInitializer: () => propsObj,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-property-assignment nodes', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report prop with no initializer', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const prop: MockNode = makeNode({
      getInitializer: () => undefined,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'title',
    })
    const propsObj = makeNode({
      getKind: () => SK.ObjectLiteralExpression,
      getProperties: () => [prop],
    })
    const node = makeNode({
      getInitializer: () => propsObj,
      getKind: () => SK.PropertyAssignment,
      getName: () => 'props',
    })
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('includes suggestion in violation', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const prop = propWithObjectDef('value', [])
    const node = createPropsNode([prop])
    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('value')
    expect(violations[0]!.suggestion).toContain('default')
    expect(violations[0]!.suggestion).toContain('required')
  })

  it('does not report prop that has both required and default', () => {
    const result = requireDefaultPropRule.create({})
    const visitor = looseVisitor(result.visitor)

    const requiredProp: MockNode = makeNode({
      getInitializer: () => ({ getText: () => 'true' }),
      getKind: () => SK.PropertyAssignment,
      getName: () => 'required',
    })
    const defaultProp: MockNode = makeNode({
      getKind: () => SK.PropertyAssignment,
      getName: () => 'default',
    })
    const prop = propWithObjectDef('name', [requiredProp, defaultProp])
    const node = createPropsNode([prop])
    visitor.visitNode!(node, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(requireDefaultPropRule.meta.category).toBe('patterns')
    expect(requireDefaultPropRule.meta.name).toBe('vue/require-default-prop')
    expect(requireDefaultPropRule.meta.recommended).toBe(false)
    expect(requireDefaultPropRule.meta.severity).toBe('info')
  })
})
