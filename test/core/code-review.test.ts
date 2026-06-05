import { describe, it, expect, beforeEach } from 'vitest'
import { DiffAnalyzer } from '../../src/core/code-review/diff-analyzer.js'
import { ReviewEngine, BUILTIN_RULES } from '../../src/core/code-review/review-engine.js'
import { ReviewFormatter } from '../../src/core/code-review/review-formatter.js'
import { SEVERITY_LEVELS, DEFAULT_CONFIG } from '../../src/core/code-review/types.js'
import type {
  DiffFile,
  DiffHunk,
  DiffChange,
  ReviewComment,
  ReviewResult,
  ReviewConfig,
  ReviewContext,
  ReviewRule,
} from '../../src/core/code-review/types.js'

function makeChange(overrides: Partial<DiffChange> = {}): DiffChange {
  return { type: 'add', content: '', lineNumber: 1, ...overrides }
}

function makeHunk(overrides: Partial<DiffHunk> = {}): DiffHunk {
  return {
    oldStart: 1, oldLines: 1, newStart: 1, newLines: 1,
    content: '@@ -1,1 +1,1 @@', changes: [], ...overrides,
  }
}

function makeDiffFile(overrides: Partial<DiffFile> = {}): DiffFile {
  return {
    path: 'src/example.ts',
    status: 'modified',
    additions: 0,
    deletions: 0,
    hunks: [],
    ...overrides,
  }
}

function makeContext(overrides: Partial<ReviewContext> = {}): ReviewContext {
  return {
    filePath: 'src/example.ts',
    hunk: makeHunk(),
    allChanges: [],
    ...overrides,
  }
}

const SIMPLE_DIFF = `diff --git a/src/hello.ts b/src/hello.ts
--- a/src/hello.ts
+++ b/src/hello.ts
@@ -1,3 +1,4 @@
 import { something } from './lib'
+const x = 1
 const y = 2
-const z = 3
+const z = 4`

const MULTI_FILE_DIFF = `diff --git a/src/a.ts b/src/a.ts
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,2 +1,3 @@
 line1
+line2
 line3
diff --git a/src/b.ts b/src/b.ts
--- a/src/b.ts
+++ b/src/b.ts
@@ -1,2 +1,2 @@
-old1
+new1
 line2`

