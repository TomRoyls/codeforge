import { describe, it, expect } from 'vitest'
import { noUselessCatchRule } from '../../../../src/rules/correctness/no-useless-catch.js'

function makeCatchNode(param: unknown, body: unknown, loc?: unknown) {
  return {
    type: 'CatchClause',
    param,
    body,
    loc: loc ?? {
      start: { line: 3, column: 8 },
      end: { line: 5, column: 9 },
    },
  }
}

function makeBlock(body: unknown[]) {
  return {
    type: 'BlockStatement',
    body,
  }
}

function makeThrowStatement(argument: unknown) {
  return {
    type: 'ThrowStatement',
    argument,
  }
}

function makeIdentifier(name: string) {
  return { type: 'Identifier', name }
}

function makeNewError(argument: unknown) {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Error' },
    arguments: [argument],
  }
}

function makeMemberExpression(object: string, property: string) {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: object },
    property: { type: 'Identifier', name: property },
    computed: false,
    optional: false,
  }
}

function createMockContext() {
  const reports: unknown[] = []
  const context = {
    report: (d: unknown) => reports.push(d),
    config: { options: [] },
  }
  return { context, reports }
}

describe('no-useless-catch rule', () => {
  describe('meta', () => {
    it('has correct rule id', () => {
      expect(noUselessCatchRule.meta.docs.description).toContain('useless')
    })

    it('has suggestion type', () => {
      expect(noUselessCatchRule.meta.type).toBe('suggestion')
    })

    it('has warn severity', () => {
      expect(noUselessCatchRule.meta.severity).toBe('warn')
    })

    it('has correctness category', () => {
      expect(noUselessCatchRule.meta.docs.category).toBe('correctness')
    })

    it('is recommended', () => {
      expect(noUselessCatchRule.meta.docs.recommended).toBe(true)
    })

    it('has empty schema (no options)', () => {
      expect(noUselessCatchRule.meta.schema).toBeDefined()
      expect(noUselessCatchRule.meta.schema).toEqual([])
    })

    it('has a docs URL', () => {
      expect(noUselessCatchRule.meta.docs.url).toBeDefined()
      expect(typeof noUselessCatchRule.meta.docs.url).toBe('string')
    })

    it('has docs object', () => {
      expect(noUselessCatchRule.meta.docs).toBeDefined()
      expect(typeof noUselessCatchRule.meta.docs).toBe('object')
    })

    it('description mentions catch', () => {
      expect(noUselessCatchRule.meta.docs.description).toContain('catch')
    })

    it('description mentions rethrow or rethrowing', () => {
      const desc = noUselessCatchRule.meta.docs.description
      const mentionsRethrow = desc.includes('rethrow') || desc.includes('unchanged')
      expect(mentionsRethrow).toBe(true)
    })

    it('meta is an object with required fields', () => {
      expect(noUselessCatchRule.meta).toHaveProperty('type')
      expect(noUselessCatchRule.meta).toHaveProperty('severity')
      expect(noUselessCatchRule.meta).toHaveProperty('docs')
      expect(noUselessCatchRule.meta).toHaveProperty('schema')
    })

    it('severity is one of the valid values', () => {
      expect(['error', 'warn', 'info']).toContain(noUselessCatchRule.meta.severity)
    })
  })

  describe('useless catch blocks', () => {
    it('reports violation for direct rethrow of caught parameter', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
      expect((violations[0] as Record<string, unknown>).message).toContain('Useless catch clause')
    })

    it('reports violation for rethrow with different parameter name', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('error'),
        makeBlock([makeThrowStatement(makeIdentifier('error'))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for throw new Error(e.message)', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'message')))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for throw new Error(err.message) with different param name', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('err'),
        makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('err', 'message')))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with underscore parameter _err and throw _err', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('_err'),
        makeBlock([makeThrowStatement(makeIdentifier('_err'))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with long parameter name', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('caughtException'),
        makeBlock([makeThrowStatement(makeIdentifier('caughtException'))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })
  })

  describe('non-useless catch blocks', () => {
    it('does not report for catch with logging and throw', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          { type: 'ExpressionStatement', expression: { type: 'CallExpression' } },
          makeThrowStatement(makeIdentifier('e')),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch that throws different error', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([makeThrowStatement(makeNewError('Different error'))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch that throws different variable', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([makeThrowStatement(makeIdentifier('otherError'))]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with error modification before throw', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      // This simulates modifying error before rethrowing
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          { type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } },
          makeThrowStatement(makeIdentifier('e')),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with cleanup and throw', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          { type: 'ExpressionStatement', expression: { type: 'CallExpression' } },
          makeThrowStatement(makeIdentifier('e')),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with multiple statements including throw', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          { type: 'VariableDeclaration', declarations: [], kind: 'const' },
          makeThrowStatement(makeIdentifier('e')),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for empty catch block (different rule)', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(makeIdentifier('e'), makeBlock([]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch without throw', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([{ type: 'ExpressionStatement', expression: { type: 'CallExpression' } }]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('handles null node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(null)

      expect(violations).toHaveLength(0)
    })

    it('handles undefined node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(undefined)

      expect(violations).toHaveLength(0)
    })

    it('handles non-CatchClause node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({ type: 'ExpressionStatement' })

      expect(violations).toHaveLength(0)
    })

    it('handles non-object node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause('string')

      expect(violations).toHaveLength(0)
    })

    it('handles missing param', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = {
        type: 'CatchClause',
        param: null,
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      }

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('handles catch without param and just throw', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      // ES2019 catch without parameter
      const node = {
        type: 'CatchClause',
        param: null,
        body: makeBlock([{ type: 'ThrowStatement', argument: null }]),
      }

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('handles missing body', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = { type: 'CatchClause', param: makeIdentifier('e') }

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('handles body with non-BlockStatement type', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(makeIdentifier('e'), { type: 'ExpressionStatement' })

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('handles body with non-array body property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(makeIdentifier('e'), { type: 'BlockStatement', body: null })

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('handles throw with non-Identifier argument', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([{ type: 'ThrowStatement', argument: { type: 'Literal', value: 'error' } }]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('handles nested try-catch', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const innerCatch = makeCatchNode(
        makeIdentifier('inner'),
        makeBlock([makeThrowStatement(makeIdentifier('inner'))]),
      )
      const outerCatch = makeCatchNode(
        makeIdentifier('outer'),
        makeBlock([
          {
            type: 'TryStatement',
            block: makeBlock([]),
            handler: innerCatch,
          },
        ]),
      )

      visitor.CatchClause(outerCatch)
      expect(violations).toHaveLength(0)

      visitor.CatchClause(innerCatch)
      expect(violations).toHaveLength(1)
    })

    it('handles throw with null argument', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([{ type: 'ThrowStatement', argument: null }]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('handles param with non-Identifier type', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        { type: 'ObjectPattern', properties: [] },
        makeBlock([{ type: 'ThrowStatement', argument: null }]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })
  })

  describe('location extraction', () => {
    it('includes location in report', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        {
          start: { line: 10, column: 4 },
          end: { line: 12, column: 5 },
        },
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc?.start as Record<string, unknown>)?.line).toBe(10)
      expect((loc?.end as Record<string, unknown>)?.line).toBe(12)
    })

    it('returns default location for node without loc', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = {
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      }

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc?.start as Record<string, unknown>)?.line).toBe(1)
    })
  })

  describe('Error(e.message) edge cases', () => {
    it('does not report for Error(e.stack) - different property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          makeThrowStatement({
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Error' },
            arguments: [makeMemberExpression('e', 'stack')],
          }),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for TypeError(e.message) - different constructor', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          makeThrowStatement({
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'TypeError' },
            arguments: [makeMemberExpression('e', 'message')],
          }),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for Error(e.message, extra) - multiple arguments', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          makeThrowStatement({
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Error' },
            arguments: [makeMemberExpression('e', 'message'), { type: 'Literal', value: 'extra' }],
          }),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for Error(other.message) - different variable', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          makeThrowStatement({
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Error' },
            arguments: [makeMemberExpression('other', 'message')],
          }),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for Error(e.message) with computed property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([
          makeThrowStatement({
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Error' },
            arguments: [
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'e' },
                property: { type: 'Identifier', name: 'message' },
                computed: true,
                optional: false,
              },
            ],
          }),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })
  })

  // ===== NEW TEST BLOCKS BELOW =====

  describe('useless catch - direct rethrow (expanded)', () => {
    it('flags catch(e) { throw e }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(err) { throw err }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeIdentifier('err'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(error) { throw error }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('error'),
          makeBlock([makeThrowStatement(makeIdentifier('error'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(ex) { throw ex }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('ex'), makeBlock([makeThrowStatement(makeIdentifier('ex'))])),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(exc) { throw exc }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('exc'),
          makeBlock([makeThrowStatement(makeIdentifier('exc'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(myError) { throw myError }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('myError'),
          makeBlock([makeThrowStatement(makeIdentifier('myError'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(customName) { throw customName }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('customName'),
          makeBlock([makeThrowStatement(makeIdentifier('customName'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(x) { throw x } with single letter param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('x'), makeBlock([makeThrowStatement(makeIdentifier('x'))])),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(_error) { throw _error }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('_error'),
          makeBlock([makeThrowStatement(makeIdentifier('_error'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch($err) { throw $err } with dollar sign param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('$err'),
          makeBlock([makeThrowStatement(makeIdentifier('$err'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(exception) { throw exception }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('exception'),
          makeBlock([makeThrowStatement(makeIdentifier('exception'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(caught) { throw caught }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('caught'),
          makeBlock([makeThrowStatement(makeIdentifier('caught'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(reason) { throw reason }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('reason'),
          makeBlock([makeThrowStatement(makeIdentifier('reason'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(failure) { throw failure }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('failure'),
          makeBlock([makeThrowStatement(makeIdentifier('failure'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(issue) { throw issue }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('issue'),
          makeBlock([makeThrowStatement(makeIdentifier('issue'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(problem) { throw problem }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('problem'),
          makeBlock([makeThrowStatement(makeIdentifier('problem'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(err2) { throw err2 } with numeric suffix', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err2'),
          makeBlock([makeThrowStatement(makeIdentifier('err2'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(THIS_IS_CONST) { throw THIS_IS_CONST } with uppercase param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('THIS_IS_CONST'),
          makeBlock([makeThrowStatement(makeIdentifier('THIS_IS_CONST'))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })
  })

  describe('useless catch - new Error(e.message) (expanded)', () => {
    it('flags catch(e) { throw new Error(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(err) { throw new Error(err.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('err', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(error) { throw new Error(error.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('error'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('error', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(ex) { throw new Error(ex.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('ex'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('ex', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(myErr) { throw new Error(myErr.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('myErr'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('myErr', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(caughtException) { throw new Error(caughtException.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('caughtException'),
          makeBlock([
            makeThrowStatement(makeNewError(makeMemberExpression('caughtException', 'message'))),
          ]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(x) { throw new Error(x.message) } with single letter param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('x'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('x', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(_err) { throw new Error(_err.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('_err'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('_err', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(exc) { throw new Error(exc.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('exc'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('exc', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(exception) { throw new Error(exception.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('exception'),
          makeBlock([
            makeThrowStatement(makeNewError(makeMemberExpression('exception', 'message'))),
          ]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(reason) { throw new Error(reason.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('reason'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('reason', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(failure) { throw new Error(failure.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('failure'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('failure', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(issue) { throw new Error(issue.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('issue'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('issue', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch($err) { throw new Error($err.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('$err'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('$err', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('flags catch(err2) { throw new Error(err2.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err2'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('err2', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })
  })

  describe('not useless - different throw target', () => {
    it('does not flag catch(e) { throw other } - different variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeIdentifier('other'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new Error(different.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement(makeNewError(makeMemberExpression('different', 'message'))),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new TypeError(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'TypeError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new RangeError(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'RangeError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new SyntaxError(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'SyntaxError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new ReferenceError(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'ReferenceError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new URIError(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'URIError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new EvalError(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'EvalError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new CustomError(e.message) }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'CustomError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new Error(e.stack) } - wrong property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'stack')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new Error(e.name) } - wrong property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'name')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new Error(e.code) } - wrong property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'code')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new Error(e.data) } - wrong property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'data')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(err) { throw otherVar }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeIdentifier('otherVar'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch(e) { throw new Error() } - no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })
  })

  describe('not useless - multiple statements', () => {
    it('does not flag catch with 0 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeIdentifier('e'), makeBlock([])))
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with 2 statements (logging + throw)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'ExpressionStatement', expression: { type: 'CallExpression' } },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with 3 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
            { type: 'ExpressionStatement', expression: { type: 'CallExpression' } },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with variable declaration and throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'VariableDeclaration', declarations: [], kind: 'const' },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with assignment and throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with 4 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'VariableDeclaration', kind: 'let', declarations: [] },
            { type: 'ExpressionStatement', expression: { type: 'CallExpression' } },
            { type: 'ExpressionStatement', expression: { type: 'CallExpression' } },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with return + throw (2 stmts)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'ReturnStatement', argument: null },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with if-statement and throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'IfStatement', test: {}, consequent: {}, alternate: null },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with try-catch inside (nested)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'TryStatement', block: makeBlock([]), handler: null },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with for-loop and throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'ForStatement', init: null, test: null, update: null, body: makeBlock([]) },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with switch and throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'SwitchStatement', discriminant: {}, cases: [] },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })
  })

  describe('not useless - no param', () => {
    it('does not flag catch with null param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: null,
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      })
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with undefined param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: undefined,
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      })
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch without param property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      })
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with empty string param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'Identifier', name: '' },
          makeBlock([makeThrowStatement(makeIdentifier(''))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('does not flag catch with param that has no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode({ type: 'Identifier' }, makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with param name that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'Identifier', name: 42 as unknown as string },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch() { throw e; } with null param and matching throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: null,
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 1 } },
      })
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with null param and throw without arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: null,
        body: makeBlock([{ type: 'ThrowStatement', argument: null }]),
      })
      expect(reports).toHaveLength(0)
    })
  })

  describe('not useless - non-Identifier param', () => {
    it('does not flag catch with ObjectPattern param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'ObjectPattern', properties: [] },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with ArrayPattern param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'ArrayPattern', elements: [] },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with AssignmentPattern param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'AssignmentPattern', left: {}, right: {} },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with RestElement param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'RestElement', argument: {} },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with destructured { message } param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'ObjectPattern', properties: [{ type: 'Property' }] },
          makeBlock([makeThrowStatement(makeIdentifier('message'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with param type that is a random string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'SomeOtherType', name: 'e' },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with SpreadElement param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          { type: 'SpreadElement', argument: {} },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag catch with empty object as param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          {} as { type: string; name?: string },
          makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('report contains the expected message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      const msg = (reports[0] as Record<string, unknown>).message as string
      expect(msg).toContain('Useless catch clause')
      expect(msg).toContain('rethrows')
      expect(msg).toContain('Remove the try-catch')
    })

    it('report contains a node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      const node = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      )
      visitor.CatchClause(node)
      expect((reports[0] as Record<string, unknown>).node).toBe(node)
    })

    it('report contains a loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect((reports[0] as Record<string, unknown>).loc).toBeDefined()
    })

    it('loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      const loc = (reports[0] as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start).toHaveProperty('line')
      expect(start).toHaveProperty('column')
    })

    it('loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      const loc = (reports[0] as Record<string, unknown>).loc as Record<string, unknown>
      const end = loc.end as Record<string, unknown>
      expect(end).toHaveProperty('line')
      expect(end).toHaveProperty('column')
    })

    it('report has correct structure for Error(e.message) pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
      const r = reports[0] as Record<string, unknown>
      expect(r).toHaveProperty('message')
      expect(r).toHaveProperty('node')
      expect(r).toHaveProperty('loc')
    })

    it('default loc starts at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      const node = {
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      }
      visitor.CatchClause(node)
      const loc = (reports[0] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc.start as Record<string, unknown>).line).toBe(1)
      expect((loc.start as Record<string, unknown>).column).toBe(0)
    })

    it('custom loc is preserved in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))]), {
          start: { line: 42, column: 7 },
          end: { line: 44, column: 3 },
        }),
      )
      const loc = (reports[0] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc.start as Record<string, unknown>).line).toBe(42)
      expect((loc.start as Record<string, unknown>).column).toBe(7)
      expect((loc.end as Record<string, unknown>).line).toBe(44)
      expect((loc.end as Record<string, unknown>).column).toBe(3)
    })

    it('message mentions proper error handling', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      const msg = (reports[0] as Record<string, unknown>).message as string
      expect(msg).toContain('proper error handling')
    })

    it('report is an object not a primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect(typeof reports[0]).toBe('object')
      expect(reports[0]).not.toBeNull()
    })
  })

  describe('edge cases (expanded)', () => {
    it('handles node that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(42)
      expect(reports).toHaveLength(0)
    })

    it('handles node that is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(true)
      expect(reports).toHaveLength(0)
    })

    it('handles node that is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({})
      expect(reports).toHaveLength(0)
    })

    it('handles CatchClause with body as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: undefined,
      })
      expect(reports).toHaveLength(0)
    })

    it('handles throw argument with no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([{ type: 'ThrowStatement', argument: {} }])),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles body.body as empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeIdentifier('e'), makeBlock([])))
      expect(reports).toHaveLength(0)
    })

    it('handles single non-throw statement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'ExpressionStatement', expression: { type: 'CallExpression' } }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles NewExpression callee that is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'MemberExpression' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles NewExpression with no arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles MemberExpression with computed=true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Identifier', name: 'message' },
                  computed: true,
                  optional: false,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles MemberExpression with optional=true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Identifier', name: 'message' },
                  computed: false,
                  optional: true,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles MemberExpression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'CallExpression' },
                  property: { type: 'Identifier', name: 'message' },
                  computed: false,
                  optional: false,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Literal', value: 'message' },
                  computed: false,
                  optional: false,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles MemberExpression with missing object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  property: { type: 'Identifier', name: 'message' },
                  computed: false,
                  optional: false,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles MemberExpression with missing property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  computed: false,
                  optional: false,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles body with body as a non-array value (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), {
          type: 'BlockStatement',
          body: 'not-array',
        }),
      )
      expect(reports).toHaveLength(0)
    })

    it('handles catch with loc having partial start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: makeIdentifier('e'),
        body: makeBlock([makeThrowStatement(makeIdentifier('e'))]),
        loc: { start: {} },
      })
      const loc = (reports[0] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc.start as Record<string, unknown>).line).toBe(1)
    })
  })

  describe('multiple violations', () => {
    it('catches multiple violations from same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeIdentifier('err'))]),
        ),
      )

      expect(reports).toHaveLength(2)
    })

    it('catches three violations in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      visitor.CatchClause(
        makeCatchNode(makeIdentifier('a'), makeBlock([makeThrowStatement(makeIdentifier('a'))])),
      )
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('b'), makeBlock([makeThrowStatement(makeIdentifier('b'))])),
      )
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('c'), makeBlock([makeThrowStatement(makeIdentifier('c'))])),
      )

      expect(reports).toHaveLength(3)
    })

    it('counts only violations, not valid catches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'ExpressionStatement', expression: {} },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeIdentifier('err'))]),
        ),
      )

      expect(reports).toHaveLength(2)
    })

    it('handles mix of Error(e.message) and direct rethrow violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'message')))]),
        ),
      )
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('x'), makeBlock([makeThrowStatement(makeIdentifier('x'))])),
      )

      expect(reports).toHaveLength(2)
    })

    it('handles 5 violations in a row', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      for (let i = 0; i < 5; i++) {
        visitor.CatchClause(
          makeCatchNode(
            makeIdentifier(`err${i}`),
            makeBlock([makeThrowStatement(makeIdentifier(`err${i}`))]),
          ),
        )
      }

      expect(reports).toHaveLength(5)
    })

    it('each report has its own node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      const node1 = makeCatchNode(
        makeIdentifier('e'),
        makeBlock([makeThrowStatement(makeIdentifier('e'))]),
      )
      const node2 = makeCatchNode(
        makeIdentifier('err'),
        makeBlock([makeThrowStatement(makeIdentifier('err'))]),
      )

      visitor.CatchClause(node1)
      visitor.CatchClause(node2)

      expect((reports[0] as Record<string, unknown>).node).toBe(node1)
      expect((reports[1] as Record<string, unknown>).node).toBe(node2)
    })

    it('handles 10 alternating valid/invalid catches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.CatchClause(
            makeCatchNode(
              makeIdentifier('e'),
              makeBlock([makeThrowStatement(makeIdentifier('e'))]),
            ),
          )
        } else {
          visitor.CatchClause(
            makeCatchNode(
              makeIdentifier('e'),
              makeBlock([
                { type: 'ExpressionStatement', expression: {} },
                makeThrowStatement(makeIdentifier('e')),
              ]),
            ),
          )
        }
      }

      expect(reports).toHaveLength(5)
    })

    it('handles violation then null then violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      visitor.CatchClause(null)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeIdentifier('err'))]),
        ),
      )

      expect(reports).toHaveLength(2)
    })
  })

  describe('valid catch patterns', () => {
    it('allows catch with console.log only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'ExpressionStatement', expression: { type: 'CallExpression' } }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with logging then throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'ExpressionStatement', expression: { type: 'CallExpression' } },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that wraps error in custom error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'CustomError' },
              arguments: [makeMemberExpression('e', 'message')],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that throws with extra context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [makeMemberExpression('e', 'message'), { type: 'Literal', value: 'ctx' }],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that returns instead of throws', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'ReturnStatement', argument: { type: 'Literal', value: null } }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'VariableDeclaration', kind: 'const', declarations: [] }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with error transformation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'AssignmentExpression', operator: '=', left: {}, right: {} },
            },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with conditional handling', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'IfStatement', test: {}, consequent: {}, alternate: null }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that rethrows a different error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError('something else'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that sets a property then throws', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            { type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } },
            { type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } },
            makeThrowStatement(makeIdentifier('e')),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that calls a handler function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'ExpressionStatement', expression: { type: 'CallExpression' } }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'WhileStatement', test: {}, body: makeBlock([]) }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with do-while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'DoWhileStatement', test: {}, body: makeBlock([]) }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with for-in loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'ForInStatement', left: {}, right: {}, body: makeBlock([]) }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with for-of loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'ForOfStatement', left: {}, right: {}, body: makeBlock([]) }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with debugger statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([{ type: 'DebuggerStatement' }])),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with break statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([{ type: 'BreakStatement', label: null }])),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with continue statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([{ type: 'ContinueStatement', label: null }])),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with throw of literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement({ type: 'Literal', value: 'custom error' })]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with throw of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that throws a member expression not e.message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeMemberExpression('other', 'message'))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with class declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            {
              type: 'ClassDeclaration',
              id: null,
              superClass: null,
              body: { type: 'ClassBody', body: [] },
            },
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            {
              type: 'FunctionDeclaration',
              id: null,
              params: [],
              body: makeBlock([]),
              generator: false,
              async: false,
            },
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with labeled statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            {
              type: 'LabeledStatement',
              label: { type: 'Identifier', name: 'label' },
              body: { type: 'ExpressionStatement', expression: {} },
            },
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with with statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'WithStatement', object: {}, body: makeBlock([]) }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with throw of call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement({ type: 'CallExpression', callee: {}, arguments: [] })]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with throw of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {} }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with throw of unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'UnaryExpression',
              operator: '!',
              argument: {},
              prefix: true,
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with throw of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'ConditionalExpression',
              test: {},
              consequent: {},
              alternate: {},
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch with throw of sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement({ type: 'SequenceExpression', expressions: [] })]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that throws err but with different catch param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('err'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect(reports).toHaveLength(0)
    })

    it('allows catch that logs error message then does nothing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([{ type: 'ExpressionStatement', expression: { type: 'CallExpression' } }]),
        ),
      )
      expect(reports).toHaveLength(0)
    })
  })

  describe('member expression variations', () => {
    it('does not flag computed member expression e["message"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Identifier', name: 'message' },
                  computed: true,
                  optional: false,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag optional member expression e?.message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Identifier', name: 'message' },
                  computed: false,
                  optional: true,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag e.name instead of e.message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'name')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag e.description instead of e.message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'description')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag other.message where other is not catch param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('other', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag computed and optional member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Identifier', name: 'message' },
                  computed: true,
                  optional: true,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('flags non-computed non-optional e.message correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(1)
    })

    it('does not flag when object name differs from param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeNewError(makeMemberExpression('e', 'message')))]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag when property is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Literal', value: 0 },
                  computed: false,
                  optional: false,
                },
              ],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })

    it('does not flag when MemberExpression has no type field for arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('e'),
          makeBlock([
            makeThrowStatement({
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [{}],
            }),
          ]),
        ),
      )
      expect(reports).toHaveLength(0)
    })
  })

  describe('create visitor', () => {
    it('returns an object with CatchClause method', () => {
      const { context } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)
      expect(visitor).toHaveProperty('CatchClause')
      expect(typeof visitor.CatchClause).toBe('function')
    })

    it('does not report when CatchClause is never called', () => {
      const { context, reports } = createMockContext()
      noUselessCatchRule.create(context as never)
      expect(reports).toHaveLength(0)
    })

    it('visitor can be reused across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context as never)

      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect(reports).toHaveLength(1)

      visitor.CatchClause(
        makeCatchNode(
          makeIdentifier('err'),
          makeBlock([makeThrowStatement(makeIdentifier('err'))]),
        ),
      )
      expect(reports).toHaveLength(2)
    })

    it('works with mock context that has no logger', () => {
      const reports: unknown[] = []
      const context = {
        report: (d: unknown) => reports.push(d),
        config: { options: [] },
      }
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect(reports).toHaveLength(1)
    })

    it('works with mock context with extra properties', () => {
      const reports: unknown[] = []
      const context = {
        report: (d: unknown) => reports.push(d),
        config: { options: [] },
        getFilePath: () => '/test.ts',
        getAST: () => null,
      }
      const visitor = noUselessCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeIdentifier('e'), makeBlock([makeThrowStatement(makeIdentifier('e'))])),
      )
      expect(reports).toHaveLength(1)
    })
  })
})
