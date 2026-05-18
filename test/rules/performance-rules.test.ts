import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { noArrayReduceRule } from '../../src/rules/performance/no-array-reduce.js'
import { noInefficientArrayMethodsRule } from '../../src/rules/performance/no-inefficient-array-methods.js'
import { noInefficientStringConcatRule } from '../../src/rules/performance/no-inefficient-string-concat.js'
import { noMisusedPromiseReturnRule } from '../../src/rules/performance/no-misused-promise-return.js'

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

function identifier(name: string, line = 1, column = 0) {
  return withLoc({ name, type: 'Identifier' }, line, column)
}

function literal(value: unknown, line = 1, column = 0) {
  return withLoc({ type: 'Literal', value }, line, column)
}

function memberExpr(
  object: Record<string, unknown>,
  property: Record<string, unknown>,
  computed = false,
  line = 1,
  column = 0,
) {
  return withLoc({ computed, object, property, type: 'MemberExpression' }, line, column)
}

function callExpr(
  callee: Record<string, unknown>,
  args: Record<string, unknown>[] = [],
  line = 1,
  column = 0,
) {
  return withLoc({ arguments: args, callee, type: 'CallExpression' }, line, column)
}

function newExpr(
  callee: Record<string, unknown>,
  args: Record<string, unknown>[] = [],
  line = 1,
  column = 0,
) {
  return withLoc({ arguments: args, callee, type: 'NewExpression' }, line, column)
}

function arrowFunction(
  body: Record<string, unknown>,
  params: Record<string, unknown>[] = [],
  line = 1,
  column = 0,
) {
  return withLoc({ body, expression: false, params, type: 'ArrowFunctionExpression' }, line, column)
}

function blockStmt(body: Record<string, unknown>[], line = 1, column = 0) {
  return withLoc({ body, type: 'BlockStatement' }, line, column)
}

function exprStmt(expression: Record<string, unknown>, line = 1, column = 0) {
  return withLoc({ expression, type: 'ExpressionStatement' }, line, column)
}

function assignmentExpr(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  operator = '=',
  line = 1,
  column = 0,
) {
  return withLoc({ left, operator, right, type: 'AssignmentExpression' }, line, column)
}

function binaryExpr(
  operator: string,
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({ left, operator, right, type: 'BinaryExpression' }, line, column)
}

function unaryExpr(
  operator: string,
  argument: Record<string, unknown>,
  prefix = true,
  line = 1,
  column = 0,
) {
  return withLoc({ argument, operator, prefix, type: 'UnaryExpression' }, line, column)
}

function forStatement(
  body: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({
    body,
    init: null,
    test: null,
    type: 'ForStatement',
    update: null,
  }, line, column)
}

function forOfStatement(
  body: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({
    body,
    left: identifier('x'),
    right: identifier('items'),
    type: 'ForOfStatement',
  }, line, column)
}

function whileStatement(
  body: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({
    body,
    test: identifier('cond'),
    type: 'WhileStatement',
  }, line, column)
}

function doWhileStatement(
  body: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({
    body,
    test: identifier('cond'),
    type: 'DoWhileStatement',
  }, line, column)
}

function returnStmt(
  argument: Record<string, unknown> | null,
  line = 1,
  column = 0,
) {
  return withLoc({
    argument,
    type: 'ReturnStatement',
  }, line, column)
}

function functionExpr(
  body: Record<string, unknown>,
  async = false,
  line = 1,
  column = 0,
) {
  return withLoc({
    async,
    body,
    id: null,
    params: [],
    type: 'FunctionExpression',
  }, line, column)
}

// ─── no-array-reduce ───

