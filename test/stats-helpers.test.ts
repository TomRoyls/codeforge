import { describe, it, expect } from 'vitest'
import {
  countLines,
  aggregateStats,
  sortFileStats,
  buildStatsResult,
  type ProcessedFileResult,
  type FileStats,
} from '../src/commands/stats-helpers.js'

// ─── countLines ─────────────────────────────────────────
describe('countLines', () => {
  it('counts empty string as one blank line', () => {
    const result = countLines('')
    expect(result).toEqual({ blank: 1, comments: 0, loc: 0 })
  })

  it('counts code lines', () => {
    const result = countLines('const x = 1;\nconst y = 2;')
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(0)
    expect(result.comments).toBe(0)
  })

  it('counts blank lines', () => {
    const result = countLines('const x = 1;\n\n\nconst y = 2;')
    expect(result.blank).toBe(2)
    expect(result.loc).toBe(2)
  })

  it('counts single-line comments starting with //', () => {
    const result = countLines('// comment\nconst x = 1;')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
  })

  it('counts block comment starts /*', () => {
    const result = countLines('/* block comment */\nconst x = 1;')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
  })

  it('handles mixed content', () => {
    const content = 'const x = 1;\n\n// comment\nconst y = 2;\n/* block */\n'
    const result = countLines(content)
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(2)
    expect(result.comments).toBe(2)
  })

  it('counts whitespace-only lines as blank', () => {
    const result = countLines('const x = 1;\n   \nconst y = 2;')
    expect(result.blank).toBe(1)
    expect(result.loc).toBe(2)
  })
})

// ─── aggregateStats ─────────────────────────────────────
describe('aggregateStats', () => {
  const makeResult = (overrides: Partial<ProcessedFileResult> = {}): ProcessedFileResult => ({
    blank: 5,
    comments: 2,
    complexity: 3,
    ext: '.ts',
    file: { absolutePath: '/a.ts', path: 'a.ts' },
    loc: 20,
    size: 100,
    structures: { classes: 1, enums: 0, functions: 2, interfaces: 0, methods: 1, typeAliases: 0 },
    ...overrides,
  })

  it('skips null entries', () => {
    const result = aggregateStats([null, makeResult()], true)
    expect(result.fileStats.length).toBe(1)
  })

  it('counts file types', () => {
    const result = aggregateStats([makeResult({ ext: '.ts' }), makeResult({ ext: '.js' })], false)
    expect(result.fileTypes['.ts']).toBe(1)
    expect(result.fileTypes['.js']).toBe(1)
  })

  it('aggregates totals', () => {
    const result = aggregateStats([makeResult({ loc: 10, blank: 2, comments: 1 }), makeResult({ loc: 20, blank: 3, comments: 2 })], false)
    expect(result.totalLoc).toBe(30)
    expect(result.totalBlank).toBe(5)
    expect(result.totalComments).toBe(3)
  })

  it('includes file stats only when verbose', () => {
    const verboseResult = aggregateStats([makeResult()], true)
    expect(verboseResult.fileStats.length).toBe(1)

    const nonVerboseResult = aggregateStats([makeResult()], false)
    expect(nonVerboseResult.fileStats.length).toBe(0)
  })

  it('aggregates structures', () => {
    const result = aggregateStats([
      makeResult({ structures: { classes: 1, enums: 0, functions: 2, interfaces: 0, methods: 0, typeAliases: 0 } }),
      makeResult({ structures: { classes: 2, enums: 1, functions: 0, interfaces: 1, methods: 0, typeAliases: 0 } }),
    ], false)
    expect(result.totalStructures.classes).toBe(3)
    expect(result.totalStructures.enums).toBe(1)
    expect(result.totalStructures.functions).toBe(2)
    expect(result.totalStructures.interfaces).toBe(1)
  })
})

// ─── sortFileStats ──────────────────────────────────────
describe('sortFileStats', () => {
  const stats: FileStats[] = [
    { blankLines: 0, commentLines: 0, complexity: 5, loc: 100, name: 'b.ts', size: 200, structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 }, type: '.ts' },
    { blankLines: 0, commentLines: 0, complexity: 10, loc: 200, name: 'a.ts', size: 100, structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 }, type: '.ts' },
  ]

  it('sorts by complexity descending', () => {
    const result = sortFileStats(stats, 'complexity')
    expect(result[0].complexity).toBe(10)
    expect(result[1].complexity).toBe(5)
  })

  it('sorts by loc descending', () => {
    const result = sortFileStats(stats, 'loc')
    expect(result[0].loc).toBe(200)
    expect(result[1].loc).toBe(100)
  })

  it('sorts by name ascending', () => {
    const result = sortFileStats(stats, 'name')
    expect(result[0].name).toBe('a.ts')
    expect(result[1].name).toBe('b.ts')
  })

  it('sorts by size descending by default', () => {
    const result = sortFileStats(stats, 'unknown')
    expect(result[0].size).toBe(200)
    expect(result[1].size).toBe(100)
  })

  it('does not mutate original array', () => {
    const original = [...stats]
    sortFileStats(stats, 'name')
    expect(stats[0].name).toBe(original[0].name)
  })
})

// ─── buildStatsResult ───────────────────────────────────
describe('buildStatsResult', () => {
  it('builds a complete StatsResult', () => {
    const aggregated = {
      fileStats: [],
      fileTypes: { '.ts': 3 },
      totalBlank: 10,
      totalComments: 5,
      totalComplexity: 15,
      totalLoc: 100,
      totalStructures: { classes: 2, enums: 0, functions: 5, interfaces: 1, methods: 3, typeAliases: 0 },
    }
    const result = buildStatsResult(3, [], aggregated)
    expect(result.summary.files).toBe(3)
    expect(result.summary.loc).toBe(100)
    expect(result.summary.blankLines).toBe(10)
    expect(result.summary.commentLines).toBe(5)
    expect(result.summary.complexity).toBe(15)
    expect(result.summary.averageLoc).toBe(33)
    expect(result.summary.averageComplexity).toBe(5)
    expect(result.fileTypes).toEqual({ '.ts': 3 })
  })

  it('handles zero files', () => {
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
