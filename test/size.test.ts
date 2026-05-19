import { describe, expect, it } from 'vitest'

import Size from '../src/commands/size.js'
import {
  calculatePercentages,
  formatBytes,
  groupByDirectory,
  groupByExtension,
  groupByFile,
  renderBarChart,
  type SizeEntry,
  type SizeResult,
} from '../src/commands/size-helpers.js'
import { formatSizeCsv, formatSizeJson, formatSizeTable } from '../src/commands/size-format-helpers.js'
import type { FileSizeInfo } from '../src/commands/size-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileSizeInfo(overrides: Partial<FileSizeInfo> = {}): FileSizeInfo {
  return {
    absolutePath: '/project/src/helper.ts',
    path: 'src/helper.ts',
    size: 1024,
    ...overrides,
  }
}

function makeSizeEntry(overrides: Partial<SizeEntry> = {}): SizeEntry {
  return {
    files: 1,
    name: 'src',
    percentage: 50.0,
    size: 1024,
    ...overrides,
  }
}

function makeSizeResult(overrides: Partial<SizeResult> = {}): SizeResult {
  return {
    entries: [makeSizeEntry()],
    groupBy: 'directory',
    totalFiles: 10,
    totalSize: 2048,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Size command - static metadata', () => {
  it('has a description', () => {
    expect(Size.description).toBe('Show disk usage breakdown by directory and extension')
  })

  it('has examples array', () => {
    expect(Array.isArray(Size.examples)).toBe(true)
    expect(Size.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Size.args.path).toBeDefined()
    expect(Size.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Size.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Size command - flags', () => {
  it('has format flag with options', () => {
    expect(Size.flags.format.options).toContain('json')
    expect(Size.flags.format.options).toContain('table')
    expect(Size.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Size.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Size.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Size.flags.ignore).toBeDefined()
    expect(Size.flags.ignore.multiple).toBe(true)
  })

  it('has by flag defaulting to directory', () => {
    expect(Size.flags.by.default).toBe('directory')
  })

  it('has by flag options', () => {
    expect(Size.flags.by.options).toContain('directory')
    expect(Size.flags.by.options).toContain('extension')
    expect(Size.flags.by.options).toContain('file')
  })

  it('has count flag defaulting to 20', () => {
    expect(Size.flags.count.default).toBe(20)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Size command - class structure', () => {
  it('exports a default class', () => {
    expect(Size).toBeDefined()
    expect(typeof Size).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Size.prototype.run).toBe('function')
  })
})

// ─── formatBytes ────────────────────────────────────────

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0.0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500.0 B')
  })

  it('formats 1 KB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('formats fractional KB', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats 1 MB', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB')
  })

  it('formats 2.5 MB', () => {
    expect(formatBytes(2621440)).toBe('2.5 MB')
  })

  it('formats 1 GB', () => {
    expect(formatBytes(1073741824)).toBe('1.0 GB')
  })

  it('formats large GB value', () => {
    expect(formatBytes(5368709120)).toBe('5.0 GB')
  })

  it('formats near boundary values', () => {
    expect(formatBytes(1023)).toBe('1023.0 B')
  })
})

// ─── renderBarChart ─────────────────────────────────────

describe('renderBarChart', () => {
  it('renders 0% as all empty', () => {
    const bar = renderBarChart(0, 20)
    expect(bar).toBe('░░░░░░░░░░░░░░░░░░░░')
    expect(bar.length).toBe(20)
  })

  it('renders 100% as all filled', () => {
    const bar = renderBarChart(100, 20)
    expect(bar).toBe('████████████████████')
    expect(bar.length).toBe(20)
  })

  it('renders 50% with half filled', () => {
    const bar = renderBarChart(50, 10)
    expect(bar).toBe('█████░░░░░')
    expect(bar.length).toBe(10)
  })

  it('respects custom width', () => {
    const bar = renderBarChart(50, 4)
    expect(bar).toBe('██░░')
    expect(bar.length).toBe(4)
  })

  it('renders 25%', () => {
    const bar = renderBarChart(25, 8)
    expect(bar).toBe('██░░░░░░')
    expect(bar.length).toBe(8)
  })

  it('handles percentage over 100 gracefully', () => {
    const bar = renderBarChart(150, 10)
    expect(bar.length).toBe(10)
    expect(bar).toBe('██████████')
  })

  it('handles width of 1', () => {
    const bar = renderBarChart(50, 1)
    expect(bar.length).toBe(1)
  })

  it('renders default width of 20', () => {
    const bar = renderBarChart(50)
    expect(bar.length).toBe(20)
  })
})

// ─── groupByDirectory ───────────────────────────────────

