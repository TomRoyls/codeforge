import { describe, expect, it, vi } from 'vitest'

import {
  aggregateStats,
  buildStatsResult,
  countLines,
  processFileStats,
  sortFileStats,
} from '../../src/commands/stats-helpers.js'

import type { FileStats, ProcessedFileResult } from '../../src/commands/stats-helpers.js'

const EMPTY_STRUCTURES = {
  classes: 0,
  enums: 0,
  functions: 0,
  interfaces: 0,
  methods: 0,
  typeAliases: 0,
} as const

// ─── countLines ───

describe('countLines', () => {
  it('handles empty string', () => {
    const result = countLines('')
    expect(result.loc).toBe(0)
    expect(result.blank).toBe(1)
    expect(result.comments).toBe(0)
  })

  it('counts only blank lines', () => {
    const result = countLines('\n\n\n')
    expect(result.blank).toBe(4)
    expect(result.loc).toBe(0)
    expect(result.comments).toBe(0)
  })

  it('counts whitespace-only lines as blank', () => {
    const result = countLines('   \n\t\n')
    expect(result.blank).toBe(3)
    expect(result.loc).toBe(0)
    expect(result.comments).toBe(0)
  })

  it('counts // comment lines', () => {
    const result = countLines('// comment\nconst x = 1')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
    expect(result.blank).toBe(0)
  })

  it('counts /* block-comment-start lines', () => {
    const result = countLines('/* block */\nconst x = 1')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
  })

  it('counts lines of code', () => {
    const result = countLines('const x = 1\nconst y = 2')
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(0)
    expect(result.comments).toBe(0)
  })

  it('handles mixed content', () => {
    const result = countLines('const x = 1\n\n// comment\nconst y = 2')
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(1)
    expect(result.comments).toBe(1)
  })

  it('handles single line of code', () => {
    const result = countLines('const x = 1')
    expect(result.loc).toBe(1)
    expect(result.blank).toBe(0)
    expect(result.comments).toBe(0)
  })

  it('handles trailing newline', () => {
    const result = countLines('const x = 1\n')
    expect(result.loc).toBe(1)
    expect(result.blank).toBe(1)
  })

  it('handles indented // comment as comment line', () => {
    const result = countLines('  // indented comment')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(0)
  })

  it('handles indented /* comment as comment line', () => {
    const result = countLines('\t/* block start')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(0)
  })
})

// ─── processFileStats ───

describe('processFileStats', () => {
  const tsExtensions = new Set(['.ts', '.tsx'])

  it('processes non-TS file without parser', async () => {
    const file = { absolutePath: '/app/style.css', path: 'style.css' }
    const content = '.foo { color: red; }\n\n/* comment */'
    const result = await processFileStats(file, content, null, tsExtensions)

    expect(result.blank).toBe(1)
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
    expect(result.ext).toBe('.css')
    expect(result.complexity).toBe(1)
    expect(result.structures).toEqual(EMPTY_STRUCTURES)
    expect(result.size).toBe(content.length)
    expect(result.file).toBe(file)
  })

  it('processes TS file with parser and falls back on invalid sourceFile', async () => {
    const mockSourceFile = {} as never
    const parser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: mockSourceFile }),
      releaseFile: vi.fn(),
    }

    const file = { absolutePath: '/app/index.ts', path: 'index.ts' }
    const content = 'const x = 1'
    const result = await processFileStats(file, content, parser, tsExtensions)

    expect(parser.parseFile).toHaveBeenCalledWith('/app/index.ts')
    expect(result.complexity).toBe(1)
    expect(result.structures).toEqual(EMPTY_STRUCTURES)
    expect(result.ext).toBe('.ts')
    expect(result.loc).toBe(1)
    expect(result.file).toBe(file)
    expect(result.size).toBe(content.length)
  })

  it('falls back to defaults when parser throws', async () => {
    const parser = {
      parseFile: vi.fn().mockRejectedValue(new Error('parse error')),
      releaseFile: vi.fn(),
    }

    const file = { absolutePath: '/app/broken.ts', path: 'broken.ts' }
    const content = 'const x = 1'
    const result = await processFileStats(file, content, parser, tsExtensions)

    expect(parser.parseFile).toHaveBeenCalledWith('/app/broken.ts')
    expect(result.complexity).toBe(1)
    expect(result.structures).toEqual(EMPTY_STRUCTURES)
    expect(result.loc).toBe(1)
  })

  it('skips parsing when parser is null', async () => {
    const file = { absolutePath: '/app/index.ts', path: 'index.ts' }
    const content = 'const x = 1'
    const result = await processFileStats(file, content, null, tsExtensions)

    expect(result.complexity).toBe(1)
    expect(result.structures).toEqual(EMPTY_STRUCTURES)
  })

  it('skips parsing when extension is not in tsExtensions', async () => {
    const parser = {
      parseFile: vi.fn(),
      releaseFile: vi.fn(),
    }

    const file = { absolutePath: '/app/readme.md', path: 'readme.md' }
    const content = '# Hello'
    const result = await processFileStats(file, content, parser, tsExtensions)

    expect(parser.parseFile).not.toHaveBeenCalled()
    expect(result.complexity).toBe(1)
    expect(result.ext).toBe('.md')
  })

  it('computes size from content length', async () => {
    const file = { absolutePath: '/app/test.js', path: 'test.js' }
    const content = 'const x = 1'
    const result = await processFileStats(file, content, null, tsExtensions)

    expect(result.size).toBe(11)
  })
})

