import { describe, expect, it } from 'vitest'

import { ASTBuilder } from '../../../src/core/ast-builder/ast-builder.js'

describe('ASTBuilder', () => {
  it('creates a node with type', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('FunctionDeclaration')
    expect(node.type).toBe('FunctionDeclaration')
    expect(node.id).toBeTruthy()
  })

  it('creates a node with value', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Identifier', 'foo')
    expect(node.value).toBe('foo')
  })

  it('generates unique IDs', () => {
    const builder = new ASTBuilder()
    const a = builder.createNode('A')
    const b = builder.createNode('B')
    expect(a.id).not.toBe(b.id)
  })

  it('uses custom ID prefix', () => {
    const builder = new ASTBuilder({ idPrefix: 'custom' })
    const node = builder.createNode('Test')
    expect(node.id).toMatch(/^custom-/)
  })

  it('sets properties on a node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Function')
    builder.setProperty(node.id, 'async', 'true')
    expect(node.properties.async).toBe('true')
  })

  it('setProperty throws for missing node', () => {
    const builder = new ASTBuilder()
    expect(() => builder.setProperty('missing', 'key', 'val')).toThrow()
  })

  it('adds child to parent', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('Block')
    const child = builder.createNode('ReturnStatement')
    builder.addChild(parent.id, child)
    expect(parent.children).toHaveLength(1)
    expect(parent.children![0]!.id).toBe(child.id)
  })

  it('addChild throws for missing parent', () => {
    const builder = new ASTBuilder()
    const child = builder.createNode('Child')
    expect(() => builder.addChild('missing', child)).toThrow()
  })

  it('removes child from parent', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('Block')
    const child = builder.createNode('Statement')
    builder.addChild(parent.id, child)
    expect(builder.removeChild(parent.id, child.id)).toBe(true)
    expect(parent.children).toBeUndefined()
  })

  it('removeChild returns false for missing parent', () => {
    const builder = new ASTBuilder()
    expect(builder.removeChild('missing', 'child')).toBe(false)
  })

  it('removeChild returns false for missing child', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('Block')
    expect(builder.removeChild(parent.id, 'missing')).toBe(false)
  })

  it('sets range on a node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Test')
    builder.setRange(node.id, 10, 20)
    expect(node.range).toEqual({ start: 10, end: 20 })
  })

  it('setRange throws for missing node', () => {
    const builder = new ASTBuilder()
    expect(() => builder.setRange('missing', 0, 10)).toThrow()
  })

  it('auto-range assigns ranges', () => {
    const builder = new ASTBuilder({ autoRange: true })
    const node = builder.createNode('Test')
    expect(node.range).toBeDefined()
    expect(node.range!.start).toBeGreaterThanOrEqual(0)
  })

  it('trackParents sets parent references', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const parent = builder.createNode('Parent')
    const child = builder.createNode('Child')
    builder.addChild(parent.id, child)
    expect(child.parent).toBeDefined()
    expect(child.parent!.id).toBe(parent.id)
  })

  it('build returns a deep clone', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    builder.addChild(root.id, child)
    const built = builder.build(root.id)
    expect(built).toBeDefined()
    expect(built!.type).toBe('Root')
    expect(built!.children).toHaveLength(1)
    built!.value = 'modified'
    const original = builder.getNode(root.id)
    expect(original!.value).toBeUndefined()
  })

  it('build returns undefined for missing root', () => {
    const builder = new ASTBuilder()
    expect(builder.build('missing')).toBeUndefined()
  })

  it('getNode returns stored node', () => {
    const builder = new ASTBuilder()
    const node = builder.createNode('Test')
    expect(builder.getNode(node.id)).toBe(node)
  })

  it('getNode returns undefined for missing id', () => {
    const builder = new ASTBuilder()
    expect(builder.getNode('missing')).toBeUndefined()
  })

  it('findNode searches by predicate', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Target', 'find-me')
    builder.addChild(root.id, child)
    const found = builder.findNode(root.id, (n) => n.value === 'find-me')
    expect(found).toBeDefined()
    expect(found!.id).toBe(child.id)
  })

  it('getChildren returns child list', () => {
    const builder = new ASTBuilder()
    const parent = builder.createNode('Parent')
    const c1 = builder.createNode('C1')
    const c2 = builder.createNode('C2')
    builder.addChild(parent.id, c1)
    builder.addChild(parent.id, c2)
    expect(builder.getChildren(parent.id)).toHaveLength(2)
  })

  it('getDepth returns tree depth', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    const child = builder.createNode('Child')
    const grandchild = builder.createNode('Grandchild')
    builder.addChild(root.id, child)
    builder.addChild(child.id, grandchild)
    expect(builder.getDepth(root.id)).toBe(2)
  })

  it('getDepth returns -1 for missing node', () => {
    const builder = new ASTBuilder()
    expect(builder.getDepth('missing')).toBe(-1)
  })

  it('getStatistics returns tree stats', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    builder.addChild(root.id, builder.createNode('Child1'))
    builder.addChild(root.id, builder.createNode('Child2'))
    const stats = builder.getStatistics(root.id)
    expect(stats.totalNodes).toBe(3)
    expect(stats.maxDepth).toBe(1)
    expect(stats.leafCount).toBe(2)
    expect(stats.nodeTypes['Child1']).toBe(1)
  })

  it('clone creates deep copy', () => {
    const builder = new ASTBuilder()
    const root = builder.createNode('Root')
    builder.addChild(root.id, builder.createNode('Child'))
    const cloned = builder.clone(root.id)
    expect(cloned).toBeDefined()
    expect(cloned!.type).toBe('Root')
    expect(cloned!.children).toHaveLength(1)
  })

  it('clear resets builder state', () => {
    const builder = new ASTBuilder()
    builder.createNode('Node')
    builder.clear()
    expect(builder.getNode('node-1')).toBeUndefined()
  })

  it('getPath returns type path with trackParents', () => {
    const builder = new ASTBuilder({ trackParents: true })
    const root = builder.createNode('Program')
    const child = builder.createNode('Function')
    const grandchild = builder.createNode('Return')
    builder.addChild(root.id, child)
    builder.addChild(child.id, grandchild)
    const path = builder.getPath(grandchild.id)
    expect(path).toEqual(['Program', 'Function', 'Return'])
  })
})
