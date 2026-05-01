import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryCatchBindingRule } from '../../../../src/rules/patterns/no-unnecessary-catch-binding.js'
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

function makeCatchClause(param: unknown, body: unknown): unknown {
  return {
    type: 'CatchClause',
    param,
    body,
    loc: makeLoc(1, 0, 1, 20),
  }
}

function makeBlockStmt(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name, loc: makeLoc(1, 5, 1, 6) }
}

function makeExprStmt(expr: unknown): unknown {
  return { type: 'ExpressionStatement', expression: expr }
}

function makeCallExpr(callee: unknown, args: unknown[] = []): unknown {
  return { type: 'CallExpression', callee, arguments: args }
}

function makeMemberExpr(obj: unknown, prop: unknown): unknown {
  return { type: 'MemberExpression', object: obj, property: prop }
}

function makeVarDecl(name: string, init: unknown): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name },
        init,
      },
    ],
  }
}

function makeThrowStmt(arg: unknown): unknown {
  return { type: 'ThrowStatement', argument: arg }
}

function makeIfStmt(test: unknown, consequent: unknown): unknown {
  return { type: 'IfStatement', test, consequent }
}

function makeReturnStmt(arg: unknown): unknown {
  return { type: 'ReturnStatement', argument: arg }
}

function makeBinExpr(op: string, left: unknown, right: unknown): unknown {
  return { type: 'BinaryExpression', operator: op, left, right }
}

function makeAssignExpr(left: unknown, right: unknown): unknown {
  return { type: 'AssignmentExpression', operator: '=', left, right }
}

function makeCondExpr(test: unknown, cons: unknown, alt: unknown): unknown {
  return { type: 'ConditionalExpression', test, consequent: cons, alternate: alt }
}

function makeNewExpr(callee: unknown, args: unknown[] = []): unknown {
  return { type: 'NewExpression', callee, arguments: args }
}

function makeTemplateLiteral(quasis: unknown[], exprs: unknown[]): unknown {
  return { type: 'TemplateLiteral', quasis, expressions: exprs }
}

function makeObjExpr(props: unknown[]): unknown {
  return { type: 'ObjectExpression', properties: props }
}

function makeProp(key: unknown, value: unknown): unknown {
  return { type: 'Property', key, value, kind: 'init' }
}

function makeArrExpr(elems: unknown[]): unknown {
  return { type: 'ArrayExpression', elements: elems }
}

function makeFnExpr(params: unknown[], body: unknown): unknown {
  return { type: 'FunctionExpression', id: null, params, body }
}

function makeArrowExpr(params: unknown[], body: unknown): unknown {
  return { type: 'ArrowFunctionExpression', params, body }
}

function makeTryStmt(block: unknown, handler: unknown): unknown {
  return { type: 'TryStatement', block, handler }
}

function makeUnaryExpr(op: string, arg: unknown): unknown {
  return { type: 'UnaryExpression', operator: op, prefix: true, argument: arg }
}

