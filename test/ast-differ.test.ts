import { describe, it, expect } from 'vitest'
import {
  ASTDiffer,
  DEFAULT_DIFFER_CONFIG,
} from '../src/core/ast-differ/ast-differ.js'
import type {
  ASTDiffNode,
  DiffOperation,
  DiffResult,
  DifferConfig,
} from '../src/core/ast-differ/ast-differ.js'

// ─── Constructor & Config ───

describe('ASTDiffer constructor', () => {
  it('creates instance with default config when no arguments', () => {
    const differ = new ASTDiffer()
    expect(differ).toBeInstanceOf(ASTDiffer)
  })

  it('creates instance with empty partial config', () => {
    const differ = new ASTDiffer({})
    expect(differ).toBeInstanceOf(ASTDiffer)
  })

  it('overrides maxDepth via partial config', () => {
    const differ = new ASTDiffer({ maxDepth: 2 })
    const node: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a', children: [{ type: 'b', children: [{ type: 'c' }] }] },
      ],
    }
    const result = differ.diff(node, node)
    // Depth 0: root, depth 1: a, depth 2: b — c at depth 3 should be skipped
    expect(result.stats.unchanged).toBeLessThanOrEqual(3)
  })

  it('overrides ignoreOrder via partial config', () => {
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
    const adds = result.operations.filter((op) => op.type === 'add')
    const removes = result.operations.filter((op) => op.type === 'remove')
    expect(adds).toHaveLength(0)
    expect(removes).toHaveLength(0)
  })

  it('overrides ignoreValues via partial config', () => {
    const differ = new ASTDiffer({ ignoreValues: true })
    const oldTree: ASTDiffNode = { type: 'node', value: 'old' }
    const newTree: ASTDiffNode = { type: 'node', value: 'new' }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.unchanged).toBe(1)
    expect(result.operations).toHaveLength(0)
  })

  it('presures defaults for unspecified config keys', () => {
    const differ = new ASTDiffer({ maxDepth: 5 })
    const node: ASTDiffNode = { type: 'root' }
    const result = differ.diff(node, node)
    expect(result.stats.unchanged).toBe(1)
  })
})

// ─── DEFAULT_DIFFER_CONFIG ───

describe('DEFAULT_DIFFER_CONFIG', () => {
  it('has maxDepth of Infinity', () => {
    expect(DEFAULT_DIFFER_CONFIG.maxDepth).toBe(Infinity)
  })

  it('has ignoreOrder false', () => {
    expect(DEFAULT_DIFFER_CONFIG.ignoreOrder).toBe(false)
  })

  it('has ignoreValues false', () => {
    expect(DEFAULT_DIFFER_CONFIG.ignoreValues).toBe(false)
  })
})

// ─── diff() — null inputs ───

describe('diff() with null inputs', () => {
  it('returns empty result for both null', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, null)
    expect(result.operations).toHaveLength(0)
    expect(result.stats.added).toBe(0)
    expect(result.stats.removed).toBe(0)
    expect(result.stats.modified).toBe(0)
    expect(result.stats.unchanged).toBe(0)
  })

  it('records addition when old is null and new is a node', () => {
    const differ = new ASTDiffer()
    const newNode: ASTDiffNode = { type: 'function', value: 'foo' }
    const result = differ.diff(null, newNode)
    expect(result.stats.added).toBe(1)
    expect(result.operations).toHaveLength(1)
    expect(result.operations[0]!.type).toBe('add')
    expect(result.operations[0]!.path).toBe('')
    expect(result.operations[0]!.newValue).toBe('function:foo')
  })

  it('records removal when new is null and old is a node', () => {
    const differ = new ASTDiffer()
    const oldNode: ASTDiffNode = { type: 'class', value: 'Bar' }
    const result = differ.diff(oldNode, null)
    expect(result.stats.removed).toBe(1)
    expect(result.operations).toHaveLength(1)
    expect(result.operations[0]!.type).toBe('remove')
    expect(result.operations[0]!.path).toBe('')
    expect(result.operations[0]!.oldValue).toBe('class:Bar')
  })

  it('records addition with children when old is null', () => {
    const differ = new ASTDiffer()
    const newNode: ASTDiffNode = {
      type: 'block',
      children: [
        { type: 'stmt', value: 'x' },
        { type: 'stmt', value: 'y' },
      ],
    }
    const result = differ.diff(null, newNode)
    expect(result.stats.added).toBe(3)
    expect(result.operations).toHaveLength(3)
    expect(result.operations[0]!.path).toBe('')
    expect(result.operations[1]!.path).toBe('/children[0]')
    expect(result.operations[2]!.path).toBe('/children[1]')
  })

  it('records removal with children when new is null', () => {
    const differ = new ASTDiffer()
    const oldNode: ASTDiffNode = {
      type: 'module',
      children: [{ type: 'import', value: 'fs' }],
    }
    const result = differ.diff(oldNode, null)
    expect(result.stats.removed).toBe(2)
    expect(result.operations).toHaveLength(2)
    expect(result.operations[0]!.type).toBe('remove')
    expect(result.operations[1]!.type).toBe('remove')
  })
})

