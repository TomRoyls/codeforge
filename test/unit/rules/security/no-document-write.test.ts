import { describe, expect, test, vi } from 'vitest'
import { noDocumentWriteRule } from '../../../../src/rules/security/no-document-write.js'
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
    getSource: () => 'document.write("hello")',
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

function makeDocWriteCall(
  propName: string = 'write',
  args: unknown[] = [{ type: 'Literal', value: 'hello' }],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'document' },
      property: { type: 'Identifier', name: propName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-document-write rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noDocumentWriteRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noDocumentWriteRule.meta.severity).toBe('error')
    })

    test('should have correct category "security"', () => {
      expect(noDocumentWriteRule.meta.docs?.category).toBe('security')
    })

    test('should be recommended', () => {
      expect(noDocumentWriteRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noDocumentWriteRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "document" and "write"', () => {
      const desc = noDocumentWriteRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('document')
      expect(desc).toContain('write')
    })

    test('should have correct docs URL', () => {
      expect(noDocumentWriteRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-document-write',
      )
    })

    test('should have empty schema', () => {
      expect(noDocumentWriteRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noDocumentWriteRule).toBeDefined()
      expect(noDocumentWriteRule.meta).toBeDefined()
      expect(noDocumentWriteRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports document.write() and document.writeln()', () => {
    test('reports document.write()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      expect(reports.length).toBe(1)
    })

    test('reports document.writeln()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('writeln'))
      expect(reports.length).toBe(1)
    })

    test('message contains "document.write"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      expect(reports[0].message).toContain('document.write')
    })

    test('message contains "XSS"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      expect(reports[0].message).toContain('XSS')
    })

    test('message mentions "textContent"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      expect(reports[0].message).toContain('textContent')
    })

    test('message mentions "createElement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      expect(reports[0].message).toContain('createElement')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = makeDocWriteCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      visitor.CallExpression(makeDocWriteCall('writeln'))
      visitor.CallExpression(makeDocWriteCall('write'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write', undefined, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports document.write() with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write', [{ type: 'Literal', value: '<script>alert(1)</script>' }]))
      expect(reports.length).toBe(1)
    })

    test('reports document.write() with variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write', [{ type: 'Identifier', name: 'userInput' }]))
      expect(reports.length).toBe(1)
    })

    test('reports document.write() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write', []))
      expect(reports.length).toBe(1)
    })

    test('reports document.writeln() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('writeln', [{ type: 'Literal', value: 'text' }]))
      expect(reports.length).toBe(1)
    })

    test('report loc has start and end objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('message mentions "innerHTML"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports[0].message.toLowerCase()).toContain('innerhtml')
    })

    test('message mentions "security risk"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports[0].message.toLowerCase()).toContain('security risk')
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports.length).toBe(1)
    })

    test('document.writeln() message contains "document.writeln"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('writeln'))
      expect(reports[0].message).toContain('document.writeln')
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report document.getElementById()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'getElementById' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'app' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.querySelector()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'querySelector' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '.app' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report elem.write() (not document)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'elem' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document["write"]() — computed access with Literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Literal', value: 'write' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'write' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles wrong node type — not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report window.write()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report element.innerHTML — not a CallExpression in callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'element' },
          property: { type: 'Identifier', name: 'innerHTML' },
        },
        right: { type: 'Literal', value: '<p>text</p>' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report regular function call write()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'write' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.createDocumentFragment()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'createDocumentFragment' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 35),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.createElement()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'createElement' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'div' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.body — not a call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'document' },
        property: { type: 'Identifier', name: 'body' },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.title — property access, not call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'document' },
        property: { type: 'Identifier', name: 'title' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.addEventListener()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'addEventListener' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.removeChild()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'removeChild' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = { type: 'CallExpression', loc: makeLoc(1, 0, 1, 10) }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee with object missing name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: null,
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.open()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'open' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.close()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'close' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report document.write with property as Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Literal', value: 'write' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.writeln computed with Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Literal', value: 'writeln' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression with object that is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'document' },
          },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.writer() — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'writer' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 17),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.writeAll() — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'writeAll' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Document.write() (capital D)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Document' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 17),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.write property access without call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'document' },
        property: { type: 'Identifier', name: 'write' },
        computed: false,
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression with document.write', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
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
      const visitor1 = noDocumentWriteRule.create(ctx1)
      const visitor2 = noDocumentWriteRule.create(ctx2)

      visitor1.CallExpression(makeDocWriteCall())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'getElementById' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation of document.write + document.writeln', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      visitor.CallExpression(makeDocWriteCall('writeln'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('document.write')
      expect(reports[1].message).toContain('document.writeln')
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and safe calls count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      // reports
      visitor.CallExpression(makeDocWriteCall('write'))
      // safe — different method
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'getElementById' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(2, 0, 2, 30),
      })
      // reports
      visitor.CallExpression(makeDocWriteCall('writeln'))
      // safe — not MemberExpression
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'write' },
        arguments: [],
        loc: makeLoc(3, 0, 3, 10),
      })
      // reports
      visitor.CallExpression(makeDocWriteCall('write'))
      expect(reports.length).toBe(3)
    })

    test('default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('document.write() with multiple arguments reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write', [
        { type: 'Literal', value: '<div>' },
        { type: 'Identifier', name: 'content' },
        { type: 'Literal', value: '</div>' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noDocumentWriteRule.create(context)
      const visitor2 = noDocumentWriteRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write', undefined, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      expect(reports.length).toBe(3)
    })

    test('handles node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = { type: 'CallExpression', arguments: [] }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee without object property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', property: { type: 'Identifier', name: 'write' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee without property on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.write with property as CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression where object type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noDocumentWriteRule.meta
      const meta2 = noDocumentWriteRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message is consistent across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('document.write vs document.writeln produce different property names in message', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noDocumentWriteRule.create(ctx1)
      const visitor2 = noDocumentWriteRule.create(ctx2)
      visitor1.CallExpression(makeDocWriteCall('write'))
      visitor2.CallExpression(makeDocWriteCall('writeln'))
      expect(rep1[0].message).toContain('document.write')
      expect(rep2[0].message).toContain('document.writeln')
      expect(rep1[0].message).not.toBe(rep2[0].message)
    })

    test('chained calls — document.write().write() — second does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall('write'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'document' },
              property: { type: 'Identifier', name: 'write' },
              computed: false,
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'write' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(2, 0, 2, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('rule name is exported as noDocumentWriteRule', () => {
      expect(noDocumentWriteRule).toBeDefined()
      expect(typeof noDocumentWriteRule.create).toBe('function')
      expect(typeof noDocumentWriteRule.meta).toBe('object')
    })

    test('two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      visitor.CallExpression(makeDocWriteCall())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report document.createComment()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'createComment' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.createTextNode()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'createTextNode' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 28),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report document.getAttribute()', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'getAttribute' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noDocumentWriteRule.meta.docs?.description).toBe('string')
      expect(noDocumentWriteRule.meta.docs!.description!.length).toBeGreaterThan(0)
    })

    test('meta docs URL is a string', () => {
      expect(typeof noDocumentWriteRule.meta.docs?.url).toBe('string')
    })

    test('meta type is one of the valid RuleType values', () => {
      const validTypes = ['layout', 'problem', 'suggestion']
      expect(validTypes).toContain(noDocumentWriteRule.meta.type)
    })

    test('meta severity is one of the valid Severity values', () => {
      const validSeverities = ['error', 'off', 'warn']
      expect(validSeverities).toContain(noDocumentWriteRule.meta.severity)
    })

    test('document.write message mentions "sanitization"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports[0].message.toLowerCase()).toContain('sanitization')
    })

    test('report message mentions "DOM manipulation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDocumentWriteRule.create(context)
      visitor.CallExpression(makeDocWriteCall())
      expect(reports[0].message).toContain('DOM manipulation')
    })
  })
})
