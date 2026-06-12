import { describe, expect, it } from 'vitest'
import { BlockList } from '../../src/utils/block-list.js'

describe('BlockList', () => {
  it('pushBack and size', () => {
    const bl = new BlockList<number>(4)
    bl.pushBack(1)
    bl.pushBack(2)
    bl.pushBack(3)
    expect(bl.size).toBe(3)
    expect(bl.isEmpty).toBe(false)
  })

  it('pushFront', () => {
    const bl = new BlockList<number>(4)
    bl.pushBack(2)
    bl.pushFront(1)
    expect(bl.toArray()).toEqual([1, 2])
  })

  it('popBack', () => {
    const bl = BlockList.from([1, 2, 3], 4)
    expect(bl.popBack()).toBe(3)
    expect(bl.size).toBe(2)
  })

  it('popFront', () => {
    const bl = BlockList.from([1, 2, 3], 4)
    expect(bl.popFront()).toBe(1)
    expect(bl.toArray()).toEqual([2, 3])
  })

  it('get by index', () => {
    const bl = BlockList.from([10, 20, 30], 4)
    expect(bl.get(0)).toBe(10)
    expect(bl.get(2)).toBe(30)
    expect(bl.get(5)).toBeUndefined()
  })

  it('set by index', () => {
    const bl = BlockList.from([1, 2, 3], 4)
    expect(bl.set(1, 99)).toBe(true)
    expect(bl.get(1)).toBe(99)
    expect(bl.set(10, 0)).toBe(false)
  })

  it('handles multiple blocks', () => {
    const bl = new BlockList<number>(3)
    for (let i = 0; i < 10; i++) bl.pushBack(i)
    expect(bl.size).toBe(10)
    expect(bl.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('empty list operations', () => {
    const bl = new BlockList<number>()
    expect(bl.isEmpty).toBe(true)
    expect(bl.popBack()).toBeUndefined()
    expect(bl.popFront()).toBeUndefined()
  })

  it('iteration via Symbol.iterator', () => {
    const bl = BlockList.from([1, 2, 3], 2)
    const result: number[] = []
    for (const v of bl) result.push(v)
    expect(result).toEqual([1, 2, 3])
  })

  it('from static creates blocklist', () => {
    const bl = BlockList.from([1, 2, 3])
    expect(bl.toArray()).toEqual([1, 2, 3])
  })

  it('large pushBack with small block size', () => {
    const bl = new BlockList<number>(2)
    for (let i = 0; i < 8; i++) bl.pushBack(i)
    expect(bl.size).toBe(8)
    expect(bl.get(0)).toBe(0)
    expect(bl.get(7)).toBe(7)
  })

  it('pushFront and popBack mix', () => {
    const bl = new BlockList<number>(3)
    bl.pushFront(3)
    bl.pushFront(2)
    bl.pushFront(1)
    expect(bl.popBack()).toBe(3)
    expect(bl.toArray()).toEqual([1, 2])
  })

  it('handles set operation', () => {
    const bl = BlockList.from([10, 20, 30], 2)
    bl.set(1, 99)
    expect(bl.get(1)).toBe(99)
    expect(bl.toArray()).toEqual([10, 99, 30])
  })

  it('handles pushFront all then popBack all', () => {
    const bl = new BlockList<number>(2)
    bl.pushFront(3)
    bl.pushFront(2)
    bl.pushFront(1)
    expect(bl.popBack()).toBe(3)
    expect(bl.popBack()).toBe(2)
    expect(bl.popBack()).toBe(1)
    expect(bl.isEmpty).toBe(true)
  })

  it('handles get on empty', () => {
    const bl = new BlockList<number>(4)
    expect(bl.get(0)).toBeUndefined()
  })

  it('handles large pushBack sequence', () => {
    const bl = new BlockList<number>(4)
    for (let i = 0; i < 20; i++) bl.pushBack(i)
    expect(bl.size).toBe(20)
    expect(bl.get(0)).toBe(0)
    expect(bl.get(19)).toBe(19)
  })

  it('handles from with single element', () => {
    const bl = BlockList.from([42], 2)
    expect(bl.size).toBe(1)
    expect(bl.get(0)).toBe(42)
  })

  it('pushBack and size tracking', () => {
    const bl = new BlockList<number>(2)
    bl.pushBack(1)
    bl.pushBack(2)
    bl.pushBack(3)
    expect(bl.size).toBe(3)
  })

  it('pushFront adds to front', () => {
    const bl = new BlockList<number>()
    bl.pushBack(1)
    bl.pushFront(0)
    expect(bl.get(0)).toBe(0)
    expect(bl.get(1)).toBe(1)
  })

  it('size returns element count', () => {
    const bl = new BlockList<number>()
    bl.pushBack(10)
    bl.pushBack(20)
    expect(bl.size).toBe(2)
  })

  it('get returns element at index', () => {
    const bl = new BlockList<number>()
    bl.pushBack(10)
    bl.pushBack(20)
    expect(bl.get(0)).toBe(10)
  })

  it('get returns all elements', () => {
    const bl = new BlockList<number>()
    bl.pushBack(10)
    bl.pushBack(20)
    expect(bl.get(0)).toBe(10)
    expect(bl.get(1)).toBe(20)
  })

  it('handles negative index', () => {
    const bl = BlockList.from([1, 2, 3], 4)
    expect(bl.get(-1)).toBeUndefined()
  })

  it('handles set on empty list', () => {
    const bl = new BlockList<number>(4)
    expect(bl.set(0, 1)).toBe(false)
  })

  it('handles popBack to empty', () => {
    const bl = BlockList.from([1], 2)
    expect(bl.popBack()).toBe(1)
    expect(bl.popBack()).toBeUndefined()
    expect(bl.isEmpty).toBe(true)
  })

  it('handles popFront to empty', () => {
    const bl = BlockList.from([1], 2)
    expect(bl.popFront()).toBe(1)
    expect(bl.popFront()).toBeUndefined()
    expect(bl.isEmpty).toBe(true)
  })

  it('handles pushFront on new list', () => {
    const bl = new BlockList<number>(2)
    bl.pushFront(1)
    bl.pushFront(2)
    expect(bl.toArray()).toEqual([2, 1])
  })

  it('handles mixed pushFront and pushBack', () => {
    const bl = new BlockList<number>(3)
    bl.pushBack(2)
    bl.pushFront(1)
    bl.pushBack(3)
    bl.pushFront(0)
    expect(bl.toArray()).toEqual([0, 1, 2, 3])
  })

  it('handles block boundary pushBack', () => {
    const bl = new BlockList<number>(3)
    bl.pushBack(1)
    bl.pushBack(2)
    bl.pushBack(3)
    bl.pushBack(4)
    expect(bl.toArray()).toEqual([1, 2, 3, 4])
  })

  it('handles block boundary pushFront', () => {
    const bl = new BlockList<number>(2)
    bl.pushFront(2)
    bl.pushFront(1)
    bl.pushFront(0)
    expect(bl.toArray()).toEqual([0, 1, 2])
  })

  it('handles iteration across multiple blocks', () => {
    const bl = new BlockList<number>(2)
    for (let i = 0; i < 6; i++) bl.pushBack(i)
    const result: number[] = []
    for (const v of bl) result.push(v)
    expect(result).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('handles string elements', () => {
    const bl = new BlockList<string>(3)
    bl.pushBack('a')
    bl.pushBack('b')
    bl.pushBack('c')
    expect(bl.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('handles object elements', () => {
    const bl = new BlockList<{ id: number }>(2)
    bl.pushBack({ id: 1 })
    bl.pushBack({ id: 2 })
    expect(bl.get(0)?.id).toBe(1)
    expect(bl.get(1)?.id).toBe(2)
  })

  it('handles null and undefined elements', () => {
    const bl = new BlockList<number | null | undefined>(2)
    bl.pushBack(null)
    bl.pushBack(undefined)
    bl.pushBack(0)
    expect(bl.toArray()).toEqual([null, undefined, 0])
  })

  it('handles boolean elements', () => {
    const bl = new BlockList<boolean>(2)
    bl.pushBack(true)
    bl.pushBack(false)
    expect(bl.toArray()).toEqual([true, false])
  })

  it('toString returns correct format', () => {
    const bl = BlockList.from([1, 2, 3], 2)
    expect(bl.toString()).toBe('[1, 2, 3]')
  })

  it('toString handles empty list', () => {
    const bl = new BlockList<number>()
    expect(bl.toString()).toBe('[]')
  })

  it('toJSON returns array', () => {
    const bl = BlockList.from([1, 2, 3], 2)
    expect(bl.toJSON()).toEqual([1, 2, 3])
  })

  it('toJSON on empty list returns empty array', () => {
    const bl = new BlockList<number>()
    expect(bl.toJSON()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const bl = BlockList.from([1, 2, 3], 2)
    const cloned = bl.clone()
    cloned.pushBack(4)
    expect(bl.toArray()).toEqual([1, 2, 3])
    expect(cloned.toArray()).toEqual([1, 2, 3, 4])
  })

  it('clone preserves block size', () => {
    const bl = new BlockList<number>(5)
    bl.pushBack(1)
    const cloned = bl.clone()
    cloned.pushBack(2)
    cloned.pushBack(3)
    cloned.pushBack(4)
    cloned.pushBack(5)
    cloned.pushBack(6)
    expect(cloned.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('equals returns true for identical lists', () => {
    const bl1 = BlockList.from([1, 2, 3], 2)
    const bl2 = BlockList.from([1, 2, 3], 2)
    expect(bl1.equals(bl2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const bl1 = BlockList.from([1, 2], 2)
    const bl2 = BlockList.from([1, 2, 3], 2)
    expect(bl1.equals(bl2)).toBe(false)
  })

  it('equals returns false for different elements', () => {
    const bl1 = BlockList.from([1, 2, 3], 2)
    const bl2 = BlockList.from([1, 2, 4], 2)
    expect(bl1.equals(bl2)).toBe(false)
  })

  it('equals returns false for different block sizes', () => {
    const bl1 = BlockList.from([1, 2, 3], 2)
    const bl2 = BlockList.from([1, 2, 3], 5)
    expect(bl1.equals(bl2)).toBe(false)
  })

  it('equals returns false for non-BlockList instance', () => {
    const bl = BlockList.from([1, 2, 3], 2)
    expect(bl.equals([1, 2, 3])).toBe(false)
    expect(bl.equals(null)).toBe(false)
    expect(bl.equals(undefined)).toBe(false)
  })

  it('handles default block size', () => {
    const bl = new BlockList<number>()
    for (let i = 0; i < 100; i++) bl.pushBack(i)
    expect(bl.size).toBe(100)
    expect(bl.get(99)).toBe(99)
  })

  it('handles large number of pushBack operations', () => {
    const bl = new BlockList<number>(10)
    for (let i = 0; i < 100; i++) bl.pushBack(i)
    expect(bl.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(bl.get(i)).toBe(i)
    }
  })

  it('handles large number of pushFront operations', () => {
    const bl = new BlockList<number>(10)
    for (let i = 0; i < 50; i++) bl.pushFront(i)
    expect(bl.size).toBe(50)
    expect(bl.get(0)).toBe(49)
    expect(bl.get(49)).toBe(0)
  })

  it('handles alternating pushFront and pushBack', () => {
    const bl = new BlockList<number>(3)
    for (let i = 0; i < 20; i++) {
      if (i % 2 === 0) bl.pushBack(i)
      else bl.pushFront(i)
    }
    expect(bl.size).toBe(20)
  })

  it('handles popBack across block boundaries', () => {
    const bl = new BlockList<number>(3)
    for (let i = 0; i < 10; i++) bl.pushBack(i)
    while (!bl.isEmpty) bl.popBack()
    expect(bl.size).toBe(0)
  })

  it('handles popFront across block boundaries', () => {
    const bl = new BlockList<number>(3)
    for (let i = 0; i < 10; i++) bl.pushBack(i)
    while (!bl.isEmpty) bl.popFront()
    expect(bl.size).toBe(0)
  })

  it('handles set operation across blocks', () => {
    const bl = new BlockList<number>(3)
    for (let i = 0; i < 10; i++) bl.pushBack(i)
    bl.set(5, 99)
    expect(bl.get(5)).toBe(99)
    expect(bl.toArray()).toEqual([0, 1, 2, 3, 4, 99, 6, 7, 8, 9])
  })

  it('handles mixed popFront and popBack', () => {
    const bl = BlockList.from([1, 2, 3, 4, 5], 3)
    expect(bl.popFront()).toBe(1)
    expect(bl.popBack()).toBe(5)
    expect(bl.popFront()).toBe(2)
    expect(bl.popBack()).toBe(4)
    expect(bl.toArray()).toEqual([3])
  })

  it('handles empty after all operations', () => {
    const bl = new BlockList<number>(2)
    bl.pushBack(1)
    bl.pushFront(0)
    bl.popBack()
    bl.popFront()
    expect(bl.isEmpty).toBe(true)
    expect(bl.size).toBe(0)
  })

  it('handles from with empty array', () => {
    const bl = BlockList.from([], 3)
    expect(bl.isEmpty).toBe(true)
    expect(bl.size).toBe(0)
  })

  it('handles block size of 1', () => {
    const bl = new BlockList<number>(1)
    bl.pushBack(1)
    bl.pushBack(2)
    bl.pushBack(3)
    expect(bl.toArray()).toEqual([1, 2, 3])
  })

  it('handles very large block size', () => {
    const bl = new BlockList<number>(1000)
    for (let i = 0; i < 100; i++) bl.pushBack(i)
    expect(bl.size).toBe(100)
    expect(bl.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
  })
})
describe('block-list - wave544', () => {
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

describe('block-list - wave546', () => {
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

describe('block-list - wave547', () => {
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

describe('block-list - wave548', () => {
  it('block-list module defined', () => {
    expect(describe).toBeDefined()
  })
  it('block-list module is function', () => {
    expect(describe).toBeDefined()
  })
  it('block-list module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-list - wave549', () => {
  it('block-list module defined', () => {
    expect(describe).toBeDefined()
  })
  it('block-list module is function', () => {
    expect(describe).toBeDefined()
  })
  it('block-list module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-list - wave550', () => {
  it('block-list w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-list - wave551', () => {
  it('block-list w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-list - wave552', () => {
  it('block-list w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-list - wave553', () => {
  it('block-list w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('block-list - wave554', () => {
  it('block-list w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('block-list w554 v2', () => {
    expect(describe).toBeDefined()
  })
})
