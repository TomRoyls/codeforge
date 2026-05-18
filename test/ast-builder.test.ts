import { describe, it, expect, beforeEach } from 'vitest'
import { ASTBuilder } from '../src/core/ast-builder/ast-builder.js'
import { DEFAULT_BUILDER_OPTIONS } from '../src/core/ast-builder/types.js'
import type { BuilderNode, BuilderOptions } from '../src/core/ast-builder/types.js'

// ─── Constructor ───

describe('ASTBuilder constructor', () => {
  it('creates instance with default options', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('test')
    expect(node.id).toBe('node-1')
  })

  it('uses DEFAULT_BUILDER_OPTIONS values', () => {
    expect(DEFAULT_BUILDER_OPTIONS.idPrefix).toBe('node')
    expect(DEFAULT_BUILDER_OPTIONS.trackParents).toBe(false)
    expect(DEFAULT_BUILDER_OPTIONS.autoRange).toBe(false)
  })

  it('accepts custom idPrefix', () => {
    const builder = new ASTBuilder({ idPrefix: 'expr' })
    const node = builder.createNode('literal')
    expect(node.id).toBe('expr-1')
  })

  it('accepts trackParents option', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const parent = builder.createNode('root')
    const child = builder.createNode('leaf')
    builder.addChild(parent.id, child)
    expect(child.parent).toBeDefined()
    expect(child.parent?.id).toBe(parent.id)
  })

  it('accepts autoRange option', () => {
    const builder = new ASTBuilder({ autoRange: true })
    const node = builder.createNode('test')
    expect(node.range).toEqual({ start: 0, end: 0 })
  })

  it('accepts all options combined', () => {
    const builder = new ASTBuilder({
      idPrefix: 'stmt',
      trackParents: true,
      autoRange: true,
    })
    const node = builder.createNode('return')
    expect(node.id).toBe('stmt-1')
    expect(node.range).toEqual({ start: 0, end: 0 })
  })

  it('accepts empty partial options', () => {
    const builder = new ASTBuilder({})
    const node = builder.createNode('test')
    expect(node.id).toBe('node-1')
  })

  it('does not mutate DEFAULT_BUILDER_OPTIONS', () => {
    new ASTBuilder({ idPrefix: 'custom' })
    expect(DEFAULT_BUILDER_OPTIONS.idPrefix).toBe('node')
  })
})

// ─── createNode ───

describe('ASTBuilder.createNode', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('creates a node with a type', () => {
    const node = builder.createNode('Identifier')
    expect(node.type).toBe('Identifier')
  })

  it('creates a node with type and value', () => {
    const node = builder.createNode('StringLiteral', 'hello')
    expect(node.value).toBe('hello')
  })

  it('creates node with undefined value when not provided', () => {
    const node = builder.createNode('Block')
    expect(node.value).toBeUndefined()
  })

  it('generates sequential IDs', () => {
    const n1 = builder.createNode('A')
    const n2 = builder.createNode('B')
    const n3 = builder.createNode('C')
    expect(n1.id).toBe('node-1')
    expect(n2.id).toBe('node-2')
    expect(n3.id).toBe('node-3')
  })

  it('initializes properties as empty object', () => {
    const node = builder.createNode('X')
    expect(node.properties).toEqual({})
  })

  it('does not set range when autoRange is false', () => {
    const node = builder.createNode('X')
    expect(node.range).toBeUndefined()
  })

  it('sets range when autoRange is true', () => {
    const autoBuilder = new ASTBuilder({ autoRange: true })
    const n1 = autoBuilder.createNode('A')
    const n2 = autoBuilder.createNode('B')
    expect(n1.range).toEqual({ start: 0, end: 0 })
    expect(n2.range).toEqual({ start: 1, end: 1 })
  })

  it('does not set children on new node', () => {
    const node = builder.createNode('X')
    expect(node.children).toBeUndefined()
  })

  it('does not set parent on new node', () => {
    const node = builder.createNode('X')
    expect(node.parent).toBeUndefined()
  })

  it('registers node so getNode returns it', () => {
    const node = builder.createNode('X')
    expect(builder.getNode(node.id)).toBe(node)
  })

  it('creates distinct object references', () => {
    const n1 = builder.createNode('X')
    const n2 = builder.createNode('X')
    expect(n1).not.toBe(n2)
  })
})

