import { describe, test, expect, vi } from 'vitest'
import { SyntaxKind } from 'ts-morph'
import {
  noImplicitSideEffectsRule,
  analyzeImplicitSideEffects,
} from '../../../../src/rules/patterns/no-implicit-side-effects.js'
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor.js'
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockArrowFunction,
  createMockMethodDeclaration,
  createMockConstructorDeclaration,
  createMockNode,
} from '../../../helpers/ast-helpers.js'
import type { Node, SourceFile } from 'ts-morph'

function createMockVisitorContext(sourceFile: SourceFile): VisitorContext {
  return {
    sourceFile,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => sourceFile.getFilePath(),
  }
}

function createMockFunctionWithDescendants(
  config: {
    functionName?: string
    descendants?: Map<SyntaxKind, Node[]>
    getName?: string
    hasModifier?: boolean
    getText?: string
    isAsync?: boolean
  } = {},
): FunctionLikeNode {
  const {
    functionName = 'testFunction',
    descendants = new Map(),
    getName = functionName,
    hasModifier = false,
    getText = `function ${functionName}() {}`,
    isAsync = false,
  } = config

  const funcNode = createMockFunctionDeclaration({
    functionName: getName,
    text: getText,
  })

  const asyncText = isAsync ? 'async ' : ''

  ;(funcNode as Record<string, unknown>).getDescendantsOfKind = vi.fn(
    (kind: SyntaxKind) => descendants.get(kind) ?? [],
  )
  ;(funcNode as Record<string, unknown>).getName = vi.fn(() => getName)
  ;(funcNode as Record<string, unknown>).getText = vi.fn(() => `${asyncText}${getText}`)
  ;(funcNode as Record<string, unknown>).hasModifier = vi.fn(() => hasModifier)
  ;(funcNode as Record<string, unknown>).getParameters = vi.fn(() => [])
  ;(funcNode as Record<string, unknown>).getJsDocs = vi.fn(() => [])
  ;(funcNode as Record<string, unknown>).getAsteriskToken = vi.fn(() => undefined)

  return funcNode as unknown as FunctionLikeNode
}

function createMockBinaryExpression(
  leftText: string,
  operatorKind: number = SyntaxKind.EqualsToken,
  rightText: string = '1',
): Node {
  const leftNode = createMockNode({ kind: SyntaxKind.Identifier, text: leftText })
  const rightNode = createMockNode({ kind: SyntaxKind.Identifier, text: rightText })
  const binaryNode = createMockNode({
    kind: SyntaxKind.BinaryExpression,
    text: `${leftText} = ${rightText}`,
  })

  ;(binaryNode as Record<string, unknown>).getLeft = vi.fn(() => leftNode)
  ;(binaryNode as Record<string, unknown>).getRight = vi.fn(() => rightNode)
  ;(binaryNode as Record<string, unknown>).getOperatorToken = vi.fn(() => ({
    getKind: vi.fn(() => operatorKind),
  }))

  return binaryNode
}

function createMockPropertyAccessExpression(
  objectText: string,
  propertyName: string,
): Node {
  const objNode = createMockNode({ kind: SyntaxKind.Identifier, text: objectText })
  const propNode = createMockNode({
    kind: SyntaxKind.PropertyAccessExpression,
    text: `${objectText}.${propertyName}`,
  })
  ;(propNode as Record<string, unknown>).getExpression = vi.fn(() => objNode)
  ;(propNode as Record<string, unknown>).getName = vi.fn(() => propertyName)

  return propNode
}