describe('no-array-reduce rule', () => {
  it('reports arr.reduce() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('reduce')),
        [arrowFunction(blockStmt([]))],
      ),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('reduce')
  })

  it('reports chained reduce on member expression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(
          callExpr(memberExpr(identifier('data'), identifier('filter'))),
          identifier('reduce'),
        ),
        [arrowFunction(blockStmt([]))],
      ),
    )

    expect(reports).toHaveLength(1)
  })

  it('does not report map() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('map')),
        [arrowFunction(identifier('x'))],
      ),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report direct function call (non-member callee)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(identifier('reduce'), [literal(0)]),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report computed member access', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), literal('reduce'), true),
        [arrowFunction(blockStmt([]))],
      ),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report reduce with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('reduce')),
        [],
      ),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report when property is not an Identifier', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), literal('reduce'), true),
        [arrowFunction(blockStmt([]))],
      ),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports multiple reduce calls independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('a'), identifier('reduce')), [literal(0)], 1, 0),
    )
    visitor.CallExpression!(
      callExpr(memberExpr(identifier('b'), identifier('reduce')), [literal(0)], 3, 5),
    )

    expect(reports).toHaveLength(2)
  })

  it('captures correct location in report', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noArrayReduceRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('reduce')),
        [arrowFunction(blockStmt([]))],
        7,
        12,
      ),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 13, line: 7 },
      start: { column: 12, line: 7 },
    })
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noArrayReduceRule.meta.docs?.category).toBe('performance')
    expect(noArrayReduceRule.meta.severity).toBe('warn')
    expect(noArrayReduceRule.meta.type).toBe('suggestion')
  })
})

// ─── no-inefficient-array-methods ───

describe('no-inefficient-array-methods rule', () => {
  // ─── forEach + push pattern ───

  it('reports forEach with arrow function pushing to array', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const pushCall = callExpr(
      memberExpr(identifier('result'), identifier('push')),
      [identifier('x')],
    )
    const callback = arrowFunction(blockStmt([exprStmt(pushCall)]))

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('arr'), identifier('forEach')), [callback]),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('forEach')
    expect(reports[0]!.message).toContain('map')
  })

  it('reports forEach with function expression pushing to array', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const pushCall = callExpr(
      memberExpr(identifier('result'), identifier('push')),
      [identifier('x')],
    )
    const callback = withLoc({
      body: blockStmt([exprStmt(pushCall)]),
      id: null,
      params: [identifier('x')],
      type: 'FunctionExpression',
    })

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('arr'), identifier('forEach')), [callback]),
    )

    expect(reports).toHaveLength(1)
  })

  it('does not report forEach without callback', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('arr'), identifier('forEach')), []),
    )

    expect(reports).toHaveLength(0)
  })

  // ─── filter with negated callback ───

  it('reports filter with negated arrow function body', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const negated = unaryExpr('!', identifier('x'))
    const callback = arrowFunction(negated)

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('arr'), identifier('filter')), [callback]),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('filter')
    expect(reports[0]!.message).toContain('negated')
  })

  it('reports filter with negated function expression body', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const negated = unaryExpr('!', identifier('x'))
    const callback = withLoc({
      body: negated,
      id: null,
      params: [identifier('x')],
      type: 'FunctionExpression',
    })

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('arr'), identifier('filter')), [callback]),
    )

    expect(reports).toHaveLength(1)
  })

  it('does not report filter with positive condition', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const callback = arrowFunction(identifier('x'))

    visitor.CallExpression!(
      callExpr(memberExpr(identifier('arr'), identifier('filter')), [callback]),
    )

    expect(reports).toHaveLength(0)
  })

  // ─── splice(indexOf, 1) pattern ───

  it('reports splice(arr.indexOf(x), 1) pattern', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const indexOfCall = memberExpr(identifier('arr'), identifier('indexOf'))

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('splice')),
        [indexOfCall, literal(1)],
      ),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('splice')
    expect(reports[0]!.message).toContain('filter')
  })

  it('does not report splice with different second argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const indexOfCall = memberExpr(identifier('arr'), identifier('indexOf'))

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('splice')),
        [indexOfCall, literal(3)],
      ),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report splice with non-indexOf first argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('splice')),
        [literal(0), literal(1)],
      ),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report splice with more than 2 arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    const indexOfCall = memberExpr(identifier('arr'), identifier('indexOf'))

    visitor.CallExpression!(
      callExpr(
        memberExpr(identifier('arr'), identifier('splice')),
        [indexOfCall, literal(1), identifier('newItem')],
      ),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report non-array method calls', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientArrayMethodsRule.create(context)

    visitor.CallExpression!(
      callExpr(identifier('fn'), [literal(1)]),
    )

    expect(reports).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noInefficientArrayMethodsRule.meta.docs?.category).toBe('performance')
    expect(noInefficientArrayMethodsRule.meta.severity).toBe('warn')
    expect(noInefficientArrayMethodsRule.meta.type).toBe('suggestion')
  })
})

