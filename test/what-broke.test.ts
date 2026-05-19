import { describe, it, expect } from 'vitest'

import {
  parseDiffNumstat,
  parseGitLog,
  categorizeFileChange,
  countTodosInDiff,
  countSecurityIssuesInDiff,
  estimateComplexityDelta,
  analyzeDiff,
  detectRegressionIndicators,
  generateSuggestions,
  buildWhatBrokeResult,
  sourceBaseName,
  type CommitChange,
  type FileChange,
} from '../src/commands/what-broke-helpers.js'

import {
  statusIcon,
  riskBadge,
  severityIcon,
  formatCommitTimeline,
  formatFileChanges,
  formatIndicators,
  formatAnalysisSummary,
  formatSuggestions,
  formatWhatBrokeTable,
  formatWhatBrokeJson,
} from '../src/commands/what-broke-format-helpers.js'

// ─── parseDiffNumstat ───────────────────────────────────

describe('parseDiffNumstat', () => {
  it('parses basic numstat line', () => {
    const files = parseDiffNumstat('10\t5\tsrc/main.ts')
    expect(files.length).toBe(1)
    expect(files[0].additions).toBe(10)
    expect(files[0].deletions).toBe(5)
    expect(files[0].file).toBe('src/main.ts')
    expect(files[0].totalChange).toBe(15)
    expect(files[0].status).toBe('modified')
  })

  it('parses multiple lines', () => {
    const input = '10\t5\ta.ts\n3\t0\tb.ts'
    const files = parseDiffNumstat(input)
    expect(files.length).toBe(2)
  })

  it('handles binary files (dashes)', () => {
    const files = parseDiffNumstat('-\t-\timage.png')
    expect(files[0].additions).toBe(0)
    expect(files[0].deletions).toBe(0)
  })

  it('returns empty for empty input', () => {
    expect(parseDiffNumstat('')).toEqual([])
  })

  it('handles rename syntax', () => {
    const files = parseDiffNumstat('5\t2\t{old.ts => new.ts}')
    expect(files[0].status).toBe('renamed')
    expect(files[0].previousPath).toBe('old.ts')
    expect(files[0].file).toBe('new.ts')
  })

  it('skips malformed lines', () => {
    const files = parseDiffNumstat('badline')
    expect(files).toEqual([])
  })
})

// ─── parseGitLog ────────────────────────────────────────

describe('parseGitLog', () => {
  it('parses log lines', () => {
    const input = 'abc123def|Alice|2024-01-15|feat: add login'
    const commits = parseGitLog(input)
    expect(commits.length).toBe(1)
    expect(commits[0].hash).toBe('abc123def')
    expect(commits[0].shortHash).toBe('abc123d')
    expect(commits[0].author).toBe('Alice')
    expect(commits[0].message).toBe('feat: add login')
  })

  it('parses multiple commits', () => {
    const input = 'hash1|A|2024-01-01|m1\nhash2|B|2024-01-02|m2'
    expect(parseGitLog(input).length).toBe(2)
  })

  it('returns empty for empty input', () => {
    expect(parseGitLog('')).toEqual([])
  })

  it('skips lines with fewer than 4 parts', () => {
    expect(parseGitLog('only|two')).toEqual([])
  })

  it('preserves pipes in message', () => {
    const commits = parseGitLog('h|A|2024-01-01|fix: a | b | c')
    expect(commits[0].message).toBe('fix: a | b | c')
  })
})

// ─── categorizeFileChange ───────────────────────────────

describe('categorizeFileChange', () => {
  it('categorizes source files', () => {
    expect(categorizeFileChange('src/main.ts')).toBe('source')
    expect(categorizeFileChange('lib/utils.js')).toBe('source')
    expect(categorizeFileChange('app.tsx')).toBe('source')
  })

  it('categorizes test files', () => {
    expect(categorizeFileChange('test/main.test.ts')).toBe('test')
    expect(categorizeFileChange('src/utils.spec.ts')).toBe('test')
    expect(categorizeFileChange('__tests__/foo.ts')).toBe('test')
  })

  it('categorizes config files', () => {
    expect(categorizeFileChange('package.json')).toBe('config')
    expect(categorizeFileChange('tsconfig.json')).toBe('config')
    expect(categorizeFileChange('vitest.config.ts')).toBe('config')
  })

  it('categorizes other files', () => {
    expect(categorizeFileChange('README.md')).toBe('other')
    expect(categorizeFileChange('style.css')).toBe('other')
  })
})

