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

describe('meta expanded', () => {
  test('meta has fixable property set to code', () => {
    expect(maxParamsRule.meta.fixable).toBe('code')
  })

  test('meta description mentions maximum', () => {
    expect(maxParamsRule.meta.description).toContain('maximum')
  })

  test('meta description mentions function', () => {
    expect(maxParamsRule.meta.description).toContain('function')
  })

  test('meta description mentions parameters', () => {
    expect(maxParamsRule.meta.description).toContain('parameters')
  })

  test('meta description is a non-empty string', () => {
    expect(typeof maxParamsRule.meta.description).toBe('string')
    expect(maxParamsRule.meta.description.length).toBeGreaterThan(0)
  })

  test('meta name is a non-empty string', () => {
    expect(typeof maxParamsRule.meta.name).toBe('string')
    expect(maxParamsRule.meta.name.length).toBeGreaterThan(0)
  })

  test('meta category is one of the valid categories', () => {
    expect(['complexity', 'dependencies', 'performance', 'security', 'patterns']).toContain(
      maxParamsRule.meta.category,
    )
  })

  test('meta recommended is a boolean', () => {
    expect(typeof maxParamsRule.meta.recommended).toBe('boolean')
  })
})

describe('create function structure', () => {
  test('create returns object with visitor property', () => {
    const instance = maxParamsRule.create({})
    expect(instance).toHaveProperty('visitor')
  })

  test('create returns object with onComplete property', () => {
    const instance = maxParamsRule.create({})
    expect(instance).toHaveProperty('onComplete')
  })

  test('visitor only has visitFunction method', () => {
    const instance = maxParamsRule.create({})
    expect(Object.keys(instance.visitor)).toContain('visitFunction')
  })

  test('onComplete returns empty array when no functions visited', () => {
    const instance = maxParamsRule.create({ max: 4 })
    const violations = instance.onComplete!()
    expect(violations).toEqual([])
  })

  test('multiple create calls produce independent instances', () => {
    const instance1 = maxParamsRule.create({ max: 4 })
    const instance2 = maxParamsRule.create({ max: 4 })
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    instance1.visitor.visitFunction!(funcNode, context)
    expect(instance1.onComplete!()).toHaveLength(1)
    expect(instance2.onComplete!()).toHaveLength(0)
  })

  test('create with undefined max uses default', () => {
    const instance = maxParamsRule.create({ max: undefined })
    const funcNode = createMockFunctionWithParams(4)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('visitFunction is callable', () => {
    const instance = maxParamsRule.create({ max: 4 })
    expect(typeof instance.visitor.visitFunction).toBe('function')
  })
})

describe('functions with exactly max params (default max=4)', () => {
  test('function declaration with 4 params is not flagged', () => {
    const funcNode = createMockFunctionWithParams(4, 'fn4')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function declaration with 4 params and custom name is not flagged', () => {
    const funcNode = createMockFunctionWithParams(4, 'processData')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('arrow function with 4 params is not flagged', () => {
    const params = Array.from({ length: 4 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'arrow4' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('method with 4 params is not flagged', () => {
    const params = Array.from({ length: 4 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'handle', parentClassName: 'Svc' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('constructor with 4 params is not flagged', () => {
    const params = Array.from({ length: 4 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const constructorNode = {
      ...createMockConstructorDeclaration({ parentClassName: 'MyClass' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(constructorNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with 4 params at max=2 IS flagged', () => {
    const funcNode = createMockFunctionWithParams(4, 'overMax')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('functions with max-1 params (default max=4, 3 params)', () => {
  test('function with 3 params is not flagged at default max', () => {
    const funcNode = createMockFunctionWithParams(3, 'fn3')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('arrow function with 3 params is not flagged at default max', () => {
    const params = Array.from({ length: 3 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'arrow3' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('method with 3 params is not flagged at default max', () => {
    const params = Array.from({ length: 3 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'compute' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('constructor with 3 params is not flagged at default max', () => {
    const params = Array.from({ length: 3 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const constructorNode = {
      ...createMockConstructorDeclaration({ parentClassName: 'Widget' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(constructorNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with 2 params is not flagged at default max', () => {
    const funcNode = createMockFunctionWithParams(2, 'fn2')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with 3 params at max=2 IS flagged', () => {
    const funcNode = createMockFunctionWithParams(3, 'fn3strict')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('functions with max+1 params (default max=4, 5 params)', () => {
  test('function with 5 params is flagged at default max', () => {
    const funcNode = createMockFunctionWithParams(5, 'fn5')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('arrow function with 5 params is flagged', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'arrow5' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('method with 5 params is flagged', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'overload', parentClassName: 'Svc' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('constructor with 5 params is flagged', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const constructorNode = {
      ...createMockConstructorDeclaration({ parentClassName: 'BigClass' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(constructorNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('violation message for 5 params shows correct count', () => {
    const funcNode = createMockFunctionWithParams(5, 'fiveParams')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].message).toContain('5 parameters')
    expect(violations[0].message).toContain('Maximum allowed is 4')
  })
})

describe('functions with many params', () => {
  test('function with 6 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(6)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('6 parameters')
  })

  test('function with 7 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(7)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('7 parameters')
  })

  test('function with 8 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(8)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('8 parameters')
  })

  test('function with 10 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(10)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('10 parameters')
  })

  test('function with 15 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(15)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('15 parameters')
  })

  test('function with 20 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(20)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('20 parameters')
  })

  test('function with 50 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(50, 'hugeFunc')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('50 parameters')
  })
})

describe('custom max option variations', () => {
  test('max=2 flags 3 params', () => {
    const funcNode = createMockFunctionWithParams(3)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 2')
  })

  test('max=2 does not flag 2 params', () => {
    const funcNode = createMockFunctionWithParams(2)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=3 flags 4 params', () => {
    const funcNode = createMockFunctionWithParams(4)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 3 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 3')
  })

  test('max=3 does not flag 3 params', () => {
    const funcNode = createMockFunctionWithParams(3)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 3 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=5 does not flag 5 params', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 5 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=5 flags 6 params', () => {
    const funcNode = createMockFunctionWithParams(6)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 5 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 5')
  })

  test('max=10 does not flag 10 params', () => {
    const funcNode = createMockFunctionWithParams(10)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 10 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=10 flags 11 params', () => {
    const funcNode = createMockFunctionWithParams(11)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 10 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 10')
  })

  test('max=0 does not flag 0 params', () => {
    const funcNode = createMockFunctionWithParams(0)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 0 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=1 does not flag 1 param', () => {
    const funcNode = createMockFunctionWithParams(1)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 1 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('zero params', () => {
  test('function with 0 params is not flagged', () => {
    const funcNode = createMockFunctionWithParams(0, 'noParams')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('arrow function with 0 params is not flagged', () => {
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'noParamArrow' }),
      getParameters: () => [],
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('method with 0 params is not flagged', () => {
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'empty' }),
      getParameters: () => [],
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('constructor with 0 params is not flagged', () => {
    const constructorNode = {
      ...createMockConstructorDeclaration({ parentClassName: 'NoArgs' }),
      getParameters: () => [],
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(constructorNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with 0 params at max=0 is not flagged', () => {
    const funcNode = createMockFunctionWithParams(0, 'zeroAtZero')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 0 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('one param', () => {
  test('function with 1 param is not flagged at default max', () => {
    const funcNode = createMockFunctionWithParams(1, 'oneParam')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('arrow function with 1 param is not flagged', () => {
    const params = [{ getText: () => 'x', getKind: () => SyntaxKind.Identifier }]
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'oneArrow' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('method with 1 param is not flagged', () => {
    const params = [{ getText: () => 'data', getKind: () => SyntaxKind.Identifier }]
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'set' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('constructor with 1 param is not flagged', () => {
    const params = [{ getText: () => 'config', getKind: () => SyntaxKind.Identifier }]
    const constructorNode = {
      ...createMockConstructorDeclaration({ parentClassName: 'SingleArg' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(constructorNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with 1 param at max=0 IS flagged', () => {
    const funcNode = createMockFunctionWithParams(1, 'oneOverZero')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 0 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('function with 1 param at max=1 is NOT flagged', () => {
    const funcNode = createMockFunctionWithParams(1, 'oneAtOne')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 1 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('violation properties detailed', () => {
  test('violation has filePath', () => {
    const funcNode = createMockFunctionWithParams(5, 'filePathTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].filePath).toBeDefined()
    expect(typeof violations[0].filePath).toBe('string')
  })

  test('violation message contains Function prefix', () => {
    const funcNode = createMockFunctionWithParams(5, 'msgTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].message).toMatch(/^Function '/)
  })

  test('violation message contains parameter count', () => {
    const funcNode = createMockFunctionWithParams(7, 'countTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].message).toContain('7 parameters')
  })

  test('violation message contains max allowed value', () => {
    const funcNode = createMockFunctionWithParams(6, 'maxTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 3 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].message).toContain('Maximum allowed is 3')
  })

  test('violation suggestion mentions options object', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].suggestion).toContain('options object')
  })

  test('violation suggestion mentions splitting function', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].suggestion).toContain('split')
  })

  test('violation range has start line and column', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(typeof violations[0].range.start.line).toBe('number')
    expect(typeof violations[0].range.start.column).toBe('number')
  })

  test('violation range has end line and column', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(typeof violations[0].range.end.line).toBe('number')
    expect(typeof violations[0].range.end.column).toBe('number')
  })

  test('violation ruleId is always max-params', () => {
    const funcNode = createMockFunctionWithParams(6, 'ruleIdTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].ruleId).toBe('max-params')
  })

  test('violation severity is always warning', () => {
    const funcNode = createMockFunctionWithParams(8, 'sevTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation message contains quoted function name', () => {
    const funcNode = createMockFunctionWithParams(5, 'quotedName')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].message).toContain("'quotedName'")
  })
})

describe('analyzeMaxParams expanded', () => {
  function wrapForAnalyze(funcNode: FunctionLikeNode) {
    const sf = createMockSourceFile()
    return {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }
  }

  test('returns violation for 5 params with max=4', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'analyze5')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations).toHaveLength(1)
  })

  test('returns no violation for 4 params with max=4', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(4, 'analyze4')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('returns no violation for 3 params with max=4', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(3, 'analyze3')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('returns no violation for 0 params with max=4', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(0, 'analyze0')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('uses default max of 4 when maxParams omitted', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'analyzeDefault')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile)
    expect(violations).toHaveLength(1)
  })

  test('uses default max of 4 when maxParams is undefined', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(4, 'analyzeUndef')
    const violations = analyzeMaxParams(
      wrapForAnalyze(funcNode) as unknown as SourceFile,
      undefined,
    )
    expect(violations).toHaveLength(0)
  })

  test('returns violation with correct ruleId', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(6, 'analyzeRuleId')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations[0].ruleId).toBe('max-params')
  })

  test('returns violation with warning severity', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'analyzeSev')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations[0].severity).toBe('warning')
  })

  test('returns violation with function name in message', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'namedFunc')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations[0].message).toContain('namedFunc')
  })

  test('returns violation with suggestion', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'suggestionFunc')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('options object')
  })

  test('returns violations for multiple over-limit functions', () => {
    const func1 = createMockFunctionWithParamsForAnalyze(6, 'over1')
    const func2 = createMockFunctionWithParamsForAnalyze(8, 'over2')
    const sf = createMockSourceFile()
    const wrapped = {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(func1)
        cb(func2)
      },
    }
    const violations = analyzeMaxParams(wrapped as unknown as SourceFile, 4)
    expect(violations).toHaveLength(2)
  })

  test('returns only violations for over-limit functions in mixed set', () => {
    const func1 = createMockFunctionWithParamsForAnalyze(3, 'ok')
    const func2 = createMockFunctionWithParamsForAnalyze(7, 'bad')
    const sf = createMockSourceFile()
    const wrapped = {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(func1)
        cb(func2)
      },
    }
    const violations = analyzeMaxParams(wrapped as unknown as SourceFile, 4)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('bad')
  })

  test('returns empty array for file with no children', () => {
    const sf = createMockSourceFile()
    const wrapped = {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: () => {},
    }
    const violations = analyzeMaxParams(wrapped as unknown as SourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('respects custom max parameter', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(3, 'customMax')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 2)
    expect(violations).toHaveLength(1)
  })
})

describe('countParameters edge cases', () => {
  test('node without getParameters returns 0 count and no violation', () => {
    const funcNode = {
      ...createMockFunctionDeclaration({ functionName: 'noParamsMethod' }),
      getSourceFile: () => createMockSourceFile(),
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('node with empty getParameters returns 0 and no violation', () => {
    const funcNode = {
      ...createMockFunctionDeclaration({ functionName: 'emptyParams' }),
      getSourceFile: () => createMockSourceFile(),
      getParameters: () => [],
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 0 })
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('node with getParameters returning undefined-like does not crash', () => {
    const funcNode = {
      ...createMockFunctionDeclaration({ functionName: 'safeFunc' }),
      getSourceFile: () => createMockSourceFile(),
      getParameters: () => [],
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('getFunctionName variations via violation message', () => {
  test('function declaration name appears in violation', () => {
    const funcNode = createMockFunctionWithParams(5, 'declaredFn')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].message).toContain('declaredFn')
  })

  test('method with class name appears in violation', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'process', parentClassName: 'Service' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()[0].message).toContain('Service')
  })

  test('arrow function with variable name appears in violation', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'myArrow' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()[0].message).toContain('myArrow')
  })

  test('arrow function without variable name uses fallback', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: false }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toContain('arrow function')
  })

  test('constructor uses class name in violation', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const constructorNode = {
      ...createMockConstructorDeclaration({ parentClassName: 'BigClass' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(constructorNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()[0].message).toContain('BigClass')
  })
})

describe('multiple functions in file', () => {
  test('two functions both under limit produce no violations', () => {
    const func1 = createMockFunctionWithParams(2, 'fn1')
    const func2 = createMockFunctionWithParams(3, 'fn2')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(func1, context)
    instance.visitor.visitFunction!(func2, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('two functions both over limit produce two violations', () => {
    const func1 = createMockFunctionWithParams(5, 'over1')
    const func2 = createMockFunctionWithParams(6, 'over2')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(func1, context)
    instance.visitor.visitFunction!(func2, context)
    expect(instance.onComplete!()).toHaveLength(2)
  })

  test('mixed functions produce only violations for over-limit ones', () => {
    const func1 = createMockFunctionWithParams(2, 'ok1')
    const func2 = createMockFunctionWithParams(5, 'bad1')
    const func3 = createMockFunctionWithParams(3, 'ok2')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(func1, context)
    instance.visitor.visitFunction!(func2, context)
    instance.visitor.visitFunction!(func3, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('bad1')
  })

  test('ten functions all under limit produce no violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    for (let i = 0; i < 10; i++) {
      const funcNode = createMockFunctionWithParams(i % 5, `batch${i}`)
      instance.visitor.visitFunction!(funcNode, context)
    }
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('ten functions all over limit produce ten violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    for (let i = 0; i < 10; i++) {
      const funcNode = createMockFunctionWithParams(5, `overBatch${i}`)
      instance.visitor.visitFunction!(funcNode, context)
    }
    expect(instance.onComplete!()).toHaveLength(10)
  })
})

describe('get accessor edge cases', () => {
  test('get accessor with 5 params is flagged', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const getNode = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.GetAccessorDeclaration,
      getName: () => 'value',
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(getNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('set accessor with 5 params is flagged', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const setNode = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.SetAccessorDeclaration,
      getName: () => 'value',
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(setNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('violation message format', () => {
  test('message follows exact format with name, count, and max', () => {
    const funcNode = createMockFunctionWithParams(6, 'formatTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toBe("Function 'formatTest' has 6 parameters. Maximum allowed is 4.")
  })

  test('message with different custom max', () => {
    const funcNode = createMockFunctionWithParams(4, 'customMax')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    instance.visitor.visitFunction!(funcNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toBe("Function 'customMax' has 4 parameters. Maximum allowed is 2.")
  })

  test('message with 5 params at default max', () => {
    const funcNode = createMockFunctionWithParams(5, 'exactlyFive')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toContain('5 parameters')
    expect(msg).toContain('Maximum allowed is 4')
  })

  test('suggestion text is consistent', () => {
    const funcNode = createMockFunctionWithParams(6, 'sugTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const suggestion = instance.onComplete!()[0].suggestion
    expect(suggestion).toBe(
      'Consider using an options object to group related parameters, or split the function into smaller ones.',
    )
  })
})

describe('rule instance independence', () => {
  test('violations do not leak between instances', () => {
    const instance1 = maxParamsRule.create({ max: 4 })
    const instance2 = maxParamsRule.create({ max: 4 })
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    instance1.visitor.visitFunction!(funcNode, context)
    expect(instance1.onComplete!()).toHaveLength(1)
    expect(instance2.onComplete!()).toHaveLength(0)
  })

  test('different max values in different instances', () => {
    const strict = maxParamsRule.create({ max: 1 })
    const lenient = maxParamsRule.create({ max: 10 })
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    strict.visitor.visitFunction!(funcNode, context)
    lenient.visitor.visitFunction!(funcNode, context)
    expect(strict.onComplete!()).toHaveLength(1)
    expect(lenient.onComplete!()).toHaveLength(0)
  })

  test('calling onComplete multiple times returns same result', () => {
    const instance = maxParamsRule.create({ max: 4 })
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    instance.visitor.visitFunction!(funcNode, context)
    const first = instance.onComplete!()
    const second = instance.onComplete!()
    expect(first).toBe(second)
    expect(first).toHaveLength(1)
  })
})

describe('analyzeMaxParams with multiple functions', () => {
  test('all functions over limit are reported', () => {
    const func1 = createMockFunctionWithParamsForAnalyze(5, 'over1')
    const func2 = createMockFunctionWithParamsForAnalyze(6, 'over2')
    const func3 = createMockFunctionWithParamsForAnalyze(7, 'over3')
    const sf = createMockSourceFile()
    const wrapped = {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(func1)
        cb(func2)
        cb(func3)
      },
    }
    const violations = analyzeMaxParams(wrapped as unknown as SourceFile, 4)
    expect(violations).toHaveLength(3)
  })

  test('functions at limit are not reported', () => {
    const func1 = createMockFunctionWithParamsForAnalyze(4, 'atLimit')
    const func2 = createMockFunctionWithParamsForAnalyze(4, 'alsoAtLimit')
    const sf = createMockSourceFile()
    const wrapped = {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(func1)
        cb(func2)
      },
    }
    const violations = analyzeMaxParams(wrapped as unknown as SourceFile, 4)
    expect(violations).toHaveLength(0)
  })

  test('mixed functions report only over-limit', () => {
    const funcs = [
      createMockFunctionWithParamsForAnalyze(2, 'ok1'),
      createMockFunctionWithParamsForAnalyze(5, 'bad1'),
      createMockFunctionWithParamsForAnalyze(4, 'ok2'),
      createMockFunctionWithParamsForAnalyze(8, 'bad2'),
      createMockFunctionWithParamsForAnalyze(1, 'ok3'),
    ]
    const sf = createMockSourceFile()
    const wrapped = {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        funcs.forEach((f) => cb(f))
      },
    }
    const violations = analyzeMaxParams(wrapped as unknown as SourceFile, 4)
    expect(violations).toHaveLength(2)
    expect(violations[0].message).toContain('bad1')
    expect(violations[1].message).toContain('bad2')
  })
})

describe('boundary exact values', () => {
  test('exactly max params is not a violation for max=1', () => {
    const funcNode = createMockFunctionWithParams(1, 'exact1')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 1 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max+1 params is a violation for max=1', () => {
    const funcNode = createMockFunctionWithParams(2, 'over1')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 1 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('exactly max params is not a violation for max=5', () => {
    const funcNode = createMockFunctionWithParams(5, 'exact5')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 5 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max-1 params is not a violation for max=5', () => {
    const funcNode = createMockFunctionWithParams(4, 'under5')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 5 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max+1 params is a violation for max=5', () => {
    const funcNode = createMockFunctionWithParams(6, 'over5')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 5 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('0 params is not a violation for max=0', () => {
    const funcNode = createMockFunctionWithParams(0, 'zeroAtZero')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 0 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('1 param is a violation for max=0', () => {
    const funcNode = createMockFunctionWithParams(1, 'oneAtZero')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 0 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('visitor context usage', () => {
  test('addViolation on context is not called by visitFunction', () => {
    const funcNode = createMockFunctionWithParams(2)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(context.addViolation).not.toHaveBeenCalled()
  })

  test('sourceFile from context is accessible', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(context.sourceFile).toBe(sourceFile)
  })
})

describe('two params', () => {
  test('function with 2 params is not flagged at default max', () => {
    const funcNode = createMockFunctionWithParams(2, 'twoParams')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('arrow with 2 params is not flagged at default max', () => {
    const params = Array.from({ length: 2 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const arrowNode = {
      ...createMockArrowFunction({ parentIsVariable: true, variableName: 'arrow2' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('method with 2 params is not flagged at default max', () => {
    const params = Array.from({ length: 2 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const methodNode = {
      ...createMockMethodDeclaration({ methodName: 'twoArgs' }),
      getParameters: () => params,
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('function with 2 params at max=1 IS flagged', () => {
    const funcNode = createMockFunctionWithParams(2, 'twoOverOne')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 1 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('param count across all values 0-10', () => {
  test('0 params at max=4 no violation', () => {
    const funcNode = createMockFunctionWithParams(0)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('1 param at max=4 no violation', () => {
    const funcNode = createMockFunctionWithParams(1)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('2 params at max=4 no violation', () => {
    const funcNode = createMockFunctionWithParams(2)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('3 params at max=4 no violation', () => {
    const funcNode = createMockFunctionWithParams(3)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('4 params at max=4 no violation', () => {
    const funcNode = createMockFunctionWithParams(4)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('5 params at max=4 violation', () => {
    const funcNode = createMockFunctionWithParams(5)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('6 params at max=4 violation', () => {
    const funcNode = createMockFunctionWithParams(6)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('7 params at max=4 violation', () => {
    const funcNode = createMockFunctionWithParams(7)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('8 params at max=4 violation', () => {
    const funcNode = createMockFunctionWithParams(8)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('9 params at max=4 violation', () => {
    const funcNode = createMockFunctionWithParams(9)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('10 params at max=4 violation', () => {
    const funcNode = createMockFunctionWithParams(10)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('violation filePath', () => {
  test('violation uses node sourceFile getFilePath', () => {
    const funcNode = createMockFunctionWithParams(5, 'pathTest')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].filePath).toBeDefined()
  })

  test('violation filePath matches source file path', () => {
    const customSourceFile = createMockSourceFile({
      getFilePath: () => '/custom/path/to/file.ts',
    })
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const funcNode = {
      ...createMockFunctionDeclaration({ functionName: 'pathFn', start: 0, end: 70 }),
      getSourceFile: () => customSourceFile,
      getParameters: () => params,
    }
    const context = createMockVisitorContext(customSourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = instance.onComplete!()
    expect(violations[0].filePath).toBe('/custom/path/to/file.ts')
  })
})

describe('analyzeMaxParams with high param counts', () => {
  function wrapForAnalyze(funcNode: FunctionLikeNode) {
    const sf = createMockSourceFile()
    return {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }
  }

  test('10 params with max=4 returns violation', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(10, 'tenParams')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('10 parameters')
  })

  test('15 params with max=4 returns violation', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(15, 'fifteenParams')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('15 parameters')
  })

  test('5 params with max=10 no violation', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'fiveUnder10')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 10)
    expect(violations).toHaveLength(0)
  })

  test('10 params with max=10 no violation', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(10, 'tenAt10')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 10)
    expect(violations).toHaveLength(0)
  })

  test('11 params with max=10 violation', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(11, 'elevenOver10')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 10)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Maximum allowed is 10')
  })

  test('violation has correct range', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'rangeTest')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })
})

describe('function expression node types', () => {
  test('function expression with 5 params is flagged', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const funcExpr = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.FunctionExpression,
      getName: () => 'myFuncExpr',
      getParameters: () => params,
      getStart: () => 0,
      getEnd: () => 70,
      getSourceFile: () => createMockSourceFile(),
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcExpr as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('function expression with 3 params is not flagged', () => {
    const params = Array.from({ length: 3 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const funcExpr = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.FunctionExpression,
      getName: () => 'okFuncExpr',
      getParameters: () => params,
      getStart: () => 0,
      getEnd: () => 50,
      getSourceFile: () => createMockSourceFile(),
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcExpr as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('anonymous function expression uses fallback name', () => {
    const params = Array.from({ length: 5 }, (_, i) => ({
      getText: () => `p${i}`,
      getKind: () => SyntaxKind.Identifier,
    }))
    const funcExpr = {
      ...createMockSourceFile(),
      getKind: () => SyntaxKind.FunctionExpression,
      getName: () => undefined,
      getParameters: () => params,
      getStart: () => 0,
      getEnd: () => 70,
      getSourceFile: () => createMockSourceFile(),
    }
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcExpr as unknown as FunctionLikeNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('anonymous function')
  })
})

describe('violation accumulation', () => {
  test('visiting same function twice creates two violations', () => {
    const funcNode = createMockFunctionWithParams(5, 'dupVisit')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(2)
  })

  test('visiting three over-limit functions creates three violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    const func1 = createMockFunctionWithParams(5, 'trip1')
    const func2 = createMockFunctionWithParams(6, 'trip2')
    const func3 = createMockFunctionWithParams(7, 'trip3')
    instance.visitor.visitFunction!(func1, context)
    instance.visitor.visitFunction!(func2, context)
    instance.visitor.visitFunction!(func3, context)
    expect(instance.onComplete!()).toHaveLength(3)
  })

  test('onComplete returns accumulated violations not just last one', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    const func1 = createMockFunctionWithParams(6, 'acc1')
    const func2 = createMockFunctionWithParams(8, 'acc2')
    instance.visitor.visitFunction!(func1, context)
    instance.visitor.visitFunction!(func2, context)
    const violations = instance.onComplete!()
    expect(violations[0].message).toContain('acc1')
    expect(violations[1].message).toContain('acc2')
  })
})

describe('analyzeMaxParams violation properties', () => {
  function wrapForAnalyze(funcNode: FunctionLikeNode) {
    const sf = createMockSourceFile()
    return {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }
  }

  test('violation has correct filePath from sourceFile', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'filePathAnalyze')
    const sf = createMockSourceFile({ getFilePath: () => '/src/analyzed.ts' })
    const wrapped = {
      ...sf,
      getKind: () => SyntaxKind.SourceFile,
      forEachChild: (cb: (node: unknown) => void) => {
        cb(funcNode)
      },
    }
    const violations = analyzeMaxParams(wrapped as unknown as SourceFile, 4)
    expect(violations[0].filePath).toBe('/src/analyzed.ts')
  })

  test('violation message format matches rule output', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(6, 'formatAnalyze')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations[0].message).toContain("Function 'formatAnalyze' has 6 parameters")
  })

  test('violation suggestion matches rule output', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'sugAnalyze')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(violations[0].suggestion).toContain('options object')
    expect(violations[0].suggestion).toContain('split')
  })

  test('violations are returned as array', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(5, 'arrayTest')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(Array.isArray(violations)).toBe(true)
  })

  test('no violations returns empty array', () => {
    const funcNode = createMockFunctionWithParamsForAnalyze(2, 'emptyArr')
    const violations = analyzeMaxParams(wrapForAnalyze(funcNode) as unknown as SourceFile, 4)
    expect(Array.isArray(violations)).toBe(true)
    expect(violations).toHaveLength(0)
  })
})

describe('defaultOptions validation', () => {
  test('defaultOptions is an object', () => {
    expect(typeof maxParamsRule.defaultOptions).toBe('object')
  })

  test('defaultOptions has max property', () => {
    expect(maxParamsRule.defaultOptions).toHaveProperty('max')
  })

  test('defaultOptions.max is a number', () => {
    expect(typeof maxParamsRule.defaultOptions.max).toBe('number')
  })

  test('defaultOptions.max is positive', () => {
    expect(maxParamsRule.defaultOptions.max).toBeGreaterThan(0)
  })
})

describe('param count in violation message', () => {
  test('violation message shows 5 for 5-param function', () => {
    const funcNode = createMockFunctionWithParams(5, 'cnt5')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].message).toContain('5 parameters')
  })

  test('violation message shows 9 for 9-param function', () => {
    const funcNode = createMockFunctionWithParams(9, 'cnt9')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].message).toContain('9 parameters')
  })

  test('violation message shows 12 for 12-param function', () => {
    const funcNode = createMockFunctionWithParams(12, 'cnt12')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 4 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].message).toContain('12 parameters')
  })

  test('violation message shows correct max for custom max=2', () => {
    const funcNode = createMockFunctionWithParams(3, 'customMax2')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 2 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 2')
  })

  test('violation message shows correct max for custom max=7', () => {
    const funcNode = createMockFunctionWithParams(8, 'customMax7')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 7 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 7')
  })
})

describe('additional boundary tests', () => {
  test('max=3 with exactly 3 params is not flagged', () => {
    const funcNode = createMockFunctionWithParams(3, 'boundary3')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 3 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=6 with exactly 6 params is not flagged', () => {
    const funcNode = createMockFunctionWithParams(6, 'boundary6')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 6 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=8 with exactly 8 params is not flagged', () => {
    const funcNode = createMockFunctionWithParams(8, 'boundary8')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 8 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=6 with 7 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(7, 'over6')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 6 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 6')
  })

  test('max=8 with 9 params is flagged', () => {
    const funcNode = createMockFunctionWithParams(9, 'over8')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 8 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('Maximum allowed is 8')
  })

  test('max=15 does not flag 15 params', () => {
    const funcNode = createMockFunctionWithParams(15, 'at15')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 15 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('max=20 does not flag 20 params', () => {
    const funcNode = createMockFunctionWithParams(20, 'at20')
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = maxParamsRule.create({ max: 20 })
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})