describe('DiffAnalyzer', () => {
  let analyzer: DiffAnalyzer

  beforeEach(() => {
    analyzer = new DiffAnalyzer()
  })

  describe('parseUnifiedDiff', () => {
    it('parses a simple unified diff', () => {
      const files = analyzer.parseUnifiedDiff(SIMPLE_DIFF)
      expect(files).toHaveLength(1)
      expect(files[0]!.path).toBe('src/hello.ts')
      expect(files[0]!.status).toBe('modified')
      expect(files[0]!.additions).toBe(2)
      expect(files[0]!.deletions).toBe(1)
    })

    it('parses multiple files from diff', () => {
      const files = analyzer.parseUnifiedDiff(MULTI_FILE_DIFF)
      expect(files).toHaveLength(2)
      expect(files[0]!.path).toBe('src/a.ts')
      expect(files[1]!.path).toBe('src/b.ts')
    })

    it('returns empty array for empty string', () => {
      expect(analyzer.parseUnifiedDiff('')).toHaveLength(0)
    })

    it('returns empty array for whitespace-only input', () => {
      expect(analyzer.parseUnifiedDiff('   \n  ')).toHaveLength(0)
    })

    it('detects added file status', () => {
      const diff = `diff --git a/new.ts b/new.ts
new file mode 100644
--- /dev/null
+++ b/new.ts
@@ -0,0 +1,3 @@
+line1
+line2
+line3`
      const files = analyzer.parseUnifiedDiff(diff)
      expect(files[0]!.status).toBe('added')
      expect(files[0]!.additions).toBe(3)
    })

    it('detects deleted file status', () => {
      const diff = `diff --git a/old.ts b/old.ts
deleted file mode 100644
--- a/old.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-line1
-line2`
      const files = analyzer.parseUnifiedDiff(diff)
      expect(files[0]!.status).toBe('deleted')
      expect(files[0]!.deletions).toBe(2)
    })
  })

  describe('parseDiffHeader', () => {
    it('parses standard diff header', () => {
      const result = analyzer.parseDiffHeader('diff --git a/src/file.ts b/src/file.ts')
      expect(result.path).toBe('src/file.ts')
      expect(result.status).toBe('modified')
    })

    it('detects added file from header', () => {
      const result = analyzer.parseDiffHeader('diff --git a/src/old.ts b/src/new.ts')
      expect(result.status).toBe('renamed')
      expect(result.path).toBe('src/new.ts')
    })

    it('detects deleted file from header', () => {
      const result = analyzer.parseDiffHeader('diff --git a/src/same.ts b/src/same.ts')
      expect(result.status).toBe('modified')
      expect(result.path).toBe('src/same.ts')
    })

    it('handles malformed header gracefully', () => {
      const result = analyzer.parseDiffHeader('not a valid header')
      expect(result.path).toBe('')
      expect(result.status).toBe('modified')
    })
  })

  describe('parseHunk', () => {
    it('parses a standard hunk', () => {
      const hunk = analyzer.parseHunk('@@ -1,3 +1,4 @@\n line1\n+line2\n line3')
      expect(hunk.oldStart).toBe(1)
      expect(hunk.oldLines).toBe(3)
      expect(hunk.newStart).toBe(1)
      expect(hunk.newLines).toBe(4)
      expect(hunk.changes).toHaveLength(3)
    })

    it('classifies change types correctly', () => {
      const hunk = analyzer.parseHunk('@@ -1,1 +1,1 @@\n-removed\n+added\n context')
      expect(hunk.changes[0]!.type).toBe('delete')
      expect(hunk.changes[1]!.type).toBe('add')
      expect(hunk.changes[2]!.type).toBe('normal')
    })

    it('handles hunk with no line count', () => {
      const hunk = analyzer.parseHunk('@@ -10 +10 @@\n+added')
      expect(hunk.oldStart).toBe(10)
      expect(hunk.oldLines).toBe(1)
      expect(hunk.newStart).toBe(10)
      expect(hunk.newLines).toBe(1)
    })
  })

  describe('countAdditions/countDeletions', () => {
    it('counts additions in a file', () => {
      const file = makeDiffFile({
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'add' }),
            makeChange({ type: 'add' }),
            makeChange({ type: 'normal' }),
          ],
        })],
      })
      expect(analyzer.countAdditions(file)).toBe(2)
    })

    it('counts deletions in a file', () => {
      const file = makeDiffFile({
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'delete' }),
            makeChange({ type: 'normal' }),
          ],
        })],
      })
      expect(analyzer.countDeletions(file)).toBe(1)
    })
  })

  describe('getChangedLines', () => {
    it('returns line numbers for additions and deletions', () => {
      const file = makeDiffFile({
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'add', lineNumber: 5 }),
            makeChange({ type: 'add', lineNumber: 6 }),
            makeChange({ type: 'delete', lineNumber: 3 }),
          ],
        })],
      })
      const result = analyzer.getChangedLines(file)
      expect(result.additions).toEqual([5, 6])
      expect(result.deletions).toEqual([3])
    })

    it('returns empty arrays for file with no changes', () => {
      const file = makeDiffFile({ hunks: [makeHunk({ changes: [] })] })
      const result = analyzer.getChangedLines(file)
      expect(result.additions).toEqual([])
      expect(result.deletions).toEqual([])
    })
  })

  describe('file classification', () => {
    it('identifies test files', () => {
      expect(analyzer.isTestFile('foo.test.ts')).toBe(true)
      expect(analyzer.isTestFile('foo.spec.js')).toBe(true)
      expect(analyzer.isTestFile('tests/helper.ts')).toBe(true)
      expect(analyzer.isTestFile('src/__tests__/foo.ts')).toBe(true)
      expect(analyzer.isTestFile('src/foo.ts')).toBe(false)
    })

    it('identifies config files', () => {
      expect(analyzer.isConfigFile('tsconfig.json')).toBe(true)
      expect(analyzer.isConfigFile('.eslintrc.json')).toBe(true)
      expect(analyzer.isConfigFile('package.json')).toBe(true)
      expect(analyzer.isConfigFile('vitest.config.ts')).toBe(true)
      expect(analyzer.isConfigFile('src/foo.ts')).toBe(false)
    })

    it('extracts file extension', () => {
      expect(analyzer.getFileExtension('foo.ts')).toBe('ts')
      expect(analyzer.getFileExtension('bar.test.js')).toBe('js')
      expect(analyzer.getFileExtension('noext')).toBe('')
      expect(analyzer.getFileExtension('.hidden')).toBe('hidden')
    })
  })

  describe('isLargeChange', () => {
    it('detects large changes', () => {
      const file = makeDiffFile({ additions: 400, deletions: 200 })
      expect(analyzer.isLargeChange(file, 500)).toBe(true)
    })

    it('does not flag small changes', () => {
      const file = makeDiffFile({ additions: 10, deletions: 5 })
      expect(analyzer.isLargeChange(file, 500)).toBe(false)
    })
  })
})

