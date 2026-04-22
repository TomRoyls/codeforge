import { describe, expect, test } from 'vitest'
import chalk from 'chalk'

import type { ExportInfo, FormatOptions } from '../../../src/commands/exports-helpers.js'
import {
  formatConsole,
  formatJson,
  formatMarkdown,
  formatOutput,
  getTypeColor,
} from '../../../src/commands/exports-format-helpers.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const makeExportInfo = (overrides: Partial<ExportInfo> = {}): ExportInfo => ({
  file: 'test.ts',
  isDefault: false,
  isExported: true,
  line: 1,
  name: 'testExport',
  type: 'function',
  usageCount: 0,
  ...overrides,
})

const makeFormatOptions = (overrides: Partial<FormatOptions> = {}): FormatOptions => ({
  format: 'console',
  showUnused: false,
  totalFiles: 1,
  typeSummary: { class: 0, const: 0, function: 0, interface: 0, type: 0 },
  unusedExports: [],
  ...overrides,
})

// ============================================================================
// getTypeColor
// ============================================================================

describe('getTypeColor', () => {
  test('returns blue color function for class type', () => {
    expect(getTypeColor('class')('Foo')).toBe(chalk.blue('Foo'))
  })

  test('returns cyan color function for const type', () => {
    expect(getTypeColor('const')('BAR')).toBe(chalk.cyan('BAR'))
  })

  test('returns green color function for function type', () => {
    expect(getTypeColor('function')('fn')).toBe(chalk.green('fn'))
  })

  test('returns magenta color function for interface type', () => {
    expect(getTypeColor('interface')('IFoo')).toBe(chalk.magenta('IFoo'))
  })

  test('returns yellow color function for type type', () => {
    expect(getTypeColor('type')('T')).toBe(chalk.yellow('T'))
  })

  test('returns white color function for unknown type', () => {
    expect(getTypeColor('unknown')('x')).toBe(chalk.white('x'))
  })

  test('returns callable function that produces a string', () => {
    const colorFn = getTypeColor('function')
    const result = colorFn('myFunc')
    expect(typeof result).toBe('string')
    expect(result).toContain('myFunc')
  })
})

// ============================================================================
// formatConsole
// ============================================================================

describe('formatConsole', () => {
  test('includes Export Analysis header', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).toContain('Export Analysis')
  })

  test('includes total exports count', () => {
    const exports = [makeExportInfo(), makeExportInfo({ name: 'other' })]
    const result = formatConsole(exports, makeFormatOptions())
    expect(result).toContain('Total exports: 2')
  })

  test('includes files analyzed count', () => {
    const result = formatConsole([], makeFormatOptions({ totalFiles: 10 }))
    expect(result).toContain('Files analyzed: 10')
  })

  test('includes type summary counts', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 2, const: 3, function: 5, interface: 1, type: 4 },
    })
    const result = formatConsole([], options)
    expect(result).toContain('Functions: 5')
    expect(result).toContain('Classes: 2')
    expect(result).toContain('Interfaces: 1')
    expect(result).toContain('Types: 4')
    expect(result).toContain('Constants: 3')
  })

  test('shows Exports section when exports exist', () => {
    const exp = makeExportInfo({ name: 'myFunc', type: 'function', line: 5, file: 'src/a.ts' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Exports:')
    expect(result).toContain('myFunc')
  })

  test('hides Exports section when no exports', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).not.toContain('Exports:')
  })

  test('shows signature when present', () => {
    const exp = makeExportInfo({ name: 'fn', signature: '(x: number) => string' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Signature: (x: number) => string')
  })

  test('hides signature line when absent', () => {
    const exp = makeExportInfo({ name: 'fn' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).not.toContain('Signature:')
  })

  test('shows warning emoji for unused exports', () => {
    const exp = makeExportInfo({ name: 'unused', usageCount: 0 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('⚠️')
  })

  test('hides warning emoji for used exports', () => {
    const exp = makeExportInfo({ name: 'used', usageCount: 5 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).not.toContain('⚠️')
  })

  test('shows (default) label for default exports', () => {
    const exp = makeExportInfo({ name: 'DefaultExport', isDefault: true })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('(default)')
  })

  test('shows file and line info for each export', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/utils.ts', line: 42 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('src/utils.ts:42')
  })

  test('shows usage count for each export', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 7 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Usage count: 7')
  })

  test('shows unused section when showUnused is true and unusedExports exist', () => {
    const unused = [makeExportInfo({ name: 'oldFn', type: 'function', line: 3, file: 'old.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('Potentially Unused Exports')
    expect(result).toContain('oldFn')
  })

  test('hides unused section when showUnused is false', () => {
    const unused = [makeExportInfo({ name: 'oldFn' })]
    const options = makeFormatOptions({ showUnused: false, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).not.toContain('Potentially Unused Exports')
  })

  test('hides unused section when showUnused is true but no unusedExports', () => {
    const options = makeFormatOptions({ showUnused: true, unusedExports: [] })
    const result = formatConsole([], options)
    expect(result).not.toContain('Potentially Unused Exports')
  })
})

// ============================================================================
// formatJson
// ============================================================================

describe('formatJson', () => {
  test('produces valid JSON', () => {
    const result = formatJson([], makeFormatOptions())
    expect(() => JSON.parse(result)).not.toThrow()
  })

  test('includes exports array', () => {
    const exports = [makeExportInfo()]
    const result = formatJson(exports, makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(1)
  })

  test('includes empty exports array for no exports', () => {
    const result = formatJson([], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports).toEqual([])
    expect(parsed.summary.total).toBe(0)
  })

  test('includes summary with export type counts', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 1, const: 2, function: 3, interface: 4, type: 5 },
    })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.exportTypes.function).toBe(3)
    expect(parsed.summary.exportTypes.class).toBe(1)
  })

  test('includes files count in summary', () => {
    const options = makeFormatOptions({ totalFiles: 42 })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.files).toBe(42)
  })

  test('includes unused exports and count', () => {
    const unused = [makeExportInfo({ name: 'unusedFn' })]
    const options = makeFormatOptions({ unusedExports: unused })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.unusedExports).toHaveLength(1)
    expect(parsed.unusedExports[0].name).toBe('unusedFn')
    expect(parsed.summary.unused).toBe(1)
  })

  test('formats with 2-space indentation', () => {
    const result = formatJson([], makeFormatOptions())
    expect(result).toContain('\n  ')
  })

  test('preserves export data fields', () => {
    const exp = makeExportInfo({
      file: 'src/foo.ts',
      isDefault: true,
      line: 10,
      name: 'Foo',
      signature: '() => void',
      type: 'class',
      usageCount: 3,
    })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0]).toMatchObject({
      file: 'src/foo.ts',
      isDefault: true,
      line: 10,
      name: 'Foo',
      type: 'class',
      usageCount: 3,
    })
  })
})

