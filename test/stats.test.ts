import { describe, it, expect } from 'vitest'

import Stats from '../src/commands/stats.js'
import {
  aggregateStats,
  buildStatsResult,
  countLines,
  sortFileStats,
  type FileStats,
  type ProcessedFileResult,
} from '../src/commands/stats-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Stats command - static metadata', () => {
  it('has a description', () => {
    expect(Stats.description).toBe('Display codebase statistics and metrics')
  })

  it('has examples array', () => {
    expect(Array.isArray(Stats.examples)).toBe(true)
    expect(Stats.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg with default "."', () => {
    expect(Stats.args.path).toBeDefined()
    expect(Stats.args.path.default).toBe('.')
  })
})

// ─── Flags ───────────────────────────────────────────────
describe('Stats command - flags', () => {
  it('has format flag with options', () => {
    expect(Stats.flags.format.options).toContain('json')
    expect(Stats.flags.format.options).toContain('table')
    expect(Stats.flags.format.options).toContain('csv')
  })

  it('has sort-by flag with options', () => {
    expect(Stats.flags['sort-by'].options).toContain('complexity')
    expect(Stats.flags['sort-by'].options).toContain('loc')
    expect(Stats.flags['sort-by'].options).toContain('name')
    expect(Stats.flags['sort-by'].options).toContain('size')
  })

  it('defaults sort-by to size', () => {
    expect(Stats.flags['sort-by'].default).toBe('size')
  })

  it('defaults top to 10', () => {
    expect(Stats.flags.top.default).toBe(10)
  })

  it('defaults format to table', () => {
    expect(Stats.flags.format.default).toBe('table')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Stats command - class structure', () => {
  it('exports a default class', () => {
    expect(Stats).toBeDefined()
    expect(typeof Stats).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Stats.prototype.run).toBe('function')
  })

  it('has static isLogicalOperator method', () => {
    expect(typeof Stats.isLogicalOperator).toBe('function')
  })
})

// ─── countLines helper ───────────────────────────────────
describe('Stats command - countLines helper', () => {
  it('counts code lines only', () => {
    const result = countLines('const a = 1\nconst b = 2')
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(0)
    expect(result.comments).toBe(0)
  })

  it('counts blank lines', () => {
    const result = countLines('const a = 1\n\nconst b = 2')
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(1)
  })

  it('counts single-line comments', () => {
    const result = countLines('const a = 1\n// comment\nconst b = 2')
    expect(result.loc).toBe(2)
    expect(result.comments).toBe(1)
  })

  it('counts block comment starts', () => {
    const result = countLines('/* block comment */\nconst a = 1')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
  })

  it('handles empty string', () => {
    const result = countLines('')
    expect(result.loc).toBe(0)
    expect(result.blank).toBe(1)
  })
})

// ─── sortFileStats helper ────────────────────────────────
describe('Stats command - sortFileStats helper', () => {
  const files: FileStats[] = [
    { blankLines: 0, commentLines: 0, complexity: 5, loc: 10, name: 'b.ts', size: 100, structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 }, type: '.ts' },
    { blankLines: 0, commentLines: 0, complexity: 10, loc: 50, name: 'a.ts', size: 200, structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 }, type: '.ts' },
  ]

  it('sorts by size descending by default', () => {
    const sorted = sortFileStats(files, 'size')
    expect(sorted[0].name).toBe('a.ts')
    expect(sorted[1].name).toBe('b.ts')
  })

  it('sorts by complexity descending', () => {
    const sorted = sortFileStats(files, 'complexity')
    expect(sorted[0].name).toBe('a.ts')
  })

  it('sorts by loc descending', () => {
    const sorted = sortFileStats(files, 'loc')
    expect(sorted[0].loc).toBe(50)
  })

  it('sorts by name ascending', () => {
    const sorted = sortFileStats(files, 'name')
    expect(sorted[0].name).toBe('a.ts')
    expect(sorted[1].name).toBe('b.ts')
  })
})

// ─── aggregateStats helper ───────────────────────────────
describe('Stats command - aggregateStats helper', () => {
  it('skips null results', () => {
    const result = aggregateStats([null, null], true)
    expect(result.fileStats).toHaveLength(0)
    expect(result.totalLoc).toBe(0)
  })

  it('aggregates file results', () => {
    const input: ProcessedFileResult = {
      blank: 2,
      comments: 1,
      complexity: 3,
      ext: '.ts',
      file: { absolutePath: '/a.ts', path: 'a.ts' },
      loc: 10,
      size: 50,
      structures: { classes: 1, enums: 0, functions: 2, interfaces: 0, methods: 0, typeAliases: 0 },
    }
    const result = aggregateStats([input], true)
    expect(result.totalLoc).toBe(10)
    expect(result.totalBlank).toBe(2)
    expect(result.totalComments).toBe(1)
    expect(result.totalComplexity).toBe(3)
    expect(result.totalStructures.classes).toBe(1)
    expect(result.totalStructures.functions).toBe(2)
    expect(result.fileTypes['.ts']).toBe(1)
  })

  it('includes fileStats only in verbose mode', () => {
    const input: ProcessedFileResult = {
      blank: 0, comments: 0, complexity: 1, ext: '.ts',
      file: { absolutePath: '/a.ts', path: 'a.ts' }, loc: 5, size: 10,
      structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
    }
    const verbose = aggregateStats([input], true)
    const nonVerbose = aggregateStats([input], false)
    expect(verbose.fileStats).toHaveLength(1)
    expect(nonVerbose.fileStats).toHaveLength(0)
  })
})

// ─── buildStatsResult helper ─────────────────────────────
describe('Stats command - buildStatsResult helper', () => {
  it('builds result with correct summary', () => {
    const aggregated = {
      fileStats: [],
      fileTypes: { '.ts': 2 } as Record<string, number>,
      totalBlank: 5,
      totalComments: 3,
      totalComplexity: 10,
      totalLoc: 100,
      totalStructures: { classes: 2, enums: 0, functions: 5, interfaces: 1, methods: 0, typeAliases: 0 },
    }
    const result = buildStatsResult(2, [], aggregated)
    expect(result.summary.files).toBe(2)
    expect(result.summary.loc).toBe(100)
    expect(result.summary.blankLines).toBe(5)
    expect(result.summary.commentLines).toBe(3)
    expect(result.summary.complexity).toBe(10)
    expect(result.summary.averageLoc).toBe(50)
    expect(result.summary.averageComplexity).toBe(5)
  })

  it('handles zero files without division by zero', () => {
    const aggregated = {
      fileStats: [],
      fileTypes: {},
      totalBlank: 0,
      totalComments: 0,
      totalComplexity: 0,
      totalLoc: 0,
      totalStructures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
    }
    const result = buildStatsResult(0, [], aggregated)
    expect(result.summary.averageLoc).toBe(0)
    expect(result.summary.averageComplexity).toBe(0)
  })
})
