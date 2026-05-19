import { describe, expect, it } from 'vitest'

import {
  analyzeNamingPatterns,
  buildTokenResult,
  countTokenFrequencies,
  detectNamingStyle,
  escapeRegex,
  extractCommentText,
  extractIdentifiers,
  extractStringText,
  extractTokens,
  findHapaxLegomena,
  generateRecommendations,
  getKeywordSet,
  inferTokenContext,
  isKeyword,
  type RawToken,
  type TokenAnalysisResult,
} from '../src/commands/tokens-helpers.js'

import {
  asciiBar,
  formatBreakdown,
  formatNamingPatterns,
  formatTokensCsv,
  formatTokensJson,
  formatTokensTable,
  formatTokenRow,
  namingStyleLabel,
  tokenTypeBadge,
} from '../src/commands/tokens-format-helpers.js'

// ─── Keyword Sets ─────────────────────────────────────────────────────────────

describe('getKeywordSet', () => {
  it('returns JS/TS keywords for .ts', () => {
    const set = getKeywordSet('foo.ts')
    expect(set.has('function')).toBe(true)
    expect(set.has('const')).toBe(true)
  })

  it('returns Python keywords for .py', () => {
    const set = getKeywordSet('foo.py')
    expect(set.has('def')).toBe(true)
    expect(set.has('lambda')).toBe(true)
  })

  it('returns Rust keywords for .rs', () => {
    const set = getKeywordSet('foo.rs')
    expect(set.has('fn')).toBe(true)
    expect(set.has('let')).toBe(true)
  })

  it('returns Go keywords for .go', () => {
    const set = getKeywordSet('foo.go')
    expect(set.has('func')).toBe(true)
    expect(set.has('go')).toBe(true)
  })

  it('defaults to JS/TS for unknown extensions', () => {
    const set = getKeywordSet('foo.xyz')
    expect(set.has('const')).toBe(true)
  })
})

describe('isKeyword', () => {
  it('identifies JS keywords', () => {
    expect(isKeyword('function', 'test.ts')).toBe(true)
    expect(isKeyword('hello', 'test.ts')).toBe(false)
  })

  it('identifies Python keywords', () => {
    expect(isKeyword('def', 'test.py')).toBe(true)
    expect(isKeyword('function', 'test.py')).toBe(false)
  })

  it('identifies Rust keywords', () => {
    expect(isKeyword('fn', 'test.rs')).toBe(true)
  })
})

// ─── Comment Extraction ───────────────────────────────────────────────────────

