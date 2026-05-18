import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { curlyRule } from '../../src/rules/patterns/curly.js'
import { defaultCaseRule } from '../../src/rules/patterns/default-case.js'
import { eqEqEqRule } from '../../src/rules/patterns/eq-eq-eq.js'
import { getterReturnRule } from '../../src/rules/patterns/getter-return.js'
import { noAlertRule } from '../../src/rules/patterns/no-alert.js'

// ─── Mock context factory ───

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

// ─── Synthetic node helpers ───

function withLoc(node: Record<string, unknown>, line = 1, column = 0) {
  return {
    ...node,
    loc: {
      end: { column: column + 1, line },
      start: { column, line },
    },
  }
}

function withRange(node: Record<string, unknown>, start: number, end: number) {
  return { ...node, range: [start, end] as [number, number] }
}

function binaryExpr(
  operator: string,
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc(
    {
      left,
      operator,
      right,
      type: 'BinaryExpression',
    },
    line,
    column,
  )
}

function identifier(name: string): Record<string, unknown> {
  return { name, type: 'Identifier' }
}

function literal(value: unknown): Record<string, unknown> {
  return { type: 'Literal', value }
}

function callExpr(callee: Record<string, unknown>, args: Record<string, unknown>[] = [], line = 1, column = 0) {
  return withLoc(
    {
      arguments: args,
      callee,
      type: 'CallExpression',
    },
    line,
    column,
  )
}

function memberExpr(object: Record<string, unknown>, property: Record<string, unknown>): Record<string, unknown> {
  return {
    object,
    property,
    type: 'MemberExpression',
  }
}

function blockStmt(body: Record<string, unknown[]>, line = 1, column = 0) {
  return withLoc(
    {
      body: body as unknown as Record<string, unknown>[],
      type: 'BlockStatement',
    },
    line,
    column,
  )
}

function ifStmt(consequent: Record<string, unknown>, alternate?: Record<string, unknown>, line = 1, column = 0) {
  return withLoc(
    {
      alternate: alternate ?? null,
      consequent,
      test: identifier('x'),
      type: 'IfStatement',
    },
    line,
    column,
  )
}

function forStmt(body: Record<string, unknown>, line = 1, column = 0) {
  return withLoc(
    {
      body,
      init: null,
      test: null,
      type: 'ForStatement',
      update: null,
    },
    line,
    column,
  )
}

function whileStmt(body: Record<string, unknown>, line = 1, column = 0) {
  return withLoc(
    {
      body,
      test: identifier('true'),
      type: 'WhileStatement',
    },
    line,
    column,
  )
}

function doWhileStmt(body: Record<string, unknown>, line = 1, column = 0) {
  return withLoc(
    {
      body,
      test: identifier('true'),
      type: 'DoWhileStatement',
    },
    line,
    column,
  )
}

function withStmt(body: Record<string, unknown>, line = 1, column = 0) {
  return withLoc(
    {
      body,
      object: identifier('obj'),
      type: 'WithStatement',
    },
    line,
    column,
  )
}

function switchStmt(cases: Record<string, unknown>[], line = 1, column = 0) {
  return withLoc(
    {
      cases,
      discriminant: identifier('x'),
      type: 'SwitchStatement',
    },
    line,
    column,
  )
}

function switchCase(test: Record<string, unknown> | null, consequent: Record<string, unknown>[] = []): Record<string, unknown> {
  return { consequent, test, type: 'SwitchCase' }
}

function returnStmt(argument?: Record<string, unknown>): Record<string, unknown> {
  return { argument: argument ?? null, type: 'ReturnStatement' }
}

function funcExpr(body: Record<string, unknown>): Record<string, unknown> {
  return { body, type: 'FunctionExpression' }
}

function methodDefinition(kind: string, value: Record<string, unknown>, line = 1, column = 0) {
  return withLoc(
    {
      kind,
      key: identifier('prop'),
      static: false,
      type: 'MethodDefinition',
      value,
    },
    line,
    column,
  )
}

