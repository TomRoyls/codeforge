import { describe, expect, it } from 'vitest'

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
  ExpressionStatement: 244,
  Identifier: 80,
  ImportDeclaration: 272,
  ImportSpecifier: 276,
  JsxAttribute: 291,
  JsxExpression: 294,
  LabeledStatement: 256,
  MethodDeclaration: 174,
  ObjectLiteralExpression: 210,
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
    getFilePath: () => 'test.svelte',
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

const emptyContext: MockNode = {
  addViolation: () => {},
  depth: 0,
  getFilePath: () => 'test.svelte',
  parent: undefined,
  sourceFile: {
    getFilePath: () => 'test.svelte',
    getLineAndColumnAtPos: (_pos: number) => ({ column: 0, line: 1 }),
  },
}

// ─── Section: svelte/no-dom-manipulation ───

describe('svelte/no-dom-manipulation', () => {
  function createDocumentCallNode(method: string): MockNode {
    const sf = createSourceFileMock()
    const obj: MockNode = { getKind: () => SK.Identifier, getText: () => 'document' }
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

  function createStyleAssignmentNode(
    leftText: string,
    operator: string,
  ): MockNode {
    const sf = createSourceFileMock()
    const left: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getText: () => leftText,
    }
    return makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getText: () => operator }),
      getSourceFile: () => sf,
    })
  }

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

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports document.querySelectorAll call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('querySelectorAll'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports document.getElementsByClassName call', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('getElementsByClassName'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
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

  it('reports direct style manipulation with = operator', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '='), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('style manipulation')
    expect(violations[0]!.message).toContain('el.style.color')
  })

  it('reports direct style manipulation with += operator', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.padding', '+='), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports direct style manipulation with -= operator', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.margin', '-='), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report document call with non-document object', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const obj: MockNode = { getKind: () => SK.Identifier, getText: () => 'element' }
    const expression: MockNode = {
      getExpression: () => obj,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'getElementById',
    }
    const node = makeNode({
      getExpression: () => expression,
      getKind: () => SK.CallExpression,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report document call with non-DOM method', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('addEventListener'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-property-access call expression', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const expression: MockNode = { getKind: () => SK.Identifier, getText: () => 'fn' }
    const node = makeNode({
      getExpression: () => expression,
      getKind: () => SK.CallExpression,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report binary expression with comparison operator', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '==='), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report binary expression with non-style left side', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = {
      getKind: () => SK.PropertyAccessExpression,
      getText: () => 'el.className',
    }
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getText: () => '=' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-call-expression non-binary-expression nodes', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when call expression object is not an identifier', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const obj: MockNode = { getKind: () => SK.CallExpression, getText: () => 'getDoc()' }
    const expression: MockNode = {
      getExpression: () => obj,
      getKind: () => SK.PropertyAccessExpression,
      getName: () => 'getElementById',
    }
    const node = makeNode({
      getExpression: () => expression,
      getKind: () => SK.CallExpression,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report binary expression when left is not property access', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.Identifier, getText: () => 'x' }
    const node = makeNode({
      getKind: () => SK.BinaryExpression,
      getLeft: () => left,
      getOperatorToken: () => ({ getText: () => '=' }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple DOM manipulations', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('getElementById'), emptyContext)
    visitor.visitNode!(createDocumentCallNode('querySelector'), emptyContext)
    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '='), emptyContext)

    expect(result.onComplete!()).toHaveLength(3)
  })

  it('includes suggestion for DOM manipulation', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createDocumentCallNode('getElementById'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('reactive')
  })

  it('includes suggestion for style manipulation', () => {
    const result = noDomManipulationRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createStyleAssignmentNode('el.style.color', '='), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('style:directive')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noDomManipulationRule.meta.category).toBe('patterns')
    expect(noDomManipulationRule.meta.name).toBe('svelte/no-dom-manipulation')
    expect(noDomManipulationRule.meta.recommended).toBe(true)
    expect(noDomManipulationRule.meta.severity).toBe('warning')
  })
})

// ─── Section: svelte/no-reactive-assignments ───

describe('svelte/no-reactive-assignments', () => {
  function createLabeledStatementNode(
    leftName: string,
    rightText: string,
    rightIsIdentifier: boolean,
    operator = '=',
    rightChildren: MockNode[] = [],
  ): MockNode {
    const sf = createSourceFileMock()
    const label: MockNode = { getText: () => '$' }

    const right: MockNode = {
      forEachChild: (cb: (n: MockNode) => void) => {
        for (const child of rightChildren) {
          cb(child)
        }
      },
      getKind: () => rightIsIdentifier ? SK.Identifier : SK.BinaryExpression,
      getText: () => rightText,
    }
    const left: MockNode = { getKind: () => SK.Identifier, getText: () => leftName }
    const binaryExpr: MockNode = {
      getLeft: () => left,
      getOperatorToken: () => ({ getText: () => operator }),
      getRight: () => right,
      getKind: () => SK.BinaryExpression,
    }
    const statement: MockNode = {
      getExpression: () => binaryExpr,
      getKind: () => SK.ExpressionStatement,
    }

    return makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => label,
      getSourceFile: () => sf,
      getStatement: () => statement,
    })
  }

  it('reports self-referencing reactive assignment', () => {
    const rightId: MockNode = { getKind: () => SK.Identifier, getText: () => 'count' }
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createLabeledStatementNode('count', 'count', true, '=', [rightId]),
      emptyContext,
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('count')
    expect(violations[0]!.message).toContain('infinite loop')
    expect(violations[0]!.ruleId).toBe('svelte/no-reactive-assignments')
    expect(violations[0]!.severity).toBe('error')
  })

  it('reports self-referencing with $ prefix in right side', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createLabeledStatementNode('count', '$count + 1', false),
      emptyContext,
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('count')
  })

  it('reports self-referencing with += operator', () => {
    const rightId: MockNode = { getKind: () => SK.Identifier, getText: () => 'total' }
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createLabeledStatementNode('total', 'total', true, '+=', [rightId]),
      emptyContext,
    )

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports self-referencing with -= operator', () => {
    const rightId: MockNode = { getKind: () => SK.Identifier, getText: () => 'value' }
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createLabeledStatementNode('value', 'value', true, '-=', [rightId]),
      emptyContext,
    )

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report non-self-referencing reactive assignment', () => {
    const otherId: MockNode = { getKind: () => SK.Identifier, getText: () => 'otherValue' }
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createLabeledStatementNode('result', 'otherValue * 2', false, '=', [otherId]),
      emptyContext,
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-$ label', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const label: MockNode = { getText: () => 'loop' }
    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => label,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report labeled statement with non-expression statement body', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const label: MockNode = { getText: () => '$' }
    const statement: MockNode = { getKind: () => SK.Block }
    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => label,
      getStatement: () => statement,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report labeled statement with non-binary expression', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const label: MockNode = { getText: () => '$' }
    const expr: MockNode = { getKind: () => SK.CallExpression }
    const statement: MockNode = {
      getExpression: () => expr,
      getKind: () => SK.ExpressionStatement,
    }
    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => label,
      getStatement: () => statement,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report binary expression with non-assignment operator', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.Identifier, getText: () => 'x' }
    const right: MockNode = { getKind: () => SK.Identifier, getText: () => 'x', forEachChild: () => {} }
    const binaryExpr: MockNode = {
      getLeft: () => left,
      getOperatorToken: () => ({ getText: () => '===' }),
      getRight: () => right,
      getKind: () => SK.BinaryExpression,
    }
    const statement: MockNode = {
      getExpression: () => binaryExpr,
      getKind: () => SK.ExpressionStatement,
    }
    const label: MockNode = { getText: () => '$' }
    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => label,
      getStatement: () => statement,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when left is not an identifier', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.PropertyAccessExpression, getText: () => 'obj.x' }
    const right: MockNode = { getKind: () => SK.Identifier, getText: () => 'val', forEachChild: () => {} }
    const binaryExpr: MockNode = {
      getLeft: () => left,
      getOperatorToken: () => ({ getText: () => '=' }),
      getRight: () => right,
      getKind: () => SK.BinaryExpression,
    }
    const statement: MockNode = {
      getExpression: () => binaryExpr,
      getKind: () => SK.ExpressionStatement,
    }
    const label: MockNode = { getText: () => '$' }
    const node = makeNode({
      getKind: () => SK.LabeledStatement,
      getLabel: () => label,
      getStatement: () => statement,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report non-labeled-statement nodes', () => {
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.Identifier }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple self-referencing assignments', () => {
    const rightId1: MockNode = { getKind: () => SK.Identifier, getText: () => 'x' }
    const rightId2: MockNode = { getKind: () => SK.Identifier, getText: () => 'y' }
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createLabeledStatementNode('x', 'x', true, '=', [rightId1]), emptyContext)
    visitor.visitNode!(createLabeledStatementNode('y', 'y', true, '=', [rightId2]), emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('includes suggestion in violation', () => {
    const rightId: MockNode = { getKind: () => SK.Identifier, getText: () => 'count' }
    const result = noReactiveAssignmentsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createLabeledStatementNode('count', 'count', true, '=', [rightId]),
      emptyContext,
    )

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('self-referencing')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noReactiveAssignmentsRule.meta.category).toBe('correctness')
    expect(noReactiveAssignmentsRule.meta.name).toBe('svelte/no-reactive-assignments')
    expect(noReactiveAssignmentsRule.meta.recommended).toBe(true)
    expect(noReactiveAssignmentsRule.meta.severity).toBe('error')
  })
})

