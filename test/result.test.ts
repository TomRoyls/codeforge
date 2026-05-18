import { describe, it, expect } from 'vitest'
import { ok, err, fromThrowable, ResultClass } from '../src/utils/result.js'
import type { Result, Ok, Err } from '../src/utils/result.js'

// ─── ok() factory ─────────────────────────────────────
describe('ok() factory', () => {
  it('creates an Ok result with a number', () => {
    const r = ok(42)
    expect(r.isOk()).toBe(true)
    expect(r.isErr()).toBe(false)
  })

  it('creates an Ok result with a string', () => {
    const r = ok('hello')
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with null', () => {
    const r = ok(null)
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with undefined', () => {
    const r = ok(undefined)
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with an object', () => {
    const r = ok({ name: 'test', count: 5 })
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with an array', () => {
    const r = ok([1, 2, 3])
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with boolean true', () => {
    const r = ok(true)
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with boolean false', () => {
    const r = ok(false)
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with 0 (falsy value)', () => {
    const r = ok(0)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(0)
  })

  it('creates an Ok result with empty string', () => {
    const r = ok('')
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe('')
  })

  it('creates an Ok result with a Symbol', () => {
    const sym = Symbol('test')
    const r = ok(sym)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(sym)
  })

  it('creates an Ok result with a BigInt', () => {
    const r = ok(BigInt(9007199254740991))
    expect(r.isOk()).toBe(true)
  })

  it('creates an Ok result with a function', () => {
    const fn = () => 42
    const r = ok(fn)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(fn)
  })
})

// ─── err() factory ─────────────────────────────────────
describe('err() factory', () => {
  it('creates an Err result with a string', () => {
    const r = err('something went wrong')
    expect(r.isErr()).toBe(true)
    expect(r.isOk()).toBe(false)
  })

  it('creates an Err result with an Error instance', () => {
    const r = err(new Error('boom'))
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with a number', () => {
    const r = err(404)
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with an object', () => {
    const r = err({ code: 'ENOTFOUND', message: 'dns failure' })
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with null', () => {
    const r = err(null)
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with undefined', () => {
    const r = err(undefined)
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with an array', () => {
    const r = err(['error1', 'error2'])
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with 0 (falsy value)', () => {
    const r = err(0)
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with empty string', () => {
    const r = err('')
    expect(r.isErr()).toBe(true)
  })

  it('creates an Err result with a Symbol', () => {
    const r = err(Symbol('error'))
    expect(r.isErr()).toBe(true)
  })
})

// ─── ResultClass.ok() static factory ──────────────────
describe('ResultClass.ok() static factory', () => {
  it('creates an Ok result', () => {
    const r = ResultClass.ok(10)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(10)
  })

  it('is equivalent to the ok() function', () => {
    const r1 = ok(42)
    const r2 = ResultClass.ok(42)
    expect(r1.isOk()).toBe(r2.isOk())
    expect(r1.unwrap()).toBe(r2.unwrap())
  })
})

// ─── ResultClass.err() static factory ─────────────────
describe('ResultClass.err() static factory', () => {
  it('creates an Err result', () => {
    const r = ResultClass.err('fail')
    expect(r.isErr()).toBe(true)
  })

  it('is equivalent to the err() function', () => {
    const r1 = err('fail')
    const r2 = ResultClass.err('fail')
    expect(r1.isErr()).toBe(r2.isErr())
  })
})

// ─── isOk() predicate ─────────────────────────────────
describe('isOk()', () => {
  it('returns true for Ok results', () => {
    expect(ok(1).isOk()).toBe(true)
    expect(ok('a').isOk()).toBe(true)
    expect(ok(null).isOk()).toBe(true)
    expect(ok(undefined).isOk()).toBe(true)
  })

  it('returns false for Err results', () => {
    expect(err('x').isOk()).toBe(false)
    expect(err(new Error()).isOk()).toBe(false)
    expect(err(0).isOk()).toBe(false)
  })

  it('narrows type for Ok results', () => {
    const r: Result<number, string> = ok(5)
    if (r.isOk()) {
      expect(r.unwrap()).toBe(5)
    }
  })
})

