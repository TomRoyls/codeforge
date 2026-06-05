import { describe, it, expect } from 'vitest'
import { DiffAnalyzer, ReviewEngine, ReviewFormatter, BUILTIN_RULES, SEVERITY_LEVELS, DEFAULT_CONFIG } from '../src/core/code-review/index.js'
import type { DiffFile, DiffChange, ReviewContext } from '../src/core/code-review/index.js'

// ─── DiffAnalyzer ───

describe('DiffAnalyzer', () => {
  const analyzer = new DiffAnalyzer()

  describe('parseUnifiedDiff', () => {
    it('should return empty array for empty string', () => {
      expect(analyzer.parseUnifiedDiff('')).toEqual([])
    })

    it('should return empty array for whitespace only', () => {
      expect(analyzer.parseUnifiedDiff('   ')).toEqual([])
    })

    it('should parse a simple diff with additions', () => {
      const diff = [
        'diff --git a/file.ts b/file.ts',
        '--- a/file.ts',
        '+++ b/file.ts',
        '@@ -1,3 +1,4 @@',
        ' line1',
        '+added line',
        ' line2',
        ' line3',
      ].join('\n')
      const files = analyzer.parseUnifiedDiff(diff)
      expect(files.length).toBe(1)
      expect(files[0]!.path).toBe('file.ts')
      expect(files[0]!.status).toBe('modified')
      expect(files[0]!.additions).toBe(1)
      expect(files[0]!.deletions).toBe(0)
    })

    it('should detect new file mode', () => {
      const diff = [
        'diff --git a/new.ts b/new.ts',
        'new file mode 100644',
        '--- /dev/null',
        '+++ b/new.ts',
        '@@ -0,0 +1,2 @@',
        '+line1',
        '+line2',
      ].join('\n')
      const files = analyzer.parseUnifiedDiff(diff)
      expect(files[0]!.status).toBe('added')
      expect(files[0]!.additions).toBe(2)
    })

    it('should detect deleted file mode', () => {
      const diff = [
        'diff --git a/old.ts b/old.ts',
        'deleted file mode 100644',
        '--- a/old.ts',
        '+++ /dev/null',
        '@@ -1,2 +0,0 @@',
        '-line1',
        '-line2',
      ].join('\n')
      const files = analyzer.parseUnifiedDiff(diff)
      expect(files[0]!.status).toBe('deleted')
      expect(files[0]!.deletions).toBe(2)
    })

    it('should parse multiple files in a single diff', () => {
      const diff = [
        'diff --git a/a.ts b/a.ts',
        '--- a/a.ts',
        '+++ b/a.ts',
        '@@ -1 +1 @@',
        '-old',
        '+new',
        'diff --git a/b.ts b/b.ts',
        '--- a/b.ts',
        '+++ b/b.ts',
        '@@ -1 +1 @@',
        '-old2',
        '+new2',
      ].join('\n')
      const files = analyzer.parseUnifiedDiff(diff)
      expect(files.length).toBe(2)
    })
  })

  describe('parseDiffHeader', () => {
    it('should parse same-path header as modified', () => {
      const result = analyzer.parseDiffHeader('diff --git a/file.ts b/file.ts')
      expect(result.path).toBe('file.ts')
      expect(result.status).toBe('modified')
    })

    it('should detect added file when a/ is /dev/null', () => {
      const result = analyzer.parseDiffHeader('diff --git a//dev/null b/new.ts')
      expect(result.status).toBe('added')
    })

    it('should detect deleted file when b/ is /dev/null', () => {
      const result = analyzer.parseDiffHeader('diff --git a/old.ts b//dev/null')
      expect(result.status).toBe('deleted')
    })

    it('should detect renamed when paths differ', () => {
      const result = analyzer.parseDiffHeader('diff --git a/old.ts b/new.ts')
      expect(result.status).toBe('renamed')
      expect(result.path).toBe('new.ts')
    })
  })

  describe('parseHunk', () => {
    it('should parse hunk header and changes', () => {
      const hunk = analyzer.parseHunk('@@ -1,3 +1,4 @@\n line1\n+added\n line2')
      expect(hunk.oldStart).toBe(1)
      expect(hunk.oldLines).toBe(3)
      expect(hunk.newStart).toBe(1)
      expect(hunk.newLines).toBe(4)
      expect(hunk.changes.length).toBe(3)
    })

    it('should handle hunk without count (defaulting to 1)', () => {
      const hunk = analyzer.parseHunk('@@ -5 +5 @@\n+line')
      expect(hunk.oldLines).toBe(1)
      expect(hunk.newLines).toBe(1)
    })

    it('should return default hunk for invalid header', () => {
      const hunk = analyzer.parseHunk('not a hunk header\n+line')
      expect(hunk.oldStart).toBe(0)
    })
  })

  describe('countAdditions / countDeletions', () => {
    const file: DiffFile = {
      path: 'test.ts',
      status: 'modified',
      additions: 0,
      deletions: 0,
      hunks: [{
        oldStart: 1, oldLines: 3, newStart: 1, newLines: 4,
        content: '@@ -1,3 +1,4 @@',
        changes: [
          { type: 'normal', content: 'line1', lineNumber: 1 },
          { type: 'add', content: 'added', lineNumber: 2 },
          { type: 'delete', content: 'removed', lineNumber: 2 },
        ],
      }],
    }

    it('should count additions', () => {
      expect(analyzer.countAdditions(file)).toBe(1)
    })

    it('should count deletions', () => {
      expect(analyzer.countDeletions(file)).toBe(1)
    })
  })

  describe('getChangedLines', () => {
    it('should return line numbers of additions and deletions', () => {
      const file: DiffFile = {
        path: 'test.ts', status: 'modified', additions: 0, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 2, newStart: 1, newLines: 2,
          content: '@@ -1,2 +1,2 @@',
          changes: [
            { type: 'add', content: 'a', lineNumber: 5 },
            { type: 'delete', content: 'b', lineNumber: 3 },
            { type: 'add', content: 'c', lineNumber: 10 },
          ],
        }],
      }
      const result = analyzer.getChangedLines(file)
      expect(result.additions).toEqual([5, 10])
      expect(result.deletions).toEqual([3])
    })
  })

  describe('isLargeChange', () => {
    it('should detect large changes', () => {
      const file: DiffFile = {
        path: 'big.ts', status: 'modified', additions: 400, deletions: 200,
        hunks: [],
      }
      expect(analyzer.isLargeChange(file, 500)).toBe(true)
      expect(analyzer.isLargeChange(file, 700)).toBe(false)
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(analyzer.getFileExtension('file.ts')).toBe('ts')
      expect(analyzer.getFileExtension('file.test.js')).toBe('js')
      expect(analyzer.getFileExtension('Makefile')).toBe('')
      expect(analyzer.getFileExtension('file.')).toBe('')
    })
  })

  describe('isTestFile', () => {
    it('should detect test files', () => {
      expect(analyzer.isTestFile('foo.test.ts')).toBe(true)
      expect(analyzer.isTestFile('foo.spec.js')).toBe(true)
      expect(analyzer.isTestFile('__tests__/foo.ts')).toBe(true)
      expect(analyzer.isTestFile('test/foo.ts')).toBe(true)
      expect(analyzer.isTestFile('tests/foo.ts')).toBe(true)
      expect(analyzer.isTestFile('src/foo.ts')).toBe(false)
    })
  })

  describe('isConfigFile', () => {
    it('should detect config files', () => {
      expect(analyzer.isConfigFile('tsconfig.json')).toBe(true)
      expect(analyzer.isConfigFile('package.json')).toBe(true)
      expect(analyzer.isConfigFile('.eslintrc')).toBe(true)
      expect(analyzer.isConfigFile('vitest.config.ts')).toBe(true)
      expect(analyzer.isConfigFile('src/index.ts')).toBe(false)
    })
  })
})

