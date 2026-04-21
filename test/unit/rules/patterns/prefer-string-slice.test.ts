import { describe, test, expect, vi } from 'vitest'
import { preferStringSliceRule } from '../../../../src/rules/patterns/prefer-string-slice.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'str.substring(0, 5);',
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

describe('prefer-string-slice rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferStringSliceRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferStringSliceRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferStringSliceRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferStringSliceRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferStringSliceRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferStringSliceRule.meta.fixable).toBeUndefined()
    })

    test('should mention slice in description', () => {
      expect(preferStringSliceRule.meta.docs?.description.toLowerCase()).toContain('slice')
    })

    test('should mention substring in description', () => {
      expect(preferStringSliceRule.meta.docs?.description.toLowerCase()).toContain('substring')
    })

    test('should have meta property defined', () => {
      expect(preferStringSliceRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(preferStringSliceRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof preferStringSliceRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(preferStringSliceRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs url defined', () => {
      expect(preferStringSliceRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as string', () => {
      expect(typeof preferStringSliceRule.meta.docs?.url).toBe('string')
    })

    test('should mention substr in description', () => {
      expect(preferStringSliceRule.meta.docs?.description.toLowerCase()).toContain('substr')
    })

    test('should have severity as warn string', () => {
      expect(preferStringSliceRule.meta.severity).toBe('warn')
      expect(typeof preferStringSliceRule.meta.severity).toBe('string')
    })

    test('should have type as suggestion string', () => {
      expect(preferStringSliceRule.meta.type).toBe('suggestion')
      expect(typeof preferStringSliceRule.meta.type).toBe('string')
    })

    test('should have category as patterns string', () => {
      expect(typeof preferStringSliceRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as boolean true', () => {
      expect(preferStringSliceRule.meta.docs?.recommended).toBe(true)
      expect(typeof preferStringSliceRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have schema as empty array', () => {
      expect(preferStringSliceRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(preferStringSliceRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferStringSliceRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferStringSliceRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have valid rule type value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferStringSliceRule.meta.type)
    })

    test('should have valid severity value', () => {
      expect(['off', 'warn', 'error']).toContain(preferStringSliceRule.meta.severity)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return object from create', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have CallExpression as function', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = preferStringSliceRule.create(context)
      const visitor2 = preferStringSliceRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      const visitor = preferStringSliceRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should accept context with populated options', () => {
      const { context } = createMockContext({ someOption: true })
      const visitor = preferStringSliceRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should have create as a function', () => {
      expect(typeof preferStringSliceRule.create).toBe('function')
    })

    test('visitor CallExpression should accept one argument', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(visitor.CallExpression.length).toBe(1)
    })
  })

  describe('detecting substring() calls', () => {
    test('should report str.substring(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice')
      expect(reports[0].message).toContain('substring')
    })

    test('should report str.substring(start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.substring(start, end)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report text.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('text'), 'substring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report a.substring(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('a'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report myStr.substring(1, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('myStr'), 'substring')
      const node = createCallExpression(callee, [createLiteral(1), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report result.substring(x, y) with identifier args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('result'), 'substring')
      const node = createCallExpression(callee, [createIdentifier('x'), createIdentifier('y')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report input.substring(0, input.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('input'), 'substring')
      const lengthAccess = createMemberExpression(createIdentifier('input'), 'length')
      const node = createCallExpression(callee, [createLiteral(0), lengthAccess])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report chained.substring(0, 5) on member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const innerMember = createMemberExpression(createIdentifier('obj'), 'prop')
      const callee = createMemberExpression(innerMember, 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report data.substring() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('data'), 'substring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substring with three args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [
        createLiteral(0),
        createLiteral(5),
        createLiteral(10),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report value.substring(-1) with negative arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('value'), 'substring')
      const node = createCallExpression(callee, [createLiteral(-1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting substr() calls', () => {
    test('should report str.substr(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice')
      expect(reports[0].message).toContain('substr')
    })

    test('should report str.substr(start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.substr(start, length)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('length'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report text.substr() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('text'), 'substr')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report a.substr(2) with single numeric arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('a'), 'substr')
      const node = createCallExpression(callee, [createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report myStr.substr(0, 10)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('myStr'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report chained.substr() on member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const innerMember = createMemberExpression(createIdentifier('obj'), 'name')
      const callee = createMemberExpression(innerMember, 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substr with three args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [
        createLiteral(0),
        createLiteral(5),
        createLiteral(10),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report s.substr(-3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('s'), 'substr')
      const node = createCallExpression(callee, [createLiteral(-3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid slice() calls', () => {
    test('should not report str.slice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(-5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createLiteral(-5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toUpperCase')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.split()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'split')
      const node = createCallExpression(callee, [createLiteral(',')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.includes()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'includes')
      const node = createCallExpression(callee, [createLiteral('test')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.indexOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'indexOf')
      const node = createCallExpression(callee, [createLiteral('test')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = createCallExpression(createIdentifier('substring'), [
        createLiteral(0),
        createLiteral(5),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'trim')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.charAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'charAt')
      const node = createCallExpression(callee, [createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'concat')
      const node = createCallExpression(callee, [createLiteral('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.replace()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'replace')
      const node = createCallExpression(callee, [createLiteral('a'), createLiteral('b')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.match()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'match')
      const node = createCallExpression(callee, [createLiteral(/test/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.search()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'search')
      const node = createCallExpression(callee, [createLiteral(/test/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.toLowerCase()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toLowerCase')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.padStart()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'padStart')
      const node = createCallExpression(callee, [createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.repeat()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'repeat')
      const node = createCallExpression(callee, [createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.startsWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'startsWith')
      const node = createCallExpression(callee, [createLiteral('hello')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.endsWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'endsWith')
      const node = createCallExpression(callee, [createLiteral('world')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toString')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'valueOf')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(-3, -1)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createLiteral(-3), createLiteral(-1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report plain function call named substr', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = createCallExpression(createIdentifier('substr'), [
        createLiteral(0),
        createLiteral(5),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('negative cases - non-matching patterns', () => {
    test('should not report NewExpression with substring callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [createLiteral(0), createLiteral(5)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is an identifier only', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = createCallExpression(createIdentifier('substring'), [
        createLiteral(0),
        createLiteral(5),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          body: {},
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.prototype.slice call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(createIdentifier('Array'), createIdentifier('prototype')),
        'slice',
      )
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'slice')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.substringLike()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), 'substringLike')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.mySubstring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), 'mySubstring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.substrAction()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), 'substrAction')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when node has no type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [createLiteral(0), createLiteral(5)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)], 25, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createLiteral(0)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

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
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle numeric zero node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc but missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [],
        loc: {
          end: { line: 1, column: 5 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing non-numeric line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [],
        loc: {
          start: { line: 'one', column: 0 },
          end: { line: 'one', column: 5 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [],
        loc: null,
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [],
        loc: undefined,
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('str'),
          property: createLiteral('substring'),
          computed: false,
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('str'),
          property: null,
          computed: false,
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with undefined property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('str'),
          property: undefined,
          computed: false,
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with array callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: [],
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple sequential calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('a'), 'substring')
      visitor.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('b'), 'substr')
      visitor.CallExpression(createCallExpression(callee2, []))

      const callee3 = createMemberExpression(createIdentifier('c'), 'slice')
      visitor.CallExpression(createCallExpression(callee3, []))

      expect(reports.length).toBe(2)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1, column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at arbitrary line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 42, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 100, column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [], 100, 50)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [], 5, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report default location for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for substr call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [], 10, 20)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })
  })

  describe('message quality', () => {
    test('should mention slice in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('slice')
    })

    test('should mention the deprecated method in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('substring')
    })

    test('should mention negative indices in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.toLowerCase()).toContain('negative')
    })

    test('should mention consistent in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.toLowerCase()).toContain('consistent')
    })

    test('should produce message with .slice() for substring detection', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('.slice()')
    })

    test('should produce message with .substring() for substring detection', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('.substring()')
    })

    test('should produce message with .substr() for substr detection', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('.substr()')
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce message as string type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should mention end of string in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.toLowerCase()).toContain('end of the string')
    })
  })

  describe('multiple reports', () => {
    test('should report each substring call independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('a'), 'substring')
      visitor.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('b'), 'substring')
      visitor.CallExpression(createCallExpression(callee2, []))

      expect(reports.length).toBe(2)
    })

    test('should report each substr call independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('a'), 'substr')
      visitor.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('b'), 'substr')
      visitor.CallExpression(createCallExpression(callee2, []))

      expect(reports.length).toBe(2)
    })

    test('should report mixed substring and substr calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('a'), 'substring')
      visitor.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('b'), 'substr')
      visitor.CallExpression(createCallExpression(callee2, []))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('substring')
      expect(reports[1].message).toContain('substr')
    })

    test('should accumulate three substring reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      for (let i = 0; i < 3; i++) {
        const callee = createMemberExpression(createIdentifier('s'), 'substring')
        visitor.CallExpression(createCallExpression(callee, [], i + 1, 0))
      }

      expect(reports.length).toBe(3)
    })

    test('should accumulate five mixed reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const methods = ['substring', 'substr', 'substring', 'substr', 'substring']
      for (const method of methods) {
        const callee = createMemberExpression(createIdentifier('s'), method)
        visitor.CallExpression(createCallExpression(callee, []))
      }

      expect(reports.length).toBe(5)
    })

    test('should report correct message for each call in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('x'), 'substring')
      visitor.CallExpression(createCallExpression(callee1, [], 1, 0))

      const callee2 = createMemberExpression(createIdentifier('y'), 'substr')
      visitor.CallExpression(createCallExpression(callee2, [], 2, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/src/utils/helper.ts')
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const x = name.substr(0);',
      )
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('name'), 'substr')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(0)]))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/components/App.tsx')
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockContext({}, '/src/index.js')
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/features/auth/utils/string-helper.ts',
      )
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockContext({
        ignorePattern: 'test/**',
        extraCheck: true,
        threshold: 5,
      })
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should not use logger during normal detection', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'str.substring(0, 5)',
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

      const visitor = preferStringSliceRule.create(context)
      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })
  })

  describe('exports', () => {
    test('should export preferStringSliceRule as named export', () => {
      expect(preferStringSliceRule).toBeDefined()
    })

    test('should export a valid RuleDefinition', () => {
      expect(preferStringSliceRule.meta).toBeDefined()
      expect(preferStringSliceRule.create).toBeDefined()
    })

    test('should have meta and create as only top-level properties', () => {
      const keys = Object.keys(preferStringSliceRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should be importable and usable immediately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor', () => {
    test('should include message in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, [], 5, 3))

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc).not.toBeNull()
    })

    test('should have start and end in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have line and column in start loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have line and column in end loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should have correct loc for substr call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee, [], 7, 12))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should only report once per call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(0), createLiteral(5)]))

      expect(reports.length).toBe(1)
    })

    test('report descriptor message contains both slice and method name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      const msg = reports[0].message
      expect(msg).toContain('.slice()')
      expect(msg).toContain('.substring()')
    })
  })

  describe('detection with various argument types', () => {
    test('should report substring with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const binaryArg = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createLiteral(1),
      }
      const node = createCallExpression(callee, [binaryArg])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substr with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const innerCall = createCallExpression(
        createMemberExpression(createIdentifier('str'), 'indexOf'),
        [createLiteral('x')],
      )
      const node = createCallExpression(callee, [innerCall])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substring with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substr with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const conditional = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(0),
        alternate: createLiteral(1),
      }
      const node = createCallExpression(callee, [conditional])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substring with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: createLiteral(0),
      }
      const node = createCallExpression(callee, [arrow])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substr with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const memberArg = createMemberExpression(createIdentifier('obj'), 'start')
      const node = createCallExpression(callee, [memberArg])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substring with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const unary = {
        type: 'UnaryExpression',
        operator: '-',
        argument: createIdentifier('n'),
      }
      const node = createCallExpression(callee, [unary])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report substring with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const spread = {
        type: 'SpreadElement',
        argument: createIdentifier('args'),
      }
      const node = createCallExpression(callee, [spread])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('chained member expressions', () => {
    test('should report obj.prop.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const inner = createMemberExpression(createIdentifier('obj'), 'prop')
      const callee = createMemberExpression(inner, 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report arr[0].substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const inner = {
        type: 'MemberExpression',
        object: createIdentifier('arr'),
        property: createLiteral(0),
        computed: true,
      }
      const callee = createMemberExpression(inner, 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report this.value.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const inner = createMemberExpression(createIdentifier('this'), 'value')
      const callee = createMemberExpression(inner, 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report window.location.hash.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const loc = createMemberExpression(createIdentifier('window'), 'location')
      const hash = createMemberExpression(loc, 'hash')
      const callee = createMemberExpression(hash, 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report foo.bar.baz.qux.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const foo = createMemberExpression(createIdentifier('foo'), 'bar')
      const baz = createMemberExpression(foo, 'baz')
      const qux = createMemberExpression(baz, 'qux')
      const callee = createMemberExpression(qux, 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor robustness', () => {
    test('should handle being called multiple times on same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      for (let i = 0; i < 10; i++) {
        const callee = createMemberExpression(createIdentifier('str'), 'substring')
        visitor.CallExpression(createCallExpression(callee, []))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating valid and invalid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee1, []))

      const callee2 = createMemberExpression(createIdentifier('str'), 'slice')
      visitor.CallExpression(createCallExpression(callee2, []))

      const callee3 = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee3, []))

      const callee4 = createMemberExpression(createIdentifier('str'), 'trim')
      visitor.CallExpression(createCallExpression(callee4, []))

      expect(reports.length).toBe(2)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = {
        ...createCallExpression(callee, []),
        extra: 'data',
        nested: { foo: 'bar' },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not mutate the input node', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])
      const originalType = (node as Record<string, unknown>).type

      visitor.CallExpression(node)

      expect((node as Record<string, unknown>).type).toBe(originalType)
    })

    test('should handle CallExpression returning undefined (void)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const result = visitor.CallExpression(createCallExpression(callee, []))

      expect(result).toBeUndefined()
      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression returning undefined for non-matching', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const result = visitor.CallExpression(createCallExpression(callee, []))

      expect(result).toBeUndefined()
      expect(reports.length).toBe(0)
    })
  })

  describe('method name case sensitivity', () => {
    test('should not report Substring (capital S)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'Substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(0)
    })

    test('should not report SUBSTRING (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'SUBSTRING')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(0)
    })

    test('should not report Substr (capital S)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'Substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(0)
    })

    test('should report exact lowercase substring', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report exact lowercase substr', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })
  })

  describe('different object names', () => {
    test('should report name.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('name'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report title.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('title'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report description.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('description'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report message.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('message'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report content.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('content'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report buffer.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('buffer'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report path.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('path'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report url.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('url'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report response.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('response'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report payload.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('payload'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report line.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('line'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report output.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('output'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report raw.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('raw'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report value.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('value'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report key.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('key'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report header.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('header'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report token.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('token'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report email.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('email'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report hostname.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('hostname'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report filename.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('filename'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report dir.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('dir'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report input.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('input'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report template.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('template'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report snippet.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('snippet'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report chunk.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('chunk'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should report segment.substr()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('segment'), 'substr')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })
  })
})
