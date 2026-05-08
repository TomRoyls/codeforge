import { describe, it, expect } from 'vitest'
import { ASTDiffer } from '../../src/core/ast-differ/ast-differ.js'
import type { ASTDiffNode, DiffOperation, DiffResult, DifferConfig } from '../../src/core/ast-differ/types.js'
import { DEFAULT_DIFFER_CONFIG } from '../../src/core/ast-differ/types.js'

describe('ASTDiffer', () => {
  describe('identical trees', () => {
    it('should return no operations for identical single nodes', () => {
      const differ = new ASTDiffer()
      const node: ASTDiffNode = { type: 'literal' }
      const result = differ.diff(node, node)
      expect(result.operations).toEqual([])
      expect(result.stats.added).toBe(0)
      expect(result.stats.removed).toBe(0)
      expect(result.stats.modified).toBe(0)
    })

    it('should return no operations for identical trees with children', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = {
        type: 'program',
        children: [
          { type: 'variable', value: 'x' },
          { type: 'literal', value: '42' },
        ],
      }
      const result = differ.diff(tree, tree)
      expect(result.operations).toEqual([])
    })

    it('should count unchanged nodes for identical trees', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = {
        type: 'program',
        children: [
          { type: 'variable', value: 'x' },
          { type: 'literal', value: '42' },
        ],
      }
      const result = differ.diff(tree, tree)
      expect(result.stats.unchanged).toBeGreaterThan(0)
    })

    it('should return no operations for deeply nested identical trees', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'branch',
            children: [
              { type: 'leaf', value: 'a' },
            ],
          },
        ],
      }
      const result = differ.diff(tree, tree)
      expect(result.operations).toEqual([])
    })
  })

  describe('additions', () => {
    it('should detect a single node addition', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root' }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'new', value: 'added' }],
      }
      const result = differ.diff(oldTree, newTree)
      const adds = result.operations.filter((op) => op.type === 'add')
      expect(adds.length).toBeGreaterThan(0)
    })

    it('should record correct path for added child', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root' }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'new' }],
      }
      const result = differ.diff(oldTree, newTree)
      const addOp = result.operations.find((op) => op.type === 'add')
      expect(addOp).toBeDefined()
      expect(addOp!.path).toContain('children[0]')
    })

    it('should detect multiple additions', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root', children: [] }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [
          { type: 'a' },
          { type: 'b' },
          { type: 'c' },
        ],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.added).toBe(3)
    })

    it('should detect addition of a whole tree when old is null', () => {
      const differ = new ASTDiffer()
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'child', value: 'v' }],
      }
      const result = differ.diff(null, newTree)
      expect(result.operations.length).toBeGreaterThan(0)
      expect(result.operations[0]!.type).toBe('add')
    })

    it('should include newValue in add operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root', children: [] }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'added', value: 'val' }],
      }
      const result = differ.diff(oldTree, newTree)
      const addOp = result.operations.find((op) => op.type === 'add')
      expect(addOp!.newValue).toBeDefined()
    })

    it('should recursively add nested children', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root', children: [] }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'parent',
            children: [{ type: 'child', value: 'nested' }],
          },
        ],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.added).toBe(2)
    })
  })

  describe('removals', () => {
    it('should detect a single node removal', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'removed' }],
      }
      const newTree: ASTDiffNode = { type: 'root', children: [] }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.removed).toBe(1)
    })

    it('should record correct path for removed child', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'removed', value: 'x' }],
      }
      const newTree: ASTDiffNode = { type: 'root', children: [] }
      const result = differ.diff(oldTree, newTree)
      const removeOp = result.operations.find((op) => op.type === 'remove')
      expect(removeOp!.path).toContain('children[0]')
    })

    it('should detect multiple removals', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a' }, { type: 'b' }, { type: 'c' }],
      }
      const newTree: ASTDiffNode = { type: 'root', children: [] }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.removed).toBe(3)
    })

    it('should detect removal of whole tree when new is null', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'child' }],
      }
      const result = differ.diff(oldTree, null)
      expect(result.operations.length).toBeGreaterThan(0)
      expect(result.operations[0]!.type).toBe('remove')
    })

    it('should include oldValue in remove operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'removed', value: 'val' }],
      }
      const newTree: ASTDiffNode = { type: 'root', children: [] }
      const result = differ.diff(oldTree, newTree)
      const removeOp = result.operations.find((op) => op.type === 'remove')
      expect(removeOp!.oldValue).toBeDefined()
    })

    it('should recursively remove nested children', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'parent',
            children: [{ type: 'child', value: 'nested' }],
          },
        ],
      }
      const newTree: ASTDiffNode = { type: 'root', children: [] }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.removed).toBe(2)
    })
  })

  describe('modifications', () => {
    it('should detect value change as modification', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'literal', value: 'old' }
      const newTree: ASTDiffNode = { type: 'literal', value: 'new' }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.modified).toBe(1)
    })

    it('should detect type change as modification', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'string' }
      const newTree: ASTDiffNode = { type: 'number' }
      const result = differ.diff(oldTree, newTree)
      expect(result.operations.some((op) => op.type === 'modify')).toBe(true)
    })

    it('should include oldValue and newValue in modify operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'literal', value: 'before' }
      const newTree: ASTDiffNode = { type: 'literal', value: 'after' }
      const result = differ.diff(oldTree, newTree)
      const modOp = result.operations.find((op) => op.type === 'modify')
      expect(modOp!.oldValue).toBe('before')
      expect(modOp!.newValue).toBe('after')
    })

    it('should detect modification in nested child', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'child', value: 'original' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'child', value: 'changed' }],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.modified).toBe(1)
    })

    it('should not detect modification when only children differ', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'b' }],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.unchanged).toBeGreaterThan(0)
    })
  })

  describe('nested changes', () => {
    it('should detect changes at multiple nesting levels', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'branch',
            children: [{ type: 'leaf', value: 'old' }],
          },
        ],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'branch',
            children: [{ type: 'leaf', value: 'new' }],
          },
        ],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.modified).toBe(1)
    })

    it('should detect mix of adds and removes in children', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a' }, { type: 'b' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a' }, { type: 'c' }, { type: 'd' }],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.added).toBeGreaterThan(0)
      expect(result.stats.removed).toBeGreaterThan(0)
    })

    it('should handle deeply nested additions', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'a',
            children: [{ type: 'deep', value: 'nested' }],
          },
        ],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.added).toBe(1)
    })
  })

  describe('move detection', () => {
    it('should detect move when children are reordered', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [
          { type: 'container', children: [{ type: 'x' }, { type: 'y' }] },
        ],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [
          { type: 'container', children: [{ type: 'y' }, { type: 'x' }] },
        ],
      }
      const result = differ.diff(oldTree, newTree)
      const moves = result.operations.filter((op) => op.type === 'move')
      expect(moves.length).toBeGreaterThan(0)
    })

    it('should detect move with ignoreOrder enabled', () => {
      const differ = new ASTDiffer({ ignoreOrder: true })
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: '1' }, { type: 'b', value: '2' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'b', value: '2' }, { type: 'a', value: '1' }],
      }
      const result = differ.diff(oldTree, newTree)
      const moves = result.operations.filter((op) => op.type === 'move')
      expect(moves.length).toBeGreaterThan(0)
    })

    it('should not detect move for identical order', () => {
      const differ = new ASTDiffer({ ignoreOrder: true })
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: '1' }, { type: 'b', value: '2' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: '1' }, { type: 'b', value: '2' }],
      }
      const result = differ.diff(oldTree, newTree)
      const moves = result.operations.filter((op) => op.type === 'move')
      expect(moves).toEqual([])
    })
  })

  describe('order-sensitive comparison', () => {
    it('should detect changes when children order differs in ordered mode', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: '1' }, { type: 'b', value: '2' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'b', value: '2' }, { type: 'a', value: '1' }],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.operations.length).toBeGreaterThan(0)
    })

    it('should treat same children in same order as unchanged', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: '1' }, { type: 'b', value: '2' }],
      }
      const result = differ.diff(tree, tree)
      expect(result.operations).toEqual([])
    })
  })

  describe('path tracking', () => {
    it('should use "/" for root path', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'a' }
      const newTree: ASTDiffNode = { type: 'b' }
      const result = differ.diff(oldTree, newTree)
      expect(result.operations[0]!.path).toBe('/')
    })

    it('should build path for nested changes', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'child', value: 'old' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'child', value: 'new' }],
      }
      const result = differ.diff(oldTree, newTree)
      const modOp = result.operations.find((op) => op.type === 'modify')
      expect(modOp!.path).toBe('/children[0]')
    })

    it('should build deep paths correctly', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'a',
            children: [{ type: 'leaf', value: 'old' }],
          },
        ],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [
          {
            type: 'a',
            children: [{ type: 'leaf', value: 'new' }],
          },
        ],
      }
      const result = differ.diff(oldTree, newTree)
      const modOp = result.operations.find((op) => op.type === 'modify')
      expect(modOp!.path).toBe('/children[0]/children[0]')
    })
  })

  describe('statistics', () => {
    it('should compute correct statistics for mixed operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: '1' }, { type: 'b' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: 'changed' }, { type: 'c' }],
      }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.modified).toBeGreaterThan(0)
      expect(result.stats.added + result.stats.removed + result.stats.modified + result.stats.unchanged).toBeGreaterThan(0)
    })

    it('should return zero stats for identical trees', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = { type: 'root', value: 'same' }
      const result = differ.diff(tree, tree)
      expect(result.stats.added).toBe(0)
      expect(result.stats.removed).toBe(0)
      expect(result.stats.modified).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle both null trees', () => {
      const differ = new ASTDiffer()
      const result = differ.diff(null, null)
      expect(result.operations).toEqual([])
      expect(result.stats.added).toBe(0)
      expect(result.stats.removed).toBe(0)
    })

    it('should handle empty trees with no children', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = { type: 'empty' }
      const result = differ.diff(tree, tree)
      expect(result.operations).toEqual([])
    })

    it('should handle single node trees', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'single', value: 'a' }
      const newTree: ASTDiffNode = { type: 'single', value: 'b' }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.modified).toBe(1)
    })

    it('should handle deep nesting', () => {
      const differ = new ASTDiffer()
      const buildTree = (depth: number): ASTDiffNode => {
        if (depth === 0) return { type: 'leaf', value: 'bottom' }
        return { type: `level${depth}`, children: [buildTree(depth - 1)] }
      }
      const oldTree = buildTree(5)
      const newTree = buildTree(5)
      const result = differ.diff(oldTree, newTree)
      expect(result.operations).toEqual([])
    })

    it('should handle deep nesting with change at bottom', () => {
      const differ = new ASTDiffer()
      const buildTree = (depth: number, val: string): ASTDiffNode => {
        if (depth === 0) return { type: 'leaf', value: val }
        return { type: `level${depth}`, children: [buildTree(depth - 1, val)] }
      }
      const result = differ.diff(buildTree(5, 'old'), buildTree(5, 'new'))
      expect(result.stats.modified).toBe(1)
    })

    it('should handle null children arrays', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root' }
      const newTree: ASTDiffNode = { type: 'root' }
      const result = differ.diff(oldTree, newTree)
      expect(result.operations).toEqual([])
    })

    it('should handle one tree with children and one without', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root' }
      const newTree: ASTDiffNode = { type: 'root', children: [{ type: 'new' }] }
      const result = differ.diff(oldTree, newTree)
      expect(result.stats.added).toBe(1)
    })

    it('should handle nodes with empty string values', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'node', value: '' }
      const newTree: ASTDiffNode = { type: 'node', value: '' }
      const result = differ.diff(oldTree, newTree)
      expect(result.operations).toEqual([])
    })

    it('should handle nodes with undefined values', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'node' }
      const newTree: ASTDiffNode = { type: 'node' }
      const result = differ.diff(oldTree, newTree)
      expect(result.operations).toEqual([])
    })
  })

  describe('config options', () => {
    describe('maxDepth', () => {
      it('should respect maxDepth limit', () => {
        const differ = new ASTDiffer({ maxDepth: 1 })
        const oldTree: ASTDiffNode = {
          type: 'root',
          children: [
            {
              type: 'a',
              children: [{ type: 'deep', value: 'old' }],
            },
          ],
        }
        const newTree: ASTDiffNode = {
          type: 'root',
          children: [
            {
              type: 'a',
              children: [{ type: 'deep', value: 'new' }],
            },
          ],
        }
        const result = differ.diff(oldTree, newTree)
        const deepMod = result.operations.find(
          (op) => op.path.includes('children[0]/children[0]'),
        )
        expect(deepMod).toBeUndefined()
      })

      it('should not limit depth when maxDepth is Infinity', () => {
        const differ = new ASTDiffer()
        const buildTree = (depth: number, val: string): ASTDiffNode => {
          if (depth === 0) return { type: 'leaf', value: val }
          return { type: `level${depth}`, children: [buildTree(depth - 1, val)] }
        }
        const result = differ.diff(buildTree(10, 'a'), buildTree(10, 'b'))
        expect(result.stats.modified).toBe(1)
      })
    })

    describe('ignoreOrder', () => {
      it('should not detect changes for reordered identical children when ignoreOrder is true', () => {
        const differ = new ASTDiffer({ ignoreOrder: true })
        const oldTree: ASTDiffNode = {
          type: 'root',
          children: [
            { type: 'a', value: '1' },
            { type: 'b', value: '2' },
          ],
        }
        const newTree: ASTDiffNode = {
          type: 'root',
          children: [
            { type: 'b', value: '2' },
            { type: 'a', value: '1' },
          ],
        }
        const result = differ.diff(oldTree, newTree)
        const moves = result.operations.filter((op) => op.type === 'move')
        expect(moves.length).toBeGreaterThan(0)
      })

      it('should detect changes for reordered children when ignoreOrder is false', () => {
        const differ = new ASTDiffer({ ignoreOrder: false })
        const oldTree: ASTDiffNode = {
          type: 'root',
          children: [
            { type: 'a', value: '1' },
            { type: 'b', value: '2' },
          ],
        }
        const newTree: ASTDiffNode = {
          type: 'root',
          children: [
            { type: 'b', value: '2' },
            { type: 'a', value: '1' },
          ],
        }
        const result = differ.diff(oldTree, newTree)
        expect(result.operations.length).toBeGreaterThan(0)
      })

      it('should match children by type and value when ignoreOrder is true', () => {
        const differ = new ASTDiffer({ ignoreOrder: true })
        const oldTree: ASTDiffNode = {
          type: 'root',
          children: [{ type: 'a', value: '1' }, { type: 'b', value: '2' }],
        }
        const newTree: ASTDiffNode = {
          type: 'root',
          children: [{ type: 'b', value: '2' }, { type: 'a', value: '1' }],
        }
        const result = differ.diff(oldTree, newTree)
        expect(result.stats.added).toBe(0)
        expect(result.stats.removed).toBe(0)
      })
    })

    describe('ignoreValues', () => {
      it('should ignore value differences when ignoreValues is true', () => {
        const differ = new ASTDiffer({ ignoreValues: true })
        const oldTree: ASTDiffNode = { type: 'literal', value: 'old' }
        const newTree: ASTDiffNode = { type: 'literal', value: 'new' }
        const result = differ.diff(oldTree, newTree)
        expect(result.stats.modified).toBe(0)
      })

      it('should detect value differences when ignoreValues is false', () => {
        const differ = new ASTDiffer({ ignoreValues: false })
        const oldTree: ASTDiffNode = { type: 'literal', value: 'old' }
        const newTree: ASTDiffNode = { type: 'literal', value: 'new' }
        const result = differ.diff(oldTree, newTree)
        expect(result.stats.modified).toBe(1)
      })

      it('should still detect type changes when ignoreValues is true', () => {
        const differ = new ASTDiffer({ ignoreValues: true })
        const oldTree: ASTDiffNode = { type: 'string' }
        const newTree: ASTDiffNode = { type: 'number' }
        const result = differ.diff(oldTree, newTree)
        expect(result.operations.some((op) => op.type === 'modify')).toBe(true)
      })
    })
  })

  describe('clear', () => {
    it('should clear all operations and stats', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'a' }
      const newTree: ASTDiffNode = { type: 'b' }
      differ.diff(oldTree, newTree)
      expect(differ.hasChanges()).toBe(true)

      differ.clear()
      expect(differ.getOperations()).toEqual([])
      expect(differ.hasChanges()).toBe(false)
      expect(differ.getChangeCount()).toBe(0)
      const stats = differ.getStatistics()
      expect(stats.added).toBe(0)
      expect(stats.removed).toBe(0)
      expect(stats.modified).toBe(0)
      expect(stats.unchanged).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const differ = new ASTDiffer()
      differ.diff({ type: 'a' }, { type: 'b' })
      differ.clear()

      const result = differ.diff({ type: 'x' }, { type: 'x' })
      expect(result.operations).toEqual([])
      expect(result.stats.modified).toBe(0)
    })
  })

  describe('hasChanges', () => {
    it('should return true when there are changes', () => {
      const differ = new ASTDiffer()
      differ.diff({ type: 'a' }, { type: 'b' })
      expect(differ.hasChanges()).toBe(true)
    })

    it('should return false when there are no changes', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = { type: 'same' }
      differ.diff(tree, tree)
      expect(differ.hasChanges()).toBe(false)
    })

    it('should return false after clear', () => {
      const differ = new ASTDiffer()
      differ.diff({ type: 'a' }, { type: 'b' })
      differ.clear()
      expect(differ.hasChanges()).toBe(false)
    })
  })

  describe('getChangeCount', () => {
    it('should return 0 for identical trees', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = { type: 'same' }
      differ.diff(tree, tree)
      expect(differ.getChangeCount()).toBe(0)
    })

    it('should count all operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'a', value: '1' }],
      }
      const newTree: ASTDiffNode = {
        type: 'root',
        children: [{ type: 'b' }, { type: 'c' }],
      }
      differ.diff(oldTree, newTree)
      expect(differ.getChangeCount()).toBeGreaterThan(0)
    })
  })

  describe('getPath', () => {
    it('should return path from operation', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'a' }
      const newTree: ASTDiffNode = { type: 'b' }
      const result = differ.diff(oldTree, newTree)
      if (result.operations.length > 0) {
        expect(differ.getPath(result.operations[0]!)).toBe('/')
      }
    })
  })

  describe('getStatistics', () => {
    it('should return current stats snapshot', () => {
      const differ = new ASTDiffer()
      differ.diff({ type: 'a' }, { type: 'b' })
      const stats = differ.getStatistics()
      expect(stats).toBeDefined()
      expect(stats.added).toBeDefined()
      expect(stats.removed).toBeDefined()
      expect(stats.modified).toBeDefined()
      expect(stats.unchanged).toBeDefined()
    })

    it('should return independent copy', () => {
      const differ = new ASTDiffer()
      differ.diff({ type: 'a' }, { type: 'b' })
      const stats1 = differ.getStatistics()
      const stats2 = differ.getStatistics()
      expect(stats1).toEqual(stats2)
      stats1.added = 999
      expect(differ.getStatistics().added).not.toBe(999)
    })
  })

  describe('getAdditions', () => {
    it('should return only add operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root', children: [] }
      const newTree: ASTDiffNode = { type: 'root', children: [{ type: 'new' }] }
      differ.diff(oldTree, newTree)
      const additions = differ.getAdditions()
      expect(additions.every((op) => op.type === 'add')).toBe(true)
    })
  })

  describe('getRemovals', () => {
    it('should return only remove operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'root', children: [{ type: 'old' }] }
      const newTree: ASTDiffNode = { type: 'root', children: [] }
      differ.diff(oldTree, newTree)
      const removals = differ.getRemovals()
      expect(removals.every((op) => op.type === 'remove')).toBe(true)
    })
  })

  describe('getModifications', () => {
    it('should return modify and move operations', () => {
      const differ = new ASTDiffer()
      const oldTree: ASTDiffNode = { type: 'a', value: 'old' }
      const newTree: ASTDiffNode = { type: 'a', value: 'new' }
      differ.diff(oldTree, newTree)
      const mods = differ.getModifications()
      expect(mods.every((op) => op.type === 'modify' || op.type === 'move')).toBe(true)
    })
  })

  describe('getOperations', () => {
    it('should return a copy of operations', () => {
      const differ = new ASTDiffer()
      differ.diff({ type: 'a' }, { type: 'b' })
      const ops1 = differ.getOperations()
      const ops2 = differ.getOperations()
      expect(ops1).toEqual(ops2)
      expect(ops1).not.toBe(ops2)
    })
  })

  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const differ = new ASTDiffer()
      const tree: ASTDiffNode = { type: 'root' }
      const result = differ.diff(tree, tree)
      expect(result).toBeDefined()
    })

    it('should merge partial config with defaults', () => {
      const differ = new ASTDiffer({ maxDepth: 5 })
      const tree: ASTDiffNode = { type: 'root' }
      const result = differ.diff(tree, tree)
      expect(result).toBeDefined()
    })
  })
})

