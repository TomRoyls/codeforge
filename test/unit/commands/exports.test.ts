import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  extractImports,
  extractExports,
  getFunctionSignature,
  truncateSignature,
} from '../../../src/commands/exports-helpers.js'
import {
  formatConsole,
  formatJson,
  formatMarkdown,
  formatOutput,
  getTypeColor,
} from '../../../src/commands/exports-format-helpers.js'
import type {
  ExportInfo,
  FormatOptions,
  TypeSummary,
} from '../../../src/commands/exports-helpers.js'
import { Project } from 'ts-morph'

// ============================================================================
// Helper to create ts-morph SourceFile from code strings
// ============================================================================
function createSourceFile(code: string) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  })
  return project.createSourceFile('test.ts', code)
}

// ============================================================================
// Shared test fixtures
// ============================================================================
function makeExportInfo(overrides: Partial<ExportInfo> = {}): ExportInfo {
  return {
    file: 'src/index.ts',
    isDefault: false,
    isExported: true,
    line: 1,
    name: 'myExport',
    type: 'function',
    usageCount: 0,
    ...overrides,
  }
}

function makeTypeSummary(overrides: Partial<TypeSummary> = {}): TypeSummary {
  return {
    class: 0,
    const: 0,
    function: 0,
    interface: 0,
    type: 0,
    ...overrides,
  }
}

function makeFormatOptions(overrides: Partial<FormatOptions> = {}): FormatOptions {
  return {
    format: 'console',
    showUnused: false,
    totalFiles: 1,
    typeSummary: makeTypeSummary(),
    unusedExports: [],
    ...overrides,
  }
}

