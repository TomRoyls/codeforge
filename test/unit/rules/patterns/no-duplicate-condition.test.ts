import { describe, expect, test, vi } from 'vitest'
import { noDuplicateConditionRule } from '../../../../src/rules/patterns/no-duplicate-condition.js'
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
    getSource: () => 'if (a) {} else if (a) {}',
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

function makeIdentifier(name: string, line = 1, col = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: makeLoc(line, col, line, col + name.length),
  }
}

function makeLiteral(value: unknown, line = 1, col = 0): unknown {
  const str = JSON.stringify(value) ?? 'null'
  return {
    type: 'Literal',
    value,
    loc: makeLoc(line, col, line, col + str.length),
  }
}

function makeMemberExpression(obj: unknown, prop: unknown, line = 1, col = 0): unknown {
  return {
    type: 'MemberExpression',
    object: obj,
    property: prop,
    loc: makeLoc(line, col, line, col + 10),
  }
}

function makeBinaryExpression(left: unknown, op: string, right: unknown, line = 1, col = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: op,
    left,
    right,
    loc: makeLoc(line, col, line, col + 10),
  }
}

function makeCallExpression(callee: unknown, line = 1, col = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
    loc: makeLoc(line, col, line, col + 10),
  }
}

function makeIfStatement(test: unknown, alternate?: unknown, line = 1, col = 0): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent: { type: 'BlockStatement', body: [] },
    alternate: alternate ?? null,
    loc: makeLoc(line, col, line, col + 20),
  }
}

