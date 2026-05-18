import { describe, it, expect } from 'vitest'
import type { TextChange } from '../../src/fix/types.js'

import {
  renderTextChangesAsDiff,
  formatDiffForConsole,
  type FileDiff,
} from '../../src/fix/diff-renderer.js'

// ─── renderTextChangesAsDiff ───

describe('renderTextChangesAsDiff', () => {
  it('returns empty hunks for empty changes array', () => {
    const result = renderTextChangesAsDiff([], 'test.ts')
    expect(result.filePath).toBe('test.ts')
    expect(result.hunks).toHaveLength(0)
  })

  it('renders a single text change', () => {
    const changes: TextChange[] = [
      { end: 10, newText: 'const x = 1', oldText: 'let x = 1', start: 0 },
    ]
    const result = renderTextChangesAsDiff(changes, 'test.ts')
    expect(result.hunks).toHaveLength(1)
    expect(result.hunks[0]!.header).toBe('@@ -0,+10 @@')
  })

  it('separates remove and add lines', () => {
    const changes: TextChange[] = [
      { end: 10, newText: 'new line', oldText: 'old line', start: 0 },
    ]
    const result = renderTextChangesAsDiff(changes, 'test.ts')
    const hunk = result.hunks[0]!
    expect(hunk.changes).toHaveLength(2)
    expect(hunk.changes[0]).toEqual({ content: 'old line', type: 'remove' })
    expect(hunk.changes[1]).toEqual({ content: 'new line', type: 'add' })
  })

  it('handles multi-line changes', () => {
    const changes: TextChange[] = [
      { end: 20, newText: 'line1\nline2', oldText: 'old1\nold2\nold3', start: 0 },
    ]
    const result = renderTextChangesAsDiff(changes, 'test.ts')
    const hunk = result.hunks[0]!
    expect(hunk.changes).toHaveLength(5)
    expect(hunk.changes.filter((c) => c.type === 'remove')).toHaveLength(3)
    expect(hunk.changes.filter((c) => c.type === 'add')).toHaveLength(2)
  })

  it('sorts changes by start position', () => {
    const changes: TextChange[] = [
      { end: 30, newText: 'c', oldText: 'C', start: 20 },
      { end: 10, newText: 'a', oldText: 'A', start: 0 },
      { end: 20, newText: 'b', oldText: 'B', start: 10 },
    ]
    const result = renderTextChangesAsDiff(changes, 'test.ts')
    expect(result.hunks[0]!.header).toContain('-0,+10')
    expect(result.hunks[1]!.header).toContain('-10,+20')
    expect(result.hunks[2]!.header).toContain('-20,+30')
  })

  it('preserves file path in result', () => {
    const changes: TextChange[] = [
      { end: 5, newText: 'x', oldText: 'y', start: 0 },
    ]
    const result = renderTextChangesAsDiff(changes, '/path/to/file.ts')
    expect(result.filePath).toBe('/path/to/file.ts')
  })
})

// ─── formatDiffForConsole ───

describe('formatDiffForConsole', () => {
  it('returns empty string for diff with no hunks', () => {
    const diff: FileDiff = { filePath: 'test.ts', hunks: [] }
    const result = formatDiffForConsole(diff)
    expect(result).toBe('')
  })

  it('includes file path in output', () => {
    const diff: FileDiff = {
      filePath: 'test.ts',
      hunks: [
        {
          changes: [{ content: 'hello', type: 'add' }],
          header: '@@ -0,+5 @@',
        },
      ],
    }
    const result = formatDiffForConsole(diff)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('test.ts')
  })

  it('formats add lines with + prefix', () => {
    const diff: FileDiff = {
      filePath: 'test.ts',
      hunks: [
        {
          changes: [{ content: 'new code', type: 'add' }],
          header: '@@ -0,+5 @@',
        },
      ],
    }
    const result = formatDiffForConsole(diff)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('+ new code')
  })

  it('formats remove lines with - prefix', () => {
    const diff: FileDiff = {
      filePath: 'test.ts',
      hunks: [
        {
          changes: [{ content: 'old code', type: 'remove' }],
          header: '@@ -0,+5 @@',
        },
      ],
    }
    const result = formatDiffForConsole(diff)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('- old code')
  })

  it('formats context lines with space prefix', () => {
    const diff: FileDiff = {
      filePath: 'test.ts',
      hunks: [
        {
          changes: [{ content: 'unchanged', type: 'context' }],
          header: '@@ -0,+5 @@',
        },
      ],
    }
    const result = formatDiffForConsole(diff)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('  unchanged')
  })

  it('handles multiple hunks', () => {
    const diff: FileDiff = {
      filePath: 'test.ts',
      hunks: [
        {
          changes: [{ content: 'a', type: 'add' }],
          header: '@@ -1,+2 @@',
        },
        {
          changes: [{ content: 'b', type: 'remove' }],
          header: '@@ -10,+12 @@',
        },
      ],
    }
    const result = formatDiffForConsole(diff)
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('@@ -1,+2 @@')
    expect(stripped).toContain('@@ -10,+12 @@')
  })
})
