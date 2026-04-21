import { describe, test, expect, vi } from 'vitest'
import { noClassAssignRule } from '../../../../src/rules/patterns/no-class-assign.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

function createAssignmentExpression(right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name: 'MyClass',
    },
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassExpression(line = 1, column = 0): unknown {
  return {
    type: 'ClassExpression',
    id: null,
    superClass: null,
    body: {
      type: 'ClassBody',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifierExpression(name = 'MyVar'): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteralExpression(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createCallExpression(callee: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: callee,
    },
    arguments: [],
  }
}

describe('no-class-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noClassAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noClassAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noClassAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noClassAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention class in description', () => {
      expect(noClassAssignRule.meta.docs?.description.toLowerCase()).toContain('class')
    })

    test('should have empty schema array', () => {
      expect(noClassAssignRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noClassAssignRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('detecting class assignment violations', () => {
    test('should report assignment with ClassExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should report correct location for class assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 10, 5)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report appropriate error message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toBe('Reassigning class declaration is not allowed.')
    })
  })

  describe('not reporting non-class assignments', () => {
    test('should not report assignment with Identifier on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifierExpression('MyVar'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with Literal on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createLiteralExpression(42))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with CallExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createCallExpression('createClass'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with object literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const objectLiteral = {
        type: 'ObjectExpression',
        properties: [],
      }
      const node = createAssignmentExpression(objectLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle assignment without right property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with null right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(null)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createClassExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: null,
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createClassExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('type safety', () => {
    test('should not crash with malformed right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'InvalidType' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right side with undefined type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({})
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect ClassDeclaration vs ClassExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const classDeclaration = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
      }
      const node = createAssignmentExpression(classDeclaration)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('meta - extended properties', () => {
    test('should have exact description text', () => {
      expect(noClassAssignRule.meta.docs?.description).toBe(
        'Disallow reassigning class declarations.',
      )
    })

    test('should not have suggestion type', () => {
      expect(noClassAssignRule.meta.type).not.toBe('suggestion')
    })

    test('should not have layout type', () => {
      expect(noClassAssignRule.meta.type).not.toBe('layout')
    })

    test('should not have off severity', () => {
      expect(noClassAssignRule.meta.severity).not.toBe('off')
    })

    test('should not have warn severity', () => {
      expect(noClassAssignRule.meta.severity).not.toBe('warn')
    })

    test('meta.docs should be defined', () => {
      expect(noClassAssignRule.meta.docs).toBeDefined()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noClassAssignRule.meta.docs?.description).toBe('string')
      expect(noClassAssignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.recommended should be a boolean', () => {
      expect(typeof noClassAssignRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noClassAssignRule.meta.schema)).toBe(true)
    })

    test('meta should have create function', () => {
      expect(typeof noClassAssignRule.create).toBe('function')
    })

    test('meta should have meta property', () => {
      expect(noClassAssignRule.meta).toBeDefined()
      expect(typeof noClassAssignRule.meta).toBe('object')
    })

    test('meta.fixable should not be code', () => {
      expect(noClassAssignRule.meta.fixable).not.toBe('code')
    })

    test('meta.fixable should not be whitespace', () => {
      expect(noClassAssignRule.meta.fixable).not.toBe('whitespace')
    })

    test('meta should not be deprecated', () => {
      expect(noClassAssignRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noClassAssignRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not require type checking', () => {
      expect(noClassAssignRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('description should mention reassigning', () => {
      expect(noClassAssignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })

    test('description should mention disallow', () => {
      expect(noClassAssignRule.meta.docs?.description.toLowerCase()).toContain('disallow')
    })

    test('schema should have length 0', () => {
      expect(noClassAssignRule.meta.schema).toHaveLength(0)
    })

    test('meta.type should be one of valid types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noClassAssignRule.meta.type)
    })

    test('meta.severity should be one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noClassAssignRule.meta.severity)
    })

    test('meta should have exactly expected keys', () => {
      const keys = Object.keys(noClassAssignRule.meta)
      expect(keys).toContain('type')
      expect(keys).toContain('severity')
      expect(keys).toContain('docs')
      expect(keys).toContain('schema')
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor should only have AssignmentExpression key', () => {
      const { context } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toEqual(['AssignmentExpression'])
    })

    test('create should return a new visitor each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noClassAssignRule.create(context)
      const visitor2 = noClassAssignRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('AssignmentExpression should accept a node argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      expect(() =>
        visitor.AssignmentExpression(createAssignmentExpression(createClassExpression())),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('visitor created with different contexts should work independently', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()
      const visitor1 = noClassAssignRule.create(ctx1)
      const visitor2 = noClassAssignRule.create(ctx2)

      visitor1.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      visitor2.AssignmentExpression(createAssignmentExpression(createIdentifierExpression('x')))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('calling AssignmentExpression multiple times should report each time', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      }

      expect(reports.length).toBe(5)
    })

    test('AssignmentExpression should not be a getter', () => {
      const { context } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      const desc = Object.getOwnPropertyDescriptor(visitor, 'AssignmentExpression')
      expect(desc?.value).toBeDefined()
      expect(typeof desc?.get).toBe('undefined')
    })

    test('should work with multiple sequential create calls', () => {
      for (let i = 0; i < 3; i++) {
        const { context, reports } = createMockRuleContext()
        const visitor = noClassAssignRule.create(context)
        visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
        expect(reports.length).toBe(1)
      }
    })
  })

  describe('detecting class assignment - extended', () => {
    test('should report with ClassExpression that has id', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const namedClass = {
        type: 'ClassExpression',
        id: { type: 'Identifier', name: 'NamedClass' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }
      const node = createAssignmentExpression(namedClass)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ClassExpression that has superClass', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const subclass = {
        type: 'ClassExpression',
        id: null,
        superClass: { type: 'Identifier', name: 'BaseClass' },
        body: { type: 'ClassBody', body: [] },
      }
      const node = createAssignmentExpression(subclass)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ClassExpression that has body members', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const classWithMethods = {
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: {
          type: 'ClassBody',
          body: [
            { type: 'MethodDefinition', kind: 'constructor' },
            { type: 'MethodDefinition', kind: 'method' },
          ],
        },
      }
      const node = createAssignmentExpression(classWithMethods)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report at line 1, column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(1, 0))
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 999, 0)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report at large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 1, 500)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 3, 10)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should report exactly one violation per call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report with ClassExpression without optional fields', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const minimalClass = { type: 'ClassExpression' }
      const node = createAssignmentExpression(minimalClass)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with different assignment left-hand identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'SomeOtherClass' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with MemberExpression on left side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with DestructuringPattern on left side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ObjectPattern', properties: [] },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with compound assignment operator still triggering on =', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for deeply nested ClassExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ClassExpression',
        id: null,
        superClass: {
          type: 'ClassExpression',
          id: null,
          superClass: null,
          body: { type: 'ClassBody', body: [] },
        },
        body: { type: 'ClassBody', body: [] },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report even when ClassExpression body is empty', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ClassExpression that has decorators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        decorators: [{ type: 'Decorator', expression: { type: 'Identifier', name: 'sealed' } }],
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ClassExpression that is anonymous', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ClassExpression',
        id: null,
        body: { type: 'ClassBody', body: [] },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ClassExpression using expression superclass', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ClassExpression',
        id: { type: 'Identifier', name: 'Child' },
        superClass: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'mixin' },
          arguments: [],
        },
        body: { type: 'ClassBody', body: [] },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should produce consistent report message across calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('not reporting non-class assignments - extended', () => {
    test('should not report assignment with ArrayExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'ArrayExpression', elements: [] })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with FunctionExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with ArrowFunctionExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        expression: false,
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with BinaryExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with ConditionalExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with MemberExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with NewExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with UnaryExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with UpdateExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with LogicalExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with SequenceExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'SequenceExpression',
        expressions: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with YieldExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'YieldExpression',
        argument: null,
        delegate: false,
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with AwaitExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TemplateLiteral on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with SpreadElement on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'arr' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with AssignmentExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'inner' },
        right: { type: 'Literal', value: 1 },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TaggedTemplateExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with ThisExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'ThisExpression' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with VoidExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with string literal on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createLiteralExpression('hello'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with boolean literal on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createLiteralExpression(true))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with null literal on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createLiteralExpression(null))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with regex literal on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'Literal', value: /test/ })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with ClassDeclaration on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
        body: { type: 'ClassBody', body: [] },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with ChainExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ChainExpression',
        expression: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with ImportExpression on right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ImportExpression',
        source: { type: 'Literal', value: './module' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - extended', () => {
    test('should handle node as number 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node as number NaN', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node as boolean true', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node as boolean false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right.type as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right.type as boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right.type as object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: { name: 'ClassExpression' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right.type as array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: ['ClassExpression'] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression('ClassExpression')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right side as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(42)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right side as boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(true)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right side as array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression([1, 2, 3])
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with missing left property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with missing operator property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        extra: true,
        comments: [],
        range: [0, 20],
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle node with loc missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.start.line as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: '1', column: 0 }, end: { line: '1', column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc.start.column as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: '0' }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: null,
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: undefined,
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node where right is 0 (falsy)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(0)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where right is empty string (falsy)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression('')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where right is false (falsy)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(false)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with Symbol as type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: Symbol('AssignmentExpression'),
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right.type as Symbol', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: Symbol('ClassExpression') },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = Object.create({ type: 'AssignmentExpression' })
      node.operator = '='
      node.left = { type: 'Identifier', name: 'x' }
      node.right = createClassExpression()

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    })

    test('should handle Date object as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested object as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('type safety - extended', () => {
    test('should handle right with null type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: null })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right with empty string type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: '' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for ClassExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'classexpression' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for CLASSExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'CLASSExpression' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match ClassExpression with whitespace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: ' ClassExpression' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not match ClassExpression with trailing whitespace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'ClassExpression ' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right with undefined type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: undefined })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should only detect exact ClassExpression string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'ClassExpressions' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect ClassExpression_ prefix match', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'ClassExpressionExtra' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right with numeric type name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: '123' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle report callback being called with correct shape', () => {
      let capturedReport: ReportDescriptor | undefined
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          capturedReport = descriptor
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(capturedReport).toBeDefined()
      expect(capturedReport?.message).toBeTypeOf('string')
      expect(capturedReport?.loc).toBeDefined()
    })

    test('should handle context with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports.length).toBe(1)
    })
  })

  describe('location extraction', () => {
    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: null,
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: undefined,
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use provided location at line 5 column 3', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 5, 3)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should use provided location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 100, 50)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should extract end location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 2, 4)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('should handle loc with only start property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 7, column: 2 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle loc with missing start.line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { column: 5 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with missing start.column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 3 }, end: { line: 3, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with negative line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle loc with negative column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: -5 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with floating point numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1.5, column: 2.7 }, end: { line: 3.1, column: 4.2 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1.5)
      expect(reports[0].loc?.start.column).toBe(2.7)
    })
  })

  describe('exports', () => {
    test('should have default export', () => {
      const defaultExport = noClassAssignRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })

    test('named and default export should be the same object', () => {
      const defaultExport = noClassAssignRule
      expect(defaultExport).toBe(noClassAssignRule)
    })

    test('rule should be a valid RuleDefinition', () => {
      expect(noClassAssignRule).toHaveProperty('meta')
      expect(noClassAssignRule).toHaveProperty('create')
      expect(typeof noClassAssignRule.create).toBe('function')
    })

    test('rule meta should be readonly-like', () => {
      const meta = noClassAssignRule.meta
      expect(meta.type).toBe('problem')
      expect(meta.severity).toBe('error')
    })
  })

  describe('report message format', () => {
    test('message should be a complete sentence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      const msg = reports[0].message
      expect(msg.endsWith('.')).toBe(true)
      expect(msg[0]).toBe(msg[0].toUpperCase())
    })

    test('message should contain the word class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports[0].message.toLowerCase()).toContain('class')
    })

    test('message should indicate not allowed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports[0].message.toLowerCase()).toContain('not allowed')
    })

    test('message should mention reassigning', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports[0].message.toLowerCase()).toContain('reassign')
    })

    test('message should mention declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports[0].message.toLowerCase()).toContain('declaration')
    })

    test('message should match meta description theme', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      const metaDesc = noClassAssignRule.meta.docs?.description.toLowerCase()
      const reportMsg = reports[0].message.toLowerCase()
      expect(metaDesc).toContain('class')
      expect(reportMsg).toContain('class')
    })
  })

  describe('context interaction', () => {
    test('should call context.report exactly once for ClassExpression', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reportCount).toBe(1)
    })

    test('should not call context.report for non-class assignment', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createIdentifierExpression('x')))

      expect(reportCount).toBe(0)
    })

    test('should not call context.report for null node', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(null)

      expect(reportCount).toBe(0)
    })

    test('should not call context.report for undefined node', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(undefined)

      expect(reportCount).toBe(0)
    })

    test('should call context.report multiple times for multiple violations', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reportCount).toBe(3)
    })

    test('should work with context that has options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{ allow: 'something' }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports.length).toBe(1)
    })
  })

  describe('interleaved valid and invalid calls', () => {
    test('should correctly track reports across mixed calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      expect(reports.length).toBe(1)

      visitor.AssignmentExpression(createAssignmentExpression(createIdentifierExpression('x')))
      expect(reports.length).toBe(1)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      expect(reports.length).toBe(2)

      visitor.AssignmentExpression(createAssignmentExpression(createLiteralExpression(42)))
      expect(reports.length).toBe(2)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      expect(reports.length).toBe(3)
    })

    test('should track reports correctly with null nodes interspersed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(null)
      expect(reports.length).toBe(0)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      expect(reports.length).toBe(1)

      visitor.AssignmentExpression(undefined)
      expect(reports.length).toBe(1)
    })
  })

  describe('report loc structure', () => {
    test('report loc should have start and end objects', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression(), 4, 8))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression(), 6, 3))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression(), 2, 5))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report loc start line should equal node loc start line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      for (const line of [1, 5, 10, 50, 100]) {
        const reports: ReportDescriptor[] = []
        const ctx: RuleContext = {
          report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
          getFilePath: () => '/src/file.ts',
          getAST: () => null,
          getSource: () => '',
          getTokens: () => [],
          getComments: () => [],
          config: { options: [] },
          logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          workspaceRoot: '/src',
        } as unknown as RuleContext

        const v = noClassAssignRule.create(ctx)
        v.AssignmentExpression(createAssignmentExpression(createClassExpression(), line, 0))
        expect(reports[0].loc?.start.line).toBe(line)
      }
    })
  })

  describe('operator variants', () => {
    test('should report for += operator with ClassExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for -= operator with ClassExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '-=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for *= operator with ClassExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '*=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for /= operator with ClassExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '/=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('concurrent visitor usage', () => {
    test('multiple visitors should work independently', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()
      const { context: ctx3, reports: reports3 } = createMockRuleContext()

      const v1 = noClassAssignRule.create(ctx1)
      const v2 = noClassAssignRule.create(ctx2)
      const v3 = noClassAssignRule.create(ctx3)

      v1.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      v2.AssignmentExpression(createAssignmentExpression(createLiteralExpression(42)))
      v3.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
      expect(reports3.length).toBe(1)
    })

    test('visitor should not be affected by prior calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createLiteralExpression('safe')))
      expect(reports.length).toBe(0)

      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))
      expect(reports.length).toBe(1)

      visitor.AssignmentExpression(createAssignmentExpression(createLiteralExpression('safe2')))
      expect(reports.length).toBe(1)
    })
  })

  describe('meta consistency', () => {
    test('meta description and report message should be consistent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      const metaKeywords = noClassAssignRule.meta.docs?.description.toLowerCase().split(/\s+/)
      const reportKeywords = reports[0].message.toLowerCase().split(/\s+/)

      const commonKeywords = metaKeywords?.filter((k) => reportKeywords?.includes(k)) ?? []
      expect(commonKeywords.length).toBeGreaterThan(0)
    })

    test('meta type should match rule behavior (problem)', () => {
      expect(noClassAssignRule.meta.type).toBe('problem')

      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports.length).toBe(1)
    })

    test('meta severity should match report behavior (error)', () => {
      expect(noClassAssignRule.meta.severity).toBe('error')

      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression(createClassExpression()))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBeTruthy()
    })

    test('schema being empty means no configuration', () => {
      expect(noClassAssignRule.meta.schema).toEqual([])
      expect(noClassAssignRule.meta.schema).toHaveLength(0)
    })

    test('fixable being undefined means no auto-fix', () => {
      expect(noClassAssignRule.meta.fixable).toBeUndefined()
    })
  })

  describe('additional type variations on right side', () => {
    test('should not report for TypeCastExpression on right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'TypeCastExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TypeAnnotation' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ParenthesizedExpression on right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ParenthesizedExpression',
        expression: { type: 'Identifier', name: 'x' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when ClassExpression is wrapped in ParenthesizedExpression via right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'ParenthesizedExpression',
        expression: createClassExpression(),
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with circular reference in right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const circularRight: Record<string, unknown> = { type: 'ObjectExpression' }
      circularRight.self = circularRight
      const node = createAssignmentExpression(circularRight)

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle frozen object as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = Object.freeze({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle sealed object as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = Object.seal({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle Map object as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(new Map())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Set object as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(new Set())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle WeakRef as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(new WeakRef({}))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right having inherited ClassExpression type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const proto = { type: 'ClassExpression' }
      const right = Object.create(proto)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Int8Array as node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(new Int8Array(4))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with getter for type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        get type() {
          return 'AssignmentExpression'
        },
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: {
          get type() {
            return 'ClassExpression'
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node where type getter throws gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        get type() {
          throw new Error('type error')
        },
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createClassExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).toThrow('type error')
    })
  })
})