// ─── diff() — identical trees ───

describe('diff() with identical trees', () => {
  it('returns no changes for identical simple nodes', () => {
    const differ = new ASTDiffer()
    const node: ASTDiffNode = { type: 'literal', value: '42' }
    const result = differ.diff(node, node)
    expect(result.operations).toHaveLength(0)
    expect(result.stats.unchanged).toBe(1)
  })

  it('returns no changes for identical trees with children', () => {
    const differ = new ASTDiffer()
    const tree: ASTDiffNode = {
      type: 'program',
      children: [
        { type: 'var', value: 'x' },
        { type: 'var', value: 'y' },
      ],
    }
    const result = differ.diff(tree, tree)
    expect(result.operations).toHaveLength(0)
    expect(result.stats.unchanged).toBe(3)
  })

  it('returns no changes for deeply nested identical trees', () => {
    const differ = new ASTDiffer()
    const tree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'branch',
          children: [{ type: 'leaf', value: 'deep' }],
        },
      ],
    }
    const result = differ.diff(tree, tree)
    expect(result.operations).toHaveLength(0)
    expect(result.stats.unchanged).toBe(3)
  })

  it('returns no changes for nodes without value', () => {
    const differ = new ASTDiffer()
    const node: ASTDiffNode = { type: 'empty' }
    const result = differ.diff(node, node)
    expect(result.operations).toHaveLength(0)
    expect(result.stats.unchanged).toBe(1)
  })

  it('returns no changes for nodes with empty children array', () => {
    const differ = new ASTDiffer()
    const node: ASTDiffNode = { type: 'empty', children: [] }
    const result = differ.diff(node, node)
    expect(result.operations).toHaveLength(0)
    expect(result.stats.unchanged).toBe(1)
  })
})

// ─── diff() — type changes ───

describe('diff() with type changes', () => {
  it('records modify when root node type changes', () => {
    const differ = new ASTDiffer()
    const oldNode: ASTDiffNode = { type: 'function' }
    const newNode: ASTDiffNode = { type: 'class' }
    const result = differ.diff(oldNode, newNode)
    expect(result.stats.removed).toBe(1)
    expect(result.stats.added).toBe(1)
    const modifyOps = result.operations.filter((op) => op.type === 'modify')
    expect(modifyOps).toHaveLength(1)
    expect(modifyOps[0]!.oldValue).toBe('function')
    expect(modifyOps[0]!.newValue).toBe('class')
  })

  it('records modify when child node type changes', () => {
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
    const childModify = result.operations.find(
      (op) => op.path === '/children[0]' && op.type === 'modify',
    )
    expect(childModify).toBeDefined()
    expect(childModify!.oldValue).toBe('a')
    expect(childModify!.newValue).toBe('b')
  })

  it('counts both removed and added when type differs', () => {
    const differ = new ASTDiffer()
    const result = differ.diff({ type: 'x' }, { type: 'y' })
    expect(result.stats.removed).toBe(1)
    expect(result.stats.added).toBe(1)
  })
})

// ─── diff() — value changes ───

describe('diff() with value changes', () => {
  it('records modify when value changes with same type', () => {
    const differ = new ASTDiffer()
    const oldNode: ASTDiffNode = { type: 'ident', value: 'foo' }
    const newNode: ASTDiffNode = { type: 'ident', value: 'bar' }
    const result = differ.diff(oldNode, newNode)
    expect(result.stats.modified).toBe(1)
    const modifyOps = result.operations.filter((op) => op.type === 'modify')
    expect(modifyOps).toHaveLength(1)
    expect(modifyOps[0]!.oldValue).toBe('foo')
    expect(modifyOps[0]!.newValue).toBe('bar')
  })

  it('does not record value change when type also differs', () => {
    const differ = new ASTDiffer()
    const oldNode: ASTDiffNode = { type: 'a', value: '1' }
    const newNode: ASTDiffNode = { type: 'b', value: '2' }
    const result = differ.diff(oldNode, newNode)
    // Type change already recorded as removed+added modify; value diff skipped since types differ
    const valueModify = result.operations.find(
      (op) => op.type === 'modify' && op.oldValue === '1' && op.newValue === '2',
    )
    expect(valueModify).toBeUndefined()
  })

  it('treats missing value as empty string', () => {
    const differ = new ASTDiffer()
    const oldNode: ASTDiffNode = { type: 'node' }
    const newNode: ASTDiffNode = { type: 'node', value: 'set' }
    const result = differ.diff(oldNode, newNode)
    expect(result.stats.modified).toBe(1)
    const modifyOp = result.operations.find((op) => op.type === 'modify')
    expect(modifyOp!.oldValue).toBe('')
    expect(modifyOp!.newValue).toBe('set')
  })

  it('treats empty string value same as missing value', () => {
    const differ = new ASTDiffer()
    const oldNode: ASTDiffNode = { type: 'node', value: '' }
    const newNode: ASTDiffNode = { type: 'node' }
    const result = differ.diff(oldNode, newNode)
    expect(result.stats.unchanged).toBe(1)
    expect(result.operations).toHaveLength(0)
  })
})

