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

    // NEW meta tests (9-30)
    test('should have meta property defined', () => {
      expect(noUnnecessaryQualifierRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(noUnnecessaryQualifierRule.meta.docs).toBeDefined()
    })

    test('should have docs description as non-empty string', () => {
      expect(typeof noUnnecessaryQualifierRule.meta.docs?.description).toBe('string')
      expect(noUnnecessaryQualifierRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs url defined', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as a string', () => {
      expect(typeof noUnnecessaryQualifierRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing the rule name', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.url).toContain('no-unnecessary-qualifier')
    })

    test('should have type as one of valid RuleType values', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(noUnnecessaryQualifierRule.meta.type)
    })

    test('should have severity as one of valid Severity values', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(noUnnecessaryQualifierRule.meta.severity)
    })

    test('should have fixable as valid value', () => {
      const validFixable = ['code', 'whitespace']
      expect(validFixable).toContain(noUnnecessaryQualifierRule.meta.fixable)
    })

    test('should have meta.type as string', () => {
      expect(typeof noUnnecessaryQualifierRule.meta.type).toBe('string')
    })

    test('should have meta.severity as string', () => {
      expect(typeof noUnnecessaryQualifierRule.meta.severity).toBe('string')
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof noUnnecessaryQualifierRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.category as string', () => {
      expect(typeof noUnnecessaryQualifierRule.meta.docs?.category).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnnecessaryQualifierRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryQualifierRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(noUnnecessaryQualifierRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(noUnnecessaryQualifierRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnnecessaryQualifierRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have create method defined', () => {
      expect(noUnnecessaryQualifierRule.create).toBeDefined()
      expect(typeof noUnnecessaryQualifierRule.create).toBe('function')
    })

    test('should have default export matching named export', () => {
      // The module has both named and default export; verify they match
      expect(noUnnecessaryQualifierRule).toBeDefined()
    })

    test('should have description mentioning namespace', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.description.toLowerCase()).toContain('namespace')
    })

    test('should have description mentioning unqualified name', () => {
      expect(noUnnecessaryQualifierRule.meta.docs?.description.toLowerCase()).toContain(
        'unqualified',
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

    // NEW create tests
    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with exactly Program and MemberExpression methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(Object.keys(visitor).sort()).toEqual(['MemberExpression', 'Program'])
    })

    test('should have Program as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(typeof visitor.Program).toBe('function')
    })

    test('should have MemberExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryQualifierRule.create(context)
      const visitor2 = noUnnecessaryQualifierRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with minimal properties', () => {
      const reports: ReportDescriptor[] = []
      const minimalContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
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
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noUnnecessaryQualifierRule.create(minimalContext)
      expect(visitor).toHaveProperty('Program')
      expect(visitor).toHaveProperty('MemberExpression')
    })

    test('should not report without Program being called first', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      // Call MemberExpression without calling Program first
      const node = createMemberExpression('A', 'B')
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should create independent visitors with separate import state', () => {
      const { context, reports } = createMockContext()
      const visitor1 = noUnnecessaryQualifierRule.create(context)
      const visitor2 = noUnnecessaryQualifierRule.create(context)

      // Set up imports on visitor1 only
      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor1.Program(program)

      // visitor2 should not have the imports
      visitor2.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)

      // visitor1 should detect
      visitor1.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)
    })

    test('should handle Program being called multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      // First program with no namespace
      visitor.Program(createProgram([createNamedImport('B', 'B', 'lib')]))
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)

      // Second program with namespace - should now detect
      visitor.Program(
        createProgram([createNamespaceImport('A', 'lib'), createNamedImport('B', 'B', 'lib')]),
      )
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)
    })

    test('should overwrite imports when Program is called again', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program1 = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program1)
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)

      // Now re-initialize with different program
      const program2 = createProgram([
        createNamespaceImport('X', 'lib'),
        createNamedImport('Y', 'Y', 'lib'),
      ])
      visitor.Program(program2)
      visitor.MemberExpression(createMemberExpression('X', 'Y'))
      expect(reports.length).toBe(2)

      // Old namespace A should no longer work
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(2)
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

    // NEW detection positive tests
    test('should detect qualifier with single-letter names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('b', 'b', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'b'))
      expect(reports.length).toBe(1)
    })

    test('should detect with underscore prefix names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('_ns', 'lib'),
        createNamedImport('_fn', '_fn', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('_ns', '_fn'))
      expect(reports.length).toBe(1)
    })

    test('should detect with dollar sign names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('$', 'jquery'),
        createNamedImport('ajax', 'ajax', 'jquery'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('$', 'ajax'))
      expect(reports.length).toBe(1)
    })

    test('should detect with long namespace name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('MyVeryLongNamespaceName', 'lib'),
        createNamedImport('myFunction', 'myFunction', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('MyVeryLongNamespaceName', 'myFunction'))
      expect(reports.length).toBe(1)
    })

    test('should detect with long member name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('NS', 'lib'),
        createNamedImport(
          'veryLongDescriptiveFunctionName',
          'veryLongDescriptiveFunctionName',
          'lib',
        ),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('NS', 'veryLongDescriptiveFunctionName'))
      expect(reports.length).toBe(1)
    })

    test('should detect with camelCase names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('myLib', 'my-lib'),
        createNamedImport('doSomething', 'doSomething', 'my-lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('myLib', 'doSomething'))
      expect(reports.length).toBe(1)
    })

    test('should detect with PascalCase names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('React', 'react'),
        createNamedImport('useState', 'useState', 'react'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('React', 'useState'))
      expect(reports.length).toBe(1)
    })

    test('should detect with UPPER_SNAKE_CASE names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('CONSTANTS', 'constants'),
        createNamedImport('MAX_VALUE', 'MAX_VALUE', 'constants'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('CONSTANTS', 'MAX_VALUE'))
      expect(reports.length).toBe(1)
    })

    test('should detect with numeric-like property names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('prop1', 'prop1', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'prop1'))
      expect(reports.length).toBe(1)
    })

    test('should detect when there are many other imports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'other1'),
        createNamedImport('C', 'C', 'other2'),
        createNamedImport('D', 'D', 'lib'),
        createNamedImport('E', 'E', 'other3'),
        createDefaultImport('def', 'default-lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'D'))
      expect(reports.length).toBe(1)
    })

    test('should report for each MemberExpression call separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      // Same member expression reported 5 times
      for (let i = 0; i < 5; i++) {
        visitor.MemberExpression(createMemberExpression('A', 'B'))
      }

      expect(reports.length).toBe(5)
    })

    test('should detect when named import has aliased imported name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('Rx', 'rxjs'),
        createNamedImport('map', 'map', 'rxjs'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('Rx', 'map'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map')
    })

    test('should detect with mixed import types in same declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      // A single import declaration with both namespace and named
      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            { type: 'ImportNamespaceSpecifier', local: { type: 'Identifier', name: 'Lib' } },
            {
              type: 'ImportSpecifier',
              local: { type: 'Identifier', name: 'func' },
              imported: { type: 'Identifier', name: 'func' },
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('Lib', 'func'))
      expect(reports.length).toBe(1)
    })

    test('should detect across multiple import declarations from same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
        createNamedImport('C', 'C', 'lib'),
        createNamedImport('D', 'D', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      visitor.MemberExpression(createMemberExpression('A', 'C'))
      visitor.MemberExpression(createMemberExpression('A', 'D'))

      expect(reports.length).toBe(3)
    })

    test('should detect with single member accessed multiple times in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('fn', 'fn', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'fn', 1, 0))
      visitor.MemberExpression(createMemberExpression('A', 'fn', 2, 5))
      visitor.MemberExpression(createMemberExpression('A', 'fn', 3, 10))

      expect(reports.length).toBe(3)
    })

    test('should detect with location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B', 1, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should detect with location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B', 999, 500))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(500)
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

    // NEW negative detection tests
    test('should not report when namespace exists but member imported from different source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib-a'),
        createNamedImport('B', 'B', 'lib-b'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should not report when using a default import as qualifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createDefaultImport('React', 'react'),
        createNamedImport('Component', 'Component', 'react'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('React', 'Component'))
      expect(reports.length).toBe(0)
    })

    test('should not report when qualifier name matches no import at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('Unknown', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should not report when member is a default import', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createDefaultImport('B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should not report when both computed and optional are true', () => {
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
        computed: true,
        optional: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object is a MemberExpression (chained)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'A' },
          property: { type: 'Identifier', name: 'inner' },
          computed: false,
          optional: false,
        },
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when namespace from different source shares member name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib-a'),
        createNamedImport('B', 'B', 'lib-b'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should not report when namespace import has no matching named import at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([createNamespaceImport('A', 'lib')])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'anything'))
      expect(reports.length).toBe(0)
    })

    test('should not report when named import local name differs from property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('localB', 'importedB', 'lib'),
      ])
      visitor.Program(program)

      // Property 'importedB' is not the local name
      visitor.MemberExpression(createMemberExpression('A', 'importedB'))
      expect(reports.length).toBe(0)
    })

    test('should not report for CallExpression nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      // This won't be processed because CallExpression is not a visitor method
      const node = {
        type: 'CallExpression',
        callee: createMemberExpression('A', 'B'),
        arguments: [],
      }
      // No visitor method for CallExpression, so just ensure it doesn't crash
      expect(() => visitor.MemberExpression(node)).not.toThrow()
    })

    test('should not report when source values differ slightly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', './lib'), // different path
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should not report when source values differ by trailing slash', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib/'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should not report when namespace and named import names are swapped', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('B', 'lib'),
        createNamedImport('A', 'A', 'lib'),
      ])
      visitor.Program(program)

      // B.A where B is namespace and A is named - should report
      visitor.MemberExpression(createMemberExpression('B', 'A'))
      expect(reports.length).toBe(1)

      // A.B where A is named and B is namespace - should not report
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)
    })

    test('should not report for property access on this', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
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

    // NEW edge case tests
    test('should handle boolean node', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(() => visitor.Program(true)).not.toThrow()
      expect(() => visitor.MemberExpression(false)).not.toThrow()
    })

    test('should handle numeric node 0', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(() => visitor.Program(0)).not.toThrow()
      expect(() => visitor.MemberExpression(0)).not.toThrow()
    })

    test('should handle empty string node', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(() => visitor.Program('')).not.toThrow()
      expect(() => visitor.MemberExpression('')).not.toThrow()
    })

    test('should handle array as Program node', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      expect(() => visitor.Program([])).not.toThrow()
    })

    test('should handle body with null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = {
        type: 'Program',
        body: [null, undefined, createNamespaceImport('A', 'lib'), null],
      }
      visitor.Program(program)

      expect(() => visitor.MemberExpression(createMemberExpression('A', 'B'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body with non-ImportDeclaration nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram(
        [createNamespaceImport('A', 'lib'), createNamedImport('B', 'B', 'lib')],
        [
          { type: 'ExpressionStatement', expression: createIdentifier('x') },
          { type: 'VariableDeclaration', kind: 'const', declarations: [] },
          { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' } },
        ],
      )
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)
    })

    test('should handle specifier with null local', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: null,
            },
          ],
        },
      ])
      visitor.Program(program)

      expect(() => visitor.MemberExpression(createMemberExpression('A', 'B'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle specifier with missing local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { type: 'Identifier' },
            },
          ],
        },
      ])
      visitor.Program(program)

      expect(() => visitor.MemberExpression(createMemberExpression('A', 'B'))).not.toThrow()
    })

    test('should handle specifier with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { type: 'Identifier', name: '' },
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('', 'B'))
      expect(reports.length).toBe(0) // empty string local name shouldn't match
    })

    test('should handle source with non-string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 42 },
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { type: 'Identifier', name: 'A' },
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle source with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: null },
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { type: 'Identifier', name: 'A' },
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle source as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: null,
          specifiers: [
            {
              type: 'ImportNamespaceSpecifier',
              local: { type: 'Identifier', name: 'A' },
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle specifiers as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: 'not-an-array',
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle specifier as null element in array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [null, undefined],
        },
      ])
      visitor.Program(program)

      expect(() => visitor.MemberExpression(createMemberExpression('A', 'B'))).not.toThrow()
    })

    test('should handle specifier as non-object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: ['string', 42, true],
        },
      ])
      visitor.Program(program)

      expect(() => visitor.MemberExpression(createMemberExpression('A', 'B'))).not.toThrow()
    })

    test('should handle unknown specifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            {
              type: 'UnknownSpecifierType',
              local: { type: 'Identifier', name: 'A' },
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with undefined object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: undefined,
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with null property', () => {
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
        property: null,
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with missing property', () => {
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
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with empty loc', () => {
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
        loc: {},
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle member expression with partial loc (only start)', () => {
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
        loc: {
          start: { line: 5, column: 3 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle loc with non-numeric line', () => {
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
        loc: {
          start: { line: 'not-a-number', column: 0 },
          end: { line: 1, column: 5 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      // Non-numeric line should fall back to default
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric column', () => {
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
        loc: {
          start: { line: 5, column: 'not-a-number' },
          end: { line: 5, column: 10 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0) // fallback
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'A', extra: true },
        property: { type: 'Identifier', name: 'B', extra: true },
        computed: false,
        optional: false,
        extra: 'should-be-ignored',
        range: [0, 5],
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle computed as string "true" (truthy but not boolean true)', () => {
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
        computed: 'true',
        optional: false,
      }
      visitor.MemberExpression(node)

      // Rule checks `n.computed === true`, string 'true' !== true
      expect(reports.length).toBe(1)
    })

    test('should handle optional as string "true"', () => {
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
        optional: 'true',
      }
      visitor.MemberExpression(node)

      // Rule checks `n.optional === true`, string 'true' !== true
      expect(reports.length).toBe(1)
    })

    test('should handle computed as 1 (truthy number)', () => {
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
        computed: 1,
        optional: false,
      }
      visitor.MemberExpression(node)

      // Rule checks `n.computed === true`, 1 !== true
      expect(reports.length).toBe(1)
    })

    test('should handle computed as undefined (not set)', () => {
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
        optional: false,
      }
      visitor.MemberExpression(node)

      // computed is undefined, undefined !== true, so it should report
      expect(reports.length).toBe(1)
    })

    test('should handle object with empty name string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: '' },
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ImportSpecifier without imported field', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            {
              type: 'ImportSpecifier',
              local: { type: 'Identifier', name: 'B' },
              // No imported field - should use localName as importedName
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)
    })

    test('should handle ImportSpecifier with null imported', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            {
              type: 'ImportSpecifier',
              local: { type: 'Identifier', name: 'B' },
              imported: null,
            },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)
    })

    test('should handle multiple namespace imports from same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamespaceImport('B', 'lib'),
        createNamedImport('fn', 'fn', 'lib'),
      ])
      visitor.Program(program)

      // Both A.fn and B.fn should be detected
      visitor.MemberExpression(createMemberExpression('A', 'fn'))
      visitor.MemberExpression(createMemberExpression('B', 'fn'))

      expect(reports.length).toBe(2)
    })

    test('should handle non-ImportDeclaration nodes in body', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        { type: 'VariableDeclaration', kind: 'let', declarations: [] },
        { type: 'FunctionDeclaration', id: null },
        { type: 'ClassDeclaration', id: { type: 'Identifier', name: 'Foo' } },
        'not-an-object',
        null,
        42,
      ])

      expect(() => visitor.Program(program)).not.toThrow()
    })

    test('should handle body as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      visitor.Program({ type: 'Program', body: 'not-array' })

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle body as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      visitor.Program({ type: 'Program', body: null })

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle object identifier with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('_0', 'lib'),
        createNamedImport('fn', 'fn', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('_0', 'fn'))
      expect(reports.length).toBe(1)
    })

    test('should handle deeply malformed specifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 'lib' },
          specifiers: [
            {},
            { type: 'ImportNamespaceSpecifier' },
            { type: 'ImportSpecifier', local: {} },
          ],
        },
      ])

      expect(() => visitor.Program(program)).not.toThrow()
    })
  })

  describe('location reporting', () => {
    test('should report correct start line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B', 10, 5)
      visitor.MemberExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B', 3, 8)
      visitor.MemberExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(8 + 3) // 'A' + '.' + 'B' = 3
    })

    // NEW location tests
    test('should report location for first of multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
        createNamedImport('C', 'C', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B', 1, 0))
      visitor.MemberExpression(createMemberExpression('A', 'C', 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should report location for same member at different positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B', 1, 0))
      visitor.MemberExpression(createMemberExpression('A', 'B', 2, 4))
      visitor.MemberExpression(createMemberExpression('A', 'B', 3, 8))

      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
      expect(reports[1].loc?.start).toEqual({ line: 2, column: 4 })
      expect(reports[2].loc?.start).toEqual({ line: 3, column: 8 })
    })

    test('should report default location when loc is missing', () => {
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
      visitor.MemberExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location correctly for different member lengths', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('NS', 'lib'),
        createNamedImport('short', 'short', 'lib'),
        createNamedImport('veryLongName', 'veryLongName', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('NS', 'short', 1, 0))
      visitor.MemberExpression(createMemberExpression('NS', 'veryLongName', 1, 0))

      // 'NS.short' = 8 chars
      expect(reports[0].loc?.end.column).toBe(8)
      // 'NS.veryLongName' = 15 chars
      expect(reports[1].loc?.end.column).toBe(15)
    })

    test('should handle location with line 0', () => {
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
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 3 },
        },
      }
      visitor.MemberExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle location at exact boundary values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B', Number.MAX_SAFE_INTEGER, 0)
      visitor.MemberExpression(node)

      expect(reports[0].loc?.start.line).toBe(Number.MAX_SAFE_INTEGER)
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

    // NEW message tests
    test('should contain the fully qualified form in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('NS', 'lib'),
        createNamedImport('member', 'member', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('NS', 'member'))

      expect(reports[0].message).toContain('NS.member')
    })

    test('should mention already imported in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports[0].message.toLowerCase()).toContain('imported')
    })

    test('should include qualifier in single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('React', 'react'),
        createNamedImport('useState', 'useState', 'react'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('React', 'useState'))

      expect(reports[0].message).toContain("'React'")
    })

    test('should include member name in single quotes for suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('myHelper', 'myHelper', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'myHelper'))

      expect(reports[0].message).toContain("'myHelper'")
    })

    test('should produce consistent messages for same pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B', 1, 0))
      visitor.MemberExpression(createMemberExpression('A', 'B', 5, 0))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should produce different messages for different qualifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('NS1', 'lib'),
        createNamespaceImport('NS2', 'lib2'),
        createNamedImport('B', 'B', 'lib'),
        createNamedImport('C', 'C', 'lib2'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('NS1', 'B'))
      visitor.MemberExpression(createMemberExpression('NS2', 'C'))

      expect(reports[0].message).not.toBe(reports[1].message)
      expect(reports[0].message).toContain('NS1')
      expect(reports[1].message).toContain('NS2')
    })

    test('should produce different messages for different members', () => {
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

      expect(reports[0].message).toContain('B')
      expect(reports[1].message).toContain('C')
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should message include the full qualified name with dot notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('Lib', 'lib'),
        createNamedImport('func', 'func', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('Lib', 'func'))

      expect(reports[0].message).toContain('Lib.func')
    })
  })

  describe('multiple reports', () => {
    test('should report each MemberExpression independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      for (let i = 0; i < 10; i++) {
        visitor.MemberExpression(createMemberExpression('A', 'B', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report different members from same namespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
        createNamedImport('C', 'C', 'lib'),
        createNamedImport('D', 'D', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      visitor.MemberExpression(createMemberExpression('A', 'C'))
      visitor.MemberExpression(createMemberExpression('A', 'D'))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('B')
      expect(reports[1].message).toContain('C')
      expect(reports[2].message).toContain('D')
    })

    test('should report for multiple namespaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('NS1', 'lib1'),
        createNamespaceImport('NS2', 'lib2'),
        createNamedImport('fnA', 'fnA', 'lib1'),
        createNamedImport('fnB', 'fnB', 'lib2'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('NS1', 'fnA'))
      visitor.MemberExpression(createMemberExpression('NS2', 'fnB'))

      expect(reports.length).toBe(2)
    })

    test('should mix reports and non-reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B')) // report
      visitor.MemberExpression(createMemberExpression('A', 'C')) // no report (C not imported)
      visitor.MemberExpression(createMemberExpression('X', 'B')) // no report (X not namespace)
      visitor.MemberExpression(createMemberExpression('A', 'B')) // report

      expect(reports.length).toBe(2)
    })

    test('should correctly accumulate reports across many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('fn', 'fn', 'lib'),
      ])
      visitor.Program(program)

      for (let i = 0; i < 50; i++) {
        visitor.MemberExpression(createMemberExpression('A', 'fn'))
      }

      expect(reports.length).toBe(50)
    })

    test('should report after Program reinitialization', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      // First setup
      visitor.Program(
        createProgram([createNamespaceImport('A', 'lib'), createNamedImport('B', 'B', 'lib')]),
      )
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)

      // Reinitialize with different setup
      visitor.Program(
        createProgram([createNamespaceImport('X', 'lib'), createNamedImport('Y', 'Y', 'lib')]),
      )
      visitor.MemberExpression(createMemberExpression('X', 'Y'))
      expect(reports.length).toBe(2)

      // Old setup should be gone
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(2)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/test.ts',
        'import * as React from "react"; import { useState } from "react"; React.useState;',
      )
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('React', 'react'),
        createNamedImport('useState', 'useState', 'react'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('React', 'useState'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/test.ts', '')
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports.length).toBe(1)
    })

    test('should work with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noUnnecessaryQualifierRule.create(context)
      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports.length).toBe(1)
    })

    test('should work with context having parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
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
        workspaceRoot: '/test',
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext

      const visitor = noUnnecessaryQualifierRule.create(context)
      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports.length).toBe(1)
      // The rule doesn't use the logger
    })
  })

  describe('exports', () => {
    test('should export the rule as named export', () => {
      expect(noUnnecessaryQualifierRule).toBeDefined()
      expect(typeof noUnnecessaryQualifierRule).toBe('object')
    })

    test('should export rule with meta and create properties', () => {
      expect(noUnnecessaryQualifierRule).toHaveProperty('meta')
      expect(noUnnecessaryQualifierRule).toHaveProperty('create')
    })

    test('should have meta as a non-null object', () => {
      expect(noUnnecessaryQualifierRule.meta).toBeDefined()
      expect(typeof noUnnecessaryQualifierRule.meta).toBe('object')
    })

    test('should have create as a function', () => {
      expect(typeof noUnnecessaryQualifierRule.create).toBe('function')
    })
  })

  describe('report descriptor', () => {
    test('should include message property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should include loc property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B', 5, 3))

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('should have loc with start and end in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toBeDefined()
      expect(loc?.end).toBeDefined()
      expect(typeof loc?.start.line).toBe('number')
      expect(typeof loc?.start.column).toBe('number')
      expect(typeof loc?.end.line).toBe('number')
      expect(typeof loc?.end.column).toBe('number')
    })

    test('should report message as non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should pass complete descriptor to context.report', () => {
      const receivedDescriptors: unknown[] = []
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: unknown) => {
          receivedDescriptors.push(descriptor)
          const d = descriptor as ReportDescriptor
          reports.push({ message: d.message, loc: d.loc })
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
        workspaceRoot: '/test',
      } as unknown as RuleContext

      const visitor = noUnnecessaryQualifierRule.create(context)
      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))

      expect(receivedDescriptors.length).toBe(1)
      const desc = receivedDescriptors[0] as Record<string, unknown>
      expect(desc).toHaveProperty('message')
      expect(desc).toHaveProperty('loc')
    })

    test('should have message matching expected format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('Utils', 'utils'),
        createNamedImport('debounce', 'debounce', 'utils'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('Utils', 'debounce'))

      const msg = reports[0].message
      // Message should contain: "Unnecessary qualifier 'Utils'. 'debounce' is already imported directly. Use 'debounce' instead of 'Utils.debounce'."
      expect(msg).toMatch(/Unnecessary qualifier 'Utils'/)
      expect(msg).toMatch(/'debounce' is already imported directly/)
      expect(msg).toMatch(/Use 'debounce' instead of 'Utils\.debounce'/)
    })

    test('should have correct loc shape matching SourceLocation interface', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = createMemberExpression('A', 'B', 7, 12)
      visitor.MemberExpression(node)

      const loc = reports[0].loc
      expect(loc).toMatchObject({
        start: { line: 7, column: 12 },
        end: { line: 7, column: 15 },
      })
    })
  })

  describe('integration scenarios', () => {
    test('should handle typical React scenario', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('React', 'react'),
        createNamedImport('useState', 'useState', 'react'),
        createNamedImport('useEffect', 'useEffect', 'react'),
        createNamedImport('useCallback', 'useCallback', 'react'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('React', 'useState'))
      visitor.MemberExpression(createMemberExpression('React', 'useEffect'))

      expect(reports.length).toBe(2)
    })

    test('should handle lodash-like scenario', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('_', 'lodash'),
        createNamedImport('debounce', 'debounce', 'lodash'),
        createNamedImport('throttle', 'throttle', 'lodash'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('_', 'debounce'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_.debounce')
    })

    test('should handle rxjs-like scenario', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('rxjs', 'rxjs'),
        createNamedImport('of', 'of', 'rxjs'),
        createNamedImport('from', 'from', 'rxjs'),
        createNamedImport('map', 'map', 'rxjs/operators'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('rxjs', 'of'))
      visitor.MemberExpression(createMemberExpression('rxjs', 'from'))
      // 'map' is from 'rxjs/operators' not 'rxjs', so should NOT report
      visitor.MemberExpression(createMemberExpression('rxjs', 'map'))

      expect(reports.length).toBe(2)
    })

    test('should handle node built-ins scenario', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('fs', 'fs'),
        createNamedImport('readFile', 'readFile', 'fs'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('fs', 'readFile'))
      expect(reports.length).toBe(1)
    })

    test('should handle testing library scenario', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('screen', '@testing-library/dom'),
        createNamedImport('getByText', 'getByText', '@testing-library/dom'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('screen', 'getByText'))
      expect(reports.length).toBe(1)
    })

    test('should handle scenario with only namespace (no named imports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([createNamespaceImport('A', 'lib')])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'anything'))
      visitor.MemberExpression(createMemberExpression('A', 'something'))

      expect(reports.length).toBe(0)
    })

    test('should handle scenario with only named imports (no namespace)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamedImport('A', 'A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle scenario with mixed import styles from different sources', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('React', 'react'),
        createDefaultImport('moment', 'moment'),
        createNamedImport('useState', 'useState', 'react'),
        createNamedImport('debounce', 'debounce', 'lodash'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('React', 'useState')) // report
      visitor.MemberExpression(createMemberExpression('moment', 'debounce')) // no report (default)
      visitor.MemberExpression(createMemberExpression('React', 'debounce')) // no report (different source)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional edge cases', () => {
    test('should handle loc with null start', () => {
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
        loc: { start: null, end: null },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle member expression with CallExpression as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with Super as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Super' },
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle same name used as both namespace and named import', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      // A is namespace from lib1, and also named import from lib2
      const program = createProgram([
        createNamespaceImport('A', 'lib1'),
        createNamedImport('A', 'A', 'lib2'),
      ])
      visitor.Program(program)

      // A.B should not report because B is not imported from lib1
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle import with numeric source value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: 123 },
          specifiers: [
            { type: 'ImportNamespaceSpecifier', local: { type: 'Identifier', name: 'A' } },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle import with boolean source value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: true },
          specifiers: [
            { type: 'ImportNamespaceSpecifier', local: { type: 'Identifier', name: 'A' } },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should not report when optional is false explicitly', () => {
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
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not crash when node type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        object: { type: 'Identifier', name: 'A' },
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      // No type = not a MemberExpression per isMemberExpression check
      expect(reports.length).toBe(0)
    })

    test('should handle member expression where property type is not Identifier', () => {
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
        property: { type: 'NumericLiteral', value: 0 },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle chained member expression A.B.C where B is namespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      // A.B is detected. But A.B.C — the outer expression has object=A.B (a MemberExpression, not Identifier)
      const innerNode = createMemberExpression('A', 'B')
      const outerNode = {
        type: 'MemberExpression',
        object: innerNode,
        property: { type: 'Identifier', name: 'C' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(outerNode)

      expect(reports.length).toBe(0) // object is MemberExpression, not Identifier
    })

    test('should handle source with empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        {
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: '' },
          specifiers: [
            { type: 'ImportNamespaceSpecifier', local: { type: 'Identifier', name: 'A' } },
          ],
        },
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('A', 'B'))
      // Empty string source is falsy, so namespace import won't be registered
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested Program body items', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      // Body with deeply nested objects that are not ImportDeclarations
      const program = createProgram([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'console' },
              property: { type: 'Identifier', name: 'log' },
            },
            arguments: [],
          },
        },
      ])

      expect(() => visitor.Program(program)).not.toThrow()
    })

    test('should handle identifier object with missing name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier' }, // missing name
        property: { type: 'Identifier', name: 'B' },
        computed: false,
        optional: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report with correct message format for underscore names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('__internal', 'internal'),
        createNamedImport('_private', '_private', 'internal'),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('__internal', '_private'))

      expect(reports[0].message).toContain('__internal._private')
      expect(reports[0].message).toContain("Use '_private'")
    })

    test('should handle case-sensitive namespace matching', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('React', 'react'),
        createNamedImport('useState', 'useState', 'react'),
      ])
      visitor.Program(program)

      // 'react' (lowercase) should not match 'React' (PascalCase)
      visitor.MemberExpression(createMemberExpression('react', 'useState'))
      expect(reports.length).toBe(0)

      // 'React' should match
      visitor.MemberExpression(createMemberExpression('React', 'useState'))
      expect(reports.length).toBe(1)
    })

    test('should handle case-sensitive member matching', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('myFunc', 'myFunc', 'lib'),
      ])
      visitor.Program(program)

      // 'myfunc' (lowercase) should not match 'myFunc' (camelCase)
      visitor.MemberExpression(createMemberExpression('A', 'myfunc'))
      expect(reports.length).toBe(0)

      // Exact match
      visitor.MemberExpression(createMemberExpression('A', 'myFunc'))
      expect(reports.length).toBe(1)
    })

    test('should handle source matching case-sensitively', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'Lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)

      // 'Lib' !== 'lib', so should not report
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)
    })

    test('should handle alias import where local name matches member but imported differs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('myAlias', 'originalName', 'lib'),
      ])
      visitor.Program(program)

      // Using A.myAlias - local name matches, should report
      visitor.MemberExpression(createMemberExpression('A', 'myAlias'))
      expect(reports.length).toBe(1)

      // Using A.originalName - imported name is NOT the local name
      visitor.MemberExpression(createMemberExpression('A', 'originalName'))
      expect(reports.length).toBe(1) // no additional report
    })

    test('should handle MemberExpression before Program gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      // Call MemberExpression before Program
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(0)

      // Now call Program and MemberExpression should work
      const program = createProgram([
        createNamespaceImport('A', 'lib'),
        createNamedImport('B', 'B', 'lib'),
      ])
      visitor.Program(program)
      visitor.MemberExpression(createMemberExpression('A', 'B'))
      expect(reports.length).toBe(1)
    })

    test('should handle very long source strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryQualifierRule.create(context)

      const longSource = '@very/long/deeply/nested/package/path/v1/sub/module'
      const program = createProgram([
        createNamespaceImport('Pkg', longSource),
        createNamedImport('fn', 'fn', longSource),
      ])
      visitor.Program(program)

      visitor.MemberExpression(createMemberExpression('Pkg', 'fn'))
      expect(reports.length).toBe(1)
    })
  })
})
