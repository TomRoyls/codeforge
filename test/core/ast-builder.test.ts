import { describe, it, expect, beforeEach } from 'vitest'
import { ASTBuilder } from '../../src/core/ast-builder/ast-builder.js'
import type { BuilderNode, BuilderOptions } from '../../src/core/ast-builder/types.js'
import { DEFAULT_BUILDER_OPTIONS } from '../../src/core/ast-builder/types.js'

describe('ASTBuilder - Node Creation', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('creates a node with type only', () => {
    const node = builder.createNode('Program')
    expect(node.type).toBe('Program')
    expect(node.id).toBeDefined()
    expect(node.id).toMatch(/^node-\d+$/)
  })

  it('creates a node with type and value', () => {
    const node = builder.createNode('Identifier', 'myVar')
    expect(node.type).toBe('Identifier')
    expect(node.value).toBe('myVar')
  })

  it('creates a node without value when undefined', () => {
    const node = builder.createNode('Expression')
    expect(node.value).toBeUndefined()
  })

  it('creates a node with empty properties object', () => {
    const node = builder.createNode('Function')
    expect(node.properties).toEqual({})
  })

  it('creates nodes with unique IDs', () => {
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    expect(a.id).not.toBe(b.id)
  })

  it('creates nodes with sequential IDs', () => {
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const numA = parseInt(a.id.split('-')[1]!, 10)
    const numB = parseInt(b.id.split('-')[1]!, 10)
    expect(numB).toBeGreaterThan(numA)
  })

  it('stores created nodes by ID', () => {
    const node = builder.createNode('Test')
    expect(builder.getNode(node.id)).toBe(node)
  })
})

describe('ASTBuilder - Custom Options', () => {
  it('uses default options when none provided', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Test')
    expect(node.id.startsWith(DEFAULT_BUILDER_OPTIONS.idPrefix)).toBe(true)
  })

  it('uses custom idPrefix', () => {
    const builder = new ASTBuilder({ idPrefix: 'ast' })
    const node = builder.createNode('Test')
    expect(node.id.startsWith('ast-')).toBe(true)
  })

  it('does not auto-range by default', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Test')
    expect(node.range).toBeUndefined()
  })

  it('auto-ranges when enabled', () => {
    const builder = new ASTBuilder({ autoRange: true })
    const node = builder.createNode('Test')
    expect(node.range).toBeDefined()
    expect(node.range!.start).toBe(0)
    expect(node.range!.end).toBe(0)
  })

  it('increments auto-range for subsequent nodes', () => {
    const builder = new ASTBuilder({ autoRange: true })
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    expect(a.range!.start).toBe(0)
    expect(b.range!.start).toBe(1)
  })
})

describe('ASTBuilder - Property Setting', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('sets a property on a node', () => {
    const node = builder.createNode('Var')
    const result = builder.setProperty(node.id, 'kind', 'const')
    expect(result.properties!['kind']).toBe('const')
  })

  it('sets multiple properties', () => {
    const node = builder.createNode('Fn')
    builder.setProperty(node.id, 'async', 'true')
    builder.setProperty(node.id, 'name', 'fetch')
    expect(result(node).properties!['async']).toBe('true')
    expect(result(node).properties!['name']).toBe('fetch')
  })

  it('overwrites existing property', () => {
    const node = builder.createNode('X')
    builder.setProperty(node.id, 'key', 'old')
    builder.setProperty(node.id, 'key', 'new')
    expect(result(node).properties!['key']).toBe('new')
  })

  it('returns the modified node', () => {
    const node = builder.createNode('Y')
    const returned = builder.setProperty(node.id, 'p', 'v')
    expect(returned.id).toBe(node.id)
  })

  it('throws for nonexistent node', () => {
    expect(() => builder.setProperty('bad-id', 'key', 'val')).toThrow('not found')
  })

  function result(n: BuilderNode): BuilderNode {
    return builder.getNode(n.id)!
  }
})

