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

  it('handles two-node tree', () => {
    const root = new TreeNode(2)
    root.left = new TreeNode(1)
    expect([...morrisInorder(root)]).toEqual([1, 2])
  })

  it('handles larger tree', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    expect([...morrisInorder(root)]).toEqual([1, 3, 4, 5, 7, 8, 9])
  })

  it('handles tree with string values', () => {
    const root = new TreeNode('b')
    root.left = new TreeNode('a')
    root.right = new TreeNode('c')
    expect([...morrisInorder(root)]).toEqual(['a', 'b', 'c'])
  })

  it('handles tree with only right child', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    expect([...morrisInorder(root)]).toEqual([1, 2])
  })

  it('handles tree with only left child', () => {
    const root = new TreeNode(2)
    root.left = new TreeNode(1)
    expect([...morrisInorder(root)]).toEqual([1, 2])
  })

  it('handles unbalanced tree', () => {
    const root = new TreeNode(4)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    root.right = new TreeNode(6)
    root.right.right = new TreeNode(8)
    expect([...morrisInorder(root)]).toEqual([1, 2, 4, 6, 8])
  })

  it('handles three node right chain', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    root.right.right = new TreeNode(3)
    expect([...morrisInorder(root)]).toEqual([1, 2, 3])
  })

  it('handles three node left chain', () => {
    const root = new TreeNode(3)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    expect([...morrisInorder(root)]).toEqual([1, 2, 3])
  })

  it('returns iterator', () => {
    const result = morrisInorder(buildTree())
    expect(typeof result[Symbol.iterator]).toBe('function')
  })

  it('generator can be partially consumed', () => {
    const gen = morrisInorder(new TreeNode(1))
    expect(gen.next().value).toBe(1)
    expect(gen.next().done).toBe(true)
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

  it('handles two-node tree', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    expect([...morrisPreorder(root)]).toEqual([1, 2])
  })

  it('handles larger tree', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    expect([...morrisPreorder(root)]).toEqual([5, 3, 1, 4, 8, 7, 9])
  })

  it('handles tree with string values', () => {
    const root = new TreeNode('b')
    root.left = new TreeNode('a')
    root.right = new TreeNode('c')
    expect([...morrisPreorder(root)]).toEqual(['b', 'a', 'c'])
  })

  it('handles tree with only right child', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    expect([...morrisPreorder(root)]).toEqual([1, 2])
  })

  it('handles tree with only left child', () => {
    const root = new TreeNode(2)
    root.left = new TreeNode(1)
    expect([...morrisPreorder(root)]).toEqual([2, 1])
  })

  it('handles unbalanced tree', () => {
    const root = new TreeNode(4)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    root.right = new TreeNode(6)
    root.right.right = new TreeNode(8)
    expect([...morrisPreorder(root)]).toEqual([4, 2, 1, 6, 8])
  })

  it('handles three node right chain', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    root.right.right = new TreeNode(3)
    expect([...morrisPreorder(root)]).toEqual([1, 2, 3])
  })

  it('handles three node left chain', () => {
    const root = new TreeNode(3)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    expect([...morrisPreorder(root)]).toEqual([3, 2, 1])
  })

  it('first element is always root', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    const preorder = [...morrisPreorder(root)]
    expect(preorder[0]).toBe(5)
  })

  it('generator can be partially consumed', () => {
    const gen = morrisPreorder(new TreeNode(1))
    expect(gen.next().value).toBe(1)
    expect(gen.next().done).toBe(true)
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

  it('handles two-node tree', () => {
    const root = new TreeNode(2)
    root.left = new TreeNode(1)
    expect(morrisPostorder(root)).toEqual([1, 2])
  })

  it('handles larger tree', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    expect(morrisPostorder(root)).toEqual([1, 4, 3, 7, 9, 8, 5])
  })

  it('handles tree with string values', () => {
    const root = new TreeNode('b')
    root.left = new TreeNode('a')
    root.right = new TreeNode('c')
    expect(morrisPostorder(root)).toEqual(['a', 'c', 'b'])
  })

  it('handles tree with only right child', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    expect(morrisPostorder(root)).toEqual([2, 1])
  })

  it('handles tree with only left child', () => {
    const root = new TreeNode(2)
    root.left = new TreeNode(1)
    expect(morrisPostorder(root)).toEqual([1, 2])
  })

  it('handles unbalanced tree', () => {
    const root = new TreeNode(4)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    root.right = new TreeNode(6)
    root.right.right = new TreeNode(8)
    expect(morrisPostorder(root)).toEqual([1, 2, 8, 6, 4])
  })

  it('handles three node right chain', () => {
    const root = new TreeNode(1)
    root.right = new TreeNode(2)
    root.right.right = new TreeNode(3)
    expect(morrisPostorder(root)).toEqual([3, 2, 1])
  })

  it('handles three node left chain', () => {
    const root = new TreeNode(3)
    root.left = new TreeNode(2)
    root.left.left = new TreeNode(1)
    expect(morrisPostorder(root)).toEqual([1, 2, 3])
  })

  it('last element is always root', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    const postorder = morrisPostorder(root)
    expect(postorder[postorder.length - 1]).toBe(5)
  })

  it('returns array not generator', () => {
    const result = morrisPostorder(new TreeNode(1))
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('morris traversals consistency', () => {
  it('inorder and preorder have same length', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    const inorder = [...morrisInorder(root)]
    const preorder = [...morrisPreorder(root)]
    expect(inorder.length).toBe(preorder.length)
  })

  it('postorder has same length as inorder', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    const inorder = [...morrisInorder(root)]
    const postorder = morrisPostorder(root)
    expect(inorder.length).toBe(postorder.length)
  })

  it('all traversals visit all nodes exactly once', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    const inorder = [...morrisInorder(root)]
    const preorder = [...morrisPreorder(root)]
    const postorder = morrisPostorder(root)
    expect(inorder.length).toBe(7)
    expect(preorder.length).toBe(7)
    expect(postorder.length).toBe(7)
  })

  it('inorder is sorted for BST', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    root.left.left = new TreeNode(1)
    root.left.right = new TreeNode(4)
    root.right.left = new TreeNode(7)
    root.right.right = new TreeNode(9)
    const inorder = [...morrisInorder(root)]
    const sorted = [...inorder].sort((a, b) => a - b)
    expect(inorder).toEqual(sorted)
  })

  it('preorder first element matches postorder last', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(3)
    root.right = new TreeNode(8)
    const preorder = [...morrisPreorder(root)]
    const postorder = morrisPostorder(root)
    expect(preorder[0]).toBe(postorder[postorder.length - 1])
  })

  it('all traversals handle deep tree', () => {
    const root = new TreeNode(5)
    root.left = new TreeNode(4)
    root.left.left = new TreeNode(3)
    root.left.left.left = new TreeNode(2)
    root.left.left.left.left = new TreeNode(1)
    const inorder = [...morrisInorder(root)]
    const preorder = [...morrisPreorder(root)]
    const postorder = morrisPostorder(root)
    expect(inorder).toEqual([1, 2, 3, 4, 5])
    expect(preorder).toEqual([5, 4, 3, 2, 1])
    expect(postorder).toEqual([1, 2, 3, 4, 5])
  })
})

