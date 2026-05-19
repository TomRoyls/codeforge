import { describe, expect, it } from 'vitest'

import Dupes from '../src/commands/dupes.js'
import {
  calculateStats,
  extractBlocks,
  findDuplicates,
  hashContent,
  normalizeContent,
  type CodeBlock,
  type DupesResult,
  type DuplicateGroup,
} from '../src/commands/dupes-helpers.js'
import { formatDupesCsv, formatDupesJson, formatDupesTable } from '../src/commands/dupes-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeCodeBlock(overrides: Partial<CodeBlock> = {}): CodeBlock {
  return {
    content: 'line1\nline2\nline3\nline4\nline5',
    endLine: 5,
    filePath: 'test.ts',
    lineCount: 5,
    normalizedHash: 'abc123',
    startLine: 1,
    ...overrides,
  }
}

const sampleContent = `function hello() {
  console.log("hello");
  console.log("world");
  return true;
}

function goodbye() {
  console.log("hello");
  console.log("world");
  return false;
}`

function makeDupesResult(overrides: Partial<DupesResult> = {}): DupesResult {
  return {
    duplicateGroups: [],
    duplicateLines: 0,
    duplicatePercentage: 0,
    totalBlocks: 10,
    totalFiles: 2,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Dupes command - static metadata', () => {
  it('has a description', () => {
    expect(Dupes.description).toBe('Detect duplicate and near-duplicate code blocks')
  })

  it('has examples array', () => {
    expect(Array.isArray(Dupes.examples)).toBe(true)
    expect(Dupes.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Dupes.args.path).toBeDefined()
    expect(Dupes.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Dupes.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Dupes command - flags', () => {
  it('has format flag with options', () => {
    expect(Dupes.flags.format.options).toContain('json')
    expect(Dupes.flags.format.options).toContain('table')
    expect(Dupes.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Dupes.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Dupes.flags.output).toBeDefined()
  })

  it('has min-lines flag defaulting to 5', () => {
    expect(Dupes.flags['min-lines'].default).toBe(5)
  })

  it('has threshold flag defaulting to 0.9', () => {
    expect(Dupes.flags.threshold.default).toBe('0.9')
  })

  it('has ignore flag with multiple', () => {
    expect(Dupes.flags.ignore).toBeDefined()
    expect(Dupes.flags.ignore.multiple).toBe(true)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Dupes.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Dupes command - class structure', () => {
  it('exports a default class', () => {
    expect(Dupes).toBeDefined()
    expect(typeof Dupes).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Dupes.prototype.run).toBe('function')
  })
})

// ─── normalizeContent ────────────────────────────────────

describe('normalizeContent', () => {
  it('trims whitespace from each line', () => {
    const result = normalizeContent('  hello  \n  world  ')
    expect(result).toBe('hello\nworld')
  })

  it('lowercases content', () => {
    const result = normalizeContent('Hello\nWorld')
    expect(result).toBe('hello\nworld')
  })

  it('removes empty lines', () => {
    const result = normalizeContent('hello\n\n\nworld')
    expect(result).toBe('hello\nworld')
  })

  it('removes whitespace-only lines', () => {
    const result = normalizeContent('hello\n   \nworld')
    expect(result).toBe('hello\nworld')
  })

  it('handles single line', () => {
    const result = normalizeContent('  Hello World  ')
    expect(result).toBe('hello world')
  })

  it('handles empty string', () => {
    const result = normalizeContent('')
    expect(result).toBe('')
  })

  it('handles string with only whitespace', () => {
    const result = normalizeContent('   \n   \n   ')
    expect(result).toBe('')
  })
})

// ─── hashContent ─────────────────────────────────────────

describe('hashContent', () => {
  it('returns consistent hash for same content', () => {
    const a = hashContent('hello world')
    const b = hashContent('hello world')
    expect(a).toBe(b)
  })

  it('returns different hash for different content', () => {
    const a = hashContent('hello world')
    const b = hashContent('goodbye world')
    expect(a).not.toBe(b)
  })

  it('returns a string', () => {
    const result = hashContent('test')
    expect(typeof result).toBe('string')
  })

  it('handles empty string', () => {
    const result = hashContent('')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─── extractBlocks ───────────────────────────────────────

describe('extractBlocks', () => {
  it('extracts correct number of blocks', () => {
    const content = 'line1\nline2\nline3\nline4\nline5\nline6'
    const blocks = extractBlocks(content, 'test.ts', 3)
    expect(blocks).toHaveLength(4) // 6 lines - 3 + 1 = 4
  })

  it('respects minLines parameter', () => {
    const content = 'line1\nline2\nline3'
    const blocks = extractBlocks(content, 'test.ts', 5)
    expect(blocks).toHaveLength(0)
  })

  it('handles file exactly minLines long', () => {
    const content = 'line1\nline2\nline3\nline4\nline5'
    const blocks = extractBlocks(content, 'test.ts', 5)
    expect(blocks).toHaveLength(1)
  })

  it('handles empty file', () => {
    const blocks = extractBlocks('', 'test.ts', 5)
    expect(blocks).toHaveLength(0)
  })

  it('sets correct startLine and endLine', () => {
    const content = 'line1\nline2\nline3\nline4\nline5'
    const blocks = extractBlocks(content, 'test.ts', 3)
    expect(blocks[0]!.startLine).toBe(1)
    expect(blocks[0]!.endLine).toBe(3)
    expect(blocks[1]!.startLine).toBe(2)
    expect(blocks[1]!.endLine).toBe(4)
  })

  it('sets filePath on each block', () => {
    const content = 'line1\nline2\nline3\nline4\nline5'
    const blocks = extractBlocks(content, 'myfile.ts', 5)
    expect(blocks[0]!.filePath).toBe('myfile.ts')
  })

  it('sets lineCount equal to minLines', () => {
    const content = 'line1\nline2\nline3\nline4\nline5'
    const blocks = extractBlocks(content, 'test.ts', 5)
    expect(blocks[0]!.lineCount).toBe(5)
  })

  it('computes normalizedHash for each block', () => {
    const content = 'line1\nline2\nline3\nline4\nline5'
    const blocks = extractBlocks(content, 'test.ts', 5)
    expect(blocks[0]!.normalizedHash).toBeDefined()
    expect(typeof blocks[0]!.normalizedHash).toBe('string')
  })

  it('gives same hash for identical blocks', () => {
    const content = 'x\ny\nz\nx\ny\nz'
    const blocks = extractBlocks(content, 'test.ts', 3)
    expect(blocks[0]!.normalizedHash).toBe(blocks[3]!.normalizedHash)
  })
})

// ─── findDuplicates ──────────────────────────────────────

describe('findDuplicates', () => {
  it('identifies exact duplicates', () => {
    const blocks = [
      makeCodeBlock({ filePath: 'a.ts', normalizedHash: 'hash1' }),
      makeCodeBlock({ filePath: 'b.ts', normalizedHash: 'hash1' }),
    ]
    const result = findDuplicates(blocks, 0.9)
    expect(result).toHaveLength(1)
    expect(result[0]!.blocks).toHaveLength(2)
  })

  it('returns empty for no duplicates', () => {
    const blocks = [
      makeCodeBlock({ normalizedHash: 'hash1' }),
      makeCodeBlock({ normalizedHash: 'hash2' }),
    ]
    const result = findDuplicates(blocks, 0.9)
    expect(result).toHaveLength(0)
  })

  it('returns empty for single block', () => {
    const blocks = [makeCodeBlock({ normalizedHash: 'hash1' })]
    const result = findDuplicates(blocks, 0.9)
    expect(result).toHaveLength(0)
  })

  it('returns empty for empty array', () => {
    const result = findDuplicates([], 0.9)
    expect(result).toHaveLength(0)
  })

  it('groups multiple blocks with same hash', () => {
    const blocks = [
      makeCodeBlock({ filePath: 'a.ts', normalizedHash: 'hash1' }),
      makeCodeBlock({ filePath: 'b.ts', normalizedHash: 'hash1' }),
      makeCodeBlock({ filePath: 'c.ts', normalizedHash: 'hash1' }),
    ]
    const result = findDuplicates(blocks, 0.9)
    expect(result).toHaveLength(1)
    expect(result[0]!.blocks).toHaveLength(3)
  })

  it('sets similarity in group', () => {
    const content = 'line1\nline2\nline3\nline4\nline5'
    const blocks = [
      makeCodeBlock({ content, normalizedHash: 'hash1' }),
      makeCodeBlock({ content, normalizedHash: 'hash1' }),
    ]
    const result = findDuplicates(blocks, 0.9)
    expect(result[0]!.similarity).toBe(1)
  })

  it('sets lines in group from block lineCount', () => {
    const blocks = [
      makeCodeBlock({ lineCount: 7, normalizedHash: 'hash1' }),
      makeCodeBlock({ lineCount: 7, normalizedHash: 'hash1' }),
    ]
    const result = findDuplicates(blocks, 0.9)
    expect(result[0]!.lines).toBe(7)
  })
})

// ─── calculateStats ──────────────────────────────────────

describe('calculateStats', () => {
  it('calculates correct percentage', () => {
    const groups: DuplicateGroup[] = [
      { blocks: [makeCodeBlock(), makeCodeBlock(), makeCodeBlock()], lines: 5, similarity: 1 },
    ]
    const result = calculateStats(groups, 20, 3)
    expect(result.duplicateLines).toBe(10) // 5 lines × (3 - 1)
    expect(result.duplicatePercentage).toBe(50) // 10 / 20 * 100
  })

  it('handles zero blocks', () => {
    const result = calculateStats([], 0, 0)
    expect(result.duplicateLines).toBe(0)
    expect(result.duplicatePercentage).toBe(0)
  })

  it('handles no duplicate groups', () => {
    const result = calculateStats([], 100, 5)
    expect(result.duplicateLines).toBe(0)
    expect(result.duplicatePercentage).toBe(0)
  })

  it('carries through totalBlocks and totalFiles', () => {
    const result = calculateStats([], 42, 7)
    expect(result.totalBlocks).toBe(42)
    expect(result.totalFiles).toBe(7)
  })

  it('sums duplicate lines from multiple groups', () => {
    const groups: DuplicateGroup[] = [
      { blocks: [makeCodeBlock(), makeCodeBlock()], lines: 5, similarity: 1 },
      { blocks: [makeCodeBlock(), makeCodeBlock(), makeCodeBlock()], lines: 3, similarity: 0.95 },
    ]
    const result = calculateStats(groups, 50, 4)
    expect(result.duplicateLines).toBe(11) // 5×1 + 3×2
  })
})

// ─── formatDupesTable ───────────────────────────────────

describe('formatDupesTable', () => {
  it('shows "no duplicates" message for empty results', () => {
    const result = makeDupesResult()
    const output = formatDupesTable(result, false)
    expect(output).toContain('No duplicate code blocks found')
  })

  it('shows file count in header', () => {
    const result = makeDupesResult()
    const output = formatDupesTable(result, false)
    expect(output).toContain('Files scanned')
    expect(output).toContain('2')
  })

  it('shows duplicate groups with file paths', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [
          makeCodeBlock({ filePath: 'a.ts', startLine: 1, endLine: 5 }),
          makeCodeBlock({ filePath: 'b.ts', startLine: 10, endLine: 14 }),
        ],
        lines: 5,
        similarity: 1,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups, duplicateLines: 5, duplicatePercentage: 50 })
    const output = formatDupesTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('shows similarity percentage', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [makeCodeBlock({ filePath: 'a.ts' }), makeCodeBlock({ filePath: 'b.ts' })],
        lines: 5,
        similarity: 0.95,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups })
    const output = formatDupesTable(result, false)
    expect(output).toContain('95%')
  })

  it('shows summary section', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [makeCodeBlock(), makeCodeBlock()],
        lines: 5,
        similarity: 1,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups, duplicateLines: 5, duplicatePercentage: 50 })
    const output = formatDupesTable(result, false)
    expect(output).toContain('Summary')
  })

  it('shows code snippets in verbose mode', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [makeCodeBlock({ content: 'line1\nline2\nline3\nline4\nline5', filePath: 'a.ts' })],
        lines: 5,
        similarity: 1,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups })
    const output = formatDupesTable(result, true)
    expect(output).toContain('line1')
  })

  it('hides code snippets in non-verbose mode', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [makeCodeBlock({ content: 'line1\nline2\nline3\nline4\nline5', filePath: 'a.ts' })],
        lines: 5,
        similarity: 1,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups })
    const output = formatDupesTable(result, false)
    expect(output).not.toContain('| line1')
  })
})

