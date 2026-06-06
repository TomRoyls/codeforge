import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryLogicalOrFalseRule } from '../../../../src/rules/patterns/no-unnecessary-logical-or-false.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '[]',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function makeBinaryExpr(
  operator: string,
  left: unknown,
  right: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeFalseLiteral(): unknown {
  return { type: 'BooleanLiteral', value: false }
}

function makeTrueLiteral(): unknown {
  return { type: 'BooleanLiteral', value: true }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function makeCallExpr(calleeName: string, args: unknown[] = []): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
  }
}

function makeNumberLiteral(value: number): unknown {
  return { type: 'Literal', value }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-logical-or-false rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryLogicalOrFalseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryLogicalOrFalseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryLogicalOrFalseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryLogicalOrFalseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryLogicalOrFalseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning logical OR with false', () => {
      const desc = noUnnecessaryLogicalOrFalseRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/\|\|/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryLogicalOrFalseRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-logical-or-false.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryLogicalOrFalseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryLogicalOrFalseRule).toBeDefined()
      expect(noUnnecessaryLogicalOrFalseRule.meta).toBeDefined()
      expect(noUnnecessaryLogicalOrFalseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary || false', () => {
    test('reports for identifier || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for function call || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeCallExpr('foo'), makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const memberExpr = { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('prop') }
      visitor.BinaryExpression(makeBinaryExpr('||', memberExpr, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for a && b || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const left = makeBinaryExpr('&&', makeIdentifier('a'), makeIdentifier('b'))
      visitor.BinaryExpression(makeBinaryExpr('||', left, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for nested binary a + b || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const left = makeBinaryExpr('+', makeIdentifier('a'), makeIdentifier('b'))
      visitor.BinaryExpression(makeBinaryExpr('||', left, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for call with args || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const call = makeCallExpr('getValue', [makeIdentifier('arg')])
      visitor.BinaryExpression(makeBinaryExpr('||', call, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric literal || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeNumberLiteral(0), makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeStringLiteral('hello'), makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for array expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const arr = { type: 'ArrayExpression', elements: [] }
      visitor.BinaryExpression(makeBinaryExpr('||', arr, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for object expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const obj = { type: 'ObjectExpression', properties: [] }
      visitor.BinaryExpression(makeBinaryExpr('||', obj, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('report message mentions || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports[0].message).toMatch(/\|\| false/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports[0].message).toBe(
        'Unnecessary `|| false`. Falsy values already coerce to false. Remove the `|| false`.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const node = makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral())
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral(), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('y'), makeFalseLiteral()))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('||', makeCallExpr('fn'), makeFalseLiteral()))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for conditional expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const cond = { type: 'ConditionalExpression', test: makeIdentifier('a'), consequent: makeIdentifier('b'), alternate: makeIdentifier('c') }
      visitor.BinaryExpression(makeBinaryExpr('||', cond, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for unary expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: makeIdentifier('x') }
      visitor.BinaryExpression(makeBinaryExpr('||', unary, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const tmpl = { type: 'TemplateLiteral', quasis: [], expressions: [] }
      visitor.BinaryExpression(makeBinaryExpr('||', tmpl, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const typeofExpr = { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: makeIdentifier('x') }
      visitor.BinaryExpression(makeBinaryExpr('||', typeofExpr, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for null literal || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const nullLit = { type: 'NullLiteral', value: null }
      visitor.BinaryExpression(makeBinaryExpr('||', nullLit, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for grouped expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const inner = makeBinaryExpr('===', makeIdentifier('a'), makeIdentifier('b'))
      visitor.BinaryExpression(makeBinaryExpr('||', inner, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for logical AND chain || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const andExpr = makeBinaryExpr('&&', makeIdentifier('a'), makeIdentifier('b'))
      const nestedAnd = makeBinaryExpr('&&', andExpr, makeIdentifier('c'))
      visitor.BinaryExpression(makeBinaryExpr('||', nestedAnd, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for function expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const fn = { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }
      visitor.BinaryExpression(makeBinaryExpr('||', fn, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for arrow function || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }
      visitor.BinaryExpression(makeBinaryExpr('||', arrow, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for new expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [] }
      visitor.BinaryExpression(makeBinaryExpr('||', newExpr, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for spread element || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const spread = { type: 'SpreadElement', argument: makeIdentifier('arr') }
      visitor.BinaryExpression(makeBinaryExpr('||', spread, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const assign = { type: 'AssignmentExpression', operator: '=', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.BinaryExpression(makeBinaryExpr('||', assign, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for this expression || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const thisExpr = { type: 'ThisExpression' }
      visitor.BinaryExpression(makeBinaryExpr('||', thisExpr, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for boolean literal true on left || false on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeTrueLiteral(), makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for boolean literal false on left || false on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeFalseLiteral(), makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for regex literal || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const regex = { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }
      visitor.BinaryExpression(makeBinaryExpr('||', regex, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for nested call chain || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const innerCall = { type: 'CallExpression', callee: { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('method') }, arguments: [] }
      visitor.BinaryExpression(makeBinaryExpr('||', innerCall, makeFalseLiteral()))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for x || true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeTrueLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x && false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('&&', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || y (no boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x + y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x - y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('-', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x * y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('*', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x !== y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x > y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x < y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x ?? false (nullish coalescing)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x && true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('&&', makeIdentifier('x'), makeTrueLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeNumberLiteral(0)))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const nullLit = { type: 'NullLiteral', value: null }
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), nullLit))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeStringLiteral('')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || "something"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeStringLiteral('something')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeNumberLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '||', left: makeIdentifier('x'), loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '||', left: makeIdentifier('x'), right: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '||', left: makeIdentifier('x'), right: 'false', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is a regular Literal (not BooleanLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), { type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report when right is BooleanLiteral with value true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeTrueLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const undef = { type: 'Identifier', name: 'undefined' }
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), undef))
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is && even with false on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('&&', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is ?? even with false on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('??', makeIdentifier('x'), makeFalseLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x || (some complex expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const complex = makeBinaryExpr('+', makeIdentifier('a'), makeIdentifier('b'))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), complex))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (12) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryLogicalOrFalseRule.create(ctx1)
      const visitor2 = noUnnecessaryLogicalOrFalseRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      visitor2.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeTrueLiteral()))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeTrueLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('y'), makeFalseLiteral()))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: makeIdentifier('x'),
        right: makeFalseLiteral(),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: makeIdentifier('x'),
        right: makeFalseLiteral(),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeTrueLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('&&', makeIdentifier('x'), makeFalseLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('y'), makeFalseLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('z'), makeIdentifier('w')))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryLogicalOrFalseRule.create(context)
      const visitor2 = noUnnecessaryLogicalOrFalseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryLogicalOrFalseRule.meta
      const meta2 = noUnnecessaryLogicalOrFalseRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '||',
        left: makeIdentifier('x'),
        right: makeFalseLiteral(),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '||',
        left: makeIdentifier('x'),
        right: makeFalseLiteral(),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '||',
        left: makeIdentifier('x'),
        right: makeFalseLiteral(),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      const node = makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral())
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLogicalOrFalseRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdentifier('x'), makeFalseLiteral(), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})
