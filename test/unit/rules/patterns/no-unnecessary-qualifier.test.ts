import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryQualifierRule } from '../../../../src/rules/patterns/no-unnecessary-qualifier.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'import * as A from "lib"; import { B } from "lib"; A.B;',
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

function createProgram(imports: unknown[], body: unknown[] = []): unknown {
  return {
    type: 'Program',
    body: [...imports, ...body],
  }
}

function createNamespaceImport(namespaceName: string, source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: source },
    specifiers: [
      {
        type: 'ImportNamespaceSpecifier',
        local: { type: 'Identifier', name: namespaceName },
      },
    ],
  }
}

function createNamedImport(localName: string, importedName: string, source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: source },
    specifiers: [
      {
        type: 'ImportSpecifier',
        local: { type: 'Identifier', name: localName },
        imported: { type: 'Identifier', name: importedName },
      },
    ],
  }
}

function createDefaultImport(localName: string, source: string): unknown {
  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: source },
    specifiers: [
      {
        type: 'ImportDefaultSpecifier',
        local: { type: 'Identifier', name: localName },
      },
    ],
  }
}

function createMemberExpression(
  objectName: string,
  propertyName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: objectName },
    property: { type: 'Identifier', name: propertyName },
    computed: false,
    optional: false,
    loc: {
      start: { line, column },
      end: { line, column: column + objectName.length + 1 + propertyName.length },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-unnecessary-qualifier rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryQualifierRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryQualifierRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryQualifierRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noUnnecessaryQualifierRule.meta.fixable).toBe('code')
    })

    test('should mention qualifier in description', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.description.toLowerCase()).toContain('qualifier')
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.description.toLowerCase()).toContain(
        'unnecessary',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(visitor).toHaveProperty('Program')
      expect(visitor).toHaveProperty('MemberExpression')
    })
  })

  describe('detecting unnecessary qualifiers', () => {
    test('should report when namespace qualifier has direct import', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary qualifier')
      expect(reports[0].message).toContain('A.B')
      expect(reports[0].message).toContain('B')
    })

    test('should report when aliased import matches namespace member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('Utils', 'utils'),
        createNamedImport('helper', 'originalHelper', 'utils'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('Utils', 'helper')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple unnecessary qualifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
        createNamedImport('C', 'C', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      visitor.MemberExpression(createMemberExpression('A', 'C'))

      expect(reports.length).toBe(2)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B', 42, 15)
      visitor.MemberExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('not reporting valid qualifiers', () => {
    test('should not report when no namespace import exists', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([createNamedImport('B', 'B', 'lib')])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when member is not directly imported', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'C')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when imports are from different sources', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib1'),
        createNamedImport('B', 'B', 'lib2'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report computed member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const baseNode = createMemberExpression('A', 'B') as Record<string, unknown>
      const node = {
        ...baseNode,
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report optional chaining member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const baseNode = createMemberExpression('A', 'B') as Record<string, unknown>
      const node = {
        ...baseNode,
        optional: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when qualifier is not a namespace import', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createDefaultImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report nested member expressions with non-identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: createMemberExpression('X', 'Y'),
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(() => visitor.Program(null)).not.toThrow()
      expect(() => visitor.MemberExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(() => visitor.Program(undefined)).not.toThrow()
      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(() => visitor.Program('string')).not.toThrow()
      expect(() => visitor.MemberExpression('string')).not.toThrow()
      expect(() => visitor.Program(123)).not.toThrow()
      expect(() => visitor.MemberExpression(123)).not.toThrow()
    })

    test('should handle program without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      visitor.Program({ type: 'Program' })

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle program with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      visitor.Program({ type: 'Program', body: [] })

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle import without specifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [],
        },
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle import without source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { type: 'Identifier', name: 'A' },
            },
          ],
        },
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'A' },
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }

      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'A' },
        property: { type: 'Literal', value: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should mention the qualifier name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('MyNamespace', 'lib'),
        createNamedImport('myFunc', 'myFunc', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('MyNamespace', 'myFunc')
      visitor.MemberExpression(node)

      expect(reports[0].message).toContain('MyNamespace')
    })

    test('should mention the member name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('myFunction', 'myFunction', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'myFunction')
      visitor.MemberExpression(node)

      expect(reports[0].message).toContain('myFunction')
    })

    test('should suggest using unqualified name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports[0].message).toContain("Use 'B' instead")
    })
  })
})