// ─── ReviewEngine ───

describe('ReviewEngine', () => {
  describe('construction', () => {
    it('should use default config', () => {
      const engine = new ReviewEngine()
      expect(engine.getRules().length).toBe(BUILTIN_RULES.length)
    })

    it('should accept custom config', () => {
      const engine = new ReviewEngine({ maxComments: 10 })
      expect(engine).toBeDefined()
    })
  })

  describe('addRule', () => {
    it('should add a custom rule', () => {
      const engine = new ReviewEngine()
      const initialCount = engine.getRules().length
      engine.addRule({
        id: 'custom-rule',
        name: 'Custom',
        category: 'test',
        severity: 'info',
        evaluate: () => null,
      })
      expect(engine.getRules().length).toBe(initialCount + 1)
    })
  })

  describe('review', () => {
    it('should return score 100 for clean files', () => {
      const engine = new ReviewEngine()
      const files: DiffFile[] = [{
        path: 'clean.ts', status: 'modified', additions: 0, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 1, newStart: 1, newLines: 1,
          content: '@@ -1 +1 @@',
          changes: [{ type: 'normal', content: 'clean line', lineNumber: 1 }],
        }],
      }]
      const result = engine.review(files)
      expect(result.score).toBe(100)
      expect(result.approved).toBe(true)
      expect(result.comments.length).toBe(0)
    })

    it('should detect console.log', () => {
      const engine = new ReviewEngine()
      const files: DiffFile[] = [{
        path: 'app.ts', status: 'modified', additions: 1, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 0, newStart: 1, newLines: 1,
          content: '@@ -0,0 +1 @@',
          changes: [{ type: 'add', content: 'console.log("hello")', lineNumber: 1 }],
        }],
      }]
      const result = engine.review(files)
      const consoleLog = result.comments.find((c) => c.ruleId === 'no-console')
      expect(consoleLog).toBeDefined()
    })

    it('should detect debugger statements', () => {
      const engine = new ReviewEngine()
      const files: DiffFile[] = [{
        path: 'debug.ts', status: 'modified', additions: 1, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 0, newStart: 1, newLines: 1,
          content: '@@ -0,0 +1 @@',
          changes: [{ type: 'add', content: 'debugger;', lineNumber: 1 }],
        }],
      }]
      const result = engine.review(files)
      const debug = result.comments.find((c) => c.ruleId === 'no-debugger')
      expect(debug).toBeDefined()
      expect(debug!.severity).toBe('critical')
    })

    it('should detect TODO comments', () => {
      const engine = new ReviewEngine()
      const files: DiffFile[] = [{
        path: 'todo.ts', status: 'modified', additions: 1, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 0, newStart: 1, newLines: 1,
          content: '@@ -0,0 +1 @@',
          changes: [{ type: 'add', content: '// TODO: fix this later', lineNumber: 1 }],
        }],
      }]
      const result = engine.review(files)
      expect(result.comments.some((c) => c.ruleId === 'no-todo-comments')).toBe(true)
    })

    it('should detect hardcoded secrets', () => {
      const engine = new ReviewEngine()
      const files: DiffFile[] = [{
        path: 'secrets.ts', status: 'modified', additions: 1, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 0, newStart: 1, newLines: 1,
          content: '@@ -0,0 +1 @@',
          changes: [{ type: 'add', content: 'const apiKey = "sk-abcdef1234567890abcdef1234567890"', lineNumber: 1 }],
        }],
      }]
      const result = engine.review(files)
      expect(result.comments.some((c) => c.ruleId === 'no-hardcoded-secrets')).toBe(true)
    })

    it('should respect ignorePatterns', () => {
      const engine = new ReviewEngine({ ignorePatterns: ['generated'] })
      const files: DiffFile[] = [{
        path: 'generated/output.ts', status: 'modified', additions: 1, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 0, newStart: 1, newLines: 1,
          content: '@@ -0,0 +1 @@',
          changes: [{ type: 'add', content: 'console.log("hello")', lineNumber: 1 }],
        }],
      }]
      const result = engine.review(files)
      expect(result.comments.length).toBe(0)
    })

    it('should respect enabledCategories filter', () => {
      const engine = new ReviewEngine({ enabledCategories: ['security'] })
      const files: DiffFile[] = [{
        path: 'app.ts', status: 'modified', additions: 1, deletions: 0,
        hunks: [{
          oldStart: 1, oldLines: 0, newStart: 1, newLines: 1,
          content: '@@ -0,0 +1 @@',
          changes: [{ type: 'add', content: 'console.log("hello")', lineNumber: 1 }],
        }],
      }]
      const result = engine.review(files)
      expect(result.comments.every((c) => c.category === 'security')).toBe(true)
    })

    it('should calculate score correctly with penalties', () => {
      const engine = new ReviewEngine()
      const result: { comments: Array<{ severity: string }>; summary: { totalComments: number } } = {
        comments: [],
        summary: { totalComments: 0 },
      }
      // Test via review with known violations
      const mockResult = {
        comments: Array(5).fill({ severity: 'minor', category: 'style', filePath: 'a.ts', line: 1, message: 'test', ruleId: 'test', side: 'RIGHT' as const }),
        summary: { totalComments: 5, blockerCount: 0, criticalCount: 0, majorCount: 0, minorCount: 5, infoCount: 0, filesReviewed: 1, filesWithIssues: 1, categories: {} },
      }
      const score = engine.calculateScore(mockResult as any)
      expect(score).toBe(75)
    })
  })

  describe('calculateScore', () => {
    it('should return 100 for no comments', () => {
      const engine = new ReviewEngine()
      const result = {
        comments: [],
        summary: { totalComments: 0, blockerCount: 0, criticalCount: 0, majorCount: 0, minorCount: 0, infoCount: 0, filesReviewed: 0, filesWithIssues: 0, categories: {} },
      }
      expect(engine.calculateScore(result as any)).toBe(100)
    })
  })

  describe('isApproved', () => {
    it('should approve when score meets threshold', () => {
      const engine = new ReviewEngine({ approvalThreshold: 0.8 })
      expect(engine.isApproved(80)).toBe(true)
      expect(engine.isApproved(79)).toBe(false)
    })
  })

  describe('filterBySeverity', () => {
    it('should filter comments by minimum severity', () => {
      const engine = new ReviewEngine()
      const comments = [
        { severity: 'info', filePath: 'a.ts', line: 1, message: 'm', side: 'RIGHT' as const, category: 'cat' },
        { severity: 'critical', filePath: 'a.ts', line: 2, message: 'm', side: 'RIGHT' as const, category: 'cat' },
        { severity: 'minor', filePath: 'a.ts', line: 3, message: 'm', side: 'RIGHT' as const, category: 'cat' },
      ]
      const filtered = engine.filterBySeverity(comments as any, 'major')
      expect(filtered.length).toBe(1)
      expect(filtered[0]!.severity).toBe('critical')
    })
  })

  describe('deduplicateComments', () => {
    it('should remove duplicate comments', () => {
      const engine = new ReviewEngine()
      const comments = [
        { filePath: 'a.ts', line: 1, message: 'msg', severity: 'info' as const, category: 'cat', side: 'RIGHT' as const, ruleId: 'r1' },
        { filePath: 'a.ts', line: 1, message: 'msg', severity: 'info' as const, category: 'cat', side: 'RIGHT' as const, ruleId: 'r1' },
      ]
      const deduped = engine.deduplicateComments(comments as any)
      expect(deduped.length).toBe(1)
    })
  })
})