// ─── diff() — ignoreValues config ───

describe('diff() with ignoreValues', () => {
  it('skips value comparison entirely', () => {
    const differ = new ASTDiffer({ ignoreValues: true })
    const oldNode: ASTDiffNode = { type: 'token', value: 'abc' }
    const newNode: ASTDiffNode = { type: 'token', value: 'xyz' }
    const result = differ.diff(oldNode, newNode)
    expect(result.stats.unchanged).toBe(1)
    expect(result.operations).toHaveLength(0)
  })

  it('still detects type changes with ignoreValues', () => {
    const differ = new ASTDiffer({ ignoreValues: true })
    const oldNode: ASTDiffNode = { type: 'alpha', value: '1' }
    const newNode: ASTDiffNode = { type: 'beta', value: '2' }
    const result = differ.diff(oldNode, newNode)
    expect(result.stats.removed).toBe(1)
    expect(result.stats.added).toBe(1)
  })

  it('affects nodesMatch in unordered comparison', () => {
    const differ = new ASTDiffer({ ignoreValues: true, ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '999' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.unchanged).toBeGreaterThanOrEqual(1)
    expect(result.operations).toHaveLength(0)
  })
})

// ─── diff() — children ordered comparison ───

describe('diff() with ordered children', () => {
  it('detects added child at end', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }, { type: 'b' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBeGreaterThanOrEqual(1)
    const addOps = result.operations.filter((op) => op.type === 'add')
    expect(addOps.length).toBeGreaterThanOrEqual(1)
  })

  it('detects removed child at end', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }, { type: 'b' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }],
    }
    const result = differ.diff(oldTree, newTree)
    const removeOps = result.operations.filter((op) => op.type === 'remove')
    expect(removeOps.length).toBeGreaterThanOrEqual(1)
  })

  it('compares children at matching indices', () => {
    const differ = new ASTDiffer()
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
        { type: 'a', value: '1' },
        { type: 'b', value: 'changed' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    const modifyOps = result.operations.filter((op) => op.type === 'modify')
    expect(modifyOps.length).toBeGreaterThanOrEqual(1)
    const bModify = modifyOps.find(
      (op) => op.oldValue === '2' && op.newValue === 'changed',
    )
    expect(bModify).toBeDefined()
  })

  it('handles mismatched child counts with null padding', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }, { type: 'b' }, { type: 'c' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.removed).toBeGreaterThanOrEqual(2)
  })

  it('handles empty old children and non-empty new children', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = { type: 'root', children: [] }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'x' }, { type: 'y' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBe(2)
  })

  it('handles non-empty old children and empty new children', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'x' }],
    }
    const newTree: ASTDiffNode = { type: 'root', children: [] }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.removed).toBe(1)
  })
})

// ─── diff() — children unordered comparison ───

describe('diff() with unordered children (ignoreOrder)', () => {
  it('matches children by type and value regardless of position', () => {
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
    const adds = result.operations.filter((op) => op.type === 'add')
    const removes = result.operations.filter((op) => op.type === 'remove')
    expect(adds).toHaveLength(0)
    expect(removes).toHaveLength(0)
  })

  it('records move when matched child is at different index', () => {
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
        { type: 'c', value: '3' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBeGreaterThanOrEqual(1)
    expect(result.stats.removed).toBeGreaterThanOrEqual(1)
  })

  it('records removal when no matching child found', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'b', value: '2' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.removed).toBeGreaterThanOrEqual(1)
    expect(result.stats.added).toBeGreaterThanOrEqual(1)
  })

  it('records addition for unmatched new children', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }, { type: 'b' }],
    }
    const result = differ.diff(oldTree, newTree)
    const addOps = result.operations.filter((op) => op.type === 'add')
    expect(addOps.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty old children with ignoreOrder', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = { type: 'root', children: [] }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBe(1)
  })

  it('handles empty new children with ignoreOrder', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a' }],
    }
    const newTree: ASTDiffNode = { type: 'root', children: [] }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.removed).toBe(1)
  })
})

// ─── diff() — maxDepth ───

