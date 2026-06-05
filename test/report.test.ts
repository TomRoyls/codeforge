import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import Report from '../src/commands/report.js'
import {
  analyzeDependencies,
  buildFullReport,
  collectComplexity,
  collectDependencies,
  collectSuggestions,
  collectSummary,
  collectTodos,
  detectLanguage,
  formatBytes,
  parseSections,
  shouldInclude,
  type FileContent,
  type FullReport,
} from '../src/commands/report-helpers.js'
import { formatLanguageBar, formatReportHtml, formatReportText } from '../src/commands/report-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileContent(overrides: Partial<FileContent> = {}): FileContent {
  return {
    content: 'const x = 1;',
    path: 'test.ts',
    size: 14,
    ...overrides,
  }
}

function makeFullReport(overrides: Partial<FullReport> = {}): FullReport {
  return {
    complexity: { averageComplexity: 0, highRiskCount: 0, topComplexFiles: [], totalFunctions: 0 },
    dependencies: { totalDeps: 0, totalDevDeps: 0, versionTypes: [] },
    generatedAt: '2025-01-01T00:00:00.000Z',
    projectPath: '/test',
    sections: [],
    summary: { extensions: [], languages: [], totalFiles: 0, totalLines: 0, totalSize: 0 },
    suggestions: { byCategory: [], highSeverity: 0, topSuggestions: [], total: 0 },
    todos: { byFile: [], totalFixmes: 0, totalHacks: 0, totalTodos: 0 },
    ...overrides,
  }
}

const TMP_DIR = join('/tmp', 'codeforge-report-test')

// ─── Command metadata ───────────────────────────────────

