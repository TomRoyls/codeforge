import { describe, expect, test, vi } from 'vitest'
import { noRegexConcatRule } from '../../../../src/rules/security/no-regex-concat.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

interface CapturedReport {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: CapturedReport[] } {
  const reports: CapturedReport[] = []
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeStringLiteral(value: string, line = 1, column = 0) {
  return {
    type: 'Literal',
    value,
    loc: makeLoc(line, column, line, column + value.length + 2),
  }
}

function makeIdentifier(name: string, line = 1, column = 0) {
  return {
    type: 'Identifier',
    name,
    loc: makeLoc(line, column, line, column + name.length),
  }
}

function makeBinaryExpr(left: unknown, operator: string, right: unknown, line = 1, column = 0) {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(line, column, line, column + 20),
  }
}

function makeNewExpr(callee: unknown, args: unknown[], line = 1, column = 0) {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: makeLoc(line, column, line, column + 30),
  }
}

describe('no-regex-concat rule', () => {

  // ===== META TESTS (10) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRegexConcatRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRegexConcatRule.meta.severity).toBe('warn')
    })

    test('should have correct category "security"', () => {
      expect(noRegexConcatRule.meta.docs?.category).toBe('security')
    })

    test('should not be recommended', () => {
      expect(noRegexConcatRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRegexConcatRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "RegExp" and "concatenation"', () => {
      const desc = noRegexConcatRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/regexp/)
      expect(desc).toMatch(/concaten/)
    })

    test('should have correct docs URL', () => {
      expect(noRegexConcatRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-regex-concat',
      )
    })

    test('should have empty schema', () => {
      expect(noRegexConcatRule.meta.schema).toEqual([])
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noRegexConcatRule.meta.docs?.description).toBe('string')
      expect(noRegexConcatRule.meta.docs?.description!.length).toBeGreaterThan(0)
    })

    test('meta severity is one of valid values', () => {
      expect(['error', 'warn', 'off']).toContain(noRegexConcatRule.meta.severity)
    })
  })

  // ===== STRUCTURE TESTS (3) =====
  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRegexConcatRule).toBeDefined()
      expect(noRegexConcatRule.meta).toBeDefined()
      expect(noRegexConcatRule.create).toBeDefined()
    })

    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noRegexConcatRule.meta
      const meta2 = noRegexConcatRule.meta
      expect(meta1).toBe(meta2)
    })
  })

  // ===== POSITIVE CASES (25) =====
  describe('positive cases — reports regex concat', () => {
    test('reports new RegExp("a" + variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('variable'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(variable + "b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeIdentifier('variable'), '+', makeStringLiteral('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp("prefix" + "suffix")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('prefix'), '+', makeStringLiteral('suffix'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message contains "concatenating strings"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0].message).toContain('concatenating strings')
    })

    test('report message contains "regex patterns"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0].message).toContain('regex patterns')
    })

    test('report has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
        5, 3,
      )
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('accumulation works — multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node1 = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      const node2 = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeIdentifier('x'), '+', makeStringLiteral('y'))],
      )
      visitor.NewExpression(node1)
      visitor.NewExpression(node2)
      expect(reports.length).toBe(2)
    })

    test('reports when left is StringLiteral and right is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(
          makeStringLiteral('^'),
          '+',
          { type: 'CallExpression', callee: makeIdentifier('escape'), arguments: [], loc: makeLoc(1, 0, 1, 10) },
        )],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports when left is CallExpression and right is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(
          { type: 'CallExpression', callee: makeIdentifier('escape'), arguments: [], loc: makeLoc(1, 0, 1, 10) },
          '+',
          makeStringLiteral('$'),
        )],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with location end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
        7, 2,
      )
      visitor.NewExpression(node)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('reports new RegExp(stringLiteral + memberExpr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const memberExpr = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('pattern'),
        loc: makeLoc(1, 0, 1, 12),
      }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('^hello'), '+', memberExpr)],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(memberExpr + stringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const memberExpr = {
        type: 'MemberExpression',
        object: makeIdentifier('config'),
        property: makeIdentifier('suffix'),
        loc: makeLoc(1, 0, 1, 13),
      }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(memberExpr, '+', makeStringLiteral('$'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(stringLiteral + numericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const numericLiteral = { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('\\d{'), '+', numericLiteral)],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp', 12, 8),
        [makeBinaryExpr(makeStringLiteral('abc'), '+', makeIdentifier('dyn'), 12, 20)],
        12, 4,
      )
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('reports when second argument to RegExp exists alongside concat first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b')), makeStringLiteral('gi')],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(empty string + variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral(''), '+', makeIdentifier('pattern'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(variable + empty string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeIdentifier('pattern'), '+', makeStringLiteral(''))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('message says "Avoid concatenating strings to build regex patterns"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0].message).toMatch(/Avoid concatenating strings to build regex patterns/)
    })

    test('message mentions single string literal or template', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports[0].message).toMatch(/single string literal or template/)
    })

    test('reports new RegExp(longStringLiteral + conditionalExpr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const conditional = {
        type: 'ConditionalExpression',
        test: makeIdentifier('flag'),
        consequent: makeStringLiteral('a'),
        alternate: makeStringLiteral('b'),
        loc: makeLoc(1, 0, 1, 20),
      }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('prefix_'), '+', conditional)],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp(arrayExpr + stringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const arrayExpr = {
        type: 'ArrayExpression',
        elements: [makeStringLiteral('a'), makeStringLiteral('b')],
        loc: makeLoc(1, 0, 1, 10),
      }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(arrayExpr, '+', makeStringLiteral('suffix'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report new RegExp("static")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeStringLiteral('static')],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeIdentifier('variable')],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp(memberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const memberExpr = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('regex'),
        loc: makeLoc(1, 0, 1, 10),
      }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [memberExpr],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new OtherConstructor("a" + b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('OtherConstructor'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp(varA + varB) with no StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeIdentifier('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp("a" - "b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '-', makeStringLiteral('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp("a" * variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '*', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(makeIdentifier('RegExp'), [])
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: makeIdentifier('RegExp'),
        arguments: [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: makeIdentifier('global'),
        property: makeIdentifier('RegExp'),
        loc: makeLoc(1, 0, 1, 15),
      }
      const node = makeNewExpr(
        callee,
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const callee = {
        type: 'FunctionExpression',
        id: makeIdentifier('RegExp'),
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      const node = makeNewExpr(
        callee,
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp(templateLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const templateLiteral = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [makeIdentifier('name')],
        loc: makeLoc(1, 0, 1, 15),
      }
      const node = makeNewExpr(makeIdentifier('RegExp'), [templateLiteral])
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-object node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp("a" / variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '/', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp("a" % variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '%', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp("a" === "b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '===', makeStringLiteral('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp("a" !== variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '!==', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "regexp" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('regexp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "REGEXP" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('REGEXP'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "RegExpr"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExpr'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp(variable + variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeIdentifier('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp(callExpr + callExpr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const callA = { type: 'CallExpression', callee: makeIdentifier('getA'), arguments: [], loc: makeLoc(1, 0, 1, 5) }
      const callB = { type: 'CallExpression', callee: makeIdentifier('getB'), arguments: [], loc: makeLoc(1, 6, 1, 11) }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(callA, '+', callB)],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const logical = {
        type: 'LogicalExpression',
        operator: '||',
        left: makeStringLiteral('a'),
        right: makeStringLiteral('b'),
        loc: makeLoc(1, 0, 1, 10),
      }
      const node = makeNewExpr(makeIdentifier('RegExp'), [logical])
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: makeIdentifier('RegExp'),
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = {
        type: 'NewExpression',
        arguments: [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(makeIdentifier('RegExp'), [null])
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when BinaryExpression has "==" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '==', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when BinaryExpression has "<" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '<', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when BinaryExpression has ">" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '>', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when BinaryExpression has "&" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '&', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier but StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const callee = makeStringLiteral('RegExp')
      const node = makeNewExpr(
        callee,
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node has numeric type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = {
        type: 42,
        callee: makeIdentifier('RegExp'),
        arguments: [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (22) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRegexConcatRule.create(ctx1)
      const visitor2 = noRegexConcatRule.create(ctx2)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor1.NewExpression(node)
      visitor2.NewExpression(makeNewExpr(makeIdentifier('RegExp'), [makeStringLiteral('static')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noRegexConcatRule.create(context)
      const visitor2 = noRegexConcatRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: makeIdentifier('RegExp'),
        arguments: [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: makeIdentifier('RegExp'),
        arguments: [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      const extraNode = { ...node, extra: true, range: [0, 30], leadingComments: [] }
      visitor.NewExpression(extraNode)
      expect(reports.length).toBe(1)
    })

    test('handles node with null parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      const withParent = { ...node, parent: null }
      visitor.NewExpression(withParent)
      expect(reports.length).toBe(1)
    })

    test('handles node with undefined parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      const withParent = { ...node, parent: undefined }
      visitor.NewExpression(withParent)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const valid = makeNewExpr(makeIdentifier('RegExp'), [makeStringLiteral('static')])
      const invalid = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      const wrongCallee = makeNewExpr(
        makeIdentifier('Other'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(valid)
      visitor.NewExpression(invalid)
      visitor.NewExpression(wrongCallee)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('does not report BinaryExpression with left as NumericLiteral and right as StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const numericLeft = { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(numericLeft, '+', makeStringLiteral('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report BinaryExpression with left as StringLiteral and right as BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const boolRight = { type: 'BooleanLiteral', value: true, loc: makeLoc(1, 0, 1, 4) }
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', boolRight)],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not crash with deeply nested BinaryExpression in arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const inner = makeBinaryExpr(makeIdentifier('a'), '+', makeIdentifier('b'))
      const outer = makeBinaryExpr(makeStringLiteral('prefix'), '+', inner)
      const node = makeNewExpr(makeIdentifier('RegExp'), [outer])
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles arguments with undefined first element', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: makeIdentifier('RegExp'),
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles arguments as empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(makeIdentifier('RegExp'), [])
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee with no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const callee = { type: 'Identifier', loc: makeLoc(1, 0, 1, 6) }
      const node = makeNewExpr(
        callee,
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier(''),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node where parent exists but is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeBinaryExpr(makeStringLiteral('a'), '+', makeIdentifier('b'))],
      )
      const withParent = { ...node, parent: 'not-an-object' }
      visitor.NewExpression(withParent)
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports correctly across many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(
          makeNewExpr(
            makeIdentifier('RegExp'),
            [makeBinaryExpr(makeStringLiteral(`p${i}`), '+', makeIdentifier(`v${i}`))],
          ),
        )
      }
      expect(reports.length).toBe(5)
    })

    test('correctly ignores second argument when first is valid', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const node = makeNewExpr(
        makeIdentifier('RegExp'),
        [makeStringLiteral('pattern'), makeStringLiteral('flags')],
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles new RegExp with BooleanLiteral as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const boolArg = { type: 'BooleanLiteral', value: true, loc: makeLoc(1, 0, 1, 4) }
      const node = makeNewExpr(makeIdentifier('RegExp'), [boolArg])
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('rule export has create and meta properties', () => {
      expect(noRegexConcatRule).toBeDefined()
      expect(typeof noRegexConcatRule.create).toBe('function')
      expect(typeof noRegexConcatRule.meta).toBe('object')
    })
  })

  describe('ESTree literal compatibility', () => {
    test('reports when left side is ESTree Literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const left = { type: 'Literal', value: 'foo' }
      const right = makeIdentifier('bar')
      const arg = makeBinaryExpr(left, '+', right)
      const node = makeNewExpr(makeIdentifier('RegExp'), [arg])
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports when right side is ESTree Literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const left = makeIdentifier('bar')
      const right = { type: 'Literal', value: 'foo' }
      const arg = makeBinaryExpr(left, '+', right)
      const node = makeNewExpr(makeIdentifier('RegExp'), [arg])
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when neither side is a string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexConcatRule.create(context)
      const left = makeIdentifier('a')
      const right = makeIdentifier('b')
      const arg = makeBinaryExpr(left, '+', right)
      const node = makeNewExpr(makeIdentifier('RegExp'), [arg])
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
