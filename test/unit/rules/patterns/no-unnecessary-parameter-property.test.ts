import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryParameterPropertyRule } from '../../../../src/rules/patterns/no-unnecessary-parameter-property.js'
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
    getSource: () => 'class Foo { constructor(private readonly value: string) {} }',
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

function makeTSParamProp(
  accessibility: string,
  readonly: boolean,
  paramName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'TSParameterProperty',
    accessibility,
    readonly,
    parameter: { type: 'Identifier', name: paramName },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-parameter-property rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryParameterPropertyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryParameterPropertyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryParameterPropertyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryParameterPropertyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryParameterPropertyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning parameter property', () => {
      const desc = noUnnecessaryParameterPropertyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/parameter/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryParameterPropertyRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-parameter-property',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryParameterPropertyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSParameterProperty', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(visitor).toHaveProperty('TSParameterProperty')
      expect(typeof visitor.TSParameterProperty).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryParameterPropertyRule).toBeDefined()
      expect(noUnnecessaryParameterPropertyRule.meta).toBeDefined()
      expect(noUnnecessaryParameterPropertyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY PARAMETER PROPERTY (25) =====

  describe('positive cases — reports unnecessary parameter property', () => {
    test('reports for private readonly parameter property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports.length).toBe(1)
    })

    test('reports for public readonly parameter property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'name'))
      expect(reports.length).toBe(1)
    })

    test('reports for protected readonly parameter property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('protected', true, 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports for private readonly with single-char param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'x'))
      expect(reports.length).toBe(1)
    })

    test('reports for public readonly with underscore param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('public', true, '_internal'))
      expect(reports.length).toBe(1)
    })

    test('reports for protected readonly with dollar sign param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('protected', true, '$price'))
      expect(reports.length).toBe(1)
    })

    test('reports for private readonly with long param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'veryLongDescriptiveParameterName'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary parameter property modifier"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].message).toContain('Unnecessary parameter property modifier')
    })

    test('report message includes parameter name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'myParam'))
      expect(reports[0].message).toContain('myParam')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].message).toBe(
        "Unnecessary parameter property modifier on 'value'.",
      )
    })

    test('report message uses single quotes around param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'foo'))
      expect(reports[0].message).toMatch(/'foo'/)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      const node = makeTSParamProp('private', true, 'value')
      visitor.TSParameterProperty(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'a'))
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'b'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'a'))
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'b'))
      expect(reports[0].message).toMatch(/Unnecessary parameter property modifier on 'a'\./)
      expect(reports[1].message).toMatch(/Unnecessary parameter property modifier on 'b'\./)
    })

    test('reports for private readonly with numeric-like param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'item2'))
      expect(reports.length).toBe(1)
    })

    test('reports for public readonly with camelCase param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'myValue'))
      expect(reports.length).toBe(1)
    })

    test('reports for protected readonly with short param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('protected', true, 'id'))
      expect(reports.length).toBe(1)
    })

    test('reports for node at specific location line 10 col 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'data', 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].node).toBeDefined()
    })

    test('reports for public readonly with config param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'config'))
      expect(reports.length).toBe(1)
    })

    test('reports for private readonly with options param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'options'))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value', 3, 5, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports exactly once per matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES TESTS (15) =====

  describe('report properties', () => {
    test('report descriptor has message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('report descriptor has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0]).toHaveProperty('node')
    })

    test('report loc has start property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc has end property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start has line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('report loc start has column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end has line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('report loc end has column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report message is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(typeof reports[0].message).toBe('string')
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('report node is the same reference as input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      const node = makeTSParamProp('private', true, 'value')
      visitor.TSParameterProperty(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message differs for different parameter names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'alpha'))
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'beta'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('report message contains the exact parameter name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'specificName123'))
      expect(reports[0].message).toContain('specificName123')
    })

    test('report loc reflects multi-line node span', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value', 2, 5, 4, 15))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.end.line).toBe(4)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when accessibility is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when readonly is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', false, 'value'))
      expect(reports.length).toBe(0)
    })

    test('does not report when readonly is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parameter is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parameter is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parameter type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'RestElement', argument: { type: 'Identifier', name: 'args' } },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parameter name is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parameter name is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: 42 },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not TSParameterProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'Identifier',
        name: 'value',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(() => visitor.TSParameterProperty(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(() => visitor.TSParameterProperty(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(() => visitor.TSParameterProperty({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when accessibility is a random string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('internal', true, 'value'))
      expect(reports.length).toBe(0)
    })

    test('does not report when accessibility is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('', true, 'value'))
      expect(reports.length).toBe(0)
    })

    test('does not report when accessibility is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 42,
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when readonly is string "true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: 'true',
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when readonly is number 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: 1,
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parameter is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: 'value',
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(() => visitor.TSParameterProperty('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(() => visitor.TSParameterProperty(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(() => visitor.TSParameterProperty(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      expect(() => visitor.TSParameterProperty([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryParameterPropertyRule.create(ctx1)
      const visitor2 = noUnnecessaryParameterPropertyRule.create(ctx2)
      visitor1.TSParameterProperty(makeTSParamProp('private', true, 'a'))
      visitor2.TSParameterProperty(makeTSParamProp('private', false, 'b'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'a'))
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: false,
        parameter: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'c'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      const node = {
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
      }
      visitor.TSParameterProperty(node)
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      const node = {
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        decorators: [],
      }
      visitor.TSParameterProperty(node)
      expect(reports.length).toBe(1)
    })

    test('node with empty loc object still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('node with partial loc (missing end) still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', false, 'a'))
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'b'))
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'c'))
      visitor.TSParameterProperty(makeTSParamProp('protected', false, 'd'))
      visitor.TSParameterProperty(makeTSParamProp('internal', true, 'e'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryParameterPropertyRule.create(context)
      const visitor2 = noUnnecessaryParameterPropertyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryParameterPropertyRule.meta
      const meta2 = noUnnecessaryParameterPropertyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      const node = makeTSParamProp('private', true, 'value')
      visitor.TSParameterProperty(node)
      visitor.TSParameterProperty(node)
      visitor.TSParameterProperty(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryParameterPropertyRule).toBeDefined()
      expect(typeof noUnnecessaryParameterPropertyRule.create).toBe('function')
      expect(typeof noUnnecessaryParameterPropertyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'alpha'))
      visitor.TSParameterProperty(makeTSParamProp('public', true, 'beta'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })

    test('handles node with decorators array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
        decorators: [{ type: 'Decorator', expression: {} }],
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for TSParameterProperty without accessibility and without readonly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        parameter: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location at line 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty(makeTSParamProp('private', true, 'value', 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('handles node where parameter name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: { type: 'Identifier', name: '' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where parameter is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParameterPropertyRule.create(context)
      visitor.TSParameterProperty({
        type: 'TSParameterProperty',
        accessibility: 'private',
        readonly: true,
        parameter: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('all three accessibility modifiers report correctly for same param', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const { context: ctx3, reports: rep3 } = createMockContext()
      noUnnecessaryParameterPropertyRule.create(ctx1).TSParameterProperty(makeTSParamProp('private', true, 'x'))
      noUnnecessaryParameterPropertyRule.create(ctx2).TSParameterProperty(makeTSParamProp('public', true, 'x'))
      noUnnecessaryParameterPropertyRule.create(ctx3).TSParameterProperty(makeTSParamProp('protected', true, 'x'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
      expect(rep3.length).toBe(1)
    })
  })
})
