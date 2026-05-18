import { describe, it, expect } from 'vitest'
import { DiffComputer } from '../src/core/diff-engine/diff-computer.js'
import { DiffEngine } from '../src/core/diff-engine/diff-engine.js'
import { DEFAULT_PATCH_OPTIONS } from '../src/core/diff-engine/types.js'
import type { DiffLine, DiffResult, PatchOptions } from '../src/core/diff-engine/types.js'

// ─── DEFAULT_PATCH_OPTIONS ──────────────────────────────────────────
describe('DEFAULT_PATCH_OPTIONS', () => {
  it('has correct default values', () => {
    expect(DEFAULT_PATCH_OPTIONS).toEqual({
      contextLines: 3,
      ignoreWhitespace: false,
      ignoreCase: false,
      maxLineLength: 1000,
    })
  })
})

// ─── DiffComputer – compute ─────────────────────────────────────────
describe('DiffComputer.compute', () => {
  const computer = new DiffComputer()

  it('returns empty array for two empty inputs', () => {
    expect(computer.compute([], [])).toEqual([])
  })

  it('marks all old lines as removed when new is empty', () => {
    const result = computer.compute(['a', 'b'], [])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'removed', content: 'a', oldLineNumber: 1 })
    expect(result[1]).toEqual({ type: 'removed', content: 'b', oldLineNumber: 2 })
  })

  it('marks all new lines as added when old is empty', () => {
    const result = computer.compute([], ['x', 'y'])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'added', content: 'x', newLineNumber: 1 })
    expect(result[1]).toEqual({ type: 'added', content: 'y', newLineNumber: 2 })
  })

  it('marks identical content as unchanged', () => {
    const result = computer.compute(['hello'], ['hello'])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      type: 'unchanged',
      content: 'hello',
      oldLineNumber: 1,
      newLineNumber: 1,
    })
  })

  it('detects a single line modification as remove+add', () => {
    const result = computer.compute(['old line'], ['new line'])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'removed', content: 'old line', oldLineNumber: 1 })
    expect(result[1]).toEqual({ type: 'added', content: 'new line', newLineNumber: 1 })
  })

  it('detects addition at end of file', () => {
    const result = computer.compute(['a'], ['a', 'b'])
    expect(result).toHaveLength(2)
    expect(result[0]!.type).toBe('unchanged')
    expect(result[1]).toEqual({ type: 'added', content: 'b', newLineNumber: 2 })
  })

  it('detects removal from end of file', () => {
    const result = computer.compute(['a', 'b'], ['a'])
    expect(result).toHaveLength(2)
    expect(result[0]!.type).toBe('unchanged')
    expect(result[1]).toEqual({ type: 'removed', content: 'b', oldLineNumber: 2 })
  })

  it('detects insertion in the middle', () => {
    const result = computer.compute(['a', 'c'], ['a', 'b', 'c'])
    expect(result).toHaveLength(3)
    expect(result[0]!.type).toBe('unchanged')
    expect(result[1]).toEqual({ type: 'added', content: 'b', newLineNumber: 2 })
    expect(result[2]!.type).toBe('unchanged')
  })

  it('detects deletion in the middle', () => {
    const result = computer.compute(['a', 'b', 'c'], ['a', 'c'])
    expect(result).toHaveLength(3)
    expect(result[0]!.type).toBe('unchanged')
    expect(result[1]).toEqual({ type: 'removed', content: 'b', oldLineNumber: 2 })
    expect(result[2]!.type).toBe('unchanged')
  })

  it('handles multi-line identical content', () => {
    const result = computer.compute(['x', 'y', 'z'], ['x', 'y', 'z'])
    expect(result.every((l) => l.type === 'unchanged')).toBe(true)
    expect(result).toHaveLength(3)
  })

  it('assigns correct line numbers for unchanged lines', () => {
    const result = computer.compute(['a', 'b'], ['a', 'b'])
    expect(result[0]).toMatchObject({ oldLineNumber: 1, newLineNumber: 1 })
    expect(result[1]).toMatchObject({ oldLineNumber: 2, newLineNumber: 2 })
  })

  it('handles complete file replacement', () => {
    const result = computer.compute(['a', 'b'], ['c', 'd'])
    expect(result).toHaveLength(4)
    expect(result.filter((l) => l.type === 'removed')).toHaveLength(2)
    expect(result.filter((l) => l.type === 'added')).toHaveLength(2)
  })

  it('handles single line added to single line unchanged', () => {
    const result = computer.compute(['same'], ['same', 'added'])
    expect(result[0]!.type).toBe('unchanged')
    expect(result[1]!.type).toBe('added')
    expect(result[1]!.content).toBe('added')
  })

  it('handles empty strings as lines', () => {
    const result = computer.compute([''], [''])
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('unchanged')
  })

  it('handles multiple consecutive additions', () => {
    const result = computer.compute(['a'], ['a', 'b', 'c', 'd'])
    expect(result.filter((l) => l.type === 'added')).toHaveLength(3)
  })

  it('handles multiple consecutive removals', () => {
    const result = computer.compute(['a', 'b', 'c', 'd'], ['a'])
    expect(result.filter((l) => l.type === 'removed')).toHaveLength(3)
  })
})

