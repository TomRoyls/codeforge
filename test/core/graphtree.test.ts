import { describe, it, expect } from 'vitest'
import { GraphTree } from '../../src/core/graphtree/index.js'
import type { TraversalOrder, GraphTreeNode, GraphTreePredicate } from '../../src/core/graphtree/index.js'

describe('GraphTree', () => {
  describe('constructor', () => {
    it('should create a tree with no value', () => {
      const tree = new GraphTree()
      expect(tree.getValue()).toBeUndefined()
    })

    it('should create a tree with a string value', () => {
      const tree = new GraphTree<string>('root')
      expect(tree.getValue()).toBe('root')
    })

    it('should create a tree with a numeric value', () => {
      const tree = new GraphTree<number>(42)
      expect(tree.getValue()).toBe(42)
    })

    it('should create a tree with an object value', () => {
      const tree = new GraphTree<{ name: string }>({ name: 'test' })
      expect(tree.getValue()).toEqual({ name: 'test' })
    })

    it('should create a tree with null value', () => {
      const tree = new GraphTree<null>(null)
      expect(tree.getValue()).toBeNull()
    })

    it('should create a tree with undefined value', () => {
      const tree = new GraphTree<number | undefined>(undefined)
      expect(tree.getValue()).toBeUndefined()
    })

    it('should create a tree with boolean value', () => {
      const tree = new GraphTree<boolean>(true)
      expect(tree.getValue()).toBe(true)
    })

    it('should create a tree with array value', () => {
      const tree = new GraphTree<number[]>([1, 2, 3])
      expect(tree.getValue()).toEqual([1, 2, 3])
    })

    it('should create a tree with zero value', () => {
      const tree = new GraphTree<number>(0)
      expect(tree.getValue()).toBe(0)
    })

    it('should create a tree with empty string value', () => {
      const tree = new GraphTree<string>('')
      expect(tree.getValue()).toBe('')
    })
  })

  describe('getValue / setValue', () => {
    it('should get the value', () => {
      const tree = new GraphTree('hello')
      expect(tree.getValue()).toBe('hello')
    })

    it('should set a new value', () => {
      const tree = new GraphTree('old')
      tree.setValue('new')
      expect(tree.getValue()).toBe('new')
    })

    it('should set value to different type-compatible value', () => {
      const tree = new GraphTree<number>(1)
      tree.setValue(2)
      expect(tree.getValue()).toBe(2)
    })

    it('should set value multiple times', () => {
      const tree = new GraphTree('a')
      tree.setValue('b')
      tree.setValue('c')
      expect(tree.getValue()).toBe('c')
    })

    it('should set value on child node', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      child.setValue('updated')
      expect(child.getValue()).toBe('updated')
    })
  })

  describe('getParent', () => {
    it('should return null for root node', () => {
      const tree = new GraphTree('root')
      expect(tree.getParent()).toBeNull()
    })

    it('should return parent for child node', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      expect(child.getParent()).toBe(tree)
    })

    it('should return null after removal from parent', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      tree.removeChild(child)
      expect(child.getParent()).toBeNull()
    })

    it('should return correct parent in deep tree', () => {
      const root = new GraphTree('root')
      const child1 = root.addChild('c1')
      const child2 = child1.addChild('c2')
      const child3 = child2.addChild('c3')
      expect(child3.getParent()).toBe(child2)
      expect(child2.getParent()).toBe(child1)
      expect(child1.getParent()).toBe(root)
    })

    it('should return null for standalone node', () => {
      const node = new GraphTree('standalone')
      expect(node.getParent()).toBeNull()
    })
  })

  describe('getChildren', () => {
    it('should return empty array for leaf node', () => {
      const tree = new GraphTree('leaf')
      expect(tree.getChildren()).toEqual([])
    })

    it('should return all children', () => {
      const tree = new GraphTree('root')
      const c1 = tree.addChild('c1')
      const c2 = tree.addChild('c2')
      const children = tree.getChildren()
      expect(children).toHaveLength(2)
      expect(children).toContain(c1)
      expect(children).toContain(c2)
    })

    it('should return a copy of children array', () => {
      const tree = new GraphTree('root')
      tree.addChild('c1')
      const children = tree.getChildren()
      children.push(new GraphTree('intruder'))
      expect(tree.getChildren()).toHaveLength(1)
    })

    it('should return many children', () => {
      const tree = new GraphTree('root')
      for (let i = 0; i < 10; i++) {
        tree.addChild(i)
      }
      expect(tree.getChildren()).toHaveLength(10)
    })

    it('should return children after removal', () => {
      const tree = new GraphTree('root')
      const c1 = tree.addChild('c1')
      const c2 = tree.addChild('c2')
      tree.removeChild(c1)
      const children = tree.getChildren()
      expect(children).toHaveLength(1)
      expect(children).toContain(c2)
    })
  })

  describe('addChild', () => {
    it('should add a child and return it', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      expect(child).toBeInstanceOf(GraphTree)
      expect(child.getValue()).toBe('child')
    })

    it('should set parent on added child', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      expect(child.getParent()).toBe(tree)
    })

    it('should add multiple children', () => {
      const tree = new GraphTree('root')
      tree.addChild('a')
      tree.addChild('b')
      tree.addChild('c')
      expect(tree.getChildren()).toHaveLength(3)
    })

    it('should add child to child', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      const grandchild = child.addChild('grandchild')
      expect(grandchild.getParent()).toBe(child)
      expect(child.getChildren()).toHaveLength(1)
    })

    it('should add child with same value as parent', () => {
      const tree = new GraphTree('val')
      const child = tree.addChild('val')
      expect(child.getValue()).toBe('val')
      expect(tree.getValue()).toBe('val')
    })

    it('should add child with object value', () => {
      const tree = new GraphTree<{ id: number }>({ id: 0 })
      const child = tree.addChild({ id: 1 })
      expect(child.getValue()).toEqual({ id: 1 })
    })
  })

  describe('removeChild', () => {
    it('should remove an existing child', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      const result = tree.removeChild(child)
      expect(result).toBe(true)
      expect(tree.getChildren()).toHaveLength(0)
    })

    it('should return false for non-child node', () => {
      const tree = new GraphTree('root')
      const orphan = new GraphTree('orphan')
      expect(tree.removeChild(orphan)).toBe(false)
    })

    it('should clear parent reference on removed child', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      tree.removeChild(child)
      expect(child.getParent()).toBeNull()
    })

    it('should remove specific child among many', () => {
      const tree = new GraphTree('root')
      const c1 = tree.addChild('c1')
      const c2 = tree.addChild('c2')
      const c3 = tree.addChild('c3')
      tree.removeChild(c2)
      const children = tree.getChildren()
      expect(children).toHaveLength(2)
      expect(children).toContain(c1)
      expect(children).toContain(c3)
    })

    it('should remove first child', () => {
      const tree = new GraphTree('root')
      const c1 = tree.addChild('c1')
      tree.addChild('c2')
      tree.removeChild(c1)
      expect(tree.getChildren()).toHaveLength(1)
      expect(tree.getChildren()[0]?.getValue()).toBe('c2')
    })

    it('should remove last child', () => {
      const tree = new GraphTree('root')
      tree.addChild('c1')
      const c2 = tree.addChild('c2')
      tree.removeChild(c2)
      expect(tree.getChildren()).toHaveLength(1)
      expect(tree.getChildren()[0]?.getValue()).toBe('c1')
    })

    it('should not remove child from wrong parent', () => {
      const tree1 = new GraphTree('t1')
      const tree2 = new GraphTree('t2')
      const child = tree1.addChild('child')
      expect(tree2.removeChild(child)).toBe(false)
      expect(tree1.getChildren()).toHaveLength(1)
    })

    it('should handle removing from empty children', () => {
      const tree = new GraphTree('root')
      const node = new GraphTree('node')
      expect(tree.removeChild(node)).toBe(false)
    })

    it('should allow re-adding a removed child', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      tree.removeChild(child)
      tree.addChild('child2')
      expect(tree.getChildren()).toHaveLength(1)
    })
  })

  describe('isLeaf', () => {
    it('should be true for node with no children', () => {
      const tree = new GraphTree('leaf')
      expect(tree.isLeaf).toBe(true)
    })

    it('should be false for node with children', () => {
      const tree = new GraphTree('root')
      tree.addChild('child')
      expect(tree.isLeaf).toBe(false)
    })

    it('should be true after removing all children', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      tree.removeChild(child)
      expect(tree.isLeaf).toBe(true)
    })

    it('should be true for root with no children', () => {
      const tree = new GraphTree('root')
      expect(tree.isLeaf).toBe(true)
    })

    it('should be false for node with grandchildren', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      child.addChild('grandchild')
      expect(tree.isLeaf).toBe(false)
    })
  })

  describe('isRoot', () => {
    it('should be true for node with no parent', () => {
      const tree = new GraphTree('root')
      expect(tree.isRoot).toBe(true)
    })

    it('should be false for child node', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      expect(child.isRoot).toBe(false)
    })

    it('should be true after removing from parent', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      tree.removeChild(child)
      expect(child.isRoot).toBe(true)
    })

    it('should be false for deeply nested node', () => {
      const root = new GraphTree('r')
      const c1 = root.addChild('c1')
      const c2 = c1.addChild('c2')
      const c3 = c2.addChild('c3')
      expect(c3.isRoot).toBe(false)
    })
  })

  describe('depth', () => {
    it('should be 0 for root node', () => {
      const tree = new GraphTree('root')
      expect(tree.depth).toBe(0)
    })

    it('should be 1 for direct child', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      expect(child.depth).toBe(1)
    })

    it('should be 2 for grandchild', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      const grandchild = child.addChild('grandchild')
      expect(grandchild.depth).toBe(2)
    })

    it('should increase with deeper nesting', () => {
      const root = new GraphTree(0)
      let current = root
      for (let i = 1; i <= 10; i++) {
        current = current.addChild(i)
        expect(current.depth).toBe(i)
      }
    })

    it('should be correct after removing sibling', () => {
      const root = new GraphTree('root')
      const c1 = root.addChild('c1')
      const c2 = root.addChild('c2')
      root.removeChild(c1)
      expect(c2.depth).toBe(1)
    })
  })

  describe('height', () => {
    it('should be 0 for leaf node', () => {
      const tree = new GraphTree('leaf')
      expect(tree.height).toBe(0)
    })

    it('should be 1 for node with leaf children', () => {
      const tree = new GraphTree('root')
      tree.addChild('child')
      expect(tree.height).toBe(1)
    })

    it('should be 2 for node with grandchild', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      child.addChild('grandchild')
      expect(root.height).toBe(2)
    })

    it('should compute height from deepest leaf', () => {
      const root = new GraphTree('root')
      const c1 = root.addChild('c1')
      const c2 = root.addChild('c2')
      c2.addChild('gc1')
      c2.addChild('gc2').addChild('ggc1')
      expect(root.height).toBe(3)
    })

    it('should be 0 after removing all children', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      tree.removeChild(child)
      expect(tree.height).toBe(0)
    })

    it('should handle wide tree correctly', () => {
      const root = new GraphTree('root')
      for (let i = 0; i < 5; i++) {
        root.addChild(i)
      }
      expect(root.height).toBe(1)
    })

    it('should handle deep chain', () => {
      const root = new GraphTree(0)
      let current = root
      for (let i = 1; i <= 10; i++) {
        current = current.addChild(i)
      }
      expect(root.height).toBe(10)
    })
  })

  describe('size', () => {
    it('should be 1 for single node', () => {
      const tree = new GraphTree('root')
      expect(tree.size).toBe(1)
    })

    it('should include root and children', () => {
      const tree = new GraphTree('root')
      tree.addChild('c1')
      tree.addChild('c2')
      expect(tree.size).toBe(3)
    })

    it('should include entire subtree', () => {
      const root = new GraphTree('root')
      const c1 = root.addChild('c1')
      root.addChild('c2')
      c1.addChild('gc1')
      c1.addChild('gc2')
      expect(root.size).toBe(5)
    })

    it('should decrease after removing child', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      child.addChild('grandchild')
      expect(tree.size).toBe(3)
      tree.removeChild(child)
      expect(tree.size).toBe(1)
    })

    it('should be 1 for child after removal', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('child')
      child.addChild('grandchild')
      tree.removeChild(child)
      expect(child.size).toBe(2)
    })

    it('should count large tree', () => {
      const root = new GraphTree('root')
      for (let i = 0; i < 10; i++) {
        const child = root.addChild(i)
        for (let j = 0; j < 5; j++) {
          child.addChild(j)
        }
      }
      expect(root.size).toBe(1 + 10 + 50)
    })
  })

  describe('find', () => {
    it('should find root node matching predicate', () => {
      const tree = new GraphTree('root')
      const found = tree.find((n) => n.getValue() === 'root')
      expect(found).toBe(tree)
    })

    it('should find child node matching predicate', () => {
      const tree = new GraphTree('root')
      const child = tree.addChild('target')
      tree.addChild('other')
      const found = tree.find((n) => n.getValue() === 'target')
      expect(found).toBe(child)
    })

    it('should find deep node matching predicate', () => {
      const root = new GraphTree('root')
      const c1 = root.addChild('c1')
      const c2 = c1.addChild('c2')
      const c3 = c2.addChild('target')
      const found = root.find((n) => n.getValue() === 'target')
      expect(found).toBe(c3)
    })

    it('should return undefined when no match', () => {
      const tree = new GraphTree('root')
      tree.addChild('c1')
      tree.addChild('c2')
      const found = tree.find((n) => n.getValue() === 'missing')
      expect(found).toBeUndefined()
    })

    it('should return first match in pre-order', () => {
      const root = new GraphTree('root')
      root.addChild('dup')
      const secondDup = root.addChild('dup')
      const found = root.find((n) => n.getValue() === 'dup')
      expect(found).not.toBe(secondDup)
      expect(found?.getValue()).toBe('dup')
    })

    it('should return undefined for empty tree', () => {
      const tree = new GraphTree<string>('only')
      const found = tree.find((n) => n.getValue() === 'other')
      expect(found).toBeUndefined()
    })

    it('should find by depth', () => {
      const root = new GraphTree('root')
      const c1 = root.addChild('c1')
      c1.addChild('c2')
      const found = root.find((n) => n.depth === 2)
      expect(found?.getValue()).toBe('c2')
    })

    it('should find by isLeaf', () => {
      const root = new GraphTree('root')
      root.addChild('c1')
      const found = root.find((n) => n.isLeaf)
      expect(found?.getValue()).toBe('c1')
    })
  })

  describe('findAll', () => {
    it('should return all matching nodes', () => {
      const root = new GraphTree('root')
      root.addChild('target')
      root.addChild('other')
      root.addChild('target')
      const found = root.findAll((n) => n.getValue() === 'target')
      expect(found).toHaveLength(2)
    })

    it('should return empty array when no match', () => {
      const tree = new GraphTree('root')
      tree.addChild('c1')
      const found = tree.findAll((n) => n.getValue() === 'missing')
      expect(found).toHaveLength(0)
    })

    it('should find matches at different depths', () => {
      const root = new GraphTree('target')
      const c1 = root.addChild('target')
      c1.addChild('target')
      const found = root.findAll((n) => n.getValue() === 'target')
      expect(found).toHaveLength(3)
    })

    it('should find all leaf nodes', () => {
      const root = new GraphTree('root')
      const c1 = root.addChild('c1')
      root.addChild('c2')
      c1.addChild('c3')
      const found = root.findAll((n) => n.isLeaf)
      expect(found).toHaveLength(2)
    })

    it('should return single match as array', () => {
      const tree = new GraphTree('root')
      tree.addChild('unique')
      const found = tree.findAll((n) => n.getValue() === 'unique')
      expect(found).toHaveLength(1)
    })

    it('should find all nodes by predicate on large tree', () => {
      const root = new GraphTree(0)
      for (let i = 0; i < 10; i++) {
        const child = root.addChild(i + 1)
        for (let j = 0; j < 3; j++) {
          child.addChild((i + 1) * 10 + j)
        }
      }
      const evens = root.findAll((n) => n.getValue() % 2 === 0)
      expect(evens.length).toBeGreaterThan(0)
      for (const node of evens) {
        expect(node.getValue() % 2).toBe(0)
      }
    })
  })

  describe('traverse', () => {
    it('should traverse single node in pre-order', () => {
      const tree = new GraphTree('root')
      const result = tree.traverse('pre')
      expect(result).toHaveLength(1)
      expect(result[0]?.getValue()).toBe('root')
    })

    it('should traverse single node in post-order', () => {
      const tree = new GraphTree('root')
      const result = tree.traverse('post')
      expect(result).toHaveLength(1)
      expect(result[0]?.getValue()).toBe('root')
    })

    it('should traverse single node in level-order', () => {
      const tree = new GraphTree('root')
      const result = tree.traverse('level')
      expect(result).toHaveLength(1)
      expect(result[0]?.getValue()).toBe('root')
    })

    it('should traverse in pre-order (root first)', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      root.addChild('b')
      const result = root.traverse('pre').map((n) => n.getValue())
      expect(result).toEqual(['root', 'a', 'b'])
    })

    it('should traverse in post-order (root last)', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      root.addChild('b')
      const result = root.traverse('post').map((n) => n.getValue())
      expect(result).toEqual(['a', 'b', 'root'])
    })

    it('should traverse in level-order (breadth-first)', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      root.addChild('b')
      const result = root.traverse('level').map((n) => n.getValue())
      expect(result).toEqual(['root', 'a', 'b'])
    })

    it('should traverse deep tree in pre-order', () => {
      const root = new GraphTree('r')
      const a = root.addChild('a')
      const b = a.addChild('b')
      b.addChild('c')
      const result = root.traverse('pre').map((n) => n.getValue())
      expect(result).toEqual(['r', 'a', 'b', 'c'])
    })

    it('should traverse deep tree in post-order', () => {
      const root = new GraphTree('r')
      const a = root.addChild('a')
      const b = a.addChild('b')
      b.addChild('c')
      const result = root.traverse('post').map((n) => n.getValue())
      expect(result).toEqual(['c', 'b', 'a', 'r'])
    })

    it('should traverse deep tree in level-order', () => {
      const root = new GraphTree('r')
      root.addChild('a')
      root.addChild('b').addChild('c')
      const result = root.traverse('level').map((n) => n.getValue())
      expect(result).toEqual(['r', 'a', 'b', 'c'])
    })

    it('should traverse wide tree in pre-order', () => {
      const root = new GraphTree('r')
      for (let i = 0; i < 5; i++) root.addChild(i)
      const result = root.traverse('pre').map((n) => n.getValue())
      expect(result).toEqual(['r', 0, 1, 2, 3, 4])
    })

    it('should traverse wide tree in level-order', () => {
      const root = new GraphTree('r')
      for (let i = 0; i < 5; i++) root.addChild(i)
      const result = root.traverse('level').map((n) => n.getValue())
      expect(result).toEqual(['r', 0, 1, 2, 3, 4])
    })

    it('should traverse complex tree in level-order', () => {
      const root = new GraphTree('r')
      const a = root.addChild('a')
      const b = root.addChild('b')
      a.addChild('aa')
      a.addChild('ab')
      b.addChild('ba')
      const result = root.traverse('level').map((n) => n.getValue())
      expect(result).toEqual(['r', 'a', 'b', 'aa', 'ab', 'ba'])
    })

    it('should return correct count for all traversal orders', () => {
      const root = new GraphTree('r')
      root.addChild('a').addChild('aa')
      root.addChild('b')
      root.addChild('c').addChild('ca').addChild('caa')
      expect(root.traverse('pre')).toHaveLength(7)
      expect(root.traverse('post')).toHaveLength(7)
      expect(root.traverse('level')).toHaveLength(7)
    })

    it('should handle traversal on subtree', () => {
      const root = new GraphTree('r')
      const child = root.addChild('c')
      child.addChild('gc1')
      child.addChild('gc2')
      const result = child.traverse('pre').map((n) => n.getValue())
      expect(result).toEqual(['c', 'gc1', 'gc2'])
    })
  })

  describe('clone', () => {
    it('should clone a single node', () => {
      const tree = new GraphTree('root')
      const cloned = tree.clone()
      expect(cloned.getValue()).toBe('root')
      expect(cloned.getChildren()).toHaveLength(0)
    })

    it('should clone with children', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      root.addChild('b')
      const cloned = root.clone()
      expect(cloned.getChildren()).toHaveLength(2)
      expect(cloned.getChildren().map((c) => c.getValue())).toEqual(['a', 'b'])
    })

    it('should create independent copy', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      const cloned = root.clone()
      cloned.addChild('b')
      expect(root.getChildren()).toHaveLength(1)
      expect(cloned.getChildren()).toHaveLength(2)
    })

    it('should clone deep tree', () => {
      const root = new GraphTree('r')
      const c1 = root.addChild('c1')
      c1.addChild('c2').addChild('c3')
      const cloned = root.clone()
      expect(cloned.size).toBe(4)
    })

    it('should set correct parent in clone', () => {
      const root = new GraphTree('root')
      root.addChild('child')
      const cloned = root.clone()
      expect(cloned.isRoot).toBe(true)
      const clonedChild = cloned.getChildren()[0]!
      expect(clonedChild.getParent()).toBe(cloned)
    })

    it('should not affect original when modifying clone', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      const cloned = root.clone()
      cloned.setValue('modified')
      expect(root.getValue()).toBe('root')
    })

    it('should not affect clone when modifying original', () => {
      const root = new GraphTree('root')
      const cloned = root.clone()
      root.addChild('new child')
      expect(cloned.getChildren()).toHaveLength(0)
    })

    it('should clone empty tree', () => {
      const tree = new GraphTree<string>()
      const cloned = tree.clone()
      expect(cloned.getValue()).toBeUndefined()
      expect(cloned.getChildren()).toHaveLength(0)
    })

    it('should preserve object values in clone', () => {
      const tree = new GraphTree({ key: 'value' })
      const cloned = tree.clone()
      expect(cloned.getValue()).toEqual({ key: 'value' })
    })
  })

  describe('toString', () => {
    it('should stringify single node', () => {
      const tree = new GraphTree('root')
      expect(tree.toString()).toBe('root')
    })

    it('should stringify node with children', () => {
      const tree = new GraphTree('root')
      tree.addChild('a')
      tree.addChild('b')
      const str = tree.toString()
      expect(str).toContain('root')
      expect(str).toContain('a')
      expect(str).toContain('b')
    })

    it('should indent children', () => {
      const tree = new GraphTree('root')
      tree.addChild('child')
      const str = tree.toString()
      const lines = str.split('\n')
      expect(lines).toHaveLength(2)
      expect(lines[0]).toBe('root')
      expect(lines[1]).toBe('  child')
    })

    it('should indent grandchildren deeper', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      child.addChild('grandchild')
      const lines = root.toString().split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[0]).toBe('root')
      expect(lines[1]).toBe('  child')
      expect(lines[2]).toBe('    grandchild')
    })

    it('should handle numeric values', () => {
      const tree = new GraphTree(42)
      expect(tree.toString()).toBe('42')
    })

    it('should handle object values', () => {
      const tree = new GraphTree({ a: 1 })
      expect(tree.toString()).toBe('[object Object]')
    })
  })

  describe('edge cases', () => {
    it('should handle single node tree', () => {
      const tree = new GraphTree('only')
      expect(tree.isLeaf).toBe(true)
      expect(tree.isRoot).toBe(true)
      expect(tree.depth).toBe(0)
      expect(tree.height).toBe(0)
      expect(tree.size).toBe(1)
      expect(tree.getParent()).toBeNull()
      expect(tree.getChildren()).toEqual([])
    })

    it('should handle deep chain tree', () => {
      const root = new GraphTree(0)
      let current = root
      for (let i = 1; i <= 100; i++) {
        current = current.addChild(i)
      }
      expect(root.height).toBe(100)
      expect(root.size).toBe(101)
    })

    it('should handle wide tree', () => {
      const root = new GraphTree('root')
      const children: GraphTree<number>[] = []
      for (let i = 0; i < 50; i++) {
        children.push(root.addChild(i))
      }
      expect(root.getChildren()).toHaveLength(50)
      expect(root.height).toBe(1)
      expect(root.size).toBe(51)
    })

    it('should handle removing non-existent child', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      const stranger = new GraphTree('stranger')
      expect(root.removeChild(stranger)).toBe(false)
      expect(root.getChildren()).toHaveLength(1)
    })

    it('should handle adding after removal', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      root.removeChild(child)
      const newChild = root.addChild('newChild')
      expect(root.getChildren()).toHaveLength(1)
      expect(root.getChildren()[0]).toBe(newChild)
    })

    it('should handle type exports', () => {
      const order: TraversalOrder = 'pre'
      const predicate: GraphTreePredicate<string> = (n) => n.getValue() === 'test'
      expect(order).toBe('pre')
      expect(predicate(new GraphTree('test'))).toBe(true)
    })

    it('should handle GraphTreeNode type', () => {
      const node: GraphTreeNode<string> = {
        value: 'test',
        children: [],
        parent: null,
        isLeaf: true,
        isRoot: true,
        depth: 0,
        height: 0,
        size: 1,
      }
      expect(node.value).toBe('test')
      expect(node.isLeaf).toBe(true)
    })

    it('should handle same child not removed twice', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      expect(root.removeChild(child)).toBe(true)
      expect(root.removeChild(child)).toBe(false)
    })

    it('should maintain tree integrity after multiple operations', () => {
      const root = new GraphTree('root')
      const a = root.addChild('a')
      const b = root.addChild('b')
      const c = root.addChild('c')
      a.addChild('aa')
      a.addChild('ab')
      b.addChild('ba')
      root.removeChild(c)
      expect(root.size).toBe(6)
      expect(root.height).toBe(2)
      expect(root.getChildren()).toHaveLength(2)
    })

    it('should handle tree with only one path', () => {
      const root = new GraphTree('r')
      const a = root.addChild('a')
      const b = a.addChild('b')
      const c = b.addChild('c')
      expect(root.isLeaf).toBe(false)
      expect(a.isLeaf).toBe(false)
      expect(b.isLeaf).toBe(false)
      expect(c.isLeaf).toBe(true)
    })

    it('should handle value mutation not affecting structure', () => {
      const root = new GraphTree('root')
      root.addChild('child')
      root.setValue('newRoot')
      expect(root.getValue()).toBe('newRoot')
      expect(root.getChildren()).toHaveLength(1)
    })

    it('should handle deeply nested find', () => {
      const root = new GraphTree(0)
      let current = root
      for (let i = 1; i <= 50; i++) {
        current = current.addChild(i)
      }
      const found = root.find((n) => n.getValue() === 50)
      expect(found).toBeDefined()
      expect(found?.getValue()).toBe(50)
    })

    it('should handle findAll on large tree', () => {
      const root = new GraphTree(0)
      for (let i = 0; i < 20; i++) {
        const child = root.addChild(i)
        for (let j = 0; j < 5; j++) {
          child.addChild(i * 10 + j)
        }
      }
      const leaves = root.findAll((n) => n.isLeaf)
      expect(leaves).toHaveLength(100)
    })

    it('should handle toString on complex tree', () => {
      const root = new GraphTree('root')
      const a = root.addChild('a')
      const b = root.addChild('b')
      a.addChild('a1')
      a.addChild('a2')
      b.addChild('b1')
      const str = root.toString()
      const lines = str.split('\n')
      expect(lines.length).toBe(6)
    })

    it('should handle clone of subtree', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      child.addChild('gc1')
      child.addChild('gc2')
      const clonedChild = child.clone()
      expect(clonedChild.getValue()).toBe('child')
      expect(clonedChild.getChildren()).toHaveLength(2)
      expect(clonedChild.isRoot).toBe(true)
    })

    it('should handle traversal order type', () => {
      const root = new GraphTree('r')
      root.addChild('a')
      for (const order of ['pre', 'post', 'level'] as TraversalOrder[]) {
        const result = root.traverse(order)
        expect(result).toHaveLength(2)
      }
    })

    it('should handle remove child with grandchildren', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      child.addChild('gc1')
      child.addChild('gc2')
      expect(root.size).toBe(4)
      root.removeChild(child)
      expect(root.size).toBe(1)
      expect(child.size).toBe(3)
    })

    it('should handle empty string as value', () => {
      const tree = new GraphTree('')
      expect(tree.getValue()).toBe('')
      expect(tree.size).toBe(1)
    })

    it('should handle zero as value', () => {
      const tree = new GraphTree(0)
      expect(tree.getValue()).toBe(0)
      expect(tree.find((n) => n.getValue() === 0)).toBe(tree)
    })

    it('should handle false as value', () => {
      const tree = new GraphTree(false)
      expect(tree.getValue()).toBe(false)
    })

    it('should handle null as value', () => {
      const tree = new GraphTree<null>(null)
      expect(tree.getValue()).toBeNull()
    })

    it('should add many children to child node', () => {
      const root = new GraphTree('root')
      const child = root.addChild('child')
      for (let i = 0; i < 20; i++) {
        child.addChild(i)
      }
      expect(child.getChildren()).toHaveLength(20)
      expect(root.size).toBe(22)
    })

    it('should handle find on child subtree', () => {
      const root = new GraphTree('root')
      const a = root.addChild('a')
      a.addChild('aa')
      a.addChild('ab')
      root.addChild('b')
      const found = a.find((n) => n.getValue() === 'ab')
      expect(found).toBeDefined()
      expect(found?.getValue()).toBe('ab')
    })

    it('should handle findAll on child subtree', () => {
      const root = new GraphTree('root')
      const a = root.addChild('a')
      a.addChild('x')
      a.addChild('x')
      root.addChild('x')
      const found = a.findAll((n) => n.getValue() === 'x')
      expect(found).toHaveLength(2)
    })

    it('should handle traverse on leaf node', () => {
      const leaf = new GraphTree('leaf')
      expect(leaf.traverse('pre')).toHaveLength(1)
      expect(leaf.traverse('post')).toHaveLength(1)
      expect(leaf.traverse('level')).toHaveLength(1)
    })

    it('should handle multiple clone operations', () => {
      const root = new GraphTree('root')
      root.addChild('a')
      const c1 = root.clone()
      const c2 = root.clone()
      const c3 = c1.clone()
      c1.addChild('new')
      expect(root.getChildren()).toHaveLength(1)
      expect(c1.getChildren()).toHaveLength(2)
      expect(c2.getChildren()).toHaveLength(1)
      expect(c3.getChildren()).toHaveLength(1)
    })

    it('should handle removal of all children one by one', () => {
      const root = new GraphTree('root')
      const children: GraphTree<string>[] = []
      for (let i = 0; i < 5; i++) {
        children.push(root.addChild(String(i)))
      }
      for (const child of children) {
        root.removeChild(child)
      }
      expect(root.getChildren()).toHaveLength(0)
      expect(root.isLeaf).toBe(true)
      expect(root.size).toBe(1)
    })

    it('should handle interleaved add and remove', () => {
      const root = new GraphTree('root')
      const a = root.addChild('a')
      root.removeChild(a)
      const b = root.addChild('b')
      root.removeChild(b)
      root.addChild('c')
      expect(root.getChildren()).toHaveLength(1)
      expect(root.getChildren()[0]?.getValue()).toBe('c')
    })

    it('should handle height of balanced tree', () => {
      const root = new GraphTree('r')
      const a = root.addChild('a')
      const b = root.addChild('b')
      a.addChild('aa')
      a.addChild('ab')
      b.addChild('ba')
      b.addChild('bb')
      expect(root.height).toBe(2)
    })

    it('should handle depth of siblings being equal', () => {
      const root = new GraphTree('r')
      const a = root.addChild('a')
      const b = root.addChild('b')
      const c = root.addChild('c')
      expect(a.depth).toBe(1)
      expect(b.depth).toBe(1)
      expect(c.depth).toBe(1)
    })

    it('should handle size after subtree removal', () => {
      const root = new GraphTree('r')
      const a = root.addChild('a')
      a.addChild('aa')
      a.addChild('ab')
      root.addChild('b')
      expect(root.size).toBe(5)
      root.removeChild(a)
      expect(root.size).toBe(2)
    })

    it('should handle toString with numeric values', () => {
      const root = new GraphTree(1)
      root.addChild(2)
      root.addChild(3)
      const str = root.toString()
      expect(str).toContain('1')
      expect(str).toContain('2')
      expect(str).toContain('3')
    })

    it('should handle setValue on cloned tree', () => {
      const root = new GraphTree('original')
      const cloned = root.clone()
      cloned.setValue('modified')
      expect(root.getValue()).toBe('original')
      expect(cloned.getValue()).toBe('modified')
    })

    it('should handle complex tree traversal ordering', () => {
      const root = new GraphTree('1')
      const a = root.addChild('2')
      const b = root.addChild('3')
      a.addChild('4')
      const ab = a.addChild('5')
      ab.addChild('6')
      b.addChild('7')
      const pre = root.traverse('pre').map((n) => n.getValue())
      const post = root.traverse('post').map((n) => n.getValue())
      const level = root.traverse('level').map((n) => n.getValue())
      expect(pre).toEqual(['1', '2', '4', '5', '6', '3', '7'])
      expect(post).toEqual(['4', '6', '5', '2', '7', '3', '1'])
      expect(level).toEqual(['1', '2', '3', '4', '5', '7', '6'])
    })

    it('should handle find returning root itself', () => {
      const tree = new GraphTree('root')
      expect(tree.find((n) => n.getValue() === 'root')).toBe(tree)
    })

    it('should handle findAll returning all nodes', () => {
      const root = new GraphTree('r')
      root.addChild('a')
      root.addChild('b')
      const all = root.findAll(() => true)
      expect(all).toHaveLength(3)
    })

    it('should handle getChildren returning copy on empty', () => {
      const tree = new GraphTree('leaf')
      const children = tree.getChildren()
      expect(children).toEqual([])
      children.push(new GraphTree('intruder'))
      expect(tree.getChildren()).toEqual([])
    })

    it('should handle adding duplicate values', () => {
      const root = new GraphTree('val')
      root.addChild('val')
      root.addChild('val')
      const all = root.findAll((n) => n.getValue() === 'val')
      expect(all).toHaveLength(3)
    })

    it('should handle clone preserving height', () => {
      const root = new GraphTree('r')
      root.addChild('a').addChild('b')
      const cloned = root.clone()
      expect(cloned.height).toBe(root.height)
    })

    it('should handle clone preserving depth of children', () => {
      const root = new GraphTree('r')
      root.addChild('a').addChild('b')
      const cloned = root.clone()
      const clonedA = cloned.getChildren()[0]!
      expect(clonedA.depth).toBe(1)
      const clonedB = clonedA.getChildren()[0]!
      expect(clonedB.depth).toBe(2)
    })
  })
})
