import { describe, test, expect, vi } from 'vitest'
import {
  maxNestedCallbacksRule,
  analyzeNestedCallbacks,
} from '../../../../src/rules/complexity/max-nested-callbacks'
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor'
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockFunctionExpression,
  createMockArrowFunction,
  createMockMethodDeclaration,
  createMockConstructorDeclaration,
  createMockGetAccessorDeclaration,
  createMockSetAccessorDeclaration,
  createMockNode,
  createSourceFileWithChildren,
  SyntaxKind,
} from '../../../helpers/ast-helpers'
import type { SourceFile, Node } from 'ts-morph'

function createMockVisitorContext(sourceFile: SourceFile): VisitorContext {
  return {
    sourceFile,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => sourceFile.getFilePath(),
  }
}

vi.mock('ts-morph', () => {
  const actual = vi.importActual('ts-morph')
  const kinds = {
    SourceFile: 305,
    FunctionDeclaration: 257,
    FunctionExpression: 216,
    ArrowFunction: 211,
    MethodDeclaration: 173,
    ConstructorDeclaration: 174,
    GetAccessorDeclaration: 175,
    SetAccessorDeclaration: 176,
    ClassDeclaration: 263,
    IfStatement: 244,
    ForStatement: 245,
    ForInStatement: 246,
    ForOfStatement: 282,
    WhileStatement: 247,
    DoStatement: 248,
    SwitchStatement: 251,
    CaseClause: 297,
    DefaultClause: 298,
    CatchClause: 253,
    ConditionalExpression: 226,
    BinaryExpression: 225,
    VariableDeclaration: 260,
    Identifier: 79,
    Block: 236,
    TryStatement: 254,
  }

  const isNodeOfKind = (node: { getKind: () => number }, kind: number) => node?.getKind() === kind

  return {
    ...actual,
    Node: {
      isSourceFile: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.SourceFile),
      isFunctionDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.FunctionDeclaration),
      isFunctionExpression: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.FunctionExpression),
      isArrowFunction: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ArrowFunction),
      isMethodDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.MethodDeclaration),
      isConstructorDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ConstructorDeclaration),
      isGetAccessorDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.GetAccessorDeclaration),
      isSetAccessorDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.SetAccessorDeclaration),
      isClassDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ClassDeclaration),
      isIfStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.IfStatement),
      isForStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ForStatement),
      isForInStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ForInStatement),
      isForOfStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ForOfStatement),
      isWhileStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.WhileStatement),
      isDoStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.DoStatement),
      isSwitchStatement: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.SwitchStatement),
      isCaseClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.CaseClause),
      isDefaultClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.DefaultClause),
      isCatchClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.CatchClause),
      isConditionalExpression: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.ConditionalExpression),
      isBinaryExpression: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.BinaryExpression),
      isVariableDeclaration: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.VariableDeclaration),
      isIdentifier: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.Identifier),
      isBlock: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.Block),
      isTryStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.TryStatement),
    },
  }
})

function createDeeplyNestedCallbacks(depth: number): Node {
  if (depth <= 0) {
    return createMockNode({ kind: SyntaxKind.Identifier, text: 'leaf' })
  }

  const child = createDeeplyNestedCallbacks(depth - 1)
  return createMockArrowFunction({
    parentIsVariable: false,
    children: [child],
  })
}