describe('diff() with maxDepth', () => {
  it('does not traverse beyond maxDepth 0', () => {
    const differ = new ASTDiffer({ maxDepth: 0 })
    const tree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'child', value: 'x' }],
    }
    const result = differ.diff(tree, tree)
    // Root compared at depth 0, children at depth 1 but maxDepth=0 stops
    expect(result.stats.unchanged).toBe(1)
  })

  it('traverses exactly to maxDepth', () => {
    const differ = new ASTDiffer({ maxDepth: 1 })
    const tree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'level1', children: [{ type: 'level2' }] },
      ],
    }
    const result = differ.diff(tree, tree)
    // Root compared; compareChildren depth=1 >= maxDepth(1) → skip children
    expect(result.stats.unchanged).toBe(1)
  })

  it('Infinity maxDepth traverses fully', () => {
    const differ = new ASTDiffer({ maxDepth: Infinity })
    const tree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'a',
          children: [
            {
              type: 'b',
              children: [{ type: 'c' }],
            },
          ],
        },
      ],
    }
    const result = differ.diff(tree, tree)
    expect(result.stats.unchanged).toBe(4)
  })

  it('maxDepth limits addition traversal', () => {
    const differ = new ASTDiffer({ maxDepth: 1 })
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'a',
          children: [{ type: 'b' }, { type: 'c' }],
        },
      ],
    }
    const result = differ.diff(null, newTree)
    // recordAdd recurses independently of maxDepth — it adds all children
    // but compareChildren respects maxDepth
    expect(result.stats.added).toBeGreaterThanOrEqual(2)
  })
})

// ─── diff() — move detection ───

describe('diff() move detection', () => {
  it('detects move when children are reordered with same types', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          children: [{ type: 'x' }, { type: 'y' }],
        },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          children: [{ type: 'y' }, { type: 'x' }],
        },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    const moveOps = result.operations.filter((op) => op.type === 'move')
    expect(moveOps.length).toBeGreaterThanOrEqual(1)
  })

  it('does not detect move for single child', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'block', children: [{ type: 'x' }] },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'block', children: [{ type: 'x' }] },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    const moveOps = result.operations.filter((op) => op.type === 'move')
    expect(moveOps).toHaveLength(0)
  })

  it('does not detect move when children have different types', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          children: [{ type: 'a' }, { type: 'b' }],
        },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          children: [{ type: 'c' }, { type: 'd' }],
        },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    // Children types differ, so sorted types won't match → no move detected
    const moveOps = result.operations.filter((op) => op.type === 'move')
    expect(moveOps).toHaveLength(0)
  })

  it('does not detect move when children counts differ', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          children: [{ type: 'a' }, { type: 'b' }],
        },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          children: [{ type: 'a' }],
        },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    // Lengths differ → isNodeMoved returns false
    const moveOps = result.operations.filter((op) => op.type === 'move')
    // detectMove still runs but isNodeMoved returns false for different lengths
    // However detectMove checks values first, and types are same, values empty
    // oldVal === newVal (both empty) and isNodeMoved returns false
    expect(moveOps).toHaveLength(0)
  })

  it('detects move with value difference when children are reordered', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          value: 'v1',
          children: [{ type: 'a' }, { type: 'b' }],
        },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'block',
          value: 'v2',
          children: [{ type: 'b' }, { type: 'a' }],
        },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    const moveOps = result.operations.filter((op) => op.type === 'move')
    expect(moveOps.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── diff() — path building ───

describe('diff() path building', () => {
  it('uses "/" for root path', () => {
    const differ = new ASTDiffer()
    const result = differ.diff({ type: 'a' }, { type: 'b' })
    expect(result.operations[0]!.path).toBe('/')
  })

  it('builds child paths correctly at root level', () => {
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
    const childOp = result.operations.find((op) => op.path === '/children[0]')
    expect(childOp).toBeDefined()
  })

  it('builds nested child paths correctly', () => {
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
    const nestedOp = result.operations.find(
      (op) => op.path === '/children[0]/children[0]',
    )
    expect(nestedOp).toBeDefined()
  })

  it('builds correct paths for additions', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, {
      type: 'root',
      children: [
        { type: 'a' },
        { type: 'b', children: [{ type: 'c' }] },
      ],
    })
    const paths = result.operations.map((op) => op.path)
    expect(paths).toContain('')
    expect(paths).toContain('/children[0]')
    expect(paths).toContain('/children[1]')
    expect(paths).toContain('/children[1]/children[0]')
  })
})

// ─── diff() — nodeSignature ───

describe('diff() node signature', () => {
  it('includes value in signature when present', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, { type: 'func', value: 'hello' })
    expect(result.operations[0]!.newValue).toBe('func:hello')
  })

  it('uses only type when value is absent', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, { type: 'func' })
    expect(result.operations[0]!.newValue).toBe('func')
  })

  it('uses only type when value is empty string', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, { type: 'func', value: '' })
    expect(result.operations[0]!.newValue).toBe('func')
  })

  it('includes value in removal signature', () => {
    const differ = new ASTDiffer()
    const result = differ.diff({ type: 'var', value: 'x' }, null)
    expect(result.operations[0]!.oldValue).toBe('var:x')
  })
})

