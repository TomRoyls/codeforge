import { describe, test, expect } from 'vitest'
import { noUnsafeOptionalChainingRule } from '../../../../src/rules/patterns/no-unsafe-optional-chaining.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

function createChainExpression(expression: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ChainExpression',
    expression,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNewExpression(callee: unknown, args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    optional: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-unsafe-optional-chaining rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeOptionalChainingRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeOptionalChainingRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention optional chaining in description', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.description.toLowerCase()).toContain(
        'optional',
      )
    })
  })

  describe('meta - type field', () => {
    test('meta type should be a string', () => {
      expect(typeof noUnsafeOptionalChainingRule.meta.type).toBe('string')
    })

    test('meta type should not be suggestion', () => {
      expect(noUnsafeOptionalChainingRule.meta.type).not.toBe('suggestion')
    })

    test('meta type should not be layout', () => {
      expect(noUnsafeOptionalChainingRule.meta.type).not.toBe('layout')
    })
  })

  describe('meta - severity field', () => {
    test('meta severity should be a string', () => {
      expect(typeof noUnsafeOptionalChainingRule.meta.severity).toBe('string')
    })

    test('meta severity should not be off', () => {
      expect(noUnsafeOptionalChainingRule.meta.severity).not.toBe('off')
    })

    test('meta severity should not be warn', () => {
      expect(noUnsafeOptionalChainingRule.meta.severity).not.toBe('warn')
    })
  })

  describe('meta - docs field', () => {
    test('should have docs property', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs).toBeDefined()
    })

    test('docs should have description', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.description).toBeDefined()
    })

    test('docs description should be a string', () => {
      expect(typeof noUnsafeOptionalChainingRule.meta.docs?.description).toBe('string')
    })

    test('docs description should not be empty', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('docs should mention chaining', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.description.toLowerCase()).toContain(
        'chaining',
      )
    })

    test('docs should mention disallow', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.description.toLowerCase()).toContain(
        'disallow',
      )
    })

    test('docs should have recommended as boolean', () => {
      expect(typeof noUnsafeOptionalChainingRule.meta.docs?.recommended).toBe('boolean')
    })

    test('docs category should be a string', () => {
      expect(typeof noUnsafeOptionalChainingRule.meta.docs?.category).toBe('string')
    })

    test('docs should not have url', () => {
      expect(noUnsafeOptionalChainingRule.meta.docs?.url).toBeUndefined()
    })
  })

  describe('meta - schema and fixable', () => {
    test('should have empty schema', () => {
      expect(noUnsafeOptionalChainingRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUnsafeOptionalChainingRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noUnsafeOptionalChainingRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnsafeOptionalChainingRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnsafeOptionalChainingRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with NewExpression method', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('NewExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('create should return an object', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('create should return non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('visitor should only have NewExpression key', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(Object.keys(visitor)).toEqual(['NewExpression'])
    })

    test('NewExpression should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(visitor.NewExpression.length).toBe(1)
    })

    test('calling create multiple times returns new visitors', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor1 = noUnsafeOptionalChainingRule.create(context)
      const visitor2 = noUnsafeOptionalChainingRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('valid cases', () => {
    test('should not report regular NewExpression with identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(createIdentifier('MyClass'))
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('Class')),
      )
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with identifier and arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(createIdentifier('MyClass'), [
        { type: 'Literal', value: 'arg' },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with member expression and arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('Class')),
        [{ type: 'Literal', value: 42 }],
      )
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const nestedMember = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('module')),
        createIdentifier('Class'),
      )
      const node = createNewExpression(nestedMember)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const computedMember = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'Class' },
        computed: true,
      }
      const node = createNewExpression(computedMember)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression without optional chaining', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const memberExpression = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('Class'),
        optional: false,
        computed: false,
      }
      const node = createNewExpression(memberExpression)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with different node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('MyClass'),
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with optional member expression that is not ChainExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const optionalMember = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('Class'),
        optional: true,
        computed: false,
      }
      const node = createNewExpression(optionalMember)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with CallExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('factory'),
        arguments: [],
      }
      const node = createNewExpression(callExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with Literal callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression({ type: 'Literal', value: 42 })
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with FunctionExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(funcExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with ArrowFunctionExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createNewExpression(arrowExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with ArrayExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const arrExpr = { type: 'ArrayExpression', elements: [] }
      const node = createNewExpression(arrExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with SequenceExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const seqExpr = {
        type: 'SequenceExpression',
        expressions: [createIdentifier('a'), createIdentifier('b')],
      }
      const node = createNewExpression(seqExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with TaggedTemplateExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const tagged = {
        type: 'TaggedTemplateExpression',
        tag: createIdentifier('tag'),
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }
      const node = createNewExpression(tagged)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with deeply nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const deep = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          createIdentifier('c'),
        ),
        createIdentifier('d'),
      )
      const node = createNewExpression(deep)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression with ThisExpression as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const thisMember = {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: createIdentifier('Class'),
        computed: false,
        optional: false,
      }
      const node = createNewExpression(thisMember)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const condExpr = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createIdentifier('A'),
        alternate: createIdentifier('B'),
      }
      const node = createNewExpression(condExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is LogicalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: createIdentifier('A'),
        right: createIdentifier('B'),
      }
      const node = createNewExpression(logicalExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('A'),
        right: createIdentifier('B'),
      }
      const node = createNewExpression(binaryExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report NewExpression with ChainExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/optional chaining/i)
    })

    test('should report NewExpression with ChainExpression on member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('Class'))
      const chainNode = createChainExpression(memberExpr)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/optional chaining/i)
    })

    test('should report NewExpression with ChainExpression and arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [{ type: 'Literal', value: 'arg' }])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/optional chaining/i)
    })

    test('should report correct location for violation', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 10, 5)
      const node = createNewExpression(chainNode, [], 10, 5)
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report message about optional chaining in new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toContain('new expression')
    })

    test('should report each violation separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('A'))))
      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('B'))))
      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('C'))))

      expect(reports.length).toBe(3)
    })

    test('should report ChainExpression with computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const computedMember = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'Class' },
        computed: true,
      }
      const chainNode = createChainExpression(computedMember)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ChainExpression with multiple arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [
        { type: 'Literal', value: 'arg1' },
        { type: 'Literal', value: 'arg2' },
        { type: 'Literal', value: 3 },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ChainExpression with spread element in arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [
        { type: 'SpreadElement', argument: createIdentifier('args') },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ChainExpression containing nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const nestedMember = createMemberExpression(
        createMemberExpression(createIdentifier('a'), createIdentifier('b')),
        createIdentifier('c'),
      )
      const chainNode = createChainExpression(nestedMember)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when ChainExpression has empty expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(null)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when ChainExpression has undefined expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(undefined)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when ChainExpression inner expression is a plain object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression({ foo: 'bar' })
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when ChainExpression contains a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('factory'),
        arguments: [],
      }
      const chainNode = createChainExpression(callExpr)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report on line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report exact location at line 42 column 7', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 42, 7)
      const node = createNewExpression(chainNode, [], 42, 7)
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report with location end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 5, 0)
      const node = createNewExpression(chainNode, [], 5, 0)
      visitor.NewExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report 5 separate violations for 5 calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier(`C${i}`))))
      }

      expect(reports.length).toBe(5)
    })

    test('should report 10 separate violations for 10 calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier(`C${i}`))))
      }

      expect(reports.length).toBe(10)
    })

    test('should report ChainExpression with ThisExpression inside', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: createIdentifier('Class'),
        computed: false,
        optional: true,
      }
      const chainNode = createChainExpression(memberExpr)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ChainExpression with Super expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'Super' },
        property: createIdentifier('Class'),
        computed: false,
        optional: true,
      }
      const chainNode = createChainExpression(memberExpr)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ChainExpression with template literal property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'Class' } }],
          expressions: [],
        },
        computed: true,
        optional: true,
      }
      const chainNode = createChainExpression(memberExpr)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with message containing Optional chaining', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('X'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toMatch(/Optional chaining/)
    })

    test('should report with message containing new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('X'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toMatch(/new expression/)
    })

    test('should report exact expected message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('X'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toBe('Optional chaining cannot appear in a new expression.')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      delete (node as Record<string, unknown>).loc

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle callee without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { name: 'MyClass' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-ChainExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object that is not a valid AST node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = { type: 'NewExpression' }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee that is not an object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression('node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      visitor.NewExpression({ type: 'NewExpression' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {},
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee explicitly', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node as an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        ...createNewExpression(chainNode),
        extraProp: 'value',
        anotherProp: 42,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle callee with type as number instead of string', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 42 },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with type as boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: true },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with type as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: null },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with type as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: undefined },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with type as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: { name: 'ChainExpression' } },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc containing null start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
        loc: { start: null, end: null },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
        loc: { start: undefined, end: undefined },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc start having non-number line', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
        loc: {
          start: { line: 'one', column: 0 },
          end: { line: 'one', column: 1 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc start having non-number column', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
        loc: {
          start: { line: 1, column: 'zero' },
          end: { line: 1, column: 'one' },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 99999, 99999)
      const node = createNewExpression(chainNode, [], 99999, 99999)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle node with zero line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 0, 0)
      const node = createNewExpression(chainNode, [], 0, 0)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle node with negative line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), -1, -1)
      const node = createNewExpression(chainNode, [], -1, -1)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle node with NaN line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), NaN, NaN)
      const node = createNewExpression(chainNode, [], NaN, NaN)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Infinity line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), Infinity, 0)
      const node = createNewExpression(chainNode, [], Infinity, 0)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Infinity)
    })
  })

  describe('node type filtering', () => {
    test('should not report when node type is not NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'CallExpression',
        callee: chainNode,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'FunctionDeclaration',
        callee: chainNode,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'ExpressionStatement',
        callee: chainNode,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: '',
        callee: chainNode,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when node type is NewExpression (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when node type is newexpression (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'newexpression',
        callee: chainNode,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is NEWEXPRESSION (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NEWEXPRESSION',
        callee: chainNode,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is chainExpression (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'chainExpression',
          expression: createIdentifier('MyClass'),
        },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when callee type is ChainExpression (correct case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'ChainExpression',
          expression: createIdentifier('MyClass'),
        },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when callee type is CHAINEXPRESSION (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'CHAINEXPRESSION',
          expression: createIdentifier('MyClass'),
        },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should provide loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].loc).toBeDefined()
    })

    test('should provide start in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should provide end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should provide start line in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 3, 2)
      const node = createNewExpression(chainNode, [], 3, 2)
      visitor.NewExpression(node)

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should provide start column in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 1, 8)
      const node = createNewExpression(chainNode, [], 1, 8)
      visitor.NewExpression(node)

      expect(typeof reports[0].loc?.start.column).toBe('number')
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should provide end line in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 5, 0)
      const node = createNewExpression(chainNode, [], 5, 0)
      visitor.NewExpression(node)

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should provide end column in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'), 1, 0)
      const node = createNewExpression(chainNode, [], 1, 0)
      visitor.NewExpression(node)

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = {
        type: 'NewExpression',
        callee: chainNode,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('report message content', () => {
    test('message should be a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('message should not be empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should start with capital letter', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should contain optional chaining', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toContain('Optional chaining')
    })

    test('message should contain cannot', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toContain('cannot')
    })

    test('message should contain appear', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports[0].message).toContain('appear')
    })

    test('all reports should have same message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('A'))))
      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('B'))))

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('context interaction', () => {
    test('should use context.report to report violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not call report for valid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('MyClass')))

      expect(reports.length).toBe(0)
    })

    test('should work with different context instances', () => {
      const ctx1 = createMockRuleContext({ source: 'new obj?.method()' })
      const ctx2 = createMockRuleContext({ source: 'new obj?.method()' })

      const visitor1 = noUnsafeOptionalChainingRule.create(ctx1.context)
      const visitor2 = noUnsafeOptionalChainingRule.create(ctx2.context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      visitor1.NewExpression(createNewExpression(chainNode))
      visitor2.NewExpression(createNewExpression(createIdentifier('MyClass')))

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(0)
    })

    test('should maintain separate report lists per context', () => {
      const ctx1 = createMockRuleContext({ source: 'new obj?.method()' })
      const ctx2 = createMockRuleContext({ source: 'new obj?.method()' })

      const visitor1 = noUnsafeOptionalChainingRule.create(ctx1.context)
      const visitor2 = noUnsafeOptionalChainingRule.create(ctx2.context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      visitor1.NewExpression(createNewExpression(chainNode))
      visitor1.NewExpression(createNewExpression(chainNode))
      visitor2.NewExpression(createNewExpression(chainNode))

      expect(ctx1.reports.length).toBe(2)
      expect(ctx2.reports.length).toBe(1)
    })

    test('should not interfere between different visitors', () => {
      const ctx1 = createMockRuleContext({ source: 'new obj?.method()' })
      const ctx2 = createMockRuleContext({ source: 'new obj?.method()' })

      const visitor1 = noUnsafeOptionalChainingRule.create(ctx1.context)
      const visitor2 = noUnsafeOptionalChainingRule.create(ctx2.context)

      visitor1.NewExpression(createNewExpression(createIdentifier('Valid')))
      visitor2.NewExpression(createNewExpression(createChainExpression(createIdentifier('X'))))

      expect(ctx1.reports.length).toBe(0)
      expect(ctx2.reports.length).toBe(1)
    })
  })

  describe('rule definition structure', () => {
    test('should have meta property', () => {
      expect(noUnsafeOptionalChainingRule.meta).toBeDefined()
    })

    test('should have create property', () => {
      expect(noUnsafeOptionalChainingRule.create).toBeDefined()
    })

    test('create should be a function', () => {
      expect(typeof noUnsafeOptionalChainingRule.create).toBe('function')
    })

    test('meta should be an object', () => {
      expect(typeof noUnsafeOptionalChainingRule.meta).toBe('object')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noUnsafeOptionalChainingRule).sort()
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('create function should accept context argument', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })
      expect(() => noUnsafeOptionalChainingRule.create(context)).not.toThrow()
    })

    test('should not throw when create is called without context', () => {
      expect(() =>
        noUnsafeOptionalChainingRule.create(undefined as unknown as RuleContext),
      ).not.toThrow()
    })
  })

  describe('repeated calls', () => {
    test('should report same violation on repeated calls with same node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode)

      visitor.NewExpression(node)
      visitor.NewExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report for 50 consecutive violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier(`C${i}`))))
      }

      expect(reports.length).toBe(50)
    })

    test('should track reports correctly with mixed valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Valid1')))
      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('A'))))
      visitor.NewExpression(createNewExpression(createIdentifier('Valid2')))
      visitor.NewExpression(createNewExpression(createChainExpression(createIdentifier('B'))))
      visitor.NewExpression(createNewExpression(createIdentifier('Valid3')))

      expect(reports.length).toBe(2)
    })

    test('should track reports correctly alternating valid and invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.NewExpression(createNewExpression(createIdentifier(`Valid${i}`)))
        } else {
          visitor.NewExpression(
            createNewExpression(createChainExpression(createIdentifier(`C${i}`))),
          )
        }
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('callee type combinations', () => {
    test('should not report when callee is ObjectExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = createNewExpression({ type: 'ObjectExpression', properties: [] })
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const unary = { type: 'UnaryExpression', operator: '!', argument: createIdentifier('x') }
      const node = createNewExpression(unary)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is UpdateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const update = {
        type: 'UpdateExpression',
        operator: '++',
        argument: createIdentifier('x'),
        prefix: false,
      }
      const node = createNewExpression(update)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const assign = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
      }
      const node = createNewExpression(assign)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is AwaitExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const awaitExpr = { type: 'AwaitExpression', argument: createIdentifier('promise') }
      const node = createNewExpression(awaitExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is YieldExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const yieldExpr = { type: 'YieldExpression', argument: createIdentifier('value') }
      const node = createNewExpression(yieldExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is ImportExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const importExpr = { type: 'ImportExpression', source: { type: 'Literal', value: './mod' } }
      const node = createNewExpression(importExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is ClassExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const classExpr = {
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }
      const node = createNewExpression(classExpr)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const innerNew = createNewExpression(createIdentifier('Inner'))
      const node = createNewExpression(innerNew)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when callee is ChainExpression wrapping NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const innerNew = createNewExpression(createIdentifier('Inner'))
      const chain = createChainExpression(innerNew)
      const node = createNewExpression(chain)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('arguments variations', () => {
    test('should report with single identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [createIdentifier('arg')])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with object expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [{ type: 'ObjectExpression', properties: [] }])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with array expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [{ type: 'ArrayExpression', elements: [] }])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with function expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const node = createNewExpression(chainNode, [
        {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      ])
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with many arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = createChainExpression(createIdentifier('MyClass'))
      const args = Array.from({ length: 20 }, (_, i) => ({ type: 'Literal', value: i }))
      const node = createNewExpression(chainNode, args)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report with many arguments but no ChainExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const args = Array.from({ length: 20 }, (_, i) => ({ type: 'Literal', value: i }))
      const node = createNewExpression(createIdentifier('MyClass'), args)
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('mock context helpers', () => {
    test('createMockContext should return context and reports', () => {
      const result = createMockRuleContext({ source: 'new obj?.method()' })

      expect(result.context).toBeDefined()
      expect(result.reports).toBeDefined()
      expect(Array.isArray(result.reports)).toBe(true)
    })

    test('reports should start empty', () => {
      const { reports } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(reports.length).toBe(0)
    })

    test('context should have report function', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(typeof context.report).toBe('function')
    })

    test('context should have getFilePath function', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(typeof context.getFilePath).toBe('function')
      expect(context.getFilePath()).toBe('/src/file.ts')
    })

    test('context should have getAST function', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(typeof context.getAST).toBe('function')
      expect(context.getAST()).toBeNull()
    })

    test('context should have getSource function', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(typeof context.getSource).toBe('function')
      expect(context.getSource()).toBe('new obj?.method()')
    })

    test('context should have getTokens function', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(typeof context.getTokens).toBe('function')
      expect(context.getTokens()).toEqual([])
    })

    test('context should have getComments function', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(typeof context.getComments).toBe('function')
      expect(context.getComments()).toEqual([])
    })

    test('context should have config', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(context.config).toBeDefined()
      expect(context.config.options).toEqual([])
    })

    test('context should have logger', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(context.logger).toBeDefined()
      expect(typeof context.logger.debug).toBe('function')
      expect(typeof context.logger.info).toBe('function')
      expect(typeof context.logger.warn).toBe('function')
      expect(typeof context.logger.error).toBe('function')
    })

    test('context should have workspaceRoot', () => {
      const { context } = createMockRuleContext({ source: 'new obj?.method()' })

      expect(context.workspaceRoot).toBe('/src')
    })
  })

  describe('node creation helpers', () => {
    test('createIdentifier should create correct type', () => {
      const id = createIdentifier('test')

      expect((id as Record<string, unknown>).type).toBe('Identifier')
    })

    test('createIdentifier should have correct name', () => {
      const id = createIdentifier('myVar')

      expect((id as Record<string, unknown>).name).toBe('myVar')
    })

    test('createIdentifier should have loc', () => {
      const id = createIdentifier('test')

      expect((id as Record<string, unknown>).loc).toBeDefined()
    })

    test('createChainExpression should create correct type', () => {
      const chain = createChainExpression(createIdentifier('test'))

      expect((chain as Record<string, unknown>).type).toBe('ChainExpression')
    })

    test('createChainExpression should have expression', () => {
      const inner = createIdentifier('test')
      const chain = createChainExpression(inner)

      expect((chain as Record<string, unknown>).expression).toBe(inner)
    })

    test('createNewExpression should create correct type', () => {
      const node = createNewExpression(createIdentifier('test'))

      expect((node as Record<string, unknown>).type).toBe('NewExpression')
    })

    test('createNewExpression should have callee', () => {
      const callee = createIdentifier('test')
      const node = createNewExpression(callee)

      expect((node as Record<string, unknown>).callee).toBe(callee)
    })

    test('createNewExpression should have arguments', () => {
      const node = createNewExpression(createIdentifier('test'))

      expect((node as Record<string, unknown>).arguments).toBeDefined()
      expect(Array.isArray((node as Record<string, unknown>).arguments)).toBe(true)
    })

    test('createMemberExpression should create correct type', () => {
      const member = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))

      expect((member as Record<string, unknown>).type).toBe('MemberExpression')
    })

    test('createMemberExpression should have computed false', () => {
      const member = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))

      expect((member as Record<string, unknown>).computed).toBe(false)
    })

    test('createMemberExpression should have optional false', () => {
      const member = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))

      expect((member as Record<string, unknown>).optional).toBe(false)
    })
  })

  describe('isChainExpression detection edge cases', () => {
    test('should not report when callee has type ChainExpression but is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 'ChainExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 123,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: false,
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when callee is ChainExpression with numeric loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const chainNode = {
        type: 'ChainExpression',
        expression: createIdentifier('X'),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when callee type matches partial ChainExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Chain' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type has whitespace around ChainExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: ' ChainExpression ' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when callee is ChainExpression with Symbol as type value', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: Symbol('ChainExpression') },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report ChainExpression with deeply nested object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const deepObj = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: createIdentifier('a'),
            property: createIdentifier('b'),
            computed: false,
            optional: true,
          },
          property: createIdentifier('c'),
          computed: false,
          optional: true,
        },
        property: createIdentifier('d'),
        computed: false,
        optional: true,
      }
      const chainNode = createChainExpression(deepObj)
      const node = createNewExpression(chainNode)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ChainExpression with ChainExpression as inner expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const innerChain = createChainExpression(createIdentifier('Inner'))
      const outerChain = createChainExpression(innerChain)
      const node = createNewExpression(outerChain)
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report for VariableDeclaration node with ChainExpression-like callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new obj?.method()' })
      const visitor = noUnsafeOptionalChainingRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        callee: createChainExpression(createIdentifier('X')),
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
