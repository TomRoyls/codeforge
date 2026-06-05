import { describe, test, expect, vi } from 'vitest'
import { maxDepthRule, analyzeDepth } from '../../../../src/rules/complexity/max-depth'
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
  createMockSwitchStatement,
  createMockCatchClause,
  createMockNode,
  createSourceFileWithChildren,
  createDeeplyNestedNodes,
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

describe('maxDepthRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxDepthRule.meta.name).toBe('max-depth')
    })

    test('has correct category', () => {
      expect(maxDepthRule.meta.category).toBe('complexity')
    })

    test('is recommended', () => {
      expect(maxDepthRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(maxDepthRule.meta.description).toContain('nesting depth')
    })
  })

  describe('defaultOptions', () => {
    test('has default max of 4', () => {
      expect(maxDepthRule.defaultOptions.max).toBe(4)
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = maxDepthRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = maxDepthRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for shallow function', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'shallowFunc' })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxDepthRule.create({ max: 4 })
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('nesting depth calculation', () => {
  test('function with if statement increases depth', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with for loop increases depth', () => {
    const forNode = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with while loop increases depth', () => {
    const whileNode = createMockWhileStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithWhile',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with switch statement increases depth', () => {
    const switchNode = createMockSwitchStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithSwitch',
      children: [switchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with catch clause increases depth', () => {
    const catchNode = createMockCatchClause()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithCatch',
      children: [catchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('function with if-statement increases depth', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested structures accumulate depth', () => {
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedFunc',
      children: [outerIf],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('deeply nested structures reach high depth', () => {
    let currentNode: Node = createMockIfStatement()
    for (let i = 0; i < 4; i++) {
      currentNode = createMockIfStatement({ children: [currentNode] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'deeplyNested',
      children: [currentNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 5')
  })
})

describe('threshold boundaries', () => {
  test('no violation when depth equals max', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcAtLimit',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('violation when depth exceeds max by 1', () => {
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcOverLimit',
      children: [outerIf],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('handles very large depth values', () => {
    let currentNode: Node = createMockIfStatement()
    for (let i = 0; i < 9; i++) {
      currentNode = createMockIfStatement({ children: [currentNode] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'veryDeepFunc',
      children: [currentNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 10')
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-depth')
  })

  test('violation includes warning severity', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes function name in message', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'myFunction',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain("Function 'myFunction'")
  })

  test('violation includes suggestion', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('separate functions')
  })

  test('violation includes range', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })
})

describe('analyzeDepth', () => {
  test('returns empty array for file with no violations', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('returns violations for deeply nested functions', () => {
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedFunc',
      children: [outerIf],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('max-depth')
  })

  test('uses default max of 4 when not specified', () => {
    let currentNode: Node = createMockIfStatement()
    for (let i = 0; i < 4; i++) {
      currentNode = createMockIfStatement({ children: [currentNode] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'deepFunc',
      children: [currentNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile)
    expect(violations).toHaveLength(1)
  })

  test('handles multiple functions with varying depths', () => {
    const shallowFunc = createMockFunctionDeclaration({ functionName: 'shallowFunc' })
    const innerIf = createMockIfStatement()
    const outerIf = createMockIfStatement({ children: [innerIf] })
    const deepFunc = createMockFunctionDeclaration({
      functionName: 'deepFunc',
      children: [outerIf],
    })
    const sourceFile = createSourceFileWithChildren([
      shallowFunc,
      deepFunc,
    ]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('deepFunc')
  })
})

describe('custom options', () => {
  test('uses custom max value from options', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('uses default max when not provided', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({})
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
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles arrow function', () => {
    const arrowNode = createMockArrowFunction({ parentIsVariable: true, variableName: 'arrowFn' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles method declaration', () => {
    const methodNode = createMockMethodDeclaration({ methodName: 'doSomething' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles mixed nesting constructs', () => {
    const innerWhile = createMockWhileStatement()
    const forNode = createMockForStatement({ children: [innerWhile] })
    const ifNode = createMockIfStatement({ children: [forNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mixedNesting',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })
})

describe('meta expanded', () => {
  test('meta has fixable set to code', () => {
    expect(maxDepthRule.meta.fixable).toBe('code')
  })

  test('meta description is a non-empty string', () => {
    expect(typeof maxDepthRule.meta.description).toBe('string')
    expect(maxDepthRule.meta.description.length).toBeGreaterThan(0)
  })

  test('meta name is a string', () => {
    expect(typeof maxDepthRule.meta.name).toBe('string')
  })

  test('meta category is a string', () => {
    expect(typeof maxDepthRule.meta.category).toBe('string')
  })

  test('meta recommended is boolean', () => {
    expect(typeof maxDepthRule.meta.recommended).toBe('boolean')
  })

  test('defaultOptions is an object', () => {
    expect(typeof maxDepthRule.defaultOptions).toBe('object')
  })

  test('defaultOptions has only max property', () => {
    expect(Object.keys(maxDepthRule.defaultOptions)).toContain('max')
  })

  test('create is a function', () => {
    expect(typeof maxDepthRule.create).toBe('function')
  })
})

describe('create function', () => {
  test('visitor has only visitFunction method', () => {
    const ruleInstance = maxDepthRule.create({})
    expect(Object.keys(ruleInstance.visitor)).toContain('visitFunction')
  })

  test('onComplete returns array', () => {
    const ruleInstance = maxDepthRule.create({})
    const result = ruleInstance.onComplete!()
    expect(Array.isArray(result)).toBe(true)
  })

  test('create with empty options uses default max 4', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('create with undefined max uses default', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: undefined })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('multiple visitFunction calls accumulate violations', () => {
    const funcNode1 = createMockFunctionDeclaration({
      functionName: 'func1',
      children: [createMockIfStatement()],
    })
    const funcNode2 = createMockFunctionDeclaration({
      functionName: 'func2',
      children: [createMockIfStatement()],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode1 as unknown as FunctionLikeNode, context)
    ruleInstance.visitor.visitFunction!(funcNode2 as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(2)
  })

  test('create returns new instance each time', () => {
    const instance1 = maxDepthRule.create({})
    const instance2 = maxDepthRule.create({})
    expect(instance1).not.toBe(instance2)
  })

  test('each instance has independent violations', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'testFunc',
      children: [createMockIfStatement()],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance1 = maxDepthRule.create({ max: 0 })
    const instance2 = maxDepthRule.create({ max: 4 })
    instance1.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    instance2.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance1.onComplete!()).toHaveLength(1)
    expect(instance2.onComplete!()).toHaveLength(0)
  })
})

describe('if statement nesting', () => {
  test('single if statement at depth 1', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('two levels of nested if', () => {
    const inner = createMockIfStatement()
    const outer = createMockIfStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'twoIf',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('three levels of nested if', () => {
    const inner = createMockIfStatement()
    const mid = createMockIfStatement({ children: [inner] })
    const outer = createMockIfStatement({ children: [mid] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'threeIf',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('four levels of nested if', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const d = createMockIfStatement({ children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'fourIf',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 4')
  })

  test('five levels of nested if', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const d = createMockIfStatement({ children: [c] })
    const e = createMockIfStatement({ children: [d] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'fiveIf',
      children: [e],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 5')
  })

  test('six levels of nested if', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const d = createMockIfStatement({ children: [c] })
    const e = createMockIfStatement({ children: [d] })
    const f = createMockIfStatement({ children: [e] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'sixIf',
      children: [f],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 5 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 6')
  })

  test('sibling if statements do not accumulate depth', () => {
    const if1 = createMockIfStatement()
    const if2 = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingIfs',
      children: [if1, if2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('if statement with non-nesting child does not increase depth', () => {
    const identifier = createMockNode({ kind: SyntaxKind.Identifier })
    const ifNode = createMockIfStatement({ children: [identifier] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'ifWithIdentifier',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('three sibling if statements at depth 1 with max 0 produces one violation', () => {
    const if1 = createMockIfStatement()
    const if2 = createMockIfStatement()
    const if3 = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'threeSiblings',
      children: [if1, if2, if3],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('deeply nested if using createDeeplyNestedNodes helper', () => {
    const nested = createDeeplyNestedNodes(7)
    const funcNode = createMockFunctionDeclaration({
      functionName: 'helperNested',
      children: [nested],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 7')
  })
})

describe('for loop nesting', () => {
  test('single for loop at depth 1', () => {
    const forNode = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested for loops depth 2', () => {
    const inner = createMockForStatement()
    const outer = createMockForStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedFor',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('three nested for loops', () => {
    const a = createMockForStatement()
    const b = createMockForStatement({ children: [a] })
    const c = createMockForStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'tripleFor',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('sibling for loops do not accumulate', () => {
    const for1 = createMockForStatement()
    const for2 = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingFors',
      children: [for1, for2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('for loop with non-nesting child', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const forNode = createMockForStatement({ children: [ident] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forWithIdent',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('for-in nesting', () => {
  test('single for-in at depth 1', () => {
    const forInNode = createMockForInStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleForIn',
      children: [forInNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested for-in depth 2', () => {
    const inner = createMockForInStatement()
    const outer = createMockForInStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedForIn',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('three nested for-in loops', () => {
    const a = createMockForInStatement()
    const b = createMockForInStatement({ children: [a] })
    const c = createMockForInStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'tripleForIn',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })
})

describe('for-of nesting', () => {
  test('single for-of at depth 1', () => {
    const forOfNode = createMockForOfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleForOf',
      children: [forOfNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested for-of depth 2', () => {
    const inner = createMockForOfStatement()
    const outer = createMockForOfStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedForOf',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('for-of with sibling does not accumulate', () => {
    const forOf1 = createMockForOfStatement()
    const forOf2 = createMockForOfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingForOf',
      children: [forOf1, forOf2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('while loop nesting', () => {
  test('single while at depth 1', () => {
    const whileNode = createMockWhileStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleWhile',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested while depth 2', () => {
    const inner = createMockWhileStatement()
    const outer = createMockWhileStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedWhile',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('three nested while loops', () => {
    const a = createMockWhileStatement()
    const b = createMockWhileStatement({ children: [a] })
    const c = createMockWhileStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'tripleWhile',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('sibling while loops do not accumulate', () => {
    const w1 = createMockWhileStatement()
    const w2 = createMockWhileStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingWhile',
      children: [w1, w2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('do-while nesting', () => {
  test('single do-while at depth 1', () => {
    const doNode = createMockDoStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleDo',
      children: [doNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested do-while depth 2', () => {
    const inner = createMockDoStatement()
    const outer = createMockDoStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedDo',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('three nested do-while loops', () => {
    const a = createMockDoStatement()
    const b = createMockDoStatement({ children: [a] })
    const c = createMockDoStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'tripleDo',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('do-while with non-nesting child at depth 1', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const doNode = createMockDoStatement({ children: [ident] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'doWithIdent',
      children: [doNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('switch statement nesting', () => {
  test('single switch at depth 1', () => {
    const switchNode = createMockSwitchStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleSwitch',
      children: [switchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested switch depth 2', () => {
    const inner = createMockSwitchStatement()
    const outer = createMockSwitchStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedSwitch',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('sibling switch statements do not accumulate', () => {
    const s1 = createMockSwitchStatement()
    const s2 = createMockSwitchStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingSwitch',
      children: [s1, s2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('switch with non-nesting child', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const switchNode = createMockSwitchStatement({ children: [ident] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'switchWithIdent',
      children: [switchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('try/catch nesting', () => {
  test('try statement increases depth', () => {
    const tryNode = createMockNode({ kind: SyntaxKind.Block })
    const tryStatement = createMockNode({ kind: 254, children: [tryNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithTry',
      children: [tryStatement],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('catch clause inside try increases depth further', () => {
    const catchNode = createMockCatchClause()
    const tryStatement = createMockNode({ kind: 254, children: [catchNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'tryCatch',
      children: [tryStatement],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('nested try statements', () => {
    const innerTry = createMockNode({ kind: 254 })
    const outerTry = createMockNode({ kind: 254, children: [innerTry] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedTry',
      children: [outerTry],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('catch clause alone increases depth', () => {
    const catchNode = createMockCatchClause()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'catchAlone',
      children: [catchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('nested catch clauses', () => {
    const innerCatch = createMockCatchClause()
    const outerCatch = createMockCatchClause({ children: [innerCatch] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedCatch',
      children: [outerCatch],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })
})

describe('if-statement nesting (was block nesting)', () => {
  test('single if-statement at depth 1', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 1')
  })

  test('nested if-statements depth 2', () => {
    const inner = createMockIfStatement()
    const outer = createMockIfStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedIfs',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('three nested if-statements', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'tripleIfs',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('sibling if-statements do not accumulate', () => {
    const b1 = createMockIfStatement()
    const b2 = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'siblingIfs',
      children: [b1, b2],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('mixed construct nesting', () => {
  test('if inside for loop', () => {
    const ifNode = createMockIfStatement()
    const forNode = createMockForStatement({ children: [ifNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'ifInFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('for inside if statement', () => {
    const forNode = createMockForStatement()
    const ifNode = createMockIfStatement({ children: [forNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forInIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('while inside for loop', () => {
    const whileNode = createMockWhileStatement()
    const forNode = createMockForStatement({ children: [whileNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'whileInFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('switch inside while loop', () => {
    const switchNode = createMockSwitchStatement()
    const whileNode = createMockWhileStatement({ children: [switchNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'switchInWhile',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('if + for + while chain', () => {
    const whileNode = createMockWhileStatement()
    const forNode = createMockForStatement({ children: [whileNode] })
    const ifNode = createMockIfStatement({ children: [forNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'ifForWhile',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('for-in inside if', () => {
    const forInNode = createMockForInStatement()
    const ifNode = createMockIfStatement({ children: [forInNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forInIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('for-of inside while', () => {
    const forOfNode = createMockForOfStatement()
    const whileNode = createMockWhileStatement({ children: [forOfNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forOfWhile',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('do-while inside for', () => {
    const doNode = createMockDoStatement()
    const forNode = createMockForStatement({ children: [doNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'doInFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('catch inside if inside for', () => {
    const catchNode = createMockCatchClause()
    const ifNode = createMockIfStatement({ children: [catchNode] })
    const forNode = createMockForStatement({ children: [ifNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'catchIfFor',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('if + for + while deep chain', () => {
    const whileNode = createMockWhileStatement()
    const forNode = createMockForStatement({ children: [whileNode] })
    const outerIfNode = createMockIfStatement({ children: [forNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'ifForWhile',
      children: [outerIfNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('switch inside for-of inside if', () => {
    const switchNode = createMockSwitchStatement()
    const forOfNode = createMockForOfStatement({ children: [switchNode] })
    const ifNode = createMockIfStatement({ children: [forOfNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'switchForOfIf',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })
})

describe('depth exactly at max', () => {
  test('depth 1 with max 1 is NOT flagged', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactOne',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('depth 2 with max 2 is NOT flagged', () => {
    const inner = createMockIfStatement()
    const outer = createMockIfStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactTwo',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('depth 3 with max 3 is NOT flagged', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactThree',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('depth 4 with max 4 is NOT flagged', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const d = createMockIfStatement({ children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactFour',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('depth 5 with max 5 is NOT flagged', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 4; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'exactFive',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 5 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('depth one over max', () => {
  test('depth 2 with max 1 IS flagged', () => {
    const inner = createMockIfStatement()
    const outer = createMockIfStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne2v1',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('depth 3 with max 2 IS flagged', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne3v2',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('depth 4 with max 3 IS flagged', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const d = createMockIfStatement({ children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne4v3',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('depth 5 with max 4 IS flagged', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const d = createMockIfStatement({ children: [c] })
    const e = createMockIfStatement({ children: [d] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne5v4',
      children: [e],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('depth 6 with max 5 IS flagged', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 5; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'overByOne6v5',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 5 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })
})

describe('custom max option', () => {
  test('max=2 flags depth 3', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxTwo',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 2')
  })

  test('max=2 allows depth 2', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxTwoOk',
      children: [b],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=3 flags depth 4', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const d = createMockIfStatement({ children: [c] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxThree',
      children: [d],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 3')
  })

  test('max=3 allows depth 3', () => {
    const a = createMockIfStatement()
    const b = createMockIfStatement({ children: [a] })
    const c = createMockIfStatement({ children: [b] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxThreeOk',
      children: [c],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=6 allows depth 6', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 5; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxSixOk',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 6 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=6 flags depth 7', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 6; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxSixOver',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 6 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('max=10 allows deep nesting', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 9; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxTenOk',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 10 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('max=10 flags depth 11', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 10; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxTenOver',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 10 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 11')
  })

  test('max=0 flags even single nesting construct', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxZero',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 0')
  })

  test('max=0 allows function with no nesting', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxZeroOk',
      children: [],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('not flagged: flat functions', () => {
  test('function with only identifiers', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyIdent',
      children: [ident],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
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
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with conditional expression (ternary)', () => {
    const cond = createMockNode({ kind: SyntaxKind.ConditionalExpression })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyTernary',
      children: [cond],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with variable declarations only', () => {
    const varDecl = createMockNode({ kind: SyntaxKind.VariableDeclaration })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'onlyVarDecl',
      children: [varDecl],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
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
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('violation properties', () => {
  test('violation has correct ruleId for different constructs', () => {
    const forNode = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'ruleIdTest',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-depth')
  })

  test('violation severity is always warning', () => {
    const whileNode = createMockWhileStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'severityTest',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation message includes actual depth', () => {
    const inner = createMockIfStatement()
    const outer = createMockIfStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'depthMsg',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('violation message includes max allowed', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxMsg',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('Maximum allowed is 0')
  })

  test('violation includes file path', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'filePathTest',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].filePath).toBeDefined()
  })

  test('violation suggestion mentions extracting', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'sugTest',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toContain('Extract')
  })

  test('violation range has start and end', () => {
    const switchNode = createMockSwitchStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'rangeTest',
      children: [switchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('violation message format for function name', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mySpecificFunction',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toMatch(/Function 'mySpecificFunction'/)
  })

  test('violation message format includes both depth and max', () => {
    const inner = createMockForStatement()
    const outer = createMockForStatement({ children: [inner] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'formatTest',
      children: [outer],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    const msg = violations[0].message
    expect(msg).toContain('nesting depth of 2')
    expect(msg).toContain('Maximum allowed is 1')
  })
})

describe('analyzeDepth standalone', () => {
  test('returns empty for flat function', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'flatFn' })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('detects violation with for loop', () => {
    const forNode = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forFn',
      children: [forNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('forFn')
  })

  test('detects violation with while loop', () => {
    const whileNode = createMockWhileStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'whileFn',
      children: [whileNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('detects violation with switch', () => {
    const switchNode = createMockSwitchStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'switchFn',
      children: [switchNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('detects violation with do-while', () => {
    const doNode = createMockDoStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'doFn',
      children: [doNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('detects violation with for-in', () => {
    const forInNode = createMockForInStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forInFn',
      children: [forInNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('detects violation with for-of', () => {
    const forOfNode = createMockForOfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forOfFn',
      children: [forOfNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('no violation for depth at max', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'atMax',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(0)
  })

  test('uses default max of 4', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 4; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'defaultMax',
      children: [node],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 4')
  })

  test('violation has correct properties', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'propsFn',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations[0].ruleId).toBe('max-depth')
    expect(violations[0].severity).toBe('warning')
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].range).toBeDefined()
  })
})

describe('multiple functions', () => {
  test('two shallow functions produce no violations', () => {
    const func1 = createMockFunctionDeclaration({ functionName: 'fn1' })
    const func2 = createMockFunctionDeclaration({ functionName: 'fn2' })
    const sourceFile = createSourceFileWithChildren([func1, func2]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('one deep and one shallow function produces one violation', () => {
    const shallow = createMockFunctionDeclaration({ functionName: 'shallow' })
    const inner = createMockIfStatement()
    const outer = createMockIfStatement({ children: [inner] })
    const deep = createMockFunctionDeclaration({
      functionName: 'deep',
      children: [outer],
    })
    const sourceFile = createSourceFileWithChildren([shallow, deep]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('deep')
  })

  test('three functions all deep produce three violations', () => {
    const makeDeep = (name: string) => {
      const a = createMockIfStatement()
      const b = createMockIfStatement({ children: [a] })
      return createMockFunctionDeclaration({ functionName: name, children: [b] })
    }
    const fn1 = makeDeep('fn1')
    const fn2 = makeDeep('fn2')
    const fn3 = makeDeep('fn3')
    const sourceFile = createSourceFileWithChildren([fn1, fn2, fn3]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(3)
  })

  test('multiple visitFunction calls in rule instance', () => {
    const func1 = createMockFunctionDeclaration({
      functionName: 'fn1',
      children: [createMockIfStatement()],
    })
    const func2 = createMockFunctionDeclaration({
      functionName: 'fn2',
      children: [createMockIfStatement({ children: [createMockIfStatement()] })],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(func1 as unknown as FunctionLikeNode, context)
    ruleInstance.visitor.visitFunction!(func2 as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('fn2')
  })

  test('analyzeDepth with no functions returns empty', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const sourceFile = createSourceFileWithChildren([ident]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })
})

describe('function types', () => {
  test('arrow function with nesting is flagged', () => {
    const ifNode = createMockIfStatement()
    const arrowNode = createMockArrowFunction({
      parentIsVariable: true,
      variableName: 'arrowFn',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('method declaration with nesting is flagged', () => {
    const ifNode = createMockIfStatement()
    const methodNode = createMockMethodDeclaration({
      methodName: 'myMethod',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('function expression with nesting is flagged', () => {
    const ifNode = createMockIfStatement()
    const exprNode = createMockFunctionExpression({
      functionName: 'myExpr',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(exprNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('constructor declaration with nesting is flagged', () => {
    const ifNode = createMockIfStatement()
    const ctorNode = createMockConstructorDeclaration({
      parentClassName: 'MyClass',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(ctorNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('get accessor with nesting is flagged', () => {
    const ifNode = createMockIfStatement()
    const getterNode = createMockGetAccessorDeclaration({
      accessorName: 'value',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(getterNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('set accessor with nesting is flagged', () => {
    const ifNode = createMockIfStatement()
    const setterNode = createMockSetAccessorDeclaration({
      accessorName: 'value',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(setterNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('arrow function without nesting is not flagged', () => {
    const arrowNode = createMockArrowFunction({
      parentIsVariable: true,
      variableName: 'flatArrow',
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('method declaration without nesting is not flagged', () => {
    const methodNode = createMockMethodDeclaration({ methodName: 'flatMethod' })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('edge cases', () => {
  test('function with single non-nesting node', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier, text: 'x' })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'singleIdent',
      children: [ident],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with many sibling non-nesting nodes', () => {
    const children = Array.from({ length: 10 }, () =>
      createMockNode({ kind: SyntaxKind.Identifier }),
    )
    const funcNode = createMockFunctionDeclaration({
      functionName: 'manySiblings',
      children,
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with mixed nesting and non-nesting siblings', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const ifNode = createMockIfStatement()
    const binary = createMockNode({ kind: SyntaxKind.BinaryExpression })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'mixedSiblings',
      children: [ident, ifNode, binary],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('very deep nesting with depth 20', () => {
    let node: Node = createMockIfStatement()
    for (let i = 0; i < 19; i++) {
      node = createMockIfStatement({ children: [node] })
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'depth20',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 20')
  })

  test('nesting construct with only non-nesting children', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const cond = createMockNode({ kind: SyntaxKind.ConditionalExpression })
    const ifNode = createMockIfStatement({ children: [ident, cond] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nonNestingChildren',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('branching tree picks maximum depth', () => {
    const deepBranch = createMockIfStatement({ children: [createMockIfStatement()] })
    const shallowBranch = createMockNode({ kind: SyntaxKind.Identifier })
    const root = createMockIfStatement({ children: [deepBranch, shallowBranch] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'branchingTree',
      children: [root],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('node with children but no nesting constructs', () => {
    const child1 = createMockNode({ kind: SyntaxKind.Identifier })
    const child2 = createMockNode({ kind: SyntaxKind.BinaryExpression })
    const parent = createMockNode({
      kind: SyntaxKind.ConditionalExpression,
      children: [child1, child2],
    })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'noNestingChildren',
      children: [parent],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('createDeeplyNestedNodes with depth 0 returns identifier', () => {
    const node = createDeeplyNestedNodes(0)
    expect(node.getKind()).toBe(SyntaxKind.Identifier)
  })

  test('createDeeplyNestedNodes with depth 1 returns if statement', () => {
    const node = createDeeplyNestedNodes(1)
    expect(node.getKind()).toBe(SyntaxKind.IfStatement)
  })

  test('createDeeplyNestedNodes produces correct depth', () => {
    const node = createDeeplyNestedNodes(3)
    const funcNode = createMockFunctionDeclaration({
      functionName: 'helperDepth3',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 2 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 3')
  })

  test('onComplete can be called multiple times', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'multiComplete',
      children: [createMockIfStatement()],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const first = ruleInstance.onComplete!()
    const second = ruleInstance.onComplete!()
    expect(first).toEqual(second)
  })
})

describe('analyzeDepth additional coverage', () => {
  test('analyzes arrow function in source file', () => {
    const ifNode = createMockIfStatement()
    const arrowNode = createMockArrowFunction({
      parentIsVariable: true,
      variableName: 'deepArrow',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([arrowNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('analyzes method declaration in source file', () => {
    const ifNode = createMockIfStatement()
    const methodNode = createMockMethodDeclaration({
      methodName: 'deepMethod',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([methodNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('analyzes function expression in source file', () => {
    const ifNode = createMockIfStatement()
    const exprNode = createMockFunctionExpression({
      functionName: 'deepExpr',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([exprNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('custom maxDepth parameter overrides default', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'customMax',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 0')
  })

  test('returns empty for source file with only identifiers', () => {
    const ident = createMockNode({ kind: SyntaxKind.Identifier })
    const sourceFile = createSourceFileWithChildren([ident]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('mixed shallow and deep functions in analyzeDepth', () => {
    const flat = createMockFunctionDeclaration({ functionName: 'flat' })
    const nested = createMockIfStatement({ children: [createMockIfStatement()] })
    const deep = createMockFunctionDeclaration({
      functionName: 'deep',
      children: [nested],
    })
    const sourceFile = createSourceFileWithChildren([flat, deep]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 1)
    expect(violations).toHaveLength(1)
  })

  test('violation filePath from analyzeDepth matches sourceFile', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'pathTest',
      children: [ifNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations[0].filePath).toBe('/test/file.ts')
  })

  test('analyzeDepth with for-in loop', () => {
    const forInNode = createMockForInStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forInAnalyze',
      children: [forInNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('analyzeDepth with for-of loop', () => {
    const forOfNode = createMockForOfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forOfAnalyze',
      children: [forOfNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })

  test('analyzeDepth with do-while loop', () => {
    const doNode = createMockDoStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'doAnalyze',
      children: [doNode],
    })
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile
    const violations = analyzeDepth(sourceFile, 0)
    expect(violations).toHaveLength(1)
  })
})

describe('violation message format details', () => {
  test('message contains Function prefix', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'msgTest1',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('Function ')
  })

  test('message contains has a nesting depth of', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'msgTest2',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('has a nesting depth of')
  })

  test('message contains Maximum allowed is', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'msgTest3',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('Maximum allowed is')
  })

  test('suggestion mentions readability', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'sugRead',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toContain('readability')
  })

  test('violation ruleId is always max-depth regardless of construct', () => {
    const forNode = createMockForStatement({ children: [createMockWhileStatement()] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'ruleIdConsistent',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-depth')
  })

  test('range has start and end objects', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'rangeNum',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(typeof violations[0].range.start).toBe('object')
    expect(typeof violations[0].range.end).toBe('object')
  })

  test('deeply nested for-in + for-of produces correct depth message', () => {
    const forOf = createMockForOfStatement()
    const forIn = createMockForInStatement({ children: [forOf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forInOfMsg',
      children: [forIn],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('violation has filePath property', () => {
    const ifNode = createMockIfStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'fpTest',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].filePath).toBeDefined()
    expect(typeof violations[0].filePath).toBe('string')
  })

  test('nested do-while inside switch message', () => {
    const doNode = createMockDoStatement()
    const switchNode = createMockSwitchStatement({ children: [doNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'doSwitchMsg',
      children: [switchNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain('nesting depth of 2')
    expect(violations[0].message).toContain('Maximum allowed is 1')
  })

  test('violation severity is warning for all constructs', () => {
    const constructs = [
      createMockIfStatement(),
      createMockForStatement(),
      createMockWhileStatement(),
      createMockDoStatement(),
      createMockSwitchStatement(),
      createMockCatchClause(),
    ]
    for (const construct of constructs) {
      const funcNode = createMockFunctionDeclaration({
        functionName: 'sevTest',
        children: [construct],
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxDepthRule.create({ max: 0 })
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations[0].severity).toBe('warning')
    }
  })
})

describe('additional edge cases', () => {
  test('function with for-in containing for-of', () => {
    const forOf = createMockForOfStatement()
    const forIn = createMockForInStatement({ children: [forOf] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forInForOf',
      children: [forIn],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 2')
  })

  test('function with for-of containing for-in', () => {
    const forIn = createMockForInStatement()
    const forOf = createMockForOfStatement({ children: [forIn] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'forOfForIn',
      children: [forOf],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('function with while containing do-while', () => {
    const doNode = createMockDoStatement()
    const whileNode = createMockWhileStatement({ children: [doNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'whileDo',
      children: [whileNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('function with do-while containing while', () => {
    const whileNode = createMockWhileStatement()
    const doNode = createMockDoStatement({ children: [whileNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'doWhile',
      children: [doNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('four level chain: if > for > while > switch', () => {
    const switchNode = createMockSwitchStatement()
    const whileNode = createMockWhileStatement({ children: [switchNode] })
    const forNode = createMockForStatement({ children: [whileNode] })
    const ifNode = createMockIfStatement({ children: [forNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'fourChain',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 4')
  })

  test('max=1 with single nesting construct is allowed', () => {
    const forNode = createMockForStatement()
    const funcNode = createMockFunctionDeclaration({
      functionName: 'maxOneOk',
      children: [forNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('five level mixed chain depth message', () => {
    const innerIf = createMockIfStatement()
    const catchNode = createMockCatchClause({ children: [innerIf] })
    const whileNode = createMockWhileStatement({ children: [catchNode] })
    const forNode = createMockForStatement({ children: [whileNode] })
    const ifNode = createMockIfStatement({ children: [forNode] })
    const funcNode = createMockFunctionDeclaration({
      functionName: 'fiveChain',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 5')
  })

  test('class declaration mock helper works', () => {
    const classNode = createMockClassDeclaration({ className: 'MyClass' })
    expect(classNode.getName()).toBe('MyClass')
  })

  test('function expression without name does not crash', () => {
    const exprNode = createMockFunctionExpression({})
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(exprNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('constructor without parent class does not crash', () => {
    const ctorNode = createMockConstructorDeclaration({})
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(ctorNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('method with parent class name produces violation', () => {
    const ifNode = createMockIfStatement()
    const methodNode = createMockMethodDeclaration({
      methodName: 'deepMethod',
      parentClassName: 'MyClass',
      children: [ifNode],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('arrow without parent variable is not flagged when shallow', () => {
    const arrowNode = createMockArrowFunction({ parentIsVariable: false })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('deeply nested using createDeeplyNestedNodes at depth 5', () => {
    const node = createDeeplyNestedNodes(5)
    const funcNode = createMockFunctionDeclaration({
      functionName: 'deep5',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('nesting depth of 5')
  })

  test('createDeeplyNestedNodes at depth 0 produces no violation', () => {
    const node = createDeeplyNestedNodes(0)
    const funcNode = createMockFunctionDeclaration({
      functionName: 'deep0',
      children: [node],
    })
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxDepthRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})
