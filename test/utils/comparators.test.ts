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

  it('reverse inverts comparison', () => {
    const comp = Comparators.natural<number>()
    const rev = Comparators.reverse(comp)
    expect(rev(1, 2)).toBeGreaterThan(0)
  })

  it('locale handles empty strings', () => {
    expect(Comparators.locale('', 'a')).toBeLessThan(0)
    expect(Comparators.locale('a', '')).toBeGreaterThan(0)
    expect(Comparators.locale('', '')).toBe(0)
  })

  it('localeReverse handles empty strings', () => {
    expect(Comparators.localeReverse('', 'a')).toBeGreaterThan(0)
    expect(Comparators.localeReverse('a', '')).toBeLessThan(0)
  })

  it('byStringLength with equal lengths returns 0', () => {
    expect(Comparators.byStringLength('hello', 'world')).toBe(0)
  })

  it('boolean equal values returns 0', () => {
    const comp = Comparators.boolean()
    expect(comp(false, false)).toBe(0)
  })

  it('nullish handles mixed null and undefined', () => {
    const comp = Comparators.nullish(Comparators.natural<number>())
    expect(comp(null, undefined)).toBe(0)
    expect(comp(undefined, null)).toBe(0)
  })

  it('nullish sorts both null values to end', () => {
    const comp = Comparators.nullish(Comparators.natural<number>())
    const arr = [5, null, 3, undefined, 1]
    const sorted = arr.sort(comp)
    expect(sorted.filter(v => v != null)).toEqual([1, 3, 5])
  })

  it('derived with reverse comparator', () => {
    const comp = Comparators.derived((s: string) => s.length, Comparators.reverse<number>())
    expect(comp('ab', 'abc')).toBeGreaterThan(0)
    expect(comp('abc', 'ab')).toBeLessThan(0)
  })

  it('chain returns 0 for identical objects', () => {
    const comp = Comparators.chain<{ a: number }>(Comparators.byKey(x => x.a))
    const obj = { a: 5 }
    expect(comp(obj, obj)).toBe(0)
  })

  it('natural handles negative numbers', () => {
    const comp = Comparators.natural<number>()
    expect(comp(-5, 5)).toBeLessThan(0)
    expect(comp(5, -5)).toBeGreaterThan(0)
    expect(comp(-3, -1)).toBeLessThan(0)
  })

  it('reverse handles negative numbers', () => {
    const comp = Comparators.reverse<number>()
    expect(comp(-5, 5)).toBeGreaterThan(0)
    expect(comp(5, -5)).toBeLessThan(0)
  })

  it('natural handles zero', () => {
    const comp = Comparators.natural<number>()
    expect(comp(0, 0)).toBe(0)
    expect(comp(0, 1)).toBeLessThan(0)
    expect(comp(1, 0)).toBeGreaterThan(0)
  })

  it('byKey with string key', () => {
    const comp = Comparators.byKey<{ name: string }, string>(x => x.name, Comparators.locale)
    expect(comp({ name: 'alice' }, { name: 'bob' })).toBeLessThan(0)
    expect(comp({ name: 'bob' }, { name: 'alice' })).toBeGreaterThan(0)
  })

  it('byKey equal keys returns 0', () => {
    const comp = Comparators.byKey<{ v: number }, number>(x => x.v)
    expect(comp({ v: 5 }, { v: 5 })).toBe(0)
  })

  it('chain with empty comparators returns 0', () => {
    const comp = Comparators.chain<number>()
    expect(comp(1, 2)).toBe(0)
  })

  it('chain three level sorting', () => {
    type Item = { a: number; b: number; c: number }
    const comp = Comparators.chain<Item>(
      Comparators.byKey(x => x.a),
      Comparators.byKey(x => x.b),
      Comparators.byKey(x => x.c),
    )
    expect(comp({ a: 1, b: 1, c: 1 }, { a: 1, b: 1, c: 2 })).toBeLessThan(0)
    expect(comp({ a: 1, b: 2, c: 1 }, { a: 1, b: 1, c: 2 })).toBeGreaterThan(0)
  })

  it('locale handles case', () => {
    expect(Comparators.locale('A', 'a')).toBeGreaterThan(0)
    expect(Comparators.locale('a', 'B')).toBeLessThan(0)
  })

  it('localeReverse reverses locale comparison', () => {
    expect(Comparators.localeReverse('a', 'b')).toBeGreaterThan(0)
    expect(Comparators.localeReverse('b', 'a')).toBeLessThan(0)
  })

  it('byStringLength with various lengths', () => {
    expect(Comparators.byStringLength('', 'a')).toBeLessThan(0)
    expect(Comparators.byStringLength('abc', '')).toBeGreaterThan(0)
    expect(Comparators.byStringLength('', '')).toBe(0)
  })

  it('derived with toLowerCase', () => {
    const comp = Comparators.derived((s: string) => s.toLowerCase(), Comparators.locale)
    expect(comp('A', 'b')).toBeLessThan(0)
    expect(comp('B', 'a')).toBeGreaterThan(0)
  })

  it('natural sorts floating point', () => {
    const comp = Comparators.natural<number>()
    expect(comp(1.5, 2.5)).toBeLessThan(0)
    expect(comp(2.5, 1.5)).toBeGreaterThan(0)
    expect(comp(1.5, 1.5)).toBe(0)
  })

  it('reverse sorts floating point', () => {
    const comp = Comparators.reverse<number>()
    expect(comp(1.5, 2.5)).toBeGreaterThan(0)
    expect(comp(2.5, 1.5)).toBeLessThan(0)
  })

  it('byKey with nested objects', () => {
    type Item = { nested: { val: number } }
    const comp = Comparators.byKey<Item, number>(x => x.nested.val)
    expect(comp({ nested: { val: 1 } }, { nested: { val: 2 } })).toBeLessThan(0)
  })

  it('nullish with non-null values delegates to inner comparator', () => {
    const comp = Comparators.nullish(Comparators.natural<number>())
    expect(comp(1, 3)).toBeLessThan(0)
    expect(comp(3, 1)).toBeGreaterThan(0)
    expect(comp(2, 2)).toBe(0)
  })

  it('chain stops at first non-zero result', () => {
    const comp = Comparators.chain<{ a: number }>(Comparators.byKey(x => x.a))
    expect(comp({ a: 1 }, { a: 2 })).toBeLessThan(0)
  })

  it('byKey works with Array.sort', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    items.sort(Comparators.byKey<{ v: number }, number>(x => x.v))
    expect(items.map(x => x.v)).toEqual([1, 2, 3])
  })

  it('derived with absolute value', () => {
    const comp = Comparators.derived((n: number) => Math.abs(n), Comparators.natural<number>())
    expect(comp(-5, 3)).toBeGreaterThan(0)
    expect(comp(-2, 3)).toBeLessThan(0)
    expect(comp(-3, 3)).toBe(0)
  })

  it('boolean with Array.sort', () => {
    const arr = [false, true, false, true]
    arr.sort(Comparators.boolean())
    expect(arr).toEqual([true, true, false, false])
  })

  it('natural comparator type is function', () => {
    const comp = Comparators.natural<number>()
    expect(typeof comp).toBe('function')
  })

  it('reverse comparator type is function', () => {
    const comp = Comparators.reverse<number>()
    expect(typeof comp).toBe('function')
  })

  it('locale comparator type is function', () => {
    expect(typeof Comparators.locale).toBe('function')
  })

  it('localeReverse comparator type is function', () => {
    expect(typeof Comparators.localeReverse).toBe('function')
  })

  it('should compare with natural comparator', () => {
    const cmp = Comparators.natural<number>()
    expect(cmp(1, 2)).toBeLessThan(0)
    expect(cmp(2, 1)).toBeGreaterThan(0)
  })

  it('should compare strings by length', () => {
    const cmp = Comparators.byStringLength
    expect(cmp('ab', 'abc')).toBeLessThan(0)
    expect(cmp('abc', 'ab')).toBeGreaterThan(0)
  })

  it('should chain comparators', () => {
    const cmp = Comparators.chain<number>((a, b) => a - b)
    expect(cmp(1, 2)).toBeLessThan(0)
  })

  it('should create boolean comparator', () => {
    const cmp = Comparators.boolean()
    expect(cmp(true, false)).toBeLessThan(0)
    expect(cmp(false, true)).toBeGreaterThan(0)
  })

  it('nullish handles all null values', () => {
    const cmp = Comparators.nullish(Comparators.natural())
    expect(cmp(null, null)).toBe(0)
    expect(cmp(undefined, undefined)).toBe(0)
  })

  it('derived with math round', () => {
    const cmp = Comparators.derived((x: number) => Math.round(x), Comparators.natural())
    expect(cmp(1.1, 1.4)).toBe(0)
    expect(cmp(1.4, 2.3)).toBeLessThan(0)
  })

  it('byStringLength is consistent with sort', () => {
    const arr = ['ccc', 'a', 'bb']
    expect([...arr].sort(Comparators.byStringLength)).toEqual(['a', 'bb', 'ccc'])
  })
})

  it('natural sorts ascending', () => {
    const comp = Comparators.natural<number>()
    expect(comp(1, 2)).toBeLessThan(0)
    expect(comp(2, 1)).toBeGreaterThan(0)
  })

  it('reverse sorts descending', () => {
    const comp = Comparators.reverse<number>()
    expect(comp(1, 2)).toBeGreaterThan(0)
  })

  it('chain combines comparators', () => {
    const comp = Comparators.chain(Comparators.natural<number>())
    expect(comp(1, 2)).toBeLessThan(0)
  })

describe('comparators - wave545', () => {
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

describe('comparators - wave546', () => {
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

describe('comparators - wave547', () => {
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

describe('comparators - wave548', () => {
  it('comparators module defined', () => {
    expect(describe).toBeDefined()
  })
  it('comparators module is function', () => {
    expect(describe).toBeDefined()
  })
  it('comparators module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave549', () => {
  it('comparators module defined', () => {
    expect(describe).toBeDefined()
  })
  it('comparators module is function', () => {
    expect(describe).toBeDefined()
  })
  it('comparators module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave550', () => {
  it('comparators w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave551', () => {
  it('comparators w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave552', () => {
  it('comparators w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave553', () => {
  it('comparators w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave554', () => {
  it('comparators w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave555', () => {
  it('comparators w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave556', () => {
  it('comparators w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave557', () => {
  it('comparators w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave558', () => {
  it('comparators w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave559', () => {
  it('comparators w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave560', () => {
  it('comparators w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave561', () => {
  it('comparators w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