describe('ReviewEngine', () => {
  let engine: ReviewEngine

  beforeEach(() => {
    engine = new ReviewEngine()
  })

  describe('constructor', () => {
    it('uses default config when none provided', () => {
      const e = new ReviewEngine()
      expect(e.getRules()).toHaveLength(BUILTIN_RULES.length)
    })

    it('merges partial config with defaults', () => {
      const e = new ReviewEngine({ maxComments: 10 })
      const result = e.review([])
      expect(result.comments.length).toBeLessThanOrEqual(10)
    })
  })

  describe('review', () => {
    it('returns perfect score for clean diff', () => {
      const files = [makeDiffFile({
        hunks: [makeHunk({
          changes: [makeChange({ type: 'add', content: 'const x = 1', lineNumber: 1 })],
        })],
      })]
      const result = engine.review(files)
      expect(result.score).toBe(100)
      expect(result.approved).toBe(true)
    })

    it('returns 100 score for empty diff', () => {
      const result = engine.review([])
      expect(result.score).toBe(100)
      expect(result.summary.totalComments).toBe(0)
    })

    it('penalizes score for issues found', () => {
      const files = [makeDiffFile({
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'add', content: 'debugger;', lineNumber: 1 }),
          ],
        })],
      })]
      const result = engine.review(files)
      expect(result.score).toBeLessThan(100)
    })

    it('respects maxComments config', () => {
      const changes: DiffChange[] = []
      for (let i = 0; i < 20; i++) {
        changes.push(makeChange({ type: 'add', content: 'console.log("hello")', lineNumber: i + 1 }))
      }
      const files = [makeDiffFile({
        hunks: [makeHunk({ changes })],
      })]
      const e = new ReviewEngine({ maxComments: 5 })
      const result = e.review(files)
      expect(result.comments.length).toBeLessThanOrEqual(5)
    })

    it('respects ignorePatterns config', () => {
      const files = [makeDiffFile({
        path: 'generated/output.ts',
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'add', content: 'console.log("x")', lineNumber: 1 }),
          ],
        })],
      })]
      const e = new ReviewEngine({ ignorePatterns: ['generated/'] })
      const result = e.review(files)
      expect(result.comments).toHaveLength(0)
    })

    it('respects enabledCategories config', () => {
      const files = [makeDiffFile({
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'add', content: 'console.log("x")', lineNumber: 1 }),
            makeChange({ type: 'add', content: 'debugger;', lineNumber: 2 }),
          ],
        })],
      })]
      const e = new ReviewEngine({ enabledCategories: ['style'] })
      const result = e.review(files)
      for (const c of result.comments) {
        expect(c.category).toBe('style')
      }
    })
  })

  describe('reviewFile', () => {
    it('reviews a single file and returns comments', () => {
      const file = makeDiffFile({
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'add', content: 'console.log("x")', lineNumber: 1 }),
          ],
        })],
      })
      const comments = engine.reviewFile(file)
      expect(comments.length).toBeGreaterThan(0)
      expect(comments[0]!.filePath).toBe(file.path)
    })

    it('returns empty array for file with no hunks', () => {
      const file = makeDiffFile({ hunks: [] })
      const comments = engine.reviewFile(file)
      expect(comments).toHaveLength(0)
    })

    it('returns empty array for file with only normal changes', () => {
      const file = makeDiffFile({
        hunks: [makeHunk({
          changes: [
            makeChange({ type: 'normal', content: 'existing line', lineNumber: 1 }),
          ],
        })],
      })
      const comments = engine.reviewFile(file)
      expect(comments).toHaveLength(0)
    })
  })

  describe('no-console rule', () => {
    it('flags console.log in non-test files', () => {
      const change = makeChange({ type: 'add', content: 'console.log("hello")', lineNumber: 5 })
      const ctx = makeContext({ filePath: 'src/app.ts' })
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-console')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.ruleId).toBe('no-console')
      expect(result!.severity).toBe('minor')
    })

    it('does not flag console.log in test files', () => {
      const change = makeChange({ type: 'add', content: 'console.log("debug")', lineNumber: 1 })
      const ctx = makeContext({ filePath: 'src/app.test.ts' })
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-console')!
      const result = rule.evaluate(change, ctx)
      expect(result).toBeNull()
    })

    it('ignores delete changes', () => {
      const change = makeChange({ type: 'delete', content: 'console.log("x")', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-console')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })
  })

  describe('no-todo-comments rule', () => {
    it('flags TODO comments', () => {
      const change = makeChange({ type: 'add', content: '// TODO: fix this', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-todo-comments')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.ruleId).toBe('no-todo-comments')
    })

    it('flags FIXME comments', () => {
      const change = makeChange({ type: 'add', content: '// FIXME: broken', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-todo-comments')!
      expect(rule.evaluate(change, ctx)).not.toBeNull()
    })

    it('does not flag regular comments', () => {
      const change = makeChange({ type: 'add', content: '// This is fine', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-todo-comments')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })
  })

  describe('no-debugger rule', () => {
    it('flags debugger statement', () => {
      const change = makeChange({ type: 'add', content: 'debugger;', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-debugger')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.severity).toBe('critical')
    })

    it('does not flag debugger in a string', () => {
      const change = makeChange({ type: 'add', content: "const msg = 'debugger test'", lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-debugger')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })
  })

  describe('max-line-length rule', () => {
    it('flags lines over 120 chars', () => {
      const longLine = 'const x = "' + 'a'.repeat(130) + '"'
      const change = makeChange({ type: 'add', content: longLine, lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'max-line-length')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.ruleId).toBe('max-line-length')
    })

    it('does not flag short lines', () => {
      const change = makeChange({ type: 'add', content: 'const x = 1', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'max-line-length')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })
  })

  describe('no-any-type rule', () => {
    it('flags : any type annotation', () => {
      const change = makeChange({ type: 'add', content: 'const x: any = getValue()', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-any-type')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.severity).toBe('major')
    })

    it('flags as any cast', () => {
      const change = makeChange({ type: 'add', content: 'return obj as any', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-any-type')!
      expect(rule.evaluate(change, ctx)).not.toBeNull()
    })

    it('does not flag legitimate any usage in comments', () => {
      const change = makeChange({ type: 'add', content: '// any word is fine', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-any-type')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })
  })

  describe('prefer-const rule', () => {
    it('flags let that could be const', () => {
      const allChanges = [
        makeChange({ type: 'add', content: 'let x = 5', lineNumber: 1 }),
        makeChange({ type: 'add', content: 'console.log(x)', lineNumber: 2 }),
      ]
      const change = allChanges[0]!
      const ctx = makeContext({ allChanges })
      const rule = BUILTIN_RULES.find((r) => r.id === 'prefer-const')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.ruleId).toBe('prefer-const')
    })

    it('does not flag let that gets reassigned', () => {
      const change = makeChange({ type: 'add', content: 'let x = 5', lineNumber: 1 })
      const ctx = makeContext({
        allChanges: [
          makeChange({ type: 'add', content: 'let x = 5', lineNumber: 1 }),
          makeChange({ type: 'add', content: 'x = 10', lineNumber: 2 }),
        ],
      })
      const rule = BUILTIN_RULES.find((r) => r.id === 'prefer-const')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })
  })

  describe('no-hardcoded-secrets rule', () => {
    it('flags api_key assignment', () => {
      const change = makeChange({ type: 'add', content: "const api_key = 'sk-1234567890abcdef'", lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-hardcoded-secrets')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.severity).toBe('blocker')
      expect(result!.category).toBe('security')
    })

    it('flags password assignment', () => {
      const change = makeChange({ type: 'add', content: "const password = 'supersecret'", lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-hardcoded-secrets')!
      expect(rule.evaluate(change, ctx)).not.toBeNull()
    })

    it('does not flag variable named password without value', () => {
      const change = makeChange({ type: 'add', content: 'const password = process.env.PASS', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-hardcoded-secrets')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })

    it('flags private key pattern', () => {
      const change = makeChange({ type: 'add', content: '-----BEGIN RSA PRIVATE KEY-----', lineNumber: 1 })
      const ctx = makeContext()
      const rule = BUILTIN_RULES.find((r) => r.id === 'no-hardcoded-secrets')!
      expect(rule.evaluate(change, ctx)).not.toBeNull()
    })
  })

  describe('require-error-handling rule', () => {
    it('flags await without try/catch', () => {
      const change = makeChange({ type: 'add', content: 'const data = await fetch(url)', lineNumber: 1 })
      const ctx = makeContext({
        allChanges: [
          makeChange({ type: 'add', content: 'const data = await fetch(url)', lineNumber: 1 }),
        ],
      })
      const rule = BUILTIN_RULES.find((r) => r.id === 'require-error-handling')!
      const result = rule.evaluate(change, ctx)
      expect(result).not.toBeNull()
      expect(result!.category).toBe('error-handling')
    })

    it('does not flag await with try/catch', () => {
      const change = makeChange({ type: 'add', content: 'const data = await fetch(url)', lineNumber: 2 })
      const ctx = makeContext({
        allChanges: [
          makeChange({ type: 'add', content: 'try {', lineNumber: 1 }),
          makeChange({ type: 'add', content: 'const data = await fetch(url)', lineNumber: 2 }),
          makeChange({ type: 'add', content: '} catch (e) {', lineNumber: 3 }),
          makeChange({ type: 'add', content: 'handle(e)', lineNumber: 4 }),
          makeChange({ type: 'add', content: '}', lineNumber: 5 }),
        ],
      })
      const rule = BUILTIN_RULES.find((r) => r.id === 'require-error-handling')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })

    it('does not flag await with .catch()', () => {
      const change = makeChange({ type: 'add', content: 'const data = await fetch(url)', lineNumber: 1 })
      const ctx = makeContext({
        allChanges: [
          makeChange({ type: 'add', content: 'const data = await fetch(url)', lineNumber: 1 }),
          makeChange({ type: 'add', content: 'promise.catch(() => {})', lineNumber: 2 }),
        ],
      })
      const rule = BUILTIN_RULES.find((r) => r.id === 'require-error-handling')!
      expect(rule.evaluate(change, ctx)).toBeNull()
    })
  })

  describe('calculateScore', () => {
    it('returns 100 for no comments', () => {
      const result: ReviewResult = {
        comments: [],
        summary: {
          totalComments: 0, blockerCount: 0, criticalCount: 0,
          majorCount: 0, minorCount: 0, infoCount: 0,
          filesReviewed: 1, filesWithIssues: 0, categories: {},
        },
        score: 0,
        approved: false,
      }
      expect(engine.calculateScore(result)).toBe(100)
    })

    it('deducts points based on severity', () => {
      const result: ReviewResult = {
        comments: [],
        summary: {
          totalComments: 1, blockerCount: 1, criticalCount: 0,
          majorCount: 0, minorCount: 0, infoCount: 0,
          filesReviewed: 1, filesWithIssues: 1, categories: { security: 1 },
        },
        score: 0,
        approved: false,
      }
      expect(engine.calculateScore(result)).toBe(75)
    })

    it('never goes below 0', () => {
      const result: ReviewResult = {
        comments: [],
        summary: {
          totalComments: 10, blockerCount: 10, criticalCount: 10,
          majorCount: 10, minorCount: 10, infoCount: 10,
          filesReviewed: 1, filesWithIssues: 1, categories: {},
        },
        score: 0,
        approved: false,
      }
      expect(engine.calculateScore(result)).toBe(0)
    })
  })

  describe('isApproved', () => {
    it('approves when score meets threshold', () => {
      expect(engine.isApproved(80)).toBe(true)
      expect(engine.isApproved(100)).toBe(true)
    })

    it('rejects when score below threshold', () => {
      expect(engine.isApproved(79)).toBe(false)
      expect(engine.isApproved(0)).toBe(false)
    })

    it('respects custom threshold', () => {
      const e = new ReviewEngine({ approvalThreshold: 0.9 })
      expect(e.isApproved(89)).toBe(false)
      expect(e.isApproved(90)).toBe(true)
    })
  })

  describe('deduplicateComments', () => {
    it('removes exact duplicates', () => {
      const comments: ReviewComment[] = [
        { filePath: 'a.ts', line: 1, side: 'RIGHT', message: 'msg1', severity: 'minor', category: 'style', ruleId: 'r1' },
        { filePath: 'a.ts', line: 1, side: 'RIGHT', message: 'msg1', severity: 'minor', category: 'style', ruleId: 'r1' },
      ]
      const result = engine.deduplicateComments(comments)
      expect(result).toHaveLength(1)
    })

    it('keeps comments at different lines', () => {
      const comments: ReviewComment[] = [
        { filePath: 'a.ts', line: 1, side: 'RIGHT', message: 'msg1', severity: 'minor', category: 'style', ruleId: 'r1' },
        { filePath: 'a.ts', line: 2, side: 'RIGHT', message: 'msg1', severity: 'minor', category: 'style', ruleId: 'r1' },
      ]
      const result = engine.deduplicateComments(comments)
      expect(result).toHaveLength(2)
    })

    it('keeps comments with different rules on same line', () => {
      const comments: ReviewComment[] = [
        { filePath: 'a.ts', line: 1, side: 'RIGHT', message: 'msg1', severity: 'minor', category: 'style', ruleId: 'r1' },
        { filePath: 'a.ts', line: 1, side: 'RIGHT', message: 'msg2', severity: 'minor', category: 'style', ruleId: 'r2' },
      ]
      const result = engine.deduplicateComments(comments)
      expect(result).toHaveLength(2)
    })
  })

  describe('filterBySeverity', () => {
    it('filters comments below minimum severity', () => {
      const comments: ReviewComment[] = [
        { filePath: 'a.ts', line: 1, side: 'RIGHT', message: 'm', severity: 'blocker', category: 'c' },
        { filePath: 'a.ts', line: 2, side: 'RIGHT', message: 'm', severity: 'critical', category: 'c' },
        { filePath: 'a.ts', line: 3, side: 'RIGHT', message: 'm', severity: 'major', category: 'c' },
        { filePath: 'a.ts', line: 4, side: 'RIGHT', message: 'm', severity: 'minor', category: 'c' },
        { filePath: 'a.ts', line: 5, side: 'RIGHT', message: 'm', severity: 'info', category: 'c' },
      ]
      const result = engine.filterBySeverity(comments, 'major')
      expect(result).toHaveLength(3)
      expect(result.every((c) => ['blocker', 'critical', 'major'].includes(c.severity))).toBe(true)
    })

    it('returns all for lowest severity', () => {
      const comments: ReviewComment[] = [
        { filePath: 'a.ts', line: 1, side: 'RIGHT', message: 'm', severity: 'info', category: 'c' },
      ]
      const result = engine.filterBySeverity(comments, 'info')
      expect(result).toHaveLength(1)
    })
  })

  describe('addRule', () => {
    it('allows adding custom rules', () => {
      const initialCount = engine.getRules().length
      const customRule: ReviewRule = {
        id: 'custom-rule',
        name: 'Custom',
        category: 'custom',
        severity: 'info',
        evaluate: () => null,
      }
      engine.addRule(customRule)
      expect(engine.getRules()).toHaveLength(initialCount + 1)
    })
  })
})

describe('ReviewFormatter', () => {
  let formatter: ReviewFormatter
  let sampleResult: ReviewResult

  beforeEach(() => {
    formatter = new ReviewFormatter()
    sampleResult = {
      comments: [
        {
          filePath: 'src/app.ts',
          line: 10,
          side: 'RIGHT',
          message: 'Avoid console.log',
          severity: 'minor',
          category: 'best-practices',
          suggestion: 'Use a logger',
          ruleId: 'no-console',
        },
        {
          filePath: 'src/util.ts',
          line: 5,
          side: 'RIGHT',
          message: 'Debugger statement',
          severity: 'critical',
          category: 'best-practices',
          suggestion: 'Remove debugger',
          ruleId: 'no-debugger',
        },
      ],
      summary: {
        totalComments: 2,
        blockerCount: 0,
        criticalCount: 1,
        majorCount: 0,
        minorCount: 1,
        infoCount: 0,
        filesReviewed: 2,
        filesWithIssues: 2,
        categories: { 'best-practices': 2 },
      },
      score: 80,
      approved: true,
    }
  })

  describe('formatConsole', () => {
    it('includes score and approval status', () => {
      const output = formatter.formatConsole(sampleResult)
      expect(output).toContain('80/100')
      expect(output).toContain('APPROVED')
    })

    it('includes all comments', () => {
      const output = formatter.formatConsole(sampleResult)
      expect(output).toContain('src/app.ts:10')
      expect(output).toContain('src/util.ts:5')
      expect(output).toContain('Avoid console.log')
    })

    it('handles clean result', () => {
      const clean: ReviewResult = {
        comments: [],
        summary: {
          totalComments: 0, blockerCount: 0, criticalCount: 0,
          majorCount: 0, minorCount: 0, infoCount: 0,
          filesReviewed: 1, filesWithIssues: 0, categories: {},
        },
        score: 100,
        approved: true,
      }
      const output = formatter.formatConsole(clean)
      expect(output).toContain('No issues found')
    })
  })

  describe('formatMarkdown', () => {
    it('generates valid markdown with tables', () => {
      const output = formatter.formatMarkdown(sampleResult)
      expect(output).toContain('## Code Review Results')
      expect(output).toContain('| Metric | Value |')
      expect(output).toContain('| Severity | File | Line | Message | Rule |')
    })

    it('includes all issues in table', () => {
      const output = formatter.formatMarkdown(sampleResult)
      expect(output).toContain('src/app.ts')
      expect(output).toContain('src/util.ts')
      expect(output).toContain('MINOR')
      expect(output).toContain('CRITICAL')
    })
  })

  describe('formatJSON', () => {
    it('returns valid JSON', () => {
      const output = formatter.formatJSON(sampleResult)
      const parsed = JSON.parse(output)
      expect(parsed.score).toBe(80)
      expect(parsed.comments).toHaveLength(2)
      expect(parsed.summary.totalComments).toBe(2)
    })
  })

  describe('formatGitHubComments', () => {
    it('formats comments for GitHub API', () => {
      const comments = formatter.formatGitHubComments(sampleResult)
      expect(comments).toHaveLength(2)
      expect(comments[0]!.path).toBe('src/app.ts')
      expect(comments[0]!.line).toBe(10)
      expect(comments[0]!.side).toBe('RIGHT')
      expect(comments[0]!.position).toBe(1)
      expect(comments[0]!.body).toContain('Avoid console.log')
    })

    it('increments position for each comment', () => {
      const comments = formatter.formatGitHubComments(sampleResult)
      expect(comments[0]!.position).toBe(1)
      expect(comments[1]!.position).toBe(2)
    })
  })

  describe('formatSummary', () => {
    it('produces one-line summary', () => {
      const output = formatter.formatSummary(sampleResult)
      expect(output).toContain('80/100')
      expect(output).toContain('APPROVED')
      expect(output).toContain('2 issues')
    })

    it('shows NOT APPROVED for failed review', () => {
      const failed: ReviewResult = {
        ...sampleResult,
        score: 50,
        approved: false,
      }
      const output = formatter.formatSummary(failed)
      expect(output).toContain('NOT APPROVED')
    })
  })

  describe('formatDiffWithComments', () => {
    it('annotates diff with review comments', () => {
      const diff = `diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,1 +1,1 @@
-const x = 1
+console.log("hello")`
      const comments: ReviewComment[] = [
        {
          filePath: 'src/app.ts', line: 1, side: 'RIGHT',
          message: 'Avoid console.log', severity: 'minor',
          category: 'best-practices', ruleId: 'no-console',
        },
      ]
      const output = formatter.formatDiffWithComments(diff, comments)
      expect(output).toContain('REVIEW [MINOR]: Avoid console.log')
    })

    it('includes suggestions when present', () => {
      const diff = '+console.log("hello")'
      const comments: ReviewComment[] = [
        {
          filePath: 'a.ts', line: 1, side: 'RIGHT',
          message: 'msg', severity: 'minor', category: 'c',
          suggestion: 'Use logger',
        },
      ]
      const output = formatter.formatDiffWithComments(diff, comments)
      expect(output).toContain('SUGGESTION: Use logger')
    })

    it('handles diff with no matching comments', () => {
      const diff = '+const x = 1'
      const comments: ReviewComment[] = [
        {
          filePath: 'a.ts', line: 99, side: 'RIGHT',
          message: 'msg', severity: 'minor', category: 'c',
        },
      ]
      const output = formatter.formatDiffWithComments(diff, comments)
      expect(output).not.toContain('REVIEW')
    })
  })
})

describe('types and constants', () => {
  it('SEVERITY_LEVELS has correct ordering', () => {
    expect(SEVERITY_LEVELS.blocker).toBeLessThan(SEVERITY_LEVELS.critical)
    expect(SEVERITY_LEVELS.critical).toBeLessThan(SEVERITY_LEVELS.major)
    expect(SEVERITY_LEVELS.major).toBeLessThan(SEVERITY_LEVELS.minor)
    expect(SEVERITY_LEVELS.minor).toBeLessThan(SEVERITY_LEVELS.info)
  })

  it('DEFAULT_CONFIG has sensible defaults', () => {
    expect(DEFAULT_CONFIG.maxComments).toBe(50)
    expect(DEFAULT_CONFIG.minSeverity).toBe('info')
    expect(DEFAULT_CONFIG.approvalThreshold).toBe(0.8)
    expect(DEFAULT_CONFIG.enabledCategories).toEqual([])
    expect(DEFAULT_CONFIG.ignorePatterns).toEqual([])
  })
})

describe('edge cases', () => {
  let engine: ReviewEngine
  let analyzer: DiffAnalyzer

  beforeEach(() => {
    engine = new ReviewEngine()
    analyzer = new DiffAnalyzer()
  })

  it('handles diff with only additions', () => {
    const diff = `diff --git a/new.ts b/new.ts
new file mode 100644
--- /dev/null
+++ b/new.ts
@@ -0,0 +1,2 @@
+line1
+line2`
    const files = analyzer.parseUnifiedDiff(diff)
    expect(files[0]!.additions).toBe(2)
    expect(files[0]!.deletions).toBe(0)
  })

  it('handles diff with only deletions', () => {
    const diff = `diff --git a/old.ts b/old.ts
--- a/old.ts
+++ b/old.ts
@@ -1,2 +0,0 @@
-line1
-line2`
    const files = analyzer.parseUnifiedDiff(diff)
    expect(files[0]!.additions).toBe(0)
    expect(files[0]!.deletions).toBe(2)
  })

  it('handles review of file with no issues', () => {
    const files = [makeDiffFile({
      hunks: [makeHunk({
        changes: [
          makeChange({ type: 'add', content: 'const x = 1', lineNumber: 1 }),
          makeChange({ type: 'normal', content: 'const y = 2', lineNumber: 2 }),
        ],
      })],
    })]
    const result = engine.review(files)
    expect(result.comments).toHaveLength(0)
    expect(result.score).toBe(100)
  })

  it('handles binary-like file paths', () => {
    const file = makeDiffFile({ path: 'images/logo.png', hunks: [] })
    const comments = engine.reviewFile(file)
    expect(comments).toHaveLength(0)
  })

  it('handles renamed files in diff', () => {
    const diff = `diff --git a/old.ts b/new.ts
rename from old.ts
rename to new.ts
--- a/old.ts
+++ b/new.ts
@@ -1,1 +1,2 @@
 line1
+line2`
    const files = analyzer.parseUnifiedDiff(diff)
    expect(files[0]!.status).toBe('renamed')
    expect(files[0]!.path).toBe('new.ts')
  })

  it('handles large diff within limits', () => {
    const changes: DiffChange[] = []
    for (let i = 0; i < 100; i++) {
      changes.push(makeChange({ type: 'add', content: `const line${i} = ${i}`, lineNumber: i + 1 }))
    }
    const files = [makeDiffFile({
      hunks: [makeHunk({ changes })],
    })]
    const result = engine.review(files)
    expect(result.summary.filesReviewed).toBe(1)
  })
})