// ─── isErr() predicate ────────────────────────────────
describe('isErr()', () => {
  it('returns true for Err results', () => {
    expect(err('x').isErr()).toBe(true)
    expect(err(new Error()).isErr()).toBe(true)
    expect(err(null).isErr()).toBe(true)
  })

  it('returns false for Ok results', () => {
    expect(ok(1).isErr()).toBe(false)
    expect(ok(null).isErr()).toBe(false)
  })

  it('narrow type for Err results', () => {
    const r: Result<number, string> = err('fail')
    if (r.isErr()) {
      expect(r.unwrapOrElse(() => 0)).toBe(0)
    }
  })
})

// ─── isOk() and isErr() are always opposite ───────────
describe('isOk() / isErr() consistency', () => {
  it('isOk and isErr are never both true', () => {
    const o = ok(1)
    expect(o.isOk()).toBe(true)
    expect(o.isErr()).toBe(false)

    const e = err('x')
    expect(e.isOk()).toBe(false)
    expect(e.isErr()).toBe(true)
  })

  it('isOk and isErr are never both false', () => {
    const o = ok(1)
    expect(o.isOk() || o.isErr()).toBe(true)

    const e = err('x')
    expect(e.isOk() || e.isErr()).toBe(true)
  })
})

// ─── unwrap() ──────────────────────────────────────────
describe('unwrap()', () => {
  it('returns the value for Ok', () => {
    expect(ok(42).unwrap()).toBe(42)
  })

  it('returns string value for Ok', () => {
    expect(ok('hello').unwrap()).toBe('hello')
  })

  it('returns object value for Ok', () => {
    const obj = { a: 1 }
    expect(ok(obj).unwrap()).toBe(obj)
  })

  it('returns null for Ok(null)', () => {
    expect(ok(null).unwrap()).toBeNull()
  })

  it('returns undefined for Ok(undefined)', () => {
    expect(ok(undefined).unwrap()).toBeUndefined()
  })

  it('throws Error instance as-is from Err', () => {
    const error = new Error('boom')
    expect(() => err(error).unwrap()).toThrow(error)
  })

  it('throws wrapped Error for string error', () => {
    expect(() => err('fail').unwrap()).toThrow('fail')
  })

  it('throws wrapped Error for number error', () => {
    expect(() => err(404).unwrap()).toThrow('404')
  })

  it('throws wrapped Error for object error', () => {
    expect(() => err({ code: 1 }).unwrap()).toThrow('[object Object]')
  })

  it('throws wrapped Error for null error', () => {
    expect(() => err(null).unwrap()).toThrow('null')
  })

  it('throws wrapped Error for undefined error', () => {
    expect(() => err(undefined).unwrap()).toThrow('undefined')
  })

  it('thrown error is an Error instance for non-Error errors', () => {
    try {
      err('string error').unwrap()
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect((e as Error).message).toBe('string error')
    }
  })

  it('thrown Error instance is not double-wrapped', () => {
    const original = new Error('original')
    try {
      err(original).unwrap()
    } catch (e) {
      expect(e).toBe(original)
    }
  })
})

// ─── unwrapOr() ───────────────────────────────────────
describe('unwrapOr()', () => {
  it('returns the value for Ok', () => {
    expect(ok(42).unwrapOr(0)).toBe(42)
  })

  it('returns default for Err', () => {
    expect(err('fail').unwrapOr(0)).toBe(0)
  })

  it('returns the value for Ok with same-type default', () => {
    expect(ok('success').unwrapOr('default')).toBe('success')
  })

  it('returns default for Err with same type', () => {
    expect(err('fail').unwrapOr('default')).toBe('default')
  })

  it('returns value for Ok with object default', () => {
    const val = { x: 1 }
    const def = { x: 0 }
    expect(ok(val).unwrapOr(def)).toBe(val)
  })

  it('returns default object for Err', () => {
    const def = { x: 0 }
    expect(err('fail').unwrapOr(def)).toBe(def)
  })

  it('returns value for Ok(null)', () => {
    expect(ok<null>(null).unwrapOr(null)).toBeNull()
  })

  it('returns default for Err with null default', () => {
    expect(err<number>('fail').unwrapOr(null as unknown as number)).toBeNull()
  })

  it('does not evaluate default eagerly for Ok — default is just a value', () => {
    // default value is always passed, but only used for Err
    let sideEffect = false
    const getDefault = (): number => {
      sideEffect = true
      return 99
    }
    // For Ok, default is computed but not returned
    const result = ok(42).unwrapOr(getDefault())
    expect(result).toBe(42)
    expect(sideEffect).toBe(true) // JS eager evaluation
  })
})

