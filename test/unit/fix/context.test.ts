import { describe, expect, it, vi } from 'vitest'
import type { Node, SourceFile } from 'ts-morph'
import { createFixContext } from '../../../src/fix/context.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import {
  createMockNode,
  createMockSourceFile,
  createSourceFileWithChildren,
} from '../../helpers/ast-helpers'

function createMockViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: '/test/file.ts',
    message: 'Test violation',
    range: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    ruleId: 'test-rule',
    severity: 'warning',
    ...overrides,
  }
}

describe('Fix Context', () => {
  describe('createFixContext', () => {
    it('returns object with correct properties', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context).toBeDefined()
      expect(context.sourceFile).toBe(sourceFile)
      expect(context.violation).toBe(violation)
      expect(context.getNodeByPosition).toBeInstanceOf(Function)
      expect(context.getNodeByRange).toBeInstanceOf(Function)
    })

    it('stores the provided source file and violation', () => {
      const sourceFile = createMockSourceFile({ getFilePath: vi.fn(() => '/custom/file.ts') })
      const violation = createMockViolation({ ruleId: 'custom-rule', message: 'Custom message' })

      const context = createFixContext(sourceFile, violation)

      expect(context.sourceFile.getFilePath()).toBe('/custom/file.ts')
      expect(context.violation.ruleId).toBe('custom-rule')
      expect(context.violation.message).toBe('Custom message')
    })
  })

  describe('getNodeByPosition', () => {
    it('finds node at position within source file', () => {
      const childNode = createMockNode({ start: 5, end: 10, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByPosition(7)

      expect(foundNode).toBeDefined()
      expect(foundNode?.getText()).toBe('child')
    })

    it('returns undefined for position outside any node', () => {
      const childNode = createMockNode({ start: 10, end: 20, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByPosition(5)

      expect(foundNode).toBeUndefined()
    })

    it('returns undefined for position at exact end of node', () => {
      const childNode = createMockNode({ start: 10, end: 20, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByPosition(20)

      expect(foundNode).toBeUndefined()
    })

    it('finds deepest nested node at position', () => {
      const grandchildNode = createMockNode({ start: 7, end: 9, text: 'grandchild' })
      const childNode = createMockNode({
        start: 5,
        end: 15,
        text: 'child',
        children: [grandchildNode],
      })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByPosition(8)

      expect(foundNode?.getText()).toBe('grandchild')
    })

    it('handles position at node boundary', () => {
      const childNode = createMockNode({ start: 5, end: 10, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('child')
      expect(context.getNodeByPosition(10)).toBeUndefined()
    })

    it('handles source file with no children', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByPosition(5)

      expect(foundNode).toBeUndefined()
    })

    it('handles multiple sibling nodes', () => {
      const firstNode = createMockNode({ start: 0, end: 10, text: 'first' })
      const secondNode = createMockNode({ start: 10, end: 20, text: 'second' })
      const thirdNode = createMockNode({ start: 20, end: 30, text: 'third' })
      const sourceFile = createSourceFileWithChildren([firstNode, secondNode, thirdNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('first')
      expect(context.getNodeByPosition(15)?.getText()).toBe('second')
      expect(context.getNodeByPosition(25)?.getText()).toBe('third')
    })

    it('handles position 0 (start of file)', () => {
      const childNode = createMockNode({ start: 0, end: 10, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByPosition(0)

      expect(foundNode?.getText()).toBe('child')
    })

    it('returns undefined for negative position', () => {
      const childNode = createMockNode({ start: 0, end: 10, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByPosition(-1)

      expect(foundNode).toBeUndefined()
    })

    it('handles node at position 0 with single child', () => {
      const childNode = createMockNode({ start: 0, end: 10, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)?.getText()).toBe('child')
      expect(context.getNodeByPosition(5)?.getText()).toBe('child')
    })

    it('handles zero-width node (start equals end)', () => {
      const zeroWidthNode = createMockNode({ start: 5, end: 5, text: '' })
      const sourceFile = createSourceFileWithChildren([zeroWidthNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)).toBeUndefined()
    })

    it('handles consecutive nodes with no gaps', () => {
      const firstNode = createMockNode({ start: 0, end: 10, text: 'first' })
      const secondNode = createMockNode({ start: 10, end: 20, text: 'second' })
      const sourceFile = createSourceFileWithChildren([firstNode, secondNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('first')
      expect(context.getNodeByPosition(15)?.getText()).toBe('second')
      expect(context.getNodeByPosition(10)?.getText()).toBe('second')
    })
  })

  describe('getNodeByRange', () => {
    it('returns undefined when no nodes match exact range', () => {
      const childNode = createMockNode({ start: 10, end: 20, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByRange({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 5 },
      })

      expect(foundNode).toBeUndefined()
    })

    it('finds node when range exactly matches node bounds', () => {
      const childNode = createMockNode({ start: 4, end: 14, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByRange({
        start: { line: 1, column: 5 },
        end: { line: 1, column: 15 },
      })

      expect(foundNode).toBeDefined()
      expect(foundNode?.getText()).toBe('child')
    })

    it('finds nested node when range matches exactly', () => {
      const grandchildNode = createMockNode({ start: 6, end: 11, text: 'grandchild' })
      const childNode = createMockNode({
        start: 4,
        end: 14,
        text: 'child',
        children: [grandchildNode],
      })
      const sourceFile = createSourceFileWithChildren([childNode])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByRange({
        start: { line: 1, column: 7 },
        end: { line: 1, column: 12 },
      })

      expect(foundNode).toBeDefined()
      expect(foundNode?.getText()).toBe('grandchild')
    })

    it('handles source file with no children', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)
      const foundNode = context.getNodeByRange({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      })

      expect(foundNode).toBeUndefined()
    })

    it('handles multi-line range conversion', () => {
      const sourceFile = createMockSourceFile({
        getFullText: vi.fn(() => 'line1\nline2\nline3'),
      })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const foundNode = context.getNodeByRange({
        start: { line: 2, column: 1 },
        end: { line: 3, column: 5 },
      })

      expect(foundNode).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty source file text', () => {
      const sourceFile = createMockSourceFile({
        getFullText: vi.fn(() => ''),
      })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)).toBeUndefined()
      expect(
        context.getNodeByRange({
          start: { line: 1, column: 0 },
          end: { line: 1, column: 0 },
        }),
      ).toBeUndefined()
    })

    it('handles single line file', () => {
      const childNode = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFileWithChildren = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const contextWithChildren = createFixContext(sourceFileWithChildren, violation)

      expect(contextWithChildren.getNodeByPosition(2)?.getText()).toBe('hello')
    })

    it('handles position beyond file length', () => {
      const childNode = createMockNode({ start: 0, end: 5, text: 'short' })
      const sourceFileWithChildren = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFileWithChildren, violation)

      expect(context.getNodeByPosition(100)).toBeUndefined()
    })

    it('handles range with start greater than end', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(
        context.getNodeByRange({
          start: { line: 1, column: 10 },
          end: { line: 1, column: 5 },
        }),
      ).toBeUndefined()
    })
  })

  describe('Integration with Fix Context', () => {
    it('allows querying the same context multiple times', () => {
      const childNode = createMockNode({ start: 5, end: 15, text: 'child' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(7)?.getText()).toBe('child')
      expect(context.getNodeByPosition(7)?.getText()).toBe('child')
      expect(context.getNodeByPosition(12)?.getText()).toBe('child')
    })

    it('maintains source file reference', () => {
      const sourceFile = createMockSourceFile({ getFilePath: vi.fn(() => '/test/path.ts') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.sourceFile.getFilePath()).toBe('/test/path.ts')
      expect(context.violation).toBe(violation)
    })
  })
})
