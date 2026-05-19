import { describe, expect, it } from 'vitest'

import Summary from '../src/commands/summary.js'
import {
  computeCodeOverview,
  computeHealthScore,
  computeQuickIssues,
  type CodeOverview,
  type FileContent,
  type FileEntry,
  type QuickIssues,
  findTopFiles,
  formatRelativeTime,
} from '../src/commands/summary-helpers.js'
import { formatHealthBar, formatSummaryJson, formatSummaryTable } from '../src/commands/summary-format-helpers.js'
import type { SummaryResult } from '../src/commands/summary-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileEntry(overrides: Partial<FileEntry> = {}): FileEntry {
  return {
    absolutePath: '/project/src/index.ts',
    path: 'src/index.ts',
    ...overrides,
  }
}

function makeFileContent(overrides: Partial<FileContent> = {}): FileContent {
  return {
    content: 'const x = 1;\n',
    path: 'src/index.ts',
    ...overrides,
  }
}

function makeCodeOverview(overrides: Partial<CodeOverview> = {}): CodeOverview {
  return {
    codeLines: 100,
    configFiles: 5,
    languages: [{ files: 10, name: 'TypeScript', percentage: 80 }],
    sourceFiles: 10,
    testFiles: 3,
    totalFiles: 20,
    totalLines: 200,
    ...overrides,
  }
}

function makeQuickIssues(overrides: Partial<QuickIssues> = {}): QuickIssues {
  return {
    complexityHotspots: 0,
    deadCode: 0,
    missingDocs: 0,
    todos: 0,
    unusedExports: 0,
    ...overrides,
  }
}

