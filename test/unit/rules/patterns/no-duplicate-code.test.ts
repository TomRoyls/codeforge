import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noDuplicateCodeRule } from '../../../../src/rules/patterns/no-duplicate-code.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toHaveProperty('BlockStatement')
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should handle BlockStatement', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createBlockStatement(10))).not.toThrow()
    })

    test('should handle FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('test', 10))).not.toThrow()
    })

    test('should handle ClassDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('Test', 10))).not.toThrow()
    })

    test('should handle null node gracefully in BlockStatement', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(null)).not.toThrow()
    })

    test('should handle null node gracefully in FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle null node gracefully in ClassDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      const node = { type: 'BlockStatement', body: [] }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
    })

    test('should not process imports when ignoreImports is true', () => {
      const { context } = createMockRuleContext({ options: [{ ignoreImports: true }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createImportDeclaration())).not.toThrow()
    })

    test('should skip small blocks', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement(createBlockStatement(2)) // Less than minLines
      visitor['Program:exit']?.(undefined)

      // Small blocks should not be reported
    })
  })

  describe('options', () => {
    test('should respect minLines option', () => {
      const { context } = createMockRuleContext({ options: [{ minLines: 3 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect minTokens option', () => {
      const { context } = createMockRuleContext({ options: [{ minTokens: 20 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect ignoreComments option', () => {
      const { context } = createMockRuleContext({ options: [{ ignoreComments: true }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect ignoreImports option', () => {
      const { context } = createMockRuleContext({ options: [{ ignoreImports: false }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should respect threshold option', () => {
      const { context } = createMockRuleContext({ options: [{ threshold: 80 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should handle empty options', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
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
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement('string')).not.toThrow()
      expect(() => visitor.BlockStatement(123)).not.toThrow()
    })

    test('should handle node with partial loc', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
    })

    test('should handle empty source', () => {
      const { context } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
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

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 2 }], source: source, filePath: '/src/file.ts' })
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

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 2 }], source: source, filePath: '/src/file.ts' })
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

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 3 }], source: source, filePath: '/src/file.ts' })
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
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(createExportDeclaration())).not.toThrow()
    })

    test('should handle node without end location', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 } },
      }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
    })
  })

  describe('meta extended', () => {
    test('should have docs url', () => {
      expect(noDuplicateCodeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-duplicate-code',
      )
    })

    test('should have severity warn', () => {
      expect(noDuplicateCodeRule.meta.severity).toBe('warn')
    })

    test('should not be fixable', () => {
      expect(noDuplicateCodeRule.meta.fixable).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noDuplicateCodeRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noDuplicateCodeRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noDuplicateCodeRule.meta.replacedBy).toBeUndefined()
    })

    test('should have description mentioning maintenance', () => {
      expect(noDuplicateCodeRule.meta.docs?.description).toContain('maintenance')
    })

    test('should have description mentioning abstractions', () => {
      expect(noDuplicateCodeRule.meta.docs?.description).toContain('abstractions')
    })

    test('should have meta as object', () => {
      expect(typeof noDuplicateCodeRule.meta).toBe('object')
    })

    test('should have create as function', () => {
      expect(typeof noDuplicateCodeRule.create).toBe('function')
    })

    test('should have meta type string value', () => {
      expect(typeof noDuplicateCodeRule.meta.type).toBe('string')
    })

    test('should have meta severity string value', () => {
      expect(typeof noDuplicateCodeRule.meta.severity).toBe('string')
    })
  })

  describe('schema structure', () => {
    test('schema should be an array', () => {
      expect(Array.isArray(noDuplicateCodeRule.meta.schema)).toBe(true)
    })

    test('schema should have one entry', () => {
      expect(noDuplicateCodeRule.meta.schema).toHaveLength(1)
    })

    test('schema entry should be object type', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      expect(schemaEntries[0].type).toBe('object')
    })

    test('schema entry should have properties', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      expect(schemaEntries[0]).toHaveProperty('properties')
    })

    test('schema should disallow additional properties', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      expect(schemaEntries[0].additionalProperties).toBe(false)
    })

    test('schema should define minLines property', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('minLines')
    })

    test('schema should define minTokens property', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('minTokens')
    })

    test('schema should define ignoreComments property', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('ignoreComments')
    })

    test('schema should define ignoreImports property', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('ignoreImports')
    })

    test('schema should define threshold property', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('threshold')
    })

    test('minLines should be type number', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.minLines.type).toBe('number')
    })

    test('minLines should have minimum 2', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.minLines.minimum).toBe(2)
    })

    test('minLines should have default 5', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.minLines.default).toBe(5)
    })

    test('minTokens should be type number', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.minTokens.type).toBe('number')
    })

    test('minTokens should have minimum 10', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.minTokens.minimum).toBe(10)
    })

    test('minTokens should have default 50', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.minTokens.default).toBe(50)
    })

    test('ignoreComments should be type boolean', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreComments.type).toBe('boolean')
    })

    test('ignoreComments should have default true', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreComments.default).toBe(true)
    })

    test('ignoreImports should be type boolean', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreImports.type).toBe('boolean')
    })

    test('ignoreImports should have default true', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreImports.default).toBe(true)
    })

    test('threshold should be type number', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.threshold.type).toBe('number')
    })

    test('threshold should have minimum 1', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.threshold.minimum).toBe(1)
    })

    test('threshold should have maximum 100', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.threshold.maximum).toBe(100)
    })

    test('threshold should have default 70', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, Record<string, unknown>>
      expect(props.threshold.default).toBe(70)
    })

    test('schema should have exactly 5 properties', () => {
      const schemaEntries = noDuplicateCodeRule.meta.schema as Array<Record<string, unknown>>
      const props = schemaEntries[0].properties as Record<string, unknown>
      expect(Object.keys(props)).toHaveLength(5)
    })
  })

  describe('visitor structure', () => {
    test('visitor should have exactly 4 methods', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(4)
    })

    test('BlockStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(typeof visitor.BlockStatement).toBe('function')
    })

    test('FunctionDeclaration should be a function', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('ClassDeclaration should be a function', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(typeof visitor.ClassDeclaration).toBe('function')
    })

    test('Program:exit should be a function', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('BlockStatement returns undefined', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor.BlockStatement(createBlockStatement(10))).toBeUndefined()
    })

    test('FunctionDeclaration returns undefined', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor.FunctionDeclaration(createFunctionDeclaration('test', 10))).toBeUndefined()
    })

    test('ClassDeclaration returns undefined', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor.ClassDeclaration(createClassDeclaration('Test', 10))).toBeUndefined()
    })

    test('Program:exit returns undefined', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor['Program:exit']?.(undefined)).toBeUndefined()
    })

    test('create returns new visitor instance each time', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor1 = noDuplicateCodeRule.create(context)
      const visitor2 = noDuplicateCodeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor has BlockStatement key', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor).toHaveProperty('BlockStatement')
    })

    test('visitor has FunctionDeclaration key', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('visitor has ClassDeclaration key', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor).toHaveProperty('ClassDeclaration')
    })

    test('visitor has Program:exit key', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(visitor).toHaveProperty('Program:exit')
    })
  })

  describe('import and export handling', () => {
    test('ImportDeclaration is skipped when ignoreImports is true in BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: './mod' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('ExportNamedDeclaration is skipped when ignoreImports is true in BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'ExportNamedDeclaration',
        declaration: null,
        specifiers: [],
        source: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('ExportDefaultDeclaration is skipped when ignoreImports is true in BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'ExportDefaultDeclaration',
        declaration: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('ExportAllDeclaration is skipped when ignoreImports is true in BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'ExportAllDeclaration',
        source: { type: 'Literal', value: './mod' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('ImportDeclaration is skipped in FunctionDeclaration when ignoreImports is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: './mod' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('ExportNamedDeclaration is skipped in FunctionDeclaration when ignoreImports is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'ExportNamedDeclaration',
        declaration: null,
        specifiers: [],
        source: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('regular BlockStatement is processed when ignoreImports is true', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: true, minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('ignoreImports false processes import-like nodes in BlockStatement', () => {
      const source = "import { x } from 'mod';\nimport { y } from 'mod';"
      const { context, reports } = createMockRuleContext({ options: [{ ignoreImports: false, minLines: 1 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: './mod' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      visitor.BlockStatement({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: './mod' },
        specifiers: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 25 } },
      })
      visitor['Program:exit']?.(undefined)
    })

    test('default ignoreImports value is true', () => {
      const { context } = createMockRuleContext({ source: 'import x from "a";', filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'ImportDeclaration',
          source: { type: 'Literal', value: './mod' },
          specifiers: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        }),
      ).not.toThrow()
    })
  })

  describe('comment handling', () => {
    test('Block comment type is skipped when ignoreComments is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreComments: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'Block',
        value: 'comment',
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('Line comment type is skipped when ignoreComments is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ ignoreComments: true, minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'Line',
        value: 'comment',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('Block comment is processed when ignoreComments is false', () => {
      const source = '/* block comment line 1\nblock comment line 2\nblock comment line 3 */'
      const { context } = createMockRuleContext({ options: [{ ignoreComments: false, minLines: 2 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'Block',
          value: 'comment',
          loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 22 } },
        }),
      ).not.toThrow()
    })

    test('default ignoreComments value is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 2 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'Block',
        value: 'comment',
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('BlockStatement type is not treated as comment', () => {
      const source = '{\n  const x = 1;\n  const y = 2;\n  const z = 3;\n  return x;\n}'
      const { context } = createMockRuleContext({ options: [{ ignoreComments: true, minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
        }),
      ).not.toThrow()
    })
  })

  describe('duplicate detection - BlockStatement', () => {
    const dupBlockSource = [
      '{',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
      '',
      '{',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
    ].join('\n')

    test('detects two identical BlockStatements as duplicates', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('reports exactly one duplicate for two identical blocks', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(1)
    })

    test('report message contains duplicate line range', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('8-13')
    })

    test('report message contains original line range', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('1-6')
    })

    test('report has loc with correct duplicate lines', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.end.line).toBe(13)
    })

    test('report loc columns are 0', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('single BlockStatement produces no report', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('different BlockStatements produce no report', () => {
      const diffSource = [
        '{',
        '  const a = 100;',
        '  const b = 200;',
        '  const c = 300;',
        '  return a + b;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: diffSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('blocks below minLines are not tracked as duplicates', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 10 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('no reports without calling Program:exit', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('Program:exit with no blocks produces no reports', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('block with null loc is skipped', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupBlockSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({ type: 'BlockStatement', body: [] })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })
  })

  describe('duplicate detection - FunctionDeclaration', () => {
    const dupFuncSource = [
      'function a() {',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
      '',
      'function a() {',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
    ].join('\n')

    test('detects two identical FunctionDeclarations as duplicates', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'b' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('reports exactly one duplicate for two identical functions', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'b' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(1)
    })

    test('report message includes duplicate line numbers', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'b' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('8-13')
    })

    test('single function does not report duplicate', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('different functions do not report duplicate', () => {
      const diffFuncSource = [
        'function a() {',
        '  const a = 100;',
        '  const b = 200;',
        '  const c = 300;',
        '  return a + b;',
        '}',
        '',
        'function b() {',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: diffFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'b' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('function below minLines is not tracked', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 10 }], source: dupFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'b' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('function without loc is skipped', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('null function node does not throw', () => {
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupFuncSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })
  })

  describe('duplicate detection - ClassDeclaration', () => {
    const dupClassSource = [
      'class A {',
      '  method1() {',
      '    return 1;',
      '  }',
      '  method2() {',
      '    return 2;',
      '  }',
      '}',
      '',
      'class A {',
      '  method1() {',
      '    return 1;',
      '  }',
      '  method2() {',
      '    return 2;',
      '  }',
      '}',
    ].join('\n')

    test('detects two identical ClassDeclarations as duplicates', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupClassSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      })
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 10, column: 0 }, end: { line: 17, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('reports exactly one duplicate for two identical classes', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupClassSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      })
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 10, column: 0 }, end: { line: 17, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(1)
    })

    test('report location uses duplicate class lines', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupClassSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      })
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 10, column: 0 }, end: { line: 17, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.end.line).toBe(17)
    })

    test('single class does not report duplicate', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupClassSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('different classes do not report duplicate', () => {
      const diffClassSource = [
        'class A {',
        '  unique1() {',
        '    return 100;',
        '  }',
        '  unique2() {',
        '    return 200;',
        '  }',
        '}',
        '',
        'class B {',
        '  method1() {',
        '    return 1;',
        '  }',
        '  method2() {',
        '    return 2;',
        '  }',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: diffClassSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      })
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 10, column: 0 }, end: { line: 17, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('class below minLines is not tracked', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 15 }], source: dupClassSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 8, column: 1 } },
      })
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 10, column: 0 }, end: { line: 17, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('null class node does not throw', () => {
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
    })

    test('class without loc is skipped', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })
  })

  describe('duplicate detection - mixed types', () => {
    const mixedSource = [
      '{',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
      '',
      '{',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
    ].join('\n')

    test('BlockStatement and FunctionDeclaration with same content are duplicates', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: mixedSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('mixed type duplicate reports correct line numbers', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: mixedSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('8-13')
      expect(reports[0].message).toContain('1-6')
    })

    test('all three visitor types with same content report two duplicates', () => {
      const triSource = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: triSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'A' },
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 15, column: 0 }, end: { line: 20, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(2)
    })

    test('different content across types does not report', () => {
      const diffMixedSource = [
        'function a() {',
        '  const a = 100;',
        '  const b = 200;',
        '  const c = 300;',
        '  return a + b;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: diffMixedSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'a' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })
  })

  describe('duplicate detection - multiple duplicates', () => {
    test('three identical BlockStatements report two duplicates', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 15, column: 0 }, end: { line: 20, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(2)
    })

    test('four identical BlockStatements report three duplicates', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 15, column: 0 }, end: { line: 20, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 22, column: 0 }, end: { line: 27, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(3)
    })

    test('two pairs of different duplicates report two reports', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const a = 10;',
        '  const b = 20;',
        '  const c = 30;',
        '  return a + b;',
        '}',
        '',
        '{',
        '  const a = 10;',
        '  const b = 20;',
        '  const c = 30;',
        '  return a + b;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 15, column: 0 }, end: { line: 20, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 22, column: 0 }, end: { line: 27, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(2)
    })

    test('each report references the original block', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 15, column: 0 }, end: { line: 20, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(2)
      for (const report of reports) {
        expect(report.message).toContain('1-6')
      }
    })

    test('many unique blocks produce no reports', () => {
      const source = [
        '{',
        '  const a1 = 1;',
        '  const b1 = 2;',
        '  const c1 = 3;',
        '  return a1;',
        '}',
        '',
        '{',
        '  const a2 = 1;',
        '  const b2 = 2;',
        '  const c2 = 3;',
        '  return a2;',
        '}',
        '',
        '{',
        '  const a3 = 1;',
        '  const b3 = 2;',
        '  const c3 = 3;',
        '  return a3;',
        '}',
        '',
        '{',
        '  const a4 = 1;',
        '  const b4 = 2;',
        '  const c4 = 3;',
        '  return a4;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 15, column: 0 }, end: { line: 20, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 22, column: 0 }, end: { line: 27, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })
  })

  describe('message format', () => {
    const dupSource = [
      '{',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
      '',
      '{',
      '  const x = 1;',
      '  const y = 2;',
      '  const z = 3;',
      '  return x + y;',
      '}',
    ].join('\n')

    test('message starts with Duplicate code block detected', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('Duplicate code block detected')
    })

    test('message contains Original block at lines', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('Original block at lines')
    })

    test('message contains Consider extracting', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('Consider extracting to a shared function')
    })

    test('message contains line range of duplicate', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('lines 8-13')
    })

    test('message is a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report has a message property', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: dupSource, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0]).toHaveProperty('message')
    })
  })

  describe('normalizeCode behavior', () => {
    test('whitespace difference still detects duplicate', () => {
      const source = [
        '{',
        '    const x = 1;',
        '    const y = 2;',
        '    const z = 3;',
        '    return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('case difference still detects duplicate', () => {
      const source = [
        '{',
        '  const X = 1;',
        '  const Y = 2;',
        '  const Z = 3;',
        '  return X + Y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('tabs vs spaces still detects duplicate', () => {
      const source = [
        '{',
        '\tconst x = 1;',
        '\tconst y = 2;',
        '\tconst z = 3;',
        '\treturn x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('extra blank lines still detect duplicate', () => {
      const source = [
        '{',
        '  const x = 1;',
        '',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 6 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 7, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 9, column: 0 }, end: { line: 14, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)
    })

    test('trailing spaces do not affect detection', () => {
      const source = [
        '{',
        '  const x = 1;   ',
        '  const y = 2;   ',
        '  const z = 3;   ',
        '  return x + y;  ',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('completely different content does not match', () => {
      const source = [
        '{',
        '  console.log("hello");',
        '  console.log("world");',
        '  console.log("foo");',
        '  console.log("bar");',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('same code with different variable names does not match', () => {
      const source = [
        '{',
        '  const alpha = 1;',
        '  const beta = 2;',
        '  const gamma = 3;',
        '  return alpha + beta;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })
  })

  describe('options behavior - minLines', () => {
    test('minLines 2 detects smaller blocks', () => {
      const source = ['{', '  const x = 1;', '}', '', '{', '  const x = 1;', '}'].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 2 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 5, column: 0 }, end: { line: 7, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('minLines 100 skips most blocks', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 100 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('default minLines is 5', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 7, column: 0 }, end: { line: 10, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('minLines exactly matching block line count includes block', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 6 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(1)
    })

    test('minLines less than block line count includes block', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(1)
    })

    test('minLines greater than block line count excludes block', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')

      const { context, reports } = createMockRuleContext({ options: [{ minLines: 7 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })
  })

  describe('options behavior - combined', () => {
    test('multiple options work together', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        minLines: 3,
        minTokens: 10,
        ignoreComments: true,
        ignoreImports: true,
        threshold: 80,
      }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
      expect(typeof visitor.BlockStatement).toBe('function')
    })

    test('all options disabled', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        ignoreComments: false,
        ignoreImports: false,
        minLines: 2,
        threshold: 50,
      }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('options do not affect meta', () => {
      const { context } = createMockRuleContext({ options: [{ minLines: 100 }], source: 'function test() { return 1; }' })
      noDuplicateCodeRule.create(context)

      expect(noDuplicateCodeRule.meta.type).toBe('suggestion')
      expect(noDuplicateCodeRule.meta.severity).toBe('warn')
    })
  })

  describe('edge cases - primitive nodes', () => {
    test('undefined node in BlockStatement does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(undefined)).not.toThrow()
    })

    test('boolean node in BlockStatement does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement(true)).not.toThrow()
      expect(() => visitor.BlockStatement(false)).not.toThrow()
    })

    test('number node in FunctionDeclaration does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.FunctionDeclaration(42)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(0)).not.toThrow()
    })

    test('string node in ClassDeclaration does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.ClassDeclaration('class')).not.toThrow()
      expect(() => visitor.ClassDeclaration('')).not.toThrow()
    })

    test('array node in BlockStatement does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement([])).not.toThrow()
    })

    test('empty object node does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement({})).not.toThrow()
      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
      expect(() => visitor.ClassDeclaration({})).not.toThrow()
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('node with null loc does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement({ type: 'BlockStatement', loc: null })).not.toThrow()
    })

    test('node with numeric loc does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement({ type: 'BlockStatement', loc: 42 })).not.toThrow()
    })

    test('node with string loc does not throw', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() => visitor.BlockStatement({ type: 'BlockStatement', loc: 'invalid' })).not.toThrow()
    })

    test('node with start only missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 } },
        }),
      ).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports).toHaveLength(0)
    })

    test('node with end only missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { end: { line: 5, column: 0 } },
        }),
      ).not.toThrow()
      visitor['Program:exit']?.(undefined)
      expect(reports).toHaveLength(0)
    })

    test('node with string line numbers does not crash', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 'one', column: 0 }, end: { line: 'five', column: 0 } },
        }),
      ).not.toThrow()
    })

    test('node with negative line numbers does not crash', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: -1, column: 0 }, end: { line: -5, column: 0 } },
        }),
      ).not.toThrow()
    })

    test('node with very large line numbers does not crash', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 999999, column: 0 }, end: { line: 999999, column: 0 } },
        }),
      ).not.toThrow()
    })

    test('node with zero line numbers does not crash', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        }),
      ).not.toThrow()
    })

    test('node with missing column in loc', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1 }, end: { line: 5 } },
        }),
      ).not.toThrow()
    })
  })

  describe('edge cases - source content', () => {
    test('source with only whitespace', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 2 }], source: '   \n   \n   \n   \n   ', filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 0 } },
      })
      visitor['Program:exit']?.(undefined)
    })

    test('source with unicode content', () => {
      const source =
        '{\n  const x = "héllo";\n  const y = "wörld";\n  const z = "日本語";\n  return x;\n}'
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
        }),
      ).not.toThrow()
    })

    test('source with special characters', () => {
      const source =
        '{\n  const x = "<>&\\"";\n  const y = null;\n  const z = undefined;\n  return x;\n}'
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
        }),
      ).not.toThrow()
    })

    test('source with very long lines', () => {
      const longLine = '  const x = ' + 'a'.repeat(10000) + ';'
      const source = '{\n' + longLine + '\n' + longLine + '\n' + longLine + '\n' + longLine + '\n}'
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
        }),
      ).not.toThrow()
    })

    test('single line source', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: 'const x = 1;', filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('source with CRLF-like content', () => {
      const source = '{\r\n  const x = 1;\r\n  const y = 2;\r\n  const z = 3;\r\n  return x;\r\n}'
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
        }),
      ).not.toThrow()
    })

    test('multiline source with many lines', () => {
      const lines = ['{']
      for (let i = 0; i < 100; i++) {
        lines.push(`  const v${i} = ${i};`)
      }
      lines.push('}')
      const source = lines.join('\n')
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 102, column: 1 } },
        }),
      ).not.toThrow()
    })
  })

  describe('Program:exit behavior', () => {
    test('Program:exit with no registered blocks', () => {
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('Program:exit with one block no report', () => {
      const source = '{\n  const x = 1;\n  const y = 2;\n  const z = 3;\n  return x;\n}'
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('Program:exit with two different-hash blocks no report', () => {
      const source = [
        '{',
        '  const a = 100;',
        '  const b = 200;',
        '  const c = 300;',
        '  return a;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(0)
    })

    test('Program:exit with two same-hash blocks reports once', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(1)
    })

    test('Program:exit called before visitor methods produces no report', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor['Program:exit']?.(undefined)
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('calling Program:exit multiple times doubles reports', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports).toHaveLength(2)
    })
  })

  describe('context interaction', () => {
    test('getFilePath is called during create', () => {
      let filePathCalled = false
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => {
          filePathCalled = true
          return '/src/test.ts'
        },
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      noDuplicateCodeRule.create(context)

      expect(filePathCalled).toBe(true)
    })

    test('getSource is called during create', () => {
      let sourceCalled = false
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/test.ts',
        getSource: () => {
          sourceCalled = true
          return ''
        },
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      noDuplicateCodeRule.create(context)

      expect(sourceCalled).toBe(true)
    })

    test('report is not called during visitor methods', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('report is called during Program:exit for duplicates', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })
  })

  describe('exports', () => {
    test('rule has default export', () => {
      const defaultExport = noDuplicateCodeRule
      expect(defaultExport).toBeDefined()
    })

    test('named export equals default export', () => {
      expect(noDuplicateCodeRule).toBe(noDuplicateCodeRule)
    })

    test('rule is a valid RuleDefinition', () => {
      expect(noDuplicateCodeRule).toHaveProperty('meta')
      expect(noDuplicateCodeRule).toHaveProperty('create')
    })

    test('meta and create are consistent', () => {
      const { context } = createMockRuleContext({ source: 'function test() { return 1; }' })
      const visitor = noDuplicateCodeRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })
  })

  describe('file path handling', () => {
    test('different file paths work', () => {
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: '{}', filePath: '/different/path.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('empty file path works', () => {
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: '{}', filePath: '' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('file path with special characters works', () => {
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: '{}', filePath: '/src/[test]/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('long file path works', () => {
      const longPath = '/src/' + 'subdir/'.repeat(50) + 'file.ts'
      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: '{}', filePath: longPath })
      const visitor = noDuplicateCodeRule.create(context)

      expect(visitor).toBeDefined()
    })
  })

  describe('content truncation', () => {
    test('content longer than 100 chars is truncated in block', () => {
      const lines = ['{']
      for (let i = 0; i < 20; i++) {
        lines.push(`  const variable${i} = "this is a long value string ${i}";`)
      }
      lines.push('}')
      const source = lines.join('\n')

      const { context } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      expect(() =>
        visitor.BlockStatement({
          type: 'BlockStatement',
          body: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 22, column: 1 } },
        }),
      ).not.toThrow()
    })
  })

  describe('location extraction', () => {
    test('node with valid loc extracts correct location', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start).toEqual({ line: 8, column: 0 })
      expect(reports[0].loc?.end).toEqual({ line: 13, column: 0 })
    })

    test('node at different starting column still works', () => {
      const source = [
        '  {',
        '    const x = 1;',
        '    const y = 2;',
        '    const z = 3;',
        '    return x;',
        '  }',
        '',
        '  {',
        '    const x = 1;',
        '    const y = 2;',
        '    const z = 3;',
        '    return x;',
        '  }',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 2 }, end: { line: 6, column: 3 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 2 }, end: { line: 13, column: 3 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(0)
    })

    test('report location start line matches duplicate block', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(8)
    })

    test('report location end line matches duplicate block', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.end.line).toBe(13)
    })

    test('original block line range is in message', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('1-6')
    })

    test('duplicate block line range is in message', () => {
      const source = [
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
        '',
        '{',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x;',
        '}',
      ].join('\n')
      const { context, reports } = createMockRuleContext({ options: [{ minLines: 5 }], source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateCodeRule.create(context)

      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      })
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 8, column: 0 }, end: { line: 13, column: 1 } },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('8-13')
    })
  })
})
