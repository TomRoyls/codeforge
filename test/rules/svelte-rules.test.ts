import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import { noDomManipulationRule } from '../../src/rules/frameworks/svelte/no-dom-manipulation.js'
import { noReactiveAssignmentsRule } from '../../src/rules/frameworks/svelte/no-reactive-assignments.js'
import { noUnusedStoreRule } from '../../src/rules/frameworks/svelte/no-unused-store.js'
import { preferInlineHandlerRule } from '../../src/rules/frameworks/svelte/prefer-inline-handler.js'

// ─── SyntaxKind constants (from @ts-morph/common) ───

const SK = {
  ArrowFunction: 219,
  BinaryExpression: 226,
  Block: 241,
  CallExpression: 213,
  ClassDeclaration: 263,
  Constructor: 176,
  EqualsToken: 64,
  ExpressionStatement: 244,
  Identifier: 80,
  ImportDeclaration: 270,
  ImportSpecifier: 276,
  JsxAttribute: 291,
  JsxExpression: 294,
  LabeledStatement: 256,
  MethodDeclaration: 174,
  MinusEqualsToken: 66,
  ObjectLiteralExpression: 210,
  PlusEqualsToken: 65,
  PropertyAccessExpression: 211,
  PropertyAssignment: 303,
  PropertyDeclaration: 172,
  StringLiteral: 11,
} as const

// ─── Shared mock helpers ───

type MockNode = Record<string, unknown>

type LooseVisitor = Record<string, ((...args: unknown[]) => void) | undefined>

function looseVisitor(v: unknown): LooseVisitor {
  return v as unknown as LooseVisitor
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
    forEachChild: () => {},
    getEnd: () => 100,
    getKind: () => 0,
    getParent: () => ({}),
    getSourceFile: () => sf,
    getStart: () => 0,
    getText: () => '',
    ...overrides,
  }
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

// ─── Section: svelte/no-dom-manipulation ───

describe('svelte/no-dom-manipulation', () => {
  function createDocumentCallNode(method: string): MockNode {
    const sf = createSourceFileMock()
    const obj: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'document' }
    const expression: MockNode = {
      getExpression: () => obj,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => method,
    }
    return makeNode({
      getExpression: () => expression,
      getKind: () => SK.CallExpression,
      getSourceFile: () => sf,
    })
  }

  function createStyleAssignmentNode(leftText: string, operatorToken: string): MockNode {
    const sf = createSourceFileMock()
    const left: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getText: () => leftText,
    }
    return makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => operatorToken }),
      getRight: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '"red"' }),
      getSourceFile: () => sf,
    })
  }

  // ─── DOM API calls ───

  it('reports document.getElementById call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('getElementById'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('getElementById')
    expect(violations[0]!.message).toContain('DOM manipulation')
    expect(violations[0]!.ruleId).toBe('svelte/no-dom-manipulation')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports document.querySelector call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('querySelector'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports document.querySelectorAll call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('querySelectorAll'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports document.getElementsByClassName call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('getElementsByClassName'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports document.getElementsByTagName call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('getElementsByTagName'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports document.createElement call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('createElement'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report document.addEventListener call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('addEventListener'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-document getElementById call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const obj: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'myElement' }
    const propAccess: MockNode = {
      getExpression: () => obj,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'getElementById',
    }
    const node = makeNode({
      getExpression: () => propAccess,
      getKind: () => SK.CallExpression,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report call expression without property access expression', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getExpression: () => ({ forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'fn' }),
      getKind: () => SK.CallExpression,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-call-expression nodes for DOM calls', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ forEachChild: () => {}, getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Style assignments ───

  it('reports direct style.color assignment', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '='), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('style')
    expect(violations[0]!.message).toContain('el.style.color')
  })

  it('reports direct style.display assignment', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.display', '='), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports style assignment with += operator', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.margin', '+='), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports style assignment with -= operator', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.padding', '-='), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report style assignment with non-matching operator', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '*='), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-style property assignment', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.className', '='), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report style assignment when left is not property access', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => ({ forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'style' }),
      getOperatorToken: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '=' }),
      getRight: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '"red"' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-binary-expression nodes for style', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ forEachChild: () => {}, getExpression: () => ({ getKind: () => 0 }), getKind: () => SK.CallExpression }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Combined / edge cases ───

  it('reports both DOM call and style assignment in same session', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('querySelector'), emptyContext)
    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '='), emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('includes suggestion about Svelte reactivity', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('getElementById'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('reactive')
  })

  it('includes suggestion about Svelte style directives for style manipulation', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '='), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('style')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noDomManipulationRule.meta.category).toBe('patterns')
    expect(noDomManipulationRule.meta.description).toContain('DOM')
    expect(noDomManipulationRule.meta.name).toBe('svelte/no-dom-manipulation')
    expect(noDomManipulationRule.meta.recommended).toBe(true)
    expect(noDomManipulationRule.meta.severity).toBe('warning')
  })

  it('has empty default options', () => {
    expect(noDomManipulationRule.defaultOptions).toEqual({})
  })
})