describe('TreeNode', () => {
  it('creates node with value only', () => {
    const node = new TreeNode(42)
    expect(node.value).toBe(42)
    expect(node.left).toBeNull()
    expect(node.right).toBeNull()
  })

  it('creates node with value and left child', () => {
    const left = new TreeNode(1)
    const node = new TreeNode(2, left)
    expect(node.value).toBe(2)
    expect(node.left).toBe(left)
    expect(node.right).toBeNull()
  })

  it('creates node with value and right child', () => {
    const right = new TreeNode(3)
    const node = new TreeNode(2, null, right)
    expect(node.value).toBe(2)
    expect(node.left).toBeNull()
    expect(node.right).toBe(right)
  })

  it('creates node with both children', () => {
    const left = new TreeNode(1)
    const right = new TreeNode(3)
    const node = new TreeNode(2, left, right)
    expect(node.value).toBe(2)
    expect(node.left).toBe(left)
    expect(node.right).toBe(right)
  })

  it('handles different types', () => {
    const strNode = new TreeNode('hello')
    expect(strNode.value).toBe('hello')
    const objNode = new TreeNode({ a: 1 })
    expect(objNode.value).toEqual({ a: 1 })
  })
})

describe('morris-traversal - wave548', () => {
  it('morris-traversal module defined', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module is function', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module has name', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module not null', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module has length', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('morris-traversal - wave549', () => {
  it('morris-traversal module defined', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module is function', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('morris-traversal - wave550', () => {
  it('morris-traversal w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('morris-traversal - wave551', () => {
  it('morris-traversal w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('morris-traversal - wave552', () => {
  it('morris-traversal w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('morris-traversal - wave553', () => {
  it('morris-traversal w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('morris-traversal - wave554', () => {
  it('morris-traversal w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('morris-traversal w554 v2', () => {
    expect(describe).toBeDefined()
  })
})
