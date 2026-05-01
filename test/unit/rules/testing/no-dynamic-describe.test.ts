import { describe, test, expect, vi } from 'vitest'
import { noDynamicDescribeRule } from '../../../../src/rules/testing/no-dynamic-describe.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "describe('test', () => {});",
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
    ruleId: 'no-dynamic-describe',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createDescribeCall(title: unknown, loc?: { start: { line: number; column: number }; end: { line: number; column: number } }): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [title, { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

function createDynamicDescribe(expressions: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      {
        type: 'TemplateLiteral',
        quasis: expressions.map((_, i) => ({
          type: 'TemplateElement',
          value: { raw: `part${i}_`, cooked: `part${i}_` },
        })),
        expressions,
      },
      { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
  }
}

describe('no-dynamic-describe', () => {
  const rule = noDynamicDescribeRule

  // SECTION: Meta
  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('dynamic')
    expect(rule.meta.severity).toBe('warn')
    expect(rule.meta.type).toBe('suggestion')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports dynamic template literals
  test('reports describe with template literal containing expression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'name' }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template literal containing multiple expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([
      { type: 'Identifier', name: 'suite' },
      { type: 'Identifier', name: 'name' },
    ]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template literal containing CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'getName' },
      arguments: [],
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template literal containing MemberExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'name' },
    }]))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does not report static titles
  test('does not report describe with string literal title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 'static title' }))
    expect(reports.length).toBe(0)
  })

  test('does not report describe with empty string title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: '' }))
    expect(reports.length).toBe(0)
  })

  test('does not report describe with template literal without expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({
      type: 'TemplateLiteral',
      quasis: [{ type: 'TemplateElement', value: { raw: 'static template', cooked: 'static template' } }],
      expressions: [],
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: fdescribe and xdescribe
  test('reports fdescribe with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fdescribe' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(1)
  })

  test('reports xdescribe with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'xdescribe' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'skip ', cooked: 'skip ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'suite' }],
        },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(1)
  })

  test('does not report fdescribe with string literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fdescribe' },
      arguments: [
        { type: 'Literal', value: 'focused test' },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(0)
  })

  test('does not report xdescribe with string literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'xdescribe' },
      arguments: [
        { type: 'Literal', value: 'skipped test' },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Non-describe calls
  test('does not report test() with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'test' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report it() with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'it' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'it ', cooked: 'it ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report context() with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'context' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'ctx ', cooked: 'ctx ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report arbitrary function with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'someFunction' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
      ],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Edge cases
  test('handles null node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(null)
    expect(reports.length).toBe(0)
  })

  test('handles undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(undefined)
    expect(reports.length).toBe(0)
  })

  test('handles empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({})
    expect(reports.length).toBe(0)
  })

  test('handles node without arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles node with empty arguments array', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('handles node where first argument is null', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [null],
    })
    expect(reports.length).toBe(0)
  })

  test('handles node where first argument is a number literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 42 }))
    expect(reports.length).toBe(0)
  })

  test('handles node where first argument is a boolean literal', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: true }))
    expect(reports.length).toBe(0)
  })

  test('handles node where first argument is an Identifier', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Identifier', name: 'titleVar' }))
    expect(reports.length).toBe(0)
  })

  test('handles node with non-Identifier callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'describe' },
      },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
      ],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Location tests
  test('reports correct location', () => {
    const loc = { start: { line: 5, column: 2 }, end: { line: 5, column: 35 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports[0].loc).toBeDefined()
  })

  test('reports location at line 1 column 0', () => {
    const loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'x' }],
        },
      ],
      loc,
    })
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('reports location spanning multiple lines', () => {
    const loc = { start: { line: 10, column: 4 }, end: { line: 12, column: 20 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
      ],
      loc,
    })
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.end.line).toBe(12)
  })

  // SECTION: Message verification
  test('report message mentions dynamic', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports[0].message).toContain('dynamic')
  })

  test('report message mentions describe', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports[0].message).toContain('describe')
  })

  test('report message matches exact expected text', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports[0].message).toBe('Avoid using dynamic expressions in describe() titles. Use static string literals for better test organization and readability.')
  })

  // SECTION: Visitor behavior
  test('visitor has CallExpression handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  test('same visitor accumulates reports across multiple calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'a' }]))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'b' }]))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'c' }]))
    expect(reports.length).toBe(3)
  })

  test('two visitors with separate contexts have independent reports', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'a' }]))
    visitor2.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'b' }]))
    visitor2.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'c' }]))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(2)
  })

  test('create returns new visitor each call', () => {
    const { context } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    expect(v1).not.toBe(v2)
  })

  // SECTION: Mixed describe calls
  test('reports only dynamic describes among mixed calls', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 'static' }))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'dynamic' }]))
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 'another static' }))
    expect(reports.length).toBe(1)
  })

  test('reports three dynamic describes independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'a' }]))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'b' }]))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'c' }]))
    expect(reports.length).toBe(3)
  })

  // SECTION: Template literal with various expression types
  test('reports template with BinaryExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports template with ConditionalExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'ConditionalExpression',
      test: { type: 'Identifier', name: 'flag' },
      consequent: { type: 'Literal', value: 'yes' },
      alternate: { type: 'Literal', value: 'no' },
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports template with LogicalExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'LogicalExpression',
      operator: '||',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Literal', value: 'fallback' },
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports template with ArrowFunctionExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports template with UpdateExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'UpdateExpression',
      operator: '++',
      argument: { type: 'Identifier', name: 'i' },
      prefix: false,
    }]))
    expect(reports.length).toBe(1)
  })

  // SECTION: Various file paths
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports.length).toBe(1)
  })

  test('works with .spec.tsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports.length).toBe(1)
  })

  test('works with deeply nested file path', () => {
    const { context, reports } = createMockContext({}, '/packages/app/src/features/auth/login.test.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports.length).toBe(1)
  })

  test('works with .test.jsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.test.jsx')
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports.length).toBe(1)
  })

  test('works with non-test file paths', () => {
    const { context, reports } = createMockContext({}, '/src/utils.ts')
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports.length).toBe(1)
  })

  // SECTION: Meta and export
  test('meta docs have correct URL format', () => {
    const url = rule.meta.docs.url
    expect(url).toMatch(/^https?:\/\/.+/)
    expect(url).toContain('no-dynamic-describe')
  })

  test('meta docs recommended is false', () => {
    expect(rule.meta.docs.recommended).toBe(false)
  })

  test('meta docs description is exact expected string', () => {
    expect(rule.meta.docs.description).toBe('Disallow dynamic expressions in describe() titles')
  })

  test('default export exists and has create', () => {
    expect(rule).toBeDefined()
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Does not report describe with each
  test('does not report describe.each with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'describe' },
        property: { type: 'Identifier', name: 'each' },
      },
      arguments: [
        [{
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'x' }],
        }],
      ],
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: describe.only with dynamic template
  test('reports describe.only with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'describe' },
        property: { type: 'Identifier', name: 'only' },
      },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'x' }],
        },
      ],
    })
    expect(reports.length).toBe(1)
  })

  // SECTION: describe.skip with dynamic template
  test('reports describe.skip with dynamic template', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'describe' },
        property: { type: 'Identifier', name: 'skip' },
      },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'x' }],
        },
      ],
    })
    expect(reports.length).toBe(1)
  })

  // SECTION: Additional coverage
  test('handles node where first argument is an empty object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({}))
    expect(reports.length).toBe(0)
  })

  test('handles node with numeric callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Literal', value: 42 },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report describe with null literal title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: null }))
    expect(reports.length).toBe(0)
  })

  test('reports describe with template containing string expression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Literal', value: 'dynamic' }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template containing numeric expression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Literal', value: 42 }]))
    expect(reports.length).toBe(1)
  })

  test('handles node with arguments but undefined first arg properties', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [{ type: 'Literal' }],
    })
    expect(reports.length).toBe(0)
  })

  test('handles TemplateLiteral with undefined expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'describe' },
      arguments: [
        { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'test', cooked: 'test' } }] },
      ],
    })
    expect(reports.length).toBe(0)
  })

  test('handles TemplateLiteral with null expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({
      type: 'TemplateLiteral',
      quasis: [{ type: 'TemplateElement', value: { raw: 'test', cooked: 'test' } }],
      expressions: null,
    }))
    expect(reports.length).toBe(0)
  })

  test('handles TemplateLiteral with empty quasis and empty expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({
      type: 'TemplateLiteral',
      quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
      expressions: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('reports with template containing TypeCastExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'TypeCastExpression', expression: { type: 'Identifier', name: 'x' }, typeAnnotation: {} }]))
    expect(reports.length).toBe(1)
  })

  test('does not report ddescribe (not in allowed list)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'ddescribe' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{ type: 'Identifier', name: 'x' }],
        },
      ],
    })
    expect(reports.length).toBe(0)
  })

  test('handles CallExpression with callee having numeric name', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 123 as unknown as string },
      arguments: [],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report describe with numeric literal title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 123 }))
    expect(reports.length).toBe(0)
  })

  test('does not report describe with regex literal title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }))
    expect(reports.length).toBe(0)
  })

  test('reports fdescribe with dynamic template containing CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fdescribe' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [{
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getTitle' },
            arguments: [],
          }],
        },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
    })
    expect(reports.length).toBe(1)
  })

  test('handles node without callee', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({ type: 'CallExpression', arguments: [] })
    expect(reports.length).toBe(0)
  })

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

  // SECTION: Additional dynamic template patterns
  test('reports describe with template containing AwaitExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'AwaitExpression',
      argument: { type: 'Identifier', name: 'promise' },
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template containing YieldExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'YieldExpression',
      argument: { type: 'Identifier', name: 'value' },
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template containing NewExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Error' },
      arguments: [],
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template containing UnaryExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'UnaryExpression',
      operator: '!',
      argument: { type: 'Identifier', name: 'flag' },
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template containing AssignmentExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
    }]))
    expect(reports.length).toBe(1)
  })

  test('does not report describe with FunctionExpression callback and string title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 'my test' }))
    expect(reports.length).toBe(0)
  })

  test('reports xdescribe with multiple dynamic expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'xdescribe' },
      arguments: [
        {
          type: 'TemplateLiteral',
          quasis: [
            { type: 'TemplateElement', value: { raw: 'a', cooked: 'a' } },
            { type: 'TemplateElement', value: { raw: 'b', cooked: 'b' } },
            { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          ],
          expressions: [
            { type: 'Identifier', name: 'x' },
            { type: 'Identifier', name: 'y' },
          ],
        },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
    })
    expect(reports.length).toBe(1)
  })

  test('does not report describe with TaggedTemplateExpression title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({
      type: 'TaggedTemplateExpression',
      tag: { type: 'Identifier', name: 'tag' },
      quasi: { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'test', cooked: 'test' } }], expressions: [] },
    }))
    expect(reports.length).toBe(0)
  })

  test('accumulates 4 reports for 4 dynamic describes', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'a' }]))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'b' }]))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'c' }]))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'd' }]))
    expect(reports.length).toBe(4)
  })

  test('reports only dynamic describes in mixed batch', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 'static1' }))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'dyn1' }]))
    visitor.CallExpression!(createDescribeCall({
      type: 'TemplateLiteral',
      quasis: [{ type: 'TemplateElement', value: { raw: 'static2', cooked: 'static2' } }],
      expressions: [],
    }))
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'dyn2' }]))
    visitor.CallExpression!(createDescribeCall({ type: 'Literal', value: 'static3' }))
    expect(reports.length).toBe(2)
  })

  test('does not report describe.each with static template title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'describe' },
        property: { type: 'Identifier', name: 'each' },
      },
      arguments: [
        { type: 'Literal', value: 'static title' },
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
    })
    expect(reports.length).toBe(0)
  })

  test('does not report describe with spread element title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({
      type: 'SpreadElement',
      argument: { type: 'Identifier', name: 'titles' },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports describe with template containing SequenceExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'SequenceExpression',
      expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
    }]))
    expect(reports.length).toBe(1)
  })

  test('handles node with extra properties on arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'x' }]))
    expect(reports.length).toBe(1)
  })

  test('calling create with same context shares reports array', () => {
    const { context, reports } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    v1.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'a' }]))
    v2.CallExpression!(createDynamicDescribe([{ type: 'Identifier', name: 'b' }]))
    expect(reports.length).toBe(2)
  })

  test('does not report describe with ObjectExpression title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'ObjectExpression', properties: [] }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Additional edge cases for 95 tests
  test('reports describe with template containing nested TemplateLiteral expression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'TemplateLiteral',
      quasis: [
        { type: 'TemplateElement', value: { raw: 'inner ', cooked: 'inner ' } },
        { type: 'TemplateElement', value: { raw: '', cooked: '' } },
      ],
      expressions: [{ type: 'Identifier', name: 'x' }],
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template containing ArrayExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'ArrayExpression',
      elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
    }]))
    expect(reports.length).toBe(1)
  })

  test('reports describe with template containing ClassExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDynamicDescribe([{
      type: 'ClassExpression',
      id: null,
      superClass: null,
      body: { type: 'ClassBody', body: [] },
    }]))
    expect(reports.length).toBe(1)
  })

  test('does not report describe with BigInt literal title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({ type: 'BigIntLiteral', value: '42', raw: '42n' }))
    expect(reports.length).toBe(0)
  })

  test('does not report describe with FunctionExpression title', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.CallExpression!(createDescribeCall({
      type: 'FunctionExpression',
      id: null,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }))
    expect(reports.length).toBe(0)
  })
})
