import { describe, expect, test, vi } from 'vitest'
import { noCatchShadowRule } from '../../../../src/rules/patterns/no-catch-shadow.js'
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

function makeCatchClause(
  paramName: string,
  bodyStatements: unknown[],
): unknown {
  return {
    type: 'CatchClause',
    param: { type: 'Identifier', name: paramName },
    body: { type: 'BlockStatement', body: bodyStatements },
  }
}

function makeVarDecl(name: string, kind = 'let'): unknown {
  return {
    type: 'VariableDeclaration',
    kind,
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name },
        init: null,
      },
    ],
  }
}

// ===== META TESTS (8) =====

describe('no-catch-shadow rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noCatchShadowRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noCatchShadowRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noCatchShadowRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noCatchShadowRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noCatchShadowRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning catch shadow', () => {
      const desc = noCatchShadowRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/catch/)
      expect(desc).toMatch(/shadow/)
    })

    test('should have correct docs URL', () => {
      expect(noCatchShadowRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-catch-shadow',
      )
    })

    test('should have empty schema', () => {
      expect(noCatchShadowRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CatchClause', () => {
      const { context } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(visitor).toHaveProperty('CatchClause')
      expect(typeof visitor.CatchClause).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noCatchShadowRule).toBeDefined()
      expect(noCatchShadowRule.meta).toBeDefined()
      expect(noCatchShadowRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS SHADOWING (30) =====

  describe('positive cases — reports shadowing', () => {
    test('reports when var declaration shadows catch param "err"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports.length).toBe(1)
    })

    test('reports when let declaration shadows catch param "e"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('e', [makeVarDecl('e', 'let')]))
      expect(reports.length).toBe(1)
    })

    test('reports when const declaration shadows catch param "error"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('error', [makeVarDecl('error', 'const')]))
      expect(reports.length).toBe(1)
    })

    test('report message includes the shadowing variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0].message).toContain('err')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0].message).toBe(
        "Variable 'err' shadows catch clause parameter.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the identifier of the shadowing variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      const idNode = { type: 'Identifier', name: 'err' }
      const node = {
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'VariableDeclaration',
              kind: 'let',
              declarations: [{ type: 'VariableDeclarator', id: idNode, init: null }],
            },
          ],
        },
      }
      visitor.CatchClause(node)
      expect(reports[0].node).toBe(idNode)
    })

    test('reports when shadow is second statement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      const exprStmt = { type: 'ExpressionStatement', expression: {} }
      visitor.CatchClause(makeCatchClause('err', [exprStmt, makeVarDecl('err')]))
      expect(reports.length).toBe(1)
    })

    test('reports when shadow is third statement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      const exprStmt1 = { type: 'ExpressionStatement', expression: {} }
      const exprStmt2 = { type: 'ExpressionStatement', expression: {} }
      visitor.CatchClause(makeCatchClause('err', [exprStmt1, exprStmt2, makeVarDecl('err')]))
      expect(reports.length).toBe(1)
    })

    test('reports multiple shadowing declarations in same body', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err'), makeVarDecl('err')]))
      expect(reports.length).toBe(2)
    })

    test('reports for catch param named "ex"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('ex', [makeVarDecl('ex')]))
      expect(reports.length).toBe(1)
    })

    test('reports for catch param named "exception"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('exception', [makeVarDecl('exception')]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-letter catch param "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('x', [makeVarDecl('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore-prefixed catch param "_err"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('_err', [makeVarDecl('_err')]))
      expect(reports.length).toBe(1)
    })

    test('reports with correct message for param "e"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('e', [makeVarDecl('e')]))
      expect(reports[0].message).toBe("Variable 'e' shadows catch clause parameter.")
    })

    test('reports with correct message for param "error"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('error', [makeVarDecl('error')]))
      expect(reports[0].message).toBe("Variable 'error' shadows catch clause parameter.")
    })

    test('accumulates reports across multiple catch clauses', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      visitor.CatchClause(makeCatchClause('e', [makeVarDecl('e')]))
      expect(reports.length).toBe(2)
    })

    test('reports only the matching declaration in mixed declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      const mixedDecl = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [
          { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'foo' }, init: null },
          { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'err' }, init: null },
        ],
      }
      visitor.CatchClause(makeCatchClause('err', [mixedDecl]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('err')
    })

    test('reports shadow with var keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err', 'var')]))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects the variable identifier location', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      const idNode = { type: 'Identifier', name: 'err', loc: makeLoc(5, 8, 5, 11) }
      const node = {
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'VariableDeclaration',
              kind: 'let',
              declarations: [{ type: 'VariableDeclarator', id: idNode, init: null }],
            },
          ],
        },
      }
      visitor.CatchClause(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports when catch body has only the shadowing declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('err')
    })

    test('reports shadow among multiple variable declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        makeVarDecl('foo'),
        makeVarDecl('bar'),
        makeVarDecl('err'),
      ]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('err')
    })

    test('reports shadow when catch param has long name', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('caughtError', [makeVarDecl('caughtError')]))
      expect(reports.length).toBe(1)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      visitor.CatchClause(makeCatchClause('e', [makeVarDecl('e')]))
      expect(reports[0].message).toMatch(/^Variable '.*' shadows catch clause parameter\.$/)
      expect(reports[1].message).toMatch(/^Variable '.*' shadows catch clause parameter\.$/)
    })

    test('reports when body has declaration with matching name but different kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err', 'const')]))
      expect(reports.length).toBe(1)
    })

    test('reports shadow at beginning of mixed statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        makeVarDecl('err'),
        { type: 'ExpressionStatement', expression: {} },
        { type: 'ReturnStatement', argument: null },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports shadow at end of mixed statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        { type: 'ExpressionStatement', expression: {} },
        { type: 'ExpressionStatement', expression: {} },
        makeVarDecl('err'),
      ]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports correctly across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('other')]))
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when body has no declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when variable name differs from catch param', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('other')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when body has only ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [{ type: 'ExpressionStatement', expression: {} }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(() => visitor.CatchClause(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(() => visitor.CatchClause(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(() => visitor.CatchClause({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({ type: 'Identifier', name: 'err' })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({ type: 'Literal', value: 'test' })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(() => visitor.CatchClause('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(() => visitor.CatchClause(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(() => visitor.CatchClause(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      expect(() => visitor.CatchClause([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when CatchClause has no param', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        body: { type: 'BlockStatement', body: [makeVarDecl('err')] },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when param is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: null,
        body: { type: 'BlockStatement', body: [makeVarDecl('err')] },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when param is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'ObjectPattern', properties: [] },
        body: { type: 'BlockStatement', body: [makeVarDecl('err')] },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when param name is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 42 },
        body: { type: 'BlockStatement', body: [makeVarDecl('err')] },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
        body: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body.body is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
        body: { type: 'BlockStatement', body: 'not-array' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({ type: 'CallExpression', callee: {}, arguments: [] })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({ type: 'IfStatement', test: {}, consequent: {} })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({ type: 'ReturnStatement', argument: null })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type (not CatchClause)', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({ type: 'VariableDeclaration', declarations: [], kind: 'const' })
      expect(reports.length).toBe(0)
    })

    test('does not report when declarations array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        { type: 'VariableDeclaration', kind: 'let' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when declaration id is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        {
          type: 'VariableDeclaration',
          kind: 'let',
          declarations: [{ type: 'VariableDeclarator', init: null }],
        },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when declaration id is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        {
          type: 'VariableDeclaration',
          kind: 'let',
          declarations: [
            { type: 'VariableDeclarator', id: { type: 'ObjectPattern', properties: [] }, init: null },
          ],
        },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when variable name has different case', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('Err')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when variable name is prefix of catch param', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('error', [makeVarDecl('err')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when variable name is suffix of catch param', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('error')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when body has only non-VariableDeclaration statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        { type: 'ExpressionStatement', expression: {} },
        { type: 'ReturnStatement', argument: null },
        { type: 'IfStatement', test: {}, consequent: {} },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when declarations array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        { type: 'VariableDeclaration', kind: 'let', declarations: [] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when declaration id name is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        {
          type: 'VariableDeclaration',
          kind: 'let',
          declarations: [
            { type: 'VariableDeclarator', id: { type: 'Identifier', name: null }, init: null },
          ],
        },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when declarations array is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        { type: 'VariableDeclaration', kind: 'let', declarations: 'not-array' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when declaration is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        {
          type: 'VariableDeclaration',
          kind: 'let',
          declarations: [null],
        },
      ]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noCatchShadowRule.create(ctx1)
      const visitor2 = noCatchShadowRule.create(ctx2)
      visitor1.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      visitor2.CatchClause(makeCatchClause('err', [makeVarDecl('other')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noCatchShadowRule.create(context)
      const visitor2 = noCatchShadowRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noCatchShadowRule.meta
      const meta2 = noCatchShadowRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
        body: { type: 'BlockStatement', body: [makeVarDecl('err')] },
        extra: true,
        range: [0, 50],
      })
      expect(reports.length).toBe(1)
    })

    test('handles CatchClause with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
        body: { type: 'BlockStatement', body: [makeVarDecl('err')] },
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noCatchShadowRule).toBeDefined()
      expect(typeof noCatchShadowRule.create).toBe('function')
      expect(typeof noCatchShadowRule.meta).toBe('object')
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      const node = makeCatchClause('err', [makeVarDecl('err')])
      visitor.CatchClause(node)
      visitor.CatchClause(node)
      visitor.CatchClause(node)
      expect(reports.length).toBe(3)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('other')]))
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      visitor.CatchClause(makeCatchClause('err', []))
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('foo')]))
      expect(reports.length).toBe(2)
    })

    test('handles CatchClause with loc on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'err' },
        body: { type: 'BlockStatement', body: [makeVarDecl('err')] },
        loc: makeLoc(1, 0, 10, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('report message mentions shadows', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0].message.toLowerCase()).toContain('shadow')
    })

    test('report message mentions catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0].message.toLowerCase()).toContain('catch')
    })

    test('report message mentions parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      expect(reports[0].message.toLowerCase()).toContain('parameter')
    })

    test('handles body statement that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [null, makeVarDecl('err')]))
      expect(reports.length).toBe(1)
    })

    test('handles body statement that is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [undefined, makeVarDecl('err')]))
      expect(reports.length).toBe(1)
    })

    test('reports two different shadowing params with correct messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [makeVarDecl('err')]))
      visitor.CatchClause(makeCatchClause('e', [makeVarDecl('e')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('err')
      expect(reports[1].message).toContain('e')
    })

    test('does not report when body statement has no type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        { kind: 'let', declarations: [] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('handles VariableDeclaration with declarations containing null entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        {
          type: 'VariableDeclaration',
          kind: 'let',
          declarations: [
            null,
            { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'err' }, init: null },
          ],
        },
      ]))
      expect(reports.length).toBe(1)
    })

    test('handles VariableDeclaration with declarations containing undefined entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('err', [
        {
          type: 'VariableDeclaration',
          kind: 'let',
          declarations: [
            undefined,
            { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'err' }, init: null },
          ],
        },
      ]))
      expect(reports.length).toBe(1)
    })

    test('handles catch param name as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause(makeCatchClause('', [makeVarDecl('')]))
      expect(reports.length).toBe(1)
    })

    test('does not report when catch param name is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noCatchShadowRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier' },
        body: {
          type: 'BlockStatement',
          body: [makeVarDecl('err')],
        },
      })
      expect(reports.length).toBe(0)
    })
  })
})