// ─── DiffComputer – lcs ─────────────────────────────────────────────
describe('DiffComputer.lcs', () => {
  const computer = new DiffComputer()

  it('returns empty array for two empty inputs', () => {
    expect(computer.lcs([], [])).toEqual([])
  })

  it('returns empty array when no common subsequence', () => {
    expect(computer.lcs(['a'], ['b'])).toEqual([])
  })

  it('finds full match for identical arrays', () => {
    expect(computer.lcs(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('finds single common element', () => {
    expect(computer.lcs(['a', 'b'], ['b', 'c'])).toEqual(['b'])
  })

  it('finds LCS in non-contiguous order', () => {
    const result = computer.lcs(['a', 'b', 'c'], ['b', 'a', 'c'])
    expect(result).toEqual(['b', 'c'])
  })

  it('returns empty when first array is empty', () => {
    expect(computer.lcs([], ['a', 'b'])).toEqual([])
  })

  it('returns empty when second array is empty', () => {
    expect(computer.lcs(['a', 'b'], [])).toEqual([])
  })

  it('handles duplicate elements correctly', () => {
    expect(computer.lcs(['a', 'a', 'b'], ['a', 'b', 'a'])).toEqual(['a', 'b'])
  })

  it('handles long arrays', () => {
    const a = ['x', 'y', 'z', 'a', 'b', 'c']
    const b = ['a', 'x', 'y', 'b', 'z', 'c']
    const result = computer.lcs(a, b)
    // Verify it's a valid subsequence of both
    for (const item of result) {
      expect(a).toContain(item)
      expect(b).toContain(item)
    }
  })
})

// ─── DiffComputer – computeHunks ────────────────────────────────────
describe('DiffComputer.computeHunks', () => {
  const computer = new DiffComputer()

  it('returns empty array for empty input', () => {
    expect(computer.computeHunks([], 3)).toEqual([])
  })

  it('returns empty array when all lines are unchanged', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'unchanged', content: 'b', oldLineNumber: 2, newLineNumber: 2 },
    ]
    expect(computer.computeHunks(lines, 3)).toEqual([])
  })

  it('creates a single hunk for small changes', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'removed', content: 'b', oldLineNumber: 2 },
      { type: 'added', content: 'c', newLineNumber: 2 },
      { type: 'unchanged', content: 'd', oldLineNumber: 3, newLineNumber: 3 },
    ]
    const hunks = computer.computeHunks(lines, 3)
    expect(hunks).toHaveLength(1)
    expect(hunks[0]!.lines).toEqual(lines)
  })

  it('generates correct header format', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'x', oldLineNumber: 1 },
      { type: 'added', content: 'y', newLineNumber: 1 },
    ]
    const hunks = computer.computeHunks(lines, 0)
    expect(hunks[0]!.header).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@$/)
  })

  it('splits into multiple hunks for distant changes', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'a', oldLineNumber: 1 },
      { type: 'added', content: 'A', newLineNumber: 1 },
      { type: 'unchanged', content: 'line', oldLineNumber: 2, newLineNumber: 2 },
      { type: 'unchanged', content: 'line', oldLineNumber: 3, newLineNumber: 3 },
      { type: 'unchanged', content: 'line', oldLineNumber: 4, newLineNumber: 4 },
      { type: 'unchanged', content: 'line', oldLineNumber: 5, newLineNumber: 5 },
      { type: 'unchanged', content: 'line', oldLineNumber: 6, newLineNumber: 6 },
      { type: 'unchanged', content: 'line', oldLineNumber: 7, newLineNumber: 7 },
      { type: 'unchanged', content: 'line', oldLineNumber: 8, newLineNumber: 8 },
      { type: 'removed', content: 'z', oldLineNumber: 9 },
      { type: 'added', content: 'Z', newLineNumber: 9 },
    ]
    const hunks = computer.computeHunks(lines, 1)
    expect(hunks.length).toBeGreaterThanOrEqual(2)
  })

  it('respects contextLines parameter of 0', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'removed', content: 'b', oldLineNumber: 2 },
      { type: 'unchanged', content: 'c', oldLineNumber: 3, newLineNumber: 3 },
    ]
    const hunks = computer.computeHunks(lines, 0)
    expect(hunks).toHaveLength(1)
    // With 0 context, only the changed line and adjacent changed lines
    expect(hunks[0]!.lines).toHaveLength(1)
    expect(hunks[0]!.lines[0]!.type).toBe('removed')
  })

  it('computes correct oldCount and newCount', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'removed', content: 'b', oldLineNumber: 2 },
      { type: 'added', content: 'B', newLineNumber: 2 },
      { type: 'unchanged', content: 'c', oldLineNumber: 3, newLineNumber: 3 },
    ]
    const hunks = computer.computeHunks(lines, 3)
    const hunk = hunks[0]!
    // oldCount = removed + unchanged = 3, newCount = added + unchanged = 3
    expect(hunk.oldCount).toBe(3)
    expect(hunk.newCount).toBe(3)
  })

  it('merges overlapping context ranges', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'a', oldLineNumber: 1 },
      { type: 'unchanged', content: 'b', oldLineNumber: 2, newLineNumber: 2 },
      { type: 'removed', content: 'c', oldLineNumber: 3 },
    ]
    const hunks = computer.computeHunks(lines, 1)
    expect(hunks).toHaveLength(1)
  })

  it('sets oldStart and newStart from first matching lines', () => {
    const lines: DiffLine[] = [
      { type: 'added', content: 'new', newLineNumber: 1 },
      { type: 'unchanged', content: 'same', oldLineNumber: 1, newLineNumber: 2 },
    ]
    const hunks = computer.computeHunks(lines, 3)
    expect(hunks[0]!.newStart).toBe(1)
  })
})

