import { describe, expect, test, vi } from 'vitest'
import { noUnboundPromiseRule } from '../../../../src/rules/patterns/no-unbound-promise.js'
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
    getSource: () => 'Promise.resolve(42)',
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

// Helper: ExpressionStatement wrapping a CallExpression
function makeExprStmt(expression: Record<string, unknown>, loc?: Record<string, unknown>): Record<string, unknown> {
  const node: Record<string, unknown> = {
    type: 'ExpressionStatement',
    expression,
  }
  if (loc) node.loc = loc
  return node
}

// Helper: CallExpression node
function makeCallExpr(callee: Record<string, unknown>, args: unknown[] = []): Record<string, unknown> {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

// Helper: MemberExpression
function makeMemberExpr(
  obj: Record<string, unknown>,
  propName: string,
  computed = false,
): Record<string, unknown> {
  return {
    type: 'MemberExpression',
    object: obj,
    property: { type: 'Identifier', name: propName },
    computed,
  }
}

// Helper: Identifier
function makeIdent(name: string): Record<string, unknown> {
  return { type: 'Identifier', name }
}

// Helper: ExpressionStatement with Promise.xxx() call
function makePromiseStaticCall(methodName: string, args: unknown[] = []): Record<string, unknown> {
  return makeExprStmt(
    makeCallExpr(
      makeMemberExpr(makeIdent('Promise'), methodName),
      args,
    ),
    makeLoc(1, 0, 1, 30),
  )
}

// Helper: ExpressionStatement with .then/.catch/.finally call
function makePromiseMethodCall(methodName: string, obj?: Record<string, unknown>): Record<string, unknown> {
  return makeExprStmt(
    makeCallExpr(
      makeMemberExpr(obj ?? makeIdent('promise'), methodName),
      [{ type: 'Identifier', name: 'fn' }],
    ),
    makeLoc(1, 0, 1, 30),
  )
}

// Helper: ExpressionStatement with new Promise(...) as callee of CallExpression
function makeNewPromiseCalleeCall(args: unknown[] = []): Record<string, unknown> {
  return makeExprStmt(
    makeCallExpr(
      {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'resolve' }],
          body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'resolve' }, arguments: [{ type: 'Literal', value: 42 }] },
        }],
      },
      args,
    ),
    makeLoc(1, 0, 1, 40),
  )
}