function createMockBinaryWithPropertyLeft(
  objectText: string,
  propertyName: string,
  operatorKind: number = SyntaxKind.EqualsToken,
): Node {
  const leftNode = createMockPropertyAccessExpression(objectText, propertyName)
  const rightNode = createMockNode({ kind: SyntaxKind.Identifier, text: '1' })
  const binaryNode = createMockNode({
    kind: SyntaxKind.BinaryExpression,
    text: `${objectText}.${propertyName} = 1`,
  })

  ;(binaryNode as Record<string, unknown>).getLeft = vi.fn(() => leftNode)
  ;(binaryNode as Record<string, unknown>).getRight = vi.fn(() => rightNode)
  ;(binaryNode as Record<string, unknown>).getOperatorToken = vi.fn(() => ({
    getKind: vi.fn(() => operatorKind),
  }))

  return binaryNode
}

function createMockCallExpression(calleeText: string): Node {
  const callNode = createMockNode({
    kind: SyntaxKind.CallExpression,
    text: calleeText,
  })
  const exprNode = createMockNode({
    kind: SyntaxKind.Identifier,
    text: calleeText,
  })
  ;(callNode as Record<string, unknown>).getExpression = vi.fn(() => exprNode)
  ;(callNode as Record<string, unknown>).getText = vi.fn(() => calleeText)
  return callNode
}

function createMockCallWithPropertyAccess(
  objectText: string,
  methodName: string,
): Node {
  const callNode = createMockNode({
    kind: SyntaxKind.CallExpression,
    text: `${objectText}.${methodName}()`,
  })
  const propAccess = createMockPropertyAccessExpression(objectText, methodName)
  ;(callNode as Record<string, unknown>).getExpression = vi.fn(() => propAccess)
  ;(callNode as Record<string, unknown>).getText = vi.fn(() => `${objectText}.${methodName}()`)
  return callNode
}

function createMockThrowStatement(): Node {
  return createMockNode({
    kind: SyntaxKind.ThrowStatement,
    text: 'throw new Error()',
  })
}

function createMockReturnStatement(): Node {
  return createMockNode({
    kind: SyntaxKind.ReturnStatement,
    text: 'return x',
  })
}

function createMockUnaryExpression(
  operandText: string,
  operatorKind: number,
): Node {
  const operandNode = createMockNode({ kind: SyntaxKind.Identifier, text: operandText })
  const unaryNode = createMockNode({
    kind: operatorKind,
    text: `++${operandText}`,
  })
  ;(unaryNode as Record<string, unknown>).getOperand = vi.fn(() => operandNode)
  ;(unaryNode as Record<string, unknown>).getOperatorToken = vi.fn(() => operatorKind)
  return unaryNode
}

function runRule(
  funcConfig: Parameters<typeof createMockFunctionWithDescendants>[0],
  sourceFileOverrides: Record<string, unknown> = {},
  options: Record<string, unknown> = {},
) {
  const funcNode = createMockFunctionWithDescendants(funcConfig)
  const sourceFile = createMockSourceFile(sourceFileOverrides)
  const context = createMockVisitorContext(sourceFile)
  const ruleInstance = noImplicitSideEffectsRule.create(options)
  ruleInstance.visitor.visitFunction!(funcNode, context)
  return { violations: ruleInstance.onComplete!(), context, sourceFile }
}

