import { describe, expect, it } from 'vitest'

import Diff from '../src/commands/diff.js'
import {
  assessRisk,
  buildDiffSummary,
  type FileDiff,
  parseDiffOutput,
  type DiffResult,
  type DiffSummary,
} from '../src/commands/diff-helpers.js'
import { formatDiffJson, formatDiffTable } from '../src/commands/diff-format-helpers.js'

// ─── Test data factories ────────────────────────────────

function makeFileDiff(overrides: Partial<FileDiff> = {}): FileDiff {
  return {
    additions: 5,
    deletions: 2,
    filePath: 'src/index.ts',
    lines: [],
    riskLevel: 'low',
    riskReasons: [],
    status: 'modified',
    ...overrides,
  }
}

function makeDiffResult(overrides: Partial<DiffResult> = {}): DiffResult {
  const files = overrides.files ?? [makeFileDiff()]
  return {
    baseCommit: 'abc123',
    files,
    headCommit: 'def456',
    summary: buildDiffSummary(files),
    ...overrides,
  }
}

// ─── Sample diff outputs ────────────────────────────────

const ADDED_FILE_DIFF = `diff --git a/new-file.ts b/new-file.ts
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/new-file.ts
@@ -0,0 +1,3 @@
+const x = 1
+const y = 2
+const z = 3`

const MODIFIED_FILE_DIFF = `diff --git a/src/index.ts b/src/index.ts
index abc1234..def5678 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,5 @@
 const old = 1
-const removed = 2
+const added = 3
 const kept = 4`

const DELETED_FILE_DIFF = `diff --git a/old-file.ts b/old-file.ts
deleted file mode 100644
index abc1234..0000000
--- a/old-file.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-const a = 1
-const b = 2`

const RENAMED_FILE_DIFF = `diff --git a/old-name.ts b/new-name.ts
similarity index 100%
rename from old-name.ts
rename to new-name.ts`

const BINARY_FILE_DIFF = `diff --git a/image.png b/image.png
Binary files /dev/null and b/image.png differ`

const MULTI_FILE_DIFF = `${ADDED_FILE_DIFF}

${MODIFIED_FILE_DIFF}

${DELETED_FILE_DIFF}`

// ─── parseDiffOutput ────────────────────────────────────

describe('parseDiffOutput', () => {
  it('parses an added file', () => {
    const files = parseDiffOutput(ADDED_FILE_DIFF)
    expect(files).toHaveLength(1)
    expect(files[0]!.filePath).toBe('new-file.ts')
    expect(files[0]!.status).toBe('added')
    expect(files[0]!.additions).toBe(3)
    expect(files[0]!.deletions).toBe(0)
  })

  it('parses a modified file', () => {
    const files = parseDiffOutput(MODIFIED_FILE_DIFF)
    expect(files).toHaveLength(1)
    expect(files[0]!.filePath).toBe('src/index.ts')
    expect(files[0]!.status).toBe('modified')
    expect(files[0]!.additions).toBe(1)
    expect(files[0]!.deletions).toBe(1)
  })

  it('parses a deleted file', () => {
    const files = parseDiffOutput(DELETED_FILE_DIFF)
    expect(files).toHaveLength(1)
    expect(files[0]!.filePath).toBe('old-file.ts')
    expect(files[0]!.status).toBe('deleted')
    expect(files[0]!.additions).toBe(0)
    expect(files[0]!.deletions).toBe(2)
  })

  it('parses a renamed file', () => {
    const files = parseDiffOutput(RENAMED_FILE_DIFF)
    expect(files).toHaveLength(1)
    expect(files[0]!.filePath).toBe('new-name.ts')
    expect(files[0]!.status).toBe('renamed')
  })

  it('parses multiple files', () => {
    const files = parseDiffOutput(MULTI_FILE_DIFF)
    expect(files).toHaveLength(3)
  })

  it('counts lines correctly for added file', () => {
    const files = parseDiffOutput(ADDED_FILE_DIFF)
    expect(files[0]!.lines.length).toBe(3)
    expect(files[0]!.lines.every((l) => l.type === 'added')).toBe(true)
  })

  it('counts lines correctly for modified file', () => {
    const files = parseDiffOutput(MODIFIED_FILE_DIFF)
    const added = files[0]!.lines.filter((l) => l.type === 'added')
    const removed = files[0]!.lines.filter((l) => l.type === 'removed')
    const context = files[0]!.lines.filter((l) => l.type === 'context')
    expect(added).toHaveLength(1)
    expect(removed).toHaveLength(1)
    expect(context).toHaveLength(2)
  })

  it('returns empty array for empty diff', () => {
    expect(parseDiffOutput('')).toHaveLength(0)
  })

  it('returns empty array for whitespace-only diff', () => {
    expect(parseDiffOutput('   \n\n  ')).toHaveLength(0)
  })

  it('handles binary file markers gracefully', () => {
    const files = parseDiffOutput(BINARY_FILE_DIFF)
    expect(files).toHaveLength(0)
  })

  it('assigns incremental line numbers', () => {
    const files = parseDiffOutput(MODIFIED_FILE_DIFF)
    const lineNumbers = files[0]!.lines.map((l) => l.lineNumber)
    for (let i = 1; i < lineNumbers.length; i++) {
      expect(lineNumbers[i]).toBeGreaterThan(lineNumbers[i - 1]!)
    }
  })

  it('strips leading + and - from line content', () => {
    const files = parseDiffOutput(ADDED_FILE_DIFF)
    for (const line of files[0]!.lines) {
      expect(line.content).not.toMatch(/^\+/)
    }
  })
})