// ─── DiffComputer – computeStats ────────────────────────────────────
describe('DiffComputer.computeStats', () => {
  const computer = new DiffComputer()

  it('returns zeros for empty input', () => {
    expect(computer.computeStats([])).toEqual({
      additions: 0,
      deletions: 0,
      modifications: 0,
      unchanged: 0,
      totalLines: 0,
      changePercent: 0,
    })
  })

  it('counts additions correctly', () => {
    const lines: DiffLine[] = [
      { type: 'added', content: 'a' },
      { type: 'added', content: 'b' },
    ]
    expect(computer.computeStats(lines).additions).toBe(2)
  })

  it('counts deletions correctly', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'a' },
      { type: 'removed', content: 'b' },
    ]
    expect(computer.computeStats(lines).deletions).toBe(2)
  })

  it('counts modifications correctly', () => {
    const lines: DiffLine[] = [
      { type: 'modified', content: 'a' },
    ]
    expect(computer.computeStats(lines).modifications).toBe(1)
  })

  it('counts unchanged lines correctly', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'a' },
      { type: 'unchanged', content: 'b' },
      { type: 'unchanged', content: 'c' },
    ]
    expect(computer.computeStats(lines).unchanged).toBe(3)
  })

  it('computes totalLines correctly', () => {
    const lines: DiffLine[] = [
      { type: 'added', content: 'a' },
      { type: 'removed', content: 'b' },
      { type: 'unchanged', content: 'c' },
      { type: 'modified', content: 'd' },
    ]
    expect(computer.computeStats(lines).totalLines).toBe(4)
  })

  it('computes changePercent for mixed changes', () => {
    const lines: DiffLine[] = [
      { type: 'added', content: 'a' },
      { type: 'removed', content: 'b' },
      { type: 'unchanged', content: 'c' },
      { type: 'unchanged', content: 'd' },
    ]
    // 2 changes / 4 total * 100 = 50
    expect(computer.computeStats(lines).changePercent).toBe(50)
  })

  it('changePercent is 0 when all unchanged', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'a' },
    ]
    expect(computer.computeStats(lines).changePercent).toBe(0)
  })

  it('changePercent is 100 when all changed', () => {
    const lines: DiffLine[] = [
      { type: 'added', content: 'a' },
      { type: 'removed', content: 'b' },
    ]
    expect(computer.computeStats(lines).changePercent).toBe(100)
  })

  it('rounds changePercent to 2 decimal places', () => {
    const lines: DiffLine[] = [
      { type: 'added', content: 'a' },
      { type: 'unchanged', content: 'b' },
      { type: 'unchanged', content: 'c' },
    ]
    // 1 / 3 * 100 = 33.333...
    const stats = computer.computeStats(lines)
    expect(stats.changePercent).toBe(33.33)
  })
})

// ─── DiffComputer – isUnchanged ─────────────────────────────────────
describe('DiffComputer.isUnchanged', () => {
  const computer = new DiffComputer()

  it('returns true for identical strings', () => {
    expect(computer.isUnchanged('hello', 'hello')).toBe(true)
  })

  it('returns false for different strings', () => {
    expect(computer.isUnchanged('hello', 'world')).toBe(false)
  })

  it('returns true for both empty strings', () => {
    expect(computer.isUnchanged('', '')).toBe(true)
  })

  it('returns false when only old is empty', () => {
    expect(computer.isUnchanged('', 'content')).toBe(false)
  })

  it('returns false when only new is empty', () => {
    expect(computer.isUnchanged('content', '')).toBe(false)
  })

  it('is case sensitive', () => {
    expect(computer.isUnchanged('Hello', 'hello')).toBe(false)
  })

  it('is whitespace sensitive', () => {
    expect(computer.isUnchanged('hello', 'hello ')).toBe(false)
  })
})

// ─── DiffEngine – constructor ───────────────────────────────────────
describe('DiffEngine constructor', () => {
  it('uses default options when none provided', () => {
    const engine = new DiffEngine()
    expect(engine.getOptions()).toEqual(DEFAULT_PATCH_OPTIONS)
  })

  it('merges partial options with defaults', () => {
    const engine = new DiffEngine({ contextLines: 5 })
    const opts = engine.getOptions()
    expect(opts.contextLines).toBe(5)
    expect(opts.ignoreWhitespace).toBe(false)
    expect(opts.ignoreCase).toBe(false)
    expect(opts.maxLineLength).toBe(1000)
  })

  it('accepts all custom options', () => {
    const engine = new DiffEngine({
      contextLines: 10,
      ignoreWhitespace: true,
      ignoreCase: true,
      maxLineLength: 500,
    })
    expect(engine.getOptions()).toEqual({
      contextLines: 10,
      ignoreWhitespace: true,
      ignoreCase: true,
      maxLineLength: 500,
    })
  })

  it('returns a copy of options from getOptions', () => {
    const engine = new DiffEngine()
    const opts = engine.getOptions()
    opts.contextLines = 999
    expect(engine.getOptions().contextLines).toBe(3)
  })
})

