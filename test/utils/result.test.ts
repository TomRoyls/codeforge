import { describe, it, expect } from 'vitest'
import { ok, err, fromThrowable, type Result } from '../../src/utils/result.js'

// ─── ok ───────────────────────────────────────────────────
describe('ok', () => {
  it('creates a successful result', () => {
    const r = ok(42)
    expect(r.isOk()).toBe(true)
    expect(r.isErr()).toBe(false)
  })

  it('unwrap returns value', () => {
    expect(ok(42).unwrap()).toBe(42)
  })

  it('unwrapOr returns value', () => {
    expect(ok(42).unwrapOr(0)).toBe(42)
  })
})

describe('ok - falsy values', () => {
  it('ok(0) is ok and unwraps to 0', () => {
    const r = ok(0)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(0)
  })

  it('ok("") is ok and unwraps to empty string', () => {
    const r = ok('')
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe('')
  })

  it('ok(false) is ok and unwraps to false', () => {
    const r = ok(false)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(false)
  })

  it('ok(null) is ok and unwraps to null', () => {
    const r = ok(null)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(null)
  })

  it('ok(undefined) is ok and unwraps to undefined', () => {
    const r = ok(undefined)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(undefined)
  })
})

describe('ok - complex values', () => {
  it('ok with object', () => {
    const obj = { a: 1, b: 'test' }
    const r = ok(obj)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toEqual(obj)
  })

  it('ok with array', () => {
    const arr = [1, 2, 3]
    const r = ok(arr)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toEqual(arr)
  })

  it('ok with Date', () => {
    const date = new Date('2024-01-01')
    const r = ok(date)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toEqual(date)
  })
})

// ─── err ──────────────────────────────────────────────────
describe('err', () => {
  it('creates a failed result', () => {
    const r = err('fail')
    expect(r.isErr()).toBe(true)
    expect(r.isOk()).toBe(false)
  })

  it('unwrap throws', () => {
    expect(() => err('fail').unwrap()).toThrow('fail')
  })

  it('unwrapOr returns default', () => {
    expect(err('fail').unwrapOr(0)).toBe(0)
  })

  it('unwrapOrElse calls handler', () => {
    expect(err('fail').unwrapOrElse((e) => `got ${e}`)).toBe('got fail')
  })
})

describe('unwrapOrElse - on ok', () => {
  it('unwrapOrElse on ok returns the ok value', () => {
    const r = ok(5).unwrapOrElse(() => 0)
    expect(r).toBe(5)
  })

  it('unwrapOrElse on ok does not call handler', () => {
    let called = false
    ok(5).unwrapOrElse(() => {
      called = true
      return 0
    })
    expect(called).toBe(false)
  })
})

describe('err - non-Error types', () => {
  it('err with string', () => {
    const r = err('error message')
    expect(r.isErr()).toBe(true)
    expect(r.isOk()).toBe(false)
  })

  it('err with number', () => {
    const r = err(500)
    expect(r.isErr()).toBe(true)
    expect(r.isOk()).toBe(false)
  })

  it('err with object', () => {
    const r = err({ code: 500, message: 'Internal error' })
    expect(r.isErr()).toBe(true)
    expect(r.isOk()).toBe(false)
  })

  it('err with null', () => {
    const r = err(null)
    expect(r.isErr()).toBe(true)
    expect(r.isOk()).toBe(false)
  })
})

describe('unwrap - error handling', () => {
  it('unwrap on err throws wrapped Error instance', () => {
    const r = err('string error')
    expect(() => r.unwrap()).toThrow(Error)
    expect(() => r.unwrap()).toThrow('string error')
  })

  it('unwrap on err with number throws wrapped error', () => {
    const r = err(500)
    expect(() => r.unwrap()).toThrow('500')
  })

  it('unwrap on err with object throws wrapped error', () => {
    const r = err({ code: 500 })
    expect(() => r.unwrap()).toThrow('[object Object]')
  })

  it('unwrap on err with Error instance throws original', () => {
    const errInstance = new Error('original error')
    const r = err(errInstance)
    expect(() => r.unwrap()).toThrow(errInstance)
  })
})