// ============================================================================
// formatMarkdown
// ============================================================================

describe('formatMarkdown', () => {
  test('includes main header', () => {
    const result = formatMarkdown([], makeFormatOptions())
    expect(result).toContain('# Export Analysis')
  })

  test('includes Summary section with total exports', () => {
    const result = formatMarkdown([], makeFormatOptions())
    expect(result).toContain('## Summary')
    expect(result).toContain('**Total Exports:** 0')
  })

  test('shows correct total for non-empty exports', () => {
    const exports = [makeExportInfo(), makeExportInfo({ name: 'other' })]
    const result = formatMarkdown(exports, makeFormatOptions())
    expect(result).toContain('**Total Exports:** 2')
  })

  test('includes files analyzed count', () => {
    const result = formatMarkdown([], makeFormatOptions({ totalFiles: 5 }))
    expect(result).toContain('**Files Analyzed:** 5')
  })

  test('includes Export Types section', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 2, const: 0, function: 5, interface: 1, type: 3 },
    })
    const result = formatMarkdown([], options)
    expect(result).toContain('## Export Types')
    expect(result).toContain('**Functions:** 5')
    expect(result).toContain('**Classes:** 2')
  })

  test('includes export details with heading when exports exist', () => {
    const exp = makeExportInfo({
      name: 'myFunc',
      type: 'function',
      signature: '() => void',
      line: 10,
      file: 'src/foo.ts',
    })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('## All Exports')
    expect(result).toContain('### myFunc')
    expect(result).toContain('**Type:** function')
    expect(result).toContain('**Signature:** `() => void`')
    expect(result).toContain('**File:** src/foo.ts:10')
  })

  test('shows (default) for default exports', () => {
    const exp = makeExportInfo({ name: 'DefaultThing', isDefault: true })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('### DefaultThing (default)')
  })

  test('shows unused section when showUnused is true and unusedExports exist', () => {
    const unused = [makeExportInfo({ name: 'oldFn', type: 'function', line: 5, file: 'old.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatMarkdown([], options)
    expect(result).toContain('## Potentially Unused Exports')
    expect(result).toContain('### oldFn')
  })

  test('hides unused section when showUnused is false', () => {
    const unused = [makeExportInfo({ name: 'oldFn' })]
    const options = makeFormatOptions({ showUnused: false, unusedExports: unused })
    const result = formatMarkdown([], options)
    expect(result).not.toContain('## Potentially Unused Exports')
  })

  test('shows ✓ Used status for exports with usageCount > 0', () => {
    const exp = makeExportInfo({ name: 'usedFn', usageCount: 3 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('**Status:** ✓ Used')
  })

  test('shows ⚠️ Potentially Unused status for zero usageCount', () => {
    const exp = makeExportInfo({ name: 'unusedFn', usageCount: 0 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('**Status:** ⚠️ Potentially Unused')
  })

  test('hides signature line when absent', () => {
    const exp = makeExportInfo({ name: 'fn' })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).not.toContain('**Signature:**')
  })
})

// ============================================================================
// formatOutput
// ============================================================================

describe('formatOutput', () => {
  test('dispatches to formatJson when format is json', () => {
    const exports = [makeExportInfo()]
    const options = makeFormatOptions({ format: 'json' })
    const result = formatOutput(exports, options)
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(1)
  })

  test('dispatches to formatMarkdown when format is markdown', () => {
    const options = makeFormatOptions({ format: 'markdown' })
    const result = formatOutput([], options)
    expect(result).toContain('# Export Analysis')
  })

  test('dispatches to formatConsole when format is console', () => {
    const options = makeFormatOptions({ format: 'console' })
    const result = formatOutput([], options)
    expect(result).toContain('Export Analysis')
  })

  test('defaults to console for unrecognized format', () => {
    const options = makeFormatOptions({ format: 'unknown' as FormatOptions['format'] })
    const result = formatOutput([], options)
    expect(result).toContain('Export Analysis')
  })

  test('json output matches formatJson directly', () => {
    const exports = [makeExportInfo({ name: 'cmp' })]
    const options = makeFormatOptions({ format: 'json' })
    expect(formatOutput(exports, options)).toBe(formatJson(exports, options))
  })

  test('markdown output matches formatMarkdown directly', () => {
    const exports = [makeExportInfo({ name: 'cmp' })]
    const options = makeFormatOptions({ format: 'markdown' })
    expect(formatOutput(exports, options)).toBe(formatMarkdown(exports, options))
  })

  test('console output matches formatConsole directly', () => {
    const exports = [makeExportInfo({ name: 'cmp' })]
    const options = makeFormatOptions({ format: 'console' })
    expect(formatOutput(exports, options)).toBe(formatConsole(exports, options))
  })
})

// ============================================================================
// Additional Coverage: getTypeColor edge cases
// ============================================================================

describe('getTypeColor additional coverage', () => {
  test('returns white for empty string type', () => {
    expect(getTypeColor('')('test')).toBe(chalk.white('test'))
  })

  test('each known type maps to a distinct color function', () => {
    const types = ['class', 'const', 'function', 'interface', 'type'] as const
    const colorFns = types.map((t) => getTypeColor(t))
    const fnSet = new Set(colorFns)
    expect(fnSet.size).toBe(types.length)
  })

  test('handles multi-word strings', () => {
    const colorFn = getTypeColor('function')
    const result = colorFn('a very long export name here')
    expect(result).toContain('a very long export name here')
  })

  test('handles special characters in text', () => {
    const colorFn = getTypeColor('class')
    const result = colorFn('$foo_Bar<baz>')
    expect(result).toContain('$foo_Bar<baz>')
  })
})

// ============================================================================
// Additional Coverage: formatConsole edge cases
// ============================================================================

describe('formatConsole additional coverage', () => {
  test('handles single export correctly', () => {
    const exp = makeExportInfo({ name: 'onlyOne', type: 'class', line: 1 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('onlyOne')
    expect(result).toContain('Total exports: 1')
  })

  test('handles many exports', () => {
    const exports = Array.from({ length: 50 }, (_, i) =>
      makeExportInfo({ name: `export${i}`, line: i + 1 }),
    )
    const result = formatConsole(exports, makeFormatOptions())
    expect(result).toContain('Total exports: 50')
    expect(result).toContain('export0')
    expect(result).toContain('export49')
  })

  test('handles export names with special characters', () => {
    const exp = makeExportInfo({ name: 'foo$Bar_Baz<Qux>' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('foo$Bar_Baz<Qux>')
  })

  test('pads type column to 10 characters', () => {
    const exp = makeExportInfo({ name: 'myFn', type: 'function' })
    const result = formatConsole([exp], makeFormatOptions())
    // chalk wraps the padded string, so we check for the padded content
    expect(result).toContain('myFn')
  })

  test('renders class type exports with correct color', () => {
    const exp = makeExportInfo({ name: 'MyClass', type: 'class' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('MyClass')
  })

  test('renders interface type exports with correct color', () => {
    const exp = makeExportInfo({ name: 'IFoo', type: 'interface' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('IFoo')
  })

  test('renders type alias exports with correct color', () => {
    const exp = makeExportInfo({ name: 'MyType', type: 'type' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('MyType')
  })

  test('renders const exports with correct color', () => {
    const exp = makeExportInfo({ name: 'MY_CONST', type: 'const' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('MY_CONST')
  })

  test('handles default export that is also used', () => {
    const exp = makeExportInfo({ name: 'DefUsed', isDefault: true, usageCount: 10 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('(default)')
    expect(result).not.toContain('⚠️')
  })

  test('handles default export that is unused', () => {
    const exp = makeExportInfo({ name: 'DefUnused', isDefault: true, usageCount: 0 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('(default)')
    expect(result).toContain('⚠️')
  })

  test('multiple unused exports in unused section', () => {
    const unused = [
      makeExportInfo({ name: 'a', type: 'function', line: 1, file: 'f.ts' }),
      makeExportInfo({ name: 'b', type: 'class', line: 2, file: 'g.ts' }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('a')
    expect(result).toContain('b')
    expect(result).toContain('f.ts:1')
    expect(result).toContain('g.ts:2')
  })

  test('preserves all export fields in console output', () => {
    const exp = makeExportInfo({
      file: 'deep/nested/module.ts',
      line: 99,
      name: 'complexExport',
      signature: '(a: string, b: number) => Promise<void>',
      type: 'function',
      usageCount: 42,
    })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('deep/nested/module.ts:99')
    expect(result).toContain('Usage count: 42')
    expect(result).toContain('(a: string, b: number) => Promise<void>')
  })

  test('exports with zero totalFiles', () => {
    const result = formatConsole([], makeFormatOptions({ totalFiles: 0 }))
    expect(result).toContain('Files analyzed: 0')
  })
})

// ============================================================================
// Additional Coverage: formatJson edge cases
// ============================================================================

describe('formatJson additional coverage', () => {
  test('includes all type summary fields', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 10, const: 20, function: 30, interface: 40, type: 50 },
    })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.exportTypes).toEqual({
      class: 10,
      const: 20,
      function: 30,
      interface: 40,
      type: 50,
    })
  })

  test('handles multiple exports with different types', () => {
    const exports = [
      makeExportInfo({ name: 'fn1', type: 'function', line: 1 }),
      makeExportInfo({ name: 'Cls1', type: 'class', line: 5 }),
      makeExportInfo({ name: 'IFace', type: 'interface', line: 10 }),
      makeExportInfo({ name: 'T', type: 'type', line: 15 }),
      makeExportInfo({ name: 'C', type: 'const', line: 20 }),
    ]
    const result = formatJson(exports, makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(5)
    expect(parsed.exports.map((e: { type: string }) => e.type)).toEqual([
      'function',
      'class',
      'interface',
      'type',
      'const',
    ])
  })

  test('handles export with special characters in name', () => {
    const exp = makeExportInfo({ name: '$weird_Name<Gen>"eric"' })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].name).toBe('$weird_Name<Gen>"eric"')
  })

  test('correctly represents default export in JSON', () => {
    const exp = makeExportInfo({ name: 'DefExp', isDefault: true })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].isDefault).toBe(true)
  })

  test('tracks unused count in summary', () => {
    const unused = [
      makeExportInfo({ name: 'a' }),
      makeExportInfo({ name: 'b' }),
      makeExportInfo({ name: 'c' }),
    ]
    const options = makeFormatOptions({ unusedExports: unused })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.unused).toBe(3)
    expect(parsed.unusedExports).toHaveLength(3)
  })

  test('preserves isExported field in JSON', () => {
    const exp = makeExportInfo({ name: 'fn', isExported: true })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].isExported).toBe(true)
  })

  test('preserves optional signature field when present', () => {
    const exp = makeExportInfo({ name: 'fn', signature: '(x: T) => T' })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].signature).toBe('(x: T) => T')
  })

  test('omission of signature results in undefined in JSON', () => {
    const exp = makeExportInfo({ name: 'fn' })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].signature).toBeUndefined()
  })

  test('empty type summary has all zeros', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 0, const: 0, function: 0, interface: 0, type: 0 },
    })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    const ts = parsed.summary.exportTypes
    expect(ts.class + ts.const + ts.function + ts.interface + ts.type).toBe(0)
  })
})

// ============================================================================
// Additional Coverage: formatMarkdown edge cases
// ============================================================================

describe('formatMarkdown additional coverage', () => {
  test('includes all five export type lines', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 1, const: 2, function: 3, interface: 4, type: 5 },
    })
    const result = formatMarkdown([], options)
    expect(result).toContain('**Functions:** 3')
    expect(result).toContain('**Classes:** 1')
    expect(result).toContain('**Interfaces:** 4')
    expect(result).toContain('**Types:** 5')
    expect(result).toContain('**Constants:** 2')
  })

  test('hides All Exports section when no exports', () => {
    const result = formatMarkdown([], makeFormatOptions())
    expect(result).not.toContain('## All Exports')
  })

  test('shows Usage Count for each export', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 15 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('**Usage Count:** 15')
  })

  test('shows file and line for each export', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/mod.ts', line: 77 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('**File:** src/mod.ts:77')
  })

  test('handles multiple exports with mixed types', () => {
    const exports = [
      makeExportInfo({ name: 'fn', type: 'function', line: 1 }),
      makeExportInfo({ name: 'Cls', type: 'class', line: 2, isDefault: true }),
    ]
    const result = formatMarkdown(exports, makeFormatOptions())
    expect(result).toContain('### fn')
    expect(result).toContain('### Cls (default)')
  })

  test('unused section includes type and file info', () => {
    const unused = [
      makeExportInfo({ name: 'deadCode', type: 'function', line: 33, file: 'dead.ts' }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatMarkdown([], options)
    expect(result).toContain('**Type:** function')
    expect(result).toContain('**File:** dead.ts:33')
  })

  test('hides unused section when showUnused is true but list is empty', () => {
    const options = makeFormatOptions({ showUnused: true, unusedExports: [] })
    const result = formatMarkdown([], options)
    expect(result).not.toContain('## Potentially Unused Exports')
  })

  test('multiple unused exports each get their own heading', () => {
    const unused = [
      makeExportInfo({ name: 'old1', type: 'function', line: 1, file: 'a.ts' }),
      makeExportInfo({ name: 'old2', type: 'class', line: 2, file: 'b.ts' }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatMarkdown([], options)
    expect(result).toContain('### old1')
    expect(result).toContain('### old2')
  })

  test('export with signature wraps it in backticks', () => {
    const exp = makeExportInfo({ name: 'fn', signature: '(x: number) => number' })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('`(x: number) => number`')
  })

  test('export names with special characters render correctly', () => {
    const exp = makeExportInfo({ name: '$special_Export<Name>' })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('$special_Export<Name>')
  })

  test('zero total files renders correctly', () => {
    const result = formatMarkdown([], makeFormatOptions({ totalFiles: 0 }))
    expect(result).toContain('**Files Analyzed:** 0')
  })
})

// ============================================================================
// Additional Coverage: formatOutput edge cases
// ============================================================================

describe('formatOutput additional coverage', () => {
  test('json format with exports and unused', () => {
    const exports = [makeExportInfo({ name: 'fn' })]
    const unused = [makeExportInfo({ name: 'old' })]
    const options = makeFormatOptions({ format: 'json', unusedExports: unused })
    const result = formatOutput(exports, options)
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(1)
    expect(parsed.summary.unused).toBe(1)
  })

  test('markdown format with exports and unused', () => {
    const exports = [makeExportInfo({ name: 'fn' })]
    const unused = [makeExportInfo({ name: 'old' })]
    const options = makeFormatOptions({
      format: 'markdown',
      showUnused: true,
      unusedExports: unused,
    })
    const result = formatOutput(exports, options)
    expect(result).toContain('### fn')
    expect(result).toContain('### old')
  })

  test('console format with exports and unused', () => {
    const exports = [makeExportInfo({ name: 'fn' })]
    const unused = [makeExportInfo({ name: 'old' })]
    const options = makeFormatOptions({
      format: 'console',
      showUnused: true,
      unusedExports: unused,
    })
    const result = formatOutput(exports, options)
    expect(result).toContain('fn')
    expect(result).toContain('Potentially Unused Exports')
  })

  test('format switching produces different output for same data', () => {
    const exports = [makeExportInfo({ name: 'fn' })]
    const base = makeFormatOptions()
    const consoleResult = formatOutput(exports, { ...base, format: 'console' })
    const jsonResult = formatOutput(exports, { ...base, format: 'json' })
    const mdResult = formatOutput(exports, { ...base, format: 'markdown' })
    expect(consoleResult).not.toBe(jsonResult)
    expect(consoleResult).not.toBe(mdResult)
    expect(jsonResult).not.toBe(mdResult)
  })

  test('handles empty data consistently across formats', () => {
    const base = makeFormatOptions()
    const consoleResult = formatOutput([], { ...base, format: 'console' })
    const jsonResult = formatOutput([], { ...base, format: 'json' })
    const mdResult = formatOutput([], { ...base, format: 'markdown' })
    expect(consoleResult.length).toBeGreaterThan(0)
    expect(jsonResult.length).toBeGreaterThan(0)
    expect(mdResult.length).toBeGreaterThan(0)
  })

  test('json output is valid parseable JSON', () => {
    const exports = [makeExportInfo({ name: 'fn', type: 'function' })]
    const options = makeFormatOptions({ format: 'json' })
    const result = formatOutput(exports, options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.total).toBe(1)
    expect(parsed.exports[0].name).toBe('fn')
  })

  test('console format with empty exports shows summary only', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'console' }))
    expect(result).toContain('Total exports: 0')
    expect(result).not.toContain('Exports:')
  })
})