describe('DEFAULT_DIFFER_CONFIG', () => {
  it('should have maxDepth set to Infinity', () => {
    expect(DEFAULT_DIFFER_CONFIG.maxDepth).toBe(Infinity)
  })

  it('should have ignoreOrder set to false', () => {
    expect(DEFAULT_DIFFER_CONFIG.ignoreOrder).toBe(false)
  })

  it('should have ignoreValues set to false', () => {
    expect(DEFAULT_DIFFER_CONFIG.ignoreValues).toBe(false)
  })
})

describe('DiffResult', () => {
  it('should have operations array', () => {
    const differ = new ASTDiffer()
    const result = differ.diff({ type: 'a' }, { type: 'b' })
    expect(Array.isArray(result.operations)).toBe(true)
  })

  it('should have stats object', () => {
    const differ = new ASTDiffer()
    const result = differ.diff({ type: 'a' }, { type: 'b' })
    expect(result.stats).toBeDefined()
    expect(typeof result.stats.added).toBe('number')
    expect(typeof result.stats.removed).toBe('number')
    expect(typeof result.stats.modified).toBe('number')
    expect(typeof result.stats.unchanged).toBe('number')
  })
})

describe('DiffOperation', () => {
  it('should have valid operation types', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'b' }, { type: 'c' }],
    }
    const result = differ.diff(oldTree, newTree)
    for (const op of result.operations) {
      expect(['add', 'remove', 'modify', 'move']).toContain(op.type)
      expect(typeof op.path).toBe('string')
    }
  })
})

