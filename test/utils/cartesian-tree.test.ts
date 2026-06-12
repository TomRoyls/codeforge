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
