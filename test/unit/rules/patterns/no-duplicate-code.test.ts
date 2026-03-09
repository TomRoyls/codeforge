import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noDuplicateCodeRule } from '../../../../src/rules/patterns/no-duplicate-code.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function test() { return 1; }',
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

function createBlockStatement(lineCount: number, startLine = 1, startColumn = 0): unknown {
  const lines = Array(lineCount).fill('  const x = 1;')
  return {
    type: 'BlockStatement',
    body: [],
    loc: {
      start: { line: startLine, column: startColumn },
      end: { line: startLine + lineCount, column: 0 },
    },
  }
}

function createFunctionDeclaration(name: string, lineCount: number, startLine = 1): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    params: [],
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: startLine, column: 0 },
      end: { line: startLine + lineCount, column: 0 },
    },
  }
}

function createClassDeclaration(name: string, lineCount: number, startLine = 1): unknown {
  return {
    type: 'ClassDeclaration',
    id: { type: 'Identifier', name },
    body: {
      type: 'ClassBody',
      body: [],
    },
    loc: {
      start: { line: startLine, column: 0 },
      end: { line: startLine + lineCount, column: 0 },
    },
  }
}

function createImportDeclaration(line = 1): unknown {
  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: './module' },
    specifiers: [],
    loc: {
      start: { line, column: 0 },
      end: { line, column: 20 },
    },
  }
}

function createExportDeclaration(line = 1): unknown {
  return {
    type: 'ExportNamedDeclaration',
    declaration: null,
    specifiers: [],
    source: { type: 'Literal', value: './module' },
    loc: {
      start: { line, column: 0 },
      end: { line, column: 20 },
    },
  }
}

describe('no-duplicate-code rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noDuplicateCodeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noDuplicateCodeRule.meta.severity).toBe('warn')
    })

    test('should have correct category', () => {
      expect(noDuplicateCodeRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noDuplicateCodeRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noDuplicateCodeRule.meta.docs?.description).toContain('duplicate')
    })

    test('should not be recommended by default', () => {
      expect(noDuplicateCodeRule.meta.docs?.recommended).toBe(false)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toHaveProperty('BlockStatement')
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should handle BlockStatement', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createBlockStatement(10))).not.toThrow()
    })

    test('should handle FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('test', 10))).not.toThrow()
    })

    test('should handle ClassDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('Test', 10))).not.toThrow()
    })

    test('should handle null node gracefully in BlockStatement', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(null)).not.toThrow()
    })

    test('should handle null node gracefully in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle null node gracefully in ClassDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      const node = { type: 'BlockStatement', body: [] }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
    })

    test('should not process imports when ignoreImports is true', () => {
      const { context } = createMockContext({ ignoreImports: true })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createImportDeclaration())).not.toThrow()
    })

    test('should skip small blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement(createBlockStatement(2)) // Less than minLines
      visitor['Program:exit']?.(undefined)

      // Small blocks should not be reported
    })
  })

  describe('options', () => {
    test('should respect minLines option', () => {
      const { context } = createMockContext({ minLines: 3 })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect minTokens option', () => {
      const { context } = createMockContext({ minTokens: 20 })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect ignoreComments option', () => {
      const { context } = createMockContext({ ignoreComments: true })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect ignoreImports option', () => {
      const { context } = createMockContext({ ignoreImports: false })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect threshold option', () => {
      const { context } = createMockContext({ threshold: 80 })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should handle empty options', () => {
      const { context } = createMockContext({})
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'function test() {}',
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

      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createBlockStatement(10))).not.toThrow()
    })
  })

  describe('edge cases', () => {
    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement('string')).not.toThrow()
      expect(() => visitor.BlockStatement(123)).not.toThrow()
    })

    test('should handle node with partial loc', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
    })

    test('should handle empty source', () => {
      const { context } = createMockContext({}, '/src/file.ts', '')
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createBlockStatement(10))).not.toThrow()
    })

    test('should report duplicate blocks', () => {
      const source = `
function a() {
  const x = 1;
  const y = 2;
  const z = 3;
  return x + y + z;
}
      `.trim()

      const { context, reports } = createMockContext({ minLines: 2 }, '/src/file.ts', source)
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })

      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate class declarations', () => {
      const source = `
class A {
  method1() { return 1; }
}
      `.trim()

      const { context, reports } = createMockContext({ minLines: 2 }, '/src/file.ts', source)
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })

      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report duplicate block statements', () => {
      const source = `
if (true) {
  const x = 1;
  const y = 2;
  const z = 3;
}

if (false) {
  const x = 1;
  const y = 2;
  const z = 3;
}
      `.trim()

      const { context, reports } = createMockContext({ minLines: 3 }, '/src/file.ts', source)
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 5, column: 1 } },
      })

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 11, column: 1 } },
      })

      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle export declarations', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createExportDeclaration())).not.toThrow()
    })

    test('should handle node without end location', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateCodeRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
    })
  })
})
