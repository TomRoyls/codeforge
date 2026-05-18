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

// ─── andThen ──────────────────────────────────────────────
describe('Result - andThen', () => {
  it('chains ok values', () => {
    const r = ok(5).andThen((n) => ok(n * 2))
    expect(r.unwrap()).toBe(10)
  })

  it('short-circuits on err', () => {
    const r: Result<number, string> = err('fail').andThen((n: number) => ok(n * 2))
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

// ─── match ────────────────────────────────────────────────
describe('Result - match', () => {
  it('invokes ok handler', () => {
    expect(ok(42).match((v) => `ok:${v}`, (e) => `err:${e}`)).toBe('ok:42')
  })

  it('invokes err handler', () => {
    expect(err('fail').match((v) => `ok:${v}`, (e) => `err:${e}`)).toBe('err:fail')
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
})
