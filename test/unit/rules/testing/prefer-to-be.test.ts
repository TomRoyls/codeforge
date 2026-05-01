import { describe, test, expect, vi } from 'vitest'
import { preferToBeRule } from '../../../../src/rules/testing/prefer-to-be.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'expect(x).toBe(true);',
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

function createMatcherCall(
  matcherName: string,
  argument: unknown,
  hasNot = false,
  line = 1,
  column = 0,
): unknown {
  const expectCall = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [{ type: 'Identifier', name: 'x' }],
  }

  let calleeObject: unknown = expectCall

  if (hasNot) {
    calleeObject = {
      type: 'MemberExpression',
      object: expectCall,
      property: { type: 'Identifier', name: 'not' },
    }
  }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: calleeObject,
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [argument],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createObjectExpression(): unknown {
  return { type: 'ObjectExpression', properties: [] }
}

function createArrayExpression(): unknown {
  return { type: 'ArrayExpression', elements: [] }
}

function createTemplateLiteral(): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
    expressions: [],
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

function createBigIntLiteral(value: string): unknown {
  return { type: 'Literal', value, bigint: value }
}

describe('prefer-to-be rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferToBeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferToBeRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferToBeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have testing category', () => {
      expect(preferToBeRule.meta.docs?.category).toBe('testing')
    })

    test('should have description mentioning toBe', () => {
      expect(preferToBeRule.meta.docs?.description.toLowerCase()).toContain('tobe')
    })

    test('should have description mentioning primitives', () => {
      expect(preferToBeRule.meta.docs?.description.toLowerCase()).toContain('primitive')
    })

    test('should have description mentioning toBeNull', () => {
      expect(preferToBeRule.meta.docs?.description.toLowerCase()).toContain('tobenull')
    })

    test('should have description mentioning toBeUndefined', () => {
      expect(preferToBeRule.meta.docs?.description.toLowerCase()).toContain('tobeundefined')
    })

    test('should have correct docs URL', () => {
      expect(preferToBeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-to-be',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferToBeRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('no violations for correct usage', () => {
    test('should not report toBe with boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(true)))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBe with boolean false', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(false)))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBe with number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(42)))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBe with string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral('hello')))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBeNull', createIdentifier('')))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBeUndefined', createIdentifier('')))
      expect(reports).toHaveLength(0)
    })

    test('should not report toEqual with object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createObjectExpression()))
      expect(reports).toHaveLength(0)
    })

    test('should not report toEqual with array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createArrayExpression()))
      expect(reports).toHaveLength(0)
    })

    test('should not report toEqual with variable identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createIdentifier('myVar')))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBeDefined', createIdentifier('')))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBeTruthy', createIdentifier('')))
      expect(reports).toHaveLength(0)
    })

    test('should not report toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBeFalsy', createIdentifier('')))
      expect(reports).toHaveLength(0)
    })

    test('should not report not.toBe with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(true), true))
      expect(reports).toHaveLength(0)
    })

    test('should not report not.toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBeNull', createIdentifier(''), true))
      expect(reports).toHaveLength(0)
    })
  })

  describe('toEqual with primitive literals', () => {
    test('should report toEqual with boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(true)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(true)')
      expect(reports[0].message).toContain('toEqual(true)')
    })

    test('should report toEqual with boolean false', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(false)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(false)')
    })

    test('should report toEqual with number 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(0)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(0)')
    })

    test('should report toEqual with number 1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(1)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(1)')
    })

    test('should report toEqual with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(-1)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(-1)')
    })

    test('should report toEqual with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral('hello')))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain(`toBe('hello')`)
    })

    test('should report toEqual with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral('')))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("toBe('')")
    })

    test('should report toEqual with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createTemplateLiteral()))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(`${...}`)')
    })
  })

  describe('toBe with null', () => {
    test('should report toBe(null) and suggest toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(null)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeNull()')
      expect(reports[0].message).toContain('toBe(null)')
    })
  })

  describe('toBe with undefined', () => {
    test('should report toBe(undefined) and suggest toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(undefined)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined()')
      expect(reports[0].message).toContain('toBe(undefined)')
    })

    test('should report toBe with undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createIdentifier('undefined')))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined()')
    })
  })

  describe('toEqual with null', () => {
    test('should report toEqual(null) and suggest toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(null)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeNull()')
      expect(reports[0].message).toContain('toEqual(null)')
    })
  })

  describe('toEqual with undefined', () => {
    test('should report toEqual(undefined) and suggest toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(undefined)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined()')
      expect(reports[0].message).toContain('toEqual(undefined)')
    })

    test('should report toEqual with undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createIdentifier('undefined')))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined()')
    })
  })

  describe('toStrictEqual with null', () => {
    test('should report toStrictEqual(null) and suggest toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(null)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeNull()')
      expect(reports[0].message).toContain('toStrictEqual(null)')
    })
  })

  describe('toStrictEqual with undefined', () => {
    test('should report toStrictEqual(undefined) and suggest toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(undefined)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined()')
      expect(reports[0].message).toContain('toStrictEqual(undefined)')
    })
  })

  describe('.not chain handling', () => {
    test('should report .not.toBe(null) and suggest .not.toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(null), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeNull()')
      expect(reports[0].message).toContain('not.toBe(null)')
    })

    test('should report .not.toBe(undefined) and suggest .not.toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(undefined), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeUndefined()')
      expect(reports[0].message).toContain('not.toBe(undefined)')
    })

    test('should report .not.toEqual(null) and suggest .not.toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(null), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeNull()')
      expect(reports[0].message).toContain('not.toEqual(null)')
    })

    test('should report .not.toEqual(undefined) and suggest .not.toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(undefined), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeUndefined()')
    })

    test('should report .not.toStrictEqual(null) and suggest .not.toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(null), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeNull()')
    })

    test('should report .not.toStrictEqual(undefined) and suggest .not.toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(undefined), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeUndefined()')
    })

    test('should not report .not.toBe with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(true), true))
      expect(reports).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    test('should not report on matcher with no arguments', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(node)
      expect(reports).toHaveLength(0)
    })

    test('should not report on non-matcher call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [createLiteral(null)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression?.(node)
      expect(reports).toHaveLength(0)
    })

    test('should not report on other matchers like toContain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toContain', createLiteral('x')))
      expect(reports).toHaveLength(0)
    })

    test('should handle NaN identifier in toBe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createIdentifier('NaN')))
      expect(reports).toHaveLength(0)
    })

    test('should handle Infinity identifier in toBe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createIdentifier('Infinity')))
      expect(reports).toHaveLength(0)
    })

    test('should report toBe with void 0 (undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(
        createMatcherCall('toBe', createUnaryExpression('void', createLiteral(0))),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined()')
    })

    test('should handle BigInt literal in toBe', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createBigIntLiteral('0n')))
      expect(reports).toHaveLength(0)
    })

    test('should handle multiple violations in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(true)))
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(null)))
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(undefined)))
      expect(reports).toHaveLength(3)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(null), false, 5, 10))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not crash on node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.({ type: 'CallExpression', arguments: [] })
      expect(reports).toHaveLength(0)
    })

    test('should not crash on null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(null)
      expect(reports).toHaveLength(0)
    })

    test('should not crash on undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(undefined)
      expect(reports).toHaveLength(0)
    })

    test('should not report toBe with regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      const regexArg = { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }
      visitor.CallExpression?.(createMatcherCall('toBe', regexArg))
      expect(reports).toHaveLength(0)
    })

    test('should handle callee as Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toEqual' },
        arguments: [createLiteral(null)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression?.(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle toBe with computed property', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Literal', value: 'toBe' },
          computed: true,
        },
        arguments: [createLiteral(null)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(preferToBeRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(preferToBeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferToBeRule.meta.severity).toBe('warn')
    })

    test('should have description mentioning toBe', () => {
      expect(preferToBeRule.meta.docs?.description).toContain('toBe')
    })

    test('should have correct docs URL', () => {
      expect(preferToBeRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/prefer-to-be')
    })

    test('should have recommended set to true', () => {
      expect(preferToBeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have create function', () => {
      expect(typeof preferToBeRule.create).toBe('function')
    })

    test('should have meta defined', () => {
      expect(preferToBeRule.meta).toBeDefined()
    })
  })

  describe('toStrictEqual with null and undefined', () => {
    test('suggests toBeNull for toStrictEqual(null)', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toStrictEqual' },
        },
        arguments: [createLiteral(null)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeNull')
    })

    test('suggests toBeUndefined for toStrictEqual(undefined)', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toStrictEqual' },
        },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined')
    })

    test('does not suggest for toStrictEqual with string', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toStrictEqual' },
        },
        arguments: [createLiteral('hello')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockContext()
      preferToBeRule.create(context).CallExpression?.(node)
      expect(reports).toHaveLength(0)
    })

    test('does not suggest for toStrictEqual with number', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toStrictEqual' },
        },
        arguments: [createLiteral(42)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockContext()
      preferToBeRule.create(context).CallExpression?.(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('multiple independent visitors', () => {
    test('separate visitors do not share state', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const node1 = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [createLiteral(null)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const node2 = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'y' }] },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      }

      preferToBeRule.create(ctx1).CallExpression?.(node1)
      preferToBeRule.create(ctx2).CallExpression?.(node2)

      expect(r1).toHaveLength(1)
      expect(r2).toHaveLength(0)
    })
  })

  describe('location reporting', () => {
    test('reports correct location for violation', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toEqual' },
        },
        arguments: [createLiteral(undefined)],
        loc: { start: { line: 10, column: 5 }, end: { line: 10, column: 30 } },
      }
      const { context, reports } = createMockContext()
      preferToBeRule.create(context).CallExpression?.(node)
      expect(reports[0].loc).toEqual({ start: { line: 10, column: 5 }, end: { line: 10, column: 30 } })
    })

    test('reports location at line 1 column 0 by default', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [createLiteral(null)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockContext()
      preferToBeRule.create(context).CallExpression?.(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('additional coverage', () => {
    test('reports toEqual with string template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createTemplateLiteral()))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe')
    })

    test('does not report toBe with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createObjectExpression()))
      expect(reports).toHaveLength(0)
    })

    test('does not report toBe with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createArrayExpression()))
      expect(reports).toHaveLength(0)
    })

    test('reports toEqual with boolean false', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(false)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(false)')
    })

    test('reports toBe with undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createIdentifier('undefined')))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined')
    })

    test('reports toBe with void 0 unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createUnaryExpression('void', createLiteral(0))))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined')
    })

    test('does not report toBe with NaN identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createIdentifier('NaN')))
      expect(reports).toHaveLength(0)
    })

    test('does not report toBe with Infinity identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createIdentifier('Infinity')))
      expect(reports).toHaveLength(0)
    })

    test('reports toEqual with null and not prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createLiteral(null), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeNull')
    })

    test('reports toStrictEqual with null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(null)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeNull')
    })

    test('reports toStrictEqual with undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(undefined)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBeUndefined')
    })

    test('reports toBe with null and not prefix uses not.toBeNull', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createLiteral(null), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeNull')
    })

    test('reports toBe with undefined identifier and not prefix uses not.toBeUndefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toBe', createIdentifier('undefined'), true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('not.toBeUndefined')
    })
  })

  describe('toEqual with unary number expressions', () => {
    test('should report toEqual with unary minus expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(
        createMatcherCall('toEqual', createUnaryExpression('-', createLiteral(1))),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(-1)')
    })

    test('should report toEqual with unary plus expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(
        createMatcherCall('toEqual', createUnaryExpression('+', createLiteral(1))),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(+1)')
    })
  })

  describe('toEqual with NaN and Infinity identifiers', () => {
    test('should report toEqual with NaN identifier as primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createIdentifier('NaN')))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(NaN)')
    })

    test('should report toEqual with Infinity identifier as primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toEqual', createIdentifier('Infinity')))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('toBe(Infinity)')
    })
  })

  describe('toStrictEqual with primitives', () => {
    test('should not report toStrictEqual with boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = preferToBeRule.create(context)
      visitor.CallExpression?.(createMatcherCall('toStrictEqual', createLiteral(true)))
      expect(reports).toHaveLength(0)
    })
  })
})
