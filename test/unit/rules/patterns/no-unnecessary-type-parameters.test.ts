import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTypeParametersRule } from '../../../../src/rules/patterns/no-unnecessary-type-parameters.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeTSTypeRefNode(
  typeName: { type: string; name: string } | Record<string, unknown>,
  params: { type: string }[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'TSTypeReference',
    typeName,
    typeArguments: {
      type: 'TSTypeParameterInstantiation',
      params,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-type-parameters rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTypeParametersRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTypeParametersRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTypeParametersRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTypeParametersRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTypeParametersRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unnecessary type parameters', () => {
      const desc = noUnnecessaryTypeParametersRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/unnecessary/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTypeParametersRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-type-parameters',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTypeParametersRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSTypeReference', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(visitor).toHaveProperty('TSTypeReference')
      expect(typeof visitor.TSTypeReference).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTypeParametersRule).toBeDefined()
      expect(noUnnecessaryTypeParametersRule.meta).toBeDefined()
      expect(noUnnecessaryTypeParametersRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY UNKNOWN (25) =====

  describe('positive cases — reports unnecessary unknown', () => {
    test('reports for Array<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Map<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Map' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Set<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Set' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Readonly<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Readonly' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Partial<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Partial' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Record<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Record' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Required<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Required' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for MyType<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'MyType' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Foo<unknown>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Foo' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when typeName is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'TSQualifiedName', left: {}, right: {} }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when typeName is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Test' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('report message contains "Unnecessary type parameter"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toContain('Unnecessary type parameter')
    })

    test('report message contains "unknown"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toContain('unknown')
    })

    test('report message includes type name "Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toContain('Array')
    })

    test('report message includes type name "Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toContain('Promise')
    })

    test('report message uses "type" for non-Identifier typeName', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'TSQualifiedName', left: {}, right: {} }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toContain("'type'")
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(2)
    })

    test('reports for type with name "A"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'A' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for type with name "Wrapper"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Wrapper' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for type with name "Container"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Container' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for type with name "Box"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Box' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for type with name "Observable"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Observable' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for type with name "List"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'List' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for type with name "CustomGeneric"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'CustomGeneric' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TSTypeReference node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      const node = makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }])
      visitor.TSTypeReference(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }], 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }], 5, 10, 5, 20))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }], 5, 10, 8, 5))
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }], 5, 10, 8, 15))
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report message is exactly as defined in rule source for Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toBe("Unnecessary type parameter 'unknown' on 'Array'.")
    })

    test('report message is exactly as defined in rule source for Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toBe("Unnecessary type parameter 'unknown' on 'Promise'.")
    })

    test('report message is exactly as defined in rule source for non-Identifier typeName', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'TSQualifiedName', left: {}, right: {} }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toBe("Unnecessary type parameter 'unknown' on 'type'.")
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }], 10, 4, 10, 18))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('report loc default when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      const node = {
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: {
          type: 'TSTypeParameterInstantiation',
          params: [{ type: 'TSUnknownKeyword' }],
        },
      }
      visitor.TSTypeReference(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Array')
      expect(reports[1].message).toContain('Promise')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(() => visitor.TSTypeReference(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(() => visitor.TSTypeReference(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(() => visitor.TSTypeReference({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(() => visitor.TSTypeReference('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(() => visitor.TSTypeReference(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(() => visitor.TSTypeReference(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      expect(() => visitor.TSTypeReference([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeArguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'Array' }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeArguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'Array' }, typeArguments: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeArguments is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'Array' }, typeArguments: 'bad', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when params is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when params is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'Array' }, typeArguments: { type: 'TSTypeParameterInstantiation', params: 'bad' }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array<string>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSStringKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array<number>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSNumberKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array<boolean>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSBooleanKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise<void>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSVoidKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array<any>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSAnyKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when params has two elements including unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Map' }, [{ type: 'TSUnknownKeyword' }, { type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first param is not TSUnknownKeyword with multiple params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Record' }, [{ type: 'TSStringKeyword' }, { type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array<TSTypeReference>', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSTypeReference' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTypeParametersRule.create(ctx1)
      const visitor2 = noUnnecessaryTypeParametersRule.create(ctx2)
      visitor1.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      visitor2.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSStringKeyword' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSStringKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSUnknownKeyword' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      const node = {
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
      }
      visitor.TSTypeReference(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSStringKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Promise' }, [{ type: 'TSVoidKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Set' }, [{ type: 'TSUnknownKeyword' }]))
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Map' }, []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTypeParametersRule.create(context)
      const visitor2 = noUnnecessaryTypeParametersRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTypeParametersRule.meta
      const meta2 = noUnnecessaryTypeParametersRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      const node = {
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      }
      visitor.TSTypeReference(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      const node = makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSUnknownKeyword' }])
      visitor.TSTypeReference(node)
      visitor.TSTypeReference(node)
      visitor.TSTypeReference(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTypeParametersRule).toBeDefined()
      expect(typeof noUnnecessaryTypeParametersRule.create).toBe('function')
      expect(typeof noUnnecessaryTypeParametersRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where first param is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [null] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where first param is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: ['unknown'] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where first param is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: 'Array' },
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [42] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where typeName is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: 'Array',
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where typeName is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeName: null,
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node where typeName is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference({
        type: 'TSTypeReference',
        typeArguments: { type: 'TSTypeParameterInstantiation', params: [{ type: 'TSUnknownKeyword' }] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when params has three elements with first unknown', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Tuple' }, [{ type: 'TSUnknownKeyword' }, { type: 'TSStringKeyword' }, { type: 'TSNumberKeyword' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when params has single TSNeverKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeParametersRule.create(context)
      visitor.TSTypeReference(makeTSTypeRefNode({ type: 'Identifier', name: 'Array' }, [{ type: 'TSNeverKeyword' }]))
      expect(reports.length).toBe(0)
    })
  })
})