// ─── DiffEngine – diff ──────────────────────────────────────────────
describe('DiffEngine.diff', () => {
  it('returns a DiffResult with all required fields', () => {
    const engine = new DiffEngine()
    const result = engine.diff('a', 'b')
    expect(result).toHaveProperty('hunks')
    expect(result).toHaveProperty('oldContent')
    expect(result).toHaveProperty('newContent')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('path')
  })

  it('preserves oldContent and newContent', () => {
    const engine = new DiffEngine()
    const result = engine.diff('original', 'modified')
    expect(result.oldContent).toBe('original')
    expect(result.newContent).toBe('modified')
  })

  it('sets path when provided', () => {
    const engine = new DiffEngine()
    const result = engine.diff('a', 'b', 'src/file.ts')
    expect(result.path).toBe('src/file.ts')
  })

  it('sets path to undefined when not provided', () => {
    const engine = new DiffEngine()
    const result = engine.diff('a', 'b')
    expect(result.path).toBeUndefined()
  })

  it('returns empty hunks for identical content', () => {
    const engine = new DiffEngine()
    const result = engine.diff('same', 'same')
    expect(result.hunks).toEqual([])
  })

  it('returns correct stats for simple change', () => {
    const engine = new DiffEngine()
    const result = engine.diff('old', 'new')
    expect(result.stats.additions).toBe(1)
    expect(result.stats.deletions).toBe(1)
  })

  it('handles multi-line diff correctly', () => {
    const engine = new DiffEngine()
    const oldContent = 'line1\nline2\nline3'
    const newContent = 'line1\nmodified\nline3'
    const result = engine.diff(oldContent, newContent)
    expect(result.stats.unchanged).toBe(2)
    expect(result.stats.deletions).toBe(1)
    expect(result.stats.additions).toBe(1)
  })

  it('handles empty old content', () => {
    const engine = new DiffEngine()
    const result = engine.diff('', 'new content')
    expect(result.stats.additions).toBeGreaterThan(0)
  })

  it('handles empty new content', () => {
    const engine = new DiffEngine()
    const result = engine.diff('old content', '')
    expect(result.stats.deletions).toBeGreaterThan(0)
  })
})

// ─── DiffEngine – diff with ignoreWhitespace ────────────────────────
describe('DiffEngine.diff with ignoreWhitespace', () => {
  it('treats whitespace-only differences as unchanged', () => {
    const engine = new DiffEngine({ ignoreWhitespace: true })
    const result = engine.diff('  hello  world  ', 'hello world')
    expect(result.hunks).toEqual([])
  })

  it('still detects content differences with ignoreWhitespace', () => {
    const engine = new DiffEngine({ ignoreWhitespace: true })
    const result = engine.diff('hello world', 'hello earth')
    expect(result.stats.additions).toBeGreaterThan(0)
  })

  it('normalizes tabs and spaces', () => {
    const engine = new DiffEngine({ ignoreWhitespace: true })
    const result = engine.diff('\thello\t', ' hello ')
    expect(result.hunks).toEqual([])
  })
})

// ─── DiffEngine – diff with ignoreCase ──────────────────────────────
describe('DiffEngine.diff with ignoreCase', () => {
  it('treats case differences as unchanged', () => {
    const engine = new DiffEngine({ ignoreCase: true })
    const result = engine.diff('Hello World', 'hello world')
    expect(result.hunks).toEqual([])
  })

  it('still detects content differences with ignoreCase', () => {
    const engine = new DiffEngine({ ignoreCase: true })
    const result = engine.diff('hello', 'world')
    expect(result.stats.additions).toBeGreaterThan(0)
  })

  it('handles mixed case correctly', () => {
    const engine = new DiffEngine({ ignoreCase: true })
    const result = engine.diff('ABC', 'abc')
    expect(result.hunks).toEqual([])
  })
})

// ─── DiffEngine – diff with maxLineLength ───────────────────────────
describe('DiffEngine.diff with maxLineLength', () => {
  it('truncates long lines', () => {
    const engine = new DiffEngine({ maxLineLength: 5 })
    const longLine = 'abcdefghij'
    const result = engine.diff(longLine, 'abcde')
    // Both get truncated to 5 chars, so they match
    expect(result.hunks).toEqual([])
  })

  it('does not truncate short lines', () => {
    const engine = new DiffEngine({ maxLineLength: 100 })
    const result = engine.diff('short', 'short')
    expect(result.hunks).toEqual([])
  })

  it('respects maxLineLength of 0 (no truncation)', () => {
    const engine = new DiffEngine({ maxLineLength: 0 })
    const result = engine.diff('very long line here', 'very long line here')
    expect(result.hunks).toEqual([])
  })
})