describe('Report command - static metadata', () => {
  it('has a description', () => {
    expect(Report.description).toBe('Generate a comprehensive codebase report')
  })

  it('has examples array', () => {
    expect(Array.isArray(Report.examples)).toBe(true)
    expect(Report.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Report.args.path).toBeDefined()
    expect(Report.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Report.args.path.default).toBe('.')
  })

  it('has a run method', () => {
    expect(typeof Report.prototype.run).toBe('function')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Report command - flags', () => {
  it('has format flag with options', () => {
    expect(Report.flags.format.options).toContain('text')
    expect(Report.flags.format.options).toContain('html')
  })

  it('defaults format to text', () => {
    expect(Report.flags.format.default).toBe('text')
  })

  it('has output flag', () => {
    expect(Report.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Report.flags.ignore).toBeDefined()
    expect(Report.flags.ignore.multiple).toBe(true)
  })

  it('has sections flag defaulting to all', () => {
    expect(Report.flags.sections.default).toBe('all')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Report.flags.verbose.default).toBe(false)
  })
})

// ─── detectLanguage ─────────────────────────────────────

describe('detectLanguage', () => {
  it('detects TypeScript', () => {
    expect(detectLanguage('file.ts')).toBe('TypeScript')
  })

  it('detects TypeScript from tsx', () => {
    expect(detectLanguage('file.tsx')).toBe('TypeScript')
  })

  it('detects JavaScript', () => {
    expect(detectLanguage('file.js')).toBe('JavaScript')
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

  it('returns Unknown for unrecognized extensions', () => {
    expect(detectLanguage('file.xyz')).toBe('Unknown')
  })

  it('returns Unknown for no extension', () => {
    expect(detectLanguage('Makefile')).toBe('Unknown')
  })
})

// ─── parseSections ──────────────────────────────────────

describe('parseSections', () => {
  it('parses "all" as ["all"]', () => {
    expect(parseSections('all')).toEqual(['all'])
  })

  it('parses comma-separated sections', () => {
    expect(parseSections('summary,complexity')).toEqual(['summary', 'complexity'])
  })

  it('trims whitespace', () => {
    expect(parseSections(' summary , complexity ')).toEqual(['summary', 'complexity'])
  })

  it('filters empty segments', () => {
    expect(parseSections('summary,,complexity,')).toEqual(['summary', 'complexity'])
  })
})

// ─── shouldInclude ──────────────────────────────────────

describe('shouldInclude', () => {
  it('includes all when "all" is selected', () => {
    expect(shouldInclude('summary', ['all'])).toBe(true)
    expect(shouldInclude('todos', ['all'])).toBe(true)
  })

  it('includes only selected sections', () => {
    expect(shouldInclude('summary', ['summary', 'complexity'])).toBe(true)
    expect(shouldInclude('todos', ['summary', 'complexity'])).toBe(false)
  })

  it('excludes unselected sections', () => {
    expect(shouldInclude('deps', ['summary'])).toBe(false)
  })
})

// ─── collectSummary ─────────────────────────────────────

describe('collectSummary', () => {
  it('counts total files correctly', () => {
    const files = [makeFileContent(), makeFileContent({ path: 'b.ts' })]
    const result = collectSummary(files)
    expect(result.totalFiles).toBe(2)
  })

  it('counts total lines correctly', () => {
    const files = [makeFileContent({ content: 'line1\nline2\nline3' })]
    const result = collectSummary(files)
    expect(result.totalLines).toBe(3)
  })

  it('counts total size correctly', () => {
    const files = [makeFileContent({ size: 100 }), makeFileContent({ size: 200 })]
    const result = collectSummary(files)
    expect(result.totalSize).toBe(300)
  })

  it('detects languages and computes percentages', () => {
    const files = [
      makeFileContent({ path: 'a.ts', content: 'x\ny\nz' }),
      makeFileContent({ path: 'b.py', content: 'x\ny' }),
    ]
    const result = collectSummary(files)
    expect(result.languages).toHaveLength(2)
    const ts = result.languages.find((l) => l.lang === 'TypeScript')
    expect(ts).toBeDefined()
    expect(ts!.percentage).toBe(60)
  })

  it('counts extensions', () => {
    const files = [
      makeFileContent({ path: 'a.ts' }),
      makeFileContent({ path: 'b.ts' }),
      makeFileContent({ path: 'c.py' }),
    ]
    const result = collectSummary(files)
    expect(result.extensions).toHaveLength(2)
    const tsExt = result.extensions.find((e) => e.ext === '.ts')
    expect(tsExt!.count).toBe(2)
  })

  it('handles empty files array', () => {
    const result = collectSummary([])
    expect(result.totalFiles).toBe(0)
    expect(result.totalLines).toBe(0)
    expect(result.totalSize).toBe(0)
    expect(result.languages).toHaveLength(0)
    expect(result.extensions).toHaveLength(0)
  })

  it('sorts languages by lines descending', () => {
    const files = [
      makeFileContent({ path: 'a.ts', content: 'x' }),
      makeFileContent({ path: 'b.py', content: 'x\ny\nz\nw\nv' }),
    ]
    const result = collectSummary(files)
    expect(result.languages[0]!.lang).toBe('Python')
  })
})

// ─── collectComplexity ──────────────────────────────────

describe('collectComplexity', () => {
  it('counts functions', () => {
    const files = [makeFileContent({ content: 'function foo() { return 1; }' })]
    const result = collectComplexity(files)
    expect(result.totalFunctions).toBeGreaterThan(0)
  })

  it('computes average complexity', () => {
    const files = [makeFileContent({ content: 'function foo() { if (x) { bar(); } }' })]
    const result = collectComplexity(files)
    expect(result.averageComplexity).toBeGreaterThan(0)
  })

  it('detects high risk files', () => {
    const content = Array.from({ length: 20 }, (_, i) => `if (x${i}) { y(); }`).join('\n')
    const files = [makeFileContent({ content: `function complex() { ${content} }` })]
    const result = collectComplexity(files)
    expect(result.highRiskCount).toBeGreaterThan(0)
  })

  it('finds top complex files', () => {
    const files = [
      makeFileContent({ path: 'simple.ts', content: 'const x = 1;' }),
      makeFileContent({ path: 'complex.ts', content: 'function f() { if(x) {} if(y) {} if(z) {} }' }),
    ]
    const result = collectComplexity(files)
    expect(result.topComplexFiles.length).toBeGreaterThan(0)
    if (result.topComplexFiles.length > 0) {
      expect(result.topComplexFiles[0]!.file).toBe('complex.ts')
    }
  })

  it('handles files with no functions', () => {
    const files = [makeFileContent({ content: 'const x = 1;' })]
    const result = collectComplexity(files)
    expect(result.totalFunctions).toBe(0)
    expect(result.averageComplexity).toBe(0)
  })

  it('handles empty content', () => {
    const result = collectComplexity([])
    expect(result.totalFunctions).toBe(0)
    expect(result.topComplexFiles).toHaveLength(0)
  })

  it('limits top complex files to 5', () => {
    const files = Array.from({ length: 10 }, (_, i) =>
      makeFileContent({ path: `file${i}.ts`, content: `function f${i}() { ${'if(x){} '.repeat(i * 3)} }` }),
    )
    const result = collectComplexity(files)
    expect(result.topComplexFiles.length).toBeLessThanOrEqual(5)
  })
})

// ─── collectTodos ───────────────────────────────────────

describe('collectTodos', () => {
  it('counts TODOs', () => {
    const files = [makeFileContent({ content: '// TODO: fix this\n// TODO: also this' })]
    const result = collectTodos(files)
    expect(result.totalTodos).toBe(2)
  })

  it('counts FIXMEs', () => {
    const files = [makeFileContent({ content: '// FIXME: broken' })]
    const result = collectTodos(files)
    expect(result.totalFixmes).toBe(1)
  })

  it('counts HACKs', () => {
    const files = [makeFileContent({ content: '// HACK: workaround' })]
    const result = collectTodos(files)
    expect(result.totalHacks).toBe(1)
  })

  it('groups by file sorted by count descending', () => {
    const files = [
      makeFileContent({ path: 'few.ts', content: '// TODO: one' }),
      makeFileContent({ path: 'many.ts', content: '// TODO: a\n// TODO: b\n// TODO: c' }),
    ]
    const result = collectTodos(files)
    expect(result.byFile).toHaveLength(2)
    expect(result.byFile[0]!.file).toBe('many.ts')
    expect(result.byFile[0]!.count).toBe(3)
  })

  it('handles no todos', () => {
    const files = [makeFileContent({ content: 'const x = 1;' })]
    const result = collectTodos(files)
    expect(result.totalTodos).toBe(0)
    expect(result.totalFixmes).toBe(0)
    expect(result.totalHacks).toBe(0)
    expect(result.byFile).toHaveLength(0)
  })

  it('handles empty files array', () => {
    const result = collectTodos([])
    expect(result.totalTodos).toBe(0)
  })
})

// ─── analyzeDependencies ────────────────────────────────

describe('analyzeDependencies', () => {
  it('counts dependencies', () => {
    const pkg = { dependencies: { lodash: '^4.17.0', express: '^4.18.0' } }
    const result = analyzeDependencies(pkg)
    expect(result.totalDeps).toBe(2)
  })

  it('counts dev dependencies', () => {
    const pkg = { devDependencies: { vitest: '~1.0.0', typescript: '^5.0.0' } }
    const result = analyzeDependencies(pkg)
    expect(result.totalDevDeps).toBe(2)
  })

  it('categorizes version types', () => {
    const pkg = { dependencies: { lodash: '^4.17.0', react: '~18.0.0', axios: '1.6.0' } }
    const result = analyzeDependencies(pkg)
    const types = result.versionTypes.map((v) => v.type)
    expect(types).toContain('caret')
    expect(types).toContain('tilde')
    expect(types).toContain('exact')
  })

  it('handles empty dependencies', () => {
    const result = analyzeDependencies({})
    expect(result.totalDeps).toBe(0)
    expect(result.totalDevDeps).toBe(0)
    expect(result.versionTypes).toHaveLength(0)
  })

  it('handles local and git references', () => {
    const pkg = { dependencies: { local: 'file:../pkg', gh: 'github:user/repo' } }
    const result = analyzeDependencies(pkg)
    const types = result.versionTypes.map((v) => v.type)
    expect(types).toContain('local')
    expect(types).toContain('git')
  })
})

// ─── collectDependencies (async) ────────────────────────

describe('collectDependencies', () => {
  beforeEach(async () => {
    await mkdir(TMP_DIR, { recursive: true })
  })

  afterEach(async () => {
    await rm(TMP_DIR, { recursive: true, force: true })
  })

  it('reads package.json from directory', async () => {
    const pkg = { dependencies: { lodash: '^4.17.0' }, devDependencies: { vitest: '~1.0.0' } }
    await writeFile(join(TMP_DIR, 'package.json'), JSON.stringify(pkg))
    const result = await collectDependencies(TMP_DIR)
    expect(result.totalDeps).toBe(1)
    expect(result.totalDevDeps).toBe(1)
  })

  it('returns empty when no package.json', async () => {
    const result = await collectDependencies(TMP_DIR)
    expect(result.totalDeps).toBe(0)
    expect(result.totalDevDeps).toBe(0)
    expect(result.versionTypes).toHaveLength(0)
  })
})

// ─── collectSuggestions ─────────────────────────────────

describe('collectSuggestions', () => {
  it('counts console.log occurrences', () => {
    const files = [makeFileContent({ content: 'console.log("a"); console.log("b");' })]
    const result = collectSuggestions(files)
    expect(result.total).toBe(2)
  })

  it('detects high severity eval', () => {
    const files = [makeFileContent({ content: 'eval("dangerous code")' })]
    const result = collectSuggestions(files)
    expect(result.highSeverity).toBe(1)
  })

  it('groups by category', () => {
    const files = [makeFileContent({ content: 'console.log("x"); eval("y"); const z: any = 1;' })]
    const result = collectSuggestions(files)
    const categories = result.byCategory.map((c) => c.category)
    expect(categories).toContain('debugging')
    expect(categories).toContain('security')
    expect(categories).toContain('type-safety')
  })

  it('finds top suggestions', () => {
    const files = [
      makeFileContent({ content: 'console.log("a"); console.log("b"); console.log("c"); eval("d")' }),
    ]
    const result = collectSuggestions(files)
    expect(result.topSuggestions.length).toBeGreaterThan(0)
    expect(result.topSuggestions[0]!.rule).toBe('no-console')
    expect(result.topSuggestions[0]!.count).toBe(3)
  })

  it('handles clean code', () => {
    const files = [makeFileContent({ content: 'const x = 1;\nconst y = 2;' })]
    const result = collectSuggestions(files)
    expect(result.total).toBe(0)
    expect(result.highSeverity).toBe(0)
  })

  it('detects ts-ignore', () => {
    const files = [makeFileContent({ content: '// @ts-ignore\nconst x = 1;' })]
    const result = collectSuggestions(files)
    const rules = result.topSuggestions.map((s) => s.rule)
    expect(rules).toContain('no-ts-ignore')
  })

  it('detects empty catch blocks', () => {
    const files = [makeFileContent({ content: 'try {} catch (e) {}' })]
    const result = collectSuggestions(files)
    expect(result.highSeverity).toBeGreaterThan(0)
  })

  it('detects explicit any', () => {
    const files = [makeFileContent({ content: 'const x: any = 1;' })]
    const result = collectSuggestions(files)
    const rules = result.topSuggestions.map((s) => s.rule)
    expect(rules).toContain('no-explicit-any')
  })

  it('handles empty files array', () => {
    const result = collectSuggestions([])
    expect(result.total).toBe(0)
  })

  it('limits top suggestions to 5', () => {
    const files = [
      makeFileContent({
        content: 'console.log("a"); eval("b"); const x: any = 1; // @ts-ignore\ntry{} catch(e){}',
      }),
    ]
    const result = collectSuggestions(files)
    expect(result.topSuggestions.length).toBeLessThanOrEqual(5)
  })
})

// ─── formatBytes ────────────────────────────────────────

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500.00 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.00 MB')
  })
})

