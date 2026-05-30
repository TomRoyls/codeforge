import { describe, expect, it } from 'vitest'

import { ASTSerializer } from '../../../src/core/ast-printer/ast-serializer.js'
import type { ASTNode } from '../../../src/core/ast-printer/types.js'

function n(type: string, value?: string, children?: ASTNode[]): ASTNode {
  return { type, value, children }
}

describe('ASTSerializer', () => {
  it('serializes a simple node', () => {
    const serializer = new ASTSerializer()
    const result = serializer.serialize(n('Identifier', 'foo'))
    expect(result.type).toBe('Identifier')
    expect(result.text).toBe('foo')
    expect(result.children).toEqual([])
  })

  it('serializes node with children', () => {
    const serializer = new ASTSerializer()
    const result = serializer.serialize(
      n('Program', undefined, [n('Function', 'main')]),
    )
    expect(result.children).toHaveLength(1)
    expect(result.children[0]!.type).toBe('Function')
  })

  it('serializes node with range', () => {
    const serializer = new ASTSerializer()
    const node: ASTNode = { type: 'Literal', range: { start: 0, end: 5 } }
    const result = serializer.serialize(node)
    expect(result.meta.rangeStart).toBe('0')
    expect(result.meta.rangeEnd).toBe('5')
  })

  it('serializes node with location', () => {
    const serializer = new ASTSerializer()
    const node: ASTNode = { type: 'Expr', loc: { line: 5, column: 10 } }
    const result = serializer.serialize(node)
    expect(result.meta.line).toBe('5')
    expect(result.meta.column).toBe('10')
  })

  it('serializes node with properties', () => {
    const serializer = new ASTSerializer()
    const node: ASTNode = { type: 'Fn', properties: { async: true } }
    const result = serializer.serialize(node)
    expect(result.meta.async).toBe('true')
  })

  it('serializeMany serializes multiple nodes', () => {
    const serializer = new ASTSerializer()
    const results = serializer.serializeMany([n('A'), n('B')])
    expect(results).toHaveLength(2)
  })

  it('flatten returns all nodes', () => {
    const serializer = new ASTSerializer()
    const tree = serializer.serialize(
      n('Root', undefined, [
        n('A', undefined, [n('C')]),
        n('B'),
      ]),
    )
    const flat = serializer.flatten(tree)
    expect(flat).toHaveLength(4)
  })

  it('flatten sets correct depths', () => {
    const serializer = new ASTSerializer()
    const tree = serializer.serialize(
      n('Root', undefined, [n('Child', undefined, [n('Grandchild')])]),
    )
    const flat = serializer.flatten(tree)
    expect(flat[0]!.depth).toBe(0)
    expect(flat.find((n) => n.type === 'Child')!.depth).toBe(1)
    expect(flat.find((n) => n.type === 'Grandchild')!.depth).toBe(2)
  })

  it('toJSON produces valid JSON', () => {
    const serializer = new ASTSerializer()
    const serialized = serializer.serialize(n('Test', 'value'))
    const json = serializer.toJSON(serialized)
    const parsed = JSON.parse(json)
    expect(parsed.type).toBe('Test')
  })

  it('toTreeString produces readable output', () => {
    const serializer = new ASTSerializer()
    const serialized = serializer.serialize(
      n('Program', undefined, [n('Function', 'main')]),
    )
    const treeStr = serializer.toTreeString(serialized)
    expect(treeStr).toContain('Program')
    expect(treeStr).toContain('Function')
    expect(treeStr).toContain('main')
  })

  it('countNodes counts all nodes', () => {
    const serializer = new ASTSerializer()
    const tree = n('Root', undefined, [
      n('A', undefined, [n('C')]),
      n('B'),
    ])
    expect(serializer.countNodes(tree)).toBe(4)
  })

  it('countNodes counts single node as 1', () => {
    const serializer = new ASTSerializer()
    expect(serializer.countNodes(n('Leaf'))).toBe(1)
  })

  it('getDepth returns tree depth', () => {
    const serializer = new ASTSerializer()
    const tree = n('Root', undefined, [
      n('Child', undefined, [n('Grandchild')]),
    ])
    expect(serializer.getDepth(tree)).toBe(2)
  })

  it('getDepth returns 0 for leaf', () => {
    const serializer = new ASTSerializer()
    expect(serializer.getDepth(n('Leaf'))).toBe(0)
  })

  it('serializes node without value', () => {
    const serializer = new ASTSerializer()
    const result = serializer.serialize(n('Empty'))
    expect(result.text).toBe('')
    expect(result.meta.value).toBeUndefined()
  })
})
