import { describe, expect, it } from 'vitest'

import { ASTDiffer } from '../../../src/core/ast-differ/ast-differ.js'
import type { ASTDiffNode } from '../../../src/core/ast-differ/types.js'

function n(type: string, value?: string, children?: ASTDiffNode[]): ASTDiffNode {
  return { type, value, children }
}

describe('ASTDiffer', () => {
  it('returns empty diff for identical trees', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(n('Program'), n('Program'))
    expect(result.operations).toHaveLength(0)
    expect(result.stats.modified).toBe(0)
  })

  it('detects added node', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, n('Function'))
    expect(result.stats.added).toBeGreaterThan(0)
    expect(result.operations.some((op) => op.type === 'add')).toBe(true)
  })

  it('detects removed node', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(n('Function'), null)
    expect(result.stats.removed).toBeGreaterThan(0)
    expect(result.operations.some((op) => op.type === 'remove')).toBe(true)
  })

  it('detects type change as removal + addition', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(n('Function'), n('Variable'))
    expect(result.stats.removed + result.stats.added).toBeGreaterThan(0)
  })

  it('detects value change', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(n('Identifier', 'foo'), n('Identifier', 'bar'))
    expect(result.stats.modified).toBeGreaterThan(0)
  })

  it('detects nested changes', () => {
    const differ = new ASTDiffer()
    const oldTree = n('Program', undefined, [n('Function', 'old')])
    const newTree = n('Program', undefined, [n('Function', 'new')])
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.modified).toBeGreaterThan(0)
  })

  it('detects added child', () => {
    const differ = new ASTDiffer()
    const oldTree = n('Program', undefined, [])
    const newTree = n('Program', undefined, [n('Function', 'added')])
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.added).toBeGreaterThan(0)
  })

  it('detects removed child', () => {
    const differ = new ASTDiffer()
    const oldTree = n('Program', undefined, [n('Function', 'removed')])
    const newTree = n('Program', undefined, [])
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.removed).toBeGreaterThan(0)
  })

  it('handles both null trees', () => {
    const differ = new ASTDiffer()
    const result = differ.diff(null, null)
    expect(result.operations).toHaveLength(0)
  })

  it('getAdditions returns add operations', () => {
    const differ = new ASTDiffer()
    differ.diff(null, n('Program', undefined, [n('A'), n('B')]))
    const additions = differ.getAdditions()
    expect(additions.length).toBeGreaterThan(0)
    expect(additions.every((op) => op.type === 'add')).toBe(true)
  })

  it('getRemovals returns remove operations', () => {
    const differ = new ASTDiffer()
    differ.diff(n('Program', undefined, [n('A')]), null)
    const removals = differ.getRemovals()
    expect(removals.every((op) => op.type === 'remove')).toBe(true)
  })

  it('getModifications returns modify operations', () => {
    const differ = new ASTDiffer()
    differ.diff(n('A', 'old'), n('A', 'new'))
    const mods = differ.getModifications()
    expect(mods.length).toBeGreaterThan(0)
  })

  it('hasChanges returns true when diff exists', () => {
    const differ = new ASTDiffer()
    differ.diff(n('A'), n('B'))
    expect(differ.hasChanges()).toBe(true)
  })

  it('hasChanges returns false for identical trees', () => {
    const differ = new ASTDiffer()
    differ.diff(n('A'), n('A'))
    expect(differ.hasChanges()).toBe(false)
  })

  it('getChangeCount returns operation count', () => {
    const differ = new ASTDiffer()
    differ.diff(n('A'), n('B'))
    expect(differ.getChangeCount()).toBeGreaterThan(0)
  })

  it('getStatistics returns stats', () => {
    const differ = new ASTDiffer()
    differ.diff(n('A'), n('B'))
    const stats = differ.getStatistics()
    expect(stats).toHaveProperty('added')
    expect(stats).toHaveProperty('removed')
    expect(stats).toHaveProperty('modified')
    expect(stats).toHaveProperty('unchanged')
  })

  it('clear resets state', () => {
    const differ = new ASTDiffer()
    differ.diff(n('A'), n('B'))
    differ.clear()
    expect(differ.getChangeCount()).toBe(0)
    const stats = differ.getStatistics()
    expect(stats.added).toBe(0)
    expect(stats.modified).toBe(0)
  })

  it('getOperations returns copy', () => {
    const differ = new ASTDiffer()
    differ.diff(n('A'), n('B'))
    const ops1 = differ.getOperations()
    const ops2 = differ.getOperations()
    expect(ops1).not.toBe(ops2)
  })

  it('handles deeply nested trees', () => {
    const differ = new ASTDiffer()
    const oldTree = n('A', undefined, [n('B', undefined, [n('C', 'old')])])
    const newTree = n('A', undefined, [n('B', undefined, [n('C', 'new')])])
    const result = differ.diff(oldTree, newTree)
    expect(result.stats.modified).toBeGreaterThan(0)
  })

  it('ignores values when configured', () => {
    const differ = new ASTDiffer({ ignoreValues: true })
    const result = differ.diff(n('A', 'old'), n('A', 'new'))
    expect(result.stats.modified).toBe(0)
  })
})
