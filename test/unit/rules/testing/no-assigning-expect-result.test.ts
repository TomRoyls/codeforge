import { describe, test, expect, vi } from 'vitest'
import { noAssigningExpectResultRule } from '../../../../src/rules/testing/no-assigning-expect-result.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'const result = expect(x);',
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
    ruleId: 'no-assigning-expect-result',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createVariableDeclarator(
  name: string,
  init: unknown,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init,
    loc: loc ?? { start: { line: 1, column: 6 }, end: { line: 1, column: 25 } },
  }
}

function createExpectCall(arg: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [arg],
  }
}

function createExpectChainCall(matcher: string, arg: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: createExpectCall(arg),
      property: { type: 'Identifier', name: matcher },
    },
    arguments: [{ type: 'Literal', value: 1 }],
  }
}

describe('no-assigning-expect-result', () => {
  const rule = noAssigningExpectResultRule

  test('rule has correct meta', () => {
    expect(rule.meta.docs.category).toBe('testing')
    expect(rule.meta.docs.description).toContain('expect')
    expect(rule.meta.severity).toBe('warn')
    expect(rule.meta.type).toBe('suggestion')
  })

  test('rule has create method', () => {
    expect(typeof rule.create).toBe('function')
  })

  // SECTION: Reports assigning expect() result
  test('reports const result = expect(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(value)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'value' })))
    expect(reports.length).toBe(1)
  })

  test('reports const a = expect(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('a', createExpectCall({ type: 'Literal', value: 1 })))
    expect(reports.length).toBe(1)
  })

  test('reports const x = expect(true)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', createExpectCall({ type: 'Literal', value: true })))
    expect(reports.length).toBe(1)
  })

  test('reports const y = expect("string")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('y', createExpectCall({ type: 'Literal', value: 'string' })))
    expect(reports.length).toBe(1)
  })

  test('reports const z = expect(null)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('z', createExpectCall({ type: 'Literal', value: null })))
    expect(reports.length).toBe(1)
  })

  test('reports const obj = expect(fn())', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('obj', createExpectCall({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
    })))
    expect(reports.length).toBe(1)
  })

  // SECTION: Does NOT report non-expect assignments
  test('does not report const result = getValue()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'getValue' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = 5', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', { type: 'Literal', value: 5 }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = myExpect(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'myExpect' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = expected(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expected' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('reports const result = expect.when()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'when' },
      },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Reports expect().toBe() chain assignments too
  test('reports const result = expect(x).toBe(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectChainCall('toBe', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toEqual({})', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectChainCall('toEqual', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const v = expect(x).toBeTruthy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('v', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: createExpectCall({ type: 'Identifier', name: 'x' }),
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Edge cases
  test('handles null node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    expect(() => visitor.VariableDeclarator!(null)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    expect(() => visitor.VariableDeclarator!(undefined)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles empty object', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({})
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator without init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'result' },
    })
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator with null init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'result' },
      init: null,
    })
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator with literal init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'result' },
      init: { type: 'Literal', value: 42 },
    })
    expect(reports.length).toBe(0)
  })

  test('handles VariableDeclarator with non-Identifier id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ObjectPattern', properties: [] },
      init: createExpectCall({ type: 'Identifier', name: 'x' }),
    })
    expect(reports.length).toBe(1)
  })

  test('handles number node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(42 as any)
    expect(reports.length).toBe(0)
  })

  test('handles string node', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!('const x = expect(1)' as any)
    expect(reports.length).toBe(0)
  })

  // SECTION: Location reporting
  test('reports correct location', () => {
    const loc = { start: { line: 5, column: 6 }, end: { line: 5, column: 28 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' }), loc))
    expect(reports[0].loc).toEqual(loc)
  })

  test('reports correct location for different line', () => {
    const loc = { start: { line: 20, column: 2 }, end: { line: 20, column: 25 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' }), loc))
    expect(reports[0].loc?.start.line).toBe(20)
  })

  // SECTION: Message verification
  test('report message mentions expect', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports[0].message).toContain('expect')
  })

  test('report message mentions assign', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports[0].message).toContain('assign')
  })

  // SECTION: Multiple calls
  test('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r1', createExpectCall({ type: 'Identifier', name: 'x' }), { start: { line: 1, column: 6 }, end: { line: 1, column: 25 } }))
    visitor.VariableDeclarator!(createVariableDeclarator('r2', createExpectCall({ type: 'Literal', value: 1 }), { start: { line: 2, column: 6 }, end: { line: 2, column: 23 } }))
    visitor.VariableDeclarator!(createVariableDeclarator('r3', { type: 'Literal', value: 42 }, { start: { line: 3, column: 6 }, end: { line: 3, column: 20 } }))
    expect(reports.length).toBe(2)
  })

  test('reports mixed valid and invalid assignments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('data', { type: 'Literal', value: 42 }))
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' })))
    visitor.VariableDeclarator!(createVariableDeclarator('value', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
    expect(reports.length).toBe(1)
  })

  // SECTION: File path variations
  test('works with .spec.ts files', () => {
    const { context, reports } = createMockContext({}, '/src/file.spec.ts')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('works with .test.js files', () => {
    const { context, reports } = createMockContext({}, '/src/file.test.js')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('works with .spec.tsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.spec.tsx')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor isolation
  test('separate visitors have separate reports', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = rule.create(ctx1)
    const visitor2 = rule.create(ctx2)
    visitor1.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' })))
    visitor2.VariableDeclarator!(createVariableDeclarator('r', { type: 'Literal', value: 5 }))
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('create returns new visitor each call', () => {
    const { context } = createMockContext()
    const v1 = rule.create(context)
    const v2 = rule.create(context)
    expect(v1).not.toBe(v2)
  })

  // SECTION: Destructuring patterns
  test('does not report destructuring from expect (not CallExpression init)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ObjectPattern', properties: [] },
      init: createExpectCall({ type: 'Identifier', name: 'x' }),
    })
    expect(reports.length).toBe(1)
  })

  test('handles VariableDeclarator with ArrayPattern id', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'ArrayPattern', elements: [] },
      init: createExpectCall({ type: 'Identifier', name: 'x' }),
    })
    expect(reports.length).toBe(1)
  })

  // SECTION: Visitor handler check
  test('visitor has VariableDeclarator handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(typeof visitor.VariableDeclarator).toBe('function')
  })

  // SECTION: Does not report expect without call (identifier only)
  test('does not report const fn = expect', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'fn' },
      init: { type: 'Identifier', name: 'expect' },
    })
    expect(reports.length).toBe(0)
  })

  // SECTION: Does not report other AST node types as init
  test('does not report const x = { type: ObjectExpression }', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', { type: 'ObjectExpression', properties: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report const x = [1, 2, 3]', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', { type: 'ArrayExpression', elements: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report const x = a + b', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Meta and export checks
  test('meta docs have correct URL format', () => {
    const url = rule.meta.docs.url
    expect(url).toMatch(/^https?:\/\/.+/)
    expect(url).toContain('no-assigning-expect-result')
  })

  test('meta fixable is undefined', () => {
    expect(rule.meta.fixable).toBeUndefined()
  })

  test('default export exists', () => {
    const defaultExport = rule
    expect(defaultExport).toBeDefined()
    expect(typeof defaultExport.create).toBe('function')
  })

  // SECTION: More expect argument types
  test('reports const u = expect(undefined)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('u', createExpectCall({ type: 'Identifier', name: 'undefined' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(/regex/)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } })))
    expect(reports.length).toBe(1)
  })

  test('reports const arr = expect([1, 2])', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('arr', createExpectCall({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })))
    expect(reports.length).toBe(1)
  })

  test('reports const obj = expect({ a: 1 })', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('obj', createExpectCall({ type: 'ObjectExpression', properties: [] })))
    expect(reports.length).toBe(1)
  })

  test('reports const prop = expect(a.b)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('prop', createExpectCall({
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'a' },
      property: { type: 'Identifier', name: 'b' },
    })))
    expect(reports.length).toBe(1)
  })

  // SECTION: More non-expect function names
  test('does not report const result = assert(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'assert' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = check(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'check' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = verify(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'verify' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = should(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'should' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = assertEqual(x, y)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'assertEqual' },
      arguments: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const result = expectX(x)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expectX' },
      arguments: [{ type: 'Identifier', name: 'x' }],
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: More non-CallExpression init types
  test('does not report const fn = () => {}', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('fn', { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
    expect(reports.length).toBe(0)
  })

  test('does not report const fn = function() {}', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('fn', { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
    expect(reports.length).toBe(0)
  })

  test('does not report const s = `template`', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('s', { type: 'TemplateLiteral', quasis: [], expressions: [] }))
    expect(reports.length).toBe(0)
  })

  test('does not report const v = a ? b : c', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('v', {
      type: 'ConditionalExpression',
      test: { type: 'Identifier', name: 'a' },
      consequent: { type: 'Identifier', name: 'b' },
      alternate: { type: 'Identifier', name: 'c' },
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const x = new Error()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Error' },
      arguments: [],
    }))
    expect(reports.length).toBe(0)
  })

  test('does not report const x = a && b', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', {
      type: 'LogicalExpression',
      operator: '&&',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(0)
  })

  // SECTION: Chain calls with .not, .resolves, .rejects
  test('reports const r = expect(x).not.toBe(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createExpectCall({ type: 'Identifier', name: 'x' }),
          property: { type: 'Identifier', name: 'not' },
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).resolves.toBe(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createExpectCall({ type: 'Identifier', name: 'x' }),
          property: { type: 'Identifier', name: 'resolves' },
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).rejects.toThrow()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createExpectCall({ type: 'Identifier', name: 'x' }),
          property: { type: 'Identifier', name: 'rejects' },
        },
        property: { type: 'Identifier', name: 'toThrow' },
      },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).not.toBeTruthy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createExpectCall({ type: 'Identifier', name: 'x' }),
          property: { type: 'Identifier', name: 'not' },
        },
        property: { type: 'Identifier', name: 'toBeTruthy' },
      },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  // SECTION: More matcher chain calls
  test('reports const r = expect(x).toBeNull()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectChainCall('toBeNull', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toBeDefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectChainCall('toBeDefined', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toBeUndefined()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectChainCall('toBeUndefined', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toBeFalsy()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectChainCall('toBeFalsy', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toBeGreaterThan(5)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectChainCall('toBeGreaterThan', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toContain("item")', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectChainCall('toContain', { type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toThrow()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: createExpectCall({ type: 'Identifier', name: 'x' }),
        property: { type: 'Identifier', name: 'toThrow' },
      },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  test('reports const r = expect(x).toMatchSnapshot()', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: createExpectCall({ type: 'Identifier', name: 'x' }),
        property: { type: 'Identifier', name: 'toMatchSnapshot' },
      },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Additional location tests
  test('reports location at column 0', () => {
    const loc = { start: { line: 3, column: 0 }, end: { line: 3, column: 20 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' }), loc))
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('reports location spanning multiple lines', () => {
    const loc = { start: { line: 10, column: 4 }, end: { line: 12, column: 15 } }
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' }), loc))
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.end.line).toBe(12)
  })

  // SECTION: Report message verification
  test('report message mentions variable', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports[0].message).toContain('variable')
  })

  test('report message mentions void', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports[0].message).toContain('void')
  })

  test('report message matches exact expected text', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('result', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports[0].message).toBe('Do not assign the result of expect() to a variable. expect() assertions return void and are not meant to be captured.')
  })

  // SECTION: Visitor accumulation and patterns
  test('visitor accumulates 5 reports from 5 violations', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r1', createExpectCall({ type: 'Identifier', name: 'a' })))
    visitor.VariableDeclarator!(createVariableDeclarator('r2', createExpectCall({ type: 'Identifier', name: 'b' })))
    visitor.VariableDeclarator!(createVariableDeclarator('r3', createExpectCall({ type: 'Identifier', name: 'c' })))
    visitor.VariableDeclarator!(createVariableDeclarator('r4', createExpectCall({ type: 'Identifier', name: 'd' })))
    visitor.VariableDeclarator!(createVariableDeclarator('r5', createExpectCall({ type: 'Identifier', name: 'e' })))
    expect(reports.length).toBe(5)
  })

  test('reports interleaved valid and invalid pattern', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('valid1', { type: 'Literal', value: 42 }))
    visitor.VariableDeclarator!(createVariableDeclarator('invalid1', createExpectCall({ type: 'Identifier', name: 'x' })))
    visitor.VariableDeclarator!(createVariableDeclarator('valid2', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
    visitor.VariableDeclarator!(createVariableDeclarator('valid3', { type: 'Literal', value: 'test' }))
    visitor.VariableDeclarator!(createVariableDeclarator('invalid2', createExpectCall({ type: 'Literal', value: 1 })))
    expect(reports.length).toBe(2)
  })

  // SECTION: Different file paths
  test('works with deeply nested file path', () => {
    const { context, reports } = createMockContext({}, '/packages/app/src/utils/helpers/file.test.ts')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('works with .test.jsx files', () => {
    const { context, reports } = createMockContext({}, '/src/component.test.jsx')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  test('works with non-test file paths', () => {
    const { context, reports } = createMockContext({}, '/src/utils.ts')
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', createExpectCall({ type: 'Identifier', name: 'x' })))
    expect(reports.length).toBe(1)
  })

  // SECTION: Additional edge cases
  test('handles VariableDeclarator with explicit undefined init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'result' },
      init: undefined,
    })
    expect(reports.length).toBe(0)
  })

  test('handles node without id property but with expect init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!({
      type: 'VariableDeclarator',
      init: createExpectCall({ type: 'Identifier', name: 'x' }),
    })
    expect(reports.length).toBe(1)
  })

  test('does not report const x = void 0', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', {
      type: 'UnaryExpression',
      operator: 'void',
      argument: { type: 'Literal', value: 0 },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports with expect called with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'expect' },
      arguments: [],
    }))
    expect(reports.length).toBe(1)
  })

  // SECTION: Additional unique tests (91-95)
  test('does not report for AssignmentExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' },
    }))
    expect(reports.length).toBe(0)
  })

  test('reports expect(x).not.resolves.toBe(1)', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: createExpectCall({ type: 'Identifier', name: 'x' }),
            property: { type: 'Identifier', name: 'not' },
          },
          property: { type: 'Identifier', name: 'resolves' },
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    }))
    expect(reports.length).toBe(1)
  })

  test('does not report for SequenceExpression init', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('x', {
      type: 'SequenceExpression',
      expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
    }))
    expect(reports.length).toBe(0)
  })

  test('visitor only has VariableDeclarator handler', () => {
    const { context } = createMockContext()
    const visitor = rule.create(context)
    expect(Object.keys(visitor)).toEqual(['VariableDeclarator'])
  })

  test('does not report for LogicalExpression with expect on right', () => {
    const { context, reports } = createMockContext()
    const visitor = rule.create(context)
    visitor.VariableDeclarator!(createVariableDeclarator('r', {
      type: 'LogicalExpression',
      operator: '||',
      left: { type: 'Literal', value: false },
      right: createExpectCall({ type: 'Identifier', name: 'x' }),
    }))
    expect(reports.length).toBe(0)
  })
})