// ─── setProperty ───

describe('ASTBuilder.setProperty', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('sets a property on an existing node', () => {
    const node = builder.createNode('Function')
    const result = builder.setProperty(node.id, 'name', 'foo')
    expect(result.properties?.['name']).toBe('foo')
  })

  it('returns the updated node', () => {
    const node = builder.createNode('Function')
    const result = builder.setProperty(node.id, 'name', 'foo')
    expect(result.id).toBe(node.id)
  })

  it('overwrites an existing property', () => {
    const node = builder.createNode('Function')
    builder.setProperty(node.id, 'name', 'foo')
    builder.setProperty(node.id, 'name', 'bar')
    expect(node.properties?.['name']).toBe('bar')
  })

  it('sets multiple properties on the same node', () => {
    const node = builder.createNode('Function')
    builder.setProperty(node.id, 'name', 'foo')
    builder.setProperty(node.id, 'async', 'true')
    expect(node.properties?.['name']).toBe('foo')
    expect(node.properties?.['async']).toBe('true')
  })

  it('throws if node does not exist', () => {
    expect(() => builder.setProperty('nonexistent', 'k', 'v')).toThrow(
      'Node with id "nonexistent" not found',
    )
  })

  it('initializes properties if undefined', () => {
    const node = builder.createNode('X')
    node.properties = undefined
    builder.setProperty(node.id, 'key', 'val')
    expect(node.properties).toEqual({ key: 'val' })
  })
})

// ─── addChild ───

describe('ASTBuilder.addChild', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('adds a child to a parent node', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Statement')
    const result = builder.addChild(parent.id, child)
    expect(result.id).toBe(child.id)
    expect(parent.children).toHaveLength(1)
    expect(parent.children?.[0]?.id).toBe(child.id)
  })

  it('returns the child node', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Statement')
    const result = builder.addChild(parent.id, child)
    expect(result).toBe(child)
  })

  it('initializes children array if undefined', () => {
    const parent = builder.createNode('Program')
    expect(parent.children).toBeUndefined()
    const child = builder.createNode('Statement')
    builder.addChild(parent.id, child)
    expect(parent.children).toBeDefined()
    expect(parent.children).toHaveLength(1)
  })

  it('registers the child in the internal map', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Statement')
    builder.addChild(parent.id, child)
    expect(builder.getNode(child.id)).toBeDefined()
  })

  it('sets parent reference when trackParents is true', () => {
    const tpBuilder = new ASTBuilder({ trackParents: true })
    const parent = tpBuilder.createNode('Program')
    const child = tpBuilder.createNode('Statement')
    tpBuilder.addChild(parent.id, child)
    expect(child.parent).toBeDefined()
    expect(child.parent?.id).toBe(parent.id)
  })

  it('does not set parent reference when trackParents is false', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Statement')
    builder.addChild(parent.id, child)
    expect(child.parent).toBeUndefined()
  })

  it('throws if parent does not exist', () => {
    const child = builder.createNode('Statement')
    expect(() => builder.addChild('nonexistent', child)).toThrow(
      'Node with id "nonexistent" not found',
    )
  })

  it('adds multiple children to same parent', () => {
    const parent = builder.createNode('Program')
    const c1 = builder.createNode('A')
    const c2 = builder.createNode('B')
    const c3 = builder.createNode('C')
    builder.addChild(parent.id, c1)
    builder.addChild(parent.id, c2)
    builder.addChild(parent.id, c3)
    expect(parent.children).toHaveLength(3)
  })

  it('updates parent references recursively for nested children', () => {
    const tpBuilder = new ASTBuilder({ trackParents: true })
    const root = tpBuilder.createNode('Root')
    const mid = tpBuilder.createNode('Mid')
    const leaf = tpBuilder.createNode('Leaf')

    tpBuilder.addChild(mid.id, leaf)
    tpBuilder.addChild(root.id, mid)

    expect(mid.parent?.id).toBe(root.id)
    expect(leaf.parent?.id).toBe(mid.id)
  })
})