// ─── formatReportText ───────────────────────────────────

describe('formatReportText', () => {
  it('contains header with project path', () => {
    const report = makeFullReport()
    const output = formatReportText(report)
    expect(output).toContain('CodeForge Report')
    expect(output).toContain('/test')
  })

  it('contains footer with timestamp', () => {
    const report = makeFullReport()
    const output = formatReportText(report)
    expect(output).toContain('Generated at')
  })

  it('includes section titles', () => {
    const report = makeFullReport({
      sections: [{ content: 'test data', title: 'Summary' }],
    })
    const output = formatReportText(report)
    expect(output).toContain('Summary')
    expect(output).toContain('test data')
  })

  it('handles empty sections', () => {
    const report = makeFullReport({ sections: [] })
    const output = formatReportText(report)
    expect(output).toContain('CodeForge Report')
  })

  it('includes multiple sections', () => {
    const report = makeFullReport({
      sections: [
        { content: 'summary data', title: 'Summary' },
        { content: 'complexity data', title: 'Complexity' },
      ],
    })
    const output = formatReportText(report)
    expect(output).toContain('Summary')
    expect(output).toContain('Complexity')
  })
})

// ─── formatReportHtml ───────────────────────────────────

describe('formatReportHtml', () => {
  it('produces valid HTML with DOCTYPE', () => {
    const report = makeFullReport()
    const output = formatReportHtml(report)
    expect(output).toContain('<!DOCTYPE html>')
  })

  it('contains meta charset', () => {
    const report = makeFullReport()
    const output = formatReportHtml(report)
    expect(output).toContain('<meta charset="UTF-8">')
  })

  it('contains styled header', () => {
    const report = makeFullReport()
    const output = formatReportHtml(report)
    expect(output).toContain('<h1>CodeForge Report</h1>')
    expect(output).toContain('class="header"')
  })

  it('contains tables for language data', () => {
    const report = makeFullReport({
      summary: {
        extensions: [{ count: 5, ext: '.ts' }],
        languages: [{ files: 5, lang: 'TypeScript', lines: 100, percentage: 100 }],
        totalFiles: 5,
        totalLines: 100,
        totalSize: 1024,
      },
    })
    const output = formatReportHtml(report)
    expect(output).toContain('<table>')
    expect(output).toContain('TypeScript')
  })

  it('contains footer with timestamp', () => {
    const report = makeFullReport()
    const output = formatReportHtml(report)
    expect(output).toContain('<footer')
    expect(output).toContain('Generated at')
  })

  it('contains inline CSS styles', () => {
    const report = makeFullReport()
    const output = formatReportHtml(report)
    expect(output).toContain('<style>')
    expect(output).toContain('font-family')
  })

  it('escapes HTML in paths', () => {
    const report = makeFullReport({ projectPath: '/path/<script>alert("x")</script>' })
    const output = formatReportHtml(report)
    expect(output).not.toContain('<script>')
    expect(output).toContain('&lt;script&gt;')
  })

  it('shows complexity data', () => {
    const report = makeFullReport({
      complexity: {
        averageComplexity: 5.2,
        highRiskCount: 2,
        topComplexFiles: [{ avgComplexity: 12.5, file: 'complex.ts' }],
        totalFunctions: 20,
      },
    })
    const output = formatReportHtml(report)
    expect(output).toContain('complex.ts')
    expect(output).toContain('12.5')
  })

  it('shows suggestions with severity colors', () => {
    const report = makeFullReport({
      suggestions: {
        byCategory: [{ category: 'security', count: 3 }],
        highSeverity: 3,
        topSuggestions: [{ count: 3, rule: 'no-eval' }],
        total: 5,
      },
    })
    const output = formatReportHtml(report)
    expect(output).toContain('severity-high')
    expect(output).toContain('no-eval')
  })

  it('shows clean code message when no suggestions', () => {
    const report = makeFullReport({
      suggestions: { byCategory: [], highSeverity: 0, topSuggestions: [], total: 0 },
    })
    const output = formatReportHtml(report)
    expect(output).toContain('No suggestions found')
  })
})