// ─── ReviewFormatter ───

describe('ReviewFormatter', () => {
  const formatter = new ReviewFormatter()

  const mockResult = {
    comments: [{
      filePath: 'test.ts', line: 5, side: 'RIGHT' as const,
      message: 'Test message', severity: 'major' as const,
      category: 'style', suggestion: 'Fix it', ruleId: 'test-rule',
    }],
    summary: {
      totalComments: 1, blockerCount: 0, criticalCount: 0,
      majorCount: 1, minorCount: 0, infoCount: 0,
      filesReviewed: 1, filesWithIssues: 1, categories: { style: 1 },
    },
    score: 90,
    approved: true,
  }

  describe('formatConsole', () => {
    it('should format result as console output', () => {
      const output = formatter.formatConsole(mockResult as any)
      expect(output).toContain('CODE REVIEW RESULTS')
      expect(output).toContain('90/100')
      expect(output).toContain('Test message')
    })
  })

  describe('formatMarkdown', () => {
    it('should format result as markdown', () => {
      const output = formatter.formatMarkdown(mockResult as any)
      expect(output).toContain('## Code Review Results')
      expect(output).toContain('90/100')
      expect(output).toContain('| MAJOR |')
    })
  })

  describe('formatJSON', () => {
    it('should format result as JSON', () => {
      const output = formatter.formatJSON(mockResult as any)
      const parsed = JSON.parse(output)
      expect(parsed.score).toBe(90)
      expect(parsed.comments.length).toBe(1)
    })
  })

  describe('formatGitHubComments', () => {
    it('should format as GitHub review comments', () => {
      const comments = formatter.formatGitHubComments(mockResult as any)
      expect(comments.length).toBe(1)
      expect(comments[0]!.path).toBe('test.ts')
      expect(comments[0]!.line).toBe(5)
    })
  })

  describe('formatSummary', () => {
    it('should format a one-line summary', () => {
      const summary = formatter.formatSummary(mockResult as any)
      expect(summary).toContain('90/100')
      expect(summary).toContain('APPROVED')
      expect(summary).toContain('1 issues')
    })
  })

  describe('formatDiffWithComments', () => {
    it('should inject comments into diff text', () => {
      const diff = '+console.log("hello")\n+const x = 1'
      const output = formatter.formatDiffWithComments(diff, mockResult.comments as any)
      expect(output).toContain('console.log')
    })
  })
})

// ─── Constants ───

describe('Constants', () => {
  it('should have SEVERITY_LEVELS with correct ordering', () => {
    expect(SEVERITY_LEVELS.blocker).toBeLessThan(SEVERITY_LEVELS.critical)
    expect(SEVERITY_LEVELS.critical).toBeLessThan(SEVERITY_LEVELS.major)
    expect(SEVERITY_LEVELS.major).toBeLessThan(SEVERITY_LEVELS.minor)
    expect(SEVERITY_LEVELS.minor).toBeLessThan(SEVERITY_LEVELS.info)
  })

  it('should have DEFAULT_CONFIG with sensible defaults', () => {
    expect(DEFAULT_CONFIG.maxComments).toBe(50)
    expect(DEFAULT_CONFIG.minSeverity).toBe('info')
    expect(DEFAULT_CONFIG.approvalThreshold).toBe(0.8)
  })

  it('should have 10 builtin rules', () => {
    expect(BUILTIN_RULES.length).toBe(10)
  })
})
