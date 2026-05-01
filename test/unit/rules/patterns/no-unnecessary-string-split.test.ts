import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringSplitRule } from '../../../../src/rules/patterns/no-unnecessary-string-split.js'
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
    getSource: () => '',
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

function makeCallExprSplit(
  objName: string,
  argValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objName },
      property: { type: 'Identifier', name: 'split' },
    },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-split rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringSplitRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringSplitRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringSplitRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringSplitRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringSplitRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning split', () => {
      const desc = noUnnecessaryStringSplitRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/split/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringSplitRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-string-split',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringSplitRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringSplitRule).toBeDefined()
      expect(noUnnecessaryStringSplitRule.meta).toBeDefined()
      expect(noUnnecessaryStringSplitRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY SPLIT (25) =====

  describe('positive cases — reports unnecessary split', () => {
    test('reports for str.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for text.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('text', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for input.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('input', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for value.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('value', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for data.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('data', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for name.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('name', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for result.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('result', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for line.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('line', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for content.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('content', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for msg.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('msg', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for s.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('s', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for buffer.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('buffer', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for payload.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('payload', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for response.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('response', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for body.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('body', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for header.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('header', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for query.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('query', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for path.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('path', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for filename.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('filename', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for word.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('word', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for sentence.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('sentence', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for paragraph.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('paragraph', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for html.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('html', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for xml.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('xml', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for json.split("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('json', ''))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary split"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      expect(reports[0].message).toContain('Unnecessary split')
    })

    test('report message contains "empty string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      expect(reports[0].message.toLowerCase()).toContain('empty string')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      expect(reports[0].message).toBe('Unnecessary split on empty string.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '', 3, 0, 3, 12))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      visitor.CallExpression(makeCallExprSplit('text', ''))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      visitor.CallExpression(makeCallExprSplit('text', ''))
      visitor.CallExpression(makeCallExprSplit('data', ''))
      expect(reports.length).toBe(3)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report reflects specific node location line 10 column 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '', 10, 4, 10, 16))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(16)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      visitor.CallExpression(makeCallExprSplit('text', ''))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      const node = makeCallExprSplit('str', '')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('mixed valid and invalid calls count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ''))
      visitor.CallExpression(makeCallExprSplit('str', ','))
      visitor.CallExpression(makeCallExprSplit('text', ''))
      expect(reports.length).toBe(2)
    })

    test('visitor accumulates reports correctly across mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('a', ''))
      visitor.CallExpression(makeCallExprSplit('b', 'x'))
      visitor.CallExpression(makeCallExprSplit('c', ''))
      visitor.CallExpression(makeCallExprSplit('d', ''))
      visitor.CallExpression(makeCallExprSplit('e', ' '))
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.split("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', 'a'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(",")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ','))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(" ")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ' '))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("-")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '-'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(":")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', ':'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("/")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '/'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("|")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '|'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(".")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '.'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.join("") — non-split method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim() — non-split method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trim' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'split' },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'split' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: 3 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'str' },
        property: { type: 'Identifier', name: 'split' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("\\n")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression(makeCallExprSplit('str', '\n'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringSplitRule.create(ctx1)
      const visitor2 = noUnnecessaryStringSplitRule.create(ctx2)
      visitor1.CallExpression(makeCallExprSplit('str', ''))
      visitor2.CallExpression(makeCallExprSplit('str', ','))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringSplitRule.create(context)
      const visitor2 = noUnnecessaryStringSplitRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringSplitRule.meta
      const meta2 = noUnnecessaryStringSplitRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringSplitRule).toBeDefined()
      expect(typeof noUnnecessaryStringSplitRule.create).toBe('function')
      expect(typeof noUnnecessaryStringSplitRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with computed true on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments property is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [''],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is not split', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with second argument present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: '' }, { type: 'Literal', value: 2 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when first arg type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Identifier', name: 'sep' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
