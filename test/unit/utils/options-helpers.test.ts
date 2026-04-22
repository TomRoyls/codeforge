import { describe, test, expect } from 'vitest'
import { extractRuleOptions } from '../../../src/utils/options-helpers.js'

describe('extractRuleOptions', () => {
  const defaultOptions = {
    enabled: true,
    threshold: 10,
    message: 'default message',
  }

  test('should return default value when rawOptions is undefined', () => {
    const result = extractRuleOptions(undefined, defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when rawOptions is null', () => {
    const result = extractRuleOptions(null, defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when rawOptions is not an array', () => {
    const result = extractRuleOptions({ enabled: false }, defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when rawOptions is empty array', () => {
    const result = extractRuleOptions([], defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should return default value when first element is not an object', () => {
    const result = extractRuleOptions(['string'], defaultOptions)
    expect(result).toEqual(defaultOptions)
  })

  test('should merge provided options with defaults', () => {
    const result = extractRuleOptions([{ threshold: 20 }], defaultOptions)
    expect(result).toEqual({
      enabled: true,
      threshold: 20,
      message: 'default message',
    })
  })

  test('should override all default options', () => {
    const customOptions = {
      enabled: false,
      threshold: 5,
      message: 'custom message',
    }
    const result = extractRuleOptions([customOptions], defaultOptions)
    expect(result).toEqual(customOptions)
  })

  test('should handle partial options', () => {
    const result = extractRuleOptions([{ enabled: false }], defaultOptions)
    expect(result).toEqual({
      enabled: false,
      threshold: 10,
      message: 'default message',
    })
  })

  test('should add new properties not in defaults', () => {
    const result = extractRuleOptions([{ extraProp: 'value' }], defaultOptions)
    expect(result).toEqual({
      enabled: true,
      threshold: 10,
      message: 'default message',
      extraProp: 'value',
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Exhaustive coverage: non-array primitive inputs
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: non-array primitive inputs return default', () => {
  const defaults = { a: 1 }

  test('returns default for undefined', () => {
    expect(extractRuleOptions(undefined, defaults)).toEqual(defaults)
  })

  test('returns default for null', () => {
    expect(extractRuleOptions(null, defaults)).toEqual(defaults)
  })

  test('returns default for boolean true', () => {
    expect(extractRuleOptions(true, defaults)).toEqual(defaults)
  })

  test('returns default for boolean false', () => {
    expect(extractRuleOptions(false, defaults)).toEqual(defaults)
  })

  test('returns default for number 0', () => {
    expect(extractRuleOptions(0, defaults)).toEqual(defaults)
  })

  test('returns default for positive number', () => {
    expect(extractRuleOptions(42, defaults)).toEqual(defaults)
  })

  test('returns default for negative number', () => {
    expect(extractRuleOptions(-1, defaults)).toEqual(defaults)
  })

  test('returns default for NaN', () => {
    expect(extractRuleOptions(Number.NaN, defaults)).toEqual(defaults)
  })

  test('returns default for Infinity', () => {
    expect(extractRuleOptions(Number.POSITIVE_INFINITY, defaults)).toEqual(defaults)
  })

  test('returns default for -Infinity', () => {
    expect(extractRuleOptions(Number.NEGATIVE_INFINITY, defaults)).toEqual(defaults)
  })

  test('returns default for empty string', () => {
    expect(extractRuleOptions('', defaults)).toEqual(defaults)
  })

  test('returns default for non-empty string', () => {
    expect(extractRuleOptions('hello', defaults)).toEqual(defaults)
  })

  test('returns default for BigInt', () => {
    expect(extractRuleOptions(BigInt(9007199254740991n), defaults)).toEqual(defaults)
  })

  test('returns default for Symbol', () => {
    expect(extractRuleOptions(Symbol('sym'), defaults)).toEqual(defaults)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Exhaustive coverage: non-array object inputs return default
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: non-array object inputs return default', () => {
  const defaults = { x: 'default' }

  test('returns default for plain object', () => {
    expect(extractRuleOptions({ x: 'overridden' }, defaults)).toEqual(defaults)
  })

  test('returns default for Date instance', () => {
    expect(extractRuleOptions(new Date(), defaults)).toEqual(defaults)
  })

  test('returns default for RegExp instance', () => {
    expect(extractRuleOptions(/test/gi, defaults)).toEqual(defaults)
  })

  test('returns default for Error instance', () => {
    expect(extractRuleOptions(new Error('fail'), defaults)).toEqual(defaults)
  })

  test('returns default for Map instance', () => {
    expect(extractRuleOptions(new Map([['a', 1]]), defaults)).toEqual(defaults)
  })

  test('returns default for Set instance', () => {
    expect(extractRuleOptions(new Set([1, 2, 3]), defaults)).toEqual(defaults)
  })

  test('returns default for function', () => {
    expect(extractRuleOptions(() => ({ x: 'fn' }), defaults)).toEqual(defaults)
  })

  test('returns default for class instance', () => {
    class Foo {
      bar = 'baz'
    }
    expect(extractRuleOptions(new Foo(), defaults)).toEqual(defaults)
  })

  test('returns default for plain empty object', () => {
    expect(extractRuleOptions({}, defaults)).toEqual(defaults)
  })

  test('returns default for object with many keys', () => {
    expect(extractRuleOptions({ a: 1, b: 2, c: 3 }, defaults)).toEqual(defaults)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Exhaustive coverage: arrays with non-object first elements return default
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: array with non-object first element returns default', () => {
  const defaults = { val: 0 }

  test('returns default for [undefined]', () => {
    expect(extractRuleOptions([undefined], defaults)).toEqual(defaults)
  })

  test('returns default for [null] — typeof null is "object" but spread of null yields no extra keys', () => {
    const result = extractRuleOptions([null], defaults)
    expect(result).toEqual({ val: 0 })
  })

  test('returns default for [true]', () => {
    expect(extractRuleOptions([true], defaults)).toEqual(defaults)
  })

  test('returns default for [false]', () => {
    expect(extractRuleOptions([false], defaults)).toEqual(defaults)
  })

  test('returns default for [0]', () => {
    expect(extractRuleOptions([0], defaults)).toEqual(defaults)
  })

  test('returns default for [42]', () => {
    expect(extractRuleOptions([42], defaults)).toEqual(defaults)
  })

  test('returns default for [-1]', () => {
    expect(extractRuleOptions([-1], defaults)).toEqual(defaults)
  })

  test('returns default for [NaN]', () => {
    expect(extractRuleOptions([Number.NaN], defaults)).toEqual(defaults)
  })

  test('returns default for [Infinity]', () => {
    expect(extractRuleOptions([Number.POSITIVE_INFINITY], defaults)).toEqual(defaults)
  })

  test('returns default for [""]', () => {
    expect(extractRuleOptions([''], defaults)).toEqual(defaults)
  })

  test('returns default for ["string"]', () => {
    expect(extractRuleOptions(['hello'], defaults)).toEqual(defaults)
  })

  test('returns default for [BigInt]', () => {
    expect(extractRuleOptions([BigInt(100)], defaults)).toEqual(defaults)
  })

  test('returns default for [Symbol]', () => {
    expect(extractRuleOptions([Symbol('s')], defaults)).toEqual(defaults)
  })

  test('returns default for [function]', () => {
    expect(
      extractRuleOptions(
        [
          function namedFn() {
            return 1
          },
        ],
        defaults,
      ),
    ).toEqual(defaults)
  })

  test('returns default for [arrow function]', () => {
    expect(extractRuleOptions([() => 1], defaults)).toEqual(defaults)
  })

  test('[array] as first element enters merge path since typeof [] is "object"', () => {
    const result = extractRuleOptions([[1, 2, 3]], defaults)
    expect(result).toEqual({ ...defaults, 0: 1, 1: 2, 2: 3 })
  })

  test('[empty array] as first element enters merge path, spread adds nothing', () => {
    const result = extractRuleOptions([[]], defaults)
    expect(result).toEqual({ ...defaults })
    expect(result).not.toBe(defaults)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Arrays with object first element — basic merge behavior
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: array with object first element merges', () => {
  const defaults = { a: 1, b: 2, c: 3 }

  test('merges single property override', () => {
    expect(extractRuleOptions([{ a: 99 }], defaults)).toEqual({ a: 99, b: 2, c: 3 })
  })

  test('merges multiple property overrides', () => {
    expect(extractRuleOptions([{ a: 10, b: 20 }], defaults)).toEqual({ a: 10, b: 20, c: 3 })
  })

  test('merges all properties overridden', () => {
    expect(extractRuleOptions([{ a: 10, b: 20, c: 30 }], defaults)).toEqual({ a: 10, b: 20, c: 30 })
  })

  test('empty object in array returns defaults unchanged', () => {
    expect(extractRuleOptions([{}], defaults)).toEqual(defaults)
  })

  test('adds new property not in defaults', () => {
    expect(extractRuleOptions([{ extra: true }], defaults)).toEqual({
      a: 1,
      b: 2,
      c: 3,
      extra: true,
    })
  })

  test('override takes precedence over default for same key', () => {
    const result = extractRuleOptions([{ a: 'overridden' }], { a: 'original' })
    expect(result.a).toBe('overridden')
  })

  test('preserves properties not overridden', () => {
    const result = extractRuleOptions([{ c: 30 }], defaults)
    expect(result.a).toBe(1)
    expect(result.b).toBe(2)
    expect(result.c).toBe(30)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Multi-element arrays — only the first element matters
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: multi-element arrays use only first element', () => {
  const defaults = { x: 1 }

  test('uses first object element, ignores second object', () => {
    expect(extractRuleOptions([{ x: 10 }, { x: 20 }], defaults)).toEqual({ x: 10 })
  })

  test('uses first object element, ignores second non-object', () => {
    expect(extractRuleOptions([{ x: 10 }, 'ignore'], defaults)).toEqual({ x: 10 })
  })

  test('uses first object element with three elements', () => {
    expect(extractRuleOptions([{ x: 10 }, { x: 20 }, { x: 30 }], defaults)).toEqual({ x: 10 })
  })

  test('returns default when first is non-object even though second is object', () => {
    expect(extractRuleOptions(['not-object', { x: 10 }], defaults)).toEqual(defaults)
  })

  test('uses first element when it is null (typeof null is object)', () => {
    const result = extractRuleOptions([null, { x: 10 }], defaults)
    expect(result).toEqual({ x: 1 })
  })

  test('uses first element when it is a Date', () => {
    const d = new Date('2024-01-01')
    const result = extractRuleOptions([d, { x: 10 }], defaults)
    expect(result.x).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Various value types in option overrides
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: value types in overrides', () => {
  const defaults = { val: 'default' }

  test('string override', () => {
    expect(extractRuleOptions([{ val: 'hello' }], defaults).val).toBe('hello')
  })

  test('empty string override', () => {
    expect(extractRuleOptions([{ val: '' }], defaults).val).toBe('')
  })

  test('number override', () => {
    expect(extractRuleOptions([{ val: 42 }], defaults).val).toBe(42)
  })

  test('zero override', () => {
    expect(extractRuleOptions([{ val: 0 }], defaults).val).toBe(0)
  })

  test('negative number override', () => {
    expect(extractRuleOptions([{ val: -5 }], defaults).val).toBe(-5)
  })

  test('NaN override', () => {
    expect(extractRuleOptions([{ val: Number.NaN }], defaults).val).toBeNaN()
  })

  test('Infinity override', () => {
    expect(extractRuleOptions([{ val: Number.POSITIVE_INFINITY }], defaults).val).toBe(
      Number.POSITIVE_INFINITY,
    )
  })

  test('boolean true override', () => {
    expect(extractRuleOptions([{ val: true }], defaults).val).toBe(true)
  })

  test('boolean false override', () => {
    expect(extractRuleOptions([{ val: false }], defaults).val).toBe(false)
  })

  test('null override', () => {
    expect(extractRuleOptions([{ val: null }], defaults).val).toBeNull()
  })

  test('undefined override', () => {
    const result = extractRuleOptions([{ val: undefined }], defaults)
    expect(result.val).toBeUndefined()
    expect('val' in result).toBe(true)
  })

  test('array override', () => {
    const arr = [1, 2, 3]
    expect(extractRuleOptions([{ val: arr }], defaults).val).toBe(arr)
  })

  test('nested object override', () => {
    const obj = { nested: { deep: true } }
    expect(extractRuleOptions([{ val: obj }], defaults).val).toBe(obj)
  })

  test('function override', () => {
    const fn = () => 'called'
    expect(extractRuleOptions([{ val: fn }], defaults).val).toBe(fn)
  })

  test('Date override', () => {
    const d = new Date()
    expect(extractRuleOptions([{ val: d }], defaults).val).toBe(d)
  })

  test('RegExp override', () => {
    const re = /pattern/g
    expect(extractRuleOptions([{ val: re }], defaults).val).toBe(re)
  })

  test('Symbol override', () => {
    const sym = Symbol('test')
    expect(extractRuleOptions([{ val: sym }], defaults).val).toBe(sym)
  })

  test('BigInt override', () => {
    const big = BigInt(123)
    expect(extractRuleOptions([{ val: big }], defaults).val).toBe(big)
  })

  test('Map override', () => {
    const map = new Map([['key', 'value']])
    expect(extractRuleOptions([{ val: map }], defaults).val).toBe(map)
  })

  test('Set override', () => {
    const set = new Set([1, 2])
    expect(extractRuleOptions([{ val: set }], defaults).val).toBe(set)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Different default value shapes
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: different default value shapes', () => {
  test('single string property', () => {
    const def = { name: 'default' }
    expect(extractRuleOptions([{ name: 'custom' }], def)).toEqual({ name: 'custom' })
  })

  test('single number property', () => {
    const def = { count: 0 }
    expect(extractRuleOptions([{ count: 5 }], def)).toEqual({ count: 5 })
  })

  test('single boolean property', () => {
    const def = { active: false }
    expect(extractRuleOptions([{ active: true }], def)).toEqual({ active: true })
  })

  test('empty default object with override', () => {
    const def = {}
    expect(extractRuleOptions([{ added: 'yes' }], def)).toEqual({ added: 'yes' })
  })

  test('empty default object with empty override', () => {
    const def = {}
    expect(extractRuleOptions([{}], def)).toEqual({})
  })

  test('nested object property in defaults', () => {
    const def = { config: { level: 1 } }
    const override = { config: { level: 2 } }
    expect(extractRuleOptions([override], def)).toEqual({ config: { level: 2 } })
  })

  test('array property in defaults', () => {
    const def = { items: [1, 2] }
    const override = { items: [3, 4] }
    const result = extractRuleOptions([override], def)
    expect(result.items).toEqual([3, 4])
  })

  test('many properties in defaults', () => {
    const def = { a: 1, b: 2, c: 3, d: 4, e: 5 }
    expect(extractRuleOptions([{ c: 33 }], def)).toEqual({ a: 1, b: 2, c: 33, d: 4, e: 5 })
  })

  test('defaults with mixed types', () => {
    const def = { str: 'hello', num: 42, bool: true, arr: [1], obj: { key: 'val' } }
    expect(extractRuleOptions([{ num: 99 }], def)).toEqual({
      str: 'hello',
      num: 99,
      bool: true,
      arr: [1],
      obj: { key: 'val' },
    })
  })

  test('defaults with null values', () => {
    const def = { x: null, y: 'hello' }
    expect(extractRuleOptions([{ x: 'not null' }], def)).toEqual({ x: 'not null', y: 'hello' })
  })

  test('defaults with undefined values', () => {
    const def = { x: undefined, y: 'hello' }
    expect(extractRuleOptions([{ x: 'defined' }], def)).toEqual({ x: 'defined', y: 'hello' })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Immutability / reference safety
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: immutability and reference safety', () => {
  test('does not mutate the default value', () => {
    const def = { a: 1, b: 2 }
    const originalRef = { ...def }
    extractRuleOptions([{ a: 99 }], def)
    expect(def).toEqual(originalRef)
  })

  test('returns a new object, not the default reference', () => {
    const def = { a: 1 }
    const result = extractRuleOptions([{ a: 1 }], def)
    expect(result).not.toBe(def)
  })

  test('returns default reference when rawOptions is not an array', () => {
    const def = { a: 1 }
    const result = extractRuleOptions(undefined, def)
    expect(result).toBe(def)
  })

  test('returns default reference for empty array input', () => {
    const def = { a: 1 }
    const result = extractRuleOptions([], def)
    expect(result).toBe(def)
  })

  test('returns default reference for non-object first element', () => {
    const def = { a: 1 }
    const result = extractRuleOptions([42], def)
    expect(result).toBe(def)
  })

  test('returns default reference for non-array object input', () => {
    const def = { a: 1 }
    const result = extractRuleOptions({ a: 2 }, def)
    expect(result).toBe(def)
  })

  test('returns default reference for string input', () => {
    const def = { a: 1 }
    const result = extractRuleOptions('not-array', def)
    expect(result).toBe(def)
  })

  test('returns default reference for number input', () => {
    const def = { a: 1 }
    const result = extractRuleOptions(123, def)
    expect(result).toBe(def)
  })

  test('returns default reference for boolean input', () => {
    const def = { a: 1 }
    const result = extractRuleOptions(true, def)
    expect(result).toBe(def)
  })

  test('override object property is the same reference', () => {
    const nested = { deep: true }
    const def = { val: 'original' }
    const result = extractRuleOptions([{ nested }], def)
    expect(result.nested).toBe(nested)
  })

  test('merged result has all keys from both sources', () => {
    const def = { a: 1 }
    const result = extractRuleOptions([{ b: 2 }], def)
    expect(Object.keys(result).sort()).toEqual(['a', 'b'])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases: special JS objects as first array element
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: special objects as first array element', () => {
  const defaults = { key: 'default' }

  test('Date object as first element enters merge path (typeof is object)', () => {
    const result = extractRuleOptions([new Date('2024-06-15')], defaults)
    expect(result.key).toBe('default')
  })

  test('RegExp as first element enters merge path', () => {
    const result = extractRuleOptions([/pattern/i], defaults)
    expect(result.key).toBe('default')
  })

  test('Error as first element enters merge path', () => {
    const result = extractRuleOptions([new Error('test')], defaults)
    expect(result.key).toBe('default')
  })

  test('Map as first element enters merge path', () => {
    const result = extractRuleOptions([new Map()], defaults)
    expect(result.key).toBe('default')
  })

  test('Set as first element enters merge path', () => {
    const result = extractRuleOptions([new Set()], defaults)
    expect(result.key).toBe('default')
  })

  test('WeakMap as first element enters merge path', () => {
    const result = extractRuleOptions([new WeakMap()], defaults)
    expect(result.key).toBe('default')
  })

  test('WeakSet as first element enters merge path', () => {
    const result = extractRuleOptions([new WeakSet()], defaults)
    expect(result.key).toBe('default')
  })

  test('Int8Array as first element enters merge path', () => {
    const result = extractRuleOptions([new Int8Array(4)], defaults)
    expect(result.key).toBe('default')
  })

  test('Float64Array as first element enters merge path', () => {
    const result = extractRuleOptions([new Float64Array(2)], defaults)
    expect(result.key).toBe('default')
  })

  test('ArrayBuffer as first element enters merge path', () => {
    const result = extractRuleOptions([new ArrayBuffer(8)], defaults)
    expect(result.key).toBe('default')
  })

  test('DataView as first element enters merge path', () => {
    const buf = new ArrayBuffer(8)
    const result = extractRuleOptions([new DataView(buf)], defaults)
    expect(result.key).toBe('default')
  })

  test('class instance as first element enters merge path', () => {
    class Config {
      option = 'from-class'
    }
    const result = extractRuleOptions([new Config()], defaults)
    expect(result.key).toBe('default')
    expect(result.option).toBe('from-class')
  })

  test('null as first element (typeof null is object)', () => {
    const result = extractRuleOptions([null], defaults)
    expect(result).toEqual({ key: 'default' })
  })

  test('object with numeric string keys', () => {
    const result = extractRuleOptions([{ '0': 'zero', '1': 'one' }], defaults)
    expect(result).toEqual({ key: 'default', '0': 'zero', '1': 'one' })
  })

  test('object with Symbol keys — Symbols are not spread', () => {
    const sym = Symbol('hidden')
    const obj: Record<string, number> = {}
    obj[sym as unknown as string] = 42
    obj.visible = 99
    const result = extractRuleOptions([obj], defaults)
    expect(result.visible).toBe(99)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Spread semantics: property override order
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: spread and property ordering', () => {
  test('override values take precedence over defaults', () => {
    const def = { a: 'def', b: 'def', c: 'def' }
    const result = extractRuleOptions([{ a: 'ovr', b: 'ovr' }], def)
    expect(result.a).toBe('ovr')
    expect(result.b).toBe('ovr')
    expect(result.c).toBe('def')
  })

  test('last spread wins when both have same key', () => {
    const def = { x: 1 }
    const result = extractRuleOptions([{ x: 2 }], def)
    expect(result.x).toBe(2)
  })

  test('override with falsy value replaces truthy default', () => {
    const def = { enabled: true }
    const result = extractRuleOptions([{ enabled: false }], def)
    expect(result.enabled).toBe(false)
  })

  test('override with 0 replaces positive default', () => {
    const def = { count: 10 }
    const result = extractRuleOptions([{ count: 0 }], def)
    expect(result.count).toBe(0)
  })

  test('override with empty string replaces non-empty default', () => {
    const def = { name: 'default' }
    const result = extractRuleOptions([{ name: '' }], def)
    expect(result.name).toBe('')
  })

  test('override with null replaces defined default', () => {
    const def = { value: 'exists' }
    const result = extractRuleOptions([{ value: null }], def)
    expect(result.value).toBeNull()
  })

  test('override with undefined replaces defined default', () => {
    const def = { value: 'exists' }
    const result = extractRuleOptions([{ value: undefined }], def)
    expect(result.value).toBeUndefined()
  })

  test('override with NaN replaces number default', () => {
    const def = { score: 100 }
    const result = extractRuleOptions([{ score: Number.NaN }], def)
    expect(result.score).toBeNaN()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Many properties — stress tests
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: many properties and stress', () => {
  test('handles 20 property defaults with 10 overrides', () => {
    const def: Record<string, number> = {}
    for (let i = 0; i < 20; i++) def[`prop${i}`] = i
    const ovr: Record<string, number> = {}
    for (let i = 0; i < 10; i++) ovr[`prop${i}`] = i * 10
    const result = extractRuleOptions([ovr], def)
    expect(result.prop0).toBe(0)
    expect(result.prop9).toBe(90)
    expect(result.prop10).toBe(10)
    expect(result.prop19).toBe(19)
  })

  test('handles 100 property defaults with no override', () => {
    const def: Record<string, number> = {}
    for (let i = 0; i < 100; i++) def[`p${i}`] = i
    const result = extractRuleOptions([{}], def)
    expect(result).toEqual(def)
  })

  test('handles single property with many override attempts (only first element)', () => {
    const def = { x: 1 }
    const result = extractRuleOptions([{ x: 2 }, { x: 3 }, { x: 4 }], def)
    expect(result.x).toBe(2)
  })

  test('override adds many new properties', () => {
    const def = { a: 1 }
    const ovr: Record<string, number> = {}
    for (let i = 0; i < 50; i++) ovr[`new${i}`] = i
    const result = extractRuleOptions([ovr], def)
    expect(result.a).toBe(1)
    expect(result.new0).toBe(0)
    expect(result.new49).toBe(49)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Empty arrays and edge array shapes
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: empty and edge array shapes', () => {
  const defaults = { v: 1 }

  test('returns default for empty array', () => {
    expect(extractRuleOptions([], defaults)).toBe(defaults)
  })

  test('returns default for [undefined]', () => {
    expect(extractRuleOptions([undefined], defaults)).toBe(defaults)
  })

  test('returns new object for [{}]', () => {
    const result = extractRuleOptions([{}], defaults)
    expect(result).toEqual(defaults)
    expect(result).not.toBe(defaults)
  })

  test('returns new object for [{ same values as default }]', () => {
    const result = extractRuleOptions([{ v: 1 }], defaults)
    expect(result).toEqual(defaults)
    expect(result).not.toBe(defaults)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Spread of first element with null/undefined values in properties
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: null and undefined properties in overrides', () => {
  test('override with all null properties', () => {
    const def = { a: 1, b: 2, c: 3 }
    const result = extractRuleOptions([{ a: null, b: null }], def)
    expect(result.a).toBeNull()
    expect(result.b).toBeNull()
    expect(result.c).toBe(3)
  })

  test('override with all undefined properties', () => {
    const def = { a: 1, b: 2, c: 3 }
    const result = extractRuleOptions([{ a: undefined, b: undefined }], def)
    expect(result.a).toBeUndefined()
    expect(result.b).toBeUndefined()
    expect(result.c).toBe(3)
  })

  test('mix of null and undefined overrides', () => {
    const def = { x: 'val', y: 'val', z: 'val' }
    const result = extractRuleOptions([{ x: null, y: undefined }], def)
    expect(result.x).toBeNull()
    expect(result.y).toBeUndefined()
    expect(result.z).toBe('val')
  })

  test('override property to null then check key exists', () => {
    const def = { key: 'value' }
    const result = extractRuleOptions([{ key: null }], def)
    expect('key' in result).toBe(true)
  })

  test('override property to undefined then check key exists', () => {
    const def = { key: 'value' }
    const result = extractRuleOptions([{ key: undefined }], def)
    expect('key' in result).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Nested structures
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: nested structures', () => {
  test('nested object is replaced entirely, not deep-merged', () => {
    const def = { config: { a: 1, b: 2 } }
    const result = extractRuleOptions([{ config: { a: 99 } }], def)
    expect(result.config).toEqual({ a: 99 })
    expect((result.config as Record<string, number>).b).toBeUndefined()
  })

  test('array property is replaced entirely', () => {
    const def = { list: [1, 2, 3] }
    const result = extractRuleOptions([{ list: [4, 5] }], def)
    expect(result.list).toEqual([4, 5])
  })

  test('deeply nested object replaced entirely', () => {
    const def = { level1: { level2: { level3: 'deep' } } }
    const result = extractRuleOptions([{ level1: { different: true } }], def)
    expect(result.level1).toEqual({ different: true })
  })

  test('nested array with objects replaced entirely', () => {
    const def = { items: [{ id: 1 }, { id: 2 }] }
    const result = extractRuleOptions([{ items: [{ id: 99 }] }], def)
    expect(result.items).toEqual([{ id: 99 }])
  })

  test('partial override at top level keeps nested default intact', () => {
    const def = { top: 'level', nested: { val: 'deep' } }
    const result = extractRuleOptions([{ top: 'changed' }], def)
    expect(result.top).toBe('changed')
    expect(result.nested).toEqual({ val: 'deep' })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Strict equality checks for return paths
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: return value identity', () => {
  const defaults = { id: 1 }

  test('non-array input returns exact default reference', () => {
    expect(extractRuleOptions(undefined, defaults)).toBe(defaults)
    expect(extractRuleOptions(null, defaults)).toBe(defaults)
    expect(extractRuleOptions(42, defaults)).toBe(defaults)
    expect(extractRuleOptions('str', defaults)).toBe(defaults)
    expect(extractRuleOptions(true, defaults)).toBe(defaults)
    expect(extractRuleOptions({ id: 2 }, defaults)).toBe(defaults)
  })

  test('empty array returns exact default reference', () => {
    expect(extractRuleOptions([], defaults)).toBe(defaults)
  })

  test('array with non-object first element returns exact default reference', () => {
    expect(extractRuleOptions(['str'], defaults)).toBe(defaults)
    expect(extractRuleOptions([42], defaults)).toBe(defaults)
    expect(extractRuleOptions([true], defaults)).toBe(defaults)
    expect(extractRuleOptions([undefined], defaults)).toBe(defaults)
    expect(extractRuleOptions([() => {}], defaults)).toBe(defaults)
  })

  test('array with object first element returns new object', () => {
    const result = extractRuleOptions([{}], defaults)
    expect(result).not.toBe(defaults)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Realistic CLI option patterns
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: realistic CLI rule option patterns', () => {
  test('max-params rule with threshold', () => {
    const defaults = { enabled: true, max: 4, severity: 'warn' }
    const result = extractRuleOptions([{ max: 3 }], defaults)
    expect(result).toEqual({ enabled: true, max: 3, severity: 'warn' })
  })

  test('no-console rule disabled', () => {
    const defaults = { enabled: true, allow: ['warn', 'error'] }
    const result = extractRuleOptions([{ enabled: false }], defaults)
    expect(result).toEqual({ enabled: false, allow: ['warn', 'error'] })
  })

  test('complexity rule with custom message', () => {
    const defaults = { enabled: true, threshold: 10, message: 'Too complex' }
    const result = extractRuleOptions([{ threshold: 20, message: 'Reduce complexity' }], defaults)
    expect(result).toEqual({ enabled: true, threshold: 20, message: 'Reduce complexity' })
  })

  test('rule with glob exclude patterns', () => {
    const defaults = { enabled: true, exclude: ['**/test/**'] }
    const result = extractRuleOptions([{ exclude: ['**/vendor/**', '**/test/**'] }], defaults)
    expect(result.exclude).toEqual(['**/vendor/**', '**/test/**'])
  })

  test('rule with all defaults overridden', () => {
    const defaults = { enabled: true, level: 'error', fix: false, strict: false }
    const result = extractRuleOptions(
      [{ enabled: false, level: 'warn', fix: true, strict: true }],
      defaults,
    )
    expect(result).toEqual({ enabled: false, level: 'warn', fix: true, strict: true })
  })

  test('rule with extra configuration added', () => {
    const defaults = { enabled: true }
    const result = extractRuleOptions(
      [{ enabled: true, customOption: 42, anotherOption: 'yes' }],
      defaults,
    )
    expect(result).toEqual({ enabled: true, customOption: 42, anotherOption: 'yes' })
  })

  test('rule with numeric severity levels', () => {
    const defaults = { min: 0, max: 100 }
    const result = extractRuleOptions([{ min: 10 }], defaults)
    expect(result).toEqual({ min: 10, max: 100 })
  })

  test('rule with path configurations', () => {
    const defaults = { include: ['./src'], ignore: ['./dist'] }
    const result = extractRuleOptions([{ ignore: ['./dist', './build'] }], defaults)
    expect(result).toEqual({ include: ['./src'], ignore: ['./dist', './build'] })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Boundary conditions for the length check
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: array length boundary', () => {
  const defaults = { val: 1 }

  test('empty array (length 0) returns default', () => {
    expect(extractRuleOptions([], defaults)).toBe(defaults)
  })

  test('single-element array with object merges', () => {
    expect(extractRuleOptions([{ val: 2 }], defaults)).toEqual({ val: 2 })
  })

  test('single-element array with non-object returns default', () => {
    expect(extractRuleOptions(['x'], defaults)).toBe(defaults)
  })

  test('array length > 1 with object first element merges', () => {
    expect(extractRuleOptions([{ val: 2 }, { val: 3 }], defaults)).toEqual({ val: 2 })
  })

  test('sparse array with object at first index', () => {
    const arr: [object] = [{ val: 2 }]
    arr[5] = { val: 99 }
    expect(extractRuleOptions(arr, defaults)).toEqual({ val: 2 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Objects with prototype chains
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: objects with prototypes', () => {
  const defaults = { base: true }

  test('plain object spread only gets own properties', () => {
    const parent = { inherited: true }
    const child = Object.create(parent)
    child.own = true
    const result = extractRuleOptions([child], defaults)
    expect(result.own).toBe(true)
    expect('inherited' in result).toBe(false)
  })

  test('object with Object.create(null) has no prototype', () => {
    const noProto = Object.create(null)
    noProto.key = 'value'
    const result = extractRuleOptions([noProto], defaults)
    expect(result.key).toBe('value')
    expect(result.base).toBe(true)
  })

  test('class with getter — getter is not own enumerable by default', () => {
    class WithGetter {
      get computed() {
        return 'computed'
      }
      normal = 'normal'
    }
    const result = extractRuleOptions([new WithGetter()], defaults)
    expect(result.normal).toBe('normal')
  })

  test('object with defined getter via defineProperty (enumerable)', () => {
    const obj: Record<string, string> = {}
    Object.defineProperty(obj, 'getter', { value: 'got', enumerable: true, writable: false })
    const result = extractRuleOptions([obj], defaults)
    expect(result.getter).toBe('got')
  })

  test('object with non-enumerable property is not spread', () => {
    const obj: Record<string, string> = { visible: 'yes' }
    Object.defineProperty(obj, 'hidden', { value: 'no', enumerable: false })
    const result = extractRuleOptions([obj], defaults)
    expect(result.visible).toBe('yes')
    expect(result.hidden).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Type parameter inference with various object shapes
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: type parameter inference', () => {
  test('infers type from simple string default', () => {
    const def = { name: 'test' }
    const result = extractRuleOptions([{ name: 'override' }], def)
    expect(typeof result.name).toBe('string')
  })

  test('infers type from number default', () => {
    const def = { count: 0 }
    const result = extractRuleOptions([{ count: 5 }], def)
    expect(typeof result.count).toBe('number')
  })

  test('infers type from boolean default', () => {
    const def = { active: false }
    const result = extractRuleOptions([{ active: true }], def)
    expect(typeof result.active).toBe('boolean')
  })

  test('handles complex union type properties', () => {
    const def = { value: 'string' as string | number | null }
    const result = extractRuleOptions([{ value: 42 }], def)
    expect(result.value).toBe(42)
  })

  test('handles optional properties in defaults', () => {
    const def = { required: true, optional: undefined as string | undefined }
    const result = extractRuleOptions([{ optional: 'provided' }], def)
    expect(result.required).toBe(true)
    expect(result.optional).toBe('provided')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Specific oclif-style raw options patterns
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: oclif-style flag patterns', () => {
  test('flag as --rule=[JSON] parsed as array with one object', () => {
    const def = { severity: 'error', fix: false }
    const result = extractRuleOptions([{ severity: 'warn' }], def)
    expect(result).toEqual({ severity: 'warn', fix: false })
  })

  test('rule without explicit options returns defaults', () => {
    const def = { enabled: true, max: 10 }
    expect(extractRuleOptions(undefined, def)).toEqual(def)
  })

  test('rule flag with empty value parsed as empty array', () => {
    const def = { enabled: true }
    expect(extractRuleOptions([], def)).toEqual(def)
  })

  test('rule flag parsed as non-array string', () => {
    const def = { enabled: true }
    expect(extractRuleOptions('enabled', def)).toEqual(def)
  })

  test('multiple rule flags where only first is used', () => {
    const def = { level: 'info' }
    const result = extractRuleOptions([{ level: 'debug' }, { level: 'error' }], def)
    expect(result.level).toBe('debug')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Combinations: default value shapes x input types
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: default shapes with various inputs', () => {
  test('complex default with undefined input', () => {
    const def = { a: 1, b: 'two', c: true, d: [1, 2], e: { f: 3 } }
    expect(extractRuleOptions(undefined, def)).toEqual(def)
  })

  test('complex default with null input', () => {
    const def = { a: 1, b: 'two', c: true, d: [1, 2], e: { f: 3 } }
    expect(extractRuleOptions(null, def)).toEqual(def)
  })

  test('complex default with string input', () => {
    const def = { a: 1, b: 'two', c: true, d: [1, 2], e: { f: 3 } }
    expect(extractRuleOptions('complex', def)).toEqual(def)
  })

  test('complex default with empty object array', () => {
    const def = { a: 1, b: 'two', c: true, d: [1, 2], e: { f: 3 } }
    const result = extractRuleOptions([{}], def)
    expect(result).toEqual(def)
    expect(result).not.toBe(def)
  })

  test('complex default with partial override', () => {
    const def = { a: 1, b: 'two', c: true, d: [1, 2], e: { f: 3 } }
    const result = extractRuleOptions([{ b: 'three' }], def)
    expect(result).toEqual({ a: 1, b: 'three', c: true, d: [1, 2], e: { f: 3 } })
  })

  test('complex default with new property added', () => {
    const def = { a: 1 }
    const result = extractRuleOptions([{ extra: { deep: true } }], def)
    expect(result).toEqual({ a: 1, extra: { deep: true } })
  })

  test('simple default with array-of-arrays input — nested array is typeof object', () => {
    const def = { x: 1 }
    const result = extractRuleOptions([[{ x: 2 }]], def)
    expect(result).toEqual({ 0: { x: 2 }, x: 1 })
  })

  test('simple default with function input', () => {
    const def = { x: 1 }
    expect(extractRuleOptions(() => 1, def)).toEqual(def)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Numeric edge cases in overrides
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: numeric edge cases', () => {
  const defaults = { num: 0 }

  test('override with Number.MAX_SAFE_INTEGER', () => {
    const result = extractRuleOptions([{ num: Number.MAX_SAFE_INTEGER }], defaults)
    expect(result.num).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('override with Number.MIN_SAFE_INTEGER', () => {
    const result = extractRuleOptions([{ num: Number.MIN_SAFE_INTEGER }], defaults)
    expect(result.num).toBe(Number.MIN_SAFE_INTEGER)
  })

  test('override with Number.MAX_VALUE', () => {
    const result = extractRuleOptions([{ num: Number.MAX_VALUE }], defaults)
    expect(result.num).toBe(Number.MAX_VALUE)
  })

  test('override with Number.MIN_VALUE', () => {
    const result = extractRuleOptions([{ num: Number.MIN_VALUE }], defaults)
    expect(result.num).toBe(Number.MIN_VALUE)
  })

  test('override with Number.EPSILON', () => {
    const result = extractRuleOptions([{ num: Number.EPSILON }], defaults)
    expect(result.num).toBe(Number.EPSILON)
  })

  test('override with -0', () => {
    const result = extractRuleOptions([{ num: -0 }], defaults)
    expect(Object.is(result.num, -0)).toBe(true)
  })

  test('override with 0.1 + 0.2 (floating point)', () => {
    const result = extractRuleOptions([{ num: 0.1 + 0.2 }], defaults)
    expect(result.num).toBeCloseTo(0.3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// String edge cases in overrides
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: string edge cases', () => {
  const defaults = { str: 'default' }

  test('override with whitespace string', () => {
    expect(extractRuleOptions([{ str: '   ' }], defaults).str).toBe('   ')
  })

  test('override with newline string', () => {
    expect(extractRuleOptions([{ str: '\n\t' }], defaults).str).toBe('\n\t')
  })

  test('override with unicode string', () => {
    expect(extractRuleOptions([{ str: '日本語テスト 🚀' }], defaults).str).toBe('日本語テスト 🚀')
  })

  test('override with very long string', () => {
    const longStr = 'a'.repeat(10000)
    expect(extractRuleOptions([{ str: longStr }], defaults).str).toBe(longStr)
  })

  test('override with emoji string', () => {
    expect(extractRuleOptions([{ str: '🎉🎊🎈' }], defaults).str).toBe('🎉🎊🎈')
  })

  test('override with string containing special regex characters', () => {
    const special = '.*+?^${}()|[]\\'
    expect(extractRuleOptions([{ str: special }], defaults).str).toBe(special)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Boolean edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: boolean properties', () => {
  const defaults = { flag: false }

  test('override false to true', () => {
    expect(extractRuleOptions([{ flag: true }], defaults).flag).toBe(true)
  })

  test('override true to false', () => {
    const d = { flag: true }
    expect(extractRuleOptions([{ flag: false }], d).flag).toBe(false)
  })

  test('keep false unchanged', () => {
    expect(extractRuleOptions([{}], defaults).flag).toBe(false)
  })

  test('Boolean() coercion not applied — must be literal boolean', () => {
    const result = extractRuleOptions([{ flag: true }], defaults)
    expect(result.flag).toBe(true)
    expect(typeof result.flag).toBe('boolean')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Array property edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: array properties', () => {
  const defaults = { items: [1, 2, 3] }

  test('empty array replaces non-empty default', () => {
    expect(extractRuleOptions([{ items: [] }], defaults).items).toEqual([])
  })

  test('longer array replaces shorter default', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    expect(extractRuleOptions([{ items: arr }], defaults).items).toEqual(arr)
  })

  test('nested arrays are preserved', () => {
    const nested = [
      [1, 2],
      [3, 4],
    ]
    expect(extractRuleOptions([{ items: nested }], defaults).items).toEqual(nested)
  })

  test('array with mixed types', () => {
    const mixed = [1, 'two', true, null, { key: 'val' }]
    expect(extractRuleOptions([{ items: mixed }], defaults).items).toEqual(mixed)
  })

  test('array reference is preserved', () => {
    const arr = ['a', 'b']
    expect(extractRuleOptions([{ items: arr }], defaults).items).toBe(arr)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Property existence and Object.keys behavior
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: property enumeration', () => {
  test('result has correct number of keys after partial override', () => {
    const def = { a: 1, b: 2, c: 3 }
    const result = extractRuleOptions([{ b: 20 }], def)
    expect(Object.keys(result)).toHaveLength(3)
  })

  test('result has more keys after adding new property', () => {
    const def = { a: 1 }
    const result = extractRuleOptions([{ b: 2 }], def)
    expect(Object.keys(result)).toHaveLength(2)
  })

  test('result has same keys when all overridden', () => {
    const def = { a: 1, b: 2 }
    const result = extractRuleOptions([{ a: 10, b: 20 }], def)
    expect(Object.keys(result)).toHaveLength(2)
  })

  test('override with empty object yields same keys as default', () => {
    const def = { a: 1, b: 2, c: 3 }
    const result = extractRuleOptions([{}], def)
    expect(Object.keys(result).sort()).toEqual(['a', 'b', 'c'])
  })

  test('hasOwnProperty works on result', () => {
    const def = { a: 1 }
    const result = extractRuleOptions([{ b: 2 }], def)
    expect(Object.prototype.hasOwnProperty.call(result, 'a')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(result, 'b')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(result, 'c')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Spread of various JS built-in objects
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: spreading various JS objects', () => {
  test('spreading Error does not override defaults', () => {
    const defaults = { x: 1 }
    const err = new Error('test-message')
    const result = extractRuleOptions([err], defaults)
    expect(result.x).toBe(1)
  })

  test('spreading a class instance with public fields', () => {
    const defaults = { x: 1 }
    class Config {
      public setting = 'value'
    }
    const result = extractRuleOptions([new Config()], defaults)
    expect(result.setting).toBe('value')
    expect(result.x).toBe(1)
  })

  test('spreading object created with Object.assign', () => {
    const defaults = { x: 1 }
    const merged = Object.assign({}, { a: 1 }, { b: 2 })
    const result = extractRuleOptions([merged], defaults)
    expect(result.a).toBe(1)
    expect(result.b).toBe(2)
    expect(result.x).toBe(1)
  })

  test('spreading frozen object still works', () => {
    const defaults = { x: 1 }
    const frozen = Object.freeze({ y: 2 })
    const result = extractRuleOptions([frozen], defaults)
    expect(result.x).toBe(1)
    expect(result.y).toBe(2)
  })

  test('spreading sealed object still works', () => {
    const defaults = { x: 1 }
    const sealed = Object.seal({ y: 2 })
    const result = extractRuleOptions([sealed], defaults)
    expect(result.x).toBe(1)
    expect(result.y).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Consistency: same inputs always produce same outputs
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: determinism', () => {
  test('same inputs produce same results (merge path)', () => {
    const def = { a: 1 }
    const r1 = extractRuleOptions([{ a: 2 }], def)
    const r2 = extractRuleOptions([{ a: 2 }], def)
    expect(r1).toEqual(r2)
  })

  test('same inputs produce same results (default path)', () => {
    const def = { a: 1 }
    const r1 = extractRuleOptions(undefined, def)
    const r2 = extractRuleOptions(undefined, def)
    expect(r1).toBe(r2)
  })

  test('repeated calls are idempotent', () => {
    const def = { a: 1, b: 2 }
    for (let i = 0; i < 10; i++) {
      const result = extractRuleOptions([{ a: 99 }], def)
      expect(result).toEqual({ a: 99, b: 2 })
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Consecutive property overrides
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: multiple property scenarios', () => {
  test('override first of many properties', () => {
    const def = { a: 1, b: 2, c: 3, d: 4 }
    expect(extractRuleOptions([{ a: 11 }], def)).toEqual({ a: 11, b: 2, c: 3, d: 4 })
  })

  test('override last of many properties', () => {
    const def = { a: 1, b: 2, c: 3, d: 4 }
    expect(extractRuleOptions([{ d: 44 }], def)).toEqual({ a: 1, b: 2, c: 3, d: 44 })
  })

  test('override middle properties', () => {
    const def = { a: 1, b: 2, c: 3, d: 4 }
    expect(extractRuleOptions([{ b: 22, c: 33 }], def)).toEqual({ a: 1, b: 22, c: 33, d: 4 })
  })

  test('override alternating properties', () => {
    const def = { a: 1, b: 2, c: 3, d: 4, e: 5 }
    expect(extractRuleOptions([{ a: 11, c: 33, e: 55 }], def)).toEqual({
      a: 11,
      b: 2,
      c: 33,
      d: 4,
      e: 55,
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Integration-style: using with realistic rule configurations
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRuleOptions: realistic rule configurations', () => {
  test('no-circular-deps rule', () => {
    const defaults = { enabled: true, severity: 'error', maxDepth: 5 }
    const result = extractRuleOptions([{ maxDepth: 10 }], defaults)
    expect(result).toEqual({ enabled: true, severity: 'error', maxDepth: 10 })
  })

  test('max-file-size rule with bytes', () => {
    const defaults = { enabled: true, maxSize: 1000, unit: 'bytes' }
    const result = extractRuleOptions([{ maxSize: 5000 }], defaults)
    expect(result).toEqual({ enabled: true, maxSize: 5000, unit: 'bytes' })
  })

  test('no-unused-vars rule with patterns', () => {
    const defaults = { enabled: true, ignorePatterns: ['^_'] }
    const result = extractRuleOptions([{ ignorePatterns: ['^_', '^unused'] }], defaults)
    expect(result.ignorePatterns).toEqual(['^_', '^unused'])
  })

  test('prefer-const rule destructuring option', () => {
    const defaults = { enabled: true, destructuring: 'all' }
    const result = extractRuleOptions([{ destructuring: 'any' }], defaults)
    expect(result).toEqual({ enabled: true, destructuring: 'any' })
  })

  test('security rule with allowlist', () => {
    const defaults = { enabled: true, allowlist: [] }
    const result = extractRuleOptions([{ allowlist: ['eval', 'Function'] }], defaults)
    expect(result.allowlist).toEqual(['eval', 'Function'])
  })

  test('performance rule with thresholds', () => {
    const defaults = { enabled: true, warningMs: 100, errorMs: 500 }
    const result = extractRuleOptions([{ warningMs: 50, errorMs: 200 }], defaults)
    expect(result).toEqual({ enabled: true, warningMs: 50, errorMs: 200 })
  })

  test('pattern rule disabled with message', () => {
    const defaults = { enabled: true, pattern: '.*', message: 'Match found' }
    const result = extractRuleOptions(
      [{ enabled: false, message: 'Disabled for this project' }],
      defaults,
    )
    expect(result).toEqual({ enabled: false, pattern: '.*', message: 'Disabled for this project' })
  })

  test('dependency rule with depth and exclusions', () => {
    const defaults = { enabled: true, maxDepth: 3, excludeExternal: false }
    const result = extractRuleOptions([{ maxDepth: 5, excludeExternal: true }], defaults)
    expect(result).toEqual({ enabled: true, maxDepth: 5, excludeExternal: true })
  })
})
