import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryConditionRule } from '../../../../src/rules/patterns/no-unnecessary-condition.js'
import noUnnecessaryConditionDefault from '../../../../src/rules/patterns/no-unnecessary-condition.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (true) { }',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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

function createIfStatement(testValue: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: testValue,
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createConditionalExpression(testValue: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ConditionalExpression',
    test: testValue,
    consequent: { type: 'Identifier', name: 'a' },
    alternate: { type: 'Identifier', name: 'b' },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'BooleanLiteral',
    value,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

function createLogicalExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

function createRegExpLiteral(): unknown {
  return {
    type: 'RegExpLiteral',
    pattern: 'test',
    flags: '',
  }
}

describe('no-unnecessary-condition rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConditionRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConditionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryConditionRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnnecessaryConditionRule.meta.fixable).toBeUndefined()
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.description.toLowerCase()).toContain(
        'unnecessary',
      )
    })

    test('should have a docs url', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.url).toBeDefined()
    })

    test('should have a string docs url', () => {
      expect(typeof noUnnecessaryConditionRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing rule name', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.url).toContain('no-unnecessary-condition')
    })

    test('should have schema as empty array', () => {
      expect(noUnnecessaryConditionRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(noUnnecessaryConditionRule.meta.deprecated).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnnecessaryConditionRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have description mentioning condition', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.description.toLowerCase()).toContain('condition')
    })

    test('should have description mentioning truthy or falsy', () => {
      const desc = noUnnecessaryConditionRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('truthy') || desc.includes('falsy')).toBe(true)
    })
  })

  describe('visitor creation', () => {
    test('should return object with IfStatement handler', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('should return object with ConditionalExpression handler', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('should return only IfStatement and ConditionalExpression handlers', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(Object.keys(visitor).sort()).toEqual(['ConditionalExpression', 'IfStatement'])
    })

    test('should create fresh visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryConditionRule.create(context)
      const visitor2 = noUnnecessaryConditionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should return callable visitor functions', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(() => visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))).not.toThrow()
      expect(() =>
        visitor.ConditionalExpression(createConditionalExpression(createBooleanLiteral(true))),
      ).not.toThrow()
    })
  })

  describe('detecting unnecessary conditions in if statements', () => {
    test('should report if with true literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('truthy')
    })

    test('should report if with false literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('falsy')
    })

    test('should report if with null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(null)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('null')
    })

    test('should not report if with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'Identifier', name: 'x' }))

      expect(reports.length).toBe(0)
    })

    test('should report if with Literal true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('truthy')
    })

    test('should report if with Literal false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('falsy')
    })

    test('should report if with RegExpLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createRegExpLiteral()))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('regexp')
    })

    test('should not report if with Literal number 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report if with Literal empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('')))

      expect(reports.length).toBe(0)
    })

    test('should not report if with CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report if with MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report if with BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should report BooleanLiteral true with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].message).toBe('Unnecessary condition: always truthy')
    })

    test('should report BooleanLiteral false with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports[0].message).toBe('Unnecessary condition: always falsy')
    })

    test('should report Literal null with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(null)))

      expect(reports[0].message).toBe('Unnecessary condition: always falsy (null)')
    })

    test('should report RegExpLiteral with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createRegExpLiteral()))

      expect(reports[0].message).toBe('Unnecessary condition: always truthy (regexp)')
    })

    test('should report Literal true with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(true)))

      expect(reports[0].message).toBe('Unnecessary condition: always truthy')
    })

    test('should report Literal false with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(false)))

      expect(reports[0].message).toBe('Unnecessary condition: always falsy')
    })
  })

  describe('detecting unnecessary conditions in ternary expressions', () => {
    test('should report ternary with true literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('truthy')
    })

    test('should report ternary with false literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('falsy')
    })

    test('should not report ternary with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression({ type: 'Identifier', name: 'x' }))

      expect(reports.length).toBe(0)
    })

    test('should report ternary with Literal true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: always truthy')
    })

    test('should report ternary with Literal false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: always falsy')
    })

    test('should report ternary with Literal null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createLiteral(null)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report ternary with RegExpLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createRegExpLiteral()))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('regexp')
    })

    test('should report ternary with !true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', createBooleanLiteral(true))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('false')
    })

    test('should report ternary with !false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', createBooleanLiteral(false))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })

    test('should report ternary with true || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createLogicalExpression('||', createBooleanLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })

    test('should report ternary with false && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createLogicalExpression('&&', createBooleanLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('false')
    })

    test('should not report ternary with variable condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression({ type: 'Identifier', name: 'flag' }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with MemberExpression condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting unnecessary negations in if statements', () => {
    test('should report !true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createBooleanLiteral(true))))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('false')
    })

    test('should report !false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('!', createBooleanLiteral(false))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })

    test('should report !null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createLiteral(null))))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })

    test('should report !Literal(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createLiteral(true))))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: !true is always false')
    })

    test('should report !Literal(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createLiteral(false))))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: !false is always true')
    })

    test('should not report !variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('!', { type: 'Identifier', name: 'x' })),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report !CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createUnaryExpression('!', {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
          }),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report !BooleanLiteral(true) with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createBooleanLiteral(true))))

      expect(reports[0].message).toBe('Unnecessary condition: !true is always false')
    })

    test('should report !BooleanLiteral(false) with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('!', createBooleanLiteral(false))),
      )

      expect(reports[0].message).toBe('Unnecessary condition: !false is always true')
    })

    test('should report !Literal(null) with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createLiteral(null))))

      expect(reports[0].message).toBe('Unnecessary condition: !null is always true')
    })
  })

  describe('unary expressions with non-bang operators', () => {
    test('should not report +true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('+', createBooleanLiteral(true))))

      expect(reports.length).toBe(0)
    })

    test('should not report -false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('-', createBooleanLiteral(false))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report void true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('void', createBooleanLiteral(true))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('typeof', { type: 'Identifier', name: 'x' })),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report delete x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createUnaryExpression('delete', {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          }),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ~true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('~', createBooleanLiteral(true))))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting unnecessary logical expressions in if statements', () => {
    test('should report true || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })

    test('should report false && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('false')
    })

    test('should report Literal(true) || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true || x is always true')
    })

    test('should report Literal(false) && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false && x is always false')
    })

    test('should report BooleanLiteral(true) && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true && x is always x')
    })

    test('should report BooleanLiteral(false) || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false || x is always x')
    })

    test('should report Literal(true) && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true && x is always x')
    })

    test('should report Literal(false) || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false || x is always x')
    })

    test('should not report x && y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '&&',
            { type: 'Identifier', name: 'x' },
            {
              type: 'Identifier',
              name: 'y',
            },
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x || y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '||',
            { type: 'Identifier', name: 'x' },
            {
              type: 'Identifier',
              name: 'y',
            },
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report BooleanLiteral(true) || x with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports[0].message).toBe('Unnecessary condition: true || x is always true')
    })

    test('should report BooleanLiteral(false) && x with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports[0].message).toBe('Unnecessary condition: false && x is always false')
    })

    test('should report when right side is unnecessary but left is literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(true), createBooleanLiteral(false)),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report when right side is unnecessary in ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(true), createBooleanLiteral(false)),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when neither side is unnecessary in &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '&&',
            { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
            { type: 'Identifier', name: 'x' },
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when neither side is unnecessary in ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '||',
            { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
            { type: 'Identifier', name: 'x' },
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('logical expressions with null and other values', () => {
    test('should not report null || x since null is not BooleanLiteral/Literal true|false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createLiteral(null), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report null && x since null is not BooleanLiteral/Literal true|false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createLiteral(null), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Literal(null) || x in logical', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createLiteral(null), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report true && Literal(null) as unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(true), createLiteral(null)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true && x is always x')
    })

    test('should report true || Literal(null) as unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(true), createLiteral(null)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true || x is always true')
    })

    test('should report false && Literal(null) as unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(false), createLiteral(null)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false && x is always false')
    })

    test('should report false || Literal(null) as unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(false), createLiteral(null)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false || x is always x')
    })
  })

  describe('nested logical expressions', () => {
    test('should not report (true || x) && y since left is LogicalExpression not literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '&&',
            createLogicalExpression('||', createBooleanLiteral(true), {
              type: 'Identifier',
              name: 'x',
            }),
            { type: 'Identifier', name: 'y' },
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x || (false && y) since left is identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '||',
            { type: 'Identifier', name: 'x' },
            createLogicalExpression('&&', createBooleanLiteral(false), {
              type: 'Identifier',
              name: 'y',
            }),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report (false && x) || y since left is LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '||',
            createLogicalExpression('&&', createBooleanLiteral(false), {
              type: 'Identifier',
              name: 'x',
            }),
            { type: 'Identifier', name: 'y' },
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report true || (false && x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '||',
            createBooleanLiteral(true),
            createLogicalExpression('&&', createBooleanLiteral(false), {
              type: 'Identifier',
              name: 'x',
            }),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report false && (true || x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '&&',
            createBooleanLiteral(false),
            createLogicalExpression('||', createBooleanLiteral(true), {
              type: 'Identifier',
              name: 'x',
            }),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested: true || (false && (true || x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '||',
            createBooleanLiteral(true),
            createLogicalExpression(
              '&&',
              createBooleanLiteral(false),
              createLogicalExpression('||', createBooleanLiteral(true), {
                type: 'Identifier',
                name: 'x',
              }),
            ),
          ),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report x && (y || z)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression(
            '&&',
            { type: 'Identifier', name: 'x' },
            createLogicalExpression(
              '||',
              { type: 'Identifier', name: 'y' },
              {
                type: 'Identifier',
                name: 'z',
              },
            ),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('logical expressions in ternary', () => {
    test('should report ternary with true && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createLogicalExpression('&&', createBooleanLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true && x is always x')
    })

    test('should report ternary with false || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createLogicalExpression('||', createBooleanLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false || x is always x')
    })

    test('should report ternary with Literal(true) || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createLogicalExpression('||', createLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report ternary with Literal(false) && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createLogicalExpression('&&', createLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report ternary with x && y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createLogicalExpression(
            '&&',
            { type: 'Identifier', name: 'x' },
            {
              type: 'Identifier',
              name: 'y',
            },
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('negations in ternary expressions', () => {
    test('should report ternary with !Literal(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', createLiteral(true))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: !true is always false')
    })

    test('should report ternary with !Literal(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', createLiteral(false))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: !false is always true')
    })

    test('should report ternary with !Literal(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', createLiteral(null))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: !null is always true')
    })

    test('should not report ternary with !variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', { type: 'Identifier', name: 'x' })),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('location and reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true), 10, 5)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true), 3, 2))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(17)
    })

    test('should report correct location for ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createBooleanLiteral(true), 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true), 999, 42))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should include both message and loc in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true), 7, 3))

      expect(reports[0].message).toBeDefined()
      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
    })

    test('should report separate locations for multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true), 1, 0))
      visitor.IfStatement(createIfStatement(createBooleanLiteral(false), 5, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle node with loc but no start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))
      ;(node as Record<string, unknown>).loc = {}
      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle ConditionalExpression without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createConditionalExpression(createBooleanLiteral(true))
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple visitor calls', () => {
    test('should accumulate reports from multiple IfStatement calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))
      visitor.IfStatement(createIfStatement(createLiteral(null)))

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports from mixed visitor calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.ConditionalExpression(createConditionalExpression(createBooleanLiteral(false)))

      expect(reports.length).toBe(2)
    })

    test('should not cross-contaminate between calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      expect(reports.length).toBe(1)

      visitor.IfStatement(createIfStatement({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(1)
    })

    test('should handle many sequential calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating report and no-report calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))
      visitor.IfStatement(createIfStatement({ type: 'Identifier', name: 'x' }))
      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))
      visitor.IfStatement(createIfStatement({ type: 'Identifier', name: 'y' }))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle wrong node type in IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const wrongType = {
        type: 'ForStatement',
        test: createBooleanLiteral(true),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.IfStatement(wrongType)
      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type in ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const wrongType = {
        type: 'IfStatement',
        test: createBooleanLiteral(true),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ConditionalExpression(wrongType)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(null))

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        test: undefined,
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node without test property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.IfStatement({})).not.toThrow()
    })

    test('should handle boolean true as node', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.IfStatement(true)).not.toThrow()
    })

    test('should handle boolean false as node', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.IfStatement(false)).not.toThrow()
    })

    test('should handle array as node', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.IfStatement([])).not.toThrow()
    })

    test('should handle number node in ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.ConditionalExpression(42)).not.toThrow()
    })

    test('should handle string node in ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.ConditionalExpression('hello')).not.toThrow()
    })

    test('should handle undefined node in ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle node with type but no other props in IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement({ type: 'IfStatement' })
      expect(reports.length).toBe(0)
    })

    test('should handle node with type but no other props in ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression({ type: 'ConditionalExpression' })
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const nested = createUnaryExpression(
        '!',
        createUnaryExpression('!', createBooleanLiteral(true)),
      )
      visitor.IfStatement(createIfStatement(nested))

      expect(reports.length).toBe(0)
    })

    test('should handle LogicalExpression with non-&&/|| operator via null check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(
        createLogicalExpression('??', createBooleanLiteral(true), {
          type: 'Identifier',
          name: 'x',
        }),
      )
      visitor.IfStatement(node)

      // ?? is not && or || so no report even if left is unnecessary
      expect(reports.length).toBe(0)
    })
  })

  describe('createMockContext variations', () => {
    test('should work with custom file path', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with custom source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'if (false) {}')
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
    })

    test('should work with options', () => {
      const { context, reports } = createMockContext({ checkComplexConditions: true })
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
    })
  })

  describe('exports', () => {
    test('should have default export equal to named export', () => {
      expect(noUnnecessaryConditionDefault).toBe(noUnnecessaryConditionRule)
    })

    test('should have create method on default export', () => {
      expect(typeof noUnnecessaryConditionDefault.create).toBe('function')
    })

    test('should have meta property on default export', () => {
      expect(noUnnecessaryConditionDefault.meta).toBeDefined()
      expect(noUnnecessaryConditionDefault.meta.type).toBe('suggestion')
    })
  })

  describe('RegExpLiteral detection', () => {
    test('should report RegExpLiteral in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createRegExpLiteral()))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: always truthy (regexp)')
    })

    test('should report RegExpLiteral in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createRegExpLiteral()))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: always truthy (regexp)')
    })

    test('should report RegExpLiteral with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const regex = { type: 'RegExpLiteral', pattern: 'test', flags: 'gi' }
      visitor.IfStatement(createIfStatement(regex))

      expect(reports.length).toBe(1)
    })

    test('should not report Literal(null) || RegExpLiteral since null is not bool literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createLiteral(null), createRegExpLiteral()),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('BooleanLiteral edge cases', () => {
    test('should not report BooleanLiteral with string value "true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'BooleanLiteral', value: 'true' }))

      expect(reports.length).toBe(0)
    })

    test('should not report BooleanLiteral with number value 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'BooleanLiteral', value: 1 }))

      expect(reports.length).toBe(0)
    })

    test('should not report BooleanLiteral with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'BooleanLiteral' }))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'Literal' }))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(42)))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral('hello')))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(undefined)))

      expect(reports.length).toBe(0)
    })

    test('should report BooleanLiteral true and Literal true as same message', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const v1 = noUnnecessaryConditionRule.create(ctx1)
      const v2 = noUnnecessaryConditionRule.create(ctx2)

      v1.IfStatement(createIfStatement(createBooleanLiteral(true)))
      v2.IfStatement(createIfStatement(createLiteral(true)))

      expect(r1[0].message).toBe(r2[0].message)
    })
  })

  describe('IfStatement with various non-matching test nodes', () => {
    test('should not report with ArrowFunctionExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with FunctionExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with ObjectExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'ObjectExpression', properties: [] }))

      expect(reports.length).toBe(0)
    })

    test('should not report with ArrayExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'ArrayExpression', elements: [] }))

      expect(reports.length).toBe(0)
    })

    test('should not report with TemplateLiteral test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with AssignmentExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with NewExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement({
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        }),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('ConditionalExpression with non-matching test nodes', () => {
    test('should not report with number literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createLiteral(42)))

      expect(reports.length).toBe(0)
    })

    test('should not report with string literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createLiteral('hello')))

      expect(reports.length).toBe(0)
    })

    test('should not report with undefined literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createLiteral(undefined)))

      expect(reports.length).toBe(0)
    })

    test('should not report with function call test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'check' },
          arguments: [],
        }),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('negation with non-literal arguments', () => {
    test('should not report !MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createUnaryExpression('!', {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          }),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report !(x && y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createUnaryExpression(
            '!',
            createLogicalExpression(
              '&&',
              { type: 'Identifier', name: 'x' },
              {
                type: 'Identifier',
                name: 'y',
              },
            ),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report !ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('!', { type: 'ArrayExpression', elements: [] })),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report !Literal(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createLiteral(42))))

      expect(reports.length).toBe(0)
    })

    test('should not report !Literal("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createLiteral('hello'))))

      expect(reports.length).toBe(0)
    })
  })

  describe('logical expressions with both sides always truthy/falsy', () => {
    test('should report true && true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(true), createBooleanLiteral(true)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true && x is always x')
    })

    test('should report true && false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(true), createBooleanLiteral(false)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true && x is always x')
    })

    test('should report false || true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(false), createBooleanLiteral(true)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false || x is always x')
    })

    test('should report false || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(false), createBooleanLiteral(false)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false || x is always x')
    })

    test('should report true || false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(true), createBooleanLiteral(false)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: true || x is always true')
    })

    test('should report false && true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(false), createBooleanLiteral(true)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary condition: false && x is always false')
    })
  })

  describe('combined negation and logical', () => {
    test('should report !(true || x) in if', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createUnaryExpression(
            '!',
            createLogicalExpression('||', createBooleanLiteral(true), {
              type: 'Identifier',
              name: 'x',
            }),
          ),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report !BooleanLiteral(true) in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', createBooleanLiteral(true))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report !BooleanLiteral(false) in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createUnaryExpression('!', createBooleanLiteral(false))),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('LogicalExpression with Literal variants', () => {
    test('should report Literal(true) && x with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports[0].message).toBe('Unnecessary condition: true && x is always x')
    })

    test('should report Literal(false) || x with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports[0].message).toBe('Unnecessary condition: false || x is always x')
    })

    test('should report Literal(true) || x with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports[0].message).toBe('Unnecessary condition: true || x is always true')
    })

    test('should report Literal(false) && x with exact message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports[0].message).toBe('Unnecessary condition: false && x is always false')
    })
  })

  describe('visiting with empty and malformed nodes', () => {
    test('should handle IfStatement with node having only consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement({
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle ConditionalExpression with missing alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createBooleanLiteral(true),
        consequent: { type: 'Identifier', name: 'a' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))
      ;(node as Record<string, unknown>).extra = true
      ;(node as Record<string, unknown>).leadingComments = []
      ;(node as Record<string, unknown>).trailingComments = []

      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle test node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const test = createBooleanLiteral(true)
      ;(test as Record<string, unknown>).extra = { parenthesized: true }

      visitor.IfStatement(createIfStatement(test))
      expect(reports.length).toBe(1)
    })

    test('should handle null as IfStatement with no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(null)
      expect(reports.length).toBe(0)
    })

    test('should handle ConditionalExpression with null test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(null))
      expect(reports.length).toBe(0)
    })

    test('should handle ConditionalExpression with undefined test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('rule structure', () => {
    test('should be a valid RuleDefinition', () => {
      expect(noUnnecessaryConditionRule.meta).toBeDefined()
      expect(noUnnecessaryConditionRule.create).toBeDefined()
      expect(typeof noUnnecessaryConditionRule.create).toBe('function')
    })

    test('should have exactly two visitor methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toHaveLength(2)
      expect(keys).toContain('IfStatement')
      expect(keys).toContain('ConditionalExpression')
    })

    test('should have visitor methods that accept one argument', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(visitor.IfStatement.length).toBe(1)
      expect(visitor.ConditionalExpression.length).toBe(1)
    })
  })
})
