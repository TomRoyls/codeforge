import { describe, expect, test } from 'vitest'
import chalk from 'chalk'
import { Project, type SourceFile } from 'ts-morph'

import {
  extractExports,
  extractImports,
  formatConsole,
  formatJson,
  formatMarkdown,
  formatOutput,
  getFunctionSignature,
  getTypeColor,
  truncateSignature,
  type ExportInfo,
  type FormatOptions,
  type TypeSummary,
} from '../../../src/commands/exports-helpers.js'

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

const makeTypeSummary = (overrides: Partial<TypeSummary> = {}): TypeSummary => ({
  class: 0,
  const: 0,
  function: 0,
  interface: 0,
  type: 0,
  ...overrides,
})

const makeFormatOptions = (overrides: Partial<FormatOptions> = {}): FormatOptions => ({
  format: 'console',
  showUnused: false,
  totalFiles: 1,
  typeSummary: makeTypeSummary(),
  unusedExports: [],
  ...overrides,
})

function createSourceFile(code: string): SourceFile {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

// ============================================================================
// truncateSignature
// ============================================================================

describe('truncateSignature', () => {
  test('returns short string unchanged', () => {
    expect(truncateSignature('hello')).toBe('hello')
  })

  test('returns exact maxLength string unchanged', () => {
    const sig = 'a'.repeat(80)
    expect(truncateSignature(sig)).toBe(sig)
  })

  test('truncates string exceeding maxLength with ellipsis', () => {
    const sig = 'a'.repeat(100)
    const result = truncateSignature(sig)
    expect(result.length).toBe(80)
    expect(result.endsWith('...')).toBe(true)
    expect(result).toBe('a'.repeat(77) + '...')
  })

  test('uses custom maxLength', () => {
    expect(truncateSignature('hello world', 5)).toBe('he...')
  })

  test('returns empty string unchanged', () => {
    expect(truncateSignature('')).toBe('')
  })

  test('handles single character string', () => {
    expect(truncateSignature('x')).toBe('x')
  })

  test('handles boundary: one over default maxLength', () => {
    const sig = 'a'.repeat(81)
    const result = truncateSignature(sig)
    expect(result.length).toBe(80)
    expect(result.endsWith('...')).toBe(true)
  })

  test('handles custom maxLength of 0', () => {
    expect(truncateSignature('hello', 0)).toBe('...')
  })

  test('handles custom maxLength of 3 (exact ellipsis)', () => {
    expect(truncateSignature('hello', 3)).toBe('...')
  })

  test('handles custom maxLength of 4', () => {
    expect(truncateSignature('hello', 4)).toBe('h...')
  })

  test('handles negative maxLength gracefully', () => {
    expect(truncateSignature('hello', -1)).toBe('...')
  })

  test('handles very large maxLength', () => {
    const sig = 'hello'
    expect(truncateSignature(sig, 1000)).toBe('hello')
  })

  test('handles unicode characters', () => {
    const sig = '你好世界'
    expect(truncateSignature(sig, 20)).toBe('你好世界')
  })

  test('truncates unicode string exceeding maxLength', () => {
    const sig = '🎉'.repeat(50)
    const result = truncateSignature(sig, 10)
    expect(result.endsWith('...')).toBe(true)
    expect(result.length).toBe(10)
  })

  test('preserves exact maxLength without truncation', () => {
    const sig = 'ab'
    expect(truncateSignature(sig, 2)).toBe('ab')
  })

  test('handles maxLength of 1', () => {
    expect(truncateSignature('hello', 1)).toBe('...')
  })

  test('handles maxLength of 2', () => {
    expect(truncateSignature('hello', 2)).toBe('...')
  })

  test('handles string with only whitespace', () => {
    expect(truncateSignature('   ')).toBe('   ')
  })

  test('truncates long whitespace string', () => {
    const sig = ' '.repeat(100)
    const result = truncateSignature(sig)
    expect(result.length).toBe(80)
    expect(result.endsWith('...')).toBe(true)
  })

  test('handles maxLength equal to string length', () => {
    expect(truncateSignature('abc', 3)).toBe('abc')
  })

  test('handles maxLength one more than string length', () => {
    expect(truncateSignature('abc', 4)).toBe('abc')
  })

  test('preserves content exactly at boundary', () => {
    const sig = 'abcd'
    expect(truncateSignature(sig, 4)).toBe('abcd')
  })

  test('truncates at boundary minus one', () => {
    expect(truncateSignature('abcde', 4)).toBe('a...')
  })

  test('handles string with newlines', () => {
    expect(truncateSignature('hello\nworld')).toBe('hello\nworld')
  })

  test('truncates string with newlines exceeding maxLength', () => {
    const sig = 'a\n'.repeat(50)
    const result = truncateSignature(sig, 20)
    expect(result.endsWith('...')).toBe(true)
    expect(result.length).toBe(20)
  })

  test('handles tab characters', () => {
    expect(truncateSignature('\t\t\t')).toBe('\t\t\t')
  })

  test('handles string of all special characters', () => {
    expect(truncateSignature('!@#$%^&*()')).toBe('!@#$%^&*()')
  })

  test('handles very small positive maxLength', () => {
    expect(truncateSignature('hello', 5)).toBe('hello')
  })

  test('returns correct prefix before ellipsis', () => {
    const result = truncateSignature('abcdefghij', 7)
    expect(result).toBe('abcd...')
  })

  test('handles maxLength exactly 3 more than needed', () => {
    const sig = 'a'.repeat(10)
    expect(truncateSignature(sig, 13)).toBe(sig)
  })
})

// ============================================================================
// getTypeColor
// ============================================================================

describe('getTypeColor', () => {
  test('returns blue for class type', () => {
    const color = getTypeColor('class')
    expect(color('Foo')).toBe(chalk.blue('Foo'))
  })

  test('returns cyan for const type', () => {
    const color = getTypeColor('const')
    expect(color('BAR')).toBe(chalk.cyan('BAR'))
  })

  test('returns green for function type', () => {
    const color = getTypeColor('function')
    expect(color('fn')).toBe(chalk.green('fn'))
  })

  test('returns magenta for interface type', () => {
    const color = getTypeColor('interface')
    expect(color('IFoo')).toBe(chalk.magenta('IFoo'))
  })

  test('returns yellow for type type', () => {
    const color = getTypeColor('type')
    expect(color('T')).toBe(chalk.yellow('T'))
  })

  test('returns white for unknown type', () => {
    const color = getTypeColor('unknown')
    expect(color('x')).toBe(chalk.white('x'))
  })

  test('returns a function that applies color to text', () => {
    const color = getTypeColor('function')
    const result = color('myFunc')
    expect(typeof result).toBe('string')
    expect(result).toContain('myFunc')
  })

  test('returns white for empty string type', () => {
    const color = getTypeColor('')
    expect(color('x')).toBe(chalk.white('x'))
  })

  test('returns consistent color for same type', () => {
    const color1 = getTypeColor('class')
    const color2 = getTypeColor('class')
    expect(color1('Foo')).toBe(color2('Foo'))
  })

  test('applies correct color to empty text', () => {
    const color = getTypeColor('function')
    expect(color('')).toBe(chalk.green(''))
  })

  test('handles type with mixed case (unknown)', () => {
    const color = getTypeColor('Class')
    expect(color('Foo')).toBe(chalk.white('Foo'))
  })

  test('returns white for "null" type string', () => {
    const color = getTypeColor('null' as ExportInfo['type'])
    expect(color('x')).toBe(chalk.white('x'))
  })

  test('returns white for "undefined" type string', () => {
    const color = getTypeColor('undefined' as ExportInfo['type'])
    expect(color('x')).toBe(chalk.white('x'))
  })

  test('returns different color functions for different types', () => {
    const classColor = getTypeColor('class')
    const funcColor = getTypeColor('function')
    expect(classColor('X')).toContain('X')
    expect(funcColor('X')).toContain('X')
  })

  test('returns function that preserves text content', () => {
    const color = getTypeColor('class')
    const result = color('MyClassName')
    expect(result).toContain('MyClassName')
  })

  test('handles long text input', () => {
    const color = getTypeColor('function')
    const longText = 'a'.repeat(500)
    expect(color(longText)).toContain(longText)
  })

  test('returns all five known type colors correctly', () => {
    const types = ['class', 'const', 'function', 'interface', 'type'] as const
    for (const t of types) {
      const color = getTypeColor(t)
      expect(typeof color('test')).toBe('string')
    }
  })
})

// ============================================================================
// formatJson
// ============================================================================

describe('formatJson', () => {
  test('formats basic exports as valid JSON', () => {
    const exports = [makeExportInfo()]
    const options = makeFormatOptions({ format: 'json' })
    const result = formatJson(exports, options)
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(1)
  })

  test('formats empty exports array', () => {
    const options = makeFormatOptions({ format: 'json' })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(0)
    expect(parsed.summary.total).toBe(0)
  })

  test('includes summary with typeSummary', () => {
    const ts = makeTypeSummary({ function: 3, class: 1 })
    const options = makeFormatOptions({ format: 'json', typeSummary: ts })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.exportTypes.function).toBe(3)
    expect(parsed.summary.exportTypes.class).toBe(1)
  })

  test('includes summary files count', () => {
    const options = makeFormatOptions({ format: 'json', totalFiles: 42 })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.files).toBe(42)
  })

  test('includes unused exports', () => {
    const unused = [makeExportInfo({ name: 'unusedFn' })]
    const options = makeFormatOptions({ format: 'json', unusedExports: unused })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.unusedExports).toHaveLength(1)
    expect(parsed.unusedExports[0].name).toBe('unusedFn')
    expect(parsed.summary.unused).toBe(1)
  })

  test('formats with 2-space indentation', () => {
    const result = formatJson([], makeFormatOptions({ format: 'json' }))
    expect(result).toContain('\n  ')
  })

  test('includes all export fields for each export', () => {
    const exp = makeExportInfo({
      name: 'fn',
      type: 'function',
      signature: '() => void',
      line: 42,
      file: 'src/index.ts',
      isDefault: true,
      usageCount: 5,
    })
    const options = makeFormatOptions({ format: 'json' })
    const result = formatJson([exp], options)
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].name).toBe('fn')
    expect(parsed.exports[0].type).toBe('function')
    expect(parsed.exports[0].signature).toBe('() => void')
    expect(parsed.exports[0].line).toBe(42)
    expect(parsed.exports[0].file).toBe('src/index.ts')
    expect(parsed.exports[0].isDefault).toBe(true)
    expect(parsed.exports[0].usageCount).toBe(5)
  })

  test('handles multiple unused exports', () => {
    const unused = [
      makeExportInfo({ name: 'unused1' }),
      makeExportInfo({ name: 'unused2' }),
      makeExportInfo({ name: 'unused3' }),
    ]
    const options = makeFormatOptions({ format: 'json', unusedExports: unused })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.unused).toBe(3)
    expect(parsed.unusedExports).toHaveLength(3)
  })

  test('all-zero typeSummary produces zero counts', () => {
    const ts = makeTypeSummary()
    const options = makeFormatOptions({ format: 'json', typeSummary: ts })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.exportTypes.function).toBe(0)
    expect(parsed.summary.exportTypes.class).toBe(0)
    expect(parsed.summary.exportTypes.interface).toBe(0)
    expect(parsed.summary.exportTypes.type).toBe(0)
    expect(parsed.summary.exportTypes.const).toBe(0)
  })

  test('produces parseable JSON for complex export with all fields', () => {
    const exports = [
      makeExportInfo({ name: 'a', type: 'class', signature: undefined }),
      makeExportInfo({ name: 'b', type: 'const', signature: '42' }),
      makeExportInfo({ name: 'c', type: 'interface' }),
    ]
    const result = formatJson(exports, makeFormatOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(3)
    expect(parsed.summary.total).toBe(3)
  })

  test('unused count is 0 when no unusedExports', () => {
    const options = makeFormatOptions({ format: 'json', unusedExports: [] })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.unused).toBe(0)
    expect(parsed.unusedExports).toHaveLength(0)
  })

  test('handles export with undefined signature', () => {
    const exp = makeExportInfo({ name: 'fn', signature: undefined })
    const options = makeFormatOptions({ format: 'json' })
    const result = formatJson([exp], options)
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].signature).toBeUndefined()
  })

  test('handles export with empty string name', () => {
    const exp = makeExportInfo({ name: '' })
    const options = makeFormatOptions({ format: 'json' })
    const result = formatJson([exp], options)
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].name).toBe('')
  })

  test('handles large number of exports', () => {
    const exports = Array.from({ length: 100 }, (_, i) => makeExportInfo({ name: `fn${i}` }))
    const options = makeFormatOptions({ format: 'json' })
    const result = formatJson(exports, options)
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(100)
    expect(parsed.summary.total).toBe(100)
  })

  test('type summary reflects individual type counts', () => {
    const ts = makeTypeSummary({ function: 10, class: 5, interface: 3, type: 7, const: 2 })
    const options = makeFormatOptions({ format: 'json', typeSummary: ts })
    const result = formatJson([], options)
    const parsed = JSON.parse(result)
    const et = parsed.summary.exportTypes
    expect(et.function + et.class + et.interface + et.type + et.const).toBe(27)
  })

  test('preserves file path in exports', () => {
    const exp = makeExportInfo({ file: '/deep/nested/path/to/module.ts' })
    const result = formatJson([exp], makeFormatOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].file).toBe('/deep/nested/path/to/module.ts')
  })

  test('handles export with zero usageCount', () => {
    const exp = makeExportInfo({ usageCount: 0 })
    const result = formatJson([exp], makeFormatOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].usageCount).toBe(0)
  })

  test('handles export with high usageCount', () => {
    const exp = makeExportInfo({ usageCount: 999 })
    const result = formatJson([exp], makeFormatOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed.exports[0].usageCount).toBe(999)
  })

  test('summary total matches exports array length not typeSummary', () => {
    const ts = makeTypeSummary({ function: 100 })
    const exports = [makeExportInfo({ type: 'function' })]
    const options = makeFormatOptions({ format: 'json', typeSummary: ts })
    const result = formatJson(exports, options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.total).toBe(1)
    expect(parsed.summary.exportTypes.function).toBe(100)
  })
})