// ─── Section: svelte/no-reactive-assignments ───

describe('svelte/no-reactive-assignments', () => {
  function createReactiveAssignment(
    leftName: string,
    rightText: string,
    operatorToken = '=',
    rightIdentifiers: string[] = [],
  ): MockNode {
    const sf = createSourceFileMock()

    const left: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => leftName }
    const right: MockNode = {
      getText: () => rightText,
      forEachChild: (cb: (n: MockNode) => void) => {
        for (const id of rightIdentifiers) {
          cb({ forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => id })
        }
      },
      getKind: () => SK.Identifier,
    }
    const binaryExpr: MockNode = {
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => operatorToken }),
      getRight: () => right,
    }
    const exprStatement: MockNode = {
      getExpression: () => binaryExpr,
      getKind: () => SK.ExpressionStatement,
    }

    return makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '$' }),
      getSourceFile: () => sf,
      getStatement: () => exprStatement,
    })
  }

  // ─── Positive cases ───

  it('reports self-referencing reactive assignment: $: x = x + 1', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createReactiveAssignment('x', 'x + 1', '=', ['x']), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('x')
    expect(violations[0]!.message).toContain('infinite loop')
    expect(violations[0]!.ruleId).toBe('svelte/no-reactive-assignments')
    expect(violations[0]!.severity).toBe('error')
  })

  it('reports reactive assignment where right side uses $ prefix on same variable', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const right: MockNode = {
      getText: () => '$count + 1',
      forEachChild: () => {},
      getKind: () => SK.Identifier,
    }
    const left: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'count' }
    const binaryExpr: MockNode = {
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '=' }),
      getRight: () => right,
    }
    const exprStatement: MockNode = {
      getExpression: () => binaryExpr,
      getKind: () => SK.ExpressionStatement,
    }
    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '$' }),
      getStatement: () => exprStatement,
    })

    visitor.visitNode!(node, emptyContext)
    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('count')
  })

  it('reports reactive assignment with += self-reference', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createReactiveAssignment('total', 'total + amount', '+=', ['total', 'amount']), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports reactive assignment with -= self-reference', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createReactiveAssignment('total', 'total - 1', '-=', ['total']), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  // ─── Negative cases ───

  it('does not report reactive assignment with different variables', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createReactiveAssignment('doubled', 'count * 2', '=', ['count']), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report reactive assignment deriving from another store', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createReactiveAssignment('filtered', 'items.filter(fn)', '=', ['items']), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-labeled-statement nodes', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ forEachChild: () => {}, getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report labeled statement with non-$ label', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'myLabel' }),
      getStatement: () => ({
        getExpression: () => ({
          getKind: () => SK.BinaryExpression,
          getLeft: () => ({ forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'x' }),
          getOperatorToken: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '=' }),
          getRight: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'x + 1', forEachChild: () => {} }),
        }),
        getKind: () => SK.ExpressionStatement,
      }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when statement is not an expression statement', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '$' }),
      getStatement: () => ({ forEachChild: () => {}, getKind: () => SK.Block, getStatements: () => [] }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when expression is not binary', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '$' }),
      getStatement: () => ({
        getExpression: () => ({ forEachChild: () => {}, getKind: () => SK.CallExpression }),
        getKind: () => SK.ExpressionStatement,
      }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report binary with non-assignment operator', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '$' }),
      getStatement: () => ({
        getExpression: () => ({
          getKind: () => SK.BinaryExpression,
          getLeft: () => ({ forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'x' }),
          getOperatorToken: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '*=' }),
          getRight: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'x', forEachChild: () => {} }),
        }),
        getKind: () => SK.ExpressionStatement,
      }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when left is not an identifier', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '$' }),
      getStatement: () => ({
        getExpression: () => ({
          getKind: () => SK.BinaryExpression,
          getLeft: () => ({ forEachChild: () => {}, getKind: () => SK.PropertyAccessExpression, getText: () => 'obj.x' }),
          getOperatorToken: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '=' }),
          getRight: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => '1', forEachChild: () => {} }),
        }),
        getKind: () => SK.ExpressionStatement,
      }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Edge cases ───

  it('reports multiple self-referencing reactive assignments independently', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createReactiveAssignment('a', 'a + 1', '=', ['a']), emptyContext)
    visitor.visitNode!(createReactiveAssignment('b', 'b * 2', '=', ['b']), emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('includes suggestion about avoiding self-reference', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createReactiveAssignment('x', 'x + 1', '=', ['x']), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('self-referencing')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noReactiveAssignmentsRule.meta.category).toBe('correctness')
    expect(noReactiveAssignmentsRule.meta.description).toContain('reactive')
    expect(noReactiveAssignmentsRule.meta.name).toBe('svelte/no-reactive-assignments')
    expect(noReactiveAssignmentsRule.meta.recommended).toBe(true)
    expect(noReactiveAssignmentsRule.meta.severity).toBe('error')
  })

  it('has empty default options', () => {
    expect(noReactiveAssignmentsRule.defaultOptions).toEqual({})
  })
})

