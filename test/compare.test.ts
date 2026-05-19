import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import Compare from '../src/commands/compare.js'
import {
  analyzeFileStats,
  buildComparisonMetrics,
  calculateSimilarity,
  type CompareResult,
  type ComparisonMetric,
  type FileStats,
} from '../src/commands/compare-helpers.js'
import {
  formatCompareJson,
  formatCompareSideBySide,
  formatCompareTable,
  formatDiffView,
} from '../src/commands/compare-format-helpers.js'

const TMP = join('/tmp', 'codeforge-compare-test')

beforeAll(() => {
  mkdirSync(TMP, { recursive: true })
})

afterAll(() => {
  rmSync(TMP, { recursive: true, force: true })
})

// ─── Helper to create temp files ─────────────────────────

function tmpFile(name: string, content: string): string {
  const p = join(TMP, name)
  writeFileSync(p, content, 'utf8')
  return p
}

// ─── Static metadata ─────────────────────────────────────

describe('Compare command - static metadata', () => {
  it('has a description', () => {
    expect(Compare.description).toBe('Compare two files and show differences')
  })

  it('has examples array', () => {
    expect(Array.isArray(Compare.examples)).toBe(true)
    expect(Compare.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has file1 arg that is required', () => {
    expect(Compare.args.file1).toBeDefined()
    expect(Compare.args.file1.required).toBe(true)
  })

  it('has file2 arg that is required', () => {
    expect(Compare.args.file2).toBeDefined()
    expect(Compare.args.file2.required).toBe(true)
  })

  it('uses <%= config.bin %> <%= command.id %> pattern in examples', () => {
    for (const example of Compare.examples as Array<{ command: string }>) {
      expect(example.command).toContain('<%= config.bin %> <%= command.id %>')
    }
  })
})

// ─── Flags ───────────────────────────────────────────────

describe('Compare command - flags', () => {
  it('has format flag with correct options', () => {
    expect(Compare.flags.format.options).toContain('json')
    expect(Compare.flags.format.options).toContain('table')
    expect(Compare.flags.format.options).toContain('side-by-side')
  })

  it('defaults format to table', () => {
    expect(Compare.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Compare.flags.output).toBeDefined()
  })

  it('has verbose flag defaulting to false', () => {
    expect(Compare.flags.verbose.default).toBe(false)
  })

  it('has diff flag defaulting to false', () => {
    expect(Compare.flags.diff.default).toBe(false)
  })

  it('format flag has char f', () => {
    expect(Compare.flags.format.char).toBe('f')
  })

  it('output flag has char o', () => {
    expect(Compare.flags.output.char).toBe('o')
  })

  it('verbose flag has char v', () => {
    expect(Compare.flags.verbose.char).toBe('v')
  })
})

// ─── Class structure ─────────────────────────────────────

describe('Compare command - class structure', () => {
  it('exports a default class', () => {
    expect(Compare).toBeDefined()
    expect(typeof Compare).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Compare.prototype.run).toBe('function')
  })
})

// ─── analyzeFileStats ────────────────────────────────────

