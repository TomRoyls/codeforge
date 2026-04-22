import { describe, test, expect, vi } from 'vitest'
import {
  maxComplexityRule,
  analyzeComplexity,
} from '../../../../src/rules/complexity/max-complexity'
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
  createMockClassDeclaration,
  createMockIfStatement,
  createMockForStatement,
  createMockForInStatement,
  createMockForOfStatement,
  createMockWhileStatement,
  createMockDoStatement,
  createMockCaseClause,
  createMockDefaultClause,
  createMockCatchClause,
  createMockConditionalExpression,
  createMockBinaryExpression,
  createDeeplyNestedNodes,
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

vi.mock('ts-morph', async () => {
  const actual = await vi.importActual('ts-morph')
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
      isArrowFunction: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ArrowFunction),
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

describe('maxComplexityRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxComplexityRule.meta.name).toBe('max-complexity')
    })

    test('has correct category', () => {
      expect(maxComplexityRule.meta.category).toBe('complexity')
    })

    test('is recommended', () => {
      expect(maxComplexityRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(maxComplexityRule.meta.description).toContain('cyclomatic complexity')
    })
  })

  describe('defaultOptions', () => {
    test('has default max of 10', () => {
      expect(maxComplexityRule.defaultOptions.max).toBe(10)
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = maxComplexityRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = maxComplexityRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for simple function below threshold', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 10 })
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('complexity calculation', () => {
  test('simple function has complexity of 1', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 1')
  })

  test('function with if statement increases complexity', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with for loop increases complexity', () => {
    const forNode = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with for-in loop increases complexity', () => {
    const forInNode = createMockForInStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithForIn',
      children: [forInNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with for-of loop increases complexity', () => {
    const forOfNode = createMockForOfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithForOf',
      children: [forOfNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with while loop increases complexity', () => {
    const whileNode = createMockWhileStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithWhile',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with do-while loop increases complexity', () => {
    const doNode = createMockDoStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithDo',
      children: [doNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with case clause increases complexity', () => {
    const caseNode = createMockCaseClause()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithCase',
      children: [caseNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with catch clause increases complexity', () => {
    const catchNode = createMockCatchClause()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithCatch',
      children: [catchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with conditional expression increases complexity', () => {
    const conditionalNode = createMockConditionalExpression()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithTernary',
      children: [conditionalNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with logical AND operator increases complexity', () => {
    const mockOperatorToken = { getKind: () => 56 }
    const mockLeft = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    }
    const mockRight = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    }
    const children: Node[] = [mockLeft, mockRight] as unknown as Node[]

    const mockBinaryExpr = {
      getKind: () => SyntaxKind.BinaryExpression,
      getStart: () => 0,
      getEnd: () => 10,
      getFullStart: () => 0,
      getText: () => 'a && b',
      getSourceFile: () => createMockSourceFile(),
      forEachChild: (cb: (node: Node) => void) => {
        children.forEach((child) => cb(child))
      },
      getOperatorToken: () => mockOperatorToken,
    } as unknown as Node

    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithAnd',
      children: [mockBinaryExpr],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with logical OR operator increases complexity', () => {
    const mockOperatorToken = { getKind: () => 57 }
    const mockLeft = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    }
    const mockRight = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    }
    const children: Node[] = [mockLeft, mockRight] as unknown as Node[]

    const mockBinaryExpr = {
      getKind: () => SyntaxKind.BinaryExpression,
      getStart: () => 0,
      getEnd: () => 10,
      getFullStart: () => 0,
      getText: () => 'a || b',
      getSourceFile: () => createMockSourceFile(),
      forEachChild: (cb: (node: Node) => void) => {
        children.forEach((child) => cb(child))
      },
      getOperatorToken: () => mockOperatorToken,
    } as unknown as Node

    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithOr',
      children: [mockBinaryExpr],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 2')
  })

  test('function with non-logical binary operator does not increase complexity', () => {
    const mockOperatorToken = { getKind: () => 39 }
    const mockLeft = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    }
    const mockRight = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    }
    const children: Node[] = [mockLeft, mockRight] as unknown as Node[]

    const mockBinaryExpr = {
      getKind: () => SyntaxKind.BinaryExpression,
      getStart: () => 0,
      getEnd: () => 10,
      getFullStart: () => 0,
      getText: () => 'a + b',
      getSourceFile: () => createMockSourceFile(),
      forEachChild: (cb: (node: Node) => void) => {
        children.forEach((child) => cb(child))
      },
      getOperatorToken: () => mockOperatorToken,
    } as unknown as Node

    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithPlus',
      children: [mockBinaryExpr],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 1')
  })
})

describe('threshold boundaries', () => {
  test('no violation when complexity equals max', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcAtLimit',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('violation when complexity exceeds max by 1', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcOverLimit',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('handles large complexity values', () => {
    const nodes: Node[] = []
    for (let i = 0; i < 15; i++) {
      nodes.push(createMockIfStatement())
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: nodes,
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 10 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 16')
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-complexity')
  })

  test('violation includes warning severity', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes function name in message', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'myFunction' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain("Function 'myFunction'")
  })

  test('violation includes suggestion', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('single-responsibility')
  })

  test('violation includes range', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })
})

describe('analyzeComplexity', () => {
  test('returns empty array for file with no violations', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeComplexity(sourceFile, 10)
    expect(violations).toHaveLength(0)
  })

  test('returns violations for complex functions', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeComplexity(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('max-complexity')
  })

  test('uses default max of 10 when not specified', () => {
    const nodes: Node[] = []
    for (let i = 0; i < 11; i++) {
      nodes.push(createMockIfStatement())
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: nodes,
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeComplexity(sourceFile)
    expect(violations).toHaveLength(1)
  })

  test('handles multiple functions', () => {
    const simpleFunc = createMockFunctionDeclaration({ functionName: 'simpleFunc' })
    const ifNode = createMockIfStatement()
    const complexFunc = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: [ifNode, ifNode, ifNode],
    })
    const sourceFile = createSourceFileWithChildren([
      simpleFunc,
      complexFunc,
    ]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeComplexity(sourceFile, 2)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexFunc')
  })
})

describe('custom options', () => {
  test('uses custom max value from options', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('uses default max when not provided', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
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
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 1')
  })

  test('handles arrow function', () => {
    const arrowNode = createMockArrowFunction({ parentIsVariable: true, variableName: 'arrowFn' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain("'arrowFn'")
  })

  test('handles method declaration', () => {
    const methodNode = createMockMethodDeclaration({ methodName: 'doSomething' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain("'doSomething'")
  })

  test('handles deeply nested control structures', () => {
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedFunc',
      children: [outerIf],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxComplexityRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexity of 3')
  })
})

describe('analyzeComplexity with mock source files', () => {
  function createTestSourceFile(funcNodes: Node[]) {
    const sf = createSourceFileWithChildren(funcNodes) as unknown as SourceFile
    ;(sf as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    return sf
  }

  function createMockLogicalBinaryExpr(operatorKind: number, children: Node[] = []): Node {
    const mockLeft = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    } as unknown as Node
    const mockRight = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    } as unknown as Node
    const extraChildren = children.length > 0 ? children : [mockLeft, mockRight]
    return {
      getKind: () => SyntaxKind.BinaryExpression,
      getStart: () => 0,
      getEnd: () => 10,
      getFullStart: () => 0,
      getText: () => (operatorKind === 56 ? 'a && b' : operatorKind === 57 ? 'a || b' : 'a + b'),
      getSourceFile: () => createMockSourceFile(),
      forEachChild: (cb: (node: Node) => void) => {
        extraChildren.forEach((child) => cb(child))
      },
      getChildren: () => extraChildren,
      getChildCount: () => extraChildren.length,
      getParent: () => undefined,
      getOperatorToken: () => ({ getKind: () => operatorKind }),
    } as unknown as Node
  }

  describe('basic functions', () => {
    test('simple function has complexity 1 - no violation at max 10', () => {
      const func = createMockFunctionDeclaration({ functionName: 'f' })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 10)
      expect(violations).toHaveLength(0)
    })

    test('simple function has complexity 1 - violation at max 0', () => {
      const func = createMockFunctionDeclaration({ functionName: 'f' })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })

    test('function with one if has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with two ifs has complexity 3', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('function with three ifs has complexity 4', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('function with for loop has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with for-in loop has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForInStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with for-of loop has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForOfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with while loop has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockWhileStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with do-while loop has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockDoStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with catch clause has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCatchClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with ternary has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockConditionalExpression()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('function with case clause has complexity 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCaseClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('arrow function has complexity 1', () => {
      const arrow = createMockArrowFunction({ parentIsVariable: true, variableName: 'fn' })
      const sf = createTestSourceFile([arrow])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })

    test('class method has complexity 1', () => {
      const method = createMockMethodDeclaration({ methodName: 'doSomething' })
      const sf = createTestSourceFile([method])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })

    test('constructor has complexity 1', () => {
      const ctor = createMockConstructorDeclaration({ parentClassName: 'MyClass' })
      const sf = createTestSourceFile([ctor])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })

    test('getter accessor has complexity 1', () => {
      const getter = createMockGetAccessorDeclaration({ accessorName: 'value' })
      const sf = createTestSourceFile([getter])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })

    test('setter accessor has complexity 1', () => {
      const setter = createMockSetAccessorDeclaration({ accessorName: 'value' })
      const sf = createTestSourceFile([setter])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })
  })

  describe('if statements - extended', () => {
    test('if-else if chain counts each if separately', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('nested if inside if adds 2 to complexity', () => {
      const innerIf = createMockIfStatement()
      const outerIf = createMockIfStatement({ children: [innerIf] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outerIf] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('five sequential ifs produce complexity 6', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 5 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('ten sequential ifs produce complexity 11', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 10 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 10)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 11')
    })

    test('eleven sequential ifs exceed default threshold', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 11 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf)
      expect(violations).toHaveLength(1)
    })

    test('triple nested ifs produce complexity 4', () => {
      const innerIf = createMockIfStatement()
      const midIf = createMockIfStatement({ children: [innerIf] })
      const outerIf = createMockIfStatement({ children: [midIf] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outerIf] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })
  })

  describe('loops - extended', () => {
    test('nested for loops add 2 to complexity', () => {
      const innerFor = createMockForStatement()
      const outerFor = createMockForStatement({ children: [innerFor] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outerFor] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('for loop with if inside adds 2 to complexity', () => {
      const forWithIf = createMockForStatement({ children: [createMockIfStatement()] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [forWithIf] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('while with catch inside adds 2 to complexity', () => {
      const whileWithCatch = createMockWhileStatement({ children: [createMockCatchClause()] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [whileWithCatch] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('multiple sequential loops add cumulatively', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForStatement(), createMockWhileStatement(), createMockDoStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('for-of with ternary inside adds 2', () => {
      const forOfWithTernary = createMockForOfStatement({
        children: [createMockConditionalExpression()],
      })
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [forOfWithTernary],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('for-in with case clause inside adds 2', () => {
      const forInWithCase = createMockForInStatement({ children: [createMockCaseClause()] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [forInWithCase] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })
  })

  describe('switch statements - extended', () => {
    test('switch with 2 cases adds 2 to complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCaseClause(), createMockCaseClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('switch with 3 cases adds 3 to complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCaseClause(), createMockCaseClause(), createMockCaseClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('switch with 5 cases adds 5 to complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 5 }, () => createMockCaseClause()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('default clause does not add to complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockDefaultClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(0)
    })

    test('switch with cases and default - only cases count', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCaseClause(), createMockCaseClause(), createMockDefaultClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('switch with 10 cases produces complexity 11', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 10 }, () => createMockCaseClause()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 10)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 11')
    })

    test('if + switch cases combined', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockCaseClause(), createMockCaseClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })
  })

  describe('logical operators - extended', () => {
    test('chained && a && b && c adds 2 to complexity', () => {
      const innerAnd = createMockLogicalBinaryExpr(56)
      const outerAnd = createMockLogicalBinaryExpr(56)
      // Simulate (a && b) && c: outer has inner as child
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outerAnd] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 2')
    })

    test('two separate && operators add 2 to complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockLogicalBinaryExpr(56), createMockLogicalBinaryExpr(56)],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('two separate || operators add 2 to complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockLogicalBinaryExpr(57), createMockLogicalBinaryExpr(57)],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('mixed && and || add 2 to complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockLogicalBinaryExpr(56), createMockLogicalBinaryExpr(57)],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('if + && adds 2 total', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockLogicalBinaryExpr(56)],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('non-logical binary operator does not increase complexity beyond base', () => {
      const plusExpr = createMockLogicalBinaryExpr(39) // + operator
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [plusExpr] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(0)
    })
  })

  describe('catch clauses - extended', () => {
    test('nested try-catch adds 2 to complexity', () => {
      const innerCatch = createMockCatchClause()
      const outerCatch = createMockCatchClause({ children: [innerCatch] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outerCatch] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('catch with if inside adds 2 to complexity', () => {
      const catchWithIf = createMockCatchClause({ children: [createMockIfStatement()] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [catchWithIf] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('multiple try-catch blocks add cumulatively', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCatchClause(), createMockCatchClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('catch inside loop adds both contributions', () => {
      const forWithCatch = createMockForStatement({ children: [createMockCatchClause()] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [forWithCatch] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })
  })

  describe('ternary - extended', () => {
    test('nested ternary adds 2 to complexity', () => {
      const inner = createMockConditionalExpression()
      const outer = createMockConditionalExpression({ children: [inner] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outer] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('multiple ternaries add cumulatively', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockConditionalExpression(), createMockConditionalExpression()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('ternary inside if adds both contributions', () => {
      const ifWithTernary = createMockIfStatement({ children: [createMockConditionalExpression()] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [ifWithTernary] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('triple nested ternary adds 3', () => {
      const innermost = createMockConditionalExpression()
      const mid = createMockConditionalExpression({ children: [innermost] })
      const outer = createMockConditionalExpression({ children: [mid] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outer] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })
  })

  describe('combined structures', () => {
    test('if + for produces complexity 3', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockForStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('if + while + ternary produces complexity 4', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [
          createMockIfStatement(),
          createMockWhileStatement(),
          createMockConditionalExpression(),
        ],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('for + case clauses produces combined complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForStatement(), createMockCaseClause(), createMockCaseClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('if + catch + ternary produces complexity 4', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [
          createMockIfStatement(),
          createMockCatchClause(),
          createMockConditionalExpression(),
        ],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('all loop types combined produce complexity 6', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [
          createMockForStatement(),
          createMockForInStatement(),
          createMockForOfStatement(),
          createMockWhileStatement(),
          createMockDoStatement(),
        ],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('complex function with 15 control flow nodes', () => {
      const children: Node[] = []
      for (let i = 0; i < 15; i++) children.push(createMockIfStatement())
      const func = createMockFunctionDeclaration({ functionName: 'complexFunc', children })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 10)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 16')
    })

    test('deeply nested control structures', () => {
      const innerIf = createMockIfStatement()
      const midIf = createMockIfStatement({ children: [innerIf] })
      const outerFor = createMockForStatement({ children: [midIf] })
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [outerFor] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('switch cases + if + for combined', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [
          createMockCaseClause(),
          createMockCaseClause(),
          createMockCaseClause(),
          createMockIfStatement(),
          createMockForStatement(),
        ],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })
  })

  describe('custom thresholds', () => {
    test('max 1: function with one if triggers violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
    })

    test('max 2: function with two ifs triggers violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
    })

    test('max 5: function with 5 ifs triggers violation (complexity 6)', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 5 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('max 5: function with 4 ifs does not trigger (complexity 5)', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 4 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(0)
    })

    test('max 20: complex function does not trigger', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 10 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 20)
      expect(violations).toHaveLength(0)
    })

    test('max 0: any function triggers violation', () => {
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [] })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })

    test('max 1: simple function does not trigger (complexity 1)', () => {
      const func = createMockFunctionDeclaration({ functionName: 'f' })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(0)
    })

    test('max 3: function at boundary does not trigger', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(0)
    })

    test('max 3: function just over triggers', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
    })

    test('message includes max allowed value', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations[0].message).toContain('Maximum allowed is 1')
    })

    test('message includes complexity value', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations[0].message).toContain('complexity of 3')
    })
  })

  describe('edge cases - extended', () => {
    test('handles deeply nested nodes via helper', () => {
      const deepNode = createDeeplyNestedNodes(5)
      const func = createMockFunctionDeclaration({ functionName: 'deepFunc', children: [deepNode] })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 5 })
      ruleInstance.visitor.visitFunction!(func as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('arrow function with children', () => {
      const arrow = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'complexArrow',
        children: [createMockIfStatement(), createMockForStatement()],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 2 })
      ruleInstance.visitor.visitFunction!(arrow as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain("'complexArrow'")
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('method with children and class parent', () => {
      const method = createMockMethodDeclaration({
        methodName: 'process',
        parentClassName: 'Service',
        children: [createMockIfStatement(), createMockCatchClause()],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 2 })
      ruleInstance.visitor.visitFunction!(method as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain("'Service.process'")
    })

    test('constructor with parent class', () => {
      const ctor = createMockConstructorDeclaration({
        parentClassName: 'MyClass',
        children: [createMockIfStatement()],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 1 })
      ruleInstance.visitor.visitFunction!(ctor as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain("'constructor (MyClass)'")
    })

    test('getter with complexity', () => {
      const getter = createMockGetAccessorDeclaration({
        accessorName: 'value',
        children: [createMockConditionalExpression()],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 1 })
      ruleInstance.visitor.visitFunction!(getter as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain("'get value'")
    })

    test('setter with complexity', () => {
      const setter = createMockSetAccessorDeclaration({
        accessorName: 'value',
        children: [createMockIfStatement()],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 1 })
      ruleInstance.visitor.visitFunction!(setter as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain("'set value'")
    })

    test('function expression assigned to variable', () => {
      const funcExpr = createMockFunctionExpression({
        functionName: 'namedExpr',
        children: [createMockIfStatement()],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 1 })
      ruleInstance.visitor.visitFunction!(funcExpr as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain("'namedExpr'")
    })

    test('anonymous function expression', () => {
      const funcExpr = createMockFunctionExpression({
        functionName: undefined,
        children: [createMockIfStatement()],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 1 })
      ruleInstance.visitor.visitFunction!(funcExpr as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
    })

    test('class declaration as mock node', () => {
      const classNode = createMockClassDeclaration({ className: 'MyClass', children: [] })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 0 })
      ruleInstance.visitor.visitFunction!(classNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
    })

    test('mixed node types in function children', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'mixed',
        children: [
          createMockIfStatement(),
          createMockForStatement(),
          createMockCaseClause(),
          createMockCatchClause(),
          createMockConditionalExpression(),
        ],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 5 })
      ruleInstance.visitor.visitFunction!(func as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('function with only non-complexity nodes', () => {
      const id = {
        getKind: () => SyntaxKind.Identifier,
        forEachChild: (cb: (n: Node) => void) => {},
      } as unknown as Node
      const func = createMockFunctionDeclaration({ functionName: 'onlyId', children: [id] })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxComplexityRule.create({ max: 0 })
      ruleInstance.visitor.visitFunction!(func as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 1')
    })
  })

  describe('multiple violations', () => {
    test('two functions both exceeding threshold', () => {
      const func1 = createMockFunctionDeclaration({
        functionName: 'f1',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const func2 = createMockFunctionDeclaration({
        functionName: 'f2',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func1, func2])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('three functions all exceeding threshold', () => {
      const funcs = Array.from({ length: 3 }, (_, i) =>
        createMockFunctionDeclaration({
          functionName: `f${i}`,
          children: [createMockIfStatement(), createMockIfStatement()],
        }),
      )
      const sf = createTestSourceFile(funcs)
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(3)
    })

    test('two functions - only one exceeding', () => {
      const simple = createMockFunctionDeclaration({ functionName: 'simple' })
      const complex = createMockFunctionDeclaration({
        functionName: 'complex',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([simple, complex])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain("'complex'")
    })

    test('four functions all exceeding threshold', () => {
      const funcs = Array.from({ length: 4 }, (_, i) =>
        createMockFunctionDeclaration({
          functionName: `f${i}`,
          children: [createMockIfStatement()],
        }),
      )
      const sf = createTestSourceFile(funcs)
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(4)
    })

    test('five functions - mixed violations', () => {
      const funcs = [
        createMockFunctionDeclaration({ functionName: 'ok1' }),
        createMockFunctionDeclaration({
          functionName: 'bad1',
          children: [createMockIfStatement(), createMockIfStatement()],
        }),
        createMockFunctionDeclaration({ functionName: 'ok2' }),
        createMockFunctionDeclaration({
          functionName: 'bad2',
          children: [createMockIfStatement(), createMockIfStatement()],
        }),
        createMockFunctionDeclaration({ functionName: 'ok3' }),
      ]
      const sf = createTestSourceFile(funcs)
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(2)
    })

    test('mixed function types - declarations and arrows', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'declFn',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const arrow = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'arrowFn',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func, arrow])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('methods and constructors all exceeding', () => {
      const method = createMockMethodDeclaration({
        methodName: 'm',
        parentClassName: 'C',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const ctor = createMockConstructorDeclaration({
        parentClassName: 'C',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([method, ctor])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('nested functions both exceeding', () => {
      const inner = createMockFunctionDeclaration({
        functionName: 'inner',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const outer = createMockFunctionDeclaration({
        functionName: 'outer',
        children: [inner, createMockIfStatement()],
      })
      const sf = createTestSourceFile([outer])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('no violations when all functions within threshold', () => {
      const funcs = Array.from({ length: 5 }, (_, i) =>
        createMockFunctionDeclaration({
          functionName: `f${i}`,
          children: [createMockIfStatement()],
        }),
      )
      const sf = createTestSourceFile(funcs)
      const violations = analyzeComplexity(sf, 10)
      expect(violations).toHaveLength(0)
    })
  })

  describe('valid code - no violations at various thresholds', () => {
    test('simple function at max 10', () => {
      const func = createMockFunctionDeclaration({ functionName: 'f' })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with one if at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with two ifs at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with for loop at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with while loop at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockWhileStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with do-while at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockDoStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with for-in at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForInStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with for-of at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForOfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with catch at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCatchClause()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with ternary at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockConditionalExpression()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with case clause at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCaseClause()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with default clause at max 10', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockDefaultClause()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('arrow function with no branching', () => {
      const arrow = createMockArrowFunction({ parentIsVariable: true, variableName: 'fn' })
      const sf = createTestSourceFile([arrow])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('method with no branching', () => {
      const method = createMockMethodDeclaration({ methodName: 'm' })
      const sf = createTestSourceFile([method])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('constructor with no branching', () => {
      const ctor = createMockConstructorDeclaration({ parentClassName: 'C' })
      const sf = createTestSourceFile([ctor])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('getter with no branching', () => {
      const getter = createMockGetAccessorDeclaration({ accessorName: 'x' })
      const sf = createTestSourceFile([getter])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('setter with no branching', () => {
      const setter = createMockSetAccessorDeclaration({ accessorName: 'x' })
      const sf = createTestSourceFile([setter])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function with identifier children only', () => {
      const id = {
        getKind: () => SyntaxKind.Identifier,
        forEachChild: (cb: (n: Node) => void) => {},
      } as unknown as Node
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [id, id, id] })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 1)).toHaveLength(0)
    })

    test('function with mixed non-complexity children', () => {
      const id = {
        getKind: () => SyntaxKind.Identifier,
        forEachChild: (cb: (n: Node) => void) => {},
      } as unknown as Node
      const block = {
        getKind: () => 999,
        forEachChild: (cb: (n: Node) => void) => {},
      } as unknown as Node
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [id, block, id] })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 1)).toHaveLength(0)
    })

    test('function at exactly max threshold (complexity 10)', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 9 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('function at exactly max threshold (complexity 5)', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 4 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 5)).toHaveLength(0)
    })

    test('function at exactly max threshold (complexity 1)', () => {
      const func = createMockFunctionDeclaration({ functionName: 'f' })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 1)).toHaveLength(0)
    })

    test('function with empty children at max 1', () => {
      const func = createMockFunctionDeclaration({ functionName: 'f', children: [] })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 1)).toHaveLength(0)
    })

    test('function with single if at max 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 2)).toHaveLength(0)
    })

    test('function with single for at max 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 2)).toHaveLength(0)
    })

    test('function with single catch at max 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCatchClause()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 2)).toHaveLength(0)
    })

    test('function with single ternary at max 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockConditionalExpression()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 2)).toHaveLength(0)
    })

    test('function with single case at max 2', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockCaseClause()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 2)).toHaveLength(0)
    })

    test('function with multiple non-complexity nodes', () => {
      const nodes: Node[] = []
      for (let i = 0; i < 10; i++) {
        nodes.push({
          getKind: () => SyntaxKind.Identifier,
          forEachChild: (cb: (n: Node) => void) => {},
        } as unknown as Node)
      }
      const func = createMockFunctionDeclaration({ functionName: 'f', children: nodes })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 0)).toHaveLength(1) // complexity 1, max 0 → violation
      expect(analyzeComplexity(sf, 1)).toHaveLength(0) // complexity 1, max 1 → no violation
    })

    test('multiple simple functions all within threshold', () => {
      const funcs = Array.from({ length: 10 }, (_, i) =>
        createMockFunctionDeclaration({ functionName: `f${i}` }),
      )
      const sf = createTestSourceFile(funcs)
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })

    test('multiple functions each with one if at max 10', () => {
      const funcs = Array.from({ length: 5 }, (_, i) =>
        createMockFunctionDeclaration({
          functionName: `f${i}`,
          children: [createMockIfStatement()],
        }),
      )
      const sf = createTestSourceFile(funcs)
      expect(analyzeComplexity(sf, 10)).toHaveLength(0)
    })
  })

  describe('additional coverage - function types', () => {
    test('constructor with parent class name in violation', () => {
      const ctor = createMockConstructorDeclaration({
        parentClassName: 'Service',
        children: [createMockIfStatement(), createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([ctor])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('Service')
    })

    test('constructor without parent class still detected', () => {
      const ctor = createMockConstructorDeclaration({
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([ctor])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
    })

    test('getter accessor with ternary', () => {
      const getter = createMockGetAccessorDeclaration({
        accessorName: 'isActive',
        children: [createMockConditionalExpression()],
      })
      const sf = createTestSourceFile([getter])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('isActive')
    })

    test('setter accessor with if statement', () => {
      const setter = createMockSetAccessorDeclaration({
        accessorName: 'name',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([setter])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('name')
    })

    test('function expression with name', () => {
      const funcExpr = createMockFunctionExpression({
        functionName: 'namedFn',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([funcExpr])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('namedFn')
    })

    test('anonymous function expression', () => {
      const funcExpr = createMockFunctionExpression({
        functionName: undefined,
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([funcExpr])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
    })

    test('class declaration with method', () => {
      const method = createMockMethodDeclaration({
        methodName: 'process',
        parentClassName: 'Handler',
        children: [createMockIfStatement(), createMockForStatement()],
      })
      const sf = createTestSourceFile([method])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('Handler')
    })

    test('class with multiple methods all violating', () => {
      const method1 = createMockMethodDeclaration({
        methodName: 'm1',
        parentClassName: 'C',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const method2 = createMockMethodDeclaration({
        methodName: 'm2',
        parentClassName: 'C',
        children: [createMockForStatement(), createMockWhileStatement()],
      })
      const sf = createTestSourceFile([method1, method2])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('arrow function with variable name in violation', () => {
      const arrow = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'handleSubmit',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([arrow])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('handleSubmit')
    })

    test('arrow function without parent variable', () => {
      const arrow = createMockArrowFunction({
        parentIsVariable: false,
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([arrow])
      const violations = analyzeComplexity(sf, 0)
      expect(violations).toHaveLength(1)
    })
  })

  describe('additional coverage - complex scenarios', () => {
    test('deeply nested if statements (3 levels)', () => {
      const innerIf = createMockIfStatement()
      const midIf = createMockIfStatement({ children: [innerIf] })
      const outerIf = createMockIfStatement({ children: [midIf] })
      const func = createMockFunctionDeclaration({
        functionName: 'nested',
        children: [outerIf],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('if inside for inside while', () => {
      const ifStmt = createMockIfStatement()
      const forStmt = createMockForStatement({ children: [ifStmt] })
      const whileStmt = createMockWhileStatement({ children: [forStmt] })
      const func = createMockFunctionDeclaration({
        functionName: 'tripleNested',
        children: [whileStmt],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('switch with 4 cases and ternary inside', () => {
      const ternary = createMockConditionalExpression()
      const cases = [
        createMockCaseClause({ children: [ternary] }),
        createMockCaseClause(),
        createMockCaseClause(),
        createMockCaseClause(),
      ]
      const func = createMockFunctionDeclaration({
        functionName: 'switchWithTernary',
        children: cases,
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('multiple catch clauses', () => {
      const catch1 = createMockCatchClause()
      const catch2 = createMockCatchClause()
      const catch3 = createMockCatchClause()
      const func = createMockFunctionDeclaration({
        functionName: 'multiCatch',
        children: [catch1, catch2, catch3],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('logical operators chained 4 deep', () => {
      const innerAnd = createMockLogicalBinaryExpr(56)
      const midAnd = createMockLogicalBinaryExpr(56, [innerAnd])
      const outerAnd = createMockLogicalBinaryExpr(56, [midAnd])
      const func = createMockFunctionDeclaration({
        functionName: 'chainAnd',
        children: [outerAnd],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('mixed loops all types in one function', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'allLoops',
        children: [
          createMockForStatement(),
          createMockForInStatement(),
          createMockForOfStatement(),
          createMockWhileStatement(),
          createMockDoStatement(),
        ],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 4)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('if with && and || in same function', () => {
      const andExpr = createMockLogicalBinaryExpr(56)
      const orExpr = createMockLogicalBinaryExpr(57)
      const func = createMockFunctionDeclaration({
        functionName: 'mixedLogic',
        children: [createMockIfStatement(), andExpr, orExpr],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 4')
    })

    test('function at exact threshold 5 is not a violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'exactFive',
        children: [
          createMockIfStatement(),
          createMockIfStatement(),
          createMockIfStatement(),
          createMockIfStatement(),
        ],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 5)).toHaveLength(0)
    })

    test('function at complexity 6 with threshold 5 is a violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'justOver',
        children: [
          createMockIfStatement(),
          createMockIfStatement(),
          createMockIfStatement(),
          createMockIfStatement(),
          createMockIfStatement(),
        ],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 6')
    })

    test('deeply nested nodes helper produces correct complexity', () => {
      const deep = createDeeplyNestedNodes(4)
      const func = createMockFunctionDeclaration({
        functionName: 'deepTest',
        children: [deep],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 3)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 5')
    })
  })

  describe('additional coverage - threshold boundaries', () => {
    test('threshold 1: function with 1 if is violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 1)).toHaveLength(1)
    })

    test('threshold 2: function with 2 ifs is violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 2)).toHaveLength(1)
    })

    test('threshold 2: function with 1 if is not violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 2)).toHaveLength(0)
    })

    test('threshold 4: function with for+while+if is violation', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockForStatement(), createMockWhileStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 3)).toHaveLength(1)
      expect(analyzeComplexity(sf, 4)).toHaveLength(0)
    })

    test('threshold 6: complex function at boundary', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [
          createMockIfStatement(),
          createMockForStatement(),
          createMockWhileStatement(),
          createMockCatchClause(),
          createMockConditionalExpression(),
        ],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 5)).toHaveLength(1)
      expect(analyzeComplexity(sf, 6)).toHaveLength(0)
    })

    test('threshold 8: function with 8 control flow nodes', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [
          createMockIfStatement(),
          createMockIfStatement(),
          createMockIfStatement(),
          createMockIfStatement(),
          createMockForStatement(),
          createMockWhileStatement(),
          createMockCatchClause(),
          createMockConditionalExpression(),
        ],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 8)).toHaveLength(1)
      expect(analyzeComplexity(sf, 9)).toHaveLength(0)
    })

    test('threshold 15: function with many nodes below threshold', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: Array.from({ length: 10 }, () => createMockIfStatement()),
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 15)).toHaveLength(0)
    })

    test('threshold 20: very complex function still below', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [
          ...Array.from({ length: 8 }, () => createMockIfStatement()),
          createMockForStatement(),
          createMockForInStatement(),
          createMockForOfStatement(),
          createMockWhileStatement(),
          createMockDoStatement(),
          createMockCatchClause(),
          createMockConditionalExpression(),
          createMockCaseClause(),
          createMockCaseClause(),
          createMockCaseClause(),
        ],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 20)).toHaveLength(0)
    })
  })

  describe('additional coverage - multiple violations', () => {
    test('arrow and function declaration both violate', () => {
      const arrow = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'arrowFn',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const func = createMockFunctionDeclaration({
        functionName: 'regularFn',
        children: [createMockForStatement(), createMockWhileStatement()],
      })
      const sf = createTestSourceFile([arrow, func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('constructor and method both violate', () => {
      const ctor = createMockConstructorDeclaration({
        parentClassName: 'Svc',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const method = createMockMethodDeclaration({
        methodName: 'run',
        parentClassName: 'Svc',
        children: [createMockForStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([ctor, method])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('three functions only two violate', () => {
      const f1 = createMockFunctionDeclaration({
        functionName: 'safe',
        children: [],
      })
      const f2 = createMockFunctionDeclaration({
        functionName: 'violates1',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const f3 = createMockFunctionDeclaration({
        functionName: 'violates2',
        children: [createMockForStatement(), createMockWhileStatement()],
      })
      const sf = createTestSourceFile([f1, f2, f3])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
      expect(violations.every((v) => !v.message.includes('safe'))).toBe(true)
    })

    test('five functions all at threshold edge', () => {
      const funcs = Array.from({ length: 5 }, (_, i) =>
        createMockFunctionDeclaration({
          functionName: `fn${i}`,
          children: Array.from({ length: 11 }, () => createMockIfStatement()),
        }),
      )
      const sf = createTestSourceFile(funcs)
      const violations = analyzeComplexity(sf, 10)
      expect(violations).toHaveLength(5)
    })
  })

  describe('additional coverage - violation metadata', () => {
    test('violation for constructor includes correct range', () => {
      const ctor = createMockConstructorDeclaration({
        parentClassName: 'Config',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([ctor])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].range).toBeDefined()
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    test('violation for getter includes suggestion', () => {
      const getter = createMockGetAccessorDeclaration({
        accessorName: 'data',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([getter])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(1)
      expect(violations[0].suggestion).toBeDefined()
    })

    test('violation message format for complexity 3', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'myFunc',
        children: [createMockIfStatement(), createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 1)
      expect(violations[0].message).toContain('myFunc')
      expect(violations[0].message).toContain('3')
      expect(violations[0].message).toContain('1')
    })

    test('violation has filePath from source file', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 0)
      expect(violations[0].filePath).toBeDefined()
    })

    test('violation severity is warning', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 0)
      expect(violations[0].severity).toBe('warning')
    })

    test('violation ruleId is max-complexity', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'f',
        children: [createMockIfStatement()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 0)
      expect(violations[0].ruleId).toBe('max-complexity')
    })
  })

  describe('additional coverage - switch and case', () => {
    test('switch with 6 cases exceeds threshold 5', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'bigSwitch',
        children: Array.from({ length: 6 }, () => createMockCaseClause()),
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 5)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 7')
    })

    test('switch with default and 2 cases complexity 3', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'switchDefault',
        children: [createMockCaseClause(), createMockCaseClause(), createMockDefaultClause()],
      })
      const sf = createTestSourceFile([func])
      const violations = analyzeComplexity(sf, 2)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('complexity of 3')
    })

    test('only default clause has complexity 1', () => {
      const func = createMockFunctionDeclaration({
        functionName: 'onlyDefault',
        children: [createMockDefaultClause()],
      })
      const sf = createTestSourceFile([func])
      expect(analyzeComplexity(sf, 1)).toHaveLength(0)
      expect(analyzeComplexity(sf, 0)).toHaveLength(1)
    })
  })

  describe('additional coverage - nested functions', () => {
    test('outer function with if, inner arrow with for', () => {
      const innerArrow = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'inner',
        children: [createMockForStatement()],
      })
      const outerFunc = createMockFunctionDeclaration({
        functionName: 'outer',
        children: [createMockIfStatement(), innerArrow],
      })
      const sf = createTestSourceFile([outerFunc])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(2)
    })

    test('nested arrow functions each with different complexity', () => {
      const deepArrow = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'deep',
        children: [createMockIfStatement()],
      })
      const midArrow = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'mid',
        children: [createMockForStatement(), deepArrow],
      })
      const outerFunc = createMockFunctionDeclaration({
        functionName: 'outer',
        children: [createMockWhileStatement(), midArrow],
      })
      const sf = createTestSourceFile([outerFunc])
      const violations = analyzeComplexity(sf, 1)
      expect(violations).toHaveLength(3)
    })
  })
})
