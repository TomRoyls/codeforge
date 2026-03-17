import { describe, test, expect, vi } from 'vitest'
import { noImportAssignRule } from '../../../../src/rules/patterns/no-import-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'import { foo } from "bar"; foo = 1;',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
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

function createImportSpecifier(
  importedName: string,
  localName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ImportSpecifier',
    imported: {
      type: 'Identifier',
      name: importedName,
    },
    local: {
      type: 'Identifier',
      name: localName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + importedName.length + localName.length + 5 },
    },
  }
}

function createImportDefaultSpecifier(localName: string, line = 1, column = 0): unknown {
  return {
    type: 'ImportDefaultSpecifier',
    local: {
      type: 'Identifier',
      name: localName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + localName.length },
    },
  }
}

function createImportNamespaceSpecifier(localName: string, line = 1, column = 0): unknown {
  return {
    type: 'ImportNamespaceSpecifier',
    local: {
      type: 'Identifier',
      name: localName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + localName.length + 1 },
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

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
  }
}

describe('no-import-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noImportAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noImportAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noImportAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noImportAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema array', () => {
      expect(noImportAssignRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noImportAssignRule.meta.fixable).toBeUndefined()
    })

    test('should mention import in description', () => {
      expect(noImportAssignRule.meta.docs?.description.toLowerCase()).toContain('import')
    })

    test('should mention assignment in description', () => {
      expect(noImportAssignRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })
  })

  describe('create', () => {
    test('should return visitor with ImportSpecifier method', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(visitor).toHaveProperty('ImportSpecifier')
    })

    test('should return visitor with ImportDefaultSpecifier method', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(visitor).toHaveProperty('ImportDefaultSpecifier')
    })

    test('should return visitor with ImportNamespaceSpecifier method', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(visitor).toHaveProperty('ImportNamespaceSpecifier')
    })

    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })
  })

  describe('tracking import specifiers', () => {
    test('should track ImportSpecifier local name', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))

      const { reports } = createMockContext()
      const visitor2 = noImportAssignRule.create(context)
      visitor2.ImportSpecifier(createImportSpecifier('foo', 'bar'))
      visitor2.AssignmentExpression(
        createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should track ImportDefaultSpecifier local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('foo'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should track ImportNamespaceSpecifier local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('utils'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('utils'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should track multiple imports', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
      visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('baz'))
      visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('utils'))

      expect(() =>
        visitor.AssignmentExpression(createAssignmentExpression(createIdentifier('bar'), null)),
      ).not.toThrow()
    })
  })

  describe('reporting import reassignments', () => {
    test('should report assignment to named import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('originalName', 'importedName'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('importedName'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('importedName')
      expect(reports[0].message).toContain('Import binding')
    })

    test('should report assignment to default import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('myDefault'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myDefault'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myDefault')
    })

    test('should report assignment to namespace import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportNamespaceSpecifier(createImportNamespaceSpecifier('* as ns'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('* as ns'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('* as ns')
    })

    test('should have correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 1 }),
      )

      expect(reports[0].message).toBe("Import binding 'bar' should not be modified.")
    })

    test('should not report assignment to non-import variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('localVar'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report property assignment on import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('bar'), createIdentifier('prop')),
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report multiple import reassignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
      visitor.ImportSpecifier(createImportSpecifier('bar', 'bar'))
      visitor.ImportDefaultSpecifier(createImportDefaultSpecifier('defaultImport'))

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('defaultImport'), {
          type: 'Literal',
          value: 3,
        }),
      )

      expect(reports.length).toBe(3)
    })

    test('should report assignment before import declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
      )
      visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('bar', 10, 5),
          { type: 'Literal', value: 1 },
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in ImportSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.ImportSpecifier(null)).not.toThrow()
    })

    test('should handle undefined node in ImportSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.ImportSpecifier(undefined)).not.toThrow()
    })

    test('should handle null node in ImportDefaultSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.ImportDefaultSpecifier(null)).not.toThrow()
    })

    test('should handle undefined node in ImportDefaultSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.ImportDefaultSpecifier(undefined)).not.toThrow()
    })

    test('should handle null node in ImportNamespaceSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.ImportNamespaceSpecifier(null)).not.toThrow()
    })

    test('should handle undefined node in ImportNamespaceSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.ImportNamespaceSpecifier(undefined)).not.toThrow()
    })

    test('should handle null node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in ImportSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.ImportSpecifier('string')).not.toThrow()
      expect(() => visitor.ImportSpecifier(123)).not.toThrow()
    })

    test('should handle non-object node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
    })

    test('should handle import specifier without local identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
      }

      visitor.ImportSpecifier(node)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle assignment without identifier left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 1 },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle assignment without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'foo' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle import name with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('my_import', 'my_import'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('my_import'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_import')
    })

    test('should handle import name with dollar signs', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('$var', '$var'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$var'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$var')
    })

    test('should handle same imported and local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle different imported and local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('originalName', 'alias'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('alias'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('alias')
    })
  })

  describe('message quality', () => {
    test('should include import binding in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'bar'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('bar'), { type: 'Literal', value: 1 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('import binding')
    })

    test('should include import name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('testImport', 'testImport'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('testImport'), { type: 'Literal', value: 1 }),
      )

      expect(reports[0].message).toContain('testImport')
    })

    test('should use word modified in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImportAssignRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('foo', 'foo'))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), { type: 'Literal', value: 1 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('modified')
    })
  })
})