// ─── removeChild ───

describe('ASTBuilder.removeChild', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('removes an existing child and returns true', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Stmt')
    builder.addChild(parent.id, child)
    const result = builder.removeChild(parent.id, child.id)
    expect(result).toBe(true)
    expect(parent.children).toBeUndefined()
  })

  it('removes child from children array', () => {
    const parent = builder.createNode('Program')
    const c1 = builder.createNode('A')
    const c2 = builder.createNode('B')
    const c3 = builder.createNode('C')
    builder.addChild(parent.id, c1)
    builder.addChild(parent.id, c2)
    builder.addChild(parent.id, c3)
    builder.removeChild(parent.id, c2.id)
    expect(parent.children).toHaveLength(2)
    expect(parent.children?.map((c) => c.id)).toEqual([c1.id, c3.id])
  })

  it('deletes child from internal map', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Stmt')
    builder.addChild(parent.id, child)
    builder.removeChild(parent.id, child.id)
    expect(builder.getNode(child.id)).toBeUndefined()
  })

  it('returns false for non-existent parent', () => {
    const result = builder.removeChild('nonexistent', 'child')
    expect(result).toBe(false)
  })

  it('returns false when parent has no children', () => {
    const parent = builder.createNode('Program')
    const result = builder.removeChild(parent.id, 'someChild')
    expect(result).toBe(false)
  })

  it('returns false when child is not found in parent', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Stmt')
    const orphan = builder.createNode('Orphan')
    builder.addChild(parent.id, child)
    const result = builder.removeChild(parent.id, orphan.id)
    expect(result).toBe(false)
  })

  it('sets children to undefined when last child is removed', () => {
    const parent = builder.createNode('Program')
    const child = builder.createNode('Stmt')
    builder.addChild(parent.id, child)
    builder.removeChild(parent.id, child.id)
    expect(parent.children).toBeUndefined()
  })
})

// ─── setRange ───

describe('ASTBuilder.setRange', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('sets range on an existing node', () => {
    const node = builder.createNode('Expr')
    const result = builder.setRange(node.id, 10, 20)
    expect(result.range).toEqual({ start: 10, end: 20 })
  })

  it('returns the updated node', () => {
    const node = builder.createNode('Expr')
    const result = builder.setRange(node.id, 0, 5)
    expect(result.id).toBe(node.id)
  })

  it('overwrites an existing range', () => {
    const node = builder.createNode('Expr')
    builder.setRange(node.id, 0, 5)
    builder.setRange(node.id, 100, 200)
    expect(node.range).toEqual({ start: 100, end: 200 })
  })

  it('throws if node does not exist', () => {
    expect(() => builder.setRange('nonexistent', 0, 5)).toThrow(
      'Node with id "nonexistent" not found',
    )
  })

  it('sets range with same start and end', () => {
    const node = builder.createNode('Expr')
    builder.setRange(node.id, 42, 42)
    expect(node.range).toEqual({ start: 42, end: 42 })
  })
})

// ─── build ───

