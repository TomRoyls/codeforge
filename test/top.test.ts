import { describe, expect, it } from 'vitest'

import Top from '../src/commands/top.js'
import {
  analyzeFile,
  filterByExtension,
  type FileMetric,
  rankFiles,
  type TopResult,
} from '../src/commands/top-helpers.js'
import { formatTopCsv, formatTopJson, formatTopTable } from '../src/commands/top-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileMetric(overrides: Partial<FileMetric> = {}): FileMetric {
  return {
    blankLines: 2,
    codeLines: 10,
    commentLines: 3,
    complexity: 5,
    extension: '.ts',
    filePath: 'src/file.ts',
    lines: 15,
    relativePath: 'src/file.ts',
    size: 256,
    todos: 1,
    ...overrides,
  }
}

function makeTopResult(overrides: Partial<TopResult> = {}): TopResult {
  return {
    files: [makeFileMetric()],
    metric: 'size',
    totalAnalyzed: 10,
    totalCount: 20,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Top command - static metadata', () => {
  it('has a description', () => {
    expect(Top.description).toBe('Show top files ranked by a code quality metric')
  })

  it('has examples array', () => {
    expect(Array.isArray(Top.examples)).toBe(true)
    expect(Top.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Top.args.path).toBeDefined()
    expect(Top.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Top.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Top command - flags', () => {
  it('has count flag defaulting to 10', () => {
    expect(Top.flags.count).toBeDefined()
    expect(Top.flags.count.default).toBe(10)
  })

  it('has metric flag with options', () => {
    expect(Top.flags.metric.options).toContain('size')
    expect(Top.flags.metric.options).toContain('lines')
    expect(Top.flags.metric.options).toContain('complexity')
    expect(Top.flags.metric.options).toContain('todos')
  })

  it('defaults metric to size', () => {
    expect(Top.flags.metric.default).toBe('size')
  })

  it('has format flag with options', () => {
    expect(Top.flags.format.options).toContain('json')
    expect(Top.flags.format.options).toContain('table')
    expect(Top.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Top.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Top.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Top.flags.ignore).toBeDefined()
    expect(Top.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Top.flags.ext).toBeDefined()
  })

  it('has desc flag defaulting to true', () => {
    expect(Top.flags.desc.default).toBe(true)
  })

  it('count flag has char n', () => {
    expect(Top.flags.count.char).toBe('n')
  })

  it('metric flag has char m', () => {
    expect(Top.flags.metric.char).toBe('m')
  })
})

// ─── Class structure ────────────────────────────────────

describe('Top command - class structure', () => {
  it('exports a default class', () => {
    expect(Top).toBeDefined()
    expect(typeof Top).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Top.prototype.run).toBe('function')
  })
})

// ─── analyzeFile ────────────────────────────────────────

describe('analyzeFile', () => {
  it('calculates size from byte length', () => {
    const content = 'hello world'
    const result = analyzeFile(content, 'test.ts')
    expect(result.size).toBe(Buffer.byteLength(content, 'utf8'))
  })

  it('counts total lines', () => {
    const content = 'line1\nline2\nline3'
    const result = analyzeFile(content, 'test.ts')
    expect(result.lines).toBe(3)
  })

  it('counts blank lines', () => {
    const content = 'code\n\n  \ncode'
    const result = analyzeFile(content, 'test.ts')
    expect(result.blankLines).toBe(2)
  })

  it('counts comment lines starting with //', () => {
    const content = '// a comment\ncode\n// another'
    const result = analyzeFile(content, 'test.ts')
    expect(result.commentLines).toBe(2)
  })

  it('counts comment lines starting with #', () => {
    const content = '# a comment\ncode\n# another'
    const result = analyzeFile(content, 'test.py')
    expect(result.commentLines).toBe(2)
  })

  it('counts code lines', () => {
    const content = 'const x = 1;\n\n// comment\nconst y = 2;'
    const result = analyzeFile(content, 'test.ts')
    expect(result.codeLines).toBe(2)
  })

  it('counts complexity keywords', () => {
    const content = 'if (x) { } else { } for (let i; ) { }'
    const result = analyzeFile(content, 'test.ts')
    expect(result.complexity).toBeGreaterThanOrEqual(3)
  })

  it('counts ternary as complexity', () => {
    const content = 'const x = a ? b : c;'
    const result = analyzeFile(content, 'test.ts')
    expect(result.complexity).toBeGreaterThanOrEqual(1)
  })

  it('counts logical operators as complexity', () => {
    const content = 'if (a && b || c) { }'
    const result = analyzeFile(content, 'test.ts')
    expect(result.complexity).toBeGreaterThanOrEqual(3)
  })

  it('counts TODOs case-insensitively', () => {
    const content = '// TODO: fix this\n// todo: also this\n// FIXME: urgent'
    const result = analyzeFile(content, 'test.ts')
    expect(result.todos).toBe(3)
  })

  it('counts HACK, XXX, BUG as todos', () => {
    const content = '// HACK: workaround\n// XXX: bad\n// BUG: broken'
    const result = analyzeFile(content, 'test.ts')
    expect(result.todos).toBe(3)
  })

  it('extracts extension', () => {
    const result = analyzeFile('code', 'src/file.ts')
    expect(result.extension).toBe('.ts')
  })

  it('extracts extension for .tsx', () => {
    const result = analyzeFile('code', 'src/file.tsx')
    expect(result.extension).toBe('.tsx')
  })

  it('handles empty content', () => {
    const result = analyzeFile('', 'test.ts')
    expect(result.lines).toBe(1)
    expect(result.size).toBe(0)
    expect(result.codeLines).toBe(0)
    expect(result.blankLines).toBe(1)
  })

  it('sets filePath and relativePath', () => {
    const result = analyzeFile('code', 'src/utils/helper.ts')
    expect(result.filePath).toBe('src/utils/helper.ts')
    expect(result.relativePath).toBe('src/utils/helper.ts')
  })
})

// ─── rankFiles ──────────────────────────────────────────

describe('rankFiles', () => {
  const testFiles: FileMetric[] = [
    makeFileMetric({ relativePath: 'a.ts', size: 100, lines: 50, complexity: 3, todos: 1 }),
    makeFileMetric({ relativePath: 'b.ts', size: 500, lines: 200, complexity: 10, todos: 5 }),
    makeFileMetric({ relativePath: 'c.ts', size: 300, lines: 100, complexity: 7, todos: 2 }),
  ]

  it('sorts by size descending by default', () => {
    const result = rankFiles(testFiles, 'size', 10, true)
    expect(result[0]!.relativePath).toBe('b.ts')
    expect(result[1]!.relativePath).toBe('c.ts')
    expect(result[2]!.relativePath).toBe('a.ts')
  })

  it('sorts by lines descending', () => {
    const result = rankFiles(testFiles, 'lines', 10, true)
    expect(result[0]!.relativePath).toBe('b.ts')
  })

  it('sorts by complexity descending', () => {
    const result = rankFiles(testFiles, 'complexity', 10, true)
    expect(result[0]!.relativePath).toBe('b.ts')
  })

  it('sorts by todos descending', () => {
    const result = rankFiles(testFiles, 'todos', 10, true)
    expect(result[0]!.relativePath).toBe('b.ts')
  })

  it('sorts ascending when descending is false', () => {
    const result = rankFiles(testFiles, 'size', 10, false)
    expect(result[0]!.relativePath).toBe('a.ts')
    expect(result[2]!.relativePath).toBe('b.ts')
  })

  it('respects count limit', () => {
    const result = rankFiles(testFiles, 'size', 2, true)
    expect(result).toHaveLength(2)
  })

  it('handles empty array', () => {
    const result = rankFiles([], 'size', 10, true)
    expect(result).toHaveLength(0)
  })

  it('handles count larger than array', () => {
    const result = rankFiles(testFiles, 'size', 100, true)
    expect(result).toHaveLength(3)
  })

  it('tiebreaks by relativePath', () => {
    const tied: FileMetric[] = [
      makeFileMetric({ relativePath: 'z.ts', size: 100 }),
      makeFileMetric({ relativePath: 'a.ts', size: 100 }),
    ]
    const result = rankFiles(tied, 'size', 10, true)
    expect(result[0]!.relativePath).toBe('a.ts')
    expect(result[1]!.relativePath).toBe('z.ts')
  })

  it('does not mutate input', () => {
    const copy = Array.from(testFiles)
    rankFiles(testFiles, 'size', 10, true)
    expect(testFiles).toEqual(copy)
  })
})

// ─── filterByExtension ──────────────────────────────────

describe('filterByExtension', () => {
  const testFiles: FileMetric[] = [
    makeFileMetric({ relativePath: 'a.ts', extension: '.ts' }),
    makeFileMetric({ relativePath: 'b.js', extension: '.js' }),
    makeFileMetric({ relativePath: 'c.tsx', extension: '.tsx' }),
    makeFileMetric({ relativePath: 'd.py', extension: '.py' }),
  ]

  it('filters by .ts extension', () => {
    const result = filterByExtension(testFiles, ['.ts'])
    expect(result).toHaveLength(1)
    expect(result[0]!.relativePath).toBe('a.ts')
  })

  it('filters by multiple extensions', () => {
    const result = filterByExtension(testFiles, ['.ts', '.tsx'])
    expect(result).toHaveLength(2)
  })

  it('filters by .js extension', () => {
    const result = filterByExtension(testFiles, ['.js'])
    expect(result).toHaveLength(1)
    expect(result[0]!.relativePath).toBe('b.js')
  })

  it('returns all files when extensions list is empty', () => {
    const result = filterByExtension(testFiles, [])
    expect(result).toHaveLength(4)
  })

  it('returns empty when no files match', () => {
    const result = filterByExtension(testFiles, ['.rs'])
    expect(result).toHaveLength(0)
  })

  it('handles case-insensitive extension matching', () => {
    const result = filterByExtension(testFiles, ['.TS'])
    expect(result).toHaveLength(1)
    expect(result[0]!.relativePath).toBe('a.ts')
  })
})

// ─── formatTopTable ─────────────────────────────────────

describe('formatTopTable', () => {
  it('contains header row with column names', () => {
    const result = makeTopResult()
    const output = formatTopTable(result)
    expect(output).toContain('Rank')
    expect(output).toContain('File')
    expect(output).toContain('Size')
    expect(output).toContain('Lines')
  })

  it('shows metric value header', () => {
    const result = makeTopResult()
    const output = formatTopTable(result)
    expect(output).toContain('Metric Value')
  })

  it('shows summary line with metric name', () => {
    const result = makeTopResult()
    const output = formatTopTable(result)
    expect(output).toContain('Top 1 of 20 files by size')
  })

  it('shows analyzed count', () => {
    const result = makeTopResult()
    const output = formatTopTable(result)
    expect(output).toContain('Analyzed 10 files')
  })

  it('handles empty files gracefully', () => {
    const result = makeTopResult({ files: [], totalAnalyzed: 0 })
    const output = formatTopTable(result)
    expect(output).toContain('No files found')
  })

  it('shows file paths in output', () => {
    const result = makeTopResult({
      files: [makeFileMetric({ relativePath: 'src/index.ts' })],
    })
    const output = formatTopTable(result)
    expect(output).toContain('src/index.ts')
  })

  it('shows multiple ranked files', () => {
    const result = makeTopResult({
      files: [
        makeFileMetric({ relativePath: 'big.ts', size: 1000 }),
        makeFileMetric({ relativePath: 'small.ts', size: 100 }),
      ],
    })
    const output = formatTopTable(result)
    expect(output).toContain('big.ts')
    expect(output).toContain('small.ts')
  })

  it('handles different metrics', () => {
    const result = makeTopResult({
      metric: 'complexity',
      files: [makeFileMetric({ relativePath: 'complex.ts', complexity: 42 })],
    })
    const output = formatTopTable(result)
    expect(output).toContain('complexity')
  })
})

// ─── formatTopCsv ───────────────────────────────────────

describe('formatTopCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeTopResult({ files: [] })
    const output = formatTopCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Rank,File,Value,Size,Lines,Extension')
  })

  it('includes data rows for files', () => {
    const result = makeTopResult({
      files: [makeFileMetric({ relativePath: 'src/file.ts', size: 256, extension: '.ts' })],
    })
    const output = formatTopCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines[1]).toContain('src/file.ts')
    expect(lines[1]).toContain('256')
  })

  it('escapes commas in file paths', () => {
    const result = makeTopResult({
      files: [makeFileMetric({ relativePath: 'path,with,comma.ts' })],
    })
    const output = formatTopCsv(result)
    expect(output).toContain('"path,with,comma.ts"')
  })

  it('handles empty files', () => {
    const result = makeTopResult({ files: [] })
    const output = formatTopCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(1)
    expect(lines[0]).toBe('Rank,File,Value,Size,Lines,Extension')
  })

  it('includes rank number', () => {
    const result = makeTopResult({
      files: [makeFileMetric({ relativePath: 'a.ts' }), makeFileMetric({ relativePath: 'b.ts' })],
    })
    const output = formatTopCsv(result)
    const lines = output.split('\n')
    expect(lines[1]).toContain('1')
    expect(lines[2]).toContain('2')
  })

  it('includes extension in output', () => {
    const result = makeTopResult({
      files: [makeFileMetric({ relativePath: 'test.py', extension: '.py' })],
    })
    const output = formatTopCsv(result)
    expect(output).toContain('.py')
  })
})