function exprStmt(expression: Record<string, unknown>): Record<string, unknown> {
  return { expression, type: 'ExpressionStatement' }
}

// ─── eq-eq-eq ───

describe('eq-eq-eq rule', () => {
  it('reports == operator', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('==', identifier('a'), identifier('b')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected '==='")
    expect(reports[0]!.message).toContain("instead saw '=='")
  })

  it('reports != operator', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('!=', identifier('a'), identifier('b')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected '!=='")
    expect(reports[0]!.message).toContain("instead saw '!='")
  })

  it('does not report === operator', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('===', identifier('a'), identifier('b')))

    expect(reports).toHaveLength(0)
  })

  it('does not report !== operator', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('!==', identifier('a'), identifier('b')))

    expect(reports).toHaveLength(0)
  })

  it('does not report other binary operators', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    for (const op of ['<', '>', '<=', '>=', '+', '-', '*', '/', '%', 'in', 'instanceof']) {
      visitor.BinaryExpression!(binaryExpr(op, identifier('a'), identifier('b')))
    }

    expect(reports).toHaveLength(0)
  })

  it('does not report null == null comparison', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('==', literal(null), literal(null)))

    expect(reports).toHaveLength(0)
  })

  it('does not report null != null comparison', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('!=', literal(null), literal(null)))

    expect(reports).toHaveLength(0)
  })

  it('reports == when comparing null to non-null', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('==', literal(null), identifier('x')))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected '==='")
  })

  it('does not crash on non-BinaryExpression node type', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!({ type: 'Literal', value: 42 })

    expect(reports).toHaveLength(0)
  })

  it('captures location in report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('==', identifier('a'), identifier('b'), 5, 10))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 11, line: 5 },
      start: { column: 10, line: 5 },
    })
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('==', identifier('a'), identifier('b')))
    visitor.BinaryExpression!(binaryExpr('!=', identifier('c'), identifier('d')))
    visitor.BinaryExpression!(binaryExpr('===', identifier('e'), identifier('f')))

    expect(reports).toHaveLength(2)
  })

  it('includes suggestion message about strict equality', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = eqEqEqRule.create(context)

    visitor.BinaryExpression!(binaryExpr('==', identifier('a'), identifier('b')))

    expect(reports[0]!.message).toContain('strict equality')
  })

  it('has correct meta properties', () => {
    expect(eqEqEqRule.meta.docs?.category).toBe('patterns')
    expect(eqEqEqRule.meta.docs?.recommended).toBe(true)
    expect(eqEqEqRule.meta.severity).toBe('warn')
    expect(eqEqEqRule.meta.type).toBe('suggestion')
    expect(eqEqEqRule.meta.fixable).toBe('code')
  })
})

// ─── no-alert ───

describe('no-alert rule', () => {
  it('reports alert() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(callExpr(identifier('alert'), [literal('hello')]))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'alert'")
  })

  it('reports confirm() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(callExpr(identifier('confirm'), [literal('Are you sure?')]))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'confirm'")
  })

  it('reports prompt() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(callExpr(identifier('prompt'), [literal('Enter value')]))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'prompt'")
  })

  it('reports window.alert() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('window'), identifier('alert')), [literal('hello')]),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'alert'")
  })

  it('reports globalThis.confirm() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('globalThis'), identifier('confirm')), [literal('ok?')]),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("'confirm'")
  })

  it('does not report console.log() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('console'), identifier('log')), [literal('hello')]),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report arbitrary function call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(callExpr(identifier('myFunction'), [literal('arg')]))

    expect(reports).toHaveLength(0)
  })

  it('does not report member call on non-global object', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('myObj'), identifier('alert')), [literal('test')]),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report empty call expression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(withLoc({ type: 'CallExpression', callee: null, arguments: [] }))

    expect(reports).toHaveLength(0)
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(callExpr(identifier('alert'), []))
    visitor.CallExpression!(callExpr(identifier('confirm'), []))
    visitor.CallExpression!(callExpr(identifier('myFunc'), []))

    expect(reports).toHaveLength(2)
  })

  it('captures location in report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAlertRule.create(context)

    visitor.CallExpression!(callExpr(identifier('alert'), [], 3, 5))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 6, line: 3 },
      start: { column: 5, line: 3 },
    })
  })

  it('has correct meta properties', () => {
    expect(noAlertRule.meta.docs?.category).toBe('patterns')
    expect(noAlertRule.meta.docs?.recommended).toBe(true)
    expect(noAlertRule.meta.severity).toBe('warn')
    expect(noAlertRule.meta.type).toBe('suggestion')
    expect(noAlertRule.meta.fixable).toBeUndefined()
  })
})

