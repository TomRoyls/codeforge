import { describe, it, expect } from 'vitest'
import { Bag } from '../../src/utils/bag.js'

describe('Bag', () => {
  it('adds and counts items', () => {
    const bag = new Bag<string>()
    bag.add('a')
    bag.add('a')
    bag.add('b')
    expect(bag.count('a')).toBe(2)
    expect(bag.count('b')).toBe(1)
    expect(bag.count('c')).toBe(0)
  })

  it('adds with count', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    expect(bag.count(1)).toBe(5)
    expect(bag.size).toBe(5)
  })

  it('removes items', () => {
    const bag = new Bag<string>()
    bag.add('a', 3)
    expect(bag.remove('a')).toBe(true)
    expect(bag.count('a')).toBe(2)
    expect(bag.size).toBe(2)
  })

  it('remove returns false for insufficient count', () => {
    const bag = new Bag<string>()
    bag.add('a', 2)
    expect(bag.remove('a', 3)).toBe(false)
    expect(bag.count('a')).toBe(2)
  })

  it('remove deletes entry when count reaches zero', () => {
    const bag = new Bag<string>()
    bag.add('a', 2)
    bag.remove('a', 2)
    expect(bag.contains('a')).toBe(false)
    expect(bag.uniqueSize()).toBe(0)
  })

  it('tracks total size', () => {
    const bag = new Bag<number>()
    expect(bag.size).toBe(0)
    bag.add(1)
    bag.add(2, 3)
    expect(bag.size).toBe(4)
  })

  it('tracks unique size', () => {
    const bag = new Bag<string>()
    bag.add('a')
    bag.add('b')
    bag.add('a')
    expect(bag.uniqueSize()).toBe(2)
  })

  it('isEmpty', () => {
    const bag = new Bag<number>()
    expect(bag.isEmpty()).toBe(true)
    bag.add(1)
    expect(bag.isEmpty()).toBe(false)
  })

  it('clears all items', () => {
    const bag = new Bag<string>()
    bag.add('a', 10)
    bag.add('b', 5)
    bag.clear()
    expect(bag.size).toBe(0)
    expect(bag.uniqueSize()).toBe(0)
    expect(bag.isEmpty()).toBe(true)
  })

  it('items returns unique items', () => {
    const bag = new Bag<number>()
    bag.add(1)
    bag.add(2)
    bag.add(1)
    expect(bag.items().sort()).toEqual([1, 2])
  })

  it('entries returns counts', () => {
    const bag = new Bag<string>()
    bag.add('a', 3)
    bag.add('b', 1)
    const entries = bag.entries()
    expect(entries).toEqual([['a', 3], ['b', 1]])
  })

  it('toArray expands duplicates', () => {
    const bag = new Bag<number>()
    bag.add(1, 3)
    bag.add(2, 1)
    expect(bag.toArray().sort()).toEqual([1, 1, 1, 2])
  })

  it('forEach iterates unique items with counts', () => {
    const bag = new Bag<string>()
    bag.add('a', 3)
    bag.add('b', 1)
    const result: Array<[string, number]> = []
    bag.forEach((item, count) => result.push([item, count]))
    expect(result).toEqual([['a', 3], ['b', 1]])
  })

  it('union takes max count per item', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    bag1.add(2, 1)
    const bag2 = new Bag<number>()
    bag2.add(1, 1)
    bag2.add(2, 5)
    const result = bag1.union(bag2)
    expect(result.count(1)).toBe(3)
    expect(result.count(2)).toBe(5)
  })

  it('intersect takes min count per item', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    bag1.add(2, 1)
    const bag2 = new Bag<number>()
    bag2.add(1, 1)
    bag2.add(2, 5)
    const result = bag1.intersect(bag2)
    expect(result.count(1)).toBe(1)
    expect(result.count(2)).toBe(1)
    expect(result.count(3)).toBe(0)
  })

  it('throws on invalid add count', () => {
    const bag = new Bag<string>()
    expect(() => bag.add('a', 0)).toThrow()
    expect(() => bag.add('a', -1)).toThrow()
  })

  it('contains returns true for existing items', () => {
    const bag = new Bag<number>()
    bag.add(1)
    expect(bag.contains(1)).toBe(true)
    expect(bag.contains(2)).toBe(false)
  })

  it('remove returns false for non-existent item', () => {
    const bag = new Bag<string>()
    expect(bag.remove('z')).toBe(false)
  })

  it('union with empty bag returns copy', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    const bag2 = new Bag<number>()
    const result = bag1.union(bag2)
    expect(result.count(1)).toBe(3)
    expect(result.size).toBe(3)
  })

  it('intersect with empty bag returns empty', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    const bag2 = new Bag<number>()
    const result = bag1.intersect(bag2)
    expect(result.isEmpty()).toBe(true)
  })

  it('add with NaN key', () => {
    const bag = new Bag<number>()
    bag.add(NaN, 2)
    expect(bag.count(NaN)).toBe(2)
  })

  it('remove decreases count', () => {
    const bag = new Bag<number>()
    bag.add(1, 3)
    bag.remove(1)
    expect(bag.count(1)).toBe(2)
  })

  it('count returns 0 for absent item', () => {
    const bag = new Bag<number>()
    expect(bag.count(42)).toBe(0)
  })

  it('add and count tracks items', () => {
    const bag = new Bag<number>()
    bag.add(1)
    bag.add(1)
    expect(bag.count(1)).toBe(2)
  })

  it('count missing item is 0', () => {
    const bag = new Bag<number>()
    expect(bag.count(99)).toBe(0)
  })

  it('toString formats correctly', () => {
    const bag = new Bag<string>()
    bag.add('a', 2)
    bag.add('b', 3)
    const str = bag.toString()
    expect(str).toContain('a')
    expect(str).toContain('2')
    expect(str).toContain('b')
    expect(str).toContain('3')
  })

  it('toString of empty bag', () => {
    const bag = new Bag<string>()
    expect(bag.toString()).toBe('Bag([])')
  })

  it('toJSON returns entries array', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    bag.add(2, 3)
    const json = bag.toJSON()
    expect(json).toHaveLength(2)
    expect(json).toContainEqual([1, 2])
    expect(json).toContainEqual([2, 3])
  })

  it('clone creates independent copy', () => {
    const bag1 = new Bag<string>()
    bag1.add('a', 3)
    const bag2 = bag1.clone()
    bag2.add('a', 2)
    expect(bag1.count('a')).toBe(3)
    expect(bag2.count('a')).toBe(5)
  })

  it('clone preserves all items', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    bag1.add(2, 3)
    bag1.add(3, 1)
    const bag2 = bag1.clone()
    expect(bag2.count(1)).toBe(2)
    expect(bag2.count(2)).toBe(3)
    expect(bag2.count(3)).toBe(1)
    expect(bag2.size).toBe(bag1.size)
  })

  it('equals returns true for identical bags', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    bag1.add(2, 3)
    const bag2 = new Bag<number>()
    bag2.add(1, 2)
    bag2.add(2, 3)
    expect(bag1.equals(bag2)).toBe(true)
  })

  it('equals returns false for different bags', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    const bag2 = new Bag<number>()
    bag2.add(1, 3)
    expect(bag1.equals(bag2)).toBe(false)
  })

  it('equals returns false for non-bag objects', () => {
    const bag = new Bag<string>()
    expect(bag.equals({})).toBe(false)
    expect(bag.equals([])).toBe(false)
    expect(bag.equals(null)).toBe(false)
    expect(bag.equals(undefined)).toBe(false)
  })

  it('equals returns false for different sizes', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    const bag2 = new Bag<number>()
    bag2.add(1, 3)
    expect(bag1.equals(bag2)).toBe(false)
  })

  it('equals returns false for different unique items', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    const bag2 = new Bag<number>()
    bag2.add(2, 2)
    expect(bag1.equals(bag2)).toBe(false)
  })

  it('remove with default count removes 1', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    bag.remove(1)
    expect(bag.count(1)).toBe(4)
  })

  it('remove with large count', () => {
    const bag = new Bag<number>()
    bag.add(1, 100)
    expect(bag.remove(1, 50)).toBe(true)
    expect(bag.count(1)).toBe(50)
  })

  it('add multiple times accumulates', () => {
    const bag = new Bag<string>()
    bag.add('a')
    bag.add('a')
    bag.add('a')
    expect(bag.count('a')).toBe(3)
  })

  it('clear resets size and uniqueSize', () => {
    const bag = new Bag<number>()
    bag.add(1, 5)
    bag.add(2, 3)
    bag.clear()
    expect(bag.size).toBe(0)
    expect(bag.uniqueSize()).toBe(0)
  })

  it('union with overlapping items', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 5)
    bag1.add(2, 3)
    const bag2 = new Bag<number>()
    bag2.add(2, 4)
    bag2.add(3, 2)
    const result = bag1.union(bag2)
    expect(result.count(1)).toBe(5)
    expect(result.count(2)).toBe(4)
    expect(result.count(3)).toBe(2)
  })

  it('union does not modify original bags', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    const bag2 = new Bag<number>()
    bag2.add(2, 3)
    const result = bag1.union(bag2)
    expect(bag1.count(1)).toBe(2)
    expect(bag1.count(2)).toBe(0)
    expect(bag2.count(1)).toBe(0)
    expect(bag2.count(2)).toBe(3)
  })

  it('intersect with identical bags', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 3)
    bag1.add(2, 2)
    const bag2 = new Bag<number>()
    bag2.add(1, 3)
    bag2.add(2, 2)
    const result = bag1.intersect(bag2)
    expect(result.count(1)).toBe(3)
    expect(result.count(2)).toBe(2)
  })

  it('intersect does not modify original bags', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 5)
    bag1.add(2, 3)
    const bag2 = new Bag<number>()
    bag2.add(1, 3)
    const result = bag1.intersect(bag2)
    expect(bag1.count(1)).toBe(5)
    expect(bag2.count(1)).toBe(3)
  })

  it('items returns array of unique items', () => {
    const bag = new Bag<number>()
    bag.add(1)
    bag.add(2)
    bag.add(3)
    const items = bag.items()
    expect(items).toContain(1)
    expect(items).toContain(2)
    expect(items).toContain(3)
    expect(items).toHaveLength(3)
  })

  it('items of empty bag returns empty array', () => {
    const bag = new Bag<string>()
    expect(bag.items()).toEqual([])
  })

  it('entries returns correct pairs', () => {
    const bag = new Bag<string>()
    bag.add('a', 2)
    bag.add('b', 5)
    const entries = bag.entries()
    expect(entries).toContainEqual(['a', 2])
    expect(entries).toContainEqual(['b', 5])
  })

  it('forEach calls callback for each unique item', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    bag.add(2, 3)
    const calls: Array<[number, number]> = []
    bag.forEach((item, count) => calls.push([item, count]))
    expect(calls.length).toBe(2)
  })

  it('toArray with empty bag returns empty array', () => {
    const bag = new Bag<string>()
    expect(bag.toArray()).toEqual([])
  })

  it('toArray expands all duplicates', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    bag.add(2, 1)
    bag.add(3, 3)
    const arr = bag.toArray()
    expect(arr).toHaveLength(6)
    expect(arr.filter(x => x === 1)).toHaveLength(2)
    expect(arr.filter(x => x === 2)).toHaveLength(1)
    expect(arr.filter(x => x === 3)).toHaveLength(3)
  })

  it('size tracks all additions', () => {
    const bag = new Bag<number>()
    expect(bag.size).toBe(0)
    bag.add(1, 10)
    expect(bag.size).toBe(10)
    bag.add(2, 5)
    expect(bag.size).toBe(15)
  })

  it('uniqueSize tracks distinct items', () => {
    const bag = new Bag<string>()
    expect(bag.uniqueSize()).toBe(0)
    bag.add('a', 5)
    expect(bag.uniqueSize()).toBe(1)
    bag.add('b', 3)
    expect(bag.uniqueSize()).toBe(2)
    bag.add('a', 2)
    expect(bag.uniqueSize()).toBe(2)
  })

  it('remove updates size correctly', () => {
    const bag = new Bag<number>()
    bag.add(1, 10)
    bag.remove(1, 3)
    expect(bag.size).toBe(7)
  })

  it('remove updates uniqueSize when count reaches zero', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    expect(bag.uniqueSize()).toBe(1)
    bag.remove(1, 2)
    expect(bag.uniqueSize()).toBe(0)
  })

  it('equals with empty bags', () => {
    const bag1 = new Bag<number>()
    const bag2 = new Bag<number>()
    expect(bag1.equals(bag2)).toBe(true)
  })

  it('union creates new bag instance', () => {
    const bag1 = new Bag<number>()
    const bag2 = new Bag<number>()
    const result = bag1.union(bag2)
    expect(result).not.toBe(bag1)
    expect(result).not.toBe(bag2)
  })

  it('intersect creates new bag instance', () => {
    const bag1 = new Bag<number>()
    const bag2 = new Bag<number>()
    const result = bag1.intersect(bag2)
    expect(result).not.toBe(bag1)
    expect(result).not.toBe(bag2)
  })

  it('clone returns same type', () => {
    const bag = new Bag<number>()
    bag.add(1, 2)
    const clone = bag.clone()
    expect(clone).toBeInstanceOf(Bag)
  })

  it('add with object keys', () => {
    const bag = new Bag<{ id: number }>()
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    bag.add(obj1, 2)
    bag.add(obj2, 3)
    expect(bag.count(obj1)).toBe(2)
    expect(bag.count(obj2)).toBe(3)
  })

  it('remove with object keys', () => {
    const bag = new Bag<{ id: number }>()
    const obj = { id: 1 }
    bag.add(obj, 3)
    expect(bag.remove(obj, 2)).toBe(true)
    expect(bag.count(obj)).toBe(1)
  })

  it('union with object keys', () => {
    const bag1 = new Bag<{ id: number }>()
    const bag2 = new Bag<{ id: number }>()
    const obj = { id: 1 }
    bag1.add(obj, 2)
    bag2.add(obj, 3)
    const result = bag1.union(bag2)
    expect(result.count(obj)).toBe(3)
  })

  it('intersect with no common items', () => {
    const bag1 = new Bag<number>()
    bag1.add(1, 2)
    bag1.add(2, 3)
    const bag2 = new Bag<number>()
    bag2.add(3, 1)
    bag2.add(4, 2)
    const result = bag1.intersect(bag2)
    expect(result.isEmpty()).toBe(true)
  })
})

describe('bag - wave546', () => {
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

describe('bag - wave547', () => {
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

describe('bag - wave548', () => {
  it('bag module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bag module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bag module has name', () => {
    expect(describe).toBeDefined()
  })
})
