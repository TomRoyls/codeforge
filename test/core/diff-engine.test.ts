import { describe, it, expect } from 'vitest'
import { DiffComputer } from '../../src/core/diff-engine/diff-computer.js'
import { DiffEngine } from '../../src/core/diff-engine/diff-engine.js'
import type { DiffLine, DiffResult, PatchOptions, ApplyResult, DiffStats, DiffHunk } from '../../src/core/diff-engine/types.js'
import { DEFAULT_PATCH_OPTIONS } from '../../src/core/diff-engine/types.js'

describe('DiffComputer', () => {
  const computer = new DiffComputer()

  describe('compute', () => {
    it('should return empty array for two empty inputs', () => {
      const result = computer.compute([], [])
      expect(result).toEqual([])
    })

    it('should mark all lines as added when old is empty', () => {
      const result = computer.compute([], ['a', 'b', 'c'])
      expect(result).toHaveLength(3)
      expect(result.every((l) => l.type === 'added')).toBe(true)
    })

    it('should mark all lines as removed when new is empty', () => {
      const result = computer.compute(['a', 'b', 'c'], [])
      expect(result).toHaveLength(3)
      expect(result.every((l) => l.type === 'removed')).toBe(true)
    })

    it('should mark identical lines as unchanged', () => {
      const result = computer.compute(['a', 'b', 'c'], ['a', 'b', 'c'])
      expect(result).toHaveLength(3)
      expect(result.every((l) => l.type === 'unchanged')).toBe(true)
    })

    it('should detect a single line addition', () => {
      const result = computer.compute(['a', 'c'], ['a', 'b', 'c'])
      const added = result.filter((l) => l.type === 'added')
      expect(added).toHaveLength(1)
      expect(added[0]!.content).toBe('b')
    })

    it('should detect a single line removal', () => {
      const result = computer.compute(['a', 'b', 'c'], ['a', 'c'])
      const removed = result.filter((l) => l.type === 'removed')
      expect(removed).toHaveLength(1)
      expect(removed[0]!.content).toBe('b')
    })

    it('should detect modification (remove + add at same position)', () => {
      const result = computer.compute(['hello'], ['world'])
      expect(result.some((l) => l.type === 'removed')).toBe(true)
      expect(result.some((l) => l.type === 'added')).toBe(true)
    })

    it('should assign correct oldLineNumber for removed lines', () => {
      const result = computer.compute(['a', 'b', 'c'], ['a', 'c'])
      const removed = result.find((l) => l.type === 'removed')
      expect(removed!.oldLineNumber).toBe(2)
    })

    it('should assign correct newLineNumber for added lines', () => {
      const result = computer.compute(['a', 'c'], ['a', 'b', 'c'])
      const added = result.find((l) => l.type === 'added')
      expect(added!.newLineNumber).toBe(2)
    })

    it('should handle multiple changes spread across the file', () => {
      const result = computer.compute(
        ['line1', 'line2', 'line3', 'line4'],
        ['line1', 'modified2', 'line3', 'added5'],
      )
      const types = result.map((l) => l.type)
      expect(types).toContain('removed')
      expect(types).toContain('added')
      expect(types).toContain('unchanged')
    })

    it('should handle completely different files', () => {
      const result = computer.compute(['x', 'y', 'z'], ['a', 'b', 'c'])
      expect(result.some((l) => l.type === 'removed')).toBe(true)
      expect(result.some((l) => l.type === 'added')).toBe(true)
    })

    it('should preserve line content correctly', () => {
      const result = computer.compute(['  indented'], ['  indented'])
      expect(result[0]!.content).toBe('  indented')
    })

    it('should handle single line in both inputs', () => {
      const result = computer.compute(['only'], ['only'])
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('unchanged')
    })

    it('should handle single line change', () => {
      const result = computer.compute(['old'], ['new'])
      expect(result).toHaveLength(2)
      expect(result[0]!.type).toBe('removed')
      expect(result[1]!.type).toBe('added')
    })
  })

  describe('computeHunks', () => {
    it('should return empty array for empty diff lines', () => {
      const result = computer.computeHunks([], 3)
      expect(result).toEqual([])
    })

    it('should return empty array for all unchanged lines', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
        { type: 'unchanged', content: 'b', oldLineNumber: 2, newLineNumber: 2 },
      ]
      const result = computer.computeHunks(lines, 3)
      expect(result).toEqual([])
    })

    it('should create a hunk for a single change', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
        { type: 'removed', content: 'b', oldLineNumber: 2 },
        { type: 'added', content: 'B', newLineNumber: 2 },
        { type: 'unchanged', content: 'c', oldLineNumber: 3, newLineNumber: 3 },
      ]
      const hunks = computer.computeHunks(lines, 3)
      expect(hunks).toHaveLength(1)
      expect(hunks[0]!.lines).toHaveLength(4)
    })

    it('should separate hunks when changes are far apart', () => {
      const lines: DiffLine[] = []
      for (let i = 0; i < 20; i++) {
        lines.push({ type: 'unchanged', content: `line${i}`, oldLineNumber: i + 1, newLineNumber: i + 1 })
      }
      lines[2] = { type: 'removed', content: 'changed1', oldLineNumber: 3 }
      lines[17] = { type: 'added', content: 'changed2', newLineNumber: 18 }

      const hunks = computer.computeHunks(lines, 2)
      expect(hunks.length).toBeGreaterThanOrEqual(2)
    })

    it('should include context lines around changes', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
        { type: 'unchanged', content: 'b', oldLineNumber: 2, newLineNumber: 2 },
        { type: 'unchanged', content: 'c', oldLineNumber: 3, newLineNumber: 3 },
        { type: 'removed', content: 'd', oldLineNumber: 4 },
        { type: 'unchanged', content: 'e', oldLineNumber: 5, newLineNumber: 5 },
        { type: 'unchanged', content: 'f', oldLineNumber: 6, newLineNumber: 6 },
      ]
      const hunks = computer.computeHunks(lines, 1)
      expect(hunks).toHaveLength(1)
    })

    it('should generate correct header format', () => {
      const lines: DiffLine[] = [
        { type: 'removed', content: 'a', oldLineNumber: 1 },
        { type: 'added', content: 'b', newLineNumber: 1 },
      ]
      const hunks = computer.computeHunks(lines, 0)
      expect(hunks[0]!.header).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@$/)
    })

    it('should merge nearby hunks into one', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
        { type: 'removed', content: 'b', oldLineNumber: 2 },
        { type: 'unchanged', content: 'c', oldLineNumber: 3, newLineNumber: 3 },
        { type: 'added', content: 'd', newLineNumber: 4 },
        { type: 'unchanged', content: 'e', oldLineNumber: 5, newLineNumber: 5 },
      ]
      const hunks = computer.computeHunks(lines, 3)
      expect(hunks).toHaveLength(1)
    })
  })

  describe('lcs', () => {
    it('should return empty array for two empty inputs', () => {
      expect(computer.lcs([], [])).toEqual([])
    })

    it('should return all elements when arrays are identical', () => {
      expect(computer.lcs(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for completely different inputs', () => {
      expect(computer.lcs(['a'], ['b'])).toEqual([])
    })

    it('should find common subsequence', () => {
      const result = computer.lcs(['a', 'b', 'c', 'd'], ['a', 'c', 'e', 'd'])
      expect(result).toContain('a')
      expect(result).toContain('c')
    })

    it('should handle one empty input', () => {
      expect(computer.lcs(['a', 'b'], [])).toEqual([])
      expect(computer.lcs([], ['a', 'b'])).toEqual([])
    })

    it('should handle single common element', () => {
      expect(computer.lcs(['x'], ['x'])).toEqual(['x'])
    })

    it('should find longest subsequence in complex case', () => {
      const result = computer.lcs(
        ['a', 'b', 'c', 'd', 'e'],
        ['a', 'c', 'b', 'd', 'f'],
      )
      expect(result.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('computeStats', () => {
    it('should return zero stats for empty diff', () => {
      const stats = computer.computeStats([])
      expect(stats.additions).toBe(0)
      expect(stats.deletions).toBe(0)
      expect(stats.modifications).toBe(0)
      expect(stats.unchanged).toBe(0)
      expect(stats.totalLines).toBe(0)
      expect(stats.changePercent).toBe(0)
    })

    it('should count additions correctly', () => {
      const lines: DiffLine[] = [
        { type: 'added', content: 'a' },
        { type: 'added', content: 'b' },
      ]
      const stats = computer.computeStats(lines)
      expect(stats.additions).toBe(2)
    })

    it('should count deletions correctly', () => {
      const lines: DiffLine[] = [
        { type: 'removed', content: 'a' },
        { type: 'removed', content: 'b' },
        { type: 'removed', content: 'c' },
      ]
      const stats = computer.computeStats(lines)
      expect(stats.deletions).toBe(3)
    })

    it('should count unchanged correctly', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'a' },
        { type: 'unchanged', content: 'b' },
      ]
      const stats = computer.computeStats(lines)
      expect(stats.unchanged).toBe(2)
    })

    it('should compute totalLines as sum of all types', () => {
      const lines: DiffLine[] = [
        { type: 'added', content: 'a' },
        { type: 'removed', content: 'b' },
        { type: 'unchanged', content: 'c' },
        { type: 'modified', content: 'd' },
      ]
      const stats = computer.computeStats(lines)
      expect(stats.totalLines).toBe(4)
    })

    it('should compute changePercent correctly', () => {
      const lines: DiffLine[] = [
        { type: 'added', content: 'a' },
        { type: 'unchanged', content: 'b' },
      ]
      const stats = computer.computeStats(lines)
      expect(stats.changePercent).toBe(50)
    })

    it('should handle all unchanged lines giving 0 percent', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'a' },
        { type: 'unchanged', content: 'b' },
        { type: 'unchanged', content: 'c' },
      ]
      const stats = computer.computeStats(lines)
      expect(stats.changePercent).toBe(0)
    })

    it('should handle all changed lines giving 100 percent', () => {
      const lines: DiffLine[] = [
        { type: 'added', content: 'a' },
        { type: 'removed', content: 'b' },
      ]
      const stats = computer.computeStats(lines)
      expect(stats.changePercent).toBe(100)
    })
  })

  describe('isUnchanged', () => {
    it('should return true for identical strings', () => {
      expect(computer.isUnchanged('hello', 'hello')).toBe(true)
    })

    it('should return false for different strings', () => {
      expect(computer.isUnchanged('hello', 'world')).toBe(false)
    })

    it('should return true for both empty strings', () => {
      expect(computer.isUnchanged('', '')).toBe(true)
    })

    it('should be sensitive to whitespace by default', () => {
      expect(computer.isUnchanged('hello', 'hello ')).toBe(false)
    })

    it('should be sensitive to case by default', () => {
      expect(computer.isUnchanged('Hello', 'hello')).toBe(false)
    })
  })
})