function makeLogicalExpr(op: string, left: unknown, right: unknown): unknown {
  return { type: 'LogicalExpression', operator: op, left, right }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-catch-binding rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryCatchBindingRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryCatchBindingRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryCatchBindingRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryCatchBindingRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryCatchBindingRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning catch', () => {
      const desc = noUnnecessaryCatchBindingRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/catch/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryCatchBindingRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-catch-binding.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryCatchBindingRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CatchClause', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      expect(visitor).toHaveProperty('CatchClause')
      expect(typeof visitor.CatchClause).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryCatchBindingRule).toBeDefined()
      expect(noUnnecessaryCatchBindingRule.meta).toBeDefined()
      expect(noUnnecessaryCatchBindingRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary catch binding', () => {
    test('reports for catch(e) with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      expect(reports.length).toBe(1)
    })

    test('reports for catch(err) with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('err'), makeBlockStmt([])))
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with statement not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([makeExprStmt(makeCallExpr(makeIdentifier('foo')))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with variable declaration not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([makeVarDecl('x', makeIdentifier('foo'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(ex) with throw new Error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('ex'),
          makeBlockStmt([makeThrowStmt(makeNewExpr(makeIdentifier('Error'), [makeIdentifier('msg')]))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with if statement not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([makeIfStmt(makeIdentifier('x'), makeExprStmt(makeIdentifier('y')))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(err) with return statement not using err', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('err'),
          makeBlockStmt([makeReturnStmt(makeIdentifier('fallback'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with object expression not containing e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeObjExpr([makeProp(makeIdentifier('key'), makeIdentifier('val'))])),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when binding name matches nothing in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('myError'),
          makeBlockStmt([
            makeExprStmt(makeCallExpr(makeIdentifier('handleUnknown'))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary catch binding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      expect(reports[0].message).toMatch(/catch/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      expect(reports[0].message).toBe(
        'Unnecessary catch binding. Remove the parameter or use it.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const param = makeIdentifier('e')
      visitor.CatchClause(makeCatchClause(param, makeBlockStmt([])))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const param = makeIdentifier('e')
      visitor.CatchClause(makeCatchClause(param, makeBlockStmt([])))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values reflect param location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const param = { type: 'Identifier', name: 'e', loc: makeLoc(3, 7, 3, 8) }
      visitor.CatchClause(makeCatchClause(param, makeBlockStmt([])))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      visitor.CatchClause(makeCatchClause(makeIdentifier('err'), makeBlockStmt([])))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      visitor.CatchClause(makeCatchClause(makeIdentifier('err'), makeBlockStmt([])))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for catch(e) with binary expression not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeBinExpr('+', makeIdentifier('a'), makeIdentifier('b'))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with assignment not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeAssignExpr(makeIdentifier('x'), makeIdentifier('y'))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with conditional expression not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeCondExpr(makeIdentifier('x'), makeIdentifier('a'), makeIdentifier('b'))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with array expression not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeArrExpr([makeIdentifier('a'), makeIdentifier('b')])),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with new expression not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeNewExpr(makeIdentifier('CustomError'), [makeIdentifier('msg')])),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with unary expression not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeUnaryExpr('!', makeIdentifier('x'))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with logical expression not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeLogicalExpr('&&', makeIdentifier('a'), makeIdentifier('b'))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with multiple statements none using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeCallExpr(makeIdentifier('foo'))),
            makeExprStmt(makeCallExpr(makeIdentifier('bar'))),
            makeReturnStmt(makeIdentifier('null')),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with nested function not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeFnExpr([], makeBlockStmt([makeReturnStmt(makeIdentifier('x'))]))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with arrow function not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeArrowExpr([], makeBlockStmt([makeReturnStmt(makeIdentifier('x'))]))),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(e) with template literal not using e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(
              makeTemplateLiteral(
                [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
                [],
              ),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for catch(exception) with member expression not using exception', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('exception'),
          makeBlockStmt([
            makeExprStmt(
              makeMemberExpr(makeIdentifier('obj'), makeIdentifier('prop')),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report node matches the param node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const param = makeIdentifier('e')
      visitor.CatchClause(makeCatchClause(param, makeBlockStmt([])))
      expect(reports[0].node).toBe(param)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for catch without binding parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(null, makeBlockStmt([])))
      expect(reports.length).toBe(0)
    })

    test('does not report for catch with undefined param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(undefined, makeBlockStmt([])))
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(
              makeCallExpr(
                makeMemberExpr(makeIdentifier('console'), makeIdentifier('log')),
                [makeIdentifier('e')],
              ),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(err) uses err in throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('err'),
          makeBlockStmt([makeThrowStmt(makeIdentifier('err'))]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in variable assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeAssignExpr(makeIdentifier('x'), makeIdentifier('e'))),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([makeVarDecl('saved', makeIdentifier('e'))]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([makeReturnStmt(makeIdentifier('e'))]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(
              makeCallExpr(
                makeMemberExpr(makeIdentifier('console'), makeIdentifier('log')),
                [makeMemberExpr(makeIdentifier('e'), makeIdentifier('message'))],
              ),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeNewExpr(makeIdentifier('Error'), [makeIdentifier('e')])),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeBinExpr('+', makeIdentifier('msg'), makeIdentifier('e'))),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeCondExpr(makeIdentifier('x'), makeIdentifier('e'), makeIdentifier('y'))),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeArrExpr([makeIdentifier('e')])),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in object expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeObjExpr([makeProp(makeIdentifier('err'), makeIdentifier('e'))])),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e deeply nested', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeIfStmt(
              makeBinExpr('===', makeIdentifier('x'), makeIdentifier('y')),
              makeExprStmt(
                makeCallExpr(
                  makeMemberExpr(makeIdentifier('obj'), makeIdentifier('fn')),
                  [makeIdentifier('e')],
                ),
              ),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in second statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeCallExpr(makeIdentifier('foo'))),
            makeExprStmt(
              makeCallExpr(
                makeMemberExpr(makeIdentifier('console'), makeIdentifier('log')),
                [makeIdentifier('e')],
              ),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeUnaryExpr('!', makeIdentifier('e'))),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeLogicalExpr('||', makeIdentifier('e'), makeIdentifier('fallback'))),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(
              makeTemplateLiteral(
                [
                  { type: 'TemplateElement', value: { raw: 'Error: ', cooked: 'Error: ' } },
                  { type: 'TemplateElement', value: { raw: '', cooked: '' } },
                ],
                [makeIdentifier('e')],
              ),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      expect(() => visitor.CatchClause(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      expect(() => visitor.CatchClause(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      expect(() => visitor.CatchClause({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      expect(() => visitor.CatchClause('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      expect(() => visitor.CatchClause(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      expect(() => visitor.CatchClause(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({ type: 'IfStatement', test: {}, consequent: {} })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is not a BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: { type: 'ExpressionStatement', expression: makeIdentifier('e') },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: null,
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body statements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: { type: 'BlockStatement', body: 'not-array' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when param type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          { type: 'ObjectPattern', properties: [] },
          makeBlockStmt([]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when param is an ArrayPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          { type: 'ArrayPattern', elements: [] },
          makeBlockStmt([]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(err) uses err in function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('err'),
          makeBlockStmt([
            makeExprStmt(makeCallExpr(makeIdentifier('handleError'), [makeIdentifier('err')])),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(
              makeMemberExpr(
                makeMemberExpr(makeIdentifier('e'), makeIdentifier('response')),
                makeIdentifier('data'),
              ),
            ),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e as property key in object (as Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeObjExpr([makeProp(makeIdentifier('e'), makeIdentifier('val'))])),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeNewExpr(makeIdentifier('Wrapper'), [makeIdentifier('e')])),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when catch(e) uses e in call expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(
        makeCatchClause(
          makeIdentifier('e'),
          makeBlockStmt([
            makeExprStmt(makeCallExpr(makeIdentifier('e'))),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when body block statements is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: { type: 'BlockStatement', body: null },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body block statements is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: { type: 'BlockStatement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({ type: 'FunctionDeclaration', id: null, params: [], body: {} })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({ type: 'VariableDeclaration', declarations: [], kind: 'const' })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryCatchBindingRule.create(ctx1)
      const visitor2 = noUnnecessaryCatchBindingRule.create(ctx2)
      visitor1.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      visitor2.CatchClause(makeCatchClause(makeIdentifier('err'), makeBlockStmt([makeExprStmt(makeIdentifier('err'))])))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly across mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      visitor.CatchClause(makeCatchClause(makeIdentifier('err'), makeBlockStmt([makeExprStmt(makeIdentifier('err'))])))
      visitor.CatchClause(makeCatchClause(null, makeBlockStmt([])))
      visitor.CatchClause(makeCatchClause(makeIdentifier('x'), makeBlockStmt([])))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const param = { type: 'Identifier', name: 'e' }
      visitor.CatchClause({
        type: 'CatchClause',
        param,
        body: { type: 'BlockStatement', body: [] },
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const param = { type: 'Identifier', name: 'e', loc: makeLoc(1, 0, 1, 1) }
      visitor.CatchClause({
        type: 'CatchClause',
        param,
        body: { type: 'BlockStatement', body: [] },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      // invalid: unused
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      // valid: no param
      visitor.CatchClause(makeCatchClause(null, makeBlockStmt([])))
      // valid: param used
      visitor.CatchClause(makeCatchClause(makeIdentifier('err'), makeBlockStmt([makeExprStmt(makeIdentifier('err'))])))
      // invalid: unused with different name
      visitor.CatchClause(makeCatchClause(makeIdentifier('ex'), makeBlockStmt([makeExprStmt(makeIdentifier('foo'))])))
      // valid: param used in member expression
      visitor.CatchClause(makeCatchClause(makeIdentifier('error'), makeBlockStmt([makeExprStmt(makeMemberExpr(makeIdentifier('error'), makeIdentifier('msg')))])))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryCatchBindingRule.create(context)
      const visitor2 = noUnnecessaryCatchBindingRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryCatchBindingRule.meta
      const meta2 = noUnnecessaryCatchBindingRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'e', loc: {} },
        body: { type: 'BlockStatement', body: [] },
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'e', loc: { start: { line: 3, column: 5 } } },
        body: { type: 'BlockStatement', body: [] },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const node = makeCatchClause(makeIdentifier('e'), makeBlockStmt([]))
      visitor.CatchClause(node)
      visitor.CatchClause(node)
      visitor.CatchClause(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryCatchBindingRule).toBeDefined()
      expect(typeof noUnnecessaryCatchBindingRule.create).toBe('function')
      expect(typeof noUnnecessaryCatchBindingRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific param location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      const param = { type: 'Identifier', name: 'ex', loc: makeLoc(10, 4, 10, 6) }
      visitor.CatchClause(makeCatchClause(param, makeBlockStmt([])))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(6)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryCatchBindingRule.create(context)
      visitor.CatchClause(makeCatchClause(makeIdentifier('e'), makeBlockStmt([])))
      visitor.CatchClause(makeCatchClause(makeIdentifier('err'), makeBlockStmt([])))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