describe('analyzeFileStats', () => {
  it('analyzes a simple TypeScript file', async () => {
    const path = tmpFile('simple.ts', `import { foo } from 'bar'\n\nexport const x = 1`)
    const stats = await analyzeFileStats(path)

    expect(stats.filePath).toBe(path)
    expect(stats.size).toBeGreaterThan(0)
    expect(stats.totalLines).toBe(3)
    expect(stats.blankLines).toBe(1)
    expect(stats.imports).toHaveLength(1)
    expect(stats.exports).toHaveLength(1)
  })

  it('counts code, blank, and comment lines', async () => {
    const path = tmpFile('lines.ts', 'const a = 1;\n\n// comment\nconst b = 2;')
    const stats = await analyzeFileStats(path)

    expect(stats.codeLines).toBe(2)
    expect(stats.blankLines).toBe(1)
    expect(stats.commentLines).toBe(1)
  })

  it('extracts import lines', async () => {
    const path = tmpFile('imports.ts', `import { A } from 'a'\nimport { B } from 'b'\nconst x = 1\n`)
    const stats = await analyzeFileStats(path)

    expect(stats.imports).toHaveLength(2)
    expect(stats.imports[0]).toContain("import { A } from 'a'")
    expect(stats.imports[1]).toContain("import { B } from 'b'")
  })

  it('extracts export lines', async () => {
    const path = tmpFile('exports.ts', `export const x = 1\nexport function foo() {}\n`)
    const stats = await analyzeFileStats(path)

    expect(stats.exports).toHaveLength(2)
    expect(stats.exports[0]).toContain('export const x = 1')
    expect(stats.exports[1]).toContain('export function foo()')
  })

  it('extracts function lines', async () => {
    const path = tmpFile('funcs.ts', 'function foo() {}\nconst bar = () => 1\n')
    const stats = await analyzeFileStats(path)

    expect(stats.functions).toHaveLength(2)
  })

  it('throws for missing file', async () => {
    await expect(analyzeFileStats('/tmp/nonexistent-file-xyz.ts')).rejects.toThrow(
      'File not found',
    )
  })

  it('handles block comments', async () => {
    const path = tmpFile('block.ts', '/* block\ncomment */\nconst x = 1;\n')
    const stats = await analyzeFileStats(path)

    expect(stats.commentLines).toBe(2)
    expect(stats.codeLines).toBe(1)
  })

  it('handles empty file', async () => {
    const path = tmpFile('empty.ts', '')
    const stats = await analyzeFileStats(path)

    expect(stats.totalLines).toBe(1)
    expect(stats.blankLines).toBe(1)
    expect(stats.codeLines).toBe(0)
    expect(stats.imports).toHaveLength(0)
    expect(stats.exports).toHaveLength(0)
    expect(stats.functions).toHaveLength(0)
  })
})

// ─── buildComparisonMetrics ──────────────────────────────

describe('buildComparisonMetrics', () => {
  function makeStats(overrides: Partial<FileStats> = {}): FileStats {
    return {
      blankLines: 1,
      codeLines: 10,
      commentLines: 2,
      exports: [],
      filePath: 'test.ts',
      functions: [],
      imports: [],
      size: 100,
      totalLines: 13,
      ...overrides,
    }
  }

  it('creates 8 metrics', () => {
    const metrics = buildComparisonMetrics(makeStats(), makeStats())
    expect(metrics).toHaveLength(8)
  })

  it('computes correct diff (positive)', () => {
    const file1 = makeStats({ size: 100 })
    const file2 = makeStats({ size: 150 })
    const metrics = buildComparisonMetrics(file1, file2)
    const sizeMetric = metrics.find((m) => m.name === 'Size (bytes)')!
    expect(sizeMetric.diff).toBe(50)
  })

  it('computes correct diff (negative)', () => {
    const file1 = makeStats({ totalLines: 20 })
    const file2 = makeStats({ totalLines: 10 })
    const metrics = buildComparisonMetrics(file1, file2)
    const linesMetric = metrics.find((m) => m.name === 'Total Lines')!
    expect(linesMetric.diff).toBe(-10)
  })

  it('computes zero diff for identical values', () => {
    const metrics = buildComparisonMetrics(makeStats(), makeStats())
    for (const metric of metrics) {
      expect(metric.diff).toBe(0)
    }
  })

  it('handles zero values', () => {
    const file1 = makeStats({ size: 0, blankLines: 0 })
    const file2 = makeStats({ size: 0, blankLines: 0 })
    const metrics = buildComparisonMetrics(file1, file2)

    const sizeMetric = metrics.find((m) => m.name === 'Size (bytes)')!
    expect(sizeMetric.diff).toBe(0)

    const blankMetric = metrics.find((m) => m.name === 'Blank Lines')!
    expect(blankMetric.diff).toBe(0)
  })

  it('counts imports/exports/functions as lengths', () => {
    const file1 = makeStats({ imports: ['a'], exports: ['b'], functions: ['c'] })
    const file2 = makeStats({ imports: ['a', 'd'], exports: [], functions: ['c', 'e', 'f'] })
    const metrics = buildComparisonMetrics(file1, file2)

    const importsMetric = metrics.find((m) => m.name === 'Imports')!
    expect(importsMetric.file1Value).toBe(1)
    expect(importsMetric.file2Value).toBe(2)
    expect(importsMetric.diff).toBe(1)

    const exportsMetric = metrics.find((m) => m.name === 'Exports')!
    expect(exportsMetric.file1Value).toBe(1)
    expect(exportsMetric.file2Value).toBe(0)
    expect(exportsMetric.diff).toBe(-1)

    const functionsMetric = metrics.find((m) => m.name === 'Functions')!
    expect(functionsMetric.file1Value).toBe(1)
    expect(functionsMetric.file2Value).toBe(3)
    expect(functionsMetric.diff).toBe(2)
  })

  it('includes all expected metric names', () => {
    const metrics = buildComparisonMetrics(makeStats(), makeStats())
    const names = metrics.map((m) => m.name)
    expect(names).toContain('Size (bytes)')
    expect(names).toContain('Total Lines')
    expect(names).toContain('Code Lines')
    expect(names).toContain('Blank Lines')
    expect(names).toContain('Comment Lines')
    expect(names).toContain('Imports')
    expect(names).toContain('Exports')
    expect(names).toContain('Functions')
  })
})