// ─── countTodosInDiff ───────────────────────────────────

describe('countTodosInDiff', () => {
  it('counts new TODOs', () => {
    const diff = '+ // TODO: implement\n+ const x = 1\n+ # FIXME: bug'
    const result = countTodosInDiff(diff)
    expect(result.newTodos).toBe(2)
  })

  it('counts resolved TODOs', () => {
    const diff = '- // TODO: old\n- # FIXME: gone'
    const result = countTodosInDiff(diff)
    expect(result.resolvedTodos).toBe(2)
  })

  it('ignores context lines', () => {
    const diff = '  // TODO: context\n  const y = 2'
    expect(countTodosInDiff(diff)).toEqual({ newTodos: 0, resolvedTodos: 0 })
  })

  it('handles empty diff', () => {
    expect(countTodosInDiff('')).toEqual({ newTodos: 0, resolvedTodos: 0 })
  })

  it('detects HACK and XXX', () => {
    const diff = '+ // HACK: workaround\n+ // XXX: broken'
    expect(countTodosInDiff(diff).newTodos).toBe(2)
  })
})

// ─── countSecurityIssuesInDiff ──────────────────────────

describe('countSecurityIssuesInDiff', () => {
  it('detects eval', () => {
    expect(countSecurityIssuesInDiff('+ eval("x")')).toBe(1)
  })

  it('detects innerHTML', () => {
    expect(countSecurityIssuesInDiff("+ el.innerHTML = '<b>hi</b>'")).toBe(1)
  })

  it('detects hardcoded secrets', () => {
    expect(countSecurityIssuesInDiff('+ const password = "secret123"')).toBe(1)
  })

  it('ignores removal lines', () => {
    expect(countSecurityIssuesInDiff('- eval("x")')).toBe(0)
  })

  it('returns zero for clean diff', () => {
    expect(countSecurityIssuesInDiff('+ const x = 1')).toBe(0)
  })
})

// ─── estimateComplexityDelta ────────────────────────────

describe('estimateComplexityDelta', () => {
  it('estimates positive delta for additions', () => {
    const files: FileChange[] = [
      { additions: 100, deletions: 10, file: 'src/a.ts', previousPath: null, status: 'modified', totalChange: 110 },
    ]
    expect(estimateComplexityDelta(files)).toBeGreaterThan(0)
  })

  it('weights source files more than config', () => {
    const src: FileChange[] = [
      { additions: 100, deletions: 0, file: 'src/a.ts', previousPath: null, status: 'added', totalChange: 100 },
    ]
    const cfg: FileChange[] = [
      { additions: 100, deletions: 0, file: 'package.json', previousPath: null, status: 'modified', totalChange: 100 },
    ]
    expect(estimateComplexityDelta(src)).toBeGreaterThan(estimateComplexityDelta(cfg))
  })

  it('skips test files', () => {
    const files: FileChange[] = [
      { additions: 100, deletions: 0, file: 'test/a.test.ts', previousPath: null, status: 'added', totalChange: 100 },
    ]
    expect(estimateComplexityDelta(files)).toBe(0)
  })
})

// ─── analyzeDiff ────────────────────────────────────────

describe('analyzeDiff', () => {
  it('analyzes a simple diff', () => {
    const commits: CommitChange[] = [
      { additions: 50, author: 'Alice', date: '2024-01-01', deletions: 10, filesChanged: 3, hash: 'abc123', message: 'feat: add', shortHash: 'abc1234' },
    ]
    const files: FileChange[] = [
      { additions: 50, deletions: 10, file: 'src/main.ts', previousPath: null, status: 'modified', totalChange: 60 },
    ]
    const analysis = analyzeDiff(commits, files, '')
    expect(analysis.authors).toEqual(['Alice'])
    expect(analysis.sourceFilesChanged).toBe(1)
    expect(analysis.testFilesChanged).toBe(0)
  })

  it('computes risk level from risk factors', () => {
    const commits: CommitChange[] = []
    const files: FileChange[] = []
    const diff = '+ // TODO: a\n+ // TODO: b\n+ // TODO: c\n+ // TODO: d\n+ // TODO: e'
    const analysis = analyzeDiff(commits, files, diff)
    expect(analysis.newTodos).toBe(5)
    expect(analysis.riskLevel).not.toBe('low')
  })

  it('detects security issues', () => {
    const analysis = analyzeDiff([], [], '+ eval("x")')
    expect(analysis.newSecurityIssues).toBe(1)
    expect(analysis.riskFactors).toContain('Security issues introduced')
  })

  it('returns low risk for clean diff', () => {
    const analysis = analyzeDiff([], [], '')
    expect(analysis.riskLevel).toBe('low')
  })
})