describe('ASTBuilder.build', () => {
  it('returns undefined for non-existent root', () => {
    const builder = new ASTBuilder()
    expect(builder.build('nonexistent')).toBeUndefined()
  })

  it('returns a deep clone of a single node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Root')
    builder.setProperty(node.id, 'key', 'val')
    builder.setRange(node.id, 0, 10)
    const built = builder.build(node.id)
    expect(built).toBeDefined()
    expect(built!.id).toBe(node.id)
    expect(built!.type).toBe('Root')
    expect(built!.properties).toEqual({ key: 'val' })
    expect(built!.range).toEqual({ start: 0, end: 10 })
    expect(built).not.toBe(node)
  })

  it('returns a deep clone with children', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Program')
    const child = builder.createNode('Statement')
    builder.addChild(root.id, child)
    const built = builder.build(root.id)
    expect(built!.children).toHaveLength(1)
    expect(built!.children?.[0]?.id).toBe(child.id)
  })

  it('clone is independent of the original', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    builder.setProperty(root.id, 'x', '1')
    const built = builder.build(root.id)
    built!.properties!['x'] = 'modified'
    expect(root.properties?.['x']).toBe('1')
  })

  it('clone children are independent of original children', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const built = builder.build(root.id)
    built!.children!.push(builder.createNode('Extra'))
    expect(root.children).toHaveLength(1)
  })

  it('sets parent on cloned children when trackParents is true', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const built = builder.build(root.id)
    expect(built!.children?.[0]?.parent?.id).toBe(root.id)
  })

  it('does not set parent on cloned root', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    const built = builder.build(root.id)
    expect(built!.parent).toBeUndefined()
  })

  it('deep clones nested trees', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('A')
    const mid = builder.createNode('B')
    const leaf = builder.createNode('C')
    builder.addChild(mid.id, leaf)
    builder.addChild(root.id, mid)
    const built = builder.build(root.id)
    expect(built!.children?.[0]?.children?.[0]?.type).toBe('C')
  })
})

// ─── getNode ───

describe('ASTBuilder.getNode', () => {
  it('returns an existing node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('X')
    expect(builder.getNode(node.id)).toBe(node)
  })

  it('returns undefined for non-existent node', () => {
    const builder = new ASTBuilder()
    expect(builder.getNode('nonexistent')).toBeUndefined()
  })

  it('returns undefined after node is removed', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    builder.removeChild(parent.id, child.id)
    expect(builder.getNode(child.id)).toBeUndefined()
  })

  it('returns nodes added via addChild', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    expect(builder.getNode(child.id)).toBe(child)
  })
})

// ─── findNode ───

describe('ASTBuilder.findNode', () => {
  let builder: ASTBuilder

  beforeEach(() => {
    builder = new ASTBuilder()
  })

  it('returns root when predicate matches root', () => {
    const root = builder.createNode('Program')
    const found = builder.findNode(root.id, (n) => n.type === 'Program')
    expect(found).toBe(root)
  })

  it('finds a child node matching predicate', () => {
    const root = builder.createNode('Program')
    const child = builder.createNode('Identifier')
    builder.addChild(root.id, child)
    const found = builder.findNode(root.id, (n) => n.type === 'Identifier')
    expect(found).toBe(child)
  })

  it('returns undefined for non-existent root', () => {
    const found = builder.findNode('nonexistent', () => true)
    expect(found).toBeUndefined()
  })

  it('returns undefined when no node matches', () => {
    const root = builder.createNode('Program')
    const child = builder.createNode('Identifier')
    builder.addChild(root.id, child)
    const found = builder.findNode(root.id, (n) => n.type === 'DoesNotExist')
    expect(found).toBeUndefined()
  })

  it('finds deeply nested nodes', () => {
    const root = builder.createNode('A')
    const mid = builder.createNode('B')
    const leaf = builder.createNode('C')
    builder.addChild(mid.id, leaf)
    builder.addChild(root.id, mid)
    const found = builder.findNode(root.id, (n) => n.type === 'C')
    expect(found).toBe(leaf)
  })

  it('searches depth-first (first match wins)', () => {
    const root = builder.createNode('Root')
    const c1 = builder.createNode('Target')
    const c2 = builder.createNode('Target')
    builder.addChild(root.id, c1)
    builder.addChild(root.id, c2)
    const found = builder.findNode(root.id, (n) => n.type === 'Target')
    expect(found).toBe(c1)
  })

  it('can match on value', () => {
    const root = builder.createNode('Program')
    const child = builder.createNode('Literal', '42')
    builder.addChild(root.id, child)
    const found = builder.findNode(root.id, (n) => n.value === '42')
    expect(found).toBe(child)
  })

  it('can match on id', () => {
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const found = builder.findNode(root.id, (n) => n.id === child.id)
    expect(found).toBe(child)
  })
})

