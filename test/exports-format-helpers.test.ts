import { describe, it, expect } from 'vitest'
import {
  getTypeColor,
  formatConsole,
  formatJson,
  formatMarkdown,
  formatOutput,
} from '../src/commands/exports-format-helpers.js'
import type { ExportInfo, FormatOptions } from '../src/commands/exports-helpers.js'

function makeExport(overrides: Partial<ExportInfo> = {}): ExportInfo {
  return {
    file: 'src/index.ts',
    isDefault: false,
    isExported: true,
    line: 1,
    name: 'myFunc',
    type: 'function',
    usageCount: 5,
    ...overrides,
  }
}

function makeOptions(overrides: Partial<FormatOptions> = {}): FormatOptions {
  return {
    format: 'console',
    showUnused: false,
    totalFiles: 3,
    typeSummary: { class: 1, const: 2, function: 5, interface: 3, type: 1 },
    unusedExports: [],
    ...overrides,
  }
}

// ─── getTypeColor ──────────────────────────────────────
describe('getTypeColor', () => {
  it('returns a color function for function type', () => {
    const colorFn = getTypeColor('function')
    expect(typeof colorFn).toBe('function')
    expect(colorFn('text')).toContain('text')
  })

  it('returns a color function for class type', () => {
    const colorFn = getTypeColor('class')
    expect(typeof colorFn).toBe('function')
  })

  it('returns a color function for const type', () => {
    const colorFn = getTypeColor('const')
    expect(typeof colorFn).toBe('function')
  })

  it('returns a color function for interface type', () => {
    const colorFn = getTypeColor('interface')
    expect(typeof colorFn).toBe('function')
  })

  it('returns a color function for type type', () => {
    const colorFn = getTypeColor('type')
    expect(typeof colorFn).toBe('function')
  })

  it('returns white for unknown type', () => {
    const colorFn = getTypeColor('unknown')
    expect(typeof colorFn).toBe('function')
    expect(colorFn('hello')).toBe('hello')
  })
})

// ─── formatConsole ─────────────────────────────────────
describe('formatConsole', () => {
  it('includes export analysis header', () => {
    const output = formatConsole([], makeOptions())
    expect(output).toContain('Export Analysis')
  })

  it('shows total exports count', () => {
    const output = formatConsole([makeExport()], makeOptions())
    expect(output).toContain('Total exports: 1')
  })

  it('shows files analyzed', () => {
    const output = formatConsole([], makeOptions({ totalFiles: 5 }))
    expect(output).toContain('Files analyzed: 5')
  })

  it('shows type summary', () => {
    const output = formatConsole([], makeOptions())
    expect(output).toContain('Functions:')
    expect(output).toContain('Classes:')
    expect(output).toContain('Interfaces:')
    expect(output).toContain('Types:')
    expect(output).toContain('Constants:')
  })

  it('shows export details when exports exist', () => {
    const exp = makeExport({ name: 'myFunc', type: 'function', file: 'src/test.ts', line: 10 })
    const output = formatConsole([exp], makeOptions())
    expect(output).toContain('myFunc')
    expect(output).toContain('src/test.ts')
    expect(output).toContain('10')
  })

  it('shows (default) marker for default exports', () => {
    const exp = makeExport({ isDefault: true })
    const output = formatConsole([exp], makeOptions())
    expect(output).toContain('(default)')
  })

  it('shows warning marker for unused exports', () => {
    const exp = makeExport({ usageCount: 0 })
    const output = formatConsole([exp], makeOptions())
    expect(output).toContain('⚠️')
  })

  it('shows signature when available', () => {
    const exp = makeExport({ signature: '(a: string) => void' })
    const output = formatConsole([exp], makeOptions())
    expect(output).toContain('Signature')
    expect(output).toContain('(a: string) => void')
  })

  it('shows unused exports section when showUnused is true', () => {
    const unused = makeExport({ name: 'unusedFn' })
    const output = formatConsole(
      [],
      makeOptions({ showUnused: true, unusedExports: [unused] }),
    )
    expect(output).toContain('Unused Exports')
    expect(output).toContain('unusedFn')
  })

  it('hides unused section when showUnused is false', () => {
    const unused = makeExport({ name: 'unusedFn' })
    const output = formatConsole(
      [],
      makeOptions({ showUnused: false, unusedExports: [unused] }),
    )
    expect(output).not.toContain('Unused Exports')
  })

  it('handles empty exports with no exports list', () => {
    const output = formatConsole([], makeOptions())
    expect(output).not.toContain('Exports:')
  })
})

