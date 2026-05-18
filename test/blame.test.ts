import { describe, expect, it } from 'vitest'

import Blame from '../src/commands/blame.js'
import {
  aggregateAuthors,
  filterByAuthor,
  filterByLineRange,
  type AuthorStats,
  type BlameResult,
  sortBlameLines,
} from '../src/commands/blame-helpers.js'
import { formatBlameCsv, formatBlameJson, formatBlameTable } from '../src/commands/blame-format-helpers.js'
import type { BlameLine } from '../src/utils/git-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeBlameLine(overrides: Partial<BlameLine> = {}): BlameLine {
  return {
    author: 'Alice',
    commit: 'abc12345',
    date: '2025-01-15',
    line: 1,
    summary: 'Initial commit',
    ...overrides,
  }
}

const sampleLines: BlameLine[] = [
  makeBlameLine({ author: 'Alice', commit: 'abc12345', date: '2025-01-15', line: 1, summary: 'Initial commit' }),
  makeBlameLine({ author: 'Alice', commit: 'abc12345', date: '2025-01-15', line: 2, summary: 'Initial commit' }),
  makeBlameLine({ author: 'Bob', commit: 'def67890', date: '2025-02-20', line: 3, summary: 'Add feature' }),
  makeBlameLine({ author: 'Bob', commit: 'def67890', date: '2025-02-20', line: 4, summary: 'Add feature' }),
  makeBlameLine({ author: 'Charlie', commit: 'ghi11111', date: '2025-03-10', line: 5, summary: 'Fix bug' }),
]