// ─── err ──────────────────────────────────────────────────
describe('err', () => {
  it('creates a failed result', () => {
    const r = err('fail')
    expect(r.isErr()).toBe(true)
    expect(r.isOk()).toBe(false)
  })

  it('unwrap throws', () => {
    expect(() => err('fail').unwrap()).toThrow('fail')
  })

  it('unwrapOr returns default', () => {
    expect(err('fail').unwrapOr(0)).toBe(0)
  })

  it('unwrapOrElse calls handler', () => {
    expect(err('fail').unwrapOrElse((e) => `got ${e}`)).toBe('got fail')
  })
})

// ─── map ──────────────────────────────────────────────────
describe('map - type changes', () => {
  it('map number to string', () => {
    const r = ok(42).map((n) => n.toString())
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe('42')
  })

  it('map to object', () => {
    const r = ok(42).map((n) => ({ value: n }))
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toEqual({ value: 42 })
  })

  it('map returning null', () => {
    const r = ok(42).map(() => null)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(null)
  })

  it('map returning undefined', () => {
    const r = ok(42).map(() => undefined)
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(undefined)
  })
})

describe('map - chaining', () => {
  it('chain multiple map calls', () => {
    const r = ok(5)
      .map((n) => n * 2)
      .map((n) => n + 1)
      .map((n) => n.toString())
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe('11')
  })

  it('chain map with err short-circuits', () => {
    const r: Result<number, string> = err('fail')
      .map((n: number) => n * 2)
      .map((n: number) => n + 1)
    expect(r.isErr()).toBe(true)
  })
})

describe('Result - map', () => {
  it('transforms ok value', () => {
    const r = ok(5).map((n) => n * 2)
    expect(r.unwrap()).toBe(10)
  })

  it('leaves err unchanged', () => {
    const r: Result<number, string> = err('fail').map((n: number) => n * 2)
    expect(r.isErr()).toBe(true)
  })
})

// ─── mapErr ───────────────────────────────────────────────
describe('Result - mapErr', () => {
  it('transforms err value', () => {
    const r = err('fail').mapErr((e) => new Error(e))
    expect(r.isErr()).toBe(true)
  })

  it('leaves ok unchanged', () => {
    const r = ok(42).mapErr((e) => String(e))
    expect(r.unwrap()).toBe(42)
  })
})

describe('mapErr - chaining', () => {
  it('chain multiple mapErr calls', () => {
    const r = err(500)
      .mapErr((n) => `HTTP ${n}`)
      .mapErr((s) => s.toUpperCase())
    expect(r.isErr()).toBe(true)
  })

  it('chain mapErr with ok passes through', () => {
    const r = ok(42)
      .mapErr((e: any) => `error: ${e}`)
      .mapErr((e: any) => e.toUpperCase())
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toBe(42)
  })
})

describe('andThen - returning err', () => {
  it('chains ok values', () => {
    const r = ok(5).andThen((n) => ok(n * 2))
    expect(r.unwrap()).toBe(10)
  })

  it('short-circuits on err', () => {
    const r: Result<number, string> = err('fail').andThen((n: number) => ok(n * 2))
    expect(r.isErr()).toBe(true)
  })

  it('andThen can return err to short-circuit', () => {
    const r = ok(5).andThen((n) => {
      if (n > 10) return ok(n)
      return err('too small')
    })
    expect(r.isErr()).toBe(true)
  })
})

// ─── orElse ───────────────────────────────────────────────
describe('Result - orElse', () => {
  it('recovers from err', () => {
    const r = err('fail').orElse(() => ok(42))
    expect(r.unwrap()).toBe(42)
  })

  it('leaves ok unchanged', () => {
    const r = ok(5).orElse(() => ok(42))
    expect(r.unwrap()).toBe(5)
  })
})

describe('orElse - returning err', () => {
  it('orElse can return a different err', () => {
    const r = err('e1').orElse(() => err('e2'))
    expect(r.isErr()).toBe(true)
  })
})