// ─── getChildren ───

describe('ASTBuilder.getChildren', () => {
  it('returns children of a node', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    const c1 = builder.createNode('A')
    const c2 = builder.createNode('B')
    builder.addChild(parent.id, c1)
    builder.addChild(parent.id, c2)
    const children = builder.getChildren(parent.id)
    expect(children).toHaveLength(2)
    expect(children[0]?.id).toBe(c1.id)
    expect(children[1]?.id).toBe(c2.id)
  })

  it('returns empty array for non-existent node', () => {
    const builder = new ASTBuilder()
    expect(builder.getChildren('nonexistent')).toEqual([])
  })

  it('returns empty array for node with no children', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('X')
    expect(builder.getChildren(node.id)).toEqual([])
  })

  it('returns a copy of the children array', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('P')
    const child = builder.createNode('C')
    builder.addChild(parent.id, child)
    const children = builder.getChildren(parent.id)
    children.push(builder.createNode('Extra'))
    expect(parent.children).toHaveLength(1)
  })
})

// ─── getDepth ───

describe('ASTBuilder.getDepth', () => {
  it('returns 0 for a leaf node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Leaf')
    expect(builder.getDepth(node.id)).toBe(0)
  })

  it('returns -1 for non-existent node', () => {
    const builder = new ASTBuilder()
    expect(builder.getDepth('nonexistent')).toBe(-1)
  })

  it('returns 1 for parent with one level of children', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    expect(builder.getDepth(root.id)).toBe(1)
  })

  it('returns correct depth for deep tree', () => {
    const builder = new ASTBuilder()
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    const d = builder.createNode('D')
    builder.addChild(b.id, c)
    builder.addChild(c.id, d)
    builder.addChild(a.id, b)
    expect(builder.getDepth(a.id)).toBe(3)
  })

  it('returns correct depth for unbalanced tree', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const deep1 = builder.createNode('D1')
    const deep2 = builder.createNode('D2')
    const shallow = builder.createNode('S')
    builder.addChild(root.id, shallow)
    builder.addChild(root.id, deep1)
    builder.addChild(deep1.id, deep2)
    expect(builder.getDepth(root.id)).toBe(2)
  })

  it('returns 0 for child of a parent', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    expect(builder.getDepth(child.id)).toBe(0)
  })

  it('handles single node correctly', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Solo')
    expect(builder.getDepth(node.id)).toBe(0)
  })
})

// ─── getPath ───

describe('ASTBuilder.getPath', () => {
  it('returns empty array for non-existent node', () => {
    const builder = new ASTBuilder()
    expect(builder.getPath('nonexistent')).toEqual([])
  })

  it('returns single type for root node without parent', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Program')
    expect(builder.getPath(node.id)).toEqual(['Program'])
  })

  it('returns path from root to node with trackParents', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Program')
    const stmt = builder.createNode('Statement')
    const expr = builder.createNode('Expression')
    builder.addChild(root.id, stmt)
    builder.addChild(stmt.id, expr)
    expect(builder.getPath(expr.id)).toEqual(['Program', 'Statement', 'Expression'])
  })

  it('returns root type for root node even with trackParents', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    expect(builder.getPath(root.id)).toEqual(['Root'])
  })

  it('returns only current type when parent tracking is off and no parent set', () => {
    const builder = new ASTBuilder({ trackParents: false })
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    expect(builder.getPath(child.id)).toEqual(['Child'])
  })

  it('returns path in root-to-node order', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    builder.addChild(a.id, b)
    builder.addChild(b.id, c)
    const path = builder.getPath(c.id)
    expect(path).toEqual(['A', 'B', 'C'])
  })
})

