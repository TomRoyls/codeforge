import { describe, it, expect } from 'vitest'
import { noEmptyCatchRule } from '../../../../src/rules/correctness/no-empty-catch.js'

function makeCatchNode(body: unknown, loc?: unknown) {
  return {
    type: 'CatchClause',
    param: { type: 'Identifier', name: 'e' },
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

function makeStatement(type: string) {
  return { type }
}

describe('no-empty-catch rule', () => {
  describe('meta', () => {
    it('has correct rule id', () => {
      expect(noEmptyCatchRule.meta.docs.description).toContain('empty catch')
    })

    it('has problem type', () => {
      expect(noEmptyCatchRule.meta.type).toBe('problem')
    })

    it('has warn severity', () => {
      expect(noEmptyCatchRule.meta.severity).toBe('warn')
    })

    it('has correctness category', () => {
      expect(noEmptyCatchRule.meta.docs.category).toBe('correctness')
    })

    it('is recommended', () => {
      expect(noEmptyCatchRule.meta.docs.recommended).toBe(true)
    })

    it('has schema with allowComments option', () => {
      expect(noEmptyCatchRule.meta.schema).toBeDefined()
      const schema = noEmptyCatchRule.meta.schema![0] as Record<string, unknown>
      expect(schema.type).toBe('object')
      expect(schema.properties).toHaveProperty('allowComments')
    })
  })

  describe('empty catch blocks', () => {
    it('reports violation for empty catch block', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
      expect((violations[0] as Record<string, unknown>).message).toContain('Empty catch clause')
    })

    it('reports violation for catch with only whitespace body', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with only empty statements', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeStatement('EmptyStatement')]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch body with null', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(null)

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })
  })

  describe('non-empty catch blocks', () => {
    it('does not report for catch with console.error', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(
        makeBlock([
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'console' },
                property: { type: 'Identifier', name: 'error' },
              },
            },
          },
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with variable declaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(
        makeBlock([{ type: 'VariableDeclaration', declarations: [], kind: 'const' }]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with throw statement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeStatement('ThrowStatement')]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with function call', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeStatement('ExpressionStatement')]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })
  })

  describe('allowComments option', () => {
    it('reports violation for comments-only block when allowComments is false (default)', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: false }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeStatement('EmptyStatement')]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('does not report for comments-only block when allowComments is true', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeStatement('EmptyStatement')]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('still reports truly empty block even with allowComments true', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('handles null node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(null)

      expect(violations).toHaveLength(0)
    })

    it('handles undefined node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(undefined)

      expect(violations).toHaveLength(0)
    })

    it('handles non-CatchClause node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause({ type: 'ExpressionStatement' })

      expect(violations).toHaveLength(0)
    })

    it('handles non-object node', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause('string')

      expect(violations).toHaveLength(0)
    })

    it('handles missing body', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = { type: 'CatchClause', param: null }

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('handles body with non-BlockStatement type', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode({ type: 'ExpressionStatement' })

      visitor.CatchClause(node)

      expect(violations).toHaveLength(0)
    })

    it('includes location in report', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([]), {
        start: { line: 10, column: 4 },
        end: { line: 12, column: 5 },
      })

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc?.start as Record<string, unknown>)?.line).toBe(10)
      expect((loc?.end as Record<string, unknown>)?.line).toBe(12)
    })

    it('handles nested empty try-catch', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const innerCatch = makeCatchNode(makeBlock([]))
      const outerCatch = makeCatchNode(
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

    it('handles catch with body having non-array body property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode({ type: 'BlockStatement', body: null })

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })
  })

  describe('location extraction', () => {
    it('returns default location for node without loc', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = { type: 'CatchClause', body: makeBlock([]) }

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc?.start as Record<string, unknown>)?.line).toBe(1)
    })
  })
})
