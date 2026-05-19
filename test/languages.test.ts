import { describe, it, expect } from 'vitest'

import {
  getLanguageMap,
  detectLanguage,
  countLines,
  analyzeLanguage,
  computeLanguageStats,
  suggestTooling,
  buildLanguagesResult,
  type FileAnalysis,
  type LanguageInfo,
  type LanguagesResult,
} from '../src/commands/languages-helpers.js'

import {
  percentageBar,
  formatLanguagesTable,
  formatLanguagesJson,
} from '../src/commands/languages-format-helpers.js'

import Languages from '../src/commands/languages.js'

// ─── getLanguageMap ──────────────────────────────────────

describe('getLanguageMap', () => {
  it('should return 29 language entries', () => {
    expect(getLanguageMap()).toHaveLength(29)
  })

  it('should include TypeScript', () => {
    expect(getLanguageMap().some((l) => l.name === 'TypeScript')).toBe(true)
  })

  it('should include Python', () => {
    expect(getLanguageMap().some((l) => l.name === 'Python')).toBe(true)
  })

  it('should include Rust', () => {
    expect(getLanguageMap().some((l) => l.name === 'Rust')).toBe(true)
  })

  it('should include Zig', () => {
    expect(getLanguageMap().some((l) => l.name === 'Zig')).toBe(true)
  })
})

// ─── detectLanguage ─────────────────────────────────────

describe('detectLanguage', () => {
  it('should detect TypeScript from .ts', () => {
    expect(detectLanguage('app.ts')).toBe('TypeScript')
  })

  it('should detect TypeScript from .tsx', () => {
    expect(detectLanguage('comp.tsx')).toBe('TypeScript')
  })

  it('should detect JavaScript from .js', () => {
    expect(detectLanguage('index.js')).toBe('JavaScript')
  })

  it('should detect Python from .py', () => {
    expect(detectLanguage('main.py')).toBe('Python')
  })

  it('should detect Rust from .rs', () => {
    expect(detectLanguage('lib.rs')).toBe('Rust')
  })

  it('should detect Go from .go', () => {
    expect(detectLanguage('main.go')).toBe('Go')
  })

  it('should detect CSS from .css', () => {
    expect(detectLanguage('style.css')).toBe('CSS')
  })

  it('should detect HTML from .html', () => {
    expect(detectLanguage('page.html')).toBe('HTML')
  })

  it('should detect JSON from .json', () => {
    expect(detectLanguage('package.json')).toBe('JSON')
  })

  it('should detect Markdown from .md', () => {
    expect(detectLanguage('README.md')).toBe('Markdown')
  })

  it('should detect Shell from .sh', () => {
    expect(detectLanguage('run.sh')).toBe('Shell')
  })

  it('should detect YAML from .yml', () => {
    expect(detectLanguage('config.yml')).toBe('YAML')
  })

  it('should detect Java from .java', () => {
    expect(detectLanguage('App.java')).toBe('Java')
  })

  it('should detect C from .c', () => {
    expect(detectLanguage('main.c')).toBe('C')
  })

  it('should detect Vue from .vue', () => {
    expect(detectLanguage('App.vue')).toBe('Vue')
  })

  it('should detect Svelte from .svelte', () => {
    expect(detectLanguage('Button.svelte')).toBe('Svelte')
  })

  it('should return Unknown for unrecognized extensions', () => {
    expect(detectLanguage('data.xyz')).toBe('Unknown')
  })

  it('should return Unknown for files with no extension', () => {
    expect(detectLanguage('Makefile')).toBe('Unknown')
  })
})

// ─── countLines ─────────────────────────────────────────