describe('DiffEngine', () => {
  describe('constructor', () => {
    it('should create engine with default options', () => {
      const engine = new DiffEngine()
      const opts = engine.getOptions()
      expect(opts.contextLines).toBe(DEFAULT_PATCH_OPTIONS.contextLines)
      expect(opts.ignoreWhitespace).toBe(DEFAULT_PATCH_OPTIONS.ignoreWhitespace)
      expect(opts.ignoreCase).toBe(DEFAULT_PATCH_OPTIONS.ignoreCase)
      expect(opts.maxLineLength).toBe(DEFAULT_PATCH_OPTIONS.maxLineLength)
    })

    it('should accept custom options', () => {
      const engine = new DiffEngine({ contextLines: 5, ignoreWhitespace: true })
      const opts = engine.getOptions()
      expect(opts.contextLines).toBe(5)
      expect(opts.ignoreWhitespace).toBe(true)
      expect(opts.ignoreCase).toBe(false)
    })

    it('should allow partial option override', () => {
      const engine = new DiffEngine({ ignoreCase: true })
      const opts = engine.getOptions()
      expect(opts.ignoreCase).toBe(true)
      expect(opts.contextLines).toBe(DEFAULT_PATCH_OPTIONS.contextLines)
    })
  })

  describe('diff', () => {
    it('should produce a DiffResult with hunks for changed content', () => {
      const engine = new DiffEngine()
      const result = engine.diff('line1\nline2\nline3', 'line1\nmodified\nline3')
      expect(result.hunks.length).toBeGreaterThan(0)
      expect(result.oldContent).toBe('line1\nline2\nline3')
      expect(result.newContent).toBe('line1\nmodified\nline3')
    })

    it('should produce no hunks for identical content', () => {
      const engine = new DiffEngine()
      const result = engine.diff('same', 'same')
      expect(result.hunks).toEqual([])
    })

    it('should include stats in result', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb\nc', 'a\nd\nc')
      expect(result.stats).toBeDefined()
      expect(result.stats.additions + result.stats.deletions).toBeGreaterThan(0)
    })

    it('should include path when provided', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a', 'b', 'file.ts')
      expect(result.path).toBe('file.ts')
    })

    it('should have undefined path when not provided', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a', 'b')
      expect(result.path).toBeUndefined()
    })

    it('should handle multiline diff correctly', () => {
      const engine = new DiffEngine()
      const oldContent = ['line1', 'line2', 'line3', 'line4', 'line5'].join('\n')
      const newContent = ['line1', 'line2-mod', 'line3', 'line4', 'line5-new'].join('\n')
      const result = engine.diff(oldContent, newContent)
      expect(result.stats.additions).toBeGreaterThan(0)
      expect(result.stats.deletions).toBeGreaterThan(0)
    })

    it('should handle empty old content', () => {
      const engine = new DiffEngine()
      const result = engine.diff('', 'new content')
      expect(result.stats.additions).toBeGreaterThan(0)
    })

    it('should handle empty new content', () => {
      const engine = new DiffEngine()
      const result = engine.diff('old content', '')
      expect(result.stats.deletions).toBeGreaterThan(0)
    })
  })

  describe('diffFiles', () => {
    it('should diff multiple files', () => {
      const engine = new DiffEngine()
      const oldFiles: Record<string, string> = {
        'a.ts': 'const a = 1',
        'b.ts': 'const b = 2',
      }
      const newFiles: Record<string, string> = {
        'a.ts': 'const a = 1',
        'b.ts': 'const b = 3',
      }
      const results = engine.diffFiles(oldFiles, newFiles)
      expect(results).toHaveLength(1)
      expect(results[0]!.path).toBe('b.ts')
    })

    it('should detect added files', () => {
      const engine = new DiffEngine()
      const oldFiles: Record<string, string> = { 'a.ts': 'content' }
      const newFiles: Record<string, string> = { 'a.ts': 'content', 'b.ts': 'new' }
      const results = engine.diffFiles(oldFiles, newFiles)
      expect(results).toHaveLength(1)
      expect(results[0]!.path).toBe('b.ts')
      expect(results[0]!.stats.additions).toBeGreaterThan(0)
    })

    it('should detect removed files', () => {
      const engine = new DiffEngine()
      const oldFiles: Record<string, string> = { 'a.ts': 'content', 'b.ts': 'old' }
      const newFiles: Record<string, string> = { 'a.ts': 'content' }
      const results = engine.diffFiles(oldFiles, newFiles)
      expect(results).toHaveLength(1)
      expect(results[0]!.path).toBe('b.ts')
      expect(results[0]!.stats.deletions).toBeGreaterThan(0)
    })

    it('should skip unchanged files', () => {
      const engine = new DiffEngine()
      const oldFiles: Record<string, string> = { 'a.ts': 'same' }
      const newFiles: Record<string, string> = { 'a.ts': 'same' }
      const results = engine.diffFiles(oldFiles, newFiles)
      expect(results).toHaveLength(0)
    })

    it('should handle empty file maps', () => {
      const engine = new DiffEngine()
      const results = engine.diffFiles({}, {})
      expect(results).toHaveLength(0)
    })

    it('should detect changes across multiple files', () => {
      const engine = new DiffEngine()
      const oldFiles: Record<string, string> = {
        'a.ts': 'old a',
        'b.ts': 'old b',
      }
      const newFiles: Record<string, string> = {
        'a.ts': 'new a',
        'b.ts': 'new b',
      }
      const results = engine.diffFiles(oldFiles, newFiles)
      expect(results).toHaveLength(2)
    })
  })

  describe('formatPatch', () => {
    it('should format a patch with --- and +++ headers when path provided', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb', 'a\nc', 'test.ts')
      const patch = engine.formatPatch(result)
      expect(patch).toContain('--- a/test.ts')
      expect(patch).toContain('+++ b/test.ts')
    })

    it('should format a patch with default headers when no path', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb', 'a\nc')
      const patch = engine.formatPatch(result)
      expect(patch).toContain('--- a/original')
      expect(patch).toContain('+++ b/modified')
    })

    it('should include hunk headers', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb', 'a\nc')
      const patch = engine.formatPatch(result)
      expect(patch).toContain('@@')
    })

    it('should prefix added lines with +', () => {
      const engine = new DiffEngine()
      const result = engine.diff('', 'new line')
      const patch = engine.formatPatch(result)
      expect(patch).toContain('+new line')
    })

    it('should prefix removed lines with -', () => {
      const engine = new DiffEngine()
      const result = engine.diff('old line', '')
      const patch = engine.formatPatch(result)
      expect(patch).toContain('-old line')
    })

    it('should prefix unchanged lines with space', () => {
      const engine = new DiffEngine()
      const result = engine.diff('same\ndiff', 'same\nchanged')
      const patch = engine.formatPatch(result)
      expect(patch).toContain(' same')
    })
  })

  describe('formatUnified', () => {
    it('should format with hunk headers', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb', 'a\nc')
      const unified = engine.formatUnified(result)
      expect(unified).toContain('@@')
    })

    it('should use + prefix for additions', () => {
      const engine = new DiffEngine()
      const result = engine.diff('', 'added')
      const unified = engine.formatUnified(result)
      expect(unified).toContain('+added')
    })

    it('should use - prefix for removals', () => {
      const engine = new DiffEngine()
      const result = engine.diff('removed', '')
      const unified = engine.formatUnified(result)
      expect(unified).toContain('-removed')
    })

    it('should use space prefix for unchanged', () => {
      const engine = new DiffEngine()
      const result = engine.diff('same\nold', 'same\nnew')
      const unified = engine.formatUnified(result)
      expect(unified).toContain(' same')
    })

    it('should return empty string for no changes', () => {
      const engine = new DiffEngine()
      const result = engine.diff('same', 'same')
      const unified = engine.formatUnified(result)
      expect(unified).toBe('')
    })
  })

  describe('formatSideBySide', () => {
    it('should format side by side with separator', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb', 'a\nc')
      const sideBySide = engine.formatSideBySide(result)
      expect(sideBySide).toContain('|')
    })

    it('should include hunk headers', () => {
      const engine = new DiffEngine()
      const result = engine.diff('old', 'new')
      const sideBySide = engine.formatSideBySide(result)
      expect(sideBySide).toContain('@@')
    })

    it('should show removals on left side', () => {
      const engine = new DiffEngine()
      const result = engine.diff('removed', 'added')
      const sideBySide = engine.formatSideBySide(result)
      expect(sideBySide).toContain('- removed')
    })

    it('should show additions on right side', () => {
      const engine = new DiffEngine()
      const result = engine.diff('removed', 'added')
      const sideBySide = engine.formatSideBySide(result)
      expect(sideBySide).toContain('+ added')
    })

    it('should respect custom width', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a', 'b')
      const sideBySide = engine.formatSideBySide(result, 40)
      expect(sideBySide).toContain('|')
      const lines = sideBySide.split('\n')
      for (const line of lines) {
        expect(line.length).toBeLessThanOrEqual(42)
      }
    })

    it('should return empty string for no changes', () => {
      const engine = new DiffEngine()
      const result = engine.diff('same', 'same')
      const sideBySide = engine.formatSideBySide(result)
      expect(sideBySide).toBe('')
    })
  })

  describe('applyPatch', () => {
    it('should successfully apply a valid patch', () => {
      const engine = new DiffEngine()
      const patch = '--- a/test.ts\n+++ b/test.ts\n@@ -1,2 +1,2 @@\n a\n-b\n+c'
      const result = engine.applyPatch('a\nb', patch)
      expect(result.success).toBe(true)
      expect(result.applied).toBe(true)
      expect(result.rejects).toBe(0)
    })

    it('should report conflicts for mismatched content', () => {
      const engine = new DiffEngine()
      const patch = '--- a/test.ts\n+++ b/test.ts\n@@ -1,1 +1,1 @@\n-wrong\n+correct'
      const result = engine.applyPatch('different', patch)
      expect(result.rejects).toBeGreaterThan(0)
    })

    it('should handle empty original and patch adding lines', () => {
      const engine = new DiffEngine()
      const patch = '--- a/test.ts\n+++ b/test.ts\n@@ -0,0 +1,2 @@\n+line1\n+line2'
      const result = engine.applyPatch('', patch)
      expect(result.applied).toBe(true)
    })

    it('should return success false when rejects exist', () => {
      const engine = new DiffEngine()
      const patch = '--- a/test.ts\n+++ b/test.ts\n@@ -1,1 +1,1 @@\n-wrong\n+right'
      const result = engine.applyPatch('actual', patch)
      expect(result.success).toBe(false)
    })

    it('should return applied false for empty patch', () => {
      const engine = new DiffEngine()
      const result = engine.applyPatch('content', '')
      expect(result.applied).toBe(false)
      expect(result.success).toBe(true)
    })

    it('should include conflict descriptions', () => {
      const engine = new DiffEngine()
      const patch = '--- a/test.ts\n+++ b/test.ts\n@@ -1,1 +1,1 @@\n-missing\n+replacement'
      const result = engine.applyPatch('actual', patch)
      expect(result.conflicts.length).toBeGreaterThan(0)
    })
  })

  describe('reverse', () => {
    it('should swap additions and deletions', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb\nc', 'a\nd\nc')
      const reversed = engine.reverse(result)

      const originalAdded = result.stats.additions
      const originalDeleted = result.stats.deletions
      expect(reversed.stats.additions).toBe(originalDeleted)
      expect(reversed.stats.deletions).toBe(originalAdded)
    })

    it('should swap oldContent and newContent', () => {
      const engine = new DiffEngine()
      const result = engine.diff('old', 'new')
      const reversed = engine.reverse(result)
      expect(reversed.oldContent).toBe('new')
      expect(reversed.newContent).toBe('old')
    })

    it('should preserve path', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a', 'b', 'file.ts')
      const reversed = engine.reverse(result)
      expect(reversed.path).toBe('file.ts')
    })

    it('should leave unchanged stats the same', () => {
      const engine = new DiffEngine()
      const result = engine.diff('same\nold', 'same\nnew')
      const reversed = engine.reverse(result)
      expect(reversed.stats.unchanged).toBe(result.stats.unchanged)
    })

    it('should generate reversed hunk headers', () => {
      const engine = new DiffEngine()
      const result = engine.diff('a\nb', 'a\nc')
      const reversed = engine.reverse(result)
      expect(reversed.hunks[0]!.header).toMatch(/^@@/)
    })
  })

  describe('getOptions', () => {
    it('should return a copy of the options', () => {
      const engine = new DiffEngine({ contextLines: 5 })
      const opts = engine.getOptions()
      expect(opts.contextLines).toBe(5)
    })

    it('should not allow mutation of internal options', () => {
      const engine = new DiffEngine()
      const opts = engine.getOptions()
      opts.contextLines = 99
      expect(engine.getOptions().contextLines).toBe(DEFAULT_PATCH_OPTIONS.contextLines)
    })
  })

  describe('mergeDiffs', () => {
    it('should merge two diff results', () => {
      const engine = new DiffEngine()
      const diff1 = engine.diff('a\nb', 'a\nc')
      const diff2 = engine.diff('x\ny', 'x\nz')
      const merged = engine.mergeDiffs(diff1, diff2)
      expect(merged.stats.additions).toBeGreaterThan(0)
    })

    it('should use old content from first diff', () => {
      const engine = new DiffEngine()
      const diff1 = engine.diff('original', 'mid')
      const diff2 = engine.diff('mid', 'final')
      const merged = engine.mergeDiffs(diff1, diff2)
      expect(merged.oldContent).toBe('original')
    })

    it('should use new content from second diff', () => {
      const engine = new DiffEngine()
      const diff1 = engine.diff('original', 'mid')
      const diff2 = engine.diff('mid', 'final')
      const merged = engine.mergeDiffs(diff1, diff2)
      expect(merged.newContent).toBe('final')
    })

    it('should combine stats from both diffs', () => {
      const engine = new DiffEngine()
      const diff1 = engine.diff('a', 'b')
      const diff2 = engine.diff('c', 'd')
      const merged = engine.mergeDiffs(diff1, diff2)
      const combinedAdditions = diff1.stats.additions + diff2.stats.additions
      expect(merged.stats.additions).toBe(combinedAdditions)
    })
  })

  describe('ignoreWhitespace option', () => {
    it('should ignore whitespace differences when enabled', () => {
      const engine = new DiffEngine({ ignoreWhitespace: true })
      const result = engine.diff('  hello  ', 'hello')
      expect(result.stats.additions + result.stats.deletions).toBe(0)
    })

    it('should detect whitespace differences when disabled', () => {
      const engine = new DiffEngine({ ignoreWhitespace: false })
      const result = engine.diff('  hello  ', 'hello')
      expect(result.stats.additions + result.stats.deletions).toBeGreaterThan(0)
    })
  })

  describe('ignoreCase option', () => {
    it('should ignore case differences when enabled', () => {
      const engine = new DiffEngine({ ignoreCase: true })
      const result = engine.diff('Hello', 'hello')
      expect(result.stats.additions + result.stats.deletions).toBe(0)
    })

    it('should detect case differences when disabled', () => {
      const engine = new DiffEngine({ ignoreCase: false })
      const result = engine.diff('Hello', 'hello')
      expect(result.stats.additions + result.stats.deletions).toBeGreaterThan(0)
    })
  })

  describe('maxLineLength option', () => {
    it('should truncate long lines when maxLineLength is set', () => {
      const engine = new DiffEngine({ maxLineLength: 10 })
      const longLine = 'a'.repeat(100)
      const differentLong = 'b'.repeat(100)
      const result = engine.diff(longLine, differentLong)
      expect(result).toBeDefined()
    })

    it('should not truncate when maxLineLength is 0', () => {
      const engine = new DiffEngine({ maxLineLength: 0 })
      const result = engine.diff('short', 'short')
      expect(result.stats.additions + result.stats.deletions).toBe(0)
    })
  })
})