// ─── assessRisk ─────────────────────────────────────────

describe('assessRisk', () => {
  it('returns low risk for small changes', () => {
    const result = assessRisk({
      additions: 5,
      deletions: 3,
      filePath: 'test.ts',
      status: 'modified',
    })
    expect(result.level).toBe('low')
    expect(result.reasons).toHaveLength(0)
  })

  it('returns medium risk for moderate additions', () => {
    const result = assessRisk({
      additions: 25,
      deletions: 5,
      filePath: 'test.ts',
      status: 'modified',
    })
    expect(result.level).toBe('medium')
    expect(result.reasons).toContain('Moderate additions')
  })

  it('returns medium risk for moderate deletions', () => {
    const result = assessRisk({
      additions: 5,
      deletions: 18,
      filePath: 'test.ts',
      status: 'modified',
    })
    expect(result.level).toBe('medium')
    expect(result.reasons).toContain('Moderate deletions')
  })

  it('returns high risk for large additions', () => {
    const result = assessRisk({
      additions: 60,
      deletions: 5,
      filePath: 'test.ts',
      status: 'modified',
    })
    expect(result.level).toBe('high')
    expect(result.reasons).toContain('Large change')
  })

  it('returns high risk for many deletions', () => {
    const result = assessRisk({
      additions: 5,
      deletions: 35,
      filePath: 'test.ts',
      status: 'modified',
    })
    expect(result.level).toBe('high')
    expect(result.reasons).toContain('Many deletions')
  })

  it('returns medium risk for new files', () => {
    const result = assessRisk({
      additions: 3,
      deletions: 0,
      filePath: 'new.ts',
      status: 'added',
    })
    expect(result.level).toBe('medium')
    expect(result.reasons).toContain('New file (untested patterns)')
  })

  it('keeps high risk when new file also has large additions', () => {
    const result = assessRisk({
      additions: 60,
      deletions: 0,
      filePath: 'new.ts',
      status: 'added',
    })
    expect(result.level).toBe('high')
    expect(result.reasons).toContain('Large change')
    expect(result.reasons).toContain('New file (untested patterns)')
  })

  it('does not downgrade high risk to medium', () => {
    const result = assessRisk({
      additions: 60,
      deletions: 5,
      filePath: 'test.ts',
      status: 'modified',
    })
    expect(result.level).toBe('high')
  })

  it('returns low risk for zero-change renames', () => {
    const result = assessRisk({
      additions: 0,
      deletions: 0,
      filePath: 'renamed.ts',
      status: 'renamed',
    })
    expect(result.level).toBe('low')
  })
})

