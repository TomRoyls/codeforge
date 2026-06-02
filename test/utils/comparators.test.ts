import { describe, expect, it } from 'vitest'
import { Comparators } from '../../src/utils/comparators.js'

describe('Comparators', () => {
  it('natural sorts numbers ascending', () => {
    const comp = Comparators.natural<number>()
    expect(comp(1, 2)).toBeLessThan(0)
    expect(comp(3, 1)).toBeGreaterThan(0)
    expect(comp(5, 5)).toBe(0)
  })

  it('reverse sorts numbers descending', () => {
    const comp = Comparators.reverse<number>()
    expect(comp(1, 2)).toBeGreaterThan(0)
    expect(comp(3, 1)).toBeLessThan(0)
  })

  it('byKey sorts by extracted key', () => {
    const comp = Comparators.byKey<{ age: number }, number>(p => p.age)
    expect(comp({ age: 20 }, { age: 30 })).toBeLessThan(0)
    expect(comp({ age: 40 }, { age: 30 })).toBeGreaterThan(0)
  })

  it('chain combines multiple comparators', () => {
    type Item = { priority: number; name: string }
    const comp = Comparators.chain<Item>(
      Comparators.byKey(i => i.priority),
      Comparators.byKey(i => i.name, Comparators.locale),
    )
    const a: Item = { priority: 1, name: 'b' }
    const b: Item = { priority: 1, name: 'a' }
    expect(comp(a, b)).toBeGreaterThan(0)
    const c: Item = { priority: 2, name: 'a' }
    expect(comp(a, c)).toBeLessThan(0)
  })

  it('locale compares strings', () => {
    expect(Comparators.locale('apple', 'banana')).toBeLessThan(0)
    expect(Comparators.locale('cherry', 'banana')).toBeGreaterThan(0)
  })

  it('localeReverse reverses string order', () => {
    expect(Comparators.localeReverse('apple', 'banana')).toBeGreaterThan(0)
  })

  it('byStringLength compares string lengths', () => {
    expect(Comparators.byStringLength('ab', 'abc')).toBeLessThan(0)
    expect(Comparators.byStringLength('abc', 'ab')).toBeGreaterThan(0)
    expect(Comparators.byStringLength('ab', 'cd')).toBe(0)
  })

  it('boolean sorts true before false', () => {
    const comp = Comparators.boolean()
    expect(comp(true, false)).toBeLessThan(0)
    expect(comp(false, true)).toBeGreaterThan(0)
    expect(comp(true, true)).toBe(0)
  })

  it('nullish sorts nulls to end', () => {
    const comp = Comparators.nullish(Comparators.natural<number>())
    expect(comp(null, 5)).toBeGreaterThan(0)
    expect(comp(5, null)).toBeLessThan(0)
    expect(comp(null, null)).toBe(0)
    expect(comp(3, 5)).toBeLessThan(0)
  })

  it('derived transforms before comparing', () => {
    const comp = Comparators.derived((s: string) => s.length, Comparators.natural<number>())
    expect(comp('ab', 'abc')).toBeLessThan(0)
    expect(comp('abc', 'ab')).toBeGreaterThan(0)
  })

  it('natural works with Array.sort', () => {
    const arr = [3, 1, 4, 1, 5, 9]
    expect(arr.sort(Comparators.natural())).toEqual([1, 1, 3, 4, 5, 9])
  })

  it('reverse works with Array.sort', () => {
    const arr = [3, 1, 4, 1, 5, 9]
    expect(arr.sort(Comparators.reverse())).toEqual([9, 5, 4, 3, 1, 1])
  })

  it('nullish handles undefined', () => {
    const comp = Comparators.nullish(Comparators.natural<number>())
    expect(comp(undefined, 5)).toBeGreaterThan(0)
    expect(comp(undefined, undefined)).toBe(0)
  })

  it('chain with single comparator works', () => {
    const comp = Comparators.chain(Comparators.natural<number>())
    expect(comp(1, 2)).toBeLessThan(0)
    expect(comp(2, 1)).toBeGreaterThan(0)
  })

  it('byKey with custom comparator', () => {
    const comp = Comparators.byKey<{ len: number }, number>(x => x.len, Comparators.reverse<number>())
    expect(comp({ len: 1 }, { len: 2 })).toBeGreaterThan(0)
  })

  it('chain with multiple comparators', () => {
    const comp = Comparators.chain<{ a: number; b: number }>(
      Comparators.byKey(x => x.a, Comparators.natural<number>()),
      Comparators.byKey(x => x.b, Comparators.natural<number>()),
    )
    expect(comp({ a: 1, b: 2 }, { a: 1, b: 3 })).toBeLessThan(0)
    expect(comp({ a: 2, b: 1 }, { a: 1, b: 2 })).toBeGreaterThan(0)
  })

  it('natural handles equal values', () => {
    const comp = Comparators.natural<number>()
    expect(comp(5, 5)).toBe(0)
  })

  it('reverse inverts comparison', () => {
    const comp = Comparators.natural<number>()
    const rev = Comparators.reverse(comp)
    expect(rev(1, 2)).toBeGreaterThan(0)
  })

  it('natural comparator orders numbers', () => {
    const comp = Comparators.natural<number>()
    expect(comp(1, 2)).toBeLessThan(0)
    expect(comp(2, 1)).toBeGreaterThan(0)
    expect(comp(1, 1)).toBe(0)
  })

  it('reverse comparator inverts order', () => {
    const comp = Comparators.natural<number>()
    expect(comp(1, 2)).toBeLessThan(0)
    expect(comp(2, 1)).toBeGreaterThan(0)
  })
})