// ─── unwrapOrElse() ───────────────────────────────────
describe('unwrapOrElse()', () => {
  it('returns the value for Ok without calling fn', () => {
    const r = ok(42).unwrapOrElse(() => {
      throw new Error('should not be called')
    })
    expect(r).toBe(42)
  })

  it('calls fn with error for Err and returns its result', () => {
    const result = err('fail').unwrapOrElse((e) => `recovered from: ${e}`)
    expect(result).toBe('recovered from: fail')
  })

  it('passes the error value to fn', () => {
    const result = err(404).unwrapOrElse((e) => e + 100)
    expect(result).toBe(504)
  })

  it('passes Error instance to fn', () => {
    const error = new Error('boom')
    const result = err(error).unwrapOrElse((e) => e.message)
    expect(result).toBe('boom')
  })

  it('passes object error to fn', () => {
    const result = err({ code: 'ENOTFOUND' }).unwrapOrElse((e) => e.code)
    expect(result).toBe('ENOTFOUND')
  })

  it('returns complex type from fn', () => {
    const result = err('fail').unwrapOrElse(() => [1, 2, 3])
    expect(result).toEqual([1, 2, 3])
  })

  it('returns null from fn', () => {
    const result = err('fail').unwrapOrElse(() => null)
    expect(result).toBeNull()
  })
})

// ─── map() ─────────────────────────────────────────────
describe('map()', () => {
  it('transforms Ok value', () => {
    const result = ok(5).map((n) => n * 2)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(10)
  })

  it('transforms Ok string to number', () => {
    const result = ok('hello').map((s) => s.length)
    expect(result.unwrap()).toBe(5)
  })

  it('transforms Ok to different type', () => {
    const result = ok(42).map((n) => String(n))
    expect(result.unwrap()).toBe('42')
  })

  it('skips transformation on Err and preserves error', () => {
    const result = err<number, string>('fail').map((n) => n * 2)
    expect(result.isErr()).toBe(true)
  })

  it('returns Err with same error after map on Err', () => {
    const r = err<number, string>('fail').map((n) => n * 2)
    const output = r.match(
      () => 'ok',
      (e) => e,
    )
    expect(output).toBe('fail')
  })

  it('can chain multiple map calls', () => {
    const result = ok(2)
      .map((n) => n + 3)
      .map((n) => n * 4)
      .map((n) => `${n}!`)
    expect(result.unwrap()).toBe('20!')
  })

  it('map chain stops on Err', () => {
    let called = false
    const result = err<number, string>('fail')
      .map((n) => n + 1)
      .map(() => {
        called = true
        return 0
      })
    expect(called).toBe(false)
    expect(result.isErr()).toBe(true)
  })

  it('map on Ok with null value transforms to new value', () => {
    const result = ok<null>(null).map(() => 99)
    expect(result.unwrap()).toBe(99)
  })

  it('map can return undefined', () => {
    const result = ok(42).map(() => undefined)
    expect(result.unwrap()).toBeUndefined()
  })
})