// ─── getStatistics ───

describe('ASTBuilder.getStatistics', () => {
  it('returns zeros for non-existent root', () => {
    const builder = new ASTBuilder()
    const stats = builder.getStatistics('nonexistent')
    expect(stats).toEqual({
      totalNodes: 0,
      nodeTypes: {},
      maxDepth: 0,
      leafCount: 0,
    })
  })

  it('returns correct stats for single node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Root')
    const stats = builder.getStatistics(node.id)
    expect(stats.totalNodes).toBe(1)
    expect(stats.nodeTypes).toEqual({ Root: 1 })
    expect(stats.maxDepth).toBe(0)
    expect(stats.leafCount).toBe(1)
  })

  it('counts total nodes in tree', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('A')
    const c1 = builder.createNode('B')
    const c2 = builder.createNode('B')
    const c3 = builder.createNode('C')
    builder.addChild(root.id, c1)
    builder.addChild(root.id, c2)
    builder.addChild(c1.id, c3)
    const stats = builder.getStatistics(root.id)
    expect(stats.totalNodes).toBe(4)
  })

  it('counts node types correctly', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Program')
    const s1 = builder.createNode('Statement')
    const s2 = builder.createNode('Statement')
    const e1 = builder.createNode('Expression')
    builder.addChild(root.id, s1)
    builder.addChild(root.id, s2)
    builder.addChild(s1.id, e1)
    const stats = builder.getStatistics(root.id)
    expect(stats.nodeTypes).toEqual({
      Program: 1,
      Statement: 2,
      Expression: 1,
    })
  })

  it('computes max depth correctly', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    const d = builder.createNode('D')
    builder.addChild(b.id, c)
    builder.addChild(c.id, d)
    builder.addChild(root.id, b)
    const stats = builder.getStatistics(root.id)
    expect(stats.maxDepth).toBe(3)
  })

  it('counts leaf nodes correctly', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('A')
    const b = builder.createNode('B')
    const c = builder.createNode('C')
    const d = builder.createNode('D')
    builder.addChild(root.id, b)
    builder.addChild(root.id, c)
    builder.addChild(b.id, d)
    // Leaf nodes: c, d (b has child d, root has children)
    const stats = builder.getStatistics(root.id)
    expect(stats.leafCount).toBe(2)
  })

  it('counts all children as leaves when all are leafs', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const c1 = builder.createNode('Leaf')
    const c2 = builder.createNode('Leaf')
    const c3 = builder.createNode('Leaf')
    builder.addChild(root.id, c1)
    builder.addChild(root.id, c2)
    builder.addChild(root.id, c3)
    const stats = builder.getStatistics(root.id)
    expect(stats.leafCount).toBe(3)
    expect(stats.maxDepth).toBe(1)
  })

  it('handles wide tree', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    for (let i = 0; i < 50; i++) {
      const child = builder.createNode(`Type${i % 5}`)
      builder.addChild(root.id, child)
    }
    const stats = builder.getStatistics(root.id)
    expect(stats.totalNodes).toBe(51)
    expect(stats.leafCount).toBe(50)
    expect(stats.maxDepth).toBe(1)
  })
})

// ─── clone ───

