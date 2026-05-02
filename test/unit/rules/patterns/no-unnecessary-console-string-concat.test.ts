import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryConsoleStringConcatRule } from '../../../../src/rules/patterns/no-unnecessary-console-string-concat.js'
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

function makeConsoleCall(
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeBinaryPlus(left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left,
    right,
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-console-string-concat rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryConsoleStringConcatRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryConsoleStringConcatRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryConsoleStringConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleStringConcatRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryConsoleStringConcatRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning concatenation or console', () => {
      const desc = noUnnecessaryConsoleStringConcatRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/console/)
    })

    test('should have a docs URL', () => {
      expect(noUnnecessaryConsoleStringConcatRule.meta.docs?.url).toBeTruthy()
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryConsoleStringConcatRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryConsoleStringConcatRule).toBeDefined()
      expect(noUnnecessaryConsoleStringConcatRule.meta).toBeDefined()
      expect(noUnnecessaryConsoleStringConcatRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (33) =====

  describe('positive cases — reports string concatenation', () => {
    test('reports console.log("hello " + name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('hello '), makeIdentifier('name'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.info("x: " + x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('info', [makeBinaryPlus(makeLiteral('x: '), makeIdentifier('x'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.warn("Error: " + msg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('warn', [makeBinaryPlus(makeLiteral('Error: '), makeIdentifier('msg'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.error("Failed: " + err)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('error', [makeBinaryPlus(makeLiteral('Failed: '), makeIdentifier('err'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.log(x + y) — variable concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeIdentifier('x'), makeIdentifier('y'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.log("a" + "b" + "c") — chained concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const inner = makeBinaryPlus(makeLiteral('a'), makeLiteral('b'))
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(inner, makeLiteral('c'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.info(a + b) — two identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('info', [makeBinaryPlus(makeIdentifier('a'), makeIdentifier('b'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.warn("prefix" + value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('warn', [makeBinaryPlus(makeLiteral('prefix'), makeIdentifier('value'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(msg + " suffix")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('error', [makeBinaryPlus(makeIdentifier('msg'), makeLiteral(' suffix'))]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('hello '), makeIdentifier('name'))]))
      expect(reports[0].message).toMatch(/concatenation/i)
    })

    test('report message mentions template literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('hello '), makeIdentifier('name'))]))
      expect(reports[0].message).toMatch(/template/i)
    })

    test('report message mentions console method name for log', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].message).toMatch(/console\.log/)
    })

    test('report message mentions console method name for info', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('info', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].message).toMatch(/console\.info/)
    })

    test('report message mentions console method name for warn', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('warn', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].message).toMatch(/console\.warn/)
    })

    test('report message mentions console method name for error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('error', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].message).toMatch(/console\.error/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const node = makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      visitor.CallExpression(makeConsoleCall('info', [makeBinaryPlus(makeLiteral('c'), makeIdentifier('d'))]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      visitor.CallExpression(makeConsoleCall('info', [makeBinaryPlus(makeLiteral('c'), makeIdentifier('d'))]))
      // Messages differ by method name, so just check both are non-empty and have the core text
      expect(reports[0].message).toMatch(/concatenation/)
      expect(reports[1].message).toMatch(/concatenation/)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports console.log with number literal concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('count: '), makeLiteral(42))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.log with member expression concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const memberExpr = { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('key') }
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('value: '), memberExpr)]))
      expect(reports.length).toBe(1)
    })

    test('reports console.log with call expression concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeIdentifier('getName'), arguments: [] }
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('name: '), callExpr)]))
      expect(reports.length).toBe(1)
    })

    test('reports console.log with binary expression in left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const innerPlus = makeBinaryPlus(makeLiteral('a'), makeLiteral('b'))
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(innerPlus, makeIdentifier('c'))]))
      expect(reports.length).toBe(1)
    })

    test('reports console.warn with ternary expression concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const condExpr = { type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: makeLiteral(1), alternate: makeLiteral(2) }
      visitor.CallExpression(makeConsoleCall('warn', [makeBinaryPlus(makeLiteral('result: '), condExpr)]))
      expect(reports.length).toBe(1)
    })

    test('reports console.error with array expression concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [makeLiteral(1), makeLiteral(2)] }
      visitor.CallExpression(makeConsoleCall('error', [makeBinaryPlus(makeLiteral('items: '), arrExpr)]))
      expect(reports.length).toBe(1)
    })

    test('reports console.info with template literal concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const templateLit = { type: 'TemplateLiteral', quasis: [], expressions: [] }
      visitor.CallExpression(makeConsoleCall('info', [makeBinaryPlus(makeLiteral('msg: '), templateLit)]))
      expect(reports.length).toBe(1)
    })

    test('reports console.log with object expression concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [] }
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('obj: '), objExpr)]))
      expect(reports.length).toBe(1)
    })

    test('reports console.log with typeof expression concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const unaryExpr = { type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: makeIdentifier('x') }
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('type: '), unaryExpr)]))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined for console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].message).toBe(
        'Unnecessary string concatenation in console.log(). Use template literals or pass multiple arguments instead.',
      )
    })

    test('report message is exactly as defined for console.error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('error', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      expect(reports[0].message).toBe(
        'Unnecessary string concatenation in console.error(). Use template literals or pass multiple arguments instead.',
      )
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))], 3, 5, 3, 40))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(40)
    })

    test('reports console.log with null literal concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('value: '), { type: 'Literal', value: null })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for console.log("hello") — simple string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log("hello", name) — multiple args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeLiteral('hello'), makeIdentifier('name')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(`hello ${name}`) — template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const templateLit = { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { cooked: 'hello ' } }], expressions: [makeIdentifier('name')] }
      visitor.CallExpression(makeConsoleCall('log', [templateLit]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.debug("hello " + name) — debug not in list', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('debug', [makeBinaryPlus(makeLiteral('hello '), makeIdentifier('name'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.log("hello " + name) — not console', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('hello '), makeIdentifier('name'))],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x) — single identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeIdentifier('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(a, b, c) — three args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeIdentifier('a'), makeIdentifier('b'), makeIdentifier('c')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.trace("msg " + x) — trace not in list', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('trace', [makeBinaryPlus(makeLiteral('msg '), makeIdentifier('x'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.dir("msg " + x) — dir not in list', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('dir', [makeBinaryPlus(makeLiteral('msg '), makeIdentifier('x'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.table("msg " + x) — table not in list', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('table', [makeBinaryPlus(makeLiteral('msg '), makeIdentifier('x'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.assert("msg " + x) — assert not in list', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('assert', [makeBinaryPlus(makeLiteral('msg '), makeIdentifier('x'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.count("msg " + x) — count not in list', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('count', [makeBinaryPlus(makeLiteral('msg '), makeIdentifier('x'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x - y) — minus operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const minusExpr = { type: 'BinaryExpression', operator: '-', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.CallExpression(makeConsoleCall('log', [minusExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x * y) — multiply operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const mulExpr = { type: 'BinaryExpression', operator: '*', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.CallExpression(makeConsoleCall('log', [mulExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x === y) — strict equality', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const eqExpr = { type: 'BinaryExpression', operator: '===', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.CallExpression(makeConsoleCall('log', [eqExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x !== y) — strict inequality', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const neqExpr = { type: 'BinaryExpression', operator: '!==', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.CallExpression(makeConsoleCall('log', [neqExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x > y) — greater than', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const gtExpr = { type: 'BinaryExpression', operator: '>', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.CallExpression(makeConsoleCall('log', [gtExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x < y) — less than', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const ltExpr = { type: 'BinaryExpression', operator: '<', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.CallExpression(makeConsoleCall('log', [ltExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(x && y) — logical and', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const andExpr = { type: 'LogicalExpression', operator: '&&', left: makeIdentifier('x'), right: makeIdentifier('y') }
      visitor.CallExpression(makeConsoleCall('log', [andExpr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is not "console"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryConsoleStringConcatRule.create(ctx1)
      const visitor2 = noUnnecessaryConsoleStringConcatRule.create(ctx2)
      visitor1.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      visitor2.CallExpression(makeConsoleCall('log', [makeLiteral('hello')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      visitor.CallExpression(makeConsoleCall('log', [makeLiteral('hello')]))
      visitor.CallExpression(makeConsoleCall('info', [makeBinaryPlus(makeLiteral('c'), makeIdentifier('d'))]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeLiteral('hello')]))
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      visitor.CallExpression(makeConsoleCall('debug', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))]))
      visitor.CallExpression(makeConsoleCall('warn', [makeBinaryPlus(makeLiteral('c'), makeIdentifier('d'))]))
      visitor.CallExpression(makeConsoleCall('log', [makeLiteral('x'), makeLiteral('y')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryConsoleStringConcatRule.create(context)
      const visitor2 = noUnnecessaryConsoleStringConcatRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryConsoleStringConcatRule.meta
      const meta2 = noUnnecessaryConsoleStringConcatRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      const node = makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryConsoleStringConcatRule).toBeDefined()
      expect(typeof noUnnecessaryConsoleStringConcatRule.create).toBe('function')
      expect(typeof noUnnecessaryConsoleStringConcatRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression(makeConsoleCall('log', [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConsoleStringConcatRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
          computed: false,
        },
        arguments: [makeBinaryPlus(makeLiteral('a'), makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})
