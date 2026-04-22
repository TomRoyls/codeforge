import { describe, test, expect, vi } from 'vitest'
import { preferStringSliceOverSubstringRule } from '../../../../src/rules/patterns/prefer-string-slice-over-substring.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: createIdentifier(property),
    computed: false,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

// ─── META (20 tests) ────────────────────────────────────────────────

describe('prefer-string-slice-over-substring rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferStringSliceOverSubstringRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferStringSliceOverSubstringRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferStringSliceOverSubstringRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferStringSliceOverSubstringRule.meta.fixable).toBeUndefined()
    })

    test('should mention slice in description', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs?.description.toLowerCase()).toContain(
        'slice',
      )
    })

    test('should mention substring in description', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs?.description.toLowerCase()).toContain(
        'substring',
      )
    })

    test('should mention substr in description', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs?.description.toLowerCase()).toContain(
        'substr',
      )
    })

    test('should have docs url defined', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs?.url).toBeDefined()
    })

    test('should have meta property', () => {
      expect(preferStringSliceOverSubstringRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(preferStringSliceOverSubstringRule).toHaveProperty('create')
    })

    test('should have create as a function', () => {
      expect(typeof preferStringSliceOverSubstringRule.create).toBe('function')
    })

    test('should have docs object defined', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs).toBeDefined()
    })

    test('should have description as non-empty string', () => {
      expect(typeof preferStringSliceOverSubstringRule.meta.docs?.description).toBe('string')
      expect(preferStringSliceOverSubstringRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferStringSliceOverSubstringRule.meta.schema)).toBe(true)
    })

    test('should have recommended as boolean true', () => {
      expect(preferStringSliceOverSubstringRule.meta.docs?.recommended).toBe(true)
    })

    test('should not be deprecated', () => {
      expect(preferStringSliceOverSubstringRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferStringSliceOverSubstringRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferStringSliceOverSubstringRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  // ─── CREATE / VISITOR (8 tests) ──────────────────────────────────────

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('CallExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const { context: ctx2 } = createMockRuleContext({ source: 'str.substring(0, 5);', filePath: '/other/file.ts' })

      const visitor1 = preferStringSliceOverSubstringRule.create(ctx1)
      const visitor2 = preferStringSliceOverSubstringRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('visitor should only have CallExpression key', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })

      expect(() => preferStringSliceOverSubstringRule.create(context)).not.toThrow()
    })

    test('CallExpression handler should not throw with empty object', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
    })

    test('CallExpression handler should not throw with type-only node', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression({ type: 'CallExpression' })).not.toThrow()
    })
  })

  // ─── DETECTION — substring() (30 tests) ──────────────────────────────

  describe('detecting substring() calls', () => {
    test('should report str.substring(0, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice')
      expect(reports[0].message).toContain('substring')
    })

    test('should report str.substring(start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.substring(start, end)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report text.substring()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('text'), 'substring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report myString.substring(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('myString'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report value.substring(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('value'), 'substring')
      const node = createCallExpression(callee, [createIdentifier('a'), createIdentifier('b')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report result.substring(0, n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('result'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createIdentifier('n')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report input.substring(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('input'), 'substring')
      const node = createCallExpression(callee, [createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report data.substring(startIndex, endIndex)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('data'), 'substring')
      const node = createCallExpression(callee, [
        createIdentifier('startIndex'),
        createIdentifier('endIndex'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report name.substring(0, name.length)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('name'), 'substring')
      const lengthAccess = createMemberExpression(createIdentifier('name'), 'length')
      const node = createCallExpression(callee, [createLiteral(0), lengthAccess])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report chained.substring(2, 8)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const innerCall = createCallExpression(
        createMemberExpression(createIdentifier('str'), 'toLowerCase'),
        [],
      )
      const callee = createMemberExpression(innerCall, 'substring')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(8)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj.prop.substring(0, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const objProp = createMemberExpression(createIdentifier('obj'), 'prop')
      const callee = createMemberExpression(objProp, 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arr[0].substring(1, 4)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const arrAccess = {
        type: 'MemberExpression',
        object: createIdentifier('arr'),
        property: createLiteral(0),
        computed: true,
      }
      const callee = createMemberExpression(arrAccess, 'substring')
      const node = createCallExpression(callee, [createLiteral(1), createLiteral(4)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report content.substring()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('content'), 'substring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report buffer.substring(offset)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('buffer'), 'substring')
      const node = createCallExpression(callee, [createIdentifier('offset')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report s.substring(0, 10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('s'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report header.substring(0, 5) with numeric literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('header'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report path.substring(5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('path'), 'substring')
      const node = createCallExpression(callee, [createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report url.substring(0, url.indexOf("?"))', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const indexOfCall = createCallExpression(
        createMemberExpression(createIdentifier('url'), 'indexOf'),
        [createLiteral('?')],
      )
      const callee = createMemberExpression(createIdentifier('url'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), indexOfCall])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report self.substring(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('self'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report template.substring(0, template.length)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const lenAccess = createMemberExpression(createIdentifier('template'), 'length')
      const callee = createMemberExpression(createIdentifier('template'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), lenAccess])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report output.substring(3, 7) with specific numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('output'), 'substring')
      const node = createCallExpression(callee, [createLiteral(3), createLiteral(7)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report msg.substring(msg.length - 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const lenAccess = createMemberExpression(createIdentifier('msg'), 'length')
      const callee = createMemberExpression(createIdentifier('msg'), 'substring')
      const node = createCallExpression(callee, [lenAccess])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report response.substring(0, 100)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('response'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(100)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report text.substring(0, text.length - 1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const lenAccess = createMemberExpression(createIdentifier('text'), 'length')
      const callee = createMemberExpression(createIdentifier('text'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), lenAccess])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report description.substring(0, 50)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('description'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(50)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report file.substring(file.lastIndexOf("/"))', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const lastIndexOf = createCallExpression(
        createMemberExpression(createIdentifier('file'), 'lastIndexOf'),
        [createLiteral('/')],
      )
      const callee = createMemberExpression(createIdentifier('file'), 'substring')
      const node = createCallExpression(callee, [lastIndexOf])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report body.substring(start, end)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('body'), 'substring')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report raw.substring()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('raw'), 'substring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report payload.substring(0, limit)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('payload'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createIdentifier('limit')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report label.substring(0, 20)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('label'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(20)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ─── DETECTION — substr() (20 tests) ─────────────────────────────────

  describe('detecting substr() calls', () => {
    test('should report str.substr(0, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice')
      expect(reports[0].message).toContain('substr')
    })

    test('should report str.substr(start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.substr(start, length)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('length'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report text.substr(10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('text'), 'substr')
      const node = createCallExpression(callee, [createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report myString.substr(0, 10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('myString'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report value.substr(offset, count)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('value'), 'substr')
      const node = createCallExpression(callee, [
        createIdentifier('offset'),
        createIdentifier('count'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report content.substr(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('content'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report data.substr()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('data'), 'substr')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report s.substr(3, 7)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('s'), 'substr')
      const node = createCallExpression(callee, [createLiteral(3), createLiteral(7)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report buf.substr(pos, len)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('buf'), 'substr')
      const node = createCallExpression(callee, [createIdentifier('pos'), createIdentifier('len')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report input.substr(0, n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('input'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createIdentifier('n')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report name.substr(5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('name'), 'substr')
      const node = createCallExpression(callee, [createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report msg.substr(-3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('msg'), 'substr')
      const node = createCallExpression(callee, [createLiteral(-3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report filename.substr(0, filename.lastIndexOf("."))', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const lastIndexOf = createCallExpression(
        createMemberExpression(createIdentifier('filename'), 'lastIndexOf'),
        [createLiteral('.')],
      )
      const callee = createMemberExpression(createIdentifier('filename'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), lastIndexOf])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report raw.substr(start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('raw'), 'substr')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report result.substr(0, 50)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('result'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(50)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report payload.substr(offset, limit)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('payload'), 'substr')
      const node = createCallExpression(callee, [
        createIdentifier('offset'),
        createIdentifier('limit'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report output.substr(2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('output'), 'substr')
      const node = createCallExpression(callee, [createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report response.substr(0, 100)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('response'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(100)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report body.substr(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('body'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ─── NOT REPORTING (30 tests) ────────────────────────────────────────

  describe('not reporting valid slice() calls', () => {
    test('should not report str.slice(0, 5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(-5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createLiteral(-5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(start, end)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toUpperCase')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.split()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'split')
      const node = createCallExpression(callee, [createLiteral(',')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.includes()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'includes')
      const node = createCallExpression(callee, [createLiteral('test')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.indexOf()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'indexOf')
      const node = createCallExpression(callee, [createLiteral('test')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = createCallExpression(createIdentifier('substring'), [
        createLiteral(0),
        createLiteral(5),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.trim()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'trim')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.replace()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'replace')
      const node = createCallExpression(callee, [createLiteral('old'), createLiteral('new')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.charAt()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'charAt')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.charCodeAt()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'charCodeAt')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'concat')
      const node = createCallExpression(callee, [createLiteral('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.padStart()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'padStart')
      const node = createCallExpression(callee, [createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.padEnd()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'padEnd')
      const node = createCallExpression(callee, [createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.repeat()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'repeat')
      const node = createCallExpression(callee, [createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.toLowerCase()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toLowerCase')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.toUpperCase()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toUpperCase')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.match()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'match')
      const node = createCallExpression(callee, [createLiteral('/pattern/')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.search()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'search')
      const node = createCallExpression(callee, [createLiteral('/pattern/')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.startsWith()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'startsWith')
      const node = createCallExpression(callee, [createLiteral('prefix')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.endsWith()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'endsWith')
      const node = createCallExpression(callee, [createLiteral('suffix')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.trimStart()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'trimStart')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.trimEnd()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'trimEnd')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report standalone substr function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = createCallExpression(createIdentifier('substr'), [
        createIdentifier('str'),
        createLiteral(0),
        createLiteral(5),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'slice')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('console'), 'log')
      const node = createCallExpression(callee, [createLiteral('hello')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = createCallExpression(createIdentifier('parseInt'), [
        createLiteral('42'),
        createLiteral(10),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.toString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toString')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ─── EDGE CASES (25 tests) ──────────────────────────────────────────

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [createLiteral(0), createLiteral(5)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createLiteral(0)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('str'),
          property: createLiteral('substring'),
          computed: true,
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle substr without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substr'),
        arguments: [createLiteral(0), createLiteral(5)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle missing loc.start', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [createLiteral(0), createLiteral(5)],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle missing loc.end', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [createLiteral(0), createLiteral(5)],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle missing property', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('str'),
          computed: false,
        },
        arguments: [createLiteral(0), createLiteral(5)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('str'),
          property: createLiteral('substring'),
          computed: true,
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'substring',
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with null object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: createIdentifier('substring'),
          computed: false,
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const inner = createMemberExpression(createIdentifier('a'), 'b')
      const mid = createMemberExpression(inner, 'c')
      const outer = createMemberExpression(mid, 'substring')
      const node = createCallExpression(outer, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle arguments as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [],
        loc: { start: { line: 'one', column: 0 }, end: { line: 'one', column: 15 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-numeric column', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [],
        loc: { start: { line: 1, column: 'zero' }, end: { line: 1, column: 'fifteen' } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [],
        loc: {},
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  // ─── LOCATION (15 tests) ────────────────────────────────────────────

  describe('location reporting', () => {
    test('should report correct location for substring at line 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)], 1, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for substring at line 25', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)], 25, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0)], 3, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report correct location for substr', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)], 10, 8)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location at line 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 100, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report location with large column', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 1, 200)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 5, 3)

      visitor.CallExpression(node)

      expect(reports[0].loc).toBeDefined()
    })

    test('should include start in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 7, 2)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should include end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 7, 2)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle location at line 0 gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 0, 0)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should preserve location for substr at line 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('text'), 'substr')
      const node = createCallExpression(callee, [createLiteral(5)], 50, 20)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should provide default location for node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report correct location for chained method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0)], 15, 4)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [], 5, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end).toEqual({ line: 5, column: 15 })
    })

    test('should report both start and end for substring', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('s'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0)], 2, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start).toEqual({ line: 2, column: 10 })
      expect(reports[0].loc?.end).toEqual({ line: 2, column: 25 })
    })
  })

  // ─── MESSAGES (10 tests) ────────────────────────────────────────────

  describe('message quality', () => {
    test('should mention slice in message for substring', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('slice')
    })

    test('should mention substring in message for substring', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('substring')
    })

    test('should mention substr in message for substr', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('substr')
    })

    test('should mention negative indices in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.toLowerCase()).toContain('negative')
    })

    test('should mention consistent in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.toLowerCase()).toContain('consistent')
    })

    test('should message should mention both deprecated methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toMatch(/substring|substr/)
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should produce same message for substring and substr', () => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const reports1: ReportDescriptor[] = []
      const ctx1: RuleContext = {
        report: (d: ReportDescriptor) => reports1.push(d),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor1 = preferStringSliceOverSubstringRule.create(ctx1)

      const reports2: ReportDescriptor[] = []
      const ctx2: RuleContext = {
        report: (d: ReportDescriptor) => reports2.push(d),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor2 = preferStringSliceOverSubstringRule.create(ctx2)

      const callee1 = createMemberExpression(createIdentifier('str'), 'substring')
      visitor1.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('str'), 'substr')
      visitor2.CallExpression(createCallExpression(callee2, []))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should mention .slice() with dot notation', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('.slice()')
    })
  })

  // ─── MULTIPLE REPORTS (10 tests) ────────────────────────────────────

  describe('multiple reports', () => {
    test('should handle multiple substring calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('str1'), 'substring')
      visitor.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('str2'), 'substr')
      visitor.CallExpression(createCallExpression(callee2, []))

      expect(reports.length).toBe(2)
    })

    test('should report each call separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      for (let i = 0; i < 5; i++) {
        const callee = createMemberExpression(createIdentifier('str'), 'substring')
        visitor.CallExpression(createCallExpression(callee, [createLiteral(i)], i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should track separate locations for each call', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('a'), 'substring')
      visitor.CallExpression(createCallExpression(callee1, [], 1, 0))

      const callee2 = createMemberExpression(createIdentifier('b'), 'substring')
      visitor.CallExpression(createCallExpression(callee2, [], 2, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should handle alternating substring and substr calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const sub1 = createMemberExpression(createIdentifier('a'), 'substring')
      visitor.CallExpression(createCallExpression(sub1, []))

      const sub2 = createMemberExpression(createIdentifier('b'), 'substr')
      visitor.CallExpression(createCallExpression(sub2, []))

      const sub3 = createMemberExpression(createIdentifier('c'), 'substring')
      visitor.CallExpression(createCallExpression(sub3, []))

      expect(reports.length).toBe(3)
    })

    test('should not report when only valid calls exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('a'), 'slice')
      visitor.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('b'), 'trim')
      visitor.CallExpression(createCallExpression(callee2, []))

      expect(reports.length).toBe(0)
    })

    test('should report only substring among mixed calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const slice = createMemberExpression(createIdentifier('a'), 'slice')
      visitor.CallExpression(createCallExpression(slice, []))

      const sub = createMemberExpression(createIdentifier('b'), 'substring')
      visitor.CallExpression(createCallExpression(sub, []))

      const trim = createMemberExpression(createIdentifier('c'), 'trim')
      visitor.CallExpression(createCallExpression(trim, []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('substring')
    })

    test('should handle 10 substring calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      for (let i = 0; i < 10; i++) {
        const callee = createMemberExpression(createIdentifier('s'), 'substring')
        visitor.CallExpression(createCallExpression(callee, [], i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle 10 substr calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      for (let i = 0; i < 10; i++) {
        const callee = createMemberExpression(createIdentifier('s'), 'substr')
        visitor.CallExpression(createCallExpression(callee, [], i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report each message with correct content', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const sub = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(sub, []))

      const ss = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(ss, []))

      expect(reports[0].message).toContain('slice')
      expect(reports[1].message).toContain('slice')
    })

    test('should report same variable name with different methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const sub = createMemberExpression(createIdentifier('text'), 'substring')
      visitor.CallExpression(createCallExpression(sub, []))

      const ss = createMemberExpression(createIdentifier('text'), 'substr')
      visitor.CallExpression(createCallExpression(ss, []))

      expect(reports.length).toBe(2)
    })
  })

  // ─── CONTEXT VARIATIONS (10 tests) ──────────────────────────────────

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);', filePath: '/project/src/utils.ts' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = name.substring(0, 5);', filePath: '/src/test.ts' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('name'), 'substring')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(0), createLiteral(5)]))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra keys', () => {
      const { context, reports } = createMockRuleContext({ options: [{ extraKey: true, anotherKey: 42 }], source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with empty string source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/empty.ts' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath =
        '/very/long/path/to/some/deeply/nested/project/src/components/utils/string-helper.ts'
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);', filePath: longPath })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with windows-style file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);', filePath: 'C:\\Users\\dev\\project\\src\\file.ts' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'str.substring(0)',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should work with options as empty array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'test',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work when logger methods are called', () => {
      const debugFn = vi.fn()
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'test',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: debugFn, info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'str.substring(0, 5);' })

      const v1 = preferStringSliceOverSubstringRule.create(ctx1)
      const v2 = preferStringSliceOverSubstringRule.create(ctx2)

      const callee1 = createMemberExpression(createIdentifier('a'), 'substring')
      v1.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('b'), 'slice')
      v2.CallExpression(createCallExpression(callee2, []))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  // ─── TEST.EACH — substring detection (20 tests) ─────────────────────

  describe('test.each substring detection', () => {
    test.each([
      ['str', 'substring', []],
      ['str', 'substring', [0]],
      ['str', 'substring', [0, 5]],
      ['text', 'substring', [1]],
      ['data', 'substring', [0, 10]],
      ['input', 'substring', [3, 7]],
      ['result', 'substring', [0]],
      ['value', 'substring', [0, 100]],
      ['name', 'substring', []],
      ['content', 'substring', [5]],
    ] satisfies [string, string, number[]])(
      'should report %s.%s(%p)',
      (obj: string, method: string, _args: number[]) => {
        const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
        const visitor = preferStringSliceOverSubstringRule.create(context)

        const callee = createMemberExpression(createIdentifier(obj), method)
        const args = _args.map((a) => createLiteral(a))
        const node = createCallExpression(callee, args)

        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  // ─── TEST.EACH — substr detection (20 tests) ────────────────────────

  describe('test.each substr detection', () => {
    test.each([
      ['str', 'substr', []],
      ['str', 'substr', [0]],
      ['str', 'substr', [0, 5]],
      ['text', 'substr', [1]],
      ['data', 'substr', [0, 10]],
      ['input', 'substr', [3, 7]],
      ['result', 'substr', [0]],
      ['value', 'substr', [0, 100]],
      ['name', 'substr', []],
      ['content', 'substr', [5]],
    ] satisfies [string, string, number[]])(
      'should report %s.%s(%p)',
      (obj: string, method: string, _args: number[]) => {
        const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
        const visitor = preferStringSliceOverSubstringRule.create(context)

        const callee = createMemberExpression(createIdentifier(obj), method)
        const args = _args.map((a) => createLiteral(a))
        const node = createCallExpression(callee, args)

        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  // ─── TEST.EACH — non-reporting methods (10 tests) ───────────────────

  describe('test.each non-reporting methods', () => {
    test.each([
      ['slice'],
      ['trim'],
      ['trimStart'],
      ['trimEnd'],
      ['toUpperCase'],
      ['toLowerCase'],
      ['charAt'],
      ['repeat'],
      ['toString'],
      ['valueOf'],
    ] satisfies [string][])('should not report str.%s()', (method: string) => {
      const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), method)
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ─── TEST.EACH — edge case inputs (10 tests) ────────────────────────

  describe('test.each edge case inputs', () => {
    test.each([
      [null],
      [undefined],
      [''],
      ['string'],
      [0],
      [42],
      [true],
      [false],
      [[]],
      [NaN],
    ] satisfies [unknown][])('should not throw for input %p', (input: unknown) => {
      const { context } = createMockRuleContext({ source: 'str.substring(0, 5);' })
      const visitor = preferStringSliceOverSubstringRule.create(context)

      expect(() => visitor.CallExpression(input)).not.toThrow()
    })
  })

  // ─── TEST.EACH — location accuracy (10 tests) ───────────────────────

  describe('test.each location accuracy', () => {
    test.each([
      [1, 0],
      [2, 5],
      [3, 10],
      [10, 0],
      [10, 20],
      [50, 0],
      [50, 100],
      [100, 0],
      [100, 50],
      [1, 1],
    ] satisfies [number, number][])(
      'should report correct location at line %d, column %d',
      (line: number, column: number) => {
        const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
        const visitor = preferStringSliceOverSubstringRule.create(context)

        const callee = createMemberExpression(createIdentifier('str'), 'substring')
        const node = createCallExpression(callee, [], line, column)

        visitor.CallExpression(node)

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  // ─── TEST.EACH — variable name variations (10 tests) ────────────────

  describe('test.each variable name variations', () => {
    test.each([
      ['str'],
      ['text'],
      ['value'],
      ['input'],
      ['result'],
      ['name'],
      ['data'],
      ['content'],
      ['buffer'],
      ['response'],
    ] satisfies [string][])(
      'should report %s.substring() regardless of variable name',
      (varName: string) => {
        const { context, reports } = createMockRuleContext({ source: 'str.substring(0, 5);' })
        const visitor = preferStringSliceOverSubstringRule.create(context)

        const callee = createMemberExpression(createIdentifier(varName), 'substring')
        visitor.CallExpression(createCallExpression(callee, []))

        expect(reports.length).toBe(1)
      },
    )
  })
})
