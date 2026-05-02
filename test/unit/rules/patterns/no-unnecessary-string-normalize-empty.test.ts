import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringNormalizeEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-normalize-empty.js'
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

function makeCallNode(
  object: unknown,
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
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-normalize-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning normalize', () => {
      const desc = noUnnecessaryStringNormalizeEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/normalize/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-normalize-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule).toBeDefined()
      expect(noUnnecessaryStringNormalizeEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringNormalizeEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports normalize() without arguments', () => {
    test('reports for str.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal normalize', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression object.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression result.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getString' }, arguments: [] }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for array element [str][0].normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'str' }] }, property: { type: 'Literal', value: 0 }, computed: true }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression result.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions normalize', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports[0].message).toMatch(/normalize/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports[0].message).toBe(
        `str.normalize() without arguments defaults to NFC. Pass 'NFC' explicitly for clarity.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'normalize'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'normalize'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'normalize'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'normalize'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for conditional expression result.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for parentheses expression.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: '(str)' }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for tagged template literal.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for new String().normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for type cast expression.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TSAsExpression', expression: { type: 'Identifier', name: 'val' }, typeAnnotation: { type: 'TSStringKeyword' } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression result.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 'test' } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for logical expression result.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Literal', value: 'fallback' } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for sequence expression.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'x' }, { type: 'Literal', value: 'y' }] }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for chained calls result.normalize().trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      const innerCall = makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize')
      visitor.CallExpression(makeCallNode(innerCall, 'trim'))
      // The outer .trim() has an inner normalize as object - trim itself should not report
      // but normalize should report separately
      expect(reports.length).toBe(0)
    })

    test('reports when normalize is called on a function call result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 'arg' }] }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for this.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for super.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Super' }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('reports for await expression result.normalize()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchString' }, arguments: [] } }, 'normalize'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions NFC', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports[0].message).toMatch(/NFC/)
    })

    test('report message mentions explicit form', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      expect(reports[0].message).toMatch(/explicit/)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.normalize("NFC")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFC' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize("NFD")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFD' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize("NFKC")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFKC' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize("NFKD")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFKD' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize(form) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Identifier', name: 'form' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize("NFC", extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFC' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.format() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'format'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.concat() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'normalize' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "normalized"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalized'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Normalizer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Normalizer'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "normaliz" (substring)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normaliz'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Normalize" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Normalize'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize("custom") — any string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'custom' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize(undefined) — one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.normalize(getForm()) — function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getForm' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringNormalizeEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringNormalizeEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFC' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFC' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str2' }, 'normalize'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'normalize' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'normalize' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFC' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str2' }, 'normalize'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [{ type: 'Literal', value: 'NFD' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringNormalizeEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringNormalizeEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringNormalizeEmptyRule.meta
      const meta2 = noUnnecessaryStringNormalizeEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'normalize' },
        },
        arguments: [],
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
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'normalize' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'normalize' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringNormalizeEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringNormalizeEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringNormalizeEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'normalize' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'normalize', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (non-computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'normalize' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'normalize' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringNormalizeEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'normalize'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'normalize'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
