import { describe, it, expect } from 'vitest'
import { renderTextChangesAsDiff, formatDiffForConsole } from '../src/fix/diff-renderer.js'

// ─── renderTextChangesAsDiff ──────────────────────────
describe('renderTextChangesAsDiff', () => {
  it('returns empty hunks for no changes', () => {
    const result = renderTextChangesAsDiff([], 'file.ts')
    expect(result.filePath).toBe('file.ts')
    expect(result.hunks).toEqual([])
  })

  it('creates a hunk for a single change', () => {
    const changes = [{ start: 1, end: 2, newText: 'const x = 1;', oldText: 'var x = 1;' }]
    const result = renderTextChangesAsDiff(changes, 'test.ts')
    expect(result.hunks).toHaveLength(1)
    expect(result.hunks[0]!.header).toBe('@@ -1,+2 @@')
  })

  it('includes remove lines for old text', () => {
    const changes = [{ start: 0, end: 1, newText: 'b', oldText: 'a' }]
    const result = renderTextChangesAsDiff(changes, 'f.ts')
    const removeLines = result.hunks[0]!.changes.filter((c) => c.type === 'remove')
    expect(removeLines).toHaveLength(1)
    expect(removeLines[0]!.content).toBe('a')
  })

  it('includes add lines for new text', () => {
    const changes = [{ start: 0, end: 1, newText: 'b', oldText: 'a' }]
    const result = renderTextChangesAsDiff(changes, 'f.ts')
    const addLines = result.hunks[0]!.changes.filter((c) => c.type === 'add')
    expect(addLines).toHaveLength(1)
    expect(addLines[0]!.content).toBe('b')
  })

  it('handles multiline changes', () => {
    const changes = [{ start: 0, end: 3, newText: 'x\ny', oldText: 'a\nb\nc' }]
    const result = renderTextChangesAsDiff(changes, 'f.ts')
    const removes = result.hunks[0]!.changes.filter((c) => c.type === 'remove')
    const adds = result.hunks[0]!.changes.filter((c) => c.type === 'add')
    expect(removes).toHaveLength(3)
    expect(adds).toHaveLength(2)
  })

  it('creates multiple hunks for multiple changes', () => {
    const changes = [
      { start: 0, end: 1, newText: 'x', oldText: 'a' },
      { start: 5, end: 6, newText: 'y', oldText: 'b' },
    ]
    const result = renderTextChangesAsDiff(changes, 'f.ts')
    expect(result.hunks).toHaveLength(2)
  })

  it('sorts changes by start position', () => {
    const changes = [
      { start: 10, end: 11, newText: 'y', oldText: 'b' },
      { start: 0, end: 1, newText: 'x', oldText: 'a' },
    ]
    const result = renderTextChangesAsDiff(changes, 'f.ts')
    expect(result.hunks[0]!.header).toContain('-0')
    expect(result.hunks[1]!.header).toContain('-10')
  })
})

// ─── formatDiffForConsole ─────────────────────────────
describe('formatDiffForConsole', () => {
  it('returns empty string for no hunks', () => {
    expect(formatDiffForConsole({ filePath: 'f.ts', hunks: [] })).toBe('')
  })

  it('includes file path in output', () => {
    const diff = {
      filePath: 'test.ts',
      hunks: [{ changes: [{ content: 'a', type: 'remove' as const }, { content: 'b', type: 'add' as const }], header: '@@ -0,+1 @@' }],
    }
    const output = formatDiffForConsole(diff)
    expect(output).toContain('test.ts')
  })

  it('includes hunk header', () => {
    const diff = {
      filePath: 'f.ts',
      hunks: [{ changes: [{ content: 'a', type: 'remove' as const }], header: '@@ -1,+2 @@' }],
    }
    const output = formatDiffForConsole(diff)
    expect(output).toContain('@@ -1,+2 @@')
  })

  it('prefixes remove lines with -', () => {
    const diff = {
      filePath: 'f.ts',
      hunks: [{ changes: [{ content: 'old', type: 'remove' as const }], header: '@@ @@' }],
    }
    const output = formatDiffForConsole(diff)
    expect(output).toContain('- old')
  })

  it('prefixes add lines with +', () => {
    const diff = {
      filePath: 'f.ts',
      hunks: [{ changes: [{ content: 'new', type: 'add' as const }], header: '@@ @@' }],
    }
    const output = formatDiffForConsole(diff)
    expect(output).toContain('+ new')
  })

  it('prefixes context lines with spaces', () => {
    const diff = {
      filePath: 'f.ts',
      hunks: [{ changes: [{ content: 'ctx', type: 'context' as const }], header: '@@ @@' }],
    }
    const output = formatDiffForConsole(diff)
    expect(output).toContain('  ctx')
  })
})