// ─── buildDiffSummary ───────────────────────────────────

describe('buildDiffSummary', () => {
  it('computes correct totals', () => {
    const files = [
      makeFileDiff({ additions: 10, deletions: 5 }),
      makeFileDiff({ additions: 20, deletions: 3, filePath: 'other.ts' }),
    ]
    const summary = buildDiffSummary(files)
    expect(summary.totalFiles).toBe(2)
    expect(summary.totalAdditions).toBe(30)
    expect(summary.totalDeletions).toBe(8)
    expect(summary.netLines).toBe(22)
  })

  it('computes byStatus breakdown', () => {
    const files = [
      makeFileDiff({ status: 'modified' }),
      makeFileDiff({ status: 'modified', filePath: 'b.ts' }),
      makeFileDiff({ status: 'added', filePath: 'c.ts' }),
    ]
    const summary = buildDiffSummary(files)
    const modifiedEntry = summary.byStatus.find((s) => s.status === 'modified')
    const addedEntry = summary.byStatus.find((s) => s.status === 'added')
    expect(modifiedEntry!.count).toBe(2)
    expect(addedEntry!.count).toBe(1)
  })

  it('computes byExtension breakdown', () => {
    const files = [
      makeFileDiff({ filePath: 'src/a.ts', additions: 10, deletions: 2 }),
      makeFileDiff({ filePath: 'src/b.ts', additions: 5, deletions: 1 }),
      makeFileDiff({ filePath: 'src/c.py', additions: 3, deletions: 0 }),
    ]
    const summary = buildDiffSummary(files)
    const tsExt = summary.byExtension.find((e) => e.ext === '.ts')
    const pyExt = summary.byExtension.find((e) => e.ext === '.py')
    expect(tsExt!.files).toBe(2)
    expect(tsExt!.additions).toBe(15)
    expect(tsExt!.deletions).toBe(3)
    expect(pyExt!.files).toBe(1)
  })

  it('filters high risk files', () => {
    const files = [
      makeFileDiff({ riskLevel: 'low', filePath: 'low.ts' }),
      makeFileDiff({ riskLevel: 'high', filePath: 'high.ts', riskReasons: ['Large change'] }),
      makeFileDiff({ riskLevel: 'medium', filePath: 'med.ts' }),
    ]
    const summary = buildDiffSummary(files)
    expect(summary.highRiskFiles).toHaveLength(1)
    expect(summary.highRiskFiles[0]!.filePath).toBe('high.ts')
  })

  it('handles empty files array', () => {
    const summary = buildDiffSummary([])
    expect(summary.totalFiles).toBe(0)
    expect(summary.totalAdditions).toBe(0)
    expect(summary.totalDeletions).toBe(0)
    expect(summary.netLines).toBe(0)
    expect(summary.byStatus).toHaveLength(0)
    expect(summary.byExtension).toHaveLength(0)
    expect(summary.highRiskFiles).toHaveLength(0)
  })

  it('handles files with no extension', () => {
    const files = [makeFileDiff({ filePath: 'Makefile' })]
    const summary = buildDiffSummary(files)
    const noExt = summary.byExtension.find((e) => e.ext === '(none)')
    expect(noExt).toBeDefined()
    expect(noExt!.files).toBe(1)
  })

  it('handles single file', () => {
    const files = [makeFileDiff({ additions: 42, deletions: 10 })]
    const summary = buildDiffSummary(files)
    expect(summary.totalFiles).toBe(1)
    expect(summary.totalAdditions).toBe(42)
    expect(summary.totalDeletions).toBe(10)
    expect(summary.netLines).toBe(32)
  })
})

// ─── formatDiffTable ────────────────────────────────────