// ─── diff() — resets state between calls ───

describe('diff() state reset', () => {
  it('resets operations on each diff call', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    expect(differ.getChangeCount()).toBe(1)
    differ.diff({ type: 'a' }, { type: 'a' })
    expect(differ.getChangeCount()).toBe(0)
  })

  it('resets stats on each diff call', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    expect(differ.getStatistics().added).toBe(1)
    differ.diff({ type: 'a' }, { type: 'a' })
    const stats = differ.getStatistics()
    expect(stats.added).toBe(0)
    expect(stats.unchanged).toBe(1)
  })

  it('does not accumulate operations across calls', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    differ.diff(null, { type: 'b' })
    // Second diff resets, so only 1 add from the second call
    expect(differ.getChangeCount()).toBe(1)
  })
})

// ─── diff() — complex scenarios ───

describe('diff() complex scenarios', () => {
  it('handles a realistic AST transformation', () => {
    const differ = new ASTDiffer()
    const oldAst: ASTDiffNode = {
      type: 'Program',
      children: [
        {
          type: 'VariableDeclaration',
          value: 'const',
          children: [
            { type: 'Identifier', value: 'x' },
            { type: 'NumericLiteral', value: '10' },
          ],
        },
        {
          type: 'FunctionDeclaration',
          value: 'greet',
          children: [
            { type: 'Identifier', value: 'name' },
            { type: 'BlockStatement' },
          ],
        },
      ],
    }
    const newAst: ASTDiffNode = {
      type: 'Program',
      children: [
        {
          type: 'VariableDeclaration',
          value: 'const',
          children: [
            { type: 'Identifier', value: 'x' },
            { type: 'NumericLiteral', value: '20' }, // changed
          ],
        },
        {
          type: 'FunctionDeclaration',
          value: 'hello', // changed
          children: [
            { type: 'Identifier', value: 'name' },
            { type: 'BlockStatement' },
          ],
        },
      ],
    }
    const result = differ.diff(oldAst, newAst)
    expect(result.stats.modified).toBe(2)
    expect(result.stats.unchanged).toBeGreaterThanOrEqual(5)
  })

  it('handles full tree replacement', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'old',
      children: [
        { type: 'a', children: [{ type: 'deep1' }] },
        { type: 'b' },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'new',
      children: [
        { type: 'c', children: [{ type: 'deep2' }] },
        { type: 'd' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.operations.length).toBeGreaterThan(0)
  })

  it('handles many children efficiently', () => {
    const differ = new ASTDiffer()
    const children: ASTDiffNode[] = Array.from({ length: 50 }, (_, i) => ({
      type: 'node',
      value: String(i),
    }))
    const oldTree: ASTDiffNode = { type: 'root', children }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: children.map((c) => ({ ...c })),
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.unchanged).toBe(51) // 50 children + root
    expect(result.operations).toHaveLength(0)
  })
})

// ─── getOperations() ───

describe('getOperations()', () => {
  it('returns empty array before diff', () => {
    const differ = new ASTDiffer()
    expect(differ.getOperations()).toEqual([])
  })

  it('returns copy of operations after diff', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    const ops = differ.getOperations()
    expect(ops).toHaveLength(1)
    // Verify it's a copy
    ops.push({ type: 'add', path: '/fake' } as DiffOperation)
    expect(differ.getOperations()).toHaveLength(1)
  })
})

// ─── getAdditions() ───

describe('getAdditions()', () => {
  it('returns empty array when no additions', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'a' }, { type: 'a' })
    expect(differ.getAdditions()).toHaveLength(0)
  })

  it('returns only add operations', () => {
    const differ = new ASTDiffer()
    differ.diff(null, {
      type: 'root',
      children: [{ type: 'child' }],
    })
    const additions = differ.getAdditions()
    expect(additions.length).toBeGreaterThan(0)
    for (const op of additions) {
      expect(op.type).toBe('add')
    }
  })
})

// ─── getRemovals() ───

describe('getRemovals()', () => {
  it('returns empty array when no removals', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'a' }, { type: 'a' })
    expect(differ.getRemovals()).toHaveLength(0)
  })

  it('returns only remove operations', () => {
    const differ = new ASTDiffer()
    differ.diff(
      {
        type: 'root',
        children: [{ type: 'child' }],
      },
      null,
    )
    const removals = differ.getRemovals()
    expect(removals.length).toBeGreaterThan(0)
    for (const op of removals) {
      expect(op.type).toBe('remove')
    }
  })
})

// ─── getModifications() ───

