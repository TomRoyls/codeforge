import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { noConsoleRule } from '../../src/rules/best-practices/no-console.js'
import { explicitReturnTypeRule } from '../../src/rules/best-practices/explicit-return-type.js'
import { noImplicitCoercionRule } from '../../src/rules/best-practices/no-implicit-coercion.js'
import { noMagicNumbersRule } from '../../src/rules/best-practices/no-magic-numbers.js'
import { noUnnecessaryConditionRule } from '../../src/rules/best-practices/no-unnecessary-condition.js'

// ─── SyntaxKind constants (matching ts-morph's bundled TypeScript) ───

const SK = {
  ArrayLiteralExpression: 209,
  ArrowFunction: 219,
  AsteriskToken: 42,
  BinaryExpression: 226,
  BindingElement: 208,
  ElementAccessExpression: 212,
  EnumMember: 306,
  EqualsEqualsEqualsToken: 37,
  EqualsEqualsToken: 35,
  ExclamationToken: 54,
  ExclamationEqualsEqualsToken: 38,
  ExclamationEqualsToken: 36,
  ExpressionStatement: 244,
  FalseKeyword: 97,
  FunctionDeclaration: 262,
  GreaterThanEqualsToken: 34,
  GreaterThanToken: 32,
  LessThanEqualsToken: 33,
  LessThanToken: 30,
  LiteralType: 201,
  MethodDeclaration: 174,
  NullKeyword: 106,
  NumericLiteral: 9,
  ObjectLiteralExpression: 210,
  Parameter: 169,
  PlusToken: 40,
  PrefixUnaryExpression: 224,
  PropertyAssignment: 303,
  PropertyDeclaration: 172,
  StringLiteral: 11,
  TrueKeyword: 112,
  VariableDeclaration: 260,
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

// ─── Section: no-console ───

function createMockContext(
  options: Record<string, unknown> = {},
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => 'test.ts',
    getSource: () => '',
    getTokens: () => [],
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    report(descriptor: ReportDescriptor) {
      reports.push(descriptor)
    },
    workspaceRoot: '/test',
  }

  return { context, reports }
}

function withLoc(node: Record<string, unknown>, line = 1, column = 0) {
  return {
    ...node,
    loc: {
      end: { column: column + 1, line },
      start: { column, line },
    },
  }
}

function consoleCall(method: string, line = 1, column = 0) {
  return withLoc(
    {
      arguments: [],
      callee: {
        object: { name: 'console', type: 'Identifier' },
        property: { name: method, type: 'Identifier' },
        type: 'MemberExpression',
      },
      type: 'CallExpression',
    },
    line,
    column,
  )
}

function nonConsoleCall() {
  return withLoc({
    arguments: [],
    callee: {
      object: { name: 'myObj', type: 'Identifier' },
      property: { name: 'log', type: 'Identifier' },
      type: 'MemberExpression',
    },
    type: 'CallExpression',
  })
}

describe('no-console rule', () => {
  it('reports console.log call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('log'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("console.log")
  })

  it('reports console.error call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('error'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('console.error')
  })

  it('reports console.warn call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('warn'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('console.warn')
  })

  it('reports console.debug call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('debug'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('console.debug')
  })

  it('reports console.trace call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('trace'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('console.trace')
  })

  it('does not report allowed console methods', () => {
    const { context, reports } = createMockContext([{ allow: ['log', 'warn'] }])
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('log'))
    visitor.CallExpression!(consoleCall('warn'))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-console calls', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(nonConsoleCall())

    expect(reports).toHaveLength(0)
  })

  it('does not report console with non-standard method', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('assert'))

    expect(reports).toHaveLength(0)
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConsoleRule.create(context)

    visitor.CallExpression!(consoleCall('log', 1, 0))
    visitor.CallExpression!(consoleCall('error', 5, 3))

    expect(reports).toHaveLength(2)
  })

  it('has correct meta properties', () => {
    expect(noConsoleRule.meta.docs?.category).toBe('best-practices')
    expect(noConsoleRule.meta.docs?.recommended).toBe(true)
    expect(noConsoleRule.meta.severity).toBe('warn')
    expect(noConsoleRule.meta.type).toBe('suggestion')
  })
})