function makeSummaryResult(overrides: Partial<SummaryResult> = {}): SummaryResult {
  return {
    code: makeCodeOverview(),
    git: null,
    health: {
      complexity: 100,
      documentation: 80,
      grade: 'B',
      maintainability: 100,
      overall: 84,
      testing: 30,
    },
    issues: makeQuickIssues(),
    project: {
      description: 'Test project',
      framework: '',
      language: 'TypeScript',
      license: 'MIT',
      name: 'test-project',
      repository: '',
      version: '1.0.0',
    },
    recentChanges: [],
    topFiles: [],
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Summary command - static metadata', () => {
  it('has a description', () => {
    expect(Summary.description).toBe('Show a quick project overview dashboard')
  })

  it('has examples array', () => {
    expect(Array.isArray(Summary.examples)).toBe(true)
    expect(Summary.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Summary.args.path).toBeDefined()
    expect(Summary.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Summary.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Summary command - flags', () => {
  it('has format flag with options', () => {
    expect(Summary.flags.format.options).toContain('json')
    expect(Summary.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Summary.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Summary.flags.output).toBeDefined()
  })

  it('has no-git flag', () => {
    expect(Summary.flags['no-git']).toBeDefined()
    expect(Summary.flags['no-git'].default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Summary command - class structure', () => {
  it('exports a default class', () => {
    expect(Summary).toBeDefined()
    expect(typeof Summary).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Summary.prototype.run).toBe('function')
  })
})

// ─── computeCodeOverview ────────────────────────────────

describe('computeCodeOverview', () => {
  it('counts total files', () => {
    const files = [
      makeFileEntry({ path: 'a.ts' }),
      makeFileEntry({ path: 'b.ts' }),
      makeFileEntry({ path: 'c.js' }),
    ]
    const contents = [
      makeFileContent({ path: 'a.ts', content: 'const a = 1;\n' }),
      makeFileContent({ path: 'b.ts', content: 'const b = 2;\n' }),
      makeFileContent({ path: 'c.js', content: 'const c = 3;\n' }),
    ]
    const overview = computeCodeOverview(files, contents)
    expect(overview.totalFiles).toBe(3)
  })

  it('counts source files', () => {
    const files = [
      makeFileEntry({ path: 'a.ts' }),
      makeFileEntry({ path: 'b.py' }),
      makeFileEntry({ path: 'c.json' }),
    ]
    const contents = [
      makeFileContent({ path: 'a.ts', content: 'code\n' }),
      makeFileContent({ path: 'b.py', content: 'code\n' }),
      makeFileContent({ path: 'c.json', content: '{}\n' }),
    ]
    const overview = computeCodeOverview(files, contents)
    expect(overview.sourceFiles).toBe(2)
  })

  it('counts test files', () => {
    const files = [
      makeFileEntry({ path: 'a.test.ts' }),
      makeFileEntry({ path: 'b.spec.ts' }),
      makeFileEntry({ path: 'c.ts' }),
    ]
    const contents = [
      makeFileContent({ path: 'a.test.ts', content: 'test\n' }),
      makeFileContent({ path: 'b.spec.ts', content: 'test\n' }),
      makeFileContent({ path: 'c.ts', content: 'code\n' }),
    ]
    const overview = computeCodeOverview(files, contents)
    expect(overview.testFiles).toBe(2)
  })

  it('detects language percentages', () => {
    const files = [
      makeFileEntry({ path: 'a.ts' }),
      makeFileEntry({ path: 'b.ts' }),
      makeFileEntry({ path: 'c.js' }),
    ]
    const contents = [
      makeFileContent({ path: 'a.ts', content: 'code\n' }),
      makeFileContent({ path: 'b.ts', content: 'code\n' }),
      makeFileContent({ path: 'c.js', content: 'code\n' }),
    ]
    const overview = computeCodeOverview(files, contents)
    const ts = overview.languages.find((l) => l.name === 'TypeScript')
    expect(ts).toBeDefined()
    expect(ts!.percentage).toBe(67)
  })

  it('handles empty files array', () => {
    const overview = computeCodeOverview([], [])
    expect(overview.totalFiles).toBe(0)
    expect(overview.totalLines).toBe(0)
  })

  it('counts total lines', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [makeFileContent({ path: 'a.ts', content: 'line1\nline2\nline3' })]
    const overview = computeCodeOverview(files, contents)
    expect(overview.totalLines).toBe(3)
  })

  it('counts config files', () => {
    const files = [
      makeFileEntry({ path: 'package.json' }),
      makeFileEntry({ path: 'tsconfig.json' }),
      makeFileEntry({ path: 'src/index.ts' }),
    ]
    const contents = [
      makeFileContent({ path: 'package.json', content: '{}\n' }),
      makeFileContent({ path: 'tsconfig.json', content: '{}\n' }),
      makeFileContent({ path: 'src/index.ts', content: 'code\n' }),
    ]
    const overview = computeCodeOverview(files, contents)
    expect(overview.configFiles).toBe(2)
  })
})

// ─── computeHealthScore ─────────────────────────────────

describe('computeHealthScore', () => {
  it('gives high score for perfect project', () => {
    const code = makeCodeOverview({
      codeLines: 80,
      sourceFiles: 10,
      testFiles: 10,
      totalFiles: 20,
      totalLines: 100,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.overall).toBeGreaterThanOrEqual(90)
    expect(health.grade).toBe('A')
  })

  it('gives low testing score when no tests', () => {
    const code = makeCodeOverview({
      sourceFiles: 10,
      testFiles: 0,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.testing).toBe(0)
  })

  it('gives low documentation score when no comments', () => {
    const code = makeCodeOverview({
      codeLines: 200,
      totalLines: 200,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.documentation).toBe(20)
  })

  it('gives low maintainability for large files', () => {
    const code = makeCodeOverview({
      totalFiles: 2,
      totalLines: 1200,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.maintainability).toBeLessThanOrEqual(20)
  })

  it('gives high maintainability for small files', () => {
    const code = makeCodeOverview({
      totalFiles: 20,
      totalLines: 1000,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.maintainability).toBe(100)
  })

  it('grades correctly at A boundary', () => {
    const code = makeCodeOverview({
      codeLines: 50,
      sourceFiles: 10,
      testFiles: 10,
      totalFiles: 20,
      totalLines: 100,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.grade).toBe('A')
  })

  it('grades correctly at F boundary', () => {
    const code = makeCodeOverview({
      codeLines: 100,
      sourceFiles: 10,
      testFiles: 0,
      totalFiles: 2,
      totalLines: 1000,
    })
    const issues = makeQuickIssues({ complexityHotspots: 10 })
    const health = computeHealthScore(code, issues)
    expect(health.grade).toBe('F')
  })

  it('computes complexity from hotspots', () => {
    const code = makeCodeOverview()
    const issues = makeQuickIssues({ complexityHotspots: 0 })
    const health = computeHealthScore(code, issues)
    expect(health.complexity).toBe(100)
  })

  it('reduces complexity with hotspots', () => {
    const code = makeCodeOverview()
    const issues = makeQuickIssues({ complexityHotspots: 3 })
    const health = computeHealthScore(code, issues)
    expect(health.complexity).toBeLessThan(100)
    expect(health.complexity).toBeGreaterThan(20)
  })

  it('caps complexity at 20 for many hotspots', () => {
    const code = makeCodeOverview()
    const issues = makeQuickIssues({ complexityHotspots: 10 })
    const health = computeHealthScore(code, issues)
    expect(health.complexity).toBe(20)
  })

  it('computes grade B for moderate project', () => {
    const code = makeCodeOverview({
      codeLines: 90,
      sourceFiles: 10,
      testFiles: 5,
      totalFiles: 15,
      totalLines: 150,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.grade).toBe('B')
  })

  it('handles high test ratio', () => {
    const code = makeCodeOverview({
      sourceFiles: 5,
      testFiles: 10,
    })
    const issues = makeQuickIssues()
    const health = computeHealthScore(code, issues)
    expect(health.testing).toBe(100)
  })
})

// ─── computeQuickIssues ─────────────────────────────────

describe('computeQuickIssues', () => {
  it('counts TODO comments', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [makeFileContent({ path: 'a.ts', content: '// TODO: fix this\n// FIXME: broken\nconst x = 1;\n' })]
    const issues = computeQuickIssues(files, contents)
    expect(issues.todos).toBe(2)
  })

  it('counts HACK comments', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [makeFileContent({ path: 'a.ts', content: '// HACK: workaround\nconst x = 1;\n' })]
    const issues = computeQuickIssues(files, contents)
    expect(issues.todos).toBe(1)
  })

  it('detects missing docs in source files', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [makeFileContent({ path: 'a.ts', content: 'const x = 1;\nconst y = 2;\n'.repeat(6) })]
    const issues = computeQuickIssues(files, contents)
    expect(issues.missingDocs).toBe(1)
  })

  it('does not flag documented files', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [makeFileContent({ path: 'a.ts', content: '// documented\nconst x = 1;\n'.repeat(6) })]
    const issues = computeQuickIssues(files, contents)
    expect(issues.missingDocs).toBe(0)
  })

  it('detects complexity hotspots in large files', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const longContent = 'const x = 1;\n'.repeat(350)
    const contents = [makeFileContent({ path: 'a.ts', content: longContent })]
    const issues = computeQuickIssues(files, contents)
    expect(issues.complexityHotspots).toBe(1)
  })

  it('handles empty files', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [makeFileContent({ path: 'a.ts', content: '' })]
    const issues = computeQuickIssues(files, contents)
    expect(issues.todos).toBe(0)
    expect(issues.missingDocs).toBe(0)
  })

  it('handles empty arrays', () => {
    const issues = computeQuickIssues([], [])
    expect(issues.todos).toBe(0)
    expect(issues.deadCode).toBe(0)
    expect(issues.complexityHotspots).toBe(0)
    expect(issues.missingDocs).toBe(0)
  })

  it('detects unused exports', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [
      makeFileContent({
        content: 'export const a = 1;\nexport const b = 2;\nexport const c = 3;\nexport const d = 4;\n',
        path: 'a.ts',
      }),
    ]
    const issues = computeQuickIssues(files, contents)
    expect(issues.unusedExports).toBeGreaterThan(0)
  })

  it('does not flag files with imports', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [
      makeFileContent({
        content: "import { x } from 'b';\nexport const a = 1;\nexport const b = 2;\nexport const c = 3;\nexport const d = 4;\n",
        path: 'a.ts',
      }),
    ]
    const issues = computeQuickIssues(files, contents)
    expect(issues.unusedExports).toBe(0)
  })
})

// ─── findTopFiles ───────────────────────────────────────

describe('findTopFiles', () => {
  it('returns top N files by lines', () => {
    const files = [
      makeFileEntry({ path: 'small.ts' }),
      makeFileEntry({ path: 'medium.ts' }),
      makeFileEntry({ path: 'large.ts' }),
    ]
    const contents = [
      makeFileContent({ content: 'x\n'.repeat(10), path: 'small.ts' }),
      makeFileContent({ content: 'x\n'.repeat(50), path: 'medium.ts' }),
      makeFileContent({ content: 'x\n'.repeat(100), path: 'large.ts' }),
    ]
    const top = findTopFiles(files, contents, 2)
    expect(top).toHaveLength(2)
    expect(top[0]!.path).toBe('large.ts')
    expect(top[1]!.path).toBe('medium.ts')
  })

  it('returns all files if fewer than count', () => {
    const files = [makeFileEntry({ path: 'a.ts' })]
    const contents = [makeFileContent({ content: 'x\n', path: 'a.ts' })]
    const top = findTopFiles(files, contents, 5)
    expect(top).toHaveLength(1)
  })

  it('defaults to 5', () => {
    const files = Array.from({ length: 8 }, (_, i) => makeFileEntry({ path: `file${i}.ts` }))
    const contents = files.map((f) => makeFileContent({ content: 'x\n', path: f.path }))
    const top = findTopFiles(files, contents)
    expect(top).toHaveLength(5)
  })

  it('handles empty arrays', () => {
    const top = findTopFiles([], [], 5)
    expect(top).toHaveLength(0)
  })

  it('sorts by line count descending', () => {
    const files = [
      makeFileEntry({ path: 'a.ts' }),
      makeFileEntry({ path: 'b.ts' }),
    ]
    const contents = [
      makeFileContent({ content: 'x\n'.repeat(10), path: 'a.ts' }),
      makeFileContent({ content: 'x\n'.repeat(20), path: 'b.ts' }),
    ]
    const top = findTopFiles(files, contents, 5)
    expect(top[0]!.lines).toBeGreaterThanOrEqual(top[1]!.lines)
  })
})

// ─── formatRelativeTime ─────────────────────────────────

describe('formatRelativeTime', () => {
  it('returns "just now" for current time', () => {
    const result = formatRelativeTime(new Date().toISOString())
    expect(result).toBe('just now')
  })

  it('returns "just now" for future date', () => {
    const future = new Date(Date.now() + 5000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toBe('just now')
  })

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('5 minutes ago')
  })

  it('returns singular minute ago', () => {
    const date = new Date(Date.now() - 1 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('1 minute ago')
  })

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('3 hours ago')
  })

  it('returns days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('2 days ago')
  })

  it('returns weeks ago', () => {
    const date = new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('3 weeks ago')
  })

  it('returns months ago', () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('3 months ago')
  })

  it('returns years ago', () => {
    const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('1 year ago')
  })

  it('returns empty for empty string', () => {
    const result = formatRelativeTime('')
    expect(result).toBe('')
  })

  it('returns original string for invalid date', () => {
    const result = formatRelativeTime('not-a-date')
    expect(result).toBe('not-a-date')
  })
})