describe('noImplicitSideEffectsRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(noImplicitSideEffectsRule.meta.name).toBe('no-implicit-side-effects')
    })

    test('has correct category', () => {
      expect(noImplicitSideEffectsRule.meta.category).toBe('patterns')
    })

    test('is not recommended', () => {
      expect(noImplicitSideEffectsRule.meta.recommended).toBe(false)
    })

    test('has warning severity', () => {
      expect(noImplicitSideEffectsRule.meta.severity).toBe('warning')
    })

    test('has description', () => {
      expect(noImplicitSideEffectsRule.meta.description).toContain('implicit')
      expect(noImplicitSideEffectsRule.meta.description).toContain('side effect')
    })

    test('has docs with category patterns', () => {
      expect(noImplicitSideEffectsRule.meta.docs?.category).toBe('patterns')
    })

    test('docs recommended is false', () => {
      expect(noImplicitSideEffectsRule.meta.docs?.recommended).toBe(false)
    })

    test('docs severity is warning', () => {
      expect(noImplicitSideEffectsRule.meta.docs?.severity).toBe('warning')
    })

    test('meta name is string', () => {
      expect(typeof noImplicitSideEffectsRule.meta.name).toBe('string')
    })

    test('meta description is non-empty string', () => {
      expect(typeof noImplicitSideEffectsRule.meta.description).toBe('string')
      expect(noImplicitSideEffectsRule.meta.description.length).toBeGreaterThan(0)
    })

    test('meta category is valid category', () => {
      const validCategories = [
        'complexity', 'correctness', 'dependencies', 'patterns', 'performance', 'security', 'style',
      ]
      expect(validCategories).toContain(noImplicitSideEffectsRule.meta.category)
    })

    test('meta recommended is boolean', () => {
      expect(typeof noImplicitSideEffectsRule.meta.recommended).toBe('boolean')
    })

    test('meta does not have deprecated flag', () => {
      expect(noImplicitSideEffectsRule.meta.deprecated).toBeUndefined()
    })

    test('meta does not have replacedBy field', () => {
      expect(noImplicitSideEffectsRule.meta.replacedBy).toBeUndefined()
    })
  })

  describe('defaultOptions', () => {
    test('has default options', () => {
      expect(noImplicitSideEffectsRule.defaultOptions).toBeDefined()
    })

    test('checkPureNaming defaults to true', () => {
      expect(noImplicitSideEffectsRule.defaultOptions.checkPureNaming).toBe(true)
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const result = noImplicitSideEffectsRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const result = noImplicitSideEffectsRule.create({})
      expect(result.onComplete).toBeDefined()
      expect(typeof result.onComplete).toBe('function')
    })

    test('accepts empty options', () => {
      expect(() => noImplicitSideEffectsRule.create({})).not.toThrow()
    })

    test('each create call returns independent instance', () => {
      const instance1 = noImplicitSideEffectsRule.create({})
      const instance2 = noImplicitSideEffectsRule.create({})
      expect(instance1).not.toBe(instance2)
    })

    test('onComplete returns array', () => {
      const result = noImplicitSideEffectsRule.create({})
      const violations = result.onComplete!()
      expect(Array.isArray(violations)).toBe(true)
    })
  })

  describe('skip conditions', () => {
    test('skips constructor functions', () => {
      const constructorNode = createMockConstructorDeclaration()
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noImplicitSideEffectsRule.create({})
      ruleInstance.visitor.visitFunction!(constructorNode, context)
      expect(ruleInstance.onComplete!()).toHaveLength(0)
    })

    test('skips functions with return statements', () => {
      const returnStmt = createMockReturnStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.ReturnStatement, [returnStmt]],
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'modifyStuff',
        descendants,
        getName: 'modifyStuff',
      })
      expect(violations).toHaveLength(0)
    })

    test('does not skip functions without return statements', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.ReturnStatement, []],
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'modifyStuff',
        descendants,
        getName: 'modifyStuff',
      })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('closure mutation detection', () => {
    test('detects assignment to outer variable', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )

      const { violations } = runRule({
        functionName: 'impureFn',
        descendants,
        getName: 'impureFn',
      })
      expect(violations.length).toBeGreaterThanOrEqual(1)
      const closureViolation = violations.find(
        (v) => v.message.includes('outer variable') || v.message.includes('outer'),
      )
      expect(closureViolation).toBeDefined()
    })

    test('does not flag local variable assignment', () => {
      const binaryExpr = createMockBinaryExpression('localVar')
      const localVarDecl = createMockNode({ kind: SyntaxKind.VariableDeclaration, text: 'localVar' })
      ;(localVarDecl as Record<string, unknown>).getNameNode = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'localVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, [localVarDecl]],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'localVar' }),
      )

      const { violations } = runRule({
        functionName: 'fn',
        descendants,
        getName: 'fn',
      })
      const closureViolation = violations.find(
        (v) => v.message.includes('outer variable'),
      )
      expect(closureViolation).toBeUndefined()
    })

    test('detects prefix increment on outer variable', () => {
      const unaryExpr = createMockUnaryExpression('counter', SyntaxKind.PlusPlusToken)
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, [unaryExpr]],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'increment',
        descendants,
        getName: 'increment',
      })
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    test('detects postfix decrement on outer variable', () => {
      const unaryExpr = createMockUnaryExpression('count', SyntaxKind.MinusMinusToken)
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, [unaryExpr]],
      ])
      const { violations } = runRule({
        functionName: 'decrement',
        descendants,
        getName: 'decrement',
      })
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })

    test('detects property mutation on outer object', () => {
      const binaryExpr = createMockBinaryWithPropertyLeft('config', 'value')
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'configure',
        descendants,
        getName: 'configure',
      })
      const closureViolation = violations.find(
        (v) => v.message.includes('outer variable') && v.message.includes('config'),
      )
      expect(closureViolation).toBeDefined()
    })
  })

  describe('parameter mutation detection', () => {
    test('detects property assignment on parameter', () => {
      const binaryExpr = createMockBinaryWithPropertyLeft('data', 'name')
      const paramNode = createMockNode({ kind: SyntaxKind.Identifier, text: 'data' })
      ;(paramNode as Record<string, unknown>).getNameNode = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'data' }),
      )

      const funcNode = createMockFunctionWithDescendants({
        functionName: 'modifyParam',
        getName: 'modifyParam',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, [binaryExpr]],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      ;(funcNode as Record<string, unknown>).getParameters = vi.fn(() => [paramNode])

      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noImplicitSideEffectsRule.create({})
      ruleInstance.visitor.visitFunction!(funcNode, context)
      const violations = ruleInstance.onComplete!()

      const paramViolation = violations.find(
        (v) => v.message.includes('parameter') && v.message.includes('data'),
      )
      expect(paramViolation).toBeDefined()
    })

    test('detects mutating method call on parameter (push)', () => {
      const callExpr = createMockCallWithPropertyAccess('items', 'push')
      const paramNode = createMockNode({ kind: SyntaxKind.Identifier, text: 'items' })
      ;(paramNode as Record<string, unknown>).getNameNode = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'items' }),
      )

      const funcNode = createMockFunctionWithDescendants({
        functionName: 'addItem',
        getName: 'addItem',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, []],
          [SyntaxKind.CallExpression, [callExpr]],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      ;(funcNode as Record<string, unknown>).getParameters = vi.fn(() => [paramNode])

      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noImplicitSideEffectsRule.create({})
      ruleInstance.visitor.visitFunction!(funcNode, context)
      const violations = ruleInstance.onComplete!()

      const paramViolation = violations.find(
        (v) => v.message.includes('parameter') && v.message.includes('push'),
      )
      expect(paramViolation).toBeDefined()
    })

    test('detects splice on parameter array', () => {
      const callExpr = createMockCallWithPropertyAccess('arr', 'splice')
      const paramNode = createMockNode({ kind: SyntaxKind.Identifier, text: 'arr' })
      ;(paramNode as Record<string, unknown>).getNameNode = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'arr' }),
      )

      const funcNode = createMockFunctionWithDescendants({
        functionName: 'removeItem',
        getName: 'removeItem',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, []],
          [SyntaxKind.CallExpression, [callExpr]],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      ;(funcNode as Record<string, unknown>).getParameters = vi.fn(() => [paramNode])

      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noImplicitSideEffectsRule.create({})
      ruleInstance.visitor.visitFunction!(funcNode, context)
      const violations = ruleInstance.onComplete!()

      expect(violations.some((v) => v.message.includes('splice'))).toBe(true)
    })
  })

  describe('I/O operation detection', () => {
    test('detects process.exit call', () => {
      const callExpr = createMockCallExpression('process.exit(1)')
      ;(callExpr as Record<string, unknown>).getText = vi.fn(() => 'process.exit(1)')

      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, [callExpr]],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'die',
        descendants,
        getName: 'die',
      })
      const ioViolation = violations.find((v) => v.message.includes('I/O'))
      expect(ioViolation).toBeDefined()
    })

    test('detects process.stdout.write call', () => {
      const callExpr = createMockCallExpression('process.stdout.write("hi")')
      ;(callExpr as Record<string, unknown>).getText = vi.fn(() => 'process.stdout.write("hi")')

      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, [callExpr]],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'log',
        descendants,
        getName: 'log',
      })
      const ioViolation = violations.find((v) => v.message.includes('I/O'))
      expect(ioViolation).toBeDefined()
    })

    test('detects fs.writeFile call', () => {
      const propAccess = createMockPropertyAccessExpression('fs', 'writeFile')
      const callExpr = createMockNode({
        kind: SyntaxKind.CallExpression,
        text: 'fs.writeFile(path, data)',
      })
      ;(callExpr as Record<string, unknown>).getExpression = vi.fn(() => propAccess)

      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, [callExpr]],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'writeData',
        descendants,
        getName: 'writeData',
      })
      const fsViolation = violations.find((v) => v.message.includes('filesystem'))
      expect(fsViolation).toBeDefined()
    })
  })

  describe('pure naming violation detection', () => {
    test('detects throw in function named getUser', () => {
      const throwStmt = createMockThrowStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, [throwStmt]],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'getUser',
        descendants,
        getName: 'getUser',
      })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeDefined()
    })

    test('detects throw in function named isValid', () => {
      const throwStmt = createMockThrowStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, [throwStmt]],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'isValid',
        descendants,
        getName: 'isValid',
      })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeDefined()
    })

    test('detects throw in function named hasPermission', () => {
      const throwStmt = createMockThrowStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, [throwStmt]],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'hasPermission',
        descendants,
        getName: 'hasPermission',
      })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeDefined()
    })

    test('detects throw in function named shouldProceed', () => {
      const throwStmt = createMockThrowStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, [throwStmt]],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'shouldProceed',
        descendants,
        getName: 'shouldProceed',
      })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeDefined()
    })

    test('detects throw in function named canAccess', () => {
      const throwStmt = createMockThrowStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, [throwStmt]],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'canAccess',
        descendants,
        getName: 'canAccess',
      })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeDefined()
    })

    test('does not flag throw in non-query function', () => {
      const throwStmt = createMockThrowStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, [throwStmt]],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'validate',
        descendants,
        getName: 'validate',
      })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeUndefined()
    })

    test('respects checkPureNaming option set to false', () => {
      const throwStmt = createMockThrowStatement()
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, []],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, [throwStmt]],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'getUser',
        descendants,
        getName: 'getUser',
      }, {}, { checkPureNaming: false })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeUndefined()
    })
  })

  describe('allowIn option', () => {
    test('skips function named in allowIn list', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'allowedMutator',
        descendants,
        getName: 'allowedMutator',
      }, {}, { allowIn: ['allowedMutator'] })
      expect(violations).toHaveLength(0)
    })

    test('does not skip function not in allowIn list', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'otherMutator',
        descendants,
        getName: 'otherMutator',
      }, {}, { allowIn: ['allowedMutator'] })
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('violation structure', () => {
    test('violation has correct ruleId', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'fn',
        descendants,
        getName: 'fn',
      })
      expect(violations[0].ruleId).toBe('no-implicit-side-effects')
    })

    test('violation has warning severity', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'fn',
        descendants,
        getName: 'fn',
      })
      expect(violations[0].severity).toBe('warning')
    })

    test('violation has range', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'fn',
        descendants,
        getName: 'fn',
      })
      expect(violations[0].range).toBeDefined()
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    test('violation has filePath', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule(
        { functionName: 'fn', descendants, getName: 'fn' },
        { getFilePath: vi.fn(() => '/custom/path.ts') },
      )
      expect(violations[0].filePath).toBe('/custom/path.ts')
    })

    test('violation has suggestion', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'fn',
        descendants,
        getName: 'fn',
      })
      expect(violations[0].suggestion).toBeDefined()
      expect(violations[0].suggestion!.length).toBeGreaterThan(0)
    })
  })

  describe('onComplete accumulates violations', () => {
    test('returns empty when no functions visited', () => {
      const ruleInstance = noImplicitSideEffectsRule.create({})
      expect(ruleInstance.onComplete!()).toEqual([])
    })

    test('accumulates across multiple visitFunction calls', () => {
      const ruleInstance = noImplicitSideEffectsRule.create({})

      const binaryExpr1 = createMockBinaryExpression('var1')
      ;(binaryExpr1 as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'var1' }),
      )
      const func1 = createMockFunctionWithDescendants({
        functionName: 'fn1',
        getName: 'fn1',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, [binaryExpr1]],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })

      const binaryExpr2 = createMockBinaryExpression('var2')
      ;(binaryExpr2 as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'var2' }),
      )
      const func2 = createMockFunctionWithDescendants({
        functionName: 'fn2',
        getName: 'fn2',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, [binaryExpr2]],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })

      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)

      ruleInstance.visitor.visitFunction!(func1, context)
      ruleInstance.visitor.visitFunction!(func2, context)
      const violations = ruleInstance.onComplete!()

      expect(violations.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('analyzeImplicitSideEffects standalone function', () => {
    test('returns violations for function with closure mutation', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const funcNode = createMockFunctionWithDescendants({
        functionName: 'fn',
        getName: 'fn',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, [binaryExpr]],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const violations = analyzeImplicitSideEffects(funcNode, context)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].ruleId).toBe('no-implicit-side-effects')
    })

    test('returns empty array for clean function', () => {
      const funcNode = createMockFunctionWithDescendants({
        functionName: 'cleanFn',
        getName: 'cleanFn',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, []],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const violations = analyzeImplicitSideEffects(funcNode, context)
      expect(violations).toHaveLength(0)
    })

    test('accepts custom options', () => {
      const throwStmt = createMockThrowStatement()
      const funcNode = createMockFunctionWithDescendants({
        functionName: 'getValue',
        getName: 'getValue',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, []],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, [throwStmt]],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const violations = analyzeImplicitSideEffects(funcNode, context, { checkPureNaming: false })
      const namingViolation = violations.find((v) => v.message.includes('Query function'))
      expect(namingViolation).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    test('handles function with no descendants gracefully', () => {
      const { violations } = runRule({
        functionName: 'emptyFn',
        getName: 'emptyFn',
        descendants: new Map(),
      })
      expect(violations).toHaveLength(0)
    })

    test('handles function with all empty descendant arrays', () => {
      const { violations } = runRule({
        functionName: 'fn',
        getName: 'fn',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, []],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      expect(violations).toHaveLength(0)
    })

    test('handles function with empty name', () => {
      const binaryExpr = createMockBinaryExpression('outerVar')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'outerVar' }),
      )
      const { violations } = runRule({
        functionName: '',
        getName: '',
        descendants: new Map<SyntaxKind, Node[]>([
          [SyntaxKind.BinaryExpression, [binaryExpr]],
          [SyntaxKind.CallExpression, []],
          [SyntaxKind.ThrowStatement, []],
          [SyntaxKind.VariableDeclaration, []],
          [SyntaxKind.FunctionDeclaration, []],
          [SyntaxKind.PrefixUnaryExpression, []],
          [SyntaxKind.PostfixUnaryExpression, []],
        ]),
      })
      expect(violations.length).toBeGreaterThan(0)
    })

    test('does not crash calling onComplete without visiting', () => {
      const ruleInstance = noImplicitSideEffectsRule.create({})
      expect(() => ruleInstance.onComplete!()).not.toThrow()
    })

    test('handles arrow function with variable parent', () => {
      const arrowFunc = createMockArrowFunction({
        parentIsVariable: true,
        variableName: 'myArrow',
      })
      ;(arrowFunc as Record<string, unknown>).getDescendantsOfKind = vi.fn(() => [])
      ;(arrowFunc as Record<string, unknown>).getParameters = vi.fn(() => [])
      ;(arrowFunc as Record<string, unknown>).getJsDocs = vi.fn(() => [])
      ;(arrowFunc as Record<string, unknown>).hasModifier = vi.fn(() => false)

      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noImplicitSideEffectsRule.create({})
      expect(() => ruleInstance.visitor.visitFunction!(arrowFunc, context)).not.toThrow()
    })

    test('handles method declaration', () => {
      const methodNode = createMockMethodDeclaration({
        methodName: 'update',
        parentClassName: 'Service',
      })
      ;(methodNode as Record<string, unknown>).getDescendantsOfKind = vi.fn(() => [])
      ;(methodNode as Record<string, unknown>).getParameters = vi.fn(() => [])
      ;(methodNode as Record<string, unknown>).getJsDocs = vi.fn(() => [])
      ;(methodNode as Record<string, unknown>).hasModifier = vi.fn(() => false)
      ;(methodNode as Record<string, unknown>).getAsteriskToken = vi.fn(() => undefined)

      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noImplicitSideEffectsRule.create({})
      expect(() => ruleInstance.visitor.visitFunction!(methodNode, context)).not.toThrow()
    })

    test('handles compound assignment operators on outer vars (+=)', () => {
      const binaryExpr = createMockBinaryExpression('counter')
      ;(binaryExpr as Record<string, unknown>).getOperatorToken = vi.fn(() => ({
        getKind: vi.fn(() => SyntaxKind.PlusEqualsToken),
      }))
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'counter' }),
      )

      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'increment',
        descendants,
        getName: 'increment',
      })
      const closureViolation = violations.find((v) => v.message.includes('outer variable'))
      expect(closureViolation).toBeUndefined()
    })
  })

  describe('multiple violations in single function', () => {
    test('reports multiple closure mutations', () => {
      const binary1 = createMockBinaryExpression('var1')
      ;(binary1 as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'var1' }),
      )
      const binary2 = createMockBinaryExpression('var2')
      ;(binary2 as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'var2' }),
      )

      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binary1, binary2]],
        [SyntaxKind.CallExpression, []],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'multiMutate',
        descendants,
        getName: 'multiMutate',
      })
      const closureViolations = violations.filter((v) => v.message.includes('outer variable'))
      expect(closureViolations.length).toBeGreaterThanOrEqual(2)
    })

    test('reports mix of closure mutation and I/O', () => {
      const binaryExpr = createMockBinaryExpression('counter')
      ;(binaryExpr as Record<string, unknown>).getLeft = vi.fn(() =>
        createMockNode({ kind: SyntaxKind.Identifier, text: 'counter' }),
      )
      const callExpr = createMockCallExpression('process.exit(1)')
      ;(callExpr as Record<string, unknown>).getText = vi.fn(() => 'process.exit(1)')

      const descendants = new Map<SyntaxKind, Node[]>([
        [SyntaxKind.BinaryExpression, [binaryExpr]],
        [SyntaxKind.CallExpression, [callExpr]],
        [SyntaxKind.ThrowStatement, []],
        [SyntaxKind.VariableDeclaration, []],
        [SyntaxKind.FunctionDeclaration, []],
        [SyntaxKind.PrefixUnaryExpression, []],
        [SyntaxKind.PostfixUnaryExpression, []],
      ])
      const { violations } = runRule({
        functionName: 'badFn',
        descendants,
        getName: 'badFn',
      })
      const closureViolation = violations.find((v) => v.message.includes('outer variable'))
      const ioViolation = violations.find((v) => v.message.includes('I/O'))
      expect(closureViolation).toBeDefined()
      expect(ioViolation).toBeDefined()
    })
  })
})