describe('countLines', () => {
  it('should count code lines in c-style', () => {
    const result = countLines('const x = 1\nconst y = 2\n', 'c-style')
    expect(result.code).toBe(2)
  })

  it('should count single-line comments in c-style', () => {
    const result = countLines('// comment\nconst x = 1\n', 'c-style')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('should count blank lines', () => {
    const result = countLines('const x = 1\n\nconst y = 2\n', 'c-style')
    expect(result.blank).toBe(2)
  })

  it('should count hash comments', () => {
    const result = countLines('# comment\nx = 1\n', 'hash')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('should count HTML comments', () => {
    const result = countLines('<!-- comment -->\n<div></div>\n', 'html')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('should count SQL comments', () => {
    const result = countLines('-- comment\nSELECT 1;\n', 'sql')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('should count all as code for none style', () => {
    const result = countLines('{"a": 1}\n', 'none')
    expect(result.code).toBe(1)
  })

  it('should handle empty content', () => {
    const result = countLines('', 'c-style')
    expect(result.code).toBe(0)
    expect(result.blank).toBe(1)
  })
})

// ─── analyzeLanguage ────────────────────────────────────

describe('analyzeLanguage', () => {
  function makeAnalysis(lang: string, filePath: string, code: number, comment: number, blank: number): FileAnalysis {
    return {
      entry: undefined,
      filePath,
      language: lang,
      lines: { blank, code, comment },
      totalLines: code + comment + blank,
    }
  }

  it('should aggregate by language', () => {
    const analyses = [
      makeAnalysis('TypeScript', 'a.ts', 100, 10, 20),
      makeAnalysis('TypeScript', 'b.ts', 50, 5, 10),
    ]
    const langs = analyzeLanguage(analyses)
    expect(langs).toHaveLength(1)
    expect(langs[0].files).toBe(2)
    expect(langs[0].codeLines).toBe(150)
  })

  it('should compute percentage', () => {
    const analyses = [
      makeAnalysis('TypeScript', 'a.ts', 80, 0, 0),
      makeAnalysis('Python', 'b.py', 20, 0, 0),
    ]
    const langs = analyzeLanguage(analyses)
    expect(langs[0].percentage).toBe(80)
    expect(langs[1].percentage).toBe(20)
  })

  it('should compute avg file size', () => {
    const analyses = [
      makeAnalysis('TypeScript', 'a.ts', 100, 0, 0),
      makeAnalysis('TypeScript', 'b.ts', 50, 0, 0),
    ]
    const langs = analyzeLanguage(analyses)
    expect(langs[0].avgFileSize).toBe(75)
  })

  it('should track largest file', () => {
    const analyses = [
      makeAnalysis('TypeScript', 'small.ts', 10, 0, 0),
      makeAnalysis('TypeScript', 'big.ts', 200, 0, 0),
    ]
    const langs = analyzeLanguage(analyses)
    expect(langs[0].largestFile).toBe('big.ts')
  })

  it('should sort by code lines descending', () => {
    const analyses = [
      makeAnalysis('Python', 'a.py', 20, 0, 0),
      makeAnalysis('TypeScript', 'b.ts', 80, 0, 0),
    ]
    const langs = analyzeLanguage(analyses)
    expect(langs[0].name).toBe('TypeScript')
  })

  it('should handle empty input', () => {
    expect(analyzeLanguage([])).toHaveLength(0)
  })
})

// ─── computeLanguageStats ───────────────────────────────

describe('computeLanguageStats', () => {
  function makeLang(name: string, code: number, pct: number): LanguageInfo {
    return {
      avgFileSize: 0, blankLines: 0, codeLines: code, color: 'blue',
      commentLines: 0, extensions: [], files: 1, largestFile: '', name,
      percentage: pct, totalLines: code,
    }
  }

  it('should compute totals', () => {
    const stats = computeLanguageStats([makeLang('TS', 100, 80), makeLang('PY', 25, 20)])
    expect(stats.totalFiles).toBe(2)
    expect(stats.totalCodeLines).toBe(125)
  })

  it('should identify primary language', () => {
    const stats = computeLanguageStats([makeLang('TypeScript', 100, 80), makeLang('Python', 25, 20)])
    expect(stats.primaryLanguage).toBe('TypeScript')
  })

  it('should detect polyglot (>3 languages with >=1%)', () => {
    const langs = [
      makeLang('TS', 40, 40), makeLang('JS', 30, 30),
      makeLang('PY', 20, 20), makeLang('Go', 10, 10),
    ]
    const stats = computeLanguageStats(langs)
    expect(stats.polyglot).toBe(true)
  })

  it('should not flag monoglot as polyglot', () => {
    const stats = computeLanguageStats([makeLang('TS', 100, 100)])
    expect(stats.polyglot).toBe(false)
  })

  it('should handle empty languages', () => {
    const stats = computeLanguageStats([])
    expect(stats.primaryLanguage).toBe('None')
    expect(stats.totalFiles).toBe(0)
  })
})

// ─── suggestTooling ─────────────────────────────────────

describe('suggestTooling', () => {
  it('should suggest tools for TypeScript', () => {
    const tools = suggestTooling([{ avgFileSize: 0, blankLines: 0, codeLines: 100, color: 'blue', commentLines: 0, extensions: ['.ts'], files: 1, largestFile: '', name: 'TypeScript', percentage: 100, totalLines: 100 }])
    expect(tools).toHaveLength(1)
    expect(tools[0].tools).toContain('eslint')
  })

  it('should suggest tools for Python', () => {
    const tools = suggestTooling([{ avgFileSize: 0, blankLines: 0, codeLines: 50, color: 'green', commentLines: 0, extensions: ['.py'], files: 1, largestFile: '', name: 'Python', percentage: 100, totalLines: 50 }])
    expect(tools).toHaveLength(1)
    expect(tools[0].tools).toContain('ruff')
  })

  it('should suggest tools for Rust', () => {
    const tools = suggestTooling([{ avgFileSize: 0, blankLines: 0, codeLines: 50, color: 'orange', commentLines: 0, extensions: ['.rs'], files: 1, largestFile: '', name: 'Rust', percentage: 100, totalLines: 50 }])
    expect(tools[0].tools).toContain('cargo clippy')
  })

  it('should return empty for unknown languages', () => {
    const tools = suggestTooling([{ avgFileSize: 0, blankLines: 0, codeLines: 10, color: 'white', commentLines: 0, extensions: [], files: 1, largestFile: '', name: 'Brainfuck', percentage: 100, totalLines: 10 }])
    expect(tools).toHaveLength(0)
  })

  it('should suggest for multiple languages', () => {
    const tools = suggestTooling([
      { avgFileSize: 0, blankLines: 0, codeLines: 80, color: 'blue', commentLines: 0, extensions: ['.ts'], files: 1, largestFile: '', name: 'TypeScript', percentage: 80, totalLines: 80 },
      { avgFileSize: 0, blankLines: 0, codeLines: 20, color: 'green', commentLines: 0, extensions: ['.py'], files: 1, largestFile: '', name: 'Python', percentage: 20, totalLines: 20 },
    ])
    expect(tools).toHaveLength(2)
  })
})

// ─── buildLanguagesResult ───────────────────────────────

describe('buildLanguagesResult', () => {
  it('should return empty for no files', async () => {
    const result = await buildLanguagesResult([], async () => '', { ignorePatterns: [] })
    expect(result.stats.languages).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('should analyze TypeScript files', async () => {
    const files = ['app.ts']
    const reader = async () => 'const x = 1\n// comment\n\n'
    const result = await buildLanguagesResult(files, reader, { ignorePatterns: [] })
    expect(result.stats.languages).toHaveLength(1)
    expect(result.stats.languages[0].name).toBe('TypeScript')
  })

  it('should handle multiple languages', async () => {
    const files = ['a.ts', 'b.py']
    const reader = async () => 'x = 1\n'
    const result = await buildLanguagesResult(files, reader, { ignorePatterns: [] })
    expect(result.stats.languages).toHaveLength(2)
  })

  it('should skip unreadable files', async () => {
    const files = ['missing.ts']
    const reader = async () => { throw new Error('not found') }
    const result = await buildLanguagesResult(files, reader, { ignorePatterns: [] })
    expect(result.stats.languages).toHaveLength(0)
  })

  it('should include tooling suggestions', async () => {
    const files = ['app.ts']
    const reader = async () => 'const x = 1\n'
    const result = await buildLanguagesResult(files, reader, { ignorePatterns: [] })
    expect(result.tooling.length).toBeGreaterThan(0)
  })

  it('should detect primary language', async () => {
    const files = ['a.ts', 'b.ts', 'c.py']
    const reader = async () => 'x = 1\n'
    const result = await buildLanguagesResult(files, reader, { ignorePatterns: [] })
    expect(result.stats.primaryLanguage).toBe('TypeScript')
  })
})

// ─── percentageBar ──────────────────────────────────────

describe('percentageBar', () => {
  it('should produce full bar for 100%', () => {
    expect(percentageBar(100, 10)).toBe('██████████')
  })

  it('should produce empty bar for 0%', () => {
    expect(percentageBar(0, 10)).toBe('░░░░░░░░░░')
  })

  it('should produce half bar for 50%', () => {
    expect(percentageBar(50, 10)).toBe('█████░░░░░')
  })
})

// ─── formatLanguagesTable ───────────────────────────────

describe('formatLanguagesTable', () => {
  function makeResult(): LanguagesResult {
    return {
      stats: {
        languages: [{
          avgFileSize: 50, blankLines: 20, codeLines: 100, color: 'blue',
          commentLines: 10, extensions: ['.ts'], files: 2, largestFile: 'big.ts',
          name: 'TypeScript', percentage: 80, totalLines: 130,
        }],
        polyglot: false,
        primaryLanguage: 'TypeScript',
        totalCodeLines: 100,
        totalFiles: 2,
        totalLines: 130,
      },
      tooling: [],
    }
  }

  it('should contain Language Breakdown header', () => {
    expect(formatLanguagesTable(makeResult(), false)).toContain('Language Breakdown')
  })

  it('should show language name', () => {
    expect(formatLanguagesTable(makeResult(), false)).toContain('TypeScript')
  })

  it('should show percentage', () => {
    expect(formatLanguagesTable(makeResult(), false)).toContain('80%')
  })

  it('should show total', () => {
    expect(formatLanguagesTable(makeResult(), false)).toContain('Total')
  })

  it('should show primary language', () => {
    expect(formatLanguagesTable(makeResult(), false)).toContain('Primary')
  })

  it('should show verbose details', () => {
    expect(formatLanguagesTable(makeResult(), true)).toContain('comments')
  })

  it('should handle empty results', () => {
    const r: LanguagesResult = {
      stats: { languages: [], polyglot: false, primaryLanguage: 'None', totalCodeLines: 0, totalFiles: 0, totalLines: 0 },
      tooling: [],
    }
    expect(formatLanguagesTable(r, false)).toContain('No source files')
  })

  it('should show tooling when present', () => {
    const r = makeResult()
    r.tooling = [{ language: 'TypeScript', reason: 'Lint', tools: ['eslint'] }]
    expect(formatLanguagesTable(r, false)).toContain('Suggested Tooling')
  })

  it('should show polyglot warning', () => {
    const r = makeResult()
    r.stats.polyglot = true
    r.stats.languages = [
      { avgFileSize: 10, blankLines: 0, codeLines: 40, color: 'blue', commentLines: 0, extensions: ['.ts'], files: 1, largestFile: '', name: 'TypeScript', percentage: 40, totalLines: 40 },
      { avgFileSize: 10, blankLines: 0, codeLines: 30, color: 'yellow', commentLines: 0, extensions: ['.js'], files: 1, largestFile: '', name: 'JavaScript', percentage: 30, totalLines: 30 },
      { avgFileSize: 10, blankLines: 0, codeLines: 20, color: 'green', commentLines: 0, extensions: ['.py'], files: 1, largestFile: '', name: 'Python', percentage: 20, totalLines: 20 },
      { avgFileSize: 10, blankLines: 0, codeLines: 10, color: 'cyan', commentLines: 0, extensions: ['.go'], files: 1, largestFile: '', name: 'Go', percentage: 10, totalLines: 10 },
    ]
    r.stats.totalFiles = 4
    r.stats.totalCodeLines = 100
    expect(formatLanguagesTable(r, false)).toContain('Polyglot')
  })
})

// ─── formatLanguagesJson ────────────────────────────────

describe('formatLanguagesJson', () => {
  it('should produce valid JSON', () => {
    const r: LanguagesResult = {
      stats: { languages: [], polyglot: false, primaryLanguage: 'None', totalCodeLines: 0, totalFiles: 0, totalLines: 0 },
      tooling: [],
    }
    expect(() => JSON.parse(formatLanguagesJson(r))).not.toThrow()
  })

  it('should serialize language data', () => {
    const r: LanguagesResult = {
      stats: {
        languages: [{ avgFileSize: 50, blankLines: 0, codeLines: 100, color: 'blue', commentLines: 0, extensions: ['.ts'], files: 1, largestFile: 'a.ts', name: 'TypeScript', percentage: 100, totalLines: 100 }],
        polyglot: false, primaryLanguage: 'TypeScript', totalCodeLines: 100, totalFiles: 1, totalLines: 100,
      },
      tooling: [],
    }
    const parsed = JSON.parse(formatLanguagesJson(r))
    expect(parsed.stats.languages[0].name).toBe('TypeScript')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Languages command', () => {
  it('should have correct description', () => {
    expect(Languages.description).toContain('language')
  })

  it('should have path arg', () => {
    expect(Languages.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Languages.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Languages.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(Languages.flags.ignore).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Languages.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Languages.examples.length).toBeGreaterThan(0)
  })
})
