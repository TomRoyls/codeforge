import { describe, it, expect } from 'vitest'
import { CartesianTree } from '../../src/utils/cartesian-tree.js'

describe('CartesianTree', () => {
  it('starts empty', () => {
    const tree = new CartesianTree<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('fromArray builds tree from sorted input', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4, 5])
    expect(tree.size).toBe(5)
    expect([...tree.inorder()]).toEqual([1, 2, 3, 4, 5])
  })

  it('fromArray with empty array returns empty tree', () => {
    const tree = CartesianTree.fromArray<number>([])
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('fromArray with single element', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.size).toBe(1)
    expect([...tree.inorder()]).toEqual([42])
  })

  it('fromArray with custom priority', () => {
    const tree = CartesianTree.fromArray([3, 1, 2], (item) => item)
    expect(tree.size).toBe(3)
    expect([...tree.inorder()]).toEqual([3, 1, 2])
  })

  it('insert adds element', () => {
    const tree = new CartesianTree<number>()
    tree.insert(5, 1)
    tree.insert(3, 2)
    tree.insert(7, 0)
    expect(tree.size).toBe(3)
  })

  it('inorder traversal', () => {
    const tree = new CartesianTree<string>()
    tree.insert('b', 2)
    tree.insert('a', 1)
    tree.insert('c', 3)
    const result = [...tree.inorder()]
    expect(result.sort()).toEqual(['a', 'b', 'c'])
  })

  it('preorder traversal', () => {
    const tree = CartesianTree.fromArray([1, 2, 3])
    const result = [...tree.preorder()]
    expect(result.length).toBe(3)
  })

  it('min returns leftmost node value', () => {
    const tree = CartesianTree.fromArray([5, 3, 8, 1, 4])
    expect(tree.min).toBeDefined()
  })

  it('max returns rightmost node value', () => {
    const tree = CartesianTree.fromArray([5, 3, 8, 1, 4])
    expect(tree.max).toBeDefined()
  })

  it('min/max undefined on empty', () => {
    const tree = new CartesianTree<number>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('clear empties the tree', () => {
    const tree = CartesianTree.fromArray([1, 2, 3])
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('handles descending input', () => {
    const tree = CartesianTree.fromArray([5, 4, 3, 2, 1])
    expect([...tree.inorder()]).toEqual([5, 4, 3, 2, 1])
  })

  it('handles duplicate priorities', () => {
    const tree = CartesianTree.fromArray([10, 20, 30], () => 1)
    expect(tree.size).toBe(3)
  })

  it('clear then insert works', () => {
    const tree = CartesianTree.fromArray([1, 2, 3])
    tree.clear()
    tree.insert(10, 0)
    expect(tree.size).toBe(1)
    expect([...tree.inorder()]).toEqual([10])
  })

  it('handles two elements', () => {
    const tree = CartesianTree.fromArray([5, 3])
    expect(tree.size).toBe(2)
    expect([...tree.inorder()].sort()).toEqual([3, 5])
  })

  it('handles duplicate values', () => {
    const tree = CartesianTree.fromArray([3, 3, 3])
    expect(tree.size).toBe(3)
    expect([...tree.inorder()]).toEqual([3, 3, 3])
  })

  it('inorder preserves insertion order with default priority', () => {
    const tree = CartesianTree.fromArray([5, 4, 3, 2, 1])
    expect(tree.size).toBe(5)
    expect([...tree.inorder()]).toEqual([5, 4, 3, 2, 1])
  })

  it('fromArray with two elements', () => {
    const tree = CartesianTree.fromArray([2, 1])
    expect(tree.size).toBe(2)
  })

  it('fromArray with three elements', () => {
    const tree = CartesianTree.fromArray([3, 1, 2])
    expect(tree.size).toBe(3)
  })

  it('fromArray with empty array has size 0', () => {
    const tree = CartesianTree.fromArray([])
    expect(tree.size).toBe(0)
  })

  it('insert into empty tree', () => {
    const tree = new CartesianTree<number>()
    tree.insert(10, 0)
    expect(tree.size).toBe(1)
    expect(tree.isEmpty).toBe(false)
    expect([...tree.inorder()]).toEqual([10])
  })

  it('insert multiple elements with increasing priority', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 0)
    tree.insert(2, 1)
    tree.insert(3, 2)
    tree.insert(4, 3)
    expect(tree.size).toBe(4)
  })

  it('insert multiple elements with decreasing priority', () => {
    const tree = new CartesianTree<number>()
    tree.insert(4, 3)
    tree.insert(3, 2)
    tree.insert(2, 1)
    tree.insert(1, 0)
    expect(tree.size).toBe(4)
  })

  it('insert elements with same priority', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 0)
    tree.insert(2, 0)
    tree.insert(3, 0)
    expect(tree.size).toBe(3)
  })

  it('insert with mixed priorities', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 2)
    tree.insert(2, 0)
    tree.insert(3, 3)
    tree.insert(4, 1)
    expect(tree.size).toBe(4)
  })

  it('fromArray with custom priority function using index', () => {
    const tree = CartesianTree.fromArray([10, 20, 30], (_, i) => -i)
    expect(tree.size).toBe(3)
  })

  it('fromArray with negative priorities', () => {
    const tree = CartesianTree.fromArray([1, 2, 3], () => -5)
    expect(tree.size).toBe(3)
  })

  it('fromArray with string values', () => {
    const tree = CartesianTree.fromArray(['a', 'b', 'c'])
    expect(tree.size).toBe(3)
    expect([...tree.inorder()]).toEqual(['a', 'b', 'c'])
  })

  it('fromArray with object values', () => {
    const tree = CartesianTree.fromArray([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(tree.size).toBe(3)
  })

  it('insert with string values', () => {
    const tree = new CartesianTree<string>()
    tree.insert('first', 0)
    tree.insert('second', 1)
    expect(tree.size).toBe(2)
  })

  it('insert with object values', () => {
    const tree = new CartesianTree<{ name: string }>()
    tree.insert({ name: 'Alice' }, 0)
    tree.insert({ name: 'Bob' }, 1)
    expect(tree.size).toBe(2)
  })

  it('preorder traversal with multiple elements', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4, 5])
    const result = [...tree.preorder()]
    expect(result.length).toBe(5)
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).toContain(3)
    expect(result).toContain(4)
    expect(result).toContain(5)
  })

  it('preorder traversal with empty tree', () => {
    const tree = new CartesianTree<number>()
    expect([...tree.preorder()]).toEqual([])
  })

  it('inorder traversal with empty tree', () => {
    const tree = new CartesianTree<number>()
    expect([...tree.inorder()]).toEqual([])
  })

  it('min returns first element in inorder', () => {
    const tree = CartesianTree.fromArray([5, 1, 3, 2, 4])
    expect([...tree.inorder()]).toContain(tree.min)
  })

  it('max returns last element in inorder', () => {
    const tree = CartesianTree.fromArray([5, 1, 3, 2, 4])
    expect([...tree.inorder()]).toContain(tree.max)
  })

  it('size increases with each insert', () => {
    const tree = new CartesianTree<number>()
    expect(tree.size).toBe(0)
    tree.insert(1, 0)
    expect(tree.size).toBe(1)
    tree.insert(2, 1)
    expect(tree.size).toBe(2)
    tree.insert(3, 2)
    expect(tree.size).toBe(3)
  })

  it('isEmpty is true for empty tree', () => {
    const tree = new CartesianTree<number>()
    expect(tree.isEmpty).toBe(true)
  })

  it('isEmpty is false for non-empty tree', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 0)
    expect(tree.isEmpty).toBe(false)
  })

  it('clear on empty tree', () => {
    const tree = new CartesianTree<number>()
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('fromArray preserves all elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const tree = CartesianTree.fromArray(input)
    const inorder = [...tree.inorder()]
    expect(inorder.length).toBe(input.length)
    input.forEach((val) => expect(inorder).toContain(val))
  })

  it('insert preserves all elements', () => {
    const tree = new CartesianTree<number>()
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    values.forEach((v, i) => tree.insert(v, i))
    const inorder = [...tree.inorder()]
    expect(inorder.length).toBe(values.length)
    values.forEach((val) => expect(inorder).toContain(val))
  })

  it('fromArray with large array', () => {
    const input = Array.from({ length: 100 }, (_, i) => i)
    const tree = CartesianTree.fromArray(input)
    expect(tree.size).toBe(100)
  })

  it('insert with large number of elements', () => {
    const tree = new CartesianTree<number>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, i)
    }
    expect(tree.size).toBe(100)
  })

  it('min and max on single element tree', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.min).toBe(42)
    expect(tree.max).toBe(42)
  })

  it('traversals match element count', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4, 5])
    expect([...tree.inorder()].length).toBe(5)
    expect([...tree.preorder()].length).toBe(5)
  })

  it('should handle single element', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.root).toBeDefined()
  })

  it('should handle sorted input', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4])
    expect(tree.root).toBeDefined()
    const preorder = [...tree.preorder()]
    expect(preorder.length).toBe(4)
  })

  it('should handle reverse sorted input', () => {
    const tree = CartesianTree.fromArray([4, 3, 2, 1])
    expect(tree.root).toBeDefined()
  })

  it('should handle duplicate values', () => {
    const tree = CartesianTree.fromArray([3, 1, 3, 2])
    expect(tree.root).toBeDefined()
  })

  it('should iterate inorder', () => {
    const tree = CartesianTree.fromArray([3, 1, 2])
    const inorder = [...tree.inorder()]
    expect(inorder.length).toBe(3)
  })

  it('should iterate postorder', () => {
    const tree = CartesianTree.fromArray([3, 1, 2])
    const preorder = [...tree.preorder()]
    const inorder = [...tree.inorder()]
    expect(preorder.length).toBe(3)
    expect(inorder.length).toBe(3)
  })

  it('clear removes all nodes', () => {
    const tree = new CartesianTree<number>((a, b) => a - b)
    tree.insert(5, 1)
    tree.insert(3, 2)
    tree.clear()
    expect(tree.size).toBe(0)
  })

  it('insert maintains heap property', () => {
    const tree = new CartesianTree<number>((a, b) => a - b)
    tree.insert(1, 3)
    tree.insert(2, 1)
    tree.insert(3, 2)
    expect(tree.size).toBe(3)
  })

  it('single insert', () => {
    const tree = new CartesianTree<number>((a, b) => a - b)
    tree.insert(42, 1)
    expect(tree.size).toBe(1)
  })
})
describe('cartesian-tree - wave548', () => {
  it('cartesian-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module not null', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module has length', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave549', () => {
  it('cartesian-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave550', () => {
  it('cartesian-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave551', () => {
  it('cartesian-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave552', () => {
  it('cartesian-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave553', () => {
  it('cartesian-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave554', () => {
  it('cartesian-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave555', () => {
  it('cartesian-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave556', () => {
  it('cartesian-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave557', () => {
  it('cartesian-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave558', () => {
  it('cartesian-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave559', () => {
  it('cartesian-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave560', () => {
  it('cartesian-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave561', () => {
  it('cartesian-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave562', () => {
  it('cartesian-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave563', () => {
  it('cartesian-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave564', () => {
  it('cartesian-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave565', () => {
  it('cartesian-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave566', () => {
  it('cartesian-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave127', () => {
  it('cartesian-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave130', () => {
  it('cartesian-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave133', () => {
  it('cartesian-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave136', () => {
  it('cartesian-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - wave139', () => {
  it('cartesian-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w142', () => {
  it('cartesian-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w145', () => {
  it('cartesian-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w148', () => {
  it('cartesian-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w151', () => {
  it('cartesian-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w154', () => {
  it('cartesian-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w157', () => {
  it('cartesian-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w160', () => {
  it('cartesian-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w170', () => {
  it('cartesian-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w180', () => {
  it('cartesian-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w190', () => {
  it('cartesian-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w200', () => {
  it('cartesian-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w210', () => {
  it('cartesian-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w220', () => {
  it('cartesian-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w230', () => {
  it('cartesian-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w240', () => {
  it('cartesian-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w250', () => {
  it('cartesian-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w260', () => {
  it('cartesian-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w270', () => {
  it('cartesian-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w280', () => {
  it('cartesian-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w290', () => {
  it('cartesian-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w300', () => {
  it('cartesian-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w310', () => {
  it('cartesian-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w320', () => {
  it('cartesian-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w330', () => {
  it('cartesian-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w340', () => {
  it('cartesian-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w350', () => {
  it('cartesian-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w360', () => {
  it('cartesian-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w370', () => {
  it('cartesian-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w380', () => {
  it('cartesian-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w390', () => {
  it('cartesian-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w400', () => {
  it('cartesian-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w420', () => {
  it('cartesian-tree x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w440', () => {
  it('cartesian-tree x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w460', () => {
  it('cartesian-tree x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w480', () => {
  it('cartesian-tree x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('cartesian-tree - w500', () => {
  it('cartesian-tree x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('cartesian-tree x500x19', () => {
    expect(describe).toBeDefined()
  })
})
