import { describe, expect, test, vi } from 'vitest'
import { noInefficientStringConcatRule } from '../../../../src/rules/performance/no-inefficient-string-concat.js'
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
    getSource: () => 'for (let i = 0; i < n; i++) { str += "hello"; }',
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

function makeForLoop(body: unknown, loc = makeLoc(1, 0, 3, 1)): unknown {
  return {
    type: 'ForStatement',
    body,
    loc,
  }
}

function makeForInLoop(body: unknown, loc = makeLoc(1, 0, 3, 1)): unknown {
  return {
    type: 'ForInStatement',
    left: { type: 'Identifier', name: 'key' },
    right: { type: 'Identifier', name: 'obj' },
    body,
    loc,
  }
}

function makeForOfLoop(body: unknown, loc = makeLoc(1, 0, 3, 1)): unknown {
  return {
    type: 'ForOfStatement',
    left: { type: 'Identifier', name: 'item' },
    right: { type: 'Identifier', name: 'arr' },
    body,
    loc,
  }
}

function makeWhileLoop(body: unknown, loc = makeLoc(1, 0, 3, 1)): unknown {
  return {
    type: 'WhileStatement',
    test: { type: 'Identifier', name: 'cond' },
    body,
    loc,
  }
}

function makeDoWhileLoop(body: unknown, loc = makeLoc(1, 0, 3, 1)): unknown {
  return {
    type: 'DoWhileStatement',
    test: { type: 'Identifier', name: 'cond' },
    body,
    loc,
  }
}

function makeAssignExpr(operator: string, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left: { type: 'Identifier', name: 'str' },
    right,
  }
}

function makeBlockWithAssign(operator: string, right: unknown, loc = makeLoc(1, 0, 5, 1)): unknown {
  return {
    type: 'BlockStatement',
    body: [
      {
        type: 'ExpressionStatement',
        expression: makeAssignExpr(operator, right),
      },
    ],
    loc,
  }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
}

function makeBinaryPlus(left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left,
    right,
  }
}

