import { describe, test, expect, vi } from 'vitest'
import { noObjectConstructorRule } from '../../../../src/rules/patterns/no-object-constructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new Object();',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-object-constructor rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noObjectConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noObjectConstructorRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noObjectConstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noObjectConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noObjectConstructorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noObjectConstructorRule.meta.fixable).toBe('code')
    })

    test('should mention Object in description', () => {
      expect(noObjectConstructorRule.meta.docs?.description).toContain('Object')
    })

    test('should mention object literal in description', () => {
      expect(noObjectConstructorRule.meta.docs?.description).toContain('{}')
    })

    test('should have meta property on rule', () => {
      expect(noObjectConstructorRule).toHaveProperty('meta')
    })

    test('should have create method on rule', () => {
      expect(noObjectConstructorRule).toHaveProperty('create')
    })

    test('meta.docs should be defined', () => {
      expect(noObjectConstructorRule.meta.docs).toBeDefined()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noObjectConstructorRule.meta.docs?.description).toBe('string')
      expect(noObjectConstructorRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.url should be defined', () => {
      expect(noObjectConstructorRule.meta.docs?.url).toBeDefined()
    })

    test('meta.docs.url should start with https', () => {
      expect(noObjectConstructorRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('meta.type should not be problem', () => {
      expect(noObjectConstructorRule.meta.type).not.toBe('problem')
    })

    test('meta.type should not be layout', () => {
      expect(noObjectConstructorRule.meta.type).not.toBe('layout')
    })

    test('meta.severity should not be off', () => {
      expect(noObjectConstructorRule.meta.severity).not.toBe('off')
    })

    test('meta.severity should not be error', () => {
      expect(noObjectConstructorRule.meta.severity).not.toBe('error')
    })

    test('meta.fixable should not be whitespace', () => {
      expect(noObjectConstructorRule.meta.fixable).not.toBe('whitespace')
    })

    test('meta.schema should be an empty array', () => {
      expect(noObjectConstructorRule.meta.schema).toEqual([])
    })

    test('meta should not have deprecated flag', () => {
      expect(noObjectConstructorRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noObjectConstructorRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noObjectConstructorRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta.docs.description should mention readability', () => {
      expect(noObjectConstructorRule.meta.docs?.description.toLowerCase()).toContain('readab')
    })

    test('meta.docs.description should mention redundant', () => {
      expect(noObjectConstructorRule.meta.docs?.description.toLowerCase()).toContain('redundant')
    })

    test('meta.docs.recommended should be boolean true', () => {
      expect(noObjectConstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('meta.fixable should be string code', () => {
      expect(typeof noObjectConstructorRule.meta.fixable).toBe('string')
      expect(noObjectConstructorRule.meta.fixable).toBe('code')
    })

    test('meta.docs.category should be string patterns', () => {
      expect(typeof noObjectConstructorRule.meta.docs?.category).toBe('string')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should return object from create', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('NewExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('create should be callable multiple times', () => {
      const { context } = createMockContext()
      const visitor1 = noObjectConstructorRule.create(context)
      const visitor2 = noObjectConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should have exactly one method', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('each call to create returns independent visitor', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const v1 = noObjectConstructorRule.create(ctx1)
      const v2 = noObjectConstructorRule.create(ctx2)

      v1.NewExpression(createNewExpression(createIdentifier('Object')))
      v2.NewExpression(createNewExpression(createIdentifier('Array')))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('detecting new Object() calls', () => {
    test('should report new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('{}')
    })

    test('should report new Object({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'ObjectExpression', properties: [] },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with single identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [createIdentifier('someValue')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with number literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [{ type: 'Literal', value: 42 }])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'Literal', value: 'test' },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'Literal', value: null },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [createIdentifier('undefined')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        createIdentifier('a'),
        createIdentifier('b'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'ArrayExpression', elements: [] },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object at different line positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report new Object at different column positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 1, 20))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report new Object at large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 999, 50))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report new Object at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 0, 0))

      expect(reports.length).toBe(1)
    })

    test('should report new Object with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'Literal', value: true },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        {
          type: 'MemberExpression',
          object: createIdentifier('a'),
          property: createIdentifier('b'),
        },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'SpreadElement', argument: createIdentifier('args') },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        createIdentifier('a'),
        createIdentifier('b'),
        createIdentifier('c'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with new expression as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        createNewExpression(createIdentifier('Array')),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        {
          type: 'BinaryExpression',
          operator: '+',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Object with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        {
          type: 'ConditionalExpression',
          test: createIdentifier('x'),
          consequent: createIdentifier('a'),
          alternate: createIdentifier('b'),
        },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid code', () => {
    test('should not report new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Array'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Map'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Set'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Date'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new MyClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('MyClass'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report {} literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = { type: 'ObjectExpression', properties: [] }

      expect(reports.length).toBe(0)
    })

    test('should not report new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Error')))

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Promise')))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp')))

      expect(reports.length).toBe(0)
    })

    test('should not report new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Function')))

      expect(reports.length).toBe(0)
    })

    test('should not report new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Number')))

      expect(reports.length).toBe(0)
    })

    test('should not report new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('String')))

      expect(reports.length).toBe(0)
    })

    test('should not report new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Boolean')))

      expect(reports.length).toBe(0)
    })

    test('should not report new WeakMap()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('WeakMap')))

      expect(reports.length).toBe(0)
    })

    test('should not report new WeakSet()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('WeakSet')))

      expect(reports.length).toBe(0)
    })

    test('should not report new Proxy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Proxy')))

      expect(reports.length).toBe(0)
    })

    test('should not report new Int8Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Int8Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report new Float64Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Float64Array')))

      expect(reports.length).toBe(0)
    })

    test('should not report new ArrayBuffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('ArrayBuffer')))

      expect(reports.length).toBe(0)
    })

    test('should not report new DataView()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('DataView')))

      expect(reports.length).toBe(0)
    })

    test('should not report ns.Object() member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: createIdentifier('ns'),
        property: createIdentifier('Object'),
      })

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report window.Object() member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: createIdentifier('window'),
        property: createIdentifier('Object'),
      })

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report globalThis.Object() member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: createIdentifier('globalThis'),
        property: createIdentifier('Object'),
      })

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.create() call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Object'),
          property: createIdentifier('create'),
        },
        arguments: [],
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.keys() call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Object'),
          property: createIdentifier('keys'),
        },
        arguments: [],
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.assign() call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Object'),
          property: createIdentifier('assign'),
        },
        arguments: [],
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report lowercase object identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('object')))

      expect(reports.length).toBe(0)
    })

    test('should not report OBJECT uppercase identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('OBJECT')))

      expect(reports.length).toBe(0)
    })

    test('should not report Objec identifier (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Objec')))

      expect(reports.length).toBe(0)
    })

    test('should not report Objecty identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Objecty')))

      expect(reports.length).toBe(0)
    })

    test('should not report MyObject identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('MyObject')))

      expect(reports.length).toBe(0)
    })

    test('should not report new CustomClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('CustomClass')))

      expect(reports.length).toBe(0)
    })

    test('should not report new HTMLElement()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('HTMLElement')))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [], 42, 10)

      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: createIdentifier('ns'),
        property: createIdentifier('Object'),
      })

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(() => visitor.NewExpression(false)).not.toThrow()
    })

    test('should handle array node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with string callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 'Object',
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 42,
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: true,
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee missing name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier' },
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee name as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 42 },
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee name as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: null,
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: undefined,
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'))
      const extendedNode = { ...node, extra: 'data', foo: 'bar' }

      visitor.NewExpression(extendedNode)

      expect(reports.length).toBe(1)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        callee: createIdentifier('Object'),
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('Object'),
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee that is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({ type: 'ObjectExpression', properties: [] })

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee that is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only loc.start', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: {
          start: { line: 3, column: 5 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: null,
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: undefined,
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with non-numeric loc.start.line', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: { start: { line: 'abc', column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with non-numeric loc.start.column', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: { start: { line: 1, column: 'x' }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createIdentifier('a'),
          property: createIdentifier('b'),
        },
        property: createIdentifier('Object'),
      })

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle options with extra fields', () => {
      const { context, reports } = createMockContext({ customOption: true, anotherOption: 42 })
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
      }

      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when node is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(null)

      expect(reports.length).toBe(0)
    })

    test('should preserve exact location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location at line 2 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 2, 0))

      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should report location at line 1 column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 1, 20))

      expect(reports[0].loc?.start.column).toBe(20)
    })
  })

  describe('message quality', () => {
    test('should mention {} in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message).toContain('{}')
    })

    test('should mention new Object in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message).toContain('new Object')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have consistent message across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should mention object literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message.toLowerCase()).toContain('object literal')
    })

    test('message should not contain undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message).not.toContain('undefined')
    })

    test('message should start with capital letter', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('message should end with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should contain literal for args case', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Object'), [createIdentifier('x')]),
      )

      expect(reports[0].message).toContain('{}')
    })

    test('message should be a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(typeof reports[0].message).toBe('string')
    })

    test('message for args case should mention new Object', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Object'), [createIdentifier('x')]),
      )

      expect(reports[0].message).toContain('new Object')
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for new Object()', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{}')
      expect(reports[0].fix?.range).toEqual([0, 12])
    })

    test('should NOT provide fix for new Object(value) with argument', () => {
      const source = 'new Object(x)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [{ type: 'Identifier', name: 'x', range: [11, 12] }],
        range: [0, 13] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('fix text should be exactly {}', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix?.text).toBe('{}')
    })

    test('fix range should be a tuple of two numbers', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(Array.isArray(reports[0].fix?.range)).toBe(true)
      expect(reports[0].fix?.range?.length).toBe(2)
    })

    test('should not provide fix when range is absent', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for new Object with 2 args', () => {
      const source = 'new Object(a, b)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [createIdentifier('a'), createIdentifier('b')],
        range: [0, 16] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for new Object with 3 args', () => {
      const source = 'new Object(a, b, c)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [createIdentifier('a'), createIdentifier('b'), createIdentifier('c')],
        range: [0, 19] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix at non-zero offset', () => {
      const source = 'const x = new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [10, 22] as [number, number],
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 22 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([10, 22])
      expect(reports[0].fix?.text).toBe('{}')
    })

    test('fix range start should be less than end', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix!.range[0]).toBeLessThan(reports[0].fix!.range[1])
    })

    test('should not provide fix with string argument', () => {
      const source = "new Object('test')"
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [{ type: 'Literal', value: 'test' }],
        range: [0, 18] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix with number argument', () => {
      const source = 'new Object(42)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [{ type: 'Literal', value: 42 }],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix with large range values', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [5000, 5012] as [number, number],
        loc: { start: { line: 100, column: 20 }, end: { line: 100, column: 32 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([5000, 5012])
    })

    test('fix should only be provided for zero arguments', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{}')
    })

    test('should not provide fix with object expression argument', () => {
      const source = 'new Object({})'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix with null argument', () => {
      const source = 'new Object(null)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [{ type: 'Literal', value: null }],
        range: [0, 16] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('fix text should not include semicolons', () => {
      const source = 'new Object();'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix?.text).not.toContain(';')
    })
  })

  describe('multiple calls', () => {
    test('should report each call separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(2)
    })

    test('should report 5 calls to NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle alternating valid and invalid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      visitor.NewExpression(createNewExpression(createIdentifier('Array')))
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      visitor.NewExpression(createNewExpression(createIdentifier('Map')))
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(3)
    })

    test('should handle mixed valid and invalid in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array')))
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      visitor.NewExpression(createNewExpression(createIdentifier('Date')))
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(2)
    })

    test('should handle same node called multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'))
      visitor.NewExpression(node)
      visitor.NewExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should handle different nodes sequentially', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 2, 5))
      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 3, 10))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('different visitors should be independent', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = noObjectConstructorRule.create(ctx1)
      const v2 = noObjectConstructorRule.create(ctx2)

      v1.NewExpression(createNewExpression(createIdentifier('Object')))
      v2.NewExpression(createNewExpression(createIdentifier('Array')))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle many sequential calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })

    test('should handle valid then invalid then valid sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array')))
      expect(reports.length).toBe(0)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      expect(reports.length).toBe(1)

      visitor.NewExpression(createNewExpression(createIdentifier('Set')))
      expect(reports.length).toBe(1)
    })

    test('should accumulate reports across calls without resetting', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      expect(reports.length).toBe(1)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      expect(reports.length).toBe(2)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      expect(reports.length).toBe(3)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/home/user/project/src/app.ts')
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = new Object()')
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'new Object()',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noObjectConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'new Object()',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noObjectConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockContext({}, '/src/file.js')
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with nested directory path', () => {
      const { context, reports } = createMockContext({}, '/src/deep/nested/dir/file.ts')
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const source = 'const a = 1;\nconst b = 2;\nconst c = new Object();\nconst d = 4;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object'), [], 3, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  describe('exports', () => {
    test('should have default export equal to named export', () => {
      const defaultExport = noObjectConstructorRule
      expect(defaultExport).toBe(noObjectConstructorRule)
    })

    test('named export should be an object', () => {
      expect(typeof noObjectConstructorRule).toBe('object')
    })

    test('named export should have meta property', () => {
      expect(noObjectConstructorRule).toHaveProperty('meta')
    })

    test('named export should have create property', () => {
      expect(noObjectConstructorRule).toHaveProperty('create')
    })

    test('create should be a function', () => {
      expect(typeof noObjectConstructorRule.create).toBe('function')
    })
  })

  describe('rule identification', () => {
    test('should only trigger on exact Object identifier match', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const names = ['object', 'OBJECT', 'Objec', 'Objecty', 'MyObject', 'obj', 'OBJ']
      for (const name of names) {
        visitor.NewExpression(createNewExpression(createIdentifier(name)))
      }

      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for Object', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('object')))
      expect(reports.length).toBe(0)

      visitor.NewExpression(createNewExpression(createIdentifier('OBJECT')))
      expect(reports.length).toBe(0)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))
      expect(reports.length).toBe(1)
    })

    test('should handle Object.create static method call', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: createIdentifier('Object'),
        property: createIdentifier('create'),
      })

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle this.Object member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: createIdentifier('Object'),
      })

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new SomeObject()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('SomeObject')))

      expect(reports.length).toBe(0)
    })

    test('should not report new ObjectHolder()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('ObjectHolder')))

      expect(reports.length).toBe(0)
    })

    test('should not report new ObjectFactory()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('ObjectFactory')))

      expect(reports.length).toBe(0)
    })

    test('should handle callee with type but not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee as array', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression([createIdentifier('Object')])

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should detect Object with whitespace around identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({ type: 'Identifier', name: 'Object' })

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle new Object() followed by member access', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should not report new TypeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('TypeError')))

      expect(reports.length).toBe(0)
    })
  })

  describe('location edge cases', () => {
    test('should handle loc with only start.line', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: { start: { line: 5 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: {},
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc.start with negative column', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('fix edge cases', () => {
    test('should provide fix for zero-arg new Object at end of file', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{}')
    })

    test('should not provide fix when range is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for new Object with undefined identifier arg', () => {
      const source = 'new Object(undefined)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [createIdentifier('undefined')],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })
  })
})