describe('ASTBuilder - Children Management', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('adds a child to a parent node', () => {
    const parent = builder.createNode('Parent')
    const child = builder.createNode('Child')
    builder.addChild(parent.id, child)
    expect(parent.children).toHaveLength(1)
    expect(parent.children![0]!.id).toBe(child.id)
  })

  it('adds multiple children', () => {
    const parent = builder.createNode('P')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    builder.addChild(parent.id, a)
    builder.addChild(parent.id, b)
    expect(parent.children).toHaveLength(2)
  })

  it('returns the child from addChild', () => {
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    const result = builder.addChild(parent.id, child)
    expect(result.id).toBe(child.id)
  })

  it('registers child node in nodes map', () => {
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    expect(builder.getNode(child.id)).toBe(child)
  })

  it('throws for nonexistent parent', () => {
    const child = builder.createNode('C')
    expect(() => builder.addChild('bad-id', child)).toThrow('not found')
  })

  it('removes a child from parent', () => {
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    const removed = builder.removeChild(parent.id, child.id)
    expect(removed).toBe(true)
    expect(parent.children).toBeUndefined()
  })

  it('returns false when removing nonexistent child', () => {
    const parent = builder.createNode('P')
    expect(builder.removeChild(parent.id, 'bad')).toBe(false)
  })

  it('returns false when removing from nonexistent parent', () => {
    expect(builder.removeChild('bad', 'bad')).toBe(false)
  })

  it('returns false when parent has no children', () => {
    const parent = builder.createNode('P')
    expect(builder.removeChild(parent.id, 'anything')).toBe(false)
  })

  it('removes only the specified child', () => {
    const parent = builder.createNode('P')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    builder.addChild(parent.id, a)
    builder.addChild(parent.id, b)
    builder.removeChild(parent.id, a.id)
    expect(parent.children).toHaveLength(1)
    expect(parent.children![0]!.id).toBe(b.id)
  })

  it('deletes removed child from nodes map', () => {
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    builder.removeChild(parent.id, child.id)
    expect(builder.getNode(child.id)).toBeUndefined()
  })
})

describe('ASTBuilder - Parent Tracking', () => {
  it('does not track parents by default', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    expect(child.parent).toBeUndefined()
  })

  it('tracks parents when enabled', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    expect(child.parent).toBe(parent)
  })

  it('tracks nested parent relationships', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    const mid = builder.createNode('Mid')
    const leaf = builder.createNode('Leaf')
    builder.addChild(root.id, mid)
    builder.addChild(mid.id, leaf)
    expect(mid.parent).toBe(root)
    expect(leaf.parent).toBe(mid)
  })
})

describe('ASTBuilder - ID Generation', () => {
  it('generates sequential IDs after clear', () => {
    const builder = new ASTBuilder()
    builder.createNode('A')
    builder.clear()
    const node = builder.createNode('B')
    const num = parseInt(node.id.split('-')[1]!, 10)
    expect(num).toBe(1)
  })

  it('uses custom prefix after construction', () => {
    const builder = new ASTBuilder({ idPrefix: 'custom' })
    const node = builder.createNode('T')
    expect(node.id).toMatch(/^custom-\d+$/)
  })

  it('IDs are unique across 100 creates', () => {
    const builder = new ASTBuilder()
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const node = builder.createNode('N')
      ids.add(node.id)
    }
    expect(ids.size).toBe(100)
  })
})

describe('ASTBuilder - Range Setting', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('sets range on a node', () => {
    const node = builder.createNode('X')
    builder.setRange(node.id, 10, 20)
    expect(node.range).toEqual({ start: 10, end: 20 })
  })

  it('returns the modified node', () => {
    const node = builder.createNode('X')
    const result = builder.setRange(node.id, 0, 5)
    expect(result.id).toBe(node.id)
  })

  it('overwrites existing range', () => {
    const node = builder.createNode('X')
    builder.setRange(node.id, 0, 5)
    builder.setRange(node.id, 10, 15)
    expect(node.range).toEqual({ start: 10, end: 15 })
  })

  it('throws for nonexistent node', () => {
    expect(() => builder.setRange('bad', 0, 5)).toThrow('not found')
  })
})