describe('DEFAULT_PATCH_OPTIONS', () => {
  it('should have contextLines of 3', () => {
    expect(DEFAULT_PATCH_OPTIONS.contextLines).toBe(3)
  })

  it('should have ignoreWhitespace false', () => {
    expect(DEFAULT_PATCH_OPTIONS.ignoreWhitespace).toBe(false)
  })

  it('should have ignoreCase false', () => {
    expect(DEFAULT_PATCH_OPTIONS.ignoreCase).toBe(false)
  })

  it('should have maxLineLength of 1000', () => {
    expect(DEFAULT_PATCH_OPTIONS.maxLineLength).toBe(1000)
  })
})

describe('Edge cases', () => {
  it('should handle very large files', () => {
    const computer = new DiffComputer()
    const oldLines = Array.from({ length: 1000 }, (_, i) => `line${i}`)
    const newLines = Array.from({ length: 1000 }, (_, i) => (i === 500 ? 'modified' : `line${i}`))
    const result = computer.compute(oldLines, newLines)
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((l) => l.type === 'removed')).toBe(true)
    expect(result.some((l) => l.type === 'added')).toBe(true)
  })

  it('should handle diff of content with itself producing no changes', () => {
    const engine = new DiffEngine()
    const content = 'line1\nline2\nline3\nline4\nline5'
    const result = engine.diff(content, content)
    expect(result.hunks).toEqual([])
    expect(result.stats.changePercent).toBe(0)
  })

  it('should round-trip diff and reverse', () => {
    const engine = new DiffEngine()
    const oldContent = 'a\nb\nc\nd\ne'
    const newContent = 'a\nB\nc\nD\ne'
    const result = engine.diff(oldContent, newContent)
    const reversed = engine.reverse(result)
    const doubleReversed = engine.reverse(reversed)
    expect(doubleReversed.oldContent).toBe(oldContent)
    expect(doubleReversed.newContent).toBe(newContent)
  })

  it('should handle content with only newlines', () => {
    const engine = new DiffEngine()
    const result = engine.diff('\n\n\n', '\n\n')
    expect(result.stats).toBeDefined()
  })

  it('should handle diffFiles with only added files', () => {
    const engine = new DiffEngine()
    const results = engine.diffFiles({}, { 'new.ts': 'content' })
    expect(results).toHaveLength(1)
    expect(results[0]!.stats.additions).toBeGreaterThan(0)
  })

  it('should handle diffFiles with only removed files', () => {
    const engine = new DiffEngine()
    const results = engine.diffFiles({ 'old.ts': 'content' }, {})
    expect(results).toHaveLength(1)
    expect(results[0]!.stats.deletions).toBeGreaterThan(0)
  })
})
