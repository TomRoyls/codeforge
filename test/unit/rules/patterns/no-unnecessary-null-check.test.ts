import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNullCheckRule } from '../../../../src/rules/patterns/no-unnecessary-null-check.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'if (x !== null) { if (x !== null) {} }',
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

function makeLeft(name: string) {
  return { type: 'Identifier', name, loc: makeLoc(1, 0, 1, name.length) }
}

function buildRedundantNode(opts: {
  outerOp: string
  outerRight: unknown
  innerOp: string
  innerRight: unknown
  leftName?: string
}) {
  const leftName = opts.leftName ?? 'x'
  const left = makeLeft(leftName)
  const innerLeft = makeLeft(leftName)

  const innerBinary = {
    type: 'BinaryExpression',
    operator: opts.innerOp,
    left: innerLeft,
    right: opts.innerRight,
    loc: makeLoc(2, 4, 2, 20),
  }

  const innerIf = {
    type: 'IfStatement',
    test: innerBinary,
    consequent: { type: 'BlockStatement', body: [], loc: makeLoc(2, 20, 2, 22) },
    loc: makeLoc(2, 4, 2, 22),
  }

  const block = {
    type: 'BlockStatement',
    body: [innerIf],
    loc: makeLoc(1, 20, 3, 1),
  }

  const outerBinary = {
    type: 'BinaryExpression',
    operator: opts.outerOp,
    left,
    right: opts.outerRight,
    loc: makeLoc(1, 4, 1, 16),
    _parent: {
      type: 'IfStatement',
      test: null,
      consequent: block,
      loc: makeLoc(1, 0, 3, 1),
    },
  }

  ;(outerBinary as Record<string, unknown>)._parent = {
    type: 'IfStatement',
    test: outerBinary,
    consequent: block,
    loc: makeLoc(1, 0, 3, 1),
  }

  return outerBinary
}

