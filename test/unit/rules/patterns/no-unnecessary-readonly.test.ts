import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReadonlyRule } from '../../../../src/rules/patterns/no-unnecessary-readonly.js'
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
    getSource: () => 'readonly prop: never',
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

function makeTSPropertyNode(
  keyName = 'prop',
  readonly = true,
  optional = false,
  innerType = 'TSNeverKeyword',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'TSPropertySignature',
    readonly,
    optional,
    key: { type: 'Identifier', name: keyName },
    typeAnnotation: {
      type: 'TSTypeAnnotation',
      typeAnnotation: { type: innerType },
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-readonly rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReadonlyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReadonlyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReadonlyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReadonlyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReadonlyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning readonly', () => {
      const desc = noUnnecessaryReadonlyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/readonly/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReadonlyRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-readonly',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReadonlyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSPropertySignature', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(visitor).toHaveProperty('TSPropertySignature')
      expect(typeof visitor.TSPropertySignature).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReadonlyRule).toBeDefined()
      expect(noUnnecessaryReadonlyRule.meta).toBeDefined()
      expect(noUnnecessaryReadonlyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY READONLY (25) =====

  describe('positive cases — reports unnecessary readonly', () => {
    test('reports for readonly property with never type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop'))
      expect(reports.length).toBe(1)
    })

    test('reports for key named "data"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('data'))
      expect(reports.length).toBe(1)
    })

    test('reports for key named "value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('value'))
      expect(reports.length).toBe(1)
    })

    test('reports for key named "items"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('items'))
      expect(reports.length).toBe(1)
    })

    test('reports for key named "config"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('config'))
      expect(reports.length).toBe(1)
    })

    test('reports for key named "result"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('result'))
      expect(reports.length).toBe(1)
    })

    test('reports for single character key "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('x'))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore prefixed key "_internal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_internal'))
      expect(reports.length).toBe(1)
    })

    test('reports for dollar sign key "$schema"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('$schema'))
      expect(reports.length).toBe(1)
    })

    test('reports for camelCase key "myProp"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('myProp'))
      expect(reports.length).toBe(1)
    })

    test('reports for PascalCase key "MyProp"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('MyProp'))
      expect(reports.length).toBe(1)
    })

    test('reports when optional is false explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false))
      expect(reports.length).toBe(1)
    })

    test('reports when optional is undefined (not set)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('reports when optional is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        optional: null,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('reports when optional is 0 (falsy but not true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        optional: 0,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('reports when optional is empty string (falsy but not true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        optional: '',
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('a'))
      visitor.TSPropertySignature(makeTSPropertyNode('b'))
      expect(reports.length).toBe(2)
    })

    test('reports for three separate properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('x'))
      visitor.TSPropertySignature(makeTSPropertyNode('y'))
      visitor.TSPropertySignature(makeTSPropertyNode('z'))
      expect(reports.length).toBe(3)
    })

    test('reports for SCREAMING_SNAKE key "MAX_SIZE"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('MAX_SIZE'))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric-ish key "prop1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop1'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('name'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "type"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('type'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "id"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('id'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "callback"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('callback'))
      expect(reports.length).toBe(1)
    })

    test('reports for key "handler"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('handler'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains key name "prop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop'))
      expect(reports[0].message).toContain("'prop'")
    })

    test('report message contains key name "data"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('data'))
      expect(reports[0].message).toContain("'data'")
    })

    test('report message mentions "readonly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop'))
      expect(reports[0].message.toLowerCase()).toContain('readonly')
    })

    test('report message mentions "never"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop'))
      expect(reports[0].message.toLowerCase()).toContain('never')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('myProp'))
      expect(reports[0].message).toBe(
        "Unnecessary readonly on 'myProp' with never type.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TSPropertySignature node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = makeTSPropertyNode('prop')
      visitor.TSPropertySignature(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSNeverKeyword', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSNeverKeyword', 5, 10, 8, 5))
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for different keys have different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('alpha'))
      visitor.TSPropertySignature(makeTSPropertyNode('beta'))
      expect(reports[0].message).toContain("'alpha'")
      expect(reports[1].message).toContain("'beta'")
    })

    test('report message uses "property" for non-Identifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'StringLiteral', value: 'computed' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports[0].message).toContain("'property'")
    })

    test('report message uses "property" when key has no name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports[0].message).toContain("'property'")
    })

    test('report message uses "property" when key is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: null,
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports[0].message).toContain("'property'")
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-readonly property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', false, false, 'TSNeverKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly undefined (not set)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for optional property with never type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, true, 'TSNeverKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly property with string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSStringKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly property with number type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSNumberKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly property with boolean type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSBooleanKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly property with any type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSAnyKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly property with void type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSVoidKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly property with unknown type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSUnknownKeyword'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(() => visitor.TSPropertySignature(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(() => visitor.TSPropertySignature(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(() => visitor.TSPropertySignature({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(() => visitor.TSPropertySignature('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(() => visitor.TSPropertySignature(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(() => visitor.TSPropertySignature(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: null,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: 'string',
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when inner typeAnnotation is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: { type: 'TSTypeAnnotation' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when inner typeAnnotation is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: null },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when inner typeAnnotation is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: 'never' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly false with never type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: false,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReadonlyRule.create(ctx1)
      const visitor2 = noUnnecessaryReadonlyRule.create(ctx2)
      visitor1.TSPropertySignature(makeTSPropertyNode('a'))
      visitor2.TSPropertySignature(makeTSPropertyNode('b', false, false, 'TSNumberKeyword'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('a'))
      visitor.TSPropertySignature(makeTSPropertyNode('b', false, false, 'TSStringKeyword'))
      visitor.TSPropertySignature(makeTSPropertyNode('c'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
      }
      visitor.TSPropertySignature(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('a'))
      visitor.TSPropertySignature(makeTSPropertyNode('b', false, false, 'TSStringKeyword'))
      visitor.TSPropertySignature(makeTSPropertyNode('c', true, true, 'TSNeverKeyword'))
      visitor.TSPropertySignature(makeTSPropertyNode('d'))
      visitor.TSPropertySignature(makeTSPropertyNode('e', true, false, 'TSNumberKeyword'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReadonlyRule.create(context)
      const visitor2 = noUnnecessaryReadonlyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReadonlyRule.meta
      const meta2 = noUnnecessaryReadonlyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        computed: false,
        static: false,
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: {},
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = makeTSPropertyNode('prop')
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReadonlyRule).toBeDefined()
      expect(typeof noUnnecessaryReadonlyRule.create).toBe('function')
      expect(typeof noUnnecessaryReadonlyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('alpha'))
      visitor.TSPropertySignature(makeTSPropertyNode('beta'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'alpha'")
      expect(reports[1].message).toContain("'beta'")
    })

    test('handles node with accessibility property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        accessibility: 'public',
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('does not report for readonly string "true" (not boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: 'true',
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for readonly number 1 (truthy but not true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: 1,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSNeverKeyword' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('prop', true, false, 'TSNeverKeyword', 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      expect(() => visitor.TSPropertySignature([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for TSArrayType inner type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReadonlyRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        readonly: true,
        key: { type: 'Identifier', name: 'prop' },
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: { type: 'TSArrayType' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(0)
    })
  })
})
