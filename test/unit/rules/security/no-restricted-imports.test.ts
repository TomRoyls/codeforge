import { describe, expect, test, vi } from 'vitest'
import { noRestrictedImportsRule } from '../../../../src/rules/security/no-restricted-imports.js'
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
    getSource: () => "import cp from 'child_process'",
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

function makeImportDecl(sourceValue: string, line = 1, column = 0): unknown {
  const sourceLength = sourceValue.length
  const source = {
    type: 'StringLiteral',
    value: sourceValue,
    loc: makeLoc(line, column, line, column + sourceLength),
  }
  return {
    type: 'ImportDeclaration',
    source,
    specifiers: [],
    loc: makeLoc(line, column, line, column + sourceLength + 10),
  }
}

function makeRequireCall(sourceValue: string, line = 1, column = 0): unknown {
  const sourceLength = sourceValue.length
  const arg = {
    type: 'StringLiteral',
    value: sourceValue,
    loc: makeLoc(line, column, line, column + sourceLength),
  }
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [arg],
    loc: makeLoc(line, column, line, column + sourceLength + 12),
  }
}

describe('no-restricted-imports rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noRestrictedImportsRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noRestrictedImportsRule.meta.severity).toBe('error')
    })

    test('should have correct category "security"', () => {
      expect(noRestrictedImportsRule.meta.docs?.category).toBe('security')
    })

    test('should be recommended', () => {
      expect(noRestrictedImportsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noRestrictedImportsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "restricted" and "import"', () => {
      const desc = noRestrictedImportsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/restricted/)
      expect(desc).toMatch(/import/)
    })

    test('should have correct docs URL', () => {
      expect(noRestrictedImportsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-restricted-imports',
      )
    })

    test('should have empty schema', () => {
      expect(noRestrictedImportsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (3) =====
  describe('structure', () => {
    test('create() returns visitor with ImportDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(visitor).toHaveProperty('ImportDeclaration')
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })

    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRestrictedImportsRule).toBeDefined()
      expect(noRestrictedImportsRule.meta).toBeDefined()
      expect(noRestrictedImportsRule.create).toBeDefined()
    })
  })

  // ===== IMPORT DECLARATION POSITIVE (18) =====
  describe('ImportDeclaration — reports restricted modules', () => {
    test('reports import from "eval"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('eval'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "child_process"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('child_process'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "fs/promises"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('fs/promises'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "crypto"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('crypto'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "os"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('os'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "path"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('path'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "vm"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('vm'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "cluster"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('cluster'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "net"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('net'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "tls"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('tls'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "https"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('https'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "http"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('http'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "dns"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('dns'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "dgram"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('dgram'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "url"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('url'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "node:fs/promises" (strips node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('node:fs/promises'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "node:child_process" (strips node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('node:child_process'))
      expect(reports.length).toBe(1)
    })

    test('reports import from "node:vm" (strips node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('node:vm'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== IMPORT DECLARATION NEGATIVE (12) =====
  describe('ImportDeclaration — does NOT report', () => {
    test('does not report import from "lodash"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('lodash'))
      expect(reports.length).toBe(0)
    })

    test('does not report import from "react"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('react'))
      expect(reports.length).toBe(0)
    })

    test('does not report import from "express"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('express'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-ImportDeclaration type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when source is not StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'TemplateLiteral', value: 'eval' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when source is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when source value is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl(''))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(() => visitor.ImportDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report import from "node:lodash" (safe module with node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('node:lodash'))
      expect(reports.length).toBe(0)
    })

    test('does not report import from "fs" (not in restricted list)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('fs'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== CALL EXPRESSION POSITIVE (18) =====
  describe('CallExpression — reports require() of restricted modules', () => {
    test('reports require("eval")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('eval'))
      expect(reports.length).toBe(1)
    })

    test('reports require("child_process")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('child_process'))
      expect(reports.length).toBe(1)
    })

    test('reports require("fs/promises")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs/promises'))
      expect(reports.length).toBe(1)
    })

    test('reports require("crypto")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('crypto'))
      expect(reports.length).toBe(1)
    })

    test('reports require("os")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('os'))
      expect(reports.length).toBe(1)
    })

    test('reports require("path")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('path'))
      expect(reports.length).toBe(1)
    })

    test('reports require("vm")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('vm'))
      expect(reports.length).toBe(1)
    })

    test('reports require("cluster")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('cluster'))
      expect(reports.length).toBe(1)
    })

    test('reports require("dgram")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('dgram'))
      expect(reports.length).toBe(1)
    })

    test('reports require("net")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('net'))
      expect(reports.length).toBe(1)
    })

    test('reports require("tls")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('tls'))
      expect(reports.length).toBe(1)
    })

    test('reports require("https")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('https'))
      expect(reports.length).toBe(1)
    })

    test('reports require("http")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('http'))
      expect(reports.length).toBe(1)
    })

    test('reports require("dns")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('dns'))
      expect(reports.length).toBe(1)
    })

    test('reports require("node:eval") (strips node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('node:eval'))
      expect(reports.length).toBe(1)
    })

    test('reports require("node:crypto") (strips node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('node:crypto'))
      expect(reports.length).toBe(1)
    })

    test('reports require("node:path") (strips node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('node:path'))
      expect(reports.length).toBe(1)
    })

    test('reports require("node:os") (strips node: prefix)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('node:os'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== CALL EXPRESSION NEGATIVE (12) =====
  describe('CallExpression — does NOT report', () => {
    test('does not report require("lodash")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('lodash'))
      expect(reports.length).toBe(0)
    })

    test('does not report require("react")', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('react'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } },
        arguments: [{ type: 'StringLiteral', value: 'eval' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is not "require"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'import' },
        arguments: [{ type: 'StringLiteral', value: 'eval' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is not StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Identifier', name: 'myModule' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report require("fs") (not in restricted list)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('fs'))
      expect(reports.length).toBe(0)
    })

    test('does not report require("buffer") (not in restricted list)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('buffer'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== MESSAGE CONTENT (8) =====
  describe('message content', () => {
    test('eval import message mentions "security risk"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('eval'))
      expect(reports[0].message).toContain('security risk')
    })

    test('child_process import message mentions "command injection"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('child_process'))
      expect(reports[0].message).toContain('command injection')
    })

    test('vm import message mentions "arbitrary code"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('vm'))
      expect(reports[0].message).toContain('arbitrary code')
    })

    test('generic module import message mentions "restricted module"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('crypto'))
      expect(reports[0].message).toContain('restricted module')
    })

    test('eval require message mentions "security risk"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('eval'))
      expect(reports[0].message).toContain('security risk')
    })

    test('child_process require message mentions "command injection"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('child_process'))
      expect(reports[0].message).toContain('command injection')
    })

    test('vm require message mentions "arbitrary code"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('vm'))
      expect(reports[0].message).toContain('arbitrary code')
    })

    test('generic require message mentions original source value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('node:crypto'))
      expect(reports[0].message).toContain('node:crypto')
    })
  })

  // ===== EDGE CASES (10) =====
  describe('edge cases', () => {
    test('report has loc for ImportDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('eval', 5, 2))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node for ImportDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('eval'))
      expect(reports[0].node).toBeDefined()
    })

    test('report has loc for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('eval', 3, 4))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression(makeRequireCall('eval'))
      expect(reports[0].node).toBeDefined()
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRestrictedImportsRule.create(ctx1)
      const visitor2 = noRestrictedImportsRule.create(ctx2)
      visitor1.ImportDeclaration(makeImportDecl('eval'))
      visitor2.ImportDeclaration(makeImportDecl('lodash'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulates reports for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('eval'))
      visitor.CallExpression(makeRequireCall('child_process'))
      expect(reports.length).toBe(2)
    })

    test('handles node where source value is non-string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'StringLiteral', value: 42 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [{ type: 'StringLiteral', value: 'eval' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with null first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive) for ImportDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      expect(() => visitor.ImportDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL COVERAGE (6) =====
  describe('additional coverage', () => {
    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noRestrictedImportsRule.meta
      const meta2 = noRestrictedImportsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noRestrictedImportsRule.meta.docs?.description).toBe('string')
      expect(noRestrictedImportsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta severity is one of valid values', () => {
      expect(['error', 'warn', 'off']).toContain(noRestrictedImportsRule.meta.severity)
    })

    test('meta type is one of valid values', () => {
      expect(['layout', 'problem', 'suggestion']).toContain(noRestrictedImportsRule.meta.type)
    })

    test('creates a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noRestrictedImportsRule.create(context)
      const visitor2 = noRestrictedImportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedImportsRule.create(context)
      visitor.ImportDeclaration(makeImportDecl('eval'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })
})
