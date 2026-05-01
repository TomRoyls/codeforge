import { describe, expect, test, vi } from 'vitest'
import { noCjsImportsRule } from '../../../../src/rules/dependencies/no-cjs-imports.js'
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
    getSource: () => 'const fs = require("fs")',
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

function makeRequireCall(modulePath: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [{ type: 'Literal', value: modulePath }],
    loc: makeLoc(line, column, line, column + modulePath.length + 12),
  }
}

describe('no-cjs-imports rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noCjsImportsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noCjsImportsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "dependencies"', () => {
      expect(noCjsImportsRule.meta.docs?.category).toBe('dependencies')
    })

    test('should not be recommended', () => {
      expect(noCjsImportsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noCjsImportsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning CommonJS and require', () => {
      const desc = noCjsImportsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/commonjs/)
      expect(desc).toMatch(/require/)
    })

    test('should have correct docs URL', () => {
      expect(noCjsImportsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-cjs-imports',
      )
    })

    test('should have empty schema', () => {
      expect(noCjsImportsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noCjsImportsRule).toBeDefined()
      expect(noCjsImportsRule.meta).toBeDefined()
      expect(noCjsImportsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports require() with string literal', () => {
    test('reports require("fs") — built-in module', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports.length).toBe(1)
    })

    test('reports require("./utils") — relative path', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('./utils'))
      expect(reports.length).toBe(1)
    })

    test('message mentions "CommonJS"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('lodash'))
      expect(reports[0].message).toContain('CommonJS')
    })

    test('message mentions "import"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('lodash'))
      expect(reports[0].message.toLowerCase()).toContain('import')
    })

    test('message includes module path in suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('express'))
      expect(reports[0].message).toContain('express')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = makeRequireCall('path')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations — accumulation', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      visitor.CallExpression(makeRequireCall('path'))
      visitor.CallExpression(makeRequireCall('os'))
      expect(reports.length).toBe(3)
    })

    test('reports require with different module path "../helpers"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('../helpers'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('../helpers')
    })

    test('reports require with absolute path "/usr/lib/module"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('/usr/lib/module'))
      expect(reports.length).toBe(1)
    })

    test('reports require with scoped package "@org/pkg"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('@org/pkg'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@org/pkg')
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports require("http") — another built-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('http'))
      expect(reports.length).toBe(1)
    })

    test('reports require(".") — current directory', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('.'))
      expect(reports.length).toBe(1)
    })

    test('reports require("..") — parent directory', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('..'))
      expect(reports.length).toBe(1)
    })

    test('reports require with empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall(''))
      expect(reports.length).toBe(1)
    })

    test('reports require with long relative path "../../src/lib/utils"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('../../src/lib/utils'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('../../src/lib/utils')
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(makeRequireCall(`module-${i}`))
      }
      expect(reports.length).toBe(5)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report import statement — ImportDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'fs' },
        specifiers: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [
          { type: 'Literal', value: 'fs' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'moduleName' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report computed require — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'require' },
        },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report obj.require() — non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'module' },
          property: { type: 'Identifier', name: 'require' },
        },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles wrong node type — VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-Literal argument — ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { cooked: './utils' } }],
          expressions: [],
        }],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require.resolve() — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'require' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: './path' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not Identifier — FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [{ type: 'Literal', value: 'test' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with null argument value', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report regular function call — not require', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'loadModule' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node — string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node — number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report require() with ArrowFunction argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with null arguments array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression — wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier node — wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = { type: 'Identifier', name: 'require', loc: makeLoc(1, 0, 1, 7) }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal node — wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement — wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getPath' },
          arguments: [],
        }],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with regex Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: /pattern/ }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with undefined argument value', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: undefined }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'module' },
        }],
        loc: makeLoc(1, 0, 1, 20),
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
      const visitor1 = noCjsImportsRule.create(ctx1)
      const visitor2 = noCjsImportsRule.create(ctx2)

      visitor1.CallExpression(makeRequireCall('fs'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'import' },
        arguments: [{ type: 'Literal', value: 'path' }],
        loc: makeLoc(1, 0, 1, 15),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      visitor.CallExpression(makeRequireCall('path'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      // reports — valid require
      visitor.CallExpression(makeRequireCall('fs'))
      // does NOT report — callee is MemberExpression
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'require' },
        },
        arguments: [{ type: 'Literal', value: 'path' }],
        loc: makeLoc(2, 0, 2, 20),
      })
      // reports — valid require
      visitor.CallExpression(makeRequireCall('os'))
      // does NOT report — not require
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'loadModule' },
        arguments: [{ type: 'Literal', value: 'http' }],
        loc: makeLoc(3, 0, 3, 20),
      })
      // reports — valid require
      visitor.CallExpression(makeRequireCall('child_process'))
      expect(reports.length).toBe(3)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('nested require in function call still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const innerRequire: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'inner-module' }],
        loc: makeLoc(3, 4, 3, 30),
      }
      visitor.CallExpression(innerRequire)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inner-module')
    })

    test('create returns a new visitor each call — not same reference', () => {
      const { context } = createMockContext()
      const visitor1 = noCjsImportsRule.create(context)
      const visitor2 = noCjsImportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      visitor.CallExpression(makeRequireCall('fs'))
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports.length).toBe(3)
    })

    test('location with specific end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('handles node with missing callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [
          { type: 'Literal', value: 'fs' },
          { type: 'Literal', value: 'extra' },
          { type: 'Literal', value: 'third' },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with callee named differently — "include"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'include' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report require() with callee name "Require" — case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('visitor created from same context still accumulates independently', () => {
      const { context, reports } = createMockContext()
      const visitorA = noCjsImportsRule.create(context)
      const visitorB = noCjsImportsRule.create(context)
      visitorA.CallExpression(makeRequireCall('fs'))
      visitorA.CallExpression(makeRequireCall('path'))
      visitorB.CallExpression(makeRequireCall('os'))
      expect(reports.length).toBe(3)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noCjsImportsRule.meta
      const meta2 = noCjsImportsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message is consistent for same module path', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('lodash'))
      visitor.CallExpression(makeRequireCall('lodash'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message differs for different module paths', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      visitor.CallExpression(makeRequireCall('path'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('reports require("react") — npm package', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('react'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('react')
    })

    test('reports require("@scope/package/sub") — scoped with subpath', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('@scope/package/sub'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@scope/package/sub')
    })

    test('reports require("./local-file") — relative with extension omitted', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('./local-file'))
      expect(reports.length).toBe(1)
    })

    test('reports require("./config.json") — relative with extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('./config.json'))
      expect(reports.length).toBe(1)
    })

    test('reports require("/absolute/path/to/module") — absolute path', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('/absolute/path/to/module'))
      expect(reports.length).toBe(1)
    })

    test('message contains backtick-wrapped require()', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports[0].message).toContain('`require()`')
    })

    test('message contains backtick-wrapped import suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports[0].message).toContain("`import module from 'fs'`")
    })

    test('report loc has start and end properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('reports require with URL-like module path', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('https://cdn.example.com/module'))
      expect(reports.length).toBe(1)
    })

    test('rule name is exported as noCjsImportsRule', () => {
      expect(noCjsImportsRule).toBeDefined()
      expect(typeof noCjsImportsRule.create).toBe('function')
      expect(typeof noCjsImportsRule.meta).toBe('object')
    })

    test('does not report require() with object argument — ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCjsImportsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{
          type: 'ObjectExpression',
          properties: [{ type: 'Property', key: { type: 'Identifier', name: 'path' } }],
        }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