describe('groupByDirectory', () => {
  it('groups files by parent directory', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'src/a.ts', size: 100 }),
      makeFileSizeInfo({ path: 'src/b.ts', size: 200 }),
      makeFileSizeInfo({ path: 'test/c.ts', size: 50 }),
    ]
    const result = groupByDirectory(files)
    expect(result).toHaveLength(2)
    const src = result.find((e) => e.name === 'src')
    expect(src).toBeDefined()
    expect(src!.size).toBe(300)
    expect(src!.files).toBe(2)
  })

  it('handles nested paths', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'src/utils/a.ts', size: 100 }),
      makeFileSizeInfo({ path: 'src/core/b.ts', size: 200 }),
    ]
    const result = groupByDirectory(files)
    expect(result).toHaveLength(2)
    expect(result[0]!.name).toBe('src/core')
    expect(result[1]!.name).toBe('src/utils')
  })

  it('uses "." for root-level files', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'readme.md', size: 500 }),
    ]
    const result = groupByDirectory(files)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('.')
  })

  it('sorts by size descending', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'small/a.ts', size: 10 }),
      makeFileSizeInfo({ path: 'large/b.ts', size: 1000 }),
    ]
    const result = groupByDirectory(files)
    expect(result[0]!.name).toBe('large')
    expect(result[1]!.name).toBe('small')
  })

  it('handles empty array', () => {
    const result = groupByDirectory([])
    expect(result).toHaveLength(0)
  })

  it('handles single file', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'src/index.ts', size: 42 }),
    ]
    const result = groupByDirectory(files)
    expect(result).toHaveLength(1)
    expect(result[0]!.size).toBe(42)
    expect(result[0]!.files).toBe(1)
  })
})

// ─── groupByExtension ───────────────────────────────────

describe('groupByExtension', () => {
  it('groups files by extension', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'a.ts', size: 100 }),
      makeFileSizeInfo({ path: 'b.ts', size: 200 }),
      makeFileSizeInfo({ path: 'c.js', size: 50 }),
    ]
    const result = groupByExtension(files)
    expect(result).toHaveLength(2)
    const ts = result.find((e) => e.name === '.ts')
    expect(ts).toBeDefined()
    expect(ts!.size).toBe(300)
    expect(ts!.files).toBe(2)
  })

  it('handles files with no extension', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'Makefile', size: 500 }),
    ]
    const result = groupByExtension(files)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('(none)')
  })

  it('is case-insensitive for extensions', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'a.TS', size: 100 }),
      makeFileSizeInfo({ path: 'b.ts', size: 200 }),
    ]
    const result = groupByExtension(files)
    expect(result).toHaveLength(1)
    expect(result[0]!.size).toBe(300)
  })

  it('sorts by size descending', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'a.js', size: 10 }),
      makeFileSizeInfo({ path: 'b.ts', size: 1000 }),
    ]
    const result = groupByExtension(files)
    expect(result[0]!.name).toBe('.ts')
  })

  it('handles dotfiles with extensions correctly', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: '.eslintrc.json', size: 50 }),
    ]
    const result = groupByExtension(files)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('.json')
  })

  it('handles empty array', () => {
    const result = groupByExtension([])
    expect(result).toHaveLength(0)
  })
})

// ─── groupByFile ────────────────────────────────────────

describe('groupByFile', () => {
  it('returns individual files', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'a.ts', size: 100 }),
      makeFileSizeInfo({ path: 'b.ts', size: 200 }),
    ]
    const result = groupByFile(files)
    expect(result).toHaveLength(2)
    expect(result[0]!.name).toBe('b.ts')
    expect(result[0]!.files).toBe(1)
    expect(result[1]!.name).toBe('a.ts')
  })

  it('sorts by size descending', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'small.ts', size: 10 }),
      makeFileSizeInfo({ path: 'large.ts', size: 1000 }),
      makeFileSizeInfo({ path: 'medium.ts', size: 500 }),
    ]
    const result = groupByFile(files)
    expect(result[0]!.name).toBe('large.ts')
    expect(result[1]!.name).toBe('medium.ts')
    expect(result[2]!.name).toBe('small.ts')
  })

  it('handles empty array', () => {
    const result = groupByFile([])
    expect(result).toHaveLength(0)
  })

  it('handles single file', () => {
    const files: FileSizeInfo[] = [
      makeFileSizeInfo({ path: 'only.ts', size: 42 }),
    ]
    const result = groupByFile(files)
    expect(result).toHaveLength(1)
    expect(result[0]!.size).toBe(42)
  })
})

// ─── calculatePercentages ───────────────────────────────

