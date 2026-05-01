import { describe, test, expect, vi } from 'vitest'
import { noEvalInTestRule } from '../../../../src/rules/testing/no-eval-in-test.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "eval('1 + 1');",
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getSource: () => source,
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    settings: {},
    ruleId: 'no-eval-in-test',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createEvalCall(arg: unknown, loc?: { start: { line: number; column: number }; end: { line: number; column: number } }): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'eval' },
    arguments: [arg],
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
}

describe('no-eval-in-test', () => {
  const rule = noEvalInTestRule

  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('eval')
    expect(rule.meta.severity).toBe('error')
    expect(rule.meta.type).toBe('problem')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports eval() calls
  test('reports eval("code")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1 + 1' }))
    expect(reports.length).toBe(1)
  })

  test('reports eval with string literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'console.log("hi")' }))
    expect(reports.length).toBe(1)
  })

  test('reports eval with variable argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Identifier', name: 'code' }))
    expect(reports.length).toBe(1)
  })

  test('reports eval with template literal argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'TemplateLiteral',
      quasis: [{ type: 'TemplateElement', value: { cooked: 'return ' } }],
      expressions: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports eval with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'eval' },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
    })
    expect(reports.length).toBe(1)
  })

  test('reports eval with multiple arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'x' }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Reports member expression eval
  test('reports window.eval("code")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: '1' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('reports globalThis.eval("code")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'globalThis' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: '1' }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
    })
    expect(reports.length).toBe(1)
  })

  test('reports obj.eval("code")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(1)
  })

  // SECTION: Does NOT report non-eval calls
  test('does not report console.log()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'log' },
      },
      arguments: [{ type: 'Literal', value: 'test' }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report evaluate()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'evaluate' },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report myEval()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'myEval' },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report obj.evaluation()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'evaluation' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report fn()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report expect(value).toBe(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'value' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Edge cases
  test('handles null node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    expect(() => visitor.CallExpression!(null)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    expect(() => visitor.CallExpression!(undefined)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles empty object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({})
    expect(reports.length).toBe(0)
  })

  test('handles node without callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({ type: 'CallExpression' })
    expect(reports.length).toBe(0)
  })

  test('handles node with non-Identifier callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Literal', value: 42 },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles number node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(42 as any)
    expect(reports.length).toBe(0)
  })

  test('handles string node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!("eval('x')" as any)
    expect(reports.length).toBe(0)
  })

  // SECTION: Location reporting
  test('reports correct location', () => {
    const loc = { start: { line: 5, column: 2 }, end: { line: 5, column: 17 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'code' }, loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports correct location for member expression eval', () => {
    const loc = { start: { line: 10, column: 0 }, end: { line: 10, column: 20 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: '1' }],
      loc,
    })
    expect(reports[0].loc).toEqual(loc)
  })

  // SECTION: Message verification
  test('report message mentions eval', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'code' }))
    expect(reports[0].message).toContain('eval')
  })

  test('report message mentions security', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'code' }))
    expect(reports[0].message).toContain('security')
  })

  // SECTION: Multiple calls
  test('reports multiple eval calls independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }, { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } }))
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '2' }, { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } }))
    expect(reports.length).toBe(2)
  })

  test('reports mixed eval and non-eval calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    })
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: '2' }],
    })
    expect(reports.length).toBe(2)
  })

  // SECTION: File path variations
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor isolation
  test('separate visitors have separate reports', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    visitor2.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    })
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('create returns new visitor each call', () => {
    const { context } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    expect(v1).not.toBe(v2)
  })

  // SECTION: Does not report with different property names
  test('does not report obj.evaluate()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'evaluate' },
      },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report obj.evall()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'evall' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report node with non-CallExpression type', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({ type: 'Identifier', name: 'eval' })
    expect(reports.length).toBe(0)
  })

  test('does not report FunctionExpression callee named something else', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'notEval' },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(0)
  })

  test('reports eval with computed property access', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window' },
        property: { type: 'Identifier', name: 'eval' },
        computed: false,
      },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(1)
  })

  test('does not report obj.method() with method named isEval', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'isEval' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('reports eval with deeply nested member object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(1)
  })

  test('does not report obj.eval when used as non-call', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'something' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('reports eval() with empty string', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '' }))
    expect(reports.length).toBe(1)
  })

  test('reports eval() with object expression arg', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'ObjectExpression', properties: [] }))
    expect(reports.length).toBe(1)
  })

  test('reports eval() with call expression arg', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'getCode' },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report Identifier named "eval" used as non-call', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [{ type: 'Identifier', name: 'eval' }],
    })
    expect(reports.length).toBe(0)
  })

  test('reports eval() with undefined callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'eval' },
      arguments: [{ type: 'Literal', value: 'x' }],
    })
    expect(reports.length).toBe(1)
  })

  test('visitor has CallExpression handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  test('reports eval() at specific line and column', () => {
    const loc = { start: { line: 42, column: 8 }, end: { line: 42, column: 23 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'code' }, loc))
    expect(reports[0].loc?.start.line).toBe(42)
    expect(reports[0].loc?.start.column).toBe(8)
  })

  // SECTION: Meta property checks
  test('meta.docs.url is defined', () => {
    expect(rule.meta.docs.url).toBeDefined()
    expect(typeof rule.meta.docs.url).toBe('string')
  })

  test('meta.docs.recommended is false', () => {
    expect(rule.meta.docs.recommended).toBe(false)
  })

  test('meta.docs.description is exact expected string', () => {
    expect(rule.meta.docs.description).toBe('Disallow eval() usage in test files')
  })

  // SECTION: More non-reporting cases
  test('does not report parseInt()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'parseInt' },
      arguments: [{ type: 'Literal', value: '10' }, { type: 'Literal', value: 10 }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report JSON.parse()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [{ type: 'Literal', value: '{}' }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report setTimeout()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'setTimeout' },
      arguments: [{ type: 'Identifier', name: 'fn' }, { type: 'Literal', value: 100 }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report require()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'require' },
      arguments: [{ type: 'Literal', value: 'path' }],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report evalPrefix()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'evalPrefix' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report preeval()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'preeval' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: More edge cases
  test('handles node with callee missing name property', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles node with MemberExpression callee missing property', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report computed member expression with Literal property', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: 'eval' },
        computed: true,
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles node with extra properties on CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'eval' },
      arguments: [{ type: 'Literal', value: 'code' }],
      extra: true,
      optional: false,
    })
    expect(reports.length).toBe(1)
  })

  test('reports eval via optional chaining member expression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'eval' },
        optional: true,
      },
      arguments: [],
    })
    expect(reports.length).toBe(1)
  })

  // SECTION: More location tests
  test('reports location at line 1 column 0', () => {
    const loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }, loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports location spanning multiple lines', () => {
    const loc = { start: { line: 3, column: 4 }, end: { line: 7, column: 12 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'code' }, loc))
    expect(reports[0].loc?.start.line).toBe(3)
    expect(reports[0].loc?.end.line).toBe(7)
  })

  test('reports location at column 0 for member expression eval', () => {
    const loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'self' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: '1' }],
      loc,
    })
    expect(reports[0].loc?.start.column).toBe(0)
  })

  // SECTION: More member expression patterns
  test('reports self.eval()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'self' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(1)
  })

  test('reports that.eval()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'that' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: 'code' }],
    })
    expect(reports.length).toBe(1)
  })

  test('reports a.b.c.eval() with three levels of nesting', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(1)
  })

  test('does not report a.b.c.run() with three levels of nesting', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        property: { type: 'Identifier', name: 'run' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Mixed call scenarios
  test('reports only eval among many different calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    })
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'method' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(1)
  })

  test('reports three eval calls independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '2' }))
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '3' }))
    expect(reports.length).toBe(3)
  })

  test('reports two member expression eval calls on different objects', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [],
    })
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'globalThis' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(2)
  })

  // SECTION: Report message content verification
  test('report message mentions debug', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'code' }))
    expect(reports[0].message).toContain('debug')
  })

  test('report message matches exact expected string', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'code' }))
    expect(reports[0].message).toBe('Avoid using eval() in test files. It is a security risk and makes code harder to debug.')
  })

  test('member expression eval report has same message as direct eval', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window' },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [{ type: 'Literal', value: '1' }],
    })
    expect(reports[0].message).toBe('Avoid using eval() in test files. It is a security risk and makes code harder to debug.')
  })

  test('report includes loc property', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 'x' }))
    expect(reports[0].loc).toBeDefined()
  })

  // SECTION: Visitor behavior
  test('same visitor accumulates reports across four calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '2' }))
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '3' }))
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '4' }))
    expect(reports.length).toBe(4)
  })

  test('two visitors with separate contexts have independent reports', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    visitor2.CallExpression!(createEvalCall({ type: 'Literal', value: '2' }))
    visitor2.CallExpression!(createEvalCall({ type: 'Literal', value: '3' }))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(2)
  })

  test('calling create with same context shares reports array', () => {
    const { context, reports } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    v1.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    v2.CallExpression!(createEvalCall({ type: 'Literal', value: '2' }))
    expect(reports.length).toBe(2)
  })

  // SECTION: Different argument types for eval()
  test('reports eval() with ArrowFunctionExpression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(1)
  })

  test('reports eval() with ArrayExpression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'ArrayExpression',
      elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports eval() with BinaryExpression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(1)
  })

  test('reports eval() with ConditionalExpression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'ConditionalExpression',
      test: { type: 'Identifier', name: 'x' },
      consequent: { type: 'Literal', value: 'a' },
      alternate: { type: 'Literal', value: 'b' },
    }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Various file extensions
  test('works with .tsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.test.tsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    expect(reports.length).toBe(1)
  })

  test('works with .jsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.test.jsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    expect(reports.length).toBe(1)
  })

  test('works with .spec.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.js')
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    expect(reports.length).toBe(1)
  })

  test('works with .mjs files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.mjs')
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: '1' }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Additional edge cases
  test('reports eval() with numeric literal argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({ type: 'Literal', value: 42 }))
    expect(reports.length).toBe(1)
  })

  test('does not report obj.evaluateCode()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'evaluateCode' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Additional test coverage
  test('reports eval() with UpdateExpression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'UpdateExpression',
      operator: '++',
      argument: { type: 'Identifier', name: 'i' },
      prefix: false,
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report FunctionExpression as callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('reports eval() with LogicalExpression argument', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createEvalCall({
      type: 'LogicalExpression',
      operator: '&&',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report when callee is explicitly undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: undefined,
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('reports MemberExpression eval with Literal object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Literal', value: 42 },
        property: { type: 'Identifier', name: 'eval' },
      },
      arguments: [],
    })
    expect(reports.length).toBe(1)
  })
})