// ─── curly ───

describe('curly rule', () => {
  it('reports if statement without block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.IfStatement!(ifStmt(exprStmt(identifier('doSomething'))))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected { after 'if'")
  })

  it('does not report if statement with block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.IfStatement!(ifStmt(blockStmt([exprStmt(identifier('doSomething'))])))

    expect(reports).toHaveLength(0)
  })

  it('reports for statement without block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.ForStatement!(forStmt(exprStmt(identifier('doSomething'))))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected { after 'for'")
  })

  it('does not report for statement with block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.ForStatement!(forStmt(blockStmt([exprStmt(identifier('doSomething'))])))

    expect(reports).toHaveLength(0)
  })

  it('reports while statement without block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.WhileStatement!(whileStmt(exprStmt(identifier('doSomething'))))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected { after 'while'")
  })

  it('does not report while statement with block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.WhileStatement!(whileStmt(blockStmt([exprStmt(identifier('doSomething'))])))

    expect(reports).toHaveLength(0)
  })

  it('reports do-while statement without block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.DoWhileStatement!(doWhileStmt(exprStmt(identifier('doSomething'))))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected { after 'do'")
  })

  it('does not report do-while statement with block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.DoWhileStatement!(doWhileStmt(blockStmt([exprStmt(identifier('doSomething'))])))

    expect(reports).toHaveLength(0)
  })

  it('reports with statement without block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.WithStatement!(withStmt(exprStmt(identifier('doSomething'))))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Expected { after 'with'")
  })

  it('does not report with statement with block', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.WithStatement!(withStmt(blockStmt([exprStmt(identifier('doSomething'))])))

    expect(reports).toHaveLength(0)
  })

  it('reports across multiple statement types independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.IfStatement!(ifStmt(exprStmt(identifier('a'))))
    visitor.ForStatement!(forStmt(blockStmt([exprStmt(identifier('b'))])))
    visitor.WhileStatement!(whileStmt(exprStmt(identifier('c'))))

    expect(reports).toHaveLength(2)
  })

  it('captures location in report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.IfStatement!(ifStmt(exprStmt(identifier('x')), undefined, 7, 2))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 3, line: 7 },
      start: { column: 2, line: 7 },
    })
  })

  it('does not crash on null node', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = curlyRule.create(context)

    visitor.IfStatement!(null)

    expect(reports).toHaveLength(0)
  })

  it('has correct meta properties', () => {
    expect(curlyRule.meta.docs?.category).toBe('style')
    expect(curlyRule.meta.docs?.recommended).toBe(true)
    expect(curlyRule.meta.severity).toBe('warn')
    expect(curlyRule.meta.type).toBe('suggestion')
    expect(curlyRule.meta.fixable).toBe('code')
  })
})

// ─── default-case ───