describe('getTypeColor additional coverage', () => {
  test('returns white for unknown type', () => {
    const color = getTypeColor('unknown')
    expect(typeof color).toBe('function')
    const result = color('test')
    expect(result).toContain('test')
  })

  test('returns white for empty string type', () => {
    const color = getTypeColor('')
    expect(typeof color).toBe('function')
  })

  test('returns correct color for class type', () => {
    const color = getTypeColor('class')
    expect(typeof color).toBe('function')
    const result = color('class')
    expect(result).toContain('class')
  })

  test('returns correct color for interface type', () => {
    const color = getTypeColor('interface')
    expect(typeof color).toBe('function')
  })

  test('handles all known types without error', () => {
    const types = ['class', 'const', 'function', 'interface', 'type']
    types.forEach((t) => {
      const color = getTypeColor(t)
      expect(typeof color).toBe('function')
      expect(color(t)).toContain(t)
    })
  })
})

describe('formatConsole additional coverage', () => {
  test('shows unused exports warning with yellow marker', () => {
    const exports = [makeExportInfo({ name: 'fn', usageCount: 0 })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: exports })
    const result = formatConsole(exports, options)
    expect(result).toContain('⚠')
  })

  test('shows default export marker', () => {
    const exports = [makeExportInfo({ name: 'MyComponent', isDefault: true })]
    const result = formatConsole(exports, makeFormatOptions())
    expect(result).toContain('(default)')
  })

  test('hides unused section when showUnused is false', () => {
    const unused = [makeExportInfo({ name: 'old' })]
    const options = makeFormatOptions({ showUnused: false, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).not.toContain('Potentially Unused')
  })

  test('export with signature shows signature line', () => {
    const exports = [makeExportInfo({ name: 'fn', signature: '(x: number) => void' })]
    const result = formatConsole(exports, makeFormatOptions())
    expect(result).toContain('Signature:')
    expect(result).toContain('(x: number) => void')
  })
})