describe('calculatePercentages', () => {
  it('calculates percentages correctly', () => {
    const entries: SizeEntry[] = [
      makeSizeEntry({ name: 'a', size: 75, files: 1 }),
      makeSizeEntry({ name: 'b', size: 25, files: 1 }),
    ]
    const result = calculatePercentages(entries, 100)
    expect(result[0]!.percentage).toBe(75.0)
    expect(result[1]!.percentage).toBe(25.0)
  })

  it('handles zero total size', () => {
    const entries: SizeEntry[] = [
      makeSizeEntry({ name: 'a', size: 0, files: 1 }),
    ]
    const result = calculatePercentages(entries, 0)
    expect(result[0]!.percentage).toBe(0)
  })

  it('handles empty entries', () => {
    const result = calculatePercentages([], 100)
    expect(result).toHaveLength(0)
  })

  it('preserves other properties', () => {
    const entries: SizeEntry[] = [
      makeSizeEntry({ name: 'a', size: 50, files: 3 }),
    ]
    const result = calculatePercentages(entries, 100)
    expect(result[0]!.name).toBe('a')
    expect(result[0]!.size).toBe(50)
    expect(result[0]!.files).toBe(3)
  })

  it('rounds to one decimal', () => {
    const entries: SizeEntry[] = [
      makeSizeEntry({ name: 'a', size: 1, files: 1 }),
      makeSizeEntry({ name: 'b', size: 2, files: 1 }),
    ]
    const result = calculatePercentages(entries, 3)
    expect(result[0]!.percentage).toBe(33.3)
    expect(result[1]!.percentage).toBe(66.7)
  })

  it('does not mutate input', () => {
    const entries: SizeEntry[] = [
      makeSizeEntry({ name: 'a', size: 50, percentage: 0 }),
    ]
    const copy = [...entries]
    calculatePercentages(entries, 100)
    expect(entries[0]!.percentage).toBe(copy[0]!.percentage)
  })
})

// ─── formatSizeTable ────────────────────────────────────

describe('formatSizeTable', () => {
  it('contains header row with column names', () => {
    const result = makeSizeResult()
    const output = formatSizeTable(result)
    expect(output).toContain('Name')
    expect(output).toContain('Size')
    expect(output).toContain('Files')
    expect(output).toContain('%')
  })

  it('contains data rows', () => {
    const result = makeSizeResult({
      entries: [makeSizeEntry({ name: 'src', size: 1024, files: 5, percentage: 50.0 })],
    })
    const output = formatSizeTable(result)
    expect(output).toContain('src')
    expect(output).toContain('1.0 KB')
  })

  it('contains total summary', () => {
    const result = makeSizeResult({ totalFiles: 10, totalSize: 2048 })
    const output = formatSizeTable(result)
    expect(output).toContain('Total')
    expect(output).toContain('2.0 KB')
    expect(output).toContain('10 files')
  })

  it('handles empty entries', () => {
    const result = makeSizeResult({
      entries: [],
      totalFiles: 0,
      totalSize: 0,
    })
    const output = formatSizeTable(result)
    expect(output).toContain('Name')
    expect(output).toContain('Total')
  })

  it('shows bar chart characters', () => {
    const result = makeSizeResult({
      entries: [makeSizeEntry({ name: 'src', percentage: 50.0 })],
    })
    const output = formatSizeTable(result)
    expect(output).toContain('█')
    expect(output).toContain('░')
  })
})

// ─── formatSizeCsv ──────────────────────────────────────

describe('formatSizeCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeSizeResult({ entries: [] })
    const output = formatSizeCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Name,Size,Files,Percentage')
  })

  it('includes data rows', () => {
    const result = makeSizeResult({
      entries: [makeSizeEntry({ name: 'src', size: 1024, files: 5, percentage: 50.0 })],
    })
    const output = formatSizeCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines[1]).toContain('src')
    expect(lines[1]).toContain('1024')
  })

  it('escapes commas in names', () => {
    const result = makeSizeResult({
      entries: [makeSizeEntry({ name: 'src,lib', size: 100, files: 1, percentage: 50.0 })],
    })
    const output = formatSizeCsv(result)
    expect(output).toContain('"src,lib"')
  })

  it('handles empty entries', () => {
    const result = makeSizeResult({
      entries: [],
      totalFiles: 0,
      totalSize: 0,
    })
    const output = formatSizeCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Name,Size,Files,Percentage')
    expect(lines).toHaveLength(1)
  })
})

// ─── formatSizeJson ─────────────────────────────────────

describe('formatSizeJson', () => {
  it('produces valid JSON', () => {
    const result = makeSizeResult()
    const output = formatSizeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains entries array', () => {
    const result = makeSizeResult()
    const output = formatSizeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.entries).toBeDefined()
    expect(Array.isArray(parsed.entries)).toBe(true)
  })

  it('contains totalSize and totalFiles', () => {
    const result = makeSizeResult({ totalSize: 2048, totalFiles: 10 })
    const output = formatSizeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalSize).toBe(2048)
    expect(parsed.totalFiles).toBe(10)
  })

  it('preserves entry data accurately', () => {
    const result = makeSizeResult({
      entries: [makeSizeEntry({ name: 'src', size: 42, files: 3, percentage: 75.5 })],
    })
    const output = formatSizeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.entries[0].name).toBe('src')
    expect(parsed.entries[0].size).toBe(42)
    expect(parsed.entries[0].files).toBe(3)
    expect(parsed.entries[0].percentage).toBe(75.5)
  })

  it('handles empty results', () => {
    const result = makeSizeResult({
      entries: [],
      totalFiles: 0,
      totalSize: 0,
    })
    const output = formatSizeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.entries).toHaveLength(0)
    expect(parsed.totalSize).toBe(0)
  })

  it('includes groupBy field', () => {
    const result = makeSizeResult({ groupBy: 'extension' })
    const output = formatSizeJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.groupBy).toBe('extension')
  })
})