describe('default-case rule', () => {
  it('reports switch without default case', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([
      switchCase(identifier('a')),
      switchCase(identifier('b')),
    ]))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Expected a default case')
  })

  it('does not report switch with default case', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([
      switchCase(identifier('a')),
      switchCase(null),
    ]))

    expect(reports).toHaveLength(0)
  })

  it('reports switch with only non-default cases', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([
      switchCase(literal(1)),
      switchCase(literal(2)),
      switchCase(literal(3)),
    ]))

    expect(reports).toHaveLength(1)
  })

  it('does not report switch with default case as last case', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([
      switchCase(literal(1)),
      switchCase(literal(2)),
      switchCase(null),
    ]))

    expect(reports).toHaveLength(0)
  })

  it('does not report switch with default case as first case', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([
      switchCase(null),
      switchCase(literal(1)),
    ]))

    expect(reports).toHaveLength(0)
  })

  it('reports switch with empty cases array', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([]))

    expect(reports).toHaveLength(1)
  })

  it('does not report non-SwitchStatement node type', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!({ type: 'Literal', value: 42 })

    expect(reports).toHaveLength(0)
  })

  it('captures location in report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([switchCase(identifier('a'))], 10, 4))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 5, line: 10 },
      start: { column: 4, line: 10 },
    })
  })

  it('reports multiple switches independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = defaultCaseRule.create(context)

    visitor.SwitchStatement!(switchStmt([switchCase(identifier('a'))]))
    visitor.SwitchStatement!(switchStmt([switchCase(null)]))
    visitor.SwitchStatement!(switchStmt([switchCase(identifier('b'))]))

    expect(reports).toHaveLength(2)
  })

  it('has correct meta properties', () => {
    expect(defaultCaseRule.meta.docs?.category).toBe('patterns')
    expect(defaultCaseRule.meta.docs?.recommended).toBe(false)
    expect(defaultCaseRule.meta.severity).toBe('warn')
    expect(defaultCaseRule.meta.type).toBe('suggestion')
    expect(defaultCaseRule.meta.fixable).toBeUndefined()
  })
})

// ─── getter-return ───

describe('getter-return rule', () => {
  it('reports getter with empty body', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(methodDefinition('get', funcExpr(blockStmt([]))))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Getter should return a value')
  })

  it('reports getter with body that has no return statement', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('get', funcExpr(blockStmt([exprStmt(identifier('doSomething'))]))),
    )

    expect(reports).toHaveLength(1)
  })

  it('does not report getter with return statement', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('get', funcExpr(blockStmt([returnStmt(identifier('value'))]))),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report getter with return in if consequent', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    const ifBranch = {
      consequent: returnStmt(identifier('x')),
      test: identifier('cond'),
      type: 'IfStatement',
    }

    visitor.MethodDefinition!(
      methodDefinition('get', funcExpr(blockStmt([ifBranch]))),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report getter with return in if alternate', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    const ifBranch = {
      alternate: returnStmt(identifier('y')),
      consequent: exprStmt(identifier('doSomething')),
      test: identifier('cond'),
      type: 'IfStatement',
    }

    visitor.MethodDefinition!(
      methodDefinition('get', funcExpr(blockStmt([ifBranch]))),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report non-getter method', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('method', funcExpr(blockStmt([]))),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report "set" method', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('set', funcExpr(blockStmt([]))),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report constructor', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('constructor', funcExpr(blockStmt([]))),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports getter with non-FunctionExpression value', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('get', { type: 'ArrowFunctionExpression', body: blockStmt([]) }),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports getter when value is null', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(methodDefinition('get', null))

    expect(reports).toHaveLength(0)
  })

  it('captures location in report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(methodDefinition('get', funcExpr(blockStmt([])), 12, 6))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 7, line: 12 },
      start: { column: 6, line: 12 },
    })
  })

  it('reports multiple getter violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = getterReturnRule.create(context)

    visitor.MethodDefinition!(methodDefinition('get', funcExpr(blockStmt([]))))
    visitor.MethodDefinition!(
      methodDefinition('get', funcExpr(blockStmt([returnStmt(identifier('x'))]))),
    )
    visitor.MethodDefinition!(methodDefinition('get', funcExpr(blockStmt([]))))

    expect(reports).toHaveLength(2)
  })

  it('has correct meta properties', () => {
    expect(getterReturnRule.meta.docs?.category).toBe('patterns')
    expect(getterReturnRule.meta.docs?.recommended).toBe(true)
    expect(getterReturnRule.meta.severity).toBe('error')
    expect(getterReturnRule.meta.type).toBe('problem')
    expect(getterReturnRule.meta.fixable).toBeUndefined()
  })
})
