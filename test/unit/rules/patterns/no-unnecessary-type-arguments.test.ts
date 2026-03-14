import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryTypeArgumentsRule } from '../../../../src/rules/patterns/no-unnecessary-type-arguments.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new Array<string>()',
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

function createNewExpression(
  calleeName: string,
  typeParams: string[],
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    typeArguments: {
      type: 'TypeParameterInstantiation',
      params: typeParams.map((t) => ({ type: 'GenericTypeAnnotation', id: { name: t } })),
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createCallExpression(
  calleeName: string,
  typeParams: string[],
  args: unknown[] = [],
  isMember = false,
  objectName?: string,
  line = 1,
  column = 0,
): unknown {
  const callee = isMember
    ? {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: objectName ?? '' },
        property: { type: 'Identifier', name: calleeName },
      }
    : { type: 'Identifier', name: calleeName }

  return {
    type: 'CallExpression',
    callee,
    typeArguments: {
      type: 'TypeParameterInstantiation',
      params: typeParams.map((t) => ({ type: 'GenericTypeAnnotation', id: { name: t } })),
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-unnecessary-type-arguments rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.fixable).toBeUndefined()
    })

    test('should mention type arguments in description', () => {
      expect(noUnnecessaryTypeArgumentsRule.meta.docs?.description.toLowerCase()).toContain(
        'type argument',
      )
    })
  })

  describe('detecting unnecessary type arguments in new expressions', () => {
    test('should report new Array<string>() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Array', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('array')
    })

    test('should report new Array<number>() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(
        createNewExpression('Array', ['number'], [{ type: 'Literal', value: 1 }]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('inferred')
    })

    test('should report new Map<string, number>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Map', ['string', 'number']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('map')
    })

    test('should report new Set<string>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Set', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('set')
    })

    test('should report new Promise<string>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', ['string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise')
    })

    test('should report new WeakMap<object, string>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakMap', ['object', 'string']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('weakmap')
    })

    test('should report new WeakSet<object>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('WeakSet', ['object']))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('weakset')
    })

    test('should not report new expressions without type arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createNewExpression('Array', [])
      delete (node as Record<string, unknown>).typeArguments
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unknown constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.NewExpression(createNewExpression('CustomClass', ['string']))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting unnecessary type arguments in call expressions', () => {
    test('should report Promise.resolve<string>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('resolve', ['string'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.resolve')
    })

    test('should report Promise.all<string[]>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('all', ['string[]'], [], true, 'Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('promise.all')
    })

    test('should report Array.from<string>()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('from', ['string'], [], true, 'Array'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('array.from')
    })

    test('should not report call expressions without type arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createCallExpression('resolve', [], [], true, 'Promise')
      delete (node as Record<string, unknown>).typeArguments
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report unknown function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      visitor.CallExpression(createCallExpression('customMethod', ['string'], [], true, 'Custom'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createNewExpression('Array', ['string'])
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = createNewExpression('Array', ['string'], [], 10, 5)
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        typeArguments: { params: [{ type: 'GenericTypeAnnotation' }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty type arguments params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeArgumentsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        typeArguments: { params: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
