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

  describe('createFixContext - Violation Variations', () => {
    it('stores violation with error severity', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ severity: 'error' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.severity).toBe('error')
    })

    it('stores violation with info severity', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ severity: 'info' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.severity).toBe('info')
    })

    it('stores violation with suggestion', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ suggestion: 'Use const instead' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.suggestion).toBe('Use const instead')
    })

    it('stores violation without suggestion', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.suggestion).toBeUndefined()
    })

    it('stores violation with empty message', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ message: '' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.message).toBe('')
    })

    it('stores violation with long message', () => {
      const sourceFile = createMockSourceFile()
      const longMessage = 'A'.repeat(500)
      const violation = createMockViolation({ message: longMessage })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.message).toBe(longMessage)
    })

    it('stores violation with special characters in message', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ message: 'Use `\n`\t"quotes" & <tags>' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.message).toBe('Use `\n`\t"quotes" & <tags>')
    })

    it('stores violation with unicode in filePath', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ filePath: '/测试/文件.ts' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.filePath).toBe('/测试/文件.ts')
    })

    it('stores violation with spaces in filePath', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ filePath: '/path/to/my project/src/file.ts' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.filePath).toBe('/path/to/my project/src/file.ts')
    })

    it('stores violation with different rule IDs', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({ ruleId: 'no-console' })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.ruleId).toBe('no-console')
    })

    it('stores violation range with start and end', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({
        range: {
          start: { line: 5, column: 10 },
          end: { line: 5, column: 20 },
        },
      })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.range.start.line).toBe(5)
      expect(context.violation.range.start.column).toBe(10)
      expect(context.violation.range.end.line).toBe(5)
      expect(context.violation.range.end.column).toBe(20)
    })

    it('stores violation with multi-line range', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({
        range: {
          start: { line: 3, column: 5 },
          end: { line: 7, column: 15 },
        },
      })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.range.start.line).toBe(3)
      expect(context.violation.range.end.line).toBe(7)
    })

    it('returns independent getNodeByPosition for each context', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context1 = createFixContext(sourceFile, violation)
      const context2 = createFixContext(sourceFile, violation)

      expect(context1.getNodeByPosition).not.toBe(context2.getNodeByPosition)
    })

    it('returns independent getNodeByRange for each context', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context1 = createFixContext(sourceFile, violation)
      const context2 = createFixContext(sourceFile, violation)

      expect(context1.getNodeByRange).not.toBe(context2.getNodeByRange)
    })

    it('preserves violation reference identity', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.violation).toBe(violation)
    })
  })

  describe('getNodeByPosition - Deep Nesting', () => {
    it('finds node at three levels of nesting', () => {
      const deepNode = createMockNode({ start: 6, end: 8, text: 'deep' })
      const midNode = createMockNode({ start: 4, end: 12, text: 'mid', children: [deepNode] })
      const topNode = createMockNode({ start: 2, end: 20, text: 'top', children: [midNode] })
      const sourceFile = createSourceFileWithChildren([topNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(7)?.getText()).toBe('deep')
    })

    it('finds middle node when position is in middle but not in deep child', () => {
      const deepNode = createMockNode({ start: 6, end: 8, text: 'deep' })
      const midNode = createMockNode({ start: 4, end: 12, text: 'mid', children: [deepNode] })
      const topNode = createMockNode({ start: 2, end: 20, text: 'top', children: [midNode] })
      const sourceFile = createSourceFileWithChildren([topNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('mid')
    })

    it('finds top node when position is in top but not in middle child', () => {
      const midNode = createMockNode({ start: 6, end: 12, text: 'mid' })
      const topNode = createMockNode({ start: 2, end: 20, text: 'top', children: [midNode] })
      const sourceFile = createSourceFileWithChildren([topNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(4)?.getText()).toBe('top')
    })

    it('finds node at four levels of nesting', () => {
      const level4 = createMockNode({ start: 8, end: 10, text: 'l4' })
      const level3 = createMockNode({ start: 6, end: 14, text: 'l3', children: [level4] })
      const level2 = createMockNode({ start: 4, end: 18, text: 'l2', children: [level3] })
      const level1 = createMockNode({ start: 0, end: 24, text: 'l1', children: [level2] })
      const sourceFile = createSourceFileWithChildren([level1])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(9)?.getText()).toBe('l4')
    })

    it('finds level 3 node at four levels of nesting', () => {
      const level4 = createMockNode({ start: 8, end: 10, text: 'l4' })
      const level3 = createMockNode({ start: 6, end: 14, text: 'l3', children: [level4] })
      const level2 = createMockNode({ start: 4, end: 18, text: 'l2', children: [level3] })
      const level1 = createMockNode({ start: 0, end: 24, text: 'l1', children: [level2] })
      const sourceFile = createSourceFileWithChildren([level1])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(12)?.getText()).toBe('l3')
    })

    it('finds level 2 node at four levels of nesting', () => {
      const level4 = createMockNode({ start: 8, end: 10, text: 'l4' })
      const level3 = createMockNode({ start: 12, end: 14, text: 'l3', children: [level4] })
      const level2 = createMockNode({ start: 4, end: 18, text: 'l2', children: [level3] })
      const level1 = createMockNode({ start: 0, end: 24, text: 'l1', children: [level2] })
      const sourceFile = createSourceFileWithChildren([level1])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(16)?.getText()).toBe('l2')
    })

    it('finds node among multiple children at same level', () => {
      const childA = createMockNode({ start: 5, end: 10, text: 'A' })
      const childB = createMockNode({ start: 15, end: 20, text: 'B' })
      const childC = createMockNode({ start: 25, end: 30, text: 'C' })
      const parent = createMockNode({
        start: 0,
        end: 40,
        text: 'parent',
        children: [childA, childB, childC],
      })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(7)?.getText()).toBe('A')
      expect(context.getNodeByPosition(17)?.getText()).toBe('B')
      expect(context.getNodeByPosition(27)?.getText()).toBe('C')
    })

    it('finds parent when position is in gap between children', () => {
      const childA = createMockNode({ start: 5, end: 10, text: 'A' })
      const childB = createMockNode({ start: 20, end: 25, text: 'B' })
      const parent = createMockNode({
        start: 0,
        end: 40,
        text: 'parent',
        children: [childA, childB],
      })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(15)?.getText()).toBe('parent')
    })

    it('handles five levels of nesting', () => {
      const level5 = createMockNode({ start: 10, end: 12, text: 'l5' })
      const level4 = createMockNode({ start: 8, end: 16, text: 'l4', children: [level5] })
      const level3 = createMockNode({ start: 6, end: 20, text: 'l3', children: [level4] })
      const level2 = createMockNode({ start: 4, end: 24, text: 'l2', children: [level3] })
      const level1 = createMockNode({ start: 0, end: 30, text: 'l1', children: [level2] })
      const sourceFile = createSourceFileWithChildren([level1])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(11)?.getText()).toBe('l5')
    })

    it('returns top-level node when position is not in any child', () => {
      const childA = createMockNode({ start: 5, end: 10, text: 'child' })
      const topNode = createMockNode({ start: 0, end: 50, text: 'top', children: [childA] })
      const sourceFile = createSourceFileWithChildren([topNode])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(30)?.getText()).toBe('top')
    })

    it('finds node among siblings at different nesting depths', () => {
      const grandchild = createMockNode({ start: 8, end: 12, text: 'gc' })
      const child1 = createMockNode({ start: 2, end: 15, text: 'c1', children: [grandchild] })
      const child2 = createMockNode({ start: 20, end: 30, text: 'c2' })
      const sourceFile = createSourceFileWithChildren([child1, child2])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('gc')
      expect(context.getNodeByPosition(25)?.getText()).toBe('c2')
    })
  })

  describe('getNodeByPosition - Siblings and Gaps', () => {
    it('finds node in gap between two separate nodes', () => {
      const nodeA = createMockNode({ start: 0, end: 10, text: 'A' })
      const nodeB = createMockNode({ start: 20, end: 30, text: 'B' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(15)).toBeUndefined()
    })

    it('distinguishes between adjacent nodes with exact boundary', () => {
      const nodeA = createMockNode({ start: 0, end: 10, text: 'A' })
      const nodeB = createMockNode({ start: 10, end: 20, text: 'B' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('A')
      expect(context.getNodeByPosition(15)?.getText()).toBe('B')
    })

    it('handles three siblings with gaps', () => {
      const nodeA = createMockNode({ start: 0, end: 5, text: 'A' })
      const nodeB = createMockNode({ start: 10, end: 15, text: 'B' })
      const nodeC = createMockNode({ start: 20, end: 25, text: 'C' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB, nodeC])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(2)?.getText()).toBe('A')
      expect(context.getNodeByPosition(7)).toBeUndefined()
      expect(context.getNodeByPosition(12)?.getText()).toBe('B')
      expect(context.getNodeByPosition(17)).toBeUndefined()
      expect(context.getNodeByPosition(22)?.getText()).toBe('C')
    })

    it('handles many siblings (10 nodes)', () => {
      const nodes = Array.from({ length: 10 }, (_, i) =>
        createMockNode({ start: i * 10, end: i * 10 + 8, text: `node${i}` }),
      )
      const sourceFile = createSourceFileWithChildren(nodes)
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(4)?.getText()).toBe('node0')
      expect(context.getNodeByPosition(14)?.getText()).toBe('node1')
      expect(context.getNodeByPosition(54)?.getText()).toBe('node5')
      expect(context.getNodeByPosition(94)?.getText()).toBe('node9')
    })

    it('returns undefined for position in gap between many siblings', () => {
      const nodes = Array.from({ length: 5 }, (_, i) =>
        createMockNode({ start: i * 10, end: i * 10 + 5, text: `n${i}` }),
      )
      const sourceFile = createSourceFileWithChildren(nodes)
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(7)).toBeUndefined()
      expect(context.getNodeByPosition(17)).toBeUndefined()
      expect(context.getNodeByPosition(47)).toBeUndefined()
    })

    it('handles nodes with single character width', () => {
      const node = createMockNode({ start: 5, end: 6, text: 'x' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('x')
      expect(context.getNodeByPosition(6)).toBeUndefined()
    })

    it('handles node spanning large range', () => {
      const node = createMockNode({ start: 0, end: 10000, text: 'large' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)?.getText()).toBe('large')
      expect(context.getNodeByPosition(5000)?.getText()).toBe('large')
      expect(context.getNodeByPosition(9999)?.getText()).toBe('large')
      expect(context.getNodeByPosition(10000)).toBeUndefined()
    })

    it('handles node at very large offset', () => {
      const node = createMockNode({ start: 1000, end: 2000, text: 'far' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(1500)?.getText()).toBe('far')
      expect(context.getNodeByPosition(500)).toBeUndefined()
    })

    it('handles two nodes with same range', () => {
      const nodeA = createMockNode({ start: 5, end: 10, text: 'A' })
      const nodeB = createMockNode({ start: 5, end: 10, text: 'B' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByPosition(7)
      expect(found).toBeDefined()
      expect(['A', 'B']).toContain(found?.getText())
    })

    it('handles node at very end of file', () => {
      const node = createMockNode({ start: 90, end: 100, text: 'end' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(95)?.getText()).toBe('end')
      expect(context.getNodeByPosition(99)?.getText()).toBe('end')
    })

    it('handles node covering position 0', () => {
      const node = createMockNode({ start: 0, end: 1, text: 'x' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)?.getText()).toBe('x')
    })

    it('returns undefined for very large position with no nodes', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(Number.MAX_SAFE_INTEGER)).toBeUndefined()
    })

    it('handles position 1 in node starting at 0', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(1)?.getText()).toBe('node')
      expect(context.getNodeByPosition(4)?.getText()).toBe('node')
    })

    it('handles node with large gap before it', () => {
      const node = createMockNode({ start: 500, end: 510, text: 'late' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(100)).toBeUndefined()
      expect(context.getNodeByPosition(505)?.getText()).toBe('late')
    })

    it('handles node with large gap after it', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'early' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('early')
      expect(context.getNodeByPosition(500)).toBeUndefined()
    })
  })

  describe('getNodeByPosition - Boundary Conditions', () => {
    it('returns undefined for position just before node start', () => {
      const node = createMockNode({ start: 10, end: 20, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(9)).toBeUndefined()
    })

    it('finds node at exact start position', () => {
      const node = createMockNode({ start: 10, end: 20, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('node')
    })

    it('finds node at position end minus one', () => {
      const node = createMockNode({ start: 10, end: 20, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(19)?.getText()).toBe('node')
    })

    it('returns undefined at exact end position', () => {
      const node = createMockNode({ start: 10, end: 20, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(20)).toBeUndefined()
    })

    it('handles position just after node end', () => {
      const node = createMockNode({ start: 10, end: 20, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(21)).toBeUndefined()
    })

    it('handles exact boundary between consecutive nodes (end of first)', () => {
      const nodeA = createMockNode({ start: 0, end: 10, text: 'A' })
      const nodeB = createMockNode({ start: 10, end: 20, text: 'B' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('B')
    })

    it('handles boundary at position 0 between absent and present node', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'start' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)?.getText()).toBe('start')
    })

    it('handles midpoint of large node', () => {
      const node = createMockNode({ start: 0, end: 100, text: 'big' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(50)?.getText()).toBe('big')
    })

    it('returns undefined for position at node end when nested children exist', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(20)).toBeUndefined()
    })

    it('handles position at start of child node within parent', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('child')
    })

    it('handles position at end minus one of child node', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(9)?.getText()).toBe('child')
    })

    it('handles position at exact end of child (should return parent)', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('parent')
    })

    it('handles very small negative position', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(-1)).toBeUndefined()
    })

    it('handles large negative position', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(-1000)).toBeUndefined()
    })

    it('handles zero position with no nodes', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)).toBeUndefined()
    })
  })

  describe('getNodeByRange - Single Line Matching', () => {
    it('matches node at line 1 column 1 to end of node', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('hello')
    })

    it('does not match when start column is off by one', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 2 },
        end: { line: 1, column: 6 },
      })

      expect(found).toBeUndefined()
    })

    it('does not match when end column is off by one', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 5 },
      })

      expect(found).toBeUndefined()
    })

    it('matches node at offset within single line', () => {
      const node = createMockNode({ start: 4, end: 14, text: '0123456789' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 5 },
        end: { line: 1, column: 15 },
      })

      expect(found?.getText()).toBe('0123456789')
    })

    it('matches second node on same line', () => {
      const nodeA = createMockNode({ start: 0, end: 5, text: 'first' })
      const nodeB = createMockNode({ start: 6, end: 12, text: 'second' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      sourceFile.getFullText = vi.fn(() => 'first second')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 7 },
        end: { line: 1, column: 13 },
      })

      expect(found?.getText()).toBe('second')
    })

    it('returns undefined when range spans more than node', () => {
      const node = createMockNode({ start: 2, end: 8, text: 'middle' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 10 },
      })

      expect(found).toBeUndefined()
    })

    it('returns undefined when range is subset of node', () => {
      const node = createMockNode({ start: 0, end: 10, text: '0123456789' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 3 },
        end: { line: 1, column: 7 },
      })

      expect(found).toBeUndefined()
    })

    it('matches zero-width range at position 0', () => {
      const node = createMockNode({ start: 0, end: 0, text: '' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 1 },
      })

      expect(found).toBeDefined()
    })
  })

  describe('getNodeByRange - Multi-Line Matching', () => {
    it('matches node on line 2 of two-line file', () => {
      const node = createMockNode({ start: 11, end: 21, text: '0123456789' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789\n0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 1 },
        end: { line: 2, column: 11 },
      })

      expect(found?.getText()).toBe('0123456789')
    })

    it('matches node on line 3 of three-line file', () => {
      const node = createMockNode({ start: 22, end: 32, text: '0123456789' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789\n0123456789\n0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 3, column: 1 },
        end: { line: 3, column: 11 },
      })

      expect(found?.getText()).toBe('0123456789')
    })

    it('matches node spanning lines 1 to 2', () => {
      const node = createMockNode({ start: 5, end: 16, text: '56789\n01234' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789\n0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 2, column: 6 },
      })

      expect(found).toBeDefined()
      expect(found?.getText()).toBe('56789\n01234')
    })

    it('does not match when end column is wrong for multi-line node', () => {
      const node = createMockNode({ start: 5, end: 16, text: '56789\n01234' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789\n0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 2, column: 7 },
      })

      expect(found).toBeUndefined()
    })

    it('handles file with trailing newline', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello\n')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('hello')
    })

    it('handles file with multiple trailing newlines', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello\n\n\n')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('hello')
    })

    it('handles file with only newlines', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => '\n\n\n') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 },
      })

      expect(found).toBeUndefined()
    })

    it('matches node at end of multi-line file', () => {
      const node = createMockNode({ start: 16, end: 21, text: 'world' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello\nworld\nfoo\nworld')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 4, column: 1 },
        end: { line: 4, column: 6 },
      })

      expect(found?.getText()).toBe('world')
    })

    it('handles node on line 2 with column offset', () => {
      const node = createMockNode({ start: 18, end: 23, text: 'world' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello world\nhello world')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 7 },
        end: { line: 2, column: 12 },
      })

      expect(found?.getText()).toBe('world')
    })

    it('matches nested node on line 2', () => {
      const grandchild = createMockNode({ start: 13, end: 18, text: 'inner' })
      const child = createMockNode({
        start: 11,
        end: 21,
        text: 'hello inner!',
        children: [grandchild],
      })
      const sourceFile = createSourceFileWithChildren([child])
      sourceFile.getFullText = vi.fn(() => 'hello worl\ndhello inner!')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 3 },
        end: { line: 2, column: 8 },
      })

      expect(found).toBeDefined()
      expect(found?.getText()).toBe('inner')
    })
  })

  describe('getNodeByRange - Nested Matching', () => {
    it('matches parent when child does not match exactly', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 21 },
      })

      expect(found?.getText()).toBe('parent')
    })

    it('prefers exact child match over parent containment', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 1, column: 11 },
      })

      expect(found?.getText()).toBe('child')
    })

    it('finds grandchild with exact range match', () => {
      const grandchild = createMockNode({ start: 6, end: 11, text: 'grand' })
      const child = createMockNode({ start: 4, end: 14, text: 'child', children: [grandchild] })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 7 },
        end: { line: 1, column: 12 },
      })

      expect(found?.getText()).toBe('grand')
    })

    it('finds child when grandchild does not match range', () => {
      const grandchild = createMockNode({ start: 8, end: 12, text: 'grand' })
      const child = createMockNode({ start: 4, end: 16, text: 'child', children: [grandchild] })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 5 },
        end: { line: 1, column: 17 },
      })

      expect(found?.getText()).toBe('child')
    })

    it('returns undefined when no node matches range at any depth', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 2 },
        end: { line: 1, column: 4 },
      })

      expect(found).toBeUndefined()
    })

    it('handles multiple children where only one matches range', () => {
      const childA = createMockNode({ start: 0, end: 5, text: 'childA' })
      const childB = createMockNode({ start: 10, end: 15, text: 'childB' })
      const parent = createMockNode({
        start: 0,
        end: 20,
        text: 'parent',
        children: [childA, childB],
      })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 11 },
        end: { line: 1, column: 16 },
      })

      expect(found?.getText()).toBe('childB')
    })

    it('handles deeply nested structure with range at each level', () => {
      const level4 = createMockNode({ start: 8, end: 12, text: 'l4' })
      const level3 = createMockNode({ start: 6, end: 16, text: 'l3', children: [level4] })
      const level2 = createMockNode({ start: 4, end: 20, text: 'l2', children: [level3] })
      const level1 = createMockNode({ start: 0, end: 30, text: 'l1', children: [level2] })
      const sourceFile = createSourceFileWithChildren([level1])
      sourceFile.getFullText = vi.fn(() => '0123456789012345678901234567890')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 9 }, end: { line: 1, column: 13 } })
          ?.getText(),
      ).toBe('l4')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 7 }, end: { line: 1, column: 17 } })
          ?.getText(),
      ).toBe('l3')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 5 }, end: { line: 1, column: 21 } })
          ?.getText(),
      ).toBe('l2')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 1 }, end: { line: 1, column: 31 } })
          ?.getText(),
      ).toBe('l1')
    })
  })

  describe('getPosFromLineCol - Position Conversion', () => {
    it('converts line 1 column 1 to position 0', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('hello')
    })

    it('converts line 1 column 2 to position 1', () => {
      const node = createMockNode({ start: 1, end: 6, text: 'ello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'xhello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 2 },
        end: { line: 1, column: 7 },
      })

      expect(found?.getText()).toBe('ello')
    })

    it('converts line 1 column 10 to position 9', () => {
      const node = createMockNode({ start: 9, end: 10, text: 'X' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '012345678X')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 10 },
        end: { line: 1, column: 11 },
      })

      expect(found?.getText()).toBe('X')
    })

    it('converts line 2 column 1 for two-line text', () => {
      const node = createMockNode({ start: 6, end: 11, text: 'world' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello\nworld')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 1 },
        end: { line: 2, column: 6 },
      })

      expect(found?.getText()).toBe('world')
    })

    it('converts line 3 column 1 for three-line text', () => {
      const node = createMockNode({ start: 12, end: 15, text: 'foo' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello\nworld\nfoo')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 3, column: 1 },
        end: { line: 3, column: 4 },
      })

      expect(found?.getText()).toBe('foo')
    })

    it('converts line 2 column 2 for text "a\\nbc"', () => {
      const node = createMockNode({ start: 3, end: 4, text: 'c' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'a\nbc')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 2 },
        end: { line: 2, column: 3 },
      })

      expect(found?.getText()).toBe('c')
    })

    it('converts line 3 column 1 for text "a\\nb\\nc"', () => {
      const node = createMockNode({ start: 4, end: 5, text: 'c' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'a\nb\nc')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 3, column: 1 },
        end: { line: 3, column: 2 },
      })

      expect(found?.getText()).toBe('c')
    })

    it('clamps position to text length for line beyond file', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => 'hello') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 10, column: 1 },
        end: { line: 10, column: 5 },
      })

      expect(found).toBeUndefined()
    })

    it('handles empty text with line 1 column 1', () => {
      const node = createMockNode({ start: 0, end: 0, text: '' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 1 },
      })

      expect(found).toBeDefined()
    })

    it('handles single character text', () => {
      const node = createMockNode({ start: 0, end: 1, text: 'X' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'X')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 },
      })

      expect(found?.getText()).toBe('X')
    })

    it('handles text with empty first line', () => {
      const node = createMockNode({ start: 1, end: 5, text: 'text' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '\ntext')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 1 },
        end: { line: 2, column: 5 },
      })

      expect(found?.getText()).toBe('text')
    })

    it('handles text with multiple empty lines before content', () => {
      const node = createMockNode({ start: 3, end: 7, text: 'text' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '\n\n\ntext')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 4, column: 1 },
        end: { line: 4, column: 5 },
      })

      expect(found?.getText()).toBe('text')
    })

    it('handles column beyond line length with clamping', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => 'hi') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 100 },
        end: { line: 1, column: 200 },
      })

      expect(found).toBeUndefined()
    })

    it('handles line 1 with various columns in short text', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'abcde' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'abcde')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('abcde')
    })

    it('handles long first line correctly', () => {
      const longLine = 'A'.repeat(100)
      const node = createMockNode({ start: 95, end: 100, text: 'AAAAA' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => longLine)
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 96 },
        end: { line: 1, column: 101 },
      })

      expect(found?.getText()).toBe('AAAAA')
    })

    it('handles long second line correctly', () => {
      const text = 'short\n' + 'B'.repeat(50)
      const node = createMockNode({ start: 51, end: 56, text: 'BBBBB' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => text)
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 46 },
        end: { line: 2, column: 51 },
      })

      expect(found?.getText()).toBe('BBBBB')
    })

    it('handles text with tabs', () => {
      const node = createMockNode({ start: 0, end: 5, text: '\t\t\t\t\t' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '\t\t\t\t\t')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('\t\t\t\t\t')
    })

    it('handles text with carriage returns (split by \\n)', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello\r\nworld')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('hello')
    })
  })

  describe('Edge Cases - Extended', () => {
    it('handles source file with single whitespace text', () => {
      const node = createMockNode({ start: 0, end: 1, text: ' ' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => ' ')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)?.getText()).toBe(' ')
    })

    it('handles node text that differs from position range', () => {
      const node = createMockNode({ start: 5, end: 15, text: 'some text here' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('some text here')
    })

    it('handles very large position number', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'small' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(999999999)).toBeUndefined()
    })

    it('handles violation with column 0', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.range.start.column).toBe(0)
    })

    it('getNodeByPosition does not interfere with getNodeByRange', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      context.getNodeByPosition(5)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 11 },
      })

      expect(found?.getText()).toBe('node')
    })

    it('getNodeByRange does not interfere with getNodeByPosition', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      context.getNodeByRange({ start: { line: 1, column: 1 }, end: { line: 1, column: 6 } })

      expect(context.getNodeByPosition(5)?.getText()).toBe('node')
    })

    it('handles interleaved position and range queries', () => {
      const nodeA = createMockNode({ start: 0, end: 5, text: 'A' })
      const nodeB = createMockNode({ start: 5, end: 10, text: 'B' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      sourceFile.getFullText = vi.fn(() => 'AAAAABBBBB')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(2)?.getText()).toBe('A')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 6 }, end: { line: 1, column: 11 } })
          ?.getText(),
      ).toBe('B')
      expect(context.getNodeByPosition(7)?.getText()).toBe('B')
    })

    it('handles source file with only newline', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => '\n') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)).toBeUndefined()
    })

    it('handles node at position 0-0 in empty text via range', () => {
      const node = createMockNode({ start: 0, end: 0, text: '' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)).toBeUndefined()
      expect(
        context.getNodeByRange({ start: { line: 1, column: 1 }, end: { line: 1, column: 1 } }),
      ).toBeDefined()
    })

    it('handles violation with same start and end line', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({
        range: { start: { line: 1, column: 5 }, end: { line: 1, column: 5 } },
      })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.range.start.line).toBe(context.violation.range.end.line)
    })

    it('handles context created with source file returning different paths', () => {
      const sourceFile1 = createMockSourceFile({ getFilePath: vi.fn(() => '/a.ts') })
      const sourceFile2 = createMockSourceFile({ getFilePath: vi.fn(() => '/b.ts') })
      const violation = createMockViolation()

      const context1 = createFixContext(sourceFile1, violation)
      const context2 = createFixContext(sourceFile2, violation)

      expect(context1.sourceFile.getFilePath()).toBe('/a.ts')
      expect(context2.sourceFile.getFilePath()).toBe('/b.ts')
    })

    it('handles context methods not modifying source file state', () => {
      const childNode = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([childNode])
      const forEachChild = sourceFile.forEachChild
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      context.getNodeByPosition(3)
      context.getNodeByPosition(3)
      context.getNodeByRange({ start: { line: 1, column: 1 }, end: { line: 1, column: 6 } })

      expect(sourceFile.forEachChild).toBe(forEachChild)
    })

    it('handles range query with line 0 matching same as line 1', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 0, column: 1 },
        end: { line: 0, column: 6 },
      })

      expect(found?.getText()).toBe('hello')
    })

    it('handles range query with column 0', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => 'hello') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 5 },
      })

      expect(found).toBeUndefined()
    })

    it('handles many sequential position queries on same context', () => {
      const node = createMockNode({ start: 0, end: 100, text: 'big' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      for (let i = 0; i < 100; i++) {
        expect(context.getNodeByPosition(i)?.getText()).toBe('big')
      }
      expect(context.getNodeByPosition(100)).toBeUndefined()
    })
  })

  describe('Integration - Extended', () => {
    it('creates independent contexts from same source file', () => {
      const sourceFile = createMockSourceFile()
      const violation1 = createMockViolation({ ruleId: 'rule-1' })
      const violation2 = createMockViolation({ ruleId: 'rule-2' })

      const context1 = createFixContext(sourceFile, violation1)
      const context2 = createFixContext(sourceFile, violation2)

      expect(context1.violation.ruleId).toBe('rule-1')
      expect(context2.violation.ruleId).toBe('rule-2')
    })

    it('creates independent contexts from different source files', () => {
      const sourceFile1 = createMockSourceFile({ getFilePath: vi.fn(() => '/a.ts') })
      const sourceFile2 = createMockSourceFile({ getFilePath: vi.fn(() => '/b.ts') })
      const violation = createMockViolation()

      const context1 = createFixContext(sourceFile1, violation)
      const context2 = createFixContext(sourceFile2, violation)

      expect(context1.sourceFile.getFilePath()).toBe('/a.ts')
      expect(context2.sourceFile.getFilePath()).toBe('/b.ts')
    })

    it('context queries are idempotent', () => {
      const node = createMockNode({ start: 5, end: 15, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const result1 = context.getNodeByPosition(10)
      const result2 = context.getNodeByPosition(10)
      const result3 = context.getNodeByPosition(10)

      expect(result1?.getText()).toBe('node')
      expect(result2?.getText()).toBe('node')
      expect(result3?.getText()).toBe('node')
    })

    it('supports querying range then position sequentially', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const byRange = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 1, column: 11 },
      })
      const byPos = context.getNodeByPosition(7)

      expect(byRange?.getText()).toBe('child')
      expect(byPos?.getText()).toBe('child')
    })

    it('supports querying position then range sequentially', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 20, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const byPos = context.getNodeByPosition(7)
      const byRange = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 1, column: 11 },
      })

      expect(byPos?.getText()).toBe('child')
      expect(byRange?.getText()).toBe('child')
    })

    it('handles multiple range queries on same context', () => {
      const nodeA = createMockNode({ start: 0, end: 5, text: 'nodeA' })
      const nodeB = createMockNode({ start: 6, end: 11, text: 'nodeB' })
      const nodeC = createMockNode({ start: 12, end: 17, text: 'nodeC' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB, nodeC])
      sourceFile.getFullText = vi.fn(() => 'nodeA nodeB nodeC')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 1 }, end: { line: 1, column: 6 } })
          ?.getText(),
      ).toBe('nodeA')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 7 }, end: { line: 1, column: 12 } })
          ?.getText(),
      ).toBe('nodeB')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 13 }, end: { line: 1, column: 18 } })
          ?.getText(),
      ).toBe('nodeC')
    })

    it('handles context with deeply nested node structure', () => {
      const deep = createMockNode({ start: 8, end: 12, text: 'deep' })
      const mid = createMockNode({ start: 4, end: 16, text: 'mid', children: [deep] })
      const top = createMockNode({ start: 0, end: 20, text: 'top', children: [mid] })
      const sourceFile = createSourceFileWithChildren([top])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('deep')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 9 }, end: { line: 1, column: 13 } })
          ?.getText(),
      ).toBe('deep')
    })

    it('handles context with wide flat node structure', () => {
      const nodes = [
        createMockNode({ start: 0, end: 3, text: 'abc' }),
        createMockNode({ start: 4, end: 7, text: 'def' }),
        createMockNode({ start: 8, end: 11, text: 'ghi' }),
      ]
      const sourceFile = createSourceFileWithChildren(nodes)
      sourceFile.getFullText = vi.fn(() => 'abc def ghi')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(1)?.getText()).toBe('abc')
      expect(context.getNodeByPosition(5)?.getText()).toBe('def')
      expect(context.getNodeByPosition(9)?.getText()).toBe('ghi')
    })

    it('preserves violation integrity across multiple queries', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'test' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation({
        ruleId: 'test-rule',
        message: 'Test message',
        severity: 'warning',
        filePath: '/test/file.ts',
      })

      const context = createFixContext(sourceFile, violation)

      context.getNodeByPosition(5)
      context.getNodeByRange({ start: { line: 1, column: 1 }, end: { line: 1, column: 11 } })

      expect(context.violation.ruleId).toBe('test-rule')
      expect(context.violation.message).toBe('Test message')
      expect(context.violation.severity).toBe('warning')
      expect(context.violation.filePath).toBe('/test/file.ts')
    })

    it('handles creating many contexts in sequence', () => {
      const sourceFile = createMockSourceFile()

      for (let i = 0; i < 50; i++) {
        const violation = createMockViolation({ ruleId: `rule-${i}` })
        const context = createFixContext(sourceFile, violation)
        expect(context.violation.ruleId).toBe(`rule-${i}`)
      }
    })

    it('context sourceFile reference remains stable', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const ref1 = context.sourceFile
      const ref2 = context.sourceFile

      expect(ref1).toBe(ref2)
      expect(ref1).toBe(sourceFile)
    })

    it('context violation reference remains stable', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const ref1 = context.violation
      const ref2 = context.violation

      expect(ref1).toBe(ref2)
      expect(ref1).toBe(violation)
    })

    it('handles node found by position and range pointing to same node', () => {
      const node = createMockNode({ start: 5, end: 15, text: 'target' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const byPos = context.getNodeByPosition(10)
      const byRange = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 1, column: 16 },
      })

      expect(byPos).toBe(byRange)
    })

    it('handles range spanning multiple lines with nodes at different depths', () => {
      const innerLine2 = createMockNode({ start: 12, end: 17, text: 'inner' })
      const outerSpan = createMockNode({
        start: 5,
        end: 22,
        text: 'outer\ninner\nend',
        children: [innerLine2],
      })
      const sourceFile = createSourceFileWithChildren([outerSpan])
      sourceFile.getFullText = vi.fn(() => 'startouter\ninner\nendfinish')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(14)?.getText()).toBe('inner')
    })

    it('handles context with nodes at non-overlapping ranges', () => {
      const nodeA = createMockNode({ start: 0, end: 5, text: 'A' })
      const nodeB = createMockNode({ start: 100, end: 105, text: 'B' })
      const nodeC = createMockNode({ start: 200, end: 205, text: 'C' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB, nodeC])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(2)?.getText()).toBe('A')
      expect(context.getNodeByPosition(50)).toBeUndefined()
      expect(context.getNodeByPosition(102)?.getText()).toBe('B')
      expect(context.getNodeByPosition(150)).toBeUndefined()
      expect(context.getNodeByPosition(202)?.getText()).toBe('C')
    })

    it('handles context reuse with different violation data', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'test' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation1 = createMockViolation({ ruleId: 'rule-a', severity: 'error' })
      const violation2 = createMockViolation({ ruleId: 'rule-b', severity: 'warning' })

      const context1 = createFixContext(sourceFile, violation1)
      const context2 = createFixContext(sourceFile, violation2)

      expect(context1.getNodeByPosition(5)?.getText()).toBe('test')
      expect(context2.getNodeByPosition(5)?.getText()).toBe('test')
      expect(context1.violation.severity).toBe('error')
      expect(context2.violation.severity).toBe('warning')
    })

    it('handles multiple contexts with shared children structures', () => {
      const childA = createMockNode({ start: 0, end: 5, text: 'childA' })
      const childB = createMockNode({ start: 5, end: 10, text: 'childB' })
      const sourceFile = createSourceFileWithChildren([childA, childB])
      const violation = createMockViolation()

      const context1 = createFixContext(sourceFile, violation)
      const context2 = createFixContext(sourceFile, violation)

      expect(context1.getNodeByPosition(3)?.getText()).toBe('childA')
      expect(context2.getNodeByPosition(7)?.getText()).toBe('childB')
    })

    it('handles range query returning correct node among many candidates', () => {
      const node1 = createMockNode({ start: 0, end: 3, text: 'abc' })
      const node2 = createMockNode({ start: 4, end: 7, text: 'def' })
      const node3 = createMockNode({ start: 8, end: 11, text: 'ghi' })
      const node4 = createMockNode({ start: 12, end: 15, text: 'jkl' })
      const node5 = createMockNode({ start: 16, end: 19, text: 'mno' })
      const sourceFile = createSourceFileWithChildren([node1, node2, node3, node4, node5])
      sourceFile.getFullText = vi.fn(() => 'abc def ghi jkl mno')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 9 }, end: { line: 1, column: 12 } })
          ?.getText(),
      ).toBe('ghi')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 17 }, end: { line: 1, column: 20 } })
          ?.getText(),
      ).toBe('mno')
    })

    it('handles context where getFullText returns text matching node positions exactly', () => {
      const node = createMockNode({ start: 3, end: 8, text: 'lo wo' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello world')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 4 }, end: { line: 1, column: 9 } })
          ?.getText(),
      ).toBe('lo wo')
    })

    it('handles range query with large line number clamping to text end', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => 'short') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 100, column: 1 },
        end: { line: 100, column: 2 },
      })

      expect(found).toBeUndefined()
    })

    it('handles range query with column 0 producing negative offset', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => 'hello') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 5 },
      })

      expect(found).toBeUndefined()
    })

    it('stress test: many position queries on complex tree', () => {
      const leaf1 = createMockNode({ start: 2, end: 4, text: 'l1' })
      const leaf2 = createMockNode({ start: 6, end: 8, text: 'l2' })
      const branch1 = createMockNode({ start: 0, end: 10, text: 'b1', children: [leaf1, leaf2] })
      const leaf3 = createMockNode({ start: 14, end: 16, text: 'l3' })
      const branch2 = createMockNode({ start: 12, end: 20, text: 'b2', children: [leaf3] })
      const sourceFile = createSourceFileWithChildren([branch1, branch2])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(3)?.getText()).toBe('l1')
      expect(context.getNodeByPosition(7)?.getText()).toBe('l2')
      expect(context.getNodeByPosition(1)?.getText()).toBe('b1')
      expect(context.getNodeByPosition(15)?.getText()).toBe('l3')
      expect(context.getNodeByPosition(13)?.getText()).toBe('b2')
      expect(context.getNodeByPosition(11)).toBeUndefined()
    })
  })

  describe('getNodeByPosition - Additional Coverage', () => {
    it('returns correct node when children overlap in range', () => {
      const inner = createMockNode({ start: 3, end: 7, text: 'inner' })
      const outer = createMockNode({ start: 1, end: 9, text: 'outer', children: [inner] })
      const sourceFile = createSourceFileWithChildren([outer])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('inner')
      expect(context.getNodeByPosition(2)?.getText()).toBe('outer')
    })

    it('handles position at exact start of nested child', () => {
      const child = createMockNode({ start: 10, end: 20, text: 'child' })
      const parent = createMockNode({ start: 0, end: 30, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(10)?.getText()).toBe('child')
    })

    it('handles position at exact end of nested child minus one', () => {
      const child = createMockNode({ start: 10, end: 20, text: 'child' })
      const parent = createMockNode({ start: 0, end: 30, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(19)?.getText()).toBe('child')
    })

    it('handles two children covering entire parent range', () => {
      const childA = createMockNode({ start: 0, end: 15, text: 'A' })
      const childB = createMockNode({ start: 15, end: 30, text: 'B' })
      const parent = createMockNode({
        start: 0,
        end: 30,
        text: 'parent',
        children: [childA, childB],
      })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(7)?.getText()).toBe('A')
      expect(context.getNodeByPosition(22)?.getText()).toBe('B')
      expect(context.getNodeByPosition(15)?.getText()).toBe('B')
    })

    it('handles deeply nested node where parent and child share start', () => {
      const child = createMockNode({ start: 0, end: 5, text: 'child' })
      const parent = createMockNode({ start: 0, end: 10, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(3)?.getText()).toBe('child')
      expect(context.getNodeByPosition(7)?.getText()).toBe('parent')
    })

    it('handles deeply nested node where parent and child share end', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'child' })
      const parent = createMockNode({ start: 0, end: 10, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(7)?.getText()).toBe('child')
      expect(context.getNodeByPosition(3)?.getText()).toBe('parent')
    })

    it('handles three children within parent', () => {
      const childA = createMockNode({ start: 2, end: 5, text: 'A' })
      const childB = createMockNode({ start: 8, end: 12, text: 'B' })
      const childC = createMockNode({ start: 15, end: 18, text: 'C' })
      const parent = createMockNode({
        start: 0,
        end: 20,
        text: 'P',
        children: [childA, childB, childC],
      })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(1)?.getText()).toBe('P')
      expect(context.getNodeByPosition(3)?.getText()).toBe('A')
      expect(context.getNodeByPosition(6)?.getText()).toBe('P')
      expect(context.getNodeByPosition(10)?.getText()).toBe('B')
      expect(context.getNodeByPosition(13)?.getText()).toBe('P')
      expect(context.getNodeByPosition(16)?.getText()).toBe('C')
      expect(context.getNodeByPosition(19)?.getText()).toBe('P')
    })

    it('handles node with width of exactly 1', () => {
      const node = createMockNode({ start: 5, end: 6, text: 'x' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(4)).toBeUndefined()
      expect(context.getNodeByPosition(5)?.getText()).toBe('x')
      expect(context.getNodeByPosition(6)).toBeUndefined()
    })

    it('handles node with width of exactly 2', () => {
      const node = createMockNode({ start: 5, end: 7, text: 'ab' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(5)?.getText()).toBe('ab')
      expect(context.getNodeByPosition(6)?.getText()).toBe('ab')
      expect(context.getNodeByPosition(7)).toBeUndefined()
    })

    it('returns undefined for fractional-like position at exact boundary', () => {
      const node = createMockNode({ start: 0, end: 1, text: 'a' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0)?.getText()).toBe('a')
      expect(context.getNodeByPosition(1)).toBeUndefined()
      expect(context.getNodeByPosition(2)).toBeUndefined()
    })
  })

  describe('getNodeByRange - Additional Coverage', () => {
    it('does not match when only start position matches', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 5 },
      })

      expect(found).toBeUndefined()
    })

    it('does not match when only end position matches', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 5 },
        end: { line: 1, column: 11 },
      })

      expect(found).toBeUndefined()
    })

    it('handles range matching node at end of 5-line file', () => {
      const node = createMockNode({ start: 44, end: 54, text: '0123456789' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(
        () => '0123456789\n0123456789\n0123456789\n0123456789\n0123456789',
      )
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 5, column: 1 },
        end: { line: 5, column: 11 },
      })

      expect(found?.getText()).toBe('0123456789')
    })

    it('handles range on line 2 column 5 of multi-line file', () => {
      const node = createMockNode({ start: 15, end: 20, text: '56789' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789\n0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 2, column: 5 },
        end: { line: 2, column: 10 },
      })

      expect(found?.getText()).toBe('56789')
    })

    it('handles range that spans across two sibling nodes without match', () => {
      const nodeA = createMockNode({ start: 0, end: 5, text: 'AAAAA' })
      const nodeB = createMockNode({ start: 6, end: 11, text: 'BBBBB' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      sourceFile.getFullText = vi.fn(() => 'AAAAA BBBBB')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 12 },
      })

      expect(found).toBeUndefined()
    })

    it('matches node spanning across line boundary', () => {
      const node = createMockNode({ start: 9, end: 12, text: '9\n1' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789\n12345')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 10 },
        end: { line: 2, column: 2 },
      })

      expect(found).toBeDefined()
      expect(found?.getText()).toBe('9\n1')
    })

    it('handles range with same start and end position', () => {
      const node = createMockNode({ start: 5, end: 5, text: '' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 1, column: 6 },
      })

      expect(found).toBeDefined()
    })

    it('returns undefined for range with column beyond text length', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 100 },
        end: { line: 1, column: 200 },
      })

      expect(found).toBeUndefined()
    })

    it('handles range where start and end are on different lines with no node', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => 'hello\nworld\nfoo') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 3 },
        end: { line: 2, column: 3 },
      })

      expect(found).toBeUndefined()
    })

    it('handles range on single-line file with exact match', () => {
      const node = createMockNode({ start: 0, end: 11, text: 'hello world' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello world')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 12 },
      })

      expect(found?.getText()).toBe('hello world')
    })

    it('handles range with clamped start beyond text', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => 'ab') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 5, column: 1 },
        end: { line: 5, column: 3 },
      })

      expect(found).toBeUndefined()
    })
  })

  describe('Context Properties and Behavior', () => {
    it('context has exactly 4 properties', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(Object.keys(context).sort()).toEqual([
        'getNodeByPosition',
        'getNodeByRange',
        'sourceFile',
        'violation',
      ])
    })

    it('getNodeByPosition and getNodeByRange are different functions', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition).not.toBe(context.getNodeByRange)
    })

    it('context with all violation severity levels', () => {
      const sourceFile = createMockSourceFile()

      for (const severity of ['error', 'warning', 'info'] as const) {
        const violation = createMockViolation({ severity })
        const context = createFixContext(sourceFile, violation)
        expect(context.violation.severity).toBe(severity)
      }
    })

    it('context stores range correctly from violation', () => {
      const sourceFile = createMockSourceFile()
      const violation = createMockViolation({
        range: {
          start: { line: 10, column: 20 },
          end: { line: 30, column: 40 },
        },
      })

      const context = createFixContext(sourceFile, violation)

      expect(context.violation.range.start).toEqual({ line: 10, column: 20 })
      expect(context.violation.range.end).toEqual({ line: 30, column: 40 })
    })

    it('getNodeByPosition handles fractional position within node range', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'node' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(0.5)?.getText()).toBe('node')
    })

    it('handles source file with getFullText returning empty string for range', () => {
      const sourceFile = createMockSourceFile({ getFullText: vi.fn(() => '') })
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 1 },
      })

      expect(found).toBeUndefined()
    })

    it('handles node at start of multi-line text', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello\nworld\nfoo')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found?.getText()).toBe('hello')
    })

    it('handles range where converted positions match a child in middle of parent', () => {
      const child = createMockNode({ start: 5, end: 10, text: 'inner' })
      const parent = createMockNode({ start: 0, end: 20, text: 'outer', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '01234567890123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 6 },
        end: { line: 1, column: 11 },
      })

      expect(found?.getText()).toBe('inner')
    })

    it('handles node spanning entire single-line text', () => {
      const node = createMockNode({ start: 0, end: 12, text: 'const x = 1;' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'const x = 1;')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 13 },
      })

      expect(found?.getText()).toBe('const x = 1;')
    })

    it('handles getNodeByPosition with node that has grandchildren', () => {
      const gc = createMockNode({ start: 3, end: 5, text: 'gc' })
      const child = createMockNode({ start: 2, end: 6, text: 'child', children: [gc] })
      const parent = createMockNode({ start: 0, end: 10, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(4)?.getText()).toBe('gc')
      expect(context.getNodeByPosition(1)?.getText()).toBe('parent')
      expect(context.getNodeByPosition(7)?.getText()).toBe('parent')
    })

    it('handles range query on node that exactly covers entire source text', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'hello')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(found).toBeDefined()
      expect(found?.getText()).toBe('hello')
    })

    it('handles getNodeByRange with deeply nested exact match at position 0', () => {
      const deep = createMockNode({ start: 0, end: 2, text: 'ab' })
      const mid = createMockNode({ start: 0, end: 5, text: 'abcde', children: [deep] })
      const top = createMockNode({ start: 0, end: 10, text: 'abcdefghij', children: [mid] })
      const sourceFile = createSourceFileWithChildren([top])
      sourceFile.getFullText = vi.fn(() => 'abcdefghij')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 3 },
      })

      expect(found?.getText()).toBe('ab')
    })

    it('handles getNodeByRange returning parent when no child matches', () => {
      const child = createMockNode({ start: 3, end: 7, text: 'child' })
      const parent = createMockNode({ start: 0, end: 10, text: 'parent', children: [child] })
      const sourceFile = createSourceFileWithChildren([parent])
      sourceFile.getFullText = vi.fn(() => '0123456789')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 11 },
      })

      expect(found?.getText()).toBe('parent')
    })

    it('handles multiple range queries with different matching nodes', () => {
      const n1 = createMockNode({ start: 0, end: 4, text: 'node' })
      const n2 = createMockNode({ start: 5, end: 10, text: 'node2' })
      const sourceFile = createSourceFileWithChildren([n1, n2])
      sourceFile.getFullText = vi.fn(() => 'node node2')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 1 }, end: { line: 1, column: 5 } })
          ?.getText(),
      ).toBe('node')
      expect(
        context
          .getNodeByRange({ start: { line: 1, column: 6 }, end: { line: 1, column: 11 } })
          ?.getText(),
      ).toBe('node2')
    })

    it('handles getNodeByPosition after creating multiple contexts', () => {
      const node = createMockNode({ start: 0, end: 10, text: 'shared' })
      const sourceFile = createSourceFileWithChildren([node])
      const violation = createMockViolation()

      const contexts = Array.from({ length: 5 }, () => createFixContext(sourceFile, violation))

      for (const ctx of contexts) {
        expect(ctx.getNodeByPosition(5)?.getText()).toBe('shared')
      }
    })

    it('handles getFullText called multiple times for same range query', () => {
      const node = createMockNode({ start: 0, end: 5, text: 'hello' })
      const sourceFile = createSourceFileWithChildren([node])
      const getFullTextFn = vi.fn(() => 'hello')
      sourceFile.getFullText = getFullTextFn
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      })

      expect(getFullTextFn).toHaveBeenCalled()
    })

    it('handles getNodeByPosition with two sibling nodes at adjacent positions', () => {
      const nodeA = createMockNode({ start: 0, end: 3, text: 'abc' })
      const nodeB = createMockNode({ start: 3, end: 6, text: 'def' })
      const sourceFile = createSourceFileWithChildren([nodeA, nodeB])
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      expect(context.getNodeByPosition(2)?.getText()).toBe('abc')
      expect(context.getNodeByPosition(3)?.getText()).toBe('def')
      expect(context.getNodeByPosition(5)?.getText()).toBe('def')
    })

    it('handles getNodeByRange with text containing unicode characters', () => {
      const node = createMockNode({ start: 0, end: 6, text: 'αβγδεζ' })
      const sourceFile = createSourceFileWithChildren([node])
      sourceFile.getFullText = vi.fn(() => 'αβγδεζ')
      const violation = createMockViolation()

      const context = createFixContext(sourceFile, violation)

      const found = context.getNodeByRange({
        start: { line: 1, column: 1 },
        end: { line: 1, column: 7 },
      })

      expect(found?.getText()).toBe('αβγδεζ')
    })
  })
})