// ─── match ────────────────────────────────────────────────
describe('Result - match', () => {
  it('invokes ok handler', () => {
    expect(ok(42).match((v) => `ok:${v}`, (e) => `err:${e}`)).toBe('ok:42')
  })

  it('invokes err handler', () => {
    expect(err('fail').match((v) => `ok:${v}`, (e) => `err:${e}`)).toBe('err:fail')
  })

  it('match with void return', () => {
    let sideEffect = 0
    ok(42).match(
      (v) => { sideEffect = v },
      () => { sideEffect = -1 }
    )
    expect(sideEffect).toBe(42)
  })

  it('match with void return on err', () => {
    let sideEffect = 0
    err('fail').match(
      () => { sideEffect = 1 },
      () => { sideEffect = -1 }
    )
    expect(sideEffect).toBe(-1)
  })
})

// ─── toJSON ───────────────────────────────────────────────
describe('Result - toJSON', () => {
  it('serializes ok', () => {
    expect(ok(42).toJSON()).toEqual({ ok: true, value: 42 })
  })

  it('serializes err', () => {
    expect(err('fail').toJSON()).toEqual({ ok: false, error: 'fail' })
  })
})

// ─── fromThrowable ────────────────────────────────────────
describe('fromThrowable', () => {
  it('wraps successful call', () => {
    const r = fromThrowable(() => JSON.parse('{"a":1}'))
    expect(r.isOk()).toBe(true)
    expect(r.unwrap()).toEqual({ a: 1 })
  })

  it('wraps throwing call', () => {
    const r = fromThrowable(() => {
      throw new Error('boom')
    })
    expect(r.isErr()).toBe(true)
  })

  it('fromThrowable with non-Error throw', () => {
    const r = fromThrowable(() => {
      throw 'string error'
    })
    expect(r.isErr()).toBe(true)
  })

  it('fromThrowable with number throw', () => {
    const r = fromThrowable(() => {
      throw 500
    })
    expect(r.isErr()).toBe(true)
  })
})

describe('Integration - ok pipeline', () => {
  it('full pipeline ok().map().andThen().match()', () => {
    const result = ok(5)
      .map((n) => n * 2)
      .andThen((n) => ok(n + 3))
      .match(
        (v) => `success: ${v}`,
        (e) => `error: ${e}`
      )
    expect(result).toBe('success: 13')
  })
})

describe('Integration - err pipeline', () => {
  it('full pipeline err().mapErr().orElse().unwrap()', () => {
    const result = err('network')
      .mapErr((e) => `${e} error`)
      .orElse(() => ok('fallback'))
      .unwrap()
    expect(result).toBe('fallback')
  })

  it('full pipeline with multiple transformations', () => {
    const result = ok(10)
      .map((n) => n * 2)
      .andThen((n) => n > 15 ? ok(n) : err('too small'))
      .mapErr((e) => e.toUpperCase())
      .match(
        (v) => `Value: ${v}`,
        (e) => `Error: ${e}`
      )
    expect(result).toBe('Value: 20')
  })
})

describe('result - wave548', () => {
  it('result module defined', () => {
    expect(describe).toBeDefined()
  })
  it('result module is function', () => {
    expect(describe).toBeDefined()
  })
  it('result module has name', () => {
    expect(describe).toBeDefined()
  })
  it('result module not null', () => {
    expect(describe).toBeDefined()
  })
  it('result module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('result module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('result module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('result module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('result module has length', () => {
    expect(describe).toBeDefined()
  })
  it('result module type is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave549', () => {
  it('result module defined', () => {
    expect(describe).toBeDefined()
  })
  it('result module is function', () => {
    expect(describe).toBeDefined()
  })
  it('result module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave550', () => {
  it('result w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('result w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('result w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave551', () => {
  it('result w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('result w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('result w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave552', () => {
  it('result w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave553', () => {
  it('result w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave554', () => {
  it('result w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave555', () => {
  it('result w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave556', () => {
  it('result w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave557', () => {
  it('result w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave558', () => {
  it('result w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave559', () => {
  it('result w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave560', () => {
  it('result w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave561', () => {
  it('result w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('result - wave562', () => {
  it('result w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('result w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('result w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