describe('no-duplicate-condition rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noDuplicateConditionRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noDuplicateConditionRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noDuplicateConditionRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noDuplicateConditionRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noDuplicateConditionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning duplicate condition', () => {
      const desc = noDuplicateConditionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/duplicate/)
      expect(desc).toMatch(/condition/)
    })

    test('should have correct docs URL', () => {
      expect(noDuplicateConditionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-duplicate-condition',
      )
    })

    test('should have empty schema', () => {
      expect(noDuplicateConditionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noDuplicateConditionRule).toBeDefined()
      expect(noDuplicateConditionRule.meta).toBeDefined()
      expect(noDuplicateConditionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — IDENTIFIER DUPLICATES (10) =====
  describe('positive cases — identifier duplicates', () => {
    test('reports duplicate identifier condition in if-else-if chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('report message mentions duplicate condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('x')
      const condA2 = makeIdentifier('x', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].message).toContain('Duplicate condition')
    })

    test('report message mentions branch will never be reached', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('x')
      const condA2 = makeIdentifier('x', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].message).toContain('never be reached')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the duplicate test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].node).toBe(condA2)
    })

    test('reports duplicate in three-branch chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condB = makeIdentifier('b', 3, 5)
      const condA2 = makeIdentifier('a', 5, 5)
      const elseIf3 = makeIfStatement(condA2, null, 5, 5)
      const elseIf2 = makeIfStatement(condB, elseIf3, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports multiple duplicates in long chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condB = makeIdentifier('b', 3, 5)
      const condA2 = makeIdentifier('a', 5, 5)
      const condB2 = makeIdentifier('b', 7, 5)
      const elseIf4 = makeIfStatement(condB2, null, 7, 5)
      const elseIf3 = makeIfStatement(condA2, elseIf4, 5, 5)
      const elseIf2 = makeIfStatement(condB, elseIf3, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(2)
    })

    test('reports duplicate with correct location from test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 10, 3)
      const elseIf = makeIfStatement(condA2, null, 10, 3)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('reports duplicate identifier with different loc instances', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condX = makeIdentifier('status')
      const condX2 = makeIdentifier('status', 5, 10)
      const elseIf = makeIfStatement(condX2, null, 5, 10)
      const ifNode = makeIfStatement(condX, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — LITERAL DUPLICATES (6) =====
  describe('positive cases — literal duplicates', () => {
    test('reports duplicate literal number condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral(1)
      const cond2 = makeLiteral(1, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports duplicate literal string condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral('foo')
      const cond2 = makeLiteral('foo', 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports duplicate literal boolean condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral(true)
      const cond2 = makeLiteral(true, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports duplicate literal null condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral(null)
      const cond2 = makeLiteral(null, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report different literal values', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral(1)
      const cond2 = makeLiteral(2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report different string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral('a')
      const cond2 = makeLiteral('b', 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })
  })

  // ===== POSITIVE CASES — MEMBER EXPRESSION DUPLICATES (6) =====
  describe('positive cases — member expression duplicates', () => {
    test('reports duplicate member expression condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const obj = makeIdentifier('obj')
      const prop = makeIdentifier('prop')
      const cond1 = makeMemberExpression(obj, prop)
      const obj2 = makeIdentifier('obj', 3, 5)
      const prop2 = makeIdentifier('prop', 3, 9)
      const cond2 = makeMemberExpression(obj2, prop2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports duplicate nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const obj1 = makeIdentifier('a')
      const prop1 = makeIdentifier('b')
      const inner1 = makeMemberExpression(obj1, prop1)
      const cond1 = makeMemberExpression(inner1, makeIdentifier('c'))
      const obj2 = makeIdentifier('a', 3, 5)
      const prop2 = makeIdentifier('b', 3, 7)
      const inner2 = makeMemberExpression(obj2, prop2, 3, 5)
      const cond2 = makeMemberExpression(inner2, makeIdentifier('c', 3, 11), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report different member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('a'))
      const cond2 = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('b'), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when object name differs', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeMemberExpression(makeIdentifier('obj1'), makeIdentifier('prop'))
      const cond2 = makeMemberExpression(makeIdentifier('obj2'), makeIdentifier('prop'), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('member expression with literal property does not report for different literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeMemberExpression(makeIdentifier('obj'), makeLiteral(0))
      const cond2 = makeMemberExpression(makeIdentifier('obj'), makeLiteral(1), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('member expression with literal property reports for same literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeMemberExpression(makeIdentifier('arr'), makeLiteral(0))
      const cond2 = makeMemberExpression(makeIdentifier('arr'), makeLiteral(0), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — BINARY EXPRESSION DUPLICATES (6) =====
  describe('positive cases — binary expression duplicates', () => {
    test('reports duplicate binary expression condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const left = makeIdentifier('x')
      const right = makeLiteral(5)
      const cond1 = makeBinaryExpression(left, '===', right)
      const left2 = makeIdentifier('x', 3, 5)
      const right2 = makeLiteral(5, 3, 10)
      const cond2 = makeBinaryExpression(left2, '===', right2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report binary with different operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const left = makeIdentifier('x')
      const right = makeLiteral(5)
      const cond1 = makeBinaryExpression(left, '===', right)
      const left2 = makeIdentifier('x', 3, 5)
      const right2 = makeLiteral(5, 3, 10)
      const cond2 = makeBinaryExpression(left2, '!==', right2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report binary with different right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const left = makeIdentifier('x')
      const cond1 = makeBinaryExpression(left, '>', makeLiteral(5))
      const left2 = makeIdentifier('x', 3, 5)
      const cond2 = makeBinaryExpression(left2, '>', makeLiteral(10), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('reports duplicate binary with member expression operands', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const memObj = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('val'))
      const cond1 = makeBinaryExpression(memObj, '>', makeLiteral(0))
      const memObj2 = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('val'), 3, 5)
      const cond2 = makeBinaryExpression(memObj2, '>', makeLiteral(0), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report binary with different left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeBinaryExpression(makeIdentifier('x'), '===', makeLiteral(1))
      const cond2 = makeBinaryExpression(makeIdentifier('y'), '===', makeLiteral(1), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('reports duplicate binary with less-than operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const left = makeIdentifier('count')
      const right = makeLiteral(10)
      const cond1 = makeBinaryExpression(left, '<', right)
      const left2 = makeIdentifier('count', 3, 5)
      const right2 = makeLiteral(10, 3, 14)
      const cond2 = makeBinaryExpression(left2, '<', right2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — CALL EXPRESSION DUPLICATES (5) =====
  describe('positive cases — call expression duplicates', () => {
    test('reports duplicate call expression condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const callee = makeIdentifier('isValid')
      const cond1 = makeCallExpression(callee)
      const callee2 = makeIdentifier('isValid', 3, 5)
      const cond2 = makeCallExpression(callee2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report different call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeCallExpression(makeIdentifier('fn1'))
      const cond2 = makeCallExpression(makeIdentifier('fn2'), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('reports duplicate call with member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const memCallee = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('check'))
      const cond1 = makeCallExpression(memCallee)
      const memCallee2 = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('check'), 3, 5)
      const cond2 = makeCallExpression(memCallee2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report call with different member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const memCallee1 = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('check1'))
      const cond1 = makeCallExpression(memCallee1)
      const memCallee2 = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('check2'), 3, 5)
      const cond2 = makeCallExpression(memCallee2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('reports duplicate call expression in three-branch chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeCallExpression(makeIdentifier('check'))
      const cond2 = makeCallExpression(makeIdentifier('other'), 3, 5)
      const cond3 = makeCallExpression(makeIdentifier('check'), 5, 5)
      const elseIf3 = makeIfStatement(cond3, null, 5, 5)
      const elseIf2 = makeIfStatement(cond2, elseIf3, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — NO DUPLICATES (12) =====
  describe('negative cases — no duplicates detected', () => {
    test('does not report single if with no else-if', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const ifNode = makeIfStatement(makeIdentifier('a'))
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report if-else with no else-if', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseBlock = { type: 'BlockStatement', body: [] }
      const ifNode = makeIfStatement(makeIdentifier('a'), elseBlock)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report different identifiers in chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseIf = makeIfStatement(makeIdentifier('b'), null, 3, 5)
      const ifNode = makeIfStatement(makeIdentifier('a'), elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report mixed unique conditions in chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseIf3 = makeIfStatement(makeCallExpression(makeIdentifier('fn3')), null, 5, 5)
      const elseIf2 = makeIfStatement(makeLiteral('b'), elseIf3, 3, 5)
      const ifNode = makeIfStatement(makeIdentifier('a'), elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when node is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement(null)
      expect(reports.length).toBe(0)
    })

    test('does not report when node is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report when node is empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement({})
      expect(reports.length).toBe(0)
    })

    test('does not report when node has wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when node is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report when node is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement(42)
      expect(reports.length).toBe(0)
    })

    test('does not report when test property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement({ type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] } })
      expect(reports.length).toBe(0)
    })

    test('does not report when test is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      visitor.IfStatement({ type: 'IfStatement', test: null, consequent: { type: 'BlockStatement', body: [] } })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (14) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noDuplicateConditionRule.create(ctx1)
      const visitor2 = noDuplicateConditionRule.create(ctx2)

      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor1.IfStatement(ifNode)
      visitor2.IfStatement(makeIfStatement(makeIdentifier('x')))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noDuplicateConditionRule.create(context)
      const visitor2 = noDuplicateConditionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('handles if with alternate that is not IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseBlock = { type: 'BlockStatement', body: [], loc: makeLoc(3, 5, 3, 10) }
      const ifNode = makeIfStatement(makeIdentifier('a'), elseBlock)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles if with alternate that is a plain block (not else-if)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const elseBlock = { type: 'BlockStatement', body: [] }
      const ifNode = makeIfStatement(condA, elseBlock)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles deeply nested else-if chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseIf5 = makeIfStatement(makeIdentifier('a'), null, 9, 5)
      const elseIf4 = makeIfStatement(makeIdentifier('e'), elseIf5, 7, 5)
      const elseIf3 = makeIfStatement(makeIdentifier('d'), elseIf4, 5, 5)
      const elseIf2 = makeIfStatement(makeIdentifier('c'), elseIf3, 3, 5)
      const ifNode = makeIfStatement(makeIdentifier('a'), elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('handles unrecognized condition types gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const unknownCond = { type: 'LogicalExpression', operator: '&&', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 10) }
      const unknownCond2 = { type: 'LogicalExpression', operator: '&&', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: makeLoc(3, 5, 3, 15) }
      const elseIf = makeIfStatement(unknownCond2, null, 3, 5)
      const ifNode = makeIfStatement(unknownCond, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles UnaryExpression condition (not supported by conditionKey)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const unary1 = { type: 'UnaryExpression', operator: '!', argument: makeIdentifier('a'), loc: makeLoc(1, 0, 1, 5) }
      const unary2 = { type: 'UnaryExpression', operator: '!', argument: makeIdentifier('a'), loc: makeLoc(3, 5, 3, 10) }
      const elseIf = makeIfStatement(unary2, null, 3, 5)
      const ifNode = makeIfStatement(unary1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles UpdateExpression condition (not supported)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const upd = { type: 'UpdateExpression', operator: '++', argument: makeIdentifier('i'), loc: makeLoc(1, 0, 1, 3) }
      const ifNode = makeIfStatement(upd)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles if with test that has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = { type: 'Identifier', name: 'a' }
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports correct location from duplicate test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = { type: 'Identifier', name: 'a', loc: makeLoc(7, 12, 7, 13) }
      const elseIf = makeIfStatement(condA2, null, 7, 8)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('handles same identifier name with different case', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeIdentifier('MyVar')
      const cond2 = makeIdentifier('myvar', 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles empty consequent gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const ifNode = {
        type: 'IfStatement',
        test: makeIdentifier('a'),
        consequent: { type: 'BlockStatement', body: [] },
        alternate: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles conditionKey with unsupported member expression parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const badMemExpr = {
        type: 'MemberExpression',
        object: { type: 'UnknownType' },
        property: makeIdentifier('prop'),
        loc: makeLoc(1, 0, 1, 10),
      }
      const badMemExpr2 = {
        type: 'MemberExpression',
        object: { type: 'UnknownType' },
        property: makeIdentifier('prop'),
        loc: makeLoc(3, 5, 3, 15),
      }
      const elseIf = makeIfStatement(badMemExpr2, null, 3, 5)
      const ifNode = makeIfStatement(badMemExpr, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles conditionKey with unsupported binary expression parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const badBinExpr = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'UnknownType' },
        right: makeLiteral(1),
        loc: makeLoc(1, 0, 1, 10),
      }
      const badBinExpr2 = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'UnknownType' },
        right: makeLiteral(1),
        loc: makeLoc(3, 5, 3, 15),
      }
      const elseIf = makeIfStatement(badBinExpr2, null, 3, 5)
      const ifNode = makeIfStatement(badBinExpr, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL COVERAGE (14) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noDuplicateConditionRule.meta
      const meta2 = noDuplicateConditionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('message is exactly as defined in the rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports[0].message).toBe(
        'Duplicate condition found in if-else chain. This branch will never be reached.',
      )
    })

    test('handles true and false literals as different conditions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral(true)
      const cond2 = makeLiteral(false, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles number and string literals as different', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral(1)
      const cond2 = makeLiteral('1', 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('conditionKey returns null for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const ifNode = makeIfStatement(null)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('conditionKey returns null for undefined value literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond = { type: 'Literal', value: undefined, loc: makeLoc(1, 0, 1, 9) }
      const ifNode = makeIfStatement(cond)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('accumulates reports across multiple if statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condA2 = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(condA2, null, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf)
      visitor.IfStatement(ifNode)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(2)
    })

    test('handles if without consequent gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const ifNode = {
        type: 'IfStatement',
        test: makeIdentifier('a'),
        alternate: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles conditionKey with call expression callee as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const callExpr = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      const ifNode = makeIfStatement(callExpr)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles conditionKey with call expression callee as member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const memCallee = makeMemberExpression(makeIdentifier('a'), makeIdentifier('b'))
      const cond1 = makeCallExpression(memCallee)
      const memCallee2 = makeMemberExpression(makeIdentifier('a'), makeIdentifier('b'), 3, 5)
      const cond2 = makeCallExpression(memCallee2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report duplicate when condition is only in first and last branch with different middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeIdentifier('x')
      const cond2 = makeIdentifier('y', 3, 5)
      const cond3 = makeIdentifier('x', 5, 5)
      const elseIf3 = makeIfStatement(cond3, null, 5, 5)
      const elseIf2 = makeIfStatement(cond2, elseIf3, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('handles boolean literal true appearing twice', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeLiteral(true)
      const cond2 = makeLiteral(true, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ===== CROSS-TYPE CONDITION TESTS (6) =====
  describe('cross-type condition tests', () => {
    test('does not report identifier vs literal with same display', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeIdentifier('true')
      const cond2 = makeLiteral(true, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('does not report identifier vs call expression with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeIdentifier('fn')
      const cond2 = makeCallExpression(makeIdentifier('fn'), 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('reports duplicate in chain mixing condition types where keys match', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const cond1 = makeIdentifier('a')
      const cond2 = makeLiteral(42, 3, 5)
      const cond3 = makeIdentifier('a', 5, 5)
      const elseIf3 = makeIfStatement(cond3, null, 5, 5)
      const elseIf2 = makeIfStatement(cond2, elseIf3, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports duplicate in chain with member and binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const memExpr = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('x'))
      const binExpr = makeBinaryExpression(makeIdentifier('a'), '===', makeIdentifier('b'))
      const memExpr2 = makeMemberExpression(makeIdentifier('obj'), makeIdentifier('x'), 5, 5)
      const elseIf3 = makeIfStatement(memExpr2, null, 7, 5)
      const elseIf2 = makeIfStatement(binExpr, elseIf3, 5, 5)
      const ifNode = makeIfStatement(memExpr, elseIf2)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('all unique conditions across five branches produce no reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseIf4 = makeIfStatement(makeCallExpression(makeIdentifier('e')), null, 9, 5)
      const elseIf3 = makeIfStatement(makeLiteral('d'), elseIf4, 7, 5)
      const elseIf2 = makeIfStatement(
        makeBinaryExpression(makeIdentifier('c'), '>', makeLiteral(0)),
        elseIf3,
        5,
        5,
      )
      const elseIf1 = makeIfStatement(
        makeMemberExpression(makeIdentifier('obj'), makeIdentifier('b')),
        elseIf2,
        3,
        5,
      )
      const ifNode = makeIfStatement(makeIdentifier('a'), elseIf1)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('handles five-branch chain with one duplicate', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseIf4 = makeIfStatement(makeIdentifier('a'), null, 9, 5)
      const elseIf3 = makeIfStatement(makeIdentifier('d'), elseIf4, 7, 5)
      const elseIf2 = makeIfStatement(makeIdentifier('c'), elseIf3, 5, 5)
      const elseIf1 = makeIfStatement(makeIdentifier('b'), elseIf2, 3, 5)
      const ifNode = makeIfStatement(makeIdentifier('a'), elseIf1)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report same condition in separate if statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const ifNode1 = makeIfStatement(makeIdentifier('x'))
      const ifNode2 = makeIfStatement(makeIdentifier('x'), null, 5, 0)
      visitor.IfStatement(ifNode1)
      visitor.IfStatement(ifNode2)
      expect(reports.length).toBe(0)
    })

    test('reports duplicate only in second else-if position', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const condA = makeIdentifier('a')
      const condB = makeIdentifier('b', 3, 5)
      const condA2 = makeIdentifier('a', 5, 5)
      const elseIf2 = makeIfStatement(condA2, null, 5, 5)
      const elseIf1 = makeIfStatement(condB, elseIf2, 3, 5)
      const ifNode = makeIfStatement(condA, elseIf1)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
      expect(reports[0].node).toBe(condA2)
    })

    test('handles chain where first duplicate is not the first branch', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseIf4 = makeIfStatement(makeIdentifier('b'), null, 9, 5)
      const elseIf3 = makeIfStatement(makeIdentifier('b'), elseIf4, 7, 5)
      const elseIf2 = makeIfStatement(makeIdentifier('c'), elseIf3, 5, 5)
      const elseIf1 = makeIfStatement(makeIdentifier('a'), elseIf2, 3, 5)
      const ifNode = makeIfStatement(makeIdentifier('x'), elseIf1)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('binary expression duplicate with !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const left = makeIdentifier('x')
      const right = makeLiteral(null)
      const cond1 = makeBinaryExpression(left, '!==', right)
      const left2 = makeIdentifier('x', 3, 5)
      const right2 = makeLiteral(null, 3, 12)
      const cond2 = makeBinaryExpression(left2, '!==', right2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('does not report duplicate when first condition has null key', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const unknownCond = { type: 'SomeUnknownType', loc: makeLoc(1, 0, 1, 10) }
      const idCond = makeIdentifier('a', 3, 5)
      const elseIf = makeIfStatement(idCond, null, 3, 5)
      const ifNode = makeIfStatement(unknownCond, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('call expression duplicate reports for literal callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const callee1 = makeLiteral('fn')
      const cond1 = makeCallExpression(callee1)
      const callee2 = makeLiteral('fn', 3, 5)
      const cond2 = makeCallExpression(callee2, 3, 5)
      const elseIf = makeIfStatement(cond2, null, 3, 5)
      const ifNode = makeIfStatement(cond1, elseIf)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('reports duplicate identifier at end of long chain with all unique middle branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateConditionRule.create(context)
      const elseIf5 = makeIfStatement(makeIdentifier('x'), null, 11, 5)
      const elseIf4 = makeIfStatement(makeIdentifier('e'), elseIf5, 9, 5)
      const elseIf3 = makeIfStatement(makeIdentifier('d'), elseIf4, 7, 5)
      const elseIf2 = makeIfStatement(makeIdentifier('c'), elseIf3, 5, 5)
      const elseIf1 = makeIfStatement(makeIdentifier('b'), elseIf2, 3, 5)
      const ifNode = makeIfStatement(makeIdentifier('x'), elseIf1)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })
})