describe('ASTBuilder - Build', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('builds a deep clone of the root node', () => {
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const built = builder.build(root.id)
    expect(built).toBeDefined()
    expect(built!.type).toBe('Root')
    expect(built!.children).toHaveLength(1)
    expect(built).not.toBe(root)
  })

  it('built children are different references', () => {
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const built = builder.build(root.id)
    expect(built!.children![0]).not.toBe(child)
  })

  it('returns undefined for nonexistent root', () => {
    expect(builder.build('bad')).toBeUndefined()
  })

  it('build preserves properties', () => {
    const root = builder.createNode('R')
    builder.setProperty(root.id, 'key', 'val')
    const built = builder.build(root.id)
    expect(built!.properties!['key']).toBe('val')
  })

  it('build preserves range', () => {
    const root = builder.createNode('R')
    builder.setRange(root.id, 5, 10)
    const built = builder.build(root.id)
    expect(built!.range).toEqual({ start: 5, end: 10 })
  })

  it('build with parent tracking sets parent refs on clone', () => {
    const b = new ASTBuilder({ trackParents: true })
    const root = b.createNode('Root')
    const child = b.createNode('Child')
    b.addChild(root.id, child)
    const built = b.build(root.id)
    expect(built!.children![0]!.parent).toBe(built)
  })
})

describe('ASTBuilder - Get Node', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('returns node by id', () => {
    const node = builder.createNode('N')
    expect(builder.getNode(node.id)).toBe(node)
  })

  it('returns undefined for unknown id', () => {
    expect(builder.getNode('unknown')).toBeUndefined()
  })
})

describe('ASTBuilder - Find Node', () => {
  let builder: ASTBuilder
  let root: BuilderNode

  beforeEach(() => {
    builder = new ASTBuilder()
    root = builder.createNode('Root')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    builder.addChild(root.id, a)
    builder.addChild(root.id, b)
    builder.addChild(a.id, c)
  })

  it('finds root node by type', () => {
    const found = builder.findNode(root.id, (n) => n.type === 'Root')
    expect(found).toBeDefined()
    expect(found!.type).toBe('Root')
  })

  it('finds child node by type', () => {
    const found = builder.findNode(root.id, (n) => n.type === 'B')
    expect(found).toBeDefined()
    expect(found!.type).toBe('B')
  })

  it('finds deeply nested node', () => {
    const found = builder.findNode(root.id, (n) => n.type === 'C')
    expect(found).toBeDefined()
    expect(found!.type).toBe('C')
  })

  it('returns undefined when no match', () => {
    const found = builder.findNode(root.id, (n) => n.type === 'Missing')
    expect(found).toBeUndefined()
  })

  it('returns undefined for nonexistent root', () => {
    const found = builder.findNode('bad', () => true)
    expect(found).toBeUndefined()
  })

  it('finds by value', () => {
    const n = builder.createNode('Id', 'target')
    builder.addChild(root.id, n)
    const found = builder.findNode(root.id, (node) => node.value === 'target')
    expect(found).toBeDefined()
    expect(found!.value).toBe('target')
  })
})

describe('ASTBuilder - Get Children', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('returns children of a node', () => {
    const parent = builder.createNode('P')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    builder.addChild(parent.id, a)
    builder.addChild(parent.id, b)
    const children = builder.getChildren(parent.id)
    expect(children).toHaveLength(2)
  })

  it('returns empty array for leaf node', () => {
    const leaf = builder.createNode('Leaf')
    expect(builder.getChildren(leaf.id)).toEqual([])
  })

  it('returns empty array for nonexistent node', () => {
    expect(builder.getChildren('bad')).toEqual([])
  })

  it('returns a copy of children array', () => {
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    const children = builder.getChildren(parent.id)
    children.pop()
    expect(parent.children).toHaveLength(1)
  })
})