// ─── formatHealthBar ────────────────────────────────────

describe('formatHealthBar', () => {
  it('contains percentage', () => {
    const result = formatHealthBar(80)
    expect(result).toContain('80%')
  })

  it('contains filled characters', () => {
    const result = formatHealthBar(80)
    expect(result).toContain('████████')
    expect(result).toContain('░░')
  })

  it('handles 0', () => {
    const result = formatHealthBar(0)
    expect(result).toContain('0%')
    expect(result).toContain('░░░░░░░░░░')
  })

  it('handles 100', () => {
    const result = formatHealthBar(100)
    expect(result).toContain('100%')
    expect(result).toContain('██████████')
  })

  it('handles 50', () => {
    const result = formatHealthBar(50)
    expect(result).toContain('50%')
  })
})

// ─── formatSummaryTable ─────────────────────────────────

describe('formatSummaryTable', () => {
  it('contains project name', () => {
    const result = makeSummaryResult()
    const output = formatSummaryTable(result)
    expect(output).toContain('test-project')
  })

  it('contains version when present', () => {
    const result = makeSummaryResult()
    const output = formatSummaryTable(result)
    expect(output).toContain('v1.0.0')
  })

  it('contains code overview section', () => {
    const result = makeSummaryResult()
    const output = formatSummaryTable(result)
    expect(output).toContain('Code Overview')
    expect(output).toContain('Total Files')
    expect(output).toContain('Total Lines')
  })

  it('contains health score section', () => {
    const result = makeSummaryResult()
    const output = formatSummaryTable(result)
    expect(output).toContain('Health Score')
    expect(output).toContain('Documentation')
    expect(output).toContain('Testing')
    expect(output).toContain('Complexity')
    expect(output).toContain('Maintainability')
  })

  it('contains quick issues section', () => {
    const result = makeSummaryResult()
    const output = formatSummaryTable(result)
    expect(output).toContain('Quick Issues')
    expect(output).toContain('TODOs/FIXMEs')
  })

  it('shows git section when available', () => {
    const result = makeSummaryResult({
      git: {
        branch: 'main',
        isDirty: false,
        lastCommitDate: '2 days ago',
        totalBranches: 3,
        totalCommits: 42,
        totalContributors: 5,
        totalTags: 2,
      },
    })
    const output = formatSummaryTable(result)
    expect(output).toContain('Git')
    expect(output).toContain('main')
    expect(output).toContain('42')
  })

  it('hides git section when null', () => {
    const result = makeSummaryResult({ git: null })
    const output = formatSummaryTable(result)
    expect(output).not.toContain('Branch:')
    expect(output).not.toContain('Commits:')
  })

  it('shows top files', () => {
    const result = makeSummaryResult({
      topFiles: [{ lines: 500, path: 'src/big-file.ts' }],
    })
    const output = formatSummaryTable(result)
    expect(output).toContain('src/big-file.ts')
    expect(output).toContain('500 lines')
  })

  it('shows recent changes', () => {
    const result = makeSummaryResult({
      recentChanges: [{ date: '2 hours ago', file: 'src/index.ts' }],
    })
    const output = formatSummaryTable(result)
    expect(output).toContain('Recent Changes')
    expect(output).toContain('src/index.ts')
  })

  it('shows description when present', () => {
    const result = makeSummaryResult()
    const output = formatSummaryTable(result)
    expect(output).toContain('Test project')
  })

  it('shows framework when present', () => {
    const result = makeSummaryResult({
      project: {
        description: '',
        framework: 'oclif',
        language: 'TypeScript',
        license: '',
        name: 'test',
        repository: '',
        version: '',
      },
    })
    const output = formatSummaryTable(result)
    expect(output).toContain('Framework: oclif')
  })
})