// ─── DiffEngine – diffFiles ─────────────────────────────────────────
describe('DiffEngine.diffFiles', () => {
  it('returns empty array when all files are identical', () => {
    const engine = new DiffEngine()
    const files = { 'a.ts': 'content', 'b.ts': 'other' }
    expect(engine.diffFiles(files, files)).toEqual([])
  })

  it('detects changed files', () => {
    const engine = new DiffEngine()
    const oldFiles = { 'a.ts': 'old' }
    const newFiles = { 'a.ts': 'new' }
    const results = engine.diffFiles(oldFiles, newFiles)
    expect(results).toHaveLength(1)
    expect(results[0]!.path).toBe('a.ts')
  })

  it('detects added files', () => {
    const engine = new DiffEngine()
    const oldFiles: Record<string, string> = {}
    const newFiles = { 'new.ts': 'content' }
    const results = engine.diffFiles(oldFiles, newFiles)
    expect(results).toHaveLength(1)
    expect(results[0]!.path).toBe('new.ts')
    expect(results[0]!.stats.additions).toBeGreaterThan(0)
  })

  it('detects removed files', () => {
    const engine = new DiffEngine()
    const oldFiles = { 'old.ts': 'content' }
    const newFiles: Record<string, string> = {}
    const results = engine.diffFiles(oldFiles, newFiles)
    expect(results).toHaveLength(1)
    expect(results[0]!.path).toBe('old.ts')
    expect(results[0]!.stats.deletions).toBeGreaterThan(0)
  })

  it('handles mix of added, removed, and modified files', () => {
    const engine = new DiffEngine()
    const oldFiles = { 'keep.ts': 'same', 'modify.ts': 'old', 'remove.ts': 'gone' }
    const newFiles = { 'keep.ts': 'same', 'modify.ts': 'new', 'add.ts': 'fresh' }
    const results = engine.diffFiles(oldFiles, newFiles)
    expect(results).toHaveLength(3)
    const paths = results.map((r) => r.path).sort()
    expect(paths).toEqual(['add.ts', 'modify.ts', 'remove.ts'])
  })

  it('uses empty string for missing file content', () => {
    const engine = new DiffEngine()
    const results = engine.diffFiles({}, { 'new.ts': 'hello' })
    expect(results[0]!.oldContent).toBe('')
    expect(results[0]!.newContent).toBe('hello')
  })
})

