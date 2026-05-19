import { describe, expect, it } from 'vitest'

import Search from '../src/commands/search.js'
import {
  aggregateResults,
  type FileResult,
  getMatchMarkers,
  highlightMatch,
  searchInContent,
  type SearchMatch,
  type SearchResult,
} from '../src/commands/search-helpers.js'
import { formatSearchCsv, formatSearchJson, formatSearchText } from '../src/commands/search-format-helpers.js'

// ─── Test data helpers ────────────────────────────────────

function makeSearchMatch(overrides: Partial<SearchMatch> = {}): SearchMatch {
  return {
    column: 1,
    context: { after: [], before: [] },
    line: 1,
    text: 'hello world',
    ...overrides,
  }
}

function makeFileResult(overrides: Partial<FileResult> = {}): FileResult {
  return {
    filePath: '/abs/test.ts',
    matches: [makeSearchMatch()],
    relativePath: 'test.ts',
    totalMatches: 1,
    ...overrides,
  }
}

function makeSearchResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    files: [makeFileResult()],
    filesWithMatches: 1,
    pattern: 'hello',
    totalFiles: 1,
    totalMatches: 1,
    ...overrides,
  }
}

const defaultOptions = { caseSensitive: false, contextLines: 2, maxMatches: 0 }
const sensitiveOptions = { caseSensitive: true, contextLines: 2, maxMatches: 0 }

// ─── Static metadata ──────────────────────────────────────

