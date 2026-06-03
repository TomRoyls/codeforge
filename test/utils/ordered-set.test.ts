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

  it('at returns item at index', () => {
    const os = new OrderedSet<string>()
    os.add('a')
    os.add('b')
    os.add('c')
    expect(os.at(0)).toBe('a')
    expect(os.at(1)).toBe('b')
    expect(os.at(2)).toBe('c')
    expect(os.at(-1)).toBe('c')
    expect(os.at(10)).toBeUndefined()
  })

  it('first and last work', () => {
    const os = new OrderedSet<number>()
    os.add(10)
    os.add(20)
    os.add(30)
    expect(os.first()).toBe(10)
    expect(os.last()).toBe(30)
  })

  it('first/last after deletion skip tombstones', () => {
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

  it('re-add after delete', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.delete(1)
    os.add(1)
    expect(os.toArray()).toEqual([2, 1])
    expect(os.size).toBe(2)
  })

  it('at with negative index', () => {
    const os = new OrderedSet<string>()
    os.add('a')
    os.add('b')
    os.add('c')
    expect(os.at(-2)).toBe('b')
  })

  it('first/last on empty set', () => {
    const os = new OrderedSet<number>()
    expect(os.first()).toBeUndefined()
    expect(os.last()).toBeUndefined()
  })

  it('works with string type', () => {
    const os = new OrderedSet<string>()
    os.add('hello')
    os.add('world')
    expect(os.toArray()).toEqual(['hello', 'world'])
    expect(os.has('hello')).toBe(true)
  })

  it('handles delete', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    os.delete(2)
    expect(os.has(2)).toBe(false)
    expect(os.size).toBe(2)
  })

  it('has returns false for missing element', () => {
    const os = new OrderedSet<number>()
    expect(os.has(42)).toBe(false)
  })

  it('size returns count of elements', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    expect(os.size).toBe(3)
  })

  it('has returns true for added element', () => {
    const os = new OrderedSet<number>()
    os.add(42)
    expect(os.has(42)).toBe(true)
  })

  it('has returns false for non-member', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    expect(os.has(99)).toBe(false)
  })

  it('size tracks elements', () => {
    const os = new OrderedSet<number>()
    os.add(1)
    os.add(2)
    os.add(3)
    expect(os.size).toBe(3)
  })

  it('has returns true for existing element', () => {
    const os = new OrderedSet<number>()
    os.add(42)
    expect(os.has(42)).toBe(true)
  })
})
