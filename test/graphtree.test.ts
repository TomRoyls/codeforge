import { describe, it, expect } from 'vitest'
import { GraphTree } from '../src/core/graphtree/index.js'
import type { TraversalOrder, GraphTreeNode } from '../src/core/graphtree/index.js'

// ─── Construction ───

describe('GraphTree - Construction', () => {
  it('creates node with value', () => {
    const tree = new GraphTree<string>('root')
    expect(tree.getValue()).toBe('root')
  })

  it('creates node without value', () => {
    const tree = new GraphTree()
    expect(tree.getValue()).toBeUndefined()
  })
})

// ─── Children ───

describe('GraphTree - Children', () => {
  it('addChild returns child node', () => {
    const tree = new GraphTree<string>('root')
    const child = tree.addChild('child1')
    expect(child.getValue()).toBe('child1')
    expect(child.getParent()).toBe(tree)
  })

  it('getChildren returns copy of children', () => {
    const tree = new GraphTree<string>('root')
    tree.addChild('a')
    tree.addChild('b')
    const children = tree.getChildren()
    expect(children.length).toBe(2)
    children.push(new GraphTree('intruder'))
    expect(tree.getChildren().length).toBe(2)
  })

  it('removeChild removes existing child', () => {
    const tree = new GraphTree<string>('root')
    const child = tree.addChild('remove-me')
    expect(tree.removeChild(child)).toBe(true)
    expect(tree.getChildren().length).toBe(0)
    expect(child.getParent()).toBeNull()
  })

  it('removeChild returns false for non-child', () => {
    const tree = new GraphTree<string>('root')
    const orphan = new GraphTree<string>('orphan')
    expect(tree.removeChild(orphan)).toBe(false)
  })
})

// ─── Properties ───

describe('GraphTree - Properties', () => {
  it('isLeaf returns true for childless node', () => {
    const tree = new GraphTree('x')
    expect(tree.isLeaf).toBe(true)
  })

  it('isLeaf returns false for node with children', () => {
    const tree = new GraphTree('x')
    tree.addChild('y')
    expect(tree.isLeaf).toBe(false)
  })

  it('isRoot returns true for root node', () => {
    const tree = new GraphTree('root')
    expect(tree.isRoot).toBe(true)
  })

  it('isRoot returns false for child node', () => {
    const tree = new GraphTree('root')
    const child = tree.addChild('child')
    expect(child.isRoot).toBe(false)
  })

  it('depth returns 0 for root', () => {
    const tree = new GraphTree('root')
    expect(tree.depth).toBe(0)
  })

  it('depth increases for nested nodes', () => {
    const root = new GraphTree('r')
    const child = root.addChild('c')
    const grandchild = child.addChild('gc')
    expect(child.depth).toBe(1)
    expect(grandchild.depth).toBe(2)
  })

  it('height returns 0 for leaf', () => {
    const tree = new GraphTree('leaf')
    expect(tree.height).toBe(0)
  })

  it('height increases with children', () => {
    const root = new GraphTree('r')
    root.addChild('c')
    expect(root.height).toBe(1)
  })

  it('size returns total node count', () => {
    const root = new GraphTree('r')
    root.addChild('a')
    root.addChild('b')
    expect(root.size).toBe(3)
  })

  it('size includes deeply nested nodes', () => {
    const root = new GraphTree('r')
    const child = root.addChild('c')
    child.addChild('gc')
    expect(root.size).toBe(3)
  })
})

// ─── Find ───

describe('GraphTree - Find', () => {
  it('find returns first matching node', () => {
    const root = new GraphTree<string>('root')
    root.addChild('a')
    root.addChild('b')
    const found = root.find((n) => n.getValue() === 'a')
    expect(found).not.toBeUndefined()
    expect(found!.getValue()).toBe('a')
  })

  it('find returns undefined when no match', () => {
    const root = new GraphTree('root')
    expect(root.find(() => false)).toBeUndefined()
  })

  it('findAll returns all matching nodes', () => {
    const root = new GraphTree<number>(0)
    root.addChild(1)
    root.addChild(2)
    root.addChild(3)
    const evens = root.findAll((n) => n.getValue() % 2 === 0)
    expect(evens.length).toBe(2)
  })

  it('findAll returns empty when no match', () => {
    const root = new GraphTree('x')
    expect(root.findAll(() => false)).toEqual([])
  })
})

// ─── Traversal ───

describe('GraphTree - Traversal', () => {
  let root: GraphTree<string>

  beforeEach(() => {
    root = new GraphTree('root')
    const a = root.addChild('a')
    a.addChild('a1')
    a.addChild('a2')
    root.addChild('b')
  })

  it('traverses in pre-order', () => {
    const result = root.traverse('pre').map((n) => n.getValue())
    expect(result[0]).toBe('root')
    expect(result[1]).toBe('a')
    expect(result[2]).toBe('a1')
  })

  it('traverses in post-order', () => {
    const result = root.traverse('post').map((n) => n.getValue())
    expect(result[result.length - 1]).toBe('root')
  })

  it('traverses in level-order', () => {
    const result = root.traverse('level').map((n) => n.getValue())
    expect(result[0]).toBe('root')
    expect(result[result.length - 1]).toBe('a2')
  })

  it('traversal returns all nodes', () => {
    const pre = root.traverse('pre')
    const post = root.traverse('post')
    const level = root.traverse('level')
    expect(pre.length).toBe(5)
    expect(post.length).toBe(5)
    expect(level.length).toBe(5)
  })
})

// ─── Clone ───

describe('GraphTree - Clone', () => {
  it('clones tree structure', () => {
    const root = new GraphTree('r')
    root.addChild('a')
    root.addChild('b')
    const cloned = root.clone()
    expect(cloned.getValue()).toBe('r')
    expect(cloned.getChildren().length).toBe(2)
    expect(cloned.size).toBe(root.size)
  })

  it('clone is independent', () => {
    const root = new GraphTree('r')
    root.addChild('a')
    const cloned = root.clone()
    cloned.addChild('new-child')
    expect(cloned.getChildren().length).toBe(2)
    expect(root.getChildren().length).toBe(1)
  })
})

// ─── setValue ───

describe('GraphTree - setValue', () => {
  it('updates value', () => {
    const tree = new GraphTree('old')
    tree.setValue('new')
    expect(tree.getValue()).toBe('new')
  })
})

// ─── toString ───

describe('GraphTree - toString', () => {
  it('represents tree as indented string', () => {
    const root = new GraphTree('root')
    root.addChild('child1')
    root.addChild('child2')
    const str = root.toString()
    expect(str).toContain('root')
    expect(str).toContain('child1')
    expect(str).toContain('child2')
  })
})