// ─── aggregateStats ───

describe('aggregateStats', () => {
  const structures = { classes: 1, enums: 0, functions: 2, interfaces: 0, methods: 1, typeAliases: 0 }

  const makeResult = (overrides: Partial<ProcessedFileResult> = {}): ProcessedFileResult => ({
    blank: 5,
    comments: 2,
    complexity: 3,
    ext: '.ts',
    file: { absolutePath: '/a.ts', path: 'a.ts' },
    loc: 100,
    size: 500,
    structures,
    ...overrides,
  })

  it('returns zeros for empty array', () => {
    const result = aggregateStats([], false)
    expect(result.totalLoc).toBe(0)
    expect(result.totalBlank).toBe(0)
    expect(result.totalComments).toBe(0)
    expect(result.totalComplexity).toBe(0)
    expect(result.fileStats).toHaveLength(0)
    expect(result.fileTypes).toEqual({})
    expect(result.totalStructures).toEqual(EMPTY_STRUCTURES)
  })

  it('aggregates a single result', () => {
    const result = aggregateStats([makeResult()], false)
    expect(result.totalLoc).toBe(100)
    expect(result.totalBlank).toBe(5)
    expect(result.totalComments).toBe(2)
    expect(result.totalComplexity).toBe(3)
    expect(result.fileTypes['.ts']).toBe(1)
    expect(result.totalStructures.classes).toBe(1)
    expect(result.totalStructures.functions).toBe(2)
    expect(result.totalStructures.methods).toBe(1)
  })

  it('aggregates multiple results with correct totals', () => {
    const results: (ProcessedFileResult | null)[] = [
      makeResult({ blank: 5, comments: 2, complexity: 3, ext: '.ts', loc: 100, structures }),
      makeResult({ blank: 3, comments: 1, complexity: 2, ext: '.ts', loc: 50, file: { absolutePath: '/b.ts', path: 'b.ts' }, structures }),
    ]
    const result = aggregateStats(results, false)
    expect(result.totalLoc).toBe(150)
    expect(result.totalBlank).toBe(8)
    expect(result.totalComments).toBe(3)
    expect(result.totalComplexity).toBe(5)
    expect(result.fileTypes['.ts']).toBe(2)
    expect(result.totalStructures.classes).toBe(2)
    expect(result.totalStructures.functions).toBe(4)
    expect(result.totalStructures.methods).toBe(2)
  })

  it('skips null entries', () => {
    const results: (ProcessedFileResult | null)[] = [
      null,
      makeResult({ loc: 42 }),
      null,
    ]
    const result = aggregateStats(results, false)
    expect(result.totalLoc).toBe(42)
    expect(result.totalComplexity).toBe(3)
  })

  it('tracks multiple file types', () => {
    const results: (ProcessedFileResult | null)[] = [
      makeResult({ ext: '.ts' }),
      makeResult({ ext: '.ts' }),
      makeResult({ ext: '.js', file: { absolutePath: '/c.js', path: 'c.js' } }),
    ]
    const result = aggregateStats(results, false)
    expect(result.fileTypes['.ts']).toBe(2)
    expect(result.fileTypes['.js']).toBe(1)
  })

  it('includes fileStats when verbose is true', () => {
    const results: (ProcessedFileResult | null)[] = [makeResult()]
    const result = aggregateStats(results, true)
    expect(result.fileStats).toHaveLength(1)
    expect(result.fileStats[0]!.name).toBe('a.ts')
    expect(result.fileStats[0]!.loc).toBe(100)
    expect(result.fileStats[0]!.complexity).toBe(3)
    expect(result.fileStats[0]!.type).toBe('.ts')
  })

  it('excludes fileStats when verbose is false', () => {
    const results: (ProcessedFileResult | null)[] = [makeResult()]
    const result = aggregateStats(results, false)
    expect(result.fileStats).toHaveLength(0)
  })

  it('uses "unknown" type for empty extension in verbose mode', () => {
    const results: (ProcessedFileResult | null)[] = [
      makeResult({ ext: '', file: { absolutePath: '/Makefile', path: 'Makefile' } }),
    ]
    const result = aggregateStats(results, true)
    expect(result.fileStats[0]!.type).toBe('unknown')
  })

  it('sums all structure fields correctly', () => {
    const structuresA = { classes: 2, enums: 1, functions: 3, interfaces: 4, methods: 5, typeAliases: 6 }
    const structuresB = { classes: 1, enums: 2, functions: 1, interfaces: 2, methods: 3, typeAliases: 4 }
    const results: (ProcessedFileResult | null)[] = [
      makeResult({ structures: structuresA }),
      makeResult({ structures: structuresB, file: { absolutePath: '/b.ts', path: 'b.ts' } }),
    ]
    const result = aggregateStats(results, false)
    expect(result.totalStructures).toEqual({
      classes: 3,
      enums: 3,
      functions: 4,
      interfaces: 6,
      methods: 8,
      typeAliases: 10,
    })
  })
})