// ─── no-inefficient-string-concat ───

describe('no-inefficient-string-concat rule', () => {
  it('reports += string concat in for loop body (block statement)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const concat = assignmentExpr(identifier('str'), literal('world'), '+=')
    const body = blockStmt([exprStmt(concat)])
    const loop = forStatement(body)

    visitor.ForStatement!(loop)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('String concatenation')
    expect(reports[0]!.message).toContain('.join()')
  })

  it('reports += string concat in for...of loop', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const concat = assignmentExpr(identifier('str'), literal('item'), '+=')
    const body = blockStmt([exprStmt(concat)])
    const loop = forOfStatement(body)

    visitor.ForOfStatement!(loop)

    expect(reports).toHaveLength(1)
  })

  it('reports += string concat in while loop', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const concat = assignmentExpr(identifier('s'), literal('x'), '+=')
    const body = blockStmt([exprStmt(concat)])
    const loop = whileStatement(body)

    visitor.WhileStatement!(loop)

    expect(reports).toHaveLength(1)
  })

  it('reports += string concat in do-while loop', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const concat = assignmentExpr(identifier('s'), literal('x'), '+=')
    const body = blockStmt([exprStmt(concat)])
    const loop = doWhileStatement(body)

    visitor.DoWhileStatement!(loop)

    expect(reports).toHaveLength(1)
  })

  it('reports = assignment with string literal right side in loop', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const concat = assignmentExpr(identifier('s'), literal('hello'), '=')
    const body = blockStmt([exprStmt(concat)])
    const loop = forStatement(body)

    visitor.ForStatement!(loop)

    expect(reports).toHaveLength(1)
  })

  it('reports = assignment with binary + expression right side', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const plusExpr = binaryExpr('+', identifier('s'), identifier('part'))
    const concat = assignmentExpr(identifier('s'), plusExpr, '=')
    const body = blockStmt([exprStmt(concat)])
    const loop = forStatement(body)

    visitor.ForStatement!(loop)

    expect(reports).toHaveLength(1)
  })

  it('does not report loop without string concatenation', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const safeCall = callExpr(identifier('process'), [identifier('item')])
    const body = blockStmt([exprStmt(safeCall)])
    const loop = forStatement(body)

    visitor.ForStatement!(loop)

    expect(reports).toHaveLength(0)
  })

  it('does not report += with number literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const numConcat = assignmentExpr(identifier('sum'), literal(1), '+=')
    const body = blockStmt([exprStmt(numConcat)])
    const loop = forStatement(body)

    visitor.ForStatement!(loop)

    expect(reports).toHaveLength(0)
  })

  it('does not report += with non-+ binary operator', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const minusExpr = binaryExpr('-', identifier('total'), literal(1))
    const concat = assignmentExpr(identifier('total'), minusExpr, '+=')
    const body = blockStmt([exprStmt(concat)])
    const loop = forStatement(body)

    visitor.ForStatement!(loop)

    expect(reports).toHaveLength(0)
  })

  it('reports only first string concat in loop (returns early)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noInefficientStringConcatRule.create(context)

    const concat1 = assignmentExpr(identifier('a'), literal('x'), '+=')
    const concat2 = assignmentExpr(identifier('b'), literal('y'), '+=')
    const body = blockStmt([exprStmt(concat1), exprStmt(concat2)])
    const loop = forStatement(body)

    visitor.ForStatement!(loop)

    expect(reports).toHaveLength(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noInefficientStringConcatRule.meta.docs?.category).toBe('performance')
    expect(noInefficientStringConcatRule.meta.severity).toBe('warn')
    expect(noInefficientStringConcatRule.meta.type).toBe('suggestion')
  })
})

// ─── no-misused-promise-return ───

