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
})