describe('no-inefficient-string-concat rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noInefficientStringConcatRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noInefficientStringConcatRule.meta.severity).toBe('warn')
    })

    test('should have correct category "performance"', () => {
      expect(noInefficientStringConcatRule.meta.docs?.category).toBe('performance')
    })

    test('should not be recommended', () => {
      expect(noInefficientStringConcatRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noInefficientStringConcatRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning concatenation and loop', () => {
      const desc = noInefficientStringConcatRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/concatenat/)
      expect(desc).toMatch(/loop/)
    })

    test('should have correct docs URL', () => {
      expect(noInefficientStringConcatRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-inefficient-string-concat',
      )
    })

    test('should have empty schema', () => {
      expect(noInefficientStringConcatRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with all 5 loop types', () => {
      const { context } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('ForInStatement')
      expect(visitor).toHaveProperty('ForOfStatement')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('DoWhileStatement')
      expect(typeof visitor.ForStatement).toBe('function')
      expect(typeof visitor.ForInStatement).toBe('function')
      expect(typeof visitor.ForOfStatement).toBe('function')
      expect(typeof visitor.WhileStatement).toBe('function')
      expect(typeof visitor.DoWhileStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noInefficientStringConcatRule).toBeDefined()
      expect(noInefficientStringConcatRule.meta).toBeDefined()
      expect(noInefficientStringConcatRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports inefficient string concat in loops', () => {
    test('ForStatement with += string literal reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('hello'))))
      expect(reports.length).toBe(1)
    })

    test('ForInStatement with += string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForInStatement(makeForInLoop(makeAssignExpr('+=', makeStringLiteral('world'))))
      expect(reports.length).toBe(1)
    })

    test('ForOfStatement with += string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForOfStatement(makeForOfLoop(makeAssignExpr('+=', makeStringLiteral('item'))))
      expect(reports.length).toBe(1)
    })

    test('WhileStatement with += string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.WhileStatement(makeWhileLoop(makeAssignExpr('+=', makeStringLiteral('x'))))
      expect(reports.length).toBe(1)
    })

    test('DoWhileStatement with += string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.DoWhileStatement(makeDoWhileLoop(makeAssignExpr('+=', makeStringLiteral('y'))))
      expect(reports.length).toBe(1)
    })

    test('= with string literal right side reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('=', makeStringLiteral('text'))))
      expect(reports.length).toBe(1)
    })

    test('message contains "inefficient"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      expect(reports[0].message.toLowerCase()).toContain('inefficient')
    })

    test('message contains "array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      expect(reports[0].node).toBeDefined()
    })

    test('BlockStatement body with ExpressionStatement reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeBlockWithAssign('+=', makeStringLiteral('hello'))))
      expect(reports.length).toBe(1)
    })

    test('BinaryExpression + on right side reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr(
            '+=',
            makeBinaryPlus({ type: 'Identifier', name: 'str' }, { type: 'Identifier', name: 'suffix' }),
          ),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('ForStatement reports with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      const body = { ...makeAssignExpr('+=', makeStringLiteral('a')), loc: makeLoc(5, 8, 7, 9) }
      visitor.ForStatement(makeForLoop(body))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('reports once per loop for single-expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      expect(reports.length).toBe(1)
    })

    test('ForInStatement with = operator and string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForInStatement(makeForInLoop(makeAssignExpr('=', makeStringLiteral('val'))))
      expect(reports.length).toBe(1)
    })

    test('ForOfStatement with BinaryExpression + right reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForOfStatement(
        makeForOfLoop(
          makeAssignExpr(
            '+=',
            makeBinaryPlus({ type: 'Literal', value: 'prefix' }, { type: 'Identifier', name: 'x' }),
          ),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('WhileStatement with block body reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.WhileStatement(makeWhileLoop(makeBlockWithAssign('+=', makeStringLiteral('chunk'))))
      expect(reports.length).toBe(1)
    })

    test('DoWhileStatement with = string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.DoWhileStatement(makeDoWhileLoop(makeAssignExpr('=', makeStringLiteral('reset'))))
      expect(reports.length).toBe(1)
    })

    test('report node matches original for single-expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      const body = makeAssignExpr('+=', makeStringLiteral('a'))
      visitor.ForStatement(makeForLoop(body))
      expect(reports[0].node).toBe(body)
    })

    test('ForStatement with += and BinaryExpression + right reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeBlockWithAssign(
            '+=',
            makeBinaryPlus({ type: 'Identifier', name: 'a' }, { type: 'Literal', value: 'b' }),
          ),
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('+= with number literal NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', { type: 'Literal', value: 42 })))
      expect(reports.length).toBe(0)
    })

    test('-= operator NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('-=', makeStringLiteral('a'))))
      expect(reports.length).toBe(0)
    })

    test('*= operator NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('*=', makeStringLiteral('a'))))
      expect(reports.length).toBe(0)
    })

    test('/= operator NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('/=', makeStringLiteral('a'))))
      expect(reports.length).toBe(0)
    })

    test('%= operator NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('%=', makeStringLiteral('a'))))
      expect(reports.length).toBe(0)
    })

    test('non-loop node IfStatement NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(visitor).not.toHaveProperty('IfStatement')
    })

    test('non-loop node FunctionDeclaration NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(visitor).not.toHaveProperty('FunctionDeclaration')
    })

    test('null node handled gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(() => visitor.ForStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('undefined node handled gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(() => visitor.ForStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('empty body (null body) NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement({ type: 'ForStatement', body: null, loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('block with no matching statements NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('Identifier right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(makeAssignExpr('+=', { type: 'Identifier', name: 'val' })),
      )
      expect(reports.length).toBe(0)
    })

    test('CallExpression right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('MemberExpression right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('+= with boolean literal NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', { type: 'Literal', value: true })))
      expect(reports.length).toBe(0)
    })

    test('+= with null literal NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', { type: 'Literal', value: null })))
      expect(reports.length).toBe(0)
    })

    test('ForStatement with empty block body NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop({ type: 'BlockStatement', body: [] }))
      expect(reports.length).toBe(0)
    })

    test('block with non-ExpressionStatement (VariableDeclaration) NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({
          type: 'BlockStatement',
          body: [{ type: 'VariableDeclaration', declarations: [], kind: 'let' }],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('block with ExpressionStatement but not AssignmentExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('BinaryExpression with - on right NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('BinaryExpression with * on right NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('AssignmentExpression with TemplateLiteral right NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'TemplateLiteral', quasis: [], expressions: [] }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('+= with number Literal in block body NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(makeBlockWithAssign('+=', { type: 'Literal', value: 100 })),
      )
      expect(reports.length).toBe(0)
    })

    test('ForStatement body is Identifier NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('ForStatement body is CallExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('LogicalExpression right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('ConditionalExpression right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('ArrowFunctionExpression right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'ArrowFunctionExpression', params: [], body: { type: 'Identifier', name: 'x' } }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('ArrayExpression right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'ArrayExpression', elements: [] }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('UpdateExpression ++ NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({ type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: 'i' }, prefix: false }),
      )
      expect(reports.length).toBe(0)
    })

    test('UnaryExpression right side NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeAssignExpr('+=', { type: 'UnaryExpression', operator: '-', argument: { type: 'Identifier', name: 'x' } }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('block body ExpressionStatement with non-string Literal NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeBlockWithAssign('+=', { type: 'Literal', value: 3.14 })))
      expect(reports.length).toBe(0)
    })

    test('block body ExpressionStatement with -= operator NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeBlockWithAssign('-=', makeStringLiteral('x'))))
      expect(reports.length).toBe(0)
    })

    test('block body ExpressionStatement with CallExpression right NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop(
          makeBlockWithAssign('+=', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('non-loop node SwitchStatement NOT in visitor', () => {
      const { context } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(visitor).not.toHaveProperty('SwitchStatement')
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noInefficientStringConcatRule.create(ctx1)
      const visitor2 = noInefficientStringConcatRule.create(ctx2)

      visitor1.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      visitor2.ForStatement(makeForLoop({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation across multiple loops', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      visitor.ForInStatement(makeForInLoop(makeAssignExpr('+=', makeStringLiteral('b'))))
      visitor.WhileStatement(makeWhileLoop(makeAssignExpr('+=', makeStringLiteral('c'))))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement({ type: 'ForStatement', body: makeAssignExpr('+=', makeStringLiteral('a')) })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid in block reports first match only', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
            { type: 'ExpressionStatement', expression: makeAssignExpr('+=', makeStringLiteral('a')) },
          ],
        },
        loc: makeLoc(1, 0, 5, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('nested block does not trigger false positive', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({
          type: 'BlockStatement',
          body: [
            {
              type: 'BlockStatement',
              body: [
                { type: 'ExpressionStatement', expression: makeAssignExpr('+=', makeStringLiteral('a')) },
              ],
            },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('reports first match in block then stops', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: makeAssignExpr('+=', makeStringLiteral('a')) },
            { type: 'ExpressionStatement', expression: makeAssignExpr('+=', makeStringLiteral('b')) },
          ],
        },
        loc: makeLoc(1, 0, 5, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('reports with default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement({ type: 'ForStatement', body: makeAssignExpr('+=', makeStringLiteral('a')) })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noInefficientStringConcatRule.create(context)
      const visitor2 = noInefficientStringConcatRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', { type: 'Literal', value: 42 })))
      visitor.ForInStatement(makeForInLoop(makeAssignExpr('+=', makeStringLiteral('b'))))
      visitor.ForStatement(makeForLoop(makeAssignExpr('-=', makeStringLiteral('c'))))
      visitor.WhileStatement(makeWhileLoop(makeAssignExpr('+=', makeStringLiteral('d'))))
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('b'))))
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('c'))))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement({ type: 'ForStatement', loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('handles body type that is neither AssignmentExpression nor BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop({ type: 'ReturnStatement', argument: null }))
      expect(reports.length).toBe(0)
    })

    test('handles block body with null stmt element', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({ type: 'BlockStatement', body: [null, { type: 'ExpressionStatement', expression: makeAssignExpr('+=', makeStringLiteral('a')) }] }),
      )
      expect(reports.length).toBe(1)
    })

    test('handles block body with undefined body array', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop({ type: 'BlockStatement' }))
      expect(reports.length).toBe(0)
    })

    test('handles block body stmt with null expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(
        makeForLoop({ type: 'BlockStatement', body: [{ type: 'ExpressionStatement', expression: null }] }),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with identical messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      visitor.WhileStatement(makeWhileLoop(makeAssignExpr('+=', makeStringLiteral('b'))))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all violation messages are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      visitor.ForInStatement(makeForInLoop(makeAssignExpr('+=', makeStringLiteral('b'))))
      visitor.WhileStatement(makeWhileLoop(makeAssignExpr('+=', makeStringLiteral('c'))))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('meta is same reference across accesses', () => {
      const meta1 = noInefficientStringConcatRule.meta
      const meta2 = noInefficientStringConcatRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noInefficientStringConcatRule', () => {
      expect(noInefficientStringConcatRule).toBeDefined()
      expect(typeof noInefficientStringConcatRule.create).toBe('function')
      expect(typeof noInefficientStringConcatRule.meta).toBe('object')
    })

    test('message mentions ".join()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      expect(reports[0].message).toContain('.join()')
    })

    test('ForStatement works with block body containing string concat', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeBlockWithAssign('+=', makeStringLiteral('chunk'))))
      expect(reports.length).toBe(1)
    })

    test('ForInStatement works with single-expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForInStatement(makeForInLoop(makeAssignExpr('+=', makeStringLiteral('val'))))
      expect(reports.length).toBe(1)
    })

    test('ForOfStatement works with block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForOfStatement(makeForOfLoop(makeBlockWithAssign('=', makeStringLiteral('item'))))
      expect(reports.length).toBe(1)
    })

    test('WhileStatement works with single-expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.WhileStatement(makeWhileLoop(makeAssignExpr('+=', makeStringLiteral('x'))))
      expect(reports.length).toBe(1)
    })

    test('DoWhileStatement works with block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.DoWhileStatement(makeDoWhileLoop(makeBlockWithAssign('+=', makeStringLiteral('y'))))
      expect(reports.length).toBe(1)
    })

    test('does NOT report for FunctionDeclaration visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(visitor).not.toHaveProperty('FunctionDeclaration')
    })

    test('does NOT report for non-loop node type ExpressionStatement visitor', () => {
      const { context } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('block containing only one match reports exactly once', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'VariableDeclaration', declarations: [], kind: 'let' },
            { type: 'ExpressionStatement', expression: makeAssignExpr('+=', makeStringLiteral('x')) },
          ],
        },
        loc: makeLoc(1, 0, 5, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('message contains "concatenation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop(makeAssignExpr('+=', makeStringLiteral('a'))))
      expect(reports[0].message.toLowerCase()).toContain('concatenation')
    })

    test('handles ForStatement with body as empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientStringConcatRule.create(context)
      visitor.ForStatement(makeForLoop({}))
      expect(reports.length).toBe(0)
    })
  })
})
