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

function makeTextCatchNode(text: string) {
  return {
    type: 'CatchClause' as const,
    param: { type: 'Identifier' as const, name: 'e' },
    text,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: text.length } },
  }
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

    it('has docs URL', () => {
      expect(noEmptyCatchRule.meta.docs.url).toBeDefined()
      expect(typeof noEmptyCatchRule.meta.docs.url).toBe('string')
    })

    it('schema has additionalProperties set to false', () => {
      const schema = noEmptyCatchRule.meta.schema![0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
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

    it('reports violation for catch with multiple empty statements', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(
        makeBlock([
          makeStatement('EmptyStatement'),
          makeStatement('EmptyStatement'),
          makeStatement('EmptyStatement'),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with only BlockStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeBlock([])]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with nested empty BlockStatements', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeBlock([makeBlock([])])]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with mix of EmptyStatement and BlockStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(
        makeBlock([
          makeStatement('EmptyStatement'),
          makeBlock([]),
          makeStatement('EmptyStatement'),
        ]),
      )

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with undefined body', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(undefined)

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for empty body with custom location', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([]), {
        start: { line: 42, column: 10 },
        end: { line: 44, column: 11 },
      })

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for body.body as empty array', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode({ type: 'BlockStatement', body: [] })

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for deeply nested empty blocks', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeBlock([makeBlock([makeBlock([])])])]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for multiple BlockStatements', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeBlock([]), makeBlock([])]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for EmptyStatement then BlockStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeStatement('EmptyStatement'), makeBlock([])]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for BlockStatement then EmptyStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([makeBlock([]), makeStatement('EmptyStatement')]))

      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('reports violation for catch with body as empty string', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(''))

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

    it('does not report for catch with ReturnStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ReturnStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with IfStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('IfStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with ForStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ForStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with WhileStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('WhileStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with DoWhileStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('DoWhileStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with SwitchStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('SwitchStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with TryStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('TryStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with ForInStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ForInStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with ForOfStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ForOfStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with BreakStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('BreakStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with ContinueStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ContinueStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with LabeledStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('LabeledStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with DebuggerStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('DebuggerStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with FunctionDeclaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('FunctionDeclaration')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with ClassDeclaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ClassDeclaration')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with WithStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('WithStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with multiple statements', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([makeStatement('ExpressionStatement'), makeStatement('ExpressionStatement')]),
        ),
      )

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with mixed statement types', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            makeStatement('VariableDeclaration'),
            makeStatement('IfStatement'),
            makeStatement('ExpressionStatement'),
          ]),
        ),
      )

      expect(violations).toHaveLength(0)
    })

    it('reports violation for catch with BlockStatement containing real code at top level', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([makeBlock([makeStatement('ExpressionStatement')])])),
      )

      expect(violations).toHaveLength(1)
    })

    it('does not report for catch with VariableDeclaration let', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([{ type: 'VariableDeclaration', declarations: [], kind: 'let' }])),
      )

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with VariableDeclaration var', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([{ type: 'VariableDeclaration', declarations: [], kind: 'var' }])),
      )

      expect(violations).toHaveLength(0)
    })

    it('does not report for catch with real statement after empty ones', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            makeStatement('EmptyStatement'),
            makeBlock([]),
            makeStatement('ExpressionStatement'),
          ]),
        ),
      )

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

    it('allowComments=true does not flag BlockStatement-only body', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeBlock([])])))

      expect(violations).toHaveLength(0)
    })

    it('allowComments=true does not flag mix of EmptyStatement and BlockStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([makeStatement('EmptyStatement'), makeBlock([])])),
      )

      expect(violations).toHaveLength(0)
    })

    it('allowComments=false flags BlockStatement-only body', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: false }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeBlock([])])))

      expect(violations).toHaveLength(1)
    })

    it('allowComments undefined defaults to false and flags EmptyStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{}] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('EmptyStatement')])))

      expect(violations).toHaveLength(1)
    })

    it('allowComments=true still flags truly empty body array', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect(violations).toHaveLength(1)
    })

    it('allowComments=true does not flag text-based catch with comment only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* comment */ }'))

      expect(violations).toHaveLength(0)
    })

    it('allowComments=false flags text-based catch with comment only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: false }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* comment */ }'))

      expect(violations).toHaveLength(1)
    })

    it('allowComments=true flags text-based catch with truly empty body', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) {}'))

      expect(violations).toHaveLength(1)
    })

    it('allowComments=true does not flag text-based catch with code and comments', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { handleError(e); /* log */ }'))

      expect(violations).toHaveLength(0)
    })

    it('allowComments=true does not flag text-based catch with multiline comment only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* line1\nline2 */ }'))

      expect(violations).toHaveLength(0)
    })

    it('allowComments=true does not flag text-based catch with single-line comment only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { // handle error\n }'))

      expect(violations).toHaveLength(0)
    })

    it('allowComments=true does not flag text-based catch with mixed comments', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* block */ // line\n }'))

      expect(violations).toHaveLength(0)
    })

    it('allowComments=false flags text-based catch with mixed comments', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: false }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* block */ // line\n }'))

      expect(violations).toHaveLength(1)
    })

    it('allowComments=true does not flag catch with real statement regardless', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExpressionStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('no options defaults to allowComments=false and flags', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('EmptyStatement')])))

      expect(violations).toHaveLength(1)
    })

    it('allowComments=true with multiple EmptyStatements does not flag', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([makeStatement('EmptyStatement'), makeStatement('EmptyStatement')]),
        ),
      )

      expect(violations).toHaveLength(0)
    })
  })

  describe('text-based fallback', () => {
    it('flags text-based empty catch with empty braces', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) {}'))

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch with whitespace-only braces', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { }'))

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch with single-line comment when allowComments=false', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { // comment\n }'))

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch with block comment when allowComments=false', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* comment */ }'))

      expect(violations).toHaveLength(1)
    })

    it('does not flag text-based catch with code inside', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { console.log(e); }'))

      expect(violations).toHaveLength(0)
    })

    it('flags text-based catch without opening brace', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) }'))

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch without closing brace', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) {'))

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch with reversed braces', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('}catch(e) {'))

      expect(violations).toHaveLength(1)
    })

    it('does not flag text-based catch with multiple statements', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { log(e); throw e; }'))

      expect(violations).toHaveLength(0)
    })

    it('does not flag text-based catch with throw statement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { throw e; }'))

      expect(violations).toHaveLength(0)
    })

    it('does not flag text-based catch with console.log', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { console.log(e); }'))

      expect(violations).toHaveLength(0)
    })

    it('flags text-based catch with newlines only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) {\n\n\n}'))

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch with tabs only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) {\t\t}'))

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch with mixed whitespace', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { \n\t \n }'))

      expect(violations).toHaveLength(1)
    })

    it('does not flag text-based catch with code and comments', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { handle(e); // log }'))

      expect(violations).toHaveLength(0)
    })

    it('flags text-based catch with only semicolons', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { ; }'))

      expect(violations).toHaveLength(0)
    })

    it('flags text-based catch with empty string', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = {
        type: 'CatchClause' as const,
        param: { type: 'Identifier' as const, name: 'e' },
        text: '',
      }
      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('flags text-based catch node without text property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = {
        type: 'CatchClause' as const,
        param: { type: 'Identifier' as const, name: 'e' },
      }
      visitor.CatchClause(node)

      expect(violations).toHaveLength(1)
    })

    it('does not flag text-based catch with error handling code', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { handleError(e); }'))

      expect(violations).toHaveLength(0)
    })

    it('flags text-based catch with multiple block comments only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* a */ /* b */ }'))

      expect(violations).toHaveLength(1)
    })

    it('does not flag text-based catch with multiple block comments when allowComments=true', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { /* a */ /* b */ }'))

      expect(violations).toHaveLength(0)
    })

    it('flags text-based catch with single-line comments only', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { // a\n // b\n }'))

      expect(violations).toHaveLength(1)
    })

    it('does not flag text-based catch with single-line comments when allowComments=true', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { // a\n // b\n }'))

      expect(violations).toHaveLength(0)
    })

    it('does not flag text-based catch with e.message access', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { e.message; }'))

      expect(violations).toHaveLength(0)
    })

    it('flags text-based catch with nested braces but no code', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeTextCatchNode('catch(e) { {} }'))

      expect(violations).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('report message contains exact text', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect(violations).toHaveLength(1)
      expect((violations[0] as Record<string, unknown>).message).toBe(
        'Empty catch clause. Either add error handling or remove the catch block.',
      )
    })

    it('report message mentions error handling', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect((violations[0] as Record<string, unknown>).message).toContain('error handling')
    })

    it('report message mentions catch block', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect((violations[0] as Record<string, unknown>).message).toContain('catch block')
    })

    it('report includes node reference', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([]))
      visitor.CatchClause(node)

      expect((violations[0] as Record<string, unknown>).node).toBe(node)
    })

    it('report loc has correct start line', () => {
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

      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start.line).toBe(10)
    })

    it('report loc has correct start column', () => {
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

      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start.column).toBe(4)
    })

    it('report loc has correct end line', () => {
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

      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const end = loc.end as Record<string, unknown>
      expect(end.line).toBe(12)
    })

    it('report loc has correct end column', () => {
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

      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const end = loc.end as Record<string, unknown>
      expect(end.column).toBe(5)
    })

    it('report has all expected properties', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      const report = violations[0] as Record<string, unknown>
      expect(report).toHaveProperty('message')
      expect(report).toHaveProperty('node')
      expect(report).toHaveProperty('loc')
    })

    it('message is consistent across multiple invocations', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      const msg1 = (violations[0] as Record<string, unknown>).message
      const msg2 = (violations[1] as Record<string, unknown>).message
      expect(msg1).toBe(msg2)
    })

    it('report loc is extracted from custom location', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([]), {
          start: { line: 100, column: 50 },
          end: { line: 200, column: 60 },
        }),
      )

      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      const end = loc.end as Record<string, unknown>
      expect(start.line).toBe(100)
      expect(start.column).toBe(50)
      expect(end.line).toBe(200)
      expect(end.column).toBe(60)
    })

    it('report for text-based node has default location when no loc provided', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'e' },
        text: 'catch(e) {}',
      })

      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start.line).toBe(1)
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

    it('handles body as number', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(42))

      expect(violations).toHaveLength(1)
    })

    it('handles body as boolean', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(true))

      expect(violations).toHaveLength(1)
    })

    it('handles node with empty param name', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: '' },
        body: makeBlock([]),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(violations).toHaveLength(1)
    })

    it('handles node with no param property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        body: makeBlock([]),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(violations).toHaveLength(1)
    })

    it('handles node with undefined param', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause({
        type: 'CatchClause',
        param: undefined,
        body: makeBlock([]),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(violations).toHaveLength(1)
    })

    it('handles body.body as undefined', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode({ type: 'BlockStatement', body: undefined }))

      expect(violations).toHaveLength(1)
    })

    it('does not flag body with object without type property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([{ foo: 'bar' }])))

      expect(violations).toHaveLength(0)
    })

    it('does not flag body with object having non-standard type', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([{ type: 'CustomStatement' }])))

      expect(violations).toHaveLength(0)
    })

    it('does not flag body with object without type property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([{}])))

      expect(violations).toHaveLength(0)
    })

    it('handles catch node with numeric type', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(123)

      expect(violations).toHaveLength(0)
    })

    it('handles catch node with boolean type', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(false)

      expect(violations).toHaveLength(0)
    })

    it('handles deeply nested empty catch blocks independently', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const catch1 = makeCatchNode(makeBlock([]))
      const catch2 = makeCatchNode(makeBlock([]))
      const catch3 = makeCatchNode(makeBlock([makeStatement('ExpressionStatement')]))

      visitor.CatchClause(catch1)
      visitor.CatchClause(catch2)
      visitor.CatchClause(catch3)

      expect(violations).toHaveLength(2)
    })
  })

  describe('catch with various statement types', () => {
    it('does not flag ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExpressionStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ReturnStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ReturnStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag VariableDeclaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('VariableDeclaration')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag FunctionDeclaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('FunctionDeclaration')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag IfStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('IfStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ForStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ForStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag WhileStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('WhileStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag DoWhileStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('DoWhileStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag SwitchStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('SwitchStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag TryStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('TryStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ThrowStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ThrowStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ForInStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ForInStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ForOfStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ForOfStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag BreakStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('BreakStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ContinueStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ContinueStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag LabeledStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('LabeledStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag DebuggerStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('DebuggerStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ClassDeclaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ClassDeclaration')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag WithStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('WithStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('flags BlockStatement containing real code at top level', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([makeBlock([makeStatement('ExpressionStatement')])])),
      )
      expect(violations).toHaveLength(1)
    })

    it('does not flag ArrowFunctionExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'ArrowFunctionExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag AwaitExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag YieldExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'YieldExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag NewExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'NewExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag AssignmentExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'AssignmentExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag BinaryExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'BinaryExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag CallExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'CallExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag MemberExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'MemberExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag ConditionalExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'ConditionalExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag UnaryExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'UnaryExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag UpdateExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'UpdateExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag LogicalExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'LogicalExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag SequenceExpression inside ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'SequenceExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag ImportDeclaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ImportDeclaration')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag ExportNamedDeclaration', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExportNamedDeclaration')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag two ExpressionStatements', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([makeStatement('ExpressionStatement'), makeStatement('ExpressionStatement')]),
        ),
      )
      expect(violations).toHaveLength(0)
    })
  })

  describe('multiple violations', () => {
    it('reports two violations for two empty catches', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect(violations).toHaveLength(2)
    })

    it('reports three violations for three empty catches', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))
      visitor.CatchClause(makeCatchNode(makeBlock([])))
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect(violations).toHaveLength(3)
    })

    it('reports correctly for mixed empty and non-empty catches', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExpressionStatement')])))
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect(violations).toHaveLength(2)
    })

    it('reports two violations for same node visited twice', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      const node = makeCatchNode(makeBlock([]))
      visitor.CatchClause(node)
      visitor.CatchClause(node)

      expect(violations).toHaveLength(2)
    })

    it('reports five violations for five empty catches', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      for (let i = 0; i < 5; i++) {
        visitor.CatchClause(makeCatchNode(makeBlock([])))
      }

      expect(violations).toHaveLength(5)
    })

    it('reports zero for non-empty followed by non-empty', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExpressionStatement')])))
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ThrowStatement')])))

      expect(violations).toHaveLength(0)
    })

    it('reports one for empty followed by non-empty', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExpressionStatement')])))

      expect(violations).toHaveLength(1)
    })

    it('reports one for non-empty followed by empty', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExpressionStatement')])))
      visitor.CatchClause(makeCatchNode(makeBlock([])))

      expect(violations).toHaveLength(1)
    })

    it('reports for multiple catches with different locations', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([]), {
          start: { line: 1, column: 0 },
          end: { line: 2, column: 1 },
        }),
      )
      visitor.CatchClause(
        makeCatchNode(makeBlock([]), {
          start: { line: 10, column: 0 },
          end: { line: 11, column: 1 },
        }),
      )

      expect(violations).toHaveLength(2)
      const loc0 = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const loc1 = (violations[1] as Record<string, unknown>).loc as Record<string, unknown>
      expect((loc0.start as Record<string, unknown>).line).toBe(1)
      expect((loc1.start as Record<string, unknown>).line).toBe(10)
    })

    it('reports correctly with allowComments true for multiple catches', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [{ allowComments: true }] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([])))
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('EmptyStatement')])))

      expect(violations).toHaveLength(1)
    })

    it('reports ten violations for ten empty catches', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      for (let i = 0; i < 10; i++) {
        visitor.CatchClause(makeCatchNode(makeBlock([])))
      }

      expect(violations).toHaveLength(10)
    })

    it('reports correctly for alternating empty and non-empty', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      for (let i = 0; i < 6; i++) {
        if (i % 2 === 0) {
          visitor.CatchClause(makeCatchNode(makeBlock([])))
        } else {
          visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ExpressionStatement')])))
        }
      }

      expect(violations).toHaveLength(3)
    })
  })

  describe('valid code - extended', () => {
    it('does not flag catch with console.log', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'console' },
                  property: { type: 'Identifier', name: 'log' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with console.warn', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'console' },
                  property: { type: 'Identifier', name: 'warn' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with console.info', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'console' },
                  property: { type: 'Identifier', name: 'info' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with console.debug', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'console' },
                  property: { type: 'Identifier', name: 'debug' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with throw new Error', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ThrowStatement',
              expression: {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Error' },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with throw error', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ThrowStatement',
              expression: { type: 'Identifier', name: 'e' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with callback(error)', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'callback' },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with reject(error)', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'reject' },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with logError function', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'logError' },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with Promise.reject', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'Promise' },
                  property: { type: 'Identifier', name: 'reject' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with if-else error handling', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([makeStatement('IfStatement'), makeStatement('ExpressionStatement')]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with switch on error code', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('SwitchStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with try-catch inside', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('TryStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with for loop processing', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('ForStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with while loop', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('WhileStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with destructuring', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([{ type: 'VariableDeclaration', declarations: [], kind: 'const' }]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with assignment', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'AssignmentExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with method call on error', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Identifier', name: 'toString' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with property access chain', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'MemberExpression',
                object: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'e' },
                  property: { type: 'Identifier', name: 'response' },
                },
                property: { type: 'Identifier', name: 'status' },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with template literal', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'console' },
                  property: { type: 'Identifier', name: 'log' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with await expression', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with yield expression', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'YieldExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with error.message access', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'e' },
                property: { type: 'Identifier', name: 'message' },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with error.stack access', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'e' },
                property: { type: 'Identifier', name: 'stack' },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with typeof check', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('IfStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with instanceof check', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(makeCatchNode(makeBlock([makeStatement('IfStatement')])))
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with JSON.stringify', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'JSON' },
                  property: { type: 'Identifier', name: 'stringify' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with event emission', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'ThisExpression' },
                  property: { type: 'Identifier', name: 'emit' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with state update', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: { type: 'AssignmentExpression' },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with process.exit', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'process' },
                  property: { type: 'Identifier', name: 'exit' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with this.handleError', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'ThisExpression' },
                  property: { type: 'Identifier', name: 'handleError' },
                },
              },
            },
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with error logging and re-throw', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([makeStatement('ExpressionStatement'), makeStatement('ThrowStatement')]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with VariableDeclaration and ExpressionStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([
            { type: 'VariableDeclaration', declarations: [], kind: 'const' },
            makeStatement('ExpressionStatement'),
          ]),
        ),
      )
      expect(violations).toHaveLength(0)
    })

    it('does not flag catch with ClassDeclaration and ReturnStatement', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }
      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(
          makeBlock([makeStatement('ClassDeclaration'), makeStatement('ReturnStatement')]),
        ),
      )
      expect(violations).toHaveLength(0)
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

    it('handles location with only start property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([]), {
          start: { line: 5, column: 2 },
        }),
      )

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const end = loc.end as Record<string, unknown>
      expect(end.line).toBe(1)
    })

    it('handles location with missing end property', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([]), {
          start: { line: 5, column: 2 },
          end: undefined,
        }),
      )

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const end = loc.end as Record<string, unknown>
      expect(end.line).toBe(1)
    })

    it('handles location with partial start missing column', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([]), {
          start: { line: 5 },
          end: { line: 7, column: 3 },
        }),
      )

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start.line).toBe(5)
      expect(start.column).toBe(0)
    })

    it('handles location with string values defaulting to fallback', () => {
      const violations: unknown[] = []
      const context = {
        config: { options: [] },
        report: (v: unknown) => violations.push(v),
      }

      const visitor = noEmptyCatchRule.create(context as never)
      visitor.CatchClause(
        makeCatchNode(makeBlock([]), {
          start: { line: 'abc', column: 'xyz' },
          end: { line: 'def', column: 'uvw' },
        }),
      )

      expect(violations).toHaveLength(1)
      const loc = (violations[0] as Record<string, unknown>).loc as Record<string, unknown>
      const start = loc.start as Record<string, unknown>
      expect(start.line).toBe(1)
      expect(start.column).toBe(0)
    })
  })
})
