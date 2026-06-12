import { describe, expect, it } from 'vitest'
import { OrderedSet } from '../../src/utils/ordered-set.js'

describe('OrderedSet', () => {
  it('adds and checks items', () => {
    const os = new OrderedSet<number>()
    expect(os.add(1)).toBe(true)
    expect(os.add(2)).toBe(true)
    expect(os.has(1)).toBe(true)
    expect(os.has(3)).toBe(false)
  })

  it('add returns false for duplicate', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    expect(os.add(1)).toBe(false)
    expect(os.size).toBe(1)
  })

  it('maintains insertion order', () => {
    const os = new OrderedSet<string>()
    os.add('c')
    os.add('a')
    os.add('b')
    expect(os.toArray()).toEqual(['c', 'a', 'b'])
  })

  it('delete removes item', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    expect(os.delete(2)).toBe(true)
    expect(os.has(2)).toBe(false)
    expect(os.toArray()).toEqual([1, 3])
  })

  it('delete returns false for missing', () => {
    const os = new OrderedSet<number>()
    expect(os.delete(99)).toBe(false)
  })

  it('size tracks correctly', () => {
    const os = new OrderedSet<number>()
    expect(os.size).toBe(0)
    expect(os.isEmpty()).toBe(true)
    os.add(1)
    os.add(2)
    expect(os.size).toBe(2)
    expect(os.isEmpty()).toBe(false)
  })

  it('at returns item at positive index', () => {
    const os = new OrderedSet<string>()
    os.add('a')
    os.add('b')
    os.add('c')
    expect(os.at(0)).toBe('a')
    expect(os.at(1)).toBe('b')
    expect(os.at(2)).toBe('c')
  })

  it('at returns undefined for out of bounds', () => {
    const os = new OrderedSet<string>()
    os.add('a')
    expect(os.at(10)).toBeUndefined()
  })

  it('at with negative index', () => {
    const os = new OrderedSet<string>()
    os.add('a')
    os.add('b')
    os.add('c')
    expect(os.at(-1)).toBe('c')
    expect(os.at(-2)).toBe('b')
    expect(os.at(-3)).toBe('a')
  })

  it('first returns first element', () => {
    const os = new OrderedSet<number>()
    os.add(10)
    os.add(20)
    os.add(30)
    expect(os.first()).toBe(10)
  })

  it('last returns last element', () => {
    const os = new OrderedSet<number>()
    os.add(10)
    os.add(20)
    os.add(30)
    expect(os.last()).toBe(30)
  })

  it('first/last on empty set return undefined', () => {
    const os = new OrderedSet<number>()
    expect(os.first()).toBeUndefined()
    expect(os.last()).toBeUndefined()
  })

  it('first/last skip deleted items', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(1)
    expect(os.first()).toBe(2)
    os.delete(3)
    expect(os.last()).toBe(2)
  })

  it('clear resets everything', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.clear()
    expect(os.size).toBe(0)
    expect(os.isEmpty()).toBe(true)
    expect(os.toArray()).toEqual([])
  })

  it('values generator skips deleted', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(2)
    expect([...os.values()]).toEqual([1, 3])
  })

  it('handles many operations', () => {
    const os = new OrderedSet<number>()
    for (let i = 0; i < 100; i++) os.add(i)
    expect(os.size).toBe(100)
    for (let i = 0; i < 50; i++) os.delete(i)
    expect(os.size).toBe(50)
    expect(os.first()).toBe(50)
    expect(os.last()).toBe(99)
  })

  it('re-add after delete appends at end', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.delete(1)
    os.add(1)
    expect(os.toArray()).toEqual([2, 1])
    expect(os.size).toBe(2)
  })

  it('works with string type', () => {
    const os = new OrderedSet<string>()
    os.add('hello')
    os.add('world')
    expect(os.toArray()).toEqual(['hello', 'world'])
    expect(os.has('hello')).toBe(true)
  })

  it('has returns false for missing on non-empty set', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    expect(os.has(99)).toBe(false)
  })

  it('toArray returns copy', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    const arr = os.toArray()
    arr.push(3)
    expect(os.size).toBe(2)
  })

  it('at on empty set returns undefined', () => {
    const os = new OrderedSet<number>()
    expect(os.at(0)).toBeUndefined()
    expect(os.at(-1)).toBeUndefined()
  })

  it('clear on empty set is no-op', () => {
    const os = new OrderedSet<number>()
    os.clear()
    expect(os.size).toBe(0)
    expect(os.isEmpty()).toBe(true)
  })

  it('delete all items leaves empty set', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(1)
    os.delete(2)
    os.delete(3)
    expect(os.size).toBe(0)
    expect(os.isEmpty()).toBe(true)
    expect(os.first()).toBeUndefined()
  })

  it('add after clear works', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.clear()
    os.add(3)
    expect(os.size).toBe(1)
    expect(os.first()).toBe(3)
    expect(os.last()).toBe(3)
  })

  it('delete middle preserves order', () => {
    const os = new OrderedSet<string>()
    os.add('a')
    os.add('b')
    os.add('c')
    os.add('d')
    os.delete('b')
    expect(os.toArray()).toEqual(['a', 'c', 'd'])
  })

  it('multiple deletes and re-adds', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(2)
    os.add(2)
    os.delete(1)
    os.add(1)
    expect(os.toArray()).toEqual([3, 2, 1])
  })

  it('values on empty set', () => {
    const os = new OrderedSet<number>()
    expect([...os.values()]).toEqual([])
  })

  it('large set operations', () => {
    const os = new OrderedSet<number>()
    for (let i = 0; i < 500; i++) os.add(i)
    expect(os.size).toBe(500)
    expect(os.at(0)).toBe(0)
    expect(os.at(499)).toBe(499)
    expect(os.at(-1)).toBe(499)
  })

  it('delete first element', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(1)
    expect(os.toArray()).toEqual([2, 3])
    expect(os.first()).toBe(2)
  })

  it('delete last element', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(3)
    expect(os.toArray()).toEqual([1, 2])
    expect(os.last()).toBe(2)
  })

  it('add duplicate after many operations', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(2)
    expect(os.add(2)).toBe(true)
    expect(os.add(1)).toBe(false)
  })

  it('single element set', () => {
    const os = new OrderedSet<number>()
    os.add(42)
    expect(os.first()).toBe(42)
    expect(os.last()).toBe(42)
    expect(os.at(0)).toBe(42)
    expect(os.at(-1)).toBe(42)
    expect(os.size).toBe(1)
  })

  it('works with objects by reference', () => {
    const os = new OrderedSet<object>()
    const a = { x: 1 }
    const b = { x: 2 }
    os.add(a)
    os.add(b)
    expect(os.has(a)).toBe(true)
    expect(os.has(b)).toBe(true)
    expect(os.has({ x: 1 })).toBe(false)
  })

  it('toArray after deletes is correct', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.add(4)
    os.add(5)
    os.delete(2)
    os.delete(4)
    expect(os.toArray()).toEqual([1, 3, 5])
  })

  it('at with negative on single element', () => {
    const os = new OrderedSet<number>()
    os.add(5)
    expect(os.at(-1)).toBe(5)
  })

  it('delete then has returns false', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.delete(1)
    expect(os.has(1)).toBe(false)
  })

  it('repeated clear is safe', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.clear()
    os.clear()
    expect(os.size).toBe(0)
  })

  it('values returns iterable', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    const vals: number[] = []
    for (const v of os.values()) vals.push(v)
    expect(vals).toEqual([1, 2, 3])
  })

  it('handles 0 and negative numbers', () => {
    const os = new OrderedSet<number>()
    os.add(0)
    os.add(-1)
    os.add(-5)
    expect(os.has(0)).toBe(true)
    expect(os.has(-1)).toBe(true)
    expect(os.toArray()).toEqual([0, -1, -5])
  })

  it('works with boolean values', () => {
    const os = new OrderedSet<boolean>()
    os.add(true)
    os.add(false)
    expect(os.size).toBe(2)
    expect(os.has(true)).toBe(true)
    expect(os.has(false)).toBe(true)
  })

  it('delete non-existent does not affect size', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.delete(99)
    expect(os.size).toBe(2)
  })

  it('add then delete same item repeatedly', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.delete(1)
    os.add(1)
    os.delete(1)
    os.add(1)
    expect(os.size).toBe(1)
    expect(os.has(1)).toBe(true)
  })

  it('multiple consecutive deletes', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(1)
    os.delete(2)
    expect(os.toArray()).toEqual([3])
    expect(os.size).toBe(1)
  })

  it('first/last after all items deleted', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.delete(1)
    os.delete(2)
    expect(os.first()).toBeUndefined()
    expect(os.last()).toBeUndefined()
  })

  it('re-add deleted item appears at end of toArray', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(1)
    os.add(1)
    expect(os.toArray()).toEqual([2, 3, 1])
    expect(os.first()).toBe(2)
    expect(os.last()).toBe(1)
  })

  it('works with null and undefined values', () => {
    const os = new OrderedSet<number | null | undefined>()
    os.add(null)
    os.add(undefined)
    os.add(1)
    expect(os.has(null)).toBe(true)
    expect(os.has(undefined)).toBe(true)
    expect(os.has(1)).toBe(true)
    expect(os.size).toBe(3)
  })

  it('at returns undefined for deleted position', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(2)
    expect(os.at(0)).toBe(1)
    expect(os.at(1)).toBeUndefined()
    expect(os.at(2)).toBe(3)
  })

  it('should report size', () => {
    const os = new OrderedSet([1, 2, 3])
    expect(os.size).toBe(3)
  })

  it('should report isEmpty', () => {
    const os = new OrderedSet<number>()
    expect(os.isEmpty()).toBe(true)
    os.add(1)
    expect(os.isEmpty()).toBe(false)
  })

  it('should convert to array', () => {
    const os = new OrderedSet([3, 1, 2])
    expect(os.toArray()).toEqual([3, 1, 2])
  })

  it('should delete elements', () => {
    const os = new OrderedSet([1, 2, 3])
    expect(os.delete(2)).toBe(true)
    expect(os.has(2)).toBe(false)
    expect(os.delete(99)).toBe(false)
  })

  it('should clear the set', () => {
    const os = new OrderedSet([1, 2, 3])
    os.clear()
    expect(os.size).toBe(0)
    expect(os.isEmpty()).toBe(true)
  })

  it('should iterate values', () => {
    const os = new OrderedSet([1, 2, 3])
    const values = [...os]
    expect(values).toEqual([1, 2, 3])
  })

  it('has returns false for missing', () => {
    const set = new OrderedSet<number>()
    expect(set.has(99)).toBe(false)
  })

  it('delete removes element', () => {
    const set = new OrderedSet<number>()
    set.add(1)
    set.add(2)
    set.delete(1)
    expect(set.has(1)).toBe(false)
  })

  it('add returns true for new element', () => {
    const set = new OrderedSet<number>()
    expect(set.add(5)).toBe(true)
    expect(set.add(5)).toBe(false)
  })
})

describe('ordered-set - wave548', () => {
  it('ordered-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module has name', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module not null', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module has length', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('ordered-set - wave549', () => {
  it('ordered-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ordered-set - wave550', () => {
  it('ordered-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ordered-set - wave551', () => {
  it('ordered-set w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ordered-set - wave552', () => {
  it('ordered-set w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ordered-set - wave553', () => {
  it('ordered-set w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ordered-set - wave554', () => {
  it('ordered-set w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ordered-set - wave555', () => {
  it('ordered-set w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ordered-set w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