// ─── sortFileStats ───

describe('sortFileStats', () => {
  const makeStat = (overrides: Partial<FileStats> = {}): FileStats => ({
    blankLines: 0,
    commentLines: 0,
    complexity: 5,
    loc: 100,
    name: 'a.ts',
    size: 500,
    structures: { ...EMPTY_STRUCTURES },
    type: '.ts',
    ...overrides,
  })

  const stats: FileStats[] = [
    makeStat({ complexity: 5, loc: 100, name: 'b.ts', size: 500 }),
    makeStat({ complexity: 10, loc: 50, name: 'c.ts', size: 200 }),
    makeStat({ complexity: 1, loc: 200, name: 'a.ts', size: 800 }),
  ]

  it('sorts by complexity descending', () => {
    const sorted = sortFileStats(stats, 'complexity')
    expect(sorted[0]!.complexity).toBe(10)
    expect(sorted[1]!.complexity).toBe(5)
    expect(sorted[2]!.complexity).toBe(1)
  })

  it('sorts by loc descending', () => {
    const sorted = sortFileStats(stats, 'loc')
    expect(sorted[0]!.loc).toBe(200)
    expect(sorted[1]!.loc).toBe(100)
    expect(sorted[2]!.loc).toBe(50)
  })

  it('sorts by name alphabetically', () => {
    const sorted = sortFileStats(stats, 'name')
    expect(sorted[0]!.name).toBe('a.ts')
    expect(sorted[1]!.name).toBe('b.ts')
    expect(sorted[2]!.name).toBe('c.ts')
  })

  it('sorts by size descending as default', () => {
    const sorted = sortFileStats(stats, 'size')
    expect(sorted[0]!.size).toBe(800)
    expect(sorted[1]!.size).toBe(500)
    expect(sorted[2]!.size).toBe(200)
  })

  it('defaults to size sort for unknown sortBy value', () => {
    const sorted = sortFileStats(stats, 'unknown-key')
    expect(sorted[0]!.size).toBe(800)
    expect(sorted[2]!.size).toBe(200)
  })

  it('does not mutate original array', () => {
    const original = stats.map((s) => ({ ...s }))
    sortFileStats(stats, 'complexity')
    expect(stats).toEqual(original)
  })

  it('handles empty array', () => {
    const sorted = sortFileStats([], 'complexity')
    expect(sorted).toEqual([])
  })

  it('handles single element', () => {
    const single = [makeStat()]
    const sorted = sortFileStats(single, 'complexity')
    expect(sorted).toHaveLength(1)
    expect(sorted[0]!.name).toBe('a.ts')
  })
})

