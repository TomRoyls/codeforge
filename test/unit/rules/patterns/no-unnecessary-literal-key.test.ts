import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryLiteralKeyRule } from '../../../../src/rules/patterns/no-unnecessary-literal-key.js'
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

function makeTSPropertySignature(
  keyValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'TSPropertySignature',
    key: { type: 'Literal', value: keyValue },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-literal-key rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryLiteralKeyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryLiteralKeyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryLiteralKeyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryLiteralKeyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryLiteralKeyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning quoted key', () => {
      const desc = noUnnecessaryLiteralKeyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/quot/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryLiteralKeyRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-literal-key',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryLiteralKeyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSPropertySignature', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      expect(visitor).toHaveProperty('TSPropertySignature')
      expect(typeof visitor.TSPropertySignature).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryLiteralKeyRule).toBeDefined()
      expect(noUnnecessaryLiteralKeyRule.meta).toBeDefined()
      expect(noUnnecessaryLiteralKeyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY QUOTED KEY (25) =====

  describe('positive cases — reports unnecessary quoted key', () => {
    test('reports for simple key "name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "age"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('age'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "_private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "$jquery"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('$jquery'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "camelCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('camelCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "snake_case"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('snake_case'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "PascalCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('PascalCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "UPPER_CASE"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('UPPER_CASE'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "__dunder"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('__dunder'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "$"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('$'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('_'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "key123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('key123'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "_123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('_123'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "$123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('$123'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "a1b2c3"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('a1b2c3'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "toString"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('toString'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "valueOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('valueOf'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "__proto__', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('__proto__'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "constructor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('constructor'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "hasOwnProperty"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "x_y_z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('x_y_z'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "ABC"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('ABC'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "___"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('___'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "$$$"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('$$$'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains key name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0].message).toContain('name')
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "quoted key"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0].message).toContain('quoted key')
    })

    test('report message mentions "unquoted"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0].message).toContain('unquoted')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0].message).toBe(
        "Unnecessary quoted key 'name'. Use unquoted 'name' instead.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TSPropertySignature node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      const node = makeTSPropertySignature('name')
      visitor.TSPropertySignature(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name', 3, 2, 7, 20))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report message includes correct key for "age"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('age'))
      expect(reports[0].message).toBe(
        "Unnecessary quoted key 'age'. Use unquoted 'age' instead.",
      )
    })

    test('report message includes correct key for "_private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('_private'))
      expect(reports[0].message).toBe(
        "Unnecessary quoted key '_private'. Use unquoted '_private' instead.",
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      visitor.TSPropertySignature(makeTSPropertySignature('age'))
      expect(reports.length).toBe(2)
    })

    test('all accumulated reports have correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      visitor.TSPropertySignature(makeTSPropertySignature('age'))
      expect(reports[0].message).toBe("Unnecessary quoted key 'name'. Use unquoted 'name' instead.")
      expect(reports[1].message).toBe("Unnecessary quoted key 'age'. Use unquoted 'age' instead.")
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for key with space "first name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('first name'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with hyphen "font-size"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('font-size'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key starting with number "1st"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('1st'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with special char "data-id"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('data-id'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with dot "obj.prop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('obj.prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string key ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with slash "path/to"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('path/to'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with at sign "user@email"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('user@email'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with hash "id#1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('id#1'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with exclamation "key!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('key!'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key starting with digit "0abc"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('0abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key "123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('123'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key "background-color"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('background-color'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key "aria-label"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('aria-label'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key "class name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('class name'))
      expect(reports.length).toBe(0)
    })

    test('does not report when key value is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when key value is boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when key value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not TSPropertySignature', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'Property',
        key: { type: 'Literal', value: 'name' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      expect(() => visitor.TSPropertySignature(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      expect(() => visitor.TSPropertySignature(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      expect(() => visitor.TSPropertySignature({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when key is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when key is primitive string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: 'name',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryLiteralKeyRule.create(ctx1)
      const visitor2 = noUnnecessaryLiteralKeyRule.create(ctx2)
      visitor1.TSPropertySignature(makeTSPropertySignature('name'))
      visitor2.TSPropertySignature(makeTSPropertySignature('font-size'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      visitor.TSPropertySignature(makeTSPropertySignature('font-size'))
      visitor.TSPropertySignature(makeTSPropertySignature('age'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      const node = { type: 'TSPropertySignature', key: { type: 'Literal', value: 'name' } }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      const node = { type: 'TSPropertySignature', key: { type: 'Literal', value: 'name' } }
      visitor.TSPropertySignature(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name'))
      visitor.TSPropertySignature(makeTSPropertySignature('font-size'))
      visitor.TSPropertySignature(makeTSPropertySignature('age'))
      visitor.TSPropertySignature(makeTSPropertySignature('1st'))
      visitor.TSPropertySignature(makeTSPropertySignature('x'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryLiteralKeyRule.create(context)
      const visitor2 = noUnnecessaryLiteralKeyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryLiteralKeyRule.meta
      const meta2 = noUnnecessaryLiteralKeyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'name' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        computed: false,
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'name' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'name' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      const node = makeTSPropertySignature('name')
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryLiteralKeyRule).toBeDefined()
      expect(typeof noUnnecessaryLiteralKeyRule.create).toBe('function')
      expect(typeof noUnnecessaryLiteralKeyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'name' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('handles key with reserved word as value "class"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('class'))
      expect(reports.length).toBe(1)
    })

    test('handles key with reserved word "return"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('return'))
      expect(reports.length).toBe(1)
    })

    test('handles key with reserved word "function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('function'))
      expect(reports.length).toBe(1)
    })

    test('does not report for key "2d"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('2d'))
      expect(reports.length).toBe(0)
    })

    test('handles key with unicode-like "résumé"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('résumé'))
      expect(reports.length).toBe(0)
    })

    test('handles key with emoji "name🎉"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLiteralKeyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertySignature('name🎉'))
      expect(reports.length).toBe(0)
    })
  })
})