// ─── formatJson ────────────────────────────────────────
describe('formatJson', () => {
  it('produces valid JSON', () => {
    const output = formatJson([], makeOptions())
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('exports')
    expect(parsed).toHaveProperty('summary')
    expect(parsed).toHaveProperty('unusedExports')
  })

  it('includes export data', () => {
    const exp = makeExport({ name: 'testFunc' })
    const output = formatJson([exp], makeOptions())
    const parsed = JSON.parse(output)
    expect(parsed.exports).toHaveLength(1)
    expect(parsed.exports[0].name).toBe('testFunc')
  })

  it('includes summary with totals', () => {
    const output = formatJson([], makeOptions({ totalFiles: 7 }))
    const parsed = JSON.parse(output)
    expect(parsed.summary.files).toBe(7)
    expect(parsed.summary.total).toBe(0)
  })

  it('includes unused exports count', () => {
    const unused = makeExport({ name: 'old' })
    const output = formatJson([], makeOptions({ unusedExports: [unused] }))
    const parsed = JSON.parse(output)
    expect(parsed.summary.unused).toBe(1)
    expect(parsed.unusedExports).toHaveLength(1)
  })

  it('includes type summary in export', () => {
    const output = formatJson([], makeOptions())
    const parsed = JSON.parse(output)
    expect(parsed.summary.exportTypes).toEqual({
      class: 1,
      const: 2,
      function: 5,
      interface: 3,
      type: 1,
    })
  })
})

// ─── formatMarkdown ────────────────────────────────────
describe('formatMarkdown', () => {
  it('includes markdown header', () => {
    const output = formatMarkdown([], makeOptions())
    expect(output).toContain('# Export Analysis')
  })

  it('includes summary section', () => {
    const output = formatMarkdown([], makeOptions())
    expect(output).toContain('## Summary')
    expect(output).toContain('Total Exports')
    expect(output).toContain('Files Analyzed')
  })

  it('includes type section', () => {
    const output = formatMarkdown([], makeOptions())
    expect(output).toContain('## Export Types')
    expect(output).toContain('Functions')
    expect(output).toContain('Classes')
  })

  it('shows export details with markdown headers', () => {
    const exp = makeExport({ name: 'myFunc', type: 'function' })
    const output = formatMarkdown([exp], makeOptions())
    expect(output).toContain('### myFunc')
    expect(output).toContain('**Type:** function')
  })

  it('shows default marker', () => {
    const exp = makeExport({ name: 'def', isDefault: true })
    const output = formatMarkdown([exp], makeOptions())
    expect(output).toContain('### def (default)')
  })

  it('shows signature in markdown', () => {
    const exp = makeExport({ signature: '(a: number) => string' })
    const output = formatMarkdown([exp], makeOptions())
    expect(output).toContain('**Signature:**')
    expect(output).toContain('`(a: number) => string`')
  })

  it('shows unused warning status', () => {
    const exp = makeExport({ usageCount: 0 })
    const output = formatMarkdown([exp], makeOptions())
    expect(output).toContain('Potentially Unused')
  })

  it('shows used status', () => {
    const exp = makeExport({ usageCount: 5 })
    const output = formatMarkdown([exp], makeOptions())
    expect(output).toContain('✓ Used')
  })

  it('shows unused exports section', () => {
    const unused = makeExport({ name: 'oldExport' })
    const output = formatMarkdown(
      [],
      makeOptions({ showUnused: true, unusedExports: [unused] }),
    )
    expect(output).toContain('## Potentially Unused Exports')
    expect(output).toContain('### oldExport')
  })

  it('hides unused section when showUnused is false', () => {
    const unused = makeExport({ name: 'oldExport' })
    const output = formatMarkdown(
      [],
      makeOptions({ showUnused: false, unusedExports: [unused] }),
    )
    expect(output).not.toContain('Potentially Unused Exports')
  })
})

// ─── formatOutput ──────────────────────────────────────
describe('formatOutput', () => {
  it('delegates to formatJson when format is json', () => {
    const output = formatOutput([], makeOptions({ format: 'json' }))
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('exports')
  })

  it('delegates to formatMarkdown when format is markdown', () => {
    const output = formatOutput([], makeOptions({ format: 'markdown' }))
    expect(output).toContain('# Export Analysis')
  })

  it('delegates to formatConsole when format is console', () => {
    const output = formatOutput([], makeOptions({ format: 'console' }))
    expect(output).toContain('Export Analysis')
    expect(output).toContain('Summary')
  })

  it('defaults to console for unknown format', () => {
    const output = formatOutput([], makeOptions({ format: 'console' as FormatOptions['format'] }))
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })
})