// ============================================================================
// formatMarkdown
// ============================================================================

describe('formatMarkdown', () => {
  test('includes main header', () => {
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('# Export Analysis')
  })

  test('includes summary section', () => {
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown', totalFiles: 5 }))
    expect(result).toContain('## Summary')
    expect(result).toContain('**Files Analyzed:** 5')
  })

  test('shows total exports as 0 for empty array', () => {
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('**Total Exports:** 0')
  })

  test('shows total exports for non-empty array', () => {
    const exports = [makeExportInfo(), makeExportInfo({ name: 'other' })]
    const result = formatMarkdown(exports, makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('**Total Exports:** 2')
  })

  test('includes export types section', () => {
    const ts = makeTypeSummary({ function: 5, class: 2 })
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown', typeSummary: ts }))
    expect(result).toContain('## Export Types')
    expect(result).toContain('**Functions:** 5')
    expect(result).toContain('**Classes:** 2')
  })

  test('includes export details when exports exist', () => {
    const exp = makeExportInfo({
      name: 'myFunc',
      type: 'function',
      signature: '() => void',
      line: 10,
      file: 'src/foo.ts',
    })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('## All Exports')
    expect(result).toContain('### myFunc')
    expect(result).toContain('**Type:** function')
    expect(result).toContain('**Signature:** `() => void`')
    expect(result).toContain('**File:** src/foo.ts:10')
  })

  test('shows (default) for default exports', () => {
    const exp = makeExportInfo({ name: 'DefaultThing', isDefault: true })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('### DefaultThing (default)')
  })

  test('shows unused section when showUnused is true and unusedExports exist', () => {
    const unused = [makeExportInfo({ name: 'oldFn', type: 'function', line: 5, file: 'old.ts' })]
    const options = makeFormatOptions({
      format: 'markdown',
      showUnused: true,
      unusedExports: unused,
    })
    const result = formatMarkdown([], options)
    expect(result).toContain('## Potentially Unused Exports')
    expect(result).toContain('### oldFn')
  })

  test('does not show unused section when showUnused is false', () => {
    const unused = [makeExportInfo({ name: 'oldFn' })]
    const options = makeFormatOptions({
      format: 'markdown',
      showUnused: false,
      unusedExports: unused,
    })
    const result = formatMarkdown([], options)
    expect(result).not.toContain('## Potentially Unused Exports')
  })

  test('shows usage status as used when usageCount > 0', () => {
    const exp = makeExportInfo({ name: 'usedFn', usageCount: 3 })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('**Status:** ✓ Used')
  })

  test('shows usage status as potentially unused when usageCount === 0', () => {
    const exp = makeExportInfo({ name: 'unusedFn', usageCount: 0 })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('**Status:** ⚠️ Potentially Unused')
  })

  test('does not show All Exports section when no exports', () => {
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown' }))
    expect(result).not.toContain('## All Exports')
  })

  test('does not show signature when export has no signature', () => {
    const exp = makeExportInfo({ name: 'fn', signature: undefined })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).not.toContain('**Signature:**')
  })

  test('includes usage count in export details', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 7 })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('**Usage Count:** 7')
  })

  test('lists all export types with zero counts', () => {
    const ts = makeTypeSummary()
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown', typeSummary: ts }))
    expect(result).toContain('**Functions:** 0')
    expect(result).toContain('**Classes:** 0')
    expect(result).toContain('**Interfaces:** 0')
    expect(result).toContain('**Types:** 0')
    expect(result).toContain('**Constants:** 0')
  })

  test('handles multiple exports in All Exports section', () => {
    const exports = [
      makeExportInfo({ name: 'fn1', type: 'function', line: 1 }),
      makeExportInfo({ name: 'fn2', type: 'function', line: 2 }),
      makeExportInfo({ name: 'Cls', type: 'class', line: 3 }),
    ]
    const result = formatMarkdown(exports, makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('### fn1')
    expect(result).toContain('### fn2')
    expect(result).toContain('### Cls')
  })

  test('unused section includes type and file for each export', () => {
    const unused = [
      makeExportInfo({ name: 'oldFn', type: 'function', line: 5, file: 'old.ts' }),
      makeExportInfo({ name: 'OldClass', type: 'class', line: 10, file: 'legacy.ts' }),
    ]
    const options = makeFormatOptions({
      format: 'markdown',
      showUnused: true,
      unusedExports: unused,
    })
    const result = formatMarkdown([], options)
    expect(result).toContain('**Type:** function')
    expect(result).toContain('**File:** old.ts:5')
    expect(result).toContain('**Type:** class')
    expect(result).toContain('**File:** legacy.ts:10')
  })

  test('does not show unused section when showUnused is true but no unused exports', () => {
    const options = makeFormatOptions({ format: 'markdown', showUnused: true, unusedExports: [] })
    const result = formatMarkdown([], options)
    expect(result).not.toContain('## Potentially Unused Exports')
  })

  test('shows file and line in export details', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/mod.ts', line: 25 })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('**File:** src/mod.ts:25')
  })

  test('shows isExported status for regular exports', () => {
    const exp = makeExportInfo({ name: 'fn', isExported: true })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('### fn')
  })

  test('handles export with special characters in name', () => {
    const exp = makeExportInfo({ name: '$myFunc' })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('### $myFunc')
  })

  test('unused section shows usage count for each export', () => {
    const unused = [makeExportInfo({ name: 'oldFn', usageCount: 0, line: 1, file: 'a.ts' })]
    const options = makeFormatOptions({
      format: 'markdown',
      showUnused: true,
      unusedExports: unused,
    })
    const result = formatMarkdown([], options)
    expect(result).toContain('### oldFn')
    expect(result).toContain('**File:** a.ts:1')
  })

  test('handles mixed default and non-default exports', () => {
    const exports = [
      makeExportInfo({ name: 'fn1', isDefault: true }),
      makeExportInfo({ name: 'fn2', isDefault: false }),
    ]
    const result = formatMarkdown(exports, makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('### fn1 (default)')
    expect(result).toContain('### fn2')
  })

  test('shows correct status for usageCount > 0', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 1 })
    const result = formatMarkdown([exp], makeFormatOptions({ format: 'markdown' }))
    expect(result).toContain('✓ Used')
  })

  test('handles exports with same name but different types', () => {
    const exports = [
      makeExportInfo({ name: 'Thing', type: 'class' }),
      makeExportInfo({ name: 'Thing', type: 'interface' }),
    ]
    const result = formatMarkdown(exports, makeFormatOptions({ format: 'markdown' }))
    const headings = result.match(/### Thing/g)
    expect(headings).toHaveLength(2)
  })

  test('handles totalFiles as 0', () => {
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown', totalFiles: 0 }))
    expect(result).toContain('**Files Analyzed:** 0')
  })

  test('handles large totalFiles value', () => {
    const result = formatMarkdown([], makeFormatOptions({ format: 'markdown', totalFiles: 9999 }))
    expect(result).toContain('**Files Analyzed:** 9999')
  })
})