// ─── calculateSimilarity ─────────────────────────────────

describe('calculateSimilarity', () => {
  it('returns 1.0 for identical content', () => {
    const content = 'line1\nline2\nline3'
    expect(calculateSimilarity(content, content)).toBe(1.0)
  })

  it('returns 0.0 for completely different content', () => {
    const content1 = 'aaa\nbbb'
    const content2 = 'xxx\nyyy'
    expect(calculateSimilarity(content1, content2)).toBe(0.0)
  })

  it('returns correct value for partially similar content', () => {
    const content1 = 'a\nb\nc'
    const content2 = 'a\nb\nd'
    const sim = calculateSimilarity(content1, content2)
    expect(sim).toBeCloseTo(0.5, 5)
  })

  it('returns 1.0 for two empty strings', () => {
    expect(calculateSimilarity('', '')).toBe(1.0)
  })

  it('handles whitespace normalization', () => {
    const content1 = 'hello\nworld'
    const content2 = '  hello  \n  world  '
    expect(calculateSimilarity(content1, content2)).toBe(1.0)
  })

  it('handles one empty and one non-empty', () => {
    const sim = calculateSimilarity('', 'a\nb')
    expect(sim).toBe(0.0)
  })

  it('handles duplicate lines', () => {
    const content1 = 'a\na\nb'
    const content2 = 'a\nb'
    expect(calculateSimilarity(content1, content2)).toBe(1.0)
  })

  it('returns correct similarity for overlapping sets', () => {
    const content1 = 'a\nb\nc\nd'
    const content2 = 'c\nd\ne\nf'
    const sim = calculateSimilarity(content1, content2)
    expect(sim).toBeCloseTo(2 / 6, 5)
  })
})

// ─── formatCompareTable ──────────────────────────────────

