import { describe, test, expect, vi } from 'vitest'
import { noUnsafeDeclarationMergingRule } from '../../../../src/rules/patterns/no-unsafe-declaration-merging.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'class Foo {}',
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

function createClassDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'ClassDeclaration',
    id: {
      type: 'Identifier',
      name,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 15 },
    },
  }
}

function createInterfaceDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'TSInterfaceDeclaration',
    id: {
      type: 'Identifier',
      name,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 20 },
    },
  }
}

function createFunctionDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name,
    },
    loc: {
      start: { line, column },
      end: { line, column: name.length + 20 },
    },
  }
}

describe('no-unsafe-declaration-merging rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeDeclarationMergingRule.meta.type).toBe('problem')
    })

    test('should have warning severity', () => {
      expect(noUnsafeDeclarationMergingRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnsafeDeclarationMergingRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnsafeDeclarationMergingRule.meta.fixable).toBeUndefined()
    })

    test('should mention declaration merging in description', () => {
      expect(noUnsafeDeclarationMergingRule.meta.docs?.description.toLowerCase()).toContain(
        'declaration merging',
      )
    })

    test('should have empty schema array', () => {
      expect(noUnsafeDeclarationMergingRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(visitor).toHaveProperty('TSInterfaceDeclaration')
      expect(visitor).toHaveProperty('FunctionDeclaration')
    })
  })

  describe('detecting class-interface merging', () => {
    test('should report when class and interface have same name (class first)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Foo', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Foo', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Foo')
      expect(reports[0].message).toContain('class')
      expect(reports[0].message).toContain('interface')
    })

    test('should report when class and interface have same name (interface first)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Bar', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Bar', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Bar')
    })

    test('should report correct message for class-interface merging', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('MyClass', 5, 0))

      expect(reports[0].message).toContain('Unsafe declaration merging')
      expect(reports[0].message).toContain('unexpected type behavior')
    })
  })

  describe('detecting function-interface merging', () => {
    test('should report when function and interface have same name (function first)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('handler', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('handler', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('handler')
      expect(reports[0].message).toContain('function')
      expect(reports[0].message).toContain('interface')
    })

    test('should report when function and interface have same name (interface first)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('callback', 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('callback', 5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('callback')
    })

    test('should suggest namespace in message for function-interface merging', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('fn', 5, 0))

      expect(reports[0].message).toContain('namespace')
    })
  })

  describe('allowing safe declarations', () => {
    test('should not report when declarations have different names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Foo', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Bar', 5, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('baz', 10, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple interfaces with same name (safe merging)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Entity', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Entity', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple classes with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Service', 1, 0))
      visitor.ClassDeclaration(createClassDeclaration('Service', 5, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should use single quotes around declaration name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyType', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('MyType', 5, 0))

      expect(reports[0].message).toContain("'MyType'")
    })

    test('should include declaration name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('processData', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('processData', 5, 0))

      expect(reports[0].message).toContain('processData')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
      expect(() => visitor.TSInterfaceDeclaration(null)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration(undefined)).not.toThrow()
      expect(() => visitor.TSInterfaceDeclaration(undefined)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      expect(() => visitor.ClassDeclaration('string')).not.toThrow()
      expect(() => visitor.ClassDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const classNode = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Test' },
      }

      const interfaceNode = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'Test' },
      }

      visitor.ClassDeclaration(classNode)
      visitor.TSInterfaceDeclaration(interfaceNode)

      expect(reports.length).toBe(1)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'value',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)
      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Item', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('Item', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('X', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle variable with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 123,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle missing name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ClassDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple unsafe mergings', () => {
    test('should report multiple unsafe mergings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 5, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('B', 10, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('B', 15, 0))

      expect(reports.length).toBe(2)
    })

    test('should report only unsafe mergings, not safe ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('A', 1, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('A', 5, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 10, 0))
      visitor.TSInterfaceDeclaration(createInterfaceDeclaration('C', 15, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'X' },
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'X' },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeDeclarationMergingRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('X', 1, 0))

      const node = {
        type: 'TSInterfaceDeclaration',
        id: { type: 'Identifier', name: 'X' },
        loc: {},
      }

      visitor.TSInterfaceDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })
})
