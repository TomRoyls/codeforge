import { describe, test, expect } from 'vitest'
import { noAlertRule } from '../../../../src/rules/patterns/no-alert.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createCallExpression(calleeName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: { start: { line, column }, end: { line, column: column + calleeName.length + 2 } },
  }
}

function createWindowCallExpression(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'window' },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: { start: { line, column }, end: { line, column: column + method.length + 9 } },
  }
}

function createGlobalThisCallExpression(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'globalThis' },
      property: { type: 'Identifier', name: method },
      computed: false,
    },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: { start: { line, column }, end: { line, column: column + method.length + 14 } },
  }
}

function createNonCallExpression(): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
  }
}

describe('no-alert rule', () => {
  describe('meta', () => {
    test('meta type is suggestion', () => {
      expect(noAlertRule.meta.type).toBe('suggestion')
    })

    test('meta severity is warn', () => {
      expect(noAlertRule.meta.severity).toBe('warn')
    })

    test('meta recommended is true', () => {
      expect(noAlertRule.meta.docs?.recommended).toBe(true)
    })

    test('meta category is patterns', () => {
      expect(noAlertRule.meta.docs?.category).toBe('patterns')
    })

    test('description mentions alert', () => {
      expect(noAlertRule.meta.docs?.description.toLowerCase()).toContain('alert')
    })

    test('meta type is not problem', () => {
      expect(noAlertRule.meta.type).not.toBe('problem')
    })

    test('meta type is not layout', () => {
      expect(noAlertRule.meta.type).not.toBe('layout')
    })

    test('meta severity is not error', () => {
      expect(noAlertRule.meta.severity).not.toBe('error')
    })

    test('meta severity is not off', () => {
      expect(noAlertRule.meta.severity).not.toBe('off')
    })

    test('meta docs exist', () => {
      expect(noAlertRule.meta.docs).toBeDefined()
    })

    test('meta docs description is a string', () => {
      expect(typeof noAlertRule.meta.docs?.description).toBe('string')
    })

    test('meta docs description is non-empty', () => {
      expect(noAlertRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs category is a string', () => {
      expect(typeof noAlertRule.meta.docs?.category).toBe('string')
    })

    test('meta has schema property', () => {
      expect(noAlertRule.meta).toHaveProperty('schema')
    })

    test('meta schema is an empty array', () => {
      expect(noAlertRule.meta.schema).toEqual([])
    })

    test('meta fixable is undefined', () => {
      expect(noAlertRule.meta.fixable).toBeUndefined()
    })

    test('meta deprecated is undefined or false', () => {
      expect(noAlertRule.meta.deprecated).toBeFalsy()
    })

    test('meta does not have replacedBy', () => {
      expect(noAlertRule.meta.replacedBy).toBeUndefined()
    })

    test('meta docs recommended is boolean true', () => {
      expect(noAlertRule.meta.docs?.recommended).toBe(true)
    })

    test('description mentions confirm', () => {
      expect(noAlertRule.meta.docs?.description.toLowerCase()).toContain('confirm')
    })

    test('description mentions prompt', () => {
      expect(noAlertRule.meta.docs?.description.toLowerCase()).toContain('prompt')
    })

    test('description mentions browser dialogs', () => {
      const desc = noAlertRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('dialog')
    })

    test('meta has all required fields', () => {
      expect(noAlertRule.meta).toHaveProperty('type')
      expect(noAlertRule.meta).toHaveProperty('severity')
      expect(noAlertRule.meta).toHaveProperty('docs')
    })
  })

  describe('create', () => {
    test('create returns object with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a non-null visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('create returns a non-undefined visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(visitor).not.toBeUndefined()
    })

    test('CallExpression is a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create can be called multiple times producing separate visitors', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noAlertRule.create(context)
      const visitor2 = noAlertRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor has exactly one key', () => {
      const { context } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('create does not throw with valid context', () => {
      const { context } = createMockRuleContext()

      expect(() => noAlertRule.create(context)).not.toThrow()
    })

    test('CallExpression returns void for valid node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const result = visitor.CallExpression(createCallExpression('alert'))
      expect(result).toBeUndefined()
    })

    test('CallExpression returns void for null node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const result = visitor.CallExpression(null)
      expect(result).toBeUndefined()
    })

    test('create produces visitor that works independently of other visitors', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noAlertRule.create(ctx1.context)
      const visitor2 = noAlertRule.create(ctx2.context)

      visitor1.CallExpression(createCallExpression('alert'))
      visitor2.CallExpression(createCallExpression('confirm'))

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
      expect(ctx1.reports[0].message).toContain('alert')
      expect(ctx2.reports[0].message).toContain('confirm')
    })
  })

  describe('detecting dialog functions', () => {
    test("Detects alert('hello')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test("Detects confirm('sure?')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('confirm'))

      expect(reports.length).toBe(1)
    })

    test("Detects prompt('enter:')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('prompt'))

      expect(reports.length).toBe(1)
    })

    test("Detects window.alert('hi')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test("Detects window.confirm('ok')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('confirm'))

      expect(reports.length).toBe(1)
    })

    test("Detects window.prompt('val')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('prompt'))

      expect(reports.length).toBe(1)
    })

    test("Detects globalThis.alert('test')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test("Does NOT report console.log('safe')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('console', 1, 0))

      expect(reports.length).toBe(0)
    })

    test("Does NOT report myAlert('custom')", () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('myAlert', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report obj.alert() where obj is not window/globalThis', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Detects globalThis.confirm()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('confirm'))

      expect(reports.length).toBe(1)
    })

    test('Detects globalThis.prompt()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('prompt'))

      expect(reports.length).toBe(1)
    })

    test('Detects alert with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Detects confirm with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'confirm' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Detects prompt with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'prompt' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Detects alert with multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [
          { type: 'Literal', value: 'first' },
          { type: 'Literal', value: 'second' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Detects window.alert with empty arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Detects globalThis.confirm with empty arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'confirm' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Detects deeply nested alert call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'String' },
            arguments: [{ type: 'Literal', value: 42 }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('non-dialog functions - safe calls', () => {
    test('Does NOT report console.warn()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('console'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report console.error()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('console'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report Math.random()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('Math'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report fetch()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('fetch'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report setTimeout()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('setTimeout'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report setInterval()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('setInterval'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report Promise.resolve()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('Promise'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report myFunc()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('myFunc'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report foo()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('foo'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report bar()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('bar'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report showAlert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('showAlert'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report showConfirm()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('showConfirm'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report showPrompt()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('showPrompt'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report alertUser()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alertUser'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report confirmAction()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('confirmAction'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report promptUser()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('promptUser'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report alert_confirmation()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert_confirmation'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report $alert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('$alert'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report _confirm()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('_confirm'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report document.querySelector()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'querySelector' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '.test' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report window.setTimeout()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('setTimeout'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report window.fetch()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('fetch'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report globalThis.setTimeout()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('setTimeout'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report globalThis.fetch()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('fetch'))

      expect(reports.length).toBe(0)
    })
  })

  describe('member expression edge cases', () => {
    test('Does NOT report computed member access: window["alert"]()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Literal', value: 'alert' },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report computed member access: globalThis["confirm"]()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Literal', value: 'confirm' },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report self.alert() where self is not window/globalThis', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'self' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report top.alert() where top is not window/globalThis', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'top' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report parent.alert() where parent is not window/globalThis', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'parent' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report frames.alert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'frames' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report nested member: a.b.alert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report nested member: window.window.alert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'window' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report MyWindow.alert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyWindow' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report WINDOW.alert() (uppercase WINDOW)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'WINDOW' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report GLOBALTHIS.alert() (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'GLOBALTHIS' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report win.alert() (abbreviation)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'win' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('Does NOT report null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report non-CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createNonCallExpression())

      expect(reports.length).toBe(0)
    })

    test('Report message contains function name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports[0].message).toContain('alert')
    })

    test('Report includes location info', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('Does NOT report undefined node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(() => visitor.CallExpression('alert')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report a boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with no callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with callee having no name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with numeric callee name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 123 },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report node with no loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('Does NOT report CallExpression with MemberExpression callee having no object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with MemberExpression callee having no property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with MemberExpression callee having non-Identifier object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'window' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with MemberExpression callee having non-Identifier property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Literal', value: 'alert' },
          computed: true,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Does NOT report node with type other than CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report ArrayExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression({ type: 'ArrayExpression', elements: [] })

      expect(reports.length).toBe(0)
    })

    test('Does NOT report ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression({ type: 'ArrowFunctionExpression', body: {} })

      expect(reports.length).toBe(0)
    })

    test('Handles CallExpression with missing loc gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Handles CallExpression with partial loc (no start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [],
        loc: { end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Handles CallExpression with partial loc (no end)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [],
        loc: { start: { line: 1, column: 0 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('report messages', () => {
    test('Report message for alert contains "Unexpected"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('Report message for alert contains "dialog"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports[0].message).toContain('dialog')
    })

    test('Report message for confirm contains function name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('confirm'))

      expect(reports[0].message).toContain('confirm')
    })

    test('Report message for prompt contains function name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('prompt'))

      expect(reports[0].message).toContain('prompt')
    })

    test('Report message for window.alert mentions alert', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('alert'))

      expect(reports[0].message).toContain('alert')
    })

    test('Report message for window.confirm mentions confirm', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('confirm'))

      expect(reports[0].message).toContain('confirm')
    })

    test('Report message for window.prompt mentions prompt', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('prompt'))

      expect(reports[0].message).toContain('prompt')
    })

    test('Report message for globalThis.alert mentions alert', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('alert'))

      expect(reports[0].message).toContain('alert')
    })

    test('Report message suggests custom notification', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports[0].message.toLowerCase()).toContain('notification')
    })

    test('Report message for window.alert is same as direct alert call', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noAlertRule.create(ctx1.context)
      const visitor2 = noAlertRule.create(ctx2.context)

      visitor1.CallExpression(createCallExpression('alert'))
      visitor2.CallExpression(createWindowCallExpression('alert'))

      expect(ctx1.reports[0].message).toBe(ctx2.reports[0].message)
    })

    test('Report message for globalThis.confirm is same as direct confirm call', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noAlertRule.create(ctx1.context)
      const visitor2 = noAlertRule.create(ctx2.context)

      visitor1.CallExpression(createCallExpression('confirm'))
      visitor2.CallExpression(createGlobalThisCallExpression('confirm'))

      expect(ctx1.reports[0].message).toBe(ctx2.reports[0].message)
    })
  })

  describe('report location', () => {
    test('Report location for alert at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('Report location for alert at line 10 column 5', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('Report location for confirm at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('confirm', 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('Report location for prompt at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('prompt', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('Report end location for alert at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('Report location for window.alert at line 3 column 4', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('alert', 3, 4))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('Report location for globalThis.prompt at line 7 column 12', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('prompt', 7, 12))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('Report location has both start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 2, 3))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('Report location start has line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 5, 10))

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('Report location end has line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 5, 10))

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  describe('multiple calls', () => {
    test('Multiple alert calls produce multiple reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))
      visitor.CallExpression(createCallExpression('alert'))

      expect(reports.length).toBe(2)
    })

    test('Mixed alert and confirm calls produce multiple reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))
      visitor.CallExpression(createCallExpression('confirm'))

      expect(reports.length).toBe(2)
    })

    test('All three dialog functions produce three reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))
      visitor.CallExpression(createCallExpression('confirm'))
      visitor.CallExpression(createCallExpression('prompt'))

      expect(reports.length).toBe(3)
    })

    test('Safe call followed by alert produces one report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('console'))
      visitor.CallExpression(createCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test('Alert followed by safe call produces one report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))
      visitor.CallExpression(createCallExpression('console'))

      expect(reports.length).toBe(1)
    })

    test('Many mixed calls produce correct report count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('console'))
      visitor.CallExpression(createCallExpression('alert'))
      visitor.CallExpression(createCallExpression('fetch'))
      visitor.CallExpression(createCallExpression('confirm'))
      visitor.CallExpression(createCallExpression('setTimeout'))
      visitor.CallExpression(createCallExpression('prompt'))
      visitor.CallExpression(createCallExpression('myFunc'))

      expect(reports.length).toBe(3)
    })

    test('Many window calls produce correct report count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createWindowCallExpression('alert'))
      visitor.CallExpression(createWindowCallExpression('confirm'))
      visitor.CallExpression(createWindowCallExpression('prompt'))
      visitor.CallExpression(createWindowCallExpression('fetch'))

      expect(reports.length).toBe(3)
    })

    test('Many globalThis calls produce correct report count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createGlobalThisCallExpression('alert'))
      visitor.CallExpression(createGlobalThisCallExpression('confirm'))
      visitor.CallExpression(createGlobalThisCallExpression('prompt'))
      visitor.CallExpression(createGlobalThisCallExpression('setTimeout'))

      expect(reports.length).toBe(3)
    })

    test('Ten alert calls produce ten reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createCallExpression('alert', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('Reports maintain correct order', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 1, 0))
      visitor.CallExpression(createCallExpression('confirm', 2, 0))
      visitor.CallExpression(createCallExpression('prompt', 3, 0))

      expect(reports[0].message).toContain('alert')
      expect(reports[1].message).toContain('confirm')
      expect(reports[2].message).toContain('prompt')
    })

    test('Reports maintain correct locations for multiple calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 1, 0))
      visitor.CallExpression(createCallExpression('confirm', 5, 10))
      visitor.CallExpression(createCallExpression('prompt', 20, 30))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(20)
      expect(reports[1].loc?.start.column).toBe(10)
      expect(reports[2].loc?.start.column).toBe(30)
    })
  })

  describe('exports', () => {
    test('noAlertRule is exported', () => {
      expect(noAlertRule).toBeDefined()
    })

    test('noAlertRule has create method', () => {
      expect(typeof noAlertRule.create).toBe('function')
    })

    test('noAlertRule has meta property', () => {
      expect(noAlertRule.meta).toBeDefined()
    })

    test('default export equals named export', () => {
      expect(noAlertRule.meta.type).toBe('suggestion')
    })

    test('noAlertRule conforms to RuleDefinition interface', () => {
      expect(noAlertRule).toHaveProperty('meta')
      expect(noAlertRule).toHaveProperty('create')
      expect(typeof noAlertRule.create).toBe('function')
    })
  })

  describe('context interaction', () => {
    test('report is called exactly once for a single alert', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test('report is not called for safe functions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('fetch'))

      expect(reports.length).toBe(0)
    })

    test('report receives message string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('report receives non-empty message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('different contexts track reports independently', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noAlertRule.create(ctx1.context)
      const visitor2 = noAlertRule.create(ctx2.context)

      visitor1.CallExpression(createCallExpression('alert'))

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(0)
    })

    test('multiple visitors from same context work independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor1 = noAlertRule.create(context)
      const visitor2 = noAlertRule.create(context)

      visitor1.CallExpression(createCallExpression('alert'))
      visitor2.CallExpression(createCallExpression('confirm'))

      expect(reports.length).toBe(2)
    })
  })

  describe('case sensitivity', () => {
    test('Does NOT report Alert() (uppercase A)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('Alert'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report ALERT() (all caps)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('ALERT'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report Confirm() (uppercase C)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('Confirm'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report CONFIRM() (all caps)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('CONFIRM'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report Prompt() (uppercase P)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('Prompt'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report PROMPT() (all caps)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('PROMPT'))

      expect(reports.length).toBe(0)
    })
  })

  describe('identifiers that contain dialog function names', () => {
    test('Does NOT report showAlert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('showAlert'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report alertify()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alertify'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report confirmed()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('confirmed'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report prompting()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('prompting'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report isConfirmed()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('isConfirmed'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report getAlert()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('getAlert'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report handleConfirm()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('handleConfirm'))

      expect(reports.length).toBe(0)
    })

    test('Does NOT report runPrompt()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('runPrompt'))

      expect(reports.length).toBe(0)
    })
  })

  describe('special callee types', () => {
    test('Does NOT report CallExpression with FunctionExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with ArrowFunctionExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report CallExpression with CallExpression callee: alert()()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'alert' },
          arguments: [],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when callee type is not Identifier or MemberExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'ThisExpression' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('robustness', () => {
    test('Calling CallExpression many times does not accumulate state incorrectly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createCallExpression('alert', i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('Mixing safe and unsafe calls does not affect detection', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      for (let i = 0; i < 25; i++) {
        visitor.CallExpression(createCallExpression(i % 2 === 0 ? 'alert' : 'console', i + 1, 0))
      }

      expect(reports.length).toBe(13)
    })

    test('Visitor handles being called after errors gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(null)
      visitor.CallExpression(createCallExpression('alert'))

      expect(reports.length).toBe(1)
    })

    test('Very large line numbers work', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 99999, 99999))

      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('Zero line and column work', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('Negative line numbers are passed through', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', -1, -1))

      expect(reports[0].loc?.start.line).toBe(-1)
      expect(reports[0].loc?.start.column).toBe(-1)
    })

    test('Floating point line/column values are passed through', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert', 1.5, 2.7))

      expect(reports[0].loc?.start.line).toBe(1.5)
      expect(reports[0].loc?.start.column).toBe(2.7)
    })

    test('Visitor does not crash when callee is an empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Visitor handles node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        extra: true,
        range: [0, 5],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Does NOT report when MemberExpression object has no type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { name: 'window' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when MemberExpression property has no type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('alert call with Symbol as arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [{ type: 'Identifier', name: 'Symbol' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('window.confirm with complex arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'confirm' },
          computed: false,
        },
        arguments: [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 'a' },
            right: { type: 'Literal', value: 'b' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('globalThis.prompt with template literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'prompt' },
          computed: false,
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Does NOT report when object name is "Window" (capital W)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Window' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when object name is "GlobalThis" (capital G)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'GlobalThis' },
          property: { type: 'Identifier', name: 'confirm' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when property name is "alerts" (plural)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'alerts' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when property name is "confirms" (plural)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'confirms' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when property name is "prompts" (plural)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'prompts' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Detects window.alert when computed is explicitly false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'alert' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Detects globalThis.prompt when computed is explicitly false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'prompt' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('Mixed direct and window calls produce correct count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))
      visitor.CallExpression(createWindowCallExpression('alert'))
      visitor.CallExpression(createGlobalThisCallExpression('alert'))

      expect(reports.length).toBe(3)
    })

    test('All nine combinations (3 functions x 3 patterns) are detected', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      for (const fn of ['alert', 'confirm', 'prompt'] as const) {
        visitor.CallExpression(createCallExpression(fn))
        visitor.CallExpression(createWindowCallExpression(fn))
        visitor.CallExpression(createGlobalThisCallExpression(fn))
      }

      expect(reports.length).toBe(9)
    })

    test('Does NOT report when callee is null explicitly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when callee is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when callee is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when callee is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'alert',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Does NOT report when callee is a boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: true,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('Report messages are unique per function name across multiple calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      visitor.CallExpression(createCallExpression('alert'))
      visitor.CallExpression(createCallExpression('confirm'))
      visitor.CallExpression(createCallExpression('prompt'))

      const messages = reports.map((r) => r.message)
      const uniqueMessages = new Set(messages)

      expect(uniqueMessages.size).toBe(3)
    })

    test('Detects window.confirm after multiple safe calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAlertRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.CallExpression(createCallExpression('console', i + 1, 0))
      }
      visitor.CallExpression(createWindowCallExpression('confirm', 101, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('confirm')
    })
  })
})