describe('ASTBuilder.clone', () => {
  it('returns undefined for non-existent node', () => {
    const builder = new ASTBuilder()
    expect(builder.clone('nonexistent')).toBeUndefined()
  })

  it('returns a deep clone of a single node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('X', 'hello')
    builder.setProperty(node.id, 'p', 'v')
    builder.setRange(node.id, 5, 10)
    const cloned = builder.clone(node.id)
    expect(cloned).toBeDefined()
    expect(cloned!.id).toBe(node.id)
    expect(cloned!.type).toBe('X')
    expect(cloned!.value).toBe('hello')
    expect(cloned!.properties).toEqual({ p: 'v' })
    expect(cloned!.range).toEqual({ start: 5, end: 10 })
    expect(cloned).not.toBe(node)
  })

  it('clone is independent of original', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('X')
    builder.setProperty(node.id, 'key', 'original')
    const cloned = builder.clone(node.id)!
    cloned.properties!['key'] = 'cloned'
    expect(node.properties?.['key']).toBe('original')
  })

  it('clones children recursively', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    const grandchild = builder.createNode('Grandchild')
    builder.addChild(child.id, grandchild)
    builder.addChild(root.id, child)
    const cloned = builder.clone(root.id)!
    expect(cloned.children).toHaveLength(1)
    expect(cloned.children?.[0]?.children).toHaveLength(1)
    expect(cloned.children?.[0]?.children?.[0]?.type).toBe('Grandchild')
  })

  it('cloned children are new object references', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const cloned = builder.clone(root.id)!
    expect(cloned.children?.[0]).not.toBe(child)
  })

  it('sets parent on cloned children when trackParents is true', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const cloned = builder.clone(root.id)!
    expect(cloned.children?.[0]?.parent?.id).toBe(root.id)
  })

  it('cloned root has no parent', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const cloned = builder.clone(root.id)!
    expect(cloned.parent).toBeUndefined()
  })

  it('preserves value in clone', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Literal', '42')
    const cloned = builder.clone(node.id)!
    expect(cloned.value).toBe('42')
  })
})

// ─── clear ───

describe('ASTBuilder.clear', () => {
  it('clears all nodes', () => {
    const builder = new ASTBuilder()
    builder.createNode('A')
    builder.createNode('B')
    builder.createNode('C')
    builder.clear()
    expect(builder.getNode('node-1')).toBeUndefined()
    expect(builder.getNode('node-2')).toBeUndefined()
    expect(builder.getNode('node-3')).toBeUndefined()
  })

  it('resets ID counter', () => {
    const builder = new ASTBuilder()
    builder.createNode('A')
    builder.createNode('B')
    builder.clear()
    const node = builder.createNode('C')
    expect(node.id).toBe('node-1')
  })

  it('resets range counter', () => {
    const builder = new ASTBuilder({ autoRange: true })
    builder.createNode('A')
    builder.createNode('B')
    builder.clear()
    const node = builder.createNode('C')
    expect(node.range).toEqual({ start: 0, end: 0 })
  })

  it('builder is reusable after clear', () => {
    const builder = new ASTBuilder()
    const n1 = builder.createNode('A')
    const c1 = builder.createNode('Child')
    builder.addChild(n1.id, c1)
    builder.clear()
    const n2 = builder.createNode('B')
    const c2 = builder.createNode('Child2')
    builder.addChild(n2.id, c2)
    expect(builder.getNode(n2.id)).toBe(n2)
    expect(builder.getChildren(n2.id)).toHaveLength(1)
  })
})

// ─── Integration / Complex Scenarios ───