describe('no-unbound-promise rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnboundPromiseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnboundPromiseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnboundPromiseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnboundPromiseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnboundPromiseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unbound or promise', () => {
      const desc = noUnboundPromiseRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('promise')
    })

    test('should have correct docs URL', () => {
      expect(noUnboundPromiseRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unbound-promise',
      )
    })

    test('should have empty schema', () => {
      expect(noUnboundPromiseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnboundPromiseRule).toBeDefined()
      expect(noUnboundPromiseRule.meta).toBeDefined()
      expect(noUnboundPromiseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — Promise static methods (8) =====
  describe('positive cases — Promise static methods', () => {
    test('reports Promise.resolve(42) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.reject(error) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('reject', [{ type: 'Identifier', name: 'error' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.all([p1, p2]) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('all', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.race([p1, p2]) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('race', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.allSettled([p1, p2]) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('allSettled', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.any([p1, p2]) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('any', [{ type: 'Identifier', name: 'arr' }]))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.resolve() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', []))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.reject(new Error("fail"))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('reject', [{
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Literal', value: 'fail' }],
      }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — new Promise as callee (4) =====
  describe('positive cases — new Promise as callee', () => {
    test('reports new Promise((resolve) => resolve(42))() — NewExpression as callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makeNewPromiseCalleeCall([]))
      expect(reports.length).toBe(1)
    })

    test('message for new Promise callee contains "new Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makeNewPromiseCalleeCall())
      expect(reports[0].message).toContain('new Promise')
    })

    test('message for new Promise callee contains "discarded"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makeNewPromiseCalleeCall())
      expect(reports[0].message).toContain('discarded')
    })

    test('message for new Promise callee contains "silently swallowed"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makeNewPromiseCalleeCall())
      expect(reports[0].message).toContain('silently swallowed')
    })
  })

  // ===== POSITIVE CASES — .then/.catch/.finally (8) =====
  describe('positive cases — promise instance methods', () => {
    test('reports promise.then(fn) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('then'))
      expect(reports.length).toBe(1)
    })

    test('reports promise.catch(fn) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('catch'))
      expect(reports.length).toBe(1)
    })

    test('reports promise.finally(fn) as standalone statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('finally'))
      expect(reports.length).toBe(1)
    })

    test('reports fetch(url).then(handleResponse) — chained .then', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const fetchCall = makeCallExpr(makeIdent('fetch'), [{ type: 'Identifier', name: 'url' }])
      visitor.ExpressionStatement(makePromiseMethodCall('then', fetchCall as Record<string, unknown>))
      expect(reports.length).toBe(1)
    })

    test('reports fetch(url).catch(handleError) — chained .catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const fetchCall = makeCallExpr(makeIdent('fetch'), [{ type: 'Identifier', name: 'url' }])
      visitor.ExpressionStatement(makePromiseMethodCall('catch', fetchCall as Record<string, unknown>))
      expect(reports.length).toBe(1)
    })

    test('reports fetch(url).finally(cleanup) — chained .finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const fetchCall = makeCallExpr(makeIdent('fetch'), [{ type: 'Identifier', name: 'url' }])
      visitor.ExpressionStatement(makePromiseMethodCall('finally', fetchCall as Record<string, unknown>))
      expect(reports.length).toBe(1)
    })

    test('reports chained .then after .then: p.then(fn1).then(fn2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const innerThen = makeMemberExpr(makeIdent('p'), 'then')
      const innerCall = makeCallExpr(innerThen, [{ type: 'Identifier', name: 'fn1' }])
      visitor.ExpressionStatement(makePromiseMethodCall('then', innerCall as Record<string, unknown>))
      expect(reports.length).toBe(1)
    })

    test('reports chained .catch after .then: p.then(fn1).catch(fn2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const innerThen = makeMemberExpr(makeIdent('p'), 'then')
      const innerCall = makeCallExpr(innerThen, [{ type: 'Identifier', name: 'fn1' }])
      visitor.ExpressionStatement(makePromiseMethodCall('catch', innerCall as Record<string, unknown>))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — message content (8) =====
  describe('positive cases — message content', () => {
    test('message contains "Unbound" for Promise.resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 42 }]))
      expect(reports[0].message).toContain('Unbound')
    })

    test('message contains "Promise.resolve" for resolve call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 42 }]))
      expect(reports[0].message).toContain('Promise.resolve')
    })

    test('message contains "Promise.reject" for reject call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('reject', [{ type: 'Identifier', name: 'err' }]))
      expect(reports[0].message).toContain('Promise.reject')
    })

    test('message contains "Promise.all" for all call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('all', []))
      expect(reports[0].message).toContain('Promise.all')
    })

    test('message contains "discarded" for Promise.resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', []))
      expect(reports[0].message).toContain('discarded')
    })

    test('message contains ".then" for then call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('then'))
      expect(reports[0].message).toContain('.then')
    })

    test('message contains ".catch" for catch call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('catch'))
      expect(reports[0].message).toContain('.catch')
    })

    test('message contains ".finally" for finally call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('finally'))
      expect(reports[0].message).toContain('.finally')
    })
  })

  // ===== POSITIVE CASES — report properties and misc (6) =====
  describe('positive cases — report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 42 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makePromiseStaticCall('resolve', [{ type: 'Literal', value: 42 }])
      visitor.ExpressionStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc has correct start/end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('Promise'), 'resolve'),
          [{ type: 'Literal', value: 42 }],
        ),
        makeLoc(5, 2, 5, 22),
      )
      visitor.ExpressionStatement(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 1 }]))
      visitor.ExpressionStatement(makePromiseStaticCall('reject', [{ type: 'Literal', value: 2 }]))
      visitor.ExpressionStatement(makePromiseMethodCall('then'))
      expect(reports.length).toBe(3)
    })

    test('reports Promise.race and Promise.allSettled in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('race', []))
      visitor.ExpressionStatement(makePromiseStaticCall('allSettled', []))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Promise.race')
      expect(reports[1].message).toContain('Promise.allSettled')
    })

    test('reports Promise.resolve inside if block — ExpressionStatement still fires', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      // Even inside a block, ExpressionStatement still triggers
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — not ExpressionStatement pattern (8) =====
  describe('negative cases — not matching patterns', () => {
    test('does not report const p = Promise.resolve(42) — VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        declarations: [{
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'p' },
          init: makeCallExpr(makeMemberExpr(makeIdent('Promise'), 'resolve'), [{ type: 'Literal', value: 42 }]),
        }],
        kind: 'const',
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report foo() — simple CallExpression with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeCallExpr(makeIdent('foo'))))
      expect(reports.length).toBe(0)
    })

    test('does not report foo.bar() — MemberExpression but property not in PROMISE_METHODS', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(
        makeCallExpr(makeMemberExpr(makeIdent('foo'), 'bar')),
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report somePromise.done(fn) — "done" not in PROMISE_METHODS', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('done'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Error("msg") — NewExpression but callee is Error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Error' },
            arguments: [{ type: 'Literal', value: 'msg' }],
          },
          [],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report console.log(Promise.resolve(42)) — callee is console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('console'), 'log'),
          [makeCallExpr(makeMemberExpr(makeIdent('Promise'), 'resolve'), [{ type: 'Literal', value: 42 }])],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Promise — identifier, not a call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makeIdent('Promise')))
      expect(reports.length).toBe(0)
    })

    test('does not report obj["then"](fn) — computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('obj'), 'then', true),
          [{ type: 'Identifier', name: 'fn' }],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — more non-matching (8) =====
  describe('negative cases — more non-matching', () => {
    test('does not report MyPromise.resolve(x) — object is not "Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('MyPromise'), 'resolve'),
          [{ type: 'Literal', value: 42 }],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report promise.subscribe(fn) — not a PROMISE_METHOD', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('promise'), 'subscribe'),
          [{ type: 'Identifier', name: 'fn' }],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Promise(resolve => resolve(42)) — NewExpression directly, not inside CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      // ExpressionStatement wrapping a NewExpression (not a CallExpression)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Promise' },
          arguments: [{
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
            body: makeCallExpr(makeIdent('resolve'), [{ type: 'Literal', value: 42 }]),
          }],
        },
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await Promise.resolve(42) — AwaitExpression not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: makeCallExpr(
            makeMemberExpr(makeIdent('Promise'), 'resolve'),
            [{ type: 'Literal', value: 42 }],
          ),
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report return Promise.resolve(42) — not ExpressionStatement at expression level', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      // ReturnStatement is not ExpressionStatement, so the visitor won't fire
      // But if it does fire with a wrong type, it shouldn't match
      const node = {
        type: 'ReturnStatement',
        argument: makeCallExpr(
          makeMemberExpr(makeIdent('Promise'), 'resolve'),
          [{ type: 'Literal', value: 42 }],
        ),
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Promise.abc() — not a known static method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('abc', []))
      expect(reports.length).toBe(0)
    })

    test('does not report new OtherClass()() — NewExpression callee but not Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'OtherClass' },
            arguments: [],
          },
          [],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report empty ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = { type: 'ExpressionStatement' }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — resilience (8) =====
  describe('negative cases — resilience', () => {
    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string) gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number) gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles ExpressionStatement with null expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: null })
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', callee: null, arguments: [] },
      })
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with callee missing type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', callee: {}, arguments: [] },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — edge patterns (6) =====
  describe('negative cases — edge patterns', () => {
    test('does not report when MemberExpression object has no name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          {
            type: 'MemberExpression',
            object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
            property: { type: 'Identifier', name: 'resolve' },
            computed: false,
          },
          [],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Literal', value: 'resolve' },
            computed: true,
          },
          [],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Promise callee when inner callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          {
            type: 'NewExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'Promise' },
              computed: false,
            },
            arguments: [],
          },
          [],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Promise.withResolvers() — not a recognized static method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('withResolvers', []))
      expect(reports.length).toBe(0)
    })

    test('does not report Promise[resolve](42) — computed access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('Promise'), 'resolve', true),
          [{ type: 'Literal', value: 42 }],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report assignment expression: x = Promise.resolve(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: makeCallExpr(
            makeMemberExpr(makeIdent('Promise'), 'resolve'),
            [{ type: 'Literal', value: 42 }],
          ),
        },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnboundPromiseRule.create(ctx1)
      const visitor2 = noUnboundPromiseRule.create(ctx2)

      visitor1.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 1 }]))
      visitor2.ExpressionStatement(makeExprStmt(makeCallExpr(makeIdent('foo'))))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', []))
      visitor.ExpressionStatement(makePromiseMethodCall('then'))
      visitor.ExpressionStatement(makePromiseStaticCall('reject', []))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('Promise'), 'resolve'),
          [{ type: 'Literal', value: 42 }],
        ),
      )
      // No loc set
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
      // extractLocation returns default { line: 1, column: 0 }
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnboundPromiseRule.create(context)
      const visitor2 = noUnboundPromiseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('reports all 6 static methods independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const methods = ['resolve', 'reject', 'all', 'race', 'allSettled', 'any']
      for (const method of methods) {
        visitor.ExpressionStatement(makePromiseStaticCall(method, []))
      }
      expect(reports.length).toBe(6)
      expect(reports[0].message).toContain('Promise.resolve')
      expect(reports[1].message).toContain('Promise.reject')
      expect(reports[2].message).toContain('Promise.all')
      expect(reports[3].message).toContain('Promise.race')
      expect(reports[4].message).toContain('Promise.allSettled')
      expect(reports[5].message).toContain('Promise.any')
    })

    test('reports all 3 instance methods independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('then'))
      visitor.ExpressionStatement(makePromiseMethodCall('catch'))
      visitor.ExpressionStatement(makePromiseMethodCall('finally'))
      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('.then')
      expect(reports[1].message).toContain('.catch')
      expect(reports[2].message).toContain('.finally')
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      // Should report
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', []))
      // Should NOT report
      visitor.ExpressionStatement(makeExprStmt(makeCallExpr(makeIdent('foo'))))
      // Should report
      visitor.ExpressionStatement(makePromiseMethodCall('then'))
      // Should NOT report
      visitor.ExpressionStatement(makePromiseStaticCall('abc', []))
      // Should report
      visitor.ExpressionStatement(makePromiseStaticCall('reject', []))
      expect(reports.length).toBe(3)
    })

    test('MemberExpression with computed=true on promise method does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('promise'), 'then', true),
          [{ type: 'Identifier', name: 'fn' }],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('Promise.resolve.then(fn) — outer .then reports as promise method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const innerCall = makeCallExpr(
        makeMemberExpr(makeIdent('Promise'), 'resolve'),
        [{ type: 'Literal', value: 42 }],
      )
      visitor.ExpressionStatement(makePromiseMethodCall('then', innerCall as Record<string, unknown>))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.then')
    })

    test('message for .then contains "promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('then'))
      expect(reports[0].message.toLowerCase()).toContain('promise')
    })

    test('message for .catch contains "silently swallowed"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('catch'))
      expect(reports[0].message).toContain('silently swallowed')
    })

    test('message for .finally contains "discarded"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseMethodCall('finally'))
      expect(reports[0].message).toContain('discarded')
    })

    test('NewExpression callee check: new MyClass()() does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'MyClass' },
            arguments: [],
          },
          [],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('ExpressionStatement with numeric literal expression does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 42 },
      })
      expect(reports.length).toBe(0)
    })

    test('ExpressionStatement with identifier expression does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
      })
      expect(reports.length).toBe(0)
    })

    test('message for Promise.resolve contains "Promise.resolve()" with parens', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', []))
      expect(reports[0].message).toContain('Promise.resolve')
      expect(reports[0].message).toContain('()')
    })

    test('Promise.resolve inside nested call still reports at ExpressionStatement level', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      // This is Promise.resolve(42) as standalone statement
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('report node property matches the original node for .then call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makePromiseMethodCall('then')
      visitor.ExpressionStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('does not report chained computed member: obj["then"](fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const node = makeExprStmt(
        makeCallExpr(
          makeMemberExpr(makeIdent('obj'), 'then', true),
          [{ type: 'Identifier', name: 'fn' }],
        ),
      )
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('reports then on chained Promise.resolve.then() — outer .then is checked', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      const resolveCall = makeCallExpr(
        makeMemberExpr(makeIdent('Promise'), 'resolve'),
        [{ type: 'Literal', value: 42 }],
      )
      visitor.ExpressionStatement(makePromiseMethodCall('then', resolveCall as Record<string, unknown>))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.then')
    })

    test('Promise.resolve with complex object argument still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnboundPromiseRule.create(context)
      visitor.ExpressionStatement(makePromiseStaticCall('resolve', [{
        type: 'ObjectExpression',
        properties: [
          { type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } },
        ],
      }]))
      expect(reports.length).toBe(1)
    })
  })
})
