import { describe, expect, it } from 'vitest'

import Count from '../src/commands/count.js'
import {
  aggregateByLanguage,
  calculateTotals,
  countLineTypes,
  detectLanguage,
  type LanguageStats,
  type PerFileStats,
  sortLanguages,
} from '../src/commands/count-helpers.js'
import { formatCountCsv, formatCountJson, formatCountTable } from '../src/commands/count-format-helpers.js'
import type { CountResult } from '../src/commands/count-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makePerFileStats(overrides: Partial<PerFileStats> = {}): PerFileStats {
  return {
    blank: 2,
    code: 10,
    comment: 3,
    filePath: 'test.ts',
    language: 'TypeScript',
    ...overrides,
  }
}

function makeLanguageStats(overrides: Partial<LanguageStats> = {}): LanguageStats {
  return {
    blank: 5,
    code: 50,
    comment: 15,
    files: 3,
    language: 'TypeScript',
    total: 70,
    ...overrides,
  }
}

function makeCountResult(overrides: Partial<CountResult> = {}): CountResult {
  return {
    languages: [makeLanguageStats()],
    totals: { blank: 5, code: 50, comment: 15, files: 3, total: 70 },
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Count command - static metadata', () => {
  it('has a description', () => {
    expect(Count.description).toBe('Count lines of code by language')
  })

  it('has examples array', () => {
    expect(Array.isArray(Count.examples)).toBe(true)
    expect(Count.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Count.args.path).toBeDefined()
    expect(Count.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Count.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Count command - flags', () => {
  it('has format flag with options', () => {
    expect(Count.flags.format.options).toContain('json')
    expect(Count.flags.format.options).toContain('table')
    expect(Count.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Count.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Count.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Count.flags.ignore).toBeDefined()
    expect(Count.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Count.flags.ext).toBeDefined()
  })

  it('has sort-by flag defaulting to code', () => {
    expect(Count.flags['sort-by'].default).toBe('code')
  })

  it('has sort-by options', () => {
    expect(Count.flags['sort-by'].options).toContain('code')
    expect(Count.flags['sort-by'].options).toContain('comment')
    expect(Count.flags['sort-by'].options).toContain('blank')
    expect(Count.flags['sort-by'].options).toContain('files')
    expect(Count.flags['sort-by'].options).toContain('language')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Count.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Count command - class structure', () => {
  it('exports a default class', () => {
    expect(Count).toBeDefined()
    expect(typeof Count).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Count.prototype.run).toBe('function')
  })
})

// ─── detectLanguage ─────────────────────────────────────

describe('detectLanguage', () => {
  it('detects TypeScript (.ts)', () => {
    expect(detectLanguage('file.ts')).toBe('TypeScript')
  })

  it('detects TypeScript (.tsx)', () => {
    expect(detectLanguage('file.tsx')).toBe('TypeScript')
  })

  it('detects JavaScript (.js)', () => {
    expect(detectLanguage('file.js')).toBe('JavaScript')
  })

  it('detects JavaScript (.jsx)', () => {
    expect(detectLanguage('file.jsx')).toBe('JavaScript')
  })

  it('detects JSON', () => {
    expect(detectLanguage('file.json')).toBe('JSON')
  })

  it('detects CSS', () => {
    expect(detectLanguage('file.css')).toBe('CSS')
  })

  it('detects HTML', () => {
    expect(detectLanguage('file.html')).toBe('HTML')
  })

  it('detects Markdown', () => {
    expect(detectLanguage('file.md')).toBe('Markdown')
  })

  it('detects Python', () => {
    expect(detectLanguage('file.py')).toBe('Python')
  })

  it('detects Rust', () => {
    expect(detectLanguage('file.rs')).toBe('Rust')
  })

  it('detects Go', () => {
    expect(detectLanguage('file.go')).toBe('Go')
  })

  it('detects Java', () => {
    expect(detectLanguage('file.java')).toBe('Java')
  })

  it('detects Ruby', () => {
    expect(detectLanguage('file.rb')).toBe('Ruby')
  })

  it('detects Shell', () => {
    expect(detectLanguage('file.sh')).toBe('Shell')
  })

  it('detects YAML (.yaml)', () => {
    expect(detectLanguage('file.yaml')).toBe('YAML')
  })

  it('detects YAML (.yml)', () => {
    expect(detectLanguage('file.yml')).toBe('YAML')
  })

  it('detects XML', () => {
    expect(detectLanguage('file.xml')).toBe('XML')
  })

  it('detects SQL', () => {
    expect(detectLanguage('file.sql')).toBe('SQL')
  })

  it('returns Unknown for unrecognized extensions', () => {
    expect(detectLanguage('file.xyz')).toBe('Unknown')
  })

  it('returns Unknown for no extension', () => {
    expect(detectLanguage('Makefile')).toBe('Unknown')
  })

  it('handles path with directories', () => {
    expect(detectLanguage('src/utils/helper.ts')).toBe('TypeScript')
  })
})

// ─── countLineTypes ─────────────────────────────────────

describe('countLineTypes', () => {
  it('counts blank lines only', () => {
    const content = '\n\n'
    const result = countLineTypes(content, 'TypeScript')
    expect(result.blank).toBe(3)
    expect(result.code).toBe(0)
    expect(result.comment).toBe(0)
  })

  it('counts code only (no comments)', () => {
    const content = 'const x = 1;\nconst y = 2;'
    const result = countLineTypes(content, 'TypeScript')
    expect(result.code).toBe(2)
    expect(result.comment).toBe(0)
    expect(result.blank).toBe(0)
  })

  it('counts JS/TS single-line comments', () => {
    const content = '// comment\nconst x = 1;'
    const result = countLineTypes(content, 'TypeScript')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts JS/TS block comments', () => {
    const content = '/* block comment */\nconst x = 1;'
    const result = countLineTypes(content, 'TypeScript')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts multi-line block comments', () => {
    const content = '/* line1\nline2\nline3 */\nconst x = 1;'
    const result = countLineTypes(content, 'TypeScript')
    expect(result.comment).toBe(3)
    expect(result.code).toBe(1)
  })

  it('counts Python comments', () => {
    const content = '# comment\nx = 1'
    const result = countLineTypes(content, 'Python')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts HTML comments', () => {
    const content = '<!-- comment -->\n<div>hello</div>'
    const result = countLineTypes(content, 'HTML')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts multi-line HTML comments', () => {
    const content = '<!-- comment\nline2\nline3 -->\n<div>hello</div>'
    const result = countLineTypes(content, 'HTML')
    expect(result.comment).toBe(3)
    expect(result.code).toBe(1)
  })

  it('counts SQL comments', () => {
    const content = '-- comment\nSELECT * FROM users;'
    const result = countLineTypes(content, 'SQL')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts Shell comments', () => {
    const content = '#!/bin/bash\necho hello'
    const result = countLineTypes(content, 'Shell')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts Ruby comments', () => {
    const content = '# comment\nputs "hello"'
    const result = countLineTypes(content, 'Ruby')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts YAML comments', () => {
    const content = '# config\nkey: value'
    const result = countLineTypes(content, 'YAML')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('treats mixed code+comment as code', () => {
    const content = 'const x = 1; // inline comment'
    const result = countLineTypes(content, 'TypeScript')
    expect(result.code).toBe(1)
    expect(result.comment).toBe(0)
  })

  it('handles empty string', () => {
    const result = countLineTypes('', 'TypeScript')
    expect(result.blank).toBe(0)
    expect(result.code).toBe(0)
    expect(result.comment).toBe(0)
  })

  it('handles single code line', () => {
    const result = countLineTypes('const x = 1;', 'TypeScript')
    expect(result.code).toBe(1)
    expect(result.blank).toBe(0)
    expect(result.comment).toBe(0)
  })

  it('treats JSON as all code', () => {
    const content = '{\n  "key": "value"\n}'
    const result = countLineTypes(content, 'JSON')
    expect(result.code).toBe(3)
    expect(result.comment).toBe(0)
  })

  it('treats Markdown as all code', () => {
    const content = '# Title\nSome text'
    const result = countLineTypes(content, 'Markdown')
    expect(result.code).toBe(2)
    expect(result.comment).toBe(0)
  })

  it('handles Rust comments', () => {
    const content = '// rust comment\nfn main() {}'
    const result = countLineTypes(content, 'Rust')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('handles Go comments', () => {
    const content = '// go comment\npackage main'
    const result = countLineTypes(content, 'Go')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('handles Java comments', () => {
    const content = '// java comment\npublic class Main {}'
    const result = countLineTypes(content, 'Java')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('handles CSS comments', () => {
    const content = '/* css comment */\n.foo { color: red; }'
    const result = countLineTypes(content, 'CSS')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('handles XML comments', () => {
    const content = '<!-- xml comment -->\n<root/>'
    const result = countLineTypes(content, 'XML')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })
})

// ─── aggregateByLanguage ────────────────────────────────

describe('aggregateByLanguage', () => {
  it('groups by language', () => {
    const stats: PerFileStats[] = [
      makePerFileStats({ language: 'TypeScript', code: 10 }),
      makePerFileStats({ language: 'TypeScript', code: 20 }),
      makePerFileStats({ language: 'JavaScript', code: 5 }),
    ]
    const result = aggregateByLanguage(stats)
    expect(result).toHaveLength(2)
  })

  it('sums stats per language', () => {
    const stats: PerFileStats[] = [
      makePerFileStats({ language: 'TypeScript', code: 10, comment: 2, blank: 1 }),
      makePerFileStats({ language: 'TypeScript', code: 20, comment: 3, blank: 2 }),
    ]
    const result = aggregateByLanguage(stats)
    const ts = result.find((l) => l.language === 'TypeScript')
    expect(ts).toBeDefined()
    expect(ts!.files).toBe(2)
    expect(ts!.code).toBe(30)
    expect(ts!.comment).toBe(5)
    expect(ts!.blank).toBe(3)
    expect(ts!.total).toBe(38)
  })

  it('handles empty array', () => {
    const result = aggregateByLanguage([])
    expect(result).toHaveLength(0)
  })

  it('handles single file', () => {
    const stats: PerFileStats[] = [
      makePerFileStats({ language: 'Python', code: 5, comment: 1, blank: 2 }),
    ]
    const result = aggregateByLanguage(stats)
    expect(result).toHaveLength(1)
    expect(result[0]!.language).toBe('Python')
    expect(result[0]!.files).toBe(1)
  })
})

// ─── sortLanguages ──────────────────────────────────────

describe('sortLanguages', () => {
  const testData: LanguageStats[] = [
    makeLanguageStats({ language: 'Python', code: 100, files: 5 }),
    makeLanguageStats({ language: 'TypeScript', code: 200, files: 10 }),
    makeLanguageStats({ language: 'Rust', code: 50, files: 3 }),
  ]

  it('sorts by code descending', () => {
    const result = sortLanguages(testData, 'code')
    expect(result[0]!.language).toBe('TypeScript')
    expect(result[1]!.language).toBe('Python')
    expect(result[2]!.language).toBe('Rust')
  })

  it('sorts by files descending', () => {
    const result = sortLanguages(testData, 'files')
    expect(result[0]!.language).toBe('TypeScript')
  })

  it('sorts by language alphabetically', () => {
    const result = sortLanguages(testData, 'language')
    expect(result[0]!.language).toBe('Python')
    expect(result[1]!.language).toBe('Rust')
    expect(result[2]!.language).toBe('TypeScript')
  })

  it('sorts by comment descending', () => {
    const data: LanguageStats[] = [
      makeLanguageStats({ language: 'A', comment: 5 }),
      makeLanguageStats({ language: 'B', comment: 50 }),
    ]
    const result = sortLanguages(data, 'comment')
    expect(result[0]!.language).toBe('B')
  })

  it('sorts by blank descending', () => {
    const data: LanguageStats[] = [
      makeLanguageStats({ language: 'A', blank: 5 }),
      makeLanguageStats({ language: 'B', blank: 50 }),
    ]
    const result = sortLanguages(data, 'blank')
    expect(result[0]!.language).toBe('B')
  })

  it('tiebreaks by language name', () => {
    const data: LanguageStats[] = [
      makeLanguageStats({ language: 'Zebra', code: 100 }),
      makeLanguageStats({ language: 'Alpha', code: 100 }),
    ]
    const result = sortLanguages(data, 'code')
    expect(result[0]!.language).toBe('Alpha')
    expect(result[1]!.language).toBe('Zebra')
  })

  it('does not mutate input', () => {
    const data: LanguageStats[] = [
      makeLanguageStats({ language: 'B', code: 10 }),
      makeLanguageStats({ language: 'A', code: 20 }),
    ]
    const copy = [...data]
    sortLanguages(data, 'code')
    expect(data).toEqual(copy)
  })
})

// ─── calculateTotals ────────────────────────────────────

describe('calculateTotals', () => {
  it('sums all language stats', () => {
    const languages: LanguageStats[] = [
      makeLanguageStats({ code: 100, comment: 20, blank: 10, files: 5 }),
      makeLanguageStats({ code: 50, comment: 10, blank: 5, files: 3 }),
    ]
    const totals = calculateTotals(languages)
    expect(totals.code).toBe(150)
    expect(totals.comment).toBe(30)
    expect(totals.blank).toBe(15)
    expect(totals.files).toBe(8)
    expect(totals.total).toBe(195)
  })

  it('handles empty array', () => {
    const totals = calculateTotals([])
    expect(totals.code).toBe(0)
    expect(totals.comment).toBe(0)
    expect(totals.blank).toBe(0)
    expect(totals.files).toBe(0)
    expect(totals.total).toBe(0)
  })

  it('handles single language', () => {
    const languages: LanguageStats[] = [
      makeLanguageStats({ code: 42, comment: 7, blank: 3, files: 2 }),
    ]
    const totals = calculateTotals(languages)
    expect(totals.code).toBe(42)
    expect(totals.files).toBe(2)
    expect(totals.total).toBe(52)
  })
})

// ─── formatCountTable ───────────────────────────────────

describe('formatCountTable', () => {
  it('contains header row with column names', () => {
    const result = makeCountResult()
    const output = formatCountTable(result, false)
    expect(output).toContain('Language')
    expect(output).toContain('Files')
    expect(output).toContain('Code')
    expect(output).toContain('Comment')
    expect(output).toContain('Blank')
    expect(output).toContain('Total')
  })

  it('contains data rows for each language', () => {
    const result = makeCountResult({
      languages: [makeLanguageStats({ language: 'TypeScript', code: 100 })],
    })
    const output = formatCountTable(result, false)
    expect(output).toContain('TypeScript')
    expect(output).toContain('100')
  })

  it('contains totals row', () => {
    const result = makeCountResult()
    const output = formatCountTable(result, false)
    expect(output).toContain('Total')
  })

  it('shows per-file breakdown in verbose mode', () => {
    const result = makeCountResult({
      fileBreakdown: [makePerFileStats({ filePath: 'src/index.ts' })],
    })
    const output = formatCountTable(result, true)
    expect(output).toContain('src/index.ts')
    expect(output).toContain('Per-File Breakdown')
  })

  it('hides per-file breakdown in non-verbose mode', () => {
    const result = makeCountResult({
      fileBreakdown: [makePerFileStats({ filePath: 'src/index.ts' })],
    })
    const output = formatCountTable(result, false)
    expect(output).not.toContain('Per-File Breakdown')
  })

  it('handles empty languages', () => {
    const result = makeCountResult({
      languages: [],
      totals: { blank: 0, code: 0, comment: 0, files: 0, total: 0 },
    })
    const output = formatCountTable(result, false)
    expect(output).toContain('Language')
    expect(output).toContain('Total')
  })

  it('handles multiple languages', () => {
    const result = makeCountResult({
      languages: [
        makeLanguageStats({ language: 'TypeScript', code: 100 }),
        makeLanguageStats({ language: 'Python', code: 50 }),
      ],
    })
    const output = formatCountTable(result, false)
    expect(output).toContain('TypeScript')
    expect(output).toContain('Python')
  })
})

// ─── formatCountCsv ─────────────────────────────────────

describe('formatCountCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeCountResult({ languages: [] })
    const output = formatCountCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Language,Files,Code,Comment,Blank,Total')
  })

  it('includes data rows for languages', () => {
    const result = makeCountResult({
      languages: [makeLanguageStats({ language: 'TypeScript', files: 3, code: 50, comment: 15, blank: 5, total: 70 })],
    })
    const output = formatCountCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(3)
    expect(lines[1]).toContain('TypeScript')
  })

  it('includes totals row', () => {
    const result = makeCountResult()
    const output = formatCountCsv(result)
    const lines = output.split('\n')
    const lastDataLine = lines[lines.length - 1]
    expect(lastDataLine).toContain('Total')
  })

  it('escapes commas in language names', () => {
    const result = makeCountResult({
      languages: [makeLanguageStats({ language: 'C++,Objective-C' })],
    })
    const output = formatCountCsv(result)
    expect(output).toContain('"C++,Objective-C"')
  })

  it('handles empty languages', () => {
    const result = makeCountResult({
      languages: [],
      totals: { blank: 0, code: 0, comment: 0, files: 0, total: 0 },
    })
    const output = formatCountCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Language,Files,Code,Comment,Blank,Total')
    expect(lines[1]).toContain('Total')
  })
})

// ─── formatCountJson ────────────────────────────────────

describe('formatCountJson', () => {
  it('produces valid JSON', () => {
    const result = makeCountResult()
    const output = formatCountJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains languages array', () => {
    const result = makeCountResult()
    const output = formatCountJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.languages).toBeDefined()
    expect(Array.isArray(parsed.languages)).toBe(true)
  })

  it('contains totals object', () => {
    const result = makeCountResult()
    const output = formatCountJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totals).toBeDefined()
    expect(parsed.totals.code).toBe(50)
    expect(parsed.totals.files).toBe(3)
  })

  it('includes fileBreakdown when present', () => {
    const result = makeCountResult({
      fileBreakdown: [makePerFileStats()],
    })
    const output = formatCountJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.fileBreakdown).toBeDefined()
    expect(parsed.fileBreakdown).toHaveLength(1)
  })

  it('handles empty results', () => {
    const result = makeCountResult({
      languages: [],
      totals: { blank: 0, code: 0, comment: 0, files: 0, total: 0 },
    })
    const output = formatCountJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.languages).toHaveLength(0)
    expect(parsed.totals.code).toBe(0)
  })

  it('preserves language data accurately', () => {
    const result = makeCountResult({
      languages: [makeLanguageStats({ language: 'Rust', code: 42, comment: 7, blank: 3, files: 2, total: 52 })],
    })
    const output = formatCountJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.languages[0].language).toBe('Rust')
    expect(parsed.languages[0].code).toBe(42)
    expect(parsed.languages[0].comment).toBe(7)
  })
})