// ─── detectRegressionIndicators ─────────────────────────

describe('detectRegressionIndicators', () => {
  const makeAnalysis = (overrides: Partial<import('../src/commands/what-broke-helpers.js').DiffAnalysis> = {}) => {
    const base: import('../src/commands/what-broke-helpers.js').DiffAnalysis = {
      authors: ['Alice'],
      commits: [],
      complexityDelta: 0,
      files: [],
      newSecurityIssues: 0,
      newTodos: 0,
      resolvedTodos: 0,
      riskFactors: [],
      riskLevel: 'low',
      sourceFilesChanged: 0,
      testFilesChanged: 0,
    }
    return { ...base, ...overrides }
  }

  it('detects large-file-change', () => {
    const analysis = makeAnalysis({
      commits: [{ additions: 400, author: 'A', date: '', deletions: 200, filesChanged: 5, hash: 'abc', message: 'big', shortHash: 'abc' }],
    })
    const indicators = detectRegressionIndicators(analysis)
    expect(indicators.some((i) => i.type === 'large-file-change')).toBe(true)
  })

  it('detects many-authors', () => {
    const analysis = makeAnalysis({ authors: ['A', 'B', 'C', 'D', 'E', 'F'] })
    const indicators = detectRegressionIndicators(analysis)
    expect(indicators.some((i) => i.type === 'many-authors')).toBe(true)
  })

  it('detects complexity-spike', () => {
    const analysis = makeAnalysis({ complexityDelta: 150 })
    const indicators = detectRegressionIndicators(analysis)
    expect(indicators.some((i) => i.type === 'complexity-spike')).toBe(true)
  })

  it('detects test-ratio-drop', () => {
    const files: FileChange[] = Array.from({ length: 6 }, (_, i) => ({
      additions: 10, deletions: 0, file: `src/${i}.ts`, previousPath: null, status: 'modified' as const, totalChange: 10,
    }))
    const analysis = makeAnalysis({ sourceFilesChanged: 6, testFilesChanged: 0, files })
    const indicators = detectRegressionIndicators(analysis)
    expect(indicators.some((i) => i.type === 'test-ratio-drop')).toBe(true)
  })

  it('detects new-todos accumulation', () => {
    const analysis = makeAnalysis({ newTodos: 10, resolvedTodos: 2 })
    const indicators = detectRegressionIndicators(analysis)
    expect(indicators.some((i) => i.type === 'new-todos')).toBe(true)
  })

  it('detects security-introduction', () => {
    const analysis = makeAnalysis({ newSecurityIssues: 2 })
    const indicators = detectRegressionIndicators(analysis)
    expect(indicators.some((i) => i.type === 'security-introduction')).toBe(true)
  })

  it('returns empty for healthy analysis', () => {
    const indicators = detectRegressionIndicators(makeAnalysis())
    expect(indicators).toEqual([])
  })
})

// ─── generateSuggestions ────────────────────────────────