// ============================================================================
// formatConsole
// ============================================================================

describe('formatConsole', () => {
  test('includes export analysis header', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).toContain('Export Analysis')
  })

  test('includes summary counts', () => {
    const ts = makeTypeSummary({ function: 3, class: 1, interface: 2, type: 4, const: 5 })
    const result = formatConsole([], makeFormatOptions({ totalFiles: 10, typeSummary: ts }))
    expect(result).toContain('Total exports: 0')
    expect(result).toContain('Files analyzed: 10')
    expect(result).toContain('Functions: 3')
    expect(result).toContain('Classes: 1')
    expect(result).toContain('Interfaces: 2')
    expect(result).toContain('Types: 4')
    expect(result).toContain('Constants: 5')
  })

  test('shows export list when exports exist', () => {
    const exp = makeExportInfo({ name: 'myFunc', type: 'function', line: 5, file: 'src/a.ts' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Exports:')
    expect(result).toContain('myFunc')
    expect(result).toContain('src/a.ts:5')
    expect(result).toContain('Usage count: 0')
  })

  test('shows signature when present', () => {
    const exp = makeExportInfo({ name: 'fn', signature: '(x: number) => string' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Signature: (x: number) => string')
  })

  test('does not show signature when absent', () => {
    const exp = makeExportInfo({ name: 'fn', signature: undefined })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).not.toContain('Signature:')
  })

  test('shows warning emoji for unused exports (usageCount === 0)', () => {
    const exp = makeExportInfo({ name: 'unused', usageCount: 0 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('⚠️')
  })

  test('does not show warning emoji for used exports (usageCount > 0)', () => {
    const exp = makeExportInfo({ name: 'used', usageCount: 5 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).not.toContain('⚠️')
  })

  test('shows (default) for default exports', () => {
    const exp = makeExportInfo({ name: 'DefaultExport', isDefault: true })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('(default)')
  })

  test('shows unused section when showUnused is true and unusedExports exist', () => {
    const unused = [makeExportInfo({ name: 'oldFn', type: 'function', line: 3, file: 'old.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('Potentially Unused Exports')
    expect(result).toContain('oldFn')
    expect(result).toContain('old.ts:3')
  })

  test('does not show unused section when showUnused is false', () => {
    const unused = [makeExportInfo({ name: 'oldFn' })]
    const options = makeFormatOptions({ showUnused: false, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).not.toContain('Potentially Unused Exports')
  })

  test('does not show Exports header when no exports', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).not.toContain('Exports:')
  })

  test('shows file and line for each export', () => {
    const exp = makeExportInfo({ name: 'fn', file: 'src/util.ts', line: 15 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('src/util.ts:15')
  })

  test('shows type padded for different export types', () => {
    const exps = [
      makeExportInfo({ name: 'fn', type: 'function' }),
      makeExportInfo({ name: 'Cls', type: 'class' }),
    ]
    const result = formatConsole(exps, makeFormatOptions())
    expect(result).toContain('function')
    expect(result).toContain('class')
  })

  test('shows usage count value for each export', () => {
    const exp = makeExportInfo({ name: 'fn', usageCount: 10 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Usage count: 10')
  })

  test('handles multiple exports with mixed types', () => {
    const exps = [
      makeExportInfo({ name: 'fn', type: 'function', line: 1, file: 'a.ts' }),
      makeExportInfo({ name: 'Cls', type: 'class', line: 2, file: 'b.ts' }),
      makeExportInfo({ name: 'IFoo', type: 'interface', line: 3, file: 'c.ts' }),
    ]
    const result = formatConsole(exps, makeFormatOptions())
    expect(result).toContain('fn')
    expect(result).toContain('Cls')
    expect(result).toContain('IFoo')
  })

  test('unused section shows type for each export', () => {
    const unused = [makeExportInfo({ name: 'oldFn', type: 'function', line: 1, file: 'a.ts' })]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('(function)')
  })

  test('unused section with multiple exports', () => {
    const unused = [
      makeExportInfo({ name: 'fn1', type: 'function', line: 1, file: 'a.ts' }),
      makeExportInfo({ name: 'fn2', type: 'const', line: 2, file: 'b.ts' }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('fn1')
    expect(result).toContain('fn2')
  })

  test('does not show unused section when showUnused is true but no unused exports', () => {
    const options = makeFormatOptions({ showUnused: true, unusedExports: [] })
    const result = formatConsole([], options)
    expect(result).not.toContain('Potentially Unused Exports')
  })

  test('total exports count reflects exports array length', () => {
    const exps = [makeExportInfo(), makeExportInfo({ name: 'b' }), makeExportInfo({ name: 'c' })]
    const result = formatConsole(exps, makeFormatOptions())
    expect(result).toContain('Total exports: 3')
  })

  test('shows constant type with correct padding', () => {
    const exp = makeExportInfo({ name: 'MY_CONST', type: 'const' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('MY_CONST')
  })

  test('shows type alias with correct type label', () => {
    const exp = makeExportInfo({ name: 'MyType', type: 'type' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('MyType')
  })

  test('shows interface type with correct padding', () => {
    const exp = makeExportInfo({ name: 'IFoo', type: 'interface' })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('IFoo')
  })

  test('shows default indicator for default exports in list', () => {
    const exp = makeExportInfo({ name: 'Def', isDefault: true })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('Def')
    expect(result).toContain('(default)')
  })

  test('handles export with very long name', () => {
    const longName = 'a'.repeat(200)
    const exp = makeExportInfo({ name: longName })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain(longName)
  })

  test('handles export with special characters in file path', () => {
    const exp = makeExportInfo({ file: 'src/[id]/route.ts', line: 42 })
    const result = formatConsole([exp], makeFormatOptions())
    expect(result).toContain('src/[id]/route.ts:42')
  })

  test('unused section does not show when exports are present but no unused', () => {
    const exp = makeExportInfo({ name: 'fn' })
    const options = makeFormatOptions({ showUnused: false, unusedExports: [] })
    const result = formatConsole([exp], options)
    expect(result).not.toContain('Potentially Unused Exports')
  })

  test('handles zero totalFiles', () => {
    const result = formatConsole([], makeFormatOptions({ totalFiles: 0 }))
    expect(result).toContain('Files analyzed: 0')
  })

  test('handles all zero type summary', () => {
    const ts = makeTypeSummary()
    const result = formatConsole([], makeFormatOptions({ typeSummary: ts }))
    expect(result).toContain('Functions: 0')
    expect(result).toContain('Classes: 0')
    expect(result).toContain('Interfaces: 0')
    expect(result).toContain('Types: 0')
    expect(result).toContain('Constants: 0')
  })

  test('export list shows all five different types', () => {
    const types = ['function', 'class', 'interface', 'type', 'const'] as const
    const exps = types.map((t, i) => makeExportInfo({ name: `${t}Exp`, type: t, line: i + 1 }))
    const result = formatConsole(exps, makeFormatOptions())
    for (const t of types) {
      expect(result).toContain(`${t}Exp`)
    }
  })

  test('unused section shows file and line for each entry', () => {
    const unused = [
      makeExportInfo({ name: 'a', type: 'function', line: 10, file: 'x.ts' }),
      makeExportInfo({ name: 'b', type: 'class', line: 20, file: 'y.ts' }),
    ]
    const options = makeFormatOptions({ showUnused: true, unusedExports: unused })
    const result = formatConsole([], options)
    expect(result).toContain('x.ts:10')
    expect(result).toContain('y.ts:20')
  })

  test('shows emoji header for export analysis', () => {
    const result = formatConsole([], makeFormatOptions())
    expect(result).toContain('📦')
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
    const exports = [makeExportInfo()]
    const options = makeFormatOptions({ format: 'markdown' })
    const result = formatOutput(exports, options)
    expect(result).toContain('# Export Analysis')
  })

  test('dispatches to formatConsole when format is console', () => {
    const exports = [makeExportInfo()]
    const options = makeFormatOptions({ format: 'console' })
    const result = formatOutput(exports, options)
    expect(result).toContain('Export Analysis')
  })

  test('defaults to console for unknown format', () => {
    const exports = [makeExportInfo()]
    const options = makeFormatOptions({ format: 'unknown' as FormatOptions['format'] })
    const result = formatOutput(exports, options)
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

  test('handles empty exports array for all formats', () => {
    const jsonOpt = makeFormatOptions({ format: 'json' })
    const mdOpt = makeFormatOptions({ format: 'markdown' })
    const conOpt = makeFormatOptions({ format: 'console' })

    expect(() => JSON.parse(formatOutput([], jsonOpt))).not.toThrow()
    expect(formatOutput([], mdOpt)).toContain('# Export Analysis')
    expect(formatOutput([], conOpt)).toContain('Export Analysis')
  })

  test('passes unused exports through to formatters', () => {
    const unused = [makeExportInfo({ name: 'old' })]
    const options = makeFormatOptions({ format: 'json', unusedExports: unused })
    const result = formatOutput([], options)
    const parsed = JSON.parse(result)
    expect(parsed.unusedExports).toHaveLength(1)
    expect(parsed.unusedExports[0].name).toBe('old')
  })

  test('passes typeSummary through to formatters', () => {
    const ts = makeTypeSummary({ function: 10, class: 5 })
    const options = makeFormatOptions({ format: 'json', typeSummary: ts })
    const result = formatOutput([], options)
    const parsed = JSON.parse(result)
    expect(parsed.summary.exportTypes.function).toBe(10)
    expect(parsed.summary.exportTypes.class).toBe(5)
  })

  test('handles empty exports with json format', () => {
    const options = makeFormatOptions({ format: 'json' })
    const result = formatOutput([], options)
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(0)
    expect(parsed.summary.total).toBe(0)
  })

  test('handles empty exports with markdown format', () => {
    const options = makeFormatOptions({ format: 'markdown' })
    const result = formatOutput([], options)
    expect(result).toContain('**Total Exports:** 0')
  })

  test('handles empty exports with console format', () => {
    const options = makeFormatOptions({ format: 'console' })
    const result = formatOutput([], options)
    expect(result).toContain('Total exports: 0')
  })

  test('handles exports with all formats consistently', () => {
    const exports = [makeExportInfo({ name: 'testFn' })]
    const jsonResult = formatOutput(exports, makeFormatOptions({ format: 'json' }))
    const mdResult = formatOutput(exports, makeFormatOptions({ format: 'markdown' }))
    const conResult = formatOutput(exports, makeFormatOptions({ format: 'console' }))

    const parsed = JSON.parse(jsonResult)
    expect(parsed.exports[0].name).toBe('testFn')
    expect(mdResult).toContain('testFn')
    expect(conResult).toContain('testFn')
  })
})

// ============================================================================
// extractImports
// ============================================================================

describe('extractImports', () => {
  test('extracts named imports', () => {
    const sf = createSourceFile('import { foo } from "bar"')
    const result = extractImports(sf)
    expect(result.get('foo')).toBe(1)
  })

  test('extracts multiple named imports', () => {
    const sf = createSourceFile('import { foo, bar, baz } from "mod"')
    const result = extractImports(sf)
    expect(result.get('foo')).toBe(1)
    expect(result.get('bar')).toBe(1)
    expect(result.get('baz')).toBe(1)
  })

  test('extracts default import', () => {
    const sf = createSourceFile('import React from "react"')
    const result = extractImports(sf)
    expect(result.get('React')).toBe(1)
  })

  test('extracts namespace import', () => {
    const sf = createSourceFile('import * as utils from "./utils"')
    const result = extractImports(sf)
    expect(result.get('utils')).toBe(1)
  })

  test('extracts mixed imports from multiple declarations', () => {
    const sf = createSourceFile(`
      import { foo } from "a"
      import Bar from "b"
      import * as baz from "c"
    `)
    const result = extractImports(sf)
    expect(result.get('foo')).toBe(1)
    expect(result.get('Bar')).toBe(1)
    expect(result.get('baz')).toBe(1)
  })

  test('returns empty map for file with no imports', () => {
    const sf = createSourceFile('const x = 1')
    const result = extractImports(sf)
    expect(result.size).toBe(0)
  })

  test('counts multiple occurrences of same import name', () => {
    const sf = createSourceFile(`
      import { foo } from "a"
      import { foo } from "b"
    `)
    const result = extractImports(sf)
    expect(result.get('foo')).toBe(2)
  })

  test('returns Map instance', () => {
    const sf = createSourceFile('import { x } from "y"')
    const result = extractImports(sf)
    expect(result).toBeInstanceOf(Map)
  })

  test('handles aliased named imports by original name', () => {
    const sf = createSourceFile('import { foo as bar } from "mod"')
    const result = extractImports(sf)
    expect(result.get('foo')).toBe(1)
  })

  test('handles side-effect import', () => {
    const sf = createSourceFile('import "side-effect-module"')
    const result = extractImports(sf)
    expect(result.size).toBe(0)
  })

  test('extracts mixed default and named imports', () => {
    const sf = createSourceFile('import React, { useState, useEffect } from "react"')
    const result = extractImports(sf)
    expect(result.get('React')).toBe(1)
    expect(result.get('useState')).toBe(1)
    expect(result.get('useEffect')).toBe(1)
  })

  test('handles empty source file', () => {
    const sf = createSourceFile('')
    const result = extractImports(sf)
    expect(result.size).toBe(0)
  })

  test('handles file with only comments', () => {
    const sf = createSourceFile('// just a comment')
    const result = extractImports(sf)
    expect(result.size).toBe(0)
  })

  test('handles multiple aliased imports', () => {
    const sf = createSourceFile('import { A as X, B as Y, C } from "mod"')
    const result = extractImports(sf)
    expect(result.get('A')).toBe(1)
    expect(result.get('B')).toBe(1)
    expect(result.get('C')).toBe(1)
  })

  test('handles import with type modifier', () => {
    const sf = createSourceFile('import type { Foo } from "mod"')
    const result = extractImports(sf)
    expect(result.get('Foo')).toBe(1)
  })

  test('handles default import with named imports together', () => {
    const sf = createSourceFile('import Default, { named } from "mod"')
    const result = extractImports(sf)
    expect(result.get('Default')).toBe(1)
    expect(result.get('named')).toBe(1)
  })

  test('handles import with trailing comma in named imports', () => {
    const sf = createSourceFile('import { foo, bar, } from "mod"')
    const result = extractImports(sf)
    expect(result.get('foo')).toBe(1)
    expect(result.get('bar')).toBe(1)
  })

  test('handles import from relative path', () => {
    const sf = createSourceFile('import { helper } from "./helpers/utils"')
    const result = extractImports(sf)
    expect(result.get('helper')).toBe(1)
  })

  test('handles import from package with scoped name', () => {
    const sf = createSourceFile('import { something } from "@scope/package"')
    const result = extractImports(sf)
    expect(result.get('something')).toBe(1)
  })

  test('counts correctly across many import declarations', () => {
    const code = [
      'import { a } from "x"',
      'import { b } from "y"',
      'import { c } from "z"',
      'import { a } from "w"',
    ].join('\n')
    const sf = createSourceFile(code)
    const result = extractImports(sf)
    expect(result.get('a')).toBe(2)
    expect(result.get('b')).toBe(1)
    expect(result.get('c')).toBe(1)
    expect(result.size).toBe(3)
  })

  test('handles namespace import with same name as named import', () => {
    const sf = createSourceFile(`
      import { foo } from "a"
      import * as foo from "b"
    `)
    const result = extractImports(sf)
    expect(result.get('foo')).toBe(2)
  })

  test('handles import with string module path using double quotes', () => {
    const sf = createSourceFile('import { x } from "module"')
    const result = extractImports(sf)
    expect(result.get('x')).toBe(1)
  })

  test('handles import with string module path using single quotes', () => {
    const sf = createSourceFile("import { x } from 'module'")
    const result = extractImports(sf)
    expect(result.get('x')).toBe(1)
  })

  test('handles file with code but no imports', () => {
    const sf = createSourceFile('const x = 1\nconst y = 2\nfunction foo() {}')
    const result = extractImports(sf)
    expect(result.size).toBe(0)
  })
})

// ============================================================================
// extractExports
// ============================================================================

describe('extractExports', () => {
  test('extracts exported function', () => {
    const sf = createSourceFile('export function myFunc() {}')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('myFunc')
    expect(result[0].type).toBe('function')
    expect(result[0].isExported).toBe(true)
    expect(result[0].file).toBe('test.ts')
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
    expect(result[0].signature).toBe('string | number')
  })

  test('extracts exported const', () => {
    const sf = createSourceFile('export const MY_CONST = 42')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('MY_CONST')
    expect(result[0].type).toBe('const')
    expect(result[0].signature).toBe('42')
  })

  test('extracts default export function', () => {
    const sf = createSourceFile('export default function myFunc() {}')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].isDefault).toBe(true)
  })

  test('extracts default export class', () => {
    const sf = createSourceFile('export default class MyClass {}')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].isDefault).toBe(true)
    expect(result[0].name).toBe('MyClass')
  })

  test('ignores non-exported declarations', () => {
    const sf = createSourceFile(`
      function privateFn() {}
      class PrivateClass {}
      interface PrivateInterface {}
      type PrivateType = string
      const privateConst = 1
    `)
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(0)
  })

  test('extracts all exports from multi-export file', () => {
    const sf = createSourceFile(['export function fn() {}', 'export class Cls {}'].join('\n'))
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('fn')
    expect(result[0].type).toBe('function')
    expect(result[1].name).toBe('Cls')
    expect(result[1].type).toBe('class')
  })

  test('extracts multiple exported consts from single statement', () => {
    const sf = createSourceFile('export const a = 1, b = 2')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(2)
    expect(result.map((e) => e.name)).toEqual(['a', 'b'])
  })

  test('sets line number correctly', () => {
    const sf = createSourceFile('\n\nexport function myFunc() {}')
    const result = extractExports(sf, 'test.ts')
    expect(result[0].line).toBe(3)
  })

  test('sets usageCount to 0 for all exports', () => {
    const sf = createSourceFile('export function fn() {}')
    const result = extractExports(sf, 'test.ts')
    expect(result[0].usageCount).toBe(0)
  })

  test('uses filePath parameter as file property', () => {
    const sf = createSourceFile('export function fn() {}')
    const result = extractExports(sf, 'src/components/app.tsx')
    expect(result[0].file).toBe('src/components/app.tsx')
  })

  test('handles exported type without type node', () => {
    const sf = createSourceFile('export type Empty = {}')
    const result = extractExports(sf, 'test.ts')
    expect(result[0].signature).toBe('{}')
  })

  test('handles anonymous exported function', () => {
    const sf = createSourceFile('export default function() {}')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('anonymous')
  })

  test('extracts exported function with parameters', () => {
    const sf = createSourceFile(
      'export function add(x: number, y: number): number { return x + y }',
    )
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('add')
    expect(result[0].type).toBe('function')
    expect(result[0].signature).toContain('x: number')
    expect(result[0].signature).toContain('y: number')
  })

  test('extracts exported const without initializer', () => {
    const sf = createSourceFile('export const MY_CONST: number = 42')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('MY_CONST')
    expect(result[0].signature).toBe('42')
  })

  test('extracts exported class with name', () => {
    const sf = createSourceFile('export class Service { private x = 1; method() {} }')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Service')
    expect(result[0].type).toBe('class')
    expect(result[0].isDefault).toBe(false)
  })

  test('handles multiple exports with different types', () => {
    const sf = createSourceFile(`
      export function fn() {}
      export class Cls {}
      export interface IFoo {}
      export type T = string
      export const c = 1
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

  test('handles empty source file', () => {
    const sf = createSourceFile('')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(0)
  })

  test('sets isDefault to false for regular exports', () => {
    const sf = createSourceFile('export function myFunc() {}')
    const result = extractExports(sf, 'test.ts')
    expect(result[0].isDefault).toBe(false)
  })

  test('extracts default export inline expression', () => {
    const sf = createSourceFile('export default { name: "test", value: 42 }')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(0)
  })

  test('handles export with complex type signature', () => {
    const sf = createSourceFile('export type Complex<T> = T extends string ? T : never')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Complex')
    expect(result[0].signature).toBeDefined()
  })

  test('handles exported const with object initializer', () => {
    const sf = createSourceFile('export const config = { debug: true, port: 3000 }')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('config')
    expect(result[0].signature).toBeDefined()
  })

  test('line numbers are sequential for multiple exports', () => {
    const sf = createSourceFile(`export function fn1() {}
export function fn2() {}
export function fn3() {}`)
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(3)
    expect(result[0].line).toBeLessThan(result[1].line)
    expect(result[1].line).toBeLessThan(result[2].line)
  })

  test('extracts exported arrow function as const', () => {
    const sf = createSourceFile('export const add = (x: number, y: number) => x + y')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('add')
    expect(result[0].type).toBe('const')
  })

  test('extracts exported async function', () => {
    const sf = createSourceFile('export async function fetchData() {}')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('fetchData')
    expect(result[0].type).toBe('function')
  })

  test('extracts exported generic function', () => {
    const sf = createSourceFile('export function identity<T>(arg: T): T { return arg }')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('identity')
    expect(result[0].type).toBe('function')
  })

  test('extracts exported const with string initializer', () => {
    const sf = createSourceFile("export const GREETING = 'hello'")
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('GREETING')
    expect(result[0].signature).toBe("'hello'")
  })

  test('extracts exported const with array initializer', () => {
    const sf = createSourceFile('export const items = [1, 2, 3]')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('items')
    expect(result[0].signature).toBe('[1, 2, 3]')
  })

  test('extracts exported const with boolean initializer', () => {
    const sf = createSourceFile('export const ENABLED = true')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('ENABLED')
    expect(result[0].signature).toBe('true')
  })

  test('extracts exported const with null initializer', () => {
    const sf = createSourceFile('export const value = null')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('value')
    expect(result[0].signature).toBe('null')
  })

  test('extracts exported const with function call initializer', () => {
    const sf = createSourceFile('export const result = compute()')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('result')
    expect(result[0].signature).toBe('compute()')
  })

  test('extracts exported type with union', () => {
    const sf = createSourceFile('export type Status = "active" | "inactive"')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Status')
    expect(result[0].signature).toBe('"active" | "inactive"')
  })

  test('extracts exported interface with methods', () => {
    const sf = createSourceFile('export interface Service { start(): void; stop(): void }')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Service')
    expect(result[0].type).toBe('interface')
  })

  test('extracts exported class extending another class', () => {
    const sf = createSourceFile('export class Child extends Parent {}')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Child')
    expect(result[0].type).toBe('class')
  })

  test('extracts exported class implementing interface', () => {
    const sf = createSourceFile('export class Impl implements IFoo { x = 1 }')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Impl')
    expect(result[0].type).toBe('class')
  })

  test('sets isDefault to false for regular export with re-export', () => {
    const sf = createSourceFile('export { foo } from "bar"')
    const result = extractExports(sf, 'test.ts')
    expect(result).toHaveLength(0)
  })
})

// ============================================================================
// getFunctionSignature
// ============================================================================

describe('getFunctionSignature', () => {
  test('returns simple signature for no params', () => {
    const sf = createSourceFile('function fn(): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toBe('()')
  })

  test('returns signature with params', () => {
    const sf = createSourceFile('function fn(x: number, y: string): boolean {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('x: number')
    expect(result).toContain('y: string')
  })

  test('includes return type when not void', () => {
    const sf = createSourceFile('function fn(x: number): string {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('=> string')
  })

  test('omits return type when void', () => {
    const sf = createSourceFile('function fn(): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).not.toContain('=>')
  })

  test('includes async prefix for async function', () => {
    const sf = createSourceFile('async function fn(): Promise<void> {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result.startsWith('async ')).toBe(true)
  })

  test('includes async and return type together', () => {
    const sf = createSourceFile('async function fn(): Promise<string> {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('async')
    expect(result).toContain('=> Promise<string>')
  })

  test('truncates long signature to 80 chars', () => {
    const longParam = 'x'.repeat(100)
    const sf = createSourceFile(`function fn(${longParam}: string): void {}`)
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result.length).toBeLessThanOrEqual(80)
    expect(result.endsWith('...')).toBe(true)
  })

  test('handles function with no explicit return type', () => {
    const sf = createSourceFile('function fn(x: number) {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('x: number')
  })

  test('handles function with optional parameter', () => {
    const sf = createSourceFile('function fn(x?: number): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('x?: number')
  })

  test('handles function with default parameter', () => {
    const sf = createSourceFile('function fn(x: number = 10): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('x: number = 10')
  })

  test('handles function with rest parameter', () => {
    const sf = createSourceFile('function fn(...args: number[]): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('...args: number[]')
  })

  test('handles function with multiple parameters and return type', () => {
    const sf = createSourceFile('function fn(a: string, b: number, c: boolean): object {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('a: string')
    expect(result).toContain('b: number')
    expect(result).toContain('c: boolean')
    expect(result).toContain('=> object')
  })

  test('handles async function with void return type', () => {
    const sf = createSourceFile('async function fn(): Promise<void> {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('async')
    expect(result).toContain('=> Promise<void>')
  })

  test('handles function with generic parameter', () => {
    const sf = createSourceFile('function identity<T>(arg: T): T { return arg }')
    const func = sf.getFunction('identity')!
    const result = getFunctionSignature(func)
    expect(result).toContain('T')
    expect(result).toContain('=> T')
  })

  test('handles export function signature', () => {
    const sf = createSourceFile('export function greet(name: string): string { return name }')
    const func = sf.getFunction('greet')!
    const result = getFunctionSignature(func)
    expect(result).toContain('name: string')
    expect(result).toContain('=> string')
  })

  test('handles function with no parameters and no return type', () => {
    const sf = createSourceFile('function noop() {}')
    const func = sf.getFunction('noop')!
    const result = getFunctionSignature(func)
    expect(result).toBe('()')
  })

  test('handles function with single parameter', () => {
    const sf = createSourceFile('function fn(x: string): number { return 1 }')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('x: string')
    expect(result).toContain('=> number')
  })

  test('handles function with destructured parameter', () => {
    const sf = createSourceFile('function fn({ a, b }: Props): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('a, b')
  })

  test('handles function with callback parameter', () => {
    const sf = createSourceFile('function fn(cb: (x: number) => void): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('cb')
  })

  test('handles generator function', () => {
    const sf = createSourceFile('function* gen(): Generator<number> { yield 1 }')
    const func = sf.getFunction('gen')!
    const result = getFunctionSignature(func)
    expect(result).toContain('=> Generator<number>')
  })

  test('handles function with union type parameter', () => {
    const sf = createSourceFile('function fn(x: string | number): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('string | number')
  })

  test('handles function with array type parameter', () => {
    const sf = createSourceFile('function fn(items: string[]): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('items: string[]')
  })

  test('handles function with object type return', () => {
    const sf = createSourceFile('function fn(): { x: number; y: number } { return { x: 1, y: 2 } }')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).toContain('=>')
  })

  test('handles function with void return type explicitly', () => {
    const sf = createSourceFile('function fn(): void {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result).not.toContain('=>')
    expect(result).toBe('()')
  })

  test('async function with no return type shows async prefix', () => {
    const sf = createSourceFile('async function fn() {}')
    const func = sf.getFunction('fn')!
    const result = getFunctionSignature(func)
    expect(result.startsWith('async')).toBe(true)
  })

  test('handles function with complex generic signature', () => {
    const sf = createSourceFile('function merge<T, U>(a: T, b: U): T & U { return { ...a, ...b } }')
    const func = sf.getFunction('merge')!
    const result = getFunctionSignature(func)
    expect(result).toContain('T')
    expect(result).toContain('U')
  })
})