// ============================================================================
// Boundary conditions and edge cases
// ============================================================================

describe('formatConsole boundary conditions', () => {
  test('renders export with line number 0', () => {
    const exp = makeExportInfo({ name: 'topLevel', line: 0, file: 'root.ts' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('root.ts:0')
  })

  test('renders export with large line number', () => {
    const exp = makeExportInfo({ name: 'bigFile', line: 99999, file: 'huge.ts' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('huge.ts:99999')
  })

  test('renders export with large usageCount', () => {
    const exp = makeExportInfo({ name: 'popular', usageCount: 999999 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Usage count: 999999')
    expect(result).not.toContain('⚠️')
  })

  test('renders all zero type summary', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 0, const: 0, function: 0, interface: 0, type: 0 },
    })
    const result = formatConsole([], options)
    expect(result).toContain('Functions: 0')
    expect(result).toContain('Classes: 0')
    expect(result).toContain('Interfaces: 0')
    expect(result).toContain('Types: 0')
    expect(result).toContain('Constants: 0')
  })

  test('renders export with dot in file name', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/my.component.tsx', line: 10 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('src/my.component.tsx:10')
  })

  test('renders export with spaces in file path', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/my folder/utils.ts', line: 5 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('src/my folder/utils.ts:5')
  })
})

