import { describe, test, expect } from 'vitest'
import {
  ok,
  err,
  fromThrowable,
  type Result,
} from '../../../src/utils/result.js'

describe('ok', () => {
  test('creates a successful result', () => {
    const result = ok(42)
    expect(result.isOk()).toBe(true)
    expect(result.isErr()).toBe(false)
  })

  test('holds the correct value', () => {
    const result = ok('hello')
    expect(result.unwrap()).toBe('hello')
  })

  test('works with complex types', () => {
    const result = ok({ name: 'test', count: 5 })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toEqual({ name: 'test', count: 5 })
  })

  test('works with null and undefined values', () => {
    expect(ok(null).unwrap()).toBeNull()
    expect(ok(undefined).unwrap()).toBeUndefined()
  })
})

describe('err', () => {
  test('creates a failed result', () => {
    const result = err('something went wrong')
    expect(result.isErr()).toBe(true)
    expect(result.isOk()).toBe(false)
  })

  test('holds the correct error', () => {
    const result = err(new Error('test error'))
    expect(result.isErr()).toBe(true)
  })

  test('works with string errors', () => {
    const result = err('not found')
    expect(result.isErr()).toBe(true)
  })

  test('works with complex error types', () => {
    const result = err({ code: 404, message: 'Not Found' })
    expect(result.isErr()).toBe(true)
  })
})

describe('isOk / isErr', () => {
  test('isOk narrows type for ok results', () => {
    const result: Result<number, string> = ok(42)
    if (result.isOk()) {
      expect(result.unwrap()).toBe(42)
    }
  })

  test('isErr narrows type for err results', () => {
    const result: Result<number, string> = err('failed')
    if (result.isErr()) {
      expect(() => result.unwrap()).toThrow()
    }
  })
})

describe('unwrap', () => {
  test('returns value for ok', () => {
    expect(ok(42).unwrap()).toBe(42)
    expect(ok('hello').unwrap()).toBe('hello')
  })

  test('throws for err with Error instance', () => {
    const error = new Error('test')
    expect(() => err(error).unwrap()).toThrow(error)
  })

  test('throws wrapped error for non-Error err', () => {
    expect(() => err('string error').unwrap()).toThrow('string error')
  })

  test('throws wrapped error for number err', () => {
    expect(() => err(404).unwrap()).toThrow('404')
  })
})

describe('unwrapOr', () => {
  test('returns value for ok', () => {
    expect(ok(42).unwrapOr(0)).toBe(42)
    expect(ok('hello').unwrapOr('default')).toBe('hello')
  })

  test('returns default for err', () => {
    expect(err('failed').unwrapOr(0)).toBe(0)
    expect(err('failed').unwrapOr('default')).toBe('default')
  })

  test('does not evaluate default for ok', () => {
    let called = false
    const result = ok(42).unwrapOr((called = true, 0))
    expect(result).toBe(42)
    expect(called).toBe(true)
  })
})

describe('unwrapOrElse', () => {
  test('returns value for ok', () => {
    expect(ok(42).unwrapOrElse(() => 0)).toBe(42)
  })

  test('calls function for err', () => {
    expect(err('error').unwrapOrElse((e) => `recovered from ${e}`)).toBe('recovered from error')
  })
})

describe('map', () => {
  test('transforms ok value', () => {
    const result = ok(5).map((n) => n * 2)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(10)
  })

  test('leaves err unchanged', () => {
    const result = err<string, string>('error').map((s) => s.toUpperCase())
    expect(result.isErr()).toBe(true)
  })

  test('chains transformations', () => {
    const result = ok('hello').map((s) => s.length).map((n) => n * 2)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(10)
  })
})

describe('mapErr', () => {
  test('transforms err value', () => {
    const result = err(404).mapErr((code) => `Error: ${code}`)
    expect(result.isErr()).toBe(true)
  })

  test('leaves ok unchanged', () => {
    const result = ok(42).mapErr((e) => String(e))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })
})

describe('andThen', () => {
  test('chains ok to ok', () => {
    const result = ok(5).andThen((n) => ok(n * 2))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(10)
  })

  test('chains ok to err', () => {
    const result = ok(5).andThen((n) =>
      n > 10 ? ok(n) : err('too small'),
    )
    expect(result.isErr()).toBe(true)
  })

  test('short-circuits on err', () => {
    const result = err<number, string>('error').andThen((n) => ok(n * 2))
    expect(result.isErr()).toBe(true)
  })
})

describe('orElse', () => {
  test('recovers from err', () => {
    const result = err<string, string>('error').orElse(() => ok('recovered'))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('recovered')
  })

  test('leaves ok unchanged', () => {
    const result = ok(42).orElse(() => ok(0))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  test('can chain to another err', () => {
    const result = err('first').orElse(() => err('second'))
    expect(result.isErr()).toBe(true)
  })
})

describe('match', () => {
  test('calls onOk for ok result', () => {
    const result = ok(42).match(
      (v) => `value: ${v}`,
      (e) => `error: ${e}`,
    )
    expect(result).toBe('value: 42')
  })

  test('calls onErr for err result', () => {
    const result = err('failed').match(
      (v) => `value: ${v}`,
      (e) => `error: ${e}`,
    )
    expect(result).toBe('error: failed')
  })
})

describe('toJSON', () => {
  test('serializes ok result', () => {
    const json = ok(42).toJSON()
    expect(json).toEqual({ ok: true, value: 42 })
  })

  test('serializes err result', () => {
    const json = err('failed').toJSON()
    expect(json).toEqual({ ok: false, error: 'failed' })
  })

  test('serializes with JSON.stringify', () => {
    expect(JSON.stringify(ok(42))).toBe('{"ok":true,"value":42}')
    expect(JSON.stringify(err('failed'))).toBe('{"ok":false,"error":"failed"}')
  })
})

describe('fromThrowable', () => {
  test('wraps successful call in ok', () => {
    const result = fromThrowable(() => JSON.parse('{"a":1}'))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toEqual({ a: 1 })
  })

  test('wraps thrown error in err', () => {
    const result = fromThrowable(() => {
      throw new Error('kaboom')
    })
    expect(result.isErr()).toBe(true)
  })

  test('wraps non-Error throws', () => {
    const result = fromThrowable(() => {
      throw 'string error'
    })
    expect(result.isErr()).toBe(true)
  })

  test('preserves thrown value', () => {
    const result = fromThrowable(() => JSON.parse('invalid'))
    expect(result.isErr()).toBe(true)
  })
})