describe('generateSuggestions', () => {
  it('suggests adding tests when none changed', () => {
    const analysis: import('../src/commands/what-broke-helpers.js').DiffAnalysis = {
      authors: [], commits: [], complexityDelta: 0, files: [], newSecurityIssues: 0,
      newTodos: 0, resolvedTodos: 0, riskFactors: [], riskLevel: 'low',
      sourceFilesChanged: 5, testFilesChanged: 0,
    }
    const suggestions = generateSuggestions(analysis, [])
    expect(suggestions).toContain('Add tests for the changed source files')
  })

  it('suggests fixing security issues', () => {
    const analysis: import('../src/commands/what-broke-helpers.js').DiffAnalysis = {
      authors: [], commits: [], complexityDelta: 0, files: [], newSecurityIssues: 2,
      newTodos: 0, resolvedTodos: 0, riskFactors: [], riskLevel: 'medium',
      sourceFilesChanged: 0, testFilesChanged: 0,
    }
    const suggestions = generateSuggestions(analysis, [])
    expect(suggestions.some((s) => s.includes('security'))).toBe(true)
  })

  it('suggests healthy message when all good', () => {
    const analysis: import('../src/commands/what-broke-helpers.js').DiffAnalysis = {
      authors: [], commits: [], complexityDelta: 0, files: [], newSecurityIssues: 0,
      newTodos: 0, resolvedTodos: 0, riskFactors: [], riskLevel: 'low',
      sourceFilesChanged: 0, testFilesChanged: 0,
    }
    const suggestions = generateSuggestions(analysis, [])
    expect(suggestions).toContain('Changes look healthy — no action needed')
  })

  it('suggests splitting large commits', () => {
    const analysis: import('../src/commands/what-broke-helpers.js').DiffAnalysis = {
      authors: [], commits: [], complexityDelta: 0, files: [], newSecurityIssues: 0,
      newTodos: 0, resolvedTodos: 0, riskFactors: [], riskLevel: 'low',
      sourceFilesChanged: 0, testFilesChanged: 0,
    }
    const indicators: import('../src/commands/what-broke-helpers.js').RegressionIndicator[] = [
      { type: 'large-file-change', description: 'big commit', severity: 'warning', files: [] },
    ]
    const suggestions = generateSuggestions(analysis, indicators)
    expect(suggestions.some((s) => s.includes('split'))).toBe(true)
  })
})

// ─── buildWhatBrokeResult ───────────────────────────────