describe('ASTBuilder - Depth', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('returns 0 for leaf node', () => {
    const leaf = builder.createNode('Leaf')
    expect(builder.getDepth(leaf.id)).toBe(0)
  })

  it('returns 1 for node with one level of children', () => {
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    expect(builder.getDepth(parent.id)).toBe(1)
  })

  it('returns correct depth for nested tree', () => {
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    builder.addChild(a.id, b)
    builder.addChild(b.id, c)
    expect(builder.getDepth(a.id)).toBe(2)
  })

  it('returns -1 for nonexistent node', () => {
    expect(builder.getDepth('bad')).toBe(-1)
  })

  it('computes depth from deepest branch', () => {
    const root = builder.createNode('Root')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    builder.addChild(root.id, a)
    builder.addChild(root.id, b)
    builder.addChild(b.id, c)
    expect(builder.getDepth(root.id)).toBe(2)
  })
})

describe('ASTBuilder - Path', () => {
  it('returns path for node with parent tracking', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    const grandchild = builder.createNode('Grandchild')
    builder.addChild(root.id, child)
    builder.addChild(child.id, grandchild)
    const path = builder.getPath(grandchild.id)
    expect(path).toEqual(['Root', 'Child', 'Grandchild'])
  })

  it('returns single-element path for root', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    expect(builder.getPath(root.id)).toEqual(['Root'])
  })

  it('returns empty path for nonexistent node', () => {
    const builder = new ASTBuilder()
    expect(builder.getPath('bad')).toEqual([])
  })

  it('returns empty path when parent tracking is off', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const path = builder.getPath(child.id)
    expect(path).toEqual(['Child'])
  })
})

describe('ASTBuilder - Statistics', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('returns zero stats for nonexistent root', () => {
    const stats = builder.getStatistics('bad')
    expect(stats.totalNodes).toBe(0)
    expect(stats.maxDepth).toBe(0)
    expect(stats.leafCount).toBe(0)
  })

  it('counts single node', () => {
    const node = builder.createNode('Root')
    const stats = builder.getStatistics(node.id)
    expect(stats.totalNodes).toBe(1)
    expect(stats.leafCount).toBe(1)
    expect(stats.maxDepth).toBe(0)
  })

  it('counts nodes in tree', () => {
    const root = builder.createNode('Root')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    builder.addChild(root.id, a)
    builder.addChild(root.id, b)
    const stats = builder.getStatistics(root.id)
    expect(stats.totalNodes).toBe(3)
    expect(stats.leafCount).toBe(2)
    expect(stats.maxDepth).toBe(1)
  })

  it('counts node types', () => {
    const root = builder.createNode('Program')
    const fn = builder.createNode('Function')
    const id = builder.createNode('Function')
    builder.addChild(root.id, fn)
    builder.addChild(root.id, id)
    const stats = builder.getStatistics(root.id)
    expect(stats.nodeTypes['Program']).toBe(1)
    expect(stats.nodeTypes['Function']).toBe(2)
  })

  it('computes max depth correctly', () => {
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    const d = builder.createNode('D')
    builder.addChild(a.id, b)
    builder.addChild(b.id, c)
    builder.addChild(c.id, d)
    const stats = builder.getStatistics(a.id)
    expect(stats.maxDepth).toBe(3)
  })

  it('counts leaf nodes correctly', () => {
    const root = builder.createNode('R')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    builder.addChild(root.id, a)
    builder.addChild(root.id, b)
    builder.addChild(a.id, c)
    const stats = builder.getStatistics(root.id)
    expect(stats.leafCount).toBe(2)
  })
})