// ─── DiffEngine – formatPatch ───────────────────────────────────────
describe('DiffEngine.formatPatch', () => {
  const engine = new DiffEngine()

  it('includes --- and +++ header lines with path', () => {
    const result = engine.diff('old', 'new', 'src/file.ts')
    const patch = engine.formatPatch(result)
    expect(patch).toContain('--- a/src/file.ts')
    expect(patch).toContain('+++ b/src/file.ts')
  })

  it('uses default header when no path', () => {
    const result = engine.diff('old', 'new')
    const patch = engine.formatPatch(result)
    expect(patch).toContain('--- a/original')
    expect(patch).toContain('+++ b/modified')
  })

  it('prefixes added lines with +', () => {
    const result = engine.diff('', 'new line')
    const patch = engine.formatPatch(result)
    expect(patch).toContain('+new line')
  })

  it('prefixes removed lines with -', () => {
    const result = engine.diff('old line', '')
    const patch = engine.formatPatch(result)
    expect(patch).toContain('-old line')
  })

  it('prefixes unchanged lines with space', () => {
    const result = engine.diff('same', 'same')
    // No hunks since identical
    const patch = engine.formatPatch(result)
    expect(patch).not.toContain(' same')
  })

  it('includes hunk headers', () => {
    const result = engine.diff('a\nb\nc', 'a\nX\nc')
    const patch = engine.formatPatch(result)
    expect(patch).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/)
  })

  it('formats multi-hunk diffs', () => {
    const oldContent = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n')
    const lines = oldContent.split('\n')
    lines[1] = 'CHANGED1'
    lines[18] = 'CHANGED2'
    const newContent = lines.join('\n')
    const result = engine.diff(oldContent, newContent)
    const patch = engine.formatPatch(result)
    const hunkCount = (patch.match(/@@/g) ?? []).length / 2
    expect(hunkCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── DiffEngine – formatUnified ─────────────────────────────────────
describe('DiffEngine.formatUnified', () => {
  const engine = new DiffEngine()

  it('includes hunk headers', () => {
    const result = engine.diff('a', 'b')
    const unified = engine.formatUnified(result)
    expect(unified).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/)
  })

  it('uses + prefix for added lines', () => {
    const result = engine.diff('', 'new')
    const unified = engine.formatUnified(result)
    expect(unified).toContain('+new')
  })

  it('uses - prefix for removed lines', () => {
    const result = engine.diff('old', '')
    const unified = engine.formatUnified(result)
    expect(unified).toContain('-old')
  })

  it('uses space prefix for unchanged lines', () => {
    const result = engine.diff('a\nb', 'a\nc')
    const unified = engine.formatUnified(result)
    expect(unified).toContain(' a')
  })

  it('uses ! prefix for modified type lines', () => {
    const result: DiffResult = {
      hunks: [{
        oldStart: 1,
        oldCount: 1,
        newStart: 1,
        newCount: 1,
        lines: [{ type: 'modified', content: 'changed line' }],
        header: '@@ -1,1 +1,1 @@',
      }],
      oldContent: 'old',
      newContent: 'new',
      stats: { additions: 0, deletions: 0, modifications: 1, unchanged: 0, totalLines: 1, changePercent: 100 },
    }
    const unified = engine.formatUnified(result)
    expect(unified).toContain('!changed line')
  })

  it('does not include --- / +++ headers', () => {
    const result = engine.diff('a', 'b', 'file.ts')
    const unified = engine.formatUnified(result)
    expect(unified).not.toContain('---')
    expect(unified).not.toContain('+++')
  })
})

// ─── DiffEngine – formatSideBySide ──────────────────────────────────
describe('DiffEngine.formatSideBySide', () => {
  const engine = new DiffEngine()

  it('includes hunk headers', () => {
    const result = engine.diff('a', 'b')
    const output = engine.formatSideBySide(result)
    expect(output).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/)
  })

  it('shows removed+added pairs side by side', () => {
    const result = engine.diff('old', 'new')
    const output = engine.formatSideBySide(result)
    expect(output).toContain('- ')
    expect(output).toContain(' + ')
  })

  it('shows removed-only lines with empty right side', () => {
    const result = engine.diff('a\nremoved', 'a')
    const output = engine.formatSideBySide(result)
    expect(output).toContain('- removed')
    expect(output).toContain(' |')
  })

  it('shows added-only lines with empty left side', () => {
    const result = engine.diff('a', 'a\nadded')
    const output = engine.formatSideBySide(result)
    expect(output).toContain('| + ')
  })

  it('shows unchanged lines on both sides', () => {
    const result = engine.diff('same\nchanged', 'same\nother')
    const output = engine.formatSideBySide(result)
    expect(output).toContain('|   same')
  })

  it('respects custom width', () => {
    const result = engine.diff('a', 'b')
    const narrow = engine.formatSideBySide(result, 40)
    const wide = engine.formatSideBySide(result, 200)
    expect(narrow.length).toBeGreaterThan(0)
    expect(wide.length).toBeGreaterThan(0)
  })

  it('uses default width of 80', () => {
    const result = engine.diff('a', 'b')
    const output = engine.formatSideBySide(result)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })
})

// ─── DiffEngine – applyPatch ────────────────────────────────────────
describe('DiffEngine.applyPatch', () => {
  const engine = new DiffEngine()

  it('applies a simple addition patch', () => {
    const result = engine.applyPatch('line1\nline2', '@@ -1,2 +1,3 @@\n line1\n+inserted\n line2')
    expect(result.success).toBe(true)
    expect(result.applied).toBe(true)
    expect(result.rejects).toBe(0)
  })

  it('applies a simple removal patch', () => {
    const result = engine.applyPatch(
      'line1\nremoved\nline2',
      '@@ -1,3 +1,2 @@\n line1\n-removed\n line2',
    )
    expect(result.success).toBe(true)
    expect(result.applied).toBe(true)
  })

  it('reports reject when content does not match', () => {
    const result = engine.applyPatch(
      'actual',
      '@@ -1,1 +1,0 @@\n-expected',
    )
    expect(result.success).toBe(false)
    expect(result.rejects).toBeGreaterThan(0)
  })

  it('reports conflicts with details', () => {
    const result = engine.applyPatch(
      'actual',
      '@@ -1,1 +1,0 @@\n-expected',
    )
    expect(result.conflicts.length).toBeGreaterThan(0)
    expect(result.conflicts[0]).toContain('expected')
  })

  it('skips --- and +++ header lines', () => {
    const patch = '--- a/file.ts\n+++ b/file.ts\n@@ -1,1 +1,1 @@\n-old\n+new'
    const result = engine.applyPatch('old', patch)
    expect(result.applied).toBe(true)
  })

  it('parses hunk header and positions correctly', () => {
    const original = 'a\nb\nc\nd'
    const patch = '@@ -2,1 +2,1 @@\n-b\n+B'
    const result = engine.applyPatch(original, patch)
    expect(result.applied).toBe(true)
  })

  it('handles empty original with pure additions', () => {
    const patch = '@@ -0,0 +1,1 @@\n+new line'
    const result = engine.applyPatch('', patch)
    expect(result.applied).toBe(true)
  })

  it('returns applied=false for empty patch', () => {
    const result = engine.applyPatch('content', '')
    expect(result.applied).toBe(false)
    expect(result.success).toBe(true)
  })

  it('preserves trailing content after patch', () => {
    const original = 'a\nb\nc\nd\ne'
    const patch = '@@ -1,3 +1,3 @@\n a\n-b\n+B\n c'
    const result = engine.applyPatch(original, patch)
    expect(result.success).toBe(true)
  })
})

// ─── DiffEngine – reverse ───────────────────────────────────────────
describe('DiffEngine.reverse', () => {
  const engine = new DiffEngine()

  it('swaps additions and deletions', () => {
    const result = engine.diff('old', 'new')
    const reversed = engine.reverse(result)
    const addedOriginal = result.stats.additions
    const removedOriginal = result.stats.deletions
    expect(reversed.stats.additions).toBe(removedOriginal)
    expect(reversed.stats.deletions).toBe(addedOriginal)
  })

  it('swaps oldContent and newContent', () => {
    const result = engine.diff('old content', 'new content')
    const reversed = engine.reverse(result)
    expect(reversed.oldContent).toBe('new content')
    expect(reversed.newContent).toBe('old content')
  })

  it('preserves modifications count', () => {
    const result: DiffResult = {
      hunks: [],
      oldContent: 'a',
      newContent: 'b',
      stats: { additions: 0, deletions: 0, modifications: 5, unchanged: 0, totalLines: 5, changePercent: 100 },
    }
    const reversed = engine.reverse(result)
    expect(reversed.stats.modifications).toBe(5)
  })

  it('preserves path', () => {
    const result = engine.diff('a', 'b', 'file.ts')
    const reversed = engine.reverse(result)
    expect(reversed.path).toBe('file.ts')
  })

  it('reverses line types correctly in hunks', () => {
    const result = engine.diff('removed', 'added')
    const reversed = engine.reverse(result)
    const originalLines = result.hunks.flatMap((h) => h.lines)
    const reversedLines = reversed.hunks.flatMap((h) => h.lines)
    const originalAdded = originalLines.filter((l) => l.type === 'added')
    const originalRemoved = originalLines.filter((l) => l.type === 'removed')
    const reversedAdded = reversedLines.filter((l) => l.type === 'added')
    const reversedRemoved = reversedLines.filter((l) => l.type === 'removed')
    expect(reversedAdded.length).toBe(originalRemoved.length)
    expect(reversedRemoved.length).toBe(originalAdded.length)
  })

  it('swaps line numbers for changed lines', () => {
    const result = engine.diff('old', 'new')
    const reversed = engine.reverse(result)
    const origRemoved = result.hunks.flatMap((h) => h.lines).find((l) => l.type === 'removed')
    const reversedAdded = reversed.hunks.flatMap((h) => h.lines).find((l) => l.type === 'added')
    if (origRemoved && reversedAdded) {
      expect(reversedAdded.oldLineNumber).toBe(origRemoved.newLineNumber)
      expect(reversedAdded.newLineNumber).toBe(origRemoved.oldLineNumber)
    }
  })

  it('generates correct header for reversed hunks', () => {
    const result = engine.diff('a\nb\nc', 'a\nX\nc')
    const reversed = engine.reverse(result)
    for (const hunk of reversed.hunks) {
      expect(hunk.header).toMatch(/^@@ -\d+,\d+ \+\d+,\d+ @@$/)
    }
  })

  it('preserves unchanged lines', () => {
    const result = engine.diff('a\nb\nc', 'a\nX\nc')
    const reversed = engine.reverse(result)
    const unchangedLines = reversed.hunks.flatMap((h) => h.lines).filter((l) => l.type === 'unchanged')
    expect(unchangedLines.length).toBeGreaterThan(0)
  })
})

// ─── DiffEngine – mergeDiffs ────────────────────────────────────────
describe('DiffEngine.mergeDiffs', () => {
  const engine = new DiffEngine()

  it('merges two diff results', () => {
    const diff1 = engine.diff('a', 'b')
    const diff2 = engine.diff('c', 'd')
    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.hunks.length).toBeGreaterThan(0)
  })

  it('uses oldContent from first diff', () => {
    const diff1 = engine.diff('first-old', 'x')
    const diff2 = engine.diff('y', 'second-new')
    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.oldContent).toBe('first-old')
  })

  it('uses newContent from second diff', () => {
    const diff1 = engine.diff('x', 'first-new')
    const diff2 = engine.diff('y', 'second-new')
    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.newContent).toBe('second-new')
  })

  it('prefers path from first diff', () => {
    const diff1 = engine.diff('a', 'b', 'first.ts')
    const diff2 = engine.diff('c', 'd', 'second.ts')
    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.path).toBe('first.ts')
  })

  it('falls back to path from second diff when first has none', () => {
    const diff1 = engine.diff('a', 'b')
    const diff2 = engine.diff('c', 'd', 'fallback.ts')
    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.path).toBe('fallback.ts')
  })

  it('computes merged stats from all lines', () => {
    const diff1 = engine.diff('a', 'b')
    const diff2 = engine.diff('c', 'd')
    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.stats.totalLines).toBeGreaterThan(0)
  })

  it('handles merging identical diffs', () => {
    const diff1 = engine.diff('a', 'b')
    const merged = engine.mergeDiffs(diff1, diff1)
    expect(merged.stats.totalLines).toBe(diff1.stats.totalLines * 2)
  })
})