describe('formatCompareTable', () => {
  const result: CompareResult = {
    file1: {
      blankLines: 2,
      codeLines: 20,
      commentLines: 3,
      exports: ['export const x = 1'],
      filePath: 'a.ts',
      functions: ['function foo() {}'],
      imports: ["import { bar } from 'baz'"],
      size: 256,
      totalLines: 25,
    },
    file2: {
      blankLines: 3,
      codeLines: 30,
      commentLines: 5,
      exports: [],
      filePath: 'b.ts',
      functions: [],
      imports: [],
      size: 512,
      totalLines: 38,
    },
    metrics: buildComparisonMetrics(
      {
        blankLines: 2,
        codeLines: 20,
        commentLines: 3,
        exports: ['export const x = 1'],
        filePath: 'a.ts',
        functions: ['function foo() {}'],
        imports: ["import { bar } from 'baz'"],
        size: 256,
        totalLines: 25,
      },
      {
        blankLines: 3,
        codeLines: 30,
        commentLines: 5,
        exports: [],
        filePath: 'b.ts',
        functions: [],
        imports: [],
        size: 512,
        totalLines: 38,
      },
    ),
    similarity: 0.42,
  }

  it('contains file paths', () => {
    const output = formatCompareTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('contains similarity percentage', () => {
    const output = formatCompareTable(result, false)
    expect(output).toContain('42.0%')
  })

  it('contains metric headers', () => {
    const output = formatCompareTable(result, false)
    expect(output).toContain('Metric')
    expect(output).toContain('File 1')
    expect(output).toContain('File 2')
    expect(output).toContain('Diff')
  })

  it('shows verbose imports when verbose=true', () => {
    const output = formatCompareTable(result, true)
    expect(output).toContain('File 1 Imports')
    expect(output).toContain("import { bar } from 'baz'")
  })

  it('shows verbose exports when verbose=true', () => {
    const output = formatCompareTable(result, true)
    expect(output).toContain('File 1 Exports')
    expect(output).toContain('export const x = 1')
  })

  it('shows verbose functions when verbose=true', () => {
    const output = formatCompareTable(result, true)
    expect(output).toContain('File 1 Functions')
    expect(output).toContain('function foo() {}')
  })

  it('shows (none) for empty verbose lists', () => {
    const output = formatCompareTable(result, true)
    expect(output).toContain('(none)')
  })
})

// ─── formatCompareSideBySide ─────────────────────────────

describe('formatCompareSideBySide', () => {
  const result: CompareResult = {
    file1: {
      blankLines: 1,
      codeLines: 10,
      commentLines: 0,
      exports: [],
      filePath: 'left.ts',
      functions: [],
      imports: [],
      size: 100,
      totalLines: 11,
    },
    file2: {
      blankLines: 2,
      codeLines: 15,
      commentLines: 1,
      exports: [],
      filePath: 'right.ts',
      functions: [],
      imports: [],
      size: 200,
      totalLines: 18,
    },
    metrics: buildComparisonMetrics(
      {
        blankLines: 1,
        codeLines: 10,
        commentLines: 0,
        exports: [],
        filePath: 'left.ts',
        functions: [],
        imports: [],
        size: 100,
        totalLines: 11,
      },
      {
        blankLines: 2,
        codeLines: 15,
        commentLines: 1,
        exports: [],
        filePath: 'right.ts',
        functions: [],
        imports: [],
        size: 200,
        totalLines: 18,
      },
    ),
    similarity: 0.75,
  }

  it('contains both file paths', () => {
    const output = formatCompareSideBySide(result)
    expect(output).toContain('left.ts')
    expect(output).toContain('right.ts')
  })

  it('contains similarity', () => {
    const output = formatCompareSideBySide(result)
    expect(output).toContain('75.0%')
  })

  it('contains stat labels', () => {
    const output = formatCompareSideBySide(result)
    expect(output).toContain('Size (bytes)')
    expect(output).toContain('Total Lines')
    expect(output).toContain('Code Lines')
  })
})

// ─── formatCompareJson ───────────────────────────────────

describe('formatCompareJson', () => {
  const result: CompareResult = {
    file1: {
      blankLines: 1,
      codeLines: 5,
      commentLines: 0,
      exports: [],
      filePath: 'a.ts',
      functions: [],
      imports: [],
      size: 50,
      totalLines: 6,
    },
    file2: {
      blankLines: 1,
      codeLines: 5,
      commentLines: 0,
      exports: [],
      filePath: 'b.ts',
      functions: [],
      imports: [],
      size: 50,
      totalLines: 6,
    },
    metrics: [],
    similarity: 1.0,
  }

  it('returns valid JSON', () => {
    const output = formatCompareJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.file1.filePath).toBe('a.ts')
    expect(parsed.file2.filePath).toBe('b.ts')
  })

  it('includes similarity', () => {
    const output = formatCompareJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.similarity).toBe(1.0)
  })

  it('includes metrics array', () => {
    const output = formatCompareJson(result)
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed.metrics)).toBe(true)
  })
})

// ─── formatDiffView ──────────────────────────────────────

describe('formatDiffView', () => {
  it('shows file names in header', () => {
    const output = formatDiffView('a\nb', 'a\nc', 'file1.ts', 'file2.ts')
    expect(output).toContain('file1.ts')
    expect(output).toContain('file2.ts')
  })

  it('shows removed lines with - prefix', () => {
    const output = formatDiffView('a\nb\nc', 'a\nc', 'f1', 'f2')
    expect(output).toContain('- b')
  })

  it('shows added lines with + prefix', () => {
    const output = formatDiffView('a\nc', 'a\nb\nc', 'f1', 'f2')
    expect(output).toContain('+ b')
  })

  it('shows common lines with space prefix', () => {
    const output = formatDiffView('a\nb\nc', 'a\nb\nd', 'f1', 'f2')
    expect(output).toContain('  a')
    expect(output).toContain('  b')
  })

  it('shows no change markers for identical content', () => {
    const output = formatDiffView('a\nb', 'a\nb', 'f1', 'f2')
    expect(output).not.toMatch(/^- [a-z]/)
    expect(output).not.toMatch(/^\+ [a-z]/)
  })

  it('handles completely different content', () => {
    const output = formatDiffView('aaa', 'bbb', 'f1', 'f2')
    expect(output).toContain('- aaa')
    expect(output).toContain('+ bbb')
  })

  it('handles empty files', () => {
    const output = formatDiffView('', '', 'f1', 'f2')
    expect(output).toContain('f1')
    expect(output).toContain('f2')
  })
})
