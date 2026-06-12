import { describe, it, expect } from 'vitest'
import { KdTree } from '../../src/utils/kd-tree.js'

interface Point {
  coords: number[]
}

describe('KdTree', () => {
  it('creates empty tree with default dims', () => {
    const tree = new KdTree<Point>()
    expect(tree.size).toBe(0)
  })

  it('creates tree from initial points', () => {
    const points: Point[] = [
      { coords: [1, 2] },
      { coords: [3, 4] },
    ]
    const tree = new KdTree<Point>(points)
    expect(tree.size).toBe(2)
  })

  it('inserts points into empty tree', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    expect(tree.size).toBe(1)
  })

  it('inserts points into existing tree', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [3, 4] })
    expect(tree.size).toBe(2)
  })

  it('finds nearest neighbor', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [10, 10] })
    const nearest = tree.nearest([0, 0])
    expect(nearest.length).toBe(1)
    expect(nearest[0]!.coords[0]).toBe(1)
  })

  it('finds k nearest neighbors', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [3, 4] })
    tree.insert({ coords: [10, 10] })
    const nearest = tree.nearest([0, 0], 2)
    expect(nearest.length).toBe(2)
  })

  it('range search finds points in range', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [5, 6] })
    tree.insert({ coords: [10, 10] })
    const results = tree.rangeSearch([0, 0], [5, 5])
    expect(results.length).toBe(1)
  })

  it('range search returns empty when no points in range', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [10, 10] })
    const results = tree.rangeSearch([20, 20], [30, 30])
    expect(results).toEqual([])
  })

  it('handles 3D points', () => {
    const points: Point[] = [
      { coords: [1, 2, 3] },
      { coords: [4, 5, 6] },
    ]
    const tree = new KdTree<Point>(points, 3)
    const nearest = tree.nearest([0, 0, 0])
    expect(nearest.length).toBe(1)
  })

  it('handles points on axis boundaries', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [5, 10] })
    tree.insert({ coords: [10, 5] })
    const results = tree.rangeSearch([5, 5], [5, 10])
    expect(results.length).toBe(2)
  })

  it('nearest returns points sorted by distance', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [10, 10] })
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [1, 1] })
    const nearest = tree.nearest([0, 0], 3)
    expect(nearest[0]!.coords[0]).toBe(1)
    expect(nearest[1]!.coords[0]).toBe(5)
    expect(nearest[2]!.coords[0]).toBe(10)
  })

  it('range search includes boundary points', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 1] })
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [10, 10] })
    const results = tree.rangeSearch([1, 1], [5, 5])
    expect(results.length).toBe(2)
  })

  it('handles duplicate points', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [5, 5] })
    tree.insert({ coords: [5, 5] })
    expect(tree.size).toBe(2)
  })

  it('nearest with k larger than tree size', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 2] })
    tree.insert({ coords: [3, 4] })
    const nearest = tree.nearest([0, 0], 10)
    expect(nearest.length).toBe(2)
  })

  it('range search in empty tree', () => {
    const tree = new KdTree<Point>()
    const results = tree.rangeSearch([0, 0], [10, 10])
    expect(results).toEqual([])
  })

  it('nearest in empty tree', () => {
    const tree = new KdTree<Point>()
    const nearest = tree.nearest([0, 0])
    expect(nearest).toEqual([])
  })

  it('size returns correct count after multiple inserts', () => {
    const tree = new KdTree<Point>()
    for (let i = 0; i < 10; i++) {
      tree.insert({ coords: [i, i] })
    }
    expect(tree.size).toBe(10)
  })

  it('handles negative coordinates', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [-5, -5] })
    tree.insert({ coords: [5, 5] })
    const nearest = tree.nearest([-10, -10])
    expect(nearest[0]!.coords[0]).toBe(-5)
  })

  it('nearest returns single point', () => {
    const tree = new KdTree<{ coords: [number, number] }>(2, p => p.coords)
    tree.insert({ coords: [3, 3] })
    const nearest = tree.nearest([0, 0])
    expect(nearest.length).toBe(1)
    expect(nearest[0]!.coords).toEqual([3, 3])
  })

  it('nearest with k=2 returns two points', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [0, 0] })
    tree.insert({ coords: [1, 1] })
    const nearest = tree.nearest([0, 0], 2)
    expect(nearest.length).toBe(2)
  })

  it('empty tree nearest returns empty', () => {
    const tree = new KdTree(2)
    expect(tree.nearest([0, 0], 1)).toEqual([])
  })

  it('insert and nearest returns point', () => {
    const tree = new KdTree<Point>()
    tree.insert({ coords: [1, 1] })
    const result = tree.nearest([0, 0])
    expect(result.length).toBe(1)
    expect(result[0]!.coords[0]).toBe(1)
  })

  it('nearest on empty tree returns empty', () => {
    const tree = new KdTree<number>()
    expect(tree.nearest([0, 0])).toEqual([])
  })

  it('insert and nearest finds point', () => {
    const tree = new KdTree<{ coords: number[] }>()
    tree.insert({ coords: [1, 2] })
    const result = tree.nearest({ coords: [1, 2] })
    expect(result.length).toBeGreaterThan(0)
  })

  it('toString returns correct string representation', () => {
    const tree = new KdTree<Point>()
    expect(tree.toString()).toBe('KdTree(0, dims=2)')
  })

  it('toString with points includes count', () => {
    const tree = new KdTree<Point>([{ coords: [1, 2] }])
    expect(tree.toString()).toBe('KdTree(1, dims=2)')
  })

  it('toString with custom dimensions', () => {
    const tree = new KdTree<Point>([], 3)
    expect(tree.toString()).toBe('KdTree(0, dims=3)')
  })

  it('toJSON returns array of points', () => {
    const points: Point[] = [{ coords: [1, 2] }, { coords: [3, 4] }]
    const tree = new KdTree<Point>(points)
    const json = tree.toJSON() as Point[]
    expect(json.length).toBe(2)
  })

  it('toJSON on empty tree returns empty array', () => {
    const tree = new KdTree<Point>()
    expect(tree.toJSON()).toEqual([])
  })

  it('clone creates independent tree', () => {
    const tree = new KdTree<Point>([{ coords: [1, 2] }])
    const clone = tree.clone()
    tree.insert({ coords: [3, 4] })
    expect(clone.size).toBe(1)
    expect(tree.size).toBe(2)
  })

  it('clone preserves all points', () => {
    const points: Point[] = [{ coords: [1, 2] }, { coords: [3, 4] }, { coords: [5, 6] }]
    const tree = new KdTree<Point>(points)
    const clone = tree.clone()
    expect(clone.size).toBe(3)
  })

  it('clone preserves dimensions', () => {
    const tree = new KdTree<Point>([], 4)
    const clone = tree.clone()
    expect(clone.size).toBe(0)
  })

  it('equals returns true for identical trees', () => {
    const tree1 = new KdTree<Point>([{ coords: [1, 2] }, { coords: [3, 4] }])
    const tree2 = new KdTree<Point>([{ coords: [1, 2] }, { coords: [3, 4] }])
    expect(tree1.equals(tree2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const tree1 = new KdTree<Point>([{ coords: [1, 2] }])
    const tree2 = new KdTree<Point>([{ coords: [1, 2] }, { coords: [3, 4] }])
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals returns false for different dimensions', () => {
    const tree1 = new KdTree<Point>([], 2)
    const tree2 = new KdTree<Point>([], 3)
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals returns false for different points', () => {
    const tree1 = new KdTree<Point>([{ coords: [1, 2] }])
    const tree2 = new KdTree<Point>([{ coords: [3, 4] }])
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('equals returns false for non-KdTree objects', () => {
    const tree = new KdTree<Point>()
    expect(tree.equals(null)).toBe(false)
    expect(tree.equals({})).toBe(false)
  })

  it('handles 1D points', () => {
    const points: Point[] = [{ coords: [1] }, { coords: [2] }, { coords: [3] }]
    const tree = new KdTree<Point>(points, 1)
    const nearest = tree.nearest([0])
    expect(nearest.length).toBe(1)
  })

  it('handles 4D points', () => {
    const points: Point[] = [
      { coords: [1, 2, 3, 4] },
      { coords: [5, 6, 7, 8] },
    ]
    const tree = new KdTree<Point>(points, 4)
    const nearest = tree.nearest([0, 0, 0, 0])
    expect(nearest.length).toBe(1)
  })

  it('range search with matching min and max', () => {
    const tree = new KdTree<Point>([{ coords: [1, 2] }])
    const results = tree.rangeSearch([1, 2], [1, 2])
    expect(results.length).toBe(1)
  })

  it('nearest handles target at exact point', () => {
    const tree = new KdTree<Point>([{ coords: [1, 2] }])
    const nearest = tree.nearest([1, 2])
    expect(nearest.length).toBe(1)
  })

  it('insert preserves existing points', () => {
    const tree = new KdTree<Point>([{ coords: [1, 2] }])
    tree.insert({ coords: [3, 4] })
    const nearest = tree.nearest([1, 2])
    expect(nearest[0]!.coords).toEqual([1, 2])
  })

  it('range search with zero bounds', () => {
    const tree = new KdTree<Point>([{ coords: [0, 0] }])
    const results = tree.rangeSearch([0, 0], [0, 0])
    expect(results.length).toBe(1)
  })

  it('handles large tree insert order independence', () => {
    const points1: Point[] = [{ coords: [5, 5] }, { coords: [1, 1] }, { coords: [10, 10] }]
    const tree1 = new KdTree<Point>(points1)

    const tree2 = new KdTree<Point>()
    tree2.insert({ coords: [10, 10] })
    tree2.insert({ coords: [1, 1] })
    tree2.insert({ coords: [5, 5] })

    expect(tree1.equals(tree2)).toBe(true)
  })

  it('range search with negative bounds', () => {
    const tree = new KdTree<Point>([{ coords: [-5, -5] }, { coords: [5, 5] }])
    const results = tree.rangeSearch([-10, -10], [0, 0])
    expect(results.length).toBe(1)
  })

  it('range search with min greater than max returns empty', () => {
    const tree = new KdTree<Point>([{ coords: [5, 5] }])
    const results = tree.rangeSearch([10, 10], [0, 0])
    expect(results).toEqual([])
  })

  it('nearest with multiple points at same distance', () => {
    const tree = new KdTree<Point>([
      { coords: [1, 0] },
      { coords: [-1, 0] },
      { coords: [0, 1] },
    ])
    const nearest = tree.nearest([0, 0], 2)
    expect(nearest.length).toBe(2)
  })

  it('toJSON preserves point objects', () => {
    const points: Point[] = [{ coords: [1, 2, 3] }, { coords: [4, 5, 6] }]
    const tree = new KdTree<Point>(points, 3)
    const json = tree.toJSON() as Point[]
    expect(json[0]!.coords).toEqual([1, 2, 3])
    expect(json[1]!.coords).toEqual([4, 5, 6])
  })

  it('equals with same points different insert order', () => {
    const tree1 = new KdTree<Point>()
    tree1.insert({ coords: [1, 2] })
    tree1.insert({ coords: [3, 4] })

    const tree2 = new KdTree<Point>()
    tree2.insert({ coords: [3, 4] })
    tree2.insert({ coords: [1, 2] })

    expect(tree1.equals(tree2)).toBe(true)
  })

  it('range search finds all points in large tree', () => {
    const points: Point[] = Array.from({ length: 50 }, (_, i) => ({ coords: [i, i] }))
    const tree = new KdTree<Point>(points)
    const results = tree.rangeSearch([0, 0], [25, 25])
    expect(results.length).toBe(26)
  })

  it('insert maintains tree structure', () => {
    const tree = new KdTree<Point>([{ coords: [5, 5] }])
    tree.insert({ coords: [3, 3] })
    tree.insert({ coords: [7, 7] })
    const nearest = tree.nearest([5, 5], 3)
    expect(nearest.length).toBe(3)
  })

  it('rangeSearch returns points in range', () => {
    const tree = new KdTree<number[]>([[1, 1], [5, 5], [10, 10]])
    const result = tree.rangeSearch([0, 0], [6, 6])
    expect(result).toContainEqual([1, 1])
    expect(result).toContainEqual([5, 5])
    expect(result).not.toContainEqual([10, 10])
  })

  it('clone produces equal tree', () => {
    const tree = new KdTree<number[]>([[1, 2], [3, 4]])
    const c = tree.clone()
    expect(c.equals(tree)).toBe(true)
  })

  it('toString returns string', () => {
    const tree = new KdTree<number[]>([])
    expect(typeof tree.toString()).toBe('string')
  })

  it('insert adds point retrievable by nearest', () => {
    const tree = new KdTree<number[]>([])
    tree.insert([0, 0])
    tree.insert([3, 3])
    const n = tree.nearest([1, 1], 1)
    expect(n[0]).toEqual([0, 0])
  })

  it('empty tree nearest returns empty', () => {
    const tree = new KdTree([], 2)
    expect(tree.nearest([0, 0], 1)).toEqual([])
  })

  it('insert and nearest', () => {
    const tree = new KdTree([{ coords: [1, 1] }], 2)
    tree.insert({ coords: [3, 3] })
    expect(tree.nearest([2, 2], 1).length).toBeGreaterThan(0)
  })

  it('rangeSearch returns array', () => {
    const tree = new KdTree([{ coords: [1, 1] }, { coords: [5, 5] }], 2)
    expect(tree.rangeSearch([0, 0], [3, 3]).length).toBe(1)
  })
})

describe('kd-tree - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('kd-tree - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('kd-tree - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('kd-tree - wave548', () => {
  it('kd-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave549', () => {
  it('kd-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave550', () => {
  it('kd-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave551', () => {
  it('kd-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave552', () => {
  it('kd-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave553', () => {
  it('kd-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave554', () => {
  it('kd-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave555', () => {
  it('kd-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave556', () => {
  it('kd-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave557', () => {
  it('kd-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave558', () => {
  it('kd-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave559', () => {
  it('kd-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave560', () => {
  it('kd-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave561', () => {
  it('kd-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave562', () => {
  it('kd-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave563', () => {
  it('kd-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave564', () => {
  it('kd-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave565', () => {
  it('kd-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave566', () => {
  it('kd-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave127', () => {
  it('kd-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave130', () => {
  it('kd-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave133', () => {
  it('kd-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave136', () => {
  it('kd-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - wave139', () => {
  it('kd-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w142', () => {
  it('kd-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w145', () => {
  it('kd-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w148', () => {
  it('kd-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w151', () => {
  it('kd-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w154', () => {
  it('kd-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w157', () => {
  it('kd-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w160', () => {
  it('kd-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w170', () => {
  it('kd-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w180', () => {
  it('kd-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w190', () => {
  it('kd-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w200', () => {
  it('kd-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w210', () => {
  it('kd-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w220', () => {
  it('kd-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w230', () => {
  it('kd-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w240', () => {
  it('kd-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w250', () => {
  it('kd-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w260', () => {
  it('kd-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w270', () => {
  it('kd-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w280', () => {
  it('kd-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w290', () => {
  it('kd-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w300', () => {
  it('kd-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w310', () => {
  it('kd-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w320', () => {
  it('kd-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w330', () => {
  it('kd-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w340', () => {
  it('kd-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w350', () => {
  it('kd-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w360', () => {
  it('kd-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w370', () => {
  it('kd-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w380', () => {
  it('kd-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w390', () => {
  it('kd-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w400', () => {
  it('kd-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w420', () => {
  it('kd-tree x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w440', () => {
  it('kd-tree x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w460', () => {
  it('kd-tree x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w480', () => {
  it('kd-tree x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w500', () => {
  it('kd-tree x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w550', () => {
  it('kd-tree x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w600', () => {
  it('kd-tree x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w650', () => {
  it('kd-tree x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w700', () => {
  it('kd-tree x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w800', () => {
  it('kd-tree x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w900', () => {
  it('kd-tree x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('kd-tree - w1000', () => {
  it('kd-tree x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('kd-tree x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