describe('buildWhatBrokeResult', () => {
  it('builds complete result', () => {
    const commits: CommitChange[] = [
      { additions: 50, author: 'A', date: '2024-01-01', deletions: 10, filesChanged: 2, hash: 'abc', message: 'feat', shortHash: 'abc' },
    ]
    const files: FileChange[] = [
      { additions: 30, deletions: 10, file: 'src/a.ts', previousPath: null, status: 'modified', totalChange: 40 },
    ]
    const result = buildWhatBrokeResult(commits, files, '')
    expect(result.analysis.commits.length).toBe(1)
    expect(result.analysis.files.length).toBe(1)
    expect(result.indicators).toBeDefined()
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('handles empty inputs', () => {
    const result = buildWhatBrokeResult([], [], '')
    expect(result.analysis.riskLevel).toBe('low')
    expect(result.indicators).toEqual([])
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts', () => {
    expect(sourceBaseName('src/what-broke-helpers.ts')).toBe('what-broke-helpers')
  })
})

// ─── statusIcon ─────────────────────────────────────────

describe('statusIcon', () => {
  it('returns icon for each status', () => {
    expect(typeof statusIcon('added')).toBe('string')
    expect(typeof statusIcon('deleted')).toBe('string')
    expect(typeof statusIcon('modified')).toBe('string')
    expect(typeof statusIcon('renamed')).toBe('string')
    expect(statusIcon('unknown')).toBe(' ')
  })
})

// ─── riskBadge ──────────────────────────────────────────

describe('riskBadge', () => {
  it('returns badge for each level', () => {
    expect(typeof riskBadge('high')).toBe('string')
    expect(typeof riskBadge('medium')).toBe('string')
    expect(typeof riskBadge('low')).toBe('string')
    expect(riskBadge('unknown')).toBe('unknown')
  })
})

// ─── severityIcon ───────────────────────────────────────

describe('severityIcon', () => {
  it('returns icon for critical', () => {
    expect(typeof severityIcon('critical')).toBe('string')
  })

  it('returns icon for warning', () => {
    expect(typeof severityIcon('warning')).toBe('string')
  })
})

// ─── formatCommitTimeline ───────────────────────────────

describe('formatCommitTimeline', () => {
  it('formats commits', () => {
    const commits: CommitChange[] = [
      { additions: 0, author: 'Alice', date: '2024-01-15T10:00:00', deletions: 0, filesChanged: 1, hash: 'abc1234', message: 'feat: add', shortHash: 'abc1234' },
    ]
    const text = formatCommitTimeline(commits)
    expect(text).toContain('abc1234')
    expect(text).toContain('Alice')
    expect(text).toContain('feat: add')
  })

  it('handles empty commits', () => {
    const text = formatCommitTimeline([])
    expect(text).toContain('No commits')
  })

  it('truncates long commit lists', () => {
    const commits: CommitChange[] = Array.from({ length: 25 }, (_, i) => ({
      additions: 0, author: 'A', date: '', deletions: 0, filesChanged: 0,
      hash: `hash${i}`, message: `m${i}`, shortHash: `hash${i}`,
    }))
    const text = formatCommitTimeline(commits)
    expect(text).toContain('more')
  })
})

// ─── formatFileChanges ──────────────────────────────────

describe('formatFileChanges', () => {
  it('formats file changes', () => {
    const files: FileChange[] = [
      { additions: 10, deletions: 5, file: 'src/a.ts', previousPath: null, status: 'modified', totalChange: 15 },
    ]
    const text = formatFileChanges(files)
    expect(text).toContain('src/a.ts')
  })

  it('handles empty files', () => {
    expect(formatFileChanges([])).toContain('No file changes')
  })
})

// ─── formatIndicators ───────────────────────────────────

describe('formatIndicators', () => {
  it('formats indicators', () => {
    const indicators: import('../src/commands/what-broke-helpers.js').RegressionIndicator[] = [
      { type: 'security-introduction', description: '2 issues', severity: 'critical', files: [] },
    ]
    const text = formatIndicators(indicators)
    expect(text).toContain('security-introduction')
  })

  it('handles empty indicators', () => {
    expect(formatIndicators([])).toContain('No regression')
  })
})

// ─── formatAnalysisSummary ──────────────────────────────

describe('formatAnalysisSummary', () => {
  it('formats analysis summary', () => {
    const analysis: import('../src/commands/what-broke-helpers.js').DiffAnalysis = {
      authors: ['Alice', 'Bob'],
      commits: [{ additions: 10, author: 'Alice', date: '', deletions: 5, filesChanged: 1, hash: 'h', message: 'm', shortHash: 'h' }],
      complexityDelta: 20,
      files: [],
      newSecurityIssues: 0,
      newTodos: 3,
      resolvedTodos: 1,
      riskFactors: ['Low test ratio'],
      riskLevel: 'medium',
      sourceFilesChanged: 4,
      testFilesChanged: 1,
    }
    const text = formatAnalysisSummary(analysis)
    expect(text).toContain('MEDIUM RISK')
    expect(text).toContain('Alice')
    expect(text).toContain('Low test ratio')
  })
})

// ─── formatSuggestions ──────────────────────────────────

describe('formatSuggestions', () => {
  it('formats suggestions', () => {
    const text = formatSuggestions(['Add tests', 'Refactor code'])
    expect(text).toContain('Add tests')
    expect(text).toContain('Refactor code')
  })

  it('handles empty suggestions', () => {
    expect(formatSuggestions([])).toBe('')
  })
})

// ─── formatWhatBrokeTable ───────────────────────────────

describe('formatWhatBrokeTable', () => {
  it('formats complete table', () => {
    const result: import('../src/commands/what-broke-helpers.js').WhatBrokeResult = {
      analysis: {
        authors: [], commits: [], complexityDelta: 0, files: [], newSecurityIssues: 0,
        newTodos: 0, resolvedTodos: 0, riskFactors: [], riskLevel: 'low',
        sourceFilesChanged: 0, testFilesChanged: 0,
      },
      indicators: [],
      suggestions: ['Changes look healthy — no action needed'],
    }
    const text = formatWhatBrokeTable(result)
    expect(text.length).toBeGreaterThan(0)
  })
})

// ─── formatWhatBrokeJson ────────────────────────────────

describe('formatWhatBrokeJson', () => {
  it('produces valid JSON', () => {
    const result: import('../src/commands/what-broke-helpers.js').WhatBrokeResult = {
      analysis: {
        authors: [], commits: [], complexityDelta: 0, files: [], newSecurityIssues: 0,
        newTodos: 0, resolvedTodos: 0, riskFactors: [], riskLevel: 'low',
        sourceFilesChanged: 0, testFilesChanged: 0,
      },
      indicators: [],
      suggestions: [],
    }
    const json = formatWhatBrokeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.analysis.riskLevel).toBe('low')
    expect(parsed.indicators).toEqual([])
  })
})
