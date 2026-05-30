import { describe, test, expect } from 'vitest'
import { increment, append } from '../../../src/utils/map-helpers.js'

describe('increment', () => {
  test('increments from missing key treating it as 0', () => {
    const map = new Map<string, number>()
    increment(map, 'foo')
    expect(map.get('foo')).toBe(1)
  })

  test('increments existing value by default delta of 1', () => {
    const map = new Map<string, number>()
    map.set('bar', 5)
    increment(map, 'bar')
    expect(map.get('bar')).toBe(6)
  })

  test('increments with custom delta', () => {
    const map = new Map<string, number>()
    map.set('count', 10)
    increment(map, 'count', 5)
    expect(map.get('count')).toBe(15)
  })

  test('handles negative delta', () => {
    const map = new Map<string, number>()
    map.set('value', 10)
    increment(map, 'value', -3)
    expect(map.get('value')).toBe(7)
  })

  test('applies negative delta to missing key starting from 0', () => {
    const map = new Map<string, number>()
    increment(map, 'new', -5)
    expect(map.get('new')).toBe(-5)
  })

  test('increments with delta of 0 leaves value unchanged', () => {
    const map = new Map<string, number>()
    map.set('unchanged', 42)
    increment(map, 'unchanged', 0)
    expect(map.get('unchanged')).toBe(42)
  })

  test('handles large delta values', () => {
    const map = new Map<string, number>()
    increment(map, 'big', 1_000_000)
    expect(map.get('big')).toBe(1_000_000)
  })

  test('works with number key type', () => {
    const map = new Map<number, number>()
    increment(map, 1)
    increment(map, 1, 10)
    expect(map.get(1)).toBe(11)
  })

  test('handles multiple keys independently', () => {
    const map = new Map<string, number>()
    increment(map, 'a', 1)
    increment(map, 'b', 2)
    increment(map, 'a', 3)
    increment(map, 'b', 4)
    expect(map.get('a')).toBe(4)
    expect(map.get('b')).toBe(6)
  })

  test('increments floating point values correctly', () => {
    const map = new Map<string, number>()
    map.set('float', 0.5)
    increment(map, 'float', 0.25)
    expect(map.get('float')).toBe(0.75)
  })

  test('handles negative starting values', () => {
    const map = new Map<string, number>()
    map.set('neg', -10)
    increment(map, 'neg', 5)
    expect(map.get('neg')).toBe(-5)
  })

  test('can increment to positive from negative with large delta', () => {
    const map = new Map<string, number>()
    map.set('neg', -100)
    increment(map, 'neg', 200)
    expect(map.get('neg')).toBe(100)
  })
})

describe('append', () => {
  test('appends to missing key creating new array', () => {
    const map = new Map<string, number[]>()
    append(map, 'list', 1)
    expect(map.get('list')).toEqual([1])
  })

  test('appends to existing array', () => {
    const map = new Map<string, number[]>()
    map.set('items', [1, 2])
    append(map, 'items', 3)
    expect(map.get('items')).toEqual([1, 2, 3])
  })

  test('handles multiple appends to same key', () => {
    const map = new Map<string, number[]>()
    append(map, 'nums', 1)
    append(map, 'nums', 2)
    append(map, 'nums', 3)
    expect(map.get('nums')).toEqual([1, 2, 3])
  })

  test('appends different types with generic arrays', () => {
    const map = new Map<string, string[]>()
    append(map, 'words', 'hello')
    append(map, 'words', 'world')
    expect(map.get('words')).toEqual(['hello', 'world'])
  })

  test('works with number keys', () => {
    const map = new Map<number, string[]>()
    append(map, 1, 'a')
    append(map, 1, 'b')
    expect(map.get(1)).toEqual(['a', 'b'])
  })

  test('appends null values', () => {
    const map = new Map<string, (string | null)[]>()
    append(map, 'mixed', null)
    append(map, 'mixed', 'test')
    expect(map.get('mixed')).toEqual([null, 'test'])
  })

  test('appends undefined values', () => {
    const map = new Map<string, (number | undefined)[]>()
    append(map, 'vals', undefined)
    append(map, 'vals', 1)
    expect(map.get('vals')).toEqual([undefined, 1])
  })

  test('handles multiple keys independently', () => {
    const map = new Map<string, number[]>()
    append(map, 'a', 1)
    append(map, 'b', 2)
    append(map, 'a', 3)
    append(map, 'b', 4)
    expect(map.get('a')).toEqual([1, 3])
    expect(map.get('b')).toEqual([2, 4])
  })

  test('appends to empty array', () => {
    const map = new Map<string, number[]>()
    map.set('empty', [])
    append(map, 'empty', 42)
    expect(map.get('empty')).toEqual([42])
  })

  test('appends large number of values efficiently', () => {
    const map = new Map<string, number[]>()
    for (let i = 0; i < 1000; i++) {
      append(map, 'large', i)
    }
    const result = map.get('large')
    expect(result?.length).toBe(1000)
    expect(result?.[0]).toBe(0)
    expect(result?.[999]).toBe(999)
  })

  test('modifies array in place rather than creating new one', () => {
    const map = new Map<string, number[]>()
    map.set('ref', [1])
    const originalArray = map.get('ref')
    append(map, 'ref', 2)
    expect(map.get('ref')).toBe(originalArray)
    expect(originalArray).toEqual([1, 2])
  })

  test('appends boolean values', () => {
    const map = new Map<string, boolean[]>()
    append(map, 'bools', true)
    append(map, 'bools', false)
    expect(map.get('bools')).toEqual([true, false])
  })

  test('appends object values', () => {
    interface Item { id: number }
    const map = new Map<string, Item[]>()
    append(map, 'items', { id: 1 })
    append(map, 'items', { id: 2 })
    expect(map.get('items')).toEqual([{ id: 1 }, { id: 2 }])
  })

  test('handles symbol keys', () => {
    const map = new Map<symbol, number[]>()
    const key = Symbol('test')
    append(map, key, 1)
    append(map, key, 2)
    expect(map.get(key)).toEqual([1, 2])
  })

  test('appends to array with existing values preserves order', () => {
    const map = new Map<string, number[]>()
    map.set('order', [10, 20, 30])
    append(map, 'order', 40)
    append(map, 'order', 50)
    expect(map.get('order')).toEqual([10, 20, 30, 40, 50])
  })
})