describe('no-misused-promise-return rule', () => {
  it('reports return new Promise in async arrow function', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const promiseNew = newExpr(identifier('Promise'), [arrowFunction(blockStmt([]))])
    const parent = withLoc({ async: true, body: [], params: [], type: 'ArrowFunctionExpression' })
    const ret = returnStmt(promiseNew)
    ;(ret as Record<string, unknown>)._parent = parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Promise')
    expect(reports[0]!.message).toContain('async')
  })

  it('reports return new Promise in async FunctionDeclaration', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const promiseNew = newExpr(identifier('Promise'), [arrowFunction(blockStmt([]))])
    const parent = withLoc({ async: true, body: [], id: identifier('fn'), params: [], type: 'FunctionDeclaration' })
    const ret = returnStmt(promiseNew)
    ;(ret as Record<string, unknown>)._parent = parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(1)
  })

  it('reports return new Promise in async FunctionExpression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const promiseNew = newExpr(identifier('Promise'), [arrowFunction(blockStmt([]))])
    const parent = withLoc({ async: true, body: [], id: null, params: [], type: 'FunctionExpression' })
    const ret = returnStmt(promiseNew)
    ;(ret as Record<string, unknown>)._parent = parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(1)
  })

  it('does not report return new Promise in non-async function', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const promiseNew = newExpr(identifier('Promise'), [arrowFunction(blockStmt([]))])
    const parent = withLoc({ async: false, body: [], id: null, params: [], type: 'FunctionExpression' })
    const ret = returnStmt(promiseNew)
    ;(ret as Record<string, unknown>)._parent = parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(0)
  })

  it('does not report return without argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const ret = returnStmt(null)
    ;(ret as Record<string, unknown>)._parent = withLoc({ async: true, body: [], params: [], type: 'ArrowFunctionExpression' })

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(0)
  })

  it('does not report return of non-Promise new expression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const otherNew = newExpr(identifier('MyClass'), [])
    const parent = withLoc({ async: true, body: [], params: [], type: 'ArrowFunctionExpression' })
    const ret = returnStmt(otherNew)
    ;(ret as Record<string, unknown>)._parent = parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(0)
  })

  it('does not report return of non-new expression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const ret = returnStmt(identifier('value'))
    ;(ret as Record<string, unknown>)._parent = withLoc({ async: true, body: [], params: [], type: 'ArrowFunctionExpression' })

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(0)
  })

  it('does not report when parent is not a function', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const promiseNew = newExpr(identifier('Promise'), [arrowFunction(blockStmt([]))])
    const parent = withLoc({ body: [], type: 'BlockStatement' })
    const ret = returnStmt(promiseNew)
    ;(ret as Record<string, unknown>)._parent = parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(0)
  })

  it('does not report when there is no parent', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const promiseNew = newExpr(identifier('Promise'), [arrowFunction(blockStmt([]))])
    const ret = returnStmt(promiseNew)
    // Deliberately not setting _parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(0)
  })

  it('does not report new Promise with non-Identifier callee', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const promiseNew = newExpr(
      memberExpr(identifier('lib'), identifier('Promise')),
      [arrowFunction(blockStmt([]))],
    )
    const parent = withLoc({ async: true, body: [], params: [], type: 'ArrowFunctionExpression' })
    const ret = returnStmt(promiseNew)
    ;(ret as Record<string, unknown>)._parent = parent

    visitor.ReturnStatement!(ret)

    expect(reports).toHaveLength(0)
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noMisusedPromiseReturnRule.create(context)

    const parent = withLoc({ async: true, body: [], params: [], type: 'ArrowFunctionExpression' })

    for (let i = 0; i < 3; i++) {
      const promiseNew = newExpr(identifier('Promise'), [arrowFunction(blockStmt([]))], i + 1, 0)
      const ret = returnStmt(promiseNew, i + 1, 0)
      ;(ret as Record<string, unknown>)._parent = parent
      visitor.ReturnStatement!(ret)
    }

    expect(reports).toHaveLength(3)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noMisusedPromiseReturnRule.meta.docs?.category).toBe('performance')
    expect(noMisusedPromiseReturnRule.meta.severity).toBe('warn')
    expect(noMisusedPromiseReturnRule.meta.type).toBe('suggestion')
  })
})