describe('maxNestedCallbacksRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxNestedCallbacksRule.meta.name).toBe('max-nested-callbacks')
    })

    test('has correct category', () => {
      expect(maxNestedCallbacksRule.meta.category).toBe('complexity')
    })

    test('is recommended', () => {
      expect(maxNestedCallbacksRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(maxNestedCallbacksRule.meta.description).toContain('callback')
    })
  })

  describe('defaultOptions', () => {
    test('has default max of 4', () => {
      expect(maxNestedCallbacksRule.defaultOptions.max).toBe(4)
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = maxNestedCallbacksRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = maxNestedCallbacksRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for function with no callbacks', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'noCallbacks' })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })

    test('create with empty options uses default max 4', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxNestedCallbacksRule.create({})
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })

    test('create with undefined max uses default', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxNestedCallbacksRule.create({ max: undefined })
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('arrow callback nesting', () => {
  test('single arrow callback increases depth', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithCallback',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 1')
  })

  test('two levels of nested arrow callbacks', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedCallbacks',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 2')
  })

  test('three levels of nested arrow callbacks', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const mid = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [mid] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'threeLevels',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 3')
  })

  test('four levels of nested arrow callbacks', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const d = createMockArrowFunction({ parentIsVariable: false, children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'fourLevels',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 4')
  })

  test('five levels of nested arrow callbacks', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const d = createMockArrowFunction({ parentIsVariable: false, children: [c] })
    const e = createMockArrowFunction({ parentIsVariable: false, children: [d] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'fiveLevels',
      children: [e],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 5')
  })

  test('six levels of nested arrow callbacks', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const d = createMockArrowFunction({ parentIsVariable: false, children: [c] })
    const e = createMockArrowFunction({ parentIsVariable: false, children: [d] })
    const f = createMockArrowFunction({ parentIsVariable: false, children: [e] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'sixLevels',
      children: [f],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 5 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 6')
  })

  test('sibling arrow callbacks do not accumulate depth', () => {
    const cb1 = createMockArrowFunction({ parentIsVariable: false })
    const cb2 = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingCallbacks',
      children: [cb1, cb2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('three sibling callbacks at depth 1 with max 0', () => {
    const cb1 = createMockArrowFunction({ parentIsVariable: false })
    const cb2 = createMockArrowFunction({ parentIsVariable: false })
    const cb3 = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'threeSiblings',
      children: [cb1, cb2, cb3],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 1')
  })
})

describe('function expression callback nesting', () => {
  test('single function expression callback increases depth', () => {
    const callback = createMockFunctionExpression({ functionName: 'cb' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithExpr',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 1')
  })

  test('two levels of nested function expression callbacks', () => {
    const inner = createMockFunctionExpression({ functionName: 'innerCb' })
    const outer = createMockFunctionExpression({ functionName: 'outerCb', children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedExprCallbacks',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 2')
  })

  test('three levels of nested function expression callbacks', () => {
    const a = createMockFunctionExpression({ functionName: 'cb1' })
    const b = createMockFunctionExpression({ functionName: 'cb2', children: [a] })
    const c = createMockFunctionExpression({ functionName: 'cb3', children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'tripleExprCallbacks',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 3')
  })

  test('sibling function expressions do not accumulate', () => {
    const cb1 = createMockFunctionExpression({ functionName: 'cb1' })
    const cb2 = createMockFunctionExpression({ functionName: 'cb2' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingExprs',
      children: [cb1, cb2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('anonymous function expression callback increases depth', () => {
    const callback = createMockFunctionExpression({ functionName: undefined })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'withAnonCb',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 1')
  })
})

describe('mixed callback types', () => {
  test('arrow inside function expression', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockFunctionExpression({ functionName: 'outer', children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mixedInner',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 2')
  })

  test('function expression inside arrow', () => {
    const inner = createMockFunctionExpression({ functionName: 'cb' })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mixedOuter',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 2')
  })

  test('three-level mixed nesting', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const mid = createMockFunctionExpression({ functionName: 'mid', children: [inner] })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [mid] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'threeMixed',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 3')
  })

  test('callback with non-callback siblings', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const binary = createMockNode({ kind: SyntaxKind.BinaryExpression })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mixedSiblings',
      children: [ident, callback, binary],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('callbacks with other constructs between levels', () => {
    const innerCb = createMockArrowFunction({ parentIsVariable: false })
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const outerCb = createMockArrowFunction({
      parentIsVariable: false,
      children: [ident, innerCb],
    })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'withGap',
      children: [outerCb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 2')
  })
})

describe('function declarations are not callbacks', () => {
  test('nested function declaration does NOT increase depth', () => {
    const innerFunc = createMockFunctionDeclaration({ functionName: 'helper' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'outerWithHelper',
      children: [innerFunc],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function declaration with nested callbacks inside counts them', () => {
    const innerCb = createMockArrowFunction({ parentIsVariable: false })
    const helperFunc = createMockFunctionDeclaration({
      functionName: 'helper',
      children: [innerCb],
    })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'outerFunc',
      children: [helperFunc],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 1')
  })

  test('multiple function declarations do not increase depth', () => {
    const helper1 = createMockFunctionDeclaration({ functionName: 'helper1' })
    const helper2 = createMockFunctionDeclaration({ functionName: 'helper2' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'withHelpers',
      children: [helper1, helper2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('threshold boundaries', () => {
  test('no violation when depth equals max', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcAtLimit',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('violation when depth exceeds max by 1', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcOverLimit',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('handles very large depth values', () => {
    let currentNode: Node = createMockArrowFunction({ parentIsVariable: false })
    for (let i = 0; i < 9; i++) {
      currentNode = createMockArrowFunction({
        parentIsVariable: false,
        children: [currentNode],
      })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'veryDeepCb',
      children: [currentNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 10')
  })

  test('depth exactly at max is not flagged', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const d = createMockArrowFunction({ parentIsVariable: false, children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactMax',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-nested-callbacks')
  })

  test('violation includes warning severity', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes function name in message', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'myFunction',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain("Function 'myFunction'")
  })

  test('violation includes suggestion', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('async/await')
  })

  test('violation includes range', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('violation includes file path', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].filePath).toBeDefined()
  })

  test('violation message includes actual depth', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'depthMsg',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('callback nesting depth of 2')
  })

  test('violation message includes max allowed', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxMsg',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('Maximum allowed is 0')
  })

  test('violation message format includes both depth and max', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'formatTest',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    const msg = violations[0].message
    expect(msg).toContain('callback nesting depth of 2')
    expect(msg).toContain('Maximum allowed is 1')
  })
})

describe('analyzeNestedCallbacks', () => {
  test('returns empty array for file with no violations', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('returns violations for deeply nested callbacks', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedCbFunc',
      children: [outer],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('max-nested-callbacks')
  })

  test('uses default max of 4 when not specified', () => {
    let currentNode: Node = createMockArrowFunction({ parentIsVariable: false })
    for (let i = 0; i < 4; i++) {
      currentNode = createMockArrowFunction({
        parentIsVariable: false,
        children: [currentNode],
      })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'deepCbFunc',
      children: [currentNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile)
    expect(violations).toHaveLength(1)
  })

  test('handles multiple functions with varying depths', () => {
    const shallowFunc = createMockFunctionDeclaration({ functionName: 'shallowFunc' })
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const deepFunc = createMockFunctionDeclaration({
      functionName: 'deepFunc',
      children: [outer],
    })
    const sourceFile = createSourceFileWithChildren([
      shallowFunc,
      deepFunc,
    ]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('deepFunc')
  })

  test('detects violation with function expression callbacks', () => {
    const cb = createMockFunctionExpression({ functionName: 'cb' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exprCbFunc',
      children: [cb],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('no violation for depth at max', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'atMax',
      children: [cb],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 1)
    expect(violations).toHaveLength(0)
  })

  test('violation has correct properties', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'propsFunc',
      children: [cb],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 0)
    expect(violations[0].ruleId).toBe('max-nested-callbacks')
    expect(violations[0].severity).toBe('warning')
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].range).toBeDefined()
  })

  test('with no functions returns empty', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const sourceFile = createSourceFileWithChildren([ident]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('three functions all deep produce three violations', () => {
    const makeDeep = (name: string) => {
      const a = createMockArrowFunction({ parentIsVariable: false })
      const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
      return createMockFunctionDeclaration({ functionName: name, children: [b] })
    }
    const fn1 = makeDeep('fn1')
    const fn2 = makeDeep('fn2')
    const fn3 = makeDeep('fn3')
    const sourceFile = createSourceFileWithChildren([fn1, fn2, fn3]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNestedCallbacks(sourceFile, 1)
    expect(violations).toHaveLength(3)
  })
})

describe('custom options', () => {
  test('uses custom max value from options', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('max=2 flags depth 3', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxTwo',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 2')
  })

  test('max=2 allows depth 2', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxTwoOk',
      children: [b],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=3 flags depth 4', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const d = createMockArrowFunction({ parentIsVariable: false, children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxThree',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 3')
  })

  test('max=3 allows depth 3', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxThreeOk',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=0 flags even single callback', () => {
    const callback = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxZero',
      children: [callback],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 0')
  })

  test('max=0 allows function with no callbacks', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxZeroOk',
      children: [],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=6 allows depth 6', () => {
    let node: Node = createMockArrowFunction({ parentIsVariable: false })
    for (let i = 0; i < 5; i++) {
      node = createMockArrowFunction({ parentIsVariable: false, children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxSixOk',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 6 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=6 flags depth 7', () => {
    let node: Node = createMockArrowFunction({ parentIsVariable: false })
    for (let i = 0; i < 6; i++) {
      node = createMockArrowFunction({ parentIsVariable: false, children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxSixOver',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 6 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })
})

describe('create function', () => {
  test('visitor has only visitFunction method', () => {
    const ruleInstance = maxNestedCallbacksRule.create({})
    expect(Object.keys(ruleInstance.visitor)).toContain('visitFunction')
  })

  test('onComplete returns array', () => {
    const ruleInstance = maxNestedCallbacksRule.create({})
    const result = ruleInstance.onComplete!()
    expect(Array.isArray(result)).toBe(true)
  })

  test('multiple visitFunction calls accumulate violations', () => {
    const funcNode1 = createMockFunctionDeclaration({
      functionName: 'func1',
      children: [createMockArrowFunction({ parentIsVariable: false })],
    })
    const funcNode2 = createMockFunctionDeclaration({
      functionName: 'func2',
      children: [createMockArrowFunction({ parentIsVariable: false })],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode1 as unknown as FunctionLikeNode, context)
    ruleInstance.visitor.visitFunction!(funcNode2 as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(2)
  })

  test('create returns new instance each time', () => {
    const instance1 = maxNestedCallbacksRule.create({})
    const instance2 = maxNestedCallbacksRule.create({})
    expect(instance1).not.toBe(instance2)
  })

  test('each instance has independent violations', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [createMockArrowFunction({ parentIsVariable: false })],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance1 = maxNestedCallbacksRule.create({ max: 0 })
    const instance2 = maxNestedCallbacksRule.create({ max: 4 })
    instance1.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    instance2.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance1.onComplete!()).toHaveLength(1)
    expect(instance2.onComplete!()).toHaveLength(0)
  })
})

describe('function types', () => {
  test('arrow function with callback nesting is flagged', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const arrowNode = createMockArrowFunction({
      parentIsVariable: true,
      variableName: 'arrowFn',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('method declaration with callback nesting is flagged', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const methodNode = createMockMethodDeclaration({
      methodName: 'myMethod',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('function expression with callback nesting is flagged', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const exprNode = createMockFunctionExpression({
      functionName: 'myExpr',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(exprNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('constructor declaration with callback nesting is flagged', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const ctorNode = createMockConstructorDeclaration({
      parentClassName: 'MyClass',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(ctorNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('get accessor with callback nesting is flagged', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const getterNode = createMockGetAccessorDeclaration({
      accessorName: 'value',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(getterNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('set accessor with callback nesting is flagged', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const setterNode = createMockSetAccessorDeclaration({
      accessorName: 'value',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(setterNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('arrow function without callbacks is not flagged', () => {
    const arrowNode = createMockArrowFunction({
      parentIsVariable: true,
      variableName: 'flatArrow',
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('method declaration without callbacks is not flagged', () => {
    const methodNode = createMockMethodDeclaration({ methodName: 'flatMethod' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('edge cases', () => {
  test('handles empty function body', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'emptyFunc',
      children: [],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles function with only identifiers', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyIdent',
      children: [ident],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles function with binary expressions only', () => {
    const binary = createMockNode({ kind: SyntaxKind.BinaryExpression })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyBinary',
      children: [binary],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles function with conditional expressions only', () => {
    const cond = createMockNode({ kind: SyntaxKind.ConditionalExpression })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyTernary',
      children: [cond],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles function with variable declarations only', () => {
    const varDecl = createMockNode({ kind: SyntaxKind.VariableDeclaration })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyVarDecl',
      children: [varDecl],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('very deep callback nesting with depth 20', () => {
    let node: Node = createMockArrowFunction({ parentIsVariable: false })
    for (let i = 0; i < 19; i++) {
      node = createMockArrowFunction({ parentIsVariable: false, children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'depth20',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 20')
  })

  test('deeply nested callbacks using helper', () => {
    const nested = createDeeplyNestedCallbacks(7)
    const funcNode = createMockFunctionDeclaration({
      functionName: 'helperNested',
      children: [nested],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 7')
  })

  test('branching tree picks maximum depth', () => {
    const deepBranch = createMockArrowFunction({
      parentIsVariable: false,
      children: [createMockArrowFunction({ parentIsVariable: false })],
    })
    const shallowBranch = createMockNode({ kind: SyntaxKind.Identifier })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'branchingTree',
      children: [deepBranch, shallowBranch],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('callback nesting depth of 2')
  })

  test('function with many sibling non-callback nodes', () => {
    const children = Array.from(
      { length: 10 },
      () => createMockNode({ kind: SyntaxKind.Identifier }),
    )
    const funcNode = createMockFunctionDeclaration({
      functionName: 'manySiblings',
      children,
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('meta expanded', () => {
  test('meta has fixable set to code', () => {
    expect(maxNestedCallbacksRule.meta.fixable).toBe('code')
  })

  test('meta description is a non-empty string', () => {
    expect(typeof maxNestedCallbacksRule.meta.description).toBe('string')
    expect(maxNestedCallbacksRule.meta.description.length).toBeGreaterThan(0)
  })

  test('meta name is a string', () => {
    expect(typeof maxNestedCallbacksRule.meta.name).toBe('string')
  })

  test('meta category is a string', () => {
    expect(typeof maxNestedCallbacksRule.meta.category).toBe('string')
  })

  test('meta recommended is boolean', () => {
    expect(typeof maxNestedCallbacksRule.meta.recommended).toBe('boolean')
  })

  test('defaultOptions is an object', () => {
    expect(typeof maxNestedCallbacksRule.defaultOptions).toBe('object')
  })

  test('defaultOptions has only max property', () => {
    expect(Object.keys(maxNestedCallbacksRule.defaultOptions)).toContain('max')
  })

  test('create is a function', () => {
    expect(typeof maxNestedCallbacksRule.create).toBe('function')
  })
})

describe('depth exactly at max', () => {
  test('depth 1 with max 1 is NOT flagged', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactOne',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('depth 2 with max 2 is NOT flagged', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactTwo',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('depth 3 with max 3 is NOT flagged', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactThree',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('depth 4 with max 4 is NOT flagged', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const d = createMockArrowFunction({ parentIsVariable: false, children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactFour',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('depth one over max', () => {
  test('depth 2 with max 1 IS flagged', () => {
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne2v1',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('depth 3 with max 2 IS flagged', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne3v2',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('depth 5 with max 4 IS flagged', () => {
    const a = createMockArrowFunction({ parentIsVariable: false })
    const b = createMockArrowFunction({ parentIsVariable: false, children: [a] })
    const c = createMockArrowFunction({ parentIsVariable: false, children: [b] })
    const d = createMockArrowFunction({ parentIsVariable: false, children: [c] })
    const e = createMockArrowFunction({ parentIsVariable: false, children: [d] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne5v4',
      children: [e],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })
})

describe('not flagged: functions without callbacks', () => {
  test('function with only identifiers', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyIdent',
      children: [ident],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with binary expressions', () => {
    const binary = createMockNode({ kind: SyntaxKind.BinaryExpression })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyBinary',
      children: [binary],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('completely empty function body', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'emptyBody',
      children: [],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with only function declarations', () => {
    const helper = createMockFunctionDeclaration({ functionName: 'helper' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyDeclarations',
      children: [helper],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('violation properties', () => {
  test('violation severity is always warning', () => {
    const cb = createMockFunctionExpression({ functionName: 'cb' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'severityTest',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation suggestion mentions refactoring', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'sugTest',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toContain('Refactor')
  })

  test('violation range has start and end', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'rangeTest',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('violation message format for function name', () => {
    const cb = createMockArrowFunction({ parentIsVariable: false })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mySpecificFunction',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toMatch(/Function 'mySpecificFunction'/)
  })

  test('violation has correct ruleId for different callback types', () => {
    const cb = createMockFunctionExpression({ functionName: 'cb' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'ruleIdTest',
      children: [cb],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-nested-callbacks')
  })
})

describe('multiple functions', () => {
  test('two functions without callbacks produce no violations', () => {
    const func1 = createMockFunctionDeclaration({ functionName: 'fn1' })
    const func2 = createMockFunctionDeclaration({ functionName: 'fn2' })
    const sourceFile = createSourceFileWithChildren([func1, func2]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeNestedCallbacks(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('one deep and one shallow function produces one violation', () => {
    const shallow = createMockFunctionDeclaration({ functionName: 'shallow' })
    const inner = createMockArrowFunction({ parentIsVariable: false })
    const outer = createMockArrowFunction({ parentIsVariable: false, children: [inner] })
    const deep = createMockFunctionDeclaration({
      functionName: 'deep',
      children: [outer],
    })
    const sourceFile = createSourceFileWithChildren([shallow, deep]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeNestedCallbacks(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('deep')
  })

  test('multiple visitFunction calls in rule instance', () => {
    const func1 = createMockFunctionDeclaration({
      functionName: 'fn1',
      children: [createMockArrowFunction({ parentIsVariable: false })],
    })
    const func2 = createMockFunctionDeclaration({
      functionName: 'fn2',
      children: [
        createMockArrowFunction({
          parentIsVariable: false,
          children: [createMockArrowFunction({ parentIsVariable: false })],
        }),
      ],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxNestedCallbacksRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(func1 as unknown as FunctionLikeNode, context)
    ruleInstance.visitor.visitFunction!(func2 as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('fn2')
  })
})
