import { describe, expect, it } from 'vitest'

import type { TextChange } from '../../../src/fix/types.js'

import {
  formatDiffForConsole,
  renderTextChangesAsDiff,
  type DiffLine,
  type FileDiff,
  type DiffHunk,
} from '../../../src/fix/diff-renderer.js'

describe('diff-renderer', () => {
  describe('renderTextChangesAsDiff', () => {
    it('should return empty hunks for no changes', () => {
      const diff = renderTextChangesAsDiff([], '/test/file.ts')
      expect(diff.filePath).toBe('/test/file.ts')
      expect(diff.hunks).toHaveLength(0)
    })

    it('should create a hunk for a single change', () => {
      const changes: TextChange[] = [
        { end: 20, newText: 'const x = 2;', oldText: 'var x = 2;', start: 0 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')

      expect(diff.hunks).toHaveLength(1)
      expect(diff.hunks[0]!.changes.length).toBeGreaterThan(0)
    })

    it('should show old text as remove lines', () => {
      const changes: TextChange[] = [
        { end: 10, newText: 'let y = 1;', oldText: 'var y = 1;', start: 0 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      expect(removeLines.length).toBeGreaterThanOrEqual(1)
      expect(removeLines.some((l) => l.content.includes('var y = 1;'))).toBe(true)
    })

    it('should show new text as add lines', () => {
      const changes: TextChange[] = [
        { end: 10, newText: 'let y = 1;', oldText: 'var y = 1;', start: 0 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(addLines.length).toBeGreaterThanOrEqual(1)
      expect(addLines.some((l) => l.content.includes('let y = 1;'))).toBe(true)
    })

    it('should create separate hunks for multiple changes', () => {
      const changes: TextChange[] = [
        { end: 10, newText: 'a', oldText: 'b', start: 0 },
        { end: 30, newText: 'c', oldText: 'd', start: 20 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks).toHaveLength(2)
    })

    it('should sort changes by start position', () => {
      const changes: TextChange[] = [
        { end: 30, newText: 'second', oldText: 'old2', start: 20 },
        { end: 10, newText: 'first', oldText: 'old1', start: 0 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks[0]!.header).toContain('-0,')
    })

    it('should handle multiline changes', () => {
      const changes: TextChange[] = [
        {
          end: 40,
          newText: 'const a = 1;\nconst b = 2;',
          oldText: 'var a = 1;\nvar b = 2;',
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(2)
      expect(addLines).toHaveLength(2)
    })

    it('should preserve correct filePath in result', () => {
      const changes: TextChange[] = [{ end: 10, newText: 'a', oldText: 'b', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/some/deep/path/module.ts')
      expect(diff.filePath).toBe('/some/deep/path/module.ts')
    })

    it('should handle change with empty oldText (pure insertion)', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'inserted', oldText: '', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(1)
      expect(removeLines[0]!.content).toBe('')
      expect(addLines).toHaveLength(1)
      expect(addLines[0]!.content).toBe('inserted')
    })

    it('should handle change with empty newText (pure deletion)', () => {
      const changes: TextChange[] = [{ end: 5, newText: '', oldText: 'removed', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(1)
      expect(removeLines[0]!.content).toBe('removed')
      expect(addLines).toHaveLength(1)
      expect(addLines[0]!.content).toBe('')
    })

    it('should create correct header format with start and end positions', () => {
      const changes: TextChange[] = [{ end: 42, newText: 'new', oldText: 'old', start: 15 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks[0]!.header).toBe('@@ -15,+42 @@')
    })

    it('should handle change where oldText and newText are identical', () => {
      const changes: TextChange[] = [{ end: 10, newText: 'same', oldText: 'same', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(1)
      expect(addLines).toHaveLength(1)
      expect(removeLines[0]!.content).toBe('same')
      expect(addLines[0]!.content).toBe('same')
    })

    it('should handle many changes creating correct number of hunks', () => {
      const changes: TextChange[] = [
        { end: 10, newText: 'a', oldText: 'b', start: 0 },
        { end: 20, newText: 'c', oldText: 'd', start: 15 },
        { end: 30, newText: 'e', oldText: 'f', start: 25 },
        { end: 40, newText: 'g', oldText: 'h', start: 35 },
        { end: 50, newText: 'i', oldText: 'j', start: 45 },
        { end: 60, newText: 'k', oldText: 'l', start: 55 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks).toHaveLength(6)
    })

    it('should produce exactly 2 diff lines for single-line old and new text', () => {
      const changes: TextChange[] = [{ end: 10, newText: 'new', oldText: 'old', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      expect(hunk.changes).toHaveLength(2)
      expect(hunk.changes[0]!.type).toBe('remove')
      expect(hunk.changes[1]!.type).toBe('add')
    })

    it('should produce 3 remove lines for multiline oldText with 3 lines', () => {
      const changes: TextChange[] = [
        {
          end: 30,
          newText: 'new',
          oldText: 'line1\nline2\nline3',
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(3)
      expect(removeLines[0]!.content).toBe('line1')
      expect(removeLines[1]!.content).toBe('line2')
      expect(removeLines[2]!.content).toBe('line3')
    })

    it('should sort hunks by start position even when input is in reverse order', () => {
      const changes: TextChange[] = [
        { end: 50, newText: 'third', oldText: 'old3', start: 40 },
        { end: 30, newText: 'second', oldText: 'old2', start: 20 },
        { end: 10, newText: 'first', oldText: 'old1', start: 0 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')

      expect(diff.hunks[0]!.header).toContain('-0,')
      expect(diff.hunks[1]!.header).toContain('-20,')
      expect(diff.hunks[2]!.header).toContain('-40,')
    })

    it('should handle zero start and end positions', () => {
      const changes: TextChange[] = [{ end: 0, newText: 'x', oldText: 'y', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks[0]!.header).toBe('@@ -0,+0 @@')
    })

    it('should handle change with both oldText and newText containing newlines', () => {
      const changes: TextChange[] = [
        {
          end: 60,
          newText: 'const a = 1;\nconst b = 2;\nconst c = 3;',
          oldText: 'var a = 1;\nvar b = 2;\nvar c = 3;',
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(3)
      expect(addLines).toHaveLength(3)
      expect(removeLines[2]!.content).toBe('var c = 3;')
      expect(addLines[2]!.content).toBe('const c = 3;')
    })

    it('should place all remove lines before all add lines in a hunk', () => {
      const changes: TextChange[] = [
        {
          end: 20,
          newText: 'new1\nnew2',
          oldText: 'old1\nold2',
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const types = hunk.changes.map((c) => c.type)
      const lastRemoveIndex = types.lastIndexOf('remove')
      const firstAddIndex = types.indexOf('add')
      expect(lastRemoveIndex).toBeLessThan(firstAddIndex)
    })

    it('should handle whitespace-only changes', () => {
      const changes: TextChange[] = [{ end: 10, newText: '  ', oldText: '\t', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      expect(hunk.changes).toHaveLength(2)
      expect(hunk.changes[0]!.content).toBe('\t')
      expect(hunk.changes[1]!.content).toBe('  ')
    })

    it('should handle change with trailing newline in oldText', () => {
      const changes: TextChange[] = [{ end: 10, newText: 'new', oldText: 'old\n', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(2)
      expect(removeLines[0]!.content).toBe('old')
      expect(removeLines[1]!.content).toBe('')
    })

    it('should handle change with trailing newline in newText', () => {
      const changes: TextChange[] = [{ end: 10, newText: 'new\n', oldText: 'old', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(addLines).toHaveLength(2)
      expect(addLines[0]!.content).toBe('new')
      expect(addLines[1]!.content).toBe('')
    })

    it('should handle change with only trailing newlines in both texts', () => {
      const changes: TextChange[] = [{ end: 10, newText: '\n\n', oldText: '\n', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(2)
      expect(addLines).toHaveLength(3)
    })

    it('should handle unicode content in old and new text', () => {
      const changes: TextChange[] = [{ end: 10, newText: 'café 🍕', oldText: 'naïve', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      expect(hunk.changes[0]!.content).toBe('naïve')
      expect(hunk.changes[1]!.content).toBe('café 🍕')
    })

    it('should handle content with special regex characters', () => {
      const changes: TextChange[] = [
        { end: 10, newText: '$1.00 [test]', oldText: '.*+?^${}()|[]\\', start: 0 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      expect(hunk.changes[0]!.content).toBe('.*+?^${}()|[]\\')
      expect(hunk.changes[1]!.content).toBe('$1.00 [test]')
    })

    it('should handle filePath with special characters', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'a', oldText: 'b', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/path/with spaces/file name.ts')
      expect(diff.filePath).toBe('/path/with spaces/file name.ts')
    })

    it('should handle filePath with query-like string', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'a', oldText: 'b', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, 'file?query=1&hash=#tag')
      expect(diff.filePath).toBe('file?query=1&hash=#tag')
    })

    it('should not mutate the input changes array', () => {
      const changes: TextChange[] = [
        { end: 30, newText: 'second', oldText: 'old2', start: 20 },
        { end: 10, newText: 'first', oldText: 'old1', start: 0 },
      ]
      const originalOrder = changes.map((c) => c.start)
      renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(changes.map((c) => c.start)).toEqual(originalOrder)
    })

    it('should produce 5 add lines for multiline newText with 5 lines', () => {
      const changes: TextChange[] = [
        {
          end: 10,
          newText: 'a\nb\nc\nd\ne',
          oldText: 'old',
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(addLines).toHaveLength(5)
      expect(addLines[0]!.content).toBe('a')
      expect(addLines[4]!.content).toBe('e')
    })

    it('should handle single character old and new text', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'b', oldText: 'a', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      expect(hunk.changes).toHaveLength(2)
      expect(hunk.changes[0]!.content).toBe('a')
      expect(hunk.changes[1]!.content).toBe('b')
    })

    it('should handle a large multiline diff with 10+ lines each', () => {
      const oldLines = Array.from({ length: 12 }, (_, i) => `old line ${i + 1}`)
      const newLines = Array.from({ length: 15 }, (_, i) => `new line ${i + 1}`)
      const changes: TextChange[] = [
        {
          end: 100,
          newText: newLines.join('\n'),
          oldText: oldLines.join('\n'),
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(12)
      expect(addLines).toHaveLength(15)
      expect(removeLines[11]!.content).toBe('old line 12')
      expect(addLines[14]!.content).toBe('new line 15')
    })

    it('should handle both oldText and newText as empty strings', () => {
      const changes: TextChange[] = [{ end: 5, newText: '', oldText: '', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      expect(hunk.changes).toHaveLength(2)
      expect(hunk.changes[0]!.type).toBe('remove')
      expect(hunk.changes[0]!.content).toBe('')
      expect(hunk.changes[1]!.type).toBe('add')
      expect(hunk.changes[1]!.content).toBe('')
    })

    it('should produce correct header for large start and end positions', () => {
      const changes: TextChange[] = [{ end: 9999, newText: 'x', oldText: 'y', start: 5000 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks[0]!.header).toBe('@@ -5000,+9999 @@')
    })

    it('should handle change with tab characters in content', () => {
      const changes: TextChange[] = [
        { end: 10, newText: '\tindented', oldText: '\t\tdouble', start: 0 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      expect(hunk.changes[0]!.content).toBe('\t\tdouble')
      expect(hunk.changes[1]!.content).toBe('\tindented')
    })

    it('should handle change preserving empty lines in multiline content', () => {
      const changes: TextChange[] = [
        {
          end: 20,
          newText: 'line1\n\nline3',
          oldText: 'line1\n\nline3',
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      expect(removeLines[1]!.content).toBe('')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(addLines[1]!.content).toBe('')
    })

    it('should return hunks array that is not shared across calls', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'a', oldText: 'b', start: 0 }]
      const diff1 = renderTextChangesAsDiff(changes, '/test/file1.ts')
      const diff2 = renderTextChangesAsDiff(changes, '/test/file2.ts')
      expect(diff1.hunks).not.toBe(diff2.hunks)
    })

    it('should handle changes at the same start position preserving relative order', () => {
      const changes: TextChange[] = [
        { end: 20, newText: 'alpha', oldText: 'old-a', start: 10 },
        { end: 25, newText: 'beta', oldText: 'old-b', start: 10 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks).toHaveLength(2)
      expect(diff.hunks[0]!.header).toBe('@@ -10,+20 @@')
      expect(diff.hunks[1]!.header).toBe('@@ -10,+25 @@')
    })

    it('should handle change with only leading newlines in oldText', () => {
      const changes: TextChange[] = [{ end: 10, newText: 'new', oldText: '\n\n\nold', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(4)
      expect(removeLines[0]!.content).toBe('')
      expect(removeLines[1]!.content).toBe('')
      expect(removeLines[2]!.content).toBe('')
      expect(removeLines[3]!.content).toBe('old')
    })

    it('should handle empty string filePath', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'a', oldText: 'b', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, '')
      expect(diff.filePath).toBe('')
      expect(diff.hunks).toHaveLength(1)
    })

    it('should handle change where end equals start (zero-length range)', () => {
      const changes: TextChange[] = [
        { end: 10, newText: 'inserted', oldText: 'removed', start: 10 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff.hunks[0]!.header).toBe('@@ -10,+10 @@')
    })

    it('should produce a new array for hunks each invocation', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'a', oldText: 'b', start: 0 }]
      const diff1 = renderTextChangesAsDiff(changes, '/test/file.ts')
      const diff2 = renderTextChangesAsDiff(changes, '/test/file.ts')
      expect(diff1.hunks).not.toBe(diff2.hunks)
      expect(diff1.hunks[0]!.changes).not.toBe(diff2.hunks[0]!.changes)
    })

    it('should handle filePath with only a filename and no directory', () => {
      const changes: TextChange[] = [{ end: 5, newText: 'a', oldText: 'b', start: 0 }]
      const diff = renderTextChangesAsDiff(changes, 'file.ts')
      expect(diff.filePath).toBe('file.ts')
      expect(diff.hunks).toHaveLength(1)
    })

    it('should handle change where newText has many more lines than oldText', () => {
      const changes: TextChange[] = [
        {
          end: 10,
          newText: 'a\nb\nc\nd\ne\nf\ng\nh',
          oldText: 'old',
          start: 0,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(1)
      expect(addLines).toHaveLength(8)
    })

    it('should handle change where oldText has many more lines than newText', () => {
      const changes: TextChange[] = [
        {
          end: 50,
          newText: 'new',
          oldText: 'a\nb\nc\nd\ne\nf',
          start: 10,
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
      const hunk = diff.hunks[0]!

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(6)
      expect(addLines).toHaveLength(1)
    })
  })

  describe('formatDiffForConsole', () => {
    it('should return empty string for no hunks', () => {
      const diff: FileDiff = { filePath: '/test/file.ts', hunks: [] }
      expect(formatDiffForConsole(diff)).toBe('')
    })

    it('should include file path in output', () => {
      const diff: FileDiff = {
        filePath: '/src/index.ts',
        hunks: [
          {
            changes: [
              { content: 'var x = 1;', type: 'remove' },
              { content: 'const x = 1;', type: 'add' },
            ],
            header: '@@ -0,+10 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('/src/index.ts')
    })

    it('should include hunk header', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [
              { content: 'old', type: 'remove' },
              { content: 'new', type: 'add' },
            ],
            header: '@@ -5,+10 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('@@ -5,+10 @@')
    })

    it('should prefix remove lines with -', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'var x = 1;', type: 'remove' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- var x = 1;')
    })

    it('should prefix add lines with +', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'const x = 1;', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+ const x = 1;')
    })

    it('should prefix context lines with spaces', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'other line', type: 'context' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  other line')
    })

    it('should format multiple hunks', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'a', type: 'remove' }],
            header: '@@ -1 @@',
          },
          {
            changes: [{ content: 'b', type: 'add' }],
            header: '@@ -2 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('@@ -1 @@')
      expect(output).toContain('@@ -2 @@')
    })

    it('should start output with a blank line', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output.split('\n')
      expect(lines[0]).toBe('')
    })

    it('should contain --- and +++ markers for file path', () => {
      const diff: FileDiff = {
        filePath: '/src/app.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- /src/app.ts')
      expect(output).toContain('+++ /src/app.ts')
    })

    it('should contain (fix preview) text in header', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('(fix preview)')
    })

    it('should format single hunk with mixed change types correctly', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [
              { content: 'context line', type: 'context' },
              { content: 'old line', type: 'remove' },
              { content: 'new line', type: 'add' },
            ],
            header: '@@ -0,+5 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  context line')
      expect(output).toContain('- old line')
      expect(output).toContain('+ new line')
    })

    it('should handle diff with only remove lines (deletion only)', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [
              { content: 'deleted line 1', type: 'remove' },
              { content: 'deleted line 2', type: 'remove' },
            ],
            header: '@@ -0,+5 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- deleted line 1')
      expect(output).toContain('- deleted line 2')
      expect(output).not.toContain('+ deleted')
    })

    it('should handle diff with only add lines (insertion only)', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [
              { content: 'added line 1', type: 'add' },
              { content: 'added line 2', type: 'add' },
            ],
            header: '@@ -0,+5 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+ added line 1')
      expect(output).toContain('+ added line 2')
      expect(output).not.toContain('- added')
    })

    it('should join output with newlines without trailing newline', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output.endsWith('\n')).toBe(false)
      expect(output).toContain('\n')
    })

    it('should use two-space prefix for context lines (not tab)', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'ctx', type: 'context' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  ctx')
      expect(output).not.toContain('\tctx')
    })

    it('should place --- marker before +++ marker', () => {
      const diff: FileDiff = {
        filePath: '/test/order.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const dashIndex = output.indexOf('--- /test/order.ts')
      const plusIndex = output.indexOf('+++ /test/order.ts')
      expect(dashIndex).toBeGreaterThan(-1)
      expect(plusIndex).toBeGreaterThan(-1)
      expect(dashIndex).toBeLessThan(plusIndex)
    })

    it('should place file headers before hunk content', () => {
      const diff: FileDiff = {
        filePath: '/test/order.ts',
        hunks: [
          {
            changes: [{ content: 'changed', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const headerIndex = output.indexOf('@@ -0,+1 @@')
      const contentIndex = output.indexOf('+ changed')
      expect(headerIndex).toBeGreaterThan(-1)
      expect(contentIndex).toBeGreaterThan(headerIndex)
    })

    it('should handle hunk with empty content string for add line', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: '', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+ ')
    })

    it('should handle hunk with empty content string for remove line', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: '', type: 'remove' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- ')
    })

    it('should handle hunk with empty content string for context line', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: '', type: 'context' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output.split('\n')
      expect(lines.some((l) => l === '  ')).toBe(true)
    })

    it('should handle content with unicode characters', () => {
      const diff: FileDiff = {
        filePath: '/test/unicode.ts',
        hunks: [
          {
            changes: [{ content: 'café résumé 🚀', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('café résumé 🚀')
    })

    it('should handle content with special regex characters', () => {
      const diff: FileDiff = {
        filePath: '/test/regex.ts',
        hunks: [
          {
            changes: [{ content: '.*+?^${}()|[]\\', type: 'remove' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('.*+?^${}()|[]\\')
    })

    it('should format hunk header using dim styling', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -10,+20 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('@@ -10,+20 @@')
    })

    it('should handle hunk with many change lines in correct order', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [
              { content: 'ctx1', type: 'context' },
              { content: 'old1', type: 'remove' },
              { content: 'old2', type: 'remove' },
              { content: 'new1', type: 'add' },
              { content: 'new2', type: 'add' },
              { content: 'ctx2', type: 'context' },
            ],
            header: '@@ -0,+10 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output.split('\n')
      const ctx1Idx = lines.findIndex((l) => l.includes('ctx1'))
      const old1Idx = lines.findIndex((l) => l.includes('old1'))
      const new1Idx = lines.findIndex((l) => l.includes('new1'))
      const ctx2Idx = lines.findIndex((l) => l.includes('ctx2'))
      expect(ctx1Idx).toBeLessThan(old1Idx)
      expect(old1Idx).toBeLessThan(new1Idx)
      expect(new1Idx).toBeLessThan(ctx2Idx)
    })

    it('should handle hunk with no changes array (empty changes)', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('@@ -0,+1 @@')
    })

    it('should include (fix preview) only after the +++ line', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const plusPlusIndex = output.indexOf('+++')
      const previewIndex = output.indexOf('(fix preview)')
      expect(plusPlusIndex).toBeGreaterThan(-1)
      expect(previewIndex).toBeGreaterThan(plusPlusIndex)
    })

    it('should separate hunks with newlines', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'a', type: 'add' }],
            header: '@@ -1 @@',
          },
          {
            changes: [{ content: 'b', type: 'remove' }],
            header: '@@ -2 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('@@ -1 @@')
      expect(output).toContain('@@ -2 @@')
      expect(output).toContain('+ a')
      expect(output).toContain('- b')
    })

    it('should handle long content lines without truncation', () => {
      const longContent = 'x'.repeat(500)
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: longContent, type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain(`+ ${longContent}`)
    })

    it('should handle multiple hunks each with their own header', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'change1', type: 'add' }],
            header: '@@ -1,+2 @@',
          },
          {
            changes: [{ content: 'change2', type: 'remove' }],
            header: '@@ -10,+11 @@',
          },
          {
            changes: [{ content: 'change3', type: 'context' }],
            header: '@@ -50,+51 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('@@ -1,+2 @@')
      expect(output).toContain('@@ -10,+11 @@')
      expect(output).toContain('@@ -50,+51 @@')
      expect(output).toContain('+ change1')
      expect(output).toContain('- change2')
      expect(output).toContain('  change3')
    })

    it('should format filePath containing spaces', () => {
      const diff: FileDiff = {
        filePath: '/path/with spaces/my file.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- /path/with spaces/my file.ts')
      expect(output).toContain('+++ /path/with spaces/my file.ts')
    })

    it('should not produce trailing newline at end of output', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [
              { content: 'a', type: 'remove' },
              { content: 'b', type: 'add' },
            ],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output[output.length - 1]).not.toBe('\n')
    })

    it('should handle filePath containing unicode characters', () => {
      const diff: FileDiff = {
        filePath: '/日本語/файл.ts',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- /日本語/файл.ts')
      expect(output).toContain('+++ /日本語/файл.ts')
    })

    it('should handle empty string filePath', () => {
      const diff: FileDiff = {
        filePath: '',
        hunks: [
          {
            changes: [{ content: 'x', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- ')
      expect(output).toContain('+++ ')
    })

    it('should produce output with file headers before any hunk content', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [{ content: 'change', type: 'add' }],
            header: '@@ -0,+1 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output.split('\n')
      expect(lines[0]).toBe('')
      expect(lines[1]).toContain('--- ')
      expect(lines[2]).toContain('+++ ')
      expect(lines[3]).toContain('@@')
    })

    it('should handle hunk with only context lines producing no add or remove lines', () => {
      const diff: FileDiff = {
        filePath: '/test/file.ts',
        hunks: [
          {
            changes: [
              { content: 'ctx1', type: 'context' },
              { content: 'ctx2', type: 'context' },
            ],
            header: '@@ -0,+5 @@',
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  ctx1')
      expect(output).toContain('  ctx2')
      const changeLines = output
        .split('\n')
        .filter(
          (l) =>
            !l.startsWith('---') && !l.startsWith('+++') && !l.startsWith('@@') && l.trim() !== '',
        )
      const hasNoAddRemove = changeLines.every((l) => l.startsWith('  '))
      expect(hasNoAddRemove).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DiffLine type with correct shape', () => {
      const line: DiffLine = { content: 'test', type: 'add' }
      expect(line.content).toBe('test')
      expect(line.type).toBe('add')
    })

    it('should export DiffLine type supporting all line types', () => {
      const addLine: DiffLine = { content: 'a', type: 'add' }
      const removeLine: DiffLine = { content: 'r', type: 'remove' }
      const contextLine: DiffLine = { content: 'c', type: 'context' }

      expect(addLine.type).toBe('add')
      expect(removeLine.type).toBe('remove')
      expect(contextLine.type).toBe('context')
    })

    it('should export FileDiff type with correct shape', () => {
      const fileDiff: FileDiff = { filePath: '/test.ts', hunks: [] }
      expect(fileDiff.filePath).toBe('/test.ts')
      expect(fileDiff.hunks).toEqual([])
    })

    it('should export DiffHunk type with correct shape', () => {
      const hunk: DiffHunk = {
        changes: [{ content: 'x', type: 'add' }],
        header: '@@ -0,+1 @@',
      }
      expect(hunk.header).toBe('@@ -0,+1 @@')
      expect(hunk.changes).toHaveLength(1)
    })
  })

  describe('integration: renderTextChangesAsDiff -> formatDiffForConsole', () => {
    it('should produce formatted console output from rendered diff', () => {
      const changes: TextChange[] = [
        { end: 10, newText: 'const x = 1;', oldText: 'var x = 1;', start: 5 },
      ]
      const diff = renderTextChangesAsDiff(changes, '/src/app.ts')
      const output = formatDiffForConsole(diff)

      expect(output).toContain('--- /src/app.ts')
      expect(output).toContain('+++ /src/app.ts')
      expect(output).toContain('@@ -5,+10 @@')
      expect(output).toContain('- var x = 1;')
      expect(output).toContain('+ const x = 1;')
    })

    it('should produce empty string for empty changes through both functions', () => {
      const diff = renderTextChangesAsDiff([], '/test/file.ts')
      const output = formatDiffForConsole(diff)
      expect(output).toBe('')
    })
  })

  describe('additional edge cases', () => {
    it('should handle change where oldText equals newText', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'hello', newText: 'hello' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks).toHaveLength(1)
      expect(diff.hunks[0].changes.filter((c) => c.type === 'remove')).toHaveLength(1)
      expect(diff.hunks[0].changes.filter((c) => c.type === 'add')).toHaveLength(1)
    })

    it('should handle change with only newlines in oldText', () => {
      const changes: TextChange[] = [{ start: 0, end: 2, oldText: '\n\n', newText: 'x' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      // '\n\n'.split('\n') = ['', '', ''] — 3 remove lines
      expect(diff.hunks[0].changes.filter((c) => c.type === 'remove')).toHaveLength(3)
    })

    it('should handle change with only newlines in newText', () => {
      const changes: TextChange[] = [{ start: 0, end: 1, oldText: 'x', newText: '\n\n' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].changes.filter((c) => c.type === 'add')).toHaveLength(3)
    })

    it('should sort changes by start position', () => {
      const changes: TextChange[] = [
        { start: 20, end: 25, oldText: 'second', newText: '2nd' },
        { start: 0, end: 5, oldText: 'first', newText: '1st' },
        { start: 40, end: 45, oldText: 'third', newText: '3rd' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toContain('-0')
      expect(diff.hunks[1].header).toContain('-20')
      expect(diff.hunks[2].header).toContain('-40')
    })

    it('should preserve filePath with spaces', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 1, oldText: 'a', newText: 'b' }],
        '/path with spaces/file.ts',
      )
      expect(diff.filePath).toBe('/path with spaces/file.ts')
    })

    it('should preserve filePath with unicode characters', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 1, oldText: 'a', newText: 'b' }],
        '/src/日本語/ファイル.ts',
      )
      expect(diff.filePath).toBe('/src/日本語/ファイル.ts')
    })

    it('should handle empty oldText with non-empty newText', () => {
      const changes: TextChange[] = [{ start: 0, end: 0, oldText: '', newText: 'inserted' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      // ''.split('\n') = [''] — 1 remove line
      expect(diff.hunks[0].changes.filter((c) => c.type === 'remove')).toHaveLength(1)
      expect(diff.hunks[0].changes.filter((c) => c.type === 'add')).toHaveLength(1)
    })

    it('should handle empty newText with non-empty oldText', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'removed', newText: '' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].changes.filter((c) => c.type === 'remove')).toHaveLength(1)
      expect(diff.hunks[0].changes.filter((c) => c.type === 'add')).toHaveLength(1)
    })

    it('should format context line type with dim prefix', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'context line', type: 'context' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  context line')
    })

    it('should include fix preview text in formatted output', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'old', newText: 'new' }],
        '/src/app.ts',
      )
      const output = formatDiffForConsole(diff)
      expect(output).toContain('(fix preview)')
    })
  })

  describe('sorting stability', () => {
    it('should maintain relative order for changes with same start position', () => {
      const changes: TextChange[] = [
        { start: 5, end: 10, oldText: 'alpha', newText: 'a' },
        { start: 5, end: 12, oldText: 'bravo', newText: 'b' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks).toHaveLength(2)
      expect(diff.hunks[0].changes[0].content).toBe('alpha')
      expect(diff.hunks[1].changes[0].content).toBe('bravo')
    })
  })

  describe('multiline diff content', () => {
    it('should produce separate diff lines for each line in multiline oldText', () => {
      const changes: TextChange[] = [
        { start: 0, end: 3, oldText: 'line1\nline2\nline3', newText: 'new' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(3)
      expect(removeLines[0].content).toBe('line1')
      expect(removeLines[1].content).toBe('line2')
      expect(removeLines[2].content).toBe('line3')
    })

    it('should produce separate diff lines for each line in multiline newText', () => {
      const changes: TextChange[] = [{ start: 0, end: 1, oldText: 'old', newText: 'new1\nnew2' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const addLines = diff.hunks[0].changes.filter((c) => c.type === 'add')
      expect(addLines).toHaveLength(2)
      expect(addLines[0].content).toBe('new1')
      expect(addLines[1].content).toBe('new2')
    })
  })

  describe('hunk header format', () => {
    it('should include start and end positions in hunk header', () => {
      const changes: TextChange[] = [{ start: 10, end: 20, oldText: 'old', newText: 'new' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ -10,+20 @@')
    })

    it('should handle start=0 end=0 for insertion at beginning', () => {
      const changes: TextChange[] = [{ start: 0, end: 0, oldText: '', newText: 'inserted' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ -0,+0 @@')
    })
  })

  describe('formatDiffForConsole output structure', () => {
    it('should start with empty line', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'old', newText: 'new' }],
        '/test.ts',
      )
      const output = formatDiffForConsole(diff)
      expect(output.startsWith('\n')).toBe(true)
    })

    it('should contain --- filePath header', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'old', newText: 'new' }],
        '/my/file.ts',
      )
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- /my/file.ts')
    })

    it('should contain +++ filePath (fix preview) header', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'old', newText: 'new' }],
        '/my/file.ts',
      )
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+++ /my/file.ts (fix preview)')
    })
  })

  describe('additional coverage', () => {
    it('should produce correct total diff line count for a single change', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'a\nb\nc', newText: 'x\ny' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      // 3 remove + 2 add = 5
      expect(diff.hunks[0].changes).toHaveLength(5)
    })

    it('should produce correct output line count via formatDiffForConsole', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+5 @@',
            changes: [
              { content: 'old', type: 'remove' },
              { content: 'new', type: 'add' },
            ],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      // '' + '---' + '+++' + header + '- old' + '+ new' = 6 lines
      const lines = output.split('\n')
      expect(lines).toHaveLength(6)
    })

    it('should handle change with negative start position', () => {
      const changes: TextChange[] = [{ start: -1, end: 5, oldText: 'old', newText: 'new' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ --1,+5 @@')
    })

    it('should handle change where start is greater than end', () => {
      const changes: TextChange[] = [{ start: 100, end: 10, oldText: 'old', newText: 'new' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ -100,+10 @@')
      expect(diff.hunks[0].changes).toHaveLength(2)
    })

    it('should produce independent hunks with distinct changes', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'alpha', newText: 'a' },
        { start: 10, end: 15, oldText: 'bravo', newText: 'b' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].changes.map((c) => c.content)).toEqual(['alpha', 'a'])
      expect(diff.hunks[1].changes.map((c) => c.content)).toEqual(['bravo', 'b'])
    })

    it('should not mutate hunk changes across multiple formatDiffForConsole calls', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+1 @@',
            changes: [{ content: 'original', type: 'add' }],
          },
        ],
      }
      const output1 = formatDiffForConsole(diff)
      const output2 = formatDiffForConsole(diff)
      expect(output1).toBe(output2)
      expect(diff.hunks[0].changes[0].content).toBe('original')
    })

    it('should handle integration with multiple hunks through both functions', () => {
      const changes: TextChange[] = [
        { start: 5, end: 10, oldText: 'old1', newText: 'new1' },
        { start: 50, end: 55, oldText: 'old2', newText: 'new2' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/multi.ts')
      const output = formatDiffForConsole(diff)

      expect(output).toContain('--- /multi.ts')
      expect(output).toContain('+++ /multi.ts')
      expect(output).toContain('@@ -5,+10 @@')
      expect(output).toContain('@@ -50,+55 @@')
      expect(output).toContain('- old1')
      expect(output).toContain('+ new1')
      expect(output).toContain('- old2')
      expect(output).toContain('+ new2')
    })

    it('should handle integration with multiline changes through both functions', () => {
      const changes: TextChange[] = [
        {
          start: 0,
          end: 10,
          oldText: 'var x = 1;\nvar y = 2;',
          newText: 'const x = 1;\nconst y = 2;',
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/refactor.ts')
      const output = formatDiffForConsole(diff)

      expect(output).toContain('- var x = 1;')
      expect(output).toContain('- var y = 2;')
      expect(output).toContain('+ const x = 1;')
      expect(output).toContain('+ const y = 2;')
    })

    it('should handle DiffLine with all valid type values exhaustively', () => {
      const types: Array<DiffLine['type']> = ['add', 'remove', 'context']
      for (const t of types) {
        const line: DiffLine = { content: `test-${t}`, type: t }
        expect(line.type).toBe(t)
        expect(line.content).toBe(`test-${t}`)
      }
    })

    it('should handle FileDiff with deeply nested hunks and changes', () => {
      const fileDiff: FileDiff = {
        filePath: '/nested.ts',
        hunks: [
          {
            header: '@@ -0,+10 @@',
            changes: [
              { content: 'ctx', type: 'context' },
              { content: 'a1', type: 'remove' },
              { content: 'b1\nb2', type: 'add' },
            ],
          },
          {
            header: '@@ -20,+30 @@',
            changes: [
              { content: 'a2', type: 'remove' },
              { content: 'b3', type: 'add' },
              { content: 'ctx2', type: 'context' },
            ],
          },
        ],
      }
      const output = formatDiffForConsole(fileDiff)
      expect(output).toContain('  ctx')
      expect(output).toContain('- a1')
      expect(output).toContain('+ b1\nb2')
      expect(output).toContain('@@ -20,+30 @@')
      expect(output).toContain('- a2')
      expect(output).toContain('  ctx2')
    })

    it('should handle single change producing 100 remove lines', () => {
      const oldLines = Array.from({ length: 100 }, (_, i) => `line ${i}`)
      const changes: TextChange[] = [
        { start: 0, end: 100, oldText: oldLines.join('\n'), newText: 'replaced' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      const addLines = diff.hunks[0].changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(100)
      expect(addLines).toHaveLength(1)
      expect(removeLines[99].content).toBe('line 99')
    })

    it('should handle DiffHunk with empty header string', () => {
      const hunk: DiffHunk = { header: '', changes: [{ content: 'x', type: 'add' }] }
      expect(hunk.header).toBe('')
      expect(hunk.changes).toHaveLength(1)
    })

    it('should handle formatDiffForConsole with hunk having empty header', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '', changes: [{ content: 'content', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+ content')
    })

    it('should preserve change content with CRLF-like content correctly', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'line1\r\nline2', newText: 'lineA\r\nlineB' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      // '\r\n'.split('\n') keeps \r on first element
      expect(removeLines[0].content).toBe('line1\r')
      expect(removeLines[1].content).toBe('line2')
    })

    it('should handle formatDiffForConsole output structure with many hunks in order', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          { header: '@@ -1 @@', changes: [{ content: 'a', type: 'remove' }] },
          { header: '@@ -2 @@', changes: [{ content: 'b', type: 'add' }] },
          { header: '@@ -3 @@', changes: [{ content: 'c', type: 'context' }] },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output.split('\n')
      // '' | --- | +++ | @@1 | - a | @@2 | + b | @@3 | '  c'
      const header1Idx = lines.findIndex((l) => l.includes('@@ -1 @@'))
      const header2Idx = lines.findIndex((l) => l.includes('@@ -2 @@'))
      const header3Idx = lines.findIndex((l) => l.includes('@@ -3 @@'))
      expect(header1Idx).toBeLessThan(header2Idx)
      expect(header2Idx).toBeLessThan(header3Idx)
    })
  })

  describe('renderTextChangesAsDiff: sorting and ordering', () => {
    it('should sort 5 unsorted changes by start ascending', () => {
      const changes: TextChange[] = [
        { start: 40, end: 45, oldText: 'd', newText: 'D' },
        { start: 10, end: 15, oldText: 'b', newText: 'B' },
        { start: 0, end: 5, oldText: 'a', newText: 'A' },
        { start: 30, end: 35, oldText: 'c', newText: 'C' },
        { start: 50, end: 55, oldText: 'e', newText: 'E' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toContain('-0,')
      expect(diff.hunks[1].header).toContain('-10,')
      expect(diff.hunks[2].header).toContain('-30,')
      expect(diff.hunks[3].header).toContain('-40,')
      expect(diff.hunks[4].header).toContain('-50,')
    })

    it('should not modify the original array order', () => {
      const changes: TextChange[] = [
        { start: 20, end: 25, oldText: 'x', newText: 'y' },
        { start: 5, end: 10, oldText: 'a', newText: 'b' },
        { start: 100, end: 105, oldText: 'z', newText: 'w' },
      ]
      const snapshot = changes.map((c) => c.start)
      renderTextChangesAsDiff(changes, '/test.ts')
      expect(changes.map((c) => c.start)).toEqual(snapshot)
    })

    it('should handle changes already in sorted order', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'a', newText: 'A' },
        { start: 10, end: 15, oldText: 'b', newText: 'B' },
        { start: 20, end: 25, oldText: 'c', newText: 'C' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toContain('-0,')
      expect(diff.hunks[2].header).toContain('-20,')
    })

    it('should handle changes with same start but different end', () => {
      const changes: TextChange[] = [
        { start: 10, end: 30, oldText: 'long', newText: 'L' },
        { start: 10, end: 15, oldText: 'short', newText: 'S' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks).toHaveLength(2)
      // Both start at 10, relative order preserved
      expect(diff.hunks[0].header).toContain('-10,+30')
      expect(diff.hunks[1].header).toContain('-10,+15')
    })

    it('should handle a single change at very large position', () => {
      const changes: TextChange[] = [
        { start: 100000, end: 100050, oldText: 'big', newText: 'bigger' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ -100000,+100050 @@')
    })
  })

  describe('renderTextChangesAsDiff: line splitting edge cases', () => {
    it('should handle oldText with 50 newlines producing 51 remove lines', () => {
      const fifty = '\n'.repeat(50)
      const changes: TextChange[] = [{ start: 0, end: 10, oldText: fifty, newText: 'x' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      // '\n'.repeat(50).split('\n') = 51 elements (50 empty strings + 1 empty at end)
      expect(removeLines).toHaveLength(51)
    })

    it('should handle newText with mixed empty and non-empty lines', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'x', newText: 'a\n\nc\n\ne' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const addLines = diff.hunks[0].changes.filter((c) => c.type === 'add')
      expect(addLines).toHaveLength(5)
      expect(addLines[0].content).toBe('a')
      expect(addLines[1].content).toBe('')
      expect(addLines[2].content).toBe('c')
      expect(addLines[3].content).toBe('')
      expect(addLines[4].content).toBe('e')
    })

    it('should handle oldText with consecutive newlines producing empty lines', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'a\n\n\nb', newText: 'c' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(4)
      expect(removeLines[0].content).toBe('a')
      expect(removeLines[1].content).toBe('')
      expect(removeLines[2].content).toBe('')
      expect(removeLines[3].content).toBe('b')
    })

    it('should handle oldText that is a single newline', () => {
      const changes: TextChange[] = [{ start: 0, end: 1, oldText: '\n', newText: 'replaced' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(2)
      expect(removeLines[0].content).toBe('')
      expect(removeLines[1].content).toBe('')
    })

    it('should handle newText that is a single newline', () => {
      const changes: TextChange[] = [{ start: 0, end: 1, oldText: 'replaced', newText: '\n' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const addLines = diff.hunks[0].changes.filter((c) => c.type === 'add')
      expect(addLines).toHaveLength(2)
      expect(addLines[0].content).toBe('')
      expect(addLines[1].content).toBe('')
    })

    it('should handle content with carriage return only characters', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'a\rb\rc', newText: 'x\ry\rz' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      // No \n so it stays as single line
      expect(removeLines).toHaveLength(1)
      expect(removeLines[0].content).toBe('a\rb\rc')
    })

    it('should handle very long single line content', () => {
      const longLine = 'x'.repeat(10000)
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: longLine, newText: 'y' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(1)
      expect(removeLines[0].content).toBe(longLine)
    })

    it('should handle content with mixed tabs and spaces', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: '\t  \t indented', newText: '    spaces' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].changes[0].content).toBe('\t  \t indented')
      expect(diff.hunks[0].changes[1].content).toBe('    spaces')
    })
  })

  describe('renderTextChangesAsDiff: hunk structure', () => {
    it('should produce correct total line count for multiline both sides', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'a\nb\nc\nd', newText: 'x\ny' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      // 4 remove + 2 add = 6
      expect(diff.hunks[0].changes).toHaveLength(6)
    })

    it('should produce remove lines first then add lines', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'a\nb', newText: 'c\nd' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const types = diff.hunks[0].changes.map((c) => c.type)
      const lastRemove = types.lastIndexOf('remove')
      const firstAdd = types.indexOf('add')
      expect(lastRemove).toBeLessThan(firstAdd)
    })

    it('should create independent hunk objects for each change', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'a', newText: 'A' },
        { start: 10, end: 15, oldText: 'b', newText: 'B' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0]).not.toBe(diff.hunks[1])
      expect(diff.hunks[0].changes).not.toBe(diff.hunks[1].changes)
    })

    it('should create a new diffLine object for each line', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'same', newText: 'same' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].changes[0]).not.toBe(diff.hunks[0].changes[1])
    })

    it('should produce correct header when start is 1', () => {
      const changes: TextChange[] = [{ start: 1, end: 5, oldText: 'a', newText: 'b' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ -1,+5 @@')
    })

    it('should produce correct header when end is 0', () => {
      const changes: TextChange[] = [{ start: 5, end: 0, oldText: 'a', newText: 'b' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ -5,+0 @@')
    })

    it('should handle change where all remove lines have same content', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'dup\ndup\ndup', newText: 'single' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(3)
      for (const line of removeLines) {
        expect(line.content).toBe('dup')
      }
    })

    it('should handle change where all add lines have same content', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'single', newText: 'dup\ndup\ndup' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const addLines = diff.hunks[0].changes.filter((c) => c.type === 'add')
      expect(addLines).toHaveLength(3)
      for (const line of addLines) {
        expect(line.content).toBe('dup')
      }
    })
  })

  describe('renderTextChangesAsDiff: filePath handling', () => {
    it('should preserve relative filePath without leading slash', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'a', newText: 'b' }],
        'relative/path.ts',
      )
      expect(diff.filePath).toBe('relative/path.ts')
    })

    it('should preserve filePath with dot segments', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'a', newText: 'b' }],
        './src/../lib/file.ts',
      )
      expect(diff.filePath).toBe('./src/../lib/file.ts')
    })

    it('should preserve filePath with only a dot', () => {
      const diff = renderTextChangesAsDiff([{ start: 0, end: 5, oldText: 'a', newText: 'b' }], '.')
      expect(diff.filePath).toBe('.')
    })

    it('should preserve very long filePath', () => {
      const longPath = '/a/' + 'subdir/'.repeat(100) + 'file.ts'
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'a', newText: 'b' }],
        longPath,
      )
      expect(diff.filePath).toBe(longPath)
    })

    it('should preserve filePath with hash and question mark', () => {
      const path = '/path/to/file.ts?v=2#section'
      const diff = renderTextChangesAsDiff([{ start: 0, end: 5, oldText: 'a', newText: 'b' }], path)
      expect(diff.filePath).toBe(path)
    })
  })

  describe('renderTextChangesAsDiff: return value shape', () => {
    it('should return object with exactly filePath and hunks keys', () => {
      const diff = renderTextChangesAsDiff([], '/test.ts')
      expect(Object.keys(diff).sort()).toEqual(['filePath', 'hunks'])
    })

    it('should return hunks as an array', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'a', newText: 'b' }],
        '/test.ts',
      )
      expect(Array.isArray(diff.hunks)).toBe(true)
    })

    it('should have each hunk with header and changes keys', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'a', newText: 'b' }],
        '/test.ts',
      )
      for (const hunk of diff.hunks) {
        expect(Object.keys(hunk).sort()).toEqual(['changes', 'header'])
      }
    })

    it('should have each diffLine with content and type keys', () => {
      const diff = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'a', newText: 'b' }],
        '/test.ts',
      )
      for (const hunk of diff.hunks) {
        for (const change of hunk.changes) {
          expect(Object.keys(change).sort()).toEqual(['content', 'type'])
        }
      }
    })
  })

  describe('formatDiffForConsole: detailed output verification', () => {
    it('should produce exactly 6 output lines for single hunk with 2 changes', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+1 @@',
            changes: [
              { content: 'old', type: 'remove' },
              { content: 'new', type: 'add' },
            ],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output.split('\n')
      // '' | '--- /test.ts' | '+++ /test.ts (fix preview)' | '@@ -0,+1 @@' | '- old' | '+ new'
      expect(lines).toHaveLength(6)
    })

    it('should produce empty string for empty hunks array', () => {
      const diff: FileDiff = { filePath: '/test.ts', hunks: [] }
      expect(formatDiffForConsole(diff)).toBe('')
    })

    it('should produce line starting with blank for leading empty line', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -1 @@', changes: [{ content: 'a', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output.startsWith('\n')).toBe(true)
    })

    it('should include cyan-colored file markers', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'x', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      // The markers should be present (chalk may add ANSI codes)
      expect(output).toContain('--- /test.ts')
      expect(output).toContain('+++ /test.ts')
    })

    it('should format add lines with green color indicator', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'added', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+ added')
    })

    it('should format remove lines with red color indicator', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'removed', type: 'remove' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- removed')
    })

    it('should format context lines with dim indicator', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'context', type: 'context' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  context')
    })

    it('should handle hunk with 50 add lines', () => {
      const changes = Array.from({ length: 50 }, (_, i) => ({
        content: `line ${i}`,
        type: 'add' as const,
      }))
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+50 @@', changes }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+ line 0')
      expect(output).toContain('+ line 49')
    })

    it('should handle hunk with 50 remove lines', () => {
      const changes = Array.from({ length: 50 }, (_, i) => ({
        content: `line ${i}`,
        type: 'remove' as const,
      }))
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+50 @@', changes }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- line 0')
      expect(output).toContain('- line 49')
    })

    it('should handle mixed add/remove/context in single hunk', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+10 @@',
            changes: [
              { content: 'keep1', type: 'context' },
              { content: 'old1', type: 'remove' },
              { content: 'old2', type: 'remove' },
              { content: 'new1', type: 'add' },
              { content: 'new2', type: 'add' },
              { content: 'keep2', type: 'context' },
            ],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  keep1')
      expect(output).toContain('- old1')
      expect(output).toContain('- old2')
      expect(output).toContain('+ new1')
      expect(output).toContain('+ new2')
      expect(output).toContain('  keep2')
    })

    it('should handle hunk with only one add line', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'only add', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+ only add')
      expect(output).not.toContain('- only add')
    })

    it('should handle hunk with only one remove line', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'only remove', type: 'remove' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- only remove')
      expect(output).not.toContain('+ only remove')
    })

    it('should handle hunk with only one context line', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'only ctx', type: 'context' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('  only ctx')
      expect(output).not.toContain('- only ctx')
      expect(output).not.toContain('+ only ctx')
    })

    it('should handle content with backslashes', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'path\\to\\file', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('path\\to\\file')
    })

    it('should handle content with double quotes', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+1 @@',
            changes: [{ content: 'const x = "hello"', type: 'add' }],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('const x = "hello"')
    })

    it('should handle content with single quotes', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+1 @@',
            changes: [{ content: "const y = 'world'", type: 'remove' }],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain("const y = 'world'")
    })

    it('should handle content with template literal syntax', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+1 @@',
            changes: [{ content: '`${a} and ${b}`', type: 'add' }],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('`${a} and ${b}`')
    })

    it('should handle content with HTML tags', () => {
      const diff: FileDiff = {
        filePath: '/test.html',
        hunks: [
          {
            header: '@@ -0,+1 @@',
            changes: [{ content: '<div class="app">Hello</div>', type: 'add' }],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('<div class="app">Hello</div>')
    })

    it('should produce 7 lines for 2 hunks with 1 change each', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          { header: '@@ -1 @@', changes: [{ content: 'a', type: 'remove' }] },
          { header: '@@ -2 @@', changes: [{ content: 'b', type: 'add' }] },
        ],
      }
      const output = formatDiffForConsole(diff)
      // '' | --- | +++ | @@1 | - a | @@2 | + b  = 7 lines
      expect(output.split('\n')).toHaveLength(7)
    })

    it('should produce 8 lines for single hunk with 3 changes', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+5 @@',
            changes: [
              { content: 'ctx', type: 'context' },
              { content: 'old', type: 'remove' },
              { content: 'new', type: 'add' },
            ],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      // '' | --- | +++ | header | ctx | old | new = 7 lines
      expect(output.split('\n')).toHaveLength(7)
    })
  })

  describe('formatDiffForConsole: filePath edge cases', () => {
    it('should handle filePath that is just a slash', () => {
      const diff: FileDiff = {
        filePath: '/',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'x', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- /')
      expect(output).toContain('+++ /')
    })

    it('should handle filePath with @ symbol', () => {
      const diff: FileDiff = {
        filePath: '/@scope/package/file.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'x', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- /@scope/package/file.ts')
    })

    it('should handle filePath with percent encoding', () => {
      const diff: FileDiff = {
        filePath: '/path/%20space%20file.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: 'x', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('--- /path/%20space%20file.ts')
    })
  })

  describe('integration: end-to-end scenarios', () => {
    it('should handle realistic TypeScript var-to-const refactoring', () => {
      const changes: TextChange[] = [
        { start: 0, end: 15, oldText: 'var name = "world";', newText: 'const name = "world";' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/src/hello.ts')
      const output = formatDiffForConsole(diff)

      expect(output).toContain('--- /src/hello.ts')
      expect(output).toContain('+++ /src/hello.ts')
      expect(output).toContain('- var name = "world";')
      expect(output).toContain('+ const name = "world";')
      expect(output).toContain('(fix preview)')
    })

    it('should handle multi-file style fix scenario with multiple hunks', () => {
      const changes: TextChange[] = [
        { start: 10, end: 20, oldText: '==', newText: '===' },
        { start: 50, end: 60, oldText: '!=', newText: '!==' },
        { start: 100, end: 110, oldText: 'foo == bar', newText: 'foo === bar' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/src/compare.ts')
      const output = formatDiffForConsole(diff)

      expect(output).toContain('@@ -10,+20 @@')
      expect(output).toContain('@@ -50,+60 @@')
      expect(output).toContain('@@ -100,+110 @@')
      expect(output).toContain('- ==')
      expect(output).toContain('+ ===')
      expect(output).toContain('- !=')
      expect(output).toContain('+ !==')
      expect(output).toContain('- foo == bar')
      expect(output).toContain('+ foo === bar')
    })

    it('should handle replacing an entire function body', () => {
      const changes: TextChange[] = [
        {
          start: 0,
          end: 100,
          oldText: 'function add(a, b) {\n  return a + b;\n}',
          newText: 'const add = (a: number, b: number): number => {\n  return a + b;\n};',
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/src/math.ts')
      const hunk = diff.hunks[0]

      const removeLines = hunk.changes.filter((c) => c.type === 'remove')
      const addLines = hunk.changes.filter((c) => c.type === 'add')
      expect(removeLines).toHaveLength(3)
      expect(addLines).toHaveLength(3)
      expect(removeLines[0].content).toBe('function add(a, b) {')
      expect(addLines[0].content).toBe('const add = (a: number, b: number): number => {')
    })

    it('should handle pure insertion of new lines at end of file', () => {
      const changes: TextChange[] = [
        {
          start: 500,
          end: 500,
          oldText: '',
          newText: '\n// End of file\nexport default main;',
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/src/index.ts')
      const addLines = diff.hunks[0].changes.filter((c) => c.type === 'add')
      expect(addLines).toHaveLength(3)
      expect(addLines[0].content).toBe('')
      expect(addLines[1].content).toBe('// End of file')
      expect(addLines[2].content).toBe('export default main;')
    })

    it('should handle pure deletion of import lines', () => {
      const changes: TextChange[] = [
        {
          start: 0,
          end: 30,
          oldText: "import old from 'old-lib';\nimport unused from 'unused';",
          newText: '',
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/src/imports.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      expect(removeLines).toHaveLength(2)
      expect(removeLines[0].content).toBe("import old from 'old-lib';")
      expect(removeLines[1].content).toBe("import unused from 'unused';")
    })

    it('should round-trip through both functions with complex changes', () => {
      const changes: TextChange[] = [
        {
          start: 0,
          end: 10,
          oldText: 'line1\nline2\nline3',
          newText: 'LINE1\nLINE2\nLINE3\nLINE4',
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/complex.ts')
      const output = formatDiffForConsole(diff)

      // 3 remove + 4 add lines
      expect(output).toContain('- line1')
      expect(output).toContain('- line2')
      expect(output).toContain('- line3')
      expect(output).toContain('+ LINE1')
      expect(output).toContain('+ LINE2')
      expect(output).toContain('+ LINE3')
      expect(output).toContain('+ LINE4')
    })

    it('should handle 10 changes producing 10 hunks through integration', () => {
      const changes: TextChange[] = Array.from({ length: 10 }, (_, i) => ({
        start: i * 10,
        end: i * 10 + 5,
        oldText: `old${i}`,
        newText: `new${i}`,
      }))
      const diff = renderTextChangesAsDiff(changes, '/many.ts')
      const output = formatDiffForConsole(diff)

      expect(diff.hunks).toHaveLength(10)
      for (let i = 0; i < 10; i++) {
        expect(output).toContain(`- old${i}`)
        expect(output).toContain(`+ new${i}`)
      }
    })
  })

  describe('type-level correctness', () => {
    it('should accept DiffLine with add type and string content', () => {
      const line: DiffLine = { content: 'hello', type: 'add' }
      expect(line.type).toBe('add')
      expect(typeof line.content).toBe('string')
    })

    it('should accept DiffLine with remove type and string content', () => {
      const line: DiffLine = { content: 'world', type: 'remove' }
      expect(line.type).toBe('remove')
      expect(typeof line.content).toBe('string')
    })

    it('should accept DiffLine with context type and string content', () => {
      const line: DiffLine = { content: 'unchanged', type: 'context' }
      expect(line.type).toBe('context')
      expect(typeof line.content).toBe('string')
    })

    it('should accept DiffHunk with header and changes array', () => {
      const hunk: DiffHunk = {
        header: '@@ -0,+10 @@',
        changes: [
          { content: 'a', type: 'remove' },
          { content: 'b', type: 'add' },
        ],
      }
      expect(typeof hunk.header).toBe('string')
      expect(Array.isArray(hunk.changes)).toBe(true)
    })

    it('should accept FileDiff with filePath and hunks array', () => {
      const fd: FileDiff = { filePath: '/x.ts', hunks: [] }
      expect(typeof fd.filePath).toBe('string')
      expect(Array.isArray(fd.hunks)).toBe(true)
    })

    it('should accept FileDiff with populated hunks', () => {
      const fd: FileDiff = {
        filePath: '/x.ts',
        hunks: [
          {
            header: '@@ -1,+2 @@',
            changes: [{ content: 'test', type: 'context' }],
          },
        ],
      }
      expect(fd.hunks).toHaveLength(1)
      expect(fd.hunks[0].changes[0].content).toBe('test')
    })

    it('should create DiffLine array from renderTextChangesAsDiff with correct types', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'a', newText: 'b' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      for (const hunk of diff.hunks) {
        for (const change of hunk.changes) {
          expect(['add', 'remove', 'context']).toContain(change.type)
          expect(typeof change.content).toBe('string')
        }
      }
    })

    it('should have consistent return type from renderTextChangesAsDiff', () => {
      const diff1 = renderTextChangesAsDiff([], '/test.ts')
      const diff2 = renderTextChangesAsDiff(
        [{ start: 0, end: 5, oldText: 'a', newText: 'b' }],
        '/test.ts',
      )

      expect(typeof diff1.filePath).toBe('string')
      expect(Array.isArray(diff1.hunks)).toBe(true)
      expect(typeof diff2.filePath).toBe('string')
      expect(Array.isArray(diff2.hunks)).toBe(true)
    })
  })

  describe('formatDiffForConsole: no trailing whitespace issues', () => {
    it('should handle content that is only spaces', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: '   ', type: 'add' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('+    ')
    })

    it('should handle content that is only tabs', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [{ header: '@@ -0,+1 @@', changes: [{ content: '\t\t', type: 'remove' }] }],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- \t\t')
    })
  })

  describe('formatDiffForConsole: multiple hunks separation', () => {
    it('should keep hunks consecutive without blank lines between', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          { header: '@@ -1 @@', changes: [{ content: 'a', type: 'add' }] },
          { header: '@@ -2 @@', changes: [{ content: 'b', type: 'remove' }] },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output.split('\n')
      // No blank line between hunks
      const h1Idx = lines.findIndex((l) => l.includes('@@ -1 @@'))
      const h2Idx = lines.findIndex((l) => l.includes('@@ -2 @@'))
      // They should be adjacent: h2Idx = h1Idx + 2 (h1 header, + a, h2 header)
      expect(h2Idx).toBe(h1Idx + 2)
    })

    it('should handle 5 hunks all with single context change', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: Array.from({ length: 5 }, (_, i) => ({
          header: `@@ -${i} @@`,
          changes: [{ content: `ctx${i}`, type: 'context' as const }],
        })),
      }
      const output = formatDiffForConsole(diff)
      for (let i = 0; i < 5; i++) {
        expect(output).toContain(`@@ -${i} @@`)
        expect(output).toContain(`  ctx${i}`)
      }
    })
  })

  describe('renderTextChangesAsDiff: boundary values', () => {
    it('should handle start=Number.MAX_SAFE_INTEGER', () => {
      const changes: TextChange[] = [
        {
          start: Number.MAX_SAFE_INTEGER,
          end: Number.MAX_SAFE_INTEGER,
          oldText: 'a',
          newText: 'b',
        },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe(
        `@@ -${Number.MAX_SAFE_INTEGER},+${Number.MAX_SAFE_INTEGER} @@`,
      )
    })

    it('should handle start=0 with very large end', () => {
      const changes: TextChange[] = [{ start: 0, end: 999999999, oldText: 'a', newText: 'b' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ -0,+999999999 @@')
    })

    it('should handle change where start and end are both negative', () => {
      const changes: TextChange[] = [{ start: -5, end: -3, oldText: 'a', newText: 'b' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].header).toBe('@@ --5,+-3 @@')
    })
  })

  describe('formatDiffForConsole: single hunk with many change types interleaved', () => {
    it('should handle alternating remove and add lines', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+6 @@',
            changes: [
              { content: 'old1', type: 'remove' },
              { content: 'new1', type: 'add' },
              { content: 'old2', type: 'remove' },
              { content: 'new2', type: 'add' },
              { content: 'old3', type: 'remove' },
              { content: 'new3', type: 'add' },
            ],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      expect(output).toContain('- old1')
      expect(output).toContain('+ new1')
      expect(output).toContain('- old2')
      expect(output).toContain('+ new2')
      expect(output).toContain('- old3')
      expect(output).toContain('+ new3')
    })

    it('should preserve exact order of changes in output', () => {
      const diff: FileDiff = {
        filePath: '/test.ts',
        hunks: [
          {
            header: '@@ -0,+4 @@',
            changes: [
              { content: 'first', type: 'remove' },
              { content: 'second', type: 'add' },
              { content: 'third', type: 'context' },
              { content: 'fourth', type: 'remove' },
            ],
          },
        ],
      }
      const output = formatDiffForConsole(diff)
      const lines = output
        .split('\n')
        .filter((l) => l.startsWith('- ') || l.startsWith('+ ') || l.startsWith('  '))
      expect(lines[0]).toContain('first')
      expect(lines[1]).toContain('second')
      expect(lines[2]).toContain('third')
      expect(lines[3]).toContain('fourth')
    })
  })

  describe('additional renderTextChangesAsDiff edge cases', () => {
    it('should handle change where oldText has Windows-style CRLF line endings', () => {
      const changes: TextChange[] = [
        { start: 0, end: 10, oldText: 'line1\r\nline2\r\nline3', newText: 'replaced' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      // split('\n') on 'line1\r\nline2\r\nline3' = ['line1\r', 'line2\r', 'line3']
      expect(removeLines).toHaveLength(3)
      expect(removeLines[0].content).toBe('line1\r')
      expect(removeLines[2].content).toBe('line3')
    })

    it('should handle change where newText contains emoji sequences', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: 'hello', newText: '👨‍👩‍👧‍👦 family' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].changes[1].content).toBe('👨‍👩‍👧‍👦 family')
    })

    it('should produce correct number of total changes across multiple hunks', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'a\nb', newText: 'x\ny\nz' },
        { start: 20, end: 25, oldText: 'c', newText: 'p\nq' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const totalChanges = diff.hunks.reduce((sum, h) => sum + h.changes.length, 0)
      // hunk1: 2 remove + 3 add = 5, hunk2: 1 remove + 2 add = 3 => total 8
      expect(totalChanges).toBe(8)
    })

    it('should handle change with only carriage return in content', () => {
      const changes: TextChange[] = [{ start: 0, end: 5, oldText: '\r', newText: 'new' }]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      const removeLines = diff.hunks[0].changes.filter((c) => c.type === 'remove')
      // '\r'.split('\n') = ['\r'] — single line
      expect(removeLines).toHaveLength(1)
      expect(removeLines[0].content).toBe('\r')
    })

    it('should handle 20 changes producing 20 hunks', () => {
      const changes: TextChange[] = Array.from({ length: 20 }, (_, i) => ({
        start: i * 5,
        end: i * 5 + 3,
        oldText: `o${i}`,
        newText: `n${i}`,
      }))
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks).toHaveLength(20)
      expect(diff.hunks[0].header).toContain('-0,')
      expect(diff.hunks[19].header).toContain('-95,')
    })

    it('should handle change with null byte in content', () => {
      const changes: TextChange[] = [
        { start: 0, end: 5, oldText: 'before\0after', newText: 'clean' },
      ]
      const diff = renderTextChangesAsDiff(changes, '/test.ts')
      expect(diff.hunks[0].changes[0].content).toBe('before\0after')
    })
  })
})