describe('ASTBuilder complex scenarios', () => {
  it('builds a realistic AST tree and computes statistics', () => {
    const builder = new ASTBuilder({ idPrefix: 'ast' })
    const program = builder.createNode('Program')
    const fnDecl = builder.createNode('FunctionDeclaration', 'myFunc')
    builder.setProperty(fnDecl.id, 'async', 'true')
    const body = builder.createNode('BlockStatement')
    const returnStmt = builder.createNode('ReturnStatement')
    const literal = builder.createNode('NumericLiteral', '42')
    builder.addChild(returnStmt.id, literal)
    builder.addChild(body.id, returnStmt)
    builder.addChild(fnDecl.id, body)
    builder.addChild(program.id, fnDecl)

    const stats = builder.getStatistics(program.id)
    expect(stats.totalNodes).toBe(5)
    expect(stats.maxDepth).toBe(4)
    expect(stats.leafCount).toBe(1)
    expect(stats.nodeTypes).toEqual({
      Program: 1,
      FunctionDeclaration: 1,
      BlockStatement: 1,
      ReturnStatement: 1,
      NumericLiteral: 1,
    })
  })

  it('finds node across a complex tree', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const a = builder.createNode('Branch')
    const b = builder.createNode('Branch')
    const target = builder.createNode('Target', 'needle')
    builder.addChild(root.id, a)
    builder.addChild(root.id, b)
    builder.addChild(b.id, target)

    const found = builder.findNode(root.id, (n) => n.value === 'needle')
    expect(found).toBe(target)
  })

  it('build and clone produce identical structure', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const c1 = builder.createNode('A')
    const c2 = builder.createNode('B')
    builder.addChild(root.id, c1)
    builder.addChild(root.id, c2)

    const built = builder.build(root.id)!
    const cloned = builder.clone(root.id)!

    expect(built.id).toBe(cloned.id)
    expect(built.type).toBe(cloned.type)
    expect(built.children).toHaveLength(cloned.children!.length)
  })

  it('handles add and remove cycles', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    expect(builder.getChildren(root.id)).toHaveLength(1)

    builder.removeChild(root.id, child.id)
    expect(builder.getChildren(root.id)).toHaveLength(0)

    const child2 = builder.createNode('Child2')
    builder.addChild(root.id, child2)
    expect(builder.getChildren(root.id)).toHaveLength(1)
    expect(builder.getChildren(root.id)[0]?.id).toBe(child2.id)
  })

  it('deep clone isolates nested mutations', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.setProperty(child.id, 'meta', 'data')
    builder.addChild(root.id, child)

    const built = builder.build(root.id)!
    built.children![0]!.properties!['meta'] = 'changed'

    expect(child.properties?.['meta']).toBe('data')
  })

  it('getPath works across 4 levels with trackParents', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const a = builder.createNode('Level0')
    const b = builder.createNode('Level1')
    const c = builder.createNode('Level2')
    const d = builder.createNode('Level3')
    builder.addChild(a.id, b)
    builder.addChild(b.id, c)
    builder.addChild(c.id, d)
    expect(builder.getPath(d.id)).toEqual(['Level0', 'Level1', 'Level2', 'Level3'])
  })

  it('statistics reflect tree after removals', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    builder.addChild(root.id, a)
    builder.addChild(root.id, b)
    builder.removeChild(root.id, a.id)
    const stats = builder.getStatistics(root.id)
    expect(stats.totalNodes).toBe(2)
    expect(stats.leafCount).toBe(1)
  })

  it('handles nodes with empty string value', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Literal', '')
    expect(node.value).toBe('')
    const cloned = builder.clone(node.id)!
    expect(cloned.value).toBe('')
  })

  it('handles nodes with special characters in value', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('String', 'hello\nworld\t"quoted"')
    expect(node.value).toBe('hello\nworld\t"quoted"')
  })

  it('custom idPrefix persists after clear', () => {
    const builder = new ASTBuilder({ idPrefix: 'custom' })
    builder.createNode('A')
    builder.clear()
    const node = builder.createNode('B')
    expect(node.id).toBe('custom-1')
  })

  it('multiple builders are independent', () => {
    const b1 = new ASTBuilder({ idPrefix: 'b1' })
    const b2 = new ASTBuilder({ idPrefix: 'b2' })
    const n1 = b1.createNode('X')
    const n2 = b2.createNode('Y')
    expect(n1.id).toBe('b1-1')
    expect(n2.id).toBe('b2-1')
    expect(b1.getNode(n1.id)).toBe(n1)
    expect(b1.getNode(n2.id)).toBeUndefined()
    expect(b2.getNode(n2.id)).toBe(n2)
    expect(b2.getNode(n1.id)).toBeUndefined()
  })
})