describe('extractCommentText', () => {
  it('extracts single-line comments', () => {
    const comments = extractCommentText('// hello world\nconst x = 1')
    expect(comments).toContain('hello world')
  })

  it('extracts multi-line comments', () => {
    const comments = extractCommentText('/* foo bar */')
    expect(comments.some((c) => c.includes('foo bar'))).toBe(true)
  })

  it('extracts hash comments', () => {
    const comments = extractCommentText('# python comment')
    expect(comments).toContain('python comment')
  })

  it('returns empty for no comments', () => {
    expect(extractCommentText('const x = 1')).toEqual([])
  })

  it('handles multiple comment types', () => {
    const code = '// line comment\n/* block comment */\n# hash comment'
    const comments = extractCommentText(code)
    expect(comments.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── String Extraction ────────────────────────────────────────────────────────

describe('extractStringText', () => {
  it('extracts double-quoted strings', () => {
    const strings = extractStringText('const x = "hello world"')
    expect(strings).toContain('hello world')
  })

  it('extracts single-quoted strings', () => {
    const strings = extractStringText("const y = 'foo bar'")
    expect(strings).toContain('foo bar')
  })

  it('extracts template literals', () => {
    const strings = extractStringText('const z = `hello there`')
    expect(strings).toContain('hello there')
  })

  it('returns empty for no strings', () => {
    expect(extractStringText('const x = 1')).toEqual([])
  })

  it('handles escaped quotes', () => {
    const strings = extractStringText('const x = "he said \\"hello\\""')
    expect(strings.some((s) => s.includes('hello'))).toBe(true)
  })
})

// ─── Identifier Extraction ────────────────────────────────────────────────────

describe('extractIdentifiers', () => {
  it('extracts identifiers from simple code', () => {
    const ids = extractIdentifiers('const foo = bar + baz', 'test.ts')
    const tokens = ids.map((i) => i.token)
    expect(tokens).toContain('foo')
    expect(tokens).toContain('bar')
    expect(tokens).toContain('baz')
  })

  it('excludes keywords', () => {
    const ids = extractIdentifiers('const x = 1', 'test.ts')
    const tokens = ids.map((i) => i.token)
    expect(tokens).not.toContain('const')
  })

  it('excludes single-char tokens', () => {
    const ids = extractIdentifiers('const x = 1', 'test.ts')
    const tokens = ids.map((i) => i.token)
    expect(tokens).not.toContain('x')
  })

  it('includes multi-char tokens', () => {
    const ids = extractIdentifiers('const name = "test"', 'test.ts')
    const tokens = ids.map((i) => i.token)
    expect(tokens).toContain('name')
  })
})

// ─── Token Context ────────────────────────────────────────────────────────────

describe('inferTokenContext', () => {
  it('detects function names', () => {
    expect(inferTokenContext('function foo() {}', 'foo')).toBe('function-name')
  })

  it('detects class names', () => {
    expect(inferTokenContext('class Foo {}', 'Foo')).toBe('class-name')
  })

  it('detects variables', () => {
    expect(inferTokenContext('const name = "test"', 'name')).toBe('variable')
  })

  it('detects let variables', () => {
    expect(inferTokenContext('let count = 0', 'count')).toBe('variable')
  })

  it('detects interface names', () => {
    expect(inferTokenContext('interface Config {}', 'Config')).toBe('interface-name')
  })

  it('detects type aliases', () => {
    expect(inferTokenContext('type Result = string', 'Result')).toBe('type-alias')
  })

  it('detects method calls', () => {
    expect(inferTokenContext('obj.parse(input)', 'parse')).toBe('method-call')
  })

  it('detects function calls', () => {
    expect(inferTokenContext('parse(input)', 'parse')).toBe('function-call')
  })

  it('defaults to reference', () => {
    expect(inferTokenContext('foo + bar', 'foo')).toBe('reference')
  })

  it('detects exports', () => {
    expect(inferTokenContext('export function run() {}', 'run')).toBe('export')
  })
})

// ─── Token Extraction ─────────────────────────────────────────────────────────

describe('extractTokens', () => {
  it('extracts identifiers', () => {
    const tokens = extractTokens('const name = value', 'test.ts')
    const identifiers = tokens.filter((t) => t.type === 'identifier')
    expect(identifiers.some((t) => t.token === 'name')).toBe(true)
    expect(identifiers.some((t) => t.token === 'value')).toBe(true)
  })

  it('extracts keywords', () => {
    const tokens = extractTokens('const x = 1', 'test.ts')
    const keywords = tokens.filter((t) => t.type === 'keyword')
    expect(keywords.some((t) => t.token === 'const')).toBe(true)
  })

  it('extracts string literals', () => {
    const tokens = extractTokens('const x = "hello world"', 'test.ts')
    const strings = tokens.filter((t) => t.type === 'string-literal')
    expect(strings.some((t) => t.token === 'hello')).toBe(true)
    expect(strings.some((t) => t.token === 'world')).toBe(true)
  })

  it('extracts comment words', () => {
    const tokens = extractTokens('// this is a comment', 'test.ts')
    const comments = tokens.filter((t) => t.type === 'comment-word')
    expect(comments.some((t) => t.token === 'comment')).toBe(true)
  })

  it('extracts from multi-line comments', () => {
    const tokens = extractTokens('/* important note */', 'test.ts')
    const comments = tokens.filter((t) => t.type === 'comment-word')
    expect(comments.some((t) => t.token === 'important')).toBe(true)
    expect(comments.some((t) => t.token === 'note')).toBe(true)
  })
})

// ─── Frequency Counting ───────────────────────────────────────────────────────

describe('countTokenFrequencies', () => {
  it('counts token frequencies', () => {
    const raw: RawToken[] = [
      { token: 'foo', type: 'identifier', context: 'variable', file: 'a.ts' },
      { token: 'foo', type: 'identifier', context: 'variable', file: 'a.ts' },
      { token: 'bar', type: 'identifier', context: 'variable', file: 'a.ts' },
    ]
    const entries = countTokenFrequencies(raw)
    const foo = entries.find((e) => e.token === 'foo')
    const bar = entries.find((e) => e.token === 'bar')
    expect(foo?.frequency).toBe(2)
    expect(bar?.frequency).toBe(1)
  })

  it('tracks file counts', () => {
    const raw: RawToken[] = [
      { token: 'x', type: 'identifier', context: 'variable', file: 'a.ts' },
      { token: 'x', type: 'identifier', context: 'variable', file: 'b.ts' },
    ]
    const entries = countTokenFrequencies(raw)
    const x = entries.find((e) => e.token === 'x')
    expect(x?.files).toBe(2)
  })

  it('tracks contexts', () => {
    const raw: RawToken[] = [
      { token: 'x', type: 'identifier', context: 'variable', file: 'a.ts' },
      { token: 'x', type: 'identifier', context: 'function-name', file: 'a.ts' },
    ]
    const entries = countTokenFrequencies(raw)
    const x = entries.find((e) => e.token === 'x')
    expect(x?.contexts).toContain('variable')
    expect(x?.contexts).toContain('function-name')
  })

  it('sorts by frequency descending', () => {
    const raw: RawToken[] = [
      { token: 'rare', type: 'identifier', context: 'variable', file: 'a.ts' },
      { token: 'common', type: 'identifier', context: 'variable', file: 'a.ts' },
      { token: 'common', type: 'identifier', context: 'variable', file: 'a.ts' },
    ]
    const entries = countTokenFrequencies(raw)
    expect(entries[0]?.token).toBe('common')
  })

  it('separates by type', () => {
    const raw: RawToken[] = [
      { token: 'x', type: 'identifier', context: 'variable', file: 'a.ts' },
      { token: 'x', type: 'keyword', context: 'keyword', file: 'a.ts' },
    ]
    const entries = countTokenFrequencies(raw)
    expect(entries.length).toBe(2)
  })

  it('returns empty for no tokens', () => {
    expect(countTokenFrequencies([])).toEqual([])
  })
})

// ─── Naming Style Detection ───────────────────────────────────────────────────

describe('detectNamingStyle', () => {
  it('detects camelCase', () => {
    expect(detectNamingStyle('myVariable')).toBe('camelCase')
  })

  it('detects PascalCase', () => {
    expect(detectNamingStyle('MyClass')).toBe('PascalCase')
  })

  it('detects snake_case', () => {
    expect(detectNamingStyle('my_var')).toBe('snake_case')
  })

  it('detects UPPER_SNAKE', () => {
    expect(detectNamingStyle('MAX_SIZE')).toBe('UPPER_SNAKE')
  })

  it('detects kebab-case', () => {
    expect(detectNamingStyle('my-component')).toBe('kebab-case')
  })

  it('returns null for simple words', () => {
    expect(detectNamingStyle('hello')).toBeNull()
  })

  it('returns null for all-lowercase no separators', () => {
    expect(detectNamingStyle('data')).toBeNull()
  })

  it('returns null for all-uppercase no separators', () => {
    expect(detectNamingStyle('ID')).toBeNull()
  })
})

// ─── Naming Pattern Analysis ──────────────────────────────────────────────────

describe('analyzeNamingPatterns', () => {
  it('counts naming patterns', () => {
    const patterns = analyzeNamingPatterns(['getConfig', 'MyClass', 'some_var', 'MAX_SIZE'])
    expect(patterns.length).toBe(4)
    const camel = patterns.find((p) => p.style === 'camelCase')
    expect(camel?.count).toBe(1)
  })

  it('calculates percentages', () => {
    const patterns = analyzeNamingPatterns(['getFoo', 'getBar', 'MyClass'])
    const total = patterns.reduce((sum, p) => sum + p.count, 0)
    expect(total).toBe(3)
    expect(patterns.every((p) => p.percentage > 0)).toBe(true)
  })

  it('limits examples to 5', () => {
    const ids = ['getConfig', 'setData', 'parseInput', 'formatOutput', 'buildResult', 'runTask']
    const patterns = analyzeNamingPatterns(ids)
    const camel = patterns.find((p) => p.style === 'camelCase')
    expect(camel?.examples.length).toBeLessThanOrEqual(5)
  })

  it('returns empty for no named identifiers', () => {
    expect(analyzeNamingPatterns(['hello', 'world'])).toEqual([])
  })

  it('sorts by count descending', () => {
    const ids = ['aaa', 'bbb', 'MyClass', 'OtherClass', 'ThirdClass']
    const patterns = analyzeNamingPatterns(ids)
    if (patterns.length >= 2) {
      expect(patterns[0].count).toBeGreaterThanOrEqual(patterns[1].count)
    }
  })
})

// ─── Hapax Legomena ───────────────────────────────────────────────────────────

describe('findHapaxLegomena', () => {
  it('counts single-occurrence tokens', () => {
    const entries = [
      { token: 'a', type: 'identifier' as const, frequency: 5, files: 1, contexts: [], averageLength: 1 },
      { token: 'b', type: 'identifier' as const, frequency: 1, files: 1, contexts: [], averageLength: 1 },
      { token: 'c', type: 'identifier' as const, frequency: 1, files: 1, contexts: [], averageLength: 1 },
    ]
    expect(findHapaxLegomena(entries)).toBe(2)
  })

  it('returns 0 when all appear multiple times', () => {
    const entries = [
      { token: 'a', type: 'identifier' as const, frequency: 5, files: 1, contexts: [], averageLength: 1 },
      { token: 'b', type: 'identifier' as const, frequency: 3, files: 1, contexts: [], averageLength: 1 },
    ]
    expect(findHapaxLegomena(entries)).toBe(0)
  })

  it('returns 0 for empty list', () => {
    expect(findHapaxLegomena([])).toBe(0)
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates healthy message when all good', () => {
    const result: TokenAnalysisResult = {
      topTokens: [],
      breakdown: { identifiers: 50, keywords: 20, stringLiterals: 10, commentWords: 5, total: 85 },
      namingPatterns: [{ style: 'camelCase', count: 50, percentage: 100, examples: ['foo'] }],
      vocabularySize: 30,
      avgTokenLength: 5,
      hapaxLegomena: 5,
      totalTokens: 85,
      files: 3,
      recommendations: [],
    }
    const recs = generateRecommendations(result)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })

  it('warns about mixed naming styles', () => {
    const result: TokenAnalysisResult = {
      topTokens: [],
      breakdown: { identifiers: 50, keywords: 20, stringLiterals: 10, commentWords: 5, total: 85 },
      namingPatterns: [
        { style: 'camelCase', count: 30, percentage: 60, examples: ['foo'] },
        { style: 'snake_case', count: 15, percentage: 30, examples: ['bar'] },
        { style: 'PascalCase', count: 5, percentage: 10, examples: ['Baz'] },
      ],
      vocabularySize: 30,
      avgTokenLength: 5,
      hapaxLegomena: 5,
      totalTokens: 85,
      files: 3,
      recommendations: [],
    }
    const recs = generateRecommendations(result)
    expect(recs.some((r) => r.includes('Mixed naming') || r.includes('standardizing'))).toBe(true)
  })

  it('warns about high hapax ratio', () => {
    const result: TokenAnalysisResult = {
      topTokens: [],
      breakdown: { identifiers: 10, keywords: 5, stringLiterals: 2, commentWords: 1, total: 18 },
      namingPatterns: [],
      vocabularySize: 10,
      avgTokenLength: 5,
      hapaxLegomena: 8,
      totalTokens: 18,
      files: 1,
      recommendations: [],
    }
    const recs = generateRecommendations(result)
    expect(recs.some((r) => r.includes('hapax') || r.includes('abstraction'))).toBe(true)
  })

  it('warns about many string literals', () => {
    const result: TokenAnalysisResult = {
      topTokens: [],
      breakdown: { identifiers: 10, keywords: 5, stringLiterals: 20, commentWords: 1, total: 36 },
      namingPatterns: [],
      vocabularySize: 15,
      avgTokenLength: 5,
      hapaxLegomena: 2,
      totalTokens: 36,
      files: 1,
      recommendations: [],
    }
    const recs = generateRecommendations(result)
    expect(recs.some((r) => r.includes('string literals') || r.includes('constants'))).toBe(true)
  })

  it('warns about many comment words', () => {
    const result: TokenAnalysisResult = {
      topTokens: [],
      breakdown: { identifiers: 10, keywords: 5, stringLiterals: 2, commentWords: 15, total: 32 },
      namingPatterns: [],
      vocabularySize: 15,
      avgTokenLength: 5,
      hapaxLegomena: 2,
      totalTokens: 32,
      files: 1,
      recommendations: [],
    }
    const recs = generateRecommendations(result)
    expect(recs.some((r) => r.includes('comment') || r.includes('Comment'))).toBe(true)
  })
})

// ─── Build Token Result ───────────────────────────────────────────────────────

describe('buildTokenResult', () => {
  const sampleCode = `import { Command } from '@oclif/core'
import ora from 'ora'

export function formatOutput(data: string): string {
  if (!data) return ''
  return data.trim()
}

export class MyCommand extends Command {
  async run() {
    const spinner = ora('Loading').start()
    spinner.succeed('Done')
  }
}
`

  it('builds complete result', () => {
    const result = buildTokenResult(['test.ts'], [sampleCode], {})
    expect(result.files).toBe(1)
    expect(result.totalTokens).toBeGreaterThan(0)
    expect(result.vocabularySize).toBeGreaterThan(0)
    expect(result.topTokens.length).toBeGreaterThan(0)
    expect(result.breakdown.total).toBeGreaterThan(0)
  })

  it('respects top option', () => {
    const result = buildTokenResult(['test.ts'], [sampleCode], { top: 3 })
    expect(result.topTokens.length).toBeLessThanOrEqual(3)
  })

  it('respects min-length option', () => {
    const result = buildTokenResult(['test.ts'], [sampleCode], { minLength: 8 })
    const allLong = result.topTokens.every((t) => t.token.length >= 8)
    expect(allLong).toBe(true)
  })

  it('filters by type', () => {
    const result = buildTokenResult(['test.ts'], [sampleCode], { type: 'keyword' })
    const allKeywords = result.topTokens.every((t) => t.type === 'keyword')
    expect(allKeywords).toBe(true)
  })

  it('analyzes naming patterns', () => {
    const result = buildTokenResult(['test.ts'], [sampleCode], {})
    expect(result.namingPatterns.length).toBeGreaterThan(0)
  })

  it('computes average token length', () => {
    const result = buildTokenResult(['test.ts'], [sampleCode], {})
    expect(result.avgTokenLength).toBeGreaterThan(0)
  })

  it('handles multiple files', () => {
    const result = buildTokenResult(
      ['a.ts', 'b.ts'],
      ['const foo = 1', 'const bar = 2'],
      {},
    )
    expect(result.files).toBe(2)
  })

  it('handles empty files', () => {
    const result = buildTokenResult(['empty.ts'], [''], {})
    expect(result.totalTokens).toBe(0)
    expect(result.vocabularySize).toBe(0)
  })

  it('generates recommendations', () => {
    const result = buildTokenResult(['test.ts'], [sampleCode], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Escape Regex ─────────────────────────────────────────────────────────────

describe('escapeRegex', () => {
  it('escapes special chars', () => {
    expect(escapeRegex('foo.bar')).toBe('foo\\.bar')
    expect(escapeRegex('a+b')).toBe('a\\+b')
  })

  it('returns plain strings unchanged', () => {
    expect(escapeRegex('hello')).toBe('hello')
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatTokensJson', () => {
  it('produces valid JSON', () => {
    const result = buildTokenResult(['test.ts'], ['const foo = 1'], {})
    const json = formatTokensJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.files).toBe(1)
  })
})

describe('formatTokensCsv', () => {
  it('produces CSV with header', () => {
    const result = buildTokenResult(['test.ts'], ['const foo = bar'], {})
    const csv = formatTokensCsv(result)
    expect(csv.split('\n')[0]).toContain('token,type,frequency')
  })
})

describe('formatTokensTable', () => {
  it('produces table output', () => {
    const result = buildTokenResult(['test.ts'], ['const foo = bar'], {})
    const table = formatTokensTable(result)
    expect(table).toContain('Token Frequency')
    expect(table).toContain('Overview')
  })

  it('shows recommendations in verbose mode', () => {
    const code = 'const foo = bar\nconst baz = qux'
    const result = buildTokenResult(['test.ts'], [code], { verbose: true })
    const table = formatTokensTable(result, true)
    expect(table).toContain('Recommendations')
  })
})

describe('formatTokenRow', () => {
  it('formats a row', () => {
    const entry = { token: 'config', type: 'identifier' as const, frequency: 23, files: 5, contexts: ['variable'], averageLength: 6 }
    const row = formatTokenRow(entry, 23)
    expect(row).toContain('config')
  })
})

describe('formatBreakdown', () => {
  it('formats breakdown section', () => {
    const bd = { identifiers: 100, keywords: 50, stringLiterals: 30, commentWords: 20, total: 200 }
    const result = formatBreakdown(bd)
    expect(result).toContain('100')
    expect(result).toContain('Identifiers')
  })
})

describe('formatNamingPatterns', () => {
  it('formats naming patterns', () => {
    const patterns = [{ style: 'camelCase' as const, count: 50, percentage: 80, examples: ['getConfig'] }]
    const result = formatNamingPatterns(patterns)
    expect(result).toContain('camelCase')
  })

  it('handles empty patterns', () => {
    const result = formatNamingPatterns([])
    expect(result).toContain('No named')
  })
})

describe('asciiBar', () => {
  it('generates bar for full value', () => {
    const bar = asciiBar(10, 10, 10)
    expect(typeof bar).toBe('string')
    expect(bar.length).toBeGreaterThan(0)
  })

  it('generates bar for half value', () => {
    const bar = asciiBar(5, 10, 10)
    expect(typeof bar).toBe('string')
  })

  it('handles zero value', () => {
    const bar = asciiBar(0, 10, 10)
    expect(typeof bar).toBe('string')
  })
})

describe('tokenTypeBadge', () => {
  it('returns badge for each type', () => {
    expect(typeof tokenTypeBadge('identifier')).toBe('string')
    expect(typeof tokenTypeBadge('keyword')).toBe('string')
    expect(typeof tokenTypeBadge('string-literal')).toBe('string')
    expect(typeof tokenTypeBadge('comment-word')).toBe('string')
    expect(typeof tokenTypeBadge('unknown')).toBe('string')
  })
})

describe('namingStyleLabel', () => {
  it('returns label for each style', () => {
    expect(typeof namingStyleLabel('camelCase')).toBe('string')
    expect(typeof namingStyleLabel('PascalCase')).toBe('string')
    expect(typeof namingStyleLabel('snake_case')).toBe('string')
    expect(typeof namingStyleLabel('UPPER_SNAKE')).toBe('string')
    expect(typeof namingStyleLabel('kebab-case')).toBe('string')
  })
})