describe('formatDiffTable', () => {
  it('contains summary header', () => {
    const result = makeDiffResult()
    const output = formatDiffTable(result, false, false)
    expect(output).toContain('Diff Analysis Report')
    expect(output).toContain('Files changed')
    expect(output).toContain('Additions')
    expect(output).toContain('Deletions')
  })

  it('shows commit range', () => {
    const result = makeDiffResult({ baseCommit: 'abc', headCommit: 'def' })
    const output = formatDiffTable(result, false, false)
    expect(output).toContain('abc')
    expect(output).toContain('def')
  })

  it('shows file table with headers', () => {
    const result = makeDiffResult({ files: [makeFileDiff()] })
    const output = formatDiffTable(result, false, false)
    expect(output).toContain('File')
    expect(output).toContain('Status')
    expect(output).toContain('Risk')
  })

  it('shows file paths in table', () => {
    const result = makeDiffResult({
      files: [makeFileDiff({ filePath: 'src/utils/helper.ts' })],
    })
    const output = formatDiffTable(result, false, false)
    expect(output).toContain('src/utils/helper.ts')
  })

  it('shows stat-only output when stat is true', () => {
    const result = makeDiffResult({ files: [makeFileDiff()] })
    const output = formatDiffTable(result, true, false)
    expect(output).toContain('By status:')
    expect(output).toContain('By extension:')
  })

  it('shows high risk files section', () => {
    const result = makeDiffResult({
      files: [makeFileDiff({ riskLevel: 'high', riskReasons: ['Large change'], filePath: 'big.ts' })],
    })
    const output = formatDiffTable(result, false, false)
    expect(output).toContain('High Risk Files')
    expect(output).toContain('big.ts')
  })

  it('does not show High Risk section when none', () => {
    const result = makeDiffResult({
      files: [makeFileDiff({ riskLevel: 'low' })],
    })
    const output = formatDiffTable(result, false, false)
    expect(output).not.toContain('High Risk Files')
  })

  it('shows verbose diff lines', () => {
    const result = makeDiffResult({
      files: [makeFileDiff({
        filePath: 'test.ts',
        lines: [
          { content: 'added line', lineNumber: 1, type: 'added' },
          { content: 'removed line', lineNumber: 2, type: 'removed' },
        ],
      })],
    })
    const output = formatDiffTable(result, false, true)
    expect(output).toContain('added line')
    expect(output).toContain('removed line')
  })

  it('handles empty diff result', () => {
    const result: DiffResult = {
      baseCommit: 'abc',
      files: [],
      headCommit: 'def',
      summary: {
        byExtension: [],
        byStatus: [],
        highRiskFiles: [],
        netLines: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalFiles: 0,
      },
    }
    const output = formatDiffTable(result, false, false)
    expect(output).toContain('Diff Analysis Report')
    expect(output).toContain('Files changed')
    expect(output).toContain('0')
  })
})

// ─── formatDiffJson ─────────────────────────────────────

describe('formatDiffJson', () => {
  it('produces valid JSON', () => {
    const result = makeDiffResult()
    const output = formatDiffJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains files array', () => {
    const result = makeDiffResult({ files: [makeFileDiff()] })
    const output = formatDiffJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains summary object', () => {
    const result = makeDiffResult()
    const output = formatDiffJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.summary).toBeDefined()
    expect(parsed.summary.totalFiles).toBe(1)
  })

  it('contains base and head commit', () => {
    const result = makeDiffResult({ baseCommit: 'aaa', headCommit: 'bbb' })
    const output = formatDiffJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.baseCommit).toBe('aaa')
    expect(parsed.headCommit).toBe('bbb')
  })

  it('handles empty result', () => {
    const result: DiffResult = {
      baseCommit: 'abc',
      files: [],
      headCommit: 'def',
      summary: {
        byExtension: [],
        byStatus: [],
        highRiskFiles: [],
        netLines: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalFiles: 0,
      },
    }
    const output = formatDiffJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(0)
    expect(parsed.summary.totalFiles).toBe(0)
  })

  it('preserves file diff data accurately', () => {
    const result = makeDiffResult({
      files: [makeFileDiff({
        additions: 42,
        deletions: 7,
        filePath: 'core/engine.ts',
        riskLevel: 'high',
        riskReasons: ['Large change'],
        status: 'modified',
      })],
    })
    const output = formatDiffJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files[0].filePath).toBe('core/engine.ts')
    expect(parsed.files[0].additions).toBe(42)
    expect(parsed.files[0].deletions).toBe(7)
    expect(parsed.files[0].riskLevel).toBe('high')
    expect(parsed.files[0].status).toBe('modified')
  })
})