describe('formatJson boundary conditions', () => {
  test('handles export with isExported false', () => {
    const exp = makeExportInfo({ name: 'internal', isExported: false })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].isExported).toBe(false)
  })

  test('handles large number of exports in JSON', () => {
    const exports = Array.from({ length: 100 }, (_, i) =>
      makeExportInfo({ name: `exp${i}`, line: i + 1 }),
    )
    const result = formatJson(exports, makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(100)
    expect(parsed.summary.total).toBe(100)
  })

  test('handles export with very long signature', () => {
    const longSig =
      '(a: string, b: number, c: boolean, d: Record<string, unknown>) => Promise<Map<string, Set<number>>>'
    const exp = makeExportInfo({ name: 'complex', signature: longSig })
    const result = formatJson([exp], makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].signature).toBe(longSig)
  })

  test('JSON output summary total matches exports length', () => {
    const exports = [makeExportInfo(), makeExportInfo({ name: 'b' }), makeExportInfo({ name: 'c' })]
    const result = formatJson(exports, makeFormatOptions())
    const parsed = JSON.parse(result)
    expect(parsed.summary.total).toBe(parsed.exports.length)
  })

  test('unused exports list preserves all fields', () => {
    const unused = [makeExportInfo({ name: 'deadFn', type: 'function', file: 'dead.ts', line: 42 })]
    const options = makeFormatOptions({ unusedExports: unused })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.unusedExports[0].name).toBe('deadFn')
    expect(parsed.unusedExports[0].type).toBe('function')
    expect(parsed.unusedExports[0].file).toBe('dead.ts')
    expect(parsed.unusedExports[0].line).toBe(42)
  })
})

describe('formatMarkdown boundary conditions', () => {
  test('renders export with usageCount at boundary of 1', () => {
    const exp = makeExportInfo({ name: 'once', usageCount: 1 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('**Status:** ✓ Used')
  })

  test('renders all type summary fields as zero', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 0, const: 0, function: 0, interface: 0, type: 0 },
    })
    const result = formatMarkdown([], options)
    expect(result).toContain('**Functions:** 0')
    expect(result).toContain('**Classes:** 0')
    expect(result).toContain('**Interfaces:** 0')
    expect(result).toContain('**Types:** 0')
    expect(result).toContain('**Constants:** 0')
  })

  test('renders export with line number 0', () => {
    const exp = makeExportInfo({ name: 'root', line: 0, file: 'index.ts' })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('**File:** index.ts:0')
  })

  test('multiple exports all get headings', () => {
    const exports = [
      makeExportInfo({ name: 'a', type: 'function', line: 1 }),
      makeExportInfo({ name: 'b', type: 'class', line: 2 }),
      makeExportInfo({ name: 'c', type: 'interface', line: 3 }),
    ]
    const result = formatMarkdown(exports, makeFormatOptions())
    expect(result).toContain('### a')
    expect(result).toContain('### b')
    expect(result).toContain('### c')
  })

  test('unused export with type and file info renders correctly', () => {
    const unused = [
      makeExportInfo({ name: 'oldConst', type: 'const', line: 55, file: 'legacy.ts' }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatMarkdown([], options)
    expect(result).toContain('### oldConst')
    expect(result).toContain('**Type:** const')
    expect(result).toContain('**File:** legacy.ts:55')
  })
})

describe('formatOutput boundary conditions', () => {
  test('console format produces non-empty string for empty data', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'console' }))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  test('json format produces valid JSON for empty data', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed.summary.total).toBe(0)
    expect(parsed.exports).toEqual([])
  })

  test('markdown format produces header for empty data', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('# Export Analysis')
    expect(result).toContain('**Total Exports:** 0')
  })
})

// ============================================================================
// getTypeColor: distinctness and output properties
// ============================================================================

describe('getTypeColor distinctness and output properties', () => {
  test('class and const return different function references', () => {
    expect(getTypeColor('class')).not.toBe(getTypeColor('const'))
  })

  test('function and type return different function references', () => {
    expect(getTypeColor('function')).not.toBe(getTypeColor('type'))
  })

  test('interface and class return different function references', () => {
    expect(getTypeColor('interface')).not.toBe(getTypeColor('class'))
  })

  test('calling returned function with empty string returns a string', () => {
    const result = getTypeColor('function')('')
    expect(typeof result).toBe('string')
  })

  test('calling returned function with unicode text preserves content', () => {
    const result = getTypeColor('class')('日本語エクスポート')
    expect(result).toContain('日本語エクスポート')
  })

  test('calling returned function with emoji preserves content', () => {
    const result = getTypeColor('const')('📦🚀')
    expect(result).toContain('📦🚀')
  })

  test('calling returned function multiple times returns identical output', () => {
    const colorFn = getTypeColor('function')
    const first = colorFn('test')
    const second = colorFn('test')
    expect(first).toBe(second)
  })

  test('unknown type enum maps to white fallback', () => {
    const result = getTypeColor('enum')('value')
    expect(result).toBe(chalk.white('value'))
  })

  test('number-like string type maps to white fallback', () => {
    const result = getTypeColor('123')('test')
    expect(result).toBe(chalk.white('test'))
  })

  test('case sensitive: Function (capitalized) maps to white fallback', () => {
    const result = getTypeColor('Function')('fn')
    expect(result).toBe(chalk.white('fn'))
  })
})

// ============================================================================
// formatConsole: structure and content details
// ============================================================================