// ─── DiffEngine – round-trip diff and applyPatch ────────────────────
describe('DiffEngine round-trip: diff → patch → apply', () => {
  it('applies generated patch to reproduce new content (simple)', () => {
    const engine = new DiffEngine()
    const oldContent = 'line1\nline2\nline3'
    const newContent = 'line1\nmodified\nline3'
    const diffResult = engine.diff(oldContent, newContent)
    const patch = engine.formatPatch(diffResult)
    const applyResult = engine.applyPatch(oldContent, patch)
    expect(applyResult.success).toBe(true)
    expect(applyResult.applied).toBe(true)
  })

  it('applies generated patch for additions only', () => {
    const engine = new DiffEngine()
    const oldContent = 'a\nb'
    const newContent = 'a\nb\nc\nd'
    const diffResult = engine.diff(oldContent, newContent)
    const patch = engine.formatPatch(diffResult)
    const applyResult = engine.applyPatch(oldContent, patch)
    expect(applyResult.success).toBe(true)
    expect(applyResult.applied).toBe(true)
  })

  it('applies generated patch for removals only', () => {
    const engine = new DiffEngine()
    const oldContent = 'a\nb\nc\nd'
    const newContent = 'a\nd'
    const diffResult = engine.diff(oldContent, newContent)
    const patch = engine.formatPatch(diffResult)
    const applyResult = engine.applyPatch(oldContent, patch)
    expect(applyResult.success).toBe(true)
    expect(applyResult.applied).toBe(true)
  })
})

// ─── DiffEngine – combined options ──────────────────────────────────
describe('DiffEngine with combined options', () => {
  it('combines ignoreWhitespace and ignoreCase', () => {
    const engine = new DiffEngine({ ignoreWhitespace: true, ignoreCase: true })
    const result = engine.diff('  HELLO WORLD  ', 'hello world')
    expect(result.hunks).toEqual([])
  })

  it('combines all options together', () => {
    const engine = new DiffEngine({
      ignoreWhitespace: true,
      ignoreCase: true,
      maxLineLength: 50,
      contextLines: 1,
    })
    const result = engine.diff('  Hello  ', 'hello')
    expect(result.hunks).toEqual([])
    expect(engine.getOptions().contextLines).toBe(1)
  })
})

