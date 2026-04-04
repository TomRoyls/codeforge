import { describe, it, expect } from 'vitest'
import { noUselessCatchRule } from '../../../../src/rules/correctness/no-useless-catch.js'

function makeCatchNode(
  param: { type: string; name?: string } | null,
  body: unknown,
  loc?: unknown,
) {
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
})