// ─── formatDupesCsv ─────────────────────────────────────

describe('formatDupesCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeDupesResult()
    const output = formatDupesCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('File1,Line1,File2,Line2,Similarity,Lines')
  })

  it('includes data rows for duplicate pairs', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [
          makeCodeBlock({ filePath: 'a.ts', startLine: 1, endLine: 5 }),
          makeCodeBlock({ filePath: 'b.ts', startLine: 10, endLine: 14 }),
        ],
        lines: 5,
        similarity: 0.95,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups })
    const output = formatDupesCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(2) // header + 1 pair
    expect(lines[1]).toContain('a.ts')
    expect(lines[1]).toContain('b.ts')
    expect(lines[1]).toContain('95')
  })

  it('escapes commas in file paths', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [
          makeCodeBlock({ filePath: 'path/to,file.ts', startLine: 1, endLine: 5 }),
          makeCodeBlock({ filePath: 'other.ts', startLine: 1, endLine: 5 }),
        ],
        lines: 5,
        similarity: 1,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups })
    const output = formatDupesCsv(result)
    expect(output).toContain('"path/to,file.ts"')
  })

  it('handles empty results (headers only)', () => {
    const result = makeDupesResult()
    const output = formatDupesCsv(result)
    expect(output).toBe('File1,Line1,File2,Line2,Similarity,Lines')
  })

  it('generates pairs for groups with 3+ blocks', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [
          makeCodeBlock({ filePath: 'a.ts' }),
          makeCodeBlock({ filePath: 'b.ts' }),
          makeCodeBlock({ filePath: 'c.ts' }),
        ],
        lines: 5,
        similarity: 1,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups })
    const output = formatDupesCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(4) // header + 3 pairs (a-b, a-c, b-c)
  })
})