// ─── formatTopJson ──────────────────────────────────────

describe('formatTopJson', () => {
  it('produces valid JSON', () => {
    const result = makeTopResult()
    const output = formatTopJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains files array', () => {
    const result = makeTopResult()
    const output = formatTopJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains metric name', () => {
    const result = makeTopResult({ metric: 'complexity' })
    const output = formatTopJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.metric).toBe('complexity')
  })

  it('contains totalCount', () => {
    const result = makeTopResult({ totalCount: 42 })
    const output = formatTopJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalCount).toBe(42)
  })

  it('contains totalAnalyzed', () => {
    const result = makeTopResult({ totalAnalyzed: 25 })
    const output = formatTopJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalAnalyzed).toBe(25)
  })

  it('preserves file data accurately', () => {
    const result = makeTopResult({
      files: [makeFileMetric({ relativePath: 'test.rs', size: 1024, complexity: 8, todos: 3 })],
    })
    const output = formatTopJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files[0].relativePath).toBe('test.rs')
    expect(parsed.files[0].size).toBe(1024)
    expect(parsed.files[0].complexity).toBe(8)
    expect(parsed.files[0].todos).toBe(3)
  })

  it('handles empty files', () => {
    const result = makeTopResult({ files: [], totalAnalyzed: 0 })
    const output = formatTopJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(0)
  })
})