describe('ASTBuilder - Clone', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('clones a single node', () => {
    const node = builder.createNode('N')
    const cloned = builder.clone(node.id)
    expect(cloned).toBeDefined()
    expect(cloned!.type).toBe('N')
    expect(cloned).not.toBe(node)
  })

  it('deep clones children', () => {
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    const cloned = builder.clone(parent.id)
    expect(cloned!.children).toHaveLength(1)
    expect(cloned!.children![0]).not.toBe(child)
  })

  it('clones properties independently', () => {
    const node = builder.createNode('N')
    builder.setProperty(node.id, 'k', 'v')
    const cloned = builder.clone(node.id)
    cloned!.properties!['k'] = 'changed'
    expect(node.properties!['k']).toBe('v')
  })

  it('clones range independently', () => {
    const node = builder.createNode('N')
    builder.setRange(node.id, 0, 10)
    const cloned = builder.clone(node.id)
    cloned!.range!.start = 99
    expect(node.range!.start).toBe(0)
  })

  it('returns undefined for nonexistent node', () => {
    expect(builder.clone('bad')).toBeUndefined()
  })
})

describe('ASTBuilder - Clear', () => {
  it('clears all nodes', () => {
    const builder = new ASTBuilder()
    builder.createNode('A')
    builder.createNode('B')
    builder.clear()
    expect(builder.getNode('node-1')).toBeUndefined()
  })

  it('resets ID counter', () => {
    const builder = new ASTBuilder()
    builder.createNode('A')
    builder.clear()
    const node = builder.createNode('B')
    expect(node.id).toBe('node-1')
  })

  it('resets range counter', () => {
    const builder = new ASTBuilder({ autoRange: true })
    builder.createNode('A')
    builder.clear()
    const node = builder.createNode('B')
    expect(node.range!.start).toBe(0)
  })

  it('allows building new tree after clear', () => {
    const builder = new ASTBuilder()
    builder.createNode('Old')
    builder.clear()
    const node = builder.createNode('New')
    expect(node.type).toBe('New')
    expect(builder.getNode(node.id)).toBe(node)
  })
})