// ─── Section: svelte/no-unused-store ───

describe('svelte/no-unused-store', () => {
  function createStoreImportNode(storeName: string, moduleSpecifier: string): MockNode {
    const sf = createSourceFileMock()
    const nameNode: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => storeName }
    return makeNode({
      getKind: () => SK.ImportSpecifier,
      getNameNode: () => nameNode,
      getSourceFile: () => sf,
      getImportDeclaration: () => ({
        getModuleSpecifierValue: () => moduleSpecifier,
      }),
    })
  }

  function createUsageIdentifier(name: string, parentKind: number): MockNode {
    return makeNode({
      getKind: () => SK.Identifier,
      getParent: () => ({ forEachChild: () => {}, getKind: () => parentKind }),
      getText: () => name,
    })
  }

  // ─── Positive cases ───

  it('reports unused store imported from a store module', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('userStore', './stores/user.store'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('userStore')
    expect(violations[0]!.message).toContain('never used')
    expect(violations[0]!.ruleId).toBe('svelte/no-unused-store')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports unused store imported from svelte/store', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('count', 'svelte/store'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('count')
  })

  it('reports multiple unused stores independently', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('storeA', './store'), emptyContext)
    visitor.visitNode!(createStoreImportNode('storeB', './store'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(2)
  })

  // ─── Negative cases ───

  it('does not report store that is used as an identifier', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('userStore', './store'), emptyContext)
    visitor.visitNode!(createUsageIdentifier('userStore', SK.CallExpression), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report store used with $ prefix', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('count', './store'), emptyContext)

    const dollarUsage = makeNode({
      getKind: () => SK.Identifier,
      getParent: () => ({ forEachChild: () => {}, getKind: () => SK.CallExpression }),
      getText: () => '$count',
    })
    visitor.visitNode!(dollarUsage, emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-store imports', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('Component', './components'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report import from module without "store" in name', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('myVar', './utils/helpers'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-import-specifier nodes', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ forEachChild: () => {}, getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not count import specifier itself as usage', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    const importNode = createStoreImportNode('myStore', './store')
    visitor.visitNode!(importNode, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  // ─── Edge cases ───

  it('includes suggestion about $ prefix', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('dataStore', './store'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('$')
    expect(violations[0]!.suggestion).toContain('dataStore')
  })

  it('reports store imported but only referenced in import specifier', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStoreImportNode('settings', './settings.store'), emptyContext)

    const importRef = makeNode({
      getKind: () => SK.Identifier,
      getParent: () => ({ forEachChild: () => {}, getKind: () => SK.ImportSpecifier }),
      getText: () => 'settings',
    })
    visitor.visitNode!(importRef, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report when import specifier name node is not an identifier', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.ImportSpecifier,
      getNameNode: () => ({ forEachChild: () => {}, getKind: () => SK.StringLiteral }),
      getImportDeclaration: () => ({ getModuleSpecifierValue: () => './store' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnusedStoreRule.meta.category).toBe('correctness')
    expect(noUnusedStoreRule.meta.description).toContain('unused')
    expect(noUnusedStoreRule.meta.name).toBe('svelte/no-unused-store')
    expect(noUnusedStoreRule.meta.recommended).toBe(true)
    expect(noUnusedStoreRule.meta.severity).toBe('warning')
  })

  it('has empty default options', () => {
    expect(noUnusedStoreRule.defaultOptions).toEqual({})
  })
})

// ─── Section: svelte/prefer-inline-handler ───

describe('svelte/prefer-inline-handler', () => {
  // ─── JSX attribute path (on:click={() => handleClick()}) ───

  function createJsxArrowHandlerNode(
    attributeName: string,
    calleeName: string,
  ): MockNode {
    const sf = createSourceFileMock()
    const callee: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => calleeName }
    const body: MockNode = {
      getArguments: () => [],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const jsxExpr: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    return makeNode({
      getInitializer: () => jsxExpr,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => attributeName }),
      getSourceFile: () => sf,
    })
  }

  it('reports on:click with arrow wrapping a simple call', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createJsxArrowHandlerNode('on:click', 'handleClick'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('on:click')
    expect(violations[0]!.message).toContain('handleClick')
    expect(violations[0]!.ruleId).toBe('svelte/prefer-inline-handler')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports on:submit with arrow wrapping a simple call', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createJsxArrowHandlerNode('on:submit', 'onSubmit'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports on:input with arrow wrapping a call', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createJsxArrowHandlerNode('on:input', 'handleInput'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report jsx attribute that does not start with on:', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createJsxArrowHandlerNode('class', 'getClass'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report jsx attribute without initializer', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getInitializer: () => undefined,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report jsx attribute with non-JSX-expression initializer', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getInitializer: () => ({ forEachChild: () => {}, getKind: () => SK.StringLiteral }),
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report jsx expression without expression', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const jsxExpr: MockNode = {
      getExpression: () => undefined,
      getKind: () => SK.JsxExpression,
    }
    const node = makeNode({
      getInitializer: () => jsxExpr,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-arrow function expression', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const jsxExpr: MockNode = {
      getExpression: () => ({ forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'handler' }),
      getKind: () => SK.JsxExpression,
    }
    const node = makeNode({
      getInitializer: () => jsxExpr,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report arrow function with parameters', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'handleClick' }
    const body: MockNode = {
      getArguments: () => [],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [{ getName: () => 'event' }],
    }
    const jsxExpr: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const node = makeNode({
      getInitializer: () => jsxExpr,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report arrow function body with arguments', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'handleClick' }
    const argNode: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'event' }
    const body: MockNode = {
      getArguments: () => [argNode],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const jsxExpr: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const node = makeNode({
      getInitializer: () => jsxExpr,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report arrow function body that is not a call expression', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const body: MockNode = { forEachChild: () => {}, getKind: () => SK.Identifier, getText: () => 'someValue' }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const jsxExpr: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const node = makeNode({
      getInitializer: () => jsxExpr,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report call expression body with non-identifier callee', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { forEachChild: () => {}, getKind: () => SK.PropertyAccessExpression, getText: () => 'obj.method' }
    const body: MockNode = {
      getArguments: () => [],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const jsxExpr: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const node = makeNode({
      getInitializer: () => jsxExpr,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ forEachChild: () => {}, getSourceFile: () => createSourceFileMock(), getText: () => 'on:click' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── String literal path (template text matching) ───

  it('detects arrow handler pattern in string literal', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralValue: () => 'on:click={() => handleClick()}',
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('click')
    expect(violations[0]!.message).toContain('handleClick')
  })

  it('does not report plain string literal without handler pattern', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralValue: () => 'hello world',
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Non-relevant nodes ───

  it('does not report non-jsx-attribute and non-string-literal nodes', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ forEachChild: () => {}, getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  // ─── Edge cases ───

  it('reports multiple inline handler violations independently', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createJsxArrowHandlerNode('on:click', 'handleClick'), emptyContext)
    visitor.visitNode!(createJsxArrowHandlerNode('on:change', 'handleChange'), emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('includes suggestion about inline handler alternative', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createJsxArrowHandlerNode('on:click', 'doSomething'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('on:click')
    expect(violations[0]!.suggestion).toContain('doSomething')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(preferInlineHandlerRule.meta.category).toBe('patterns')
    expect(preferInlineHandlerRule.meta.description).toContain('inline')
    expect(preferInlineHandlerRule.meta.name).toBe('svelte/prefer-inline-handler')
    expect(preferInlineHandlerRule.meta.recommended).toBe(true)
    expect(preferInlineHandlerRule.meta.severity).toBe('info')
  })

  it('has empty default options', () => {
    expect(preferInlineHandlerRule.defaultOptions).toEqual({})
  })
})
