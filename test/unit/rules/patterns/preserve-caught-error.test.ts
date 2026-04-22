import { describe, test, expect, vi } from 'vitest'
import { preserveCaughtErrorRule } from '../../../../src/rules/patterns/preserve-caught-error.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createCatchClause(param: unknown, body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CatchClause',
    param,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: name.length },
    },
  }
}

function createBlockStatement(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function createExpressionStatement(expression: unknown): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createReturnStatement(argument: unknown): unknown {
  return {
    type: 'ReturnStatement',
    argument,
  }
}

function createAssignmentExpression(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
  }
}

describe('preserve-caught-error rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(preserveCaughtErrorRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(preserveCaughtErrorRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(preserveCaughtErrorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preserveCaughtErrorRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention error in description', () => {
      expect(preserveCaughtErrorRule.meta.docs?.description.toLowerCase()).toContain('error')
    })

    test('should have empty schema', () => {
      expect(preserveCaughtErrorRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(preserveCaughtErrorRule.meta.fixable).toBeUndefined()
    })
  })

  describe('meta exhaustive', () => {
    test('meta.type should be a string', () => {
      expect(typeof preserveCaughtErrorRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof preserveCaughtErrorRule.meta.severity).toBe('string')
    })

    test('meta.type should not be suggestion', () => {
      expect(preserveCaughtErrorRule.meta.type).not.toBe('suggestion')
    })

    test('meta.type should not be layout', () => {
      expect(preserveCaughtErrorRule.meta.type).not.toBe('layout')
    })

    test('meta.severity should not be off', () => {
      expect(preserveCaughtErrorRule.meta.severity).not.toBe('off')
    })

    test('meta.severity should not be warn', () => {
      expect(preserveCaughtErrorRule.meta.severity).not.toBe('warn')
    })

    test('meta should have docs property', () => {
      expect(preserveCaughtErrorRule.meta.docs).toBeDefined()
    })

    test('meta.docs should be an object', () => {
      expect(typeof preserveCaughtErrorRule.meta.docs).toBe('object')
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof preserveCaughtErrorRule.meta.docs?.description).toBe('string')
      expect(preserveCaughtErrorRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.description should have exact expected text', () => {
      expect(preserveCaughtErrorRule.meta.docs?.description).toBe(
        'Require using caught error variables.',
      )
    })

    test('meta.docs.description should mention caught', () => {
      expect(preserveCaughtErrorRule.meta.docs?.description.toLowerCase()).toContain('caught')
    })

    test('meta.docs should not have url property', () => {
      expect(preserveCaughtErrorRule.meta.docs?.url).toBeUndefined()
    })

    test('meta should not have deprecated flag', () => {
      expect(preserveCaughtErrorRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy array', () => {
      expect(preserveCaughtErrorRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(preserveCaughtErrorRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(preserveCaughtErrorRule.meta.schema)).toBe(true)
    })

    test('meta.fixable should not be code', () => {
      expect(preserveCaughtErrorRule.meta.fixable).not.toBe('code')
    })

    test('meta.fixable should not be whitespace', () => {
      expect(preserveCaughtErrorRule.meta.fixable).not.toBe('whitespace')
    })

    test('meta should have all required top-level keys', () => {
      expect(preserveCaughtErrorRule.meta).toHaveProperty('type')
      expect(preserveCaughtErrorRule.meta).toHaveProperty('severity')
      expect(preserveCaughtErrorRule.meta).toHaveProperty('docs')
      expect(preserveCaughtErrorRule.meta).toHaveProperty('schema')
    })

    test('meta.docs should have expected keys', () => {
      expect(preserveCaughtErrorRule.meta.docs).toHaveProperty('description')
      expect(preserveCaughtErrorRule.meta.docs).toHaveProperty('category')
      expect(preserveCaughtErrorRule.meta.docs).toHaveProperty('recommended')
    })
  })

  describe('create', () => {
    test('should return visitor object with CatchClause method', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).toHaveProperty('CatchClause')
      expect(typeof visitor.CatchClause).toBe('function')
    })
  })

  describe('visitor structure', () => {
    test('create should return a non-null object', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })

    test('visitor should have CatchClause as own property', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).toHaveProperty('CatchClause')
      expect(Object.prototype.hasOwnProperty.call(visitor, 'CatchClause')).toBe(true)
    })

    test('CatchClause should not be null', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor.CatchClause).not.toBeNull()
    })

    test('CatchClause should not be undefined', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor.CatchClause).not.toBeUndefined()
    })

    test('visitor should not have FunctionDeclaration handler', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).not.toHaveProperty('FunctionDeclaration')
    })

    test('visitor should not have VariableDeclaration handler', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).not.toHaveProperty('VariableDeclaration')
    })

    test('visitor should not have ExpressionStatement handler', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('visitor should not have IfStatement handler', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).not.toHaveProperty('IfStatement')
    })

    test('CatchClause should return undefined for valid input', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      const result = visitor.CatchClause(createCatchClause(param, body))

      expect(result).toBeUndefined()
    })

    test('CatchClause should return undefined for unused error', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const result = visitor.CatchClause(createCatchClause(param, body))

      expect(result).toBeUndefined()
    })

    test('calling create multiple times should return new visitor objects', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor1 = preserveCaughtErrorRule.create(context)
      const visitor2 = preserveCaughtErrorRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('CatchClause function should have length 1', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor.CatchClause).toHaveLength(1)
    })

    test('CatchClause can be destructured from visitor', () => {
      const { context } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const { CatchClause } = preserveCaughtErrorRule.create(context)

      expect(typeof CatchClause).toBe('function')
    })

    test('create should accept different context instances', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'try { } catch (e) { }', filePath: '/src/a.ts' })
      const { context: ctx2 } = createMockRuleContext({ source: 'try { } catch (e) { }', filePath: '/src/b.ts' })

      expect(() => preserveCaughtErrorRule.create(ctx1)).not.toThrow()
      expect(() => preserveCaughtErrorRule.create(ctx2)).not.toThrow()
    })

    test('CatchClause should be callable multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])

      visitor.CatchClause(createCatchClause(param, body, 1, 0))
      visitor.CatchClause(createCatchClause(param, body, 2, 0))
      visitor.CatchClause(createCatchClause(param, body, 3, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('detecting unused caught errors', () => {
    test('should report catch clause with unused error identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('error')
      expect(reports[0].message).toContain('not used')
    })

    test('should report catch clause with unused error variable named e', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('e')
    })

    test('should report catch clause with unused error variable named err', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('err')
    })

    test('should report catch clause with unused error variable in body with different identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('otherVar'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 42, 10))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('detecting unused errors - more variable names', () => {
    test('should report unused error named ex', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('ex')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ex')
    })

    test('should report unused error named exception', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('exception')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('exception')
    })

    test('should report unused error named catchErr', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('catchErr')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('catchErr')
    })

    test('should report unused error named exc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('exc')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('exc')
    })

    test('should report unused error named caught', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('caught')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('caught')
    })

    test('should report unused error with very long name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const longName = 'a'.repeat(100)
      const param = createIdentifier(longName)
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should report unused error with single character x', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('x')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report unused error named ERROR (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('ERROR')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ERROR')
    })

    test('should report unused error named MyCustomError', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('MyCustomError')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('MyCustomError')
    })

    test('should report unused error named _err', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('_err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_err')
    })

    test('should report unused error named catchBlock', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('catchBlock')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('catchBlock')
    })

    test('should report unused error named __', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('__')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__')
    })
  })

  describe('isIdentifierUsed - positive detection', () => {
    test('should not report when error used in nested call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const innerCall = createCallExpression(createIdentifier('String'), [
        createIdentifier('error'),
      ])
      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('console.log'), [innerCall]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used as left side of assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('error'), createIdentifier('newValue')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used as callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(createCallExpression(createIdentifier('error'), [])),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used as second argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('fn'), [
            createIdentifier('other'),
            createIdentifier('error'),
          ]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used deeply in nested calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const deepArg = createCallExpression(createIdentifier('wrap'), [
        createCallExpression(createIdentifier('fmt'), [createIdentifier('error')]),
      ])
      const body = createBlockStatement([
        createExpressionStatement(createCallExpression(createIdentifier('log'), [deepArg])),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used in multiple statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(createIdentifier('other')),
        createExpressionStatement(createIdentifier('error')),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used in expression then return', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(createIdentifier('error')),
        createReturnStatement(createIdentifier('error')),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error found through right side of assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('saved'), createIdentifier('error')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error is argument of a member call', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const callee = createMemberExpression(createIdentifier('console'), createIdentifier('log'))
      const body = createBlockStatement([
        createExpressionStatement(createCallExpression(callee, [createIdentifier('err')])),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error is used in argument of nested call', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e')
      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('handler'), [
            createCallExpression(createIdentifier('process'), [createIdentifier('e')]),
          ]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error found through left then right chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const innerAssign = createAssignmentExpression(
        createIdentifier('x'),
        createIdentifier('error'),
      )
      const body = createBlockStatement([
        createExpressionStatement(createAssignmentExpression(createIdentifier('a'), innerAssign)),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error in statement after unrelated statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(createCallExpression(createIdentifier('doStuff'), [])),
        createExpressionStatement(
          createCallExpression(createIdentifier('log'), [createIdentifier('error')]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used in return of expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createReturnStatement(
          createCallExpression(createIdentifier('wrap'), [createIdentifier('error')]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report when error used in expression of expression statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('err'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })
  })

  describe('isIdentifierUsed - traversal properties', () => {
    test('should find error through expression property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through argument property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createReturnStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through left property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('error'), createIdentifier('x')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('x'), createIdentifier('error')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(createCallExpression(createIdentifier('error'), [])),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('fn'), [createIdentifier('error')]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through body array of BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through expression->argument chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const returnStmt = createReturnStatement(createIdentifier('err'))
      const body = createBlockStatement([returnStmt])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through callee->arguments chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const innerCall = createCallExpression(createIdentifier('err'), [])
      const outerCall = createCallExpression(createIdentifier('log'), [innerCall])
      const body = createBlockStatement([createExpressionStatement(outerCall)])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error through left->right chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const innerAssign = createAssignmentExpression(createIdentifier('err'), createIdentifier('x'))
      const outerAssign = createAssignmentExpression(createIdentifier('a'), innerAssign)
      const body = createBlockStatement([createExpressionStatement(outerAssign)])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error deeply nested in body array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([
        createExpressionStatement(createIdentifier('a')),
        createExpressionStatement(createIdentifier('b')),
        createExpressionStatement(createIdentifier('c')),
        createExpressionStatement(createIdentifier('err')),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should find error in three levels of expression nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e')
      const returnInner = createReturnStatement(createIdentifier('e'))
      const outerExpr = {
        type: 'ExpressionStatement',
        expression: returnInner,
      }
      const body = createBlockStatement([outerExpr])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not find error when traversal property value is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = {
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: null }],
      }
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should not find error when traversal property value is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = {
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement' }],
      }
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })
  })

  describe('isIdentifierUsed - negative detection (known limitations)', () => {
    test('should report when error used only as object of member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createMemberExpression(createIdentifier('error'), createIdentifier('message')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report when error used only as property of member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createMemberExpression(createIdentifier('obj'), createIdentifier('error')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report when error is in conditional expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('error'),
          consequent: createBlockStatement([]),
        },
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report when error is in array expression elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement({
          type: 'ArrayExpression',
          elements: [createIdentifier('error')],
        }),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report when error is in object expression value', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement({
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: createIdentifier('err'),
              value: createIdentifier('error'),
            },
          ],
        }),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report when error used in template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement({
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [createIdentifier('error')],
        }),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report when error used in sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement({
          type: 'SequenceExpression',
          expressions: [createIdentifier('x'), createIdentifier('error')],
        }),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report when error used in conditional expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement({
          type: 'ConditionalExpression',
          test: createIdentifier('cond'),
          consequent: createIdentifier('error'),
          alternate: createIdentifier('other'),
        }),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid catch clauses', () => {
    test('should not report catch clause with used error in expression statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report catch clause with used error in call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('console.log'), [createIdentifier('error')]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report catch clause with used error in return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createReturnStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report catch clause with used error in assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('savedError'), createIdentifier('error')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should report catch clause with used error in member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createMemberExpression(createIdentifier('error'), createIdentifier('message')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should not report catch clause without param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        body,
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention not used in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message.toLowerCase()).toContain('not used')
    })

    test('should mention error variable name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('myError')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).toContain('myError')
    })

    test('should suggest catch without param syntax in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).toContain('catch { }')
    })
  })

  describe('message format exhaustive', () => {
    test('message should be a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(typeof reports[0].message).toBe('string')
    })

    test('message should be non-empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should wrap variable name in single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('myErr')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).toContain("'myErr'")
    })

    test('message for name e should contain single-quoted e', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).toContain("'e'")
    })

    test('message should mention caught', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message.toLowerCase()).toContain('caught')
    })

    test('message should suggest using the error', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message.toLowerCase()).toContain('use')
    })

    test('message for long variable name should include full name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const longName = 'aVeryLongCaughtErrorVariableNameThatShouldStillAppear'
      const param = createIdentifier(longName)
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).toContain(longName)
    })

    test('messages should be identical for same inputs', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'try { } catch (e) { }' })

      const visitor1 = preserveCaughtErrorRule.create(ctx1)
      const visitor2 = preserveCaughtErrorRule.create(ctx2)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor1.CatchClause(createCatchClause(param, body))
      visitor2.CatchClause(createCatchClause(param, body))

      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('message should not contain undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).not.toContain('undefined')
    })

    test('message should not contain null', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).not.toContain('null')
    })
  })

  describe('location', () => {
    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 9999, 5))

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end values', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 10, 5))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location from multiple calls independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 5, 0))
      visitor.CatchClause(createCatchClause(param, body, 15, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(15)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('loc start.line should be a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('loc start.column should be a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('loc end.line should be a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('loc end.column should be a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        param,
        body,
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with multi-line span', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        param,
        body,
        loc: {
          start: { line: 5, column: 2 },
          end: { line: 8, column: 1 },
        },
      }
      visitor.CatchClause(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })
  })

  describe('multiple reports', () => {
    test('two unused catches should produce two reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 1, 0))
      visitor.CatchClause(createCatchClause(param, body, 2, 0))

      expect(reports.length).toBe(2)
    })

    test('first unused and second used should produce one report', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const unusedBody = createBlockStatement([])
      const usedBody = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, unusedBody))
      visitor.CatchClause(createCatchClause(param, usedBody))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('error')
    })

    test('first used and second unused should produce one report', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const usedBody = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      const unusedBody = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, usedBody))
      visitor.CatchClause(createCatchClause(param, unusedBody))

      expect(reports.length).toBe(1)
    })

    test('both used should produce zero reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const usedBody = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, usedBody))
      visitor.CatchClause(createCatchClause(param, usedBody))

      expect(reports.length).toBe(0)
    })

    test('three unused catches should produce three reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 1, 0))
      visitor.CatchClause(createCatchClause(param, body, 2, 0))
      visitor.CatchClause(createCatchClause(param, body, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('same visitor processes multiple nodes independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param1 = createIdentifier('e1')
      const param2 = createIdentifier('e2')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param1, body))
      visitor.CatchClause(createCatchClause(param2, body))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('e1')
      expect(reports[1].message).toContain('e2')
    })

    test('reports from different contexts do not interfere', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'try { } catch (e) { }' })

      const visitor1 = preserveCaughtErrorRule.create(ctx1)
      const visitor2 = preserveCaughtErrorRule.create(ctx2)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor1.CatchClause(createCatchClause(param, body))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('calling CatchClause many times accumulates reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e')
      const body = createBlockStatement([])
      for (let i = 0; i < 10; i++) {
        visitor.CatchClause(createCatchClause(param, body, i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('context variations', () => {
    test('should work with empty string filePath', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }', filePath: '' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspaceRoot', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { foo() } catch (e) { log(e) }', filePath: '/src/file.ts' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should work with no options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should work with extra config properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true, level: 'max' }], source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should work with minimal valid context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '',
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
        workspaceRoot: '',
      } as unknown as RuleContext

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('e')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should work with context with parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const debugFn = vi.fn()
      const infoFn = vi.fn()
      const warnFn = vi.fn()
      const errorFn = vi.fn()
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: debugFn,
          info: infoFn,
          warn: warnFn,
          error: errorFn,
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(debugFn).not.toHaveBeenCalled()
      expect(infoFn).not.toHaveBeenCalled()
      expect(warnFn).not.toHaveBeenCalled()
      expect(errorFn).not.toHaveBeenCalled()
    })

    test('should call context.report exactly once for unused error', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reportCount).toBe(1)
    })

    test('should not call context.report for used error', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reportCount).toBe(0)
    })
  })

  describe('exports', () => {
    test('named export should exist', () => {
      expect(preserveCaughtErrorRule).toBeDefined()
    })

    test('default export should be accessible', async () => {
      const mod = await import('../../../../src/rules/patterns/preserve-caught-error.js')
      expect(mod.default).toBeDefined()
    })

    test('default export should equal named export', async () => {
      const mod = await import('../../../../src/rules/patterns/preserve-caught-error.js')
      expect(mod.default).toBe(mod.preserveCaughtErrorRule)
    })

    test('rule should have meta property', () => {
      expect(preserveCaughtErrorRule).toHaveProperty('meta')
    })

    test('rule should have create property', () => {
      expect(preserveCaughtErrorRule).toHaveProperty('create')
    })

    test('rule should have exactly meta and create properties', () => {
      const keys = Object.keys(preserveCaughtErrorRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('rule.create should be a function', () => {
      expect(typeof preserveCaughtErrorRule.create).toBe('function')
    })

    test('rule should be a non-null object', () => {
      expect(preserveCaughtErrorRule).not.toBeNull()
      expect(typeof preserveCaughtErrorRule).toBe('object')
    })
  })

  describe('report descriptor', () => {
    test('report descriptor should have message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor should have loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report descriptor loc should have start', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report descriptor loc should have end', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report descriptor loc.start should have line', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('report descriptor loc.start should have column', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report descriptor loc.end should have line', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('report descriptor loc.end should have column', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report descriptor loc values should all be numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 5, 3))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report descriptor should not have extra properties beyond message and loc', () => {
      const captured: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          captured.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
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

      const visitor = preserveCaughtErrorRule.create(context)
      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(captured[0].message).toBeDefined()
      expect(captured[0].loc).toBeDefined()
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(() => visitor.CatchClause(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(() => visitor.CatchClause(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      expect(() => visitor.CatchClause('string')).not.toThrow()
      expect(() => visitor.CatchClause(123)).not.toThrow()
      expect(() => visitor.CatchClause(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        param: createIdentifier('error'),
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without param property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: createIdentifier('error'),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = createCatchClause(param, body)
      delete (node as Record<string, unknown>).loc
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle catch clause with non-Identifier param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'Literal', value: 'error' }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with null param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: null,
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with undefined param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with null body', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: createIdentifier('error'),
        body: null,
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with undefined body', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: createIdentifier('error'),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle catch clause with incorrect type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'NotCatchClause',
        param: createIdentifier('error'),
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle param without name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'Identifier' }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle param with non-string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'Identifier', name: 123 as unknown as string }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases - additional', () => {
    test('should handle catch clause with empty body array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle catch clause with body containing only unrelated call', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(createCallExpression(createIdentifier('doSomething'), [])),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle catch clause with body containing multiple unrelated statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(createCallExpression(createIdentifier('a'), [])),
        createExpressionStatement(createCallExpression(createIdentifier('b'), [])),
        createExpressionStatement(createCallExpression(createIdentifier('c'), [])),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle catch clause with body as non-BlockStatement (reports since error not found)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createIdentifier('notABlock')
      const node = {
        type: 'CatchClause',
        param,
        body,
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body with null elements in array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        null,
        undefined,
        createExpressionStatement(createIdentifier('error')),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        param,
        body,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
        extra: 'data',
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
    })

    test('should handle param with empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested body structure', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const innerBody = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('log'), [createIdentifier('err')]),
        ),
      ])
      const outerBody = createBlockStatement([innerBody])
      visitor.CatchClause(createCatchClause(param, outerBody))

      expect(reports.length).toBe(0)
    })

    test('should handle param with ObjectPattern type (destructuring)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'ObjectPattern', properties: [] }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle param with ArrayPattern type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'ArrayPattern', elements: [] }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle param with AssignmentPattern type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = {
        type: 'AssignmentPattern',
        left: createIdentifier('e'),
        right: createIdentifier('def'),
      }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle body with very many statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const statements = Array.from({ length: 50 }, (_, i) =>
        createExpressionStatement(createIdentifier(`var${i}`)),
      )
      const body = createBlockStatement(statements)
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle body with very many statements where last uses error', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const statements = Array.from({ length: 49 }, (_, i) =>
        createExpressionStatement(createIdentifier(`var${i}`)),
      )
      statements.push(createExpressionStatement(createIdentifier('error')))
      const body = createBlockStatement(statements)
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with numeric-like name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e2')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('e2')
    })
  })

  describe('edge cases - isIdentifierUsed edge cases', () => {
    test('should handle body that is a plain object without body array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = { type: 'ExpressionStatement', expression: createIdentifier('error') }
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle body as an empty plain object', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = {}
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle param with name matching JavaScript keyword', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('undefined')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should handle param with name that is a different case variant', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('Error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should detect usage with exact case match only', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('myError')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('myerror'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle body where arguments property is not an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: 'not-an-array',
        },
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle body where body property is not an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = { type: 'BlockStatement', body: 'not-an-array' }
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc having non-numeric values', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        param,
        body,
        loc: {
          start: { line: 'one', column: 'zero' },
          end: { line: 'two', column: 'five' },
        },
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should handle node with partial loc (start only)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        param,
        body,
        loc: {
          start: { line: 5, column: 3 },
        },
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should handle node with partial loc (no start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try { } catch (e) { }' })
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        param,
        body,
        loc: {
          end: { line: 5, column: 3 },
        },
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })
})