describe('Search command - static metadata', () => {
  it('has a description', () => {
    expect(Search.description).toBe('Search across source files using regex patterns')
  })

  it('has examples array', () => {
    expect(Array.isArray(Search.examples)).toBe(true)
    expect(Search.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has pattern arg as required', () => {
    expect(Search.args.pattern).toBeDefined()
    expect(Search.args.pattern.required).toBe(true)
  })

  it('has path arg as optional', () => {
    expect(Search.args.path).toBeDefined()
    expect(Search.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Search.args.path.default).toBe('.')
  })
})

// ─── Flags ────────────────────────────────────────────────

describe('Search command - flags', () => {
  it('has format flag with options', () => {
    expect(Search.flags.format.options).toContain('json')
    expect(Search.flags.format.options).toContain('text')
    expect(Search.flags.format.options).toContain('csv')
  })

  it('defaults format to text', () => {
    expect(Search.flags.format.default).toBe('text')
  })

  it('has output flag', () => {
    expect(Search.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Search.flags.ignore).toBeDefined()
    expect(Search.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag defaulting to common extensions', () => {
    expect(Search.flags.ext).toBeDefined()
    expect(Search.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has context flag defaulting to 2', () => {
    expect(Search.flags.context.default).toBe(2)
  })

  it('has max-count flag defaulting to 0', () => {
    expect(Search.flags['max-count'].default).toBe(0)
  })

  it('has case-sensitive flag defaulting to false', () => {
    expect(Search.flags['case-sensitive'].default).toBe(false)
  })

  it('has files-with-matches flag defaulting to false', () => {
    expect(Search.flags['files-with-matches'].default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Search.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ──────────────────────────────────────

describe('Search command - class structure', () => {
  it('exports a default class', () => {
    expect(Search).toBeDefined()
    expect(typeof Search).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Search.prototype.run).toBe('function')
  })
})

// ─── searchInContent ──────────────────────────────────────

describe('searchInContent', () => {
  it('finds simple string match', () => {
    const matches = searchInContent('hello world', 'hello', defaultOptions)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.line).toBe(1)
    expect(matches[0]!.column).toBe(1)
    expect(matches[0]!.text).toBe('hello world')
  })

  it('finds regex match for function declarations', () => {
    const content = 'function foo() {}\nconst x = 1;\nfunction bar() {}'
    const matches = searchInContent(content, 'function\\s+\\w+', defaultOptions)
    expect(matches).toHaveLength(2)
    expect(matches[0]!.line).toBe(1)
    expect(matches[1]!.line).toBe(3)
  })

  it('matches case insensitive by default', () => {
    const matches = searchInContent('Hello World', 'hello', defaultOptions)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.column).toBe(1)
  })

  it('respects case sensitive flag', () => {
    const matches = searchInContent('Hello World', 'hello', sensitiveOptions)
    expect(matches).toHaveLength(0)
  })

  it('returns empty for no matches', () => {
    const matches = searchInContent('hello world', 'xyz', defaultOptions)
    expect(matches).toHaveLength(0)
  })

  it('returns correct context lines', () => {
    const content = 'line1\nline2\nline3 match\nline4\nline5'
    const matches = searchInContent(content, 'match', { caseSensitive: false, contextLines: 1, maxMatches: 0 })
    expect(matches).toHaveLength(1)
    expect(matches[0]!.context.before).toEqual(['line2'])
    expect(matches[0]!.context.after).toEqual(['line4'])
  })

  it('returns empty context when no surrounding lines', () => {
    const matches = searchInContent('match', 'match', { caseSensitive: false, contextLines: 2, maxMatches: 0 })
    expect(matches).toHaveLength(1)
    expect(matches[0]!.context.before).toEqual([])
    expect(matches[0]!.context.after).toEqual([])
  })

  it('respects max matches limit', () => {
    const content = 'aaa\naaa\naaa\naaa'
    const matches = searchInContent(content, 'aaa', { caseSensitive: false, contextLines: 0, maxMatches: 2 })
    expect(matches).toHaveLength(2)
  })

  it('handles invalid regex gracefully', () => {
    const matches = searchInContent('hello', '([invalid', defaultOptions)
    expect(matches).toHaveLength(0)
  })

  it('finds multiple matches per line', () => {
    const matches = searchInContent('aa aa aa', 'aa', { caseSensitive: false, contextLines: 0, maxMatches: 0 })
    expect(matches).toHaveLength(3)
    expect(matches[0]!.column).toBe(1)
    expect(matches[1]!.column).toBe(4)
    expect(matches[2]!.column).toBe(7)
  })

  it('handles empty content', () => {
    const matches = searchInContent('', 'hello', defaultOptions)
    expect(matches).toHaveLength(0)
  })

  it('handles empty pattern', () => {
    const matches = searchInContent('hello', '', defaultOptions)
    expect(matches).toHaveLength(0)
  })

  it('computes correct line numbers', () => {
    const content = 'line1\nline2\nline3\nmatch here'
    const matches = searchInContent(content, 'match', defaultOptions)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.line).toBe(4)
  })

  it('computes correct column numbers', () => {
    const content = '  hello world'
    const matches = searchInContent(content, 'hello', defaultOptions)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.column).toBe(3)
  })

  it('handles maxMatches of zero as unlimited', () => {
    const content = 'aaa\naaa\naaa'
    const matches = searchInContent(content, 'aaa', { caseSensitive: false, contextLines: 0, maxMatches: 0 })
    expect(matches).toHaveLength(3)
  })

  it('clamps context to file boundaries', () => {
    const content = 'first line\nmatch line'
    const matches = searchInContent(content, 'match', { caseSensitive: false, contextLines: 5, maxMatches: 0 })
    expect(matches).toHaveLength(1)
    expect(matches[0]!.context.before).toEqual(['first line'])
    expect(matches[0]!.context.after).toEqual([])
  })
})

// ─── aggregateResults ─────────────────────────────────────

describe('aggregateResults', () => {
  it('computes correct totals from multiple files', () => {
    const fileResults: FileResult[] = [
      makeFileResult({ totalMatches: 3 }),
      makeFileResult({ totalMatches: 5 }),
    ]
    const result = aggregateResults(fileResults, 'test')
    expect(result.totalMatches).toBe(8)
    expect(result.filesWithMatches).toBe(2)
    expect(result.totalFiles).toBe(2)
  })

  it('handles empty results', () => {
    const result = aggregateResults([], 'test')
    expect(result.totalMatches).toBe(0)
    expect(result.filesWithMatches).toBe(0)
    expect(result.totalFiles).toBe(0)
  })

  it('preserves pattern string', () => {
    const result = aggregateResults([], 'TODO')
    expect(result.pattern).toBe('TODO')
  })

  it('preserves file results', () => {
    const fileResults = [makeFileResult({ relativePath: 'a.ts' })]
    const result = aggregateResults(fileResults, 'test')
    expect(result.files).toBe(fileResults)
  })
})

// ─── highlightMatch ───────────────────────────────────────

describe('highlightMatch', () => {
  it('wraps matched portion with markers', () => {
    const markers = getMatchMarkers()
    const result = highlightMatch('hello world', 0, 5)
    expect(result).toBe(`${markers.start}hello${markers.end} world`)
  })

  it('handles match at end of string', () => {
    const markers = getMatchMarkers()
    const result = highlightMatch('hello world', 6, 11)
    expect(result).toBe(`hello ${markers.start}world${markers.end}`)
  })

  it('handles match in middle of string', () => {
    const markers = getMatchMarkers()
    const result = highlightMatch('abcXYZdef', 3, 6)
    expect(result).toBe(`abc${markers.start}XYZ${markers.end}def`)
  })

  it('handles full string match', () => {
    const markers = getMatchMarkers()
    const result = highlightMatch('hello', 0, 5)
    expect(result).toBe(`${markers.start}hello${markers.end}`)
  })
})

// ─── formatSearchText ─────────────────────────────────────

describe('formatSearchText', () => {
  it('shows filename header', () => {
    const result = makeSearchResult({
      files: [makeFileResult({ relativePath: 'src/index.ts' })],
    })
    const output = formatSearchText(result, { filesWithMatchesOnly: false })
    expect(output).toContain('src/index.ts')
  })

  it('shows match line info', () => {
    const result = makeSearchResult({
      files: [makeFileResult({ matches: [makeSearchMatch({ line: 5, column: 3, text: 'hello' })] })],
    })
    const output = formatSearchText(result, { filesWithMatchesOnly: false })
    expect(output).toContain('5:3')
  })

  it('shows summary line', () => {
    const result = makeSearchResult({
      filesWithMatches: 2,
      totalMatches: 5,
    })
    const output = formatSearchText(result, { filesWithMatchesOnly: false })
    expect(output).toContain('Found 5 matches in 2 files')
  })

  it('shows only filenames in files-with-matches mode', () => {
    const result = makeSearchResult({
      files: [
        makeFileResult({ relativePath: 'a.ts' }),
        makeFileResult({ relativePath: 'b.ts' }),
      ],
    })
    const output = formatSearchText(result, { filesWithMatchesOnly: true })
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
    expect(output).not.toContain('Found')
  })

  it('handles empty results', () => {
    const result = makeSearchResult({
      files: [],
      filesWithMatches: 0,
      totalMatches: 0,
    })
    const output = formatSearchText(result, { filesWithMatchesOnly: false })
    expect(output).toContain('Found 0 matches in 0 files')
  })

  it('shows context lines', () => {
    const result = makeSearchResult({
      files: [makeFileResult({
        matches: [makeSearchMatch({
          context: { after: ['after line'], before: ['before line'] },
          line: 1,
          text: 'match',
        })],
      })],
    })
    const output = formatSearchText(result, { filesWithMatchesOnly: false })
    expect(output).toContain('before line')
    expect(output).toContain('after line')
  })
})

// ─── formatSearchCsv ──────────────────────────────────────

describe('formatSearchCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeSearchResult({ files: [] })
    const output = formatSearchCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('File,Line,Column,Match Text')
  })

  it('includes data rows', () => {
    const result = makeSearchResult({
      files: [makeFileResult({
        matches: [makeSearchMatch({ column: 5, line: 10, text: 'TODO fix this' })],
        relativePath: 'src/app.ts',
      })],
    })
    const output = formatSearchCsv(result)
    expect(output).toContain('src/app.ts')
    expect(output).toContain('10')
    expect(output).toContain('5')
    expect(output).toContain('TODO fix this')
  })

  it('escapes commas in match text', () => {
    const result = makeSearchResult({
      files: [makeFileResult({
        matches: [makeSearchMatch({ text: 'has,comma' })],
      })],
    })
    const output = formatSearchCsv(result)
    expect(output).toContain('"has,comma"')
  })

  it('handles empty results', () => {
    const result = makeSearchResult({ files: [], totalMatches: 0 })
    const output = formatSearchCsv(result)
    const lines = output.split('\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('File,Line,Column,Match Text')
  })

  it('handles multiple files', () => {
    const result = makeSearchResult({
      files: [
        makeFileResult({ relativePath: 'a.ts', matches: [makeSearchMatch()] }),
        makeFileResult({ relativePath: 'b.ts', matches: [makeSearchMatch()] }),
      ],
    })
    const output = formatSearchCsv(result)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

// ─── formatSearchJson ─────────────────────────────────────

describe('formatSearchJson', () => {
  it('produces valid JSON', () => {
    const result = makeSearchResult()
    const output = formatSearchJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains files array', () => {
    const result = makeSearchResult()
    const output = formatSearchJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains pattern string', () => {
    const result = makeSearchResult({ pattern: 'TODO' })
    const output = formatSearchJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.pattern).toBe('TODO')
  })

  it('contains total counts', () => {
    const result = makeSearchResult({ totalMatches: 10, filesWithMatches: 3 })
    const output = formatSearchJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalMatches).toBe(10)
    expect(parsed.filesWithMatches).toBe(3)
  })

  it('preserves match details', () => {
    const result = makeSearchResult({
      files: [makeFileResult({
        matches: [makeSearchMatch({ column: 5, line: 10, text: 'match text' })],
        relativePath: 'src/app.ts',
      })],
    })
    const output = formatSearchJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files[0].matches[0].line).toBe(10)
    expect(parsed.files[0].matches[0].column).toBe(5)
    expect(parsed.files[0].matches[0].text).toBe('match text')
    expect(parsed.files[0].relativePath).toBe('src/app.ts')
  })

  it('handles empty results', () => {
    const result = makeSearchResult({ files: [], totalFiles: 0, totalMatches: 0, filesWithMatches: 0 })
    const output = formatSearchJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(0)
    expect(parsed.totalMatches).toBe(0)
  })

  it('is pretty-printed', () => {
    const result = makeSearchResult()
    const output = formatSearchJson(result)
    expect(output).toContain('\n')
    expect(output).toContain('  ')
  })
})
