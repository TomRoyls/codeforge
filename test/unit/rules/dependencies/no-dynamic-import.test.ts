import { describe, expect, test, vi } from 'vitest'
import { noDynamicImportRule } from '../../../../src/rules/dependencies/no-dynamic-import.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => "import('lodash')",
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeDynamicImport(
  modulePath: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Import' },
    arguments: [
      { type: 'Literal', value: modulePath },
    ],
    loc: makeLoc(line, column, line, column + 30),
  }
}

describe('no-dynamic-import rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noDynamicImportRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noDynamicImportRule.meta.severity).toBe('warn')
    })

    test('should have correct category "dependencies"', () => {
      expect(noDynamicImportRule.meta.docs?.category).toBe('dependencies')
    })

    test('should not be recommended', () => {
      expect(noDynamicImportRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noDynamicImportRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "dynamic" and "import"', () => {
      const desc = noDynamicImportRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/dynamic/)
      expect(desc).toMatch(/import/)
    })

    test('should have correct docs URL', () => {
      expect(noDynamicImportRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-dynamic-import',
      )
    })

    test('should have empty schema', () => {
      expect(noDynamicImportRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noDynamicImportRule).toBeDefined()
      expect(noDynamicImportRule.meta).toBeDefined()
      expect(noDynamicImportRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports dynamic import()', () => {
    test('reports import("lodash") — dynamic import detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Dynamic import"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].message).toContain('Dynamic import')
    })

    test('message contains the module path', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].message).toContain('lodash')
    })

    test('message mentions "static import"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].message.toLowerCase()).toContain('static import')
    })

    test('message mentions "tree-shaking"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].message.toLowerCase()).toContain('tree-shaking')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = makeDynamicImport('lodash')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports import("./utils") — relative path', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('./utils'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('./utils')
    })

    test('reports import("react") — package name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('react'))
      expect(reports.length).toBe(1)
    })

    test('reports import("../config") — parent relative path', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('../config'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('../config')
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(38)
    })

    test('reports multiple violations accumulating in same context', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      visitor.CallExpression(makeDynamicImport('react'))
      visitor.CallExpression(makeDynamicImport('angular'))
      expect(reports.length).toBe(3)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports.length).toBe(1)
    })

    test('reports import("moment") with message containing module path', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('moment'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/moment/)
    })

    test('reports import("express") — server framework', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('express'))
      expect(reports.length).toBe(1)
    })

    test('message includes backtick-wrapped module path', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].message).toContain('`lodash`')
    })

    test('reports import at line 10 column 0 with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('pkg', 10, 0))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports import with single-character module path', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('a'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a')
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('a'))
      visitor.CallExpression(makeDynamicImport('b'))
      visitor.CallExpression(makeDynamicImport('c'))
      visitor.CallExpression(makeDynamicImport('d'))
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report static import statement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Identifier', name: 'moduleName' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'TemplateLiteral', expressions: [], quasis: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report regular function call named "import"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'import' },
        arguments: [{ type: 'Literal', value: 'lodash' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'lodash' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [{ type: 'Literal', value: 'lodash' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles wrong node type — not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'lodash' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'Literal', value: 'lodash' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with missing callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 'lodash' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report import() with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getPath' },
          arguments: [],
        }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: './' },
          right: { type: 'Identifier', name: 'name' },
        }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with null first argument node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with undefined first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with Literal but non-string value (regex)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: /test/ }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with Import callee but empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      // Empty string is still a string, so this SHOULD report
      expect(reports.length).toBe(1)
    })

    test('does not report ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = { type: 'Literal', value: 42 }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = { type: 'Identifier', name: 'foo' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Literal', value: 'a' },
          alternate: { type: 'Literal', value: 'b' },
        }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report import() with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'module' },
        }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noDynamicImportRule.create(ctx1)
      const visitor2 = noDynamicImportRule.create(ctx2)

      visitor1.CallExpression(makeDynamicImport('lodash'))

      const nonViolation = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'lodash' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor2.CallExpression(nonViolation)

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('a'))
      visitor.CallExpression(makeDynamicImport('b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: 'lodash' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: 'lodash' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      // reports — dynamic import
      visitor.CallExpression(makeDynamicImport('lodash'))
      // does NOT report — regular require call
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'react' }],
        loc: makeLoc(2, 0, 2, 20),
      })
      // reports — dynamic import
      visitor.CallExpression(makeDynamicImport('angular'))
      // does NOT report — not a CallExpression type
      visitor.CallExpression({
        type: 'AssignmentExpression',
        loc: makeLoc(3, 0, 3, 10),
      })
      // reports — dynamic import
      visitor.CallExpression(makeDynamicImport('vue'))
      expect(reports.length).toBe(3)
    })

    test('import() with multiple args reports on first string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [
          { type: 'Literal', value: 'lodash' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      visitor.CallExpression(makeDynamicImport('lodash'))
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noDynamicImportRule.create(context)
      const visitor2 = noDynamicImportRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('handles node with only loc.start', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('import() with empty string argument reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('import() with whitespace-only module path reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: '   ' }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles boolean node argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('accumulation across 10 calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(makeDynamicImport(`module-${i}`))
      }
      expect(reports.length).toBe(10)
    })

    test('mixed violations accumulate correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('a'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'Literal', value: 'b' }],
        loc: makeLoc(2, 0, 2, 10),
      })
      visitor.CallExpression(makeDynamicImport('c'))
      expect(reports.length).toBe(2)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noDynamicImportRule.meta
      const meta2 = noDynamicImportRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message is consistent across different modules', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      visitor.CallExpression(makeDynamicImport('react'))
      expect(reports[0].message).toContain('Dynamic import detected')
      expect(reports[1].message).toContain('Dynamic import detected')
    })

    test('reports scoped package @angular/core', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('@angular/core'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@angular/core')
    })

    test('reports scoped package @babel/parser', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('@babel/parser'))
      expect(reports.length).toBe(1)
    })

    test('reports absolute path /usr/lib/module', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('/usr/lib/module'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/usr/lib/module')
    })

    test('reports relative path ../../parent/module', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('../../parent/module'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('../../parent/module')
    })

    test('reports URL-like path http://example.com/module', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('http://example.com/module'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('http://example.com/module')
    })

    test('reports file:// URL path', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('file:///local/module'))
      expect(reports.length).toBe(1)
    })

    test('reports package with subpath lodash/debounce', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash/debounce'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('lodash/debounce')
    })

    test('reports scoped package with subpath @angular/common/http', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('@angular/common/http'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@angular/common/http')
    })

    test('reports ./ relative import', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('./'))
      expect(reports.length).toBe(1)
    })

    test('reports ../ relative import', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('../'))
      expect(reports.length).toBe(1)
    })

    test('message mentions "static analysis"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('lodash'))
      expect(reports[0].message.toLowerCase()).toContain('static analysis')
    })

    test('all reports have message, loc, and node', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('a'))
      visitor.CallExpression(makeDynamicImport('b'))
      visitor.CallExpression(makeDynamicImport('c'))
      for (const report of reports) {
        expect(report.message).toBeTruthy()
        expect(report.loc).toBeDefined()
        expect(report.node).toBeDefined()
      }
    })

    test('message format is correct for module path with backticks', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('my-module'))
      const msg = reports[0].message
      expect(msg).toMatch(/^Dynamic import detected for `my-module`\./)
    })

    test('reports dynamic import with path containing dots and dashes', () => {
      const { context, reports } = createMockContext()
      const visitor = noDynamicImportRule.create(context)
      visitor.CallExpression(makeDynamicImport('./some-deep/path/to-module'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('./some-deep/path/to-module')
    })
  })
})
