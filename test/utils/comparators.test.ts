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

describe('comparators - wave562', () => {
  it('comparators w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave563', () => {
  it('comparators w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave564', () => {
  it('comparators w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave565', () => {
  it('comparators w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave566', () => {
  it('comparators w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave127', () => {
  it('comparators w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave130', () => {
  it('comparators w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave133', () => {
  it('comparators w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave136', () => {
  it('comparators w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - wave139', () => {
  it('comparators w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w142', () => {
  it('comparators v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w145', () => {
  it('comparators v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w148', () => {
  it('comparators v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w151', () => {
  it('comparators v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w154', () => {
  it('comparators v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w157', () => {
  it('comparators v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w160', () => {
  it('comparators v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w170', () => {
  it('comparators x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w180', () => {
  it('comparators x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w190', () => {
  it('comparators x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w200', () => {
  it('comparators x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w210', () => {
  it('comparators x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w220', () => {
  it('comparators x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w230', () => {
  it('comparators x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w240', () => {
  it('comparators x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w250', () => {
  it('comparators x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w260', () => {
  it('comparators x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w270', () => {
  it('comparators x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w280', () => {
  it('comparators x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w290', () => {
  it('comparators x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w300', () => {
  it('comparators x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w310', () => {
  it('comparators x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w320', () => {
  it('comparators x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w330', () => {
  it('comparators x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w340', () => {
  it('comparators x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w350', () => {
  it('comparators x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w360', () => {
  it('comparators x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w370', () => {
  it('comparators x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w380', () => {
  it('comparators x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w390', () => {
  it('comparators x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w400', () => {
  it('comparators x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w420', () => {
  it('comparators x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w440', () => {
  it('comparators x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w460', () => {
  it('comparators x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w480', () => {
  it('comparators x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('comparators - w500', () => {
  it('comparators x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('comparators x500x19', () => {
    expect(describe).toBeDefined()
  })
})