// ─── formatLanguageBar ──────────────────────────────────

describe('formatLanguageBar', () => {
  it('generates bar with percentages', () => {
    const languages = [{ files: 10, lang: 'TypeScript', lines: 100, percentage: 65 }]
    const bar = formatLanguageBar(languages, 40)
    expect(bar).toContain('TypeScript')
    expect(bar).toContain('65.0%')
  })

  it('generates bar segments', () => {
    const languages = [
      { files: 10, lang: 'TypeScript', lines: 100, percentage: 65 },
      { files: 5, lang: 'JavaScript', lines: 50, percentage: 35 },
    ]
    const bar = formatLanguageBar(languages, 40)
    expect(bar).toContain('█')
    expect(bar).toContain('|')
  })

  it('handles empty languages', () => {
    const bar = formatLanguageBar([])
    expect(bar).toBe('')
  })

  it('handles zero percentages', () => {
    const languages = [{ files: 0, lang: 'Empty', lines: 0, percentage: 0 }]
    const bar = formatLanguageBar(languages, 40)
    expect(bar).toBe('')
  })

  it('handles single language at 100%', () => {
    const languages = [{ files: 10, lang: 'TypeScript', lines: 100, percentage: 100 }]
    const bar = formatLanguageBar(languages, 20)
    expect(bar).toContain('TypeScript')
    expect(bar).toContain('100.0%')
  })
})