// ─── Types ──────────────────────────────────────────────────────────
describe('Types', () => {
  it('DiffLine has all required fields', () => {
    const line: DiffLine = {
      type: 'added',
      content: 'test',
      oldLineNumber: 1,
      newLineNumber: 2,
    }
    expect(line.type).toBe('added')
    expect(line.content).toBe('test')
  })

  it('DiffLine optional fields can be omitted', () => {
    const line: DiffLine = { type: 'removed', content: 'test' }
    expect(line.oldLineNumber).toBeUndefined()
    expect(line.newLineNumber).toBeUndefined()
  })

  it('PatchOptions has correct shape', () => {
    const opts: PatchOptions = {
      contextLines: 3,
      ignoreWhitespace: false,
      ignoreCase: false,
      maxLineLength: 1000,
    }
    expect(opts.contextLines).toBe(3)
  })

  it('DiffResult contains all required fields', () => {
    const engine = new DiffEngine()
    const result: DiffResult = engine.diff('a', 'b', 'test.ts')
    expect(Array.isArray(result.hunks)).toBe(true)
    expect(typeof result.oldContent).toBe('string')
    expect(typeof result.newContent).toBe('string')
    expect(typeof result.stats.additions).toBe('number')
    expect(typeof result.stats.deletions).toBe('number')
    expect(typeof result.stats.changePercent).toBe('number')
    expect(result.path).toBe('test.ts')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────
describe('Edge cases', () => {
  it('handles content with only newlines', () => {
    const engine = new DiffEngine()
    const result = engine.diff('\n\n\n', '\n\n')
    expect(result.stats.totalLines).toBeGreaterThan(0)
  })

  it('handles very long single line', () => {
    const engine = new DiffEngine()
    const longLine = 'a'.repeat(500)
    const result = engine.diff(longLine, longLine)
    expect(result.hunks).toEqual([])
  })

  it('handles single character content', () => {
    const engine = new DiffEngine()
    const result = engine.diff('a', 'b')
    expect(result.stats.additions).toBe(1)
    expect(result.stats.deletions).toBe(1)
  })

  it('handles unicode content', () => {
    const engine = new DiffEngine()
    const result = engine.diff('hello 世界', 'hello 世界')
    expect(result.hunks).toEqual([])
  })

  it('handles content with special characters', () => {
    const engine = new DiffEngine()
    const result = engine.diff('$foo\nbar\tbaz', '$foo\nbar\tbaz')
    expect(result.hunks).toEqual([])
  })

  it('computes correct stats for large file', () => {
    const engine = new DiffEngine()
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`)
    const oldContent = lines.join('\n')
    const modified = [...lines]
    modified[49] = 'MODIFIED'
    const newContent = modified.join('\n')
    const result = engine.diff(oldContent, newContent)
    expect(result.stats.unchanged).toBe(99)
    expect(result.stats.additions).toBe(1)
    expect(result.stats.deletions).toBe(1)
  })

  it('reverse of reverse returns original stats', () => {
    const engine = new DiffEngine()
    const result = engine.diff('old\ncontent', 'new\ncontent')
    const reversed = engine.reverse(result)
    const doubleReversed = engine.reverse(reversed)
    expect(doubleReversed.stats.additions).toBe(result.stats.additions)
    expect(doubleReversed.stats.deletions).toBe(result.stats.deletions)
    expect(doubleReversed.oldContent).toBe(result.oldContent)
    expect(doubleReversed.newContent).toBe(result.newContent)
  })

  it('diffFiles with identical empty objects', () => {
    const engine = new DiffEngine()
    expect(engine.diffFiles({}, {})).toEqual([])
  })

  it('formatPatch with empty diff result produces headers only', () => {
    const engine = new DiffEngine()
    const result = engine.diff('same', 'same')
    const patch = engine.formatPatch(result)
    expect(patch).toBe('--- a/original\n+++ b/modified')
  })

  it('formatSideBySide with empty hunks produces empty string', () => {
    const engine = new DiffEngine()
    const result = engine.diff('same', 'same')
    const output = engine.formatSideBySide(result)
    expect(output).toBe('')
  })

  it('formatUnified with empty hunks produces empty string', () => {
    const engine = new DiffEngine()
    const result = engine.diff('same', 'same')
    const unified = engine.formatUnified(result)
    expect(unified).toBe('')
  })

  it('computeHunks with single changed line and contextLines=3', () => {
    const computer = new DiffComputer()
    const lines: DiffLine[] = Array.from({ length: 10 }, (_, i) => ({
      type: i === 5 ? ('removed' as const) : ('unchanged' as const),
      content: `line ${i}`,
      oldLineNumber: i + 1,
      newLineNumber: i + 1,
    }))
    const hunks = computer.computeHunks(lines, 3)
    expect(hunks).toHaveLength(1)
    // lines 2-9 (indices 2-8 = 3 context on each side + the removed line)
    expect(hunks[0]!.lines.length).toBeGreaterThanOrEqual(5)
  })

  it('applyPatch handles consecutive added lines', () => {
    const engine = new DiffEngine()
    const patch = '@@ -1,0 +1,3 @@\n+one\n+two\n+three'
    const result = engine.applyPatch('original\n', patch)
    expect(result.applied).toBe(true)
  })
})
