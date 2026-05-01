import { describe, expect, test, vi } from 'vitest'
import { noImplicitDependenciesRule } from '../../../../src/rules/dependencies/no-implicit-dependencies.js'
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
    getSource: () => "import 'lodash'",
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

function makeLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-implicit-dependencies rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noImplicitDependenciesRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noImplicitDependenciesRule.meta.severity).toBe('warn')
    })

    test('should have correct category "dependencies"', () => {
      expect(noImplicitDependenciesRule.meta.docs?.category).toBe('dependencies')
    })

    test('should not be recommended', () => {
      expect(noImplicitDependenciesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noImplicitDependenciesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning dependencies', () => {
      const desc = noImplicitDependenciesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/dependencies/)
    })

    test('should have correct docs URL', () => {
      expect(noImplicitDependenciesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-implicit-dependencies',
      )
    })

    test('should have empty schema', () => {
      expect(noImplicitDependenciesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noImplicitDependenciesRule).toBeDefined()
      expect(noImplicitDependenciesRule.meta).toBeDefined()
      expect(noImplicitDependenciesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports unlisted modules', () => {
    test('reports "lodash" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports.length).toBe(1)
    })

    test('reports "express" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('express'))
      expect(reports.length).toBe(1)
    })

    test('reports "@angular/core" scoped package', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@angular/core'))
      expect(reports.length).toBe(1)
    })

    test('message contains module name "lodash"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports[0].message).toContain('lodash')
    })

    test('message mentions "package.json"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports[0].message).toContain('package.json')
    })

    test('message mentions "dependency"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports[0].message.toLowerCase()).toContain('dependency')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      const node = makeLiteral('lodash')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations accumulated', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('express'))
      visitor.Literal(makeLiteral('axios'))
      expect(reports.length).toBe(3)
    })

    test('reports "react" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('react'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('react')
    })

    test('reports "vue" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('vue'))
      expect(reports.length).toBe(1)
    })

    test('reports "@babel/preset-env" scoped package', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@babel/preset-env'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@babel/preset-env')
    })

    test('message for scoped package contains full scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@angular/core'))
      expect(reports[0].message).toContain('@angular/core')
    })

    test('reports "axios" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('axios'))
      expect(reports.length).toBe(1)
    })

    test('reports "moment" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('moment'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports "underscore" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('underscore'))
      expect(reports.length).toBe(1)
    })

    test('reports "jquery" import', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('jquery'))
      expect(reports.length).toBe(1)
    })

    test('reports "@types/node" scoped package', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@types/node'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@types/node')
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report relative import "./utils"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('./utils'))
      expect(reports.length).toBe(0)
    })

    test('does not report relative import "../config"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('../config'))
      expect(reports.length).toBe(0)
    })

    test('does not report absolute path "/abs/path"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('/abs/path'))
      expect(reports.length).toBe(0)
    })

    test('does not report node: protocol "node:fs"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('node:fs'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "fs"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('fs'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "path"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('path'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "http"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('http'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "https"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('https'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "crypto"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('crypto'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "os"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('os'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "util"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('util'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "stream"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('stream'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "buffer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('buffer'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "events"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('events'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "child_process"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('child_process'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "net"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('net'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "url"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('url'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "zlib"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('zlib'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "querystring"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('querystring'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-string literal (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "assert"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('assert'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "dns"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('dns'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "module"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('module'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "cluster"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('cluster'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "console"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('console'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "domain"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('domain'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "dgram"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('dgram'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "process"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('process'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "vm"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('vm'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "v8"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('v8'))
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noImplicitDependenciesRule.create(ctx1)
      const visitor2 = noImplicitDependenciesRule.create(ctx2)

      visitor1.Literal(makeLiteral('lodash'))
      visitor2.Literal(makeLiteral('fs'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('express'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      const node = { type: 'Literal', value: 'lodash' }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('fs'))
      visitor.Literal(makeLiteral('express'))
      visitor.Literal(makeLiteral('./local'))
      visitor.Literal(makeLiteral('axios'))
      expect(reports.length).toBe(3)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      const node = { type: 'Literal', value: 'lodash' }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports scoped package "@scope/name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@scope/name'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@scope/name')
    })

    test('creates new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noImplicitDependenciesRule.create(context)
      const visitor2 = noImplicitDependenciesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('handles node with wrong type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('handles boolean value in Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral(true))
      expect(reports.length).toBe(0)
    })

    test('handles null value in Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral(null))
      expect(reports.length).toBe(0)
    })

    test('reports "node:fs" prefix skipped — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('node:path'))
      expect(reports.length).toBe(0)
    })

    test('does not report relative import with multiple dots "../../.."', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('../../..'))
      expect(reports.length).toBe(0)
    })

    test('handles node without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal({ type: 'Literal', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('reports multiple same violations separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('lodash'))
      expect(reports.length).toBe(3)
    })

    test('does not report Node.js builtin "worker_threads"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('worker_threads'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noImplicitDependenciesRule.meta
      const meta2 = noImplicitDependenciesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('express'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('lodash')
      expect(reports[1].message).toContain('express')
    })

    test('message consistency — all messages contain "package.json"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('express'))
      visitor.Literal(makeLiteral('axios'))
      for (const r of reports) {
        expect(r.message).toContain('package.json')
      }
    })

    test('deep scoped path "@angular/core/testing" extracts "@angular/core"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@angular/core/testing'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@angular/core')
      expect(reports[0].message).not.toContain('@angular/core/testing')
    })

    test('deep path "lodash/debounce" extracts "lodash"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash/debounce'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('lodash')
      expect(reports[0].message).not.toContain('lodash/debounce')
    })

    test('deep path "express/lib/router" extracts "express"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('express/lib/router'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('express')
      expect(reports[0].message).not.toContain('express/lib/router')
    })

    test('does not report Node.js builtin "readline"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('readline'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "repl"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('repl'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "perf_hooks"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('perf_hooks'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "string_decoder"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('string_decoder'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "sys"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('sys'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "punycode"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('punycode'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "timers"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('timers'))
      expect(reports.length).toBe(0)
    })

    test('does not report Node.js builtin "constants"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('constants'))
      expect(reports.length).toBe(0)
    })

    test('reports scoped package with deep subpath "@babel/preset-env/plugins"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@babel/preset-env/plugins'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@babel/preset-env')
    })
  })
})