// ─── Section: svelte/no-unused-store ───

describe('svelte/no-unused-store', () => {
  function createImportSpecifierNode(
    storeName: string,
    moduleSource: string,
  ): MockNode {
    const sf = createSourceFileMock()
    const nameNode: MockNode = { getKind: () => SK.Identifier, getText: () => storeName }
    const importDecl: MockNode = {
      getModuleSpecifierValue: () => moduleSource,
    }
    return makeNode({
      getImportDeclaration: () => importDecl,
      getKind: () => SK.ImportSpecifier,
      getNameNode: () => nameNode,
      getSourceFile: () => sf,
    })
  }

  function createIdentifierNode(name: string, parent?: MockNode): MockNode {
    return makeNode({
      getKind: () => SK.Identifier,
      getParent: () => parent ?? ({}),
      getText: () => name,
    })
  }

  it('reports imported store that is never used', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('userStore', 'svelte/store'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('userStore')
    expect(violations[0]!.message).toContain('never used')
    expect(violations[0]!.ruleId).toBe('svelte/no-unused-store')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('does not report imported store that is used by name', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    const importParent: MockNode = { getKind: () => SK.ImportSpecifier }
    visitor.visitNode!(createImportSpecifierNode('userStore', 'svelte/store'), emptyContext)
    visitor.visitNode!(createIdentifierNode('userStore', { getKind: () => SK.CallExpression }), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report imported store used with $ prefix', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('counter', 'svelte/store'), emptyContext)
    visitor.visitNode!(createIdentifierNode('$counter'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report import from non-store module', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('something', 'svelte/runtime'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report import from module without store in name', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('onMount', 'svelte'), emptyContext)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple unused stores', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('userStore', 'svelte/store'), emptyContext)
    visitor.visitNode!(createImportSpecifierNode('countStore', './store'), emptyContext)
    visitor.visitNode!(createImportSpecifierNode('themeStore', './my-store'), emptyContext)

    expect(result.onComplete!()).toHaveLength(3)
  })

  it('reports only unused stores when some are used', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('usedStore', 'svelte/store'), emptyContext)
    visitor.visitNode!(createImportSpecifierNode('unusedStore', 'svelte/store'), emptyContext)
    visitor.visitNode!(createIdentifierNode('usedStore', { getKind: () => SK.CallExpression }), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('unusedStore')
  })

  it('does not report non-import-specifier non-identifier nodes', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(makeNode({ getKind: () => SK.ClassDeclaration }), emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report import specifier with non-identifier name node', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    const importDecl: MockNode = { getModuleSpecifierValue: () => 'svelte/store' }
    const node = makeNode({
      getImportDeclaration: () => importDecl,
      getKind: () => SK.ImportSpecifier,
      getNameNode: () => ({ getKind: () => SK.StringLiteral }),
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('tracks $ prefix usage for different stores correctly', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('count', 'svelte/store'), emptyContext)
    visitor.visitNode!(createImportSpecifierNode('name', 'svelte/store'), emptyContext)
    visitor.visitNode!(createIdentifierNode('$count'), emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('name')
  })

  it('does not count import specifier parent as usage', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('myStore', 'svelte/store'), emptyContext)

    const importSpecifierParent: MockNode = { getKind: () => SK.ImportSpecifier }
    const idNode = createIdentifierNode('myStore', importSpecifierParent)
    visitor.visitNode!(idNode, emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('includes suggestion in violation', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('dataStore', 'svelte/store'), emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain("'$' prefix")
    expect(violations[0]!.suggestion).toContain('dataStore')
  })

  it('detects store import from custom store path', () => {
    const result = noUnusedStoreRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createImportSpecifierNode('myStore', './stores/user'), emptyContext)

    expect(result.onComplete!()).toHaveLength(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnusedStoreRule.meta.category).toBe('correctness')
    expect(noUnusedStoreRule.meta.name).toBe('svelte/no-unused-store')
    expect(noUnusedStoreRule.meta.recommended).toBe(true)
    expect(noUnusedStoreRule.meta.severity).toBe('warning')
  })
})

// ─── Section: svelte/prefer-inline-handler ───

describe('svelte/prefer-inline-handler', () => {
  it('reports arrow function wrapper in StringLiteral', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralValue: () => 'on:click={() => handleClick()}"',
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.ruleId).toBe('svelte/prefer-inline-handler')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports arrow function wrapper in StringLiteral with different event', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralValue: () => 'on:submit={() => onSubmit()}"',
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.message).toContain('submit')
  })

  it('does not report StringLiteral without handler pattern', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralValue: () => 'Hello world',
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report StringLiteral with event but no arrow function', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = makeNode({
      getKind: () => SK.StringLiteral,
      getLiteralValue: () => 'on:click={handleClick}',
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports JsxAttribute with arrow function wrapper for simple call', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'handleClick' }
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
    const expression: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('on:click')
    expect(violations[0]!.message).toContain('handleClick')
    expect(violations[0]!.ruleId).toBe('svelte/prefer-inline-handler')
    expect(violations[0]!.severity).toBe('info')
  })

  it('does not report JsxAttribute with direct handler reference', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const initializer: MockNode = { getKind: () => SK.Identifier, getText: () => 'handleClick' }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => initializer,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JsxAttribute with arrow function that has parameters', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'handleClick' }
    const body: MockNode = {
      getArguments: () => [],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const eventParam: MockNode = { getName: () => 'event' }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [eventParam],
    }
    const expression: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JsxAttribute with arrow function that has call arguments', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const arg: MockNode = { getKind: () => SK.Identifier, getText: () => 'item' }
    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'handleClick' }
    const body: MockNode = {
      getArguments: () => [arg],
      getExpression: () => callee,
      getKind: () => SK.CallExpression,
    }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const expression: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JsxAttribute without on: prefix', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'handleClick' }
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
    const expression: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'onClick' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JsxAttribute without initializer', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => undefined,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JsxAttribute where initializer is not JsxExpression', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const initializer: MockNode = { getKind: () => SK.StringLiteral }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => initializer,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JsxExpression without inner expression', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const expression: MockNode = {
      getExpression: () => undefined,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report JsxExpression where inner expression is not ArrowFunction', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const innerExpr: MockNode = { getKind: () => SK.CallExpression }
    const expression: MockNode = {
      getExpression: () => innerExpr,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report arrow function body that is not a CallExpression', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const body: MockNode = { getKind: () => SK.Identifier, getText: () => 'value' }
    const arrowFn: MockNode = {
      getBody: () => body,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const expression: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when call expression callee is not identifier', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.PropertyAccessExpression, getText: () => 'obj.method' }
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
    const expression: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('includes suggestion in JsxAttribute violation', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee: MockNode = { getKind: () => SK.Identifier, getText: () => 'doSomething' }
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
    const expression: MockNode = {
      getExpression: () => arrowFn,
      getKind: () => SK.JsxExpression,
    }
    const nameNode: MockNode = { getText: () => 'on:click' }
    const node = makeNode({
      getInitializer: () => expression,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => nameNode,
    })

    visitor.visitNode!(node, emptyContext)

    const violations = result.onComplete!()
    expect(violations[0]!.suggestion).toContain('on:click={doSomething}')
  })

  it('reports multiple inline handler violations', () => {
    const result = preferInlineHandlerRule.create({})
    const visitor = looseVisitor(result.visitor)

    const callee1: MockNode = { getKind: () => SK.Identifier, getText: () => 'handler1' }
    const body1: MockNode = {
      getArguments: () => [],
      getExpression: () => callee1,
      getKind: () => SK.CallExpression,
    }
    const arrowFn1: MockNode = {
      getBody: () => body1,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const expr1: MockNode = {
      getExpression: () => arrowFn1,
      getKind: () => SK.JsxExpression,
    }
    const node1 = makeNode({
      getInitializer: () => expr1,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ getText: () => 'on:click' }),
    })

    const callee2: MockNode = { getKind: () => SK.Identifier, getText: () => 'handler2' }
    const body2: MockNode = {
      getArguments: () => [],
      getExpression: () => callee2,
      getKind: () => SK.CallExpression,
    }
    const arrowFn2: MockNode = {
      getBody: () => body2,
      getKind: () => SK.ArrowFunction,
      getParameters: () => [],
    }
    const expr2: MockNode = {
      getExpression: () => arrowFn2,
      getKind: () => SK.JsxExpression,
    }
    const node2 = makeNode({
      getInitializer: () => expr2,
      getKind: () => SK.JsxAttribute,
      getNameNode: () => ({ getText: () => 'on:hover' }),
    })

    visitor.visitNode!(node1, emptyContext)
    visitor.visitNode!(node2, emptyContext)

    expect(result.onComplete!()).toHaveLength(2)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(preferInlineHandlerRule.meta.category).toBe('patterns')
    expect(preferInlineHandlerRule.meta.name).toBe('svelte/prefer-inline-handler')
    expect(preferInlineHandlerRule.meta.recommended).toBe(true)
    expect(preferInlineHandlerRule.meta.severity).toBe('info')
  })
})