// ─── Section: no-magic-numbers ───

function createNumericLiteralNode(
  value: number,
  parentOverrides: MockNode = {},
): MockNode {
  const sf = createSourceFileMock()
  const node: MockNode = {
    getEnd: () => 10,
    getKind: () => SK.NumericLiteral,
    getLiteralValue: () => value,
    getParent: () => ({ getKind: () => SK.ExpressionStatement, ...parentOverrides }),
    getSourceFile: () => sf,
    getStart: () => 8,
  }
  return node
}

describe('no-magic-numbers rule', () => {
  it('reports magic number 42', () => {
    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createNumericLiteralNode(42), {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('42')
    expect(violations[0]!.ruleId).toBe('no-magic-numbers')
  })

  it('reports magic number 3.14', () => {
    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createNumericLiteralNode(3.14), {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('3.14')
  })

  it('does not report 0 (default ignored)', () => {
    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createNumericLiteralNode(0), {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report 1 (default ignored)', () => {
    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createNumericLiteralNode(1), {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report number in object literal (always ignored)', () => {
    const sf = createSourceFileMock()
    const node: MockNode = {
      getEnd: () => 10,
      getKind: () => SK.NumericLiteral,
      getLiteralValue: () => 42,
      getParent: () => ({ getKind: () => SK.ObjectLiteralExpression }),
      getSourceFile: () => sf,
      getStart: () => 8,
    }

    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(node, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report number in property assignment (always ignored)', () => {
    const sf = createSourceFileMock()
    const node: MockNode = {
      getEnd: () => 10,
      getKind: () => SK.NumericLiteral,
      getLiteralValue: () => 42,
      getParent: () => ({ getKind: () => SK.PropertyAssignment }),
      getSourceFile: () => sf,
      getStart: () => 8,
    }

    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(node, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report number in const variable declaration', () => {
    const sf = createSourceFileMock()
    const node: MockNode = {
      getEnd: () => 10,
      getKind: () => SK.NumericLiteral,
      getLiteralValue: () => 42,
      getSourceFile: () => sf,
      getStart: () => 8,
    }
    node.getParent = () => ({
      getKind: () => SK.VariableDeclaration,
      getInitializer: () => node,
      getVariableStatement: () => ({ getDeclarationKind: () => 'const' }),
    })

    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(node, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports number in non-ignored context', () => {
    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createNumericLiteralNode(99), {})

    expect(result.onComplete!()).toHaveLength(1)
    expect(result.onComplete!()[0]!.message).toContain('99')
  })

  it('does not report numbers in custom ignore list', () => {
    const result = noMagicNumbersRule.create({ ignore: [42, 100] })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(createNumericLiteralNode(42), {})
    visitor.visitNode!(createNumericLiteralNode(100), {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('ignores non-numeric-literal nodes', () => {
    const result = noMagicNumbersRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!({ getKind: () => SK.StringLiteral }, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('has correct meta properties', () => {
    expect(noMagicNumbersRule.meta.name).toBe('no-magic-numbers')
    expect(noMagicNumbersRule.meta.category).toBe('style')
    expect(noMagicNumbersRule.meta.fixable).toBe('code')
    expect(noMagicNumbersRule.defaultOptions.ignore).toEqual([])
    expect(noMagicNumbersRule.defaultOptions.ignoreEnums).toBe(true)
  })
})

// ─── Section: explicit-return-type ───

function createFunctionNode(
  kind: number,
  overrides: MockNode = {},
): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 20,
    getKind: () => kind,
    getSourceFile: () => sf,
    getStart: () => 0,
    isAsync: () => false,
    ...overrides,
  }
}

describe('explicit-return-type rule', () => {
  it('reports arrow function without return type', () => {
    const result = explicitReturnTypeRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.ArrowFunction, { getReturnTypeNode: () => undefined }),
      {},
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Arrow function')
    expect(violations[0]!.ruleId).toBe('explicit-return-type')
  })

  it('reports function declaration without return type', () => {
    const result = explicitReturnTypeRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.FunctionDeclaration, {
        getReturnTypeNode: () => undefined,
        isAsync: () => false,
      }),
      {},
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Function declaration')
  })

  it('reports method declaration without return type', () => {
    const result = explicitReturnTypeRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.MethodDeclaration, { getReturnTypeNode: () => undefined }),
      {},
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Method declaration')
  })

  it('does not report arrow function with return type', () => {
    const result = explicitReturnTypeRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.ArrowFunction, { getReturnTypeNode: () => ({}) }),
      {},
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report function declaration with return type', () => {
    const result = explicitReturnTypeRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.FunctionDeclaration, {
        getReturnTypeNode: () => ({}),
        isAsync: () => false,
      }),
      {},
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report async function declaration without return type', () => {
    const result = explicitReturnTypeRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.FunctionDeclaration, {
        getReturnTypeNode: () => undefined,
        isAsync: () => true,
      }),
      {},
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report arrow functions when checkArrowFunctions is false', () => {
    const result = explicitReturnTypeRule.create({ checkArrowFunctions: false })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.ArrowFunction, { getReturnTypeNode: () => undefined }),
      {},
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report function declarations when checkFunctionDeclarations is false', () => {
    const result = explicitReturnTypeRule.create({ checkFunctionDeclarations: false })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.FunctionDeclaration, {
        getReturnTypeNode: () => undefined,
        isAsync: () => false,
      }),
      {},
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report method declarations when checkMethodDeclarations is false', () => {
    const result = explicitReturnTypeRule.create({ checkMethodDeclarations: false })
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!(
      createFunctionNode(SK.MethodDeclaration, { getReturnTypeNode: () => undefined }),
      {},
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('ignores unrelated node kinds', () => {
    const result = explicitReturnTypeRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitNode!({ getKind: () => SK.ExpressionStatement }, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('has correct meta properties', () => {
    expect(explicitReturnTypeRule.meta.name).toBe('explicit-return-type')
    expect(explicitReturnTypeRule.meta.category).toBe('style')
    expect(explicitReturnTypeRule.defaultOptions.checkArrowFunctions).toBe(true)
    expect(explicitReturnTypeRule.defaultOptions.checkFunctionDeclarations).toBe(true)
    expect(explicitReturnTypeRule.defaultOptions.checkMethodDeclarations).toBe(true)
  })
})

// ─── Section: no-implicit-coercion ───

function createPrefixUnaryNode(
  operator: number,
  operand: MockNode,
  overrides: MockNode = {},
): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 6,
    getKind: () => SK.PrefixUnaryExpression,
    getOperand: () => operand,
    getOperatorToken: () => operator,
    getSourceFile: () => sf,
    getStart: () => 0,
    ...overrides,
  }
}

function createBinaryNode(
  operatorKind: number,
  left: MockNode,
  right: MockNode,
  overrides: MockNode = {},
): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 10,
    getKind: () => SK.BinaryExpression,
    getLeft: () => left,
    getOperatorToken: () => ({ getKind: () => operatorKind }),
    getRight: () => right,
    getSourceFile: () => sf,
    getStart: () => 0,
    ...overrides,
  }
}

describe('no-implicit-coercion rule', () => {
  it('reports double bang !!x', () => {
    const result = noImplicitCoercionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const innerOperand: MockNode = { getKind: () => SK.ExpressionStatement }
    const innerPrefix: MockNode = {
      getKind: () => SK.PrefixUnaryExpression,
      getOperatorToken: () => SK.ExclamationToken,
      getOperand: () => innerOperand,
    }
    const doubleBang = createPrefixUnaryNode(SK.ExclamationToken, innerPrefix)

    visitor.visitNode!(doubleBang, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('double bang')
    expect(violations[0]!.ruleId).toBe('no-implicit-coercion')
  })

  it('reports unary plus +x on non-numeric', () => {
    const result = noImplicitCoercionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const operand: MockNode = { getKind: () => SK.ExpressionStatement }
    const unaryPlus = createPrefixUnaryNode(SK.PlusToken, operand)

    visitor.visitNode!(unaryPlus, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('unary plus')
  })

  it('does not report unary plus on numeric literal', () => {
    const result = noImplicitCoercionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const operand: MockNode = { getKind: () => SK.NumericLiteral }
    const unaryPlus = createPrefixUnaryNode(SK.PlusToken, operand)

    visitor.visitNode!(unaryPlus, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports string concatenation x + ""', () => {
    const result = noImplicitCoercionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.ExpressionStatement }
    const right: MockNode = {
      getKind: () => SK.StringLiteral,
      getLiteralText: () => '',
    }
    const binary = createBinaryNode(SK.PlusToken, left, right)

    visitor.visitNode!(binary, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('string concatenation')
  })

  it('reports string concatenation "" + x', () => {
    const result = noImplicitCoercionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = {
      getKind: () => SK.StringLiteral,
      getLiteralText: () => '',
    }
    const right: MockNode = { getKind: () => SK.ExpressionStatement }
    const binary = createBinaryNode(SK.PlusToken, left, right)

    visitor.visitNode!(binary, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('string concatenation')
  })

  it('reports numeric coercion x * 1', () => {
    const result = noImplicitCoercionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.ExpressionStatement }
    const right: MockNode = {
      getKind: () => SK.NumericLiteral,
      getLiteralValue: () => 1,
    }
    const binary = createBinaryNode(SK.AsteriskToken, left, right)

    visitor.visitNode!(binary, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('multiplication by 1')
  })

  it('reports numeric coercion 1 * x', () => {
    const result = noImplicitCoercionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = {
      getKind: () => SK.NumericLiteral,
      getLiteralValue: () => 1,
    }
    const right: MockNode = { getKind: () => SK.ExpressionStatement }
    const binary = createBinaryNode(SK.AsteriskToken, left, right)

    visitor.visitNode!(binary, {})

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not report double bang when allowDoubleBang is true', () => {
    const result = noImplicitCoercionRule.create({ allowDoubleBang: true })
    const visitor = looseVisitor(result.visitor)

    const innerPrefix: MockNode = {
      getKind: () => SK.PrefixUnaryExpression,
      getOperatorToken: () => SK.ExclamationToken,
      getOperand: () => ({}),
    }
    const doubleBang = createPrefixUnaryNode(SK.ExclamationToken, innerPrefix)

    visitor.visitNode!(doubleBang, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report string concat when allowStringConcat is true', () => {
    const result = noImplicitCoercionRule.create({ allowStringConcat: true })
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.ExpressionStatement }
    const right: MockNode = {
      getKind: () => SK.StringLiteral,
      getLiteralText: () => '',
    }
    const binary = createBinaryNode(SK.PlusToken, left, right)

    visitor.visitNode!(binary, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report numeric coercion when allowNumericConcat is true', () => {
    const result = noImplicitCoercionRule.create({ allowNumericConcat: true })
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.ExpressionStatement }
    const right: MockNode = {
      getKind: () => SK.NumericLiteral,
      getLiteralValue: () => 1,
    }
    const binary = createBinaryNode(SK.AsteriskToken, left, right)

    visitor.visitNode!(binary, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('has correct meta properties', () => {
    expect(noImplicitCoercionRule.meta.name).toBe('no-implicit-coercion')
    expect(noImplicitCoercionRule.meta.category).toBe('style')
    expect(noImplicitCoercionRule.meta.fixable).toBe('code')
    expect(noImplicitCoercionRule.defaultOptions.allowDoubleBang).toBe(false)
    expect(noImplicitCoercionRule.defaultOptions.allowUnaryPlus).toBe(false)
    expect(noImplicitCoercionRule.defaultOptions.allowStringConcat).toBe(false)
    expect(noImplicitCoercionRule.defaultOptions.allowNumericConcat).toBe(false)
  })
})

// ─── Section: no-unnecessary-condition ───

function createComparisonNode(
  operatorKind: number,
  operatorText: string,
  left: MockNode,
  right: MockNode,
): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 10,
    getKind: () => SK.BinaryExpression,
    getLeft: () => left,
    getOperatorToken: () => ({ getKind: () => operatorKind, getText: () => operatorText }),
    getRight: () => right,
    getSourceFile: () => sf,
    getStart: () => 0,
  }
}

function createNumericLiteralOperand(value: number, text?: string): MockNode {
  return {
    getKind: () => SK.NumericLiteral,
    getLiteralValue: () => value,
    getText: () => text ?? String(value),
  }
}

function createStringLiteralOperand(value: string): MockNode {
  return {
    getKind: () => SK.StringLiteral,
    getLiteralText: () => value,
    getText: () => `"${value}"`,
  }
}

function createBooleanLiteralOperand(kind: number, text: string): MockNode {
  return {
    getKind: () => kind,
    getText: () => text,
  }
}

describe('no-unnecessary-condition rule', () => {
  it('reports 1 === 1 as always true', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.EqualsEqualsEqualsToken,
      '===',
      createNumericLiteralOperand(1),
      createNumericLiteralOperand(1),
    )

    visitor.visitNode!(node, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('always true')
    expect(violations[0]!.ruleId).toBe('no-unnecessary-condition')
  })

  it('reports 1 === 2 as always false', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.EqualsEqualsEqualsToken,
      '===',
      createNumericLiteralOperand(1),
      createNumericLiteralOperand(2),
    )

    visitor.visitNode!(node, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('always false')
  })

  it('reports "a" === "a" as always true', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.EqualsEqualsEqualsToken,
      '===',
      createStringLiteralOperand('a'),
      createStringLiteralOperand('a'),
    )

    visitor.visitNode!(node, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('always true')
  })

  it('reports true === false as always false', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.EqualsEqualsEqualsToken,
      '===',
      createBooleanLiteralOperand(SK.TrueKeyword, 'true'),
      createBooleanLiteralOperand(SK.FalseKeyword, 'false'),
    )

    visitor.visitNode!(node, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('always false')
  })

  it('reports 5 > 3 as always true', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.GreaterThanToken,
      '>',
      createNumericLiteralOperand(5),
      createNumericLiteralOperand(3),
    )

    visitor.visitNode!(node, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('always true')
  })

  it('reports 1 > 5 as always false', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.GreaterThanToken,
      '>',
      createNumericLiteralOperand(1),
      createNumericLiteralOperand(5),
    )

    visitor.visitNode!(node, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('always false')
  })

  it('does not report variable comparisons (non-literal)', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const left: MockNode = { getKind: () => SK.ExpressionStatement, getText: () => 'x' }
    const right = createNumericLiteralOperand(5)
    const node = createComparisonNode(SK.EqualsEqualsEqualsToken, '===', left, right)

    visitor.visitNode!(node, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when checkConstantConditions is false', () => {
    const result = noUnnecessaryConditionRule.create({ checkConstantConditions: false })
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.EqualsEqualsEqualsToken,
      '===',
      createNumericLiteralOperand(1),
      createNumericLiteralOperand(1),
    )

    visitor.visitNode!(node, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports !== comparison: 1 !== 2 as always true', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const node = createComparisonNode(
      SK.ExclamationEqualsEqualsToken,
      '!==',
      createNumericLiteralOperand(1),
      createNumericLiteralOperand(2),
    )

    visitor.visitNode!(node, {})

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('always true')
  })

  it('ignores non-comparison binary expressions', () => {
    const result = noUnnecessaryConditionRule.create({})
    const visitor = looseVisitor(result.visitor)

    const sf = createSourceFileMock()
    const node: MockNode = {
      getEnd: () => 10,
      getKind: () => SK.BinaryExpression,
      getLeft: () => createNumericLiteralOperand(1),
      getOperatorToken: () => ({ getKind: () => SK.PlusToken, getText: () => '+' }),
      getRight: () => createNumericLiteralOperand(2),
      getSourceFile: () => sf,
      getStart: () => 0,
    }

    visitor.visitNode!(node, {})

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('has correct meta properties', () => {
    expect(noUnnecessaryConditionRule.meta.name).toBe('no-unnecessary-condition')
    expect(noUnnecessaryConditionRule.meta.category).toBe('style')
    expect(noUnnecessaryConditionRule.defaultOptions.checkConstantConditions).toBe(true)
  })
})