// ─── formatDupesJson ────────────────────────────────────

describe('formatDupesJson', () => {
  it('produces valid JSON', () => {
    const result = makeDupesResult()
    const output = formatDupesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains totalFiles and totalBlocks', () => {
    const result = makeDupesResult()
    const output = formatDupesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalFiles).toBe(2)
    expect(parsed.totalBlocks).toBe(10)
  })

  it('contains duplicateGroups array', () => {
    const result = makeDupesResult()
    const output = formatDupesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.duplicateGroups).toBeDefined()
    expect(Array.isArray(parsed.duplicateGroups)).toBe(true)
  })

  it('includes duplicate lines and percentage', () => {
    const result = makeDupesResult({ duplicateLines: 42, duplicatePercentage: 21 })
    const output = formatDupesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.duplicateLines).toBe(42)
    expect(parsed.duplicatePercentage).toBe(21)
  })

  it('handles results with groups', () => {
    const groups: DuplicateGroup[] = [
      {
        blocks: [
          makeCodeBlock({ filePath: 'a.ts' }),
          makeCodeBlock({ filePath: 'b.ts' }),
        ],
        lines: 5,
        similarity: 0.95,
      },
    ]
    const result = makeDupesResult({ duplicateGroups: groups })
    const output = formatDupesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.duplicateGroups).toHaveLength(1)
    expect(parsed.duplicateGroups[0].similarity).toBe(0.95)
  })

  it('handles empty results', () => {
    const result = makeDupesResult()
    const output = formatDupesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.duplicateGroups).toHaveLength(0)
    expect(parsed.duplicateLines).toBe(0)
  })
})