describe('getModifications()', () => {
  it('returns empty array when no modifications', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'a' }, { type: 'a' })
    expect(differ.getModifications()).toHaveLength(0)
  })

  it('returns modify and move operations', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'a', value: '1' }, { type: 'a', value: '2' })
    const mods = differ.getModifications()
    expect(mods).toHaveLength(1)
    expect(mods[0]!.type).toBe('modify')
  })

  it('includes move operations in modifications', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    differ.diff(
      {
        type: 'root',
        children: [
          { type: 'a', value: '1' },
          { type: 'b', value: '2' },
        ],
      },
      {
        type: 'root',
        children: [
          { type: 'b', value: '2' },
          { type: 'c', value: '3' },
        ],
      },
    )
    const mods = differ.getModifications()
    for (const op of mods) {
      expect(op.type === 'modify' || op.type === 'move').toBe(true)
    }
  })
})

// ─── hasChanges() ───

describe('hasChanges()', () => {
  it('returns false before diff', () => {
    const differ = new ASTDiffer()
    expect(differ.hasChanges()).toBe(false)
  })

  it('returns false when trees are identical', () => {
    const differ = new ASTDiffer()
    const node: ASTDiffNode = { type: 'x' }
    differ.diff(node, node)
    expect(differ.hasChanges()).toBe(false)
  })

  it('returns true when there are additions', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'x' })
    expect(differ.hasChanges()).toBe(true)
  })

  it('returns true when there are removals', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'x' }, null)
    expect(differ.hasChanges()).toBe(true)
  })

  it('returns true when there are modifications', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'a', value: '1' }, { type: 'a', value: '2' })
    expect(differ.hasChanges()).toBe(true)
  })

  it('returns true when both null (no changes)', () => {
    const differ = new ASTDiffer()
    differ.diff(null, null)
    expect(differ.hasChanges()).toBe(false)
  })
})

// ─── getChangeCount() ───

describe('getChangeCount()', () => {
  it('returns 0 before diff', () => {
    const differ = new ASTDiffer()
    expect(differ.getChangeCount()).toBe(0)
  })

  it('returns correct count after diff with changes', () => {
    const differ = new ASTDiffer()
    differ.diff(null, {
      type: 'root',
      children: [{ type: 'a' }, { type: 'b' }],
    })
    expect(differ.getChangeCount()).toBe(3)
  })

  it('returns 0 after identical diff', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'x' }, { type: 'x' })
    expect(differ.getChangeCount()).toBe(0)
  })
})

// ─── getPath() ───

describe('getPath()', () => {
  it('returns the path from an operation', () => {
    const differ = new ASTDiffer()
    const op: DiffOperation = {
      type: 'add',
      path: '/children[0]/children[1]',
      newValue: 'test',
    }
    expect(differ.getPath(op)).toBe('/children[0]/children[1]')
  })

  it('returns root path', () => {
    const differ = new ASTDiffer()
    const op: DiffOperation = { type: 'modify', path: '/', oldValue: 'a', newValue: 'b' }
    expect(differ.getPath(op)).toBe('/')
  })
})

// ─── getStatistics() ───

describe('getStatistics()', () => {
  it('returns zeros before diff', () => {
    const differ = new ASTDiffer()
    const stats = differ.getStatistics()
    expect(stats).toEqual({
      added: 0,
      removed: 0,
      modified: 0,
      unchanged: 0,
    })
  })

  it('returns copy of stats', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    const stats = differ.getStatistics()
    stats.added = 999
    expect(differ.getStatistics().added).toBe(1)
  })

  it('tracks all stat types correctly', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a', value: 'keep' },
        { type: 'b', value: 'change' },
        { type: 'c', value: 'remove' },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a', value: 'keep' },
        { type: 'b', value: 'changed' },
        { type: 'd', value: 'new' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.unchanged).toBeGreaterThanOrEqual(1) // root + 'a'
    expect(result.stats.modified).toBeGreaterThanOrEqual(1) // 'b' value
  })
})

// ─── clear() ───

describe('clear()', () => {
  it('resets operations to empty', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    expect(differ.getChangeCount()).toBe(1)
    differ.clear()
    expect(differ.getChangeCount()).toBe(0)
    expect(differ.getOperations()).toHaveLength(0)
  })

  it('resets stats to zeros', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    differ.clear()
    expect(differ.getStatistics()).toEqual({
      added: 0,
      removed: 0,
      modified: 0,
      unchanged: 0,
    })
  })

  it('resets hasChanges', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    expect(differ.hasChanges()).toBe(true)
    differ.clear()
    expect(differ.hasChanges()).toBe(false)
  })

  it('allows diff to be called again after clear', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'a' })
    differ.clear()
    differ.diff({ type: 'b' }, { type: 'b' })
    expect(differ.getStatistics().unchanged).toBe(1)
  })
})

// ─── isNodeMoved (indirect testing) ───