// ─── buildFullReport ────────────────────────────────────

describe('buildFullReport', () => {
  const sampleFiles: FileContent[] = [
    {
      content: 'function foo() { if (x) { console.log("hi"); } }\n// TODO: fix',
      path: 'a.ts',
      size: 60,
    },
    { content: 'const y = 2;\n// FIXME: broken', path: 'b.py', size: 30 },
  ]

  it('returns a FullReport with all required fields', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['all'] })
    expect(report.generatedAt).toBeDefined()
    expect(report.projectPath).toBe('/test')
    expect(report.summary).toBeDefined()
    expect(report.complexity).toBeDefined()
    expect(report.todos).toBeDefined()
    expect(report.dependencies).toBeDefined()
    expect(report.suggestions).toBeDefined()
    expect(report.sections).toBeDefined()
  })

  it('includes all sections when "all" is selected', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['all'] })
    const titles = report.sections.map((s) => s.title)
    expect(titles).toContain('Summary')
    expect(titles).toContain('Files')
    expect(titles).toContain('Complexity')
    expect(titles).toContain('Todos')
    expect(titles).toContain('Suggestions')
  })

  it('includes only selected sections', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['summary', 'todos'] })
    const titles = report.sections.map((s) => s.title)
    expect(titles).toContain('Summary')
    expect(titles).toContain('Todos')
    expect(titles).not.toContain('Complexity')
  })

  it('populates summary data', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['all'] })
    expect(report.summary.totalFiles).toBe(2)
    expect(report.summary.totalLines).toBeGreaterThan(0)
  })

  it('populates complexity data', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['all'] })
    expect(report.complexity.totalFunctions).toBeGreaterThan(0)
  })

  it('populates todos data', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['all'] })
    expect(report.todos.totalTodos).toBe(1)
    expect(report.todos.totalFixmes).toBe(1)
  })

  it('populates suggestions data', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['all'] })
    expect(report.suggestions.total).toBeGreaterThan(0)
  })

  it('handles empty files array', async () => {
    const report = await buildFullReport('/test', [], { sections: ['all'] })
    expect(report.summary.totalFiles).toBe(0)
    expect(report.complexity.totalFunctions).toBe(0)
    expect(report.todos.totalTodos).toBe(0)
  })

  it('sets generatedAt to a valid ISO timestamp', async () => {
    const report = await buildFullReport('/test', sampleFiles, { sections: ['all'] })
    expect(new Date(report.generatedAt).toISOString()).toBe(report.generatedAt)
  })
})