describe('no-unnecessary-null-check rule', () => {
  // ===== META TESTS (8) =====
  test('should have correct type "suggestion"', () => {
    expect(noUnnecessaryNullCheckRule.meta.type).toBe('suggestion')
  })

  test('should have severity "warn"', () => {
    expect(noUnnecessaryNullCheckRule.meta.severity).toBe('warn')
  })

  test('should have correct category "patterns"', () => {
    expect(noUnnecessaryNullCheckRule.meta.docs?.category).toBe('patterns')
  })

  test('should not be recommended', () => {
    expect(noUnnecessaryNullCheckRule.meta.docs?.recommended).toBe(false)
  })

  test('should have a description', () => {
    expect(noUnnecessaryNullCheckRule.meta.docs?.description).toBeTruthy()
  })

  test('should have description mentioning redundant null', () => {
    const desc = noUnnecessaryNullCheckRule.meta.docs?.description?.toLowerCase() ?? ''
    expect(desc).toMatch(/redundant/)
  })

  test('should have correct docs URL', () => {
    expect(noUnnecessaryNullCheckRule.meta.docs?.url).toBe(
      'https://codeforge.dev/docs/rules/no-unnecessary-null-check',
    )
  })

  test('should have empty schema', () => {
    expect(noUnnecessaryNullCheckRule.meta.schema).toEqual([])
  })

  // ===== STRUCTURE TESTS (2) =====
  test('create() returns visitor with BinaryExpression', () => {
    const { context } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    expect(visitor).toHaveProperty('BinaryExpression')
    expect(typeof visitor.BinaryExpression).toBe('function')
  })

  test('default export matches named export', () => {
    expect(noUnnecessaryNullCheckRule).toBeDefined()
    expect(noUnnecessaryNullCheckRule.meta).toBeDefined()
    expect(noUnnecessaryNullCheckRule.create).toBeDefined()
  })

  // ===== POSITIVE CASES — outer !== null, inner various (15) =====
  test('reports outer !== null with inner !== null (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== null with inner === null (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '===',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== null with inner != null (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!=',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== null with inner == null (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer != null with inner !== null (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!=',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== undefined with inner !== undefined (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(1, 10, 1, 19) },
      innerOp: '!==',
      innerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(2, 10, 2, 19) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== undefined with inner === undefined (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(1, 10, 1, 19) },
      innerOp: '===',
      innerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(2, 10, 2, 19) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== null with inner !== undefined (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(2, 10, 2, 19) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== undefined with inner !== null (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(1, 10, 1, 19) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== null with inner void 0 check (same left)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'UnaryExpression', operator: 'void', argument: { type: 'NumericLiteral', value: 0 }, loc: makeLoc(2, 10, 2, 16) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== null with outer operator != for same left name', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!=',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!=',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports with different identifier name "value"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'value',
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports with different identifier name "result"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'result',
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports with outer void right side and inner null check', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'UnaryExpression', operator: 'void', argument: { type: 'NumericLiteral', value: 0 }, loc: makeLoc(1, 10, 1, 16) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports with outer void right side and inner undefined check', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'UnaryExpression', operator: 'void', argument: { type: 'NumericLiteral', value: 0 }, loc: makeLoc(1, 10, 1, 16) },
      innerOp: '!==',
      innerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(2, 10, 2, 19) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  // ===== MESSAGE AND REPORT CONTENT (5) =====
  test('report message contains "Redundant"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports[0].message).toContain('Redundant')
  })

  test('report message contains "null/undefined"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports[0].message).toContain('null/undefined')
  })

  test('report has loc property', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports[0].loc).toBeDefined()
  })

  test('report has node property pointing to inner binary', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports[0].node).toBeDefined()
    expect((reports[0].node as Record<string, unknown>).type).toBe('BinaryExpression')
  })

  test('report loc matches inner binary location', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports[0].loc?.start.line).toBe(2)
    expect(reports[0].loc?.start.column).toBe(4)
  })

  // ===== NEGATIVE CASES — operator checks (5) =====
  test('does not report when outer operator is ===', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '===',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when outer operator is ==', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when outer operator is +', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '+',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: { type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] } },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when outer operator is >', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '>',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: { type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] } },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when outer operator is <', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '<',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: { type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] } },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== NEGATIVE CASES — right side checks (5) =====
  test('does not report when outer right is Identifier but not "undefined"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'Identifier', name: 'foo', loc: makeLoc(1, 10, 1, 13) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when outer right is Literal (not null)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NumericLiteral', value: 0, loc: makeLoc(1, 10, 1, 11) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when outer right is UnaryExpression but not void', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 10, 1, 12) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner right is not null/undefined/void', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NumericLiteral', value: 0, loc: makeLoc(2, 10, 2, 11) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner right is Identifier but not "undefined"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'Identifier', name: 'bar', loc: makeLoc(2, 10, 2, 13) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== NEGATIVE CASES — parent structure checks (6) =====
  test('does not report when parent is not IfStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = makeLeft('x')
    const innerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      loc: makeLoc(2, 4, 2, 20),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'ExpressionStatement',
        expression: null,
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when parent has no consequent', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when consequent is not BlockStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        consequent: { type: 'ExpressionStatement', expression: null },
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when block body is empty', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when block body has non-IfStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: null }],
        },
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner IfStatement test is not BinaryExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerIf = {
      type: 'IfStatement',
      test: { type: 'Identifier', name: 'x' },
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 20),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [innerIf] },
        loc: makeLoc(1, 0, 3, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== NEGATIVE CASES — inner operator / left mismatch (5) =====
  test('does not report when inner operator is not a comparison', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '+',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner left differs from outer left', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = makeLeft('y')
    const innerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      loc: makeLoc(2, 4, 2, 20),
    }
    const innerIf = {
      type: 'IfStatement',
      test: innerBinary,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 22),
    }
    const block = {
      type: 'BlockStatement',
      body: [innerIf],
      loc: makeLoc(1, 20, 3, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 3, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner left type differs (MemberExpression vs Identifier)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = { type: 'MemberExpression', object: makeLeft('x'), property: makeLeft('y'), loc: makeLoc(2, 4, 2, 8) }
    const innerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'NullLiteral', loc: makeLoc(2, 14, 2, 18) },
      loc: makeLoc(2, 4, 2, 20),
    }
    const innerIf = {
      type: 'IfStatement',
      test: innerBinary,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 22),
    }
    const block = {
      type: 'BlockStatement',
      body: [innerIf],
      loc: makeLoc(1, 20, 3, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 3, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner right is void unary with wrong operator name', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'UnaryExpression', operator: 'typeof', argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(2, 10, 2, 18) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner IfStatement has no test', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerIf = {
      type: 'IfStatement',
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 20),
    }
    const block = {
      type: 'BlockStatement',
      body: [innerIf],
      loc: makeLoc(1, 20, 3, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 3, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== EDGE CASES — null/undefined/primitive nodes (10) =====
  test('handles null node gracefully', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    expect(() => visitor.BinaryExpression(null)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles undefined node gracefully', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles empty object node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    expect(() => visitor.BinaryExpression({})).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles non-object node (string)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles non-object node (number)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    expect(() => visitor.BinaryExpression(42)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('handles node with wrong type (not BinaryExpression)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'CallExpression', callee: null, arguments: [] })
    expect(reports.length).toBe(0)
  })

  test('handles node with null left', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left: null,
      right: { type: 'NullLiteral' },
      loc: makeLoc(1, 0, 1, 10),
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('handles node with null right', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left: makeLeft('x'),
      right: null,
      loc: makeLoc(1, 0, 1, 10),
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('handles node with undefined left and right', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      loc: makeLoc(1, 0, 1, 10),
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('handles node with missing operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = {
      type: 'BinaryExpression',
      left: makeLeft('x'),
      right: { type: 'NullLiteral' },
      loc: makeLoc(1, 0, 1, 10),
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== EDGE CASES — parent edge cases (5) =====
  test('handles node with no _parent property', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left: makeLeft('x'),
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('handles node with null _parent', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left: makeLeft('x'),
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: null,
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('handles parent with null body in BlockStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: null },
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('handles parent body with null element', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [null] },
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('handles parent body with non-object element', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: ['not a statement'] },
        loc: makeLoc(1, 0, 1, 20),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== EDGE CASES — multiple inner statements (5) =====
  test('reports when inner IfStatement is not first in body', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = makeLeft('x')
    const innerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'NullLiteral', loc: makeLoc(3, 10, 3, 14) },
      loc: makeLoc(3, 4, 3, 20),
    }
    const innerIf = {
      type: 'IfStatement',
      test: innerBinary,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(3, 4, 3, 22),
    }
    const block = {
      type: 'BlockStatement',
      body: [
        { type: 'ExpressionStatement', expression: null },
        innerIf,
      ],
      loc: makeLoc(1, 20, 4, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 4, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports when multiple inner IfStatements match', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = makeLeft('x')
    const innerBinary1 = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      loc: makeLoc(2, 4, 2, 20),
    }
    const innerBinary2 = {
      type: 'BinaryExpression',
      operator: '!==',
      left: makeLeft('x'),
      right: { type: 'NullLiteral', loc: makeLoc(3, 10, 3, 14) },
      loc: makeLoc(3, 4, 3, 20),
    }
    const innerIf1 = {
      type: 'IfStatement',
      test: innerBinary1,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 22),
    }
    const innerIf2 = {
      type: 'IfStatement',
      test: innerBinary2,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(3, 4, 3, 22),
    }
    const block = {
      type: 'BlockStatement',
      body: [innerIf1, innerIf2],
      loc: makeLoc(1, 20, 4, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 4, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(2)
  })

  test('reports only matching inner IfStatements, skips non-matching', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = makeLeft('x')
    const matchingInnerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      loc: makeLoc(2, 4, 2, 20),
    }
    const nonMatchingInnerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: makeLeft('y'),
      right: { type: 'NullLiteral', loc: makeLoc(3, 10, 3, 14) },
      loc: makeLoc(3, 4, 3, 20),
    }
    const innerIf1 = {
      type: 'IfStatement',
      test: matchingInnerBinary,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 22),
    }
    const innerIf2 = {
      type: 'IfStatement',
      test: nonMatchingInnerBinary,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(3, 4, 3, 22),
    }
    const block = {
      type: 'BlockStatement',
      body: [innerIf1, innerIf2],
      loc: makeLoc(1, 20, 4, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 4, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('does not report when inner right is void unary with wrong operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = makeLeft('x')
    const innerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'UnaryExpression', operator: 'delete', argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(2, 10, 2, 18) },
      loc: makeLoc(2, 4, 2, 20),
    }
    const innerIf = {
      type: 'IfStatement',
      test: innerBinary,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 22),
    }
    const block = {
      type: 'BlockStatement',
      body: [innerIf],
      loc: makeLoc(1, 20, 3, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 3, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report when inner BinaryExpression right side is Identifier with name other than undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const left = makeLeft('x')
    const innerLeft = makeLeft('x')
    const innerBinary = {
      type: 'BinaryExpression',
      operator: '!==',
      left: innerLeft,
      right: { type: 'Identifier', name: 'null', loc: makeLoc(2, 10, 2, 14) },
      loc: makeLoc(2, 4, 2, 20),
    }
    const innerIf = {
      type: 'IfStatement',
      test: innerBinary,
      consequent: { type: 'BlockStatement', body: [] },
      loc: makeLoc(2, 4, 2, 22),
    }
    const block = {
      type: 'BlockStatement',
      body: [innerIf],
      loc: makeLoc(1, 20, 3, 1),
    }
    const node = {
      type: 'BinaryExpression',
      operator: '!==',
      left,
      right: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      loc: makeLoc(1, 4, 1, 16),
      _parent: {
        type: 'IfStatement',
        test: null,
        consequent: block,
        loc: makeLoc(1, 0, 3, 1),
      },
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  // ===== ADDITIONAL COVERAGE (5) =====
  test('separate create() calls have independent state', () => {
    const { context: ctx1, reports: rep1 } = createMockContext()
    const { context: ctx2, reports: rep2 } = createMockContext()
    const visitor1 = noUnnecessaryNullCheckRule.create(ctx1)
    const visitor2 = noUnnecessaryNullCheckRule.create(ctx2)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor1.BinaryExpression(node)
    visitor2.BinaryExpression({})
    expect(rep1.length).toBe(1)
    expect(rep2.length).toBe(0)
  })

  test('create returns a new visitor each call', () => {
    const { context } = createMockContext()
    const visitor1 = noUnnecessaryNullCheckRule.create(context)
    const visitor2 = noUnnecessaryNullCheckRule.create(context)
    expect(visitor1).not.toBe(visitor2)
  })

  test('meta is same reference across multiple accesses', () => {
    const meta1 = noUnnecessaryNullCheckRule.meta
    const meta2 = noUnnecessaryNullCheckRule.meta
    expect(meta1).toBe(meta2)
  })

  test('report message is exactly as defined in source', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports[0].message).toBe(
      'Redundant null/undefined check. The outer condition already ensures the value is not null/undefined.',
    )
  })

  test('accumulates reports across multiple calls', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node1 = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'a',
    })
    const node2 = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'b',
    })
    visitor.BinaryExpression(node1)
    visitor.BinaryExpression(node2)
    expect(reports.length).toBe(2)
  })

  // ===== ADDITIONAL POSITIVE VARIATIONS (5) =====
  test('reports with identifier name "data"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'data',
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports with identifier name "item"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'item',
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer !== undefined with inner == null (loose equality)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(1, 10, 1, 19) },
      innerOp: '==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer != undefined with inner !== null', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!=',
      outerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(1, 10, 1, 19) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports outer != null with inner == undefined (loose equality)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!=',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '==',
      innerRight: { type: 'Identifier', name: 'undefined', loc: makeLoc(2, 10, 2, 19) },
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  // ===== ADDITIONAL NEGATIVE VARIATIONS (5) =====
  test('does not report for BinaryExpression type CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'fn' },
      arguments: [],
      loc: makeLoc(1, 0, 1, 5),
    }
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(0)
  })

  test('does not report for node type Identifier', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type Literal', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type MemberExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'MemberExpression', object: makeLeft('a'), property: makeLeft('b'), loc: makeLoc(1, 0, 1, 3) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type UnaryExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', argument: makeLeft('x'), loc: makeLoc(1, 0, 1, 2) })
    expect(reports.length).toBe(0)
  })

  // ===== FINAL COVERAGE (9) =====
  test('reports with identifier name "obj"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'obj',
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('reports with identifier name "config"', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    const node = buildRedundantNode({
      outerOp: '!==',
      outerRight: { type: 'NullLiteral', loc: makeLoc(1, 10, 1, 14) },
      innerOp: '!==',
      innerRight: { type: 'NullLiteral', loc: makeLoc(2, 10, 2, 14) },
      leftName: 'config',
    })
    visitor.BinaryExpression(node)
    expect(reports.length).toBe(1)
  })

  test('does not report for node type IfStatement directly', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'IfStatement', test: null, consequent: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type BlockStatement directly', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type ReturnStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type FunctionExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type VariableDeclaration', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type ExpressionStatement', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'ExpressionStatement', expression: null, loc: makeLoc(1, 0, 1, 1) })
    expect(reports.length).toBe(0)
  })

  test('does not report for node type AssignmentExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullCheckRule.create(context)
    visitor.BinaryExpression({ type: 'AssignmentExpression', operator: '=', left: makeLeft('x'), right: makeLeft('y'), loc: makeLoc(1, 0, 1, 5) })
    expect(reports.length).toBe(0)
  })

  describe('ESTree null-literal compatibility', () => {
    test('reports redundant check where outer null is ESTree Literal{value:null}', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullCheckRule.create(context)
      const estreeNull = { type: 'Literal', value: null }
      const node = buildRedundantNode({
        outerOp: '!==',
        outerRight: estreeNull,
        innerOp: '!==',
        innerRight: estreeNull,
      })
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})
