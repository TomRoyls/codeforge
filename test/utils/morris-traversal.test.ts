import { describe, it, expect } from 'vitest'
import { TreeNode, morrisInorder, morrisPreorder, morrisPostorder } from '../../src/utils/morris-traversal.js'

function buildTree(): TreeNode<number> {
  const root = new TreeNode(4)
  root.left = new TreeNode(2)
  root.right = new TreeNode(6)
  root.left.left = new TreeNode(1)
  root.left.right = new TreeNode(3)
  root.right.left = new TreeNode(5)
  root.right.right = new TreeNode(7)
  return root
}

describe('morrisInorder', () => {
  it('traverses balanced BST inorder', () => {
    expect([...morrisInorder(buildTree())]).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('handles single node', () => {
    expect([...morrisInorder(new TreeNode(42))]).toEqual([42])
  })

  it('handles null root', () => {
    expect([...morrisInorder(null)]).toEqual([])
  })

  it('handles left-skewed tree', () => {
    const root = new TreeNode(3)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    expect([...morrisInorder(root)]).toEqual([1, 2, 3])
  })

  it('handles right-skewed tree', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    root.right.right = new TreeNode(3)
    expect([...morrisInorder(root)]).toEqual([1, 2, 3])
  })
})

describe('morrisPreorder', () => {
  it('traverses balanced BST preorder', () => {
    expect([...morrisPreorder(buildTree())]).toEqual([4, 2, 1, 3, 6, 5, 7])
  })

  it('handles single node', () => {
    expect([...morrisPreorder(new TreeNode(42))]).toEqual([42])
  })

  it('handles null root', () => {
    expect([...morrisPreorder(null)]).toEqual([])
  })

  it('handles left-skewed tree', () => {
    const root = new TreeNode(3)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    expect([...morrisPreorder(root)]).toEqual([3, 2, 1])
  })

  it('handles right-skewed tree', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    root.right.right = new TreeNode(3)
    expect([...morrisPreorder(root)]).toEqual([1, 2, 3])
  })
})

describe('morrisPostorder', () => {
  it('traverses balanced BST postorder', () => {
    expect(morrisPostorder(buildTree())).toEqual([1, 3, 2, 5, 7, 6, 4])
  })

  it('handles single node', () => {
    expect(morrisPostorder(new TreeNode(42))).toEqual([42])
  })

  it('handles null root', () => {
    expect(morrisPostorder(null)).toEqual([])
  })

  it('handles left-skewed tree', () => {
    const root = new TreeNode(3)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    expect(morrisPostorder(root)).toEqual([1, 2, 3])
  })

  it('handles right-skewed tree', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    root.right.right = new TreeNode(3)
    expect(morrisPostorder(root)).toEqual([3, 2, 1])
  })
})

describe('morris traversals additional', () => {
  it('morrisInorder handles two-node tree', () => {
    const root = new TreeNode(2)
    root.left = new TreeNode(1)
    expect([...morrisInorder(root)]).toEqual([1, 2])
  })

  it('morrisPreorder handles two-node tree', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    expect([...morrisPreorder(root)]).toEqual([1, 2])
  })

  it('morrisPostorder handles two-node tree', () => {
    const root = new TreeNode(2)
    root.left = new TreeNode(1)
    expect(morrisPostorder(root)).toEqual([1, 2])
  })

  it('all traversals are consistent for a larger tree', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    const inorder = [...morrisInorder(root)]
    expect(inorder).toEqual([1, 3, 4, 5, 7, 8, 9])
    const preorder = [...morrisPreorder(root)]
    expect(preorder[0]).toBe(5)
    const postorder = morrisPostorder(root)
    expect(postorder[postorder.length - 1]).toBe(5)
  })

  it('empty tree returns empty arrays', () => {
    expect([...morrisInorder(null)]).toEqual([])
    expect([...morrisPreorder(null)]).toEqual([])
  })
})
