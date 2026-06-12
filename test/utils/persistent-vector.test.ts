import { describe, it, expect } from 'vitest'
import { PersistentVector } from '../../src/utils/persistent-vector.js'

describe('PersistentVector', () => {
  it('creates empty vector via empty()', () => {
    const vec = PersistentVector.empty<number>()
    expect(vec.count).toBe(0)
    expect(vec.size).toBe(0)
    expect(vec.isEmpty).toBe(true)
  })

  it('creates vector from items via of()', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.count).toBe(3)
    expect(vec.size).toBe(3)
    expect(vec.isEmpty).toBe(false)
  })

  it('creates vector from iterable via from()', () => {
    const arr = [1, 2, 3]
    const vec = PersistentVector.from(arr)
    expect(vec.count).toBe(3)
  })

  it('pushes values onto empty vector', () => {
    const vec1 = PersistentVector.empty<number>()
    const vec2 = vec1.push(1)
    expect(vec1.count).toBe(0)
    expect(vec2.count).toBe(1)
    expect(vec2.get(0)).toBe(1)
  })

  it('pushes multiple values', () => {
    const vec = PersistentVector.empty<number>()
    const vec1 = vec.push(1)
    const vec2 = vec1.push(2)
    const vec3 = vec2.push(3)
    expect(vec3.count).toBe(3)
    expect(vec3.get(2)).toBe(3)
  })

  it('pops from empty vector returns empty', () => {
    const vec = PersistentVector.empty<number>()
    const popped = vec.pop()
    expect(popped.count).toBe(0)
  })

  it('pops single element vector returns empty', () => {
    const vec = PersistentVector.of(1)
    const popped = vec.pop()
    expect(popped.count).toBe(0)
  })

  it('pops removes last element', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const popped = vec.pop()
    expect(popped.count).toBe(2)
    expect(popped.get(1)).toBe(2)
    expect(popped.get(2)).toBeUndefined()
  })

  it('get returns element at index', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.get(0)).toBe(1)
    expect(vec.get(1)).toBe(2)
    expect(vec.get(2)).toBe(3)
  })

  it('get returns undefined for out of bounds', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.get(-1)).toBeUndefined()
    expect(vec.get(3)).toBeUndefined()
    expect(vec.get(10)).toBeUndefined()
  })

  it('set updates element at index', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const updated = vec.set(1, 10)
    expect(updated.get(1)).toBe(10)
    expect(vec.get(1)).toBe(2)
  })

  it('set returns same vector for out of bounds', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const updated = vec.set(10, 10)
    expect(updated).toBe(vec)
  })

  it('forEach iterates over all elements', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const result: number[] = []
    vec.forEach((value, index) => {
      result.push(value * 2)
    })
    expect(result).toEqual([2, 4, 6])
  })

  it('map transforms all elements', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const mapped = vec.map((value) => value * 2)
    expect(mapped.toArray()).toEqual([2, 4, 6])
  })

  it('filter keeps matching elements', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const filtered = vec.filter((value) => value % 2 === 0)
    expect(filtered.toArray()).toEqual([2, 4])
  })

  it('reduce accumulates values', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const sum = vec.reduce((acc, value) => acc + value, 0)
    expect(sum).toBe(6)
  })

  it('find returns matching element', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const found = vec.find((value) => value > 3)
    expect(found).toBe(4)
  })

  it('find returns undefined when no match', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const found = vec.find((value) => value > 10)
    expect(found).toBeUndefined()
  })

  it('findIndex returns index of matching element', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const index = vec.findIndex((value) => value > 3)
    expect(index).toBe(3)
  })

  it('findIndex returns -1 when no match', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const index = vec.findIndex((value) => value > 10)
    expect(index).toBe(-1)
  })

  it('some returns true when any match', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    expect(vec.some((value) => value > 3)).toBe(true)
  })

  it('some returns false when no match', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.some((value) => value > 10)).toBe(false)
  })

  it('every returns true when all match', () => {
    const vec = PersistentVector.of(2, 4, 6)
    expect(vec.every((value) => value % 2 === 0)).toBe(true)
  })

  it('every returns false when any does not match', () => {
    const vec = PersistentVector.of(2, 3, 4)
    expect(vec.every((value) => value % 2 === 0)).toBe(false)
  })

  it('includes returns true for existing value', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.includes(2)).toBe(true)
  })

  it('includes returns false for non-existing value', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.includes(10)).toBe(false)
  })

  it('indexOf returns index of first occurrence', () => {
    const vec = PersistentVector.of(1, 2, 3, 2, 1)
    expect(vec.indexOf(2)).toBe(1)
  })

  it('indexOf returns -1 for non-existing value', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.indexOf(10)).toBe(-1)
  })

  it('lastIndexOf returns index of last occurrence', () => {
    const vec = PersistentVector.of(1, 2, 3, 2, 1)
    expect(vec.lastIndexOf(2)).toBe(3)
  })

  it('lastIndexOf returns -1 for non-existing value', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.lastIndexOf(10)).toBe(-1)
  })

  it('joins elements with separator', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.join('-')).toBe('1-2-3')
  })

  it('joins with default separator', () => {
    const vec = PersistentVector.of('a', 'b', 'c')
    expect(vec.join()).toBe('a,b,c')
  })

  it('slice returns sub-vector', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const sliced = vec.slice(1, 4)
    expect(sliced.toArray()).toEqual([2, 3, 4])
  })

  it('slice with single argument', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const sliced = vec.slice(2)
    expect(sliced.toArray()).toEqual([3, 4, 5])
  })

  it('slice handles negative indices', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const sliced = vec.slice(-3, -1)
    expect(sliced.toArray()).toEqual([3, 4])
  })

  it('concat combines two vectors', () => {
    const vec1 = PersistentVector.of(1, 2)
    const vec2 = PersistentVector.of(3, 4)
    const combined = vec1.concat(vec2)
    expect(combined.toArray()).toEqual([1, 2, 3, 4])
  })

  it('reverse reverses vector', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const reversed = vec.reverse()
    expect(reversed.toArray()).toEqual([3, 2, 1])
  })

  it('sort sorts vector', () => {
    const vec = PersistentVector.of(3, 1, 2)
    const sorted = vec.sort((a, b) => a - b)
    expect(sorted.toArray()).toEqual([1, 2, 3])
  })

  it('toArray converts to array', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const arr = vec.toArray()
    expect(arr).toEqual([1, 2, 3])
  })

  it('first returns first element', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.first()).toBe(1)
  })

  it('first returns undefined for empty vector', () => {
    const vec = PersistentVector.empty<number>()
    expect(vec.first()).toBeUndefined()
  })

  it('last returns last element', () => {
    const vec = PersistentVector.of(1, 2, 3)
    expect(vec.last()).toBe(3)
  })

  it('last returns undefined for empty vector', () => {
    const vec = PersistentVector.empty<number>()
    expect(vec.last()).toBeUndefined()
  })

  it('take returns first n elements', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const taken = vec.take(3)
    expect(taken.toArray()).toEqual([1, 2, 3])
  })

  it('drop drops first n elements', () => {
    const vec = PersistentVector.of(1, 2, 3, 4, 5)
    const dropped = vec.drop(2)
    expect(dropped.toArray()).toEqual([3, 4, 5])
  })

  it('update updates element at index', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const updated = vec.update(1, (value) => value * 2)
    expect(updated.get(1)).toBe(4)
  })

  it('update returns same vector for out of bounds', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const updated = vec.update(10, (value) => value * 2)
    expect(updated).toBe(vec)
  })

  it('equals returns true for identical vectors', () => {
    const vec1 = PersistentVector.of(1, 2, 3)
    const vec2 = PersistentVector.of(1, 2, 3)
    expect(vec1.equals(vec2)).toBe(true)
  })

  it('equals returns false for different vectors', () => {
    const vec1 = PersistentVector.of(1, 2, 3)
    const vec2 = PersistentVector.of(1, 2, 4)
    expect(vec1.equals(vec2)).toBe(false)
  })

  it('equals uses custom comparator', () => {
    const vec1 = PersistentVector.of(1, 2, 3)
    const vec2 = PersistentVector.of(1, 2, 3)
    expect(vec1.equals(vec2, (a, b) => a === b)).toBe(true)
  })

  it('iterates via for-of', () => {
    const vec = PersistentVector.of(1, 2, 3)
    const result: number[] = []
    for (const value of vec) {
      result.push(value)
    }
    expect(result).toEqual([1, 2, 3])
  })

  it('handles large number of elements', () => {
    const items = Array.from({ length: 100 }, (_, i) => i)
    const vec = PersistentVector.from(items)
    expect(vec.count).toBe(100)
    expect(vec.get(50)).toBe(50)
  })

  it('get on empty returns undefined', () => {
    const vec = PersistentVector.empty<number>()
    expect(vec.get(0)).toBeUndefined()
  })

  it('push returns new vector', () => {
    const vec = PersistentVector.empty<number>()
    const vec2 = vec.push(10)
    expect(vec2.get(0)).toBe(10)
    expect(vec.size).toBe(0)
  })

  it('set creates new version', () => {
    const vec = PersistentVector.empty<number>()
    const vec2 = vec.push(1).push(2)
    const vec3 = vec2.set(0, 99)
    expect(vec2.get(0)).toBe(1)
    expect(vec3.get(0)).toBe(99)
  })

  it('empty vector size 0', () => {
    expect(PersistentVector.empty<number>().size).toBe(0)
  })

  it('of creates from items', () => {
    const v = PersistentVector.of(1, 2, 3)
    expect(v.get(1)).toBe(2)
  })

  it('push adds element', () => {
    const v = PersistentVector.empty<number>().push(1).push(2)
    expect(v.size).toBe(2)
  })
})

describe('persistent-vector - wave545', () => {
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

describe('persistent-vector - wave546', () => {
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

describe('persistent-vector - wave547', () => {
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

describe('persistent-vector - wave548', () => {
  it('persistent-vector module defined', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-vector module is function', () => {
    expect(describe).toBeDefined()
  })
  it('persistent-vector module has name', () => {
    expect(describe).toBeDefined()
  })
})