describe('ASTBuilder - Edge Cases', () => {
  it('handles empty builder with no nodes', () => {
    const builder = new ASTBuilder()
    expect(builder.build('anything')).toBeUndefined()
    expect(builder.getStatistics('anything')).toEqual({
      totalNodes: 0,
      nodeTypes: {},
      maxDepth: 0,
      leafCount: 0,
    })
  })

  it('handles null value in node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('N', undefined)
    expect(node.value).toBeUndefined()
  })

  it('handles deep tree construction', () => {
    const builder = new ASTBuilder()
    let current = builder.createNode('L0')
    const root = current
    for (let i = 1; i < 50; i++) {
      const child = builder.createNode(`L${i}`)
      builder.addChild(current.id, child)
      current = child
    }
    expect(builder.getDepth(root.id)).toBe(49)
  })

  it('handles adding same child to multiple parents', () => {
    const builder = new ASTBuilder()
    const p1 = builder.createNode('P1')
    const p2 = builder.createNode('P2')
    const child = builder.createNode('C')
    builder.addChild(p1.id, child)
    builder.addChild(p2.id, child)
    expect(p1.children).toHaveLength(1)
    expect(p2.children).toHaveLength(1)
  })

  it('handles node with many children', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    for (let i = 0; i < 100; i++) {
      builder.addChild(parent.id, builder.createNode(`C${i}`))
    }
    expect(parent.children).toHaveLength(100)
  })

  it('handles removing all children then adding again', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    const a = builder.createNode('A')
    builder.addChild(parent.id, a)
    builder.removeChild(parent.id, a.id)
    expect(parent.children).toBeUndefined()
    const b = builder.createNode('B')
    builder.addChild(parent.id, b)
    expect(parent.children).toHaveLength(1)
    expect(parent.children![0]!.id).toBe(b.id)
  })

  it('handles build on deeply nested tree', () => {
    const builder = new ASTBuilder()
    let current = builder.createNode('R')
    const rootId = current.id
    for (let i = 0; i < 20; i++) {
      const child = builder.createNode(`N${i}`)
      builder.addChild(current.id, child)
      current = child
    }
    const built = builder.build(rootId)
    expect(built).toBeDefined()
    let depth = 0
    let n = built
    while (n!.children && n!.children.length > 0) {
      n = n!.children[0]
      depth++
    }
    expect(depth).toBe(20)
  })

  it('handles getChildren after removeChild', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    builder.addChild(parent.id, a)
    builder.addChild(parent.id, b)
    builder.removeChild(parent.id, a.id)
    const children = builder.getChildren(parent.id)
    expect(children).toHaveLength(1)
    expect(children[0]!.id).toBe(b.id)
  })

  it('handles statistics on empty tree after clear', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('R')
    builder.addChild(node.id, builder.createNode('C'))
    builder.clear()
    expect(builder.getStatistics('anything').totalNodes).toBe(0)
  })

  it('handles findNode with complex predicate', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Target')
    builder.setProperty(child.id, 'role', 'main')
    builder.addChild(root.id, child)
    const found = builder.findNode(root.id, (n) => n.properties?.['role'] === 'main')
    expect(found).toBeDefined()
    expect(found!.type).toBe('Target')
  })

  it('handles setProperty creating properties object when undefined', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('N')
    const originalProps = node.properties
    if (originalProps !== undefined) {
      delete node.properties
    }
    node.properties = undefined
    builder.setProperty(node.id, 'x', 'y')
    expect(node.properties).toEqual({ x: 'y' })
  })

  it('handles tree building with fluent-style chaining', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Program')
    builder.setProperty(root.id, 'sourceType', 'module')
    const fn = builder.createNode('FunctionDeclaration', 'main')
    builder.addChild(root.id, fn)
    builder.setProperty(fn.id, 'async', 'true')
    const body = builder.createNode('BlockStatement')
    builder.addChild(fn.id, body)
    const ret = builder.createNode('ReturnStatement')
    builder.addChild(body.id, ret)
    expect(builder.getDepth(root.id)).toBe(3)
    const stats = builder.getStatistics(root.id)
    expect(stats.totalNodes).toBe(4)
  })

  it('handles getDepth with multiple branches', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('R')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    const d = builder.createNode('D')
    builder.addChild(root.id, a)
    builder.addChild(root.id, b)
    builder.addChild(a.id, c)
    builder.addChild(c.id, d)
    expect(builder.getDepth(root.id)).toBe(3)
  })

  it('handles clone of nested tree with properties', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('R')
    builder.setProperty(root.id, 'p1', 'v1')
    const child = builder.createNode('C')
    builder.setProperty(child.id, 'p2', 'v2')
    builder.addChild(root.id, child)
    const cloned = builder.clone(root.id)
    expect(cloned!.properties).toEqual({ p1: 'v1' })
    expect(cloned!.children![0]!.properties).toEqual({ p2: 'v2' })
    cloned!.properties!['p1'] = 'changed'
    expect(root.properties!['p1']).toBe('v1')
  })
})

describe('ASTBuilder - Re-exports', () => {
  it('re-exports BuilderNode type', () => {
    const builder = new ASTBuilder()
    const node: BuilderNode = builder.createNode('T')
    expect(node.type).toBe('T')
  })

  it('re-exports BuilderOptions type', () => {
    const opts: Partial<BuilderOptions> = { idPrefix: 'test' }
    const builder = new ASTBuilder(opts)
    const node = builder.createNode('N')
    expect(node.id.startsWith('test-')).toBe(true)
  })
})

describe('ASTBuilder - DEFAULT_BUILDER_OPTIONS', () => {
  it('has correct default idPrefix', () => {
    expect(DEFAULT_BUILDER_OPTIONS.idPrefix).toBe('node')
  })

  it('has trackParents false by default', () => {
    expect(DEFAULT_BUILDER_OPTIONS.trackParents).toBe(false)
  })

  it('has autoRange false by default', () => {
    expect(DEFAULT_BUILDER_OPTIONS.autoRange).toBe(false)
  })
})
