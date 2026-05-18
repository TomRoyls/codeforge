import { describe, expect, it } from 'vitest'

import {
  getTypeColor,
  formatJson,
  formatMarkdown,
  formatOutput,
  type ExportInfo,
  type FormatOptions,
} from '../../src/commands/exports-format-helpers.js'

// ─── Helpers ───

function makeExport(overrides: Partial<ExportInfo> = {}): ExportInfo {
  return {
    file: 'test.ts',
    isDefault: false,
    line: 1,
    name: 'myFunc',
    signature: '() => void',
    type: 'function',
    usageCount: 1,
    ...overrides,
  }
}

function makeOptions(overrides: Partial<FormatOptions> = {}): FormatOptions {
  return {
    format: 'console',
    showUnused: false,
    totalFiles: 1,
    typeSummary: { class: 0, const: 0, function: 1, interface: 0, type: 0 },
    unusedExports: [],
    ...overrides,
  }
}

// ─── getTypeColor ───

describe('getTypeColor', () => {
  it('returns a function for known types', () => {
    expect(typeof getTypeColor('function')).toBe('function')
    expect(typeof getTypeColor('class')).toBe('function')
    expect(typeof getTypeColor('interface')).toBe('function')
    expect(typeof getTypeColor('type')).toBe('function')
    expect(typeof getTypeColor('const')).toBe('function')
  })

  it('returns a function for unknown types', () => {
    expect(typeof getTypeColor('unknown')).toBe('function')
  })

  it('colors text for each type', () => {
    for (const type of ['function', 'class', 'interface', 'type', 'const']) {
      const result = getTypeColor(type)('test')
      expect(result).toContain('test')
    }
  })
})

// ─── formatJson ───

describe('formatJson', () => {
  it('produces valid JSON', () => {
    const exports = [makeExport()]
    const options = makeOptions()
    const result = formatJson(exports, options)
    const parsed = JSON.parse(result)
    expect(parsed.exports).toHaveLength(1)
    expect(parsed.summary.total).toBe(1)
  })

  it('includes type summary', () => {
    const result = formatJson([], makeOptions())
    const parsed = JSON.parse(result)
    expect(parsed.summary.exportTypes).toBeDefined()
  })

  it('includes unused exports count', () => {
    const result = formatJson([], makeOptions())
    const parsed = JSON.parse(result)
    expect(parsed.summary.unused).toBe(0)
  })
})

// ─── formatMarkdown ───

describe('formatMarkdown', () => {
  it('includes headers', () => {
    const result = formatMarkdown([makeExport()], makeOptions())
    expect(result).toContain('# Export Analysis')
    expect(result).toContain('## Summary')
  })

  it('includes export details', () => {
    const result = formatMarkdown([makeExport({ name: 'hello' })], makeOptions())
    expect(result).toContain('hello')
    expect(result).toContain('function')
  })

  it('shows unused warning when usage is 0', () => {
    const result = formatMarkdown([makeExport({ usageCount: 0 })], makeOptions())
    expect(result).toContain('Unused')
  })

  it('shows unused exports section when showUnused is true', () => {
    const options = makeOptions({
      showUnused: true,
      unusedExports: [makeExport({ name: 'unused1' })],
    })
    const result = formatMarkdown([], options)
    expect(result).toContain('Unused Exports')
    expect(result).toContain('unused1')
  })
})

// ─── formatOutput ───

describe('formatOutput', () => {
  it('returns JSON when format is json', () => {
    const result = formatOutput([], makeOptions({ format: 'json' }))
    const parsed = JSON.parse(result)
    expect(parsed).toBeDefined()
  })

  it('returns markdown when format is markdown', () => {
    const result = formatOutput([], makeOptions({ format: 'markdown' }))
    expect(result).toContain('# Export Analysis')
  })

  it('returns console output by default', () => {
    const result = formatOutput([], makeOptions({ format: 'console' }))
    expect(result).toContain('Export Analysis')
  })
})