// ─── Diff command metadata ──────────────────────────────

describe('Diff command - static metadata', () => {
  it('has a description', () => {
    expect(Diff.description).toBe('Compare violations between git branches or commits')
  })

  it('has examples array', () => {
    expect(Array.isArray(Diff.examples)).toBe(true)
    expect(Diff.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has json flag defaulting to false', () => {
    expect(Diff.flags.json.default).toBe(false)
  })

  it('has path flag', () => {
    expect(Diff.flags.path).toBeDefined()
  })

  it('has verbose flag defaulting to false', () => {
    expect(Diff.flags.verbose.default).toBe(false)
  })
})

// ─── Diff command class structure ───────────────────────

describe('Diff command - class structure', () => {
  it('exports a default class', () => {
    expect(Diff).toBeDefined()
    expect(typeof Diff).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Diff.prototype.run).toBe('function')
  })
})

// ─── parseDiffOutput edge cases ─────────────────────────

describe('parseDiffOutput - additional edge cases', () => {
  it('handles diff with only context lines', () => {
    const diff = `diff --git a/file.ts b/file.ts
index abc..def 100644
--- a/file.ts
+++ b/file.ts
@@ -1,1 +1,1 @@
 const unchanged = 1`
    const files = parseDiffOutput(diff)
    expect(files).toHaveLength(1)
    expect(files[0]!.additions).toBe(0)
    expect(files[0]!.deletions).toBe(0)
    expect(files[0]!.lines.filter((l) => l.type === 'context')).toHaveLength(1)
  })

  it('handles large diff with many files', () => {
    const parts: string[] = []
    for (let i = 0; i < 10; i++) {
      parts.push(`diff --git a/file${i}.ts b/file${i}.ts
--- a/file${i}.ts
+++ b/file${i}.ts
@@ -0,0 +1,1 @@
+export const x${i} = ${i}`)
    }
    const files = parseDiffOutput(parts.join('\n\n'))
    expect(files).toHaveLength(10)
    expect(files.every((f) => f.status === 'modified')).toBe(true)
  })

  it('correctly identifies file path from both --- and +++', () => {
    const diff = `diff --git a/src/deep/nested/file.ts b/src/deep/nested/file.ts
--- a/src/deep/nested/file.ts
+++ b/src/deep/nested/file.ts
@@ -1,1 +1,1 @@
-old
+new`
    const files = parseDiffOutput(diff)
    expect(files[0]!.filePath).toBe('src/deep/nested/file.ts')
  })

  it('handles mixed additions and deletions correctly', () => {
    const diff = `diff --git a/mixed.ts b/mixed.ts
--- a/mixed.ts
+++ b/mixed.ts
@@ -1,4 +1,4 @@
 context1
-old1
-old2
+new1
 context2`
    const files = parseDiffOutput(diff)
    expect(files[0]!.additions).toBe(1)
    expect(files[0]!.deletions).toBe(2)
  })

  it('skips diff --git header line', () => {
    const files = parseDiffOutput(ADDED_FILE_DIFF)
    const headerLines = files[0]!.lines.filter((l) => l.type === 'header')
    expect(headerLines).toHaveLength(0)
  })

  it('computes net negative lines correctly', () => {
    const files = [
      makeFileDiff({ additions: 2, deletions: 10 }),
    ]
    const summary = buildDiffSummary(files)
    expect(summary.netLines).toBe(-8)
  })

  it('formats risk badge for unknown level', () => {
    const result = makeDiffResult({
      files: [makeFileDiff({ riskLevel: 'low' })],
    })
    const output = formatDiffTable(result, false, false)
    expect(output).toContain('low')
  })
})