// ─── buildStatsResult ───

describe('buildStatsResult', () => {
  const makeFileStat = (name: string): FileStats => ({
    blankLines: 0,
    commentLines: 0,
    complexity: 1,
    loc: 10,
    name,
    size: 100,
    structures: { ...EMPTY_STRUCTURES },
    type: '.ts',
  })

  const makeAggregated = (overrides: Record<string, unknown> = {}) => ({
    fileStats: [] as FileStats[],
    fileTypes: { '.ts': 2 },
    totalBlank: 10,
    totalComments: 5,
    totalComplexity: 6,
    totalLoc: 200,
    totalStructures: { classes: 2, enums: 1, functions: 5, interfaces: 3, methods: 4, typeAliases: 1 },
    ...overrides,
  })

  it('builds result with correct averages', () => {
    const result = buildStatsResult(2, [], makeAggregated())
    expect(result.summary.averageComplexity).toBe(3)
    expect(result.summary.averageLoc).toBe(100)
    expect(result.summary.files).toBe(2)
  })

  it('maps all aggregate fields to summary', () => {
    const aggregated = makeAggregated()
    const result = buildStatsResult(2, [], aggregated)
    expect(result.summary.blankLines).toBe(10)
    expect(result.summary.commentLines).toBe(5)
    expect(result.summary.complexity).toBe(6)
    expect(result.summary.loc).toBe(200)
    expect(result.summary.classes).toBe(2)
    expect(result.summary.enums).toBe(1)
    expect(result.summary.functions).toBe(5)
    expect(result.summary.interfaces).toBe(3)
    expect(result.summary.methods).toBe(4)
    expect(result.summary.typeAliases).toBe(1)
  })

  it('preserves fileTypes from aggregated', () => {
    const result = buildStatsResult(2, [], makeAggregated())
    expect(result.fileTypes).toEqual({ '.ts': 2 })
  })

  it('handles zero files with zero averages', () => {
    const aggregated = makeAggregated({
      fileTypes: {},
      totalBlank: 0,
      totalComments: 0,
      totalComplexity: 0,
      totalLoc: 0,
      totalStructures: { ...EMPTY_STRUCTURES },
    })
    const result = buildStatsResult(0, [], aggregated)
    expect(result.summary.averageComplexity).toBe(0)
    expect(result.summary.averageLoc).toBe(0)
    expect(result.summary.files).toBe(0)
  })

  it('rounds averages using Math.round', () => {
    const aggregated = makeAggregated({ totalComplexity: 7, totalLoc: 101 })
    const result = buildStatsResult(3, [], aggregated)
    expect(result.summary.averageComplexity).toBe(2)
    expect(result.summary.averageLoc).toBe(34)
  })

  it('limits files to MAX_TOP_STATS_FILES (10)', () => {
    const manyStats = Array.from({ length: 20 }, (_, i) => makeFileStat(`file-${i}.ts`))
    const aggregated = makeAggregated({ fileStats: manyStats })
    const result = buildStatsResult(20, manyStats, aggregated)
    expect(result.files).toHaveLength(10)
    expect(result.files[0]!.name).toBe('file-0.ts')
  })

  it('returns all files when count is under limit', () => {
    const fewStats = Array.from({ length: 5 }, (_, i) => makeFileStat(`file-${i}.ts`))
    const aggregated = makeAggregated({ fileStats: fewStats })
    const result = buildStatsResult(5, fewStats, aggregated)
    expect(result.files).toHaveLength(5)
  })
})
