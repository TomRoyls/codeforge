import { describe, test, expect, vi } from 'vitest'
import { preferOptionalChainRule } from '../../../../src/rules/patterns/prefer-optional-chain.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'obj && obj.prop',
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

function createLogicalExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, computed = false): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
  }
}

function createChainExpression(expression: unknown): unknown {
  return {
    type: 'ChainExpression',
    expression,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('prefer-optional-chain rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferOptionalChainRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferOptionalChainRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferOptionalChainRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferOptionalChainRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferOptionalChainRule.meta.schema).toBeDefined()
    })

    test('should be code fixable', () => {
      expect(preferOptionalChainRule.meta.fixable).toBe('code')
    })

    test('should mention optional chaining in description', () => {
      expect(preferOptionalChainRule.meta.docs?.description.toLowerCase()).toContain('optional')
    })

    test('should mention chaining in description', () => {
      expect(preferOptionalChainRule.meta.docs?.description.toLowerCase()).toContain('chaining')
    })

    test('should have a docs URL', () => {
      expect(preferOptionalChainRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs URL containing prefer-optional-chain', () => {
      expect(preferOptionalChainRule.meta.docs?.url).toContain('prefer-optional-chain')
    })

    test('should not be deprecated', () => {
      expect(preferOptionalChainRule.meta.deprecated).toBeFalsy()
    })

    test('should not require type checking', () => {
      expect(preferOptionalChainRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have description as non-empty string', () => {
      expect(typeof preferOptionalChainRule.meta.docs?.description).toBe('string')
      expect(preferOptionalChainRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have severity as a valid Severity type', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(preferOptionalChainRule.meta.severity)
    })

    test('should have type as a valid RuleType', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(preferOptionalChainRule.meta.type)
    })

    test('should have fixable as a valid value', () => {
      const validFixable = ['code', 'whitespace']
      if (preferOptionalChainRule.meta.fixable) {
        expect(validFixable).toContain(preferOptionalChainRule.meta.fixable)
      }
    })

    test('should have meta object defined', () => {
      expect(preferOptionalChainRule.meta).toBeDefined()
      expect(typeof preferOptionalChainRule.meta).toBe('object')
    })

    test('should have create function defined', () => {
      expect(preferOptionalChainRule.create).toBeDefined()
      expect(typeof preferOptionalChainRule.create).toBe('function')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferOptionalChainRule.meta.schema)).toBe(true)
    })

    test('should not have replacedBy', () => {
      expect(preferOptionalChainRule.meta.replacedBy).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should return visitor where LogicalExpression is a function', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(typeof visitor.LogicalExpression).toBe('function')
    })

    test('should return visitor where BinaryExpression is a function', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should create independent visitors per call', () => {
      const { context: ctx1 } = createMockContext()
      const { context: ctx2 } = createMockContext()
      const visitor1 = preferOptionalChainRule.create(ctx1)
      const visitor2 = preferOptionalChainRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context without throwing', () => {
      const { context } = createMockContext()

      expect(() => preferOptionalChainRule.create(context)).not.toThrow()
    })

    test('should create visitor with exactly 2 methods', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys.length).toBe(2)
      expect(keys).toContain('LogicalExpression')
      expect(keys).toContain('BinaryExpression')
    })

    test('should allow calling visitor methods without error', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => {
        visitor.LogicalExpression(
          createLogicalExpression(
            '&&',
            createIdentifier('a'),
            createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          ),
        )
      }).not.toThrow()
    })
  })

  describe('detecting obj && obj.prop pattern in LogicalExpression', () => {
    test('should report obj && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should report data && data.value pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const data = createIdentifier('data')
      const value = createIdentifier('value')
      const member = createMemberExpression(data, value)

      visitor.LogicalExpression(createLogicalExpression('&&', data, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should report foo && foo.bar pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const foo = createIdentifier('foo')
      const bar = createIdentifier('bar')
      const member = createMemberExpression(foo, bar)

      visitor.LogicalExpression(createLogicalExpression('&&', foo, member))

      expect(reports.length).toBe(1)
    })

    test('should report config && config.setting pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const config = createIdentifier('config')
      const setting = createIdentifier('setting')
      const member = createMemberExpression(config, setting)

      visitor.LogicalExpression(createLogicalExpression('&&', config, member))

      expect(reports.length).toBe(1)
    })

    test('should report state && state.isLoading pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const state = createIdentifier('state')
      const isLoading = createIdentifier('isLoading')
      const member = createMemberExpression(state, isLoading)

      visitor.LogicalExpression(createLogicalExpression('&&', state, member))

      expect(reports.length).toBe(1)
    })

    test('should report item && item.name pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const item = createIdentifier('item')
      const name = createIdentifier('name')
      const member = createMemberExpression(item, name)

      visitor.LogicalExpression(createLogicalExpression('&&', item, member))

      expect(reports.length).toBe(1)
    })

    test('should report node && node.children pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = createIdentifier('node')
      const children = createIdentifier('children')
      const member = createMemberExpression(node, children)

      visitor.LogicalExpression(createLogicalExpression('&&', node, member))

      expect(reports.length).toBe(1)
    })

    test('should report user && user.email pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const user = createIdentifier('user')
      const email = createIdentifier('email')
      const member = createMemberExpression(user, email)

      visitor.LogicalExpression(createLogicalExpression('&&', user, member))

      expect(reports.length).toBe(1)
    })

    test('should report null != null && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should report obj !== null && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj !== undefined && obj.prop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const undefinedLit = { type: 'Literal', raw: 'undefined', value: undefined }
      const nullCheck = createBinaryExpression('!==', obj, undefinedLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj != null && obj.prop via != operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('myObj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('field')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report null != null check with raw undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('x')
      const undefinedLit = { type: 'Literal', raw: 'undefined', value: undefined }
      const nullCheck = createBinaryExpression('!=', obj, undefinedLit)

      const prop = createIdentifier('y')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report null !== null check with raw null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('target')
      const nullLit = { type: 'Literal', raw: 'null', value: null }
      const nullCheck = createBinaryExpression('!==', obj, nullLit)

      const prop = createIdentifier('value')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report with single letter identifier a && a.b', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const a = createIdentifier('a')
      const b = createIdentifier('b')
      const member = createMemberExpression(a, b)

      visitor.LogicalExpression(createLogicalExpression('&&', a, member))

      expect(reports.length).toBe(1)
    })

    test('should report with underscore identifier _data && _data.val', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const data = createIdentifier('_data')
      const val = createIdentifier('val')
      const member = createMemberExpression(data, val)

      visitor.LogicalExpression(createLogicalExpression('&&', data, member))

      expect(reports.length).toBe(1)
    })

    test('should report with dollar identifier $el && $el.style', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const el = createIdentifier('$el')
      const style = createIdentifier('style')
      const member = createMemberExpression(el, style)

      visitor.LogicalExpression(createLogicalExpression('&&', el, member))

      expect(reports.length).toBe(1)
    })

    test('should report camelCase identifier myObject && myObject.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const myObject = createIdentifier('myObject')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(myObject, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', myObject, member))

      expect(reports.length).toBe(1)
    })

    test('should report PascalCase identifier Component && Component.render', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const component = createIdentifier('Component')
      const render = createIdentifier('render')
      const member = createMemberExpression(component, render)

      visitor.LogicalExpression(createLogicalExpression('&&', component, member))

      expect(reports.length).toBe(1)
    })

    test('should report UPPER_CASE identifier CONST && CONST.value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const cst = createIdentifier('CONST')
      const value = createIdentifier('value')
      const member = createMemberExpression(cst, value)

      visitor.LogicalExpression(createLogicalExpression('&&', cst, member))

      expect(reports.length).toBe(1)
    })

    test('should report identifier with numbers item2 && item2.name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const item2 = createIdentifier('item2')
      const name = createIdentifier('name')
      const member = createMemberExpression(item2, name)

      visitor.LogicalExpression(createLogicalExpression('&&', item2, member))

      expect(reports.length).toBe(1)
    })

    test('should report response && response.data pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const response = createIdentifier('response')
      const data = createIdentifier('data')
      const member = createMemberExpression(response, data)

      visitor.LogicalExpression(createLogicalExpression('&&', response, member))

      expect(reports.length).toBe(1)
    })

    test('should report window && window.document pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const window = createIdentifier('window')
      const document = createIdentifier('document')
      const member = createMemberExpression(window, document)

      visitor.LogicalExpression(createLogicalExpression('&&', window, member))

      expect(reports.length).toBe(1)
    })

    test('should report error && error.message pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const error = createIdentifier('error')
      const message = createIdentifier('message')
      const member = createMemberExpression(error, message)

      visitor.LogicalExpression(createLogicalExpression('&&', error, member))

      expect(reports.length).toBe(1)
    })

    test('should report options && options.enabled pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const options = createIdentifier('options')
      const enabled = createIdentifier('enabled')
      const member = createMemberExpression(options, enabled)

      visitor.LogicalExpression(createLogicalExpression('&&', options, member))

      expect(reports.length).toBe(1)
    })

    test('should report props && props.children pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const props = createIdentifier('props')
      const children = createIdentifier('children')
      const member = createMemberExpression(props, children)

      visitor.LogicalExpression(createLogicalExpression('&&', props, member))

      expect(reports.length).toBe(1)
    })

    test('should report ctx && ctx.request pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const ctx = createIdentifier('ctx')
      const request = createIdentifier('request')
      const member = createMemberExpression(ctx, request)

      visitor.LogicalExpression(createLogicalExpression('&&', ctx, member))

      expect(reports.length).toBe(1)
    })

    test('should report event && event.target pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const event = createIdentifier('event')
      const target = createIdentifier('target')
      const member = createMemberExpression(event, target)

      visitor.LogicalExpression(createLogicalExpression('&&', event, member))

      expect(reports.length).toBe(1)
    })

    test('should report result && result.success pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const result = createIdentifier('result')
      const success = createIdentifier('success')
      const member = createMemberExpression(result, success)

      visitor.LogicalExpression(createLogicalExpression('&&', result, member))

      expect(reports.length).toBe(1)
    })

    test('should report self && self.name pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const self = createIdentifier('self')
      const name = createIdentifier('name')
      const member = createMemberExpression(self, name)

      visitor.LogicalExpression(createLogicalExpression('&&', self, member))

      expect(reports.length).toBe(1)
    })

    test('should report handler && handler.fn pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const handler = createIdentifier('handler')
      const fn = createIdentifier('fn')
      const member = createMemberExpression(handler, fn)

      visitor.LogicalExpression(createLogicalExpression('&&', handler, member))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting invalid patterns in LogicalExpression', () => {
    test('should not report different identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj1, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-member expression on right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')

      visitor.LogicalExpression(createLogicalExpression('&&', obj, prop))

      expect(reports.length).toBe(0)
    })

    test('should not report || operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('||', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report ?? operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('??', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report when right object already uses optional chaining', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)
      const chain = createChainExpression(member)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, chain))

      expect(reports.length).toBe(0)
    })

    test('should not report different identifiers in null check', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj1, nullLit)

      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-null check on left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const value = createIdentifier('value')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', value, member))

      expect(reports.length).toBe(0)
    })

    test('should not report equality check (==)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const check = createBinaryExpression('==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report strict equality check (===)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const check = createBinaryExpression('===', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop, true)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with non-null literal on right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const value = createIdentifier('value')
      const check = createBinaryExpression('!=', obj, value)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Identifier object in member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const call = { type: 'CallExpression', callee: obj }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(call, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Identifier property in member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createLiteral('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report member expression with optional=true on object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = { type: 'Identifier', name: 'obj', optional: true } as unknown
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report when left is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const call = { type: 'CallExpression', callee: createIdentifier('fn') }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(call, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', call, member))

      expect(reports.length).toBe(0)
    })

    test('should not report when both identifiers differ by case', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('Obj')
      const obj2 = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report for < operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('<', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report for > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('>', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with literal number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const numLit = createLiteral(42)
      const check = createBinaryExpression('!=', obj, numLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const strLit = createLiteral('null')
      const check = createBinaryExpression('!=', obj, strLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with literal boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const boolLit = createLiteral(true)
      const check = createBinaryExpression('!=', obj, boolLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with non-Identifier rightObject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const call = { type: 'CallExpression' }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(call, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with non-string rightIdentifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const rightObj = { type: 'Identifier', name: 123 as unknown as string }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(rightObj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is a plain Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const other = createIdentifier('other')

      visitor.LogicalExpression(createLogicalExpression('&&', obj, other))

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const lit = createLiteral(true)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, lit))

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const call = { type: 'CallExpression', callee: obj }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, call))

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const cond = {
        type: 'ConditionalExpression',
        test: obj,
        consequent: createIdentifier('a'),
        alternate: createIdentifier('b'),
      }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, cond))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with identifier check target != something', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('target')
      const something = createIdentifier('something')
      const check = createBinaryExpression('!=', obj, something)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report null check with null on left side of comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const check = createBinaryExpression('!=', nullLit, obj)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('', obj, member))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting obj && obj.prop pattern in BinaryExpression', () => {
    test('should report obj && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', obj, member))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('optional chaining')
    })

    test('should report data && data.value pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const data = createIdentifier('data')
      const value = createIdentifier('value')
      const member = createMemberExpression(data, value)

      visitor.BinaryExpression(createBinaryExpression('&&', data, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj != null && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj !== null && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report obj !== undefined && obj.prop pattern in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const undefinedLit = { type: 'Literal', raw: 'undefined', value: undefined }
      const nullCheck = createBinaryExpression('!==', obj, undefinedLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report x && x.y in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const x = createIdentifier('x')
      const y = createIdentifier('y')
      const member = createMemberExpression(x, y)

      visitor.BinaryExpression(createBinaryExpression('&&', x, member))

      expect(reports.length).toBe(1)
    })

    test('should not report different identifiers in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', obj1, member))

      expect(reports.length).toBe(0)
    })

    test('should not report non-&& operators in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('||', obj, member))
      visitor.BinaryExpression(createBinaryExpression('+', obj, member))
      visitor.BinaryExpression(createBinaryExpression('==', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report when right object already uses optional chaining in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)
      const chain = createChainExpression(member)

      visitor.BinaryExpression(createBinaryExpression('&&', obj, chain))

      expect(reports.length).toBe(0)
    })

    test('should not report different identifiers in null check in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj1, nullLit)

      const obj2 = createIdentifier('obj2')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj2, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should not report computed member expression in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop, true)

      visitor.BinaryExpression(createBinaryExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should report config && config.setting in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const config = createIdentifier('config')
      const setting = createIdentifier('setting')
      const member = createMemberExpression(config, setting)

      visitor.BinaryExpression(createBinaryExpression('&&', config, member))

      expect(reports.length).toBe(1)
    })

    test('should not report * operator in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('*', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report - operator in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('-', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report / operator in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('/', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report <= operator in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('<=', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report >= operator in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('>=', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should not report % operator in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('%', obj, member))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression('string')).not.toThrow()
      expect(() => visitor.LogicalExpression(123)).not.toThrow()
    })

    test('should handle null node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        right: { type: 'Identifier', name: 'obj' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'obj' },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = { type: 'MemberExpression', property: prop }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const member = { type: 'MemberExpression', object: obj }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should handle computed property access (should not report)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop, true)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with non-Literal right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const notNull = createIdentifier('notNull')
      const check = createBinaryExpression('!=', obj, notNull)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with Literal that is not null/undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const numLit = createLiteral(42)
      const check = createBinaryExpression('!=', obj, numLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const check = {
        type: 'BinaryExpression',
        operator: '!=',
        right: nullLit,
      }

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle null check with non-Identifier left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const call = { type: 'CallExpression', callee: obj }
      const check = createBinaryExpression('!=', call, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', check, member))

      expect(reports.length).toBe(0)
    })

    test('should handle Identifier with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = { type: 'Identifier', name: 123 as unknown as string }
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle nodesMatchIdentifier with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(null, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle nodesMatchIdentifier with null rightObject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = { type: 'MemberExpression', object: null, property: prop }

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with null left in nullCheck', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = {
        type: 'BinaryExpression',
        operator: '!=',
        right: nullLit,
        left: null,
      }

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in LogicalExpression', () => {
      const { context } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression(true)).not.toThrow()
      expect(() => visitor.LogicalExpression(false)).not.toThrow()
    })

    test('should handle array node in LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      expect(() => visitor.LogicalExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty type string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: '',
        operator: '&&',
        left: createIdentifier('obj'),
        right: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric 0 as left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: 0,
        right: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for line 10, column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 10, 5)
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for line 1, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 1, 0)
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 500, 20)
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member, 500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 5, 10)
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', obj, member, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: { line: 1, column: 'not-a-number' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {},
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report location end position from extractLocation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 3, 8)
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member, 3, 8))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should default to line 1 when no loc on node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
      }

      visitor.LogicalExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for null check pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 7, 3)
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member, 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for BinaryExpression null check pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj', 12, 4)
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member, 12, 4))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: null,
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with null end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: obj,
        right: member,
        loc: {
          start: { line: 2, column: 5 },
          end: null,
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })
  })

  describe('message quality', () => {
    test('should mention optional chaining in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message.toLowerCase()).toContain('optional')
    })

    test('should mention chaining in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message.toLowerCase()).toContain('chaining')
    })

    test('should mention ?. in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message).toContain('?.')
    })

    test('should mention && in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message).toContain('&&')
    })

    test('should have non-empty message string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message.length).toBeGreaterThan(0)
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have consistent message for LogicalExpression and BinaryExpression', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = preferOptionalChainRule.create(ctx1)
      const visitor2 = preferOptionalChainRule.create(ctx2)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor1.LogicalExpression(createLogicalExpression('&&', obj, member))
      visitor2.BinaryExpression(createBinaryExpression('&&', obj, member))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should have consistent message for simple and null-check patterns', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = preferOptionalChainRule.create(ctx1)
      const visitor2 = preferOptionalChainRule.create(ctx2)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor1.LogicalExpression(createLogicalExpression('&&', obj, member))

      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)
      visitor2.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should mention prefer in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message.toLowerCase()).toContain('prefer')
    })

    test('should have message that starts with Prefer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message).toMatch(/^Prefer/)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports[0].message).toMatch(/\.$/)
    })
  })

  describe('multiple reports', () => {
    test('should report separately for each matching LogicalExpression call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))
      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(2)
    })

    test('should report separately for each matching BinaryExpression call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', obj, member))
      visitor.BinaryExpression(createBinaryExpression('&&', obj, member))

      expect(reports.length).toBe(2)
    })

    test('should report for mixed LogicalExpression and BinaryExpression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))
      visitor.BinaryExpression(createBinaryExpression('&&', obj, member))

      expect(reports.length).toBe(2)
    })

    test('should report for different variable names across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj1 = createIdentifier('obj1')
      const prop1 = createIdentifier('prop1')
      const member1 = createMemberExpression(obj1, prop1)
      visitor.LogicalExpression(createLogicalExpression('&&', obj1, member1))

      const obj2 = createIdentifier('obj2')
      const prop2 = createIdentifier('prop2')
      const member2 = createMemberExpression(obj2, prop2)
      visitor.LogicalExpression(createLogicalExpression('&&', obj2, member2))

      expect(reports.length).toBe(2)
    })

    test('should report for three consecutive calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const a = createIdentifier('a')
      const b = createIdentifier('b')
      const member = createMemberExpression(a, b)

      visitor.LogicalExpression(createLogicalExpression('&&', a, member))
      visitor.BinaryExpression(createBinaryExpression('&&', a, member))
      visitor.LogicalExpression(createLogicalExpression('&&', a, member))

      expect(reports.length).toBe(3)
    })

    test('should not report for mixed valid and invalid patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const other = createIdentifier('other')
      const prop = createIdentifier('prop')

      const member = createMemberExpression(obj, prop)
      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      const member2 = createMemberExpression(other, prop)
      visitor.LogicalExpression(createLogicalExpression('&&', obj, member2))

      expect(reports.length).toBe(1)
    })

    test('should report null check pattern and simple pattern separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)
      const memberNull = createMemberExpression(obj, prop)
      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, memberNull))

      expect(reports.length).toBe(2)
    })

    test('should track reports independently per context', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = preferOptionalChainRule.create(ctx1)
      const visitor2 = preferOptionalChainRule.create(ctx2)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor1.LogicalExpression(createLogicalExpression('&&', obj, member))
      visitor2.LogicalExpression(createLogicalExpression('&&', obj, member))
      visitor2.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(2)
    })

    test('should report five consecutive valid patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      for (let i = 0; i < 5; i++) {
        const obj = createIdentifier('obj')
        const prop = createIdentifier('prop')
        const member = createMemberExpression(obj, prop)
        visitor.LogicalExpression(createLogicalExpression('&&', obj, member))
      }

      expect(reports.length).toBe(5)
    })

    test('should report only valid patterns among mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))
      visitor.LogicalExpression(createLogicalExpression('||', obj, member))
      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))
      visitor.LogicalExpression(createLogicalExpression('&&', createIdentifier('x'), member))
      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(3)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/src/components/App.tsx')
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'foo && foo.bar')
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('foo')
      const prop = createIdentifier('bar')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should work with empty options object', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should work with custom options', () => {
      const { context, reports } = createMockContext({ checkNullish: true })
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should use context report function', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'a && a.b',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = preferOptionalChainRule.create(context)
      const obj = createIdentifier('a')
      const prop = createIdentifier('b')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should not throw when context config is empty', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/',
      } as unknown as RuleContext

      expect(() => preferOptionalChainRule.create(context)).not.toThrow()
    })

    test('should handle deep workspace root path', () => {
      const { context, reports } = createMockContext({}, '/deep/nested/path/to/project/src/file.ts')
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('x')
      const prop = createIdentifier('y')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should handle empty source string', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression visitor with non-BinaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('obj'),
        right: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle LogicalExpression visitor with non-LogicalExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&&',
        left: createIdentifier('obj'),
        right: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized detection tests', () => {
    const matchingPairs: Array<[string, string]> = [
      ['obj', 'prop'],
      ['data', 'value'],
      ['foo', 'bar'],
      ['config', 'setting'],
      ['state', 'isLoading'],
      ['item', 'name'],
      ['node', 'children'],
      ['user', 'email'],
      ['response', 'data'],
      ['window', 'document'],
      ['error', 'message'],
      ['options', 'enabled'],
      ['props', 'children'],
      ['ctx', 'request'],
      ['event', 'target'],
      ['result', 'success'],
      ['self', 'name'],
      ['handler', 'fn'],
      ['a', 'b'],
      ['_data', 'val'],
    ]

    test.each(matchingPairs)(
      'should report %s && %s.%s pattern in LogicalExpression',
      (objName: string, propName: string) => {
        const { context, reports } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        const obj = createIdentifier(objName)
        const prop = createIdentifier(propName)
        const member = createMemberExpression(obj, prop)

        visitor.LogicalExpression(createLogicalExpression('&&', obj, member))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('optional chaining')
      },
    )

    test.each(matchingPairs)(
      'should report %s && %s.%s pattern in BinaryExpression',
      (objName: string, propName: string) => {
        const { context, reports } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        const obj = createIdentifier(objName)
        const prop = createIdentifier(propName)
        const member = createMemberExpression(obj, prop)

        visitor.BinaryExpression(createBinaryExpression('&&', obj, member))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('optional chaining')
      },
    )
  })

  describe('parameterized non-matching operator tests', () => {
    const nonMatchingOperators: Array<[string]> = [
      ['||'],
      ['??'],
      ['+'],
      ['-'],
      ['*'],
      ['/'],
      ['%'],
      ['=='],
      ['==='],
      ['!='],
      ['!=='],
      ['<'],
      ['>'],
      ['<='],
      ['>='],
      ['&'],
      ['|'],
      ['^'],
      ['<<'],
      ['>>'],
    ]

    test.each(nonMatchingOperators)(
      'should not report for %s operator in LogicalExpression',
      (op: string) => {
        const { context, reports } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        const obj = createIdentifier('obj')
        const prop = createIdentifier('prop')
        const member = createMemberExpression(obj, prop)

        visitor.LogicalExpression(createLogicalExpression(op, obj, member))

        expect(reports.length).toBe(0)
      },
    )

    test.each(nonMatchingOperators)(
      'should not report for %s operator in BinaryExpression',
      (op: string) => {
        const { context, reports } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        const obj = createIdentifier('obj')
        const prop = createIdentifier('prop')
        const member = createMemberExpression(obj, prop)

        visitor.BinaryExpression(createBinaryExpression(op, obj, member))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized null check operator tests', () => {
    test('should report for != null check', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report for !== null check', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report for != with raw undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const undefinedLit = { type: 'Literal', raw: 'undefined', value: undefined }
      const nullCheck = createBinaryExpression('!=', obj, undefinedLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report for !== with raw undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const undefinedLit = { type: 'Literal', raw: 'undefined', value: undefined }
      const nullCheck = createBinaryExpression('!==', obj, undefinedLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should report for != null check in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('!=', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.BinaryExpression(createBinaryExpression('&&', nullCheck, member))

      expect(reports.length).toBe(1)
    })

    test('should not report for == null check', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('==', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should not report for === null check', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('===', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })

    test('should not report for > null check operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferOptionalChainRule.create(context)

      const obj = createIdentifier('obj')
      const nullLit = createLiteral(null)
      const nullCheck = createBinaryExpression('>', obj, nullLit)

      const prop = createIdentifier('prop')
      const member = createMemberExpression(obj, prop)

      visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized edge case inputs', () => {
    const edgeInputs: Array<[unknown, string]> = [
      [null, 'null'],
      [undefined, 'undefined'],
      ['string', 'string'],
      [123, 'number'],
      [true, 'boolean true'],
      [false, 'boolean false'],
      [[], 'empty array'],
      [{}, 'empty object'],
    ]

    test.each(edgeInputs)(
      'should handle %s node in LogicalExpression without throwing',
      (input: unknown, _label: string) => {
        const { context } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        expect(() => visitor.LogicalExpression(input)).not.toThrow()
      },
    )

    test.each(edgeInputs)(
      'should handle %s node in BinaryExpression without throwing',
      (input: unknown, _label: string) => {
        const { context } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        expect(() => visitor.BinaryExpression(input)).not.toThrow()
      },
    )
  })

  describe('parameterized location tests', () => {
    const locations: Array<[number, number]> = [
      [1, 0],
      [1, 1],
      [5, 0],
      [5, 10],
      [10, 0],
      [10, 5],
      [100, 0],
      [100, 50],
      [500, 20],
      [1000, 0],
    ]

    test.each(locations)(
      'should report correct location at line %d, column %d',
      (line: number, column: number) => {
        const { context, reports } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        const obj = createIdentifier('obj', line, column)
        const prop = createIdentifier('prop')
        const member = createMemberExpression(obj, prop)

        visitor.LogicalExpression(createLogicalExpression('&&', obj, member, line, column))

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('parameterized different identifier tests', () => {
    const mismatchedPairs: Array<[string, string]> = [
      ['obj1', 'obj2'],
      ['foo', 'bar'],
      ['a', 'b'],
      ['x', 'y'],
      ['left', 'right'],
      ['first', 'second'],
      ['alpha', 'beta'],
      ['src', 'dest'],
      ['from', 'to'],
      ['input', 'output'],
    ]

    test.each(mismatchedPairs)(
      'should not report when identifiers differ: %s vs %s',
      (leftName: string, rightName: string) => {
        const { context, reports } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        const left = createIdentifier(leftName)
        const right = createIdentifier(rightName)
        const prop = createIdentifier('prop')
        const member = createMemberExpression(right, prop)

        visitor.LogicalExpression(createLogicalExpression('&&', left, member))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('parameterized different identifier null check tests', () => {
    const mismatchedNullCheckPairs: Array<[string, string]> = [
      ['obj1', 'obj2'],
      ['foo', 'bar'],
      ['a', 'b'],
      ['x', 'y'],
      ['left', 'right'],
      ['first', 'second'],
      ['src', 'dest'],
      ['from', 'to'],
    ]

    test.each(mismatchedNullCheckPairs)(
      'should not report null check with mismatched identifiers: %s != null && %s.prop',
      (leftName: string, rightName: string) => {
        const { context, reports } = createMockContext()
        const visitor = preferOptionalChainRule.create(context)

        const left = createIdentifier(leftName)
        const nullLit = createLiteral(null)
        const nullCheck = createBinaryExpression('!=', left, nullLit)

        const right = createIdentifier(rightName)
        const prop = createIdentifier('prop')
        const member = createMemberExpression(right, prop)

        visitor.LogicalExpression(createLogicalExpression('&&', nullCheck, member))

        expect(reports.length).toBe(0)
      },
    )
  })
})