describe('Additional edge cases', () => {
  it('should handle null to null comparison', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, null)
    expect(result.operations).toEqual([])
    expect(result.stats.added).toBe(0)
    expect(result.stats.removed).toBe(0)
    expect(result.stats.modified).toBe(0)
    expect(result.stats.unchanged).toBe(0)
  })

  it('should handle tree with many children being removed', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a' },
        { type: 'b' },
        { type: 'c' },
        { type: 'd' },
        { type: 'e' },
      ],
    }
    const newTree: ASTDiffNode = { type: 'root', children: [] }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.removed).toBe(5)
  })

  it('should handle tree with many children being added', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = { type: 'root', children: [] }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a' },
        { type: 'b' },
        { type: 'c' },
        { type: 'd' },
        { type: 'e' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBe(5)
  })

  it('should handle partial child overlap in ordered mode', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a', value: '1' },
        { type: 'b', value: '2' },
        { type: 'c', value: '3' },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a', value: '1' },
        { type: 'b', value: 'changed' },
        { type: 'd' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.modified).toBeGreaterThan(0)
    expect(result.stats.added).toBeGreaterThan(0)
    expect(result.stats.removed).toBeGreaterThan(0)
  })

  it('should handle ignoreOrder with some matching and some new children', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }, { type: 'b', value: '2' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'b', value: '2' }, { type: 'c', value: '3' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBeGreaterThan(0)
    expect(result.stats.removed).toBeGreaterThan(0)
  })

  it('should handle ignoreOrder with reordered identical children', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'x', value: '1' },
        { type: 'y', value: '2' },
        { type: 'z', value: '3' },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'z', value: '3' },
        { type: 'x', value: '1' },
        { type: 'y', value: '2' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBe(0)
    expect(result.stats.removed).toBe(0)
  })

  it('should handle node value changing from undefined to defined', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = { type: 'node' }
    const newTree: ASTDiffNode = { type: 'node', value: 'new' }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.modified).toBe(1)
  })

  it('should handle node value changing from defined to undefined', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = { type: 'node', value: 'old' }
    const newTree: ASTDiffNode = { type: 'node' }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.modified).toBe(1)
  })

  it('should correctly produce independent DiffResult per diff call', () => {
    const differ = new ASTDiffer()
    const result1 = differ.diff({ type: 'a' }, { type: 'b' })
    const result2 = differ.diff({ type: 'x' }, { type: 'x' })
    expect(result1.operations.length).toBeGreaterThan(0)
    expect(result2.operations).toEqual([])
  })
})
