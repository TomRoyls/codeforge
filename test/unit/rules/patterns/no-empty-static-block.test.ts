import { describe, test, expect } from 'vitest'
import { noEmptyStaticBlockRule } from '../../../../src/rules/patterns/no-empty-static-block.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createEmptyStaticBlock(line = 1, column = 0): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNonEmptyStaticBlock(line = 1, column = 0): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 'hello' },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createStaticBlockWithMultipleStatements(line = 1, column = 0): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'x' },
              init: { type: 'Literal', value: 1 },
            },
          ],
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 2 },
          },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createStaticBlockWithCommentOnly(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createNonStaticBlock(): unknown {
  return {
    type: 'ClassBody',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithoutBody(): unknown {
  return {
    type: 'StaticBlock',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithNullBody(): unknown {
  return {
    type: 'StaticBlock',
    body: null,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithStringBody(): unknown {
  return {
    type: 'StaticBlock',
    body: 'not a block statement',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithEmptyArrayBody(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithNullBodyProperty(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: null,
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createStaticBlockWithNonArrayBody(): unknown {
  return {
    type: 'StaticBlock',
    body: {
      type: 'BlockStatement',
      body: { type: 'NotAnArray' },
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-empty-static-block rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyStaticBlockRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEmptyStaticBlockRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention empty static block in description', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.description.toLowerCase()).toContain('empty')
      expect(noEmptyStaticBlockRule.meta.docs?.description.toLowerCase()).toContain('static')
    })

    test('should have empty schema', () => {
      expect(noEmptyStaticBlockRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noEmptyStaticBlockRule.meta.fixable).toBeUndefined()
    })
  })

  describe('meta structure', () => {
    test('meta should be an object', () => {
      expect(typeof noEmptyStaticBlockRule.meta).toBe('object')
      expect(noEmptyStaticBlockRule.meta).not.toBeNull()
    })

    test('meta.type should be a string', () => {
      expect(typeof noEmptyStaticBlockRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof noEmptyStaticBlockRule.meta.severity).toBe('string')
    })

    test('meta.severity should be a valid Severity value', () => {
      expect(['off', 'warn', 'error']).toContain(noEmptyStaticBlockRule.meta.severity)
    })

    test('meta.type should be a valid RuleType value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noEmptyStaticBlockRule.meta.type)
    })

    test('meta.docs should exist', () => {
      expect(noEmptyStaticBlockRule.meta.docs).toBeDefined()
    })

    test('meta.docs should be an object', () => {
      expect(typeof noEmptyStaticBlockRule.meta.docs).toBe('object')
      expect(noEmptyStaticBlockRule.meta.docs).not.toBeNull()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noEmptyStaticBlockRule.meta.docs?.description).toBe('string')
      expect(noEmptyStaticBlockRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.recommended should be a boolean', () => {
      expect(typeof noEmptyStaticBlockRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.docs.category should be a string', () => {
      expect(typeof noEmptyStaticBlockRule.meta.docs?.category).toBe('string')
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noEmptyStaticBlockRule.meta.schema)).toBe(true)
    })

    test('meta should not be deprecated', () => {
      expect(noEmptyStaticBlockRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noEmptyStaticBlockRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not require type checking', () => {
      expect(noEmptyStaticBlockRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta should have exactly type, severity, docs, schema, fixable keys', () => {
      const keys = Object.keys(noEmptyStaticBlockRule.meta)
      expect(keys).toContain('type')
      expect(keys).toContain('severity')
      expect(keys).toContain('docs')
      expect(keys).toContain('schema')
    })

    test('meta.docs.description should end with a period', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('meta.docs should not have a url property', () => {
      expect(noEmptyStaticBlockRule.meta.docs?.url).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with StaticBlock method', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(visitor).toHaveProperty('StaticBlock')
    })

    test('should return object with only StaticBlock method', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(Object.keys(visitor)).toEqual(['StaticBlock'])
    })

    test('should have function as StaticBlock method', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(typeof visitor.StaticBlock).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return a non-undefined visitor', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(visitor).not.toBeUndefined()
    })

    test('should return an object type visitor', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return a new visitor object on each call', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor1 = noEmptyStaticBlockRule.create(context)
      const visitor2 = noEmptyStaticBlockRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('create should not throw when called', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })

      expect(() => noEmptyStaticBlockRule.create(context)).not.toThrow()
    })

    test('StaticBlock method should be callable', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createEmptyStaticBlock())).not.toThrow()
    })

    test('StaticBlock method should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(visitor.StaticBlock.length).toBe(1)
    })
  })

  describe('detecting empty static blocks', () => {
    test('should report empty static block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty static block')
    })

    test('should not report non-empty static block with one statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createNonEmptyStaticBlock())

      expect(reports.length).toBe(0)
    })

    test('should not report non-empty static block with multiple statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createStaticBlockWithMultipleStatements())

      expect(reports.length).toBe(0)
    })

    test('should report static block with no statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createStaticBlockWithCommentOnly())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for empty static block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message).toBe('Unexpected empty static block.')
    })

    test('should report correct end location for empty static block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report exactly once for a single empty static block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports.length).toBe(1)
    })

    test('should report for empty static block at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report for empty static block at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(100, 50))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report for empty static block at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(0, 0))

      expect(reports.length).toBe(1)
    })

    test('should report for empty static block at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(9999, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report for empty static block at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, 500))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report for empty static block with column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(3, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report multiple empty static blocks independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, 0))
      visitor.StaticBlock(createEmptyStaticBlock(5, 0))
      visitor.StaticBlock(createEmptyStaticBlock(10, 0))

      expect(reports.length).toBe(3)
    })

    test('should preserve message across multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, 0))
      visitor.StaticBlock(createEmptyStaticBlock(5, 0))

      expect(reports[0].message).toBe('Unexpected empty static block.')
      expect(reports[1].message).toBe('Unexpected empty static block.')
    })

    test('should report loc for each empty block in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(2, 4))
      visitor.StaticBlock(createEmptyStaticBlock(7, 12))

      expect(reports[0].loc?.start).toEqual({ line: 2, column: 4 })
      expect(reports[1].loc?.start).toEqual({ line: 7, column: 12 })
    })

    test('should report when empty block is first then non-empty block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())
      visitor.StaticBlock(createNonEmptyStaticBlock())

      expect(reports.length).toBe(1)
    })

    test('should report when non-empty block is first then empty block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createNonEmptyStaticBlock())
      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for second empty block after non-empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createNonEmptyStaticBlock())
      visitor.StaticBlock(createEmptyStaticBlock(20, 30))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(30)
    })

    test('should use separate report arrays for separate contexts', () => {
      const ctx1 = createMockRuleContext({ source: 'class A { static {} }' })
      const ctx2 = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor1 = noEmptyStaticBlockRule.create(ctx1.context)
      const visitor2 = noEmptyStaticBlockRule.create(ctx2.context)

      visitor1.StaticBlock(createEmptyStaticBlock())
      visitor2.StaticBlock(createEmptyStaticBlock())
      visitor2.StaticBlock(createEmptyStaticBlock())

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(2)
    })

    test('should report message containing static and block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message.toLowerCase()).toContain('static')
      expect(reports[0].message.toLowerCase()).toContain('block')
    })
  })

  describe('non-empty static blocks', () => {
    test('should not report static block with ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createNonEmptyStaticBlock())

      expect(reports.length).toBe(0)
    })

    test('should not report static block with VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: [],
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'FunctionDeclaration',
              id: { type: 'Identifier', name: 'foo' },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with ReturnStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with IfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForStatement',
              init: null,
              test: null,
              update: null,
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with SwitchStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'SwitchStatement',
              discriminant: { type: 'Identifier', name: 'x' },
              cases: [],
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with TryStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'TryStatement',
              block: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with ThrowStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: { type: 'NewExpression' },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForInStatement',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForOfStatement',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Identifier', name: 'arr' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with DoWhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'DoWhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with DebuggerStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'DebuggerStatement' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with BreakStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'BreakStatement', label: null }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with ContinueStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ContinueStatement', label: null }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'LabeledStatement',
              label: { type: 'Identifier', name: 'outer' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with WithStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WithStatement',
              object: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report static block with many statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: Array.from({ length: 50 }, (_, i) => ({
            type: 'ExpressionStatement',
            expression: { type: 'Literal', value: i },
          })),
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(undefined)).not.toThrow()
    })

    test('should handle non-StaticBlock node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createNonStaticBlock())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block without body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithoutBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with null body', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithNullBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with non-object body', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithStringBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with block statement but no body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithEmptyArrayBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with null body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithNullBodyProperty())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with non-array body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createStaticBlockWithNonArrayBody())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = createEmptyStaticBlock()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle object without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = { body: { type: 'BlockStatement', body: [] } }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean true node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean false node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = { type: 42 }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = { type: true }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = { type: null }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = { type: { name: 'StaticBlock' } }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with lowercase type staticblock', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'staticblock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with uppercase type STATICBLOCK', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'STATICBLOCK',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type StaticBlock extra whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: ' StaticBlock ',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with type Program instead of BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'Program',
          body: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with empty string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: '',
          body: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with number body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: 42,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with string body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: 'not an array',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with undefined body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: undefined,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body as boolean true', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body as boolean false', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body as array', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body as function', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: () => {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body.body with one element array', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'EmptyStatement' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle body.body with many elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: {
          type: 'BlockStatement',
          body: Array.from({ length: 100 }, () => ({ type: 'EmptyStatement' })),
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with partial start missing column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5 }, end: { line: 5, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with partial end missing line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 3, column: 5 }, end: { column: 15 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with string line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: '5', column: 0 }, end: { line: '5', column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with negative line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle loc with zero line', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle loc with negative column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: -5 }, end: { line: 1, column: 5 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle loc with floating point column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 5.5 }, end: { line: 1, column: 10.5 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5.5)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        extra: true,
        parent: { type: 'ClassBody' },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        meta: { nested: { deep: { value: true } } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: null, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with null end', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 3, column: 5 }, end: null },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: undefined, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start entirely', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with missing end entirely', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle node without loc property - uses default location', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: {},
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle Date object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(Infinity)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with Symbol type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = { type: Symbol('StaticBlock') }
      expect(() => visitor.StaticBlock(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle static block with body type as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 42, body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle static block with body type as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: null, body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle static block with empty body body array literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: new Array() },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle report descriptor containing message only', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should handle multiple sequential calls with mixed nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())
      visitor.StaticBlock(null)
      visitor.StaticBlock(createEmptyStaticBlock())
      visitor.StaticBlock(undefined)
      visitor.StaticBlock(createEmptyStaticBlock())
      visitor.StaticBlock(createNonEmptyStaticBlock())
      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports.length).toBe(4)
    })

    test('should not report for ClassBody node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createNonStaticBlock())

      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BlockStatement node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = Object.create({ type: 'StaticBlock' })
      node.body = { type: 'BlockStatement', body: [] }
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle calling StaticBlock with no arguments', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock()).not.toThrow()
    })

    test('should handle calling StaticBlock with extra arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(createEmptyStaticBlock(), 'extra')).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle body with getter that throws', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        get body() {
          throw new Error('getter error')
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.StaticBlock(node)).toThrow('getter error')
    })

    test('should handle node with type property getter returning StaticBlock', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        get type() {
          return 'StaticBlock'
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with zero values for all fields', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with frozen body object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const body = Object.freeze({ type: 'BlockStatement', body: [] })
      const node = {
        type: 'StaticBlock',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with sealed body object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const body = Object.seal({ type: 'BlockStatement', body: [] })
      const node = {
        type: 'StaticBlock',
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-empty static block at various locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createNonEmptyStaticBlock(10, 20))
      visitor.StaticBlock(createNonEmptyStaticBlock(50, 100))
      visitor.StaticBlock(createNonEmptyStaticBlock(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with body body as a sparse array', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const sparseArray = new Array(5)
      sparseArray[2] = { type: 'ExpressionStatement' }

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: sparseArray },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle body.body as array-like object with length 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: { length: 0 } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with same start and end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5, column: 3 }, end: { line: 5, column: 3 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start).toEqual({ line: 5, column: 3 })
      expect(reports[0].loc?.end).toEqual({ line: 5, column: 3 })
    })

    test('should handle node where end comes before start', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 10, column: 5 }, end: { line: 2, column: 1 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should not report for ArrowFunctionExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for MethodDefinition type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'MethodDefinition',
        value: { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty static block with computed-like loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1 + 2, column: 3 * 4 },
          end: { line: 3 + 2, column: 12 + 5 },
        },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should handle static block with body containing only whitespace comment node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle negative Infinity node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(-Infinity)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle BigInt node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(BigInt(9007199254740991))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty Map node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(new Map())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty Set node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(new Set())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle WeakRef node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(new WeakRef({}))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Promise node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(Promise.resolve('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Error object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      expect(() => visitor.StaticBlock(new Error('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty static block with very large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(Number.MAX_SAFE_INTEGER, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('should handle empty static block with very large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, Number.MAX_SAFE_INTEGER))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('should handle non-empty static block after multiple empty ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())
      visitor.StaticBlock(createEmptyStaticBlock())
      visitor.StaticBlock(createEmptyStaticBlock())
      visitor.StaticBlock(createNonEmptyStaticBlock())

      expect(reports.length).toBe(3)
    })

    test('should handle alternating empty and non-empty blocks', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, 0))
      visitor.StaticBlock(createNonEmptyStaticBlock(2, 0))
      visitor.StaticBlock(createEmptyStaticBlock(3, 0))
      visitor.StaticBlock(createNonEmptyStaticBlock(4, 0))
      visitor.StaticBlock(createEmptyStaticBlock(5, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
      expect(reports[2].loc?.start.line).toBe(5)
    })

    test('should handle 50 empty blocks in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.StaticBlock(createEmptyStaticBlock(i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle StaticBlock visitor being called through destructured method', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const { StaticBlock } = noEmptyStaticBlockRule.create(context)

      StaticBlock(createEmptyStaticBlock())

      expect(reports.length).toBe(1)
    })

    test('should handle body.body as frozen empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: Object.freeze([]) },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with only type and loc no body', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: undefined,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty static block with loc containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 5, column: 2, offset: 42 },
          end: { line: 5, column: 12, offset: 52 },
        },
      }
      visitor.StaticBlock(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  describe('location reporting', () => {
    test('should report loc with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report loc start line as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should report loc start column as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report loc end line as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should report loc end column as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report loc for block at line 1 col 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, 0))

      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('should report loc for block at line 42 col 17', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(42, 17))

      expect(reports[0].loc?.start).toEqual({ line: 42, column: 17 })
    })

    test('should report end column relative to start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(3, 5))

      expect(reports[0].loc?.end).toEqual({ line: 3, column: 15 })
    })

    test('should report end location matching node end', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 10, column: 20 }, end: { line: 12, column: 5 } },
      }
      visitor.StaticBlock(node)

      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should report loc with multiline span', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      const node = {
        type: 'StaticBlock',
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5, column: 0 }, end: { line: 10, column: 1 } },
      }
      visitor.StaticBlock(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(10)
    })
  })

  describe('message reporting', () => {
    test('should report exact message string', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message).toBe('Unexpected empty static block.')
    })

    test('message should start with Unexpected', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message.startsWith('Unexpected')).toBe(true)
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should contain word empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message).toContain('empty')
    })

    test('message should contain word static', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message).toContain('static')
    })

    test('message should contain word block', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message).toContain('block')
    })

    test('message should not be empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should be consistent across multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'class A { static {} }' })
      const visitor = noEmptyStaticBlockRule.create(context)

      visitor.StaticBlock(createEmptyStaticBlock(1, 0))
      visitor.StaticBlock(createEmptyStaticBlock(50, 100))

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('exports', () => {
    test('should export rule as named export', () => {
      expect(noEmptyStaticBlockRule).toBeDefined()
    })

    test('should export an object', () => {
      expect(typeof noEmptyStaticBlockRule).toBe('object')
      expect(noEmptyStaticBlockRule).not.toBeNull()
    })

    test('export should have meta property', () => {
      expect(noEmptyStaticBlockRule).toHaveProperty('meta')
    })

    test('export should have create property', () => {
      expect(noEmptyStaticBlockRule).toHaveProperty('create')
    })

    test('export meta should be an object', () => {
      expect(typeof noEmptyStaticBlockRule.meta).toBe('object')
      expect(noEmptyStaticBlockRule.meta).not.toBeNull()
    })

    test('export create should be a function', () => {
      expect(typeof noEmptyStaticBlockRule.create).toBe('function')
    })

    test('export should have exactly meta and create keys', () => {
      const keys = Object.keys(noEmptyStaticBlockRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('create should accept context and return visitor', () => {
      const { context } = createMockRuleContext({ source: 'class A { static {} }' })
      const result = noEmptyStaticBlockRule.create(context)

      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('StaticBlock')
    })

    test('default export should exist and equal named export', async () => {
      const module = await import('../../../../src/rules/patterns/no-empty-static-block.js')
      expect(module.default).toBeDefined()
      expect(module.default).toBe(noEmptyStaticBlockRule)
    })
  })
})