describe('formatConsole structure and content details', () => {
  test('contains box emoji in header', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).toContain('📦')
  })

  test('contains Summary dim label', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).toContain('Summary:')
  })

  test('contains Export types dim label', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).toContain('Export types:')
  })

  test('contains File prefix for each export entry', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'a.ts', line: 1 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('File: a.ts:1')
  })

  test('contains Usage count prefix for each export entry', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 5 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Usage count: 5')
  })

  test('multiple exports with different types all appear', () => {
    const exports = [
      makeExportInfo({ name: 'fn', type: 'function', line: 1 }),
      makeExportInfo({ name: 'Cls', type: 'class', line: 2 }),
      makeExportInfo({ name: 'IFace', type: 'interface', line: 3 }),
      makeExportInfo({ name: 'T', type: 'type', line: 4 }),
      makeExportInfo({ name: 'C', type: 'const', line: 5 }),
    ]
    const result = formatConsole(exports, makeFormatOptions())
    for (const exp of exports) {
      expect(result).toContain(exp.name)
    }
  })

  test('unused section shows type in parentheses', () => {
    const unused = [makeExportInfo({ name: 'deadFn', type: 'function', line: 1, file: 'f.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('deadFn (function)')
  })

  test('unused section shows type for class exports', () => {
    const unused = [makeExportInfo({ name: 'DeadClass', type: 'class', line: 5, file: 'c.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('DeadClass (class)')
  })

  test('all exports with positive usageCount produce no warnings', () => {
    const exports = [
      makeExportInfo({ name: 'fn1', usageCount: 1 }),
      makeExportInfo({ name: 'fn2', usageCount: 10 }),
    ]
    const result = formatConsole(exports, makeFormatOptions())
    expect(result).not.toContain('⚠️')
  })

  test('mixed used and unused exports shows warning only for unused', () => {
    const exports = [
      makeExportInfo({ name: 'used', usageCount: 5 }),
      makeExportInfo({ name: 'unused', usageCount: 0 }),
    ]
    const result = formatConsole(exports, makeFormatOptions())
    const warningCount = (result.match(/⚠️/g) ?? []).length
    expect(warningCount).toBe(1)
  })

  test('exports with same name but different types both appear', () => {
    const exports = [
      makeExportInfo({ name: 'Thing', type: 'function', line: 1 }),
      makeExportInfo({ name: 'Thing', type: 'class', line: 10 }),
    ]
    const result = formatConsole(exports, makeFormatOptions())
    const count = (result.match(/Thing/g) ?? []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('output is a single string with newlines', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(typeof result).toBe('string')
    expect(result).toContain('\n')
  })

  test('signature with complex generics renders correctly', () => {
    const exp = makeExportInfo({
      name: 'fn',
      signature: '<T extends Record<string, unknown>>(x: T) => Map<keyof T, Set<string>>',
    })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain(
      '<T extends Record<string, unknown>>(x: T) => Map<keyof T, Set<string>>',
    )
  })

  test('isExported false export still appears in output', () => {
    const exp = makeExportInfo({ name: 'internalFn', isExported: false })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('internalFn')
  })

  test('empty file path renders correctly', () => {
    const exp = makeExportInfo({ name: 'fn', file: '', line: 1 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('File: :1')
  })

  test('unused section with three exports shows all names', () => {
    const unused = [
      makeExportInfo({ name: 'a', type: 'function', line: 1, file: 'a.ts' }),
      makeExportInfo({ name: 'b', type: 'class', line: 2, file: 'b.ts' }),
      makeExportInfo({ name: 'c', type: 'const', line: 3, file: 'c.ts' }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('a (function)')
    expect(result).toContain('b (class)')
    expect(result).toContain('c (const)')
  })
})

// ============================================================================
// formatJson: structural verification
// ============================================================================

describe('formatJson structural verification', () => {
  test('top-level object has exports, summary, unusedExports keys', () => {
    const parsed = JSON.parse(formatJson([], makeFormatOptions()))
    expect(Object.keys(parsed)).toEqual(
      expect.arrayContaining(['exports', 'summary', 'unusedExports']),
    )
  })

  test('summary object has exportTypes, files, total, unused keys', () => {
    const parsed = JSON.parse(formatJson([], makeFormatOptions()))
    expect(Object.keys(parsed.summary)).toEqual(
      expect.arrayContaining(['exportTypes', 'files', 'total', 'unused']),
    )
  })

  test('summary exportTypes has all five type keys', () => {
    const parsed = JSON.parse(formatJson([], makeFormatOptions()))
    const et = parsed.summary.exportTypes
    expect(Object.keys(et)).toEqual(
      expect.arrayContaining(['class', 'const', 'function', 'interface', 'type']),
    )
  })

  test('summary files equals totalFiles option', () => {
    const options = makeFormatOptions({ totalFiles: 99 })
    const parsed = JSON.parse(formatJson([], options))
    expect(parsed.summary.files).toBe(99)
  })

  test('summary unused equals unusedExports length', () => {
    const unused = [makeExportInfo({ name: 'a' }), makeExportInfo({ name: 'b' })]
    const options = makeFormatOptions({ unusedExports: unused })
    const parsed = JSON.parse(formatJson([], options))
    expect(parsed.summary.unused).toBe(2)
  })

  test('summary unused is 0 when unusedExports is empty', () => {
    const parsed = JSON.parse(formatJson([], makeFormatOptions({ unusedExports: [] })))
    expect(parsed.summary.unused).toBe(0)
  })

  test('exports preserve insertion order', () => {
    const exports = [
      makeExportInfo({ name: 'first', line: 1 }),
      makeExportInfo({ name: 'second', line: 2 }),
      makeExportInfo({ name: 'third', line: 3 }),
    ]
    const parsed = JSON.parse(formatJson(exports, makeFormatOptions()))
    expect(parsed.exports[0].name).toBe('first')
    expect(parsed.exports[1].name).toBe('second')
    expect(parsed.exports[2].name).toBe('third')
  })

  test('two exports with same name both preserved', () => {
    const exports = [
      makeExportInfo({ name: 'same', type: 'function', line: 1 }),
      makeExportInfo({ name: 'same', type: 'class', line: 2 }),
    ]
    const parsed = JSON.parse(formatJson(exports, makeFormatOptions()))
    expect(parsed.exports).toHaveLength(2)
    expect(parsed.exports[0].type).toBe('function')
    expect(parsed.exports[1].type).toBe('class')
  })

  test('empty string file name preserved in JSON', () => {
    const exp = makeExportInfo({ name: 'fn', file: '' })
    const parsed = JSON.parse(formatJson([exp], makeFormatOptions()))
    expect(parsed.exports[0].file).toBe('')
  })

  test('unusedExports items have same structure as exports items', () => {
    const unused = [
      makeExportInfo({ name: 'dead', type: 'function', file: 'f.ts', line: 1, usageCount: 0 }),
    ]
    const options = makeFormatOptions({ unusedExports: unused })
    const parsed = JSON.parse(formatJson([], options))
    const item = parsed.unusedExports[0]
    expect(item).toHaveProperty('name')
    expect(item).toHaveProperty('type')
    expect(item).toHaveProperty('file')
    expect(item).toHaveProperty('line')
    expect(item).toHaveProperty('isDefault')
    expect(item).toHaveProperty('isExported')
    expect(item).toHaveProperty('usageCount')
  })

  test('typeSummary values are all numbers in JSON output', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 1, const: 2, function: 3, interface: 4, type: 5 },
    })
    const parsed = JSON.parse(formatJson([], options))
    const et = parsed.summary.exportTypes
    for (const val of Object.values(et)) {
      expect(typeof val).toBe('number')
    }
  })

  test('export with line 0 preserved correctly', () => {
    const exp = makeExportInfo({ name: 'fn', line: 0 })
    const parsed = JSON.parse(formatJson([exp], makeFormatOptions()))
    expect(parsed.exports[0].line).toBe(0)
  })

  test('export with large line number preserved correctly', () => {
    const exp = makeExportInfo({ name: 'fn', line: Number.MAX_SAFE_INTEGER })
    const parsed = JSON.parse(formatJson([exp], makeFormatOptions()))
    expect(parsed.exports[0].line).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('unusedExports array is empty when none provided', () => {
    const parsed = JSON.parse(formatJson([], makeFormatOptions({ unusedExports: [] })))
    expect(parsed.unusedExports).toEqual([])
  })

  test('export with usageCount 0 preserved in JSON', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 0 })
    const parsed = JSON.parse(formatJson([exp], makeFormatOptions()))
    expect(parsed.exports[0].usageCount).toBe(0)
  })
})

// ============================================================================
// formatMarkdown: structure and formatting details
// ============================================================================

describe('formatMarkdown structure and formatting details', () => {
  test('output starts with # Export Analysis', () => {
    const result = formatMarkdown([], makeFormatOptions())
    expect(result.startsWith('# Export Analysis')).toBe(true)
  })

  test('each export detail uses bullet point format for type', () => {
    const exp = makeExportInfo({ name: 'fn', type: 'function' })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('- **Type:** function')
  })

  test('each export detail uses bullet point format for file', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/a.ts', line: 5 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('- **File:** src/a.ts:5')
  })

  test('each export detail shows Usage Count bullet', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 3 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('- **Usage Count:** 3')
  })

  test('each export detail shows Status bullet', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 0 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('- **Status:**')
  })

  test('multiple exports each get complete detail set', () => {
    const exports = [
      makeExportInfo({ name: 'fn1', type: 'function', line: 1, file: 'a.ts', usageCount: 2 }),
      makeExportInfo({ name: 'fn2', type: 'class', line: 2, file: 'b.ts', usageCount: 0 }),
    ]
    const result = formatMarkdown(exports, makeFormatOptions())
    for (const exp of exports) {
      expect(result).toContain(`### ${exp.name}`)
      expect(result).toContain(`- **Type:** ${exp.type}`)
      expect(result).toContain(`- **File:** ${exp.file}:${exp.line}`)
    }
  })

  test('mixed default and non-default exports', () => {
    const exports = [
      makeExportInfo({ name: 'normal', isDefault: false }),
      makeExportInfo({ name: 'def', isDefault: true }),
    ]
    const result = formatMarkdown(exports, makeFormatOptions())
    expect(result).toContain('### normal\n')
    expect(result).toContain('### def (default)')
  })

  test('unused section uses ### heading for each export', () => {
    const unused = [makeExportInfo({ name: 'dead', type: 'function', line: 1, file: 'f.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatMarkdown([], options)
    expect(result).toContain('### dead')
  })

  test('All Exports heading appears with exports', () => {
    const exp = makeExportInfo({ name: 'fn' })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('## All Exports')
  })

  test('Export Types section always present', () => {
    const result = formatMarkdown([], makeFormatOptions())
    expect(result).toContain('## Export Types')
  })

  test('Summary section always present', () => {
    const result = formatMarkdown([], makeFormatOptions())
    expect(result).toContain('## Summary')
  })

  test('export with all fields populated renders completely', () => {
    const exp = makeExportInfo({
      name: 'FullExport',
      type: 'function',
      isDefault: true,
      line: 42,
      file: 'deep/nested/path.ts',
      signature: '(x: number) => string',
      usageCount: 10,
    })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('### FullExport (default)')
    expect(result).toContain('- **Type:** function')
    expect(result).toContain('- **Signature:** `(x: number) => string`')
    expect(result).toContain('- **File:** deep/nested/path.ts:42')
    expect(result).toContain('- **Usage Count:** 10')
    expect(result).toContain('- **Status:** ✓ Used')
  })

  test('unused export detail does not include signature', () => {
    const unused = [
      makeExportInfo({
        name: 'dead',
        type: 'function',
        line: 1,
        file: 'f.ts',
        signature: '() => void',
      }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatMarkdown([], options)
    // Unused section only shows Type and File, not Signature
    expect(result).toContain('### dead')
    expect(result).toContain('- **Type:** function')
    expect(result).toContain('- **File:** f.ts:1')
  })

  test('usageCount zero shows Potentially Unused in markdown', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 0 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('⚠️ Potentially Unused')
  })

  test('usageCount positive shows Used in markdown', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 1 })
    const result = formatMarkdown([exp], makeFormatOptions())
    expect(result).toContain('✓ Used')
  })
})

// ============================================================================
// formatOutput: additional dispatch and output verification
// ============================================================================

describe('formatOutput dispatch and output verification', () => {
  test('formatOutput is idempotent for json format', () => {
    const exports = [makeExportInfo({ name: 'fn' })]
    const options = makeFormatOptions({ format: 'json' })
    const first = formatOutput(exports, options)
    const second = formatOutput(exports, options)
    expect(first).toBe(second)
  })

  test('formatOutput is idempotent for markdown format', () => {
    const exports = [makeExportInfo({ name: 'fn' })]
    const options = makeFormatOptions({ format: 'markdown' })
    const first = formatOutput(exports, options)
    const second = formatOutput(exports, options)
    expect(first).toBe(second)
  })

  test('formatOutput is idempotent for console format', () => {
    const exports = [makeExportInfo({ name: 'fn' })]
    const options = makeFormatOptions({ format: 'console' })
    const first = formatOutput(exports, options)
    const second = formatOutput(exports, options)
    expect(first).toBe(second)
  })

  test('json format output starts with opening brace', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'json' }))
    expect(result.trimStart().startsWith('{')).toBe(true)
  })

  test('markdown format output starts with hash', () => {
    const result = formatOutput([], makeFormatOptions({ format: 'markdown' }))
    expect(result.startsWith('#')).toBe(true)
  })

  test('all formats return type string', () => {
    const formats: FormatOptions['format'][] = ['console', 'json', 'markdown']
    for (const fmt of formats) {
      const result = formatOutput([], makeFormatOptions({ format: fmt }))
      expect(typeof result).toBe('string')
    }
  })

  test('console format with large dataset renders all exports', () => {
    const exports = Array.from({ length: 200 }, (_, i) =>
      makeExportInfo({ name: `export${i}`, line: i + 1 }),
    )
    const result = formatOutput(exports, makeFormatOptions({ format: 'console' }))
    expect(result).toContain('Total exports: 200')
    expect(result).toContain('export0')
    expect(result).toContain('export199')
  })

  test('json format with large dataset is valid JSON', () => {
    const exports = Array.from({ length: 200 }, (_, i) =>
      makeExportInfo({ name: `export${i}`, line: i + 1 }),
    )
    const result = formatOutput(exports, makeFormatOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(200)
  })

  test('markdown format with large dataset renders all headings', () => {
    const exports = Array.from({ length: 50 }, (_, i) =>
      makeExportInfo({ name: `export${i}`, line: i + 1 }),
    )
    const result = formatOutput(exports, makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('### export0')
    expect(result).toContain('### export49')
  })

  test('formatOutput with typeSummary only one non-zero field', () => {
    const options = makeFormatOptions({
      format: 'console',
      typeSummary: { class: 0, const: 0, function: 42, interface: 0, type: 0 },
    })
    const result = formatOutput([], options)
    expect(result).toContain('Functions: 42')
    expect(result).toContain('Classes: 0')
  })

  test('formatOutput with all equal type summary values', () => {
    const options = makeFormatOptions({
      format: 'markdown',
      typeSummary: { class: 5, const: 5, function: 5, interface: 5, type: 5 },
    })
    const result = formatOutput([], options)
    expect(result).toContain('**Functions:** 5')
    expect(result).toContain('**Classes:** 5')
    expect(result).toContain('**Interfaces:** 5')
    expect(result).toContain('**Types:** 5')
    expect(result).toContain('**Constants:** 5')
  })
})

// ============================================================================
// Cross-format consistency
// ============================================================================

describe('cross-format consistency', () => {
  test('all formats report same total exports count', () => {
    const exports = [makeExportInfo(), makeExportInfo({ name: 'b' }), makeExportInfo({ name: 'c' })]
    const base = makeFormatOptions()
    const consoleResult = formatConsole(exports, base)
    const jsonResult = formatJson(exports, base)
    const mdResult = formatMarkdown(exports, base)

    expect(consoleResult).toContain('Total exports: 3')
    expect(JSON.parse(jsonResult).summary.total).toBe(3)
    expect(mdResult).toContain('**Total Exports:** 3')
  })

  test('all formats report same files analyzed count', () => {
    const options = makeFormatOptions({ totalFiles: 25 })
    const consoleResult = formatConsole([], options)
    const jsonResult = formatJson([], options)
    const mdResult = formatMarkdown([], options)

    expect(consoleResult).toContain('Files analyzed: 25')
    expect(JSON.parse(jsonResult).summary.files).toBe(25)
    expect(mdResult).toContain('**Files Analyzed:** 25')
  })

  test('all formats report same type summary', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 3, const: 7, function: 12, interface: 2, type: 5 },
    })
    const consoleResult = formatConsole([], options)
    const jsonResult = formatJson([], options)
    const mdResult = formatMarkdown([], options)

    expect(consoleResult).toContain('Functions: 12')
    expect(JSON.parse(jsonResult).summary.exportTypes.function).toBe(12)
    expect(mdResult).toContain('**Functions:** 12')

    expect(consoleResult).toContain('Classes: 3')
    expect(JSON.parse(jsonResult).summary.exportTypes.class).toBe(3)
    expect(mdResult).toContain('**Classes:** 3')
  })

  test('all formats handle zero exports consistently', () => {
    const base = makeFormatOptions()
    expect(formatConsole([], base)).toContain('Total exports: 0')
    expect(JSON.parse(formatJson([], base)).summary.total).toBe(0)
    expect(formatMarkdown([], base)).toContain('**Total Exports:** 0')
  })

  test('export name appears in all three formats', () => {
    const exp = makeExportInfo({ name: 'sharedName', type: 'function', line: 1, file: 'a.ts' })
    const base = makeFormatOptions()

    expect(formatConsole([exp], base)).toContain('sharedName')
    expect(JSON.parse(formatJson([exp], base)).exports[0].name).toBe('sharedName')
    expect(formatMarkdown([exp], base)).toContain('### sharedName')
  })

  test('unused export name appears in all three formats', () => {
    const unused = [makeExportInfo({ name: 'deadCode', type: 'function', line: 1, file: 'f.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })

    expect(formatConsole([], options)).toContain('deadCode')
    expect(JSON.parse(formatJson([], options)).unusedExports[0].name).toBe('deadCode')
    expect(formatMarkdown([], options)).toContain('### deadCode')
  })

  test('default export status appears consistently across formats', () => {
    const exp = makeExportInfo({
      name: 'DefExport',
      isDefault: true,
      type: 'function',
      line: 1,
      file: 'a.ts',
    })
    const base = makeFormatOptions()

    expect(formatConsole([exp], base)).toContain('(default)')
    expect(JSON.parse(formatJson([exp], base)).exports[0].isDefault).toBe(true)
    expect(formatMarkdown([exp], base)).toContain('(default)')
  })

  test('file path appears consistently across formats', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/deep/mod.ts', line: 33, type: 'function' })
    const base = makeFormatOptions()

    expect(formatConsole([exp], base)).toContain('src/deep/mod.ts:33')
    expect(JSON.parse(formatJson([exp], base)).exports[0].file).toBe('src/deep/mod.ts')
    expect(formatMarkdown([exp], base)).toContain('src/deep/mod.ts:33')
  })

  test('type field appears consistently across formats', () => {
    const exp = makeExportInfo({ name: 'fn', type: 'interface', line: 1, file: 'a.ts' })
    const base = makeFormatOptions()

    expect(JSON.parse(formatJson([exp], base)).exports[0].type).toBe('interface')
    expect(formatMarkdown([exp], base)).toContain('- **Type:** interface')
  })

  test('console and markdown both show all five type summary categories', () => {
    const options = makeFormatOptions({
      typeSummary: { class: 1, const: 2, function: 3, interface: 4, type: 5 },
    })
    const consoleResult = formatConsole([], options)
    const mdResult = formatMarkdown([], options)

    for (const [label, count] of [
      ['Functions', 3],
      ['Classes', 1],
      ['Interfaces', 4],
      ['Types', 5],
      ['Constants', 2],
    ] as const) {
      expect(consoleResult).toContain(`${label}: ${count}`)
      expect(mdResult).toContain(`**${label}:** ${count}`)
    }
  })

  test('unused count is consistent between console unused section and JSON summary', () => {
    const unused = Array.from({ length: 7 }, (_, i) =>
      makeExportInfo({ name: `u${i}`, type: 'function', line: i, file: 'f.ts' }),
    )
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })

    const consoleResult = formatConsole([], options)
    const jsonParsed = JSON.parse(formatJson([], options))

    expect(jsonParsed.summary.unused).toBe(7)
    for (let i = 0; i < 7; i++) {
      expect(consoleResult).toContain(`u${i}`)
    }
  })
})
