import { describe, test, expect, vi } from 'vitest'
import { noAliasMethodsRule } from '../../../../src/rules/testing/no-alias-methods.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
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
    getSource: () => '',
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

function createAliasCall(aliasName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: aliasName },
    arguments: [
      { type: 'Literal', value: 'test name' },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createRegularCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

function createMemberCall(objectName: string, propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [
      { type: 'Literal', value: 'test name' },
      { type: 'ArrowFunctionExpression', async: false, body: { type: 'BlockStatement' } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-alias-methods rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noAliasMethodsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noAliasMethodsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noAliasMethodsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noAliasMethodsRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(noAliasMethodsRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning alias', () => {
      const desc = noAliasMethodsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('alias')
    })

    test('should have correct description mentioning .only() and .skip()', () => {
      const desc = noAliasMethodsRule.meta.docs?.description ?? ''
      expect(desc).toContain('.only()')
      expect(desc).toContain('.skip()')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting skip aliases', () => {
    test('should report xit as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit'))

      expect(reports.length).toBe(1)
    })

    test('should report xtest as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xtest'))

      expect(reports.length).toBe(1)
    })

    test('should report xdescribe as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xdescribe'))

      expect(reports.length).toBe(1)
    })

    test('should report xcontext as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xcontext'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for xit', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit', 7, 4))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('detecting focus aliases', () => {
    test('should report fit as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fit'))

      expect(reports.length).toBe(1)
    })

    test('should report ftest as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('ftest'))

      expect(reports.length).toBe(1)
    })

    test('should report fdescribe as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fdescribe'))

      expect(reports.length).toBe(1)
    })

    test('should report fcontext as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fcontext'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location for fdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fdescribe', 12, 8))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('report message format', () => {
    test('should show xit → it.skip in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit'))

      expect(reports[0].message).toContain("Unexpected alias 'xit'")
      expect(reports[0].message).toContain("'it.skip'")
    })

    test('should show xtest → test.skip in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xtest'))

      expect(reports[0].message).toContain("Unexpected alias 'xtest'")
      expect(reports[0].message).toContain("'test.skip'")
    })

    test('should show fit → it.only in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fit'))

      expect(reports[0].message).toContain("Unexpected alias 'fit'")
      expect(reports[0].message).toContain("'it.only'")
    })

    test('should show fdescribe → describe.only in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fdescribe'))

      expect(reports[0].message).toContain("Unexpected alias 'fdescribe'")
      expect(reports[0].message).toContain("'describe.only'")
    })

    test('should show xdescribe → describe.skip in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xdescribe'))

      expect(reports[0].message).toContain("Unexpected alias 'xdescribe'")
      expect(reports[0].message).toContain("'describe.skip'")
    })

    test('should show fcontext → context.only in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fcontext'))

      expect(reports[0].message).toContain("Unexpected alias 'fcontext'")
      expect(reports[0].message).toContain("'context.only'")
    })

    test('should show xcontext → context.skip in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xcontext'))

      expect(reports[0].message).toContain("Unexpected alias 'xcontext'")
      expect(reports[0].message).toContain("'context.skip'")
    })

    test('should show ftest → test.only in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('ftest'))

      expect(reports[0].message).toContain("Unexpected alias 'ftest'")
      expect(reports[0].message).toContain("'test.only'")
    })
  })

  describe('valid cases', () => {
    test('should not report regular it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createRegularCall('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createRegularCall('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular describe() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createRegularCall('describe'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular context() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createRegularCall('context'))

      expect(reports.length).toBe(0)
    })

    test('should not report it.only() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('it', 'only'))

      expect(reports.length).toBe(0)
    })

    test('should not report it.skip() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('it', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('should not report test.only() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'only'))

      expect(reports.length).toBe(0)
    })

    test('should not report describe.skip() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('describe', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('should not report unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createRegularCall('console'))
      visitor.CallExpression(createRegularCall('myFunc'))
      visitor.CallExpression(createRegularCall('assert'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('xit', 'something'))

      expect(reports.length).toBe(0)
    })

    test('should report multiple aliases independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit', 1, 0))
      visitor.CallExpression(createAliasCall('fit', 5, 0))
      visitor.CallExpression(createAliasCall('xdescribe', 10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report correct lines for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit', 2, 4))
      visitor.CallExpression(createAliasCall('fit', 8, 2))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(8)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [
          { type: 'Literal', value: 'test name' },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with numeric name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 123 },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report alias even when node lacks arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 12 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('xit')
    })
  })

  describe('independent visitor instances', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noAliasMethodsRule.create(ctx1)
      const visitor2 = noAliasMethodsRule.create(ctx2)

      visitor1.CallExpression(createAliasCall('xit'))
      visitor2.CallExpression(createAliasCall('fit'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
      expect(rep1[0].message).toContain('xit')
      expect(rep2[0].message).toContain('fit')
    })
  })

  describe('rule meta expanded', () => {
    test('should have a docs.url property', () => {
      expect(noAliasMethodsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing codeforge', () => {
      expect(noAliasMethodsRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noAliasMethodsRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noAliasMethodsRule.meta.schema).toHaveLength(0)
    })

    test('should have meta as a plain object', () => {
      expect(typeof noAliasMethodsRule.meta).toBe('object')
      expect(noAliasMethodsRule.meta).not.toBeNull()
      expect(Array.isArray(noAliasMethodsRule.meta)).toBe(false)
    })
  })

  describe('all aliases detected', () => {
    test('should detect all 8 aliases in a single visitor pass', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const aliases = ['xit', 'xtest', 'xdescribe', 'xcontext', 'fit', 'ftest', 'fdescribe', 'fcontext']
      for (const alias of aliases) {
        visitor.CallExpression(createAliasCall(alias))
      }

      expect(reports.length).toBe(8)
    })
  })

  describe('default export', () => {
    test('default export should be defined', async () => {
      const mod = await import('../../../../src/rules/testing/no-alias-methods.js')
      expect(mod.default).toBeDefined()
      expect(mod.default).toBe(noAliasMethodsRule)
    })
  })

  describe('report message format', () => {
    test('message follows "Unexpected alias" pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit'))

      expect(reports[0].message).toMatch(/^Unexpected alias/)
    })

    test('message suggests canonical form with "instead"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fdescribe'))

      expect(reports[0].message).toContain('instead')
      expect(reports[0].message).toContain('describe.only')
    })
  })

  describe('mixed aliases and regular calls', () => {
    test('should only report aliases among mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createRegularCall('it'))
      visitor.CallExpression(createAliasCall('xit'))
      visitor.CallExpression(createRegularCall('describe'))
      visitor.CallExpression(createAliasCall('fit'))
      visitor.CallExpression(createMemberCall('test', 'only'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('xit')
      expect(reports[1].message).toContain('fit')
    })
  })

  describe('valid member expression calls', () => {
    test('should not report context.skip() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('context', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('should not report context.only() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('context', 'only'))

      expect(reports.length).toBe(0)
    })

    test('should not report test.skip() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'skip'))

      expect(reports.length).toBe(0)
    })

    test('should not report describe.only() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('describe', 'only'))

      expect(reports.length).toBe(0)
    })

    test('should not report it.each() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('it', 'each'))

      expect(reports.length).toBe(0)
    })

    test('should not report test.each() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('test', 'each'))

      expect(reports.length).toBe(0)
    })

    test('should not report describe.each() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createMemberCall('describe', 'each'))

      expect(reports.length).toBe(0)
    })
  })

  describe('near-miss identifiers', () => {
    test('should not report "xitt" as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xitt'))

      expect(reports.length).toBe(0)
    })

    test('should not report "fitt" as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fitt'))

      expect(reports.length).toBe(0)
    })

    test('should not report "xitx" as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xitx'))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall(''))

      expect(reports.length).toBe(0)
    })

    test('should not report case-variant "Xit" as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('Xit'))

      expect(reports.length).toBe(0)
    })

    test('should not report case-variant "XIT" as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('XIT'))

      expect(reports.length).toBe(0)
    })

    test('should not report case-variant "FIT" as alias', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('FIT'))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-Identifier callee types', () => {
    test('should not report when callee is a function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement' } },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: '', name: 'xit' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('repeated alias detection', () => {
    test('should report same alias multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit', 1, 0))
      visitor.CallExpression(createAliasCall('xit', 5, 0))
      visitor.CallExpression(createAliasCall('xit', 10, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should report each alias with same canonical form independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit'))
      visitor.CallExpression(createAliasCall('fit'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('it.skip')
      expect(reports[1].message).toContain('it.only')
    })
  })

  describe('full report message structure', () => {
    test('message includes "clarity and consistency" phrase', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit'))

      expect(reports[0].message).toContain('clarity and consistency')
    })

    test('message includes "Use" keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xdescribe'))

      expect(reports[0].message).toContain('Use')
    })
  })

  describe('non-CallExpression node types', () => {
    test('should not report for NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('all skip aliases individually verified', () => {
    test('should report xit with correct canonical it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit'))

      expect(reports[0].message).toContain("'xit'")
      expect(reports[0].message).toContain("'it.skip'")
    })

    test('should report xtest with correct canonical test.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xtest'))

      expect(reports[0].message).toContain("'xtest'")
      expect(reports[0].message).toContain("'test.skip'")
    })

    test('should report xdescribe with correct canonical describe.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xdescribe'))

      expect(reports[0].message).toContain("'xdescribe'")
      expect(reports[0].message).toContain("'describe.skip'")
    })

    test('should report xcontext with correct canonical context.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xcontext'))

      expect(reports[0].message).toContain("'xcontext'")
      expect(reports[0].message).toContain("'context.skip'")
    })
  })

  describe('all focus aliases individually verified', () => {
    test('should report fit with correct canonical it.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fit'))

      expect(reports[0].message).toContain("'fit'")
      expect(reports[0].message).toContain("'it.only'")
    })

    test('should report ftest with correct canonical test.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('ftest'))

      expect(reports[0].message).toContain("'ftest'")
      expect(reports[0].message).toContain("'test.only'")
    })

    test('should report fdescribe with correct canonical describe.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fdescribe'))

      expect(reports[0].message).toContain("'fdescribe'")
      expect(reports[0].message).toContain("'describe.only'")
    })

    test('should report fcontext with correct canonical context.only', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fcontext'))

      expect(reports[0].message).toContain("'fcontext'")
      expect(reports[0].message).toContain("'context.only'")
    })
  })

  describe('location extraction edge cases', () => {
    test('should report with default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct column for alias at non-zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fit', 20, 15))

      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('node with empty object callee', () => {
    test('should handle callee that is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('end location reporting', () => {
    test('should report correct end location for xit', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit', 5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should report correct end location for fdescribe', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('fdescribe', 12, 3))

      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(23)
    })
  })

  describe('multiple aliases at same line', () => {
    test('should report correct columns for aliases on same line', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xit', 8, 0))
      visitor.CallExpression(createAliasCall('fit', 8, 25))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(8)
      expect(reports[1].loc?.start.column).toBe(25)
    })
  })

  describe('callee with Symbol name', () => {
    test('should not report when callee name is a Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: Symbol('xit') },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('report processing order', () => {
    test('should report aliases in the order they are processed', () => {
      const { context, reports } = createMockContext()
      const visitor = noAliasMethodsRule.create(context)

      visitor.CallExpression(createAliasCall('xdescribe', 3, 0))
      visitor.CallExpression(createRegularCall('it'))
      visitor.CallExpression(createAliasCall('ftest', 7, 0))
      visitor.CallExpression(createMemberCall('it', 'only'))
      visitor.CallExpression(createAliasCall('xcontext', 15, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('xdescribe')
      expect(reports[1].message).toContain('ftest')
      expect(reports[2].message).toContain('xcontext')
    })
  })
})
