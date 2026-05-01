import { describe, expect, test, vi } from 'vitest'
import { noUnsafeArgumentRule } from '../../../../src/rules/security/no-unsafe-argument.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'fn(x as any)',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeCallExprWithAs(args: unknown[] = []): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'fn' },
    arguments: args,
    loc: makeLoc(1, 0, 1, 20),
  }
}

function makeTSAsArg(loc?: unknown): unknown {
  return {
    type: 'TSAsExpression',
    expression: { type: 'Identifier', name: 'x' },
    typeAnnotation: { type: 'TSAnyKeyword' },
    loc: loc ?? makeLoc(1, 3, 1, 12),
  }
}

function makeTSTypeAssertionArg(loc?: unknown): unknown {
  return {
    type: 'TSTypeAssertion',
    typeAnnotation: { type: 'TSAnyKeyword' },
    expression: { type: 'Identifier', name: 'x' },
    loc: loc ?? makeLoc(1, 3, 1, 12),
  }
}

describe('no-unsafe-argument rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnsafeArgumentRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnsafeArgumentRule.meta.severity).toBe('warn')
    })

    test('should have correct category "security"', () => {
      expect(noUnsafeArgumentRule.meta.docs?.category).toBe('security')
    })

    test('should not be recommended', () => {
      expect(noUnsafeArgumentRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnsafeArgumentRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning assertion and argument', () => {
      const desc = noUnsafeArgumentRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/assertion/)
      expect(desc).toMatch(/argument/)
    })

    test('should have correct docs URL', () => {
      expect(noUnsafeArgumentRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unsafe-argument',
      )
    })

    test('should have empty schema', () => {
      expect(noUnsafeArgumentRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnsafeArgumentRule).toBeDefined()
      expect(noUnsafeArgumentRule.meta).toBeDefined()
      expect(noUnsafeArgumentRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports unsafe arguments', () => {
    test('reports TSAsExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports TSTypeAssertion argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSTypeAssertionArg()]))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unsafe"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports[0].message).toContain('Unsafe')
    })

    test('message contains "assertion"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports[0].message.toLowerCase()).toContain('assertion')
    })

    test('message contains "type safety"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports[0].message.toLowerCase()).toContain('type safety')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the argument not the call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const arg = makeTSAsArg()
      visitor.CallExpression(makeCallExprWithAs([arg]))
      expect(reports[0].node).toBe(arg)
    })

    test('report loc comes from the argument node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const argLoc = makeLoc(3, 5, 3, 15)
      const arg = makeTSAsArg(argLoc)
      visitor.CallExpression(makeCallExprWithAs([arg]))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports multiple unsafe arguments in one call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg(), makeTSAsArg()]))
      expect(reports.length).toBe(2)
    })

    test('reports three TSAsExpression arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg(), makeTSAsArg(), makeTSAsArg()]))
      expect(reports.length).toBe(3)
    })

    test('reports mixed TSAsExpression and TSTypeAssertion arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg(), makeTSTypeAssertionArg()]))
      expect(reports.length).toBe(2)
    })

    test('reports TSAsExpression as second argument only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const safeArg = { type: 'Identifier', name: 'y' }
      const unsafeArg = makeTSAsArg()
      visitor.CallExpression(makeCallExprWithAs([safeArg, unsafeArg]))
      expect(reports.length).toBe(1)
    })

    test('reports TSAsExpression as first argument only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const unsafeArg = makeTSAsArg()
      const safeArg = { type: 'Identifier', name: 'y' }
      visitor.CallExpression(makeCallExprWithAs([unsafeArg, safeArg]))
      expect(reports.length).toBe(1)
    })

    test('reports TSTypeAssertion with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSTypeAssertionArg()]))
      expect(reports[0].message).toBe(
        'Unsafe type assertion in function argument. This bypasses type safety — consider using a proper type guard instead.',
      )
    })

    test('reports TSAsExpression with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports[0].message).toBe(
        'Unsafe type assertion in function argument. This bypasses type safety — consider using a proper type guard instead.',
      )
    })

    test('each unsafe argument report targets the correct node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const arg1 = makeTSAsArg()
      const arg2 = makeTSTypeAssertionArg()
      visitor.CallExpression(makeCallExprWithAs([arg1, arg2]))
      expect(reports[0].node).toBe(arg1)
      expect(reports[1].node).toBe(arg2)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports.length).toBe(4)
    })

    test('reports with specific location values from argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const arg = makeTSAsArg(makeLoc(10, 4, 10, 14))
      visitor.CallExpression(makeCallExprWithAs([arg]))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('reports each violation once per argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with wrong type — not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 5) }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([]))
      expect(reports.length).toBe(0)
    })

    test('does not report ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([{ type: 'ArrayExpression', elements: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: { type: 'Identifier', name: 'x' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'LogicalExpression',
            operator: '&&',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'FunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report TaggedTemplateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'TaggedTemplateExpression',
            tag: { type: 'Identifier', name: 'tag' },
            quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: 'i' }, prefix: false },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'AssignmentExpression',
            operator: '=',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 1 },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'SequenceExpression',
            expressions: [
              { type: 'Literal', value: 1 },
              { type: 'Literal', value: 2 },
            ],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report YieldExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'YieldExpression', argument: { type: 'Identifier', name: 'v' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('skips null elements in arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [null, { type: 'Identifier', name: 'x' }, null],
        loc: makeLoc(1, 0, 1, 15),
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([{ type: 'Literal', value: 'hello' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([{ type: 'Literal', value: true }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report ThisExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([{ type: 'ThisExpression' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TSTypeReference argument (not assertion)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'TSTypeReference',
            typeName: { type: 'Identifier', name: 'MyType' },
            loc: makeLoc(1, 3, 1, 10),
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnsafeArgumentRule.create(ctx1)
      const visitor2 = noUnsafeArgumentRule.create(ctx2)

      visitor1.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor2.CallExpression(makeCallExprWithAs([{ type: 'Identifier', name: 'x' }]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const arg = {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      }
      visitor.CallExpression(makeCallExprWithAs([arg]))
      expect(reports.length).toBe(1)
    })

    test('default location when argument has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const arg = {
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSAnyKeyword' },
      }
      visitor.CallExpression(makeCallExprWithAs([arg]))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed safe and unsafe arguments report only unsafe ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [
          { type: 'Identifier', name: 'a' },
          makeTSAsArg(),
          { type: 'Literal', value: 42 },
          makeTSTypeAssertionArg(),
        ],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnsafeArgumentRule.create(context)
      const visitor2 = noUnsafeArgumentRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with callee as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [makeTSAsArg()],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      // reports — has TSAsExpression arg
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      // does NOT report — all safe args
      visitor.CallExpression(makeCallExprWithAs([{ type: 'Identifier', name: 'x' }]))
      // reports — has TSAsExpression arg
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      // does NOT report — wrong node type
      visitor.CallExpression({ type: 'Literal', value: 1, loc: makeLoc(3, 0, 3, 5) })
      // reports — has TSTypeAssertion arg
      visitor.CallExpression(makeCallExprWithAs([makeTSTypeAssertionArg()]))
      expect(reports.length).toBe(3)
    })

    test('CallExpression with empty arguments array — no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('report loc matches argument loc not call loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const argLoc = makeLoc(5, 10, 5, 20)
      const arg = makeTSAsArg(argLoc)
      const callLoc = makeLoc(5, 0, 5, 25)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [arg],
        loc: callLoc,
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('does not report when arguments contains only safe types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'Identifier', name: 'a' },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 'b' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('TSAsExpression inside CallExpression callee is not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'fn' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports when arguments array has single TSAsExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('all violation messages are identical for the same rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSTypeAssertionArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noUnsafeArgumentRule.meta
      const meta2 = noUnsafeArgumentRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report targets argument not parent CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      const arg = makeTSAsArg()
      const callNode = makeCallExprWithAs([arg])
      visitor.CallExpression(callNode)
      expect(reports[0].node).not.toBe(callNode)
      expect(reports[0].node).toBe(arg)
    })

    test('does not report safe argument — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([{ type: 'Identifier', name: 'foo' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — number Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([{ type: 'Literal', value: 123 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'g' }, arguments: [] },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Identifier', name: 'x' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([{ type: 'ArrayExpression', elements: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          {
            type: 'BinaryExpression',
            operator: '===',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Literal', value: 1 },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report safe argument — UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(
        makeCallExprWithAs([
          { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeArgumentRule.create(context)
      visitor.CallExpression(makeCallExprWithAs([makeTSAsArg()]))
      visitor.CallExpression(makeCallExprWithAs([makeTSTypeAssertionArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
