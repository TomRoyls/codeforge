import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryIncludesRule } from '../../../../src/rules/patterns/no-unnecessary-includes.js'
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
    getSource: () => '[].includes("x")',
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

function makeArrayExpression(
  elements: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'ArrayExpression',
    elements,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallExpression(
  objectNode: unknown,
  methodName: string,
  args: unknown[] = [],
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: objectNode,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(1, 0, 1, 20),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-includes rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryIncludesRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryIncludesRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryIncludesRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryIncludesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryIncludesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning includes', () => {
      const desc = noUnnecessaryIncludesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/includes/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryIncludesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-includes',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryIncludesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryIncludesRule).toBeDefined()
      expect(noUnnecessaryIncludesRule.meta).toBeDefined()
      expect(noUnnecessaryIncludesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY INCLUDES (30) =====

  describe('positive cases — reports unnecessary includes', () => {
    test('reports for [].includes("x")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [].includes() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(makeCallExpression(makeArrayExpression([]), 'includes'))
      expect(reports.length).toBe(1)
    })

    test('reports for [].includes(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: null },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [].includes(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 42 },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [].includes(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: true },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [].includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: '' },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ["a"].includes("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'a' }]),
          'includes',
          [{ type: 'Literal', value: 'a' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [1].includes(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 1 }]),
          'includes',
          [{ type: 'Literal', value: 1 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [true].includes(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: true }]),
          'includes',
          [{ type: 'Literal', value: true }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [null].includes(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: null }]),
          'includes',
          [{ type: 'Literal', value: null }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [x].includes(x) with Identifier element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Identifier', name: 'x' }]),
          'includes',
          [{ type: 'Identifier', name: 'x' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [{ key: 1 }].includes(obj) with ObjectExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'ObjectExpression', properties: [] }]),
          'includes',
          [{ type: 'Identifier', name: 'obj' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [fn()].includes(val) with CallExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          ]),
          'includes',
          [{ type: 'Identifier', name: 'val' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for single element array without search argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 1 }]),
          'includes',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ["hello world"].includes("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'hello world' }]),
          'includes',
          [{ type: 'Literal', value: 'hello' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [0].includes(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 0 }]),
          'includes',
          [{ type: 'Literal', value: 0 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [() => {}].includes(fn) with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          ]),
          'includes',
          [{ type: 'Identifier', name: 'fn' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [/regex/].includes(r) with regex literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'RegExpLiteral', pattern: 'regex', flags: '' }]),
          'includes',
          [{ type: 'Identifier', name: 'r' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions ".includes()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0].message).toContain('.includes()')
    })

    test('report message mentions "0 or 1 elements"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0].message).toContain('0 or 1 elements')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'includes', [
        { type: 'Literal', value: 'x' },
      ])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0].message).toBe(
        'Unnecessary .includes() call on an array with 0 or 1 elements.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'a' },
        ]),
      )
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'b' }]),
          'includes',
          [{ type: 'Literal', value: 'b' }],
        ),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes'),
      )
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'x' }]),
          'includes',
        ),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryIncludesRule.create(ctx1)
      const visitor2 = noUnnecessaryIncludesRule.create(ctx2)
      visitor1.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes'),
      )
      visitor2.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]),
          'includes',
        ),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      const node = makeCallExpression(makeArrayExpression([]), 'includes')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (33) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for [1, 2].includes(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
          'includes',
          [{ type: 'Literal', value: 1 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for ["a", "b"].includes("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]),
          'includes',
          [{ type: 'Literal', value: 'a' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3].includes(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
            { type: 'Literal', value: 3 },
          ]),
          'includes',
          [{ type: 'Literal', value: 2 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for ["a", "b", "c"].includes("b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 'a' },
            { type: 'Literal', value: 'b' },
            { type: 'Literal', value: 'c' },
          ]),
          'includes',
          [{ type: 'Literal', value: 'b' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for large array [1,2,3,4,5].includes(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
            { type: 'Literal', value: 3 },
            { type: 'Literal', value: 4 },
            { type: 'Literal', value: 5 },
          ]),
          'includes',
          [{ type: 'Literal', value: 3 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for mixed types [1, "a", true].includes(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 'a' },
            { type: 'Literal', value: true },
          ]),
          'includes',
          [{ type: 'Literal', value: 1 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [null, undefined].includes(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Literal', value: null },
            { type: 'Identifier', name: 'undefined' },
          ]),
          'includes',
          [{ type: 'Literal', value: null }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [obj, arr].includes(obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Identifier', name: 'obj' },
            { type: 'Identifier', name: 'arr' },
          ]),
          'includes',
          [{ type: 'Identifier', name: 'obj' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [x, y].includes(x) with Identifier elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'Identifier', name: 'x' },
            { type: 'Identifier', name: 'y' },
          ]),
          'includes',
          [{ type: 'Identifier', name: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [...a, ...b].includes(val) with spread elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([
            { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
            { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
          ]),
          'includes',
          [{ type: 'Identifier', name: 'val' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier.includes("x")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'Identifier', name: 'arr', loc: makeLoc(1, 0, 1, 3) },
          'includes',
          [{ type: 'Literal', value: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.includes("x")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'Identifier', name: 'variable', loc: makeLoc(1, 0, 1, 8) },
          'includes',
          [{ type: 'Literal', value: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.prop.includes("x") with nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
            loc: makeLoc(1, 0, 1, 8),
          },
          'includes',
          [{ type: 'Literal', value: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for fn().includes("x") with CallExpression result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
            loc: makeLoc(1, 0, 1, 5),
          },
          'includes',
          [{ type: 'Literal', value: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for "string".includes("s") with Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'Literal', value: 'string', loc: makeLoc(1, 0, 1, 8) },
          'includes',
          [{ type: 'Literal', value: 's' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for `template`.includes("t") with TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'template', cooked: 'template' } }],
            expressions: [],
            loc: makeLoc(1, 0, 1, 10),
          },
          'includes',
          [{ type: 'Literal', value: 't' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for {}.includes("x") with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) },
          'includes',
          [{ type: 'Literal', value: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set().includes("x") with NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Set' },
            arguments: [],
            loc: makeLoc(1, 0, 1, 9),
          },
          'includes',
          [{ type: 'Literal', value: 'x' }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].indexOf("x")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'indexOf', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'find', [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].filter(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'filter', [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'map', [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].forEach(x => {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'forEach', [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].some(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'some', [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].every(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'every', [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reduce((a,b) => a)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'reduce', [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'Identifier', name: 'a' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (22) =====

  describe('edge cases', () => {
    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryIncludesRule.create(context)
      const visitor2 = noUnnecessaryIncludesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryIncludesRule.meta
      const meta2 = noUnnecessaryIncludesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryIncludesRule).toBeDefined()
      expect(typeof noUnnecessaryIncludesRule.create).toBe('function')
      expect(typeof noUnnecessaryIncludesRule.meta).toBe('object')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes'),
      )
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]),
          'includes',
        ),
      )
      visitor.CallExpression(
        makeCallExpression(
          { type: 'Identifier', name: 'arr', loc: makeLoc(1, 0, 1, 3) },
          'includes',
        ),
      )
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'x' }]),
          'includes',
        ),
      )
      expect(reports.length).toBe(2)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'includes'),
      )
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]),
          'includes',
        ),
      )
      visitor.CallExpression(
        makeCallExpression(
          makeArrayExpression([{ type: 'Literal', value: 'x' }]),
          'includes',
        ),
      )
      expect(reports.length).toBe(2)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is Literal (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Literal', value: 'includes' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: 'not-array', loc: makeLoc(1, 0, 1, 2) },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([], 10, 4, 10, 6), 'includes'),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('handles node with arguments array populated', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [
          { type: 'Literal', value: 'x' },
          { type: 'Literal', value: 0 },
        ],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when property name is "include" (typo for includes)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression(
        makeCallExpression(makeArrayExpression([]), 'include', [
          { type: 'Literal', value: 'x' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: [1, 2, 3],
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpression([]),
          property: 42,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when elements property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIncludesRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', loc: makeLoc(1, 0, 1, 2) },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})
