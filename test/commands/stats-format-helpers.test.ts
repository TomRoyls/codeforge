import { describe, expect, it } from 'vitest'

import type { StatsResult } from '../../src/commands/stats-helpers.js'

import { formatCsv, formatOutput, formatTable } from '../../src/commands/stats-format-helpers.js'

// ─── Helpers ───

function makeStats(overrides: Partial<StatsResult> = {}): StatsResult {
  return {
    fileTypes: { '.ts': 10, '.tsx': 2 },
    files: [
      { complexity: 5, loc: 100, name: 'a.ts', size: 2000, type: 'ts' },
      { complexity: 3, loc: 50, name: 'b.ts', size: 1000, type: 'ts' },
    ],
    summary: {
      blankLines: 200,
      classes: 10,
      commentLines: 100,
      complexity: 50,
      enums: 2,
      files: 12,
      functions: 30,
      interfaces: 5,
      loc: 1000,
      methods: 15,
      typeAliases: 8,
    },
    ...overrides,
  }
}

// ─── formatCsv ───

describe('formatCsv', () => {
  it('includes headers', () => {
    const csv = formatCsv(makeStats())
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toContain('File')
    expect(firstLine).toContain('LOC')
    expect(firstLine).toContain('Complexity')
  })

  it('includes file data rows', () => {
    const csv = formatCsv(makeStats())
    const lines = csv.split('\n')
    expect(lines.length).toBe(3)
    expect(lines[1]).toContain('a.ts')
    expect(lines[2]).toContain('b.ts')
  })

  it('handles empty files array', () => {
    const csv = formatCsv(makeStats({ files: [] }))
    const lines = csv.split('\n')
    expect(lines.length).toBe(1)
  })
})

// ─── formatTable ───

describe('formatTable', () => {
  it('includes summary statistics', () => {
    const output = formatTable(makeStats(), 5)
    expect(output).toContain('1000')
    expect(output).toContain('12')
  })

  it('includes file type breakdown', () => {
    const output = formatTable(makeStats(), 5)
    expect(output).toContain('.ts')
    expect(output).toContain('.tsx')
  })

  it('shows top N largest files', () => {
    const output = formatTable(makeStats(), 1)
    expect(output).toContain('a.ts')
  })

  it('shows code structures', () => {
    const output = formatTable(makeStats(), 5)
    expect(output).toContain('Classes')
    expect(output).toContain('Functions')
    expect(output).toContain('Interfaces')
  })
})

// ─── formatOutput ───

describe('formatOutput', () => {
  it('returns CSV when format is csv', () => {
    const result = formatOutput(makeStats(), 'csv', 5)
    expect(result.split('\n')[0]).toContain(',')
  })

  it('returns table by default', () => {
    const result = formatOutput(makeStats(), 'table', 5)
    expect(result).toContain('Statistics')
  })
})