function makeBlameResult(lines: BlameLine[] = sampleLines): BlameResult {
  return {
    authors: aggregateAuthors(lines),
    branch: 'main',
    file: '/src/test.ts',
    lines,
    totalLines: lines.length,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Blame command - static metadata', () => {
  it('has a description', () => {
    expect(Blame.description).toBe('Show git blame information for a specific file')
  })

  it('has examples array', () => {
    expect(Array.isArray(Blame.examples)).toBe(true)
    expect(Blame.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has file arg as required', () => {
    expect(Blame.args.file).toBeDefined()
    expect(Blame.args.file.required).toBe(true)
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Blame command - flags', () => {
  it('has format flag with options', () => {
    expect(Blame.flags.format.options).toContain('json')
    expect(Blame.flags.format.options).toContain('table')
    expect(Blame.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Blame.flags.format.default).toBe('table')
  })

  it('has author flag', () => {
    expect(Blame.flags.author).toBeDefined()
  })

  it('has summary flag defaulting to false', () => {
    expect(Blame.flags.summary.default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Blame.flags.verbose.default).toBe(false)
  })

  it('has lines flag', () => {
    expect(Blame.flags.lines).toBeDefined()
  })

  it('has output flag', () => {
    expect(Blame.flags.output).toBeDefined()
  })
})

// ─── Class structure ────────────────────────────────────

describe('Blame command - class structure', () => {
  it('exports a default class', () => {
    expect(Blame).toBeDefined()
    expect(typeof Blame).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Blame.prototype.run).toBe('function')
  })
})

// ─── filterByAuthor ─────────────────────────────────────

describe('filterByAuthor', () => {
  it('filters lines by exact author name', () => {
    const result = filterByAuthor(sampleLines, 'Alice')
    expect(result).toHaveLength(2)
    expect(result.every((l) => l.author === 'Alice')).toBe(true)
  })

  it('filters case-insensitively', () => {
    const result = filterByAuthor(sampleLines, 'alice')
    expect(result).toHaveLength(2)
    expect(result.every((l) => l.author === 'Alice')).toBe(true)
  })

  it('filters by partial author name', () => {
    const result = filterByAuthor(sampleLines, 'Char')
    expect(result).toHaveLength(1)
    expect(result[0]!.author).toBe('Charlie')
  })

  it('returns all lines when filter matches all authors', () => {
    const result = filterByAuthor(sampleLines, 'a')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty array when no author matches', () => {
    const result = filterByAuthor(sampleLines, 'Zara')
    expect(result).toHaveLength(0)
  })

  it('handles empty lines array', () => {
    const result = filterByAuthor([], 'Alice')
    expect(result).toHaveLength(0)
  })
})

// ─── filterByLineRange ──────────────────────────────────

describe('filterByLineRange', () => {
  it('filters lines within range', () => {
    const result = filterByLineRange(sampleLines, '2-4')
    expect(result).toHaveLength(3)
    expect(result[0]!.line).toBe(2)
    expect(result[2]!.line).toBe(4)
  })

  it('returns single line for range like "3-3"', () => {
    const result = filterByLineRange(sampleLines, '3-3')
    expect(result).toHaveLength(1)
    expect(result[0]!.line).toBe(3)
  })

  it('returns all lines for full range', () => {
    const result = filterByLineRange(sampleLines, '1-5')
    expect(result).toHaveLength(5)
  })

  it('returns all lines for invalid range format', () => {
    const result = filterByLineRange(sampleLines, 'invalid')
    expect(result).toHaveLength(5)
  })

  it('returns all lines when start is zero', () => {
    const result = filterByLineRange(sampleLines, '0-5')
    expect(result).toHaveLength(5)
  })

  it('returns all lines when end is less than start', () => {
    const result = filterByLineRange(sampleLines, '5-1')
    expect(result).toHaveLength(5)
  })

  it('returns empty for range outside file', () => {
    const result = filterByLineRange(sampleLines, '100-200')
    expect(result).toHaveLength(0)
  })

  it('handles empty lines array', () => {
    const result = filterByLineRange([], '1-10')
    expect(result).toHaveLength(0)
  })
})

// ─── aggregateAuthors ────────────────────────────────────

describe('aggregateAuthors', () => {
  it('aggregates single author correctly', () => {
    const lines = [makeBlameLine({ author: 'Alice', line: 1 }), makeBlameLine({ author: 'Alice', line: 2 })]
    const result = aggregateAuthors(lines)
    expect(result.get('Alice')!.lines).toBe(2)
    expect(result.get('Alice')!.percentage).toBe(100)
  })

  it('aggregates multiple authors with correct percentages', () => {
    const result = aggregateAuthors(sampleLines)
    expect(result.get('Alice')!.lines).toBe(2)
    expect(result.get('Bob')!.lines).toBe(2)
    expect(result.get('Charlie')!.lines).toBe(1)
    expect(result.get('Alice')!.percentage).toBeCloseTo(40)
    expect(result.get('Bob')!.percentage).toBeCloseTo(40)
    expect(result.get('Charlie')!.percentage).toBeCloseTo(20)
  })

  it('handles empty lines', () => {
    const result = aggregateAuthors([])
    expect(result.size).toBe(0)
  })

  it('percentages sum to 100', () => {
    const result = aggregateAuthors(sampleLines)
    let total = 0
    for (const stats of result.values()) {
      total += stats.percentage
    }
    expect(total).toBeCloseTo(100)
  })
})

// ─── sortBlameLines ──────────────────────────────────────

describe('sortBlameLines', () => {
  it('sorts by line number by default', () => {
    const shuffled = [sampleLines[4]!, sampleLines[0]!, sampleLines[2]!]
    const result = sortBlameLines(shuffled, 'line')
    expect(result[0]!.line).toBe(1)
    expect(result[1]!.line).toBe(3)
    expect(result[2]!.line).toBe(5)
  })

  it('sorts by author name', () => {
    const result = sortBlameLines(sampleLines, 'author')
    expect(result[0]!.author).toBe('Alice')
    expect(result[1]!.author).toBe('Alice')
    expect(result[2]!.author).toBe('Bob')
  })

  it('sorts by date', () => {
    const result = sortBlameLines(sampleLines, 'date')
    expect(result[0]!.date).toBe('2025-01-15')
    expect(result[4]!.date).toBe('2025-03-10')
  })

  it('preserves line order as tiebreaker for author sort', () => {
    const result = sortBlameLines(sampleLines, 'author')
    const aliceLines = result.filter((l) => l.author === 'Alice')
    expect(aliceLines[0]!.line).toBeLessThan(aliceLines[1]!.line)
  })

  it('does not mutate original array', () => {
    const original = [...sampleLines]
    sortBlameLines(sampleLines, 'author')
    expect(sampleLines).toEqual(original)
  })

  it('handles empty array', () => {
    const result = sortBlameLines([], 'line')
    expect(result).toHaveLength(0)
  })
})

// ─── formatBlameTable ───────────────────────────────────

describe('formatBlameTable', () => {
  it('produces output containing file and branch info', () => {
    const result = makeBlameResult()
    const output = formatBlameTable(result, false, false)
    expect(output).toContain('/src/test.ts')
    expect(output).toContain('main')
    expect(output).toContain('Total lines')
  })

  it('shows author names in output', () => {
    const result = makeBlameResult()
    const output = formatBlameTable(result, false, false)
    expect(output).toContain('Alice')
    expect(output).toContain('Bob')
  })

  it('shows Author Summary section', () => {
    const result = makeBlameResult()
    const output = formatBlameTable(result, false, false)
    expect(output).toContain('Author Summary')
  })

  it('shows summary column when showSummary is true', () => {
    const result = makeBlameResult()
    const output = formatBlameTable(result, false, true)
    expect(output).toContain('Initial commit')
  })

  it('hides summary column when showSummary is false', () => {
    const result = makeBlameResult()
    const output = formatBlameTable(result, false, false)
    expect(output).not.toContain('Initial commit')
  })

  it('handles empty blame lines', () => {
    const result = makeBlameResult([])
    const output = formatBlameTable(result, false, false)
    expect(output).toContain('No blame information available')
  })
})

// ─── formatBlameCsv ─────────────────────────────────────

describe('formatBlameCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeBlameResult()
    const output = formatBlameCsv(result, false)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Line,Author,Date,Commit')
  })

  it('includes data rows', () => {
    const result = makeBlameResult()
    const output = formatBlameCsv(result, false)
    const lines = output.split('\n')
    expect(lines.length).toBe(sampleLines.length + 1)
  })

  it('includes Summary column when showSummary is true', () => {
    const result = makeBlameResult()
    const output = formatBlameCsv(result, true)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Line,Author,Date,Commit,Summary')
  })

  it('escapes commas in fields', () => {
    const lines: BlameLine[] = [
      makeBlameLine({ author: 'Smith, John', line: 1, summary: 'Fix: a, b, c' }),
    ]
    const result = makeBlameResult(lines)
    const output = formatBlameCsv(result, true)
    const dataLine = output.split('\n')[1]!
    expect(dataLine).toContain('"Smith, John"')
  })

  it('escapes double quotes in fields', () => {
    const lines: BlameLine[] = [
      makeBlameLine({ author: 'O"Brien', line: 1, summary: 'Say "hello"' }),
    ]
    const result = makeBlameResult(lines)
    const output = formatBlameCsv(result, true)
    const dataLine = output.split('\n')[1]!
    expect(dataLine).toContain('O""Brien')
  })

  it('handles empty results', () => {
    const result = makeBlameResult([])
    const output = formatBlameCsv(result, false)
    expect(output).toBe('Line,Author,Date,Commit')
  })
})

// ─── formatBlameJson ────────────────────────────────────

describe('formatBlameJson', () => {
  it('produces valid JSON', () => {
    const result = makeBlameResult()
    const output = formatBlameJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains file and branch info', () => {
    const result = makeBlameResult()
    const output = formatBlameJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.file).toBe('/src/test.ts')
    expect(parsed.branch).toBe('main')
  })

  it('contains lines array', () => {
    const result = makeBlameResult()
    const output = formatBlameJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.lines).toHaveLength(sampleLines.length)
  })

  it('contains author summary', () => {
    const result = makeBlameResult()
    const output = formatBlameJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.authors).toBeDefined()
    expect(parsed.authors.length).toBe(3)
  })

  it('handles empty results', () => {
    const result = makeBlameResult([])
    const output = formatBlameJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.lines).toHaveLength(0)
    expect(parsed.authors).toHaveLength(0)
    expect(parsed.totalLines).toBe(0)
  })

  it('includes totalLines', () => {
    const result = makeBlameResult()
    const output = formatBlameJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalLines).toBe(sampleLines.length)
  })
})