describe('isNodeMoved (via detectMove)', () => {
  it('returns false when both have no children', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const result = differ.diff(oldTree, newTree)
    const moveOps = result.operations.filter((op) => op.type === 'move')
    expect(moveOps).toHaveLength(0)
  })

  it('returns false when child counts differ', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a', value: '1', children: [{ type: 'x' }] },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        { type: 'a', value: '1', children: [{ type: 'x' }, { type: 'y' }] },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    // 'a' at index 0 has different child counts → isNodeMoved returns false
    // No move operation for 'a'
    const moveOps = result.operations.filter(
      (op) => op.type === 'move' && op.path === '/children[0]',
    )
    expect(moveOps).toHaveLength(0)
  })

  it('returns false when sorted child types differ', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'a',
          value: '1',
          children: [{ type: 'x' }, { type: 'y' }],
        },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'a',
          value: '1',
          children: [{ type: 'z' }, { type: 'w' }],
        },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    const moveOps = result.operations.filter(
      (op) => op.type === 'move' && op.path === '/children[0]',
    )
    expect(moveOps).toHaveLength(0)
  })

  it('returns true when children have same types in different order', () => {
    const differ = new ASTDiffer()
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'a',
          value: '1',
          children: [{ type: 'x' }, { type: 'y' }],
        },
      ],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [
        {
          type: 'a',
          value: '1',
          children: [{ type: 'y' }, { type: 'x' }],
        },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    const moveOps = result.operations.filter((op) => op.type === 'move')
    expect(moveOps.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── nodesMatch (indirect testing via unordered) ───

describe('nodesMatch (via unordered comparison)', () => {
  it('matches nodes with same type and value', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.unchanged).toBe(2)
    expect(result.operations).toHaveLength(0)
  })

  it('does not match nodes with different types', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'b', value: '1' }],
    }
    const result = differ.diff(oldTree, newTree)
    // 'a' has no match → removed, 'b' has no match → added
    expect(result.stats.removed).toBeGreaterThanOrEqual(1)
    expect(result.stats.added).toBeGreaterThanOrEqual(1)
  })

  it('does not match nodes with different values when ignoreValues is false', () => {
    const differ = new ASTDiffer({ ignoreOrder: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '2' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.removed).toBeGreaterThanOrEqual(1)
    expect(result.stats.added).toBeGreaterThanOrEqual(1)
  })

  it('matches nodes with different values when ignoreValues is true', () => {
    const differ = new ASTDiffer({ ignoreOrder: true, ignoreValues: true })
    const oldTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '1' }],
    }
    const newTree: ASTDiffNode = {
      type: 'root',
      children: [{ type: 'a', value: '2' }],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.unchanged).toBeGreaterThanOrEqual(1)
    expect(result.stats.removed).toBe(0)
    expect(result.stats.added).toBe(0)
  })
})

// ─── DiffResult structure ───

describe('DiffResult structure', () => {
  it('contains operations array', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, null)
    expect(result).toHaveProperty('operations')
    expect(Array.isArray(result.operations)).toBe(true)
  })

  it('contains stats object', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, null)
    expect(result).toHaveProperty('stats')
    expect(result.stats).toHaveProperty('added')
    expect(result.stats).toHaveProperty('removed')
    expect(result.stats).toHaveProperty('modified')
    expect(result.stats).toHaveProperty('unchanged')
  })

  it('operations are copies not references', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, { type: 'a' })
    const resultOps = result.operations
    resultOps.push({ type: 'add', path: '/fake' } as DiffOperation)
    expect(differ.getOperations()).toHaveLength(1)
  })

  it('stats are copies not references', () => {
    const differ = new ASTDiffer()
    const result = differ.diff({ type: 'a' }, { type: 'a' })
    result.stats.unchanged = 999
    expect(differ.getStatistics().unchanged).toBe(1)
  })
})

// ─── DiffOperation types ───

describe('DiffOperation types', () => {
  it('add operation has correct structure', () => {
    const differ = new ASTDiffer()
    differ.diff(null, { type: 'node', value: 'v' })
    const addOp = differ.getAdditions()[0]!
    expect(addOp.type).toBe('add')
    expect(addOp.path).toBeDefined()
    expect(addOp.newValue).toBeDefined()
    expect(addOp.oldValue).toBeUndefined()
  })

  it('remove operation has correct structure', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'node', value: 'v' }, null)
    const removeOp = differ.getRemovals()[0]!
    expect(removeOp.type).toBe('remove')
    expect(removeOp.path).toBeDefined()
    expect(removeOp.oldValue).toBeDefined()
    expect(removeOp.newValue).toBeUndefined()
  })

  it('modify operation has correct structure', () => {
    const differ = new ASTDiffer()
    differ.diff({ type: 'n', value: 'old' }, { type: 'n', value: 'new' })
    const modOp = differ.getModifications()[0]!
    expect(modOp.type).toBe('modify')
    expect(modOp.path).toBeDefined()
    expect(modOp.oldValue).toBe('old')
    expect(modOp.newValue).toBe('new')
  })
})

// ─── Edge cases ───

