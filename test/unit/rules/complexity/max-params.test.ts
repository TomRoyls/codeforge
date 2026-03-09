import { describe, test, expect, vi } from 'vitest'
import { maxParamsRule, analyzeMaxParams } from '../../../../src/rules/complexity/max-params'
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor'
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockArrowFunction,
  createMockMethodDeclaration,
  createMockConstructorDeclaration,
  createSourceFileWithChildren,
  SyntaxKind,
} from '../../../helpers/ast-helpers'
import type { SourceFile } from 'ts-morph'

function createMockVisitorContext(sourceFile: SourceFile): VisitorContext {
  return {
    sourceFile,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => sourceFile.getFilePath(),
  }
}

function createMockFunctionWithParams(
  paramCount: number,
  functionName: string = 'testFunc',
): FunctionLikeNode {
  const params = Array.from({ length: paramCount }, (_, i) => ({
    getText: () => `param${i}`,
    getKind: () => SyntaxKind.Identifier,
  }))

  const sourceFile = createMockSourceFile()
  const funcNode = createMockFunctionDeclaration({
    functionName,
    start: 0,
    end: paramCount * 10 + 20,
  })

  const nodeWithParams = {
    ...funcNode,
    getSourceFile: () => sourceFile,
    getParameters: () => params,
  }

  return nodeWithParams as unknown as FunctionLikeNode
}

function createMockFunctionWithParamsForAnalyze(
  paramCount: number,
  functionName: string = 'testFunc',
): FunctionLikeNode {
  return createMockFunctionWithParams(paramCount, functionName)
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

describe('maxParamsRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxParamsRule.meta.name).toBe('max-params')
    })

    test('has correct category', () => {
      expect(maxParamsRule.meta.category).toBe('complexity')
    })

    test('is recommended', () => {
      expect(maxParamsRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(maxParamsRule.meta.description).toContain('parameters')
    })
  })

  describe('defaultOptions', () => {
    test('has default max of 4', () => {
      expect(maxParamsRule.defaultOptions.max).toBe(4)
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = maxParamsRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = maxParamsRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for function with few params', () => {
      const funcNode = createMockFunctionWithParams(2)
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = maxParamsRule.create({ max: 4 })
      ruleInstance.visitor.visitFunction!(funcNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('parameter counting', () => {
  test('function with no params has no violations', () => {
    const funcNode = createMockFunctionWithParams(0)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with 1 param has no violations', () => {
    const funcNode = createMockFunctionWithParams(1)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with 4 params at limit has no violations', () => {
    const funcNode = createMockFunctionWithParams(4)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('function with 5 params over limit has violation', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('5 parameters')
  })

  test('function with many params has violation', () => {
    const funcNode = createMockFunctionWithParams(10)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('10 parameters')
  })
})

describe('threshold boundaries', () => {
  test('no violation when param count equals max', () => {
    const funcNode = createMockFunctionWithParams(3)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('violation when param count exceeds max by 1', () => {
    const funcNode = createMockFunctionWithParams(4)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 3 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('handles max of 0', () => {
    const funcNode = createMockFunctionWithParams(1)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 0 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('handles max of 1', () => {
    const funcNode = createMockFunctionWithParams(2)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].ruleId).toBe('max-params')
  })

  test('violation includes warning severity', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes function name in message', () => {
    const funcNode = createMockFunctionWithParams(5, 'myFunction')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].message).toContain("Function 'myFunction'")
  })

  test('violation includes suggestion', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('options object')
  })

  test('violation includes range', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })
})

describe('analyzeMaxParams', () => {
  test('returns empty array for file with no violations', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(2)
    const sourceFile = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }

    const violations = analyzeMaxParams(sourceFile as unknown as SourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('returns violations for functions with too many params', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5)
    const sourceFile = createMockSourceFile()

    const wrappedSourceFile = {
      ...sourceFile,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }

    const violations = analyzeMaxParams(wrappedSourceFile as unknown as SourceFile, 4)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('max-params')
  })

  test('uses default max of 4 when not specified', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(2)
    const sourceFile = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }

    const violations = analyzeMaxParams(sourceFile as unknown as SourceFile)
    expect(violations).toHaveLength(0)
  })

  test('handles multiple functions', () => {
    const simpleFunc = createMockFunctionWithParamsForAnalyze(2, 'simpleFunc')
    const complexFunc = createMockFunctionWithParamsForAnalyze(6, 'complexFunc')
    const sourceFile = createMockSourceFile()

    const wrappedSourceFile = {
      ...sourceFile,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(simpleFunc)
        cb(complexFunc)
      },
    }

    const violations = analyzeMaxParams(wrappedSourceFile as unknown as SourceFile, 4)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('complexFunc')
  })
})

describe('custom options', () => {
  test('uses custom max value from options', () => {
    const funcNode = createMockFunctionWithParams(2)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 1 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('uses default max when not provided', () => {
    const funcNode = createMockFunctionWithParams(4)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })
})

describe('edge cases', () => {
  test('handles arrow function', () => {
    const params = [{ getText: () => 'x', getKind: () => SyntaxKind.Identifier }]
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'arrowFn' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles method declaration', () => {
    const params = [{ getText: () => 'x', getKind: () => SyntaxKind.Identifier }]
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'doSomething' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles constructor declaration', () => {
    const params = [{ getText: () => 'x', getKind: () => SyntaxKind.Identifier }]
    const constructorNode = {
      ...createMockConstructorDeclaration({ parentClassName: 'MyClass' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(constructorNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('handles function with very high param count', () => {
    const funcNode = createMockFunctionWithParams(20)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = maxParamsRule.create({ max: 4 })
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('20 parameters')
  })
})
