import { describe, expect, test, vi } from 'vitest'
import { noStringCaseConvertRule } from '../../../../src/rules/patterns/no-string-case-convert.js'
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
    getSource: () => '"hello".toLowerCase()',
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

function makeCallExpr(
  methodName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Literal', value: 'hello', _parent: null },
      property: { type: 'Identifier', name: methodName, _parent: null },
      _parent: null,
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    _parent: null,
  }
}

// ===== META TESTS (8) =====

describe('no-string-case-convert rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noStringCaseConvertRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noStringCaseConvertRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noStringCaseConvertRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noStringCaseConvertRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noStringCaseConvertRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning string case conversion', () => {
      const desc = noStringCaseConvertRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/case/)
    })

    test('should have correct docs URL', () => {
      expect(noStringCaseConvertRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-string-case-convert',
      )
    })

    test('should have empty schema', () => {
      expect(noStringCaseConvertRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noStringCaseConvertRule).toBeDefined()
      expect(noStringCaseConvertRule.meta).toBeDefined()
      expect(noStringCaseConvertRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS CASE CONVERT (30) =====

  describe('positive cases — reports case convert calls', () => {
    test('reports for "hello".toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".toUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".toLocaleLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLocaleLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".toLocaleUpperCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLocaleUpperCase'))
      expect(reports.length).toBe(1)
    })

    test('report message for toLowerCase mentions method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0].message).toContain('toLowerCase')
    })

    test('report message for toUpperCase mentions method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports[0].message).toContain('toUpperCase')
    })

    test('report message for toLocaleLowerCase mentions method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLocaleLowerCase'))
      expect(reports[0].message).toContain('toLocaleLowerCase')
    })

    test('report message for toLocaleUpperCase mentions method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLocaleUpperCase'))
      expect(reports[0].message).toContain('toLocaleUpperCase')
    })

    test('report message mentions "string literals"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0].message).toContain('string literals')
    })

    test('report message mentions "variables"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0].message.toLowerCase()).toContain('variables')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      const node = makeCallExpr('toLowerCase')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message for toLowerCase is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0].message).toBe(
        'Avoid calling .toLowerCase() directly on string literals. Use it on variables or store the result.',
      )
    })

    test('report message for toUpperCase is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports[0].message).toBe(
        'Avoid calling .toUpperCase() directly on string literals. Use it on variables or store the result.',
      )
    })

    test('report message for toLocaleLowerCase is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLocaleLowerCase'))
      expect(reports[0].message).toBe(
        'Avoid calling .toLocaleLowerCase() directly on string literals. Use it on variables or store the result.',
      )
    })

    test('report message for toLocaleUpperCase is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLocaleUpperCase'))
      expect(reports[0].message).toBe(
        'Avoid calling .toLocaleUpperCase() directly on string literals. Use it on variables or store the result.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports.length).toBe(2)
    })

    test('reports all four case methods in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      visitor.CallExpression(makeCallExpr('toLocaleLowerCase'))
      visitor.CallExpression(makeCallExpr('toLocaleUpperCase'))
      expect(reports.length).toBe(4)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for toLowerCase with arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: null,
      })
      expect(reports.length).toBe(1)
    })

    test('reports with correct end loc from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase', 3, 5, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for chained case convert call', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn', _parent: null },
            arguments: [],
            _parent: null,
          },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: null,
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      const node = makeCallExpr('toLowerCase')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports only once per call expression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase', 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('mixed case methods accumulate correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports.length).toBe(3)
    })

    test('report message includes method name with dot prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      expect(reports[0].message).toContain('.toLowerCase()')
    })

    test('report message includes "store the result"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports[0].message).toContain('store the result')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        _parent: null,
      })
      expect(reports.length).toBe(1)
    })

    test('reports for toLowerCase with computed false', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'test', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          computed: false,
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(2, 0, 2, 18),
        _parent: null,
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toLowerCase', _parent: null },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
        _parent: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Literal', value: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not a case method', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('charAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "trim"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "split"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('split'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "replace"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('replace'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "substring"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('substring'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr(''))
      expect(reports.length).toBe(0)
    })

    test('does not report when property Identifier has no name', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "indexOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('indexOf'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noStringCaseConvertRule.create(ctx1)
      const visitor2 = noStringCaseConvertRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('toLowerCase'))
      visitor2.CallExpression(makeCallExpr('trim'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      visitor.CallExpression(makeCallExpr('charAt'))
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        _parent: null,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        _parent: null,
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('charAt'))
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      visitor.CallExpression(makeCallExpr('trim'))
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      visitor.CallExpression(makeCallExpr('replace'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noStringCaseConvertRule.create(context)
      const visitor2 = noStringCaseConvertRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noStringCaseConvertRule.meta
      const meta2 = noStringCaseConvertRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noStringCaseConvertRule).toBeDefined()
      expect(typeof noStringCaseConvertRule.create).toBe('function')
      expect(typeof noStringCaseConvertRule.meta).toBe('object')
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: {},
        _parent: null,
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
        _parent: null,
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase'))
      visitor.CallExpression(makeCallExpr('toUpperCase'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('case sensitivity: does not report for "TOLOWERCASE"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('TOLOWERCASE'))
      expect(reports.length).toBe(0)
    })

    test('case sensitivity: does not report for "ToLowercase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('ToLowercase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "lowercase" (not a case method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('lowercase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "toLower" (partial match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLower'))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "toUpper" (partial match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toUpper'))
      expect(reports.length).toBe(0)
    })

    test('reports correctly for case method with arguments in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello', _parent: null },
          property: { type: 'Identifier', name: 'toLocaleLowerCase', _parent: null },
          _parent: null,
        },
        arguments: [{ type: 'Literal', value: 'en-US' }],
        loc: makeLoc(1, 0, 1, 30),
        _parent: null,
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for "toLowerCase" with extra characters in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringCaseConvertRule.create(context)
      visitor.CallExpression(makeCallExpr('toLowerCase2'))
      expect(reports.length).toBe(0)
    })
  })
})