// ─── mapErr() ──────────────────────────────────────────
describe('mapErr()', () => {
  it('transforms Err value', () => {
    const result = err('fail').mapErr((s) => new Error(s))
    expect(result.isErr()).toBe(true)
  })

  it('preserves Ok value unchanged', () => {
    const result = ok(42).mapErr((e) => `error: ${e}`)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  it('passes error to transformation fn', () => {
    const result = err(404).mapErr((code) => `HTTP ${code}`)
    const output = result.match(
      () => 'ok',
      (e) => e,
    )
    expect(output).toBe('HTTP 404')
  })

  it('can transform error type', () => {
    const result = err('fail').mapErr((s) => ({ message: s, code: 500 }))
    const output = result.match(
      () => null,
      (e) => e,
    )
    expect(output).toEqual({ message: 'fail', code: 500 })
  })

  it('can chain mapErr calls', () => {
    const result = err('fail')
      .mapErr((s) => `Error: ${s}`)
      .mapErr((s) => new Error(s))
    expect(result.isErr()).toBe(true)
  })

  it('mapErr on Ok does not call fn', () => {
    const result = ok(42).mapErr(() => {
      throw new Error('should not be called')
    })
    expect(result.unwrap()).toBe(42)
  })
})

// ─── andThen() (flatMap) ──────────────────────────────
describe('andThen()', () => {
  it('chains Ok into new Ok', () => {
    const result = ok(5).andThen((n) => ok(n * 2))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(10)
  })

  it('chains Ok into Err', () => {
    const result = ok(5).andThen(() => err('chained error'))
    expect(result.isErr()).toBe(true)
  })

  it('skips fn on Err and returns same Err', () => {
    const result = err<number, string>('fail').andThen((n) => ok(n * 2))
    expect(result.isErr()).toBe(true)
  })

  it('preserves error from initial Err through andThen', () => {
    const result = err<number, string>('original').andThen(() => ok(99))
    const output = result.match(
      () => 'ok',
      (e) => e,
    )
    expect(output).toBe('original')
  })

  it('supports multi-step chaining', () => {
    const parseNumber = (s: string): Result<number, string> => {
      const n = Number(s)
      return Number.isNaN(n) ? err('NaN') : ok(n)
    }
    const double = (n: number): Result<number, string> => ok(n * 2)
    const positiveOnly = (n: number): Result<number, string> =>
      n > 0 ? ok(n) : err('negative')

    const result = ok('21').andThen(parseNumber).andThen(double).andThen(positiveOnly)
    expect(result.unwrap()).toBe(42)
  })

  it('short-circuits on first Err in chain', () => {
    const result = ok('abc')
      .andThen(() => err<string, string>('stop'))
      .andThen(() => ok('never'))

    expect(result.isErr()).toBe(true)
    const output = result.match(
      () => '',
      (e) => e,
    )
    expect(output).toBe('stop')
  })

  it('changes value type through chain', () => {
    const result = ok(42).andThen((n) => ok(`value: ${n}`))
    expect(result.unwrap()).toBe('value: 42')
  })

  it('does not call fn on Err', () => {
    let called = false
    err<number, string>('fail').andThen(() => {
      called = true
      return ok(1)
    })
    expect(called).toBe(false)
  })
})

// ─── orElse() ─────────────────────────────────────────
describe('orElse()', () => {
  it('recovery: Err to Ok', () => {
    const result = err<string, string>('fail').orElse(() => ok('recovered'))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('recovered')
  })

  it('recovery: Err to different Err', () => {
    const result = err<string, number>(404).orElse((e) => err(`HTTP ${e}`))
    expect(result.isErr()).toBe(true)
  })

  it('passes error to recovery fn', () => {
    const result = err<string, string>('timeout').orElse((e) => ok(`fallback for ${e}`))
    expect(result.unwrap()).toBe('fallback for timeout')
  })

  it('skips fn on Ok and returns same Ok', () => {
    const result = ok(42).orElse(() => ok(0))
    expect(result.unwrap()).toBe(42)
  })

  it('does not call fn on Ok', () => {
    let called = false
    ok(42).orElse(() => {
      called = true
      return ok(0)
    })
    expect(called).toBe(false)
  })

  it('can chain orElse for fallback cascade', () => {
    const result = err<string, string>('fail1')
      .orElse(() => err('fail2'))
      .orElse(() => ok('recovered'))

    expect(result.unwrap()).toBe('recovered')
  })

  it('preserves Ok value through orElse chain', () => {
    const result = ok(42)
      .orElse(() => ok(0))
      .orElse(() => ok(99))

    expect(result.unwrap()).toBe(42)
  })
})

// ─── match() ──────────────────────────────────────────
describe('match()', () => {
  it('calls onOk for Ok result', () => {
    const result = ok(42).match(
      (v) => `value: ${v}`,
      () => 'error',
    )
    expect(result).toBe('value: 42')
  })

  it('calls onErr for Err result', () => {
    const result = err<string, string>('fail').match(
      () => 'ok',
      (e) => `error: ${e}`,
    )
    expect(result).toBe('error: fail')
  })

  it('passes value to onOk', () => {
    const result = ok({ x: 1, y: 2 }).match(
      (v) => v.x + v.y,
      () => 0,
    )
    expect(result).toBe(3)
  })

  it('passes error to onErr', () => {
    const result = err<number, number>(500).match(
      () => 'ok',
      (e) => e,
    )
    expect(result).toBe(500)
  })

  it('returns different types from handlers', () => {
    const okResult = ok(42).match(
      () => true,
      () => false,
    )
    expect(okResult).toBe(true)

    const errResult = err<string, string>('x').match(
      () => true,
      () => false,
    )
    expect(errResult).toBe(false)
  })

  it('handlers can return undefined', () => {
    const result = ok(42).match(
      () => undefined,
      () => undefined,
    )
    expect(result).toBeUndefined()
  })

  it('handlers can return objects', () => {
    const result = ok(42).match(
      (v) => ({ status: 'ok' as const, value: v }),
      (e) => ({ status: 'err' as const, error: e }),
    )
    expect(result).toEqual({ status: 'ok', value: 42 })
  })

  it('match with Error instance error', () => {
    const result = err(new Error('boom')).match(
      () => 'ok',
      (e) => e.message,
    )
    expect(result).toBe('boom')
  })
})

// ─── toJSON() ─────────────────────────────────────────
describe('toJSON()', () => {
  it('serializes Ok with ok:true and value', () => {
    const json = ok(42).toJSON()
    expect(json).toEqual({ ok: true, value: 42 })
  })

  it('serializes Ok with string value', () => {
    const json = ok('hello').toJSON()
    expect(json).toEqual({ ok: true, value: 'hello' })
  })

  it('serializes Ok with null value', () => {
    const json = ok(null).toJSON()
    expect(json).toEqual({ ok: true, value: null })
  })

  it('serializes Ok with undefined value', () => {
    const json = ok(undefined).toJSON()
    expect(json).toEqual({ ok: true, value: undefined })
  })

  it('serializes Ok with object value', () => {
    const json = ok({ a: 1 }).toJSON()
    expect(json).toEqual({ ok: true, value: { a: 1 } })
  })

  it('serializes Ok with array value', () => {
    const json = ok([1, 2, 3]).toJSON()
    expect(json).toEqual({ ok: true, value: [1, 2, 3] })
  })

  it('serializes Err with ok:false and error', () => {
    const json = err('fail').toJSON()
    expect(json).toEqual({ ok: false, error: 'fail' })
  })

  it('serializes Err with Error instance', () => {
    const json = err(new Error('boom')).toJSON()
    expect(json.ok).toBe(false)
    expect((json as { ok: false; error: Error }).error).toBeInstanceOf(Error)
  })

  it('serializes Err with number error', () => {
    const json = err(404).toJSON()
    expect(json).toEqual({ ok: false, error: 404 })
  })

  it('serializes Err with object error', () => {
    const json = err({ code: 'ENOENT' }).toJSON()
    expect(json).toEqual({ ok: false, error: { code: 'ENOENT' } })
  })

  it('works with JSON.stringify for Ok', () => {
    const str = JSON.stringify(ok(42).toJSON())
    expect(str).toBe('{"ok":true,"value":42}')
  })

  it('works with JSON.stringify for Err', () => {
    const str = JSON.stringify(err('fail').toJSON())
    expect(str).toBe('{"ok":false,"error":"fail"}')
  })

  it('discriminator ok is boolean true for Ok', () => {
    const json = ok(1).toJSON()
    expect(json.ok).toBe(true)
    expect(typeof json.ok).toBe('boolean')
  })

  it('discriminator ok is boolean false for Err', () => {
    const json = err('x').toJSON()
    expect(json.ok).toBe(false)
    expect(typeof json.ok).toBe('boolean')
  })
})

// ─── fromThrowable() ──────────────────────────────────
describe('fromThrowable()', () => {
  it('wraps successful return in Ok', () => {
    const result = fromThrowable(() => 42)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  it('wraps thrown string in Err', () => {
    const result = fromThrowable(() => {
      throw 'boom'
    })
    expect(result.isErr()).toBe(true)
  })

  it('wraps thrown Error instance in Err', () => {
    const result = fromThrowable(() => {
      throw new Error('boom')
    })
    expect(result.isErr()).toBe(true)
  })

  it('wraps thrown number in Err', () => {
    const result = fromThrowable(() => {
      throw 404
    })
    expect(result.isErr()).toBe(true)
  })

  it('wraps thrown object in Err', () => {
    const result = fromThrowable(() => {
      throw { code: 'FAIL' }
    })
    expect(result.isErr()).toBe(true)
  })

  it('wraps thrown null in Err', () => {
    const result = fromThrowable(() => {
      throw null
    })
    expect(result.isErr()).toBe(true)
  })

  it('wraps thrown undefined in Err', () => {
    const result = fromThrowable(() => {
      throw undefined
    })
    expect(result.isErr()).toBe(true)
  })

  it('returns undefined from successful void function', () => {
    const result = fromThrowable(() => {
      // no return
    })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBeUndefined()
  })

  it('preserves complex return type', () => {
    const result = fromThrowable(() => ({ name: 'test', items: [1, 2] }))
    expect(result.unwrap()).toEqual({ name: 'test', items: [1, 2] })
  })

  it('works with JSON.parse success', () => {
    const result = fromThrowable(() => JSON.parse('{"a":1}'))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toEqual({ a: 1 })
  })

  it('works with JSON.parse failure', () => {
    const result = fromThrowable(() => JSON.parse('invalid'))
    expect(result.isErr()).toBe(true)
  })

  it('preserves caught error value', () => {
    const result = fromThrowable(() => {
      throw 'custom error'
    })
    const output = result.match(
      () => 'ok',
      (e) => e,
    )
    expect(output).toBe('custom error')
  })
})

// ─── Immutability ──────────────────────────────────────
describe('immutability', () => {
  it('Ok result returns same value from multiple unwrap calls', () => {
    const r = ok({ x: 1 })
    const v1 = r.unwrap()
    const v2 = r.unwrap()
    expect(v1).toBe(v2)
  })

  it('toJSON returns consistent results', () => {
    const r = ok(42)
    const j1 = r.toJSON()
    const j2 = r.toJSON()
    expect(j1).toEqual(j2)
  })

  it('multiple match calls produce same result', () => {
    const r = ok(42)
    const m1 = r.match((v) => v, () => 0)
    const m2 = r.match((v) => v, () => 0)
    expect(m1).toBe(m2)
  })

  it('map does not mutate original Ok', () => {
    const original = ok(5)
    const mapped = original.map((n) => n * 2)
    expect(original.unwrap()).toBe(5)
    expect(mapped.unwrap()).toBe(10)
  })

  it('mapErr does not mutate original Ok', () => {
    const original = ok(5)
    original.mapErr((e) => `error: ${e}`)
    expect(original.unwrap()).toBe(5)
  })
})

// ─── Type safety and identity ──────────────────────────
describe('type safety and identity', () => {
  it('ok and err produce different instances', () => {
    const o = ok(1)
    const e = err('1')
    expect(o === e).toBe(false)
  })

  it('two ok calls produce different instances', () => {
    const o1 = ok(1)
    const o2 = ok(1)
    expect(o1).not.toBe(o2)
  })

  it('two err calls produce different instances', () => {
    const e1 = err('x')
    const e2 = err('x')
    expect(e1).not.toBe(e2)
  })

  it('Ok and Err are ResultClass instances', () => {
    expect(ok(1)).toBeInstanceOf(ResultClass)
    expect(err('x')).toBeInstanceOf(ResultClass)
  })
})

// ─── Complex chaining scenarios ────────────────────────
describe('complex chaining', () => {
  it('andThen + orElse recovery pipeline', () => {
    const safeDivide = (a: number, b: number): Result<number, string> =>
      b === 0 ? err('Division by zero') : ok(a / b)

    const result = safeDivide(10, 0)
      .andThen((v) => ok(v * 2))
      .orElse(() => ok(0))

    expect(result.unwrap()).toBe(0)
  })

  it('map + andThen pipeline', () => {
    const result = ok('42')
      .map((s) => Number(s))
      .andThen((n) => (n > 0 ? ok(n) : err('negative')))
      .map((n) => n * 2)

    expect(result.unwrap()).toBe(84)
  })

  it('mapErr + orElse error enrichment', () => {
    const result = err<number, string>('not found')
      .mapErr((msg) => `Error: ${msg}`)
      .orElse((enriched) => ok(`Recovered from: ${enriched}`))

    expect(result.unwrap()).toBe('Recovered from: Error: not found')
  })

  it('full pipeline with match at the end', () => {
    const result = ok('  hello  ')
      .map((s) => s.trim())
      .andThen((s) => (s.length > 0 ? ok(s) : err('empty')))
      .map((s) => s.toUpperCase())
      .match(
        (v) => `Success: ${v}`,
        (e) => `Failure: ${e}`,
      )

    expect(result).toBe('Success: HELLO')
  })

  it('pipeline fails at first Err and skips subsequent maps', () => {
    let mapCalled = false
    let andThenCalled = false

    const result = err<string, string>('early fail')
      .map(() => {
        mapCalled = true
        return 'mapped'
      })
      .andThen(() => {
        andThenCalled = true
        return ok('chained')
      })

    expect(mapCalled).toBe(false)
    expect(andThenCalled).toBe(false)
    expect(result.isErr()).toBe(true)
  })

  it('orElse recovery then map', () => {
    const result = err<number, string>('fail')
      .orElse(() => ok(10))
      .map((n) => n * 3)

    expect(result.unwrap()).toBe(30)
  })

  it('mapErr then orElse to new error type', () => {
    const result = err<string, string>('fail')
      .mapErr((e) => ({ message: e, code: 500 }))
      .orElse((e) => err<string, { message: string; code: number }>({ ...e, code: 200 }))

    expect(result.isErr()).toBe(true)
  })
})

// ─── Edge cases ────────────────────────────────────────
describe('edge cases', () => {
  it('Ok with NaN value', () => {
    const r = ok(NaN)
    expect(r.isOk()).toBe(true)
    expect(Number.isNaN(r.unwrap())).toBe(true)
  })

  it('Ok with Infinity value', () => {
    const r = ok(Infinity)
    expect(r.unwrap()).toBe(Infinity)
  })

  it('Ok with nested Result value', () => {
    const inner = ok(42)
    const outer = ok(inner)
    expect(outer.unwrap()).toBe(inner)
    expect(outer.unwrap().unwrap()).toBe(42)
  })

  it('Err with NaN error', () => {
    const r = err(NaN)
    expect(r.isErr()).toBe(true)
  })

  it('unwrapOr with Ok(0) returns 0 not default', () => {
    expect(ok(0).unwrapOr(99)).toBe(0)
  })

  it('unwrapOr with Ok(false) returns false not default', () => {
    expect(ok(false).unwrapOr(true)).toBe(false)
  })

  it('unwrapOr with Ok(empty string) returns "" not default', () => {
    expect(ok('').unwrapOr('default')).toBe('')
  })

  it('map over Ok(NaN)', () => {
    const result = ok(NaN).map((n) => n + 1)
    expect(Number.isNaN(result.unwrap())).toBe(true)
  })

  it('match can return function', () => {
    const fn = ok(42).match(
      (v) => () => v,
      () => () => 0,
    )
    expect(fn()).toBe(42)
  })

  it('fromThrowable with arrow function returning 0', () => {
    const result = fromThrowable(() => 0)
    expect(result.unwrap()).toBe(0)
  })

  it('multiple unwrapOr calls return same default', () => {
    const r = err<number, string>('fail')
    const def = { value: 42 }
    expect(r.unwrapOr(def as unknown as number)).toBe(def as unknown as number)
  })
})

// ─── Result type usage ────────────────────────────────
describe('Result type as return type', () => {
  function divide(a: number, b: number): Result<number, string> {
    return b === 0 ? err('Division by zero') : ok(a / b)
  }

  it('returns Ok for valid division', () => {
    expect(divide(10, 2).unwrap()).toBe(5)
  })

  it('returns Err for division by zero', () => {
    expect(divide(10, 0).isErr()).toBe(true)
  })

  it('can be used in match', () => {
    const msg = divide(10, 0).match(
      (v) => `Result: ${v}`,
      (e) => `Error: ${e}`,
    )
    expect(msg).toBe('Error: Division by zero')
  })

  it('can be chained with map', () => {
    const result = divide(20, 4).map((n) => n * 3)
    expect(result.unwrap()).toBe(15)
  })

  it('can be chained with andThen', () => {
    const result = divide(20, 4).andThen((n) =>
      n > 0 ? ok(n) : err('negative'),
    )
    expect(result.unwrap()).toBe(5)
  })

  it('can be recovered with orElse', () => {
    const result = divide(10, 0).orElse(() => ok(0))
    expect(result.unwrap()).toBe(0)
  })

  it('can be serialized', () => {
    expect(divide(10, 2).toJSON()).toEqual({ ok: true, value: 5 })
    expect(divide(10, 0).toJSON()).toEqual({ ok: false, error: 'Division by zero' })
  })
})

// ─── Ok and Err type aliases ──────────────────────────
describe('Ok and Err type aliases', () => {
  it('Ok type can be used as return type', () => {
    const createOk = (): Ok<number> => ok(42)
    const r = createOk()
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(42)
  })

  it('Err type can be used as return type', () => {
    const createErr = (): Err<string> => err('fail')
    const r = createErr()
    expect(r.isErr()).toBe(true)
  })
})

// ─── unwrapOrElse lazy vs unwrapOr eager ──────────────
describe('unwrapOrElse laziness', () => {
  it('unwrapOrElse does not call fn for Ok', () => {
    let called = false
    const result = ok(42).unwrapOrElse(() => {
      called = true
      return 0
    })
    expect(result).toBe(42)
    expect(called).toBe(false)
  })

  it('unwrapOrElse calls fn exactly once for Err', () => {
    let callCount = 0
    const result = err<string, string>('fail').unwrapOrElse((e) => {
      callCount++
      return `recovered: ${e}`
    })
    expect(result).toBe('recovered: fail')
    expect(callCount).toBe(1)
  })
})

// ─── andThen / orElse type transitions ────────────────
describe('type transitions in chaining', () => {
  it('andThen can change Ok value type from number to string', () => {
    const result = ok(42).andThen((n) => ok(String(n)))
    expect(result.unwrap()).toBe('42')
  })

  it('andThen can change Ok value type from string to boolean', () => {
    const result = ok('hello').andThen((s) => ok(s.length > 3))
    expect(result.unwrap()).toBe(true)
  })

  it('orElse can change error type', () => {
    const result = err<string, number>(404)
      .orElse((e) => err<string, string>(`HTTP ${e}`))
    expect(result.isErr()).toBe(true)
  })

  it('map can change Ok type while preserving Err type', () => {
    const okResult = ok<number, string>(5).map((n) => `num: ${n}`)
    expect(okResult.unwrap()).toBe('num: 5')

    const errResult = err<number, string>('fail').map((n) => `num: ${n}`)
    expect(errResult.isErr()).toBe(true)
  })
})
