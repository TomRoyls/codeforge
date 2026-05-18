import { describe, it, expect } from 'vitest'

import { formatCsv, formatOutput, formatTable } from '../src/commands/stats-format-helpers.js'
import type { StatsResult } from '../src/commands/stats-helpers.js'

function makeStats(overrides?: Partial<StatsResult>): StatsResult {
  return {
    files: [
      { name: 'src/index.ts', loc: 100, complexity: 5, size: 2048, type: '.ts', blankLines: 10, commentLines: 15, structures: { classes: 1, enums: 0, functions: 5, interfaces: 2, methods: 3, typeAliases: 1 } },
      { name: 'src/utils.ts', loc: 50, complexity: 2, size: 1024, type: '.ts', blankLines: 5, commentLines: 8, structures: { classes: 0, enums: 0, functions: 3, interfaces: 1, methods: 0, typeAliases: 0 } },
    ],
    fileTypes: { '.ts': 2 },
    summary: {
      averageComplexity: 3.5,
      averageLoc: 75,
      blankLines: 15,
      classes: 1,
      commentLines: 23,
      complexity: 7,
      enums: 0,
      files: 2,
      functions: 8,
      interfaces: 3,
      loc: 150,
      methods: 3,
      typeAliases: 1,
    },
    ...overrides,
  }
}

// ─── formatCsv ─────────────────────────────────────────
describe('formatCsv', () => {
  it('produces header row with correct columns', () => {
    const csv = formatCsv(makeStats())
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toBe('File,LOC,Complexity,Size (bytes),Type')
  })

  it('produces one row per file plus header', () => {
    const csv = formatCsv(makeStats())
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
  })

  it('formats file data correctly', () => {
    const csv = formatCsv(makeStats())
    const dataLine = csv.split('\n')[1]
    expect(dataLine).toBe('src/index.ts,100,5,2048,.ts')
  })

  it('handles empty files array', () => {
    const csv = formatCsv(makeStats({ files: [] }))
    const lines = csv.split('\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('File,LOC,Complexity,Size (bytes),Type')
  })

  it('handles single file', () => {
    const csv = formatCsv(makeStats({
      files: [{ name: 'a.ts', loc: 10, complexity: 1, size: 500, type: '.ts', blankLines: 2, commentLines: 3, structures: { classes: 0, enums: 0, functions: 1, interfaces: 0, methods: 0, typeAliases: 0 } }],
    }))
    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('a.ts,10,1,500,.ts')
  })
})

// ─── formatTable ───────────────────────────────────────
describe('formatTable', () => {
  it('contains summary section with totals', () => {
    const output = formatTable(makeStats(), 10)
    expect(output).toContain('Total files: 2')
    expect(output).toContain('Lines of code: 150')
  })

  it('contains code structures section', () => {
    const output = formatTable(makeStats(), 10)
    expect(output).toContain('Classes: 1')
    expect(output).toContain('Functions: 8')
    expect(output).toContain('Interfaces: 3')
    expect(output).toContain('Enums: 0')
    expect(output).toContain('Type aliases: 1')
  })

  it('contains file types section', () => {
    const output = formatTable(makeStats(), 10)
    expect(output).toContain('.ts: 2')
  })

  it('respects top parameter for largest files', () => {
    const stats = makeStats()
    const output = formatTable(stats, 1)
    expect(output).toContain('Top 1 Largest Files')
    expect(output).toContain('src/index.ts')
  })

  it('formats file details with LOC, complexity, and size', () => {
    const output = formatTable(makeStats(), 10)
    expect(output).toContain('LOC: 100')
    expect(output).toContain('Complexity: 5')
    expect(output).toContain('Size: 2048 bytes')
  })

  it('formats numbers with locale for large values', () => {
    const stats = makeStats({
      summary: {
        averageComplexity: 10,
        averageLoc: 500,
        blankLines: 1500,
        classes: 10,
        commentLines: 3000,
        complexity: 50000,
        enums: 0,
        files: 200,
        functions: 150,
        interfaces: 25,
        loc: 100000,
        methods: 80,
        typeAliases: 5,
      },
    })
    const output = formatTable(stats, 10)
    expect(output).toContain('100,000')
    expect(output).toContain('50,000')
  })
})

// ─── formatOutput ──────────────────────────────────────
describe('formatOutput', () => {
  it('returns CSV when format is csv', () => {
    const stats = makeStats()
    const result = formatOutput(stats, 'csv', 10)
    expect(result.split('\n')[0]).toBe('File,LOC,Complexity,Size (bytes),Type')
  })

  it('returns table when format is table', () => {
    const stats = makeStats()
    const result = formatOutput(stats, 'table', 10)
    expect(result).toContain('Codebase Statistics')
  })

  it('returns table for any non-csv format', () => {
    const stats = makeStats()
    const result = formatOutput(stats, 'json', 10)
    expect(result).toContain('Codebase Statistics')
  })

  it('passes top parameter to table formatter', () => {
    const stats = makeStats()
    const result = formatOutput(stats, 'table', 5)
    expect(result).toContain('Top 5 Largest Files')
  })
})
