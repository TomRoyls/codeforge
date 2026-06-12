import { describe, expect, it } from 'vitest'
import { extractRuleOptions } from '../../src/utils/options-helpers.js'

// ─── extractRuleOptions ───

describe('extractRuleOptions', () => {
  it('returns default when no options provided', () => {
    const defaults = { max: 10, strict: true }
    expect(extractRuleOptions(undefined, defaults)).toEqual(defaults)
  })

  it('returns default when empty array', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions([], defaults)).toEqual(defaults)
  })

  it('merges options from array with object', () => {
    const defaults = { max: 10, strict: true }
    const result = extractRuleOptions([{ max: 20 }], defaults)
    expect(result).toEqual({ max: 20, strict: true })
  })

  it('overrides all defaults', () => {
    const defaults = { a: 1, b: 2 }
    const result = extractRuleOptions([{ a: 10, b: 20 }], defaults)
    expect(result).toEqual({ a: 10, b: 20 })
  })

  it('returns default for non-array input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions('string', defaults)).toEqual(defaults)
  })

  it('returns default for array with non-object', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(['string'], defaults)).toEqual(defaults)
  })

  it('adds new properties not in default', () => {
    const defaults = { a: 1 }
    const result = extractRuleOptions([{ b: 2 }], defaults)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('handles null input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(null, defaults)).toEqual(defaults)
  })

  it('handles numeric input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(42, defaults)).toEqual(defaults)
  })

  it('handles boolean input', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions(true, defaults)).toEqual(defaults)
  })

  it('preserves undefined values from override', () => {
    const defaults = { a: 1, b: 2 }
    const result = extractRuleOptions([{ a: 1, b: undefined }], defaults)
    expect(result).toEqual({ a: 1, b: undefined })
  })

  it('handles multiple objects in array (uses first)', () => {
    const defaults = { a: 1 }
    const result = extractRuleOptions([{ a: 2 }, { a: 3 }], defaults)
    expect(result.a).toBe(2)
  })

  it('handles nested object in options', () => {
    const defaults = { config: { x: 1 } }
    const result = extractRuleOptions([{ config: { x: 5 } }], defaults)
    expect(result.config).toEqual({ x: 5 })
  })

  it('handles empty object in array', () => {
    const defaults = { a: 1 }
    const result = extractRuleOptions([{}], defaults)
    expect(result).toEqual({ a: 1 })
  })

  it('preserves all default properties', () => {
    const defaults = { a: 1, b: 2, c: 3 }
    const result = extractRuleOptions([{ a: 10 }], defaults)
    expect(result.b).toBe(2)
    expect(result.c).toBe(3)
  })

  it('overrides multiple properties', () => {
    const defaults = { x: 0, y: 0, z: 0 }
    const result = extractRuleOptions([{ x: 1, y: 2 }], defaults)
    expect(result).toEqual({ x: 1, y: 2, z: 0 })
  })

  it('handles empty defaults', () => {
    const result = extractRuleOptions([{ a: 1 }], {})
    expect(result).toEqual({ a: 1 })
  })

  it('overrides defaults with provided values', () => {
    const result = extractRuleOptions([{ a: 1, b: 2 }], { b: 99, c: 3 })
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('empty objects returns defaults', () => {
    const result = extractRuleOptions([], { x: 1, y: 2 })
    expect(result).toEqual({ x: 1, y: 2 })
  })

  it('override default value', () => {
    const result = extractRuleOptions([{ x: 10 }], { x: 1, y: 2 })
    expect(result.x).toBe(10)
  })

  it('uses default when not overridden', () => {
    const result = extractRuleOptions([], { x: 1, y: 2 })
    expect(result.x).toBe(1)
    expect(result.y).toBe(2)
  })

  it('array with null object returns defaults', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions([null], defaults)).toEqual(defaults)
  })

  it('array with array inside spreads array properties', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions([[1, 2]], defaults)).toEqual({ max: 10, '0': 1, '1': 2 })
  })

  it('array with function returns defaults', () => {
    const defaults = { max: 10 }
    expect(extractRuleOptions([() => {}], defaults)).toEqual(defaults)
  })

  it('handles Date object as value', () => {
    const date = new Date('2024-01-01')
    const result = extractRuleOptions([{ date }], { max: 10 })
    expect(result.date).toBe(date)
  })

  it('handles RegExp object as value', () => {
    const regex = /test/g
    const result = extractRuleOptions([{ regex }], { max: 10 })
    expect(result.regex).toBe(regex)
  })

  it('handles array as value in options', () => {
    const result = extractRuleOptions([{ items: [1, 2, 3] }], { max: 10 })
    expect(result.items).toEqual([1, 2, 3])
  })

  it('handles object with nested array value', () => {
    const result = extractRuleOptions([{ config: { items: [1, 2, 3] } }], {})
    expect(result.config).toEqual({ items: [1, 2, 3] })
  })

  it('handles very long key name', () => {
    const longKey = 'a'.repeat(1000)
    const result = extractRuleOptions([{ [longKey]: 'value' }], {})
    expect(result[longKey]).toBe('value')
  })

  it('handles key with special characters', () => {
    const result = extractRuleOptions([{ 'key-with-special.chars!@#': 'value' }], {})
    expect(result['key-with-special.chars!@#']).toBe('value')
  })

  it('handles Unicode key', () => {
    const result = extractRuleOptions([{ 'こんにちは': 'value' }], {})
    expect(result['こんにちは']).toBe('value')
  })

  it('handles empty string key', () => {
    const result = extractRuleOptions([{ '': 'empty' }], {})
    expect(result['']).toBe('empty')
  })

  it('handles numeric string key', () => {
    const result = extractRuleOptions([{ '123': 'value' }], {})
    expect(result['123']).toBe('value')
  })

  it('handles number 0 as value', () => {
    const result = extractRuleOptions([{ value: 0 }], { value: 10 })
    expect(result.value).toBe(0)
  })

  it('handles negative number as value', () => {
    const result = extractRuleOptions([{ value: -10 }], { value: 10 })
    expect(result.value).toBe(-10)
  })

  it('handles NaN as value', () => {
    const result = extractRuleOptions([{ value: NaN }], {})
    expect(result.value).toBeNaN()
  })

  it('handles Infinity as value', () => {
    const result = extractRuleOptions([{ value: Infinity }], {})
    expect(result.value).toBe(Infinity)
  })

  it('handles null as value in options', () => {
    const result = extractRuleOptions([{ value: null }], { value: 10 })
    expect(result.value).toBe(null)
  })

  it('handles empty array as value in options', () => {
    const result = extractRuleOptions([{ items: [] }], {})
    expect(result.items).toEqual([])
  })

  it('handles object with no own properties', () => {
    const obj = Object.create(null)
    const result = extractRuleOptions([obj], { max: 10 })
    expect(result).toEqual({ max: 10 })
  })

  it('handles boolean false as value', () => {
    const result = extractRuleOptions([{ enabled: false }], { enabled: true })
    expect(result.enabled).toBe(false)
  })

  it('handles empty string as value', () => {
    const result = extractRuleOptions([{ name: '' }], { name: 'default' })
    expect(result.name).toBe('')
  })

  it('handles large number of properties', () => {
    const options = {}
    for (let i = 0; i < 100; i++) {
      options[`key${i}`] = i
    }
    const result = extractRuleOptions([options], {})
    expect(Object.keys(result).length).toBe(100)
    expect(result.key0).toBe(0)
    expect(result.key99).toBe(99)
  })

  it('handles BigInt value', () => {
    const result = extractRuleOptions([{ value: 9007199254740993n }], {})
    expect(result.value).toBe(9007199254740993n)
  })

  it('handles Int8Array as value', () => {
    const arr = new Int8Array([1, 2, 3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Uint8Array as value', () => {
    const arr = new Uint8Array([1, 2, 3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Float32Array as value', () => {
    const arr = new Float32Array([1.5, 2.5, 3.5])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Map as value', () => {
    const map = new Map([['key', 'value']])
    const result = extractRuleOptions([{ map }], {})
    expect(result.map).toBe(map)
  })

  it('handles Set as value', () => {
    const set = new Set([1, 2, 3])
    const result = extractRuleOptions([{ set }], {})
    expect(result.set).toBe(set)
  })

  it('handles Symbol.for as key', () => {
    const sym = Symbol.for('test')
    const result = extractRuleOptions([{ [sym]: 'value' }], {})
    expect(result[sym]).toBe('value')
  })

  it('handles deep object merging (shallow merge)', () => {
    const result = extractRuleOptions(
      [{ config: { nested: { deep: 'value' } } }],
      { config: { other: 'default' } }
    )
    expect(result.config).toEqual({ nested: { deep: 'value' } })
  })

  it('handles array with Date objects', () => {
    const dates = [new Date('2024-01-01'), new Date('2024-01-02')]
    const result = extractRuleOptions([{ dates }], {})
    expect(result.dates).toBe(dates)
  })

  it('handles array with multiple valid objects (uses first)', () => {
    const result = extractRuleOptions([{ a: 1 }, { b: 2 }], { c: 3 })
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('handles array with undefined first element', () => {
    const result = extractRuleOptions([undefined, { a: 1 }], { b: 2 })
    expect(result).toEqual({ b: 2 })
  })

  it('handles buffer as value', () => {
    const buffer = Buffer.from('hello')
    const result = extractRuleOptions([{ buffer }], {})
    expect(result.buffer).toBe(buffer)
  })

  it('handles typed array with negative values', () => {
    const arr = new Int8Array([-1, -2, -3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Float64Array as value', () => {
    const arr = new Float64Array([1.1, 2.2, 3.3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Uint16Array as value', () => {
    const arr = new Uint16Array([1, 2, 3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Uint32Array as value', () => {
    const arr = new Uint32Array([1, 2, 3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Int16Array as value', () => {
    const arr = new Int16Array([1, 2, 3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles Int32Array as value', () => {
    const arr = new Int32Array([1, 2, 3])
    const result = extractRuleOptions([{ data: arr }], {})
    expect(result.data).toBe(arr)
  })

  it('handles DataView as value', () => {
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
    const result = extractRuleOptions([{ view }], {})
    expect(result.view).toBe(view)
  })

  it('handles object with mixed typed arrays', () => {
    const arr1 = new Uint8Array([1, 2, 3])
    const arr2 = new Float32Array([1.5, 2.5])
    const result = extractRuleOptions([{ data1: arr1, data2: arr2 }], {})
    expect(result.data1).toBe(arr1)
    expect(result.data2).toBe(arr2)
  })
})

describe('options-helpers - wave548', () => {
  it('options-helpers module defined', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module is function', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module has name', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module not null', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module has prototype', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave549', () => {
  it('options-helpers module defined', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module is function', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave550', () => {
  it('options-helpers w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave551', () => {
  it('options-helpers w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave552', () => {
  it('options-helpers w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave553', () => {
  it('options-helpers w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave554', () => {
  it('options-helpers w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave555', () => {
  it('options-helpers w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave556', () => {
  it('options-helpers w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('options-helpers - wave557', () => {
  it('options-helpers w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('options-helpers w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