// ─── formatSummaryJson ──────────────────────────────────

describe('formatSummaryJson', () => {
  it('produces valid JSON', () => {
    const result = makeSummaryResult()
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains project info', () => {
    const result = makeSummaryResult()
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.project.name).toBe('test-project')
    expect(parsed.project.version).toBe('1.0.0')
  })

  it('contains code overview', () => {
    const result = makeSummaryResult()
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.code.totalFiles).toBe(20)
    expect(parsed.code.totalLines).toBe(200)
  })

  it('contains health score', () => {
    const result = makeSummaryResult()
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.health.grade).toBe('B')
    expect(parsed.health.overall).toBe(84)
  })

  it('contains issues', () => {
    const result = makeSummaryResult({
      issues: makeQuickIssues({ todos: 5 }),
    })
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.issues.todos).toBe(5)
  })

  it('contains git as null when not available', () => {
    const result = makeSummaryResult({ git: null })
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.git).toBeNull()
  })

  it('contains git data when available', () => {
    const result = makeSummaryResult({
      git: {
        branch: 'main',
        isDirty: true,
        lastCommitDate: '1 hour ago',
        totalBranches: 2,
        totalCommits: 10,
        totalContributors: 3,
        totalTags: 1,
      },
    })
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.git.branch).toBe('main')
    expect(parsed.git.totalCommits).toBe(10)
    expect(parsed.git.isDirty).toBe(true)
  })

  it('contains topFiles array', () => {
    const result = makeSummaryResult({
      topFiles: [{ lines: 100, path: 'big.ts' }],
    })
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.topFiles).toHaveLength(1)
    expect(parsed.topFiles[0].path).toBe('big.ts')
  })

  it('contains recentChanges array', () => {
    const result = makeSummaryResult({
      recentChanges: [{ date: '2 hours ago', file: 'index.ts' }],
    })
    const output = formatSummaryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.recentChanges).toHaveLength(1)
    expect(parsed.recentChanges[0].file).toBe('index.ts')
  })
})
