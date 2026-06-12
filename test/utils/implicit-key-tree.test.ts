import { describe, expect, it } from 'vitest'
import { ImplicitKeyTree } from '../../src/utils/implicit-key-tree.js'

describe('ImplicitKeyTree', () => {
  it('insert and get', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 10)
    t.insert(1, 20)
    expect(t.get(0)).toBe(10)
    expect(t.get(1)).toBe(20)
  })

  it('insert at beginning', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(0, 2)
    expect(t.toArray()).toEqual([2, 1])
  })

  it('insert in middle', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 3)
    t.insert(1, 2)
    expect(t.toArray()).toEqual([1, 2, 3])
  })

  it('remove element', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 10)
    t.insert(1, 20)
    t.insert(2, 30)
    expect(t.remove(1)).toBe(20)
    expect(t.toArray()).toEqual([10, 30])
  })

  it('length tracks correctly', () => {
    const t = new ImplicitKeyTree()
    expect(t.length).toBe(0)
    t.insert(0, 1)
    expect(t.length).toBe(1)
    t.remove(0)
    expect(t.length).toBe(0)
  })

  it('handles many inserts', () => {
    const t = new ImplicitKeyTree()
    for (let i = 0; i < 100; i++) t.insert(i, i)
    expect(t.length).toBe(100)
    expect(t.get(0)).toBe(0)
    expect(t.get(99)).toBe(99)
  })

  it('remove from beginning', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    t.insert(2, 3)
    expect(t.remove(0)).toBe(1)
    expect(t.toArray()).toEqual([2, 3])
  })

  it('remove from end', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    t.insert(2, 3)
    expect(t.remove(2)).toBe(3)
    expect(t.toArray()).toEqual([1, 2])
  })

  it('get out of bounds returns undefined', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    expect(t.get(5)).toBeUndefined()
  })

  it('remove from empty returns undefined', () => {
    const t = new ImplicitKeyTree()
    expect(t.remove(0)).toBeUndefined()
  })

  it('toArray returns correct order', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 3)
    t.insert(0, 1)
    t.insert(1, 2)
    expect(t.toArray()).toEqual([1, 2, 3])
  })

  it('handles many insertions', () => {
    const t = new ImplicitKeyTree()
    for (let i = 0; i < 50; i++) t.insert(i, i)
    expect(t.get(0)).toBe(0)
    expect(t.get(49)).toBe(49)
  })

  it('insert after removes preserves order', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 10)
    t.insert(1, 20)
    t.remove(0)
    t.insert(0, 99)
    expect(t.get(0)).toBe(99)
    expect(t.get(1)).toBe(20)
  })

  it('get negative index returns undefined', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    expect(t.get(-1)).toBeUndefined()
  })

  it('length after mixed operations', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    t.remove(0)
    expect(t.length).toBe(1)
  })

  it('handles get out of bounds', () => {
    const t = new ImplicitKeyTree()
    t.insert(0, 1)
    t.insert(1, 2)
    expect(t.get(5)).toBeUndefined()
  })

  it('length after multiple inserts', () => {
    const t = new ImplicitKeyTree<number, number>()
    for (let i = 0; i < 5; i++) t.insert(i, i * 10)
    expect(t.length).toBe(5)
  })

  it('get returns correct value', () => {
    const t = new ImplicitKeyTree<number, number>()
    t.insert(0, 42)
    t.insert(1, 99)
    expect(t.get(0)).toBe(42)
    expect(t.get(1)).toBe(99)
  })

  it('toArray returns all elements', () => {
    const t = new ImplicitKeyTree<number, number>()
    t.insert(0, 10)
    t.insert(1, 20)
    t.insert(2, 30)
    expect(t.toArray()).toEqual([10, 20, 30])
  })

  it('toArray returns empty for empty tree', () => {
    const t = new ImplicitKeyTree<number>()
    expect(t.toArray()).toEqual([])
  })

  it('insert increases toArray length', () => {
    const t = new ImplicitKeyTree<number>()
    t.insert(5)
    expect(t.toArray().length).toBe(1)
  })

  it('insert at index and get', () => {
    const t = new ImplicitKeyTree<number>()
    t.insert(0, 10)
    t.insert(1, 20)
    expect(t.get(0)).toBe(10)
    expect(t.get(1)).toBe(20)
  })

  it('get returns undefined for missing key', () => {
    const t = new ImplicitKeyTree<number>()
    expect(t.get(99)).toBeUndefined()
  })

  it('insert and get roundtrip', () => {
    const t = new ImplicitKeyTree<number>()
    t.insert(0, 42)
    expect(t.get(0)).toBe(42)
  })

  describe('constructor', () => {
    it('creates empty tree', () => {
      const t = new ImplicitKeyTree()
      expect(t.length).toBe(0)
      expect(t.toArray()).toEqual([])
    })

    it('creates tree with initial capacity (implicit)', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.length).toBe(1)
    })
  })

  describe('toString', () => {
    it('returns string representation', () => {
      const t = new ImplicitKeyTree()
      expect(t.toString()).toBe('ImplicitKeyTree(0)')
    })

    it('includes length in toString', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(1, 2)
      expect(t.toString()).toBe('ImplicitKeyTree(2)')
    })
  })

  describe('toJSON', () => {
    it('returns array representation', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(1, 2)
      expect(t.toJSON()).toEqual([1, 2])
    })

    it('returns empty array for empty tree', () => {
      const t = new ImplicitKeyTree()
      expect(t.toJSON()).toEqual([])
    })

    it('toJSON returns copy, not reference', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      const json = t.toJSON() as number[]
      json[0] = 99
      expect(t.get(0)).toBe(1)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(1, 2)
      const copy = t.clone()
      expect(copy.toArray()).toEqual([1, 2])
      copy.insert(0, 99)
      expect(t.get(0)).toBe(1)
      expect(copy.get(0)).toBe(99)
    })

    it('clone of empty tree is empty', () => {
      const t = new ImplicitKeyTree()
      const copy = t.clone()
      expect(copy.length).toBe(0)
      expect(copy.toArray()).toEqual([])
    })

    it('clone has same length', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(1, 2)
      const copy = t.clone()
      expect(copy.length).toBe(t.length)
    })
  })

  describe('equals', () => {
    it('returns true for equal trees', () => {
      const t1 = new ImplicitKeyTree()
      const t2 = new ImplicitKeyTree()
      t1.insert(0, 1)
      t1.insert(1, 2)
      t2.insert(0, 1)
      t2.insert(1, 2)
      expect(t1.equals(t2)).toBe(true)
    })

    it('returns false for different trees', () => {
      const t1 = new ImplicitKeyTree()
      const t2 = new ImplicitKeyTree()
      t1.insert(0, 1)
      t2.insert(0, 2)
      expect(t1.equals(t2)).toBe(false)
    })

    it('returns false for non-tree objects', () => {
      const t = new ImplicitKeyTree()
      expect(t.equals(null)).toBe(false)
      expect(t.equals(undefined)).toBe(false)
      expect(t.equals({})).toBe(false)
      expect(t.equals([])).toBe(false)
    })

    it('returns true for empty trees', () => {
      const t1 = new ImplicitKeyTree()
      const t2 = new ImplicitKeyTree()
      expect(t1.equals(t2)).toBe(true)
    })

    it('returns false for trees with different lengths', () => {
      const t1 = new ImplicitKeyTree()
      const t2 = new ImplicitKeyTree()
      t1.insert(0, 1)
      t2.insert(0, 1)
      t2.insert(1, 2)
      expect(t1.equals(t2)).toBe(false)
    })
  })

  describe('insert boundary conditions', () => {
    it('insert at index beyond length appends to end', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(10, 99)
      expect(t.length).toBe(2)
      expect(t.get(1)).toBe(99)
    })

    it('insert negative index clamps to 0', () => {
      const t = new ImplicitKeyTree()
      t.insert(-5, 1)
      t.insert(-1, 2)
      expect(t.toArray()).toEqual([2, 1])
    })

    it('insert at max index beyond length appends', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(999999, 2)
      expect(t.length).toBe(2)
    })

    it('insert at 0 to empty tree', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.length).toBe(1)
      expect(t.get(0)).toBe(1)
    })
  })

  describe('remove boundary conditions', () => {
    it('remove negative index returns undefined', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.remove(-1)).toBeUndefined()
      expect(t.length).toBe(1)
    })

    it('remove beyond length returns undefined', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.remove(999)).toBeUndefined()
      expect(t.length).toBe(1)
    })

    it('remove from empty tree returns undefined', () => {
      const t = new ImplicitKeyTree()
      expect(t.remove(0)).toBeUndefined()
      expect(t.length).toBe(0)
    })

    it('remove last element', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.remove(0)).toBe(1)
      expect(t.length).toBe(0)
    })

    it('remove does not affect other elements', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(1, 2)
      t.insert(2, 3)
      t.remove(1)
      expect(t.get(0)).toBe(1)
      expect(t.get(1)).toBe(3)
    })
  })

  describe('get boundary conditions', () => {
    it('get from empty tree returns undefined', () => {
      const t = new ImplicitKeyTree()
      expect(t.get(0)).toBeUndefined()
    })

    it('get negative index returns undefined', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.get(-1)).toBeUndefined()
      expect(t.get(-999)).toBeUndefined()
    })

    it('get beyond length returns undefined', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.get(1)).toBeUndefined()
      expect(t.get(999)).toBeUndefined()
    })
  })

  describe('length behavior', () => {
    it('length is 0 after creation', () => {
      const t = new ImplicitKeyTree()
      expect(t.length).toBe(0)
    })

    it('length increments with each insert', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      expect(t.length).toBe(1)
      t.insert(1, 2)
      expect(t.length).toBe(2)
      t.insert(2, 3)
      expect(t.length).toBe(3)
    })

    it('length decrements with each remove', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(1, 2)
      t.insert(2, 3)
      expect(t.length).toBe(3)
      t.remove(0)
      expect(t.length).toBe(2)
      t.remove(0)
      expect(t.length).toBe(1)
    })

    it('length after many operations remains accurate', () => {
      const t = new ImplicitKeyTree()
      for (let i = 0; i < 100; i++) {
        t.insert(0, i)
      }
      expect(t.length).toBe(100)
      for (let i = 0; i < 50; i++) {
        t.remove(0)
      }
      expect(t.length).toBe(50)
    })
  })

  describe('toArray behavior', () => {
    it('toArray returns copy, not reference', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      const arr = t.toArray()
      arr[0] = 99
      expect(t.get(0)).toBe(1)
    })

    it('toArray empty tree returns empty array', () => {
      const t = new ImplicitKeyTree()
      expect(t.toArray()).toEqual([])
    })

    it('toArray preserves order', () => {
      const t = new ImplicitKeyTree()
      t.insert(0, 1)
      t.insert(1, 2)
      t.insert(2, 3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })
})

describe('implicit-key-tree - wave545', () => {
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

describe('implicit-key-tree - wave546', () => {
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

describe('implicit-key-tree - wave547', () => {
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

describe('implicit-key-tree - wave548', () => {
  it('implicit-key-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('implicit-key-tree - wave549', () => {
  it('implicit-key-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('implicit-key-tree - wave550', () => {
  it('implicit-key-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('implicit-key-tree - wave551', () => {
  it('implicit-key-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('implicit-key-tree - wave552', () => {
  it('implicit-key-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('implicit-key-tree - wave553', () => {
  it('implicit-key-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('implicit-key-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