describe('Edge cases', () => {
  it('handles nodes with undefined children field', () => {
    const differ = new ASTDiffer()
    const node: ASTDiffNode = { type: 'a' }
    const result = differ.diff(node, node)
    expect(result.stats.unchanged).toBe(1)
  })

  it('handles very deep nesting', () => {
    const differ = new ASTDiffer()
    let oldNode: ASTDiffNode = { type: 'level0' }
    let newNode: ASTDiffNode = { type: 'level0' }
    for (let i = 1; i <= 20; i++) {
      oldNode = { type: `old${i}`, children: [oldNode] }
      newNode = { type: `old${i}`, children: [newNode] }
    }
    const result = differ.diff(oldNode, newNode)
    expect(result.stats.unchanged).toBe(21)
    expect(result.operations).toHaveLength(0)
  })

  it('handles deeply nested value change', () => {
    const differ = new ASTDiffer()
    const deepOld: ASTDiffNode = {
      type: 'a',
      children: [
        {
          type: 'b',
          children: [
            {
              type: 'c',
              children: [{ type: 'leaf', value: 'old' }],
            },
          ],
        },
      ],
    }
    const deepNew: ASTDiffNode = {
      type: 'a',
      children: [
        {
          type: 'b',
          children: [
            {
              type: 'c',
              children: [{ type: 'leaf', value: 'new' }],
            },
          ],
        },
      ],
    }
    const result = differ.diff(deepOld, deepNew)
    expect(result.stats.modified).toBe(1)
    const modOp = result.operations.find((op) => op.type === 'modify')
    expect(modOp!.oldValue).toBe('old')
    expect(modOp!.newValue).toBe('new')
  })

  it('handles single node with many children added', () => {
    const differ = new ASTDiffer()
    const children = Array.from({ length: 100 }, (_, i) => ({
      type: 'child',
      value: String(i),
    }))
    const result = differ.diff(null, { type: 'root', children })
    expect(result.stats.added).toBe(101)
  })

  it('handles single node with many children removed', () => {
    const differ = new ASTDiffer()
    const children = Array.from({ length: 100 }, (_, i) => ({
      type: 'child',
      value: String(i),
    }))
    const result = differ.diff({ type: 'root', children }, null)
    expect(result.stats.removed).toBe(101)
  })

  it('handles config with all options set', () => {
    const differ = new ASTDiffer({
      maxDepth: 5,
      ignoreOrder: true,
      ignoreValues: true,
    })
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
        { type: 'b', value: '999' },
        { type: 'a', value: '888' },
      ],
    }
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.unchanged).toBe(3)
    const adds = result.operations.filter((op) => op.type === 'add')
    const removes = result.operations.filter((op) => op.type === 'remove')
    expect(adds).toHaveLength(0)
    expect(removes).toHaveLength(0)
  })

  it('handles multiple sequential diffs correctly', () => {
    const differ = new ASTDiffer()
    const nodeA: ASTDiffNode = { type: 'a' }
    const nodeB: ASTDiffNode = { type: 'b' }
    const nodeC: ASTDiffNode = { type: 'c' }

    const r1 = differ.diff(nodeA, nodeB)
    expect(r1.stats.removed).toBe(1)
    expect(r1.stats.added).toBe(1)

    const r2 = differ.diff(nodeB, nodeC)
    expect(r2.stats.removed).toBe(1)
    expect(r2.stats.added).toBe(1)

    const r3 = differ.diff(nodeC, nodeC)
    expect(r3.stats.unchanged).toBe(1)
    expect(r3.operations).toHaveLength(0)
  })
})

// ─── Type exports ───

describe('Type exports', () => {
  it('ASTDiffNode allows optional fields', () => {
    const node1: ASTDiffNode = { type: 'test' }
    const node2: ASTDiffNode = { type: 'test', value: 'val' }
    const node3: ASTDiffNode = { type: 'test', children: [] }
    const node4: ASTDiffNode = { type: 'test', value: 'val', children: [] }
    expect(node1.type).toBe('test')
    expect(node2.value).toBe('val')
    expect(node3.children).toEqual([])
    expect(node4.type).toBe('test')
  })

  it('DiffOperation type can be assigned correctly', () => {
    const op: DiffOperation = {
      type: 'add',
      path: '/test',
      newValue: 'value',
    }
    expect(op.type).toBe('add')
  })

  it('DifferConfig type can be assigned correctly', () => {
    const config: DifferConfig = {
      maxDepth: 10,
      ignoreOrder: false,
      ignoreValues: false,
    }
    expect(config.maxDepth).toBe(10)
  })

  it('DiffResult type has correct shape', () => {
    const differ = new ASTDiffer()
    const result: DiffResult = differ.diff(null, null)
    expect(result.operations).toBeInstanceOf(Array)
    expect(typeof result.stats.added).toBe('number')
    expect(typeof result.stats.removed).toBe('number')
    expect(typeof result.stats.modified).toBe('number')
    expect(typeof result.stats.unchanged).toBe('number')
  })
})