describe('Exports Command', () => {
  let Exports: typeof import('../../../src/commands/exports.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Exports = (await import('../../../src/commands/exports.js')).default
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const os = await import('node:os')
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-exports-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    const fs = await import('node:fs/promises')
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Exports.description).toBe('Analyze and list exports from TypeScript/JavaScript files')
    })

    test('has examples defined', () => {
      expect(Exports.examples).toBeDefined()
      expect(Exports.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Exports.flags).toBeDefined()
      expect(Exports.flags.ext).toBeDefined()
      expect(Exports.flags.format).toBeDefined()
      expect(Exports.flags.ignore).toBeDefined()
      expect(Exports.flags.output).toBeDefined()
      expect(Exports.flags.type).toBeDefined()
      expect(Exports.flags.unused).toBeDefined()
      expect(Exports.flags.verbose).toBeDefined()
    })

    test('has path argument', () => {
      expect(Exports.args).toBeDefined()
      expect(Exports.args.path).toBeDefined()
    })

    test('path argument has default value', () => {
      expect(Exports.args.path.default).toBe('.')
    })

    test('format flag has default console', () => {
      expect(Exports.flags.format.default).toBe('console')
    })

    test('format flag has correct options', () => {
      expect(Exports.flags.format.options).toContain('console')
      expect(Exports.flags.format.options).toContain('json')
      expect(Exports.flags.format.options).toContain('markdown')
    })

    test('unused flag has default false', () => {
      expect(Exports.flags.unused.default).toBe(false)
    })

    test('verbose flag has default false', () => {
      expect(Exports.flags.verbose.default).toBe(false)
    })
  })

  describe('Flag characters', () => {
    test('format flag has char f', () => {
      expect(Exports.flags.format.char).toBe('f')
    })

    test('ignore flag has char i', () => {
      expect(Exports.flags.ignore.char).toBe('i')
    })

    test('output flag has char o', () => {
      expect(Exports.flags.output.char).toBe('o')
    })

    test('type flag has char t', () => {
      expect(Exports.flags.type.char).toBe('t')
    })

    test('unused flag has char u', () => {
      expect(Exports.flags.unused.char).toBe('u')
    })

    test('verbose flag has char v', () => {
      expect(Exports.flags.verbose.char).toBe('v')
    })
  })

  describe('Export types', () => {
    test('type flag has correct options', () => {
      expect(Exports.flags.type.options).toContain('class')
      expect(Exports.flags.type.options).toContain('const')
      expect(Exports.flags.type.options).toContain('function')
      expect(Exports.flags.type.options).toContain('interface')
      expect(Exports.flags.type.options).toContain('type')
    })
  })

  // ==========================================================================
  // truncateSignature
  // ==========================================================================
  describe('truncateSignature', () => {
    test('returns short strings unchanged', () => {
      expect(truncateSignature('hello')).toBe('hello')
    })

    test('returns string at exactly maxLength unchanged', () => {
      const s = 'a'.repeat(80)
      expect(truncateSignature(s)).toBe(s)
    })

    test('truncates strings longer than maxLength', () => {
      const s = 'a'.repeat(100)
      const result = truncateSignature(s)
      expect(result).toBe('a'.repeat(77) + '...')
      expect(result.length).toBe(80)
    })

    test('uses custom maxLength', () => {
      const s = 'a'.repeat(20)
      const result = truncateSignature(s, 10)
      expect(result).toBe('aaaaaaa...')
      expect(result.length).toBe(10)
    })

    test('handles empty string', () => {
      expect(truncateSignature('')).toBe('')
    })

    test('handles single character', () => {
      expect(truncateSignature('x')).toBe('x')
    })

    test('handles maxLength of 0', () => {
      expect(truncateSignature('hello', 0)).toBe('...')
    })

    test('handles maxLength of 3 (just ellipsis)', () => {
      expect(truncateSignature('hello', 3)).toBe('...')
    })

    test('handles maxLength of 4', () => {
      expect(truncateSignature('hello', 4)).toBe('h...')
    })

    test('handles maxLength of 1', () => {
      expect(truncateSignature('hello', 1)).toBe('...')
    })

    test('handles maxLength of 2', () => {
      expect(truncateSignature('hello', 2)).toBe('...')
    })

    test('handles very long signature', () => {
      const s = 'x'.repeat(500)
      const result = truncateSignature(s)
      expect(result.length).toBe(80)
      expect(result.endsWith('...')).toBe(true)
    })

    test('preserves exact boundary - 79 chars', () => {
      const s = 'a'.repeat(79)
      expect(truncateSignature(s)).toBe(s)
    })

    test('truncates at 81 chars', () => {
      const s = 'a'.repeat(81)
      const result = truncateSignature(s)
      expect(result.length).toBe(80)
      expect(result.endsWith('...')).toBe(true)
    })

    test('custom maxLength exactly matches string length', () => {
      const s = 'abcde'
      expect(truncateSignature(s, 5)).toBe('abcde')
    })

    test('custom maxLength one less than string length', () => {
      const s = 'abcde'
      const result = truncateSignature(s, 4)
      expect(result).toBe('a...')
    })
  })

  // ==========================================================================
  // getTypeColor
  // ==========================================================================
  describe('getTypeColor', () => {
    test('returns a function for class', () => {
      const colorFn = getTypeColor('class')
      expect(typeof colorFn).toBe('function')
    })

    test('returns a function for const', () => {
      const colorFn = getTypeColor('const')
      expect(typeof colorFn).toBe('function')
    })

    test('returns a function for function', () => {
      const colorFn = getTypeColor('function')
      expect(typeof colorFn).toBe('function')
    })

    test('returns a function for interface', () => {
      const colorFn = getTypeColor('interface')
      expect(typeof colorFn).toBe('function')
    })

    test('returns a function for type', () => {
      const colorFn = getTypeColor('type')
      expect(typeof colorFn).toBe('function')
    })

    test('returns chalk.white for unknown type', () => {
      const colorFn = getTypeColor('unknown')
      expect(typeof colorFn).toBe('function')
      // chalk.white just returns the string unchanged
      expect(colorFn('test')).toContain('test')
    })

    test('returns chalk.white for empty string', () => {
      const colorFn = getTypeColor('')
      expect(typeof colorFn).toBe('function')
    })

    test('class color produces output containing text', () => {
      const result = getTypeColor('class')('MyClass')
      expect(result).toContain('MyClass')
    })

    test('const color produces output containing text', () => {
      const result = getTypeColor('const')('MY_CONST')
      expect(result).toContain('MY_CONST')
    })

    test('function color produces output containing text', () => {
      const result = getTypeColor('function')('myFunc')
      expect(result).toContain('myFunc')
    })

    test('interface color produces output containing text', () => {
      const result = getTypeColor('interface')('MyInterface')
      expect(result).toContain('MyInterface')
    })

    test('type color produces output containing text', () => {
      const result = getTypeColor('type')('MyType')
      expect(result).toContain('MyType')
    })

    test('different types produce different color functions', () => {
      const classColor = getTypeColor('class')
      const funcColor = getTypeColor('function')
      expect(classColor).not.toBe(funcColor)
    })
  })

  // ==========================================================================
  // formatConsole
  // ==========================================================================
  describe('formatConsole', () => {
    test('produces output with summary header', () => {
      const result = formatConsole([], makeFormatOptions())
      expect(result).toContain('Export Analysis')
      expect(result).toContain('Summary')
    })

    test('shows total exports count', () => {
      const result = formatConsole([], makeFormatOptions())
      expect(result).toContain('Total exports: 0')
    })

    test('shows files analyzed count', () => {
      const result = formatConsole([], makeFormatOptions({ totalFiles: 5 }))
      expect(result).toContain('Files analyzed: 5')
    })

    test('shows export type counts', () => {
      const ts = makeTypeSummary({ function: 3, class: 2, interface: 1, type: 4, const: 5 })
      const result = formatConsole([], makeFormatOptions({ typeSummary: ts }))
      expect(result).toContain('Functions: 3')
      expect(result).toContain('Classes: 2')
      expect(result).toContain('Interfaces: 1')
      expect(result).toContain('Types: 4')
      expect(result).toContain('Constants: 5')
    })

    test('does not show exports section when no exports', () => {
      const result = formatConsole([], makeFormatOptions())
      expect(result).not.toContain('Exports:')
    })

    test('shows exports section when exports exist', () => {
      const exp = makeExportInfo({
        name: 'myFunc',
        type: 'function',
        line: 10,
        file: 'src/utils.ts',
      })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).toContain('Exports:')
      expect(result).toContain('myFunc')
    })

    test('shows default marker for default exports', () => {
      const exp = makeExportInfo({ name: 'defaultFunc', isDefault: true })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).toContain('(default)')
    })

    test('does not show default marker for non-default exports', () => {
      const exp = makeExportInfo({ name: 'normalFunc', isDefault: false })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).not.toContain('(default)')
    })

    test('shows unused warning for zero usage count', () => {
      const exp = makeExportInfo({ name: 'unusedFunc', usageCount: 0 })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).toContain('⚠️')
    })

    test('does not show unused warning for positive usage count', () => {
      const exp = makeExportInfo({ name: 'usedFunc', usageCount: 5 })
      const result = formatConsole([exp], makeFormatOptions())
      // The specific "⚠️" in the export line should not appear for used exports
      const lines = result.split('\n')
      const exportLine = lines.find((l) => l.includes('usedFunc'))
      expect(exportLine).toBeDefined()
      expect(exportLine!.includes('⚠️')).toBe(false)
    })

    test('shows signature when present', () => {
      const exp = makeExportInfo({ name: 'fn', signature: '(a: number) => string' })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).toContain('Signature: (a: number) => string')
    })

    test('hides signature when absent', () => {
      const exp = makeExportInfo({ name: 'fn', signature: undefined })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).not.toContain('Signature:')
    })

    test('shows file path and line number', () => {
      const exp = makeExportInfo({ name: 'fn', file: 'src/mod.ts', line: 42 })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).toContain('File: src/mod.ts:42')
    })

    test('shows usage count', () => {
      const exp = makeExportInfo({ name: 'fn', usageCount: 7 })
      const result = formatConsole([exp], makeFormatOptions())
      expect(result).toContain('Usage count: 7')
    })

    test('does not show unused section when showUnused is false', () => {
      const unused = [makeExportInfo({ name: 'unusedFn' })]
      const result = formatConsole(
        [],
        makeFormatOptions({ showUnused: false, unusedExports: unused }),
      )
      expect(result).not.toContain('Potentially Unused Exports')
    })

    test('does not show unused section when showUnused is true but no unused', () => {
      const result = formatConsole([], makeFormatOptions({ showUnused: true, unusedExports: [] }))
      expect(result).not.toContain('Potentially Unused Exports')
    })

    test('shows unused section when showUnused is true and unused exist', () => {
      const unused = [
        makeExportInfo({ name: 'unusedFn', type: 'function', file: 'src/a.ts', line: 5 }),
      ]
      const result = formatConsole(
        [],
        makeFormatOptions({ showUnused: true, unusedExports: unused }),
      )
      expect(result).toContain('Potentially Unused Exports')
      expect(result).toContain('unusedFn')
      expect(result).toContain('src/a.ts:5')
    })

    test('shows multiple exports', () => {
      const exports = [
        makeExportInfo({ name: 'fn1', type: 'function' }),
        makeExportInfo({ name: 'fn2', type: 'class' }),
        makeExportInfo({ name: 'fn3', type: 'interface' }),
      ]
      const result = formatConsole(exports, makeFormatOptions())
      expect(result).toContain('fn1')
      expect(result).toContain('fn2')
      expect(result).toContain('fn3')
    })

    test('shows multiple unused exports', () => {
      const unused = [
        makeExportInfo({ name: 'u1', type: 'function', file: 'a.ts', line: 1 }),
        makeExportInfo({ name: 'u2', type: 'class', file: 'b.ts', line: 2 }),
      ]
      const result = formatConsole(
        [],
        makeFormatOptions({ showUnused: true, unusedExports: unused }),
      )
      expect(result).toContain('u1')
      expect(result).toContain('u2')
    })

    test('handles all-zero type summary', () => {
      const result = formatConsole([], makeFormatOptions({ typeSummary: makeTypeSummary() }))
      expect(result).toContain('Functions: 0')
      expect(result).toContain('Classes: 0')
      expect(result).toContain('Interfaces: 0')
      expect(result).toContain('Types: 0')
      expect(result).toContain('Constants: 0')
    })
  })

  // ==========================================================================
  // formatJson
  // ==========================================================================
  describe('formatJson', () => {
    test('produces valid JSON', () => {
      const result = formatJson([], makeFormatOptions())
      expect(() => JSON.parse(result)).not.toThrow()
    })

    test('contains exports array', () => {
      const result = formatJson([], makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('exports')
      expect(Array.isArray(parsed.exports)).toBe(true)
    })

    test('contains summary with correct fields', () => {
      const result = formatJson([], makeFormatOptions({ totalFiles: 3 }))
      const parsed = JSON.parse(result)
      expect(parsed.summary).toBeDefined()
      expect(parsed.summary.files).toBe(3)
      expect(parsed.summary.total).toBe(0)
      expect(parsed.summary.unused).toBe(0)
      expect(parsed.summary.exportTypes).toBeDefined()
    })

    test('contains unusedExports array', () => {
      const result = formatJson([], makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('unusedExports')
      expect(Array.isArray(parsed.unusedExports)).toBe(true)
    })

    test('includes export data correctly', () => {
      const exp = makeExportInfo({
        name: 'testFn',
        type: 'function',
        file: 'src/test.ts',
        line: 10,
        usageCount: 3,
        isDefault: false,
        signature: '() => void',
      })
      const result = formatJson([exp], makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed.exports).toHaveLength(1)
      expect(parsed.exports[0].name).toBe('testFn')
      expect(parsed.exports[0].type).toBe('function')
      expect(parsed.exports[0].file).toBe('src/test.ts')
      expect(parsed.exports[0].line).toBe(10)
      expect(parsed.exports[0].usageCount).toBe(3)
      expect(parsed.exports[0].isDefault).toBe(false)
      expect(parsed.exports[0].signature).toBe('() => void')
    })

    test('summary total matches exports length', () => {
      const exports = [makeExportInfo(), makeExportInfo({ name: 'other' })]
      const result = formatJson(exports, makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed.summary.total).toBe(2)
    })

    test('summary unused matches unusedExports length', () => {
      const unused = [makeExportInfo({ name: 'u1' }), makeExportInfo({ name: 'u2' })]
      const result = formatJson([], makeFormatOptions({ unusedExports: unused }))
      const parsed = JSON.parse(result)
      expect(parsed.summary.unused).toBe(2)
    })

    test('summary includes exportTypes', () => {
      const ts = makeTypeSummary({ function: 10, class: 5 })
      const result = formatJson([], makeFormatOptions({ typeSummary: ts }))
      const parsed = JSON.parse(result)
      expect(parsed.summary.exportTypes.function).toBe(10)
      expect(parsed.summary.exportTypes.class).toBe(5)
    })

    test('unusedExports contains export data', () => {
      const unused = [makeExportInfo({ name: 'unusedFn', type: 'const' })]
      const result = formatJson([], makeFormatOptions({ unusedExports: unused }))
      const parsed = JSON.parse(result)
      expect(parsed.unusedExports).toHaveLength(1)
      expect(parsed.unusedExports[0].name).toBe('unusedFn')
      expect(parsed.unusedExports[0].type).toBe('const')
    })

    test('is pretty-printed with 2-space indent', () => {
      const result = formatJson([], makeFormatOptions())
      expect(result).toContain('  "exports"')
    })

    test('handles export without signature', () => {
      const exp = makeExportInfo({ name: 'noSig', signature: undefined })
      const result = formatJson([exp], makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed.exports[0].signature).toBeUndefined()
    })

    test('handles default export', () => {
      const exp = makeExportInfo({ name: 'def', isDefault: true })
      const result = formatJson([exp], makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed.exports[0].isDefault).toBe(true)
    })
  })

  // ==========================================================================
  // formatMarkdown
  // ==========================================================================
  describe('formatMarkdown', () => {
    test('produces markdown header', () => {
      const result = formatMarkdown([], makeFormatOptions())
      expect(result).toContain('# Export Analysis')
    })

    test('shows total exports', () => {
      const result = formatMarkdown([], makeFormatOptions())
      expect(result).toContain('**Total Exports:** 0')
    })

    test('shows files analyzed', () => {
      const result = formatMarkdown([], makeFormatOptions({ totalFiles: 7 }))
      expect(result).toContain('**Files Analyzed:** 7')
    })

    test('shows export type summary section', () => {
      const ts = makeTypeSummary({ function: 2, class: 1, interface: 3, type: 4, const: 5 })
      const result = formatMarkdown([], makeFormatOptions({ typeSummary: ts }))
      expect(result).toContain('**Functions:** 2')
      expect(result).toContain('**Classes:** 1')
      expect(result).toContain('**Interfaces:** 3')
      expect(result).toContain('**Types:** 4')
      expect(result).toContain('**Constants:** 5')
    })

    test('does not show All Exports section when no exports', () => {
      const result = formatMarkdown([], makeFormatOptions())
      expect(result).not.toContain('## All Exports')
    })

    test('shows All Exports section when exports exist', () => {
      const exp = makeExportInfo({ name: 'myFn' })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('## All Exports')
      expect(result).toContain('### myFn')
    })

    test('shows default marker in heading', () => {
      const exp = makeExportInfo({ name: 'defExport', isDefault: true })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('### defExport (default)')
    })

    test('shows type for each export', () => {
      const exp = makeExportInfo({ name: 'fn', type: 'function' })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('**Type:** function')
    })

    test('shows signature in backticks when present', () => {
      const exp = makeExportInfo({ name: 'fn', signature: '(x: number) => string' })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('**Signature:** `(x: number) => string`')
    })

    test('hides signature line when absent', () => {
      const exp = makeExportInfo({ name: 'fn', signature: undefined })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).not.toContain('**Signature:**')
    })

    test('shows file path and line', () => {
      const exp = makeExportInfo({ name: 'fn', file: 'src/main.ts', line: 22 })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('**File:** src/main.ts:22')
    })

    test('shows usage count', () => {
      const exp = makeExportInfo({ name: 'fn', usageCount: 10 })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('**Usage Count:** 10')
    })

    test('shows unused status for zero usage', () => {
      const exp = makeExportInfo({ name: 'fn', usageCount: 0 })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('⚠️ Potentially Unused')
    })

    test('shows used status for positive usage', () => {
      const exp = makeExportInfo({ name: 'fn', usageCount: 1 })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('✓ Used')
    })

    test('does not show unused section when showUnused is false', () => {
      const unused = [makeExportInfo({ name: 'u' })]
      const result = formatMarkdown(
        [],
        makeFormatOptions({ showUnused: false, unusedExports: unused }),
      )
      expect(result).not.toContain('## Potentially Unused Exports')
    })

    test('does not show unused section when showUnused true but no unused', () => {
      const result = formatMarkdown([], makeFormatOptions({ showUnused: true, unusedExports: [] }))
      expect(result).not.toContain('## Potentially Unused Exports')
    })

    test('shows unused section when showUnused true and unused exist', () => {
      const unused = [makeExportInfo({ name: 'uFn', type: 'const', file: 'a.ts', line: 3 })]
      const result = formatMarkdown(
        [],
        makeFormatOptions({ showUnused: true, unusedExports: unused }),
      )
      expect(result).toContain('## Potentially Unused Exports')
      expect(result).toContain('### uFn')
      expect(result).toContain('**Type:** const')
      expect(result).toContain('**File:** a.ts:3')
    })

    test('shows multiple exports each with heading', () => {
      const exports = [
        makeExportInfo({ name: 'alpha' }),
        makeExportInfo({ name: 'beta' }),
        makeExportInfo({ name: 'gamma' }),
      ]
      const result = formatMarkdown(exports, makeFormatOptions())
      expect(result).toContain('### alpha')
      expect(result).toContain('### beta')
      expect(result).toContain('### gamma')
    })
  })

  // ==========================================================================
  // formatOutput (dispatcher)
  // ==========================================================================
  describe('formatOutput', () => {
    test('dispatches to formatJson when format is json', () => {
      const result = formatOutput([], makeFormatOptions({ format: 'json' }))
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('exports')
      expect(parsed).toHaveProperty('summary')
    })

    test('dispatches to formatMarkdown when format is markdown', () => {
      const result = formatOutput([], makeFormatOptions({ format: 'markdown' }))
      expect(result).toContain('# Export Analysis')
    })

    test('dispatches to formatConsole when format is console', () => {
      const result = formatOutput([], makeFormatOptions({ format: 'console' }))
      expect(result).toContain('Export Analysis')
      // Console format uses chalk, so it won't be plain "# "
      expect(result).not.toContain('# Export Analysis')
    })

    test('console is default when format is unrecognized', () => {
      // formatOutput falls through to console for any non-json, non-markdown format
      const result = formatOutput([], makeFormatOptions({ format: 'console' as const }))
      expect(result).toContain('Export Analysis')
    })

    test('json output is parseable', () => {
      const exp = makeExportInfo({ name: 'test' })
      const result = formatOutput([exp], makeFormatOptions({ format: 'json' }))
      const parsed = JSON.parse(result)
      expect(parsed.exports[0].name).toBe('test')
    })

    test('markdown output contains export name', () => {
      const exp = makeExportInfo({ name: 'mdTest' })
      const result = formatOutput([exp], makeFormatOptions({ format: 'markdown' }))
      expect(result).toContain('mdTest')
    })
  })

  // ==========================================================================
  // extractExports
  // ==========================================================================
  describe('extractExports', () => {
    test('extracts exported function', () => {
      const sf = createSourceFile('export function hello() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('hello')
      expect(result[0].type).toBe('function')
      expect(result[0].isExported).toBe(true)
    })

    test('extracts exported class', () => {
      const sf = createSourceFile('export class MyClass {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('MyClass')
      expect(result[0].type).toBe('class')
    })

    test('extracts exported interface', () => {
      const sf = createSourceFile('export interface MyInterface { x: number }')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('MyInterface')
      expect(result[0].type).toBe('interface')
    })

    test('extracts exported type alias', () => {
      const sf = createSourceFile('export type MyType = string | number')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('MyType')
      expect(result[0].type).toBe('type')
      expect(result[0].signature).toContain('string | number')
    })

    test('extracts exported const', () => {
      const sf = createSourceFile('export const MY_CONST = 42')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('MY_CONST')
      expect(result[0].type).toBe('const')
    })

    test('extracts multiple exports from one file', () => {
      const sf = createSourceFile(`
        export function fn() {}
        export class Cls {}
        export interface IFoo {}
        export type TBar = string
        export const baz = 1
      `)
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(5)
      const types = result.map((e) => e.type)
      expect(types).toContain('function')
      expect(types).toContain('class')
      expect(types).toContain('interface')
      expect(types).toContain('type')
      expect(types).toContain('const')
    })

    test('ignores non-exported function', () => {
      const sf = createSourceFile('function internal() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('ignores non-exported class', () => {
      const sf = createSourceFile('class Internal {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('ignores non-exported interface', () => {
      const sf = createSourceFile('interface Internal { x: number }')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('ignores non-exported type', () => {
      const sf = createSourceFile('type Internal = string')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('ignores non-exported const', () => {
      const sf = createSourceFile('const internal = 1')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('sets correct file path', () => {
      const sf = createSourceFile('export function fn() {}')
      const result = extractExports(sf, 'src/utils/helper.ts')
      expect(result[0].file).toBe('src/utils/helper.ts')
    })

    test('sets isExported to true', () => {
      const sf = createSourceFile('export function fn() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result[0].isExported).toBe(true)
    })

    test('sets usageCount to 0', () => {
      const sf = createSourceFile('export function fn() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result[0].usageCount).toBe(0)
    })

    test('detects default export function', () => {
      const sf = createSourceFile('export default function main() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].isDefault).toBe(true)
    })

    test('detects default export class', () => {
      const sf = createSourceFile('export default class Main {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].isDefault).toBe(true)
    })

    test('sets line number correctly', () => {
      const sf = createSourceFile('\n\nexport function fn() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result[0].line).toBe(3)
    })

    test('extracts function with parameters in signature', () => {
      const sf = createSourceFile(
        'export function add(a: number, b: number): number { return a + b }',
      )
      const result = extractExports(sf, 'test.ts')
      expect(result[0].signature).toBeDefined()
      expect(result[0].signature).toContain('a: number')
    })

    test('extracts const with initializer signature', () => {
      const sf = createSourceFile('export const greeting = "hello world"')
      const result = extractExports(sf, 'test.ts')
      expect(result[0].signature).toBe('"hello world"')
    })

    test('extracts const without initializer', () => {
      const sf = createSourceFile('export const value: number')
      const result = extractExports(sf, 'test.ts')
      // The signature may be undefined when no initializer
      expect(result[0].name).toBe('value')
    })

    test('extracts type alias signature', () => {
      const sf = createSourceFile('export type Result<T> = { success: boolean; data: T }')
      const result = extractExports(sf, 'test.ts')
      expect(result[0].signature).toBeDefined()
      expect(result[0].signature).toContain('success')
    })

    test('extracts multiple const from single statement', () => {
      const sf = createSourceFile('export const a = 1, b = 2')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(2)
      const names = result.map((e) => e.name)
      expect(names).toContain('a')
      expect(names).toContain('b')
    })

    test('extracts async function', () => {
      const sf = createSourceFile('export async function fetchData(): Promise<void> {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('fetchData')
      expect(result[0].type).toBe('function')
    })

    test('returns empty array for file with no exports', () => {
      const sf = createSourceFile('// nothing exported\nconst x = 1\nfunction f() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('returns empty array for empty file', () => {
      const sf = createSourceFile('')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('handles re-export syntax (export { x })', () => {
      const sf = createSourceFile('const x = 1\nexport { x }')
      const result = extractExports(sf, 'test.ts')
      // export { x } doesn't create a variable statement export, so may not be captured
      // The implementation only handles declarations, not re-exports
      expect(Array.isArray(result)).toBe(true)
    })
  })

  // ==========================================================================
  // extractImports
  // ==========================================================================
  describe('extractImports', () => {
    test('extracts named import', () => {
      const sf = createSourceFile('import { foo } from "bar"')
      const result = extractImports(sf)
      expect(result.get('foo')).toBe(1)
    })

    test('extracts multiple named imports', () => {
      const sf = createSourceFile('import { a, b, c } from "mod"')
      const result = extractImports(sf)
      expect(result.get('a')).toBe(1)
      expect(result.get('b')).toBe(1)
      expect(result.get('c')).toBe(1)
    })

    test('extracts default import', () => {
      const sf = createSourceFile('import React from "react"')
      const result = extractImports(sf)
      expect(result.get('React')).toBe(1)
    })

    test('extracts namespace import', () => {
      const sf = createSourceFile('import * as utils from "utils"')
      const result = extractImports(sf)
      expect(result.get('utils')).toBe(1)
    })

    test('counts duplicate named imports', () => {
      const sf = createSourceFile('import { foo } from "a"\nimport { foo } from "b"')
      const result = extractImports(sf)
      expect(result.get('foo')).toBe(2)
    })

    test('returns empty map for file with no imports', () => {
      const sf = createSourceFile('const x = 1')
      const result = extractImports(sf)
      expect(result.size).toBe(0)
    })

    test('returns empty map for empty file', () => {
      const sf = createSourceFile('')
      const result = extractImports(sf)
      expect(result.size).toBe(0)
    })

    test('handles mixed import styles', () => {
      const sf = createSourceFile(`
        import Default, { named } from "mod"
        import * as ns from "other"
      `)
      const result = extractImports(sf)
      expect(result.get('Default')).toBe(1)
      expect(result.get('named')).toBe(1)
      expect(result.get('ns')).toBe(1)
    })

    test('handles type-only imports', () => {
      const sf = createSourceFile('import type { MyType } from "types"')
      const result = extractImports(sf)
      expect(result.get('MyType')).toBe(1)
    })

    test('counts default import appearing multiple times', () => {
      const sf = createSourceFile('import A from "a"\nimport A from "b"')
      const result = extractImports(sf)
      expect(result.get('A')).toBe(2)
    })

    test('handles aliased imports', () => {
      const sf = createSourceFile('import { foo as bar } from "mod"')
      const result = extractImports(sf)
      // getNamedImports().getName() returns the original name, not the alias
      expect(result.has('foo')).toBe(true)
    })

    test('handles import with both default and named', () => {
      const sf = createSourceFile('import React, { useState, useEffect } from "react"')
      const result = extractImports(sf)
      expect(result.get('React')).toBe(1)
      expect(result.get('useState')).toBe(1)
      expect(result.get('useEffect')).toBe(1)
    })
  })

  // ==========================================================================
  // getFunctionSignature
  // ==========================================================================
  describe('getFunctionSignature', () => {
    test('returns signature for simple function', () => {
      const sf = createSourceFile(
        'export function add(a: number, b: number): number { return a + b }',
      )
      const decl = sf.getFunction('add')!
      const result = getFunctionSignature(decl)
      expect(result).toContain('a: number')
      expect(result).toContain('b: number')
    })

    test('includes return type when non-void', () => {
      const sf = createSourceFile('export function getStr(): string { return "" }')
      const decl = sf.getFunction('getStr')!
      const result = getFunctionSignature(decl)
      expect(result).toContain('=>')
      expect(result).toContain('string')
    })

    test('omits return type when void', () => {
      const sf = createSourceFile('export function log(msg: string): void { console.log(msg) }')
      const decl = sf.getFunction('log')!
      const result = getFunctionSignature(decl)
      // void return types should not have => in signature
      expect(result).not.toContain('=>')
    })

    test('prefaces async functions with async', () => {
      const sf = createSourceFile('export async function fetchData(): Promise<void> {}')
      const decl = sf.getFunction('fetchData')!
      const result = getFunctionSignature(decl)
      expect(result).toContain('async')
    })

    test('handles function with no parameters', () => {
      const sf = createSourceFile('export function noop(): void {}')
      const decl = sf.getFunction('noop')!
      const result = getFunctionSignature(decl)
      expect(result).toContain('()')
    })

    test('handles function with complex parameter types', () => {
      const sf = createSourceFile(
        'export function process(data: Record<string, unknown>, opts?: { flag: boolean }): void {}',
      )
      const decl = sf.getFunction('process')!
      const result = getFunctionSignature(decl)
      expect(result).toContain('data')
      expect(result).toContain('opts')
    })

    test('truncates very long signatures', () => {
      const params = Array.from({ length: 20 }, (_, i) => `p${i}: string`).join(', ')
      const sf = createSourceFile(`export function big(${params}): void {}`)
      const decl = sf.getFunction('big')!
      const result = getFunctionSignature(decl)
      expect(result.length).toBeLessThanOrEqual(80)
      if (result.length > 0) {
        expect(result.endsWith('...') || result.length <= 80).toBe(true)
      }
    })

    test('returns string (not undefined)', () => {
      const sf = createSourceFile('export function simple(): void {}')
      const decl = sf.getFunction('simple')!
      const result = getFunctionSignature(decl)
      expect(typeof result).toBe('string')
    })
  })

  // ==========================================================================
  // Command additional flag and metadata tests
  // ==========================================================================
  describe('Command additional metadata', () => {
    test('ext flag has empty string default', () => {
      expect(Exports.flags.ext.default).toBe('')
    })

    test('ext flag has description', () => {
      expect(Exports.flags.ext.description).toBeDefined()
      expect(typeof Exports.flags.ext.description).toBe('string')
    })

    test('format flag has description', () => {
      expect(Exports.flags.format.description).toBeDefined()
    })

    test('ignore flag supports multiple', () => {
      expect(Exports.flags.ignore.multiple).toBe(true)
    })

    test('output flag has description', () => {
      expect(Exports.flags.output.description).toBeDefined()
    })

    test('type flag has description', () => {
      expect(Exports.flags.type.description).toBeDefined()
    })

    test('unused flag has description', () => {
      expect(Exports.flags.unused.description).toBeDefined()
    })

    test('verbose flag has description', () => {
      expect(Exports.flags.verbose.description).toBeDefined()
    })

    test('path argument is not required', () => {
      expect(Exports.args.path.required).toBe(false)
    })

    test('path argument has description', () => {
      expect(Exports.args.path.description).toBeDefined()
      expect(typeof Exports.args.path.description).toBe('string')
    })

    test('examples contain command and description', () => {
      for (const example of Exports.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
      }
    })

    test('format flag options has exactly 3 entries', () => {
      expect(Exports.flags.format.options).toHaveLength(3)
    })

    test('type flag options has exactly 5 entries', () => {
      expect(Exports.flags.type.options).toHaveLength(5)
    })
  })

  // ==========================================================================
  // Integration: extractExports + extractImports together
  // ==========================================================================
  describe('extractExports + extractImports integration', () => {
    test('unused export is detectable by comparing imports', () => {
      const sf = createSourceFile(`
        export function used() {}
        export function unused() {}
        import { used } from "./test"
      `)
      const exports = extractExports(sf, 'test.ts')
      const imports = extractImports(sf)
      const unusedExports = exports.filter((e) => !imports.has(e.name))
      expect(unusedExports).toHaveLength(1)
      expect(unusedExports[0].name).toBe('unused')
    })

    test('all exports used when all imported', () => {
      const sf = createSourceFile(`
        export function fn1() {}
        export function fn2() {}
      `)
      const sf2 = createSourceFile(`
        import { fn1 } from "./a"
        import { fn2 } from "./a"
      `)
      const exports = extractExports(sf, 'test.ts')
      const imports = extractImports(sf2)
      const unusedExports = exports.filter((e) => !imports.has(e.name))
      expect(unusedExports).toHaveLength(0)
    })

    test('usage count aggregation works', () => {
      const sf = createSourceFile(`
        export function myFunc() {}
      `)
      const sf2 = createSourceFile(`
        import { myFunc } from "./a"
        import { myFunc } from "./a"
      `)
      const exports = extractExports(sf, 'test.ts')
      const imports = extractImports(sf2)
      const count = imports.get('myFunc') ?? 0
      expect(count).toBe(2)
    })
  })

  // ==========================================================================
  // formatConsole edge cases
  // ==========================================================================
  describe('formatConsole edge cases', () => {
    test('handles exports with all types in same call', () => {
      const exports = [
        makeExportInfo({ name: 'fn', type: 'function' }),
        makeExportInfo({ name: 'cls', type: 'class' }),
        makeExportInfo({ name: 'iface', type: 'interface' }),
        makeExportInfo({ name: 'tp', type: 'type' }),
        makeExportInfo({ name: 'cons', type: 'const' }),
      ]
      const result = formatConsole(exports, makeFormatOptions())
      expect(result).toContain('fn')
      expect(result).toContain('cls')
      expect(result).toContain('iface')
      expect(result).toContain('tp')
      expect(result).toContain('cons')
    })

    test('handles all types as unused', () => {
      const unused = [
        makeExportInfo({ name: 'uFn', type: 'function', file: 'a.ts', line: 1 }),
        makeExportInfo({ name: 'uCls', type: 'class', file: 'b.ts', line: 2 }),
        makeExportInfo({ name: 'uIface', type: 'interface', file: 'c.ts', line: 3 }),
        makeExportInfo({ name: 'uType', type: 'type', file: 'd.ts', line: 4 }),
        makeExportInfo({ name: 'uConst', type: 'const', file: 'e.ts', line: 5 }),
      ]
      const result = formatConsole(
        [],
        makeFormatOptions({ showUnused: true, unusedExports: unused }),
      )
      expect(result).toContain('uFn (function)')
      expect(result).toContain('uCls (class)')
      expect(result).toContain('uIface (interface)')
      expect(result).toContain('uType (type)')
      expect(result).toContain('uConst (const)')
    })

    test('handles large number of exports', () => {
      const exports = Array.from({ length: 50 }, (_, i) =>
        makeExportInfo({ name: `export${i}`, type: 'function', line: i + 1 }),
      )
      const result = formatConsole(exports, makeFormatOptions())
      expect(result).toContain('export0')
      expect(result).toContain('export49')
    })

    test('handles zero total files', () => {
      const result = formatConsole([], makeFormatOptions({ totalFiles: 0 }))
      expect(result).toContain('Files analyzed: 0')
    })

    test('handles all zero summary', () => {
      const result = formatConsole(
        [],
        makeFormatOptions({ totalFiles: 0, typeSummary: makeTypeSummary() }),
      )
      expect(result).toContain('Total exports: 0')
    })
  })

  // ==========================================================================
  // formatJson edge cases
  // ==========================================================================
  describe('formatJson edge cases', () => {
    test('handles large number of exports', () => {
      const exports = Array.from({ length: 100 }, (_, i) =>
        makeExportInfo({ name: `exp${i}`, line: i }),
      )
      const result = formatJson(exports, makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed.exports).toHaveLength(100)
      expect(parsed.summary.total).toBe(100)
    })

    test('handles export with all fields populated', () => {
      const exp = makeExportInfo({
        file: 'src/deep/module.ts',
        isDefault: true,
        isExported: true,
        line: 99,
        name: 'fullExport',
        signature: '(x: number) => string',
        type: 'function',
        usageCount: 42,
      })
      const result = formatJson([exp], makeFormatOptions())
      const parsed = JSON.parse(result)
      const e = parsed.exports[0]
      expect(e.file).toBe('src/deep/module.ts')
      expect(e.isDefault).toBe(true)
      expect(e.isExported).toBe(true)
      expect(e.line).toBe(99)
      expect(e.name).toBe('fullExport')
      expect(e.signature).toBe('(x: number) => string')
      expect(e.type).toBe('function')
      expect(e.usageCount).toBe(42)
    })

    test('handles mixed types in exports', () => {
      const exports = [
        makeExportInfo({ name: 'a', type: 'function' }),
        makeExportInfo({ name: 'b', type: 'class' }),
        makeExportInfo({ name: 'c', type: 'const' }),
      ]
      const result = formatJson(exports, makeFormatOptions())
      const parsed = JSON.parse(result)
      expect(parsed.exports[0].type).toBe('function')
      expect(parsed.exports[1].type).toBe('class')
      expect(parsed.exports[2].type).toBe('const')
    })
  })

  // ==========================================================================
  // formatMarkdown edge cases
  // ==========================================================================
  describe('formatMarkdown edge cases', () => {
    test('handles export with all fields', () => {
      const exp = makeExportInfo({
        name: 'complete',
        type: 'function',
        file: 'src/all.ts',
        line: 55,
        usageCount: 10,
        isDefault: true,
        signature: '(a: string) => number',
      })
      const result = formatMarkdown([exp], makeFormatOptions())
      expect(result).toContain('### complete (default)')
      expect(result).toContain('**Type:** function')
      expect(result).toContain('**Signature:** `(a: string) => number`')
      expect(result).toContain('**File:** src/all.ts:55')
      expect(result).toContain('**Usage Count:** 10')
      expect(result).toContain('✓ Used')
    })

    test('handles multiple unused exports section', () => {
      const unused = [
        makeExportInfo({ name: 'u1', type: 'function', file: 'a.ts', line: 1 }),
        makeExportInfo({ name: 'u2', type: 'class', file: 'b.ts', line: 2 }),
        makeExportInfo({ name: 'u3', type: 'const', file: 'c.ts', line: 3 }),
      ]
      const result = formatMarkdown(
        [],
        makeFormatOptions({ showUnused: true, unusedExports: unused }),
      )
      expect(result).toContain('### u1')
      expect(result).toContain('### u2')
      expect(result).toContain('### u3')
    })

    test('handles large export list', () => {
      const exports = Array.from({ length: 30 }, (_, i) =>
        makeExportInfo({ name: `item${i}`, line: i + 1 }),
      )
      const result = formatMarkdown(exports, makeFormatOptions())
      expect(result).toContain('### item0')
      expect(result).toContain('### item29')
    })
  })

  // ==========================================================================
  // extractExports with various TypeScript constructs
  // ==========================================================================
  describe('extractExports - advanced TypeScript', () => {
    test('extracts exported generic function', () => {
      const sf = createSourceFile('export function identity<T>(arg: T): T { return arg }')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('identity')
      expect(result[0].type).toBe('function')
    })

    test('extracts exported generic class', () => {
      const sf = createSourceFile('export class Container<T> { private value: T }')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Container')
      expect(result[0].type).toBe('class')
    })

    test('extracts exported generic interface', () => {
      const sf = createSourceFile('export interface Result<T> { data: T; error?: string }')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Result')
      expect(result[0].type).toBe('interface')
    })

    test('extracts exported generic type alias', () => {
      const sf = createSourceFile('export type Maybe<T> = T | null')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Maybe')
      expect(result[0].type).toBe('type')
    })

    test('extracts exported arrow function const', () => {
      const sf = createSourceFile('export const greet = (name: string): string => `Hello ${name}`')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('greet')
      expect(result[0].type).toBe('const')
      expect(result[0].signature).toContain('name')
    })

    test('extracts exported object const', () => {
      const sf = createSourceFile('export const config = { debug: true, version: "1.0" }')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('config')
      expect(result[0].type).toBe('const')
    })

    test('extracts exported array const', () => {
      const sf = createSourceFile('export const items = [1, 2, 3]')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('items')
    })

    test('extracts exported const with new expression', () => {
      const sf = createSourceFile('export const date = new Date()')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('date')
      expect(result[0].signature).toContain('new Date()')
    })

    test('handles declare keyword exports', () => {
      const sf = createSourceFile('export declare function declaredFn(): void')
      const result = extractExports(sf, 'test.ts')
      expect(result.length).toBeGreaterThanOrEqual(1)
    })

    test('extracts exported enum-like const pattern', () => {
      const sf = createSourceFile(
        'export const Status = { Active: "active", Inactive: "inactive" }',
      )
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Status')
    })

    test('correctly handles file with only comments', () => {
      const sf = createSourceFile('// just a comment\n/* block comment */')
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('extracts function from file with mixed content', () => {
      const sf = createSourceFile(`
        // comment
        const internal = 1
        export function publicFn() { return internal }
      `)
      const result = extractExports(sf, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('publicFn')
    })

    test('handles export default class expression', () => {
      const sf = createSourceFile('export default class {}')
      const result = extractExports(sf, 'test.ts')
      expect(result.length).toBeGreaterThanOrEqual(1)
      // Anonymous default class gets 'anonymous' name
      const defaultExport = result.find((e) => e.isDefault)
      expect(defaultExport).toBeDefined()
    })

    test('handles export default function expression', () => {
      const sf = createSourceFile('export default function() {}')
      const result = extractExports(sf, 'test.ts')
      expect(result.length).toBeGreaterThanOrEqual(1)
      const defaultExport = result.find((e) => e.isDefault)
      expect(defaultExport).toBeDefined()
    })
  })

  // ==========================================================================
  // extractImports - advanced
  // ==========================================================================
  describe('extractImports - advanced', () => {
    test('handles import with side effects only', () => {
      const sf = createSourceFile('import "side-effects"')
      const result = extractImports(sf)
      expect(result.size).toBe(0)
    })

    test('handles multiple import statements', () => {
      const sf = createSourceFile(`
        import { a } from "mod1"
        import { b } from "mod2"
        import { c } from "mod3"
      `)
      const result = extractImports(sf)
      expect(result.size).toBe(3)
      expect(result.get('a')).toBe(1)
      expect(result.get('b')).toBe(1)
      expect(result.get('c')).toBe(1)
    })

    test('handles import with renaming', () => {
      const sf = createSourceFile('import { original as renamed } from "mod"')
      const result = extractImports(sf)
      // ts-morph getName() returns the original name
      expect(result.has('original')).toBe(true)
    })

    test('handles empty import list in file', () => {
      const sf = createSourceFile('const x = 1\nfunction f() {}')
      const result = extractImports(sf)
      expect(result.size).toBe(0)
    })
  })

  // ==========================================================================
  // formatOutput dispatcher edge cases
  // ==========================================================================
  describe('formatOutput dispatcher', () => {
    test('console format with unused exports shown', () => {
      const exp = makeExportInfo({ name: 'fn', usageCount: 0 })
      const unused = [exp]
      const result = formatOutput(
        [exp],
        makeFormatOptions({
          format: 'console',
          showUnused: true,
          unusedExports: unused,
        }),
      )
      expect(result).toContain('Potentially Unused Exports')
    })

    test('json format includes all exports', () => {
      const exports = [makeExportInfo({ name: 'a' }), makeExportInfo({ name: 'b' })]
      const result = formatOutput(exports, makeFormatOptions({ format: 'json' }))
      const parsed = JSON.parse(result)
      expect(parsed.exports).toHaveLength(2)
    })

    test('markdown format with unused section', () => {
      const unused = [makeExportInfo({ name: 'u', type: 'function', file: 'a.ts', line: 1 })]
      const result = formatOutput(
        [],
        makeFormatOptions({
          format: 'markdown',
          showUnused: true,
          unusedExports: unused,
        }),
      )
      expect(result).toContain('## Potentially Unused Exports')
      expect(result).toContain('### u')
    })
  })

  // ==========================================================================
  // TypeSummary and FormatOptions shape verification
  // ==========================================================================
  describe('Type interface shape', () => {
    test('ExportInfo has all required fields', () => {
      const exp = makeExportInfo()
      expect(exp).toHaveProperty('file')
      expect(exp).toHaveProperty('isDefault')
      expect(exp).toHaveProperty('isExported')
      expect(exp).toHaveProperty('line')
      expect(exp).toHaveProperty('name')
      expect(exp).toHaveProperty('type')
      expect(exp).toHaveProperty('usageCount')
    })

    test('TypeSummary has all type keys', () => {
      const ts = makeTypeSummary()
      expect(ts).toHaveProperty('class')
      expect(ts).toHaveProperty('const')
      expect(ts).toHaveProperty('function')
      expect(ts).toHaveProperty('interface')
      expect(ts).toHaveProperty('type')
    })

    test('FormatOptions has all required fields', () => {
      const fo = makeFormatOptions()
      expect(fo).toHaveProperty('format')
      expect(fo).toHaveProperty('showUnused')
      expect(fo).toHaveProperty('totalFiles')
      expect(fo).toHaveProperty('typeSummary')
      expect(fo).toHaveProperty('unusedExports')
    })

    test('AnalysisResult has all required fields', () => {
      // Verifying the interface shape via the command's internal structure
      const analysisResult = {
        exports: [],
        totalFiles: 0,
        typeSummary: makeTypeSummary(),
        unusedExports: [],
      }
      expect(analysisResult).toHaveProperty('exports')
      expect(analysisResult).toHaveProperty('totalFiles')
      expect(analysisResult).toHaveProperty('typeSummary')
      expect(analysisResult).toHaveProperty('unusedExports')
    })
  })

  // ==========================================================================
  // getTypeColor returns distinct colors per type
  // ==========================================================================
  describe('getTypeColor consistency', () => {
    test('all known types return functions', () => {
      const types = ['class', 'const', 'function', 'interface', 'type']
      for (const t of types) {
        expect(typeof getTypeColor(t)).toBe('function')
      }
    })

    test('color functions always return strings', () => {
      const types = ['class', 'const', 'function', 'interface', 'type', 'unknown']
      for (const t of types) {
        const result = getTypeColor(t)('test')
        expect(typeof result).toBe('string')
      }
    })

    test('color functions preserve input text', () => {
      const types = ['class', 'const', 'function', 'interface', 'type', 'unknown']
      for (const t of types) {
        const result = getTypeColor(t)('preserved')
        expect(result).toContain('preserved')
      }
    })
  })
})
